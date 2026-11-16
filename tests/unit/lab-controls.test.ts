import { describe, it, expect } from "vitest";
import { getScenario, resolveEffectiveScenario } from "../../src/features/01-pipeline-explorer/scenarios";
import { PipelineEngine } from "../../src/features/01-pipeline-explorer/engine";

describe("Live Lab Controls & Dynamic Scenario Interception", () => {
  it("should keep base scenario unchanged when no overrides are passed", () => {
    const base = getScenario("order_create");
    const effective = resolveEffectiveScenario(base);
    expect(effective.haltNode).toBe(5);
    expect(effective.code).toBe("201");
    expect(effective.resultStatus).toBe("HALTED_SUCCESS");
  });

  it("should intercept Happy Path at Gateway (Node 3) with 429 when Rate Limiter is OFF (Burst)", () => {
    const base = getScenario("order_create");
    const effective = resolveEffectiveScenario(base, { rateLimiter: false });
    expect(effective.haltNode).toBe(3);
    expect(effective.code).toBe("429");
    expect(effective.resultStatus).toBe("HALTED_ERROR");
    expect(effective.stages[3].wireData.gateway?.routingRule).toBe("DROP_RATE_LIMIT_EXCEEDED");
    expect(effective.stages[3].wireData.response?.statusCode).toBe(429);
    expect(effective.stages[4].description).toContain("UNREACHED");
  });

  it("should allow token_bucket_empty scenario to proceed when Rate Limiter is turned ON", () => {
    const base = getScenario("token_bucket_empty");
    const effective = resolveEffectiveScenario(base, { rateLimiter: true });
    expect(effective.haltNode).toBe(5);
    expect(effective.code).toBe("201");
    expect(effective.resultStatus).toBe("HALTED_SUCCESS");
    expect(effective.stages[3].title).toContain("Rate Limiter: ON");
  });

  it("should intercept Happy Path at Backend (Node 4) with 403 when User Role is Viewer", () => {
    const base = getScenario("order_create");
    const effective = resolveEffectiveScenario(base, { userRole: "viewer" });
    expect(effective.haltNode).toBe(4);
    expect(effective.code).toBe("403");
    expect(effective.resultStatus).toBe("HALTED_ERROR");
    expect(effective.stages[4].wireData.response?.statusCode).toBe(403);
    expect(effective.stages[5].description).toContain("UNREACHED");
  });

  it("should allow rbac_restriction scenario to pass when User Role is upgraded to Admin", () => {
    const base = getScenario("rbac_restriction");
    const effective = resolveEffectiveScenario(base, { userRole: "admin" });
    expect(effective.haltNode).toBe(5);
    expect(effective.code).toBe("201");
    expect(effective.resultStatus).toBe("HALTED_SUCCESS");
    expect(effective.stages[4].wireData.backend?.userRole).toBe("admin");
  });

  it("should trigger 409 CAS conflict at Database (Node 5) when Concurrency is set to CAS", () => {
    const base = getScenario("order_create");
    const effective = resolveEffectiveScenario(base, { concurrency: "cas" });
    expect(effective.haltNode).toBe(5);
    expect(effective.code).toBe("409");
    expect(effective.resultStatus).toBe("HALTED_ERROR");
    expect(effective.stages[5].wireData.response?.statusCode).toBe(409);
  });

  it("should dynamically reconfigure PipelineEngine when setLabOverrides is called", () => {
    const engine = new PipelineEngine({ scenarioId: "order_create" });
    expect(engine.getState().haltNode).toBe(5);
    expect(engine.getState().status).toBe("READY");

    // Dynamically toggle Rate Limiter OFF (Burst 429)
    engine.setLabOverrides({ rateLimiter: false });
    expect(engine.getState().haltNode).toBe(3);
    expect(engine.getScenario().code).toBe("429");

    // Step forward until complete
    while (!engine.getState().isCompleted) {
      engine.stepForward();
    }
    expect(engine.getState().status).toBe("HALTED_ERROR");

    // Dynamically reset back to ON
    engine.setLabOverrides({ rateLimiter: true });
    expect(engine.getState().haltNode).toBe(5);
    expect(engine.getScenario().code).toBe("201");
  });
});

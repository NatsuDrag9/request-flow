import { describe, it, expect } from "vitest";
import { SCENARIOS, getScenario, getAllScenarios, type ScenarioDefinition } from "../../src/features/01-pipeline-explorer/scenarios";

describe("Scenarios Specification & Data Contract", () => {
  it("should define all 8 comprehensive scenarios", () => {
    const scenarios = getAllScenarios();
    expect(scenarios.length).toBe(8);

    const ids = scenarios.map((s: ScenarioDefinition) => s.id);
    expect(ids).toContain("order_create");
    expect(ids).toContain("auth_token_expired");
    expect(ids).toContain("rbac_restriction");
    expect(ids).toContain("token_bucket_empty");
    expect(ids).toContain("db_pool_timeout");
    expect(ids).toContain("query_degraded");
    expect(ids).toContain("idempotency_cache");
    expect(ids).toContain("optimistic_lock_cas");
  });

  it("should have mandatory description field and 6 stages on all scenarios", () => {
    const scenarios = getAllScenarios();
    for (const scenario of scenarios) {
      expect(scenario.description).toBeDefined();
      expect(scenario.description.length).toBeGreaterThan(20);
      expect(scenario.summary).toBeDefined();
      expect(scenario.name).toBeDefined();
      expect(scenario.category).toMatch(/auth|perimeter|database/);

      // Verify 6 nodes
      expect(Object.keys(scenario.stages).length).toBe(6);
      for (let i = 0; i < 6; i++) {
        const stage = scenario.stages[i];
        expect(stage).toBeDefined();
        expect(stage.nodeId).toBeTypeOf("string");
        expect(stage.title).toBeTypeOf("string");
        expect(stage.description).toBeTypeOf("string");
        expect(stage.wireData).toBeDefined();
      }
    }
  });

  it("should support backward-compatible alias keys in getScenario()", () => {
    expect(getScenario("201-created").id).toBe("order_create");
    expect(getScenario("401-unauthorized").id).toBe("auth_token_expired");
    expect(getScenario("504-timeout").id).toBe("db_pool_timeout");
    expect(getScenario("403-forbidden").id).toBe("rbac_restriction");
    expect(getScenario("429-ratelimit").id).toBe("token_bucket_empty");
    expect(getScenario("slow-query").id).toBe("query_degraded");
    expect(getScenario("idempotency-replay").id).toBe("idempotency_cache");
    expect(getScenario("409-conflict").id).toBe("optimistic_lock_cas");
  });

  it("should have valid halt nodes and statuses per specification", () => {
    // Node 5 (Database) halt
    expect(getScenario("order_create").haltNode).toBe(5);
    expect(getScenario("order_create").resultStatus).toBe("HALTED_SUCCESS");

    // Node 4 (Backend Controller) halt
    expect(getScenario("auth_token_expired").haltNode).toBe(4);
    expect(getScenario("auth_token_expired").resultStatus).toBe("HALTED_ERROR");

    expect(getScenario("rbac_restriction").haltNode).toBe(4);
    expect(getScenario("rbac_restriction").resultStatus).toBe("HALTED_ERROR");

    // Node 3 (API Gateway) halt
    expect(getScenario("token_bucket_empty").haltNode).toBe(3);
    expect(getScenario("token_bucket_empty").resultStatus).toBe("HALTED_ERROR");

    expect(getScenario("idempotency_cache").haltNode).toBe(3);
    expect(getScenario("idempotency_cache").resultStatus).toBe("HALTED_SUCCESS");

    // Node 5 (Database) error / degraded
    expect(getScenario("db_pool_timeout").haltNode).toBe(5);
    expect(getScenario("db_pool_timeout").resultStatus).toBe("HALTED_ERROR");

    expect(getScenario("query_degraded").haltNode).toBe(5);
    expect(getScenario("query_degraded").resultStatus).toBe("HALTED_SUCCESS");

    expect(getScenario("optimistic_lock_cas").haltNode).toBe(5);
    expect(getScenario("optimistic_lock_cas").resultStatus).toBe("HALTED_ERROR");
  });

  it("should throw an informative error when requesting an unknown scenario id", () => {
    expect(() => getScenario("unknown-scenario")).toThrowError(/Unknown scenario/i);
  });
});

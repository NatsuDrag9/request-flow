import { describe, it, expect, vi } from "vitest";
import { PipelineEngine, type EngineState } from "../../src/features/01-pipeline-explorer/engine";

describe("Pipeline Lifecycle FSM Engine (6-Node Architecture)", () => {
  it("should initialize in READY state at node 0 in DOWNSTREAM direction", () => {
    const engine = new PipelineEngine({ scenarioId: "order_create" });
    const state = engine.getState();

    expect(state.status).toBe("READY");
    expect(state.currentNode).toBe(0);
    expect(state.direction).toBe("DOWNSTREAM");
    expect(state.scenarioId).toBe("order_create");
    expect(state.haltNode).toBe(5);
  });

  it("should transition to STEPPING and advance to node 1 on stepForward", () => {
    const engine = new PipelineEngine({ scenarioId: "order_create" });
    engine.stepForward();

    const state = engine.getState();
    expect(state.status).toBe("STEPPING");
    expect(state.currentNode).toBe(1);
    expect(state.direction).toBe("DOWNSTREAM");
  });

  it("should traverse downstream across all 6 nodes to database (node 5) and reverse upstream on order_create", () => {
    const engine = new PipelineEngine({ scenarioId: "order_create" });

    // Step 0 -> 1 -> 2 -> 3 -> 4 -> 5 (Downstream)
    engine.stepForward(); // node 1 (dns_tls)
    engine.stepForward(); // node 2 (lb)
    engine.stepForward(); // node 3 (gateway)
    engine.stepForward(); // node 4 (backend)
    engine.stepForward(); // node 5 (database - halt node)

    expect(engine.getState().currentNode).toBe(5);
    expect(engine.getState().direction).toBe("DOWNSTREAM");

    // Next stepForward at halt node turns direction to UPSTREAM
    engine.stepForward();
    expect(engine.getState().currentNode).toBe(4);
    expect(engine.getState().direction).toBe("UPSTREAM");

    // Retreat back 4 -> 3 -> 2 -> 1 -> 0
    engine.stepForward(); // node 3
    engine.stepForward(); // node 2
    engine.stepForward(); // node 1
    engine.stepForward(); // node 0

    const finalState = engine.getState();
    expect(finalState.currentNode).toBe(0);
    expect(finalState.status).toBe("HALTED_SUCCESS");
  });

  it("should halt at node 4 (backend auth) and return 401 Unauthorized early without reaching node 5", () => {
    const engine = new PipelineEngine({ scenarioId: "auth_token_expired" });

    // Step downstream 0 -> 1 -> 2 -> 3 -> 4
    engine.stepForward(); // node 1 (dns_tls)
    engine.stepForward(); // node 2 (lb)
    engine.stepForward(); // node 3 (gateway)
    engine.stepForward(); // node 4 (backend - halt node)

    expect(engine.getState().currentNode).toBe(4);

    // Next step must turn UPSTREAM from node 4 directly without touching node 5 (Database)
    engine.stepForward();
    expect(engine.getState().currentNode).toBe(3);
    expect(engine.getState().direction).toBe("UPSTREAM");

    engine.stepForward(); // node 2
    engine.stepForward(); // node 1
    engine.stepForward(); // node 0 (Client receives 401)

    const finalState = engine.getState();
    expect(finalState.currentNode).toBe(0);
    expect(finalState.status).toBe("HALTED_ERROR");
  });

  it("should halt at node 3 (gateway) for rate limiting without touching backend or database", () => {
    const engine = new PipelineEngine({ scenarioId: "token_bucket_empty" });

    engine.stepForward(); // node 1
    engine.stepForward(); // node 2
    engine.stepForward(); // node 3 (gateway - halt node)

    expect(engine.getState().currentNode).toBe(3);

    engine.stepForward();
    expect(engine.getState().currentNode).toBe(2);
    expect(engine.getState().direction).toBe("UPSTREAM");

    engine.stepForward(); // node 1
    engine.stepForward(); // node 0

    const finalState = engine.getState();
    expect(finalState.currentNode).toBe(0);
    expect(finalState.status).toBe("HALTED_ERROR");
  });

  it("should allow stepBackward to reverse a previous step", () => {
    const engine = new PipelineEngine({ scenarioId: "order_create" });
    engine.stepForward(); // node 1
    engine.stepForward(); // node 2

    expect(engine.getState().currentNode).toBe(2);

    engine.stepBackward();
    expect(engine.getState().currentNode).toBe(1);

    engine.stepBackward();
    expect(engine.getState().currentNode).toBe(0);
    expect(engine.getState().status).toBe("READY");
  });

  it("should reset to initial READY state cleanly", () => {
    const engine = new PipelineEngine({ scenarioId: "order_create" });
    engine.stepForward();
    engine.stepForward();

    engine.reset();
    const state = engine.getState();
    expect(state.status).toBe("READY");
    expect(state.currentNode).toBe(0);
    expect(state.direction).toBe("DOWNSTREAM");
  });
});

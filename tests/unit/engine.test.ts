import { describe, it, expect, vi } from "vitest";
import { PipelineEngine, type EngineState } from "../../src/features/01-pipeline-explorer/engine";

describe("Pipeline Lifecycle FSM Engine", () => {
  it("should initialize in READY state at node 0 in DOWNSTREAM direction", () => {
    const engine = new PipelineEngine({ scenarioId: "201-created" });
    const state = engine.getState();

    expect(state.status).toBe("READY");
    expect(state.currentNode).toBe(0);
    expect(state.direction).toBe("DOWNSTREAM");
    expect(state.scenarioId).toBe("201-created");
  });

  it("should transition to STEPPING and advance to node 1 on stepForward", () => {
    const engine = new PipelineEngine({ scenarioId: "201-created" });
    engine.stepForward();

    const state = engine.getState();
    expect(state.status).toBe("STEPPING");
    expect(state.currentNode).toBe(1);
    expect(state.direction).toBe("DOWNSTREAM");
  });

  it("should traverse downstream to database (node 4) and reverse upstream on 201-created", () => {
    const engine = new PipelineEngine({ scenarioId: "201-created" });

    // Step 0 -> 1 -> 2 -> 3 -> 4 (Downstream)
    engine.stepForward(); // node 1
    engine.stepForward(); // node 2
    engine.stepForward(); // node 3
    engine.stepForward(); // node 4 (halt node)

    expect(engine.getState().currentNode).toBe(4);
    expect(engine.getState().direction).toBe("DOWNSTREAM");

    // Next stepForward at halt node turns direction to UPSTREAM
    engine.stepForward();
    expect(engine.getState().currentNode).toBe(3);
    expect(engine.getState().direction).toBe("UPSTREAM");

    // Retreat back 3 -> 2 -> 1 -> 0
    engine.stepForward(); // node 2
    engine.stepForward(); // node 1
    engine.stepForward(); // node 0

    const finalState = engine.getState();
    expect(finalState.currentNode).toBe(0);
    expect(finalState.status).toBe("HALTED_SUCCESS");
  });

  it("should halt at node 3 (backend auth) and return 401 Unauthorized early", () => {
    const engine = new PipelineEngine({ scenarioId: "401-unauthorized" });

    // Step downstream 0 -> 1 -> 2 -> 3
    engine.stepForward(); // node 1
    engine.stepForward(); // node 2
    engine.stepForward(); // node 3 (halt node for 401)

    expect(engine.getState().currentNode).toBe(3);

    // Next step must turn UPSTREAM from node 3 directly without touching node 4 (Database)
    engine.stepForward();
    expect(engine.getState().currentNode).toBe(2);
    expect(engine.getState().direction).toBe("UPSTREAM");

    engine.stepForward(); // node 1
    engine.stepForward(); // node 0 (Client receives 401)

    const finalState = engine.getState();
    expect(finalState.currentNode).toBe(0);
    expect(finalState.status).toBe("HALTED_ERROR");
  });

  it("should allow stepBackward to reverse a previous step", () => {
    const engine = new PipelineEngine({ scenarioId: "201-created" });
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
    const engine = new PipelineEngine({ scenarioId: "201-created" });
    engine.stepForward();
    engine.stepForward();

    engine.reset();
    const state = engine.getState();
    expect(state.status).toBe("READY");
    expect(state.currentNode).toBe(0);
    expect(state.direction).toBe("DOWNSTREAM");
  });

  it("should notify stateChange subscribers on every step", () => {
    const engine = new PipelineEngine({ scenarioId: "201-created" });
    const listener = vi.fn();
    engine.on("stateChange", listener);

    engine.stepForward();
    expect(listener).toHaveBeenCalledTimes(1);

    engine.stepForward();
    expect(listener).toHaveBeenCalledTimes(2);

    engine.off("stateChange", listener);
    engine.stepForward();
    expect(listener).toHaveBeenCalledTimes(2); // no more calls after unsubscribe
  });

  it("should notify complete subscriber when round-trip finishes", () => {
    const engine = new PipelineEngine({ scenarioId: "401-unauthorized" });
    const onComplete = vi.fn();
    engine.on("complete", onComplete);

    // Run to completion
    for (let i = 0; i < 10; i++) {
      engine.stepForward();
      if (engine.getState().status.startsWith("HALTED")) break;
    }

    expect(engine.getState().status).toBe("HALTED_ERROR");
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

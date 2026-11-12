import { describe, it, expect, beforeEach } from "vitest";
import { PipelineEngine } from "../../src/features/01-pipeline-explorer/engine";
import { buildInspectorDetails } from "../../src/features/02-stage-inspector/inspector";
import { StorageEngine, type StorageBackend } from "../../src/features/03-state-persistence/storage";

class InMemoryStorage implements StorageBackend {
  private data: Map<string, string> = new Map();
  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
  removeItem(key: string): void {
    this.data.delete(key);
  }
}

describe("Integration: Pipeline Simulation, Inspector & State Persistence", () => {
  let storage: StorageEngine;
  let backend: InMemoryStorage;

  beforeEach(() => {
    backend = new InMemoryStorage();
    storage = new StorageEngine(backend);
  });

  it("should run full 201 Created pipeline, inspect all nodes, and persist telemetry", () => {
    const engine = new PipelineEngine({ scenarioId: "201-created" });
    const scenario = engine.getScenario();

    expect(engine.getState().status).toBe("READY");

    // Traverse all nodes downstream to database (Node 4) and upstream back to client (Node 0)
    const visitedNodes: number[] = [];
    while (!engine.getState().isCompleted) {
      const state = engine.getState();
      visitedNodes.push(state.currentNode);

      // Inspect the current node
      const inspector = buildInspectorDetails(scenario, state.currentNode, state.direction);
      expect(inspector.formattedWireText.length).toBeGreaterThan(20);
      storage.recordInspection(state.currentNode);

      engine.stepForward();
    }

    const finalState = engine.getState();
    expect(finalState.isCompleted).toBe(true);
    expect(finalState.status).toBe("HALTED_SUCCESS");
    expect(finalState.currentNode).toBe(0);

    // Record completed run into storage
    storage.recordRun(scenario.id);

    // Verify storage persistence
    const savedState = storage.load();
    expect(savedState.totalRuns).toBe(1);
    expect(savedState.scenarioRuns["201-created"]).toBe(1);
    expect(savedState.inspectedNodeHistory).toEqual([0, 1, 2, 3, 4]);
    expect(savedState.lastRunTime).not.toBeNull();
  });

  it("should run 401 Unauthorized scenario, halt at Node 3, and record error run", () => {
    const engine = new PipelineEngine({ scenarioId: "401-unauthorized" });
    const scenario = engine.getScenario();

    while (!engine.getState().isCompleted) {
      engine.stepForward();
    }

    const finalState = engine.getState();
    expect(finalState.status).toBe("HALTED_ERROR");
    expect(finalState.isCompleted).toBe(true);

    // Check inspection at halt node (Node 3: Backend)
    const inspector = buildInspectorDetails(scenario, 3, "UPSTREAM");
    expect(inspector.formattedWireText).toContain("AUTH_STATUS: REJECTED");

    storage.recordRun(scenario.id);
    const savedState = storage.load();
    expect(savedState.totalRuns).toBe(1);
    expect(savedState.scenarioRuns["401-unauthorized"]).toBe(1);
    expect(savedState.scenarioRuns["201-created"]).toBe(0);
  });
});

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

describe("Integration: 6-Node Pipeline Simulation, Wire Inspector & State Persistence", () => {
  let storage: StorageEngine;
  let backend: InMemoryStorage;

  beforeEach(() => {
    backend = new InMemoryStorage();
    storage = new StorageEngine(backend);
  });

  it("should run full order_create pipeline across all 6 nodes, inspect stages, and persist telemetry", () => {
    const engine = new PipelineEngine({ scenarioId: "order_create" });
    const scenario = engine.getScenario();

    expect(engine.getState().status).toBe("READY");

    // Traverse all nodes downstream to database (Node 5) and upstream back to client (Node 0)
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
    expect(savedState.scenarioRuns["order_create"]).toBe(1);
    expect(savedState.inspectedNodeHistory).toEqual([0, 1, 2, 3, 4, 5]);
    expect(savedState.lastRunTime).not.toBeNull();
  });

  it("should run auth_token_expired scenario, halt at Node 4 (Backend), and record error run", () => {
    const engine = new PipelineEngine({ scenarioId: "auth_token_expired" });
    const scenario = engine.getScenario();

    while (!engine.getState().isCompleted) {
      engine.stepForward();
    }

    const finalState = engine.getState();
    expect(finalState.status).toBe("HALTED_ERROR");
    expect(finalState.isCompleted).toBe(true);

    // Check inspection at halt node (Node 4: Backend Controller)
    const inspector = buildInspectorDetails(scenario, 4, "UPSTREAM");
    expect(inspector.formattedWireText).toContain("AUTH_STATUS: REJECTED");

    storage.recordRun(scenario.id);
    const savedState = storage.load();
    expect(savedState.totalRuns).toBe(1);
    expect(savedState.scenarioRuns["auth_token_expired"]).toBe(1);
    expect(savedState.scenarioRuns["order_create"]).toBe(0);
  });

  it("should save and restore custom scenario configuration without losing historical telemetry", () => {
    // 1. Accumulate some runs
    storage.recordRun("order_create");
    storage.recordInspection(0);
    storage.recordInspection(1);

    // 2. Save custom configuration for rbac_restriction
    storage.saveScenarioConfig("rbac_restriction", {
      userRole: "viewer",
      rateLimiter: true,
      latency: "lag",
      concurrency: "cas",
    });

    // 3. Load state and verify custom config is stored alongside telemetry
    const state = storage.load();
    expect(state.totalRuns).toBe(1);
    expect(state.inspectedNodeHistory).toEqual([0, 1]);
    expect(state.savedScenarioConfigs["rbac_restriction"]).toEqual({
      userRole: "viewer",
      rateLimiter: true,
      latency: "lag",
      concurrency: "cas",
    });

    // 4. Retrieve via helper
    const config = storage.getScenarioConfig("rbac_restriction");
    expect(config?.userRole).toBe("viewer");
  });
});

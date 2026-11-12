import { describe, it, expect, beforeEach } from "vitest";
import {
  StorageEngine,
  createDefaultStateV2,
  migrateV1ToV2,
  migrateState,
  type StorageBackend,
  type AppStateV1,
  type AppStateV2,
} from "../../src/features/03-state-persistence/storage";

class MockStorageBackend implements StorageBackend {
  private store: Map<string, string> = new Map();
  public throwOnSet = false;

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.throwOnSet) {
      throw new Error("QuotaExceededError: storage quota full");
    }
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe("State Persistence Engine & Zero-Loss Migration (Feature 03)", () => {
  let backend: MockStorageBackend;
  let engine: StorageEngine;

  beforeEach(() => {
    backend = new MockStorageBackend();
    engine = new StorageEngine(backend);
  });

  it("should initialize with default v2 state when storage is empty", () => {
    const state = engine.load();
    expect(state.version).toBe(2);
    expect(state.totalRuns).toBe(0);
    expect(state.scenarioRuns["201-created"]).toBe(0);
    expect(state.scenarioRuns["401-unauthorized"]).toBe(0);
    expect(state.scenarioRuns["504-timeout"]).toBe(0);
    expect(state.inspectedNodeHistory).toEqual([]);
    expect(state.lastRunTime).toBeNull();
  });

  it("should save and reload valid v2 state", () => {
    const customState: AppStateV2 = {
      version: 2,
      totalRuns: 5,
      scenarioRuns: {
        "201-created": 3,
        "401-unauthorized": 1,
        "504-timeout": 1,
      },
      lastRunTime: "2026-11-12T16:00:00.000Z",
      inspectedNodeHistory: [0, 1, 2],
    };

    engine.save(customState);
    const loaded = engine.load();
    expect(loaded).toEqual(customState);
  });

  it("should perform zero-loss migration from v1 to v2", () => {
    const v1State: AppStateV1 = {
      version: 1,
      pings: 14,
      lastPingTime: "2026-11-12T10:20:00.000Z",
    };

    const migrated = migrateV1ToV2(v1State);
    expect(migrated.version).toBe(2);
    expect(migrated.totalRuns).toBe(14);
    expect(migrated.scenarioRuns["201-created"]).toBe(14);
    expect(migrated.scenarioRuns["401-unauthorized"]).toBe(0);
    expect(migrated.scenarioRuns["504-timeout"]).toBe(0);
    expect(migrated.lastRunTime).toBe("2026-11-12T10:20:00.000Z");
    expect(migrated.inspectedNodeHistory).toEqual([]);
  });

  it("should transparently migrate legacy v1 stored in storage backend on load", () => {
    // Seed backend with v1 key from initial release
    backend.setItem(
      "requestflow_state_v1",
      JSON.stringify({ version: 1, pings: 42, lastPingTime: "2026-11-12T09:00:00Z" })
    );

    const loaded = engine.load();
    expect(loaded.version).toBe(2);
    expect(loaded.totalRuns).toBe(42);
    expect(loaded.lastRunTime).toBe("2026-11-12T09:00:00Z");

    // Verify it automatically persisted the migrated v2 key
    const v2Raw = backend.getItem("requestflow_state_v2");
    expect(v2Raw).not.toBeNull();
    const parsedV2 = JSON.parse(v2Raw!);
    expect(parsedV2.version).toBe(2);
    expect(parsedV2.totalRuns).toBe(42);
  });

  it("should gracefully recover from corrupted JSON strings in storage", () => {
    backend.setItem("requestflow_state_v2", "{ corrupt_json: invalid syntax ... ");
    const state = engine.load();
    expect(state.version).toBe(2);
    expect(state.totalRuns).toBe(0);
  });

  it("should record pipeline simulation runs and update counts", () => {
    engine.recordRun("201-created");
    engine.recordRun("201-created");
    engine.recordRun("401-unauthorized");

    const state = engine.load();
    expect(state.totalRuns).toBe(3);
    expect(state.scenarioRuns["201-created"]).toBe(2);
    expect(state.scenarioRuns["401-unauthorized"]).toBe(1);
    expect(state.scenarioRuns["504-timeout"]).toBe(0);
    expect(state.lastRunTime).not.toBeNull();
  });

  it("should record unique node inspections without duplicates", () => {
    engine.recordInspection(0);
    engine.recordInspection(2);
    engine.recordInspection(0); // Duplicate should be ignored

    const state = engine.load();
    expect(state.inspectedNodeHistory).toEqual([0, 2]);
  });

  it("should handle storage write exceptions gracefully without throwing", () => {
    backend.throwOnSet = true;
    const success = engine.save(createDefaultStateV2());
    expect(success).toBe(false);
  });

  it("should reset state and clean up storage keys", () => {
    engine.recordRun("201-created");
    engine.recordInspection(1);
    expect(engine.load().totalRuns).toBe(1);

    const resetState = engine.reset();
    expect(resetState.totalRuns).toBe(0);
    expect(backend.getItem("requestflow_state_v2")).toBeNull();
  });
});

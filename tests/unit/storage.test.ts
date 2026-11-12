import { describe, it, expect, beforeEach } from "vitest";
import {
  StorageEngine,
  createDefaultStateV3,
  migrateV1ToV2,
  migrateV2ToV3,
  migrateState,
  CURRENT_SCHEMA_VERSION,
  type StorageBackend,
  type AppStateV1,
  type AppStateV2,
  type AppStateV3,
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

describe("Sequential State Persistence Engine & Multi-Version Chaining (Feature 03)", () => {
  let backend: MockStorageBackend;
  let engine: StorageEngine;

  beforeEach(() => {
    backend = new MockStorageBackend();
    engine = new StorageEngine(backend);
  });

  it("should initialize with default v3 state when storage is empty", () => {
    const state = engine.load();
    expect(state.version).toBe(CURRENT_SCHEMA_VERSION);
    expect(state.totalRuns).toBe(0);
    expect(state.scenarioRuns["201-created"]).toBe(0);
    expect(state.inspectedNodeHistory).toEqual([]);
    expect(state.latencyStats).toEqual({ avgDnsMs: 4, avgTlsMs: 38, avgDbMs: 8 });
  });

  it("should perform atomic single-step migration v1 -> v2", () => {
    const v1State: AppStateV1 = {
      version: 1,
      pings: 15,
      lastPingTime: "2026-11-12T10:00:00Z",
    };
    const v2 = migrateV1ToV2(v1State);
    expect(v2.version).toBe(2);
    expect(v2.totalRuns).toBe(15);
    expect(v2.scenarioRuns["201-created"]).toBe(15);
    expect(v2.lastRunTime).toBe("2026-11-12T10:00:00Z");
  });

  it("should perform atomic single-step migration v2 -> v3", () => {
    const v2State: AppStateV2 = {
      version: 2,
      totalRuns: 20,
      scenarioRuns: { "201-created": 15, "401-unauthorized": 3, "504-timeout": 2 },
      lastRunTime: "2026-11-12T12:00:00Z",
      inspectedNodeHistory: [0, 1, 2],
    };
    const v3 = migrateV2ToV3(v2State);
    expect(v3.version).toBe(3);
    expect(v3.totalRuns).toBe(20);
    expect(v3.scenarioRuns["401-unauthorized"]).toBe(3);
    expect(v3.inspectedNodeHistory).toEqual([0, 1, 2]);
    expect(v3.themePreference).toBe("CRT_DARK");
    expect(v3.latencyStats.avgDnsMs).toBe(4);
  });

  it("should execute sequential chaining for multi-version jump: v1 -> v2 -> v3", () => {
    const legacyV1 = {
      version: 1,
      pings: 88,
      lastPingTime: "2026-11-12T08:30:00Z",
    };

    // migrateState must execute 1 -> 2 -> 3 seamlessly in one pipeline call
    const migrated = migrateState(legacyV1);
    expect(migrated.version).toBe(3);
    expect(migrated.totalRuns).toBe(88);
    expect(migrated.scenarioRuns["201-created"]).toBe(88);
    expect(migrated.lastRunTime).toBe("2026-11-12T08:30:00Z");
    expect(migrated.latencyStats.avgTlsMs).toBe(38);
  });

  it("should transparently migrate legacy v1 key directly to v3 in storage backend on load", () => {
    backend.setItem(
      "requestflow_state_v1",
      JSON.stringify({ version: 1, pings: 42, lastPingTime: "2026-11-12T09:00:00Z" })
    );

    const loaded = engine.load();
    expect(loaded.version).toBe(3);
    expect(loaded.totalRuns).toBe(42);
    expect(loaded.lastRunTime).toBe("2026-11-12T09:00:00Z");

    // Primary v3 key should now be saved in backend
    const savedV3 = backend.getItem("requestflow_state_v3");
    expect(savedV3).not.toBeNull();
    const parsedV3 = JSON.parse(savedV3!);
    expect(parsedV3.version).toBe(3);
    expect(parsedV3.totalRuns).toBe(42);
  });

  it("should gracefully recover from corrupted JSON strings in storage", () => {
    backend.setItem("requestflow_state_v3", "{ corrupted_json_syntax");
    const state = engine.load();
    expect(state.version).toBe(3);
    expect(state.totalRuns).toBe(0);
  });

  it("should record pipeline simulation runs and update counts", () => {
    engine.recordRun("201-created");
    engine.recordRun("401-unauthorized");

    const state = engine.load();
    expect(state.totalRuns).toBe(2);
    expect(state.scenarioRuns["201-created"]).toBe(1);
    expect(state.scenarioRuns["401-unauthorized"]).toBe(1);
    expect(state.lastRunTime).not.toBeNull();
  });

  it("should record unique node inspections without duplicates", () => {
    engine.recordInspection(0);
    engine.recordInspection(3);
    engine.recordInspection(0);

    const state = engine.load();
    expect(state.inspectedNodeHistory).toEqual([0, 3]);
  });

  it("should handle storage write exceptions gracefully without throwing", () => {
    backend.throwOnSet = true;
    const success = engine.save(createDefaultStateV3());
    expect(success).toBe(false);
  });
});

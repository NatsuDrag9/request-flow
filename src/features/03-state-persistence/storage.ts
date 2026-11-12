export interface ScenarioRunCounts {
  "201-created": number;
  "401-unauthorized": number;
  "504-timeout": number;
}

export interface AppStateV1 {
  version: 1;
  pings: number;
  lastPingTime: string | null;
}

export interface AppStateV2 {
  version: 2;
  totalRuns: number;
  scenarioRuns: ScenarioRunCounts;
  lastRunTime: string | null;
  inspectedNodeHistory: number[];
}

export interface StorageBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createDefaultStateV2(): AppStateV2 {
  return {
    version: 2,
    totalRuns: 0,
    scenarioRuns: {
      "201-created": 0,
      "401-unauthorized": 0,
      "504-timeout": 0,
    },
    lastRunTime: null,
    inspectedNodeHistory: [],
  };
}

/**
 * Pure migration handler converting v1 state to v2 without data loss.
 */
export function migrateV1ToV2(oldState: AppStateV1): AppStateV2 {
  const pings = typeof oldState.pings === "number" && !isNaN(oldState.pings) ? oldState.pings : 0;
  return {
    version: 2,
    totalRuns: pings,
    scenarioRuns: {
      "201-created": pings,
      "401-unauthorized": 0,
      "504-timeout": 0,
    },
    lastRunTime: typeof oldState.lastPingTime === "string" ? oldState.lastPingTime : null,
    inspectedNodeHistory: [],
  };
}

/**
 * Version-specific, pure migration pipeline.
 */
export function migrateState(raw: unknown): AppStateV2 {
  if (!raw || typeof raw !== "object") {
    return createDefaultStateV2();
  }

  const candidate = raw as Record<string, unknown>;

  // Check version field
  const version = candidate.version;

  if (!version || version === 1) {
    const v1State: AppStateV1 = {
      version: 1,
      pings: typeof candidate.pings === "number" ? candidate.pings : 0,
      lastPingTime: typeof candidate.lastPingTime === "string" ? candidate.lastPingTime : null,
    };
    return migrateV1ToV2(v1State);
  }

  if (version === 2) {
    const rawRuns = (candidate.scenarioRuns && typeof candidate.scenarioRuns === "object")
      ? (candidate.scenarioRuns as Record<string, unknown>)
      : {};

    const history = Array.isArray(candidate.inspectedNodeHistory)
      ? candidate.inspectedNodeHistory.filter((n): n is number => typeof n === "number")
      : [];

    return {
      version: 2,
      totalRuns: typeof candidate.totalRuns === "number" ? candidate.totalRuns : 0,
      scenarioRuns: {
        "201-created": Number(rawRuns["201-created"] ?? 0),
        "401-unauthorized": Number(rawRuns["401-unauthorized"] ?? 0),
        "504-timeout": Number(rawRuns["504-timeout"] ?? 0),
      },
      lastRunTime: typeof candidate.lastRunTime === "string" ? candidate.lastRunTime : null,
      inspectedNodeHistory: history,
    };
  }

  // Unknown future versions fall back safely to default
  return createDefaultStateV2();
}

/**
 * Headless StorageEngine wrapping any StorageBackend.
 */
export class StorageEngine {
  private backend: StorageBackend;
  private storageKey: string;
  private cachedState: AppStateV2 | null = null;

  constructor(backend: StorageBackend, storageKey = "requestflow_state_v2") {
    this.backend = backend;
    this.storageKey = storageKey;
  }

  load(): AppStateV2 {
    try {
      // First check for primary v2 key
      const saved = this.backend.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.cachedState = migrateState(parsed);
        return { ...this.cachedState };
      }

      // Check for legacy v1 key ("requestflow_state_v1") to perform zero-loss migration
      const legacyV1 = this.backend.getItem("requestflow_state_v1");
      if (legacyV1) {
        const parsedV1 = JSON.parse(legacyV1);
        this.cachedState = migrateState(parsedV1);
        // Persist migrated state to new key
        this.save(this.cachedState);
        return { ...this.cachedState };
      }
    } catch (err) {
      console.warn("StorageEngine load failed, using default state", err);
    }

    this.cachedState = createDefaultStateV2();
    return { ...this.cachedState };
  }

  save(state: AppStateV2): boolean {
    this.cachedState = { ...state };
    try {
      this.backend.setItem(this.storageKey, JSON.stringify(state));
      return true;
    } catch (err) {
      console.warn("StorageEngine save failed (quota or disabled)", err);
      return false;
    }
  }

  recordRun(scenarioId: string): AppStateV2 {
    const state = this.load();
    state.totalRuns += 1;
    state.lastRunTime = new Date().toISOString();

    if (scenarioId in state.scenarioRuns) {
      const key = scenarioId as keyof ScenarioRunCounts;
      state.scenarioRuns[key] += 1;
    }

    this.save(state);
    return state;
  }

  recordInspection(nodeIndex: number): AppStateV2 {
    const state = this.load();
    if (!state.inspectedNodeHistory.includes(nodeIndex)) {
      state.inspectedNodeHistory.push(nodeIndex);
      this.save(state);
    }
    return state;
  }

  reset(): AppStateV2 {
    const fresh = createDefaultStateV2();
    this.save(fresh);
    try {
      this.backend.removeItem(this.storageKey);
      this.backend.removeItem("requestflow_state_v1");
    } catch {
      // ignore
    }
    return fresh;
  }
}

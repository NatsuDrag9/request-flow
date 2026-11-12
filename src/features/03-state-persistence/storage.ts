export interface ScenarioRunCounts {
  "201-created"?: number;
  "401-unauthorized"?: number;
  "403-forbidden"?: number;
  "429-ratelimit"?: number;
  "504-timeout"?: number;
  "slow-query"?: number;
  "idempotency-replay"?: number;
  "409-conflict"?: number;
  [key: string]: number | undefined;
}

export interface LatencyStats {
  avgDnsMs: number;
  avgTlsMs: number;
  avgDbMs: number;
}

export interface ScenarioConfigSnapshot {
  rateLimiter?: boolean;
  userRole?: "viewer" | "member" | "admin";
  latency?: "normal" | "lag";
  concurrency?: "idempotent" | "cas";
}

export interface AppStateV1 {
  version: 1;
  pings: number;
  lastPingTime: string | null;
}

export interface AppStateV2 {
  version: 2;
  totalRuns: number;
  scenarioRuns: {
    "201-created": number;
    "401-unauthorized": number;
    "504-timeout": number;
  };
  lastRunTime: string | null;
  inspectedNodeHistory: number[];
}

export interface AppStateV3 {
  version: 3;
  totalRuns: number;
  scenarioRuns: ScenarioRunCounts;
  lastRunTime: string | null;
  inspectedNodeHistory: number[];
  themePreference: "CRT_DARK" | "PAPER_LIGHT";
  latencyStats: LatencyStats;
  savedScenarioConfigs: Record<string, ScenarioConfigSnapshot>;
}

export type AppStateLatest = AppStateV3;

export interface StorageBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createDefaultStateV3(): AppStateV3 {
  return {
    version: 3,
    totalRuns: 0,
    scenarioRuns: {
      "order_create": 0,
      "auth_token_expired": 0,
      "rbac_restriction": 0,
      "token_bucket_empty": 0,
      "db_pool_timeout": 0,
      "query_degraded": 0,
      "idempotency_cache": 0,
      "optimistic_lock_cas": 0,
      "201-created": 0,
      "401-unauthorized": 0,
      "403-forbidden": 0,
      "429-ratelimit": 0,
      "504-timeout": 0,
      "slow-query": 0,
      "idempotency-replay": 0,
      "409-conflict": 0,
    },
    lastRunTime: null,
    inspectedNodeHistory: [],
    themePreference: "CRT_DARK",
    latencyStats: {
      avgDnsMs: 4,
      avgTlsMs: 38,
      avgDbMs: 8,
    },
    savedScenarioConfigs: {},
  };
}

export const createDefaultStateV2 = createDefaultStateV3;

/**
 * Atomic Migration Step 1: v1 -> v2
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
 * Atomic Migration Step 2: v2 -> v3
 * Zero-loss upgrade: Preserves all accumulated runs and inspected nodes,
 * initializes savedScenarioConfigs dictionary cleanly.
 */
export function migrateV2ToV3(oldState: AppStateV2): AppStateV3 {
  const totalRuns = typeof oldState.totalRuns === "number" ? oldState.totalRuns : 0;
  const count201 = Number(oldState.scenarioRuns?.["201-created"] ?? totalRuns);
  const count401 = Number(oldState.scenarioRuns?.["401-unauthorized"] ?? 0);
  const count504 = Number(oldState.scenarioRuns?.["504-timeout"] ?? 0);

  return {
    version: 3,
    totalRuns,
    scenarioRuns: {
      "order_create": count201,
      "auth_token_expired": count401,
      "rbac_restriction": 0,
      "token_bucket_empty": 0,
      "db_pool_timeout": count504,
      "query_degraded": 0,
      "idempotency_cache": 0,
      "optimistic_lock_cas": 0,
      "201-created": count201,
      "401-unauthorized": count401,
      "403-forbidden": 0,
      "429-ratelimit": 0,
      "504-timeout": count504,
      "slow-query": 0,
      "idempotency-replay": 0,
      "409-conflict": 0,
    },
    lastRunTime: typeof oldState.lastRunTime === "string" ? oldState.lastRunTime : null,
    inspectedNodeHistory: Array.isArray(oldState.inspectedNodeHistory)
      ? oldState.inspectedNodeHistory.filter((n) => typeof n === "number")
      : [],
    themePreference: "CRT_DARK",
    latencyStats: {
      avgDnsMs: 4,
      avgTlsMs: 38,
      avgDbMs: 8,
    },
    savedScenarioConfigs: {},
  };
}

export type MigrationStep = (prev: Record<string, unknown>) => Record<string, unknown>;

/**
 * Sequential Migration Registry: Maps each version `i` to its atomic handler `vi -> vi+1`
 */
export const MIGRATION_PIPELINE: Record<number, MigrationStep> = {
  1: (s) => migrateV1ToV2(s as unknown as AppStateV1) as unknown as Record<string, unknown>,
  2: (s) => migrateV2ToV3(s as unknown as AppStateV2) as unknown as Record<string, unknown>,
};

export const CURRENT_SCHEMA_VERSION = 3;

/**
 * Linear Sequential Chaining: Handles vn -> vn+k seamlessly without data loss.
 */
export function migrateState(raw: unknown): AppStateV3 {
  if (!raw || typeof raw !== "object") {
    return createDefaultStateV3();
  }

  let state = { ...(raw as Record<string, unknown>) };
  let version = typeof state.version === "number" ? state.version : 1;

  // Sequentially execute atomic step handlers: vi -> vi+1
  while (version < CURRENT_SCHEMA_VERSION) {
    const step = MIGRATION_PIPELINE[version];
    if (!step) {
      console.warn(`No migration registered for schema version ${version} -> ${version + 1}`);
      break;
    }
    state = step(state);
    version = (state.version as number) ?? (version + 1);
  }

  // Ensure default structure for v3 fields
  if (!state.savedScenarioConfigs || typeof state.savedScenarioConfigs !== "object") {
    state.savedScenarioConfigs = {};
  }

  return state as unknown as AppStateV3;
}

/**
 * Headless StorageEngine wrapping any StorageBackend with sequential migration chaining.
 */
export class StorageEngine {
  private backend: StorageBackend;
  private storageKey: string;
  private cachedState: AppStateV3 | null = null;

  constructor(backend: StorageBackend, storageKey = "requestflow_state_v3") {
    this.backend = backend;
    this.storageKey = storageKey;
  }

  load(): AppStateV3 {
    try {
      // 1. Try primary v3 key
      const savedV3 = this.backend.getItem(this.storageKey);
      if (savedV3) {
        const parsed = JSON.parse(savedV3);
        this.cachedState = migrateState(parsed);
        return { ...this.cachedState };
      }

      // 2. Try v2 key (requestflow_state_v2)
      const savedV2 = this.backend.getItem("requestflow_state_v2");
      if (savedV2) {
        const parsedV2 = JSON.parse(savedV2);
        this.cachedState = migrateState(parsedV2);
        this.save(this.cachedState);
        return { ...this.cachedState };
      }

      // 3. Try legacy v1 key (requestflow_state_v1)
      const legacyV1 = this.backend.getItem("requestflow_state_v1");
      if (legacyV1) {
        const parsedV1 = JSON.parse(legacyV1);
        this.cachedState = migrateState(parsedV1);
        this.save(this.cachedState);
        return { ...this.cachedState };
      }
    } catch (err) {
      console.warn("StorageEngine load failed, using default state", err);
    }

    this.cachedState = createDefaultStateV3();
    return { ...this.cachedState };
  }

  save(state: AppStateV3): boolean {
    this.cachedState = { ...state };
    try {
      this.backend.setItem(this.storageKey, JSON.stringify(state));
      return true;
    } catch (err) {
      console.warn("StorageEngine save failed (quota or disabled)", err);
      return false;
    }
  }

  recordRun(scenarioId: string): AppStateV3 {
    const state = this.load();
    state.totalRuns += 1;
    state.lastRunTime = new Date().toISOString();

    const currentCount = state.scenarioRuns[scenarioId] ?? 0;
    state.scenarioRuns[scenarioId] = currentCount + 1;

    this.save(state);
    return state;
  }

  recordInspection(nodeIndex: number): AppStateV3 {
    const state = this.load();
    if (!state.inspectedNodeHistory.includes(nodeIndex)) {
      state.inspectedNodeHistory.push(nodeIndex);
      this.save(state);
    }
    return state;
  }

  saveScenarioConfig(scenarioId: string, config: ScenarioConfigSnapshot): AppStateV3 {
    const state = this.load();
    if (!state.savedScenarioConfigs) {
      state.savedScenarioConfigs = {};
    }
    state.savedScenarioConfigs[scenarioId] = { ...config };
    this.save(state);
    return state;
  }

  getScenarioConfig(scenarioId: string): ScenarioConfigSnapshot | null {
    const state = this.load();
    return state.savedScenarioConfigs?.[scenarioId] ?? null;
  }

  resetScenarioConfig(scenarioId: string): AppStateV3 {
    const state = this.load();
    if (state.savedScenarioConfigs && scenarioId in state.savedScenarioConfigs) {
      delete state.savedScenarioConfigs[scenarioId];
      this.save(state);
    }
    return state;
  }

  reset(): AppStateV3 {
    const fresh = createDefaultStateV3();
    this.save(fresh);
    try {
      this.backend.removeItem(this.storageKey);
      this.backend.removeItem("requestflow_state_v2");
      this.backend.removeItem("requestflow_state_v1");
    } catch {
      // ignore
    }
    return fresh;
  }
}

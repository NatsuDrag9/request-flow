# Feature Specification: State Persistence Engine (Feature 03)

## 1. Data Contracts & Schema Evolution

### Schema Version 1 (Legacy / Initial MVP)
```typescript
export interface AppStateV1 {
  version: 1;
  pings: number;
  lastPingTime: string | null;
}
```

### Schema Version 2 (Current Production Target)
```typescript
export interface ScenarioRunCountsV2 {
  "201-created": number;
  "401-unauthorized": number;
  "504-timeout": number;
}

export interface AppStateV2 {
  version: 2;
  totalRuns: number;
  scenarioRuns: ScenarioRunCountsV2;
  lastRunTime: string | null;
  inspectedNodeHistory: number[];
}

export interface ScenarioRunCountsV3 {
  "201-created": number;
  "401-unauthorized": number;
  "403-forbidden": number;
  "429-ratelimit": number;
  "504-timeout": number;
  "slow-query": number;
  "idempotency-replay": number;
  "409-conflict": number;
  [key: string]: number;
}

export interface LatencyBenchmarks {
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

export interface AppStateV3 {
  version: 3;
  totalRuns: number;
  scenarioRuns: ScenarioRunCountsV3;
  lastRunTime: string | null;
  inspectedNodeHistory: number[];
  themePreference: "CRT_DARK" | "PAPER_LIGHT";
  latencyStats: LatencyBenchmarks;
  savedScenarioConfigs: Record<string, ScenarioConfigSnapshot>;
}
```

---

## 2. Migration Functions (Pure, Sequential & Linear)

```typescript
export function migrateV1ToV2(oldState: AppStateV1): AppStateV2 {
  const pings = typeof oldState.pings === "number" ? oldState.pings : 0;
  return {
    version: 2,
    totalRuns: pings,
    scenarioRuns: {
      "201-created": pings,
      "401-unauthorized": 0,
      "504-timeout": 0,
    },
    lastRunTime: oldState.lastPingTime ?? null,
    inspectedNodeHistory: [],
  };
}

export function migrateV2ToV3(v2State: AppStateV2): AppStateV3 {
  const totalRuns = typeof v2State.totalRuns === "number" ? v2State.totalRuns : 0;
  return {
    version: 3,
    totalRuns,
    scenarioRuns: {
      "201-created": Number(v2State.scenarioRuns?.["201-created"] ?? totalRuns),
      "401-unauthorized": Number(v2State.scenarioRuns?.["401-unauthorized"] ?? 0),
      "403-forbidden": 0,
      "429-ratelimit": 0,
      "504-timeout": Number(v2State.scenarioRuns?.["504-timeout"] ?? 0),
      "slow-query": 0,
      "idempotency-replay": 0,
      "409-conflict": 0,
    },
    lastRunTime: typeof v2State.lastRunTime === "string" ? v2State.lastRunTime : null,
    inspectedNodeHistory: Array.isArray(v2State.inspectedNodeHistory)
      ? v2State.inspectedNodeHistory.filter((n) => typeof n === "number")
      : [],
    themePreference: "CRT_DARK",
    latencyStats: { avgDnsMs: 4, avgTlsMs: 38, avgDbMs: 8 },
    savedScenarioConfigs: {},
  };
}

export const MIGRATION_PIPELINE: Record<number, (state: any) => any> = {
  1: (s) => migrateV1ToV2(s),
  2: (s) => migrateV2ToV3(s),
};

export function migrateState(raw: unknown): AppStateV3 {
  if (!raw || typeof raw !== "object") {
    return createDefaultStateV3();
  }
  let current: any = { ...raw };
  let version = typeof current.version === "number" ? current.version : 1;
  while (version < 3) {
    const handler = MIGRATION_PIPELINE[version];
    if (!handler) break;
    current = handler(current);
    version = current.version ?? version + 1;
  }
  return current;
}
  return createDefaultStateV2();
}
```

---

## 3. Storage Interface (Dependency Injection)

To ensure 100% headless testability without relying on a real browser `window.localStorage`:

```typescript
export interface StorageBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class StorageEngine {
  private backend: StorageBackend;
  private key: string;

  constructor(backend: StorageBackend, key = "requestflow_state") {
    this.backend = backend;
    this.key = key;
  }

  load(): AppStateV2 { ... }
  save(state: AppStateV2): boolean { ... }
  recordRun(scenarioId: string): AppStateV2 { ... }
  recordInspection(nodeIndex: number): AppStateV2 { ... }
  reset(): AppStateV2 { ... }
}
```

---

## 4. Error Handling & Safety Guarantees
- **JSON SyntaxError**: Caught in `try...catch`; gracefully falls back to default state rather than throwing.
- **QuotaExceededError**: Caught; logs warning and returns `false` from `save()`.
- **Zero Loss Guarantee**: Unit tests must explicitly verify that feeding a real `v1` JSON string preserves `pings` $\to$ `totalRuns` and `lastPingTime` $\to$ `lastRunTime`.

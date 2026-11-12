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
export interface ScenarioRunCounts {
  "201-created": number;
  "401-unauthorized": number;
  "504-timeout": number;
}

export interface AppStateV2 {
  version: 2;
  totalRuns: number;
  scenarioRuns: ScenarioRunCounts;
  lastRunTime: string | null;
  inspectedNodeHistory: number[];
}
```

---

## 2. Migration Functions (Pure & Deterministic)

```typescript
export function migrateV1ToV2(oldState: AppStateV1): AppStateV2 {
  return {
    version: 2,
    totalRuns: typeof oldState.pings === "number" ? oldState.pings : 0,
    scenarioRuns: {
      "201-created": typeof oldState.pings === "number" ? oldState.pings : 0,
      "401-unauthorized": 0,
      "504-timeout": 0,
    },
    lastRunTime: oldState.lastPingTime ?? null,
    inspectedNodeHistory: [],
  };
}

export function migrateState(raw: unknown): AppStateV2 {
  // If null, undefined, or not an object, return pristine v2 default state
  if (!raw || typeof raw !== "object") {
    return createDefaultStateV2();
  }

  const candidate = raw as Record<string, unknown>;

  // Detect unversioned legacy or v1
  if (!candidate.version || candidate.version === 1) {
    const v1State: AppStateV1 = {
      version: 1,
      pings: typeof candidate.pings === "number" ? candidate.pings : 0,
      lastPingTime: typeof candidate.lastPingTime === "string" ? candidate.lastPingTime : null,
    };
    return migrateV1ToV2(v1State);
  }

  // Already v2
  if (candidate.version === 2) {
    return {
      version: 2,
      totalRuns: typeof candidate.totalRuns === "number" ? candidate.totalRuns : 0,
      scenarioRuns: {
        "201-created": Number(candidate.scenarioRuns?.["201-created"] ?? 0),
        "401-unauthorized": Number(candidate.scenarioRuns?.["401-unauthorized"] ?? 0),
        "504-timeout": Number(candidate.scenarioRuns?.["504-timeout"] ?? 0),
      },
      lastRunTime: typeof candidate.lastRunTime === "string" ? candidate.lastRunTime : null,
      inspectedNodeHistory: Array.isArray(candidate.inspectedNodeHistory)
        ? candidate.inspectedNodeHistory.filter((n) => typeof n === "number")
        : [],
    };
  }

  // Fallback for future unsupported versions
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

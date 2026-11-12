# Feature Intent: State Persistence Engine & Zero-Loss Schema Migration (Feature 03)

## 1. Problem Statement
Mobile web applications (PWAs) installed on physical smartphones are updated in place as users revisit the app. When an application evolves—introducing new metrics, session history, or settings—it frequently alters its client-side storage format. 

If an application blindly resets `localStorage` or fails to parse previous schema formats, existing users lose their accumulated progress, counter telemetry, and preferences. For a high-stakes recruitment challenge, demonstrating production-grade, zero-loss data persistence is an essential engineering criterion.

---

## 2. Pedagogical & Technical Objectives
1. **Explicit Schema Versioning**: Every stored payload is branded with an explicit integer `version` field (e.g. `version: 1`, `version: 2`).
2. **Pure, Version-Specific Migration Pipeline**: A pure function `migrateState(rawData)` detects the incoming schema version and applies sequential, deterministic migration handlers (`v1 -> v2`, `v2 -> v3`) without data loss.
3. **Defensive Storage Isolation**:
   - Graceful recovery when `localStorage` is disabled (private browsing mode) or quota is exceeded.
   - Robust JSON validation preventing crashes from corrupted storage strings.
   - Decoupled `StorageEngine` class with zero DOM dependencies (injectable mock storage) for 100% automated Vitest testing.

---

## 3. Storage Scope & Evolution
- **v1 Schema**:
  - `version: 1`
  - `pings: number` (raw execution count)
  - `lastPingTime: string | null`
- **v2 Schema** (Multi-scenario telemetry & node inspection tracking):
  - `version: 2`
  - `totalRuns: number` (mapped from `v1.pings`)
  - `scenarioRuns: { "201-created": number, "401-unauthorized": number, "504-timeout": number }`
  - `lastRunTime: string | null` (mapped from `v1.lastPingTime`)
  - `inspectedNodeHistory: number[]` (tracks unique stages inspected)
- **v3 Schema** (Full multi-scenario analytics, custom scenario configurations & lab settings):
  - `version: 3`
  - `totalRuns: number` (preserved from v2)
  - `scenarioRuns: Record<string, number>` (expanded to track `201-created`, `401-unauthorized`, `403-forbidden`, `429-ratelimit`, `504-timeout`, `slow-query`, `idempotency-replay`, `409-conflict`)
  - `lastRunTime: string | null`
  - `inspectedNodeHistory: number[]`
  - `themePreference: "CRT_DARK" | "PAPER_LIGHT"`
  - `latencyStats: { avgDnsMs: number, avgTlsMs: number, avgDbMs: number }`
  - `savedScenarioConfigs: Record<string, { rateLimiter?: boolean, userRole?: string, latency?: string, concurrency?: string }>` (persists user parameter overrides per scenario)

### Assignment Constraint Alignment:
Altering the data storage contract to save per-scenario configurations in v3 while preserving all historical counts and inspected stages from v1 and v2 directly satisfies the CloudCrane evaluation requirement: *"At least one change should alter the data it saves, without losing what’s already on your phone"*.

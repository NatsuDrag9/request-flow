# Feature Plan: State Persistence Engine (Feature 03)

## 1. Implementation Steps & TDD Sequencing

### Step 1: Storage & Migration Core (`src/features/03-state-persistence/storage.ts`)
- Implement `AppStateV1`, `AppStateV2`, and `createDefaultStateV2()`.
- Implement pure migration functions `migrateV1ToV2` and `migrateState`.
- Implement `StorageEngine` class accepting any `StorageBackend` (`localStorage` or in-memory dictionary).

### Step 2: Automated Unit Testing (`tests/unit/storage.test.ts`)
- Test pristine state initialization.
- Test saving and loading valid `v2` state.
- Test legacy `v1` $\to$ `v2` zero-loss migration (preserves `pings` as `totalRuns` and `lastPingTime`).
- Test recovery from corrupted JSON strings in storage.
- Test graceful handling of storage exceptions (`QuotaExceededError`).
- Test helper methods (`recordRun`, `recordInspection`, `reset`).

### Step 3: Bundle Integration (`scripts/bundle.js`)
- Bundle `src/features/03-state-persistence/storage.ts` into `RequestFlowEngine` namespace.
- Ensure bundle size is well under 1 MB.

### Step 4: UI Integration (`src/index.html`)
- Connect `StorageEngine` to the UI lifecycle:
  - On page load, initialize `StorageEngine` wrapping `window.localStorage`.
  - On pipeline completion (`onPipelineComplete`), call `storage.recordRun(scenarioId)`.
  - When inspecting a node, call `storage.recordInspection(nodeIndex)`.
  - Update telemetry well to display persisted `RUNS: XX` metrics.
  - Add a retro `[ ↺ RESET DATA ]` option in the chassis.

### Step 5: Verification & Browser Testing
- Run `npm run validate` (`tsc --noEmit && vitest run && bundle`).
- Open `http://localhost:4173/` and verify in the built-in browser.

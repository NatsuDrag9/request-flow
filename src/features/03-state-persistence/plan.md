# Feature Plan: State Persistence Engine (Feature 03)

## 1. Implementation Steps & TDD Sequencing

### Step 1: Storage & Migration Core (`src/features/03-state-persistence/storage.ts`)
- Implement `AppStateV1`, `AppStateV2`, `AppStateV3`, and factory `createDefaultStateV3()`.
- Implement `ScenarioConfigSnapshot` and per-scenario persistence (`saveScenarioConfig`, `getScenarioConfig`, `resetScenarioConfig`).
- Implement pure linear migration functions `migrateV1ToV2`, `migrateV2ToV3`, and the sequential `migrateState` loop using `MIGRATION_PIPELINE`.
- Implement `StorageEngine` class accepting any `StorageBackend` (`localStorage` or mock dictionary), supporting fallback loading across `requestflow_state_v3`, `requestflow_state_v2`, and legacy `requestflow_state_v1`.

### Step 2: Automated Unit Testing (`tests/unit/storage.test.ts`)
- Test pristine state initialization for version 3.
- Test saving and loading valid `v3` state including `savedScenarioConfigs`.
- Test backward-compatible linear migration $v_1 \to v_2 \to v_3$ (preserves `pings` $\to$ `totalRuns` $\to$ `scenarioRuns`).
- Test direct $v_2 \to v_3$ migration: verifies that existing runs and inspected node history are 100% preserved, while `savedScenarioConfigs` is safely initialized to `{}`.
- Test custom scenario configuration persistence: saving overrides for a scenario, reloading them, and resetting them to factory defaults.
- Test recovery from corrupted JSON strings in storage.
- Test graceful handling of storage exceptions (`QuotaExceededError` and disabled storage).
- Test helper methods (`recordRun` for all 8 scenarios, `recordInspection`, `reset`).

### Step 3: Bundle Integration (`scripts/bundle.js`)
- Bundle `src/features/03-state-persistence/storage.ts` into `RequestFlowEngine` namespace.
- Ensure bundle size is well under 1 MB.

### Step 4: UI Integration (`src/index.html`)
- Connect `StorageEngine` to the UI lifecycle:
  - On page load, initialize `StorageEngine` wrapping `window.localStorage`.
  - On pipeline completion (`onPipelineComplete`), call `storage.recordRun(scenarioId)`.
  - When inspecting a node, call `storage.recordInspection(nodeIndex)`.
  - In Lab Controls:
    - On `[ 💾 SAVE CONFIG ]`: call `storage.saveScenarioConfig(activeScenarioId, currentConfig)` and show retro `CONFIG SAVED` toast.
    - On `[ ↺ RESET TO DEFAULT ]`: call `storage.resetScenarioConfig(activeScenarioId)` and restore default presets.
    - On scenario dropdown change: query `storage.getScenarioConfig(newScenarioId)` and apply saved overrides if present.
  - Update telemetry well to display persisted `RUNS: XX` metrics.
  - Add a retro `[ ↺ RESET DATA ]` option in the chassis.

### Step 5: Verification & Browser Testing
- Run `npm run validate` (`tsc --noEmit && vitest run && bundle`).
- Open `http://localhost:4173/` and verify in the built-in browser.

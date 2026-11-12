# Feature 01: Pipeline Lifecycle Explorer — Implementation Plan

This plan follows the strict **Test-Driven Development (TDD)** mandate and the **4-step build and deployment pipeline** codified in [plan.md](file:///home/rohitimandi/Desktop/Rohit/Personal/Online_Project_Uploads/Interview-Assignments/cloud-crane/plan.md) and [AGENTS.md](file:///home/rohitimandi/Desktop/Rohit/Personal/Online_Project_Uploads/Interview-Assignments/cloud-crane/AGENTS.md).

---

## 1. Task Breakdown

```mermaid
flowchart TD
    T1["Task 1: Vitest Unit Tests<br/>(tests/unit/scenarios.test.ts & engine.test.ts)"] -->
    T2["Task 2: Headless Scenarios Model<br/>(src/features/01-pipeline-explorer/scenarios.ts)"] -->
    T3["Task 3: Headless FSM Engine<br/>(src/features/01-pipeline-explorer/engine.ts)"] -->
    T4["Task 4: Vitest & Typecheck<br/>(npm run typecheck && npm test)"] -->
    T5["Task 5: Pipeline Subway UI View<br/>(src/features/01-pipeline-explorer/pipeline-view.ts)"] -->
    T6["Task 6: Local Build & Review<br/>(npm run build + localhost:4173)"] -->
    T7["Task 7: Git Commit & Remote Sync<br/>(git commit to main)"] -->
    T8["Task 8: CloudCrane Deploy & QR Code<br/>(update_app + scripts/qr.js)"]
```

---

## 2. Detailed Task Specifications

### Task 1: Automated Unit Tests (Strict TDD)
- **Files**:
  - `tests/unit/scenarios.test.ts`
  - `tests/unit/engine.test.ts`
- **Test Cases**:
  - Verify all 3 scenario presets (`201`, `401`, `504`) have valid node contracts, status codes, and non-empty stage payloads.
  - Test FSM transitions: `READY` $\to$ `IN_FLIGHT` $\to$ `STEPPING` $\to$ `HALTED_SUCCESS` / `HALTED_ERROR`.
  - Test single-stepping forward (`stepForward()`) and boundary conditions (cannot step past final hop).
  - Test stepping backward (`stepBackward()`) reversing from upstream to downstream.
  - Test scenario switching resets state to `READY` at Node 0.
  - Assert zero DOM dependencies (`window`, `document` are undefined).

### Task 2: Headless Scenarios Model
- **File**: `src/features/01-pipeline-explorer/scenarios.ts`
- **Deliverables**:
  - Export strongly-typed `SCENARIOS` dictionary and helper `getScenario(id)`.
  - Realistically populate wire payloads:
    - Client headers (`Host`, `User-Agent`, `Authorization: Bearer cc_tok_...`).
    - TLS 1.3 handshake parameters (`Cipher: TLS_AES_256_GCM_SHA384`, `SNI: api.cloudcrane.ai`).
    - API Gateway tags (`X-Forwarded-For`, `X-Request-Id`, upstream path routing).
    - Express auth middleware parsing (`req.user = { id: 42 }`).
    - PostgreSQL query (`INSERT INTO orders (item, qty) VALUES ('vintage_crt', 1);`).

### Task 3: Headless FSM State Machine Engine
- **File**: `src/features/01-pipeline-explorer/engine.ts`
- **Deliverables**:
  - Strongly-typed `PipelineEngine` class implementing states, directions, transitions, and event subscribers (`on`, `off`).
  - Timer-based auto-stepping for `IN_FLIGHT` mode with configurable hop delays.
  - Deterministic step-forward and step-backward logic respecting scenario halt nodes.

### Task 4: Unit Test & Typecheck Verification
- Run `npm run typecheck && npm test` $\to$ Assert **0 type errors** and **100% test pass rate** across all unit tests before proceeding to UI integration.

### Task 5: Presentation Component (Subway Rail & Controls)
- **File**: `src/features/01-pipeline-explorer/pipeline-view.ts`
- **Deliverables**:
  - Vertical subway rail connecting the 5 nodes with mechanical styling.
  - Node cards with index pills (`[01] CLIENT`, `[02] NETWORK`, etc.) and status badges (`IDLE`, `ACTIVE`, `PASSED`, `HALTED`).
  - Animated packet bead with directional arrow ($\downarrow$ request, $\uparrow$ response).
  - Floating mechanical action bar with tactile drop shadows:
    - `[ ▶ PLAY ]` / `[ ⏸ PAUSE ]`
    - `[ ⏭ STEP ]`
    - `[ ↺ RESET ]`
  - Scenario toggle pills at top: `[ 201 CREATED ]`, `[ 401 UNAUTH ]`, `[ 504 TIMEOUT ]`.
  - Theme compatibility across both `CRT_DARK` and `PAPER_LIGHT`.

### Task 6: Local Compilation & Built-in Browser Review
- Update `scripts/bundle.js` to bundle feature modules cleanly into `dist/index.html` ($<1\text{ MB}$).
- Start local preview server and inspect `http://localhost:4173/` in the IDE built-in browser.
- Verify touch targets ($\ge 44\times 44\text{px}$), safe-area insets, and smooth $60\text{ fps}$ transitions.

### Task 7: Git Commit
- Stage verified files and commit to git on branch **`main`** with semantic commit message.

### Task 8: CloudCrane Deploy & QR Code
- Pre-flight check via `check_publish` (assert 0 problems, 0 warnings).
- Deploy updated bundle via `update_app` on slug `requestflow-v0o76jkwr0`.
- Verify live mobile rendering via `look_at_app`.
- Refresh and display scannable physical phone QR code via `cloudcrane-qr`.

---

## 3. Review Checklist for Feature 01
- [ ] Intent clearly addresses problem statement and learning goals.
- [ ] Spec details FSM states, data models, event interfaces, and visual constraints.
- [ ] Headless core code is strictly isolated from DOM APIs for fast Vitest execution.
- [ ] Plan aligns with the 4-step build and deployment pipeline.

# Feature 01: Pipeline Lifecycle Explorer — Technical Specification

## 1. Architecture Overview

The Pipeline Lifecycle Explorer follows a decoupled, headless architecture:

```
┌────────────────────────────────────────────────────────┐
│               Simulated Core Engine                    │
│   (Headless TypeScript, Zero DOM, 100% Testable)       │
│                                                        │
│   ┌─────────────────────┐      ┌──────────────────┐    │
│   │    scenarios.ts     │◄────►│    engine.ts     │    │
│   │ (Wire Data & Rules) │      │ (FSM Controller) │    │
│   └─────────────────────┘      └────────┬─────────┘    │
└─────────────────────────────────────────┼──────────────┘
                                          │ State Events
                                          ▼
┌────────────────────────────────────────────────────────┐
│               Presentation Layer (UI)                  │
│       (Mobile Web Components, CSS GPU Animations)      │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │              pipeline-view.ts                  │   │
│   │ (Subway Rail, Node Cards, Mechanical Controls) │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Pipeline Node Topology

The pipeline consists of 5 sequential nodes:

| Index | Node ID | Node Name | Responsibilities in Simulation |
|---|---|---|---|
| `0` | `client` | **Client (Browser / App)** | Constructs HTTP request, attaches headers, parses final response. |
| `1` | `network` | **Network & TLS 1.3** | Simulates DNS lookup, TCP handshake, TLS cryptographic handshake. |
| `2` | `gateway` | **API Gateway (Nginx)** | SSL termination, CORS preflight validation, rate limiting, routing. |
| `3` | `backend` | **App Server (Express)** | Bearer token authentication, body validation, business logic dispatch. |
| `4` | `database`| **Database (PostgreSQL)** | Connection checkout, transaction `BEGIN`, query execution, `COMMIT`. |

---

## 3. Finite State Machine (FSM) Specification

### 3.1 States
- **`READY`**: Simulation initialized or reset. Packet sits at Client node.
- **`IN_FLIGHT`**: Autonomous continuous playback running with simulated per-hop latencies.
- **`STEPPING`**: Manual single-step mode paused at an active node waiting for user action.
- **`HALTED_SUCCESS`**: Request reached its target and returned successfully to Client with a `2xx` response.
- **`HALTED_ERROR`**: Request rejected or timed out at an intermediate node (e.g., `401` or `504`) and returned early.

### 3.2 Direction
- **`DOWNSTREAM`**: Request packet traveling forward from Client ($0$) towards Database ($4$).
- **`UPSTREAM`**: Response packet returning backward from the halting node towards Client ($0$).

### 3.3 State Transition Table

| Current State | Event | Next State | Actions Triggered |
|---|---|---|---|
| `READY` | `START` | `IN_FLIGHT` | Initiate downstream packet traversal from Node 0. |
| `READY` | `STEP_FORWARD` | `STEPPING` | Advance packet to Node 1 and pause for user input. |
| `IN_FLIGHT` | `PAUSE` | `STEPPING` | Halt auto-timer at current node; hold packet position. |
| `IN_FLIGHT` | `STEP_FORWARD` | `STEPPING` | Cancel timer; immediately advance one hop and pause. |
| `STEPPING` | `RESUME` | `IN_FLIGHT` | Resume auto-stepping from current node with timer. |
| `STEPPING` | `STEP_FORWARD` | `STEPPING` / `HALTED_*` | Advance one hop in current direction. |
| `STEPPING` | `STEP_BACKWARD`| `STEPPING` / `READY` | Step back one hop to previous node. |
| *ANY* | `RESET` | `READY` | Clear active packet, reset nodes to `IDLE`, reset timers. |
| *ANY* | `SELECT_SCENARIO` | `READY` | Load scenario configuration; reset engine to Node 0. |

---

## 4. Scenario Contract & Presets

Every scenario conforms to the following schema:

```javascript
/**
 * @typedef {Object} ScenarioDefinition
 * @property {string} id - Unique slug ('201-created', '401-unauthorized', '504-timeout')
 * @property {string} code - HTTP status code label ('201', '401', '504')
 * @property {string} name - Human-readable title
 * @property {string} summary - Brief explanation of what happens
 * @property {number} haltNode - Node index where downstream travel ends (0..4)
 * @property {string} resultStatus - 'HALTED_SUCCESS' or 'HALTED_ERROR'
 * @property {Object.<number, NodeTelemetry>} stages - Hop-by-hop metadata
 */
```

### Scenario Presets

1. **`201 Created` (Order Creation Happy Path)**:
   - Downstream: `client (0)` $\to$ `network (1)` $\to$ `gateway (2)` $\to$ `backend (3)` $\to$ `database (4)`.
   - Halts at: Node 4 (Database creates row `orders#8912`).
   - Upstream: Node 4 $\to$ Node 3 $\to$ Node 2 $\to$ Node 1 $\to$ Node 0 (`HTTP/1.1 201 Created`).
2. **`401 Unauthorized` (Invalid Bearer Token)**:
   - Downstream: `client (0)` $\to$ `network (1)` $\to$ `gateway (2)` $\to$ `backend (3)`.
   - Halts at: Node 3 (Middleware rejects expired/missing JWT; database is never reached).
   - Upstream: Node 3 $\to$ Node 2 $\to$ Node 1 $\to$ Node 0 (`HTTP/1.1 401 Unauthorized`).
3. **`504 Gateway Timeout` (Database Deadlock / Latency Spurt)**:
   - Downstream: `client (0)` $\to$ `network (1)` $\to$ `gateway (2)` $\to$ `backend (3)` $\to$ `database (4)`.
   - Halts at: Node 4 (Query exceeds $5000\text{ms}$ lock threshold).
   - Upstream: Gateway terminates connection early $\to$ Node 1 $\to$ Node 0 (`HTTP/1.1 504 Gateway Timeout`).

---

## 5. Event Bus & Subscription API

The headless `PipelineEngine` exposes a deterministic subscription API for presentation bindings:

```javascript
class PipelineEngine {
  constructor(options = {}) { ... }

  // State Inspection
  getState()        // returns { status, scenarioId, currentNode, direction, progress }
  getScenario()     // returns active ScenarioDefinition

  // Commands
  start()           // starts auto playback
  pause()           // pauses auto playback
  stepForward()     // advances one node
  stepBackward()    // steps back one node
  reset()           // returns to READY
  setScenario(id)   // switches scenario preset

  // Subscriptions
  on(event, handler) // events: 'stateChange', 'nodeActivate', 'complete'
  off(event, handler)
}
```

---

## 6. UI & Visual Specifications

### 6.1 Layout & Subway Track
- **Track Rail**: Centered vertical 2px solid mechanical line (`var(--border-subtle)` in resting state, pulsing `var(--border-active)` during traversal).
- **Node Cards**:
  - Minimum touch target: $\ge 44\times 44\text{px}$ (cards sized $320\text{px}\times 56\text{px}$ with $\ge 12\text{px}$ vertical margins).
  - Status indicators: Monospace index badge (`[01]`, `[02]`), node name, protocol pill (`TLS 1.3`, `REVERSE PROXY`, `ACID`).
  - Active state: Inset glow in `CRT_DARK` (`#f59e0b`), warm ochre bezel in `PAPER_LIGHT` (`#9a3412`).
- **Animated Packet Bead**:
  - Mechanical bead/pill translating vertically along the rail via `transform: translateY(...)`.
  - Directional indicator arrow ($\downarrow$ downstream request, $\uparrow$ upstream response).

### 6.2 Mechanical Control Bar (Bottom-Fixed)
- Sits above safe area: `padding-bottom: max(env(safe-area-inset-bottom), 12px)`.
- Buttons with tactile 2px offset drop shadow:
  - `[ ▶ PLAY ]` / `[ ⏸ PAUSE ]`: Primary action (toggles playback).
  - `[ ⏭ STEP ]`: Single hop forward.
  - `[ ↺ RESET ]`: Restores initial ready state.
- Minimum button height: $48\text{px}$ with full thumb-reach ergonomics.

---

## 7. Architectural Decision: Schema Versioning & Zero-Loss Migrations

### 7.1 Context & Problem Statement
RequestFlow is distributed as an installable Progressive Web Application (PWA) via CloudCrane. Once installed on a physical phone, the user's simulation metrics, session counts, and theme preferences reside locally in the browser's `localStorage`.

When new versions of RequestFlow are published to CloudCrane (e.g., iterating from `v1` baseline to `v2` and `v3`), the user's phone picks up the updated HTML bundle automatically the next time it opens. If the new bundle expects a newer data schema without backward-compatible migration handlers, one of two failures occurs:
1. **Runtime Crash**: The new code attempts to read fields that do not exist on the old payload, crashing the script.
2. **Data Wipeout**: Defensive fallback resets the phone storage, wiping out the user's previously recorded request history.

Furthermore, a core requirement of the CloudCrane assignment states:
> *"Deliver at least 3 published versions... At least one change must alter saved data without losing existing phone data."*

### 7.2 Pedagogical Alignment
Because RequestFlow is a laboratory explaining backend architectures, client-side schema migrations directly mirror **real-world database schema migrations** (such as Flyway, Liquibase, or Prisma migrations in backend services), where schemas must evolve across continuous deployment cycles without dropping production records.

### 7.3 Architectural Contract

Every state object persisted in `localStorage` must adhere to these rules:
1. **Mandatory Schema Version Tag**: All saved root state objects must include a top-level `version: <integer>` property (starting at `1`).
2. **Deterministic Startup Migration Pipeline**:
   - Before the UI initializes, the persistence layer checks `savedState.version`.
   - If `savedState.version < CURRENT_SCHEMA_VERSION`, it pipes the state sequentially through version-specific, pure migration handlers:
     $$\text{v1 State} \xrightarrow{\text{migrateV1ToV2()}} \text{v2 State} \xrightarrow{\text{migrateV2ToV3()}} \text{Current State}$$
   - The upgraded payload is immediately written back to `localStorage` with the updated version number.
3. **Graceful Fallback & Quota Handling**:
   - If stored data is corrupted (invalid JSON), log a warning and initialize defaults without throwing.
   - Wrap all `localStorage.setItem` invocations in `try/catch` to handle private-browsing or storage quota exceptions gracefully.

### 7.4 Example Migration Transition (V1 to V2)

```javascript
// Baseline v1 Schema (Stored on Phone)
const v1State = {
  version: 1,
  pings: 14,
  lastPingTime: "2026-11-12T10:00:00.000Z"
};

// Target v2 Schema
const v2State = {
  version: 2,
  totalRequests: 14,             // Preserved from v1.pings
  scenarioStats: {
    "201-created": 14,
    "401-unauthorized": 0,
    "504-timeout": 0
  },
  preferences: {
    theme: "CRT_DARK"
  },
  lastRunAt: "2026-11-12T10:00:00.000Z"
};

// Pure Migration Function
export function migrateV1ToV2(v1) {
  return {
    version: 2,
    totalRequests: typeof v1.pings === "number" ? v1.pings : 0,
    scenarioStats: {
      "201-created": typeof v1.pings === "number" ? v1.pings : 0,
      "401-unauthorized": 0,
      "504-timeout": 0
    },
    preferences: {
      theme: "CRT_DARK"
    },
    lastRunAt: v1.lastPingTime || null
  };
}
```

### 7.5 Verification & TDD Mandate
Automated tests in `tests/unit/storage.test.js` must verify this architectural contract by injecting historical v1 payloads and asserting that all user metrics survive the migration intact without data loss.

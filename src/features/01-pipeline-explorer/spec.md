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

The request pipeline consists of 6 sequential nodes:

| Index | Node ID | Node Name | Responsibilities in Simulation |
|---|---|---|---|
| `0` | `client` | **Client (Browser / App)** | Constructs HTTP request, attaches headers, parses final response. |
| `1` | `dns_tls` | **DNS & TLS 1.3** | Domain resolution to IP, TCP handshake, TLS 1.3 cryptographic session setup. |
| `2` | `lb` | **Load Balancer (Edge LB)** | L4/L7 traffic distribution, round-robin target selection, health checks, `X-Forwarded-For`. |
| `3` | `gateway` | **API Gateway (Nginx)** | Perimeter security, Token Bucket rate-limiting (429), Idempotency key cache, path routing. |
| `4` | `backend` | **Backend / Auth Controller (Express)** | JWT verification (401), RBAC role checks (403), controller business logic. |
| `5` | `database`| **Database (PostgreSQL)** | ACID transactions, connection pool allocation, read/write latency, CAS optimistic locks (409). |

---

## 3. Finite State Machine (FSM) Specification

### 3.1 States
- **`READY`**: Simulation initialized or reset. Packet sits at Client node.
- **`IN_FLIGHT`**: Autonomous continuous playback running with simulated per-hop latencies.
- **`STEPPING`**: Manual single-step mode paused at an active node waiting for user action.
- **`HALTED_SUCCESS`**: Request reached its target and returned successfully to Client with a `2xx` response.
- **`HALTED_ERROR`**: Request rejected or timed out at an intermediate node (e.g., `401`, `403`, `429`, `504`, `409`) and returned early.

### 3.2 Direction
- **`DOWNSTREAM`**: Request packet traveling forward from Client ($0$) towards Database ($5$).
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

### 4.1 Semantic Scenario Selection & Info Modal UX
- **Semantic Selector Pills**: Scenarios are selected using descriptive operational labels rather than bare HTTP status codes:
  - `[ HAPPY PATH ]`: End-to-end checkout (`order_create`).
  - `[ EXPIRED TOKEN ]`: Missing/expired Bearer JWT (`auth_token_expired`).
  - `[ RBAC RESTRICTION ]`: Authenticated `Viewer` attempting mutation (`rbac_restriction`).
  - `[ RATE LIMIT ]`: Token Bucket capacity exhausted at API Gateway (`token_bucket_empty`).
  - `[ DB TIMEOUT ]`: Connection pool deadlock exceeding 5000ms SLA (`db_pool_timeout`).
  - `[ SLOW QUERY ]`: Degraded database disk I/O latency (`query_degraded`).
  - `[ IDEMPOTENT RETRY ]`: Duplicate request replay via UUID key (`idempotency_cache`).
  - `[ CAS CONFLICT ]`: Optimistic lock version collision on stock (`optimistic_lock_cas`).
- **Dedicated Bottom Action: `[ ℹ SCENARIO INFO ]`**:
  - Located in the bottom control grid alongside Play, Step, Inspect Wire, and Reset.
  - Tapping opens a tactile modal with:
    - **Header**: Scenario Name and context.
    - **What Happens**: Distributed system mechanics and execution flow.
    - **Expected Outcome**: Hop progression, halting node (e.g. Node 4 Backend), and status.
    - **Telemetry to Observe**: Specific headers, query times, and wire data.
    - **Dismissal**: `[ ✕ ]` button and backdrop tap dismiss.

### 4.2 Lab Controls & Interactive Configuration
The application exposes a tactile Lab Controls interface allowing engineers to select scenario presets, customize infrastructure parameters, and persist their custom settings per scenario:
- **Scenario Presets**: Fast-selection pills for standard flows (`201 Happy Path`, `401 / 403 Auth`, `429 Rate Limit`, `504 DB Timeout`, `Slow Query`, `Idempotency`, `409 CAS Conflict`).
- **Interactive Toggles & Parameters**:
  - `rateLimiterEnabled: boolean` (Token Bucket capacity: 5, refill: 1 token/sec)
  - `userRole: "viewer" | "member" | "admin"` (controls RBAC mutation permissions)
  - `queryLatencyMode: "normal" | "lag"` (15ms vs 1200ms simulated database execution)
  - `concurrencyMode: "standard" | "idempotent" | "cas"` (tests UUID replay or optimistic locking)
  - `networkStatus: "online" | "offline"` (validates local persistence fallback)
- **Configuration Persistence Actions**:
  - `[ 💾 SAVE CONFIG ]`: Persists the current parameter overrides for the active scenario into local storage under `savedScenarioConfigs[scenarioId]`. Displays a temporary retro `CONFIG SAVED` confirmation badge.
  - `[ ↺ RESET TO DEFAULT ]`: Clears the custom saved configuration for the active scenario, restoring factory defaults.
  - **Dynamic Synchronization**: Switching scenarios via the dropdown automatically checks for user-saved overrides and applies them to the toggles. This alters the data RequestFlow saves without losing historical device data, fulfilling the CloudCrane challenge requirement.

### 4.2 Scenario Definition Schema
Every scenario conforms to the following schema:

```typescript
export interface ScenarioDefinition {
  id: string; // '201-created', '401-unauthorized', '403-forbidden', '429-ratelimit', '504-timeout', 'slow-query', 'idempotency-replay', '409-conflict'
  code: string; // '201', '401', '403', '429', '504', '200', '409'
  name: string;
  summary: string;
  description: string; // Comprehensive educational guidance explaining distributed system behavior, expected response, and observation targets
  haltNode: number; // Node index where downstream travel ends (0..5)
  resultStatus: "HALTED_SUCCESS" | "HALTED_ERROR";
  stages: Record<number, NodeTelemetry>;
}
```

### Scenario Presets & Educational Guidance

1. **`201 Created` (Order Creation Happy Path)**:
   - **Guidance**: *"Standard end-to-end checkout flow. The client sends a valid request with authentication, passes the LB, gateway, and auth middleware, and successfully commits an order transaction to the database."*
   - Downstream: `client (0)` $\to$ `dns_tls (1)` $\to$ `lb (2)` $\to$ `gateway (3)` $\to$ `backend (4)` $\to$ `database (5)`.
   - Halts at: Node 5 (Database creates row `orders#8912`).
   - Upstream: Node 5 $\to$ Node 4 $\to$ Node 3 $\to$ Node 2 $\to$ Node 1 $\to$ Node 0 (`HTTP/1.1 201 Created`).

2. **`401 Unauthorized` (Missing / Expired Bearer Token)**:
   - **Guidance**: *"Demonstrates authentication boundary rejection. The request passes the LB and Gateway but reaches Node 4 (Backend / Auth Controller) where JWT verification fails due to an expired or missing token; execution halts immediately before touching the database."*
   - Downstream: `client (0)` $\to$ `dns_tls (1)` $\to$ `lb (2)` $\to$ `gateway (3)` $\to$ `backend (4)`.
   - Halts at: Node 4 (Auth middleware rejects expired/missing JWT; database is never reached).
   - Upstream: Node 4 $\to$ Node 3 $\to$ Node 2 $\to$ Node 1 $\to$ Node 0 (`HTTP/1.1 401 Unauthorized`).

3. **`403 Forbidden` (RBAC Permission Denied)**:
   - **Guidance**: *"Demonstrates role-based authorization denial. The JWT token is valid (authenticated), but the user role ('viewer') lacks permission to mutate resources ('POST /checkout' requires 'member' or 'admin'). Halts at Node 4 with status 403."*
   - Downstream: `client (0)` $\to$ `dns_tls (1)` $\to$ `lb (2)` $\to$ `gateway (3)` $\to$ `backend (4)`.
   - Halts at: Node 4 (RBAC role check halts before database).
   - Upstream: Node 4 $\to$ Node 3 $\to$ Node 2 $\to$ Node 1 $\to$ Node 0 (`HTTP/1.1 403 Forbidden`).

4. **`429 Too Many Requests` (Token Bucket Rate Limiting)**:
   - **Guidance**: *"Demonstrates perimeter throttling at the API Gateway. Rapid bursts exhaust the gateway's token bucket capacity ($tokens < 1$). Halts at Node 3, returning 429 with 'Retry-After: 1' without consuming backend compute or touching the database."*
   - Downstream: `client (0)` $\to$ `dns_tls (1)` $\to$ `lb (2)` $\to$ `gateway (3)`.
   - Halts at: Node 3 (API Gateway rate limiter).
   - Upstream: Node 3 $\to$ Node 2 $\to$ Node 1 $\to$ Node 0 (`HTTP/1.1 429 Too Many Requests`).

5. **`504 Gateway Timeout` (Database Deadlock / SLA Exceeded)**:
   - **Guidance**: *"Demonstrates upstream proxy timeout. The query blocks on an uncommitted exclusive row lock in PostgreSQL. When duration exceeds the 5000ms gateway SLA threshold, the gateway terminates the socket with 504."*
   - Downstream: `client (0)` $\to$ `dns_tls (1)` $\to$ `lb (2)` $\to$ `gateway (3)` $\to$ `backend (4)` $\to$ `database (5)`.
   - Halts at: Node 5 (Query exceeds $5000\text{ms}$ lock threshold).
   - Upstream: Gateway terminates connection early $\to$ Node 2 $\to$ Node 1 $\to$ Node 0 (`HTTP/1.1 504 Gateway Timeout`).

6. **`Slow Query Latency` (Degraded Database Performance)**:
   - **Guidance**: *"Models a database disk I/O bottleneck or unindexed full-table scan. The request completes successfully with 200 OK, but exhibits degraded round-trip latency (1200ms vs 15ms) with latency warning headers."*
   - Downstream: Traverses all nodes `0` through `5`.
   - Latency: Node 5 injects simulated $1200\text{ms}$ execution latency.
   - Upstream: Returns full path with header `X-Query-Time: 1200ms`.

7. **`Idempotency Replay` (Client-Side UUID Deduplication `200 OK`)**:
   - **Guidance**: *"Demonstrates duplicate request protection using UUID idempotency keys. Repeated submissions with the same key return the cached response immediately from the gateway without re-executing backend or DB."*
   - Downstream: `client (0)` $\to$ `dns_tls (1)` $\to$ `lb (2)` $\to$ `gateway (3)`.
   - Halts at: Node 3 (Gateway cache hit on `Idempotency-Key`).
   - Upstream: Node 3 $\to$ Node 2 $\to$ Node 1 $\to$ Node 0 (`HTTP/1.1 200 OK` with `X-Idempotency-Status: REPLAY`).

8. **`409 Conflict` (Optimistic Locking & CAS Version Conflict)**:
   - **Guidance**: *"Models a race condition when two concurrent requests attempt to purchase the final inventory item using Compare-And-Swap (CAS) version checks, resulting in 409 Conflict."*
   - Downstream: `client (0)` $\to$ `dns_tls (1)` $\to$ `lb (2)` $\to$ `gateway (3)` $\to$ `backend (4)` $\to$ `database (5)`.
   - Halts at: Node 5 (Database write statement `WHERE id = 1 AND version = 1` affects 0 rows).
   - Upstream: Node 5 $\to$ Node 4 $\to$ Node 3 $\to$ Node 2 $\to$ Node 1 $\to$ Node 0 (`HTTP/1.1 409 Conflict`).

*(Deferred to future milestones: D3 Atomic Transaction Rollback 500, D4 Schema Migration Lock 503).*

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

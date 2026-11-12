# Living Functional & Wire Protocol Specification

## 1. Purpose & Product Intent
**RequestFlow** is an interactive, mobile-first learning laboratory deployed on CloudCrane. It simulates the end-to-end journey of an HTTP request through a multi-node backend architecture.

## 2. Pipeline Nodes
The request pipeline consists of 6 sequential stages:
1. **Node 0 (Client)**: Request dispatch, headers, query parameters, method (`POST /api/v1/checkout`).
2. **Node 1 (DNS & TLS 1.3)**: Domain resolution, handshake establishment, edge connection.
3. **Node 2 (Load Balancer)**: L4/L7 traffic routing, round-robin target selection, health checks.
4. **Node 3 (API Gateway)**: Perimeter security, Token Bucket rate-limiting (429), Idempotency key cache.
5. **Node 4 (Backend / Auth Controller)**: JWT verification (401), RBAC role checks (403), business logic.
6. **Node 5 (Database / Persistence)**: ACID transactions, pool allocation, read/write latency, CAS locks.

## 3. Scenarios & Wire Contracts

> **Mandatory Field & Presentation**: Every scenario definition in `src/core/scenarios.js` must implement a user-facing `description` property (string). 
> **Selection & Info UX**: Scenarios are selected using descriptive, semantic behavioral names (e.g. `[ Happy Path ]`, `[ Expired Token ]`, `[ RBAC Restriction ]`, `[ Rate Limit ]`, `[ DB Timeout ]`)—**never raw HTTP status codes**. A dedicated `[ ℹ SCENARIO INFO ]` button in the bottom mechanical control bar opens a separate modal explaining what happens in the active scenario, its distributed system mechanics, expected traversal, and observation hints.

### 3.1 Scenario Selection & Description Modal UX

#### 1. Semantic Scenario Dropdown Selector (No HTTP Status Codes)
The scenario is selected via a prominent retro-styled tactile dropdown button:
`[ SCENARIO: Happy Path (Standard Checkout) ▾ ]`.
Tapping opens a categorized picker sheet listing operational scenarios by domain:
- **Authentication & AuthZ**: `Happy Path`, `Expired Bearer Token`, `RBAC Role Restriction (Viewer)`.
- **Perimeter & Gateway**: `Token Bucket Rate Limiting (429)`, `Idempotency Replay (UUID Cache Hit)`.
- **Database & Persistence**: `DB Connection Pool Timeout (504)`, `Slow Query Latency (Degraded)`, `CAS Optimistic Concurrency Conflict (409)`.
Selecting any item immediately updates the active scenario and synchronizes the underlying Lab Controls parameters.

#### 2. Dedicated Bottom Action: `[ ℹ SCENARIO INFO ]`
In the bottom controls grid alongside `[ ▶ PLAY ]`, `[ ⏭ STEP FWD ]`, `[ 🔍 INSPECT WIRE ]`, and `[ ↺ RESET ]`:
- Button label: `[ ℹ SCENARIO INFO ]` (or `[ ℹ WHAT HAPPENS? ]`).
- Touch target: $\ge 44\times 44\text{px}$.
- Tap Action: Opens a dedicated retro-tech modal displaying:
  - **Scenario Title**: E.g., `RBAC Role Restriction (Checkout Denial)`
  - **What Happens**: Comprehensive explanation of the distributed system behavior.
  - **Expected Outcome**: Route traversal, exact halting node (e.g. Node 4 Backend Controller), and response status.
  - **What to Observe**: Specific telemetry indicators in the pipeline and wire inspector.
  - **Dismissal**: `[ ✕ CLOSE ]` button and backdrop tap dismiss.

### 3.2 Lab Controls & Interactive Configuration UI

The application provides a slide-up "Lab Controls" drawer/toolbar where users can select pre-built scenario presets or manually toggle individual infrastructure parameters:

```
┌────────────────────────────────────────────────────────┐
│  RequestFlow Lab Controls                              │
├────────────────────────────────────────────────────────┤
│  Scenario Presets:                                     │
│  [ Happy Path ] [ Rate Limit ] [ RBAC Role ] [ DB Lag ]│
│                                                        │
│  Interactive Toggles:                                  │
│  • Token Bucket Rate Limiter : [ ON  | off ] (Cap: 5)  │
│  • User Role                 : [ Viewer | Member | Admin ]
│  • DB Query Latency          : [ Normal | 1.5s Lag ]   │
│  • Concurrency Control       : [ Idempotent | CAS ]    │
│                                                        │
│  Configuration Actions:                                │
│  [ 💾 SAVE CONFIG ]       [ ↺ RESET TO DEFAULT ]       │
└────────────────────────────────────────────────────────┘
```

#### Control State Specifications:
- **Preset Selector**: Quick-select buttons for standard test scenarios (`Happy Path`, `Rate Limit 429`, `Auth RBAC 403`, `DB Lag 504`).
- **Token Bucket Rate Limiter**: Toggle `ON` (capacity: 5 tokens, refill: 1 token/sec) or `OFF` (simulates **Scenario C: 429 Too Many Requests**).
- **User Role**: Toggle between `Viewer` (read-only), `Member` (standard checkout), and `Admin` (full access) (simulates **Scenario B2: 403 Forbidden**).
- **DB Query Latency**: Switch between `Normal` (15ms simulated query) and `1.5s Lag` (simulates **Scenario D: Latency & 504 Timeout**).
- **Concurrency Control**: Toggle between `Idempotent` (deduplication via `Idempotency-Key`, **Scenario E1**) and `CAS` (optimistic lock conflict detection, **Scenario E2**).

#### Custom Scenario Configuration Persistence:
- **Per-Scenario Persistence**: Users can tweak parameters (e.g. rate limiter threshold, user role, latency) for any specific scenario and tap **`[ 💾 SAVE CONFIG ]`**.
- **Action Semantics**:
  - `[ 💾 SAVE CONFIG ]`: Saves the active parameter configuration under the scenario's unique ID in local storage (`savedScenarioConfigs[scenarioId]`). Displays a temporary confirmation badge (`CONFIG SAVED`).
  - `[ ↺ RESET TO DEFAULT ]`: Clears the custom saved configuration for the active scenario, restoring the baseline default parameters.
- **Auto-Restoration on Selection**: When selecting any scenario from the dropdown, RequestFlow checks `savedScenarioConfigs[scenarioId]`. If a saved configuration exists, it restores those parameters; otherwise, it applies the scenario's default presets.
- **Assignment Constraint Satisfaction**: Altering the storage schema to persist per-scenario configurations directly fulfills the CloudCrane challenge requirement: *"At least one change should alter the data it saves, without losing what’s already on your phone"*.

---

### Scenario A: Happy Path (`order_create`)
- **Description**: *"Standard end-to-end checkout flow. The client sends a valid request with authentication, passes the LB, gateway, and auth middleware, and successfully commits an order transaction to the database."*
- **HTTP Method & Path**: `POST /api/v1/checkout`
- **Expected Status**: `201 Created`
- **Traversal**: All nodes 0 through 5 succeed (`passed`).
- **Telemetry**: Calculates and records full round-trip latency.

### Scenario B: Auth & Permission Failure

#### B1: Missing / Expired Token (`401 Unauthorized`)
- **Description**: *"Models authentication failure. The client request carries an expired or malformed Bearer token, causing the Backend/Auth Service to reject the request with 401 before any database queries execute."*
- **Traversal**: Progresses through Nodes 0, 1, 2, 3, and strictly halts at **Node 4 (Backend Controller / Auth)**.
- **Node 5**: Remained unreached / skipped.
- **Wire Payload**:
  ```json
  { "error": "invalid_or_expired_token", "code": 401 }
  ```

#### B2: RBAC Role Restriction (`403 Forbidden`)
- **Description**: *"Models authorization restriction. The client is authenticated with a valid identity, but holds a read-only 'Viewer' role that lacks permission to execute the mutating checkout action."*
- **HTTP Method & Path**: `POST /api/v1/checkout`
- **User Role**: `Viewer`
- **Expected Status**: `403 Forbidden`
- **Traversal**: Reaches **Node 4 (Backend Controller / Auth)** and halts with permission denial before touching the database.
- **Allowed Roles for Mutation**: `Admin`, `Member`.
- **Wire Payload**:
  ```json
  {
    "error": "insufficient_permissions",
    "code": 403,
    "required_roles": ["member", "admin"],
    "granted_role": "viewer"
  }
  ```

### Scenario C: Rate Limiting (`429 Too Many Requests`)
- **Description**: *"Demonstrates API Gateway traffic protection using a Token Bucket algorithm. When rapid bursts exhaust available bucket tokens, subsequent requests are dropped at the perimeter."*
- **Node**: Halts at **Node 3 (API Gateway)** when Token Bucket is empty ($tokens < 1$).
- **Expected Status**: `429 Too Many Requests`
- **Headers**: `Retry-After: 1`

### Scenario D: Database Failures & Latency

#### D1: Pool Exhaustion & Gateway Timeout (`504 Gateway Timeout`)
- **Description**: *"Simulates database connection pool exhaustion. Query execution hangs beyond the gateway's timeout SLA (5000ms), causing the reverse proxy to sever the connection with 504."*
- **Expected Status**: `504 Gateway Timeout`
- **Traversal**: Progresses through Nodes 0, 1, 2, 3, 4, and strictly halts with failure at **Node 5 (Database)**.
- **Wire Payload**: Simulates connection pool exhaustion where query execution exceeds the 5000ms SLA gateway threshold.

#### D2: Slow Query Latency (Degraded Performance)
- **Description**: *"Models database disk I/O bottleneck or unindexed full-table scan. The request completes successfully with 200 OK, but exhibits degraded round-trip latency (1200ms vs 15ms)."*
- **Traversal**: All nodes succeed, but Node 5 injects simulated latency:
  - `Fast`: 15ms
  - `Degraded`: 1200ms (ticking timer badge on node, status `200 OK` with latency alert header `X-Query-Time: 1200ms`).

#### D3: [DEFERRED - SIMULATE LATER] Atomic Transaction Rollback (`500 Internal Server Error`)
> *Note: Difficult to simulate cleanly in initial MVP; deferred to a future lab milestone.*
- **Description**: *"Simulates an unhandled failure in a multi-step transaction (e.g., credit card charge fails after inventory lock). Uncommitted state rolls back atomically."*
- **Context**: Multi-statement order creation:
  1. `Deduct Stock` (Success)
  2. `Charge Payment Card` (Payment Declined / Exception)
  3. `Insert Order Record` (Aborted)
- **Engine Behavior**: Uncommitted state reverts to original values; the database logs `TRANSACTION ROLLBACK`.
- **Wire Payload**:
  ```json
  { "error": "transaction_aborted", "rolled_back": true, "code": 500 }
  ```

#### D4: [DEFERRED - SIMULATE LATER] Schema Migration Lock / DDL Conflict (`503 Service Unavailable`)
> *Note: Difficult to simulate cleanly in initial MVP; deferred to a future lab milestone.*
- **Description**: *"Simulates an exclusive DDL lock during an active database schema migration, rendering the table temporarily unavailable for queries."*
- **Context**: Table under active exclusive lock due to asynchronous schema migration.
- **Expected Status**: `503 Service Unavailable`
- **Wire Payload**:
  ```json
  { "error": "table_locked_migration_in_progress", "retry_after": 2 }
  ```

---

### Scenario E: Concurrency Scenarios

#### E1: Client-Side Idempotency Replay (`200 OK - Cached Replay`)
- **Description**: *"Demonstrates duplicate request protection using UUID idempotency keys. Repeated submissions with the same key return the cached response immediately from the gateway without re-executing backend logic."*
- **Mechanism**: Client sends request with header `Idempotency-Key: <UUID>`.
- **First Request**: Executes full pipeline to Database (`201 Created`), writes response to Gateway idempotency store.
- **Duplicate Request (Same Key)**: Halts immediately at **Node 3 (API Gateway)** without touching Backend or Database.
- **Headers Returned**:
  - `X-Idempotency-Status: REPLAY`
  - `X-Original-Request-Id: <UUID>`
- **Expected Status**: `200 OK` (returns identical cached payload).

#### E2: Database Concurrency via CAS / Optimistic Locking (`409 Conflict`)
- **Description**: *"Models a race condition when two concurrent requests attempt to purchase the final inventory item using Compare-And-Swap (CAS) version checks, resulting in 409 Conflict."*
- **Mechanism**: Compare-And-Swap using versioned records (`WHERE id = ? AND version = ?`).
- **Setup**: Two concurrent requests read `stock: 1, version: 1`.
  - **Request 1**: Executes `UPDATE items SET stock = 0, version = 2 WHERE id = 1 AND version = 1` $\to$ **1 row affected (Success, 201)**.
  - **Request 2**: Attempts same query with stale `version: 1` $\to$ **0 rows affected**.
- **Expected Status**: `409 Conflict`
- **Traversal**: Traverses through Node 4 to **Node 5 (Database)** and fails at write-commit stage.
- **Wire Payload**:
  ```json
  {
    "error": "optimistic_lock_conflict",
    "code": 409,
    "message": "Resource was modified by another concurrent transaction. Please retry."
  }
  ```

---

## 4. Data Storage Contract (CloudCrane `blueprint.json`)
- **Key**: `requestflow.state`
- **v1 Schema (Initial MVP)**:
  ```json
  {
    "version": 1,
    "pings": 5,
    "lastPingTime": "2026-11-12T10:00:00.000Z"
  }
  ```
- **v2 Schema (Backward-Compatible Multi-Scenario)**:
  ```json
  {
    "version": 2,
    "totalRuns": 5,
    "scenarioRuns": {
      "201-created": 5,
      "401-unauthorized": 0,
      "504-timeout": 0
    },
    "lastRunTime": "2026-11-12T10:00:00.000Z",
    "inspectedNodeHistory": [0, 1]
  }
  ```
- **v3 Schema (Per-Scenario Configuration & Analytics)**:
  ```json
  {
    "version": 3,
    "totalRuns": 15,
    "scenarioRuns": {
      "201-created": 8,
      "401-unauthorized": 2,
      "403-forbidden": 1,
      "429-ratelimit": 2,
      "504-timeout": 1,
      "slow-query": 1,
      "idempotency-replay": 0,
      "409-conflict": 0
    },
    "lastRunTime": "2026-11-12T16:00:00.000Z",
    "inspectedNodeHistory": [0, 1, 2, 3, 4, 5],
    "savedScenarioConfigs": {
      "rbac_restriction": {
        "userRole": "viewer",
        "rateLimiter": true,
        "latency": "normal",
        "concurrency": "idempotent"
      }
    },
    "themePreference": "CRT_DARK",
    "latencyStats": {
      "avgDnsMs": 4,
      "avgTlsMs": 38,
      "avgDbMs": 8
    }
  }
  ```
- **Zero-Loss Data Evolution Guarantee**:
  - Upgrading from v1 or v2 to v3 strictly adheres to the CloudCrane mandate: *"At least one change should alter the data it saves, without losing what’s already on your phone"*.
  - When a device with existing v1 or v2 data opens the v3 application, `migrateV1ToV2` and `migrateV2ToV3` seamlessly carry forward `totalRuns`, `lastRunTime`, and `inspectedNodeHistory`, initializing `savedScenarioConfigs: {}` without resetting or losing any prior data.

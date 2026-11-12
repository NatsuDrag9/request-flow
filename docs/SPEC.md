# Living Functional & Wire Protocol Specification

## 1. Purpose & Product Intent
**RequestFlow** is an interactive, mobile-first learning laboratory deployed on CloudCrane. It simulates the end-to-end journey of an HTTP request through a multi-node backend architecture.

## 2. Pipeline Nodes
The request pipeline consists of 5 sequential stages:
1. **Node 0 (Client)**: Request dispatch, headers, query parameters, method (`POST /api/v1/checkout`).
2. **Node 1 (CDN / Edge)**: Cache inspection, edge termination, geolocation tagging.
3. **Node 2 (API Gateway)**: TLS termination, rate-limiting (Token Bucket), routing.
4. **Node 3 (Auth Service)**: Token verification, session validation, permission checks.
5. **Node 4 (Database / Persistence)**: Query execution, transaction locking, read/write latency.

## 3. Scenarios & Wire Contracts

### Scenario A: Happy Path (`order_create`)
- **HTTP Method & Path**: `POST /api/v1/checkout`
- **Expected Status**: `201 Created`
- **Traversal**: All nodes 0 through 4 succeed (`passed`).
- **Telemetry**: Calculates and records full round-trip latency.

### Scenario B: Auth & Permission Failure

#### B1: Missing / Expired Token (`401 Unauthorized`)
- **Traversal**: Progresses through Nodes 0, 1, 2, and strictly halts at **Node 3 (Auth Service)**.
- **Node 4**: Remained unreached / skipped.
- **Wire Payload**:
  ```json
  { "error": "invalid_or_expired_token", "code": 401 }
  ```

#### B2: RBAC Role Restriction (`403 Forbidden`)
- **HTTP Method & Path**: `POST /api/v1/checkout`
- **User Role**: `Viewer`
- **Expected Status**: `403 Forbidden`
- **Traversal**: Reaches **Node 3 (Auth Service)** and halts with permission denial before touching the database.
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
- **Node**: Halts at **Node 2 (API Gateway)** when Token Bucket is empty ($tokens < 1$).
- **Expected Status**: `429 Too Many Requests`
- **Headers**: `Retry-After: 1`

### Scenario D: Database Failures & Latency

#### D1: Pool Exhaustion & Gateway Timeout (`504 Gateway Timeout`)
- **Expected Status**: `504 Gateway Timeout`
- **Traversal**: Progresses through Nodes 0, 1, 2, 3, and strictly halts with failure at **Node 4 (Database)**.
- **Wire Payload**: Simulates connection pool exhaustion where query execution exceeds the 5000ms SLA gateway threshold.

#### D2: Slow Query Latency (Degraded Performance)
- **Traversal**: All nodes succeed, but Node 4 injects simulated latency:
  - `Fast`: 15ms
  - `Degraded`: 1200ms (ticking timer badge on node, status `200 OK` with latency alert header `X-Query-Time: 1200ms`).

#### D3: [DEFERRED - SIMULATE LATER] Atomic Transaction Rollback (`500 Internal Server Error`)
> *Note: Difficult to simulate cleanly in initial MVP; deferred to a future lab milestone.*
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
- **Context**: Table under active exclusive lock due to asynchronous schema migration.
- **Expected Status**: `503 Service Unavailable`
- **Wire Payload**:
  ```json
  { "error": "table_locked_migration_in_progress", "retry_after": 2 }
  ```

---

### Scenario E: Concurrency Scenarios

#### E1: Client-Side Idempotency Replay (`200 OK - Cached Replay`)
- **Mechanism**: Client sends request with header `Idempotency-Key: <UUID>`.
- **First Request**: Executes full pipeline to Database (`201 Created`), writes response to Gateway idempotency store.
- **Duplicate Request (Same Key)**: Halts immediately at **Node 2 (API Gateway)** without touching Auth or Database.
- **Headers Returned**:
  - `X-Idempotency-Status: REPLAY`
  - `X-Original-Request-Id: <UUID>`
- **Expected Status**: `200 OK` (returns identical cached payload).

#### E2: Database Concurrency via CAS / Optimistic Locking (`409 Conflict`)
- **Mechanism**: Compare-And-Swap using versioned records (`WHERE id = ? AND version = ?`).
- **Setup**: Two concurrent requests read `stock: 1, version: 1`.
  - **Request 1**: Executes `UPDATE items SET stock = 0, version = 2 WHERE id = 1 AND version = 1` $\to$ **1 row affected (Success, 201)**.
  - **Request 2**: Attempts same query with stale `version: 1` $\to$ **0 rows affected**.
- **Expected Status**: `409 Conflict`
- **Traversal**: Traverses to **Node 4 (Database)** and fails at write-commit stage.
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
- **v1 Schema**:
  ```json
  {
    "version": 1,
    "totalRequests": 5,
    "inspectedStages": [0, 1]
  }
  ```
- **v2 Schema (Backward-Compatible)**:
  ```json
  {
    "version": 2,
    "totalRequests": 5,
    "inspectedStages": [0, 1],
    "labSettings": {
      "rateLimitEnabled": true,
      "cacheEnabled": true
    }
  }
  ```
- **Promise**: Upgrading from v1 to v2 must preserve all previously logged counts and inspected stages.

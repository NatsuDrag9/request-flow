# RequestFlow — Scenario Testing & Lab Experimentation Guide

This guide provides step-by-step testing workflows for all **8 distributed systems scenarios** in RequestFlow, along with **1–2 LAB parameter variables** for each scenario to observe live dynamic simulation overrides.

---

## Quick Reference: The 6-Node Architecture

Every scenario traverses an end-to-end distributed system pipeline:

```
[01: Client] ──▶ [02: DNS & TLS 1.3] ──▶ [03: Load Balancer] ──▶ [04: API Gateway] ──▶ [05: Backend Controller] ──▶ [06: Database (PostgreSQL)]
```

- **Downstream Traversal**: Request packets move forward from Station 01 toward Station 06 until reaching either a successful commit or an error halt node.
- **Upstream Traversal**: Once completed or rejected, the response status packet returns upstream back to Station 01.
- **Wire Inspector (`[ 🔍 INSPECT WIRE ]`)**: Tap any station at any time to inspect protocol headers, JWT payloads, rate limit remaining tokens, or SQL transactions.
- **Scenario Guidance (`[ ℹ SCENARIO INFO ]`)**: Tap this button to slide open the bottom guidance card explaining what happens, expected status, and observation targets. When LAB parameters are modified, a pulsing amber beacon illuminates on this button and the card dynamically updates.

---

## 1. Happy Path (Standard Checkout)

- **Scenario ID**: `order_create`
- **Baseline Status**: `201 Created` (`HALTED_SUCCESS`)
- **Baseline Halt Station**: Station 06 (Database)
- **Concept**: Clean end-to-end traversal where authentication, perimeter rate limiting, authorization, and database transaction all succeed.

### Baseline Test Steps
1. Tap the top dropdown: **`SCENARIO: [ Happy Path ▾ ]`**.
2. Tap **`[ ▶ PLAY AUTO ]`** or step forward with **`[ ⏭ STEP FWD ]`**.
3. **Observe**: The request flows through all 6 stations. Station 06 executes `BEGIN; INSERT INTO orders ... COMMIT;` and the response packet returns upstream to Station 01 with `201_OK`.

### LAB Parameter Experiments
- **Experiment 1: Token Bucket Rate Limiter ➔ `OFF (Burst 429)`**
  1. Open **`[ ⚙ LAB ]`** drawer.
  2. Under *Token Bucket Rate Limiter*, click **`OFF (Burst 429)`**.
  3. Notice the amber beacon dot on **`[ ℹ SCENARIO INFO ]`**.
  4. Run the simulation (`[ ▶ PLAY AUTO ]`):
     - **Result**: Request halts early at **Station 04 (API Gateway)** with **`429_ERR`**.
     - **Security Insight**: Stations 05 and 06 show `UNREACHED`, proving perimeter rate limiting protects backend compute and database locks from burst traffic exhaustion.
- **Experiment 2: User Role ➔ `Viewer (403)`**
  1. In **`[ ⚙ LAB ]`**, turn Rate Limiter `ON` and set User Role to **`Viewer (403)`**.
  2. Run the simulation:
     - **Result**: Request passes Station 04 and halts at **Station 05 (Backend)** with **`403_ERR`**.
     - **Security Insight**: Station 06 remains `UNREACHED`, demonstrating RBAC security guards prevent read-only roles from mutating database state.

---

## 2. Expired Bearer Token

- **Scenario ID**: `auth_token_expired`
- **Baseline Status**: `401 Unauthorized` (`HALTED_ERROR`)
- **Baseline Halt Station**: Station 05 (Backend Controller)
- **Concept**: Authentication failure. The client attaches a stale or expired JWT token (`exp < now`).

### Baseline Test Steps
1. Open scenario dropdown and select **`Expired Bearer Token`** (`401`).
2. Tap **`[ ▶ PLAY AUTO ]`**.
3. **Observe**: Passes Stations 01..04. At Station 05, JWT auth middleware throws `TokenExpiredError`.
4. Status badge turns red with **`401_ERR`**. Station 06 (Database) stays `UNREACHED`.
5. Tap **`[ 🔍 INSPECT WIRE ]`** at Station 05: Observe `{ "error": "invalid_or_expired_token", "code": 401 }`.

### LAB Parameter Experiments
- **Experiment 1: Token Bucket Rate Limiter ➔ `OFF (Burst 429)` (Defense-in-Depth)**
  1. Open **`[ ⚙ LAB ]`** and click **`OFF (Burst 429)`**.
  2. Run the simulation:
     - **Result**: The request halts at **Station 04 (API Gateway)** with `429_ERR` *before* reaching Station 05.
     - **Security Insight**: Demonstrates layered security. Perimeter gateways drop unauthenticated floods before the system spends expensive CPU cycles verifying cryptographic signatures.
- **Experiment 2: Concurrency Control ➔ `CAS Lock (409)`**
  1. In **`[ ⚙ LAB ]`**, toggle Concurrency to **`CAS Lock (409)`**.
  2. Run the simulation:
     - **Result**: Remains halted at Station 05 with `401_ERR` because authentication failure preempts database execution.

---

## 3. RBAC Role Restriction (Viewer)

- **Scenario ID**: `rbac_restriction`
- **Baseline Status**: `403 Forbidden` (`HALTED_ERROR`)
- **Baseline Halt Station**: Station 05 (Backend Controller)
- **Concept**: Authorization failure. The user has a valid identity, but holds a read-only `viewer` role lacking mutation privileges.

### Baseline Test Steps
1. Select **`RBAC Role Restriction (Viewer)`** (`403`).
2. Tap **`[ ▶ PLAY AUTO ]`**.
3. **Observe**: Reaches Station 05. JWT signature passes, but `rbacPolicy` fails (`viewer` rejected against required roles `['member', 'admin']`).
4. Halts with **`403_ERR`**. Station 06 (Database) remains `UNREACHED`.

### LAB Parameter Experiments
- **Experiment 1: User Role ➔ `Admin` or `Member` (Privilege Elevation)**
  1. Open **`[ ⚙ LAB ]`** and click **`Admin`** (or **`Member`**).
  2. Notice the amber beacon dot on **`[ ℹ SCENARIO INFO ]`**; tap it to verify the guidance updates to describe role elevation.
  3. Run the simulation:
     - **Result**: The request bypasses the RBAC rejection, passes to Station 06 (Database), and commits with **`201_OK`**.
     - **Observation**: In Station 05 Wire Inspector, verify `USER_ROLE: admin` and `rbacPolicy: PASSED`.
- **Experiment 2: Concurrency Control ➔ `CAS Lock (409)` (after elevating to Admin)**
  1. With User Role set to `Admin`, set Concurrency Control to **`CAS Lock (409)`**.
  2. Run the simulation:
     - **Result**: The request passes RBAC at Station 05 but now encounters an optimistic lock race at Station 06, returning `409_ERR`.

---

## 4. Token Bucket Rate Limiter (0/5 Capacity)

- **Scenario ID**: `token_bucket_empty`
- **Baseline Status**: `429 Too Many Requests` (`HALTED_ERROR`)
- **Baseline Halt Station**: Station 04 (API Gateway)
- **Concept**: Perimeter traffic shaping. A sudden burst exhausts the bucket tokens (0/5 capacity remaining).

### Baseline Test Steps
1. Select **`Token Bucket Rate Limiter (0/5 Burst Capacity)`** (`429`).
2. Tap **`[ ▶ PLAY AUTO ]`**.
3. **Observe**: Traverses Stations 01..03. Halts strictly at **Station 04 (API Gateway)** with **`429_ERR`**.
4. Stations 05 and 06 remain `UNREACHED`.
5. Tap **`[ 🔍 INSPECT WIRE ]`** at Station 04: Observe `RATE_LIMIT_REMAINING: 0`, `RETRY_AFTER: 1`, and `ROUTING_RULE: DROP_RATE_LIMIT_EXCEEDED`.

### LAB Parameter Experiments
- **Experiment 1: Token Bucket Rate Limiter ➔ `ON (Cap: 5)` (Replenish Bucket)**
  1. Open **`[ ⚙ LAB ]`** and click **`ON (Cap: 5)`**.
  2. Run the simulation:
     - **Result**: The replenished bucket allows the request through Station 04. It reaches Station 06 (Database) and commits with **`201_OK`**.
     - **Observation**: Station 04 Wire Inspector shows `rateLimitCapacity: 5` and `rateLimitRemaining: 4`.
- **Experiment 2: User Role ➔ `Viewer (403)` (while Rate Limiter is ON)**
  1. With Rate Limiter `ON`, set User Role to **`Viewer (403)`**.
  2. Run the simulation:
     - **Result**: Request passes the perimeter Gateway but halts at Station 05 with `403_ERR`.

---

## 5. Database Connection Pool Exhaustion

- **Scenario ID**: `db_pool_timeout`
- **Baseline Status**: `504 Gateway Timeout` (`HALTED_ERROR`)
- **Baseline Halt Station**: Station 06 (Database)
- **Concept**: Resource starvation. Active pool connections (20/20) are maxed out, causing the query to block on a lock wait exceeding the 5000ms reverse proxy SLA.

### Baseline Test Steps
1. Select **`DB Connection Pool Exhaustion`** (`504`).
2. Tap **`[ ▶ PLAY AUTO ]`**.
3. **Observe**: Traverses all stations to Station 06. The database connection attempt times out at 5021ms (> 5000ms SLA).
4. Returns **`504_ERR`**.
5. Tap **`[ 🔍 INSPECT WIRE ]`** at Station 06: Observe `LOCK_STATUS: LOCK_WAIT_TIMEOUT_EXCEEDED` and `EXEC_TIME: 5021ms`.

### LAB Parameter Experiments
- **Experiment 1: DB Query Latency ➔ `Normal (15ms)` (Clear Pool Bottleneck)**
  1. Open **`[ ⚙ LAB ]`** and click **`Normal (15ms)`**.
  2. Run the simulation:
     - **Result**: Database connection is acquired in 15ms. The query completes cleanly with **`200_OK`** instead of timing out.
- **Experiment 2: Token Bucket Rate Limiter ➔ `OFF (Burst 429)`**
  1. Open **`[ ⚙ LAB ]`** and set Rate Limiter to **`OFF (Burst 429)`**.
  2. Run the simulation:
     - **Result**: The request is dropped at Station 04 with `429_ERR`, preventing an overloaded database from receiving more queries.

---

## 6. Degraded Full Table Scan

- **Scenario ID**: `query_degraded`
- **Baseline Status**: `200 OK` (`HALTED_SUCCESS` with Degraded Latency)
- **Baseline Halt Station**: Station 06 (Database)
- **Concept**: Unindexed sequential query scanning 2.4M rows. Succeeds with high latency (1200ms) and attaches latency warning headers.

### Baseline Test Steps
1. Select **`Degraded Full Table Scan (Unindexed Query)`** (`200`).
2. Tap **`[ ▶ PLAY AUTO ]`**.
3. **Observe**: Traverses all 6 stations. Completes at Station 06 with status **`200_OK`**.
4. Tap **`[ 🔍 INSPECT WIRE ]`** at Station 06:
   - Observe SQL: `EXPLAIN ANALYZE SELECT * FROM order_audit_log WHERE metadata ILIKE '%vintage%';`
   - Observe headers: `X-Query-Time: 1200ms` and `X-Performance-Warning: Full table scan detected`.

### LAB Parameter Experiments
- **Experiment 1: Concurrency Control ➔ `CAS Lock (409)`**
  1. Open **`[ ⚙ LAB ]`** and select **`CAS Lock (409)`**.
  2. Run the simulation:
     - **Result**: In addition to the query scan, a version conflict occurs, halting Station 06 with **`409_ERR`**.
- **Experiment 2: User Role ➔ `Viewer (403)`**
  1. In **`[ ⚙ LAB ]`**, set User Role to **`Viewer (403)`**.
  2. Run the simulation:
     - **Result**: Rejection occurs at Station 05 with `403_ERR`, preventing the slow full table scan from ever executing on the database.

---

## 7. Idempotency Replay (UUID Cache Hit)

- **Scenario ID**: `idempotency_cache`
- **Baseline Status**: `200 OK` (`HALTED_SUCCESS` via Gateway Replay)
- **Baseline Halt Station**: Station 04 (API Gateway)
- **Concept**: Safe network retry. Client resends duplicate `Idempotency-Key` UUID; Gateway returns cached replay response without touching backend or database.

### Baseline Test Steps
1. Select **`Idempotency Replay (UUID Cache Hit)`** (`200`).
2. Tap **`[ ▶ PLAY AUTO ]`**.
3. **Observe**: Traverses Stations 01..03 to **Station 04 (API Gateway)**.
4. Station 04 matches the idempotency cache key in memory and immediately returns **`200_OK`**.
5. Stations 05 and 06 remain `BYPASSED` (green check on Gateway, upstream return to client).
6. Tap **`[ 🔍 INSPECT WIRE ]`** at Station 04: Observe header `X-Idempotency-Status: REPLAY` and `cachedResponse: true`.

### LAB Parameter Experiments
- **Experiment 1: Token Bucket Rate Limiter ➔ `OFF (Burst 429)`**
  1. Open **`[ ⚙ LAB ]`** and set Rate Limiter to **`OFF (Burst 429)`**.
  2. Run the simulation:
     - **Result**: Rate limiter takes precedence at the perimeter filter chain; halts at Station 04 with `429_ERR`.
- **Experiment 2: Concurrency Control ➔ `CAS Lock (409)`**
  1. In **`[ ⚙ LAB ]`**, select **`CAS Lock (409)`**.
  2. Run the simulation:
     - **Result**: Because the request is served from the Gateway cache and never reaches the Database, it completes cleanly with **`200_OK`**, illustrating how idempotency caches shield databases from write contention!

---

## 8. Optimistic Locking Conflict (CAS)

- **Scenario ID**: `optimistic_lock_cas`
- **Baseline Status**: `409 Conflict` (`HALTED_ERROR`)
- **Baseline Halt Station**: Station 06 (Database)
- **Concept**: Concurrent write collision. Another transaction updated inventory version from 1 to 2; stale version check touches 0 rows and aborts.

### Baseline Test Steps
1. Select **`Optimistic Locking Conflict (CAS)`** (`409`).
2. Tap **`[ ▶ PLAY AUTO ]`**.
3. **Observe**: Traverses Stations 01..05 to **Station 06 (Database)**.
4. PostgreSQL executes `UPDATE inventory SET stock = stock - 1, version = version + 1 WHERE id = 402 AND version = 1;`.
5. Because current version is 2, rows affected is `0`, triggering an `OptimisticLockException` and halting with **`409_ERR`**.
6. Tap **`[ 🔍 INSPECT WIRE ]`** at Station 06: Observe `CAS_VERSION: 2`, `ROWS_AFFECTED: 0`, and response body `optimistic_lock_conflict`.

### LAB Parameter Experiments
- **Experiment 1: Concurrency Control ➔ `Idempotent (UUID)` (Resolve Write Collision)**
  1. Open **`[ ⚙ LAB ]`** and click **`Idempotent (UUID)`**.
  2. Run the simulation:
     - **Result**: Row lock is acquired cleanly without version mismatch conflict. Commits with **`201_OK`**.
- **Experiment 2: DB Query Latency ➔ `1.5s Lag`**
  1. In **`[ ⚙ LAB ]`**, set DB Query Latency to **`1.5s Lag`**.
  2. Run the simulation:
     - **Result**: Reaches Station 06, delays by 1500ms, and then fails with version conflict `409_ERR`.

---

## Summary of LAB Controls Matrix

| LAB Parameter | Options | Default in Happy Path | Impacted Station | Effect When Altered |
| :--- | :--- | :--- | :--- | :--- |
| **Token Bucket Rate Limiter** | `ON (Cap: 5)` / `OFF (Burst 429)` | `ON` | Station 04 (API Gateway) | Setting `OFF` drops requests at Station 04 with `429_ERR`; setting `ON` on empty bucket scenario allows traffic through to Database (`201_OK`). |
| **User Role (RBAC Policy)** | `Viewer (403)` / `Member` / `Admin` | `Member` | Station 05 (Backend Controller) | Setting `Viewer` halts mutations at Station 05 with `403_ERR`; elevating to `Admin`/`Member` on `403` scenario permits commit (`201_OK`). |
| **DB Query Latency** | `Normal (15ms)` / `1.5s Lag` | `Normal` | Station 06 (Database) | Setting `1.5s Lag` simulates query contention; setting `Normal` on pool timeout scenario resolves 504 and returns `200_OK`. |
| **Concurrency Control** | `Idempotent (UUID)` / `CAS Lock (409)` | `Idempotent` | Station 06 (Database) | Setting `CAS Lock` triggers version mismatch `409_ERR`; setting `Idempotent` resolves write collisions (`201_OK`). |

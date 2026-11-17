# RequestFlow — Retro-Tech Distributed Systems Lab

[![Quality Score](https://img.shields.io/badge/CloudCrane_Quality_Score-99%2F100-success)](https://requestflow-v0o76jkwr0.cloudcrane.ai/)
[![Tests](https://img.shields.io/badge/Vitest-56%2F56_Passing-brightgreen)](https://github.com/NatsuDrag9/request-flow)
[![Bundle Size](https://img.shields.io/badge/Bundle_Size-108_KB-blue)](dist/index.html)
[![License](https://img.shields.io/badge/Architecture-Zero--Dependency_ESM-orange)](package.json)

**RequestFlow** is an interactive, mobile-first educational laboratory simulating the end-to-end lifecycle of HTTP/1.1 and TLS 1.3 requests across real-world distributed architectures. Built for developers, systems engineers, and students, RequestFlow visualizes how network hops, perimeter security guards, API gateways, auth layers, and database transactions behave under normal, degraded, and malicious operating conditions.

---

## Live Deployments

- **Live Production App**: [https://requestflow-v0o76jkwr0.cloudcrane.ai/](https://requestflow-v0o76jkwr0.cloudcrane.ai/)
- **Private Preview (v41)**: [https://v41--requestflow-v0o76jkwr0.cloudcrane.ai/](https://v41--requestflow-v0o76jkwr0.cloudcrane.ai/)
- **Local Dev Server**: `http://localhost:4173/`

---

## Table of Contents

1. [The 6-Node Distributed Pipeline](#the-6-node-distributed-pipeline)
2. [How to Use the App](#how-to-use-the-app)
   - [Display Modes (Network vs. Sequence)](#display-modes-network-vs-sequence)
   - [Simulation Controls (Play, Step, Reset)](#simulation-controls-play-step-reset)
   - [Wire Protocol Inspector](#wire-protocol-inspector)
   - [Live Experimentation Lab (⚙ LAB)](#live-experimentation-lab--lab)
   - [Dynamic Scenario Guidance (ℹ SCENARIO INFO)](#dynamic-scenario-guidance--scenario-info)
   - [Hardware Theme Switching](#hardware-theme-switching)
3. [Scenario Catalog & Testing Walkthrough](#scenario-catalog--testing-walkthrough)
   - [Scenario 1: Happy Path (Standard Checkout - 201)](#scenario-1-happy-path-standard-checkout---201)
   - [Scenario 2: Expired Bearer Token (401)](#scenario-2-expired-bearer-token---401)
   - [Scenario 3: RBAC Role Restriction (403)](#scenario-3-rbac-role-restriction---403)
   - [Scenario 4: Token Bucket Rate Limiter (429)](#scenario-4-token-bucket-rate-limiter---429)
   - [Scenario 5: DB Connection Pool Timeout (504)](#scenario-5-db-connection-pool-timeout---504)
   - [Scenario 6: Slow Query Latency / Degraded (200)](#scenario-6-slow-query-latency--degraded---200)
   - [Scenario 7: Idempotency Replay Cache (200)](#scenario-7-idempotency-replay-cache---200)
   - [Scenario 8: CAS Optimistic Concurrency Conflict (409)](#scenario-8-cas-optimistic-concurrency-conflict---409)
4. [State Persistence & Schema Migrations](#state-persistence--schema-migrations)
5. [Local Development & Testing](#local-development--testing)
6. [Architecture & Platform Constraints](#architecture--platform-constraints)

---

## The 6-Node Distributed Pipeline

RequestFlow models a production-grade web application topology across 6 distinct architectural stations:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  STATION 01  │ ──▶ │  STATION 02  │ ──▶ │  STATION 03  │
│    Client    │     │ DNS & TLS1.3 │     │Load Balancer │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  STATION 06  │ ◀── │  STATION 05  │ ◀── │  STATION 04  │
│Database (PG) │     │Backend Server│     │ API Gateway  │
└──────────────┘     └──────────────┘     └──────────────┘
```

1. **Station 01: Client (`192.168.1.104`)**
   - Browser / Mobile PWA client constructing HTTP request headers, Bearer JWT credentials, and UUID idempotency keys.
2. **Station 02: DNS & TLS 1.3 (`1.1.1.1 / TLS`)**
   - Resolves domains (`api.cloudcrane.ai`), verifies DNSSEC, and negotiates a 1-RTT cryptographic session using `TLS_AES_256_GCM_SHA384`.
3. **Station 03: Edge Load Balancer (`198.51.100.1`)**
   - L4/L7 ingress distributor evaluating upstream worker health checks, injecting `X-Forwarded-For`, and dispatching round-robin traffic.
4. **Station 04: API Gateway (`10.0.0.1`)**
   - Enforces Token Bucket rate limiting, inspects Redis-backed idempotency caches, applies CORS policies, and injects tracing headers (`X-Trace-Id`).
5. **Station 05: Backend Controller (`10.0.1.25`)**
   - Express/Spring-style middleware stack validating JWT expiration and digital signatures (`RS256`), evaluating RBAC role permissions, and coordinating transactions.
6. **Station 06: Database (`10.0.2.80`)**
   - Deterministic PostgreSQL 16 ACID transaction engine simulating connection pools, row-level locks, serializable isolation, and optimistic concurrency version checks.

---

## How to Use the App

### Display Modes (Network vs. Sequence)
Toggle between two visualization styles at the top of the canvas:
* **`NETWORK` (Isometric 2.5D)**: An interactive 2.5D isometric map rendered via pure SVG. Shows packet propagation along dynamic wire paths with glowing transit halos and responsive touch hitboxes.
* **`SEQUENCE` (Subway Track)**: A linear vertical station diagram ideal for inspecting sequential middleware progression and hop status badges (`PASS`, `FAIL`, `TRANSIT`, `IDLE`).

### Simulation Controls (Play, Step, Reset)
* **`[ ▶ PLAY AUTO ]` / `[ ⏸ PAUSE ]`**: Starts an automated animated traversal with balanced 1000ms hop pacing.
* **`[ ⏭ STEP FWD ]`**: Advances packet propagation by exactly one network link or station for step-by-step inspection.
* **`[ ⏮ STEP BACK ]`**: Reverses the packet to the preceding station to re-verify state.
* **`[ ↺ RESET ]`**: Rewinds the active scenario to Station 01 in the `READY` state.

### Wire Protocol Inspector
* Tap **`[ 🔍 INSPECT WIRE ]`** or tap any station node directly on the network map.
* Opens a bottom drawer with two view modes:
  * **`📖 OVERVIEW`**: High-level station role, architectural description, packet direction (`DOWNSTREAM` vs. `UPSTREAM`), and scenario outcome.
  * **`⚡ WIRE TELEMETRY`**: Exact low-level protocol payloads (HTTP headers, JSON request bodies, TLS session metadata, Token Bucket token counts, SQL queries, and response bodies).
  * **`[ 📋 COPY ]`**: One-tap copy to system clipboard with visual confirmation feedback.

### Live Experimentation Lab (`⚙ LAB`)
Tap **`⚙ LAB`** in the top navigation row to open the live parameters drawer. These controls dynamically intercept the running simulation in real time:

| Lab Control | Options | Distributed Systems Effect |
| :--- | :--- | :--- |
| **Token Bucket Rate Limiter** | `ON (Cap: 5)` \| `OFF (Burst 429)` | Toggles perimeter traffic throttling at Station 04. When `OFF`, requests are dropped with `429 Too Many Requests`. |
| **User Role (RBAC Policy)** | `Viewer (403)` \| `Member` \| `Admin` | Controls caller authorization at Station 05. `Viewer` is forbidden from mutating state; `Member`/`Admin` are allowed. |
| **DB Query Latency** | `Normal (15ms)` \| `1.5s Lag (504/Slow)` | Modifies PostgreSQL execution time. Tests slow query warnings and reverse-proxy timeout cutoffs. |
| **Concurrency Control** | `Idempotent (UUID)` \| `CAS Lock (409)` | Tests race conditions. Toggles between clean safe commits and optimistic locking version mismatches. |

- **`[ 💾 SAVE CONFIG ]`**: Persists customized lab settings for the active scenario into `localStorage`.
- **`[ ↺ RESET CONFIG ]`**: Restores the scenario's default parameters.

### Dynamic Scenario Guidance (`ℹ SCENARIO INFO`)
* Tap **`[ ℹ SCENARIO INFO ]`** to open the scenario explanation card.
* **Dynamic Interception Banner**: Whenever a Lab parameter is modified, a **pulsing amber beacon dot** appears on the button. Opening the card surfaces an active override banner and dynamically updates the **What Happens**, **Expected Traversal**, and **Observation Targets** sections to match the customized behavior.

### Hardware Theme Switching
Tap **`THEME: CRT_DARK` / `THEME: PAPER_LIGHT`** in the header to switch styles:
* **`CRT_DARK`**: Phosphor amber/green vintage computer monitor with glowing accents.
* **`PAPER_LIGHT`**: Warm architectural parchment drawing with crisp engineering linework.

---

## Scenario Catalog & Testing Walkthrough

RequestFlow includes 8 pre-configured scenarios spanning authentication, traffic defense, and database transactions:

### Scenario 1: Happy Path (Standard Checkout - 201)
* **ID**: `order_create` | **Expected Code**: `201 Created` | **Halt Station**: Station 06 (Database)
* **Walkthrough**:
  1. Select **Happy Path** from the scenario dropdown.
  2. Tap `[ ▶ PLAY AUTO ]`.
  3. **Observe**: Request flows through all 6 stations. Station 06 executes `BEGIN; INSERT INTO orders ... COMMIT;` and the response packet returns upstream to Station 01 with `201_OK`.
* **Lab Experiment**:
  * Set *Token Bucket* to **`OFF`** ➔ Re-run. Traversal halts early at Station 04 with `429 Too Many Requests`. Notice Stations 05 and 06 remain `UNREACHED`.

### Scenario 2: Expired Bearer Token (401)
* **ID**: `auth_token_expired` | **Expected Code**: `401 Unauthorized` | **Halt Station**: Station 05 (Backend)
* **Walkthrough**:
  1. Select **Expired Bearer Token**.
  2. Tap `[ ▶ PLAY AUTO ]`.
  3. **Observe**: Traversal passes Stations 01..04. At Station 05, JWT auth middleware throws `TokenExpiredError`. The pipeline halts with `401_ERR`, shielding Station 06 from unauthenticated SQL queries.
* **Lab Experiment**:
  * Set *Token Bucket* to **`OFF`** ➔ Request drops at Station 04 with `429`, proving perimeter rate limits drop bad traffic before auth compute overhead.

### Scenario 3: RBAC Role Restriction (403)
* **ID**: `rbac_restriction` | **Expected Code**: `403 Forbidden` | **Halt Station**: Station 05 (Backend)
* **Walkthrough**:
  1. Select **RBAC Role Restriction (Viewer)**.
  2. Tap `[ ▶ PLAY AUTO ]`.
  3. **Observe**: Token passes authentication at Station 05, but RBAC guard rejects role `viewer` for mutating order action. Returns `403_ERR`; Database is `UNREACHED`.
* **Lab Experiment**:
  * In `[ ⚙ LAB ]`, switch User Role to **`Admin`** ➔ Re-run. Request passes RBAC authorization and commits successfully at Station 06 with `201 Created`.

### Scenario 4: Token Bucket Rate Limiter (429)
* **ID**: `token_bucket_empty` | **Expected Code**: `429 Too Many Requests` | **Halt Station**: Station 04 (API Gateway)
* **Walkthrough**:
  1. Select **Token Bucket Rate Limiter**.
  2. Tap `[ ▶ PLAY AUTO ]`.
  3. **Observe**: Bucket capacity is empty (`0/5`). Station 04 drops traffic with `Retry-After: 1s` and `429_ERR`. Stations 05 and 06 remain completely protected.
* **Lab Experiment**:
  * In `[ ⚙ LAB ]`, switch Token Bucket to **`ON (Cap: 5)`** ➔ Re-run. Burst capacity allows the request through to Station 06, completing with `201 Created`.

### Scenario 5: DB Connection Pool Timeout (504)
* **ID**: `db_pool_timeout` | **Expected Code**: `504 Gateway Timeout` | **Halt Station**: Station 06 (Database)
* **Walkthrough**:
  1. Select **DB Connection Pool Timeout**.
  2. Tap `[ ▶ PLAY AUTO ]`.
  3. **Observe**: Reaches Station 06, but connection pool is exhausted (`20/20 active`). Query wait time exceeds 5000ms SLA, triggering gateway timeout cutoff with `504_ERR`.
* **Lab Experiment**:
  * In `[ ⚙ LAB ]`, switch DB Latency to **`Normal (15ms)`** ➔ Re-run. Lock wait is resolved; transaction completes cleanly within SLA returning `200 OK`.

### Scenario 6: Slow Query Latency / Degraded (200)
* **ID**: `query_degraded` | **Expected Code**: `200 OK (Degraded)` | **Halt Station**: Station 06 (Database)
* **Walkthrough**:
  1. Select **Slow Query Latency (Degraded)**.
  2. Tap `[ ▶ PLAY AUTO ]`.
  3. **Observe**: Unindexed sequential scan across 2.4M rows takes 1200ms. Request completes with `200_OK` but includes header `X-Query-Time: 1200ms`.
* **Lab Experiment**:
  * In `[ ⚙ LAB ]`, set Rate Limiter to **`OFF`** ➔ Gateway halts burst requests before they can trigger expensive table scans on the database.

### Scenario 7: Idempotency Replay Cache (200)
* **ID**: `idempotency_cache` | **Expected Code**: `200 OK (Cache Hit)` | **Halt Station**: Station 04 (API Gateway)
* **Walkthrough**:
  1. Select **Idempotency Replay (UUID Cache Hit)**.
  2. Tap `[ ▶ PLAY AUTO ]`.
  3. **Observe**: Station 04 matches incoming `Idempotency-Key` UUID in Redis cache. Cached response returned immediately with `X-Idempotency-Status: REPLAY`; Stations 05 and 06 are `BYPASSED`.
* **Lab Experiment**:
  * In `[ ⚙ LAB ]`, switch Concurrency Control to **`CAS Lock (409)`** ➔ Simulates disabling gateway deduplication, allowing concurrent mutations to collide at the database layer.

### Scenario 8: CAS Optimistic Concurrency Conflict (409)
* **ID**: `optimistic_lock_cas` | **Expected Code**: `409 Conflict` | **Halt Station**: Station 06 (Database)
* **Walkthrough**:
  1. Select **CAS Optimistic Concurrency Conflict**.
  2. Tap `[ ▶ PLAY AUTO ]`.
  3. **Observe**: Reaches Station 06 and executes conditional `UPDATE ... WHERE version = 1`. Because concurrent write bumped version to 2, 0 rows are affected, triggering `409 Conflict`.
* **Lab Experiment**:
  * In `[ ⚙ LAB ]`, switch Concurrency Control to **`Idempotent (UUID)`** ➔ Re-run. Transaction isolation prevents version race collisions, committing with `201 Created`.

---

## State Persistence & Schema Migrations

RequestFlow features a multi-version, zero-data-loss state persistence engine backed by `localStorage`:

* **`v1`**: Legacy ping counter.
* **`v2`**: Tri-scenario run tracker (`201`, `401`, `504`).
* **`v3` (Current)**: Full 8-scenario run statistics, station inspection history, theme preference, and custom per-scenario Lab overrides.

Automatic migration chains (`v1 ➔ v2 ➔ v3`) run on startup without losing previously logged user progress. Users can reset stats at any time using **`[ ↺ RESET STATS ]`** in the footer.

---

## Local Development & Testing

### Prerequisites
* **Node.js**: `v20.x` or higher
* **npm**: `10.x` or higher

### Installation
```bash
git clone https://github.com/NatsuDrag9/request-flow.git
cd request-flow
npm install
```

### Development Scripts
| Command | Description |
| :--- | :--- |
| `npm test` | Executes the full Vitest automated test suite (56 unit and integration tests). |
| `npm run test:watch` | Runs Vitest in interactive watch mode for rapid TDD iterations. |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`). |
| `npm run build` | Compiles source files and bundles them into self-contained `dist/index.html`. |
| `npm run validate` | Runs lint + unit tests + bundle build in a single verification pipeline. |
| `npm run preview` | Starts a local HTTP server serving `dist/` on `http://localhost:4173/`. |

---

## Architecture & Platform Constraints

RequestFlow was engineered to meet the strict technical standards of the **CloudCrane Mobile-First Web Runtime**:

* **Self-Contained Bundle**: The entire production application compiles into a single file (`dist/index.html`), currently **108 KB** (well below the 1 MB platform threshold).
* **Zero External CDNs**: Zero Google Fonts, external CSS, or CDN script tags to comply with strict CSP headers.
* **Deterministic Engine**: The simulation state machine (`engine.ts` and `scenarios.ts`) has **zero DOM dependencies**, enabling 100% headless testing in Vitest.
* **Mobile-First Touch Ergonomics**:
  * Minimum touch target size $\ge 44 \times 44\text{ px}$.
  * Inputs and selects enforce $\ge 16\text{ px}$ font sizing to prevent unwanted iOS auto-zoom.
  * Full viewport height bounded with `100dvh` (accommodating mobile dynamic address bars).
  * Safe-area insets (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`) respected across notches and navigation bars.
  * Accessibility contrast ratio $\ge 4.5:1$ with reduced-motion media query support.

---

## License

MIT © 2026 RequestFlow Authors

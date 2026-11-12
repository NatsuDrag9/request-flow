# Feature 01: Pipeline Lifecycle Explorer — Intent

## 1. Executive Summary & Purpose

The **Pipeline Lifecycle Explorer** is the primary interactive learning canvas of RequestFlow. It transforms abstract backend and networking concepts (DNS resolution, TLS handshakes, reverse proxy routing, middleware evaluation, and database transactions) into an intuitive, physical, step-by-step subway-track simulation that runs smoothly on a mobile phone.

Developers frequently interact with high-level client libraries (`fetch`, `axios`) or server frameworks (`Express`, `FastAPI`, `Spring`) without a visceral mental model of what happens to a request packet as it traverses the wire. This feature provides a hands-on, deterministic test bench where learners can inspect, step through, and pause the lifecycle in real time.

---

## 2. Target User & Learning Objectives

### Target Audience
- Frontend developers seeking a clear mental model of backend architectures.
- Junior/intermediate engineers studying system design, HTTP protocol internals, and API debugging.
- Mobile phone users looking for an interactive, bite-sized engineering reference.

### Core Learning Objectives
1. **End-to-End Visibility**: Understand that an HTTP request is not a direct client-to-code pipe, but a multi-stage journey through discrete physical and logical boundaries.
2. **Hop-by-Hop Transformations**: Observe how headers, TLS wrappers, proxy routing tags, and database queries are attached, evaluated, and stripped at each stage.
3. **Failure Anatomy**: Witness exactly where common failure modes originate (e.g., why a `401 Unauthorized` halts before reaching the database, or why a `504 Gateway Timeout` occurs when a database transaction hangs).

---

## 3. Scope & Key Capabilities

### In Scope
- **6-Node Pipeline Model (Subway Sequence & Isometric Network)**:
  1. **Node 0 (Client)**: Request dispatch, headers generation (`User-Agent`, `Authorization`, `Content-Type`), payload construction.
  2. **Node 1 (DNS & TLS 1.3)**: Domain resolution, TCP 3-way handshake, TLS 1.3 cryptographic session setup.
  3. **Node 2 (Load Balancer)**: L4/L7 traffic distribution, target instance health checks, reverse proxy ingress.
  4. **Node 3 (API Gateway)**: Perimeter security, Token Bucket rate-limiting (429), Idempotency key lookup cache, path routing.
  5. **Node 4 (Backend / Auth Controller)**: Bearer token parsing (401), RBAC role validation (403), business logic execution.
  6. **Node 5 (Database / Persistence)**: PostgreSQL ACID engine, transaction locking, connection pooling (504 timeout), CAS optimistic locks (409).
- **Deterministic State Machine (FSM)**:
  - Step-by-step playback: `Play`, `Pause`, `Step Forward`, `Step Backward`, `Reset`.
  - Dual-direction packet simulation (Downstream Request $\to$ Upstream Response).
- **Comprehensive Scenario Catalog with Guidance**:
  - **Scenario A (`201 Created`)**: Full round-trip happy path for order placement across all 6 nodes.
  - **Scenario B1 (`401 Unauthorized`)**: Missing or expired JWT token caught at Backend/Auth before touching the database.
  - **Scenario B2 (`403 Forbidden`)**: RBAC permission check rejecting a `Viewer` attempting a mutating `POST /checkout` (requires `Member` or `Admin`).
  - **Scenario C (`429 Too Many Requests`)**: Token Bucket depletion at API Gateway with `Retry-After: 1`.
  - **Scenario D1 (`504 Gateway Timeout`)**: Connection pool exhaustion where PostgreSQL hangs on row locks exceeding the 5000ms SLA.
  - **Scenario D2 (Slow Query Latency)**: Degraded database query ($1200\text{ms}$ vs $15\text{ms}$) with status `200 OK` and `X-Query-Time: 1200ms` alert.
  - **Scenario E1 (Idempotency Replay `200 OK`)**: Client-side UUID idempotency key lookup at API Gateway returning cached response without re-executing backend or DB.
  - **Scenario E2 (Optimistic Lock `409 Conflict`)**: Compare-And-Swap (CAS) version conflict on concurrent item stock checkout failing at the database commit stage.
- **Scenario Guidance & Dedicated Info Modal**:
  - Scenarios are selected using clear operational titles (e.g. `[ HAPPY PATH ]`, `[ EXPIRED TOKEN ]`, `[ RBAC RESTRICTION ]`, `[ RATE LIMIT ]`, `[ DB TIMEOUT ]`) rather than raw HTTP status codes.
  - A dedicated `[ ℹ SCENARIO INFO ]` button in the bottom controls grid opens an interactive modal explaining the active scenario's distributed system mechanics, expected traversal path, halting point, and key wire telemetry observations.
- **Interactive Lab Controls & Configuration State Persistence**:
  - Interactive parameters: Token Bucket Rate Limiting (`ON` vs `OFF`), User Roles (`Viewer`, `Member`, `Admin`), DB Query Latency (`Normal` vs `1.5s Lag`), Concurrency Control (`Idempotent` vs `CAS`).
  - `[ 💾 SAVE CONFIG ]` button enables users to save their customized parameter tweaks per scenario, persisting across app reloads and satisfying the assignment's data alteration requirement.
  - `[ ↺ RESET TO DEFAULT ]` button reverts the current scenario to baseline presets.
- **Retro-Tech Workstation Styling**:
  - Full adherence to `CRT_DARK` and `PAPER_LIGHT` design tokens.
  - Tactile mechanical buttons with hard 2px offset drop shadows.
  - Touch targets strictly $\ge 44\times 44\text{px}$.

### Out of Scope for Feature 01
- Deep wire protocol packet inspection drawer (owned by Feature 02: Stage Wire Inspector).
- Schema migrations and historical request analytics (owned by Feature 03: State Persistence Engine).
- Live network sockets (all execution is simulated locally and deterministically for 100% offline reliability).

---

## 4. Success Criteria

1. **Pedagogical Clarity**: A user can follow a request packet visually from Client $\to$ Database and back in under 10 seconds or step through each node manually.
2. **Zero DOM Dependency in Core Logic**: The underlying FSM state machine and scenario definitions must be 100% decoupled from DOM APIs to enable fast headless unit testing via Vitest.
3. **Touch Ergonomics**: All interactive elements (play/pause/step controls, scenario pills) must be easily accessible within the mobile thumb zone ($\ge 44\text{px}$ touch targets).
4. **Performance**: Zero animation frame drops on mobile devices ($60\text{ fps}$ smooth CSS GPU transitions).

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
- **5-Node Vertical Subway Pipeline**:
  1. **Client Node**: Request initiation, headers generation (`User-Agent`, `Authorization`, `Content-Type`), payload construction.
  2. **Network & TLS Node**: DNS lookup simulation, TCP 3-way handshake, TLS 1.3 cryptographic negotiation, latency jitter.
  3. **API Gateway Node (Reverse Proxy / Nginx)**: SSL termination, CORS preflight validation, rate-limiting checks, path routing (`/api/v1/orders`).
  4. **Backend Application Node (Express/Spring Simulator)**: Auth token parsing, request validation, business logic execution, SQL statement preparation.
  5. **Database Node (PostgreSQL ACID Engine)**: Connection pooling, `BEGIN` transaction, `INSERT / SELECT` row locking, commit/rollback.
- **Deterministic State Machine (FSM)**:
  - Step-by-step playback: `Play`, `Pause`, `Step Forward`, `Step Backward`, `Reset`.
  - Dual-direction packet simulation (Downstream Request $\to$ Upstream Response).
- **3 Realistic Scenario Presets**:
  - **Scenario A (`201 Created`)**: Full round-trip happy path for an order creation.
  - **Scenario B (`401 Unauthorized`)**: Gateway/Auth rejection halting the flow at the middleware layer before touching the database.
  - **Scenario C (`504 Gateway Timeout`)**: Database lock timeout causing the gateway to terminate the downstream connection.
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

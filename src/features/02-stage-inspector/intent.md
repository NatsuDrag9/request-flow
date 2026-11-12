# Feature Intent: Stage Wire Inspector (Feature 02)

## 1. Problem Statement
In distributed web systems, beginners and intermediate engineers often struggle to visualize what an HTTP request actually looks like as it transitions between different infrastructure layers (e.g., how TLS encryption wraps the request, how an Nginx reverse proxy injects `X-Forwarded-*` headers, or how an ORM translates a JSON payload into a SQL query).

While Feature 01 provides an interactive visualization of hops across the 6 architectural nodes (Client, DNS & TLS, Load Balancer, API Gateway, Backend Controller, Database), users need a way to "look inside the wire" at any given stage to inspect the actual protocol payloads, headers, latency metrics, and failure traces.

---

## 2. Pedagogical Objectives
1. **Demystify Network Protocols**: Show real HTTP headers (`Host`, `Authorization`, `Content-Type`), TLS 1.3 handshake parameters (cipher suites, SNI, RTT), and Nginx reverse proxy headers (`X-Forwarded-For`, `X-Request-Id`).
2. **Bridge Application & Database Layers**: Illustrate how backend middleware decodes JWT claims, validates schemas, and converts API requests into parameterized SQL statements (`INSERT INTO orders ... RETURNING id`).
3. **Expose Failure Anatomy & Concurrency Traces**:
   - **401 vs 403**: Clearly distinguish unauthenticated token expiration (401) from authenticated role-based denial (403 RBAC with required vs granted roles).
   - **429 Rate Limiting**: Inspect token bucket parameters, `Retry-After: 1`, and `X-RateLimit-Remaining: 0` at the API Gateway.
   - **504 Gateway Timeout**: Inspect database lock wait deadlock ($5002\text{ms}$) exceeding upstream SLA threshold.
   - **Slow Query Latency**: Inspect query execution duration ($1200\text{ms}$) and latency alert headers (`X-Query-Time: 1200ms`).
   - **Idempotency Replay**: Inspect client `Idempotency-Key` header and API Gateway cache hit headers (`X-Idempotency-Status: REPLAY`).
   - **409 Conflict**: Inspect CAS SQL query (`UPDATE ... WHERE version = 1`) returning 0 rows affected due to optimistic concurrency collision.
4. **Actionable Wire Telemetry**: A borderless, tactile copy icon inside the black telemetry box allows engineers to copy exact raw wire payloads (headers, ciphers, SQL statements) directly to their clipboard for real-world study.

---

## 3. User Experience & Design Goals
- **Mobile-First Bottom Sheet**: A tactile, slide-up sheet anchored to the bottom of the viewport with a physical drag handle and minimum $48\text{px}$ touch targets.
- **Dual Tabbed Navigation**:
  - **Overview Tab**: Human-friendly explanation, purpose of the stage, and simulated timing/latency metrics.
  - **Wire Protocol Tab**: Raw, formatted monospace telemetry (headers, JSON payloads, TLS ciphers, SQL queries) inside a CRT-styled terminal box.
- **Bi-Directional Awareness**: The inspector distinguishes whether the stage is currently in `DOWNSTREAM` (Request) or `UPSTREAM` (Response) traversal mode.
- **Non-Modal & Dismissible**: Can be opened by tapping any node card in the subway track or by tapping an `[ 🔍 INSPECT WIRE ]` action bar button, and easily closed via tap or swipe down without blocking the pipeline.

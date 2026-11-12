# Feature Intent: Stage Wire Inspector (Feature 02)

## 1. Problem Statement
In distributed web systems, beginners and intermediate engineers often struggle to visualize what an HTTP request actually looks like as it transitions between different infrastructure layers (e.g., how TLS encryption wraps the request, how an Nginx reverse proxy injects `X-Forwarded-*` headers, or how an ORM translates a JSON payload into a SQL query).

While Feature 01 provides a high-level subway track animation of hops across the 5 nodes, users need a way to "look inside the wire" at any given stage to inspect the actual protocol payloads, headers, latency metrics, and failure traces.

---

## 2. Pedagogical Objectives
1. **Demystify Network Protocols**: Show real HTTP headers (`Host`, `Authorization`, `Content-Type`), TLS 1.3 handshake parameters (cipher suites, SNI, RTT), and Nginx reverse proxy headers (`X-Forwarded-For`, `X-Request-Id`).
2. **Bridge Application & Database Layers**: Illustrate how backend middleware decodes JWT claims, validates schemas, and converts API requests into parameterized SQL statements (`INSERT INTO orders ... RETURNING id`).
3. **Expose Failure Anatomy**: When a request fails (such as `401 Unauthorized` or `504 Gateway Timeout`), show exactly which layer rejected the request, the error payload returned, and why downstream stages were never reached.

---

## 3. User Experience & Design Goals
- **Mobile-First Bottom Sheet**: A tactile, slide-up sheet anchored to the bottom of the viewport with a physical drag handle and minimum $48\text{px}$ touch targets.
- **Dual Tabbed Navigation**:
  - **Overview Tab**: Human-friendly explanation, purpose of the stage, and simulated timing/latency metrics.
  - **Wire Protocol Tab**: Raw, formatted monospace telemetry (headers, JSON payloads, TLS ciphers, SQL queries) inside a CRT-styled terminal box.
- **Bi-Directional Awareness**: The inspector distinguishes whether the stage is currently in `DOWNSTREAM` (Request) or `UPSTREAM` (Response) traversal mode.
- **Non-Modal & Dismissible**: Can be opened by tapping any node card in the subway track or by tapping an `[ 🔍 INSPECT WIRE ]` action bar button, and easily closed via tap or swipe down without blocking the pipeline.

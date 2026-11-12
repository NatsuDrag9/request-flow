# Project Intent: RequestFlow

## Purpose
**RequestFlow** is an interactive, mobile-first learning laboratory built for the **CloudCrane Recruitment Challenge**. Its objective is to demonstrate how an AI assistant and an engineer collaborate to conceptualize, test, ship, and iterate on a production-grade phone application using CloudCrane's Model Context Protocol (MCP).

### Evaluation Criteria Addressed
- **AI-Assisted Delivery**: Engineered and deployed via CloudCrane MCP tools.
- **Mobile-First Utility**: Built specifically for phone screens (touch-friendly targets $\ge 44\text{px}$, responsive layout, standalone PWA installable to the home screen).
- **Iterative 3-Version Lifecycle**: Progressive releases proving sound engineering judgment, including automated testing and an intentional rollback of a regressive UI experiment.
- **Backward-Compatible Data Evolution**: Altered data storage contract ($v_1 \to v_2 \to v_3$) that adds custom per-scenario configuration persistence without losing what's already on the user's phone (preserving all historical runs and node inspection history).
- **Engineering Rigor**: Full unit and integration test coverage (`npm test` via Vitest), pre-flight validation gates (`check_publish`), and zero external runtime dependencies.

---

## How It Works
When a user opens RequestFlow on their phone, the app presents an interactive, vertical pipeline that models modern backend infrastructure:

1. **Triggering Requests & Scenario Guidance**: The user selects a scenario from a semantic dropdown menu (e.g., *Happy Path (Standard Checkout)*, *Expired Bearer Token*, *RBAC Role Restriction*, *Rate Limit Breach*, or *DB Connection Timeout*). A dedicated **`[ ℹ SCENARIO INFO ]`** button in the bottom dock opens an educational modal explaining what real-world backend behavior it models, the expected system response, and what the user should observe. The user then taps **Send Request** or **Step ➔** in the thumb-accessible bottom dock.
2. **Visual Packet Traversal**: An animated packet travels node-by-node along a glowing track through six architecture stages:
   - **Client / Browser**: Initiates the request with headers, payload, and auth tokens.
   - **DNS & TLS 1.3**: Demonstrates domain resolution and secure TLS 1.3 handshakes.
   - **Load Balancer**: Models L4/L7 traffic routing, round-robin distribution, and health checks.
   - **API Gateway**: Enforces reverse proxying, token bucket rate limiting, and idempotency caching.
   - **Backend Controller**: Executes middleware, JWT verification, and RBAC role checks.
   - **Database**: Runs ACID transactions, connection pool allocation, or CAS concurrency checks.
3. **Deep Node Inspection**: Tapping any pipeline node slides up a bottom drawer with two views:
   - **Overview**: Clear, accessible explanations of what occurred at that layer.
   - **Wire Protocol**: Exact raw HTTP headers, JSON payloads, and SQL queries with one-tap clipboard copy.
4. **Failure Visualization & Lab Controls**: On error scenarios, execution halts precisely at the failing node with clear status codes and debugging hints:
   - **429 Too Many Requests**: Demonstrates token bucket depletion at the API Gateway when rapid requests exceed capacity.
   - **401 vs 403 (Authentication vs Authorization)**: Demonstrates the difference between unauthenticated tokens (401 at Backend/Auth) and role-based authorization failures (403 when a `Viewer` attempts a mutating `POST /checkout` vs an `Admin` or `Member`).
   - **504 DB Timeout & Slow Queries**: Simulates latency degradation and pool exhaustion at the database layer.
   - **Concurrency (Idempotency & CAS)**: Simulates duplicate prevention via idempotency keys and race condition detection via optimistic locking.
5. **Custom Scenario Configuration & Zero-Loss State Persistence**: Users can customize scenario parameters in the Lab Controls (e.g., toggle rate limiting, switch user roles, adjust DB query latency, or select concurrency mode) and persist their custom settings per scenario via a **`[ 💾 SAVE CONFIG ]`** action. These custom configurations, along with run counts, scenario analytics, and inspection history, persist across app reloads and updates using local storage. When upgrading schemas ($v_1 \to v_2 \to v_3$), migration handlers seamlessly preserve all prior device data while activating the new configuration saving capabilities.

# Feature Plan: Stage Wire Inspector (Feature 02)

## 1. Implementation Steps & TDD Sequencing

### Step 1: Headless Formatter & Inspector Model (`src/features/02-stage-inspector/inspector.ts`)
- Implement `formatWireProtocol(nodeIndex, stage, direction): string`
  - Formats HTTP request/response headers, parameters, and payloads.
  - Formats TLS 1.3 cryptographic handshake parameters (ciphers, SNI, session resumption).
  - Formats API Gateway routing, token bucket rate limiting (429), and idempotency cache lookups (200 Replay).
  - Formats Backend middleware traces, JWT verification (401), and RBAC permission checks (403).
  - Formats PostgreSQL ACID transactions, lock deadlocks (504), query duration alerts (Slow Query), and optimistic concurrency CAS version mismatches (409).
- Implement `buildInspectorDetails(scenario, nodeIndex, direction): InspectorStageDetails`.

### Step 2: Automated Unit Testing (`tests/unit/inspector.test.ts`)
- Test wire protocol formatting across all 6 nodes (Client, DNS & TLS, Load Balancer, API Gateway, Backend App, Database).
- Test unreached stage formatting for halted error flows (`401`, `403`, `429`, `504`, `409`).
- Test RBAC payload formatting with required vs granted roles.
- Test idempotency replay wire header generation (`X-Idempotency-Status: REPLAY`).
- Test optimistic lock failure wire representation (`0 rows affected`, `409 Conflict`).

### Step 3: UI & Mobile Bottom Sheet Integration (`src/index.html`)
- Integrate tactile bottom sheet container markup (`#sheetDrawer`, drag handle, tabs, `#wirePane`, `#overviewPane`).
- Embed borderless, square-free copy icon inside the black telemetry code box (`top: 3px; right: 3px;`) with layered files icon (front layer top-right).
- Wire tap listeners on both Subway Track node rows and Isometric Network SVG nodes so tapping any node inspects it.
- Add `[ 🔍 INSPECT WIRE ]` button on the main chassis for quick access to currently active node.
- Wire close button `[ ✕ ]` and backdrop dismissal.

### Step 5: Verification
- Run `npm run validate` (`tsc --noEmit && vitest run && bundle`).
- Inspect visually in built-in browser tab at `http://localhost:4173/`.

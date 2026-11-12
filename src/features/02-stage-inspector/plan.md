# Feature Plan: Stage Wire Inspector (Feature 02)

## 1. Implementation Steps & TDD Sequencing

### Step 1: Headless Formatter & Inspector Model (`src/features/02-stage-inspector/inspector.ts`)
- Implement `formatWireProtocol(wire: StageWireData): string`
  - Formats HTTP request/response headers and body.
  - Formats TLS 1.3 handshake parameters (cipher suite, RTT, DNS latency).
  - Formats Reverse Proxy headers and rate-limit counters.
  - Formats Backend middleware execution traces.
  - Formats PostgreSQL transactions (`BEGIN`, `QUERY`, `COMMIT`).
- Implement `buildInspectorDetails(scenario, nodeIndex, direction): InspectorStageDetails`.

### Step 2: Automated Unit Testing (`tests/unit/inspector.test.ts`)
- Test wire protocol formatting for HTTP request (Node 01).
- Test wire protocol formatting for TLS transport (Node 02).
- Test wire protocol formatting for API Gateway (Node 03).
- Test wire protocol formatting for Backend App & Auth failure (Node 04).
- Test wire protocol formatting for Database ACID transaction (Node 05).
- Test unreached stage formatting (for `401` and `504` scenarios).

### Step 3: Bundle Integration (`scripts/bundle.js`)
- Update `scripts/bundle.js` to bundle `src/features/02-stage-inspector/inspector.ts` along with `engine.ts` into `RequestFlowEngine`.
- Verify bundle size remains $<50\text{ KB}$ and zero forbidden identifiers (`open`).

### Step 4: UI & Mobile Bottom Sheet Integration (`src/index.html`)
- Add tactile bottom sheet container markup (`#inspectorDrawer`, drag handle, tabs, `#inspectorContent`).
- Add CSS styling for the retro bottom sheet, transitions, and monospace wire terminal box.
- Wire tap listeners on subway track nodes so tapping any node opens its inspector.
- Add `[ 🔍 INSPECT WIRE ]` button on the main chassis for quick access.
- Wire close button `[ ✕ CLOSE ]` and backdrop dismissal.

### Step 5: Verification
- Run `npm run validate` (`tsc --noEmit && vitest run && bundle`).
- Inspect visually in built-in browser tab at `http://localhost:4173/`.

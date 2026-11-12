# Feature Specification: Stage Wire Inspector (Feature 02)

## 1. Overview & Data Model

The Stage Wire Inspector is a mobile-first slide-up bottom sheet that exposes deep protocol inspection for any of the 6 pipeline nodes (`01 CLIENT`, `02 DNS & TLS 1.3`, `03 LOAD BALANCER`, `04 API GATEWAY`, `05 BACKEND APP`, `06 DATABASE`).

---

## 2. TypeScript Data Contract

```typescript
export type InspectorTab = "OVERVIEW" | "WIRE";

export interface StageWireData {
  method?: string;
  path?: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown> | string;
  protocol?: string;
  cipher?: string;
  rttMs?: number;
  dnsLookupMs?: number;
  proxy?: string;
  rateLimitRemaining?: number;
  forwardedFor?: string;
  handler?: string;
  userId?: string;
  action?: string;
  db?: string;
  query?: string;
  txStatus?: string;
  durationMs?: number;
  error?: string;
  upstreamTimeout?: boolean;
  timeoutLimitMs?: number;
  reached?: boolean;
  // Concurrency & Concurrency failure metadata
  idempotencyKey?: string;
  idempotencyStatus?: "HIT" | "MISS" | "REPLAY";
  casVersion?: number;
  casExpectedVersion?: number;
  rowsAffected?: number;
  requiredRoles?: string[];
  grantedRole?: string;
  retryAfterSec?: number;
  queryDurationMs?: number;
  [key: string]: unknown;
}

export interface InspectorStageDetails {
  nodeIndex: number;
  nodeName: string;
  title: string;
  description: string;
  direction: "DOWNSTREAM" | "UPSTREAM";
  scenarioId: string;
  scenarioCode: string | number;
  wire: StageWireData;
  formattedWireText: string;
}
```

---

## 3. Component State & Interaction Logic

### State Machine
- `isInspectorVisible: boolean`: Indicates if bottom sheet is shown (`true`) or hidden (`false`).
  *(Note: The identifier `open` is strictly forbidden per CloudCrane platform constraints).*
- `activeNodeIndex: number`: Index of the currently inspected node ($0 \dots 5$).
- `activeTab: InspectorTab`: Currently selected tab (`"OVERVIEW"` or `"WIRE"`).

### Event Handlers
1. `showInspector(nodeIndex?: number)`: Opens the bottom sheet displaying details for the specified node or current engine node.
2. `hideInspector()`: Closes the bottom sheet and restores full visibility to the subway track.
3. `setInspectorTab(tab: InspectorTab)`: Switches between `OVERVIEW` and `WIRE` tabs.
4. `formatWireData(wire: StageWireData): string`: Pure formatting function that serializes protocol wire objects into readable HTTP/TLS/SQL format.
5. `copyWireData()`: Copies `formattedWireText` to the system clipboard via `navigator.clipboard.writeText`, temporarily toggles button state to `COPIED` with checkmark icon, and displays transient toast.

---

## 4. Visual & Ergonomic Design (Retro-Tech)

### Sheet Layout & Dimensions
- **Position**: Fixed bottom drawer, `width: 100%`, max-height: `80dvh`.
- **Drag Handle**: Centered tactile grab bar ($44\times 5\text{px}$, radius $3\text{px}$) for intuitive touch ergonomics.
- **Header Bar**:
  - Node Title: E.g., `[NODE 03: API GATEWAY]` in high-contrast monospaced font.
  - Close Button: `[ ✕ ]` with minimum touch target $44\times 44\text{px}$.
- **Segmented Tab Switcher**:
  - Two buttons: `[ 📖 OVERVIEW ]` and `[ ⚡ WIRE TELEMETRY ]`.
  - Active button highlighted with `--border-active` (`#f59e0b` on CRT dark, `#9a3412` on paper light).
- **Integrated Wire Telemetry Terminal**:
  - Code container with black inset background (`#0a0b09`).
  - Borderless, square-free copy icon anchored to top-right (`top: 3px; right: 3px;`) with two-file layered icon (front/upper file at top-right, rear file at bottom-left).
  - Minimum touch target: $44\times 44\text{px}$.
- **Safe Area Insets**: Padding bottom `max(16px, env(safe-area-inset-bottom))` to prevent interference with mobile home indicator bars.

---

## 5. Pure Headless Architecture & Unit Testability

To adhere to the decoupled TDD mandate:
1. `src/features/02-stage-inspector/inspector.ts` contains only pure functions:
   - `buildInspectorDetails(scenario, nodeIndex, direction)`
   - `formatWireProtocol(wireData)`
   - Zero references to `document`, `window`, or `HTMLElement`.
2. Dedicated unit tests in `tests/unit/inspector.test.ts` verify all wire payload conversions, tab logic, and formatting across all 3 scenarios.

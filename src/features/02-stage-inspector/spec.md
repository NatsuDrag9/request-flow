# Feature Specification: Stage Wire Inspector (Feature 02)

## 1. Overview & Data Model

The Stage Wire Inspector is a mobile-first slide-up bottom sheet that exposes deep protocol inspection for any of the 5 pipeline nodes (`01 CLIENT`, `02 NETWORK & TLS`, `03 API GATEWAY`, `04 BACKEND APP`, `05 DATABASE`).

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
  [key: string]: unknown;
}

export interface InspectorStageDetails {
  nodeIndex: number;
  nodeName: string;
  title: string;
  description: string;
  direction: "DOWNSTREAM" | "UPSTREAM";
  scenarioId: string;
  scenarioCode: number;
  wire: StageWireData;
  formattedWireText: string;
}
```

---

## 3. Component State & Interaction Logic

### State Machine
- `isInspectorVisible: boolean`: Indicates if bottom sheet is shown (`true`) or hidden (`false`).
  *(Note: The identifier `open` is strictly forbidden per CloudCrane platform constraints).*
- `activeNodeIndex: number`: Index of the currently inspected node ($0 \dots 4$).
- `activeTab: InspectorTab`: Currently selected tab (`"OVERVIEW"` or `"WIRE"`).

### Event Handlers
1. `showInspector(nodeIndex?: number)`: Opens the bottom sheet displaying details for the specified node or current engine node.
2. `hideInspector()`: Closes the bottom sheet and restores full visibility to the subway track.
3. `setInspectorTab(tab: InspectorTab)`: Switches between `OVERVIEW` and `WIRE` tabs.
4. `formatWireData(wire: StageWireData): string`: Pure formatting function that serializes protocol wire objects into readable HTTP/TLS/SQL format.

---

## 4. Visual & Ergonomic Design (Retro-Tech)

### Sheet Layout & Dimensions
- **Position**: Fixed bottom drawer, `width: 100%`, max-height: `70dvh`.
- **Drag Handle**: Centered tactile grab bar ($44\times 6\text{px}$, radius $3\text{px}$) for intuitive touch ergonomics.
- **Header Bar**:
  - Node Title: E.g., `[NODE 03: API GATEWAY]` in high-contrast monospaced font.
  - Close Button: `[ ✕ CLOSE ]` with minimum touch target $44\times 44\text{px}$.
- **Segmented Tab Switcher**:
  - Two buttons: `[ 📖 OVERVIEW ]` and `[ ⚡ WIRE PROTOCOL ]`.
  - Active button highlighted with `--border-active` (`#f59e0b` on CRT dark, `#9a3412` on paper light).
- **Safe Area Insets**: Padding bottom `max(16px, env(safe-area-inset-bottom))` to prevent interference with mobile home indicator bars.

---

## 5. Pure Headless Architecture & Unit Testability

To adhere to the decoupled TDD mandate:
1. `src/features/02-stage-inspector/inspector.ts` contains only pure functions:
   - `buildInspectorDetails(scenario, nodeIndex, direction)`
   - `formatWireProtocol(wireData)`
   - Zero references to `document`, `window`, or `HTMLElement`.
2. Dedicated unit tests in `tests/unit/inspector.test.ts` verify all wire payload conversions, tab logic, and formatting across all 3 scenarios.

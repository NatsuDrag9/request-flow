---
name: requestflow-design-system
description: Mobile-first design system, design tokens, color palette, typography, touch ergonomics, and component patterns for RequestFlow.
---

# RequestFlow Mobile Design System & UI Standards

This document establishes the UI specifications, design tokens, mobile touch standards, and component patterns for **RequestFlow**. All frontend interfaces and styling in this repository must adhere to these conventions.

---

## 1. Design Tokens & Theme Variables

All colors, dimensions, and typography must be declared as CSS Custom Properties on `:root` and respected across components.

```css
:root {
  /* Color Scheme */
  color-scheme: dark light;

  /* Canvas & Surface Colors */
  --bg-canvas: #090d16;
  --bg-surface: #131b2e;
  --bg-card: #1a253c;
  --border-subtle: #263554;
  --border-active: #38bdf8;

  /* Text & Hierarchy */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-tertiary: #64748b;

  /* Protocol Accent Palette */
  --accent-client: #f43f5e;     /* Rose - Client / User Origin */
  --accent-network: #38bdf8;    /* Sky Blue - DNS, TCP, TLS */
  --accent-gateway: #f59e0b;    /* Amber - Reverse Proxy, Load Balancer */
  --accent-backend: #10b981;    /* Emerald - API Middleware & Controller */
  --accent-database: #8b5cf6;   /* Violet - Relational DB & ACID Tx */

  /* Status Colors */
  --status-success: #34d399;
  --status-warning: #fbbf24;
  --status-danger: #f87171;

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;

  /* Radii */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-pill: 9999px;

  /* Safe Area Insets */
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}
```

---

## 2. Mobile Touch Standards & Ergonomics

### A. The 44x44 px Touch Rule
- Every interactive element (buttons, node cards, pill toggles, close icons) must have a touch target of at least **44x44 px**.
- Maintain at least **8px** clearance between adjacent tappable targets to prevent accidental touches on mobile.

### B. Mobile Thumb Zone Dock
- Primary interaction buttons (`▶ Send Request`, `Step ➔`, `↺ Reset`) must be docked inside a fixed bottom bar (`.action-dock`) anchored to the bottom thumb zone:
  ```css
  .action-dock {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px 16px calc(var(--safe-bottom) + 12px);
    background: rgba(19, 27, 46, 0.95);
    backdrop-filter: blur(16px);
    border-top: 1px solid var(--border-subtle);
    z-index: 50;
  }
  ```

### C. Touch Feedback & No Sticky Hover
- On touchscreens, `:hover` pseudo-classes can stick after tapping. Wrap all hover rules in:
  ```css
  @media (hover: hover) and (pointer: fine) {
    .btn:hover { background: var(--bg-card); }
  }
  ```
- Always provide immediate physical feedback using `:active`:
  ```css
  .btn:active, .node-card:active {
    transform: scale(0.97);
  }
  ```

### D. iOS Auto-Zoom Prevention
- Set `font-size: 16px` or higher on all inputs, selects, and textareas. Font sizes below 16px cause iOS Safari to forcefully zoom in on the viewport.

---

## 3. Core Component Patterns

### A. The Vertical Subway Pipeline
- Architecture flows vertically from top to bottom (Client $\to$ DNS $\to$ Gateway $\to$ Backend $\to$ Database).
- A continuous 4px background track (`.pipeline-track`) with a dynamic progress bar (`.pipeline-progress`) and an animated travelling packet (`#packetDot`).
- The packet must animate smoothly between node card vertical midpoints.

### B. Node Cards & States
Node cards represent stages in the request lifecycle and must visually reflect one of four states:
1. **Idle**: Muted badge icon, subtle border (`--border-subtle`).
2. **Active**: Glowing sky blue border (`--accent-network`), blue badge, pulsing packet presence.
3. **Passed**: Muted green border (`--status-success` at 40%), green badge with check icon.
4. **Failed / Halted**: Red border (`--status-danger`), red badge, subtle red card backdrop (`rgba(248, 113, 113, 0.08)`).

### C. Bottom-Sheet Node Inspector
- Slides up from the bottom when any node card is tapped.
- Includes a centered drag handle (width: `36px`, height: `4px`, radius: `2px`).
- Features a dual-tab switcher:
  - **Overview**: Clear, accessible explanation of the stage's responsibilities.
  - **Wire Protocol**: Monospace code view showing raw HTTP headers, JSON payloads, or SQL statements.
- Includes `overscroll-behavior: contain` so dragging or scrolling inside the sheet does not displace the underlying page.

### D. Horizontal Scenario Scroll Bar
- Scenario pills are arranged in a horizontal row (`display: flex; gap: 6px; overflow-x: auto;`).
- Hide default scrollbars across WebKit and Firefox (`scrollbar-width: none;`).

---

## 4. Accessibility & Motion Guidelines

### A. Contrast Compliance
- All body text and badges must maintain a minimum contrast ratio of **4.5:1** against their immediate background.
- Dimmed text (`--text-tertiary`) must only be used for non-essential annotations and timestamps.

### B. Reduced Motion Support
- Users with motion sensitivities must be accommodated:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
    .pipeline-progress, .packet-dot, .inspector-sheet {
      transition: none !important;
    }
  }
  ```

### C. Full-Height Layouts with `100dvh`
- Never use `100vh` for full-height containers, as mobile browser address bars and bottom navigation overlays will cause unexpected content clipping. Always use `100dvh`.

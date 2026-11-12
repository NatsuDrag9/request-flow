---
name: requestflow-design-system
description: Mobile-first retro-tech design system for RequestFlow, matching CloudCrane's vintage computing / workstation aesthetic with dual CRT_DARK and PAPER_LIGHT modes.
---

# RequestFlow Retro-Tech Design System (CRT_DARK & PAPER_LIGHT)

This design system codifies the **Retro-Tech / Vintage Workstation** visual identity for RequestFlow. It explicitly avoids generic modern AI design tropes (such as Tailwind slate-blue palettes, saturated purple/blue gradients, and soft fuzzy box-shadows) in favor of authentic vintage computing aesthetics: warm drafting parchment, antique computer beige chassis, dark cathode-ray phosphor wells, tactile mechanical bevels, and crisp 2px offset shadows.

The application strictly supports **two themes**:
1. **`CRT_DARK`**: Cathode Ray Tube Phosphor & Deep Matte Charcoal (pure warm black, zero blue).
2. **`PAPER_LIGHT`**: Vintage Drafting Parchment & Heavy Industrial Carbon Ink.

---

## 1. Design Tokens & Color Schemes

The interface uses semantic CSS custom properties toggled via `[data-theme="CRT_DARK"]` and `[data-theme="PAPER_LIGHT"]`.

```css
:root,
[data-theme="CRT_DARK"] {
  color-scheme: dark;

  /* --- CRT_DARK: CATHODE RAY TUBE PHOSPHOR & CHARCOAL --- */
  --bg-canvas: #101110;             /* Pitch cathode tube charcoal */
  --bg-surface: #181a17;            /* Matte black industrial housing */
  --bg-card: #212320;               /* Elevated phosphor terminal module */
  --bg-inset: #0a0b09;              /* Deep sunken screen well */
  --border-strong: #4a4d45;         /* Machined gunmetal border */
  --border-subtle: #2d302a;         /* Muted panel seam */
  --border-active: #f59e0b;         /* Glowing phosphor amber */

  --text-primary: #f5f2ea;          /* Phosphor bone white */
  --text-secondary: #d4cfc4;        /* Fluorescent filament */
  --text-tertiary: #b8b2a5;         /* Dim filament */

  --accent-primary: #f59e0b;        /* Luminous CRT amber */
  --accent-primary-text: #101110;   /* High-contrast ink on amber */
  --accent-success: #22c55e;        /* Monochrome terminal green */
  --accent-error: #ef4444;          /* CRT error filament */

  --shadow-retro: 2px 2px 0px #000000;
  --shadow-retro-pressed: 0px 0px 0px #000000;
  --shadow-retro-lg: 3px 3px 0px #000000;

  --font-mono: "SF Mono", Menlo, Monaco, Consolas, "Courier New", monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif;

  --radius-sm: 3px;
  --radius-md: 6px;

  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}

[data-theme="PAPER_LIGHT"] {
  color-scheme: light;

  /* --- PAPER_LIGHT: VINTAGE DRAFTING PARCHMENT & COMPUTER BEIGE --- */
  --bg-canvas: #f6f3eb;             /* Warm vintage parchment */
  --bg-surface: #ede5d4;            /* Antique beige computer chassis */
  --bg-card: #fffefb;               /* Crisp matte card surface */
  --bg-inset: #ddd4bf;              /* Recessed display well */
  --border-strong: #211e19;         /* High-contrast industrial ink outline */
  --border-subtle: #b8ac96;         /* Mechanical panel seam */
  --border-active: #9a3412;         /* Rich rust/ochre machine accent */

  --text-primary: #1c1915;          /* Heavy typewriter carbon black */
  --text-secondary: #38342c;        /* Deep graphite */
  --text-tertiary: #4a453b;         /* Muted drafting lead */

  --accent-primary: #9a3412;        /* Dark industrial rust/amber */
  --accent-primary-text: #ffffff;   /* Pure white on rust */
  --accent-success: #15803d;        /* Terminal relay green */
  --accent-error: #b91c1c;          /* Fault indicator red */

  --shadow-retro: 2px 2px 0px var(--border-strong);
  --shadow-retro-pressed: 0px 0px 0px var(--border-strong);
  --shadow-retro-lg: 3px 3px 0px var(--border-strong);
}
```

---

## 2. Core Retro-Tech Components

### A. Tactile Mechanical Buttons
- Rigid 2px solid border (`var(--border-strong)`).
- Hard offset drop shadow (`2px 2px 0px`).
- Immediate tactile feedback: on `:active`, moves `translate(2px, 2px)` with `box-shadow: 0 0 0`.
- Minimum 44px (recommended 48px) height for finger touch.

### B. Inset Telemetry Display Wells
- Sunken panel with darker background (`var(--bg-inset)`).
- Dotted mechanical dividers.
- High-contrast tabular numbers with zero-padding.
- Theme readout explicitly displaying either `CRT_DARK` or `PAPER_LIGHT`.

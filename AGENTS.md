# Antigravity Agent Guidelines (AI-Native SDLC)

These rules govern all agent and human engineering on **RequestFlow** and must be strictly adhered to.

---

## 1. Tech Stack & Environment Versions

- **Host & Runtime**: Node.js `v20.19.x`, npm `10.8.x`, ES Modules (`"type": "module"`).
- **Language**: **TypeScript** (`^5.x` / ES2022) with strict type checking (`tsc --noEmit`).
- **Feature-Level Type Encapsulation**: Create a separate `types.ts` file within each feature directory (`src/features/*/types.ts`) to encapsulate domain interfaces, state models, and event contracts locally. Never aggregate disparate feature types into a monolithic global file.
- **Frontend Architecture**: Decoupled Modern Vanilla Web Components (ES2022 TypeScript/HTML5/CSS3 with CSS Custom Properties). Zero heavy framework overhead to ensure instant mobile execution.
- **Simulated Backend Engine**: Headless, deterministic TypeScript state machine (`src/features/01-pipeline-explorer/engine.ts`) simulating HTTP/1.1, TLS 1.3 handshake, Nginx Gateway, and Express/Spring-style routing.
- **Database Layer**:
  - Deterministic PostgreSQL ACID transaction simulator (`src/features/01-pipeline-explorer/scenarios.ts`).
  - Client-side persistence: Browser `localStorage` with explicit schema versioning and zero-loss migration handlers (`src/features/03-state-persistence/storage.ts`).
- **Unit & Integration Test Runner**: **Vitest** (`^2.x`) with native TypeScript execution and in-memory speed.
- **Bundler & Packaging**: Custom zero-dependency Node.js compiler (`scripts/bundle.js`) compiling modular source into a single self-contained `dist/index.html`.

---

## 2. Test-Driven Development (TDD) Mandate

- **Strict TDD**: Write automated unit and integration tests before or alongside any business logic or bug fixes.
- **Vitest Unit Testing**: All core modules (`src/core/`) must have dedicated unit tests executed via Vitest.
- **Decoupled Architecture**: Core simulation and migration logic (`src/core/`) must have **zero DOM dependencies** (`window`, `document`, `localStorage` must be mocked or injected) to ensure 100% headless testability.
- **Standard Commands**:
  - **Run Tests**: `npm test` (executes `vitest run`)
  - **Test Watch Mode**: `npm run test:watch` (executes `vitest`)
  - **Build Bundle**: `npm run build` (executes `node scripts/bundle.js`)
  - **Lint / Syntax Check**: `npm run lint` (executes `node --check scripts/bundle.js src/core/*.js`)
  - **Validate Pipeline**: `npm run validate` (runs lint + tests + bundle verification)

---

## 3. CloudCrane Platform Constraints

- **Single-File Distribution**: The production build (`dist/index.html`) must be completely self-contained (inline `<style>` and `<script>`), strictly under **1 MB** in size.
- **No External CDNs**: External scripts, Google Fonts, and external stylesheets are blocked by CSP. Only local shelf scripts (`/_cc/lib/`) are permitted if needed.
- **Forbidden Identifier `open`**: Never name a top-level variable or function `open` (`window.open` is locked; declaring it will crash the script and yield a blank page).
- **No Browser Dialogs**: Never use `alert()`, `confirm()`, or `prompt()`. Use bottom action sheets or undo snackbars.
- **Storage Quota**: Client storage (`localStorage`) must not exceed 5 MB and must handle storage exceptions gracefully.

---

## 4. Mobile PWA & Touch Standards

- **Viewport**: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`. Never disable user scaling (`user-scalable=no` or `maximum-scale=1` are forbidden).
- **Safe Area Insets**: Fixed headers, bottom action bars, and bottom sheets must respect `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.
- **Height Units**: Use `100dvh` for full-screen layouts, never `100vh` (which runs under mobile navigation bars).
- **Touch Targets**: All interactive elements (buttons, node cards, pills) must be at least **44x44 px** with $\ge 8\text{px}$ clearance.
- **iOS Font Zoom**: All inputs, selects, and textareas must have `font-size: 16px` or higher.
- **Accessibility & Contrast**: Text contrast ratio must be $\ge 4.5:1$. Support both light and dark modes with `color-scheme: dark light;` and `@media (prefers-color-scheme: dark)`. Support `@media (prefers-reduced-motion: reduce)`.

---

## 5. Quality & Release Verification Pipeline

Before releasing any milestone or feature increment, strictly execute these 4 pipeline stages in order:
1. **Build Locally**: Run `npm test` $\to$ **100% pass rate**; run `npm run build` $\to$ Bundle size $<1\text{ MB}$, zero syntax errors.
2. **Built-in Browser Review**: Serve `dist/` on `http://localhost:4173/` for the human/developer to review visually and functionally in the IDE built-in browser tab.
3. **Commit Files**: Stage and commit approved changes to git on branch **`main`**.
4. **CloudCrane Build & Deploy**:
   - Call `check_publish` $\to$ **0 problems, 0 warnings**.
   - Call `publish_app` or `update_app` to deploy the verified bundle.
   - Call `look_at_app` $\to$ Confirm mobile layout on $390\times 844$ viewport.
   - Invoke `cloudcrane-qr` (`scripts/qr.js`) to generate and display the live scannable QR code and mobile install card.

---

## 6. Milestone & Roadmap Alignment

- **Milestone Tracking**: Always consult `plan.md` (Section 3) to identify the current milestone, deliverables, and architecture requirements.
- **Git Branch Discipline**: All work is tracked on the **`main`** branch.
- **Rollback Discipline**: If a deployment degrades mobile UX or fails live testing, execute `rollback_app` immediately before continuing.

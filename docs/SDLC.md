# AI-Native Software Development Lifecycle (SDLC)

This document defines the software engineering principles and verification methodology for the **RequestFlow** project.

## 1. Five Core Pillars

1. **Spec & Architecture First**:
   - Living specifications in `docs/SPEC.md` and `docs/ARCHITECTURE.md` are the single source of truth.
   - Code changes must reflect and update specifications synchronously.

2. **Modular Codebase**:
   - Business simulation and storage logic reside in `src/core/`, strictly isolated from presentation.
   - UI layer in `src/ui/` only renders state and dispatches touch events.

3. **Automated Testing & TDD**:
   - All components are verified through fast, deterministic Unit and Integration tests.
   - Native Node.js test runner (`node:test`, `node:assert`) executes in $<200\text{ ms}$ with zero dependencies.

4. **Deterministic Build & Validation**:
   - `scripts/bundle.js` compiles modular sources into the CloudCrane-compatible single-file bundle (`dist/index.html`).
   - Bundle size must remain $<1\text{ MB}$.

5. **Safe Iterative Delivery & Rollback**:
   - 3-Version milestone progression:
     - **v1**: Stable MVP pipeline with full test coverage.
     - **v2**: Deliberate regression (dense layout collision) verified on real phone viewports.
     - **Rollback**: Validated revert to v1 stability via `rollback_app`.
     - **v3**: Final polished release featuring interactive labs and backward-compatible schema migration.

## 2. Test Suites

### Unit Tests (`tests/unit/`)
- **`engine.test.js`**: Step calculations, bounds validation, scenario-based halting (`401`, `504`).
- **`storage.test.js`**: Schema migration engine (`v1 -> v2`) verifying state preservation.
- **`scenarios.test.js`**: Data contracts, request headers, and response status assertions.

### Integration Tests (`tests/integration/`)
- **`pipeline.test.js`**: End-to-end request simulation across all 5 nodes with latency recording.
- **`persistence.test.js`**: Full multi-action session persistence (request dispatch $\to$ storage write $\to$ reload).

## 3. Mandatory Quality Gates
No release is shipped without passing:
```bash
npm test                      # 100% pass rate
node scripts/bundle.js        # Valid bundle generation
check_publish                 # CloudCrane pre-flight pass
```

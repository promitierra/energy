# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Requires Node `^20.19.0 || >=22.12.0` (verified with Node 22 / npm 11; npm 9/10 crash resolving deps).

```bash
npm ci
npm run dev                 # Vite on :3000
npm run build               # tsc && vite build (output: build/)
npm test -- --run           # full suite, non-interactive (plain `npm test` is watch mode)
npm test -- --run src/tests/DecisionGuide.test.tsx   # single file
npm test -- --run -t "name" # single test by name
```

Test runner is **Vitest** (config lives in the `test` block of `vite.config.ts`, setup in `src/setupTests.ts`). Do not use Jest flags (`--testPathPattern`, `--onlyFailures`). `jest.config.js` is legacy and unused. See `docs/test-errors-roadmap.md` for known test-environment fixes.

## Architecture

Vite + React 18 + TypeScript + Tailwind 4 + Recharts SPA. UI text and docs are in Spanish; currency is COP.

- `App.tsx` → `ThemeProvider` → lazy `Dashboard`. `Dashboard.tsx` is a three-tab shell (`graficos`, `simulador`, `decision`); active tab is resolved from URL hash > `localStorage.activeTab` > default, and each tab content is lazy-loaded.
  - `graficos-comparativos.tsx`: static comparison charts (grid vs solar vs gas) using `components/charts/*`.
  - `components/SimuladorPersonalizado.tsx`: the custom simulator; composes `EquipmentEditor`, `SimulationCharts`, `SizingAdvice`.
  - `components/DecisionGuide.tsx`: question-driven recommendation wizard.
- **Solar model (`src/modules/solar/`)** is the core domain logic, kept as pure functions separate from the UI:
  - `model.ts`: `SolarInput`/`Equipment` types, `defaultEquipment`, `validateInput` (explicit range checks, returns Spanish error strings), `simulateSolar` (hourly dispatch over a synthetic 30-day month, 12 solar hours, with battery state carried across hours/days; on-grid vs off-grid differ in deficit/surplus handling).
  - `sizing.ts`: project-aware equipment sizing advice (on-grid / off-grid with autonomy days and peak load).
  - The simulator UI snapshots inputs and results per run and flags pending changes rather than recomputing live; keep that separation when editing.
- `docs/modelo-simulacion.md` is the authoritative description of the model equations, units (HSP is irradiation/1 kW·m⁻², not daylight hours; panel efficiency only estimates area), and deliberate simplifications. Update it when changing `model.ts` behavior. Panel/inverter/battery "features" are descriptive only and do not affect calculations.
- `docs/investigacion/` holds the Caquetá solar prefeasibility research and validated sources behind the comparison data.

## Conventions

- Tab semantics are tested for accessibility (`aria-controls`/labelled panels, skip link); preserve them when touching `Dashboard.tsx`.
- Recharts tests rely on the ResizeObserver mock in `src/tests/__mocks__/resizeObserver.js`.
- Tests live in `src/tests/` (model tests in `src/tests/utils/`), not beside the components.

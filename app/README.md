# Kinan vs. Worlds — Overhaul App (Phaser 3 + TypeScript + Vite)

This is the new, testable game runtime scaffolded in **Milestone 1** of the
overhaul (`MASTER_GAME_DESIGN_DOC.md` section 13). It is a foundation shell
only: placeholder visuals, no worlds/gameplay yet. Worlds 1–10 ship here as 2D
Phaser content; World 11 alone adds Three.js behind `src/engine/boundary.ts`.

All dependencies are pinned in `package.json` and bundled offline — no runtime
CDN, no trackers, no accounts.

## Commands

| Command | What it does |
|---|---|
| `npm ci` | Install pinned dependencies from the lockfile |
| `npm run dev` | Vite dev server (http://127.0.0.1:5173) |
| `npm run build` | Type-check + production build into `dist/` |
| `npm run preview` | Reproducible local preview of the built shell (http://127.0.0.1:4173) |
| `npm run preview:legacy` | Serve the quarantined legacy reference build (http://127.0.0.1:8080) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:unit` | Vitest unit tests (IDs, saves, quarantine/engine boundary) |
| `npm run test:e2e` | Playwright real-browser smoke + legacy quarantine checks |
| `npm run check` | Everything above in order (the milestone gate) |

## Automated gates

- **Unit tests** (`tests/unit/`) — stable IDs, save scaffolding + read-only
  legacy adapters, dev-gate policy, engine boundary.
- **Browser smoke** (`tests/e2e/smoke.spec.ts`) — real Chromium/Firefox/WebKit:
  the shell boots, renders a canvas, accepts input, fits desktop and
  touch-emulated viewports. **Any console or page error fails the test.**
- **Legacy quarantine** (`tests/e2e/legacy-quarantine.spec.ts`) — the real
  root `index.html`: no eager 3D scripts, `?w6`/`?creator=SHAD` blocked,
  `window.__k11` absent, legacy save keys preserved. See
  `docs/LEGACY-BOUNDARY.md`.
- **Save fixtures** (`tests/fixtures/saves/`) — sample `kinan-remaster-v1` and
  `k11v3` records for the M2 migration work. Legacy keys are read-only until
  a validated migration with backups exists.

## Coverage honesty

Automated results cover headless Chromium/Firefox/WebKit on this development
machine only. **Real devices (iPhone Safari, Android Chrome, iPad, tablets,
controllers), visual polish, audio, and measured frame rates are unverified**
until tested on representative hardware — per the master document, unavailable
coverage is labeled unverified, never "passed".

## Preview

```bash
npm ci
npm run check        # run the gates first
npm run preview      # then open http://127.0.0.1:4173
```

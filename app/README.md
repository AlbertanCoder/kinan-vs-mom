# Kinan vs. Worlds — Overhaul App (Phaser 3 + TypeScript + Vite)

The new, testable game runtime for the overhaul (`MASTER_GAME_DESIGN_DOC.md`).
Worlds 1–10 are 2D Phaser content; World 11 alone will use Three.js behind
`src/engine/boundary.ts` after its unlock. All dependencies are pinned in
`package.json` and bundled offline — no runtime CDN, no trackers, no accounts.

## What is implemented in this checkpoint

- **Prototype catalog, not finished worlds:** ten 2D world catalogs with 51
  deterministic generated stages covering the master-document themes. The
  optional challenges, authored stage mechanics/story/cutscenes, unique boss
  encounters, final art/animation, and world-by-world QA are not complete.
- **Fixed-timestep platformer prototype** — swept collisions, coyote time,
  jump buffering, variable jump height, deterministic simulation
  (`src/engine/platformer.ts`).
- **Deterministic seeded layouts** — same stage ID and options produce the
  same layout (`src/game/data/levels.ts`): coins, three stars, checkpoints,
  healing snacks, patrolling enemies, spikes, goals, and generic boss arenas.
- **Companion prototypes** — one-cat/one-dog loadout validation, initial pet
  and Friend Assist behaviors. Normal stage unlock scripting and every locked
  automatic/secondary ability are not complete; later world milestones remain.
- **Unified input foundation** — remappable keyboard bindings, gamepad polling,
  and adjustable touch buttons. Remapping UI and real-controller QA are pending.
- **Save kernel** — versioned `kinan-worlds-v1`, validated migration from
  `kinan-remaster-v1`/`k11v3`, verified last-known-good backups and recovery,
  plus local export/import. Legacy keys are read-only and never deleted.
- **Accessibility settings foundation** — separate volume state, captions,
  reduced motion, screen shake, and touch scaling. Full options/QA are pending.
- **Prototype procedural audio** — local WebAudio synthesis only (no CDN or
  browser-TTS). Final original adaptive music and reviewed voice assets are
  later asset milestones.

## Commands

| Command | What it does |
|---|---|
| `npm ci` | Install pinned dependencies from the lockfile |
| `npm run dev` | Vite dev server (http://127.0.0.1:5173) |
| `npm run build` | Production bundle into `dist/` (typecheck is separate) |
| `npm run preview` | Reproducible local preview of the built game (http://127.0.0.1:4173) |
| `npm run preview:legacy` | Serve the quarantined legacy reference build (http://127.0.0.1:8080) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:unit` | Vitest: physics determinism, levels, migration, saves, quarantine |
| `npm run test:e2e` | Playwright real-browser smoke, gameplay journey, legacy quarantine |
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

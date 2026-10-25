# Kinan vs. Worlds — Overhaul App (Phaser 3 + TypeScript + Vite)

The new, testable game runtime for the overhaul (`MASTER_GAME_DESIGN_DOC.md`).
Worlds 1–10 are 2D Phaser content; World 11 alone will use Three.js behind
`src/engine/boundary.ts` after its unlock. All dependencies are pinned in
`package.json` and bundled offline — no runtime CDN, no trackers, no accounts.

## What's playable now

- **Ten 2D worlds** (52 stages) from the master document: Saskatoon home,
  school, Alberta work trip, Edmonton, Calgary Stampede, Vancouver rain,
  LEGO realms, prehistoric, Starbase/Annie, and the Birthday Multiverse
  finale with the Grandmothers and Mom boss stages.
- **Fixed-timestep platformer controller** — swept collisions, coyote time,
  jump buffering, variable jump height, deterministic simulation
  (`src/engine/platformer.ts`).
- **Deterministic seeded stages** — same stage ID, same layout, every time
  (`src/game/data/levels.ts`): coins, three stars per stage, checkpoints,
  healing snacks, patrolling enemies, spikes, goal flags, boss arenas.
- **Companions** — one cat + one dog (or solo) with their locked abilities
  from the master doc §6.1 (Garfield's extra air jump, Vader's coin pull,
  Chikastino's bark stun, Hunter's fetch, Duchess's snack rest, Tuxedo's
  knockback reduction), plus one Friend Assist (Milo's buildable platform,
  Aiden's heal/distraction).
- **Unified input** — remappable keyboard, gamepad (dead zones, hot-plug
  safe), and adjustable touch controls (D-pad + Jump/Ability/Context).
- **Saves** — versioned `kinan-worlds-v1` with validated migration from
  `kinan-remaster-v1`/`k11v3`, backup-first commits, local export/import.
  Legacy keys are read-only and never deleted.
- **Accessibility settings** — separate music/SFX/voice volumes, captions,
  reduced motion, screen shake toggle, touch control scaling.
- **Offline procedural audio** — WebAudio synthesis only (no CDN, no
  browser-TTS); adaptive boss/music layers.

## Commands

| Command | What it does |
|---|---|
| `npm ci` | Install pinned dependencies from the lockfile |
| `npm run dev` | Vite dev server (http://127.0.0.1:5173) |
| `npm run build` | Type-check + production build into `dist/` |
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

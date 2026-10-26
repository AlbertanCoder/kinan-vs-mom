# Kinan vs. Worlds — Overhaul Tooling

> **Legacy-first decision (2026-10-25, Shad):** the Phaser skeleton below was a
> visual and feature downgrade: no pixel art, no Family Brawl, Kart, Builder,
> Party Shop or world map. It is **shelved**. The overhaul now builds on the
> real game in the repository root (`../index.html`) and improves it step by
> step. Every change must pass `tests/e2e/legacy-regression.spec.ts` (title,
> Story, Brawl, Kart, Builder, Shop, How to play, zero console errors).
>
> | Command | What it does now |
> |---|---|
> | `npm run preview` / `npm start` | Serve the **real game** at http://127.0.0.1:4173 |
> | `npm run check` | Typecheck + unit tests + legacy regression/quarantine browser gate |
> | `npm run preview:skeleton`, `build:skeleton`, `test:e2e:skeleton` | Shelved Phaser skeleton (port 4175), reference only |
>
> The save-migration and platformer modules in `src/` are kept as tested
> reference code to salvage into the real game where useful.
>
> **Legacy save recovery:** the root game now writes and re-read verifies a
> last-known-good `kinan-remaster-v1-backup` before replacing the current save.
> A damaged current record recovers from that backup; `k11v3` and its sound key
> remain read-only migration sources. The root keeps its existing save format
> rather than adopting the skeleton's incompatible stage mapping.
> `tests/e2e/legacy-save-recovery.spec.ts` covers backup order, recovery,
> migration, older sparse saves, and simulated storage failures.
>
> **Portrait orientation:** touch gameplay now shows an upright rotate-to-
> landscape gate instead of rotating the app 90°. Orientation pauses play and
> returning to landscape clears only that automatic pause, never a manual one.
> `tests/e2e/legacy-orientation.spec.ts` covers layout, desktop exclusion, and
> automatic/manual pause behavior with touch emulation.
>
> **Companion collection/loadout:** the real root game has named pets,
> title/map loadout menus, one-cat/one-dog or Solo selection, equipped-only
> followers, legacy-save defaults, and all six locked pet abilities.
> `tests/e2e/legacy-companions.spec.ts` covers migration, menu rules, follower
> counts, Zoomies, Neighbourhood Watch, Curious Force, Courage Fetch, Royal Snack
> Break, Senior Glare, cooldowns, and checkpoint/resume usage persistence.
>
> The original skeleton notes are kept below for history.

---

The shelved Phaser runtime prototype for the overhaul (`MASTER_GAME_DESIGN_DOC.md`).
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

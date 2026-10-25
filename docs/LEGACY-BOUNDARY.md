# Legacy Compatibility / Reference Boundary

**Status:** Milestone 1 quarantine — implemented on `overhaul/staging`.
**Controls:** `MASTER_GAME_DESIGN_DOC.md` sections 2–3 (safety rules and Phase 1 audit).

The pre-overhaul game remains in the repository root as a **compatibility /
reference build**. It is not the new production runtime, and its failed 3D path
is quarantined rather than deleted, so nothing historical is lost (the full
unpublished experiment also lives on the read-only `archive/world6-experiment`
branch).

## What is quarantined

| Surface | Old behavior | Now |
|---|---|---|
| `galaxy3d.js` / `galaxy3d-models.js` | Eager `<script>` tags in `index.html` | Loaded only with **`?devtools=1` AND a localhost / 127.0.0.1 / `[::1]` host** |
| `?w6=play` / `?w6=cutscene` | Public shortcut straight into the 3D galaxy level | Same developer-only gate; inert in production and in shared links |
| `?creator=SHAD` | Unlocked every world/stage for one hour and saved `creatorUntil` | Developer-only gate; `creatorActive()` returns `false` otherwise, even if an old save still holds `creatorUntil` |
| `window.__k11` debug hooks | Always exposed (`godMode`, `killBosses`, `grantPets`, …) | Developer-only gate; `undefined` in production |
| World 5 → 6 3D handoff (`playGalaxy3D`) | Handed the stage to WebGL | Developer-only gate; shows an "archived" toast and returns to the 2D map |
| `sw.js` precache | Precached `galaxy3d*.js` | Removed; cache bumped `kinan-vs-mom-v15` → `kinan-vs-mom-v16` |

The gate requires an **explicit flag and a local host together**, so the live
GitHub Pages site and any shared Netlify/preview link can never enable it.
Developer tooling stays explicit, local, and non-production.

## What is preserved (never deleted)

- `index.html`, `galaxy3d.js`, `galaxy3d-models.js` — the reference build itself.
- Player saves: `localStorage["kinan-remaster-v1"]`, `localStorage["k11v3"]`,
  `localStorage["k11v3-sound"]`. The new runtime may read these only through the
  read-only adapters in `app/src/shared/save.ts`; migration lands in M2 only
  after fixtures validate and a last-known-good backup succeeds.
- The archived 26/26 mocked 3D smoke harness on `archive/world6-experiment`.
  It is **historical context only** — mocked DOM/WebGL is not proof of rendering,
  touch, frame rate, or physics quality.

## Running the reference build locally

```bash
node tools/preview-server.mjs --root . --port 8080
# open http://127.0.0.1:8080/index.html
# add &devtools=1 to the URL to load the archived 3D experiment locally
```

## Verified by

- `app/tests/unit/quarantine.test.ts` — gate policy and engine boundary.
- `app/tests/e2e/legacy-quarantine.spec.ts` — real-browser checks against this
  exact `index.html`: no eager 3D scripts, `?w6`/`?creator=SHAD` blocked,
  `window.__k11` absent, legacy save keys preserved, dev gate still works locally.

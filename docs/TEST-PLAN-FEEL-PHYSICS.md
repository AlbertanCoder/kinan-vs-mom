# TE-1 Test Plan — Feel & Physics (movement, camera, terrain)

**Owner:** Test Engineer 1 ("Feel & Physics") · **Partner:** TE-2 (Systems & Flow)
**Repo:** `C:\Users\SHADHUNTER\Desktop\Kinan vs. Mom` · branch `feature/worlds-6-10`
**Gate:** `cd app && npm run check` (tsc --noEmit → vitest unit → Playwright e2e, 4 browser projects)

This document maps every feel / camera / terrain line from the controlling design sources to the
exact assertion that protects it. **Nothing here is allowed to silently rot.**

---

## 1. Source lines being pinned

| Source | Section | What it demands |
|---|---|---|
| `MASTER_GAME_DESIGN_DOC.md` §4.2 | Movement, Physics, Input | fixed-timestep controller, swept collisions, coyote time, jump buffering, variable jump height, deterministic replay fixtures, no rigid-body physics |
| `MASTER_GAME_DESIGN_DOC.md` §5.1 | Kinan and 2D Art | gameplay simulation stays 60 Hz; subtle squash-and-stretch **without harming timing** |
| `docs/KINAN-VS-WORLDS-TECHNICAL-PLAN.md` | Controls / camera | smart auto-camera (3D swipe orbit is engine-side) |
| `docs/GAME-DESIGN-CONTRACT.md` **FEEL SPEC** | ⏳ **PENDING — not yet written by the Architect** | rows scaffolded in §3; numbers slot in when the contract lands |
| `docs/GAME-DESIGN-CONTRACT.md` **CAMERA SPEC** | ⏳ **PENDING** | rows scaffolded in §3 |

## 2. Characterization snapshot — CURRENT engine numbers (pre-rebuild)

Extracted from `index.html` (source lines cited). Pinned by
`app/tests/unit/legacy-feel-pins.test.ts`; any Builder rewrite must move these pins **in the same
commit** and say so — never silently.

| # | Number | Value | Source |
|---|---|---|---|
| K1 | `T` tile / `W` view / `H` view / `ROWS` / `GROUND` | 16 / 432 / 240 / 15 / 11 | index.html:740 |
| K2 | `RUN_MAX` top speed | 3.0 px/frame | :741 |
| K3 | `JUMP_V` | −8.2 px/frame | :741 |
| K4 | `AIR_JUMP_V` (Garfield double jump) | −7.4 | :741 |
| K5 | `MAX_FALL` | 8.6 px/frame (floaty worlds 6.2) | :741, :3321 |
| K6 | `GRAV_HOLD` / `GRAV_TAP` / `GRAV_FALL` | 0.38 / 0.48 / 0.62 px/frame² | :742 |
| K7 | ground accel / air accel | 0.55 / 0.38 (ice 0.16, slime 0.3) | :3280 |
| K8 | ground friction / air drag | ×0.76 / ×0.96 (ice 0.975, slime 0.93), snap <0.08 | :3291-3292 |
| K9 | coyote | 7 frames set on ground; jump reads `coyote > 0` ⇒ fires ≤6 air-frames after leaving | :3300-3303 |
| K10 | jump buffer | 8 set on press (smash 10); decrement-then-check ⇒ fires on landing ≤7 updates after press | :2567, :3305-3306 |
| K11 | variable jump | **no velocity cut** — gravity-only: hold 0.38 vs tap 0.48 while `vy < 0` | :3317-3320 |
| K12 | jump feedback | `stretch=8` on jump, 7 on air jump | :3309, :3311 |
| K13 | landing feedback | `landT=7`, `squash=6` on touchdown, dust if `|vy|>2`; both decay 1/frame | :3339-3341, :3347-3348 |
| K14 | spring tile 6 | `vy=-10.4`, `springy` | :3333-3334 |
| K15 | stomp bounce | foe −6.0 tap / −7.8 hold (`squash=4`); umbrella bat −6.2/−7.8; mall walker −7.4 | :4089, :4095, :4081 |
| K16 | boss stomp bounce | −6.2/−6.4/−8.4-hold by boss (`squash=5`) | :4813-4847 |
| K17 | terrain solids | tiles 1–6 solid; 7 = one-way shelf; level x-edges solid; y-outside air | :2761-2767, :2236-2237 |
| K18 | one-way rule | land on 7 only if `oldBottom ≤ ty*T + 0.01`; rising ignores 7 | :2788 |
| K19 | collision snaps | wall `x=tx*T−w`, floor `y=ty*T−h`, ceiling `y=(ty+1)*T`, `vx/vy=0` exactly | :2769-2797 |
| K20 | camera X | `camX = round(clamp(px + w/2 − W*0.42, lo, hi))` — anchor 42%, **no deadzone, no smoothing** | :4876-4882 |
| K21 | camera clamps | `lo=0` (or `arenaX*T` in boss fight), `hi=min(L.w*T−W, (arenaX+arenaW+1)*T−W)` | :4879-4880 |
| K22 | camera Y | story stages `camY=0` pinned; tall levels (`L.up`) lerp `*0.2`, snap `<0.5` | :4883-4888 |

### Derived feel numbers (pinned by the `legacy-feel-arc.test.ts` simulator)

| # | Property | Value | How derived |
|---|---|---|---|
| D1 | hold-jump apex | ≈ 84.4 px (≈ 5.3 tiles) | Σ(8.2−0.38n), n=1..21 |
| D2 | tap-jump apex | ≈ 66.0 px | Σ(8.2−0.48n), n=1..17 |
| D3 | variable-jump delta | ≈ 18.5 px | D1−D2 (gravity-only, no velocity cut) |
| D4 | jump rise | 21 frames hold / 17 tap | first post-grav `vy≥0` |
| D5 | full jump airtime | ≈ 38–39 frames (≈ 630 ms) | rise + fall at 0.62→8.6 cap |
| D6 | frames to top speed | 6 frames (≈ 100 ms) | 0.55/frame → clamp 3.0 |
| D7 | stop from top speed | 14 frames, ≈ 12.2 px | ×0.76/frame → snap 0.08 |
| D8 | terminal fall | exactly 8.6 px/frame | `min(MAX_FALL, …)` |
| D9 | spring apex | ≈ 137.2 px (held) | Σ(10.4−0.38n), n=1..27 |
| D10 | stomp apex tap / hold(−6.0) / hold(−7.8) | ≈ 34.6 / 44.4 / 76.2 px | Σ bounce−grav |
| D11 | coyote window | ≤6 updates after leaving ground | decrement-before-check order |
| D12 | buffer window | ≤7 updates after press | decrement-before-check order |
| D13 | determinism | identical inputs ⇒ identical states | replay fixture |

## 3. Contract mapping — spec line → protecting assertion

Status legend: ✅ pinned now (characterization) · 🟡 scaffolded, target value awaits
`docs/GAME-DESIGN-CONTRACT.md` · ➖ owned elsewhere.

| Contract / spec line | Status | Assertion (test name) | Suite |
|---|---|---|---|
| 4.2 fixed timestep, no rigid-body | ✅ | source pins: accumulator loop `step = 1000/60` + custom `moveX/moveY` | unit pins |
| 4.2 coyote time | ✅ | `a jump within six frames of leaving the ground still fires (coyote)` / `a jump seven frames after leaving the ground is too late (coyote)` | e2e physics; unit arc |
| 4.2 jump buffering | ✅ | `a jump pressed just before landing fires on touchdown (buffer)` / `a jump pressed too early before landing is forgotten (buffer)` | e2e physics; unit arc |
| 4.2 variable jump height | ✅ | `letting go of jump early is a shorter hop (variable jump)` + D1–D3 | e2e physics; unit arc |
| 4.2 deterministic replay | ✅ | `is deterministic: identical inputs give identical states (arc)` | unit arc |
| 4.2 swept collisions / no tunneling | ✅ | `never tunnels through a one-tile floor at terminal speed (swept)` | unit terrain |
| 5.1 squash/stretch w/o harming timing | ✅ | `keeps squash/stretch feedback at six to eight frames so it never delays the next move` (K12/K13) | unit pins |
| FEEL: top speed | ✅ | `runs at exactly 3.0 px per frame (top speed)` | e2e physics |
| FEEL: acceleration | ✅ | `reaches top speed in about six frames (acceleration)` | e2e physics |
| FEEL: stopping | ✅ | `stops from a full run in about fourteen frames (friction)` | e2e physics |
| FEEL: jump arc | ✅ | `a held jump rises about 84 px and lands about 630 ms later (jump arc)` | e2e physics; unit arc |
| FEEL: gravity / terminal | ✅ | `falls at exactly 8.6 px per frame (terminal fall)` | e2e physics |
| FEEL: stomp bounce | ✅ | `stomping bounces -6.0, or -7.8 with jump held (stomp bounce)` | e2e physics; unit arc |
| FEEL: air control | 🟡 | `keeps air control below ground authority (air control)` — current pin 0.38 vs 0.55; target ratio from contract | unit arc |
| FEEL: jump arc **target** | 🟡 | D1/D2 re-anchored to contract targets when FEEL SPEC lands | unit arc |
| FEEL: squash/stretch **timing** | 🟡 | K12/K13 pinned at source; live probe request (§6) for runtime values | unit pins |
| FEEL: landing feedback latency | 🟡 | K13: `landT=7` set on the landing frame itself — target from contract | unit pins |
| CAM: 2-axis follow | ✅ now / 🟡 target | `keeps Kinan at 42% of the screen while running (camera anchor)` + `camera X follows 1:1 with no smoothing lag (camera smoothing pin)` | e2e camera |
| CAM: deadzone | 🟡 | `a small step near the anchor moves the camera immediately (deadzone pin)` — flips when contract defines one | e2e camera |
| CAM: lookahead | 🟡 | scaffolded — current engine has none; contract target pending | e2e camera |
| CAM: smoothing | 🟡 | covered by the smoothing pin (current: instant, rounded) | e2e camera |
| CAM: clamps | ✅ | `never scrolls left of the level start (camera clamp)` / `never scrolls past the level end (camera clamp)` / `stays inside the boss arena (camera clamp)` | e2e camera |
| CAM: fast falls / high jumps | ✅ | `stays anchored during fast falls and high jumps (camera vertical pin)` | e2e camera |
| CAM: camY easing | ✅ | `eases vertical follow at 0.2 per frame and snaps under half a pixel (camY easing)` | unit camera |
| TERRAIN: walls | ✅ | `a wall stops Kinan exactly at the tile edge (wall snap)` both level edges | e2e terrain; unit terrain |
| TERRAIN: one-way shelves | ✅ | `a one-way shelf catches you from above (one-way)` / `a one-way shelf never blocks a jump from below (one-way)` | e2e terrain; unit terrain |
| TERRAIN: stairs | ✅ | unit step predicates + `walking off a ledge drops you (ledge)` | unit + e2e terrain |
| TERRAIN: ledges vs snapping | ✅ | `walking off a ledge drops you — nothing snaps you back (ledge)` | e2e terrain |
| TERRAIN: ceiling bonk | ✅ | `a ceiling bonk stops the rise exactly under the tile (ceiling snap)` | e2e terrain; unit terrain |
| TERRAIN: slopes | ➖ | current engine is a pure tile grid (no slope primitives) — slope spec flagged for the Architect | — |
| World flow, saves, seams | ➖ | `legacy-world*`, `legacy-save*`, `legacy-flow-*` | TE-2 |

## 4. Suite inventory

| File | What it pins | Kind |
|---|---|---|
| `app/tests/unit/legacy-feel-pins.test.ts` | K1–K22 — characterization snapshot parsed from `index.html` source | vitest |
| `app/tests/unit/legacy-feel-arc.test.ts` | D1–D13 — arc/timer simulator, faithful to `updatePlayer()` order | vitest |
| `app/tests/unit/legacy-feel-terrain.test.ts` | K17–K19 semantics — `solid`/`moveX`/`moveY` predicates | vitest |
| `app/tests/unit/legacy-feel-camera.test.ts` | K20–K22 — camera model + camY easing | vitest |
| `app/tests/e2e/legacy-feel-physics.spec.ts` | live top speed, accel, friction, jump arc, terminal fall, coyote, buffer, variable jump, stomp bounce | Playwright ×4 |
| `app/tests/e2e/legacy-feel-camera.spec.ts` | live anchor, clamps (start/end/arena), 1:1 tracking, vertical pin | Playwright ×4 |
| `app/tests/e2e/legacy-feel-terrain.spec.ts` | live wall snaps, ledge fall, one-way both directions, ceiling bonk | Playwright ×4 |

## 5. Known traps baked into every seed / probe

| Trap | Mitigation |
|---|---|
| ~~Worlds 2–5 open via reward codes~~ (removed 2026-10-28: every world opens by playing) | seeds no longer set `data.codes` |
| `nextStage()` scans the NEWEST open world first; `wonWorlds` must match `beaten` | seeds keep the shared sample fixture's consistent `wonWorlds`/`beaten` untouched |
| save fixture leaks `mapWorld/mapSeen/mapSel/explorer` | every seed resets `mapWorld=1`, `mapSeen={}`, `mapSel={}`, deletes `explorer` |
| fixture pets grant Garfield double jump (`airJumps=1`) | feel seeds clear `pets.ids` — base feel is measured petless |
| `#dialog` lives INSIDE `#stage` (hidden on menus) | `dismissStory()` clicks `#dialog` (force) until hidden, only after `#stage` is up |
| START pulses (`{ force: true }`) | feel suites boot via `__k11.jumpToStage()` on the dev URL — never the START button |
| WebKit paints late | all live checks use `expect.poll` / in-page rAF recorders; no single-shot canvas reads |
| `tsc --noEmit` strict-null | every probe return is type-declared and type-guarded |

## 6. Probe requests to the Engine & Terrain Builder (dev-gate only — TE-1 never edits game code)

| Request | Why |
|---|---|
| expose `squash`, `stretch`, `landT`, `landTile`, `camY` (and `vx` is already there) in `window.__k11.probe()` | live-pin squash/stretch timing, landing latency, spring bounce and camY easing at rebuild time |
| nothing else — `probe()/platforms()/place()/dropOnFoe()` already cover ~95% of measurements | |

## 7. Gate report

_Filled after each gate run; latest also lands in `KINAN_VS_WORLDS_LATEST_HANDOFF.md`._

| Run | typecheck | unit | e2e | Notes |
|---|---|---|---|---|
| (pending) | | | | |



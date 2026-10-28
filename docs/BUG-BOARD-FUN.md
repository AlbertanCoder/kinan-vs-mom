# BUG BOARD — FUN (Quality Control 1 · "The Kid")

**Owner:** QC-1 (fun & feel). **Partner:** QC-2 (`docs/BUG-BOARD-TECH.md` — crashes/saves/rendering/gates).
**Rule:** QC never edits game code. Findings live here only.

**Session:** 2026-10-26 · build `bb825a1` (clean tree) · World 1 focus + all-worlds atmosphere sweep.
**Evidence method:** headless Chromium (the repo's own Playwright) at 1280×720 desktop, driving the real
`index.html` via the `?devtools=1` harness (localhost). Screenshots + runtime telemetry captured and
reviewed. Shots kept out-of-repo at `C:\Users\SHADHUNTER\qc1-review\shots\`.
**Coverage honesty:** no ears (AUDIO = UNVERIFIED), no hands/controller/touch (DEVICE = UNVERIFIED),
no phone/tablet viewport, no full sequential world clear (boss tested via auto-drive only). Labels are
strict: VISUAL = reviewed screenshots of the running game; AUTOMATED = command/telemetry with counts.

---

## TOP 10 FUN BLOCKERS (ranked)

1. **FUN-001** every stage is the same stage (FUN-BLOCKER)
2. **FUN-002** first screen after START is a confusing scatter-lawn (FUN-BLOCKER)
3. **FUN-003** running has no weight — instant top speed (MAJOR)
4. **FUN-004** camera is welded to Kinan — no life (MAJOR)
5. **FUN-005** title screen sells an 11-stage game, not 11 worlds (MAJOR)
6. **FUN-006** boss arenas are flat empty strips (MAJOR)
7. **FUN-011** foes parked at pit lips double-punish one mistake (MINOR — fairness)
8. **FUN-007** giant touch buttons eat the screen on keyboard/desktop (MINOR)
9. **FUN-008** stage titles read "· 2D" on Worlds 6–11 (MINOR)
10. **FUN-009** map card says "STAGE 1 OF 1" (MINOR)

*(FUN-010 puzzle-room auto-entry just missed the list — but see Session 2: it swallowed runners on
5 of 11 World 1 stages, so its severity is under review.)*

---

## FINDINGS

### FUN-001 · SEVERITY: FUN-BLOCKER
**EVIDENCE:** AUTOMATED (`build()` index.html:2248–2361 & `buildGalaxy()` :2365–2429; stage probe
telemetry) + VISUAL (spawn screens of stages 3/15/25/35/45/54/60/64/69/74/78 reviewed).
**MOMENT:** Every stage, any world: 10 flat tiles → pet box at 20% → checkpoint at 50% → ~10 recycled
chunk recipes → ramp → runway → same 28-wide boss strip → boss. Same skeleton, 82 stages.
**WHY NOT FUN:** the producer's verdict "breadth is not quality" is this exact thing. By stage 3 of a
world I've seen every layout the game has. Colors and enemy sprites change; the *playground* never does.
A friend watching can't tell World 2 from World 7 in how it PLAYS.
**SUGGESTED FIX (direction):** each stage gets ONE handcrafted signature set piece + ONE secret (authored
tile data on top of the procedural engine — the engine is fine for connective tissue). World 1 first: a
bed to bounce on, a sock avalanche, a cake-tower climb. Toy *density* is fine (stage 1: 40 candles, 8
foes, gifts, springs, puzzle room); what's missing is novelty, not stuff.

### FUN-002 · SEVERITY: FUN-BLOCKER
**EVIDENCE:** VISUAL (`20-story-dialog.png` / `20b-after-story.png` — first screen after pressing START).
**MOMENT:** Title → START → land on the playable overworld: a giant green checkerboard lawn with ~30
identical pink houses/trees/rocks scattered at random. Toast: "walk the path to a stage dot!" — but no
path and no stage dot is visible on screen. Kinan stands alone at the left edge.
**WHY NOT FUN:** this is the FIRST thing the birthday kid sees after pressing START. I don't know where
to go, what the houses are, or where a stage is. Meanwhile the *menu* map (Stage map screen) is a
gorgeous SMW-style diorama of the house — the playable overworld looks like a different, worse game.
**SUGGESTED FIX:** open with the stage dot + visible path in frame (spawn next to it, camera framing it),
thin the scatter, restyle the overworld ground to the diorama's quality. `27-world-map.png` is the bar.

### FUN-003 · SEVERITY: MAJOR
**EVIDENCE:** AUTOMATED (telemetry `qc1-review/telemetry.json`: from standstill, px 32→46→67→85→106…
= 0→~78% top speed within 100 ms; top ≈ 3.0 px/frame = `RUN_MAX`; accel 0.55/frame² `index.html:3280`).
**MOMENT:** any stage, first tap of →.
**WHY NOT FUN:** compared honestly to Super Mario World: Mario *builds* into his run and skids to turn —
the momentum IS the feel. Here Kinan reaches full speed in ~6 frames; runs feel weightless and turning
around costs nothing. The pieces are already here (skid dust, squash/stretch) — there's no weight under them.
**SUGGESTED FIX:** ground accel down (~0.5s to top speed), top speed up a touch, keep air control as-is
so kids don't feel punished. Test Engineer 1 (`legacy-feel-*`) should pin whatever numbers we choose.

### FUN-004 · SEVERITY: MAJOR
**EVIDENCE:** AUTOMATED (`updateCamera()` index.html:4876–4888: `camX = clamp(Math.round(P.x - W*0.42))`
every frame — no dead zone, no lookahead, no easing on X; only camY eases 0.2) + VISUAL (run frames:
the world scrolls at exactly player speed).
**MOMENT:** all gameplay.
**WHY NOT FUN:** the camera is welded to Kinan's chest. SMW's camera leads you toward where you're going
and lets you wander inside a dead zone — it has personality. Ours is a perfectly rigid treadmill;
combined with FUN-003 it feeds the "moving platforms in front of a picture" feeling the producer called
out. (Screen shake is deliberately off for phones — `shakeIt()` index.html:2822 — fine: a camera can
move without shaking.)
**SUGGESTED FIX:** small dead zone (±24px) + lookahead in facing direction + gentle lerp on X, clamped as
now. Cheapest "Mario feel" win in the codebase.

### FUN-005 · SEVERITY: MAJOR
**EVIDENCE:** VISUAL (`01-title.png`) + AUTOMATED (hardcoded subline `index.html:9303`).
**MOMENT:** the title screen reads "Story mode · START — 11 stages · 1 birthday · 4 cats · 2 dogs".
**WHY NOT FUN:** the game has 11 WORLDS and 82 stages. "11 stages" tells me (and any friend I show) this
is a tiny game — I almost didn't click it. Header branding is also still "KINAN vs. MOM · BIRTHDAY
REMASTER" while the game is now "Kinan vs. Worlds".
**SUGGESTED FIX:** subline → "11 worlds · 80+ stages · 4 cats · 2 dogs · kart · brawls · builder"; align
the title lockup with "Kinan vs. Worlds" (keep "Birthday Remaster" as a subtitle if wanted).

### FUN-006 · SEVERITY: MAJOR
**EVIDENCE:** VISUAL (`09-boss-fight.png`: Mom boss on a dead-flat strip; ~60% of the arena is empty
ground) + AUTOMATED (arena is a flat `arenaW=28` strip, `build()` :2354–2356).
**MOMENT:** every boss arena, e.g. World 1 finale "Birthday Cake Volcano".
**WHY NOT FUN:** the world finale is the moment to show off and it's the flattest screen in the game.
Nothing to jump on, hide behind, or lure the boss into — stomp loops on open floor. This is the "flat
platforms" half of the producer's failure mode, in the most important fight.
**SUGGESTED FIX:** arena furniture per boss theme (cake tiers to climb, tables to vault, the fence the
moose already dizzies into as real terrain). Let bosses destroy scenery for free drama.

### FUN-007 · SEVERITY: MINOR
**EVIDENCE:** VISUAL (every gameplay screenshot: the ← → POW JUMP bar occupies the bottom ~22% of the
window on a 1280×720 desktop viewport).
**MOMENT:** all gameplay on keyboard/desktop.
**WHY NOT FUN:** it shrinks the game view and makes a laptop feel like a phone stuck in portrait. A kid
at a keyboard doesn't need 4 giant buttons.
**SUGGESTED FIX:** hide the pad when a keyboard is used (or no touch events seen), restore on touch.
Keep the tiny key legend.

### FUN-008 · SEVERITY: MINOR
**EVIDENCE:** VISUAL (`10-world-stage-60.png` / `-78.png`: title toasts read "Studded Skyscraper Tower ·
2D", "Depth Drop Caverns · 2D") + AUTOMATED (`expandedStage()` sets `clock: '2D'` `index.html:1810`;
printed by the stage toast `index.html:3183`).
**MOMENT:** stage-start toast on Worlds 6–11.
**WHY NOT FUN:** "· 2D" reads like a debug leftover. World 1 shows a lovely "10:30 am"; the expanded
worlds show a dimension label.
**SUGGESTED FIX:** give expanded worlds a clock/flavor ("glitch o'clock", "home for cake") or drop the tag.

### FUN-009 · SEVERITY: MINOR
**EVIDENCE:** VISUAL (`27-world-map.png`: card reads "STAGE 1 OF 1" while the same screen says "0 of 11
cleared") + AUTOMATED (`index.html:15093` uses `M.openN` = count of *opened* stages, not world total).
**MOMENT:** Stage map → any world → stage card.
**WHY NOT FUN:** "1 of 1" beside "0 of 11 cleared" reads broken; I briefly thought the world had one stage.
**SUGGESTED FIX:** "STAGE 1 OF 11" (world total) or just "STAGE 1 · KINAN'S BEDROOM".

### FUN-010 · SEVERITY: POLISH
**EVIDENCE:** VISUAL (`22/23/24/25` shots: auto-driven play was teleported into "PUZZLE ROOM" twice just
by running right) + AUTOMATED (entry is a raw overlap test `index.html:3533`).
**MOMENT:** sprinting mid-stage and touching the floating puzzle piece.
**WHY NOT FUN:** the puzzle room ("FOLLOW THE DOTS" — genuinely cute!) interrupts the run without asking;
half the time I didn't mean to go in. Momentum killer.
**SUGGESTED FIX:** make entry a choice — press ↑ / jump into the piece, or a 1-second "enter? (Y/N)" pause.

### FUN-011 · SEVERITY: MINOR (fairness — the 9-year-old's "that's CHEAP" alarm)
**EVIDENCE:** AUTOMATED (break-it trail `qc1-review/w1-break.json` + death-check log: at px≈733–742 on
stage 3 "The Kitchen", one foe contact → hp 2→1→0 and Kinan knocked into the adjacent pit, py 194→257→281
(below the world); death dialog then holds the run) + VISUAL (`death-check.png`, `s2-mid.png`: the toast
foe stands at the pit lip).
**MOMENT:** walking (not even running badly) near a gap where a foe patrols the edge. One touch = lost
heart + knockback INTO the hole + death + checkpoint run-back.
**WHY NOT FUN:** one mistake should cost one thing. Playbook §2 says "pit costs a heart + respawn" — this
costs three (heart, death dialog, the run-back). The cheapness is the *combination*, and enemy placement
is what creates it.
**SUGGESTED FIX (design rule, Level Designer + Builder):** no foe within 3 tiles of a drop lip in act 1–2
(or face it away from the gap); and/or hurt knockback never points toward open air. Worth a line in
LEVEL-PLAYBOOK §2 so 1-1/1-2/1-3 inherit it.

---

# ===== SESSION 2 — 2026-10-26 PM · World 1 full pass + contract cross-walk =====

**Build under review:** working tree `5ea5315` + the Builder's uncommitted M1 (FEEL/LEGACY_FEEL dual
tuning in `index.html`). One milestone = one code editor at a time: the Builder is that editor; QC-1
edited only this board. **Method:** all 11 World 1 stages driven sequentially end-to-end, a dumb-input
break-it pass, and a death-flow probe (harness `qc1-pass3/4/5`, out-of-repo).

## 2.1 Cross-walk: Session 1 findings vs the APPROVED contract

| Finding | Contract home | Status after Session 2 |
|---|---|---|
| FUN-001 same skeleton | §8.1.1 delete `build(i)`; ER-1 authored-terrain hook; Playbook §1 3-act | **FIX SPEC'D** — awaiting Builder ER-1 + Level Designer content. 1-1 paper design passes my audit (below). |
| FUN-002 scatter-lawn overworld | §8.1.3 map intermissions leave the core loop; §4 zero screens | **FIX SPEC'D** — the screen leaves the core loop; party map survives as a side mode only. |
| FUN-003 no momentum | §1.1 LOCKED table (ACC_GROUND 0.30 → RUN_MAX in ~11f, WALK_MAX 1.9, ACC_SKID) | **FIX SPEC'D + IN PROGRESS** — Builder's M1 WIP already carries the exact §1.1 `FEEL` object; legacy tuning frozen as `LEGACY_FEEL`. |
| FUN-004 welded camera | §3 (48×40 deadzone, velocity lead, 0.14 lerp, apex-lead, never-clamp-on-fun) | **FIX SPEC'D** — awaiting Builder M3. My acceptance tip: §3's "max per-frame camX delta < 1.5px at RUN_MAX" is exactly the right probe. |
| FUN-005 title undersells | (not covered explicitly) | **OPEN** — small; suggest the Builder touch it in the M6 seam pass ("Title → PLAY in one action" §7). |
| FUN-006 flat boss arenas | §4.2 arenas live in the terrain; ER-3 gate/bridge set-piece | **FIX SPEC'D** — re-confirmed visually this session (`s10-boss.png`: still a flat strip today). |
| FUN-007 desktop touch pad | (not covered) | **OPEN** — cosmetic; fine to defer past Slice 1. |
| FUN-008 "· 2D" toast | legacy artifact | **MOOT in new core** (legacy stages keep it; harmless). |
| FUN-009 "STAGE 1 OF 1" | §8.1.3 (map leaves core loop) | **MOOT in core** — fix in the party side-mode map if it ships. |
| FUN-010 puzzle auto-entry | §6 puzzle rooms → Party side modes, out of Slice 1 | **MOOT in core** — but see 2.2 evidence note. |
| FUN-011 pit-lip foes | Playbook §2 punish level | **NEW (this session)** — needs a playbook rule; see finding above. |

## 2.2 Session 2 play evidence (World 1, all 11 stages, sequential)

- **Builder's uncommitted M1 is stable on the legacy game:** all 11 stages drove clean end-to-end with
  **zero console/page errors** (AUTOMATED, `w1-pass.json`). Boss fights engaged on stages 2–5 and 10–11
  (`boss=fight`); stages 6–9 show `boss=off` after warp — likely stage-level boss config, noted not filed.
- **FUN-010 escalated:** a right-holding runner finished its samples *inside puzzle rooms on 5 of 11
  stages* (px 210–406 = the 27-tile room's coordinates). The rooms are cute; the swallowing is constant.
- **FUN-006 re-confirmed** on the rebuilt pass: `s10-boss.png` — Mom fight on a dead-flat strip again.
- **Toy density confirmed mid-stage** (`s2-mid.png`, "The Kitchen"): 3 platform heights, toast foes, a
  pet crate, and a mid-run pet unlock ("Vader joined your collection! Curious Force…") — this is the
  delight level every screen needs.
- **Death flow is a JOY positive:** losing your last heart pauses with
  *"ROBIN: Shake it off, bud. Back to the checkpoint!"* — a family voice coaching you back. Verified it
  is a click-to-continue dialog, NOT a hang.
- **Damage feel (legacy):** knockback pop exists but `HURT_HITSTOP: 0` — no hit-stop on hurt in legacy
  tuning. Contract §1.3 (6-frame hit-stop) is the fix and it is already spec'd.

## 2.3 Paper audit — World 1 level designs (Contract §2.4 + §5.3, pre-tile sign-off)

- **1-1 "The Wild Yard" — PAPER PASS ✓ (provisional).** All 6 screens carry named toys
  (bounce/break/discover), ≥6 named motions each, exactly 3 secrets + golden candle per the §4.4 ledger,
  one idea (slopes), gap sizes within §2 limits (3/4/5), breath + reward screens placed. First-10-seconds
  fix verified: A1 opens "spawn flat → stomp the first bug → climb" (vs the old dead-flat runway).
- **RISK FLAG:** 1-1's ONE IDEA is slopes, and slopes need ER-2 (the engine has no slope code). With the
  stated work-around (stepped ledges) the level loses its identity. Either ER-2 lands before 1-1 content
  is judged, or 1-1's idea is re-chosen. Calling it now so nobody discovers it at the demo.
- **1-2 / 1-3 — NOT YET DELIVERED** (expected per SPRINT-PLAN M4–M5). Audit will follow the 1-1 format.

## 2.4 Ready for Slice 1: the standing audit checklist (my §2.4/§5.3 duty)

When the Builder's terrain + the Designer's content land, QC-1 audits **every screen** of World 1 for:
1. ≥1 toy (bounce / break / discover) — a screen without one is a BUG filed here.
2. ≥6 motions — counted on screen, not on paper.
3. The 10-second test: run, jump, and ask "would I show a friend THIS screen?"
4. Seam walk: title → 1-1 → Mom fight → World 2 entry with zero screens (contract §7).

---

# ===== SESSION 3 — 2026-10-26 PM · Paper audit rev-2 + rulings closeout =====

**Trigger:** Slice 1 is not yet playable for QC (no `L.newWorld` stages in the tree — Builder M1–M3 in
flight), so this session judges what CAN be judged: the Architect's mid-Slice-1 rulings (handoff,
commit `da535e8`) + the Level Designer's 1-1 **Revision 2** (normative geometry, ready-to-wire
`AREA_1_1`, story storyboard).

## 3.1 Rulings cross-walk (all four Session-1/2 design requests answered)

| My request | Ruling | My status |
|---|---|---|
| #1 signature set-piece per stage (FUN-001) | **ACCEPTED** — Playbook §5 DoD amended: the set-piece is NAMED on the paper design before tiles; "procedural chunks are connective tissue only" | **CLOSED** — exactly what I asked for |
| #2 overworld art pass (FUN-002) | **SUPERSEDED** for the core loop — §4 seams remove the overworld from the adventure entirely; party map stays a side mode | **ACCEPTED** — the fix became "the screen leaves the core loop", which is stronger than my ask |
| #3 boss-arena kit (FUN-006) | **ACCEPTED into M5 scope** (arena-furniture) | tracking to M5 |
| #4 feel spec (FUN-003/004) | **ANSWERED** — Contract §1.1/§3 approved and LOCKED; TE-1 pinning | closed, numbers are law |

**ER-2 RISK FLAG (Session 2.3) → RESOLVED:** ER-2 slopes = **M2 critical** with normative semantics
(height-mask tiles, linear floor Y at the feet, 2px snap, max gradient 1:1). 1-1's slope identity is
safe as long as M2 lands before 1-1 content is built. Flag drops to half-open until M2 is *seen playing*.

## 3.2 FUN-011 audit of the 1-1 placement table (first real use of my fairness rule)

Checked every foe against every gap lip in WORLD1-LEVEL-DESIGN §2.4:

- **C1 gap5 (c17–21) — VIOLATION (mild).** Bug walkers at (130,11) and (131,11) stand on the **landing
  lip of the level's signature jump** (gap ends col 129; landing floor is only 5 tiles wide). Landing
  the big act-3 jump puts you one tile from two foes — exactly the Session-2 death combo (heart +
  knockback toward the hole + run-back). **FIX:** move them to (133,11)/(134,11), face them rightward,
  or drop a candle on the landing as an apology.
- **A2 gap3 (c22–24) — WATCH.** Bugs at (45,11)/(46,11) sit exactly 3 tiles from the lip — safe only
  while hurt knockback stays ≤ 2.4 px/f (Contract §1.3). Fine as drawn; keep the rule written for M5.
- **All other placements ✓** (B2/C1 pairs are 12+ tiles from lips; B1 foes live on the deck).

**Write the rule down:** "no foe within 3 tiles of a drop lip in acts 1–2; near lips, face them away
from the gap" belongs in LEVEL-PLAYBOOK §2 so 1-2/1-3 inherit it (FUN-011).

## 3.3 1-1 Revision 2 — refreshed paper audit

- **Gap mercy checks out:** gap5 = 5 tiles vs ≈6.5-tile full-run jump (§1.1) = ~1.5 tiles margin ✓;
  gap3/4 easier ✓. Checkpoint (96,11) sits after the gauntlet, before the bricks ✓.
- **Flat-rule honesty:** C2's 27-column flat reward run is legal on its own terms (springs, shelves,
  secret, gate, gift — I checked each column range).
- Secrets + golden candle match the §4.4 ledger ✓; seam = picket gate with chunk streaming behind
  (§4.1) ✓; first-10-seconds still right (spawn flat → bug stomp at (6,11) → brow climb) ✓.
- Story bubbles ride play (§4.3) with the loved family copy re-homed verbatim ✓ — the "DO NOT OPEN,
  KINAN" garage foreshadow at the checkpoint is a genuinely good beat.
- **VERDICT: PAPER PASS — conditional on the gap5 foe fix (or a written exception).**

## 3.4 QC-1 positions on WORLD1-LEVEL-DESIGN §5 open questions

- **#5 Pet crates in Slice 1 — KEEP** (Producer confirms). The mid-run pet unlock ("Vader joined your
  collection!") was the strongest single delight moment of Session 2 (§2.2). If art scope forces a cut:
  keep the **cat** crate in 1-1 (double jump = the fun one), defer dogs to M6.
- **#2 Foe skins — `bug` + `kite`.** A caterpillar and a kite read instantly as "backyard" to an
  11-year-old; squirrel/plane reuse is fine for side modes, but the yard deserves the bug.
- #1 (1-3's 8-tile drop grid height), #3 (palette), #4 (VO bindings) are camera/Architect/Producer
  calls — noted, no opinion from QC-1.

## 3.5 Session status

FUN verdict unchanged — **"NOT YET (close)"** — because the heart of the game is still unbuilt; nothing
in Sessions 2–3 could move it, and that is honest. The moment `AREA_1_1` wires into the engine (M4),
QC-1 runs the full §2.4/§5.3 screen-by-screen audit on the BUILT level + the §7 seam walk + a jump-gap
calibration pass alongside TE-1's probes. That will be the first session where the verdict can move.

---

## JOY AUDITOR — what's already delightful (keep all of this)

- Puzzle rooms ("FOLLOW THE DOTS" colored pads + sign), pet-in-a-box rescues, gift power-ups
  (cake/umbrella/hat/popper), springs ("SPROING!"), audio captions for every sound ("(candle chime)").
- Stage-select honesty (`28-stage-select.png`): "Locked — Beat stage N first", "Tip: 3 stars needs a
  clean run — clear the boss, collect 70% of coins and lose zero hearts" — real replay goals.
- The Stage-map diorama (`27-world-map.png`) is the best art in the game. Let it set the visual bar.
- Distinct world atmospheres confirmed on screen: rain streaks + mountain silhouettes (W5), toy-brick studs in
  daylight (W1/W7), glowing purple caverns + crane props (W11), sunset puzzle-room windows (W1).
- Shad's assist toast ("Measure twice, slam once! Here's a hard hat!") — funny, useful, on-brand.
- Pause menu ("Take a breather", Effects toggle, Save game anywhere) is warm and clear.
- Zero console/page errors across the whole review session (AUTOMATED: 2 drives + 1 probe, after moving
  my harness off contended ports).
- Unit baseline green: 57/57 (AUTOMATED `npm run test:unit`, 8 files).

## DESIGN REQUESTS (for Architect / Level Designer)

> **STATUS 2026-10-26 (Session 3): all four answered — see §3.1.** #1 ACCEPTED (Playbook §5 DoD),
> #2 superseded by §4 seams, #3 ACCEPTED into M5, #4 answered (Contract §1.1/§3 locked).

1. **Per-stage signature toys** (answers FUN-001): LEVEL-PLAYBOOK should require every stage to name its
   one handcrafted set piece + one secret before it's called done. Procedural chunks = connective tissue.
2. **Overworld art pass** (answers FUN-002): match the playable overworld to the diorama's look; frame the
   next stage dot in the opening camera.
3. **Boss-arena kit** (answers FUN-006): themed arena-furniture table (per boss kind) the builder can place.
4. **Feel spec** (answers FUN-003/004): target numbers for accel / top speed / camera dead zone — Test
   Engineer 1 pins them in `legacy-feel-*` once the Producer approves the feel direction.

## TECH POINTERS (one-liners for QC-2 → `docs/BUG-BOARD-TECH.md`; I did not touch that file)

- `#startBtn` (likely every `.btnbeat` element) never becomes "stable" for automation — infinite CSS
  pulse animation; Playwright clicks time out without `force:true`. Not player-facing, but it will bite
  any e2e that needs the title screen.
- A stray `net::ERR_FAILED` console error appeared during one drive; traced to preview-server port
  contention between parallel harnesses (my server died mid-run), NOT the game. Clean on a private port:
  zero errors. Consider one port per harness.
- `app/test-results/` is wiped by any `playwright test` startup (outputDir cleanup) — it deleted my first
  capture harness mid-run. Anything any role parks there WILL be deleted.

---

## STANDING VERDICT (updated after Session 2)

**Would I play the CURRENT build? — still NOT YET.** Nothing changed on the legacy game's bones today,
and the Session-1 reasons stand (instant speed, welded camera, same-skeleton levels, flat boss rooms).

**But the rebuild is now credible:** the contract turns every one of my blockers into a normative spec,
the Builder's uncommitted M1 already carries the locked §1.1 feel table (and froze legacy tuning instead
of breaking it — 11/11 stages drove clean, zero errors, today), and 1-1's paper design passes my toy and
secret audit. For the first time the plan matches the problem.

**Would I make my friend play it?** — not the current build. **Slice 1 as designed: yes, if ER-2
(slopes) lands** — otherwise 1-1's one idea evaporates and we're back to flat runs in disguise.

## THE SINGLE CHANGE THAT WOULD MOST IMPROVE FUN (unchanged, now spec'd)

**One handcrafted signature toy (and one secret) per stage — starting with World 1.**
The contract §2.4 + Playbook §1 now mandate exactly this, so my job becomes *auditing* it screen by
screen, not asking for it. Session 1's runner-up (feel) is in the Builder's hands with locked numbers.

## SESSION 2 — ONE-LINE CLOSING

World 1 played start-to-finish on the Builder's live WIP: clean, stable, and the same old fun ceiling —
but every fix is now written down, 1-1 passes paper audit, and the only design risk on the board is
**slopes (ER-2) gating 1-1's identity**. Stopping here for the Executive Producer.

---
*QC-1 edited only this file across all three sessions; no game code was touched and nothing was
committed (commits are the Builder's lane). Next QC-1 session: the moment `AREA_1_1` is wired (M4) —
§2.4/§5.3 screen-by-screen audit of the built 1-1 + §7 seam walk + gap5 foe-fix verification.*
# GAME DESIGN CONTRACT — KINAN VS. WORLDS
### The single source of truth. Owner: Architect / Creative Director. Every role reads this before touching anything.
**Status: ✅ APPROVED v1 by the Executive Producer — 2026-10-26. Sprint 0 DONE. Builder released to M1 (Feel core).**
**Repo:** `C:\Users\SHADHUNTER\Desktop\Kinan vs. Mom` · branch `feature/worlds-6-10` · Live: https://albertancoder.github.io/kinan-vs-mom/ (NEVER deploy without the Producer's explicit OK)

---

## 0. THE 10-SECOND PROMISE

> **"I run, the world scrolls with me, and every screen is a playground."**

A kid picks up the controller. Within 10 seconds: Kinan accelerates with weight and snap, a
rolling hill rises under his feet, the camera glides — left, right, up AND down — and the next
screen is already inviting him somewhere. No menu. No map. No picture he slides over.

**The bar for everything in this project:**
> *"Would a kid who loves Mario play this for an hour?"* — and the Dad test:
> *"Would I sit and watch him play it with a smile?"*

Breadth is not quality. Ten flat stages are worth less than one hill worth climbing.

---

## 1. THE FEEL SPEC (normative — tests will pin these numbers)

Units: the engine's own — **tile T = 16 px**, 60 fps fixed step, velocities in **px/frame**,
gravity in **px/frame²**. Targets are Super Mario World behavior translated into this engine's units.

### 1.1 Movement table (TARGET — the Builder implements exactly this)

| Parameter | Symbol | Target | Current build | Notes |
|---|---|---|---|---|
| Walk speed cap | `WALK_MAX` | **1.9 px/f** | — | gentle, for tight spaces |
| Run speed cap | `RUN_MAX` | **3.2 px/f** (12 tiles/s) | 3.0 | hold RUN / auto-run on touch |
| Rush cap (sugar/star) | `RUSH_MAX` | 4.2 px/f | 3.7 | power-up only |
| Ground acceleration | `ACC_GROUND` | **0.30 px/f²** | 0.55 | reaches RUN_MAX in ~11 frames |
| Air acceleration | `ACC_AIR` | **0.20 px/f²** | 0.38 | responsive but honest |
| Turnaround (skid) | `ACC_SKID` | 0.55 px/f² | — | + skid dust + lean-back pose |
| Ground friction | `FRIC_GROUND` | `vx *= 0.80` | 0.76 | when no input |
| Air friction | `FRIC_AIR` | `vx *= 0.96` | 0.96 | keep momentum in jumps |
| Jump launch velocity | `JUMP_V` | **−7.6 px/f** | −8.2 | |
| Rise gravity (holding) | `GRAV_HOLD` | **0.42 px/f²** | 0.38 | variable jump |
| Fall gravity | `GRAV_FALL` | **0.66 px/f²** | 0.62 | snappy fall, not floaty |
| Max fall speed | `MAX_FALL` | 9.0 px/f | 8.6 | |
| Jump cut (on release) | `JUMP_CUT` | clamp `vy = −2.6` | gravity swap | **sharp** short-hop control |
| Coyote time | `COYOTE` | **8 frames** (133 ms) | 7 | |
| Jump buffer | `JUMP_BUF` | **8 frames** | 8–10 | press before landing still counts |
| Stomp bounce (hold JUMP) | `STOMP_HIGH` | −7.0 px/f | — | nearly a full jump |
| Stomp bounce (tap) | `STOMP_LOW` | −4.6 px/f | — | |
| Spring launch | `SPRING_V` | −11.0 px/f | −10.4 | with stretch + "BOING!" pop |

**Derived feel targets (verify by measurement, not vibes):**

```
FULL JUMP APEX   = JUMP_V² / (2·GRAV_HOLD) = 7.6² / 0.84  ≈ 68.8 px ≈ 4.3 tiles   (SMW: ~4.5)
TAP JUMP APEX    ≈ 1.5–2 tiles  (hold ~3 frames, then cut)
FULL-RUN JUMP    ≈ 103 px horizontal ≈ 6.5 tiles of air at RUN_MAX
RISE TIME        = 7.6 / 0.42 ≈ 18 frames    FALL TIME ≈ 14 frames   (fall FEELS faster than rise)
```

Critical-path gaps therefore never exceed **5 tiles** in World 1 (act 1: 3 tiles max).
### 1.2 Squash & stretch (mandatory — this is half of "Nintendo feel")

| Moment | Deform | Duration |
|---|---|---|
| Jump launch | scaleY 1.18 / scaleX 0.88 | 7 frames |
| Landing | scaleY 0.82 / scaleX 1.16 (scaled by impact speed) | 5 frames |
| Skid | lean-back 12° + dust puffs | while skidding |
| Spring | scaleY 1.35 / 0.8 | 8 frames |
| Hurt | red flash 3 frames + flicker (4f on / 4f off) | 100 frames invuln |

### 1.3 Hit feedback (the "justice" rules)

- **Stomp:** 4-frame hit-stop on contact, enemy squashes 6 frames, pop particles, combo chime.
- **Hurt:** knockback 2.4 px/f away + −3.0 up, 6-frame hit-stop, red flash, hurt SFX + caption.
- **NO camera shake when Kinan is hurt** — locked family rule (Shad: *"violently shakes, stop that"*).
  Small 2 px shake (decay 0.86/frame) is allowed ONLY on boss hits and stomps of big enemies.
- **Enemy death:** squash-pop, 4–6 particles, never a corpse sprite.
- **Block bump:** the block hops 4 px and back in 6 frames; gift blocks pop their item with a spring arc.

### 1.4 Feel acceptance (Test Engineer 1 pins these in `app/tests/unit/**` + `legacy-feel-*`)

- [ ] Every number in §1.1 matches a pinned unit test (exact constants, exported from one `FEEL` object).
- [ ] Apex of a full jump measured in-engine = 4.3 tiles ± 0.25.
- [ ] Tap-vs-hold jump height ratio ≤ 0.5.
- [ ] Coyote: a jump pressed 7 frames after leaving a ledge fires; 9 frames does not.
- [ ] Buffer: a jump pressed 8 frames before landing fires on touchdown; 10 does not.
- [ ] Slope walking never jitters (position monotonic on a 2:1 slope at walk and run speed).

---

## 2. TERRAIN GRAMMAR — the vocabulary of the world

**THE LAW:** *If Kinan can't run on it, break it, hide under it, or be surprised by it — it is
NOT terrain. It is wallpaper, and wallpaper is a bug.* (See Warning #1 in §8.)

### 2.1 Tile types (T = 16 px; collision is per-tile, rendered with auto-tiling)

| # | Tile | Collision | Rules |
|---|---|---|---|
| 1 | **Ground** (grass/dirt/stone per world) | solid | auto-tile: grass cap on exposed top, dirt body, cliff edges shaded |
| 2 | **Slope 2:1** up / down | slope mask | the workhorse hill; see §2.2 |
| 3 | **Slope 1:1** up / down | slope mask | steep; walking speed halves going up |
| 4 | **Semisolid platform** | top-only | drop through with DOWN + JUMP; wood/branch/bridge look |
| 5 | **Brick** | solid, breakable | big Kinan breaks it (pop + debris); small Kinan bumps it (hop) |
| 6 | **Gift block** (`?`) | solid, hittable | head-hit pops: candle / heart / popper / secret; hops when bumped |
| 7 | **Pipe** (2w × 2–4h) | solid, enterable | woven INTO hillsides; entry = seam (see §4) or secret room |
| 8 | **Spring** | solid top, bounces | `SPRING_V`; always placed where a toy is needed |
| 9 | **Spikes / hazard** | damage | never on the only path in act 1 |
| 10 | **Water** | swim/drain (World 5+) | animated surface, 3-frame shimmer |
| 11 | **Bridge** | semisolid + sway | 2-frame sway loop (counts toward the 6 motions) |
| 12 | **Ladder / vine** | climb | vertical camera showcase |
| 13 | **Checkpoint flag** | trigger | saves (existing save system); flag wave animation |
| 14 | **Goal gate / archway** | trigger | the seam marker (§4) — never a results screen |
| 15 | **Secret block** | invisible until hit | one per secret; glints 1 frame every 240 frames (kid radar) |
| 16 | **Cave mouth / door** | trigger | diegetic transition (the ONLY allowed fade) |

### 2.2 Slope rules (the engine has NO slope code today — this is new work)

- Slopes are **height-mask tiles**: each column of the slope tile has a floor height (0–16 px).
  Kinan's Y snaps to the mask height when grounded (snap tolerance 2 px → no jitter).
- **Max gradient 1:1.** Every slope must connect to ≥ 1 flat tile at BOTH ends (no zigzag chains).
- Running DOWN a slope beyond 3.0 px/f gives a tiny crest pop (+0.5 tile) at the bottom lip — fun, not required.
- Never place a gift block or enemy where slope snapping could trap Kinan inside a tile.

### 2.3 Hill shapes (the level designer's palette — draw levels with THESE)

```
 BROW            TERRACE           BOWL              RIDGE            MESA
    __                __          _/  \_          _/\/\/\_          _____
 __/  \__        __ /   \__      /      \        /        \     ___/     \___
/        \      /         \     /        \      /          \   /             \
                                     (run under!)   (up & over)   (high road + low road)
```

- **Every world mixes at least 3 of the 5.** Flat ground may never exceed **8 tiles** without
  a toy, an enemy, or a height change. (The current build's `flat(10)` strips are exactly what we are killing.)

### 2.4 The "every screen must have a toy" rule

A **screen** = one 27×15-tile view (W=432, H=240). A **toy** = at least one of:
something to **bounce** (spring, slope launch, enemy to stomp-chain),
something to **break** (bricks, gift block, secret),
something to **discover** (hidden block, coin arc hinting at a secret, pipe, ledge that begs to be checked).

- [ ] **QC-1 (The Kid) audits every screen. A screen without a toy is a BUG, filed on BUG-BOARD-FUN.**
---

## 3. CAMERA SPEC — "the world moves, Kinan never slides over a picture"

The current camera (`camX = clamp(round(P.x − W·0.42))`, `camY = 0`) is instant, horizontal-only,
and frozen vertically. It is **deleted**. Replacement:

```
      ┌─────────────── view 432×240 (27×15 tiles) ───────────────┐
      │        deadzone 3 tiles wide × 2.5 tiles tall            │
      │            ┌──────────────┐                              │
      │            │   Kinan +    │  ← lookahead lead (up to     │
      │            │   deadzone   │     1.5 tiles, by velocity)  │
      │            └──────────────┘                              │
      └──────────────────────────────────────────────────────────┘
```

| Rule | Value | Why |
|---|---|---|
| Deadzone | 48 px wide × 40 px tall, centered on Kinan + lead | camera breathes instead of twitching |
| Lookahead | `lead = clamp(vx · 8, −24, +24)` px, eased 0.10/f | you see where you're going |
| X smoothing | `camX += (target − camX) · 0.14` per frame | glide, never snap |
| Y follow UP | `· 0.10` — fast when Kinan rises or `vy < −4` | jump apex is always visible |
| Y follow DOWN | `· 0.06` + 0.75-tile lead when `vy > 6` | landing zone visible, no sick yank |
| Apex-lead | if a jump's predicted apex exits the top of view, camera rises FIRST | never clip a jump |
| Clamps | ONLY at world edges and inside boss gates | see below |

**NEVER-CLAMP-ON-FUN RULE:** the camera may never hard-pin Kinan to a screen edge during play.
Boss arenas: when Kinan nears an arena wall, the camera **slows** (lerp × 0.5) but never locks.
The only hard clamp is the world boundary. If a jump is fun, the camera shows it.

**Parallax:** 3 background layers (0.2×, 0.45×, 0.75×) + animated sky. Parallax is scenery only —
it must never imply walkable ground that isn't there. (See Warning #1.)

### Camera acceptance (Test Engineer 1, `legacy-feel-*`)
- [ ] Scripted run + jump probe: camera Y rises during a 4-tile jump (measured, not eyeballed).
- [ ] Camera never snaps: max per-frame camX delta at RUN_MAX < 1.5 px.
- [ ] No clamp event while the probe crosses a boss threshold.

---

## 4. SEAM SPEC — one giant adventure, zero screens

**Title → PLAY → playing.** That is the entire front door. Then: walk off the end of one area
and step straight into the next.

### 4.1 How a seam works (normative)

```
 AREA 1-1 terrain      GATE (arch / bridge / cave mouth)        AREA 1-2 terrain
 ────────────────┴───────────┤  ├──────────────────────────────────────────
                              ▲
        set-piece hides chunk streaming (≤ 3 frames, behind the arch)
        camera keeps rolling. NO cut. NO fade. NO UI. Kinan never stops.
```

- Areas are **adjacent sections of one world grid**. The engine streams the next chunk while
  Kinan is ≥ 2 screens from the boundary. The gate set-piece (archway, cave mouth, big pipe)
  is the visual landmark — not a loading screen.
- **Banned between areas:** results screens, maps, menus, fades-to-black, "STAGE CLEAR" cards,
  anything that stops Kinan. Stats (candles, time) may appear ONLY as a **non-blocking banner**
  that slides in and out while play continues.
- The one legal fade: walking **into a pipe/door** (diegetic — the screen wipes dark inside the
  pipe for ≤ 12 frames and comes out somewhere else in the same terrain).

### 4.2 Boss arenas live in the terrain

```
  hills...      valley funnel      ┌── ARENA (in the world) ──┐      the way on
 ~~/\/\/\~~~  ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼  │  boss stage ON real terrain │ → bridge builds /
   gates slide UP behind Kinan ── │  gates rise at fight start │  stairs form →
   (SMW-style, 6f hit-stop)      └────────────────────────────┘  next world begins
```

- Entering the arena threshold: gates rise behind Kinan, boss music, boss intro lines as
  **taunt bubbles** (play does not stop).
- Winning: the gates fall, a bridge/staircase **builds itself** (3-frame stagger), and Kinan
  walks forward into the next world's first area. No victory screen. Story beats ride as bubbles.

### 4.3 Story without stopping play

- **Sidekick bubbles** (Shad, Chenoa, pets): speech bubbles at the top of the screen, 2.5–4 s each,
  queueable, skippable with JUMP. Kinan can run and jump the whole time.
- **World story beats** (intro/outro): the same bubbles + existing VO clips (they're loved — keep
  them). They play DURING natural slow moments (gates, bridges), never during platforming.
- **Boss intros/taunts:** bubbles over the arena. Only a **world finale** may use a full-width
  cinematic panel — max 1 per world, ≤ 20 s, skippable after 3 s.
---

## 5. ART DIRECTION — Nintendo-quality pixel terrain

### 5.1 Tile shading rules (every material, every world)

- 16 px tiles, **3-tone shading**: light (top/left-facing), mid, dark (bottom/right + under overhangs).
- **1 px light rim on the top edge** of every walkable surface (the readability contract).
- Slopes get a **1 px dithered transition row** where tone changes — never a hard diagonal stair.
- 2 px max outline on gameplay silhouettes; **gameplay colors must differ from backdrop colors
  by ≥ 25% luminance** — Kinan and the platforms are readable against ANY background.

### 5.2 Palettes (starting point — Level Designer proposes, Architect approves)

| World | Sky (top→horizon) | Terrain light / mid / dark | Accent |
|---|---|---|---|
| 1 · Home & Yard (day) | `#7ec8ff → #cfeeff` | `#8fd94f / #4f9e33 / #2e6423` | `#f6c445` gold |
| 2 · Job site (dawn) | `#3a2a63 → #ff9e6e` | `#d6b45a / #9a6a3a / #5c3c22` | `#ff8c42` |
| 3 · Edmonton weekend | `#4aa3ff → #bfe6ff` | `#9aa8c8 / #5f70a8 / #33406e` | `#ff6fae` |
| 4 · Stampede | `#2a1a4e → #ff9e6e` | `#c98a4a / #8a5426 / #4e2e14` | `#e8364b` |
| 5 · Rainy Vancouver | `#22303f → #5a7186` | `#4f7a58 / #2e5238 / #1a3020` | `#6fc8ff` |

### 5.3 The "6 things in motion" minimum (every screen, always)

1. **Ambient particles** (pollen / dust / rain / snow per world)
2. **Foliage or décor sway** (grass tufts, hanging signs, lanterns — 2-frame loop)
3. **Water/liquid motion** (pond shimmer, dripping pipe, puddle ripple — 3-frame loop)
4. **Collectible idle** (candle flame flicker / coin glint cycle)
5. **Enemy idle animation** (nothing is ever a frozen sprite)
6. **Parallax layer drift** (clouds, far hills — slow, alive)

Plus Kinan's own run/jump/skid cycles and flag/bridge/goal props. Fewer than 6 motions on a
screen = a bug on BUG-BOARD-FUN (QC-1 files it).

---

## 6. WHAT WE KEEP (the love is sacred — re-homed, never deleted)

---

## 9. PRODUCER RULINGS (Executive Producer amendments — supreme over this contract)

### Ruling 2026-10-26 — THE WORLD MAP IS AN SMW-OVERWORLD

**The end result for the world maps: similar to the Super Mario World SNES overworld
map — NOT identical, but the same visual language.** Reference: SMW overworld
screenshots (Yoshi's Island / Donut Plains style). The checklist every world map
must satisfy:

1. **Diorama terrain** — organic rounded landmasses read as a landscape (not a tile
   grid): the layered "cake-layer" cliff band where land meets water, light rim on
   top, dark band below. Per-world palettes (§5.2 / `OVER_THEMES`) stay.
2. **Winding dotted trail** — the route between stage nodes is a tan dotted path
   (light dashes), meandering through the scenery.
3. **Crisp node dots** — small round dots with dark outlines and drop shadows:
   **yellow = open, red = cleared, gray-blue = locked**. A soft pulse ring marks the
   next unplayed node.
4. **The boss castle IS a node** — a castle silhouette (battlements + gate + state
   flag: yellow open / red cleared) where the boss lives, SMW-style.
5. **The player marker walks the map** — little Kinan on the current node, walking
   between nodes.
6. **Level-name plaque** — standing on a node names the stage in a small gold-trimmed
   plaque (SMW's level-name box).
7. **6 motions (§5.3) hold on maps too** — water shimmer, weather, prop sway.

Honesty labels: the automated pins cover behavior (node states, route integrity,
plaque targeting). The LOOK itself is **VISUAL = UNVERIFIED** until the Producer
reviews it in person.

### Ruling 2026-10-27 — TWELVE WORLDS, ELEVEN LEVELS EACH, THE MAP BETWEEN LEVELS

**Decided by the Executive Producer (story bible, 2026-10-27). Supreme over this contract;
it supersedes the conflicting lines listed at the end.**

1. **The lineup — 12 worlds:** 1 Saskatoon home · 2 School · 3 Robin's oilfield (Onion Lake →
   Fort McMurray) · 4 Edmonton · 5 Calgary Stampede · 6 Drumheller · 7 Vancouver · 8 Toronto ·
   9 Montreal · 10 Niagara Falls · 11 Inside the Console (bizarre mini realms) ·
   **12 = 3D Saskatoon**, built separately in three.js (not part of the 2D level pipeline).
2. **11 levels per world** (worlds 1–11): 8 regular + 1 fort + 1 secret + 1 boss castle.
   World 1, in trail order: 1-1 Kinan's Bedroom · 1-2 The Living Room · 1-3 The Kitchen ·
   1-4 Brick City (Basement) · 1-5 The Front Yard · FORT Fence-Line Feud · 1-6 Bunny Photo
   Studio · 1-7 Chenoa's Art Room (Remai Modern) · SECRET The Weir and the Pelicans ·
   1-8 Broadway Avenue Dinner · CASTLE Bedtime Castle (The Bessborough) — Mom.
3. **A Super Mario World-style overworld map between levels.** Kinan walks a trail between
   level dots; the worlds join into one continuous journey. **Levels start from and return to
   the world map** — this overrules "no map / no screens between levels" for the core loop.
4. **Inside a level the contract still rules:** §1 feel (LOCKED), §2 terrain, §3 camera,
   §4.1 seams between a level's own areas, §4.2 boss arenas in terrain, §4.3 bubbles. A level's
   goal is a non-blocking **LEVEL CLEAR** banner, then back to the map — never a results screen.
5. **Levels are files (M4b):** one data file per level under `levels/wNN/`, registered with
   `KinanLevels` and gated by `levels/registry.js` (shape + design-rule lint). The builders'
   guide is `docs/LEVEL-AUTHORING.md`. The authored "Wild Yard" (the former 1-1) is now
   **1-5 The Front Yard**; its picket arch is that level's goal.

**Supersedes:** §0 "No menu. No map." (still true *inside* a level) · §4 "one giant adventure,
zero screens" and §4.1 "Banned between areas: … maps …" (now: between the areas of one level) ·
§4.2 "Kinan walks forward into the next world's first area" (a castle win returns to the map,
which walks on into the next world) · §7 Seam line "start → boss → World 2 entry with zero
screens" (zero screens inside each level; the demo path is map → level → map) · §8.1 #3 and
§8.3 Warning 3 as far as they ban the map between levels (results screens, menus and fades
stay banned) · the world numbering of the §5.2 palette table (worlds 2–5 are re-proposed in the
M6 art pass) · `docs/WORLD1-LEVEL-DESIGN.md`'s 1-1/1-2/1-3 spine and its "picket gate → 1-2"
seam · the Sprint Plan's Slice 1 demo line.
**Honesty:** not built yet — the map integration (concept engine:
`Desktop\Kinan Map Concept\worlds.html` + `worlds/wNN.js`), progress saves for authored levels,
the other 10 World 1 levels, Worlds 2–11, World 12.

- Family **stories & dialogs** (the birthday plot, Mom/Dad/Shad/Chenoa voices) → §4.3 bubbles.
- **Bosses**: Mom, the Grandmothers, Glitchy, Brick-Rex & co. → arena-in-terrain re-homes (§4.2).
- **Pets & perks**, hats, Party Popper, coins → piggy bank → Party Shop.
- **Voice clips + captions** (`vo/`, 29 clips) → wired to bubbles.
- **Save system** (backup-first, recovery, migration) + checkpoint flags — untouched and protected
  (see `docs/LEGACY-BOUNDARY.md`; original saves are NEVER deleted).
- **Builder, kart, smash, puzzle rooms** → "Party" side modes. Out of the core loop, out of
  Slice 1. (Breadth is not quality.)

---

## 7. ACCEPTANCE CHECKLIST — the contract's definition of DONE

**Feel** — [ ] §1.4 all green (pinned tests, not eyeballs).
**Terrain** — [ ] Slopes run/jump/snap with zero jitter; ≥ 3 hill motifs of §2.3 in World 1;
[ ] every screen has a toy (QC-1 audit signed); [ ] ≥ 3 secrets in each of 1-1 / 1-2 / 1-3.
**Camera** — [ ] Smooth follow on BOTH axes; jump apex always visible; no edge-pinning (§3 tests green).
**Seam** — [ ] Title → PLAY in one action. World 1 playable start → boss → World 2 entry with
**zero** screens, menus, or fades. (The seam walk-through IS Slice 1's demo.)
**Art** — [ ] 3-tone shading + top rim on all terrain; ≥ 6 motions per screen; readability rule holds.

**The last line — the only subjective one — is the one that decides everything:**

- [ ] **Would I play this game?** (If the honest answer is "not yet", the slice is NOT done,
      no matter how green the tests are.)
---

## 8. VERDICT ON THE CURRENT BUILD (honest, per the producer's own words)

The producer said it: *"the worlds are just moving images or gifs."* The code agrees.
Evidence from `index.html` (15,767 lines): levels come from `build(i)` — a **seeded RNG that
rolls flat strips and 1-tile bumps** (line 2248); the camera is **X-only and vertically frozen**
(`updateCamera`, line 4876: `camY = 0` for every story stage); the pretty scenery is **painted
parallax backdrop** while the playable layer is generic rectangles (`drawTiles`); the world is a
**15-tile band** (`ROWS=15, GROUND=11`) with no slopes anywhere in the codebase; and the stage
flow ends in a **results screen + overworld map** (`goalReached` → `resultsScreen`, line 10033).
It is, as agreed, not even close. Rebuild the heart; keep the soul.

### 8.1 MUST BE DELETED (from the new game's experience — history preserved per LEGACY-BOUNDARY)

1. The **procedural stage generator** `build(i)` as the maker of story levels — levels become
   AUTHORED terrain (data owned by the Level Designer).
2. **Backdrop fakery** — painted scenery that reads as walkable ground. Parallax becomes honest sky.
3. The **results screen + map/menu intermissions** in the core loop (the party map survives as a
   side-mode entrance from the title only).
4. The **frozen vertical camera** and instant camera snap.
5. The flat **15-tile-band world model** — worlds become tall, rolling, 2.5-axis terrain.

### 8.2 KEPT (detail in §6)
Stories, bosses, pets, VO, saves, checkpoints, Builder & party minigames (side modes), the
quarantine/dev gates, and every existing regression suite (they keep passing).

### 8.3 THE THREE HIGHEST-RISK BUILDER MISTAKES — read these twice

> **⚠️ WARNING 1 — "BACKDROP IS NOT TERRAIN."**
> The single most likely failure is drawing gorgeous hills in the parallax layer while the
> collision layer stays flat — the exact disease we are curing. **Definition of done for any
> terrain feature: Kinan can run ON it, run UNDER it, break it, or be surprised by it.** If a
> shape in the art has no collision, it may not look walkable. Period.

> **⚠️ WARNING 2 — "THE FEEL TABLE IS LOCKED."**
> When a level seems too hard or a jump too tight, the temptation is to nudge gravity or speed.
> **Never change §1.1 numbers to make a level pass — change the level.** Any constant change
> requires Architect approval + re-pinning the feel tests. Feel IS the game.

> **⚠️ WARNING 3 — "NO SCREENS IN THE SEAM."**
> Results panels, maps, "World Clear!" cards and fades creep back in because they are easy.
> They are banned (§4). Slice 1's demo is walking from 1-1's first step to World 2's first step
> **without Kinan ever stopping**. If something must be communicated, it is a bubble or a
> banner — never a screen. (And the team rule stands above all: never weaken a test to pass a gate.)

---

*Contract written by the Architect / Creative Director. Awaiting Executive Producer approval
or corrections before any code is written. Approved contract = Sprint 0 done.*
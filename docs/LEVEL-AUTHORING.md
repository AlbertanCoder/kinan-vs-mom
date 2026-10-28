# LEVEL AUTHORING — how to build a Kinan vs. Worlds level
**Owner: Architect / Level Designer. Read this, then `docs/GAME-DESIGN-CONTRACT.md` §1–§4 and §9 (the 2026-10-27 ruling), then copy `levels/_template.js`.**
Since M4b (2026-10-27) every level is **one data file** under `levels/`. You never touch `index.html` to add a level.

---

## 1. The big picture (Producer ruling 2026-10-27)

- **12 worlds:** 1 Saskatoon home · 2 School · 3 Robin's oilfield (Onion Lake → Fort McMurray) · 4 Edmonton · 5 Calgary Stampede · 6 Drumheller · 7 Vancouver · 8 Toronto · 9 Montreal · 10 Niagara Falls · 11 Inside the Console · 12 = 3D Saskatoon (built separately in three.js — **not** a level file).
- **11 levels per world** (worlds 1–11): 8 regular + 1 fort + 1 secret + 1 boss castle.
- Levels start from and return to an **SMW-style overworld map** (Kinan walks a trail between level dots). Inside a level, the authored terrain, camera and seams of the contract still apply.
- World 1's trail, in order (`slot`): 1 **1-1 Kinan's Bedroom** · 2 **1-2 The Living Room** · 3 **1-3 The Kitchen** · 4 **1-4 Brick City (Basement)** · 5 **1-5 The Front Yard** · 6 **FORT Fence-Line Feud** · 7 **1-6 Bunny Photo Studio** · 8 **1-7 Chenoa's Art Room (Remai Modern)** · 9 **SECRET The Weir and the Pelicans** · 10 **1-8 Broadway Avenue Dinner** · 11 **CASTLE Bedtime Castle (The Bessborough)** — Mom.

## 2. Files, names and ownership (read twice — this is how parallel agents never collide)

| Level | File | id |
|---|---|---|
| regular 1–8 | `levels/wNN/l01.js` … `l08.js` | `'N-1'` … `'N-8'` |
| fort | `levels/wNN/fort.js` | `'N-fort'` |
| secret | `levels/wNN/secret.js` | `'N-secret'` |
| boss castle | `levels/wNN/castle.js` | `'N-castle'` |

(`NN` is two digits: `w01`, `w11`. Example: 1-5 lives in `levels/w01/l05.js`.)

**The one-file-per-level rule:**
1. You own exactly the level files you were assigned (normally one world folder `levels/wNN/`). You edit nothing else.
2. **Never edit** `index.html`, `levels/registry.js`, `sw.js`, another agent's level, or the shared docs. Need an engine feature? File an **ENGINE REQUEST** in `docs/BUG-BOARD.md` and build around it.
3. `levels/manifest.js` is **generated** — after adding a file run `node tools/levels-manifest.mjs` (or `npm run levels` in `app/`). If two agents both regenerate, the result is identical; a merge conflict in it is fixed by re-running the generator.
4. Drafts: name them `_something.js` — files starting with `_` are never loaded.
5. One commit window at a time (team rule): only commit after the full gate is green, and only your files + the regenerated manifest.

## 3. The file format

A level file is one call:

```js
KinanLevels.register({
  id: '1-5', world: 1, slot: 5, kind: 'level',   // kind is optional; it must match the id
  name: 'THE FRONT YARD',                         // the map plaque, capitals, ≤ 40 chars
  theme: 5,                                       // borrow a stage look (see §4.6)
  cols: 162,                                      // width in tiles (27 per screen), 27..1200
  heights: [ /* one per column */ ],
  solid: [[c0, r0, c1, r1]],                      // optional ground rectangles
  deck: [c0, c1], fakeWall: [c0, c1],             // optional structures (see §4.2)
  tiles: { gift: [[c, r, prize]], brick: [[c, r]], spring: [[c, r]], shelf: [[c, r]] },
  pipes: [[c, r]], foes: [[c, r, 'type']], candles: [[c, r]],
  secrets: [{ kind: 'visible' | 'hidden' | 'skill', col, row, prize }],
  goldenCandle: { col, row }, checkpoint: { col, row },
  arena: { col, cols, boss },                     // castles and forts: the boss arena (see §4.7)
  pet: { id: 'cat1', col, row },                  // the pet rescued in this level (see §4.4) — six levels have one
  spawn: { col, row }, goal: { col, row },
  noSecrets: 'why'                                // only if the design truly has none
});
```

**Coordinates:** `col` 0 is the level's left edge; `row` 0 is the sky, row 14 the bottom; 1 tile = 16 px; a screen is 27 × 15 tiles (432 × 240 px). The usual floor top is y = 192 (row 12 is the first ground row; Kinan stands in row 11).

**Multi-area levels (in-level seams):** instead of putting the geometry at the top level, give `areas: [ {id, name, cols, heights, …entities…}, … ]`. Each area uses its own local columns; the engine joins them left to right and places a **seam** (a gate landmark, Contract §4.1 — no screen, no cut, a banner slides in) at every join. Exactly one area holds the `goal`; the `spawn` goes on the level or its first area.

## 4. Legend

### 4.1 Ground — `heights`
One number per column = the y (px) of the walkable top, or `null` for a pit.
| Rule | Why |
|---|---|
| values are multiples of 8 from 32 to 224 | the engine's height-mask grid |
| a **flat** run sits on a multiple of 16 (192, 176, 160 …) | flats are whole tiles |
| a step of **8** between neighbours = a **2:1 slope** (the workhorse hill) | Contract §2.1 #2 |
| a step of **16** = a **1:1 slope** (steep; walking speed halves going up) — only between multiples of 16 | §2.1 #3 |
| **any other step is refused** — build walls and ledges with `solid` | slopes, not cliffs |
| an up-slope and a down-slope must have a flat between them (no zigzag) | §2.2 |
| never put a gift block or enemy where slope snapping could trap Kinan in a tile | §2.2 |

Hill shapes to draw with (§2.3): BROW, TERRACE, BOWL, RIDGE, MESA — **use at least 3 per world.**

### 4.2 Structures
- `solid: [[c0, r0, c1, r1], …]` — fills that rectangle with plain ground (walls, steps, overhangs, ceilings, floating islands). Inclusive on both ends.
- `deck: [c0, c1]` — the columns become a ONE-tile-thick bridge at their height with a tunnel floor at row 12 under it (1-5's run-under hill arch, the BOWL). The deck columns' `heights` give the deck top.
- `fakeWall: [c0, c1]` — ground-looking blocks on rows 8–10 over those columns (1-5's terrace wall that hides the golden candle).

### 4.3 Tiles (`tiles`)
| key | what | notes |
|---|---|---|
| `gift` | `?` gift block, `[col, row, prize]` | prize: `candle` (default) · `popper` · `cake` · `heart` · `hat` · `lasso` · `umbrella` · `gold` (the golden candle: paid on the bump and saved per level, pass A). A gift at a `hidden` secret marked `glint240: true` is a **hidden block**: invisible (it wears the wall's look when set in one), glints every 4 s, appears when bumped from below or walked into |
| `brick` | brick | **breaks when Kinan head-bumps it** (pass A; a foe standing on it is bonked). A level whose bricks are its floor, stairs and bridges sets `toyBricks: true` and they never break (1-4 Brick City) |
| `spring` | trampoline | launches at the locked `SPRING_V`; put one wherever a toy is needed |
| `shelf` | semisolid ledge | land from above, jump up through |

### 4.4 Things
- `foes: [[col, row, 'type']]` — stand them on the row above the ground (row 11 on a 192 floor). Types (behaviour → names):
  - walker: sock, teddy, lego, robot, roomba, egg, broccoli, sheep, tumbleweed, mud, cone, mallwalker, cart, zamboni, drummer, corndog, haybale, slug, rollerblader, raccoon
  - hopper: toast, ball, bunny, paint, carrot, cupcake, gopher, hopcone, wetsign, babydino, puddlefrog, flyingfish
  - flyer: plane, camera, brush, ghost, sparkler, crow, mosquito, magpie, goose, seagull, umbrellabat, raincloud
  - thrower: neighbor, teacher, waiter, busker, lassolizard · charger: squirrel, bully, biker, minibull · peeker: pothole
  (An unknown type fails the gate.)
- `candles: [[col, row]]` — the collectible (a candle, not a coin — Shad's ruling). Arcs teach the safe line; a candle inside a solid tile is dropped.
- `pipes: [[col, row]]` — a hose pipe landmark drawn standing on that tile. **No warp yet** (pipe rooms are a future engine request).
- `secrets` — exactly **3** in a regular level, one of each Playbook §3 kind: `visible` (visible-but-tricky), `hidden` (hidden-in-terrain), `skill` (skill-gated), each with `col, row, prize`. Pass A pays every prize: a gift block at the secret's spot pays through the block; otherwise the prize floats at the spot (the first free cell at or above it) — prize words: heart · hat · cake · popper · lasso · umbrella · candles (+5) · golden, joined with `+` (`heart+candles`). Each find shows SECRET n/3. Add `exit: 'N-secret'` to a secret for a **secret exit**: bumping its block opens a door on the floor below (one column towards the way in); walking in saves that level as unlocked (`progress.unlockedLevels`) and clears the level with SECRET EXIT FOUND (1-7 → `1-secret`).
- `goldenCandle: { col, row }` — 1 per regular level, inside one of the secrets.
- `pet: { id, col, row }` — a **pet crate** (QA fix 2026-10-28): the pet waits in a glowing crate with a gold arrow over it, calls out ("MEOW?" / "WOOF?") when Kinan comes within 7 tiles, and joins when he walks into it — the collection and the Pets screen (Kinan picks who comes along there; nothing is equipped for him), and Kinan's "joins the team" line plays right then. `id`: `cat1` Ginger · `dog1` Chikastino · `cat2` Vader · `dog2` Hunter · `cat3` Duchess · `cat4` Tuxedo. One per level; a pet already found leaves no crate. Put it **on the floor of the main path** (flat ground, before any arena) so a kid runs into it. Today: Ginger 1-1, Chikastino 1-5, Vader 2-4, Hunter 3-3, Duchess 4-castle, Tuxedo 5-fort (story bible).
- `talk: [[col, 'WHO', 'what they say', seconds?], …]` — story bubbles (World 6, 2026-10-28): when Kinan passes that column the line shows as a subtitle at the bottom of the level picture (no recording; seconds default from the length, ≤ 8; text ≤ 140 letters). Once per visit; lines not said yet are dropped when a boss fight starts. 6-castle uses them (Shad on the radio, Kinan, Robo-Rex's growls).
- `checkpoint: { col, row }` — the flag. A pit costs a heart and respawns here. No lives, no game over (pass A): the last heart restarts Kinan here (or at the spawn before he reaches it) with full hearts and his candles, and after 5 deaths in one spot Glitchy offers to show the way (a safe platform over the gap) — so a hard spot never stops a kid, but keep gaps honest.
- `spawn: { col, row }` — the tile Kinan stands IN (feet rest on row + 1). Default `{ col: 2, row: 11 }`.
- `goal: { col, row }` — the picket arch. When Kinan's middle crosses that column: a non-blocking **LEVEL CLEAR** banner, a 2-second victory lap (he can't be hurt), then back to the map (today: the title screen — the overworld map is not integrated yet). Exactly one per level.

### 4.5 What the engine adds for you
Flat run-out ground after the goal and a world wall at the very end; the §1.1 feel, §2 slopes and §3 camera (every authored level runs the new engine); the legacy HUD, hearts, the ☰ MENU (it is the pause), pets and Shad's checkpoint drop-in.

### 4.6 `theme` — borrowing a look
`theme` is a stage index whose sky, backdrop and ground colours the level wears (World 1: 0 bedroom · 1 living room · 2 kitchen · 3 brick city · 4 photo studio · 5 front yard · 6 art room · 7 school playground · 8 dinner table · 9 bedtime castle · 10 cake volcano; later worlds: `__k11.worlds.stages()` in a dev page lists every index and place). Per-level palettes (§5.2) come with the M6 art pass.

### 4.7 Boss arenas — `arena` (castles and forts; engine pass B1, 2026-10-27)
Story bible, "Game rules": every world ends in a boss, and **bosses start out dumb and get smarter each time Kinan lands a hit**. An arena is real ground in your level (Contract §4.2) — no screen, no dialog box, play never stops.

```js
arena: { col: 73, cols: 24, boss: 'mom' }            // on the level, or on the area that holds it
arena: { col: 58, cols: 24, boss: 'goalie', phases: 2, checkpoint: { col: 54, row: 11 } }
```

| key | what |
|---|---|
| `col`, `cols` | the first floor column and the floor width (12-60). **24 fits one screen with both gates** — the camera then frames the whole fight (every tell in view, the fair choice on a phone); a wider arena follows Kinan inside its gates |
| `boss` | `mom` (World 1 castle) · `principal` (World 2 castle) · `neighbour` (1-fort) · `goalie` (2-fort) · B2: `foreman` (World 3 castle) · `chenoa` (World 4 castle) · `bronco` (World 5 castle) · `moose` (3-fort) · `conductor` (4-fort) · `barker` (5-fort) · World 6: `magpies` (6-fort) · `robo-rex` (World 6 castle) — the looks, voice lines and phase plans live in `index.html` `ARENA_KINDS` |
| `phases` | optional: a number (the boss's first N phases; castle bosses have 3, the fort mini-bosses 2) or a list of 1-3 objects that override a phase's numbers (below). **Hits to win = phases.** |
| `checkpoint` | optional `{ col, row }`: the arena's own flag. Default: three tiles before the left gate (`col - 4`) |

**The ground rules (⚙ the gate refuses a level that breaks them):** ⚙ the floor is flat from the left gate (`col - 1`) to the right gate (`col + cols`) — same height, no pits; ⚙ nothing solid inside it (no `solid`, gift, brick or spring in its columns above the floor) — **desks are `shelf` tiles** (2-castle); ⚙ the `goal` stands past the right gate; ⚙ one arena per level; ⚙ the default checkpoint spot must be ground (else give `checkpoint`). The arena's columns count as a toy for every screen they cross, and **the act thirds for the gap caps (§5.4) are the thirds of the platforming before the left gate**.

**What the engine does:** the right gate (the boss door, red trim and a lock) is shut from the start. Kinan passes the arena's checkpoint flag, steps 3 tiles in and the left gate rises behind him; the boss's name and how to beat it slide in as a banner, its intro lines play with subtitles at the bottom of the picture (`audio/voice/<id>.mp3`), the hp bar shows one pip per phase and a 🧠 per phase reached. Each stomp: the boss backs off, a **"getting smarter"** banner says what changed, the next phase starts. The last stomp is a **befriend moment** (hearts, its kind words, a hug if Kinan walks up to it), then both gates fall and the goal is a few steps on: **LEVEL CLEAR** (the victory lap waits for the boss's last line).

**Fairness (every boss):** every attack has a wind-up tell of at least 0.6 s (a flashing red "!" and a shake; rain shadows and the slam's red ring are on the floor for the whole wind-up and fall); side contact hurts only while the boss is busy; a stomp lands only while it is **TIRED** or **DIZZY** (a gold "▼ STOMP" arrow) — otherwise Kinan bounces off unhurt; the stomp window waits until its last throw has landed; minions walk in on the side away from Kinan. **No game over:** the last heart puts Kinan back at the arena's checkpoint with full hearts and the fight starts fresh on re-entry. **5 lost fights** and Glitchy offers help (Kinan can say no): he buzzes round the boss (tells ×1.3, rests ×1.5, naps ×1.4) and Kinan gets an extra heart for the level.

**Phase numbers** (override any of them per phase): `walk` pacing speed px/f · `windup` tell frames (never under 36) · `rest` frames between attacks · `tired` the stomp window in frames · `pattern` the attacks in order, then TIRED · `n` things per throw or rain · `speed` throw/roll/charge speed × · `feint` every third wind-up is a fake (the real one starts with a STOMP) · `predict` aims where Kinan is going · `minions` walkers called at the phase start · `heal` a heart is tossed in at the phase start · `bounce` throws bounce.
**Attacks:** `toss` (a lob at Kinan) · `roll` (along the floor — jump it) · `rain` (falls on shadows marked first) · `charge` (a dash to the far gate — jump it; it ends DIZZY) · `slam` (a jump onto a red ring; pillow puffs roll out) · `blow` (a leaf blower pushes Kinan back while a gnome rolls; never damage) · B2: `wave` (a shockwave runs out both ways along the floor — jump it) · `charge2` (a charge that turns at the far gate, a fresh "!" of 0.6 s+, and comes back).
**B2 phase keys:** `throwN` things per toss when it differs from `n` · `platforms` someone builds shelves in the arena at the phase start (Shad, in Chenoa's kitchen; a lost fight takes them down) · `calm: 1|2` the stomp window only comes once Kinan has grabbed the glowing ♪ (1 on the floor, 2 up high, a jump away); no music by the end of the pattern = the boss stays spooked and goes round again (Bronco). A throw now comes down on the surface under its spot (a desk or a shelf, not the floor below it). A calm-him boss (the moose, Bronco) wears a gold ▼ **PAT** arrow instead of STOMP.

| boss | phase 1 (dumb) | phase 2 (smarter) | phase 3 (smartest) |
|---|---|---|---|
| `mom` | 1 sock at where Kinan is, twice; tired (folding laundry) | 2 socks; feints; + a rolling laundry pile; 2 walking socks | aims ahead; + the bedtime slam (red ring) |
| `principal` | 3 bells on floor shadows + a lob; tired (checks his watch) | feints; + runs in the halls (dash → dizzy); 2 bouncing balls | 4 bells aimed ahead, a lob, then the dash |
| `neighbour` | gnome bowling ×2; tired (catches his breath) | feints; + the leaf blower with a gnome; 2 newspapers; his wife tosses a cookie (heart) | — |
| `goalie` | a bouncing kick, then a dive along the grass (→ flat: stomp) | feints; + a low rolled ball; then the dive | — |
| `foreman` (B2) | 3 cones on floor shadows + a rolling pipe; tired (a coffee break) | feints; + the megaphone pushes Kinan back while a pipe rolls; 3 cones; 1 walking cone (QA 2026-10-28: was 4 + 2) | aims ahead; + 3 lobbed hard hats: cones, hats, megaphone, pipe |
| `chenoa` (B2) | 2 plates + the ground pound (red ring, shockwaves both ways); tired (catches her breath) | feints; Shad builds 2 scaffold platforms (the shockwaves pass under); 3 plates; + a rolling serving cart; 2 serving carts roll in | aims ahead; 3 plates, pound, cart, the rush (a charge → dizzy), then another pound (QA 2026-10-28: harder than the Foreman) |
| `bronco` (B2) | `calm: 1` fireworks on 4 shadows, a charge, fireworks again; the ♪ on the floor | feints; + a pinwheel rolls; 5 fireworks; the charge turns and comes back (`charge2`); 3 hay bales trot in; the ♪ up high | aims ahead; + his stamp (`wave`): 6 fireworks, dust wave, pinwheel, double charge, a second stamp, fireworks again; 3 hay bales (QA 2026-10-28: the hardest castle boss) |
| `moose` (B2) | a mud clod, then a charge into the far gate (→ puffed out: PAT) | feints; 2 clods + a rolling log, then the charge; 2 beavers | — |
| `conductor` (B2) | an empty coaster car rolls, then he rides his car across (→ stalls: stomp) | feints; + his whistle (`wave`), a car, his ride | — |
| `barker` (B2) | 2 bouncing prize balls, twice; tired (counting his toonies) | feints and aims ahead; + ring-toss rings on shadows, balls, a rolled prize ball; 2 mini donuts | — |
| `magpies` (W6) | flies up high (`hover`); `swoop` ×2: a magpie dives in a V onto a shadow on the floor (a touch grabs a candle; the flock gives them all back when befriended); the big one dips to the floor to peck: stomp | feints and aims ahead; + shiny junk on 4 shadows, 3 magpies per swoop; 2 gophers | — |
| `robo-rex` (W6) | the stomp (`wave`), the tail `sweep` (a wide red band on the floor: its reach), another stomp; cools down: a loose wire glows on his back — land on it: **FIX** | feints; + the roar (`blow`, a gear rolls), 5 bones on shadows, 2 bones kicked at Kinan; Shad builds 2 platforms; 3 baby dino robots | aims ahead; 6 bones twice, then a charge that turns and comes back (`charge2`) → dizzy: the last wire. Befriended, he gives Kinan a ride to the goal (`ride`) |

**Test it:** `__k11.arenaInfo()` (state, gates, boss phase/hp/state, the tell being drawn, shots, floor marks, the event log, the voice lines played) · `__k11.arenaBot(n)` plays the fight through the real input state, reading only what a kid can see · `__k11.auto()` fights too, so `auto(30, {run: true})` clears an arena level (`app/tests/e2e/b1-boss-arenas.spec.ts`, `b2-boss-arenas.spec.ts`). The bot holds RUN for the whole fight (touch always runs; a keyboard holds SHIFT), so one scripted run proves a fight on both; `arenaInfo()` also gives the ♪ (`note`, `noteGot`), Shad's shelves (`built`) and the arrow's word (`pat`).

## 5. The rules (the gate enforces the ones marked ⚙)

1. **The feel table (Contract §1.1) is LOCKED. Change the level, never a number.** If a jump is too hard, move the platform.
2. ⚙ **Every screen has a toy** (bounce / break / discover: gift, brick, spring, shelf, pipe, foe or secret in each 27-column screen). Coins alone are not a toy.
3. ⚙ **No flat run over 8 tiles** without a toy, a foe, a coin run, a wall or a height change (§2.3).
4. ⚙ **Gaps per act** (thirds of the level — of the platforming before the left gate when it has a boss arena, §4.7): act 1 ≤ 3 tiles · act 2 ≤ 4 · act 3 ≤ 5. Never more than 5 — a full-run jump is ~6.4 tiles, a walking jump ~3.8 (a 4- or 5-wide gap needs RUN).
5. ⚙ **3 secrets + 1 golden candle** in every regular level (fort / secret / castle levels are exempt; a regular level without them needs `noSecrets: '<the design reason>'`).
6. **Teach → twist → test** (Playbook): act 1 teaches the level's ONE idea safely, act 2 twists it, act 3 tests it; a breath screen after a hard one; a reward screen before the goal.
7. **Max unwarned drop 4 tiles.** Enemies per screen: act 1 one · act 2 two · act 3 two–three. Spikes never on the only path in act 1.
8. **Boss arenas live in the terrain** (§4.2): a castle's boss (and a fort's mini-boss) is fought on real ground at the end of the level, gates rise behind Kinan, no victory screen — declare it with `arena` (§4.7). ⚙ Its floor is flat open ground between its gates and the `goal` stands past its right gate. **After every high point (a mesa, a spring, a terrace) leave a runway before the next pit**: a full-run jump off a 2-tile ledge carries ~7 tiles, a spring bounce ~9.
9. **No screens inside a level** (§4.1): story rides as bubbles/banners, never a dialog box.
10. ⚙ The file shape itself (ids, worlds, slots, heights steps, cells inside the area, one goal…) — `KinanLevels.validate()`.

## 6. Testing your level

**a) The fast check (no browser):** `cd app && npm run test:unit` — `tests/unit/levels-registry.test.ts` loads every file in the manifest and fails on any problem or lint warning, a stale manifest, a duplicate id or a file in the wrong place. It prints the exact message (`1-3: pit at cols 20-24 is 5 wide; act 1 allows 3 (Playbook §2)`).

**b) Play it:** `cd app && npm start`, then open
`http://127.0.0.1:4173/index.html?devtools=1&level=1-5` (any registered id). Kinan spawns in that level; the goal shows LEVEL CLEAR and returns to the world map (the level counts as beaten there). `?devtools=1` only works on localhost — the live site ignores `?level=`.

**c) Script a playthrough (Playwright + the frame-exact stepper).** Every call below runs synchronously inside the page, one update per frame, identical on every browser:

```ts
import { expect, test } from '@playwright/test';

test('1-3: spawn to goal with RUN held makes every gap', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://127.0.0.1:4174/index.html?devtools=1');
  await page.waitForFunction(() => (window as any).KinanLevels?.ready && (window as any).__k11);
  const r = await page.evaluate(() => {
    const k = (window as any).__k11;
    k.playLevel('1-3');            // or k.playLevel(aDraftObject) to try an unregistered draft
    k.godMode(); k.clearFoes();    // geometry only
    let s = { paused: false };     // a pit death opens the story box and pauses the run
    for (let i = 0; i < 60 && !k.levelInfo().cleared && !s.paused; i++) s = k.auto(60, { run: true });
    return { cleared: k.levelInfo().cleared, fellInPit: s.paused };
  });
  expect(r.fellInPit).toBe(false);
  expect(r.cleared).toBe(true);
  expect(errors).toEqual([]);
});
```

Useful dev hooks (`window.__k11`, dev pages only): `playLevel(idOrDraft)` · `levelInfo()` (id, spawn, goal, areas, seams, cleared, secrets…) · `levels()` (every id with its problems + lint) · `step(n, { left, right, jump, tapJump, fire })` (frame-exact, returns one probe per frame) · `auto(n, { run })` (holds right, jumps at gaps/walls/foes) · `place(x, y)` · `probe()` · `godMode()` · `clearFoes()`.
Put level-specific specs in `app/tests/e2e/wNN-*.spec.ts` (yours to own). The shared `levels-registry.spec.ts` already builds every registered level in all four browsers and checks it has a spawn on solid ground and a goal.

**d) Before you hand off:** `cd app && npm run check` green (one gate at a time on this machine — check free RAM first), your files + `levels/manifest.js` only, and a note in the handoff of what you verified by playing vs. by tests. Fun is UNVERIFIED until the Producer plays it.

## 7. Not wired yet (honest list — build around these, file ENGINE REQUESTS)
- (Wired 2026-10-27: the overworld map between levels — `docs/OVERWORLD-MAP.md`. Your level appears on its map stop as soon as its file is registered: the stop at index `slot - 1` of its world launches it, and it becomes the next stop Kinan must beat. A finished level is saved in `progress.levelsBeaten`; pause/checkpoint still never write a mid-level CONTINUE spot for authored levels.)
- (Wired in engine pass A: candles, the golden-candle reward saved per level, secret prizes, hidden blocks + glint, breakable bricks, the 1-7 secret exit, no game over + the Glitchy helper, one power per pet. Wired in engine pass B1: boss arenas in authored terrain (ER-3, §4.7) with the World 1 and 2 castles and fort mini-bosses, and the bosses' recorded lines with subtitles. Wired in engine pass B2: the World 3, 4 and 5 castles and fort mini-bosses — foreman, chenoa, bronco, moose, conductor, barker.) Still not wired: walk-through fake walls (a `fakeWall` is solid; its hidden gift pops when walked into), pipe warps / secret rooms, sidekick bubbles in levels (ER-4 — boss lines ride their own subtitle line), sprinkler jets (ER-9), per-level music and §5.2 palettes (M6), bosses for Worlds 7-11 (World 6's are wired: `magpies`, `robo-rex`; add a kind to `ARENA_KINDS` + its lines, and to `ARENA_BOSSES` in `levels/registry.js`), switches and gates (the Principal's hall-pass switches, the Safety Foreman's caution-tape gates, Bronco's safe gates), bouncing Chenoa's plates back, golden candles for beating a boss.

# THE OVERWORLD MAP — how the game's world map works
**Owner: Builder. Since 2026-10-27 the map lives in this repo and THIS REPO IS THE SOURCE OF TRUTH.**
The concept folder (`Desktop\Kinan Map Concept\worlds.html`, `worlds\`, `3d-levels\`) was copied in once; it is
history now. Change the map here, never there.

## 1. What the player sees
Title → **PLAY** → the SMW-style map at the saved spot (a new save first watches the **opening cutscene**, below, which
lands on World 1, stop 1) → walk with ◀ ▶ (or the
arrow keys) → **PLAY** (or Enter) on a stop launches that stop's level file → **LEVEL CLEAR** → back on the map:
the stop is red (beaten), the next stop opens (it sparkles, a banner names it) → walk on. After a world's castle
Kinan walks off the map edge into the next world (road trips 6.5 and 9.5 carry him by bus and boat). After
World 11 the 2D→3D transition plays and World 12's 3D map takes over; its stops open the 3D levels.

| Stop look | Means |
|---|---|
| yellow dot + pulse ring | open, not beaten yet: play it |
| red dot | beaten (any exit) |
| faded gray-blue | locked: beat the stop before it |
| traffic cone beside it | **Coming soon** — no level file yet. PLAY says so and launches nothing; it never blocks the trail |
| star | secret level: dim until a secret exit opens it (the trail walks past it until then) |
| fort / castle flag | yellow = open, red = beaten |

### The cutscenes (2026-10-28, index.html block "CUTSCENES" + `fly()` in `map/engine.js`)
- **The opening** plays on the first PLAY of a new save (no `wmap`, nothing in `levelsBeaten`, `introSeen` false): Kinan's
  bedroom drawn on one 432×240 canvas (he wakes up · Shad's DO-NOT-OPEN present plays its gift-card message · one little
  peek · Glitchy bursts out · zips round the room past Mom, "Kinan, NO!" · out of the window), then the real map: the
  camera follows Glitchy stop to stop through World 1, past the castle and off the map edge, glides back to Kinan, and
  the player has World 1, stop 1 (about 45–50 s). Lines: `audio/lines/lines.js` `cutscene` (four new lines in the voice
  script's World 1 "Opening cutscene" moment: `w01_kinan_19`, `w01_shad_05`, `w01_mom_12`, `w01_kinan_20`). It marks the
  World 1 intro lines it tells (the old garage start) heard, so the map's intro goes on with Shad on the console and Mom's
  room rule. "Watch the intro" replays it and never moves the saved spot.
- **The escape** plays once per world after a castle win (Worlds 1–10; World 11 keeps its 2D→3D change): Glitchy pops out
  at the castle, runs off the edge into the next world (over the seam, through a road trip too, into worlds not built
  yet), hops through its first stops and vanishes toward its castle; then Kinan is still at the castle. Lines: the
  world's `exit` lines (Worlds 1–5) or `escape` (Worlds 6–9); a line cut short plays on arrival in the next world.
- Both: skippable at once (a tap anywhere, any key, SKIP); the map is busy and story lines wait until it ends.

### Worlds not in this build (Shad, 2026-10-28)
`OW_RELEASED` in `index.html` (today **8**: World 6 Drumheller and World 7 Vancouver were released 2026-10-28, World 8
Toronto 2026-10-29) is the last released world. Every world after it stays on the map behind a **"WORLD 9 COMING SOON!"**
sign on the road out of the last released castle, with Glitchy waving beside it; ▶ there shows the same words and Kinan
never walks past, whether or not some of that world's level files exist yet (raise `OW_RELEASED` when the next world is
complete). The 8-castle's escape still shows Glitchy leaving for World 9 (he zips himself into a hockey bag that rides
the train east to Montreal: `CUT_ESCAPE_RIDE` in `index.html`; World 6's is the tour bus, World 7's a parcel on a cargo
plane). A save standing in an unreleased world lands on the furthest open stop. Tests reach the later worlds' maps with
`__k11.owRelease(n)` (developer mode only, kept for the tab's session).

### The title and the menu (2026-10-28, index.html block "THE MENU")
The title shows only **PLAY / CONTINUE**, **Start over** (when there is a game to wipe) and **Menu**. One **☰ MENU** button
in the header's top corner opens the same panel on every screen: Resume · World map · Pets · Shop · Settings · How to play
· Watch the intro · More games (Family Brawl, Family Kart, Builder, Classic stages) · Title screen (+ Restart / Reset kart
while a game runs). In a level it is the pause. Settings: the sound switch, music / sound effects / voice volumes,
captions, the device voice, Auto-run, effects, vibration, fullscreen, Install the app, **Support future worlds** (Ko-fi:
`KOFI_URL`, today `https://ko-fi.com/albertancoder`; shown only while it is set and never during play, opens a new tab)
and the credits. The map has no button row of its own any more (its ◀ ▶ PLAY stay); Esc or P opens the menu.

## 2. Files
| Path | What |
|---|---|
| `map/engine.js` | the engine (drawing, walking, seams, banners, ◀ ▶ PLAY buttons). Exposes `window.KINAN` |
| `map/worlds/wNN.js` | one file per world (`w06t.js` = road trip 6.5, `w09t.js` = boat trip 9.5) |
| `map/worlds/w12_3d.js` | World 12's 3D map (`window.KINAN3D`), three.js r160 in `map/worlds/vendor/three-0.160.0/` |
| `map/worlds/w12_models.js` | World 12's models packed as base64 (no `.glb` files ship: a plain or artifact host may not serve them) |
| `3d/level-12-1.html` + `3d/js/`, `3d/levels/`, `3d/assets/models.js`, `3d/css/` | the World 12 3D levels (`?level=<file>&id=<stop id>`) |
| `fonts/` | Pixelify Sans + Nunito (offline; the game page also embeds Pixelify Sans) |
| `index.html` block "THE OVERWORLD MAP" | progress: which stops are open/beaten, launching levels, saving |
| `audio/lines/` | the Worlds 1-5 story lines (V1, 2026-10-28): `lines.js` (GENERATED by `node tools/story-lines.mjs` from the concept folder's voice script) + the clips; index.html block "STORY LINES" plays the world intro on the map and each level's opener, LEVEL CLEAR lines, jokes and barks |
| `sw.js` | cache v45 precaches all of the above plus the game, its levels, the story clips and the boss clips in `audio/voice/` (342 files, 19.2 MB; offline after one load). The packed models, three.js and the fonts are served cache-first |

The world-file format is the concept's (`WORLD_AGENT_GUIDE.md` in the concept folder describes `stops`, `edges`,
`roads`, `bridges`, `props`, `entryPath`/`exitPath`). Shad's map rules there still hold: exactly 11 stops per world
in story order (8 levels, fort, secret, castle last), solid trails, no dead ends but the secret spur.

## 3. Map stop → level file
The stop at index `i` (0-based) of World `N` launches the registered level with **`world: N` and `slot: i + 1`**
(`docs/LEVEL-AUTHORING.md` §1–2). A stop with no such file is **Coming soon**. `app/tests/unit/overworld-map.test.ts`
fails if a level file's kind or number disagrees with the stop at its slot (2026-10-27: World 3's map had 3-8 and the
secret swapped against the files; the map was fixed — the secret is still drawn as a spur off 3-8).
World 12: stops `12-1`, `12-2`, `12-3`, the rough-draft side levels `12-4` (THE WEIR RAPIDS), `12-5` (THE BROADWAY BRIDGE ARCHES),
`12-fort` (FORT: DOWNTOWN SKYLINE), `12-6` (KINSMEN PARK RIDES), `12-7` (THE ART GALLERY), the secret (`12-secret`, SECRET: UNDER THE RIVER),
`12-8` (THE ARENA), and the castle (`12-castle`, THE BESSBOROUGH BIRTHDAY FESTIVAL and the finale) open the 3D levels of the same name
(`OW_3D_LEVELS` in `index.html`). `12-arena` (BIG BRICK) stays as a file, off the map. The secret opens (`unlockedLevels`) once Kinan walks
into the glowing painting behind the start of 12-7 (3d/js/main.js `saveUnlocked`).

## 4. Progress (the save, `kinan-remaster-v1`)
- `levelsBeaten { '1-1': 1, … }` — a level finished by any exit (written when the victory lap ends; the 3D levels
  write `12-…` ids themselves, backup-first like the game).
- `unlockedLevels ['1-secret', …]` — secret stops a secret exit opened (1-7, 2-7, 3-8 today).
- `wmap { w, at }` — where Kinan stands (saved on every arrival).
- The candles collected in a level go to the Party Shop wallet when it is finished.
- Rules (`owAnnotate`): walking in trail order, a stop is **open** when every non-secret stop before it (in every
  earlier world too) is beaten or not built; a secret is open only once its id is in `unlockedLevels`; a world's seam
  opens when its castle is beaten or not built. So, inside the released worlds (`OW_RELEASED`), the trail runs past
  stops with no level file yet and a new level file simply becomes the next thing to beat. If the saved spot is locked (a new file appeared behind it), Kinan stands on the
  furthest open stop.
- `introSeen` — the opening cutscene was shown (set when it starts, so a reload never restarts it); `escapes { '1': 1 }` —
  worlds whose castle escape played. Start over is a new save: the opening plays again.
- Old saves: the new map starts fresh at World 1; candles, golden candles, pets and hats stay. (The reward codes were
  removed on 2026-10-28: every world opens by playing, and an old save's codes are dropped.)
- The classic 11 stages (legacy build) are no longer in the main flow: an old save still reaches them from the
  **Classic stages** entry in the menu's More games (it resumes a half-played classic stage first). Nothing legacy was deleted.

## 5. Developer tools (`?devtools=1` on localhost)
`__k11.worldMap()` opens the map · `__k11.mapState()` (world, stop, walking, banner, every stop's id/kind/built/state)
· `__k11.mapGo(±1)` · `__k11.mapPlay()` · `__k11.mapWarp(world, stop)` drops Kinan anywhere (ignores locks).
`KINAN.speed(n)` walks n times faster (the road trips are long; tests use it). Cutscenes: `__k11.cut()` (what plays),
`__k11.cutSpeed(n)` (n times faster), `__k11.cutSkip()`; `KINAN.fly('intro'|'escape', {onEvent, onDone})` / `KINAN.flySkip()`.
World 12's 3D levels: the map opens `3d/level-12-1.html?level=<file>&id=<stop id>`; on LEVEL CLEAR the page writes
`levelsBeaten[<stop id>]` (backup first), and its **BACK TO THE MAP** button (or confirm on the clear card) goes back to
the page it came from with `sessionStorage['kinan-return'] = 'map'`, so the game opens straight onto the 3D map.
The 3D map and the 3D levels read the equipped pets from the same save (none equipped = none follow).
Tests: `app/tests/e2e/overworld-map.spec.ts`, `overworld-seams-3d.spec.ts`, `overworld-phone-offline.spec.ts`, `c1-cutscenes.spec.ts`, `app/tests/unit/overworld-map.test.ts`.

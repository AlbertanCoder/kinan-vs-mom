/* ============================================================
   LEVEL TEMPLATE — copy me, never edit me in place.
     1. copy to levels/wNN/<file>.js   (1-3 -> w01/l03.js · fort -> w01/fort.js ·
        secret -> w01/secret.js · castle -> w01/castle.js)
     2. change id / world / slot / name (and theme) below
     3. node tools/levels-manifest.mjs         (adds your file to the game)
     4. play it: http://127.0.0.1:4173/index.html?devtools=1&level=<id>
        (start the server from app/: npm start)
   Full guide: docs/LEVEL-AUTHORING.md. Files starting with "_" are never
   loaded, so this example is not in the game. It IS kept problem- and
   lint-clean by app/tests/unit/levels-registry.test.ts.
   Coordinates: col 0 = the level's left edge; rows 0 (sky) .. 14 (bottom);
   one tile = 16 px; the screen is 27 cols x 15 rows.
   ============================================================ */
KinanLevels.register({
  id: '1-1',               /* <world>-<1..8> | <world>-fort | <world>-secret | <world>-castle */
  world: 1,                /* must match the id */
  slot: 1,                 /* its stop on the world map trail, 1-11 (World 1: 1-1..1-5 = 1..5,
                              fort 6, 1-6 7, 1-7 8, secret 9, 1-8 10, castle 11) */
  name: 'MY LEVEL NAME',   /* the plaque on the map — capitals, 40 characters max */
  theme: 0,                /* borrow a legacy stage's look: 0 bedroom, 1 living room, 2 kitchen,
                              3 brick city, 4 photo studio, 5 front yard, ... (index.html LV[]) */
  cols: 54,                /* width in tiles (27 per screen); 27..1200 */

  /* The ground: ONE number per column = the y (px) of the walkable top.
     192 = the usual floor (row 12). Smaller = higher. null = a pit.
     Steps between neighbours: 0 (flat, on a multiple of 16), 8 (a 2:1 slope)
     or 16 (a 1:1 slope, between multiples of 16). Up and down slopes need a
     flat between them. Walls and bigger steps: use `solid` below. */
  heights: [
    /* screen 1 (cols 0-26): teach — a BROW to climb, a 2-wide pit */
    192,192,192,192,192,192, 184,176, 176,176,176,176, 184,192, 192,192,192,192, null,null, 192,192,192,192,192,192,192,
    /* screen 2 (cols 27-53): test — a steep MESA, a 3-wide pit, the goal */
    192,192,192, 176,160, 160,160,160,160,160, 176,192, 192,192,192,192,192, null,null,null, 192,192,192,192,192,192,192
  ],

  /* optional: plain solid ground rectangles [col0, row0, col1, row1] for walls,
     steps, overhangs and ceilings */
  solid: [[25, 10, 25, 11]],

  tiles: {
    gift:   [[9, 8, 'popper']],        /* [col, row, prize] prize: candle (default) popper cake heart hat lasso umbrella */
    brick:  [[33, 7], [34, 7], [35, 7]],
    spring: [[41, 11]],
    shelf:  [[48, 8], [49, 8], [50, 8]]   /* semisolid: land from above, jump up through */
  },
  pipes: [],                           /* [col, row] — decoration + a landmark for now (no warp yet) */
  foes: [[22, 11, 'sock'], [39, 11, 'lego']],   /* [col, row, type] — any type in index.html FOE{} */
  candles: [[3, 11], [4, 11], [44, 9], [45, 8], [46, 9]],   /* coins: arcs show the safe line */
  secrets: [                           /* exactly 3 in a regular level (or set noSecrets: 'why') */
    { kind: 'visible', col: 45, row: 7, prize: 'heart' },
    { kind: 'hidden', col: 34, row: 6, prize: 'GOLDEN CANDLE' },
    { kind: 'skill', col: 49, row: 7, prize: 'hat' }
  ],
  goldenCandle: { col: 34, row: 6 },   /* 1 per regular level, inside one of the secrets */
  checkpoint: { col: 28, row: 11 },    /* the flag; a pit costs a heart and respawns here */
  spawn: { col: 2, row: 11 },          /* the tile Kinan stands IN (his feet rest on row + 1) */
  goal: { col: 51, row: 11 }           /* the picket arch: walking through it = LEVEL CLEAR */
});

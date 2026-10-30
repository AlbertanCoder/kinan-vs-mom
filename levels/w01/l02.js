/* ============================================================
   LEVEL 1-2 · THE LIVING ROOM  (World 1 · Saskatoon home · trail stop 2)
   Story bible: "Couch hills and a coffee-table mesa to run under."
   Glitchy zipped through the living room: the couch cushions are hills
   and the roomba is on patrol.
   Idea (ONE): HILLS + OVER-OR-UNDER. Couch slopes to run up and down,
   and the coffee table: run UNDER it (safe, candles) or hop OVER it
   (the roomba patrols the top, a gift waits there). First real pits
   (2 and 3 wide, always under a candle arc).
   Acts (thirds): 0-53 teach (the couch BROW, the cushion RIDGE, the
   first pit) · 54-107 twist (THE COFFEE TABLE, the big sectional MESA
   and the floor lamp) · 108-161 test (the TV unit, then the bouncy
   cushion reward and the front door).
   Signature toy: the coffee table you can run under.
   Secrets: visible = the lampshade over the sectional (heart) · hidden =
   inside the TV unit, bump it from the crawl space you enter from the
   right (GOLDEN CANDLE) · skill = RUN onto the bouncy cushion and steer
   to the coat shelf (hard hat).
   ============================================================ */
KinanLevels.register({
  id: '1-2', world: 1, slot: 2, kind: 'level',
  name: 'THE LIVING ROOM',
  theme: 1,                 /* the legacy living room look */
  cols: 162,
  heights: [
    /* S1 0-26 the rug + the couch (BROW: seat at 160, c10-15) */
    192,192,192,192,192,192, 184,176,168,160, 160,160,160,160,160,160, 168,176,184,192, 192,192,192,192,192,192,192,
    /* S2 27-53 two cushion humps (RIDGE) · first pit c44-45 */
    192,192, 184, 176,176,176, 184, 192, 192, 184, 176,176,176, 184, 192, 192,192, null,null, 192,192,192,192,192,192,192,192,
    /* S3 54-80 THE COFFEE TABLE (a solid slab, c58-69) · pit c74-76 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null, 192,192,192,192,
    /* S4 81-107 the big sectional (MESA at 144, c88-96, steep 1:1 back side) */
    192,192, 184,176,168,160,152,144, 144,144,144,144,144,144,144,144, 160,176,192, 192,192,192,192,192,192,192,192,
    /* S5 108-134 pit c112-114 · the TV unit (solid blocks) */
    192,192,192,192, null,null,null, 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 the bouncy cushion, the coat shelf, the front door */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [58, 10, 69, 10],                     /* the coffee table: top at y=160, a 1-tile tunnel under it */
    [116, 10, 117, 11],                   /* the side table: the step up onto the TV unit */
    [118, 9, 127, 10],                    /* the TV unit: 2 rows thick, a crawl space under it (row 11), open on the right */
    [122, 7, 124, 8]                      /* the TV on the unit */
  ],
  tiles: {
    gift: [[12, 7, 'popper'], [50, 9, 'candle'], [63, 7, 'candle'], [103, 9, 'candle'], [118, 10, 'gold'],
           [93, 3, 'heart'], [148, 2, 'hat']],
    brick: [[49, 9], [51, 9], [102, 9], [104, 9]],
    spring: [[140, 12]],          /* the bouncy cushion, flush with the floor */
    shelf: [[92, 6], [93, 6], [94, 6], [147, 5], [148, 5], [149, 5], [150, 5]],
    crack: [[21, 12], [22, 12], [23, 12]],   /* SLAM SPOT 1 (the lesson): cracked floorboards in the rug over a pocket of candles */
    crate: [[119, 9], [119, 10]]             /* SLAM SPOT 2: two crates built into the TV unit, a shortcut down into the crawl space by the golden candle */
  },
  open: [[21, 13, 23, 13]],                  /* the pocket under the cracked floorboards (solid floor under it) */
  talk: [[17, 'KINAN', 'Cracked floorboards? Time for my famous BUTT SLAM!']],
  foes: [[22, 11, 'robot'], [38, 10, 'ball'], [64, 9, 'roomba'], [72, 11, 'ball'],
         [95, 8, 'robot'], [101, 11, 'ball'], [120, 8, 'teddy'], [131, 11, 'robot'], [154, 11, 'teddy']],
  candles: [[2, 11], [3, 11], [10, 8], [11, 8], [13, 8], [14, 8],
            [31, 9], [32, 9], [37, 9], [38, 8], [39, 9], [43, 10], [44, 9], [45, 9], [46, 10],
            [60, 11], [62, 11], [64, 11], [66, 11], [68, 11],           /* the run-under */
            [73, 10], [74, 9], [75, 8], [76, 9], [77, 10],
            [84, 9], [86, 8], [90, 7], [91, 6], [93, 5], [94, 5],
            [111, 10], [112, 9], [113, 8], [114, 9], [124, 11], [125, 11], [126, 11],
            [140, 7], [140, 5], [143, 4], [144, 4], [145, 4], [147, 4], [149, 4], [157, 11], [158, 11],
            [21, 13], [22, 13], [23, 13]],                                 /* SLAM SPOT 1: the pocket under the cracked floorboards */
  secrets: [
    { kind: 'visible', col: 93, row: 3, prize: 'heart' },           /* Secret-1: up the sectional, onto the lampshade */
    { kind: 'hidden', col: 118, row: 10, prize: 'GOLDEN CANDLE' },  /* Secret-2: inside the TV unit (crawl in from the right) */
    { kind: 'skill', col: 148, row: 2, prize: 'hat' }               /* Secret-3: RUN off the bouncy cushion onto the coat shelf */
  ],
  goldenCandle: { col: 118, row: 10 },
  checkpoint: { col: 100, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 158, row: 11 }             /* the front door */
});

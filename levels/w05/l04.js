/* ============================================================
   LEVEL 5-4 · THE CHUCKWAGON TRACK
   (World 5 · Calgary Stampede · trail stop 4)
   Story bible (World 5 table): "Race wagons around the track."
   Bronco's hoofprints lead straight onto the chuckwagon racetrack just
   as the evening races start: four-horse wagons, outriders, the barrel
   figure-eight at the start, and the long run home past the grandstand.
   Kinan races the whole field. On foot.
   Idea (ONE): KEEP RUNNING. The track is long rolling hills: run down
     them fast and use the speed for the gaps that come right after. The
     chuckwagons are the obstacles (two tiles tall: hop them, or jump off
     one over a gap) and the race is coming the other way: corn dogs,
     tumbleweeds and charging mini bulls. Act 1 teaches it: the barrel
     figure-eight, the first BROW and a 3-wide gap at its foot, two
     wagons; act 2 twists it: the infield BOWL, THE FIRST TURN (a RIDGE
     with a 4-wide gap across its top), THE BACKSTRETCH (jump off a
     wagon over a gap), the TERRACE; act 3 tests it: THE FINAL TURN, two
     5-wide gaps, then THE HOMESTRETCH past the grandstand.
   Acts (thirds): 0-89 teach (the starting gate, the barrels, the BROW
     and a 3-wide gap, two wagons and a 3-wide gap) · 90-179 twist (the
     infield BOWL, the checkpoint, THE FIRST TURN 4, THE BACKSTRETCH 4,
     the TERRACE and a 4-wide gap) · 180-269 test (THE FINAL TURN 5/5,
     THE HOMESTRETCH, the finish line MESA).
   Signature set-piece: THE FIRST TURN (S5): up the steep bank, a
     4-wide gap across the top of the turn, down the far side, the
     wagons thundering past below.
   Secrets: visible = THE MARSHAL'S FLAG (S7): a little platform sticks
     out over the lip of the 4-wide gap at the top of the terrace; stop
     at the edge and hop up onto it instead of jumping across (heart +
     candles, 178,6) · hidden = THE
     STARTING GATE (S1): run LEFT from the start; the gate's top beam
     glints; jump under it at the very edge (GOLDEN CANDLE, 0,7) · skill = THE CANVAS TOP
     (S9): from the tallest chuckwagon jump up onto its canvas, then
     back up-left to the cook's flag on the very top (hat, 217,2).
   Look: borrows the Chuckwagon Track (theme 34): a warm evening sky,
     the grandstand, the dirt track.
   Bubble beats for ER-4 (not wired): c2 the announcer: "And they're
     OFF!" · c5 Shad: "A lasso! Candles fly to you now." · c48 Kinan:
     "Down the hill, jump the gap, GO!" · c106 checkpoint, an outrider:
     "Why don't horses ever win at cards? They always say NEIGH!" · c179
     Chenoa: "That flag is sticking out over NOTHING." · c240 Shad: "You
     beat a chuckwagon. On FOOT."
   ENGINE REQUESTS: chuckwagons that race along the track (moving
     solid platforms you can ride, with horses: the 2-tall solid blocks
     stand in today) · a wagon skin for the solid blocks and a canvas
     skin for the shelves · barrels for the figure-eight · dust clouds
     behind the racing foes · bubbles ER-4.
  
   ============================================================ */
KinanLevels.register({
  id: '5-4', world: 5, slot: 4, kind: 'level',
  name: 'THE CHUCKWAGON TRACK',
  theme: 34,              /* the Chuckwagon Track: a warm evening sky, the grandstand, the dirt track */
  cols: 270,
  heights: [
    /* S1 0-26 THE STARTING GATE (its beam over c0-1, behind the start) · the barrel figure-eight (c8, c14, c20) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 the first BROW (c30-43) · a 3-wide gap c47-49 at its foot */
    192,192,192,184,176,168,160,160,160,160,160,160,160,168,176,184,192,192,192,192,null,null,null,192,192,192,192,
    /* S3 54-80 two chuckwagons (c58-62, c67-71) · a 3-wide gap c76-78 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,
    /* S4 81-107 the infield BOWL (c84-95) · checkpoint */
    192,192,192,200,208,208,208,208,208,208,208,208,208,200,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 THE FIRST TURN: up the bank (c110-112, 1:1), a 4-wide gap c119-122 across the top, down (c127-129) */
    192,192,176,160,144,144,144,144,144,144,144,null,null,null,null,144,144,144,144,160,176,192,192,192,192,192,192,
    /* S6 135-161 THE BACKSTRETCH: two wagons (c138-141, c145-148) · a 4-wide gap c149-152 right off the second */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 the TERRACE (c165-173) · a 4-wide gap c179-182 off its top, THE MARSHAL'S FLAG over it */
    192,192,192,184,176,176,176,176,176,176,168,160,160,160,160,160,160,null,null,null,null,160,160,160,160,160,160,
    /* S8 189-215 THE FINAL TURN: a 5-wide gap c192-196 across the top, down (c201-202), a 5-wide gap c206-210 */
    160,160,160,null,null,null,null,null,160,160,160,160,176,192,192,192,192,null,null,null,null,null,192,192,192,192,192,
    /* S9 216-242 THE HOMESTRETCH: the tallest chuckwagon (c220-223) with its canvas and the cook's flag (skill) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S10 243-269 reward: the finish line, the winners' MESA (c248-257), Dad's truck */
    192,192,192,192,192,176,160,160,160,160,160,160,160,176,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [0, 6, 1, 7], [8, 10, 9, 11], [14, 10, 15, 11], [20, 10, 21, 11],   /* S1 THE STARTING GATE's top beam (a glinting block in it) · the three barrels */
    [58, 10, 62, 11], [67, 10, 71, 11],   /* S3 two chuckwagons */
    [138, 10, 141, 11], [145, 10, 148, 11],   /* S6 THE BACKSTRETCH wagons */
    [220, 9, 223, 11]   /* S9 the tallest chuckwagon */
  ],
  tiles: {
    gift: [
      [0, 7, 'gold'], [5, 8, 'lasso'],   /* S1 the glinting gate beam · the LASSO (candles fly to you) */
      [36, 5],   /* S2 */
      [64, 8],   /* S3 */
      [89, 9], [91, 9, 'heart'],   /* S4 over the bowl */
      [143, 7],   /* S6 */
      [199, 6],   /* S8 */
      [235, 8],   /* S9 */
      [251, 5], [253, 5, 'cake'], [255, 5, 'heart']   /* S10 the winners' circle */
    ],
    brick: [
      [35, 5], [37, 5],   /* S2 */
      [63, 8], [65, 8],   /* S3 */
      [88, 9], [90, 9], [92, 9],   /* S4 */
      [234, 8], [236, 8],   /* S9 */
      [252, 5], [254, 5]   /* S10 */
    ],
    shelf: [
      [178, 7], [179, 7],   /* S7 THE MARSHAL'S FLAG platform at the lip of the gap (visible secret) */
      [220, 6], [221, 6], [217, 3], [218, 3]   /* S9 the canvas and the cook's flag (skill secret) */
    ]
  },
  /* corn dogs and tumbleweeds race the wrong way, hay bales roll, mini bulls charge (the outriders), crows and geese above; nothing waits at a gap's lip */
  foes: [
    [24, 11, 'tumbleweed'],   /* S1 */
    [37, 9, 'corndog'],   /* S2 on the brow */
    [65, 11, 'minibull'],   /* S3 between the wagons */
    [90, 12, 'haybale'], [100, 4, 'goose'],   /* S4 */
    [124, 3, 'crow'], [131, 11, 'tumbleweed'],   /* S5 */
    [143, 11, 'minibull'], [158, 11, 'corndog'],   /* S6 between the wagons */
    [168, 10, 'haybale'], [186, 3, 'crow'],   /* S7 */
    [203, 3, 'crow'], [213, 11, 'corndog'],   /* S8 */
    [228, 3, 'goose'], [233, 11, 'haybale'], [239, 11, 'tumbleweed'],   /* S9 */
    [262, 11, 'corndog']   /* S10 */
  ],
  candles: [
    [3, 11], [4, 11], [5, 7], [8, 9], [9, 9], [11, 8], [14, 9], [15, 9], [17, 8], [20, 9], [21, 9], [23, 11], [26, 11], [30, 10],
    [31, 9], [32, 8], [34, 9], [36, 9], [38, 9], [36, 4], [41, 9], [42, 10], [43, 11], [46, 11], [47, 9], [48, 8], [49, 9], [50, 11],
    [51, 11], [52, 11], [53, 11], [55, 11], [56, 11], [57, 11], [58, 9], [60, 9], [62, 9], [64, 7], [67, 9], [69, 9], [71, 9], [73, 11],
    [74, 11], [75, 11], [76, 9], [77, 8], [78, 9], [79, 11], [81, 11], [82, 11], [83, 11], [85, 11], [86, 12], [89, 8], [91, 8], [94, 12],
    [95, 11], [97, 11], [99, 11], [101, 11], [103, 11], [105, 11], [110, 10], [111, 9], [112, 8], [113, 8], [115, 8], [117, 8], [118, 8], [119, 6],
    [120, 5], [121, 5], [122, 6], [123, 8], [124, 8], [125, 8], [126, 8], [128, 9], [129, 10], [132, 11], [133, 11], [134, 11], [135, 11], [136, 11],
    [137, 11], [138, 9], [140, 9], [143, 6], [145, 9], [146, 9], [147, 9], [148, 9], [149, 7], [150, 6], [151, 5], [152, 5], [153, 6], [154, 8],
    [156, 11], [158, 11], [160, 11], [165, 10], [166, 10], [167, 10], [169, 10], [171, 10], [172, 9], [173, 9], [174, 9], [176, 9], [178, 9], [178, 5],
    [179, 7], [180, 6], [181, 6], [182, 7], [183, 9], [184, 9], [186, 9], [188, 9], [191, 9], [192, 7], [193, 6], [194, 6], [195, 6], [196, 7],
    [197, 9], [199, 5], [198, 9], [199, 9], [200, 9], [201, 10], [202, 11], [205, 11], [206, 9], [207, 8], [208, 8], [209, 8], [210, 9], [211, 11],
    [213, 11], [215, 11], [218, 11], [219, 11], [220, 8], [221, 8], [222, 8], [223, 8], [221, 5], [218, 2], [225, 11], [227, 11], [229, 11], [231, 11],
    [235, 7], [246, 11], [248, 10], [249, 9], [250, 9], [251, 9], [252, 9], [253, 9], [254, 9], [255, 9], [251, 4], [253, 4], [255, 4], [259, 11],
    [261, 11], [263, 11], [265, 11]
  ],
  secrets: [
    { kind: 'visible', col: 178, row: 6, prize: 'heart+candles' },   /* THE MARSHAL'S FLAG over the terrace gap */
    { kind: 'hidden', col: 0, row: 7, prize: 'GOLDEN CANDLE', glint240: true },   /* THE STARTING GATE's beam, behind the start */
    { kind: 'skill', col: 217, row: 2, prize: 'hat' }   /* the cook's flag on top of the tallest chuckwagon */
  ],
  goldenCandle: { col: 0, row: 7 },
  checkpoint: { col: 106, row: 11 },
  spawn: { col: 3, row: 11 },
  goal: { col: 266, row: 11 }   /* Dad's truck waits past the finish line */
});

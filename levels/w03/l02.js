/* ============================================================
   LEVEL 3-2 · WELCOME TO FORT MCMURRAY
   (World 3 · Robin's oilfield trip · trail stop 2)
   Story bible (World 3 table): "Highway 63 at dawn, hopping across
   truck roofs." Glitchy is riding the truck radio, and every radio on
   Highway 63 is playing beeps. The road crew stopped traffic for the
   twinning work, so the trucks sit nose to tail all the way to the
   "Welcome to Fort McMurray" sign. Kinan gets out to stretch his legs.
   Idea (ONE): THE CONVOY STAIRS. Every truck is a different height:
     a pickup (2 up), a hydro-vac tank (4 up, too tall to jump straight
     onto, so use the barrier or the pickup as a step), a pipe truck
     with its load, a semi whose trailer stands 5 up on its landing gear.
     Climb up the convoy and run down it. Act 1 teaches it on a road
     that is safe to fall on; act 2 parks the convoy over the
     construction trench (miss a roof and it is a pit); act 3 asks for
     running jumps from cab to truck across 5-wide trenches.
   Acts (72 cols each): teach 0-71 (a pickup, the first hydro-vac and
     its boom, the pipe truck, a 3-wide ditch, THE BIG SEMI) · twist
     72-143 (the barrier step, a 4-wide trench between a hydro-vac and a
     pipe truck, the checkpoint, THE BOOM over the trench, the tall
     semi) · test 144-215 (5-wide trenches with ravens over the roofs,
     the water truck's boom and the highway sign, a 3-wide drop, then
     the welcome sign).
   Signature set-piece: THE BOOM (S5): a hydro-vac's boom arm reaches
     out over the trench; walk out on it.
   Secrets: visible = the end of the boom, out over the trench (heart +
     candles, 126,4) · hidden = the big semi's trailer floats on its
     landing gear: walk into the pocket under it and bump the glinting
     belly by the legs (GOLDEN CANDLE, 62,9) · skill = the overhead
     highway sign is solid and too high to reach from any roof: climb
     the water truck's boom (S7), turn round and jump up-LEFT onto the
     sign; a fall lands on the road (hat, 159,1).
   Look: borrows the Highway at Dawn look (theme 11): a purple-orange
     sunrise, grain elevators, power lines and a fence. The trucks are
     toy bricks (toyBricks keeps them whole); the chassis is road-dark.
   Bubble beats for ER-4 (not wired): c2 Robin: "Highway 63. Four
     hundred kilometres of trucks and one coffee shop." · c18 (first
     hydro-vac) "That's what I drive, bud. It digs with water and
     sucks up the mud. Like your little brother with spaghetti." ·
     c110 checkpoint, the flag person: "Slow! ...I mean, SLOW DOWN." ·
     c126 (on the boom) Robin: "Don't look down. Okay, look a little."
     · c205 the welcome sign: "WELCOME TO FORT McMURRAY." Robin's joke
     (World 3 joke book): "Why did the truck driver bring a pencil?
     To draw the curtains in his sleeper cab."
   ENGINE REQUESTS: truck skins for the brick bodies (hydro-vac tank
     and boom, pipe load, semi trailer, pickup) and a road-dark chassis
     tile · a flag-person foe with a STOP/SLOW sign that holds the lane
     on a beat · a raven skin ('crow' stands in) · an overhead highway sign skin · trucks that creep
     forward when the flag turns to SLOW (moving platforms) · a welcome
     sign prop for the goal.
   Truck list (generated): S1 pickup c7-11 (box top row 10, cab top row 9) · S1 hydro-vac c15-22 (tank top row 8, cab top row 9) · S2 pipe truck c28-38 (bed top row 10, cab top row 8) · S2 pickup c48-52 (box top row 10, cab top row 9) · S3 semi c55-67 (trailer top row 7, cab top row 9) · S4 hydro-vac c81-88 (tank top row 8, cab top row 9) · S4 pipe truck c93-103 (bed top row 10, cab top row 8) · S5 hydro-vac c116-123 (tank top row 8, cab top row 9) · S5 pickup c128-132 (box top row 10, cab top row 9) · S6 semi c135-147 (trailer top row 7, cab top row 9) · S6 pickup c153-157 (box top row 10, cab top row 9) · S7 hydro-vac c161-168 (tank top row 8, cab top row 9) · S7 pipe truck c174-184 (bed top row 10, cab top row 8) · S8 pickup c193-197 (box top row 10, cab top row 9).
   ============================================================ */
KinanLevels.register({
  id: '3-2', world: 3, slot: 2, kind: 'level',
  name: 'WELCOME TO FORT MCMURRAY',
  theme: 11,                /* the Highway at Dawn look: sunrise, grain elevators, power lines */
  toyBricks: true,          /* the trucks are toy bricks: they never break */
  cols: 216,
  heights: [
    /* S1 0-26 the shoulder · S2 27-53 the ditch c43-45 · S3 54-80 the big semi · S4 81-107 trench c89-92 ·
       S5 108-134 trench c124-127 · S6 135-161 trench c148-152 · S7 162-188 trench c169-173, c185-187 · S8 189-215 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
      [7, 11, 11, 11], [15, 11, 22, 11], [28, 11, 38, 11], [48, 11, 52, 11], [65, 11, 67, 11], [63, 10, 63, 11],
      [78, 10, 79, 11], [81, 11, 88, 11], [93, 11, 103, 11], [113, 10, 114, 11], [116, 11, 123, 11], [128, 11, 132, 11],
      [145, 11, 147, 11], [135, 10, 135, 11], [153, 11, 157, 11], [161, 11, 168, 11], [158, 2, 160, 2], [174, 11, 184, 11],
      [193, 11, 197, 11]
  ],
  tiles: {
    gift: [
      [4, 8, 'candle'], [12, 6, 'popper'], [36, 6, 'candle'], [62, 9, 'gold'], [74, 8, 'candle'], [97, 5, 'heart'],
      [113, 7, 'candle'], [131, 6, 'candle'], [154, 6, 'heart'], [178, 5, 'candle'], [194, 8, 'cake'], [203, 4, 'candle']
    ],
    brick: [
      [7, 10], [8, 10], [9, 10], [10, 9], [11, 9], [10, 10], [11, 10], [15, 8], [16, 8], [17, 8], [18, 8], [19, 8], [20, 8], [15, 9],
      [16, 9], [17, 9], [18, 9], [19, 9], [20, 9], [15, 10], [16, 10], [17, 10], [18, 10], [19, 10], [20, 10], [21, 9], [22, 9], [21, 10],
      [22, 10], [28, 10], [29, 10], [30, 10], [31, 10], [32, 10], [33, 10], [34, 10], [35, 10], [36, 10], [37, 8], [38, 8], [37, 9], [38, 9],
      [37, 10], [38, 10], [48, 10], [49, 10], [50, 10], [51, 9], [52, 9], [51, 10], [52, 10], [55, 7], [56, 7], [57, 7], [58, 7], [59, 7],
      [60, 7], [61, 7], [62, 7], [63, 7], [64, 7], [55, 8], [56, 8], [57, 8], [58, 8], [59, 8], [60, 8], [61, 8], [62, 8], [63, 8],
      [64, 8], [55, 9], [56, 9], [57, 9], [58, 9], [59, 9], [60, 9], [61, 9], [63, 9], [64, 9], [65, 9], [66, 9], [67, 9], [65, 10],
      [66, 10], [67, 10], [81, 8], [82, 8], [83, 8], [84, 8], [85, 8], [86, 8], [81, 9], [82, 9], [83, 9], [84, 9], [85, 9], [86, 9],
      [81, 10], [82, 10], [83, 10], [84, 10], [85, 10], [86, 10], [87, 9], [88, 9], [87, 10], [88, 10], [93, 10], [94, 10], [95, 10], [96, 10],
      [97, 10], [98, 10], [99, 10], [100, 10], [101, 10], [102, 8], [103, 8], [102, 9], [103, 9], [102, 10], [103, 10], [116, 8], [117, 8], [118, 8],
      [119, 8], [120, 8], [121, 8], [116, 9], [117, 9], [118, 9], [119, 9], [120, 9], [121, 9], [116, 10], [117, 10], [118, 10], [119, 10], [120, 10],
      [121, 10], [122, 9], [123, 9], [122, 10], [123, 10], [128, 10], [129, 10], [130, 10], [131, 9], [132, 9], [131, 10], [132, 10], [135, 7], [136, 7],
      [137, 7], [138, 7], [139, 7], [140, 7], [141, 7], [142, 7], [143, 7], [144, 7], [135, 8], [136, 8], [137, 8], [138, 8], [139, 8], [140, 8],
      [141, 8], [142, 8], [143, 8], [144, 8], [135, 9], [136, 9], [137, 9], [138, 9], [139, 9], [140, 9], [141, 9], [142, 9], [143, 9], [144, 9],
      [145, 9], [146, 9], [147, 9], [145, 10], [146, 10], [147, 10], [153, 10], [154, 10], [155, 10], [156, 9], [157, 9], [156, 10], [157, 10], [161, 8],
      [162, 8], [163, 8], [164, 8], [165, 8], [166, 8], [161, 9], [162, 9], [163, 9], [164, 9], [165, 9], [166, 9], [161, 10], [162, 10], [163, 10],
      [164, 10], [165, 10], [166, 10], [167, 9], [168, 9], [167, 10], [168, 10], [174, 10], [175, 10], [176, 10], [177, 10], [178, 10], [179, 10], [180, 10],
      [181, 10], [182, 10], [183, 8], [184, 8], [183, 9], [184, 9], [183, 10], [184, 10], [193, 10], [194, 10], [195, 10], [196, 9], [197, 9], [196, 10],
      [197, 10]
    ],
    shelf: [
      [20, 5], [21, 5], [22, 5], [23, 5], [29, 8], [30, 8], [31, 8], [32, 8], [33, 8], [34, 8], [35, 8], [36, 8], [94, 8], [95, 8],
      [96, 8], [97, 8], [98, 8], [99, 8], [100, 8], [101, 8], [121, 5], [122, 5], [123, 5], [124, 5], [125, 5], [126, 5], [162, 5], [163, 5],
      [164, 5], [165, 5], [175, 8], [176, 8], [177, 8], [178, 8], [179, 8], [180, 8], [181, 8], [182, 8], [199, 7], [200, 7], [201, 7], [202, 7],
      [203, 7], [204, 7], [205, 7], [206, 7], [207, 7], [208, 7]
    ]
  },
  /* cones walk the roofs, the flag person's cones (hopcone) hop after you, gophers live on the shoulder, ravens patrol */
  talk: [   /* Dad's jokes, the wheeze-laugh, Mom's reactions (tools/dad-lines.mjs) */
    [30, "DAD", "What did the oil say to the pumpjack? Stop... hee hee... stop... HAHA... stop pumping me for... I can't—", 4.4, "wheeze"],
    [30, "KINAN", "...for information. Dad. Breathe.", 2.6]
  ],
  foes: [
      [25, 11, 'cone'], [40, 11, 'gopher'], [60, 6, 'cone'], [82, 4, 'crow'], [97, 9, 'cone'], [118, 7, 'cone'],
      [133, 11, 'hopcone'], [139, 4, 'crow'], [143, 6, 'cone'], [158, 11, 'gopher'], [177, 4, 'crow'], [178, 9, 'cone'],
      [210, 11, 'cone']
  ],
  candles: [
      [2, 11], [3, 11], [9, 9], [12, 8], [16, 7], [18, 7], [20, 4], [22, 4], [30, 7], [32, 7], [34, 7], [43, 9], [44, 8], [45, 9],
      [50, 9], [52, 8], [57, 6], [59, 6], [61, 6], [63, 6], [57, 11], [58, 11], [59, 11], [60, 11], [61, 11], [70, 11], [72, 11], [82, 7],
      [84, 7], [86, 7], [89, 7], [90, 6], [91, 6], [92, 7], [95, 7], [97, 7], [99, 7], [105, 11], [106, 11], [107, 11], [117, 7], [119, 7],
      [122, 4], [126, 4], [124, 7], [125, 8], [126, 8], [127, 7], [137, 6], [139, 6], [141, 6], [143, 6], [148, 7], [149, 7], [150, 7], [151, 7],
      [152, 8], [162, 7], [164, 7], [166, 7], [163, 4], [165, 4], [158, 1], [160, 1], [169, 7], [170, 6], [171, 5], [172, 5], [173, 6], [176, 7],
      [178, 7], [180, 7], [182, 7], [185, 7], [186, 6], [187, 7], [189, 11], [190, 11], [191, 11], [194, 9], [196, 8], [197, 8], [200, 6], [202, 6],
      [204, 6], [206, 6], [208, 6], [211, 11], [212, 11]
  ],
  secrets: [
    { kind: 'visible', col: 126, row: 4, prize: 'heart+candles' },                 /* the end of the boom, out over the trench */
    { kind: 'hidden', col: 62, row: 9, prize: 'GOLDEN CANDLE', glint240: true },   /* the trailer's glinting belly, by the landing gear */
    { kind: 'skill', col: 159, row: 1, prize: 'hat' }                              /* from the water truck's boom, jump back up-left onto the highway sign */
  ],
  goldenCandle: { col: 62, row: 9 },
  checkpoint: { col: 110, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 212, row: 11 }             /* the welcome sign */
});

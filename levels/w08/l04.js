/* ============================================================
   LEVEL 8-4 · THE CN TOWER GLASS FLOOR
   (World 8 · Toronto · trail stop 4)
   Story bible (World 8 table): "Up the tower; jumps on the glass
   floor." The raccoon carries Glitchy's shiny parcel up the CN Tower
   (553 metres!). Kinan takes the 1,776 stairs after it, crosses the
   famous glass floor with the whole city far below his feet, and
   follows it out onto the outside ledge around the outside of the tower.
   Idea (ONE): THE WIND. Up high the wind gusts (World 7's wind): every
     gust is warned for a second first (a whoosh, streaks, the WIND
     COMING toast), pushes Kinan back, is weaker in the air and never
     pushes him off a ledge he stands on. Act 1 teaches it (the look-out
     terrace: gusts on flat ground, no gaps); act 2 twists it (the
     window-cleaners have the observation deck's windows open: gusts
     blow across the GLASS FLOOR between the 4- and 3-wide gaps); act 3
     tests it (THE OUTSIDE LEDGE, outside around the top: 4/5/5 in the
     gusts).
   The glass floor: the observation deck's floor is a see-through glass
     skin (the 'glass' skin: panes in a steel frame, rooftops, streets
     and parks far, far below). It is solid like any floor.
   Acts (thirds): 0-89 teach (the base, the stairs 2/3, the look-out
     terrace in the wind, THE GLASS ELEVATOR) · 90-179 twist (3, the
     glass floor 4/3 with THE WINDOW LEDGE, 4, the checkpoint, up to
     the outside ledge) · 180-269 test (the outside ledge 4/5/5, the elevator
     down, THE ROUNDHOUSE ROOF, the base).
   Signature set-piece: THE GLASS FLOOR (S4-S6), jumping gap to gap
     while the city is under your feet.
   Secrets: visible = THE WINDOW LEDGE (S5): a window-washer's ledge
     over the 3-wide gap; jump UP onto it from the glass floor (heart
     + candles, 127,2) · hidden = THE GLASS ELEVATOR (S4): the elevator
     car waits over the terrace; one of its glass panels glints (GOLDEN
     CANDLE, 85,3; two candles under it point up) · skill = THE
     ROUNDHOUSE ROOF (S10): back at the bottom, bounce off the spring
     and steer onto the little roof (hat, 258,2).
   Gaps: act 1 2/3 · act 2 3/4/3/4 · act 3 4/5/5. Every gap has a candle
     arc; nothing waits at a lip; a gust can never push Kinan off a
     ledge he stands on; the checkpoint (c156) is right before the
     climb to the outside ledge. A full-run jump off the window ledge or the
     roundhouse roof lands on floor (w8-levels.spec.ts checks it). No
     spring up on the tower (a bounce there would leave the screen).
   Raccoons (World 8, snatch): a raccoon grabs a candle and runs.
   Look: Up the CN Tower (theme 103, World 8's own look): Lake Ontario
     and the Islands far below, clouds under us, the tops of the city's
     towers and the stadium's dome, the tower's own concrete and the
     main pod's windows right behind.
   ENGINE REQUESTS: a harness rail along the outside ledge (looks only).
   ============================================================ */
KinanLevels.register({
  id: '8-4', world: 8, slot: 4, kind: 'level',
  name: 'THE CN TOWER GLASS FLOOR',
  theme: 103,   /* Up the CN Tower: the lake and the city far below, the tower's concrete behind */
  cols: 270,
  snatch: true,   /* World 8: raccoons grab a candle and run */
  /* THE WIND (World 7's twist): taught on the terrace (no gaps), across the glass floor's open windows, all along the outside ledge */
  wind: [[61, 80], [108, 134], [164, 238]],
  /* the glass floor (looks only): the observation deck's floor, the city far below */
  skins: [['glass', 93, 6, 113, 7], ['glass', 118, 6, 125, 7], ['glass', 129, 6, 139, 7], ['glass', 144, 6, 161, 7]],
  heights: [
    /* S1 0-26 the base of the tower: up a step (c12-13), a 2-wide gap c22-23 */
    192,192,192,192,192,192,192,192,192,192,192,192,184,176,176,176,176,176,176,176,176,176,null,null,176,176,176,
    /* S2 27-53 the 1,776 stairs (c31-33), a 3-wide gap c40-42 */
    176,176,176,176,160,144,128,128,128,128,128,128,128,null,null,null,128,128,128,128,128,128,128,128,128,128,128,
    /* S3 54-80 up to the look-out terrace (c59-60): THE WIND, taught (c61-80, flat) */
    128,128,128,128,128,112,96,96,96,96,96,96,96,96,96,96,96,96,96,96,96,96,96,96,96,96,96,
    /* S4 81-107 THE GLASS ELEVATOR over the terrace (c84-87), a 3-wide gap c90-92, the glass floor begins (c93) */
    96,96,96,96,96,96,96,96,96,null,null,null,96,96,96,96,96,96,96,96,96,96,96,96,96,96,96,
    /* S5 108-134 THE GLASS FLOOR in the wind: a 4-wide gap c114-117, THE WINDOW LEDGE over a 3-wide gap c126-128 */
    96,96,96,96,96,96,null,null,null,null,96,96,96,96,96,96,96,96,null,null,null,96,96,96,96,96,96,
    /* S6 135-161 a 4-wide gap c140-143, the rest of the glass floor, the checkpoint */
    96,96,96,96,96,null,null,null,null,96,96,96,96,96,96,96,96,96,96,96,96,96,96,96,96,96,96,
    /* S7 162-188 up the last stairs (c162-163) onto THE OUTSIDE LEDGE (wind from c164) */
    80,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,
    /* S8 189-215 the outside ledge: a 4-wide gap c194-197, a 5-wide gap c206-210 */
    64,64,64,64,64,null,null,null,null,64,64,64,64,64,64,64,64,null,null,null,null,null,64,64,64,64,64,
    /* S9 216-242 a 5-wide gap c223-227, the last of the outside ledge, the elevator down (c239-246) */
    64,64,64,64,64,64,64,null,null,null,null,null,64,64,64,64,64,64,64,64,64,64,64,80,96,112,128,
    /* S10 243-269 the bottom of the elevator, THE ROUNDHOUSE ROOF (spring c256, shelf c257-258 row 3), the gift row */
    144,160,176,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [84, 1, 87, 3]   /* S4 THE GLASS ELEVATOR's car, waiting over the terrace (the hidden gift is one of its panels) */
  ],
  tiles: {
    gift: [
      [4, 8],   /* S1 */
      [36, 4],   /* S2 */
      [66, 2],   /* S3 */
      [85, 3, 'gold'],   /* S4 THE GLASS ELEVATOR: the glinting panel (hidden) */
      [100, 2],   /* S4 */
      [110, 2],   /* S5 */
      [148, 2],   /* S6 */
      [170, 0],   /* S7 */
      [200, 0],   /* S8 */
      [233, 0],   /* S9 */
      [262, 8, 'heart'], [264, 8], [266, 8, 'cake']   /* S10 the gift row */
    ],
    brick: [
      [3, 8], [5, 8],   /* S1 */
      [35, 4], [37, 4],   /* S2 */
      [147, 2], [149, 2],   /* S6 */
      [263, 8], [265, 8]   /* S10 */
    ],
    spring: [
      [256, 11]   /* S10 the spring by THE ROUNDHOUSE ROOF (skill secret; no gap after it) */
    ],
    shelf: [
      [126, 3], [127, 3], [128, 3],   /* S5 THE WINDOW LEDGE (visible secret) */
      [257, 3], [258, 3], [259, 3]   /* S10 THE ROUNDHOUSE ROOF (skill secret) */
    ]
  },
  /* tourists, window-cleaning robots and a camera drone inside; gulls and crows outside; raccoons everywhere. Nothing
     waits at a lip. */
  foes: [
    [16, 10, 'mallwalker'],   /* S1 */
    [47, 7, 'raccoon'],   /* S2 */
    [70, 3, 'seagull'],   /* S3 */
    [101, 5, 'robot'],   /* S4 */
    [111, 5, 'mallwalker'], [121, 3, 'camera'],   /* S5 */
    [137, 5, 'raccoon'], [151, 5, 'robot'],   /* S6 */
    [172, 3, 'mallwalker'], [182, 1, 'seagull'],   /* S7 */
    [196, 1, 'seagull'], [201, 3, 'raccoon'], [213, 3, 'raccoon'],   /* S8 */
    [219, 3, 'mallwalker'], [225, 1, 'crow'], [236, 3, 'raccoon'],   /* S9 */
    [252, 11, 'raccoon']   /* S10 */
  ],
  candles: [
    [2, 10], [7, 11], [9, 11], [11, 11], [13, 9], [15, 10], [18, 10], [20, 10], [21, 9], [22, 8], [23, 8], [24, 9], [26, 10],
    [28, 10], [30, 10], [31, 9], [32, 8], [33, 7], [35, 6], [37, 6], [39, 7], [40, 6], [41, 5], [42, 6], [43, 7], [45, 7], [49, 7], [51, 7], [53, 7],
    [55, 7], [57, 7], [59, 6], [60, 5], [62, 5], [64, 5], [66, 4], [68, 5], [72, 5], [74, 5], [76, 5], [78, 5], [80, 5],
    [82, 5], [85, 5], [85, 4], [88, 5], [89, 4], [90, 3], [91, 3], [92, 4], [93, 5], [95, 5], [97, 5], [100, 4], [103, 5], [105, 5], [107, 5],
    [108, 5], [110, 4], [112, 5], [113, 4], [114, 3], [115, 2], [116, 2], [117, 3], [118, 4], [120, 5], [123, 5], [125, 4], [126, 2], [128, 2], [129, 4], [131, 5], [133, 5],
    [135, 5], [139, 4], [140, 3], [141, 2], [142, 2], [143, 3], [144, 4], [146, 5], [148, 4], [151, 4], [153, 5], [155, 5], [158, 5], [160, 5],
    [162, 4], [164, 3], [166, 3], [168, 3], [170, 2], [174, 3], [176, 3], [178, 3], [180, 3], [184, 3], [186, 3], [188, 3],
    [190, 3], [192, 3], [193, 2], [194, 1], [195, 1], [196, 1], [197, 2], [199, 3], [203, 3], [205, 2], [206, 1], [207, 1], [208, 1], [209, 1], [210, 2], [211, 3], [214, 3],
    [216, 3], [218, 3], [221, 3], [222, 2], [223, 1], [224, 1], [225, 1], [226, 1], [227, 2], [228, 3], [230, 3], [233, 2], [236, 3], [238, 3], [239, 3], [240, 4], [241, 5], [242, 6],
    [243, 7], [244, 8], [245, 9], [246, 10], [248, 11], [250, 11], [252, 11], [254, 11], [256, 9], [256, 7], [260, 10], [262, 10], [264, 10], [266, 10], [267, 11]
  ],
  secrets: [
    { kind: 'visible', col: 127, row: 2, prize: 'heart+candles' },   /* THE WINDOW LEDGE: from the glass floor, jump UP onto it over the gap */
    { kind: 'hidden', col: 85, row: 3, prize: 'GOLDEN CANDLE', glint240: true },   /* THE GLASS ELEVATOR: the glinting panel */
    { kind: 'skill', col: 258, row: 2, prize: 'hat' }   /* THE ROUNDHOUSE ROOF: the spring, then steer onto the little roof */
  ],
  goldenCandle: { col: 85, row: 3 },
  checkpoint: { col: 156, row: 5 },
  spawn: { col: 2, row: 11 },
  goal: { col: 268, row: 11 },   /* out the tower's doors, toward the toy store */
  talk: [
    [2, 'DAD', 'The CN Tower! Five hundred and fifty-three metres. The raccoon went all the way UP. Talk about high-jinks!', 4.4],
    [30, 'KINAN', 'One thousand, seven hundred and seventy-six stairs. I am counting every one.', 3.8],
    [61, 'MOM', 'Hold on, sweetie! When you hear the wind coming, hold on tight!', 3.2],
    [94, 'CHENOA', 'The GLASS FLOOR! You can see the whole city under your feet. I am NOT looking down.', 4],
    [157, 'SHAD', 'The raccoon climbed out onto the outside ledge. Outside! On the edge! Of course it did.', 4],
    [237, 'KINAN', 'It jumped into the elevator! Going down!', 2.6],
    [259, 'DAD', "That raccoon is heading for the toy store on the corner. Come on, bud, let's block his path.", 3.6]
  ]
});

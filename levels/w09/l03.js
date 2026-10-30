/* ============================================================
   LEVEL 9-3 · THE METRO
   (World 9 · Montreal · trail stop 3)
   Story bible (World 9 table): "Rubber-tired trains and long
   escalators; Annie's first scanner drones appear." Glitchy dives into
   the Metro. Annie, at the tech conference, has tracked him as rogue
   code and sends her scanner drones down after him. She speaks over
   their speakers: she isn't mean, she's protecting the city's
   computers... and Kinan has to protect the very thing he's chasing.
   Idea (ONE): THE ESCALATORS (opt-in `escalators`, new in World 9: a
     belt on the slope the heights draw). Stand on one and it carries
     you down (or up) the long slope. Act 1 teaches it (the long
     escalator down from the entrance, THE PARKED TRAIN, up to the
     mezzanine and down again); act 2 twists it (THE MÉTRO SIGN over a
     gap on the mezzanine, a fast escalator down, a WRONG-WAY escalator
     that pulls you back while you climb); act 3 tests it (a fast
     escalator down to a 5 gap, THE SECOND TRAIN, up and down to the
     SORTIE).
   Annie's scanner drones (foe 'scanner'): a friendly white drone that
     shines a scan beam to the floor. Walk into the beam and it BEEPs
     and follows Kinan for a while (slower than his walk): keep moving.
     A stomp switches one OFF ("BEEP! OFFLINE"), never more.
   Every escalator ends on a flat landing, never at a lip.
   Acts (thirds): 0-89 teach (E1 down, the parked train 2/2/2, E2 up,
     the first drone and ANNIE, E3 down) · 90-179 twist (3, E4 up, THE
     MÉTRO SIGN 4, E5 fast down, 4, the wrong-way E6, THE HIGH LEDGE,
     E7 fast down) · 180-269 test (5, the second train 3/3/5, E8 up,
     E9 fast down to the SORTIE).
   Secrets: visible = THE MÉTRO SIGN (S5): a little ledge over the
     mezzanine's gap; jump up onto it (heart + candles, 118,4) · hidden
     = THE DEPARTURES BOARD (S4): the board hanging over the platform
     has one glinting panel; jump under it (GOLDEN CANDLE, 86,6; two
     candles point up) · skill = THE HIGH LEDGE (S7): a ledge over the
     upper concourse, one full jump high (hat, 161,3).
   Gaps: act 1 2/2/2 · act 2 3/3/4 · act 3 5/3/3/4. A full-run jump off
     the parked train, the mezzanine, the high ledge or the second
     train comes down on floor (w9-levels.spec.ts checks it).
   Look: the Metro (theme 112, World 9's own look): tiled tunnel walls
     with an orange band, ceiling lights, MÉTRO and SORTIE signs, a
     blue train on rubber tires going by now and then (the parked
     trains are World 7's train cars: white with a blue stripe).
   ENGINE REQUESTS: none.
   ============================================================ */
KinanLevels.register({
  id: '9-3', world: 9, slot: 3, kind: 'level',
  name: 'THE METRO',
  theme: 112,   /* the Metro: tiled tunnels, MÉTRO and SORTIE signs, a rubber-tired train going by */
  cols: 270,
  /* THE ESCALATORS (World 9 twist, opt-in): [c0, c1, speed] — the slope those columns' heights draw carries Kinan,
     speed px a frame (+ right, - left) */
  escalators: [
    [10, 17, 1],   /* E1 S1 the long escalator down from the entrance */
    [61, 68, 1],   /* E2 S3 up to the mezzanine */
    [75, 82, 1],   /* E3 S3-S4 down again */
    [100, 107, 1],   /* E4 S4 up */
    [125, 132, 1.2],   /* E5 S5 a fast one down */
    [151, 158, -0.8],   /* E6 S6 THE WRONG-WAY ESCALATOR: it pulls you back while you climb */
    [169, 176, 1.2],   /* E7 S7 fast, down (four flat tiles before the 5 gap) */
    [231, 238, 1],   /* E8 S9 up */
    [247, 254, 1.2]   /* E9 S10 down to the SORTIE */
  ],
  trainCars: [[34, 51], [198, 218]],   /* the parked trains (World 7's train cars: their roofs are the floor) */
  heights: [
    /* S1 0-26 the entrance (128), E1 down (c10-17) to the platform */
    128,128,128,128,128,128,128,128,128,128,136,144,152,160,168,176,184,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 THE PARKED TRAIN: a 2 gap c32-33, car A (c34-41), the coupling c42-43, car B (c44-51), a 2 gap c52-53 */
    192,192,192,192,192,null,null,160,160,160,160,160,160,160,160,null,null,160,160,160,160,160,160,160,160,null,null,
    /* S3 54-80 the platform, E2 up (c61-68), the mezzanine (c69-74) and the first drone, E3 down (c75-82) */
    192,192,192,192,192,192,192,184,176,168,160,152,144,136,128,128,128,128,128,128,128,136,144,152,160,168,176,
    /* S4 81-107 THE DEPARTURES BOARD (c84-88), a 3 gap c91-93, E4 up (c100-107) */
    184,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,184,176,168,160,152,144,136,128,
    /* S5 108-134 the mezzanine: THE MÉTRO SIGN over a 3 gap c116-118, E5 fast down (c125-132) */
    128,128,128,128,128,128,128,128,null,null,null,128,128,128,128,128,128,136,144,152,160,168,176,184,192,192,192,
    /* S6 135-161 a 4 gap c141-144, THE WRONG-WAY ESCALATOR up (c151-158), the upper concourse */
    192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,184,176,168,160,152,144,136,128,128,128,128,
    /* S7 162-188 the checkpoint, THE HIGH LEDGE (c160-162 row 4), E7 fast down (c169-176), a 5 gap c181-185 */
    128,128,128,128,128,128,128,136,144,152,160,168,176,184,192,192,192,192,192,null,null,null,null,null,192,192,192,
    /* S8 189-215 a 3 gap c195-197, THE SECOND TRAIN: car C (c198-205), the coupling c206-208, car D (c209-218) */
    192,192,192,192,192,192,null,null,null,160,160,160,160,160,160,160,160,null,null,null,160,160,160,160,160,160,160,
    /* S9 216-242 car D's end, a 4 gap c219-222, E8 up (c231-238) */
    160,160,160,null,null,null,null,192,192,192,192,192,192,192,192,184,176,168,160,152,144,136,128,128,128,128,128,
    /* S10 243-269 E9 fast down (c247-254), the gift row, the SORTIE */
    128,128,128,128,136,144,152,160,168,176,184,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [84, 3, 88, 6]   /* S4 THE DEPARTURES BOARD hanging over the platform (the hidden gift is one of its panels) */
  ],
  open: [[20, 13, 22, 13]],   /* SLAM SPOT (butt slam, 2026-10-29): the pocket under the cracked platform boards, solid floor under it */
  tiles: {
    crack: [[20, 12], [21, 12], [22, 12]],   /* SLAM SPOT: cracked platform boards over a pocket of candles (a bonus, never needed) */
    gift: [
      [5, 4],   /* S1 at the entrance */
      [28, 8],   /* S2 */
      [57, 8],   /* S3 */
      [86, 6, 'gold'],   /* S4 THE DEPARTURES BOARD: the glinting panel (hidden) */
      [96, 8],   /* S4 */
      [110, 4],   /* S5 on the mezzanine */
      [138, 8],   /* S6 */
      [165, 4],   /* S7 on the concourse */
      [192, 8],   /* S8 */
      [228, 8],   /* S9 */
      [258, 8, 'heart'], [260, 8, 'cake']   /* S10 the gift row */
    ],
    brick: [
      [4, 4], [6, 4],   /* S1 */
      [137, 8], [139, 8],   /* S6 */
      [227, 8], [229, 8],   /* S9 */
      [259, 8]   /* S10 */
    ],
    shelf: [
      [117, 5], [118, 5],   /* S5 THE MÉTRO SIGN over the gap (visible secret) */
      [160, 4], [161, 4], [162, 4]   /* S7 THE HIGH LEDGE over the concourse (skill secret) */
    ]
  },
  /* Annie's scanner drones (they shine their beam to the floor below them), cleaning robots and hurrying commuters.
     Nothing waits at a lip. */
  foes: [
    [20, 11, 'roomba'],   /* S1 */
    [38, 9, 'mallwalker'],   /* S2 on car A */
    [71, 3, 'scanner'],   /* S3 the first drone, over the mezzanine */
    [86, 11, 'roomba'], [97, 7, 'scanner'],   /* S4 */
    [111, 3, 'scanner'], [122, 3, 'scanner'],   /* S5 over the mezzanine */
    [137, 11, 'mallwalker'], [148, 7, 'scanner'],   /* S6 */
    [166, 3, 'scanner'], [178, 11, 'roomba'], [184, 6, 'scanner'],   /* S7 */
    [191, 11, 'mallwalker'], [201, 5, 'scanner'], [212, 5, 'scanner'],   /* S8 over the second train */
    [227, 11, 'roomba'], [234, 5, 'scanner'], [240, 3, 'scanner'],   /* S9 */
    [250, 5, 'scanner'], [261, 11, 'roomba']   /* S10 */
  ],
  candles: [[20, 13], [21, 13], [22, 13],
    [3, 7], [5, 6], [7, 7], [9, 7], [11, 8], [13, 9], [15, 10], [17, 11], [19, 11], [22, 11], [24, 11], [26, 11],
    [28, 11], [30, 11], [31, 10], [32, 9], [33, 9], [35, 9], [37, 9], [39, 9], [41, 9], [42, 8], [43, 8], [45, 9], [47, 9], [49, 9], [51, 9], [52, 9], [53, 10],
    [55, 11], [57, 11], [59, 11], [61, 10], [63, 9], [65, 8], [67, 7], [69, 7], [71, 7], [73, 7], [75, 7], [77, 8], [79, 9],
    [81, 10], [83, 11], [86, 9], [86, 8], [88, 11], [90, 10], [91, 9], [92, 8], [93, 9], [94, 10], [98, 11], [100, 10], [102, 9], [104, 8], [106, 7],
    [109, 7], [113, 7], [115, 7], [116, 6], [117, 4], [119, 6], [120, 7], [122, 7], [124, 7], [126, 8], [128, 9], [130, 10], [132, 11], [134, 11],
    [136, 11], [140, 10], [141, 9], [142, 8], [143, 8], [144, 9], [145, 10], [147, 11], [149, 11], [151, 10], [153, 9], [155, 8], [157, 7], [159, 7], [160, 3], [162, 3],
    [163, 7], [167, 7], [169, 7], [171, 8], [173, 9], [175, 10], [177, 11], [179, 10], [180, 9], [181, 8], [182, 8], [183, 8], [184, 8], [185, 9], [186, 10], [188, 11],
    [190, 11], [193, 11], [194, 10], [195, 9], [196, 8], [197, 8], [199, 9], [203, 9], [205, 9], [206, 8], [207, 8], [208, 8], [210, 9], [212, 9], [214, 9],
    [216, 9], [218, 9], [219, 8], [220, 7], [221, 7], [222, 7], [223, 8], [224, 9], [226, 11], [231, 10], [233, 9], [235, 8], [237, 7], [239, 7], [241, 7],
    [243, 7], [245, 7], [247, 7], [249, 8], [251, 9], [253, 10], [256, 11], [258, 10], [260, 10], [262, 11], [264, 11], [266, 11]
  ],
  secrets: [
    { kind: 'visible', col: 118, row: 4, prize: 'heart+candles' },   /* THE MÉTRO SIGN: jump up onto the ledge over the gap */
    { kind: 'hidden', col: 86, row: 6, prize: 'GOLDEN CANDLE', glint240: true },   /* THE DEPARTURES BOARD: the glinting panel */
    { kind: 'skill', col: 161, row: 3, prize: 'hat' }   /* THE HIGH LEDGE: one full jump up from the concourse */
  ],
  goldenCandle: { col: 86, row: 6 },
  checkpoint: { col: 164, row: 7 },
  spawn: { col: 2, row: 7 },
  goal: { col: 267, row: 11 },   /* SORTIE: up and out at the foot of Mount Royal */
  talk: [
    [2, 'KINAN', "The Metro! The trains here run on rubber tires. Listen... they're so quiet!", 3.6],
    [8, 'DAD', "A long escalator down to the platform. Stand still and it carries you, bud. It's a step up from walking.", 3.6],
    [29, 'CHENOA', "The train's stopped! Run along the roof, little bro. Mind the gaps!", 3.4],
    [58, 'ANNIE', "This is Annie, at the tech conference. My scanner drones are looking for some ROGUE CODE. Please don't worry!", 4.6],
    [66, 'KINAN', "Annie?! That rogue code is GLITCHY! He's not dangerous, he's my friend!", 3.6],
    [72, 'ANNIE', "Kinan? Rogue code can mix up a whole city's computers. Sorry, I have to catch it. Chalo, drones! (Let's go!)", 5],
    [104, 'MOM', 'If a drone shines its light on you, it follows you for a bit. Keep moving, sweetie!', 3.8],
    [163, 'SHAD', "Annie's really good at this. But Glitchy's fast. Go, little bro!", 3.2],
    [244, 'PASSER-BY', 'Bonjour! The way out? Follow the SORTIE signs!', 3],
    [256, 'KINAN', "There he is! Glitchy's heading up the mountain, to the lookout!", 3.2]
  ]
});

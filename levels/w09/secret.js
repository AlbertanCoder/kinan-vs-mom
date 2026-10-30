/* ============================================================
   SECRET · THE UNDERGROUND CITY  (World 9 · Montreal · trail stop 8)
   Story bible (World 9 table): "Tunnels and shops under downtown. A
   reward level." Through the door in 9-6's launch tube, Kinan comes out
   under downtown, in the Underground City: kilometres of warm tunnels,
   shops, food courts and Metro stations where people walk all winter
   without going outside.
   Idea: A REWARD, and A LONG TUNNEL RUN. Three long tunnels (low roofs
     high enough that no jump ever bumps them) between the open halls (the
     food court, the big atrium, the station), two moving walkways
     (World 8's belts) and candles on nearly every tile: two rows of them
     in the tunnels. Small gaps, few foes, the gift row at the stairs up
     to the street (SORTIE).
   Route: S1 the corridor from the launch tube 2 · S2 TUNNEL 1 (the
     shops) 3, a moving walkway · S3 the food court 3 · S4 TUNNEL 2, the
     checkpoint, 3 · S5 the big atrium 4 · S6 TUNNEL 3, a moving walkway,
     4 · S7 the Metro station 3 · S8 the gift row, the stairs up (SORTIE).
   Gaps: act 1 2/3/3 · act 2 3/4 · act 3 4/3, each with a candle arc. The
     tunnel roofs (rows 3-4) are higher than a full jump goes (it tops out
     at row 6). Nothing waits at a lip; no walkway carries Kinan into a
     gap. Secret slot: exempt from the 3-secrets lint (the whole level is
     the secret). No pet.
   Look: the Underground City (theme 119, World 9's own look): warm tiled
     tunnels, shop windows, the food court, the SORTIE signs.
   ENGINE REQUESTS: a tiled tunnel-roof skin (shop signs on it).
   ============================================================ */
KinanLevels.register({
  id: '9-secret', world: 9, slot: 8, kind: 'secret',
  name: 'THE UNDERGROUND CITY',
  theme: 119,   /* the Underground City: warm tunnels, shop windows, the food court, SORTIE signs */
  cols: 216,
  belts: [[44, 52, 12, 1], [137, 148, 12, 1.2]],   /* the moving walkways (World 8's belts), each ends 3+ tiles before a gap */
  heights: [
    /* S1 0-26 the corridor from the launch tube: a 2 gap c14-15 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 TUNNEL 1 (the shops, roof c27-53): a 3 gap c40-42, a moving walkway (c44-52) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 the food court: a 3 gap c62-64, a gift row */
    192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 TUNNEL 2 (roof c81-107): the checkpoint (c84), a 3 gap c95-97 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 the big atrium: a 4 gap c118-121 */
    192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 TUNNEL 3 (roof c135-161): a moving walkway (c137-148), a 4 gap c152-155 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,
    /* S7 162-188 the Metro station: a 3 gap c170-172 */
    192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S8 189-215 the gift row, the stairs up to the street (SORTIE) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [27, 3, 53, 4],   /* TUNNEL 1's roof */
    [81, 3, 107, 4],   /* TUNNEL 2's roof */
    [135, 3, 161, 4]   /* TUNNEL 3's roof */
  ],
  tiles: {
    gift: [
      [6, 8],   /* S1 */
      [33, 8],   /* S2 */
      [72, 8],   /* S3 */
      [88, 8],   /* S4 */
      [128, 8],   /* S5 */
      [142, 8],   /* S6 */
      [178, 8],   /* S7 */
      [198, 8, 'heart'], [200, 8], [202, 8, 'cake']   /* S8 the gift row */
    ],
    brick: [
      [5, 8], [7, 8],   /* S1 */
      [71, 8], [73, 8],   /* S3 */
      [199, 8], [201, 8]   /* S8 */
    ]
  },
  /* a few shoppers and floor-cleaning robots. Nothing waits at a lip. */
  foes: [
    [20, 11, 'mallwalker'],   /* S1 */
    [70, 11, 'roomba'],   /* S3 */
    [104, 11, 'mallwalker'],   /* S4 */
    [128, 11, 'roomba'],   /* S5 */
    [158, 11, 'mallwalker'],   /* S6 */
    [182, 11, 'roomba']   /* S7 */
  ],
  candles: [
    /* S1 */
    [2, 11], [3, 11], [4, 11], [5, 11], [6, 11], [7, 11], [8, 11], [9, 11], [10, 11], [11, 11], [12, 11],
    [13, 10], [14, 9], [15, 9], [16, 10],
    [17, 11], [18, 11], [19, 11], [20, 11], [21, 11], [22, 11], [23, 11], [24, 11], [25, 11], [26, 11],
    /* S2 TUNNEL 1: two rows */
    [27, 11], [28, 11], [29, 11], [30, 11], [31, 11], [32, 11], [33, 11], [34, 11], [35, 11], [36, 11], [37, 11], [38, 11],
    [28, 9], [30, 9], [32, 9], [34, 9], [36, 9], [38, 9],
    [39, 10], [40, 9], [41, 8], [42, 9], [43, 10],
    [44, 11], [45, 11], [46, 11], [47, 11], [48, 11], [49, 11], [50, 11], [51, 11], [52, 11], [53, 11],
    [45, 9], [47, 9], [49, 9], [51, 9], [53, 9],
    /* S3 the food court */
    [54, 11], [55, 11], [56, 11], [57, 11], [58, 11], [59, 11], [60, 11],
    [61, 10], [62, 9], [63, 8], [64, 9], [65, 10],
    [66, 11], [67, 11], [68, 11], [69, 11], [70, 11], [71, 11], [72, 11], [73, 11], [74, 11], [75, 11], [76, 11], [77, 11], [78, 11], [79, 11], [80, 11],
    /* S4 TUNNEL 2: two rows */
    [81, 11], [82, 11], [83, 11], [84, 11], [85, 11], [86, 11], [87, 11], [88, 11], [89, 11], [90, 11], [91, 11], [92, 11], [93, 11],
    [82, 9], [84, 9], [86, 9], [88, 9], [90, 9], [92, 9],
    [94, 10], [95, 9], [96, 8], [97, 9], [98, 10],
    [99, 11], [100, 11], [101, 11], [102, 11], [103, 11], [104, 11], [105, 11], [106, 11], [107, 11],
    [100, 9], [102, 9], [104, 9], [106, 9],
    /* S5 the big atrium */
    [108, 11], [109, 11], [110, 11], [111, 11], [112, 11], [113, 11], [114, 11], [115, 11], [116, 11],
    [117, 10], [118, 9], [119, 8], [120, 8], [121, 9], [122, 10],
    [123, 11], [124, 11], [125, 11], [126, 11], [127, 11], [128, 11], [129, 11], [130, 11], [131, 11], [132, 11], [133, 11], [134, 11],
    /* S6 TUNNEL 3: two rows */
    [135, 11], [136, 11], [137, 11], [138, 11], [139, 11], [140, 11], [141, 11], [142, 11], [143, 11], [144, 11], [145, 11], [146, 11], [147, 11], [148, 11], [149, 11], [150, 11],
    [136, 9], [138, 9], [140, 9], [142, 9], [144, 9], [146, 9], [148, 9], [150, 9],
    [151, 10], [152, 9], [153, 8], [154, 8], [155, 9], [156, 10],
    [157, 11], [158, 11], [159, 11], [160, 11], [161, 11],
    /* S7 the Metro station */
    [162, 11], [163, 11], [164, 11], [165, 11], [166, 11], [167, 11], [168, 11],
    [169, 10], [170, 9], [171, 8], [172, 9], [173, 10],
    [174, 11], [175, 11], [176, 11], [177, 11], [178, 11], [179, 11], [180, 11], [181, 11], [182, 11], [183, 11], [184, 11], [185, 11], [186, 11], [187, 11], [188, 11],
    /* S8 the gift row, the stairs up */
    [189, 11], [190, 11], [191, 11], [192, 11], [193, 11], [194, 11], [195, 11], [196, 11], [198, 11], [200, 11], [202, 11],
    [204, 11], [205, 11], [206, 11], [207, 11], [208, 11], [209, 11]
  ],
  checkpoint: { col: 84, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 211, row: 11 },   /* the stairs up to the street (SORTIE) */
  talk: [
    [2, 'KINAN', 'Whoa! The launch tube came out UNDER the city! Tunnels and shops everywhere!', 3.6],
    [28, 'CHENOA', "It's the Underground City, little bro. A whole downtown under the snow. And candles in every shop!", 4],
    [66, 'PASSER-BY', 'Bonjour! In winter we walk everywhere down here. Bon appétit!', 3.2],
    [109, 'DAD', "Look at that atrium, bud, the sky right through the glass. A whole city underground? I've been digging the wrong holes.", 4.6],
    [190, 'MOM', "Sweetie, that's the SORTIE. The way out. Fill your pockets first!", 3.4]
  ]
});

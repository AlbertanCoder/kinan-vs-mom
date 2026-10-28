/* ============================================================
   SECRET · THE BOW RIVER FLOAT  (World 5 · Calgary Stampede · trail stop 8)
   Story bible (World 5 table): "Tubing down the river through the
   city." Reached by 5-6's secret exit: the lava tube under the zoo's
   volcano comes out on the bank of the Bow, right where a pile of inner
   tubes is waiting. It's the hottest day of the Stampede and half of
   Calgary is floating the river. Kinan grabs a tube and goes with the
   current, east, right through downtown.
   A REWARD level: short, candle-rich, four slow foes, soft gaps.
   Idea: WITH THE CURRENT. The river steps DOWN all the way: every weir
     is a slope you slide down (it starts high at the put-in and ends low
     at the take-out). Tubes float in the pools (run across them, hop the
     water between), the rapids and the river-surf wave are springboards
     flush in the water that toss you over the rocks, and the bridges
     pass overhead with gift boxes in their decks.
   Route: S1 the put-in dock (an UMBRELLA), the first weir, a pool of
     tubes, the second weir · S2 THE RAPIDS (a springboard over the
     rocks), the third weir · S3 a pool of tubes, under THE PEACE BRIDGE,
     checkpoint, more tubes · S4 the lazy pool (a BOWL), under THE CENTRE
     STREET BRIDGE (bump its deck for a heart) · S5 THE SURF WAVE: two
     springboards over two pools · S6 the last pool of tubes, East Village
     · S7 the take-out beach at Inglewood: a gift row, a candle shower.
   Gaps: 3 (tubes) · 3/4 (tubes) · 3/4 (the wave) · 5 (tubes, hop tube to
     tube). Nothing here is a test.
   Secret slot: exempt from the 3-secrets lint (docs/LEVEL-AUTHORING.md
     §5.5). The level itself is the reward.
   Look: borrows the River Valley Trails (theme 28): a river at sunset,
     trees on the banks: the Bow on a summer evening.
   ENGINE REQUESTS: river water drawn in the pits and over the low ground
     (a water skin and a flowing-current flag that carries Kinan right) ·
     an inner-tube skin for the shelves on the water and a wave skin for
     the springboards · the Centre Street Bridge's lions on its deck ·
     tubers floating by in the background · bubbles ER-4 (c2 "TUBES! On
     the BOW!" · c30 Shad: "Rapids! Hold on to your hat!" · c74 Chenoa:
     "We're under the Peace Bridge! We were up THERE today." · c112
     "The river has a WAVE? In Calgary?" · c184 Robin: "Out you get, sun's
     going down. Fireworks soon!").
  
   ============================================================ */
KinanLevels.register({
  id: '5-secret', world: 5, slot: 8, kind: 'secret',
  name: 'THE BOW RIVER FLOAT',
  theme: 28,              /* borrows the River Valley Trails: a river at sunset, trees on the banks */
  cols: 189,
  heights: [
    /* S1 0-26 the put-in dock (c0-6) · the first weir (c7-8) · a pool of tubes c14-16 · the second weir (c21-22) */
    96,96,96,96,96,96,96,112,128,128,128,128,128,128,null,null,null,128,128,128,128,144,160,160,160,160,160,
    /* S2 27-53 THE RAPIDS: the springboard (c30) over the rocks · the third weir (c44-45) */
    160,160,160,null,160,160,160,160,160,160,160,160,160,160,160,160,160,176,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 a pool of tubes c58-60 · a pool c66-69 · under THE PEACE BRIDGE (c72-79) · checkpoint */
    192,192,192,192,null,null,null,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 the lazy pool (a BOWL c84-95) · under THE CENTRE STREET BRIDGE (c96-104) */
    192,192,192,200,208,208,208,208,208,208,208,208,208,200,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 THE SURF WAVE: springboard c112, a pool c114-116, springboard c122, a pool c124-127 */
    192,192,192,192,null,192,null,null,null,192,192,192,192,192,null,192,null,null,null,null,192,192,192,192,192,192,192,
    /* S6 135-161 the last pool of tubes c140-144 · East Village */
    192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 the take-out beach at Inglewood: a gift row, a candle shower */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [34, 9, 34, 9], [37, 9, 37, 9], [40, 9, 40, 9],   /* S2 the rocks in the rapids */
    [72, 4, 79, 4],   /* S3 THE PEACE BRIDGE high overhead */
    [96, 7, 104, 7]   /* S4 THE CENTRE STREET BRIDGE's deck (gift boxes in it) */
  ],
  tiles: {
    gift: [
      [3, 2, 'umbrella'],   /* S1 the UMBRELLA at the dock */
      [49, 8, 'lasso'],   /* S2 the LASSO (candles fly to you) */
      [98, 7], [100, 7, 'heart'], [102, 7],   /* S4 in THE CENTRE STREET BRIDGE's deck */
      [119, 8, 'cake'],   /* S5 */
      [168, 8], [170, 8, 'heart'], [172, 8], [174, 8]   /* S7 the take-out gift row */
    ],
    brick: [
      [167, 8], [169, 8], [171, 8], [173, 8], [175, 8]   /* S7 */
    ],
    spring: [
      [30, 10], [112, 12], [122, 12]   /* THE RAPIDS and THE SURF WAVE: springboards flush in the water */
    ],
    shelf: [
      [14, 8], [15, 8], [16, 8],   /* S1 tubes in the first pool */
      [58, 12], [59, 12], [60, 12], [66, 12], [67, 12], [69, 12],   /* S3 tubes in the pools (hop the open water at c68) */
      [140, 12], [142, 12], [144, 12]   /* S6 tubes in the last pool (hop tube to tube) */
    ]
  },
  /* four slow ones: a jumping fish in the lazy pool, a puddle frog, two geese */
  foes: [
    [62, 4, 'goose'],
    [89, 12, 'flyingfish'],   /* the lazy pool */
    [131, 11, 'puddlefrog'],
    [152, 4, 'goose']
  ],
  candles: [
    [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [3, 1], [7, 5], [8, 6], [9, 7], [10, 7], [11, 7], [12, 7], [13, 7],
    [14, 7], [15, 7], [16, 7], [17, 7], [18, 7], [19, 7], [20, 7], [21, 8], [22, 9], [23, 9], [24, 9], [25, 9], [26, 9], [27, 9],
    [28, 9], [29, 9], [30, 8], [30, 6], [31, 4], [32, 3], [33, 2], [34, 2], [35, 2], [36, 3], [37, 4], [38, 5], [39, 6], [34, 8],
    [37, 8], [40, 8], [41, 9], [42, 9], [43, 9], [44, 10], [45, 11], [46, 11], [47, 11], [48, 11], [49, 11], [50, 11], [51, 11], [52, 11],
    [53, 11], [49, 7], [55, 11], [56, 11], [57, 11], [58, 11], [59, 11], [60, 11], [59, 8], [61, 11], [62, 11], [63, 11], [64, 11], [65, 11],
    [66, 9], [67, 8], [68, 8], [69, 9], [70, 11], [71, 11], [72, 11], [73, 11], [74, 11], [75, 11], [76, 11], [77, 11], [78, 11], [79, 11],
    [80, 11], [72, 3], [73, 3], [74, 3], [75, 3], [76, 3], [77, 3], [78, 3], [79, 3], [81, 11], [82, 11], [83, 11], [84, 11], [85, 12],
    [86, 12], [87, 12], [88, 12], [89, 12], [90, 12], [91, 12], [92, 12], [93, 12], [87, 9], [88, 8], [89, 8], [90, 8], [91, 9], [94, 12],
    [95, 11], [96, 11], [97, 11], [98, 11], [99, 11], [100, 11], [101, 11], [102, 11], [103, 11], [104, 11], [105, 11], [106, 11], [107, 11], [98, 6],
    [100, 6], [102, 6], [108, 11], [109, 11], [110, 11], [111, 11], [112, 10], [112, 8], [113, 6], [114, 5], [115, 4], [116, 4], [117, 5], [118, 7],
    [119, 7], [120, 11], [121, 11], [122, 10], [122, 8], [123, 6], [124, 5], [125, 4], [126, 4], [127, 5], [128, 7], [129, 11], [130, 11], [131, 11],
    [132, 11], [133, 11], [134, 11], [135, 11], [136, 11], [137, 11], [138, 11], [139, 11], [140, 11], [141, 9], [142, 11], [143, 9], [144, 11], [145, 11],
    [146, 11], [147, 11], [148, 11], [149, 11], [150, 11], [151, 11], [152, 11], [153, 11], [154, 11], [155, 11], [156, 11], [157, 11], [158, 11], [159, 11],
    [160, 11], [161, 11], [150, 8], [151, 7], [152, 7], [153, 8], [162, 11], [163, 11], [164, 11], [165, 11], [166, 11], [168, 7], [170, 7], [172, 7],
    [174, 7], [176, 11], [177, 11], [178, 11], [179, 11], [180, 11], [181, 11], [182, 11], [183, 11], [177, 8], [178, 6], [179, 5], [180, 5], [181, 6],
    [182, 8]
  ],
  checkpoint: { col: 72, row: 11 },
  spawn: { col: 2, row: 5 },
  goal: { col: 184, row: 11 }   /* the take-out beach */
});

/* ============================================================
   SECRET · THE HIDDEN FOSSIL CAVE  (World 6 · Drumheller · trail stop 9)
   Story bible (World 6 table): "A cave full of glowing fossils."
   Reached by 6-7's secret exit: the door in the bottom of THE CANYON
   CRACK opens onto a cave nobody has found before. Its walls are full of
   ammonite shells, the spiral fossils whose shells turn into ammolite,
   Alberta's rainbow gemstone, and down here they GLOW: red, green,
   blue. It's quiet and warm and there are candles everywhere.
   A REWARD level: short, candle-rich, four slow foes, soft gaps.
   Idea: BOUNCE AND BREAK. Springboards flush in the cave floor throw
     Kinan up into ceilings of glowing ammolite (bricks: every one
     breaks into candles), a giant fossil ribcage is a jungle gym of
     ledges, and a long candle slide runs down to the way out.
   Route: S1 the crack opens into the cave: down the slope from the
     ledge · S2 THE AMMONITE SPRINGS: three springboards under three
     glowing ceilings · S3 the glowing stream (3 and 4 wide, wide banks)
     · S4 THE GIANT RIBCAGE, checkpoint · S5 the ammolite bridge (bricks
     over a pit, stand on them) and a springboard to a candle ledge · S6
     THE CANDLE SLIDE · S7 daylight: the gift row, a 3-wide gap, the way
     out.
   Gaps: 1 (the springboards) · 3/4 (the stream) · 4 under the brick
     bridge · 3. Nothing here is a test.
   Secret slot: exempt from the 3-secrets lint (docs/LEVEL-AUTHORING.md
     §5.5). The level itself is the reward.
   Look: borrows the Depth Drop Caverns (theme 78): a purple cave with
     glowing green lights.
   ENGINE REQUESTS: a glowing-ammolite skin for the bricks (rainbow
     shells that light the cave) and a fossil-rib skin for the shelves ·
     glowing ammonite spirals on the cave walls · bubbles ER-4 (c2 Kinan:
     "Whoa. The rocks are GLOWING." · c31 "Springboard! Into the
     ceiling!" · c84 checkpoint, Chenoa on the walkie-talkie: "Kinan?
     Where ARE you?" · c150 "Wheeeee!" · c182 "Back to the canyon. Best
     secret EVER.").
   ============================================================ */
KinanLevels.register({
  id: '6-secret', world: 6, slot: 9, kind: 'secret',
  name: 'THE HIDDEN FOSSIL CAVE',
  theme: 78,   /* borrows the Depth Drop Caverns: a purple cave with glowing green lights */
  cols: 189,
  heights: [
    /* S1 0-26 the crack opens into the cave: the ledge, down the slope (c5-10), the cave floor */
    96,96,96,96,96,112,128,144,160,176,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 THE AMMONITE SPRINGS: springboards flush in the floor (c31, c38, c45) under glowing ceilings */
    192,192,192,192,null,192,192,192,192,192,192,null,192,192,192,192,192,192,null,192,192,192,192,192,192,192,192,
    /* S3 54-80 the glowing stream: a 3-wide c59-61 and a 4-wide c68-71, wide banks */
    192,192,192,192,192,null,null,null,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 THE GIANT RIBCAGE: a jungle gym of fossil ribs (c88-98) · the checkpoint */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 the ammolite bridge over a 4-wide pit (c114-117) · a springboard (c124) to the candle ledge */
    192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,null,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 THE CANDLE SLIDE: up the cave wall (c137-140), then a long slide down (c144-151) */
    192,192,176,160,144,128,128,128,128,136,144,152,160,168,176,184,192,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 daylight: a 3-wide gap c168-170, the gift row, the way out */
    192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [88, 10, 88, 11],  /* S4 the ribcage's first rib, planted in the floor */
    [101, 9, 107, 9], [101, 7, 104, 7], [101, 8, 101, 8],   /* taekwondo (2026-10-28): two rock shelves in the cave wall */
    [154, 9, 160, 9], [154, 7, 157, 7], [154, 8, 154, 8]    /* (walk under them); each board door faces right */
  ],
  tiles: {
    gift: [
      [3, 2, 'popper'],   /* S1 */
      [31, 5, 'heart'],   /* S2 a gift in each glowing ceiling */
      [38, 5, 'cake'], [45, 5, 'hat'],   /* S2 */
      [93, 1, 'heart'],   /* S4 */
      [126, 5, 'umbrella'],   /* S5 */
      [174, 8],   /* S7 the gift row */
      [176, 8, 'cake'], [178, 8], [180, 8, 'heart']   /* S7 */
    ],
    brick: [
      [2, 2], [4, 2],   /* S1 */
      [30, 5],   /* S2 THE AMMONITE SPRINGS: the glowing ceilings */
      [30, 4], [31, 4], [32, 5], [32, 4], [37, 5], [37, 4],
      [38, 4], [39, 5], [39, 4], [44, 5], [44, 4], [45, 4],
      [46, 5], [46, 4],   /* S2 */
      [114, 12],   /* S5 the ammolite bridge: stand on it */
      [115, 12], [116, 12], [117, 12],   /* S5 */
      [175, 8], [177, 8], [179, 8]   /* S7 */
    ],
    spring: [
      [31, 12],   /* S2 the springboards, flush in the cave floor */
      [38, 12], [45, 12],   /* S2 */
      [124, 12]   /* S5 the springboard to the candle ledge */
    ],
    shelf: [
      [89, 9],   /* S4 THE GIANT RIBCAGE: its ribs */
      [89, 6], [90, 9], [91, 9], [91, 6], [92, 6], [92, 3],
      [93, 6], [93, 3], [94, 9], [94, 6], [94, 3], [95, 9],
      [96, 9], [97, 6],   /* S4 */
      [121, 3],   /* S5 the candle ledge */
      [122, 3], [123, 3], [125, 3], [126, 3], [127, 3]   /* S5 */
    ],
    board: [[104, 8], [157, 8]]   /* BONUS: hop onto a rock shelf from the right and KICK its board: 2 candles inside each */
  },
  /* four slow cave slugs and mud blobs, and one sleepy baby dino; nothing waits at a lip */
  foes: [
    [21, 11, 'slug'],   /* S1 */
    [76, 11, 'slug'],   /* S3 */
    [103, 11, 'mud'],   /* S4 */
    [156, 11, 'babydino']   /* S6 */
  ],
  candles: [
    [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10], [11, 11], [12, 11], [13, 11], [14, 11],
    [15, 11], [16, 11], [17, 11], [18, 11], [19, 11], [20, 11], [21, 11], [22, 11], [23, 11], [24, 11], [25, 11], [26, 11], [12, 8], [14, 8],
    [16, 8], [18, 8], [20, 8], [22, 8], [24, 8], [27, 11], [28, 11], [29, 11], [30, 3], [31, 3], [32, 3], [33, 11], [34, 11], [35, 11],
    [36, 11], [37, 3], [38, 3], [39, 3], [40, 11], [41, 11], [42, 11], [43, 11], [44, 3], [45, 3], [46, 3], [47, 11], [48, 11], [49, 11],
    [50, 11], [51, 11], [52, 11], [53, 11], [31, 9], [31, 7], [38, 9], [38, 7], [45, 9], [45, 7], [54, 11], [55, 11], [56, 11], [57, 11],
    [58, 11], [59, 9], [60, 8], [61, 8], [62, 9], [63, 11], [64, 11], [65, 11], [66, 11], [67, 11], [68, 9], [69, 8], [70, 8], [71, 8],
    [72, 9], [73, 11], [74, 11], [75, 11], [76, 11], [77, 11], [78, 11], [79, 11], [80, 11], [81, 11], [82, 11], [83, 11], [84, 11], [85, 11],
    [86, 11], [87, 11], [89, 8], [91, 8], [93, 8], [95, 8], [97, 8], [89, 5], [91, 5], [93, 5], [95, 5], [97, 5], [90, 2], [92, 2],
    [94, 2], [96, 2], [99, 11], [100, 11], [101, 11], [102, 11], [103, 11], [104, 11], [105, 11], [106, 11], [107, 11], [108, 11], [109, 11], [110, 11],
    [111, 11], [112, 11], [113, 11], [114, 11], [115, 11], [116, 11], [117, 11], [118, 11], [119, 11], [120, 11], [121, 11], [122, 11], [123, 11], [124, 9],
    [124, 7], [124, 5], [122, 2], [123, 2], [124, 2], [125, 2], [126, 2], [127, 2], [125, 11], [126, 11], [127, 11], [128, 11], [129, 11], [130, 11],
    [131, 11], [132, 11], [133, 11], [134, 11], [135, 11], [136, 11], [137, 10], [138, 9], [139, 8], [140, 7], [141, 7], [142, 7], [143, 7], [144, 7],
    [145, 7], [146, 8], [147, 8], [148, 8], [149, 8], [150, 8], [151, 8], [152, 11], [153, 11], [154, 11], [155, 11], [156, 11], [157, 11], [158, 11],
    [159, 11], [160, 11], [161, 11], [162, 11], [163, 11], [164, 11], [165, 11], [166, 11], [167, 11], [168, 9], [169, 8], [170, 8], [171, 9], [172, 11],
    [174, 7], [176, 7], [178, 7], [180, 7], [173, 11], [174, 11], [175, 11], [176, 11], [177, 11], [178, 11], [179, 11], [180, 11], [181, 11], [182, 11],
    [183, 11], [184, 11], [185, 11], [186, 11], [187, 11],
    [102, 8], [103, 8], [155, 8], [156, 8]   /* behind the rock shelves' boards */
  ],
  checkpoint: { col: 84, row: 11 },
  spawn: { col: 2, row: 5 },
  goal: { col: 184, row: 11 }   /* up through the crack into the canyon sunshine */
});

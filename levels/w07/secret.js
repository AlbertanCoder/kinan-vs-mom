/* ============================================================
   SECRET · SEA-TO-SKY AND THE CHIEF  (World 7 · Vancouver · trail stop 7)
   Story bible (World 7 table): "Up Howe Sound to Shannon Falls and the
   Stawamus Chief. A reward level." Through the trail door under the
   low gondola cabin on Grouse Mountain, an old trail comes out on the
   Sea-to-Sky Highway: the ocean on one side, the mountains on the
   other, all the way up Howe Sound to Shannon Falls and the giant
   granite dome of the Stawamus Chief. Kinan climbs the Chief for the
   best view in the world.
   Idea: A REWARD. Candles everywhere, small gaps, few foes, and two
     climbs that are pure fun: up the wet ledges beside SHANNON FALLS
     (a waterfall of candles), and up the two granite steps of THE
     CHIEF to its long flat top, high over everything.
   Route: S1 Horseshoe Bay 2 · S2 the highway along the cliffs (a
     tunnel) 3 · S3 the islands of Howe Sound 3/3/3 · S4 SHANNON FALLS
     and the checkpoint · S5 the Chief trail (steep steps) 4/4 · S6 THE
     CHIEF: two granite steps up, three tiles each · S7 the long flat
     top, two steps down the far side and a long run-out (a running jump
     off the last step still lands on ground), 5 · S8 the viewpoint, 4,
     the gift row.
   Gaps: act 1 2/3/3/3 · act 2 3/4/4 · act 3 5/4, each with a candle
     arc. Secret slot: exempt from the 3-secrets lint (the whole level
     is the secret). No pet.
   Look: borrows the Mountain Highway (theme 41): misty mountains, the
     winding highway with its tunnel, rain.
   ENGINE REQUESTS: a granite skin for the Chief's steps (grey rock with
     dark streaks) and a waterfall drawn over Shannon Falls' candle
     column · the ocean along the bottom of the Howe Sound gaps · an
     eagle flying past the top of the Chief (decoration).
   ============================================================ */
KinanLevels.register({
  id: '7-secret', world: 7, slot: 7, kind: 'secret',
  name: 'SEA-TO-SKY AND THE CHIEF',
  theme: 41,   /* the Mountain Highway: misty mountains, the winding highway, rain */
  cols: 216,
  heights: [
    /* S1 0-26 Horseshoe Bay: a 2-wide gap c10-11 */
    192,192,192,192,192,192,192,192,192,192,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 the highway along the cliffs: up (c31-34), a tunnel (c36-43), a 3-wide gap c45-47 */
    192,192,192,192,184,176,168,160,160,160,160,160,160,160,160,160,160,160,null,null,null,160,160,160,160,160,160,
    /* S3 54-80 the islands of Howe Sound: 3-wide gaps c58-60, c65-67, c72-74 */
    160,160,160,160,null,null,null,160,160,160,160,null,null,null,160,160,160,160,null,null,null,160,160,160,160,160,160,
    /* S4 81-107 SHANNON FALLS: down to the pool (c87-88), the wet ledges up beside the falls, back up (c99-100) · the checkpoint */
    160,160,160,160,160,160,168,176,176,176,176,176,176,176,176,176,176,176,168,160,160,160,160,160,160,160,160,
    /* S5 108-134 the Chief trail: a 4-wide gap c112-115, steep steps (c120-121), a 4-wide gap c127-130 */
    160,160,160,160,null,null,null,null,160,160,160,160,144,128,128,128,128,128,128,null,null,null,null,128,128,128,128,
    /* S6 135-161 THE CHIEF: two granite steps up (c140, c147), three tiles each */
    128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,
    /* S7 162-188 the top of the Chief, down the far side (c171, c177), a long run-out (a running jump off the step lands on it with room to spare) */
    128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,
    /* S8 189-215 the viewpoint: a 5-wide gap c189-193, a 4-wide gap c199-202, the gift row, the way home */
    null,null,null,null,null,128,128,128,128,128,null,null,null,null,128,128,128,128,128,128,128,128,128,128,128,128,128
  ],
  skins: [['granite', 140, 5, 161, 7], ['granite', 147, 2, 161, 4], ['granite', 162, 2, 170, 7], ['granite', 171, 5, 176, 7]],   /* the Chief's granite (looks only, 2026-10-28) */
  solid: [
    [36, 3, 43, 5],   /* S2 the highway tunnel (4 tiles of air under it) */
    [140, 5, 161, 7],   /* S6 THE CHIEF: the first granite step */
    [147, 2, 161, 4],   /* S6 the second step: the top */
    [162, 2, 170, 7],   /* S7 the long flat top of the Chief */
    [171, 5, 176, 7],  /* S7 a step down the far side */
    [180, 5, 186, 5], [180, 3, 183, 3], [180, 4, 180, 4]   /* taekwondo (2026-10-28): a granite shelf over the run-out (walk under it); its board door faces right */
  ],
  tiles: {
    gift: [
      [4, 8, 'popper'], [16, 8, 'cake'], [22, 8],   /* S1 */
      [29, 8], [50, 6, 'umbrella'],   /* S2 */
      [78, 6],   /* S3 */
      [103, 6],   /* S4 */
      [123, 4],   /* S5 */
      [137, 4],   /* S6 */
      [178, 4],   /* S7 */
      [205, 4, 'heart'], [207, 4], [209, 4, 'cake']   /* S8 the gift row */
    ],
    brick: [
      [15, 8], [17, 8],   /* S1 */
      [206, 4], [208, 4]   /* S8 */
    ],
    shelf: [
      [91, 8], [92, 8], [94, 5], [95, 5], [97, 2], [98, 2]   /* S4 the wet ledges beside Shannon Falls */
    ],
    board: [[183, 4]]   /* BONUS: hop onto the granite shelf from the right and KICK the board: 2 candles inside */
  },
  /* a reward: only a few foes */
  foes: [
    [20, 7, 'seagull'],   /* S1 */
    [40, 9, 'raccoon'],   /* S2 in the tunnel */
    [62, 9, 'puddlefrog'],   /* S3 */
    [124, 7, 'squirrel'],   /* S5 */
    [191, 5, 'crow'],   /* S8 over the gap */
    [196, 7, 'raccoon']   /* S8 */
  ],
  candles: [
    [1, 11], [2, 11], [3, 11], [5, 11], [6, 11], [7, 11], [8, 11], [9, 10], [10, 9], [11, 9], [12, 10], [13, 11], [14, 11], [15, 7],
    [16, 7], [17, 7], [18, 11], [19, 11], [21, 11], [23, 11], [24, 11], [25, 11], [26, 11], [27, 11], [28, 11], [30, 11], [31, 10], [32, 10],
    [33, 9], [34, 9], [35, 9], [36, 9], [37, 9], [38, 9], [39, 9], [41, 9], [42, 9], [43, 9], [44, 9], [45, 8], [46, 7], [47, 8],
    [48, 9], [49, 9], [51, 9], [52, 9], [53, 9], [54, 9], [55, 9], [56, 9], [57, 8], [58, 7], [59, 6], [60, 7], [61, 8], [63, 9],
    [64, 8], [65, 7], [66, 6], [67, 7], [68, 8], [69, 9], [70, 9], [71, 8], [72, 7], [73, 6], [74, 7], [75, 8], [76, 9], [77, 9],
    [79, 9], [80, 9], [81, 9], [82, 9], [83, 9], [85, 9], [86, 9], [87, 10], [88, 10], [89, 10], [90, 10], [91, 7], [92, 7], [93, 10],
    [94, 4], [95, 4], [96, 3], [96, 4], [96, 5], [96, 6], [96, 7], [96, 8], [96, 9], [96, 10], [97, 1], [98, 1], [99, 10], [100, 9],
    [101, 9], [102, 9], [104, 9], [105, 9], [106, 9], [107, 9], [108, 9], [109, 9], [110, 9], [111, 8], [112, 7], [113, 6], [114, 6], [115, 7],
    [116, 8], [117, 9], [118, 9], [119, 9], [120, 8], [121, 7], [122, 7], [125, 7], [126, 6], [127, 5], [128, 4], [129, 4], [130, 5], [131, 6],
    [132, 7], [133, 7], [134, 7], [135, 7], [136, 7], [138, 7], [139, 6], [140, 4], [141, 4], [142, 4], [144, 4], [145, 4], [146, 3], [147, 1],
    [148, 1], [149, 1], [150, 1], [151, 1], [152, 1], [153, 1], [154, 1], [155, 1], [156, 1], [157, 1], [158, 1], [159, 1], [160, 1], [161, 1],
    [162, 1], [163, 1], [164, 0], [165, 0], [166, 0], [167, 0], [168, 1], [169, 1], [170, 1], [171, 4], [172, 4], [173, 4], [174, 4], [175, 4],
    [176, 4], [177, 7], [179, 7], [180, 7], [181, 7], [182, 7], [183, 7], [184, 7], [185, 7], [186, 7], [187, 7], [188, 6], [189, 5], [190, 4],
    [191, 4], [192, 4], [193, 5], [194, 6], [195, 7], [196, 7], [197, 7], [198, 6], [199, 5], [200, 4], [201, 4], [202, 5], [203, 6], [204, 7], [205, 3],
    [207, 3], [209, 3], [210, 7], [211, 7], [214, 7],
    [181, 4], [182, 4]   /* behind the granite shelf's board */
  ],
  checkpoint: { col: 84, row: 9 },
  spawn: { col: 2, row: 11 },
  goal: { col: 212, row: 7 },   /* the viewpoint: back down to the city */
  /* story bubbles as Kinan passes a column: [col, who, what they say, seconds] (subtitles only) */
  talk: [
    [2, 'DAD', 'The Sea-to-Sky Highway! Ocean on one side, mountains on the other. Talk about a sea-nic route!', 3.6],
    [54, 'CHENOA', 'Howe Sound! Look at all the little islands.', 3],
    [82, 'MOM', 'Shannon Falls! Climb up beside the water, sweetie, and catch the candles in the spray.', 4.2],
    [133, 'SHAD', "That giant rock is the Stawamus Chief. Climbers come from all over the world. Let's go UP.", 4.4],
    [163, 'KINAN', 'I can see EVERYTHING from up here. The ocean, the islands... and that little rain cloud, all by itself.', 5],
    [190, 'DAD', "Back down the mountain, bud. Let's find Glitchy in the city. I'm all peaked out anyway.", 3.4]
  ]
});

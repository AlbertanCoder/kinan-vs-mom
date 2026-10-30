/* ============================================================
   LEVEL 9-4 · MOUNT ROYAL LOOKOUT
   (World 9 · Montreal · trail stop 4)
   Story bible (World 9 table): "Climb the mountain to the lookout over
   the city." Out of the Metro, Glitchy heads up Mount Royal, the
   mountain in the middle of the city, where Annie's drones can't see
   him under the trees. Kinan climbs after him, up the trails, the rock
   stairs and the long wooden stairs, to the lookout and its chalet
   with the whole city below.
   Idea (ONE): THE CLIMB. The level starts at the foot of the mountain
     (the floor at row 13) and ends at the lookout eight tiles higher
     (row 5): trails (2:1 slopes), the wooden stairs (1:1 slopes) and
     ROCK STAIRS (ledges two tiles apart: jump up one, then the next).
     Near the top THE WIND gusts (World 7's wind: warned for a second,
     then it pushes Kinan back, never off a ledge he stands on). Act 1
     teaches the climb (the trail, THE SUMMIT ROCK's stairs, the
     wooden stairs); act 2 twists it (down to Beaver Lake, the big rock
     stairs up to the windy plateau: the wind is taught there, no gap);
     act 3 tests it (THE WINDY RIDGE: 5/3/5 gaps in the wind, up to the
     lookout).
   The big cross on the mountain is NOT drawn (kept neutral: the
     lookout chalet and the city view only).
   Acts (thirds): 0-89 teach (the foot, the trail 3/2, THE SUMMIT ROCK,
     3) · 90-179 twist (the wooden stairs, 4, down to Beaver Lake, THE
     OLD OAK, the stone shelter, 4, the checkpoint, the big rock stairs,
     3, the windy plateau, 4) · 180-269 test (THE WINDY RIDGE 5/3/5, up
     to the lookout, THE TELESCOPE PLATFORM, the chalet).
   Secrets: visible = THE SUMMIT ROCK (S3): over the top of the rock
     stairs, one more jump up (heart + candles, 64,2) · hidden = THE OLD
     OAK (S5): the big oak by Beaver Lake has one glinting branch; jump
     under it (GOLDEN CANDLE, 126,6; two candles point up) · skill =
     THE TELESCOPE PLATFORM (S10): bounce off the spring and steer
     onto the platform at the very top of the sky (hat, 251,0).
   Board (taekwondo, a bonus spot): the stone shelter by Beaver Lake
     (S5): hop onto its ledge from the right and KICK the board: 2
     candles inside. Never on the main path.
   Gaps: act 1 3/2/3 · act 2 4/4/3/4 · act 3 5/3/5. Nothing waits at a
     lip. A full-run jump off the summit rock, the wooden-stairs
     plateau, the big rock stairs, the windy ridge or the telescope
     platform comes down on floor (w9-levels.spec.ts checks it).
   Look: Mount Royal Lookout (theme 113, World 9's own look): downtown
     and the St. Lawrence far below, autumn maples on the mountain, the
     stone lookout chalet with its big brown roof.
   ENGINE REQUESTS: a wooden-stairs skin for the 1:1 trail slopes.
   ============================================================ */
KinanLevels.register({
  id: '9-4', world: 9, slot: 4, kind: 'level',
  name: 'MOUNT ROYAL LOOKOUT',
  theme: 113,   /* Mount Royal: the city and the river far below, autumn trees, the lookout chalet */
  cols: 270,
  /* THE WIND (World 7's twist) near the top: taught on the windy plateau (no gap), then all along the ridge */
  wind: [[165, 199], [205, 242]],
  heights: [
    /* S1 0-26 the foot of the mountain (row 13), the trail up */
    208,208,208,208,208,208,208,208,208,200,192,192,192,192,192,192,192,184,176,176,176,176,176,176,176,176,176,
    /* S2 27-53 a 3 gap c32-34 up to a higher lip, the trail, a 2 gap c49-50 */
    176,176,176,176,176,null,null,null,160,160,160,160,160,160,160,152,144,144,144,144,144,144,null,null,144,144,144,
    /* S3 54-80 THE SUMMIT ROCK: rock stairs up (c60-62, c63-65) and down (c66-68) */
    144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,
    /* S4 81-107 a 3 gap c85-87, THE WOODEN STAIRS (c91-92, 1:1), a 4 gap c99-102 on the plateau */
    144,144,144,144,null,null,null,144,144,144,128,112,112,112,112,112,112,112,null,null,null,null,112,112,112,112,112,
    /* S5 108-134 down to Beaver Lake: THE OLD OAK (c124-128), the stone shelter (c130-134) */
    112,112,112,112,120,128,136,144,144,144,144,152,160,168,176,176,176,176,176,176,176,176,176,176,176,176,176,
    /* S6 135-161 a 4 gap c141-144, the checkpoint, THE BIG ROCK STAIRS (c153-155, c156-158, c159-161) */
    176,176,176,176,176,176,null,null,null,null,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,
    /* S7 162-188 a 3 gap c162-164 from the rock top to the windy plateau (wind from c165), a 4 gap c179-182 */
    null,null,null,96,96,96,96,96,96,96,96,104,112,112,112,112,112,null,null,null,null,112,112,112,112,112,112,
    /* S8 189-215 THE WINDY RIDGE: a 5 gap c200-204, a 3 gap c211-213 */
    112,112,112,112,112,104,96,96,96,96,96,null,null,null,null,null,96,96,96,96,96,96,null,null,null,96,96,
    /* S9 216-242 a 5 gap c223-227, up to the lookout */
    96,96,96,96,96,96,96,null,null,null,null,null,96,96,96,96,96,96,96,96,88,80,80,80,80,80,80,
    /* S10 243-269 THE LOOKOUT: THE TELESCOPE PLATFORM (spring c249, platform c250-252 row 1), the chalet terrace, the goal */
    80,80,80,80,80,80,80,80,80,80,80,80,80,80,80,80,80,80,80,80,80,80,80,80,80,80,80
  ],
  solid: [
    [60, 7, 62, 8], [63, 5, 65, 8], [66, 7, 68, 8],   /* S3 THE SUMMIT ROCK: two steps up, one down */
    [124, 3, 128, 6],   /* S5 THE OLD OAK's canopy (the hidden gift is one of its branches) */
    [130, 8, 134, 8], [130, 6, 133, 6], [130, 7, 130, 7],   /* S5 the stone shelter on a ledge (walk under it); its board faces right */
    [153, 9, 155, 10], [156, 7, 158, 10], [159, 5, 161, 10]   /* S6 THE BIG ROCK STAIRS, two tiles a step */
  ],
  tiles: {
    gift: [
      [5, 9],   /* S1 */
      [45, 5],   /* S2 */
      [56, 5],   /* S3 */
      [96, 3],   /* S4 on the plateau */
      [117, 5],   /* S5 */
      [126, 6, 'gold'],   /* S5 THE OLD OAK: the glinting branch (hidden) */
      [138, 7],   /* S6 */
      [167, 2],   /* S7 on the windy plateau */
      [192, 3],   /* S8 */
      [220, 2],   /* S9 */
      [258, 1, 'heart'], [260, 1, 'cake']   /* S10 the gift row */
    ],
    brick: [
      [4, 9], [6, 9],   /* S1 */
      [137, 7], [139, 7],   /* S6 */
      [259, 1]   /* S10 */
    ],
    spring: [
      [249, 4]   /* S10 the spring under THE TELESCOPE PLATFORM (skill secret) */
    ],
    shelf: [
      [250, 1], [251, 1], [252, 1]   /* S10 THE TELESCOPE PLATFORM (skill secret) */
    ],
    board: [[133, 7]]   /* BONUS: hop onto the stone shelter's ledge from the right and KICK the board: 2 candles inside */
  },
  /* squirrels (Mount Royal is full of them), raccoons, joggers and crows. Nothing waits at a lip. */
  foes: [
    [14, 11, 'squirrel'],   /* S1 */
    [38, 9, 'mallwalker'],   /* S2 */
    [57, 5, 'crow'],   /* S3 */
    [95, 6, 'squirrel'], [101, 3, 'crow'],   /* S4 */
    [110, 6, 'raccoon'], [125, 10, 'mallwalker'],   /* S5 */
    [137, 10, 'squirrel'], [147, 6, 'crow'],   /* S6 */
    [168, 5, 'raccoon'], [176, 6, 'squirrel'], [181, 3, 'crow'],   /* S7 */
    [191, 6, 'mallwalker'], [202, 2, 'crow'], [207, 5, 'raccoon'],   /* S8 */
    [219, 5, 'squirrel'], [225, 2, 'crow'], [231, 5, 'raccoon'],   /* S9 */
    [246, 4, 'mallwalker']   /* S10 */
  ],
  candles: [
    [3, 12], [7, 12], [9, 11], [11, 11], [13, 11], [15, 11], [17, 10], [19, 10], [21, 10], [23, 10], [25, 10],
    [27, 10], [29, 10], [31, 9], [32, 8], [33, 8], [34, 8], [35, 8], [37, 9], [39, 9], [41, 9], [43, 8], [47, 8], [48, 7], [49, 6], [50, 6], [51, 7], [53, 8],
    [55, 8], [58, 8], [60, 6], [62, 6], [63, 4], [64, 4], [65, 4], [63, 2], [65, 2], [66, 6], [68, 6], [70, 8], [72, 8], [74, 8], [76, 8], [78, 8], [80, 8],
    [82, 8], [84, 7], [85, 6], [86, 6], [87, 6], [88, 7], [90, 8], [91, 7], [92, 6], [94, 6], [98, 5], [99, 4], [100, 4], [101, 4], [102, 4], [103, 5], [105, 6], [107, 6],
    [109, 6], [111, 6], [112, 6], [114, 7], [116, 8], [118, 8], [120, 9], [124, 10], [126, 9], [126, 8], [128, 10], [131, 7], [132, 7], [134, 7],
    [136, 10], [140, 9], [141, 8], [142, 8], [143, 8], [144, 8], [145, 9], [147, 10], [149, 10], [151, 10], [153, 8], [155, 8], [156, 6], [158, 6], [159, 4], [161, 4],
    [162, 3], [163, 3], [164, 4], [166, 5], [170, 5], [172, 5], [174, 6], [178, 5], [179, 4], [180, 4], [181, 4], [182, 4], [183, 5], [185, 6], [187, 6],
    [190, 6], [194, 5], [196, 5], [198, 5], [199, 4], [200, 3], [201, 3], [203, 3], [204, 3], [205, 4], [209, 5], [210, 4], [211, 3], [212, 3], [213, 4], [215, 5],
    [217, 5], [221, 5], [222, 4], [223, 3], [224, 3], [226, 3], [227, 3], [228, 4], [230, 5], [232, 5], [234, 5], [236, 4], [238, 4], [240, 4], [242, 4],
    [244, 4], [248, 4], [249, 2], [250, 0], [252, 0], [255, 4], [258, 3], [260, 3], [262, 4], [264, 4], [266, 4]
  ],
  secrets: [
    { kind: 'visible', col: 64, row: 2, prize: 'heart+candles' },   /* THE SUMMIT ROCK: climb the rock stairs, one more jump up */
    { kind: 'hidden', col: 126, row: 6, prize: 'GOLDEN CANDLE', glint240: true },   /* THE OLD OAK: the glinting branch */
    { kind: 'skill', col: 251, row: 0, prize: 'hat' }   /* THE TELESCOPE PLATFORM: the spring, then steer onto it */
  ],
  goldenCandle: { col: 126, row: 6 },
  checkpoint: { col: 148, row: 10 },
  spawn: { col: 2, row: 12 },
  goal: { col: 266, row: 4 },   /* the lookout terrace by the chalet */
  talk: [
    [2, 'KINAN', "Mount Royal! Glitchy's climbing all the way up to the lookout. Up we go!", 3.6],
    [20, 'MOM', "It's a big climb, sweetie. One step at a time.", 3],
    [55, 'DAD', 'Rock stairs! Jump up onto one step, then the next, bud. This mountain rocks.', 3.2],
    [88, 'CHENOA', 'The wooden stairs! Everybody in Montreal climbs these. Race you, little bro!', 3.6],
    [116, 'PASSER-BY', 'Bonjour! Beautiful day for a climb, non?', 3],
    [146, 'SHAD', "Annie's drones can't see under the trees up here. Good spot for Glitchy to hide.", 4],
    [165, 'MOM', 'Hold on, sweetie! When you hear the wind coming, stand still and let it pass.', 3.6],
    [244, 'KINAN', 'The lookout! You can see the whole city from up here... and there goes Glitchy, toward the Biodome!', 4.4]
  ]
});

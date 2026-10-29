/* ============================================================
   LEVEL 7-1 · THE MOUNTAIN HIGHWAY
   (World 7 · Vancouver · trail stop 1)
   Story bible (World 7 table): "Into the city from the east in the
   rain. Gentle opener." The tour bus carried Glitchy over the
   mountains, and the family's truck follows it down the highway to the
   coast. On this side of the mountains it is raining. It is always
   raining. Somewhere over the city a little grey cloud has just woken
   up...
   Idea (ONE): THE TUNNELS. The highway runs through the mountain in
     tunnels with low rock roofs: you can still jump in there, but only
     a short hop before your head bumps the rock. Act 1 teaches it (a
     flat tunnel with a candle line, the gaps all outside in the open);
     act 2 twists it (a 2-wide gap INSIDE a tunnel, then the switchbacks
     4/4/3/4 out in the rain); act 3 tests it (a long tunnel with two
     gaps under the roof, straight out into a 5-wide gap, then 4).
   Acts (thirds): 0-98 teach (the lookout 2, the first tunnel, 3, THE
     LOOKOUT ROCK 3, the 3-wide washout, the ditch BOWL) · 99-197
     twist (the checkpoint, THE TUNNEL WITH THE SHINY ROOF 2, the
     switchbacks 4/4, the rock slide 3/4) · 198-296 test (the runaway
     lane 5, THE LONG TUNNEL 2/2, out into 5/4, THE OVERPASS, WELCOME
     TO VANCOUVER).
   Signature set-piece: THE LONG TUNNEL (S9-S10): two gaps under the
     rock roof, then you burst out of the tunnel straight into the
     widest gap of the level.
   Secrets: visible = THE LOOKOUT ROCK (S3): a rock ledge hangs over the
     washout; from the top of the hill, jump UP onto it instead of
     across (heart + candles, 70,6) · hidden = THE SHINY ROOF (S5): in
     the second tunnel one rock in the roof glints; jump under it
     (GOLDEN CANDLE, 124,7; two candles under it point up) · skill =
     THE OVERPASS (S10): bounce off the springboard and land on top of
     the overpass high over the road (hat, 269,4).
   Gaps: act 1 2/3/3/3 · act 2 2 (in a tunnel)/4/4/3/4 · act 3 5, 2/2
     (in a tunnel), 5/4. Every gap has a candle arc; nothing waits at a
     gap's lip. The first gift is an UMBRELLA (World 7's rain power:
     hold JUMP while falling to float).
   Look: borrows the Mountain Highway (theme 41): misty mountains, a
     winding road and a tunnel in the backdrop, rain.
   ENGINE REQUESTS: a rock-portal skin for the tunnel roofs (solid
     blocks) · a highway skin (grey road, yellow line) for the ground
     tops · a concrete overpass skin for the overpass block · Drizzle as
     a far-off grey cloud over the city in the last two screens.
   ============================================================ */
KinanLevels.register({
  id: '7-1', world: 7, slot: 1, kind: 'level',
  name: 'THE MOUNTAIN HIGHWAY',
  theme: 41,   /* the Mountain Highway: misty mountains, a winding road, a tunnel, rain */
  cols: 297,
  heights: [
    /* S1 0-26 the lookout at the top of the pass, the road runs down (c9-12), a 2-wide gap c18-19 */
    128,128,128,128,128,128,128,128,128,136,144,152,160,160,160,160,160,160,null,null,160,160,160,160,160,160,160,
    /* S2 27-53 down to the first tunnel (roof c37-45, flat floor), a 3-wide gap c48-50 outside */
    160,160,160,160,168,176,184,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,
    /* S3 54-80 up a hill (c58-61), THE LOOKOUT ROCK over a 3-wide washout c68-70, down onto the lower road */
    192,192,192,192,184,176,168,160,160,160,160,160,160,160,null,null,null,176,176,176,176,176,176,176,176,176,176,
    /* S4 81-107 down to the ditch: a 3-wide gap c92-94, the ditch BOWL (c97-104) and the checkpoint */
    176,176,176,176,184,192,192,192,192,192,192,null,null,null,192,192,200,208,208,208,208,208,200,192,192,192,192,
    /* S5 108-134 THE TUNNEL WITH THE SHINY ROOF (roof c113-130): a 2-wide gap c119-120 under the roof */
    192,192,192,192,192,192,192,192,192,192,192,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 the switchbacks: a 4-wide gap c138-141, up the cut (c145-148), a 4-wide gap c153-156 */
    192,192,192,null,null,null,null,192,192,192,184,176,168,160,160,160,160,160,null,null,null,null,160,160,160,160,160,
    /* S7 162-188 the rock slide: down (c166-167), a 3-wide gap c171-173, up (c178-179), a 4-wide gap c184-187 */
    160,160,160,160,168,176,176,176,176,null,null,null,176,176,176,176,168,160,160,160,160,160,null,null,null,null,160,
    /* S8 189-215 the runaway lane: down (c193-194), a 5-wide gap c201-205 */
    160,160,160,160,168,176,176,176,176,176,176,176,null,null,null,null,null,176,176,176,176,176,176,176,176,176,176,
    /* S9 216-242 THE LONG TUNNEL (roof c224-238): 2-wide gaps c228-229 and c233-234 under the roof */
    176,176,176,184,192,192,192,192,192,192,192,192,null,null,192,192,192,null,null,192,192,192,192,192,192,192,192,
    /* S10 243-269 out of the tunnel into a 5-wide gap c243-247, a 4-wide gap c253-256 · THE OVERPASS (c264-270) */
    null,null,null,null,null,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S11 270-296 reward: WELCOME TO VANCOUVER, the gift row, Dad's truck */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [37, 4, 45, 7],   /* S2 the first tunnel's rock roof (4 tiles of air under it) */
    [113, 4, 130, 7],   /* S5 THE TUNNEL WITH THE SHINY ROOF */
    [224, 4, 238, 7],   /* S9 THE LONG TUNNEL */
    [264, 5, 270, 5]   /* S10 THE OVERPASS, high over the road (skill secret) */
  ],
  tiles: {
    gift: [
      [4, 4, 'umbrella'],   /* S1 World 7's power: the umbrella */
      [29, 6],   /* S2 */
      [64, 6], [76, 7],   /* S3 */
      [89, 8],   /* S4 */
      [110, 8],   /* S5 */
      [124, 7, 'gold'],   /* S5 THE SHINY ROOF: the glinting rock in the tunnel roof (hidden) */
      [150, 6],   /* S6 */
      [176, 7],   /* S7 */
      [209, 7],   /* S8 */
      [222, 8],   /* S9 */
      [250, 8],   /* S10 */
      [276, 8, 'heart'], [278, 8], [280, 8, 'cake']   /* S11 the gift row */
    ],
    brick: [
      [3, 4], [5, 4],   /* S1 */
      [63, 6], [65, 6],   /* S3 */
      [149, 6], [151, 6],   /* S6 */
      [181, 6], [182, 6],   /* S7 */
      [208, 7], [210, 7],   /* S8 */
      [277, 8], [279, 8]   /* S11 */
    ],
    spring: [
      [262, 11]   /* S10 the springboard under THE OVERPASS (skill secret) */
    ],
    shelf: [
      [69, 7], [70, 7], [71, 7]   /* S3 THE LOOKOUT ROCK (visible secret) */
    ]
  },
  /* puddle frogs hop in the ditches, raccoons raid the tunnels, crows and umbrella bats drift over the gaps (no rain-cloud foes in World 7: a little grey cloud is Drizzle, seen only far off); nothing waits at a lip */
  foes: [
    [23, 9, 'puddlefrog'],   /* S1 */
    [41, 11, 'raccoon'],   /* S2 in the first tunnel */
    [76, 10, 'puddlefrog'],   /* S3 */
    [88, 11, 'raccoon'],   /* S4 */
    [110, 11, 'puddlefrog'], [127, 11, 'raccoon'],   /* S5 */
    [140, 5, 'crow'], [150, 9, 'puddlefrog'],   /* S6 */
    [175, 10, 'puddlefrog'], [185, 5, 'umbrellabat'],   /* S7 */
    [197, 10, 'raccoon'], [203, 5, 'crow'], [211, 10, 'puddlefrog'],   /* S8 */
    [221, 11, 'puddlefrog'], [237, 11, 'raccoon'],   /* S9 */
    [245, 5, 'crow'], [254, 6, 'umbrellabat'], [266, 11, 'puddlefrog'],   /* S10 */
    [283, 11, 'raccoon']   /* S11 */
  ],
  candles: [
    [1, 6], [2, 6], [6, 6], [7, 6], [9, 7], [10, 7], [11, 8], [12, 8], [13, 9], [14, 9], [15, 9], [17, 8], [18, 7], [19, 7],
    [20, 8], [22, 9], [24, 9], [26, 9], [27, 9], [28, 9], [31, 9], [32, 10], [33, 10], [34, 11], [37, 11], [38, 11], [39, 11], [40, 11],
    [42, 11], [43, 11], [44, 11], [45, 11], [47, 10], [48, 9], [49, 8], [50, 9], [51, 10], [52, 11], [53, 11], [55, 11], [56, 11], [58, 10],
    [59, 10], [60, 9], [61, 9], [62, 9], [66, 9], [67, 9], [68, 8], [69, 8], [70, 8], [71, 9], [72, 10], [73, 10], [74, 10], [78, 10],
    [79, 10], [80, 10], [81, 10], [82, 10], [85, 11], [86, 11], [87, 11], [90, 11], [91, 10], [92, 9], [93, 8], [94, 9], [95, 10], [99, 12],
    [100, 12], [102, 12], [104, 11], [105, 11], [106, 11], [107, 11], [108, 11], [109, 11], [111, 11], [112, 11], [113, 11], [114, 11], [115, 11], [116, 11],
    [117, 11], [118, 10], [119, 9], [120, 9], [121, 10], [122, 11], [123, 11], [124, 10], [124, 9], [125, 11], [126, 11], [128, 11], [129, 11], [130, 11],
    [132, 11], [133, 11], [135, 11], [136, 11], [137, 10], [138, 9], [139, 8], [140, 8], [141, 9], [142, 10], [143, 11], [145, 10], [146, 10], [147, 9],
    [148, 9], [149, 9], [151, 9], [152, 9], [153, 7], [154, 6], [155, 6], [156, 7], [157, 8], [158, 9], [159, 9], [160, 9], [161, 9], [162, 9],
    [163, 9], [166, 10], [167, 10], [168, 10], [169, 10], [170, 9], [171, 8], [172, 7], [173, 8], [174, 9], [176, 10], [178, 9], [179, 9], [180, 9],
    [182, 9], [183, 8], [184, 7], [185, 6], [186, 6], [187, 7], [188, 8], [189, 9], [190, 9], [191, 9], [192, 9], [193, 10], [194, 10], [195, 10],
    [196, 10], [198, 10], [199, 10], [200, 9], [201, 8], [202, 7], [203, 6], [204, 7], [205, 8], [206, 9], [207, 10], [212, 10], [213, 10], [214, 10],
    [215, 10], [216, 10], [217, 10], [219, 11], [220, 11], [223, 11], [224, 11], [225, 11], [226, 11], [227, 10], [228, 9], [229, 9], [230, 10], [231, 11],
    [232, 10], [233, 9], [234, 9], [235, 10], [236, 11], [238, 11], [239, 11], [240, 11], [241, 11], [242, 10], [243, 9], [244, 8], [245, 7], [246, 8],
    [247, 9], [248, 10], [249, 11], [251, 11], [252, 10], [253, 9], [254, 8], [255, 8], [256, 9], [257, 10], [259, 11], [260, 11], [262, 9], [262, 7],
    [263, 5], [264, 4], [265, 4], [266, 4], [267, 4], [268, 4], [264, 11], [266, 11], [268, 11], [271, 11], [272, 11], [273, 11], [274, 11], [276, 7],
    [278, 7], [280, 7], [285, 11], [287, 11], [289, 11], [291, 11]
  ],
  secrets: [
    { kind: 'visible', col: 70, row: 6, prize: 'heart+candles' },   /* THE LOOKOUT ROCK: from the hilltop, jump up onto the ledge over the washout */
    { kind: 'hidden', col: 124, row: 7, prize: 'GOLDEN CANDLE', glint240: true },   /* THE SHINY ROOF: the glinting rock in the tunnel roof */
    { kind: 'skill', col: 269, row: 4, prize: 'hat' }   /* THE OVERPASS: springboard, then steer onto the overpass */
  ],
  goldenCandle: { col: 124, row: 7 },
  checkpoint: { col: 101, row: 12 },
  spawn: { col: 2, row: 7 },
  goal: { col: 293, row: 11 },   /* Dad's truck waits at the city limits */
  /* story bubbles as Kinan passes a column: [col, who, what they say, seconds] (subtitles only) */
  talk: [
    [2, 'DAD', "Over the mountains and down to the ocean. Vancouver's at the bottom of this highway, bud.", 4.4],
    [21, 'KINAN', 'Why is it raining? It was sunny on the other side of the mountains!', 3.6],
    [33, 'MOM', 'Tunnel coming up! Keep your head down in there, sweetie.', 3.2],
    [100, 'SHAD', "Glitchy's tour bus went into the next tunnel. I can hear him giggling in there.", 4],
    [196, 'CHENOA', 'Look how far down the city is! All those glass towers!', 3.2],
    [258, 'KINAN', "There's a little grey cloud over the city. It's only raining in ONE spot...", 4],
    [284, 'DAD', 'Welcome to Vancouver! First stop: the ocean.', 3]
  ]
});

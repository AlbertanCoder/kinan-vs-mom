/* ============================================================
   LEVEL 7-5 · CAPILANO SUSPENSION BRIDGE
   (World 7 · Vancouver · trail stop 5)
   Story bible (World 7 table): "A swaying rope bridge high over a
   canyon." Up the road from the North Shore, a long rope-and-plank
   bridge hangs over the Capilano canyon, way above the river. Across
   it: little bridges from tree to tree high in the cedars, and a
   walkway bolted right onto the granite along the canyon wall. Glitchy
   bounced across the whole thing, and some of the planks came loose.
   Idea (ONE): THE SAG. A rope bridge sags in the middle: you run DOWN
     into the low middle, the planks are missing right at the bottom,
     and you jump across and climb UP the other side. Act 1 teaches it
     (the first rope bridge with a 3-wide hole at the bottom, the
     tree platforms 3/3/2, the rim trail); act 2
     twists it (THE BIG BRIDGE: holes on the way down, at the bottom and
     on the way up 4/4/3; the twin bridge 4/4); act 3 tests it (a 5-wide
     hole down to the canyon wall, the ledges 3/3/3 under the granite
     overhang, the last bridge 5).
   Acts (thirds): 0-98 teach (the entrance 2, the first rope bridge 3,
     high in the cedars 3/3/2, the rim trail dip) · 99-197 twist (the checkpoint,
     THE BIG BRIDGE 4/4/3 and THE MISSING PLANKS, the far platform, the
     twin bridge 4/4) · 198-296 test (down to the canyon wall 5, ALONG
     THE CANYON WALL 3/3/3, the last bridge 5, THE TALLEST FIR, the totems).
   Signature set-piece: THE BIG BRIDGE (S5-S6): one long sag, two
     screens wide, with planks missing on the way down, at the very
     bottom and on the climb back up.
   Secrets: visible = THE MISSING PLANKS (S5): through the hole at the
     bottom of the big bridge you can see a rock ledge with a heart
     sticking out of the canyon wall; drop in on purpose, land on it,
     jump back up (heart + candles, 126,13) · hidden = THE GRANITE
     OVERHANG (S9): along the canyon wall one stone in the rock over your
     head glints; jump under it (GOLDEN CANDLE, 224,4; two candles
     under it point up) · skill = THE TALLEST FIR (S10): bounce off the
     springboard way above the trees and land on the fir's top branch
     (hat, 267,1).
   Gaps: act 1 2/3/3/3/2 · act 2 4/4/3/4/4 · act 3 5, 3/3/3 (under the
     overhang: still makeable at a walk), 5. Every hole has a candle
     arc; nothing waits at a lip. A kid who falls through the big
     bridge's bottom hole lands on the ledge (the visible secret).
   Look: borrows the Suspension Bridge (theme 44): the canyon's steep
     forest walls, the river far below, the bridge cables, rain.
   TWIST (wired 2026-10-28): THE SWAY: the bridges swing and nudge
     Kinan, and loose planks bob on their ropes in the holes (see sway
     and planks below).
   ENGINE REQUESTS (still open): a rope-and-
     plank skin for the bridge slopes (with the handrails) · the river
     drawn at the bottom of the canyon · a steel-walkway skin for the
     canyon wall ledges and a granite skin for the overhang.
   ============================================================ */
KinanLevels.register({
  id: '7-5', world: 7, slot: 5, kind: 'level',
  name: 'CAPILANO SUSPENSION BRIDGE',
  theme: 44,   /* the Suspension Bridge: the canyon, the river far below, the bridge cables, rain */
  cols: 297,
  /* THE SWAY (wired 2026-10-28): on the rope bridges the deck swings, nudging Kinan gently one way and then the
     other (rope handrails swing with it; never off an edge), and the planks that came loose hang in the holes on
     their ropes, bobbing and swinging in a slow, steady rhythm (2.5 s): solid, they carry Kinan, a stepping stone
     for a kid who times it. Teach: the first bridge only sways · twist: THE BIG BRIDGE's first and last holes and the
     twin bridge's holes each have a bobbing plank (THE MISSING PLANKS hole stays open: the ledge secret) · test: one
     plank in the last bridge's 5-wide hole. */
  sway: [[27, 48], [108, 142], [162, 188], [243, 259]],
  planks: [[115, 9, 2, 5, 150, 0, 3], [140, 9, 2, 5, 150, 75, 3], [171, 10, 2, 5, 150, 0, 3], [178, 10, 2, 5, 150, 75, 3], [249, 10, 2, 6, 150, 40, 4]],
  heights: [
    /* S1 0-26 the park entrance: up the trail (c8-11), a 2-wide gap c14-15, up to the canyon rim (c18-21) */
    192,192,192,192,192,192,192,192,184,176,168,160,160,160,null,null,160,160,152,144,136,128,128,128,128,128,128,
    /* S2 27-53 the first rope bridge: down into the sag (c29-32), a 3-wide hole c36-38 at the bottom, up (c42-45) */
    128,128,136,144,152,160,160,160,160,null,null,null,160,160,160,152,144,136,128,128,128,128,128,128,128,128,128,
    /* S3 54-80 high in the cedars: tree platforms (4 wide) over gaps c57-59 (3), c64-66 (3), c71-72 (2) */
    128,128,128,null,null,null,112,112,112,112,null,null,null,112,112,112,112,null,null,128,128,128,128,128,128,128,128,
    /* S4 81-107 the rim trail dips (c87-96) · the checkpoint */
    128,128,128,128,128,128,136,144,144,144,144,144,144,144,136,128,128,128,128,128,128,128,128,128,128,128,128,
    /* S5 108-134 THE BIG BRIDGE: down (c110-111), a 4-wide hole c114-117, down to the bottom, a 4-wide hole c125-128 (THE MISSING PLANKS) */
    128,128,136,144,144,144,null,null,null,null,160,168,176,176,176,176,176,null,null,null,null,176,176,176,176,176,168,
    /* S6 135-161 up the far side (c135-137), a 3-wide hole c140-142, the far platform */
    160,152,144,144,144,null,null,null,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,
    /* S7 162-188 the twin bridge: down (c164-167), 4-wide holes c170-173 and c177-180 at the bottom, up (c182-185) */
    128,128,136,144,152,160,160,160,null,null,null,null,160,160,160,null,null,null,null,160,152,144,136,128,128,128,128,
    /* S8 189-215 down toward the cliff (c193-196), a 5-wide gap c200-204 */
    128,128,128,128,136,144,152,160,160,160,160,null,null,null,null,null,160,160,160,160,160,160,160,160,160,160,160,
    /* S9 216-242 ALONG THE CANYON WALL under THE GRANITE OVERHANG (c218-238): 3-wide gaps c220-222, c227-229, c234-236 */
    160,160,160,160,null,null,null,160,160,160,160,null,null,null,160,160,160,160,null,null,null,160,160,160,160,160,160,
    /* S10 243-269 the last bridge: a 5-wide hole c247-251, up (c256-259) · THE TALLEST FIR and its springboard */
    160,160,160,160,null,null,null,null,null,160,160,160,160,152,144,136,128,128,128,128,128,128,128,128,128,128,128,
    /* S11 270-296 reward: the totem poles, the gift row, the gondola road */
    128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128
  ],
  solid: [
    [125, 14, 128, 14],   /* S5 THE MISSING PLANKS: the rock ledge far below the bottom hole, as wide as the hole (visible secret) */
    [218, 1, 238, 4]   /* S9 THE GRANITE OVERHANG over the canyon wall ledges (5 tiles of air under it) */
  ],
  tiles: {
    gift: [
      [4, 8, 'popper'], [24, 4],   /* S1 */
      [50, 4],   /* S2 */
      [77, 4],   /* S3 */
      [91, 5], [104, 4],   /* S4 */
      [123, 6],   /* S5 */
      [145, 4], [156, 4, 'umbrella'],   /* S6 an umbrella for the twin bridge */
      [186, 4],   /* S7 */
      [208, 6],   /* S8 */
      [224, 4, 'gold'],   /* S9 THE GRANITE OVERHANG: the glinting stone (hidden) */
      [244, 6],   /* S10 */
      [276, 4, 'heart'], [278, 4], [280, 4, 'cake']   /* S11 the gift row */
    ],
    brick: [
      [3, 8], [5, 8],   /* S1 */
      [49, 4], [51, 4],   /* S2 */
      [103, 4], [105, 4],   /* S4 */
      [144, 4], [146, 4],   /* S6 */
      [207, 6], [209, 6],   /* S8 */
      [277, 4], [279, 4]   /* S11 */
    ],
    spring: [
      [264, 7]   /* S10 the springboard under THE TALLEST FIR (skill secret) */
    ],
    shelf: [
      [266, 2], [267, 2]   /* S10 the fir's top branch (skill secret) */
    ]
  },
  /* raccoons and squirrels on the trails, puddle frogs at the bottom of the bridges, umbrella bats and crows over the canyon; nothing waits at a lip */
  foes: [
    [6, 11, 'raccoon'],   /* S1 */
    [37, 5, 'umbrellabat'],   /* S2 */
    [76, 7, 'raccoon'],   /* S3 */
    [92, 8, 'raccoon'],   /* S4 */
    [116, 5, 'umbrellabat'], [122, 10, 'puddlefrog'],   /* S5 */
    [148, 7, 'squirrel'], [155, 7, 'raccoon'],   /* S6 */
    [175, 9, 'puddlefrog'], [178, 5, 'crow'],   /* S7 */
    [202, 5, 'umbrellabat'], [210, 9, 'squirrel'],   /* S8 */
    [221, 7, 'umbrellabat'], [232, 9, 'raccoon'], [239, 9, 'squirrel'],   /* S9 */
    [249, 5, 'umbrellabat'], [254, 9, 'raccoon'], [268, 7, 'raccoon'],   /* S10 */
    [284, 7, 'raccoon']   /* S11 */
  ],
  candles: [
    [1, 11], [2, 11], [7, 11], [8, 10], [9, 10], [10, 9], [11, 9], [12, 9], [13, 8], [14, 7], [15, 7], [16, 8], [17, 9], [18, 8],
    [19, 8], [20, 7], [21, 7], [22, 7], [23, 7], [25, 7], [26, 7], [27, 7], [28, 7], [29, 7], [30, 8], [31, 8], [32, 9], [33, 9],
    [34, 9], [35, 8], [36, 7], [37, 7], [38, 7], [39, 8], [40, 9], [41, 9], [42, 8], [43, 8], [44, 7], [45, 7], [46, 7], [47, 7],
    [48, 7], [52, 7], [53, 7], [54, 7], [55, 7], [56, 6], [57, 5], [58, 4], [59, 4], [60, 5], [61, 6], [62, 6], [63, 5], [64, 4],
    [65, 4], [66, 4], [67, 5], [68, 6], [69, 6], [70, 5], [71, 4], [72, 5], [73, 6], [74, 7], [75, 7], [78, 7], [79, 7], [80, 7],
    [81, 7], [82, 7], [83, 7], [84, 7], [85, 7], [86, 7], [87, 7], [88, 8], [89, 8], [90, 8], [93, 8], [94, 8], [95, 8], [96, 7],
    [97, 7], [98, 7], [99, 7], [100, 7], [102, 7], [106, 7], [107, 7], [108, 7], [109, 7], [110, 7], [111, 8], [112, 8], [113, 8], [114, 7],
    [115, 6], [116, 6], [117, 7], [118, 9], [119, 9], [120, 10], [121, 10], [123, 10], [124, 9], [125, 8], [126, 7], [127, 7], [128, 8], [126, 11],
    [126, 12], [129, 9], [130, 10], [131, 10], [132, 10], [133, 10], [134, 9], [135, 9], [136, 8], [137, 8], [138, 8], [139, 7], [140, 6], [141, 5],
    [142, 6], [143, 7], [147, 7], [149, 7], [150, 7], [151, 7], [152, 7], [153, 7], [157, 7], [158, 7], [159, 7], [160, 7], [161, 7], [162, 7],
    [163, 7], [164, 7], [165, 8], [166, 8], [167, 9], [168, 9], [169, 8], [170, 7], [171, 6], [172, 6], [173, 7], [174, 8], [176, 8], [177, 7],
    [179, 6], [180, 7], [181, 8], [182, 8], [183, 7], [184, 7], [185, 7], [187, 7], [188, 7], [189, 7], [190, 7], [191, 7], [192, 7], [193, 7],
    [194, 8], [195, 8], [196, 9], [197, 9], [198, 9], [199, 8], [200, 7], [201, 6], [202, 6], [203, 6], [204, 7], [205, 8], [206, 9], [211, 9],
    [212, 9], [214, 9], [215, 9], [216, 9], [217, 9], [218, 9], [219, 8], [220, 7], [221, 7], [222, 7], [223, 8], [224, 7], [224, 6], [225, 9],
    [226, 8], [227, 7], [228, 7], [229, 7], [230, 8], [231, 9], [233, 8], [234, 7], [235, 7], [236, 7], [237, 8], [238, 9], [240, 9], [241, 9],
    [242, 9], [243, 9], [245, 9], [246, 8], [247, 7], [248, 6], [250, 6], [251, 7], [252, 8], [253, 9], [255, 9], [256, 8], [257, 8], [258, 7],
    [259, 7], [260, 7], [261, 7], [262, 7], [263, 7], [264, 5], [264, 3], [265, 1], [266, 1], [269, 7], [270, 7], [271, 7], [272, 7], [273, 7],
    [276, 3], [278, 3], [280, 3], [282, 7], [286, 7], [288, 7], [290, 7]
  ],
  secrets: [
    { kind: 'visible', col: 126, row: 13, prize: 'heart+candles' },   /* THE MISSING PLANKS: drop through the hole onto the ledge, jump back up */
    { kind: 'hidden', col: 224, row: 4, prize: 'GOLDEN CANDLE', glint240: true },   /* THE GRANITE OVERHANG: the glinting stone over the canyon wall ledges */
    { kind: 'skill', col: 267, row: 1, prize: 'hat' }   /* THE TALLEST FIR: springboard, then land on the top branch */
  ],
  goldenCandle: { col: 224, row: 4 },
  checkpoint: { col: 101, row: 7 },
  spawn: { col: 2, row: 11 },
  goal: { col: 293, row: 7 },   /* the road to the gondola */
  /* story bubbles as Kinan passes a column: [col, who, what they say, seconds] (subtitles only) */
  talk: [
    [2, 'MOM', 'The Capilano Suspension Bridge. Seventy metres up! I am holding the railing the WHOLE way.', 4.4],
    [27, 'DAD', 'It sags in the middle, bud. Run down, jump the hole, climb up the other side. The suspense is killing me!', 3.8],
    [54, 'CHENOA', 'Little bridges from tree to tree, way up high in the cedars!', 3.2],
    [102, 'KINAN', 'Some of the planks are missing. Wait... is that a rock ledge way down there?', 3.8],
    [189, 'SHAD', 'A path bolted right onto the canyon wall. Mind your head on the rock!', 3.6],
    [261, 'KINAN', "There's that little cloud again, raining on the top of the mountain.", 3.4],
    [284, 'DAD', "Next: the gondola up the mountain. Glitchy's heading for the top. That bug has peak energy.", 3.6]
  ]
});

/* ============================================================
   LEVEL 6-3 · THE HOODOO TRAIL
   (World 6 · Drumheller · trail stop 3)
   Story bible (World 6 table): "Hop across hoodoo tops." East of town
   the badlands grow hoodoos: tall pillars of soft rock, each one
   wearing a hard flat stone on top like a hat. The hat keeps the rain
   off, so the pillar under it stays standing while everything around
   it washes away. Glitchy bounced from hat to hat and dared Kinan to
   follow.
   Idea (ONE): HOODOO TOPS. The trail crosses a coulee where the only
     ground is the tops of the hoodoos. Every top is sized to a running
     jump: hold RUN, jump at the edge, land in the middle of the next
     hat. Act 1 teaches it with wide tops and 3-wide gaps that step UP;
     act 2 twists it (THE HOODOO FIELD at three heights, the lizard
     bench, a 4-tile drop to the creek bed); act 3 tests it (THE BIG
     THREE stepping up 2 and 2, then 5-wide gaps hat to hat, down the
     hoodoo stairs).
   Acts (thirds): 0-98 teach (the trailhead hoodoos 3/3, the coulee
     3/3, THE BOARDWALK STAIRS and a hat 3/3, the bench and a 3-wide gap,
     the checkpoint) · 99-197 twist (THE HOODOO FIELD 4/4/4, the lizard
     bench 4/4, the drop to the creek bed 3, 4/4, the first of THE BIG
     THREE 4) · 198-296 test (THE BIG THREE 4/5, the ledge 4/5/5, the
     hoodoo stairs 5/5, the viewpoint 5).
   Signature set-piece: THE BIG THREE (S8): three tall hoodoos in a row,
     each two tiles higher than the last, then a 5-wide hop off the top.
   Secrets: visible = THE HAT TRICK (S5): on the middle hoodoo of the
     field, stop on the hat and jump straight up for the heart floating
     over it (heart + candles, 122,4) · hidden = THE TRAIL BENCH (S4):
     by the checkpoint bench one rock in the air glints (GOLDEN CANDLE,
     105,6) · skill = THE TALLEST HOODOO (S11): the springboard at the
     viewpoint throws you up; steer onto the tallest hat (hat, 284,2).
   Look: borrows the Badlands Fossil Dig (theme 62): an orange sky,
     striped brown hills, sandy tops.
   Bubble beats for ER-4 (not wired): c2 Shad: "Hoodoos. The rock on
     top is like an umbrella for the pillar." · c12 Kinan: "So I'm
     jumping on their HATS?" · c102 checkpoint, a park ranger: "What do
     you call a dinosaur that's sleeping? A dino-snore!" · c160 Chenoa:
     "Watch the lizard, it's throwing ropes!" · c200 Kinan: "The Big
     Three. Okay. Okay okay okay." · c284 "Tallest hat in the badlands!"
   ENGINE REQUESTS: a hoodoo skin (a pale pillar under a dark flat
     capstone, wider than the stem) for the narrow ground columns · the
     tallest hoodoo drawn under its shelf cap · bubbles ER-4.
   ============================================================ */
KinanLevels.register({
  id: '6-3', world: 6, slot: 3, kind: 'level',
  name: 'THE HOODOO TRAIL',
  theme: 62,   /* the Badlands Fossil Dig: an orange sky, striped brown hills, sandy tops */
  cols: 297,
  heights: [
    /* S1 0-26 the trailhead · a 3-wide gap c9-11 up onto a wide hoodoo (c12-15), a 3-wide gap c16-18 up onto the next */
    192,192,192,192,192,192,192,192,192,null,null,null,176,176,176,176,null,null,null,160,160,160,160,160,160,160,160,
    /* S2 27-53 down the coulee (c28-31) · two 3-wide gaps c35-37 and c43-45 around a wide hoodoo (c38-42) */
    160,168,176,184,192,192,192,192,null,null,null,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,
    /* S3 54-80 THE BOARDWALK STAIRS (c57-58) · a 3-wide gap c63-65 up onto a high hat (c66-69) · a 3-wide gap c70-72 down */
    192,192,192,176,160,160,160,160,160,null,null,null,128,128,128,128,null,null,null,160,160,160,160,160,160,160,160,
    /* S4 81-107 a shallow BOWL (c84-91) · a 3-wide gap c96-98 · THE TRAIL BENCH and the checkpoint */
    160,160,160,168,176,176,176,176,176,168,160,160,160,160,160,null,null,null,160,160,160,160,160,160,160,160,160,
    /* S5 108-134 THE HOODOO FIELD: 4-wide gaps c110-113, c117-120, c124-127 between three hats at three heights */
    160,160,null,null,null,null,160,160,160,null,null,null,null,144,144,144,null,null,null,null,160,160,160,160,160,160,160,
    /* S6 135-161 up to the lizard bench (c135-144) · 4-wide gaps c145-148 and c152-155 · a high hat (c156-158) */
    160,160,160,152,144,136,128,128,128,128,null,null,null,null,128,128,128,null,null,null,null,112,112,112,null,null,null,
    /* S7 162-188 the creek bed, 4 tiles down · 4-wide gaps c173-176 and c180-183 around a hat (c177-179) */
    176,176,176,176,176,176,184,192,192,192,192,null,null,null,null,176,176,176,null,null,null,null,192,192,192,192,192,
    /* S8 189-215 THE BIG THREE: 4-wide gaps c193-196 and c200-203 up 2 and 2 (hats c197-199, c204-206), a 5-wide gap c207-211 to the third (c212-214) */
    192,192,192,192,null,null,null,null,160,160,160,null,null,null,null,128,128,128,null,null,null,null,null,128,128,128,null,
    /* S9 216-242 a 4-wide gap c215-218 down to a ledge (c219-224) · 5-wide gaps c225-229 and c233-237 around a hat (c230-232) */
    null,null,null,160,160,160,160,160,160,null,null,null,null,null,160,160,160,null,null,null,null,null,192,192,192,192,192,
    /* S10 243-269 the hoodoo stairs: 5-wide gaps c246-250 and c254-258, hats at c251-253 and c259-261 */
    192,192,192,null,null,null,null,null,192,192,192,null,null,null,null,null,176,176,176,184,192,192,192,192,192,192,192,
    /* S11 270-296 reward: a 5-wide gap c275-279 · the viewpoint, its springboard and THE TALLEST HOODOO · Dad's truck */
    192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [22, 10, 22, 11]   /* S1 a trail marker post */
  ],
  tiles: {
    gift: [
      [4, 8, 'popper'],   /* S1 */
      [40, 8],   /* S2 */
      [60, 6],   /* S3 */
      [87, 7], [105, 6, 'gold'],   /* S4 THE TRAIL BENCH: the glinting rock (hidden) */
      [131, 6],   /* S5 */
      [142, 4],   /* S6 */
      [187, 8],   /* S7 */
      [222, 5],   /* S9 */
      [264, 8],   /* S10 */
      [286, 8, 'heart'], [288, 8], [290, 8, 'cake']   /* S11 */
    ],
    brick: [
      [3, 8], [5, 8],   /* S1 */
      [59, 6], [61, 6],   /* S3 */
      [141, 4], [143, 4],   /* S6 */
      [186, 8], [188, 8],   /* S7 */
      [263, 8], [265, 8],   /* S10 */
      [287, 8], [289, 8]   /* S11 */
    ],
    spring: [
      [281, 11]   /* S11 the viewpoint's springboard (skill secret) */
    ],
    shelf: [
      [283, 3],   /* S11 THE TALLEST HOODOO's hat (skill secret) */
      [284, 3], [285, 3]   /* S11 */
    ]
  },
  /* gophers pop up, ground squirrels charge, magpies steal candles over the gaps, a lizard throws lassos from the bench; nothing waits on a hat */
  foes: [
    [5, 11, 'gopher'],   /* S1 */
    [50, 11, 'squirrel'],   /* S2 */
    [77, 9, 'gopher'],   /* S3 */
    [88, 10, 'squirrel'],   /* S4 */
    [119, 4, 'magpie'], [131, 9, 'gopher'],   /* S5 */
    [136, 9, 'lassolizard'], [154, 3, 'magpie'],   /* S6 */
    [165, 10, 'squirrel'], [182, 6, 'magpie'],   /* S7 */
    [190, 11, 'gopher'], [202, 3, 'magpie'], [213, 3, 'crow'],   /* S8 */
    [227, 5, 'magpie'], [235, 5, 'crow'], [240, 11, 'gopher'],   /* S9 */
    [248, 6, 'magpie'], [256, 6, 'crow'], [266, 11, 'squirrel'],   /* S10 */
    [272, 11, 'gopher']   /* S11 */
  ],
  candles: [
    [2, 11], [3, 11], [4, 11], [5, 11], [6, 11], [7, 11], [8, 11], [9, 9], [10, 8], [11, 8], [12, 9], [13, 10], [14, 10], [15, 10],
    [16, 10], [17, 8], [18, 7], [19, 8], [20, 9], [21, 9], [23, 9], [25, 9], [28, 9], [29, 9], [30, 10], [34, 11], [35, 9], [36, 8],
    [37, 8], [38, 9], [39, 11], [40, 11], [41, 11], [42, 11], [43, 9], [44, 8], [45, 8], [46, 9], [47, 11], [48, 11], [50, 11], [52, 11],
    [57, 10], [58, 9], [59, 9], [60, 9], [61, 9], [62, 9], [63, 7], [64, 6], [65, 6], [66, 7], [67, 7], [68, 7], [69, 7], [70, 6],
    [71, 5], [72, 5], [73, 6], [74, 7], [75, 9], [77, 9], [79, 9], [84, 9], [86, 10], [88, 10], [90, 9], [95, 9], [96, 7], [97, 6],
    [98, 6], [99, 7], [100, 9], [101, 9], [102, 9], [103, 9], [104, 9], [109, 9], [110, 7], [111, 6], [112, 6], [113, 6], [114, 7], [115, 9],
    [116, 9], [117, 7], [118, 6], [119, 6], [120, 6], [121, 7], [122, 8], [122, 3], [121, 3], [123, 3], [123, 8], [124, 7], [125, 6], [126, 6],
    [127, 6], [128, 7], [129, 8], [130, 9], [131, 9], [132, 9], [133, 9], [134, 9], [136, 9], [137, 8], [138, 8], [139, 7], [141, 7], [142, 7],
    [143, 7], [144, 7], [145, 5], [146, 4], [147, 4], [148, 4], [149, 5], [150, 7], [151, 7], [152, 5], [153, 4], [154, 4], [155, 4], [156, 5],
    [157, 6], [158, 6], [159, 6], [160, 5], [161, 5], [162, 5], [163, 5], [164, 6], [165, 6], [163, 10], [165, 10], [167, 10], [172, 11], [173, 9],
    [174, 8], [175, 8], [176, 8], [177, 9], [178, 10], [179, 10], [180, 9], [181, 8], [182, 8], [183, 8], [184, 9], [185, 10], [186, 11], [187, 11],
    [188, 11], [192, 11], [193, 9], [194, 8], [195, 8], [196, 9], [197, 9], [199, 9], [200, 7], [201, 6], [202, 6], [203, 7], [204, 7], [206, 7],
    [207, 6], [208, 5], [209, 5], [210, 5], [211, 6], [212, 7], [214, 7], [215, 6], [216, 5], [217, 5], [218, 5], [219, 6], [220, 7], [221, 9],
    [222, 9], [223, 9], [224, 9], [225, 7], [226, 6], [227, 6], [228, 6], [229, 7], [230, 9], [232, 9], [233, 8], [234, 7], [235, 7], [236, 7],
    [237, 8], [238, 9], [239, 11], [240, 11], [241, 11], [242, 11], [245, 11], [246, 9], [247, 8], [248, 8], [249, 8], [250, 9], [251, 11], [253, 11],
    [254, 9], [255, 8], [256, 8], [257, 8], [258, 9], [259, 10], [263, 10], [265, 11], [267, 11], [269, 11], [274, 11], [275, 9], [276, 8], [277, 8],
    [278, 8], [279, 9], [280, 11], [281, 9], [281, 7], [282, 5], [283, 4], [287, 11], [288, 11], [289, 11], [290, 11], [291, 11]
  ],
  secrets: [
    { kind: 'visible', col: 122, row: 4, prize: 'heart+candles' },   /* THE HAT TRICK: stop on the middle hat and jump straight up */
    { kind: 'hidden', col: 105, row: 6, prize: 'GOLDEN CANDLE', glint240: true },   /* THE TRAIL BENCH: the glinting rock over the bench */
    { kind: 'skill', col: 284, row: 2, prize: 'hat' }   /* THE TALLEST HOODOO: springboard, then steer onto its hat */
  ],
  goldenCandle: { col: 105, row: 6 },
  checkpoint: { col: 101, row: 9 },
  spawn: { col: 2, row: 11 },
  goal: { col: 293, row: 11 }   /* Dad's truck waits at the viewpoint */
});

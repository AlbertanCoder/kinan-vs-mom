/* ============================================================
   LEVEL 6-7 · HORSESHOE CANYON
   (World 6 · Drumheller · trail stop 8)
   Story bible (World 6 table): "Steep striped canyon walls. Secret exit
   in a canyon crack." Out on the prairie the ground suddenly drops away
   into a canyon shaped like a giant horseshoe, its walls striped red,
   grey and cream like a layer cake, hoodoos standing on its floor.
   Glitchy went down the stairs at the lookout, and there's a cold
   breath coming out of a crack in the rock that nobody has explored...
   Idea (ONE): STEEP WALLS. The canyon walls are 1:1 slopes: you race
     down them and slow to a crawl going up, and the gaps wait at the
     tops. Act 1 teaches it (the lookout stairs, a striped wall 4 high
     with a 3-wide gap on top, the hoodoo floor and a ledge, the bench
     wall); act 2 twists it (THE STRIPED WALL, 6 high, with a 4-wide gap
     on top; THE CANYON CRACK; the narrows; the high trail 4/4); act 3
     tests it (the canyon floor 5/5/4, THE HORSESHOE: the 6-high climb
     out to the rim and two 5-wide gaps on top, the rim trail 5/4).
   Acts (thirds): 0-107 teach (the lookout 3, the first wall 3, the
     hoodoo floor 3, the bench 3, the checkpoint) · 108-215 twist (THE
     STRIPED WALL 4, THE CANYON CRACK 4, the narrows 4, the high trail
     4/4) · 216-323 test (the canyon floor 5/5/4, THE HORSESHOE 5/5, the
     rim trail 5/4, the rim parking lot).
   Signature set-piece: THE HORSESHOE (S10): the last wall, six tiles of
     striped rock straight up, and two 5-wide gaps along the rim.
   Secrets: visible = THE EAGLE'S NEST (S5): a nest sticks out of the
     striped wall over the canyon floor; from the wall, a full jump back
     out to it (heart + candles, 108,4) · hidden = THE CANYON CRACK (S6):
     on the high bench a narrow crack drops three tiles; down inside, one
     rock glints above you (GOLDEN CANDLE, 145,9) and bumping it opens a
     door in the crack's floor: the SECRET EXIT to 6-secret, the Hidden
     Fossil Cave (the 1-7 / 5-6 pattern); jump out of the crack to carry
     on instead · skill = THE RIM SPIRE (S10): at the top of the
     horseshoe, a full-height jump onto a one-tile spire (hat, 253,1).
   Look: borrows Raptor Canyon (theme 65): an orange sky, red-brown
     canyon walls, sandy tops.
   Bubble beats for ER-4 (not wired): c2 Robin: "Horseshoe Canyon. Look
     at those stripes!" · c11 Kinan: "Every stripe is a different time,
     right?" · c106 checkpoint, a hiker: "What do you call a dinosaur
     with a big vocabulary? A thesaurus!" · c144 Kinan: "There's a cold
     wind coming out of that crack..." · c253 "Top of the horseshoe!" ·
     c310 Shad: "Glitchy's heading back to town. To the river, I bet."
   ENGINE REQUESTS: a striped canyon-wall skin (red, grey and cream
     layers) on the 1:1 slopes · a dark crack skin for THE CANYON CRACK
     and a cave-door skin for its secret exit · a nest skin for the
     shelf · bubbles ER-4.
   ============================================================ */
KinanLevels.register({
  id: '6-7', world: 6, slot: 8, kind: 'level',
  name: 'HORSESHOE CANYON',
  theme: 65,   /* Raptor Canyon: an orange sky, red-brown canyon walls, sandy tops */
  cols: 324,
  heights: [
    /* S1 0-26 THE LOOKOUT on the rim, the stairs down the wall (c9-12), a 3-wide gap c19-21 on the canyon floor */
    128,128,128,128,128,128,128,128,128,144,160,176,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,
    /* S2 27-53 the first striped wall (c29-32, 4 high), a 3-wide gap c37-39 on top, back down (c44-47) */
    192,192,176,160,144,128,128,128,128,128,null,null,null,128,128,128,128,144,160,176,192,192,192,192,192,192,192,
    /* S3 54-80 the hoodoo floor: a rock ledge (c58-60), a 3-wide gap c70-72 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,
    /* S4 81-107 the bench wall (c87-89), a 3-wide gap c94-96 on the bench, down (c102-104) · the checkpoint */
    192,192,192,192,192,192,176,160,144,144,144,144,144,null,null,null,144,144,144,144,144,160,176,192,192,192,192,
    /* S5 108-134 THE STRIPED WALL: six high (c110-115), THE EAGLE'S NEST out over the floor, a 4-wide gap c121-124 on top, down (c129-134) */
    192,192,176,160,144,128,112,96,96,96,96,96,96,null,null,null,null,96,96,96,96,112,128,144,160,176,192,
    /* S6 135-161 the high bench and THE CANYON CRACK (c144-145, three deep) · a 4-wide gap c151-154 */
    192,192,176,160,160,160,176,192,208,208,208,192,176,160,160,160,null,null,null,null,160,160,160,160,160,160,160,
    /* S7 162-188 the narrows: down (c162-163), a 4-wide gap c172-175, the overhang */
    160,160,176,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S8 189-215 the high trail: up (c192-195), 4-wide gaps c199-202 and c206-209 */
    192,192,192,176,160,144,128,128,128,128,null,null,null,null,128,128,128,null,null,null,null,128,128,128,128,128,128,
    /* S9 216-242 down to the canyon floor (c217-222): 5-wide gaps c223-227 and c231-235, a 4-wide gap c239-242 between hoodoos */
    128,144,160,176,192,192,192,null,null,null,null,null,192,192,192,null,null,null,null,null,192,192,192,null,null,null,null,
    /* S10 243-269 THE HORSESHOE: six high (c246-251), the rim (c252-255) and THE RIM SPIRE, 5-wide gaps c256-260 and c264-268 */
    192,192,192,176,160,144,128,112,96,96,96,96,96,null,null,null,null,null,96,96,96,null,null,null,null,null,96,
    /* S11 270-296 the rim trail: a 5-wide gap c274-278, down (c283-286), a 4-wide gap c290-293 */
    96,96,96,96,null,null,null,null,null,96,96,96,96,112,128,144,160,160,160,160,null,null,null,null,160,160,160,
    /* S12 297-323 reward: the rim parking lot, the gift row, Dad's truck */
    160,160,160,168,176,184,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [58, 9, 60, 11],   /* S3 the rock ledge on the hoodoo floor */
    [141, 10, 143, 12],   /* S6 the bench rock on both sides of THE CANYON CRACK */
    [146, 10, 148, 12],   /* S6 */
    [180, 8, 186, 8]   /* S7 the narrows' overhang */
  ],
  tiles: {
    gift: [
      [5, 4, 'popper'],   /* S1 */
      [51, 8],   /* S2 */
      [64, 8],   /* S3 */
      [84, 8],   /* S4 */
      [145, 9, 'gold'],   /* S6 THE CANYON CRACK: the glinting rock (hidden + the secret exit) */
      [167, 8],   /* S7 */
      [196, 4],   /* S8 */
      [220, 8],   /* S9 */
      [245, 8],   /* S10 */
      [302, 8, 'heart'], [304, 8], [306, 8, 'cake']   /* S12 */
    ],
    brick: [
      [4, 4], [6, 4],   /* S1 */
      [50, 8], [52, 8],   /* S2 */
      [63, 8], [65, 8],   /* S3 */
      [166, 8], [168, 8],   /* S7 */
      [195, 4], [197, 4],   /* S8 */
      [303, 8], [305, 8]   /* S12 */
    ],
    shelf: [
      [107, 5],   /* S5 THE EAGLE'S NEST (visible secret) */
      [108, 5],   /* S5 */
      [253, 2]   /* S10 THE RIM SPIRE (skill secret) */
    ]
  },
  /* gophers and ground squirrels on the floor, baby raptors in the narrows, magpies and crows riding the canyon wind */
  foes: [
    [16, 11, 'gopher'],   /* S1 */
    [50, 11, 'squirrel'],   /* S2 */
    [55, 11, 'gopher'], [68, 5, 'crow'],   /* S3 */
    [84, 11, 'squirrel'], [100, 4, 'magpie'],   /* S4 */
    [112, 4, 'crow'], [123, 3, 'magpie'],   /* S5 */
    [149, 4, 'magpie'],   /* S6 */
    [168, 11, 'babydino'], [175, 5, 'crow'], [184, 11, 'raccoon'],   /* S7 */
    [190, 11, 'babydino'], [201, 4, 'magpie'], [208, 3, 'crow'],   /* S8 */
    [224, 5, 'magpie'], [232, 5, 'crow'], [240, 5, 'magpie'],   /* S9 */
    [244, 11, 'squirrel'], [259, 6, 'magpie'], [267, 6, 'magpie'],   /* S10 */
    [281, 5, 'magpie'], [292, 6, 'crow'],   /* S11 */
    [305, 11, 'gopher']   /* S12 */
  ],
  candles: [
    [2, 7], [4, 7], [6, 7], [8, 7], [10, 8], [11, 9], [12, 10], [18, 11], [19, 9], [20, 8], [21, 8], [22, 9], [23, 11], [24, 11],
    [25, 11], [26, 11], [29, 10], [30, 9], [31, 8], [33, 7], [34, 7], [35, 7], [36, 7], [37, 5], [38, 4], [39, 4], [40, 5], [41, 7],
    [42, 7], [43, 7], [44, 7], [45, 8], [46, 9], [48, 11], [50, 11], [52, 11], [54, 11], [55, 11], [56, 11], [57, 11], [58, 8], [59, 8],
    [60, 8], [61, 11], [63, 11], [65, 11], [67, 11], [69, 11], [70, 9], [71, 8], [72, 8], [73, 9], [74, 11], [75, 11], [76, 11], [77, 11],
    [78, 11], [79, 11], [80, 11], [82, 11], [83, 11], [84, 11], [85, 11], [86, 11], [87, 10], [88, 9], [89, 8], [90, 8], [91, 8], [92, 8],
    [93, 8], [94, 6], [95, 5], [96, 5], [97, 6], [98, 8], [99, 8], [100, 8], [101, 8], [102, 8], [103, 9], [104, 10], [109, 11], [110, 10],
    [111, 9], [112, 8], [113, 7], [114, 6], [115, 5], [116, 5], [117, 5], [118, 5], [119, 5], [120, 5], [121, 3], [122, 2], [123, 2], [124, 2],
    [125, 3], [126, 5], [127, 5], [128, 5], [129, 5], [130, 6], [131, 7], [132, 8], [133, 9], [135, 11], [136, 11], [137, 10], [138, 9], [139, 9],
    [140, 9], [144, 8], [145, 7], [149, 9], [150, 9], [151, 7], [152, 6], [153, 6], [154, 6], [155, 7], [156, 9], [157, 9], [158, 9], [159, 9],
    [160, 9], [161, 9], [162, 9], [163, 9], [164, 9], [165, 10], [166, 11], [167, 11], [168, 11], [169, 11], [171, 11], [172, 9], [173, 8], [174, 8],
    [175, 8], [176, 9], [177, 11], [178, 11], [180, 11], [182, 11], [184, 11], [186, 11], [188, 11], [190, 10], [191, 9], [192, 8], [193, 7], [194, 7],
    [195, 7], [196, 7], [197, 7], [198, 7], [199, 5], [200, 4], [201, 4], [202, 4], [203, 5], [204, 7], [205, 7], [206, 5], [207, 4], [208, 4],
    [209, 4], [210, 5], [211, 7], [212, 7], [213, 7], [214, 7], [215, 7], [217, 7], [218, 8], [219, 9], [220, 10], [221, 11], [222, 11], [223, 9],
    [224, 8], [225, 8], [226, 8], [227, 9], [228, 11], [229, 11], [230, 11], [231, 9], [232, 8], [233, 8], [234, 8], [235, 9], [236, 11], [237, 11],
    [238, 11], [239, 9], [240, 8], [241, 8], [242, 9], [243, 11], [246, 10], [247, 9], [248, 8], [249, 7], [250, 6], [251, 5], [252, 5], [253, 5],
    [254, 5], [255, 5], [256, 4], [257, 3], [258, 3], [259, 3], [260, 4], [261, 5], [262, 5], [263, 5], [264, 4], [265, 3], [266, 3], [267, 3],
    [268, 4], [269, 5], [270, 5], [271, 5], [272, 5], [273, 5], [274, 4], [275, 3], [276, 3], [277, 3], [278, 4], [279, 5], [280, 5], [281, 5],
    [282, 5], [283, 5], [284, 6], [285, 7], [286, 8], [287, 9], [288, 9], [289, 9], [290, 7], [291, 6], [292, 6], [293, 6], [294, 7], [295, 9],
    [297, 9], [298, 9], [299, 9], [304, 11], [306, 11], [308, 11], [310, 11], [312, 11], [314, 11], [316, 11], [318, 11], [320, 11]
  ],
  secrets: [
    { kind: 'visible', col: 108, row: 4, prize: 'heart+candles' },   /* THE EAGLE'S NEST: from the wall, a full jump back out to it */
    { kind: 'hidden', col: 145, row: 9, prize: 'GOLDEN CANDLE + the secret exit', glint240: true, exit: '6-secret' },   /* THE CANYON CRACK: drop in, bump the glinting rock, walk through the door */
    { kind: 'skill', col: 253, row: 1, prize: 'hat' }   /* THE RIM SPIRE: a full-height jump onto the one-tile spire */
  ],
  goldenCandle: { col: 145, row: 9 },
  checkpoint: { col: 106, row: 11 },
  spawn: { col: 2, row: 7 },
  goal: { col: 318, row: 11 }   /* Dad's truck in the rim parking lot */
});

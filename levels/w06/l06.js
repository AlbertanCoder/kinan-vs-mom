/* ============================================================
   LEVEL 6-6 · THE RIVER FERRY
   (World 6 · Drumheller · trail stop 7)
   Story bible (World 6 table): "A cable ferry across the Red Deer
   River." West of town the road just runs into the river, and a little
   ferry carries cars across, pulled along a steel cable stretched from
   bank to bank. Glitchy rode it over. The ferry's on the far side, so
   Kinan crosses the way the geese do: sandbar to sandbar, then onto
   the ferry when it swings back, then over the rapids.
   Idea (ONE): THE LOW CROSSING. The river is crossed on the sandbars,
     a tile below the banks, and the fish leap out of the water beside
     them. Act 1 teaches it (the ferry landing, the first sandbars 3/3,
     the ramp 3/3); act 2 twists it (THE FERRY itself, up onto the deck
     over a 4-wide channel and off it; midriver sandbars 4/4/4; the far
     bank 4; the river trail 4/4); act 3 tests it (THE RAPIDS, rock to
     rock over three 5-wide chutes; the old cable towers 5/5/4; the beach
     5).
   Acts (thirds): 0-107 teach (the Dinosaur Trail road 3, the sandbars
     3/3, the ferry landing 3/3, the ferry office 3, the checkpoint) ·
     108-215 twist (THE FERRY 4/4, midriver 4/4/4, the cable anchor 4,
     the river trail 4/4) · 216-323 test (THE RAPIDS 5/5/5, the cable
     towers 5/5/4, the beach 5, the campground).
   Signature set-piece: THE FERRY (S5): a 4-wide channel up onto the
     ferry's deck, over the pickup truck riding on it, and off the far
     end into another 4-wide channel.
   Secrets: visible = THE FERRY CABLE (S5): the steel cable hangs over the
     deck; climb onto the truck's roof and make a full jump up to it,
     where a heart rides along (heart + candles, 123,4) · hidden = THE
     CABLE ANCHOR (S7): over the far bank's anchor one block glints
     (GOLDEN CANDLE, 168,7) · skill = THE COTTONWOOD (S12): climb the old
     cottonwood's branches, right, right, then back left to the top
     (hat, 300,1).
   Look: borrows Brachiosaurus River (theme 64): a blue sky, green banks,
     a wide river.
   Bubble beats for ER-4 (not wired): c2 Robin: "The ferry's on the
     OTHER side. Of course it is." · c34 Kinan: "Sandbars! I can cross
     on the sandbars!" · c100 checkpoint, the ferry operator: "Why did
     the fish blush? Because it saw the river's bottom!" · c118 Shad:
     "Hop on, bud, the ferry's back!" · c222 Chenoa: "Those are RAPIDS.
     Be careful!" · c300 "I can see the whole river from up here."
   ENGINE REQUESTS: a moving cable ferry (a deck that rides the cable
     from bank to bank, carrying Kinan and the truck; today it's a fixed
     raised deck) · river water drawn in the channels and around the
     sandbars, rapids foam · a ferry-cable skin for the shelf line and a
     cottonwood skin for the branch shelves · bubbles ER-4.
   ============================================================ */
KinanLevels.register({
  id: '6-6', world: 6, slot: 7, kind: 'level',
  name: 'THE RIVER FERRY',
  theme: 64,   /* Brachiosaurus River: a blue sky, green banks, a wide river */
  cols: 324,
  heights: [
    /* S1 0-26 the Dinosaur Trail road: a rise (c6-10), a 3-wide washout c14-16 */
    192,192,192,192,192,192,184,176,176,176,176,184,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 the riverbank: the first sandbars (c34-38, c42-45), a tile low, over 3-wide channels c31-33 and c39-41 */
    192,192,192,192,null,null,null,208,208,208,208,208,null,null,null,208,208,208,208,200,192,192,192,192,192,192,192,
    /* S3 54-80 the ferry landing: the ramp down (c59-60), 3-wide channels c64-66 and c73-75 around a sandbar (c67-72) */
    192,192,192,192,192,200,208,208,208,208,null,null,null,208,208,208,208,208,208,null,null,null,192,192,192,192,192,
    /* S4 81-107 the ferry office: a 3-wide channel c89-91 · the checkpoint */
    192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 THE FERRY: a 4-wide channel c111-114 up onto the deck (c115-126), the pickup truck on it, a 4-wide channel c127-130 off the end */
    192,192,192,null,null,null,null,176,176,176,176,176,176,176,176,176,176,176,176,null,null,null,null,192,192,192,192,
    /* S6 135-161 midriver: sandbars (c141-144, c149-152) over 4-wide channels c137-140, c145-148, c153-156 */
    192,192,null,null,null,null,208,208,208,208,null,null,null,null,208,208,208,208,null,null,null,null,192,192,192,192,192,
    /* S7 162-188 the far bank: up to THE CABLE ANCHOR (c168-170), a 4-wide channel c171-174, a ledge, down */
    192,192,192,192,184,176,176,176,176,null,null,null,null,176,176,176,184,192,192,192,192,192,192,192,192,192,192,
    /* S8 189-215 the river trail: 4-wide backwaters c195-198 and c205-208 */
    192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,
    /* S9 216-242 THE RAPIDS: rocks (c223-225, c231-233) between 5-wide chutes c218-222, c226-230, c234-238 */
    192,192,null,null,null,null,null,192,192,192,null,null,null,null,null,192,192,192,null,null,null,null,null,192,192,192,192,
    /* S10 243-269 the old cable towers: 5-wide gaps c246-250 and c254-258, a 4-wide gap c262-265 */
    192,192,192,null,null,null,null,null,176,176,176,null,null,null,null,null,176,176,176,null,null,null,null,192,192,192,192,
    /* S11 270-296 the beach: a 5-wide channel c275-279, the sand */
    192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S12 297-323 reward: the campground, THE COTTONWOOD (c300-304), the gift row, Dad's truck */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [119, 9, 121, 10],   /* S5 the pickup truck riding the ferry */
    [310, 10, 311, 11]   /* S12 the picnic table */
  ],
  open: [[19, 13, 21, 13]],   /* SLAM SPOT (butt slam, 2026-10-29): the pocket under the cracked boards, solid floor under it */
  tiles: {
    crack: [[19, 12], [20, 12], [21, 12]],   /* SLAM SPOT: cracked floorboards over a pocket of candles (a bonus, never needed) */
    gift: [
      [4, 8, 'popper'],   /* S1 */
      [50, 8],   /* S2 */
      [84, 8], [98, 8],   /* S4 */
      [168, 7, 'gold'],   /* S7 THE CABLE ANCHOR: the glinting block (hidden) */
      [185, 8],   /* S7 */
      [202, 8],   /* S8 */
      [289, 8],   /* S11 */
      [306, 8, 'heart'],   /* S12 the gift row */
      [308, 8, 'umbrella']   /* S12 */
    ],
    brick: [
      [3, 8], [5, 8],   /* S1 */
      [49, 8], [51, 8],   /* S2 */
      [97, 8], [99, 8],   /* S4 */
      [184, 8], [186, 8],   /* S7 */
      [201, 8], [203, 8],   /* S8 */
      [288, 8], [290, 8],   /* S11 */
      [307, 8]   /* S12 */
    ],
    shelf: [
      [120, 5],   /* S5 THE FERRY CABLE (visible secret): a full jump from the truck's roof */
      [121, 5], [122, 5], [123, 5], [124, 5], [125, 5],   /* S5 */
      [300, 8],   /* S12 THE COTTONWOOD's branches (skill secret) */
      [300, 2], [301, 8], [301, 2], [303, 5], [304, 5]   /* S12 */
    ]
  },
  /* frogs on the banks, fish leaping on the shore, geese, mosquitoes and magpies over the water; nothing waits on a sandbar */
  foes: [
    [21, 11, 'gopher'],   /* S1 */
    [50, 11, 'puddlefrog'],   /* S2 */
    [57, 11, 'puddlefrog'],   /* S3 */
    [85, 4, 'goose'], [103, 11, 'flyingfish'],   /* S4 */
    [113, 5, 'goose'], [130, 4, 'mosquito'],   /* S5 */
    [147, 5, 'magpie'], [155, 6, 'mosquito'],   /* S6 */
    [164, 11, 'puddlefrog'], [183, 11, 'flyingfish'],   /* S7 */
    [192, 11, 'puddlefrog'], [207, 5, 'goose'], [214, 11, 'flyingfish'],   /* S8 */
    [221, 5, 'goose'], [229, 5, 'mosquito'], [237, 6, 'magpie'],   /* S9 */
    [248, 4, 'goose'], [256, 5, 'mosquito'], [264, 5, 'magpie'],   /* S10 */
    [279, 5, 'goose'], [287, 11, 'puddlefrog'],   /* S11 */
    [305, 11, 'flyingfish']   /* S12 */
  ],
  candles: [[19, 13], [20, 13], [21, 13],
    [2, 11], [3, 11], [4, 11], [5, 11], [7, 10], [8, 10], [9, 10], [13, 11], [14, 9], [15, 8], [16, 8], [17, 9], [18, 11], [19, 11],
    [21, 11], [23, 11], [25, 11], [30, 11], [31, 9], [32, 8], [33, 8], [34, 9], [35, 11], [36, 12], [37, 12], [38, 12], [39, 10], [40, 9],
    [41, 9], [42, 10], [43, 12], [44, 12], [45, 12], [48, 11], [50, 11], [52, 11], [59, 11], [60, 11], [61, 12], [62, 12], [63, 12], [64, 10],
    [65, 9], [66, 9], [67, 10], [68, 12], [69, 12], [70, 12], [71, 12], [72, 12], [72, 11], [73, 9], [74, 8], [75, 8], [76, 9], [77, 11],
    [78, 11], [79, 11], [80, 11], [82, 11], [83, 11], [84, 11], [85, 11], [86, 11], [87, 11], [88, 11], [89, 9], [90, 8], [91, 8], [92, 9],
    [93, 11], [94, 11], [97, 11], [100, 11], [103, 11], [106, 11], [110, 11], [111, 9], [112, 8], [113, 8], [114, 8], [115, 9], [116, 10], [117, 10],
    [118, 10], [119, 8], [120, 8], [121, 8], [120, 4], [121, 4], [122, 4], [123, 4], [124, 4], [125, 4], [126, 10], [127, 8], [128, 7], [129, 7],
    [130, 7], [131, 8], [132, 10], [133, 11], [134, 11], [136, 11], [137, 9], [138, 8], [139, 8], [140, 8], [141, 9], [142, 11], [143, 12], [144, 12],
    [145, 10], [146, 9], [147, 9], [148, 9], [149, 10], [150, 12], [151, 12], [152, 12], [152, 11], [153, 9], [154, 8], [155, 8], [156, 8], [157, 9],
    [158, 11], [159, 11], [160, 11], [161, 11], [162, 11], [163, 11], [164, 11], [165, 11], [166, 10], [167, 10], [170, 10], [171, 8], [172, 7], [173, 7],
    [174, 7], [175, 8], [176, 10], [177, 10], [178, 10], [179, 10], [180, 11], [182, 11], [184, 11], [186, 11], [188, 11], [194, 11], [195, 9], [196, 8],
    [197, 8], [198, 8], [199, 9], [200, 11], [201, 11], [202, 11], [203, 11], [204, 11], [205, 9], [206, 8], [207, 8], [208, 8], [209, 9], [210, 11],
    [211, 11], [213, 11], [215, 11], [217, 11], [218, 9], [219, 8], [220, 8], [221, 8], [222, 9], [223, 11], [224, 11], [225, 11], [226, 9], [227, 8],
    [228, 8], [229, 8], [230, 9], [231, 11], [232, 11], [233, 11], [234, 9], [235, 8], [236, 8], [237, 8], [238, 9], [239, 11], [240, 11], [241, 11],
    [242, 11], [245, 11], [246, 9], [247, 8], [248, 8], [249, 8], [250, 9], [251, 10], [252, 10], [253, 10], [254, 8], [255, 7], [256, 7], [257, 7],
    [258, 8], [259, 10], [260, 10], [261, 10], [262, 8], [263, 7], [264, 7], [265, 7], [266, 8], [267, 10], [268, 11], [269, 11], [271, 11], [272, 11],
    [273, 11], [274, 11], [275, 9], [276, 8], [277, 8], [278, 8], [279, 9], [280, 11], [281, 11], [283, 11], [285, 11], [287, 11], [289, 11], [291, 11],
    [293, 11], [295, 11], [298, 11], [299, 11], [300, 7], [301, 7], [303, 4], [304, 4], [306, 7], [308, 7], [310, 7], [313, 11], [314, 11], [315, 11],
    [316, 11], [317, 11], [318, 11]
  ],
  secrets: [
    { kind: 'visible', col: 123, row: 4, prize: 'heart+candles' },   /* THE FERRY CABLE: from the truck's roof, a full jump up to the cable */
    { kind: 'hidden', col: 168, row: 7, prize: 'GOLDEN CANDLE', glint240: true },   /* THE CABLE ANCHOR: the glinting block over the anchor */
    { kind: 'skill', col: 300, row: 1, prize: 'hat' }   /* THE COTTONWOOD: right, right, then back left to the top */
  ],
  goldenCandle: { col: 168, row: 7 },
  checkpoint: { col: 100, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 320, row: 11 }   /* Dad's truck at the campground */
});

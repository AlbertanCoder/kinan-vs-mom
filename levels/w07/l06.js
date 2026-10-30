/* ============================================================
   LEVEL 7-6 · GRANVILLE ISLAND
   (World 7 · Vancouver · trail stop 8)
   Story bible (World 7 table): "A market built on the docks over False
   Creek; pulleys and boats." Down from the mountain, a little ferry
   drops the family at Granville Island: a market on the docks under
   the big bridge, fruit stalls with striped awnings, boats tied up
   everywhere, the old painted silos, and buskers playing for coins.
   Glitchy ran through the market and out along the docks.
   Idea (ONE): THE AWNINGS. Every market shed has a striped canvas
     awning: land on it from above, or jump up through it from below.
     Stack two and you are on the roof. Act 1 teaches it (a low shed,
     the public market's awning and roof, the first boats, THE NET LOFT
     with two awnings up and one down, the checkpoint); act 2 twists it
     (roof to roof across a water channel, the houseboat, THE PAINTED
     SILOS, the boat rentals 4/4/4); act 3 tests it (the water-taxi dock
     5/5, the kids market and its crane, the bridge pilings 5/4).
   Acts (thirds): 0-107 teach (the ferry dock 2, the public market 3, the
     boats 3/3/2, THE NET LOFT, the checkpoint) · 108-215 twist (the
     boat sheds and their 4-wide channel, the houseboat 4/3/4, THE
     PAINTED SILOS and a 4-wide gap, the boat rentals 4/4/4) · 216-323
     test (the water-taxi dock 5/5, THE CRANE HOOK 5, the bridge
     pilings 5/4, the market entrance).
   Signature set-piece: THE PAINTED SILOS (S7): five painted cement silos
     in a row like a giant staircase, up three tiles at a time to the
     top of the tallest one and down the other side.
   Secrets: visible = THE SILO JUMP (S7): a candle arc leads off the top
     of the tallest silo, out over the water to a high awning with a
     heart; a long running jump (or an umbrella float) (heart + candles,
     177,3) · hidden = THE HOUSEBOAT (S6): jump over the houseboat's
     cabin, then walk back into the glinting board on its back wall
     (GOLDEN CANDLE, 153,11) · skill = THE CRANE HOOK (S10): bounce off
     the kids market's springboard and catch the old crane's hook way
     up high (hat, 269,1).
   Gaps: act 1 2/3/3/3/2 · act 2 4/4/3/4/4/4/4/4 · act 3 5/5/5/5/4.
     Every gap has a candle arc; nothing waits at a lip; the boats are
     4 wide; every drop off a roof lands on an awning or is 4 tiles.
   Memory (story bible, age 7): the foam block pickaxe, from a Granville
     Island toy stall: the kids market shed (S10, c258-262) is the toy
     stall, and Kinan remembers it as he gets there (story bubble at c255).
   Look: borrows Granville Island Market (theme 46): the bridge
     overhead, the market sheds, boats, fruit stalls, rain.
   TWIST (wired 2026-10-28): PULLEYS: rope platform pairs (one sinks,
     its partner rises) and a drifting water taxi (see pulleys and
     boats below).
   ENGINE REQUESTS (still open): striped-awning skins for the shelves and
     market-shed skins for the shed blocks · the painted giants on the
     silo blocks · water under the docks' gaps.
   ============================================================ */
KinanLevels.register({
  id: '7-6', world: 7, slot: 8, kind: 'level',
  name: 'GRANVILLE ISLAND',
  theme: 46,   /* Granville Island Market: the bridge overhead, market sheds, boats, fruit stalls, rain */
  cols: 324,
  /* PULLEYS (wired 2026-10-28): pairs of striped rope platforms on one rope over two wheels. Stand on one and it
     sinks (1.5 tiles at most) while its partner rises; get off and they ease back level. Teach (S4, on dry ground):
     ride one down so its partner rises, hop across and jump from up there to bump the gift up high · twist (S8, the
     boat rentals): a pair hangs in the first two gaps at dock height · test (S9, the water-taxi dock): a pair in the
     two 5-wide gaps · and a water taxi drifts to and fro in the bridge pilings' 5-wide gap (S11). */
  pulleys: [[96, 9, 99, 9, 2, 1.5], [194, 11, 202, 11, 2, 1.5], [222, 11, 235, 11, 2, 1.5]],
  boats: [[274, 278, 11, 2, 0.4]],
  heights: [
    /* S1 0-26 the ferry dock: a 2-wide gap c9-10, a low shed (c17-21) */
    176,176,176,176,176,176,176,176,176,null,null,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,
    /* S2 27-53 the public market: its awning (c31-32) and roof (c33-40), a 3-wide gap c44-46 */
    176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,null,null,null,176,176,176,176,176,176,176,
    /* S3 54-80 the boats (4 wide, a step down): gaps c57-59, c64-66, c71-72 */
    176,176,176,null,null,null,192,192,192,192,null,null,null,192,192,192,192,null,null,176,176,176,176,176,176,176,176,
    /* S4 81-107 THE NET LOFT: two awnings up the near side (c84-85), the roof (c86-93), one down (c94-95) · the checkpoint */
    176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,
    /* S5 108-134 the boat sheds: up the awning (c110-111), roof to roof across a 4-wide channel c118-121 */
    176,176,176,176,176,176,176,176,176,176,null,null,null,null,176,176,176,176,176,176,176,176,176,176,176,176,176,
    /* S6 135-161 the houseboat: a 4-wide gap c138-141, a boat, a 3-wide gap c146-148, THE HOUSEBOAT (c149-154), a 4-wide gap c155-158 */
    176,176,176,null,null,null,null,192,192,192,192,null,null,null,192,192,192,192,192,192,null,null,null,null,176,176,176,
    /* S7 162-188 THE PAINTED SILOS (c164-173), THE SILO JUMP, a 4-wide gap c177-180 */
    176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,null,null,null,null,176,176,176,176,176,176,176,176,
    /* S8 189-215 the boat rentals: 4-wide gaps c193-196, c201-204, c209-212 between boats */
    176,176,176,176,null,null,null,null,192,192,192,192,null,null,null,null,192,192,192,192,null,null,null,null,176,176,176,
    /* S9 216-242 the water-taxi dock: 5-wide gaps c221-225 and c234-238 */
    176,176,176,176,176,null,null,null,null,null,176,176,176,176,176,176,176,176,null,null,null,null,null,176,176,176,176,
    /* S10 243-269 the kids market: a 5-wide gap c247-251, a shed (c258-262), THE CRANE HOOK and its springboard */
    176,176,176,176,null,null,null,null,null,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,
    /* S11 270-296 the bridge pilings: a 5-wide gap c274-278, a 4-wide gap c283-286 */
    176,176,176,176,null,null,null,null,null,176,176,176,176,null,null,null,null,176,176,176,176,176,176,176,176,176,176,
    /* S12 297-323 reward: the market entrance, the gift row, the way to the silver dome */
    176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176
  ],
  solid: [
    [17, 8, 21, 10],   /* S1 a low shed (jump straight onto it) */
    [33, 7, 40, 10],   /* S2 the public market's shed */
    [86, 5, 93, 10],   /* S4 THE NET LOFT */
    [112, 7, 117, 10], [122, 7, 127, 10],   /* S5 the boat sheds either side of the channel */
    [151, 9, 153, 11],   /* S6 THE HOUSEBOAT's cabin */
    [164, 8, 165, 10], [166, 5, 167, 10], [168, 2, 169, 10], [170, 5, 171, 10], [172, 8, 173, 10],   /* S7 THE PAINTED SILOS */
    [258, 7, 262, 10]   /* S10 the kids market shed */
  ],
  open: [[12, 12, 14, 12]],   /* SLAM SPOT (butt slam, 2026-10-29): the pocket under the cracked dock boards, solid floor under it */
  tiles: {
    crack: [[12, 11], [13, 11], [14, 11]],   /* SLAM SPOT: cracked dock boards over a pocket of candles (a bonus, never needed) */
    gift: [
      [4, 7, 'umbrella'], [24, 7],   /* S1 the umbrella (the market's rain gear) */
      [29, 7], [37, 3],   /* S2 */
      [77, 7],   /* S3 */
      [89, 1], [104, 7],   /* S4 */
      [100, 3],   /* S4 the pulley gift: only a jump off the risen pulley platform reaches it */
      [108, 7], [114, 3], [125, 3],   /* S5 */
      [153, 11, 'gold'],   /* S6 THE HOUSEBOAT: the glinting board on the cabin's back wall (hidden) */
      [184, 7],   /* S7 */
      [190, 7],   /* S8 */
      [231, 7],   /* S9 */
      [253, 7],   /* S10 */
      [290, 7],   /* S11 */
      [303, 7, 'heart'], [305, 7], [307, 7, 'cake']   /* S12 the gift row */
    ],
    brick: [
      [3, 7], [5, 7],   /* S1 */
      [103, 7], [105, 7],   /* S4 */
      [304, 7], [306, 7]   /* S12 */
    ],
    spring: [
      [266, 10]   /* S10 the kids market's springboard (skill secret) */
    ],
    shelf: [
      [31, 8], [32, 8], [41, 8], [42, 8],   /* S2 the public market's awnings */
      [84, 8], [85, 8], [84, 5], [85, 5], [94, 8], [95, 8],   /* S4 THE NET LOFT's awnings */
      [110, 8], [111, 8], [128, 8], [129, 8],   /* S5 the boat sheds' awnings */
      [176, 4], [177, 4],   /* S7 THE SILO JUMP's high awning (visible secret) */
      [256, 8], [257, 8], [263, 8], [264, 8],   /* S10 the kids market's awnings */
      [268, 2], [269, 2]   /* S10 THE CRANE HOOK (skill secret) */
    ]
  },
  /* seagulls over the water, puddle frogs and leaping fish on the boats, buskers playing on the roofs and docks; nothing waits at a lip */
  foes: [
    [13, 7, 'seagull'],   /* S1 */
    [36, 6, 'busker'],   /* S2 on the market roof */
    [61, 11, 'puddlefrog'],   /* S3 */
    [98, 10, 'puddlefrog'],   /* S4 */
    [115, 6, 'busker'], [120, 4, 'seagull'],   /* S5 */
    [143, 11, 'puddlefrog'], [147, 6, 'seagull'],   /* S6 */
    [178, 4, 'seagull'], [183, 10, 'busker'],   /* S7 */
    [198, 11, 'puddlefrog'], [206, 11, 'flyingfish'],   /* S8 */
    [223, 6, 'seagull'], [229, 10, 'busker'], [236, 6, 'seagull'],   /* S9 */
    [249, 6, 'seagull'], [254, 10, 'puddlefrog'], [260, 6, 'busker'],   /* S10 */
    [276, 6, 'seagull'], [280, 10, 'puddlefrog'], [285, 6, 'seagull'], [292, 10, 'busker'],   /* S11 */
    [312, 10, 'puddlefrog']   /* S12 */
  ],
  candles: [[12, 12], [13, 12], [14, 12],
    [1, 10], [2, 10], [6, 10], [7, 10], [8, 9], [9, 8], [10, 8], [11, 9], [12, 10], [14, 10], [15, 10], [16, 9], [17, 7], [18, 7],
    [19, 7], [20, 7], [21, 7], [22, 9], [23, 10], [25, 10], [26, 10], [27, 10], [28, 10], [30, 10], [31, 7], [32, 7], [33, 6], [34, 6],
    [38, 6], [39, 6], [40, 6], [41, 7], [42, 7], [43, 9], [44, 8], [45, 7], [46, 8], [47, 9], [48, 10], [49, 10], [51, 10], [52, 10],
    [53, 10], [54, 10], [55, 10], [56, 9], [57, 8], [58, 7], [59, 8], [60, 9], [62, 10], [63, 10], [64, 9], [65, 8], [66, 9], [67, 10],
    [68, 11], [69, 11], [70, 10], [71, 9], [72, 9], [73, 10], [74, 10], [75, 10], [79, 10], [80, 10], [81, 10], [82, 10], [83, 10], [84, 7],
    [85, 7], [84, 4], [85, 4], [86, 4], [87, 4], [88, 4], [90, 4], [91, 4], [92, 4], [93, 4], [94, 7], [95, 7], [96, 9], [97, 10],
    [100, 10], [102, 10], [106, 10], [107, 10], [109, 10], [110, 7], [111, 7], [112, 6], [113, 6], [116, 6], [117, 6], [118, 5], [119, 4], [120, 4],
    [121, 5], [122, 6], [123, 6], [124, 6], [126, 6], [127, 6], [128, 7], [129, 7], [130, 9], [131, 10], [132, 10], [133, 10], [134, 10], [135, 10],
    [136, 10], [137, 9], [138, 8], [139, 7], [140, 7], [141, 8], [142, 9], [144, 10], [145, 10], [146, 9], [147, 8], [148, 9], [149, 10], [150, 10],
    [151, 8], [152, 8], [153, 8], [154, 9], [155, 8], [156, 7], [157, 7], [158, 8], [159, 9], [160, 10], [161, 10], [162, 10], [163, 10], [164, 7],
    [165, 7], [166, 4], [167, 4], [168, 1], [169, 1], [170, 1], [171, 2], [172, 2], [173, 2], [174, 3], [175, 3], [170, 4], [171, 4], [172, 7],
    [173, 7], [174, 10], [175, 10], [176, 9], [177, 8], [178, 7], [179, 7], [180, 8], [181, 9], [182, 10], [185, 10], [186, 10], [187, 10], [188, 10],
    [189, 10], [191, 10], [192, 9], [193, 8], [194, 7], [195, 7], [196, 8], [197, 9], [199, 10], [200, 10], [201, 9], [202, 8], [203, 8], [204, 9],
    [205, 10], [207, 10], [208, 10], [209, 9], [210, 8], [211, 8], [212, 9], [213, 10], [214, 10], [215, 10], [216, 10], [217, 10], [218, 10], [219, 10],
    [220, 9], [221, 8], [222, 7], [223, 6], [224, 7], [225, 8], [226, 9], [227, 10], [228, 10], [230, 10], [232, 10], [233, 9], [234, 8], [235, 7],
    [236, 6], [237, 7], [238, 8], [239, 9], [240, 10], [241, 10], [242, 10], [243, 10], [244, 10], [245, 10], [246, 9], [247, 8], [248, 7], [250, 7],
    [251, 8], [252, 9], [253, 10], [255, 10], [256, 7], [257, 7], [258, 6], [259, 6], [261, 6], [262, 6], [263, 7], [264, 7], [265, 9], [266, 8],
    [266, 6], [267, 4], [268, 1], [269, 10], [270, 10], [271, 10], [272, 10], [273, 9], [274, 8], [275, 7], [276, 6], [277, 7], [278, 8], [279, 9],
    [281, 10], [282, 9], [283, 8], [284, 7], [285, 7], [286, 8], [287, 9], [288, 10], [289, 10], [291, 10], [293, 10], [294, 10], [295, 10], [296, 10],
    [297, 10], [298, 10], [299, 10], [300, 10], [303, 6], [305, 6], [307, 6], [310, 10], [314, 10], [316, 10], [318, 10]
  ],
  secrets: [
    { kind: 'visible', col: 177, row: 3, prize: 'heart+candles' },   /* THE SILO JUMP: off the tallest silo, out to the high awning */
    { kind: 'hidden', col: 153, row: 11, prize: 'GOLDEN CANDLE', glint240: true },   /* THE HOUSEBOAT: walk back into the glinting board */
    { kind: 'skill', col: 269, row: 1, prize: 'hat' }   /* THE CRANE HOOK: springboard, then catch the hook */
  ],
  goldenCandle: { col: 153, row: 11 },
  checkpoint: { col: 101, row: 10 },
  spawn: { col: 2, row: 10 },
  goal: { col: 320, row: 10 },   /* the market entrance: on to the silver dome */
  /* story bubbles as Kinan passes a column: [col, who, what they say, seconds] (subtitles only) */
  talk: [
    [2, 'MOM', 'Granville Island! The market is built right on the docks. Ooh, look at those cherries...', 4],
    [28, 'KINAN', 'Awnings! I can bounce up them onto the roofs.', 3],
    [94, 'SHAD', 'Rope pulleys! Stand on one and it sinks, and its partner goes up. Ride it up to that gift!', 4.2],
    [104, 'DAD', 'Boats tied up all along the dock. Roof to roof, boat to boat, bud! Whatever floats your boat.', 4],
    [161, 'CHENOA', 'The painted silos! They look like giants!', 3],
    [243, 'SHAD', "Glitchy's heading for the big silver ball across False Creek. That's Science World!", 4],
    [255, 'KINAN', "The toy stall at the kids market! That's where I got my foam block pickaxe when I was seven!", 4.4],   /* the age-7 memory (story bible) */
    [298, 'MOM', 'I got cherries, and a fish, and a hat. The hat was on sale.', 3.4]
  ]
});

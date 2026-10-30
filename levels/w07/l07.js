/* ============================================================
   LEVEL 7-7 · SCIENCE WORLD
   (World 7 · Vancouver · trail stop 9)
   Story bible (World 7 table): "Magnets and circuits inside the silver
   dome." Across False Creek stands the giant silver ball: Science
   World. Inside: a magnet lab, a lightning coil, a planetarium with stars
   on the ceiling, and exhibits taller than Dad. Glitchy ran in through
   the front doors and he is bouncing off everything.
   Idea (ONE): MAGNET PADS. In the science dome a springboard is a
     magnet pad (red and blue poles, a humming field): step on it and it
     flings you way up. An exhibit too tall to jump always has a pad at
     its foot. Act 1 teaches it (a pad in the open with a candle column,
     then a pad up a tall exhibit; a pad up onto the mezzanine and the
     holes in its floor 3/3; the ramp down and the checkpoint); act 2
     twists it (a pad right after a gap, up and over the lightning coil;
     THE DOME: a pad over a wall, a gap, a pad over a taller wall; the
     planetarium 4/4); act 3 tests it (the body works 5/5, a pad to the
     top of the dome and a long landing runway, the exit corridor 5/4/5).
   Acts (thirds): 0-107 teach (the entrance hall, the magnet lab 3, the
     mezzanine 3/3, the ramp, the checkpoint) · 108-215 twist (THE
     LIGHTNING COIL 4/4, the circuit gallery 4/4, THE DOME 4, THE
     PLANETARIUM 4/4) · 216-323 test (the body works 5/5, THE TOP OF THE
     DOME, the exit corridor 5/4/5, the gift shop row).
   Signature set-piece: THE DOME (S7): magnet pad over a 7-high wall, a
     4-wide gap, magnet pad over an 8-high wall, all in a row.
   Secrets: visible = THE PLASMA BALL (S6): from the top of the Tesla
     coil a candle arc leads out to a ledge with a heart, high over the
     gallery; jump for it (heart + candles, 136,2) · hidden = THE
     PLANETARIUM (S8): one star in the low planetarium ceiling glints;
     jump under it (GOLDEN CANDLE, 203,7) · skill = THE TOP OF THE DOME
     (S10): ride the last pad, then jump from the exhibit top to a ledge
     right up under the dome (hat, 258,0).
   Gaps: act 1 3/3/3 · act 2 4/4/4/4/4/4/4 · act 3 5/5/5/4/5. Every gap
     has a candle arc; nothing waits at a lip; every drop off an exhibit
     lands on a step first (3 or 4 tiles down), and after every pad a
     running jump off the exhibit still lands on ground.
   Look: borrows the Science Dome (theme 47): a dim blue hall under the
     dome's triangles, grey floors; its springboards are drawn as magnet
     pads.
   TWIST (wired 2026-10-28): CIRCUITS: switches flip the red and blue
     doors, and a magnet lift pulls Kinan up (see circuit and magnets
     below).
   ENGINE REQUESTS (still open): a magnet ceiling that holds Kinan up,
     a magnet that drags metal foes · exhibit skins for the tall solid
     blocks (a lightning coil with crackling sparks, a plasma ball) · the
     planetarium's star ceiling.
   ============================================================ */
KinanLevels.register({
  id: '7-7', world: 7, slot: 9, kind: 'level',
  name: 'SCIENCE WORLD',
  theme: 47,   /* the Science Dome: a dim blue hall under the dome, grey floors; springboards are magnet pads */
  cols: 324,
  /* CIRCUITS (wired 2026-10-28): a switch (a grey box with a lightning bolt, its lamp the colour that is on) flips the
     RED blocks and the BLUE blocks: bump it from below, CLICK, the solid colour goes see-through (dashed) and the
     other one comes on. Every door has its switch hanging right in front of it, so a door is never a dead end.
     Teach (S4): the red door, its switch, and blue steps that appear · twist (S6): the circuit gallery's BLUE door
     (shut now: the first switch turned blue on) between its two gaps; its switch turns red back on · test (S9): the
     body works' red door between two 5-wide gaps, then (S11) a blue door before a 4-wide gap: each switch undoes the
     last. Every door leaves 2+ tiles of floor before the next gap (a full run by the lip) and stands where a landing
     can't reach its top · reward (S12): a magnet lift pulls Kinan up onto a shelf of candles. */
  circuit: {
    switches: [[102, 8], [149, 8], [226, 8], [280, 8]],
    red: [[103, 7], [103, 8], [103, 9], [103, 10], [103, 11], [227, 7], [227, 8], [227, 9], [227, 10], [227, 11]],
    blue: [[105, 10], [106, 9], [107, 8], [150, 7], [150, 8], [150, 9], [150, 10], [150, 11], [281, 7], [281, 8], [281, 9], [281, 10], [281, 11]]
  },
  magnets: [[315, 8, 11, 1]],
  heights: [
    /* S1 0-26 the entrance hall: a pad in the open (c8), a pad (c17) up a tall exhibit (c18-22) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 the magnet lab: a 3-wide gap c36-38, a pad (c44) up onto the mezzanine (c45-53) */
    192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,176,160,144,128,112,96,96,96,96,
    /* S3 54-80 the mezzanine: holes in its floor c59-61 and c68-70 */
    96,96,96,96,96,null,null,null,96,96,96,96,96,96,null,null,null,96,96,96,96,96,96,96,96,96,96,
    /* S4 81-107 down the ramp (c87-92) to the ground floor · the checkpoint */
    96,96,96,96,96,96,112,128,144,160,176,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 THE LIGHTNING COIL: 4-wide gaps c114-117 and c122-125, a pad (c127) up and over the coil (c128-130) */
    192,192,192,192,192,192,null,null,null,null,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 the circuit gallery: THE PLASMA BALL high above a landing runway, 4-wide gaps c143-146 and c153-156 */
    192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,
    /* S7 162-188 THE DOME: a pad (c165) up onto a 7-high wall (c166-173, wide enough to land on), a 4-wide gap c175-178, a pad (c182) over an 8-high wall (c183-185) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,
    /* S8 189-215 THE PLANETARIUM: a landing runway after the pad, 4-wide gaps c197-200 and c207-210, the low star ceiling (c202-204) */
    192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,
    /* S9 216-242 the body works: 5-wide gaps c220-224 and c231-235 */
    192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,
    /* S10 243-269 THE TOP OF THE DOME: a pad (c249) up the last exhibit (c250-254), then a long landing runway (a running jump off the exhibit or off the hat ledge lands on it with room to spare) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S11 270-296 the exit corridor: 5-wide gaps c273-277 and c292-296, a 4-wide gap c283-286 */
    192,192,192,null,null,null,null,null,192,192,192,192,192,null,null,null,null,192,192,192,192,192,null,null,null,null,null,
    /* S12 297-323 reward: the gift shop row, the doors out to the train */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [18, 7, 22, 11], [23, 9, 24, 11],   /* S1 a tall exhibit (5 high) and its step down */
    [45, 6, 50, 11],   /* S2 the mezzanine's front wall (6 high) */
    [128, 5, 130, 11], [131, 8, 132, 11],   /* S5 THE LIGHTNING COIL (7 high) and its step down */
    [166, 5, 173, 11], [174, 8, 174, 11],   /* S7 THE DOME: the first wall (7 high: a pad bounce lands on its top) and its step */
    [183, 4, 185, 11], [186, 8, 187, 11],   /* S7 the second wall (8 high) and its step */
    [202, 7, 204, 7],   /* S8 THE PLANETARIUM's low star ceiling (4 tiles of air under it) */
    [250, 4, 254, 11], [255, 8, 256, 11]   /* S10 the last exhibit (8 high) and its step */
  ],
  tiles: {
    gift: [
      [4, 8, 'popper'], [10, 8],   /* S1 */
      [30, 8], [41, 8],   /* S2 */
      [56, 2], [65, 2], [75, 2],   /* S3 */
      [97, 8],   /* S4 */
      [110, 8, 'umbrella'],   /* S5 */
      [139, 8], [158, 8],   /* S6 */
      [163, 8], [180, 8],   /* S7 */
      [191, 8], [211, 8],   /* S8 */
      [203, 7, 'gold'],   /* S8 THE PLANETARIUM: the glinting star (hidden) */
      [227, 8], [239, 8],   /* S9 */
      [245, 8],   /* S10 */
      [268, 8], [289, 8],   /* S10, S11 */
      [303, 8, 'heart'], [305, 8], [307, 8, 'cake']   /* S12 the gift row */
    ],
    brick: [
      [3, 8], [5, 8],   /* S1 */
      [74, 2], [76, 2],   /* S3 */
      [96, 8], [98, 8],   /* S4 */
      [304, 8], [306, 8]   /* S12 */
    ],
    spring: [
      [8, 11],   /* S1 a magnet pad in the open: try it */
      [17, 11],   /* S1 up the tall exhibit */
      [44, 11],   /* S2 up onto the mezzanine */
      [127, 11],   /* S5 over THE LIGHTNING COIL */
      [165, 11], [182, 11],   /* S7 THE DOME */
      [249, 11]   /* S10 up the last exhibit (skill secret) */
    ],
    shelf: [
      [135, 3], [136, 3],   /* S6 THE PLASMA BALL ledge (visible secret) */
      [257, 1], [258, 1],   /* S10 the ledge under THE TOP OF THE DOME (skill secret; a full-run jump off it lands 2 tiles short of the c273 gap) */
      [316, 8], [317, 8], [318, 8]   /* S12 the shelf at the top of the magnet lift (4 tiles over the floor) */
    ]
  },
  /* robots on the floors, puddle frogs by the water exhibits, umbrella bats and crows (an indoor bird show) in the air; nothing waits at a lip */
  foes: [
    [12, 11, 'robot'],   /* S1 */
    [32, 11, 'robot'],   /* S2 */
    [64, 5, 'robot'],   /* S3 */
    [104, 11, 'robot'],   /* S4 */
    [111, 11, 'puddlefrog'], [119, 5, 'umbrellabat'],   /* S5 */
    [149, 11, 'robot'], [155, 6, 'umbrellabat'],   /* S6 */
    [177, 6, 'umbrellabat'], [188, 11, 'robot'],   /* S7 */
    [203, 11, 'puddlefrog'], [209, 6, 'umbrellabat'],   /* S8 */
    [222, 6, 'umbrellabat'], [229, 11, 'robot'], [233, 6, 'crow'],   /* S9 (the robot waits past the red door) */
    [246, 11, 'robot'], [260, 11, 'puddlefrog'], [266, 6, 'umbrellabat'],   /* S10 */
    [275, 6, 'crow'], [280, 11, 'robot'], [285, 6, 'umbrellabat'], [294, 6, 'crow'],   /* S11 */
    [312, 11, 'robot']   /* S12 */
  ],
  candles: [
    [1, 11], [2, 11], [6, 11], [7, 11], [8, 8], [8, 6], [8, 4], [8, 2], [11, 11], [13, 11], [14, 11], [15, 11], [16, 11], [17, 9],
    [17, 7], [17, 5], [18, 6], [19, 6], [20, 6], [21, 6], [22, 6], [23, 8], [24, 8], [25, 11], [26, 11], [27, 11], [28, 11], [29, 11],
    [31, 11], [33, 11], [34, 11], [35, 10], [36, 9], [37, 8], [38, 9], [39, 10], [40, 11], [42, 11], [43, 11], [44, 9], [44, 7], [44, 5],
    [45, 4], [46, 5], [47, 5], [48, 5], [49, 5], [50, 5], [51, 5], [52, 5], [53, 5], [54, 5], [55, 5], [57, 5], [58, 4], [59, 3],
    [60, 3], [61, 4], [62, 5], [63, 5], [66, 5], [67, 4], [68, 3], [69, 3], [70, 4], [71, 5], [72, 5], [73, 5], [77, 5], [78, 5],
    [79, 5], [80, 5], [81, 5], [82, 5], [83, 5], [84, 5], [85, 5], [86, 5], [87, 6], [88, 7], [89, 8], [90, 9], [91, 10], [92, 11],
    [93, 11], [94, 11], [95, 11], [99, 11], [100, 11], [102, 11], [105, 11], [106, 11], [107, 11], [108, 11], [109, 11], [112, 11], [113, 10], [114, 9],
    [115, 8], [116, 8], [117, 9], [118, 10], [120, 11], [121, 10], [122, 9], [123, 8], [124, 8], [125, 9], [126, 10], [127, 9], [127, 7], [127, 5],
    [128, 4], [129, 4], [130, 4], [131, 3], [132, 2], [133, 2], [134, 2], [131, 7], [132, 7], [133, 11], [134, 11], [135, 11], [136, 11], [137, 11],
    [138, 11], [140, 11], [141, 11], [142, 10], [143, 9], [144, 8], [145, 8], [146, 9], [147, 10], [148, 11], [150, 11], [151, 11], [152, 10], [153, 9],
    [154, 8], [155, 8], [156, 9], [157, 10], [158, 11], [159, 11], [160, 11], [161, 11], [162, 11], [164, 11], [165, 9], [165, 7], [165, 5], [166, 4],
    [167, 4], [168, 4], [169, 4], [170, 4], [171, 4], [172, 4], [173, 4], [174, 7], [175, 6], [176, 6], [177, 7], [178, 8], [179, 10], [181, 11],
    [182, 9], [182, 7], [182, 5], [183, 3], [184, 3], [185, 3], [186, 7], [187, 7], [188, 11], [189, 11], [190, 11], [192, 11], [193, 11], [194, 11], [195, 11],
    [196, 10], [197, 9], [198, 8], [199, 8], [200, 9], [201, 10], [202, 11], [203, 10], [203, 9], [204, 11], [205, 11], [206, 10], [207, 9], [208, 8],
    [209, 8], [210, 9], [211, 10], [212, 11], [213, 11], [214, 11], [215, 11], [216, 11], [217, 11], [218, 11], [219, 10], [220, 9], [221, 8], [222, 7], [223, 8],
    [224, 9], [225, 10], [226, 11], [228, 11], [229, 11], [230, 10], [231, 9], [232, 8], [233, 7], [234, 8], [235, 9], [236, 10], [237, 11], [238, 11],
    [240, 11], [241, 11], [242, 11], [243, 11], [244, 11], [246, 11], [247, 11], [248, 11], [249, 9], [249, 7], [249, 5], [250, 3], [251, 3], [252, 3],
    [253, 3], [254, 3], [255, 1], [256, 0], [257, 0], [255, 7], [256, 7], [257, 11], [259, 11], [261, 11], [262, 11], [263, 11], [264, 11],
    [265, 11], [266, 11], [267, 11], [269, 11], [270, 11], [271, 11], [272, 10], [273, 9], [274, 8], [275, 7], [276, 8], [277, 9], [278, 10], [279, 11],
    [281, 11], [282, 10], [283, 9], [284, 8], [285, 8], [286, 9], [287, 10], [288, 11], [290, 11], [291, 10], [292, 9], [293, 8], [294, 7], [295, 8],
    [296, 9], [297, 11], [298, 11], [299, 11], [300, 11], [303, 7], [305, 7], [307, 7], [310, 11], [314, 11], [316, 11], [318, 11],
    [316, 7], [317, 7], [318, 7]   /* S12 on the magnet lift's shelf */
  ],
  secrets: [
    { kind: 'visible', col: 136, row: 2, prize: 'heart+candles' },   /* THE PLASMA BALL: from the coil top, jump out to the ledge */
    { kind: 'hidden', col: 203, row: 7, prize: 'GOLDEN CANDLE', glint240: true },   /* THE PLANETARIUM: the glinting star in the low ceiling */
    { kind: 'skill', col: 258, row: 0, prize: 'hat' }   /* THE TOP OF THE DOME: pad, exhibit top, then the ledge under the dome */
  ],
  goldenCandle: { col: 203, row: 7 },
  checkpoint: { col: 101, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 320, row: 11 },   /* the doors out to the train station */
  /* story bubbles as Kinan passes a column: [col, who, what they say, seconds] (subtitles only) */
  talk: [
    [2, 'CHENOA', "Science World! It's like a giant silver golf ball.", 3],
    [6, 'KINAN', 'A magnet pad! Step on it and... WHOA, it throws you right up!', 3.4],
    [96, 'SHAD', 'A red door! See the switch with the lightning bolt? Jump and bump it from underneath.', 4],
    [104, 'DAD', 'I could spend all day at the vacuum exhibit. For work. It really sucks me in.', 3.6],
    [30, "DAD", "What did the science dome say to the rain? You're dome-inating the weather! Get it? Dome?", 3.8],
    [30, "MOM", "Is that all you do, tell jokes? I am going to see the planets. Without you.", 3.4, "walkoff"],
    [30, "DAD", "...I'll be here all week! Science World's open till five.", 3],
    [140, 'KINAN', 'Now the BLUE door is shut! Every switch flips red and blue.', 3.2],
    [308, 'CHENOA', 'A magnet lift! Stand in the purple light and it pulls you right up.', 3.4],
    [124, 'SHAD', 'The lightning coil! Ride the magnet pad right over the top, bud.', 3],
    [192, 'MOM', 'The planetarium! Look at all the stars on the ceiling, sweetie.', 3.4],
    [268, 'KINAN', "Glitchy's running for the train tracks! He's going to ride the SkyTrain!", 3.8],
    [298, 'CHENOA', 'Last stop: the elevated train. Hold on to something!', 3]
  ]
});

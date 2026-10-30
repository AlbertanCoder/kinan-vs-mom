/* ============================================================
   LEVEL 5-8 · THE SKI JUMP HILL
   (World 5 · Calgary Stampede · trail stop 10)
   Story bible (World 5 table): "Zip lines and ski jumps at the Olympic
   park." Bronco runs all the way west to the Olympic park, where the
   ski jumps from 1988 tower over the city, and he goes UP the hill.
   Kinan follows him up the bike park, through the bobsled tunnel and
   onto the big jump. From the top you can see the fireworks starting at
   the grandstand.
   Idea: THE EXAM, nothing new. It mixes what World 5 taught: the
     floats' high ground (5-1) as the start gates, the griddles (5-2) as
     the trampoline park's springboards, the corral rails (5-3) as the
     chairlift, the racetrack's speed hills (5-4) as the bike park, the
     Peace Bridge tube (5-5) as the bobsled tunnel (inside or on top), the
     dinosaur climbs (5-6) as the ski-jump towers, the glass floor's
     drops (5-7) as the jumps themselves. Plus the ski jumps: climb the
     tower, race down the in-run, fly off the takeoff table.
   Acts (thirds): 0-98 teach (the park base, the bobsled BOWL and a
     3-wide gap, the chairlift rail and a 3-wide gap off its post, THE
     TRAMPOLINE PARK, the checkpoint) · 99-197 twist (THE FIRST SKI JUMP
     and a 4-wide gap, the bike park humps and a 4-wide gap, THE BOBSLED
     TUNNEL) · 198-296 test (two 5-wide gaps, THE BIG SKI JUMP over a
     5-wide gap, the chairlift tower, a 5-wide gap, the medal podium).
   Signature set-piece: THE BIG SKI JUMP (S9): climb the jump tower to
     the start gate, race down the in-run, and fly off the takeoff table
     over a 5-wide gap toward the city lights.
   Secrets: visible = THE BUNGEE TRAMPOLINE (S4): a high platform hangs
     up and to the LEFT of the trampoline-park springboard; step on
     gently, flip, steer back onto it (heart + candles, 85,3) · hidden =
     THE START HUT (S9): at the top of the big jump, jump under the start
     hut's roof; one board glints (GOLDEN CANDLE, 226,1) · skill = THE
     CHAIRLIFT TOWER (S10): three chairs stacked up the lift tower; climb
     them zig-zag to the top (hat, 249,2).
   Look: borrows the Ski Jump Hill (theme 39): a purple dusk sky, the
     jump towers, grey ground.
   Bubble beats for ER-4 (not wired): c2 Shad: "They had the Winter
     Olympics here in 1988! Ski jumps, bobsleds, the works!" · c89
     Chenoa: "A trampoline park. Of COURSE there's a trampoline park." ·
     c104 checkpoint, a ski-patroller: "Why are ski jumpers so calm? They
     always let it slide." · c168 Kinan: "The bobsled tunnel: inside or
     ON TOP?" · c226 "I can see the grandstand from up here. FIREWORKS!" ·
     c290 Chenoa: "Bronco's running right toward the fireworks!"
   ENGINE REQUESTS: zip lines (a rideable cable from a tower down to the
     ground; today there are none, the chairlift's chairs are shelves) ·
     a ski-jump skin (the in-run's snowy slope, the takeoff table, the
     start hut) · bobsleds that race through the tunnel · a mountain-bike
     skin for the biker · fireworks in the sky toward the grandstand ·
     bubbles ER-4.
  
   ============================================================ */
KinanLevels.register({
  id: '5-8', world: 5, slot: 10, kind: 'level',
  name: 'THE SKI JUMP HILL',
  theme: 39,              /* the Ski Jump Hill: a purple dusk sky, the jump towers, grey ground */
  cols: 297,
  heights: [
    /* S1 0-26 the Olympic park base */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 the bobsled BOWL (c30-39) · a 3-wide gap c44-46 */
    192,192,192,200,208,208,208,208,208,208,208,200,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,
    /* S3 54-80 the chairlift rail (posts c58 and c68) · a 3-wide gap c70-72 right off its post */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,
    /* S4 81-107 THE TRAMPOLINE PARK: the springboard (c89) throws you over the 5-tall fence (c90-93) · THE BUNGEE TRAMPOLINE platform up-left · checkpoint */
    192,192,192,192,192,192,192,192,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 THE FIRST SKI JUMP: up the tower (c108-113), the start gate, down the in-run (c117-120), the takeoff table, a 4-wide gap c123-126 */
    176,160,144,128,112,96,96,96,96,112,128,144,160,160,160,null,null,null,null,192,192,192,192,192,192,192,192,
    /* S6 135-161 the bike park: a hump, a 4-wide gap c148-151, a hump */
    192,192,184,176,176,176,176,176,184,192,192,192,192,null,null,null,null,192,192,184,176,176,176,176,176,184,192,
    /* S7 162-188 THE BOBSLED TUNNEL (roof c164-190): the springboard (c168) under the gap in its roof (c168-170) */
    192,192,192,192,192,192,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S8 189-215 the tunnel's end (c190) · two 5-wide gaps c202-206 and c211-215 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,null,null,null,null,null,
    /* S9 216-242 THE BIG SKI JUMP: up the tower (c218-224), THE START HUT (c225-226), down the in-run (c227-231), the takeoff table, a 5-wide gap c233-237 */
    192,192,176,160,144,128,112,96,80,80,80,96,112,128,144,160,160,null,null,null,null,null,192,192,192,192,192,
    /* S10 243-269 THE CHAIRLIFT TOWER (chairs c248-254) · a 5-wide gap c262-266 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,
    /* S11 270-296 reward: the medal podium, Dad's truck */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [58, 9, 58, 11], [68, 9, 68, 11],   /* S3 the chairlift rail's posts */
    [90, 7, 91, 11], [92, 9, 93, 11],   /* S4 THE TRAMPOLINE PARK's tall fence and its back step */
    [164, 8, 167, 8], [171, 8, 190, 8],   /* S7 THE BOBSLED TUNNEL's roof, with its gap at c168-170 */
    [225, 1, 226, 1]   /* S9 THE START HUT's roof (a glinting board in it) */
  ],
  tiles: {
    gift: [
      [5, 8, 'popper'],   /* S1 */
      [34, 9],   /* S2 over the bowl */
      [76, 8],   /* S3 */
      [114, 2],   /* S5 over the start gate */
      [146, 8],   /* S6 */
      [180, 9, 'heart'],   /* S7 inside the tunnel */
      [226, 1, 'gold'],   /* S9 THE START HUT's glinting board (hidden) */
      [277, 8], [279, 8, 'heart'], [281, 8, 'cake']   /* S11 the medal podium */
    ],
    brick: [
      [4, 8], [6, 8],   /* S1 */
      [33, 9], [35, 9],   /* S2 */
      [75, 8], [77, 8],   /* S3 */
      [113, 2], [115, 2],   /* S5 */
      [145, 8], [147, 8],   /* S6 */
      [276, 8], [278, 8], [280, 8], [282, 8]   /* S11 */
    ],
    spring: [
      [89, 12], [168, 12]   /* the springboards, flush in the ground */
    ],
    shelf: [
      [59, 9], [60, 9], [61, 9], [62, 9], [63, 9], [64, 9], [65, 9], [66, 9], [67, 9],   /* S3 the chairlift rail */
      [85, 4], [86, 4],   /* S4 THE BUNGEE TRAMPOLINE platform, up-left of the springboard (visible secret) */
      [248, 9], [249, 9], [250, 9], [252, 6], [253, 6], [254, 6], [249, 3], [250, 3]   /* S10 THE CHAIRLIFT TOWER's chairs (skill secret) */
    ]
  },
  /* mountain bikers charge, gophers hop, tumbleweeds roll down the hill, geese, crows and magpies above; nothing waits at a lip, a springboard or under the chairs */
  foes: [
    [20, 11, 'tumbleweed'], [14, 4, 'goose'],   /* S1 */
    [35, 12, 'gopher'],   /* S2 in the bowl */
    [63, 11, 'gopher'], [78, 3, 'crow'],   /* S3 under the chairlift rail */
    [98, 11, 'tumbleweed'], [102, 3, 'magpie'],   /* S4 */
    [111, 6, 'gopher'], [125, 3, 'goose'],   /* S5 */
    [140, 3, 'crow'], [157, 10, 'biker'],   /* S6 */
    [180, 11, 'biker'], [184, 5, 'magpie'],   /* S7 the low road · the high road */
    [195, 11, 'tumbleweed'], [205, 3, 'goose'], [213, 3, 'crow'],   /* S8 */
    [221, 7, 'gopher'], [235, 3, 'magpie'],   /* S9 */
    [244, 3, 'goose'], [258, 3, 'crow'],   /* S10 */
    [289, 11, 'biker']   /* S11 */
  ],
  candles: [
    [2, 11], [3, 11], [4, 11], [5, 7], [9, 11], [12, 11], [15, 11], [18, 11], [21, 11], [24, 11], [27, 11], [28, 11], [29, 11], [30, 11],
    [31, 12], [33, 8], [35, 8], [38, 12], [39, 11], [40, 11], [41, 11], [42, 11], [43, 11], [44, 9], [45, 8], [46, 9], [47, 11], [48, 11],
    [50, 11], [52, 11], [55, 11], [56, 11], [57, 11], [59, 8], [61, 8], [63, 8], [65, 8], [67, 8], [69, 7], [70, 6], [71, 5], [72, 5],
    [73, 6], [74, 8], [76, 7], [78, 11], [79, 11], [80, 11], [81, 11], [83, 11], [85, 11], [87, 11], [85, 3], [86, 2], [88, 11], [89, 10],
    [89, 8], [90, 5], [91, 5], [92, 7], [93, 7], [95, 11], [97, 11], [99, 11], [101, 11], [103, 11], [108, 10], [109, 9], [110, 8], [111, 7],
    [112, 6], [113, 5], [114, 4], [115, 4], [116, 4], [114, 1], [117, 5], [118, 6], [119, 7], [120, 8], [121, 8], [122, 8], [123, 6], [124, 5],
    [125, 5], [126, 6], [127, 8], [128, 11], [130, 11], [132, 11], [134, 11], [137, 10], [138, 10], [139, 9], [140, 9], [141, 9], [142, 9], [143, 10],
    [144, 11], [146, 7], [147, 11], [148, 9], [149, 8], [150, 8], [151, 9], [152, 11], [154, 10], [155, 10], [156, 9], [157, 9], [158, 9], [159, 9],
    [160, 10], [161, 11], [162, 11], [163, 11], [164, 11], [165, 11], [166, 11], [167, 11], [168, 10], [169, 8], [169, 6], [170, 5], [171, 6], [173, 6],
    [175, 6], [177, 6], [179, 6], [181, 6], [183, 6], [185, 6], [187, 6], [172, 11], [176, 11], [180, 11], [184, 11], [188, 11], [180, 7], [190, 11],
    [192, 11], [194, 11], [196, 11], [198, 11], [200, 11], [201, 11], [202, 9], [203, 8], [204, 8], [205, 8], [206, 9], [207, 11], [208, 11], [209, 11],
    [210, 11], [211, 9], [212, 8], [213, 8], [214, 8], [215, 9], [216, 11], [217, 11], [218, 10], [219, 9], [220, 8], [221, 7], [222, 6], [223, 5],
    [224, 4], [225, 3], [226, 3], [227, 4], [228, 5], [229, 6], [230, 7], [231, 8], [232, 8], [232, 7], [233, 5], [234, 4], [235, 4], [236, 4],
    [237, 5], [238, 7], [238, 11], [240, 11], [242, 11], [244, 11], [245, 11], [246, 11], [248, 8], [249, 8], [250, 8], [252, 5], [253, 5], [254, 5],
    [250, 2], [256, 11], [258, 11], [260, 11], [261, 11], [262, 9], [263, 8], [264, 8], [265, 8], [266, 9], [267, 11], [268, 11], [269, 11], [271, 11],
    [273, 11], [275, 11], [277, 7], [279, 7], [281, 7], [284, 11], [286, 11], [288, 11], [290, 11], [292, 11], [288, 8], [289, 7], [290, 8]
  ],
  secrets: [
    { kind: 'visible', col: 85, row: 3, prize: 'heart+candles' },   /* THE BUNGEE TRAMPOLINE platform, flipped back onto from the springboard */
    { kind: 'hidden', col: 226, row: 1, prize: 'GOLDEN CANDLE', glint240: true },   /* THE START HUT: the glinting board in its roof */
    { kind: 'skill', col: 249, row: 2, prize: 'hat' }   /* the top chair of THE CHAIRLIFT TOWER */
  ],
  goldenCandle: { col: 226, row: 1 },
  checkpoint: { col: 104, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 293, row: 11 }   /* Dad's truck waits at the medal podium */
});

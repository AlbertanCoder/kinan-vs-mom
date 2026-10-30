/* ============================================================
   LEVEL 7-8 · THE SKYTRAIN
   (World 7 · Vancouver · trail stop 10)
   Story bible (World 7 table): "Ride the elevated train across the
   city; the hardest regular level." Glitchy jumped onto the roof of
   the elevated train (no driver at all!) and it is zooming across the
   city, through the downtown tunnels, all the way to Waterfront
   station by Canada Place, where the little rain cloud has grown into
   a giant grey storm. Kinan rides the roofs after him. (In the game
   only! Never for real.)
   Idea: THE EXAM, nothing new. It mixes what World 7 taught: the low
     roofs of 7-1 (here: the overhead signs and the downtown tunnels,
     where you only get a short jump), the stepping of 7-2 (car to car),
     the sag of 7-5 (the track dips under a road), a springboard up an
     exhibit-tall wall like 7-7 (the express car), and the widest gaps
     of the world. Act 1 (0-116): car roofs 2/3, a sign over a 2-wide
     coupling, the track rises 3/3, Main Street station and its roof,
     3. Act 2 (117-233): couplings 4, THE DOWNTOWN TUNNEL 2/3 under the
     roof, the sag 4/4, the express platform's springboard, 3/4. Act 3
     (234-350): 5, a sign over a 3, 5/4 round a short car, THE SECOND
     TUNNEL 3/3, THE FINAL SPRINT 5/5/5 over short cars, Waterfront
     station.
   Signature set-piece: THE DOWNTOWN TUNNEL (S6): the train dives
     underground, the roof is right over your head, and there are gaps
     between the cars in the dark.
   Secrets: visible = THE STATION ROOF (S4): a heart sits on the roof of
     Main Street station's platform canopy; ride up the ramp at the far
     end, then jump back onto the canopy (heart + candles, 99,6) ·
     hidden = THE TUNNEL LIGHT (S6): one light in the tunnel roof glints
     (7-1's shiny roof, again); jump under it (GOLDEN CANDLE, 146,4;
     two candles under it point up) · skill = THE EXPRESS LEAP (S8): from
     the top of the express car, a long running jump UP to a one-tile
     ledge over the coupling (hat, 212,2).
   Gaps: act 1 2/3/2/3/3/3 · act 2 4/2/3/4/4/3/4 · act 3 5/3/5/4/3/3/5/5/5
     (6-8, World 6's hardest, ends 5/5/5/5/5/5/5 in the open; here five
     5s, three 3s under a roof where the jump is short, and 4-wide cars).
     Under a sign or a tunnel roof a gap is never wider than 3 (a short
     jump with RUN makes it); every gap has a candle arc; the checkpoint
     stands on the express platform (c196), right before act 3 (before
     it, a fall puts Kinan back at the last safe spot); 2-4 foes a
     screen in act 3, never waiting at a lip.
   Look: borrows the SkyTrain (theme 48): the city rushing past below,
     another train zooming by the other way, rain.
   TWIST (wired 2026-10-28): THE MOVING TRAIN: the city rushes past,
     World 5's signs (stay low) and low cables (jump), each flashing a
     warning, and Drizzle's storm over Canada Place (see rush, signs and
     storm below). The beams over the couplings stay solid. The gangway
     ledge (c208-212) catches a walk off the express car.
   ENGINE REQUESTS (still open): train-car skins for the
     roof ground (white and blue, with the couplings) and a sign skin
     for the beams · Drizzle as a big dark storm over Canada Place in
     the last screens.
   ============================================================ */
KinanLevels.register({
  id: '7-8', world: 7, slot: 10, kind: 'level',
  name: 'THE SKYTRAIN',
  theme: 48,   /* the SkyTrain: the city rushing past below, another train going by, rain */
  cols: 351,
  /* THE MOVING TRAIN (wired 2026-10-28): the city rushes past behind (the backdrop scrolls fast all the time, with
     wind streaks) while the roofs stay the ground. On the roofs, World 5's signs: a LOW CABLE flashes ▲ JUMP as Kinan
     comes near (jump it: walking into it hurts), an overhead SIGN flashes ▼ STAY LOW (jump into it and it knocks you
     down). Teach: a cable on the station platform, a sign on the Main Street car (each 10+ tiles from any gap) · twist:
     a cable inside the downtown tunnel, 4 tiles past its last coupling: a short hop under the roof (act 3 tests the
     solid beams over the couplings and the second tunnel as before). From column 300 Drizzle looms as a huge dark
     storm over Canada Place's white sails. */
  rush: true,
  storm: 300,
  signs: [[7, 'jump'], 80, [157, 'jump']],
  trainCars: [[13, 88], [105, 192], [207, 327]],   /* white-and-blue car sides under every flat roof between the couplings (looks only) */
  skins: [['car', 200, 6, 207, 10]],   /* the express car */
  heights: [
    /* S1 0-26 the station platform, up the boarding ramp (c12-13) onto the first car, a 2-wide coupling c22-23 */
    176,176,176,176,176,176,176,176,176,176,176,176,160,144,144,144,144,144,144,144,144,144,null,null,144,144,144,
    /* S2 27-53 a 3-wide coupling c32-34, a sign (c37-39), a sign over a 2-wide coupling c43-44 */
    144,144,144,144,144,null,null,null,144,144,144,144,144,144,144,144,null,null,144,144,144,144,144,144,144,144,144,
    /* S3 54-80 3-wide gaps c57-59 and c68-70: the next train runs one tile higher */
    144,144,144,null,null,null,128,128,128,128,128,128,128,128,null,null,null,128,128,128,128,128,128,128,128,128,128,
    /* S4 81-107 Main Street station: down to the platform (c89-91) under THE STATION ROOF (c95-104), up the ramp (c105-106) */
    128,128,128,128,128,128,128,128,144,160,176,176,176,176,176,176,176,176,176,176,176,176,176,176,160,144,144,
    /* S5 108-134 a 3-wide coupling c114-116, a sign (c119-121), a 4-wide coupling c125-128 */
    144,144,144,144,144,144,null,null,null,144,144,144,144,144,144,144,144,null,null,null,null,144,144,144,144,144,144,
    /* S6 135-161 THE DOWNTOWN TUNNEL (roof c138-158): couplings c141-142 (2) and c150-152 (3) under the roof */
    144,144,144,144,144,144,null,null,144,144,144,144,144,144,144,null,null,null,144,144,144,144,144,144,144,144,144,
    /* S7 162-188 the sag: down (c166-167), a 4-wide gap c170-173 at the bottom, up (c176-177), a 4-wide coupling c182-185 */
    144,144,144,144,152,160,160,160,null,null,null,null,160,160,152,144,144,144,144,144,null,null,null,null,144,144,144,
    /* S8 189-215 the express platform and the checkpoint: down (c192-193), the springboard (c199) up the express car (c200-207), a 3-wide coupling c210-212 under THE EXPRESS LEAP (a running jump off the car clears it) */
    144,144,144,160,176,176,176,176,176,176,176,176,176,176,176,176,176,160,144,144,144,null,null,null,144,144,144,
    /* S9 216-242 a 4-wide coupling c224-227, a 5-wide gap c234-238 */
    144,144,144,144,144,144,144,144,null,null,null,null,144,144,144,144,144,144,null,null,null,null,null,144,144,144,144,
    /* S10 243-269 a sign over a 3-wide coupling c249-251, a 5-wide gap c257-261, a short car, a 4-wide gap c266-269 */
    144,144,144,144,144,144,null,null,null,144,144,144,144,144,null,null,null,null,null,144,144,144,144,null,null,null,null,
    /* S11 270-296 THE SECOND TUNNEL (roof c272-290): 3-wide couplings c276-278 and c285-287 */
    144,144,144,144,144,144,null,null,null,144,144,144,144,144,144,null,null,null,144,144,144,144,144,144,144,144,144,
    /* S12 297-323 THE FINAL SPRINT: 5-wide gaps c300-304, c309-313 and c318-322 between short cars */
    144,144,144,null,null,null,null,null,144,144,144,144,null,null,null,null,null,144,144,144,144,null,null,null,null,null,144,
    /* S13 324-350 reward: Waterfront station, the gift row, the storm over Canada Place */
    144,144,144,144,160,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176
  ],
  solid: [
    [37, 4, 39, 4], [42, 4, 45, 4],   /* S2 overhead signs (4 tiles of air over the roof, rows 5-8) */
    [95, 7, 104, 7],   /* S4 THE STATION ROOF: Main Street's platform canopy (visible secret on top) */
    [119, 4, 121, 4],   /* S5 an overhead sign */
    [138, 2, 158, 4],   /* S6 THE DOWNTOWN TUNNEL's roof */
    [200, 6, 207, 10],   /* S8 the express car, too tall to jump: take the springboard */
    [247, 4, 252, 4],   /* S10 a sign over a coupling */
    [272, 2, 290, 4]   /* S11 THE SECOND TUNNEL's roof */
  ],
  tiles: {
    gift: [
      [4, 7, 'popper'], [17, 5],   /* S1 */
      [28, 5], [50, 5],   /* S2 */
      [63, 4], [76, 4],   /* S3 */
      [85, 4],   /* S4 */
      [110, 5, 'umbrella'], [131, 5],   /* S5 */
      [146, 4, 'gold'],   /* S6 THE TUNNEL LIGHT: the glinting light in the tunnel roof (hidden) */
      [163, 5], [179, 5],   /* S7 */
      [196, 7], [215, 5],   /* S8 */
      [220, 5], [230, 5],   /* S9 */
      [245, 5],   /* S10 */
      [294, 5],   /* S11 (no gifts over the short cars of S10-S12: a bumped head there costs the jump) */
      [334, 7, 'heart'], [336, 7], [338, 7, 'cake']   /* S13 the gift row */
    ],
    brick: [
      [3, 7], [5, 7],   /* S1 */
      [335, 7], [337, 7]   /* S13 */
    ],
    spring: [
      [199, 10]   /* S8 the express platform's springboard */
    ],
    shelf: [
      [212, 3],   /* S8 THE EXPRESS LEAP's one-tile ledge (skill secret) */
      [208, 7], [209, 7], [210, 7], [211, 7], [212, 7]   /* S8 the gangway: a ledge one tile under the express car's roof, out over the c210-212 coupling, so walking off the car (at any speed) lands on it, never in the coupling (QA 2026-10-28) */
    ]
  },
  /* rollerbladers and raccoons on the roofs, robots on the platforms, crows and seagulls and umbrella bats riding the wind over the couplings; nothing waits at a lip */
  foes: [
    [8, 10, 'rollerblader'],   /* S1 */
    [38, 8, 'raccoon'], [48, 6, 'crow'],   /* S2 */
    [58, 6, 'seagull'], [64, 7, 'rollerblader'],   /* S3 */
    [84, 7, 'raccoon'], [98, 10, 'robot'],   /* S4 */
    [115, 6, 'crow'], [121, 8, 'rollerblader'], [127, 6, 'seagull'],   /* S5 */
    [146, 8, 'raccoon'], [155, 8, 'rollerblader'],   /* S6 */
    [163, 8, 'raccoon'], [171, 6, 'umbrellabat'], [180, 8, 'rollerblader'], [184, 6, 'crow'],   /* S7 */
    [204, 5, 'raccoon'], [211, 6, 'seagull'],   /* S8 (the platform itself is kept clear: the checkpoint stands there) */
    [220, 8, 'rollerblader'], [225, 6, 'crow'], [231, 8, 'raccoon'], [236, 6, 'seagull'],   /* S9 */
    [245, 8, 'raccoon'], [254, 8, 'rollerblader'], [259, 6, 'crow'], [267, 5, 'seagull'],   /* S10 */
    [273, 8, 'rollerblader'], [282, 8, 'raccoon'], [293, 8, 'robot'],   /* S11 */
    [302, 6, 'seagull'], [311, 5, 'crow'], [320, 5, 'seagull'],   /* S12 THE FINAL SPRINT: only flyers over the short cars */
    [340, 10, 'raccoon']   /* S13 */
  ],
  candles: [
    [1, 10], [2, 10], [6, 10], [7, 10], [9, 10], [10, 10], [11, 10], [12, 9], [13, 8], [14, 8], [15, 8], [16, 8], [18, 8], [19, 8],
    [20, 8], [21, 7], [22, 6], [23, 6], [24, 7], [25, 8], [26, 8], [27, 8], [29, 8], [30, 8], [31, 7], [32, 6], [33, 5], [34, 6],
    [35, 7], [36, 8], [37, 8], [39, 8], [40, 8], [41, 8], [42, 7], [43, 6], [44, 6], [45, 7], [46, 8], [47, 8], [49, 8], [51, 8],
    [52, 8], [53, 8], [54, 8], [55, 8], [56, 7], [57, 6], [58, 5], [59, 5], [60, 6], [61, 7], [62, 7], [64, 7], [65, 7], [66, 7],
    [67, 6], [68, 5], [69, 4], [70, 5], [71, 6], [72, 7], [73, 7], [74, 7], [75, 7], [77, 7], [78, 7], [79, 7], [80, 7], [81, 7],
    [82, 7], [83, 7], [86, 7], [87, 7], [88, 7], [89, 8], [90, 9], [91, 10], [92, 10], [93, 10], [94, 10], [96, 10], [97, 10], [101, 10],
    [102, 10], [103, 10], [104, 10], [105, 9], [106, 8], [107, 8], [96, 6], [97, 6], [98, 6], [100, 6], [101, 6], [102, 6], [108, 8], [109, 8],
    [111, 8], [112, 8], [113, 7], [114, 6], [115, 5], [116, 6], [117, 7], [118, 8], [119, 8], [120, 8], [122, 8], [123, 8], [124, 7], [125, 6],
    [126, 5], [127, 5], [128, 6], [129, 7], [130, 8], [132, 8], [133, 8], [134, 8], [135, 8], [136, 8], [137, 8], [138, 8], [139, 8], [140, 7],
    [141, 6], [142, 6], [143, 7], [144, 8], [145, 8], [146, 7], [146, 6], [147, 8], [148, 8], [149, 7], [150, 6], [151, 6], [152, 6], [153, 7],
    [154, 8], [156, 8], [157, 8], [158, 8], [159, 8], [160, 8], [161, 8], [162, 8], [164, 8], [165, 8], [166, 8], [167, 9], [168, 9], [169, 8],
    [170, 7], [171, 6], [172, 6], [173, 7], [174, 8], [175, 9], [176, 8], [177, 8], [178, 8], [179, 8], [181, 7], [182, 6], [183, 5], [184, 5],
    [185, 6], [186, 7], [187, 8], [188, 8], [189, 8], [190, 8], [191, 8], [192, 9], [193, 10], [194, 10], [195, 10], [197, 10], [198, 10], [199, 8],
    [199, 6], [199, 4], [200, 3], [201, 5], [202, 5], [203, 5], [205, 5], [206, 5], [207, 5], [208, 4], [209, 3], [210, 2], [211, 2], [208, 8],
    [209, 6], [210, 6], [211, 5], [212, 6], [213, 7], [214, 8], [216, 8], [217, 8], [218, 8], [219, 8], [221, 8], [222, 8], [223, 7],
    [224, 6], [225, 5], [226, 5], [227, 6], [228, 7], [229, 8], [231, 8], [232, 8], [233, 7], [234, 6], [235, 5], [236, 4], [237, 5], [238, 6],
    [239, 7], [240, 8], [241, 8], [242, 8], [243, 8], [244, 8], [246, 8], [247, 8], [248, 7], [249, 6], [250, 6], [251, 6], [252, 7], [253, 8],
    [255, 8], [256, 7], [257, 6], [258, 5], [259, 4], [260, 5], [261, 6], [262, 7], [263, 8], [264, 8], [265, 7], [266, 6], [267, 5], [268, 5],
    [269, 6], [270, 7], [271, 8], [272, 8], [273, 8], [274, 8], [275, 7], [276, 6], [277, 6], [278, 6], [279, 7], [280, 8], [281, 8], [283, 8], [284, 7],
    [285, 6], [286, 6], [287, 6], [288, 7], [289, 8], [290, 8], [291, 8], [292, 8], [295, 8], [296, 8], [297, 8], [298, 8], [299, 7], [300, 6],
    [301, 5], [302, 4], [303, 5], [304, 6], [305, 7], [306, 8], [307, 8], [308, 7], [309, 6], [310, 5], [311, 4], [312, 5], [313, 6], [314, 7],
    [315, 8], [316, 8], [317, 7], [318, 6], [319, 5], [320, 4], [321, 5], [322, 6], [323, 7], [324, 8], [325, 8], [326, 8], [327, 8], [328, 9], [329, 10], [330, 10], [331, 10],
    [332, 10], [334, 6], [336, 6], [338, 6], [342, 10], [344, 10], [346, 10], [348, 10]
  ],
  secrets: [
    { kind: 'visible', col: 99, row: 6, prize: 'heart+candles' },   /* THE STATION ROOF: up the far ramp, then jump back onto the canopy */
    { kind: 'hidden', col: 146, row: 4, prize: 'GOLDEN CANDLE', glint240: true },   /* THE TUNNEL LIGHT: the glinting light in the tunnel roof */
    { kind: 'skill', col: 212, row: 2, prize: 'hat' }   /* THE EXPRESS LEAP: from the express car's top, up to the one-tile ledge */
  ],
  goldenCandle: { col: 146, row: 4 },
  checkpoint: { col: 196, row: 10 },   /* on the express platform, right before the hardest stretch (act 3) */
  spawn: { col: 2, row: 10 },
  goal: { col: 346, row: 10 },   /* Waterfront station: Canada Place and the storm are right across the street */
  /* story bubbles as Kinan passes a column: [col, who, what they say, seconds] (subtitles only) */
  talk: [
    [2, 'SHAD', 'The SkyTrain! No driver at all. Glitchy is riding on the ROOF, so... I guess we are too.', 4.6],
    [11, 'MOM', 'KINAN! Get back inside this minute! ...Oh, fine. Hold on tight!', 3.6],
    [35, 'CHENOA', 'Signs over the track! Keep your jumps short under them.', 3.2],
    [70, 'SHAD', "A low sign ahead! When it flashes STAY LOW, don't jump under it.", 3.6],
    [100, 'DAD', "Main Street station! That was the science dome. I'd tell a chemistry joke, but I'd get no reaction.", 3.2],
    [136, 'KINAN', 'A tunnel! The train goes underground downtown.', 3],
    [190, 'SHAD', 'A springboard on the platform! Bounce up onto the express car, bud.', 3.4],
    [268, 'KINAN', "That little rain cloud got HUGE. It's sitting right on top of Canada Place.", 4],
    [330, 'SHAD', "Waterfront station. Glitchy ran right into that storm. Kinan... I think that cloud is lonely.", 4.6]
  ]
});

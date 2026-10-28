/* ============================================================
   LEVEL 5-7 · THE CALGARY TOWER
   (World 5 · Calgary Stampede · trail stop 9)
   Story bible (World 5 table): "Climb to the top; glass-floor jumps."
   Bronco is standing at the bottom of the Calgary Tower, looking up.
   Kinan goes up: the plaza, the tower's terraces, the elevator
   springboard, the observation deck and its famous GLASS FLOOR, a
   whole city straight down. Somewhere up here, pinned to a window, is
   something Kinan left behind when he was five.
   Idea (ONE): UP, THEN ACROSS NOTHING. Act 1 climbs (the terraces, the
     first elevator springboard throws Kinan onto the tower's first
     ring); act 2 is high up (gaps with the city far below, THE SKYWALK
     LEAP, the service stairs, the observation deck, THE GLASS FLOOR:
     glass panels between steel posts, some panels missing); act 3 tests
     it (the glass floor with 3-wide holes, then the long steep way down
     and the street, two 5-wide gaps).
   Acts (thirds): 0-98 teach (the plaza, the base TERRACE and a 3-wide
     gap, THE FIRST ELEVATOR up a 5-tall wall, the first ring and a
     3-wide gap) · 99-197 twist (a 4-wide gap, the checkpoint, THE
     SKYWALK LEAP, a 4-wide gap, the service stairs, the observation
     deck and its window frames, THE GLASS FLOOR 4/4/4/4) · 198-296 test
     (the glass floor 5/5 with 3-wide holes, the steep way down, a 5-wide
     gap, the Stephen Avenue RIDGE and a 5-wide gap, the plaza).
   Signature set-piece: THE GLASS FLOOR (S7-S8): walk on glass with the
     city straight below; hop the missing panels; one panel shows you
     something lost on a beam underneath.
   Secrets: visible = THE SPACE BEAN (S7): look down through the glass:
     a Space Bean keychain sits on a beam right under the second missing
     panel. Drop through the hole onto the beam, grab it, jump back up
     through the hole (heart + candles, 174,8) · hidden = THE RAINBOW
     WINDOW (S6): on the observation deck, jump under the window frames;
     the one where Kinan's rainbow drawing hangs glints (GOLDEN CANDLE,
     152,2) · skill = THE SKYWALK LEAP (S5): from the edge of the first
     ring, a full running leap to the window washers' platform floating
     out in the air (miss and you just land on the terrace below)
     (hat, 121,3).
   Look: borrows the Calgary Tower (theme 38): a sunset sky, the tower
     and the downtown skyline, grey concrete.
   Bubble beats for ER-4 (not wired): c2 Kinan: "Bronco's at the bottom
     of the TOWER." · c62 Shad: "Elevator's this way. Sort of." · c105
     checkpoint, a tourist: "Why did the tower go to school? To get a
     little HIGHER education." · c152 Kinan: "My rainbow drawing! I made
     that when I was FIVE." · c174 Chenoa: "Is that your Space Bean
     keychain? Down THERE?" · c222 "Okay. Now DOWN."
   ENGINE REQUESTS: a see-through glass skin for the glass-floor solids
     (the city drawn far below through them) and window-frame skins for
     the deck's roof · real elevators (moving platforms in a shaft; the
     springboards stand in) · the chinook wind gusts of legacy stage 38
     for authored levels (a 'wind' flag) · a tourist skin for the
     'mallwalker' and a photo flash for the 'camera' flyer · the rainbow
     drawing and the Space Bean keychain as memory props (story bible:
     World 5 memory) · bubbles ER-4.
  
   ============================================================ */
KinanLevels.register({
  id: '5-7', world: 5, slot: 9, kind: 'level',
  name: 'THE CALGARY TOWER',
  theme: 38,              /* the Calgary Tower: a sunset sky, the tower and the downtown skyline, grey concrete */
  cols: 297,
  heights: [
    /* S1 0-26 the plaza at the foot of the tower */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 the base TERRACE (c30-45) · a 3-wide gap c48-50 */
    192,192,192,184,176,176,176,176,176,168,160,160,160,160,160,160,160,176,192,192,192,null,null,null,192,192,192,
    /* S3 54-80 THE FIRST ELEVATOR: the springboard (c62) throws you up the 5-tall wall (c64-67) onto the first ring (112) */
    192,192,192,192,192,192,192,192,null,192,176,160,144,128,112,112,112,112,112,112,112,112,112,112,112,112,112,
    /* S4 81-107 the first ring: a 3-wide gap c87-89, a 4-wide gap c99-102 (the city far below) · checkpoint */
    112,112,112,112,112,112,null,null,null,112,112,112,112,112,112,112,112,112,null,null,null,null,112,112,112,112,112,
    /* S5 108-134 THE SKYWALK LEAP: the edge of the ring (c115), the window washers' platform out in the air (c120-121) · down to the terrace (144) · a 4-wide gap c128-131 */
    112,112,112,112,112,112,112,112,128,144,144,144,144,144,144,144,144,144,144,144,null,null,null,null,144,144,144,
    /* S6 135-161 the service stairs: a 3-tall wall (c141-142) up onto the observation deck (96) · the window frames (c146-160) */
    144,144,144,144,144,144,128,112,96,96,96,96,96,96,96,96,96,96,96,96,96,96,96,96,96,96,96,
    /* S7 162-188 THE GLASS FLOOR: steel posts (c162, c167, c172, c177) with glass between them, panels missing at c165-166, c168-169, c174-175 (THE SPACE BEAN on a beam below), c178-179 */
    96,null,null,null,null,96,null,null,null,null,96,null,null,null,null,96,null,null,null,null,96,96,96,96,96,96,96,
    /* S8 189-215 more GLASS FLOOR: 3-wide holes c200-202 and c204-205 */
    96,96,96,96,96,96,96,96,96,null,null,null,null,null,96,null,null,null,null,null,96,96,96,96,96,96,96,
    /* S9 216-242 the torch lookout · THE WAY DOWN (c222-227, steep) · a 5-wide gap c236-240 */
    96,96,96,96,96,96,112,128,144,160,176,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,
    /* S10 243-269 the Stephen Avenue RIDGE (c246-259) · a 5-wide gap c262-266 */
    192,192,192,184,176,168,160,160,160,160,160,160,160,168,176,184,192,192,192,null,null,null,null,null,192,192,192,
    /* S11 270-296 reward: the plaza again, Dad's truck */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [64, 7, 67, 11],   /* S3 the tower's 5-tall base wall over its hidden stairs */
    [141, 6, 142, 8], [146, 2, 160, 2],   /* S6 the deck wall over its stairs · THE RAINBOW WINDOW's frames (a glinting one at c152) */
    [163, 6, 164, 6], [170, 6, 171, 6], [173, 6, 173, 6], [176, 6, 176, 6], [180, 6, 181, 6],   /* S7 THE GLASS FLOOR's panels */
    [174, 9, 175, 9],   /* S7 the beam under the third missing panel (THE SPACE BEAN rests on it) */
    [198, 6, 199, 6], [206, 6, 208, 6]   /* S8 more glass panels */
  ],
  tiles: {
    gift: [
      [5, 8, 'popper'],   /* S1 */
      [40, 6],   /* S2 over the terrace */
      [94, 3],   /* S4 */
      [152, 2, 'gold'],   /* S6 THE RAINBOW WINDOW (hidden) */
      [192, 2, 'heart'],   /* S8 */
      [218, 2],   /* S9 */
      [252, 5],   /* S10 over the ridge */
      [277, 8], [279, 8, 'heart'], [281, 8, 'cake']   /* S11 the plaza */
    ],
    brick: [
      [4, 8], [6, 8],   /* S1 */
      [39, 6], [41, 6],   /* S2 */
      [93, 3], [95, 3],   /* S4 */
      [191, 2], [193, 2],   /* S8 */
      [251, 5], [253, 5],   /* S10 */
      [276, 8], [278, 8], [280, 8], [282, 8]   /* S11 */
    ],
    spring: [
      [62, 12]   /* THE FIRST ELEVATOR: the springboard, flush in the floor */
    ],
    shelf: [
      [120, 4], [121, 4]   /* S5 THE SKYWALK LEAP: the window washers' platform (skill secret) */
    ]
  },
  /* tourists stroll (tough walkers), cameras flash and swoop, magpies and crows ride the wind, geese everywhere; nothing waits at a lip, a springboard or a missing panel */
  foes: [
    [18, 11, 'mallwalker'],   /* S1 */
    [41, 9, 'mallwalker'],   /* S2 */
    [58, 5, 'camera'], [75, 2, 'magpie'],   /* S3 */
    [93, 6, 'mallwalker'], [101, 2, 'crow'],   /* S4 */
    [112, 1, 'camera'], [125, 2, 'crow'],   /* S5 */
    [158, 5, 'mallwalker'],   /* S6 on the deck */
    [170, 1, 'camera'], [185, 2, 'goose'],   /* S7 over the glass */
    [194, 5, 'mallwalker'], [203, 1, 'magpie'], [212, 2, 'crow'],   /* S8 */
    [218, 5, 'mallwalker'], [232, 3, 'goose'],   /* S9 */
    [247, 10, 'mallwalker'], [264, 3, 'camera'],   /* S10 on the way up the ridge */
    [288, 11, 'mallwalker']   /* S11 */
  ],
  candles: [
    [2, 11], [3, 11], [4, 11], [5, 7], [10, 11], [13, 11], [16, 11], [19, 11], [22, 11], [30, 11], [31, 10], [32, 10], [33, 10], [34, 10],
    [35, 10], [36, 9], [37, 9], [38, 9], [39, 9], [40, 9], [41, 9], [42, 9], [43, 9], [40, 5], [44, 10], [45, 11], [47, 11], [48, 9],
    [49, 8], [50, 9], [51, 11], [52, 11], [53, 11], [55, 11], [57, 11], [59, 11], [61, 11], [62, 10], [62, 8], [63, 6], [64, 5], [65, 5],
    [66, 5], [68, 6], [70, 6], [72, 6], [74, 6], [76, 6], [78, 6], [80, 6], [81, 6], [83, 6], [85, 6], [86, 6], [87, 4], [88, 3],
    [89, 4], [90, 6], [92, 6], [94, 6], [96, 6], [98, 6], [94, 2], [99, 4], [100, 3], [101, 3], [102, 4], [103, 6], [105, 6], [107, 6],
    [108, 6], [109, 6], [110, 6], [111, 6], [112, 6], [113, 6], [114, 6], [115, 6], [117, 4], [118, 3], [119, 3], [121, 2], [116, 7], [117, 8],
    [118, 8], [121, 8], [124, 8], [127, 8], [128, 6], [129, 5], [130, 5], [131, 6], [132, 8], [133, 8], [134, 8], [135, 8], [136, 8], [137, 8],
    [138, 8], [139, 8], [140, 8], [141, 5], [142, 5], [144, 5], [146, 5], [148, 5], [150, 5], [152, 5], [154, 5], [156, 5], [158, 5], [160, 5],
    [152, 4], [162, 5], [163, 5], [164, 5], [165, 2], [166, 2], [167, 5], [170, 5], [171, 5], [173, 5], [174, 2], [175, 2], [176, 5], [174, 7],
    [175, 7], [177, 5], [178, 2], [179, 2], [180, 5], [182, 5], [184, 5], [186, 5], [188, 5], [189, 5], [191, 5], [193, 5], [195, 5], [197, 5],
    [192, 1], [198, 5], [199, 5], [200, 3], [201, 2], [202, 3], [203, 5], [204, 2], [205, 2], [206, 5], [208, 5], [210, 5], [212, 5], [214, 5],
    [216, 5], [218, 5], [220, 5], [222, 6], [223, 7], [224, 8], [225, 9], [226, 10], [227, 11], [229, 11], [231, 11], [233, 11], [235, 11], [236, 9],
    [237, 8], [238, 8], [239, 8], [240, 9], [241, 11], [242, 11], [243, 11], [244, 11], [245, 11], [246, 10], [247, 9], [248, 8], [250, 9], [251, 9],
    [252, 9], [253, 9], [254, 9], [255, 9], [252, 4], [257, 9], [258, 10], [261, 11], [262, 9], [263, 8], [264, 8], [265, 8], [266, 9], [267, 11],
    [268, 11], [269, 11], [271, 11], [273, 11], [275, 11], [277, 7], [279, 7], [281, 7], [284, 11], [286, 11], [288, 11], [290, 11], [292, 11], [288, 8],
    [289, 7], [290, 8]
  ],
  secrets: [
    { kind: 'visible', col: 174, row: 8, prize: 'heart+candles' },   /* THE SPACE BEAN on the beam under the missing panel */
    { kind: 'hidden', col: 152, row: 2, prize: 'GOLDEN CANDLE', glint240: true },   /* THE RAINBOW WINDOW: the glinting window frame */
    { kind: 'skill', col: 121, row: 3, prize: 'hat' }   /* THE SKYWALK LEAP to the window washers' platform */
  ],
  goldenCandle: { col: 152, row: 2 },
  checkpoint: { col: 105, row: 6 },
  spawn: { col: 2, row: 11 },
  goal: { col: 293, row: 11 }   /* Dad's truck waits at the plaza */
});

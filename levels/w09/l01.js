/* ============================================================
   LEVEL 9-1 · OLD MONTREAL
   (World 9 · Montreal · trail stop 1)
   Story bible (World 9 table): "Cobblestones, horse carriages,
   balconies. Gentle opener." Glitchy rode a hockey bag on the train
   from Toronto, and the family follows him into Old Montreal. Big Bro
   Shad's girlfriend Annie is at a huge tech conference in town... and
   her scanners have just picked up some ROGUE CODE.
   Idea (ONE): THE BALCONIES. Grey-stone houses with iron balconies:
     jump up through a balcony from below and stand on it. Act 1 teaches
     it (a low balcony over the street, then THE FIRST FACADE: a house
     too tall to jump, with one balcony in front of it: up the balcony,
     up onto the roof); act 2 twists it (THE FLOWER BALCONY two
     balconies up, the carriage's roof as a step); act 3 tests it (THE
     SECOND FACADE, seven tiles tall, two balconies to climb).
   The carriage (opt-in `rollers`, look 'carriage'): slow horse
     carriages roll up and down the cobbled street. Stand on the roof
     and it carries you; from the roof Kinan reaches the gift blocks
     hung over the street in S5 (too high to bump from the street).
     Never needed: the street under it is always solid.
   Acts (thirds): 0-89 teach (the street, the 2 gap, the plateau's 3
     gap, THE FIRST FACADE) · 90-179 twist (THE ARCADE SIGN, the 4 gap,
     the carriage street and THE FLOWER BALCONY, the climb to the
     square, 4/4) · 180-269 test (the checkpoint, 5, THE SECOND FACADE,
     5, the bell tower, the café).
   Secrets: visible = THE FLOWER BALCONY (S5): a balcony two floors up;
     hop onto the low balcony, then up (heart + candles, 120,5) ·
     hidden = THE ARCADE SIGN (S4): the stone sign hanging over the
     street has one glinting panel; jump under it (GOLDEN CANDLE, 90,6;
     two candles under it point up) · skill = THE BELL TOWER (S10):
     bounce off the spring and steer onto the bell-tower ledge (hat,
     250,2).
   Board (taekwondo, a bonus spot): the café's window box on the ledge
     by the goal (S10): hop onto the ledge from the right and KICK the
     board: 2 candles inside. Never on the main path.
   Gaps: act 1 2/3 · act 2 4/4/4 · act 3 5/5, each with a candle arc;
     nothing waits at a lip. A full-run jump off either facade's roof,
     the flower balcony or the bell tower ledge comes down on floor
     (w9-levels.spec.ts checks it).
   Look: Old Montreal (theme 110, World 9's own look): the basilica's
     twin stone towers, grey-stone houses with green copper roofs and
     dormers, iron street lamps, a BIENVENUE banner.
   ENGINE REQUESTS: a cobblestone ground skin (the street wears the
     theme's stone colours today).
   ============================================================ */
KinanLevels.register({
  id: '9-1', world: 9, slot: 1, kind: 'level',
  name: 'OLD MONTREAL',
  theme: 110,   /* Old Montreal: the basilica's towers, grey-stone houses, copper roofs */
  cols: 270,
  /* THE CARRIAGES (World 9 twist, opt-in): [c0, c1, row, width, speed, look] — the roof is the platform (row 10: two
     tiles over the street), rolling level between c0 and c1 */
  rollers: [
    [14, 36, 10, 3, 0.4, 'carriage'],   /* S1-S2 the first carriage */
    [108, 133, 10, 3, 0.5, 'carriage'],   /* S5 under the gift blocks hung over the street */
    [236, 262, 10, 3, 0.5, 'carriage']   /* S9-S10 by the café */
  ],
  skins: [
    ['balcony', 8, 9, 10, 9], ['balcony', 71, 9, 73, 9], ['balcony', 115, 9, 117, 9], ['balcony', 119, 6, 121, 6],
    ['balcony', 205, 9, 207, 9], ['balcony', 206, 7, 207, 7], ['balcony', 249, 3, 251, 3]
  ],
  heights: [
    /* S1 0-26 the street: a low balcony (c8-10), the first carriage */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 a 2-wide gap c38-39, up the slope to the plateau */
    192,192,192,192,192,192,192,192,192,192,192,null,null,192,192,192,192,192,192,184,176,176,176,176,176,176,176,
    /* S3 54-80 a 3-wide gap c59-61, down the slope, THE FIRST FACADE (house c74-79, balcony c71-73), down its steps */
    176,176,176,176,176,null,null,null,176,176,176,176,176,176,184,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 THE ARCADE SIGN (c88-92), a 4-wide gap c98-101 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,
    /* S5 108-134 the carriage street: THE FLOWER BALCONY (c115-121), gift blocks over the street (c124-128) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 a 4-wide gap c141-144, up the slopes to the square */
    192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,184,176,176,168,160,160,160,160,160,160,160,160,
    /* S7 162-188 a 4-wide gap c167-170 on the square, down the slope, the checkpoint */
    160,160,160,160,160,null,null,null,null,160,160,160,160,160,160,168,176,184,192,192,192,192,192,192,192,192,192,
    /* S8 189-215 a 5-wide gap c195-199, THE SECOND FACADE (house c208-213, balconies c205-207) */
    192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S9 216-242 down the facade's steps, a 5-wide gap c230-234 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,
    /* S10 243-269 reward: THE BELL TOWER (spring c248, ledge c249-251 row 3), the café (board), the gift row, the goal */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [74, 6, 79, 11],   /* S3 THE FIRST FACADE: a stone house six tiles tall (its balcony is in front, c71-73) */
    [80, 8, 81, 11], [82, 10, 83, 11],   /* S3 the steps down its far side */
    [88, 3, 92, 6],   /* S4 THE ARCADE SIGN hanging over the street (the hidden gift is one of its panels) */
    [208, 5, 213, 11],   /* S8 THE SECOND FACADE: seven tiles tall (two balconies in front, c205-207) */
    [214, 7, 215, 11], [216, 9, 217, 11], [218, 11, 219, 11],   /* S9 the steps down its far side */
    [254, 9, 260, 9], [254, 7, 257, 7], [254, 8, 254, 8]   /* S10 the café's window box on a ledge (walk under it); its board faces right */
  ],
  tiles: {
    gift: [
      [5, 8],   /* S1 */
      [33, 8],   /* S2 */
      [64, 7],   /* S3 on the plateau */
      [90, 6, 'gold'],   /* S4 THE ARCADE SIGN: the glinting panel (hidden) */
      [94, 8],   /* S4 */
      [124, 6], [126, 6], [128, 6],   /* S5 hung over the street: bump them from the carriage roof */
      [146, 8],   /* S6 */
      [174, 6],   /* S7 on the square */
      [202, 8],   /* S8 */
      [224, 8],   /* S9 */
      [262, 8, 'heart'], [264, 8, 'cake']   /* S10 the gift row */
    ],
    brick: [
      [4, 8], [6, 8],   /* S1 */
      [125, 6], [127, 6],   /* S5 */
      [223, 8], [225, 8],   /* S9 */
      [263, 8]   /* S10 */
    ],
    spring: [
      [248, 11]   /* S10 the spring under THE BELL TOWER (skill secret) */
    ],
    shelf: [
      [8, 9], [9, 9], [10, 9],   /* S1 the first balcony */
      [71, 9], [72, 9], [73, 9],   /* S3 the balcony in front of THE FIRST FACADE */
      [115, 9], [116, 9], [117, 9],   /* S5 the low balcony */
      [119, 6], [120, 6], [121, 6],   /* S5 THE FLOWER BALCONY (visible secret) */
      [205, 9], [206, 9], [207, 9], [206, 7], [207, 7],   /* S8 the two balconies in front of THE SECOND FACADE */
      [249, 3], [250, 3], [251, 3]   /* S10 THE BELL TOWER ledge (skill secret) */
    ],
    board: [[257, 8]]   /* BONUS: hop onto the café ledge from the right and KICK the board: 2 candles inside */
  },
  /* orange construction cones (it's Montreal), street musicians, a rollerblader, crows and seagulls. Nothing waits at a lip. */
  foes: [
    [22, 11, 'cone'],   /* S1 */
    [31, 11, 'cone'],   /* S2 */
    [64, 10, 'cone'],   /* S3 on the plateau */
    [84, 11, 'busker'], [104, 11, 'cone'],   /* S4 */
    [112, 8, 'crow'], [130, 11, 'rollerblader'],   /* S5 */
    [137, 7, 'seagull'], [147, 11, 'cone'],   /* S6 */
    [168, 6, 'crow'], [174, 9, 'cone'],   /* S7 */
    [191, 11, 'cone'], [197, 7, 'seagull'], [203, 11, 'busker'],   /* S8 */
    [222, 11, 'rollerblader'], [232, 7, 'crow'], [238, 11, 'cone'],   /* S9 */
    [246, 11, 'cone']   /* S10 */
  ],
  candles: [
    [4, 11], [6, 11], [8, 8], [9, 8], [10, 8], [12, 11], [14, 11], [16, 11], [18, 9], [20, 9], [22, 9], [24, 11], [26, 11],
    [28, 11], [30, 11], [35, 11], [37, 10], [38, 9], [39, 9], [40, 10], [42, 11], [44, 11], [46, 10], [48, 10], [50, 10], [52, 10],
    [54, 10], [56, 10], [58, 9], [59, 8], [60, 8], [61, 8], [62, 9], [66, 10], [68, 10], [70, 11], [71, 8], [72, 8], [73, 8], [74, 5], [76, 5], [78, 5], [80, 7], [82, 9],
    [85, 11], [87, 11], [90, 9], [90, 8], [93, 11], [95, 11], [97, 10], [98, 9], [99, 8], [100, 8], [101, 9], [102, 10], [105, 11], [107, 11],
    [109, 11], [111, 11], [113, 11], [115, 8], [116, 8], [117, 8], [119, 5], [121, 5], [124, 9], [126, 9], [128, 9], [131, 11], [133, 11],
    [136, 11], [138, 11], [140, 10], [141, 9], [142, 8], [143, 8], [144, 9], [145, 10], [148, 11], [150, 10], [152, 10], [154, 9], [156, 9], [158, 9], [160, 9],
    [162, 9], [164, 9], [166, 8], [167, 7], [168, 7], [169, 7], [170, 8], [171, 8], [176, 9], [178, 10], [180, 11], [182, 11], [185, 11], [187, 11],
    [190, 11], [192, 11], [194, 10], [195, 9], [196, 8], [197, 8], [198, 8], [199, 9], [200, 10], [204, 11], [205, 8], [206, 8], [207, 8], [206, 6], [207, 6], [209, 4], [211, 4], [213, 4],
    [214, 6], [216, 8], [218, 10], [221, 11], [227, 11], [229, 10], [230, 9], [231, 8], [232, 8], [233, 8], [234, 9], [235, 10], [237, 11], [239, 11], [241, 11],
    [244, 11], [248, 9], [248, 7], [249, 5], [262, 10], [264, 10], [266, 11],
    [255, 8], [256, 8]   /* inside the café window box, behind the board */
  ],
  secrets: [
    { kind: 'visible', col: 120, row: 5, prize: 'heart+candles' },   /* THE FLOWER BALCONY: up the low balcony, then onto it */
    { kind: 'hidden', col: 90, row: 6, prize: 'GOLDEN CANDLE', glint240: true },   /* THE ARCADE SIGN: the glinting panel */
    { kind: 'skill', col: 250, row: 2, prize: 'hat' }   /* THE BELL TOWER: the spring, then steer onto the ledge */
  ],
  goldenCandle: { col: 90, row: 6 },
  checkpoint: { col: 183, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 267, row: 11 },   /* the end of the street: on to the Old Port */
  talk: [
    [2, 'KINAN', 'Montreal! Glitchy rode the train here in a hockey bag. He has to be somewhere in Old Montreal!', 4],
    [7, 'MOM', 'Look at the balconies, sweetie. Jump up through one and you can stand on top!', 3.6],
    [17, 'DAD', 'A horse and carriage! Hop up on the roof and ride along, bud. Neigh problem.', 3.2],
    [30, "DAD", "Why did the bagel get a passport? Because it wanted to... hee... HAHA... to see the... I can't—", 4, "wheeze"],
    [30, "KINAN", "...to see the WORLD. Because it's round, Mom. That's the joke.", 3.2],
    [30, "MOM", "Ha! Oh, I love you two. Go, go, Glitchy is getting away!", 3, "laugh"],
    [29, 'PASSER-BY', 'Bonjour! Bienvenue à Montréal! (Hello! Welcome to Montreal!)', 3.4],
    [66, 'CHENOA', "That house is too tall to jump. Use the balcony like a step, little bro!", 3.6],
    [150, 'SHAD', "Annie texted me. She's at the big tech conference here, and her scanners just spotted some ROGUE CODE downtown.", 5],
    [244, 'KINAN', "Rogue code? That's GLITCHY! I have to find him before Annie's drones do!", 3.6]
  ]
});

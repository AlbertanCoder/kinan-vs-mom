/* ============================================================
   LEVEL 9-8 · THE CONFERENCE FLOOR
   (World 9 · Montreal · trail stop 10)
   Story bible (World 9 table): "Booths, robot demos and Annie's
   firewall walls closing in; the hardest regular level so far." Next
   door to the lofts is the huge tech conference where Annie works.
   Glitchy's hockey bag is somewhere on the conference floor, Annie has
   found him on her screens, and she shuts the floor down section by
   section with glowing FIREWALL walls while her deletion drones hunt
   for the rogue code. She is not mean: she is protecting every
   computer in the building. Kinan has to get through first.
   Idea (ONE): ANNIE'S FIREWALLS (opt-in `firewalls`). A firewall is a
     glowing wall from the floor to high over Kinan's head: it is open
     for a while, flickers for almost a second, then shuts; then it
     opens again. Shutting never traps him (he is put out on the nearer
     side). Act 1 teaches it (one wall on flat ground, then two in a
     row); act 2 twists it (THE FIREWALL CORRIDOR: four walls that open
     one after another, left to right, at running speed: run through all
     four in one go, or wait for the next wave); act 3 tests it (a pair
     of walls on the keynote stage before a 5-wide gap, and the last
     corridor of three, quicker, before another). Annie's DELETION DRONES (pink, a red
     visor) drift after Kinan when he is near; her scanner drones are
     back too.
   Every firewall stands on flat floor with 5+ tiles of run-up after it
     before any gap, and none is in a pit's landing.
   Acts (thirds): 0-89 teach (the registration hall 3, THE FIRST
     FIREWALL, the booths, two firewalls, 3, up onto the robot demo
     stage) · 90-179 twist (THE JUMBOTRON LEDGE, 4, the checkpoint, THE
     FIREWALL CORRIDOR, THE PRIZE BOOTH, down, 4, a firewall, 4) ·
     180-269 test (THE KEYNOTE STAGE: two firewalls, 5, the last
     corridor of three, 5, the back door).
   Secrets: visible = THE JUMBOTRON LEDGE (S4): a ledge one full jump
     over the robot demo stage (heart + candles, 89,5) · hidden = THE
     PRIZE BOOTH (S5): past the corridor, one block of the booth's sign
     glints; hop on the counter and bump it (GOLDEN CANDLE, 130,4) ·
     skill = THE LIGHTING RIG (S10): from the speaker stack, one full
     jump up to the truss (hat, 254,3).
   Gaps: act 1 3/3 · act 2 4/4/4 · act 3 5/5, plus 13 firewalls (one,
     two, four in a corridor, one, two, three). Every gap has a candle
     arc; nothing waits at a lip; no candle or foe sits in a firewall's
     column. A full-run jump off the booth, the jumbotron ledge, the
     prize booth's counter, the speaker stack or the lighting rig comes
     down on floor (w9-levels.spec.ts checks it).
   Look: the Conference Floor (theme 118, World 9's own look): the dark
     hall, big screens, booths, coloured stage lights.
   ENGINE REQUESTS: none.
   ============================================================ */
KinanLevels.register({
  id: '9-8', world: 9, slot: 10, kind: 'level',
  name: 'THE CONFERENCE FLOOR',
  theme: 118,   /* the Conference Floor: the dark hall, big screens, booths, stage lights */
  cols: 270,
  /* ANNIE'S FIREWALLS (World 9 twist, opt-in): [col, rowTop, rowBottom, period, open, phase] — open while
     (time + phase) % period < open, a warning flicker for the last 50 open frames, then shut */
  firewalls: [
    [38, 3, 11, 240, 150, 0],   /* F1 THE FIRST FIREWALL (alone, on flat floor) */
    [58, 3, 11, 240, 130, 0], [64, 3, 11, 240, 130, 220],   /* F2-F3 two in a row (F3 opens 20 frames after F2) */
    [114, 1, 9, 240, 120, 0], [118, 1, 9, 240, 120, 220], [122, 1, 9, 240, 120, 200], [126, 1, 9, 240, 120, 180],   /* F4-F7 THE FIREWALL CORRIDOR: a wave, 20 frames apart */
    [166, 3, 11, 200, 140, 0],   /* F8 before the 4 gap c176-179 (9 tiles of run-up) */
    [195, 1, 9, 240, 120, 0], [199, 1, 9, 240, 120, 225],   /* F9-F10 the keynote stage */
    [219, 1, 9, 200, 100, 0], [222, 1, 9, 200, 100, 185], [225, 1, 9, 200, 100, 170]   /* F11-F13 the last corridor: quicker */
  ],
  skins: [
    ['booth', 45, 10, 47, 11],   /* a demo booth to hop over */
    ['booth', 129, 8, 132, 9], ['booth', 129, 4, 132, 4],   /* THE PRIZE BOOTH: its counter and its sign */
    ['steel', 250, 8, 251, 9]   /* the speaker stack */
  ],
  heights: [
    /* S1 0-26 the registration hall: a 3 gap c12-14 */
    192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 THE FIRST FIREWALL (c38), a demo booth (c45-47) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 two firewalls (c58, c64), a 3 gap c72-74 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,
    /* S4 81-107 up onto THE ROBOT DEMO STAGE (row 10), THE JUMBOTRON LEDGE (c88-90 row 6), a 4 gap c104-107 */
    192,192,192,176,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,null,null,null,null,
    /* S5 108-134 the checkpoint (c110), THE FIREWALL CORRIDOR (c114, c118, c122, c126), THE PRIZE BOOTH (c129-132) */
    160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,
    /* S6 135-161 down off the stage, a 4 gap c148-151 */
    160,160,176,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 a firewall (c166), a 4 gap c176-179 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,
    /* S8 189-215 up onto THE KEYNOTE STAGE: two firewalls (c195, c199), a 5 gap c206-210 */
    192,192,176,160,160,160,160,160,160,160,160,160,160,160,160,160,160,null,null,null,null,null,160,160,160,160,160,
    /* S9 216-242 THE LAST CORRIDOR (c219, c222, c225), a 5 gap c233-237 */
    160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,null,null,null,null,null,160,160,160,160,160,
    /* S10 243-269 the back door: the speaker stack (c250-251), THE LIGHTING RIG (c253-255 row 4), the goal */
    160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160
  ],
  solid: [
    [45, 10, 47, 11],   /* S2 a demo booth (two tiles: hop over it) */
    [129, 8, 132, 9], [129, 4, 132, 4],   /* S5 THE PRIZE BOOTH: the counter (hop on) and its sign (the hidden gift is one block) */
    [250, 8, 251, 9]   /* S10 the speaker stack */
  ],
  tiles: {
    gift: [
      [6, 8],   /* S1 */
      [41, 8],   /* S2 */
      [68, 8],   /* S3 */
      [95, 6],   /* S4 on the stage */
      [130, 4, 'gold'],   /* S5 THE PRIZE BOOTH: the glinting block in the sign (hidden) */
      [143, 8],   /* S6 */
      [170, 8],   /* S7 */
      [202, 6],   /* S8 */
      [229, 6],   /* S9 */
      [258, 6, 'heart'], [260, 6, 'cake']   /* S10 the gift row */
    ],
    brick: [
      [5, 8], [7, 8],   /* S1 */
      [94, 6], [96, 6],   /* S4 */
      [259, 6]   /* S10 */
    ],
    shelf: [
      [88, 6], [89, 6], [90, 6],   /* S4 THE JUMBOTRON LEDGE (visible secret) */
      [253, 4], [254, 4], [255, 4]   /* S10 THE LIGHTING RIG (skill secret) */
    ]
  },
  /* conference visitors, demo robots, cleaning robots; Annie's deletion drones and scanner drones. Nothing waits at a
     lip; nothing stands in a firewall's column. */
  foes: [
    [8, 11, 'mallwalker'], [20, 11, 'robot'],   /* S1 */
    [30, 11, 'roomba'], [42, 5, 'scanner'], [51, 11, 'robot'],   /* S2 */
    [61, 11, 'mallwalker'], [67, 11, 'roomba'], [78, 6, 'deleter'],   /* S3 */
    [87, 9, 'robot'], [93, 4, 'deleter'], [98, 9, 'robot'],   /* S4 */
    [133, 9, 'robot'],   /* S5 */
    [140, 11, 'mallwalker'], [145, 5, 'deleter'], [157, 11, 'roomba'], [160, 5, 'scanner'],   /* S6 */
    [163, 11, 'robot'], [171, 5, 'deleter'], [184, 11, 'mallwalker'],   /* S7 */
    [193, 9, 'robot'], [203, 4, 'deleter'], [213, 9, 'robot'],   /* S8 */
    [217, 9, 'roomba'], [228, 4, 'deleter'], [240, 9, 'robot'],   /* S9 */
    [247, 9, 'mallwalker'], [256, 5, 'scanner'], [262, 9, 'robot']   /* S10 */
  ],
  candles: [
    [3, 11], [5, 11], [7, 11], [9, 11], [11, 10], [12, 9], [13, 8], [14, 9], [15, 10], [17, 11], [19, 11], [21, 11], [23, 11], [25, 11],
    [27, 11], [29, 11], [31, 11], [33, 11], [35, 11], [37, 11], [40, 11], [42, 11], [44, 10], [45, 9], [47, 9], [48, 10], [50, 11], [52, 11],
    [54, 11], [56, 11], [60, 11], [62, 11], [66, 11], [68, 11], [70, 11], [71, 10], [72, 9], [73, 8], [74, 8], [75, 9], [76, 10], [78, 11], [80, 11],
    [81, 11], [83, 11], [84, 10], [85, 9], [87, 9], [88, 5], [90, 5], [92, 9], [94, 9], [96, 9], [98, 9], [100, 9], [102, 9], [103, 8], [104, 7], [105, 6], [106, 6], [107, 7],
    [108, 8], [109, 9], [111, 9], [112, 9], [116, 9], [120, 9], [124, 9], [128, 9], [129, 7], [131, 7], [133, 9],
    [135, 9], [136, 9], [137, 10], [138, 11], [140, 11], [142, 11], [144, 11], [146, 11], [147, 10], [148, 9], [149, 8], [150, 7], [151, 8], [152, 9], [153, 10], [155, 11], [157, 11], [159, 11], [161, 11],
    [162, 11], [164, 11], [168, 11], [170, 11], [172, 11], [174, 11], [175, 10], [176, 9], [177, 8], [178, 7], [179, 8], [180, 9], [181, 10], [183, 11], [185, 11], [187, 11],
    [189, 11], [190, 11], [191, 10], [192, 9], [194, 9], [197, 9], [201, 9], [203, 9], [205, 8], [206, 7], [207, 6], [208, 5], [209, 6], [210, 7], [211, 8], [213, 9], [215, 9],
    [216, 9], [218, 9], [220, 9], [221, 9], [223, 9], [224, 9], [227, 9], [229, 9], [231, 9], [232, 8], [233, 7], [234, 6], [235, 5], [236, 6], [237, 7], [238, 8], [240, 9], [242, 9],
    [244, 9], [246, 9], [248, 9], [250, 7], [251, 7], [253, 3], [255, 3], [257, 9], [262, 9], [264, 9]
  ],
  secrets: [
    { kind: 'visible', col: 89, row: 5, prize: 'heart+candles' },   /* THE JUMBOTRON LEDGE: one full jump up from the stage */
    { kind: 'hidden', col: 130, row: 4, prize: 'GOLDEN CANDLE', glint240: true },   /* THE PRIZE BOOTH: hop on the counter, bump the glinting sign block */
    { kind: 'skill', col: 254, row: 3, prize: 'hat' }   /* THE LIGHTING RIG: one full jump from the top of the speaker stack */
  ],
  goldenCandle: { col: 130, row: 4 },
  checkpoint: { col: 110, row: 9 },
  spawn: { col: 2, row: 11 },
  goal: { col: 266, row: 9 },   /* the back door of the conference hall */
  talk: [
    [2, 'KINAN', 'The tech conference! Robots, booths, giant screens... and Annie is here somewhere.', 3.8],
    [28, 'ANNIE', "Attention, drones! The rogue code is on the conference floor. Firewalls up! Chalo! (Let's go!)", 4.2],
    [33, 'DAD', 'See that glowing wall, bud? Wait for it to open, then go. It flickers before it shuts. Very wall-mannered.', 4],
    [86, 'CHENOA', "A robot demo! Look, little bro, that one's doing the robot dance.", 3.4],
    [109, 'SHAD', "That's Annie's firewall corridor. The walls open one after another: run through all four in one go!", 4.4],
    [139, 'PASSER-BY', 'Bonjour! Did you see a little glitchy guy with a hockey bag run by?', 3.4],
    [190, 'ANNIE', 'Kinan?! Is that you? That code could get into every computer in here. I have to stop it!', 4.2],
    [244, 'MOM', "Glitchy ran out the back door, sweetie! Annie's right behind him. Go, go, go!", 3.8],
    [257, 'ANNIE', "Hmm. That little glitch doesn't look dangerous... Shabash, Kinan! (Well done!) But I still have to catch it.", 4.8]
  ]
});

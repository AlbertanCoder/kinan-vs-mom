/* ============================================================
   LEVEL 9-7 · THE STARTUP LOFTS
   (World 9 · Montreal · trail stop 9)
   Story bible (World 9 table): "Open-plan offices, scooters and a
   giant whiteboard maze." Out of the Underground City (or the space
   centre), Glitchy's hockey bag rolls into an old brick factory turned
   into startup lofts: open-plan offices, rolling chairs, scooters in
   the hallways, a break room and whiteboards everywhere, right next to
   the conference centre where Annie is.
   Idea (ONE): THINGS ON WHEELS, AND THE WHITEBOARD MAZE. Rolling office
     chairs and scooters (opt-in `rollers`, looks 'chair' and 'scooter')
     roll back and forth: a chair at floor height rolls across a gap
     (CHAIR BRIDGE: step on and hold still, it carries you over), a
     scooter rolls along a lane three tiles up (jump on, ride it over the
     gaps, grab what only a rider reaches). The whiteboards (skin
     'whiteboard') hang from the ceiling (duck under: walk, don't jump)
     or stand on the floor (hop over). Act 1 teaches it (a chair in the
     lobby, the open office's desks and THE BOOKSHELF, CHAIR BRIDGE 1,
     the scooter lane, the break room); act 2 twists it (THE WHITEBOARD
     MAZE: under, over, under, over; the checkpoint; CHAIR BRIDGE 2 over
     a 4; THE SCOOTER RACE over a 3 and a 4); act 3 tests it (two 5s
     with whiteboards right after them, THE BOARDROOM).
   Acts (thirds): 0-89 teach (the lobby 3, the open office, 3 with a
     chair, the scooter lane, 3) · 90-179 twist (the break room, THE
     WHITEBOARD MAZE, the checkpoint, 4 with a chair, the scooter race
     3/4) · 180-269 test (5, the giant whiteboards, 5, THE BOARDROOM).
   Secrets: visible = THE BOOKSHELF (S2): a shelf one full jump over the
     desks (heart + candles, 33,5) · hidden = THE COFFEE CABINET (S4): one
     cabinet door over the break-room counter glints; hop on the counter
     and bump it (GOLDEN CANDLE, 95,6) · skill = THE BOARDROOM SHELVES
     (S10): from the standing whiteboard, two full jumps up two shelves
     to the very top (hat, 255,1).
   Board (taekwondo, a bonus spot): THE SUPPLY CLOSET in the break room
     (S4): hop onto its ledge from the right and KICK the board: 2
     candles inside. Never on the main path.
   Gaps: act 1 3/3/3 · act 2 4/3/4 · act 3 5/5. Every gap has a candle
     arc; the chair bridges have a low row of candles only a rider gets.
     Nothing waits at a lip. A full-run jump off the desks, the
     bookshelf, a standing whiteboard or the boardroom shelves comes down
     on floor (w9-levels.spec.ts checks it).
   Look: the Startup Lofts (theme 117, World 9's own look): old red brick
     and big factory windows, hanging lamps, plants, bean bags.
   ENGINE REQUESTS: a desk skin for the desk shelves; a coffee-machine
     prop on the counter.
   ============================================================ */
KinanLevels.register({
  id: '9-7', world: 9, slot: 9, kind: 'level',
  name: 'THE STARTUP LOFTS',
  theme: 117,   /* the Startup Lofts: red brick, factory windows, hanging lamps, plants */
  cols: 270,
  /* THINGS ON WHEELS (World 9 twist, opt-in): [c0, c1, row, w, speed, look] — a platform w tiles wide rolls level
     between the two columns, its top at row `row` */
  rollers: [
    [17, 26, 10, 2, 0.5, 'chair'],   /* the lobby: a chair to try (nothing under it but floor) */
    [49, 56, 12, 2, 0.5, 'chair'],   /* CHAIR BRIDGE 1 over the 3 gap c50-52 (it rolls on past both lips) */
    [56, 78, 9, 3, 1.1, 'scooter'],   /* THE SCOOTER LANE (three tiles up) */
    [145, 152, 12, 2, 0.6, 'chair'],   /* CHAIR BRIDGE 2 over the 4 gap c146-149 */
    [163, 186, 9, 3, 1.2, 'scooter']   /* THE SCOOTER RACE: over the 3 and the 4 */
  ],
  skins: [
    ['whiteboard', 112, 3, 113, 9], ['whiteboard', 118, 10, 119, 11], ['whiteboard', 125, 3, 126, 9], ['whiteboard', 131, 10, 132, 11],
    ['whiteboard', 140, 3, 141, 9], ['whiteboard', 153, 10, 154, 11], ['whiteboard', 207, 3, 208, 9], ['whiteboard', 211, 10, 212, 11],
    ['whiteboard', 235, 3, 236, 9], ['whiteboard', 246, 10, 247, 11],
    ['booth', 92, 10, 97, 11], ['booth', 93, 5, 96, 6]   /* the break-room counter and its cabinets */
  ],
  heights: [
    /* S1 0-26 the lobby: a 3 gap c13-15, a chair to try (c17-26) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 THE OPEN OFFICE: desks (c29-31), THE BOOKSHELF (c32-34 row 6), CHAIR BRIDGE 1 over a 3 gap c50-52 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,
    /* S3 54-80 THE SCOOTER LANE (c56-78, row 9) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 a 3 gap c84-86, THE BREAK ROOM: the counter (c92-97), THE COFFEE CABINET, THE SUPPLY CLOSET (c100-104) */
    192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 THE WHITEBOARD MAZE: under (c112-113), over (c118-119), under (c125-126), over (c131-132) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 the checkpoint (c137), under (c140-141), CHAIR BRIDGE 2 over a 4 gap c146-149, over (c153-154) */
    192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 THE SCOOTER RACE (c163-186, row 9): a 3 gap c168-170, a 4 gap c178-181 */
    192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,
    /* S8 189-215 a 5 gap c198-202, the giant whiteboards: under (c207-208), over (c211-212) */
    192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S9 216-242 a 5 gap c225-229, under (c235-236) */
    192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S10 243-269 THE BOARDROOM: over (c246-247), THE BOARDROOM SHELVES (c250-251 row 6, c254-256 row 2), the goal */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [92, 10, 97, 11], [93, 5, 96, 6],   /* S4 the break-room counter (hop on) and the cabinets over it (the hidden gift is one door) */
    [100, 9, 104, 9], [100, 7, 103, 7], [100, 8, 100, 8],   /* S4 THE SUPPLY CLOSET on a ledge (walk under it); its board faces right */
    [112, 3, 113, 9], [118, 10, 119, 11], [125, 3, 126, 9], [131, 10, 132, 11],   /* S5 THE WHITEBOARD MAZE */
    [140, 3, 141, 9], [153, 10, 154, 11],   /* S6 */
    [207, 3, 208, 9], [211, 10, 212, 11],   /* S8 the giant whiteboards */
    [235, 3, 236, 9],   /* S9 */
    [246, 10, 247, 11]   /* S10 the boardroom's standing whiteboard */
  ],
  tiles: {
    gift: [
      [6, 8],   /* S1 */
      [41, 8],   /* S2 */
      [67, 5],   /* S3 over the scooter lane: only a rider reaches it */
      [89, 8],   /* S4 */
      [95, 6, 'gold'],   /* S4 THE COFFEE CABINET: the glinting door (hidden) */
      [116, 8],   /* S5 */
      [143, 8],   /* S6 */
      [175, 4],   /* S7 over the scooter race: only a rider reaches it */
      [193, 8],   /* S8 */
      [220, 8],   /* S9 */
      [258, 8, 'heart'], [260, 8, 'cake']   /* S10 the gift row */
    ],
    brick: [
      [5, 8], [7, 8],   /* S1 */
      [66, 5], [68, 5],   /* S3 */
      [259, 8]   /* S10 */
    ],
    shelf: [
      [29, 10], [30, 10], [31, 10],   /* S2 the desks */
      [32, 6], [33, 6], [34, 6],   /* S2 THE BOOKSHELF (visible secret) */
      [250, 6], [251, 6],   /* S10 THE BOARDROOM SHELVES: the first */
      [254, 2], [255, 2], [256, 2]   /* S10 the top one (skill secret) */
    ],
    board: [[103, 8]]   /* BONUS: hop onto the supply closet's ledge from the right and KICK the board: 2 candles inside */
  },
  /* cleaning robots, demo robots, mail carts, paper planes and a few of Annie's scanner drones (from next door). Nothing
     waits at a lip. */
  foes: [
    [8, 11, 'roomba'], [22, 11, 'cart'],   /* S1 */
    [36, 11, 'robot'], [44, 4, 'plane'],   /* S2 */
    [62, 11, 'roomba'], [74, 11, 'cart'],   /* S3 */
    [90, 11, 'robot'], [99, 11, 'roomba'],   /* S4 */
    [114, 4, 'plane'], [121, 11, 'robot'], [129, 11, 'roomba'],   /* S5 */
    [139, 11, 'robot'], [157, 11, 'cart'], [159, 5, 'scanner'],   /* S6 */
    [165, 11, 'roomba'], [174, 11, 'robot'], [185, 11, 'roomba'],   /* S7 */
    [192, 11, 'robot'], [205, 6, 'scanner'], [214, 11, 'roomba'],   /* S8 */
    [219, 11, 'cart'], [233, 11, 'robot'], [240, 5, 'scanner'],   /* S9 */
    [252, 11, 'roomba'], [262, 11, 'robot']   /* S10 */
  ],
  candles: [
    [3, 11], [5, 11], [7, 11], [9, 11], [11, 11], [12, 10], [13, 9], [14, 9], [15, 9], [16, 10], [18, 9], [20, 9], [22, 9], [24, 9], [26, 11],
    [27, 11], [29, 9], [31, 9], [32, 5], [34, 5], [36, 11], [38, 11], [40, 11], [43, 11], [45, 11], [47, 11], [49, 10], [50, 9], [51, 8], [52, 8], [53, 9],
    [50, 11], [51, 11], [52, 11], [53, 11],
    [54, 10], [55, 11], [57, 11], [59, 8], [61, 8], [63, 8], [65, 8], [69, 8], [71, 8], [73, 8], [75, 8], [77, 8], [60, 11], [64, 11], [70, 11], [76, 11], [79, 11],
    [81, 11], [83, 10], [84, 9], [85, 9], [86, 9], [87, 10], [91, 11], [93, 9], [95, 9], [97, 9], [101, 8], [102, 8], [105, 11], [107, 11],
    [108, 11], [110, 11], [112, 11], [113, 11], [115, 11], [117, 10], [118, 9], [119, 9], [120, 10], [122, 11], [124, 11], [125, 11], [126, 11], [128, 11], [130, 10], [131, 9], [132, 9], [133, 10],
    [135, 11], [137, 11], [140, 11], [141, 11], [143, 11], [145, 10], [146, 9], [147, 8], [148, 7], [149, 8], [150, 9], [151, 10], [146, 11], [148, 11], [150, 11],
    [152, 11], [153, 9], [154, 9], [155, 10], [159, 11], [161, 11],
    [162, 11], [164, 11], [166, 11], [167, 10], [168, 9], [170, 9], [171, 10], [173, 11], [176, 11], [177, 10], [178, 9], [181, 9], [182, 10], [184, 11], [187, 11],
    [165, 8], [167, 8], [169, 8], [171, 8], [173, 8], [177, 8], [179, 8], [181, 8], [183, 8], [185, 8],
    [189, 11], [191, 11], [195, 11], [197, 10], [198, 9], [199, 8], [200, 7], [201, 8], [202, 9], [203, 10], [205, 11], [207, 11], [208, 11], [210, 10], [211, 9], [212, 9], [213, 10], [215, 11],
    [217, 11], [222, 11], [223, 11], [224, 10], [225, 9], [226, 8], [227, 7], [228, 8], [229, 9], [230, 10], [232, 11], [234, 11], [235, 11], [236, 11], [238, 11], [242, 11],
    [244, 11], [246, 9], [247, 9], [249, 11], [250, 5], [251, 5], [254, 1], [256, 1], [258, 11], [260, 11], [264, 11], [266, 10]
  ],
  secrets: [
    { kind: 'visible', col: 33, row: 5, prize: 'heart+candles' },   /* THE BOOKSHELF: one full jump up from the desks */
    { kind: 'hidden', col: 95, row: 6, prize: 'GOLDEN CANDLE', glint240: true },   /* THE COFFEE CABINET: hop on the counter, bump the glinting door */
    { kind: 'skill', col: 255, row: 1, prize: 'hat' }   /* THE BOARDROOM SHELVES: two full jumps up from the standing whiteboard */
  ],
  goldenCandle: { col: 95, row: 6 },
  checkpoint: { col: 137, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 266, row: 11 },   /* the boardroom door: out to the conference centre next door */
  talk: [
    [2, 'KINAN', "The startup lofts! Glitchy's hockey bag rolled right in. Everything in here has wheels!", 3.6],
    [40, 'MOM', 'See that rolling chair, sweetie? Step on it and hold still: it carries you over the gap.', 4],
    [56, 'CHENOA', 'A scooter lane! Jump on and ride it, little bro. Wheee!', 3.2],
    [88, 'PASSER-BY', "Bonjour! Coffee in the break room... oh, you're eleven. Juice, then!", 3.6],
    [109, 'DAD', 'The whiteboard maze, bud! Walk under the hanging ones, hop over the standing ones. Mark my words.', 3.8],
    [30, "GRANDPA", "Grandpa on the video call! Why did the computer go to the doctor? It had a virus! I've had that one since 1962.", 4.8],
    [138, 'SHAD', "Annie's drones are coming over from the conference next door. Keep moving, little bro!", 3.8],
    [244, 'KINAN', "The boardroom! And through the window... the conference centre. Glitchy's in there with Annie!", 4]
  ]
});

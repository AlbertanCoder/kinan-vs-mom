/* ============================================================
   LEVEL 9-6 · THE SPACE CENTRE
   (World 9 · Montreal · trail stop 7)
   Story bible (World 9 table): "Rocket simulators and low-gravity
   training. Secret exit in a launch tube, leading to 9-secret." Down
   from the Olympic Tower, Glitchy's hockey bag rolls into the space
   centre: the visitor hall, the astronaut training rooms, the rocket
   hall with its launch tower, the launch tubes and the exhibit hall.
   Idea (ONE): LOW GRAVITY (opt-in `lowGrav`, the World 6 sneak peek's
     0.6). Inside a training zone (it glows soft purple, its sign at the
     way in) every jump floats: higher (about 7 tiles instead of 4) and
     much longer. The gaps stay inside the Playbook's widths (the lint
     counts every pit the same), so light gravity is about HEIGHT: walls
     and ledges a normal jump (4.3 tiles) can never reach. Act 1 teaches
     it (the training room: THE ZERO-G SHELF, 6 tiles up, then THE
     TRAINING WALL, 5 tiles up: float onto it); act 2 twists it (the
     rocket hall: a 4, the launch tower and THE ROCKET NOSE high above
     it, then normal gravity again for a 4; THE MOON WALK: a 4, then
     two MOON ROCKS, 5 tiles tall); act 3 tests the heavy jump again
     (two 5s in normal gravity, THE LAUNCH TUBE, the exhibit hall).
   Every light-gravity jump lands on long floor: no pit lies within 14
     tiles after a high spot in a zone (a floaty jump goes far).
   Acts (thirds): 0-89 teach (the visitor hall 3, THE TRAINING ROOM:
     the zero-g shelf, the training wall, 3) · 90-179 twist (the rocket
     hall: 4 in light gravity, THE LAUNCH TOWER, THE ROCKET NOSE, 4, the
     checkpoint, THE MOON WALK 4 and the moon rocks) · 180-269 test (5,
     THE LAUNCH TUBE, 5, THE EXHIBIT HALL and the stomp rocket).
   Secrets: visible = THE ZERO-G SHELF (S2): a shelf 6 tiles up in the
     training room; one floaty jump (heart + candles, 37,5) · hidden =
     THE LAUNCH TUBE (S9): one block in the tube's roof glints; jump
     inside the tube and bump it (GOLDEN CANDLE, 224,8). It is also THE
     SECRET EXIT: a door opens on the tube's floor, out to 9-secret
     (the Underground City) · skill = THE ROCKET NOSE (S5): from the top
     of the launch tower, a floaty jump that does not run too far lands
     on the shelf by the rocket's nose (hat, 120,2).
   Memory (age 9, Shad 2026-10-29): HIS STOMP ROCKET (the foam rocket
     you launch by stomping on an air pad), from the space centre: on its
     display stand in the exhibit hall (S10, c252-253, skin
     'stomprocket'), and Kinan remembers it as he gets there (story
     bubble at c248).
   Gaps: act 1 3/3 · act 2 4 (light)/4/4 (light) · act 3 5/5; plus the
     5-tile training wall and moon rocks (light gravity only). Nothing
     waits at a lip; no flyer hangs where a floaty jump goes. A full-run
     jump off the zero-g shelf, the training wall, the launch tower, the
     rocket nose or a moon rock comes down on floor (w9-levels.spec.ts
     checks it).
   Look: the Space Centre (theme 116, World 9's own look): a starry dome,
     rockets and planets on display, the simulator pods.
   ENGINE REQUESTS: a rocket skin for the launch tower.
   ============================================================ */
KinanLevels.register({
  id: '9-6', world: 9, slot: 7, kind: 'level',
  name: 'THE SPACE CENTRE',
  theme: 116,   /* the Space Centre: a starry dome, rockets and planets, the simulator pods */
  cols: 270,
  /* LOW GRAVITY (World 9 twist, opt-in): [c0, c1] — inside, his gravity is 0.6: jumps float higher and farther */
  lowGrav: [
    [28, 70],   /* L1 THE TRAINING ROOM: the zero-g shelf, then THE TRAINING WALL */
    [92, 128],   /* L2 THE ROCKET HALL: a 4, the launch tower, the rocket nose */
    [160, 190]   /* L3 THE MOON WALK: a 4, then THE MOON ROCKS */
  ],
  skins: [
    ['steel', 60, 7, 67, 11],   /* THE TRAINING WALL */
    ['granite', 176, 7, 177, 11], ['granite', 181, 7, 182, 11],   /* THE MOON ROCKS */
    ['steel', 116, 8, 118, 11],   /* THE LAUNCH TOWER */
    ['steel', 220, 7, 229, 8],   /* THE LAUNCH TUBE's roof */
    ['stomprocket', 252, 10, 253, 11]   /* the display stand: his stomp rocket (the memory gift) */
  ],
  heights: [
    /* S1 0-26 the visitor hall: a 3 gap c14-16 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 THE TRAINING ROOM (light gravity from c28): THE ZERO-G SHELF (c36-38 row 6) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 THE TRAINING WALL (c60-67, five tiles up: only a floaty jump gets there), light gravity ends at c70 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 a 3 gap c84-86, THE ROCKET HALL (light gravity from c92): a 4 gap c101-104 */
    192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,
    /* S5 108-134 THE LAUNCH TOWER (c116-118 row 8), THE ROCKET NOSE (c119-121 row 3); light gravity ends at c128 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 a 4 gap c140-143, the checkpoint (c146) */
    192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 THE MOON WALK (light gravity c160-190): a 4 gap c167-170, THE MOON ROCKS (c176-177, c181-182, five tiles tall) */
    192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S8 189-215 normal gravity again: a 5 gap c200-204 */
    192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,
    /* S9 216-242 THE LAUNCH TUBE (c220-229, roof rows 7-8), a 5 gap c234-238 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,
    /* S10 243-269 THE EXHIBIT HALL: the stomp rocket on its stand (c252-253), the goal */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [60, 7, 67, 11],   /* S3 THE TRAINING WALL (five tiles: only a floaty jump gets on top) */
    [116, 8, 118, 11],   /* S5 THE LAUNCH TOWER (4 tiles: one jump up) */
    [176, 7, 177, 11], [181, 7, 182, 11],   /* S7 THE MOON ROCKS (five tiles: only a floaty jump clears them) */
    [220, 7, 229, 8],   /* S9 THE LAUNCH TUBE's roof (walk through under it; the secret exit is one of its blocks) */
    [252, 10, 253, 11]   /* S10 the display stand (the stomp rocket) */
  ],
  open: [[4, 13, 6, 13]],   /* SLAM SPOT (butt slam, 2026-10-29): the pocket under the cracked boards, solid floor under it */
  tiles: {
    crack: [[4, 12], [5, 12], [6, 12]],   /* SLAM SPOT: cracked floor panels over a pocket of candles (a bonus, never needed) */
    gift: [
      [5, 8],   /* S1 */
      [45, 8],   /* S2 */
      [63, 3],   /* S3 over the training wall (bump it from the top) */
      [95, 8],   /* S4 */
      [109, 8],   /* S5 (no block in the landing of a floaty jump off the tower or the rocket nose) */
      [152, 8],   /* S6 */
      [186, 8],   /* S7 */
      [210, 8],   /* S8 */
      [224, 8, 'gold'],   /* S9 THE LAUNCH TUBE: the glinting block (hidden; the secret exit) */
      [258, 8, 'heart'], [260, 8, 'cake']   /* S10 the gift row */
    ],
    brick: [
      [4, 8], [6, 8],   /* S1 */
      [62, 3], [64, 3],   /* S3 over the training wall */
      [209, 8], [211, 8],   /* S8 */
      [259, 8]   /* S10 */
    ],
    shelf: [
      [36, 6], [37, 6], [38, 6],   /* S2 THE ZERO-G SHELF (visible secret) */
      [119, 3], [120, 3], [121, 3]   /* S5 THE ROCKET NOSE (skill secret) */
    ]
  },
  /* training robots, cleaning robots, camera drones and toy planes; a few of Annie's scanner drones. Nothing waits at a
     lip; no flyer hangs over a light-gravity gap. */
  foes: [
    [8, 11, 'roomba'], [21, 11, 'robot'],   /* S1 */
    [44, 11, 'robot'], [50, 3, 'plane'],   /* S2 */
    [72, 11, 'roomba'],   /* S3 */
    [92, 11, 'robot'], [96, 6, 'scanner'],   /* S4 */
    [111, 11, 'roomba'], [131, 11, 'robot'],   /* S5 */
    [150, 11, 'robot'], [156, 7, 'scanner'],   /* S6 */
    [180, 11, 'robot'], [185, 6, 'camera'],   /* S7 */
    [196, 11, 'roomba'], [208, 11, 'robot'], [213, 6, 'scanner'],   /* S8 */
    [217, 11, 'robot'], [231, 4, 'camera'],   /* S9 */
    [247, 11, 'robot'], [256, 11, 'roomba'], [263, 6, 'scanner']   /* S10 */
  ],
  candles: [[4, 13], [5, 13], [6, 13],
    [3, 11], [5, 11], [7, 11], [10, 11], [12, 11], [13, 10], [14, 9], [15, 9], [16, 9], [17, 10], [19, 11], [23, 11], [25, 11],
    [27, 11], [29, 11], [31, 10], [32, 9], [33, 8], [34, 7], [35, 6], [36, 5], [38, 5], [40, 8], [42, 10], [46, 11], [48, 11], [50, 11], [52, 11],
    [54, 11], [56, 11], [57, 10], [58, 9], [59, 7], [60, 6], [61, 6], [62, 6], [63, 6], [64, 6], [65, 6], [66, 6], [67, 6], [68, 8], [69, 10], [70, 11], [74, 11], [78, 11], [80, 11],
    [81, 11], [82, 10], [83, 9], [84, 8], [85, 8], [86, 8], [87, 9], [88, 10], [90, 11], [94, 11], [98, 11], [99, 10], [100, 9], [101, 7], [102, 6], [103, 5], [104, 4], [105, 4], [106, 4], [107, 5],
    [108, 6], [109, 7], [110, 9], [113, 11], [115, 11], [116, 7], [118, 7], [119, 2], [121, 2], [123, 9], [125, 11], [129, 11], [132, 11], [134, 11],
    [136, 11], [138, 11], [139, 10], [140, 9], [141, 8], [142, 8], [143, 9], [144, 10], [146, 11], [148, 11], [154, 11], [156, 11], [158, 11], [160, 11],
    [162, 11], [164, 11], [165, 10], [166, 9], [167, 8], [168, 7], [169, 7], [170, 8], [171, 9], [172, 10], [174, 11], [175, 8], [176, 6], [177, 6], [178, 7], [179, 9], [180, 7], [181, 6], [182, 6], [183, 8], [185, 11], [187, 11],
    [189, 11], [191, 11], [193, 11], [195, 11], [197, 11], [198, 10], [199, 9], [200, 8], [201, 8], [202, 7], [203, 8], [204, 9], [205, 10], [207, 11], [213, 11],
    [216, 11], [218, 11], [221, 11], [223, 11], [225, 11], [227, 11], [229, 11], [231, 11], [232, 10], [233, 9], [234, 8], [235, 7], [236, 7], [237, 7], [238, 8], [239, 9], [241, 11],
    [243, 11], [245, 11], [248, 11], [250, 11], [252, 9], [253, 9], [255, 11], [262, 11], [264, 11]
  ],
  secrets: [
    { kind: 'visible', col: 37, row: 5, prize: 'heart+candles' },   /* THE ZERO-G SHELF: one floaty jump up */
    { kind: 'hidden', col: 224, row: 8, prize: 'GOLDEN CANDLE', glint240: true, exit: '9-secret' },   /* THE LAUNCH TUBE: the glinting block; a door opens on the tube's floor */
    { kind: 'skill', col: 120, row: 2, prize: 'hat' }   /* THE ROCKET NOSE: a floaty jump off the launch tower that does not run too far */
  ],
  goldenCandle: { col: 224, row: 8 },
  checkpoint: { col: 146, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 266, row: 11 },   /* the exhibit hall's far door */
  talk: [
    [2, 'KINAN', "The space centre! Rockets, simulators... and Glitchy's hockey bag rolling past the astronaut suits!", 3.8],
    [27, 'MOM', 'This is the training room, sweetie. The gravity is light in here, so your jumps float! Try a big one.', 4.2],
    [52, 'DAD', "That wall's way too high for a normal jump, bud. In light gravity you'll float right up it! Very uplifting.", 3.8],
    [88, 'CHENOA', "Rocket simulators! Real astronauts train in those. You're basically an astronaut now, little bro.", 4],
    [112, 'PASSER-BY', 'Bonjour! Climb the launch tower and look at the rocket!', 3],
    [146, 'SHAD', "Careful: Annie's drones are scanning the exhibits. And past the moon walk the gravity is normal again.", 4.2],
    [214, 'KINAN', 'A launch tube! LANCEMENT means launch. Whoosh!', 3],
    [248, 'KINAN', "My STOMP ROCKET! I got it here at the space centre when I was nine. One big stomp on the air pad and WHOOSH, way up!", 5]   /* the age-9 memory (Shad, 2026-10-29) */
  ]
});

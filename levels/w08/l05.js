/* ============================================================
   LEVEL 8-5 · THE BRICK TOY STORE
   (World 8 · Toronto · trail stop 5)
   Story bible (World 8 table): "A giant store of toy bricks; Milo
   helps build." The raccoon runs into the giant brick toy store on the
   corner, with Glitchy's parcel. Everything in here is made of toy
   bricks. No one new joins: Kinan's builder friend Milo (from World 2)
   helps over a video call.
   Idea (ONE): BREAK THE BRICKS. Every brick in the store pops apart
     when Kinan bonks it from below (no toyBricks here). Act 1 teaches
     it (a row of bricks with candles on top, a brick staircase, a brick
     ceiling over a little gap: jump and the bricks pop); act 2 twists
     it (MILO'S BUILD SPOT: a red wall too tall to jump — bump the build
     block over your head and the wall comes apart while its bricks
     snap into a bridge over the next gap; THE DISPLAY CASE: bonk its
     brick floor to get in; a brick ceiling with candles on top); act
     3 tests it (5-wide gaps, THE TOP SHELF: bonk the brick lid off
     the spring, THEN bounce).
   Milo's build spot uses World 7's circuit (circuit.build: the CLICK
     says the wall comes apart and the bricks snap into a bridge).
     Milo's video-call bubble plays as Kinan walks up to it (c84) and
     points at the build block. The bridge only makes the 4-wide gap
     easy: it is jumpable without it.
   Acts (thirds): 0-89 teach (the doors, the brick staircase 2, the
     brick ceiling 2) · 90-179 twist (MILO'S BUILD SPOT 4, THE DISPLAY
     CASE 4, the checkpoint, the brick ceiling 3, the brick bin 4) ·
     180-269 test (5, THE TOP SHELF, 5 under THE BRICK SPACESHIP, the
     back door).
   Signature set-piece: MILO'S BUILD SPOT (S4).
   Secrets: visible = THE DISPLAY CASE (S5): a heart sits in a glass
     case with a brick floor over the aisle; bonk a brick out of the
     floor and jump up into it (heart + candles, 124,7) · hidden = THE
     BRICK SPACESHIP (S9): a giant brick spaceship hangs from the
     ceiling; one of its bricks glints (GOLDEN CANDLE, 234,6; two
     candles under it point up) · skill = THE TOP SHELF (S8): a brick
     lid sits over the spring: bonk it off, then bounce and steer onto
     the top shelf (hat, 207,1).
   Board (taekwondo, a bonus spot): the bricks-for-sale cubby by the back
     door (S10): hop onto its ledge from the right and KICK the board:
     2 candles inside. Never on the main path.
   Gaps: act 1 2/2 · act 2 4/4/3/4 · act 3 5/5. Every gap has a candle
     arc; nothing waits at a lip; no brick hangs over a take-off; the
     spring has 15+ tiles of floor after it. The checkpoint is at c150.
   Raccoons (World 8, snatch): a raccoon grabs a candle and runs.
   Look: borrows the Great Brick Bin (theme 57): bright sky, big toy
     bricks, studded ground.
   ENGINE REQUESTS: a toy-store backdrop (shelves of brick sets, a
     brick CN Tower, a brick moose) · Milo's face in a little video-call
     window beside his bubble · a toy-brick skin (studs) for the red
     wall and the bridge.
   ============================================================ */
KinanLevels.register({
  id: '8-5', world: 8, slot: 5, kind: 'level',
  name: 'THE BRICK TOY STORE',
  theme: 57,   /* the Great Brick Bin: bright sky, big toy bricks, studded ground */
  cols: 270,
  snatch: true,   /* World 8: raccoons grab a candle and run */
  /* MILO'S BUILD SPOT (World 7's circuit, told as a build): bump the build block (c97, row 8): the red wall (c98) comes
     apart and the blue bricks snap into a bridge over the 4-wide gap (c101-104) */
  circuit: {
    build: true,
    switches: [[97, 8]],
    red: [[98, 5], [98, 6], [98, 7], [98, 8], [98, 9], [98, 10], [98, 11]],
    blue: [[101, 12], [102, 12], [103, 12], [104, 12]]
  },
  heights: [
    /* S1 0-26 the store doors: a row of bricks with candles on top */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 a brick staircase (c31-35), a 2-wide gap c40-41 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 a brick ceiling (c63-66 row 8) over a 2-wide gap c63-64 */
    192,192,192,192,192,192,192,192,192,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 MILO'S BUILD SPOT: the red wall (c98), the bridge over a 4-wide gap c101-104 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,
    /* S5 108-134 a 4-wide gap c113-116, THE DISPLAY CASE (c122-126) */
    192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 a 3-wide gap c141-143, the checkpoint, a brick ceiling (c147-151 row 9) */
    192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 the brick bin: up a heap (c166-167), a 4-wide gap c176-179 */
    192,192,192,192,184,176,176,176,176,176,176,176,176,176,null,null,null,null,176,176,176,176,176,176,176,176,176,
    /* S8 189-215 a 5-wide gap c194-198, THE TOP SHELF (spring c205 under a brick lid, shelf c206-208 row 2) */
    176,176,176,176,176,null,null,null,null,null,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,
    /* S9 216-242 a 5-wide gap c224-228, THE BRICK SPACESHIP (c232-237) */
    176,176,176,176,176,176,176,176,null,null,null,null,null,176,176,176,176,176,176,176,176,176,176,176,176,176,176,
    /* S10 243-269 reward: down the heap (c247-248), the cubby (board), the gift row, the back door */
    176,176,176,176,184,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [122, 5, 126, 5], [122, 6, 122, 7], [126, 6, 126, 7],   /* S5 THE DISPLAY CASE: its top and sides (its floor is bricks) */
    [232, 4, 237, 6],   /* S9 THE BRICK SPACESHIP, hanging from the ceiling (the hidden gift is one of its bricks) */
    [252, 9, 258, 9], [252, 7, 255, 7], [252, 8, 252, 8]   /* S10 the cubby on a ledge (walk under it); its board door faces right */
  ],
  tiles: {
    gift: [
      [12, 8],   /* S1 */
      [70, 8],   /* S3 */
      [110, 8],   /* S5 */
      [234, 6, 'gold'],   /* S9 THE BRICK SPACESHIP: the glinting brick (hidden) */
      [261, 8, 'heart'], [263, 8], [265, 8, 'cake']   /* S10 the gift row */
    ],
    brick: [
      [6, 8], [7, 8], [8, 8], [9, 8],   /* S1 the first bricks: candles on top */
      [31, 11], [32, 10], [32, 11], [33, 9], [33, 10], [33, 11], [34, 10], [34, 11], [35, 11],   /* S2 the brick staircase */
      [63, 8], [64, 8], [65, 8], [66, 8],   /* S3 the brick ceiling over the gap (none over the take-off) */
      [123, 8], [124, 8], [125, 8],   /* S5 THE DISPLAY CASE's floor */
      [147, 9], [148, 9], [149, 9], [150, 9], [151, 9],   /* S6 a brick ceiling with candles on top */
      [205, 5],   /* S8 the brick lid over the spring */
      [262, 8], [264, 8]   /* S10 */
    ],
    spring: [
      [205, 10]   /* S8 THE TOP SHELF's spring (skill secret) */
    ],
    shelf: [
      [206, 2], [207, 2], [208, 2]   /* S8 THE TOP SHELF (skill secret) */
    ],
    board: [[255, 8]]   /* BONUS: hop onto the cubby ledge from the right and KICK the board: 2 candles inside */
  },
  /* toy-brick walkers, wind-up robots and toy planes; raccoons in the aisles. Nothing waits at a lip. */
  foes: [
    [20, 11, 'lego'],   /* S1 */
    [48, 11, 'lego'],   /* S2 */
    [74, 11, 'robot'],   /* S3 */
    [88, 11, 'lego'],   /* S4 */
    [119, 11, 'robot'], [130, 11, 'raccoon'],   /* S5 */
    [137, 11, 'lego'], [158, 11, 'robot'],   /* S6 */
    [170, 10, 'lego'], [184, 10, 'raccoon'],   /* S7 */
    [196, 6, 'plane'], [201, 10, 'robot'], [212, 10, 'lego'],   /* S8 */
    [219, 10, 'raccoon'], [226, 6, 'plane'], [240, 10, 'robot']   /* S9 */
  ],
  candles: [
    [3, 10], [6, 7], [7, 7], [8, 7], [9, 7], [12, 10], [15, 11], [17, 11], [19, 11], [22, 11], [24, 11], [26, 11],
    [28, 11], [30, 11], [31, 10], [32, 9], [33, 8], [34, 9], [35, 10], [37, 11], [39, 10], [40, 9], [41, 9], [42, 10], [44, 11], [46, 11], [50, 11], [52, 11],
    [55, 11], [57, 11], [59, 11], [61, 11], [62, 10], [63, 9], [64, 9], [65, 10], [66, 11], [63, 7], [64, 7], [65, 7], [66, 7], [68, 11], [70, 10], [76, 11], [78, 11], [80, 11],
    [83, 11], [85, 11], [87, 11], [89, 11], [91, 11], [93, 11], [95, 11], [97, 10], [99, 11], [101, 11], [102, 11], [103, 11], [104, 11], [106, 11],
    [108, 11], [110, 10], [112, 10], [113, 9], [114, 8], [115, 8], [116, 9], [117, 10], [121, 11], [124, 10], [128, 11], [132, 11], [134, 11],
    [136, 11], [139, 11], [140, 10], [141, 9], [142, 9], [143, 10], [145, 11], [147, 8], [148, 8], [149, 8], [150, 8], [151, 8], [147, 11], [149, 11], [151, 11], [154, 11], [156, 11], [160, 11],
    [163, 11], [165, 11], [166, 10], [167, 10], [169, 10], [172, 10], [174, 10], [175, 9], [176, 8], [177, 7], [178, 7], [179, 8], [180, 9], [182, 10], [186, 10], [188, 10],
    [190, 10], [192, 10], [193, 9], [194, 8], [195, 7], [197, 7], [198, 8], [199, 9], [203, 10], [205, 8], [205, 6], [207, 4], [210, 10], [214, 10],
    [216, 10], [218, 10], [221, 10], [223, 9], [224, 8], [225, 7], [227, 7], [228, 8], [229, 9], [231, 10], [234, 8], [234, 7], [236, 10], [238, 10], [242, 10],
    [243, 10], [245, 10], [247, 10], [248, 10], [250, 11], [254, 11], [256, 11], [260, 10], [262, 10], [264, 10], [266, 11],
    [253, 8], [254, 8]   /* inside the cubby, behind the board */
  ],
  secrets: [
    { kind: 'visible', col: 124, row: 7, prize: 'heart+candles' },   /* THE DISPLAY CASE: bonk a brick out of its floor, jump up into it */
    { kind: 'hidden', col: 234, row: 6, prize: 'GOLDEN CANDLE', glint240: true },   /* THE BRICK SPACESHIP: the glinting brick */
    { kind: 'skill', col: 207, row: 1, prize: 'hat' }   /* THE TOP SHELF: bonk the brick lid off the spring, then bounce */
  ],
  goldenCandle: { col: 234, row: 6 },
  checkpoint: { col: 150, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 267, row: 11 },   /* the back door, toward the aquarium */
  talk: [
    [2, 'CHENOA', 'The brick toy store! Everything in here is made of toy bricks. Bonk them from underneath!', 4],
    [84, 'MILO', "Kinan! It's Milo, on video call! See the BUILD block over your head? Bump it. I'll snap that wall into a bridge!", 5.5],
    [100, 'KINAN', 'Thanks, Milo! Best builder in the whole world.', 2.8],
    [150, 'MOM', 'We are NOT buying anything, sweetie. ...Okay. ONE thing.', 3.2],
    [199, 'SHAD', 'Bonk the brick off the top of that spring first, then bounce. Top shelf, buddy!', 3.8],
    [244, 'DAD', 'The raccoon ran out the back door, toward the aquarium!', 3]
  ]
});

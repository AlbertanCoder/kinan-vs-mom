/* ============================================================
   LEVEL 2-7 · THE COMPUTER LAB  (World 2 · School · trail stop 8)
   Story bible (World 2 table): "Glitchy's pixels leak out of the
   screens. Secret exit through a monitor." Glitchy is hiding in the
   school computers, and his pixels are spilling out as blocks.
   Idea (ONE): PIXEL BRICKS. Glitchy's pixels are bricks that break when
     Kinan bumps them with his head: break a hole, jump up through it,
     and run along the top. The twist: a pixel brick you need to stand on
     breaks too if you bonk it from below.
   Signature set-piece: THE DATA BRIDGE (S4): a long pixel-brick bridge
     high over two 4-pits. Break in from the desk under its left end and
     run the safe top road, or take the floor road past the roomba.
   Acts (72 cols each): teach 0-71 (break a hole in a pixel row and jump
     through, desks with monitors, a cable RIDGE, the pixel ladder) ·
     twist 72-143 (the data bridge over 4/4 pits, THE BIG MONITOR) ·
     test 144-215 (5/4 pits, a pixel canopy, the server room, a 5-pit,
     then the logout door).
   Secrets: visible = THE PIXEL LADDER (S3): hop up its steps from the
     SIDE to the shelf at the top (heart + candles, 67,2); jump from right
     under a pixel step and it breaks · hidden = THE BIG MONITOR (S5):
     crawl in through the cable hole in its back (from the right), bump
     the glinting block in its ceiling (GOLDEN CANDLE, 121,7) and a door
     opens in the room: the SECRET EXIT to 2-secret (the 1-7 pattern) ·
     skill = THE SERVER ROOM (S7) under the walkway: walk in from the
     right onto the spring, keep bouncing: every bounce cracks a brick
     of its pixel roof, and once there is a hole you fly up through it;
     steer onto the high shelf (hat, 169,3). From the walkway the shelf is one tile too high.
   Bubble beats for ER-4 (not wired): c2 "The computer lab. Every screen
     is showing... pixels?" · c60 "Glitchy's pixels break when you bonk
     them. Careful which ones you bonk!" · c110 checkpoint · c126 (near the
     big monitor) "That cable hole looks big enough to crawl through..."
     · c210 "LOG OUT? Yes please."
   ENGINE REQUESTS: draw this fake wall as a monitor screen (and let
     Kinan walk through it, ER-6) · a 'pixel' skin for this level's
     bricks · glitch-pixel flyers ('ghost' stands in) · computer foes
     ('robot', 'roomba' stand in) · Glitchy's face flickering on the
     monitors (bubbles ER-4).
   ============================================================ */
KinanLevels.register({
  id: '2-7', world: 2, slot: 8, kind: 'level',
  name: 'THE COMPUTER LAB',
  theme: 80,                /* borrows the portal-machine look: a navy lab with a glowing green floor line */
  cols: 216,
  heights: [
    /* S1 0-26 teach: the first pixel row (break a hole, jump through) · 2-pit c21-22 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null, 192,192,192,192,
    /* S2 27-53 a desk with a monitor c30-35 · the cable RIDGE c38-44 · 3-pit c47-49 */
    192,192,192,192,192,192,192,192,192,192,192, 184,176, 176,176,176, 184,192, 192,192, null,null,null, 192,192,192,192,
    /* S3 54-80 THE PIXEL LADDER c57-68 · 4-pit c75-78 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null,null, 192,192,
    /* S4 81-107 THE DATA BRIDGE (row 6, c85-103) over 4-pits c89-92 and c98-101 · the step down c104-105 */
    192,192,192,192,192,192,192,192, null,null,null,null, 192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,
    /* S5 108-134 checkpoint · THE BIG MONITOR c118-124 (secret exit) · the printer c127-128 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 test: 5-pit c145-149 · a pixel canopy c151-155 · 4-pit c157-160 */
    192,192,192,192,192,192,192,192,192,192, null,null,null,null,null, 192,192,192,192,192,192,192, null,null,null,null, 192,
    /* S7 162-188 THE SERVER ROOM under the walkway c165-176 (spring c169, pixel roof c167-172) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S8 189-215 5-pit c194-198 · a pixel arch · the logout door */
    192,192,192,192,192, null,null,null,null,null, 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [30, 9, 35, 9], [32, 7, 33, 8],       /* S2 a computer desk (run under it) and its monitor */
    [57, 9, 58, 9],                       /* S3 the pixel ladder's first step (solid, so it can't be lost) */
    [83, 9, 86, 9],                       /* S4 the desk under the data bridge's left end */
    [104, 9, 105, 11],                    /* S4 the step down from the data bridge */
    [114, 10, 117, 11],                   /* S5 a desk right against the big monitor: the step up onto it */
    [118, 11, 119, 11], [118, 7, 124, 7], [123, 8, 124, 10],   /* S5 THE BIG MONITOR: stand, top, back (the cable hole is row 11, c123-124) */
    [127, 10, 128, 11],                   /* S5 the printer */
    [165, 10, 166, 11], [165, 9, 166, 9], [173, 9, 176, 9]     /* S7 the server room: left wall and the solid ends of the walkway (open on the right) */
  ],
  fakeWall: [118, 119],     /* S5 the big monitor's SCREEN (solid today; walk-through is ER-6) */
  tiles: {
    gift: [[8, 9, 'popper'], [41, 7], [95, 8], [121, 7, 'gold'], [140, 8, 'heart'], [207, 8]],
    brick: [
      [6, 9], [7, 9], [9, 9], [10, 9],                                     /* S1 the first pixel row (the popper sits in it) */
      [60, 7], [61, 7], [63, 5], [64, 5],                                  /* S3 the pixel ladder's steps 2 and 3 */
      [85, 6], [86, 6], [87, 6], [88, 6], [89, 6], [90, 6], [91, 6], [92, 6], [93, 6], [94, 6],
      [95, 6], [96, 6], [97, 6], [98, 6], [99, 6], [100, 6], [101, 6], [102, 6], [103, 6],   /* S4 THE DATA BRIDGE */
      [151, 9], [152, 9], [153, 9], [154, 9], [155, 9],                   /* S6 the pixel canopy */
      [167, 9], [168, 9], [169, 9], [170, 9], [171, 9], [172, 9],          /* S7 the server room's pixel roof (the walkway) */
      [200, 7], [201, 7], [202, 7]                                         /* S8 the pixel arch */
    ],
    spring: [[169, 12]],                  /* S7 inside the server room */
    shelf: [[66, 3], [67, 3], [68, 3],    /* S3 the top of the pixel ladder */
            [168, 4], [169, 4], [170, 4], [171, 4]]   /* S7 the high shelf over the server room */
  },
  foes: [[15, 11, 'robot'],
         [31, 8, 'robot'],
         [70, 11, 'robot'],
         [95, 11, 'roomba'], [107, 11, 'robot'],
         [132, 11, 'roomba'],
         [139, 7, 'ghost'], [153, 11, 'robot'],
         [184, 11, 'robot'], [182, 6, 'ghost'],
         [207, 6, 'ghost'], [211, 11, 'robot']],
  candles: [[3, 11], [4, 11], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8],
            [20, 10], [21, 9], [22, 9], [23, 10],
            [28, 11], [29, 11], [34, 8], [35, 8], [40, 10], [41, 10], [42, 10],
            [46, 10], [47, 9], [48, 8], [49, 9], [50, 10],
            [57, 8], [60, 6], [63, 4], [66, 2], [68, 2],
            [74, 10], [75, 9], [76, 8], [77, 8], [78, 9], [79, 10],
            [86, 5], [88, 5], [90, 5], [92, 5], [94, 5], [96, 5], [98, 5], [100, 5], [102, 5],
            [89, 9], [90, 8], [91, 8], [92, 9], [98, 9], [99, 8], [100, 8], [101, 9],
            [112, 11], [113, 11], [115, 9], [116, 9], [119, 6], [120, 6], [122, 6], [123, 6],
            [125, 11], [124, 11], [123, 11], [122, 11],
            [137, 11], [138, 11], [144, 10], [145, 9], [146, 8], [147, 7], [148, 8], [149, 9],
            [151, 8], [152, 8], [153, 8], [154, 8], [155, 8],
            [156, 10], [157, 9], [158, 8], [159, 8], [160, 9],
            [167, 8], [168, 8], [170, 8], [171, 8], [168, 5], [170, 5], [173, 11], [174, 11], [175, 11],
            [193, 10], [194, 9], [195, 8], [196, 7], [197, 7], [198, 8], [199, 9],
            [200, 6], [201, 6], [202, 6], [208, 11], [209, 11]],
  secrets: [
    { kind: 'visible', col: 67, row: 2, prize: 'heart+candles' },                  /* the top of the pixel ladder */
    { kind: 'hidden', col: 121, row: 7, prize: 'GOLDEN CANDLE + the secret exit', glint240: true, exit: '2-secret' },   /* inside the big monitor */
    { kind: 'skill', col: 169, row: 3, prize: 'hat' }                               /* bounce up through the server room's roof */
  ],
  goldenCandle: { col: 121, row: 7 },
  checkpoint: { col: 110, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 213, row: 11 }             /* the logout door */
});

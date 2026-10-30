/* ============================================================
   LEVEL 8-1 · AIRPORT ARRIVALS
   (World 8 · Toronto · trail stop 1)
   Story bible (World 8 table): "Baggage carousels and moving walkways.
   Gentle opener." The cargo plane from Vancouver lands in Toronto with
   Glitchy's parcel in its hold, and the family's flight lands right
   behind it: the team's first flight east. Somewhere between the gate
   and the curb a raccoon spots the shiny parcel...
   Idea (ONE): THE BELTS. Moving walkways and baggage carousels carry
     Kinan while he stands on them (they never change his own run or
     jump: in the air he keeps his own speed). Act 1 teaches it (a
     long walkway that helps, then one that goes the WRONG way, no gap
     on any belt); act 2 twists it (the carousels are raised: one
     carries you right to the edge of a gap, one pushes you back
     toward a 4-wide gap's lip); act 3 tests it (fast walkways that
     run you up to two 5-wide gaps).
   Acts (thirds): 0-89 teach (the gate, the long hall 2, the
     escalators and THE ARRIVALS BOARD 3) · 90-179 twist (baggage
     claim, THE LOST-AND-FOUND CHUTE, the carousel row 4, the
     wrong-way walkway 4, THE TALL CAROUSEL 3) · 180-269 test (the
     checkpoint, the fast walkways 5/5, THE BIG SIGN, the curb).
   Signature set-piece: THE CAROUSEL ROW (S5): ride the carousel to its
     end and jump the gap from the top of it.
   Secrets: visible = THE ARRIVALS BOARD (S3): a ledge over the gap
     between the escalators; from the mezzanine jump UP onto it
     instead of across (heart + candles, 67,4) · hidden = THE
     LOST-AND-FOUND CHUTE (S4): the bag chute over baggage claim has
     one glinting panel; jump under it (GOLDEN CANDLE, 99,6; two
     candles under it point up) · skill = THE BIG SIGN (S8): bounce off
     the luggage trampoline and steer onto the WELCOME sign high over
     the hall (hat, 210,2).
   Board (taekwondo, a bonus spot): the left-luggage cubby on the ledge
     by the curb (S10): hop onto the ledge from the right and KICK the
     board: 2 candles inside. Never on the main path.
   Gaps: act 1 2/3 · act 2 4/4/3 · act 3 5/5. Every gap has a candle
     arc; every belt that runs toward a gap stops one tile short of
     its lip (stand still and you stop on solid floor), and the
     wrong-way belt ends AT a lip (it pushes you back, away from it).
     A full-run jump off a carousel top or the big sign lands on floor
     (w8-levels.spec.ts checks it).
   Raccoons (World 8, snatch): a raccoon grabs a candle and runs
     (stomp it or KICK it to get the candle back).
   Look: the Toronto Airport (theme 100, World 8's own look): the
     arrivals hall's big windows, planes at their gates, the jet
     bridges, the skyline and the CN Tower far off.
   ENGINE REQUESTS: a carousel skin
     (steel sides, bags riding round) for the carousel blocks · a
     WELCOME TO TORONTO sign skin for the big sign shelf.
   ============================================================ */
KinanLevels.register({
  id: '8-1', world: 8, slot: 1, kind: 'level',
  name: 'AIRPORT ARRIVALS',
  theme: 100,   /* the Toronto Airport: the big windows, planes at the gates, the CN Tower far off */
  cols: 270,
  snatch: true,   /* World 8: raccoons grab a candle and run */
  /* THE BELTS (World 8 twist, opt-in): [c0, c1, row, speed] — the belt's top is row `row` (Kinan's feet at row*16),
     speed px a frame (+ carries right, - carries left). */
  belts: [
    [9, 21, 12, 1],   /* S1 the first walkway: it helps */
    [27, 37, 12, 1],   /* S2 a walkway that stops a tile before the 2-wide gap */
    [43, 52, 12, -0.8],   /* S2 THE WRONG-WAY WALKWAY: just keep running */
    [88, 95, 10, -1],   /* S4 carousel 1 (on top), turning back toward you */
    [113, 118, 10, 1],   /* S5 THE CAROUSEL ROW: it carries you to the gap (its last tile is still) */
    [135, 142, 12, -1],   /* S6 the wrong-way walkway up to the 4-wide gap's lip (it pushes you back, away from it) */
    [149, 158, 12, 1.2],   /* S6 a fast walkway */
    [166, 175, 9, -1],   /* S7 THE TALL CAROUSEL */
    [189, 193, 12, 1.2],   /* S8 a fast walkway up to the first 5-wide gap (a tile short of its lip) */
    [218, 226, 12, 1.2]   /* S9 and up to the second (a tile short of its lip) */
  ],
  heights: [
    /* S1 0-26 the gate: the first walkway (c9-21) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 the long hall: a walkway (c27-37), a 2-wide gap c39-40, the wrong-way walkway (c43-52) */
    192,192,192,192,192,192,192,192,192,192,192,192,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 the escalators up to the mezzanine (c57-60), a 3-wide gap c66-68 under THE ARRIVALS BOARD, down (c74-77) */
    192,192,192,176,160,144,128,128,128,128,128,128,null,null,null,128,128,128,128,128,144,160,176,192,192,192,192,
    /* S4 81-107 baggage claim: carousel 1 (c88-95), THE LOST-AND-FOUND CHUTE (c97-101) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 THE CAROUSEL ROW: carousel 2 (c113-119) right up to a 4-wide gap c120-123 */
    192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 the wrong-way walkway to a 4-wide gap c143-146, a fast walkway (c149-158) */
    192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 THE TALL CAROUSEL (c166-175, three tiles up), a 3-wide gap c176-178, the checkpoint */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,
    /* S8 189-215 a fast walkway to a 5-wide gap c195-199, THE BIG SIGN (spring c207, shelf c209-211 row 3) */
    192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S9 216-242 a fast walkway to a 5-wide gap c228-232 */
    192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,
    /* S10 243-269 reward: the curb, the left-luggage cubby (board), the gift row, the way out */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [88, 10, 95, 11],   /* S4 carousel 1 (two tiles up) */
    [97, 3, 101, 6],   /* S4 THE LOST-AND-FOUND CHUTE, hanging from the ceiling (the hidden gift is one of its panels) */
    [113, 10, 119, 11],   /* S5 carousel 2 */
    [166, 9, 175, 11],   /* S7 THE TALL CAROUSEL (three tiles up) */
    [252, 9, 258, 9], [252, 7, 255, 7], [252, 8, 252, 8]   /* S10 the left-luggage cubby on a ledge (walk under it); its board door faces right */
  ],
  tiles: {
    gift: [
      [5, 8],   /* S1 */
      [33, 8],   /* S2 */
      [91, 6],   /* S4 over carousel 1 */
      [99, 6, 'gold'],   /* S4 THE LOST-AND-FOUND CHUTE: the glinting panel (hidden) */
      [131, 8],   /* S5 */
      [152, 8],   /* S6 */
      [205, 8],   /* S8 */
      [260, 8, 'heart'], [262, 8], [264, 8, 'cake']   /* S10 the gift row */
    ],
    brick: [
      [4, 8], [6, 8],   /* S1 */
      [130, 8], [132, 8],   /* S5 */
      [204, 8], [206, 8],   /* S8 */
      [261, 8], [263, 8]   /* S10 */
    ],
    spring: [
      [208, 11]   /* S8 the luggage trampoline under THE BIG SIGN (skill secret) */
    ],
    shelf: [
      [66, 5], [67, 5], [68, 5],   /* S3 THE ARRIVALS BOARD (visible secret) */
      [209, 3], [210, 3], [211, 3]   /* S8 THE BIG SIGN (skill secret) */
    ],
    board: [[255, 8]]   /* BONUS: hop onto the cubby ledge from the right and KICK the board: 2 candles inside */
  },
  /* floor cleaners, luggage carts, speed walkers and wet-floor cones; lost toy planes fly over the gaps; raccoons sneak in
     near the end. Nothing waits at a lip. */
  foes: [
    [24, 11, 'roomba'],   /* S1 */
    [48, 11, 'mallwalker'],   /* S2 a speed walker on the wrong-way walkway */
    [71, 7, 'cart'],   /* S3 on the mezzanine */
    [103, 11, 'roomba'],   /* S4 */
    [109, 11, 'cart'], [127, 6, 'plane'],   /* S5 */
    [138, 6, 'plane'], [155, 11, 'roomba'],   /* S6 */
    [170, 5, 'plane'], [184, 11, 'cone'],   /* S7 */
    [197, 6, 'plane'], [202, 11, 'cone'], [213, 11, 'raccoon'],   /* S8 */
    [220, 11, 'cone'], [230, 6, 'plane'], [238, 11, 'raccoon']   /* S9 */
  ],
  candles: [
    [3, 10], [9, 11], [11, 11], [13, 11], [15, 11], [17, 11], [19, 11], [21, 11], [23, 10], [26, 11],
    [28, 11], [30, 11], [32, 11], [34, 11], [36, 11], [38, 10], [39, 9], [40, 9], [41, 10], [44, 11], [46, 11], [50, 11], [52, 11],
    [55, 11], [57, 10], [58, 9], [59, 8], [61, 7], [63, 7], [66, 6], [68, 6], [69, 7], [72, 7], [74, 7], [75, 8], [76, 9], [77, 10], [79, 11],
    [82, 11], [84, 10], [86, 11], [89, 9], [90, 9], [92, 9], [93, 9], [94, 9], [97, 11], [99, 9], [99, 8], [101, 11], [104, 11], [106, 11],
    [109, 10], [111, 10], [114, 9], [116, 9], [118, 9], [120, 7], [121, 6], [122, 6], [123, 7], [124, 9], [126, 11], [128, 11], [130, 10], [132, 10], [134, 11],
    [136, 11], [138, 11], [140, 11], [142, 10], [143, 9], [144, 8], [145, 8], [146, 9], [147, 10], [149, 11], [151, 11], [153, 11], [155, 11], [157, 11], [159, 11],
    [163, 11], [165, 10], [167, 8], [169, 8], [171, 8], [173, 8], [175, 8], [176, 6], [177, 6], [178, 7], [179, 9], [181, 11], [183, 11], [186, 11], [188, 11],
    [190, 11], [192, 11], [194, 10], [195, 9], [196, 8], [197, 7], [198, 8], [199, 9], [200, 10], [202, 11], [204, 10], [206, 10], [208, 9], [208, 7], [209, 5], [212, 11], [214, 11],
    [217, 11], [219, 11], [221, 11], [223, 11], [225, 11], [227, 10], [228, 9], [229, 8], [230, 7], [231, 8], [232, 9], [233, 10], [235, 11], [237, 11], [240, 11], [242, 11],
    [245, 11], [247, 11], [249, 11], [254, 11], [256, 11], [260, 10], [262, 10], [264, 10],
    [253, 8], [254, 8]   /* inside the cubby, behind the board */
  ],
  secrets: [
    { kind: 'visible', col: 67, row: 4, prize: 'heart+candles' },   /* THE ARRIVALS BOARD: from the mezzanine, jump UP onto the ledge over the gap */
    { kind: 'hidden', col: 99, row: 6, prize: 'GOLDEN CANDLE', glint240: true },   /* THE LOST-AND-FOUND CHUTE: the glinting panel */
    { kind: 'skill', col: 210, row: 2, prize: 'hat' }   /* THE BIG SIGN: the luggage trampoline, then steer onto the sign */
  ],
  goldenCandle: { col: 99, row: 6 },
  checkpoint: { col: 185, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 267, row: 11 },   /* the arrivals doors: out to the curb */
  talk: [
    [2, 'KINAN', "Toronto! Glitchy's parcel came off the cargo plane. It has to be in here somewhere!", 4],
    [10, 'MOM', 'A moving walkway! Stand still and it carries you, sweetie.', 3.2],
    [43, 'DAD', "That one's going the wrong way, bud. Just keep running. I've had jobs like this.", 3.2],
    [84, 'CHENOA', 'Baggage claim! The carousels go round and round. Ride them, little bro!', 3.6],
    [150, 'SHAD', 'I just saw a RACCOON run past with a shiny parcel. Inside the airport!', 3.8],
    [244, 'KINAN', "That raccoon's got Glitchy! HEY! Come back!", 3],
    [259, 'DAD', "Welcome to Toronto, everybody! Now where'd that raccoon go? Probably out bin-ge shopping.", 3.4]
  ]
});

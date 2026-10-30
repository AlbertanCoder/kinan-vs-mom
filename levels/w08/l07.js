/* ============================================================
   LEVEL 8-7 · KENSINGTON MARKET
   (World 8 · Toronto · trail stop 9)
   Story bible (World 8 table): "Fruit stands and bike racks." Back from
   the islands, the raccoon leads Kinan through Kensington Market:
   fruit stands, bakeries, vintage shops, buskers, bikes everywhere and
   the famous car covered in plants.
   Idea (ONE): SPRINGY AWNINGS. A shop's bouncy awning (a spring at the
     foot of its front) throws Kinan way up (9 tiles), over a shopfront
     too tall to jump and onto its roof. Bike racks are steps. Act 1
     teaches it (a little shop you could jump anyway, the bike racks up
     to a patio, a gap right off its end); act 2 twists it (two shopfronts too tall to jump: only
     the awning gets you over; the bike-rack stairs to THE VINTAGE
     SIGN); act 3 tests it (5-wide gaps, then the tallest shop, bounce
     and over).
   Acts (thirds): 0-89 teach (Augusta Avenue: the first awning, the
     bike racks, the patio 3, THE GARDEN CAR and its trellis, 3) ·
     90-179 twist (Baldwin Street: THE TALL SHOP, 4, THE BIKE RACK
     STAIRS and THE VINTAGE SIGN, the checkpoint, THE TALLER SHOP, 4) ·
     180-269 test (5, THE ROOFTOP PATIO, 5, THE TALLEST SHOP, the cubby,
     the way downtown).
   Signature set-piece: THE TALL SHOP (S4): a shopfront six tiles tall;
     the awning in front of it is the only way up.
   Secrets: visible = THE GARDEN CAR'S TRELLIS (S3): a heart sits on the
     trellis over the car covered in plants; climb onto the car and jump
     UP to it (heart + candles, 61,4) · hidden = THE VINTAGE SIGN (S5):
     climb the three bike racks; the old shop sign over the top one
     glints (GOLDEN CANDLE, 124,5; only reachable from the top rack;
     two candles point up) · skill = THE ROOFTOP PATIO (S8): bounce off
     an awning and steer onto the patio rail (hat, 214,2).
   Board (taekwondo, a bonus spot): the bakery cubby on a ledge (S10):
     hop onto the ledge from the right and KICK the board: 2 candles
     inside. Never on the main path.
   Gaps: act 1 3/3 · act 2 4/4 · act 3 5/5. Every gap has a candle arc;
     nothing waits at a lip; every awning and roof has floor (no gap)
     where its bounce or a jump off it comes down (w8-levels.spec.ts
     checks the roofs, the patio, the trellis and the rail).
   Raccoons (World 8, snatch): a raccoon grabs a candle and runs.
   Look: Kensington Market (theme 106, World 8's own look): the
     market's painted old houses at dusk (steep gables, round attic
     windows, murals), striped shop awnings, string lights, street lamps.
   ENGINE REQUESTS: striped-awning skins over the springs (they are
     trampolines today) · bike-rack skins for the rack blocks · a
     garden-car skin (an old car covered in plants).
   ============================================================ */
KinanLevels.register({
  id: '8-7', world: 8, slot: 9, kind: 'level',
  name: 'KENSINGTON MARKET',
  theme: 106,   /* Kensington Market: painted houses at dusk, awnings, string lights */
  cols: 270,
  snatch: true,   /* World 8: raccoons grab a candle and run */
  heights: [
    /* S1 0-26 Augusta Avenue: fruit crates (c8-10), the first awning (spring c14) and its little shop (c15-18) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 a bike rack (c33) up to the patio (c35-44), a 3-wide gap c45-47 right off its end */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,
    /* S3 54-80 THE GARDEN CAR (c58-63) and its trellis (c60-62 row 5), a 3-wide gap c76-78 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,
    /* S4 81-107 Baldwin Street: THE TALL SHOP (awning c92, shop c93-99, six tiles tall) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 a 4-wide gap c113-116, THE BIKE RACK STAIRS (c120, c122, c124) under THE VINTAGE SIGN (c123-126) */
    192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 the checkpoint, THE TALLER SHOP (awning c146, shop c147-153, seven tiles tall) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 a 4-wide gap c169-172, a fruit stand (c178-180) */
    192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S8 189-215 a 5-wide gap c202-206, THE ROOFTOP PATIO (awning c212, rail c213-215 row 3) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,
    /* S9 216-242 a 5-wide gap c229-233, THE TALLEST SHOP (awning c237, shop c238-242) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,
    /* S10 243-269 reward: the bakery cubby (board), the gift row, the way downtown */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [8, 10, 10, 11],   /* S1 fruit crates */
    [15, 9, 18, 11],   /* S1 the little shop (three tiles: you could jump it, or bounce) */
    [33, 11, 33, 11],   /* S2 a bike rack (a step) */
    [35, 10, 44, 11],   /* S2 the patio */
    [58, 9, 63, 11],   /* S3 THE GARDEN CAR */
    [93, 6, 99, 11],   /* S4 THE TALL SHOP (six tiles: too tall to jump) */
    [120, 11, 120, 11], [122, 10, 122, 11], [124, 9, 124, 11],   /* S5 THE BIKE RACK STAIRS */
    [123, 4, 126, 5],   /* S5 THE VINTAGE SIGN over the top rack (the hidden gift is one of its letters) */
    [147, 5, 153, 11],   /* S6 THE TALLER SHOP (seven tiles) */
    [178, 10, 180, 11],   /* S7 a fruit stand */
    [238, 5, 242, 11],   /* S9 THE TALLEST SHOP */
    [252, 9, 258, 9], [252, 7, 255, 7], [252, 8, 252, 8]   /* S10 the bakery cubby on a ledge (walk under it); its board door faces right */
  ],
  tiles: {
    gift: [
      [4, 8],   /* S1 */
      [29, 8],   /* S2 */
      [66, 8],   /* S3 */
      [88, 8],   /* S4 */
      [110, 8],   /* S5 */
      [124, 5, 'gold'],   /* S5 THE VINTAGE SIGN: the glinting letter (hidden) */
      [141, 8],   /* S6 */
      [165, 8],   /* S7 */
      [195, 8],   /* S8 */
      [221, 8],   /* S9 */
      [261, 8, 'heart'], [263, 8], [265, 8, 'cake']   /* S10 the gift row */
    ],
    brick: [
      [3, 8], [5, 8],   /* S1 */
      [262, 8], [264, 8]   /* S10 */
    ],
    spring: [
      [14, 11],   /* S1 the first springy awning */
      [92, 11],   /* S4 the awning of THE TALL SHOP */
      [146, 11],   /* S6 the awning of THE TALLER SHOP */
      [212, 11],   /* S8 THE ROOFTOP PATIO's awning (skill secret) */
      [237, 11]   /* S9 the awning of THE TALLEST SHOP */
    ],
    shelf: [
      [60, 5], [61, 5], [62, 5],   /* S3 THE GARDEN CAR'S TRELLIS (visible secret) */
      [213, 3], [214, 3], [215, 3]   /* S8 THE ROOFTOP PATIO's rail (skill secret) */
    ],
    board: [[255, 8]]   /* BONUS: hop onto the cubby ledge from the right and KICK the board: 2 candles inside */
  },
  /* fruit carts, buskers, bikes, black squirrels, crows and gulls; raccoons raiding the stands. Nothing waits at a lip. */
  foes: [
    [22, 11, 'cart'],   /* S1 */
    [40, 9, 'raccoon'],   /* S2 on the patio */
    [68, 11, 'busker'],   /* S3 */
    [86, 11, 'biker'], [104, 11, 'raccoon'],   /* S4 */
    [118, 11, 'cart'], [131, 7, 'crow'],   /* S5 */
    [138, 11, 'squirrel'], [157, 11, 'raccoon'],   /* S6 */
    [171, 7, 'crow'], [175, 11, 'busker'], [184, 11, 'biker'],   /* S7 */
    [192, 11, 'squirrel'], [204, 7, 'seagull'], [209, 11, 'raccoon'],   /* S8 */
    [219, 11, 'cart'], [231, 7, 'crow'], [235, 11, 'raccoon'],   /* S9 */
    [247, 11, 'raccoon']   /* S10 */
  ],
  candles: [
    [2, 10], [6, 10], [8, 9], [9, 9], [10, 9], [12, 11], [14, 9], [15, 8], [16, 8], [17, 8], [18, 8], [20, 10], [22, 10], [24, 11], [26, 11],
    [28, 11], [30, 11], [33, 10], [34, 10], [35, 9], [37, 9], [39, 9], [41, 9], [43, 9], [45, 8], [46, 7], [47, 8], [48, 9], [50, 10], [51, 10], [53, 11],
    [55, 11], [57, 10], [58, 8], [59, 8], [60, 8], [61, 8], [62, 8], [63, 8], [66, 10], [69, 11], [71, 11], [73, 11], [75, 10], [76, 9], [77, 8], [78, 9], [79, 10],
    [81, 11], [83, 11], [85, 11], [88, 10], [90, 11], [91, 10], [92, 9], [92, 7], [93, 5], [95, 5], [97, 5], [99, 5], [101, 9], [103, 11], [105, 11], [107, 11],
    [108, 11], [110, 10], [112, 10], [113, 9], [114, 8], [115, 8], [116, 9], [117, 10], [119, 11], [120, 10], [121, 11], [122, 9], [123, 11], [124, 8], [124, 7], [128, 11], [130, 11], [132, 11], [134, 11],
    [136, 11], [139, 11], [141, 10], [143, 11], [145, 10], [146, 9], [146, 7], [147, 4], [149, 4], [151, 4], [153, 4], [155, 9], [157, 11], [159, 11], [161, 11],
    [163, 11], [165, 10], [167, 11], [168, 10], [169, 9], [170, 8], [171, 8], [172, 9], [173, 10], [175, 11], [177, 11], [178, 9], [179, 9], [180, 9], [182, 11], [184, 11], [186, 11], [188, 11],
    [190, 11], [192, 11], [195, 10], [198, 11], [200, 11], [201, 10], [202, 9], [203, 8], [204, 7], [205, 8], [206, 9], [207, 10], [209, 11], [212, 9], [212, 7], [214, 5],
    [217, 11], [219, 11], [221, 10], [223, 11], [225, 11], [227, 11], [228, 10], [229, 9], [230, 8], [231, 7], [232, 8], [233, 9], [234, 10], [235, 11], [237, 9], [237, 7], [238, 4], [240, 4], [242, 4],
    [244, 11], [246, 11], [248, 11], [250, 11], [254, 11], [256, 11], [260, 10], [262, 10], [264, 10], [266, 11],
    [253, 8], [254, 8]   /* inside the cubby, behind the board */
  ],
  secrets: [
    { kind: 'visible', col: 61, row: 4, prize: 'heart+candles' },   /* THE GARDEN CAR'S TRELLIS: onto the car, then jump UP to the trellis */
    { kind: 'hidden', col: 124, row: 5, prize: 'GOLDEN CANDLE', glint240: true },   /* THE VINTAGE SIGN: up the bike racks, the glinting letter */
    { kind: 'skill', col: 214, row: 2, prize: 'hat' }   /* THE ROOFTOP PATIO: bounce off the awning, steer onto the rail */
  ],
  goldenCandle: { col: 124, row: 5 },
  checkpoint: { col: 140, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 267, row: 11 },   /* the way downtown, to the rooftops */
  talk: [
    [2, 'MOM', 'Kensington Market! Fruit stands, bakeries, vintage shops... Stay close, sweetie.', 3.8],
    [12, 'KINAN', 'The awnings are BOUNCY! Boing!', 2.4],
    [31, 'CHENOA', 'Use the bike racks like stairs, little bro.', 2.8],
    [56, 'DAD', 'That car is covered in plants! A whole garden on wheels, bud. Talk about a car-rot.', 3.2],
    [30, "DAD", "What do you call cheese that isn't yours? Nacho cheese! Get it? Not-yo cheese? Because it's not yours?", 4.4],
    [30, "MOM", "Is that all you do, tell jokes? Peaches. I am going to look at peaches.", 3.4, "walkoff"],
    [30, "DAD", "...I'll be here all week, folks! Try the brie, it's un-brie-lievable!", 3.2],
    [89, 'SHAD', 'That shop is way too tall to jump. Bounce off its awning!', 3.2],
    [141, 'MOM', 'Fresh peaches! Okay, okay. AFTER we get Glitchy back.', 3],
    [244, 'KINAN', 'The raccoon went up onto the roofs. It is heading downtown!', 3.2]
  ]
});

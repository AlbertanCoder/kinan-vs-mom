/* ============================================================
   LEVEL 5-2 · THE PANCAKE BREAKFAST
   (World 5 · Calgary Stampede · trail stop 2)
   Story bible (World 5 table): "Springy griddles and pancake-flip
   timing." Every Stampede morning someone flips a thousand pancakes in
   a parking lot. Glitchy ran through this one: now the griddles BOUNCE,
   the pancakes are stacked to the sky, and the magpies are stealing
   breakfast.
   Idea (ONE): THE GRIDDLES. A griddle is a trampoline: step on it and
     it flips you high like a pancake. Hold the jump for a big flip, let
     go for a small one, and steer in the air. Act 1 teaches it: a
     griddle up to a pancake stack, THE GRIDDLE COUNTER (a 5-tall wall
     only a flip gets you over), a griddle on the RIDGE under the top
     stack. Act 2 twists it: THE GRIDDLE ROW, three griddles that flip
     you over three 4-wide gaps (or jump them, run held), the pancake
     MESA, THE FLIP-OFF STAGE. Act 3 tests it: the same chain over
     5-wide gaps, then THE PANCAKE TOWER.
   Acts (thirds): 0-89 teach (the first griddle, the counter, a 3-wide
     gap, the RIDGE and the top stack, a 3-wide gap) · 90-179 twist (the
     lone griddle by the coffee urn, the checkpoint, THE GRIDDLE ROW 4/4/4,
     the pancake MESA, a 4-wide gap, THE FLIP-OFF STAGE) · 180-269 test
     (a 5-wide gap, the griddle chain 5/5, THE PANCAKE TOWER, the golden
     spatula podium).
   Signature set-piece: THE GRIDDLE ROW (S5): griddle, gap, griddle,
     gap, griddle, gap: flip-flip-flip across the breakfast.
   Secrets: visible = THE TOP STACK (S3): the tallest pancake stack
     stands up and to the LEFT of the ridge griddle; flip high and steer
     back onto it (heart + candles, 60,2) · hidden = THE FLIPPED PANCAKE
     (S4): a pancake flipped so high it stuck in the sky glints over the
     lone griddle; stand still on the griddle and flip straight up
     (GOLDEN CANDLE, 95,3) · skill = THE PANCAKE TOWER (S9): flip off the
     tower griddle back to the left onto the first stack, then jump to
     the top stack (hat, 224,2).
   Look: borrows the Pancake Breakfast (theme 32): morning sky, the
     griddle tents, warm brown ground.
   Bubble beats for ER-4 (not wired): c2 Robin: "Free pancakes! Grab a
     plate!" · c11 Kinan: "The griddle BOUNCED me!" · c35 Shad: "Hold the
     jump for the big flip, bud." · c95 Chenoa: "Is that a pancake...
     stuck in the SKY?" · c107 checkpoint, the cook: "Why did the pancake
     go to the rodeo? To see the flap-jacks!" · c218 "The top of the
     tower! I can see the Saddledome!"
   ENGINE REQUESTS: a griddle skin for the spring (hot plate, steam
     puffs, a "FLIP!" pop instead of "BOING!") and a pancake-stack skin
     for the shelves · a pancake that flips in a pan as a moving
     platform · a scoreboard prop counting the contest's pancakes ·
     bubbles ER-4.
  
   ============================================================ */
KinanLevels.register({
  id: '5-2', world: 5, slot: 2, kind: 'level',
  name: 'THE PANCAKE BREAKFAST',
  theme: 32,              /* the Pancake Breakfast: morning sky, the griddle tents, warm brown ground */
  cols: 270,
  heights: [
    /* S1 0-26 the breakfast line: the first griddle sunk flush in the ground (c11) · a pancake stack · a picnic table */
    192,192,192,192,192,192,192,192,192,192,192,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 the griddle (c35) at THE GRIDDLE COUNTER (c36-39, 5 tall: only a flip gets you over) · a 3-wide gap c49-51 */
    192,192,192,192,192,192,192,192,null,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,
    /* S3 54-80 the RIDGE (c57-73), its griddle (c62) with THE TOP STACK up to the left · a 3-wide gap c77-79 */
    192,192,192,184,176,168,160,160,null,160,160,160,160,160,160,160,168,176,184,192,192,192,192,null,null,null,192,
    /* S4 81-107 the cook tent: THE LONE GRIDDLE (c95), a pancake glints high over it · the coffee urn, the warming shelf · checkpoint */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 THE GRIDDLE ROW: griddle c110, gap c112-114, griddle c122, gap c124-126, griddle c134 (each flips you over the next gap) */
    192,192,null,192,null,null,null,192,192,192,192,192,192,192,null,192,null,null,null,192,192,192,192,192,192,192,null,
    /* S6 135-161 the last gap of the row c136-138 · the pancake MESA (c144-157, 1:1 sides, 4 tall) */
    192,null,null,null,192,192,192,192,192,176,160,144,128,128,128,128,128,128,128,144,160,176,192,192,192,192,192,
    /* S7 162-188 a 4-wide gap c162-165 · THE FLIP-OFF STAGE (c169-181) with its griddle (c175) */
    null,null,null,null,192,192,192,176,160,144,144,144,144,null,144,144,144,160,176,192,192,192,192,192,192,192,192,
    /* S8 189-215 a 5-wide gap c191-195 · the griddle chain: griddle c200, gap c202-205, griddle c212, gap c214-217 */
    192,192,null,null,null,null,null,192,192,192,192,null,192,null,null,null,null,192,192,192,192,192,192,null,192,null,null,
    /* S9 216-242 THE PANCAKE TOWER: the tower griddle (c232), two stacks up to its left (skill) */
    null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,192,192,192,192,192,192,192,192,192,192,
    /* S10 243-269 reward: the golden spatula podium (a TERRACE c247-256), Dad's truck */
    192,192,192,192,176,160,160,160,160,160,160,160,176,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [19, 10, 21, 11],   /* S1 a picnic table */
    [36, 7, 37, 11], [38, 9, 39, 11],   /* S2 THE GRIDDLE COUNTER and its back step */
    [99, 9, 99, 11]   /* S4 the coffee urn */
  ],
  tiles: {
    gift: [
      [5, 8, 'popper'],   /* S1 */
      [30, 8],   /* S2 */
      [95, 3, 'gold'], [86, 8],   /* S4 THE FLIPPED PANCAKE (hidden) · the tent */
      [151, 4, 'heart'],   /* S6 on the mesa */
      [167, 8],   /* S7 */
      [222, 8],   /* S9 */
      [250, 5], [252, 5, 'cake'], [254, 5, 'heart']   /* S10 the podium */
    ],
    brick: [
      [4, 8], [6, 8],   /* S1 */
      [29, 8], [31, 8],   /* S2 */
      [85, 8], [87, 8],   /* S4 */
      [150, 4], [152, 4],   /* S6 */
      [221, 8], [223, 8],   /* S9 */
      [251, 5], [253, 5]   /* S10 */
    ],
    spring: [
      [11, 12],   /* S1 the first griddle (flush in the ground: run on and it flips you) */
      [35, 12],   /* S2 the griddle at the counter */
      [62, 10],   /* S3 the ridge griddle */
      [95, 12],   /* S4 THE LONE GRIDDLE */
      [110, 12], [122, 12], [134, 12],   /* S5 THE GRIDDLE ROW */
      [175, 9],   /* S7 the stage griddle */
      [200, 12], [212, 12],   /* S8 the griddle chain */
      [232, 12]   /* S9 the tower griddle */
    ],
    shelf: [
      [14, 6], [15, 6], [16, 6], [17, 6],   /* S1 a pancake stack */
      [59, 3], [60, 3], [61, 3],   /* S3 THE TOP STACK, up and left of the ridge griddle (visible secret) */
      [101, 7], [102, 7], [103, 7], [104, 7],   /* S4 the warming shelf */
      [227, 6], [228, 6], [229, 6], [223, 3], [224, 3], [225, 3]   /* S9 THE PANCAKE TOWER: the first stack and the top stack (skill secret) */
    ]
  },
  /* corn dogs on legs run the line, hay bales roll, lasso lizards throw, magpies steal breakfast (stomp one to get it back); nothing waits at a gap's lip */
  talk: [   /* Dad's jokes, the wheeze-laugh, Mom's reactions (tools/dad-lines.mjs) */
    [30, "DAD", "Pancake breakfast! You know what I call a pancake that... hee... HAHA... that tells... I can't—", 4, "wheeze"],
    [30, "MOM", "...a stack-up comedian. Robin, you told me that on our first date. And I still married you.", 4, "laugh"]
  ],
  foes: [
    [24, 11, 'corndog'],   /* S1 */
    [44, 11, 'haybale'],   /* S2 */
    [55, 11, 'lassolizard'],   /* S3 */
    [90, 11, 'corndog'], [104, 4, 'magpie'],   /* S4 */
    [118, 3, 'magpie'], [130, 11, 'corndog'],   /* S5 */
    [150, 7, 'haybale'], [159, 4, 'goose'],   /* S6 */
    [177, 8, 'lassolizard'], [184, 3, 'magpie'],   /* S7 */
    [192, 3, 'magpie'], [204, 2, 'magpie'], [210, 11, 'corndog'],   /* S8 (the run-up to each griddle is left clear) */
    [226, 11, 'haybale'], [238, 4, 'goose'], [240, 11, 'corndog'],   /* S9 */
    [261, 11, 'corndog']   /* S10 */
  ],
  candles: [
    [2, 11], [3, 11], [4, 11], [5, 7], [11, 10], [12, 8], [13, 6], [14, 5], [15, 5], [16, 5], [17, 5], [19, 9], [20, 9], [21, 9],
    [29, 7], [31, 7], [33, 11], [34, 11], [35, 10], [35, 8], [36, 5], [37, 5], [38, 7], [39, 7], [41, 11], [43, 11], [45, 11], [47, 11],
    [48, 11], [49, 9], [50, 8], [51, 9], [52, 11], [57, 10], [58, 9], [59, 8], [59, 2], [61, 2], [61, 9], [62, 8], [62, 6], [63, 4],
    [64, 3], [64, 9], [66, 9], [68, 9], [71, 9], [72, 10], [76, 11], [77, 9], [78, 8], [79, 9], [80, 11], [82, 11], [83, 11], [84, 11],
    [86, 7], [93, 11], [94, 11], [95, 10], [95, 8], [95, 6], [101, 6], [102, 6], [103, 6], [104, 6], [109, 11], [110, 10], [111, 8], [112, 6],
    [113, 5], [114, 4], [116, 4], [117, 6], [118, 8], [121, 11], [122, 10], [123, 8], [124, 6], [125, 5], [126, 4], [128, 4], [129, 6], [130, 8],
    [133, 11], [134, 10], [135, 8], [136, 6], [137, 5], [138, 4], [140, 6], [141, 8], [142, 10], [145, 10], [146, 9], [147, 8], [148, 7], [150, 7],
    [152, 7], [150, 3], [152, 3], [155, 8], [156, 9], [161, 11], [162, 9], [163, 8], [164, 8], [165, 9], [166, 11], [167, 7], [170, 9], [171, 8],
    [172, 8], [174, 8], [176, 8], [178, 8], [175, 6], [176, 4], [177, 3], [183, 11], [185, 11], [187, 11], [190, 11], [191, 9], [192, 8], [193, 8],
    [194, 8], [195, 9], [196, 11], [199, 11], [200, 10], [201, 8], [202, 6], [203, 5], [204, 4], [207, 11], [209, 11], [211, 11], [212, 10], [213, 8],
    [214, 6], [215, 5], [216, 4], [219, 11], [222, 7], [228, 5], [224, 2], [229, 11], [230, 11], [231, 11], [232, 10], [233, 8], [234, 6], [245, 11],
    [247, 10], [248, 9], [249, 9], [250, 9], [251, 9], [252, 9], [253, 9], [254, 9], [250, 4], [252, 4], [254, 4], [258, 11], [260, 11], [262, 11],
    [264, 11]
  ],
  secrets: [
    { kind: 'visible', col: 60, row: 2, prize: 'heart+candles' },   /* THE TOP STACK, flipped back onto from the ridge griddle */
    { kind: 'hidden', col: 95, row: 3, prize: 'GOLDEN CANDLE', glint240: true },   /* THE FLIPPED PANCAKE stuck in the sky over the lone griddle */
    { kind: 'skill', col: 224, row: 2, prize: 'hat' }   /* the top of THE PANCAKE TOWER */
  ],
  goldenCandle: { col: 95, row: 3 },
  checkpoint: { col: 107, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 266, row: 11 }   /* Dad's truck waits past the podium */
});

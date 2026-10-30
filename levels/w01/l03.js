/* ============================================================
   LEVEL 1-3 · THE KITCHEN  (World 1 · Saskatoon home · trail stop 3)
   Story bible: "Counter climbing and breakfast chaos." Glitchy shot
   through the kitchen: the toast is hopping, the eggs are walking.
   Idea (ONE): CLIMB. Drawer handles (shelves) are ladders up to the
   counters, the pantry shelves arch over a floor pit, and the fridge is
   the big climb. Every climb step is 2 tiles (32 px) — never a reach.
   Acts (thirds): 0-53 teach (counter + drawer, the sink counter) ·
   54-107 twist (the pantry shelf arch over a 3-wide pit, the kitchen
   table) · 108-161 test (THE FRIDGE, then the toaster reward and the
   back door).
   Signature toy: climbing the fridge on its magnet shelves.
   Secrets: visible = on top of the fridge (heart) · hidden = under the
   sink: drop down the sink or walk in from the right, bump the far end
   (GOLDEN CANDLE) · skill = RUN off the toaster spring onto the high
   cupboard shelf (cake).
   ============================================================ */
KinanLevels.register({
  id: '1-3', world: 1, slot: 3, kind: 'level',
  name: 'THE KITCHEN',
  theme: 2,                 /* the legacy kitchen look */
  cols: 162,
  heights: [
    /* S1 0-26 counter A (a solid block, c9-17) on a flat floor */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 floor pit c34-36 · the sink counter (solid slabs, c39-50) */
    192,192,192,192,192,192,192, null,null,null, 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 the pantry shelf arch over a 3-wide floor pit (c66-68): jump it, or climb over it */
    192,192,192,192,192,192,192,192,192,192,192,192, null,null,null, 192,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 the kitchen table + chairs · pit c105-107 (5 floor tiles after the chair: a run-jump over it lands safe) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null,
    /* S5 108-134 THE FRIDGE (c114-118) + counter D · pit c131-133 (5 floor tiles after the counter) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null, 192,
    /* S6 135-161 the toaster spring, the cupboard shelf, the back door */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [9, 8, 17, 11],                       /* counter A: 4 tiles high, climb it on the drawer handle */
    [39, 8, 43, 9], [46, 8, 50, 9],       /* the sink counter (the sink is the gap c44-45) */
    [39, 10, 39, 11],                     /* the sink cabinet's back wall: the cabinet opens on the right */
    [84, 10, 85, 11], [98, 10, 99, 11],   /* the two chairs */
    [87, 8, 96, 8],                       /* the kitchen table top (3 rows of room under it) */
    [114, 4, 118, 11],                    /* THE FRIDGE: 8 tiles high */
    [120, 8, 125, 11]                     /* counter D: the way down from the fridge */,
    [20, 9, 26, 9], [20, 7, 23, 7], [20, 8, 20, 8]   /* taekwondo (2026-10-28): the spice cupboard over the floor (walk under it); its board door faces right */
  ],
  tiles: {
    gift: [[13, 5, 'popper'], [40, 9, 'gold'], [63, 4, 'candle'], [90, 5, 'candle'], [92, 5, 'candle'],
           [116, 2, 'heart'], [146, 2, 'cake']],
    spring: [[140, 12]],                  /* the toaster, flush with the floor */
    shelf: [[7, 10], [8, 10],                                   /* counter A's drawer handle */
            [37, 10], [38, 10],                                 /* the sink counter's drawer */
            [58, 9], [59, 9], [60, 9], [62, 7], [63, 7], [64, 7], [66, 5], [67, 5], [68, 5], [69, 5],
            [71, 7], [72, 7], [73, 7], [75, 9], [76, 9], [77, 9],   /* the pantry arch */
            [110, 10], [111, 10], [112, 8], [113, 8], [111, 6], [112, 6], [113, 6],   /* the fridge magnets: a ladder, 2 tiles per step */
            [145, 5], [146, 5], [147, 5], [148, 5]],              /* the high cupboard shelf (4 wide) */
    board: [[23, 8]]              /* BONUS: hop onto the cupboard's ledge from the right and KICK the board: 2 candles inside */
  },
  talk: [   /* Dad's jokes, the wheeze-laugh, Mom's reactions (tools/dad-lines.mjs) */
    [30, "DAD", "Hi bud, it's Dad on the phone from camp! Why did the cookie go to the... hee... HAHA... the... I can't—", 4.4, "wheeze"],
    [30, "KINAN", "...to the doctor? Because it felt crummy. Dad, that's Grandpa's joke. I'm telling him.", 3.8]
  ],
  foes: [[15, 7, 'toast'], [48, 7, 'egg'], [56, 11, 'egg'], [67, 4, 'carrot'],
         [90, 7, 'toast'], [92, 11, 'egg'], [123, 7, 'egg'], [128, 11, 'broccoli'], [152, 11, 'cupcake']],
  candles: [[3, 11], [4, 11], [7, 9], [8, 9], [10, 7], [11, 7], [16, 7], [17, 7], [20, 11], [21, 11],
            [33, 10], [34, 9], [35, 8], [36, 9], [37, 9], [44, 7], [45, 7], [42, 11], [43, 11], [47, 11], [48, 11],
            [59, 8], [63, 6], [67, 4], [68, 4], [72, 6], [76, 8], [65, 10], [66, 9], [67, 8], [68, 9], [69, 10],
            [88, 7], [94, 7], [89, 11], [91, 11], [93, 11], [95, 11], [104, 10], [105, 9], [106, 8], [107, 9], [108, 10],
            [110, 9], [112, 7], [112, 5], [114, 3], [115, 3], [118, 3], [121, 7], [124, 7],
            [130, 10], [131, 9], [132, 8], [133, 9], [134, 10],
            [140, 7], [140, 5], [143, 4], [145, 4], [147, 4], [157, 11], [158, 11],
            [21, 8], [22, 8]],                                    /* behind the cupboard's board */
  secrets: [
    { kind: 'visible', col: 116, row: 2, prize: 'heart' },          /* Secret-1: climb the fridge, bump the block on top */
    { kind: 'hidden', col: 40, row: 9, prize: 'GOLDEN CANDLE' },    /* Secret-2: inside the sink cabinet, far end */
    { kind: 'skill', col: 146, row: 2, prize: 'cake' }              /* Secret-3: RUN off the toaster onto the cupboard shelf */
  ],
  goldenCandle: { col: 40, row: 9 },
  checkpoint: { col: 108, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 158, row: 11 }             /* the back door */
});

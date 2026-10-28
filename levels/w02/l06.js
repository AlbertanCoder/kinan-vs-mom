/* ============================================================
   LEVEL 2-6 · THE CAFETERIA  (World 2 · School · trail stop 7)
   Story bible (World 2 table): "Lunch-tray sleds and pudding puddles."
   Glitchy zapped the lunch line: the trays slide by themselves, the
   pudding is everywhere and the food is walking around.
   Idea (ONE): TRAY-SLED KICKERS. Run up a little tray ramp to its lip and
     fly over a pudding puddle onto LOWER ground, like a sled off a jump:
     the drop makes the jump longer, so the 4- and 5-wide puddles land
     safe. Act 1 also teaches the steep 1:1 tray-return ramps.
   Signature set-piece: THE TRAY SLED RUN (S6-S7): climb the tray-return
     conveyor (a steep ramp, 6 tiles up), ride down it, hit the kicker and
     fly the 5-wide pudding puddle, then a second kicker and a 4-puddle.
   Acts (72 cols each): teach 0-71 (a lunch table to run under, the first
     steep ramp, 2- and 3-puddles, the jello stepping stones) · twist
     72-143 (two kickers over 4-puddles, the salad bar, the counter) ·
     test 144-215 (the tray sled run: 5/5/4 puddles, a runaway lunch cart,
     a paper plane, then the jello reward and the dish-return door).
   Secrets: visible = the ORDER-UP hatch: hop up three wobbly jello
     cubes (1 wide) to the shelf over the hatch (heart, 64,2) · hidden =
     the salad bar's sneeze guard hangs over the floor; bump the far LEFT
     end of its underside (hard hat, 116,7, glints) · skill = the GOLDEN
     CANDLE in the tray stack: walk BACK onto the last jello spring so it
     throws you left onto the tray rack, then bump the gold block in the
     stack of tray-bricks over your head (193,4). A run to the right over
     the spring flies away from it.
   Bubble beats for ER-4 (not wired): c2 "Lunch time! ...Why is the
     pudding MOVING?" · c40 "Tray sledding is NOT allowed. (It's
     allowed.)" · c110 checkpoint: the lunch lady: "Keep your tray
     level, sweetie!" · c210 "Somebody mop the pudding! Not me."
   ENGINE REQUESTS: rideable lunch-tray sleds (slide downhill with
     momentum; today the kickers are plain ramps) · pudding drawn in the
     puddle pits and a sticky pudding floor (the banana-slug slime exists
     but is not authorable) · a 'jello' skin for the spring and for
     1-wide solid blocks · a lunch-lady thrower and food skins
     ('cart', 'egg', 'cupcake', 'broccoli', 'wetsign' stand in).
   ============================================================ */
KinanLevels.register({
  id: '2-6', world: 2, slot: 7, kind: 'level',
  name: 'THE CAFETERIA',
  theme: 27,                /* borrows the restaurant look: an ORDER UP window, checkered tables, hanging lamps */
  cols: 216,
  heights: [
    /* S1 0-26 teach: a lunch table c7-12 (run under or hop on) · the first steep ramp (1:1) c15-21 · 2-puddle c22-23 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, 176,160, 160,160,160, 176,192, null,null, 192,192,192,
    /* S2 27-53 the tray return: 2:1 up c28-33, the top c34-37, 1:1 down c38-40 · 3-puddle c44-46 */
    192, 184,176,168,160,152,144, 144,144,144,144, 160,176,192, 192,192,192, null,null,null, 192,192,192,192,192,192,192,
    /* S3 54-80 the jello stepping stones to the ORDER-UP hatch · a lunch table c67-71 · 4-puddle c74-77 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null,null, 192,192,192,
    /* S4 81-107 twist: KICKER 1 (lip c88 at 160) over a 4-puddle c89-92 down to the floor · KICKER 2 (lip c101) · 4-puddle c102-105 */
    192,192,192,192, 184,176,168,160, null,null,null,null, 192,192,192,192,192,192,192, 184,176, null,null,null,null, 192,192,
    /* S5 108-134 checkpoint · the salad bar's sneeze guard c116-121 · the serving counter c123-128 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 THE TRAY SLED RUN: the conveyor (1:1 up to 96) c136-141, the top, 1:1 down, KICKER 3 (lip c150 at 128), 5-puddle c151-155, landing at 176 */
    192, 176,160,144,128,112,96, 96,96, 112,128,144, 144,144, 136,128, null,null,null,null,null, 176,176,176,176,176, 192,
    /* S7 162-188 KICKER 4 (lip c168 at 176) · 5-puddle c169-173 · 4-puddle c180-183 */
    192,192,192,192,192, 184,176, null,null,null,null,null, 192,192,192,192,192,192, null,null,null,null, 192,192,192,192,192,
    /* S8 189-215 reward: the tray rack (skill), the jello spring, the dish-return door */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [7, 9, 12, 9],                        /* S1 a lunch table: run under it, or hop on top */
    [57, 9, 57, 9], [59, 7, 59, 7], [61, 5, 61, 5],   /* S3 three wobbly jello cubes (1 wide) up to the hatch */
    [67, 9, 71, 9],                       /* S3 a second lunch table */
    [116, 7, 121, 7],                     /* S5 the salad bar's sneeze guard (its far-left underside hides a hard hat) */
    [123, 10, 128, 11]                    /* S5 the serving counter */
  ],
  tiles: {
    gift: [[10, 6, 'popper'], [35, 6], [96, 8], [116, 7, 'hat'], [139, 5], [176, 8, 'heart'], [193, 4, 'gold']],
    brick: [[34, 6], [36, 6], [124, 6], [125, 6], [126, 6],
            [192, 4], [194, 4], [195, 4]],                     /* S8 the tray stack over the rack (the golden candle block sits in it at c193) */
    spring: [[200, 12]],                                         /* S8 the jello spring: walk back onto it to fly left onto the rack */
    shelf: [[63, 3], [64, 3], [65, 3],                          /* S3 the shelf over the ORDER-UP hatch */
            [190, 7], [191, 7], [192, 7], [193, 7], [194, 7], [195, 7], [196, 7], [197, 7], [198, 7], [199, 7]]   /* S8 the tray rack: the spring throws you onto its right end */
  },
  /* nothing stands on the kickers (S4) or waits at a puddle's landing; the cart on the conveyor rolls toward you */
  foes: [[11, 8, 'egg'],
         [36, 8, 'cupcake'],
         [69, 8, 'cart'],
         [126, 9, 'cupcake'], [114, 11, 'broccoli'],
         [142, 5, 'cart'], [146, 3, 'plane'],
         [164, 11, 'egg'], [187, 11, 'toast'],
         [206, 11, 'wetsign']],
  candles: [[3, 11], [4, 11], [8, 11], [9, 11], [10, 11], [11, 11],
            [15, 10], [16, 9], [17, 9], [18, 9], [19, 9], [21, 10], [22, 9], [23, 9], [24, 10],
            [29, 10], [31, 9], [33, 8], [43, 10], [44, 9], [45, 8], [46, 9], [47, 10],
            [57, 8], [59, 6], [61, 4], [63, 2], [65, 2], [68, 11], [69, 11], [70, 11],
            [73, 10], [74, 9], [75, 8], [76, 8], [77, 9], [78, 10],
            [86, 9], [88, 8], [89, 7], [90, 6], [91, 6], [92, 7], [93, 9],
            [101, 9], [102, 8], [103, 7], [104, 7], [105, 8], [106, 9],
            [117, 6], [118, 6], [119, 6], [120, 6], [113, 11], [114, 11],
            [137, 9], [139, 7], [141, 5], [142, 5], [143, 5], [145, 6],
            [150, 6], [151, 5], [152, 4], [153, 4], [154, 5], [155, 6], [157, 9], [158, 9],
            [168, 9], [169, 8], [170, 7], [171, 7], [172, 8], [173, 9],
            [179, 10], [180, 9], [181, 8], [182, 8], [183, 9], [184, 10],
            [196, 11], [197, 11], [192, 6], [194, 6], [197, 6], [198, 6], [208, 11], [209, 11], [210, 11]],
  secrets: [
    { kind: 'visible', col: 64, row: 2, prize: 'heart' },                          /* the shelf over the ORDER-UP hatch */
    { kind: 'hidden', col: 116, row: 7, prize: 'hat', glint240: true },              /* the sneeze guard's far-left underside */
    { kind: 'skill', col: 193, row: 4, prize: 'GOLDEN CANDLE' }                     /* the gold block in the tray stack over the rack */
  ],
  goldenCandle: { col: 193, row: 4 },
  checkpoint: { col: 110, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 213, row: 11 }             /* the dish-return door */
});

/* ============================================================
   LEVEL 4-5 · THE MALL ICE RINK  (World 4 · Edmonton Homecoming · trail stop 5)
   Story bible (World 4 table): "Ice momentum and spinning skaters."
   Out of the waterpark and down the hall: the big mall's ice rink,
   right in the middle of the shops, with two floors of balconies
   looking down on the ice. Chenoa only wanted a hot chocolate. Glitchy
   got here first and zapped the figure skaters: they spin so fast
   that anyone who lands on one gets flung sky-high. The Zamboni drives
   itself. Shoppers just keep walking.
   Idea (ONE): SPIN-UPS. A pair of spinning skaters (springs) stands on
     the ice; hop onto them and they fling Kinan nine tiles up, over
     shop fronts and rink glass, up through the balcony railings
     (shelves) and down onto the far side. Act 1 teaches it (skaters in
     front of the skate shop, then a pillar with a balcony over the
     lagoon); act 2 is CENTRE ICE, three skater pairs eleven tiles apart
     that fling you from one to the next over the Zambonis; act 3 puts a
     skater right at the lip of the 5-wide lagoon channels.
   Acts (thirds): 0-71 teach (the skate shop, the pillar and its
     balcony over a 3-wide lagoon, the food court BROW, a 3-wide
     lagoon) · 72-143 twist (CENTRE ICE, the checkpoint, THE PENALTY
     BOX, a 4-wide lagoon, the escalator up) · 144-215 test (the
     second-floor MESA, skaters at the lips of two 5-wide lagoons, a
     4-wide lagoon with no help, the glass elevator, the mall doors).
   Signature set-piece: CENTRE ICE (S4-S5): three skater pairs, each in
     front of a pane of rink glass. Running, one fling lands you right
     on the next pair (boing, boing, boing) while the Zambonis putter
     around underneath. Nothing under the rink is a pit.
   Secrets: visible = THE SCOREBOARD (S4): it hangs over the ice just
     left of the first pair; stand still, hop on the skaters and steer
     BACK (left) while you fly (heart + candles, 86,3) · hidden = THE
     PENALTY BOX (S5): walk in under its roof and jump; one block of the
     roof glints (GOLDEN CANDLE, 126,8) · skill = THE GLASS ELEVATOR
     (S8): three 2-wide ledges, each three tiles higher than the last;
     tap, don't run (hat, 209,2).
   Look: borrows the Mall Ice Rink (theme 24): the rink, the glass and
     the mall's balconies, blue-grey ice light.
   Bubble beats for ER-4 (not wired): c2 Chenoa: "One hot chocolate.
     Then we go. Kinan? KINAN." · c12 "The skaters are spinning like
     tops!" · c86 "The scoreboard says KINAN 1, GLITCHY 0." · c121
     checkpoint, Chenoa: "Why did the hockey player bring string? To
     tie the game." · c126 "Somebody left something in the penalty
     box..." · c210 Chenoa: "Fine. You can skate. ONE lap."
   ENGINE REQUESTS: ice for authored levels (`ice: true` on a level or
     area; the legacy rink's F.ACC_ICE is already in the engine; today
     authored levels force ice off). The rink is built so it can be
     switched on later: every stretch of ice ends at rink glass or
     boards, never at a lagoon lip (cols 83-130) · a spinning figure
     skater skin for the spring · lagoon water drawn in the pits ·
     shoppers waving from the balconies · bubbles ER-4.
   ============================================================ */
KinanLevels.register({
  id: '4-5', world: 4, slot: 5, kind: 'level',
  name: 'THE MALL ICE RINK',
  theme: 24,                /* the Mall Ice Rink: the rink, the glass, the balconies */
  cols: 216,
  heights: [
    /* S1 0-26 the mall hallway · two skaters (c12-13) in front of THE SKATE SHOP (c14-17) · the first balcony */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 two skaters (c30-31) in front of a pillar (c32-33) · the balcony over a 3-wide lagoon c40-42 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 the food court BROW (c56-65) · a table · a 3-wide lagoon c71-73 */
    192,192,184,176,176,176,176,176,176,176,184,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,
    /* S4 81-107 CENTRE ICE: the boards (c82), the scoreboard, pairs c88-89 and c99-100, each with its pane of glass */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 the last pair (c110-111) · checkpoint · THE PENALTY BOX (c124-128) · a 4-wide lagoon c131-134 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,
    /* S6 135-161 the escalator up (c138-140) to the second-floor MESA (c141-148), down · a skater at the lip of a 5-wide lagoon c156-160 */
    192,192,192,176,160,144,144,144,144,144,144,144,144,144,160,176,192,192,192,192,192,null,null,null,null,null,192,
    /* S7 162-188 room to land · a skater at the lip (c171) of a 5-wide lagoon c172-176 · room to land */
    192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S8 189-215 a 4-wide lagoon c193-196 with no help · reward: THE GLASS ELEVATOR (skill), gifts, the mall doors */
    192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [14, 7, 17, 11],                      /* S1 THE SKATE SHOP (5 tall): only a spin-up gets over it */
    [32, 7, 33, 11],                      /* S2 a pillar holding up the balcony */
    [82, 11, 82, 11],                     /* S4 the rink boards: hop onto the ice */
    [90, 6, 90, 11], [101, 6, 101, 11], [112, 6, 112, 11],   /* the three panes of rink glass (6 tall) */
    [124, 8, 128, 8]                      /* S5 THE PENALTY BOX roof (walk in under it) */
  ],
  tiles: {
    gift: [[6, 8, 'popper'], [49, 8], [61, 7, 'heart'], [126, 8, 'gold'], [144, 5, 'cake'], [211, 8, 'heart']],
    brick: [[5, 8], [7, 8], [48, 8], [50, 8], [60, 7], [62, 7], [143, 5], [145, 5], [210, 8], [212, 8]],
    spring: [[12, 11], [13, 11],          /* the spinning skaters (they fling: BOING) */
             [30, 11], [31, 11],
             [88, 11], [89, 11], [99, 11], [100, 11], [110, 11], [111, 11],
             [155, 12], [171, 12]],       /* act 3: a skater right at the lagoon's lip */
    shelf: [[18, 7], [19, 7], [20, 7], [21, 7], [22, 7], [23, 7], [24, 7],     /* S1 the first balcony */
            [34, 7], [35, 7], [36, 7], [37, 7], [38, 7], [39, 7], [40, 7], [41, 7], [42, 7], [43, 7], [44, 7], [45, 7], [46, 7],   /* S2 the balcony over the lagoon */
            [67, 9], [68, 9],             /* S3 a food court table */
            [85, 4], [86, 4], [87, 4],    /* S4 THE SCOREBOARD (visible secret) */
            [200, 9], [201, 9], [204, 6], [205, 6], [208, 3], [209, 3]]   /* S8 THE GLASS ELEVATOR (skill) */
  },
  /* shoppers stroll, rollerbladers and carts roll, the Zambonis putter around the rink, magpies flew in the doors.
     Nothing waits at a lagoon lip, and nothing flies through a spin-up. */
  foes: [[9, 11, 'mallwalker'],
         [51, 11, 'rollerblader'],
         [60, 10, 'mallwalker'],
         [94, 11, 'zamboni'], [105, 11, 'rollerblader'],
         [116, 11, 'zamboni'],
         [145, 8, 'mallwalker'], [141, 4, 'magpie'],
         [186, 11, 'cart'],
         [203, 11, 'zamboni'], [207, 4, 'magpie']],
  candles: [[3, 11], [4, 11], [5, 7], [7, 7], [10, 11], [11, 11],
            [12, 7], [13, 5], [14, 3], [15, 2], [16, 2], [17, 3], [19, 6], [20, 6], [21, 6], [22, 6], [23, 6], [25, 10], [26, 11],
            [28, 11], [29, 11], [30, 7], [31, 5], [32, 3], [33, 2], [34, 2], [35, 3],
            [37, 6], [38, 6], [39, 6], [40, 6], [41, 6], [42, 6], [43, 6], [44, 6], [45, 6],
            [39, 10], [40, 9], [41, 9], [42, 9], [43, 10], [48, 7], [50, 7],
            [56, 10], [58, 10], [59, 10], [62, 10], [63, 10], [67, 8], [68, 8],
            [70, 10], [71, 9], [72, 8], [73, 9], [74, 10], [77, 11], [78, 11],
            [83, 10], [84, 11], [85, 11], [86, 11], [85, 3], [87, 3],
            [88, 8], [89, 6], [90, 4], [91, 3], [92, 2], [93, 2], [94, 2], [95, 3], [96, 4], [97, 6], [98, 8], [92, 11], [93, 11],
            [100, 7], [101, 4], [102, 3], [103, 2], [104, 2], [105, 2], [106, 3], [107, 4], [108, 6], [109, 8],
            [111, 7], [112, 4], [113, 3], [114, 2], [115, 2], [116, 2], [117, 3], [118, 5], [119, 8],
            [125, 11], [127, 11], [124, 7], [125, 7], [127, 7], [128, 7],
            [129, 10], [130, 9], [131, 8], [132, 7], [133, 7], [134, 8], [135, 9], [136, 10],
            [138, 10], [139, 9], [140, 8], [142, 8], [147, 8], [148, 8], [149, 8], [150, 9],
            [152, 11], [153, 11], [154, 11], [155, 9], [156, 6], [157, 4], [158, 3], [159, 3], [160, 4], [161, 6], [162, 8], [163, 10],
            [168, 11], [169, 11], [171, 9], [172, 6], [173, 4], [174, 3], [175, 3], [176, 4], [177, 6], [178, 8], [179, 10],
            [182, 11], [183, 11],
            [192, 10], [193, 9], [194, 8], [195, 8], [196, 9], [197, 10],
            [200, 8], [201, 8], [204, 5], [205, 5], [208, 2], [214, 11]],
  secrets: [
    { kind: 'visible', col: 86, row: 3, prize: 'heart+candles' },                  /* THE SCOREBOARD: steer back onto it */
    { kind: 'hidden', col: 126, row: 8, prize: 'GOLDEN CANDLE', glint240: true }, /* THE PENALTY BOX roof */
    { kind: 'skill', col: 209, row: 2, prize: 'hat' }                              /* THE GLASS ELEVATOR */
  ],
  goldenCandle: { col: 126, row: 8 },
  checkpoint: { col: 121, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 213, row: 11 }             /* the doors to the indoor rollercoaster */
});

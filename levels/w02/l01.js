/* ============================================================
   LEVEL 2-1 · THE BUS STOP  (World 2 · School · trail stop 1)
   Story bible (World 2 table): "Bus-roof hopping and crossing-guard
   timing." Glitchy has jumped into the school computers and the bells
   ring at random. The buses are parked all along the bus loop and
   Kinan is late: the fastest way to the door is over the bus roofs.
   Idea (ONE): BUS ROOFS. Hop from roof to roof. Act 1 is safe (fall
   between two buses and you just climb back up); act 2 parks the
   buses beside the road works, so a miss is a pit; act 3 asks for
   running jumps (4 and 5 wide) between roofs.
   Timing: the crosswalks. Two lanes between curbs, each with a kid
   who will not stop: a raccoon scurrying back and forth, then a
   biker who yells "!" and charges. Wait for the gap, or stomp.
   Acts (thirds): 0-62 teach (the stop, the first buses, a 2-wide
   hole) · 63-125 twist (the broken-down bus, crosswalk 1, the road
   works 3 and 4 wide, crosswalk 2) · 126-188 test (the billboard,
   holes 4 and 5 between roofs, then the double-decker and the doors).
   Signature set-piece: THE ROAD WORKS (S4), three buses parked over
   a trench, a traffic cone patrolling the middle roof.
   Secrets: visible = the billboard over the tall bus: jump up through
   it from the roof (heart + candles, 125,4) · hidden = UNDER THE
   BROKEN-DOWN BUS: drop off its back, crawl under it to the front
   wheel and bump the glinting chassis (GOLDEN CANDLE, 58,10) · skill
   = the double-decker is up on jacks (the street runs under it): hop
   onto the bus-shelter roof, up to the double-decker's roof, then a
   RUNNING jump to the school sign (hat, 177,4).
   All three secrets and the goal were reached by script, hop by hop.
   Look: borrows the school-front look (theme 58: the school and its
   playground behind, dark asphalt, red curbs, yellow bricks). The
   buses are yellow toy bricks on a dark chassis, so toyBricks keeps
   them whole when Kinan bumps around under them.
   Bubble beats for ER-4 (not wired): c2 "Kinan! The bus is HERE.
   Wait. Why are all the buses parked?" · c58 "That bus has lost a
   wheel. Something is shining under there." · c109 checkpoint "The
   bell just rang. Then it rang again. And again. Glitchy!" · c185
   "Made it. Barely."
   ENGINE REQUESTS: a crossing guard with a STOP sign who stops the
   lanes on a beat; a school-bus prop skin (windows, wheels); bells.
   ============================================================ */
KinanLevels.register({
  id: '2-1', world: 2, slot: 1, kind: 'level',
  name: 'THE BUS STOP',
  theme: 58,                /* the school-front look: school + playground behind, asphalt, red curbs, yellow bricks */
  toyBricks: true,          /* the buses are yellow bricks: they never break */
  cols: 189,
  heights: [
    /* S1 0-26 the bus stop, the bench, bus 1 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 bus 2 · a lane · the short bus · first hole c46-47 · bus 4 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null, 192,192,192,192,192,192,
    /* S3 54-80 the broken-down bus (4 high) · crosswalk 1 (curbs c68, c77) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 THE ROAD WORKS: holes c88-90 and c97-100 between three buses */
    192,192,192,192,192,192,192, null,null,null, 192,192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192,
    /* S5 108-134 the checkpoint · crosswalk 2 (curbs c112, c121) · the tall bus and the billboard */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 the bus loop: holes c141-144 (4) and c151-155 (5) between roofs */
    192,192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192, null,null,null,null,null, 192,192,192,192,192,192,
    /* S7 162-188 reward: the bus shelter, the double-decker up on jacks, the school sign, the doors */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [6, 11, 7, 11],                       /* the bus-stop bench: the first hop */
    [10, 11, 16, 11], [28, 11, 34, 11], [39, 11, 45, 11], [48, 11, 53, 11],   /* bus chassis (dark) under the yellow bodies */
    [57, 10, 65, 10], [57, 11, 57, 11],   /* the broken-down bus: chassis + its one front wheel; a crawl space under it, open at the back */
    [68, 11, 68, 11], [77, 11, 77, 11],   /* crosswalk 1 curbs */
    [81, 11, 87, 11], [91, 11, 96, 11], [101, 11, 106, 11],   /* the road-works buses */
    [112, 11, 112, 11], [121, 11, 121, 11], [122, 10, 122, 11],   /* crosswalk 2 curbs + a step up to the tall bus */
    [123, 10, 127, 11],                   /* the tall bus's chassis */
    [135, 11, 140, 11], [145, 11, 150, 11], [156, 11, 161, 11],   /* the bus-loop buses */
    [168, 10, 171, 10]                    /* the double-decker's chassis: it is up on jacks, duck under it */
  ],
  tiles: {
    gift: [[13, 6, 'popper'], [58, 10, 'gold'], [61, 4, 'candle'], [93, 5, 'candle'], [138, 5, 'heart']],
    brick: [
      /* bus 1 */ [10, 9], [11, 9], [12, 9], [13, 9], [14, 9], [15, 9], [16, 9], [10, 10], [11, 10], [12, 10], [13, 10], [14, 10], [15, 10], [16, 10],
      /* bus 2 */ [28, 9], [29, 9], [30, 9], [31, 9], [32, 9], [33, 9], [34, 9], [28, 10], [29, 10], [30, 10], [31, 10], [32, 10], [33, 10], [34, 10],
      /* the short bus */ [39, 10], [40, 10], [41, 10], [42, 10], [43, 10], [44, 10], [45, 10],
      /* bus 4 */ [48, 9], [49, 9], [50, 9], [51, 9], [52, 9], [53, 9], [48, 10], [49, 10], [50, 10], [51, 10], [52, 10], [53, 10],
      /* the broken-down bus */ [57, 8], [58, 8], [59, 8], [60, 8], [61, 8], [62, 8], [63, 8], [64, 8], [65, 8],
                                [57, 9], [58, 9], [59, 9], [60, 9], [61, 9], [62, 9], [63, 9], [64, 9], [65, 9],
      /* road works 1 */ [81, 9], [82, 9], [83, 9], [84, 9], [85, 9], [86, 9], [87, 9], [81, 10], [82, 10], [83, 10], [84, 10], [85, 10], [86, 10], [87, 10],
      /* road works 2 */ [91, 9], [92, 9], [93, 9], [94, 9], [95, 9], [96, 9], [91, 10], [92, 10], [93, 10], [94, 10], [95, 10], [96, 10],
      /* road works 3 (short) */ [101, 10], [102, 10], [103, 10], [104, 10], [105, 10], [106, 10],
      /* the tall bus */ [123, 8], [124, 8], [125, 8], [126, 8], [127, 8], [123, 9], [124, 9], [125, 9], [126, 9], [127, 9],
      /* loop 1 */ [135, 9], [136, 9], [137, 9], [138, 9], [139, 9], [140, 9], [135, 10], [136, 10], [137, 10], [138, 10], [139, 10], [140, 10],
      /* loop 2 */ [145, 9], [146, 9], [147, 9], [148, 9], [149, 9], [150, 9], [145, 10], [146, 10], [147, 10], [148, 10], [149, 10], [150, 10],
      /* loop 3 (short) */ [156, 10], [157, 10], [158, 10], [159, 10], [160, 10], [161, 10],
      /* the double-decker */ [168, 7], [169, 7], [170, 7], [171, 7], [168, 8], [169, 8], [170, 8], [171, 8], [168, 9], [169, 9], [170, 9], [171, 9]
    ],
    shelf: [[124, 5], [125, 5], [126, 5],                  /* the billboard, over the tall bus's roof: jump up through it */
            [164, 9], [165, 9], [166, 9],                  /* the bus-shelter roof: the step up to the double-decker */
            [176, 5], [177, 5], [178, 5]]                  /* the school sign */
  },
  /* cones walk, the hop-cone hops at you, the raccoon scurries, the biker charges, the magpie only steals a candle */
  foes: [[22, 11, 'cone'],
         [36, 11, 'cone'],                                 /* boxed in the lane between bus 2 and the short bus */
         [72, 11, 'raccoon'],                              /* crosswalk 1: back and forth between the curbs */
         [79, 11, 'hopcone'], [93, 8, 'cone'],             /* the road works: a cone patrols the middle roof */
         [116, 11, 'biker'],                               /* crosswalk 2: "!" then a charge */
         [137, 8, 'cone'], [153, 4, 'magpie'],
         [182, 11, 'cone']],
  candles: [[3, 11], [4, 11], [6, 10], [7, 10], [11, 8], [12, 8], [14, 8], [15, 8],
            [35, 7], [36, 6], [37, 6], [38, 7], [41, 9], [43, 9], [46, 7], [47, 7],
            [54, 11], [55, 11], [56, 11], [59, 7], [63, 7], [60, 11], [61, 11], [62, 11], [63, 11],
            [70, 11], [74, 11], [75, 11],
            [88, 7], [89, 6], [90, 7], [97, 7], [98, 6], [99, 6], [100, 7], [103, 9], [104, 9],
            [110, 11], [114, 11], [118, 11], [119, 11], [123, 7], [127, 7], [124, 6], [126, 6],
            [141, 7], [142, 6], [143, 6], [144, 7], [151, 7], [152, 6], [153, 6], [154, 6], [155, 7],
            [165, 8], [166, 8], [169, 6], [170, 6], [173, 5], [174, 4], [175, 4], [165, 11], [166, 11], [169, 11], [170, 11], [184, 11], [185, 11]],
  secrets: [
    { kind: 'visible', col: 125, row: 4, prize: 'heart+candles' },                 /* the billboard over the tall bus */
    { kind: 'hidden', col: 58, row: 10, prize: 'GOLDEN CANDLE', glint240: true },  /* under the broken-down bus, at its front wheel */
    { kind: 'skill', col: 177, row: 4, prize: 'hat' }                              /* shelter roof, double-decker roof, then a RUNNING jump to the school sign */
  ],
  goldenCandle: { col: 58, row: 10 },
  checkpoint: { col: 109, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 185, row: 11 }             /* the school doors */
});

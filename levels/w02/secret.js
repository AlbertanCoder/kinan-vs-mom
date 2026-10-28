/* ============================================================
   SECRET · LOST AND FOUND  (World 2 · School · trail stop 9)
   Story bible (World 2 table): "A maze of forgotten mittens and toys."
   Memory (age 2): the Whirl Spinner waits in the lost and found.
   Reached by 2-7's secret exit (crawl into the big monitor). A REWARD
   level: short, candle-rich, five slow foes, small soft gaps.
   Idea: THREE LANES. The lost-and-found room is a maze of boxes in
     three lanes that cross: the FLOOR lane runs through tunnels under the
     box tops, the BOX lane runs along their tops, and the MITTEN-SHELF
     lane runs high near the ceiling. Springs (bouncy balls) throw you up
     a lane; every lane is full of candles and every lane goes forward.
   Route: S1 the bin (an umbrella on the first box, a bouncy ball up to
     the mitten shelves) · S2 the shelves drop to a long box (a lasso:
     candles fly to you), 2- and 3-pits on the floor lane · S3 THE TOY
     PILE: a hill of toys with breakable toy bricks and a CAKE on top
     (sugar rush) · S4 the spring maze: a bouncy ball up to a long shelf
     over the 4-pit, a hard hat · S5 the checkpoint, the box hill and its
     candle slide, a 3-pit · S6 the Whirl Spinner's shelf: a gift row, a
     last bouncy ball, a candle shower and the door out.
   Gaps: act 1 2/3 · act 2 4 (a shelf lane above it) · act 3 3.
   Secret slot: exempt from the 3-secrets lint (docs/LEVEL-AUTHORING.md
     §5.5). The level itself is the reward.
   ENGINE REQUESTS: the age-2 memory gift (the Whirl Spinner) as a
     pickup at c156 (today a heart gift marks the spot) · a 'mitten'
     walker skin ('sock' stands in) and a bouncy-ball skin for the
     springs · bubbles ER-4 (c2 "The lost and found! Whoa, it's HUGE in
     here." · c150 "Wait... that's MY Whirl Spinner! From when I was
     two!").
   ============================================================ */
KinanLevels.register({
  id: '2-secret', world: 2, slot: 9, kind: 'secret',
  name: 'LOST AND FOUND',
  theme: 57,                /* borrows the toy-brick bin look: bright sky, big toy bricks, studded ground */
  cols: 162,
  heights: [
    /* S1 0-26 the bin: the first box (a tunnel under it) · a bouncy ball up to the mitten shelves */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 2-pit c30-31 · a long box c35-41 (tunnel under it) · 3-pit c48-50 */
    192,192,192, null,null, 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null, 192,192,192,
    /* S3 54-80 THE TOY PILE (MESA c58-73) */
    192,192,192,192, 184,176,168,160,152,144, 144,144,144,144,144,144,144, 160,176,192, 192,192,192,192,192,192,192,
    /* S4 81-107 the spring maze: a shelf lane over the 4-pit c92-95 */
    192,192,192,192,192,192,192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 checkpoint · the box hill (c114-129) and its candle slide · 3-pit c131-133 */
    192,192,192,192,192,192, 184,176,168,160,152,144, 144,144,144,144, 152,160,168,176,184,192, 192, null,null,null, 192,
    /* S6 135-161 the Whirl Spinner's shelf, a candle shower, the door out */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [8, 9, 14, 9],                        /* S1 the first box: run through the tunnel under it, or hop on top */
    [35, 9, 41, 9]                        /* S2 the long box */
  ],
  tiles: {
    gift: [[11, 6, 'umbrella'], [38, 6, 'lasso'], [67, 5, 'cake'], [102, 8, 'hat'], [121, 6, 'heart'],
           [140, 8], [142, 8], [144, 8], [156, 8, 'heart']],
    brick: [[65, 5], [66, 5], [68, 5], [69, 5], [141, 8], [143, 8]],   /* toy bricks: bonk them */
    spring: [[18, 12], [85, 12], [148, 12]],      /* bouncy balls */
    shelf: [[20, 5], [21, 5], [22, 5], [23, 5], [24, 5], [25, 5], [26, 5], [27, 5], [28, 5], [29, 5], [30, 5], [31, 5], [32, 5], [33, 5],   /* the mitten shelves */
            [88, 5], [89, 5], [90, 5], [91, 5], [92, 5], [93, 5], [94, 5], [95, 5], [96, 5], [97, 5], [98, 5], [99, 5],   /* S4 the shelf lane over the 4-pit */
            [151, 5], [152, 5], [153, 5], [154, 5]]       /* S6 the Whirl Spinner's shelf */
  },
  foes: [[23, 11, 'sock'], [44, 11, 'teddy'], [77, 11, 'ball'], [105, 11, 'sock'], [122, 8, 'teddy']],
  candles: [[3, 11], [4, 11], [5, 11], [9, 11], [10, 11], [11, 11], [12, 11], [13, 11], [9, 8], [10, 8], [12, 8], [13, 8],
            [18, 9], [19, 7], [20, 4], [22, 4], [24, 4], [26, 4], [28, 4], [30, 4], [32, 4],
            [29, 10], [30, 9], [31, 9], [32, 10], [36, 11], [37, 11], [38, 11], [39, 11], [40, 11], [36, 8], [40, 8],
            [47, 10], [48, 9], [49, 8], [50, 9], [51, 10],
            [60, 9], [62, 8], [65, 4], [66, 4], [67, 4], [68, 4], [69, 4], [64, 8], [70, 8], [72, 9],
            [78, 11], [79, 11], [85, 9], [86, 7], [88, 4], [90, 4], [92, 4], [94, 4], [96, 4], [98, 4],
            [91, 10], [92, 9], [93, 8], [94, 8], [95, 9], [96, 10], [100, 11], [101, 11],
            [115, 10], [117, 9], [119, 8], [120, 8], [122, 7], [123, 8], [124, 8], [126, 9], [128, 10],
            [130, 10], [131, 9], [132, 8], [133, 9], [134, 10],
            [138, 11], [139, 11], [140, 7], [142, 7], [144, 7], [148, 9], [148, 7], [151, 4], [152, 4], [153, 4], [154, 4],
            [146, 11], [147, 11], [150, 11], [151, 11], [152, 11], [153, 11], [154, 11], [155, 11], [157, 11]],
  checkpoint: { col: 110, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 159, row: 11 }
});

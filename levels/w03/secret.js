/* ============================================================
   SECRET · ATHABASCA RIVER RUN  (World 3 · Robin's oilfield · trail stop 9)
   Story bible (World 3 table): "Raft down the river." Reached by 3-8's
   secret exit: the old mine shaft runs down and comes out in a little
   cave on the bank of the Athabasca River. The river runs north past
   Fort McMurray, wide and brown and fast, with spruce on both banks.
   A REWARD level: short, candle-rich, six slow foes, soft gaps.
   Idea: RAFTS AND ROCKS. Rafts and logs float flush on the water (run
     right across them), some logs bob a hop higher, and bouncy rocks in
     the rapids throw you up into candle arcs. The river drops as it
     goes: the rapids, the log jam, then the Grand Rapids (a falls you
     jump off: hold the UMBRELLA from the cave to float down).
   Route: S1 the shaft cave (an UMBRELLA), the first raft, a bobbing
     log · S2 THE RAPIDS: down the bank to a bouncy rock in white water
     (a big candle arc), down again to a raft · S3 THE LOG JAM: logs at
     two heights, a LASSO (candles fly to you), a two-wide bouncy rock
     · S4 THE GRAND RAPIDS: jump off the falls, three tiles down (the
     checkpoint below) · S5 THE SANDBAR: a raft in a 5-wide channel, a
     CAKE (sugar rush), a bouncy rock in a 5-wide channel · S6 the
     river park: a gift row, a candle shower and the way out.
   Gaps: act 1 3/3/3/3 (rafts, logs, a rock) · act 2 4/4/4 (the falls)
     · act 3 5/5 (each with a raft or a rock in it).
   Secret slot: exempt from the 3-secrets lint (docs/LEVEL-AUTHORING.md
     §5.5). The level itself is the reward.
   Look: borrows the river valley at sunset (theme 28): a wide river
     behind, trees on the banks.
   ENGINE REQUESTS: rideable rafts that drift downstream with Kinan on
     them (today flush shelves) · river water drawn in the pits and a
     current that pushes right · a raft and log skin for shelves and a
     white-water rock skin for the spring · bubbles ER-4 (c2 "Where
     does this shaft... WHOA. The river!" · c84 "The Grand Rapids! Hold
     on to that umbrella!" · c156 "Fort McMurray! Dad's going to be SO
     confused.").
   ============================================================ */
KinanLevels.register({
  id: '3-secret', world: 3, slot: 9, kind: 'secret',
  name: 'ATHABASCA RIVER RUN',
  theme: 28,                /* borrows the river valley at sunset: a wide river behind, trees on the banks */
  cols: 162,
  heights: [
    /* S1 0-26 the shaft cave on the high bank · the first raft (water c8-10) · a bobbing log (water c16-18) */
    112,112,112,112,112,112,112,112,null,null,null,112,112,112,112,112,null,null,null,112,112,112,112,112,112,112,112,
    /* S2 27-53 THE RAPIDS: down the bank (c30-31), a bouncy rock in the white water c32-34, down again (c39-40), a raft (water c45-47) */
    112,112,112,120,128,null,null,null,128,128,128,128,136,144,144,144,144,144,null,null,null,144,144,144,144,144,144,
    /* S3 54-80 THE LOG JAM (water c58-61) · a bouncy rock (water c66-69) */
    144,144,144,144,null,null,null,null,144,144,144,144,null,null,null,null,144,144,144,144,144,144,144,144,144,144,144,
    /* S4 81-107 THE GRAND RAPIDS: jump off the falls (c85-88), three tiles down · checkpoint */
    144,144,144,144,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 THE SANDBAR: a raft in a 5-wide channel (c113-117) · a bouncy rock in a 5-wide channel (c124-128) */
    192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,
    /* S6 135-161 the river park: a gift row, a candle shower, the way out */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [0, 2, 4, 3],                         /* the rock roof over the shaft cave */
    [99, 9, 105, 9], [99, 7, 102, 7], [99, 8, 99, 8]   /* taekwondo (2026-10-28): a rock ledge over the sandbar (walk under it); its board door faces right */
  ],
  tiles: {
    gift: [[6, 3, 'umbrella'], [24, 3], [63, 6, 'lasso'], [96, 8, 'heart'], [120, 8, 'cake'],
           [140, 8], [142, 8], [144, 8], [146, 8, 'heart']],
    brick: [[141, 8], [143, 8], [145, 8]],
    spring: [[33, 8], [34, 8],            /* a bouncy rock in the rapids */
             [67, 9], [68, 9],            /* a two-wide bouncy rock below the log jam */
             [126, 12]],                  /* a bouncy rock in the sandbar channel */
    shelf: [[8, 7], [9, 7], [10, 7],      /* the first raft, flush on the water: run across */
            [16, 6], [17, 6], [18, 6],    /* a log bobbing a hop higher */
            [45, 9], [46, 9], [47, 9],    /* a raft below the rapids */
            [58, 9], [59, 9], [60, 8], [61, 8],   /* THE LOG JAM: low logs, then higher ones */
            [114, 12], [115, 12], [116, 12]],     /* a raft in the sandbar channel */
    board: [[102, 8]]                     /* BONUS: hop onto the rock ledge from the right and KICK the board: 2 candles inside */
  },
  foes: [[22, 3, 'goose'], [50, 8, 'flyingfish'], [74, 4, 'goose'], [101, 6, 'goose'], [121, 11, 'flyingfish'], [151, 11, 'puddlefrog']],
  candles: [[3, 6], [4, 6], [7, 5], [8, 6], [9, 6], [10, 6], [13, 6], [14, 6], [16, 5], [17, 5], [18, 5], [21, 6], [22, 6], [24, 2],
            [29, 6], [31, 7], [32, 6], [33, 5], [33, 3], [34, 1], [35, 0], [36, 0], [37, 0], [38, 1], [39, 2], [40, 4], [41, 6], [42, 7],
            [45, 8], [46, 7], [47, 8], [51, 8], [52, 8],
            [56, 8], [57, 8], [58, 8], [59, 8], [60, 7], [61, 7], [63, 5], [64, 8],
            [67, 8], [67, 6], [68, 4], [69, 2], [70, 1], [71, 1], [72, 1], [73, 2], [74, 4], [75, 6], [77, 8], [78, 8],
            [83, 8], [84, 7], [85, 7], [86, 8], [87, 9], [88, 10], [89, 11], [86, 11], [86, 10], [87, 11],
            [93, 11], [94, 11], [95, 11], [97, 11], [98, 11], [104, 11], [105, 11],
            [111, 10], [112, 9], [113, 8], [114, 11], [115, 11], [116, 11], [117, 8], [118, 9], [119, 10],
            [123, 10], [124, 9], [125, 8], [126, 10], [126, 7], [127, 5], [128, 4], [129, 4], [130, 5], [131, 7], [132, 9],
            [138, 11], [139, 11], [140, 7], [142, 7], [144, 7], [146, 7], [148, 11], [149, 11], [150, 10], [152, 10],
            [153, 9], [154, 9], [155, 10], [156, 11], [157, 11], [158, 11], [155, 6], [156, 5], [157, 6],
            [100, 8], [101, 8]],                  /* behind the rock ledge's board */
  checkpoint: { col: 92, row: 11 },
  spawn: { col: 2, row: 6 },
  goal: { col: 159, row: 11 }
});

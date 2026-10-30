/* ============================================================
   SECRET · THE ISLAND LIGHTHOUSE  (World 8 · Toronto · trail stop 8)
   Story bible (World 8 table): "Climb the old lighthouse. A reward
   level." Through the door under the glinting stone in 8-6, Kinan comes
   out inside the old lighthouse at the island's point, the oldest on
   the lake. Its stairs wind all the way up to the lamp, and from the
   gallery at the top you can see the whole city across the water.
   Idea: A REWARD, and A VERTICAL CLIMB. The lighthouse is a stack of
     stone landings, each two tiles above the last (S2): five jumps up
     to the lamp gallery ten tiles over the beach, with a candle on
     every step; then down the far side and along the island's beaches,
     candles everywhere, small gaps, few foes.
   Route: S1 the keeper's path 2 · S2-S3 THE LIGHTHOUSE: up five
     landings (c30, c34, c38, c42, c46) to THE LAMP GALLERY (c46-56,
     row 2), down four on the far side · S4 the beach 3, the checkpoint
     · S5 4 · S6 4 · S7 the gift row and the ferry dock home.
   Gaps: act 1 2 · act 2 3/4 · act 3 4, each with a candle arc. A
     full-run jump off the gallery lands on the landings below (no gap
     within 15 tiles of it). Secret slot: exempt from the 3-secrets lint
     (the whole level is the secret). No pet.
   Raccoons (World 8, snatch): a raccoon grabs a candle and runs.
   Look: the Islands at Sunset (theme 108, World 8's own look): the
     lake at sunset with the sun's path on the water, the skyline and
     the CN Tower lit up across it, the ferry, sailboats, the island's
     trees.
   ENGINE REQUESTS: a lighthouse skin for the stone landings (white
     stone, the red lamp room at the top, its beam sweeping at night).
   ============================================================ */
KinanLevels.register({
  id: '8-secret', world: 8, slot: 8, kind: 'secret',
  name: 'THE ISLAND LIGHTHOUSE',
  theme: 108,   /* the Islands at Sunset: the lake, the skyline across the water */
  cols: 189,
  snatch: true,   /* World 8: raccoons grab a candle and run */
  heights: [
    /* S1 0-26 the keeper's path: a 2-wide gap c12-13 */
    192,192,192,192,192,192,192,192,192,192,192,192,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 THE LIGHTHOUSE (solid landings c30-72): up to THE LAMP GALLERY (c46-56, row 2) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 down the far side (c57-72), the beach */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 the beach: a 3-wide gap c88-90, the checkpoint */
    192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 a 4-wide gap c115-118 */
    192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 a 4-wide gap c146-149 */
    192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 reward: the gift row, the ferry dock home */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [30, 10, 72, 11],   /* the first landing (two tiles up) and the last one on the far side */
    [34, 8, 68, 9],   /* the second */
    [38, 6, 64, 7],   /* the third */
    [42, 4, 60, 5],   /* the fourth */
    [46, 2, 56, 3]   /* THE LAMP GALLERY at the top (ten tiles over the beach) */
  ],
  tiles: {
    gift: [
      [6, 8],   /* S1 */
      [39, 2],   /* S2 over the third landing */
      [96, 8],   /* S4 */
      [124, 8],   /* S5 */
      [155, 8],   /* S6 */
      [168, 8, 'heart'], [170, 8], [172, 8, 'cake']   /* S7 the gift row */
    ],
    brick: [
      [5, 8], [7, 8],   /* S1 */
      [169, 8], [171, 8]   /* S7 */
    ]
  },
  foes: [
    [20, 7, 'seagull'],   /* S1 */
    [76, 8, 'goose'],   /* S3 */
    [100, 11, 'raccoon'],   /* S4 */
    [128, 7, 'seagull'],   /* S5 */
    [140, 11, 'raccoon'], [158, 7, 'seagull']   /* S6 */
  ],
  candles: [
    [3, 10], [9, 10], [11, 10], [12, 9], [13, 9], [14, 10], [16, 10], [18, 10], [20, 10], [22, 10], [24, 10], [26, 10], [28, 10],
    [30, 9], [31, 9], [32, 9], [33, 9], [34, 7], [35, 7], [36, 7], [37, 7], [38, 5], [39, 5], [40, 5], [41, 5], [42, 3], [43, 3], [44, 3], [45, 3],
    [46, 1], [47, 1], [48, 1], [49, 1], [50, 1], [51, 1], [52, 1], [53, 1], [54, 1], [55, 1], [56, 1],
    [57, 3], [58, 3], [59, 3], [60, 3], [61, 5], [62, 5], [63, 5], [64, 5], [65, 7], [66, 7], [67, 7], [68, 7], [69, 9], [70, 9], [71, 9], [72, 9],
    [74, 11], [76, 11], [78, 11], [80, 11],
    [82, 11], [84, 11], [86, 11], [87, 10], [88, 9], [89, 9], [90, 9], [91, 10], [93, 11], [96, 10], [99, 11], [101, 11], [103, 11], [105, 11], [107, 11],
    [109, 11], [111, 11], [113, 11], [114, 10], [115, 9], [116, 8], [117, 8], [118, 9], [119, 10], [121, 11], [124, 10], [127, 11], [129, 11], [131, 11], [133, 11],
    [136, 11], [138, 11], [142, 11], [144, 11], [145, 10], [146, 9], [147, 8], [148, 8], [149, 9], [150, 10], [152, 11], [155, 10], [157, 11], [160, 11],
    [163, 11], [165, 11], [168, 10], [170, 10], [172, 10], [175, 11], [177, 11], [179, 11], [181, 11]
  ],
  checkpoint: { col: 95, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 184, row: 11 },   /* the ferry dock home */
  talk: [
    [2, 'KINAN', 'A secret door into the old lighthouse! The oldest one on the whole lake.', 3.6],
    [29, 'CHENOA', 'The stairs go all the way up to the lamp. Race you to the top, little bro!', 3.6],
    [47, 'DAD', 'Look at that view, bud: the city, the CN Tower, the lake. No wonder this lighthouse is beaming.', 4],
    [100, 'SHAD', 'Candles everywhere down here! The lighthouse keeper must have loved birthdays.', 3.8],
    [165, 'MOM', 'Back to the ferry, sweetie. That raccoon is still out there with Glitchy.', 3.6]
  ]
});

/* ============================================================
   LEVEL 8-6 · FERRY TO THE ISLANDS
   (World 8 · Toronto · trail stop 7)
   Story bible (World 8 table): "Ferry decks, then the Island beaches.
   Secret exit at the lighthouse, leading to 8-secret." The raccoon
   sneaks onto the ferry across the harbour to the Toronto Islands with
   Glitchy's parcel. Kinan rides the ferry's decks, crosses the island's
   lagoons and beaches, and passes the old lighthouse at the point
   (the oldest lighthouse on the lake).
   Idea (ONE): THE BOATS. Little boats bob and drift back and forth in
     every water gap (World 7's boats): step onto one and it carries you
     across. Every gap is jumpable without them (a boat makes it easy).
     Act 1 teaches it (the harbour: 3-wide gaps with a slow boat each, the
     ferry's two decks); act 2 twists it (the lagoons: 4-wide gaps,
     faster boats); act 3 tests it (5-wide gaps on the beach and at the
     point, the fastest boats).
   Acts (thirds): 0-89 teach (the docks 3, THE FERRY and THE WHEELHOUSE
     ROOF, off the ferry 3) · 90-179 twist (Centre Island 4, the
     lagoons 4/4, the checkpoint 4, the dunes) · 180-269 test (5, THE
     LIFEGUARD CHAIR, 5 at the point, THE OLD LIGHTHOUSE, the dock home).
   Signature set-piece: THE FERRY (S1-S3): a lower deck to run along, an
     upper deck to jump up to, the wheelhouse on top.
   Secrets: visible = THE WHEELHOUSE ROOF (S2): a heart sits on top of
     the ferry's wheelhouse; jump up to the upper deck, then onto the
     roof (heart + candles, 42,4) · hidden = THE OLD LIGHTHOUSE (S9):
     the path runs under the lighthouse's arch; one stone in the arch
     glints. Jump under it: the GOLDEN CANDLE pops and a door opens in
     the floor below it — walk in for the SECRET EXIT to 8-secret, the
     Island Lighthouse (the 7-fort / 6-7 / 1-7 pattern). Walk on to
     carry on instead (235,9) · skill = THE LIFEGUARD CHAIR (S8): bounce
     off the beach spring and steer onto the lifeguard chair (hat,
     207,2).
   Gaps: act 1 3/3 · act 2 4/4/4/4 · act 3 5/5. Every gap has a candle
     arc and a boat; nothing waits at a lip; the spring and the
     wheelhouse have runways after them (w8-levels.spec.ts checks a
     full-run jump off each lands on floor).
   Raccoons (World 8, snatch): a raccoon grabs a candle and runs.
   Look: the Toronto Islands (theme 104, World 8's own look): Lake
     Ontario, the skyline and the CN Tower across the water, another
     island ferry going by, sailboats, gulls, the Islands' grassy bank
     and trees.
   ENGINE REQUESTS: a ferry-hull skin (white hull, blue stripe,
     portholes) for the ferry's deck columns and the wheelhouse · a
     lighthouse skin (white stone, a red lamp room) for the lighthouse
     block, and the lake's water drawn in the gaps.
   ============================================================ */
KinanLevels.register({
  id: '8-6', world: 8, slot: 7, kind: 'level',
  name: 'FERRY TO THE ISLANDS',
  theme: 104,   /* the Toronto Islands: the lake, the skyline across the water, the ferry */
  cols: 270,
  snatch: true,   /* World 8: raccoons grab a candle and run */
  /* THE BOATS (World 7's boats): [c0, c1, row, width, speed] — a little boat that drifts back and forth between c0 and c1,
     its deck level with the floor (row 12); one in every water gap */
  boats: [[18, 20, 12, 2, 0.3], [61, 63, 12, 2, 0.3], [90, 93, 12, 2, 0.4], [113, 116, 12, 2, 0.45], [123, 126, 12, 2, 0.45],
    [141, 144, 12, 2, 0.5], [180, 184, 12, 2, 0.55], [223, 227, 12, 2, 0.6]],
  heights: [
    /* S1 0-26 the ferry docks: a 3-wide gap c18-20 (a boat), up onto THE FERRY's lower deck (176) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,176,176,176,176,176,176,
    /* S2 27-53 THE FERRY: the lower deck, the upper deck (shelves c30-50 row 8), THE WHEELHOUSE (c40-44) */
    176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,
    /* S3 54-80 the bow, a 3-wide gap c61-63 (a boat) onto the island dock */
    176,176,176,176,176,176,176,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 Centre Island: a 4-wide lagoon c90-93 (a boat) */
    192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 the lagoons: 4-wide c113-116 and c123-126 (a boat each) */
    192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,
    /* S6 135-161 a 4-wide lagoon c141-144 (a boat), the checkpoint */
    192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 the dunes (c166-174), a 5-wide gap c180-184 (a boat) */
    192,192,192,192,184,176,176,176,176,176,176,184,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,
    /* S8 189-215 the beach: THE LIFEGUARD CHAIR (spring c205, chair c206-208 row 3) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S9 216-242 a 5-wide gap c223-227 (a boat), THE OLD LIGHTHOUSE (c234-237): the path runs under its arch */
    192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S10 243-269 reward: the island's ferry dock, the gift row, the ferry home */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [40, 5, 44, 7],   /* S2 THE WHEELHOUSE, on the upper deck */
    [234, 1, 237, 9]   /* S9 THE OLD LIGHTHOUSE: the path runs under its arch (rows 10-11) */
  ],
  open: [[4, 13, 6, 13]],   /* SLAM SPOT (butt slam, 2026-10-29): the pocket under the cracked dock boards, solid floor under it */
  tiles: {
    crack: [[4, 12], [5, 12], [6, 12]],   /* SLAM SPOT: cracked dock boards over a pocket of candles (a bonus, never needed) */
    gift: [
      [5, 8],   /* S1 */
      [36, 5],   /* S2 over the upper deck */
      [72, 8],   /* S3 */
      [98, 8],   /* S4 */
      [120, 8],   /* S5 */
      [152, 8],   /* S6 */
      [170, 7],   /* S7 on the dunes */
      [196, 8],   /* S8 */
      [235, 9, 'gold'],   /* S9 THE OLD LIGHTHOUSE: the glinting stone in the arch (hidden; the secret exit) */
      [258, 8, 'heart'], [260, 8], [262, 8, 'cake']   /* S10 the gift row */
    ],
    brick: [
      [4, 8], [6, 8],   /* S1 */
      [97, 8], [99, 8],   /* S4 */
      [259, 8], [261, 8]   /* S10 */
    ],
    spring: [
      [205, 11]   /* S8 the beach spring (skill secret; 17 tiles of sand after it) */
    ],
    shelf: [
      [30, 8], [31, 8], [32, 8], [33, 8], [34, 8], [35, 8], [36, 8], [37, 8], [38, 8], [39, 8], [40, 8],
      [41, 8], [42, 8], [43, 8], [44, 8], [45, 8], [46, 8], [47, 8], [48, 8], [49, 8], [50, 8],   /* S2 the ferry's upper deck */
      [206, 3], [207, 3], [208, 3]   /* S8 THE LIFEGUARD CHAIR (skill secret) */
    ]
  },
  /* passengers, gulls and geese, bikes on the island paths, frogs at the lagoons, raccoons. Nothing waits at a lip. */
  foes: [
    [10, 11, 'mallwalker'],   /* S1 */
    [34, 10, 'raccoon'], [47, 5, 'seagull'],   /* S2 */
    [70, 8, 'goose'],   /* S3 */
    [85, 7, 'seagull'], [102, 11, 'biker'],   /* S4 */
    [119, 11, 'raccoon'], [130, 7, 'goose'],   /* S5 */
    [148, 7, 'seagull'], [156, 11, 'biker'],   /* S6 */
    [169, 10, 'raccoon'], [177, 11, 'puddlefrog'], [182, 7, 'seagull'],   /* S7 */
    [193, 11, 'biker'], [199, 11, 'raccoon'], [212, 7, 'goose'],   /* S8 */
    [218, 11, 'raccoon'], [225, 7, 'seagull'], [240, 11, 'puddlefrog'],   /* S9 */
    [250, 11, 'raccoon']   /* S10 */
  ],
  candles: [[4, 13], [5, 13], [6, 13],
    [3, 10], [8, 11], [11, 11], [14, 11], [16, 10], [17, 9], [18, 8], [19, 8], [20, 8], [21, 9], [23, 10], [25, 10],
    [27, 10], [29, 10], [31, 10], [33, 10], [35, 10], [37, 10], [39, 10], [41, 10], [43, 10], [45, 10], [47, 10], [49, 10], [51, 10], [53, 10],
    [31, 7], [33, 7], [35, 7], [37, 7], [46, 7], [48, 7], [50, 7],
    [55, 10], [57, 10], [59, 10], [60, 9], [61, 8], [62, 8], [63, 9], [64, 10], [66, 11], [68, 11], [72, 10], [75, 11], [78, 11], [80, 11],
    [82, 11], [84, 11], [86, 11], [88, 11], [89, 10], [90, 9], [91, 8], [92, 8], [93, 9], [94, 10], [96, 11], [98, 10], [101, 11], [104, 11], [106, 11],
    [108, 11], [110, 11], [112, 10], [113, 9], [114, 8], [115, 8], [116, 9], [117, 10], [120, 10], [122, 10], [123, 9], [124, 8], [125, 8], [126, 9], [127, 10], [129, 11], [131, 11], [133, 11],
    [136, 11], [138, 11], [140, 10], [141, 9], [142, 8], [143, 8], [144, 9], [145, 10], [147, 11], [150, 11], [152, 10], [155, 11], [158, 11], [160, 11],
    [163, 11], [165, 11], [166, 10], [167, 10], [169, 10], [171, 10], [173, 10], [174, 10], [176, 11], [178, 10], [179, 9], [180, 8], [181, 7], [182, 6], [183, 7], [184, 8], [185, 9], [187, 11],
    [190, 11], [192, 11], [195, 11], [196, 10], [198, 11], [201, 11], [203, 11], [205, 9], [205, 7], [207, 5], [210, 11], [213, 11], [215, 11],
    [217, 11], [219, 11], [221, 11], [222, 10], [223, 9], [224, 8], [225, 7], [226, 8], [227, 9], [228, 10], [230, 11], [232, 11], [235, 11], [235, 10], [237, 11], [239, 11], [241, 11],
    [244, 11], [246, 11], [248, 11], [252, 11], [254, 11], [256, 11], [258, 10], [260, 10], [262, 10], [264, 11]
  ],
  secrets: [
    { kind: 'visible', col: 42, row: 4, prize: 'heart+candles' },   /* THE WHEELHOUSE ROOF: up to the upper deck, then onto the roof */
    { kind: 'hidden', col: 235, row: 9, prize: 'GOLDEN CANDLE', glint240: true, exit: '8-secret' },   /* THE OLD LIGHTHOUSE: the glinting stone; a door opens below it */
    { kind: 'skill', col: 207, row: 2, prize: 'hat' }   /* THE LIFEGUARD CHAIR: the beach spring, then steer onto the chair */
  ],
  goldenCandle: { col: 235, row: 9 },
  checkpoint: { col: 150, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 266, row: 11 },   /* the ferry home */
  talk: [
    [2, 'DAD', 'All aboard the ferry to the Toronto Islands! The raccoon snuck on with Glitchy. Ferry sneaky.', 4],
    [22, 'CHENOA', 'Little bro! Jump up to the top deck. The view of the city is amazing!', 3.6],
    [58, 'KINAN', 'Little boats! They float back and forth. I can ride one across!', 3.2],
    [95, 'MOM', 'Centre Island! Sand, sun... and geese. So many geese, sweetie.', 3.4],
    [151, 'SHAD', 'The raccoon is heading for the old lighthouse at the end of the island.', 3.6],
    [229, 'KINAN', 'The old lighthouse! The oldest one on the whole lake. Something in that arch is glinting...', 4.2],
    [255, 'DAD', 'Back on the ferry, bud. Next stop: Kensington Market! That raccoon swam for it. Cheapskate.', 3.8]
  ]
});

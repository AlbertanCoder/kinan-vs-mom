/* ============================================================
   SECRET · THE MUTTART PYRAMIDS  (World 4 · Edmonton Homecoming · trail stop 9)
   Story bible (World 4 table): "A jungle inside the glass pyramids."
   Reached by 4-7's secret exit: the door under the Walterdale Bridge
   opens on a trail along the river bank, and across the water stand
   the four glass pyramids of the conservatory, each one a different
   climate. Glitchy blew a fuse in the misting system on his way past:
   it's raining indoors, the plants grew HUGE, and the frogs are loving
   it.
   A REWARD level: short, candle-rich, four slow foes, soft gaps.
   Idea: PYRAMIDS. The pyramids are the hills: steep glass sides (1:1:
     slow up, zoom down), a pointy top, a candle shower over each peak.
     Lily pads float flush in the ponds between them (run right across),
     and in the palm house the giant banana leaves (springs) bounce
     Kinan up to the canopy walkway.
   Route: S1 the river trail, an UMBRELLA, a lily pond, THE TROPICAL
     PYRAMID (5 tall) · S2 a lily pond, THE ARID PYRAMID (3 tall, flat
     top, a LASSO: candles fly to you) · S3 THE TEMPERATE PYRAMID, the
     tallest (6 tall), checkpoint · S4 THE FEATURE PYRAMID (2:1, a CAKE:
     sugar rush), a 4-wide pond · S5 THE PALM HOUSE: lily pads across a
     5-wide pond, banana leaves up to the canopy walkway · S6 the way
     out: a gift row and a candle shower.
   Gaps: 3 (lily pads) · 3 (lily pads) · 4 · 5 (lily pads). Nothing
     here is a test.
   Secret slot: exempt from the 3-secrets lint (docs/LEVEL-AUTHORING.md
     §5.5). The level itself is the reward.
   Look: borrows the Fern Jungle (theme 63): giant ferns and jungle
     green, the closest look to the conservatory's tropical pyramid.
   ENGINE REQUESTS: the glass pyramids drawn as glass (a see-through
     panel skin over the hill slopes) · indoor misting rain (a light
     rain flag for an authored level) · a lily-pad skin for flush shelves
     and a banana-leaf skin for springs · bubbles ER-4 (c2 "The
     PYRAMIDS! Shad, it's raining INSIDE." · c58 "This one's a forest.
     A forest. In a pyramid." · c158 "Glitchy blew the fuse. Of course
     he did.").
   ============================================================ */
KinanLevels.register({
  id: '4-secret', world: 4, slot: 9, kind: 'secret',
  name: 'THE MUTTART PYRAMIDS',
  theme: 63,                /* borrows the Fern Jungle: giant ferns, jungle green */
  cols: 162,
  heights: [
    /* S1 0-26 the river trail · a lily pond c8-10 · THE TROPICAL PYRAMID (c13-24) */
    192,192,192,192,192,192,192,192,null,null,null,192,192,176,160,144,128,112,112,112,128,144,160,176,192,192,192,
    /* S2 27-53 a lily pond c31-33 · THE ARID PYRAMID (c37-45, flat top) */
    192,192,192,192,null,null,null,192,192,192,176,160,144,144,144,160,176,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 THE TEMPERATE PYRAMID, the tallest (c57-70) · checkpoint */
    192,192,192,176,160,144,128,112,96,96,96,112,128,144,160,176,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 THE FEATURE PYRAMID (c85-96, 2:1) · a 4-wide pond c100-103 */
    192,192,192,192,184,176,168,160,160,160,160,168,176,184,192,192,192,192,192,null,null,null,null,192,192,192,192,
    /* S5 108-134 THE PALM HOUSE: lily pads across a 5-wide pond c115-119 · banana leaves up to the canopy walkway */
    192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 the way out: a gift row, a candle shower */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  tiles: {
    gift: [[5, 8, 'umbrella'], [40, 5, 'lasso'], [63, 2], [90, 6, 'cake'], [113, 8, 'heart'],
           [143, 8], [145, 8], [147, 8], [149, 8, 'heart']],
    brick: [[144, 8], [146, 8], [148, 8]],
    spring: [[124, 11], [125, 11]],       /* giant banana leaves */
    shelf: [[8, 12], [9, 12], [10, 12],   /* lily pads, flush on the pond: run across */
            [31, 12], [32, 12], [33, 12],
            [116, 12], [117, 12],         /* lily pads in the palm house pond (hop the open water) */
            [127, 3], [128, 3], [129, 3], [130, 3], [131, 3], [132, 3], [133, 3]]   /* the canopy walkway */
  },
  foes: [[47, 11, 'puddlefrog'], [78, 11, 'puddlefrog'], [106, 5, 'raincloud'], [154, 11, 'puddlefrog']],
  candles: [[3, 11], [4, 11], [5, 7], [8, 11], [9, 11], [10, 11],
            [14, 9], [15, 8], [16, 7], [17, 6], [18, 4], [18, 2], [19, 1], [17, 1], [19, 6], [20, 6], [21, 7], [22, 8], [23, 9],
            [29, 11], [30, 10], [31, 11], [32, 11], [33, 11], [34, 10],
            [38, 9], [39, 8], [40, 8], [41, 8], [42, 8], [39, 4], [40, 3], [41, 4], [43, 9], [44, 10], [49, 11], [50, 11],
            [58, 9], [59, 8], [60, 7], [61, 6], [62, 5], [63, 5], [64, 5], [62, 1], [63, 0], [64, 1], [65, 5], [66, 6], [67, 7], [68, 8], [69, 9],
            [72, 11], [73, 11], [75, 11],
            [86, 10], [87, 9], [88, 9], [89, 9], [90, 5], [91, 9], [92, 9], [93, 9],
            [99, 10], [100, 9], [101, 8], [102, 8], [103, 9], [104, 10],
            [111, 11], [112, 11], [113, 7], [115, 10], [116, 11], [117, 11], [118, 10], [119, 9], [120, 10],
            [123, 9], [124, 7], [125, 5], [126, 3], [127, 2], [128, 2], [129, 2], [130, 2], [131, 2], [132, 2], [133, 2], [134, 4], [135, 6],
            [138, 11], [139, 11], [143, 7], [145, 7], [147, 7], [149, 7],
            [151, 10], [152, 9], [153, 8], [154, 7], [155, 8], [156, 9], [157, 10], [153, 4], [154, 3], [155, 4]],
  checkpoint: { col: 74, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 158, row: 11 }
});

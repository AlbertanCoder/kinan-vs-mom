/* ============================================================
   LEVEL 4-1 · THE HIGHWAY INTO EDMONTON
   (World 4 · Edmonton Homecoming · trail stop 1)
   Story bible (World 4 table): "Traffic, overpasses and the skyline
   coming into view." Glitchy's trail leads back to Edmonton, the city
   Kinan grew up in. Dad drives in along the Yellowhead and hits the
   worst traffic jam in the history of traffic jams: the road crew has
   dug up the highway (Edmonton has two seasons: winter and road
   construction). The last bit is on foot, over the cars.
   Idea (ONE): THE JAM. The stopped cars, trucks and the city bus are
     stepping stones: car roofs are low, pickups are taller, the semi
     and the bus are the tallest, and you climb from one to the next.
     Act 1 teaches it on solid road (the road between the cars is safe,
     a pothole gremlin lives there), with the first flyover as a high
     road. Act 2 twists it: ROAD WORK, both lanes are dug up and each
     car sits on its own little island of road, so the roofs are the
     only way across; then the big semi and an overpass. Act 3 tests
     it: wider trenches (5/4/4) with magpies over them, then the city
     bus under the sign gantry with a magpie nest on top.
   Acts (81 cols each): teach 0-80 (the jam, the on-ramp BROW, the
     trench, THE FLYOVER, a 3-wide dig) · twist 81-161 (ROAD WORK
     islands 3/4/3, the checkpoint, THE SEMI and the sign over the dig,
     THE OVERPASS) · test 162-242 (the construction zone 5/4/4, the city
     bus under the sign gantry, the WELCOME TO EDMONTON sign).
   Signature set-piece: ROAD WORK (S4): every car on its own island of
     road, hop roof to roof.
   Secrets: visible = the green highway sign over the dig after the
     semi: run the tall trailer roof and jump for it, the dig is right
     below (heart + candles, 130,3) · hidden = the overpass glints: jump
     under it and bump the glinting spot (GOLDEN CANDLE, 151,7) · skill
     = THE MAGPIE NEST: a sign gantry stands over the city bus; from
     the bus roof, climb its two narrow rungs to the magpie nest on
     top, the highest point in the level (hat, 199,1).
   Look: the Highway into Edmonton look (theme 21): blue sky, the
     skyline far off, grey road, orange accents.
   Bubble beats for ER-4 (not wired): c2 Dad: "Welcome to Edmonton,
     bud. It has two seasons: winter and road construction." · c12 (the
     pothole) Kinan: "That pothole has a GREMLIN in it!" Dad: "Yeah.
     That's Edmonton." · c84 (road work) Dad: "They dug up BOTH lanes?
     Hop the roofs, I'll catch up." · c110 checkpoint, a trucker: "Been
     sitting here so long my coffee got cold. Twice." · c151 Kinan:
     "Why is the overpass sparkling?" · c228 the big green sign:
     "WELCOME TO EDMONTON". Dad's joke (World 4 joke book): "Why did the
     orange cone quit? It was tired of being taken for a ride."
   ENGINE REQUESTS: car, pickup, semi and city-bus props (solid blocks
     stand in) · traffic that creeps forward a bit at a time · a
     mattress-that-fell-off-a-truck skin for the spring · a road-crew
     flagger who says STOP and SLOW · Dad cameo with bubbles (ER-4) ·
     a Dad-joke pickup saved per level.
   ============================================================ */
KinanLevels.register({
  id: '4-1', world: 4, slot: 1, kind: 'level',
  name: 'THE HIGHWAY INTO EDMONTON',
  theme: 21,                /* the Highway into Edmonton look: blue sky, the skyline far off, grey road */
  cols: 243,
  heights: [
    /* S1 0-26 the jam starts: a car, a car, a pickup (the road between them is safe) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 the on-ramp BROW (c30-39) · a car parked at the trench c46-47 (2 wide) */
    192,192,192, 184,176, 176,176,176,176,176,176, 184,192, 192,192,192,192,192,192, null,null, 192,192,192,192,192,192,
    /* S3 54-80 a pickup, THE FLYOVER (c60-71, the high road) · the first dig c76-78 (3 wide) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null, 192,192,
    /* S4 81-107 ROAD WORK: dig c84-86 (3), island c87-90 + car, dig c91-94 (4), island c95-98 + pickup, dig c99-101 (3) */
    192,192,192, null,null,null, 192,192,192,192, null,null,null,null, 192,192,192,192, null,null,null, 192,192,192,192,192,192,
    /* S5 108-134 checkpoint · THE SEMI (c116-127) · the sign over the dig c128-131 (4 wide) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null,null, 192,192,192,
    /* S6 135-161 a dig c140-143 (4 wide) · THE OVERPASS (c148-153) · the barrier blocks */
    192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 THE CONSTRUCTION ZONE: island + car, dig c167-171 (5), island + pickup, dig c176-179 (4), island, dig c185-188 (4) */
    192,192,192,192,192, null,null,null,null,null, 192,192,192,192, null,null,null,null, 192,192,192,192,192, null,null,null,null,
    /* S8 189-215 THE CITY BUS (c193-200) under the sign gantry · the last dig c201-204 (4 wide) */
    192,192,192,192,192,192,192,192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192,192,192,192,192,
    /* S9 216-242 reward: the mattress, a MESA by the WELCOME TO EDMONTON sign, the skyline */
    192,192,192,192, 184,176,168,160, 160,160,160,160,160,160, 168,176,184,192, 192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [8, 10, 10, 11], [14, 10, 17, 11], [21, 9, 23, 11],   /* S1 the jam: a car, a car, a pickup */
    [43, 10, 45, 11],                                     /* S2 a car parked at the edge of the trench */
    [55, 9, 57, 11], [60, 7, 71, 7],                      /* S3 a pickup, THE FLYOVER (the high road; the low road runs under it) */
    [88, 10, 90, 11], [96, 9, 98, 11],                    /* S4 ROAD WORK: a car and a pickup, each on its own island */
    [114, 10, 115, 11], [116, 7, 124, 11], [125, 9, 127, 11],   /* S5 a car, THE SEMI's tall trailer and its cab (at the edge of the dig) */
    [148, 6, 153, 7],                                     /* S6 THE OVERPASS (a glinting spot in its underside) */
    [164, 10, 166, 11], [173, 9, 175, 11],                /* S7 a car and a pickup on their islands */
    [190, 10, 191, 11], [193, 8, 200, 11]                 /* S8 a car, THE CITY BUS */
  ],
  tiles: {
    gift: [[15, 6, 'candle'],                             /* S1 over the car roof */
           [35, 7, 'popper'],                             /* S2 in the barrier blocks on the on-ramp */
           [65, 3, 'candle'],                             /* S3 up on the flyover */
           [97, 5, 'candle'],                             /* S4 over the pickup */
           [119, 3, 'candle'],                            /* S5 over the semi */
           [151, 7, 'gold'], [156, 8, 'heart'],           /* S6 the glinting overpass · the barrier blocks */
           [174, 5, 'candle'],                            /* S7 over the pickup */
           [226, 6, 'cake']],                             /* S9 the welcome cake on the mesa */
    brick: [[33, 7], [34, 7], [36, 7],                    /* S2 orange-and-white road barrier blocks: they crash when bumped */
            [155, 8], [157, 8]],                          /* S6 more barrier blocks */
    spring: [[218, 11]],                                  /* S9 a mattress that fell off a pickup */
    shelf: [[128, 4], [129, 4], [130, 4], [131, 4], [132, 4],   /* S5 the green highway sign over the dig (visible secret): only the trailer roof is high enough */
            [195, 5], [196, 5], [198, 2], [199, 2]]             /* S8 the sign gantry's rungs over the bus, up to the magpie nest (skill secret) */
  },
  /* pothole gremlins pop out of the road, cones walk, hopping cones chase, magpies steal candles (stomp one to get it back), geese patrol */
  foes: [[12, 11, 'pothole'],
         [50, 11, 'cone'],
         [74, 11, 'cone'],
         [92, 5, 'magpie'], [105, 11, 'hopcone'],
         [121, 2, 'magpie'], [111, 11, 'cone'],
         [160, 11, 'pothole'], [150, 3, 'goose'],
         [169, 5, 'magpie'], [182, 11, 'pothole'], [177, 3, 'crow'],
         [186, 6, 'magpie'], [213, 11, 'hopcone'],
         [237, 7, 'goose']],
  candles: [[3, 11], [4, 11], [5, 11],
            [8, 9], [9, 9], [10, 9], [12, 8], [14, 9], [16, 9], [17, 9], [19, 8], [21, 8], [22, 8], [23, 8],
            [32, 10], [34, 10], [36, 10], [43, 9], [44, 9], [45, 9], [46, 7], [47, 7], [48, 8],
            [55, 8], [57, 8], [58, 7], [59, 6], [61, 6], [63, 6], [67, 6], [69, 6], [71, 6],
            [62, 11], [64, 11], [66, 11], [68, 11], [76, 9], [77, 8], [78, 9],
            [84, 9], [85, 8], [86, 9], [88, 9], [89, 9], [90, 9], [91, 8], [92, 7], [93, 7], [94, 8], [96, 8], [97, 8], [98, 8], [99, 7], [100, 7], [101, 8],
            [114, 9], [115, 9], [116, 6], [118, 6], [120, 6], [122, 6], [124, 6], [125, 5], [126, 4], [127, 3],
            [128, 7], [129, 6], [130, 6], [131, 7],
            [140, 9], [141, 8], [142, 8], [143, 9], [149, 11], [150, 11], [152, 11], [153, 11],
            [164, 9], [165, 9], [166, 9], [167, 8], [168, 7], [169, 7], [170, 7], [171, 8], [173, 8], [175, 8], [176, 7], [177, 6], [178, 6], [179, 7],
            [183, 10], [185, 9], [186, 8], [187, 8], [188, 9],
            [190, 9], [191, 9], [194, 7], [196, 7], [198, 7], [200, 7], [195, 4], [196, 4], [198, 1],
            [201, 6], [202, 5], [203, 5], [204, 6], [205, 7],
            [218, 8], [218, 5], [219, 3], [220, 3], [221, 4], [224, 9], [225, 9], [227, 9], [228, 9],
            [234, 11], [235, 11], [236, 11], [238, 11]],
  secrets: [
    { kind: 'visible', col: 130, row: 3, prize: 'heart+candles' },                  /* the green sign over the dig */
    { kind: 'hidden', col: 151, row: 7, prize: 'GOLDEN CANDLE', glint240: true },   /* the glinting spot under the overpass */
    { kind: 'skill', col: 199, row: 1, prize: 'hat' }                               /* the magpie nest on top of the sign gantry */
  ],
  goldenCandle: { col: 151, row: 7 },
  checkpoint: { col: 110, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 239, row: 11 }             /* the WELCOME TO EDMONTON sign: Dad's truck waits past it */
});

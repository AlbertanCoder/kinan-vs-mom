/* ============================================================
   LEVEL 4-2 · THE OLD NEIGHBOURHOOD
   (World 4 · Edmonton Homecoming · trail stop 2)
   Story bible (World 4 table): "Kinan's first home: snow forts and
   toboggan slopes." Kinan walks the streets he grew up on, past his
   old snow-fort hill, and remembers being little. It snowed all night:
   the plow left a ridge down the middle of the street, the jackrabbits
   are white, and the neighbourhood kids have built snow forts. Glitchy
   hid somewhere around the old toboggan hill, and something Kinan lost
   when he was four is waiting there too (Sporky, the googly-eyed
   craft spork: story only, see ENGINE REQUESTS).
   Privacy: no street names, no house numbers, no house at all. The
   level shows snowbanks, a back alley, a park hill and snow forts that
   could be in any Edmonton neighbourhood.
   Idea (ONE): HIGH GROUND. Every hill is a launch pad: jump from the
     top and the drop on the far side gives you extra air; jump from the
     bottom and you won't make it. Act 1 teaches it over soft gaps (a
     snowbank down to a lower yard, a slope into a ditch). Act 2 twists
     it: hilltop hops over the valleys, THE OLD SNOW FORT with a
     snowball kid on top, then THE TOBOGGAN HILL and the creek at the
     bottom of it. Act 3 tests it: a 5-wide valley you can only cross
     from the hilltop, then the back alley where a garage roof is the
     launch pad over a 5-wide hole.
   Acts (81 cols each): teach 0-80 (the plow ridge, a front-yard BROW,
     the snowbank drop, the park TERRACE and its slope) · twist 81-161
     (hilltop hops 4/3, the checkpoint, THE OLD SNOW FORT, THE TOBOGGAN
     HILL and the creek, 4 wide) · test 162-242 (the valley 5 wide, the
     back alley 4/5 with the garage roof, the toboggan BOWL at the end).
   Signature set-piece: THE TOBOGGAN HILL (S6): climb three terraces to
     the top of the park, slide down the long slope and jump the creek.
   Secrets: visible = the snow fort's lookout, a snowbank ledge over
     its front wall: stop on the fort roof (the snowball kid is up
     there too) and jump straight up to it (heart + candles, 125,4) ·
     hidden = the snow fort's secret tunnel: drop off the fort,
     turn round, crawl into the kid-sized tunnel in its back wall and
     walk into the glinting snow block at the end (GOLDEN CANDLE,
     119,11) · skill = the old poplar: its branch hangs over the
     terraces BEHIND the top of the toboggan hill: climb to the top,
     turn round and jump back up to it (hat, 143,2).
   Look: borrows the Mountain Top look (theme 45): snow on the ground,
     a pale winter sky. Per-world art comes later.
   Bubble beats for ER-4 (not wired): c2 Kinan: "This is my old street!
     I used to build snow forts here." · c12 (a white jackrabbit) Kinan:
     "The bunnies are WHITE here in winter." · c50 Grandma Hunter, on
     her walker by the snowbank: "Here, eat something warm. Look how
     tall you got!" (the heart gift is her bannock) · c110 checkpoint,
     Kinan: "That's the hill! The BIG one!" · c120 a neighbourhood kid
     on the snow fort: "Snowball fight! You're on the other team!" ·
     c148 the top of the toboggan hill, Kinan: "It looked SO much bigger
     when I was four." · c225 Kinan, finding Sporky: "Sporky! I lost
     you right here!" Dad's joke (World 4 joke book): "What do you call
     a snowman with a six-pack? An abdominal snowman."
   ENGINE REQUESTS: a memory-gift pickup (Sporky, age 4, story bible
     "The 11 memory gifts") · snowball skins for the 'neighbor'
     thrower's newspapers · a white-jackrabbit skin ('bunny' stands in)
     · a real winter look with snowbanks and Christmas lights (theme 45
     stands in) · toboggans: ride a sled down a slope (speed builds
     downhill) · Grandma Hunter cameo with her walker (ER-4).
   ============================================================ */
KinanLevels.register({
  id: '4-2', world: 4, slot: 2, kind: 'level',
  name: 'THE OLD NEIGHBOURHOOD',
  theme: 45,                /* borrows the Mountain Top look: snow on the ground, a pale winter sky */
  cols: 243,
  heights: [
    /* S1 0-26 the old street: the plow ridge (c8-10) · a front-yard snowbank BROW (c14-24) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192, 184,176,168,160, 160,160,160, 168,176,184,192, 192,192,
    /* S2 27-53 a snowbank (c29-36) · the drop down to the lower yard over a 3-wide ditch (c37-39) · Grandma's snow blocks */
    192,192, 184,176,168,160, 160,160,160,160, null,null,null, 176,176,176,176,176, 184,192, 192,192,192,192,192,192,192,
    /* S3 54-80 THE PARK TERRACE (c55-68, 1:1 steps) · the first toboggan slope (c69-76) · a 3-wide ditch (c77-79) */
    192, 176,160, 160,160,160, 144, 144,144,144, 128, 128,128,128,128, 136,144,152,160,168,176,184,192, null,null,null, 192,
    /* S4 81-107 HILLTOP HOPS: up to a hilltop, the valley c90-93 (4), a lower hill, up again, the valley c101-103 (3) */
    192,192, 184,176,168,160, 160,160,160, null,null,null,null, 176,176,176, 168,160, 160,160, null,null,null, 176,176,176,176,
    /* S5 108-134 checkpoint · THE OLD SNOW FORT (c116-126) with its secret tunnel (row 11, c120-126, the way in faces right) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 THE TOBOGGAN HILL: terraces up to the top (c147-149), the long slope down (c150-157), the creek c160-163 (4) */
    192,192, 176,160, 160,160, 144,128, 128,128, 112,96, 96,96,96, 104,112,120,128,136,144,152,160, 160,160, null,null,
    /* S7 162-188 the creek's far bank · THE VALLEY: a steep hill up to a long hilltop (c171-176), the valley c177-181 (5), a lower hilltop */
    null,null, 192,192,192,192, 176,160,144, 144,144,144,144,144,144, null,null,null,null,null, 176,176,176, 184,192, 192,192,
    /* S8 189-215 THE BACK ALLEY: a hole c192-195 (4), a snowbank, the garage (c202-204), a hole c205-209 (5) */
    192,192,192, null,null,null,null, 176,176,176,176, 184,192, 192,192,192, null,null,null,null,null, 192,192,192,192,192,192,
    /* S9 216-242 reward: the toboggan BOWL (c220-231) with a snowbank trampoline, then the end of the park */
    192,192,192,192, 200,208, 208,208,208,208,208,208,208,208, 200,192, 192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [8, 11, 10, 11],                      /* S1 the snowplow's ridge down the street */
    [114, 10, 115, 11],                   /* S5 a snow step up to the fort */
    [116, 8, 126, 10], [116, 11, 119, 11],   /* S5 THE OLD SNOW FORT (row 11 at c120-126 is its secret tunnel) */
    [202, 9, 204, 11]                     /* S8 the garage at the end of the alley: its roof is the launch pad */
  ],
  tiles: {
    gift: [[19, 6, 'candle'],                             /* S1 over the snowbank */
           [50, 8, 'heart'],                              /* S2 Grandma's bannock in the snow blocks */
           [66, 4, 'candle'],                             /* S3 on top of the park */
           [88, 6, 'candle'],                             /* S4 over the first hilltop */
           [119, 11, 'gold'],                             /* S5 the glinting snow block at the end of the tunnel */
           [148, 2, 'popper'],                            /* S6 on top of the toboggan hill */
           [175, 5, 'candle'],                            /* S7 over the hilltop */
           [203, 5, 'candle'],                            /* S8 over the garage */
           [219, 8, 'cake']],                             /* S9 hot chocolate and cake at the end */
    brick: [[48, 8], [49, 8], [51, 8],                    /* S2 packed snow blocks: they crumble when bumped */
            [97, 6], [98, 6],                             /* S4 snow blocks over the little hill */
            [129, 8], [130, 8], [131, 8]],                /* S5 snow blocks past the fort */
    spring: [[225, 12]],                                  /* S9 a snowbank trampoline in the bowl */
    shelf: [[142, 3], [143, 3], [144, 3],                 /* S6 the old poplar's branch, BEHIND the top of the hill (skill) */
            [124, 5], [125, 5], [126, 5],                 /* S5 the snow fort's lookout over its front wall (visible) */
            [178, 6], [179, 6], [180, 6]]                 /* S7 a floating snowbank over the valley: it catches a short jump */
  },
  /* white jackrabbits hop, magpies steal candles (stomp one to get it back), crows circle, the snowball kids throw */
  foes: [[12, 11, 'bunny'],
         [42, 10, 'bunny'],
         [72, 5, 'magpie'],
         [91, 5, 'magpie'], [95, 10, 'bunny'],
         [122, 7, 'neighbor'], [133, 11, 'bunny'],
         [140, 9, 'bunny'], [154, 4, 'magpie'],
         [166, 11, 'bunny'], [171, 5, 'crow'], [179, 2, 'magpie'],
         [198, 10, 'bunny'], [207, 4, 'magpie'], [213, 11, 'neighbor'],
         [236, 6, 'crow']],
  candles: [[3, 11], [4, 11], [8, 10], [9, 10], [10, 10],
            [15, 9], [16, 8], [17, 8], [18, 8], [20, 8], [22, 8], [23, 9],
            [30, 10], [31, 9], [33, 9], [35, 9], [37, 8], [38, 7], [39, 8], [40, 9],
            [55, 10], [56, 9], [58, 9], [61, 8], [63, 8], [65, 7], [67, 7], [70, 7], [72, 8], [74, 9], [76, 10], [77, 9], [78, 8], [79, 9],
            [85, 8], [87, 8], [89, 8], [90, 7], [91, 6], [92, 6], [93, 7], [95, 9], [99, 8], [100, 8], [101, 7], [102, 6], [103, 7], [105, 9], [106, 9],
            [114, 9], [115, 9], [117, 7], [119, 7], [121, 7], [123, 7], [125, 7], [127, 8], [128, 9], [124, 4], [126, 4],
            [124, 11], [123, 11], [122, 11], [121, 11],
            [137, 9], [139, 8], [141, 7], [143, 6], [145, 5], [147, 4], [149, 4], [151, 5], [153, 6], [155, 7], [157, 8],
            [159, 8], [160, 7], [161, 6], [162, 6], [163, 7], [142, 2], [144, 2],
            [167, 11], [168, 10], [169, 9], [171, 8], [173, 8], [175, 8], [176, 7], [177, 6], [178, 5], [180, 5], [181, 6], [182, 8], [183, 9],
            [190, 10], [192, 9], [193, 8], [194, 8], [195, 9], [197, 9], [199, 9], [202, 8], [204, 8], [205, 7], [206, 6], [207, 6], [208, 6], [209, 7],
            [222, 12], [223, 12], [225, 9], [225, 6], [224, 4], [225, 3], [226, 3], [227, 4], [228, 12], [229, 12],
            [234, 11], [235, 11], [237, 11], [238, 11]],
  secrets: [
    { kind: 'visible', col: 125, row: 4, prize: 'heart+candles' },                   /* the snow fort's lookout */
    { kind: 'hidden', col: 119, row: 11, prize: 'GOLDEN CANDLE', glint240: true },   /* the end of the snow fort's secret tunnel */
    { kind: 'skill', col: 143, row: 2, prize: 'hat' }                                /* the old poplar's branch behind the hilltop */
  ],
  goldenCandle: { col: 119, row: 11 },
  checkpoint: { col: 110, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 239, row: 11 }             /* the end of the park, where Glitchy's trail heads downtown */
});

/* ============================================================
   LEVEL 9-5 · THE BIODOME
   (World 9 · Montreal · trail stop 5)
   Story bible (World 9 table): "Rainforest, penguins and the cold
   zone." From the lookout Kinan spots Glitchy slipping into the
   Biodome by the Olympic Stadium: a whole rainforest under one roof,
   a maple forest, the tide pools of the Gulf, and the cold penguin
   zone at the end.
   Idea (ONE): THE FLOOR CHANGES UNDER YOUR FEET (World 7's moss,
     slime and ice). In the rainforest the green moss is sticky (a slow
     walk across it) and the floor by the waterfall is wet and slippery
     (stopping takes longer); in the cold zone the floor is ICE (slow to
     get going, you slide when you let go) and penguins waddle about.
     Act 1 teaches the rainforest floors (moss with no gap near it, the
     wet floor ending a tile before a lip); act 2 twists it (THE ROOT
     TUNNEL, the maple plateau, THE PUFFIN ROCK, then into the cold
     zone: ice and penguins); act 3 tests it on the ice (the ice floes
     4/4, THE ICEBERG, a 5, the penguin colony).
   Moss never lies within 8 tiles of a lip (it would cut a run-up
     short); every gap on the ice has a long icy runway before it.
   Acts (thirds): 0-89 teach (the moss, 3, the moss hilltop, the
     waterfall's wet floor, 3) · 90-179 twist (THE ROOT TUNNEL, 3, the
     maple plateau, THE PUFFIN ROCK, 4, the checkpoint, the cold zone
     4, the floes 4/4) · 180-269 test (THE ICEBERG, 3, a 5, the
     penguin colony).
   Secrets: visible = THE PUFFIN ROCK (S4-S5): a rock ledge over the
     maple plateau, one full jump high (heart + candles, 107,5) ·
     hidden = THE ROOT TUNNEL (S4): one root in the tunnel's roof
     glints; jump inside the tunnel and bump it (GOLDEN CANDLE, 83,9) ·
     skill = THE SNOWY LEDGE (S8): a ledge over the iceberg, one full
     jump high, on slippery ice (hat, 203,2).
   Gaps: act 1 3/3/3 · act 2 3/4/4/4/4 · act 3 3/5. Nothing waits at a
     lip. A full-run jump off the puffin rock, the iceberg or the snowy
     ledge comes down on floor (w9-levels.spec.ts checks it).
   Look: the Biodome (theme 114, World 9's own look): the ribbed roof
     inside, palm leaves, vines, mist and a waterfall; in the cold
     zone the backdrop turns to ice cliffs, the cold pool and falling
     snow.
   ENGINE REQUESTS: none.
   ============================================================ */
KinanLevels.register({
  id: '9-5', world: 9, slot: 5, kind: 'level',
  name: 'THE BIODOME',
  theme: 114,   /* the Biodome: the rainforest under the ribbed roof; ice cliffs and snow in the cold zone */
  cols: 270,
  moss: [[9, 14], [47, 51]],   /* sticky moss: a slow walk across it (never within 8 tiles of a lip) */
  slime: [[60, 67]],   /* the waterfall's wet floor: slippery (it ends a tile before the lip) */
  ice: [[140, 269]],   /* THE COLD ZONE: ice from here to the end */
  heights: [
    /* S1 0-26 the rainforest: the first moss (c9-14) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 a 3 gap c30-32, up the slope, the moss hilltop (c47-51) */
    192,192,192,null,null,null,192,192,192,192,192,192,184,176,176,176,176,176,176,176,176,176,176,176,176,176,176,
    /* S3 54-80 down to the waterfall pool: the wet floor (c60-67), a 3 gap c69-71 */
    176,176,176,176,184,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 THE ROOT TUNNEL (c81-85), a 3 gap c97-99 (far enough that a run off the tunnel's roof lands first), up to the maple plateau, THE PUFFIN ROCK (c106-108 row 6) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,184,176,168,160,160,160,160,
    /* S5 108-134 down to the tide pools, a 4 gap c128-131 */
    160,160,160,160,160,160,168,176,184,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,
    /* S6 135-161 the checkpoint, THE COLD ZONE (ice from c140), a 4 gap c148-151 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 THE ICE FLOES: a 4 gap c166-169, a floe c170-174, a 4 gap c175-178 */
    192,192,192,192,null,null,null,null,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,
    /* S8 189-215 THE ICEBERG (c197-200, c201-204), THE SNOWY LEDGE (c202-204 row 3), a 3 gap c205-207 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,
    /* S9 216-242 a 5 gap c223-227, up the slope to the colony */
    192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,184,176,176,176,176,176,
    /* S10 243-269 the penguin colony, the goal */
    176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176
  ],
  solid: [
    [81, 8, 85, 9],   /* S4 THE ROOT TUNNEL's roof (walk through under it; the hidden gift is one of its roots) */
    [197, 9, 200, 11], [201, 7, 204, 11]   /* S8 THE ICEBERG: a step, then the top */
  ],
  tiles: {
    gift: [
      [5, 8],   /* S1 */
      [44, 7],   /* S2 on the hilltop */
      [75, 8],   /* S3 */
      [83, 9, 'gold'],   /* S4 THE ROOT TUNNEL: the glinting root (hidden) */
      [92, 8],   /* S4 */
      [111, 6],   /* S5 on the plateau */
      [154, 8],   /* S6 */
      [183, 8],   /* S7 */
      [192, 8],   /* S8 */
      [230, 8],   /* S9 */
      [258, 7, 'heart'], [260, 7, 'cake']   /* S10 the gift row */
    ],
    brick: [
      [4, 8], [6, 8],   /* S1 */
      [153, 8], [155, 8],   /* S6 */
      [259, 7]   /* S10 */
    ],
    shelf: [
      [106, 6], [107, 6], [108, 6],   /* S4-S5 THE PUFFIN ROCK (visible secret) */
      [202, 3], [203, 3], [204, 3]   /* S8 THE SNOWY LEDGE (skill secret) */
    ]
  },
  /* frogs, mosquitoes and a slug in the rainforest; penguins (and seagulls) in the cold zone. Nothing waits at a lip. */
  foes: [
    [20, 11, 'puddlefrog'],   /* S1 */
    [36, 11, 'puddlefrog'],   /* S2 */
    [64, 7, 'mosquito'],   /* S3 */
    [91, 11, 'puddlefrog'], [104, 6, 'mosquito'],   /* S4 */
    [110, 9, 'slug'], [124, 11, 'puddlefrog'],   /* S5 */
    [144, 11, 'penguin'], [156, 11, 'penguin'],   /* S6 the first penguins */
    [168, 6, 'seagull'], [172, 11, 'penguin'], [182, 11, 'penguin'],   /* S7 */
    [192, 11, 'penguin'], [199, 8, 'penguin'], [207, 5, 'seagull'],   /* S8 */
    [219, 11, 'penguin'], [225, 6, 'seagull'], [231, 11, 'penguin'],   /* S9 */
    [250, 10, 'penguin'], [256, 10, 'penguin'], [262, 10, 'penguin']   /* S10 the colony */
  ],
  candles: [
    [3, 11], [7, 11], [9, 11], [11, 11], [13, 11], [15, 11], [17, 11], [22, 11], [24, 11], [26, 11],
    [27, 11], [29, 10], [30, 9], [31, 9], [32, 9], [33, 10], [35, 11], [37, 11], [39, 10], [41, 10], [43, 10], [45, 10], [47, 10], [49, 10], [51, 10], [53, 10],
    [55, 10], [57, 10], [58, 10], [60, 11], [62, 11], [64, 11], [66, 11], [68, 10], [69, 9], [70, 9], [71, 9], [72, 10], [74, 11], [76, 11], [78, 11], [80, 11],
    [82, 11], [83, 10], [84, 11], [82, 7], [84, 7], [87, 11], [89, 11], [91, 11], [93, 11], [95, 10], [96, 9], [97, 8], [98, 8], [99, 8], [100, 9], [102, 10], [104, 9], [105, 9], [106, 5], [108, 5],
    [109, 9], [111, 9], [113, 9], [115, 10], [117, 11], [119, 11], [121, 11], [123, 11], [125, 11], [127, 10], [128, 9], [129, 8], [130, 8], [131, 9], [132, 10], [134, 11],
    [136, 11], [138, 11], [140, 11], [142, 11], [144, 11], [146, 11], [147, 10], [148, 9], [149, 8], [150, 8], [151, 9], [152, 10], [156, 11], [158, 11], [160, 11],
    [162, 11], [164, 11], [165, 10], [166, 9], [167, 8], [168, 8], [169, 9], [171, 11], [173, 11], [174, 10], [175, 9], [176, 8], [177, 8], [178, 9], [179, 10], [181, 11], [184, 11], [186, 11], [188, 11],
    [190, 11], [194, 11], [196, 11], [197, 8], [200, 8], [201, 6], [202, 6], [203, 6], [204, 6], [202, 2], [204, 2], [205, 5], [206, 5], [207, 6], [208, 8], [210, 10], [212, 11], [214, 11],
    [216, 11], [218, 11], [220, 11], [222, 10], [223, 9], [224, 8], [225, 8], [226, 8], [227, 9], [228, 10], [232, 11], [234, 11], [236, 11], [237, 10], [239, 10], [241, 10],
    [244, 10], [246, 10], [248, 10], [252, 10], [254, 10], [258, 9], [260, 9], [263, 10], [265, 10]
  ],
  secrets: [
    { kind: 'visible', col: 107, row: 5, prize: 'heart+candles' },   /* THE PUFFIN ROCK: one full jump up from the plateau */
    { kind: 'hidden', col: 83, row: 9, prize: 'GOLDEN CANDLE', glint240: true },   /* THE ROOT TUNNEL: jump inside the tunnel, bump the glinting root */
    { kind: 'skill', col: 203, row: 2, prize: 'hat' }   /* THE SNOWY LEDGE: one full jump up from the icy iceberg top */
  ],
  goldenCandle: { col: 83, row: 9 },
  checkpoint: { col: 137, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 266, row: 10 },   /* the colony's far door: out to the Olympic Stadium */
  talk: [
    [2, 'KINAN', "The Biodome! It's a real jungle in here! Glitchy, where are you hiding?", 3.4],
    [7, 'MOM', "That green moss is sticky, sweetie. You'll walk slowly across it.", 3.4],
    [56, 'DAD', "The floor's wet by the waterfall, bud. Slippery! It's hard to stop. Don't fall for it.", 3.4],
    [30, "DAD", "There are penguins in here, bud! How does a penguin build its house? Igloos it together!", 3.8],
    [30, "MOM", "Is that all you do, tell jokes? I am going to the lookout. Alone. With quiet.", 3.4, "walkoff"],
    [30, "DAD", "...I'll be here all week! Tough crowd. Colder than the penguin room.", 3.2],
    [98, 'CHENOA', 'A whole maple forest inside a building! So cool, little bro.', 3.2],
    [136, 'SHAD', "Brrr! That's the penguin room. The floor in there is pure ice. You'll slide!", 3.6],
    [142, 'PASSER-BY', 'Bonjour! Look at the penguins! So cute, non?', 3],
    [244, 'KINAN', "Penguins! And there's Glitchy's hockey bag... He went up the Montreal Tower!", 3.8]
  ]
});

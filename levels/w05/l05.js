/* ============================================================
   LEVEL 5-5 · THE PEACE BRIDGE
   (World 5 · Calgary Stampede · trail stop 6)
   Story bible (World 5 table): "The red helix bridge over the Bow
   River." Bronco's hoofprints leave the midway and head straight for
   the river: along the Bow River pathway, across the Peace Bridge (the
   long red tube of a bridge, all criss-cross helix) and over to Prince's
   Island. The geese here do NOT share the path.
   Idea (ONE): THE TUBE. The bridge is a long tube with a roof: walk the
     LOW ROAD inside it (rollerbladers and cyclists, a low ceiling, short
     hops only) or ride a springboard up through a gap in the roof and
     run the HIGH ROAD on top of it (geese, magpies, the whole river
     below). Act 1 teaches the river pathway and the ramp up; act 2 is
     the tube itself, three roof gaps, three springboards; act 3 tests
     what's left on Prince's Island: 5-wide lagoon channels, the big
     tree, the island ridge.
   Acts (thirds): 0-98 teach (the Bow River pathway, the little BROW and
     a 3-wide back channel, the ramp up, into THE TUBE, the checkpoint)
     · 99-197 twist (the low road and the high road, springboards at
     c90, c120 and c150 under the roof gaps, off the end of the tube,
     the ramp down, a 4-wide channel) · 198-296 test (two 5-wide lagoon
     channels, THE TREE on Prince's Island, a 5-wide channel, the island
     RIDGE, the plaza).
   Signature set-piece: THE TUBE (S3-S7): 105 tiles of bridge, inside or
     on top, your pick, and you can switch at every roof gap.
   Secrets: visible = THE ROCK (S8): a rock sticks up in the middle of
     the first 5-wide lagoon channel; hop onto it instead of jumping
     across (heart + candles, 200,10) · hidden = THE LOW ROAD (S3): walk
     into the tube and jump under its roof before the first springboard;
     one panel of the helix glints (GOLDEN CANDLE, 80,6) · skill =
     THE TREE (S9): from the trunk jump up through the branches, then up
     again to the treetop (hat, 220,2).
   Look: borrows the Peace Bridge (theme 36): a big blue sky, the river
     and the red bridge.
   Bubble beats for ER-4 (not wired): c2 Robin: "The Peace Bridge! It's
     a big red tube!" · c18 Shad: "Watch the geese, bud. They do NOT
     share." · c66 Kinan: "Inside, or ON TOP?" · c86 checkpoint, a jogger:
     "What do you call a goose that won't move? A goose-stopper." · c80
     Chenoa: "One of the panels is sparkling." · c200 "A rock. In a river.
     Totally safe."
   ENGINE REQUESTS: the bridge drawn as the red helix (a lattice skin
     over the roof and the sides) and the Bow River drawn under the deck
     and in every pit · a rollerblader and a cyclist that swerve · geese
     that honk and chase (a goose charger) · bubbles ER-4.
  
   ============================================================ */
KinanLevels.register({
  id: '5-5', world: 5, slot: 6, kind: 'level',
  name: 'THE PEACE BRIDGE',
  theme: 36,              /* the Peace Bridge: a big blue sky, the river and the red bridge */
  cols: 297,
  heights: [
    /* S1 0-26 the Bow River pathway (the south bank) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 the little BROW (c31-39) · a 3-wide back channel c40-42 */
    192,192,192,192,184,176,176,176,176,176,176,184,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 the ramp up (c60-63) · the bridge deck · THE TUBE begins (its roof from c66) */
    192,192,192,192,192,192,184,176,168,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,
    /* S4 81-107 in THE TUBE: a helix panel glints in the roof (c80) · checkpoint · the springboard (c90) under the first roof gap (c90-92) */
    160,160,160,160,160,160,160,160,160,null,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,
    /* S5 108-134 in THE TUBE: the springboard (c120) under the second roof gap (c120-122) */
    160,160,160,160,160,160,160,160,160,160,160,160,null,160,160,160,160,160,160,160,160,160,160,160,160,160,160,
    /* S6 135-161 in THE TUBE: the springboard (c150) under the third roof gap (c150-152) */
    160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,null,160,160,160,160,160,160,160,160,160,160,160,
    /* S7 162-188 the end of THE TUBE (c170) · the ramp down (c171-174) · a 4-wide channel c185-188 */
    160,160,160,160,160,160,160,160,160,168,176,184,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,
    /* S8 189-215 Prince's Island: a 5-wide lagoon channel c198-202 with THE ROCK in it · a 5-wide channel c208-212 */
    192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,null,null,null,null,null,192,192,192,
    /* S9 216-242 THE TREE (trunk c222, branches, the treetop) · a 5-wide channel c236-240 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,
    /* S10 243-269 the island RIDGE (c247-260) */
    192,192,192,192,184,176,168,160,160,160,160,160,160,160,168,176,184,192,192,192,192,192,192,192,192,192,192,
    /* S11 270-296 reward: the plaza on the north bank, Dad's truck */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [66, 6, 89, 6], [93, 6, 119, 6], [123, 6, 149, 6], [153, 6, 170, 6],   /* THE TUBE's roof, with three gaps (c90-92, c120-122, c150-152); a glinting helix panel at c80 */
    [200, 11, 200, 14],   /* S8 THE ROCK in the lagoon channel */
    [222, 9, 222, 11]   /* S9 THE TREE's trunk */
  ],
  tiles: {
    gift: [
      [5, 8, 'popper'],   /* S1 */
      [35, 7],   /* S2 over the brow */
      [57, 8],   /* S3 at the ramp */
      [80, 6, 'gold'], [96, 7],   /* S4 the glinting helix panel (hidden) · inside the tube */
      [110, 2], [132, 2, 'heart'],   /* S5 on the roof */
      [180, 8],   /* S7 */
      [253, 5],   /* S10 over the ridge */
      [277, 8], [279, 8, 'heart'], [281, 8, 'cake']   /* S11 the plaza */
    ],
    brick: [
      [4, 8], [6, 8],   /* S1 */
      [34, 7], [36, 7],   /* S2 */
      [95, 7], [97, 7],   /* S4 */
      [109, 2], [111, 2],   /* S5 */
      [252, 5], [254, 5],   /* S10 */
      [276, 8], [278, 8], [280, 8], [282, 8]   /* S11 */
    ],
    spring: [
      [90, 10], [120, 10], [150, 10]   /* THE TUBE's springboards, flush in the deck under the roof gaps */
    ],
    shelf: [
      [220, 6], [221, 6], [222, 6], [223, 6], [224, 6], [220, 3], [221, 3]   /* S9 THE TREE's branches and the treetop (skill secret) */
    ]
  },
  /* cyclists charge, rollerbladers roll, geese patrol low and high, crows and magpies over the river; inside the tube nothing waits next to a springboard */
  talk: [   /* Dad's jokes, the wheeze-laugh, Mom's reactions (tools/dad-lines.mjs) */
    [30, "DAD", "Why don't horses ever win at cards? They always say neigh! Get it? Neigh? Like no, but horse?", 4],
    [30, "MOM", "Is that all you do, tell jokes? ...I am going to look at the quilts.", 3.4, "walkoff"],
    [30, "DAD", "...I'll be here all week, folks! Stampede's ten days, actually.", 3.2]
  ],
  foes: [
    [18, 8, 'goose'],   /* S1 */
    [50, 11, 'biker'],   /* S2 */
    [74, 9, 'rollerblader'],   /* S3 at the tube's mouth */
    [100, 9, 'rollerblader'], [106, 3, 'goose'],   /* S4 the low road · the high road */
    [114, 9, 'biker'], [127, 3, 'goose'],   /* S5 the low road · the high road */
    [140, 9, 'rollerblader'], [157, 2, 'magpie'],   /* S6 the low road · the high road */
    [166, 9, 'biker'], [181, 3, 'goose'],   /* S7 */
    [205, 3, 'crow'], [214, 9, 'goose'],   /* S8 */
    [226, 3, 'crow'], [238, 4, 'goose'],   /* S9 */
    [249, 10, 'rollerblader'], [254, 9, 'biker'], [262, 3, 'magpie'],   /* S10 */
    [290, 11, 'rollerblader']   /* S11 */
  ],
  candles: [
    [2, 11], [3, 11], [4, 11], [5, 7], [10, 11], [13, 11], [16, 11], [19, 11], [22, 11], [31, 11], [32, 10], [33, 10], [35, 10], [37, 10],
    [35, 6], [39, 11], [40, 9], [41, 8], [42, 9], [43, 11], [44, 11], [46, 11], [48, 11], [50, 11], [52, 11], [55, 11], [57, 11], [59, 11],
    [57, 7], [60, 10], [61, 10], [62, 9], [63, 9], [64, 9], [66, 9], [68, 9], [70, 9], [72, 9], [74, 9], [76, 9], [78, 9], [80, 9],
    [68, 5], [72, 5], [76, 5], [80, 5], [84, 5], [88, 5], [82, 9], [84, 9], [86, 9], [88, 9], [90, 8], [90, 6], [91, 4], [92, 3],
    [94, 5], [96, 5], [98, 5], [100, 5], [102, 5], [104, 5], [106, 5], [95, 5], [98, 9], [102, 9], [106, 9], [108, 5], [110, 5], [112, 5],
    [114, 5], [116, 5], [118, 5], [110, 1], [120, 4], [121, 3], [122, 3], [123, 4], [124, 5], [126, 5], [128, 5], [130, 5], [132, 5], [134, 5],
    [132, 1], [112, 9], [117, 9], [122, 9], [127, 9], [132, 9], [136, 5], [138, 5], [140, 5], [142, 5], [144, 5], [146, 5], [148, 5], [150, 4],
    [151, 3], [152, 3], [153, 4], [154, 5], [156, 5], [158, 5], [160, 5], [138, 9], [143, 9], [148, 9], [153, 9], [158, 9], [162, 5], [164, 5],
    [166, 5], [168, 5], [170, 5], [172, 4], [174, 5], [176, 7], [178, 9], [180, 7], [181, 11], [182, 11], [183, 11], [184, 11], [185, 9], [186, 8],
    [187, 8], [188, 9], [189, 11], [190, 11], [192, 11], [194, 11], [196, 11], [199, 9], [200, 8], [201, 9], [197, 11], [198, 9], [199, 8], [201, 8],
    [202, 9], [203, 11], [205, 11], [207, 11], [208, 9], [209, 8], [210, 8], [211, 8], [212, 9], [213, 11], [214, 11], [215, 11], [217, 11], [219, 11],
    [221, 11], [222, 8], [220, 5], [222, 5], [224, 5], [221, 2], [226, 11], [228, 11], [230, 11], [232, 11], [234, 11], [235, 11], [236, 9], [237, 8],
    [238, 8], [239, 8], [240, 9], [241, 11], [242, 11], [243, 11], [244, 11], [245, 11], [246, 11], [247, 10], [248, 9], [249, 8], [251, 9], [252, 9],
    [253, 9], [254, 9], [255, 9], [256, 9], [253, 4], [258, 9], [259, 10], [262, 11], [264, 11], [266, 11], [268, 11], [271, 11], [273, 11], [275, 11],
    [277, 7], [279, 7], [281, 7], [284, 11], [286, 11], [288, 11], [290, 11], [292, 11], [288, 8], [289, 7], [290, 8]
  ],
  secrets: [
    { kind: 'visible', col: 200, row: 10, prize: 'heart+candles' },   /* THE ROCK in the middle of the lagoon channel */
    { kind: 'hidden', col: 80, row: 6, prize: 'GOLDEN CANDLE', glint240: true },   /* THE LOW ROAD: the glinting helix panel in the tube's roof */
    { kind: 'skill', col: 220, row: 2, prize: 'hat' }   /* the top of THE TREE */
  ],
  goldenCandle: { col: 80, row: 6 },
  checkpoint: { col: 86, row: 9 },
  spawn: { col: 2, row: 11 },
  goal: { col: 293, row: 11 }   /* Dad's truck waits at the plaza */
});

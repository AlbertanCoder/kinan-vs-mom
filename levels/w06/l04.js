/* ============================================================
   LEVEL 6-4 · THE FOSSIL DIG
   (World 6 · Drumheller · trail stop 4)
   Story bible (World 6 table): "Dig and assemble fossils." The dinosaur
   museum runs a real dig out in the badlands: string grids, brushes,
   plaster jackets, and a whole skeleton lying in the rock of an old
   quarry. Glitchy dove into the quarry and every layer of rock went
   crumbly. Kinan gets a hard hat and a job: dig.
   Idea (ONE): DIG UP. The rock layers are bricks: head-bump them from
     below and they crumble, and the fossils (gift blocks) are buried in
     them. Act 1 teaches it at the dig camp (a layer overhead, a trench
     with a rock roof full of fossils, 3-wide gaps); act 2 twists it in
     the quarry (down the layers over a 4-wide gap, THE BONE BED with
     4-wide dig pits and a buried skeleton, up the quarry wall); act 3
     tests it on the rim (5-wide gaps from the rim to the jacket wagons,
     the last gaps) and ends with THE SCAFFOLD TOWER: dig up through two
     layers for the hat.
   Acts (thirds): 0-98 teach (the dig camp, THE FIRST TRENCH, the string
     grid 3, the spoil heap 3, the checkpoint) · 99-197 twist (down into
     the quarry 4, THE BONE BED 4/4, up the quarry wall 4/4) · 198-296
     test (the rim 5/5, the jacket wagons 5/5, the conveyor 5/4, THE
     SCAFFOLD TOWER).
   Signature set-piece: THE BONE BED (S6): the quarry floor where the
     skeleton lies; a rock layer hangs over it and every block you dig
     out drops candles and bones.
   Secrets: visible = THE CRANE BUCKET (S8): the quarry crane's bucket
     hangs over the rim; a full jump lands you in it, where a heart
     waits (heart + candles, 192,4) · hidden = THE BONE BED (S6): in the
     rock layer over the bones one block is missing and glints: the
     skull (GOLDEN CANDLE, 147,10) · skill = THE SCAFFOLD TOWER (S11):
     bump a hole in the lower layer, jump up through it onto the bricks,
     bump a hole in the upper layer, jump through again (hat, 285,5).
   Look: borrows the Big Dig (theme 17): an orange sky over a dig site,
     brown earth and sandy tops.
   Bubble beats for ER-4 (not wired): c2 Robin: "Hard hats ON. It's a
     real dig!" · c34 Kinan: "There are bones IN the roof!" · c100
     checkpoint, a paleontologist: "What do you call a fossil that never
     does any work? Lazy bones!" · c140 Shad: "The skull's around here
     somewhere. Look for the gap." · c190 Chenoa: "Kinan's in the crane
     bucket. Of course he is." · c284 "I DUG my way to the top!"
   ENGINE REQUESTS: fossil assembly (each bone block dug up fills one
     piece of a skeleton outline in the HUD; all of them stand the
     skeleton up at the end) · a rock-layer skin for the bricks (striped
     sandstone, bones showing) · a crane and bucket skin over the bucket
     block · bubbles ER-4.
   ============================================================ */
KinanLevels.register({
  id: '6-4', world: 6, slot: 4, kind: 'level',
  name: 'THE FOSSIL DIG',
  theme: 17,   /* the Big Dig: an orange sky over a dig site, brown earth, sandy tops */
  cols: 297,
  heights: [
    /* S1 0-26 the dig camp: the first rock layer overhead (c6-14), the sifting mound (c10-18), the tent */
    192,192,192,192,192,192,192,192,192,192,184,176,176,176,176,176,176,184,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 THE FIRST TRENCH: down the ladder (c30-31), its rock roof full of fossils (c32-39), up the ladder · a 3-wide gap c46-48 */
    192,192,192,208,224,224,224,224,224,224,224,224,224,208,192,192,192,192,null,null,null,192,192,192,192,192,192,
    /* S3 54-80 the string grid: a 3-wide dig pit c60-62, a rock layer over the grid (c64-67), up the spoil ramp (c71-74) */
    192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,184,176,168,160,160,160,160,160,160,160,
    /* S4 81-107 the spoil heap: a 3-wide gap c86-88, down to the prep tent · the checkpoint */
    160,160,160,160,160,null,null,null,160,160,160,160,160,160,168,176,184,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 down into the quarry: a 4-wide gap c112-115 onto the first layer (c116-121), down to the quarry floor and its rock roof (c125-132) */
    192,192,192,192,null,null,null,null,208,208,208,208,208,208,216,224,224,224,224,224,224,224,224,224,224,224,224,
    /* S6 135-161 THE BONE BED: 4-wide dig pits c141-144 and c151-154, the rock layer over the bones */
    224,224,224,224,224,224,null,null,null,null,224,224,224,224,224,224,null,null,null,null,224,224,224,224,224,224,224,
    /* S7 162-188 up the quarry wall: the ladder (c165-166), a 4-wide gap c170-173 up onto a ledge, the ladder (c177-178), a 4-wide gap c185-188 */
    224,224,224,208,192,192,192,192,null,null,null,null,176,176,176,160,144,144,144,144,144,144,144,null,null,null,null,
    /* S8 189-215 the rim: THE CRANE BUCKET overhead (c192-193) · 5-wide gaps c198-202 and c207-211 */
    144,144,144,144,144,144,144,144,144,null,null,null,null,null,144,144,144,144,null,null,null,null,null,144,144,144,144,
    /* S9 216-242 the jacket wagons: down to the road (c218-223), 5-wide gaps c225-229 and c234-238 */
    144,144,152,160,168,176,184,192,192,null,null,null,null,null,192,192,192,192,null,null,null,null,null,192,192,192,192,
    /* S10 243-269 the conveyor: a 5-wide gap c247-251 up onto the belt (c252-255), a 4-wide gap c256-259 down */
    192,192,192,192,null,null,null,null,null,176,176,176,176,null,null,null,null,192,192,192,192,192,192,192,192,192,192,
    /* S11 270-296 reward: THE SCAFFOLD TOWER (two rock layers, c280-285), the museum's field truck */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [20, 10, 21, 11],   /* S1 the dig tent */
    [192, 5, 193, 5],   /* S8 THE CRANE BUCKET (visible secret: stand in it) */
    [294, 10, 295, 11]   /* S11 the field truck's tailgate past the goal */
  ],
  tiles: {
    gift: [
      [8, 8, 'popper'],   /* S1 fossils in the first layer */
      [12, 8],   /* S1 */
      [34, 10],   /* S2 fossils in the trench roof */
      [37, 10, 'heart'],   /* S2 */
      [65, 8, 'cake'],   /* S3 */
      [92, 6], [104, 8],   /* S4 */
      [127, 10],   /* S5 fossils in the quarry roof */
      [130, 10],   /* S5 */
      [137, 10],   /* S6 the bone bed: the ribs */
      [147, 10, 'gold'],   /* S6 THE BONE BED: the skull, the missing block that glints (hidden) */
      [157, 10],   /* S6 */
      [181, 5],   /* S7 */
      [195, 5],   /* S8 */
      [231, 8],   /* S9 */
      [253, 7],   /* S10 */
      [288, 8, 'heart'], [290, 8], [292, 8]   /* S11 */
    ],
    brick: [
      [6, 8], [7, 8], [9, 8], [10, 8], [11, 8], [13, 8],
      [14, 8],   /* S1 */
      [32, 10], [33, 10], [35, 10], [36, 10], [38, 10], [39, 10],
      [64, 8], [66, 8], [67, 8],   /* S3 */
      [91, 6], [93, 6], [103, 8], [105, 8],   /* S4 */
      [125, 10], [126, 10], [128, 10], [129, 10], [131, 10], [132, 10],
      [135, 10], [136, 10], [138, 10], [146, 10], [148, 10], [156, 10],
      [158, 10], [159, 10],   /* S6 */
      [180, 5], [182, 5],   /* S7 */
      [230, 8], [232, 8],   /* S9 */
      [252, 7], [254, 7],   /* S10 */
      [280, 9],   /* S11 THE SCAFFOLD TOWER: the lower layer */
      [281, 9], [281, 6],   /* S11 THE SCAFFOLD TOWER: the upper layer */
      [282, 9], [282, 6], [283, 9], [283, 6], [284, 9], [284, 6],
      [285, 6], [289, 8], [291, 8]   /* S11 */
    ]
  },
  /* gophers dig up, mud blobs split in two, pothole gremlins peek out of the dig pits, baby dinos hop, magpies and crows overhead */
  foes: [
    [23, 11, 'gopher'],   /* S1 */
    [36, 13, 'mud'],   /* S2 */
    [76, 9, 'pothole'],   /* S3 */
    [104, 11, 'gopher'],   /* S4 */
    [114, 5, 'magpie'], [128, 13, 'mud'],   /* S5 */
    [138, 13, 'pothole'], [148, 8, 'crow'], [158, 13, 'mud'],   /* S6 */
    [164, 13, 'babydino'], [186, 5, 'crow'],   /* S7 */
    [196, 4, 'crow'], [209, 5, 'magpie'],   /* S8 */
    [216, 8, 'lassolizard'], [231, 5, 'magpie'],   /* S9 */
    [250, 5, 'crow'], [266, 11, 'mud'],   /* S10 */
    [273, 11, 'babydino']   /* S11 */
  ],
  candles: [
    [2, 11], [3, 11], [4, 11], [5, 11], [10, 10], [12, 10], [14, 10], [16, 10], [23, 11], [24, 11], [25, 11], [26, 11], [29, 11], [30, 11],
    [31, 12], [32, 13], [33, 13], [34, 13], [35, 13], [36, 13], [37, 13], [38, 13], [39, 13], [40, 12], [41, 11], [45, 11], [46, 9], [47, 8],
    [48, 8], [49, 9], [50, 11], [51, 11], [52, 11], [53, 11], [59, 11], [60, 9], [61, 8], [62, 8], [63, 9], [64, 11], [64, 6], [65, 6],
    [66, 6], [67, 6], [71, 10], [72, 9], [73, 9], [75, 9], [77, 9], [79, 9], [85, 9], [86, 7], [87, 6], [88, 6], [89, 7], [90, 9],
    [91, 9], [92, 9], [93, 9], [95, 9], [96, 9], [97, 10], [102, 11], [103, 11], [104, 11], [105, 11], [106, 11], [107, 11], [111, 11], [112, 9],
    [113, 8], [114, 8], [115, 8], [116, 9], [117, 11], [118, 12], [119, 12], [120, 12], [121, 12], [122, 12], [123, 12], [124, 13], [126, 13], [128, 13],
    [130, 13], [132, 13], [134, 13], [135, 13], [136, 13], [137, 13], [138, 13], [139, 13], [140, 13], [141, 11], [142, 10], [143, 10], [144, 10], [145, 11],
    [146, 13], [150, 13], [151, 11], [152, 10], [153, 10], [154, 10], [155, 11], [156, 13], [157, 13], [158, 13], [159, 13], [160, 13], [161, 13], [162, 13],
    [163, 13], [164, 13], [165, 12], [166, 11], [169, 11], [170, 9], [171, 8], [172, 8], [173, 8], [174, 9], [175, 10], [177, 9], [178, 8], [179, 8],
    [180, 8], [181, 8], [182, 8], [183, 8], [184, 8], [185, 6], [186, 5], [187, 5], [188, 5], [189, 6], [190, 8], [194, 8], [195, 8], [196, 8],
    [197, 8], [198, 6], [199, 5], [200, 5], [201, 5], [202, 6], [203, 8], [204, 8], [205, 8], [206, 8], [207, 6], [208, 5], [209, 5], [210, 5],
    [211, 6], [212, 8], [213, 8], [214, 8], [215, 8], [218, 8], [219, 8], [220, 9], [221, 9], [222, 10], [223, 10], [224, 11], [225, 9], [226, 8],
    [227, 8], [228, 8], [229, 9], [230, 11], [231, 11], [232, 11], [233, 11], [234, 9], [235, 8], [236, 8], [237, 8], [238, 9], [239, 11], [240, 11],
    [241, 11], [242, 11], [246, 11], [247, 9], [248, 8], [249, 8], [250, 8], [251, 9], [252, 10], [253, 10], [254, 10], [255, 10], [256, 9], [257, 8],
    [258, 8], [259, 8], [260, 9], [261, 10], [262, 11], [264, 11], [266, 11], [268, 11], [271, 11], [272, 11], [273, 11], [274, 11], [275, 11], [276, 11],
    [277, 11], [278, 11], [282, 4], [284, 4], [287, 11], [288, 11], [289, 11], [290, 11], [291, 11], [292, 11]
  ],
  secrets: [
    { kind: 'visible', col: 192, row: 4, prize: 'heart+candles' },   /* THE CRANE BUCKET: a full jump up into it from the rim */
    { kind: 'hidden', col: 147, row: 10, prize: 'GOLDEN CANDLE', glint240: true },   /* THE BONE BED: the skull, the glinting gap in the rock layer */
    { kind: 'skill', col: 285, row: 5, prize: 'hat' }   /* THE SCAFFOLD TOWER: dig up through both layers */
  ],
  goldenCandle: { col: 147, row: 10 },
  checkpoint: { col: 100, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 291, row: 11 }   /* the museum's field truck */
});

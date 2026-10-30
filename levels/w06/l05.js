/* ============================================================
   LEVEL 6-5 · THE MUSEUM HALLS
   (World 6 · Drumheller · trail stop 5)
   Story bible (World 6 table): "Skeletons and exhibit cases as
   platforms." The dinosaur museum: hall after hall of real skeletons,
   a sea gallery, a prep lab behind glass, and a garden of the plants
   the dinosaurs ate. Glitchy got into the wiring. The animatronic baby
   dinosaurs are hopping off their displays, the robot carts roll on
   their own, the security cameras fly around flashing... and at the
   end of the halls, the gift shop where six-year-old Kinan once got
   the Pop Pad and the Squish Pal.
   Idea (ONE): SKELETONS. Bones are semisolid ledges: jump up through a
     ribcage, land on its back. Exhibit cases are solid. Act 1 teaches it
     in the lobby and the Hall of Dinosaurs (walk under the long-neck's
     ribs or ride on top, a 3-wide dig display, the duck-bill plinths);
     act 2 twists it (THE FLYING REPTILES hanging over 4-wide pits, the
     sea reptile's spine as a bridge, the armoured dinosaur's case, the
     prep lab); act 3 tests it (THE T-REX HALL with a 5-wide pit under
     its jaws, the garden ponds 5/5, the ice age hall 5/4).
   Acts (thirds): 0-107 teach (the lobby, the long-neck 3, the duck-bill
     plinths 3, the mezzanine 3, the checkpoint) · 108-215 twist (THE
     FLYING REPTILES 4/4, the sea gallery 4/4, the armoured dinosaur 4,
     the prep lab 4) · 216-323 test (THE T-REX HALL 5, the garden 5/5,
     the ice age hall 5/4, THE GIFT SHOP).
   Signature set-piece: THE T-REX HALL (S9): the biggest skeleton in the
     museum stands over a 5-wide pit; run under its jaws, or climb its
     bones from the tail to the skull.
   Secrets: visible = THE FLYING REPTILE (S5): a pterosaur skeleton hangs
     over the landing; a full jump onto its wing, where a heart waits
     (heart + candles, 119,7) · hidden = THE ARMOURED DINOSAUR'S CASE (S7):
     over its glass case one block glints (GOLDEN CANDLE, 170,5) · skill
     = THE T-REX SKULL (S9): tail, ribs, spine, skull, two tiles up each
     hop, the last one out over the pit (hat, 229,2).
   Look: borrows the Science Dome (theme 47): a dim blue hall under a
     dome, grey floors, glass-blue blocks.
   Bubble beats for ER-4 (not wired): c2 Chenoa: "Shh, it's a museum.
     ...Why is that baby dinosaur HOPPING?" · c30 Kinan: "I can walk
     right under its ribs!" · c104 checkpoint, a museum guard: "Why
     don't museums ever get bored? They have too many exhibits to look
     after!" · c145 Shad: "That sea reptile's spine makes a pretty good
     bridge." · c228 Kinan: "I'm standing on a T-REX's HEAD." · c305
     "The gift shop! That's where I got the Pop Pad!"
   ENGINE REQUESTS: skeleton skins for the bone shelves (ribs, spines,
     skulls) and glass-case skins for the solid plinths · the World 6
     memory (the Pop Pad and the Squish Pal on the gift shop shelf) as a
     pickup · flashing security-camera flyers · bubbles ER-4.
   ============================================================ */
KinanLevels.register({
  id: '6-5', world: 6, slot: 5, kind: 'level',
  name: 'THE MUSEUM HALLS',
  theme: 47,   /* the Science Dome: a dim blue hall under a dome, grey floors, glass-blue blocks */
  cols: 324,
  heights: [
    /* S1 0-26 THE LOBBY: the ticket desk (c8-10), the T-rex skeleton by the doors (bone ledges c16-21) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 the Hall of Dinosaurs: walk under the long-neck's ribcage (c30-37) or ride on top · a 3-wide dig display c40-42 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 the duck-bill herd on their plinths (c57-59, c64-66) · a 3-wide dig display c74-76 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,
    /* S4 81-107 up to the mezzanine (c85-86), a 3-wide gap c93-95, down (c102-103) · the checkpoint by the triceratops */
    192,192,192,192,176,160,160,160,160,160,160,160,null,null,null,160,160,160,160,160,160,176,192,192,192,192,192,
    /* S5 108-134 THE FLYING REPTILES: pterosaur skeletons hang over 4-wide pits c113-116 and c122-125 */
    192,192,192,192,192,null,null,null,null,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 the sea gallery: the sea reptile's spine bridges a 4-wide pit c143-146 · a 4-wide pit c153-156 */
    192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,
    /* S7 162-188 THE ARMOURED DINOSAUR: up the steps (c165-167) onto its case (c168-172), a 4-wide gap c173-176, down */
    192,192,192,176,160,144,144,144,144,144,144,null,null,null,null,144,144,144,144,160,176,192,192,192,192,192,192,
    /* S8 189-215 the prep lab: a 4-wide pit c195-198 · the lab benches (c204-206) under the fossil racks */
    192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S9 216-242 THE T-REX HALL: its bones from the tail (c217) to the skull (c228-230) · a 5-wide pit c226-230 under its jaws */
    192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S10 243-269 the garden: two 5-wide ponds c246-250 and c255-259 around a planter (c251-254) */
    192,192,192,null,null,null,null,null,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,
    /* S11 270-296 the ice age hall: a 5-wide pit c272-276 up onto the mammoth's plinth (c277-280), a 4-wide pit c281-284 down */
    192,192,null,null,null,null,null,176,176,176,176,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S12 297-323 reward: THE GIFT SHOP (the Pop Pad and the Squish Pal on the shelf), the gift row, the way out */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [8, 10, 10, 11],   /* S1 the ticket desk */
    [57, 10, 59, 11],   /* S3 the duck-bill plinths */
    [64, 10, 66, 11],   /* S3 */
    [204, 10, 206, 11],   /* S8 the lab bench */
    [302, 10, 303, 11]   /* S12 the gift shop counter */
  ],
  tiles: {
    gift: [
      [9, 6, 'popper'],   /* S1 */
      [47, 8],   /* S2 */
      [62, 8],   /* S3 */
      [89, 6],   /* S4 */
      [110, 8],   /* S5 */
      [138, 8],   /* S6 */
      [170, 5, 'gold'],   /* S7 THE ARMOURED DINOSAUR'S CASE: the glinting block (hidden) */
      [190, 8], [212, 8],   /* S8 */
      [236, 8],   /* S9 */
      [265, 8],   /* S10 */
      [292, 8],   /* S11 */
      [306, 8, 'heart'],   /* S12 the gift row */
      [308, 8], [310, 8, 'umbrella'], [312, 8]   /* S12 */
    ],
    brick: [
      [46, 8], [48, 8],   /* S2 */
      [61, 8], [63, 8],   /* S3 */
      [137, 8], [139, 8],   /* S6 */
      [211, 8], [213, 8],   /* S8 */
      [264, 8], [266, 8],   /* S10 */
      [307, 8], [309, 8], [311, 8]   /* S12 */
    ],
    shelf: [
      [16, 8],   /* S1 the lobby T-rex: ribs and skull */
      [17, 8], [18, 8], [18, 5], [19, 8], [19, 5], [20, 8],
      [20, 5], [21, 5],   /* S1 */
      [30, 8],   /* S2 the long-neck's ribcage and neck */
      [31, 8], [32, 8], [33, 8], [34, 8], [35, 8], [36, 8],
      [37, 8], [38, 7],   /* S2 */
      [118, 8],   /* S5 THE FLYING REPTILE's wing (visible secret) */
      [119, 8], [120, 8], [129, 6],   /* S5 another pterosaur */
      [130, 6], [131, 6],   /* S5 */
      [143, 12],   /* S6 the sea reptile's spine: a bridge over the pit */
      [144, 12], [145, 12], [146, 12],   /* S6 */
      [203, 7],   /* S8 the fossil racks */
      [204, 7], [205, 7], [206, 7], [207, 7],   /* S8 */
      [217, 9],   /* S9 THE T-REX: tail, ribs, spine, skull (skill secret) */
      [218, 9], [220, 7], [221, 7], [222, 7], [224, 5], [225, 5],
      [226, 5], [228, 3], [229, 3], [230, 3],   /* S9 */
      [300, 7],   /* S12 the gift shop shelf */
      [301, 7]   /* S12 */
    ]
  },
  /* animatronic baby dinos hop, robot carts roll, security cameras fly, a raccoon sneaked in; nothing waits at a lip */
  talk: [   /* Dad's jokes, the wheeze-laugh, Mom's reactions (tools/dad-lines.mjs) */
    [30, "DAD", "What do you call a fossil that won't work? Lazy bones! ...Come on, that's a classic. Like a fossil.", 4],
    [30, "MOM", "Ha! Oh no, I laughed. Don't tell him I laughed.", 3, "laugh"]
  ],
  foes: [
    [14, 11, 'robot'],   /* S1 */
    [34, 11, 'babydino'],   /* S2 */
    [61, 11, 'robot'],   /* S3 */
    [88, 9, 'babydino'],   /* S4 */
    [115, 6, 'camera'], [130, 11, 'robot'],   /* S5 */
    [139, 11, 'babydino'], [150, 5, 'camera'],   /* S6 */
    [163, 11, 'robot'], [175, 5, 'camera'],   /* S7 */
    [192, 11, 'robot'], [198, 5, 'camera'], [210, 11, 'babydino'],   /* S8 */
    [220, 11, 'robot'], [233, 5, 'camera'], [238, 11, 'raccoon'],   /* S9 */
    [248, 5, 'camera'], [257, 6, 'camera'], [264, 11, 'robot'],   /* S10 */
    [274, 5, 'camera'], [290, 11, 'raccoon'],   /* S11 */
    [305, 11, 'babydino']   /* S12 */
  ],
  candles: [
    [2, 11], [3, 11], [4, 11], [5, 11], [6, 11], [8, 9], [9, 9], [10, 9], [16, 7], [17, 7], [18, 7], [19, 7], [20, 7], [18, 4],
    [19, 4], [20, 4], [21, 4], [23, 11], [24, 11], [25, 11], [26, 11], [30, 7], [31, 7], [32, 7], [33, 7], [34, 7], [35, 7], [36, 7],
    [37, 7], [30, 11], [32, 11], [34, 11], [36, 11], [39, 11], [40, 9], [41, 8], [42, 8], [43, 9], [44, 11], [45, 11], [47, 11], [49, 11],
    [51, 11], [57, 9], [58, 9], [59, 9], [64, 9], [65, 9], [66, 9], [68, 11], [69, 11], [70, 11], [71, 11], [72, 11], [73, 11], [74, 9],
    [75, 8], [76, 8], [77, 9], [78, 11], [79, 11], [80, 11], [85, 10], [86, 9], [87, 9], [88, 9], [89, 9], [90, 9], [91, 9], [92, 9],
    [93, 7], [94, 6], [95, 6], [96, 7], [97, 9], [98, 9], [99, 9], [100, 9], [101, 9], [103, 10], [104, 11], [105, 11], [106, 11], [107, 11],
    [109, 11], [110, 11], [111, 11], [112, 11], [113, 9], [114, 8], [115, 8], [116, 8], [117, 9], [118, 11], [118, 6], [119, 6], [120, 6], [121, 11],
    [122, 9], [123, 8], [124, 8], [125, 8], [126, 9], [127, 11], [128, 11], [130, 11], [132, 11], [136, 11], [137, 11], [138, 11], [139, 11], [140, 11],
    [141, 11], [143, 11], [144, 11], [145, 11], [146, 11], [152, 11], [153, 9], [154, 8], [155, 8], [156, 9], [157, 11], [158, 11], [159, 11], [160, 11],
    [161, 11], [165, 10], [166, 9], [167, 8], [168, 8], [169, 8], [170, 8], [171, 8], [172, 8], [173, 6], [174, 5], [175, 5], [176, 5], [177, 6],
    [178, 8], [179, 8], [180, 8], [181, 8], [182, 9], [183, 10], [189, 11], [190, 11], [191, 11], [192, 11], [193, 11], [194, 11], [195, 9], [196, 8],
    [197, 8], [198, 8], [199, 9], [200, 11], [204, 9], [205, 9], [206, 9], [203, 6], [204, 6], [205, 6], [206, 6], [207, 6], [209, 11], [211, 11],
    [213, 11], [217, 8], [218, 8], [220, 6], [221, 6], [222, 6], [224, 4], [225, 4], [226, 4], [225, 11], [226, 9], [227, 8], [228, 8], [229, 8],
    [230, 9], [231, 11], [232, 11], [235, 11], [238, 11], [241, 11], [245, 11], [246, 9], [247, 8], [248, 8], [249, 8], [250, 9], [251, 11], [252, 11],
    [253, 11], [254, 11], [255, 9], [256, 8], [257, 8], [258, 8], [259, 9], [260, 11], [261, 11], [263, 11], [265, 11], [267, 11], [271, 11], [272, 9],
    [273, 8], [274, 8], [275, 8], [276, 9], [277, 10], [278, 10], [279, 10], [280, 10], [281, 9], [282, 8], [283, 8], [284, 8], [285, 9], [286, 10],
    [287, 11], [289, 11], [291, 11], [293, 11], [295, 11], [298, 11], [299, 11], [300, 11], [301, 11], [302, 9], [303, 9], [306, 7], [308, 7], [310, 7],
    [312, 7], [314, 11], [315, 11], [316, 11], [317, 11], [318, 11]
  ],
  secrets: [
    { kind: 'visible', col: 119, row: 7, prize: 'heart+candles' },   /* THE FLYING REPTILE: a full jump onto its wing */
    { kind: 'hidden', col: 170, row: 5, prize: 'GOLDEN CANDLE', glint240: true },   /* THE ARMOURED DINOSAUR'S CASE: the glinting block over the glass */
    { kind: 'skill', col: 229, row: 2, prize: 'hat' }   /* THE T-REX SKULL: tail, ribs, spine, skull */
  ],
  goldenCandle: { col: 170, row: 5 },
  checkpoint: { col: 104, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 320, row: 11 }   /* the museum doors: out to the river */
});

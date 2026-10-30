/* ============================================================
   LEVEL 5-6 · THE ZOO'S DINOSAUR PARK
   (World 5 · Calgary Stampede · trail stop 7)
   Story bible (World 5 table): "Robot dinosaurs and Rex the Robot
   T-rex. Secret exit through the volcano." Bronco crossed the river to
   the zoo on St. George's Island and hid in the dinosaur park: life-size
   dinosaurs as tall as houses. They're models. They don't move. ...Then
   Glitchy zips past, and the baby robot dinos start hopping.
   Idea (ONE): THE DINOSAURS ARE THE HILLS. Every big dinosaur is
     terrain you climb: the stegosaurus's back (hop its plates), the
     brachiosaurus (up its tail, along its back, up the long neck, over
     its head and down its chest), a herd of triceratops humps over
     4-wide gaps, the volcano with its crater, and REX, the robot T-rex:
     you run right through his open mouth. Act 1 teaches the climb
     (stegosaurus, brachiosaurus); act 2 twists it (the egg nest BOWL,
     the triceratops herd over gaps, the pteranodon's lookout, THE
     VOLCANO); act 3 tests it (the raptor run over 5-wide gaps, REX, the
     robot workshop RIDGE and a 5-wide gap).
   Acts (thirds): 0-98 teach (the dino trail, THE STEGOSAURUS and a
     3-wide gap, THE BRACHIOSAURUS, the egg nest BOWL, the checkpoint) ·
     99-197 twist (the TRICERATOPS HERD 4/4, the pteranodon's lookout and
     a 4-wide gap, THE VOLCANO) · 198-296 test (the raptor run 5/5, REX,
     a 5-wide gap, the workshop RIDGE and a 5-wide gap, the park gate).
   Signature set-piece: REX (S9): Rex the Robot T-rex stands with his
     jaws wide open; run through his mouth (mind the teeth), and if you
     dare, climb his tiny arms to the top of his head.
   Secrets: visible = THE PTERANODON (S6): a pteranodon model perches on
     its pole at the top of the lookout, its wing stretched over the
     4-wide gap; stop at the edge and hop up onto the wing (heart +
     candles, 144,6) · hidden = THE VOLCANO (S7): stand in the crater and
     jump; a block in the smoke glints (GOLDEN CANDLE, 175,4) and bumping it
     opens a door in the crater floor: the SECRET EXIT to 5-secret, down
     the lava tube to the Bow River (the 1-7 / 4-7 pattern). Jump over
     the door to carry on instead · skill = REX'S HEAD (S9): from his
     tiny arms jump onto his snout, then up onto the top of his head
     (hat, 224,2).
   Look: borrows the Dinosaur Zoo (theme 37): a green park under a blue
     sky, big leaves, warm dirt.
   Bubble beats for ER-4 (not wired): c2 Kinan: "Are they REAL?!"
     Chenoa: "They're models, little bro. They don't move. ...Right?" ·
     c60 "I'm walking on a BRACHIOSAURUS." · c104 checkpoint, a zookeeper:
     "What do you call a dinosaur that's asleep? A dino-SNORE." · c175
     Shad: "Did that volcano just... sparkle?" · c222 Rex: "ROOOAAAR.
     SYSTEM ONLINE." Kinan: "Excuse me, Mr. Rex, coming through!"
   ENGINE REQUESTS: dinosaur skins over the hills and solid blocks
     (stegosaurus plates, the brachiosaurus's neck, Rex's jaws and teeth)
     · Rex's eyes that glow and a roar when Kinan runs through · smoke
     puffing from the volcano and a lava-tube skin for the secret-exit
     door · a 'raptor' skin for the baby dino hopper · bubbles ER-4.
  
   ============================================================ */
KinanLevels.register({
  id: '5-6', world: 5, slot: 7, kind: 'level',
  name: 'THE ZOO\'S DINOSAUR PARK',
  theme: 37,              /* the Dinosaur Zoo: a green park under a blue sky, big leaves, warm dirt */
  cols: 297,
  heights: [
    /* S1 0-26 the zoo gate and the dino trail */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 THE STEGOSAURUS: its back (c30-43) with three plates to hop · a 3-wide gap c49-51 */
    192,192,192,184,176,176,176,176,176,176,176,176,176,176,176,184,192,192,192,192,192,192,null,null,null,192,192,
    /* S3 54-80 THE BRACHIOSAURUS: up its tail (c54-59), along its back, up the neck (c66-68), over its head (c69-71), down its chest */
    184,176,168,160,152,144,144,144,144,144,144,144,128,112,96,96,96,96,112,128,144,160,176,192,192,192,192,
    /* S4 81-107 the egg nest BOWL (c84-95) · checkpoint */
    192,192,192,200,208,208,208,208,208,208,208,208,208,200,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 THE TRICERATOPS HERD: hump, a 4-wide gap c116-119, hump, a 4-wide gap c128-131 */
    184,176,176,176,176,176,184,192,null,null,null,null,192,184,176,176,176,176,184,192,null,null,null,null,192,192,192,
    /* S6 135-161 up to the pteranodon's lookout (c138-144), its wing over a 4-wide gap c145-148 */
    192,192,192,184,176,168,160,160,160,160,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 THE VOLCANO: up (c165-169), the rim, the crater (c172-177), the rim, down (c180-184) */
    192,192,192,176,160,144,128,112,112,112,128,128,128,128,128,112,112,112,128,144,160,176,192,192,192,192,192,
    /* S8 189-215 the raptor run: two 5-wide gaps c198-202 and c208-212 */
    192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,null,null,null,null,null,192,192,192,
    /* S9 216-242 REX: his open mouth (upper jaw c222-228), his skull, his tiny arms (c229-230) · a 5-wide gap c236-240 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,
    /* S10 243-269 the robot workshop RIDGE (c246-259) · a 5-wide gap c262-266 */
    192,192,192,184,176,168,160,160,160,160,160,160,160,168,176,184,192,192,192,null,null,null,null,null,192,192,192,
    /* S11 270-296 reward: the park gate, Dad's truck */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [34, 10, 34, 10], [37, 9, 37, 10], [40, 10, 40, 10],   /* S2 THE STEGOSAURUS's plates */
    [222, 6, 228, 8], [223, 3, 226, 5]   /* S9 REX: the upper jaw, the skull */
  ],
  open: [[4, 13, 6, 13]],   /* SLAM SPOT (butt slam, 2026-10-29): the pocket under the cracked boards, solid floor under it */
  tiles: {
    crack: [[4, 12], [5, 12], [6, 12]],   /* SLAM SPOT: cracked floorboards over a pocket of candles (a bonus, never needed) */
    gift: [
      [5, 8, 'popper'],   /* S1 */
      [26, 8],   /* S2 */
      [62, 5],   /* S3 over the brachiosaurus's back */
      [88, 9], [90, 9, 'heart'], [92, 9],   /* S4 over the nest */
      [155, 8],   /* S6 */
      [175, 4, 'gold'],   /* S7 THE VOLCANO's glinting block (hidden + secret exit) */
      [252, 5],   /* S10 over the ridge */
      [277, 8], [279, 8, 'heart'], [281, 8, 'cake']   /* S11 the park gate */
    ],
    brick: [
      [4, 8], [6, 8],   /* S1 */
      [25, 8], [27, 8],   /* S2 */
      [61, 5], [63, 5],   /* S3 */
      [89, 9], [91, 9],   /* S4 */
      [154, 8], [156, 8],   /* S6 */
      [251, 5], [253, 5],   /* S10 */
      [276, 8], [278, 8], [280, 8], [282, 8]   /* S11 */
    ],
    shelf: [
      [144, 7], [145, 7],   /* S6 THE PTERANODON's wing at the lip of the gap (visible secret) */
      [229, 9], [230, 9]   /* S9 REX's tiny arms (skill secret) */
    ]
  },
  /* baby robot dinos hop after Kinan, geese and crows above; nothing waits at a gap's lip, near the crater or in Rex's mouth */
  foes: [
    [20, 11, 'babydino'],   /* S1 */
    [40, 3, 'goose'],   /* S2 */
    [63, 8, 'babydino'],   /* S3 on the brachiosaurus's back */
    [90, 12, 'babydino'], [100, 3, 'crow'],   /* S4 in the nest */
    [118, 3, 'crow'], [130, 2, 'goose'],   /* S5 (the humps before the gaps are left clear) */
    [153, 11, 'babydino'], [158, 4, 'goose'],   /* S6 */
    [167, 3, 'crow'], [187, 11, 'babydino'],   /* S7 */
    [200, 3, 'goose'], [210, 3, 'magpie'],   /* S8 */
    [218, 11, 'babydino'], [233, 3, 'crow'],   /* S9 */
    [252, 9, 'babydino'], [264, 3, 'goose'],   /* S10 on the ridge */
    [287, 11, 'babydino']   /* S11 */
  ],
  candles: [[4, 13], [5, 13], [6, 13],
    [2, 11], [3, 11], [4, 11], [5, 7], [9, 11], [11, 11], [13, 11], [15, 11], [17, 11], [25, 7], [27, 7], [30, 11], [31, 10], [34, 8],
    [37, 7], [40, 8], [32, 10], [35, 10], [38, 10], [41, 10], [42, 10], [43, 11], [45, 11], [46, 11], [47, 11], [48, 11], [49, 9], [50, 8],
    [51, 9], [52, 11], [54, 11], [55, 10], [56, 10], [57, 9], [58, 9], [59, 8], [60, 8], [61, 8], [62, 8], [63, 8], [64, 8], [65, 8],
    [62, 4], [66, 7], [67, 6], [68, 5], [69, 4], [70, 4], [71, 4], [72, 5], [73, 6], [74, 7], [75, 8], [76, 9], [77, 10], [79, 11],
    [81, 11], [83, 11], [85, 12], [86, 12], [88, 8], [90, 8], [92, 8], [94, 12], [95, 11], [97, 11], [99, 11], [101, 11], [103, 11], [109, 10],
    [110, 10], [110, 9], [111, 9], [112, 9], [113, 9], [114, 10], [115, 11], [116, 9], [117, 8], [118, 8], [119, 9], [120, 11], [123, 9], [124, 9],
    [125, 9], [127, 11], [128, 9], [129, 8], [130, 8], [131, 9], [132, 11], [133, 11], [134, 11], [135, 11], [136, 11], [137, 11], [138, 10], [139, 10],
    [140, 9], [141, 9], [142, 9], [143, 9], [144, 9], [145, 6], [144, 5], [145, 9], [145, 8], [146, 7], [147, 7], [148, 8], [149, 10], [150, 11],
    [152, 11], [154, 11], [156, 11], [158, 11], [160, 11], [155, 7], [162, 11], [163, 11], [164, 11], [165, 10], [166, 9], [167, 8], [168, 7], [169, 6],
    [170, 6], [171, 6], [173, 7], [174, 7], [175, 7], [176, 7], [175, 2], [178, 6], [179, 6], [180, 7], [181, 8], [182, 9], [183, 10], [185, 11],
    [186, 11], [187, 11], [188, 11], [190, 11], [192, 11], [194, 11], [196, 11], [197, 11], [198, 9], [199, 8], [200, 8], [201, 8], [202, 9], [203, 11],
    [205, 11], [207, 11], [208, 9], [209, 8], [210, 8], [211, 8], [212, 9], [213, 11], [214, 11], [215, 11], [216, 11], [218, 11], [220, 11], [222, 10],
    [223, 10], [224, 10], [225, 10], [226, 10], [227, 10], [228, 10], [224, 2], [225, 2], [229, 8], [230, 8], [231, 11], [232, 11], [233, 11], [234, 11],
    [235, 11], [236, 9], [237, 8], [238, 8], [239, 8], [240, 9], [241, 11], [242, 11], [243, 11], [244, 11], [245, 11], [246, 10], [247, 9], [248, 8],
    [250, 9], [251, 9], [252, 9], [253, 9], [254, 9], [255, 9], [252, 4], [257, 9], [258, 10], [261, 11], [262, 9], [263, 8], [264, 8], [265, 8],
    [266, 9], [267, 11], [268, 11], [269, 11], [271, 11], [273, 11], [275, 11], [277, 7], [279, 7], [281, 7], [284, 11], [286, 11], [288, 11], [290, 11],
    [292, 11], [288, 8], [289, 7], [290, 8]
  ],
  secrets: [
    { kind: 'visible', col: 144, row: 6, prize: 'heart+candles' },   /* THE PTERANODON's wing at the top of the lookout */
    { kind: 'hidden', col: 175, row: 4, prize: 'GOLDEN CANDLE + the secret exit', glint240: true, exit: '5-secret' },   /* THE VOLCANO: the glinting block in the crater's smoke */
    { kind: 'skill', col: 224, row: 2, prize: 'hat' }   /* the top of REX's head */
  ],
  goldenCandle: { col: 175, row: 4 },
  checkpoint: { col: 104, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 293, row: 11 }   /* the park gate: Dad's truck waits past it */
});

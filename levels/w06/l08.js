/* ============================================================
   LEVEL 6-8 · BADLANDS AT SUNSET
   (World 6 · Drumheller · trail stop 10)
   Story bible (World 6 table): "A race across the hills as the sun goes
   down." Glitchy is heading straight for the dinosaur museum, and the
   sun is going down behind the hoodoos. If he gets inside before dark,
   who knows what he'll wake up. Kinan runs for it, across the whole
   badlands, hill after hill, while the sky turns orange, then pink.
   Idea: THE EXAM, nothing new. It mixes what World 6 taught: downhill
     into the washouts (6-1), stairs up a butte (6-2), hoodoo hats (6-3),
     a rock roof to dig (6-4), a skeleton's bones (6-5), sandbars a tile
     low (6-6), a striped wall (6-7). Then THE SUNSET RACE: downhill,
     uphill, downhill into 5-wide gaps, hat to hat, over the last ridge.
   Acts (thirds): 0-107 teach (the rolling hilltop, the dry wash 3, the
     hoodoo hats 3/3, the butte stairs 3, the checkpoint) · 108-215
     twist (the fossil roof trench 4, the skeleton hill 4/4, the creek's
     sandbars 4/4, the striped wall 4) · 216-323 test (THE SUNSET RACE
     5/5, THE HOODOO GAUNTLET 5/5/5, the last ridge 5/5, the sunset).
   Signature set-piece: THE SUNSET RACE (S9-S11): run down a hill into a
     5-wide wash, up and down again into the next, then three 5-wide
     gaps hat to hat with magpies diving, then over the last ridge.
   Secrets: visible = THE SKELETON HILL (S6): a dinosaur skeleton sticks
     out of the hill; hop up its ribs to its skull for the heart above
     (heart + candles, 161,3) · hidden = THE FOSSIL ROOF (S5): in the
     trench's rock roof one block glints (GOLDEN CANDLE, 117,9) · skill =
     THE LAST HOODOO (S12): the springboard at the end of the day, then
     steer onto the one-tile hat of the last hoodoo (hat, 306,2).
   Look: borrows the Alpha T-Rex Nest (theme 66): a sunset sky over warm
     red-brown hills.
   Bubble beats for ER-4 (not wired): c2 Robin: "The sun's going down.
     We have to catch him before the museum closes!" · c60 Kinan: "Hats,
     hats, hats!" · c103 checkpoint, a ranch hand: "Why did the
     dinosaur cross the road? Chickens weren't invented yet!" · c155
     Chenoa: "There's a skeleton sticking out of that hill!" · c225
     Kinan: "Downhill... JUMP! Downhill... JUMP!" · c315 Shad: "There's
     the museum. Glitchy's inside. Something's moving in there..."
   ENGINE REQUESTS: a sunset that deepens across the level (the sky going
     orange to pink to purple as Kinan runs right) · the badlands skin
     (as 6-1) · a dinosaur-skeleton skin over the rib shelves · the
     museum's lights in the distance at the end · bubbles ER-4.
   ============================================================ */
KinanLevels.register({
  id: '6-8', world: 6, slot: 10, kind: 'level',
  name: 'BADLANDS AT SUNSET',
  theme: 66,   /* the Alpha T-Rex Nest: a sunset sky over warm red-brown hills */
  cols: 324,
  heights: [
    /* S1 0-26 the hilltop at sunset: rolling hills (c3-9, c12-22) */
    192,192,192,184,176,176,176,176,184,192,192,192,184,176,168,160,160,160,160,168,176,184,192,192,192,192,192,
    /* S2 27-53 over a hill and down into the dry wash: a 3-wide gap c41-43 at the bottom */
    192,192,184,176,168,160,160,160,160,168,176,184,192,192,null,null,null,192,192,192,192,184,176,176,176,176,176,
    /* S3 54-80 the hoodoo hats: a 3-wide gap c57-59 up onto a hat (c60-63), a 3-wide gap c64-66 to the next (c67-71) */
    176,176,176,null,null,null,144,144,144,144,null,null,null,144,144,144,144,144,152,160,168,176,176,176,176,176,176,
    /* S4 81-107 the butte stairs (c83-85), a 3-wide gap c89-91 on top, down (c97-99) · the checkpoint */
    176,176,160,144,128,128,128,128,null,null,null,128,128,128,128,128,144,160,176,176,176,176,176,176,176,176,176,
    /* S5 108-134 THE FOSSIL ROOF: a trench (c112-118) under a rock roof, out (c119-120) · a 4-wide gap c126-129 */
    176,176,192,208,208,208,208,208,208,208,208,192,176,176,176,176,176,176,null,null,null,null,176,176,176,176,176,
    /* S6 135-161 THE SKELETON HILL: 4-wide gaps c139-142 and c147-150, the skeleton's ribs and skull (c155-161) */
    176,176,176,176,null,null,null,null,176,176,176,176,null,null,null,null,176,176,176,176,176,176,176,176,176,176,176,
    /* S7 162-188 the creek: sandbars a tile low (c169-172, c177-180) over 4-wide gaps c165-168 and c173-176 */
    176,176,176,null,null,null,null,192,192,192,192,null,null,null,null,192,192,192,192,184,176,176,176,176,176,176,176,
    /* S8 189-215 the striped wall (c191-194), a 4-wide gap c198-201 on top, down (c206-209) */
    176,176,160,144,128,112,112,112,112,null,null,null,null,112,112,112,112,128,144,160,176,176,176,176,176,176,176,
    /* S9 216-242 THE SUNSET RACE: downhill into a 5-wide gap c221-225, up, downhill into a 5-wide gap c235-239 */
    176,176,176,184,192,null,null,null,null,null,192,192,192,184,176,176,176,184,192,null,null,null,null,null,192,192,192,
    /* S10 243-269 THE HOODOO GAUNTLET: 5-wide gaps c245-249, c253-257, c261-265 hat to hat */
    192,192,null,null,null,null,null,192,192,192,null,null,null,null,null,176,176,176,null,null,null,null,null,192,192,192,192,
    /* S11 270-296 the last ridge (c271-278) into a 5-wide gap c279-283, a hat, a 5-wide gap c287-291 */
    192,184,176,176,176,176,176,184,192,null,null,null,null,null,192,192,192,null,null,null,null,null,192,192,192,192,192,
    /* S12 297-323 reward: THE SUNSET, the springboard and THE LAST HOODOO, the gift row, Dad's truck */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [314, 10, 315, 11]   /* S12 the fence by Dad's truck */
  ],
  tiles: {
    gift: [
      [6, 7, 'popper'], [17, 6],   /* S1 */
      [34, 6],   /* S2 */
      [78, 7],   /* S3 */
      [102, 7],   /* S4 */
      [117, 9, 'gold'],   /* S5 THE FOSSIL ROOF: the glinting block (hidden) */
      [144, 7],   /* S6 */
      [185, 7],   /* S7 */
      [212, 7],   /* S8 */
      [310, 8, 'heart'], [312, 8, 'cake']   /* S12 */
    ],
    brick: [
      [5, 7], [7, 7],   /* S1 */
      [33, 6], [35, 6],   /* S2 */
      [77, 7], [79, 7],   /* S3 */
      [101, 7], [103, 7],   /* S4 */
      [113, 9],   /* S5 the trench's rock roof */
      [114, 9], [115, 9], [116, 9], [118, 9],   /* S5 */
      [143, 7], [145, 7],   /* S6 */
      [184, 7], [186, 7],   /* S7 */
      [211, 7], [213, 7],   /* S8 */
      [311, 8]   /* S12 */
    ],
    spring: [
      [302, 11]   /* S12 the springboard (skill secret) */
    ],
    shelf: [
      [155, 7],   /* S6 THE SKELETON HILL: its ribs and skull (visible secret) */
      [156, 7], [157, 7], [158, 7], [160, 4], [161, 4],   /* S6 */
      [306, 3]   /* S12 THE LAST HOODOO's one-tile hat (skill secret) */
    ]
  },
  /* tumbleweeds and ground squirrels on the hills, a lizard on the hats, mud in the trench, magpies and crows diving at sunset */
  foes: [
    [11, 11, 'tumbleweed'], [24, 11, 'gopher'],   /* S1 */
    [42, 5, 'magpie'], [51, 10, 'squirrel'],   /* S2 */
    [65, 5, 'magpie'], [78, 10, 'lassolizard'],   /* S3 */
    [92, 3, 'crow'], [101, 10, 'gopher'],   /* S4 */
    [108, 10, 'squirrel'], [116, 12, 'mud'], [128, 5, 'magpie'],   /* S5 */
    [141, 5, 'magpie'], [149, 4, 'crow'], [157, 10, 'babydino'],   /* S6 */
    [167, 5, 'magpie'], [175, 6, 'crow'], [186, 10, 'gopher'],   /* S7 */
    [192, 4, 'magpie'], [200, 3, 'crow'], [211, 10, 'tumbleweed'],   /* S8 */
    [223, 5, 'magpie'], [229, 3, 'magpie'], [237, 5, 'crow'],   /* S9 */
    [248, 5, 'magpie'], [256, 4, 'crow'], [264, 5, 'magpie'],   /* S10 */
    [272, 4, 'magpie'], [281, 5, 'magpie'], [289, 5, 'crow'],   /* S11 */
    [318, 11, 'tumbleweed']   /* S12 */
  ],
  candles: [
    [2, 11], [3, 10], [4, 10], [5, 10], [6, 10], [7, 10], [8, 10], [9, 10], [10, 11], [11, 11], [12, 10], [13, 10], [14, 9], [15, 9],
    [16, 9], [17, 9], [18, 9], [23, 11], [24, 11], [25, 11], [26, 11], [29, 10], [30, 10], [31, 9], [32, 9], [33, 9], [34, 9], [35, 9],
    [36, 9], [37, 9], [38, 10], [39, 10], [40, 11], [41, 9], [42, 8], [43, 8], [44, 9], [45, 11], [46, 11], [47, 11], [50, 10], [51, 10],
    [52, 10], [53, 10], [56, 10], [57, 8], [58, 7], [59, 7], [60, 8], [61, 8], [62, 8], [63, 8], [64, 6], [65, 5], [66, 5], [67, 6],
    [68, 8], [69, 8], [70, 8], [71, 8], [72, 8], [73, 8], [74, 9], [75, 9], [76, 10], [79, 10], [83, 9], [84, 8], [85, 7], [86, 7],
    [87, 7], [88, 7], [89, 5], [90, 4], [91, 4], [92, 5], [93, 7], [94, 7], [95, 7], [96, 7], [97, 7], [98, 8], [99, 9], [100, 10],
    [102, 10], [104, 10], [106, 10], [108, 10], [109, 10], [110, 10], [111, 11], [112, 12], [113, 12], [114, 12], [115, 12], [116, 12], [117, 12], [118, 12],
    [119, 11], [120, 10], [121, 10], [122, 10], [123, 10], [124, 10], [125, 10], [126, 8], [127, 7], [128, 7], [129, 7], [130, 8], [131, 10], [132, 10],
    [134, 10], [135, 10], [136, 10], [137, 10], [138, 10], [139, 8], [140, 7], [141, 7], [142, 7], [143, 8], [144, 10], [145, 10], [146, 10], [147, 8],
    [148, 7], [149, 7], [150, 7], [151, 8], [152, 10], [155, 6], [156, 6], [157, 6], [158, 6], [159, 6], [160, 6], [160, 3], [161, 3], [162, 10],
    [163, 10], [164, 10], [165, 9], [166, 8], [167, 8], [168, 8], [169, 9], [170, 11], [171, 11], [172, 11], [173, 9], [174, 8], [175, 8], [176, 8],
    [177, 9], [178, 11], [179, 11], [180, 11], [181, 10], [182, 10], [183, 10], [185, 10], [187, 10], [191, 9], [192, 8], [193, 7], [194, 6], [195, 6],
    [196, 6], [197, 6], [198, 4], [199, 3], [200, 3], [201, 3], [202, 4], [203, 6], [204, 6], [205, 6], [206, 6], [207, 7], [208, 8], [209, 9],
    [210, 10], [212, 10], [214, 10], [216, 10], [217, 10], [218, 10], [219, 10], [220, 10], [221, 9], [222, 8], [223, 8], [224, 8], [225, 9], [226, 11],
    [227, 11], [228, 11], [229, 10], [230, 10], [231, 10], [232, 10], [233, 10], [234, 10], [235, 9], [236, 8], [237, 8], [238, 8], [239, 9], [240, 11],
    [241, 11], [242, 11], [244, 11], [245, 9], [246, 8], [247, 8], [248, 8], [249, 9], [250, 11], [251, 11], [252, 11], [253, 9], [254, 8], [255, 8],
    [256, 8], [257, 9], [258, 10], [259, 10], [260, 10], [261, 8], [262, 7], [263, 7], [264, 7], [265, 8], [266, 10], [267, 11], [268, 11], [269, 11],
    [271, 10], [272, 10], [273, 10], [274, 10], [275, 10], [276, 10], [277, 10], [278, 10], [279, 9], [280, 8], [281, 8], [282, 8], [283, 9], [284, 11],
    [285, 11], [286, 11], [287, 9], [288, 8], [289, 8], [290, 8], [291, 9], [292, 11], [293, 11], [294, 11], [295, 11], [296, 11], [297, 11], [298, 11],
    [299, 11], [300, 11], [302, 9], [302, 7], [303, 5], [304, 4], [309, 11], [311, 11], [313, 11], [315, 9], [317, 11], [319, 11]
  ],
  secrets: [
    { kind: 'visible', col: 161, row: 3, prize: 'heart+candles' },   /* THE SKELETON HILL: up its ribs to its skull */
    { kind: 'hidden', col: 117, row: 9, prize: 'GOLDEN CANDLE', glint240: true },   /* THE FOSSIL ROOF: the glinting block in the trench roof */
    { kind: 'skill', col: 306, row: 2, prize: 'hat' }   /* THE LAST HOODOO: springboard, then steer onto its one-tile hat */
  ],
  goldenCandle: { col: 117, row: 9 },
  checkpoint: { col: 103, row: 10 },
  spawn: { col: 2, row: 11 },
  goal: { col: 320, row: 11 }   /* Dad's truck: the museum lights ahead */
});

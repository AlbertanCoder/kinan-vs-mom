/* ============================================================
   LEVEL 6-1 · INTO THE VALLEY
   (World 6 · Drumheller · trail stop 1)
   Story bible (World 6 table): "The highway drops into the badlands."
   Bronco's tumbleweed rolled Glitchy east off the flat prairie, and the
   family's truck follows. One minute it's wheat fields at dawn; the
   next, the ground just ENDS and there's a whole valley of striped
   hills below: the badlands. Dinosaur country.
   Idea (ONE): DOWNHILL. The level starts high on the prairie rim and
     steps DOWN into the valley: every washout sits at the foot of a
     slope, so you build speed running down and jump at the bottom.
     Act 1 teaches it on the rim (a 2:1 run-down into a 2-wide washout,
     a 3-wide drop onto the lower road, a coulee BOWL); act 2 twists it
     (THE SWITCHBACKS down to the valley floor, the ROAD CUT RIDGE, the
     first hoodoos with a magpie); act 3 tests it (the river bridge and
     a 5-wide gap, a hill BROW straight into a 5-wide gap with a lizard
     throwing lassos, two gaps around a lone hoodoo).
   Acts (thirds): 0-98 teach (the prairie rim, the first look, the
     hairpin and THE BIG GREEN SIGN, the coulee BOWL, the checkpoint) ·
     99-197 twist (THE SWITCHBACKS 4, THE ROAD CUT, the first hoodoos
     3/4/3) · 198-296 test (the river bridge 5, the BROW 5, the wash 5/4,
     WELCOME TO DRUMHELLER).
   Signature set-piece: THE SWITCHBACKS (S5-S6): the highway zig-zags
     down the valley wall: run down, jump the washout, climb the road
     cut, run down again.
   Secrets: visible = THE BIG GREEN SIGN (S3): the highway sign at the
     hairpin; stop on top of it and jump for the heart floating over it
     (heart + candles, 68,3) · hidden = THE ROAD CUT (S6): on the striped
     ridge one rock glints (GOLDEN CANDLE, 143,6) · skill = THE WELCOME
     SIGN (S11): bounce off the springboard by the sign and steer onto
     the cut-out dinosaur's head (hat, 287,2).
   Look: borrows the Highway at Dawn (theme 11): a purple-orange dawn
     sky over the prairie, brown ground.
   Bubble beats for ER-4 (not wired): c2 Robin: "Glitchy's tumbleweed
     went THAT way. Into... a hole in the ground?" · c30 Kinan: "WHOA.
     The whole prairie just stops!" · c66 Shad: "That's the badlands,
     bud. Dinosaurs lived here." · c101 checkpoint, a trucker: "Why
     don't dinosaurs drive? Their arms can't reach the wheel!" · c172
     Chenoa: "That magpie took my candle!" · c290 "WELCOME TO
     DRUMHELLER. The dinosaur on the sign is waving at me."
   ENGINE REQUESTS: a badlands skin (striped red-and-grey hills, hoodoos
     with capstones) · a highway skin for the road tops and a green
     road-sign skin for the sign block · the welcome sign's cut-out
     dinosaur over the shelves · bubbles ER-4.
   ============================================================ */
KinanLevels.register({
  id: '6-1', world: 6, slot: 1, kind: 'level',
  name: 'INTO THE VALLEY',
  theme: 11,   /* the Highway at Dawn: a purple-orange dawn sky over the prairie, brown ground */
  cols: 297,
  heights: [
    /* S1 0-26 the prairie rim at dawn: the highway crest (c8-16) */
    96,96,96,96,96,96,96,96,88,80,80,80,80,80,80,88,96,96,96,96,96,96,96,96,96,96,96,
    /* S2 27-53 THE FIRST LOOK: the road tips over the rim, a 2:1 run-down (c31-34) into a 2-wide washout c39-40 */
    96,96,96,96,104,112,120,128,128,128,128,128,null,null,128,128,128,128,128,136,144,144,144,144,144,144,144,
    /* S3 54-80 the hairpin: a 3-wide gap c60-62 drops onto the lower road · THE BIG GREEN SIGN (c68-69) */
    144,144,144,144,144,144,null,null,null,160,160,160,160,160,160,160,160,168,176,176,176,176,176,176,176,176,176,
    /* S4 81-107 a coulee BOWL (c85-93) · a 3-wide washout c96-98 · the checkpoint */
    176,176,176,176,184,192,192,192,192,192,192,184,176,176,176,null,null,null,176,176,176,176,176,176,176,176,176,
    /* S5 108-134 THE SWITCHBACKS: run down (c113-114) into a 4-wide washout c119-122, down again to the valley floor */
    176,176,176,176,176,184,192,192,192,192,192,null,null,null,null,192,192,192,192,200,208,208,208,208,208,208,208,
    /* S6 135-161 THE ROAD CUT: up a 1:1 cut (c137-139), the striped RIDGE (c140-145), run down into a 4-wide gap c152-155 */
    208,208,192,176,160,160,160,160,160,160,160,168,176,184,192,192,192,null,null,null,null,192,192,192,192,192,192,
    /* S7 162-188 the first hoodoos: 3-wide c166-168, a hoodoo (c169-172), 4-wide c173-176, a hoodoo (c177-179), 3-wide c180-182 */
    192,192,192,192,null,null,null,176,176,176,176,null,null,null,null,176,176,176,null,null,null,192,192,192,192,192,192,
    /* S8 189-215 the river bridge: up onto the deck (c191-203), down off it (c204-205) and into a 5-wide gap c207-211 */
    192,192,176,160,160,160,160,160,160,160,160,160,160,160,160,176,192,192,null,null,null,null,null,192,192,192,192,
    /* S9 216-242 the badlands road: a BROW (c219-226) straight into a 5-wide gap c229-233 */
    192,192,192,184,176,176,176,176,176,184,192,192,192,null,null,null,null,null,192,192,192,184,176,176,176,176,176,
    /* S10 243-269 the dry wash: a 5-wide gap c249-253, a lone hoodoo (c254-256), a 4-wide gap c257-260 */
    176,176,184,192,192,192,null,null,null,null,null,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,
    /* S11 270-296 reward: WELCOME TO DRUMHELLER, the gift row, the sign's springboard, Dad's truck */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [68, 7, 69, 9],   /* S3 THE BIG GREEN SIGN at the hairpin (stand on it: the visible secret floats above) */
    [285, 9, 287, 11]   /* S11 the welcome sign's base */
  ],
  tiles: {
    gift: [
      [4, 2, 'popper'],   /* S1 */
      [37, 4],   /* S2 */
      [57, 5],   /* S3 */
      [89, 8],   /* S4 */
      [116, 8],   /* S5 */
      [143, 6, 'gold'],   /* S6 THE ROAD CUT: the glinting rock (hidden) */
      [184, 8],   /* S7 */
      [198, 6],   /* S8 */
      [235, 8],   /* S9 */
      [264, 8],   /* S10 */
      [276, 8, 'heart'],   /* S11 the gift row */
      [278, 8], [280, 8, 'cake']   /* S11 */
    ],
    brick: [
      [3, 2], [5, 2],   /* S1 */
      [56, 5], [58, 5],   /* S3 */
      [115, 8], [117, 8],   /* S5 */
      [197, 6], [199, 6],   /* S8 */
      [277, 8], [279, 8]   /* S11 */
    ],
    spring: [
      [283, 11]   /* S11 the welcome sign's springboard (skill secret) */
    ],
    shelf: [
      [286, 3],   /* S11 the cut-out dinosaur's head (skill secret) */
      [287, 3], [288, 3]   /* S11 */
    ]
  },
  /* tumbleweeds roll, gophers pop up, magpies steal candles, a lizard throws lassos; nothing waits at a lip */
  foes: [
    [22, 5, 'tumbleweed'],   /* S1 */
    [50, 8, 'gopher'],   /* S2 */
    [76, 10, 'tumbleweed'],   /* S3 */
    [89, 11, 'gopher'],   /* S4 */
    [121, 5, 'crow'], [131, 12, 'gopher'],   /* S5 */
    [142, 9, 'gopher'], [158, 11, 'tumbleweed'],   /* S6 */
    [174, 6, 'magpie'], [184, 11, 'gopher'],   /* S7 */
    [200, 9, 'raccoon'], [209, 6, 'magpie'],   /* S8 */
    [222, 10, 'lassolizard'], [240, 10, 'tumbleweed'],   /* S9 */
    [251, 6, 'magpie'], [265, 11, 'tumbleweed'],   /* S10 */
    [275, 11, 'tumbleweed']   /* S11 */
  ],
  candles: [
    [2, 5], [3, 5], [10, 4], [11, 4], [12, 4], [13, 4], [14, 4], [19, 5], [20, 5], [21, 5], [31, 5], [32, 5], [33, 6], [34, 6],
    [38, 6], [39, 4], [40, 4], [41, 6], [49, 8], [50, 8], [51, 8], [52, 8], [59, 7], [60, 5], [61, 5], [62, 5], [63, 7], [65, 8],
    [66, 7], [67, 6], [74, 10], [75, 10], [76, 10], [77, 10], [78, 10], [79, 10], [87, 11], [88, 11], [89, 11], [90, 11], [91, 11], [95, 10],
    [96, 8], [97, 7], [98, 8], [99, 10], [102, 10], [103, 10], [104, 10], [105, 10], [106, 10], [118, 11], [119, 9], [120, 8], [121, 8], [122, 9],
    [123, 11], [129, 12], [130, 12], [131, 12], [132, 12], [133, 12], [137, 11], [138, 10], [139, 9], [140, 9], [141, 9], [142, 9], [143, 9], [144, 9],
    [145, 9], [151, 11], [152, 9], [153, 8], [154, 8], [155, 9], [156, 11], [165, 10], [166, 8], [167, 7], [168, 7], [169, 8], [170, 10], [171, 9],
    [172, 9], [173, 9], [174, 7], [175, 6], [176, 7], [177, 9], [178, 9], [179, 9], [180, 9], [181, 7], [182, 6], [183, 7], [184, 9], [194, 9],
    [195, 9], [196, 9], [197, 9], [198, 9], [199, 9], [200, 9], [201, 9], [202, 9], [203, 9], [206, 10], [207, 8], [208, 7], [209, 7], [210, 7],
    [211, 8], [212, 10], [220, 9], [221, 9], [223, 9], [224, 9], [228, 11], [229, 9], [230, 8], [231, 8], [232, 8], [233, 9], [234, 11], [239, 10],
    [240, 10], [241, 10], [242, 10], [248, 11], [249, 9], [250, 8], [251, 8], [252, 8], [253, 9], [254, 11], [256, 11], [257, 9], [258, 8], [259, 8],
    [260, 9], [261, 11], [262, 11], [264, 11], [266, 11], [268, 11], [271, 11], [272, 11], [273, 11], [274, 11], [275, 11], [276, 7], [278, 7], [280, 7],
    [283, 9], [283, 7], [284, 5], [285, 4]
  ],
  secrets: [
    { kind: 'visible', col: 68, row: 3, prize: 'heart+candles' },   /* THE BIG GREEN SIGN: stand on it and jump for the heart */
    { kind: 'hidden', col: 143, row: 6, prize: 'GOLDEN CANDLE', glint240: true },   /* THE ROAD CUT: the glinting rock on the ridge */
    { kind: 'skill', col: 287, row: 2, prize: 'hat' }   /* THE WELCOME SIGN: springboard, then steer onto the dinosaur's head */
  ],
  goldenCandle: { col: 143, row: 6 },
  checkpoint: { col: 101, row: 10 },
  spawn: { col: 2, row: 5 },
  goal: { col: 293, row: 11 }   /* Dad's truck waits under the welcome sign */
});

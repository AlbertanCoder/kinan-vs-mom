/* ============================================================
   LEVEL 6-2 · THE WORLD'S LARGEST DINOSAUR
   (World 6 · Drumheller · trail stop 2)
   Story bible (World 6 table): "Climb the giant statue and look out its
   mouth." Downtown Drumheller has a painted dinosaur on every corner,
   and at the end of Main Street stands the biggest one in the world: a
   T-rex as tall as an eight-storey building, with stairs inside it and
   a lookout in its MOUTH. Glitchy zipped up there to hide. Something
   else is strange today: giant three-toed footprints are punched right
   through the sidewalk...
   Idea (ONE): STAIRS. Steep 1:1 staircases climb to landings, and the
     gaps sit at the top of the stairs. Act 1 teaches it downtown (the
     visitor centre steps, short stairs, 3-wide footprints); act 2 twists
     it (a tall staircase to a 4-wide gap, THE SOUVENIR SHOP ROOF, a
     footprint at the foot of the tail); act 3 tests it on the dinosaur
     itself: up its tail, across a 4-wide gap in its back, up the neck
     stairs, through THE MOUTH, down its chest into a 5-wide gap, then
     Main Street's two 5-wide footprints.
   Acts (thirds): 0-98 teach (downtown, the visitor centre steps, the
     footprint trail 3/3/3, the checkpoint) · 99-197 twist (the big
     staircase 4, THE SOUVENIR SHOP ROOF 4, the park and a 4-wide
     footprint, the tail) · 198-296 test (the back 4, THE MOUTH, the
     chest into 5, Main Street 5/5, the gift shop 4).
   Signature set-piece: THE MOUTH (S9): walk right into the giant T-rex's
     open jaws, under its teeth, and look out over the whole town.
   Secrets: visible = THE SOUVENIR SHOP SIGN (S6): a dinosaur-shaped sign
     hangs over the shop roof; stand on the roof and make a full jump up
     onto it (heart + candles, 145,3) · hidden = THE TOOTH (S9): in the
     mouth, one tooth glints (GOLDEN CANDLE, 218,4) · skill = THE TOP OF
     THE HEAD (S9): past the snout, a full jump onto its nostril, then
     walk back along the top of its head (hat, 215,1).
   Look: borrows the Dinosaur Zoo (theme 37): a green park under a blue
     sky, big leaves, warm dirt.
   Bubble beats for ER-4 (not wired): c2 Chenoa: "There's a dinosaur on
     EVERY corner!" · c33 Kinan: "Why is there a giant footprint in the
     sidewalk?" · c99 checkpoint, a tour guide: "Why can't you hear a
     dinosaur go to the bathroom? Because the P is silent!" · c170
     Shad: "Eighty-six feet tall. And there are stairs inside." · c214
     Kinan: "I'm IN ITS MOUTH. I can see the whole town!" · c290 Robin:
     "Those footprints lead toward the museum..."
   ENGINE REQUESTS: a giant T-rex statue skin over the tail slope, the
     back, the neck stairs and the jaw (the jaw blocks wear its teeth) ·
     painted-dinosaur statue skins for the street-corner blocks · a
     three-toed footprint drawn at the pit lips · bubbles ER-4.
   ============================================================ */
KinanLevels.register({
  id: '6-2', world: 6, slot: 2, kind: 'level',
  name: 'THE WORLD\'S LARGEST DINOSAUR',
  theme: 37,   /* the Dinosaur Zoo: a green park under a blue sky, big leaves, warm dirt */
  cols: 297,
  heights: [
    /* S1 0-26 downtown Drumheller: a painted dinosaur on the corner, the visitor centre steps (c8-16) */
    192,192,192,192,192,192,192,192,176,160,160,160,160,160,160,176,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 the first footprint c33-35 (3 wide) · stairs up to a landing (c42-49) */
    192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,176,160,160,160,160,160,176,192,192,192,192,192,
    /* S3 54-80 the footprint trail: a 3-wide footprint c58-60, stairs to a landing, a 3-wide footprint c73-75 off its top */
    192,192,192,192,null,null,null,192,192,192,192,192,192,192,176,160,160,160,160,null,null,null,160,160,160,160,160,
    /* S4 81-107 down the steps, a 3-wide footprint c89-91 · the checkpoint by the triceratops statue */
    160,160,160,176,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 THE BIG STAIRCASE: three steps up (c111-113), a 4-wide gap c117-120 at the top, down the far side */
    192,192,192,176,160,144,144,144,144,null,null,null,null,144,144,144,144,160,176,192,192,192,192,192,192,192,192,
    /* S6 135-161 THE SOUVENIR SHOP ROOF: stairs up to the roof (c137-140), its sign (c144-146), a 4-wide gap c147-150, the next roof, stairs down */
    192,192,176,160,144,128,128,128,128,128,128,128,null,null,null,null,128,128,128,128,144,160,176,192,192,192,192,
    /* S7 162-188 the park: a 4-wide footprint c166-169 · the tip of the tail (c178-181) rises out of the grass */
    192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,184,176,168,160,160,160,160,160,160,160,160,
    /* S8 189-215 UP THE TAIL (c191-194), its hips, a 4-wide gap in its back c201-204, the neck stairs (c209-210) */
    160,160,152,144,136,128,128,128,128,128,128,128,null,null,null,null,128,128,128,128,112,96,96,96,96,96,96,
    /* S9 216-242 THE MOUTH (c211-222) under its jaw and teeth, the snout, down its chest (c226-233) into a 5-wide gap c236-240 */
    96,96,96,96,96,96,96,96,96,96,112,128,128,128,144,160,176,192,192,192,null,null,null,null,null,192,192,
    /* S10 243-269 Main Street: two 5-wide footprints c246-250 and c258-262 */
    192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,
    /* S11 270-296 reward: a 4-wide footprint c274-277, the gift shop porch (c284-292), Dad's truck */
    192,192,192,192,null,null,null,null,192,192,192,192,192,192,176,160,160,160,160,160,160,176,192,192,192,192,192
  ],
  solid: [
    [20, 10, 21, 11],   /* S1 a painted dinosaur statue on the corner */
    [98, 10, 99, 11],   /* S4 the triceratops statue by the checkpoint */
    [211, 2, 222, 3],   /* S9 THE MOUTH: the top of the head and its upper jaw */
    [214, 4, 214, 4],   /* S9 its teeth */
    [216, 4, 216, 4], [220, 4, 220, 4], [222, 4, 222, 4]   /* S9 */
  ],
  tiles: {
    gift: [
      [5, 8, 'popper'], [12, 6],   /* S1 */
      [45, 6],   /* S2 */
      [64, 8], [78, 6],   /* S3 */
      [104, 8],   /* S4 */
      [130, 8],   /* S5 */
      [152, 4],   /* S6 */
      [174, 8],   /* S7 */
      [197, 4],   /* S8 */
      [218, 4, 'gold'],   /* S9 THE TOOTH: the glinting one (hidden) */
      [254, 8], [266, 8],   /* S10 */
      [287, 6, 'heart'], [289, 6]   /* S11 */
    ],
    brick: [
      [4, 8], [6, 8],   /* S1 */
      [44, 6], [46, 6],   /* S2 */
      [63, 8], [65, 8],   /* S3 */
      [103, 8], [105, 8],   /* S4 */
      [129, 8], [131, 8],   /* S5 */
      [196, 4], [198, 4],   /* S8 */
      [253, 8], [255, 8],   /* S10 */
      [288, 6]   /* S11 */
    ],
    shelf: [
      [144, 4],   /* S6 THE SOUVENIR SHOP SIGN (visible secret): a full jump up from the roof */
      [145, 4], [146, 4],   /* S6 */
      [223, 2]   /* S9 its nostril: a full jump up from past the snout (skill secret) */
    ]
  },
  /* raccoons and baby dinos on the sidewalks, magpies and a crow overhead; nothing waits at a lip */
  talk: [   /* Dad's jokes, the wheeze-laugh, Mom's reactions (tools/dad-lines.mjs) */
    [30, "DAD", "Why did the T-Rex never clap? Because his... hee hee... his arms are... HAHA... I can't—", 4, "wheeze"],
    [30, "CHENOA", "...too short. Dad, the dinosaur was right there. You had ONE job.", 3.4]
  ],
  foes: [
    [14, 9, 'raccoon'],   /* S1 */
    [40, 11, 'babydino'],   /* S2 */
    [70, 9, 'magpie'],   /* S3 */
    [94, 11, 'raccoon'],   /* S4 */
    [124, 6, 'magpie'], [130, 11, 'babydino'],   /* S5 */
    [153, 7, 'raccoon'], [160, 11, 'babydino'],   /* S6 */
    [174, 11, 'babydino'], [184, 5, 'crow'],   /* S7 */
    [197, 7, 'raccoon'], [207, 7, 'babydino'],   /* S8 */
    [218, 5, 'babydino'], [238, 6, 'magpie'],   /* S9 */
    [248, 6, 'magpie'], [254, 11, 'raccoon'], [266, 11, 'babydino'],   /* S10 */
    [288, 9, 'raccoon']   /* S11 */
  ],
  candles: [
    [2, 11], [3, 11], [4, 11], [5, 11], [6, 11], [9, 9], [10, 9], [11, 9], [12, 9], [13, 9], [14, 9], [16, 10], [17, 11], [20, 9],
    [22, 11], [24, 11], [32, 11], [33, 9], [34, 8], [35, 9], [36, 11], [37, 11], [38, 11], [39, 11], [40, 11], [41, 11], [42, 10], [43, 9],
    [44, 9], [45, 9], [46, 9], [47, 9], [48, 9], [49, 10], [57, 11], [58, 9], [59, 8], [60, 9], [61, 11], [62, 11], [63, 11], [64, 11],
    [65, 11], [66, 11], [68, 10], [69, 9], [72, 9], [73, 7], [74, 6], [75, 7], [76, 9], [77, 9], [78, 9], [79, 9], [80, 9], [84, 9],
    [85, 10], [88, 11], [89, 9], [90, 8], [91, 9], [92, 11], [94, 11], [95, 11], [96, 11], [97, 11], [102, 11], [103, 11], [104, 11], [105, 11],
    [106, 11], [111, 10], [112, 9], [113, 8], [116, 8], [117, 6], [118, 5], [119, 5], [120, 6], [121, 8], [125, 8], [126, 9], [127, 10], [129, 11],
    [131, 11], [133, 11], [137, 10], [138, 9], [139, 8], [140, 7], [141, 7], [142, 7], [143, 7], [144, 7], [145, 7], [146, 7], [147, 5], [148, 4],
    [149, 4], [150, 5], [151, 7], [152, 7], [153, 7], [154, 7], [155, 7], [156, 8], [157, 9], [158, 10], [165, 11], [166, 9], [167, 8], [168, 8],
    [169, 9], [170, 11], [171, 11], [172, 11], [173, 11], [174, 11], [175, 11], [176, 11], [178, 10], [179, 10], [180, 9], [181, 9], [182, 9], [184, 9],
    [186, 9], [188, 9], [191, 8], [192, 8], [193, 7], [194, 7], [195, 7], [196, 7], [197, 7], [198, 7], [199, 7], [200, 7], [201, 5], [202, 4],
    [203, 4], [204, 5], [205, 7], [206, 7], [207, 7], [208, 7], [209, 6], [210, 5], [212, 5], [214, 5], [216, 5], [218, 5], [220, 5], [222, 5],
    [226, 5], [227, 6], [231, 8], [232, 9], [233, 10], [234, 11], [235, 11], [236, 9], [237, 8], [238, 8], [239, 8], [240, 9], [241, 11], [245, 11],
    [246, 9], [247, 8], [248, 8], [249, 8], [250, 9], [251, 11], [252, 11], [254, 11], [256, 11], [257, 11], [258, 9], [259, 8], [260, 8], [261, 8],
    [262, 9], [263, 11], [264, 11], [266, 11], [268, 11], [273, 11], [274, 9], [275, 8], [276, 8], [277, 9], [278, 11], [279, 11], [281, 11], [283, 11],
    [284, 10], [285, 9], [286, 9], [287, 9], [288, 9], [289, 9], [290, 9]
  ],
  secrets: [
    { kind: 'visible', col: 145, row: 3, prize: 'heart+candles' },   /* THE SOUVENIR SHOP SIGN: a full jump from the roof */
    { kind: 'hidden', col: 218, row: 4, prize: 'GOLDEN CANDLE', glint240: true },   /* THE TOOTH: one tooth in the mouth glints */
    { kind: 'skill', col: 215, row: 1, prize: 'hat' }   /* THE TOP OF THE HEAD: onto the nostril, then back along its head */
  ],
  goldenCandle: { col: 218, row: 4 },
  checkpoint: { col: 100, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 294, row: 11 }   /* Dad's truck waits by the gift shop */
});

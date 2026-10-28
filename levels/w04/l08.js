/* ============================================================
   LEVEL 4-8 · WHYTE AVE AT NIGHT  (World 4 · Edmonton Homecoming · trail stop 10)
   Story bible (World 4 table): "Neon, street performers and the
   Princess Theatre." Up the stairs from the river valley and onto
   Whyte Ave on a summer night: old brick buildings, neon signs,
   rooftop patios, the street performers of the Fringe, the old
   streetcar, and of course road construction and potholes. Chenoa's
   dinner rush is downtown, across the High Level Bridge at the far
   end. Glitchy went that way. So does Kinan.
   Idea: THE EXAM, nothing new. It mixes what World 4 taught: spin-ups
     (4-5) as the street acrobats' trampolines, crane loads (4-6) as
     hanging neon signs and planks across the construction holes, and
     the valley walls (4-7) as the drop toward the river at the west
     end, plus rooftop runs where falling just puts you back on the
     street.
   Acts (thirds): 0-89 teach (the shop awnings, THE ACROBATS and the
     brick building, a 3-wide hole, the neon signs over the BROW, a
     3-wide hole, the Princess Theatre's marquee) · 90-179 twist (THE
     PRINCESS THEATRE, THE ROOFTOP PATIOS, the checkpoint, the Fringe
     stage, a 4-wide construction hole, THE OLD STREETCAR and a 4-wide
     hole) · 180-269 test (a 5-wide ravine off the top of the hill, a
     trampoline at the lip of a 5-wide hole, THE NEON TOWER, the High
     Level Bridge).
   Signature set-piece: THE PRINCESS THEATRE + THE ROOFTOP PATIOS (S4-S5):
     the acrobats' trampoline throws Kinan over the theatre's nine-tile
     front onto its roof; from there the patios run on roof to roof
     above the crowd. Miss a jump and you land on the street, safe, and
     walk on under the arcades.
   Secrets: visible = THE TROLLEY WIRE (S7): the streetcar's pole hangs a
     wire block out over the hole; don't jump at the end of the
     streetcar roof, just walk off it onto the wire (heart + candles,
     177,7) · hidden = THE PRINCESS MARQUEE (S4): walk under the marquee
     and jump; one block of it glints (GOLDEN CANDLE, 88,8) · skill =
     THE NEON TOWER (S9): neon signs zigzag up a wall, right, then back
     left, three tiles higher each (hat, 232,2).
   Look: borrows Whyte Ave at Night (theme 29): neon, old brick, a night
     sky.
   Bubble beats for ER-4 (not wired): c2 "Whyte Ave! It's so LOUD." ·
     c30 an acrobat: "Wanna fly, kid?" · c88 "The Princess Theatre. Mom
     took me to a movie here once." · c131 checkpoint, a busker: "Why
     don't Edmonton roads ever get bored? Every summer they get a new
     hole to dig." · c177 "A wire! Over a HOLE! Totally safe." · c266
     "The High Level Bridge. Chenoa's restaurant is right over there."
   ENGINE REQUESTS: neon sign skins for the hanging solid blocks and a
     marquee skin for its shelf · an acrobat skin for the springs ·
     the streetcar drawn over its solid body and wheels · the High Level
     Bridge's steel trusses drawn under its deck · street performers'
     bubbles ER-4.
   ============================================================ */
KinanLevels.register({
  id: '4-8', world: 4, slot: 10, kind: 'level',
  name: 'WHYTE AVE AT NIGHT',
  theme: 29,                /* Whyte Ave at Night: neon, old brick, the night sky */
  cols: 270,
  heights: [
    /* S1 0-26 the east end of Whyte · the shop awnings (c11-14) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 THE ACROBATS' trampoline (c31-32) in front of an old brick building (c33-39, 8 tall) · room to land · a 3-wide hole c51-53 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,
    /* S3 54-80 a 3-wide hole c58-60 · the BROW (c64-73) under the neon signs · a 3-wide hole c76-78 */
    192,192,192,192,null,null,null,192,192,192,184,176,176,176,176,176,176,176,184,192,192,192,null,null,null,192,192,
    /* S4 81-107 the marquee (c86-89) · the trampoline (c90-91) · THE PRINCESS THEATRE (c92-100, 9 tall) · the street */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 THE ROOFTOP PATIOS (three buildings, arcades under them) · checkpoint */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 a 4-wide construction hole c141-144 (a plank in it) · the Fringe stage (c149-152) */
    192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 the tram stop (c163-164) · THE OLD STREETCAR (c166-174) · the trolley wire · a 4-wide hole c177-180 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,
    /* S8 189-215 up the hill (c192-194, 1:1) · a 5-wide ravine c200-204 jumped off the top · the slope down to the river */
    192,192,192,176,160,144,144,144,144,144,144,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,
    /* S9 216-242 a trampoline at the lip (c217) of a 5-wide hole c218-222 · THE NEON TOWER (skill, c232-236) */
    192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S10 243-269 reward: up onto THE HIGH LEVEL BRIDGE's top deck (c248-262) · the bridge to downtown */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [33, 4, 38, 11], [39, 8, 39, 11],     /* S2 the old brick building (8 tall) and its back step */
    [66, 6, 68, 6], [70, 4, 71, 4],       /* S3 two neon signs hanging over the BROW */
    [92, 3, 100, 11],                     /* S4 THE PRINCESS THEATRE (9 tall): only the trampoline gets you over */
    [104, 5, 109, 8], [112, 4, 117, 8], [120, 6, 126, 8],   /* S5 THE ROOFTOP PATIOS (open arcades underneath) */
    [142, 11, 143, 11],                   /* S6 a plank across the construction hole */
    [149, 10, 152, 11],                   /*    the Fringe stage */
    [163, 10, 164, 11],                   /* S7 the tram stop platform */
    [166, 7, 174, 9],                     /*    THE OLD STREETCAR (walk under it, or climb on from the platform) */
    [232, 9, 233, 9], [236, 6, 237, 6], [232, 3, 233, 3],   /* S9 THE NEON TOWER (skill) */
    [246, 10, 246, 11], [247, 8, 247, 11] /* S10 the stairs up to the High Level Bridge */
  ],
  tiles: {
    gift: [[6, 8, 'popper'], [43, 8], [67, 3, 'heart'], [88, 8, 'gold'], [115, 1], [137, 8], [168, 3], [252, 4], [254, 4, 'heart'], [256, 4]],
    brick: [[5, 8], [7, 8], [42, 8], [44, 8], [136, 8], [138, 8], [253, 4], [255, 4]],
    spring: [[31, 11], [32, 11],          /* the acrobats' trampoline */
             [90, 11], [91, 11],          /* the trampoline at the theatre */
             [217, 12]],                  /* act 3: a trampoline at the lip of the hole */
    shelf: [[11, 8], [12, 8], [13, 8], [14, 8],             /* S1 a shop awning */
            [86, 8], [87, 8], [89, 8],    /* S4 THE PRINCESS MARQUEE (its middle block is the hidden one) */
            [176, 8], [177, 8],           /* S7 THE TROLLEY WIRE block (visible secret) */
            [248, 8], [249, 8], [250, 8], [251, 8], [252, 8], [253, 8], [254, 8], [255, 8],
            [256, 8], [257, 8], [258, 8], [259, 8], [260, 8], [261, 8], [262, 8]]   /* S10 THE HIGH LEVEL BRIDGE's top deck */
  },
  /* buskers throw juggling pins, drummers march, potholes peek, raccoons raid the bins, magpies and a cyclist;
     nothing waits at a hole's lip or under a low roof */
  foes: [[20, 11, 'busker'],
         [28, 11, 'drummer'],
         [68, 10, 'pothole'],
         [83, 11, 'busker'],
         [114, 3, 'drummer'], [122, 1, 'magpie'], [128, 11, 'raccoon'],
         [151, 9, 'busker'], [157, 11, 'drummer'], [155, 4, 'magpie'],
         [170, 6, 'drummer'],
         [209, 11, 'biker'], [213, 4, 'magpie'],
         [235, 3, 'magpie'], [240, 11, 'raccoon'],
         [258, 11, 'drummer']],
  candles: [[3, 11], [4, 11], [5, 7], [7, 7], [9, 11], [11, 7], [12, 7], [13, 7], [14, 7], [17, 11], [18, 11], [24, 11], [25, 11],
            [29, 10], [30, 9], [31, 7], [32, 5], [33, 3], [34, 2], [35, 2], [36, 3], [37, 3], [38, 3], [39, 7], [42, 7], [44, 7],
            [47, 11], [50, 10], [51, 9], [52, 8], [53, 9], [54, 10],
            [57, 10], [58, 9], [59, 8], [60, 9], [61, 10], [65, 10], [66, 5], [67, 5], [68, 5], [70, 3], [71, 3], [72, 10],
            [75, 10], [76, 9], [77, 8], [78, 9], [79, 10],
            [84, 11], [85, 11], [86, 11], [87, 11], [89, 11], [86, 7], [87, 7], [89, 7],
            [90, 8], [91, 5], [92, 2], [93, 2], [95, 2], [97, 2], [99, 2], [101, 3], [102, 4],
            [105, 4], [107, 4], [109, 4], [110, 3], [111, 3], [113, 3], [116, 3], [117, 3], [118, 4], [119, 5], [121, 5], [123, 5], [125, 5],
            [106, 11], [107, 11], [114, 11], [115, 11], [122, 11], [123, 11],
            [137, 7], [139, 10], [140, 9], [141, 8], [142, 8], [143, 8], [144, 9], [145, 10], [142, 10], [143, 10], [150, 9], [151, 8], [154, 11], [159, 11],
            [163, 9], [164, 9], [166, 6], [167, 6], [169, 6], [171, 6], [172, 6], [173, 6], [174, 6], [167, 11], [169, 11], [171, 11], [173, 11],
            [176, 10], [177, 9], [178, 8], [179, 8], [180, 9], [181, 10], [184, 11], [185, 11],
            [192, 10], [193, 9], [195, 8], [196, 8], [197, 8], [198, 8],
            [199, 7], [200, 6], [201, 5], [202, 5], [203, 6], [204, 7], [205, 9], [206, 10],
            [217, 10], [218, 7], [219, 4], [220, 3], [221, 3], [222, 4], [223, 7], [224, 10],
            [232, 8], [233, 8], [236, 5], [237, 5], [233, 2], [228, 11], [229, 11],
            [246, 9], [247, 7], [249, 7], [250, 7], [251, 7], [257, 7], [258, 7], [259, 7], [260, 7], [261, 7], [252, 3], [254, 3], [256, 3],
            [264, 11], [265, 11]],
  secrets: [
    { kind: 'visible', col: 177, row: 7, prize: 'heart+candles' },                /* THE TROLLEY WIRE: walk off the streetcar roof */
    { kind: 'hidden', col: 88, row: 8, prize: 'GOLDEN CANDLE', glint240: true },  /* THE PRINCESS MARQUEE */
    { kind: 'skill', col: 232, row: 2, prize: 'hat' }                             /* THE NEON TOWER */
  ],
  goldenCandle: { col: 88, row: 8 },
  checkpoint: { col: 131, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 266, row: 11 }             /* the High Level Bridge: downtown and Chenoa's restaurant across the river */
});

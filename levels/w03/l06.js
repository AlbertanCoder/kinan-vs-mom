/* ============================================================
   LEVEL 3-6 · THE HYDRO VAC YARD  (World 3 · Robin's oilfield · trail stop 7)
   Story bible (World 3 table): "Robin's hydro-vac suction lifts Kinan
   to high ledges." The moose has wandered off, and the lease road ends
   at the yard where Robin's crew parks the hydro-vac trucks. A hydro
   vac digs with water and sucks the mud up a giant hose, which is way
   safer than a shovel when there are pipes in the ground. Glitchy
   zapped the yard: every hose is sucking, and the trucks are parked
   wall to wall. Robin wants Kinan to wait in the truck; Kinan rides
   the hoses instead.
   Idea (ONE): SUCTION HOSES. A hose hangs down beside every truck;
     walk in under its nozzle and the suction pulls Kinan straight up
     the hose (a pad inside it) and drops him on the high ledge beside
     it. Act 1: the trucks are too tall to jump, so the hoses are the
     way up (no pits, and daylighting holes you can hop out of). Act 2:
     Robin's own truck, its boom over a 4-wide slurry pit, then a hose
     on top of a trailer (two lifts in a row). Act 3: a hose lifts you
     onto a gantry over a 5-wide slurry pit, then the wash bay.
   Acts (thirds): 0-71 teach (truck A and its hose, the daylighting
     holes, the shop roof, THE SPOIL PILE, a 3-wide pit) · 72-143 twist
     (the excavation BOWL, ROBIN'S TRUCK and its boom over a 4-wide
     slurry pit, the checkpoint, hose on hose up the vac tower) ·
     144-215 test (the gantry over a 5-wide pit, the wash bay, a 4-wide
     pit, the vac tank on its stand and the yard gate).
   Signature set-piece: ROBIN'S TRUCK (S4-S5): the hose hanging into
     the excavation lifts you onto the truck's red debris tank; run
     along it and out along the boom over the slurry pit.
   Secrets: visible = THE BOOM TIP (S5): a work lamp hangs under the
     end of the boom, right over the slurry pit; don't jump at the tip,
     drop onto the lamp, then hop across (heart + candles, 120,5) · hidden = THE SPOIL PILE (S3): the vac sucked up
     something shiny with that mud; it glints in the air over the pile,
     jump up into it from the top (GOLDEN CANDLE, 68,5) · skill = THE
     VAC TANK LADDER (S8): two-wide rungs, left then right, then a
     running jump onto the tank up on its stand (hat, 206,2).
   Look: borrows the Hydro Vac Yard (theme 15): the shop with its SHOP
     sign and the row of vac trucks behind, concrete ground, red
     bricks. The trucks' tanks are red toy bricks on concrete chassis,
     so toyBricks keeps them whole.
   Bubble beats for ER-4 (not wired): c2 Robin: "Wait in the truck,
     bud. I mean it this time." · c8 "A GIANT VACUUM. I need one for
     my room." · c68 "The vac sucked up something shiny with that mud."
     · c99 Robin: "That's my truck! Don't touch the... okay, ride it." ·
     c127 checkpoint, Robin: "What do you call a hydro-vac that tells
     jokes? A real sucker for a punchline." · c212 "Robin, can I drive
     it?" "No."
   ENGINE REQUESTS: real suction (an up-draft column that lifts Kinan
     while he stands in it, with a whoosh; today a spring pad inside a
     hose) and a hose skin for the hose walls · a hydro-vac truck prop
     (wheels, tank, boom) · slurry drawn in the pits · the age-3 memory
     gift (the Rescue Pups fire truck in Robin's lunch box) could sit in
     Robin's truck cab at c114 here, unless 3-1..3-4 already hold it ·
     Robin's dad-joke pickup · bubbles ER-4.
   ============================================================ */
KinanLevels.register({
  id: '3-6', world: 3, slot: 7, kind: 'level',
  name: 'THE HYDRO VAC YARD',
  theme: 15,                /* the Hydro Vac Yard: the shop, a row of vac trucks, concrete ground, red bricks */
  toyBricks: true,          /* the trucks' tanks are red bricks: they never break */
  cols: 216,
  heights: [
    /* S1 0-26 the yard gate · HOSE A (c8-10) beside TRUCK A (c11-20) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 two daylighting holes (c30-32, c39-41; you can hop out) · HOSE B (c45-47) up to the shop roof */
    192,192,192,null,null,null,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 the shop roof, steps down · THE SPOIL PILE (MESA c62-73) · a 3-wide slurry pit c76-78 */
    192,192,192,192,192,192,192,192,184,176,168,160,160,160,160,160,160,160,176,192,192,192,null,null,null,192,192,
    /* S4 81-107 the excavation BOWL (c82-94) · HOSE C (c98-100) · ROBIN'S TRUCK (c101-116) */
    192,200,208,216,224,224,224,224,224,224,224,216,208,200,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 the cab, the boom (to c118) over the 4-wide slurry pit c119-122 · checkpoint · HOSE D (c133-135) */
    192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 the trailer and HOSE E (c139-141) up the vac tower (c142-145) · HOSE F (c151-153) onto the gantry over the 5-wide pit c155-159 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,
    /* S7 162-188 the wash bay roof, steps down · a 4-wide slurry pit c178-181 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,
    /* S8 189-215 reward: THE VAC TANK LADDER (skill), the vac tank on its stand, the yard gate */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [8, 4, 8, 9],                         /* HOSE A: the hose hangs to row 9; walk in under its nozzle */
    [11, 9, 17, 11], [18, 10, 20, 11],    /* TRUCK A: chassis and cab base */
    [30, 14, 32, 14], [39, 14, 41, 14],   /* the daylighting holes' floors (2 deep, hop out) */
    [45, 3, 45, 9],                       /* HOSE B */
    [48, 5, 58, 11], [59, 8, 59, 11], [60, 10, 60, 11],   /* the shop (7 tall) and steps down its far side */
    [98, 3, 98, 9],                       /* HOSE C, hanging into the excavation */
    [101, 8, 112, 11], [113, 10, 116, 11],   /* ROBIN'S TRUCK: chassis and cab base */
    [133, 3, 133, 9],                     /* HOSE D */
    [136, 7, 141, 11],                    /* the vac trailer (5 tall) */
    [139, 0, 139, 4],                     /* HOSE E, hanging down onto the trailer roof */
    [142, 3, 145, 11], [146, 6, 146, 11], [147, 9, 147, 11],   /* the vac tower (9 tall) and steps down */
    [151, 3, 151, 9],                     /* HOSE F */
    [154, 5, 154, 11], [155, 5, 160, 5],  /* the gantry: its leg and its deck over the 5-wide pit */
    [161, 5, 167, 11], [168, 8, 168, 11], [169, 10, 169, 11],   /* the wash bay (7 tall) and steps down */
    [204, 3, 207, 4]                      /* the vac tank up on its stand (walk under it) */
  ],
  tiles: {
    gift: [[4, 8, 'popper'], [15, 2], [53, 1], [68, 5, 'gold'], [107, 1], [144, 0], [172, 8, 'heart'], [193, 8]],
    brick: [
      /* TRUCK A's tank */ [11, 6], [12, 6], [13, 6], [14, 6], [15, 6], [16, 6], [17, 6],
                           [11, 7], [12, 7], [13, 7], [14, 7], [15, 7], [16, 7], [17, 7],
                           [11, 8], [12, 8], [13, 8], [14, 8], [15, 8], [16, 8], [17, 8],
      /* its cab */        [18, 8], [19, 8], [20, 8], [18, 9], [19, 9], [20, 9],
      /* ROBIN'S TRUCK's tank */
      [101, 5], [102, 5], [103, 5], [104, 5], [105, 5], [106, 5], [107, 5], [108, 5], [109, 5], [110, 5], [111, 5], [112, 5],
      [101, 6], [102, 6], [103, 6], [104, 6], [105, 6], [106, 6], [107, 6], [108, 6], [109, 6], [110, 6], [111, 6], [112, 6],
      [101, 7], [102, 7], [103, 7], [104, 7], [105, 7], [106, 7], [107, 7], [108, 7], [109, 7], [110, 7], [111, 7], [112, 7],
      /* its cab */        [113, 8], [114, 8], [115, 8], [116, 8], [113, 9], [114, 9], [115, 9], [116, 9]
    ],
    spring: [[9, 12], [10, 12],           /* the suction inside each hose */
             [46, 12], [47, 12],
             [99, 12], [100, 12],
             [134, 12], [135, 12],
             [140, 7], [141, 7],          /* HOSE E sucks from the trailer roof */
             [152, 12], [153, 12]],
    shelf: [[113, 5], [114, 5], [115, 5], [116, 5], [117, 5], [118, 5],   /* the boom, out over the cab */
            [119, 6], [120, 6],                                         /* the work lamp hanging under the boom tip, over the pit (visible secret) */
            [201, 9], [202, 9], [199, 6], [200, 6]]                    /* THE VAC TANK LADDER (skill) */
  },
  pipes: [[8, 3], [31, 13], [40, 13], [45, 2], [88, 13], [90, 13], [98, 2], [133, 2], [151, 2]],   /* hose tops and the buried pipes the vac dug up */
  /* cones walk the yard, mud blobs split when stomped, mosquitoes hang over the wash bay; nothing walks into a hose */
  foes: [[24, 11, 'cone'],
         [36, 11, 'mud'],
         [67, 9, 'mud'],
         [87, 13, 'mud'], [105, 4, 'mosquito'],
         [130, 11, 'cone'], [126, 7, 'crow'],
         [149, 8, 'mosquito'], [158, 11, 'cone'],
         [175, 11, 'cone'], [185, 8, 'mosquito'], [187, 11, 'mud'],
         [196, 11, 'cone']],
  candles: [[3, 11], [4, 11], [9, 10], [9, 8], [10, 6], [12, 5], [13, 5], [15, 5], [16, 5], [22, 11], [23, 11],
            [30, 13], [31, 13], [32, 13], [35, 11], [37, 11], [39, 13], [40, 13], [41, 13], [46, 10], [46, 8], [47, 6], [50, 4], [52, 4], [55, 4], [57, 4],
            [63, 9], [64, 8], [66, 8], [70, 8], [75, 10], [76, 9], [77, 8], [78, 9], [79, 10],
            [85, 13], [86, 13], [89, 13], [91, 13], [99, 10], [99, 8], [100, 6], [102, 4], [104, 4], [108, 4], [110, 4], [112, 4],
            [114, 4], [116, 4], [118, 4], [119, 5], [121, 5], [122, 6], [123, 8], [124, 10],
            [125, 11], [126, 11], [134, 10], [134, 8], [137, 6], [138, 6], [140, 5], [140, 3], [141, 1], [143, 2], [145, 2],
            [149, 11], [150, 11], [152, 10], [152, 8], [153, 6], [155, 4], [157, 4], [159, 4], [162, 4], [164, 4], [166, 4],
            [171, 11], [172, 11], [177, 10], [178, 9], [179, 8], [180, 8], [181, 9], [182, 10],
            [201, 8], [202, 8], [199, 5], [200, 5], [205, 2], [207, 2], [210, 11], [211, 11]],
  secrets: [
    { kind: 'visible', col: 120, row: 5, prize: 'heart+candles' },                /* the work lamp under the boom tip, over the slurry pit */
    { kind: 'hidden', col: 68, row: 5, prize: 'GOLDEN CANDLE', glint240: true },  /* in the air over the spoil pile */
    { kind: 'skill', col: 206, row: 2, prize: 'hat' }                             /* up the vac tank ladder onto the tank */
  ],
  goldenCandle: { col: 68, row: 5 },
  checkpoint: { col: 127, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 212, row: 11 }             /* the yard gate */
});

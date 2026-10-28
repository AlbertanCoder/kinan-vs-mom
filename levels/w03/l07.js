/* ============================================================
   LEVEL 3-7 · PIPE RACK MAZE  (World 3 · Robin's oilfield · trail stop 8)
   Story bible (World 3 table): "Route through the coloured pipes."
   Lunch time, and Kinan's sandwiches are somewhere past the pipe
   racks: steel racks two and three decks high, carrying pipes all
   over the site. Robin: "Pipes run everywhere out here. We dig
   around them slow and careful. That's my whole job." Glitchy has
   been through here too, and the racks hiss like a giant toy set.
   Idea (ONE): THE RACK DECKS. Every rack has decks you jump up
     through and walk along (the floor lane, the mid deck, the top
     deck). Grey steam pipes are solid: they block a lane or roof it
     over, so you can't always go straight up. Act 1: up through a
     deck, a floor lane that dead-ends at a valve, the high road or
     the low road. Act 2: THE BIG RACK, a switchback (right, up, left,
     up, right) under steam-pipe roofs, a jump between rack tops over
     a 4-wide pit, and the crossover where only the top deck clears
     the big valve. Act 3: the pipe bridge over 5- and 4-wide pits,
     then pits with nothing over them.
   Acts (thirds): 0-80 teach (rack A, rack B and its valve, the stair
     to the high road) · 81-161 twist (THE BIG RACK, rack top to rack
     top over a 4-wide pit, the checkpoint, THE CROSSOVER) · 162-242
     test (THE PIPE BRIDGE over 5- and 4-wide pits, a runway and a
     5-wide pit, the pipe ends, the lunch shack).
   Signature set-piece: THE BIG RACK (S4): the floor lane and the mid
     deck dead-end at its post; the mid deck is roofed by a steam pipe
     except at its right end, the top deck is roofed except at its left
     end. Up, back, up, then out along the very top.
   Secrets: visible = THE LOOKOUT (S3-S4): from the top of the big
     rack, the highest deck runs back LEFT out over the high road to a
     heart (heart + candles, 81,1) · hidden = THE BLEEDER VALVE (S5):
     on the crossover's top deck, walk LEFT to its end; the valve
     there glints (GOLDEN CANDLE, 131,4) · skill = THE PIPE ENDS (S8):
     three short pipe ends sticking out, each two tiles higher than
     the last; jump short, don't run (hat, 214,4).
   Look: borrows the Pipe Rack Maze (theme 16): racks of grey, yellow
     and red pipes across the backdrop, light towers, sandy ground.
     Its bricks are yellow: the insulated gas lines (they crash).
   Bubble beats for ER-4 (not wired): c2 "It's like a giant toy set.
     A toy set that HISSES." · c84 Robin on the radio: "Up and over,
     bud. Never under a live line." · c120 checkpoint, Robin: "Why did
     the pipe go to school? To get a little more INSULATION." · c131
     "That valve is... glinting?" · c239 "Found the sandwiches!"
   ENGINE REQUESTS: coloured pipe skins per lane (red, yellow, grey)
     and rack posts drawn under the decks · steam puffs from the
     valves (a hazard on a beat) · a hand-wheel valve that opens a
     gate somewhere else (switches) · Robin's dad-joke pickup ·
     bubbles ER-4.
   ============================================================ */
KinanLevels.register({
  id: '3-7', world: 3, slot: 8, kind: 'level',
  name: 'PIPE RACK MAZE',
  theme: 16,                /* the Pipe Rack Maze: pipe racks across the backdrop, light towers, sandy ground, yellow bricks */
  cols: 243,
  heights: [
    /* S1 0-26 RACK A: one deck (c8-19) to jump up through */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 RACK B: its floor lane dead-ends at a valve (c41-42); up through the deck · 3-wide pit c46-48 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,
    /* S3 54-80 the stair (c55-57) to THE HIGH ROAD (c58-72) · the low road under it with a 3-wide pit c66-68 */
    192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 THE BIG RACK (c84-97, the switchback) · its top deck out to c103 · 4-wide pit c104-107 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,
    /* S5 108-134 rack 2's top and its steps down · checkpoint · THE CROSSOVER begins (the bleeder valve c131) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 THE CROSSOVER: a 4-wide pit c141-144 under the decks, the big valve (c152, 6 tall) that only the top deck clears */
    192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 THE PIPE BRIDGE (c165-184) over a 5-wide pit c167-171 and a 4-wide pit c178-181 */
    192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,
    /* S8 189-215 a runway, a 5-wide pit c199-203 with nothing over it · THE PIPE ENDS (skill) */
    192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S9 216-242 reward: the lunch shack */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [15, 11, 15, 11],                     /* S1 a pipe stub on the floor */
    [41, 9, 42, 11],                      /* S2 rack B's valve: the floor lane ends here */
    [55, 10, 55, 11], [56, 8, 57, 11],    /* S3 the stair up to the high road */
    [84, 5, 92, 5],                       /* S4 THE BIG RACK: the steam pipe roofing the mid deck (open at its right end) */
    [88, 2, 96, 2],                       /*    the steam pipe roofing the top deck (open at its left end); walk along its top */
    [97, 2, 97, 11],                      /*    the big rack's post: every lane but the very top ends here */
    [114, 5, 115, 11], [116, 8, 117, 11], /* S5 steps down from rack 2 */
    [131, 3, 131, 4],                     /*    THE BLEEDER VALVE at the left end of the crossover's top deck */
    [152, 6, 152, 11],                    /* S6 the big valve (6 tall): only the top deck clears it */
    [175, 6, 175, 7],                     /* S7 a flange on the pipe bridge: hop it */
    [207, 9, 208, 9], [210, 7, 211, 7], [213, 5, 214, 5],  /* S8 THE PIPE ENDS (skill): short, two tiles higher each */
    [206, 11, 206, 11], [217, 11, 217, 11]                 /*    pipe stubs: the mud blob stays under the pipe ends, away from the pit's landing */
  ],
  tiles: {
    gift: [[12, 5, 'popper'], [38, 5], [67, 2], [131, 4, 'gold'], [123, 8], [160, 8, 'heart'], [186, 4], [226, 8], [228, 8], [230, 8]],
    brick: [[11, 5], [13, 5], [122, 8], [124, 8], [185, 4], [187, 4], [227, 8], [229, 8]],   /* insulated gas lines: they crash */
    shelf: [
      /* S1 RACK A */ [8, 8], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [15, 8], [16, 8], [17, 8], [18, 8], [19, 8],
      /* S2 RACK B */ [30, 8], [31, 8], [32, 8], [33, 8], [34, 8], [35, 8], [36, 8], [37, 8], [38, 8], [39, 8], [40, 8], [41, 8], [42, 8], [43, 8], [44, 8], [45, 8],
      /* S3 THE HIGH ROAD */ [58, 5], [59, 5], [60, 5], [61, 5], [62, 5], [63, 5], [64, 5], [65, 5], [66, 5], [67, 5], [68, 5], [69, 5], [70, 5], [71, 5], [72, 5],
      /* S4 THE BIG RACK: mid deck, the open end of the top deck, the open end of the highest deck (and the lookout spur to the left) */
      [84, 8], [85, 8], [86, 8], [87, 8], [88, 8], [89, 8], [90, 8], [91, 8], [92, 8], [93, 8], [94, 8], [95, 8], [96, 8],
      [93, 5], [94, 5], [95, 5], [96, 5],
      [81, 2], [82, 2], [83, 2], [84, 2], [85, 2], [86, 2], [87, 2],
      [98, 2], [99, 2], [100, 2], [101, 2], [102, 2], [103, 2],   /* the top deck runs on past the post */
      /* S5 rack 2's top */ [108, 2], [109, 2], [110, 2], [111, 2], [112, 2], [113, 2],
      /* S6 THE CROSSOVER: the mid deck and the long top deck */
      [136, 8], [137, 8], [138, 8], [139, 8], [140, 8], [141, 8], [142, 8], [143, 8], [144, 8], [145, 8], [146, 8], [147, 8], [148, 8],
      [132, 5], [133, 5], [134, 5], [135, 5], [136, 5], [137, 5], [138, 5], [139, 5], [140, 5], [141, 5], [142, 5], [143, 5], [144, 5], [145, 5],
      [146, 5], [147, 5], [148, 5], [149, 5], [150, 5], [151, 5], [152, 5], [153, 5], [154, 5], [155, 5], [156, 5], [157, 5], [158, 5],
      /* S7 THE PIPE BRIDGE */ [165, 8], [166, 8], [167, 8], [168, 8], [169, 8], [170, 8], [171, 8], [172, 8], [173, 8], [174, 8],
      [175, 8], [176, 8], [177, 8], [178, 8], [179, 8], [180, 8], [181, 8], [182, 8], [183, 8], [184, 8]
    ]
  },
  pipes: [[5, 11], [26, 11], [52, 11], [118, 11], [162, 11], [214, 11]],   /* pipe risers standing out of the ground */
  /* mud blobs split, cones walk, a crow over the pipe ends; nothing walks a roofed deck (you couldn't jump it there)
     and nothing flies where a hit would knock Kinan into a pit */
  foes: [[23, 11, 'cone'],
         [35, 11, 'mud'],
         [72, 11, 'mud'],
         [79, 11, 'cone'], [90, 11, 'mud'],
         [121, 11, 'cone'],
         [138, 11, 'mud'], [142, 7, 'mud'],
         [174, 11, 'cone'], [184, 11, 'mud'], [210, 2, 'crow'],
         [201, 2, 'crow'], [212, 11, 'mud'],
         [233, 11, 'cone']],
  candles: [[3, 11], [4, 11], [9, 7], [10, 7], [16, 7], [17, 7], [18, 7], [20, 11], [21, 11],
            [31, 11], [32, 11], [33, 11], [31, 7], [33, 7], [35, 7], [40, 7], [42, 7], [44, 7], [45, 9], [46, 8], [47, 7], [48, 8], [49, 9],
            [55, 9], [56, 7], [57, 6], [60, 4], [62, 4], [64, 4], [66, 4], [68, 4], [70, 4], [72, 4], [74, 6], [75, 8], [65, 10], [66, 9], [67, 8], [68, 9], [69, 10],
            [85, 7], [87, 7], [89, 7], [91, 7], [93, 7], [95, 6], [95, 4], [93, 4], [91, 4], [89, 4], [87, 4], [85, 4], [85, 1], [87, 1],
            [82, 1], [83, 1], [90, 1], [92, 1], [94, 1], [96, 1], [99, 1], [101, 1], [103, 1], [104, 0], [105, 0], [106, 0], [107, 0],
            [109, 1], [111, 1], [114, 4], [115, 4], [116, 7], [117, 7], [125, 11], [126, 11],
            [137, 7], [139, 7], [133, 4], [135, 4], [140, 9], [141, 8], [142, 8], [143, 8], [144, 9], [146, 4], [148, 4], [150, 4], [152, 4], [154, 4], [156, 4], [158, 4],
            [165, 7], [167, 7], [169, 7], [171, 7], [173, 7], [175, 5], [177, 7], [179, 7], [181, 7], [183, 7], [166, 9], [167, 8], [168, 7], [170, 7], [171, 8], [172, 9],
            [198, 10], [199, 9], [200, 8], [201, 7], [202, 7], [203, 8], [204, 9], [207, 8], [208, 8], [210, 6], [211, 6], [213, 4],
            [220, 11], [221, 11], [227, 7], [229, 7], [236, 11], [237, 11], [238, 11]],
  secrets: [
    { kind: 'visible', col: 81, row: 1, prize: 'heart+candles' },                 /* THE LOOKOUT: back left along the highest deck */
    { kind: 'hidden', col: 131, row: 4, prize: 'GOLDEN CANDLE', glint240: true }, /* THE BLEEDER VALVE: walk left along the crossover's top deck */
    { kind: 'skill', col: 214, row: 4, prize: 'hat' }                             /* THE PIPE ENDS: three short hops */
  ],
  goldenCandle: { col: 131, row: 4 },
  checkpoint: { col: 120, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 239, row: 11 }             /* the lunch shack */
});

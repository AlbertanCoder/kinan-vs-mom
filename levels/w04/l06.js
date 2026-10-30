/* ============================================================
   LEVEL 4-6 · SHAD'S JOB SITE  (World 4 · Edmonton Homecoming · trail stop 7)
   Story bible (World 4 table): "Cranes, scaffolding and girders.
   Shad's building challenge." Downtown, a new tower is going up and
   Shad is on the crew: he builds the wooden forms the concrete gets
   poured into. This is the first time Kinan meets his big brother in
   person, and Shad feels bad that his old console broke. Glitchy got
   into the tower crane: the steel beams are hanging in the air, frozen
   right where the crane was swinging them. Shad's challenge: "Get to
   my lunch table at the far end without touching the ground in the big
   holes. Hard hat ON."
   Idea (ONE): CRANE LOADS. Steel beams hang frozen off the crane's
     hook all over the site: stand on them, hop beam to beam, use them
     as steps. Act 1 hangs them over the footing trench (fall in and you
     just climb out) and over Shad's tool trailer. Act 2: beams lying
     across 4-wide holes as stepping stones, then THE TOWER CRANE: a
     scissor lift up the concrete core, out along the jib and off the
     tip. Act 3: three 5-wide holes in the steel frame, two with a beam
     in them and one without.
   Acts (thirds): 0-80 teach (the trailer and the first beam, THE
     FOOTING TRENCH, a 3-wide hole, the lumber pile and SHAD'S FORM
     WALL) · 81-161 twist (two 4-wide holes with beams in them, the
     checkpoint, THE TOWER CRANE, a 4-wide hole, the rebar and a beam) ·
     162-242 test (THE STEEL FRAME: 5-, 5- and 5-wide holes, THE
     SCAFFOLD TOWER, Shad's lunch table).
   Signature set-piece: THE TOWER CRANE (S5): the concrete core is nine
     tiles tall; the scissor lift in front of it throws Kinan on top,
     the jib runs on from there, high over the site, and a running jump
     off its tip sails over everything.
   Secrets: visible = THE CRANE HOOK (S5-S6): a hook block hangs below
     the jib tip; don't jump at the tip, just walk off it and you land
     on the hook (heart + candles, 137,7) · hidden = SHAD'S LUNCH BOX
     (S3): it got hoisted up over the form wall by mistake; it glints
     in the air above the top of the wall, jump up into it (GOLDEN
     CANDLE, 67,3) · skill = THE SCAFFOLD TOWER (S8): 2-wide planks
     that zigzag right, left, right, three tiles higher each time (hat,
     204,2).
   Look: borrows Shad's Job Site (theme 26): tower cranes and a
     half-built tower on the skyline, safety orange.
   Bubble beats for ER-4 (not wired): c2 Shad: "Kinan?! Little bro! ...
     Sorry about the console, buddy." · c6 "Hard hat ON. Site rules." ·
     c66 Shad: "That's my form wall. Took me all week. Don't... okay,
     you're on it." · c67 "Is that... my LUNCH up there?" · c110
     checkpoint, Shad: "Why did the carpenter quit? He was board." ·
     c116 "The scissor lift goes UP, right?" · c239 Shad: "Lunch is on
     me. Grandma packed it."
   ENGINE REQUESTS: crane cables drawn above the hanging beams and a
     steel-beam skin for those solid rows (today plain ground blocks) ·
     a scissor-lift skin for the spring · the tower crane mast and
     counterweight drawn behind the core · Shad as a sidekick bubble
     (ER-4) · Shad's lunch box pickup (a heal).
   ============================================================ */
KinanLevels.register({
  id: '4-6', world: 4, slot: 7, kind: 'level',
  name: "SHAD'S JOB SITE",
  theme: 26,                /* Shad's Job Site: tower cranes, a half-built tower, safety orange */
  cols: 243,
  heights: [
    /* S1 0-26 the site gate · the lumber pile (c13-15) · Shad's tool trailer (c19-22) · the first beam (c24-26) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 THE FOOTING TRENCH (a BOWL two tiles deep, c30-46) with three beams hanging over it */
    192,192,192,208,224,224,224,224,224,224,224,224,224,224,224,224,224,224,224,208,192,192,192,192,192,192,192,
    /* S3 54-80 a 3-wide hole c57-59 · the lumber pile (c64-65) · SHAD'S FORM WALL (c66-67, 5 tall) */
    192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 a 4-wide hole c85-88 and a 4-wide hole c95-98, each with a beam lying in it */
    192,192,192,192,null,null,null,null,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 checkpoint · the scissor lift (c114-115) · THE CONCRETE CORE (c116-119, 9 tall) · THE JIB (c120-136) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 the hook under the jib tip · a 4-wide hole c148-151 · the rebar (c155-156) and a beam */
    192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 THE STEEL FRAME: a 5-wide hole c166-170 (a beam in it) · a 5-wide hole c177-181 (nothing) */
    192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,
    /* S8 189-215 a 5-wide hole c193-197 (a beam in it) · THE SCAFFOLD TOWER (skill) */
    192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S9 216-242 reward: Shad's lunch table, the site office */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [13, 10, 15, 11],                     /* S1 the lumber pile (2 tall) */
    [19, 9, 22, 11],                      /*    Shad's tool trailer (3 tall) */
    [24, 6, 26, 6],                       /*    the first hanging beam: hop on from the trailer roof */
    [33, 10, 35, 10], [38, 9, 40, 9], [43, 10, 45, 10],   /* S2 three beams over the footing trench */
    [64, 10, 65, 11],                     /* S3 the lumber pile: the step up */
    [66, 7, 67, 11],                      /*    SHAD'S FORM WALL (5 tall) */
    [86, 11, 87, 11], [96, 11, 97, 11],   /* S4 beams lying across the holes: stepping stones */
    [116, 3, 119, 11],                    /* S5 THE CONCRETE CORE (9 tall): only the scissor lift gets you up */
    [155, 9, 156, 11],                    /* S6 a stack of rebar (3 tall) */
    [158, 6, 160, 6],                     /*    a hanging beam */
    [167, 11, 169, 11],                   /* S7 a beam lying in the first steel-frame hole */
    [194, 11, 196, 11]                    /* S8 a beam lying in the third hole */
  ],
  open: [[4, 13, 6, 13], [9, 13, 11, 13]],   /* SLAM SPOTS (butt slam, 2026-10-29): the pockets under the cracked boards, solid floor under them */
  tiles: {
    crack: [[4, 12], [5, 12], [6, 12], [9, 12], [10, 12], [11, 12]],   /* SLAM SPOTS: cracked floorboards over pockets of candles (bonuses, never needed) */
    gift: [[6, 8, 'hat'], [39, 6], [67, 3, 'gold'], [159, 2], [224, 8, 'heart']],   /* the first gift is a hard hat */
    brick: [[5, 8], [7, 8], [38, 6], [40, 6], [158, 2], [160, 2], [223, 8], [225, 8]],
    spring: [[114, 11], [115, 11]],       /* the scissor lift (it shoots up: BOING) */
    shelf: [[120, 3], [121, 3], [122, 3], [123, 3], [124, 3], [125, 3], [126, 3], [127, 3], [128, 3],
            [129, 3], [130, 3], [131, 3], [132, 3], [133, 3], [134, 3], [135, 3], [136, 3],   /* S5 THE JIB */
            [137, 8], [138, 8],           /* S5-S6 THE CRANE HOOK under the jib tip (visible secret) */
            [203, 9], [204, 9], [200, 6], [201, 6], [203, 3], [204, 3]]   /* S8 THE SCAFFOLD TOWER (skill) */
  },
  /* safety cones walk the site, potholes peek out of the gravel, magpies steal shiny things; nothing waits at a hole's lip */
  foes: [[10, 11, 'cone'],
         [50, 11, 'pothole'],
         [75, 11, 'cone'],
         [103, 11, 'cone'], [106, 5, 'magpie'],
         [124, 11, 'hopcone'],
         [158, 3, 'magpie'],
         [185, 11, 'cone'],
         [210, 11, 'cone'], [207, 4, 'magpie'],
         [230, 11, 'pothole'], [234, 5, 'magpie']],
  candles: [[4, 13], [5, 13], [6, 13], [9, 13], [10, 13], [11, 13],[3, 11], [4, 11], [5, 7], [7, 7], [9, 11], [11, 11], [13, 9], [14, 9], [15, 9], [19, 8], [20, 8], [21, 8], [22, 8], [24, 5], [25, 5], [26, 5],
            [28, 11], [29, 11], [33, 9], [34, 9], [35, 9], [36, 8], [37, 7], [38, 8], [39, 8], [40, 8], [41, 7], [42, 8], [43, 9], [44, 9], [45, 9],
            [33, 13], [35, 13], [37, 13], [39, 13], [41, 13], [43, 13], [48, 11], [49, 11],
            [56, 10], [57, 9], [58, 8], [59, 9], [60, 10], [64, 9], [65, 9], [66, 6], [67, 6], [70, 8], [71, 10], [77, 11], [78, 11],
            [84, 10], [85, 9], [86, 8], [87, 8], [88, 9], [89, 10], [86, 10], [87, 10], [91, 11], [92, 11],
            [94, 10], [95, 9], [96, 8], [97, 8], [98, 9], [99, 10], [96, 10], [97, 10], [101, 11], [102, 11],
            [112, 11], [113, 9], [114, 7], [115, 5], [116, 2], [117, 2], [118, 2], [119, 2],
            [121, 2], [123, 2], [125, 2], [127, 2], [129, 2], [131, 2], [133, 2], [135, 2], [138, 7], [122, 11], [126, 11], [130, 11],
            [141, 11], [142, 11], [147, 10], [148, 9], [149, 8], [150, 8], [151, 9], [152, 10], [155, 8], [156, 8], [158, 5], [160, 5], [161, 11],
            [165, 10], [166, 8], [167, 7], [168, 6], [169, 7], [170, 8], [171, 10], [167, 10], [168, 10], [169, 10], [173, 11], [174, 11],
            [176, 10], [177, 8], [178, 7], [179, 6], [180, 7], [181, 8], [182, 10], [186, 11],
            [192, 10], [193, 8], [194, 7], [195, 6], [196, 7], [197, 8], [198, 10], [194, 10], [195, 10], [196, 10],
            [203, 8], [204, 8], [200, 5], [201, 5], [203, 2], [212, 11], [213, 11],
            [219, 11], [220, 11], [223, 7], [225, 7], [228, 11], [229, 11], [236, 11], [237, 11], [238, 11]],
  secrets: [
    { kind: 'visible', col: 137, row: 7, prize: 'heart+candles' },                /* THE CRANE HOOK: walk off the jib tip */
    { kind: 'hidden', col: 67, row: 3, prize: 'GOLDEN CANDLE', glint240: true },  /* SHAD'S LUNCH BOX over the form wall */
    { kind: 'skill', col: 204, row: 2, prize: 'hat' }                             /* THE SCAFFOLD TOWER */
  ],
  goldenCandle: { col: 67, row: 3 },
  checkpoint: { col: 110, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 239, row: 11 }             /* the site office: Shad's lunch table */
});

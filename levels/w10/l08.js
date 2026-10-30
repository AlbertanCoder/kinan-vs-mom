/* ============================================================
   LEVEL 10-8 · THE MIRROR MAZE
   (World 10 · Niagara Falls · trail stop 10)
   Story bible (World 10 table): "Find the way through mirrors." The last
   regular level before the birthday party, and the hardest of the 2D
   worlds so far: Glitchy ran into the fun house on the hill, where every
   wall is a mirror and every mirror shows a way that is not always there.
   Idea (ONE): MIRRORS THAT LIE, WITH HINTS THAT DON'T.
     GOLD ARROWS are real: a gold arrow in the glass shows the way on.
     PALE BLUE ARROWS WITH A RED CROSS are only REFLECTIONS: a lure. Above
     the floor path run DECOY CORRIDORS (ledges with candles, a heart at the
     end of one): they look like the way on, but they only lead round (one
     goes back left, one runs into a glass wall). They are never a dead end
     you can't leave: they are open underneath, so one step off and Kinan is
     back on the floor path. MIRROR WALLS (3 and 4 tiles tall) stand in
     the path: jump them. MIRROR DOORS (World 9's firewall walls, new look
     'mirror') open for a while, flicker a warning for 0.8 s, then shut for a
     while: wait for one to open (a door never traps him: it puts him out on the
     nearer side). Act 2 adds a staircase of GLASS STEPS that fade in and out
     (World 10's neon signs, look 'glass') leading to a high ledge.
     Act 1 teaches it (3/3 pits, the first mirror wall, THE DECOY CORRIDOR
     with the heart, the arrows, the first door, THE SECOND DECOY); act 2
     twists it (3/4/4 pits, a door, THE GLASS STAIR, a door, a mirror wall);
     act 3 tests it (the checkpoint, a door, 5 pit, THREE DOORS IN A ROW at
     c196, c203 and c210, 5 pit, a door, 4 pit, a last door and the exit).
   Acts (thirds): 0-89 teach · 90-179 twist · 180-269 test (the hardest regular level so
     far: nine doors, pits of 5/5/4/4 and more foes; still fair: every
     jump is makeable, every door warns, every decoy is escapable).
   Secrets (new to World 10): visible = THE DECOY'S END (S2): the upper corridor
     that leads back left has a heart at its end; it looks like a trick but
     the heart is real (heart + candles, 27,7) · hidden = THE TWIN (S5): a
     mirror hangs over the path and one block glints under it (Dad says it
     twinkles twice; GOLDEN CANDLE, 178,7) · skill = THE GLASS STAIR (S3):
     four panes of glass light up one after the other like a wave, 2 tiles
     apart, up to the ledge with the hat (hat, 117,2).
   Bonus spots (never needed): KICK BOARDS seal three mirror cabinets (c64-68,
     c140-144, c256-260; 3 candles each; Chenoa says so); SLAM SPOTS: cracked
     boards at c80-82 and c230-232 over pockets of candles (solid floor
     underneath).
   Gaps: act 1 3/3 · act 2 3/4/4 · act 3 5/5/4. A full-run jump off the walls
     and the cabinets comes down on floor (w10-levels.spec.ts checks it).
     No gift or block stands in a landing; no candle sits in a door's column.
   Look: the Mirror Maze (theme 208, World 10's own look): a purple fun-house hall of
     tall mirror panels with sliding glints and ghostly reflections, carnival bunting.
   Jokes: Dad on mirrors (reflecting, crack-ups); Mom laughs once and walks off once.
   ENGINE REQUESTS: none.
   ============================================================ */
(function () {
  const H = [], C = [];
  const at = (c) => { if (H.length !== c) throw new Error('10-8: expected column ' + c + ' but the ground is at ' + H.length); };
  const flat = (v, n) => { for (let i = 0; i < n; i++) H.push(v); };
  const gap = (n) => flat(null, n);
  const top = (c) => Math.floor(Math.min(H[c], c > 0 && H[c - 1] != null ? H[c - 1] : H[c]) / 16) - 1;
  const gl = (c0, c1, up) => { for (let c = c0; c <= c1; c++) if (H[c] != null) C.push([c, top(c) - (up || 0)]); };
  const arc = (c0, c1, base, peak) => { for (let c = c0; c <= c1; c++) { const t = (c - c0) / (c1 - c0); C.push([c, base - Math.round(4 * peak * t * (1 - t))]); } };
  const row = (c0, c1, r, step) => { for (let c = c0; c <= c1; c += step || 1) C.push([c, r]); };

  at(0); flat(192, 14);          /* S1  0-13  the fun-house entrance (spawn c2) */
  at(14); gap(3);                /*     14-16 a 3 pit */
  at(17); flat(192, 33);         /*     17-49 ROOM 1: the first mirror wall (c20-21), THE DECOY CORRIDOR (ledges c26-37) */
  at(50); gap(3);                /* S2  50-52 a 3 pit */
  at(53); flat(192, 37);         /*     53-89 ROOM 2: door D1 (c58), the mirror cabinet (c64-68), THE SECOND DECOY (c73-82), cracked boards c80-82 */
  at(90); gap(3);                /* S3  90-92 a 3 pit (act 2) */
  at(93); flat(192, 26);         /*     93-118 ROOM 3: door D2 (c97), a mirror wall (c102-103), THE GLASS STAIR (c104-117) */
  at(119); gap(4);               /*     119-122 a 4 pit */
  at(123); flat(192, 36);        /* S4  123-158 ROOM 4: door D3 (c127), a mirror wall (c131-132), the mirror cabinet (c140-144) */
  at(159); gap(4);               /*     159-162 a 4 pit */
  at(163); flat(192, 24);        /* S5  163-186 ROOM 5: the checkpoint (c168), a mirror wall (c166-167), door D4 (c172), THE TWIN (c177-179) */
  at(187); gap(5);               /*     187-191 a 5 pit (act 3) */
  at(192); flat(192, 26);        /* S6  192-217 ROOM 6: THREE DOORS IN A ROW (D5 c196, D6 c203, D7 c210), a mirror wall (c200-201) */
  at(218); gap(5);               /*     218-222 a 5 pit */
  at(223); flat(192, 17);        /* S7  223-239 ROOM 7: door D8 (c227), cracked boards c230-232 */
  at(240); gap(4);               /*     240-243 a 4 pit */
  at(244); flat(192, 26);        /* S8  244-269 THE EXIT HALL: door D9 (c248), the mirror cabinet (c256-260), the goal */

  /* ---- candles (none in a door's column: c58, 97, 127, 172, 196, 203, 210, 227, 248) ---- */
  gl(3, 12); arc(13, 17, 11, 3); gl(18, 19); row(20, 21, 8); gl(22, 40);                                       /* S1-S2: the first mirror wall's top */
  C.push([28, 7], [30, 7], [32, 7], [34, 7]); C.push([34, 9], [35, 9]);                                         /* up the decoy corridor (the heart is at 27,7) */
  gl(41, 48); arc(49, 53, 11, 3);
  gl(54, 57); gl(59, 63); row(64, 68, 8); C.push([65, 11], [66, 11], [67, 11]); gl(69, 79); C.push([80, 13], [81, 13], [82, 13]); gl(83, 88); arc(89, 93, 11, 3);   /* S2 */
  C.push([73, 9], [75, 7], [77, 7], [79, 7], [81, 7]);                                                          /* the second decoy corridor */
  gl(94, 96); gl(98, 101); row(102, 103, 8); gl(104, 117); arc(118, 123, 11, 3);                                /* S3 */
  row(104, 105, 9); row(107, 108, 7); row(110, 111, 5); row(113, 114, 3); C.push([116, 2], [118, 2]);          /* up the glass stair, on the hat ledge */
  gl(124, 126); gl(128, 130); row(131, 132, 8); gl(133, 139); row(140, 144, 8); C.push([141, 11], [142, 11], [143, 11]); gl(145, 157); arc(158, 163, 11, 3);   /* S4 */
  gl(164, 165); row(166, 167, 8); gl(168, 171); gl(173, 185); arc(186, 192, 11, 4);                              /* S5 */
  gl(193, 195); gl(197, 199); row(200, 201, 8); gl(202, 202); gl(204, 209); gl(211, 216); arc(217, 223, 11, 4);  /* S6 */
  gl(224, 226); gl(228, 229); C.push([230, 13], [231, 13], [232, 13]); gl(233, 238); arc(239, 244, 11, 3);        /* S7 */
  gl(245, 247); gl(249, 251); gl(252, 255, 2); row(256, 260, 8); C.push([257, 11], [258, 11], [259, 11]); gl(261, 265);   /* S8 */

  KinanLevels.register({
    id: '10-8', world: 10, slot: 10, kind: 'level',
    name: 'THE MIRROR MAZE',
    theme: 208,   /* a purple fun-house hall of tall mirror panels with sliding glints and ghostly reflections, bunting */
    cols: H.length,
    /* MIRROR DOORS (World 9's firewalls, look 'mirror'): [col, rowTop, rowBottom, period, open, phase, look] — a glass wall that is open for `open` frames of every
       `period`, flickers a warning for its last 50 frames, then shuts; shutting never traps Kinan (he is put out on the nearer side) */
    firewalls: [
      [58, 2, 11, 300, 170, 0, 'mirror'],     /* D1  S2 the first door */
      [97, 2, 11, 300, 170, 100, 'mirror'],   /* D2  S3 */
      [127, 2, 11, 280, 150, 40, 'mirror'],   /* D3  S4 */
      [172, 2, 11, 260, 130, 60, 'mirror'],   /* D4  S5 */
      [196, 2, 11, 240, 110, 0, 'mirror'],    /* D5  S6 THREE DOORS IN A ROW: each opens 60 frames after the one before it */
      [203, 2, 11, 240, 110, 180, 'mirror'],  /* D6 */
      [210, 2, 11, 240, 110, 120, 'mirror'],  /* D7 */
      [227, 2, 11, 260, 120, 30, 'mirror'],   /* D8  S7 */
      [248, 2, 11, 280, 140, 90, 'mirror']    /* D9  S8 the last door */
    ],
    /* THE GLASS STAIR (World 10's neon signs, look 'glass'): four panes of glass that fade in and out, each lighting 40 frames after the one below */
    neons: [
      [104, 10, 2, 300, 190, 0, 'glass'], [107, 8, 2, 300, 190, 260, 'glass'], [110, 6, 2, 300, 190, 220, 'glass'], [113, 4, 2, 300, 190, 180, 'glass']
    ],
    skins: [
      ['mirror', 20, 9, 21, 11], ['mirror', 102, 9, 103, 11], ['mirror', 131, 9, 132, 11], ['mirror', 166, 9, 167, 11], ['mirror', 200, 9, 201, 11],   /* the mirror walls (3 tall) */
      ['mirror', 36, 6, 37, 8], ['mirror', 83, 6, 84, 8],          /* the glass walls that close the two decoy corridors */
      ['mirror', 64, 9, 68, 11], ['mirror', 140, 9, 144, 11], ['mirror', 256, 9, 260, 11],   /* the mirror cabinets (kick boards at c68, c144, c260) */
      ['mirror:right', 41, 3, 42, 4], ['mirror:fakeright', 35, 3, 36, 4],      /* room 1: the real arrow, and a reflection over the decoy */
      ['mirror:right', 70, 3, 71, 4], ['mirror:fakeright', 76, 3, 77, 4],      /* room 2 */
      ['mirror:right', 100, 3, 101, 4], ['mirror:right', 129, 3, 130, 4], ['mirror:right', 170, 3, 171, 4],
      ['mirror:right', 193, 3, 194, 4], ['mirror:right', 212, 3, 213, 4], ['mirror:right', 225, 3, 226, 4], ['mirror:right', 250, 3, 251, 4],
      ['mirror', 177, 5, 179, 6]                                              /* THE TWIN: the mirror over the glinting block */
    ],
    heights: H,
    solid: [
      [20, 9, 21, 11], [102, 9, 103, 11], [131, 9, 132, 11], [166, 9, 167, 11], [200, 9, 201, 11],   /* the mirror walls */
      [36, 6, 37, 8], [83, 6, 84, 8],                                   /* the glass walls that close the decoy corridors */
      [64, 9, 68, 11], [140, 9, 144, 11], [256, 9, 260, 11],            /* the mirror cabinets */
      [41, 3, 42, 4], [35, 3, 36, 4], [70, 3, 71, 4], [76, 3, 77, 4],   /* the arrow panels, hung high over the path */
      [100, 3, 101, 4], [129, 3, 130, 4], [170, 3, 171, 4], [193, 3, 194, 4], [212, 3, 213, 4], [225, 3, 226, 4], [250, 3, 251, 4],
      [177, 5, 179, 6]                                                   /* THE TWIN */
    ],
    open: [
      [80, 13, 82, 13], [230, 13, 232, 13],   /* SLAM SPOTS: the pockets under the cracked boards, solid floor under them */
      [65, 11, 67, 11], [141, 11, 143, 11], [257, 11, 259, 11]   /* the cabinets' closets, sealed by a kick board */
    ],
    tiles: {
      crack: [[80, 12], [81, 12], [82, 12], [230, 12], [231, 12], [232, 12]],
      board: [[68, 11], [144, 11], [260, 11]],   /* KICK SPOTS (bonus) */
      gift: [
        [6, 8],              /* S1 */
        [45, 8],             /* S2 */
        [55, 8],             /* S2 */
        [88, 8],             /* S3 */
        [99, 8],             /* S3 */
        [124, 8],            /* S4 */
        [136, 8],            /* S4 */
        [150, 8],            /* S4 */
        [162, 8],            /* S5 */
        [178, 7, 'gold'],    /* S5 THE TWIN: the glinting block under the hanging mirror (hidden) */
        [182, 8],            /* S5 */
        [193, 8],            /* S6 */
        [206, 8],            /* S6 between the second and third door */
        [214, 8],            /* S6 */
        [224, 8],            /* S7 */
        [236, 8],            /* S7 */
        [258, 5],            /* S8 over the last cabinet's roof */
        [252, 8, 'heart'], [254, 8, 'cake']   /* S8 the gift row */
      ],
      brick: [[5, 8], [7, 8], [251, 8], [253, 8]],
      shelf: [
        [34, 10], [35, 10],                                                   /* S2 the decoy corridor's step */
        [26, 8], [27, 8], [28, 8], [29, 8], [30, 8], [31, 8], [32, 8], [33, 8], [34, 8], [35, 8],   /* S2 THE DECOY CORRIDOR: from the step it runs left, over the path, to the heart (glass at c36-37) */
        [73, 10], [74, 10],                                                   /* S2 the second decoy's step */
        [73, 8], [74, 8], [75, 8], [76, 8], [77, 8], [78, 8], [79, 8], [80, 8], [81, 8], [82, 8],   /* S2 THE SECOND DECOY: from the step it runs right, into the glass wall at c83-84 */
        [116, 3], [117, 3], [118, 3]                                          /* S3 THE HAT LEDGE, at the top of the glass stair (skill secret) */
      ]
    },
    /* tourists and fun-house visitors on the path; ghosts (reflections) in the air. Nothing waits at a lip. */
    foes: [
      [9, 11, 'mallwalker'],                          /* S1 */
      [24, 11, 'cart'], [44, 11, 'corndog'],          /* S2 */
      [56, 11, 'mallwalker'], [62, 11, 'drummer'], [74, 5, 'ghost'],   /* S2 */
      [86, 11, 'corndog'],                            /* S3 */
      [95, 11, 'cart'], [100, 11, 'mallwalker'], [116, 11, 'corndog'],   /* S3 */
      [125, 11, 'drummer'], [134, 11, 'mallwalker'], [150, 11, 'cart'], [152, 5, 'ghost'],   /* S4 */
      [164, 11, 'corndog'], [175, 11, 'mallwalker'], [180, 5, 'ghost'],   /* S5 */
      [194, 11, 'cart'], [199, 11, 'drummer'], [206, 11, 'corndog'], [214, 11, 'mallwalker'],   /* S6 */
      [224, 11, 'cart'], [233, 11, 'drummer'], [236, 5, 'ghost'],   /* S7 */
      [246, 11, 'mallwalker'], [254, 11, 'corndog'], [263, 11, 'drummer']   /* S8 */
    ],
    candles: C,
    secrets: [
      { kind: 'visible', col: 27, row: 7, prize: 'heart+candles' },        /* THE DECOY'S END: the heart at the end of the upper corridor that goes back left */
      { kind: 'hidden', col: 178, row: 7, prize: 'GOLDEN CANDLE', glint240: true },   /* THE TWIN: the glinting block under the hanging mirror */
      { kind: 'skill', col: 117, row: 2, prize: 'hat' }                     /* THE GLASS STAIR: ride the wave of glass panes up to the hat ledge */
    ],
    goldenCandle: { col: 178, row: 7 },
    checkpoint: { col: 168, row: 11 },
    spawn: { col: 2, row: 11 },
    goal: { col: 266, row: 11 },   /* the fun house's way out */
    talk: [
      [2, 'KINAN', "The Mirror Maze! Mirrors everywhere... and Glitchy's reflection is running along every one of them!", 4.2],
      [3, 'DAD', "Oh no, bud, I'm seeing double. Two of me! That's twice the jokes!", 3.2],
      [4, 'MOM', "Careful, sweetie. In here, gold arrows are real. A pale blue arrow with a red cross is only a reflection.", 4.2],
      [14, 'CHENOA', "That mirror wall is three tiles tall. Jump up and over it, little bro!", 3.4],
      [24, 'CHENOA', "That path up there has candles, but the arrow over it is only a reflection. You can always step back down.", 4.4],
      [45, 'DAD', "Why did the mirror get such great grades? Because it was always... hee... always reflecting on... HA... on its... I can't—", 4.8, 'wheeze'],
      [45, 'SHAD', "...on its mistakes. Dad. Reflecting on its mistakes.", 3],
      [45, 'MOM', "Ha! Reflecting! Oh, go on, sweetie, before I laugh again.", 3, 'laugh'],
      [54, 'SHAD', "That glass door opens for a while, flickers, and then shuts. Wait for it, then go. It never traps you.", 4],
      [62, 'CHENOA', "A wooden board on that mirror cabinet! Stand next to it and press KICK.", 3.4],
      [94, 'DAD', "Those glass steps light up one after the other, bud. A wave of mirrors! Hop up with it.", 3.8],
      [120, 'DAD', "What do you call a mirror that tells jokes? A real crack-up!", 3.2],
      [120, 'MOM', "Is that all you do, tell jokes? I am going to stand in front of the quiet mirror. Alone.", 3.6, 'walkoff'],
      [120, 'DAD', "...I'll be here all week! Seven years' bad luck, though.", 3.2],
      [166, 'DAD', "That mirror hanging over the path is twinkling, bud. It's twinkling twice! Jump up under it.", 3.8],
      [190, 'SHAD', "The hardest part, little bro. Three glass doors in a row, and wide pits. Take your time. The doors never trap you.", 4.8],
      [240, 'KINAN', "We're almost through the maze! Glitchy's heading out toward the big party at the Falls...", 3.8]
    ]
  });
})();

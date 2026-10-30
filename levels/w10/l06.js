/* ============================================================
   LEVEL 10-6 · THE WHIRLPOOL CABLE CAR
   (World 10 · Niagara Falls · trail stop 7)
   Story bible (World 10 table): "Swing high over the whirlpool. Secret
   exit off the cable car, leading to 10-secret." Glitchy hopped into the
   open cable car that crosses the Niagara gorge where the river turns
   in a giant circle, the whirlpool, far below. The family follows along
   the cliff top, station by station.
   Idea (ONE): CABLE CARS (World 9's `rollers`, new look 'cablecar'): an
     open red cable car hangs from a trolley on its wire and drifts to and
     fro across each chasm; its floor is the platform. Stand in it and it
     carries Kinan across. Every chasm is still inside the Playbook's widths
     (a running jump clears it), so a car is a bridge for the careful and
     a full-run jump is the way across for everyone else. Eight chasms
     with eight cars, each car a little faster than the one before; the
     last 3 chasms get wider.
     Act 1 teaches it (3/3 chasms, THE STATION, THE OVERLOOK, a hill);
     act 2 twists it (3/4 chasms, THE HIGH WIRE: a pad on the cliff throws
     Kinan up to a ledge, a second cable car hangs on its own wire up high
     and carries him across a gap to a far ledge; 4); act 3 tests it
     (the checkpoint, 5/5/4 chasms with faster cars).
   Acts (thirds): 0-89 teach (3, the station and its shed, THE OVERLOOK, 3,
     THE HILL) · 90-179 twist (3, 4, THE HIGH WIRE section on a long cliff,
     4) · 180-269 test (the checkpoint, 5, 5, 4, the last station).
   Secrets (new to World 10): visible = THE OVERLOOK (S2): a shelf over the
     station 4 tiles up, a full jump (heart + candles, 35,7) · skill = THE
     PERCH (S5): the cliff's pad throws Kinan 9 tiles up toward a floating rock
     ledge: run onto the pad and steer (hat, 128,3) · hidden = THE HIGH WIRE
     (S6): ride the high cable car from the perch across the 9 gap to the far
     ledge; the block above it glints: bump it and a SECRET DOOR opens on the
     ledge: walk in (GOLDEN CANDLE, 144,2; SECRET EXIT to 10-secret, the
     Fireworks Barge).
   Bonus spots (never needed): KICK BOARDS seal three station sheds (c20-24,
     c150-154, c246-250; 3 candles each; Chenoa says so); SLAM SPOTS: cracked
     boards at c56-58 and c200-202 over pockets of candles (solid floor
     underneath).
   Gaps: act 1 3/3 · act 2 3/4/4 · act 3 5/5/4. Everything on the high wire
     floats over solid floor (no pit), so a fall costs only the climb; the
     rock ledges are well over a normal jump's reach (bottom at 96 px, the
     highest a jump's head goes is 107) so no jump on the main floor is
     blocked. A full-run jump off the sheds and both ledges comes down on
     floor (w10-levels.spec.ts checks it).
   Look: the Whirlpool (theme 206, World 10's own look): a deep green gorge, forested
     cliffs, the whirlpool swirling far below, cable wires, red towers, a hawk.
   Jokes: Dad on the whirlpool and going in circles (the wheeze, a walk-off).
   ENGINE REQUESTS: none.
   ============================================================ */
(function () {
  const H = [], C = [];
  const at = (c) => { if (H.length !== c) throw new Error('10-6: expected column ' + c + ' but the ground is at ' + H.length); };
  const flat = (v, n) => { for (let i = 0; i < n; i++) H.push(v); };
  const gap = (n) => flat(null, n);
  const to = (v) => { let c = H[H.length - 1]; const s = v > c ? 8 : -8; while (c !== v) { c += s; H.push(c); } };
  const top = (c) => Math.floor(Math.min(H[c], c > 0 && H[c - 1] != null ? H[c - 1] : H[c]) / 16) - 1;
  const gl = (c0, c1, up) => { for (let c = c0; c <= c1; c++) if (H[c] != null) C.push([c, top(c) - (up || 0)]); };
  const arc = (c0, c1, base, peak) => { for (let c = c0; c <= c1; c++) { const t = (c - c0) / (c1 - c0); C.push([c, base - Math.round(4 * peak * t * (1 - t))]); } };
  const row = (c0, c1, r, step) => { for (let c = c0; c <= c1; c += step || 1) C.push([c, r]); };

  at(0); flat(192, 14);          /* S1  0-13  the cliff path (spawn c2) */
  at(14); gap(3);                /*     14-16 a 3 chasm: cable car C1 */
  at(17); flat(192, 31);         /*     17-47 THE STATION: the shed (c20-24, 22 tiles of runway), THE OVERLOOK (c34-37) */
  at(48); gap(3);                /* S2  48-50 a 3 chasm: C2 */
  at(51); flat(192, 12);         /*     51-62 (cracked boards c56-58) */
  at(63); to(176);               /* S3  63-64 up THE HILL */
  at(65); flat(176, 16);         /*     65-80 the hill's terrace */
  at(81); to(192);               /*     81-82 down */
  at(83); flat(192, 11);         /* S4  83-93 */
  at(94); gap(3);                /*     94-96 a 3 chasm: C3 (act 2) */
  at(97); flat(192, 12);         /*     97-108 */
  at(109); gap(4);               /*     109-112 a 4 chasm: C4 */
  at(113); flat(192, 55);        /* S5  113-167 the long cliff of THE HIGH WIRE: the pad (c120-121), the perch (c126-131, row 4), the high car (row 4), the far ledge (c142-147), a shed (c150-154) */
  at(168); gap(4);               /* S7  168-171 a 4 chasm: C5 */
  at(172); flat(192, 18);        /*     172-189 the checkpoint (c176) before the test */
  at(190); gap(5);               /* S8  190-194 a 5 chasm: C6 (act 3) */
  at(195); flat(192, 20);        /*     195-214 (cracked boards c200-202) */
  at(215); gap(5);               /*     215-219 a 5 chasm: C7 */
  at(220); flat(192, 16);        /* S9  220-235 */
  at(236); gap(4);               /*     236-239 a 4 chasm: C8 */
  at(240); flat(192, 30);        /* S10 240-269 the last station (shed c246-250), the gift row, the goal */

  /* ---- candles ---- */
  gl(3, 12); arc(13, 17, 11, 3); gl(18, 19); row(20, 24, 8); C.push([21, 11], [22, 11], [23, 11]); gl(25, 33); row(34, 37, 6); C.push([34, 7], [36, 7]); gl(38, 46); arc(47, 51, 11, 3);   /* S1-S2 */
  gl(52, 55); C.push([56, 13], [57, 13], [58, 13]); gl(59, 83); gl(84, 92); arc(93, 97, 11, 3);                              /* S3-S4: the hill */
  gl(98, 107); arc(108, 113, 11, 3);                                                                                          /* S5 */
  gl(114, 119); C.push([122, 6], [123, 5], [124, 4], [125, 3]); C.push([126, 3], [127, 3], [129, 3], [130, 3], [131, 3]); row(132, 141, 3, 2); C.push([142, 3], [145, 3], [146, 3], [147, 3]);   /* THE HIGH WIRE: up the pad's arc, the perch, over the car, the far ledge */
  gl(125, 125); gl(130, 149); row(150, 154, 8); C.push([151, 11], [152, 11], [153, 11]); gl(155, 166); arc(167, 172, 11, 3);   /* the floor beneath, the shed */
  gl(173, 188); arc(189, 195, 11, 4); gl(196, 199); C.push([200, 13], [201, 13], [202, 13]); gl(203, 213); arc(214, 220, 11, 4);   /* S7-S9 */
  gl(221, 234); arc(235, 240, 11, 3); gl(241, 245); row(246, 250, 8); C.push([247, 11], [248, 11], [249, 11]); gl(251, 254); gl(255, 259, 2); gl(260, 265);   /* S10 */

  KinanLevels.register({
    id: '10-6', world: 10, slot: 7, kind: 'level',
    name: 'THE WHIRLPOOL CABLE CAR',
    theme: 206,   /* a deep green gorge, forested cliffs, the whirlpool far below, cable wires, red towers, a hawk */
    cols: H.length,
    /* CABLE CARS (World 9's rollers, look 'cablecar'): [c0, c1, row, w, speed, look] — an open car on its wire that drifts between two columns */
    rollers: [
      [14, 16, 12, 2, 0.4, 'cablecar'], [48, 50, 12, 2, 0.45, 'cablecar'], [94, 96, 12, 2, 0.5, 'cablecar'],
      [109, 112, 12, 2, 0.5, 'cablecar'], [168, 171, 12, 2, 0.55, 'cablecar'], [190, 194, 12, 2, 0.6, 'cablecar'],
      [215, 219, 12, 3, 0.65, 'cablecar'], [236, 239, 12, 2, 0.6, 'cablecar'],
      [132, 141, 4, 3, 0.7, 'cablecar']   /* THE HIGH WIRE: its own car, 8 tiles over the floor, between the perch and the far ledge */
    ],
    skins: [
      ['tower', 20, 9, 24, 11], ['tower', 150, 9, 154, 11], ['tower', 246, 9, 250, 11],   /* the station sheds (kick boards at c24, c154, c250) */
      ['granite', 126, 4, 131, 5], ['granite', 142, 4, 147, 5]                              /* THE PERCH and the far ledge: floating rock */
    ],
    heights: H,
    solid: [
      [20, 9, 24, 11], [150, 9, 154, 11], [246, 9, 250, 11],   /* the station sheds */
      [126, 4, 131, 5],    /* S5 THE PERCH: floating rock, top y=64 (its bottom y=96: a jump's head never goes above 107) */
      [142, 4, 147, 5]     /* S6 the far ledge, the secret exit's floor */
    ],
    open: [
      [56, 13, 58, 13], [200, 13, 202, 13],   /* SLAM SPOTS: the pockets under the cracked boards, solid floor under them */
      [21, 11, 23, 11], [151, 11, 153, 11], [247, 11, 249, 11]   /* the sheds' closets, sealed by a kick board */
    ],
    tiles: {
      crack: [[56, 12], [57, 12], [58, 12], [200, 12], [201, 12], [202, 12]],
      board: [[24, 11], [154, 11], [250, 11]],   /* KICK SPOTS (bonus) */
      gift: [
        [6, 8],              /* S1 */
        [22, 5],             /* S2 over the shed's roof */
        [30, 8],             /* S2 */
        [44, 8],             /* S2 */
        [55, 8],             /* S3 */
        [68, 7],             /* S3 on the hill's terrace (floor 176) */
        [76, 7],             /* S3 */
        [88, 8],             /* S4 */
        [100, 8],            /* S5 */
        [116, 8],            /* S5, clear of the pad's arc */
        [144, 2, 'gold'],    /* S6 THE HIGH WIRE: the glinting block over the far ledge (hidden; the secret exit) */
        [152, 5],            /* S6 over the second shed's roof */
        [166, 8],            /* S6, clear of the shed roof's landing (a jump off it comes down around c155-163) */
        [178, 8],            /* S7 */
        [208, 8],            /* S8 */
        [228, 8],            /* S9 */
        [256, 8, 'heart'], [258, 8, 'cake']   /* S10 the gift row */
      ],
      brick: [[5, 8], [7, 8], [255, 8], [257, 8], [259, 8]],
      spring: [[120, 12], [121, 12]],   /* S5 THE PAD: flush in the floor; it throws Kinan 9 tiles up toward the perch */
      shelf: [
        [34, 8], [35, 8], [36, 8], [37, 8]   /* S2 THE OVERLOOK (visible secret) */
      ]
    },
    /* tourists, street food and buskers on the cliff path; seagulls and camera drones over the gorge. Nothing waits at a lip. */
    foes: [
      [9, 11, 'mallwalker'],                          /* S1 */
      [30, 11, 'cart'], [44, 11, 'corndog'],          /* S2 */
      [56, 11, 'mallwalker'], [70, 10, 'drummer'], [78, 10, 'cart'],   /* S3 */
      [88, 11, 'corndog'],                            /* S4 */
      [99, 11, 'mallwalker'], [104, 5, 'seagull'],    /* S5 */
      [115, 11, 'corndog'],                           /* S5 */
      [136, 11, 'drummer'], [158, 11, 'mallwalker'], [163, 5, 'camera'],   /* S6 */
      [176, 11, 'corndog'], [184, 11, 'cart'],        /* S7 */
      [198, 11, 'mallwalker'], [206, 11, 'drummer'], [210, 5, 'seagull'],   /* S8 */
      [224, 11, 'corndog'], [230, 11, 'cart'],        /* S9 */
      [244, 11, 'mallwalker'], [256, 11, 'corndog'], [262, 11, 'drummer']   /* S10 */
    ],
    candles: C,
    secrets: [
      { kind: 'visible', col: 35, row: 7, prize: 'heart+candles' },        /* THE OVERLOOK: a full jump up onto the shelf over the station */
      { kind: 'hidden', col: 144, row: 2, prize: 'GOLDEN CANDLE', glint240: true, exit: '10-secret' },   /* THE HIGH WIRE: the glinting block over the far ledge; a door opens on it */
      { kind: 'skill', col: 128, row: 3, prize: 'hat' }                     /* THE PERCH: steer the pad's bounce onto the floating ledge */
    ],
    goldenCandle: { col: 144, row: 2 },
    checkpoint: { col: 176, row: 11 },
    spawn: { col: 2, row: 11 },
    goal: { col: 266, row: 11 },   /* the last cable car station */
    talk: [
      [2, 'KINAN', "The Whirlpool! The river turns round and round way down there. And Glitchy just hopped into a cable car!", 4.4],
      [3, 'DAD', "Why did the whirlpool break up with the river? It just kept going in circles, bud. I'm not dizzy. I'm just spun out!", 4.6],
      [4, 'MOM', "The cable cars are open to the air, sweetie. Hold on tight. It's a long way down.", 3.6],
      [19, 'CHENOA', "Step into the cable car and it carries you across. Or take a running jump. Your choice, little bro!", 3.8],
      [30, 'DAD', "Why did the cable car win a gold star? Because it was always... hee... always hanging in... HA... I can't—", 4.4, 'wheeze'],
      [30, 'KINAN', "...hanging in there. Dad, that wasn't even funny.", 3],
      [30, 'MOM', "Ha! Hanging in there! Okay, that one was a little funny. Go on, sweetie.", 3.4, 'laugh'],
      [32, 'CHENOA', "That ledge over the station is high! Hold JUMP all the way up. There's a heart up there.", 3.8],
      [66, 'CHENOA', "A wooden board on that shed! Stand next to it and press KICK. Candles inside.", 3.6],
      [112, 'SHAD', "A pad on the cliff, and a cable car on its own wire way up high! Run onto the pad and steer for the floating ledge.", 4.6],
      [136, 'DAD', "Look at that, bud. A cable car on its own wire. It's really hanging out up there!", 3.6],
      [172, 'DAD', "I tried a joke on the cable car, but it went right over everyone's heads!", 3.4],
      [172, 'MOM', "Is that all you do, tell jokes? I am taking the other cable car. Alone.", 3.4, 'walkoff'],
      [172, 'DAD', "...I'll be here all week! Well, till the wire runs out.", 3],
      [190, 'SHAD', "Longer chasms now, and the cars are faster. Take a running jump, or ride, little bro.", 3.6],
      [240, 'KINAN', "The last station! Glitchy is racing off toward the flower gardens!", 3.4]
    ]
  });
})();

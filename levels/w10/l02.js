/* ============================================================
   LEVEL 10-2 · THE BOAT UNDER THE FALLS
   (World 10 · Niagara Falls · trail stop 2)
   Story bible (World 10 table): "Ride the tour boat into the spray."
   The family boards the tour boat docks along the gorge, toward the
   Horseshoe Falls. Mom: "if you are ready, ride the boats across."
   Glitchy races ahead along the docks.
   Idea (ONE): BOATS AND THE FALLS' SPRAY. Little tour boats (World 7's
     `boats`, new look 'tour') drift to and fro across the channels: hop
     on, ride, hop off. In the spray zones (World 7's `wind`, opt-in
     `spray: true` makes its cue the falls' spray) a gust pushes Kinan
     back, weaker in the air, never past a slow walk and never off a ledge
     he stands on. Every gust is warned for 1 s: a white mist bank rises on
     the right of the picture, droplets fly, "SPRAY!" flashes, a whoosh and
     a toast. Boats are real rides (a 2-tile boat in a 4- or 5-tile
     channel moves 2 to 3 tiles) and every channel is still inside the
     Playbook's widths, so a boat is a bridge for the careful and a
     full-run jump is the way across for everyone else.
     Act 1 teaches it (three 3-tile channels with boats, the TOUR BOAT at
     its dock, a calm spray zone on dry dock); act 2 twists it (4/4/3/4
     channels, the gusts blow over the boats and the gaps); act 3 tests
     it (5/5 channels, no spray there, then a 4 channel in the spray).
   Acts (thirds): 0-89 teach (3, THE TOUR BOAT, 3, the boathouse, 3, the
     calm spray, THE PIER) · 90-179 twist (4, 4, 3, 4) · 180-269 test (the
     checkpoint, 5, THE SKY FERRY, 5, 4 in the spray, the boat shed).
   Secrets (new to World 10): visible = THE WHEELHOUSE (S2): climb the tour
     boat's three decks (hull, upper deck, wheelhouse roof) to a heart
     (heart + candles, 24,4) · hidden = THE LIFEBUOY (S3): a hidden block
     glints above the boathouse roof, over the lifebuoy on its wall (Dad
     says it looks fishy; GOLDEN CANDLE, 50,6) · skill = THE SKY FERRY
     (S8): a spring by the dock throws Kinan up to a high ledge; a little
     lifeboat on its davit shuttles across the gap to a far ledge and its hat
     (hat, 219,5).
   Bonus spots (never needed): KICK BOARDS seal three closets of candles
     (the boathouse c48-52, the pier shed c87-91, the boat shed c246-250);
     SLAM SPOTS: cracked boards at c110-112 and c235-237 over pockets of
     candles (solid floor underneath).
   Gaps: act 1 3/3/3 · act 2 4/4/3/4 · act 3 5/5/4. Spray zones hold gaps of
     4 at most; the 5-wide channels are outside them. A full-run jump off the
     boathouse, the pier shed and the tour boat comes down on floor
     (w10-levels.spec.ts checks it).
   Look: the Boat Under the Falls (theme 201, World 10's own look): the
     Horseshoe Falls straight ahead, a wall of mist, a rainbow, gulls, the
     green river.
   Jokes: Dad on the spray, the boat and the Falls; Mom walks off once.
   ENGINE REQUESTS: none.
   ============================================================ */
(function () {
  const H = [], C = [];
  const at = (c) => { if (H.length !== c) throw new Error('10-2: expected column ' + c + ' but the ground is at ' + H.length); };
  const flat = (v, n) => { for (let i = 0; i < n; i++) H.push(v); };
  const gap = (n) => flat(null, n);
  const to = (v) => { let c = H[H.length - 1]; const s = v > c ? 8 : -8; while (c !== v) { c += s; H.push(c); } };
  const top = (c) => Math.floor(Math.min(H[c], c > 0 && H[c - 1] != null ? H[c - 1] : H[c]) / 16) - 1;
  const gl = (c0, c1, up) => { for (let c = c0; c <= c1; c++) if (H[c] != null) C.push([c, top(c) - (up || 0)]); };
  const arc = (c0, c1, base, peak) => { for (let c = c0; c <= c1; c++) { const t = (c - c0) / (c1 - c0); C.push([c, base - Math.round(4 * peak * t * (1 - t))]); } };
  const row = (c0, c1, r) => { for (let c = c0; c <= c1; c++) C.push([c, r]); };

  at(0); flat(192, 12);          /* S1  0-11  the dock (spawn c2) */
  at(12); gap(3);                /*     12-14 a 3 channel: boat B1 */
  at(15); flat(192, 25);         /*     15-39 THE TOUR BOAT at its dock (hull c18-28), 11 tiles of runway after it */
  at(40); gap(3);                /* S2  40-42 a 3 channel: B2 */
  at(43); flat(192, 23);         /*     43-65 THE BOATHOUSE (c48-52), 13 tiles of runway */
  at(66); gap(3);                /* S3  66-68 a 3 channel: B3 */
  at(69); flat(192, 14);         /*     69-82 the calm spray zone (c70-82: no holes) */
  at(83); to(176);               /* S4  83-84 up to THE PIER */
  at(85); flat(176, 10);         /*     85-94 the pier shed (c87-91) */
  at(95); to(192);               /*     95-96 down again */
  at(97); flat(192, 7);          /*     97-103 */
  at(104); gap(4);               /* S5  104-107 a 4 channel: B4 (act 2, spray) */
  at(108); flat(192, 18);        /*     108-125 (cracked boards c110-112) */
  at(126); gap(4);               /*     126-129 a 4 channel: B5 (spray) */
  at(130); flat(192, 20);        /* S6  130-149 */
  at(150); gap(3);               /*     150-152 a 3 channel: B6 */
  at(153); flat(192, 14);        /*     153-166 */
  at(167); gap(4);               /* S7  167-170 a 4 channel: B7 (spray) */
  at(171); flat(192, 25);        /*     171-195 the checkpoint (c184) before the test */
  at(196); gap(5);               /* S8  196-200 a 5 channel: B8 (act 3, no spray) */
  at(201); flat(192, 21);        /*     201-221 THE SKY FERRY (spring c205, ledges c208-210 and c218-220, lifeboat c211-217) */
  at(222); gap(5);               /* S9  222-226 a 5 channel: B9 */
  at(227); flat(192, 13);        /*     227-239 (cracked boards c235-237) */
  at(240); gap(4);               /*     240-243 a 4 channel in the spray: B10 */
  at(244); flat(192, 26);        /* S10 244-269 the boat shed, the gift row, the goal */

  /* ---- candles ---- */
  gl(3, 10); arc(11, 15, 11, 3); gl(16, 17); row(18, 28, 9); row(21, 25, 7); C.push([23, 4], [25, 4]);   /* S1-S2: over the tour boat's decks */
  gl(29, 38); arc(39, 43, 11, 3);                                                   /* S2: the 3 channel */
  row(48, 52, 8); C.push([49, 11], [50, 11], [51, 11]); gl(44, 47); gl(53, 64); arc(65, 69, 11, 3);   /* S3: the boathouse, its closet */
  gl(70, 82); gl(83, 86); row(87, 91, 8); C.push([88, 10], [89, 10], [90, 10]); gl(92, 102); arc(103, 108, 11, 3);   /* S4: the pier and its shed */
  gl(109, 109); C.push([110, 13], [111, 13], [112, 13]); gl(113, 124); arc(125, 130, 11, 3);   /* S5 */
  gl(131, 148); arc(149, 153, 11, 3); gl(154, 165); arc(166, 171, 11, 3);          /* S6-S7 */
  gl(172, 194); arc(195, 201, 11, 4); gl(202, 204); row(208, 210, 5); row(211, 217, 5); C.push([218, 5], [220, 5]);   /* S8: and over THE SKY FERRY */
  gl(206, 207); gl(211, 220); arc(221, 227, 11, 4);                                  /* S9 */
  gl(228, 234); C.push([235, 13], [236, 13], [237, 13]); gl(238, 238); arc(239, 244, 11, 3);
  gl(245, 245); row(246, 250, 8); C.push([247, 11], [248, 11], [249, 11]); gl(251, 252); gl(253, 258, 2); gl(261, 265);   /* S10 */

  KinanLevels.register({
    id: '10-2', world: 10, slot: 2, kind: 'level',
    name: 'THE BOAT UNDER THE FALLS',
    theme: 201,   /* the Horseshoe Falls ahead, a wall of mist, a rainbow, gulls, the green river */
    cols: H.length,
    spray: true,   /* World 10: the wind's warning and gusts are the falls' SPRAY (mist and droplets) */
    /* SPRAY ZONES (World 7's wind, opt-in): gusts push Kinan back; 1 s of warning first. The 5-wide channels are outside the zones. */
    wind: [[70, 82], [97, 135], [160, 179], [186, 195], [233, 262]],
    /* BOATS (World 7, new look in World 10): [c0, c1, row, w, speed, look] — the channel the boat drifts across, the row of its deck, its width in tiles */
    boats: [
      [12, 14, 12, 2, 0.4, 'tour'], [40, 42, 12, 2, 0.45, 'tour'], [66, 68, 12, 2, 0.5, 'tour'],
      [104, 107, 12, 2, 0.5, 'tour'], [126, 129, 12, 2, 0.55, 'tour'], [150, 152, 12, 2, 0.55, 'tour'], [167, 170, 12, 2, 0.6, 'tour'],
      [196, 200, 12, 2, 0.6, 'tour'], [222, 226, 12, 3, 0.65, 'tour'], [240, 243, 12, 2, 0.6, 'tour'],
      [211, 217, 6, 2, 0.5, 'lifeboat']   /* THE SKY FERRY: the lifeboat on its davit, between the two high ledges */
    ],
    skins: [
      ['tourboat', 18, 10, 28, 11],   /* THE TOUR BOAT at its dock */
      ['boathouse', 48, 9, 52, 11],   /* THE BOATHOUSE (kick board at c52) */
      ['boathouse', 87, 9, 91, 10],   /* the pier shed (kick board at c91) */
      ['boathouse', 246, 9, 250, 11]  /* the boat shed (kick board at c250) */
    ],
    heights: H,
    solid: [
      [18, 10, 28, 11],   /* S1 THE TOUR BOAT's hull */
      [48, 9, 52, 11],    /* S3 the boathouse */
      [87, 9, 91, 10],    /* S4 the pier shed */
      [246, 9, 250, 11]   /* S10 the boat shed */
    ],
    open: [
      [110, 13, 112, 13], [235, 13, 237, 13],   /* SLAM SPOTS: the pockets under the cracked boards, solid floor under them */
      [49, 11, 51, 11], [88, 10, 90, 10], [247, 11, 249, 11]   /* the closets, sealed by a kick board */
    ],
    tiles: {
      crack: [[110, 12], [111, 12], [112, 12], [235, 12], [236, 12], [237, 12]],
      board: [[52, 11], [91, 10], [250, 11]],   /* KICK SPOTS (bonus) */
      gift: [
        [6, 8],              /* S1 */
        [34, 8],             /* S2 */
        [46, 8],             /* S3 */
        [50, 6, 'gold'],     /* S3 THE LIFEBUOY: the glinting block (hidden) */
        [75, 8],             /* S4 */
        [89, 5, 'candle'],   /* S4 over the pier shed */
        [115, 8],            /* S5 */
        [140, 8],            /* S6 */
        [176, 8],            /* S7 */
        [202, 8],            /* S8 */
        [230, 8],            /* S9 */
        [254, 8, 'heart'], [256, 8, 'cake']   /* S10 the gift row */
      ],
      brick: [[5, 8], [7, 8], [141, 8], [253, 8], [255, 8], [257, 8]],
      spring: [[205, 11], [260, 11]],   /* c205: THE SKY FERRY's spring */
      shelf: [
        [21, 8], [22, 8], [23, 8], [24, 8], [25, 8],   /* S1 the upper deck */
        [23, 5], [24, 5], [25, 5],                      /* S1 THE WHEELHOUSE roof (visible secret) */
        [208, 6], [209, 6], [210, 6],                   /* S8 the high ledge of the sky ferry */
        [218, 6], [219, 6], [220, 6]                    /* S8 the far ledge (skill secret) */
      ]
    },
    /* tourists, street food, buskers and seagulls over the water. Nothing waits at a lip. */
    foes: [
      [8, 11, 'mallwalker'],                          /* S1 */
      [36, 11, 'cart'], [46, 11, 'corndog'],          /* S2 */
      [58, 11, 'mallwalker'], [74, 11, 'drummer'],    /* S3 */
      [93, 10, 'cart'], [100, 11, 'corndog'],         /* S4 */
      [105, 6, 'seagull'], [115, 11, 'mallwalker'],   /* S5 */
      [121, 5, 'seagull'], [133, 11, 'drummer'],      /* S5 */
      [140, 11, 'corndog'], [146, 5, 'seagull'],      /* S6 */
      [158, 11, 'cart'], [164, 11, 'mallwalker'],     /* S6-S7 */
      [169, 5, 'seagull'], [178, 11, 'drummer'],      /* S7 */
      [188, 11, 'cart'], [198, 5, 'camera'],          /* S8 */
      [203, 11, 'mallwalker'], [214, 11, 'corndog'],  /* S8 */
      [224, 5, 'seagull'], [230, 11, 'drummer'],      /* S9 */
      [242, 5, 'seagull'], [255, 11, 'mallwalker'], [262, 11, 'corndog']   /* S9-S10 */
    ],
    candles: C,
    secrets: [
      { kind: 'visible', col: 24, row: 4, prize: 'heart+candles' },        /* THE WHEELHOUSE: up the tour boat's three decks */
      { kind: 'hidden', col: 50, row: 6, prize: 'GOLDEN CANDLE', glint240: true },   /* THE LIFEBUOY: a hidden block glints over the boathouse roof */
      { kind: 'skill', col: 219, row: 5, prize: 'hat' }                     /* THE SKY FERRY: spring up, ride the lifeboat across */
    ],
    goldenCandle: { col: 50, row: 6 },
    checkpoint: { col: 184, row: 11 },
    spawn: { col: 2, row: 11 },
    goal: { col: 266, row: 11 },   /* the end of the last dock */
    talk: [
      [2, 'KINAN', "The tour boat! We're sailing right up to the Horseshoe Falls. Look at that mist... and Glitchy is racing along the docks!", 4.8],
      [3, 'DAD', "Welcome aboard, bud! Lovely day for it. I'm a little boat-tered by the spray already!", 3.6],
      [4, 'MOM', "Still not sure about this, Kinan. Ride the boats across the water, and mind the spray.", 3.6],
      [17, 'CHENOA', "The big tour boat is tied up here. Climb up to its top deck, little bro!", 3.4],
      [36, 'DAD', "Why did the tour boat win a prize? Because it made such a big... hee... such a big SPLASH... I can't—", 4.4, 'wheeze'],
      [36, 'CHENOA', "...splash. Dad, I am sitting right here.", 2.8],
      [45, 'DAD', "See the lifebuoy on that boathouse, bud? It looks fishy. Something might be hiding up on the roof!", 3.8],
      [70, 'SHAD', "Before each gust the white mist rises on the right. Wait for it to pass, little bro.", 3.6],
      [85, 'CHENOA', "A wooden board on the pier shed! Stand next to it and press KICK.", 3.4],
      [100, 'DAD', "Why are waterfalls so polite? They always say pardon the spray!", 3],
      [100, 'MOM', "Is that all you do, tell jokes? I am going to sit where it's dry. Alone.", 3.4, 'walkoff'],
      [100, 'DAD', "...I'll be here all week! Well, till the boat docks.", 3],
      [186, 'MOM', "The channels are wider now, sweetie. Hop on a boat, or take a running jump. No spray on this part.", 4],
      [203, 'KINAN', "A spring by the dock, and a little lifeboat swinging on a hook way up high! Maybe I can ride it across!", 4.2],
      [236, 'DAD', "Almost there, bud! You're making a big splash today. Get it? I'm on a roll!", 3.6],
      [258, 'KINAN', "The Horseshoe Falls, right ahead! And Glitchy just zipped behind the water!", 3.4]
    ]
  });
})();

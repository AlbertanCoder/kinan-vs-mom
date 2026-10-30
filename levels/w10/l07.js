/* ============================================================
   LEVEL 10-7 · THE FLORAL CLOCK
   (World 10 · Niagara Falls · trail stop 9)
   Story bible (World 10 table): "A giant flower clock; time the moving
   hands." Glitchy slipped into the garden along the Niagara Parkway, where
   a clock face 40 feet wide is planted in flowers, and its hands really
   turn. The family follows along the garden paths, past hedges, flower
   beds and a hanging clock.
   Idea (ONE): CLOCK HANDS (opt-in `hands`, new in World 10): a platform
     rides on a hand that sweeps round its hub, clockwise. Every pit has a
     little clock in it: the hub sits in the pit, the hand's platform comes
     up flush with the left lip, sweeps across over the top and comes down
     flush with the right lip. Step on as it passes the left lip, ride over,
     step off at the right: an arm and twelve flowers show where it goes.
     If he rides on past the right lip the hand carries him down under the
     cliff, so step off (a fall is a pit fall, as everywhere). Every pit is still inside
     the Playbook's widths, so a hand is a bridge for the careful and a full-run jump is
     the way across for everyone else. A big clock in the middle of the level
     (the minute hand and a slow hour hand) turns over flat floor, never a pit.
     Act 1 teaches it (3/3 pits with slow hands, THE HEDGE, THE HANGING
     CLOCK, THE HILL); act 2 twists it (3/4 pits, THE GREAT CLOCK with its
     two hands, 4); act 3 tests it (the checkpoint, 5/5/4 pits, faster hands).
   Acts (thirds): 0-89 teach (3, the garden and its hedge, 3, THE HILL with the
     hanging clock) · 90-179 twist (3, 4, THE GREAT CLOCK, 4) · 180-269 test (the
     checkpoint, 5, 5, 4, the last garden).
   Secrets (new to World 10): visible = THE HEDGE (S2): a clipped hedge 4
     tiles tall over the path, a full jump up onto it (heart + candles, 31,7) ·
     hidden = THE CUCKOO (S3): the hanging clock on the hill has a cuckoo
     door: a block under it glints (Dad hears it cuckoo; GOLDEN CANDLE,
     73,7) · skill = THE GREAT CLOCK (S5): step onto the minute hand's platform
     as it swings by the floor, ride up the left side and step off onto the
     floating ledge when it comes level (hat, 133,3).
   Bonus spots (never needed): KICK BOARDS seal three garden sheds (c116-120,
     c198-202, c248-252; 3 candles each; Chenoa says so); SLAM SPOTS:
     cracked boards at c56-58 and c226-228 over pockets of candles (solid
     floor underneath).
   Gaps: act 1 3/3 · act 2 3/4/4 · act 3 5/5/4. A full-run jump off the hedge,
     the sheds and the floating ledge comes down on floor
     (w10-levels.spec.ts checks it). No gift or block stands in a shed roof's
     landing, and the ledge's right edge is clear of the minute hand's path.
   Look: the Floral Clock (theme 207, World 10's own look): a huge round bed of flowers
     with its dial and hands, the stone clock house, tidy flower beds, a fountain.
   Jokes: Dad on thyme and tick-lips (the wheeze, Mom laughs, a walk-off); Annie's
     "Shabash!".
   ENGINE REQUESTS: none.
   ============================================================ */
(function () {
  const H = [], C = [];
  const at = (c) => { if (H.length !== c) throw new Error('10-7: expected column ' + c + ' but the ground is at ' + H.length); };
  const flat = (v, n) => { for (let i = 0; i < n; i++) H.push(v); };
  const gap = (n) => flat(null, n);
  const to = (v) => { let c = H[H.length - 1]; const s = v > c ? 8 : -8; while (c !== v) { c += s; H.push(c); } };
  const top = (c) => Math.floor(Math.min(H[c], c > 0 && H[c - 1] != null ? H[c - 1] : H[c]) / 16) - 1;
  const gl = (c0, c1, up) => { for (let c = c0; c <= c1; c++) if (H[c] != null) C.push([c, top(c) - (up || 0)]); };
  const arc = (c0, c1, base, peak) => { for (let c = c0; c <= c1; c++) { const t = (c - c0) / (c1 - c0); C.push([c, base - Math.round(4 * peak * t * (1 - t))]); } };
  const row = (c0, c1, r, step) => { for (let c = c0; c <= c1; c += step || 1) C.push([c, r]); };

  at(0); flat(192, 14);          /* S1  0-13  the garden gate (spawn c2) */
  at(14); gap(3);                /*     14-16 a 3 pit: clock H1 */
  at(17); flat(192, 31);         /*     17-47 THE HEDGE (c30-33, four tiles tall), 14 tiles of runway after it */
  at(48); gap(3);                /* S2  48-50 a 3 pit: clock H2 */
  at(51); flat(192, 12);         /*     51-62 (cracked boards c56-58) */
  at(63); to(176);               /* S3  63-64 up THE HILL */
  at(65); flat(176, 16);         /*     65-80 the terrace: the hanging clock (c72-75) */
  at(81); to(192);               /*     81-82 down */
  at(83); flat(192, 11);         /* S4  83-93 */
  at(94); gap(3);                /*     94-96 a 3 pit: clock H3 (act 2) */
  at(97); flat(192, 12);         /*     97-108 */
  at(109); gap(4);               /*     109-112 a 4 pit: clock H4 */
  at(113); flat(192, 55);        /* S5  113-167 the first garden shed (c116-120), THE GREAT CLOCK (hub c140), the floating ledge (c132-135) */
  at(168); gap(4);               /* S7  168-171 a 4 pit: clock H5 */
  at(172); flat(192, 18);        /*     172-189 the checkpoint (c176) before the test */
  at(190); gap(5);               /* S8  190-194 a 5 pit: clock H6 (act 3) */
  at(195); flat(192, 20);        /*     195-214 a garden shed (c198-202) */
  at(215); gap(5);               /*     215-219 a 5 pit: clock H7 */
  at(220); flat(192, 16);        /* S9  220-235 (cracked boards c226-228) */
  at(236); gap(4);               /*     236-239 a 4 pit: clock H8 */
  at(240); flat(192, 30);        /* S10 240-269 the last garden (shed c248-252), the gift row, the goal */

  /* ---- candles ---- */
  gl(3, 12); arc(13, 17, 11, 3); gl(18, 29); C.push([30, 7], [32, 7], [33, 7]); gl(34, 46); arc(47, 51, 11, 3);       /* S1-S2: over the hedge (the heart is at 31,7) */
  gl(52, 55); C.push([56, 13], [57, 13], [58, 13]); gl(59, 83); gl(84, 92); arc(93, 97, 11, 3);                      /* S3-S4: the hill */
  gl(98, 107); arc(108, 113, 11, 3);                                                                                  /* S5 */
  gl(114, 115); row(116, 120, 8); C.push([117, 11], [118, 11], [119, 11]); gl(121, 131); C.push([133, 3], [135, 3]);   /* the first garden shed; the floating ledge */
  gl(136, 147); gl(148, 166); arc(167, 172, 11, 3);                                                                   /* the great clock's floor, the 4 pit */
  gl(173, 188); arc(189, 195, 11, 4); gl(196, 197); row(198, 202, 8); C.push([199, 11], [200, 11], [201, 11]); gl(203, 213); arc(214, 220, 11, 4);   /* S7-S9 */
  gl(221, 225); C.push([226, 13], [227, 13], [228, 13]); gl(229, 234); arc(235, 240, 11, 3);                          /* S9 */
  gl(241, 247); row(248, 252, 8); C.push([249, 11], [250, 11], [251, 11]); gl(253, 254); gl(255, 259, 2); gl(260, 265);   /* S10 */

  KinanLevels.register({
    id: '10-7', world: 10, slot: 9, kind: 'level',
    name: 'THE FLORAL CLOCK',
    theme: 207,   /* a huge round bed of flowers with its dial and hands, the stone clock house, flower beds, a fountain */
    cols: H.length,
    /* CLOCK HANDS (World 10 twist, opt-in): [col, row, [radii in tiles], period, start angle, w, look] — a hub at the centre of tile (col, row); each radius
       carries a platform w tiles wide that sweeps clockwise round it once every `period` frames (the angle is in degrees: 0 = 12 o'clock); look 'minute'
       (an arm, a ring of twelve flowers) or 'hour' (a short fat arm). Each pit's hub sits just under the floor line so the platform comes up flush with the left lip,
       passes over the top and comes down flush with the right lip. */
    hands: [
      [15, 13, [2.2], 840, 300, 2, 'minute'],    /* H1  S1 the 3 pit c14-16 */
      [49, 13, [2.2], 780, 40, 2, 'minute'],     /* H2  S2 the 3 pit c48-50 */
      [95, 13, [2.2], 720, 180, 2, 'minute'],    /* H3  S4 the 3 pit c94-96 */
      [110, 13, [2.7], 700, 300, 2, 'minute'],   /* H4  S5 the 4 pit c109-112 */
      [169, 13, [2.7], 660, 120, 2, 'minute'],   /* H5  S7 the 4 pit c168-171 */
      [192, 13, [3.4], 600, 20, 3, 'minute'],    /* H6  S8 the 5 pit c190-194 */
      [217, 13, [3.4], 560, 200, 3, 'minute'],   /* H7  S9 the 5 pit c215-219 */
      [237, 13, [2.7], 580, 330, 2, 'minute'],   /* H8  S9 the 4 pit c236-239 */
      [140, 6, [4], 660, 270, 2, 'minute'],      /* THE GREAT CLOCK, S5: the minute hand (it dips to 2 tiles over the floor, and passes the floating ledge at 10:30) */
      [140, 6, [2.2], 1320, 90, 2, 'hour']       /* the hour hand: slow, short */
    ],
    skins: [
      ['hedge', 30, 8, 33, 11],                                    /* THE HEDGE (visible secret) */
      ['clockface', 72, 3, 75, 6],                                 /* THE HANGING CLOCK on the hill (the cuckoo's block is under it) */
      ['greenhouse', 116, 9, 120, 11], ['greenhouse', 198, 9, 202, 11], ['greenhouse', 248, 9, 252, 11],   /* the garden sheds (kick boards at c120, c202, c252) */
      ['granite', 132, 4, 135, 5]                                  /* THE FLOATING LEDGE: stone by the great clock */
    ],
    heights: H,
    solid: [
      [30, 8, 33, 11],      /* S2 THE HEDGE */
      [72, 3, 75, 6],       /* S3 THE HANGING CLOCK (floating stone: the path passes under it) */
      [116, 9, 120, 11], [198, 9, 202, 11], [248, 9, 252, 11],   /* the garden sheds */
      [132, 4, 135, 5]      /* S5 THE FLOATING LEDGE (bottom y=96; right edge x=2176, clear of the minute hand) */
    ],
    open: [
      [56, 13, 58, 13], [226, 13, 228, 13],   /* SLAM SPOTS: the pockets under the cracked boards, solid floor under them */
      [117, 11, 119, 11], [199, 11, 201, 11], [249, 11, 251, 11]   /* the sheds' closets, sealed by a kick board */
    ],
    tiles: {
      crack: [[56, 12], [57, 12], [58, 12], [226, 12], [227, 12], [228, 12]],
      board: [[120, 11], [202, 11], [252, 11]],   /* KICK SPOTS (bonus) */
      gift: [
        [6, 8],              /* S1 */
        [24, 8],             /* S2 */
        [42, 8],             /* S2 */
        [55, 8],             /* S3 */
        [68, 7],             /* S3 on the hill's terrace (floor 176) */
        [73, 7, 'gold'],     /* S3 THE CUCKOO: the glinting block under the hanging clock (hidden) */
        [78, 7],             /* S3 */
        [88, 8],             /* S4 */
        [100, 8],            /* S5 */
        [114, 8],            /* S5 */
        [150, 8], [158, 8],  /* S6 past the great clock */
        [176, 8],            /* S7 */
        [212, 8],            /* S9, clear of the shed roof's landing (a jump off it comes down around c203-211) */
        [231, 8],            /* S9 */
        [250, 5],            /* S10 over the last shed's roof */
        [256, 8, 'heart'], [258, 8, 'cake']   /* S10 the gift row */
      ],
      brick: [[5, 8], [7, 8], [255, 8], [257, 8], [259, 8]]
    },
    /* gardeners, slugs and puddle frogs; mosquitoes in the air. Nothing waits at a lip. */
    foes: [
      [9, 11, 'mallwalker'],                          /* S1 */
      [22, 11, 'slug'], [40, 11, 'puddlefrog'],       /* S2 */
      [56, 11, 'mallwalker'], [70, 10, 'slug'], [78, 10, 'mallwalker'],   /* S3 */
      [88, 11, 'slug'],                               /* S4 */
      [100, 11, 'puddlefrog'], [104, 5, 'mosquito'],  /* S5 */
      [114, 11, 'slug'], [125, 11, 'mallwalker'],     /* S5 */
      [150, 11, 'slug'], [158, 11, 'puddlefrog'], [162, 5, 'mosquito'],   /* S6 */
      [176, 11, 'mallwalker'], [184, 11, 'slug'],     /* S7 */
      [196, 11, 'puddlefrog'], [210, 11, 'slug'],     /* S8 */
      [224, 11, 'mallwalker'], [231, 11, 'slug'],     /* S9 */
      [244, 11, 'mallwalker'], [256, 11, 'slug'], [262, 11, 'puddlefrog']   /* S10 */
    ],
    candles: C,
    secrets: [
      { kind: 'visible', col: 31, row: 7, prize: 'heart+candles' },        /* THE HEDGE: a full jump up onto it */
      { kind: 'hidden', col: 73, row: 7, prize: 'GOLDEN CANDLE', glint240: true },   /* THE CUCKOO: the glinting block under the hanging clock */
      { kind: 'skill', col: 133, row: 3, prize: 'hat' }                     /* THE GREAT CLOCK: ride the minute hand, step off onto the floating ledge */
    ],
    goldenCandle: { col: 73, row: 7 },
    checkpoint: { col: 176, row: 11 },
    spawn: { col: 2, row: 11 },
    goal: { col: 266, row: 11 },   /* the garden's far gate */
    talk: [
      [2, 'KINAN', "The Floral Clock! A giant clock made of flowers, and its hands really move! Glitchy slipped into the garden.", 4.4],
      [3, 'DAD', "Why did the clock grow herbs, bud? It had thyme on its hands!", 3.2],
      [4, 'MOM', "Careful with the clock hands, sweetie. They keep turning. Step on when one passes, and off on the other side.", 4.2],
      [12, 'CHENOA', "The little platform on the hand carries you across! Step on when it comes up to the edge, and off on the far side.", 4.4],
      [40, 'DAD', "What kind of flower grows on the minute hand? A tick-lip... hee... a TICK-lip... HA... I can't—", 4.2, 'wheeze'],
      [40, 'CHENOA', "...a tulip. A tick-lip. Dad, I'm leaving.", 2.8],
      [40, 'MOM', "Ha! A tick-lip! Okay, that was actually good.", 2.8, 'laugh'],
      [28, 'CHENOA', "That hedge is tall! Hold JUMP all the way and you can climb up onto it. There's a heart on top.", 3.8],
      [66, 'DAD', "Listen, bud... Cuckoo! Cuckoo! It sounds like it's coming from the hanging clock. Jump up under it!", 3.8],
      [85, 'CHENOA', "A wooden board on that garden shed! Stand next to it and press KICK.", 3.4],
      [100, 'SHAD', "Some clocks have two hands, little bro: a fast one and a slow one. See which one comes by the floor.", 4],
      [114, 'ANNIE', "A real working flower clock! Chalo! (Let's go!)", 3],
      [128, 'MOM', "The big hand swings right past that floating ledge, sweetie. Step off when they're level.", 3.8],
      [172, 'DAD', "I'd tell a joke about time, but it's about time I stopped. Wait, no, it's a bit late for that.", 4],
      [172, 'MOM', "Is that all you do, tell jokes? I am going to look at the flowers. Alone.", 3.4, 'walkoff'],
      [172, 'DAD', "...I'll be here all week! Well, till the clock strikes thirteen.", 3],
      [188, 'SHAD', "The hands are faster now, and the pits are wider. Take a running jump, or time the hand.", 3.8],
      [240, 'ANNIE', "Shabash, Kinan! (Well done!) You told time like a pro!", 3.2],
      [258, 'KINAN', "Glitchy ran into a building full of mirrors! The Mirror Maze!", 3.4]
    ]
  });
})();

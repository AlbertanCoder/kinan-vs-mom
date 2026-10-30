/* ============================================================
   LEVEL 10-1 · CLIFTON HILL LIGHTS
   (World 10 · Niagara Falls · trail stop 1)
   Story bible (World 10 table): "Neon signs and arcade fronts at night.
   A celebratory opener." The tour boat has landed at the foot of
   Clifton Hill: the whole team is here for Kinan's big birthday, Mom
   still isn't sure he is ready, and Glitchy zips ahead between the signs.
   Idea (ONE): NEON SIGNS THAT BLINK (opt-in `neons`, new in World 10: a
     timed cousin of World 7's circuit blocks). A sign is a platform while
     it glows (land from above, jump up through it); it flickers for 0.8 s
     and goes dark, then comes back. A little meter over each sign shows
     the glow time left (or the dark time passed); the flicker and a
     flashing "!" warn before it goes. Every gap on the main path is
     still inside the Playbook's widths, so a sign is a bridge for the
     careful and a full-run jump is the way for everyone else.
     Act 1 teaches it (a bridge that is lit almost all the time, a second
     bridge, a stair of two signs up to the shelf); act 2 twists it (a
     4-wide bridge, a WAVE of three signs that light one after the other, a
     dark sign, a bowl, shorter glows); act 3 tests it (5-wide and 4-wide
     bridges with shorter glow times, two signs that take turns over a 5
     gap, a three-sign stair up the wall).
   Acts (thirds): 0-89 teach (the dock street 3, THE ARCADE, 3, THE TERRACE
     with the prize counters, THE SIGN STAIR) · 90-179 twist (3, THE PRIZE
     CLOSET, 4, THE WAVE, THE FERRIS WHEEL BOWL, THE DARK SIGN, 4, 3) · 180-269
     test (the checkpoint, 5, 4, 5 with two signs that take turns, THE SKY
     SIGNS, 3, the gift row).
   Secrets (new to World 10): visible = THE PRIZE SHELF (S4): a shelf 5
     tiles up over the 3 gap, reached by the stair of two glowing signs
     (heart + candles, 95,6) · hidden = THE DARK SIGN (S6): one neon sign
     never lights (a clue, and Dad says so); jump under it and the hidden
     block glints (GOLDEN CANDLE, 154,7) · skill = THE SKY SIGNS (S9): three
     signs climb the wall in a wave, 2 tiles apart, each lighting just after
     the one below; ride the wave up to the shelf on the roof (hat, 233,3).
   Bonus spots (never needed): KICK BOARDS seal three PRIZE CLOSETS inside
     arcades (c97-101, c164-168, c240-244; 3 candles each; Chenoa says so);
     SLAM SPOTS: cracked boards at c54-56 and c212-214 over pockets of candles
     (solid floor underneath).
   Memory (age 10, Shad 2026-10-29): the CHICKEN RIDER popcorn bucket and the
     IDOL HUNTER light stick (made-up names), from this arcade: each on its prize
     counter on the terrace (S3, c66-67 and c72-73, skins 'chickenrider' and
     'idolhunter'); Kinan remembers them as he gets there (story bubble at c64).
   Gaps: act 1 3/3 · act 2 3/4/4 (the 3 at 94-96 is in act 2) · act 3 3/5/4/5/3.
     Nothing waits at a lip. Every sign over a pit is at
     floor level, so a full-run jump never lands on a sign that goes dark. Every
     roof has 11+ tiles of floor after it before a pit (a jump off a 3-tile roof lands up to 9 tiles on). A full-run jump off the
     arcade roofs, the terrace and the sky signs comes down on floor
     (w10-levels.spec.ts checks it).
   Look: Clifton Hill at night (theme 200, World 10's own look): stars, searchlights, a
     turning Ferris wheel with neon gondolas, hotel towers, arcade fronts with
     blinking signs and strings of bulbs.
   Jokes: Dad on bulbs, signs, the Ferris wheel and high scores; Mom laughs once,
     walks off once.
   ENGINE REQUESTS: none.
   ============================================================ */
(function () {
  const H = [], C = [];
  const at = (c) => { if (H.length !== c) throw new Error('10-1: expected column ' + c + ' but the ground is at ' + H.length); };
  const flat = (v, n) => { for (let i = 0; i < n; i++) H.push(v); };
  const gap = (n) => flat(null, n);
  const to = (v) => { let c = H[H.length - 1]; const s = v > c ? 8 : -8; while (c !== v) { c += s; H.push(c); } };   /* a 2:1 slope from the last flat to the height v */
  /* candles: a run on the ground (up = tiles above it), an arc over a gap (rows at its two ends: base) and a row at one height */
  const top = (c) => Math.floor(Math.min(H[c], c > 0 && H[c - 1] != null ? H[c - 1] : H[c]) / 16) - 1;   /* the first open row above the ground (a slope's tile counts) */
  const gl = (c0, c1, up) => { for (let c = c0; c <= c1; c++) if (H[c] != null) C.push([c, top(c) - (up || 0)]); };
  const arc = (c0, c1, base, peak) => { for (let c = c0; c <= c1; c++) { const t = (c - c0) / (c1 - c0); C.push([c, base - Math.round(4 * peak * t * (1 - t))]); } };
  const row = (c0, c1, r) => { for (let c = c0; c <= c1; c++) C.push([c, r]); };

  at(0); flat(192, 14);          /* S1  0-13  the boat dock street */
  at(14); gap(3);                /*     14-16 a 3 gap: N1, the first neon bridge */
  at(17); flat(192, 10);         /*     17-26 */
  at(27); flat(192, 22);         /* S2  27-48 THE ARCADE (c31-36, three tiles tall), 12 tiles of runway after it */
  at(49); gap(3);                /*     49-51 a 3 gap: N2 */
  at(52); flat(192, 6);          /*     52-57 (cracked boards c54-56) */
  at(58); to(176);               /* S3  58-59 the slope up the hill */
  at(60); flat(176, 18);         /*     60-77 THE TERRACE: the two prize counters */
  at(78); to(192);               /* S4  78-79 the slope down */
  at(80); flat(192, 14);         /*     80-93 THE SIGN STAIR (N3 c86-88, N4 c90-92) */
  at(94); gap(3);                /*     94-96 a 3 gap under THE PRIZE SHELF (act 2) */
  at(97); flat(192, 17);         /*     97-113 the prize closet arcade (c97-101), 12 tiles of runway */
  at(114); gap(4);               /* S5  114-117 a 4 gap: N5, a 4-wide bridge */
  at(118); flat(192, 17);        /*     118-134 THE WAVE (N6-N8) */
  at(135); to(208);              /* S6  135-136 into THE FERRIS WHEEL BOWL */
  at(137); flat(208, 8);         /*     137-144 the bowl */
  at(145); to(192);              /*     145-146 out of it */
  at(147); flat(192, 12);        /*     147-158 THE DARK SIGN (c153-155) */
  at(159); gap(4);               /* S7  159-162 a 4 gap: N9 */
  at(163); flat(192, 17);        /*     163-179 the second closet arcade (c164-168), 11 tiles of runway */
  at(180); gap(3);               /*     180-182 a 3 gap: N10 (act 3) */
  at(183); flat(192, 9);         /* S8  183-191 the checkpoint (c184) before the test */
  at(192); gap(5);               /*     192-196 a 5 gap: N11, a 5-wide bridge (act 3) */
  at(197); flat(192, 6);         /*     197-202 */
  at(203); gap(4);               /*     203-206 a 4 gap: N12 */
  at(207); flat(192, 10);        /* S9  207-216 (cracked boards c212-214) */
  at(217); gap(5);               /*     217-221 a 5 gap: N13 and N14 take turns */
  at(222); flat(192, 12);        /*     222-233 THE SKY SIGNS (N15-N17) */
  at(234); gap(3);               /*     234-236 a 3 gap (the sky shelf hangs over it) */
  at(237); flat(192, 33);        /* S10 237-269 the finale: the third closet arcade, springs, the gift row, the goal */

  /* ---- candles ---- */
  gl(3, 12); arc(13, 17, 11, 3); gl(19, 26);                                         /* S1 */
  gl(28, 30); row(31, 36, 8); gl(37, 47); arc(48, 52, 11, 3); gl(53, 53); gl(57, 57);   /* S2: over the arcade roof, the 3 gap */
  C.push([54, 13], [55, 13], [56, 13]);                                              /* the cracked boards' pocket */
  gl(58, 65); row(66, 67, 8); gl(68, 71); row(72, 73, 8); gl(74, 79);                /* S3: the terrace and over the prize counters */
  gl(81, 85); row(86, 88, 8); row(90, 92, 6); C.push([94, 6], [96, 6]);              /* S4: over the signs of the stair */
  C.push([98, 11], [99, 11], [100, 11]);                                             /* the prize closet, behind the board */
  gl(102, 112); arc(113, 118, 11, 3);                                                /* S5: a run, an arc over the 4 gap */
  gl(119, 119); row(120, 122, 8); row(124, 126, 6); row(128, 130, 4); gl(131, 134);  /* S5: over THE WAVE's stair */
  gl(135, 136); gl(137, 144); gl(145, 146);                                          /* S6: the bowl */
  gl(148, 152); row(153, 155, 5); gl(156, 157); arc(158, 163, 11, 3);                /* S6-S7: under the dark sign, an arc over the 4 gap */
  row(164, 168, 8); C.push([165, 11], [166, 11], [167, 11]); gl(169, 178); arc(179, 183, 11, 3);   /* S7 */
  gl(184, 190); arc(191, 197, 11, 4); gl(198, 201); arc(202, 207, 11, 3); gl(208, 211);   /* S8: over the 5 gap and the 4 gap */
  C.push([212, 13], [213, 13], [214, 13]);                                           /* the second pocket */
  gl(215, 215); arc(216, 222, 11, 4); gl(223, 224);                                  /* S9: over the 5 gap */
  row(224, 226, 8); row(228, 230, 6); C.push([232, 3], [234, 3], [233, 2]);          /* over the sky signs, and on the sky shelf */
  C.push([235, 5], [236, 8], [237, 10]);                                             /* and down the other side */
  gl(238, 239); row(241, 243, 8); C.push([241, 11], [242, 11], [243, 11]); gl(245, 255, 2); gl(257, 258); gl(260, 264);   /* S10 */

  KinanLevels.register({
    id: '10-1', world: 10, slot: 1, kind: 'level',
    name: 'CLIFTON HILL LIGHTS',
    theme: 200,   /* Clifton Hill at night: stars, searchlights, a turning Ferris wheel, hotels, arcade fronts with blinking neon */
    cols: H.length,
    /* NEON SIGNS (World 10 twist, opt-in): [col, row, w, period, glow, phase, look] — a platform while it glows (frames of every period);
       the glow flickers for its last 50 frames; phase offsets the clock (a bigger phase lights it earlier); look 'bar' | 'arrow' | 'star' */
    neons: [
      [14, 12, 3, 360, 330, 0, 'bar'],      /* N1  S1 the first bridge, lit almost all the time (it teaches) */
      [49, 12, 3, 300, 230, 40, 'arrow'],   /* N2  S2 a bridge, dark for a short while */
      [86, 10, 3, 300, 210, 0, 'star'],     /* N3  S4 the sign stair, step 1 */
      [90, 8, 3, 300, 210, 250, 'bar'],     /* N4  S4 step 2, lights 50 frames after N3 */
      [114, 12, 4, 300, 200, 0, 'arrow'],   /* N5  S5 a 4-wide bridge */
      [120, 10, 3, 270, 190, 0, 'bar'],     /* N6  S5 THE WAVE: each sign lights 40 frames after the one below */
      [124, 8, 3, 270, 190, 230, 'star'],   /* N7 */
      [128, 6, 3, 270, 190, 190, 'arrow'],  /* N8 */
      [153, 9, 3, 1000, 0, 0, 'bar'],       /* THE DARK SIGN, S6: it never lights (glow 0) */
      [159, 12, 4, 280, 180, 100, 'bar'],   /* N9  S7 a 4-wide bridge */
      [180, 12, 3, 280, 190, 0, 'arrow'],   /* N10 S7 a 3-wide bridge */
      [192, 12, 5, 300, 170, 0, 'star'],    /* N11 S8 a 5-wide bridge, dark for 130 frames */
      [203, 12, 4, 260, 150, 80, 'bar'],    /* N12 S8 */
      [217, 12, 3, 220, 130, 0, 'arrow'],   /* N13 S9 two signs that take turns over the 5 gap */
      [220, 12, 2, 220, 130, 110, 'star'],  /* N14 */
      [224, 10, 3, 280, 200, 0, 'bar'],     /* N15 S9 THE SKY SIGNS: a wave up the wall, 2 tiles per step */
      [228, 8, 3, 280, 200, 240, 'arrow'],  /* N16 */
      [232, 6, 3, 280, 200, 200, 'star']    /* N17 */
    ],
    skins: [
      ['arcade', 31, 9, 36, 11],      /* THE ARCADE: three tiles tall, a bright front with a game screen */
      ['arcade', 97, 9, 101, 11],     /* the first prize closet arcade (kick board at c101) */
      ['arcade', 164, 9, 168, 11],    /* the second closet (kick board at c168) */
      ['arcade', 240, 9, 244, 11],    /* the third closet (kick board at c244) */
      ['chickenrider', 66, 9, 67, 10],  /* the age-10 memory gift: the Chicken Rider popcorn bucket on its prize counter */
      ['idolhunter', 72, 9, 73, 10]     /* the age-10 memory gift: the Idol Hunter light stick on its prize counter */
    ],
    heights: H,
    solid: [
      [31, 9, 36, 11],      /* S2 THE ARCADE */
      [66, 9, 67, 10],      /* S3 the Chicken Rider prize counter */
      [72, 9, 73, 10],      /* S3 the Idol Hunter prize counter */
      [97, 9, 101, 11],     /* S4 the first prize closet arcade */
      [164, 9, 168, 11],    /* S7 the second closet arcade */
      [240, 9, 244, 11]     /* S10 the third closet arcade */
    ],
    open: [
      [54, 13, 56, 13], [212, 13, 214, 13],   /* SLAM SPOTS: the pockets under the cracked boards, solid floor under them */
      [98, 11, 100, 11], [165, 11, 167, 11], [241, 11, 243, 11]   /* the closets inside the arcades, sealed by a kick board */
    ],
    tiles: {
      crack: [[54, 12], [55, 12], [56, 12], [212, 12], [213, 12], [214, 12]],   /* SLAM SPOTS: cracked boards over a pocket of candles (bonus) */
      board: [[101, 11], [168, 11], [244, 11]],   /* KICK SPOTS: the boards that seal the prize closets (bonus; the arcade's right side, Kinan's standing height) */
      gift: [
        [6, 8],                  /* S1 */
        [33, 5],                 /* S2 over the arcade roof */
        [62, 7],                 /* S3 */
        [99, 5, 'candle'],       /* S4 over the closet arcade's roof */
        [122, 5],                /* S5 over the wave */
        [143, 9],                /* S6 over the bowl */
        [154, 7, 'gold'],        /* S6 THE DARK SIGN: the glinting block (hidden) */
        [166, 5],                /* S7 over the second closet arcade's roof */
        [186, 8],                /* S8 */
        [209, 8],                /* S9 */
        [250, 8, 'heart'], [252, 8, 'cake']   /* S10 the gift row */
      ],
      brick: [[5, 8], [7, 8], [249, 8], [251, 8], [253, 8]],
      spring: [[246, 11], [259, 11]],
      shelf: [
        [94, 7], [95, 7], [96, 7],        /* S4 THE PRIZE SHELF (visible secret) */
        [232, 4], [233, 4], [234, 4]      /* S9 THE SKY SHELF (skill secret) */
      ]
    },
    /* tourists, street food and buskers; a few camera drones, seagulls and sparklers. Nothing waits at a lip. */
    foes: [
      [9, 11, 'mallwalker'],                          /* S1 */
      [40, 11, 'corndog'],                            /* S2 */
      [63, 10, 'drummer'],                            /* S3 */
      [83, 11, 'cart'],                               /* S4 */
      [100, 6, 'camera'], [106, 11, 'mallwalker'],    /* S4-S5 */
      [131, 11, 'corndog'],                           /* S5 */
      [140, 12, 'puddlefrog'], [151, 6, 'ghost'],     /* S6 */
      [172, 11, 'rollerblader'], [181, 5, 'seagull'], /* S7 */
      [187, 11, 'drummer'], [190, 5, 'camera'],       /* S8 */
      [199, 11, 'mallwalker'], [210, 11, 'cart'],     /* S8-S9 */
      [226, 11, 'corndog'], [230, 4, 'sparkler'],     /* S9 */
      [239, 11, 'drummer'], [262, 11, 'mallwalker']   /* S10 */
    ],
    candles: C,
    secrets: [
      { kind: 'visible', col: 95, row: 6, prize: 'heart+candles' },        /* THE PRIZE SHELF: up the two-sign stair */
      { kind: 'hidden', col: 154, row: 7, prize: 'GOLDEN CANDLE', glint240: true },   /* THE DARK SIGN: the glinting block under the sign that never lights */
      { kind: 'skill', col: 233, row: 3, prize: 'hat' }                     /* THE SKY SIGNS: ride the wave up to the roof shelf */
    ],
    goldenCandle: { col: 154, row: 7 },
    checkpoint: { col: 184, row: 11 },
    spawn: { col: 2, row: 11 },
    goal: { col: 266, row: 11 },   /* the end of Clifton Hill */
    talk: [
      [2, 'KINAN', "Clifton Hill, all lit up for my birthday! And there goes Glitchy, zipping between the neon signs!", 4.2],
      [3, 'DAD', "Welcome to the brightest street in Canada, bud. It's un-bulb-lievable!", 3.4],
      [4, 'MOM', "Still not sure you're ready, sweetie. Cross where the neon glows. A dark sign can't hold you.", 4],
      [11, 'CHENOA', "See the little bar over each sign? It shrinks while the sign glows. When it flickers, hurry, little bro!", 4.4],
      [41, 'DAD', "Why did the neon sign get a standing ovation? Because it was just so... hee... so... HA... I can't—", 4.6, 'wheeze'],
      [41, 'CHENOA', "...BRIGHT. It was so bright. Dad, you told that one at breakfast.", 3.2],
      [41, 'MOM', "Ha! Okay, that one got me. Go on, sweetie, the sign is glowing!", 3.2, 'laugh'],
      [64, 'KINAN', "The prize counter! My Chicken Rider popcorn bucket and my Idol Hunter light stick. I won them at this arcade when I was ten!", 5.4],
      [65, 'DAD', "Ten years old and already a champion. You really know how to play your cards, bud. And your claws!", 4],
      [84, 'CHENOA', "Two signs make a staircase! Hop up the glowing ones and see what is on that shelf.", 3.8],
      [93, 'CHENOA', "A wooden board on that arcade! Kick it, little bro: stand next to it and press KICK.", 3.6],
      [112, 'DAD', "Why did the arcade get such great grades? Because it had so many high scores!", 3.4],
      [112, 'MOM', "Is that all you do, tell jokes? I am going to look at the Ferris wheel. Alone.", 3.4, 'walkoff'],
      [112, 'DAD', "...I'll be here all week! Well, till the fireworks.", 3],
      [119, 'SHAD', "These three signs light up one after the other, like a wave. Climb with it, little bro!", 3.6],
      [136, 'DAD', "I was scared of the Ferris wheel once, bud. But then I came around!", 3.4],
      [148, 'DAD', "That sign never lights up, bud. Not very bright! Jump under it, I think something is hiding.", 3.8],
      [185, 'MOM', "These bridges are shorter now. Wait for the sign to glow, then go. Or take a running jump.", 3.8],
      [214, 'SHAD', "Two signs take turns over the next gap. When one flickers, the other is just waking up.", 3.8],
      [238, 'KINAN', "Almost at the end of the hill! Glitchy is waiting by the river... let's go!", 3.4]
    ]
  });
})();

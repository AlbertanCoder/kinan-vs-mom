/* ============================================================
   LEVEL 10-3 · BEHIND THE FALLS
   (World 10 · Niagara Falls · trail stop 3)
   Story bible (World 10 table): "Tunnels and lookouts behind the water."
   Glitchy ducks into the tunnels cut in the rock behind the Horseshoe
   Falls; the family follows in yellow ponchos: dark tunnels, round
   lookout windows full of rushing water, and places where the falls pour
   right across the path.
   Idea (ONE): WATER CURTAINS (opt-in `curtains`, new in World 10). Where
     the water falls across the tunnel it drips, drips harder for a moment
     (the lip flashes, the drips come fast: the warning), then pours as a
     sheet for a while. Standing in the sheet slows Kinan and pushes him
     back; it never hurts. Between pours it only drips: walk through. No
     curtain is near a gap (a slowed jump would fall short): they hang over
     flat tunnel floor only.
     Act 1 teaches it (a curtain with a long calm, one in the lookout, one
     in the second tunnel); act 2 twists it (three curtains in a row that
     pour one at a time, a lookout with stairs and a hidden block); act 3
     tests it (shorter calms, the curtain climb, the exit tunnel).
   Acts (thirds): 0-89 teach (the entrance 3, TUNNEL 1, THE BALCONY 3,
     THE FIRST LOOKOUT, TUNNEL 2) · 90-179 twist (4, TUNNEL 3 and its three
     curtains, 4, THE SECOND LOOKOUT, 3) · 180-269 test (the checkpoint, 5,
     TUNNEL 4, 5, THE CURTAIN CLIMB, 4, the exit tunnel).
   Secrets (new to World 10): visible = THE BALCONY (S2): a rock balcony
     hangs over the 3 gap at the end of tunnel 1, 4 tiles up: a full jump
     (heart + candles, 48,7) · hidden = THE SPARKLE (S7): in the second
     lookout one block over the path glints (Dad says it sparkles; GOLDEN
     CANDLE, 165,7; it is clear of the closet roof's jump) · skill = THE
     CURTAIN CLIMB (S9): three small ledges climb up the inside of a
     waterfall, each 3 tiles up and on the other side; while it pours the
     water drags Kinan back (hat, 228,2).
   Bonus spots (never needed): KICK BOARDS seal two rock closets in the lookouts
     (c52-56, c150-154; 3 candles each; Chenoa says so); SLAM SPOTS: cracked
     boards at c98-100 and c213-215 over pockets of candles (solid floor
     underneath).
   Gaps: act 1 3/3 · act 2 4/4/3 · act 3 5/5/4. Every curtain has 4+ tiles of
     flat floor on each side before a pit, and the water never pushes him off
     a ledge he stands on. A tunnel's ceiling is 6 tiles over the floor,
     higher than any jump goes (no roof is bumped).
     A full-run jump off the rock closets comes down on floor
     (w10-levels.spec.ts checks it).
   Look: Behind the Falls (theme 202, World 10's own look): a rock tunnel, round
     lookout windows full of rushing water, lamps, drips, tourists in yellow ponchos.
   Jokes: Dad on the water and the tunnel; Mom laughs once; GRANDPA's cameo (a
     better joke than Dad's) on the lookout.
   ENGINE REQUESTS: none.
   ============================================================ */
(function () {
  const H = [], C = [];
  const at = (c) => { if (H.length !== c) throw new Error('10-3: expected column ' + c + ' but the ground is at ' + H.length); };
  const flat = (v, n) => { for (let i = 0; i < n; i++) H.push(v); };
  const gap = (n) => flat(null, n);
  const to = (v) => { let c = H[H.length - 1]; const s = v > c ? 8 : -8; while (c !== v) { c += s; H.push(c); } };
  const top = (c) => Math.floor(Math.min(H[c], c > 0 && H[c - 1] != null ? H[c - 1] : H[c]) / 16) - 1;
  const gl = (c0, c1, up) => { for (let c = c0; c <= c1; c++) if (H[c] != null) C.push([c, top(c) - (up || 0)]); };
  const arc = (c0, c1, base, peak) => { for (let c = c0; c <= c1; c++) { const t = (c - c0) / (c1 - c0); C.push([c, base - Math.round(4 * peak * t * (1 - t))]); } };
  const row = (c0, c1, r) => { for (let c = c0; c <= c1; c++) C.push([c, r]); };

  at(0); flat(192, 14);          /* S1  0-13  the entrance, in the open (spawn c2) */
  at(14); gap(3);                /*     14-16 a 3 gap */
  at(17); flat(192, 30);         /*     17-46 TUNNEL 1 (ceiling c20-46), curtain C1 (c34-36) */
  at(47); gap(3);                /* S2  47-49 a 3 gap under THE BALCONY */
  at(50); flat(192, 18);         /*     50-67 THE FIRST LOOKOUT: a rock closet (c52-56), curtain C2 (c58-60) */
  at(68); to(176);               /* S3  68-69 up to TUNNEL 2 */
  at(70); flat(176, 20);         /*     70-89 TUNNEL 2 (ceiling c72-89), curtain C3 (c80-82) */
  at(90); to(192);               /* S4  90-91 down again */
  at(92); flat(192, 14);         /*     92-105 (cracked boards c98-100) */
  at(106); gap(4);               /*     106-109 a 4 gap (act 2) */
  at(110); flat(192, 30);        /* S5  110-139 TUNNEL 3 (ceiling c112-139): curtains C4-C6 that pour one at a time */
  at(140); gap(4);               /*     140-143 a 4 gap */
  at(144); flat(192, 24);        /* S6  144-167 THE SECOND LOOKOUT: a rock closet (c150-154), the sparkle (c159) */
  at(168); gap(3);               /*     168-170 a 3 gap */
  at(171); flat(192, 12);        /* S7  171-182 the checkpoint (c176) before the test */
  at(183); gap(5);               /*     183-187 a 5 gap (act 3) */
  at(188); flat(192, 30);        /* S8  188-217 TUNNEL 4 (ceiling c190-217): curtains C7-C9 with shorter calms (cracked boards c200-202) */
  at(218); gap(5);               /*     218-222 a 5 gap */
  at(223); flat(192, 14);        /* S9  223-236 THE CURTAIN CLIMB (c227-232) */
  at(237); gap(4);               /*     237-240 a 4 gap */
  at(241); flat(192, 29);        /* S10 241-269 the exit tunnel (ceiling c244-262), curtain C10 (c255-257), the gift row, the goal */

  /* ---- candles ---- */
  gl(3, 12); arc(13, 17, 11, 3); gl(18, 45); arc(46, 50, 11, 2); C.push([47, 7], [49, 7]);   /* S1-S2: and on THE BALCONY */
  gl(51, 51); row(52, 56, 8); C.push([53, 11], [54, 11], [55, 11]); gl(57, 65); gl(67, 91);   /* S3: the closet rock's roof and closet, tunnel 2 (the spring is c66) */
  gl(92, 104); arc(105, 110, 11, 3); C.push([98, 13], [99, 13], [100, 13]);                  /* S4 */
  gl(111, 138); arc(139, 144, 11, 3);                                                        /* S5: tunnel 3 */
  gl(145, 149); row(150, 154, 8); C.push([151, 11], [152, 11], [153, 11]); gl(155, 166); arc(167, 171, 11, 2);   /* S6: the second closet */
  gl(172, 181); arc(182, 188, 11, 4); gl(189, 216); C.push([213, 13], [214, 13], [215, 13]); arc(217, 223, 11, 4);   /* S7-S8: tunnel 4 */
  gl(224, 235); C.push([228, 8], [229, 8], [230, 5], [231, 5], [229, 2]); arc(236, 241, 11, 3);   /* S9: up the curtain climb */
  gl(242, 249); gl(250, 254, 2); gl(255, 265);                                               /* S10 */

  KinanLevels.register({
    id: '10-3', world: 10, slot: 3, kind: 'level',
    name: 'BEHIND THE FALLS',
    theme: 202,   /* a rock tunnel, round lookout windows full of rushing water, lamps, drips, tourists in yellow ponchos */
    cols: H.length,
    /* WATER CURTAINS (World 10 twist, opt-in): [c0, c1, rowTop, rowBottom, period, pour, phase, push] — drips, 50 frames of heavy drips as
       the warning, then a sheet of water for the last `pour` frames of every period; it slows Kinan and pushes him (push -1: back, left), never hurts */
    curtains: [
      [34, 36, 6, 11, 420, 90, 0],       /* C1  S2 tunnel 1: a long calm (it teaches) */
      [58, 60, 5, 11, 380, 100, 120],    /* C2  S3 the first lookout */
      [80, 82, 5, 10, 340, 110, 60],     /* C3  S4 tunnel 2 */
      [115, 117, 6, 11, 360, 110, 0],    /* C4  S5 tunnel 3: three curtains, each pours while the others only drip */
      [123, 125, 6, 11, 360, 110, 120],  /* C5 */
      [131, 133, 6, 11, 360, 110, 240],  /* C6 */
      [194, 196, 6, 11, 300, 140, 0],    /* C7  S8 tunnel 4: shorter calms */
      [201, 203, 6, 11, 300, 140, 100],  /* C8 */
      [208, 210, 6, 11, 300, 140, 200],  /* C9 */
      [227, 232, 2, 11, 300, 150, 0],    /* THE CURTAIN CLIMB, S9 (the inside of the falls) */
      [255, 257, 6, 11, 280, 130, 40]    /* C10 S10 the exit tunnel */
    ],
    skins: [
      ['granite', 20, 0, 46, 5], ['granite', 72, 0, 89, 4], ['granite', 112, 0, 139, 5], ['granite', 190, 0, 217, 5], ['granite', 244, 0, 262, 5],   /* the tunnel roofs */
      ['granite', 57, 3, 61, 4], ['granite', 226, 0, 233, 1],   /* the rock the lookout curtain and the climb pour from */
      ['granite', 52, 9, 56, 11], ['granite', 150, 9, 154, 11],   /* the rock closets (kick boards at c56 and c154) */
      ['window', 26, 1, 28, 4], ['window', 40, 1, 42, 4], ['window', 116, 1, 118, 3], ['window', 130, 1, 132, 3],   /* lookout windows: the falls rush past outside */
      ['window', 198, 1, 200, 4], ['window', 210, 1, 212, 4], ['window', 250, 1, 252, 4], ['window', 62, 2, 64, 6], ['window', 156, 2, 158, 6]
    ],
    heights: H,
    solid: [
      [20, 0, 46, 5], [72, 0, 89, 4], [112, 0, 139, 5], [190, 0, 217, 5], [244, 0, 262, 5],   /* the tunnel roofs */
      [57, 3, 61, 4], [226, 0, 233, 1],   /* the overhangs the curtains pour from */
      [52, 9, 56, 11], [150, 9, 154, 11]  /* the rock closets */
    ],
    open: [
      [98, 13, 100, 13], [213, 13, 215, 13],   /* SLAM SPOTS: the pockets under the cracked boards, solid floor under them */
      [53, 11, 55, 11], [151, 11, 153, 11]     /* the closets, sealed by a kick board */
    ],
    tiles: {
      crack: [[98, 12], [99, 12], [100, 12], [213, 12], [214, 12], [215, 12]],
      board: [[56, 11], [154, 11]],   /* KICK SPOTS (bonus) */
      gift: [
        [6, 8],              /* S1 */
        [28, 8],             /* S2 tunnel 1 */
        [54, 5],             /* S3 over the closet rock */
        [64, 8],             /* S3 */
        [76, 7],             /* S4 tunnel 2 (floor 176) */
        [96, 8],             /* S4 */
        [119, 8],            /* S5 tunnel 3 */
        [128, 8],            /* S5 */
        [146, 8],            /* S6 */
        [165, 7, 'gold'],    /* S6 THE SPARKLE: the glinting block (hidden), clear of the closet roof's jump */
        [178, 8],            /* S7 */
        [191, 8],            /* S8 */
        [199, 8],            /* S8 */
        [250, 8, 'heart'], [252, 8, 'cake'], [254, 8, 'candle']   /* S10 the gift row */
      ],
      brick: [[5, 8], [7, 8], [251, 8], [253, 8]],
      spring: [[66, 11]],
      shelf: [
        [47, 8], [48, 8], [49, 8],         /* S2 THE BALCONY over the 3 gap (visible secret) */
        [228, 9], [229, 9],                /* S9 the curtain climb, ledge 1 */
        [230, 6], [231, 6],                /* ledge 2 */
        [228, 3], [229, 3]                 /* ledge 3 (the hat) */
      ]
    },
    /* wet-rock slugs, puddle frogs, bats and tourists in ponchos. Nothing waits at a lip. */
    foes: [
      [9, 11, 'mallwalker'],                            /* S1 */
      [26, 11, 'slug'], [42, 11, 'puddlefrog'],         /* S2 */
      [63, 11, 'mallwalker'], [62, 6, 'umbrellabat'],   /* S3 */
      [78, 10, 'slug'], [86, 10, 'puddlefrog'],         /* S4 */
      [96, 11, 'mallwalker'], [103, 5, 'umbrellabat'],  /* S4 */
      [113, 11, 'slug'], [120, 11, 'puddlefrog'], [128, 11, 'slug'],   /* S5 */
      [146, 11, 'mallwalker'], [157, 11, 'slug'], [162, 5, 'umbrellabat'],   /* S6 */
      [175, 11, 'slug'], [180, 5, 'umbrellabat'],       /* S7 */
      [192, 11, 'slug'], [205, 11, 'puddlefrog'], [212, 11, 'slug'],   /* S8 */
      [246, 11, 'slug'], [259, 11, 'mallwalker']        /* S10 */
    ],
    candles: C,
    secrets: [
      { kind: 'visible', col: 48, row: 7, prize: 'heart+candles' },        /* THE BALCONY: a full jump up onto it, over the gap */
      { kind: 'hidden', col: 165, row: 7, prize: 'GOLDEN CANDLE', glint240: true },   /* THE SPARKLE: the glinting block over the second lookout */
      { kind: 'skill', col: 228, row: 2, prize: 'hat' }                     /* THE CURTAIN CLIMB: three ledges up the inside of the falls */
    ],
    goldenCandle: { col: 165, row: 7 },
    checkpoint: { col: 176, row: 11 },
    spawn: { col: 2, row: 11 },
    goal: { col: 266, row: 11 },   /* the end of the exit tunnel */
    talk: [
      [2, 'KINAN', "Tunnels in the rock, right behind the Horseshoe Falls! Glitchy just ducked inside, and the water is roaring!", 4.4],
      [3, 'DAD', "A tunnel behind a waterfall, bud. What a water-way to travel! I'm still drying off from the spray.", 4],
      [4, 'MOM', "In places the falls pour right across the tunnel. It only slows you down. Wait for the drips, sweetie.", 4.2],
      [28, 'CHENOA', "Drip... drip... DRIP-DRIP-DRIP! That fast dripping means it's about to pour. Cross while it only drips, little bro!", 4.8],
      [38, 'DAD', "Why was the tunnel such a good diplomat? Because it was so... hee... so drip-lo... HA... drip-lomatic... I can't—", 4.8, 'wheeze'],
      [38, 'KINAN', "...a drip-lomat. A DIPLOMAT, Dad. It just keeps dripping. Okay, that is a good one.", 3.6],
      [38, 'MOM', "Ha! Drip-lomatic! Oh, I love you two. Keep going, sweetie.", 3.2, 'laugh'],
      [46, 'CHENOA', "See that rock balcony over the gap? Jump up onto it and hold JUMP all the way. It's high!", 3.8],
      [51, 'CHENOA', "A wooden board on that rock! Stand next to it and press KICK. There are candles inside.", 3.8],
      [60, 'GRANDPA', "Grandpa on the video call! Why don't waterfalls ever get lost? They always know which way is down! Tell your dad that one's mine.", 5.4],
      [104, 'SHAD', "Three curtains in this tunnel, little bro. Only one pours at a time. Watch which one is dripping fast!", 4],
      [144, 'DAD', "Look at the lookout! This view is so good, it's really something to... see. Hey, something sparkles up there!", 4],
      [177, 'MOM', "The calms are shorter now, sweetie. And no curtains near a jump. Not a single splash on a gap.", 3.8],
      [224, 'KINAN', "A ledge inside the waterfall! If it pours, the water pushes me back. Wait for the drips, then climb!", 4],
      [243, 'DAD', "Daylight, bud! That tunnel was a real rock-star. Get it? Because it's all rock!", 3.6],
      [258, 'KINAN', "I see him! Glitchy's on the other side, heading for the big tower!", 3.4]
    ]
  });
})();

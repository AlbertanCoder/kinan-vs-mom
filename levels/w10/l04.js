/* ============================================================
   LEVEL 10-4 · THE OBSERVATION TOWER
   (World 10 · Niagara Falls · trail stop 4)
   Story bible (World 10 table): "Ride the yellow outside elevator to the
   top." The tower stands over the gorge: the plaza at its foot, glass
   elevators climbing its side, a long observation deck at the top where
   the wind blows. Glitchy is already riding one up.
   Idea (ONE): THE YELLOW OUTSIDE ELEVATORS (opt-in `lifts`, new in World
     10): a platform that rides up and down a shaft between two rows and
     waits at each end. A green lamp on it means "I'm waiting for you"; the
     lamp flashes just before it leaves; a little arrow shows the way it is
     going. Its two ends are flush with a ledge, so you step on and step
     off. (The rise is 5 tiles where the climb needs it: higher than any
     jump.) The shaft has a floor one tile lower than the dock, so missing a
     lift costs a one-tile drop, never a pit.
     Act 1 teaches it in the plaza (a baggage lift up 3 tiles to a shop
     ledge, 3 gaps, the express lift); act 2 twists it (the climb: lift up 5,
     the skybridge with a gap over the floor, lift up 5 to the deck); act 3
     tests it (the long deck in the wind, two lifts down, the steps).
     The wind (World 7's, 1 s warning) blows on the skybridge and the deck:
     it pushes him back, weaker in the air, never past a slow walk and never
     off a ledge he stands on.
     There is no pit after the plaza: everything from the climb to the goal
     has floor below it, so every jump off a high point comes down on ground.
   Acts (thirds): 0-89 teach (the plaza, a 3 gap, THE BAGGAGE LIFT and its
     shop, a 3 gap, the plaza and THE EXPRESS LIFT) · 90-179 twist (the
     checkpoint, THE FIRST LIFT up 5, THE SKYBRIDGE with its gap, THE SECOND
     LIFT up 5, the deck) · 180-269 test (the deck in the wind, THE WINDOW
     WASHER LIFTS down, THE STEPS, the souvenir shop, the goal).
   Secrets (new to World 10): visible = THE VIEW SHELF (S5): a shelf 4 tiles
     over the skybridge's far half, a full jump (heart + candles, 127,2) ·
     hidden = THE TWINKLING SIGN (S3): a block over the plaza glints (Dad
     says the sign is twinkling; GOLDEN CANDLE, 68,6) · skill = THE EXPRESS
     LIFT (S3): a fast lift rises 7 tiles and waits only a moment at the top:
     step off across a 2 tile gap to the ledge with the hat (hat, 76,4).
   Bonus spots (never needed): KICK BOARDS seal three souvenir shops (c52-56,
     c84-88, c259-263; 3 candles each; Chenoa says so); SLAM SPOTS: cracked
     boards at c20-22 and c245-247 over pockets of candles (solid floor
     underneath).
   Gaps: act 1 3/3, and no other pit. A full-run jump off every high spot (the
     shops' roofs, the pillars, the deck, the decks below it and the steps)
     comes down on ground (w10-levels.spec.ts checks it).
   Look: the Observation Tower (theme 203, World 10's own look): high up, the Falls and
     the city small below, clouds drifting under us, the tower's shaft with
     yellow elevators. The tower's pillars wear the concrete skin 'tower'.
   Jokes: Dad on elevators (taking steps to avoid them), Mom walks off once; GRANDPA's
     cameo on the deck (a better joke than Dad's).
   ENGINE REQUESTS: none.
   ============================================================ */
(function () {
  const H = [], C = [];
  const at = (c) => { if (H.length !== c) throw new Error('10-4: expected column ' + c + ' but the ground is at ' + H.length); };
  const flat = (v, n) => { for (let i = 0; i < n; i++) H.push(v); };
  const gap = (n) => flat(null, n);
  const top = (c) => Math.floor(Math.min(H[c], c > 0 && H[c - 1] != null ? H[c - 1] : H[c]) / 16) - 1;
  const gl = (c0, c1, up) => { for (let c = c0; c <= c1; c++) if (H[c] != null) C.push([c, top(c) - (up || 0)]); };
  const arc = (c0, c1, base, peak) => { for (let c = c0; c <= c1; c++) { const t = (c - c0) / (c1 - c0); C.push([c, base - Math.round(4 * peak * t * (1 - t))]); } };
  const row = (c0, c1, r, step) => { for (let c = c0; c <= c1; c += step || 1) C.push([c, r]); };

  at(0); flat(192, 14);          /* S1  0-13  the plaza (spawn c2) */
  at(14); gap(3);                /*     14-16 a 3 gap: the fountain pool */
  at(17); flat(192, 11);         /*     17-27 (cracked boards c20-22) */
  at(28); flat(208, 3);          /* S2  28-30 THE BAGGAGE LIFT's shaft (a floor one tile down) */
  at(31); flat(192, 17);         /*     31-47 the souvenir shop on the ledge (c31-36), 11 tiles of runway after it */
  at(48); gap(3);                /*     48-50 a 3 gap */
  at(51); flat(192, 19);         /* S3  51-69 the plaza: a souvenir shop (c52-56), the twinkling sign */
  at(70); flat(208, 3);          /*     70-72 THE EXPRESS LIFT's shaft */
  at(73); flat(192, 23);         /*     73-95 THE HAT LEDGE (c75-77), a second shop (c84-88), the checkpoint at c92 */
  at(96); flat(208, 3);          /* S4  96-98 THE FIRST LIFT's shaft (up 5) */
  at(99); flat(192, 171);        /*     99-269 the floor under the whole tower: the pillars, the skybridge, the deck and the steps are solid blocks on it */

  /* ---- candles ---- */
  gl(3, 12); arc(13, 17, 11, 3); gl(18, 23); gl(25, 27);                             /* S1 (the spring is c24) */
  C.push([20, 13], [21, 13], [22, 13]);                                              /* the first pocket */
  C.push([29, 10], [29, 8]); row(31, 36, 8); gl(37, 46); arc(47, 51, 11, 3);         /* S2: up the baggage lift, over the shop roof, the 3 gap */
  row(52, 56, 8); C.push([53, 11], [54, 11], [55, 11]); gl(57, 69);                  /* S3: the shop's roof and closet, the plaza */
  C.push([71, 10], [71, 8], [71, 6], [71, 4]); C.push([75, 4], [77, 4]);             /* up the express lift, on the hat ledge */
  gl(73, 74); gl(78, 83); row(84, 88, 8); C.push([85, 11], [86, 11], [87, 11]); gl(89, 95);   /* S4: the second shop */
  C.push([97, 10], [97, 8], [97, 6]); row(100, 115, 6, 2); arc(116, 121, 6, 2);      /* S4-S5: up the first lift, along the pillar, over the skybridge gap */
  row(122, 138, 6, 2); C.push([126, 2], [128, 2]);                                   /* S5: along the far half and on the view shelf */
  C.push([140, 5], [140, 3], [140, 1]); row(144, 198, 1, 2);                         /* S6-S8: up the second lift, along the deck */
  C.push([201, 2]); row(204, 216, 3, 2); C.push([218, 4]); row(220, 229, 5, 2); row(230, 235, 7, 2); row(236, 241, 9, 2);   /* S8-S9: down the window-washer lifts and the steps */
  gl(242, 244); C.push([245, 13], [246, 13], [247, 13]); gl(248, 257); row(259, 263, 8); C.push([260, 11], [261, 11], [262, 11]); gl(264, 266);   /* S10 */

  KinanLevels.register({
    id: '10-4', world: 10, slot: 4, kind: 'level',
    name: 'THE OBSERVATION TOWER',
    theme: 203,   /* high up: the Falls and the city small below, clouds drifting under us, the tower's shaft with yellow elevators */
    cols: H.length,
    /* THE YELLOW OUTSIDE ELEVATORS (World 10 twist, opt-in): [col, rowTop, rowBottom, w, speed, dwell, extraWait] — a platform that rides between
       the two rows (the rows of its deck), waits `dwell` frames at each end (green lamp; it flashes before it leaves); it starts at the bottom */
    lifts: [
      [28, 9, 12, 3, 0.7, 80, 0],        /* L0  S2 THE BAGGAGE LIFT: up 3 to the shop ledge (optional) */
      [70, 5, 12, 3, 1.2, 50, 0],        /* L5  S3 THE EXPRESS LIFT: up 7, fast, a short wait at the top (the skill secret) */
      [96, 7, 12, 3, 0.8, 90, 0],        /* L1  S4 THE FIRST LIFT: up 5 to the skybridge (the way up) */
      [139, 2, 7, 3, 0.8, 90, 150],      /* L2  S5 THE SECOND LIFT: up 5 to the deck */
      [200, 2, 4, 3, 0.6, 80, 0],        /* L3  S8 a window-washer lift: down 2 from the deck to the lower deck */
      [217, 4, 6, 3, 0.6, 80, 60]        /* L4  S9 the next one down */
    ],
    /* THE WIND (World 7, opt-in): on the far half of the skybridge and the whole deck down to the steps */
    wind: [[121, 138], [142, 229]],
    skins: [
      ['arcade', 31, 9, 36, 11], ['arcade', 52, 9, 56, 11], ['arcade', 84, 9, 88, 11], ['arcade', 259, 9, 263, 11],   /* the souvenir shops (kick boards at c56, c88, c263) */
      ['tower', 99, 7, 116, 11], ['tower', 121, 7, 138, 11], ['tower', 139, 8, 141, 11],   /* the first pillar, the far half of the skybridge, the shaft's floor */
      ['tower', 142, 2, 199, 11], ['tower', 200, 5, 202, 11], ['tower', 203, 4, 216, 11], ['tower', 217, 7, 219, 11],   /* THE DECK, the lower decks */
      ['tower', 220, 6, 229, 11], ['tower', 230, 8, 235, 11], ['tower', 236, 10, 241, 11]   /* the last deck and the steps */
    ],
    heights: H,
    solid: [
      [31, 9, 36, 11], [52, 9, 56, 11], [84, 9, 88, 11], [259, 9, 263, 11],   /* the souvenir shops */
      [99, 7, 116, 11], [121, 7, 138, 11], [139, 8, 141, 11],   /* S4-S5 the first pillar (top y=112), the far half of the skybridge, the second shaft's floor */
      [142, 2, 199, 11],   /* S6-S8 THE DECK (top y=32) */
      [200, 5, 202, 11], [203, 4, 216, 11], [217, 7, 219, 11],   /* S8-S9 the lower deck (top y=64) and the shafts' floors */
      [220, 6, 229, 11], [230, 8, 235, 11], [236, 10, 241, 11]   /* S9 the last deck (top y=96) and the steps (y=128, y=160) */
    ],
    open: [
      [20, 13, 22, 13], [245, 13, 247, 13],   /* SLAM SPOTS: the pockets under the cracked boards, solid floor under them */
      [53, 11, 55, 11], [85, 11, 87, 11], [260, 11, 262, 11]   /* the shops' closets, sealed by a kick board */
    ],
    tiles: {
      crack: [[20, 12], [21, 12], [22, 12], [245, 12], [246, 12], [247, 12]],
      board: [[56, 11], [88, 11], [263, 11]],   /* KICK SPOTS (bonus) */
      gift: [
        [6, 8],              /* S1 */
        [33, 5],             /* S2 over the shop ledge */
        [42, 8],             /* S2 */
        [60, 8],             /* S3 */
        [68, 6, 'gold'],     /* S3 THE TWINKLING SIGN: the glinting block (hidden) */
        [92, 8],             /* S4 */
        [108, 3],            /* S5 over the first pillar */
        [132, 3],            /* S5 over the far half of the skybridge */
        [243, 8, 'heart'], [245, 8, 'cake']   /* S10 */
      ],
      brick: [[5, 8], [7, 8], [242, 8], [244, 8], [246, 8]],
      spring: [[24, 11]],
      shelf: [
        [126, 3], [127, 3], [128, 3],   /* S5 THE VIEW SHELF (visible secret) */
        [75, 5], [76, 5], [77, 5]       /* S3 THE HAT LEDGE (skill secret): the express lift's top is across a 2 tile gap */
      ]
    },
    /* tourists with cameras, street food and buskers; seagulls and camera drones up high. Nothing waits at a lip. */
    foes: [
      [9, 11, 'mallwalker'],                          /* S1 */
      [14, 5, 'seagull'], [43, 11, 'corndog'],        /* S1-S2 (the seagull over the fountain's gap, clear of the spring's bounce) */
      [34, 8, 'cart'],                                /* S2 on the shop ledge */
      [60, 11, 'drummer'], [66, 5, 'camera'],         /* S3 */
      [80, 11, 'mallwalker'], [92, 11, 'corndog'],    /* S4 */
      [106, 6, 'mallwalker'], [112, 3, 'seagull'],    /* S5 on the first pillar */
      [126, 6, 'cart'], [118, 3, 'seagull'],          /* S5 on the skybridge */
      [150, 1, 'mallwalker'], [156, 0, 'seagull'],    /* S6 on the deck */
      [164, 1, 'cart'], [172, 1, 'corndog'],          /* S7 */
      [180, 0, 'seagull'], [184, 1, 'drummer'],       /* S7 */
      [192, 1, 'mallwalker'], [208, 3, 'cart'],       /* S8 */
      [224, 5, 'mallwalker'], [233, 7, 'corndog'],    /* S9 */
      [250, 11, 'drummer'], [256, 11, 'mallwalker']   /* S10 */
    ],
    candles: C,
    secrets: [
      { kind: 'visible', col: 127, row: 2, prize: 'heart+candles' },       /* THE VIEW SHELF: a full jump up from the skybridge */
      { kind: 'hidden', col: 68, row: 6, prize: 'GOLDEN CANDLE', glint240: true },   /* THE TWINKLING SIGN: the glinting block over the plaza */
      { kind: 'skill', col: 76, row: 4, prize: 'hat' }                     /* THE EXPRESS LIFT: step off across the gap to the hat ledge */
    ],
    goldenCandle: { col: 68, row: 6 },
    checkpoint: { col: 92, row: 11 },
    spawn: { col: 2, row: 11 },
    goal: { col: 267, row: 11 },   /* the foot of the steps, past the last shop */
    talk: [
      [2, 'KINAN', "The Observation Tower! The yellow outside elevators go all the way to the top, and Glitchy is already riding one!", 4.4],
      [3, 'DAD', "This tower is so tall, bud, it's the high-light of the trip! Hold on to your hat. And your lunch.", 3.8],
      [4, 'MOM', "Elevators, sweetie? Only if you're sure. The wind blows hard up at the top.", 3.6],
      [24, 'CHENOA', "That's a baggage lift! Step on and it carries you up. A green lamp means it is waiting for you.", 4.2],
      [40, 'DAD', "Why did the elevator get invited to the party? Because it really knew how to lift the... hee... the SPIRITS... I can't—", 4.8, 'wheeze'],
      [40, 'CHENOA', "...spirits. It lifted the spirits. Dad, we get it.", 3],
      [53, 'CHENOA', "A wooden board on that shop! Stand next to it and press KICK. Candles inside.", 3.6],
      [64, 'DAD', "That sign up there is twinkling, bud. Strange! I'd say it's a bit light-headed. Jump under it.", 3.8],
      [68, 'SHAD', "The yellow lamp flashes just before the lift leaves, little bro. And the express lift only waits a moment!", 4],
      [94, 'MOM', "This is the real tower, sweetie. The lift only goes where you step on it. I'll be right behind you.", 3.8],
      [112, 'DAD', "I used to be afraid of elevators, but now I'm taking steps to avoid them!", 3.4],
      [112, 'MOM', "Is that all you do, tell jokes? I am going up the lift. Alone.", 3.2, 'walkoff'],
      [112, 'DAD', "...I'll be here all week! Well, till the top.", 2.8],
      [117, 'CHENOA', "A gap in the skybridge! Jump it, little bro. The floor is a long way down from here.", 3.6],
      [144, 'MOM', "Hold on up here, sweetie. The wind pushes you back, but never off the edge.", 3.6],
      [152, 'GRANDPA', "Grandpa here, at the top! Why was the elevator such a good worker? It always raised its game! Tell your dad that one's mine.", 5.4],
      [196, 'SHAD', "Two little lifts go down from the deck, like window washers. Step on, or just hop down.", 3.8],
      [243, 'KINAN', "We made it down! And Glitchy is running off toward the glass dome and the butterflies!", 3.6]
    ]
  });
})();

/* ============================================================
   SECRET · THE FIREWORKS BARGE  (World 10 · Niagara Falls · trail stop 8)
   Story bible (World 10 table): "Fireworks launch platforms over the
   river at night. A reward level." Found through 10-6's secret exit: a
   string of fireworks barges anchored in the Niagara River, the Falls lit
   in colours behind them, and the whole sky about to go off. No hurry, no
   hard parts: this one is a present.
   Idea: LAUNCH PADS AND A SKY FULL OF CANDLES. Each barge ends in a LAUNCH
     PAD (two spring tiles set flush in the deck at its edge, dressed as a
     firework mortar: skin 'launchpad'): step on it and it throws Kinan about
     9 tiles up and 10 tiles ahead, over the river gap and onto the next
     barge, right through a BURST of candles hung in the sky like a
     firework (rings of candles, a second small burst on the way down). A
     pad at the very lip carries even a slow walk over the gap (a walking
     bounce comes down 5-6 tiles on, the gaps are 3-4 wide), and every
     barge has 30 tiles of deck with no pit inside it. Every gap is also a
     plain running jump away (3/3 then 4/4/4/4). The decks are strung with
     two rows of candles, every barge has a gift, and the last barge holds
     a finale of three huge bursts and a row of heart and cake gifts.
   Route: B1 the dock barge 3 · B2 3 · B3 (a fireworks crate to kick) 4 ·
     B4 4 · B5 (the checkpoint, a second crate) 4 · B6 4 · B7 the finale
     barge and the goal.
   Gaps: 3/3 (act 1) · 4/4 (act 2) · 4/4 (act 3). A full-run jump off the
     crates comes down on deck (w10-levels.spec.ts checks it); no pad is
     within 8 tiles of a crate, and no gift or block stands in a pad's arc.
     Secret slot: exempt from the 3-secrets lint (the whole level is the
     reward). KICK BOARDS seal two fireworks crates (c86-90, c160-164; 3
     candles each; Chenoa says so); SLAM SPOTS: cracked boards at c125-127
     and c196-198 over pockets of candles (solid floor underneath).
   Look: the Fireworks Barge (theme 209, World 10's own look): night over the Niagara
     River, stars, the Falls lit in changing colours, a hotel skyline, many fireworks
     bursting in the sky, the river shimmering.
   Jokes: Dad on fireworks (the wheeze), Mom laughs; GRANDPA's cameo; Annie's "Hai
     Rabba!".
   ENGINE REQUESTS: none.
   ============================================================ */
(function () {
  const H = [], C = [];
  const at = (c) => { if (H.length !== c) throw new Error('10-secret: expected column ' + c + ' but the ground is at ' + H.length); };
  const flat = (v, n) => { for (let i = 0; i < n; i++) H.push(v); };
  const gap = (n) => flat(null, n);
  const gl = (c0, c1, up) => { for (let c = c0; c <= c1; c++) if (H[c] != null) C.push([c, 11 - (up || 0)]); };
  const burst = (cx, cy, r, n) => { for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2; C.push([Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * 0.8)]); } C.push([cx, cy]); };

  at(0); flat(192, 31);          /* B1  0-30  the dock barge (spawn c2): launch pad at its edge (c29-30) */
  at(31); gap(3);                /*     31-33 river gap 1 (3) */
  at(34); flat(192, 32);         /* B2  34-65  pad (c64-65) */
  at(66); gap(3);                /*     66-68 river gap 2 (3) */
  at(69); flat(192, 34);         /* B3  69-102 a fireworks crate (c86-90), pad (c101-102) */
  at(103); gap(4);               /*     103-106 river gap 3 (4, act 2) */
  at(107); flat(192, 32);        /* B4  107-138 cracked boards (c125-127), pad (c137-138) */
  at(139); gap(4);               /*     139-142 river gap 4 (4) */
  at(143); flat(192, 34);        /* B5  143-176 the checkpoint (c146), a second fireworks crate (c160-164), pad (c175-176) */
  at(177); gap(4);               /*     177-180 river gap 5 (4, act 3) */
  at(181); flat(192, 34);        /* B6  181-214 cracked boards (c196-198), pad (c213-214) */
  at(215); gap(4);               /*     215-218 river gap 6 (4) */
  at(219); flat(192, 21);        /* B7  219-239 the finale barge: three huge bursts, the gift row, the goal */

  /* ---- candles: two rows on every deck, a burst over every gap (a big ring and a small one on the way down), the finale ---- */
  const decks = [[2, 27], [35, 61], [70, 85], [91, 99], [108, 134], [144, 159], [165, 172], [182, 210], [220, 238]];   /* (no candle in a crate: c86-90, c160-164) */
  for (const [a, b] of decks) { gl(a, b); for (let c = a; c <= b; c += 1) if (c % 2 === 0) C.push([c, 9]); }
  for (const gs of [31, 66, 103, 139, 177, 215]) { burst(gs + 4, 3, 3, 12); burst(gs + 4, 3, 1, 4); burst(gs + 9, 6, 2, 8); }
  for (const [a, b] of [[28, 30], [63, 65], [100, 102], [136, 138], [174, 176], [212, 214]]) gl(a - 1, a - 1);   /* a candle before each pad */
  C.push([86, 8], [87, 8], [88, 8], [89, 8], [90, 8], [87, 11], [88, 11], [89, 11]);                              /* the first crate's roof and closet */
  C.push([160, 8], [161, 8], [162, 8], [163, 8], [164, 8], [161, 11], [162, 11], [163, 11]);                      /* the second crate's roof and closet */
  C.push([125, 13], [126, 13], [127, 13], [196, 13], [197, 13], [198, 13]);                                      /* the two pockets */
  burst(226, 4, 4, 16); burst(226, 4, 2, 8); burst(233, 3, 3, 12); burst(236, 6, 2, 8);                          /* the finale */
  const seen = {}, candles = [];
  for (const c of C) { const key = c[0] + ',' + c[1]; if (!seen[key]) { seen[key] = 1; candles.push(c); } }

  KinanLevels.register({
    id: '10-secret', world: 10, slot: 8, kind: 'secret',
    name: 'THE FIREWORKS BARGE',
    theme: 209,   /* night over the Niagara River: stars, the Falls lit in colours, a hotel skyline, fireworks bursting, the river shimmering */
    cols: H.length,
    skins: [
      ['launchpad', 29, 11, 30, 12], ['launchpad', 64, 11, 65, 12], ['launchpad', 101, 11, 102, 12],
      ['launchpad', 137, 11, 138, 12], ['launchpad', 175, 11, 176, 12], ['launchpad', 213, 11, 214, 12],   /* THE LAUNCH PADS (the spring tiles under them) */
      ['basket', 86, 9, 90, 11], ['basket', 160, 9, 164, 11]   /* the fireworks crates (kick boards at c90 and c164) */
    ],
    heights: H,
    solid: [
      [86, 9, 90, 11], [160, 9, 164, 11]   /* the fireworks crates */
    ],
    open: [
      [125, 13, 127, 13], [196, 13, 198, 13],   /* SLAM SPOTS: the pockets under the cracked boards, solid floor under them */
      [87, 11, 89, 11], [161, 11, 163, 11]      /* the crates' closets, sealed by a kick board */
    ],
    tiles: {
      crack: [[125, 12], [126, 12], [127, 12], [196, 12], [197, 12], [198, 12]],
      board: [[90, 11], [164, 11]],   /* KICK SPOTS (bonus) */
      gift: [
        [6, 8], [14, 8],           /* B1 */
        [42, 8], [52, 8],          /* B2 */
        [76, 8], [82, 8],          /* B3 */
        [116, 8], [124, 8],        /* B4 */
        [150, 8], [156, 8],        /* B5 */
        [188, 8], [194, 8],        /* B6 */
        [228, 8, 'heart'], [230, 8, 'cake'], [232, 8, 'heart'], [234, 8, 'cake']   /* B7 the gift row */
      ],
      brick: [[5, 8], [7, 8], [227, 8], [229, 8], [231, 8], [233, 8], [235, 8]],
      spring: [
        [29, 12], [30, 12], [64, 12], [65, 12], [101, 12], [102, 12], [137, 12], [138, 12], [175, 12], [176, 12], [213, 12], [214, 12]   /* THE LAUNCH PADS, flush in the deck at each barge's edge */
      ]
    },
    /* a few crew members on deck and sparkers high over the barges; nothing near a pad or its arc */
    foes: [
      [10, 11, 'mallwalker'], [50, 5, 'sparkler'],
      [80, 11, 'mallwalker'], [118, 11, 'mallwalker'],
      [154, 11, 'mallwalker'], [203, 5, 'sparkler'], [200, 11, 'mallwalker'], [236, 11, 'mallwalker']
    ],
    candles: candles,
    checkpoint: { col: 146, row: 11 },
    spawn: { col: 2, row: 11 },
    goal: { col: 237, row: 11 },   /* the end of the last barge */
    talk: [
      [2, 'KINAN', "A secret barge on the Niagara River! Fireworks are about to start, and look, there are launch pads!", 4.2],
      [3, 'DAD', "Best seat in the house, bud. I'm all fired up. This is a real blast!", 3.2],
      [4, 'ANNIE', "Hai Rabba! (Oh my goodness!) Look at all the candles hanging in the sky!", 3.6],
      [20, 'CHENOA', "Step onto a launch pad and it throws you right across the river, through the fireworks!", 3.8],
      [38, 'DAD', "Why did the firework go to school? To get a little... hee... a little... HA... I can't—", 4.2, 'wheeze'],
      [38, 'KINAN', "...a bang-ucation. A BANG-ucation, Dad.", 3],
      [38, 'MOM', "Ha! A bang-ucation! Oh, you two. This is the nicest surprise, sweetie.", 3.4, 'laugh'],
      [84, 'CHENOA', "A wooden board on that fireworks crate! Stand next to it and press KICK.", 3.4],
      [120, 'MOM', "Look at those colours over the water, Kinan. I think you might be ready after all.", 3.8],
      [180, 'GRANDPA', "Kinan, my boy! Why did the firework get promoted? It was outstanding in its... SKY! Tell your dad that one's mine.", 5.2],
      [236, 'KINAN', "What a night! Glitchy is waiting for me at the party... but first, a few more candles for the birthday cake!", 4.2]
    ]
  });
})();

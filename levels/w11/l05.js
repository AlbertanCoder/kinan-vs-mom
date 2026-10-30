/* ============================================================
   LEVEL 11-5 · MINI CAKE MULTIVERSE
   (World 11 · Inside the Console · trail stop 5)
   Story bible (World 11 table): "Chocolate-cake islands joined by
   see-through glowing glass bridges. Realm boss MIRROR KINAN, a glitch
   copy of Kinan." Shad could not decide on one flavour, so every island
   is a different cake, floating in a sweet sky of cotton-candy clouds,
   giant candles and falling sprinkles. The islands are joined by
   glass bridges that only appear when a candle switch is lit. Glitchy's
   panic made a copy of Kinan in the glass: MIRROR KINAN waits at the
   end (second run).
   Idea (ONE): GLASS BRIDGES (opt-in `glass`, new in World 11). A candle
     switch is a little cake plate with a pink candle on the floor
     (STEP): step on it and the glass bridge tiles over the gap fade in
     (a faint dashed outline shows where they will be) and stay for
     6-8 seconds, flickering for the last second before they go. They
     never go while Kinan is on them: the timer waits until he is off.
     Step on the switch again for a fresh timer. Where a gap sits under
     a LOW CAKE OVERHANG (two tiles of headroom) a jump from the floor
     cannot cross it (w11-levels.spec.ts tries every take-off frame),
     so the bridge is the way; only a frame-perfect coyote jump taken
     after dropping past the lip squeezes over a 3 or 4 gap, never a
     5. The first bridge (no overhang) just teaches the idea.
   Acts (thirds): 0-86 teach (a switch, a bridge over a 3 gap with open
     sky, a second under an overhang, a glass staircase off the path) ·
     87-174 twist (a 4 gap under an overhang, a short island, a second
     4 gap, a 4 gap with a glass staircase above it) · 175-261 test
     (ONE switch lights THREE bridges in a row: 5, 5 and 4, with islands
     between and one long overhang; the reward and the mirror's floor).
   Secrets (NEW here, tied to the idea):
     visible = THE GLASS STAIRCASE (S1): a candle switch on a floating
       cake ledge; step on it and glass stairs climb to a floating
       island with a heart and candles. Climb before they fade (heart +
       candles, 31,5) ·
     hidden = THE FROSTING DRIP (S4): one block in the overhang over the
       third bridge glints; jump up under it from the island (GOLDEN
       CANDLE, 108,9) ·
     skill = THE UPPER GLASS (S6): the switch before the fourth gap lights
       a lower bridge and four glass steps above it that climb to a cake
       slab: hop them while the glass waits for you (hat, 156,4).
   Bonus (never needed): two wooden boards (plinth nooks S2, S9), two
     slam spots (cracked cake S1, S7).
   FLAT OPEN GROUND FOR THE BOSS (the second run): columns 226-261 are
     flat at 192 (36 tiles). arena { col: 232, cols: 24, boss:
     'mirror-kinan' } would put its gates at c231 and c256 and its
     checkpoint flag at c228. The goal stands at c258. Nothing solid, no
     gift, no foe lives in c226-261; the four candles there (c230, 238,
     246, 254) only keep the lint's flat-run rule quiet: take them out
     when the arena goes in. A gift at c224 and one at c259 (past the
     right gate) keep every screen's toy.
   Gaps: act 1 3/3 · act 2 4/4/4 · act 3 5/5/4. Nothing waits at a lip.
     A bridge pad is always 8 or more tiles before its gap, so the glass
     is there when he arrives; no gap lies within 14 tiles of a high spot.
   Look: theme 134, CON_LOOKS: a purple-to-pink sky of cotton-candy
     clouds, tall cakes, lollipops and candles, falling sprinkles.
   ENGINE REQUESTS: MIRROR KINAN himself (the second run).
   ============================================================ */
(function () {
  var N = 262, H = [], S = [], OP = [], SK = [], cd = [], fo = [], GL = [];
  var TL = { gift: [], brick: [], spring: [], shelf: [], board: [], crack: [], crate: [] };
  for (var i = 0; i < N; i++) H.push(192);
  function pit(c0, c1) { for (var c = c0; c <= c1; c++) H[c] = null; }
  function box(c0, r0, c1, r1, skin) { S.push([c0, r0, c1, r1]); if (skin) SK.push([skin, c0, r0, c1, r1]); }
  function stand(c) { return Math.floor(H[c] / 16) - 1; }
  function run(c0, c1, step) { for (var c = c0; c <= c1; c += step || 2) if (H[c] != null) cd.push([c, stand(c)]); }
  function row(c0, c1) { for (var c = c0; c <= c1; c++) cd.push([c, 11]); }   /* a candle trail along the floor line, over the gaps too (the glass carries it) */
  function arc(c0, c1, peak, row) { for (var c = c0; c <= c1; c++) { var t = (c - c0) / (c1 - c0); cd.push([c, Math.round(row - peak * 4 * t * (1 - t))]); } }
  function inBox(c, r, R) { return R.some(function (b) { return c >= b[0] && c <= b[2] && r >= b[1] && r <= b[3]; }); }
  function blocked(c, r) { return (inBox(c, r, S) && !inBox(c, r, OP)) || ['gift', 'brick', 'spring', 'shelf', 'board', 'crack', 'crate'].some(function (k) { return TL[k].some(function (t) { return t[0] === c && t[1] === r; }); }); }
  function plinth(c, w) {   /* BONUS: a 2-tall cake block with a hollow; a KICK breaks the board that seals it (the path hops over it) */
    box(c, 10, c + w + 1, 11, 'cakewall'); OP.push([c + 1, 11, c + w, 11]); TL.board.push([c, 11]);
    for (var i = 1; i <= w; i++) cd.push([c + i, 11]);
  }
  function slam(c, w) {   /* BONUS: cracked floor over a pocket of candles (a butt slam; solid floor under the pocket) */
    OP.push([c, 13, c + w - 1, 13]);
    for (var i = 0; i < w; i++) { TL.crack.push([c + i, 12]); cd.push([c + i, 13]); }
  }
  function glass(sw, secs, deck) { GL.push({ at: sw, deck: deck, secs: secs }); }

  /* ---- the gaps, and the glass over them ---- */
  pit(32, 34); pit(70, 72); pit(113, 116); pit(136, 139); pit(150, 153); pit(190, 194); pit(199, 203); pit(208, 211);

  /* ---- ACT 1 ---- */
  TL.gift.push([6, 8, 'candle']); TL.brick.push([5, 8], [7, 8]);
  fo.push([9, 11, 'cupcake'], [22, 11, 'egg']);
  glass([12, 11], 6, [[32, 34, 12]]);                                    /* the first switch: open sky, a 3 gap; just teaches it */
  arc(31, 35, 3, 11); run(3, 10, 2); run(14, 16, 2);
  /* THE GLASS STAIRCASE (visible secret): a candle switch on a floating ledge; glass stairs climb to a floating island */
  box(17, 9, 20, 9, 'cakewall');
  glass([18, 8], 7, [[21, 22, 9], [23, 24, 8], [25, 26, 7], [27, 28, 6]]);
  box(29, 6, 33, 6, 'cakewall'); cd.push([19, 7], [22, 8], [24, 7], [26, 6], [28, 5], [30, 5], [32, 5]);
  slam(24, 3);                                                           /* BONUS SLAM 1 */
  fo.push([28, 11, 'toast'], [39, 7, 'sparkler']);
  TL.gift.push([38, 8, 'candle']); TL.brick.push([37, 8], [39, 8]);
  run(36, 41, 2);
  glass([42, 11], 6, [[70, 72, 12]]);                                    /* the second switch: a 3 gap under an overhang, so the glass is the way */
  box(62, 6, 74, 9, 'cakewall');
  plinth(48, 3);                                                         /* BONUS BOARD 1 */
  fo.push([57, 11, 'cupcake'], [66, 11, 'egg']);
  run(44, 47, 2); run(58, 68, 2); row(69, 74);
  TL.gift.push([55, 8, 'heart']);
  fo.push([79, 11, 'egg']);
  TL.gift.push([77, 8, 'candle']); TL.brick.push([76, 8], [78, 8]);
  run(75, 96, 2);
  /* ---- ACT 2 ---- */
  TL.gift.push([84, 8, 'candle']); TL.brick.push([83, 8], [85, 8]);
  fo.push([92, 11, 'broccoli'], [96, 7, 'sparkler']);
  glass([98, 11], 6, [[113, 116, 12]]);                                  /* a 4 gap under an overhang; THE FROSTING DRIP hides in it */
  box(105, 6, 118, 9); TL.gift.push([108, 9, 'gold']);                  /* (no skin: the glint must show) */
  fo.push([101, 11, 'cupcake'], [110, 11, 'broccoli']);
  run(100, 111, 2); row(112, 117);
  /* a short island between two bridges */
  run(118, 134, 2);
  glass([122, 11], 6, [[136, 139, 12]]);
  box(128, 6, 141, 9, 'cakewall');
  fo.push([124, 11, 'egg'], [131, 11, 'egg']);
  TL.gift.push([120, 8, 'candle']); TL.brick.push([119, 8], [121, 8]);
  row(135, 141);
  /* THE UPPER GLASS (skill secret): a bridge over the fourth gap, and glass steps above it up to a cake slab */
  glass([144, 11], 7, [[150, 153, 12], [149, 150, 9], [152, 153, 7]]);
  box(155, 5, 158, 5, 'cakewall'); cd.push([149, 8], [152, 6], [153, 6], [156, 4], [157, 4]);
  fo.push([146, 11, 'broccoli'], [160, 11, 'toast']);
  TL.gift.push([142, 8, 'cake']); row(150, 154);
  run(155, 170, 2);
  slam(163, 3);                                                          /* BONUS SLAM 2 */
  fo.push([167, 11, 'egg']);
  /* ---- ACT 3 ---- */
  TL.gift.push([168, 8, 'candle']); TL.brick.push([167, 8], [169, 8]);
  glass([176, 11], 8, [[190, 194, 12], [199, 203, 12], [208, 211, 12]]);  /* ONE switch, THREE bridges, one long overhang */
  box(182, 6, 213, 9, 'cakewall');
  fo.push([180, 11, 'cupcake'], [187, 11, 'egg'], [196, 11, 'egg'], [206, 11, 'broccoli']);
  run(178, 188, 2); row(189, 212);
  TL.gift.push([172, 8, 'heart']);
  plinth(216, 3);                                                        /* BONUS BOARD 2 */
  run(214, 224, 2);
  fo.push([221, 11, 'broccoli']);
  /* the mirror's floor c226-261 stays EMPTY (MIRROR KINAN's arena, c232-255) */
  TL.gift.push([224, 8, 'candle']);
  TL.gift.push([259, 8, 'heart']);

  var cdOk = cd.filter(function (p, i) { return !blocked(p[0], p[1]) && cd.findIndex(function (q) { return q[0] === p[0] && q[1] === p[1]; }) === i; });
  KinanLevels.register({
    id: '11-5', world: 11, slot: 5, kind: 'level',
    name: 'MINI CAKE MULTIVERSE',
    theme: 134,   /* the cake multiverse: a candy sky, chocolate cake islands, glowing glass */
    cols: N,
    /* GLASS BRIDGES (World 11 twist, opt-in): { at: [c, r] the candle switch, deck: [[c0, c1, row], ...], secs } */
    glass: GL,
    heights: H, solid: S, open: OP, skins: SK, tiles: TL, foes: fo, candles: cdOk,
    secrets: [
      { kind: 'visible', col: 31, row: 5, prize: 'heart+candles' },   /* THE GLASS STAIRCASE */
      { kind: 'hidden', col: 108, row: 9, prize: 'GOLDEN CANDLE', glint240: true },   /* THE FROSTING DRIP */
      { kind: 'skill', col: 156, row: 4, prize: 'hat' }   /* THE UPPER GLASS */
    ],
    goldenCandle: { col: 108, row: 9 },
    checkpoint: { col: 172, row: 11 },
    /* MIRROR KINAN (index.html ARENA_KINDS 'mirror-kinan', 3 phases): gates c231 and c256, his flag at c228. He copies
       Kinan's moves a moment later and his body never hurts; step off the glowing footsteps, jump his glitch sparks,
       and when he stops to load, walk onto the glowing switch pad so he copies you onto it */
    arena: { col: 232, cols: 24, boss: 'mirror-kinan' },
    spawn: { col: 2, row: 11 },
    goal: { col: 258, row: 11 },
    talk: [
      [2, 'SHAD', "The Cake Multiverse! I couldn't pick one flavour, so every island is a different cake. Sorry!", 4.4],
      [4, 'KINAN', "Cake islands floating in the sky, and glass bridges that glow! This is amazing.", 3.8],
      [6, 'DAD', "Not to be a crumb-mudgeon, bud, but mind the gaps. This place is sweet, though.", 3.8],
      [8, 'CHENOA', "See the little candle plate on the floor? Step on it and a glass bridge fades in for a few seconds!", 4.6],
      [14, 'ANNIE', "Shabash! (Well done!) The glass waits for you while you are standing on it. Chalo! (Let's go!)", 4.6],
      [40, 'MOM', "A low cake roof here, sweetie. You can't jump the gap under it, so use the glass.", 4.2],
      [56, 'DAD', "Why did the cake go to the dentist? It had a... hee hee... a really bad... CAVITY-in-the-sky... I can't—", 4.4, 'wheeze'],
      [56, 'CHENOA', '...Dad. Stop. Please. The glass is going to hear you.', 3.4],
      [96, 'ANNIE', "Hai Rabba! (Oh my goodness!) One block in that cake roof is glowing. Maybe a secret.", 4.2],
      [142, 'SHAD', "Glass stairs above the next bridge, little bro. Hop them while the glass waits for you.", 4.2],
      [172, 'MOM', "Is that all you do, tell jokes? Ahead, one switch lights three bridges. Keep going, honey.", 4, 'walkoff'],
      [172, 'DAD', "...I'll be here all week! Cake-walk, bud!", 3],
      [226, 'ANNIE', "The glass... I can see another Kinan in it. A glitch copy. Be ready, Kinan.", 4.2],
      [229, 'KINAN', "That's... me?! A mirror copy. Glitchy's panic made it. We'll show it it's okay.", 4.4],
      [258, 'CHENOA', "A high five with yourself. Little bro, that's the coolest thing I've ever seen.", 3.8]
    ]
  });
})();

/* ============================================================
   LEVEL 11-1 · THE WRONG-WAY PORTAL
   (World 11 · Inside the Console · trail stop 1)
   Story bible (World 11 table): "Through the door: everything is
   upside-down and wrong." Through the door in the mist at Niagara Falls
   is the inside of Shad's console: Glitchy's home. The sky hangs from
   the top, houses dangle by their roofs, circuit boards float by, and
   pieces of the earlier worlds (a sock, a teddy, a toast) turn up in
   the wrong places. Shad: "I never finished this one..." The whole team
   is here, Mom too.
   Idea (ONE): THE CONTROLS FLIP, for ONE short stretch (opt-in `flip`,
     new in World 11). A big clear sign stands before it (CONTROLS
     FLIP! LEFT = RIGHT), then three number plates on the ground, 3-2-1
     (a calm countdown by POSITION, so it waits as long as Kinan does),
     then LEFT is RIGHT for 23 tiles; three more plates 3-2-1 count it
     back, and from the NORMAL line on the controls are normal for good.
     The whole stretch (and 9 tiles each side) is flat, pit-free ground:
     a flipped step can never drop him into a pit. Jumping never flips.
   Acts (thirds): 0-76 teach (the arrival, a 3 gap, a hill, a 2 gap) ·
     77-154 twist (a 4 gap, the checkpoint, THE SIGN, the 3-2-1, the
     flipped stretch with hurdles and two floating chips, the 3-2-1
     back) · 155-231 test (4, 4, 5 with normal controls, the reward).
   Secrets (NEW here, tied to the idea):
     visible = THE SPRING SHELF (S2): a shelf six tiles up, a glowing
       arc of candles over the spring below it; one bounce (heart +
       candles, 46,4) ·
     hidden = THE GLITCH BLOCK (S7): a glitch-brick block hangs over the
       floor; one block in it glints; jump under it (GOLDEN CANDLE) ·
     skill = THE FLIPPED CLIMB (S5): two floating chips above the
       flipped stretch: hop up them WHILE LEFT IS RIGHT (hat).
   Bonus (never needed): two wooden boards (a kicked plinth nook in S3
     and one in S8), two slam spots (cracked floor boards over candle
     pockets in S4 and S8).
   Gaps: act 1 3/2 · act 2 4 · act 3 4/4/5. Nothing waits at a lip. A
     full-run jump off the hill, the hurdles or the floating chips
     comes down on floor (w11-levels.spec.ts checks it).
   Look: theme 130, CON_LOOKS: a glitchy violet void, the world hanging
     upside down from the top edge, floating circuit pieces, the odd
     glitch tear.
   ENGINE REQUESTS: none (the `flip` key is added in index.html,
     "WORLD 11 TWISTS").
   ============================================================ */
(function () {
  var H = [], S = [], OP = [], SK = [], at = {}, cd = [], fo = [], talk = [];
  var TL = { gift: [], brick: [], spring: [], shelf: [], board: [], crack: [], crate: [] };
  function mark(n) { at[n] = H.length; }
  function flat(h, n) { for (var i = 0; i < n; i++) H.push(h); }
  function pit(n) { flat(null, n); }
  function ramp(to) { var h = H[H.length - 1]; while (h !== to) { h += to > h ? 8 : -8; if (h !== to) H.push(h); } }
  function box(c0, r0, c1, r1, skin) { S.push([c0, r0, c1, r1]); if (skin) SK.push([skin, c0, r0, c1, r1]); }
  function stand(c) { return Math.floor(H[c] / 16) - 1; }
  function run(c0, c1, step, lift) { for (var c = c0; c <= c1; c += step || 2) cd.push([c, stand(c) - (lift || 0)]); }
  function arc(c0, c1, peak, row) { for (var c = c0; c <= c1; c++) { var t = (c - c0) / (c1 - c0); cd.push([c, Math.round(row - peak * 4 * t * (1 - t))]); } }
  function inBox(c, r, R) { return R.some(function (b) { return c >= b[0] && c <= b[2] && r >= b[1] && r <= b[3]; }); }
  function blocked(c, r) { return (inBox(c, r, S) && !inBox(c, r, OP)) || ['gift', 'brick', 'spring', 'shelf', 'board', 'crack', 'crate'].some(function (k) { return TL[k].some(function (t) { return t[0] === c && t[1] === r; }); }); }
  function plinth(c, w) {   /* BONUS: a 2-tall block with a hollow; a KICK breaks the board that seals it (never on the main path: the path jumps over it) */
    box(c, 10, c + w + 1, 11, 'chip'); OP.push([c + 1, 11, c + w, 11]); TL.board.push([c, 11]);
    for (var i = 1; i <= w; i++) cd.push([c + i, 11]);
  }
  function slam(c, w) {   /* BONUS: cracked floor boards over a pocket of candles (a butt slam breaks them; solid floor under the pocket) */
    OP.push([c, 13, c + w - 1, 13]);
    for (var i = 0; i < w; i++) { TL.crack.push([c + i, 12]); cd.push([c + i, 13]); }
  }

  /* ---- the ground: S1 0-26 · S2 27-53 · S3 54-80 · S4 81-107 ... one screen is 27 columns ---- */
  mark('s1'); flat(192, 27);                                         /* S1 the arrival */
  mark('s2'); flat(192, 6); pit(3); flat(192, 18);                    /* S2 a 3 gap (c33-35) */
  mark('s3'); flat(192, 4); ramp(176); flat(176, 5); ramp(192); flat(192, 8); pit(2); flat(192, 4);   /* S3 a hill (c58-64), a 2 gap (c73-74) */
  mark('s4'); flat(192, 6); pit(4); flat(192, 66);                    /* S4 a 4 gap (c85-88), then flat for the sign and the flipped stretch (c89-154) */
  mark('s5'); flat(192, 6); pit(4); flat(192, 8); pit(4); flat(192, 14); pit(5); flat(192, 12);   /* act 3: 4 (c161-164), 4 (c173-176), 5 (c191-195) */
  mark('s6'); flat(192, 24);                                          /* the reward screen and the goal */

  /* ---- S1: the arrival ---- */
  box(14, 10, 15, 11, 'chip');                                        /* the first step: two tiles to hop */
  TL.gift.push([9, 8, 'candle']); TL.brick.push([8, 8], [10, 8]);
  fo.push([20, 11, 'sock']);
  run(3, 12, 2); run(17, 26, 2);
  /* ---- S2: a 3 gap, a spring and THE SPRING SHELF (visible secret) ---- */
  arc(32, 36, 3, 11);
  TL.spring.push([42, 11]); for (var sh = 45; sh <= 50; sh++) TL.shelf.push([sh, 5]);
  cd.push([43, 9], [44, 6], [45, 4], [47, 4], [49, 4]);                /* the arc up to THE SPRING SHELF; the secret itself floats at (46,4) */
  fo.push([39, 11, 'teddy'], [51, 11, 'toast']);
  run(38, 40, 2); run(49, 53, 2);
  /* ---- S3: a hill, a nook for the board, a 2 gap ---- */
  fo.push([61, 10, 'robot']); fo.push([76, 11, 'sock']);
  run(55, 63, 2); arc(72, 75, 2, 11); run(76, 78, 2);
  plinth(66, 3);                                                      /* BONUS BOARD: the nook right after the hill */
  /* ---- S4: the checkpoint, a 4 gap, a slam spot, then the sign (the flip is ahead) ---- */
  TL.gift.push([82, 8, 'candle']); TL.brick.push([81, 8], [83, 8]);
  arc(84, 89, 4, 11); run(90, 93, 2);
  slam(97, 3);                                                        /* BONUS SLAM: cracked boards right before the sign */
  fo.push([93, 11, 'egg']);
  TL.gift.push([101, 8, 'heart']);
  run(103, 108, 2);
  /* ---- S5-S6: THE FLIP (the sign at c100, plates at c109 112 115, flipped c118-140, plates c141 144 147, normal c150) ---- */
  run(110, 117, 2);
  TL.gift.push([126, 8, 'candle']);
  box(120, 11, 120, 11, 'chip'); box(123, 11, 123, 11, 'chip');       /* two low hurdles to hop while LEFT is RIGHT (far from the chips: the dev bot stays on the floor) */
  fo.push([127, 11, 'teddy'], [144, 11, 'toast']);
  box(130, 9, 132, 9, 'chip'); box(135, 7, 137, 7, 'chip');           /* THE FLIPPED CLIMB (skill secret): hop up two floating chips */
  cd.push([131, 8], [136, 6], [137, 6]);
  run(118, 119, 1); run(121, 122, 1); run(124, 129, 2); run(133, 134, 1); run(139, 142, 2); run(143, 148, 2);
  TL.gift.push([147, 8, 'cake']);
  fo.push([133, 11, 'sock']);
  run(151, 160, 2);
  /* ---- S6: calm again, then the test ---- */
  TL.gift.push([154, 8, 'candle']); TL.brick.push([153, 8], [155, 8]);
  arc(160, 165, 4, 11); fo.push([168, 11, 'cone']); run(166, 172, 3);
  arc(172, 177, 4, 11); run(178, 182, 2);
  box(183, 8, 185, 9);                                                /* THE GLITCH BLOCK (hidden secret): one block of it glints (no skin: the glint must show) */
  TL.gift.push([184, 9, 'gold']);
  fo.push([187, 11, 'egg'], [181, 11, 'sheep']);
  run(186, 190, 2);
  arc(190, 196, 5, 11);
  plinth(199, 3);                                                     /* BONUS BOARD 2 */
  slam(209, 3);                                                       /* BONUS SLAM 2 */
  fo.push([204, 11, 'robot'], [212, 7, 'ghost']);
  TL.gift.push([215, 8, 'candle'], [217, 8, 'heart'], [219, 8, 'cake']); TL.brick.push([216, 8], [218, 8]);
  run(203, 207, 2); run(213, 222, 2);

  var cdOk = cd.filter(function (p, i) { return !blocked(p[0], p[1]) && cd.findIndex(function (q) { return q[0] === p[0] && q[1] === p[1]; }) === i; });
  KinanLevels.register({
    id: '11-1', world: 11, slot: 1, kind: 'level',
    name: 'THE WRONG-WAY PORTAL',
    theme: 130,   /* a glitchy violet void: the world hangs upside down, circuit pieces float by */
    cols: H.length,
    /* THE CONTROLS FLIP (World 11 twist, opt-in): the sign, the first flipped column, the last flipped column (+ 9 of 3-2-1 back) */
    flip: { sign: 100, from: 118, to: 140 },
    heights: H, solid: S, open: OP, skins: SK, tiles: TL, foes: fo, candles: cdOk,
    secrets: [
      { kind: 'visible', col: 46, row: 4, prize: 'heart+candles' },   /* THE SPRING SHELF: one bounce */
      { kind: 'hidden', col: 184, row: 9, prize: 'GOLDEN CANDLE', glint240: true },   /* THE GLITCH BLOCK */
      { kind: 'skill', col: 136, row: 6, prize: 'hat' }   /* THE FLIPPED CLIMB */
    ],
    goldenCandle: { col: 184, row: 9 },
    checkpoint: { col: 157, row: 11 },
    spawn: { col: 2, row: 11 },
    goal: { col: 226, row: 11 },
    talk: [
      [2, 'KINAN', 'Whoa... we went through the door. Are we INSIDE the console Shad built?!', 3.8],
      [4, 'SHAD', "I never finished this one... Sorry, little bro. The sky is supposed to go on TOP.", 4],
      [6, 'DAD', "Everything's upside-down. Don't worry, bud, I'll turn that frown around.", 3.6],
      [8, 'ANNIE', 'Hai Rabba! (Oh my goodness!) The code here is all backwards. I am reading it as we walk.', 4.4],
      [10, 'MOM', 'Stay close, everyone. Kinan, lead the way, sweetie.', 3],
      [57, 'DAD', "Why can't a portal keep a secret? Because it's always... hee hee hee...", 3.4, 'wheeze'],
      [57, 'KINAN', '...open. Because it is always open. Dad. Breathe.', 3],
      [96, 'SHAD', 'Heads up! Past that sign the controls FLIP: left is right for a short stretch. Watch the 3-2-1!', 4.6],
      [101, 'ANNIE', "Chalo! (Let's go!) It only lasts a little while, then it settles for good. Trust the countdown.", 4.6],
      [152, 'KINAN', 'Phew! Normal again. My thumbs are so confused.', 3.2],
      [153, 'DAD', 'I was left, then right, then left again. Now I finally feel centered!', 3.6],
      [153, 'MOM', 'Ha! Oh, I love you two. Now watch your step, sweetie.', 3, 'laugh'],
      [188, 'CHENOA', "Careful, little bro: that block in the air is glowing a little. Might be a secret!", 4],
      [222, 'KINAN', 'The Wrong-Way Portal... it leads deeper into the console. Glitchy must be in there!', 4]
    ]
  });
})();

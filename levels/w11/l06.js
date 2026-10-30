/* ============================================================
   LEVEL 11-6 · COPY-PASTE CITY
   (World 11 · Inside the Console · trail stop 7)
   Story bible (World 11 table): "Buildings and enemies duplicated
   everywhere." Past the fort, Glitchy ran into a city that is the same
   block of buildings pasted again and again, with the same robots on
   every roof. Shad built ONE block and used COPY and PASTE (the lazy
   way, he says). Glitchy was scared to be alone, so he made copies.
   Idea (ONE): A WHOLE SECTION REPEATED WITH ONE DIFFERENCE TO SPOT.
     The middle of the level is ONE BLOCK OF FIVE ROOFS (a 52-tile
     stretch) built three times from the same recipe: COPY, then PASTE,
     then PASTE (a big rubber stamp hangs over each). Every roof, every
     gap, every robot and gift is the same, so after the first block
     Kinan knows the way: a roof, a 3 gap, a taller roof, a 3 gap, a
     lower roof, a 3 gap with a STEPPING STONE in the middle, a taller
     roof, a 3 gap, the street. Each paste changes ONE thing, with a red
     BUG? tag to help:
       PASTE 1: the stepping stone is a GHOST. It flickers in cyan and
         magenta and has no floor (nothing is there): step on it and
         you fall. It only looks like the real stone of the first block.
       PASTE 2: the third roof is one tile LOWER (street level, not the
         usual one-up), so the jump onto the stone is a hop up.
     Every gap is 3 wide, so it can always be jumped; a ghost stone is a
     decoy, never a trap on the only way.
     Enemies are copied too: the same robot, drone and walker on every
     block, and in the street a row of three identical robots.
   Acts (thirds): 0-87 teach (the street, a clipboard secret, THE ORIGINAL
     block COPY) · 88-174 twist (PASTE 1 with the ghost stone, PASTE 2
     with the lower roof) · 175-261 test (the last street, a 5 gap, THE
     LOOSE COPY, THE HIGH CLIP, the goal).
   Secrets (NEW here, tied to the idea):
     visible = THE CLIPBOARD (S1): two floating slabs, a staircase of
       clips, three then five tiles up; the heart and candles sit on
       the top one (heart + candles, 10,6) ·
     hidden = THE LOOSE COPY (S9): a lone pasted block hangs over the
       street where it doesn't belong; it glints (GOLDEN CANDLE, 237,8) ·
     skill = THE HIGH CLIP (S9): a thin shelf four tiles above the
       street, a full-held jump (hat, 243,7).
   Bonus (never needed): two wooden boards (plinth nooks S1, S9), two
     slam spots (cracked boards over candle pockets S1, S8).
   Gaps: act 1 3 · act 2 3 · act 3 3/5. Nothing waits at a lip. A
     full-run jump off any plinth comes down on floor.
   Look: theme 136, CON_LOOKS: a pale blue-violet sky, rows of copied
     office towers with ghost duplicates, a selection box, a cursor.
   ENGINE REQUESTS: none (the skins `office`, `copy`, `ghost`, `bug`,
     `stamp:WORD` are looks only).
   ============================================================ */
(function () {
  var N = 262, H = [], S = [], OP = [], SK = [], cd = [], fo = [], cdl = [];
  var TL = { gift: [], brick: [], spring: [], shelf: [], board: [], crack: [], crate: [] };
  for (var i = 0; i < N; i++) H.push(192);
  function pit(c0, c1) { for (var c = c0; c <= c1; c++) H[c] = null; }
  function flat(c0, c1, h) { for (var c = c0; c <= c1; c++) H[c] = h; }
  function box(c0, r0, c1, r1, skin) { S.push([c0, r0, c1, r1]); if (skin) SK.push([skin, c0, r0, c1, r1]); }
  function stand(c) { return Math.floor(H[c] / 16) - 1; }
  function run(c0, c1, step) { for (var c = c0; c <= c1; c += step || 2) if (H[c] != null) cd.push([c, stand(c)]); }
  function inBox(c, r, R) { return R.some(function (b) { return c >= b[0] && c <= b[2] && r >= b[1] && r <= b[3]; }); }
  function blocked(c, r) { return (inBox(c, r, S) && !inBox(c, r, OP)) || ['gift', 'brick', 'spring', 'shelf', 'board', 'crack', 'crate'].some(function (k) { return TL[k].some(function (t) { return t[0] === c && t[1] === r; }); }); }
  function plinth(c, w) {   /* BONUS: a 2-tall block with a hollow; a KICK breaks the board that seals it (the path hops over it) */
    box(c, 10, c + w + 1, 11, 'office'); OP.push([c + 1, 11, c + w, 11]); TL.board.push([c, 11]);
    for (var i = 1; i <= w; i++) cd.push([c + i, 11]);
  }
  function slam(c, w) {   /* BONUS: cracked boards over a pocket of candles (a butt slam; solid floor under the pocket) */
    OP.push([c, 13, c + w - 1, 13]);
    for (var i = 0; i < w; i++) { TL.crack.push([c + i, 12]); cd.push([c + i, 13]); }
  }

  /* ---- THE BLOCK (one recipe, built three times): v 0 = COPY, 1 = PASTE with the ghost stone, 2 = PASTE with the lower third roof ---- */
  function block(c0, v) {
    var r3 = v === 2 ? 192 : 176;
    flat(c0 + 0, c0 + 7, 192); pit(c0 + 8, c0 + 10);
    flat(c0 + 11, c0 + 16, 160); pit(c0 + 17, c0 + 19);
    flat(c0 + 20, c0 + 27, r3); pit(c0 + 28, c0 + 30);
    flat(c0 + 31, c0 + 36, 160); pit(c0 + 37, c0 + 39);
    flat(c0 + 40, c0 + 51, 192);
    /* the towers' looks (their tops are the roofs; the ground under them is the building) */
    SK.push(['office', c0 + 0, 12, c0 + 7, 14], ['office', c0 + 11, 10, c0 + 16, 14], ['office', c0 + 20, r3 / 16, c0 + 27, 14], ['office', c0 + 31, 10, c0 + 36, 14], ['office', c0 + 40, 12, c0 + 47, 14]);
    SK.push(['stamp:' + (v === 0 ? 'COPY' : 'PASTE'), c0 + 1, 5, c0 + 6, 6]);
    /* the stepping stone in the middle of the third gap: real, or a ghost in PASTE 1 */
    if (v === 1) { SK.push(['ghost', c0 + 29, 11, c0 + 29, 11], ['bug', c0 + 27, 8, c0 + 31, 9]); }
    else { box(c0 + 29, 11, c0 + 29, 11, 'copy'); if (v === 2) SK.push(['bug', c0 + 19, 7, c0 + 25, 8]); }
    /* the same enemies on every roof, the same gifts on the last one */
    fo.push([c0 + 3, 11, 'robot'], [c0 + 13, 6, 'deleter'], [c0 + 24, r3 / 16 - 1, 'mallwalker'], [c0 + 44, 11, 'roomba']);
    TL.gift.push([c0 + 43, 8, 'candle']); TL.brick.push([c0 + 42, 8], [c0 + 44, 8]);
    run(c0 + 1, c0 + 7, 2); run(c0 + 11, c0 + 16, 2); run(c0 + 20, c0 + 27, 2); run(c0 + 31, c0 + 36, 2); run(c0 + 40, c0 + 51, 3);
    cd.push([c0 + 9, 9], [c0 + 18, 8], [c0 + 29, 10], [c0 + 38, 9]);
  }

  /* ---- ACT 1: the street and the clipboard ---- */
  pit(37, 39);
  TL.gift.push([6, 8, 'candle']); TL.brick.push([5, 8], [7, 8]);
  /* THE CLIPBOARD (visible secret): two floating slabs, three tiles up and five tiles up */
  box(4, 9, 6, 9, 'chip'); box(9, 7, 12, 7, 'chip'); cd.push([5, 8], [10, 6], [11, 6]);
  run(3, 3, 1); run(8, 8, 1); run(13, 20, 2);
  slam(14, 3);                                                           /* BONUS SLAM 1 */
  plinth(21, 3);                                                         /* BONUS BOARD 1 */
  fo.push([29, 11, 'robot'], [30, 11, 'robot'], [31, 11, 'robot']);     /* a row of three identical robots: copies */
  run(27, 34, 2);
  block(40, 0); block(92, 1); block(144, 2);
  /* ---- ACT 3: the last street, a 5 gap, THE LOOSE COPY and THE HIGH CLIP ---- */
  fo.push([199, 11, 'robot'], [200, 11, 'robot'], [201, 11, 'robot'], [212, 11, 'mallwalker']);
  TL.gift.push([203, 8, 'heart']); TL.brick.push([202, 8], [204, 8]);
  slam(207, 3);                                                          /* BONUS SLAM 2 */
  run(197, 215, 2);
  pit(216, 220);
  cd.push([215, 10], [216, 8], [217, 7], [218, 7], [219, 7], [220, 8], [221, 10]);
  plinth(226, 3);                                                        /* BONUS BOARD 2 */
  run(222, 225, 2);
  fo.push([233, 11, 'mallwalker'], [247, 11, 'roomba'], [251, 11, 'robot']);
  box(236, 8, 238, 8); TL.gift.push([237, 8, 'gold']);                  /* THE LOOSE COPY (hidden secret): a lone block over the street, one glints (no skin) */
  for (var sh = 242; sh <= 245; sh++) TL.shelf.push([sh, 8]);           /* THE HIGH CLIP (skill secret): a thin shelf four tiles up */
  cd.push([243, 7], [244, 7]);
  TL.gift.push([250, 8, 'candle']); TL.brick.push([249, 8], [251, 8]);
  TL.gift.push([254, 8, 'heart']);
  run(232, 235, 2); run(239, 241, 2); run(246, 258, 2);

  var cdOk = cd.filter(function (p, i) { return !blocked(p[0], p[1]) && cd.findIndex(function (q) { return q[0] === p[0] && q[1] === p[1]; }) === i; });
  KinanLevels.register({
    id: '11-6', world: 11, slot: 7, kind: 'level',
    name: 'COPY-PASTE CITY',
    theme: 136,   /* copy-paste city: a pale violet sky, copied office towers with ghost duplicates */
    cols: N,
    heights: H, solid: S, open: OP, skins: SK, tiles: TL, foes: fo, candles: cdOk,
    secrets: [
      { kind: 'visible', col: 10, row: 6, prize: 'heart+candles' },   /* THE CLIPBOARD */
      { kind: 'hidden', col: 237, row: 8, prize: 'GOLDEN CANDLE', glint240: true },   /* THE LOOSE COPY */
      { kind: 'skill', col: 243, row: 7, prize: 'hat' }   /* THE HIGH CLIP */
    ],
    goldenCandle: { col: 237, row: 8 },
    checkpoint: { col: 205, row: 11 },
    spawn: { col: 2, row: 11 },
    goal: { col: 256, row: 11 },
    talk: [
      [2, 'SHAD', "Copy-Paste City! I built ONE block of buildings and pasted it over and over. Lazy, I know.", 4.2],
      [4, 'KINAN', "Everything is repeated! Same buildings, same robots, again and again.", 3.6],
      [6, 'DAD', "Déjà vu, bud! I feel like I've walked down this street before. And before that.", 3.8],
      [8, 'ANNIE', "Hai Rabba! (Oh my goodness!) One block, pasted three times. Look for what's different in each copy!", 4.6],
      [10, 'CHENOA', "A copy can have a bug, little bro. Compare it with the first one before you jump.", 4],
      [34, 'MOM', "The blue stamp says COPY, the red one says PASTE. I'll watch for the differences too, sweetie.", 4.2],
      [92, 'SHAD', "Same stone in the middle gap? Look closely. Does it look the same to you?", 3.8],
      [100, 'DAD', "Why did the copy cat get in trouble? It kept... hee hee... paws-ting the same thing... I can't—", 4, 'wheeze'],
      [100, 'KINAN', '...Dad. Please press UNDO.', 2.8],
      [123, 'ANNIE', "Shabash! (Well done!) A flickering ghost can't hold you. Real stones are solid.", 3.8],
      [144, 'CHENOA', "Third copy. Something's different again, little bro. Check the third roof.", 3.8],
      [196, 'MOM', "Is that all you do, tell jokes? Last street, honey. A five-tile gap ahead.", 3.8, 'walkoff'],
      [196, 'DAD', "...I'll be here all week! Don't be a copy-cat, bud!", 3],
      [214, 'SHAD', "A 5 gap. Take a running start. The checkpoint is right behind you.", 3.8],
      [234, 'ANNIE', "That lone block over the street... it doesn't belong there. It's glowing.", 4],
      [254, 'KINAN', "So many copies. Glitchy made them all because he was afraid to be alone. We have to find him.", 4.6]
    ]
  });
})();

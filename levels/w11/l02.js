/* ============================================================
   LEVEL 11-2 · MINI BRICK REALM
   (World 11 · Inside the Console · trail stop 2)
   Story bible (World 11 table): "Toy-brick plains and towers. Free the
   Heart of the Blocks. Realm boss BRICK-REX." One of the mini realms
   Shad started and never finished: a green baseplate, a few towers of
   coloured bricks and nothing else. Glitchy's panic has turned its
   guardian, Brick-Rex, wild; he sits on the Heart of the Blocks.
   Idea (ONE): BUILDING WITH BRICKS (opt-in `studs`, new in World 11). A
     stud switch is a square pad on the floor (four blue studs, a STEP
     arrow): stand on it and bricks snap into place, one every 3
     frames, solid for good (dashed ghost bricks show where they will
     go). Act 1 teaches it (the first tower is five tiles tall: its
     stairs only exist once the pad is pressed; a pad that builds a
     bridge over a gap); act 2 twists it (a TWO-STEP climb: the first
     pad builds stairs to a landing, a second pad on the landing builds
     the way up a seven-tile tower; a 4 gap); act 3 tests it (a 5 gap
     with a bridge pad, a six-tile tower, then THE TOWER JUMP).
   Bridges and gap pads are a kindness (every gap is also jumpable);
     the towers are the walls that need building.
   Acts (thirds): 0-89 teach · 90-178 twist · 179-267 test.
   Secrets (NEW here, tied to the idea):
     visible = THE GOLD STUD (S3-S4): a ledge floats three tiles up with
       a stud on it; jump up, step on it, and a staircase of single
       bricks snaps out to a floating island with a heart and candles
       (heart + candles, 83,5) ·
     hidden = THE LOOSE BRICK (S6): a floating brick archway; one of its
       blocks glints; jump up under it (GOLDEN CANDLE, 151,9) ·
     skill = THE TOWER JUMP (S9): a floating slab three tiles up, and
       another five tiles up past a five-tile gap: a full-run jump from
       the first onto the second (hat, 226,6).
   Bonus (never needed): two wooden boards (nooks in plinths, S2 and S8)
     and two slam spots (cracked boards over candle pockets, S3, S7).
   FLAT OPEN GROUND FOR THE BOSS (the second run): columns 230-261 are
     flat at 192 (32 tiles). arena { col: 234, cols: 24, boss:
     'brick-rex' } would put its gates at c233 and c258 and its
     checkpoint flag at c230. The goal stands at c262, the Heart of the
     Blocks on its pedestal at c264-266. Nothing solid, no gift and no
     foe lives in c230-261; the four candles there (c234, 242, 250, 258
     at row 11) only keep the lint's flat-run rule quiet: take them out
     when the arena goes in. A gift before the left gate (c231) and one
     past the right gate (c260) keep every screen's toy.
   Gaps: act 1 3 · act 2 4 · act 3 5. Nothing waits at a lip; no
     gift hangs over a take-off; a full-run jump off any tower comes
     down on floor (the last pit is 40 tiles before the end).
   Look: theme 131, CON_LOOKS: a toy-brick baseplate with studs, a blue
     sky, towers of coloured bricks, a giant brick tree and sun.
   ENGINE REQUESTS: BRICK-REX himself (the second run); the block heart's
     look is a skin on a decoration (`blockheart`).
   ============================================================ */
(function () {
  var N = 268, H = [], S = [], OP = [], SK = [], cd = [], fo = [], ST = [];
  var TL = { gift: [], brick: [], spring: [], shelf: [], board: [], crack: [], crate: [] };
  for (var i = 0; i < N; i++) H.push(192);
  function pit(c0, c1) { for (var c = c0; c <= c1; c++) H[c] = null; }
  function box(c0, r0, c1, r1, skin) { S.push([c0, r0, c1, r1]); if (skin) SK.push([skin, c0, r0, c1, r1]); }
  function stand(c) { return Math.floor(H[c] / 16) - 1; }
  function run(c0, c1, step) { for (var c = c0; c <= c1; c += step || 2) if (H[c] != null) cd.push([c, stand(c)]); }
  function arc(c0, c1, peak, row) { for (var c = c0; c <= c1; c++) { var t = (c - c0) / (c1 - c0); cd.push([c, Math.round(row - peak * 4 * t * (1 - t))]); } }
  function inBox(c, r, R) { return R.some(function (b) { return c >= b[0] && c <= b[2] && r >= b[1] && r <= b[3]; }); }
  function blocked(c, r) { return (inBox(c, r, S) && !inBox(c, r, OP)) || ['gift', 'brick', 'spring', 'shelf', 'board', 'crack', 'crate'].some(function (k) { return TL[k].some(function (t) { return t[0] === c && t[1] === r; }); }); }
  function stairs(c0, n, base) { var o = []; for (var j = 0; j < n; j++) for (var h = 0; h <= j; h++) o.push([c0 + j, base - h]); return o; }   /* n columns, heights 1..n, from the low end c0 */
  function bridge(c0, c1) { var o = []; for (var c = c0; c <= c1; c++) o.push([c, 12]); return o; }
  function plinth(c, w) {   /* BONUS: a 2-tall block with a hollow; a KICK breaks the board that seals it (the path hops over it) */
    box(c, 10, c + w + 1, 11, 'toybrick'); OP.push([c + 1, 11, c + w, 11]); TL.board.push([c, 11]);
    for (var i = 1; i <= w; i++) cd.push([c + i, 11]);
  }
  function slam(c, w) {   /* BONUS: cracked floor boards over a pocket of candles (a butt slam; solid floor under the pocket) */
    OP.push([c, 13, c + w - 1, 13]);
    for (var i = 0; i < w; i++) { TL.crack.push([c + i, 12]); cd.push([c + i, 13]); }
  }

  /* ---- the ground: three pits (every one has a bridge pad, and is jumpable too) ---- */
  pit(44, 46); pit(138, 141); pit(180, 184);

  /* ---- ACT 1: S1-S3 ---- */
  TL.gift.push([5, 8, 'candle']); TL.brick.push([4, 8], [6, 8]);
  fo.push([14, 11, 'lego']);
  ST.push({ at: [10, 11], bricks: stairs(20, 4, 11) });                  /* the first stud: stairs up the first tower */
  box(24, 7, 27, 11, 'toybrick'); box(28, 9, 28, 11, 'toybrick'); box(29, 11, 29, 11, 'toybrick');   /* THE FIRST TOWER (five tiles) and its steps down */
  cd.push([20, 10], [21, 9], [22, 8], [23, 7], [24, 6], [25, 6], [26, 6], [27, 6], [28, 8], [29, 10]);
  run(3, 9, 2); run(12, 18, 2);
  fo.push([33, 11, 'robot'], [50, 7, 'plane']);
  TL.gift.push([40, 8, 'candle']); TL.brick.push([39, 8], [41, 8]);
  ST.push({ at: [38, 11], bricks: bridge(44, 46) });                     /* a stud that bridges the 3 gap */
  arc(43, 47, 3, 11); run(32, 36, 2); run(48, 56, 2);
  plinth(53, 3);                                                         /* BONUS BOARD 1: a nook in a plinth */
  fo.push([60, 11, 'lego'], [66, 11, 'ball']);
  TL.gift.push([60, 8, 'candle']); TL.brick.push([59, 8], [61, 8]);
  /* THE GOLD STUD (visible secret): a floating ledge with a stud, a staircase of single bricks out to a floating island */
  box(70, 9, 72, 9, 'toybrick');
  ST.push({ at: [71, 8], bricks: [[73, 9], [74, 9], [75, 8], [76, 8], [77, 7], [78, 7], [79, 6], [80, 6]] });
  box(81, 6, 85, 6, 'toybrick'); cd.push([71, 7], [74, 8], [76, 7], [78, 6], [80, 5], [82, 5], [84, 5]);
  run(62, 69, 2); run(87, 90, 2);
  slam(78, 3);                                                           /* BONUS SLAM 1 (under the gold stud's bricks) */
  /* ---- ACT 2: S4-S6 ---- */
  fo.push([86, 11, 'robot'], [97, 11, 'lego']);
  ST.push({ at: [92, 11], bricks: stairs(101, 3, 11) });                 /* the first of the TWO-STEP climb: stairs to a landing */
  box(104, 9, 109, 11, 'toybrick');                                      /* the landing */
  ST.push({ at: [106, 8], bricks: stairs(107, 3, 8) });                  /* the second stud, on the landing: the way up the tall tower */
  box(110, 5, 113, 11, 'toybrick'); box(114, 8, 114, 11, 'toybrick'); box(115, 11, 115, 11, 'toybrick');   /* THE SEVEN-TILE TOWER and its steps down */
  cd.push([101, 10], [102, 9], [103, 8], [105, 8], [107, 7], [108, 6], [109, 5], [110, 4], [111, 4], [112, 4], [113, 4], [114, 7], [115, 10]);
  run(94, 100, 2); run(117, 131, 2);
  TL.gift.push([118, 8, 'heart']); TL.brick.push([117, 8], [119, 8]);
  fo.push([121, 11, 'teddy'], [127, 11, 'lego'], [124, 7, 'plane']);
  ST.push({ at: [130, 11], bricks: bridge(138, 141) });                  /* a stud that bridges the 4 gap */
  arc(137, 142, 4, 11); fo.push([134, 11, 'ball']);
  TL.gift.push([132, 8, 'candle']); TL.brick.push([131, 8], [133, 8]);
  run(144, 149, 2);
  /* THE LOOSE BRICK (hidden secret): a floating archway, one block glints */
  box(150, 8, 153, 9); TL.gift.push([151, 9, 'gold']);
  fo.push([146, 11, 'robot'], [157, 11, 'lego'], [161, 7, 'plane']);
  run(155, 170, 2);
  slam(165, 3);                                                          /* BONUS SLAM 2 */
  TL.gift.push([158, 8, 'candle']); TL.brick.push([157, 8], [159, 8]);
  /* ---- ACT 3: S7-S10 ---- */
  fo.push([168, 11, 'ball'], [176, 11, 'lego']);
  TL.gift.push([170, 8, 'cake']); TL.brick.push([169, 8], [171, 8]);
  ST.push({ at: [172, 11], bricks: bridge(180, 184) });                  /* a stud that bridges the 5 gap */
  arc(179, 185, 5, 11); run(174, 178, 2);
  ST.push({ at: [187, 11], bricks: stairs(196, 4, 11) });                /* the stairs up the six-tile... five-tile tower again, faster */
  fo.push([191, 11, 'robot']);
  box(200, 7, 204, 11, 'toybrick'); box(205, 9, 205, 11, 'toybrick'); box(206, 11, 206, 11, 'toybrick');
  cd.push([196, 10], [197, 9], [198, 8], [199, 7], [200, 6], [201, 6], [202, 6], [203, 6], [204, 6], [205, 8], [206, 10]);
  run(189, 194, 2);
  plinth(208, 3);                                                        /* BONUS BOARD 2 */
  /* THE TOWER JUMP (skill secret): a slab three tiles up, another five tiles up past a five-tile gap */
  box(215, 9, 218, 9, 'toybrick'); box(224, 7, 227, 8, 'toybrick'); cd.push([216, 8], [217, 8], [221, 6], [225, 6], [226, 6]);
  fo.push([212, 7, 'plane'], [221, 11, 'ball']);
  run(214, 214, 2); run(219, 222, 2); run(228, 229, 2);
  /* the boss ground c230-261 stays EMPTY (BRICK-REX's arena, c234-257); the Heart of the Blocks stands beyond the goal */
  TL.gift.push([231, 8, 'candle']);
  TL.gift.push([260, 8, 'heart']);
  box(264, 10, 266, 11, 'toybrick'); SK.push(['blockheart', 263, 5, 267, 9]);

  var cdOk = cd.filter(function (p, i) { return !blocked(p[0], p[1]) && cd.findIndex(function (q) { return q[0] === p[0] && q[1] === p[1]; }) === i; });
  KinanLevels.register({
    id: '11-2', world: 11, slot: 2, kind: 'level',
    name: 'MINI BRICK REALM',
    theme: 131,   /* the brick realm: a studded baseplate, towers of toy bricks, a blue sky */
    cols: N,
    /* STUD SWITCHES (World 11 twist, opt-in): step on the pad [c, r] and the bricks snap into place, solid for good */
    studs: ST,
    heights: H, solid: S, open: OP, skins: SK, tiles: TL, foes: fo, candles: cdOk,
    secrets: [
      { kind: 'visible', col: 83, row: 5, prize: 'heart+candles' },   /* THE GOLD STUD: a ledge, a stud, a staircase of bricks */
      { kind: 'hidden', col: 151, row: 9, prize: 'GOLDEN CANDLE', glint240: true },   /* THE LOOSE BRICK */
      { kind: 'skill', col: 226, row: 6, prize: 'hat' }   /* THE TOWER JUMP */
    ],
    goldenCandle: { col: 151, row: 9 },
    checkpoint: { col: 166, row: 11 },
    /* BRICK-REX (index.html ARENA_KINDS 'brick-rex', 3 phases): gates c233 and c258, his flag at c230. Never a stomp:
       stand on the green safe studs in his brick showers, step out of his toppling towers, and when he sits down,
       jump the dropped piece of his heart back into his chest */
    arena: { col: 234, cols: 24, boss: 'brick-rex' },
    spawn: { col: 2, row: 11 },
    goal: { col: 262, row: 11 },
    talk: [
      [2, 'SHAD', 'The Brick Realm! I only built the baseplate and a few towers, then I got distracted. Sorry!', 4.2],
      [4, 'KINAN', 'Look! The Heart of the Blocks is stuck in that far tower, and a big brick dinosaur is guarding it.', 4.4],
      [6, 'DAD', "A brick dinosaur? Don't worry, bud. He's all bark and no brick. I mean, bite.", 3.6],
      [8, 'CHENOA', 'See those square pads with studs on the floor? Step on one and bricks snap into place!', 4.2],
      [19, 'ANNIE', 'Shabash! (Well done!) The bricks build themselves. What lovely code, Shad.', 3.8],
      [56, 'DAD', "I wanted to tell you a joke about bricks, but I'd lay it on too... hee hee... too thick... AHAHA...", 4, 'wheeze'],
      [56, 'KINAN', '...lay it on too thick. Okay, that one is a little good. Dad. Breathe.', 3.6],
      [68, 'CHENOA', "That floating ledge has a gold stud on it, little bro. I'd jump up and step on it.", 4],
      [90, 'SHAD', 'Two studs in a row: the first builds stairs to the landing, then the second one builds the rest. Take your time!', 5],
      [140, 'ANNIE', "Hai Rabba! (Oh my goodness!) That archway has a glowing block. A loose brick, maybe?", 4],
      [166, 'MOM', "Is that all you do, tell jokes? I'll be up the next tower. Careful, sweetie.", 3.6, 'walkoff'],
      [166, 'DAD', "...I'll be here all week! Don't brick yourself, bud!", 3],
      [228, 'CHENOA', 'Wide open ground ahead. Something big lives here, little bro. Get ready.', 4],
      [260, 'KINAN', "Brick-Rex's heart is whole, and the Heart of the Blocks is glowing again. The whole realm feels happy!", 4.4]
    ]
  });
})();

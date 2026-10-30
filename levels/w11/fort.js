/* ============================================================
   FORT · THE CORE GUARDIAN
   (World 11 · Inside the Console · trail stop 6)
   Story bible (World 11 table): "A wall of fire-pixels guarding the
   core (the boss comes in the second run)." Past the four mini realms
   the route runs along the console's own circuit boards toward
   Glitchy's glowing core: green boards, gold traces with pulses of
   light racing along them, chips and capacitors. The Core Guardian is
   a wall of fire-pixels; it does not hate anyone, it only guards.
   (World 9's castle is "Annie's Firewall": this fort is the CORE
   GUARDIAN, and the map plaque says so.)
   Idea: A RUN ALONG THE CIRCUIT BOARDS. No new engine key: World 8's
     BELTS are the data buses (a trace with pulses running right carries
     Kinan along, one running LEFT pulls him back, and in the air he
     keeps his own speed), and World 9's FIREWALLS are the fire-pixel
     walls: columns of fire that open and shut on a clock (a flicker
     warns 50 frames before one shuts; shutting never traps him). Here
     they come in PAIRS that take turns: while one is open the other is
     shut, so Kinan passes the first, waits in the safe pocket between,
     and goes on when the second opens (traffic lights, 2 seconds at
     most). The terrain is chips and capacitors (`chip` skin).
   Route: S1 the first bus (right, 1.2) · S2 a 3 gap, the bus against
     you (-1.0) and one with you · S3 a 4 gap, a fast bus (1.5), the
     first fire pair · S4 a 5 gap, the checkpoint, two fire pairs ·
     S5-S6 the core's floor.
   FLAT OPEN GROUND FOR THE BOSS (the second run): columns 226-261 are
     flat at 192 (36 tiles). arena { col: 232, cols: 24, boss:
     'core-guardian' } would put its gates at c231 and c256 and its
     checkpoint flag at c228. The goal stands at c258; the great wall of
     fire-pixels (a decoration, `firepixels`, not solid) stands behind
     it at c259-261, guarding the core. Nothing solid, no gift, no foe
     lives in c226-261; the four candles there (c230, 238, 246, 254)
     only keep the lint's flat-run rule quiet: take them out when the
     arena goes in. A gift at c224 and one at c257
     (past the right gate), keep every screen's toy.
   Gaps: act 1 3 · act 2 4 · act 3 5; no belt carries Kinan into a gap
     (every belt ends 8 or more flat tiles before one). Nothing waits at
     a lip. Fort slot: exempt from the 3-secrets lint (the World 11
     secret exit is in 11-7); two bonus boards and one slam spot.
   Look: theme 135, CON_LOOKS: a dark green circuit board, gold traces
     with light pulses, chips and capacitors, the core glowing ahead (it
     grows as Kinan runs towards it).
   ENGINE REQUESTS: THE CORE GUARDIAN himself (the second run).
   ============================================================ */
(function () {
  var N = 262, H = [], S = [], OP = [], SK = [], cd = [], fo = [], BE = [], FW = [];
  var TL = { gift: [], brick: [], spring: [], shelf: [], board: [], crack: [], crate: [] };
  for (var i = 0; i < N; i++) H.push(192);
  function pit(c0, c1) { for (var c = c0; c <= c1; c++) H[c] = null; }
  function box(c0, r0, c1, r1, skin) { S.push([c0, r0, c1, r1]); if (skin) SK.push([skin, c0, r0, c1, r1]); }
  function stand(c) { return Math.floor(H[c] / 16) - 1; }
  function run(c0, c1, step) { for (var c = c0; c <= c1; c += step || 2) if (H[c] != null) cd.push([c, stand(c)]); }
  function row(c0, c1) { for (var c = c0; c <= c1; c++) cd.push([c, 11]); }
  function arc(c0, c1, peak, r) { for (var c = c0; c <= c1; c++) { var t = (c - c0) / (c1 - c0); cd.push([c, Math.round(r - peak * 4 * t * (1 - t))]); } }
  function inBox(c, r, R) { return R.some(function (b) { return c >= b[0] && c <= b[2] && r >= b[1] && r <= b[3]; }); }
  function blocked(c, r) { return (inBox(c, r, S) && !inBox(c, r, OP)) || ['gift', 'brick', 'spring', 'shelf', 'board', 'crack', 'crate'].some(function (k) { return TL[k].some(function (t) { return t[0] === c && t[1] === r; }); }); }
  function plinth(c, w) {   /* BONUS: a 2-tall chip with a hollow; a KICK breaks the board that seals it (the path hops over it) */
    box(c, 10, c + w + 1, 11, 'chip'); OP.push([c + 1, 11, c + w, 11]); TL.board.push([c, 11]);
    for (var i = 1; i <= w; i++) cd.push([c + i, 11]);
  }
  function slam(c, w) {   /* BONUS: cracked board over a pocket of candles (a butt slam; solid floor under the pocket) */
    OP.push([c, 13, c + w - 1, 13]);
    for (var i = 0; i < w; i++) { TL.crack.push([c + i, 12]); cd.push([c + i, 13]); }
  }
  function bus(c0, c1, spd) { BE.push([c0, c1, 12, spd]); }
  function fire(c, per, open, ph) { FW.push([c, 5, 11, per, open, ph]); }

  pit(40, 42); pit(100, 103); pit(180, 184);

  /* ---- ACT 1: the first data bus ---- */
  bus(8, 28, 1.2);                                                       /* a trace with pulses running right: it carries him */
  TL.gift.push([6, 8, 'candle']); TL.brick.push([5, 8], [7, 8]);
  fo.push([14, 11, 'robot'], [24, 11, 'roomba'], [34, 5, 'deleter']);
  run(3, 7, 2); run(10, 30, 2); arc(39, 43, 3, 11);
  TL.gift.push([20, 8, 'candle']); TL.brick.push([19, 8], [21, 8]);
  /* ---- S2 ---- */
  run(45, 48, 2);
  plinth(50, 3);                                                         /* BONUS BOARD 1 */
  bus(58, 74, -1.0);                                                     /* a trace running LEFT: it pulls him back while he runs on */
  fo.push([62, 11, 'robot'], [70, 11, 'roomba']);
  run(56, 76, 2);
  TL.gift.push([66, 8, 'heart']); TL.brick.push([65, 8], [67, 8]);
  bus(76, 90, 1.0);
  fo.push([80, 11, 'robot'], [86, 5, 'deleter']);
  TL.gift.push([84, 8, 'candle']);
  slam(92, 3);                                                           /* BONUS SLAM 1 */
  run(78, 96, 2);
  /* ---- ACT 2 ---- */
  arc(99, 104, 4, 11);
  fo.push([108, 11, 'roomba']);
  bus(108, 128, 1.5);                                                    /* the fast bus */
  run(106, 132, 2);
  TL.gift.push([116, 8, 'candle']); TL.brick.push([115, 8], [117, 8]);
  fo.push([120, 11, 'robot'], [126, 5, 'deleter']);
  box(133, 10, 134, 11, 'chip'); fo.push([138, 11, 'roomba']);          /* a small chip to hop */
  TL.gift.push([136, 8, 'cake']);
  /* THE FIRST FIRE PAIR: the wall at c146 and the wall at c154 take turns (a pocket between: c147-153) */
  fire(146, 240, 120, 0); fire(154, 240, 120, 120);
  run(140, 145, 2); run(148, 152, 2); run(156, 164, 2);
  fo.push([150, 11, 'robot'], [165, 11, 'roomba']);
  TL.gift.push([159, 8, 'candle']); TL.brick.push([158, 8], [160, 8]);
  /* ---- ACT 3 ---- */
  plinth(158, 3);                                                        /* BONUS BOARD 2 (22 tiles before the 5 gap: a full-run jump off it lands well short of the pit) */
  fo.push([174, 11, 'robot']);
  TL.gift.push([172, 8, 'heart']);
  run(171, 178, 2); arc(179, 185, 5, 11); run(187, 194, 2);
  fo.push([189, 11, 'roomba'], [191, 5, 'deleter']);
  TL.gift.push([190, 8, 'candle']); TL.brick.push([189, 8], [191, 8]);
  /* TWO FIRE PAIRS back to back (c198/c206 and c214/c222 would collide with the boss ground, so they stand at c196/c204 and c212/c220) */
  fire(196, 240, 120, 0); fire(204, 240, 120, 120); fire(212, 240, 120, 0); fire(220, 240, 120, 120);
  run(198, 202, 2); run(206, 210, 2); run(214, 218, 2);
  fo.push([200, 11, 'robot'], [208, 11, 'roomba'], [216, 11, 'robot']);
  /* the boss ground c226-261 stays EMPTY (THE CORE GUARDIAN's arena, c232-255) */
  TL.gift.push([224, 8, 'candle']);
  TL.gift.push([257, 8, 'heart']);
  SK.push(['firepixels', 259, 3, 261, 11]);                              /* the great wall of fire-pixels guarding the core (a decoration) */

  var cdOk = cd.filter(function (p, i) { return !blocked(p[0], p[1]) && cd.findIndex(function (q) { return q[0] === p[0] && q[1] === p[1]; }) === i; });
  KinanLevels.register({
    id: '11-fort', world: 11, slot: 6, kind: 'fort',
    name: 'THE CORE GUARDIAN',
    theme: 135,   /* the console's core: a circuit board, gold traces, the core glowing ahead */
    cols: N,
    /* the DATA BUSES (World 8's belts): [c0, c1, row, speed], + right, - left */
    belts: BE,
    /* the FIRE-PIXEL WALLS (World 9's firewalls): [col, rowTop, rowBottom, period, open, phase]; pairs take turns */
    firewalls: FW,
    heights: H, solid: S, open: OP, skins: SK, tiles: TL, foes: fo, candles: cdOk,
    checkpoint: { col: 172, row: 11 },
    /* THE CORE GUARDIAN (index.html ARENA_KINDS 'core-guardian', 2 phases): gates c231 and c256, its flag at c228. A
       wall of cool fire-pixels across the middle of the floor; its gap opens and shuts like a heartbeat. Never a
       stomp: when it rests, go through the gap and step on the glowing coolant vent */
    arena: { col: 232, cols: 24, boss: 'core-guardian' },
    spawn: { col: 2, row: 11 },
    goal: { col: 258, row: 11 },
    talk: [
      [2, 'KINAN', 'This is the core of the console. The boards are glowing, and there are little lights racing along the traces!', 4.6],
      [4, 'SHAD', "Those are the data buses. I never got to finish the guard at the end... Sorry, little bro.", 4],
      [6, 'DAD', "A circuit board? I'm all charged up, bud. Let's get this current-ly in motion!", 3.8],
      [8, 'ANNIE', 'The traces carry you where the lights go. Chalo! (Let\'s go!) The ones running the other way push you back.', 4.6],
      [10, 'MOM', "Careful with the gaps, sweetie. A belt can't carry you across one.", 3.6],
      [52, 'CHENOA', "That trace is running LEFT. Keep running, little bro, you're stronger than it is.", 4],
      [110, 'SHAD', 'Fast bus ahead. Remember: in the air you keep your own speed, so jump from the edge!', 4.2],
      [140, 'ANNIE', "Shabash! (Well done!) Fire-pixel walls. They come in pairs that take turns. Pass the open one, wait in the pocket.", 5],
      [150, 'DAD', "Why was the wall of fire so shy? It always... hee hee... went to pieces... pixel-ly... I can't—", 4, 'wheeze'],
      [150, 'KINAN', '...Dad. Breathe.', 2.4],
      [172, 'MOM', "Is that all you do, tell jokes? The next wall is the Guardian's. Be careful.", 3.8, 'walkoff'],
      [172, 'DAD', "...I'll be here all week! Don't burn out, bud!", 3],
      [226, 'ANNIE', "That great wall of fire-pixels is the Core Guardian. I can read its code: it is afraid, not angry.", 4.6],
      [229, 'KINAN', "The Guardian... Glitchy's heart is right behind it. Let's find out what it wants.", 4.2],
      [258, 'SHAD', "The core is open. Glitchy's in there, bud. Whatever happens next... we're all with you.", 4.2]
    ]
  });
})();

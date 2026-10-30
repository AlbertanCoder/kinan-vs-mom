/* ============================================================
   LEVEL 11-8 · THE PORTAL MACHINE
   (World 11 · Inside the Console · trail stop 10)
   Story bible (World 11 table): "The machine Glitchy uses to hop
   worlds. The hardest regular level in the game, still fair." Past the
   Save File Vault is the machine itself: five chambers of gears, tubes
   and glowing rings, split by great machine walls. Glitchy used it to
   hop away every time he got scared. Annie reads its log: he is not
   attacking, he is running.
   Idea (ONE): PORTALS (opt-in `portals`, new in World 11). A portal is
     a glowing ring two tiles tall: walk into one and Kinan steps out of
     its partner, a flash and a swish, with the screen jumping to follow
     him. Pairs share a colour (orange, cyan, pink, green, blue, yellow).
     The IN ring is bright with a spinning swirl; the OUT ring is dimmer
     and says OUT; a yellow ring says ⇄ and works both ways. An OUT ring
     never sends him anywhere. Five times a portal is THE WAY ON: a
     machine wall eight tiles tall (floor to ceiling) stands across the
     chamber, and its IN ring is just in front of it, its OUT ring just
     behind. Each chamber has its own hazard, in rising numbers:
       1 INTAKE: the first wall, a 3 gap, a vault block to spot
       2 LASERS: tall gates, a low trip-beam, a 3 gap (11-3's rhythm)
       3 FIRE-PIXELS: two pairs of fire walls that take turns, a belt
         running against you, a 4 gap (11-fort's key)
       4 GEARS: laser gates, a bobbing beam over a 4 gap, THE PORTAL PERCH
       5 THE EXIT: two gates, a 5 gap, four gates that open in a wave,
         a last fire pair, the goal
     Every hazard is the earlier World 11 key, each with the same rules
     (a flicker before a gate turns on; a flicker before a fire wall
     shuts; a bus never carries him into a gap). This is the hardest
     regular level: one hazard follows another with little breath. Fair:
     every jump fits the locked numbers (gaps 3, 3, 4, 4, 5), the checkpoint
     stands right before the exit chamber, every gate has a long dark
     window, and a portal always lands on flat floor.
   Acts (thirds): 0-83 teach (the intake, chamber 2) · 84-166 twist
     (chamber 3, chamber 4 up to the 4 gap) · 167-249 test (the 4 gap's
     far side, the green wall, THE EXIT).
   Secrets (NEW here, tied to the idea):
     visible = THE SEALED VAULT (chamber 1): a floating block with a
       glowing yellow ring showing through its opening, and a plinth with
       the other end of the ring in its hollow, sealed by a wooden board:
       KICK the board, step into the ring, and the vault is yours
       (heart + candles, 24,6); the ring works both ways ·
     hidden = THE CEILING DIP (chamber 2): one block in a low dip of the
       ceiling glints; jump up under it (GOLDEN CANDLE, 67,7) ·
     skill = THE PORTAL PERCH (chamber 3-4): a thin ledge four tiles up
       over the pink wall's OUT ring, a full-held jump, a blue ring and a
       hat on it; the blue ring is a free ride past the gears (hat,
       148,7).
   Bonus (never needed): two wooden boards (the vault plinth, a plinth in
     chamber 3), two slam spots (chambers 1 and 4).
   Gaps: act 1 3/3 · act 2 4/4 · act 3 5. No pit lies within 16 tiles
     after a machine wall. Nothing waits at a lip.
   Look: theme 138, CON_LOOKS: a dark machine hall, great gears and
     tubes, purple and pink energy, glowing rings.
   ENGINE REQUESTS: none (the `portals` key is in index.html "WORLD 11
     TWISTS").
   ============================================================ */
(function () {
  var N = 250, H = [], S = [], OP = [], SK = [], cd = [], fo = [], LZ = [], FW = [], BL = [], PL = [], PT = [];
  var TL = { gift: [], brick: [], spring: [], shelf: [], board: [], crack: [], crate: [] };
  for (var i = 0; i < N; i++) H.push(192);
  function pit(c0, c1) { for (var c = c0; c <= c1; c++) H[c] = null; }
  function box(c0, r0, c1, r1, skin) { S.push([c0, r0, c1, r1]); if (skin) SK.push([skin, c0, r0, c1, r1]); }
  function stand(c) { return Math.floor(H[c] / 16) - 1; }
  function run(c0, c1, step) { for (var c = c0; c <= c1; c += step || 2) if (H[c] != null) cd.push([c, stand(c)]); }
  function row(c0, c1) { for (var c = c0; c <= c1; c++) cd.push([c, 11]); }
  function inBox(c, r, R) { return R.some(function (b) { return c >= b[0] && c <= b[2] && r >= b[1] && r <= b[3]; }); }
  function blocked(c, r) { return (inBox(c, r, S) && !inBox(c, r, OP)) || ['gift', 'brick', 'spring', 'shelf', 'board', 'crack', 'crate'].some(function (k) { return TL[k].some(function (t) { return t[0] === c && t[1] === r; }); }); }
  function gate(c, r0, r1, per, on, ph) { LZ.push([c, r0, r1, per, on, ph || 0, 0]); }
  function fire(c, per, open, ph) { FW.push([c, 4, 11, per, open, ph]); }
  function slam(c, w) {   /* BONUS: cracked floor over a pocket of candles (a butt slam; solid floor under the pocket) */
    OP.push([c, 13, c + w - 1, 13]);
    for (var i = 0; i < w; i++) { TL.crack.push([c + i, 12]); cd.push([c + i, 13]); }
  }
  function wall(c0, c1, color, a, b) {   /* a machine wall (floor to ceiling) and the way through it: IN just before, OUT just after */
    box(c0, 4, c1, 11, 'chip'); PT.push({ a: [a, 11], b: [b, 11], color: color });
  }

  /* ---- the machine: one ceiling over chambers 2-5 ---- */
  box(50, 0, 249, 3, 'chip');
  pit(30, 32); pit(72, 74); pit(118, 121); pit(162, 165); pit(197, 201);

  /* ---- CHAMBER 1 · INTAKE (0-49): the vault, the first wall ---- */
  TL.gift.push([6, 8, 'candle']); TL.brick.push([5, 8], [7, 8]);
  fo.push([9, 11, 'roomba'], [27, 11, 'robot']);
  run(3, 8, 2);
  /* THE SEALED VAULT (visible secret): a floating block with a glowing yellow ring inside, and its twin in a plinth sealed by a board */
  box(12, 10, 16, 11, 'chip'); OP.push([13, 11, 15, 11]); TL.board.push([12, 11]); cd.push([13, 11], [15, 11]);
  box(20, 2, 26, 7); OP.push([21, 3, 25, 6]); cd.push([22, 6], [25, 6], [24, 6]);   /* (no skin: the opening shows the ring and the candles) */
  PT.push({ a: [14, 11], b: [23, 6], color: '#f6c445', two: true });
  arcRun(28, 34); row(30, 32);
  slam(36, 3);                                                           /* BONUS SLAM 1 */
  TL.gift.push([40, 8, 'candle']); run(34, 39, 2);
  wall(44, 46, '#ff8a3d', 41, 49);                                       /* the first wall: orange */
  /* ---- CHAMBER 2 · LASERS (50-91) ---- */
  fo.push([52, 11, 'robot'], [60, 11, 'roomba'], [70, 11, 'robot'], [78, 11, 'roomba'], [84, 5, 'deleter']);
  gate(56, 4, 11, 150, 60, 0); gate(64, 4, 11, 150, 60, 75);
  box(66, 4, 68, 7); TL.gift.push([67, 7, 'gold']);                      /* THE CEILING DIP (hidden secret): one block glints (no skin) */
  row(71, 75); run(51, 55, 2); run(58, 62, 2); run(76, 79, 2); run(81, 85, 2);
  gate(80, 11, 11, 110, 45, 20);                                         /* a low trip-beam after the gap */
  gate(86, 4, 11, 150, 60, 30);
  TL.gift.push([54, 8, 'candle']);
  wall(92, 94, '#00ffd0', 89, 97);                                       /* the second wall: cyan */
  /* ---- CHAMBER 3 · FIRE-PIXELS (98-145) ---- */
  fo.push([108, 11, 'roomba'], [116, 11, 'robot'], [125, 11, 'roomba']);
  plinth(99, 3);                                                         /* BONUS BOARD 2 */
  fire(104, 240, 120, 0); fire(112, 240, 120, 120);
  row(117, 122); run(106, 110, 2); run(114, 115, 1);
  BL.push([123, 127, 12, -1.0]);                                         /* a short bus running against him, right after the 4 gap (it ends 3 tiles before the next wall) */
  fire(130, 240, 120, 60); fire(135, 240, 120, 180);
  run(123, 128, 1); run(131, 134, 2);
  TL.gift.push([102, 8, 'heart']);
  wall(141, 143, '#ff3df0', 138, 146);                                   /* the third wall: pink */
  /* ---- CHAMBER 4 · GEARS (147-178) ---- */
  /* THE PORTAL PERCH (skill secret): a thin ledge four tiles up over the pink OUT ring, a blue ring and a hat on it */
  for (var sh = 147; sh <= 151; sh++) TL.shelf.push([sh, 8]);
  PT.push({ a: [150, 7], b: [167, 11], color: '#6fa0ff' });
  cd.push([148, 7], [149, 7]);
  gate(153, 4, 11, 150, 60, 40); gate(159, 4, 11, 150, 60, 115);
  fo.push([148, 11, 'robot'], [156, 11, 'roomba'], [168, 11, 'robot'], [172, 5, 'deleter']);
  PL.push([163, 12, 2, 6, 110, 0, 0]);                                   /* a bobbing beam over the 4 gap */
  row(161, 166); run(147, 152, 2); run(154, 158, 2);
  gate(170, 4, 11, 150, 60, 0);
  slam(174, 2);                                                          /* BONUS SLAM 2 */
  wall(176, 178, '#7be3a3', 173, 181);                                   /* the fourth wall: green */
  /* ---- CHAMBER 5 · THE EXIT (179-249) ---- */
  fo.push([186, 11, 'roomba'], [191, 11, 'robot'], [208, 11, 'roomba'], [218, 11, 'robot'], [226, 11, 'roomba'], [233, 11, 'robot']);
  TL.gift.push([183, 8, 'heart']);
  gate(188, 4, 11, 150, 60, 0); gate(194, 4, 11, 150, 60, 110);
  row(196, 202); run(184, 192, 2);
  gate(214, 4, 11, 150, 60, 0); gate(222, 4, 11, 150, 60, 110); gate(230, 4, 11, 150, 60, 70);
  run(204, 213, 2); run(216, 221, 2); run(224, 229, 2);
  fire(238, 240, 120, 0); fire(244, 240, 120, 120);
  run(232, 237, 2); run(239, 243, 2);
  TL.gift.push([248, 8, 'heart']);
  SK.push(['glitchy', 247, 6, 248, 7]);                                  /* Glitchy peeks over the goal, then ducks away (a decoration) */

  function arcRun(c0, c1) { for (var c = c0; c <= c1; c += 2) if (H[c] != null) cd.push([c, stand(c)]); }
  function plinth(c, w) {   /* BONUS: a 2-tall block with a hollow; a KICK breaks the board that seals it */
    box(c, 10, c + w + 1, 11, 'chip'); OP.push([c + 1, 11, c + w, 11]); TL.board.push([c, 11]);
    for (var i = 1; i <= w; i++) cd.push([c + i, 11]);
  }

  var cdOk = cd.filter(function (p, i) { return !blocked(p[0], p[1]) && cd.findIndex(function (q) { return q[0] === p[0] && q[1] === p[1]; }) === i; });
  KinanLevels.register({
    id: '11-8', world: 11, slot: 10, kind: 'level',
    name: 'THE PORTAL MACHINE',
    theme: 138,   /* the portal machine: gears and tubes, purple and pink energy, glowing rings */
    cols: N,
    /* PORTALS (World 11 twist, opt-in): { a: [c, r] the IN ring, b: [c, r] the OUT ring (the cell Kinan stands in), color, two: both ways } */
    portals: PT,
    lasers: LZ,           /* 11-3's timed laser gates */
    firewalls: FW,        /* World 9's fire walls, in pairs that take turns (11-fort) */
    belts: BL,            /* World 8's belts: one running against him */
    planks: PL,           /* World 7's bobbing planks */
    heights: H, solid: S, open: OP, skins: SK, tiles: TL, foes: fo, candles: cdOk,
    secrets: [
      { kind: 'visible', col: 24, row: 6, prize: 'heart+candles' },   /* THE SEALED VAULT */
      { kind: 'hidden', col: 67, row: 7, prize: 'GOLDEN CANDLE', glint240: true },   /* THE CEILING DIP */
      { kind: 'skill', col: 148, row: 7, prize: 'hat' }   /* THE PORTAL PERCH */
    ],
    goldenCandle: { col: 67, row: 7 },
    checkpoint: { col: 184, row: 11 },
    spawn: { col: 2, row: 11 },
    goal: { col: 246, row: 11 },
    talk: [
      [2, 'KINAN', "The Portal Machine! This is how Glitchy hops between worlds. It's huge!", 3.8],
      [4, 'SHAD', "I built it out of the first portal I ever drew. Every ring is one end of a pair.", 4],
      [6, 'DAD', "Walk into the ring on this side, and you pop out the other. It's a real step-through, bud!", 4],
      [8, 'ANNIE', "Chalo! (Let's go!) The rings match by colour. Orange goes to orange. The OUT ring never sends you anywhere.", 5],
      [10, 'MOM', "Careful, sweetie. This machine is the hardest room yet.", 3.2],
      [38, 'CHENOA', "See that wall? Walk into the orange ring in front of it. You'll come out behind it.", 4.4],
      [54, 'SHAD', "Lasers again. Wait for the beam to go dark, then run. That flicker means it's about to come back on.", 4.6],
      [76, 'ANNIE', "Hai Rabba! (Oh my goodness!) One block in the ceiling is glowing.", 3.6],
      [100, 'DAD', "Fire walls in pairs, taking turns. Don't get burned, bud. This level is hot stuff!", 4],
      [120, 'KINAN', "A bus running the wrong way after a gap. Keep running!", 3.6],
      [146, 'CHENOA', "The blue ring on that high ledge is a shortcut. It's a tight jump, little bro.", 4],
      [172, 'MOM', "Is that all you do, tell jokes? I'm counting the portals instead. That's four.", 3.8, 'walkoff'],
      [172, 'DAD', "...I'll be here all week! Portal-ly honest, bud!", 3],
      [184, 'ANNIE', "The machine's log says Glitchy used it to run away, every time he was scared. He isn't attacking us. He's afraid.", 5],
      [200, 'SHAD', "The last chamber. A 5 gap, then gates in a wave, then a fire pair. You've got this, little bro.", 4.4],
      [244, 'KINAN', "That's the way to the core. Glitchy, we're coming. You're not broken.", 4]
    ]
  });
})();

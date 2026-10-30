/* ============================================================
   LEVEL 11-3 · MINI STARBASE
   (World 11 · Inside the Console · trail stop 3)
   Story bible (World 11 table): "Laser halls, a glowing toy energy
   wand, a short corridor run. Realm boss THE ROBOT COMMANDER." Another
   of Shad's unfinished realms: a toy space station in our own style:
   round little robots, chunky orange and teal panels, big round
   portholes. Nothing from any film (no famous ships, helmets, swords or
   logos). Glitchy's panic woke the base's lasers and the Robot
   Commander on the far dais.
   Idea (ONE): TIMED LASER GATES (opt-in `lasers`, new in World 11). A
     gate is two emitters and a beam: ON for 55-60 frames of every 150
     (a bright red beam, a hum), then DARK for about 95 frames (a faint
     dotted line, teal lamps), and a flicker plus "!" in the last 40
     frames of the dark. Touching the beam costs a heart; a beam is
     only dangerous while it is red. Tall gates (floor to ceiling) mean
     "wait for the dark, then run through"; a low trip-beam (one tile)
     means "jump it". THE ENERGY WAND (opt-in `wand`): a glowing toy
     wand on a pedestal on the main path; with it, a KICK cuts a GOLD
     laser gate for good (gold gates never open: the wand is the only
     way, so they only ever guard bonuses).
   Acts (thirds): 0-88 teach (the hangar: a tall gate, a trip-beam, a 3
     gap, THE WAND, a gold gate on a vault) · 89-177 twist (a 4 gap, the
     catwalk, a corridor with two gates that take turns, a ceiling dip)
     · 178-265 test (THE CORRIDOR RUN: four tall gates 8 tiles apart
     that open in a wave, so a steady run goes straight through; a 5 gap;
     the reward screen).
   Secrets (NEW here, tied to the idea):
     visible = THE LASER VAULT (S3): a hollow block whose door is a gold
       gate that never opens; with the wand, kick it (heart + candles,
       73,10) ·
     hidden = THE CEILING PANEL (S5): the ceiling dips low; one panel
       glints; jump under it (GOLDEN CANDLE, 127,7) ·
     skill = THE CATWALK (S6): up a step and a hop onto a thin catwalk
       three tiles over the floor with three trip-beams to hop on a
       rhythm (hat, 165,7).
   Bonus (never needed): two wooden boards (plinth nooks S4, S5), two
     slam spots (cracked panels over candle pockets S2, S7), the vault.
   FLAT OPEN GROUND FOR THE BOSS (the second run): columns 224-262 are
     flat at 192 (39 tiles). arena { col: 230, cols: 24, boss:
     'droid-commander' } would put its gates at c229 and c254, its
     checkpoint flag at c226. The goal stands at c258. Nothing solid,
     no gift and no foe lives in c224-262 under the ceiling; the four
     candles there (c228, 236, 244, 252) only keep the lint's flat-run
     rule quiet: take them out when the arena goes in. A gift at c221
     and one at c256 (past the right gate) keep every screen's toy.
   Gaps: act 1 3 · act 2 4 · act 3 5. Nothing waits at a lip; no gift
     hangs over a take-off.
   Look: theme 132, CON_LOOKS: a toy space station, pale panels with
     orange and teal, round portholes on the stars, little round droids.
   ENGINE REQUESTS: THE ROBOT COMMANDER himself (the second run).
   ============================================================ */
(function () {
  var N = 266, H = [], S = [], OP = [], SK = [], cd = [], fo = [], LZ = [];
  var TL = { gift: [], brick: [], spring: [], shelf: [], board: [], crack: [], crate: [] };
  for (var i = 0; i < N; i++) H.push(192);
  function pit(c0, c1) { for (var c = c0; c <= c1; c++) H[c] = null; }
  function box(c0, r0, c1, r1, skin) { S.push([c0, r0, c1, r1]); if (skin) SK.push([skin, c0, r0, c1, r1]); }
  function stand(c) { return Math.floor(H[c] / 16) - 1; }
  function run(c0, c1, step) { for (var c = c0; c <= c1; c += step || 2) if (H[c] != null) cd.push([c, stand(c)]); }
  function arc(c0, c1, peak, row) { for (var c = c0; c <= c1; c++) { var t = (c - c0) / (c1 - c0); cd.push([c, Math.round(row - peak * 4 * t * (1 - t))]); } }
  function inBox(c, r, R) { return R.some(function (b) { return c >= b[0] && c <= b[2] && r >= b[1] && r <= b[3]; }); }
  function blocked(c, r) { return (inBox(c, r, S) && !inBox(c, r, OP)) || ['gift', 'brick', 'spring', 'shelf', 'board', 'crack', 'crate'].some(function (k) { return TL[k].some(function (t) { return t[0] === c && t[1] === r; }); }); }
  function plinth(c, w) {   /* BONUS: a 2-tall block with a hollow; a KICK breaks the board that seals it (the path hops over it) */
    box(c, 10, c + w + 1, 11, 'panel'); OP.push([c + 1, 11, c + w, 11]); TL.board.push([c, 11]);
    for (var i = 1; i <= w; i++) cd.push([c + i, 11]);
  }
  function slam(c, w) {   /* BONUS: cracked floor panels over a pocket of candles (a butt slam; solid floor under the pocket) */
    OP.push([c, 13, c + w - 1, 13]);
    for (var i = 0; i < w; i++) { TL.crack.push([c + i, 12]); cd.push([c + i, 13]); }
  }
  function gate(c, r0, r1, per, on, ph, cut) { LZ.push([c, r0, r1, per, on, ph || 0, cut ? 1 : 0]); }

  /* ---- the station: one long ceiling (rows 0-3), lower in the corridors (rows 4-5) ---- */
  /* (the Commander's arena, c229-254, is his open observation deck under the stars: the ceiling stops at its gates) */
  box(0, 0, 228, 3, 'panel'); box(255, 0, N - 1, 3, 'panel'); box(102, 4, 122, 5, 'panel'); box(176, 4, 216, 5, 'panel');
  pit(44, 46); pit(90, 93); pit(214, 218);

  /* ---- ACT 1: the hangar ---- */
  TL.gift.push([8, 8, 'candle']); TL.brick.push([7, 8], [9, 8]);
  fo.push([13, 11, 'roomba']);
  gate(22, 4, 11, 180, 60, 0);                                           /* G1: the first tall gate: dark for 120 frames, plenty of time */
  run(3, 6, 2); run(11, 20, 2); run(24, 30, 2);
  gate(31, 11, 11, 110, 45, 20);                                         /* L1: a low trip-beam: jump it */
  fo.push([35, 11, 'robot'], [39, 7, 'camera']);
  TL.gift.push([36, 8, 'candle']); TL.brick.push([35, 8], [37, 8]);
  arc(43, 47, 3, 11); run(33, 41, 2); run(49, 52, 2);
  slam(50, 3);                                                           /* BONUS SLAM 1 */
  box(55, 10, 56, 11, 'panel');                                          /* a step to hop */
  fo.push([60, 11, 'roomba']);
  run(58, 61, 2);
  TL.gift.push([57, 8, 'candle']);
  /* THE WAND on its pedestal (main path), then THE LASER VAULT (visible secret): a hollow block with a gold gate for a door */
  /* the wand is at c63 */
  run(65, 68, 2);
  box(70, 9, 76, 11, 'panel'); OP.push([70, 10, 75, 11]); gate(70, 10, 11, 0, 0, 0, true);
  cd.push([71, 11], [72, 11], [74, 11], [75, 11]);
  fo.push([79, 11, 'robot']); run(78, 87, 2);
  /* ---- ACT 2 ---- */
  TL.gift.push([83, 8, 'heart']); TL.brick.push([82, 8], [84, 8]);
  arc(89, 94, 4, 11); fo.push([96, 11, 'roomba']); run(96, 101, 2);
  plinth(98, 3);                                                         /* BONUS BOARD 1 */
  /* the first corridor: two tall gates that take turns, a safe stretch between them */
  gate(108, 6, 11, 150, 55, 0); gate(116, 6, 11, 150, 55, 75);
  run(104, 107, 2); run(110, 114, 2);
  plinth(119, 3);                                                        /* BONUS BOARD 2: a nook in the corridor, after the second gate */
  fo.push([112, 11, 'robot']);
  TL.gift.push([112, 8, 'candle']);
  /* THE CEILING PANEL (hidden secret): the ceiling dips; one panel glints (no skin: the glint must show) */
  box(126, 4, 128, 7); TL.gift.push([127, 7, 'gold']);
  fo.push([131, 11, 'roomba'], [134, 7, 'camera']);
  run(124, 136, 2);
  /* THE CATWALK (skill secret): a 2-tall step, a hop to a thin catwalk three tiles up, three trip-beams on a rhythm */
  box(138, 10, 139, 11, 'panel'); box(143, 8, 166, 8, 'panel');
  gate(147, 7, 7, 120, 50, 0); gate(153, 7, 7, 120, 50, 40); gate(159, 7, 7, 120, 50, 80);
  cd.push([144, 7], [150, 7], [156, 7], [162, 7], [164, 7], [165, 7]);
  fo.push([150, 11, 'roomba'], [160, 11, 'robot']);
  run(141, 148, 2); run(152, 170, 2);
  slam(168, 3);                                                          /* BONUS SLAM 2 */
  TL.gift.push([172, 8, 'cake']); TL.brick.push([171, 8], [173, 8]);
  /* ---- ACT 3: THE CORRIDOR RUN (four tall gates, 8 tiles apart, opening in a wave), a 5 gap, the reward ---- */
  gate(184, 6, 11, 150, 55, 0); gate(192, 6, 11, 150, 55, 110); gate(200, 6, 11, 150, 55, 70); gate(208, 6, 11, 150, 55, 30);
  fo.push([180, 11, 'roomba'], [188, 11, 'robot'], [196, 11, 'roomba'], [204, 11, 'robot']);
  TL.gift.push([187, 8, 'candle']);
  run(176, 183, 2); run(186, 190, 2); run(194, 198, 2); run(202, 206, 2); run(210, 213, 2);
  arc(213, 219, 5, 11);
  TL.gift.push([221, 8, 'heart']);
  /* the boss ground c224-262 stays EMPTY under the ceiling (THE ROBOT COMMANDER's arena, c230-253) */
  TL.gift.push([256, 8, 'heart']);

  var cdOk = cd.filter(function (p, i) { return !blocked(p[0], p[1]) && cd.findIndex(function (q) { return q[0] === p[0] && q[1] === p[1]; }) === i; });
  KinanLevels.register({
    id: '11-3', world: 11, slot: 3, kind: 'level',
    name: 'MINI STARBASE',
    theme: 132,   /* the toy starbase: pale panels with orange and teal, round portholes on the stars */
    cols: N,
    /* TIMED LASER GATES (World 11 twist, opt-in): [col, rowTop, rowBottom, period, on, phase, cut] ... */
    lasers: LZ,
    /* THE ENERGY WAND (opt-in): with it a KICK cuts a gold gate (cut = 1) */
    wand: [63, 11],
    heights: H, solid: S, open: OP, skins: SK, tiles: TL, foes: fo, candles: cdOk,
    secrets: [
      { kind: 'visible', col: 73, row: 10, prize: 'heart+candles' },   /* THE LASER VAULT: kick the gold gate with the wand */
      { kind: 'hidden', col: 127, row: 7, prize: 'GOLDEN CANDLE', glint240: true },   /* THE CEILING PANEL */
      { kind: 'skill', col: 165, row: 7, prize: 'hat' }   /* THE CATWALK */
    ],
    goldenCandle: { col: 127, row: 7 },
    checkpoint: { col: 174, row: 11 },
    /* THE ROBOT COMMANDER (index.html ARENA_KINDS 'droid-commander', 3 phases): gates c229 and c254, his flag at c226.
       Never a stomp: jump the LOW patrol drones, stay down for the HIGH ones, and when he rests, walk a lost drone
       onto its glowing charging dock */
    arena: { col: 230, cols: 24, boss: 'droid-commander' },
    spawn: { col: 2, row: 11 },
    goal: { col: 258, row: 11 },
    talk: [
      [2, 'SHAD', "The Starbase! I only finished the hangar and the lasers. The rest was going to be... more lasers.", 4.4],
      [4, 'KINAN', "It's like a toy space station! And the little droids look so friendly.", 3.6],
      [6, 'DAD', "Lasers, bud? I'd say this place is really beaming.", 3.4],
      [8, 'ANNIE', "A laser is only dangerous while it is RED. Wait for the dark, then run through. Chalo! (Let's go!)", 4.6],
      [20, 'MOM', "Take your time, sweetie. The beam will go dark again.", 3.4],
      [29, 'CHENOA', 'That low beam by the floor? Hop right over it, little bro.', 3.4],
      [60, 'SHAD', "That's the energy wand! I made it glow on purpose. With it, a KICK cuts the GOLD gates.", 4.4],
      [66, 'DAD', "Oh, a wand. Let me guess: it's a laser-pointer? Hee hee... I'll see myself out. Hmm... a gate to cut, bud!", 5, 'wheeze'],
      [66, 'KINAN', '...Dad. The gold gate on that block is shut for good. Only the wand opens it.', 4],
      [96, 'ANNIE', 'Shabash! (Well done!) Two gates that take turns. Stop in the safe middle if you need to.', 4.2],
      [124, 'CHENOA', "The ceiling comes down low here. One of those panels is glowing. Try a jump!", 4],
      [140, 'SHAD', 'Up the step, a hop, then the thin catwalk with the trip-beams. That one is a challenge.', 4.2],
      [174, 'MOM', "The next hall is a corridor run, honey. The gates open in a wave. A steady run gets you through.", 4.4],
      [222, 'DAD', "Wide open floor ahead. That's where a droid commander would stand. Command-ing view!", 4],
      [226, 'KINAN', "I can hear someone coming. Glitchy's panic woke the Robot Commander up!", 3.6],
      [256, 'KINAN', "Every drone is home, and the Commander is in friendly mode. Next stop: the dino valley!", 4.2]
    ]
  });
})();

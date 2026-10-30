/* ============================================================
   LEVEL 11-4 · MINI DINO VALLEY
   (World 11 · Inside the Console · trail stop 4)
   Story bible (World 11 table): "Ferns and volcanoes. Return the Alpha
   T-Rex's lost baby. Realm boss THE ALPHA T-REX." Shad's unfinished
   dinosaur realm: giant ferns, smoking volcanoes, a long-necked
   dinosaur far off, pterosaurs. The Alpha T-Rex has lost her egg's
   hatchling; Glitchy's panic turned her wild. A little lost baby sits
   in a nest in the valley: it follows Kinan once he finds it, all the
   way to the mama's field at the end.
   Idea (ONE): VOLCANO VENT LIFTS (opt-in `vents`, new in World 11), and
     THE BABY DINO (opt-in `baby`, a follower like the pets). A vent is
     a stone shaft, two tiles deep, with a puffy cloud platform sitting
     flush with the floor. It rests, then the vent glows and steams with
     a flickering "!" for 40 frames (the warning), then the cloud
     puffs UP five or six tiles in one second, holds for two seconds,
     and sinks. Stand on it and it carries Kinan to the top of a rock
     cliff (too tall to jump). Nobody is hurt by the shaft: if the cloud
     is up, he just drops two tiles and waits for the next puff.
   Acts (thirds): 0-90 teach (the valley, a 3 gap, the first vent: a
     five-tile cliff) · 91-181 twist (the lost baby, a six-tile cliff
     with a nest ledge hanging beside it, a 4 gap, another vent with a
     thin ledge over it) · 182-271 test (a 5 gap, a last five-tile
     cliff, the reward and the mama's field).
   Secrets (NEW here, tied to the idea):
     visible = THE NEST LEDGE (S4): a thin ledge hangs just left of the
       second vent, six tiles up; ride the puff to the top and step LEFT
       instead of right (heart + candles, 97,5) ·
     hidden = THE BONE ARCH (S5): a floating arch of old bones; one
       block of it glints; jump up under it (GOLDEN CANDLE, 125,9) ·
     skill = THE HIGH PERCH (S6): from the top of the third cliff, a
       full-held jump up to a thin shelf four tiles above it (hat,
       155,2).
   Bonus (never needed): two wooden boards (plinth nooks S2, S5), two
     slam spots (cracked boards over candle pockets S1, S7).
   FLAT OPEN GROUND FOR THE BOSS (the second run): columns 238-269 are
     flat at 192 (32 tiles). arena { col: 242, cols: 24, boss:
     'alpha-trex' } would put its gates at c241 and c266 and its
     checkpoint flag at c238; she is calmed by getting her baby back
     (the baby follows him to the gate). The goal stands at c268.
     Nothing solid, no gift, no foe lives in c238-271; the four candles
     there (c246, 252, 258, 264) only keep the lint's flat-run rule
     quiet: take them out when the arena goes in. A gift before the
     left gate (c240) and one past the right gate (c268) keep every
     screen's toy.
   Gaps: act 1 3 · act 2 4 · act 3 5. Nothing waits at a lip; no gift
     hangs over a take-off; every cliff is 24 tiles or more from the
     next pit. A full-run jump off any cliff comes down on floor.
   Look: theme 133, CON_LOOKS: an orange prehistoric sky, volcanoes
     glowing red, ferns and cycads, a long-necked dinosaur and
     pterosaurs far off.
   ENGINE REQUESTS: THE ALPHA T-REX herself (the second run).
   ============================================================ */
(function () {
  var N = 270, H = [], S = [], OP = [], SK = [], cd = [], fo = [], VE = [];
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
    box(c, 10, c + w + 1, 11, 'lavarock'); OP.push([c + 1, 11, c + w, 11]); TL.board.push([c, 11]);
    for (var i = 1; i <= w; i++) cd.push([c + i, 11]);
  }
  function slam(c, w) {   /* BONUS: cracked floor boards over a pocket of candles (a butt slam; solid floor under the pocket) */
    OP.push([c, 13, c + w - 1, 13]);
    for (var i = 0; i < w; i++) { TL.crack.push([c + i, 12]); cd.push([c + i, 13]); }
  }
  function vent(c, rise, per, ph) {   /* a vent lift: a 2-deep shaft (c..c+2) with the platform flush on top; the cliff stands right of it; candles mark the way up */
    OP.push([c, 12, c + 2, 13]); VE.push([c, 3, rise, per, ph]);
    for (var k = 3; k < rise * 16 / 16; k += 2) cd.push([c + 1, 11 - k]);
  }

  pit(40, 42); pit(135, 138); pit(192, 196);

  /* ---- ACT 1 ---- */
  TL.gift.push([6, 8, 'candle']); TL.brick.push([5, 8], [7, 8]);
  fo.push([12, 11, 'mud'], [28, 11, 'egg'], [34, 6, 'mosquito']);
  run(3, 11, 2); run(14, 24, 2);
  slam(18, 3);                                                           /* BONUS SLAM 1 */
  TL.gift.push([25, 8, 'candle']); TL.brick.push([24, 8], [26, 8]);
  arc(39, 43, 3, 11); run(30, 37, 2);
  TL.gift.push([36, 8, 'candle']);
  fo.push([48, 11, 'slug']);
  run(45, 53, 2);
  plinth(50, 3);                                                         /* BONUS BOARD 1 */
  vent(56, 5, 450, 0);                                                   /* THE FIRST VENT: a five-tile cliff */
  box(59, 7, 64, 11, 'lavarock'); box(65, 9, 65, 11, 'lavarock'); box(66, 11, 66, 11, 'lavarock');
  cd.push([59, 6], [60, 6], [61, 6], [62, 6], [63, 6], [64, 6], [65, 8], [66, 10]);
  fo.push([70, 11, 'puddlefrog'], [80, 11, 'mud'], [86, 6, 'mosquito']);
  run(68, 88, 2);
  TL.gift.push([68, 8, 'candle']); TL.brick.push([67, 8], [69, 8]);
  TL.gift.push([84, 8, 'heart']);
  /* ---- ACT 2 ---- */
  /* the lost baby waits in its nest at c92 (it follows Kinan from then on) */
  run(90, 94, 2);
  fo.push([94, 11, 'egg']);
  box(96, 6, 99, 6, 'lavarock'); cd.push([97, 5], [98, 5]);             /* THE NEST LEDGE (visible secret): hangs left of the second vent, six tiles up */
  vent(100, 6, 470, 200);                                                /* THE SECOND VENT: a six-tile cliff */
  box(103, 6, 110, 11, 'lavarock'); box(111, 9, 111, 11, 'lavarock'); box(112, 11, 112, 11, 'lavarock');
  cd.push([103, 5], [104, 5], [105, 5], [106, 5], [107, 5], [108, 5], [109, 5], [110, 5], [111, 8], [112, 10]);
  fo.push([114, 11, 'puddlefrog']);
  run(113, 115, 2);
  plinth(116, 3);                                                        /* BONUS BOARD 2 */
  box(124, 8, 127, 9); TL.gift.push([125, 9, 'gold']);                  /* THE BONE ARCH (hidden secret): a floating arch, one block glints (no skin: the glint must show) */
  fo.push([128, 11, 'mud'], [132, 6, 'mosquito']);
  run(122, 134, 2);
  TL.gift.push([130, 8, 'candle']); TL.brick.push([129, 8], [131, 8]);
  arc(134, 139, 4, 11);
  fo.push([143, 11, 'egg'], [147, 11, 'slug']);
  TL.gift.push([142, 8, 'candle']);
  run(140, 148, 2);
  vent(150, 5, 450, 100);                                                /* THE THIRD VENT: a five-tile cliff, and THE HIGH PERCH above it */
  box(153, 7, 160, 11, 'lavarock'); box(161, 9, 161, 11, 'lavarock'); box(162, 11, 162, 11, 'lavarock');
  for (var sh = 154; sh <= 157; sh++) TL.shelf.push([sh, 3]);
  cd.push([153, 6], [154, 6], [156, 6], [158, 6], [160, 6], [155, 2], [156, 2], [161, 8], [162, 10]);
  fo.push([165, 11, 'puddlefrog'], [172, 11, 'mud']);
  slam(168, 3);                                                          /* BONUS SLAM 2 */
  TL.gift.push([166, 8, 'cake']); TL.brick.push([165, 8], [167, 8]);
  run(164, 180, 2);
  /* ---- ACT 3 ---- */
  fo.push([178, 11, 'slug'], [184, 6, 'mosquito'], [187, 11, 'egg']);
  TL.gift.push([176, 8, 'candle']); TL.brick.push([175, 8], [177, 8]);
  TL.gift.push([186, 8, 'heart']);
  arc(191, 197, 5, 11); run(182, 189, 2);
  fo.push([200, 11, 'puddlefrog'], [203, 11, 'mud']);
  run(198, 203, 2);
  vent(205, 5, 450, 300);                                                /* THE LAST VENT: a five-tile cliff */
  box(208, 7, 214, 11, 'lavarock'); box(215, 9, 215, 11, 'lavarock'); box(216, 11, 216, 11, 'lavarock');
  cd.push([208, 6], [209, 6], [210, 6], [211, 6], [212, 6], [213, 6], [214, 6], [215, 8], [216, 10]);
  TL.gift.push([202, 8, 'candle']);
  fo.push([219, 11, 'slug'], [229, 11, 'egg'], [226, 6, 'mosquito']);
  run(218, 236, 2);
  TL.gift.push([232, 8, 'cake']); TL.brick.push([231, 8], [233, 8]);
  /* the boss ground c238-271 stays EMPTY (THE ALPHA T-REX's arena, c242-265) */
  TL.gift.push([240, 8, 'candle']);
  TL.gift.push([268, 8, 'heart']);

  var cdOk = cd.filter(function (p, i) { return !blocked(p[0], p[1]) && cd.findIndex(function (q) { return q[0] === p[0] && q[1] === p[1]; }) === i; });
  KinanLevels.register({
    id: '11-4', world: 11, slot: 4, kind: 'level',
    name: 'MINI DINO VALLEY',
    theme: 133,   /* the dino valley: an orange sky, glowing volcanoes, ferns and cycads */
    cols: N,
    /* VOLCANO VENT LIFTS (World 11 twist, opt-in): [col, width, rise (tiles), period, phase]; the shaft is carved with `open` */
    vents: VE,
    /* THE BABY DINO (opt-in follower): its nest [col, row]; it follows Kinan once he walks into it */
    baby: [92, 11],
    heights: H, solid: S, open: OP, skins: SK, tiles: TL, foes: fo, candles: cdOk,
    secrets: [
      { kind: 'visible', col: 97, row: 5, prize: 'heart+candles' },   /* THE NEST LEDGE: ride the puff, step left */
      { kind: 'hidden', col: 125, row: 9, prize: 'GOLDEN CANDLE', glint240: true },   /* THE BONE ARCH */
      { kind: 'skill', col: 155, row: 2, prize: 'hat' }   /* THE HIGH PERCH */
    ],
    goldenCandle: { col: 125, row: 9 },
    checkpoint: { col: 178, row: 11 },
    /* THE ALPHA T-REX (index.html ARENA_KINDS 'alpha-rex', 3 phases): gates c241 and c267, her flag at c238. Never a
       stomp: the baby hops onto its nest by the gate; Kinan carries it across between her echo stomps and boulders,
       and each time she stops to sniff, sets it down on the next glowing rock. The third rock is at her feet */
    arena: { col: 242, cols: 24, boss: 'alpha-rex' },
    spawn: { col: 2, row: 11 },
    goal: { col: 268, row: 11 },
    talk: [
      [2, 'SHAD', "The Dino Valley! I drew the ferns and the volcanoes, then ran out of dinosaurs. Sorry!", 4.2],
      [4, 'KINAN', "Look at those volcanoes! And somewhere there's a T-Rex who lost her baby.", 3.8],
      [6, 'DAD', "Volcanoes, bud? Don't worry. I'm not going to blow my top. Much.", 3.4],
      [8, 'MOM', "Stay together, everyone. Careful near the lava, sweetie.", 3],
      [20, 'CHENOA', "That's a geyser lift! Wait for the steam, then hop on the cloud and let it carry you up.", 4.4],
      [54, 'ANNIE', "The vent glows and steams before it puffs. Chalo! (Let's go!) Stand on the cloud and wait.", 4.4],
      [78, 'DAD', "Why can't you hear a pterodactyl go to the bathroom? Because the P is... hee hee hee... silent...", 4.4, 'wheeze'],
      [78, 'KINAN', '...Dad. Breathe.', 2.4],
      [91, 'KINAN', "A baby dino! Don't worry, little one. We'll take you home to your mama.", 4],
      [93, 'SHAD', 'It will follow you now. I animated it myself. The peeping is my favourite part.', 4],
      [98, 'CHENOA', "See that thin ledge by the vent? Ride the puff, then step LEFT. There's a treat up there.", 4.4],
      [122, 'ANNIE', 'Hai Rabba! (Oh my goodness!) That arch of bones has a glowing block. Jump up and see.', 4.4],
      [150, 'MOM', "Is that all you do, tell jokes? I'm going to ride the geyser in peace.", 3.4, 'walkoff'],
      [150, 'DAD', "...I'll be here all week! Dino-mite!", 3],
      [176, 'SHAD', "A 5 gap next, bud. Take a running start. The checkpoint's right behind you.", 4],
      [236, 'CHENOA', "Open ground ahead. I think I hear a big roar, little bro. The baby knows that voice!", 4.4],
      [240, 'KINAN', "Her field! The baby's peeping like crazy. Mama T-Rex, we're bringing your baby home.", 4.4],
      [268, 'MOM', "Look at them together. Every mama just wants her little one safe.", 3.6]
    ]
  });
})();

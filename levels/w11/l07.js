/* ============================================================
   LEVEL 11-7 · THE SAVE FILE VAULT
   (World 11 · Inside the Console · trail stop 8)
   Story bible (World 11 table): "Replays a moment from every world.
   Secret exit through a corrupted save, leading to 11-secret." Behind
   the Copy-Paste City is the vault where the console keeps every save
   file: one glowing room for every world Kinan has played, in order.
   Walking through them is a trip down memory lane. In the middle of the
   vault, glowing, sits the console Shad built.
   Idea (ONE): TEN SHORT ROOMS, ONE FAMILIAR TRICK EACH. 11-7's rooms
     are the one planned exception to "every trick is new": each is a
     deliberate callback to a world, with a rubber-stamp sign to name it:
     1 HOME (toy bricks and a spring) · 2 SCHOOL (desks you jump up
     through, `shelf`) · 3 OILFIELD (a pumpjack beam bobbing over a gap,
     `planks`) · 4 EDMONTON (the mall rink: slippery `ice`) · 5 STAMPEDE
     (low lasso ropes to jump, `signs`) · 6 DRUMHELLER (floaty light
     gravity, `lowGrav`, and a five-tile rock wall) · 7 VANCOUVER (slug
     slime, `slime`) · 8 TORONTO (moving walkways, `belts`) · 9 MONTREAL
     (escalators) · 10 NIAGARA (a little boat over a five-tile gap,
     `boats`). A hall, THE CORRUPTED SAVE bay and the central hall frame
     them. No new engine key: the engine's older keys, each in one room.
   Acts (thirds): 0-99 teach (the hall, rooms 1-4) · 100-199 twist
     (rooms 5-8 and the bay) · 200-299 test (rooms 9-10, the hall).
   Secrets (NEW here):
     visible = THE RECYCLE BIN (room 3, S4): a hollow in a block, its
       candles and heart in plain view through the opening; KICK the
       wooden board on its side (heart + candles, 80,11) ·
     hidden = THE CORRUPTED SAVE (the bay, S6): a purple glitching file
       hangs over a block that glints; jump up under it. THE SECRET EXIT:
       a door opens on the floor, out to 11-secret (GOLDEN CANDLE,
       158,8) ·
     skill = THE BOAT HOP (room 10, S9): a thin shelf four tiles above
       the little boat's path; stand on the boat and jump up through the
       shelf (hat, 242,7).
   Memory (age 11, Shad 2026-10-29): SHAD'S HANDMADE CONSOLE, glowing in
     the middle of the vault (the hall, c274-275, skin 'console'),
     remembered by a story bubble at c266.
   Bonus (never needed): two wooden boards (the entrance hall, and the
     bin), two slam spots (rooms 4 and 8).
   Gaps: act 1 3/3/3 · act 2 4 · act 3 4/5. Nothing waits at a lip; no
     slippery floor (ice, slime) lies within 8 tiles of a gap; no belt
     ends at a gap.
   Look: theme 137, CON_LOOKS: a dark blue vault of glowing save files,
     file cabinets and a round vault door; each room tints its colour.
   ENGINE REQUESTS: none.
   ============================================================ */
(function () {
  var N = 300, H = [], S = [], OP = [], SK = [], cd = [], fo = [], PL = [], SG = [], BL = [], ES = [], BO = [];
  var TL = { gift: [], brick: [], spring: [], shelf: [], board: [], crack: [], crate: [] };
  for (var i = 0; i < N; i++) H.push(192);
  function pit(c0, c1) { for (var c = c0; c <= c1; c++) H[c] = null; }
  function flat(c0, c1, h) { for (var c = c0; c <= c1; c++) H[c] = h; }
  function box(c0, r0, c1, r1, skin) { S.push([c0, r0, c1, r1]); if (skin) SK.push([skin, c0, r0, c1, r1]); }
  function stand(c) { return Math.floor(H[c] / 16) - 1; }
  function run(c0, c1, step) { for (var c = c0; c <= c1; c += step || 2) if (H[c] != null) cd.push([c, stand(c)]); }
  function row(c0, c1) { for (var c = c0; c <= c1; c++) cd.push([c, 11]); }
  function inBox(c, r, R) { return R.some(function (b) { return c >= b[0] && c <= b[2] && r >= b[1] && r <= b[3]; }); }
  function blocked(c, r) { return (inBox(c, r, S) && !inBox(c, r, OP)) || ['gift', 'brick', 'spring', 'shelf', 'board', 'crack', 'crate'].some(function (k) { return TL[k].some(function (t) { return t[0] === c && t[1] === r; }); }); }
  function plinth(c, w, skin) {   /* BONUS: a 2-tall block with a hollow; a KICK breaks the board that seals it (the path hops over it) */
    box(c, 10, c + w + 1, 11, skin); OP.push([c + 1, 11, c + w, 11]); TL.board.push([c, 11]);
    for (var i = 1; i <= w; i++) cd.push([c + i, 11]);
  }
  function slam(c, w) {   /* BONUS: cracked boards over a pocket of candles (a butt slam; solid floor under the pocket) */
    OP.push([c, 13, c + w - 1, 13]);
    for (var i = 0; i < w; i++) { TL.crack.push([c + i, 12]); cd.push([c + i, 13]); }
  }
  function sign(c, word) { SK.push(['stamp:' + word, c, 4, c + 5, 5]); }   /* the room's rubber stamp */

  pit(36, 38); pit(58, 60); pit(72, 74); pit(124, 127); pit(206, 209); pit(240, 244);

  /* ---- the entrance hall (0-19) ---- */
  sign(2, 'THE VAULT');
  TL.gift.push([6, 8, 'candle']); TL.brick.push([5, 8], [7, 8]);
  plinth(10, 3, 'file');                                                 /* BONUS BOARD 1 */
  fo.push([17, 11, 'roomba']);
  run(3, 8, 2); run(15, 19, 2);
  /* ---- ROOM 1 · HOME (20-41): toy bricks and a spring ---- */
  sign(21, 'HOME');
  fo.push([24, 11, 'sock'], [34, 11, 'teddy']);
  TL.gift.push([23, 8, 'candle']);
  TL.spring.push([28, 11]); TL.brick.push([31, 8], [33, 8]); TL.gift.push([32, 8, 'heart']);
  row(35, 39); run(21, 27, 2); run(29, 30, 1);
  /* ---- ROOM 2 · SCHOOL (42-63): desks to jump up through ---- */
  sign(43, 'SCHOOL');
  for (var d = 47; d <= 50; d++) TL.shelf.push([d, 9]);
  for (var d2 = 53; d2 <= 56; d2++) TL.shelf.push([d2, 7]);
  cd.push([48, 8], [49, 8], [54, 6], [55, 6]);
  fo.push([46, 11, 'paint'], [52, 5, 'brush']);
  run(44, 56, 2); row(57, 61);
  /* ---- ROOM 3 · OILFIELD (64-85): a pumpjack beam over the gap, and THE RECYCLE BIN ---- */
  sign(65, 'OILFIELD');
  PL.push([73, 12, 2, 5, 120, 0, 0]);                                    /* the pumpjack beam: bobs 5 px over the 3 gap */
  fo.push([68, 11, 'cone'], [84, 11, 'mud']);
  row(71, 76);
  plinth(78, 3);                                                         /* THE RECYCLE BIN (visible secret): its candles and heart show through the opening */
  cd.push([79, 11], [80, 11], [81, 11]); run(66, 70, 2); run(83, 85, 1);
  /* ---- ROOM 4 · EDMONTON (86-107): the mall rink ---- */
  sign(87, 'EDMONTON');
  box(95, 11, 95, 11, 'chip'); box(100, 11, 100, 11, 'chip');
  TL.gift.push([97, 8, 'candle']); TL.brick.push([96, 8], [98, 8]);
  fo.push([92, 11, 'mallwalker'], [103, 11, 'cart']);
  run(89, 94, 2); run(96, 99, 2); run(101, 107, 2);
  slam(105, 3);                                                          /* BONUS SLAM 1 */
  /* ---- ROOM 5 · STAMPEDE (108-129): low lasso ropes to hop ---- */
  sign(109, 'STAMPEDE');
  fo.push([113, 11, 'haybale'], [121, 11, 'corndog']);
  TL.gift.push([119, 8, 'candle']); TL.brick.push([118, 8], [120, 8]);
  SG.push([111, 'jump'], [115, 'jump']);                                 /* two low ropes, far (9+ tiles) from the 4 gap: a hop over a rope must not carry him into it */
  arc(123, 128, 4, 11); run(109, 110, 1); run(112, 114, 1); run(116, 122, 2);
  /* ---- ROOM 6 · DRUMHELLER (130-151): light gravity and a five-tile rock wall ---- */
  sign(131, 'DRUMHELLER');
  box(141, 7, 144, 11, 'granite'); box(145, 9, 145, 11, 'granite'); box(146, 11, 146, 11, 'granite');
  fo.push([135, 11, 'mud'], [138, 11, 'egg'], [149, 11, 'mud']);
  TL.gift.push([136, 8, 'candle']);
  cd.push([141, 6], [142, 6], [143, 6], [144, 6], [145, 8], [146, 10]); run(132, 139, 2); run(148, 151, 2);
  /* ---- the bay (152-165): THE CORRUPTED SAVE, the secret exit ---- */
  box(158, 8, 158, 8); TL.gift.push([158, 8, 'gold']);                  /* the block under it glints (no skin: the glint must show) */
  SK.push(['savebad', 156, 3, 160, 6]);
  run(152, 157, 2); run(160, 165, 2);
  TL.gift.push([154, 8, 'candle']);
  /* ---- ROOM 7 · VANCOUVER (166-187): slug slime ---- */
  sign(167, 'VANCOUVER');
  box(176, 11, 176, 11, 'cedar'); box(181, 11, 181, 11, 'cedar');
  fo.push([172, 11, 'slug'], [179, 11, 'raccoon']);
  TL.gift.push([174, 8, 'candle']); TL.brick.push([173, 8], [175, 8]);
  run(168, 175, 2); run(177, 187, 2);
  /* ---- ROOM 8 · TORONTO (188-209): moving walkways, then a 4 gap ---- */
  sign(189, 'TORONTO');
  BL.push([192, 199, 12, 1.0], [200, 205, 12, -0.8]);
  fo.push([190, 11, 'raccoon'], [196, 11, 'cart'], [203, 11, 'mallwalker']);
  TL.gift.push([194, 8, 'candle']); TL.brick.push([193, 8], [195, 8]);
  row(206, 209); run(190, 205, 2);
  slam(198, 3);                                                          /* BONUS SLAM 2 */
  /* ---- ROOM 9 · MONTREAL (210-231): escalators ---- */
  sign(211, 'MONTREAL');
  H[215] = 184; H[216] = 176; H[217] = 168; flat(218, 222, 160); H[223] = 168; H[224] = 176; H[225] = 184;
  ES.push([215, 217, 1.0], [223, 225, 1.0]);
  fo.push([212, 11, 'mallwalker'], [220, 6, 'scanner'], [228, 11, 'roomba']);
  TL.gift.push([229, 8, 'candle']);
  run(211, 214, 2); run(218, 222, 2); run(226, 231, 2);
  /* ---- ROOM 10 · NIAGARA (232-253): a little boat over a five-tile gap, and THE BOAT HOP ---- */
  sign(233, 'NIAGARA');
  BO.push([240, 244, 12, 3, 0.6]);
  for (var sh = 241; sh <= 243; sh++) TL.shelf.push([sh, 8]);
  cd.push([242, 7], [243, 7]); row(239, 245);
  fo.push([236, 11, 'raccoon'], [248, 11, 'cart'], [236, 5, 'seagull']);
  TL.gift.push([250, 8, 'candle']); TL.brick.push([249, 8], [251, 8]);
  run(234, 238, 2); run(246, 253, 2);
  /* ---- THE CENTRAL HALL (254-299): Shad's handmade console, glowing ---- */
  box(274, 10, 275, 11, 'console');                                      /* the memory gift on its stand */
  box(262, 10, 263, 11, 'file'); box(286, 10, 287, 11, 'file');
  TL.gift.push([258, 8, 'heart'], [280, 8, 'cake'], [298, 8, 'heart']); TL.brick.push([257, 8], [259, 8]);
  fo.push([268, 11, 'roomba']);
  run(255, 261, 2); run(264, 272, 2); run(277, 285, 2); run(288, 297, 2);

  function arc(c0, c1, peak, r) { for (var c = c0; c <= c1; c++) { var t = (c - c0) / (c1 - c0); cd.push([c, Math.round(r - peak * 4 * t * (1 - t))]); } }
  var cdOk = cd.filter(function (p, i) { return !blocked(p[0], p[1]) && cd.findIndex(function (q) { return q[0] === p[0] && q[1] === p[1]; }) === i; });
  KinanLevels.register({
    id: '11-7', world: 11, slot: 8, kind: 'level',
    name: 'THE SAVE FILE VAULT',
    theme: 137,   /* the vault: glowing save files, file cabinets, a round vault door */
    cols: N,
    /* the rooms' tricks (every key is an older world's, each used in one room): */
    planks: PL, ice: [[90, 104]], signs: SG, lowGrav: [[133, 148]], slime: [[170, 184]], belts: BL, escalators: ES, boats: BO,
    heights: H, solid: S, open: OP, skins: SK, tiles: TL, foes: fo, candles: cdOk,
    secrets: [
      { kind: 'visible', col: 80, row: 11, prize: 'heart+candles' },   /* THE RECYCLE BIN: kick the board */
      { kind: 'hidden', col: 158, row: 8, prize: 'GOLDEN CANDLE', glint240: true, exit: '11-secret' },   /* THE CORRUPTED SAVE: the secret exit */
      { kind: 'skill', col: 242, row: 7, prize: 'hat' }   /* THE BOAT HOP */
    ],
    goldenCandle: { col: 158, row: 8 },
    checkpoint: { col: 152, row: 11 },
    spawn: { col: 2, row: 11 },
    goal: { col: 292, row: 11 },
    talk: [
      [2, 'SHAD', "The Save File Vault. Every world you've played is saved here, one room each. I never got to label them all.", 5],
      [4, 'KINAN', "Our whole adventure, in order! Home first, then school, and on and on...", 3.6],
      [6, 'DAD', "A vault of saves? I'd say this place is a real safe haven. Get it? Safe? Save?", 4],
      [8, 'ANNIE', "Every room is a moment we lived. Chalo! (Let's go!) I'll read the labels as we go.", 4],
      [10, 'MOM', "Oh, look, sweetie. That's our living room. Well, a copy of it.", 3.6],
      [28, 'DAD', "Toy bricks and a spring, bud! That's where it all started. Boing, boing, boing!", 3.6],
      [46, 'CHENOA', "Remember these desks, little bro? Jump up through them, from underneath.", 3.8],
      [66, 'DAD', "The pumpjack! That's my kind of bobbing for a living.", 3.4],
      [76, 'CHENOA', "See the candles and the heart inside that block? A board seals it. Kick it!", 4],
      [88, 'SHAD', "The mall rink! Ice is slippery, so don't stop and don't turn fast.", 3.8],
      [110, 'MOM', "Those low ropes: hop them like a rodeo star, sweetie.", 3.4],
      [112, 'DAD', "Why did the cowboy get a dachshund? Because he wanted to... hee hee... get a long little... doggie— I can't—", 4.4, 'wheeze'],
      [112, 'KINAN', "...Dad. That's from the Stampede. We've heard it.", 3],
      [132, 'KINAN', "Floaty jumps in the badlands! I loved this. The big rock wall is easy now.", 4],
      [154, 'ANNIE', "Hai Rabba! (Oh my goodness!) A corrupted save file. The block under it is glowing. Maybe a way out?", 4.6],
      [168, 'CHENOA', "Slug slime again! It's slippery, so go slow and steady.", 3.6],
      [190, 'DAD', "A moving walkway, bud. Let's get this show on the... roll!", 3.6],
      [212, 'ANNIE', "Escalators! Shabash! (Well done!) Stand still and they carry you.", 3.8],
      [234, 'SHAD', "Last room. The little boat carries you over the gap. Hop on, little bro!", 3.8],
      [256, 'MOM', "Is that all you do, tell jokes? Let's go see what's in the middle of the vault.", 4, 'walkoff'],
      [256, 'DAD', "...I'll be here all week! The middle is the heart of the matter, bud.", 3.8],
      [266, 'KINAN', "Wait... this is the console Shad built me. It was in the box the whole time.", 5],
      [270, 'SHAD', "I put it in the Vault so it would always be safe, little bro. Happy birthday.", 4.4],
      [290, 'KINAN', "Thanks, Shad. Now let's find Glitchy, and show him he isn't broken.", 4.4]
    ]
  });
})();

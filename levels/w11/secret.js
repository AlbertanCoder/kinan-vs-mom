/* ============================================================
   SECRET · SHAD'S DEV ROOM
   (World 11 · Inside the Console · trail stop 9; found through the
   corrupted save in 11-7, The Save File Vault)
   Story bible (World 11 table): "A calm reward room: Shad's sketches
   and notes pinned on the walls, and a thank-you note. No danger;
   candles; drawn sketches of the game's characters and maps (made by
   the game, never photos), and the note on a desk Kinan can read."
   This is where Shad built the game, all of it, one lamp-lit night at
   a time. A cosy room at night: string lights, a window on the stars,
   cork pinboards covered in pencil sketches (Kinan with his one braid
   and red tie, Mom, Dad in his hard hat, Chenoa, Big Bro Shad, Annie in
   her camel coat, the cat Ginger, the dog Chikastino, the door in the
   mist, Glitchy, the maps and the plans), all drawn by the game as
   backdrop pictures, none of them photos.
   Idea: there is none to master. Walk the whole room, read the wall,
   hop a toy box, and read the note on the desk at the end. No foes, no
   gaps, no lasers, nothing that can hurt him: the floor is one long
   flat carpet; the furniture is low enough to hop.
   THE NOTE (word for word, a first draft by Shad): four story bubbles
   at c118, one after the other (the engine allows 140 letters a bubble,
   so it takes four): "Hey bud, you found my secret room! This is where
   I built your game: every world, every boss, and every one of Dad's
   jokes (sorry)." · "I made it for your 11th birthday because you're
   the best little brother there is." · "Thanks for playing, for
   laughing, and for never giving up, even on the hard levels. Keep
   kicking, keep building, keep being you." · "Happy birthday, Kinan.
   Love, Big Bro Shad." The desk (skin `desk`, c124-127) wears the folded
   note with a gentle sparkle.
   Secret slot: exempt from the 3-secrets lint. Calm extras (never
   needed): a toy-box nook sealed by a wooden board (c64-68), a slam
   spot under a cracked floorboard (c106-108), shelves of candles.
   Look: theme 139, CON_LOOKS: a cosy dev room at night (see the scene).
   ENGINE REQUESTS: none.
   ============================================================ */
(function () {
  var N = 150, H = [], S = [], OP = [], SK = [], cd = [];
  var TL = { gift: [], brick: [], spring: [], shelf: [], board: [], crack: [], crate: [] };
  for (var i = 0; i < N; i++) H.push(192);
  function box(c0, r0, c1, r1, skin) { S.push([c0, r0, c1, r1]); if (skin) SK.push([skin, c0, r0, c1, r1]); }
  function stand(c) { return Math.floor(H[c] / 16) - 1; }
  function run(c0, c1, step) { for (var c = c0; c <= c1; c += step || 2) cd.push([c, stand(c)]); }
  function inBox(c, r, R) { return R.some(function (b) { return c >= b[0] && c <= b[2] && r >= b[1] && r <= b[3]; }); }
  function blocked(c, r) { return (inBox(c, r, S) && !inBox(c, r, OP)) || ['gift', 'brick', 'spring', 'shelf', 'board', 'crack', 'crate'].some(function (k) { return TL[k].some(function (t) { return t[0] === c && t[1] === r; }); }); }

  TL.gift.push([8, 8, 'candle'], [22, 8, 'heart'], [44, 8, 'candle'], [70, 8, 'cake'], [100, 8, 'candle'], [112, 8, 'heart'], [136, 8, 'heart']);
  TL.brick.push([7, 8], [9, 8], [43, 8], [45, 8], [99, 8], [101, 8]);
  /* the furniture: low enough to hop */
  box(26, 10, 27, 11, 'file'); box(58, 10, 59, 11, 'file'); box(84, 10, 85, 11, 'toybrick');
  /* the toy-box nook (a bonus: a KICK breaks its board) and a slam spot (a butt slam breaks the cracked floorboards) */
  box(64, 10, 68, 11, 'toybrick'); OP.push([65, 11, 67, 11]); TL.board.push([64, 11]); cd.push([65, 11], [66, 11], [67, 11]);
  OP.push([106, 13, 108, 13]); TL.crack.push([106, 12], [107, 12], [108, 12]); cd.push([106, 13], [107, 13], [108, 13]);
  /* bookshelves: shelves with candles */
  for (var a = 36; a <= 40; a++) TL.shelf.push([a, 9]);
  for (var b = 42; b <= 46; b++) TL.shelf.push([b, 7]);
  for (var c = 92; c <= 96; c++) TL.shelf.push([c, 9]);
  for (var d = 98; d <= 102; d++) TL.shelf.push([d, 7]);
  cd.push([37, 8], [39, 8], [43, 6], [45, 6], [93, 8], [95, 8], [99, 6], [101, 6]);
  /* the desk with Shad's note */
  box(124, 10, 127, 11, 'desk');
  run(3, 19, 2); run(28, 56, 2); run(60, 62, 2); run(69, 83, 2); run(86, 91, 2); run(103, 105, 1); run(109, 122, 2); run(129, 148, 2);

  var cdOk = cd.filter(function (p, i) { return !blocked(p[0], p[1]) && cd.findIndex(function (q) { return q[0] === p[0] && q[1] === p[1]; }) === i; });
  KinanLevels.register({
    id: '11-secret', world: 11, slot: 9, kind: 'secret',
    name: "SHAD'S DEV ROOM",
    theme: 139,   /* the dev room at night: string lights, a window on the stars, pinboards of pencil sketches */
    cols: N,
    heights: H, solid: S, open: OP, skins: SK, tiles: TL, candles: cdOk,
    spawn: { col: 2, row: 11 },
    goal: { col: 140, row: 11 },
    talk: [
      [2, 'KINAN', "Wait... a real room? It's Shad's room, inside the console! Look at all the drawings!", 4.2],
      [4, 'SHAD', "You found it! My dev room. It's a bit messy. Don't look at the sticky notes.", 4],
      [6, 'DAD', "A room full of notes? I'd say Shad really sticks to his plans. Get it? Sticky?", 4],
      [8, 'MOM', "Oh, Shad. It's so cosy in here, sweetie. And look at that window full of stars.", 4.2],
      [10, 'ANNIE', "Shabash! (Well done!) Your sketches are wonderful, Shad. Even my camel coat is right.", 4.2],
      [28, 'SHAD', "Those are my sketches of everybody. Pencil first, then pixels.", 3.6],
      [50, 'CHENOA', "You drew me with my ponytail, Shad. Okay, that one is really good.", 3.8],
      [76, 'KINAN', "And there's the map of everywhere we've been. And the door in the mist!", 3.8],
      [96, 'DAD', "Why did the pencil go to the dev room? It wanted to... hee hee... draw some attention... I can't—", 4.2, 'wheeze'],
      [96, 'KINAN', '...Dad. Breathe.', 2.4],
      [110, 'MOM', "Ha! That one was drawn out. Come on, there's a note on the desk, sweetie.", 3.8, 'laugh'],
      /* THE NOTE: four bubbles at the desk, word for word (split only at sentence ends; 140 letters a bubble at most) */
      [118, 'SHAD', "Hey bud, you found my secret room! This is where I built your game: every world, every boss, and every one of Dad's jokes (sorry).", 6.5],
      [118, 'SHAD', "I made it for your 11th birthday because you're the best little brother there is.", 5],
      [118, 'SHAD', "Thanks for playing, for laughing, and for never giving up, even on the hard levels. Keep kicking, keep building, keep being you.", 6.5],
      [118, 'SHAD', "Happy birthday, Kinan. Love, Big Bro Shad.", 4.5],
      [134, 'KINAN', "Thank you, Shad. This is the best birthday present ever. I'll keep kicking.", 4.4]
    ]
  });
})();

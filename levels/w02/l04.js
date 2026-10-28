/* ============================================================
   LEVEL 2-4 · THE LIBRARY STACKS  (World 2 · School · trail stop 4)
   Story bible (World 2 table): "Climb the bookshelves. Vader joins."
   Glitchy hid in the school library. The book carts roll on their own,
   paper planes swoop between the stacks, and somewhere in the reading
   nook a curious black cat is watching.
   Idea (ONE): CLIMB THE STACKS. Every bookcase has shelves sticking
   out of its side: jump up through them like a ladder, walk along the
   top, hop across to the next bookcase. Act 1: the aisles between the
   stacks have a floor (fall and you just climb again). Act 2: the
   aisles are drop-offs, so the hop from top to top is for real (4
   wide), and the shelf bridge over the gap. Act 3: the tallest stacks
   with a 5-wide hop between their tops, a book-cart lane, and the
   reading nook.
   Acts (thirds): 0-71 teach (the returns desk, stacks A, B and C, a
   3-wide gap, the reading desk) · 72-143 twist (stacks D and E over a
   4-wide drop, the checkpoint, the card catalogue and the shelf bridge
   over a 4-wide drop) · 144-215 test (the shelf ladder up stack G, a
   5-wide hop to stack H, the book-cart lane and a 4-wide gap, then
   the reading nook).
   Signature set-piece: THE TOP-TO-TOP HOP (S6): climb the ladder of
   shelves up the tallest stack and run-jump across to the next one.
   Secrets: visible = the top shelf over the shelf bridge: hop up off
   the bridge, then across, while a paper plane loops by (heart +
   candles, 122,2) · hidden = under the reading desk: one board of the
   desk glints; jump under it (GOLDEN CANDLE, 63,9) · skill = the
   reading nook's floating shelves: three small ledges, the last one
   back to the LEFT (hat, 194,2).
   All three secrets and the goal were reached by script, hop by hop.
   Look: borrows the living room (theme 1): tall windows, wall shelves
   and a wooden floor, which read as a sunny school library.
   Bubble beats for ER-4 (not wired): c2 "Shhh. This is a library.
   ...WHY IS THE BOOK CART MOVING?" · c63 "Something shiny under the
   reading desk." · c97 checkpoint "Glitchy went up. Of course he went
   up." · c205 a black cat on the reading-nook chair: "Mrrp?" (Vader).
   ENGINE REQUESTS: Vader joining at the reading nook (a pet crate in an
   authored level, ER-5, plus a bubble); a rolling library ladder (a
   moving platform); book-cart and paper-plane skins; a library look.
   ============================================================ */
KinanLevels.register({
  id: '2-4', world: 2, slot: 4, kind: 'level',
  name: 'THE LIBRARY STACKS',
  theme: 1,                 /* tall windows, wall shelves, a wooden floor: a sunny library */
  cols: 216,
  heights: [
    /* S1 0-26 the returns desk (c7-10) · STACK A (c16-20) with its shelf ladder */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 STACKS B (c30-33) and C (c37-41), an aisle with a floor between · a 3-wide gap c47-49 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null, 192,192,192,192,
    /* S3 54-80 the reading desk (c58-64) · a book cart · STACK D (c74-78) · the drop c79-82 starts */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,
    /* S4 81-107 the drop ends · STACK E (c83-87) · STACK F (c90-94) · the checkpoint · a book cart */
    null,null, 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 the card catalogue (c112-115) · THE SHELF BRIDGE (c116-127) over the drop c120-123 */
    192,192,192,192,192,192,192,192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 the shelf ladder · STACK G (c140-145) · the 5-wide drop c146-150 · STACK H (c151-155) */
    192,192,192,192,192,192,192,192,192,192,192, null,null,null,null,null, 192,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 the book-cart lane (c164-168) · 8 tiles of floor · a 4-wide gap c178-181 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192,
    /* S8 189-215 reward: the reading nook, its floating shelves, the armchair, the library door */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [7, 10, 10, 11],                      /* the returns desk */
    [16, 6, 20, 11], [21, 9, 22, 11],     /* STACK A (6 tall) and a step down */
    [30, 5, 33, 11], [37, 5, 41, 11],     /* STACKS B and C (7 tall) */
    [42, 8, 43, 11], [44, 10, 45, 11],    /* steps down from C */
    [56, 10, 56, 11], [58, 8, 64, 9],     /* a chair and the reading desk (2 rows of room under it) */
    [66, 11, 66, 11],                     /* a pile of returns: keeps the book cart out from under the desk */
    [74, 5, 78, 11], [83, 5, 87, 11],     /* STACKS D and E (7 tall), the 4-wide drop between them */
    [90, 8, 94, 11],                      /* STACK F (4 tall) */
    [112, 10, 113, 11], [114, 8, 115, 11],   /* the card catalogue: two drawer steps */
    [140, 5, 145, 11], [151, 5, 155, 11], /* STACKS G and H (7 tall), the 5-wide drop between them */
    [156, 8, 157, 11], [158, 10, 159, 11],   /* steps down from H */
    [163, 11, 163, 11], [169, 11, 169, 11],   /* book piles at the ends of the cart lane */
    [203, 10, 205, 11]                    /* the reading-nook armchair (Vader's seat) */
  ],
  tiles: {
    gift: [[9, 7, 'popper'], [63, 9, 'gold'], [92, 4, 'candle'], [166, 8, 'candle'], [185, 8, 'heart'], [204, 7, 'cake']],
    shelf: [[14, 9], [15, 9],                                             /* stack A's shelf ladder */
            [28, 9], [29, 9], [28, 6], [29, 6],                           /* stack B's */
            [35, 9], [36, 9], [35, 6], [36, 6],                           /* stack C's (in the aisle) */
            [72, 9], [73, 9], [72, 6], [73, 6],                           /* stack D's */
            [116, 8], [117, 8], [118, 8], [119, 8], [120, 8], [121, 8], [122, 8], [123, 8], [124, 8], [125, 8], [126, 8], [127, 8],   /* THE SHELF BRIDGE */
            [118, 5], [119, 5], [121, 3], [122, 3],                       /* up to the top shelf (visible secret) */
            [138, 9], [139, 9], [138, 6], [139, 6],                       /* the shelf ladder up stack G */
            [194, 9], [195, 9], [197, 6], [198, 6], [194, 3], [195, 3]]   /* the reading nook's floating shelves (skill) */
  },
  /* teddies from the reading corner walk, book carts roll fast, paper planes loop */
  foes: [[25, 11, 'teddy'],
         [39, 4, 'teddy'],
         [69, 11, 'cart'],
         [103, 11, 'cart'],
         [125, 5, 'plane'], [131, 11, 'teddy'],
         [143, 4, 'teddy'],
         [166, 11, 'cart'], [172, 4, 'plane'],
         [199, 11, 'teddy']],
  candles: [[3, 11], [4, 11], [8, 9], [10, 9], [14, 8], [15, 8], [17, 5], [19, 5],
            [28, 8], [29, 5], [31, 4], [32, 4], [34, 3], [35, 3], [36, 3], [38, 4], [40, 4], [47, 9], [48, 8], [49, 9], [51, 11], [52, 11],
            [59, 11], [60, 11], [61, 11], [62, 11], [59, 7], [62, 7], [72, 8], [73, 5], [75, 4], [77, 4],
            [79, 3], [80, 2], [81, 2], [82, 3], [84, 4], [86, 4], [91, 7], [93, 7], [96, 11], [99, 11],
            [113, 9], [115, 7], [117, 7], [119, 7], [121, 7], [123, 7], [125, 7], [127, 7], [118, 4], [119, 4], [121, 2], [130, 11],
            [138, 8], [139, 5], [141, 4], [144, 4], [146, 3], [147, 2], [148, 2], [149, 2], [150, 3], [152, 4], [154, 4],
            [165, 10], [167, 10], [173, 11], [175, 11], [178, 9], [179, 8], [180, 8], [181, 9], [184, 11], [186, 11],
            [194, 8], [197, 5], [195, 2], [208, 11], [209, 11]],
  secrets: [
    { kind: 'visible', col: 122, row: 2, prize: 'heart+candles' },               /* the top shelf over the shelf bridge */
    { kind: 'hidden', col: 63, row: 9, prize: 'GOLDEN CANDLE', glint240: true }, /* under the reading desk */
    { kind: 'skill', col: 194, row: 2, prize: 'hat' }                            /* the reading nook's floating shelves */
  ],
  goldenCandle: { col: 63, row: 9 },
  checkpoint: { col: 97, row: 11 },
  spawn: { col: 2, row: 11 },
  pet: { id: 'cat2', col: 199, row: 11 },  /* Vader, found in the library: his crate on the floor by the reading-nook chair, on the way */
  goal: { col: 212, row: 11 }             /* the library door */
});

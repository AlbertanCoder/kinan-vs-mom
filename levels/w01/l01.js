/* ============================================================
   LEVEL 1-1 · KINAN'S BEDROOM  (World 1 · Saskatoon home · trail stop 1)
   Story bible: "Walking socks and angry bricks teach jumping. Ginger
   wakes up." Kinan wakes on his birthday, hops off his bed, and his
   bedroom has gone wild.
   Idea (ONE): JUMP. Run right, hop down, bump a gift, hop a sock,
   climb toy blocks. Almost no danger: the only real pit is 2 wide,
   after the checkpoint, under a candle arc.
   Acts (thirds): 0-44 teach (bed, rug, pillow hill, toy bin dip) ·
   45-89 twist (brick row, ABC-block pyramid, the desk) · 90-134 test
   (bookshelf climb, then the bouncy-pillow reward and the door).
   Signature toy: the bouncy pillow (spring) up to the high shelf.
   Secrets: visible = top of the bookshelf (heart) · hidden = under the
   desk (GOLDEN CANDLE) · skill = bouncy pillow to the high shelf (cake).
   Not wired yet (ENGINE REQUESTS): Ginger the kitten waking up and
   joining (pet crate, ER-5); the age-1 memory gift; bricks are solid
   blocks (no breaking yet).
   ============================================================ */
KinanLevels.register({
  id: '1-1', world: 1, slot: 1, kind: 'level',
  name: "KINAN'S BEDROOM",
  theme: 0,                 /* the legacy bedroom look */
  cols: 135,
  heights: [
    /* S1 0-26 wake up: the bed, the rug, the first gift */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 pillow hill (BROW c30-35) · toy-bin dip c43-44 (a floor 1 tile down, never a pit) */
    192,192,192, 184, 176,176,176,176, 184, 192, 192,192,192,192,192,192, null,null, 192,192,192,192,192,192,192,192,192,
    /* S3 54-80 ABC-block pyramid + the desk (solid blocks on a flat floor) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 the one real pit (c89-90) · the bookshelf */
    192,192,192,192,192,192,192,192, null,null, 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 bouncy pillow + high shelf + the bedroom door */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [0, 10, 6, 10],                       /* the bed: Kinan wakes up on it; a crawl space under it */
    [22, 11, 23, 11], [25, 10, 26, 11],   /* toy box (1 high) and toy chest (2 high): the first hops */
    [43, 13, 44, 14],                     /* the toy-bin dip's floor: fall in, hop out */
    [55, 11, 55, 11], [56, 10, 56, 11], [57, 9, 58, 11], [59, 10, 59, 11], [60, 11, 60, 11],   /* ABC-block pyramid */
    [64, 10, 64, 11],                     /* the desk chair (2 high) */
    [66, 8, 73, 9]                        /* the desk: 2 rows thick, 2 rows of room under it */
  ],
  tiles: {
    gift: [[13, 9, 'hat'], [47, 9, 'candle'], [49, 9, 'candle'], [71, 9, 'gold'], [103, 3, 'heart'], [118, 3, 'cake']],
    brick: [[46, 9], [48, 9], [50, 9]],
    spring: [[112, 12]],          /* the bouncy pillow, flush with the floor: walk over it and BOING */
    shelf: [[93, 9], [94, 9], [95, 9], [97, 7], [98, 7], [99, 7], [101, 5], [102, 5], [103, 5],
            [116, 6], [117, 6], [118, 6], [119, 6]],
    board: [[6, 11]]              /* taekwondo (2026-10-28): the first board, in its holder under the bed's edge. Kinan hops
                                     off the bed past it (never in the way); KICK it and the candles under the bed are his */
  },
  talk: [[7, 'KINAN', 'Sabumnim always says: focus first, then kick!']],   /* + the "Tap KICK" / "Press X" hint near the board */
  foes: [[19, 11, 'sock'], [39, 11, 'teddy'], [62, 11, 'sock'], [70, 4, 'plane'],
         [97, 11, 'sock'], [105, 11, 'teddy'], [126, 11, 'sock']],
  candles: [[1, 11], [2, 11], [3, 11], [4, 11], [5, 11],          /* under the bed */
            [9, 11], [10, 11], [11, 11],
            [31, 8], [32, 7], [33, 7], [34, 8], [43, 12], [44, 12],
            [57, 8], [58, 8], [67, 11], [68, 11], [69, 11], [70, 11], [68, 7], [69, 7], [70, 7],
            [88, 9], [89, 8], [90, 8], [91, 9], [94, 8], [98, 6], [102, 4],
            [112, 7], [112, 5], [116, 5], [117, 5], [119, 5], [128, 11], [129, 11]],
  secrets: [
    { kind: 'visible', col: 103, row: 3, prize: 'heart' },          /* Secret-1: climb the bookshelf to the top */
    { kind: 'hidden', col: 71, row: 9, prize: 'GOLDEN CANDLE' },    /* Secret-2: under the desk, bump the desk's underside */
    { kind: 'skill', col: 118, row: 3, prize: 'cake' }              /* Secret-3: bouncy pillow, steer onto the high shelf */
  ],
  goldenCandle: { col: 71, row: 9 },
  checkpoint: { col: 84, row: 11 },
  spawn: { col: 3, row: 9 },              /* standing on the bed */
  pet: { id: 'cat1', col: 16, row: 11 },  /* Ginger wakes up: her crate on the bedroom floor, on the way, before the first sock */
  goal: { col: 131, row: 11 }             /* the bedroom door */
});

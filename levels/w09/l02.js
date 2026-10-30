/* ============================================================
   LEVEL 9-2 · THE OLD PORT ZIP LINE
   (World 9 · Montreal · trail stop 2)
   Story bible (World 9 table): "Zip lines over the harbour." Glitchy's
   trail leads down to the Old Port on the St. Lawrence River: the
   quays, the white clock tower on its pier, the long green bridge
   across the water. The fastest way over the harbour basins is the
   zip lines strung between the quays.
   Idea (ONE): THE ZIP LINES (opt-in `zips`, new in World 9). In the
     air, Kinan's hands catch a cable when his head reaches it; he
     slides down it, faster and faster, and lets go at the far mast
     (or with a fresh JUMP press). Jump at the lip of a basin and the
     cable is right there. Act 1 teaches it (a short line over a 3 gap
     that you could also jump, a longer one over the basin and its
     little pier, then one from the high quay); act 2 twists it (a
     line over two 4-wide basins, THE CONTAINERS, a long crossing from
     the ferry quay); act 3 tests it (two long lines over pairs of
     5-wide basins).
     Under every line there is a pier between the basins (miss the
     cable and you can still hop it), and every line lets go over a
     long quay.
   Acts (thirds): 0-89 teach (Z1 3 · Z2 3/3 · the clock tower quay, Z3
     3/3) · 90-179 twist (Z4 3/4, THE CUSTOMS HOUSE SIGN, THE
     CONTAINERS, Z6 4/4, the ferry quay, Z7 4/5) · 180-269 test (Z8
     5/5, Z9 5/5, THE CLOCK TOWER LEDGE).
   Secrets: visible = THE CONTAINERS (S5): a shelf high over the
     container stack; climb the containers, then jump UP (heart +
     candles, 122,2) · hidden = THE CUSTOMS HOUSE SIGN (S5): the stone
     sign over the quay has one glinting panel; jump under it (GOLDEN
     CANDLE, 114,6; two candles point up) · skill = THE CLOCK TOWER
     LEDGE (S10): bounce off the spring and steer onto the ledge (hat,
     251,2).
   Candles hang under every cable, right where Kinan's body slides.
   Gaps: act 1 3/3/3/3/3/3 · act 2 4/4/4/4 · act 3 5/5/5/5. Nothing
     waits at a lip. A full-run jump off the clock tower quay, the
     containers, the ferry quay or the clock tower ledge comes down on
     floor (w9-levels.spec.ts checks it: off a quay, the cable catches
     him and lets go over the next long quay).
   Look: the Old Port (theme 111, World 9's own look): the St. Lawrence
     with the long green truss bridge across it, the white clock tower
     at the end of its pier, harbour cranes, the quay railing.
   ENGINE REQUESTS: none (the zip line is in: `zips`).
   ============================================================ */
KinanLevels.register({
  id: '9-2', world: 9, slot: 2, kind: 'level',
  name: 'THE OLD PORT ZIP LINE',
  theme: 111,   /* the Old Port: the river, the green bridge, the clock tower, cranes */
  cols: 270,
  /* THE ZIP LINES (World 9 twist, opt-in): [c0, r0, c1, r1] — the cable runs from the top of the mast at (c0, r0)
     down to the mast at (c1, r1) */
  zips: [
    [16, 8, 27, 9],   /* Z1 S1 over a 3 gap (you could jump it too) */
    [31, 8, 47, 10],   /* Z2 S2 over the basin and its little pier */
    [62, 7, 80, 9],   /* Z3 S3 from the clock tower quay */
    [84, 8, 101, 9],   /* Z4 S4 over a 3-wide and a 4-wide basin */
    [138, 8, 156, 10],   /* Z6 S6 over two 4-wide basins */
    [173, 7, 192, 9],   /* Z7 S7 from the ferry quay, over a 4 and a 5 */
    [195, 8, 216, 10],   /* Z8 S8 over two 5-wide basins */
    [222, 8, 243, 10]   /* Z9 S9 over two 5-wide basins */
  ],
  heights: [
    /* S1 0-26 the quay, Z1 over a 3-wide gap c20-22 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,
    /* S2 27-53 Z2: a 3 gap c35-37, the little pier c38-40, a 3 gap c41-43 */
    192,192,192,192,192,192,192,192,null,null,null,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 up to the clock tower quay (c56-65), Z3: a 3 gap c66-68, a pier c69-73, a 3 gap c74-76 */
    192,176,160,160,160,160,160,160,160,160,160,160,null,null,null,192,192,192,192,192,null,null,null,192,192,192,192,
    /* S4 81-107 Z4: a 3 gap c89-91 (still act 1: the lint allows 3), a pier c92-93, a 4 gap c94-97 */
    192,192,192,192,192,192,192,192,null,null,null,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 the market quay: THE CUSTOMS HOUSE SIGN (c112-116), THE CONTAINERS (c119-124) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 Z6: a 4 gap c141-144, a pier c145-147, a 4 gap c148-151 */
    192,192,192,192,192,192,null,null,null,null,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 the checkpoint, up to the ferry quay (c168-176), Z7: a 4 gap c177-180, a pier c181-183, a 5 gap c184-188 */
    192,192,192,192,192,176,160,160,160,160,160,160,160,160,160,null,null,null,null,192,192,192,null,null,null,null,null,
    /* S8 189-215 Z8: a 5 gap c199-203, a pier c204-206, a 5 gap c207-211 */
    192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,null,null,null,null,null,192,192,192,192,
    /* S9 216-242 Z9: a 5 gap c227-231, a pier c232-234, a 5 gap c235-239 */
    192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,null,null,null,null,null,192,192,192,
    /* S10 243-269 reward: THE CLOCK TOWER LEDGE (spring c249, ledge c250-252 row 3), the gift row, the goal */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [112, 3, 116, 6],   /* S5 THE CUSTOMS HOUSE SIGN hanging over the quay (the hidden gift is one of its panels) */
    [119, 9, 120, 11], [121, 6, 124, 11]   /* S5 THE CONTAINERS: a step, then the big stack */
  ],
  tiles: {
    gift: [
      [6, 8],   /* S1 */
      [29, 8],   /* S2 */
      [59, 6],   /* S3 on the quay */
      [102, 8],   /* S4 */
      [114, 6, 'gold'],   /* S5 THE CUSTOMS HOUSE SIGN: the glinting panel (hidden) */
      [128, 8],   /* S5 */
      [154, 8],   /* S6 */
      [164, 8],   /* S7 */
      [190, 8],   /* S8 */
      [218, 8],   /* S9 */
      [258, 8, 'heart'], [260, 8, 'cake']   /* S10 the gift row */
    ],
    brick: [
      [5, 8], [7, 8],   /* S1 */
      [127, 8], [129, 8],   /* S5 */
      [217, 8], [219, 8],   /* S9 */
      [259, 8]   /* S10 */
    ],
    spring: [
      [249, 11]   /* S10 the spring under THE CLOCK TOWER LEDGE (skill secret) */
    ],
    shelf: [
      [122, 3], [123, 3],   /* S5 the shelf over THE CONTAINERS (visible secret) */
      [250, 3], [251, 3], [252, 3]   /* S10 THE CLOCK TOWER LEDGE (skill secret) */
    ]
  },
  /* seagulls and geese over the basins, rollerbladers, joggers and cones on the quays. Nothing waits at a lip. */
  foes: [
    [12, 8, 'seagull'],   /* S1 */
    [50, 11, 'rollerblader'],   /* S2 */
    [60, 9, 'cone'],   /* S3 on the quay */
    [90, 6, 'seagull'], [104, 11, 'mallwalker'],   /* S4 */
    [110, 11, 'rollerblader'], [131, 11, 'cone'],   /* S5 */
    [137, 6, 'goose'], [157, 11, 'mallwalker'],   /* S6 */
    [163, 11, 'cone'], [172, 9, 'cone'],   /* S7 */
    [193, 11, 'rollerblader'], [201, 6, 'seagull'], [209, 6, 'goose'],   /* S8 */
    [220, 11, 'mallwalker'], [229, 6, 'seagull'], [237, 6, 'goose'],   /* S9 */
    [246, 11, 'cone']   /* S10 */
  ],
  candles: [
    [3, 11], [9, 11], [11, 11], [14, 11], [17, 11], [21, 9], [23, 9], [25, 9],
    [28, 11], [32, 11], [35, 9], [38, 9], [39, 11], [41, 10], [44, 10], [48, 11], [51, 11], [53, 11],
    [55, 10], [57, 9], [62, 9], [64, 9], [66, 8], [69, 8], [71, 11], [72, 8], [75, 8], [78, 9], [80, 11],
    [83, 11], [85, 11], [88, 9], [91, 9], [92, 11], [94, 9], [97, 9], [99, 11], [104, 10], [106, 11],
    [109, 11], [111, 11], [114, 9], [114, 8], [118, 11], [119, 8], [121, 5], [123, 5], [123, 2], [126, 11], [130, 11], [133, 11],
    [136, 11], [139, 11], [142, 9], [145, 9], [146, 11], [148, 9], [151, 10], [153, 11], [155, 11], [159, 11], [161, 11],
    [165, 11], [167, 10], [169, 9], [171, 9], [174, 9], [177, 8], [180, 8], [182, 11], [183, 8], [186, 8],
    [189, 9], [191, 11], [195, 11], [197, 11], [199, 9], [202, 9], [205, 9], [208, 9], [211, 10], [213, 11], [215, 11],
    [216, 11], [221, 11], [223, 11], [225, 11], [227, 9], [230, 9], [233, 9], [236, 10], [239, 10], [241, 11],
    [244, 11], [249, 9], [249, 7], [250, 5], [255, 11], [258, 10], [260, 10], [263, 11], [266, 11]
  ],
  secrets: [
    { kind: 'visible', col: 122, row: 2, prize: 'heart+candles' },   /* THE CONTAINERS: climb the stack, jump up to the shelf */
    { kind: 'hidden', col: 114, row: 6, prize: 'GOLDEN CANDLE', glint240: true },   /* THE CUSTOMS HOUSE SIGN: the glinting panel */
    { kind: 'skill', col: 251, row: 2, prize: 'hat' }   /* THE CLOCK TOWER LEDGE: the spring, then steer onto the ledge */
  ],
  goldenCandle: { col: 114, row: 6 },
  checkpoint: { col: 164, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 267, row: 11 },   /* the end of the quays: down into the Metro */
  talk: [
    [2, 'KINAN', "The Old Port! There's the river. Glitchy's hockey bag went this way!", 3.4],
    [11, 'DAD', 'A zip line! Jump at the edge and grab the cable, bud. It takes you right across. Zip it and ship it!', 3.8],
    [29, 'MOM', "Press JUMP while you're hanging and you let go, sweetie. Only if you want to!", 3.6],
    [54, 'PASSER-BY', 'Bonjour! Attention, it goes fast! (Careful!)', 3],
    [109, 'CHENOA', 'Look at the clock tower out on the pier! Race you to the end, little bro!', 3.4],
    [165, 'SHAD', "Annie says her drones are heading into the Metro. She thinks the rogue code is hiding down there!", 4.4],
    [244, 'KINAN', "The Metro? Glitchy, wait for me! I'm coming!", 3]
  ]
});

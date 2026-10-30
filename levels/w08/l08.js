/* ============================================================
   LEVEL 8-8 · RACCOON ROOFTOPS
   (World 8 · Toronto · trail stop 10)
   Story bible (World 8 table): "Chase the raccoons across downtown
   roofs; the hardest regular level so far." The whole raccoon gang
   carries Glitchy's shiny parcel up onto the roofs of downtown Toronto
   and runs, roof to roof, toward the Raccoon King's castle.
   Idea: THE CHASE (the exam, nothing new): the RACCOON GANG — two or
     three raccoons on most roofs, each one grabs a candle and runs
     (stomp it or KICK it to get the candle back) — and the ROOFTOP
     GAPS between buildings of four heights, the widest of the world.
     Act 1 (0-98): roofs 3/3/3/2/3, one tile up or down at a time, one
     raccoon a roof. Act 2 (99-197): 4/4/3/4/4 with raccoon pairs, up to
     the highest roofs. Act 3 (198-296): 5/5/4/4/5 — the second 5 goes
     UP a tile (a full-run jump from the lip makes it with a body-width
     to spare), raccoon packs of three, crows and gulls over the gaps.
   Signature set-piece: THE GANG (S8-S10): three raccoons on a roof,
     candles everywhere, wide gaps either side.
   Secrets: visible = THE BILLBOARD (S4): a heart sits on a billboard
     over the gap after the first high roof; jump UP onto it from the
     roof's edge (heart + candles, 82,4) · hidden = THE WATER TOWER
     (S1): a rooftop water tank on stilts; one plank of it glints (GOLDEN
     CANDLE, 22,6; two candles point up) · skill = THE ANTENNA (S7):
     bounce off the roof spring and steer onto the antenna's platform
     high over the city (hat, 184,1).
   Gaps: act 1 3/3/3/2/3 · act 2 4/4/3/4/4 · act 3 5/5/4/4/5 (7-8, World
     7's hardest: five 5s; here four 5s plus the up-jump). Every gap
     has a candle arc; nothing waits at a lip; no block over a take-off.
     The checkpoint (c192) is right before act 3. A full-run jump off
     the two highest roofs, the billboard or the antenna lands on a roof
     (w8-levels.spec.ts checks it, from 10 frames early to 7 late).
   Raccoons (World 8, snatch): this is where the gang lives (19 here).
   Look: the Rooftops at Dusk (theme 107, World 8's own look): the
     skyline and the CN Tower against the sunset, tower cranes (downtown
     Toronto is all cranes), brick rooftops with water towers and vents
     just behind, and Casa Loma far off on its hill now and then.
   ENGINE REQUESTS: rooftop skins (tar, vents, brick parapets) · a
     water-tower skin for the tank · a lit billboard skin · the Raccoon
     King's silhouette on the castle tower.
   ============================================================ */
KinanLevels.register({
  id: '8-8', world: 8, slot: 10, kind: 'level',
  name: 'RACCOON ROOFTOPS',
  theme: 107,   /* the Rooftops at Dusk: the skyline at sunset, cranes, water towers, Casa Loma far off */
  cols: 297,
  snatch: true,   /* World 8: raccoons grab a candle and run (the whole gang is here) */
  heights: [
    /* S1 0-26 the first roof (160), a 3-wide gap c14-16, THE WATER TOWER over the second roof (c21-24) */
    160,160,160,160,160,160,160,160,160,160,160,160,160,160,null,null,null,160,160,160,160,160,160,160,160,160,160,
    /* S2 27-53 a 3-wide gap c31-33 up a tile (144), a 3-wide gap c48-50 */
    160,160,160,160,null,null,null,144,144,144,144,144,144,144,144,144,144,144,144,144,144,null,null,null,144,144,144,
    /* S3 54-80 a 2-wide gap c65-66 up a tile (128) */
    144,144,144,144,144,144,144,144,144,144,144,null,null,128,128,128,128,128,128,128,128,128,128,128,128,128,128,
    /* S4 81-107 THE BILLBOARD (c80-84 row 5) over a 3-wide gap c83-85 down a tile, a 4-wide gap c99-102 */
    128,128,null,null,null,144,144,144,144,144,144,144,144,144,144,144,144,144,null,null,null,null,144,144,144,144,144,
    /* S5 108-134 a 4-wide gap c117-120 up a tile (128) */
    144,144,144,144,144,144,144,144,144,null,null,null,null,128,128,128,128,128,128,128,128,128,128,128,128,128,128,
    /* S6 135-161 a 3-wide gap c136-138 up to the highest roof (112), a 4-wide gap c153-156 down */
    128,null,null,null,112,112,112,112,112,112,112,112,112,112,112,112,112,112,null,null,null,null,128,128,128,128,128,
    /* S7 162-188 a 4-wide gap c172-175 down, THE ANTENNA (spring c182, platform c183-185 row 2), the checkpoint roof */
    128,128,128,128,128,128,128,128,128,128,null,null,null,null,144,144,144,144,144,144,144,144,144,144,144,144,144,
    /* S8 189-215 a 5-wide gap c200-204, THE GANG's roof (c205-214), a 5-wide gap c215-219 ... */
    144,144,144,144,144,144,144,144,144,144,144,null,null,null,null,null,144,144,144,144,144,144,144,144,144,144,null,
    /* S9 216-242 ... up a tile (128), a 4-wide gap c233-236 up to the highest roof again (112) */
    null,null,null,null,128,128,128,128,128,128,128,128,128,128,128,128,128,null,null,null,null,112,112,112,112,112,112,
    /* S10 243-269 a 4-wide gap c249-252 down (128), a 5-wide gap c267-271 down */
    112,112,112,112,112,112,null,null,null,null,128,128,128,128,128,128,128,128,128,128,128,128,128,128,null,null,null,
    /* S11 270-296 the last roof (144): the gift row, Casa Loma on its hill ahead */
    null,null,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144
  ],
  solid: [
    [21, 4, 24, 6]   /* S1 THE WATER TOWER's tank on stilts (walk under it; the hidden gift is one of its planks) */
  ],
  tiles: {
    gift: [
      [5, 6],   /* S1 */
      [22, 6, 'gold'],   /* S1 THE WATER TOWER: the glinting plank (hidden) */
      [38, 5],   /* S2 */
      [58, 5],   /* S3 */
      [94, 5],   /* S4 */
      [127, 4],   /* S5 */
      [146, 3],   /* S6 */
      [165, 4],   /* S7 */
      [208, 5],   /* S8 */
      [226, 4],   /* S9 */
      [258, 4],   /* S10 */
      [282, 5, 'heart'], [284, 5], [286, 5, 'cake']   /* S11 the gift row */
    ],
    brick: [
      [4, 6], [6, 6],   /* S1 */
      [283, 5], [285, 5]   /* S11 */
    ],
    spring: [
      [182, 8]   /* S7 the roof spring under THE ANTENNA (skill secret) */
    ],
    shelf: [
      [80, 5], [81, 5], [82, 5], [83, 5], [84, 5],   /* S4 THE BILLBOARD (visible secret) */
      [183, 2], [184, 2], [185, 2]   /* S7 THE ANTENNA's platform (skill secret) */
    ]
  },
  /* THE GANG: raccoons on every roof (one a roof in act 1, pairs in act 2, packs of three in act 3), crows and gulls
     over the gaps. Nothing waits at a lip. */
  foes: [
    [8, 9, 'raccoon'],   /* S1 */
    [40, 8, 'raccoon'],   /* S2 */
    [72, 7, 'raccoon'],   /* S3 */
    [92, 8, 'raccoon'],   /* S4 */
    [110, 8, 'raccoon'], [118, 4, 'crow'], [126, 7, 'raccoon'],   /* S5 */
    [144, 6, 'raccoon'], [148, 6, 'raccoon'], [154, 3, 'seagull'],   /* S6 */
    [164, 7, 'raccoon'], [174, 4, 'crow'], [187, 8, 'raccoon'],   /* S7 */
    [195, 8, 'raccoon'], [202, 4, 'seagull'], [208, 8, 'raccoon'], [211, 8, 'raccoon'],   /* S8 THE GANG */
    [224, 7, 'raccoon'], [228, 7, 'raccoon'], [235, 3, 'crow'], [240, 6, 'raccoon'],   /* S9 */
    [244, 6, 'raccoon'], [250, 3, 'seagull'], [258, 7, 'raccoon'], [262, 7, 'raccoon'],   /* S10 */
    [278, 8, 'raccoon'], [284, 8, 'raccoon']   /* S11 */
  ],
  candles: [
    [3, 9], [5, 8], [8, 8], [10, 9], [12, 9], [13, 8], [14, 7], [15, 6], [16, 7], [17, 8], [19, 9], [22, 8], [22, 7], [25, 9],
    [28, 9], [30, 8], [31, 7], [32, 6], [33, 7], [34, 7], [36, 8], [38, 7], [41, 8], [43, 8], [45, 8], [47, 7], [48, 6], [49, 6], [50, 7], [51, 7], [53, 8],
    [55, 8], [57, 8], [58, 7], [60, 8], [62, 8], [64, 7], [65, 6], [66, 6], [67, 6], [69, 7], [71, 7], [73, 7], [75, 7], [77, 7], [79, 7],
    [81, 7], [82, 6], [83, 6], [84, 7], [86, 7], [88, 8], [90, 8], [94, 7], [96, 8], [98, 7], [99, 6], [100, 5], [101, 5], [102, 6], [103, 7], [105, 8], [107, 8],
    [109, 8], [112, 8], [114, 8], [116, 7], [117, 6], [118, 5], [119, 5], [120, 6], [121, 6], [123, 7], [125, 7], [127, 6], [129, 7], [131, 7], [133, 7],
    [135, 6], [136, 5], [137, 5], [138, 5], [139, 5], [141, 6], [143, 6], [146, 5], [150, 6], [152, 5], [153, 4], [154, 4], [155, 4], [156, 5], [157, 6], [159, 7], [161, 7],
    [163, 7], [166, 7], [168, 7], [170, 7], [171, 6], [172, 5], [173, 5], [174, 5], [175, 6], [176, 7], [178, 8], [180, 8], [182, 6], [182, 4], [184, 3], [188, 8],
    [190, 8], [192, 8], [194, 8], [197, 8], [199, 7], [200, 6], [201, 5], [202, 4], [203, 4], [204, 5], [205, 6], [206, 7], [208, 7], [210, 8], [212, 8], [214, 7],
    [215, 6], [216, 5], [217, 4], [218, 4], [219, 5], [220, 6], [222, 7], [226, 6], [229, 7], [231, 7], [232, 6], [233, 5], [234, 4], [235, 4], [236, 5], [237, 5], [239, 6], [241, 6],
    [243, 6], [245, 6], [247, 6], [248, 5], [249, 4], [250, 4], [251, 4], [252, 5], [253, 6], [255, 7], [258, 6], [260, 7], [264, 7], [266, 6], [267, 5], [268, 4], [269, 4],
    [270, 4], [271, 5], [272, 6], [273, 7], [275, 8], [277, 8], [280, 8], [282, 7], [284, 7], [286, 7], [288, 8], [290, 8]
  ],
  secrets: [
    { kind: 'visible', col: 82, row: 4, prize: 'heart+candles' },   /* THE BILLBOARD: from the roof's edge, jump UP onto it over the gap */
    { kind: 'hidden', col: 22, row: 6, prize: 'GOLDEN CANDLE', glint240: true },   /* THE WATER TOWER: the glinting plank */
    { kind: 'skill', col: 184, row: 1, prize: 'hat' }   /* THE ANTENNA: the roof spring, then steer onto the antenna's platform */
  ],
  goldenCandle: { col: 22, row: 6 },
  checkpoint: { col: 192, row: 8 },
  spawn: { col: 2, row: 9 },
  goal: { col: 292, row: 8 },   /* the edge of downtown: Casa Loma ahead */
  talk: [
    [2, 'SHAD', 'The raccoons took Glitchy up onto the roofs of downtown. A whole GANG of them!', 3.8],
    [18, 'KINAN', 'Raccoons grab candles and run. Stomp them or KICK them to get the candles back!', 4],
    [70, 'CHENOA', 'Look at that billboard, little bro! There is a heart on top of it.', 3.2],
    [140, 'DAD', 'Big jumps up here, bud. Run, and jump right at the edge. Edge-ucation matters.', 3],
    [193, 'MOM', 'Last stretch, sweetie! You can do it. We are right behind you.', 3.2],
    [274, 'KINAN', "They are running to a CASTLE? There's a castle in Toronto?!", 3.2],
    [285, 'SHAD', 'Casa Loma. The Raccoon King lives there, and Glitchy is in his pile of shiny things!', 4.2]
  ]
});

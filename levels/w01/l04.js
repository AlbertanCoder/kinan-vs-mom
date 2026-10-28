/* ============================================================
   LEVEL 1-4 · BRICK CITY (BASEMENT)  (World 1 · Saskatoon home · trail stop 4)
   Story bible: "Quick-build brick bridges." Kinan's toy-brick city in
   the basement has come alive; its bridges span holes in the floor.
   Idea (ONE): BRICK BRIDGES. Toy bricks hold you up like floor: walk a
   full bridge, hop the missing bricks, climb brick stairs to a raised
   bridge, and in act 3 run a bridge with two 3-wide holes and a robot
   on the landing. After every hole there are 7+ tiles of landing: a
   full running jump (~6.4 tiles, automatic on touch) never lands in
   the next hole.
   Acts (thirds): 0-53 teach (a full bridge, a bridge with a 2-brick
   hole, the brick pyramid, the raised bridge) · 54-107 twist (THE BIG
   BRIDGE over four pits, the brick stairs and the high crane ledge) ·
   108-161 test (the gauntlet bridge, then the trampoline reward and
   the basement stairs).
   Signature toy: the big brick bridge with holes to hop.
   Secrets: visible = the crane ledge over the raised bridge (heart) ·
   hidden = the room under the first raised bridge: drop through the
   one missing brick or walk in from the right, bump the far end
   (GOLDEN CANDLE) · skill = RUN off the trampoline onto the high brick
   ledge (cake).
   Not wired yet (ENGINE REQUESTS): "quick-build" bridges that snap
   together as Kinan arrives; bricks are solid (no breaking); a
   brand-neutral alias for the toy-brick foe, so this file uses
   robots, balls, teddies and planes.
   ============================================================ */
KinanLevels.register({
  id: '1-4', world: 1, slot: 4, kind: 'level',
  name: 'BRICK CITY (BASEMENT)',
  theme: 3,                 /* the legacy toy-brick city look */
  toyBricks: true,          /* engine pass A: bricks break on a head bump everywhere else; here they are the floor, stairs and bridges, so they stay put */
  cols: 162,
  heights: [
    /* S1 0-26 a full brick bridge (c8-10) · a bridge with a 2-brick hole (c15-17) · the brick pyramid */
    192,192,192,192,192,192,192,192, null,null,null, 192,192,192,192, null,null,null, 192,192,192,192,192,192,192,192,192,
    /* S2 27-53 the first raised bridge (bricks on a flat floor), a room under it */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 THE BIG BRIDGE over four pits split by 1-tile pillars (c61, 66, 71): two holes, 2 and 3
       wide, each followed by 7+ tiles of bridge (a full running jump is ~6.4 tiles — never land in the next hole) */
    192,192,192, null,null,null,null, 192, null,null,null,null, 192, null,null,null,null, 192, null,null,null, 192,192,192,192,192,192,
    /* S4 81-107 brick stairs up to the second raised bridge (c91-103) and the crane ledge */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 the gauntlet bridge: holes c114-116 and c124-126 (3 wide), a 7-tile landing between (pillars c118, c123) */
    192,192,192,192,192,192, null,null,null,null, 192, null,null,null,null, 192, null,null,null, 192,192,192,192,192,192,192,192,
    /* S6 135-161 the trampoline, the high brick ledge, the basement stairs */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  tiles: {
    gift: [[22, 6, 'popper'], [34, 9, 'gold'], [47, 9, 'candle'], [63, 9, 'candle'], [97, 2, 'heart'], [147, 2, 'cake']],
    brick: [
      [8, 12], [9, 12], [10, 12],                                         /* S1: the full bridge */
      [15, 12],                                                           /* S1: the bridge with a hole (c16-17) */
      [20, 11], [21, 10], [21, 11], [22, 9], [22, 10], [22, 11], [23, 10], [23, 11], [24, 11],   /* the brick pyramid */
      [31, 11], [32, 10], [32, 11], [33, 9], [33, 10], [33, 11],          /* S2: stairs up */
      [35, 9], [36, 9], [37, 9], [39, 9], [40, 9], [41, 9],               /* S2: the raised bridge (the gift at c34, the gap at c38) */
      [46, 9], [48, 9],
      [57, 12], [58, 12], [62, 12], [63, 12], [64, 12], [65, 12], [67, 12], [72, 12], [73, 12], [74, 12],   /* THE BIG BRIDGE (holes c59-60, c68-70) */
      [88, 11], [89, 10], [89, 11], [90, 9], [90, 10], [90, 11],          /* S4: stairs up */
      [91, 9], [92, 9], [93, 9], [94, 9], [95, 9], [96, 9], [97, 9], [98, 9], [99, 9], [100, 9], [101, 9], [102, 9], [103, 9],   /* the second raised bridge */
      [93, 7], [94, 7], [96, 5], [97, 5], [98, 5],                         /* the crane: a 2-brick step and the high ledge */
      [117, 12], [119, 12], [120, 12], [121, 12], [122, 12],              /* the gauntlet bridge's landing (with pillars c118, c123) */
      [146, 5], [147, 5], [148, 5], [149, 5],                              /* the high brick ledge (4 wide: a running landing slides) */
      [151, 11], [152, 10], [152, 11], [153, 11]                          /* a little brick hill before the stairs */
    ],
    spring: [[139, 12]]                   /* the trampoline, flush with the floor */
  },
  foes: [[12, 11, 'robot'], [36, 8, 'ball'], [64, 11, 'robot'], [69, 4, 'plane'],
         [85, 11, 'ball'], [100, 8, 'teddy'], [120, 11, 'robot'], [125, 4, 'plane'], [131, 11, 'ball'], [156, 11, 'teddy']],
  candles: [[3, 11], [4, 11], [8, 11], [9, 11], [10, 11], [16, 10], [17, 10], [19, 10], [20, 9], [24, 9], [25, 10],
            [30, 10], [31, 9], [35, 8], [39, 8], [40, 8], [41, 8], [36, 11], [37, 11], [39, 11], [40, 11],
            [44, 11], [45, 11], [49, 11], [50, 11],
            [58, 11], [59, 10], [60, 10], [63, 11], [68, 9], [69, 8], [70, 9], [73, 11], [77, 11], [78, 11],
            [87, 10], [88, 9], [92, 8], [93, 8], [95, 6], [96, 4], [98, 4], [100, 11], [101, 11], [102, 11],
            [114, 9], [115, 8], [116, 9], [119, 11], [121, 11], [124, 9], [125, 8], [126, 9], [129, 11], [130, 11],
            [139, 7], [139, 5], [142, 4], [143, 4], [146, 4], [148, 4], [149, 4], [152, 9], [157, 11], [158, 11]],
  secrets: [
    { kind: 'visible', col: 97, row: 2, prize: 'heart' },           /* Secret-1: the crane ledge over the raised bridge */
    { kind: 'hidden', col: 34, row: 9, prize: 'GOLDEN CANDLE' },    /* Secret-2: the room under the first raised bridge, far end */
    { kind: 'skill', col: 147, row: 2, prize: 'cake' }              /* Secret-3: RUN off the trampoline onto the high ledge */
  ],
  goldenCandle: { col: 34, row: 9 },
  checkpoint: { col: 106, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 158, row: 11 }             /* the basement stairs */
});

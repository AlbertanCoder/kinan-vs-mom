/* ============================================================
   LEVEL 8-3 · NATHAN PHILLIPS SQUARE
   (World 8 · Toronto · trail stop 3)
   Story bible (World 8 table): "Climb the big TORONTO sign; skating
   rink." Up the subway stairs and out into the square in front of
   City Hall (the two curved towers with the round council chamber
   between them). The raccoon with Glitchy's parcel scampers across
   the giant TORONTO letters, over the skating rink and up onto City
   Hall's podium.
   Idea (ONE): THE ICE. The rink is slippery: slow to get going, slow
     to stop (World 3's ice, now a level-file twist). Act 1 teaches it
     (a little patch of ice on the plaza, then the rink with no gaps
     under the first Freedom Arch); act 2 twists it (holes in the ice
     under the arches, with long icy landings so a slide never ends in
     the water); act 3 tests it (the back rink: 4 and 5-wide gaps with
     SHORT icy landings — keep running, don't let go).
   The giant letters: THE TORONTO SIGN (S2-S3) is seven solid letters,
     three tiles tall, a tile apart: climb the T and hop along the
     tops (fall between two and it is only a little well you jump out
     of). Each letter is painted lit up (the 'letter:X' skin).
   Acts (thirds): 0-89 teach (the plaza ice, THE TORONTO SIGN, THE
     MAPLE LEAF LEDGE, onto the rink under the first arch) · 90-179
     twist (the thin ice 3 under the second arch, 4 under the third,
     the rink exit and checkpoint, up onto City Hall's podium and THE
     COUNCIL CHAMBER) · 180-269 test (down onto the back rink 4/5,
     THE ARCH TOP and 5, down the steps to the reward).
   Signature set-piece: THE TORONTO SIGN — run up the letters.
   Secrets: visible = THE MAPLE LEAF LEDGE (S3): a ledge high over the
     end of the sign; from the top of the last O jump UP onto it (heart
     + candles, 59,5) · hidden = THE COUNCIL CHAMBER (S7): the round
     chamber hangs over the podium; one panel of it glints (GOLDEN
     CANDLE, 174,4; two candles under it point up) · skill = THE ARCH
     TOP (S9): bounce off the spring on the long landing past the last
     hole and steer onto the very top of an arch (hat, 233,1). The
     spring has 13+ tiles of floor after it (a bounce carries ~11).
   Gaps: act 1 none (the wells between the letters are a tile deep in
     the plaza, not pits) · act 2 3/4 · act 3 4/5/5. Every gap has a
     candle arc; nothing waits at a lip; in act 2 every icy landing is
     11+ tiles long (a slide from a full run stops in about 8). A
     full-run jump off the letters, the arches, the podium or the arch
     top lands on floor (w8-levels.spec.ts checks it).
   Raccoons (World 8, snatch): a raccoon grabs a candle and runs.
   Look: Nathan Phillips Square (theme 102, World 8's own look): City
     Hall's two curved towers and the round council chamber, the old
     city hall's clock tower, the arches, the big TORONTO letters with
     their lights changing colour, the skyline behind.
   ENGINE REQUESTS: a concrete-arch skin for the Freedom Arches'
     shelves · skates on Kinan on the ice (looks only).
   ============================================================ */
KinanLevels.register({
  id: '8-3', world: 8, slot: 3, kind: 'level',
  name: 'NATHAN PHILLIPS SQUARE',
  theme: 102,   /* Nathan Phillips Square: City Hall's curved towers, the TORONTO letters */
  cols: 270,
  snatch: true,   /* World 8: raccoons grab a candle and run */
  ice: [[14, 22], [63, 140], [189, 242]],   /* THE ICE: the plaza patch (teach), the rink (twist), the back rink (test) */
  /* THE TORONTO SIGN: seven giant letters (solid, three tiles tall); the skins paint them lit up (looks only) */
  skins: [['letter:T', 30, 9, 32, 11], ['letter:O', 34, 9, 36, 11], ['letter:R', 38, 9, 40, 11], ['letter:O', 42, 9, 44, 11],
    ['letter:N', 46, 9, 48, 11], ['letter:T', 50, 9, 52, 11], ['letter:O', 54, 9, 56, 11]],
  heights: [
    /* S1 0-26 the plaza in front of City Hall: a patch of ice (c14-22) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 THE TORONTO SIGN: T O R O N T (c30-52), a tile apart */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 the last O (c54-56), THE MAPLE LEAF LEDGE (c58-60 row 6), onto the rink (ice from c63) under the first arch */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 the thin ice: a 3-wide hole c94-96 under the second arch (c92-98 row 8) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 a 4-wide hole c114-117 under the third arch (c112-119 row 7), a long icy landing */
    192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 off the ice (c140), the checkpoint */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 up onto City Hall's podium (c162-169), THE COUNCIL CHAMBER over it (c172-177), down to the back rink (c180-181) */
    184,176,168,160,152,144,136,128,128,128,128,128,128,128,128,128,128,128,136,144,144,144,144,144,144,144,144,
    /* S8 189-215 the back rink (ice): a 4-wide hole c193-196, a 5-wide hole c206-210 */
    144,144,144,144,null,null,null,null,144,144,144,144,144,144,144,144,144,null,null,null,null,null,144,144,144,144,144,
    /* S9 216-242 a 5-wide hole c222-226, THE ARCH TOP on the long landing (spring c231, shelf c232-234 row 2) */
    144,144,144,144,144,144,null,null,null,null,null,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,
    /* S10 243-269 reward: down the steps (c247-252) to the plaza, the gift row, the way to the tower */
    144,144,144,144,152,160,168,176,184,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [30, 9, 32, 11], [34, 9, 36, 11], [38, 9, 40, 11], [42, 9, 44, 11], [46, 9, 48, 11], [50, 9, 52, 11], [54, 9, 56, 11],   /* S2-S3 THE TORONTO SIGN */
    [172, 3, 177, 4]   /* S7 THE COUNCIL CHAMBER, hanging over the podium (the hidden gift is one of its panels) */
  ],
  tiles: {
    gift: [
      [5, 8],   /* S1 */
      [39, 5],   /* S2 over the R */
      [86, 8],   /* S4 */
      [129, 8],   /* S5 */
      [148, 8],   /* S6 */
      [174, 4, 'gold'],   /* S7 THE COUNCIL CHAMBER: the glinting panel (hidden) */
      [258, 8, 'heart'], [260, 8], [262, 8, 'cake']   /* S10 the gift row */
    ],
    brick: [
      [4, 8], [6, 8],   /* S1 */
      [128, 8], [130, 8],   /* S5 */
      [259, 8], [261, 8]   /* S10 */
    ],
    spring: [
      [231, 8]   /* S9 the spring on the long landing past the 5-wide hole (skill secret; 13+ tiles of floor after it) */
    ],
    shelf: [
      [58, 6], [59, 6], [60, 6],   /* S3 THE MAPLE LEAF LEDGE (visible secret) */
      [68, 8], [69, 8], [70, 8], [71, 8], [72, 8], [73, 8], [74, 8],   /* S3 the first Freedom Arch */
      [92, 8], [93, 8], [94, 8], [95, 8], [96, 8], [97, 8], [98, 8],   /* S4 the second arch, over the thin ice */
      [112, 7], [113, 7], [114, 7], [115, 7], [116, 7], [117, 7], [118, 7], [119, 7],   /* S5 the third arch */
      [232, 2], [233, 2], [234, 2]   /* S9 THE ARCH TOP (skill secret) */
    ]
  },
  /* geese over the square, the ice machine and skaters on the rink, a hot-dog cart on the podium, raccoons near the end.
     Nothing waits at a lip. */
  foes: [
    [19, 7, 'goose'],   /* S1 */
    [77, 11, 'zamboni'],   /* S3 */
    [87, 7, 'goose'], [102, 11, 'zamboni'],   /* S4 */
    [124, 11, 'rollerblader'], [132, 11, 'zamboni'],   /* S5 */
    [145, 11, 'rollerblader'], [156, 7, 'goose'],   /* S6 */
    [175, 7, 'cart'],   /* S7 on the podium */
    [200, 8, 'rollerblader'], [213, 6, 'goose'],   /* S8 */
    [224, 4, 'goose'], [233, 8, 'zamboni'], [238, 8, 'raccoon'],   /* S9 */
    [256, 11, 'raccoon']   /* S10 */
  ],
  candles: [
    [3, 10], [8, 11], [10, 11], [12, 11], [14, 11], [16, 11], [18, 11], [20, 11], [22, 11], [25, 11],
    [27, 11], [29, 10], [31, 8], [33, 7], [35, 8], [37, 7], [39, 8], [41, 7], [43, 8], [45, 7], [47, 8], [49, 7], [51, 8], [53, 7],
    [55, 8], [57, 7], [62, 11], [64, 11], [66, 11], [69, 7], [71, 7], [73, 7], [76, 10], [78, 11], [80, 11],
    [82, 11], [84, 11], [86, 10], [88, 11], [90, 11], [92, 10], [93, 9], [94, 7], [95, 7], [96, 7], [98, 10], [100, 11], [103, 11], [105, 11], [107, 11],
    [108, 11], [110, 11], [112, 10], [113, 9], [114, 8], [115, 8], [116, 8], [117, 8], [118, 9], [119, 10], [121, 11], [123, 11], [126, 11], [128, 10], [130, 10], [133, 11],
    [136, 11], [138, 11], [140, 11], [143, 11], [146, 11], [148, 10], [151, 11], [154, 11], [158, 11], [160, 11],
    [162, 10], [164, 9], [166, 8], [168, 7], [170, 7], [172, 7], [174, 6], [174, 5], [176, 7], [178, 7], [180, 7], [182, 8], [184, 8], [186, 8], [188, 8],
    [190, 8], [192, 7], [193, 6], [194, 5], [195, 5], [196, 6], [197, 7], [199, 8], [201, 8], [203, 8], [205, 7], [206, 6], [207, 5], [208, 4], [209, 5], [210, 6], [211, 7], [213, 8], [215, 8],
    [217, 8], [219, 8], [221, 7], [222, 6], [223, 5], [224, 5], [225, 6], [226, 7], [227, 8], [229, 8], [231, 6], [231, 4], [234, 8], [236, 8], [240, 8], [242, 8],
    [244, 8], [247, 8], [249, 9], [251, 10], [253, 11], [255, 11], [258, 10], [260, 10], [262, 10], [264, 11]
  ],
  secrets: [
    { kind: 'visible', col: 59, row: 5, prize: 'heart+candles' },   /* THE MAPLE LEAF LEDGE: from the top of the last O, jump UP onto it */
    { kind: 'hidden', col: 174, row: 4, prize: 'GOLDEN CANDLE', glint240: true },   /* THE COUNCIL CHAMBER: the glinting panel */
    { kind: 'skill', col: 233, row: 1, prize: 'hat' }   /* THE ARCH TOP: the spring, then steer onto the top of the arch */
  ],
  goldenCandle: { col: 174, row: 4 },
  checkpoint: { col: 150, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 266, row: 11 },   /* the street to the CN Tower */
  talk: [
    [2, 'DAD', 'Nathan Phillips Square! That is City Hall: two curved towers. And look, the big TORONTO sign!', 4.4],
    [15, 'MOM', 'Careful, sweetie, that is ice. Slow to start, slow to stop.', 3],
    [28, 'KINAN', "I'm climbing the sign. Every. Single. Letter.", 3],
    [62, 'CHENOA', 'The skating rink! Keep running on the ice, little bro, and you will be fine.', 3.8],
    [150, 'MOM', 'Hot chocolate after this. And dry socks.', 2.6],
    [168, 'SHAD', 'The raccoon ran up onto City Hall! I can see the shiny parcel up there.', 3.8],
    [190, 'KINAN', 'More ice! Keep running, keep running, keep running...', 3],
    [254, 'SHAD', 'It went toward the CN Tower! How does a raccoon even get in there?', 3.6]
  ]
});

/* ============================================================
   LEVEL 7-2 · THE SEAWALL
   (World 7 · Vancouver · trail stop 2)
   Story bible (World 7 table): "Run the seawall beside the waves,
   puddle timing." The family parks at English Bay and Kinan sees the
   Pacific Ocean for the very first time. The stone seawall runs all
   the way round Stanley Park beside the water: beaches, tide pools,
   rocks out in the sea, Siwash Rock with its one tree, and the
   lighthouse at Brockton Point. Glitchy ran this way, splashing.
   Idea (ONE): STEPPING STONES AND PUDDLE FROGS. Where the seawall
     breaks, you hop rock to rock across the water, and a puddle frog
     sits on a rock and hops in its puddle: wait for the hop, then go.
     Act 1 teaches it (a storm drain, a tide pool, THE STEPPING STONES
     3/3/3 with one frog, the beach); act 2 twists
     it (rocks at different heights 4/3/4, the bend, the low-tide
     sandbar 4/4, SIWASH ROCK); act 3 tests it (Prospect Point 5/5/4
     with frogs on both rocks, Brockton Point 5, the lighthouse).
   Acts (thirds): 0-98 teach (English Bay 2, Second Beach 3, THE
     STEPPING STONES 3/3/3, Third Beach and THE ROCK OVERHANG) · 99-197
     twist (the checkpoint, the rocky point 4/3/4, the bend 3, the
     sandbar 4/4, up to SIWASH ROCK 3) · 198-296 test (off the rock 3,
     Prospect Point 5/5/4, Brockton Point 5, THE LIGHTHOUSE, the totem
     poles).
   Signature set-piece: PROSPECT POINT (S9): two 5-wide stretches of sea
     and a 4, three small rocks, and a puddle frog hopping on two of
     them.
   Secrets: visible = SIWASH ROCK (S8): the path hops over the famous
     rock; stop on top and jump up into its tree for the heart (heart
     + candles, 199,5) · hidden = THE ROCK OVERHANG (S4): at Third Beach
     a rock ledge hangs over the sand and one stone in it glints; jump
     under it (GOLDEN CANDLE, 92,7) · skill = THE LIGHTHOUSE (S10):
     bounce off the springboard and steer back onto the lamp room at
     the top of the Brockton Point lighthouse (hat, 262,3).
   Gaps: act 1 2/3/3/3/3 · act 2 4/3/4/3/4/4/3 · act 3 3, 5/5/4, 5.
     Every gap has a candle arc; nothing waits at a gap's lip (a frog
     sits in the MIDDLE of its rock).
   Look: borrows the Seawall (theme 42): the ocean, the mountains across
     the water, the Lions Gate far off, the seawall railing, rain.
   TWIST (wired 2026-10-28): the World 5 seawall WAVES with puddle
     timing: the water bubbles, then a splash knocks Kinan back (see
     waves below), on top of the puddle frogs.
   ENGINE REQUESTS (still open): a wet-rock skin for the stepping stones,
     a sand skin for the beaches · Siwash Rock's tree and the
     lighthouse skins for their shelves · the totem poles by the goal.
   ============================================================ */
KinanLevels.register({
  id: '7-2', world: 7, slot: 2, kind: 'level',
  name: 'THE SEAWALL',
  theme: 42,   /* the Seawall: the ocean, the mountains across the water, the seawall railing, rain */
  cols: 297,
  /* THE WAVES (World 5's seawall waves, wired for level files 2026-10-28): every 4-5 s the water bubbles at the edge
     a few steps ahead of Kinan for almost a second, then a wave splashes over and knocks him back. A wave only comes
     where there are 6 tiles of seawall each side (never by the stepping stones, never into the water), and never in
     the reward screen. Puddle timing: watch the bubbles (and the frogs), then go. */
  waves: [[0, 269]],
  heights: [
    /* S1 0-26 English Bay: the sand, up onto the seawall (c8-9), a 2-wide storm drain c15-16 */
    192,192,192,192,192,192,192,192,184,176,176,176,176,176,176,null,null,176,176,176,176,176,176,176,176,176,176,
    /* S2 27-53 Second Beach: down the steps (c31-32), a 3-wide tide pool c37-39, back up (c45-46) */
    176,176,176,176,184,192,192,192,192,192,null,null,null,192,192,192,192,192,184,176,176,176,176,176,176,176,176,
    /* S3 54-80 THE STEPPING STONES: 3-wide water c57-59, c64-66, c71-73 between two rocks */
    176,176,176,null,null,null,176,176,176,176,null,null,null,176,176,176,176,null,null,null,176,176,176,176,176,176,176,
    /* S4 81-107 Third Beach: down onto the sand (c84-85) under THE ROCK OVERHANG, back up (c98-99) · the checkpoint */
    176,176,176,184,192,192,192,192,192,192,192,192,192,192,192,192,192,184,176,176,176,176,176,176,176,176,176,
    /* S5 108-134 the rocky point: 4-wide water c111-114 to a high rock, 3-wide c118-120, 4-wide c125-128 */
    176,176,176,null,null,null,null,160,160,160,null,null,null,176,176,176,176,null,null,null,null,176,176,176,176,176,176,
    /* S6 135-161 the bend: a 3-wide gap c143-145, the seawall climbs over a rock (a BROW, c150-161) */
    176,176,176,176,176,176,176,176,null,null,null,176,176,176,176,168,160,152,144,144,144,144,144,152,160,168,176,
    /* S7 162-188 the low-tide sandbar: down (c165-166), 4-wide water c170-173 and c179-182 */
    176,176,176,184,192,192,192,192,null,null,null,null,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,
    /* S8 189-215 up to SIWASH ROCK: 3-wide water c195-197, the rock (c198-200, two tiles up), 3-wide c201-203 */
    184,176,176,176,176,176,null,null,null,144,144,144,null,null,null,176,176,176,176,176,176,176,176,176,176,176,176,
    /* S9 216-242 PROSPECT POINT: 5-wide water c219-223 and c228-232, a 4-wide c237-240 */
    176,176,176,null,null,null,null,null,176,176,176,176,null,null,null,null,null,176,176,176,176,null,null,null,null,176,176,
    /* S10 243-269 Brockton Point: a 5-wide gap c248-252, THE LIGHTHOUSE (c261-263) and its springboard */
    176,176,176,176,176,null,null,null,null,null,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,
    /* S11 270-296 reward: the totem poles, the gift row, the way into the forest */
    176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176,176
  ],
  solid: [
    [89, 7, 95, 7]   /* S4 THE ROCK OVERHANG over the sand at Third Beach (4 tiles of air under it) */
  ],
  tiles: {
    gift: [
      [4, 8, 'popper'], [21, 7],   /* S1 */
      [34, 8], [50, 7],   /* S2 */
      [77, 7],   /* S3 */
      [92, 7, 'gold'],   /* S4 THE ROCK OVERHANG: the glinting stone (hidden) */
      [104, 7],   /* S4 */
      [131, 7, 'umbrella'],   /* S5 an umbrella for the bend and the sandbar ahead */
      [138, 7],   /* S6 */
      [176, 8],   /* S7 */
      [207, 7],   /* S8 */
      [244, 7],   /* S10 */
      [276, 7, 'heart'], [278, 7], [280, 7, 'cake']   /* S11 the gift row */
    ],
    brick: [
      [3, 8], [5, 8],   /* S1 */
      [137, 7], [139, 7],   /* S6 */
      [206, 7], [208, 7],   /* S8 */
      [277, 7], [279, 7]   /* S11 */
    ],
    spring: [
      [260, 10]   /* S10 the springboard by THE LIGHTHOUSE (skill secret) */
    ],
    shelf: [
      [199, 6],   /* S8 SIWASH ROCK's tree (visible secret) */
      [261, 7], [262, 7], [263, 7],   /* S10 THE LIGHTHOUSE: the balcony ... */
      [261, 4], [262, 4], [263, 4]   /* S10 ... and the lamp room (skill secret) */
    ]
  },
  /* puddle frogs hop on the rocks (always mid-rock), rollerbladers zoom along the seawall, seagulls glide over the water */
  foes: [
    [22, 10, 'rollerblader'],   /* S1 */
    [42, 11, 'puddlefrog'],   /* S2 */
    [61, 10, 'puddlefrog'],   /* S3 the first frog on a stepping stone */
    [93, 11, 'puddlefrog'],   /* S4 */
    [116, 9, 'puddlefrog'], [126, 5, 'seagull'],   /* S5 */
    [140, 10, 'rollerblader'], [155, 8, 'puddlefrog'],   /* S6 */
    [176, 11, 'puddlefrog'], [180, 6, 'seagull'],   /* S7 */
    [202, 5, 'seagull'], [211, 10, 'rollerblader'],   /* S8 */
    [225, 10, 'puddlefrog'], [230, 5, 'seagull'], [234, 10, 'puddlefrog'],   /* S9 */
    [245, 10, 'rollerblader'], [250, 5, 'seagull'], [256, 10, 'puddlefrog'],   /* S10 */
    [278, 10, 'rollerblader']   /* S11 */
  ],
  candles: [
    [1, 11], [2, 11], [6, 11], [7, 11], [8, 10], [9, 10], [10, 10], [11, 10], [12, 10], [13, 10], [14, 9], [15, 8], [16, 8], [17, 9],
    [18, 10], [19, 10], [23, 10], [24, 10], [25, 10], [26, 10], [27, 10], [28, 10], [29, 10], [30, 10], [31, 11], [32, 11], [33, 11], [35, 11],
    [36, 10], [37, 9], [38, 8], [39, 9], [40, 10], [41, 11], [43, 11], [44, 11], [45, 10], [46, 10], [47, 10], [48, 10], [52, 10], [53, 10],
    [54, 10], [55, 10], [56, 9], [57, 8], [58, 7], [59, 8], [60, 9], [62, 10], [63, 9], [64, 8], [65, 7], [66, 8], [67, 9], [68, 10],
    [69, 10], [70, 9], [71, 8], [72, 7], [73, 8], [74, 9], [75, 10], [76, 10], [78, 10], [79, 10], [80, 10], [81, 10], [82, 10], [83, 10],
    [84, 11], [85, 11], [86, 11], [87, 11], [88, 11], [90, 11], [91, 11], [92, 10], [92, 9], [93, 11], [94, 11], [96, 11], [97, 11], [98, 10],
    [99, 10], [100, 10], [102, 10], [103, 10], [105, 10], [106, 10], [107, 10], [108, 10], [109, 10], [110, 9], [111, 8], [112, 7], [113, 7], [114, 7],
    [115, 9], [117, 9], [118, 7], [119, 7], [120, 8], [121, 9], [122, 10], [123, 10], [124, 9], [125, 8], [126, 7], [127, 7], [128, 8], [129, 9],
    [130, 10], [132, 10], [133, 10], [134, 10], [135, 10], [136, 10], [140, 10], [141, 10], [142, 9], [143, 8], [144, 7], [145, 8], [146, 9], [147, 10],
    [148, 10], [149, 10], [150, 10], [151, 9], [152, 9], [153, 8], [154, 7], [156, 7], [157, 7], [158, 8], [159, 9], [160, 9], [161, 10], [162, 10],
    [163, 10], [164, 10], [165, 11], [166, 11], [167, 11], [168, 11], [169, 10], [170, 9], [171, 8], [172, 8], [173, 9], [174, 10], [175, 11], [177, 11],
    [178, 10], [179, 9], [180, 8], [181, 8], [182, 9], [183, 10], [184, 11], [185, 11], [186, 11], [187, 11], [188, 11], [189, 10], [190, 10], [191, 10],
    [192, 10], [193, 10], [194, 9], [195, 8], [196, 7], [197, 7], [198, 8], [200, 8], [201, 7], [202, 7], [203, 8], [204, 9], [205, 10], [209, 10],
    [210, 10], [212, 10], [213, 10], [214, 10], [215, 10], [216, 10], [217, 10], [218, 9], [219, 8], [220, 7], [221, 6], [222, 7], [223, 8], [224, 9],
    [226, 10], [227, 9], [228, 8], [229, 7], [230, 6], [231, 7], [232, 8], [233, 9], [235, 10], [236, 9], [237, 8], [238, 7], [239, 7], [240, 8],
    [241, 9], [242, 10], [243, 10], [245, 10], [246, 10], [247, 9], [248, 8], [249, 7], [250, 6], [251, 7], [252, 8], [253, 9], [254, 10], [255, 10],
    [257, 10], [258, 10], [260, 8], [260, 6], [261, 5], [264, 10], [265, 10], [266, 10], [267, 10], [268, 10], [269, 10], [270, 10], [271, 10], [272, 10],
    [273, 10], [276, 6], [278, 6], [280, 6], [283, 10], [285, 10], [287, 10], [289, 10], [291, 10]
  ],
  secrets: [
    { kind: 'visible', col: 199, row: 5, prize: 'heart+candles' },   /* SIWASH ROCK: stop on the rock, jump up into its tree */
    { kind: 'hidden', col: 92, row: 7, prize: 'GOLDEN CANDLE', glint240: true },   /* THE ROCK OVERHANG: the glinting stone over the sand */
    { kind: 'skill', col: 262, row: 3, prize: 'hat' }   /* THE LIGHTHOUSE: springboard, then steer back onto the lamp room */
  ],
  goldenCandle: { col: 92, row: 7 },
  checkpoint: { col: 101, row: 10 },
  spawn: { col: 2, row: 11 },
  goal: { col: 293, row: 10 },   /* the path into Stanley Park's forest */
  /* story bubbles as Kinan passes a column: [col, who, what they say, seconds] (subtitles only) */
  talk: [
    [2, 'KINAN', "The OCEAN! It's so big. It just keeps going and going!", 3.2],
    [12, 'DAD', "Watch the water, bud: when it bubbles, a big wave's coming. Wait, or run past quick! And don't wave back.", 4.2],
    [26, 'MOM', 'Stay on the seawall, sweetie. Where it breaks, hop rock to rock.', 3.4],
    [55, 'CHENOA', 'See the frog in the puddle? Wait till it hops, then GO!', 3.2],
    [100, 'DAD', 'Third Beach! I swam here at your age. The water was SO cold, I kept it shore-t.', 3.6],
    [190, 'SHAD', "That big rock out in the water is Siwash Rock. There's a tree growing right on top of it!", 4.2],
    [243, 'KINAN', 'See that little grey cloud out over the water? It moves every time we move.', 3.8],
    [284, 'DAD', "The totem poles at Brockton Point! Next stop: the big trees. I'm rooting for us.", 3.4]
  ]
});

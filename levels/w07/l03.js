/* ============================================================
   LEVEL 7-3 · STANLEY PARK FOREST
   (World 7 · Vancouver · trail stop 3)
   Story bible (World 7 table): "Giant cedars, banana-slug traction
   (slippery/sticky ground)." Off the seawall and into the forest: a
   whole rainforest in the middle of the city, cedar trees so tall you
   can't see the tops, ferns, fallen trees covered in moss, and banana
   slugs as long as your arm sliding across the trail.
   Idea (ONE): THE GIANT CEDARS. A cedar trunk stands right across the
     trail: climb its branches up the near side, run over the top, step
     down the branches on the far side. Fallen "nurse logs" lie across
     the trail on their roots: run over the top or duck under. Banana
     slugs crawl on everything. Act 1 teaches it (stumps, the first
     nurse log, THE FIRST CEDAR, a root ridge, the fern hollow); act 2
     twists it (the checkpoint, a nurse log and then a 4-wide ravine,
     THE BIG CEDAR with THE LONE BRANCH out over a ravine, the slug
     slopes); act 3 tests it (a nurse log into a 5-wide ravine, THE
     CANOPY JUMP from treetop to treetop, ravines 5/4).
   Acts (thirds): 0-98 teach (the trailhead 2, THE FIRST CEDAR, the
     ravine 3, the root ridge 3, the fern hollow BOWL) · 99-197 twist
     (the checkpoint, THE NURSE LOG and the 4-wide ravine, THE BIG CEDAR
     4, the slug slopes 4) · 198-296 test (the third nurse log 5, THE
     CANOPY JUMP 5, ravines 5/4, THE EAGLE'S BRANCH, Beaver Lake).
   Signature set-piece: THE CANOPY JUMP (S9): climb one cedar, then jump
     across a 5-wide ravine from its top to the top of the next one.
   Secrets: visible = THE LONE BRANCH (S6): coming down the big cedar, a
     branch sticks out over the ravine with a heart on it; jump out to
     it (heart + candles, 150,5) · hidden = THE NURSE LOG (S5): one knot
     in the underside of the fallen tree glints; duck under the log and
     jump (GOLDEN CANDLE, 118,8) · skill = THE EAGLE'S BRANCH (S10):
     bounce off the springboard and catch the branch way up in the
     canopy (hat, 265,2).
   Gaps: act 1 2/3/3 · act 2 4/4/4 · act 3 5/5/5/4. Every ravine has a
     candle arc; nothing waits at a ravine's lip. Every drop on the
     main path is 4 tiles or less (the branches step down).
   Look: borrows Stanley Park Forest (theme 43): giant cedars in the
     mist, ferns, light coming through, rain.
   TWIST (wired 2026-10-28): BANANA-SLUG TRACTION: slime trails behind
     every slug, slime pools and sticky moss patches (see slime/moss below).
   ENGINE REQUESTS (still open): cedar trunk and branch
     skins for the trunk blocks and their shelves · a mossy nurse-log
     skin for the logs · ferns.
   ============================================================ */
KinanLevels.register({
  id: '7-3', world: 7, slot: 3, kind: 'level',
  name: 'STANLEY PARK FOREST',
  theme: 43,   /* Stanley Park Forest: giant cedars in the mist, ferns, light coming through, rain */
  cols: 297,
  /* BANANA-SLUG TRACTION (wired 2026-10-28): every slug leaves a shiny slime trail (slippery for about 6 s); slime
     pools are slippery for good (you slide on when you stop); green moss is sticky (a slow walk across it).
     Teach: a slime pool and the mossy root ridge on flat ground, the mossy fern hollow · twist: you land on slime
     after the nurse-log ravine, slime on the slug slopes ends one tile before the ravine, moss before the slopes ·
     test: moss after the third nurse log's ravine, a slime landing between the last two ravines (two plain tiles
     to stop on before the next lip). */
  slugTrail: true,
  slime: [[26, 32], [130, 135], [168, 171], [251, 253]],
  moss: [[60, 63], [88, 92], [157, 163], [206, 214]],
  skins: [['cedar', 36, 4, 37, 11], ['cedar', 141, 3, 142, 11], ['cedar', 218, 4, 221, 11], ['cedar', 227, 4, 229, 11]],   /* red cedar bark on the four trunks (looks only) */
  heights: [
    /* S1 0-26 the trailhead: a stump (c8-9), a 2-wide creek c12-13, the first nurse log (c18-23) */
    192,192,192,192,192,192,192,192,192,192,192,192,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 THE FIRST CEDAR (trunk c36-37, branches up the near side), a 3-wide ravine c47-49 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,
    /* S3 54-80 the root ridge (up c58-61, down c65-68), a 3-wide ravine c71-73 */
    192,192,192,192,184,176,168,160,160,160,160,168,176,184,192,192,192,null,null,null,192,192,192,192,192,192,192,
    /* S4 81-107 the fern hollow (a BOWL, c87-94) · the checkpoint */
    192,192,192,192,192,192,200,208,208,208,208,208,208,200,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 THE NURSE LOG (c113-122, over or under), a 4-wide ravine c126-129 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,
    /* S6 135-161 THE BIG CEDAR (trunk c141-142), THE LONE BRANCH over a 4-wide ravine c148-151 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 the slug slopes: up (c166-167), a 4-wide ravine c173-176, down (c182-183) */
    192,192,192,192,184,176,176,176,176,176,176,null,null,null,null,176,176,176,176,176,184,192,192,192,192,192,192,
    /* S8 189-215 the third nurse log (c191-197), a 5-wide ravine c200-204 */
    192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,
    /* S9 216-242 THE CANOPY JUMP: cedar A (c218-221), a 5-wide ravine c222-226, cedar B (c227-229) */
    192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S10 243-269 ravines: 5-wide c246-250, 4-wide c256-259 · THE EAGLE'S BRANCH and its springboard */
    192,192,192,null,null,null,null,null,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,
    /* S11 270-296 reward: Beaver Lake, the gift row, the trail out to the bridge */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [8, 10, 9, 11],   /* S1 a mossy stump */
    [16, 10, 16, 11], [18, 8, 23, 8],   /* S1 a stump and the first nurse log on its roots (3 tiles of air under it) */
    [36, 4, 37, 11],   /* S2 THE FIRST CEDAR's trunk */
    [110, 10, 111, 11], [113, 8, 122, 8],   /* S5 a stump and THE NURSE LOG */
    [141, 3, 142, 11],   /* S6 THE BIG CEDAR's trunk */
    [189, 10, 189, 11], [191, 8, 197, 8],   /* S8 a stump and the third nurse log */
    [218, 4, 221, 11], [227, 4, 229, 11]   /* S9 THE CANOPY JUMP: cedar A (a broken top, 4 wide: the run-up) and cedar B */
  ],
  open: [[3, 13, 5, 13]],   /* SLAM SPOT (butt slam, 2026-10-29): the pocket under the cracked boards, solid floor under it */
  tiles: {
    crack: [[3, 12], [4, 12], [5, 12]],   /* SLAM SPOT: cracked floorboards over a pocket of candles (a bonus, never needed) */
    gift: [
      [4, 8, 'popper'],   /* S1 */
      [30, 8],   /* S2 */
      [56, 8], [77, 8],   /* S3 */
      [84, 8], [91, 9, 'umbrella'],   /* S4 an umbrella in the fern hollow */
      [118, 8, 'gold'],   /* S5 THE NURSE LOG: the glinting knot in its underside (hidden) */
      [132, 8],   /* S5 */
      [136, 8], [157, 8],   /* S6 */
      [164, 8], [179, 7],   /* S7 */
      [209, 8],   /* S8 */
      [238, 8],   /* S9 */
      [269, 8],   /* S10 */
      [276, 8, 'heart'], [278, 8], [280, 8, 'cake']   /* S11 the gift row */
    ],
    brick: [
      [3, 8], [5, 8],   /* S1 */
      [83, 8], [85, 8],   /* S4 */
      [208, 8], [210, 8],   /* S8 */
      [277, 8], [279, 8]   /* S11 */
    ],
    spring: [
      [262, 11]   /* S10 the springboard under THE EAGLE'S BRANCH (skill secret) */
    ],
    shelf: [
      [34, 9], [35, 9], [34, 6], [35, 6],   /* S2 THE FIRST CEDAR: branches up the near side ... */
      [38, 8], [39, 8],   /* S2 ... and one down the far side */
      [139, 9], [140, 9], [139, 6], [140, 6],   /* S6 THE BIG CEDAR: branches up ... */
      [143, 6], [144, 6], [145, 9], [146, 9],   /* S6 ... and down */
      [149, 6], [150, 6],   /* S6 THE LONE BRANCH over the ravine (visible secret) */
      [216, 9], [217, 9], [216, 6], [217, 6],   /* S9 cedar A's branches */
      [230, 6], [231, 6], [232, 9], [233, 9],   /* S9 cedar B's branches down */
      [264, 3], [265, 3]   /* S10 THE EAGLE'S BRANCH (skill secret) */
    ]
  },
  /* banana slugs crawl on the trail and the logs, raccoons and squirrels dash about, crows and umbrella bats in the canopy; nothing waits at a lip */
  foes: [
    [25, 11, 'slug'],   /* S1 */
    [43, 11, 'slug'],   /* S2 */
    [64, 9, 'slug'],   /* S3 on the root ridge */
    [91, 12, 'slug'],   /* S4 in the fern hollow */
    [116, 11, 'slug'], [119, 7, 'slug'],   /* S5 under and on THE NURSE LOG */
    [137, 11, 'raccoon'], [156, 11, 'slug'],   /* S6 */
    [170, 10, 'slug'], [179, 10, 'squirrel'], [185, 5, 'crow'],   /* S7 */
    [193, 7, 'slug'], [202, 5, 'umbrellabat'], [211, 11, 'raccoon'],   /* S8 */
    [224, 2, 'crow'], [236, 11, 'slug'], [240, 11, 'squirrel'],   /* S9 */
    [248, 6, 'umbrellabat'], [253, 11, 'slug'], [267, 11, 'slug'],   /* S10 */
    [281, 11, 'slug']   /* S11 */
  ],
  candles: [[3, 13], [4, 13], [5, 13],
    [1, 11], [2, 11], [3, 11], [6, 11], [7, 11], [8, 9], [9, 9], [10, 10], [11, 10], [12, 9], [13, 9], [14, 10], [15, 11], [16, 9],
    [18, 7], [19, 7], [20, 7], [21, 7], [22, 7], [23, 7], [19, 11], [21, 11], [26, 11], [27, 11], [28, 11], [29, 11], [31, 11], [32, 11],
    [33, 11], [34, 8], [35, 8], [34, 5], [35, 5], [36, 3], [37, 3], [38, 7], [39, 7], [40, 10], [41, 11], [42, 11], [44, 11], [45, 11],
    [46, 10], [47, 9], [48, 8], [49, 9], [50, 10], [51, 11], [52, 11], [53, 11], [54, 11], [55, 11], [57, 11], [58, 10], [59, 10], [60, 9],
    [61, 9], [62, 9], [63, 9], [65, 9], [66, 9], [67, 9], [68, 10], [69, 10], [70, 10], [71, 9], [72, 8], [73, 9], [74, 10], [75, 11],
    [76, 11], [78, 11], [79, 11], [80, 11], [81, 11], [82, 11], [86, 11], [87, 11], [88, 12], [89, 12], [90, 12], [92, 12], [93, 12], [94, 12],
    [95, 11], [96, 11], [97, 11], [98, 11], [99, 11], [100, 11], [102, 11], [103, 11], [104, 11], [105, 11], [106, 11], [107, 11], [108, 11], [109, 11],
    [110, 9], [111, 9], [113, 7], [114, 7], [115, 7], [116, 7], [117, 7], [120, 7], [121, 7], [122, 7], [113, 11], [114, 11], [115, 11], [117, 11],
    [118, 10], [119, 11], [120, 11], [121, 11], [122, 11], [123, 11], [124, 11], [125, 10], [126, 9], [127, 8], [128, 8], [129, 9], [130, 10], [131, 11],
    [133, 11], [134, 11], [135, 11], [138, 11], [139, 8], [140, 8], [139, 5], [140, 5], [141, 2], [142, 2], [143, 1], [144, 1], [145, 2], [146, 3],
    [147, 4], [148, 5], [144, 5], [145, 8], [146, 8], [147, 11], [148, 9], [149, 8], [150, 8], [151, 9], [152, 10], [153, 11], [154, 11], [155, 11],
    [158, 11], [159, 11], [160, 11], [161, 11], [162, 11], [163, 11], [165, 11], [166, 10], [167, 10], [168, 10], [169, 10], [171, 10], [172, 9], [173, 8],
    [174, 7], [175, 7], [176, 8], [177, 9], [178, 10], [180, 10], [181, 10], [182, 10], [183, 11], [184, 11], [186, 11], [187, 11], [188, 11], [189, 9],
    [191, 7], [192, 7], [194, 7], [195, 7], [196, 7], [197, 7], [190, 11], [191, 11], [192, 11], [194, 11], [195, 11], [196, 11], [197, 11], [198, 11],
    [199, 10], [200, 9], [201, 8], [202, 7], [203, 8], [204, 9], [205, 10], [206, 11], [207, 11], [211, 11], [212, 11], [213, 11], [214, 11], [215, 11],
    [216, 8], [217, 8], [216, 5], [217, 5], [218, 3], [219, 3], [220, 3], [221, 3], [222, 2], [223, 1], [224, 1], [225, 1], [226, 2],
    [227, 3], [228, 3], [229, 3], [230, 5], [231, 5], [232, 8], [233, 8], [234, 11], [235, 11], [237, 11], [239, 11], [241, 11], [242, 11], [243, 11], [244, 11],
    [245, 10], [246, 9], [247, 8], [248, 7], [249, 8], [250, 9], [251, 10], [252, 11], [254, 11], [255, 10], [256, 9], [257, 8], [258, 8], [259, 9],
    [260, 10], [261, 11], [262, 9], [262, 7], [263, 5], [263, 4], [264, 2], [266, 11], [271, 11], [272, 11], [273, 11], [274, 11], [276, 7], [278, 7],
    [280, 7], [283, 11], [285, 11], [287, 11], [289, 11], [291, 11]
  ],
  secrets: [
    { kind: 'visible', col: 150, row: 5, prize: 'heart+candles' },   /* THE LONE BRANCH: from the big cedar's branches, jump out over the ravine */
    { kind: 'hidden', col: 118, row: 8, prize: 'GOLDEN CANDLE', glint240: true },   /* THE NURSE LOG: the glinting knot under the fallen tree */
    { kind: 'skill', col: 265, row: 2, prize: 'hat' }   /* THE EAGLE'S BRANCH: springboard, then catch the branch in the canopy */
  ],
  goldenCandle: { col: 118, row: 8 },
  checkpoint: { col: 101, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 293, row: 11 },   /* the trail out of the park, toward the bridge */
  /* story bubbles as Kinan passes a column: [col, who, what they say, seconds] (subtitles only) */
  talk: [
    [2, 'CHENOA', 'Stanley Park! Some of these cedar trees are hundreds of years old.', 3.4],
    [20, 'SHAD', "See that shiny yellow? Banana-slug slime. It's slippery: you slide when you try to stop!", 4],
    [29, 'KINAN', "A tree is in the way. I'll climb it! Branch, branch, TOP!", 3.4],
    [56, 'SHAD', "Careful, bud: banana slugs. They're slow... and VERY slimy.", 3.4],
    [58, 'KINAN', 'Squishy green moss! It slows me right down.', 2.8],
    [100, 'DAD', 'A raccoon just took my sandwich! Classic bandit. He even wore the mask.', 3.4],
    [30, "DAD", "Why are trees in Stanley Park so good at parties? Because they really know how to... hee... HAHA... leave— I can't—", 4.4, "wheeze"],
    [30, "MOM", "...how to LEAF. Robin, breathe. Kinan, keep running.", 3.2, "laugh"],
    [110, 'KINAN', 'A tree fell over! Do I go over it or under it?', 2.8],
    [213, 'SHAD', 'Treetop to treetop, bud. Run and JUMP!', 2.8],
    [284, 'CHENOA', 'I can see a green bridge through the trees! Glitchy went that way.', 3.4]
  ]
});

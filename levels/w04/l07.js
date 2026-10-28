/* ============================================================
   LEVEL 4-7 · THE RIVER VALLEY AND FUNICULAR  (World 4 · Edmonton Homecoming · trail stop 8)
   Story bible (World 4 table): "Trails, stairs and the funicular down
   to the river. Secret exit at the Walterdale Bridge." Lunch is done;
   Glitchy's trail leads off the edge of downtown and down into the
   river valley: the long wooden stairs, the funicular's glass car, the
   bike trails, the creek ravines and the wide North Saskatchewan at
   the bottom. Shad knows these trails. The jackrabbits know them
   better.
   Idea (ONE): THE VALLEY WALLS. Big steep hills, both ways: run down
     the stairs (1:1) and the switchbacks (2:1), climb back up terraces
     (uphill on a 1:1 walks at half speed), and jump the creek ravines
     that cut the trail, while cyclists come flying down at you.
     Act 1 teaches it going DOWN (the stairs and the funicular, a RIDGE,
     the Mill Creek ravine BOWL); act 2 climbs (a TERRACE two steps
     high, a MESA, a BROW) with 4-wide ravines between; act 3 jumps
     5-wide ravines, one of them from the top of a hill.
   Acts (thirds): 0-80 teach (the lookout, THE STAIRS + THE FUNICULAR,
     the RIDGE, a 3-wide creek, the MILL CREEK BOWL, a 3-wide creek) ·
     81-161 twist (the TERRACE, the checkpoint, a 4-wide ravine, the
     MESA, a 4-wide ravine, the BROW) · 162-242 test (a 5-wide ravine,
     a 5-wide ravine jumped off a hilltop, THE WALTERDALE BRIDGE over the
     5-wide river channel, the lamp posts, the stairs up to Whyte Ave).
   Signature set-piece: THE STAIRS + THE FUNICULAR (S1): from the
     lookout, two ways down the valley wall at once: run down the steep
     stairs, or hop down the funicular's glass cars from car to car.
   Secrets: visible = THE BRANCH (S7): a spruce branch sticks out over
     the second 5-wide ravine; jump UP onto it instead of across, then
     jump again for the heart above it (heart + candles, 187,3) · hidden = UNDER THE WALTERDALE BRIDGE (S8): walk
     under the bridge deck on the bank and jump; one block of the deck
     glints. Bump it (GOLDEN CANDLE) and a door opens below: the SECRET
     EXIT to 4-secret, across the river to the Muttart Pyramids (the
     1-7 / 3-8 pattern). Jump up through the deck to carry on instead ·
     skill = THE LAMP POSTS (S9): three lamp heads, each two tiles
     higher than the last, two tiles wide; tap, don't run (hat, 230,4).
   Look: borrows the River Valley Trails (theme 28): the valley at
     sunset, spruce and poplars, the river behind.
   Bubble beats for ER-4 (not wired): c2 Shad: "The funicular or the
     stairs? ...Both. Okay." · c24 "JACKRABBITS. They're HUGE." · c63
     "Mill Creek! I fell in here when I was four." · c110 checkpoint,
     Shad: "Why don't rivers ever get lost? They always follow the
     current events." · c187 "A branch. Over a ravine. Great idea,
     Kinan." · c197 "The bridge is... glinting?" · c239 Shad: "Whyte
     Ave is up those stairs. Chenoa's working tonight."
   ENGINE REQUESTS: a moving platform for the funicular (an inclined
     elevator car that rides its track up and down the valley wall;
     today three glass-car shelves) · river water in the pits and the
     Walterdale's white arches drawn over the deck · a 'jackrabbit'
     skin for the bunny hopper and a 'cyclist' skin for the biker ·
     mosquito clouds at dusk · the secret exit door drawn as the
     trailhead gate · bubbles ER-4.
   ============================================================ */
KinanLevels.register({
  id: '4-7', world: 4, slot: 8, kind: 'level',
  name: 'THE RIVER VALLEY AND FUNICULAR',
  theme: 28,                /* the River Valley Trails: the valley at sunset, spruce, the river */
  cols: 243,
  heights: [
    /* S1 0-26 the lookout at the top (c0-8) · THE STAIRS down (c9-14, 1:1) beside THE FUNICULAR's three glass cars · the trail */
    96,96,96,96,96,96,96,96,96,112,128,144,160,176,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 the RIDGE (c30-41) · a 3-wide creek c45-47 */
    192,192,192,184,176,168,160,160,160,160,160,168,176,184,192,192,192,192,null,null,null,192,192,192,192,192,192,
    /* S3 54-80 THE MILL CREEK BOWL (c57-68, two tiles deep) under its footbridge · a 3-wide creek c73-75 */
    192,192,192,200,208,216,224,224,224,224,224,224,216,208,200,192,192,192,192,null,null,null,192,192,192,192,192,
    /* S4 81-107 the TERRACE: up (c84-85, 1:1) · up (c92-93, 1:1) · the long switchback down (c100-107, 2:1) */
    192,192,192,176,160,160,160,160,160,160,160,144,128,128,128,128,128,128,136,144,152,160,168,176,184,192,192,
    /* S5 108-134 checkpoint · a 4-wide ravine c119-122 · the MESA (c127-134) */
    192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,176,160,160,160,160,160,176,192,
    /* S6 135-161 a 4-wide ravine c141-144 · the BROW (c151-159) */
    192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,184,176,176,176,176,176,176,184,192,192,192,
    /* S7 162-188 a 5-wide ravine c166-170 · up the hill (c177-180) · a 5-wide ravine c184-188 jumped off the hilltop, THE BRANCH over it */
    192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,184,176,168,160,160,160,160,null,null,null,null,null,
    /* S8 189-215 the bank · THE WALTERDALE BRIDGE deck (c195-209) over the 5-wide river channel c200-204 · the far bank */
    192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,
    /* S9 216-242 reward: THE LAMP POSTS (skill), the stairs up to Whyte Ave */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [221, 9, 222, 9], [225, 7, 226, 7], [229, 5, 230, 5]   /* S9 THE LAMP POSTS' lamp heads (walk under them) */
  ],
  tiles: {
    gift: [[4, 2, 'popper'], [50, 8], [62, 5], [96, 4, 'heart'], [150, 8], [197, 9, 'gold'], [235, 8, 'heart']],
    brick: [[3, 2], [5, 2], [49, 8], [51, 8], [61, 5], [63, 5], [95, 4], [97, 4], [234, 8], [236, 8]],
    shelf: [[10, 6], [11, 6], [12, 6], [15, 8], [16, 8], [17, 8], [20, 10], [21, 10], [22, 10],   /* S1 THE FUNICULAR's three glass cars */
            [57, 9], [58, 9], [59, 9], [60, 9], [61, 9], [62, 9], [63, 9], [64, 9], [65, 9], [66, 9], [67, 9], [68, 9],   /* S3 the Mill Creek footbridge */
            [186, 7], [187, 7],           /* S7 THE BRANCH over the ravine (visible secret) */
            [195, 8], [196, 8], [197, 8], [198, 8], [199, 8], [200, 8], [201, 8], [202, 8],
            [203, 8], [204, 8], [205, 8], [206, 8], [207, 8], [208, 8], [209, 8]]   /* S8 THE WALTERDALE BRIDGE deck */
  },
  /* jackrabbits hop the trails, cyclists charge down the hills, geese guard the river, a magpie at the top;
     nothing waits at a ravine's lip */
  foes: [[24, 11, 'bunny'],
         [35, 9, 'biker'],
         [63, 13, 'bunny'],
         [88, 9, 'bunny'], [97, 7, 'biker'],
         [130, 5, 'goose'],
         [155, 10, 'biker'],
         [174, 11, 'bunny'],
         [190, 4, 'goose'],
         [233, 3, 'magpie'], [238, 11, 'bunny']],
  candles: [[3, 5], [5, 5], [6, 5], [7, 5], [10, 5], [11, 5], [12, 5], [15, 7], [16, 7], [17, 7], [20, 9], [21, 9], [22, 9], [18, 11], [19, 11], [25, 11],
            [31, 10], [32, 9], [33, 9], [34, 9], [36, 9], [37, 9], [38, 9], [39, 9],
            [44, 10], [45, 9], [46, 8], [47, 9], [48, 10], [49, 7], [51, 7],
            [58, 8], [59, 8], [60, 8], [61, 8], [63, 8], [64, 8], [65, 8], [66, 8], [67, 8], [61, 13], [62, 13], [64, 13], [65, 13],
            [72, 10], [73, 9], [74, 8], [75, 9], [76, 10], [78, 11], [79, 11],
            [86, 9], [87, 9], [89, 9], [90, 9], [94, 7], [95, 3], [97, 3], [98, 7], [99, 7], [101, 7], [103, 8], [105, 9],
            [112, 11], [113, 11], [118, 10], [119, 9], [120, 8], [121, 8], [122, 9], [123, 10], [129, 9], [130, 9], [131, 9], [132, 9],
            [137, 11], [138, 11], [140, 10], [141, 9], [142, 8], [143, 8], [144, 9], [145, 10], [150, 7], [153, 10], [154, 10], [156, 10], [157, 10], [160, 11],
            [165, 10], [166, 8], [167, 7], [168, 6], [169, 7], [170, 8], [171, 10], [173, 11], [178, 10], [180, 9], [181, 9], [182, 9], [183, 9],
            [184, 8], [185, 7], [187, 6], [188, 7], [189, 9], [190, 10],
            [192, 11], [193, 11], [195, 11], [201, 7], [202, 7], [203, 7], [204, 7], [205, 7], [206, 7],
            [200, 10], [201, 9], [202, 9], [203, 9], [204, 10], [211, 11], [212, 11],
            [219, 11], [220, 11], [222, 8], [226, 6], [234, 7], [236, 7], [237, 11], [238, 10]],
  secrets: [
    { kind: 'visible', col: 187, row: 3, prize: 'heart+candles' },                /* THE BRANCH over the ravine: land on it, then jump up */
    { kind: 'hidden', col: 197, row: 9, prize: 'GOLDEN CANDLE + the secret exit', glint240: true, exit: '4-secret' },   /* under the Walterdale Bridge */
    { kind: 'skill', col: 230, row: 4, prize: 'hat' }                             /* THE LAMP POSTS */
  ],
  goldenCandle: { col: 197, row: 9 },
  checkpoint: { col: 110, row: 11 },
  spawn: { col: 2, row: 5 },
  goal: { col: 239, row: 11 }             /* the stairs up to Whyte Ave */
});

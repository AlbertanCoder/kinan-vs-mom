/* ============================================================
   LEVEL 4-4 · THE MEGA MALL WATERPARK
   (World 4 · Edmonton Homecoming · trail stop 4)
   Story bible (World 4 table): "Slides, wave pool currents." The Mega
   Mall: a mall so big it has a whole waterpark INSIDE, with palm trees,
   in Edmonton, in the middle of winter. Shad is here in person for the
   first time (he still feels bad that his console broke), and Glitchy
   is hiding somewhere between the slides.
   Idea (ONE): DIVING BOARDS. The boards are sunk flush with the pool
     deck: step on one and it throws you nine tiles high; the trick is
     where you come down, so steer in the air.
     Act 1 teaches it where nothing can go wrong (the first tower and
     the lifeguard chair are too tall to jump, the diving board is the
     only way over; the wave pool has a float to bounce on). Act 2 twists
     it: SPRINGS OVER THE POOLS (a board at the edge of every pool, an
     island to land on), THE BIG SLIDE TOWER (one big bounce to the
     very top) and THE BIG SLIDE down, a glinting tube slide, more
     boards. Act 3 tests it: THE GIANT TIPPING BUCKET, a 5-wide pool,
     boards over pools with wet-floor signs and carts on the landings.
   Acts (90 cols each): teach 0-89 (THE FIRST TOWER and its slide, the
     kiddie pool 3, THE LIFEGUARD CHAIR, THE WAVE POOL BOWL, a pool 3) ·
     twist 90-179 (springs over pools 4/4, the checkpoint, THE BIG SLIDE
     TOWER, THE BIG SLIDE, the tube slide, pools 4/4/4) · test 180-269
     (THE GIANT TIPPING BUCKET, a pool 5, boards over pools 4/4, the
     splash-down pool party).
   Signature set-piece: THE BIG SLIDE TOWER (S5): its stairs are closed,
     so one diving board throws you to the top, and the longest slide in
     the game takes you back down (16 tiles of slope).
   Secrets: visible = the splash bucket over the wave pool: bounce on
     the pool float and steer LEFT onto it (heart + candles, 57,5) ·
     hidden = the tube slide over the walkway glints: jump under the
     glinting spot (GOLDEN CANDLE, 152,8) · skill = THE GIANT TIPPING
     BUCKET: its diving board is past it, so turn round, bounce going
     LEFT and drop into the bucket through its 2-wide top; a running
     bounce flies right over it (hat, 194,6).
   Look: the Mega Mall Waterpark look (theme 23): blue water light,
     orange bricks, the pool deck.
   Bubble beats for ER-4 (not wired): c2 Shad: "Little bro! You made
     it! ...Sorry about the console. I think I broke it." Kinan: "You
     didn't break it, it got AWESOME." · c45 a lifeguard: "TWEEET! No
     running! ...Okay, bouncing is fine." · c60 Kinan: "Palm trees? In
     EDMONTON? In WINTER?" · c109 checkpoint, Shad: "The stairs are
     closed. Use the diving board. That's how I'd do it." · c194 the
     tipping bucket: "Three... two... one... SPLASH!" · c266 Shad, with
     towels: "Point for me. Nothing beats an indoor waterpark."
     Dad's joke (World 4 joke book): "Why don't fish play basketball?
     They're scared of the net."
   ENGINE REQUESTS: wave-pool currents (the bible's "wave pool
     currents": water that pushes you left and right in waves) · water
     in pits (a splash and the lifeguard whistles you back instead of a
     plain pit) · ride-on slides (speed builds going down a slope) · a
     tipping bucket that dumps water every 30 s · diving-board and
     pool-float skins for the spring · Shad cameo with bubbles (ER-4).
   ============================================================ */
KinanLevels.register({
  id: '4-4', world: 4, slot: 4, kind: 'level',
  name: 'THE MEGA MALL WATERPARK',
  theme: 23,                /* the Mega Mall Waterpark look: blue water light, orange bricks, the pool deck */
  cols: 270,
  heights: [
    /* S1 0-26 the entrance · THE FIRST TOWER (c8-19, its stairs are closed: the diving board is the way up) · the first slide (c20-31) */
    192,192,192,192,192,192,192,192,176,160,144,128,112,96,96,96,96,96,96,96,104,112,120,128,136,144,152,
    /* S2 27-53 the end of the slide · the kiddie pool c37-39 (3) · a diving board and THE LIFEGUARD CHAIR (c47-48) */
    160,168,176,184,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 THE WAVE POOL (a BOWL, c56-71) with a pool float to bounce on · the splash bucket over it (visible secret) */
    192,192,200,208,216,224,224,224,224,224,224,224,224,224,216,208,200,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 a 3-wide pool c84-86 · act 2: SPRINGS OVER THE POOLS: pools c92-95 and c103-106 (4 wide), a diving board at each edge */
    192,192,192,null,null,null,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,null,null,null,null,192,
    /* S5 108-134 checkpoint · THE BIG SLIDE TOWER (c113-125: one big bounce to the top) · THE BIG SLIDE starts (c126) */
    192,192,192,192,192,176,160,144,128,112,96,80,64,64,64,64,64,64,72,80,88,96,104,112,120,128,136,
    /* S6 135-161 the bottom of THE BIG SLIDE · the tube slide overhead (c148-156) · a pool c158-161 (4) */
    144,152,160,168,176,184,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,
    /* S7 162-188 diving boards over pools c167-170 and c177-180 (4 wide) */
    192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,
    /* S8 189-215 act 3: THE GIANT TIPPING BUCKET (c193-196, skill secret) and its diving board · a pool c209-213 (5) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,
    /* S9 216-242 the last diving boards over pools c221-224 and c233-236 (4 wide) */
    192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,
    /* S10 243-269 reward: the splash-down pool party (a BOWL with a float) and the exit */
    192,192,192,192,200,208,208,208,208,208,208,208,208,208,200,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [8, 6, 13, 11],
    [47, 5, 48, 11],
    [113, 4, 120, 11],
    [148, 7, 156, 8],
    [193, 4, 193, 6],
    [196, 4, 196, 6],
    [193, 7, 196, 7]
  ],
  tiles: {
    gift: [[16, 2, 'candle'], [42, 8, 'candle'], [75, 8, 'popper'], [99, 8, 'candle'], [108, 8, 'heart'], [152, 8, 'gold'],
           [173, 8, 'candle'], [186, 8, 'heart'], [204, 8, 'candle'], [229, 8, 'candle'], [255, 9, 'cake']],
    brick: [[73, 8], [74, 8], [76, 8], [145, 8], [146, 8], [184, 8], [185, 8], [187, 8], [203, 8], [205, 8]],
    spring: [[7, 12], [46, 12], [60, 14], [91, 12], [102, 12], [112, 12], [166, 12], [176, 12], [198, 12], [220, 12], [232, 12], [252, 13]],   /* diving boards (and two pool floats) */
    shelf: [[56, 6], [57, 6], [58, 6]]    /* the splash bucket over the wave pool */
  },
  /* wet-floor signs hop after you, beach balls bounce, pool toys leap, cleaning carts zoom, mall walkers march */
  foes: [[17, 5, 'ball'], [34, 11, 'wetsign'], [66, 13, 'flyingfish'], [88, 11, 'wetsign'], [98, 11, 'ball'],
         [123, 3, 'ball'], [146, 11, 'wetsign'], [151, 11, 'cart'], [186, 11, 'wetsign'], [190, 11, 'wetsign'],
         [203, 11, 'flyingfish'], [207, 11, 'cart'], [218, 11, 'wetsign'], [228, 11, 'mallwalker'], [226, 11, 'ball'],
         [240, 11, 'cart'], [262, 11, 'ball']],
  candles: [[2, 11], [3, 11], [7, 8], [7, 5], [8, 2], [9, 4], [11, 4], [13, 4], [14, 5], [15, 5], [18, 5], [19, 5], [21, 6], [23, 7],
            [25, 8], [27, 9], [29, 10], [32, 11], [33, 11], [37, 9], [38, 8], [39, 9], [41, 11], [43, 11], [46, 8], [46, 5], [46, 2], [47, 2],
            [48, 2], [49, 3], [50, 5], [51, 7], [56, 5], [58, 5], [60, 11], [60, 8], [61, 5], [62, 13], [63, 13], [64, 13], [65, 13], [69, 12],
            [70, 11], [71, 10], [79, 11], [80, 11], [84, 9], [85, 8], [86, 9], [89, 11], [91, 8], [92, 5], [93, 3], [94, 3], [95, 4], [96, 6],
            [97, 8], [100, 11], [102, 8], [103, 5], [104, 3], [105, 3], [106, 4], [107, 6], [109, 11], [112, 8], [112, 5], [112, 2], [113, 1], [114, 1],
            [116, 1], [118, 1], [120, 1], [122, 1], [124, 1], [126, 2], [128, 3], [130, 4], [132, 5], [134, 6], [136, 7], [138, 8], [140, 9], [142, 10],
            [144, 11], [149, 11], [150, 11], [151, 11], [153, 11], [155, 11], [157, 10], [158, 9], [159, 8], [160, 8], [161, 9], [165, 11], [166, 8], [167, 5],
            [168, 3], [169, 3], [170, 4], [171, 6], [174, 11], [176, 8], [177, 5], [178, 3], [179, 3], [180, 4], [181, 6], [194, 5], [195, 5], [197, 3],
            [198, 8], [198, 5], [200, 11], [201, 11], [208, 10], [209, 9], [210, 8], [211, 8], [212, 8], [213, 9], [214, 10], [217, 11], [220, 8], [221, 5],
            [222, 3], [223, 3], [224, 4], [225, 6], [226, 8], [232, 8], [233, 5], [234, 3], [235, 3], [236, 4], [237, 6], [238, 8], [246, 11], [249, 12],
            [250, 12], [252, 9], [252, 6], [251, 4], [252, 3], [253, 3], [254, 4], [257, 11], [260, 11], [261, 11], [263, 11], [264, 11]],
  secrets: [
    { kind: 'visible', col: 57, row: 5, prize: 'heart+candles' },                  /* the splash bucket over the wave pool: bounce on the float, steer LEFT */
    { kind: 'hidden', col: 152, row: 8, prize: 'GOLDEN CANDLE', glint240: true },   /* the glinting spot under the tube slide */
    { kind: 'skill', col: 194, row: 6, prize: 'hat' }                               /* inside THE GIANT TIPPING BUCKET: bounce back left and drop in */
  ],
  goldenCandle: { col: 152, row: 8 },
  checkpoint: { col: 109, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 266, row: 11 }             /* the waterpark exit, where Shad is waiting with towels */
});

/* ============================================================
   FORT · THE MONTREAL TOWER (the leaning tower of the Big O stadium; 'Olympic' avoided, a protected word in Canada)  (World 9 · Montreal · trail stop 6)
   Story bible (World 9 table): "The leaning tower; one of Annie's big
   hunter drones waits at the top." Glitchy's hockey bag went out of the
   Biodome and across the Olympic Park to the stadium and its tower, the
   tallest leaning tower in the world. Kinan climbs up its slanted back,
   on the tower's lift track, to the observation deck in its head...
   where one of Annie's big hunter drones is waiting.
   Idea: THE TILTED CLIMB. The tower leans, so the whole climb is a
     slope: the stadium ramp, then THE LIFT TRACK (the tower's inclined
     lift, opt-in `escalators`): stand on it and it carries Kinan up the
     slant; between them the tower's floors stick out as THE LEANING
     LEDGES (each step up sits further right, the way the tower leans).
     From the foot of the park (the floor at row 13) to the top of the
     tower's back (row 6), then down through the hatch onto the deck.
   Route: S1 the Olympic Park 3 · S2 the stadium concourse 3, the
     stadium ramp · S3 the tower's foot 3, LIFT TRACK 1 · S4 4, THE
     LEANING LEDGES (a heart on top), the checkpoint · S5 4, LIFT TRACK
     2 · S6 THE TOWER'S BACK 4/3 (the top, row 6) · S7 the hatch: a 4
     down onto THE OBSERVATION DECK (row 9) · S8-S9 the deck, the goal.
   FLAT OPEN GROUND FOR THE BOSS (the second run): columns 171-229 are
     flat at 144 (59 tiles; 9 rows of air above the deck). Columns
     195-221 hold nothing at all: arena { col: 196, cols: 24, boss: ... }
     would put its gates at c195 and c220 and its checkpoint flag on the
     deck at c192. A heart waits just before the left gate (gift at
     c194, row 5, outside the arena) and a gift past the boss door
     (c222); the candles stop at c193 and start again at c223. The goal
     stands past it, at c226. The `arena` key below puts the hunter drone
     (index.html ARENA_KINDS 'hunter-drone') there.
   Gaps: 3/3/3 · 4/4/4/3 · 4 (down to the deck), each with a candle
     arc; nothing waits at a lip; no lift track carries Kinan into a gap
     (each ends on 8+ flat tiles). A full-run jump off the leaning
     ledges or the top of the tower's back comes down on floor
     (w9-levels.spec.ts checks it). Fort slot: exempt from the
     3-secrets lint (no secrets here; World 9's secret exit is in the
     9-6 launch tube). No pet.
   Look: the Olympic Tower (theme 115, World 9's own look): the leaning
     tower over the stadium's white shell, the Olympic Park and the city.
   ENGINE REQUESTS: a lift-cabin look for the tower's inclined lift track
     (today it draws as an escalator); the hunter-drone boss (second run).
   ============================================================ */
KinanLevels.register({
  id: '9-fort', world: 9, slot: 6, kind: 'fort',
  name: 'THE MONTREAL TOWER',
  theme: 115,   /* the Montreal Tower: the leaning tower over the stadium, the park and the city */
  cols: 230,
  /* THE LIFT TRACK (9-3's escalator, told as the tower's inclined lift): [c0, c1, speed] carries Kinan up the slant */
  escalators: [
    [67, 72, 1.2],   /* LIFT TRACK 1 (S3): the foot of the tower up to the first landing */
    [118, 121, 1.2]   /* LIFT TRACK 2 (S5): up to the top of the tower's back */
  ],
  heights: [
    /* S1 0-26 the Olympic Park (row 13): a 3 gap c12-14 */
    208,208,208,208,208,208,208,208,208,208,208,208,null,null,null,208,208,208,208,208,208,208,208,208,208,208,208,
    /* S2 27-53 the stadium concourse: a 3 gap c33-35, THE STADIUM RAMP up (c42-45) */
    208,208,208,208,208,208,null,null,null,208,208,208,208,208,208,200,192,184,176,176,176,176,176,176,176,176,176,
    /* S3 54-80 the tower's foot: a 3 gap c58-60, LIFT TRACK 1 up (c67-72), the first landing (row 8) */
    176,176,176,176,null,null,null,176,176,176,176,176,176,168,160,152,144,136,128,128,128,128,128,128,128,128,128,
    /* S4 81-107 a 4 gap c85-88, THE LEANING LEDGES (c91-96), the checkpoint (c102) */
    128,128,128,128,null,null,null,null,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,
    /* S5 108-134 a 4 gap c110-113, LIFT TRACK 2 up (c118-121), the tower's back (row 6) */
    128,128,null,null,null,null,128,128,128,128,120,112,104,96,96,96,96,96,96,96,96,96,96,96,96,96,96,
    /* S6 135-161 THE TOWER'S BACK: a 4 gap c140-143, a 3 gap c151-153 */
    96,96,96,96,96,null,null,null,null,96,96,96,96,96,96,96,null,null,null,96,96,96,96,96,96,96,96,
    /* S7 162-188 the hatch: a 4 gap c167-170 down onto THE OBSERVATION DECK (row 9) */
    96,96,96,96,96,null,null,null,null,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,
    /* S8 189-215 THE OBSERVATION DECK: flat open ground for the boss (c195-221 stay empty) */
    144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,144,
    /* S9 216-229 past the boss door: a gift, the goal (c226) */
    144,144,144,144,144,144,144,144,144,144,144,144,144,144
  ],
  solid: [
    [91, 6, 93, 7], [94, 4, 96, 7]   /* S4 THE LEANING LEDGES: two steps up, each further right (the tower leans) */
  ],
  tiles: {
    gift: [
      [5, 9],   /* S1 */
      [39, 9],   /* S2 */
      [64, 7],   /* S3 */
      [95, 1, 'heart'],   /* S4 on top of THE LEANING LEDGES */
      [125, 2],   /* S5 */
      [157, 2],   /* S6 */
      [174, 5],   /* S7 on the deck */
      [194, 5, 'heart'],   /* S8 a heart just before the boss's left gate (c195) */
      [222, 5]   /* S9 past the boss door (c220) */
    ],
    brick: [
      [4, 9], [6, 9],   /* S1 */
      [156, 2], [158, 2],   /* S6 */
      [173, 5], [175, 5]   /* S7 */
    ]
  },
  /* joggers, squirrels and crows in the park; seagulls and Annie's scanner drones on the tower. Nothing waits at a lip,
     nothing on the deck where the boss goes. */
  foes: [
    [8, 12, 'mallwalker'], [20, 12, 'squirrel'],   /* S1 */
    [39, 12, 'squirrel'], [49, 10, 'mallwalker'],   /* S2 */
    [56, 7, 'crow'], [64, 10, 'squirrel'], [76, 7, 'mallwalker'],   /* S3 */
    [86, 4, 'seagull'], [104, 7, 'raccoon'],   /* S4 */
    [116, 4, 'scanner'], [128, 2, 'scanner'],   /* S5 */
    [137, 2, 'seagull'], [147, 2, 'scanner'], [157, 5, 'raccoon'],   /* S6 */
    [163, 2, 'crow'], [178, 8, 'raccoon'], [186, 5, 'scanner']   /* S7 */
  ],
  candles: [
    [3, 12], [5, 12], [7, 11], [9, 12], [11, 11], [12, 10], [13, 9], [14, 10], [15, 11], [17, 12], [19, 12], [22, 12], [24, 12], [26, 12],
    [28, 12], [30, 12], [32, 11], [33, 10], [34, 9], [35, 10], [36, 11], [38, 12], [40, 12], [42, 11], [43, 10], [44, 10], [45, 9], [47, 10], [50, 10], [52, 10],
    [54, 10], [56, 10], [57, 9], [58, 8], [59, 7], [60, 7], [61, 8], [62, 9], [64, 10], [66, 10], [67, 9], [68, 9], [69, 8], [70, 8], [71, 7], [72, 7], [74, 7], [78, 7], [80, 7],
    [82, 7], [84, 6], [85, 5], [86, 5], [87, 5], [88, 6], [89, 7], [91, 5], [93, 5], [94, 3], [96, 3], [98, 7], [100, 7], [103, 7], [105, 7], [107, 7],
    [108, 7], [109, 6], [110, 5], [111, 4], [112, 4], [113, 5], [114, 6], [116, 7], [118, 6], [119, 6], [120, 5], [121, 5], [123, 5], [127, 5], [130, 5], [132, 5], [134, 5],
    [136, 5], [138, 5], [139, 4], [140, 3], [141, 2], [142, 2], [143, 2], [144, 3], [145, 4], [147, 5], [149, 5], [150, 4], [151, 3], [152, 3], [153, 4], [155, 5], [159, 5], [161, 5],
    [162, 5], [164, 5], [166, 4], [167, 3], [168, 3], [169, 4], [170, 6], [171, 8], [173, 8], [175, 8], [177, 8], [179, 8], [181, 8], [183, 8], [185, 8], [187, 8],
    [189, 8], [191, 8], [193, 8],
    [223, 8], [225, 8], [228, 8]
  ],
  checkpoint: { col: 102, row: 7 },
  arena: { col: 196, cols: 24, boss: 'hunter-drone' },   /* THE OBSERVATION DECK: 2 phases; its gates at c195 and c220, its checkpoint flag at c192 */
  spawn: { col: 2, row: 12 },
  goal: { col: 226, row: 8 },   /* the far end of the observation deck, past where the boss goes */
  talk: [
    [2, 'KINAN', "The Big O! And Glitchy's hockey bag is going up that leaning tower!", 3.6],
    [40, 'DAD', "The tallest leaning tower in the world, bud! The whole climb is tilted. I lean toward liking it.", 3.6],
    [63, 'CHENOA', "That's the tower's lift track. Just stand on it and it carries you up, little bro!", 3.8],
    [90, 'PASSER-BY', 'Bonjour! The view from the top is magnifique!', 3],
    [103, 'MOM', 'Careful up there, sweetie. The gaps get bigger near the top.', 3.4],
    [162, 'SHAD', "Annie's drones are all over this tower. Something BIG is humming on the observation deck...", 4],
    [176, 'KINAN', "Whoa. One of Annie's big hunter drones! It's guarding Glitchy's bag!", 3.6]
  ]
});

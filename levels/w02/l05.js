/* ============================================================
   LEVEL 2-5 · THE GYM  (World 2 · School · trail stop 5)
   Story bible (World 2 table): "Fire-safety obstacle course with a
   brick fire-truck ladder." Glitchy set off every bell in the school,
   so the gym class is running the fire drill as an obstacle course.
   Idea (ONE): SPRINGBOARDS. In World 1 springs were a reward at the end
     of a level; here the gym springboards are ON the main path: vault the
     boxes, bounce up to the balance beam, and fly over the big walls.
   Signature set-piece: THE BRICK FIRE TRUCK (S4): a fire truck built
     out of toy bricks; its ladder (jump-through rungs) climbs to the
     rescue window, where a heart waits.
   Acts (63 cols each): teach 0-62 (a vault box with a springboard in
     front, "stay low" under the smoke, the springboard to the balance
     beam) · twist 63-125 (springboard at the lip of a 4-pit with a wall
     behind it, a 4-pit, the fire truck, the big vault) · test 126-188
     (springboard at the lip of a 5-pit with a 6-tall wall behind it, a
     paper plane over the runway, a 4-pit, then the calm springboard
     reward screen and the exit door).
   Secrets: visible = the rescue window at the top of the truck's ladder
     (heart + candles, 98,2) · hidden = the BIG VAULT BOX's back wall:
     vault it, turn round and walk into its bottom corner (GOLDEN
     CANDLE, 119,11, glints) · skill = the last springboard throws you
     PAST the high shelf; let go of RUN or steer back to land on it,
     then jump to the gift above it (cake, 169,1).
   Bubble beats for ER-4 (not wired): c2 "Fire drill! Walk, don't run!
     ...Okay, run." · c30 "Stay LOW under the smoke!" · c86 Milo: "I
     built the fire truck! Climb the ladder!" · c109 checkpoint · c184
     "Everybody out! Line up by the door!"
   ENGINE REQUESTS: a springboard skin for the gym (the spring tile) ·
     smoke puffs (a 'smoke' flyer skin; ghosts stand in) · a dodgeball
     thrower type for the gym teacher (teacher throws pencils today) ·
     this level's bricks should draw red (fire truck) — palette pass M6.
   ============================================================ */
KinanLevels.register({
  id: '2-5', world: 2, slot: 5, kind: 'level',
  name: 'THE GYM',
  theme: 24,                /* borrows the indoor arena look: banners, a gallery of spectators, a shiny floor */
  cols: 189,
  heights: [
    /* S1 0-26 teach: warm-up, a hop box, THE FIRST SPRINGBOARD in front of a 4-tall vault box */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 the smoke crawl c30-36 · 2-pit c42-43 · springboard c47 to the balance beam over a 3-pit c49-51 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null, 192,192,192,192,192, null,null,null, 192,192,
    /* S3 54-80 breath · springboard at the lip c66, 4-pit c67-70, 5-tall wall c71-72 */
    192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 4-pit c81-84 · THE BRICK FIRE TRUCK c88-101 and its ladder · a long runway after the cab */
    null,null,null,null, 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 checkpoint · the BIG VAULT (springboard c113, box c116-119) · the mat pile (BROW c128-134) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, 184,176, 176,176,176, 184,192,
    /* S6 135-161 test: springboard at the lip c138, 5-pit c139-143, 6-tall wall c144-145, a 10-tile runway · 4-pit c156-159 */
    192,192,192,192, null,null,null,null,null, 192,192,192,192,192,192,192,192,192,192,192,192, null,null,null,null, 192,192,
    /* S7 162-188 reward: the skill springboard, a bonus springboard, the exit door */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [16, 10, 17, 11],                     /* S1 the hop box (2 high) */
    [23, 8, 24, 11],                      /* S1 the vault box (4 high): the springboard is the way over */
    [30, 10, 36, 10],                     /* S2 the smoke: a low ceiling, crawl under it (or hop on top) */
    [71, 7, 72, 11],                      /* S3 the wall behind the 4-pit (5 high) */
    [116, 8, 119, 11],                    /* S5 THE BIG VAULT BOX (its bottom-right corner hides the golden candle) */
    [144, 6, 145, 11]                     /* S6 the wall behind the 5-pit (6 high) */
  ],
  tiles: {
    gift: [[9, 8, 'popper'], [39, 8], [59, 8], [119, 11, 'gold'], [124, 8], [151, 8, 'heart'], [169, 1, 'cake'], [181, 8]],
    brick: [
      [8, 8], [10, 8], [58, 8], [60, 8],
      /* THE BRICK FIRE TRUCK: the body (3 high) and the cab (4 high), all toy bricks. Nothing can bump them from below. */
      [88, 9], [89, 9], [90, 9], [91, 9], [92, 9], [93, 9], [94, 9], [95, 9], [96, 9], [97, 9],
      [88, 10], [89, 10], [90, 10], [91, 10], [92, 10], [93, 10], [94, 10], [95, 10], [96, 10], [97, 10],
      [88, 11], [89, 11], [90, 11], [91, 11], [92, 11], [93, 11], [94, 11], [95, 11], [96, 11], [97, 11],
      [98, 8], [99, 8], [100, 8], [101, 8], [98, 9], [99, 9], [100, 9], [101, 9],
      [98, 10], [99, 10], [100, 10], [101, 10], [98, 11], [99, 11], [100, 11], [101, 11]
    ],
    spring: [[21, 12], [47, 12], [66, 12], [113, 12], [138, 12], [166, 12], [176, 12]],   /* springboards, flush with the floor */
    shelf: [[49, 6], [50, 6], [51, 6], [52, 6], [53, 6], [54, 6], [55, 6], [56, 6],      /* S2 the balance beam */
            [91, 7], [92, 7], [94, 5], [95, 5], [96, 3], [97, 3], [98, 3], [99, 3],       /* S4 the fire truck's ladder and the rescue window */
            [168, 4], [169, 4], [170, 4]]                                                 /* S7 the high shelf (skill) */
  },
  pipes: [[103, 11]],                      /* the fire hydrant by the truck */
  foes: [[13, 11, 'cone'],
         [33, 7, 'ghost'],
         [61, 11, 'ball'],
         [105, 11, 'ball'], [100, 7, 'teacher'],
         [131, 10, 'bully'], [125, 5, 'plane'],
         [153, 11, 'ball'], [149, 6, 'plane']],
  candles: [[4, 11], [5, 11], [6, 11], [16, 9], [17, 9],
            [21, 9], [22, 7], [23, 6], [24, 6], [25, 7], [26, 9],
            [31, 11], [32, 11], [33, 11], [34, 11], [35, 11],
            [41, 10], [42, 9], [43, 9], [44, 10], [47, 9], [48, 7], [49, 5], [51, 5], [53, 5], [55, 5],
            [66, 9], [67, 6], [68, 4], [69, 3], [70, 3], [71, 4], [72, 4], [73, 6], [74, 8], [75, 10],
            [80, 9], [81, 8], [82, 7], [83, 7], [84, 8], [85, 9],
            [91, 6], [92, 6], [94, 4], [95, 4], [106, 11], [107, 11],
            [113, 9], [114, 6], [115, 5], [116, 4], [117, 4], [118, 4], [119, 5], [120, 7], [121, 11], [122, 11],
            [129, 10], [130, 10], [131, 9], [132, 10],
            [138, 9], [139, 6], [140, 4], [141, 3], [142, 2], [143, 2], [144, 3], [145, 3], [146, 5], [147, 7], [148, 9],
            [155, 9], [156, 8], [157, 7], [158, 7], [159, 8], [160, 9],
            [166, 9], [167, 7], [168, 3], [170, 3],
            [176, 9], [177, 7], [178, 5], [179, 5], [180, 7], [183, 11], [184, 11]],
  secrets: [
    { kind: 'visible', col: 98, row: 2, prize: 'heart+candles' },                  /* the rescue window at the top of the ladder */
    { kind: 'hidden', col: 119, row: 11, prize: 'GOLDEN CANDLE', glint240: true },  /* the back corner of the big vault box */
    { kind: 'skill', col: 169, row: 1, prize: 'cake' }                              /* land on the high shelf, then jump to the gift */
  ],
  goldenCandle: { col: 119, row: 11 },
  checkpoint: { col: 109, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 186, row: 11 }             /* the gym's exit door */
});

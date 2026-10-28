/* ============================================================
   LEVEL 2-8 · THE PLAYGROUND  (World 2 · School · trail stop 10)
   Story bible (World 2 table): "Monkey bars, swings and the big slide."
   Recess, the last stop before the Principal's Bell Tower: the bells
   keep ringing, so recess never ends, and the whole playground is wild.
   Idea: THE EXAM, nothing new. It mixes what World 2 taught: springboard
     swings (2-5), tray kickers (2-6), pixel bricks (2-7) and charging
     bullies penned behind hurdles (the fort), plus World 1's slopes.
   Signature set-piece: THE BIG SLIDE (S5-S6): climb the steep climbing
     ramp to the top of the play tower (8 tiles up, the highest point in
     World 2), then ride the longest slide in the game: 16 tiles of slope
     down past the recess teacher's pencils into the dodgeballs.
   Acts (81 cols each): teach 0-80 (a bench, the sandbox BOWL, a 3-pit,
     the monkey bars) · twist 81-161 (bully hill, a kicker over a 4-pit,
     the climbing ramp, THE BIG SLIDE) · test 162-242 (a swing at the lip
     of a 5-pit with a 6-tall fence behind it, a cone on the runway, a
     4-pit, a kicker over a 5-pit, a bully penned between hurdles, then
     the swing set and the school gate).
   Secrets: visible = THE MONKEY BARS (S3): five 1-wide bars over the
     sandpit, then the platform at the end (heart + candles, 68,4) ·
     hidden = something glints in the air over the SANDBOX (S2): jump in
     the middle of it (GOLDEN CANDLE, 36,9) · skill = THE SWING SET (S9):
     step onto the swing SLOWLY: it throws you into its brick crossbar
     (CRASH), you drop back onto the swing and bounce up through the gap
     to the hat (222,4). A running start flings you past it.
   Bubble beats for ER-4 (not wired): c2 Milo and Aiden: "Recess! The
     bell rang five times. FIVE." · c37 "Something's shiny in the
     sandbox..." · c110 checkpoint · c134 (tower top) "THE BIG SLIDE!" ·
     c238 "The bell tower. The principal is up there."
   ENGINE REQUESTS: swings that swing (today a springboard) · monkey
     bars Kinan can hang from (today jump-through bars) · a slide skin for
     the long slope and a little speed boost going down it · a seesaw ·
     'dodgeball' and 'recess bully' skins ('ball', 'bully' stand in).
   ============================================================ */
KinanLevels.register({
  id: '2-8', world: 2, slot: 10, kind: 'level',
  name: 'THE PLAYGROUND',
  theme: 7,                 /* the legacy School Playground look */
  cols: 243,
  heights: [
    /* S1 0-26 teach: the school yard, a bench */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 THE SANDBOX (a BOWL, c32-41) · 3-pit c46-48 */
    192,192,192,192,192, 200,208, 208,208,208,208,208,208, 200,192, 192,192,192,192, null,null,null, 192,192,192,192,192,
    /* S3 54-80 THE MONKEY BARS over a 3-pit c60-62 */
    192,192,192,192,192,192, null,null,null, 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 twist: BULLY HILL (RIDGE c85-95) · KICKER (lip c99) over a 4-pit c100-103 */
    192,192,192,192, 184,176,168,160, 160,160,160,160,160, 176,192, 192,192, 184,176, null,null,null,null, 192,192,192,192,
    /* S5 108-134 checkpoint · THE CLIMBING RAMP (1:1 up, c126-133) to the play tower */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, 176,160,144,128,112,96,80,64, 64,
    /* S6 135-161 the tower top c134-137 · THE BIG SLIDE (2:1 down, c138-153) · the dodgeballs */
    64,64,64, 72,80,88,96,104,112,120,128,136,144,152,160,168,176,184,192, 192,192,192,192,192,192,192,192,
    /* S7 162-188 test: a SWING at the lip c165, 5-pit c166-170, the 6-tall fence c171-172, an 11-tile runway · 4-pit c184-187 */
    192,192,192,192, null,null,null,null,null, 192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null,null, 192,
    /* S8 189-215 a KICKER (lip c195 at 160) over a 5-pit c196-200 · a bully penned between hurdles */
    192,192,192, 184,176,168,160, null,null,null,null,null, 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S9 216-242 reward: THE SWING SET, a bonus swing, the school gate */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [15, 10, 17, 11],                     /* S1 a bench */
    [55, 10, 55, 11],                     /* S3 the monkey bars' ladder step */
    [80, 11, 80, 11], [93, 9, 93, 9],     /* S4 hurdles pen bully hill's bully: never back to the 3-pit, never on to the kicker */
    [108, 11, 108, 11],                   /* S5 a hurdle: the ball on the climbing ramp stays off the kicker's landing */
    [158, 11, 158, 11],                   /* S6 a hurdle: the slide's dodgeball stays away from the swing at the 5-pit */
    [171, 6, 172, 11],                    /* S7 the fence behind the 5-pit (6 tall): the swing is the way over */
    [204, 11, 204, 11], [212, 11, 212, 11]   /* S8 hurdles: a bully is penned between them, away from the kicker's landing */
  ],
  tiles: {
    gift: [[7, 8, 'popper'], [36, 9, 'gold'], [90, 5], [114, 8, 'heart'], [201, 8], [229, 8]],
    brick: [[6, 8], [8, 8], [89, 5], [91, 5],
            [221, 7], [222, 7], [223, 7]],          /* S9 the swing set's brick crossbar */
    spring: [[165, 12], [222, 12], [232, 12]],      /* swings: S7 at the 5-pit's lip, S9 the swing set, S9 a bonus swing */
    shelf: [[57, 7], [59, 7], [61, 7], [63, 7], [65, 7],   /* S3 THE MONKEY BARS (1 wide; too high to reach from the floor, climb the step) */
            [67, 5], [68, 5], [69, 5]]                     /* S3 the platform at the end of the bars */
  },
  /* every walker is fenced in by hurdles, walls or a bench: none can wait at a landing or knock Kinan into a pit */
  foes: [[12, 11, 'ball'],
         [91, 9, 'bully'],
         [118, 11, 'ball'],
         [136, 3, 'teacher'], [157, 11, 'ball'],
         [178, 11, 'cone'], [180, 11, 'cone'],
         [208, 11, 'bully'],
         [236, 11, 'ball']],
  candles: [[3, 11], [4, 11], [6, 7], [8, 7], [15, 9], [16, 9], [17, 9],
            [34, 12], [35, 12], [37, 12], [38, 12], [39, 12], [45, 10], [46, 9], [47, 8], [48, 9], [49, 10],
            [57, 6], [59, 6], [61, 6], [63, 6], [65, 6], [59, 10], [60, 9], [61, 9], [62, 9], [63, 10],
            [84, 10], [86, 9], [88, 8], [90, 8], [92, 8], [97, 10], [99, 9], [100, 8], [101, 7], [102, 7], [103, 8], [104, 9],
            [112, 11], [113, 11], [126, 10], [128, 8], [130, 6], [132, 4],
            [134, 3], [135, 3], [137, 3],
            [139, 3], [141, 4], [143, 5], [145, 6], [147, 7], [149, 8], [151, 9], [153, 10],
            [165, 9], [166, 6], [167, 4], [168, 3], [169, 2], [170, 2], [171, 3], [172, 3], [173, 5], [174, 7], [175, 9],
            [183, 10], [184, 9], [185, 8], [186, 8], [187, 9], [188, 10],
            [195, 9], [196, 8], [197, 7], [198, 6], [199, 6], [200, 7], [201, 9], [202, 10],
            [218, 11], [219, 11], [222, 5], [232, 9], [232, 7], [233, 5], [234, 5], [238, 11], [239, 11]],
  secrets: [
    { kind: 'visible', col: 68, row: 4, prize: 'heart+candles' },                  /* the platform at the end of the monkey bars */
    { kind: 'hidden', col: 36, row: 9, prize: 'GOLDEN CANDLE', glint240: true },    /* in the air over the sandbox */
    { kind: 'skill', col: 222, row: 4, prize: 'hat' }                               /* through the swing set's crossbar */
  ],
  goldenCandle: { col: 36, row: 9 },
  checkpoint: { col: 110, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 240, row: 11 }             /* the school gate */
});

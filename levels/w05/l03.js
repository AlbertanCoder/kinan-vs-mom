/* ============================================================
   LEVEL 5-3 · THE RODEO GROUNDS
   (World 5 · Calgary Stampede · trail stop 3)
   Story bible (World 5 table): "Junior rodeo games, gentle lasso
   pulls." Past the breakfast tents, a man with a clipboard points at
   Kinan: "Junior Rodeo? You're up, partner!" Every pen on the grounds
   is open (Glitchy spooked the gates), the mini bulls are loose, the
   sheep are loose, and somewhere a young bull named Bronco is snorting.
   Idea (ONE): THE CORRAL RAILS. The fence rails are ledges you can
     stand on (jump up through them, land on top). Walk the rails above
     the pens where the mini bulls charge and the sheep wander, drop in
     for candles, hop back out. The first gift box is a LASSO (the
     gentle pull: candles fly to you). Act 1 teaches the rails over safe
     pens, then BARREL RACING in the arena BOWL; act 2 twists it: THE
     BULL PEN RUN (one long pen, two bulls, one long rail), the berm
     RIDGE, THE STEER PEN (a low rail and a high rail, stacked like
     stairs); act 3 tests it: two 5-wide creek ditches under crows and
     magpies, then THE TOP RAIL.
   Acts (thirds): 0-89 teach (the lasso, the sheep pen, the calf pen
     and a 3-wide ditch off its post, BARREL RACING in the BOWL, a 3-wide
     ditch, THE ANNOUNCER'S BOOTH) · 90-179 twist (the checkpoint, THE
     BULL PEN RUN, a 4-wide ditch, the berm RIDGE, THE STEER PEN and the
     judges' stand) · 180-269 test (two 5-wide ditches, THE TOP RAIL,
     the winners' podium).
   Signature set-piece: THE BULL PEN RUN (S5): a 23-tile pen with two
     mini bulls charging up and down it; walk the long rail above them
     (safe) or race them on the dirt (candles down there).
   Secrets: visible = THE JUDGES' STAND (S7): a little stand hangs up and
     to the LEFT of the steer pen's high rail; jump back up onto it, then
     jump for the heart (heart + candles, 175,3) · hidden = THE
     ANNOUNCER'S BOOTH (S4): the booth stands on stilts over the
     walkway; jump under it, one board glints (GOLDEN CANDLE, 85,7) ·
     skill = THE TOP RAIL (S9): three rails stacked like a ladder above
     the arena; climb them zig-zag to the top (hat, 220,2).
   Look: borrows the Rodeo Grounds (theme 33): a hot blue sky, the
     chutes and the grandstand, sandy arena dirt.
   Bubble beats for ER-4 (not wired): c2 the clipboard man: "Junior
     Rodeo? You're up next, partner!" Kinan: "I didn't sign up for—" ·
     c5 Chenoa: "A lasso! Candles come to YOU now." · c16 Kinan: "A sheep.
     Do I... ride it?" · c58 Shad: "Barrel racing! Round the barrels, bud!"
     · c85 the announcer: "Folks, there's a KID under my booth!" · c107
     checkpoint, a rodeo clown: "Why did the cow cross the road? To get
     to the udder side!" · c175 Chenoa: "The judges are giving you a TEN!" · c220 "Top rail! I can see Bronco from here!"
   ENGINE REQUESTS: a corral-rail skin for the shelves (white boards)
     and fence-post skins for the posts · a sheep you can ride (mutton
     busting: a slow rideable walker) · a lasso you can throw to swing
     from a post · real chute gates that swing open · the announcer's
     voice over the grounds · bubbles ER-4.
  
   ============================================================ */
KinanLevels.register({
  id: '5-3', world: 5, slot: 3, kind: 'level',
  name: 'THE RODEO GROUNDS',
  theme: 33,              /* the Rodeo Grounds: a hot blue sky, the chutes and the grandstand, sandy arena dirt */
  cols: 270,
  heights: [
    /* S1 0-26 the Junior Rodeo gate: the lasso · the sheep pen (posts c12 and c20, the rail between) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 the calf pen (posts c32 and c44) · a 3-wide ditch c46-48 right off its post */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,
    /* S3 54-80 BARREL RACING: the arena BOWL (c57-68) with two barrels · a 3-wide ditch c75-77 */
    192,192,192,200,208,208,208,208,208,208,208,208,208,200,192,192,192,192,192,192,192,null,null,null,192,192,192,
    /* S4 81-107 THE ANNOUNCER'S BOOTH on stilts over the walkway (c83-88) · the bull pen (posts c92 and c104) · checkpoint */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 THE BULL PEN RUN: one long pen (posts c110 and c133), two mini bulls inside, the long rail over them */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 the runway out of the pen · a 4-wide ditch c146-149 · up the berm RIDGE (c152-155) */
    192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,184,176,168,160,160,160,160,160,160,160,
    /* S7 162-188 the RIDGE top and down (c166-169) · THE STEER PEN: the low rail (c173-176), the high rail (c178-182), THE JUDGES' STAND up and left */
    160,160,160,160,168,176,184,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S8 189-215 two 5-wide ditches c195-199 and c204-208 with a 4-wide island between */
    192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,
    /* S9 216-242 THE TOP RAIL: three rails stacked like a ladder (c219-225, skill) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S10 243-269 reward: the winners' podium (a MESA c248-257), Dad's truck */
    192,192,192,192,192,176,160,160,160,160,160,160,160,176,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [12, 9, 12, 11], [20, 9, 20, 11],   /* S1 the sheep pen's posts */
    [32, 9, 32, 11], [44, 9, 44, 11],   /* S2 the calf pen's posts */
    [60, 11, 61, 12], [64, 11, 65, 12],   /* S3 the two barrels in the bowl */
    [83, 6, 88, 7], [92, 9, 92, 11], [104, 9, 104, 11],   /* S4 THE ANNOUNCER'S BOOTH on its stilts (a glinting board in its floor) · the bull pen's posts */
    [110, 9, 110, 11], [133, 9, 133, 11],   /* S5 THE BULL PEN RUN's posts */
    [172, 10, 172, 11], [177, 8, 177, 11], [183, 8, 183, 11]   /* S7 THE STEER PEN: the low post, the tall post, the end post */
  ],
  open: [[4, 13, 6, 13]],   /* SLAM SPOT (butt slam, 2026-10-29): the pocket under the cracked boards, solid floor under it */
  tiles: {
    crack: [[4, 12], [5, 12], [6, 12]],   /* SLAM SPOT: cracked floorboards over a pocket of candles (a bonus, never needed) */
    gift: [
      [5, 8, 'lasso'],   /* S1 the LASSO (candles fly to you) */
      [28, 8],   /* S2 before the calf pen */
      [62, 8],   /* S3 over the bowl */
      [85, 7, 'gold'],   /* S4 the glinting booth board */
      [143, 8, 'heart'],   /* S6 before the ditch */
      [201, 8],   /* S8 on the island */
      [237, 8],   /* S9 */
      [251, 5], [253, 5, 'cake'], [255, 5, 'heart']   /* S10 the podium */
    ],
    brick: [
      [4, 8], [6, 8],   /* S1 */
      [27, 8], [29, 8],   /* S2 */
      [236, 8], [238, 8],   /* S9 */
      [252, 5], [254, 5]   /* S10 */
    ],
    shelf: [
      [13, 9], [14, 9], [15, 9], [16, 9], [17, 9], [18, 9], [19, 9],   /* S1 the sheep pen's rail */
      [33, 9], [34, 9], [35, 9], [36, 9], [37, 9], [38, 9], [39, 9], [40, 9], [41, 9], [42, 9], [43, 9],   /* S2 the calf pen's rail */
      [93, 9], [94, 9], [95, 9], [96, 9], [97, 9], [98, 9], [99, 9], [100, 9], [101, 9], [102, 9], [103, 9],   /* S4 the bull pen's rail */
      [111, 9], [112, 9], [113, 9], [114, 9], [115, 9], [116, 9], [117, 9], [118, 9], [119, 9], [120, 9], [121, 9], [122, 9], [123, 9], [124, 9], [125, 9], [126, 9], [127, 9], [128, 9], [129, 9], [130, 9], [131, 9], [132, 9],   /* S5 THE BULL PEN RUN's long rail */
      [173, 10], [174, 10], [175, 10], [176, 10], [178, 8], [179, 8], [180, 8], [181, 8], [182, 8], [175, 5], [176, 5],   /* S7 THE STEER PEN's low rail and high rail · THE JUDGES' STAND up and left of the high rail (visible secret) */
      [219, 9], [220, 9], [221, 9], [223, 6], [224, 6], [225, 6], [220, 3], [221, 3]   /* S9 THE TOP RAIL: the ladder (skill secret) */
    ]
  },
  /* mini bulls charge when Kinan is in line with them, sheep wander, lasso lizards throw, crows and magpies above; nothing waits at a ditch's lip */
  foes: [
    [16, 11, 'sheep'],   /* S1 in the sheep pen */
    [38, 11, 'minibull'],   /* S2 in the calf pen */
    [62, 12, 'minibull'],   /* S3 in the bowl, between the barrels */
    [98, 11, 'minibull'], [101, 3, 'crow'],   /* S4 in the bull pen */
    [117, 11, 'minibull'], [127, 11, 'minibull'],   /* S5 in the long pen */
    [147, 3, 'crow'], [158, 9, 'minibull'],   /* S6 */
    [174, 11, 'sheep'], [180, 11, 'minibull'], [186, 3, 'crow'],   /* S7 in the steer pen */
    [201, 3, 'crow'], [210, 3, 'magpie'], [213, 11, 'minibull'],   /* S8 */
    [230, 3, 'crow'], [234, 11, 'minibull'], [240, 11, 'lassolizard'],   /* S9 */
    [262, 11, 'sheep']   /* S10 */
  ],
  candles: [[4, 13], [5, 13], [6, 13],
    [2, 11], [3, 11], [4, 11], [5, 7], [13, 8], [15, 8], [17, 8], [19, 8], [15, 11], [17, 11], [22, 11], [24, 11], [26, 11], [27, 7],
    [29, 7], [30, 11], [31, 11], [33, 8], [35, 8], [37, 8], [39, 8], [41, 8], [43, 8], [45, 7], [46, 6], [47, 6], [48, 7], [49, 9],
    [51, 11], [52, 11], [53, 11], [56, 11], [58, 11], [59, 12], [60, 9], [61, 9], [62, 7], [63, 7], [64, 9], [65, 9], [67, 12], [68, 11],
    [70, 11], [71, 11], [72, 11], [73, 11], [74, 11], [75, 9], [76, 8], [77, 9], [78, 11], [81, 11], [82, 11], [84, 5], [85, 5], [86, 5],
    [87, 5], [89, 11], [90, 11], [91, 11], [93, 8], [95, 8], [97, 8], [99, 8], [101, 8], [103, 8], [95, 11], [101, 11], [106, 11], [109, 11],
    [110, 8], [111, 8], [113, 8], [115, 8], [117, 8], [119, 8], [121, 8], [123, 8], [125, 8], [127, 8], [129, 8], [131, 8], [114, 11], [122, 11],
    [130, 11], [135, 11], [136, 11], [137, 11], [138, 11], [139, 11], [140, 11], [143, 7], [144, 11], [145, 11], [146, 9], [147, 8], [148, 8], [149, 9],
    [150, 11], [152, 10], [153, 9], [154, 8], [156, 9], [158, 9], [160, 9], [162, 9], [164, 9], [167, 10], [168, 11], [170, 11], [171, 11], [173, 9],
    [174, 9], [175, 9], [176, 9], [178, 7], [179, 7], [180, 7], [181, 7], [182, 7], [175, 4], [176, 4], [184, 7], [185, 8], [186, 9], [188, 11],
    [190, 11], [191, 11], [192, 11], [193, 11], [194, 11], [195, 9], [196, 8], [197, 8], [198, 8], [199, 9], [200, 11], [201, 7], [202, 11], [203, 11],
    [204, 9], [205, 8], [206, 8], [207, 8], [208, 9], [209, 11], [210, 11], [212, 11], [214, 11], [219, 8], [220, 8], [221, 8], [223, 5], [224, 5],
    [225, 5], [221, 2], [228, 11], [231, 11], [234, 11], [237, 7], [246, 11], [248, 10], [249, 9], [250, 9], [251, 9], [252, 9], [253, 9], [254, 9],
    [255, 9], [251, 4], [253, 4], [255, 4], [259, 11], [261, 11], [263, 11], [265, 11]
  ],
  secrets: [
    { kind: 'visible', col: 175, row: 3, prize: 'heart+candles' },   /* THE JUDGES' STAND: up and left from the high rail, then jump for the heart */
    { kind: 'hidden', col: 85, row: 7, prize: 'GOLDEN CANDLE', glint240: true },   /* THE ANNOUNCER'S BOOTH: its glinting floorboard */
    { kind: 'skill', col: 220, row: 2, prize: 'hat' }   /* THE TOP RAIL */
  ],
  goldenCandle: { col: 85, row: 7 },
  checkpoint: { col: 107, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 266, row: 11 }   /* Dad's truck waits past the podium */
});

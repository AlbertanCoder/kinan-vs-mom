/* ============================================================
   LEVEL 3-4 · THE MUDDY LEASE ROAD
   (World 3 · Robin's oilfield trip · trail stop 4)
   Story bible (World 3 table): "Slippery mud and sinking boardwalks."
   It rained all night. The gravel lease road out to Robin's job site
   runs through the muskeg, and Robin's hydro-vac is stuck to its axles
   in a mud hole. The last bit is on foot, over the old boardwalks.
   Idea (ONE): THE BOARDWALK. Thin plank boardwalks over the muskeg:
     land from above, jump up through from below. Act 1 teaches it over
     a soft ditch (fall in and you just walk out), then over the first
     real muskeg. Act 2 twists it: THE SINKING BOARDWALK, each section
     lower than the last, then a jump UP to the one good section (a mud
     blob lives on it); and the high boardwalk across the beaver pond
     with its broken planks, a frog leaping up through it. Act 3 tests it:
     no boardwalk at all through the survey cut (5-wide muskeg), then
     the second sinking boardwalk with mud blobs that split when you
     stomp them.
   Acts (81 cols each): teach 0-80 (the truck rut, the soft ditch, the
     first boardwalk over muskeg 3/2/3, the berm, a 3-wide pit) · twist
     81-161 (THE SINKING BOARDWALK over muskeg 4/4/4/4, the checkpoint,
     ROBIN'S STUCK HYDRO-VAC, the high boardwalk and the tree stand) ·
     test 162-242 (the survey cut 5/5, THE SINKING BOARDWALK II 4/5/4,
     then the job-site gate).
   Signature set-piece: THE SINKING BOARDWALK (S4): four sections, the
     first three each one plank lower, the last one back up.
   Secrets: visible = the hunter's tree stand over the broken gap of the
     high boardwalk: jump up to it, the muskeg is right below (heart +
     candles, 144,5) · hidden = PUSH THE TRUCK: go over Robin's stuck
     hydro-vac, drop into the mud hole in front of it, turn round and
     push its front bumper, which glints (GOLDEN CANDLE, 121,12) ·
     skill = the moss spring: walk SLOWLY off the end of the first
     sinking section and drop onto the moss spring below; it throws you
     straight up onto the survey marker (run off the end and you sail
     past it onto the next section) (hat, 197,2).
   Look: borrows the Muddy Lease Road look (theme 13): an overcast
     prairie, grain elevators, power lines and a wet brown road.
   Bubble beats for ER-4 (not wired): c2 Robin: "It rained. The road is
     now soup." · c84 (the sinking boardwalk) "Hop quick, bud, it's
     going under!" · c110 checkpoint, Robin: "We're not stuck. We're
     just parked very, very firmly." · c121 (the stuck truck) "Give it
     a push! ...Wait, what's that shiny thing?" · c239 the job site:
     "Hard hat on. This is where I work." Robin's joke (World 3 joke
     book): "Why did the mud go to school? To get a little more
     grounded."
   ENGINE REQUESTS: sinking boardwalk planks (they sink while you stand
     on them and float back up when you leave) · slippery mud zones
     (per-column friction) · muskeg that slows you down instead of a
     pit (shallow mud) · a stuck hydro-vac prop you can push · frog,
     mud-blob and mosquito skins for the north ('puddlefrog', 'mud',
     'mosquito' stand in) · a moss-spring skin.
   ============================================================ */
KinanLevels.register({
  id: '3-4', world: 3, slot: 4, kind: 'level',
  name: 'THE MUDDY LEASE ROAD',
  theme: 13,                /* the Muddy Lease Road look: overcast prairie, elevators, a wet brown road */
  cols: 243,
  heights: [
    /* S1 0-26 rut c7-14, soft ditch c18-25 · S2 27-53 muskeg c30-32, c34-35, c38-40 (boardwalk broken over c37-38) · S3 54-80 berm c58-68, pit c77-79 ·
       S4 81-107 muskeg c83-86, c88-91, c93-96, c98-101 · S5 108-134 the mud hole c113-124 · S6 135-161 muskeg c138-141, c143-146, c149-152 ·
       S7 162-188 muskeg c166-170, c175-179 · S8 189-215 muskeg c192-195, c199-203, c205-208 · S9 216-242 pit c224-226 */
    192,192,192,192,192,192,192,200,208,208,208,208,208,200,192,192,192,192,208,224,224,224,224,224,208,192,192,
    192,192,192,null,null,null,192,null,null,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,176,160,160,160,160,160,160,160,160,176,192,192,192,192,192,192,192,192,192,null,null,null,192,
    192,192,null,null,null,null,192,null,null,null,null,192,null,null,null,null,192,null,null,null,null,192,192,192,192,192,192,
    192,192,192,192,192,200,208,208,208,208,208,208,208,208,208,200,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,null,null,null,null,192,null,null,null,null,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,
    192,192,192,192,null,null,null,null,null,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,
    192,192,192,null,null,null,null,192,192,192,null,null,null,null,null,192,null,null,null,null,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [115, 9, 119, 12],   /* S5 Robin's hydro-vac, stuck: the tank */
    [120, 10, 121, 12]    /* S5 Robin's hydro-vac, stuck: the cab (its front bumper hides the golden candle) */
  ],
  tiles: {
    gift: [
      [16, 8, 'candle'], [45, 8, 'popper'], [63, 6, 'candle'], [104, 8, 'candle'], [117, 6, 'heart'], [121, 12, 'gold'],
      [139, 6, 'candle'], [186, 8, 'heart'], [210, 6, 'candle'], [222, 8, 'cake'], [232, 8, 'candle']
    ],
    brick: [
      [44, 8], [46, 8]
    ],
    spring: [
      [197, 11]
    ],
    shelf: [
      [18, 11], [19, 11], [20, 11], [21, 11], [22, 11], [23, 11], [24, 11], [25, 11], [29, 10], [30, 10], [31, 10], [32, 10], [33, 10], [34, 10],
      [35, 10], [36, 10], [39, 10], [40, 10], [41, 10], [82, 9], [83, 9], [84, 9], [85, 9], [86, 9], [88, 10], [89, 10], [90, 10], [91, 10],
      [93, 11], [94, 11], [95, 11], [96, 11], [98, 9], [99, 9], [100, 9], [101, 9], [136, 9], [137, 9], [138, 9], [139, 9], [140, 9], [141, 9],
      [142, 9], [143, 9], [146, 9], [147, 9], [148, 9], [149, 9], [150, 9], [151, 9], [144, 6], [145, 6], [190, 9], [191, 9], [192, 9], [193, 9],
      [194, 9], [195, 9], [199, 10], [200, 10], [201, 10], [202, 10], [204, 11], [205, 11], [206, 11], [207, 9], [208, 9], [209, 9], [210, 9], [211, 9],
      [212, 9], [196, 3], [197, 3], [198, 3]
    ]
  },
  /* mud blobs split in two when stomped, the muskeg frogs leap after you, mosquitoes patrol */
  foes: [
      [11, 12, 'mud'], [37, 11, 'puddlefrog'], [63, 7, 'mosquito'], [100, 8, 'mud'], [105, 11, 'puddlefrog'], [118, 5, 'mosquito'],
      [128, 11, 'mud'], [141, 5, 'mosquito'], [147, 11, 'puddlefrog'], [172, 11, 'mud'], [182, 8, 'mosquito'], [187, 11, 'puddlefrog'],
      [210, 8, 'mud'], [211, 11, 'puddlefrog'], [214, 6, 'mosquito'], [228, 11, 'mud']
  ],
  candles: [
      [3, 11], [4, 11], [9, 11], [10, 11], [12, 11], [19, 10], [21, 10], [23, 10], [25, 10], [30, 9], [32, 9], [34, 9], [36, 9], [37, 8],
      [38, 8], [40, 9], [42, 11], [48, 11], [49, 11], [59, 9], [61, 9], [65, 9], [67, 9], [71, 11], [72, 11], [77, 9], [78, 8], [79, 9],
      [83, 8], [85, 8], [87, 8], [89, 9], [91, 9], [92, 9], [94, 10], [96, 10], [97, 9], [99, 8], [101, 8], [105, 11], [106, 11], [111, 11],
      [114, 11], [116, 8], [118, 8], [120, 9], [122, 12], [125, 11], [131, 11], [132, 11], [137, 8], [139, 8], [141, 8], [143, 8], [144, 5], [145, 5],
      [147, 8], [149, 8], [151, 8], [152, 7], [153, 8], [156, 11], [157, 11], [165, 10], [166, 9], [167, 8], [168, 8], [169, 8], [170, 9], [172, 10],
      [173, 10], [174, 10], [175, 9], [176, 8], [177, 8], [178, 8], [179, 9], [191, 8], [193, 8], [195, 8], [197, 9], [197, 6], [196, 2], [198, 2],
      [200, 9], [202, 9], [203, 9], [205, 10], [206, 10], [207, 8], [209, 8], [212, 8], [219, 11], [220, 11], [223, 10], [224, 9], [225, 9], [226, 9],
      [227, 10], [235, 11], [236, 11], [238, 11]
  ],
  secrets: [
    { kind: 'visible', col: 144, row: 5, prize: 'heart+candles' },                 /* the hunter's tree stand over the broken gap */
    { kind: 'hidden', col: 121, row: 12, prize: 'GOLDEN CANDLE', glint240: true }, /* push the stuck hydro-vac's front bumper */
    { kind: 'skill', col: 197, row: 2, prize: 'hat' }                              /* the moss spring: walk slowly off the boardwalk onto it, straight up */
  ],
  goldenCandle: { col: 121, row: 12 },
  checkpoint: { col: 110, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 239, row: 11 }             /* the job-site gate */
});

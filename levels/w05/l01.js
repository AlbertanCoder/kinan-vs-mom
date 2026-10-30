/* ============================================================
   LEVEL 5-1 · THE STAMPEDE PARADE
   (World 5 · Calgary Stampede · trail stop 1)
   Story bible (World 5 table): "Hop between floats in rhythm with the
   band." The family rolls into Calgary on parade day: Robin, Shad and
   Chenoa travel with Kinan now. Downtown is packed, the marching bands
   are warming up, the floats roll down the avenue... and Glitchy, in a
   panic at all the noise, zaps the manhole covers clean off the street.
   Idea (ONE): THE MARCHING BAND. Drummers march at Kinan in step, one,
     then two, then a band on top of the floats. Hop them on the beat
     (or stomp one for a bounce) and use the parade floats (two and
     three tiles tall) as the high ground. Act 1 teaches it on the open
     street with one zapped manhole at a time; act 2 twists it: the band
     marches over a RIDGE and across THE FLOAT TRAIN, floats nose to
     tail over open manholes; act 3 tests it: a 5-wide hole off the
     grandstand TERRACE, then THE BIG HAT FLOAT.
   Acts (thirds): 0-89 teach (the hay-wagon float, the first band, a
     3-wide manhole, the float-ramp BROW, a 3-wide manhole, THE GRAND
     MARSHAL'S FLOAT) · 90-179 twist (the cattle-trailer float and THE
     BALLOON over a 4-wide manhole, the checkpoint, the Macleod RIDGE and
     a 4-wide manhole, THE FLOAT TRAIN) · 180-269 test (the float train's
     last hop, the grandstand TERRACE over a 5-wide manhole, THE BIG HAT
     FLOAT, the parade marshal's convertible).
   Signature set-piece: THE FLOAT TRAIN (S7): three floats nose to tail
     with open manholes between them, a drummer marching on the middle
     float; hop float to float in time with him.
   Secrets: visible = THE BALLOON (S5): a parade balloon is tied down
     over the 4-wide manhole; jump a step before the end of the
     cattle-trailer float and land in its basket, then jump for the heart tied above it
     (heart + candles, 119,3) · hidden = THE
     GRAND MARSHAL'S FLOAT (S4): stand on its flatbed and jump; one block
     of the canopy glints (GOLDEN CANDLE, 90,7) · skill = THE BIG HAT
     FLOAT (S9): jump up through the hat's brim, then onto the top of the
     crown, the highest point in the parade (hat, 226,3).
   Look: borrows the Stampede Parade (theme 31): a blue prairie sky, red
     brick downtown, a grey avenue.
   Bubble beats for ER-4 (not wired): c2 Robin: "Cowboy hats on! The
     parade's starting!" · c20 Kinan: "Why is that drummer marching right
     at ME?" · c40 Shad: "Glitchy zapped the manhole covers. Of course he
     did." · c88 Chenoa: "The Grand Marshal's float is SPARKLING." · c105
     checkpoint, a clown: "Why did the cowboy ride his horse to the
     parade? It was too heavy to carry!" · c226 "Biggest hat in Calgary.
     And I'm standing ON it."
   ENGINE REQUESTS: rolling parade floats (moving platforms that creep
     along the avenue; solid blocks stand in today) · float, balloon and
     giant-hat skins over the solid blocks and shelves · a marching-band
     skin for the drummer that steps on the beat of the music · manhole
     covers drawn at the pit lips · bubbles ER-4.
  
   ============================================================ */
KinanLevels.register({
  id: '5-1', world: 5, slot: 1, kind: 'level',
  name: 'THE STAMPEDE PARADE',
  theme: 31,              /* the Stampede Parade: a blue prairie sky, red brick downtown, a grey avenue */
  cols: 270,
  heights: [
    /* S1 0-26 the parade starts: the hay-wagon float (c12-15) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 a float with a stage (c30-33) · the first zapped manhole c36-38 (3 wide): jump it off the float · the first band */
    192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 the float-ramp BROW (c58-70) with a band on it · a 3-wide manhole c74-76 */
    192,192,192,192,184,176,176,176,176,176,176,176,176,176,176,184,192,192,192,192,null,null,null,192,192,192,192,
    /* S4 81-107 THE GRAND MARSHAL'S FLOAT (c86-93: a flatbed under a canopy, one block glints) · checkpoint */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 the cattle-trailer float (c113-118, right up to the lip) · THE BALLOON over a 4-wide manhole c119-122 */
    192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 the Macleod RIDGE (c137-152), a band marching down it · a 4-wide manhole c155-158 */
    192,192,184,176,168,160,160,160,160,160,160,160,160,160,168,176,184,192,192,192,null,null,null,null,192,192,192,
    /* S7 162-188 THE FLOAT TRAIN: float A (c166-169), a 3-wide manhole, float B (c173-177), a 4-wide manhole, float C (c182-186) */
    192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,
    /* S8 189-215 the grandstand TERRACE: up (c191-192, 1:1), a 5-wide manhole c198-202, down (c207-208) */
    192,192,176,160,160,160,160,160,160,null,null,null,null,null,160,160,160,160,176,192,192,192,192,192,192,192,192,
    /* S9 216-242 THE BIG HAT FLOAT (c220-232): the brim, the crown on top */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S10 243-269 reward: the parade marshal's convertible, the gift row, Dad's truck */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [12, 10, 15, 11],   /* S1 the hay-wagon float */
    [30, 9, 33, 11],   /* S2 a float with a stage */
    [86, 11, 93, 11], [86, 7, 93, 7],   /* S4 THE GRAND MARSHAL'S FLOAT: the flatbed and its canopy (a glinting block in it) */
    [113, 9, 118, 11],   /* S5 the cattle-trailer float, right up to the manhole's lip */
    [166, 10, 169, 11], [173, 10, 177, 11], [182, 9, 186, 11],   /* S7 THE FLOAT TRAIN: floats A, B and C (each fills its own stretch of street) */
    [220, 10, 232, 11], [223, 4, 229, 6],   /* S9 THE BIG HAT FLOAT: the float and the hat's crown */
    [246, 10, 249, 11]   /* S10 the parade marshal's convertible */
  ],
  tiles: {
    gift: [
      [6, 8, 'popper'],   /* S1 */
      [45, 8],   /* S2 */
      [64, 7],   /* S3 over the brow */
      [90, 7, 'gold'], [101, 8],   /* S4 the glinting canopy block · the barrel */
      [144, 5],   /* S6 over the ridge */
      [194, 5],   /* S8 */
      [237, 8, 'heart'],   /* S9 */
      [251, 8, 'heart'], [253, 8], [255, 8, 'cake']   /* S10 the gift row */
    ],
    brick: [
      [5, 8], [7, 8],   /* S1 */
      [63, 7], [65, 7],   /* S3 */
      [143, 5], [145, 5],   /* S6 */
      [250, 8], [252, 8], [254, 8], [256, 8]   /* S10 */
    ],
    shelf: [
      [29, 6], [30, 6], [31, 6], [32, 6], [33, 6], [34, 6],   /* S2 the float's stage */
      [119, 6], [120, 6],   /* S5 THE BALLOON's basket over the manhole (visible secret): jump a step before the float ends */
      [220, 7], [221, 7], [231, 7], [232, 7]   /* S9 the hat's brim, both sides of the crown (skill secret) */
    ]
  },
  /* drummers march in step, corn dogs on legs run, hay bales roll, geese patrol the sky; nothing waits at a manhole's lip */
  foes: [
    [21, 11, 'drummer'],   /* S1 */
    [47, 11, 'drummer'], [50, 11, 'drummer'],   /* S2 the first band */
    [62, 10, 'drummer'], [67, 10, 'drummer'],   /* S3 the band on the brow */
    [99, 11, 'drummer'], [104, 4, 'goose'],   /* S4 */
    [127, 11, 'drummer'], [132, 11, 'haybale'],   /* S5 */
    [143, 9, 'drummer'], [147, 9, 'drummer'],   /* S6 the band on the ridge */
    [175, 9, 'drummer'], [180, 4, 'goose'],   /* S7 */
    [190, 11, 'drummer'], [212, 11, 'corndog'], [214, 5, 'goose'],   /* S8 (the terrace top is left clear for the run-up to the 5-wide hole) */
    [236, 11, 'drummer'], [241, 11, 'corndog'],   /* S9 */
    [259, 11, 'drummer']   /* S10 */
  ],
  candles: [
    [2, 11], [3, 11], [4, 11], [5, 7], [7, 7], [12, 9], [13, 9], [14, 9], [15, 9], [18, 11], [19, 11], [24, 11], [25, 11], [29, 5],
    [31, 5], [33, 5], [30, 8], [32, 8], [34, 7], [35, 6], [36, 5], [37, 5], [38, 6], [39, 8], [42, 11], [45, 7], [52, 11], [53, 11],
    [58, 10], [59, 10], [60, 10], [62, 10], [64, 10], [66, 10], [68, 10], [63, 6], [65, 6], [73, 11], [74, 9], [75, 8], [76, 9], [77, 11],
    [78, 11], [79, 11], [80, 11], [87, 6], [88, 6], [89, 6], [90, 6], [91, 6], [92, 6], [82, 11], [83, 11], [84, 11], [95, 11], [96, 11],
    [101, 7], [110, 11], [111, 11], [113, 8], [114, 8], [115, 8], [116, 8], [117, 8], [118, 8], [120, 4], [120, 3], [121, 5], [122, 5], [123, 7],
    [124, 9], [126, 11], [127, 11], [128, 11], [137, 10], [138, 9], [139, 8], [141, 8], [143, 8], [145, 8], [147, 8], [144, 4], [150, 9], [151, 10],
    [154, 11], [155, 9], [156, 8], [157, 8], [158, 9], [159, 11], [166, 9], [167, 9], [168, 9], [169, 9], [170, 7], [171, 6], [172, 7], [173, 9],
    [175, 9], [177, 9], [178, 7], [179, 6], [180, 6], [181, 7], [181, 8], [182, 8], [183, 8], [184, 8], [185, 8], [186, 8], [191, 10], [192, 9],
    [193, 9], [195, 9], [197, 9], [194, 4], [198, 7], [199, 6], [200, 6], [201, 6], [202, 7], [203, 9], [204, 9], [205, 9], [206, 9], [207, 10],
    [208, 11], [218, 11], [219, 11], [221, 9], [223, 9], [225, 9], [227, 9], [229, 9], [231, 9], [220, 6], [221, 6], [224, 3], [228, 3], [231, 6],
    [232, 6], [234, 11], [237, 7], [245, 11], [246, 9], [247, 9], [248, 9], [249, 9], [251, 7], [253, 7], [255, 7], [258, 11], [260, 11], [262, 11],
    [264, 11], [262, 8], [263, 7], [264, 8]
  ],
  secrets: [
    { kind: 'visible', col: 119, row: 3, prize: 'heart+candles' },   /* THE BALLOON over the manhole: land in its basket, then jump for the heart */
    { kind: 'hidden', col: 90, row: 7, prize: 'GOLDEN CANDLE', glint240: true },   /* the Grand Marshal's glinting canopy */
    { kind: 'skill', col: 226, row: 3, prize: 'hat' }   /* the top of THE BIG HAT's crown */
  ],
  goldenCandle: { col: 90, row: 7 },
  checkpoint: { col: 105, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 266, row: 11 }   /* Dad's truck waits past the convertible */
});

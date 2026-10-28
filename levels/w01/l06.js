/* ============================================================
   LEVEL 1-6 · BUNNY PHOTO STUDIO  (World 1 · Saskatoon home · trail stop 7)
   Story bible (World 1 table): downtown, "Smile for the picture!",
   flash timing. Photo-Op Mom's studio has gone wild: the bunnies hop
   on the light rigs and the cameras fly.
   Idea (ONE): JUMP-THROUGH SHELVES (light rigs and backdrop rolls).
     Jump up through them from below, land on top, use them as bridges.
   Signature set-piece: THE GROUP-PHOTO RISERS (S4), three rows of
     shelves with a camera swooping between them and a heart on top.
   Acts (63 cols each): teach 0-62 (low rig, rig bridge over a 2-pit,
     rig ladder) · twist 63-125 (a bunny on the far side of a rig
     bridge, the risers, the photo booth) · test 126-188 (pits 4/5/3,
     each with a rig bridge, then the spring reward screen and the goal).
   Secrets: visible = the riser top heart (88,3) · hidden = the photo
     booth's overhang hides the golden candle block (121,10): drop off
     the booth, turn back, bump its underside · skill = spring + two
     rigs to the hat (177,2). All three reached by script (hop by hop).
   Bubble beats for ER-4 (not wired): c2 "Smile for the picture!" ·
     c80 "Everybody squeeze in for the group photo!" · c110 checkpoint:
     "Say CHEESE, birthday boy!" · c185 "Perfect. One more? ...KINAN!"
   ENGINE REQUESTS: a camera flash hazard (telegraphed "Smile!" flash;
     the cameras here only fly) · secret glint + prizes (ER-6).
   ============================================================ */
KinanLevels.register({
  id: '1-6', world: 1, slot: 7, kind: 'level',
  name: 'BUNNY PHOTO STUDIO',
  theme: 4,                 /* the Bunny Photo Studio look */
  cols: 189,
  heights: [
    /* S1 0-26 teach: low rig at c6-8, BROW c12-20 */ 192,192,192,192,192,192,192,192,192,192,192,192, 184,176, 176,176,176,176,176, 184,192, 192,192,192,192,192,192,
    /* S2 27-53 2-pit c32-33 under a rig bridge · podium MESA c38-46 · 3-pit c50-52 */ 192,192,192,192,192, null,null, 192,192,192,192, 176,160, 160,160,160,160,160, 176,192, 192,192,192, null,null,null, 192,
    /* S3 54-80 rig ladder c56-61 · 4-pit c67-70 under a rig bridge */ 192,192,192,192,192,192,192,192,192, 192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 the risers c83-94 · RIDGE c98-107 */ 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, 184,176,168,160, 160,160,160, 168,176,184,
    /* S5 108-134 the photo booth c113-121 · 4-pit c131-134 */ 192,192,192,192,192, 192,192,192,192,192,192,192, 192,192,192,192,192,192,192,192,192,192,192, null,null,null,null,
    /* S6 135-161 BROW · 5-pit c144-148 (rig bridge) · MESA · 3-pit c159-161 (rig bridge) */ 192,192,192, 184,176,176,184,192, 192, null,null,null,null,null, 192,192,192, 176,160,160,160,176,192, 192, null,null,null,
    /* S7 162-188 reward: spring + rigs to the hat, then the goal */ 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [[113, 10, 114, 11], [115, 8, 119, 11]],   /* the photo booth: a step, then the booth */
  fakeWall: [120, 121],     /* the booth's overhang (rows 8-10, open underneath): the golden candle block is in its bottom row */
  tiles: {
    gift: [[16, 7, 'popper'], [42, 6], [88, 3, 'heart'], [121, 10, 'gold'], [140, 7, 'heart'], [177, 2, 'hat']],
    spring: [[168, 11]],
    shelf: [[6, 9], [7, 9], [8, 9],                                         /* S1 the first rig (teach) */
            [31, 9], [32, 9], [33, 9], [34, 9],                             /* S2 rig bridge over the 2-pit */
            [56, 9], [57, 9], [58, 9], [59, 6], [60, 6], [61, 6],           /* S3 rig ladder (breath) */
            [67, 9], [68, 9], [69, 9], [70, 9],                             /* S3 rig bridge over the 4-pit */
            [83, 10], [84, 10], [85, 10], [86, 10], [87, 10], [88, 10], [89, 10], [90, 10], [91, 10], [92, 10], [93, 10], [94, 10],
            [85, 7], [86, 7], [87, 7], [88, 7], [89, 7], [90, 7], [91, 7], [92, 7],   /* S4 the group-photo risers */
            [144, 9], [145, 9], [146, 9], [147, 9], [148, 9],               /* S6 rig bridge over the 5-pit */
            [159, 9], [160, 9], [161, 9],                                   /* S6 rig bridge over the 3-pit */
            [171, 9], [172, 9], [173, 9], [175, 6], [176, 6], [177, 6], [178, 6]]   /* S7 the skill climb */
  },
  /* bunnies hop (timing); cameras fly. No foe stands on a rig over a pit. */
  foes: [[24, 11, 'bunny'], [42, 9, 'bunny'],
         [77, 11, 'bunny'],
         [96, 11, 'bunny'], [89, 5, 'camera'],
         [117, 7, 'bunny'], [116, 4, 'camera'],
         [137, 11, 'bunny'], [145, 6, 'camera'], [149, 11, 'bunny']],
  candles: [[3, 11], [4, 11], [6, 8], [7, 8], [8, 8], [21, 11], [22, 11],
            [32, 8], [33, 8], [50, 9], [51, 8], [52, 9],
            [59, 5], [60, 5], [61, 5], [67, 7], [68, 6], [69, 6], [70, 7],
            [84, 9], [86, 9], [92, 9], [94, 9], [86, 6], [88, 6], [90, 6], [92, 6],
            [131, 9], [132, 8], [133, 8], [134, 9],
            [144, 8], [146, 8], [148, 8], [159, 8], [160, 8], [161, 8],
            [166, 10], [167, 9], [168, 8], [168, 6], [172, 8], [175, 5], [176, 5], [178, 5], [180, 10], [181, 9], [182, 9], [183, 10]],
  secrets: [
    { kind: 'visible', col: 88, row: 3, prize: 'heart' },                          /* top of the risers */
    { kind: 'hidden', col: 121, row: 10, prize: 'GOLDEN CANDLE', glint240: true },  /* under the booth's overhang */
    { kind: 'skill', col: 177, row: 2, prize: 'hat' }                               /* spring + two rigs */
  ],
  goldenCandle: { col: 121, row: 10 },
  checkpoint: { col: 110, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 186, row: 11 }
});

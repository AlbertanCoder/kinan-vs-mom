/* ============================================================
   LEVEL 1-8 · BROADWAY AVENUE DINNER  (World 1 · trail stop 10)
   Story bible (World 1 table): patio tables and string lights. Night
   on the avenue, every patio is full, and the waiters are THROWING
   PLATES. The last regular level before Bedtime Castle.
   Idea: THE EXAM, nothing new. It mixes what World 1 taught: slopes
     (1-5), jump-through string lights (1-6), solid patio tables (1-7)
     and throwers (the fort's neighbour, now waiters and a busker).
   Signature set-piece: THE STRING-LIGHT SKYWALK (S5): bounce a spring
     up to a long run of string lights above the street, where the
     waiter's plates can't reach (an optional high road).
   Acts (72 cols each): teach 0-71 (table to light, a waiter on his
     patio, table hops) · twist 72-143 (busker's stage, light bridge,
     the skywalk) · test 144-215 (the cafe, pits 4/5/4 with a waiter
     on the hill, then the patio-party reward and the goal).
   Secrets: visible = high string light over the S4 pit, heart (101,3)
     · hidden = the cafe awning hides the golden candle block (146,10):
     drop off the cafe roof, turn back, bump its underside · skill =
     spring + two lights to the hat (203,2). All reached by script.
   Bubble beats for ER-4 (not wired): c2 "Broadway at dinnertime.
     Every patio is FULL." · c42 the waiter: "Table SIX needs water!"
     · c110 checkpoint: "Glitchy went THAT way. Past the dessert place."
     · c210 "One more stop: the Bessborough. And Mom."
   ENGINE REQUESTS: bubbles (ER-4) · secret glint + prizes (ER-6).
   ============================================================ */
KinanLevels.register({
  id: '1-8', world: 1, slot: 10, kind: 'level',
  name: 'BROADWAY AVENUE DINNER',
  theme: 29,                /* borrows the night-street look (storefronts, street lamps, balloons) */
  cols: 216,
  heights: [
    /* S1 0-26 teach: a patio table, a string light, a curb */ 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, 184,176,176,
    /* S2 27-53 3-pit c31-33 under a light · waiter's patio deck c37-43 · 3-pit c51-53 */ 176, 184,192, 192, null,null,null, 192,192,192, 176,176,176,176,176,176,176, 192, 192,192,192,192,192,192, null,null,null,
    /* S3 54-80 table hops up to the lights · 3-pit c71-73 */ 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null, 192,192,192,192,192,192,192,
    /* S4 81-107 the busker's stage MESA c84-89 · 4-pit c94-97 under a light bridge */ 192,192,192, 176,160,160,160,160,176,192, 192,192,192, null,null,null,null, 192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 the skywalk (lights c115-132 at row 5, spring at c112) */ 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 the cafe c138-146 · 4-pit c150-153 · BROW */ 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null,null, 192,192,192, 184,176,176,184,192,
    /* S7 162-188 5-pit c165-169 (light bridge) · the waiter's hill · 4-pit c184-187 */ 192,192,192, null,null,null,null,null, 192,192,192, 184,176,168,160, 160,160, 168,176,184,192, 192, null,null,null,null, 192,
    /* S8 189-215 reward: the patio party, spring + lights to the hat, the goal */ 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [8, 10, 10, 10],                        /* S1 the first patio table */
    [58, 9, 60, 9], [64, 9, 66, 9],         /* S3 two tables to hop */
    [119, 10, 121, 10], [126, 10, 128, 10], /* S5 tables under the skywalk */
    [138, 10, 139, 11], [140, 8, 144, 11]   /* S6 the cafe: a step, then the building */
  ],
  fakeWall: [145, 146],     /* the cafe awning (rows 8-10, open underneath): the golden candle block is in its bottom row */
  tiles: {
    gift: [[21, 8, 'popper'], [45, 7], [86, 6, 'cake'], [101, 3, 'heart'], [146, 10, 'gold'], [158, 8, 'heart'], [203, 2, 'hat']],
    spring: [[112, 11], [196, 11]],
    shelf: [[13, 7], [14, 7], [15, 7], [16, 7], [17, 7],                         /* S1 the first string light */
            [31, 8], [32, 8], [33, 8],                                           /* S2 light over the 3-pit */
            [61, 6], [62, 6], [63, 6], [67, 6], [68, 6], [69, 6], [70, 6], [71, 6],   /* S3 lights above the tables */
            [94, 9], [95, 9], [96, 9], [97, 9],                                  /* S4 light bridge over the 4-pit */
            [95, 6], [96, 6], [97, 6], [98, 6], [99, 6], [100, 6], [101, 6], [102, 6],   /* S4 the high light (visible secret) */
            [115, 5], [116, 5], [117, 5], [118, 5], [119, 5], [120, 5], [121, 5], [122, 5], [123, 5], [124, 5], [125, 5], [126, 5], [127, 5], [128, 5], [129, 5], [130, 5], [131, 5], [132, 5],   /* S5 THE SKYWALK */
            [165, 9], [166, 9], [167, 9], [168, 9], [169, 9],                    /* S7 light bridge over the 5-pit */
            [199, 8], [200, 8], [201, 8], [202, 5], [203, 5], [204, 5], [205, 5]]    /* S8 the skill climb */
  },
  /* waiters (and the busker) throw; raccoons and cones walk; one cupcake hops. Nothing stands on a light over a pit. */
  foes: [[18, 11, 'raccoon'],
         [42, 10, 'waiter'],
         [62, 11, 'cupcake'], [78, 11, 'cone'],
         [85, 9, 'busker'], [104, 11, 'raccoon'],
         [124, 11, 'waiter'], [123, 4, 'raccoon'],
         [136, 11, 'cone'], [155, 11, 'raccoon'],
         [177, 9, 'waiter'], [171, 11, 'raccoon']],
  candles: [[3, 11], [4, 11], [8, 9], [9, 9], [10, 9], [13, 6], [15, 6], [17, 6],
            [31, 7], [32, 7], [33, 7], [51, 9], [52, 8], [53, 9],
            [58, 8], [60, 8], [61, 5], [63, 5], [67, 5], [69, 5], [71, 5], [71, 9], [72, 8], [73, 9],
            [94, 8], [97, 8], [96, 5], [98, 5], [100, 5], [102, 5],
            [116, 4], [118, 4], [120, 4], [122, 4], [124, 4], [126, 4], [128, 4], [130, 4], [132, 4], [119, 9], [127, 9],
            [150, 9], [151, 8], [152, 8], [153, 9],
            [165, 8], [167, 8], [169, 8], [184, 9], [185, 8], [186, 8], [187, 9],
            [194, 10], [195, 9], [196, 8], [196, 6], [200, 7], [202, 4], [204, 4], [205, 4], [208, 10], [209, 9], [210, 9], [211, 10]],
  secrets: [
    { kind: 'visible', col: 101, row: 3, prize: 'heart' },                         /* the high string light */
    { kind: 'hidden', col: 146, row: 10, prize: 'GOLDEN CANDLE', glint240: true },  /* under the cafe awning */
    { kind: 'skill', col: 203, row: 2, prize: 'hat' }                               /* spring + two lights */
  ],
  goldenCandle: { col: 146, row: 10 },
  checkpoint: { col: 110, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 213, row: 11 }
});

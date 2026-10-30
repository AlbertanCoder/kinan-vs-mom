/* ============================================================
   LEVEL 3-5 · PUMPJACK PLAINS  (World 3 · Robin's oilfield · trail stop 5)
   Story bible (World 3 table): "Ride the nodding pumpjacks." Past
   Fort McMurray the gravel lease road runs through a farmer's field
   full of pumpjacks. Glitchy rode Robin's truck radio up here and
   zapped them: every pumpjack is nodding double time. Robin says stay
   in the truck. Kinan says the pumpjacks are the fastest way across.
   Idea (ONE): PUMPJACK HEADS. A pumpjack is a two-tall skid with its
     nodding head on top (a spring): hop on and it throws Kinan in a
     big arc. Act 1 teaches it (one head on open ground, then a head
     in front of an oil tank too tall to jump); act 2 is THE NODDING
     ROW, four pumpjacks with a tank behind each, ridden head to head;
     act 3 sets the heads in pumpjack pads (the lease road ramps up to
     them) right at the lips of 5-, 4- and 5-wide sump pits.
   Acts (thirds): 0-71 teach (the first head, tank 1, a 3-wide pit,
     the brow, the tall tank) · 72-143 twist (THE NODDING ROW, the
     checkpoint, the culvert, a 4-wide pit) · 144-215 test (a pad and
     head at a 5-wide pit, PUMPJACK HILL: pads and heads at 4- and
     5-wide pits, then the tank battery and Robin's truck).
   Signature set-piece: THE NODDING ROW (S4-S5): four pumpjacks nine
     tiles apart. Running, one head throws you onto the next (boing,
     boing, boing); walking, you land on the tank and drop onto the
     next head. Nothing under the row is a pit.
   Secrets: visible = THE LIGHT TOWER (S3): the head in front of the
     tall tank throws you straight up; steer BACK (left) while you fly
     to land on the light tower's lamp deck (heart + candles, 64,2) · hidden = THE CULVERT (S5) under the lease road:
     walk through it and hop; one block of its ceiling glints (GOLDEN
     CANDLE, 128,10) · skill = THE TANK BATTERY (S8): three tanks up on
     stands, each three tiles higher than the last; a full-height jump
     onto the first, then two running jumps (hat, 210,1).
   Look: borrows Pumpjack Plains (theme 14): pumpjacks nodding all
     along the horizon, tanks and light towers, green field, red bricks.
   Bubble beats for ER-4 (not wired): c2 Robin: "Stay in the truck,
     bud. ...Bud?" · c12 "They're saying YES to everything!" · c84
     Robin: "Don't climb on the pumpjacks. I'm serious. ...He's
     climbing on the pumpjacks." · c121 checkpoint, Robin: "Why did the
     pumpjack get a raise? It was always nodding along." · c126 "Check
     the culvert, bud. Things wash in there." · c212 Robin: "You're
     faster than the new guy."
   ENGINE REQUESTS: a real pumpjack (a horsehead that nods up and down
     on a beat and carries you; today a spring on a skid) and a
     pumpjack skin for the spring · sump-pond water drawn in the pits ·
     an oil-tank skin for the tall solid blocks · Robin's dad-joke
     pickup (one per level from World 3 on) · bubbles ER-4.
   ============================================================ */
KinanLevels.register({
  id: '3-5', world: 3, slot: 5, kind: 'level',
  name: 'PUMPJACK PLAINS',
  theme: 14,                /* Pumpjack Plains: nodding pumpjacks and tanks on the horizon, a green field */
  cols: 216,
  heights: [
    /* S1 0-26 the lease pad (Robin's truck) · THE FIRST HEAD (c12-14) on open ground */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 a head (c30-32) in front of TANK 1 (c33-36, 6 tall) · 3-wide sump pit c46-48 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,
    /* S3 54-80 the BROW (c56-63) · the light tower deck (c63-65) · a head (c67-69) in front of THE TALL TANK (c70-72, 9 tall) and its steps */
    192,192,184,176,176,176,176,176,176,184,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 THE NODDING ROW: heads c85-87, c94-96, c103-105, each with a tank behind it */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 the last head (c112-114) and the big tank · checkpoint · THE CULVERT (c125-131) · 4-wide pit c132-135 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,
    /* S6 135-161 test: the lease road ramps up to a pumpjack pad (c139-144), its head at the lip (c144) of a 5-wide sump pit c145-149 */
    null,192,192,192,184,176,168,160,160,160,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S7 162-188 PUMPJACK HILL: a pad (c163-167) and head (c167) over a 4-wide pit c168-171 · the second pad (c181-185) */
    192,184,176,168,160,160,null,null,null,null,192,192,192,192,192,192,192,192,192,184,176,168,160,160,null,null,null,
    /* S8 189-215 the 5-wide pit ends (c186-190) · reward: THE TANK BATTERY up on its stands (skill), Robin's truck */
    null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [12, 11, 14, 11],                     /* S1 the first pumpjack's skid */
    [30, 11, 32, 11], [33, 6, 36, 11], [37, 9, 37, 11],     /* S2 a skid, TANK 1 (6 tall) and a step down */
    [67, 11, 69, 11], [70, 3, 72, 11], [73, 6, 73, 11], [74, 9, 74, 11],   /* S3 a skid, THE TALL TANK (9 tall), two steps down */
    [85, 11, 87, 11], [88, 6, 90, 11],    /* S4 THE NODDING ROW: skid + tank */
    [94, 11, 96, 11], [97, 6, 99, 11],
    [103, 11, 105, 11], [106, 6, 108, 11],
    [112, 11, 114, 11], [115, 5, 117, 11], [118, 8, 118, 11], [119, 10, 119, 11],   /* S5 the last head, the big tank, steps down */
    [125, 9, 131, 10],                    /* S5 THE CULVERT: the lease road over it (a 1-tile tunnel underneath) */
    [198, 8, 201, 9], [203, 5, 206, 6], [208, 2, 211, 3]   /* S8 THE TANK BATTERY: three tanks up on stands (walk under them) */
  ],
  tiles: {
    gift: [[6, 8, 'popper'], [40, 8], [92, 4], [128, 10, 'gold'], [138, 8, 'heart'], [186, 8]],
    brick: [[5, 8], [7, 8], [91, 4], [93, 4], [137, 8], [139, 8]],
    spring: [[12, 10], [13, 10], [14, 10],          /* the pumpjack heads (they nod: BOING) */
             [30, 10], [31, 10], [32, 10],
             [67, 10], [68, 10], [69, 10],
             [85, 10], [86, 10], [87, 10], [94, 10], [95, 10], [96, 10], [103, 10], [104, 10], [105, 10], [112, 10], [113, 10], [114, 10],
             [144, 10], [167, 10], [185, 10]],    /* act 3: heads set in the pumpjack pads, right at the lip */
    shelf: [[63, 3], [64, 3], [65, 3]]   /* S3 the light tower's lamp deck (visible secret) */
  },
  /* no pipes: the wellheads beside the pumpjacks were see-through decoration; as solid risers (2026-10-29) they stood in
     the run-up to every head and broke the level's one idea (Shad: "I don't even know why this green pipe [is there]") */
  /* gophers hop out of the field, cones walk the lease, mud blobs split when stomped, crows fly. Nothing waits on a head. */
  talk: [   /* Dad's jokes, the wheeze-laugh, Mom's reactions (tools/dad-lines.mjs) */
    [30, "DAD", "Why did the pumpjack go to the... hee... HAHA... the... oh boy... the... I can't—", 4, "wheeze"],
    [30, "KINAN", "...to the doctor? It wasn't feeling well. Get it? WELL? ...Oh no. I'm turning into you.", 4]
  ],
  foes: [[25, 11, 'gopher'],
         [52, 11, 'cone'],
         [60, 10, 'gopher'],
         [92, 11, 'mud'], [101, 11, 'mud'],
         [110, 11, 'mud'], [129, 6, 'crow'],
         [137, 11, 'cone'], [156, 11, 'gopher'], [158, 7, 'crow'],
         [175, 11, 'mud'], [179, 7, 'crow'],
         [191, 11, 'gopher'], [207, 11, 'cone']],
  candles: [[3, 11], [4, 11], [9, 11], [10, 11],
            [14, 6], [15, 4], [16, 2], [17, 1], [19, 1], [20, 2], [21, 4], [22, 7],
            [34, 5], [35, 5], [40, 11], [41, 11], [45, 9], [46, 8], [47, 8], [48, 9],
            [57, 9], [59, 8], [61, 8], [62, 9], [68, 6], [68, 4], [70, 2], [72, 2], [63, 2], [65, 2], [76, 11], [77, 11],
            [88, 3], [89, 2], [90, 2], [91, 3], [97, 3], [98, 2], [99, 2], [100, 3], [106, 3], [107, 2], [108, 2], [109, 3],
            [116, 4], [117, 4], [121, 9], [126, 11], [127, 11], [129, 11], [130, 11], [131, 11], [132, 9], [133, 8], [134, 8], [135, 9],
            [140, 9], [141, 8], [145, 6], [146, 4], [147, 2], [148, 1], [150, 1], [151, 2], [152, 4], [153, 7],
            [164, 9], [165, 8], [168, 6], [169, 4], [170, 2], [171, 1], [173, 1], [174, 2], [175, 4], [176, 7],
            [182, 9], [183, 8], [186, 6], [187, 4], [188, 2], [189, 1], [191, 1], [192, 2], [193, 4], [194, 7],
            [199, 7], [200, 7], [204, 4], [205, 4], [209, 1], [211, 1], [214, 11]],
  secrets: [
    { kind: 'visible', col: 64, row: 2, prize: 'heart+candles' },                  /* the light tower's lamp deck: steer back onto it */
    { kind: 'hidden', col: 128, row: 10, prize: 'GOLDEN CANDLE', glint240: true }, /* the culvert's ceiling under the lease road */
    { kind: 'skill', col: 210, row: 1, prize: 'hat' }                              /* the top of the tank battery */
  ],
  goldenCandle: { col: 128, row: 10 },
  checkpoint: { col: 121, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 213, row: 11 }             /* Robin's truck */
});

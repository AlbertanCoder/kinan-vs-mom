/* ============================================================
   LEVEL 3-8 · THE BIG DIG  (World 3 · Robin's oilfield · trail stop 10)
   Story bible (World 3 table): "Giant haul trucks in the oil sands
   mine. Secret exit down a mine shaft." The lease road ends at the
   rim of the open-pit mine: benches stepping down into the pit, haul
   trucks with tires twice as tall as Robin, a shovel the size of a
   house. Glitchy's trail goes down the haul road and out the far
   side, toward Robin's rig and the Safety Foreman.
   Idea: THE EXAM, nothing new. It mixes what World 3 taught: nodding
     heads (3-5) as the haul trucks' bouncy tires, suction hoses (3-6)
     as the mine's dewatering hoses, rack decks (3-7) as the conveyor,
     and the fort's mosquito clouds, plus World 1's slopes: the haul
     road down into the pit and the benches back up to the rim.
   Acts (thirds): 0-80 teach (the rim, THE HAUL ROAD down, haul truck
     1 and its tire, a 3-wide sump, THE SHOVEL, a 3-wide sump, a
     dewatering hose up bench A) · 81-161 twist (the conveyor over a
     4-wide pit, the checkpoint, THE OLD SHAFT, haul truck 2 and a
     4-wide pit) · 162-242 test (a hose up bench B, a 5-wide gap
     between the benches, the rim, the 4-wide crack, the rim lookout).
   Signature set-piece: THE HAUL ROAD + THE SHOVEL (S1-S2): run down
     the long haul road, bounce a haul truck's tire onto its dump box,
     then climb the shovel's tracks and over its house.
   Secrets: visible = THE SHOVEL'S BUCKET (S2): climb the boom, two
     steps up, to the bucket at its tip (heart + candles, 52,1) ·
     hidden = THE OLD SHAFT (S5): an old mine shaft with a headframe
     sinks through the bench; drop down it into the dark room below,
     bump the glinting block in its ceiling (GOLDEN CANDLE) and a door
     opens: the SECRET EXIT to 3-secret, down to the Athabasca River
     (the 1-7 / 2-7 pattern). Crawl out the low hole on the right to
     carry on instead · skill = THE CRACK (S8): something shines in the
     4-wide crack across the rim; WALK off the edge (running carries
     you past it) onto the little ledge three tiles down inside it,
     then jump back out (hat, 201,9).
   Look: borrows the Big Dig (theme 17): yellow excavators, a pumpjack
     and a sandy pit under an orange sky; brown bricks.
   Bubble beats for ER-4 (not wired): c2 Robin: "Stay back from the
     edge, bud." · c20 "Those tires are taller than YOU, Dad." "Taller
     than me AND your mom." · c110 checkpoint, Robin: "What did the
     haul truck say to the shovel? You really dig me." · c117 "An old
     mine shaft. I wonder where it goes..." · c239 "The rig. And the
     Safety Foreman. Here we go."
   ENGINE REQUESTS: a haul-truck prop (giant tires, dump box, cab
     ladder) and a bouncy-tire skin for the spring · the shovel prop
     with a bucket · a dark-room look for the old shaft's chamber · the
     secret exit door drawn as a mine-cage gate · dewatering-hose skin
     · Robin's dad-joke pickup · bubbles ER-4.
   ============================================================ */
KinanLevels.register({
  id: '3-8', world: 3, slot: 10, kind: 'level',
  name: 'THE BIG DIG',
  theme: 17,                /* the Big Dig: excavators and a pumpjack in a sandy pit under an orange sky */
  cols: 243,
  heights: [
    /* S1 0-26 the rim (c0-9) · THE HAUL ROAD down (c10-17) · haul truck 1 (tire c19-20, dump box c21-26) */
    128,128,128,128,128,128,128,128,128,128,136,144,152,160,168,176,184,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 a 3-wide sump c36-38 · THE SHOVEL (tracks c40-41, house c42-46, boom and bucket c47-53) */
    192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 a 3-wide sump c58-60 · a dewatering hose (c66-68) up BENCH A (c69-86, 5 tall) */
    192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 off bench A · THE CONVEYOR (c89-102) over a 4-wide pit c92-95, its floor lane ends at a valve */
    192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 checkpoint · THE OLD SHAFT: the bench (c112-123), the shaft (c117-118), the room below and its crawl hole */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 haul truck 2 (tire c140-141, dump box c142-148) · a 4-wide pit c151-154 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,
    /* S7 162-188 a dewatering hose (c165-167) up BENCH B (c168-175) · a 5-wide gap c176-180 · BENCH C and the rim */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,176,160,144,128,112,112,112,
    /* S8 189-215 the rim · THE CRACK c200-203 (4 wide, a little ledge inside) */
    112,112,112,112,112,112,112,112,112,112,112,null,null,null,null,112,112,112,112,112,112,112,112,112,112,112,112,
    /* S9 216-242 reward: the rim lookout over the mine (Robin's rig on the horizon) */
    112,112,112,112,112,112,112,112,112,112,112,112,112,112,112,112,112,112,112,112,112,112,112,112,112,112,112
  ],
  solid: [
    [19, 11, 20, 11], [21, 5, 26, 11],    /* S1 haul truck 1: its tire base and the dump box (7 tall) */
    [40, 9, 41, 11], [42, 6, 46, 11], [47, 9, 48, 11],   /* S2 THE SHOVEL: tracks, house (6 tall), tracks */
    [66, 3, 66, 9],                       /* S3 the dewatering hose (walk in under its nozzle) */
    [69, 7, 86, 11], [87, 10, 87, 11],    /* S3-S4 BENCH A (5 tall) and a step down */
    [97, 9, 98, 11],                      /* S4 the conveyor's valve: its floor lane ends here */
    [110, 10, 111, 11],                   /* S5 a step up onto the shaft bench */
    [112, 7, 116, 8], [119, 7, 123, 8],   /*    the bench top, with THE OLD SHAFT (c117-118) sunk through it */
    [112, 9, 112, 11], [123, 9, 123, 10], /*    the room's walls: a low crawl hole out at the bottom right */
    [125, 10, 125, 11],                   /*    a step down */
    [140, 11, 141, 11], [142, 5, 148, 11],   /* S6 haul truck 2: tire base and dump box */
    [165, 3, 165, 9],                     /* S7 the second dewatering hose */
    [168, 7, 175, 11],                    /*    BENCH B (5 tall) */
    [181, 7, 185, 11],                    /*    BENCH C's face (the rim beyond it) */
    [184, 6, 184, 6], [192, 6, 192, 6],   /* S8 two boulders on the rim: the mud blob stays between them */
    [200, 10, 201, 10]                    /*    the little ledge inside THE CRACK, three tiles down (skill) */
  ],
  tiles: {
    gift: [[5, 4, 'popper'], [33, 8], [120, 8, 'gold'], [137, 8, 'heart'], [196, 3], [220, 3, 'heart'], [228, 3], [230, 3], [232, 3]],
    brick: [[34, 8], [32, 8], [229, 3], [231, 3]],
    spring: [[19, 10], [20, 10],          /* haul truck 1's bouncy tire */
             [67, 12], [68, 12],          /* the first dewatering hose */
             [140, 10], [141, 10],        /* haul truck 2's tire */
             [166, 12], [167, 12]],       /* the second dewatering hose */
    shelf: [[47, 4], [48, 4], [50, 2], [51, 2], [52, 2],   /* S2 the shovel's boom and its bucket (visible secret) */
            [89, 8], [90, 8], [91, 8], [92, 8], [93, 8], [94, 8], [95, 8], [96, 8], [97, 8], [98, 8], [99, 8], [100, 8], [101, 8], [102, 8],   /* S4 THE CONVEYOR */
            [116, 4], [117, 4], [118, 4], [119, 4]]       /* S5 the old shaft's headframe */
  },
  pipes: [[64, 11], [163, 11], [117, 3]],   /* dewatering pumps, and the headframe's sheave */
  /* safety cones walk the haul roads, mud blobs split, mosquitoes hang over the pit; nothing waits at a hose or a landing */
  foes: [[14, 10, 'cone'],
         [51, 11, 'mud'],
         [78, 6, 'mud'],
         [100, 7, 'mud'], [105, 11, 'cone'],
         [129, 11, 'cone'], [132, 9, 'mosquito'],
         [158, 9, 'mosquito'], [137, 11, 'mud'],
         [188, 6, 'mud'],
         [196, 1, 'crow'], [209, 6, 'cone'],
         [214, 1, 'crow'], [226, 6, 'cone'], [236, 6, 'mud']],
  candles: [[3, 7], [4, 7], [8, 7], [11, 8], [12, 8], [13, 9], [14, 9], [15, 10], [16, 10], [19, 8], [19, 6], [22, 4], [24, 4], [26, 4],
            [29, 11], [30, 11], [35, 10], [36, 9], [37, 8], [38, 9], [39, 10], [40, 8], [43, 5], [45, 5], [47, 3], [48, 3], [50, 1], [51, 1],
            [57, 10], [58, 9], [59, 8], [60, 9], [61, 10], [67, 10], [67, 8], [68, 6], [71, 6], [73, 6], [75, 6], [80, 6], [82, 6], [84, 6],
            [89, 7], [91, 7], [93, 7], [95, 7], [91, 11], [92, 10], [93, 9], [94, 9], [95, 10], [99, 7], [101, 7],
            [113, 6], [115, 6], [116, 3], [119, 3], [114, 11], [115, 11], [116, 11], [117, 11], [118, 11], [121, 6], [122, 6], [127, 11],
            [139, 8], [140, 6], [143, 4], [145, 4], [147, 4], [150, 9], [151, 8], [152, 7], [153, 7], [154, 8], [155, 9],
            [166, 10], [166, 8], [167, 6], [170, 6], [172, 6], [174, 6], [176, 5], [177, 4], [178, 3], [179, 3], [180, 4], [181, 5],
            [186, 5], [190, 5], [194, 6], [199, 5], [200, 4], [201, 4], [202, 4], [203, 5], [200, 9],
            [218, 6], [219, 6], [224, 6], [225, 6], [234, 6], [235, 6], [237, 6], [238, 6], [240, 6]],
  secrets: [
    { kind: 'visible', col: 52, row: 1, prize: 'heart+candles' },                  /* the shovel's bucket at the tip of its boom */
    { kind: 'hidden', col: 120, row: 8, prize: 'GOLDEN CANDLE + the secret exit', glint240: true, exit: '3-secret' },   /* down the old shaft */
    { kind: 'skill', col: 201, row: 9, prize: 'hat' }                              /* the ledge inside the crack */
  ],
  goldenCandle: { col: 120, row: 8 },
  checkpoint: { col: 108, row: 11 },
  spawn: { col: 2, row: 7 },
  goal: { col: 239, row: 6 }              /* the rim lookout */
});

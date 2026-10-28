/* ============================================================
   LEVEL 3-3 · CAMP BREAKFAST
   (World 3 · Robin's oilfield trip · trail stop 3)
   Story bible (World 3 table): "Work-camp kitchen chaos. Hunter is
   rescued." Robin's work camp at five in the morning: rows of white
   trailers, a giant cookhouse, mud, and mosquitoes the size of
   sparrows. Glitchy beeped through the camp radio and the kitchen
   went wild: the cooks are flinging breakfast across the room.
   Idea (ONE): FLYING BREAKFAST. The camp cooks throw plates in a high
     arc at the spot where Kinan IS, so the plate lands where he WAS:
     keep moving (or jump on the cook). Act 1 teaches it with one cook
     on a low porch over a wide, safe yard. Act 2 twists it: the head
     cook throws DOWN from the pass window onto the serving line, a
     cook at the end of the dining hall throws over the tables (go on
     top or underneath), and one guards the walk-in freezer while you
     climb the pantry. Act 3 tests it: cooks throw while you jump mud
     pits 5 and 4 wide, then the back porch.
   Acts (81 cols each): teach 0-80 (the bunkhouse, a 2-wide puddle, THE
     BARBECUE PORCH cook, the laundry trailer, a 3-wide mud pit) ·
     twist 81-161 (4-wide mud, THE SERVING LINE, the checkpoint, THE
     DINING HALL, the stoves, the dish rack, the pantry and the
     freezer) · test 162-242 (the satellite dish, mud 5 wide under a
     cook's porch, mud 4 wide, THE BACK PORCH, then Robin's truck).
   Signature set-piece: THE DINING HALL (S5): two long tables, run on
     top with the candles or underneath with the eggs, while the cook
     at the far end throws plates over everything.
   Secrets: visible = the camp satellite dish: a running leap from
     the freezer roof (heart + candles, 169,2) · hidden = HUNTER'S
     HIDEOUT: go over the back porch, drop off its far end, turn round,
     crawl back under it (row 11) and push into the glinting board by
     the step (GOLDEN CANDLE, 197,11): a shy
     black-and-white dog has been hiding there all morning · skill =
     THE DISH RACK: three 2-wide racks that zig-zag up from the stove
     top, the last one back to the left (hat, 142,2).
   Look: borrows the Camp Breakfast look (theme 12): rows of white
     trailers, street lamps and spruce trees.
   Bubble beats for ER-4 (not wired): c2 Robin: "Rise and shine, bud.
     It's five a.m. Camp life." · c44 the barbecue cook: "Order up!"
     (the plate is the order) · c104 the head cook: "NO RUNNING IN MY
     KITCHEN!" · c110 checkpoint, Robin: "Grab a tray. Or dodge one." ·
     c197 (the crawl space) "There's someone under here... a DOG!"
     Hunter joins the team (shy, black and white) · c239 Robin: "Did
     you eat?" Kinan: "Four pancakes and a mosquito." Robin's joke
     (World 3 joke book): "What do you call a sleeping bull? A
     bulldozer."
   ENGINE REQUESTS: HUNTER'S RESCUE: a pet crate in an authored level
     (ER-5) at the end of the crawl space (c197, row 11), so Hunter
     joins when you reach him · camp-cook skins for the thrower
     ('waiter' stands in) throwing pancakes instead of plates · a
     coffee-cart skin ('cart') · a dish-rack skin for the 2-wide
     shelves · walk-through screen doors on the cookhouse.
   ============================================================ */
KinanLevels.register({
  id: '3-3', world: 3, slot: 3, kind: 'level',
  name: 'CAMP BREAKFAST',
  theme: 12,                /* the Camp Breakfast look: white trailers, lamps, spruce */
  cols: 243,
  heights: [
    /* S1 0-26 puddle c24-25 · S2 27-53 · S3 54-80 mud c73-75 · S4 81-107 mud c82-85 · S5 108-134 · S6 135-161 ·
       S7 162-188 mud c174-178, c190-193 · S8 189-215 · S9 216-242 pit c225-227 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,192,
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,
    192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,
    192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [8, 9, 15, 11],   /* S1 Robin's bunkhouse trailer (3 tall) */
    [42, 10, 46, 11],   /* S2 the barbecue porch (the cook stands on it) */
    [57, 9, 64, 11],   /* S3 the laundry trailer (3 tall) */
    [88, 10, 102, 11],   /* S4 the steam-table counter (2 tall), right up to the pass window */
    [103, 7, 106, 11],   /* S4 the pass window (the head cook throws from on top) */
    [113, 9, 120, 9],   /* S5 dining table 1 (run under it) */
    [124, 9, 131, 9],   /* S5 dining table 2 */
    [138, 10, 141, 11],   /* S6 stove 1 */
    [146, 10, 149, 11],   /* S6 stove 2 */
    [154, 6, 163, 11],   /* S6 the walk-in freezer (6 tall: over it via the pantry) */
    [183, 10, 187, 11],   /* S7 the dish trailer porch (a cook), with a 4-tile landing before it */
    [196, 11, 196, 11],   /* S8 the back step (it closes the near end of the crawl space) */
    [197, 10, 207, 10]    /* S8 the back porch deck (Hunter's crawl space is row 11 under it, open on the right) */
  ],
  tiles: {
    gift: [
      [5, 8, 'candle'], [49, 8, 'popper'], [61, 6, 'candle'], [91, 7, 'candle'], [117, 6, 'heart'], [139, 7, 'candle'],
      [158, 3, 'candle'], [201, 7, 'candle'], [197, 11, 'gold'], [221, 8, 'heart'], [232, 8, 'cake']
    ],
    shelf: [
      [42, 7], [43, 7], [44, 7], [45, 7], [46, 7], [95, 7], [96, 7], [97, 7], [98, 7], [99, 7], [142, 7], [143, 7], [145, 5], [146, 5],
      [142, 3], [143, 3], [150, 9], [151, 9], [152, 9], [153, 9], [150, 6], [151, 6], [152, 6], [153, 6], [168, 3], [169, 3], [170, 3]
    ]
  },
  /* cooks ('waiter') throw breakfast in an arc, toast hops out of the toasters, eggs wander, the coffee cart rolls,
     the wet-floor sign hops after you, mosquitoes patrol outside */
  foes: [
      [19, 7, 'mosquito'], [44, 9, 'waiter'], [61, 8, 'toast'], [94, 9, 'cart'], [104, 6, 'waiter'], [117, 11, 'egg'],
      [133, 11, 'waiter'], [144, 11, 'toast'], [160, 5, 'waiter'], [170, 10, 'mosquito'], [185, 9, 'waiter'], [203, 9, 'waiter'],
      [212, 11, 'wetsign'], [236, 11, 'egg']
  ],
  candles: [
      [3, 11], [4, 11], [9, 8], [11, 8], [13, 8], [15, 8], [23, 9], [24, 8], [25, 8], [26, 9], [29, 11], [31, 11], [33, 11], [35, 11],
      [37, 11], [39, 11], [43, 6], [45, 6], [50, 11], [52, 11], [58, 8], [60, 8], [63, 8], [72, 9], [73, 8], [74, 8], [75, 8], [76, 9],
      [78, 11], [79, 11], [82, 9], [83, 8], [84, 8], [85, 9], [89, 9], [92, 9], [96, 6], [98, 6], [100, 9], [104, 5], [106, 5], [111, 11],
      [114, 8], [116, 8], [118, 8], [114, 11], [115, 11], [120, 11], [121, 11], [125, 8], [127, 8], [129, 8], [131, 8], [139, 9], [141, 9], [142, 6],
      [145, 4], [143, 2], [150, 8], [152, 8], [151, 5], [153, 5], [156, 5], [159, 5], [162, 5], [165, 11], [166, 11], [168, 2], [170, 2], [173, 10],
      [174, 9], [175, 8], [176, 8], [177, 8], [178, 9], [180, 11], [181, 11], [184, 9], [186, 9], [189, 10], [190, 9], [191, 8], [192, 8], [193, 9],
      [199, 11], [200, 11], [201, 11], [202, 11], [203, 11], [204, 11], [198, 9], [200, 9], [205, 9], [209, 11], [214, 11], [218, 11], [219, 11], [224, 10],
      [225, 9], [226, 9], [227, 9], [228, 10], [235, 11], [238, 11], [239, 11]
  ],
  secrets: [
    { kind: 'visible', col: 169, row: 2, prize: 'heart+candles' },                 /* the satellite dish: a running leap from the freezer roof */
    { kind: 'hidden', col: 197, row: 11, prize: 'GOLDEN CANDLE', glint240: true }, /* HUNTER'S HIDEOUT: the far end of the crawl space under the back porch */
    { kind: 'skill', col: 142, row: 2, prize: 'hat' }                              /* the dish rack: zig-zag up the three racks */
  ],
  goldenCandle: { col: 197, row: 11 },
  checkpoint: { col: 110, row: 11 },
  spawn: { col: 2, row: 11 },
  pet: { id: 'dog2', col: 209, row: 11 },  /* Hunter, rescued at camp: his crate at the mouth of the crawl space under the back porch, where Kinan drops off it */
  goal: { col: 239, row: 11 }             /* Robin's truck at the camp gate */
});

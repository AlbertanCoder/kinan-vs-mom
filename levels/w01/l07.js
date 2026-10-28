/* ============================================================
   LEVEL 1-7 · CHENOA'S ART ROOM (REMAI MODERN)  (World 1 · trail stop 8)
   Story bible (World 1 table): paint platforms in the gallery; a
   secret exit behind a painting. Big sis Chenoa's art class took over
   the gallery: paint blobs hop, brushes fly, canvases float.
   Idea (ONE): FLOATING CANVASES (solid). Land on top, bonk underneath
     (gifts hide in their bottoms), hop stepping-stone canvases in the
     paint spills.
   Signature set-piece: THE GALLERY STAIRCASE (S4), three canvases
     climbing to a heart, with a brush sweeping across.
   Acts: teach 0-62 (two canvases, the plinth, a row of gift blocks) ·
     twist 63-125 (stepping-stone canvas in a 4-spill, the staircase,
     the painting room) · test 126-188 (a 5-spill with a stone, a 4-pit
     under a brush, then the spring + paint-hop chain and the goal).
   Secrets: visible = staircase heart (93,2) · hidden = THE PAINTING
     ROOM: the 2-wide painting at c115-116 is a fake wall; the room
     behind it holds the golden candle block (118,7) and is where the
     SECRET EXIT to 1-secret belongs. Today you get in through the low
     crawl gap in its back wall (c120-121, row 10) · skill = spring +
     three small canvases to the hat (179,2). All reached by script.
   Bubble beats for ER-4 (not wired): c2 "Chenoa is icing something.
     The door is locked." · c60 "Don't touch the art! ...Okay, touch
     THAT art." · c111 checkpoint · c120 (near the painting) "That
     painting looks... draughty."
   ENGINE REQUESTS: secret exit (walk through the painting, clear 1-7
     the secret way, unlock 1-secret on the map; the hidden secret
     carries exit: '1-secret' as a marker) · walk-through fake walls +
     glint (ER-6) · draw this fake wall as a framed painting.
   ============================================================ */
KinanLevels.register({
  id: '1-7', world: 1, slot: 8, kind: 'level',
  name: "CHENOA'S ART ROOM (REMAI MODERN)",
  theme: 6,                 /* Chenoa's Art Room look */
  cols: 189,
  heights: [
    /* S1 0-26 teach: canvases c6-12 · BROW · 2-pit c22-23 */ 192,192,192,192,192,192,192,192,192,192,192,192,192, 184,176, 176,176,176, 184,192, 192,192, null,null, 192,192,192,
    /* S2 27-53 3-pit c32-34 · plinth c38-42 · gift row c45-47 · BROW */ 192,192,192,192,192, null,null,null, 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, 192,184,176,176,
    /* S3 54-80 breath canvases · 4-spill c66-69 with a stone · RIDGE */ 184,192,192,192,192,192,192,192,192,192,192,192, null,null,null,null, 192,192,192, 184,176,168,160, 160,160, 168,176,
    /* S4 81-107 the gallery staircase · 4-pit c104-107 under a bench */ 184,192, 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null,null,
    /* S5 108-134 raised floor + the painting room c113-121 · BROW */ 192,192, 176,176,176,176,176,176,176,176,176,176,176,176,176,176,176, 192, 192,192, 184,176,176,184, 192,192,192,
    /* S6 135-161 5-spill c138-142 with a stone · 4-pit c151-154 · BROW */ 192,192,192, null,null,null,null,null, 192,192,192,192,192,192,192,192, null,null,null,null, 192, 184,176,176,176,184,192,
    /* S7 162-188 reward: spring + paint-hop chain, then the goal */ 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [6, 9, 8, 9], [10, 7, 12, 7],                       /* S1 the first two canvases */
    [38, 10, 39, 11], [40, 9, 42, 11],                  /* S2 the sculpture plinth (a 2-step) */
    [56, 9, 58, 9], [60, 6, 62, 6],                     /* S3 breath canvases */
    [67, 11, 68, 11],                                   /* S3 the stepping-stone canvas in the paint spill */
    [83, 9, 85, 9], [87, 7, 89, 7], [91, 5, 94, 5],     /* S4 the gallery staircase */
    [113, 9, 114, 10],                                  /* S5 step up onto the painting room */
    [115, 7, 121, 7], [120, 8, 121, 9],                 /* S5 the painting room: roof + back wall (crawl gap at row 10) */
    [139, 11, 141, 11],                                 /* S6 the stone in the big spill */
    [170, 9, 171, 9], [174, 7, 175, 7], [178, 5, 179, 5]   /* S7 the paint-hop chain */
  ],
  fakeWall: [115, 116],     /* THE PAINTING: the way into the room once fake walls open (ER-6) */
  tiles: {
    shelf: [[104, 9], [105, 9], [106, 9], [107, 9]],    /* a gallery bench over the S4 pit (catches a jump off the staircase) */
    gift: [[7, 9, 'popper'], [45, 8], [46, 8], [47, 8], [93, 2, 'heart'], [118, 7, 'gold'], [158, 7, 'heart'], [179, 2, 'hat']],
    spring: [[166, 11]]
  },
  /* paint blobs hop, brushes fly. Nothing stands at a stepping stone or a bench. */
  foes: [[11, 6, 'paint'],
         [41, 8, 'paint'],
         [77, 9, 'paint'], [69, 6, 'brush'],
         [90, 11, 'paint'], [92, 6, 'brush'],
         [133, 11, 'paint'], [130, 7, 'brush'],
         [140, 7, 'brush'], [158, 10, 'paint'], [153, 7, 'brush']],
  candles: [[3, 11], [4, 11], [6, 8], [7, 8], [8, 8], [10, 6], [11, 6], [12, 6], [20, 11], [21, 11],
            [32, 9], [33, 8], [34, 9], [40, 8], [42, 8], [50, 10], [51, 9], [52, 9],
            [56, 8], [57, 8], [58, 8], [60, 5], [61, 5], [62, 5], [66, 9], [67, 10], [68, 10], [69, 9],
            [83, 8], [85, 8], [87, 6], [89, 6], [92, 4], [94, 4], [96, 6], [98, 8], [104, 8], [105, 7], [106, 7], [107, 8],
            [128, 9], [129, 8], [130, 8], [131, 9],
            [139, 10], [140, 9], [141, 10], [151, 9], [152, 8], [153, 8], [154, 9], [146, 11], [147, 11],
            [166, 9], [166, 7], [170, 8], [171, 8], [174, 6], [175, 6], [178, 4], [181, 10], [182, 9], [183, 10]],
  secrets: [
    { kind: 'visible', col: 93, row: 2, prize: 'heart' },                          /* top of the gallery staircase */
    { kind: 'hidden', col: 118, row: 7, prize: 'GOLDEN CANDLE + the secret exit', glint240: true, exit: '1-secret' },   /* behind the painting */
    { kind: 'skill', col: 179, row: 2, prize: 'hat' }                               /* spring + three small canvases */
  ],
  goldenCandle: { col: 118, row: 7 },
  checkpoint: { col: 111, row: 10 },
  spawn: { col: 2, row: 11 },
  goal: { col: 186, row: 11 }
});

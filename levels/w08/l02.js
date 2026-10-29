/* ============================================================
   LEVEL 8-2 · THE SUBWAY RUSH
   (World 8 · Toronto · trail stop 2)
   Story bible (World 8 table): "Hop between subway cars." The raccoon
   with Glitchy's shiny parcel jumps down into the subway at Union
   Station and rides away ON THE ROOF of a train. Kinan follows it,
   car to car. (In the game only! Never for real.)
   Idea (ONE): THE TUNNEL. The train runs underground most of the way,
     and in the tunnel the roof is right over your head: you only get a
     short hop before you bump it, so the gaps between the cars are
     small in there and you jump them LOW and FAST. Out in the open,
     on the Bloor Viaduct high over the Don Valley, the gaps are wide
     and you jump them high. Act 1 teaches it (the station, two cars in
     the open, then the first tunnel with 2-wide couplings); act 2
     twists it (3-wide couplings in the dark, the viaduct's 4s in the
     open, the lower deck UNDER the road with a low cable); act 3 tests
     it (the second tunnel 3/3/3, then out into the open for 5/5/4).
   Acts (thirds): 0-96 teach (UNION STATION, out of the station 3/2,
     the first tunnel 2/2 and THE GHOST STATION SIGN, 3) · 97-193
     twist (the checkpoint car, the viaduct 4/4 and THE VIADUCT LAMP,
     under the road deck 3/2, the second tunnel 3/3/3) · 194-290 test
     (3, out into the open 5, THE SIGNAL GANTRY, 5/4, the platform).
   Signature set-piece: THE BLOOR VIADUCT (S5-S6): out of the dark onto
     the bridge over the valley, two 4-wide couplings with the whole
     city around you, then the train runs on under the road deck.
   Secrets: visible = THE VIADUCT LAMP (S5): a lamp ledge hangs over the
     second viaduct coupling; jump UP onto it from the car roof (heart +
     candles, 125,6) · hidden = THE GHOST STATION SIGN (S3): an old tile
     sign from the station nobody uses (Lower Bay) glints in the tunnel
     roof; jump under it (GOLDEN CANDLE, 67,5; two candles point up) ·
     skill = THE SIGNAL GANTRY (S9): bounce off the roof spring and
     steer onto the signal gantry high over the track (hat, 230,1).
   Gaps: act 1 2/3/2/2/2/3 · act 2 4/4/3/2/3/3/3 · act 3 3/5/5/4. In a
     tunnel or under the road deck (4 tiles of air) a coupling is never
     wider than 3; every coupling has a candle arc; nothing waits at a
     lip. The overhead signs (stay low) and the low cables (jump them)
     are World 7's signs, each 4+ tiles from any coupling. The
     checkpoint car (c198) is right before act 3's wide gaps.
   TWIST (wired): rush (the city rushes past behind), trainCars and
     subway (the car sides are silver with a red stripe), signs, tunnel
     roofs (solid). Raccoons snatch candles (World 8).
   Look: the Subway (theme 101, World 8's own look): the dark tunnel
     wall rushing past (concrete ribs, cables, lamps going by, a train
     the other way); on the viaduct (c135-161, faded in over 8 columns
     each side) the open sky, the skyline and the Don Valley far below.
   ENGINE REQUESTS: tile skins for the tunnel roofs and the viaduct's
     road deck.
   ============================================================ */
KinanLevels.register({
  id: '8-2', world: 8, slot: 2, kind: 'level',
  name: 'THE SUBWAY RUSH',
  theme: 101,   /* the Subway: the tunnel rushing past; the Don Valley under the viaduct */
  cols: 291,
  snatch: true,   /* World 8: raccoons grab a candle and run */
  rush: true,   /* the moving train: the city rushes past behind (the roofs stay the ground) */
  subway: true,   /* World 8: silver cars with a red stripe */
  trainCars: [[14, 269]],   /* car sides under every flat roof between the couplings (looks only) */
  signs: [[8, 'duck'], [38, 'jump'], [100, 'duck'], [148, 'jump']],   /* the UNION sign over the platform, a roof cable, a tunnel sign, a cable under the road deck */
  heights: [
    /* S1 0-26 UNION STATION: the platform, up the stairs (c12-13) onto car 1, a 2-wide coupling c22-23 */
    192,192,192,192,192,192,192,192,192,192,192,192,176,160,160,160,160,160,160,160,160,160,null,null,160,160,160,
    /* S2 27-53 out of the station: a 3-wide coupling c33-35, a low cable (c38), a 2-wide coupling c48-49 */
    160,160,160,160,160,160,null,null,null,160,160,160,160,160,160,160,160,160,160,160,160,null,null,160,160,160,160,
    /* S3 54-80 into the first tunnel (roof c56-107): 2-wide couplings c59-60 and c73-74, THE GHOST STATION SIGN (c67) */
    160,160,160,160,160,null,null,160,160,160,160,160,160,160,160,160,160,160,160,null,null,160,160,160,160,160,160,
    /* S4 81-107 a 3-wide coupling c87-89, the long car, a tunnel sign (c100) */
    160,160,160,160,160,160,null,null,null,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,
    /* S5 108-134 THE BLOOR VIADUCT: 4-wide couplings c112-115 and c126-129, THE VIADUCT LAMP (c124-127 row 7) */
    160,160,160,160,null,null,null,null,160,160,160,160,160,160,160,160,160,160,null,null,null,null,160,160,160,160,160,
    /* S6 135-161 under the road deck (c135-161): a 3-wide coupling c140-142, a low cable (c148), a 2-wide c154-155 */
    160,160,160,160,160,null,null,null,160,160,160,160,160,160,160,160,160,160,160,null,null,160,160,160,160,160,160,
    /* S7 162-188 the second tunnel (roof c164-215): 3-wide couplings c168-170 and c182-184 */
    160,160,160,160,160,160,null,null,null,160,160,160,160,160,160,160,160,160,160,160,null,null,null,160,160,160,160,
    /* S8 189-215 a 3-wide coupling c193-195, the checkpoint car, a 3-wide coupling c206-208 */
    160,160,160,160,null,null,null,160,160,160,160,160,160,160,160,160,160,null,null,null,160,160,160,160,160,160,160,
    /* S9 216-242 out into the open: a 5-wide coupling c220-224, the long car, THE SIGNAL GANTRY (spring c227) */
    160,160,160,160,null,null,null,null,null,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,
    /* S10 243-269 a 5-wide coupling c246-250, a 4-wide c257-260, the last car */
    160,160,160,null,null,null,null,null,160,160,160,160,160,160,null,null,null,null,160,160,160,160,160,160,160,160,160,
    /* S11 270-290 reward: down the stairs to the platform under the square, the gift row */
    176,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [56, 4, 107, 5],   /* S3-S4 the first tunnel's roof (4 tiles of air over the car roofs) */
    [135, 5, 161, 5],   /* S6 the viaduct's road deck: the train runs under it (4 tiles of air) */
    [164, 4, 215, 5]   /* S7-S8 the second tunnel's roof */
  ],
  tiles: {
    gift: [
      [4, 8],   /* S1 */
      [41, 6],   /* S2 */
      [67, 5, 'gold'],   /* S3 THE GHOST STATION SIGN: the glinting tile in the tunnel roof (hidden) */
      [70, 6],   /* S3 */
      [93, 6],   /* S4 */
      [118, 6],   /* S5 */
      [150, 6],   /* S6 */
      [176, 6],   /* S7 */
      [201, 6],   /* S8 */
      [234, 6],   /* S9 */
      [263, 6],   /* S10 */
      [276, 8, 'heart'], [278, 8], [280, 8, 'cake']   /* S11 the gift row */
    ],
    brick: [
      [3, 8], [5, 8],   /* S1 */
      [40, 6], [42, 6],   /* S2 */
      [92, 6], [94, 6],   /* S4 */
      [117, 6], [119, 6],   /* S5 */
      [277, 8], [279, 8]   /* S11 */
    ],
    spring: [
      [227, 9]   /* S9 the roof spring under THE SIGNAL GANTRY (skill secret) */
    ],
    shelf: [
      [124, 7], [125, 7], [126, 7], [127, 7],   /* S5 THE VIADUCT LAMP (visible secret) */
      [229, 2], [230, 2], [231, 2]   /* S9 THE SIGNAL GANTRY (skill secret) */
    ]
  },
  /* commuters on the platforms, raccoons riding the roofs, cones left on the track, crows and gulls over the open
     stretches (no flyer in a tunnel). Nothing waits at a lip. */
  foes: [
    [10, 11, 'mallwalker'],   /* S1 a commuter in a hurry */
    [44, 6, 'crow'],   /* S2 */
    [66, 9, 'raccoon'],   /* S3 */
    [83, 9, 'raccoon'],   /* S4 */
    [102, 9, 'raccoon'],   /* S4 (act 2) */
    [114, 5, 'seagull'], [121, 9, 'raccoon'],   /* S5 */
    [145, 9, 'cone'], [158, 9, 'raccoon'],   /* S6 */
    [174, 9, 'raccoon'], [178, 9, 'rollerblader'],   /* S7 */
    [199, 9, 'raccoon'], [212, 9, 'cone'],   /* S8 */
    [222, 5, 'seagull'], [236, 9, 'raccoon'], [240, 9, 'rollerblader'],   /* S9 */
    [248, 5, 'seagull'], [253, 9, 'raccoon'], [265, 9, 'cone'],   /* S10 */
    [283, 11, 'mallwalker']   /* S11 */
  ],
  candles: [
    [3, 10], [7, 10], [9, 10], [11, 10], [12, 10], [13, 9], [15, 9], [17, 9], [19, 9], [21, 8], [22, 7], [23, 7], [24, 8], [26, 9],
    [28, 9], [30, 9], [32, 8], [33, 7], [34, 6], [35, 7], [36, 8], [38, 7], [40, 8], [42, 8], [45, 9], [47, 8], [48, 7], [49, 7], [50, 8], [52, 9],
    [54, 9], [56, 9], [58, 8], [59, 7], [60, 7], [61, 8], [63, 9], [65, 9], [67, 8], [67, 7], [69, 9], [71, 9], [72, 8], [73, 7], [74, 7], [75, 8], [77, 9], [79, 9],
    [81, 9], [83, 9], [85, 9], [86, 8], [87, 7], [88, 7], [89, 7], [90, 8], [92, 8], [94, 8], [96, 9], [98, 9], [100, 9], [102, 9], [104, 9], [106, 9],
    [108, 9], [110, 9], [111, 8], [112, 7], [113, 6], [114, 6], [115, 7], [116, 8], [117, 8], [119, 8], [121, 9], [123, 9], [126, 5], [127, 5], [128, 6], [129, 7], [131, 9], [133, 9],
    [135, 9], [137, 9], [139, 8], [140, 7], [141, 7], [142, 7], [143, 8], [146, 9], [148, 7], [150, 8], [152, 9], [153, 8], [154, 7], [155, 7], [156, 8], [158, 9], [160, 9],
    [162, 9], [164, 9], [166, 9], [167, 8], [168, 7], [169, 7], [170, 7], [171, 8], [173, 9], [176, 8], [178, 9], [180, 9], [181, 8], [182, 7], [183, 7], [184, 7], [185, 8], [187, 9],
    [189, 9], [191, 9], [192, 8], [193, 7], [194, 7], [195, 7], [196, 8], [198, 9], [201, 8], [203, 9], [205, 8], [206, 7], [207, 7], [208, 7], [209, 8], [211, 9], [213, 9], [215, 9],
    [216, 9], [218, 9], [219, 8], [220, 7], [221, 6], [222, 5], [223, 6], [224, 7], [225, 8], [227, 7], [227, 5], [228, 3], [232, 9], [234, 8], [236, 9], [238, 9], [240, 9], [242, 9],
    [244, 9], [245, 8], [246, 7], [247, 6], [248, 5], [249, 6], [250, 7], [251, 8], [253, 9], [255, 9], [256, 8], [257, 7], [258, 6], [259, 7], [260, 8], [262, 9], [263, 8], [266, 9], [268, 9],
    [270, 9], [272, 11], [274, 11], [276, 10], [278, 10], [280, 10], [282, 11], [284, 11]
  ],
  secrets: [
    { kind: 'visible', col: 125, row: 6, prize: 'heart+candles' },   /* THE VIADUCT LAMP: from the car roof, jump UP onto the lamp ledge over the coupling */
    { kind: 'hidden', col: 67, row: 5, prize: 'GOLDEN CANDLE', glint240: true },   /* THE GHOST STATION SIGN: the glinting tile in the tunnel roof */
    { kind: 'skill', col: 230, row: 1, prize: 'hat' }   /* THE SIGNAL GANTRY: the roof spring, then steer onto the gantry */
  ],
  goldenCandle: { col: 67, row: 5 },
  checkpoint: { col: 198, row: 9 },
  spawn: { col: 2, row: 11 },
  goal: { col: 286, row: 11 },   /* the stairs up to Nathan Phillips Square */
  talk: [
    [2, 'SHAD', 'The raccoon jumped down into the subway with Glitchy! It is riding on top of that train!', 4],
    [10, 'MOM', 'Kinan, you do NOT ride on top of trains. ...It is only a game? Okay. Be careful, sweetie.', 4.4],
    [55, 'CHENOA', 'Tunnel! The roof is right over your head in there. Little hops, little bro!', 3.6],
    [97, 'KINAN', 'Mind the gap! Mind ALL the gaps!', 2.6],
    [109, 'DAD', "The Bloor Viaduct! There's a whole valley under us, bud. Don't look down.", 3.8],
    [165, 'SHAD', 'Back underground. That raccoon keeps looking back at you. I think it likes Glitchy.', 4],
    [217, 'KINAN', "Out in the open again! I've almost got that raccoon!", 3],
    [272, 'CHENOA', 'Everybody off! Nathan Phillips Square is right upstairs. The raccoon went up there!', 4]
  ]
});

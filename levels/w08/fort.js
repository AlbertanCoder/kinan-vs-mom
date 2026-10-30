/* ============================================================
   FORT · THE AQUARIUM TUNNEL  (World 8 · Toronto · trail stop 6)
   Story bible (World 8 table): "The Big Octopus waits in the shark
   tunnel." The raccoon with Glitchy's parcel slips into the aquarium
   by the CN Tower. Kinan follows it past the ray pool and through the
   long glass shark tunnel under the water, with fish, rays and sharks
   swimming over his head, to the big tank at the end... where
   something with a lot of arms is waiting.
   Idea: UNDER THE WATER. The whole fort is behind glass: fish, a ray
     and now and then a big slow shark swim past in the background
     (fish: true). The shark tunnel has the aquarium's moving walkway
     (8-1's belts): each one stops a tile short of the next gap.
   Route: S1 the doors 3 · S2 THE RAY POOL 3/3 (flying fish jump out of
     it) · S3-S5 THE SHARK TUNNEL (glass roof c56-125, 6 tiles of air:
     no jump is cut short), walkways, 4/4/4 · S6 the jellyfish room, the
     checkpoint, 5 · S7 5, then the big tank · S8 THE BIG TANK.
   FLAT OPEN GROUND FOR THE BOSS (the second run): columns 171-215 are
     flat at 192 (45 tiles). Columns 176-209 (34 tiles) hold nothing
     but candles at their ends: the arena floor goes in the middle,
     arena { col: 180, cols: 24, boss: 'octopus' } puts its gates at
     c179 and c204 and its checkpoint flag at c176 (ground). A heart
     waits just before the left gate (gift at c178, row 8, outside the
     arena) and a gift past the boss door (c207); the arena floor itself
     (c180-203) is left completely empty (the candles stop at c177 and
     start again at c205). The goal stands past it, at c211.
   The mini-boss (THE SECOND RUN, 2026-10-29): the Big Octopus, 2 phases
     (index.html ARENA_KINDS.octopus). 1: two tentacles slam down on
     shadows, an ink blob, a low tentacle sweep (jump it). 2 (smarter):
     fakes, aims where Kinan is going, three tentacles, two blobs and an
     INK CLOUD it hides in and pops out of somewhere new. A KICK bats an
     ink blob back (it splats on the octopus harmlessly). Its soft spot:
     when it flops down on the floor to rest, a gentle PAT on its head.
     Befriended (it was only scared of the noise), it waves all eight
     arms goodbye; then the boss door opens to the goal.
   Gaps: 3/3/3 · 4/4/4 · 5/5 (a step up from 7-fort's), each with a
     candle arc; nothing waits at a lip; no belt carries Kinan into a
     gap. Fort slot: exempt from the 3-secrets lint (no secrets here;
     World 8's secret exit is at the 8-6 lighthouse). No pet.
   Raccoons (World 8, snatch): a raccoon grabs a candle and runs.
   Look: the Aquarium Tunnel (theme 105, World 8's own look): deep blue
     water over the tunnel, light from the surface, rocks, coral and
     swaying kelp, glowing jellies drifting up, bubbles (the fish, the
     ray, the shark and the glass arch are the `fish` twist, in front).
   ENGINE REQUESTS: a glass-arch skin for the shark tunnel's roof.
   ============================================================ */
KinanLevels.register({
  id: '8-fort', world: 8, slot: 6, kind: 'fort',
  name: 'THE AQUARIUM TUNNEL',
  theme: 105,   /* the Aquarium Tunnel: deep water, kelp, coral, glowing jellies, bubbles */
  cols: 216,
  snatch: true,   /* World 8: raccoons grab a candle and run */
  fish: true,   /* World 8: fish, a ray and sharks swim past behind the glass */
  belts: [[58, 75, 12, 1], [81, 97, 12, 1], [103, 113, 12, -1], [119, 125, 12, 1]],   /* the shark tunnel's moving walkways */
  heights: [
    /* S1 0-26 the aquarium doors: a 3-wide gap c14-16 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 THE RAY POOL: 3-wide gaps c33-35 and c44-46 */
    192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,
    /* S3 54-80 into THE SHARK TUNNEL (roof c56-125): a walkway (c58-75), a 4-wide gap c77-80 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,
    /* S4 81-107 a walkway (c81-97), a 4-wide gap c99-102, a wrong-way walkway (c103-113) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,
    /* S5 108-134 a 4-wide gap c115-118, out of the tunnel (c125) into the jellyfish room */
    192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 the checkpoint, a 5-wide gap c150-154 */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,
    /* S7 162-188 a 5-wide gap c166-170, THE BIG TANK: flat open ground from c171 */
    192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S8 189-215 THE BIG TANK: the arena floor (c180-203) stays empty, a gift past the boss door, the goal (c211) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [56, 4, 125, 5]   /* S3-S5 THE SHARK TUNNEL's glass roof (6 tiles of air under it) */
  ],
  tiles: {
    gift: [
      [5, 8],   /* S1 */
      [39, 8],   /* S2 */
      [66, 8],   /* S3 */
      [92, 8],   /* S4 */
      [128, 8],   /* S5 */
      [143, 8],   /* S6 */
      [178, 8, 'heart'],   /* S7 a heart just before the arena's left gate (c179) */
      [207, 8]   /* S8 past the boss door (c204) */
    ],
    brick: [
      [4, 8], [6, 8],   /* S1 */
      [127, 8], [129, 8]   /* S5 */
    ]
  },
  /* visitors, flying fish and frogs from the pools, raccoons. Nothing waits at a lip, nothing on the arena floor. */
  foes: [
    [8, 11, 'mallwalker'],   /* S1 */
    [40, 11, 'flyingfish'],   /* S2 */
    [65, 11, 'puddlefrog'],   /* S3 */
    [90, 11, 'raccoon'],   /* S4 */
    [123, 11, 'flyingfish'], [131, 11, 'raccoon'],   /* S5 */
    [140, 11, 'puddlefrog'], [146, 11, 'roomba'],   /* S6 */
    [163, 11, 'raccoon'], [173, 11, 'puddlefrog']   /* S7 */
  ],
  candles: [
    [3, 10], [9, 11], [11, 11], [13, 10], [14, 9], [15, 9], [16, 9], [17, 10], [19, 11], [21, 11], [23, 11], [25, 11],
    [28, 11], [30, 11], [32, 10], [33, 9], [34, 8], [35, 9], [36, 10], [38, 11], [42, 11], [43, 10], [44, 9], [45, 8], [46, 9], [47, 10], [49, 11], [51, 11], [53, 11],
    [55, 11], [58, 11], [60, 11], [62, 11], [64, 11], [68, 11], [70, 11], [72, 11], [74, 11], [76, 10], [77, 9], [78, 8], [79, 8], [80, 9],
    [81, 10], [83, 11], [85, 11], [87, 11], [94, 11], [96, 11], [98, 10], [99, 9], [100, 8], [101, 8], [102, 9], [103, 10], [105, 11], [107, 11],
    [109, 11], [111, 11], [114, 10], [115, 9], [116, 8], [117, 8], [118, 9], [119, 10], [121, 11], [125, 11], [128, 10], [133, 11],
    [136, 11], [138, 11], [143, 10], [148, 11], [149, 10], [150, 9], [151, 8], [152, 7], [153, 8], [154, 9], [155, 10], [157, 11], [159, 11], [161, 11],
    [162, 11], [164, 11], [165, 10], [166, 9], [167, 8], [168, 7], [169, 8], [170, 9], [171, 10], [175, 11], [177, 11],
    [205, 11], [207, 10], [209, 11], [213, 11]
  ],
  checkpoint: { col: 140, row: 11 },
  arena: { col: 180, cols: 24, boss: 'octopus' },   /* THE BIG TANK: 2 phases; its gates at c179 and c204, its checkpoint flag at c176 */
  spawn: { col: 2, row: 11 },
  goal: { col: 211, row: 11 },   /* past the big tank, through the boss door (c204) */
  talk: [
    [2, 'CHENOA', 'The aquarium! Sharks, rays, jellyfish... and one very sneaky raccoon.', 3.6],
    [57, 'KINAN', 'A tunnel UNDER the water! There is a shark right over my head!', 3.2],
    [84, 'DAD', "Ride the moving walkway, bud. The sharks are behind the glass. They're just fin-ishing lunch.", 3.8],
    [141, 'MOM', 'Something big just moved in the big tank, sweetie. Something with a LOT of arms.', 4],
    [172, 'SHAD', 'The raccoon ran right past the big tank. Wait. Is that an OCTOPUS?', 3.4]
  ]
});

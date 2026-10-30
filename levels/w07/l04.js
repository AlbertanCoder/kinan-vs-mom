/* ============================================================
   LEVEL 7-4 · THE LIONS GATE BRIDGE
   (World 7 · Vancouver · trail stop 4)
   Story bible (World 7 table): "Cross the green suspension bridge in
   the wind." Out of Stanley Park, up the causeway to Prospect Point,
   past the two stone lions, and across the long green bridge high
   over the harbour to the North Shore, in a sideways rain. The road
   crew has panels out of the deck, so there are holes where the road
   should be. Glitchy ran right across.
   Idea (ONE): THE BIG CABLES. The bridge's main cables swoop from the
     deck up over the tops of the two green towers and back down. The
     deck is the way across (jump the holes, duck under the towers),
     and a cable is a staircase in the sky: climb it, run over a tower
     and come down the other side past the holes. Act 1 teaches it (the
     causeway and Prospect Point 2/3/3, THE STONE LIONS, the first
     cable up over tower 1); act 2 twists it (the deck arches up over
     mid-span, holes 4/3/4/4/4/3/4, seagulls); act 3 tests it (the
     cable steps up to the top of tower 2, a 5-wide hole, then the
     North Shore ramp 5/5/4).
   Built as THREE AREAS; the seam banners slide in between them:
     THE CAUSEWAY (0-80) · THE LIONS GATE BRIDGE (81-215) · THE NORTH
     SHORE (216-296). Columns below are each area's own.
   Acts (thirds): 0-98 teach (the causeway 2, Prospect Point 3/3, THE
     STONE LIONS, THE CABLE ANCHOR, tower 1) · 99-197 twist (the
     checkpoint, holes 4/3/4/4/4/3/4, the deck's arch over mid-span) · 198-
     296 test (past tower 2 a 5-wide hole, the ramp 5/5/4, Marine
     Drive).
   Signature set-piece: THE TOWER CLIMB (area 2, local c103-116): the
     main cable as stepping stones in the sky, up to the top of tower 2,
     then down the far cable over the widest hole.
   Secrets: visible = THE STONE LIONS (area 1, c55-62): a lion statue on
     each side of the road and a heart floating high between them; jump
     from one lion's head to the other (heart + candles, local 59,1) ·
     hidden = THE CABLE ANCHOR (area 1, c68-69): the concrete block that
     holds the cable; jump over it, then walk back into the glinting
     stone on its far side (GOLDEN CANDLE, local 69,7) · skill = THE
     TOWER TOP (area 2): hop up the cable steps to the very top of tower
     2 (hat, local 116,0).
   Gaps: act 1 2/3/3 · act 2 4/3/4/4/4/3/4 · act 3 5, 5/5/4. Every hole
     has a candle arc; nothing waits at a lip; there are 6 tiles of open
     deck between a tower and the next hole (no jumping under a tower).
   Look: borrows the Rainy Harbour (theme 49): grey water, seaplanes,
     the mountains behind, heavy rain.
   TWIST (wired 2026-10-28): THE WIND. Gusts blow across the open
     approach (taught, no holes), the whole bridge deck and off its far
     end: a whoosh, a WIND! sign, wind streaks and sideways rain for 1 s,
     then a 1.5 s gust that pushes Kinan back (never faster than a slow
     walk, weaker in the air, never off a ledge he stands on), then 3 s
     of calm. Run through it or wait it out.
   ENGINE REQUESTS (still open): a green-steel skin for the towers and the cable shelves · lion
     statue skins · the deck drawn as a bridge (railings, water far
     below) rather than ground down to the bottom.
   ============================================================ */
KinanLevels.register({
  id: '7-4', world: 7, slot: 4, kind: 'level',
  name: 'THE LIONS GATE BRIDGE',
  theme: 49,   /* the Rainy Harbour: grey water, seaplanes, the mountains behind, heavy rain */
  spawn: { col: 2, row: 11 },
  areas: [
    {
      id: 'the-causeway', name: 'THE CAUSEWAY', cols: 81,
      wind: [[54, 80]],   /* THE WIND, taught: the first gusts blow on the open approach past the lions (no holes there) */
      heights: [
        /* 0-26 the park road, up the causeway (c9-12), a 2-wide culvert c18-19 */
        192,192,192,192,192,192,192,192,192,184,176,168,160,160,160,160,160,160,null,null,160,160,160,160,160,160,160,
        /* 27-53 up to Prospect Point (c27-30): 3-wide gaps c40-42 and c50-52 on the approach */
        152,144,136,128,128,128,128,128,128,128,128,128,128,null,null,null,128,128,128,128,128,128,128,null,null,null,128,
        /* 54-80 the bridge approach: THE STONE LIONS (c55-56, c61-62), THE CABLE ANCHOR (c68-69), the cable climbs to tower 1 */
        128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128
      ],
      solid: [
        [55, 6, 56, 7], [61, 6, 62, 7],   /* THE STONE LIONS, one each side of the road (visible secret) */
        [68, 5, 69, 7]   /* THE CABLE ANCHOR, where the back cable meets the deck */
      ],
      tiles: {
        gift: [
          [4, 8, 'popper'], [15, 6],   /* S1 */
          [34, 4], [46, 4],   /* S2 */
          [69, 7, 'gold']   /* THE CABLE ANCHOR: the glinting stone on its far side (hidden) */
        ],
        brick: [
          [3, 8], [5, 8],   /* S1 */
          [33, 4], [35, 4]   /* S2 */
        ],
        shelf: [
          [70, 4], [71, 4], [72, 4], [73, 4],   /* the back cable climbs from the anchor toward tower 1 ... */
          [74, 3], [75, 3], [76, 3], [77, 3],
          [78, 2], [79, 2], [80, 2]
        ]
      },
      /* repair-crew cones wander the road; nothing waits at a lip */
      foes: [
        [23, 9, 'cone'],   /* S1 */
        [37, 7, 'cone'],   /* S2 */
        [58, 7, 'cone']   /* S3 between the lions */
      ],
      candles: [
        [1, 11], [2, 11], [6, 11], [7, 11], [9, 10], [10, 10], [11, 9], [12, 9], [13, 9], [14, 9], [16, 9], [17, 8], [18, 7], [19, 7],
        [20, 8], [21, 9], [22, 9], [25, 9], [26, 9], [27, 8], [28, 8], [29, 7], [30, 7], [31, 7], [32, 7], [38, 7], [39, 6], [40, 5],
        [41, 5], [42, 5], [43, 6], [44, 7], [45, 7], [47, 7], [48, 7], [49, 6], [50, 5], [51, 5], [52, 5], [53, 6], [54, 7], [55, 5],
        [56, 5], [57, 3], [58, 2], [60, 2], [61, 5], [62, 5], [63, 7], [64, 7], [65, 7], [66, 7], [67, 7], [68, 4], [69, 4], [70, 3],
        [72, 3], [74, 2], [76, 2], [78, 1], [80, 1], [71, 7], [73, 7], [75, 7], [77, 7], [79, 7]
      ],
      secrets: [
        { kind: 'visible', col: 59, row: 1, prize: 'heart+candles' },   /* THE STONE LIONS: jump from one lion's head to the other */
        { kind: 'hidden', col: 69, row: 7, prize: 'GOLDEN CANDLE', glint240: true }   /* THE CABLE ANCHOR: walk back into the glinting stone */
      ],
      goldenCandle: { col: 69, row: 7 },
      talk: [
        [2, 'DAD', "Over the Lions Gate Bridge! Hold on to your hood, it's windy up there. This bridge has mane attractions.", 4.4],
        [29, 'CHENOA', 'Prospect Point! You can see the whole green bridge from here.', 3.2],
        [51, 'KINAN', 'Stone lions guarding the bridge! Can I stand on one?', 3],
        [63, 'SHAD', 'The road crew took panels out of the deck! Jump the holes, or climb the big cable up over the tower.', 4.6]
      ]
    },
    {
      id: 'lions-gate-bridge', name: 'THE LIONS GATE BRIDGE', cols: 135,
      wind: true,   /* THE WIND across the whole deck: each gust is warned 1 s ahead (a whoosh, streaks, sideways rain) */
      skins: [['steel', 11, 1, 12, 5], ['steel', 115, 1, 116, 5]],   /* the two green steel towers (looks only) */
      heights: [
        /* 0-26 onto the deck, under tower 1 (c11-12), the checkpoint, a 4-wide hole c20-23 */
        128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,null,null,null,null,128,128,128,
        /* 27-53 the deck arches up (c31-32): a 3-wide hole c39-41, a 4-wide hole c48-51 */
        128,128,128,128,120,112,112,112,112,112,112,112,null,null,null,112,112,112,112,112,112,null,null,null,null,112,112,
        /* 54-80 mid-span: a 4-wide hole c58-61, down again (c68-69), a 4-wide hole c75-78 */
        112,112,112,112,null,null,null,null,112,112,112,112,112,112,120,128,128,128,128,128,128,null,null,null,null,128,128,
        /* 81-107 a 3-wide hole c86-88, a 4-wide hole c96-99, the cable steps begin (c103) */
        128,128,128,128,128,null,null,null,128,128,128,128,128,128,128,null,null,null,null,128,128,128,128,128,128,128,128,
        /* 108-134 THE TOWER CLIMB to tower 2 (c115-116), a 5-wide hole c123-127 under the far cable */
        128,128,128,128,128,128,128,128,128,128,128,128,128,128,128,null,null,null,null,null,128,128,128,128,128,128,128
      ],
      solid: [
        [11, 1, 12, 5],   /* tower 1: the road runs under its crossbeam (one tile of headroom: no jumping under it) */
        [115, 1, 116, 5]   /* tower 2 */
      ],
      tiles: {
        gift: [
          [4, 4, 'umbrella'],   /* an umbrella for the long crossing */
          [35, 3], [54, 3], [65, 3],   /* mid-span */
          [82, 4], [92, 4],
          [131, 4]
        ],
        brick: [
          [34, 3], [36, 3], [53, 3], [55, 3]
        ],
        shelf: [
          [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1],   /* ... up to the top of tower 1 */
          [13, 1], [14, 1], [15, 1], [16, 2], [17, 2], [18, 2], [19, 3], [20, 3], [21, 3],   /* the main cable down from tower 1, over the first hole */
          [22, 4], [23, 4], [24, 4], [25, 5], [26, 5], [27, 5],
          [103, 5], [104, 5], [106, 4], [107, 4], [109, 3], [110, 3], [112, 2], [113, 2],   /* THE TOWER CLIMB: cable steps up to tower 2 */
          [117, 2], [118, 2], [119, 2], [120, 3], [121, 3], [122, 3], [123, 4], [124, 4], [125, 4], [126, 5], [127, 5], [128, 5]   /* the far cable down, over the 5-wide hole */
        ]
      },
      /* cones on the deck, seagulls riding the wind over the holes */
      foes: [
        [7, 7, 'cone'], [21, 4, 'seagull'],   /* S4 */
        [35, 6, 'cone'], [49, 3, 'seagull'],   /* S5 */
        [55, 6, 'cone'], [65, 6, 'cone'], [76, 4, 'seagull'],   /* S6 */
        [82, 7, 'cone'], [92, 7, 'cone'], [97, 4, 'seagull'],   /* S7 */
        [120, 7, 'cone'], [125, 6, 'seagull'], [131, 7, 'cone']   /* S8 */
      ],
      candles: [
        [2, 0], [4, 0], [6, 0], [8, 0], [10, 0], [1, 7], [3, 7], [6, 7], [8, 7], [11, 7], [12, 7], [14, 7], [16, 7], [18, 7],
        [13, 0], [15, 0], [16, 1], [18, 1], [19, 2], [21, 2], [22, 3], [24, 3], [25, 4], [27, 4], [19, 6], [20, 5], [21, 5], [22, 5],
        [23, 5], [24, 6], [25, 7], [26, 7], [28, 7], [29, 7], [30, 7], [31, 6], [32, 6], [33, 6], [34, 6], [36, 6], [37, 6], [38, 5],
        [39, 4], [40, 3], [41, 4], [42, 5], [43, 6], [44, 6], [45, 6], [46, 6], [47, 5], [48, 4], [49, 3], [50, 3], [51, 4], [52, 5],
        [53, 6], [55, 6], [56, 6], [57, 5], [58, 4], [59, 3], [60, 3], [61, 4], [62, 5], [63, 6], [64, 6], [66, 6], [67, 6], [68, 6],
        [69, 7], [70, 7], [71, 7], [72, 7], [73, 7], [74, 6], [75, 5], [76, 4], [77, 4], [78, 5], [79, 6], [80, 7], [81, 7], [83, 7],
        [84, 7], [85, 6], [86, 5], [87, 4], [88, 5], [89, 6], [90, 7], [91, 7], [93, 7], [94, 7], [95, 6], [96, 5], [97, 4], [98, 4],
        [99, 5], [100, 6], [101, 7], [102, 7], [103, 4], [104, 4], [106, 3], [107, 3], [109, 2], [110, 2], [112, 1], [113, 1], [103, 7], [105, 7],
        [107, 7], [109, 7], [111, 7], [113, 7], [115, 7], [116, 7], [118, 1], [121, 2], [124, 3], [127, 4], [118, 7], [119, 7], [120, 7], [121, 7],
        [122, 6], [123, 5], [124, 5], [125, 5], [126, 6], [127, 6], [128, 6], [129, 7], [130, 7], [132, 7], [133, 7], [134, 7]
      ],
      secrets: [
        { kind: 'skill', col: 116, row: 0, prize: 'hat' }   /* THE TOWER TOP: hop up the cable steps to the very top of tower 2 */
      ],
      checkpoint: { col: 18, row: 7 },
      talk: [
        [52, 'MOM', "Don't look down, sweetie! ...Oh no. I looked down.", 3],
        [100, 'KINAN', 'I bet I can hop up that cable all the way to the top of the tower.', 3.4]
      ]
    },
    {
      id: 'the-north-shore', name: 'THE NORTH SHORE', cols: 81,
      wind: [[0, 21]],   /* the last gusts blow off the end of the bridge, over the 5-wide hole and down the ramp */
      heights: [
        /* 0-26 off the bridge: a 5-wide hole c4-8, down the ramp (c14-17), a 5-wide gap c22-26 */
        128,128,128,128,null,null,null,null,null,128,128,128,128,128,136,144,152,160,160,160,160,160,null,null,null,null,null,
        /* 27-53 a 4-wide gap c32-35, down to Marine Drive (c40-43) */
        160,160,160,160,160,null,null,null,null,160,160,160,160,168,176,184,192,192,192,192,192,192,192,192,192,192,192,
        /* 54-80 reward: the park at Ambleside, the gift row, the road up the canyon */
        192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
      ],
      tiles: {
        gift: [
          [11, 4], [19, 6], [29, 6], [38, 6], [50, 8],
          [60, 8, 'heart'], [62, 8], [64, 8, 'cake']   /* the gift row */
        ],
        brick: [
          [61, 8], [63, 8]
        ]
      },
      foes: [
        [6, 5, 'seagull'], [11, 7, 'cone'], [24, 6, 'seagull'],   /* S9 */
        [29, 9, 'cone'], [34, 6, 'seagull'], [48, 11, 'cone'],   /* S10 */
        [64, 11, 'cone']   /* S11 */
      ],
      candles: [
        [0, 7], [1, 7], [2, 7], [3, 6], [4, 5], [5, 4], [6, 3], [7, 4], [8, 5], [9, 6], [10, 7], [12, 7], [13, 7], [14, 7],
        [15, 8], [16, 8], [17, 9], [18, 9], [20, 9], [21, 8], [22, 7], [23, 6], [24, 5], [25, 6], [26, 7], [27, 8], [28, 9], [30, 9],
        [31, 8], [32, 7], [33, 6], [34, 6], [35, 7], [36, 8], [37, 9], [39, 9], [40, 10], [41, 10], [42, 11], [43, 11], [45, 11], [46, 11],
        [47, 11], [52, 11], [53, 11], [54, 11], [55, 11], [56, 11], [60, 7], [62, 7], [64, 7], [67, 11], [69, 11], [71, 11], [73, 11], [75, 11]
      ],
      goal: { col: 77, row: 11 },   /* the road up the canyon to the swinging bridge */
      talk: [
        [2, 'SHAD', "North Shore! Glitchy's headed up into the mountains.", 3],
        [56, 'DAD', 'See the canyon up there? That little rain cloud went that way too. Typical cloud, always mist-ing out.', 3.6]
      ]
    }
  ]
});

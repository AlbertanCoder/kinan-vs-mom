/* ============================================================
   FORT · GROUSE MOUNTAIN TOP  (World 7 · Vancouver · trail stop 6)
   Story bible (World 7 table): "Up the gondola; the Giant Banana Slug
   waits at the summit. Secret exit on the gondola, leading to
   7-secret." From the North Shore the family takes the big red
   gondola up Grouse Mountain. It is raining at the bottom
   and snowing at the top. Glitchy rode a cabin up (on the ROOF), and
   something huge and slimy has left a shiny trail across the summit.
   Idea: RIDE THE ROOFS. The gondola cabins hang from the cable in a
     line that climbs the mountain: hop from roof to roof all the way
     up. Under the cable runs THE STEEP TRAIL, the hardest hike in
     town: fall off a cabin and you are on the trail, and the trail
     goes to the top too (it is the slow way, with gullies to jump).
   Built as THREE AREAS; the seam banners slide in between them:
     THE GONDOLA BASE (0-80) the parking lot and Mosquito Creek 3, the
       forest road over a hill 3, up the steps to the gondola station ·
     THE GONDOLA (81-161) the cabins, twelve roofs climbing the
       mountain over the steep trail (gullies 4/4/4 below), and
       the top station's deck · THE SUMMIT (162-242) the snowy top:
       a 12-tile run-out off the deck (a full-run jump off the deck
       lands about 8 tiles out, 2.5 tiles to spare before the first ski
       run), ski runs 5/5/4 (c12-16, c26-30, c40-43), then FLAT OPEN GROUND to the boss
       door: local c44-80 of this area is flat (37 tiles at 160); its
       middle, c48-71, is the mini-boss arena floor and holds nothing,
       and the goal stands past it (local c77).
   The mini-boss (added in THE SECOND RUN): the Giant Banana Slug,
     2 phases: it rears up and flops forward onto a red ring (slime
     splashes roll out both ways: jump them), curls into a ball and
     rolls across (jump it), and leaves slippery slime where it goes;
     smarter, it fakes, aims ahead, spits slime blobs onto shadows and
     two little slugs crawl in. When it stretches up to catch its breath
     its head is the soft spot: STOMP. Befriended (it was only grumpy
     about the noise) it slides off to nap in the cedars.
     Same layout as levels/w06/fort.js: arena { col: 48,
     cols: 24, boss: 'banana-slug' } on THE SUMMIT puts its gates at
     local c47 and c72 and its checkpoint flag at local c44 (ground,
     one tile past a 4-wide gap), the goal past it at c77. Needs an
     ARENA_KINDS entry in index.html and the name in ARENA_BOSSES
     (levels/registry.js). A heart waits just before the arena's left
     gate (local c45) and a gift past the boss door (local c76); the
     arena floor itself (local c48-71) is left completely empty (the
     candles stop at c46 and start again at c74).
   Secret exit: THE LOW CABIN (area 2, local c24-26): one cabin hangs low
     over the steep trail's flat stretch, and the middle of its floor glints.
     Jump under it from the trail: a heart pops and a door opens in the
     trail below it: walk in for the SECRET EXIT to 7-secret, Sea-to-Sky
     and the Chief (the 6-7 / 1-7 pattern). Hop on to carry on instead.
   Gaps: area 1 3/3 · area 2 4/4/4 (the trail; the roofs are 1-3 apart)
     · area 3 5/5/4, a fair step up from 6-fort (3/3/3/3 · 4/4/4/4/4 ·
     5/5/5/5) since half of this fort is the roof ride. Every gap has a
     candle arc; nothing waits at a lip; no cabin hangs low over a
     gully's take-off (a full jump never bumps a roof over a gap).
   Fort slot: exempt from the 3-secrets lint; its one secret is the
     secret exit. No pet: all six are found by World 5.
   Look: borrows the Mountain Top (theme 45): snow, the whole city far
     below, the gondola cable, rain.
   ENGINE REQUESTS (the slug and its slime trail are wired now) · red gondola-cabin skins for the cabin blocks (with the
     cable drawn over them) and a trail-door skin for the secret exit
     in the trail · snow on the summit ground (the World 5 ice only runs
     in the old story stages: a slippery summit would be its own idea) ·
     the slug's shiny slime trail across the summit (decoration).
   ============================================================ */
KinanLevels.register({
  id: '7-fort', world: 7, slot: 6, kind: 'fort',
  name: 'GROUSE MOUNTAIN TOP',
  theme: 45,   /* the Mountain Top: snow, the city far below, the gondola cable */
  spawn: { col: 2, row: 11 },
  areas: [
    {
      id: 'gondola-base', name: 'THE GONDOLA BASE', cols: 81,
      heights: [
        /* 0-26 the parking lot, a 3-wide creek c13-15 (Mosquito Creek) */
        192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,
        /* 27-53 the forest road over a hill (c31-44), a 3-wide gap c47-49 */
        192,192,192,192,184,176,168,160,160,160,160,160,160,160,168,176,184,192,192,192,null,null,null,192,192,192,192,
        /* 54-80 the gondola station: up the steps (c72-73) onto the boarding deck (c75-80) */
        192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
      ],
      solid: [
        [72, 10, 73, 11],   /* the station steps */
        [75, 8, 80, 8]   /* the boarding deck (the trail runs on underneath it) */
      ],
      tiles: {
        gift: [
          [4, 8, 'popper'], [21, 8],   /* S1 */
          [37, 6],   /* S2 on the hill */
          [58, 8], [66, 8]   /* S3 */
        ],
        brick: [
          [3, 8], [5, 8],   /* S1 */
          [57, 8], [59, 8]   /* S3 */
        ]
      },
      foes: [
        [22, 11, 'raccoon'],   /* S1 */
        [37, 9, 'squirrel'],   /* S2 */
        [62, 11, 'raccoon']   /* S3 */
      ],
      candles: [
        [1, 11], [2, 11], [6, 11], [7, 11], [8, 11], [10, 11], [11, 11], [12, 10], [13, 9], [14, 8], [15, 9], [16, 10], [17, 11], [18, 11],
        [20, 11], [23, 11], [24, 11], [25, 11], [26, 11], [27, 11], [28, 11], [29, 11], [30, 11], [31, 10], [32, 10], [33, 9], [34, 9], [35, 9],
        [36, 9], [38, 9], [39, 9], [40, 9], [41, 9], [42, 10], [43, 10], [44, 11], [45, 11], [46, 10], [47, 9], [48, 8], [49, 9], [50, 10],
        [51, 11], [52, 11], [53, 11], [54, 11], [55, 11], [60, 11], [61, 11], [63, 11], [64, 11], [65, 11], [67, 11], [68, 11], [69, 11], [70, 11],
        [72, 9], [73, 9], [75, 7], [76, 7], [77, 7], [78, 7], [79, 7], [80, 7], [76, 11], [78, 11], [80, 11]
      ],
      talk: [
        [2, 'DAD', "Grouse Mountain! We take the gondola to the top. Or you can hike the steep trail. It's basically stairs. For an hour.", 5],
        [28, 'KINAN', 'I bet Glitchy took the gondola. Glitchy is lazy.', 3],
        [64, 'CHENOA', "Climb up to the station and hop on a cabin! Don't fall off: it's a long way down.", 4]
      ]
    },
    {
      id: 'gondola', name: 'THE GONDOLA', cols: 81,
      heights: [
        /* 0-26 the steep trail under the cable: a 4-wide gully c8-11, up (c18-21) to the flat stretch under THE LOW CABIN */
        192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,184,176,168,160,160,160,160,160,160,
        /* 27-53 a 4-wide gully c30-33, up (c40-43), a 4-wide gully c52-55 */
        160,160,160,null,null,null,null,160,160,160,160,160,160,152,144,136,128,128,128,128,128,128,128,128,128,null,null,
        /* 54-80 up to the top station (c62-63), the snow starts */
        null,null,128,128,128,128,128,128,120,112,112,112,112,112,112,112,112,112,112,112,112,112,112,112,112,112,112
      ],
      solid: [
        [1, 7, 3, 7], [7, 5, 9, 5], [13, 4, 15, 4], [19, 3, 21, 3],   /* the gondola cabins, climbing ... */
        [24, 5, 26, 5],   /* THE LOW CABIN (the secret exit) */
        [30, 2, 32, 2], [36, 2, 38, 2], [42, 1, 44, 1], [48, 1, 50, 1], [54, 1, 56, 1], [60, 1, 62, 1], [66, 1, 68, 1],
        [72, 3, 80, 3]   /* the top station's deck */
      ],
      tiles: {
        gift: [
          [15, 8, 'umbrella'],   /* an umbrella: fall off a cabin and float */
          [25, 5, 'heart'],   /* THE LOW CABIN: the glinting middle of its floor (hidden + the secret exit) */
          [28, 6], [46, 4], [58, 4]
        ]
      },
      /* raccoons and squirrels on the steep trail, an umbrella bat round the cabins */
      foes: [
        [5, 11, 'raccoon'], [10, 3, 'umbrellabat'],   /* S4 */
        [36, 9, 'raccoon'], [47, 7, 'squirrel'],   /* S5 */
        [58, 7, 'raccoon'], [70, 6, 'squirrel']   /* S6 */
      ],
      candles: [
        [1, 6], [2, 6], [3, 6], [7, 4], [8, 4], [9, 4], [13, 3], [14, 3], [15, 3], [19, 2], [20, 2], [21, 2], [24, 4], [26, 4],
        [30, 1], [31, 1], [32, 1], [36, 1], [37, 1], [38, 1], [42, 0], [43, 0], [44, 0], [48, 0], [49, 0], [50, 0], [54, 0], [55, 0],
        [56, 0], [60, 0], [61, 0], [62, 0], [66, 0], [67, 0], [68, 0], [72, 2], [74, 2], [76, 2], [78, 2], [80, 2],
        [0, 11], [2, 11], [4, 11], [6, 11], [7, 10], [8, 9], [9, 8], [10, 8], [11, 9], [12, 10], [14, 11], [16, 11], [17, 11], [18, 10],
        [19, 10], [20, 9], [21, 9], [22, 9], [23, 9], [25, 8], [25, 7], [27, 9], [29, 8], [30, 7], [31, 6], [32, 6], [33, 7], [34, 8],
        [35, 9], [37, 9], [38, 9], [39, 9], [40, 8], [41, 8], [42, 7], [43, 7], [44, 7], [45, 7], [49, 7], [50, 7], [51, 6], [52, 5],
        [53, 4], [54, 4], [55, 5], [56, 6], [57, 7], [59, 7], [60, 7], [61, 7], [62, 6], [63, 6], [64, 6], [65, 6], [67, 6], [68, 6],
        [69, 6], [71, 6], [72, 6], [73, 6], [74, 6], [76, 6], [78, 6], [80, 6]
      ],
      secrets: [
        { kind: 'hidden', col: 25, row: 5, prize: 'heart + the secret exit', glint240: true, exit: '7-secret' }   /* THE LOW CABIN: jump under it, walk through the door in the trail */
      ],
      checkpoint: { col: 2, row: 11 },
      talk: [
        [1, 'MOM', 'Kinan! You ride INSIDE the gondola, not on the roof!', 3],
        [20, 'SHAD', 'One cabin is hanging really low. Something under it is shining...', 3.4],
        [63, 'KINAN', 'It was raining at the bottom and it is SNOWING at the top!', 3.4]
      ]
    },
    {
      id: 'the-summit', name: 'THE SUMMIT', cols: 81,
      heights: [
        /* 0-26 off the top station: a long run-out (a running jump off the deck lands on it with 2.5 tiles to spare), a 5-wide ski run c12-16 (QA 2026-10-28: was c11-15), down (c18-21), a 5-wide gap c26-30 begins */
        112,112,112,112,112,112,112,112,112,112,112,112,null,null,null,null,null,112,120,128,136,144,144,144,144,144,null,
        /* 27-53 the 5-wide gap to c30, down (c36-37), a 4-wide gap c40-43 · the boss door's flat ground begins (local c44: the arena checkpoint, c47: its left gate) */
        null,null,null,null,144,144,144,144,144,152,160,160,160,null,null,null,null,160,160,160,160,160,160,160,160,160,160,
        /* 54-80 FLAT OPEN GROUND for the mini-boss arena (c48-71, the boss door c72), then the way on (the goal c77) */
        160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160
      ],
      tiles: {
        gift: [
          [5, 3], [22, 5], [33, 5],
          [45, 6, 'heart'],   /* a heart just before the arena's left gate (c47) */
          [76, 6]   /* past the boss door */
        ]
      },
      /* umbrella bats and crows over the ski runs, raccoons in the snow (the arena ground is left empty for the boss) */
      foes: [
        [13, 4, 'umbrellabat'], [4, 6, 'raccoon'], [22, 8, 'raccoon'],   /* S7 */
        [28, 6, 'crow'], [33, 8, 'raccoon'], [41, 6, 'umbrellabat']   /* S8 */
      ],
      candles: [
        [0, 6], [1, 6], [2, 6], [3, 6], [5, 6], [6, 6], [7, 6], [8, 6], [9, 6], [10, 6], [11, 5], [12, 4], [13, 3], [14, 3], [15, 3],
        [16, 4], [17, 5], [18, 6], [19, 7], [20, 7], [21, 8], [22, 8], [23, 8], [24, 8], [25, 7], [26, 6], [27, 5], [28, 5], [29, 6],
        [30, 7], [31, 8], [32, 8], [34, 8], [35, 8], [36, 9], [37, 9], [38, 9], [39, 8], [40, 7], [41, 6], [42, 6], [43, 7], [44, 8],
        [46, 9], [74, 9], [75, 9], [76, 9], [77, 9], [78, 9], [79, 9]   /* (the arena floor is left empty for the boss run) */
      ],
      /* the mini-boss: the Giant Banana Slug (index.html ARENA_KINDS['banana-slug'], 2 phases); its checkpoint flag stands at local c44 */
      arena: { col: 48, cols: 24, boss: 'banana-slug' },
      goal: { col: 77, row: 9 },   /* past the boss door: down the mountain to Granville Island */
      talk: [
        [2, 'DAD', 'The top of Grouse Mountain. You can see the whole city from up here!', 3.4],
        [41, 'KINAN', 'The snow up ahead is all shiny and slimy. Something BIG went this way...', 4]
      ]
    }
  ]
});

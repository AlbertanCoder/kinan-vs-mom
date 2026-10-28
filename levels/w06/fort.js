/* ============================================================
   FORT · THE SWINGING BRIDGE  (World 6 · Drumheller · trail stop 6)
   Story bible (World 6 table): "The wobbly suspension bridge at
   Rosedale; a magpie flock guards it." Long ago the coal miners walked
   to the Star Mine across the Red Deer River on a swinging bridge, and
   it still hangs there today, a long wooden walkway on steel ropes that
   sways when you walk on it. A summer storm is rolling in, Glitchy's
   on the far bank, and a flock of magpies has taken over the bridge.
   They grab anything shiny. Like candles.
   Idea: THE SWAY. The bridge wobbles under Kinan's feet, sags in the
     middle like a hammock, and has planks missing; the magpies swoop in
     and grab candles (stomp one to get its candle back).
   Built as THREE AREAS, three stretches of the crossing; the seam
     banners slide in as Kinan walks between them:
     THE MINERS' TRAIL (0-80) the trailhead and a 3-wide gap, the old
       coal cars, two 3-wide gaps, up the riverbank to the bridge tower
       and a 3-wide gap ·
     THE SWINGING BRIDGE (81-161) onto the deck: two 4-wide holes as it
       sags, the low middle (a BOWL) with the checkpoint and a 4-wide
       hole, two 4-wide holes as it climbs to the far tower; magpies
       all the way ·
     THE STAR MINE BANK (162-242) two 5-wide gaps down the bank, the mine
       yard and two 5-wide gaps, then FLAT OPEN GROUND to the boss door:
       local c47-72 of this area is left flat and empty for the
       mini-boss arena, and the goal stands past it (local c77).
   The mini-boss: the magpie flock (2026-10-28, boss engine):
     arena: { col: 48, cols: 24, boss: 'magpies' } on THE STAR MINE
     BANK; its checkpoint flag stands at local c44 (ground), and the
     candles on the arena floor are gone.
   Gaps: area 1 3/3/3/3 · area 2 4/4/4/4/4 · area 3 5/5/5/5, a fair step up
     from 5-fort (3/3/3, 4/4/4/4, 5/5/5): one more gap in every stretch,
     the sway under your feet, and the magpies. Every gap has a candle
     arc; nothing waits at a gap's lip.
   Fort slot: exempt from the 3-secrets lint (docs/LEVEL-AUTHORING.md
     §5.5), so no secrets. No pet: all six are found by World 5. Two
     hearts: a gift in the middle of the bridge (local c35) and one at
     the foot of the boss door (local c45).
   Look: borrows the Suspension Bridge (theme 44): rope handrails along
     the deck, the sway, rain on the river.
   ENGINE REQUESTS: the World 6 fort mini-boss (the magpie flock) and its
     arena (see above) · a swinging-bridge skin (wooden planks on steel
     ropes, the two towers) for the deck ground · coal-car skins for the
     solid blocks on the trail · the river drawn under the bridge ·
     bubbles ER-4 (c2 Shad: "The miners crossed here every day!" · c86
     Kinan: "It's MOVING. The bridge is moving!" · c115 Chenoa: "Those
     magpies took my candles!" · c205 Robin: "The old mine's right up
     there. Glitchy went in!").
   ============================================================ */
KinanLevels.register({
  id: '6-fort', world: 6, slot: 6, kind: 'fort',
  name: 'THE SWINGING BRIDGE',
  theme: 44,   /* the Suspension Bridge: rope handrails along the deck, the sway, rain on the river */
  spawn: { col: 2, row: 11 },
  areas: [
    {
      id: 'miners-trail', name: 'THE MINERS\' TRAIL', cols: 81,
      heights: [
        /* 0-26 the trailhead at Rosedale: a little rise (c6-10), a 3-wide gap c14-16 */
        192,192,192,192,192,192,184,176,176,176,176,184,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,
        /* 27-53 the old coal cars (c29-31) · two 3-wide gaps c37-39 and c46-48 */
        192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,null,null,null,192,192,192,192,192,
        /* 54-80 up the riverbank (c58-61) to the bridge tower, a 3-wide gap c68-70 */
        192,192,192,192,184,176,168,160,160,160,160,160,160,160,null,null,null,160,160,160,160,160,160,160,160,160,160
      ],
      solid: [
        [24, 10, 24, 11],   /* a trail post */
        [29, 10, 31, 11]   /* the coal cars on the old rail */
      ],
      tiles: {
        gift: [
          [5, 8, 'popper'],   /* S1 */
          [34, 8], [52, 8],   /* S2 */
          [64, 6], [76, 6]   /* S3 */
        ],
        brick: [
          [4, 8], [6, 8],   /* S1 */
          [33, 8], [35, 8],   /* S2 */
          [63, 6], [65, 6]   /* S3 */
        ]
      },
      /* gophers on the trail, raccoons, the first magpies; nothing waits at a lip */
      foes: [
        [21, 11, 'gopher'],   /* S1 */
        [43, 11, 'raccoon'],   /* S2 */
        [56, 4, 'magpie'], [78, 9, 'gopher']   /* S3 */
      ],
      candles: [
        [2, 11], [3, 11], [4, 11], [5, 11], [7, 10], [8, 9], [9, 9], [10, 10], [13, 11], [14, 9], [15, 8], [16, 8], [17, 9], [18, 11],
        [19, 11], [21, 11], [23, 11], [29, 9], [30, 9], [31, 9], [36, 11], [37, 9], [38, 8], [39, 8], [40, 9], [41, 11], [42, 11], [43, 11],
        [44, 11], [45, 11], [46, 9], [47, 8], [48, 8], [49, 9], [50, 11], [51, 11], [52, 11], [53, 11], [58, 10], [59, 10], [60, 9], [61, 9],
        [62, 9], [64, 9], [66, 9], [67, 9], [68, 7], [69, 6], [70, 6], [71, 7], [72, 9], [73, 9], [75, 9], [77, 9], [79, 9]
      ]
    },
    {
      id: 'swinging-bridge', name: 'THE SWINGING BRIDGE', cols: 81,
      heights: [
        /* 0-26 onto the deck: a 4-wide hole c5-8, the deck sags (c13-14), a 4-wide hole c18-21 */
        160,160,160,160,160,null,null,null,null,160,160,160,160,168,176,176,176,176,null,null,null,null,176,176,176,176,176,
        /* 27-53 the low middle of the bridge (a BOWL, c30-46) and the checkpoint · a 4-wide hole c40-43 */
        176,176,176,184,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,184,176,176,176,
        /* 54-80 up to the far tower: 4-wide holes c57-60 and c68-71 */
        176,176,176,null,null,null,null,176,176,176,168,160,160,160,null,null,null,null,160,160,160,160,160,160,160,160,160
      ],
      tiles: {
        gift: [
          [11, 6], [24, 7],   /* S4 */
          [35, 8, 'heart'],   /* the heart in the middle of the bridge */
          [50, 7],   /* S5 */
          [76, 6]   /* S6 */
        ],
        brick: [
          [23, 7], [25, 7],   /* S4 */
          [34, 8], [36, 8],   /* S5 */
          [75, 6], [77, 6]   /* S6 */
        ]
      },
      /* the magpie flock swoops over the holes; raccoons on the low deck */
      foes: [
        [8, 4, 'magpie'], [20, 5, 'magpie'],   /* S4 */
        [36, 11, 'raccoon'], [42, 5, 'magpie'],   /* S5 */
        [59, 4, 'magpie'], [70, 5, 'magpie'], [78, 9, 'raccoon']   /* S6 */
      ],
      candles: [
        [0, 9], [1, 9], [2, 9], [3, 9], [4, 9], [5, 7], [6, 6], [7, 6], [8, 6], [9, 7], [10, 9], [11, 9], [12, 9], [13, 9],
        [14, 9], [17, 10], [18, 8], [19, 7], [20, 7], [21, 7], [22, 8], [23, 10], [24, 10], [25, 10], [26, 10], [27, 10], [28, 10], [29, 10],
        [30, 10], [31, 10], [32, 11], [34, 11], [36, 11], [38, 11], [39, 11], [40, 9], [41, 8], [42, 8], [43, 8], [44, 9], [45, 11], [46, 11],
        [47, 11], [48, 11], [49, 11], [50, 10], [51, 10], [52, 10], [53, 10], [54, 10], [56, 10], [57, 8], [58, 7], [59, 7], [60, 7], [61, 8],
        [62, 10], [63, 10], [64, 9], [65, 9], [67, 9], [68, 7], [69, 6], [70, 6], [71, 6], [72, 7], [73, 9], [74, 9], [76, 9], [78, 9],
        [80, 9]
      ],
      checkpoint: { col: 33, row: 11 }
    },
    {
      id: 'star-mine-bank', name: 'THE STAR MINE BANK', cols: 81,
      heights: [
        /* 0-26 off the bridge: 5-wide gaps c4-8 and c12-16 down the bank */
        160,160,160,160,null,null,null,null,null,160,160,160,null,null,null,null,null,176,176,176,176,176,176,176,176,176,176,
        /* 27-53 the mine yard: 5-wide gaps c28-32 and c39-43 · the boss door's flat ground begins (local c44: the arena checkpoint, c47: its left gate) */
        176,null,null,null,null,null,176,176,176,184,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,
        /* 54-80 FLAT OPEN GROUND for the mini-boss arena (c48-71, the boss door c72), then the way on (the goal c77) */
        192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
      ],
      solid: [
        [22, 9, 23, 10]   /* the coal tipple */
      ],
      tiles: {
        gift: [
          [19, 7],   /* S7 */
          [45, 8, 'heart'],   /* the heart at the foot of the boss door */
          [76, 8]   /* past the boss door */
        ]
      },
      /* the last magpies over the gaps (the flock itself is the mini-boss: none on its ground) */
      foes: [
        [7, 4, 'magpie'], [14, 5, 'magpie'], [25, 10, 'gopher'],   /* S7 */
        [30, 5, 'magpie'], [41, 4, 'magpie']   /* S8 */
      ],
      candles: [
        [0, 9], [1, 9], [2, 9], [3, 9], [4, 7], [5, 6], [6, 6], [7, 6], [8, 7], [9, 9], [10, 9], [11, 9], [12, 8], [13, 7],
        [14, 7], [15, 7], [16, 8], [17, 10], [18, 10], [19, 10], [20, 10], [21, 10], [26, 10], [27, 10], [28, 8], [29, 7], [30, 7], [31, 7],
        [32, 8], [33, 10], [34, 10], [35, 10], [36, 10], [37, 10], [38, 11], [39, 9], [40, 8], [41, 8], [42, 8], [43, 9], [44, 11], [46, 11],
        [74, 11], [75, 11], [76, 11], [77, 11], [78, 11], [79, 11]   /* (the arena floor's candles went with the mini-boss) */
      ],
      /* the mini-boss: the magpie flock (index.html ARENA_KINDS.magpies, 2 phases); its checkpoint flag stands at local c44 */
      arena: { col: 48, cols: 24, boss: 'magpies' },
      goal: { col: 77, row: 11 }   /* past the boss door: on to the river ferry */
    }
  ]
});

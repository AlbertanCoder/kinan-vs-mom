/* ============================================================
   FORT · THE MIDWAY  (World 5 · Calgary Stampede · trail stop 5)
   Story bible (World 5 table): "The Carnival Barker's game booths and
   the Ferris wheel." Bronco charged straight through the midway: rides,
   lights, mini donuts, the biggest Ferris wheel Kinan has ever seen.
   Glitchy's panic zapped every game: the prize balls bounce on their
   own, the mini donuts hop, the fireworks fly sideways, and the Carnival
   Barker won't let anyone past his stage without playing.
   Idea: THE GAMES. Kinan plays his way down the midway: the milk-bottle
     booths (bricks to bust), TEST YOUR STRENGTH (a springboard that rings
     the bell and throws you over its 5-tall tower), the Ferris wheel's
     gondolas (an optional loop up and over for candles and the view),
     and the Barker's stage at the end.
   Built as THREE AREAS, three stretches of the midway; the seam banners
     slide in as Kinan walks between them:
     THE GAME BOOTHS (0-77) the gate, the ring toss, a 3-wide gap, the
       milk bottles, the dunk-tank BROW and a 3-wide gap, TEST YOUR
       STRENGTH, room to land, a 3-wide gap ·
     THE FERRIS WHEEL (78-155) a 4-wide gap, the ticket booth and the
       wheel's gondolas (optional, up and over), a 4-wide gap under it,
       the checkpoint, the big-top RIDGE, two 4-wide gaps ·
     THE BARKER'S STAGE (156-233) a 5-wide gap, TEST YOUR STRENGTH again
       (a 6-tall tower), two 5-wide gaps, then
       the Barker's stage: his boss ARENA (B2, 2026-10-28: gates rise,
       2 phases), and the goal a few steps past his door.
   The mini-boss (index.html ARENA_KINDS.barker, 2 phases):
     1 (dumb)     tosses two bouncing prize balls at where Kinan IS,
                  twice, then stops to count his toonies — STOMP!
     2 (smarter)  FAKES a toss (the real one starts with a STOMP) and
                  aims where Kinan is GOING; new: ring-toss rings fall on
                  shadows marked on the floor, then balls, then a prize
                  ball rolled along the stage; two mini donuts hop in.
     Befriended: "You cleaned out my booth! Here, kid. Take the moose."
   Gaps: area 1 3/3/3 · area 2 4/4/4/4 · area 3 5/5/5, a fair step up
     from 4-fort (3/3/3, 4/4/4, 5/5/5): one more gap per stretch and two
     springboard towers. Every gap has a candle arc; nothing waits at a
     gap's lip or on the island between two gaps.
   Fort slot: exempt from the 3-secrets lint (docs/LEVEL-AUTHORING.md
     §5.5), so no secrets. Two hearts: a free mini-donut bag on the
     ticket booth (c91) and one at the foot of the stage (c202).
   Look: borrows the Midway (theme 35): a sunset sky, the rides and the
     Ferris wheel, pink lights.
   ENGINE REQUESTS: (the fort mini-boss arena landed in B2: area 3's
     { col: 48, cols: 24, boss: 'barker' }, its checkpoint at local c44;
     the stage's three foes came out and area 3 grew 8 columns so the
     goal stands a few steps past the boss door; his voice lines say a
     giant plush MOOSE, so the prize is the moose, not a bull) · a rideable Ferris wheel (gondolas that turn, as
     moving shelves) · a strongman bell that rings when the springboard
     throws Kinan past it · prize-ball / mini-donut skins for the 'ball'
     and 'cupcake' hoppers · bubbles ER-4 (c2 Chenoa: "Bronco went past
     the ring toss! I saw him!" · c58 Shad: "Test your strength, bud!"
     · c92 Kinan: "The Ferris wheel! Can I go UP?" · c206 the Barker:
     "STEP RIGHT UP! Nobody walks past MY booth!").
  
   ============================================================ */
KinanLevels.register({
  id: '5-fort', world: 5, slot: 5, kind: 'fort',
  name: 'THE MIDWAY',
  theme: 35,              /* the Midway: a sunset sky, the rides and the Ferris wheel, pink lights */
  spawn: { col: 2, row: 11 },
  areas: [
    {
      id: 'game-booths', name: 'THE GAME BOOTHS', cols: 78,
      heights: [
        /* 0-26 the midway gate · the ring-toss booth (c8-11) · a 3-wide gap c14-16 · the milk bottles */
        192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,
        /* 27-53 the dunk-tank BROW (c30-43) · a 3-wide gap c46-48 */
        192,192,192,184,176,168,160,160,160,160,160,160,160,168,176,184,192,192,192,null,null,null,192,192,192,192,192,
        /* 54-77 TEST YOUR STRENGTH: the springboard (c58) throws you over the bell tower (c59-62) · room to land · a 3-wide gap c70-72 */
        192,192,192,192,null,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192
      ],
      solid: [
        [8, 10, 11, 11],   /* the ring-toss counter */
        [59, 7, 60, 11], [61, 9, 62, 11]   /* TEST YOUR STRENGTH: the bell tower (5 tall) and its back step */
      ],
      tiles: {
        gift: [
          [4, 8, 'popper'],   /* the gate */
          [20, 7], [22, 7],   /* the milk bottles */
          [37, 5],   /* over the brow */
          [67, 8]   /* after the bell */
        ],
        brick: [
          [19, 8], [20, 8], [21, 8], [22, 8], [23, 8], [21, 7],   /* the milk-bottle pyramid */
          [36, 5], [38, 5],   /* over the brow */
          [66, 8], [68, 8]
        ],
        spring: [
          [58, 12]   /* TEST YOUR STRENGTH: the springboard, flush in the boardwalk */
        ],
        shelf: [
          [7, 6], [8, 6], [9, 6], [10, 6], [11, 6], [12, 6]   /* the ring-toss awning */
        ]
      },
      /* corn dogs run, prize balls and mini donuts hop at you, fireworks fly; nothing waits at a lip */
      foes: [
        [24, 11, 'corndog'],
        [37, 9, 'ball'],   /* on the brow */
        [52, 11, 'cupcake'],
        [68, 3, 'sparkler']   /* high over the last gap */
      ],
      candles: [
        [2, 11], [3, 11], [4, 7], [8, 9], [9, 9], [10, 9], [11, 9], [8, 5], [11, 5], [13, 11], [14, 9], [15, 8], [16, 9], [17, 11],
        [19, 7], [23, 7], [21, 6], [25, 11], [26, 11], [30, 10], [31, 9], [32, 8], [34, 9], [36, 9], [38, 9], [37, 4], [41, 9], [42, 10],
        [45, 11], [46, 9], [47, 8], [48, 9], [49, 11], [50, 11], [51, 11], [56, 11], [57, 11], [58, 10], [58, 8], [59, 5], [60, 5], [61, 3],
        [62, 3], [63, 4], [64, 6], [65, 9], [66, 11], [67, 11], [68, 11], [69, 11], [70, 9], [71, 8], [72, 9], [73, 11], [74, 11], [75, 11],
        [76, 11]
      ]
    },
    {
      id: 'ferris-wheel', name: 'THE FERRIS WHEEL', cols: 78,
      heights: [
        /* 0-26 a 4-wide gap c3-6 · the ticket booth (c12-15) · the Ferris wheel's gondolas up and over (c17-32) */
        192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
        /* 27-53 a 4-wide gap c31-34 under the wheel · checkpoint · the big-top RIDGE (c41-52) */
        192,192,192,192,null,null,null,null,192,192,192,192,192,192,184,176,168,160,160,160,160,160,168,176,184,192,192,
        /* 54-77 two 4-wide gaps c57-60 and c66-69 */
        192,192,192,null,null,null,null,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192
      ],
      solid: [
        [12, 10, 15, 11]   /* the ticket booth */
      ],
      tiles: {
        gift: [
          [13, 7, 'heart'],   /* the free mini-donut bag on the ticket booth */
          [46, 5],   /* over the ridge */
          [63, 8]
        ],
        brick: [
          [45, 5], [47, 5],
          [62, 8], [64, 8]
        ],
        shelf: [
          [17, 7], [18, 7], [19, 4], [20, 4], [22, 2], [23, 2], [26, 2], [27, 2], [29, 4], [30, 4], [31, 7], [32, 7]   /* the Ferris wheel's gondolas, up and over (optional) */
        ]
      },
      foes: [
        [9, 11, 'cupcake'],
        [25, 5, 'sparkler'],
        [38, 11, 'corndog'],
        [46, 9, 'ball'],   /* on the ridge */
        [52, 4, 'sparkler'],
        [62, 3, 'sparkler'], [72, 3, 'sparkler']   /* high over the gaps */
      ],
      candles: [
        [0, 11], [1, 11], [2, 11], [3, 9], [4, 8], [5, 8], [6, 9], [7, 11], [8, 11], [9, 11], [10, 11], [12, 9], [13, 9], [14, 9],
        [15, 9], [13, 6], [17, 6], [18, 6], [19, 3], [20, 3], [22, 1], [23, 1], [24, 0], [25, 0], [26, 1], [27, 1], [29, 3], [30, 3],
        [31, 6], [32, 6], [18, 11], [20, 11], [22, 11], [24, 11], [26, 11], [28, 11], [30, 11], [31, 9], [32, 8], [33, 8], [34, 9], [35, 11],
        [36, 11], [37, 11], [41, 10], [42, 9], [43, 8], [45, 9], [46, 9], [47, 9], [48, 9], [46, 4], [50, 9], [51, 10], [54, 11], [55, 11],
        [56, 11], [57, 9], [58, 8], [59, 8], [60, 9], [61, 11], [63, 7], [65, 11], [66, 9], [67, 8], [68, 8], [69, 9], [70, 11], [71, 11],
        [73, 11], [75, 11]
      ],
      checkpoint: { col: 37, row: 11 }
    },
    {
      id: 'barkers-stage', name: 'THE BARKER\'S STAGE', cols: 86,
      heights: [
        /* 0-26 a 5-wide gap c3-7 · TEST YOUR STRENGTH again: the springboard (c15), the 6-tall tower (c16-19) · room to land */
        192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,null,192,192,192,192,192,192,192,192,192,192,192,
        /* 27-53 two 5-wide gaps c29-33 and c38-42 · the foot of the stage */
        192,192,null,null,null,null,null,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,
        /* 54-85 THE BARKER'S STAGE: the checkpoint c44, the arena gate c47, his 24 tiles of stage c48-71,
           the boss door c72 · 73-85 the way out (the goal) */
        192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
        192,192,192,192,192,192,192,192
      ],
      solid: [
        [16, 6, 17, 11], [18, 9, 19, 11]   /* TEST YOUR STRENGTH: the big tower (6 tall) and its back step */
      ],
      tiles: {
        gift: [
          [11, 8],
          [46, 8, 'heart']   /* the heart at the foot of the stage */
        ],
        brick: [
          [10, 8], [12, 8]
        ],
        spring: [
          [15, 12]   /* TEST YOUR STRENGTH: the big springboard */
        ]
      },
      /* the Barker himself is the arena's boss: no foes on his stage */
      foes: [
        [24, 4, 'sparkler'],
        [36, 3, 'sparkler']
      ],
      candles: [
        [0, 11], [1, 11], [2, 11], [3, 9], [4, 8], [5, 8], [6, 8], [7, 9], [8, 11], [9, 11], [11, 7], [13, 11], [14, 11], [15, 10],
        [15, 8], [16, 4], [17, 4], [18, 7], [19, 7], [20, 3], [21, 4], [22, 6], [23, 9], [24, 11], [26, 11], [28, 11], [29, 9], [30, 8],
        [31, 8], [32, 8], [33, 9], [34, 11], [35, 11], [36, 11], [37, 11], [38, 9], [39, 8], [40, 8], [41, 8], [42, 9], [43, 11], [44, 11],
        [45, 11], [46, 7], [74, 11], [75, 11], [76, 11], [78, 11], [81, 11], [82, 11]
      ],
      arena: { col: 48, cols: 24, boss: 'barker' },   /* 2 phases (the default for him); its own checkpoint flag stands at c44 */
      pet: { id: 'cat4', col: 24, row: 11 },   /* Tuxedo, rescued from the noisy midway: his crate on the stage floor before the last gaps, on the way */
      goal: { col: 79, row: 11 }   /* past the Barker's door: on to the Peace Bridge */
    }
  ]
});

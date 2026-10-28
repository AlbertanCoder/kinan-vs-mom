/* ============================================================
   LEVEL 4-3 · CHENOA'S BUS RIDE
   (World 4 · Edmonton Homecoming · trail stop 3)
   Story bible (World 4 table): "Ride the LRT and buses across the
   city." Chenoa is running a dinner rush and can't leave the kitchen,
   so she texts Kinan the route: the bus downtown, the LRT under the
   city, then over the river. "Real Edmontonians ride transit. Don't
   let the magpies take your candles." Everything is closed for
   repairs, of course, so Kinan has to find his own way through.
   Idea (ONE): BREAK THROUGH. When the way is blocked, look UP: bump the
     bricks over your head, then jump through the hole you made. Act 1
     teaches it at the bus stop (bricks with a gift, the transit-centre
     walkway that ends at a wall, a bus-shelter roof with a cone on it:
     break the brick under him). Act 2 twists it underground: THE CLIMB
     OUT, the escalators are broken, so break up through two floors of
     the station, one after the other; a wet-floor sign rides a brick
     shelf. Act 3 tests it on the river bridge: break up through the
     repair scaffold, climb the barricade and jump the river from the
     top, then the masts.
   Areas (in-level seams, Contract §4.1; a banner slides in at each):
     THE BUS STOP (0-80) the stop and the bus, THE TRANSIT CENTRE, a bus
       shelter, a 3-wide curb gap ·
     DOWNTOWN STATION (81-161) down the escalator, the tracks (4), the
       checkpoint, THE CLIMB OUT (two floors), the stairs, the tracks
       (4), up the escalator ·
     THE RIVER BRIDGE (162-242) the river (4), the repair scaffold and
       the barricade, the river (5), the overhead-wire masts, the river
       (4), the far bank and the university stop.
     (Column numbers in these notes are counted from the start of the
     level; each area's own columns start at 0.)
   Signature set-piece: THE CLIMB OUT (S5): break up through the roof of
     the lower passage, walk the middle floor, break up again, out on
     top of the station.
   Secrets: visible = the power-line crossbar right over the
     barricade, at the edge of the big river gap: stop on top of the
     barricade and jump straight UP to it before you jump across (heart
     + candles, 185,3) ·
     hidden = on top of THE CLIMB OUT, a glinting spot in the station
     ceiling: jump and bump it (GOLDEN CANDLE, 128,2) · skill = THE
     MASTS: two narrow mast tops lead up to the train deck over the
     river walkway; one careful hop at a time (hat, 201,2).
   Look: Chenoa's Bus Ride look (theme 22): blue sky, grey city, blue
     transit-coloured bricks.
   Bubble beats for ER-4 (not wired): c2 Chenoa (text): "Bus downtown,
     then the train. Text me when you're there. DON'T talk to the
     magpies." · c47 Kinan: "The walkway's blocked... unless I go UP."
     · c84 the station speaker: "Please stand back from the platform
     edge. And watch your little brother." · c104 checkpoint, a busker
     plays the oldest song in the world on a kazoo · c118 Kinan: "The
     escalator's broken? Fine. I'll make my own way up." · c165 the
     train driver: "The bridge is closed for repairs. Again." · c239
     Chenoa (text): "On time! Point for me. Now get over here, I've got
     a rush on." Dad's joke (World 4 joke book): "Why did the bus stop?
     It saw the bus SHELTER and got scared."
   ENGINE REQUESTS: rideable moving trains and buses (the bible's "ride
     the LRT": a train you stand on that carries you between stations,
     doors that open) · in-level seams that read as stops ("NEXT STOP:
     DOWNTOWN" banner style) · an underground look for the station area
     (per-area themes) · a busker whose notes are just music (the
     'busker' thrower stands in) · a power-line mast skin for the narrow
     shelves · Chenoa's texts as phone bubbles (ER-4).
   ============================================================ */
KinanLevels.register({
  id: '4-3', world: 4, slot: 3, kind: 'level',
  name: "CHENOA'S BUS RIDE",
  theme: 22,                /* Chenoa's Bus Ride look: blue sky, grey city, blue transit bricks */
  spawn: { col: 2, row: 11 },
  areas: [
    {
      id: 'bus-stop', name: 'THE BUS STOP', cols: 81,
      /* S1-S3: the stop, THE TRANSIT CENTRE (break up through its canopy), a bus shelter, the curb gap c70-72 (3) */
      heights: [
        192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
        192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
        192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192
      ],
      solid: [
          [20, 9, 25, 11], [32, 4, 36, 9], [37, 9, 44, 9], [47, 9, 47, 11], [58, 9, 59, 9], [63, 9, 66, 9]
      ],
      tiles: {
        gift: [[16, 8, "candle"], [23, 5, "candle"], [39, 9, "popper"]],
        brick: [[14, 8], [15, 8], [17, 8], [45, 9], [46, 9], [60, 9], [61, 9], [62, 9]]
      },
      foes: [
          [10, 4, 'magpie'], [52, 11, 'hopcone'], [61, 8, 'cone']
      ],
      candles: [
          [3, 11], [4, 11], [5, 11], [9, 11], [10, 11], [14, 11], [15, 11], [16, 11], [17, 11], [19, 10], [20, 8], [22, 8],
          [24, 8], [25, 8], [26, 9], [30, 11], [31, 11], [33, 11], [34, 11], [35, 11], [36, 11], [37, 11], [38, 11], [40, 11],
          [41, 11], [42, 11], [43, 11], [45, 8], [46, 7], [47, 8], [56, 11], [57, 11], [59, 11], [60, 11], [61, 11], [62, 11],
          [63, 11], [64, 7], [65, 7], [69, 10], [70, 9], [71, 8], [72, 9], [73, 10], [77, 11], [78, 11]
      ]
    },
    {
      id: 'downtown-station', name: 'DOWNTOWN STATION', cols: 81,
      /* S4-S6: down the escalator, the tracks c92-95 (4), the checkpoint, THE CLIMB OUT (two floors), the tracks c146-149 (4), up the escalator */
      heights: [
        192,192,200,208,208,208,208,208,208,208,208,null,null,null,null,208,208,208,208,208,208,208,208,208,208,208,208,
        208,208,208,208,208,208,208,208,208,208,208,208,208,208,208,208,208,208,208,208,208,208,208,208,208,208,208,
        208,208,208,208,208,208,208,208,208,208,208,null,null,null,null,208,208,208,208,208,208,208,208,200,192,192,192
      ],
      solid: [
          [0, 0, 80, 2], [27, 10, 34, 10], [27, 8, 34, 9], [37, 10, 43, 12], [27, 7, 41, 7], [44, 7, 50, 12],
          [51, 8, 51, 12], [52, 9, 52, 12], [53, 10, 53, 12], [54, 11, 54, 12]
      ],
      tiles: {
        gift: [[8, 9, "candle"], [18, 9, "heart"], [47, 2, "gold"], [73, 9, "candle"]],
        brick: [[6, 9], [7, 9], [9, 9], [35, 10], [36, 10], [42, 7], [43, 7], [57, 9],
               [58, 9], [59, 9], [60, 9], [61, 9]]
      },
      foes: [
          [17, 12, 'busker'], [20, 12, 'mallwalker'], [47, 6, 'rollerblader'], [59, 8, 'wetsign'], [71, 12, 'busker'], [75, 12, 'mallwalker']
      ],
      candles: [
          [1, 11], [2, 11], [4, 12], [5, 12], [10, 11], [11, 10], [12, 9], [13, 9], [14, 10], [15, 11], [19, 12], [20, 12],
          [25, 12], [26, 12], [28, 12], [29, 12], [30, 12], [31, 12], [32, 12], [33, 12], [34, 12], [37, 9], [38, 9], [39, 9],
          [40, 9], [41, 9], [44, 6], [45, 6], [46, 6], [48, 6], [49, 6], [50, 6], [56, 12], [57, 12], [62, 12], [64, 11],
          [65, 10], [66, 9], [67, 9], [68, 10], [69, 11], [78, 11], [79, 11]
      ],
      secrets: [
        {kind:  'hidden',  col:  47,  row:  2,  prize:  'GOLDEN CANDLE',  glint240:  true}
      ],
      goldenCandle: { col: 47, row: 2 },
      checkpoint: { col: 23, row: 12 }
    },
    {
      id: 'river-bridge', name: 'THE RIVER BRIDGE', cols: 81,
      /* S7-S9: the river c167-170 (4), the repair scaffold and the barricade, the river c187-191 (5), the masts, the river c207-210 (4), the far bank */
      heights: [
        192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,
        null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,
        192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
      ],
      solid: [
          [14, 4, 15, 8], [14, 9, 17, 9], [20, 9, 20, 11], [21, 7, 24, 11]
      ],
      tiles: {
        gift: [[29, 8, "candle"], [56, 8, "heart"], [66, 8, "cake"]],
        brick: [[18, 9], [19, 9], [52, 8], [53, 8], [55, 8], [57, 8]],
        spring: [[61, 11]],
        shelf: [[22, 4], [23, 4], [24, 4], [31, 9], [34, 6], [37, 3], [38, 3], [39, 3],
               [40, 3], [41, 3]]
      },
      foes: [
          [10, 11, 'cone'], [27, 2, 'magpie'], [32, 11, 'hopcone'], [39, 11, 'pothole'], [46, 6, 'magpie'], [51, 11, 'biker'],
          [74, 6, 'magpie']
      ],
      candles: [
          [1, 11], [2, 11], [4, 10], [5, 9], [6, 8], [7, 8], [8, 9], [9, 10], [15, 11], [16, 11], [17, 11], [18, 11],
          [19, 11], [21, 6], [22, 6], [23, 6], [24, 6], [22, 3], [24, 3], [25, 7], [26, 6], [27, 6], [28, 7], [29, 8],
          [30, 9], [30, 11], [31, 8], [34, 5], [36, 4], [37, 2], [41, 2], [43, 10], [44, 9], [45, 8], [46, 8], [47, 8],
          [48, 9], [49, 10], [54, 11], [58, 11], [61, 8], [61, 5], [60, 3], [61, 2], [62, 2], [63, 3], [68, 11], [69, 11],
          [71, 11], [72, 11], [73, 11], [75, 11]
      ],
      secrets: [
        {kind:  'visible',  col:  23,  row:  3,  prize:  'heart+candles'},
        {kind:  'skill',  col:  39,  row:  2,  prize:  'hat'}
      ],
      goal: { col: 77, row: 11 }
    }

  ]
});

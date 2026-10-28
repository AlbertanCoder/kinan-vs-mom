/* ============================================================
   FORT · THE INDOOR ROLLERCOASTER  (World 4 · Edmonton Homecoming · trail stop 6)
   Story bible (World 4 table): "The Coaster Conductor's ride." Past the
   ice rink is the mall's indoor amusement park, and the big looping
   rollercoaster runs right up to the glass roof. Glitchy zapped the
   ride: the empty coaster cars roll around the track on their own, the
   ride-photo cameras flash at everyone, and the Coaster Conductor won't
   let anyone off his platform until he gets his train back.
   Idea: THE TRACK. Kinan runs the coaster's own terrain: up the lift
     hill (steep: half speed going up), down the drops, through the big
     dip, and along the RAILS (shelves) that run over the gaps and the
     dip. Runaway coaster cars (walkers) roll along the track at him and
     the ride-photo cameras (flyers) swoop. Every stretch drops back to
     safe ground; the gaps are the honest part.
   Built as THREE AREAS, three stretches of the ride; the seam banners
     slide in as Kinan walks between them:
     THE LOADING STATION (0-71) the station, THE LIFT HILL (1:1 up and a
       1:1 drop), the first rail over a 3-wide gap, a 2:1 hill and a
       3-wide gap off its top, a 3-wide gap ·
     THE BIG DIP (72-143) a 4-wide gap, THE BIG DIP (a BOWL two tiles
       deep) with the chain rail high over it, a 4-wide gap, the
       checkpoint, the MESA, a 4-wide gap ·
     THE CORKSCREW (144-215) a 5-wide gap, up the corkscrew (1:1) and a
       5-wide gap jumped off its top, a 5-wide gap, then the Conductor's
       platform: his boss ARENA (B2, 2026-10-28), and the goal a few
       steps past his door.
   The mini-boss (index.html ARENA_KINDS.conductor, 2 phases):
     1 (dumb)     sends an empty coaster car rolling at Kinan (jump it),
                  then rides his own car across the track (jump him); it
                  stalls against the far gate — STOMP!
     2 (smarter)  FAKES (the real one starts with a STOMP); new: his
                  WHISTLE sends a shockwave both ways along the track
                  (jump it); then a car, then his ride.
     Befriended: "What a ride! Kid, you've got coaster legs. Come back
     anytime!"
   Gaps: area 1 3/3/3 (one with a rail over it) · area 2 4/4/4 · area 3
     5/5/5, a fair step up from 3-fort (2/3/3, 4/4/4/4, 5/5/4). Every
     gap has a candle arc; no car rolls near a gap's lip.
   Fort slot: exempt from the 3-secrets lint (docs/LEVEL-AUTHORING.md
     §5.5), so no secrets. Two hearts: free ride snacks (c116 and c190).
   Look: borrows the Indoor Rollercoaster (theme 25): the looping track
     under the mall's glass roof, purple light.
   ENGINE REQUESTS: (the fort mini-boss arena landed in B2: area 3's
     { col: 49, cols: 24, boss: 'conductor' }, its checkpoint at local
     c45; the platform's cars, gifts and camera came out and area 3 grew
     12 columns so the goal stands a few steps past the boss door) · a coaster-car skin for the 'cart'
     walker and a ride-photo flash for the 'camera' flyer · rail skins
     for the shelves (today wooden planks) · real coaster cars Kinan can
     ride (a moving platform on the rails) · bubbles ER-4 (c2 Chenoa:
     "One ride. Then the restaurant." · c72 "THE BIG DIP!" · c144 "The
     Conductor! He looks MAD." · c206 the Conductor: "ALL ABOARD! ...No?
     Then NOBODY rides!").
   ============================================================ */
KinanLevels.register({
  id: '4-fort', world: 4, slot: 6, kind: 'fort',
  name: 'THE INDOOR ROLLERCOASTER',
  theme: 25,                /* the Indoor Rollercoaster: the looping track under the glass roof */
  spawn: { col: 2, row: 11 },
  areas: [
    {
      id: 'loading-station', name: 'THE LOADING STATION', cols: 72,
      heights: [
        /* 0-26 the station (c0-11) · THE LIFT HILL up (c12-15, 1:1), its top (c16-21), the drop (c22-25, 1:1) */
        192,192,192,192,192,192,192,192,192,192,192,192,176,160,144,128,128,128,128,128,128,144,160,176,192,192,192,
        /* 27-53 a 3-wide gap c30-32 under the first rail · a 2:1 hill (c42-50) · a 3-wide gap c51-53 off its top */
        192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,184,176,168,160,160,160,160,160,160,null,null,null,
        /* 54-71 a 3-wide gap c61-63 · the end of the station loop */
        192,192,192,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192
      ],
      tiles: {
        gift: [[5, 8, 'popper'], [19, 4], [36, 8], [57, 8]],
        brick: [[4, 8], [6, 8], [35, 8], [37, 8]],
        shelf: [[28, 9], [29, 9], [30, 9], [31, 9], [32, 9], [33, 9], [34, 9]]   /* the first rail, over the gap */
      },
      /* a car rolls in the station, one on the lift hill's top, one past the first gap; a camera flashes at the end */
      foes: [[9, 11, 'cart'],
             [18, 7, 'cart'],
             [40, 11, 'cart'],
             [67, 5, 'camera']],
      candles: [[3, 11], [4, 7], [6, 7], [10, 11], [13, 9], [14, 8], [15, 7], [17, 7], [20, 7], [22, 7], [23, 8], [24, 9], [26, 11],
                [28, 8], [29, 8], [30, 8], [31, 8], [32, 8], [33, 8], [34, 8], [29, 10], [30, 10], [31, 10], [32, 10], [33, 10],
                [36, 7], [43, 10], [44, 9], [46, 9], [47, 9], [49, 9],
                [50, 8], [51, 7], [52, 7], [53, 8], [54, 10], [57, 7],
                [60, 10], [61, 9], [62, 8], [63, 9], [64, 10], [69, 11], [70, 11]]
    },
    {
      id: 'big-dip', name: 'THE BIG DIP', cols: 72,
      heights: [
        /* 0-26 a 4-wide gap c6-9 · THE BIG DIP (a BOWL c14-29, two tiles deep) under the chain rail */
        192,192,192,192,192,192,null,null,null,null,192,192,192,192,200,208,216,224,224,224,224,224,224,224,224,224,216,
        /* 27-53 the dip climbs out · a 4-wide gap c34-37 · the checkpoint · up to the MESA (c44-52) */
        208,200,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,176,160,144,144,144,144,144,144,144,160,
        /* 54-71 down · a 4-wide gap c59-62 · the end of the dip */
        176,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192
      ],
      tiles: {
        gift: [[3, 8], [22, 5], [44, 8, 'heart'], [49, 5], [67, 8]],   /* the heart is a free ride snack */
        brick: [[21, 5], [23, 5], [48, 5], [50, 5]],
        shelf: [[13, 9], [14, 9], [15, 9], [16, 9], [17, 9], [18, 9], [19, 9], [20, 9], [21, 9],
                [22, 9], [23, 9], [24, 9], [25, 9], [26, 9], [27, 9], [28, 9], [29, 9], [30, 9]]   /* THE CHAIN RAIL high over the dip */
      },
      foes: [[21, 13, 'cart'], [25, 6, 'camera'],
             [50, 8, 'cart'],
             [66, 11, 'cart']],
      candles: [[2, 11], [3, 7], [5, 10], [6, 9], [7, 8], [8, 8], [9, 9], [10, 10],
                [14, 8], [16, 8], [18, 8], [20, 8], [24, 8], [26, 8], [28, 8], [30, 8],
                [18, 13], [19, 13], [20, 13], [23, 13], [24, 13], [25, 13],
                [33, 10], [34, 9], [35, 8], [36, 8], [37, 9], [38, 10], [41, 11], [42, 11],
                [45, 9], [46, 8], [47, 8], [48, 4], [50, 4], [51, 8], [52, 8],
                [58, 10], [59, 9], [60, 8], [61, 8], [62, 9], [63, 10], [69, 11], [70, 11]],
      checkpoint: { col: 40, row: 11 }
    },
    {
      id: 'corkscrew', name: 'THE CORKSCREW', cols: 84,
      heights: [
        /* 0-26 a 5-wide gap c5-9 · up THE CORKSCREW (c16-19, 1:1) to its top (c20-23) · a 5-wide gap c24-28 off the top */
        192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,176,160,144,128,128,128,128,128,null,null,null,
        /* 27-53 the gap ends · a 5-wide gap c39-43 · THE CONDUCTOR'S PLATFORM begins (flat open ground) */
        null,null,192,192,192,192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,
        /* 54-83 THE CONDUCTOR'S PLATFORM: the checkpoint c45, the arena gate c48, his 24 tiles of track c49-72,
           the boss door c73 · 74-83 the way out (the goal) */
        192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
      ],
      tiles: {
        gift: [[2, 8], [21, 4], [46, 8, 'heart'], [78, 8]],   /* the heart is the second free ride snack */
        brick: [[20, 4], [22, 4], [77, 8], [79, 8]]
      },
      /* the Conductor himself is the arena's boss: no cars on his platform */
      foes: [[14, 11, 'cart']],
      candles: [[2, 7], [4, 10], [5, 8], [6, 7], [7, 6], [8, 7], [9, 8], [10, 10],
                [12, 11], [17, 9], [18, 8], [19, 7], [20, 3], [22, 3], [21, 7], [22, 7],
                [23, 6], [24, 5], [25, 5], [26, 5], [27, 6], [28, 7], [29, 9], [30, 10],
                [34, 11], [35, 11], [38, 10], [39, 8], [40, 7], [41, 6], [42, 7], [43, 8], [44, 10],
                [75, 11], [76, 11], [81, 11], [82, 11]],
      arena: { col: 49, cols: 24, boss: 'conductor' },   /* 2 phases (the default for him); its own checkpoint flag stands at c45 */
      goal: { col: 80, row: 11 }            /* past the Conductor's door: on to Shad's job site */
    }
  ]
});

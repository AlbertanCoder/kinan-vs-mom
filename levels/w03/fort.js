/* ============================================================
   FORT · THE BIG BULL MOOSE  (World 3 · Robin's oilfield · trail stop 6)
   Story bible (World 3 table): "A huge moose blocks the road; calm
   him, don't fight him." The gravel lease road leaves the pumpjacks
   and dives into the boreal forest: black spruce, willows, muskeg
   ponds and beaver dams. It rained last night. Somewhere ahead a bull
   moose is standing in the middle of the road, and Robin's truck
   can't get past him, so Kinan walks ahead.
   Idea: SWARMS. Clouds of mosquitoes (flyers) hang over the road at
     head height and higher: run UNDER a low cloud (it can't reach the
     ground), time your jump past a high one, or stomp one for a big
     bounce. The moose's yearlings (chargers) shout "!" and charge;
     they are penned by logs, and one can be tricked into charging off
     the end of a beaver dam into the pond.
   Built as THREE AREAS, three stretches of the road; the seam banners
     slide in as Kinan walks between them:
     THE SPRUCE ROAD (0-71) a fallen spruce, the first low cloud, a
       2-wide puddle, the corduroy BROW, a willow tunnel with a cloud
       over it, 3-wide muskeg holes ·
     THE MUSKEG (72-143) a corduroy road laid flush across a 4-wide
       pond with a cloud over it, THE BEAVER DAM (a MESA) with beavers
       hopping on it, a 4-wide pond, the checkpoint, a stepping log in a
       4-wide pond, a 4-wide pond under a crow, a fallen spruce
       under a cloud ·
     MOOSE CROSSING (144-215) a 5-wide hole, the yearling's pen, a
       5-wide hole, a TERRACE up to a beaver dam: the second yearling
       on the far bank sees you and charges straight into the pond,
       then the moose's clearing: his boss ARENA (B2, 2026-10-28), and
       the road on (the goal) a few steps past it.
   The mini-boss (index.html ARENA_KINDS.moose, 2 phases): calm him,
     don't fight him. The "stomp" is a PAT on his back.
     1 (dumb)     paws the mud and kicks a clod at where Kinan IS, then
                  CHARGES across the clearing (jump him) and bumps into
                  the far gate, puffed out — PAT!
     2 (smarter)  FAKES a charge (the real one starts with a STOMP);
                  two clods, a rolling log (jump it), then the charge;
                  two beavers ('gopher') waddle in.
     Calmed: he sniffs Kinan's hand; Robin: "Why did the moose cross
     the highway? To prove he wasn't chicken."
   Gaps: area 1 2/3/3 · area 2 4/4/4/4 (one with a flush corduroy
     road, one with a stepping log) · area 3 5/5/4. Every hole has a
     candle arc; low clouds hang only where there is no hole within
     five tiles (a hit can't knock Kinan into a pond), and stumps keep
     every walker off the landing spots.
   Fort slot: exempt from the 3-secrets lint (docs/LEVEL-AUTHORING.md
     §5.5), so no secrets. Two hearts: Grandma's lunch bags from Onion
     Lake ("for the road", c136 and c147).
   Look: borrows Stanley Park Forest (theme 43): tall dark spruce in
     the rain, the closest look to the boreal forest.
   ENGINE REQUESTS: (the fort mini-boss arena landed in B2: area 3's
     { col: 62, cols: 24, boss: 'moose' }; the clearing's stump,
     branches and foes came out (an arena is open ground) and area 3
     grew 24 columns. Not built: "stand still on the stump so he sniffs
     you" — the calm is a pat on his back while he is puffed out) · a 'mosquito
     swarm' skin (three dots per flyer) and a 'yearling moose' skin for
     the charger ('minibull' stands in), a 'beaver' hopper ('gopher'
     stands in) · muskeg water drawn in the pits · a corduroy-road skin
     for shelves · Grandma's lunch bag as a heal pickup (a heart gift
     today) · bubbles ER-4 (c2 Robin on the radio: "I'll wait with the
     truck. Don't poke the moose." · c72 "THE MUSKEG!" · c144 "Moose
     tracks. BIG moose tracks." · c206 the moose: "HHHRRRNNNK.").
   ============================================================ */
KinanLevels.register({
  id: '3-fort', world: 3, slot: 6, kind: 'fort',
  name: 'THE BIG BULL MOOSE',
  theme: 43,                /* borrows Stanley Park Forest: tall dark spruce in the rain (the boreal forest) */
  spawn: { col: 2, row: 11 },
  areas: [
    {
      id: 'spruce-road', name: 'THE SPRUCE ROAD', cols: 72,
      heights: [
        /* 0-26 a spruce stump, a fallen spruce (c14-16) under a low cloud · a 2-wide puddle c22-23 */
        192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,null,null,192,192,192,
        /* 27-53 the corduroy BROW (c28-35) · a 3-wide hole c40-42 · THE WILLOW TUNNEL (c46-52) */
        192,184,176,176,176,176,176,176,184,192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192,
        /* 54-71 a 3-wide hole c58-60 · a second fallen spruce · the end of the spruce road */
        192,192,192,192,null,null,null,192,192,192,192,192,192,192,192,192,192,192
      ],
      solid: [
        [9, 11, 9, 11],                     /* a spruce stump */
        [14, 10, 16, 11],                   /* a fallen spruce (2 tall) */
        [46, 9, 52, 9],                     /* THE WILLOW TUNNEL: a low roof of willows; run under it, or hop on top */
        [65, 10, 66, 11]                    /* a second fallen spruce */
      ],
      tiles: {
        gift: [[6, 8, 'popper'], [31, 6], [49, 5], [69, 8]],
        brick: [[5, 8], [7, 8]],
        shelf: [[40, 8], [41, 8], [42, 8]]  /* a plank across the first muskeg hole */
      },
      /* a low cloud over the fallen spruce (run under it, hop the log when it drifts away), a gopher popping out of its hole on the brow, a cloud on the willows */
      foes: [[12, 9, 'mosquito'],
             [32, 10, 'pothole'],
             [49, 6, 'mosquito']],
      candles: [[3, 11], [4, 11], [5, 7], [7, 7], [11, 11], [12, 11], [14, 9], [15, 9], [16, 9],
                [21, 10], [22, 9], [23, 9], [24, 10], [29, 9], [30, 8], [32, 8], [34, 8],
                [40, 7], [41, 7], [42, 7], [47, 11], [48, 11], [49, 11], [50, 11], [51, 11], [52, 11],
                [57, 10], [58, 9], [59, 8], [60, 9], [61, 10], [65, 9], [66, 9], [70, 11], [71, 11]]
    },
    {
      id: 'muskeg', name: 'THE MUSKEG', cols: 72,
      heights: [
        /* 0-26 a 4-wide pond c6-9 under the corduroy bridge · THE BEAVER DAM (MESA c14-25) */
        192,192,192,192,192,192,null,null,null,null,192,192,192,192,184,176,168,160,160,160,160,160,160,160,176,192,192,
        /* 27-53 a 4-wide pond c29-32 · the checkpoint · a 4-wide pond c41-44 with a stepping log */
        192,192,null,null,null,null,192,192,192,192,192,192,192,192,null,null,null,null,192,192,192,192,192,192,192,192,192,
        /* 54-71 a 4-wide pond c55-58 under a crow · the end of the muskeg */
        192,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192
      ],
      solid: [
        [42, 11, 43, 11],                   /* a stepping log floating in the third pond */
        [62, 10, 63, 11]                    /* a fallen spruce */
      ],
      tiles: {
        gift: [[3, 8], [20, 5], [37, 8], [64, 7, 'heart']],   /* the heart is Grandma's first lunch bag */
        shelf: [[6, 12], [7, 12], [8, 12], [9, 12]]   /* THE CORDUROY ROAD laid flush across the first pond: run over it, under the cloud */
      },
      foes: [[8, 8, 'mosquito'],
             [19, 9, 'gopher'], [22, 9, 'gopher'],
             [57, 2, 'crow'], [65, 9, 'mosquito']],
      candles: [[2, 11], [3, 11], [6, 11], [7, 11], [8, 11], [9, 11], [12, 11], [15, 9], [16, 8], [18, 8], [21, 8], [23, 8],
                [28, 10], [29, 9], [30, 8], [31, 8], [32, 9], [33, 10],
                [40, 10], [41, 9], [42, 9], [43, 9], [44, 9], [45, 10],
                [54, 10], [55, 9], [56, 8], [57, 8], [58, 9], [59, 10], [62, 9], [63, 9], [70, 11], [71, 11]],
      checkpoint: { col: 36, row: 11 }
    },
    {
      id: 'moose-crossing', name: 'MOOSE CROSSING', cols: 96,
      heights: [
        /* 0-26 a 5-wide hole c7-11 · THE YEARLING'S PEN (logs c16 and c25) */
        192,192,192,192,192,192,192,null,null,null,null,null,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
        /* 27-53 a runway, a 5-wide hole c32-36 · the TERRACE up (c39-42) to the beaver dam (c43-47) · a 4-wide pond c48-51 · the far bank */
        192,192,192,192,192,null,null,null,null,null,192,192,184,176,168,160,160,160,160,160,160,null,null,null,null,160,160,
        /* 54-95 the far bank, down to the moose's clearing under the big spruce: the checkpoint c58, the arena
           gate c61, his 24 tiles of clearing c62-85, the boss door c86 · 87-95 the road on (the goal) */
        160,160,176,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
        192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
      ],
      solid: [
        [16, 11, 16, 11], [25, 11, 25, 11], /* THE YEARLING'S PEN: two logs */
        [57, 11, 57, 11]                    /* a stump at the foot of the far bank: the second yearling stays up there */
      ],
      tiles: {
        gift: [[3, 8, 'heart'], [20, 7], [45, 5], [59, 8, 'popper']]   /* the heart is Grandma's second lunch bag */
      },
      /* the pen's yearling charges wall to wall; the far bank's yearling sees you on the dam and charges straight into the pond.
         The clearing is the moose's own: no foes in it */
      foes: [[21, 11, 'minibull'], [20, 9, 'mosquito'],
             [54, 9, 'minibull'], [49, 2, 'crow']],
      candles: [[6, 10], [7, 9], [8, 8], [9, 7], [10, 8], [11, 9], [12, 10], [18, 11], [19, 11], [23, 11], [24, 11],
                [28, 11], [29, 11], [31, 10], [32, 9], [33, 8], [34, 7], [35, 8], [36, 9], [37, 10],
                [40, 9], [41, 8], [43, 8], [44, 8], [46, 8],
                [47, 7], [48, 6], [49, 5], [50, 5], [51, 6], [52, 7], [55, 8],
                [88, 11], [89, 11], [93, 11], [94, 11]],
      arena: { col: 62, cols: 24, boss: 'moose' },   /* 2 phases (the default for him); its own checkpoint flag stands at c58 */
      goal: { col: 91, row: 11 }            /* the road on, past the moose's clearing */
    }
  ]
});

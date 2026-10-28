/* ============================================================
   FORT · FENCE-LINE FEUD  (World 1 · Saskatoon home · trail stop 6)
   Story bible (World 1 table): the nosy neighbour's fort, with
   sprinklers, leaf blowers and gnome bowling. His wife hands out
   cookie heals. A step up from 1-5, but fair.
   Idea: THROWERS. The neighbour lobs newspapers from his lookouts
     (arcs aimed where Kinan IS: keep moving, or stomp him).
   Route: S1 the lawn (squirrel, party popper, sprinkler pipes) · S2
     the palisade (a post, then his lookout) · S3 the bowling lane (a
     long uphill with bowling balls bouncing down) · S4 the sheds, with
     a cookie (heart) on shed 2 and the checkpoint · S5 the garden beds
     (plank bridges, the tomato tower) · S6 the BIG fence: a trampoline
     sunk in the lawn vaults you over it, then a plank over a 5-pit and
     a second cookie · S7 the feud: the neighbour's back lawn is his
     boss ARENA (B1, 2026-10-27: gates rise, 2 phases, his wife tosses a
     cookie heal), then the back gate (the goal) a few steps past it.
   The mini-boss (index.html ARENA_KINDS.neighbour, 2 phases):
     1 (dumb)     gnome bowling — two gnomes rolled along the lawn (jump
                  them), then he stops to catch his breath — STOMP!
     2 (smarter)  FAKES a bowl (the real one starts with a STOMP); new
                  attack: the leaf blower pushes Kinan back while a gnome
                  rolls; then two lobbed newspapers. His wife: "Cookie,
                  dear?" — a heart lands on the lawn.
     Befriended: "Alright, alright. Nice hustle, kid. Want a cookie?"
   Gaps: act 1 3 · act 2 3/4/4 · act 3 4/5, the 4s and 5 all bridged
     by planks. Every pit after a high ledge has a runway or a plank.
   Fort slot: exempt from the 3-secrets lint (docs/LEVEL-AUTHORING.md
     §5.5), so no secrets.
   ENGINE REQUESTS: (the fort mini-boss arena landed in B1: the deck
     c173-177 came out so the lawn is open ground for the fight) ·
     sprinkler jets ER-9 (the five pipes are where they go) · leaf
     blower wind zone for authored levels (ER-7) · a 'gnome' foe skin
     ('ball' stands in for the bowling) · bubbles ER-4 (c2 "NO
     TRESPASSING. THIS MEANS YOU, KINAN." · c94 his wife: "Cookie,
     dear?" · c186 "Fine! FINE! Go chase your... whatever that was.").
   ============================================================ */
KinanLevels.register({
  id: '1-fort', world: 1, slot: 6, kind: 'fort',
  name: 'FENCE-LINE FEUD',
  theme: 7,                 /* borrows the playground look: a chain-link fence across the whole backdrop */
  cols: 198,
  heights: [
    /* S1 0-26 the lawn */ 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 the palisade · 3-pit c50-52 (plank) */ 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null, 192,
    /* S3 54-80 the bowling lane: 2:1 up c57-64, top c64-69, 1:1 down c70-73 */ 192,192,192, 184,176,168,160,152,144,136,128, 128,128,128,128,128, 144,160,176,192, 192,192,192,192,192,192,192,
    /* S4 81-107 the sheds · 3-pit c88-90 · 4-pit c98-101 */ 192,192,192,192,192,192,192, null,null,null, 192,192,192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,
    /* S5 108-134 the garden beds · 4-pits c112-115 and c123-126 (planks) · BROW */ 192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192, null,null,null,null, 192,192,192, 184,176,176,184,192,
    /* S6 135-161 the BIG fence c143-146 · 5-pit c151-155 (plank) */ 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null,null,null, 192,192,192,192,192,192,
    /* S7 162-188 the feud: the arena gate c163, the neighbour's lawn c164-187, the boss door c188 */ 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* 189-197 past the boss door: the back gate (the goal) */ 192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [23, 10, 24, 11],                       /* S1 the first fence post */
    [29, 9, 30, 11], [34, 8, 37, 11],       /* S2 the palisade: a post, then his lookout */
    [84, 9, 86, 11],                        /* S4 shed 1 */
    [92, 9, 95, 11],                        /* S4 shed 2 (his wife leaves a cookie on top) */
    [118, 9, 121, 11],                      /* S5 the tomato tower */
    [143, 7, 146, 11]                       /* S6 the BIG fence (5 tall: the trampoline is the way over) */
  ],
  tiles: {
    gift: [[11, 8, 'popper'], [43, 8], [62, 4], [94, 5, 'heart'], [128, 8], [158, 8, 'heart'], [192, 8]],   /* the two hearts are the wife's cookies */
    spring: [[141, 12]],    /* the trampoline sits flush in the lawn: running onto it launches you over the BIG fence */
    shelf: [[50, 8], [51, 8], [52, 8],                         /* S2 plank over the 3-pit */
            [112, 9], [113, 9], [114, 9], [115, 9],            /* S5 plank over the first garden bed */
            [122, 9], [123, 9], [124, 9], [125, 9], [126, 9],  /* S5 plank level with the tomato tower top */
            [151, 9], [152, 9], [153, 9], [154, 9], [155, 9]]  /* S6 plank over the 5-pit (catches the jump off the fence) */
  },
  pipes: [[7, 11], [19, 11], [80, 11], [137, 11], [190, 11]],   /* sprinkler heads (ER-9) */
  /* the neighbour throws newspapers; squirrels charge; bowling balls bounce. Nothing stands on a plank.
     In S7 the neighbour himself is the arena's boss (no foes on his lawn). */
  foes: [[14, 11, 'squirrel'],
         [36, 7, 'neighbor'],
         [65, 7, 'ball'], [69, 7, 'ball'],
         [82, 11, 'squirrel'], [93, 8, 'ball'],
         [120, 8, 'neighbor'], [131, 10, 'ball'],
         [137, 11, 'squirrel'], [160, 11, 'ball']],
  candles: [[3, 11], [4, 11], [9, 10], [10, 9], [11, 6], [20, 11], [21, 11], [23, 9], [24, 9],
            [29, 8], [30, 8], [34, 7], [35, 7], [43, 6], [50, 7], [51, 6], [52, 7],
            [57, 10], [59, 9], [61, 8], [64, 6], [66, 6], [68, 6], [70, 6],
            [87, 9], [88, 8], [89, 9], [92, 8], [93, 8], [95, 8], [98, 9], [99, 8], [100, 8], [101, 9], [106, 11], [107, 11],
            [112, 8], [113, 8], [114, 8], [115, 8], [119, 8], [120, 8], [123, 8], [124, 8], [125, 8], [126, 8],
            [141, 10], [141, 8], [142, 6], [143, 6], [144, 6], [145, 6], [146, 6], [151, 8], [153, 7], [155, 8],
            [189, 11], [190, 10], [191, 11], [193, 11]],
  checkpoint: { col: 104, row: 11 },
  arena: { col: 164, cols: 24, boss: 'neighbour' },   /* 2 phases (the default for him); its own checkpoint flag stands at c160 */
  spawn: { col: 2, row: 11 },
  goal: { col: 194, row: 11 }   /* the back gate */
});

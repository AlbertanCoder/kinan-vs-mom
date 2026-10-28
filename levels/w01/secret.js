/* ============================================================
   SECRET · THE WEIR AND THE PELICANS  (World 1 · trail stop 9)
   Story bible (World 1 table): ride pelicans across the river weir.
   Reached by 1-7's secret exit (behind the painting). A REWARD level:
   short, coin-rich, few foes, soft water gaps.
   Idea: PELICANS. Resting pelicans float flush on the water (walk
     right across them), bobbing pelicans sit a hop higher, and a
     spring flock flies in a V high above the river.
   Route: S1 the riverbank: an UMBRELLA (hold jump while falling to
     float) and the first two pelican bridges · S2 pelican hopping and
     a LASSO (coins fly to you) · S3 THE FLOCK: the trampoline flush on
     the rock throws you up onto a V of 19 flying pelicans · S4 THE
     WEIR: climb the concrete, grab the CAKE (sugar rush), slide down
     the spillway · S5 the rapids (4/4/5 water, each with a pelican) ·
     S6 the far bank: three gifts and a coin shower, then the goal.
   Water gaps: act 1 3 · act 2 3/4/4/3 · act 3 4/4/5 (every one has a
     pelican on or over it). Foes: 2 geese, 2 frogs, 1 flying fish.
   Secret slot: exempt from the 3-secrets lint (docs/LEVEL-AUTHORING.md
     §5.5). The level itself is the reward.
   ENGINE REQUESTS: the secret exit that unlocks this level from 1-7
     (see 1-7's hidden secret, exit: '1-secret') · rideable MOVING
     pelicans (today shelves stand in for them) · a pelican skin for
     shelves and the trampoline · water drawn in river pits · bubbles
     ER-4 (c2 "The weir! Pelicans fish here every summer." · c55 "Hop
     on! The pelicans are going your way!").
   ============================================================ */
KinanLevels.register({
  id: '1-secret', world: 1, slot: 9, kind: 'secret',
  name: 'THE WEIR AND THE PELICANS',
  theme: 28,                /* borrows the river-valley look: a river, trees and a skyline */
  cols: 162,
  heights: [
    /* S1 0-26 the riverbank · water c16-18 and c23-25 (flush pelicans) */ 176,176,176,176,176,176,176,176,176,176, 184,192, 192,192,192,192, null,null,null, 192,192,192,192, null,null,null, 192,
    /* S2 27-53 pelican hop: rocks and 3-wide water */ 192,192,192, null,null,null, 192,192,192, null,null,null, 192,192,192, null,null,null, 192,192,192,192, null,null,null, 192,192,
    /* S3 54-80 the flock overhead · rocks and water below */ 192,192,192,192, null,null,null, 192,192,192, null,null,null, 192,192,192, null,null,null, 192,192,192,192, null,null, 192,192,
    /* S4 81-107 THE WEIR: 1:1 steps up, the crest c87-90, the spillway c91-96 */ 192,192,192, 176,160,144, 144,144,144,144, 152,160,168,176,184,192, 192,192,192, null,null,null, 192,192,192,192,192,
    /* S5 108-134 the rapids */ 192,192, null,null,null,null, 192,192,192, null,null,null,null, 192,192,192, null,null,null,null,null, 192,192,192,192,192,192,
    /* S6 135-161 the far bank: up two steps to the goal */ 192,192,192,192, 176,176,176,176, 160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160,160
  ],
  tiles: {
    gift: [[6, 7, 'umbrella'], [46, 8, 'lasso'], [88, 6, 'cake'], [114, 8], [147, 5, 'heart'], [151, 5], [155, 5]],
    spring: [[55, 12]],     /* flush on the rock: running onto it throws you up to the flock */
    shelf: [[16, 12], [17, 12], [18, 12], [23, 12], [24, 12], [25, 12],              /* S1 resting pelicans (flush: walk across) */
            [30, 10], [31, 10], [32, 10], [36, 12], [37, 12], [38, 12], [42, 10], [43, 10], [44, 10], [49, 12], [50, 12], [51, 12],   /* S2 bobbing / resting */
            [58, 7], [59, 7], [60, 7], [61, 7], [62, 6], [63, 6], [64, 6], [65, 6], [66, 5], [67, 5], [68, 5], [69, 5], [70, 6], [71, 6], [72, 6], [73, 6], [74, 7], [75, 7], [76, 7],   /* S3 THE FLOCK */
            [100, 12], [101, 12], [102, 12],                                          /* S4 below the weir */
            [110, 10], [111, 10], [112, 10], [113, 10], [117, 12], [118, 12], [119, 12], [120, 12], [124, 10], [125, 10], [126, 10], [127, 10], [128, 10]]   /* S5 the rapids */
  },
  foes: [[13, 7, 'goose'], [47, 11, 'puddlefrog'], [83, 11, 'puddlefrog'], [132, 11, 'flyingfish'], [126, 6, 'goose']],
  candles: [[3, 9], [4, 9], [5, 9], [12, 11], [13, 11], [14, 11], [16, 10], [17, 9], [18, 10], [23, 10], [24, 9], [25, 10],
            [30, 9], [31, 8], [32, 9], [36, 10], [37, 9], [38, 10], [42, 9], [43, 8], [44, 9], [49, 10], [50, 9], [51, 10],
            [55, 10], [55, 8], [58, 6], [59, 6], [60, 6], [61, 6], [62, 5], [63, 5], [64, 5], [65, 5], [66, 4], [67, 4], [68, 4], [69, 4],
            [70, 5], [71, 5], [72, 5], [73, 5], [74, 6], [75, 6], [76, 6],
            [87, 7], [89, 7], [91, 8], [92, 8], [93, 8], [94, 9], [95, 9], [96, 10], [100, 10], [101, 9], [102, 10],
            [110, 9], [111, 8], [112, 8], [113, 9], [117, 10], [118, 9], [119, 9], [120, 10], [124, 9], [125, 8], [126, 8], [127, 8], [128, 9],
            [140, 9], [141, 9], [142, 9], [145, 8], [146, 7], [148, 7], [149, 8], [150, 7], [152, 7], [153, 8], [154, 7], [156, 7], [157, 8]],
  checkpoint: { col: 104, row: 11 },
  spawn: { col: 2, row: 10 },
  goal: { col: 159, row: 9 }
});

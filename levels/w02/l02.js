/* ============================================================
   LEVEL 2-2 · HALLWAY RUSH  (World 2 · School · trail stop 2)
   Story bible (World 2 table): "Slamming lockers and a sliding
   hallway floor." The bell rang (then rang again, and again: Glitchy
   is in the bell computer) and the whole school is rushing to class.
   The janitor just waxed the floor.
   Idea (ONE): CRASH THE LOCKERS. The yellow locker bricks crash open
   when Kinan bumps them from below. Act 1 teaches it with rows of
   locker bricks overhead; act 2 traps him in a tall locker he can only
   leave by crashing its lid; act 3 asks him to climb locker bricks
   WITHOUT crashing them (the skill secret) while big kids rush the hall.
   The sliding floor: the waxed ramp down to the stairwell (S4).
   Acts (thirds): 0-62 teach (locker rows, the brow, a 3-wide
   stairwell) · 63-125 twist (THE TALL LOCKER, the vent ledge, the
   waxed ramp and a 4-wide stairwell, the lockers you climb over) ·
   126-188 test (the low locker ceiling, big kids, a 5-wide stairwell,
   then the trophy-case climb and the classroom door).
   Signature set-piece: THE TALL LOCKER (S3): walk in under its door,
   climb its shelves, crash the lid, run along the top of the lockers.
   Secrets: visible = the vent ledge above the locker steps, jump out
   from the top of the lockers (heart, 80,1) · hidden = a locker that
   glints: drop off the back of the locker bank and walk back into its
   bottom locker (GOLDEN CANDLE, 118,11) · skill = the trophy-case
   climb: a shelf, then two rows of locker bricks; bump them from below
   and they crash, so jump onto them from the side (hat, 174,2).
   All three secrets and the goal were reached by script, hop by hop.
   Look: borrows the photo studio's pastel walls with framed pictures
   (theme 4), which read as a school hall with posters; its yellow
   bricks are the lockers and its wooden floor is the waxed hall. (The
   mall-rink look was tried first: its white rink barrier looked like a
   floor you could stand on, so it was dropped.)
   Bubble beats for ER-4 (not wired): c2 "The bell! Wait, it's still
   ringing." · c62 "Who leaves their locker OPEN?" · c84 checkpoint
   "Don't run in the hall! ...Okay, run." · c185 "Made it. Seat by the
   window."
   ENGINE REQUESTS: slamming locker doors (a door that swings open and
   shut on a beat); a slippery waxed-floor zone (per-column ice, the
   rink's ice is level-wide and off in authored levels); lockers skin.
   ============================================================ */
KinanLevels.register({
  id: '2-2', world: 2, slot: 2, kind: 'level',
  name: 'HALLWAY RUSH',
  theme: 4,                 /* pastel hall walls with framed posters, yellow locker bricks, a wooden floor */
  cols: 189,
  heights: [
    /* S1 0-26 the hall: a row of lockers overhead, a bench */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 the brow (c29-40) under more lockers · stairwell 1, c45-47 (3 wide) */
    192,192, 184,176, 176,176,176,176,176,176,176,176, 184,192, 192,192,192,192, null,null,null, 192,192,192,192,192,192,
    /* S3 54-80 THE TALL LOCKER: its door c62, the shaft c63-65, the locker wall c66-77, two steps down */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 checkpoint · the waxed ramp down (c87-90) · stairwell 2, c93-96 (4 wide) · ramp up */
    192, 192,192,192,192,192, 200,208,216,224, 224,224, null,null,null,null, 224,224, 216,208,200,192, 192,192,192,192,192,
    /* S5 108-134 the locker bank (the glinting locker on its back) · the low locker ceiling */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 big kids in the hall (two benches) · stairwell 3, c153-157 (5 wide) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null,null,null, 192,192,192,192,
    /* S7 162-188 reward: the trophy-case climb over the landing dip (c166-178), the classroom door */
    192,192,192,192, 200,208,216, 224,224,224,224,224,224,224, 216,208,200, 192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [17, 10, 18, 11],                     /* a hall bench */
    [62, 4, 62, 9],                       /* the tall locker's door, hanging open: walk in under it */
    [66, 4, 77, 11],                      /* the locker wall: 8 lockers tall */
    [78, 7, 79, 11], [80, 9, 81, 11],     /* two steps down the far side */
    [112, 10, 112, 11], [113, 8, 118, 11],   /* a step and the locker bank (its bottom-right locker is the hidden block) */
    [139, 10, 140, 11], [146, 10, 147, 11]   /* two hall benches: stand on one and the big kid can't see you */
  ],
  tiles: {
    gift: [[11, 8, 'popper'], [34, 6, 'candle'], [101, 8, 'candle'], [115, 4, 'candle'], [118, 11, 'gold']],
    brick: [[9, 8], [10, 8], [12, 8], [13, 8],             /* S1 the first locker row: bump one, CRASH */
            [32, 6], [33, 6], [35, 6], [36, 6],            /* S2 lockers over the brow */
            [63, 4], [64, 4], [65, 4],                     /* S3 THE LID of the tall locker */
            [100, 8], [102, 8],                            /* S4 lockers over the ramp up */
            [122, 10], [123, 10], [124, 10], [125, 10], [126, 10], [127, 10],   /* S5 the low locker ceiling */
            [168, 6], [169, 6], [170, 6], [173, 3], [174, 3], [175, 3]],        /* S7 the trophy-case climb: jump ON them, don't bump them */
    shelf: [[63, 9], [64, 9], [65, 9], [63, 6], [64, 6], [65, 6],              /* the tall locker's shelves */
            [79, 2], [80, 2], [81, 2],                                         /* the vent ledge */
            [163, 9], [164, 9], [165, 9]]                                      /* the trophy case's first shelf */
  },
  /* wet-floor signs hop at you, dodgeballs bounce, the janitor's cart rolls, paper planes fly, the big kid charges */
  foes: [[22, 11, 'wetsign'],
         [37, 10, 'ball'],
         [57, 11, 'ball'],
         [95, 5, 'plane'], [106, 11, 'cart'],
         [130, 11, 'wetsign'],
         [143, 11, 'bully'], [150, 11, 'wetsign'],
         [180, 11, 'ball']],
  candles: [[3, 11], [4, 11], [9, 7], [10, 7], [12, 7], [13, 7], [16, 9], [19, 9],
            [31, 9], [37, 7], [38, 9], [45, 9], [46, 8], [47, 9], [50, 11], [51, 11],
            [59, 11], [60, 11], [64, 10], [64, 8], [64, 5], [68, 3], [70, 3], [72, 3], [74, 3], [76, 3], [78, 2],
            [84, 10], [88, 11], [89, 12], [93, 12], [94, 11], [95, 11], [96, 12], [100, 7], [102, 7],
            [110, 11], [114, 7], [116, 7], [120, 11], [123, 9], [125, 9], [127, 9],
            [137, 11], [139, 9], [140, 9], [146, 9], [147, 9], [153, 9], [154, 8], [155, 7], [156, 8], [157, 9],
            [164, 8], [165, 8], [169, 5], [170, 5], [182, 11], [183, 11]],
  secrets: [
    { kind: 'visible', col: 80, row: 1, prize: 'heart+candles' },                  /* the vent ledge above the steps */
    { kind: 'hidden', col: 118, row: 11, prize: 'GOLDEN CANDLE', glint240: true }, /* the glinting locker at the back of the bank */
    { kind: 'skill', col: 174, row: 2, prize: 'hat' }                              /* the trophy-case climb, without crashing the lockers */
  ],
  goldenCandle: { col: 118, row: 11 },
  checkpoint: { col: 84, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 185, row: 11 }             /* the classroom door */
});

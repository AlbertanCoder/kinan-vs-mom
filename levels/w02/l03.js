/* ============================================================
   LEVEL 2-3 · THE SCIENCE LAB  (World 2 · School · trail stop 3)
   Story bible (World 2 table): "Magnets and circuits open the way."
   Glitchy zapped through the science lab: every magnet is switched
   on, the circuit boards are fizzing and the lab robots are loose.
   Idea (ONE): MAGNET PADS. Step on a pad and it flings Kinan straight
   up, about nine tiles. Act 1: the pads are the only way up the lab
   cabinet and the lab bench. Act 2 adds CIRCUIT BRICKS (the light
   blue bricks): fly into one and it crashes, and the next launch goes
   through the hole, which is how you get over the big machine.
   Act 3: running jumps (4 and 5 wide) between the electric floors,
   then the big magnet and the exit.
   Acts (thirds): 0-62 teach (the cabinet, a 3-wide gap, the bench) ·
   63-125 twist (the circuit ceiling, THE BIG MACHINE, the checkpoint
   and the top shelf) · 126-188 test (holes 4 and 5, robots on the
   landings, then the big magnet and the lab door).
   Signature set-piece: THE BIG MACHINE (S4): eight tiles tall, a
   circuit lid over its magnet pads; crash the lid, fly up, cross the
   top while a spark buzzes around.
   Secrets: visible = the top shelf: from the pad by the checkpoint,
   steer LEFT while you fly (heart + candles, 111,3) · hidden = look
   behind you at the start: a pad under the lab door's awning, and a
   glinting block in the awning (GOLDEN CANDLE, 1,3) · skill = the big
   magnet: stop on its pad and fly straight up through the gap in the
   magnet (running in, you just bonk it), then walk to the hat (171,3).
   All three secrets and the goal were reached by script, hop by hop.
   Look: borrows the science dome (theme 47): its springs are drawn as
   magnet pads, its bricks are light blue, a lightning coil and planets
   behind.
   Bubble beats for ER-4 (not wired): c4 "Goggles on. Wait, why is
   everything humming?" · c84 "Crash the circuit, ride the magnet." ·
   c109 checkpoint "The robots are doing the experiment themselves." ·
   c185 "Science: complete."
   ENGINE REQUESTS: real circuits (a switch block that opens a gate
   somewhere else); magnet ceilings that pull Kinan up; Milo's builder
   assist (story: Milo joins in World 2).
   ============================================================ */
KinanLevels.register({
  id: '2-3', world: 2, slot: 3, kind: 'level',
  name: 'THE SCIENCE LAB',
  theme: 47,                /* the science dome: magnet-pad springs, light blue circuit bricks */
  cols: 189,
  heights: [
    /* S1 0-26 the lab door (awning c0-3), the first pads, the lab cabinet (c15-20) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 a 3-wide gap (c31-33) · the pads up to the lab bench (c41-57) */
    192,192,192,192, null,null,null, 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 the bench ends · the circuit ceiling over a pad */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S4 81-107 THE BIG MACHINE (c86-93), its lid and pads (c83-85), steps down */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S5 108-134 the checkpoint · the pad under the top shelf */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 the electric floor: holes c138-141 (4) and c149-153 (5) */
    192,192,192, null,null,null,null, 192,192,192,192,192,192,192, null,null,null,null,null, 192,192,192,192,192,192,192,192,
    /* S7 162-188 reward: the big magnet (c164-174), the lab door */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [0, 2, 3, 3], [0, 4, 0, 11],          /* the lab door's awning (the golden candle hides in it) and the back wall */
    [15, 7, 20, 11], [21, 9, 22, 11],     /* the lab cabinet (5 tall) and a step down */
    [41, 7, 57, 11], [58, 9, 59, 11],     /* the lab bench (5 tall) and a step down */
    [86, 4, 93, 11],                      /* THE BIG MACHINE: 8 tall */
    [94, 7, 95, 11], [96, 9, 97, 11],     /* steps down its far side */
    [157, 11, 157, 11],                   /* a lab stool: keeps the robot off the landing after the 5-wide gap */
    [164, 4, 167, 4], [170, 4, 174, 4],   /* the big magnet: a 2-wide gap right over its pad */
    [70, 9, 76, 9], [70, 7, 73, 7], [70, 8, 70, 8],       /* taekwondo (2026-10-28): two sample lockers over the floor (walk under them); */
    [122, 9, 128, 9], [122, 7, 125, 7], [122, 8, 122, 8]  /* each one's board door faces right */
  ],
  tiles: {
    gift: [[1, 3, 'gold'], [8, 8, 'popper'], [38, 4, 'candle'], [145, 8, 'candle'], [178, 8, 'heart']],
    spring: [[1, 12],                     /* the secret pad under the awning */
             [13, 12], [14, 12],          /* up the lab cabinet */
             [39, 12], [40, 12],          /* up the lab bench */
             [64, 12],                    /* under the circuit ceiling */
             [84, 12], [85, 12],          /* under the big machine's lid */
             [115, 12],                   /* under the top shelf */
             [168, 12]],                  /* under the big magnet's gap */
    brick: [[62, 6], [63, 6], [64, 6], [65, 6], [66, 6],   /* the circuit ceiling */
            [83, 8], [84, 8], [85, 8],                     /* the big machine's lid */
            [144, 8], [146, 8]],                           /* circuits over the electric floor */
    shelf: [[110, 4], [111, 4], [112, 4]],                 /* the top shelf */
    board: [[73, 8], [125, 8]]    /* BONUS: hop onto a locker's ledge from the right and KICK its board: 2 candles inside each */
  },
  /* lab robots walk, the lab frogs hop at you, the spark flies over the machine */
  foes: [[25, 11, 'robot'],
         [52, 6, 'robot'],                 /* a walker, not a seeker: it never waits at the top of the pads */
         [75, 11, 'robot'],
         [90, 2, 'sparkler'], [103, 11, 'puddlefrog'],
         [121, 11, 'robot'], [128, 11, 'puddlefrog'],
         [145, 11, 'robot'], [162, 11, 'robot'],
         [181, 11, 'robot']],
  candles: [[2, 10], [2, 8], [2, 6], [6, 11], [7, 11], [12, 10], [13, 8], [14, 6], [16, 6], [18, 6], [20, 6],
            [31, 9], [32, 8], [33, 9], [36, 11], [37, 11], [40, 9], [40, 7], [44, 6], [46, 6], [52, 6], [54, 6],
            [61, 11], [62, 11], [63, 4], [64, 3], [65, 4], [69, 11], [70, 11],
            [82, 11], [85, 10], [87, 3], [89, 3], [91, 3], [93, 3], [99, 11], [100, 11],
            [111, 11], [114, 8], [113, 6], [112, 5], [118, 11], [119, 11],
            [138, 9], [139, 8], [140, 8], [141, 9], [149, 9], [150, 8], [151, 7], [152, 8], [153, 9],
            [168, 9], [168, 7], [168, 5], [166, 3], [173, 3], [184, 11], [185, 11],
            [71, 8], [72, 8], [123, 8], [124, 8]],                /* behind the lockers' boards */
  secrets: [
    { kind: 'visible', col: 111, row: 3, prize: 'heart+candles' },                 /* the top shelf: steer left off the pad */
    { kind: 'hidden', col: 1, row: 3, prize: 'GOLDEN CANDLE', glint240: true },    /* behind the start: the awning, bumped from its pad */
    { kind: 'skill', col: 171, row: 3, prize: 'hat' }                              /* stop on the big magnet's pad, fly up through the gap */
  ],
  goldenCandle: { col: 1, row: 3 },
  checkpoint: { col: 109, row: 11 },
  spawn: { col: 4, row: 11 },
  goal: { col: 185, row: 11 }             /* the lab door */
});

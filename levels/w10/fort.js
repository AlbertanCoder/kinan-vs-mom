/* ============================================================
   FORT · THE GRANDMOTHERS' PICNIC  (World 10 · Niagara Falls · trail stop 6)
   Story bible (World 10 table): both Grandmas arrive, one from Edmonton
   and one from Onion Lake, with GRANDPA (Dad's dad, 92, "the King of Dad
   Jokes"). Glitchy led the family out of the conservatory into the park
   on the edge of the gorge, where the two Grandmothers have laid out a
   picnic. Mom still isn't sure Kinan is ready: the Grandmothers want to
   see for themselves, so the way to their blankets is a little obstacle
   run, past the picnic baskets, over the ditches, and up the hill.
   Idea: THE PICNIC PARK RUN. Picnic baskets are steps (solid), checked
     blankets and striped lawn chairs are ledges you land on from above and
     jump up through (shelves with the skins 'blanket' and 'lawnchair'), a
     quilt is a bouncy pad (two spring tiles set flush in the floor, skin
     'blanket'), and a kid's red wagon (World 9's `rollers`, new look
     'wagon') rolls to and fro over each ditch like a boat does. Act 1 teaches
     it (a 3 ditch with a wagon, THE BLANKET FIELD: a basket, a blanket and a
     lawn chair as steps, a 3 ditch, THE HILL with its picnic table); act 2
     twists it (THE QUILT, then 4/4/3 ditches with wagons and a second
     hamper); act 3 tests it (the checkpoint, a 5 ditch with a wagon).
     (The quilt's bounce comes down 10 tiles on, 6 before the next ditch.)
   Route: S1 the park gate 3 · S2 the blanket field, the hamper (kick board)
     and 3 · S3 the hill (a BROW) and its table · S4 THE QUILT, 4 · S5 the
     second hamper, 4 · S6 3 · S7 the checkpoint, 5 · S8 the last stretch
     and then THE OPEN LAWN · S9 Grandpa's lawn chair and the goal.
   FLAT OPEN GROUND FOR THE BOSS (the second run): columns 180-239 are flat at
     192 (60 tiles; the sky above is empty). Columns 195-222 hold nothing at
     all (28 tiles): an arena { col: 197, cols: 24, boss: ... } would put
     its gates at c196 and c221 and its checkpoint flag on the lawn at c193.
     A heart waits just before the left gate (gift at c194, outside the
     arena) and a cake past the boss door (gift at c224); the candles stop at
     c192 and start again at c223. GRANDPA's lawn chair (a ledge, c228-230)
     stands past it, and the goal at c236 beyond him. The `arena` key below
     puts THE GRANDMOTHERS' PICNIC there (index.html ARENA_KINDS 'grandmas',
     second run 2026-10-29): GRANDMA (EDMONTON)'s complaint bubbles, then
     GRANDMA (ONION LAKE)'s cane boomerangs (both with cheek-pinch circles),
     a checkpoint, then the TAG TEAM; one shared STEAM meter; Kinan wins by
     dodging until they run out of steam, then ONE ENORMOUS HUG and food.
     GRANDPA cheers from a lawn chair on the picnic bank at the side.
   Gaps: act 1 3/3 · act 2 4/4/3 · act 3 5; every ditch has a candle arc, a
     wagon, and nothing waits at a lip. A full-run jump off the hampers and the
     hill's table comes down on floor (w10-levels.spec.ts checks it). Fort
     slot: exempt from the 3-secrets lint (no secrets here; World 10's
     secret exit is off the cable car, 10-6). No pet.
   Bonus spots (never needed): KICK BOARDS seal two hampers (c24-28, c112-116;
     3 candles each; Chenoa says so); SLAM SPOTS: cracked boards at c140-142
     and c166-168 over pockets of candles (solid floor underneath).
   Look: the Grandmothers' Picnic Park (theme 205, World 10's own look): a sunny
     park on the gorge, the Falls' mist far off, big maples, bunting, kites, hedges.
   Jokes: Dad on blankets and picnics (the wheeze), Grandpa's better joke on his
     lawn chair; Annie's "Chalo! (Let's go!)".
   ENGINE REQUESTS: none left (the picnic boss came in the second run).
   ============================================================ */
(function () {
  const H = [], C = [];
  const at = (c) => { if (H.length !== c) throw new Error('10-fort: expected column ' + c + ' but the ground is at ' + H.length); };
  const flat = (v, n) => { for (let i = 0; i < n; i++) H.push(v); };
  const gap = (n) => flat(null, n);
  const to = (v) => { let c = H[H.length - 1]; const s = v > c ? 8 : -8; while (c !== v) { c += s; H.push(c); } };
  const top = (c) => Math.floor(Math.min(H[c], c > 0 && H[c - 1] != null ? H[c - 1] : H[c]) / 16) - 1;
  const gl = (c0, c1, up) => { for (let c = c0; c <= c1; c++) if (H[c] != null) C.push([c, top(c) - (up || 0)]); };
  const arc = (c0, c1, base, peak) => { for (let c = c0; c <= c1; c++) { const t = (c - c0) / (c1 - c0); C.push([c, base - Math.round(4 * peak * t * (1 - t))]); } };
  const row = (c0, c1, r, step) => { for (let c = c0; c <= c1; c += step || 1) C.push([c, r]); };

  at(0); flat(192, 14);          /* S1  0-13  the park gate (spawn c2) */
  at(14); gap(3);                /*     14-16 a 3 ditch: wagon W1 */
  at(17); flat(192, 31);         /*     17-47 THE BLANKET FIELD: the hamper (c24-28), a basket, a blanket, a lawn chair; 19 tiles of runway after the hamper */
  at(48); gap(3);                /* S2  48-50 a 3 ditch: wagon W2 */
  at(51); flat(192, 10);         /*     51-60 */
  at(61); to(160);               /* S3  61-64 up THE HILL */
  at(65); flat(160, 14);         /*     65-78 the hilltop and its picnic table (c70-73) */
  at(79); to(192);               /*     79-82 down */
  at(83); flat(192, 17);         /* S4  83-99 THE QUILT (c86-87) */
  at(100); gap(4);               /*     100-103 a 4 ditch: wagon W3 (act 2) */
  at(104); flat(192, 24);        /* S5  104-127 the second hamper (c112-116) */
  at(128); gap(4);               /*     128-131 a 4 ditch: wagon W4 */
  at(132); flat(192, 20);        /* S6  132-151 (cracked boards c140-142) */
  at(152); gap(3);               /*     152-154 a 3 ditch: wagon W5 */
  at(155); flat(192, 20);        /* S7  155-174 the checkpoint (c160), cracked boards c166-168 */
  at(175); gap(5);               /*     175-179 a 5 ditch: wagon W6 (act 3) */
  at(180); flat(192, 60);        /* S8  180-239 the last stretch (c181-192), then THE OPEN LAWN (c195-222: nothing at all), Grandpa's chair, the goal */

  /* ---- candles ---- */
  gl(3, 12); arc(13, 17, 11, 3); gl(18, 23); row(24, 28, 8); C.push([25, 11], [26, 11], [27, 11]); gl(29, 30); C.push([31, 9], [32, 9]); gl(33, 40);   /* S1-S2 */
  row(34, 37, 7); C.push([41, 9], [42, 9]); gl(43, 46); arc(47, 51, 11, 3);                                             /* over the blanket and the lawn chair, the 3 ditch */
  gl(52, 60); gl(61, 64); gl(65, 69); row(70, 73, 7); gl(74, 82); gl(83, 85);                                           /* S3: the hill, over the table */
  C.push([86, 5], [88, 3], [90, 2], [92, 3], [94, 5], [95, 8]); gl(86, 98); arc(99, 104, 11, 3);                      /* S4: the quilt's arc, the 4 ditch */
  gl(105, 111); row(112, 116, 8); C.push([113, 11], [114, 11], [115, 11]); gl(117, 126); arc(127, 132, 11, 3);          /* S5: the second hamper */
  gl(133, 139); C.push([140, 13], [141, 13], [142, 13]); gl(143, 150); arc(151, 155, 11, 2);                            /* S6 */
  gl(156, 165); C.push([166, 13], [167, 13], [168, 13]); gl(169, 173); arc(174, 180, 11, 4);                            /* S7: the 5 ditch */
  gl(181, 192);                                                                                                         /* S8: and then the lawn is empty (c195-222) */
  gl(223, 227); row(228, 230, 9); gl(231, 238);                                                                         /* S9: past the boss door, over Grandpa's chair */

  KinanLevels.register({
    id: '10-fort', world: 10, slot: 6, kind: 'fort',
    name: "THE GRANDMOTHERS' PICNIC",
    theme: 205,   /* a sunny park on the gorge: the Falls' mist far off, big maples, bunting, kites, hedges */
    cols: H.length,
    /* THE PICNIC WAGONS (World 9's rollers, look 'wagon'): [c0, c1, row, w, speed, look] — a red wagon rolls to and fro over each ditch */
    rollers: [
      [14, 16, 12, 2, 0.4, 'wagon'], [48, 50, 12, 2, 0.45, 'wagon'],
      [100, 103, 12, 2, 0.5, 'wagon'], [128, 131, 12, 2, 0.5, 'wagon'], [152, 154, 12, 2, 0.5, 'wagon'],
      [175, 179, 12, 3, 0.6, 'wagon']
    ],
    skins: [
      ['basket', 24, 9, 28, 11], ['basket', 112, 9, 116, 11],   /* the two hampers (kick boards at c28 and c116) */
      ['basket', 31, 10, 32, 11], ['basket', 70, 8, 73, 9],      /* a basket step; the picnic table's hamper block on the hill */
      ['blanket', 34, 8, 37, 8], ['blanket', 66, 7, 69, 7],      /* the blankets: ledges */
      ['lawnchair', 41, 10, 42, 10], ['lawnchair', 146, 10, 147, 10], ['lawnchair', 228, 10, 230, 10],   /* lawn chairs: ledges (the last one is Grandpa's) */
      ['blanket', 84, 12, 85, 12]                                 /* THE QUILT: a bouncy pad (the springs under it) */
    ],
    heights: H,
    solid: [
      [24, 9, 28, 11], [112, 9, 116, 11],   /* the hampers */
      [31, 10, 32, 11],                      /* a basket step */
      [70, 8, 73, 9]                         /* the picnic table on the hilltop (floor 160) */
    ],
    open: [
      [140, 13, 142, 13], [166, 13, 168, 13],   /* SLAM SPOTS: the pockets under the cracked boards, solid floor under them */
      [25, 11, 27, 11], [113, 11, 115, 11]      /* the hampers' closets, sealed by a kick board */
    ],
    tiles: {
      crack: [[140, 12], [141, 12], [142, 12], [166, 12], [167, 12], [168, 12]],
      board: [[28, 11], [116, 11]],   /* KICK SPOTS (bonus) */
      gift: [
        [6, 8],              /* S1 */
        [35, 4],             /* S2 over the blanket */
        [44, 8],             /* S2 */
        [68, 5],             /* S3 over the hilltop blanket */
        [114, 5],            /* S5 over the second hamper */
        [122, 8],            /* S5 */
        [136, 8], [148, 8],  /* S6 */
        [164, 8], [170, 8],  /* S7 */
        [186, 8],            /* S8 */
        [194, 8, 'heart'],   /* a heart just before the open lawn (outside the arena) */
        [224, 8, 'cake']     /* a cake past the boss door */
      ],
      brick: [[5, 8], [7, 8]],
      spring: [[84, 12], [85, 12]],   /* THE QUILT: a bouncy pad, flush in the floor */
      shelf: [
        [34, 8], [35, 8], [36, 8], [37, 8],     /* the blanket field's blanket */
        [41, 10], [42, 10],                      /* a lawn chair */
        [66, 7], [67, 7], [68, 7], [69, 7],      /* the hilltop blanket */
        [146, 10], [147, 10],                    /* a lawn chair */
        [228, 10], [229, 10], [230, 10]          /* GRANDPA's lawn chair, past the open lawn */
      ]
    },
    /* picnickers, hot dog and ice cream carts, a busker; seagulls over the lawn. Nothing waits at a lip. */
    foes: [
      [9, 11, 'mallwalker'],                          /* S1 */
      [22, 11, 'corndog'], [36, 11, 'puddlefrog'], [45, 11, 'cart'],   /* S2 */
      [56, 11, 'mallwalker'], [75, 9, 'slug'],        /* S3 */
      [90, 11, 'corndog'], [98, 11, 'cart'],          /* S4 */
      [108, 11, 'mallwalker'], [121, 11, 'slug'], [118, 5, 'seagull'],   /* S5 */
      [138, 11, 'cart'], [150, 11, 'corndog'], [146, 5, 'seagull'],      /* S6 */
      [158, 11, 'mallwalker'], [165, 11, 'drummer'], [172, 11, 'slug'],  /* S7 */
      [183, 11, 'drummer'], [189, 11, 'mallwalker'],  /* S8 */
      [234, 11, 'corndog']                            /* S9 past the lawn */
    ],
    candles: C,
    checkpoint: { col: 160, row: 11 },
    arena: { col: 197, cols: 24, boss: 'grandmas' },   /* THE OPEN LAWN: gates at c196 and c221, its checkpoint flag on the lawn at c193 */
    spawn: { col: 2, row: 11 },
    goal: { col: 236, row: 11 },   /* Grandpa's chair and the picnic blankets beyond */
    talk: [
      [2, 'KINAN', "Glitchy led us out of the conservatory into the park... and look! A picnic! Those are the Grandmas!", 4.2],
      [3, 'GRANDMA (EDMONTON)', "Kinan! Come here, my boy! We drove all the way from Edmonton for your birthday!", 3.8],
      [4, 'GRANDMA (ONION LAKE)', "And I brought sandwiches and pie from Onion Lake. But first, show us what you can do, dear.", 4.4],
      [5, 'ANNIE', "The Grandmas want to see you cross the park. Chalo! (Let's go!)", 3.2],
      [18, 'CHENOA', "Picnic baskets are steps, and blankets and lawn chairs are ledges. Jump up through them, little bro!", 4],
      [29, 'CHENOA', "A wooden board on that picnic hamper! Stand next to it and press KICK. There are candles inside.", 3.8],
      [40, 'DAD', "What did the picnic blanket say to the grass? I've got... hee... I've got you... HA... I can't—", 4.4, 'wheeze'],
      [40, 'CHENOA', "...covered. 'I've got you covered.' Dad, you said that one at lunch.", 3.2],
      [62, 'SHAD', "A hill! The little red wagons carry you over the ditches. Hop on and ride, or jump across.", 3.8],
      [82, 'MOM', "That checked quilt is a trampoline, sweetie. Run onto it and it will throw you across the grass.", 3.8],
      [108, 'DAD', "Nice picnic! I'd say we've really got a lot of... pun-ic. Ha! Panic. Get it?", 3.4],
      [128, 'MOM', "The Grandmas have been waiting all year to see you, Kinan. I do want you to be ready.", 3.6],
      [156, 'GRANDMA (EDMONTON)', "That's it, Kinan! Don't stop now! Mind the wagon!", 3],
      [181, 'KINAN', "What's that big open lawn up ahead? It's all quiet... a bit too quiet.", 3.4],
      [226, 'GRANDPA', "Over here, Kinan! Why did the picnic basket cross the road? To get to the other... SIDE DISH! Tell your dad that one's mine!", 5.6]
    ]
  });
})();

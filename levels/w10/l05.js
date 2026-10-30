/* ============================================================
   LEVEL 10-5 · THE BUTTERFLY CONSERVATORY
   (World 10 · Niagara Falls · trail stop 5)
   Story bible (World 10 table): "Hop on giant leaves among butterflies."
   Glitchy flew in through the door of the big glass dome. Inside it is
   warm and green: ponds with lily pads, glass sheds, palms, and
   hundreds of butterflies that land on everyone's hat.
   Idea (ONE): GIANT LEAVES AND BUTTERFLY SWARMS. A giant leaf is a bouncy
     pad (two spring tiles set flush in the floor, dressed as a leaf: skin
     'leaf'): step on it and it throws Kinan about 10 tiles up and 11 tiles
     ahead (hold RIGHT to steer). A butterfly swarm (World 9's `rollers`, new look
     'butterflies') is a slow moving platform: land on the glowing pollen
     line along its top and it carries you. The swarms drift over the ponds
     (every pond is still a gap a running jump clears) and one flies high.
     Every leaf has 11+ tiles of flat floor after it, no block or foe in
     its arc and no pit within 5 tiles of where its bounce comes down.
     Act 1 teaches it (a pond with a swarm, THE FIRST LEAF and its canopy
     shelf, a pond, the terrace); act 2 twists it (3/4/4/3 ponds with faster
     swarms, a leaf after each of the first two, THE GLASS SHEDS); act 3
     tests it (the checkpoint, 5 ponds with fast swarms, a leaf that throws
     Kinan toward THE HIGH SWARM and the far canopy).
   Acts (thirds): 0-89 teach (3, THE FIRST LEAF, 3, the glass shed, THE
     TERRACE) · 90-179 twist (3, THE SECOND LEAF, 4, the glass shed, 4, THE
     THIRD LEAF, 3) · 180-269 test (the checkpoint, 5, THE FOURTH LEAF and
     THE HIGH SWARM, 5, the last shed, the goal).
   Secrets (new to World 10): visible = THE CANOPY SHELF (S2): a shelf 8 tiles
     up over the first leaf's bounce; the candles lead the arc to it
     (heart + candles, 32,3) · hidden = THE ORCHID (S4): on the terrace one
     block over the path glints (GOLDEN CANDLE, 72,6) · skill = THE HIGH
     SWARM (S9): the fourth leaf throws Kinan up to a swarm flying 6 tiles
     over the floor; ride it across to the far canopy ledge and its hat
     (hat, 225,5).
   Bonus spots (never needed): KICK BOARDS seal three glass sheds (c52-56, c124-128,
     c248-252; 3 candles each; Chenoa says so); SLAM SPOTS: cracked boards at
     c140-142 and c228-230 over pockets of candles (solid floor underneath).
   Gaps: act 1 3/3 · act 2 3/4/4/3 · act 3 5/5. A full-run jump off the
     sheds comes down on floor; a bounce off every leaf comes down on floor
     with room before the next pond (w10-levels.spec.ts checks both).
   Look: the Butterfly Conservatory (theme 204, World 10's own look): a glass dome with
     white ribs, sun rays, palms, giant leaves, hibiscus, vines, butterflies everywhere.
   Jokes: Dad on butterflies (moth-ematics), Mom laughs; Annie's Punjabi ("Chalo!",
     "Shabash!").
   ENGINE REQUESTS: none.
   ============================================================ */
(function () {
  const H = [], C = [];
  const at = (c) => { if (H.length !== c) throw new Error('10-5: expected column ' + c + ' but the ground is at ' + H.length); };
  const flat = (v, n) => { for (let i = 0; i < n; i++) H.push(v); };
  const gap = (n) => flat(null, n);
  const to = (v) => { let c = H[H.length - 1]; const s = v > c ? 8 : -8; while (c !== v) { c += s; H.push(c); } };
  const top = (c) => Math.floor(Math.min(H[c], c > 0 && H[c - 1] != null ? H[c - 1] : H[c]) / 16) - 1;
  const gl = (c0, c1, up) => { for (let c = c0; c <= c1; c++) if (H[c] != null) C.push([c, top(c) - (up || 0)]); };
  const arc = (c0, c1, base, peak) => { for (let c = c0; c <= c1; c++) { const t = (c - c0) / (c1 - c0); C.push([c, base - Math.round(4 * peak * t * (1 - t))]); } };
  const row = (c0, c1, r, step) => { for (let c = c0; c <= c1; c += step || 1) C.push([c, r]); };
  const bounce = (p) => C.push([p + 2, 5], [p + 4, 3], [p + 6, 2], [p + 8, 3], [p + 10, 5], [p + 11, 8]);   /* the arc of a leaf's bounce from a 2-wide leaf at column p (11 tiles on) */

  at(0); flat(192, 14);          /* S1  0-13  the garden gate (spawn c2) */
  at(14); gap(3);                /*     14-16 a 3 pond: swarm B1 */
  at(17); flat(192, 28);         /*     17-44 THE FIRST LEAF (c24-25), 20 tiles of flat after it */
  at(45); gap(3);                /* S2  45-47 a 3 pond: swarm B2 */
  at(48); flat(192, 14);         /*     48-61 the first glass shed (c52-56) */
  at(62); to(176);               /* S3  62-63 up to THE TERRACE */
  at(64); flat(176, 18);         /*     64-81 the terrace (the orchid, c72) */
  at(82); to(192);               /*     82-83 down */
  at(84); flat(192, 10);         /* S4  84-93 */
  at(94); gap(3);                /*     94-96 a 3 pond: swarm B3 (act 2) */
  at(97); flat(192, 20);         /*     97-116 THE SECOND LEAF (c100-101) */
  at(117); gap(4);               /* S5  117-120 a 4 pond: swarm B4 */
  at(121); flat(192, 24);        /*     121-144 the second glass shed (c124-128), cracked boards c140-142 */
  at(145); gap(4);               /* S6  145-148 a 4 pond: swarm B5 */
  at(149); flat(192, 30);        /*     149-178 THE THIRD LEAF (c156-157) */
  at(179); gap(3);               /* S7  179-181 a 3 pond: swarm B6 */
  at(182); flat(192, 14);        /*     182-195 the checkpoint (c184) before the test */
  at(196); gap(5);               /* S8  196-200 a 5 pond: swarm B7 (act 3) */
  at(201); flat(192, 34);        /*     201-234 THE FOURTH LEAF (c203-204), THE HIGH SWARM over c212-222, the far canopy ledge (c224-226), cracked boards c228-230 */
  at(235); gap(5);               /* S9  235-239 a 5 pond: swarm B8 */
  at(240); flat(192, 30);        /* S10 240-269 the last glass shed (c248-252), the gift row, the goal */

  /* ---- candles ---- */
  gl(3, 12); arc(13, 17, 11, 3); gl(18, 22); C.push([26, 5], [28, 3], [30, 2], [31, 3], [33, 3], [34, 5], [35, 8]); gl(37, 43); arc(44, 48, 11, 3);   /* S1-S2: over the first pond, the first leaf's arc (the heart is at 32,3) */
  gl(49, 51); row(52, 56, 8); C.push([53, 11], [54, 11], [55, 11]); gl(57, 61); gl(62, 83);                        /* S3: the shed's roof and closet, the terrace */
  gl(84, 92); arc(93, 97, 11, 3); gl(98, 99); bounce(100); gl(112, 115); arc(116, 121, 11, 3);                      /* S4-S5: the second leaf, an arc over the 4 pond */
  gl(122, 123); row(124, 128, 8); C.push([125, 11], [126, 11], [127, 11]); gl(129, 139); C.push([140, 13], [141, 13], [142, 13]); gl(143, 143); arc(144, 149, 11, 3);   /* S6 */
  gl(150, 155); bounce(156); gl(168, 177); arc(178, 182, 11, 2);                                                    /* S7: the third leaf */
  gl(183, 194); arc(195, 201, 11, 4); gl(202, 202); C.push([205, 5], [207, 3], [209, 2]); row(212, 222, 5, 2); C.push([224, 5], [226, 5]);   /* S8-S9: the fourth leaf, over the high swarm */
  gl(213, 227); C.push([228, 13], [229, 13], [230, 13]); gl(231, 233); arc(234, 240, 11, 4);                        /* S9 */
  gl(241, 247); row(248, 252, 8); C.push([249, 11], [250, 11], [251, 11]); gl(253, 254); gl(255, 259, 2); gl(260, 265);   /* S10 */

  KinanLevels.register({
    id: '10-5', world: 10, slot: 5, kind: 'level',
    name: 'THE BUTTERFLY CONSERVATORY',
    theme: 204,   /* a glass dome with white ribs, sun rays, palms, giant leaves, hibiscus, vines, butterflies */
    cols: H.length,
    /* BUTTERFLY SWARMS (World 9's rollers, look 'butterflies'): [c0, c1, row, w, speed, look] — a platform that drifts between two columns; land on the pollen line along its top */
    rollers: [
      [14, 16, 12, 2, 0.35, 'butterflies'], [45, 47, 12, 2, 0.4, 'butterflies'], [94, 96, 12, 2, 0.45, 'butterflies'],
      [117, 120, 12, 2, 0.5, 'butterflies'], [145, 148, 12, 2, 0.5, 'butterflies'], [179, 181, 12, 2, 0.5, 'butterflies'],
      [196, 200, 12, 3, 0.6, 'butterflies'], [235, 239, 12, 3, 0.6, 'butterflies'],
      [212, 222, 6, 3, 0.5, 'butterflies']   /* THE HIGH SWARM: 6 tiles over the floor (the skill secret) */
    ],
    skins: [
      ['leaf', 24, 12, 25, 12], ['leaf', 100, 12, 101, 12], ['leaf', 156, 12, 157, 12], ['leaf', 203, 12, 204, 12],   /* THE GIANT LEAVES (the spring tiles under them) */
      ['greenhouse', 52, 9, 56, 11], ['greenhouse', 124, 9, 128, 11], ['greenhouse', 248, 9, 252, 11]   /* the glass sheds (kick boards at c56, c128, c252) */
    ],
    heights: H,
    solid: [
      [52, 9, 56, 11], [124, 9, 128, 11], [248, 9, 252, 11]   /* the glass sheds */
    ],
    open: [
      [140, 13, 142, 13], [228, 13, 230, 13],   /* SLAM SPOTS: the pockets under the cracked boards, solid floor under them */
      [53, 11, 55, 11], [125, 11, 127, 11], [249, 11, 251, 11]   /* the sheds' closets, sealed by a kick board */
    ],
    tiles: {
      crack: [[140, 12], [141, 12], [142, 12], [228, 12], [229, 12], [230, 12]],
      board: [[56, 11], [128, 11], [252, 11]],   /* KICK SPOTS (bonus) */
      gift: [
        [6, 8],              /* S1 */
        [50, 8],             /* S3 */
        [68, 7],             /* S4 on the terrace */
        [72, 6, 'gold'],     /* S4 THE ORCHID: the glinting block (hidden) */
        [88, 8],             /* S4 */
        [126, 5],            /* S6 over the second shed's roof */
        [134, 8],            /* S6 */
        [172, 8],            /* S7 */
        [186, 8],            /* S8 */
        [231, 8],            /* S9 */
        [256, 8, 'heart'], [258, 8, 'cake']   /* S10 the gift row */
      ],
      brick: [[5, 8], [7, 8], [255, 8], [257, 8], [259, 8]],
      spring: [
        [24, 12], [25, 12], [100, 12], [101, 12], [156, 12], [157, 12], [203, 12], [204, 12]   /* THE GIANT LEAVES: spring tiles set flush in the floor, so stepping on one throws Kinan */
      ],
      shelf: [
        [30, 4], [31, 4], [32, 4], [33, 4], [34, 4],   /* S2 THE CANOPY SHELF (visible secret), on the first leaf's arc */
        [224, 6], [225, 6], [226, 6]                   /* S9 the far canopy ledge (skill secret), level with the high swarm */
      ]
    },
    /* visitors, slugs and puddle frogs on the path; mosquitoes in the air, never in a leaf's arc. Nothing waits at a lip. */
    foes: [
      [9, 11, 'mallwalker'],                          /* S1 */
      [20, 11, 'slug'], [40, 11, 'puddlefrog'],       /* S2 */
      [50, 11, 'mallwalker'], [59, 11, 'slug'],       /* S3 */
      [70, 10, 'slug'], [78, 10, 'mallwalker'],       /* S4 on the terrace */
      [88, 11, 'puddlefrog'], [92, 5, 'mosquito'],    /* S4 */
      [114, 11, 'slug'],                              /* S5 */
      [122, 11, 'mallwalker'], [133, 11, 'slug'], [138, 5, 'mosquito'],   /* S6 */
      [151, 11, 'slug'], [172, 11, 'mallwalker'], [176, 5, 'mosquito'],   /* S7 */
      [186, 11, 'slug'], [192, 11, 'puddlefrog'],     /* S8 */
      [220, 11, 'slug'], [231, 11, 'mallwalker'],     /* S9 */
      [244, 11, 'slug'], [261, 11, 'mallwalker']      /* S10 */
    ],
    candles: C,
    secrets: [
      { kind: 'visible', col: 32, row: 3, prize: 'heart+candles' },        /* THE CANOPY SHELF: the first leaf's bounce lands on it */
      { kind: 'hidden', col: 72, row: 6, prize: 'GOLDEN CANDLE', glint240: true },   /* THE ORCHID: the glinting block over the terrace */
      { kind: 'skill', col: 225, row: 5, prize: 'hat' }                     /* THE HIGH SWARM: the fourth leaf, the swarm, the far canopy ledge */
    ],
    goldenCandle: { col: 72, row: 6 },
    checkpoint: { col: 184, row: 11 },
    spawn: { col: 2, row: 11 },
    goal: { col: 266, row: 11 },   /* the conservatory's far door */
    talk: [
      [2, 'KINAN', "The Butterfly Conservatory! A giant glass dome full of butterflies. Glitchy just flew in through the door!", 4.4],
      [3, 'DAD', "What's a butterfly's best subject? Moth-ematics! I love this place, bud. It's a real flutter-by.", 4],
      [4, 'ANNIE', "Look at all of them, Kinan! And they're landing on everyone's hats. Chalo! (Let's go!)", 3.8],
      [18, 'CHENOA', "That giant leaf is a trampoline! Run onto it, then hold RIGHT and JUMP. You'll fly!", 3.8],
      [38, 'DAD', "What do you call a butterfly that's lost its wings? A... hee... a WALKING... HA... I can't—", 4.4, 'wheeze'],
      [38, 'SHAD', "...a caterpillar. Dad. That is just a caterpillar.", 3],
      [38, 'MOM', "Ha! A walking caterpillar! Oh, go on, sweetie, you're doing great.", 3.4, 'laugh'],
      [49, 'CHENOA', "A wooden board on the glass shed! Stand next to it and press KICK. There are candles inside.", 3.8],
      [64, 'DAD', "Hey, bud, something is twinkling up there. It might be an orchid! Jump under it.", 3.6],
      [90, 'SHAD', "A swarm of butterflies is a moving platform. Land on the glowing line along its top, little bro.", 3.8],
      [100, 'MOM', "These leaves are very bouncy, sweetie. Hold RIGHT as you take off, and look where you're landing.", 3.8],
      [118, 'DAD', "Why do butterflies make bad party guests? They're always flitting in and out!", 3.4],
      [118, 'MOM', "Is that all you do, tell jokes? I am going to sit with the orchids. Alone.", 3.4, 'walkoff'],
      [118, 'DAD', "...I'll be here all week! Well, till the butterflies leave.", 3],
      [185, 'MOM', "The ponds are wider now, sweetie. The swarms are faster, too. Take a running jump, or ride one.", 4],
      [201, 'KINAN', "That last leaf points at a swarm flying way up high! There's a canopy ledge on the other side...", 4],
      [240, 'ANNIE', "Shabash, Kinan! (Well done!) You bounced like a butterfly!", 3.2],
      [258, 'KINAN', "I see Glitchy! He's heading out into the park, where the Grandmas have set up a picnic!", 4]
    ]
  });
})();

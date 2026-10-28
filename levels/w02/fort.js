/* ============================================================
   FORT · THE GOALIE'S NET  (World 2 · School · trail stop 6)
   Story bible (World 2 table): "A three-round soccer match against the
   big goalie. Aiden helps." The big goalie guards the soccer field, and
   every defender on his team runs straight at you.
   Idea: CHARGERS. The defenders (bullies) see you, shout "!", and charge
     in a straight line: jump over them, stomp them, or let them charge
     right off a ledge. Soccer balls bounce, training cones hop after you,
     geese patrol the sky (over solid ground, never over a pit).
   Built as THREE AREAS, one per round of the match: the seam banners
     ROUND 1 / ROUND 2 / ROUND 3 slide in as Kinan runs between them.
     ROUND 1 (0-71) kick-off: hurdles, the first defender, the bench ·
     ROUND 2 (72-143) midfield: the field rises into a hill with a
     defender charging down it, a plank over a 4-pit, a goose, then a
     CORNER KICK (springboard at the lip of a 4-pit, the 6-tall boards
     behind it) · ROUND 3 (144-215) the penalty box: 5/5/4 pits, a
     terrace held by a defender and the coach, then the big goalie's
     goal mouth: his boss ARENA (B1, 2026-10-27), and the net (the goal)
     a few steps past his door.
   The mini-boss (index.html ARENA_KINDS.goalie, 2 phases):
     1 (dumb)     kicks a bouncing ball at where Kinan IS, then DIVES at
                  him along the grass (jump him) and lands flat — STOMP!
     2 (smarter)  FAKES a kick (the real one starts with a STOMP); new
                  attack: a low ball rolled along the grass (jump it);
                  then the dive. Aiden: "Big goalie, three rounds. Pass
                  it to me!" Befriended: a high five.
   Gaps: round 1 2/3/3 (the first defender charges on open ground) ·
     round 2 4/4/4 (one with a plank) · round 3 5/5/4. Every pit has a
     candle arc; after every high ledge a runway. Every defender is penned
     by hurdles, walls or a bench so it can never charge onto a pit's
     landing spot.
   Fort slot: exempt from the 3-secrets lint (docs/LEVEL-AUTHORING.md
     §5.5), so no secrets. Two hearts: Aiden's water bottles (c138, c147).
   ENGINE REQUESTS: (the fort mini-boss arena landed in B1: round 3's
     last hurdle, defender and crossbar came out so the goal mouth is
     open ground for the fight) · Aiden as a Friend Assist inside levels (he passes
     Kinan a ball to kick at a defender) · a 'soccer ball' hopper skin
     ('ball' stands in), a 'defender' skin for the charger (bully) and a
     'coach' thrower that throws balls (teacher throws pencils) · the
     goalie's net drawn on the crossbar · bubbles ER-4 (c2 Aiden: "You
     and me versus their whole team. Easy!" · c72 "ROUND 2!" · c144
     "Last round. Get past the goalie!" · c210 the goalie: "NOBODY
     scores on me.").
   ============================================================ */
KinanLevels.register({
  id: '2-fort', world: 2, slot: 6, kind: 'fort',
  name: "THE GOALIE'S NET",
  theme: 33,                /* borrows the rodeo-grounds look: a big grandstand full of cheering fans */
  spawn: { col: 2, row: 11 },
  areas: [
    {
      id: 'round-1', name: 'ROUND 1', cols: 72,
      heights: [
        /* 0-26 kick-off: 2-pit c12-13, hurdles, then the first defender on open ground */
        192,192,192,192,192,192,192,192,192,192,192,192, null,null, 192,192,192,192,192,192,192,192,192,192,192,192,192,
        /* 27-53 the touchline: 3-pit c37-39 · the team bench c44-48 */
        192,192,192,192,192,192,192,192,192,192, null,null,null, 192,192,192,192,192,192,192,192,192,192,192,192,192,192,
        /* 54-71 the water cooler · 3-pit c62-64 · the end of round 1 */
        192,192,192,192,192,192,192,192, null,null,null, 192,192,192,192,192,192,192
      ],
      solid: [
        [17, 11, 17, 11], [20, 11, 20, 11],   /* training hurdles */
        [44, 10, 48, 11],                     /* the team bench */
        [58, 10, 58, 11]                      /* the water cooler: a defender is penned between it and the bench */
      ],
      tiles: { gift: [[6, 8, 'popper'], [46, 7], [69, 8]] },
      foes: [[29, 11, 'bully'],
             [33, 11, 'ball'], [53, 11, 'bully']],
      candles: [[3, 11], [4, 11], [5, 11], [11, 10], [12, 9], [13, 9], [14, 10], [17, 10], [20, 10],
                [24, 11], [25, 11],
                [36, 10], [37, 9], [38, 8], [39, 9], [40, 10], [44, 9], [45, 9], [47, 9], [48, 9],
                [58, 9], [61, 10], [62, 9], [63, 8], [64, 9], [65, 10], [67, 11], [68, 11]]
    },
    {
      id: 'round-2', name: 'ROUND 2', cols: 72,
      heights: [
        /* 0-11 the field rises: 2:1 up c6-11 */
        192,192,192,192,192,192, 184,176,168,160,152,144,
        /* 12-19 the midfield crown (a defender charges down from here) · 20-22 1:1 down */
        144,144,144,144,144,144,144,144, 160,176,192,
        /* 23-30 · 4-pit c27-30 */
        192,192,192,192, null,null,null,null,
        /* 31-45 · 4-pit c42-45 with a plank across it (a goose above) */
        192,192,192,192,192,192,192,192,192,192,192, null,null,null,null,
        /* 46-62 · CORNER KICK: springboard at the lip c56, 4-pit c57-60, the 6-tall boards c61-62 */
        192,192,192,192,192,192,192,192,192,192, 192, null,null,null,null, 192,192,
        /* 63-71 the runway after the boards */
        192,192,192,192,192,192,192,192,192
      ],
      solid: [[2, 11, 2, 11],                 /* a hurdle: the hill's defender can't charge back to round 1's landing */
              [61, 6, 62, 11]],               /* the advertising boards (6 tall): the corner kick is the way over */
      tiles: {
        gift: [[15, 5], [52, 8], [66, 8, 'heart']],
        spring: [[56, 12]],
        shelf: [[42, 9], [43, 9], [44, 9], [45, 9]]   /* the plank over the second 4-pit */
      },
      foes: [[4, 11, 'ball'], [17, 8, 'bully'],
             [36, 11, 'ball'], [51, 6, 'goose'],
             [53, 11, 'hopcone']],
      candles: [[2, 10], [7, 10], [9, 9], [11, 8], [13, 7], [14, 7], [16, 7], [18, 7], [20, 8], [21, 9],
                [26, 10], [27, 9], [28, 8], [29, 8], [30, 9], [31, 10],
                [42, 8], [43, 8], [44, 8], [45, 8],
                [56, 9], [57, 6], [58, 4], [59, 3], [60, 3], [61, 3], [62, 3], [63, 5], [64, 7], [65, 9],
                [70, 11], [71, 11]],
      checkpoint: { col: 47, row: 11 }
    },
    {
      id: 'round-3', name: 'ROUND 3', cols: 93,
      heights: [
        /* 0-11 the penalty box: 5-pit c7-11 */
        192,192,192,192,192,192,192, null,null,null,null,null,
        /* 12-21 · 22-25 TERRACE up · 26-31 the terrace (a defender and the coach) · 32-33 1:1 down */
        192,192,192,192,192,192,192,192,192,192, 184,176,168,160, 160,160,160,160,160,160, 176,192,
        /* 34-49 · 5-pit c38-42 · the six-yard line */
        192,192,192,192, null,null,null,null,null, 192,192,192,192,192,192,192,
        /* 50-53 4-pit · 54-56 the checkpoint runway · 57-82 THE GOAL MOUTH: the arena gate c57, the big
           goalie's 24 tiles of grass c58-81, his door c82 · 83-92 the net (the goal) */
        null,null,null,null, 192,192,192, 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
        192,192,192,192,192,192,192,192,192,192
      ],
      solid: [[17, 11, 17, 11]],              /* a hurdle: the terrace defender can't reach the 5-pit's landing */
      tiles: { gift: [[3, 8, 'heart'], [18, 8], [55, 8, 'popper'], [86, 8, 'heart']] },   /* the last heart: Aiden's water bottle after the match */
      foes: [[27, 9, 'bully'], [31, 9, 'teacher'], [29, 5, 'goose']],
      candles: [[6, 10], [7, 9], [8, 8], [9, 7], [10, 8], [11, 9], [12, 10], [17, 10],
                [22, 10], [24, 9], [26, 8], [28, 8], [30, 8],
                [37, 10], [38, 9], [39, 8], [40, 7], [41, 8], [42, 9], [43, 10],
                [49, 10], [50, 9], [51, 8], [52, 8], [53, 9], [54, 10],
                [84, 11], [85, 11], [87, 11], [90, 11]],
      arena: { col: 58, cols: 24, boss: 'goalie' },   /* 2 phases (the default for him); its own checkpoint flag stands at c54 */
      goal: { col: 88, row: 11 }              /* the big goalie's net */
    }
  ]
});

/* ============================================================
   CASTLE · THE BIRTHDAY PARTY AT THE FALLS  (World 10 · Niagara Falls · stop 11)
   Story bible (World 10) and Shad's choices (2026-10-29): everyone is at
   Niagara Falls for Kinan's birthday party: Dad, Big Sis Chenoa, Big Bro
   Shad, Annie, the pets, both Grandmas and GRANDPA. Mom still isn't sure
   Kinan is ready, so she sets one last challenge: MOM'S LAST INSPECTION.
   Route (the same shape and length as 9-castle): S1 THE PARTY LAWN (a
     popper in the first gift, a 3-wide hole where a flower bed is dug up,
     THE BANDSTAND: a raised stage (2:1 up, a 7-tile top, 2:1 down) with a
     picnic blanket hung as a ledge and a gift over it, a 9-tile runway off
     it) · S2 THE BIG PARTY TENT (under its checked canopy: 6 tiles of air
     under it, so no jump is cut short; two 4-wide ditches with a 5-tile
     floor between, a picnic hamper 2 tiles tall to hop) · S3 THE LOOKOUT
     (2:1 steps up, a 6-tile stone lookout wall, a 5-wide jump over the
     rapids to the second wall, steps down) · the CHECKPOINT (c88) · THE
     GARDEN GATE (c88-95, a heart before the gate) · the ARENA: the party
     lawn by the big table, 24 tiles of floor, framed on one screen.
   Story bubbles (talk): Kinan, Dad, Chenoa, Annie, Shad, Grandma
     (Edmonton) and Mom. Subtitles only: no recordings.
   The fight (index.html ARENA_KINDS 'mom-final', 3 rounds, CHORES-TO-PARTY;
   each round trickier, the "getting smarter" banner after each):
     1 TIDY THE ROOM         toys and socks fly out of a giant toy box (a
                             shadow shows where each lands); pick each one
                             up and drop it in the bin of its colour (red
                             TOYS, blue SOCKS) while Mom calls out the next
     2 DODGE THE LAUNDRY     baskets tip and roll (jump), socks fly onto
                             shadows, a towel sweeps the floor (jump; its
                             gust only pushes); every one has a "!" tell
     3 CARRY THE CAKE SAFELY from its stand to the party table: over the
                             bouncy castle, past rolling tables and rising
                             balloons, while Mom tosses socks and baskets;
                             a bump drops the cake: it goes back on its
                             stand and only this round starts again
   Tells 48 / 42 / 38 frames (36 is the 0.6 s floor). Mom is never hit and
   never hurt; the KICK never touches her. No game over (the arena's
   checkpoint, the round starts again); Glitchy's help after 5 lost tries.
   THE ENDING (5 lines or fewer per beat, a tap or Enter skips one): Mom
   is proud ("You're ready, my boy.") and joins the team; Grandpa's
   joke-off (Dad's wheeze-laugh, Mom laughs); the cake and the song; THE
   TURN: the Falls stop and flow UPWARD, the picture tears sideways
   ("Wait... did the world just glitch?"), a door opens in the mist: the
   way into the console. Then LEVEL CLEAR past the boss door.
   Gaps (thirds of the platforming before the gate, cols 0-94): act 1 3
     · act 2 4, 4 · act 3 5. Castle slot: exempt from secrets. No pet.
   Look: the Birthday Party at the Falls (theme 210, World 10's own look):
     the Horseshoe Falls behind, mist and a rainbow, the island's lawn, a
     striped party tent, balloons and strings of lights.
   ============================================================ */
KinanLevels.register({
  id: '10-castle', world: 10, slot: 11, kind: 'castle',
  name: 'THE BIRTHDAY PARTY AT THE FALLS',
  theme: 210,               /* the party on the island by the Falls (World 10's own look) */
  cols: 131,
  heights: [
    /* S1 0-31 THE PARTY LAWN: a dug-up flower bed c5-7 (3) · THE BANDSTAND (c13-22: 2:1 up, a 7-tile top, 2:1 down) · a
       9-tile runway (c23-31) */
    192,192,192,192,192, null,null,null, 192,192,192,192,192, 184,176, 176,176,176,176,176,176, 184,192, 192,192,192,192,192,192,192,192,192,
    /* S2 32-61 THE BIG PARTY TENT (its canopy c33-60): 4-wide ditch c32-35 · a 5-tile floor · 4-wide ditch c41-44 · the
       tables, the picnic hamper (c55) */
    null,null,null,null, 192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 62-87 THE LOOKOUT: a runway (c62-65), 2:1 steps up (c66-68), the first lookout wall (c69-74), 5-wide over the
       rapids c75-79, the second wall (c80-83), 2:1 steps down (c84-86) */
    192,192,192,192, 184,176,168, 160,160,160,160,160,160, null,null,null,null,null, 160,160,160,160, 168,176,184, 192,
    /* 88-95 THE GARDEN GATE: the checkpoint (c88), a heart before the gate (c93) */
    192,192,192,192,192,192,192,192,
    /* 96-119 THE PARTY LAWN BY THE BIG TABLE (the arena: 24 tiles of floor; the boss door c120) · 121-130 the way out */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [33, 4, 60, 5],                         /* S2 the big party tent's canopy (6 tiles of air under it) */
    [55, 10, 55, 11]                        /* a picnic hamper (2 tall): hop over it or stand on it */
  ],
  skins: [
    ['blanket', 33, 4, 60, 5],              /* the tent's checked canopy */
    ['basket', 55, 10, 55, 11],             /* the picnic hamper */
    ['blanket', 16, 8, 19, 8]               /* a picnic blanket hung over the bandstand's rail (a ledge) */
  ],
  tiles: {
    gift: [[3, 8, 'popper'], [18, 5], [37, 8], [51, 8], [64, 8], [93, 8, 'heart'], [124, 7, 'cake']],   /* the cake on the way out */
    brick: [[63, 8], [65, 8]],
    shelf: [[16, 8], [17, 8], [18, 8], [19, 8]]   /* the bandstand's rail */
  },
  /* party guests and tourists; a hot dog cart; a seagull high over the rapids. Nothing waits at a gap's lip or on the
     floor between two gaps */
  foes: [[10, 11, 'mallwalker'], [26, 11, 'corndog'],
         [49, 11, 'cart'], [58, 11, 'mallwalker'],
         [63, 11, 'drummer'], [77, 4, 'seagull']],
  candles: [[1, 11], [2, 11], [4, 10], [5, 9], [6, 8], [7, 9], [8, 10], [12, 11], [14, 9], [15, 9], [16, 7], [17, 7], [19, 7], [21, 9],
            [24, 11], [25, 11], [28, 11], [29, 11], [30, 10], [31, 9], [32, 8], [33, 8], [34, 8], [35, 9], [36, 10],
            [38, 11], [40, 10], [41, 9], [42, 8], [43, 8], [44, 9], [45, 10], [47, 11], [53, 11], [55, 9], [60, 11],
            [62, 11], [66, 10], [67, 10], [69, 9], [71, 9], [73, 9], [74, 8], [75, 7], [76, 6], [77, 6], [78, 7], [79, 8], [81, 9], [82, 9], [85, 9],
            [89, 11], [91, 11], [92, 11], [94, 11],
            [122, 11], [123, 11], [125, 11], [127, 11], [128, 11]],   /* the way out */
  /* story bubbles as Kinan passes a column: [col, who, what they say, seconds] (subtitles only) */
  talk: [
    [1, 'KINAN', "The island by the Falls! I can hear music... and I can smell CAKE. This is my party!", 3.8],
    [9, 'DAD', "Birthday boy! Everybody's here. Even the Falls came. They never miss a chance to make a splash.", 4.4],
    [14, 'CHENOA', "Up the bandstand, little bro! I hung the bunting myself. You're welcome.", 3.6],
    [27, 'ANNIE', "Kinan! Chalo! (Let's go!) Your mom's waiting by the big table. She looks... serious.", 4.2],
    [33, 'KINAN', 'The party tent! Streamers, lanterns, a hundred cupcakes... and a ditch right in the middle?', 4],
    [46, 'SHAD', "Hop that hamper, bud. I built the party tables myself. They're solid. Mostly.", 3.6],
    [63, 'GRANDMA (EDMONTON)', 'Careful by the rapids, sweetheart! And zip up that jacket!', 3.4],
    [72, 'KINAN', "A big jump between the lookout walls. Mom's watching. I've got this.", 3.6],
    [90, 'MOM', "There you are, my boy. One last inspection, and then... we'll see.", 3.8]
  ],
  arena: { col: 96, cols: 24, boss: 'mom-final', checkpoint: { col: 88, row: 11 } },   /* 3 rounds: tidy, laundry, the cake */
  spawn: { col: 2, row: 11 },
  goal: { col: 126, row: 11 }   /* the door in the mist, past the boss door */
});

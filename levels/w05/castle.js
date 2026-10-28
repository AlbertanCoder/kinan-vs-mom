/* ============================================================
   CASTLE · THE GRANDSTAND SHOW  (World 5 · Calgary Stampede · stop 11)
   Story bible (World 5): "Bronco at the Grandstand Show: a chase, then
   calming him with music and safe gates during the fireworks." Castle
   row: "Bronco, under the fireworks." Bronco is a young bull, and he is
   NOT mean: he is scared of the fireworks. Kinan figures that out (the
   first time he understands it about anyone, Glitchy included), and
   Bronco becomes a friend.
   Route (the toughest platforming so far, still fair): S1 the infield
     (a hard hat in the first gift, a 3-pit, a drummer marching, THE
     CHUCKWAGON STAGE: a 2-tall MESA with a brick shelf over it and a
     sparkler high above, a 7-tile runway off it) · S2 the chutes (two
     4-pits with a 5-tile island, a rolling hay bale, a hay-bale stack,
     a sparkler in the night air) · S3 the stage stairs (a 5-pit after a
     9-tile runway, a 6-tile island, a 5-pit, a heart in a brick shelf,
     the checkpoint right before the gate) · the ARENA: the Grandstand
     stage, 24 tiles of dirt, framed on one screen, fireworks overhead.
   The fight (index.html ARENA_KINDS.bronco, 3 phases, one per pat):
   REAL STRATEGY: a scared bull can't be patted. A glowing ♪ (the music
     that calms him) floats in on the side away from him; Kinan has to
     grab it while dodging, and only then, once Bronco finishes what he
     is doing, does he settle down — PAT! No music by the end of the
     pattern = still spooked, and round he goes again (the music waits).
     1 (dumb)     fireworks fall on shadows marked on the floor (three),
                  then he CHARGES across the stage (jump him) and crashes
                  into the far gate; the music sits on the floor
     2 (smarter)  FAKES a charge (the real one starts with a STOMP); new:
                  a pinwheel skitters along the dirt (jump it), four
                  fireworks, and the charge now TURNS at the gate (a fresh
                  "!") and comes BACK; the music floats up high: jump
                  for it
     3 (smartest) knows where Kinan is GOING: four fireworks aimed ahead;
                  new: he STAMPS and a dust wave runs out both ways (jump
                  it); a pinwheel, the double charge
   The toughest fight so far: the shortest tells of any boss yet (0.9 /
   0.73 / 0.63 s, never under 0.6 s), the shortest rests, the longest
   patterns, and the music to fetch on top. Glitchy still offers his help
   after 5 lost fights.
   Calmed: Bronco lies down in the straw · Robin: "Look at that. He's
   calming down. You did that, bud." · Kinan: "Bronco's my friend now!
   Who wants a ride?" Beating him opens World 5's exit on the map: east,
   to the badlands.
   Not built: the bible's "safe gates" (Kinan opening pen gates for him)
   — the music is the calming tool.
   Gaps (thirds of the platforming before the gate, cols 0-80): act 1 3
     · act 2 4, 4 · act 3 5, 5. Castle slot: exempt from secrets.
   ============================================================ */
KinanLevels.register({
  id: '5-castle', world: 5, slot: 11, kind: 'castle',
  name: 'THE GRANDSTAND SHOW',
  theme: 40,                /* the Grandstand Show: the stands, the stage lights, a night sky for the fireworks */
  cols: 117,
  heights: [
    /* S1 0-26 the infield: 3-pit c5-7 · THE CHUCKWAGON STAGE (a MESA c13-22: 1:1 up, a 6-tile top, 1:1 down)
       · a 7-tile runway (c23-29: a full-run jump off the stage lands on it) */
    192,192,192,192,192, null,null,null, 192,192,192,192,192, 176,160, 160,160,160,160,160,160, 176,192, 192,192,192,192,
    /* S2 27-53 the chutes: 4-pit c30-33 · a 5-tile island · 4-pit c39-42 · an 11-tile floor with a hay-bale stack */
    192,192,192, null,null,null,null, 192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 the stage stairs: a 9-tile runway (c49-57) · 5-pit c58-62 · a 6-tile island · 5-pit c69-73 · the checkpoint (c78) */
    192,192,192,192, null,null,null,null,null, 192,192,192,192,192,192, null,null,null,null,null, 192,192,192,192,192,192,192,
    /* 81-106 THE GRANDSTAND STAGE: the gate (c81), 24 tiles of dirt (c82-105), the boss door (c106) · 107-116 the way out */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [47, 10, 48, 11]                        /* a hay-bale stack (2 tall): over it or onto it */
  ],
  tiles: {
    gift: [[3, 8, 'hat'], [17, 6], [44, 8], [75, 8, 'heart'], [110, 8, 'cake']],   /* the cake: mini donuts on the way out */
    brick: [[16, 6], [18, 6], [74, 8], [76, 8]]
  },
  /* nothing waits at a pit's lip or on an island between two pits; the sparklers drift over flat ground, high */
  foes: [[11, 11, 'drummer'], [20, 5, 'sparkler'],
         [44, 11, 'haybale'], [51, 6, 'sparkler']],
  candles: [[1, 11], [2, 11], [4, 10], [5, 9], [6, 8], [7, 9], [8, 10], [14, 9], [15, 8], [20, 8], [21, 9],
            [24, 11], [25, 11], [29, 10], [30, 9], [31, 8], [32, 8], [33, 9], [34, 10], [38, 10], [39, 9], [40, 8], [41, 8], [42, 9], [43, 10],
            [47, 9], [48, 9], [51, 11], [54, 11],
            [57, 10], [58, 9], [59, 8], [60, 7], [61, 8], [62, 9], [63, 10],
            [68, 10], [69, 9], [70, 8], [71, 7], [72, 8], [73, 9], [74, 10], [77, 11],
            [108, 11], [109, 11], [111, 11], [114, 11]],
  arena: { col: 82, cols: 24, boss: 'bronco' },   /* 3 phases (the default); its checkpoint flag stands at c78 */
  spawn: { col: 2, row: 11 },
  goal: { col: 112, row: 11 }
});

/* ============================================================
   CASTLE · THE PRINCIPAL'S BELL TOWER  (World 2 · School · stop 11)
   Story bible (World 2): "The Principal's Bell Schedule Challenge: bell
   waves, hall-pass switches, desk platforms. The principal congratulates
   Kinan." The school is fictional: no real name, logo or staff. He is
   not a villain: he loves the bell schedule, and he ends with a gold star.
   Route (one step up from Bedtime Castle, still short): S1 the front
     steps (a 3-pit, a TERRACE climb with a brick ledge, a paper plane)
     · S2 the halls (a teacher on the landing, a 4-pit with two floating
     planks, a hall bully on open ground) · S3 the stairwell (a plane, a
     3-pit, a heart in a brick ledge, the checkpoint right before the
     gate) · the ARENA: the bell-tower classroom, 24 tiles of floor with
     two desks to stand on, framed on one screen.
   The fight (index.html ARENA_KINDS.principal, 3 phases, one per stomp):
     1 (dumb)     rings his bell: three bells fall on shadows marked on
                  the floor (and on the desks), then he lobs one; then he
                  stops to check his watch — STOMP!
     2 (smarter)  FAKES the bell (the real one starts with a STOMP); new
                  attack: he RUNS in the halls, a dash to the far wall
                  (jump him) that leaves him DIZZY — stomp; two bouncing
                  balls come in
     3 (smartest) four bells aimed where Kinan is GOING, a lob, then the
                  dash: the bell-schedule combo
   Harder than Mom: shorter tells (still 0.6 s+), shorter rests and naps,
   more bells. The desks are the safe high ground (a dash passes under).
   Not built: the bible's hall-pass switches (a switch-and-gate engine
   piece does not exist yet) — the desks and bell waves carry the fight.
   Gaps (thirds of the platforming before the gate, cols 0-80): act 1 3
     · act 2 4 (two planks over it) · act 3 3. Exempt from secrets.
   ============================================================ */
KinanLevels.register({
  id: '2-castle', world: 2, slot: 11, kind: 'castle',
  name: "THE PRINCIPAL'S BELL TOWER",
  theme: 58,                /* the school-front look: the school behind, yellow bricks */
  cols: 117,
  heights: [
    /* S1 0-26 the front steps: 3-pit c7-9 · TERRACE c15-23 (2:1 up, landing, 2:1 up) · the top c24-26 */
    192,192,192,192,192,192,192, null,null,null, 192,192,192,192,192, 184,176, 176,176,176,176,176, 168,160, 160,160,160,
    /* S2 27-53 the halls: the landing c27-30, 1:1 down c31-32, a 6-tile runway · 4-pit c39-42 · 1:1 up c50-51 */
    160,160,160,160, 176,192, 192,192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192, 176,160, 160,160,
    /* S3 54-80 the stairwell: 1:1 down c58-59, a 7-tile runway (a full-run jump off the landing lands on it)
       · 3-pit c67-69 · the checkpoint (c78) before the gate */
    160,160,160,160, 176,192, 192,192,192,192,192,192,192, null,null,null, 192,192,192,192,192,192,192,192,192,192,192,
    /* 81-106 THE BELL-TOWER CLASSROOM: the gate (c81), 24 tiles of floor (c82-105), the boss door (c106) · 107-116 the way out */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,192
  ],
  tiles: {
    gift: [[4, 8, 'popper'], [18, 6], [47, 7], [75, 8, 'heart'], [110, 8, 'cake']],   /* the cake: a gold-star treat on the way out */
    brick: [[17, 6], [19, 6], [74, 8], [76, 8]],
    shelf: [[40, 9], [41, 9],                              /* two planks over the 4-pit */
            [87, 9], [88, 9], [89, 9], [98, 9], [99, 9], [100, 9]]   /* the classroom desks (stand on them!) */
  },
  foes: [[12, 11, 'ball'], [20, 6, 'plane'],
         [28, 9, 'teacher'], [35, 11, 'ball'], [46, 11, 'bully'],
         [56, 5, 'plane'], [63, 11, 'ball'], [72, 11, 'ball']],
  candles: [[2, 11], [3, 11], [6, 10], [7, 9], [8, 8], [9, 9], [10, 10], [17, 9], [18, 9], [19, 9], [24, 8], [25, 8],
            [33, 11], [34, 11], [38, 10], [39, 9], [40, 8], [41, 8], [42, 9], [43, 10], [52, 8], [53, 8],
            [60, 11], [61, 11], [66, 10], [67, 9], [68, 8], [69, 9], [70, 10], [77, 11],
            [108, 11], [109, 11], [110, 11], [111, 11]],
  arena: { col: 82, cols: 24, boss: 'principal' },   /* 3 phases (the default); its checkpoint flag stands at c78 */
  spawn: { col: 2, row: 11 },
  goal: { col: 112, row: 11 }
});

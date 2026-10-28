/* ============================================================
   CASTLE · NIGHT SHIFT AT ROBIN'S RIG  (World 3 · Robin's oilfield · stop 11)
   Story bible (World 3): "The Safety Foreman: cone patterns, caution-tape
   gates, safety-lock switches. He ends up handing Kinan an honorary hard
   hat." Castle row: "The Safety Foreman, in a storm under the
   floodlights." All machinery is cartoon and safe: Kinan never runs real
   equipment. The foreman is not a villain: safety is his whole heart,
   and he is scared a kid will get hurt on his site.
   Route (one step up from the Principal's bell tower): S1 the lease pad
     under the floodlights (the first gift is a HARD HAT — "no hard hat,
     no entry!" — a 3-pit, the pipe-rack BROW with a brick shelf, a cone
     on the pad) · S2 the pipe rack (a 4-pit with a plank, a mud puddle
     walker under a mosquito cloud, the MESA of the doghouse with a
     hopping cone on top, a clear runway) · S3 the rig floor
     stairs (a 5-pit after a 9-tile runway, a 3-pit, a heart in a brick
     shelf, the checkpoint right before the gate) · the ARENA: the rig's
     drill floor, 24 tiles of open steel, framed on one screen.
   The fight (index.html ARENA_KINDS.foreman, 3 phases, one per stomp):
     1 (dumb)     "Cones! Follow the cones!": three traffic cones fall on
                  shadows marked on the floor, then a pipe rolls along the
                  floor (jump it); then he stops for a safety break (a cup
                  of coffee) — STOMP!
     2 (smarter)  FAKES (the real one starts with a STOMP); new: his
                  MEGAPHONE ("Caution tape means caution, kid!") pushes
                  Kinan back while a pipe rolls; three cones; one little
                  walking cone comes in (QA 2026-10-28: was four and two)
     3 (smartest) aims where Kinan is GOING: four cones, three lobbed
                  hard hats, the megaphone, a pipe — the full safety drill
   Harder than the Principal: shorter tells (1.0 / 0.8 / 0.67 s, never
   under 0.6 s), shorter breaks, longer patterns (2 / 3 / 4 attacks).
   Befriended: "Well, I'll be. Safest boss fight I ever saw." · "Here.
   Honorary hard hat. You earned it, kid." Beating him opens World 3's
   exit on the map: the road to Edmonton.
   Not built: the bible's caution-tape gates and safety-lock switches (a
   switch-and-gate engine piece does not exist yet) — cones, pipes and
   the megaphone carry the fight.
   Gaps (thirds of the platforming before the gate, cols 0-80): act 1 3
     · act 2 4 (a plank over it) · act 3 5, 3. Castle slot: exempt from
     secrets.
   ============================================================ */
KinanLevels.register({
  id: '3-castle', world: 3, slot: 11, kind: 'castle',
  name: "NIGHT SHIFT AT DAD'S RIG",
  theme: 20,                /* the rig at night: floodlights, a purple-black sky, red steel */
  cols: 117,
  heights: [
    /* S1 0-26 the lease pad: 3-pit c7-9 · the pipe-rack BROW c15-24 (2:1 up, a 6-tile top, 2:1 down) */
    192,192,192,192,192,192,192, null,null,null, 192,192,192,192,192, 184,176, 176,176,176,176,176,176, 184,192, 192,192,
    /* S2 27-53 the pipe rack: 4-pit c31-34 (a plank) · THE DOGHOUSE MESA c41-49 (1:1 up, a 5-tile top, 1:1 down) */
    192,192,192,192, null,null,null,null, 192,192,192,192,192,192, 176,160, 160,160,160,160,160, 176,192, 192,192,192,192,
    /* S3 54-80 the rig floor stairs: a 9-tile runway (c50-58) · 5-pit c59-63 · 3-pit c71-73 · the checkpoint (c78) */
    192,192,192,192,192, null,null,null,null,null, 192,192,192,192,192,192,192, null,null,null, 192,192,192,192,192,192,192,
    /* 81-106 THE DRILL FLOOR: the gate (c81), 24 tiles of floor (c82-105), the boss door (c106) · 107-116 the way out */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,192
  ],
  tiles: {
    gift: [[4, 8, 'hat'], [19, 6], [45, 6], [75, 8, 'heart'], [110, 8, 'cake']],   /* the hat: "No hard hat, no entry!" · the cake: a treat on the way out */
    brick: [[18, 6], [20, 6], [74, 8], [76, 8]],
    shelf: [[31, 9], [32, 9], [33, 9], [34, 9]]   /* a plank across the 4-pit, like the pipe rack's catwalk */
  },
  /* nothing flies near a pit; the mosquito cloud hangs over flat ground with room to run under it */
  /* QA 2026-10-28: the walking cone that guarded the 5-pit's runway (c52) is gone — it made the jump a
     coin-flip (the bot fell in again and again) and the Foreman's level harder than World 4 and 5 */
  foes: [[12, 11, 'cone'],
         [36, 11, 'mud'], [40, 9, 'mosquito'], [45, 9, 'hopcone']],
  candles: [[2, 11], [3, 11], [6, 10], [7, 9], [8, 8], [9, 9], [10, 10], [17, 9], [18, 9], [19, 9], [21, 9], [22, 9],
            [30, 10], [31, 8], [32, 8], [33, 8], [34, 8], [35, 10], [42, 8], [43, 8], [47, 8], [48, 8],
            [52, 11], [53, 11], [58, 10], [59, 9], [60, 8], [61, 7], [62, 8], [63, 9], [64, 10],
            [70, 10], [71, 9], [72, 8], [73, 9], [74, 10], [77, 11],
            [108, 11], [109, 11], [111, 11], [114, 11]],
  arena: { col: 82, cols: 24, boss: 'foreman' },   /* 3 phases (the default); its checkpoint flag stands at c78 */
  spawn: { col: 2, row: 11 },
  goal: { col: 112, row: 11 }
});

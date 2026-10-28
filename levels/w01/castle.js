/* ============================================================
   CASTLE · BEDTIME CASTLE  (World 1 · Saskatoon home · trail stop 11)
   Story bible: Bedtime Castle (The Bessborough) — "Mom, the Room
   Inspector. Sort runaway socks, stomp laundry piles, then Mom's proud
   hug." Mom is never the bad guy: she is protective, and the fight ends
   in a hug, not a defeat.
   Route (short and fun, then the fight): S1 the grand hall (a BROW,
     a party popper, a brick shelf, one sock, a 2-pit after a runway) ·
     S2 the bunk beds (a trampoline sunk in the floor launches you onto
     the MESA of pillows, a party hat up top, a 3-pit after a 9-tile
     runway — a full-speed bounce or a jump off the mesa never lands in
     a pit) · S3 the hallway (a 2-pit, a
     heart in a brick shelf, the checkpoint flag right before the gate)
     · the ARENA: Mom's room inspection, 24 tiles of open floor framed
     on one screen.
   The fight (index.html ARENA_KINDS.mom, 3 phases, one per stomp):
     1 (dumb)     tosses one sock at where Kinan IS, twice, then sits
                  down to fold laundry — STOMP!
     2 (smarter)  two socks; FAKES a throw (the real one starts with a
                  big STOMP); rolls a laundry pile along the floor (jump
                  it); two walking socks come in
     3 (smartest) aims where Kinan is GOING; adds the bedtime slam: she
                  jumps onto a red ring (marked a second ahead), pillow
                  puffs roll out both ways
   Every attack has a 0.6 s+ wind-up with a flashing "!". Then the hug:
   "Look at this room. Spotless." · "Come here, birthday boy. I'm proud
   of you." · "Okay. Go get him. But you stay safe, you hear me?" — the
   gates fall and the goal is a few steps on.
   Gaps (acts are thirds of the platforming before the gate, cols 0-71):
     act 1 none (the brow teaches) · act 2 2 · act 3 3, 2. Castle slot:
     exempt from secrets.
   ============================================================ */
KinanLevels.register({
  id: '1-castle', world: 1, slot: 11, kind: 'castle',
  name: 'BEDTIME CASTLE',
  theme: 9,                 /* the legacy Bedtime Castle look */
  cols: 108,
  heights: [
    /* S1 0-26 the grand hall: BROW c8-16, a 7-tile runway (a jump off the brow lands on it) · 2-pit c24-25 */
    192,192,192,192,192,192,192,192, 184,176, 176,176,176,176,176, 184,192, 192,192,192,192,192,192,192, null,null, 192,
    /* S2 27-53 the bunk beds: 1:1 up c31-32, the pillow MESA c33-38, 1:1 down c39-40, a 9-tile runway · 3-pit c50-52 */
    192,192,192,192, 176,160, 160,160,160,160,160,160, 176,192, 192,192,192,192,192,192,192,192,192, null,null,null, 192,
    /* S3 54-71 the hallway · 2-pit c61-62 · the checkpoint (c69) right before the gate */
    192,192,192,192,192,192,192, null,null, 192,192,192,192,192,192,192,192,192,
    /* 72-97 MOM'S ROOM: the gate (c72), 24 tiles of floor (c73-96), the boss door (c97) · 98-107 the way out */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,192
  ],
  tiles: {
    gift: [[5, 8, 'popper'], [12, 6], [35, 6, 'hat'], [65, 8, 'heart']],
    brick: [[11, 6], [13, 6], [64, 8], [66, 8]],
    spring: [[28, 12]]      /* the trampoline sits flush in the floor: run over it onto the pillow mesa */
  },
  foes: [[20, 11, 'sock'],
         [36, 9, 'teddy'], [45, 11, 'sock'],
         [57, 11, 'lego']],
  candles: [[2, 11], [3, 11], [10, 9], [11, 9], [13, 9], [14, 9], [23, 10], [24, 9], [25, 9], [26, 10],
            [28, 9], [29, 7], [30, 6], [33, 8], [34, 8], [37, 8], [38, 8], [42, 11], [43, 11], [50, 9], [51, 8], [52, 9],
            [60, 10], [61, 9], [62, 9], [63, 10], [67, 11], [68, 11],
            [99, 11], [100, 11], [101, 11], [102, 11]],
  arena: { col: 73, cols: 24, boss: 'mom' },   /* 3 phases (the default for Mom); its checkpoint flag stands at c69 */
  spawn: { col: 2, row: 11 },
  goal: { col: 103, row: 11 }
});

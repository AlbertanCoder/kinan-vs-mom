/* ============================================================
   CASTLE · CHENOA'S RESTAURANT RUSH  (World 4 · Edmonton Homecoming · stop 11)
   Story bible (World 4): "Chenoa's Restaurant Rush: bounce plates back,
   dodge ground-pound shockwaves, survive the rush. Shad builds platforms
   to help. Chenoa ends with a proud hug." Castle row: "In the ICE
   District, below Stantec Tower." The restaurant is fictional (never a
   real one). Chenoa is Kinan's big sister and she is NOT a villain: she
   is in dinner-rush mode, protective, bossy and loving, and she joins
   the team after this fight.
   Route (one step up from Robin's rig): S1 the dining room (a hard hat
     in the first gift, a 3-pit, a slippery-floor sign hopping at you,
     THE COUNTER: a MESA with a waiter throwing plates and a brick shelf
     over it) · S2 the kitchen (a 4-pit with a shelf plank, a 4-pit, a
     serving cart rolling at a table, a mall walker who wandered in) · S3
     the pass (a 5-pit after a 10-tile runway, a 4-pit, a heart in a
     brick shelf, the checkpoint right before the gate) · the ARENA: the
     kitchen floor, 24 tiles, framed on one screen.
   The fight (index.html ARENA_KINDS.chenoa, 3 phases, one per stomp):
     1 (dumb)     "Order up!": two plates thrown at where Kinan IS, then
                  the GROUND POUND: she jumps onto a red ring (marked a
                  second ahead) and shockwaves run out both ways (jump
                  them); then she stops to catch her breath — STOMP!
     2 (smarter)  FAKES (the real one starts with a STOMP); SHAD BUILDS
                  TWO PLATFORMS ("Hang on, bud! I'm building you a
                  platform!"): the shockwaves pass under them and her
                  landing can't reach Kinan up there; new: a serving cart
                  rolls along the floor (jump it)
     3 (smartest) aims where Kinan is GOING: three plates, the ground
                  pound, a cart, then the RUSH: she runs the length of the
                  kitchen (jump her) and ends dizzy — stomp!
   Harder than the Safety Foreman: shorter tells (0.93 / 0.77 / 0.63 s,
   never under 0.6 s), shorter breaks, faster shockwaves each phase.
   Befriended: "Okay, fine. You survived a dinner rush. That's huge." ·
   "Come here, little bro." · "Somebody has to keep you out of trouble.
   Grab a tray and keep up." — a proud hug, and she joins the team.
   Beating her opens World 4's exit on the map: the bus to Calgary.
   Not built: bouncing a plate back at her (the plates bounce on the
   floor, but Kinan can't hit them back yet).
   Gaps (thirds of the platforming before the gate, cols 0-80): act 1 3
     · act 2 4 (a plank over it), 4 · act 3 5, 4. Castle slot: exempt
     from secrets.
   ============================================================ */
KinanLevels.register({
  id: '4-castle', world: 4, slot: 11, kind: 'castle',
  name: "CHENOA'S RESTAURANT RUSH",
  theme: 27,                /* the restaurant: an ORDER UP window, checkered tables, hanging lamps */
  cols: 117,
  heights: [
    /* S1 0-26 the dining room: 3-pit c6-8 · THE COUNTER (a MESA c14-23: 1:1 up, a 6-tile top, 1:1 down) */
    192,192,192,192,192,192, null,null,null, 192,192,192,192,192, 176,160, 160,160,160,160,160,160, 176,192, 192,192,192,
    /* S2 27-53 the kitchen: 4-pit c30-33 (a shelf plank) · 4-pit c39-42 · an 11-tile floor with a table on it */
    192,192,192, null,null,null,null, 192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 the pass: a 10-tile runway (c49-58) · 5-pit c59-63 · 4-pit c69-72 · the checkpoint (c78) */
    192,192,192,192,192, null,null,null,null,null, 192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192,192,
    /* 81-106 THE KITCHEN FLOOR: the gate (c81), 24 tiles of floor (c82-105), the boss door (c106) · 107-116 the way out */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [46, 10, 48, 11]                        /* a kitchen table (2 tall): over it or onto it */
  ],
  tiles: {
    gift: [[3, 8, 'hat'], [18, 6], [44, 8], [75, 8, 'heart'], [110, 8, 'cake']],   /* the cake: dessert on the way out */
    brick: [[17, 6], [19, 6], [74, 8], [76, 8]],
    shelf: [[30, 9], [31, 9], [32, 9], [33, 9]]   /* a kitchen shelf across the first 4-pit */
  },
  /* nothing waits on an island between two pits */
  foes: [[11, 11, 'wetsign'], [19, 9, 'waiter'],
         [44, 11, 'cart'], [51, 11, 'mallwalker']],
  candles: [[1, 11], [2, 11], [5, 10], [6, 9], [7, 8], [8, 9], [9, 10], [15, 9], [16, 8], [21, 8], [22, 9],
            [29, 10], [30, 8], [31, 8], [32, 8], [33, 8], [34, 10], [38, 10], [39, 9], [40, 8], [41, 8], [42, 9], [43, 10],
            [46, 9], [47, 9], [48, 9], [52, 11], [53, 11],
            [58, 10], [59, 9], [60, 8], [61, 7], [62, 8], [63, 9], [64, 10],
            [68, 10], [69, 9], [70, 8], [71, 8], [72, 9], [73, 10], [77, 11],
            [108, 11], [109, 11], [111, 11], [114, 11]],
  arena: { col: 82, cols: 24, boss: 'chenoa' },   /* 3 phases (the default); its checkpoint flag stands at c78 */
  spawn: { col: 2, row: 11 },
  pet: { id: 'cat3', col: 54, row: 11 },  /* Duchess, rescued at the restaurant: her crate on the kitchen floor before the last gap, on the way */
  goal: { col: 112, row: 11 }
});

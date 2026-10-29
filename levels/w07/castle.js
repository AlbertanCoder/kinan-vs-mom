/* ============================================================
   CASTLE · THE BIG STORM AT CANADA PLACE  (World 7 · Vancouver · stop 11)
   Story bible (World 7): the tour bus brought Glitchy over the mountains
   to Vancouver, where he woke DRIZZLE, a lonely storm cloud who rains on
   everything. Drizzle isn't angry: nobody ever stays to talk to a rain
   cloud. Kinan turns the rain into flowers and rainbows, Drizzle stops
   crying, becomes a friend and clears the sky. Then Glitchy hides in a
   parcel on a cargo plane to Toronto (World 8).
   Route (the same shape and length as 6-castle): S1 the rainy promenade
     at Coal Harbour (a popper in the first gift, a 3-wide gap of harbour
     water between two piers, a puddle frog, THE CRUISE-SHIP TERMINAL
     ROOF: a raised deck (2:1 up, a 6-tile top, 2:1 down) with its white
     sail peaks as a ledge and an umbrella gift over them, a 7-tile
     runway off it) · S2 the floating docks (two 4-wide gaps with a
     5-tile dock between, a gangway as a ledge over the second, a seagull)
     and the promenade with THE FLAG POLES (two poles, 2 tiles tall: hop
     over or stand on them) · S3 the pier to the sails (a 5-wide gap after
     a 9-tile runway, a 6-tile gangway, a 5-wide gap, a heart in a brick
     shelf, the checkpoint right before the gate) · the ARENA: the end of
     the pier under the white sails, 24 tiles of floor, framed on one
     screen.
   Story bubbles (talk): Big Bro (Shad) on the radio, Kinan, Mom, Dad,
     Chenoa and Drizzle's sad lines. Subtitles only: no recordings.
   The fight (index.html ARENA_KINDS.drizzle, 3 phases, one sun lamp per
   phase): Drizzle floats over the harbour crying; nobody gets hurt and
   Kinan never stomps it (a soft cloud: it only bounces him). Every phase
   ends with a rest window: Drizzle closes its eyes and sniffles, and the
   next SUN LAMP on the pier glows with a gold arrow: walk into it to
   switch it on. Three lamps (arena columns 4, 19, 12), one per phase.
     1 (dumb)     RAIN LANES: drips mark each lane for the whole wind-up,
                  then it pours (stand between the lanes); big raindrops
                  on shadows
     2 (smarter)  FAKES a downpour (the real one starts with a STOMP);
                  new: UMBRELLA GUSTS push Kinan back while a puddle wave
                  rolls (an umbrella floats down: it keeps him steady and
                  he floats if he holds JUMP); flowers grow where the rain
                  lands now that a lamp shines
     3 (smartest) aims where Kinan is GOING; new: WARNED LIGHTNING, three
                  flashing targets on the floor for the whole wind-up
                  (0.6 s or more), then the bolts strike one by one
   Tells 50 / 40 / 36 frames (Robo-Rex 52 / 42 / 36; 36 is the 0.6 s
   floor), shorter rests than Robo-Rex. Glitchy still offers his help
   after 5 lost fights.
   The third lamp is the rainbow: Drizzle stops crying ("I made a
   RAINBOW?"), Kinan stays to talk, the clouds roll away and the sun comes
   out over the harbour; the gates fall and the goal is a few steps on.
   Beating it opens World 7's exit on the map: Glitchy climbs into a
   parcel on a cargo plane flying east (World 8: coming soon).
   Gaps (thirds of the platforming before the gate, cols 0-80): act 1 3
     · act 2 4, 4 · act 3 5, 5. Castle slot: exempt from secrets.
   Look: borrows the Big Storm (theme 50): dark clouds rolling over the
     city towers and heavy rain; once Drizzle is a friend the sun breaks
     through and a rainbow arcs over the towers.
   ============================================================ */
KinanLevels.register({
  id: '7-castle', world: 7, slot: 11, kind: 'castle',
  name: 'THE BIG STORM AT CANADA PLACE',
  theme: 50,                /* the Big Storm: dark clouds over the city towers, heavy rain; sunny with a rainbow when Drizzle is befriended */
  cols: 117,
  heights: [
    /* S1 0-26 the rainy promenade: harbour water c5-7 (3) · THE CRUISE-SHIP TERMINAL ROOF (a raised deck c13-22: 2:1 up, a
       6-tile top, 2:1 down) · a 7-tile runway (c23-29: a full-run jump off the roof lands on it) */
    192,192,192,192,192, null,null,null, 192,192,192,192,192, 184,176, 176,176,176,176,176,176, 184,192, 192,192,192,192,
    /* S2 27-53 the floating docks: 4-wide c30-33 · a 5-tile dock · 4-wide c39-42 (a gangway over it) · the promenade with THE FLAG POLES (c45, c49) */
    192,192,192, null,null,null,null, 192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 the pier to the sails: a 9-tile runway (c50-57) · 5-wide c58-62 · a 6-tile gangway · 5-wide c69-73 · the checkpoint (c78) */
    192,192,192,192, null,null,null,null,null, 192,192,192,192,192,192, null,null,null,null,null, 192,192,192,192,192,192,192,
    /* 81-106 THE END OF THE PIER under the white sails: the gate (c81), 24 tiles of floor (c82-105), the boss door (c106) · 107-116 the way out */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [45, 10, 45, 11],                       /* a flag pole (2 tall): hop over it or stand on it */
    [49, 10, 49, 11]                        /* another flag pole */
  ],
  tiles: {
    gift: [[3, 8, 'popper'], [18, 5, 'umbrella'], [36, 8], [75, 8, 'heart'], [109, 7, 'cake']],   /* the umbrella: float down off the roof; the cake on the way out */
    brick: [[74, 8], [76, 8]],
    shelf: [[16, 8], [17, 8], [18, 8], [19, 8],   /* the terminal roof's white sail peaks */
            [39, 8], [40, 8], [41, 8], [42, 8]]   /* a gangway over the second gap */
  },
  /* nothing waits at a gap's lip or on a dock between two gaps; the seagulls and the umbrella bat fly high */
  foes: [[10, 11, 'puddlefrog'],
         [36, 4, 'seagull'], [51, 11, 'raccoon'],
         [56, 5, 'umbrellabat'], [66, 4, 'seagull']],
  candles: [[1, 11], [2, 11], [4, 10], [5, 9], [6, 8], [7, 9], [8, 10], [14, 9], [15, 9], [16, 7], [17, 7], [19, 7], [21, 9],
            [24, 11], [25, 11], [29, 10], [30, 9], [31, 8], [32, 8], [33, 9], [34, 10], [38, 10], [39, 7], [40, 7], [41, 7], [42, 7], [43, 10],
            [45, 9], [49, 9], [54, 11],
            [57, 10], [58, 9], [59, 8], [60, 7], [61, 8], [62, 9], [63, 10],
            [68, 10], [69, 9], [70, 8], [71, 7], [72, 8], [73, 9], [74, 10], [77, 11],
            [108, 11], [110, 11], [111, 11], [113, 11], [114, 11]],   /* the way out, in the sunshine */
  /* story bubbles as Kinan passes a column: [col, who, what they say, seconds] (subtitles only) */
  talk: [
    [1, 'SHAD', "Kinan, it's Shad on the radio. That storm over Canada Place isn't a normal storm. It's Drizzle, and it's HUGE now!", 5],
    [9, 'KINAN', 'It is raining SO hard. Even the bats have umbrellas!', 3.2],
    [13, 'DAD', 'The cruise-ship terminal roof! Up you go, bud. It looks like big white sails.', 4],
    [24, 'DRIZZLE', '*sniff*... Everybody always runs inside when I come. *sniff*', 3.4],
    [35, 'SHAD', 'Glitchy woke Drizzle up, and now it rains on everything. I found three old sun lamps at the end of the pier.', 5],
    [44, 'CHENOA', 'Look at the flags! They are flapping like crazy in the wind.', 3.2],
    [51, 'KINAN', "Drizzle isn't being mean. I think Drizzle is lonely. Nobody ever stays to talk to a rain cloud.", 4.6],
    [64, 'SHAD', 'When Drizzle stops to rest, switch on a sun lamp. Sunshine plus rain makes...', 4],
    [71, 'MOM', 'Rainbows! Go show Drizzle, sweetie. And be careful on the wet pier!', 3.6]
  ],
  arena: { col: 82, cols: 24, boss: 'drizzle' },   /* 3 phases (the default), one sun lamp each; its checkpoint flag stands at c78 */
  spawn: { col: 2, row: 11 },
  goal: { col: 112, row: 11 }
});

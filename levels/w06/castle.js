/* ============================================================
   CASTLE · ROBO-REX RUNS WILD  (World 6 · Drumheller · stop 11)
   Story bible (World 6): Glitchy's tumbleweed rolls into the badlands
   and he hides inside the dinosaur museum's giant robot T-Rex. Robo-Rex
   stomps out into town. Shad works out that it isn't attacking, it's
   running on scrambled wires, and Kinan learns to FIX a problem instead
   of fighting it. No one new joins; Shad's building skills shine, and
   Robo-Rex, once fixed, gives Kinan a ride.
   Route (the same shape and length as 5-castle, a step harder): S1 the
     front lobby at night (a popper in the first gift, a 3-pit dig in
     the floor, a toy robot from the gift shop, THE T-REX SKELETON: a
     raised exhibit (2:1 up, a 6-tile top, 2:1 down) with its ribs as a
     ledge and a gift over them, a 7-tile runway off it) · S2 the fossil
     hall (two 4-pits with a 5-tile island, a skeleton's spine as a ledge
     over the second pit, a display plinth, a baby dino, a security
     camera) · S3 the dinosaur hall (a 5-pit after a 9-tile runway, a
     6-tile island, a 5-pit, a heart in a brick shelf, the checkpoint
     right before the gate) · the ARENA: the museum's big hall, 24 tiles
     of floor, framed on one screen.
   Story bubbles (talk): Shad on the radio works out the scrambled
     wires, Kinan's lines, Robo-Rex's growls from the far hall. Subtitles
     only: no recordings.
   The fight (index.html ARENA_KINDS['robo-rex'], 3 phases, one wire per
   phase): FIX HIM, DON'T FIGHT HIM. Every phase ends with a rest window
   where he cools down and a loose wire stands up glowing on his back:
   land on his back (or drop onto it from Shad's platforms) to plug it in.
     1 (dumb)     STOMP: a shockwave runs out both ways along the floor
                  (jump it), his TAIL sweeps low round him (a red band on
                  the floor shows its reach: stay outside), another stomp
     2 (smarter)  FAKES a stomp (the real one starts with a STOMP); new:
                  his ROAR pushes Kinan back while a loose gear rolls,
                  four replica bones shake off the exhibits onto shadows;
                  Shad builds two platforms (the shockwaves pass under)
     3 (smartest) aims where Kinan is GOING; five bones, two stomps, the
                  tail, the roar, then he CHARGES across the hall and
                  crashes into the far gate: dizzy, the last wire
   Tells 52 / 42 / 36 frames (Bronco 54 / 44 / 38), never under 0.6 s;
   shorter rests and the longest patterns of any boss yet. Glitchy still
   offers his help after 5 lost fights.
   Fixed: Robo-Rex's eyes go from red to green and he purrs · Shad: "All
   three wires! You didn't fight it, Kinan. You fixed it." · Kinan:
   "Robo-Rex is my friend now! Can I ride him?" Once the gates are down
   he walks over and Kinan rides on his back out to the goal (jump to
   hop off). Beating him opens World 6's exit on the map: Glitchy jumps
   on a tour bus heading west through the mountains (World 7).
   Gaps (thirds of the platforming before the gate, cols 0-80): act 1 3
     · act 2 4, 4 · act 3 5, 5. Castle slot: exempt from secrets.
   ============================================================ */
KinanLevels.register({
  id: '6-castle', world: 6, slot: 11, kind: 'castle',
  name: 'ROBO-REX RUNS WILD',
  theme: 47,                /* borrows the Science Dome: a dim blue hall, grey floors: the dinosaur museum after dark */
  cols: 117,
  heights: [
    /* S1 0-26 the front lobby: 3-pit c5-7 · THE T-REX SKELETON (a raised exhibit c13-22: 2:1 up, a 6-tile top, 2:1 down)
       · a 7-tile runway (c23-29: a full-run jump off the exhibit lands on it) */
    192,192,192,192,192, null,null,null, 192,192,192,192,192, 184,176, 176,176,176,176,176,176, 184,192, 192,192,192,192,
    /* S2 27-53 the fossil hall: 4-pit c30-33 · a 5-tile island · 4-pit c39-42 (a spine ledge over it) · an 11-tile floor with a display plinth */
    192,192,192, null,null,null,null, 192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192,192,192,192,192,
    /* S3 54-80 the dinosaur hall: a 9-tile runway (c49-57) · 5-pit c58-62 · a 6-tile island · 5-pit c69-73 · the checkpoint (c78) */
    192,192,192,192, null,null,null,null,null, 192,192,192,192,192,192, null,null,null,null,null, 192,192,192,192,192,192,192,
    /* 81-106 THE BIG HALL: the gate (c81), 24 tiles of floor (c82-105), the boss door (c106) · 107-116 the way out (Robo-Rex's ride) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [47, 10, 48, 11]                        /* a display plinth (2 tall): over it or onto it */
  ],
  tiles: {
    gift: [[3, 8, 'popper'], [18, 5], [36, 8], [75, 8, 'heart'], [109, 7, 'cake']],   /* the cake: the gift shop's dino cookies on the way out, high enough to ride under */
    brick: [[74, 8], [76, 8]],
    shelf: [[16, 8], [17, 8], [18, 8], [19, 8],   /* the T-Rex skeleton's ribs */
            [39, 8], [40, 8], [41, 8], [42, 8]]   /* a long-neck's spine over the second pit */
  },
  /* nothing waits at a pit's lip or on an island between two pits; the cameras drift high */
  foes: [[10, 11, 'robot'],
         [36, 4, 'camera'], [51, 11, 'babydino'],
         [56, 5, 'camera'], [66, 4, 'camera']],
  candles: [[1, 11], [2, 11], [4, 10], [5, 9], [6, 8], [7, 9], [8, 10], [14, 9], [15, 9], [16, 7], [17, 7], [19, 7], [21, 9],
            [24, 11], [25, 11], [29, 10], [30, 9], [31, 8], [32, 8], [33, 9], [34, 10], [38, 10], [39, 7], [40, 7], [41, 7], [42, 7], [43, 10],
            [47, 9], [48, 9], [52, 11], [54, 11],
            [57, 10], [58, 9], [59, 8], [60, 7], [61, 8], [62, 9], [63, 10],
            [68, 10], [69, 9], [70, 8], [71, 7], [72, 8], [73, 9], [74, 10], [77, 11],
            [108, 9], [110, 9], [111, 9], [113, 9], [114, 9]],   /* the way out: high enough to scoop up from Robo-Rex's back */
  /* story bubbles as Kinan passes a column: [col, who, what they say, seconds] (subtitles only) */
  talk: [
    [1, 'SHAD', "Kinan, it's Shad on the radio. Glitchy crawled inside the museum's robot T-Rex, and now it's stomping around!", 5],
    [9, 'KINAN', "It's so dark in here. Are the dinosaur skeletons looking at me?", 3.4],
    [24, 'ROBO-REX', 'GRRZZZT... RAWR? (A roar echoes from the far hall.)', 3],
    [35, 'SHAD', "I'm reading his signal. Three wires came loose when Glitchy crawled in: red, yellow and blue.", 5],
    [50, 'KINAN', "So he's not mean. He's just broken. Like my remote-control car when its wires came loose!", 4],
    [64, 'SHAD', "Exactly! Don't fight him, fix him. When he stops to cool down, plug a wire back in.", 4.4],
    [71, 'ROBO-REX', 'STOMP... STOMP... BZZT! (The whole floor shakes.)', 2.6]
  ],
  arena: { col: 82, cols: 24, boss: 'robo-rex' },   /* 3 phases (the default), one wire each; its checkpoint flag stands at c78 */
  spawn: { col: 2, row: 11 },
  goal: { col: 112, row: 11 }
});

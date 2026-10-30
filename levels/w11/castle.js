/* ============================================================
   CASTLE · GLITCHY'S LAST STAND  (World 11 · Inside the Console · stop 11)
   Story bible (World 11): deep inside Shad's console, at its glowing core,
   Glitchy makes his last stand. Annie reads his code and finds the truth:
   he has been running because he thinks he is BROKEN and that broken
   things get DELETED. The whole team is here, Mom included.
   Route (the same shape and length as 9-castle): S1 THE POWER HALL (a
     popper in the first gift, a 3-wide hole where the floor tiles are
     glitched away, THE BOOT RISER: a raised block (2:1 up, a 7-tile top,
     2:1 down) with a light rail as a ledge and a gift over it, a 9-tile
     runway off it) · S2 THE MEMORY LANES (under a low bundle of cables: 6
     tiles of air under it, so no jump is cut short; two 4-wide gaps with
     a 5-tile floor between, a data crate 2 tiles tall to hop) · S3 THE CPU
     STACKS (2:1 steps up, a 6-tile catwalk, a 5-wide jump to the second
     catwalk, steps down) · the CHECKPOINT (c88) · THE DOORWAY (c88-95, a
     heart before the gate) · the ARENA: the heart chamber, 24 tiles of
     floor, framed on one screen.
   Story bubbles (talk): Kinan, Annie (reading his code), Mom, Shad, Dad,
     Chenoa. Subtitles only: no recordings (docs/VOICE-TODO-W11.md).
   The fight (index.html ARENA_KINDS['glitchy-last'], 3 phases, the
   hardest in the game and still fair): first, Sabumnim's black belt by
   video call, the whole team watching (beltBlackScene, once). Then
   Glitchy's panic borrows ONE move from every boss Kinan has faced, in
   world order, one at a time, each with its label and its own "!" tell:
     1  Worlds 1-4: Mom's socks, the gnome, the bells, the megaphone, the
        mud clods, Chenoa's pound, the whistle, the goalie's dive
     2  Worlds 5-8: the prize balls, the magpies, Robo-Rex's tail, the slug
        roll, Drizzle's lanes, the tentacles, the bins, Bronco's charge
     3  Worlds 9-11: the drone dive, the firewall beams, Grandma's
        spinning cane, Mom's laundry basket, the brick shower, the drone
        patrol, the echo stomp, the glowing footsteps, the pixel sparks
   Tells 46 / 38 / 36 frames (36 is the 0.6 s floor). In every rest his
   scattered pixels glow and drift: Kinan catches them (3, 4, 5); the last
   hit is a HUG. Never a stomp; the KICK never touches him. After each
   lost try a different family member gives a tip about the move that got
   him (Mom, Dad, Chenoa, Shad, Annie); after 5 lost tries an extra heart
   for the rest of the fight. No game over.
   The hug: Glitchy, calm at last: "Th... thank... you." He joins the
   team. Then LEVEL CLEAR and the ending (index.html block "THE ENDING"):
   the game's name becomes "Kinan vs. Worlds", the 3D cutscene, World 12's
   teaser, TO BE CONTINUED, the credits.
   Gaps (thirds of the platforming before the gate, cols 0-94): act 1 3
     · act 2 4, 4 · act 3 5. Castle slot: exempt from secrets.
   ============================================================ */
KinanLevels.register({
  id: '11-castle', world: 11, slot: 11, kind: 'castle',
  name: "GLITCHY'S LAST STAND",
  theme: 140,               /* Glitchy's core (World 11's own look): a violet void, the map's stepped tower of glitch blocks with the core glowing on top */
  cols: 131,
  heights: [
    /* S1 0-31 THE POWER HALL: a glitched hole c5-7 (3) · THE BOOT RISER (c13-22: 2:1 up, a 7-tile top, 2:1 down) ·
       a 9-tile runway (c23-31) */
    192,192,192,192,192, null,null,null, 192,192,192,192,192, 184,176, 176,176,176,176,176,176, 184,192, 192,192,192,192,192,192,192,192,192,
    /* S2 32-61 THE MEMORY LANES (the cable bundle c33-60): 4-wide c32-35 · a 5-tile floor · 4-wide c41-44 · the
       memory banks, the data crate (c55) */
    null,null,null,null, 192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 62-87 THE CPU STACKS: a runway (c62-65), 2:1 steps up (c66-68), the first catwalk (c69-74), 5-wide c75-79,
       the second catwalk (c80-83), 2:1 steps down (c84-86) */
    192,192,192,192, 184,176,168, 160,160,160,160,160,160, null,null,null,null,null, 160,160,160,160, 168,176,184, 192,
    /* 88-95 THE DOORWAY: the checkpoint (c88), a heart before the gate (c95) */
    192,192,192,192,192,192,192,192,
    /* 96-119 THE HEART CHAMBER (the arena: 24 tiles of floor; the boss door c120) · 121-130 the way out */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [33, 4, 60, 5],                         /* S2 the bundle of cables (6 tiles of air under it) */
    [55, 10, 55, 11]                        /* the data crate (2 tall): hop over it or stand on it */
  ],
  skins: [['glitchy', 33, 4, 60, 5], ['chip', 55, 10, 55, 11]],
  tiles: {
    gift: [[3, 8, 'popper'], [18, 5], [37, 8], [51, 8], [64, 8], [93, 8, 'heart'], [124, 7, 'cake']],   /* the cake on the way out */
    brick: [[63, 8], [65, 8]],
    shelf: [[16, 8], [17, 8], [18, 8], [19, 8]]   /* the light rail over the boot riser */
  },
  /* nothing waits at a gap's lip or on the floor between two gaps; the deleter flies high over the catwalk gap */
  foes: [[10, 11, 'robot'], [26, 11, 'roomba'],
         [49, 11, 'robot'], [58, 11, 'roomba'],
         [63, 11, 'roomba'], [77, 4, 'deleter']],
  candles: [[1, 11], [2, 11], [4, 10], [5, 9], [6, 8], [7, 9], [8, 10], [12, 11], [14, 9], [15, 9], [16, 7], [17, 7], [19, 7], [21, 9],
            [24, 11], [25, 11], [28, 11], [29, 11], [30, 10], [31, 9], [32, 8], [33, 8], [34, 8], [35, 9], [36, 10],
            [38, 11], [40, 10], [41, 9], [42, 8], [43, 8], [44, 9], [45, 10], [47, 11], [53, 11], [55, 9], [60, 11],
            [62, 11], [66, 10], [67, 10], [69, 9], [71, 9], [73, 9], [74, 8], [75, 7], [76, 6], [77, 6], [78, 7], [79, 8], [81, 9], [82, 9], [85, 10],
            [89, 11], [91, 11], [92, 11], [94, 11],
            [122, 11], [123, 11], [125, 11], [127, 11], [128, 11]],   /* the way out */
  /* story bubbles as Kinan passes a column: [col, who, what they say, seconds] (subtitles only) */
  talk: [
    [1, 'KINAN', "Glitchy's core. Every light in here is flickering... like the whole console is scared.", 4],
    [9, 'ANNIE', "Wait. I'm reading his code. There's one line, over and over: BROKEN. DELETE. BROKEN. DELETE.", 4.8],
    [14, 'MOM', "Oh, sweetie. He thinks he's broken? Nobody in this family gets thrown away.", 4],
    [27, 'SHAD', "Bud, I made him as a test sprite and never finished him. I'd never delete him... but he didn't know that.", 5],
    [33, 'DAD', "Then let's go tell him in person. Mind the cables, bud. Low bridge.", 3.4],
    [46, 'CHENOA', "Little bro, whatever's at the end of this, we're right behind you. All of us.", 4],
    [53, 'ANNIE', "His panic is pulling in every boss you ever met: every move, one at a time. You know them all, Kinan.", 4.8],
    [63, 'KINAN', "Up the CPU stacks. Hang on, Glitchy. I'm almost there.", 3.2],
    [72, 'MOM', "Big jump between the stacks, sweetie. Take a running start. I'm watching.", 3.8],
    [89, 'SHAD', "Bud, before you go in... someone's calling. He wants to see you first.", 3.8]
  ],
  arena: { col: 96, cols: 24, boss: 'glitchy-last', checkpoint: { col: 88, row: 11 } },   /* 3 phases (the default); the black belt scene first */
  spawn: { col: 2, row: 11 },
  goal: { col: 126, row: 11 }
});

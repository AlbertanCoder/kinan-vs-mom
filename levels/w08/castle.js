/* ============================================================
   CASTLE · CASA LOMA  (World 8 · Toronto · stop 11)
   Story bible (World 8): Toronto's raccoons grabbed Glitchy, thinking
   he was shiny garbage, and carried him up to Casa Loma, the castle on
   the hill. The raccoons aren't villains: their leader, the RACCOON
   KING, just collects shiny things. Kinan trades him a shiny bottle cap
   for Glitchy and makes a friend. Then Glitchy hides in a hockey bag on
   the train to Montreal (World 9).
   Route (the same shape as 7-castle, plus the treasure room): S1 THE
     GREAT HALL (a popper in the first gift, a 3-wide hole in the old
     floorboards, a raccoon, THE GRAND STAIRCASE: a raised dais (2:1 up,
     a 7-tile top, 2:1 down) with the minstrels' gallery rail as a ledge
     and a gift over it, a 9-tile runway off it) · S2 THE SECRET PASSAGE
     (behind the bookcase: a stone roof with 6 tiles of air under it, so
     no jump is cut short; two 4-wide gaps with a 5-tile floor between,
     an old bookcase 2 tiles tall to hop) · S3 THE TOWERS (2:1 stairs up
     the west tower, a 6-tile top, a 5-wide jump over the courtyard to the
     east tower, stairs down) · the CHECKPOINT (c88) · THE TREASURE ROOM
     (c88-95: the Raccoon King's treasure pile, where Kinan finds his
     moving-day box: the memory gift) · the ARENA: the conservatory under
     the glass dome, 24 tiles of floor, framed on one screen.
   Memory (story bible, age 8): the moving-day box with the Pocket
     Critter dino card, in the Raccoon King's treasure pile. It's the
     year Kinan moved to Saskatoon (Kinan's story bubble at c90).
   Story bubbles (talk): Big Bro (Shad) on the radio, Kinan, Mom, Dad,
     Chenoa and the Raccoon King. Subtitles only: no recordings.
   The fight (index.html ARENA_KINDS['raccoon-king'], 3 phases, a little
   harder than Drizzle): nobody gets hurt and Kinan never stomps him. In
   every rest window the King sits down to count his treasure and a SHINY
   BOTTLE CAP rolls out of it, glinting a few steps from him on Kinan's
   side (on the floor in phase 1, floating a jump up after that): Kinan
   grabs it and offers it (touches the King with it). A cap he picked up
   stays his until he offers it.
     1 (dumb)     SNATCHING PAWS: big paws reach down from above onto
                  shadows (the first on Kinan) and grab a candle if they
                  catch him (all given back at the trade); apple cores
     2 (smarter)  ROLLING BINS (green bins roll across: jump them), fakes,
                  two little raccoons sneak in to snatch candles
     3 (smartest) THE TRADE: he grabs where Kinan is GOING, three paws at
                  a time, then belly-slides across the floor (jump him)
   Tells 48 / 38 / 36 frames (Drizzle 50 / 40 / 36; 36 is the 0.6 s
   floor). Glitchy still offers his help after 5 lost fights. The KICK
   never touches him (bosses are befriended, never beaten up).
   The third cap is the trade: the King swaps the shiny green box
   (Glitchy) for his shiny treasure and becomes a friend; the gates fall
   and the goal is a few steps on. Beating it opens World 8's exit on the
   map: Glitchy zips himself into a hockey bag that is loaded onto the
   train east to Montreal (World 9: coming soon).
   Gaps (thirds of the platforming before the gate, cols 0-94): act 1 3
     · act 2 4, 4 · act 3 5. Castle slot: exempt from secrets.
   Raccoons (World 8, snatch): a raccoon grabs a candle and runs.
   ============================================================ */
KinanLevels.register({
  id: '8-castle', world: 8, slot: 11, kind: 'castle',
  name: 'CASA LOMA',
  theme: 109,               /* Casa Loma (World 8's own look): the castle's stone towers on its hill at evening, the green copper cone, warm windows, the King's flag */
  cols: 131,
  snatch: true,             /* World 8: raccoons grab a candle and run */
  heights: [
    /* S1 0-31 THE GREAT HALL: a hole in the floorboards c5-7 (3) · THE GRAND STAIRCASE (a raised dais c13-22: 2:1 up, a
       7-tile top, 2:1 down) · a 9-tile runway (c23-31) */
    192,192,192,192,192, null,null,null, 192,192,192,192,192, 184,176, 176,176,176,176,176,176, 184,192, 192,192,192,192,192,192,192,192,192,
    /* S2 32-61 THE SECRET PASSAGE (roof c33-60): 4-wide c32-35 · a 5-tile floor · 4-wide c41-44 · the passage on to the
       towers, the old bookcase (c55) */
    null,null,null,null, 192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 62-87 THE TOWERS: a runway (c62-65), 2:1 stairs up (c66-68), the west tower top (c69-74), 5-wide over the
       courtyard c75-79, the east tower top (c80-83), 2:1 stairs down (c84-86) */
    192,192,192,192, 184,176,168, 160,160,160,160,160,160, null,null,null,null,null, 160,160,160,160, 168,176,184, 192,
    /* 88-95 THE TREASURE ROOM: the checkpoint (c88), the treasure pile (the memory gift, c90), a heart before the gate (c95) */
    192,192,192,192,192,192,192,192,
    /* 96-119 THE CONSERVATORY (the arena: 24 tiles of floor; the boss door c120) · 121-130 the way out */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [33, 4, 60, 5],                         /* S2 THE SECRET PASSAGE's stone roof (6 tiles of air under it) */
    [55, 10, 55, 11]                        /* the old bookcase (2 tall): hop over it or stand on it */
  ],
  tiles: {
    gift: [[3, 8, 'popper'], [18, 5], [37, 8], [51, 8], [64, 8], [93, 8, 'heart'], [124, 7, 'cake']],   /* the cake on the way out */
    brick: [[63, 8], [65, 8]],
    shelf: [[16, 8], [17, 8], [18, 8], [19, 8]]   /* the minstrels' gallery rail over the grand staircase */
  },
  /* nothing waits at a gap's lip or on the floor between two gaps; the crow flies high over the courtyard */
  foes: [[10, 11, 'raccoon'], [26, 11, 'mallwalker'],
         [49, 11, 'raccoon'], [58, 11, 'squirrel'],
         [63, 11, 'raccoon'], [77, 4, 'crow']],
  candles: [[1, 11], [2, 11], [4, 10], [5, 9], [6, 8], [7, 9], [8, 10], [12, 11], [14, 9], [15, 9], [16, 7], [17, 7], [19, 7], [21, 9],
            [24, 11], [25, 11], [28, 11], [29, 11], [30, 10], [31, 9], [32, 8], [33, 8], [34, 8], [35, 9], [36, 10],
            [38, 11], [40, 10], [41, 9], [42, 8], [43, 8], [44, 9], [45, 10], [47, 11], [53, 11], [55, 9], [60, 11],
            [62, 11], [66, 10], [67, 10], [69, 9], [71, 9], [73, 9], [74, 8], [75, 7], [76, 6], [77, 6], [78, 7], [79, 8], [81, 9], [82, 9], [85, 10],
            [89, 11], [91, 11], [92, 11], [94, 11],
            [122, 11], [123, 11], [125, 11], [127, 11], [128, 11]],   /* the way out */
  /* story bubbles as Kinan passes a column: [col, who, what they say, seconds] (subtitles only) */
  talk: [
    [1, 'SHAD', "Kinan, it's Shad on the radio. This is Casa Loma, a real castle right in Toronto! The raccoons took Glitchy in here.", 5],
    [9, 'KINAN', 'A real castle, with towers and everything! Hang on, Glitchy. I am coming!', 3.6],
    [14, 'MOM', 'The great hall! Look at that ceiling, sweetie. Up the grand staircase you go!', 3.8],
    [27, 'THE RACCOON KING', 'Who goes there? This is the castle of the RACCOON KING! All the shiny things are MINE!', 4.4],
    [33, 'KINAN', 'A secret passage behind the bookcase! This castle is SO cool.', 3.2],
    [46, 'SHAD', "The Raccoon King collects shiny things. He thinks Glitchy is shiny garbage!", 4],
    [53, 'DAD', 'Hop over that old bookcase, bud, and watch your head in this passage. This castle has great shelf-esteem.', 3.6],
    [63, 'CHENOA', 'The towers! You can see all of Toronto from up there. Even the CN Tower!', 3.8],
    [72, 'KINAN', "A big jump to the other tower. Don't look down... okay, I looked down.", 4],
    [90, 'KINAN', "His treasure pile... wait, that's my MOVING-DAY BOX! With my Pocket Critter dino card! I held it the whole drive to Saskatoon.", 6]   /* the age-8 memory (story bible) */
  ],
  arena: { col: 96, cols: 24, boss: 'raccoon-king', checkpoint: { col: 88, row: 11 } },   /* 3 phases (the default), one bottle cap each */
  spawn: { col: 2, row: 11 },
  goal: { col: 126, row: 11 }
});

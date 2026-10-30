/* ============================================================
   CASTLE · ANNIE'S FIREWALL  (World 9 · Montreal · stop 11)
   Story bible (World 9): Annie (Big Bro Shad's girlfriend) is at a huge
   tech conference. From where she stands Glitchy is rogue code wrecking
   a city every day: she isn't mean, she's protecting people. She builds
   a firewall to trap him and deletion drones to wipe him out, so Kinan
   has to protect the very thing he's been chasing.
   Route (the same shape and length as 8-castle): S1 THE REGISTRATION
     HALL (a popper in the first gift, a 3-wide hole where the carpet
     tiles are up, THE KEYNOTE RISER: a raised platform (2:1 up, a 7-tile
     top, 2:1 down) with a lighting rail as a ledge and a gift over it, a
     9-tile runway off it) · S2 THE ROBOT DEMO BOOTHS (under the low
     booth ceiling: 6 tiles of air under it, so no jump is cut short; two
     4-wide gaps with a 5-tile floor between, a road case 2 tiles tall to
     hop) · S3 BACKSTAGE (2:1 steps up the scaffold, a 6-tile catwalk, a
     5-wide jump to the second catwalk, steps down) · the CHECKPOINT
     (c88) · THE WINGS (c88-95, a heart before the gate) · the ARENA: the
     main stage, 24 tiles of floor, framed on one screen.
   Story bubbles (talk): Big Bro (Shad) on the radio, Kinan, Mom, Dad,
     Chenoa, and Annie over the speakers. Subtitles only: no recordings.
   The fight (index.html ARENA_KINDS.firewall, 3 phases, a little harder
   than the Raccoon King): Annie stands on her raised booth with her
   tablet (never hit, never hurt); Glitchy is trapped in a glowing
   containment cube centre stage. In every rest window a LOGIC LOCK on
   the cube glows: Kinan touches it to crack it (never a stomp).
     1 (dumb)     DELETION DRONES swoop onto shadows (each shows "!" and a
                  shadow first); data bits rain on the flashing spots
     2 (smarter)  REROUTE THE CIRCUITS: the firewall walls close in from
                  both gates; step on the glowing circuit pads in the
                  order the arrows show to send the power away
     3 (smartest) the drones aim where Kinan is GOING and fake a dive,
                  deletion beams strike the flashing spots, more reroutes
   Tells 46 / 37 / 36 frames (the Raccoon King 48 / 38 / 36; 36 is the
   0.6 s floor). Glitchy's help still comes after 5 lost fights. The
   KICK never touches the cube or Annie.
   The third lock opens the cube. THE TURNING POINT: Glitchy hides behind
   Kinan, shaking, and shows Annie the trail of memory gifts he's been
   leaving; Annie lowers her tablet ("Okay. I was wrong about you,
   little guy.") and joins the team. Then LEVEL CLEAR, and World 9's exit
   opens on the map: Glitchy bolts onto a tour boat heading for Niagara
   Falls, and Annie is the first to run after him (World 10: coming soon).
   Gaps (thirds of the platforming before the gate, cols 0-94): act 1 3
     · act 2 4, 4 · act 3 5. Castle slot: exempt from secrets.
   ============================================================ */
KinanLevels.register({
  id: '9-castle', world: 9, slot: 11, kind: 'castle',
  name: "ANNIE'S FIREWALL",
  theme: 120,               /* the tech conference's main stage (World 9's own look): curtains, a lighting truss, the giant screen, the seats in the dark */
  cols: 131,
  heights: [
    /* S1 0-31 THE REGISTRATION HALL: a hole where the carpet tiles are up c5-7 (3) · THE KEYNOTE RISER (c13-22: 2:1 up, a
       7-tile top, 2:1 down) · a 9-tile runway (c23-31) */
    192,192,192,192,192, null,null,null, 192,192,192,192,192, 184,176, 176,176,176,176,176,176, 184,192, 192,192,192,192,192,192,192,192,192,
    /* S2 32-61 THE ROBOT DEMO BOOTHS (the booth ceiling c33-60): 4-wide c32-35 · a 5-tile floor · 4-wide c41-44 · the
       booths, the road case (c55) */
    null,null,null,null, 192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S3 62-87 BACKSTAGE: a runway (c62-65), 2:1 steps up the scaffold (c66-68), the first catwalk (c69-74), 5-wide
       c75-79, the second catwalk (c80-83), 2:1 steps down (c84-86) */
    192,192,192,192, 184,176,168, 160,160,160,160,160,160, null,null,null,null,null, 160,160,160,160, 168,176,184, 192,
    /* 88-95 THE WINGS: the checkpoint (c88), a heart before the gate (c95) */
    192,192,192,192,192,192,192,192,
    /* 96-119 THE MAIN STAGE (the arena: 24 tiles of floor; the boss door c120) · 121-130 the way out */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [33, 4, 60, 5],                         /* S2 the robot demo booths' low ceiling (6 tiles of air under it) */
    [55, 10, 55, 11]                        /* the road case (2 tall): hop over it or stand on it */
  ],
  tiles: {
    gift: [[3, 8, 'popper'], [18, 5], [37, 8], [51, 8], [64, 8], [93, 8, 'heart'], [124, 7, 'cake']],   /* the cake on the way out */
    brick: [[63, 8], [65, 8]],
    shelf: [[16, 8], [17, 8], [18, 8], [19, 8]]   /* the lighting rail over the keynote riser */
  },
  /* nothing waits at a gap's lip or on the floor between two gaps; the scanner drone flies high over the catwalk gap */
  foes: [[10, 11, 'robot'], [26, 11, 'mallwalker'],
         [49, 11, 'roomba'], [58, 11, 'robot'],
         [63, 11, 'roomba'], [77, 4, 'scanner']],
  candles: [[1, 11], [2, 11], [4, 10], [5, 9], [6, 8], [7, 9], [8, 10], [12, 11], [14, 9], [15, 9], [16, 7], [17, 7], [19, 7], [21, 9],
            [24, 11], [25, 11], [28, 11], [29, 11], [30, 10], [31, 9], [32, 8], [33, 8], [34, 8], [35, 9], [36, 10],
            [38, 11], [40, 10], [41, 9], [42, 8], [43, 8], [44, 9], [45, 10], [47, 11], [53, 11], [55, 9], [60, 11],
            [62, 11], [66, 10], [67, 10], [69, 9], [71, 9], [73, 9], [74, 8], [75, 7], [76, 6], [77, 6], [78, 7], [79, 8], [81, 9], [82, 9], [85, 9],
            [89, 11], [91, 11], [92, 11], [94, 11],
            [122, 11], [123, 11], [125, 11], [127, 11], [128, 11]],   /* the way out */
  /* story bubbles as Kinan passes a column: [col, who, what they say, seconds] (subtitles only) */
  talk: [
    [1, 'KINAN', "The tech conference! Glitchy's signal goes straight through here, to the main stage.", 3.8],
    [9, 'ANNIE', "(over the speakers) Attention, everyone: the main stage is closed. A rogue program is loose. Please stay safe!", 4.6],
    [14, 'MOM', 'Up the keynote riser, sweetie. And say thank you if a robot hands you a sticker.', 3.8],
    [27, 'SHAD', "Kinan, it's Shad on the radio. That's Annie! She thinks he's a virus... She's not mean, bud. She's trying to keep people safe.", 5.4],
    [33, 'KINAN', 'The robot demo booths! A robot dog, a robot arm, a robot that makes pancakes...', 3.6],
    [46, 'DAD', "Hop that road case, bud. Those robots are just showing off their byte-sized moves.", 3.6],
    [53, 'ANNIE', "(over the speakers) Firewall at full power. Deletion drones on standby. Nobody go near that cube!", 4.2],
    [63, 'CHENOA', "Backstage! Up the scaffold, Kinan. Annie built all of this herself? She's SO smart.", 3.8],
    [72, 'KINAN', "A big jump between the catwalks. I just have to show Annie who Glitchy really is.", 4],
    [90, 'SHAD', "The main stage is right through there. Talk to her, Kinan. Annie listens. She always does.", 4.2]
  ],
  arena: { col: 96, cols: 24, boss: 'firewall', checkpoint: { col: 88, row: 11 } },   /* 3 phases (the default), one logic lock each */
  spawn: { col: 2, row: 11 },
  goal: { col: 126, row: 11 }
});

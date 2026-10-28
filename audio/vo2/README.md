# audio/vo2: replacement voice lines (Shad's picked voices)

Prepared 2026-10-27. **Not wired into the game yet.** `index.html` still reads `vo/clips.json`
and plays `vo/<file>`; the wiring agent switches it to this folder.

## Totals

419 lines, 419 clips, all generated (0 reused), 10.14 MB, mono 24 kHz 40 kbps, shortest 1.15 s.
By character: Narrator 165, Kinan 57, Chenoa 45, Robin 41, Mom 40, Shad 29, Brick Mega-Mech 4, The Nosy Neighbour 4, The Big Kid 4, Glitchy 4, The Safety Foreman 3, Pumpjack Pete 3, The Wave Pool Lifeguard 3, The Coaster Conductor 3, The Carnival Barker 3, The Big Goalie 3, Robo-Rex 2, The Lumberjack Champ 2, Professor Static 2, Drizzle 1, The Neighbour's Wife 1.

## What is here

| File | What it is |
|---|---|
| `*.mp3` | one clip per spoken line: mono, 24 kHz, 40 kbps; the ID3 comment holds the voice settings |
| `clips.json` | text -> file, same shape as `vo/clips.json`; every line is listed twice, html form and plain form |
| `gen_log.json` | per clip: text, speaker key, character, voice, rate, pitch, pitch actually used, effect, source, where the line comes from |
| `extract_lines.cjs` | reads `index.html` and lists every line the game can speak (writes nothing) |
| `make_vo2.py` | makes the clips (`--dry` shows the plan, `--redo narrator` remakes one character) |
| `check.py` | the proof; exits 0 only when every check passes |

## Wiring notes

- `VO.speak` looks up `VO.clips[html] || VO.clips[text]`, where `text` is the html with tags and
  entities turned into spaces, emoji surrogate pairs removed and spaces squeezed. `clips.json` holds both
  forms, so either lookup hits. The path prefix in `VO.speak` is hard-coded to `'vo/'`; it needs `'audio/vo2/'`.
- The clips leave out the speaker's name: "KINAN: ..." is spoken as "...".
- The boss-arena lines are **not** in this folder. They play through `VO.playFile('audio/voice/<id>.mp3')`.
  All 23 clips there are byte-identical to `Kinan Map Concept/voices/lines` recordings made with the picked
  voices (`check.py` proves it each run), so they stay as they are.
- The 4 Glitchy helper toasts and the goalie / neighbour's wife subtitles are toasts or subtitle-only today;
  their clips are here so the wiring can use them (`gen_log.json` has the arena id for the subtitle lines).
- If someone edits a line in `index.html`, `check.py` fails with "no clip for ..."; run `python make_vo2.py`
  again and it makes only the missing clips.

## What "the lines the game speaks" turned out to be

Found by reading the code, not guessed:

- `VO.speak` has one caller: `say()`, the story box. `say()` runs only in the **classic stages** (the `LV`
  table: intros, boss intros, wins, the boss fight's opening line, the team-boss lines, and the cheer-up line
  when Kinan loses a heart). Classic Worlds 1-5 = `LV[0..50]` (Kinan vs. Mom, vs. Dad, vs. Shad & Chenoa,
  vs. the Stampede, vs. the Rain). The desktop "Play Kinan vs. Mom" shortcut opens
  albertancoder.github.io, and on `origin/main` the title's PLAY button goes to the classic stages
  (`playStage` / `startExplorer`), so these are most likely the lines Shad heard.
- The new map flow (title PLAY -> map -> `levels/w01..w05`) never calls `say()`. The level files hold no
  spoken text (only names and terrain; the jokes are in comments). The title, the map, the pets screen, LEVEL
  CLEAR, the respawn banner and the Glitchy helper are toasts or HTML screens, not speech. The only speech
  there is the boss-arena clips above.
- Left out on purpose: `galaxyMorph()` (reached only from a developer hook) and the World 6 3D sneak peek in
  `galaxy3d.js` (archived in this build). Some of the old `vo/` clips are those lines.
- The game never uses Kinan's barks (`gen_kinan_*`), Annie's Punjabi lines or any Grandpa line in these
  worlds, so none were needed. No line in scope matched `voices/lines/manifest.json` (exact or near: none
  above 75% similar), so nothing was reused; every clip was generated.

## Speaker key -> voice

The key is what `speakerOf()` in `index.html` returns. It comes from the `SPEAKERS` table, matched on the
bold name at the start of a line. `BOSS` lines take the boss's face key.

| Key | Character in the text | Voice (edge-tts) | Picked by Shad? |
|---|---|---|---|
| `k` | Kinan | en-US-AnaNeural +4% / -18Hz | yes |
| `m` | Mom (also "MOM (DEBBIE)") | en-US-JennyNeural -5% / -14Hz | yes |
| `c` | Chenoa | en-CA-ClaraNeural +4% / -4Hz | yes |
| `d` | Dad = Robin (also "DAD (on the phone)", "ROBIN") | en-US-RogerNeural -2% / -6Hz | yes |
| `s` | Shad; also the one "SHAD AND CHENOA" line | en-US-BrianNeural +0% / -4Hz | yes |
| `n` | The Nosy Neighbour | en-US-ChristopherNeural +2% / -6Hz | yes |
| `f` | The Safety Foreman | en-US-GuyNeural +2% / -12Hz | yes |
| `cd` | The Coaster Conductor | en-US-EricNeural +12% / +6Hz | yes |
| `br` | The Carnival Barker | en-US-GuyNeural +12% / +6Hz | yes |
| `dz` | Drizzle | en-US-BrianNeural -10% / +0Hz, echo | yes |
| `mech` | Glitchy | en-US-JennyNeural +10% / +70Hz, glitch | yes |
| `mech` | Rex the Robot T-rex | Robo-Rex's pick: en-US-GuyNeural -10% / -25Hz, robot | matched by likeness |
| `mech` | Brick Mega-Mech (also "???"; the clips say the old name) | en-US-EricNeural -10% / -25Hz, robot | **no, stand-in** |
| `mech` | Pumpjack Pete | en-US-SteffanNeural -12% / -30Hz, echo | **no, stand-in** |
| `b` | The Big Kid | en-US-EricNeural +8% / +40Hz | **no, stand-in** |
| `lg` | The Wave Pool Lifeguard | en-US-SteffanNeural +6% / +4Hz | **no, stand-in** |
| `lj` | The Lumberjack Champ | en-US-ChristopherNeural -6% / -16Hz | **no, stand-in** |
| `ps` | Professor Static | en-US-EricNeural +6% / +10Hz, flange | **no, stand-in** |
| none | Narrator: story boxes with no speaker, the "BOSS: ...!" call-outs, the stomp-count lines | en-US-AndrewNeural +0% / +0Hz | **no, stand-in** |
| none | The Big Goalie (2-fort arena subtitles) | en-US-SteffanNeural +4% / -6Hz | **no, stand-in** |
| none | The Neighbour's Wife (1-fort arena subtitle) | en-US-AriaNeural -8% / -14Hz | **no, stand-in** |
| none | Glitchy toasts that start with ✨ (the code finds no speaker) | Glitchy's pick | yes |

Mom, Robin, Chenoa, Shad and Kinan use only the picked voices. No accent was imitated.

## Lines without a picked voice (stand-ins; re-pick and run `make_vo2.py --redo <char>`)

- **Narrator, 165 lines** (`narrator_*.mp3`): 121 story-box narration, 27 boss title call-out, 17 stomp-count / boss-fight instruction. `gen_log.json` lists each one with its stage.
- **Brick Mega-Mech, 4 lines (recorded with the old toy-brick brand name; QA 2026-10-28 renamed it on screen):**
  - `megamech_001.mp3`: ???: BEEP BOOP. I AM THE LEGO MEGA-MECH. BUILT BY KINAN. BUILT TOO WELL.
  - `megamech_002.mp3`: MEGA-MECH: MY ORDERS: KEEP THE BUILDER BUSY UNTIL NINETEEN HUNDRED HOURS.
  - `megamech_003.mp3`: MEGA-MECH: SYSTEM... SHUTTING... down... happy... birthday... builder.
  - `megamech_004.mp3`: MEGA-MECH: WHO GAVE ME ORDERS? CLASSIFIED. BEEP.
- **Pumpjack Pete, 3 lines:**
  - `pumpjack_001.mp3`: PUMPJACK PETE: CREAK. CREAK. I HAVE BEEN NODDING FOR FORTY YEARS.
  - `pumpjack_002.mp3`: PUMPJACK PETE: FORTY YEARS OF YES. TODAY... I SAY... NO!
  - `pumpjack_003.mp3`: PUMPJACK PETE: creak... maybe... a little... yes...
- **The Big Kid, 4 lines:**
  - `bigkid_001.mp3`: BIG KID: Hey, birthday boy! Nobody gets past ME!
  - `bigkid_002.mp3`: BIG KID: Your sister PAID me to keep you here. Two dollars. I'm a professional.
  - `bigkid_003.mp3`: BIG KID: ...Sorry for being mean. Happy birthday. Wanna be friends?
  - `bigkid_004.mp3`: BIG KID: Cool. Cool. Save me a slice of cake. What cake? NO cake. Bye!
- **The Wave Pool Lifeguard, 3 lines:**
  - `lifeguard_001.mp3`: LIFEGUARD: TWEEEEET! No running by the pool!
  - `lifeguard_002.mp3`: LIFEGUARD: No splashing. No cannonballs. No fun without a LIFEGUARD!
  - `lifeguard_003.mp3`: LIFEGUARD: Okay, okay! You can swim. But WALK on the pool deck.
- **The Lumberjack Champ, 2 lines:**
  - `lumberjack_001.mp3`: LUMBERJACK: WHO DARES CHALLENGE THE CHAMP?! Nobody beats me at log rolling!
  - `lumberjack_002.mp3`: LUMBERJACK: You... you beat the Champ! Here, take my flannel. You earned it.
- **Professor Static, 2 lines:**
  - `static_001.mp3`: PROFESSOR STATIC: Welcome to my LIGHTNING SHOW! And for my first experiment... YOU!
  - `static_002.mp3`: PROFESSOR STATIC: Fascinating! The kid has more energy than my machine!
- **The Big Goalie, 3 lines:**
  - `goalie_001.mp3`: THE BIG GOALIE: NOBODY scores on me.
  - `goalie_002.mp3`: THE BIG GOALIE: Okay. NOW I'm warmed up!
  - `goalie_003.mp3`: THE BIG GOALIE: You... scored on me? Nobody scores on me! ...Good game, kid. High five!
- **The Neighbour's Wife, 1 lines:**
  - `neighbourwife_001.mp3`: THE NEIGHBOUR'S WIFE: Cookie, dear?
- **Rex the Robot T-rex, 2 lines** (has no pick of his own; uses Robo-Rex's pick because both are the robot T-rex):
  - `roborex_001.mp3`: REX: ROOOAAAR. SYSTEM ONLINE. PROTECT. THE. ZOO.
  - `roborex_002.mp3`: REX: rawr... battery... low... good... game...
- **Grandpa:** no Grandpa line is spoken in these worlds, so candidate A (Roger) was not needed.

## Lines not voiced

None. Every line found has a clip. The stand-ins above are the open item.

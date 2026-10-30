# World 11 voice lines to record (text only in the game today)

Every line below plays now as a subtitle only. The lead records the ones that deserve a voice; the rest can stay text.
Boss-fight lines live in `index.html` `ARENA_LINES` (4th field `true` = no recording yet; set it to `false`/remove it and
put the clip at `audio/voice/<id>.mp3`). Ending and map lines live in `END_LINES` / `W11_INTRO` (`index.html`, block
"THE ENDING"); their clip path is the 4th entry of `STORY.lines[id]` (now `null`).

Priority: **A** = the heart of the ending (record first) · **B** = a boss's own voice · **C** = family support lines.

## The ending (after the 11-castle)
| P | id | speaker | text | where |
|---|---|---|---|---|
| A | end_glitchy_01 | GLITCHY | Th... thank... you. | ending, beat 1 (his first real words) |
| A | end_kinan_01 | KINAN | You talked! You're on the team now, Glitchy. For real. | ending, beat 1 |
| A | end_mom_01 | MOM | Group hug. Everybody. Yes, you too, Glitchy. | ending, beat 1 |
| A | end_shad_01 | SHAD | Hey bud... look at the title. I think the game just got a new name. | ending, beat 2 (the name card) |
| A | end_kinan_02 | KINAN | We did it! ...Why can I see the BACK of my house?! | 3D cutscene |
| A | end_mom_02 | MOM | Kinan, stay close! | 3D cutscene |
| A | end_kinan_03 | KINAN | WHAT IS GOING ON HERE?! My hands are 3D! ...Okay, that's cool, BUT WHAT?! | 3D cutscene |
| A | end_annie_01 | ANNIE | Definitely not in the recipe. | 3D cutscene |
| A | end_chenoa_01 | CHENOA | Little bro, don't touch anything! | 3D cutscene |
| A | end_dad_01 | DAD | One dimension at a time, guys. | 3D cutscene |
| A | end_glitchy_02 | GLITCHY | Th... thank... you. | 3D cutscene (can reuse end_glitchy_01's clip) |
| A | end_shad_02 | SHAD | Welcome to your eleventh birthday, bud. | 3D cutscene, last line |
| A | end_kinan_04 | KINAN | Wait... is that SASKATOON? In 3D?! | World 12 teaser |

## Glitchy's Last Stand (11-castle)
| P | id | speaker | text | where |
|---|---|---|---|---|
| A | t_last_04 | GLITCHY | Th... thank... you. | the hug (befriend) |
| A | t_w11_kinan_16 | KINAN | He TALKED! Glitchy, you're not broken. You're our friend. | after the hug |
| A | t_w11_mom_03 | MOM | Welcome to the family, little one. | after the hug |
| A | t_w11_shad_04 | SHAD | Nobody deletes a teammate. Welcome to the team, buddy. | after the hug |
| A | t_w11_annie_04 | ANNIE | Kinan, I read his code. He thinks he's BROKEN... and that broken things get DELETED. That's why he runs. | fight intro |
| A | t_w11_kinan_14 | KINAN | Glitchy, nobody's deleting you! I'm coming to get you! | fight intro |
| B | t_last_01 | GLITCHY | BZZT! KRZZT! (sound only: glitch noises) | fight intro |
| C | t_w11_shad_03 | SHAD | Every move is one you've beaten before, bud. Survive his panic, and when he stops, catch his pixels! | fight intro |
| C | t_w11_kinan_15 | KINAN | All of his pixels! Now... the biggest hug in the world. | before the hug |
| C | w11tip_* | MOM / DAD / CHENOA / SHAD / ANNIE | the family tips after a lost try ("Sweetie, that was Mom's sock toss: ...") | built from `W11_TIPS` (23 moves x 5 speakers: record per speaker + move, or leave as text) |

## The black belt (before the Last Stand)
Already recorded: `audio/belt/belt_black.mp3` (Sabumnim). Nothing new.

## The realm guardians and the Core Guardian
| P | id | speaker | text | where |
|---|---|---|---|---|
| B | t_brex_01 | BRICK-REX | RAAAWR! (roar only) | 11-2 fight intro |
| B | t_brex_05 | BRICK-REX | Prrrrrrrr... (a giant cat purr) | 11-2 befriend |
| C | t_w11_kinan_01 | KINAN | His heart is gone! Somebody pulled the Heart of the Blocks right out of him. | 11-2 intro |
| C | t_w11_shad_01 | SHAD | Bud, it's Shad. When the bricks fall, stand on a glowing green stud. When he sits down, a heart piece drops: jump it into his chest! | 11-2 intro |
| C | t_w11_chenoa_01 | CHENOA | Aww, he PURRS! Little bro, you just fixed a dinosaur's heart. | 11-2 befriend |
| B | t_droid_01 | THE ROBOT COMMANDER | INTRUDER ALERT! PATROL DRONES, SWEEP THE DECK! | 11-3 intro (a robot voice) |
| B | t_droid_05 | THE ROBOT COMMANDER | ALL DRONES DOCKED. THANK YOU, CADET. SWITCHING TO... FRIENDLY MODE. | 11-3 befriend |
| C | t_w11_annie_01 | ANNIE | Read the dotted line, Kinan: a LOW drone, you jump it. A HIGH drone, you stay down. When he rests, walk a lost drone to its glowing dock. | 11-3 intro |
| C | t_w11_dad_01 | DAD | Friendly mode! Bud, he saluted you. That's a five-star review. | 11-3 befriend |
| B | t_trex_01 | THE ALPHA T-REX | ROOOOAR! (roar only) | 11-4 intro |
| C | t_w11_kinan_07 | KINAN | She's not mad, she's scared! Her baby is lost... and it's right here with me. | 11-4 intro |
| C | t_w11_mom_01 | MOM | Pick the baby up, sweetie. Her stomps hit the walls and come back, so jump twice! When she stops to sniff, carry the baby to the glowing rock. | 11-4 intro |
| C | t_w11_mom_02 | MOM | That's a mama's love, sweetie. I know the feeling. | 11-4 befriend |
| A | t_mirror_06 | MIRROR KINAN | Thanks... I just wanted to be real. | 11-5 befriend (Kinan's voice, a little echoey) |
| B | t_mirror_01 | MIRROR KINAN | ...Copy. Copy. COPY. | 11-5 intro |
| C | t_w11_kinan_12 | KINAN | You ARE real, buddy. You're the coolest copy of me there is. | 11-5 befriend |
| C | t_w11_shad_02 | SHAD | Use that, bud! When he stops to load, a switch pad glows. Walk onto it and let him copy you onto it too. | 11-5 intro |
| B | t_core_01 | THE CORE GUARDIAN | ...HALT. THE CORE. MUST. BE. SAFE. | 11-fort intro (a deep, slow voice) |
| B | t_core_05 | THE CORE GUARDIAN | ...ahhh. | 11-fort befriend |
| C | t_w11_annie_02 | ANNIE | It's afraid, not angry. Its gap opens and shuts like a heartbeat: go through while it's open. When it rests, step on the glowing coolant vent! | 11-fort intro |
| C | t_w11_annie_03 | ANNIE | Its code just changed from AFRAID to SAFE. The way to the core is open. | 11-fort befriend |

## World 11's first lines on the map (after World 10's door in the mist)
| P | id | speaker | text |
|---|---|---|---|
| A | w11_in_kinan_01 | KINAN | The door in the mist... it goes INSIDE Shad's console?! Everything in here is made of pixels. |
| A | w11_in_mom_01 | MOM | Stay close, sweetie. Wherever you go now, I'm going too. |
| B | w11_in_shad_01 | SHAD | These are my unfinished realms, bud. I started them and never finished... and Glitchy's panic is waking them all up. |
| B | w11_in_annie_01 | ANNIE | His signal is everywhere. He's scared, Kinan. Let's go find him. Chalo! (Let's go!) |

The 11-castle's story bubbles (`levels/w11/castle.js` `talk`) and the realm levels' new bubbles are subtitles only,
like every World 6-11 level bubble.

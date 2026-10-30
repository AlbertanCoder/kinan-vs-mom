# World 10 voice lines to record (2026-10-29)

World 10's bosses and endings are **text only** right now: every line below shows as a subtitle and plays no clip.
Record each one with the cast voice for its speaker (words in brackets, like "(from his lawn chair)", are stage
directions shown in the subtitle: never speak them), then:

- **Boss / ending lines** (`ARENA_LINES` in index.html): drop the clip at `audio/voice/<id>.mp3` and take the trailing
  `true` off its entry (the 4th item). A line with a 5th item (`'wheeze'`, `'laugh'`) keeps it: that is the face shown
  beside the subtitle.
- **Map exit lines** (`W10_EXIT` in index.html, the story lines Glitchy's exit plays on the map after the 10-castle):
  drop the clip at `audio/lines/w10/<id>.mp3` and put that path as the 4th item of its `STORY.lines` entry (today
  `null`), the way `audio/lines/lines.js` lists the World 9 exit.

GRANDPA has no picked voice yet (docs/DAD-JOKES.md). The two Grandmas need two different voices: GRANDMA (EDMONTON) is
Mom's mom (the worrier: jackets, "sweetheart"); GRANDMA (ONION LAKE) is Dad's mom (the feeder: sandwiches and pie, "dear"; the bannock is Grandma (Edmonton)'s).

## THE GRANDMOTHERS' PICNIC (10-fort)

| id | speaker | text | where |
|---|---|---|---|
| `t_gm_ed_01` | GRANDMA (EDMONTON) | There's my birthday boy! Oh, look at you, sweetheart. You're so SKINNY! Are they feeding you? | fight start |
| `t_gm_ol_01` | GRANDMA (ONION LAKE) | Your mom says you're ready for the big world, dear. We'll be the judge of that. | fight start |
| `t_w10_kinan_01` | KINAN | Grandmas... you're not going to pinch my cheeks, are you? | fight start |
| `t_w10_gp_01` | GRANDPA | (from his lawn chair) Dodge, Kinan! Nobody's ever out-fussed those two. Not even me! | fight start |
| `t_gm_ed_02` | GRANDMA (EDMONTON) | Back for more fussing, sweetheart? Zip up that jacket first! | a retry |
| `t_w10_chenoa_01` | CHENOA | Complaint bubbles! Jump over them, little bro. They pop after a few seconds. | first bubble |
| `t_w10_shad_01` | SHAD | See the glowing circle on the grass? That's a cheek-pinch zone. Step out of it, bud! | first pinch |
| `t_w10_dad_01` | DAD | Her cane goes out low and comes back high. Jump the low part, bud. That's a cane-did tip! | first cane |
| `t_gm_ed_03` | GRANDMA (EDMONTON) | Oof, my knees! I'm out of steam. Your turn, dear! | phase 2 |
| `t_gm_ol_02` | GRANDMA (ONION LAKE) | Watch my cane, my grandson. I've been throwing this thing since before your dad was born! | phase 2 |
| `t_gm_ol_03` | GRANDMA (ONION LAKE) | Huff... he's quick! Together, then! | tag team |
| `t_gm_ed_04` | GRANDMA (EDMONTON) | TAG TEAM! Jackets on, cheeks out! | tag team |
| `t_gm_ol_04` | GRANDMA (ONION LAKE) | Whew... we're all out of steam, dear. | the hug |
| `t_gm_ed_05` | GRANDMA (EDMONTON) | Then there's only one thing left to do... GROUP HUG! | the hug |
| `t_w10_kinan_02` | KINAN | Can't... breathe... love you too... | the hug |
| `t_gm_ol_05` | GRANDMA (ONION LAKE) | Now eat something. Sandwiches, pie, and your other grandma's bannock. You're too skinny for a big trip! | the food |
| `t_w10_gp_02` | GRANDPA | That's my grandson! Now save me a sandwich, Kinan. A king needs his lunch! | the food |

## MOM'S LAST INSPECTION (10-castle)

| id | speaker | text | where |
|---|---|---|---|
| `t_mf_01` | MOM | Kinan. The party's all set up... but first, one last inspection. | fight start |
| `t_w10_kinan_03` | KINAN | Mom! It's my BIRTHDAY! | fight start |
| `t_mf_02` | MOM | I know, my boy. Show me you can look after yourself out there, and then we have cake. Three chores. Ready? | fight start |
| `t_mf_03` | MOM | Okay, sweetie. Take a breath. We'll pick up right where you left off. | a retry |
| `t_mf_04` | MOM | Chore one: tidy your room! Toys in the RED bin, socks in the BLUE basket. Pick each one up after it lands. | round 1 |
| `t_mf_05` | MOM | Tidy! I'm impressed. Chore two: the laundry pile. Watch for my "!" | round 2 |
| `t_w10_chenoa_02` | CHENOA | Mom's towel sweeps the floor, little bro. Jump it! The wind only pushes you. | first towel |
| `t_mf_06` | MOM | Last one, my boy: carry your birthday cake to the party table. Don't drop it! | round 3 |
| `t_mf_07` | MOM | Oops! That's okay, sweetie. The cake's back on its stand. Try again. | first cake drop |

## The ending (10-castle; a tap or Enter skips a beat)

| id | speaker | text | beat |
|---|---|---|---|
| `t_mf_08` | MOM | Not one crumb out of place. Kinan... I'm so proud of you. | 1 proud |
| `t_mf_09` | MOM | I was scared to let you go out there. But I watched you the whole way. You're ready, my boy. | 1 proud (the key line) |
| `t_w10_kinan_04` | KINAN | So... you trust me? | 1 proud |
| `t_mf_10` | MOM | I trust you. And wherever Glitchy goes next, I'm coming too. I'm on the team. | 1 Mom joins the team |
| `t_w10_shad_02` | SHAD | Mom's on the team! That's everybody now. The whole family. | 1 |
| `t_w10_gp_03` | GRANDPA | Niagara Falls, Robin. Twelve thousand years of the same routine, and people still clap. Remind you of anyone? | 2 joke-off |
| `t_w10_dad_02` | DAD | Okay, Dad. Three-layer cake, my boy's birthday, and the Falls. Look at me... I'm in TIERS. | 2 joke-off (wheeze-laugh: record it laughing) |
| `t_w10_gp_04` | GRANDPA | (writing in a little notebook) Eight out of ten. I've kept one of yours since you were eight, son. Don't tell your father, Kinan. | 2 joke-off |
| `t_w10_kinan_05` | KINAN | 'Robin's jokes. Do not show Robin.' ...Dad! He keeps one TOO! | 2 joke-off |
| `t_mf_11` | MOM | (laughing) Okay, okay! Cake's coming, my boy. | 2 joke-off (Mom laughs) |
| `t_w10_dad_03` | DAD | Candles are lit! Everybody, on three. One, two, three... | 3 the cake |
| `t_w10_all_01` | EVERYONE | Happy birthday to you... happy birthday, dear Kinan... happy birthday to YOU! | 3 the song (the whole cast) |
| `t_w10_kinan_06` | KINAN | Eleven! Okay. Big wish... | 3 the cake |
| `t_w10_chenoa_03` | CHENOA | Um... guys? Why is the waterfall going UP? | 4 THE TURN |
| `t_w10_kinan_07` | KINAN | Wait... did the world just glitch? | 4 THE TURN (the key line) |
| `t_w10_glitchy_01` | GLITCHY | Bweee! (A door opens in the mist. Glitchy zooms straight for it.) | 4 THE TURN (only "Bweee!" is spoken) |
| `t_w10_shad_03` | SHAD | That door goes INTO the console. Glitchy's going home, bud. | 4 THE TURN |
| `t_mf_12` | MOM | Then we go together. Blow out your candles first, my boy. Then we go. | 4 THE TURN |

## Glitchy's exit on the map (after the 10-castle, before Sabumnim's belt scene)

| id | speaker | text |
|---|---|---|
| `w10_glitchy_exit` | GLITCHY | Bweee! Bweee-ooo! |
| `w10_kinan_exit` | KINAN | He went through the door in the mist... straight into the console! |
| `w10_mom_exit` | MOM | Then that's where we're going. Together, my boy. |
| `w10_robin_exit` | DAD | Into the console? I always wanted to be a gamer. Let's press start! |

The level bubbles of 10-castle (its `talk` lines: Kinan, Dad, Chenoa, Annie, Shad, Grandma (Edmonton), Mom) are
subtitles by design, like every level bubble in Worlds 6-10.

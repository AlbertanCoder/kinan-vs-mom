# Dad's jokes (and Grandpa's)

Shad, 2026-10-29: "Robin has to make a joke about everything: dad jokes, witty humour, puns, always cracking jokes
and trying to be funny, identical to how he is in real life." About 9 lines in 10 are now a joke; a few stay serious
on purpose (letting Kinan lead, being proud of him). The table with every old line is `tools/dad-lines.mjs`;
`app/tests/unit/dad-lines.test.ts` checks every line in it is in the game. The story lines change through
`audio/dad-lines.js` (loaded right after `audio/lines/lines.js`, which stays exactly what `tools/story-lines.mjs` makes).

## Re-recorded (DONE 2026-10-29)

All lines below now have clips: 17 Dad story lines and 4 new lines in `audio/rerecord/` (listed in the `D` table of `audio/dad-lines.js`), Grandpa's 5 original 3-1 lines too (his first voice: en-US-ChristopherNeural -15% -14Hz), and the 2 Dad boss lines in `audio/voice/`. The tests that expected subtitle-only lines now expect the clips.

## (history) The list that needed re-recording

Story lines (17): `w02_robin_01`, `w02_robin_02`, `w03_robin_01`, `w03_robin_02`, `w03_robin_03`, `w03_robin_07`,
`w03_robin_09`, `w03_robin_11`, `w03_robin_14`, `w03_robin_15`, `w04_robin_01`, `w05_robin_01`, `w05_robin_02`,
`w05_robin_05`, `w06_robin_01`, `w07_robin_03`, `w09_robin_01`.
Drop each new clip at `audio/rerecord/<id>.mp3` and add its id to `REC` in `audio/dad-lines.js` (sw.js precaches it).

Boss-fight lines (2): `w03_robin_08`, `w05_robin_03`. Drop the clip at `audio/voice/<id>.mp3` (replacing the old one)
and take the trailing `true` off its `ARENA_LINES` entry in index.html.

Until then two tests fail on purpose (not loosened): `app/tests/unit/story-lines.test.ts` "C1 ... Worlds 6-9 carry
their exit lines" (the escape lines `w06_robin_01`, `w07_robin_03`, `w09_robin_01` have no clip) and two checks in
`app/tests/e2e/v1-voice-story.spec.ts` (the list of subtitle-only lines; 3-castle's opener `w03_robin_11` plays no clip).

## New lines that need a voice (subtitles until recorded)

| id | who | line |
|---|---|---|
| `w03_kinan_jo1` | KINAN | Oh no. Now we know where Dad gets it. |
| `w03_grandpa_jo2` | GRANDPA | What do you call a cow with no legs? Ground beef! |
| `w03_robinsmom_jo1` | GRANDMA | Oh, you two. Kinan, run, before they start on the chickens. |
| `gp_w04_pool` | GRANDPA | Grandpa here, on the video call! Why don't waterparks get boring? There's always a new wave! |
| `gp_w05_dino` | GRANDPA | It's Grandpa on the video call! What do you call a dinosaur that tells jokes? A pun-osaurus! |

GRANDPA has no picked voice yet. All his lines: `w03_grandpa_01` to `w03_grandpa_05`, `w03_grandpa_jo2`,
`gp_w04_pool`, `gp_w05_dino`, and his level bubbles in 4-7, 8-5 and 9-7 (below). The level bubbles (every
`talk` line) are subtitles by design, like all of Worlds 6-9.

## 3-1, Grandma and Grandpa's at Onion Lake: the joke-off (was one 10-line opener)

- Level start (5 lines): Grandma `w03_robinsmom_01` (pancakes first) · Grandpa `w03_grandpa_01` (why did the scarecrow
  win an award?) · Dad `w03_robin_04` (outstanding in his field... "Dad, you told me that when I was eight") · Grandpa
  `w03_grandpa_03` (where your dad gets his jokes) · Kinan `w03_kinan_jo1` ("Now we know where Dad gets it").
- At the checkpoint (5 lines): Dad's joke `jk_w03_1` (cow bells) · Grandpa `w03_grandpa_04` ("I taught you that one") ·
  Dad `w03_robin_05` (beef jerky) · Grandpa `w03_grandpa_jo2` (ground beef) · Grandma `w03_robinsmom_jo1` (the groan).
- LEVEL CLEAR (3 lines): Grandma `w03_robinsmom_02` (sandwiches and bannock) · Grandpa `w03_grandpa_05` · Dad `w03_robin_06`.

## Long conversations cut to 5 lines (every story fact kept)

- World 1 intro (was 8): `w01_kinan_01`, `w01_kinan_02`, `w01_kinan_03`, `w01_mom_01`, `w01_mom_02` (cut: Shad's "did you
  open it?!", Glitchy's beep, "my socks are walking").
- World 2 intro (was 6): Glitchy's beep cut. World 4 intro (was 7): Shad's hello and "hold that thought" cut.
- World 5 intro (was 8): `w05_kinan_01`, `w05_robin_01`, `w05_kinan_02`, `w05_annie_01`, `w05_annie_pa01` (cut: Chenoa's
  "stay together", Glitchy's beep, Aiden's hello; Aiden still opens 5-3).
- Hidden jokes that became Grandpa's (video call): 4-4 (`jk_w04_4` -> `gp_w04_pool`), 5-6 (`jk_w05_6` -> `gp_w05_dino`).

## Story lines rewritten (old -> new)

| id | old | new |
|---|---|---|
| `w02_robin_01` | Hey, bud! Why's my radio beeping? ...Kinan, why is my radio beeping? | Hey, bud! My radio's beeping. Must be a sound investment. ...Kinan, why is it beeping? |
| `w02_robin_02` | Hop in. Grandma's expecting us anyway. | Hop in. Grandma's expecting us, and I never keep pancakes waiting. |
| `w03_robin_01` | Okay, bud. The beeping's heading north. Way north. | Okay, bud. The beeping's heading north. I won't beep around the bush: way north. |
| `w03_robin_02` | Fort McMurray north. Good thing we're stopping at Grandma and Grandpa's first. | Fort McMurray north. Grandma and Grandpa's first, though. I knead my breakfast. |
| `w03_robin_03` | Jacket, snacks, jacket. Got it, hon. | Jacket, snacks, jacket. Got it, hon. I'm on it like a zipper. |
| `w03_robin_07` | Camp kitchen's gone nuts. Stay in the truck, bud. | Camp kitchen's gone nuts. Total breakfast scramble. Stay in the truck, bud. |
| `w03_robin_09` | That's my truck. Hang on, I'll lift you up with the suction hose. | That's my truck! Hang on, I'll lift you with the hose. This job really sucks. In a good way. |
| `w03_robin_11` | Storm's rolling in. Stay close, bud. | Storm's rolling in, bud. Stay close. I'd tell a lightning joke, but it might strike out. |
| `w03_robin_14` | Well, would you look at that. Second-best thing in there, after Grandma's sandwiches. | Well, look at that. Second-best thing in there, after Grandma's sandwiches. Those were un-brie-lievable. |
| `w03_robin_15` | Edmonton, eh? Shad's town. Let's give him a call. | Edmonton, eh? Shad's town. Let's call him. He works construction, he'll build us a plan. |
| `w04_robin_01` | Stampede? Yee-haw. | Stampede? Yee-haw! Hold your horses, I'm coming. |
| `w05_robin_01` | Uh oh. That young bull's spooked. Everybody, back up nice and slow. | Uh oh. That young bull's spooked. Back up nice and slow, folks. No bull. |
| `w05_robin_02` | Fireworks are starting. Bronco's gonna hate this. | Fireworks are starting. Bronco's gonna hate this. Nobody likes a horse with a short fuse. |
| `w05_robin_05` | Badlands, here we come. | Badlands, here we come! Don't worry, they're not THAT bad. |
| `w06_robin_01` | Vancouver. Better pack an umbrella. | Vancouver. Pack an umbrella, folks. I hear the forecast is un-brella-vable. |
| `w07_robin_03` | Guess he wanted express delivery. | Guess he wanted express delivery. That bug's got a real stamp of approval. |
| `w09_robin_01` | Look at that. First one out the door. | Look at that. First one out the door. That bug's got startup energy. |

Kept as they are (no new recording): `w03_robin_04`, `w03_robin_05` (already jokes), `w03_robin_06`, `w03_robin_13`
(already quips), `w03_robin_10` ("You tell me, bud. You're leading."), `w03_robin_12` ("You led, I followed"),
`w05_robin_04` (Glitchy wants to be found) (serious on purpose), and the 32 `jk_*` joke-book lines (already dad jokes).

## Boss lines and toasts (index.html)

| id / where | old | new |
|---|---|---|
| `w03_robin_08` (moose fight) | Easy, big fella. Easy. Don't fight him, Kinan. Calm him down. | Easy, big fella. Don't fight him, Kinan. Calm him down. He's just moose-understood. |
| `w05_robin_03` (Bronco) | Look at that. He's calming down. You did that, bud. | Look at that, he's calming down. You did that, bud. That's un-bull-ievable. |
| `t_w7_dad_01` (banana slug) | Careful, bud. That shiny slime on the snow is slippery! | Careful, bud, that shiny slime is slippery! Don't let this slug get you down. |
| Dad helper toast | Just got back from camp, bud! Eat this burger | Back from camp, bud! This burger's a real patty-cake |
| Dad helper toast | Nobody beats up the birthday boy! | Nobody beats up the birthday boy! Not on my grill-watch |
| Dad helper toast | Dad's home from the oilfield! Hearts refilled! | Dad's home from the oilfield! Hearts refilled, and that's crude-ly honest |
| Dad/Mom helper toast | A little something to keep you going! | A little something to keep you going! Bun appetit! |
| Dad special toast | DAD SPECIAL! Hydro vac! Stand back, bud! | DAD SPECIAL! Hydro vac! Stand back, bud, this really sucks! |
| Rig fight toasts | Hydro vac, ON! / Here comes the suck! / Hold on to your hard hat! | Hydro vac, ON! Prepare to be im-pressed! / Here comes the suck! Nothing personal, mud. / Hold on to your hard hat! Safety first, puns second! |
| Rig fight toast | Oops. That is a LOT of mud. My bad! | Oops. That is a LOT of mud. Guess I really dug myself in! |

## Level bubbles rewritten (Worlds 7-9; subtitles)

The exact old and new text of all 41 is the `REPLACE` list in `tools/dad-lines.mjs`. In short:
- 7-1 sea-nic route / all downhill / sea what it's got · 7-2 swept up / shore-t / rooting for us · 7-3 classic bandit, he
  even wore the mask · 7-4 mane attractions / mist-ing out · 7-5 the suspense / peak energy · 7-6 sea what I did there ·
  7-7 it really sucks me in · 7-8 no reaction · 7-fort grouse-ing / top of the world · 7-castle on sail · 7-secret
  sea-nic route / peaked out.
- 8-1 a walk in the park, backwards / bin-ge shopping · 8-2 real low point · 8-3 sign-ificant · 8-4 high-jinks / block
  his path · 8-5 smells fishy · 8-6 ferry sneaky / shore thing · 8-7 car-rot · 8-8 edge-ucation · 8-fort fin-ishing
  lunch · 8-castle shelf-esteem · 8-secret tower-ific.
- 9-1 neigh problem · 9-2 zip it and ship it · 9-3 a step up from walking · 9-4 this mountain rocks · 9-5 don't fall for
  it · 9-6 very uplifting · 9-7 mark my words · 9-8 wall-mannered · 9-fort I lean toward liking it · 9-secret clear skies.
Every instruction a kid needs (wait for the wave, jump at the edge, the flickering wall...) is still said first.

## New level bubbles: the wheeze-laugh, Mom's reactions, Dad's calls, Grandpa's calls

`wheeze`: Dad starts a joke and can't finish (his face doubled over and shaking, tears, the wobbling subtitle, the
breathy hee-hee-hee sound `SFX.wheeze`), and someone else says the punchline. `laugh`: Mom cracks up. `walkoff`: "Is
that all you do, tell jokes?", her face walks out of the box, and Dad carries on ("...I'll be here all week!").
Never in a boss level, never on a line a kid needs.

- 1-3 Dad on the phone (wheeze, the crummy cookie) -> Kinan finishes · 1-7 Dad's blue-berry call.
- 2-3 Dad on the phone (wheeze, the bright students) -> Kinan · 2-6 the math book with too many problems.
- 3-2 the pumpjack and the oil (wheeze) -> Kinan "...for information. Dad. Breathe." · 3-5 the pumpjack at the doctor (wheeze) -> Kinan "Oh no. I'm turning into you."
- 4-5 the mall rink (wheeze) -> Chenoa "...to break the ice. Wow. Bye, Dad." · 4-7 Grandpa's video call (trails).
- 5-2 the pancake comedian (wheeze) -> Mom laughs ("you told me that one on our first date") · 5-5 horses say neigh -> Mom walks off to the quilts -> "I'll be here all week, folks!"
- 6-2 the T-Rex who can't clap (wheeze) -> Chenoa · 6-5 lazy bones -> Mom laughs ("Don't tell him I laughed").
- 7-3 the trees that leaf (wheeze) -> Mom laughs · 7-7 dome-inating -> Mom walks off to the planets -> "I'll be here all week!"
- 8-3 the trash panda on ice (wheeze) -> Mom laughs · 8-7 the grate day -> Mom walks off to the peaches -> Dad on the brie · 8-5 Grandpa's video call (toy story).
- 9-1 the bagel's passport (wheeze) -> Kinan -> Mom laughs · 9-5 the waterfall that waved -> Mom walks off to the lookout -> Dad · 9-7 Grandpa's video call (the computer virus).

## Later: World 10, the Niagara party joke-off (wire it with World 10)

- GRANDPA: Robin! Why did Niagara Falls never get a job? It was always taking a plunge!
- DAD: Oh yeah? Why is the Falls so friendly? It's always making a big splash! ...Dad, you're dripping.
- GRANDPA: Of course I'm dripping. I'm the king of falls jokes. Kinan, tell him.
- KINAN: Mom, they're doing it again. Cake. Somebody bring cake.

## Not rewritten yet

- The classic stages' Dad lines (the legacy stage table in index.html, `<b>DAD:</b>` / `<b>ROBIN:</b>` lines such as
  "Big day, bud. Bring-Your-Kid-to-Work Day..."), voiced from audio/vo2 by their exact text: a new text would lose
  the clip, so they wait for a vo2 re-record pass. Also the end-screen lines ("Well. I always said we needed more
  yard.", "That's one ocean, bud...") are already witty and were left alone.

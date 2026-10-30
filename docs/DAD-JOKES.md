# Dad's jokes (and Grandpa's)

Shad, 2026-10-29: "Robin has to make a joke about everything: dad jokes, witty humour, puns, always cracking jokes
and trying to be funny, identical to how he is in real life." About 9 lines in 10 are now a joke; a few stay serious
on purpose (letting Kinan lead, being proud of him). The table with every old line is `tools/dad-lines.mjs`;
`app/tests/unit/dad-lines.test.ts` checks every line in it is in the game. The story lines change through
`audio/dad-lines.js` (loaded right after `audio/lines/lines.js`, which stays exactly what `tools/story-lines.mjs` makes).

## The joke pass (second pass, 2026-10-29): funnier, for the grown-ups first

Shad: "really really think long and hard about their jokes... make them even funnier, like proper dad jokes... make us actually genuinely laugh... If Robin and his dad can have a joke, that would be
awesome." So the audience is the adults first and Kinan second: wordplay tied to what is on screen,
callbacks across the worlds, jokes about Dad's own job, and Grandpa (92, the King of Dad Jokes) as the better, drier one.

**Voice:** the 21 story lines with new words were recorded on 2026-10-30 with the cast voices (`audio/rerecord/<id>.mp3`,
lengths in the D table of `audio/dad-lines.js`); the list is `docs/VOICE-TODO-JOKES.md`. The 48 level talk lines with new words are
listed there too (talk bubbles are subtitles by design).

## Re-recorded (first pass, 2026-10-29)

The first pass's lines got clips that day: 17 Dad story lines and 4 new lines in `audio/rerecord/`, Grandpa's 5 original
3-1 lines (his voice: en-US-ChristopherNeural -15% -14Hz), and the 2 Dad boss lines in `audio/voice/`. The joke pass
then changed the words of 21 story lines (above); the 11 whose words stayed keep their clips (the `D` table in
`audio/dad-lines.js`), and so do the 2 boss lines.

## The running gags

- **Dad's notebook of Grandpa's jokes.** Leaving for Grandpa's: "Grandpa's got jokes. I've got a pen." (`w03_robin_02`).
  3-1: Kinan finds it in Dad's shirt pocket, "Grandpa's jokes. Do not show Grandpa." Grandpa, stealing the punchline:
  "Write that down, son." 6-5: Mom laughs, and it goes in the notebook "Under 'Rare Events.'" World 10: Grandpa has one
  too, "Robin's jokes. Do not show Robin.", kept "since you were eight".
- **Grandpa scores Dad's jokes out of ten.** 3-1 checkpoint: 3 ("I taught you that one in 1987, and you still rush it").
  3-1 clear: 5 ("Now THAT was a pause"). 3-2: Kinan, "Grandpa would give that a two." 5-6: 4 (he wrote that one the day
  Dad put his truck through the fence). World 10: 8, the first good one.
- **"When I was eight."** 3-1: "Dad, I laughed at that when I was eight. Because I was eight." 8-5: the toy brick on the
  stairs, "Dad, I was eight!" World 10: Grandpa's notebook, "Since you were eight."
- **Timing.** Grandpa: "you still rush it". Dad over-pauses ("... ... ... ... ..."), "Now it's too long". At level clear
  Dad's "So... all of them?" finally gets "Now THAT was a pause."
- **Dad's job** (hydro-vac: digs with water, sucks the mud up a hose; away at camp a lot). 3-6 "This job really sucks.
  In a good way." · 2-6 the camp cook didn't laugh · World 4 "I practised that all month at camp" · 6-4 the fossil dig
  ("I dig for a living. ...They gave me a toothbrush.") · 8-1 "I've had jobs like this" · 9-8 "A firewall? I brought the
  hose." · 9-secret "I've been digging the wrong holes" · 7-7 the vacuum exhibit (kept).
- **Dad's phone calls from camp** (Worlds 1, 2, 4): 1-3, 1-7 ("Did you hang up? Like a painting?"), 2-3 ("you're on
  speaker"), 2-6, 4-5; so at World 3's exit he has to open his call to Shad with "not a joke".
- **Stealing Grandpa's jokes:** 1-3 Kinan, "Dad, that's Grandpa's joke. I'm telling him." · 3-1 the whole visit.
- **The wheeze** (one per world, 1 to 9: Dad can't finish, someone else does).
- **Mom.** Laughs despite herself: 5-2 ("And I still married you"), 6-5 ("Don't tell him I laughed"), 7-3, 8-3 ("That was
  actually funny!"), 9-1. Walks off: 5-5 quilts, 7-7 planets, 8-7 peaches, 9-5 the lookout; every time Dad keeps going
  ("...I'll be here all week!"; 7-7: "She'll be back. Opposites attract.").
- **Kinan turning into Dad:** 3-5 "Oh no. I'm turning into you." -> 9-1 "Oh no, I explained it. Mom, it's happening."
- **The jackets:** Mom's "jacket, snacks, jacket" -> "Two jackets. He'll be the coolest kid up there. Well. The warmest."
  -> 3-castle's storm: "don't tell your mom. She'll say we needed a third jacket."

## Dad and Grandpa, back and forth (Grandpa always gets the last word)

1. 3-1 level start: the scarecrow (Dad steals the punchline, Grandpa: "stealing my jokes ever since", the notebook).
2. 3-1 checkpoint: cow bells, 3/10, Dad's too-long pause, Grandpa's ground beef, "Write that down, son."
3. 3-1 level clear: "No jokes I wouldn't tell." / "So... all of them?" / "Now THAT was a pause. Five out of ten."
4. 5-6 video call: the thesaurus / Tyrannosaurus WRECKS / "Four out of ten. I wrote that one the day you put my truck
   through the fence."
5. 8-5 video call: the toy brick on the stairs / "Dad, I was eight!" / "it's just a stepping stone. Still the best joke you
   ever told."
6. World 10 (later): the Niagara party, the notebook turns around (below).

## (history) The list that needed re-recording

Story lines (17): `w02_robin_01`, `w02_robin_02`, `w03_robin_01`, `w03_robin_02`, `w03_robin_03`, `w03_robin_07`,
`w03_robin_09`, `w03_robin_11`, `w03_robin_14`, `w03_robin_15`, `w04_robin_01`, `w05_robin_01`, `w05_robin_02`,
`w05_robin_05`, `w06_robin_01`, `w07_robin_03`, `w09_robin_01`.
Drop each new clip at `audio/rerecord/<id>.mp3` and add its id to `REC` in `audio/dad-lines.js` (sw.js precaches it).

Boss-fight lines (2): `w03_robin_08`, `w05_robin_03`. Drop the clip at `audio/voice/<id>.mp3` (replacing the old one)
and take the trailing `true` off its `ARENA_LINES` entry in index.html.

They are all recorded now (2026-10-30), so those tests pass as written: `app/tests/unit/story-lines.test.ts` (Worlds
6-9 carry their exit lines) and `app/tests/e2e/v1-voice-story.spec.ts` (no subtitle-only lines; every 3-1 opener voiced).

## New and changed story lines (the joke-offs and Grandpa's video calls)

| id | who | line |
|---|---|---|
| `w03_grandpa_03` | GRANDPA | And you've been stealing my jokes ever since. Kinan, check your dad's shirt pocket. |
| `w03_kinan_jo1` | KINAN | A little notebook! 'Grandpa's jokes. Do not show Grandpa.' ...Dad. |
| `w03_grandpa_04` | GRANDPA | Three out of ten. I taught you that one in 1987, and you still rush it. |
| `w03_grandpa_jo2` | GRANDPA | Beef jerky. Now it's too long. Watch: cow with no legs? ...Ground beef. Write that down, son. |
| `w03_robinsmom_jo1` | GRANDMA | Oh, you two. Kinan, run, before they start on the chickens. (unchanged, keeps its clip) |
| `w03_grandpa_jo4` | GRANDPA | Ha! Now THAT was a pause. Five out of ten. Drive safe, son. |
| `gp_w04_pool` | GRANDPA | Grandpa on the video call! Wave to Grandpa, Kinan! ...Not you, wave pool. Show-off. |
| `gp_w05_dino` | GRANDPA | Grandpa on the video call! What do you call a dinosaur with a big vocabulary? A thesaurus. |
| `w05_robin_jo1` | DAD | Oh yeah? What do you call a dinosaur that crashes the car? Tyrannosaurus WRECKS! |
| `gp_w05_dino2` | GRANDPA | Four out of ten. I wrote that one the day you put my truck through the fence. |

Was: `w03_grandpa_03` "Kinan, you know where your dad gets his jokes? Me. I want them back." · `w03_grandpa_04` "Ha!
...I taught you that one." · `w03_kinan_jo1` "Oh no. Now we know where Dad gets it." · `w03_grandpa_jo2` "What do you call
a cow with no legs? Ground beef!" · `gp_w04_pool` "...Why don't waterparks get boring? There's always a new wave!" ·
`gp_w05_dino` "...What do you call a dinosaur that tells jokes? A pun-osaurus!". `w03_grandpa_jo4`, `w05_robin_jo1` and
`gp_w05_dino2` are new. Grandpa's level bubbles: 4-7, 8-5 and 9-7 (below).

## 3-1, Grandma and Grandpa's at Onion Lake: the joke-off (was one 10-line opener)

- Level start (5 lines): Grandma `w03_robinsmom_01` (pancakes first) · Grandpa `w03_grandpa_01` "Robin! Why did the
  scarecrow win an award?" · Dad `w03_robin_04` "Outstanding in his field. Dad, I laughed at that when I was eight. Because
  I was eight." · Grandpa `w03_grandpa_03` "And you've been stealing my jokes ever since. Kinan, check your dad's shirt
  pocket." · Kinan `w03_kinan_jo1` "A little notebook! 'Grandpa's jokes. Do not show Grandpa.' ...Dad."
- At the checkpoint (5 lines): Dad's joke `jk_w03_1` "Why do cows wear bells? Because their horns don't work." · Grandpa
  `w03_grandpa_04` "Three out of ten. I taught you that one in 1987, and you still rush it." · Dad `w03_robin_05` "Fine.
  Slower. What do you call a cow with a twitch? ... ... ... ... ..." · Grandpa `w03_grandpa_jo2` "Beef jerky. Now it's too
  long. Watch: cow with no legs? ...Ground beef. Write that down, son." · Grandma `w03_robinsmom_jo1` "Oh, you two. Kinan,
  run, before they start on the chickens."
- LEVEL CLEAR (4 lines): Grandma `w03_robinsmom_02` (sandwiches and bannock, drive safe) · Grandpa `w03_grandpa_05` "And no
  jokes I wouldn't tell." · Dad `w03_robin_06` "So... all of them?" · Grandpa `w03_grandpa_jo4` "Ha! Now THAT was a pause.
  Five out of ten. Drive safe, son." (the last word).

## Long conversations cut to 5 lines (every story fact kept)

- World 1 intro (was 8): `w01_kinan_01`, `w01_kinan_02`, `w01_kinan_03`, `w01_mom_01`, `w01_mom_02` (cut: Shad's "did you
  open it?!", Glitchy's beep, "my socks are walking").
- World 2 intro (was 6): Glitchy's beep cut. World 4 intro (was 7): Shad's hello and "hold that thought" cut.
- World 5 intro (was 8): `w05_kinan_01`, `w05_robin_01`, `w05_kinan_02`, `w05_annie_01`, `w05_annie_pa01` (cut: Chenoa's
  "stay together", Glitchy's beep, Aiden's hello; Aiden still opens 5-3).
- Hidden jokes that became Grandpa's (video call): 4-4 (`jk_w04_4` -> `gp_w04_pool`), 5-6 (`jk_w05_6` -> `gp_w05_dino`;
  the joke-off goes on with Dad's comeback `w05_robin_jo1` and Grandpa's score `gp_w05_dino2`).

## Story lines rewritten (old -> new)

"old" is the voice script; "clip" says whether the line plays a recording (all 21 were recorded on 2026-10-30).

| id | old | new | clip |
|---|---|---|---|
| `w02_robin_01` | Hey, bud! Why's my radio beeping? ...Kinan, why is my radio beeping? | Hey, bud! My radio's beeping. I think it caught a bug. ...Kinan, did you give my radio a bug? | yes |
| `w02_robin_02` | Hop in. Grandma's expecting us anyway. | Bud, the radio's IN my truck. Following it's easy. Hop in, Grandma's expecting us. | yes |
| `w03_robin_01` | Okay, bud. The beeping's heading north. Way north. | Okay, bud. The beeping's heading north. I won't beep around the bush: way north. | yes |
| `w03_robin_02` | Fort McMurray north. Good thing we're stopping at Grandma and Grandpa's first. | Fort McMurray north. Grandma and Grandpa's first, though. Grandma's got pancakes, Grandpa's got jokes. I've got a pen. | yes |
| `w03_robin_03` | Jacket, snacks, jacket. Got it, hon. | Jacket, snacks, jacket. Got it, hon. Two jackets. He'll be the coolest kid up there. Well. The warmest. | yes |
| `w03_robin_04` | He was outstanding in his field. Dad, you told me that when I was eight. | Outstanding in his field. Dad, I laughed at that when I was eight. Because I was eight. | yes |
| `w03_robin_05` | Hey, Dad. What do you call a cow with a twitch? Beef jerky. | Fine. Slower. What do you call a cow with a twitch? ... ... ... ... ... | yes |
| `w03_robin_07` | Camp kitchen's gone nuts. Stay in the truck, bud. | Camp kitchen's gone nuts. Total breakfast scramble. Stay in the truck, bud. | yes |
| `w03_robin_09` | That's my truck. Hang on, I'll lift you up with the suction hose. | That's my truck! Hang on, I'll lift you with the hose. This job really sucks. In a good way. | yes |
| `w03_robin_11` | Storm's rolling in. Stay close, bud. | Storm's rolling in, bud. Stay close. And don't tell your mom. She'll say we needed a third jacket. | yes |
| `w03_robin_14` | Well, would you look at that. Second-best thing in there, after Grandma's sandwiches. | Well, would you look at that. Second-best thing in there, after Grandma's sandwiches. Don't tell her it was close. | yes |
| `w03_robin_15` | Edmonton, eh? Shad's town. Let's give him a call. | Edmonton, eh? Shad's town. Let's call him. I'll start with 'not a joke,' or he won't pick up. | yes |
| `w04_robin_01` | Stampede? Yee-haw. | Stampede? YEE-HAW! I practised that all month at camp. The guys asked for a new bunkhouse. | yes |
| `w05_robin_01` | Uh oh. That young bull's spooked. Everybody, back up nice and slow. | Uh oh. That young bull's spooked. Back up nice and slow, folks. No bull. | yes |
| `w05_robin_02` | Fireworks are starting. Bronco's gonna hate this. | Fireworks are starting. Bronco's gonna hate this. That bull's got a shorter fuse than the rockets. | yes |
| `w05_robin_05` | Badlands, here we come. | Badlands, here we come! Dinosaur country. Finally, something older than my jokes. | yes |
| `w06_robin_01` | Vancouver. Better pack an umbrella. | Vancouver. Pack an umbrella, folks. I hear the forecast is un-brella-vable. | yes |
| `w07_robin_03` | Guess he wanted express delivery. | Guess he wanted express delivery. That bug's got a real stamp of approval. | yes |
| `w09_robin_01` | Look at that. First one out the door. | Look at that. First one out the door. That bug's got startup energy. | yes |

The joke pass's first-pass words, for the record: `w02_robin_01` "Must be a sound investment", `w02_robin_02` "I never keep
pancakes waiting", `w03_robin_02` "I knead my breakfast", `w03_robin_03` "I'm on it like a zipper", `w03_robin_11` "I'd
tell a lightning joke, but it might strike out", `w03_robin_14` "Those were un-brie-lievable", `w03_robin_15` "He works
construction, he'll build us a plan", `w04_robin_01` "Hold your horses, I'm coming", `w05_robin_02` "Nobody likes a horse
with a short fuse" (Bronco is a bull), `w05_robin_05` "Don't worry, they're not THAT bad". The escape lines
(`w06_robin_01`, `w07_robin_03`, `w09_robin_01`) keep their first-pass words and clips:
`app/tests/unit/story-lines.test.ts` needs every escape line voiced.

Kept as they are (their clips stay): `w03_robin_06` (the pause Grandpa finally scores), `w03_robin_13` (a quip),
`w03_robin_10` ("You tell me, bud. You're leading."), `w03_robin_12` ("You led, I followed"), `w05_robin_04` (Glitchy
wants to be found) (serious on purpose), and the 32 `jk_*` joke-book lines (already dad jokes).

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

The exact old and new text of all 42 is the `REPLACE` list in `tools/dad-lines.mjs`. In short (the joke pass rewrote
17 of them, marked *; their full text is in `docs/VOICE-TODO-JOKES.md`):
- 7-1 *it only rains there once a year: October to April / sea what it's got · 7-2 *and don't wave back / shore-t /
  rooting for us · 7-3 classic bandit, he even wore the mask · 7-4 mane attractions / mist-ing out · 7-5 the suspense /
  *that bug's really moving up in the world · 7-6 *whatever floats your boat · 7-7 it really sucks me in · 7-8 no
  reaction · 7-fort grouse-ing / *Peak Dad · 7-castle on sail · 7-secret sea-nic route / peaked out.
- 8-1 *I've had jobs like this / bin-ge shopping · 8-2 real low point · 8-3 *it's a sign, bud. Of Toronto, mostly · 8-4
  high-jinks / block his path · 8-5 smells fishy · 8-6 ferry sneaky / *that raccoon swam for it. Cheapskate · 8-7 car-rot
  · 8-8 *I'll be right behind you. Way behind · 8-fort fin-ishing lunch · 8-castle shelf-esteem · 8-secret *no wonder this
  lighthouse is beaming.
- 9-1 *only taxi in town that runs on hay · 9-2 *I'll... find a bridge · 9-3 a step up from walking · 9-4 *my knees call
  this Mount Royal Pain · 9-5 don't fall for it · 9-6 *I'd tell a space joke, but there's no atmosphere · 9-7 *then let's
  circle back and touch base · 9-8 *a firewall? I brought the hose · 9-fort I lean toward liking it · 9-secret *a whole
  city underground? I've been digging the wrong holes.
Every instruction a kid needs (wait for the wave, jump at the edge, the flickering wall...) is still said first.

## New level bubbles: the wheeze-laugh, Mom's reactions, Dad's calls, Grandpa's calls

`wheeze`: Dad starts a joke and can't finish (his face doubled over and shaking, tears, the wobbling subtitle, the
breathy hee-hee-hee sound `SFX.wheeze`), and someone else says the punchline. `laugh`: Mom cracks up. `walkoff`: "Is
that all you do, tell jokes?", her face walks out of the box, and Dad carries on ("...I'll be here all week!").
Never in a boss level, never on a line a kid needs.

The exact text of every bubble is the `ADD_TALK` table in `tools/dad-lines.mjs` (the joke pass's new words are also in
`docs/VOICE-TODO-JOKES.md`). Was -> now:
- 1-3 Dad on the phone (wheeze, the crummy cookie) -> Kinan finishes: "that one's older than you" -> "Dad, that's
  Grandpa's joke. I'm telling him." · 1-7 the blue-berry call -> "Why did the painting go to jail? It was framed! ...Hello?
  Did you hang up? Like a painting?"
- 2-3 the bright students (wheeze) -> "Why can't you trust atoms?" ... Kinan: "...make up everything. Dad, you're on
  speaker. My whole class heard that." · 2-6 the math book -> the cafeteria clock that "goes back four seconds. The camp
  cook didn't laugh either."
- 3-2 the oil and the pumpjack (wheeze) -> Kinan "...for information. Dad. Breathe. Grandpa would give that a two." ·
  3-5 the pumpjack at the doctor (wheeze) -> Kinan "Oh no. I'm turning into you." (unchanged).
- 4-5 the mall rink (wheeze) -> "What do hockey players and magicians have in com—" Chenoa: "...in common? Hat tricks.
  Wow. Bye, Dad." · 4-7 Grandpa's video call: trails -> "A funicular, eh? In my day, we walked up that hill. Both ways.
  Uphill."
- 5-2 the pancake comedian (wheeze) -> Mom laughs: "you told me that on our first date. And I still married you." ·
  5-5 horses say neigh -> "a little hoarse! ...Like your voice, but horse?" -> Mom walks off to the quilts -> "I'll be
  here all week, folks!"
- 6-2 the T-Rex who can't clap (wheeze) -> "What do you call a dinosaur THAT big?" Chenoa: "...SIR. You call it sir. Dad,
  it's standing right behind you." · 6-4 NEW at the fossil dig: "Stand back, bud, I dig for a living. ...They gave me a
  toothbrush." · 6-5 lazy bones ("a fossil that won't clean its room... It's a little you") -> Mom laughs ("Don't tell
  him I laughed") -> NEW Dad: "Too late, hon, I heard! That's going in the notebook. Under 'Rare Events.'"
- 7-3 the trees that leaf (wheeze) -> "How do the trees in Stanley Park get online?" Mom: "...They LOG IN." · 7-7
  dome-inating -> "Hon, what did one magnet say to the other? I find you very attractive." -> Mom walks off to the
  planets -> "I'll be here all week! She'll be back. Opposites attract."
- 8-3 the trash panda on ice (wheeze) -> "Toronto built raccoon-proof garbage bins. And the raccoons said..." Mom:
  "...'Challenge accepted.' Oh, Robin. That was actually funny!" · 8-5 Grandpa's video call: toy story -> the toy brick
  on the stairs, Dad "I was eight!", Grandpa "it's just a stepping stone... Still the best joke you ever told." · 8-7
  the grate day -> nacho cheese -> Mom walks off to the peaches -> Dad on the brie.
- 9-1 the bagel's passport (wheeze) -> "a bagel that can fly?" Kinan: "...a PLANE bagel... Mom, it's happening. I'm
  turning into him." -> Mom laughs · 9-5 the waterfall that waved -> the Biodome's penguins, "Igloos it together!" ->
  Mom walks off to the lookout -> "Tough crowd. Colder than the penguin room." · 9-7 Grandpa's video call: the computer
  virus -> "A startup? In my day, a startup was the tractor in January. Took all morning."

## World 10, the Niagara party joke-off (wired 2026-10-29)

In the 10-castle ending, the beat after Mom joins the team and before the cake comes out (index.html `ARENA_LINES`
`t_w10_gp_03`, `t_w10_dad_02` (Dad's wheeze-laugh face), `t_w10_gp_04`, `t_w10_kinan_05`, then Mom laughs: `t_mf_11`
"(laughing) Okay, okay! Cake's coming, my boy."). Five lines, a tap or Enter skips the beat. It is an ending line, not a
level bubble, so the "never in a boss level" rule for `talk` bubbles is kept. Text only until recorded
(docs/VOICE-TODO-W10.md).

The end of the notebook gag: Dad has kept Grandpa's jokes in a notebook since 3-1; here Grandpa turns out to keep one of
Dad's. His scores went 3, 5, 4; this is the first good one, and he still gets the last word. Wired as the castle ending's joke-off (index.html `t_w10_gp_03`, `t_w10_dad_02`, `t_w10_gp_04`, `t_w10_kinan_05`, then
Mom's laugh `t_mf_11`), five lines in all (the same words are `WORLD10_LATER` in `tools/dad-lines.mjs`):

- GRANDPA: Niagara Falls, Robin. Twelve thousand years of the same routine, and people still clap. Remind you of anyone?
- DAD (the wheeze-laugh face): Okay, Dad. Three-layer cake, my boy's birthday, and the Falls. Look at me... I'm in TIERS.
- GRANDPA: (writing in a little notebook) Eight out of ten. I've kept one of yours since you were eight, son. Don't tell your
  father, Kinan.
- KINAN: 'Robin's jokes. Do not show Robin.' ...Dad! He keeps one TOO!
- MOM (laughing): Okay, okay! Cake's coming, my boy.

## Not rewritten yet

- The classic stages' Dad lines (the legacy stage table in index.html, `<b>DAD:</b>` / `<b>ROBIN:</b>` lines such as
  "Big day, bud. Bring-Your-Kid-to-Work Day..."), voiced from audio/vo2 by their exact text: a new text would lose
  the clip, so they wait for a vo2 re-record pass. Also the end-screen lines ("Well. I always said we needed more
  yard.", "That's one ocean, bud...") are already witty and were left alone.

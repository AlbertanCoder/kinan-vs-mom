# Voice to-do: Dad's and Grandpa's joke pass (2026-10-29)

Shad asked for funnier Dad and Grandpa jokes. Every line below has new words, so its old recording no longer matches.
The full before/after and the running gags are in `docs/DAD-JOKES.md`; the table with every old line is `tools/dad-lines.mjs`.

## Story lines: 21, all recorded (2026-10-30, by the lead: the cast voices below; lengths in `audio/dad-lines.js` D)

Done (2026-10-30): each clip is at `audio/rerecord/<id>.mp3` with its length in the `D` table of `audio/dad-lines.js`
(sw.js precaches it), and `app/tests/e2e/v1-voice-story.spec.ts` is back to its strict version. To change one of these
lines later: re-record that clip, update its length in `D`, and keep the subtitle word for word.

Grandpa's voice: en-US-ChristopherNeural -15% -14Hz (the same as his first clips). Dad, Kinan: the cast voices.
`w03_robin_05` ends in a long silence on purpose (Dad over-pausing): record the setup, then about three seconds of nothing.

id | speaker | new text
---|---|---
w02_robin_01 | DAD | Hey, bud! My radio's beeping. I think it caught a bug. ...Kinan, did you give my radio a bug?
w02_robin_02 | DAD | Bud, the radio's IN my truck. Following it's easy. Hop in, Grandma's expecting us.
w03_robin_02 | DAD | Fort McMurray north. Grandma and Grandpa's first, though. Grandma's got pancakes, Grandpa's got jokes. I've got a pen.
w03_robin_03 | DAD | Jacket, snacks, jacket. Got it, hon. Two jackets. He'll be the coolest kid up there. Well. The warmest.
w03_robin_04 | DAD | Outstanding in his field. Dad, I laughed at that when I was eight. Because I was eight.
w03_grandpa_03 | GRANDPA | And you've been stealing my jokes ever since. Kinan, check your dad's shirt pocket.
w03_kinan_jo1 | KINAN | A little notebook! 'Grandpa's jokes. Do not show Grandpa.' ...Dad.
w03_grandpa_04 | GRANDPA | Three out of ten. I taught you that one in 1987, and you still rush it.
w03_robin_05 | DAD | Fine. Slower. What do you call a cow with a twitch? ... ... ... ... ...
w03_grandpa_jo2 | GRANDPA | Beef jerky. Now it's too long. Watch: cow with no legs? ...Ground beef. Write that down, son.
w03_grandpa_jo4 | GRANDPA | Ha! Now THAT was a pause. Five out of ten. Drive safe, son.
w03_robin_11 | DAD | Storm's rolling in, bud. Stay close. And don't tell your mom. She'll say we needed a third jacket.
w03_robin_14 | DAD | Well, would you look at that. Second-best thing in there, after Grandma's sandwiches. Don't tell her it was close.
w03_robin_15 | DAD | Edmonton, eh? Shad's town. Let's call him. I'll start with 'not a joke,' or he won't pick up.
w04_robin_01 | DAD | Stampede? YEE-HAW! I practised that all month at camp. The guys asked for a new bunkhouse.
gp_w04_pool | GRANDPA | Grandpa on the video call! Wave to Grandpa, Kinan! ...Not you, wave pool. Show-off.
w05_robin_02 | DAD | Fireworks are starting. Bronco's gonna hate this. That bull's got a shorter fuse than the rockets.
gp_w05_dino | GRANDPA | Grandpa on the video call! What do you call a dinosaur with a big vocabulary? A thesaurus.
w05_robin_jo1 | DAD | Oh yeah? What do you call a dinosaur that crashes the car? Tyrannosaurus WRECKS!
gp_w05_dino2 | GRANDPA | Four out of ten. I wrote that one the day you put my truck through the fence.
w05_robin_05 | DAD | Badlands, here we come! Dinosaur country. Finally, something older than my jokes.

Kept with their clips (words unchanged): `w03_robin_01`, `w03_robin_07`, `w03_robin_09`, `w05_robin_01`, the escape lines
`w06_robin_01`, `w07_robin_03`, `w09_robin_01`, Grandma's `w03_robinsmom_jo1`, Grandpa's `w03_grandpa_01`, `_02`, `_05`.

## Level talk lines: 48 with new words (subtitles by design, like every talk bubble; listed for a voice pass)

The swaps (old words in `REPLACE`, `tools/dad-lines.mjs`):

level col | speaker | text
---|---|---
7-1 2 | DAD | Over the mountains, down to the ocean, bud: Vancouver! It only rains there once a year. October to April.
7-2 12 | DAD | Watch the water, bud: when it bubbles, a big wave's coming. Wait, or run past quick! And don't wave back.
7-5 284 | DAD | Next: the gondola up the mountain. Glitchy's heading for the top. That bug's really moving up in the world.
7-6 104 | DAD | Boats tied up all along the dock. Roof to roof, boat to boat, bud! Whatever floats your boat.
7-fort 2 (top area) | DAD | The top of Grouse Mountain! The whole city down there. Look at me, bud. Peak Dad.
8-1 43 | DAD | That one's going the wrong way, bud. Just keep running. I've had jobs like this.
8-3 2 | DAD | Nathan Phillips Square! City Hall's two curved towers, and the big TORONTO sign. It's a sign, bud. Of Toronto, mostly.
8-6 255 | DAD | Back on the ferry, bud. Next stop: Kensington Market! That raccoon swam for it. Cheapskate.
8-8 140 | DAD | Big jumps up here, bud. Run, and jump right at the edge. I'll be right behind you. Way behind.
8-secret 47 | DAD | Look at that view, bud: the city, the CN Tower, the lake. No wonder this lighthouse is beaming.
9-1 17 | DAD | A horse and carriage! Hop up on the roof and ride along, bud. Only taxi in town that runs on hay.
9-2 11 | DAD | A zip line! Jump at the edge and grab the cable, bud. It takes you right across. I'll... find a bridge.
9-4 55 | DAD | Rock stairs! Jump up onto one step, then the next, bud. My knees call this Mount Royal Pain.
9-6 52 | DAD | Too high to jump, bud, but in light gravity you'll float right up it! I'd tell a space joke, but there's no atmosphere.
9-7 109 | DAD | The whiteboard maze, bud! Walk under the hanging ones, hop over the standing ones. Then let's circle back and touch base.
9-8 33 | DAD | See that glowing wall, bud? Wait for it to open, then go: it flickers before it shuts. A firewall? I brought the hose.
9-secret 109 | DAD | Look at that atrium, bud, the sky right through the glass. A whole city underground? I've been digging the wrong holes.

The joke bubbles (`ADD_TALK`, `tools/dad-lines.mjs`; new or rewritten lines only, unchanged lines of the same conversation left out):

level col | speaker | text
---|---|---
1-3 30 | KINAN | ...to the doctor? Because it felt crummy. Dad, that's Grandpa's joke. I'm telling him.
1-7 30 | DAD | Dad again, bud! Why did the painting go to jail? It was framed! ...Hello? Did you hang up? Like a painting?
2-3 30 | DAD | Dad on the phone! Why can't you trust atoms? Because they... hee hee... they... HAHA... I can't— (wheeze)
2-3 30 | KINAN | ...make up everything. Dad, you're on speaker. My whole class heard that.
2-6 30 | DAD | Quick one from camp, bud: why is the cafeteria clock always slow? It goes back four seconds. The camp cook didn't laugh either.
3-2 30 | KINAN | ...for information. Dad. Breathe. Grandpa would give that a two.
4-5 30 | DAD | Dad here, on the phone! What do hockey players and magicians have in... hee... HAHA... in com— I can't— (wheeze)
4-5 30 | CHENOA | ...in common? Hat tricks. Wow. Bye, Dad.
4-7 30 | GRANDPA | Grandpa on the video call! A funicular, eh? In my day, we walked up that hill. Both ways. Uphill.
5-2 30 | MOM | ...a stack-up comedian. Robin, you told me that on our first date. And I still married you. (laugh)
5-5 30 | DAD | What do you call a pony with a sore throat? A little hoarse! Get it? Hoarse? Like your voice, but horse?
6-2 30 | DAD | What do you call a dinosaur THAT big? You call it... hee... HAHA... you call it... I can't— (wheeze)
6-2 30 | CHENOA | ...SIR. You call it sir. Dad, it's standing right behind you.
6-4 2 | DAD | A real fossil dig! Stand back, bud, I dig for a living. ...They gave me a toothbrush. (new bubble)
6-5 30 | DAD | What do you call a fossil that won't clean its room? Lazy bones! Not saying it's you, bud. It's a little you.
6-5 30 | DAD | Too late, hon, I heard! That's going in the notebook. Under 'Rare Events.' (new, after Mom's laugh)
7-3 30 | DAD | How do the trees in Stanley Park get online? They... hee hee... they... HAHA... I can't— (wheeze)
7-3 30 | MOM | ...They LOG IN. Robin, breathe. Kinan, keep running. (laugh)
7-7 30 | DAD | Hon, what did one magnet say to the other? I find you very attractive. ...Get it? Like you and me?
7-7 30 | DAD | ...I'll be here all week! She'll be back. Opposites attract. (after Mom walks off)
8-3 30 | DAD | Toronto built raccoon-proof garbage bins. And the raccoons said... hee hee... they said... HAHA... I can't— (wheeze)
8-3 30 | MOM | ...'Challenge accepted.' Oh, Robin. That was actually funny! (laugh)
8-5 30 | GRANDPA | Grandpa on the video call! Toy bricks, eh? Your dad left one on the stairs once. My foot still remembers.
8-5 30 | DAD | Dad, I was eight! And I said sorry! (new)
8-5 30 | GRANDPA | You said, 'Don't worry, Dad, it's just a stepping stone.' Still the best joke you ever told. (new)
8-7 30 | DAD | What do you call cheese that isn't yours? Nacho cheese! Get it? Not-yo cheese? Because it's not yours?
9-1 30 | DAD | What do you call a bagel that can fly? A... hee hee... HAHA... I can't— (wheeze)
9-1 30 | KINAN | ...a PLANE bagel. Plain? Plane? ...Oh no, I explained it. Mom, it's happening. I'm turning into him.
9-5 30 | DAD | There are penguins in here, bud! How does a penguin build its house? Igloos it together!
9-5 30 | DAD | ...I'll be here all week! Tough crowd. Colder than the penguin room. (after Mom walks off)
9-7 30 | GRANDPA | Grandpa on the video call! A startup? In my day, a startup was the tractor in January. Took all morning.

That is 17 swaps and 31 joke-bubble lines: 48 level lines. With the 21 story lines, 69 lines in all.

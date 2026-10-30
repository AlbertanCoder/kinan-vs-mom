/* DAD (Robin) CRACKS A JOKE ABOUT EVERYTHING (Shad, 2026-10-29: "Robin has to make a joke about everything: dad
   jokes, witty humour, puns, always cracking jokes and trying to be funny, identical to how he is in real life").
   Plus GRANDPA (Dad's dad, 92, the king of dad jokes), Dad's WHEEZE-LAUGH and MOM'S REACTIONS.
   The table, with every old line. Where each part lives in the game (app/tests/unit/dad-lines.test.ts checks it):
     audio/dad-lines.js           the story-line overlay, loaded after audio/lines/lines.js (which stays exactly what
                                  tools/story-lines.mjs makes from the voice script): STORY_REWRITE, STORY_ADD, GROUPS, JOKE_MORE
     the level files, index.html  talk bubbles and boss/toast lines (REPLACE, ADD_TALK)
     docs/DAD-JOKES.md            old -> new, and the ids that need a new recording
   A rewritten line that had a recording plays as a subtitle only until its new clip is dropped in at
   audio/rerecord/<id>.mp3 (story lines) or audio/voice/<id>.mp3 (boss lines; then take the `true` off).
   About 1 line in 10 stays serious on purpose (letting Kinan lead, being proud of him). */

/* ---- the story lines (Worlds 2-9 voice script): id -> [old, new]. Every one of these had a recording. ---- */
export const STORY_REWRITE = {
  w02_robin_01: ["Hey, bud! Why's my radio beeping? ...Kinan, why is my radio beeping?", "Hey, bud! My radio's beeping. Must be a sound investment. ...Kinan, why is it beeping?"],
  w02_robin_02: ["Hop in. Grandma's expecting us anyway.", "Hop in. Grandma's expecting us, and I never keep pancakes waiting."],
  w03_robin_01: ["Okay, bud. The beeping's heading north. Way north.", "Okay, bud. The beeping's heading north. I won't beep around the bush: way north."],
  w03_robin_02: ["Fort McMurray north. Good thing we're stopping at Grandma and Grandpa's first.", "Fort McMurray north. Grandma and Grandpa's first, though. I knead my breakfast."],
  w03_robin_03: ["Jacket, snacks, jacket. Got it, hon.", "Jacket, snacks, jacket. Got it, hon. I'm on it like a zipper."],
  w03_robin_07: ["Camp kitchen's gone nuts. Stay in the truck, bud.", "Camp kitchen's gone nuts. Total breakfast scramble. Stay in the truck, bud."],
  w03_robin_09: ["That's my truck. Hang on, I'll lift you up with the suction hose.", "That's my truck! Hang on, I'll lift you with the hose. This job really sucks. In a good way."],
  w03_robin_11: ["Storm's rolling in. Stay close, bud.", "Storm's rolling in, bud. Stay close. I'd tell a lightning joke, but it might strike out."],
  w03_robin_14: ["Well, would you look at that. Second-best thing in there, after Grandma's sandwiches.", "Well, look at that. Second-best thing in there, after Grandma's sandwiches. Those were un-brie-lievable."],
  w03_robin_15: ["Edmonton, eh? Shad's town. Let's give him a call.", "Edmonton, eh? Shad's town. Let's call him. He works construction, he'll build us a plan."],
  w04_robin_01: ["Stampede? Yee-haw.", "Stampede? Yee-haw! Hold your horses, I'm coming."],
  w05_robin_01: ["Uh oh. That young bull's spooked. Everybody, back up nice and slow.", "Uh oh. That young bull's spooked. Back up nice and slow, folks. No bull."],
  w05_robin_02: ["Fireworks are starting. Bronco's gonna hate this.", "Fireworks are starting. Bronco's gonna hate this. Nobody likes a horse with a short fuse."],
  w05_robin_05: ["Badlands, here we come.", "Badlands, here we come! Don't worry, they're not THAT bad."],
  w06_robin_01: ["Vancouver. Better pack an umbrella.", "Vancouver. Pack an umbrella, folks. I hear the forecast is un-brella-vable."],
  w07_robin_03: ["Guess he wanted express delivery.", "Guess he wanted express delivery. That bug's got a real stamp of approval."],
  w09_robin_01: ["Look at that. First one out the door.", "Look at that. First one out the door. That bug's got startup energy."]
};
/* kept as they are, on purpose (no new recording): already a joke or a quip, or one of the serious ~10% */
export const STORY_KEEP = {
  w03_robin_04: 'already a joke (the scarecrow punchline)', w03_robin_05: 'already a joke (beef jerky)', w03_robin_06: 'already a quip',
  w03_robin_10: 'serious on purpose: letting Kinan lead', w03_robin_12: 'serious on purpose: "You led, I followed"',
  w03_robin_13: 'already a quip ("who else is gonna keep you guys laughing?")', w05_robin_04: 'serious on purpose: Glitchy wants to be found',
  'jk_*': 'the 32 joke-book lines are already dad jokes'
};

/* ---- new story lines (no recording yet: subtitles until the lead records them) ---- */
export const STORY_ADD = {
  w03_kinan_jo1: ['kinan', 'Oh no. Now we know where Dad gets it.'],
  w03_grandpa_jo2: ['grandpa', 'What do you call a cow with no legs? Ground beef!'],
  w03_robinsmom_jo1: ['robinsmom', 'Oh, you two. Kinan, run, before they start on the chickens.'],
  gp_w04_pool: ['grandpa', "Grandpa here, on the video call! Why don't waterparks get boring? There's always a new wave!"],
  gp_w05_dino: ['grandpa', "It's Grandpa on the video call! What do you call a dinosaur that tells jokes? A pun-osaurus!"]
};

/* ---- who says what, where (replaces what the voice script's moments give these groups) ----
   no conversation over 5 lines (Shad, 2026-10-29): the long ones are cut to their best lines, every story fact kept */
export const GROUPS = {
  intro: {
    1: ['w01_kinan_01', 'w01_kinan_02', 'w01_kinan_03', 'w01_mom_01', 'w01_mom_02'],                 /* was 8 (Shad's "did you open it", Glitchy's beep, the socks line cut) */
    2: ['w02_kinan_01', 'w02_shad_01', 'w02_milo_01', 'w02_aiden_01', 'w02_kinan_02'],               /* was 6 (Glitchy's beep cut) */
    4: ['w04_kinan_01', 'w04_shad_02', 'w04_kinan_02', 'w04_annie_01', 'w04_annie_pa01'],            /* was 7 (Shad's hello and "hold that thought" cut) */
    5: ['w05_kinan_01', 'w05_robin_01', 'w05_kinan_02', 'w05_annie_01', 'w05_annie_pa01']            /* was 8 (Chenoa's "stay together", Glitchy, Aiden's hello cut) */
  },
  /* 3-1, Grandma and Grandpa's at Onion Lake: the joke-off (was one 10-line opener) */
  open: { '3-1': ['w03_robinsmom_01', 'w03_grandpa_01', 'w03_robin_04', 'w03_grandpa_03', 'w03_kinan_jo1'] },
  clear: { '3-1': ['w03_robinsmom_02', 'w03_grandpa_05', 'w03_robin_06'] },
  /* two of the hidden Dad jokes become Grandpa's, on a video call */
  joke: { '4-4': 'gp_w04_pool', '5-6': 'gp_w05_dino' }
};
/* after a level's joke (at the checkpoint): the joke-off goes on */
export const JOKE_MORE = { '3-1': ['w03_grandpa_04', 'w03_robin_05', 'w03_grandpa_jo2', 'w03_robinsmom_jo1'] };

/* ---- exact text swaps in the game files: [file, old, new, note] ---- */
export const REPLACE = [
  /* boss fights (index.html ARENA_LINES): recorded ones go subtitle-only (the trailing `true`) until re-recorded */
  ['index.html', `w03_robin_08: ['DAD', "Easy, big fella. Easy. Don't fight him, Kinan. Calm him down.", 7.03],`,
    `w03_robin_08: ['DAD', "Easy, big fella. Don't fight him, Kinan. Calm him down. He's just moose-understood.", 8.4],`, 'voiced: w03_robin_08'],
  ['index.html', `w05_robin_03: ['DAD', "Look at that. He's calming down. You did that, bud.", 5.35],`,
    `w05_robin_03: ['DAD', "Look at that, he's calming down. You did that, bud. That's un-bull-ievable.", 7.1],`, 'voiced: w05_robin_03'],
  ['index.html', `t_w7_dad_01: ['DAD', 'Careful, bud. That shiny slime on the snow is slippery!', 3, true],`,
    `t_w7_dad_01: ['DAD', "Careful, bud, that shiny slime is slippery! Don't let this slug get you down.", 3.4, true],`, 'boss line t_w7_dad_01'],
  /* the Dad helper's toasts and the rig fight */
  ['index.html', `pick(['Just got back from camp, bud! Eat this burger 🍔', 'Nobody beats up the birthday boy! 🍔', "Dad's home from the oilfield! Hearts refilled! 🍔"])`,
    `pick(["Back from camp, bud! This burger's a real patty-cake 🍔", 'Nobody beats up the birthday boy! Not on my grill-watch 🍔', "Dad's home from the oilfield! Hearts refilled, and that's crude-ly honest 🍔"])`, 'toast'],
  ['index.html', `'A little something to keep you going! 🍔 +'`, `'A little something to keep you going! Bun appetit! 🍔 +'`, 'toast (Mom says it too: a pun for both)'],
  ['index.html', `'<b>ROBIN:</b> DAD SPECIAL! Hydro vac! 💨 Stand back, bud!'`, `'<b>ROBIN:</b> DAD SPECIAL! Hydro vac! 💨 Stand back, bud, this really sucks!'`, 'toast'],
  ['index.html', `pick(['Hydro vac, ON!', 'Here comes the suck!', 'Hold on to your hard hat!'])`,
    `pick(['Hydro vac, ON! Prepare to be im-pressed!', 'Here comes the suck! Nothing personal, mud.', 'Hold on to your hard hat! Safety first, puns second!'])`, 'toast (the rig fight)'],
  ['index.html', `'<b>DAD:</b> Oops. That is a LOT of mud. My bad!'`, `'<b>DAD:</b> Oops. That is a LOT of mud. Guess I really dug myself in!'`, 'toast (the rig fight)'],
  /* World 7: Vancouver */
  ['levels/w07/secret.js', `'The Sea-to-Sky Highway. The ocean on one side and the mountains on the other!'`, `'The Sea-to-Sky Highway! Ocean on one side, mountains on the other. Talk about a sea-nic route!'`],
  ['levels/w07/secret.js', `'Back down the mountain, bud. Time to find Glitchy in the city.'`, `"Back down the mountain, bud. Let's find Glitchy in the city. I'm all peaked out anyway."`],
  ['levels/w07/l08.js', `'Main Street station. That was the science dome right there!'`, `"Main Street station! That was the science dome. I'd tell a chemistry joke, but I'd get no reaction."`],
  ['levels/w07/l07.js', `'I could spend all day at the vacuum exhibit. For work. Totally for work.'`, `'I could spend all day at the vacuum exhibit. For work. It really sucks me in.'`],
  ['levels/w07/l06.js', `'Boats tied up all along the dock. Roof to roof, boat to boat, bud!'`, `'Boats tied up all along the dock. Roof to roof, boat to boat, bud! Sea what I did there?'`],
  ['levels/w07/l02.js', `'Watch the water, bud. When it bubbles, a big wave is coming: wait, or run past quick!'`, `"Watch the water, bud: when it bubbles, a big wave's coming. Wait, or run past quick! Don't get swept up."`],
  ['levels/w07/l02.js', `'Third Beach! I swam here when I was your age. The water was SO cold.'`, `'Third Beach! I swam here at your age. The water was SO cold, I kept it shore-t.'`],
  ['levels/w07/l02.js', `'The totem poles at Brockton Point. Next stop: the big trees!'`, `"The totem poles at Brockton Point! Next stop: the big trees. I'm rooting for us."`],
  ['levels/w07/l01.js', `"Over the mountains and down to the ocean. Vancouver's at the bottom of this highway, bud."`, `"Over the mountains, down to the ocean, bud. Vancouver's at the bottom. It's all downhill from here!"`],
  ['levels/w07/l01.js', `'Welcome to Vancouver! First stop: the ocean.'`, `"Welcome to Vancouver! First stop: the ocean. Let's sea what it's got."`],
  ['levels/w07/l05.js', `'It sags in the middle, bud. Run down, jump the hole, climb up the other side.'`, `'It sags in the middle, bud. Run down, jump the hole, climb up the other side. The suspense is killing me!'`],
  ['levels/w07/l05.js', `'Next: up the mountain on the gondola. Glitchy is heading for the top!'`, `"Next: the gondola up the mountain. Glitchy's heading for the top. That bug has peak energy."`],
  ['levels/w07/fort.js', `"Grouse Mountain! We take the gondola to the top. Or you can hike the steep trail. It's basically stairs. For an hour."`, `"Grouse Mountain! Gondola, or the steep trail? The trail is stairs. For an hour. I'm not grouse-ing, just saying."`],
  ['levels/w07/fort.js', `'The top of Grouse Mountain. You can see the whole city from up here!'`, `"The top of Grouse Mountain! The whole city down there. I'm on top of the world. And a mountain."`],
  ['levels/w07/l04.js', `"Out of the park and over the Lions Gate Bridge. Hold on to your hood, it's windy up there!"`, `"Over the Lions Gate Bridge! Hold on to your hood, it's windy up there. This bridge has mane attractions."`],
  ['levels/w07/l04.js', `'See the canyon up there? That little rain cloud went that way too.'`, `'See the canyon up there? That little rain cloud went that way too. Typical cloud, always mist-ing out.'`],
  ['levels/w07/l03.js', `"A raccoon just took my sandwich. That's fine. I wasn't hungry."`, `'A raccoon just took my sandwich! Classic bandit. He even wore the mask.'`],
  ['levels/w07/castle.js', `'The cruise-ship terminal roof! Up you go, bud. It looks like big white sails.'`, `'The cruise-ship terminal roof! Up you go, bud. Those big white sails? Totally on sail.'`],
  /* World 8: Toronto */
  ['levels/w08/secret.js', `'Look at that view, bud. The whole city, the CN Tower and the lake. Worth the climb.'`, `"Look at that view, bud: the city, the CN Tower, the lake. I'd say it's tower-ific."`],
  ['levels/w08/l08.js', `'Big jumps up here, bud. Run, and jump right at the edge.'`, `'Big jumps up here, bud. Run, and jump right at the edge. Edge-ucation matters.'`],
  ['levels/w08/l07.js', `'That car is covered in plants! A whole garden on a car, bud.'`, `'That car is covered in plants! A whole garden on wheels, bud. Talk about a car-rot.'`],
  ['levels/w08/l06.js', `'All aboard the ferry to the Toronto Islands! The raccoon snuck on board with Glitchy.'`, `'All aboard the ferry to the Toronto Islands! The raccoon snuck on with Glitchy. Ferry sneaky.'`],
  ['levels/w08/l06.js', `'Back on the ferry, bud. That raccoon swam for it! Next stop: Kensington Market.'`, `'Back on the ferry, bud. That raccoon swam for it! Next stop: Kensington Market. Shore thing.'`],
  ['levels/w08/l03.js', `'Nathan Phillips Square! That is City Hall: two curved towers. And look, the big TORONTO sign!'`, `"Nathan Phillips Square! City Hall's two curved towers, and the big TORONTO sign. Very sign-ificant."`],
  ['levels/w08/l01.js', `"That one's going the wrong way, bud. Just keep running."`, `"That one's going the wrong way, bud. Just keep running. It's a walk in the park, backwards."`],
  ['levels/w08/l01.js', `'Welcome to Toronto, everybody. Now where did that raccoon go?'`, `"Welcome to Toronto, everybody! Now where'd that raccoon go? Probably out bin-ge shopping."`],
  ['levels/w08/fort.js', `'Ride the moving walkway, bud. The sharks are on the other side of the glass.'`, `"Ride the moving walkway, bud. The sharks are behind the glass. They're just fin-ishing lunch."`],
  ['levels/w08/l04.js', `'The CN Tower! Five hundred and fifty-three metres tall. And the raccoon went all the way UP.'`, `'The CN Tower! Five hundred and fifty-three metres. The raccoon went all the way UP. Talk about high-jinks!'`],
  ['levels/w08/l04.js', `'That raccoon is heading for the toy store on the corner. Come on, bud.'`, `"That raccoon is heading for the toy store on the corner. Come on, bud, let's block his path."`],
  ['levels/w08/l02.js', `"The Bloor Viaduct! There's a whole valley under us, bud. Don't look down."`, `"The Bloor Viaduct! A whole valley under us, bud. Don't look down. I did. Real low point."`],
  ['levels/w08/l05.js', `'The raccoon ran out the back door, toward the aquarium!'`, `'The raccoon ran out the back door, toward the aquarium! Something smells fishy.'`],
  ['levels/w08/castle.js', `'Hop over that old bookcase, bud. And watch your head in this passage.'`, `'Hop over that old bookcase, bud, and watch your head in this passage. This castle has great shelf-esteem.'`],
  /* World 9: Montreal */
  ['levels/w09/l02.js', `'A zip line! Jump up at the edge and grab the cable, bud. It takes you right across.'`, `'A zip line! Jump at the edge and grab the cable, bud. It takes you right across. Zip it and ship it!'`],
  ['levels/w09/secret.js', `'Look at that atrium, bud. The sky is right up there through the glass.'`, `"Look at that atrium, bud. The sky's right up there through the glass. Clear skies, guaranteed."`],
  ['levels/w09/l01.js', `'A horse and carriage! Hop up on the roof and ride along, bud.'`, `'A horse and carriage! Hop up on the roof and ride along, bud. Neigh problem.'`],
  ['levels/w09/l08.js', `'See that glowing wall, bud? Wait for it to open, then go. It flickers before it shuts.'`, `'See that glowing wall, bud? Wait for it to open, then go. It flickers before it shuts. Very wall-mannered.'`],
  ['levels/w09/fort.js', `"It's the tallest leaning tower in the world, bud. The whole climb is tilted!"`, `"The tallest leaning tower in the world, bud! The whole climb is tilted. I lean toward liking it."`],
  ['levels/w09/l07.js', `'The whiteboard maze, bud! Walk under the hanging ones, hop over the standing ones.'`, `'The whiteboard maze, bud! Walk under the hanging ones, hop over the standing ones. Mark my words.'`],
  ['levels/w09/l04.js', `'Rock stairs! Jump up onto one step, then the next, bud.'`, `'Rock stairs! Jump up onto one step, then the next, bud. This mountain rocks.'`],
  ['levels/w09/l03.js', `'A long escalator down to the platform. Stand still and it carries you, bud.'`, `"A long escalator down to the platform. Stand still and it carries you, bud. It's a step up from walking."`],
  ['levels/w09/l06.js', `"That wall is way too high for a normal jump, bud. In light gravity you'll float right up it!"`, `"That wall's way too high for a normal jump, bud. In light gravity you'll float right up it! Very uplifting."`],
  ['levels/w09/l05.js', `"The floor's wet by the waterfall, bud. Slippery! It's hard to stop."`, `"The floor's wet by the waterfall, bud. Slippery! It's hard to stop. Don't fall for it."`]
];

/* ---- new bubbles in the levels: [col, 'WHO', 'text', seconds, fx?] (fx: 'wheeze' Dad laughs too hard to finish,
   'laugh' Mom cracks up, 'walkoff' Mom has had enough and walks off). Never in a boss level, never a line a kid needs.
   Dad is away at the oilfield in Worlds 1-2: he calls. Grandpa video-calls now and then. ---- */
export const ADD_TALK = {
  'levels/w01/l03.js': [[30, 'DAD', "Hi bud, it's Dad on the phone from camp! Why did the cookie go to the... hee... HAHA... the... I can't—", 4.4, 'wheeze'],
    [30, 'KINAN', "...to the doctor? Because it felt crummy. Dad, that one's older than you.", 3.6]],
  'levels/w01/l07.js': [[30, 'DAD', "Dad again, bud! What do you call a sad strawberry? A blue-berry! ...Hello? Did you hang up?", 4.4]],
  'levels/w02/l03.js': [[30, 'DAD', "Dad on the phone! Why did the teacher wear sunglasses? Her students were so... hee... HAHA... bri— I can't—", 4.4, 'wheeze'],
    [30, 'KINAN', '...so BRIGHT. Dad, I am literally at school right now.', 3.2]],
  'levels/w02/l06.js': [[30, 'DAD', "Quick one from camp, bud: why was the math book sad? Too many problems. Like your dad's jokes. Kidding!", 4.6]],
  'levels/w03/l02.js': [[30, 'DAD', 'What did the oil say to the pumpjack? Stop... hee hee... stop... HAHA... stop pumping me for... I can\'t—', 4.4, 'wheeze'],
    [30, 'KINAN', '...for information. Dad. Breathe.', 2.6]],
  'levels/w03/l05.js': [[30, 'DAD', 'Why did the pumpjack go to the... hee... HAHA... the... oh boy... the... I can\'t—', 4, 'wheeze'],
    [30, 'KINAN', "...to the doctor? It wasn't feeling well. Get it? WELL? ...Oh no. I'm turning into you.", 4]],
  'levels/w04/l05.js': [[30, 'DAD', "Dad here, on the phone! Why did the mall get a skating rink? It wanted to break the... hee... HAHA... I can't—", 4.4, 'wheeze'],
    [30, 'CHENOA', '...to break the ice. Wow. Bye, Dad.', 2.6]],
  'levels/w04/l07.js': [[30, 'GRANDPA', "Grandpa on the video call! Why don't trails ever argue? They always go their own way! Tell your dad I'm still funnier.", 4.8]],
  'levels/w05/l02.js': [[30, 'DAD', "Pancake breakfast! You know what I call a pancake that... hee... HAHA... that tells... I can't—", 4, 'wheeze'],
    [30, 'MOM', '...a stack-up comedian. Robin. You told me that one on our first date.', 3.6, 'laugh']],
  'levels/w05/l05.js': [[30, 'DAD', "Why don't horses ever win at cards? They always say neigh! Get it? Neigh? Like no, but horse?", 4],
    [30, 'MOM', 'Is that all you do, tell jokes? ...I am going to look at the quilts.', 3.4, 'walkoff'],
    [30, 'DAD', "...I'll be here all week, folks! Stampede's ten days, actually.", 3.2]],
  'levels/w06/l02.js': [[30, 'DAD', "Why did the T-Rex never clap? Because his... hee hee... his arms are... HAHA... I can't—", 4, 'wheeze'],
    [30, 'CHENOA', '...too short. Dad, the dinosaur was right there. You had ONE job.', 3.4]],
  'levels/w06/l05.js': [[30, 'DAD', "What do you call a fossil that won't work? Lazy bones! ...Come on, that's a classic. Like a fossil.", 4],
    [30, 'MOM', "Ha! Oh no, I laughed. Don't tell him I laughed.", 3, 'laugh']],
  'levels/w07/l03.js': [[30, 'DAD', 'Why are trees in Stanley Park so good at parties? Because they really know how to... hee... HAHA... leave— I can\'t—', 4.4, 'wheeze'],
    [30, 'MOM', '...how to LEAF. Robin, breathe. Kinan, keep running.', 3.2, 'laugh']],
  'levels/w07/l07.js': [[30, 'DAD', "What did the science dome say to the rain? You're dome-inating the weather! Get it? Dome?", 3.8],
    [30, 'MOM', 'Is that all you do, tell jokes? I am going to see the planets. Without you.', 3.4, 'walkoff'],
    [30, 'DAD', "...I'll be here all week! Science World's open till five.", 3]],
  'levels/w08/l03.js': [[30, 'DAD', 'What do you call a skating raccoon? A... hee hee... a trash... HAHA... a trash... I can\'t—', 4, 'wheeze'],
    [30, 'MOM', '...a trash panda on ice. Oh, Robin. That was actually funny!', 3.4, 'laugh']],
  'levels/w08/l07.js': [[30, 'DAD', "Why did the cheese shop close early? It was having a grate day! Get it? Grate? Like grated cheese?", 4],
    [30, 'MOM', 'Is that all you do, tell jokes? Peaches. I am going to look at peaches.', 3.4, 'walkoff'],
    [30, 'DAD', "...I'll be here all week, folks! Try the brie, it's un-brie-lievable!", 3.2]],
  'levels/w08/l05.js': [[30, 'GRANDPA', "Grandpa on the video call! What do you call a toy that's lost? A toy story! ...Tell your dad that one's mine.", 4.6]],
  'levels/w09/l01.js': [[30, 'DAD', 'Why did the bagel get a passport? Because it wanted to... hee... HAHA... to see the... I can\'t—', 4, 'wheeze'],
    [30, 'KINAN', '...to see the WORLD. Because it\'s round, Mom. That\'s the joke.', 3.2],
    [30, 'MOM', 'Ha! Oh, I love you two. Go, go, Glitchy is getting away!', 3, 'laugh']],
  'levels/w09/l05.js': [[30, 'DAD', "What did the waterfall say to the rock? Nothing, it just waved! Then it fell for it. Waterfall humour.", 4],
    [30, 'MOM', 'Is that all you do, tell jokes? I am going to the lookout. Alone. With quiet.', 3.4, 'walkoff'],
    [30, 'DAD', "...I'll be here all week! Well, till Thursday. Montreal's busy.", 3]],
  'levels/w09/l07.js': [[30, 'GRANDPA', "Grandpa on the video call! Why did the computer go to the doctor? It had a virus! I've had that one since 1962.", 4.8]]
};

/* World 10 (built later): the Niagara party joke-off. Written here, wired with World 10. */
export const WORLD10_LATER = [
  ['GRANDPA', "Robin! Why did Niagara Falls never get a job? It was always taking a plunge!"],
  ['DAD', "Oh yeah? Why is the Falls so friendly? It's always making a big splash! ...Dad, you're dripping."],
  ['GRANDPA', "Of course I'm dripping. I'm the king of falls jokes. Kinan, tell him."],
  ['KINAN', "Mom, they're doing it again. Cake. Somebody bring cake."]
];

/* DAD CRACKS A JOKE ABOUT EVERYTHING (Shad, 2026-10-29). The story-line overlay, loaded right after
   audio/lines/lines.js (index.html, sw.js). lines.js stays exactly what tools/story-lines.mjs makes from the voice
   script; this file turns Dad's lines into jokes, adds Grandpa's joke-off lines, cuts the long conversations to
   5 lines or fewer and sets 3-1's joke-off. The same table, with each old line, is tools/dad-lines.mjs (checked
   by app/tests/unit/dad-lines.test.ts; the full list is docs/DAD-JOKES.md).
   A rewritten line had a recording of its OLD words, so it plays as a subtitle only until its new clip is in:
   drop it at audio/rerecord/<id>.mp3 and add the id with its length to D below (REC is D's ids; sw.js then precaches it too). */
(function (S, F) {
  if (!S) return;
  var pace = function (t) { return Math.max(2.2, Math.round((t.split(/\s+/).length * 0.4 + 1) * 10) / 10); };
  var R = {
    w02_robin_01: "Hey, bud! My radio's beeping. I think it caught a bug. ...Kinan, did you give my radio a bug?",
    w02_robin_02: "Bud, the radio's IN my truck. Following it's easy. Hop in, Grandma's expecting us.",
    w03_robin_01: "Okay, bud. The beeping's heading north. I won't beep around the bush: way north.",
    w03_robin_02: "Fort McMurray north. Grandma and Grandpa's first, though. Grandma's got pancakes, Grandpa's got jokes. I've got a pen.",
    w03_robin_03: "Jacket, snacks, jacket. Got it, hon. Two jackets. He'll be the coolest kid up there. Well. The warmest.",
    w03_robin_04: "Outstanding in his field. Dad, I laughed at that when I was eight. Because I was eight.",
    w03_robin_05: "Fine. Slower. What do you call a cow with a twitch? ... ... ... ... ...",
    w03_robin_07: "Camp kitchen's gone nuts. Total breakfast scramble. Stay in the truck, bud.",
    w03_robin_09: "That's my truck! Hang on, I'll lift you with the hose. This job really sucks. In a good way.",
    w03_robin_11: "Storm's rolling in, bud. Stay close. And don't tell your mom. She'll say we needed a third jacket.",
    w03_robin_14: "Well, would you look at that. Second-best thing in there, after Grandma's sandwiches. Don't tell her it was close.",
    w03_robin_15: "Edmonton, eh? Shad's town. Let's call him. I'll start with 'not a joke,' or he won't pick up.",
    w04_robin_01: "Stampede? YEE-HAW! I practised that all month at camp. The guys asked for a new bunkhouse.",
    w05_robin_01: "Uh oh. That young bull's spooked. Back up nice and slow, folks. No bull.",
    w05_robin_02: "Fireworks are starting. Bronco's gonna hate this. That bull's got a shorter fuse than the rockets.",
    w05_robin_05: "Badlands, here we come! Dinosaur country. Finally, something older than my jokes.",
    w06_robin_01: "Vancouver. Pack an umbrella, folks. I hear the forecast is un-brella-vable.",
    w07_robin_03: "Guess he wanted express delivery. That bug's got a real stamp of approval.",
    w09_robin_01: "Look at that. First one out the door. That bug's got startup energy."
  };
  /* new lines, and Grandpa's 3-1 lines with new words (same id: the new clip goes to audio/rerecord/<id>.mp3) */
  var A = {
    w03_grandpa_03: ['GRANDPA', "And you've been stealing my jokes ever since. Kinan, check your dad's shirt pocket."],
    w03_kinan_jo1: ['KINAN', "A little notebook! 'Grandpa's jokes. Do not show Grandpa.' ...Dad."],
    w03_grandpa_04: ['GRANDPA', 'Three out of ten. I taught you that one in 1987, and you still rush it.'],
    w03_grandpa_jo2: ['GRANDPA', "Beef jerky. Now it's too long. Watch: cow with no legs? ...Ground beef. Write that down, son."],
    w03_robinsmom_jo1: ['GRANDMA', 'Oh, you two. Kinan, run, before they start on the chickens.'],
    w03_grandpa_jo4: ['GRANDPA', 'Ha! Now THAT was a pause. Five out of ten. Drive safe, son.'],
    gp_w04_pool: ['GRANDPA', 'Grandpa on the video call! Wave to Grandpa, Kinan! ...Not you, wave pool. Show-off.'],
    gp_w05_dino: ['GRANDPA', 'Grandpa on the video call! What do you call a dinosaur with a big vocabulary? A thesaurus.'],
    w05_robin_jo1: ['DAD', 'Oh yeah? What do you call a dinosaur that crashes the car? Tyrannosaurus WRECKS!'],
    gp_w05_dino2: ['GRANDPA', 'Four out of ten. I wrote that one the day you put my truck through the fence.']
  };
  var G = {
    intro: {
      1: ['w01_kinan_01', 'w01_kinan_02', 'w01_kinan_03', 'w01_mom_01', 'w01_mom_02'],
      2: ['w02_kinan_01', 'w02_shad_01', 'w02_milo_01', 'w02_aiden_01', 'w02_kinan_02'],
      4: ['w04_kinan_01', 'w04_shad_02', 'w04_kinan_02', 'w04_annie_01', 'w04_annie_pa01'],
      5: ['w05_kinan_01', 'w05_robin_01', 'w05_kinan_02', 'w05_annie_01', 'w05_annie_pa01']
    },
    open: { '3-1': ['w03_robinsmom_01', 'w03_grandpa_01', 'w03_robin_04', 'w03_grandpa_03', 'w03_kinan_jo1'] },
    clear: { '3-1': ['w03_robinsmom_02', 'w03_grandpa_05', 'w03_robin_06', 'w03_grandpa_jo4'] },   /* Grandpa gets the last word */
    joke: { '4-4': 'gp_w04_pool', '5-6': 'gp_w05_dino' }
  };
  /* the recorded clips (2026-10-29, the cast voices; Grandpa en-US-ChristopherNeural -15% -14Hz): id -> seconds. A line with a
     clip plays audio/rerecord/<id>.mp3 and stays up for the clip plus 0.4 s (never under the reading pace).
     The joke pass's 21 lines with new words were recorded on 2026-10-30 (docs/VOICE-TODO-JOKES.md): a line whose words
     change again needs its clip re-recorded and its length updated here. */
  var D = { w03_robin_01: 7.22, w03_robin_07: 6.77, w03_robin_09: 9.02, w05_robin_01: 7.7, w06_robin_01: 7.3, w07_robin_03: 5.86, w09_robin_01: 6.19, w03_robinsmom_jo1: 6.91, w03_grandpa_01: 4.94, w03_grandpa_02: 2.45, w03_grandpa_05: 3.1,
    /* the joke pass, recorded 2026-10-30 (the cast voices) */ w02_robin_01: 8.33, w02_robin_02: 7.46, w03_robin_02: 10.03, w03_robin_03: 10.06, w03_robin_04: 6.82, w03_grandpa_03: 6.86, w03_kinan_jo1: 6.26, w03_grandpa_04: 6.67, w03_robin_05: 8.35, w03_grandpa_jo2: 12.26, w03_grandpa_jo4: 8.64, w03_robin_11: 8.5, w03_robin_14: 8.18, w03_robin_15: 8.21, w04_robin_01: 8.18, gp_w04_pool: 10.06, w05_robin_02: 7.3, gp_w05_dino: 8.59, w05_robin_jo1: 6.74, gp_w05_dino2: 5.88, w05_robin_05: 7.1 };
  var REC = Object.keys(D);
  var id, k, w;
  var was = {};   /* every clip lines.js gave a story line, before the overlay changes any */
  for (id in S.lines) if (S.lines[id][3]) was[S.lines[id][3]] = 1;
  for (id in R) if (S.lines[id]) S.lines[id] = [S.lines[id][0], R[id], pace(R[id]), null];
  for (id in A) S.lines[id] = [A[id][0], A[id][1], pace(A[id][1]), null];
  for (id in D) if (S.lines[id]) { S.lines[id][3] = 'audio/rerecord/' + id + '.mp3'; S.lines[id][2] = Math.max(S.lines[id][2], Math.round((D[id] + 0.4) * 10) / 10); }
  for (k in G) for (w in G[k]) S[k][w] = G[k][w];
  S.jokeMore = {   /* after a level's joke at the checkpoint: the joke-off goes on */
    '3-1': ['w03_grandpa_04', 'w03_robin_05', 'w03_grandpa_jo2', 'w03_robinsmom_jo1'],   /* Grandpa scores it, fixes Dad's timing, steals his punchline */
    '5-6': ['w05_robin_jo1', 'gp_w05_dino2']   /* Grandpa's video call: Dad's comeback, Grandpa's score */
  };
  S.fx = S.fx || {};   /* id -> 'wheeze' | 'laugh' | 'walkoff' (a level's talk bubbles add theirs) */
  /* a line whose words changed or that was re-recorded never plays its old clip again: keep that clip out of the offline cache
     (the joke pass left 19 of them, 543 KB, in the story budget) */
  if (F) { var playing = {}; for (id in S.lines) if (S.lines[id][3]) playing[S.lines[id][3]] = 1;
    for (var j = F.length - 1; j >= 0; j--) if (was[F[j]] && !playing[F[j]] && F[j].indexOf('audio/voice/') !== 0) F.splice(j, 1); }   /* boss clips always stay */
  if (F) for (var i = 0; i < REC.length; i++) F.push('audio/rerecord/' + REC[i] + '.mp3');
})(self.KINAN_STORY, self.KINAN_STORY_FILES);

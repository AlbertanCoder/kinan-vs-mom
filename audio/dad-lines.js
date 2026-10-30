/* DAD CRACKS A JOKE ABOUT EVERYTHING (Shad, 2026-10-29). The story-line overlay, loaded right after
   audio/lines/lines.js (index.html, sw.js). lines.js stays exactly what tools/story-lines.mjs makes from the voice
   script; this file turns Dad's lines into jokes, adds Grandpa's joke-off lines, cuts the long conversations to
   5 lines or fewer and sets 3-1's joke-off. The same table, with each old line, is tools/dad-lines.mjs (checked
   by app/tests/unit/dad-lines.test.ts; the full list is docs/DAD-JOKES.md).
   A rewritten line had a recording of its OLD words, so it plays as a subtitle only until its new clip is in:
   drop it at audio/rerecord/<id>.mp3 and add the id to REC below (sw.js then precaches it too). */
(function (S, F) {
  if (!S) return;
  var pace = function (t) { return Math.max(2.2, Math.round((t.split(/\s+/).length * 0.4 + 1) * 10) / 10); };
  var R = {
    w02_robin_01: "Hey, bud! My radio's beeping. Must be a sound investment. ...Kinan, why is it beeping?",
    w02_robin_02: "Hop in. Grandma's expecting us, and I never keep pancakes waiting.",
    w03_robin_01: "Okay, bud. The beeping's heading north. I won't beep around the bush: way north.",
    w03_robin_02: "Fort McMurray north. Grandma and Grandpa's first, though. I knead my breakfast.",
    w03_robin_03: "Jacket, snacks, jacket. Got it, hon. I'm on it like a zipper.",
    w03_robin_07: "Camp kitchen's gone nuts. Total breakfast scramble. Stay in the truck, bud.",
    w03_robin_09: "That's my truck! Hang on, I'll lift you with the hose. This job really sucks. In a good way.",
    w03_robin_11: "Storm's rolling in, bud. Stay close. I'd tell a lightning joke, but it might strike out.",
    w03_robin_14: "Well, look at that. Second-best thing in there, after Grandma's sandwiches. Those were un-brie-lievable.",
    w03_robin_15: "Edmonton, eh? Shad's town. Let's call him. He works construction, he'll build us a plan.",
    w04_robin_01: "Stampede? Yee-haw! Hold your horses, I'm coming.",
    w05_robin_01: "Uh oh. That young bull's spooked. Back up nice and slow, folks. No bull.",
    w05_robin_02: "Fireworks are starting. Bronco's gonna hate this. Nobody likes a horse with a short fuse.",
    w05_robin_05: "Badlands, here we come! Don't worry, they're not THAT bad.",
    w06_robin_01: "Vancouver. Pack an umbrella, folks. I hear the forecast is un-brella-vable.",
    w07_robin_03: "Guess he wanted express delivery. That bug's got a real stamp of approval.",
    w09_robin_01: "Look at that. First one out the door. That bug's got startup energy."
  };
  var A = {
    w03_kinan_jo1: ['KINAN', 'Oh no. Now we know where Dad gets it.'],
    w03_grandpa_jo2: ['GRANDPA', 'What do you call a cow with no legs? Ground beef!'],
    w03_robinsmom_jo1: ['GRANDMA', 'Oh, you two. Kinan, run, before they start on the chickens.'],
    gp_w04_pool: ['GRANDPA', "Grandpa here, on the video call! Why don't waterparks get boring? There's always a new wave!"],
    gp_w05_dino: ['GRANDPA', "It's Grandpa on the video call! What do you call a dinosaur that tells jokes? A pun-osaurus!"]
  };
  var G = {
    intro: {
      1: ['w01_kinan_01', 'w01_kinan_02', 'w01_kinan_03', 'w01_mom_01', 'w01_mom_02'],
      2: ['w02_kinan_01', 'w02_shad_01', 'w02_milo_01', 'w02_aiden_01', 'w02_kinan_02'],
      4: ['w04_kinan_01', 'w04_shad_02', 'w04_kinan_02', 'w04_annie_01', 'w04_annie_pa01'],
      5: ['w05_kinan_01', 'w05_robin_01', 'w05_kinan_02', 'w05_annie_01', 'w05_annie_pa01']
    },
    open: { '3-1': ['w03_robinsmom_01', 'w03_grandpa_01', 'w03_robin_04', 'w03_grandpa_03', 'w03_kinan_jo1'] },
    clear: { '3-1': ['w03_robinsmom_02', 'w03_grandpa_05', 'w03_robin_06'] },
    joke: { '4-4': 'gp_w04_pool', '5-6': 'gp_w05_dino' }
  };
  /* the recorded clips (2026-10-29, the cast voices; Grandpa en-US-ChristopherNeural -15% -14Hz): id -> seconds. A line with a
     clip plays audio/rerecord/<id>.mp3 and stays up for the clip plus 0.4 s (never under the reading pace) */
  var D = { w02_robin_01: 8.78, w02_robin_02: 6.22, w03_robin_01: 7.22, w03_robin_02: 7.03, w03_robin_03: 6.43, w03_robin_07: 6.77, w03_robin_09: 9.02, w03_robin_11: 8.14, w03_robin_14: 8.42, w03_robin_15: 8.83, w04_robin_01: 5.59, w05_robin_01: 7.7, w05_robin_02: 7.85, w05_robin_05: 5.59, w06_robin_01: 7.3, w07_robin_03: 5.86, w09_robin_01: 6.19, w03_kinan_jo1: 4.3, w03_grandpa_jo2: 5.57, w03_robinsmom_jo1: 6.91, gp_w04_pool: 9.34, gp_w05_dino: 9.36, w03_grandpa_01: 4.94, w03_grandpa_02: 2.45, w03_grandpa_03: 7.85, w03_grandpa_04: 3.98, w03_grandpa_05: 3.1 };
  var REC = Object.keys(D);
  var id, k, w;
  for (id in R) if (S.lines[id]) S.lines[id] = [S.lines[id][0], R[id], pace(R[id]), null];
  for (id in A) S.lines[id] = [A[id][0], A[id][1], pace(A[id][1]), null];
  for (id in D) if (S.lines[id]) { S.lines[id][3] = 'audio/rerecord/' + id + '.mp3'; S.lines[id][2] = Math.max(S.lines[id][2], Math.round((D[id] + 0.4) * 10) / 10); }
  for (k in G) for (w in G[k]) S[k][w] = G[k][w];
  S.jokeMore = { '3-1': ['w03_grandpa_04', 'w03_robin_05', 'w03_grandpa_jo2', 'w03_robinsmom_jo1'] };   /* after 3-1's joke at the checkpoint: the joke-off goes on */
  S.fx = S.fx || {};   /* id -> 'wheeze' | 'laugh' | 'walkoff' (a level's talk bubbles add theirs) */
  if (F) for (var i = 0; i < REC.length; i++) F.push('audio/rerecord/' + REC[i] + '.mp3');
})(self.KINAN_STORY, self.KINAN_STORY_FILES);

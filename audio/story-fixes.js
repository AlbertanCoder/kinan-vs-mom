/* STORY FIXES from the deep audit (2026-11-03; Shad's answers in "Kinan vs Mom - Audit answers 2026-11-03.md").
   Loaded right after audio/dad-lines.js (index.html, sw.js). audio/lines/lines.js stays exactly what tools/story-lines.mjs
   makes; dad-lines.js is Dad's joke pass; this file only fixes story logic the audit found:
   - Glitchy's first real words are World 11's "Th... thank... you." (answer 6): before that he only beeps, a bit more
     expressive each world, and nobody reacts as if he talked.
   - Aiden gets an arrival line in Calgary; Annie answers nobody in World 8's escape.
   - The grandmas are named by their city everywhere (answer 9): GRANDMA (EDMONTON) is Mom's mom, GRANDMA (ONION LAKE)
     is Dad's mom.
   A line whose words change loses its old clip and plays its recording by speaker + words (audio/talk/<hash>.mp3, made by
   tools/rec-all-lines.py; index.html lineClip). A line whose speaker label alone changes keeps its clip (same words). */
(function (S) {
  if (!S || !S.lines) return;
  var pace = function (t) { return Math.max(2.2, Math.round((t.split(/\s+/).length * 0.4 + 1) * 10) / 10); };
  var WORDS = {
    w03_glitchy_01: 'Beep! Bzzt! Bweee!',
    w03_kinan_10: 'Glitchy, wait! ...He jumped into the Edmonton sign!',
    w04_glitchy_01: 'Bweee-HOO! Beep beep!',
    w04_chenoa_09: 'Even the glitch is excited. Everybody in the van!',
    w05_glitchy_02: 'Bwoo-bwoo-BWEEP!',
    w05_aiden_02: 'Kinan! My family came to the Stampede too! Lasso games, watch me!',
    w06_glitchy_02: 'Beep-beep... boop.',
    w07_glitchy_01: 'Bwee-ee-ee-EEP! Beep beep!',
    w08_glitchy_02: 'Toot-toot! Beep!',
    w08_annie_pa01: "Leave it to me, Shad. I'll have it deleted by breakfast.",
    w01_shad_02: "He's headed for the River Castle Hotel, bud. Go, go, go!",   /* answer 19: no real business names */
    jk_w05_7: "I told a joke at the top of the City Tower. Went right over everybody's head.",   /* answer 19, game-wide (5-7 is THE CITY TOWER) */
    /* the story read-through (2026-11-03): the trip is his birthday WEEK; Mom drives down to Calgary; Shad says hi in person */
    w02_kinan_01: "He's in my school? In my birthday week?",
    w05_kinan_01: 'The Stampede! On parade day! And Mom drove down to meet us!',
    w04_shad_02: "It's me, bud, in person this time! ...I'm so sorry. I built that console, and now it's loose all over Canada."
  };
  var WHO = { GRANDMA: 'GRANDMA (ONION LAKE)' };   /* Mom's mom is GRANDMA (EDMONTON) in audio/lines/lines.js itself (tools/story-lines.mjs) */
  var id, d;
  for (id in WORDS) if (S.lines[id]) { d = S.lines[id]; S.lines[id] = [d[0], WORDS[id], Math.max(pace(WORDS[id]), Math.min(d[2], 4)), null]; }
  for (id in S.lines) { d = S.lines[id]; if (WHO[d[0]]) d[0] = WHO[d[0]]; }
  /* World 6's memory gift (age 6), the one hole between age 5 and age 7: the Pop Pad and the Squish Pal in the museum gift
     shop, found at 6-5's LEVEL CLEAR like Worlds 1-5's gifts (Kinan names it, someone sees that Glitchy left it) */
  var ADD = {
    w06_kinan_mem1: ['KINAN', 'The gift shop! My Pop Pad! I popped it the whole way home from here when I was six!'],   /* the level's own gift-shop line came after the find (watch-play 2026-11-04): now one line */
    w06_kinan_mem2: ['KINAN', 'And my Squish Pal stegosaurus! Still squishy!'],
    w06_mom_mem1: ['MOM', 'Right by the door, sweetie. Like he wanted you to find them.']
  };
  for (id in ADD) S.lines[id] = [ADD[id][0], ADD[id][1], pace(ADD[id][1]), null];
  S.clear = S.clear || {};
  if (!S.clear['6-5']) S.clear['6-5'] = Object.keys(ADD);
  self.KINAN_STORY_FIXES = { words: WORDS, who: WHO, added: ADD };
})(self.KINAN_STORY);

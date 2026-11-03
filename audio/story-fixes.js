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
    w01_shad_02: "He's headed for the River Castle Hotel, bud. Go, go, go!"   /* answer 19: no real business names */
  };
  var WHO = { 'GRANDMA HUNTER': 'GRANDMA (EDMONTON)', GRANDMA: 'GRANDMA (ONION LAKE)' };
  var id, d;
  for (id in WORDS) if (S.lines[id]) { d = S.lines[id]; S.lines[id] = [d[0], WORDS[id], Math.max(pace(WORDS[id]), Math.min(d[2], 4)), null]; }
  for (id in S.lines) { d = S.lines[id]; if (WHO[d[0]]) d[0] = WHO[d[0]]; }
  self.KINAN_STORY_FIXES = { words: WORDS, who: WHO };
})(self.KINAN_STORY);

#!/usr/bin/env node
/* Writes audio/lines/: the Worlds 1-5 story lines (Shad's picked voices) the game plays on the
   overworld map and in the level files, plus audio/lines/lines.js (the table index.html reads and
   sw.js precaches). Source: the voice script in the concept folder (613 lines, manifest.json +
   SCRIPT.md). Only the clips a beat below uses are copied.
     node tools/story-lines.mjs [path/to/voices/lines]        rewrite audio/lines/
     node tools/story-lines.mjs --check [path]                exit 1 if audio/lines/ is stale

   Where each line plays (index.html block "STORY LINES"):
     intro[w]   the world intro, on the map the first time Kinan stands in World w
     exit[w]    World w's exit lines, on the map when Kinan first stands in World w+1
     open[id]   a level's opener, at level start (lines after the 2nd only the first time: 3-1's Onion Lake visit)
     clear[id]  once, at that level's LEVEL CLEAR: a pet joining (SCRIPT.md "Joins the team" with a level),
                the world's memory gift (MEMORY_AT), Grandma Hunter's kitchen (4-2), and the castle's
                "joins the team" lines (no level in the script = after the boss)
     joke[id]   Robin's dad joke for that level (Worlds 3-5), at the checkpoint (40% in when there is none)
     bark       Kinan's barks: a golden candle, a secret found, LEVEL CLEAR (only when nothing else talks)
     cutscene   the opening cutscene (block "CUTSCENES"), in the order it plays: the bedroom, then the map (CUTSCENE)
     escape[w]  Worlds 6-10's exit lines, for the end-of-world cutscene once those castles are built (Worlds 1-5 use exit[w])
   A line a boss arena already speaks (ARENA_LINES in index.html) is never an opener, clear line or joke:
   the arena plays it in the fight. Such a line in an intro/exit plays from audio/voice/ (no second copy). */
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const SRC = args.find((a) => !a.startsWith('--')) || 'C:/Users/SHADHUNTER/Desktop/Kinan Map Concept/voices/lines';
const OUT = join(ROOT, 'audio', 'lines');

/* the memory gift of each world sits in this level (story bible "The 11 memory gifts" + the level files' notes) */
const MEMORY_AT = { 1: '1-1', 2: '2-secret', 3: '3-6', 4: '4-2', 5: '5-7' };
/* "Grandma Hunter's kitchen": "His Edmonton Grandma feeds the whole team" after the old neighbourhood (4-2) */
const KITCHEN_AT = '4-2';
const BARKS = { golden: ['gen_kinan_12', 'gen_kinan_13'], secret: ['gen_kinan_11'], clear: ['gen_kinan_22', 'gen_kinan_25', 'gen_kinan_23', 'gen_kinan_21', 'gen_kinan_24'] };
/* the opening cutscene (Shad's picks, 2026-10-28), in playing order: Kinan wakes up, Shad's gift-card message, one
   little peek, Glitchy bursts out, Kinan chases him, Mom in the doorway, out the window; then on the map Kinan calls
   after him and says the mission. The four "Opening cutscene" lines were added to the voice script for this; the rest
   are World 1's intro and exit lines and a general bark (Glitchy's two beeps). */
const CUTSCENE = ['w01_kinan_19', 'w01_shad_05', 'w01_kinan_02', 'w01_glitchy_01', 'w01_kinan_03', 'w01_mom_12', 'w01_glitchy_02', 'gen_kinan_24', 'w01_kinan_20'];
/* the subtitle's name for each speaker. Robin is Kinan's dad, so the subtitles call him DAD */
const LABEL = { kinan: 'KINAN', glitchy: 'GLITCHY', shad: 'SHAD', mom: 'MOM', milo: 'MILO', aiden: 'AIDEN', robin: 'DAD',
  robinsmom: 'GRANDMA', grandpa: 'GRANDPA', annie: 'ANNIE', grandmahunter: 'GRANDMA HUNTER', chenoa: 'CHENOA' };

const manifest = JSON.parse(readFileSync(join(SRC, 'manifest.json'), 'utf8'));
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const arenaBlock = /const ARENA_LINES = \{([\s\S]*?)\n\};/.exec(html);
if (!arenaBlock) throw new Error('ARENA_LINES not found in index.html');
const ARENA = new Set([...arenaBlock[1].matchAll(/^\s+([a-z0-9_]+):\s*\[/gm)].map((m) => m[1]));

/* every level id that has a file (levels/wNN/*.js) */
const LEVEL_IDS = new Set();
for (const w of readdirSync(join(ROOT, 'levels')).filter((d) => /^w\d\d$/.test(d))) {
  for (const f of readdirSync(join(ROOT, 'levels', w)).filter((f) => f.endsWith('.js') && !f.startsWith('_'))) {
    const m = /\bid:\s*'([^']+)'/.exec(readFileSync(join(ROOT, 'levels', w, f), 'utf8'));
    if (m) LEVEL_IDS.add(m[1]);
  }
}
/* "1-6 Bunny Photo Studio" -> '1-6', "Fort: ..." -> '1-fort', "Secret: ..." -> '1-secret', "Castle: ..." -> '1-castle' */
function levelOf(world, where) {
  if (!where || where === 'spare') return null;
  const m = /^(\d+)-(\d+) /.exec(where);
  const id = m ? `${m[1]}-${m[2]}` : /^Fort:/.test(where) ? `${world}-fort` : /^Secret:/.test(where) ? `${world}-secret` : /^Castle:/.test(where) ? `${world}-castle` : null;
  if (!id) throw new Error(`can't place "${where}"`);
  if (!LEVEL_IDS.has(id)) throw new Error(`"${where}" -> ${id}: no level file has that id`);
  return id;
}

const byId = new Map(manifest.entries.map((e) => [e.id, e]));
const lines = {}, used = new Set();
const use = (id) => {
  const e = byId.get(id);
  if (!e) throw new Error(`no line ${id} in the manifest`);
  used.add(id);
  return id;
};
const intro = {}, exit = {}, open = {}, clear = {}, joke = {}, escape = {};
const push = (o, k, id) => { (o[k] = o[k] || []).push(use(id)); };
const memory = {}, kitchen = [], team = {};
for (const e of manifest.entries) {
  const wm = /^w0([1-5])$/.exec(e.world);
  if (wm) {
    const w = Number(wm[1]), mo = e.moment;
    if (mo === 'World intro') push(intro, w, e.id);
    else if (mo === 'World exit') push(exit, w, e.id);
    else if (mo === 'Level starts') { if (!ARENA.has(e.id)) push(open, levelOf(w, e.where), e.id); }
    else if (/^Onion Lake stop/.test(mo)) push(open, levelOf(w, e.where), e.id);
    else if (mo === 'Joins the team') {
      if (ARENA.has(e.id)) continue;
      if (e.where) push(clear, levelOf(w, e.where), e.id); else (team[w] = team[w] || []).push(e.id);
    } else if (/^Memory gift found/.test(mo)) (memory[w] = memory[w] || []).push(e.id);
    else if (/^Grandma Hunter's kitchen/.test(mo)) kitchen.push(e.id);
    continue;
  }
  const em = /^w(0[6-9]|10)$/.exec(e.world);
  if (em && e.moment === 'World exit') { push(escape, Number(em[1]), e.id); continue; }
  const jm = /^World ([345]):/.exec(e.moment);
  if (e.world === 'jokes' && jm && !ARENA.has(e.id)) joke[levelOf(Number(jm[1]), e.where)] = use(e.id);
}
for (const w of Object.keys(memory)) for (const id of memory[w]) push(clear, MEMORY_AT[w], id);
for (const id of kitchen) push(clear, KITCHEN_AT, id);
for (const w of Object.keys(team)) for (const id of team[w]) push(clear, `${w}-castle`, id);
const bark = {};
for (const k of Object.keys(BARKS)) bark[k] = BARKS[k].map(use);
const cutscene = CUTSCENE.map(use);

/* the table: id -> [speaker, subtitle (English: Annie's Punjabi shows its translation), seconds, clip path or null] */
const copies = [];
for (const id of [...used].sort()) {
  const e = byId.get(id);
  const label = LABEL[e.speaker];
  if (!label) throw new Error(`no subtitle name for speaker "${e.speaker}" (${id})`);
  let file = null;
  if (e.file && existsSync(join(SRC, e.file))) {
    const voice = join(ROOT, 'audio', 'voice', `${id}.mp3`);
    if (ARENA.has(id) && existsSync(voice) && readFileSync(voice).equals(readFileSync(join(SRC, e.file)))) file = `audio/voice/${id}.mp3`;
    else { file = `audio/lines/${e.file}`; copies.push([join(SRC, e.file), join(ROOT, file)]); }
  }
  /* no clip (Grandpa has no picked voice yet): the subtitle stays up for a reading pace */
  const secs = file ? Number(e.seconds) : Math.max(2.2, Math.round((e.subtitle.split(/\s+/).length * 0.4 + 1) * 10) / 10);
  lines[id] = [label, e.subtitle, secs, file];
}
const story = { lines, intro, exit, open, clear, joke, bark, cutscene, escape };
/* precached by sw.js: these story clips and the boss-arena clips of Worlds 1-5 (audio/voice/), so Worlds 1-5 talk offline */
const voiceDir = join(ROOT, 'audio', 'voice');
const files = copies.map(([, to]) => to.slice(ROOT.length + 1).replace(/\\/g, '/'))
  .concat(existsSync(voiceDir) ? readdirSync(voiceDir).filter((f) => f.endsWith('.mp3')).map((f) => `audio/voice/${f}`) : [])
  .sort();
const source = [
  '/* GENERATED by `node tools/story-lines.mjs` from the voice script (Kinan Map Concept/voices/lines:',
  '   manifest.json + SCRIPT.md, Shad\'s picked voices). Do not hand-edit: change the tool and re-run it.',
  '   index.html (block "STORY LINES") plays these; sw.js precaches KINAN_STORY_FILES (these clips + audio/voice/).',
  '   lines: id -> [speaker, subtitle, seconds, clip or null (subtitle only)] */',
  'self.KINAN_STORY = ' + JSON.stringify(story, null, 1).replace(/\[\n\s+("[^"\n]*"|[\d.]+|null),\n\s+("[^"\n]*"|[\d.]+|null),\n\s+("[^"\n]*"|[\d.]+|null),\n\s+("[^"\n]*"|[\d.]+|null)\n\s*\]/g, '[$1, $2, $3, $4]') + ';',
  'self.KINAN_STORY_FILES = ' + JSON.stringify(files, null, 1) + ';',
  ''
].join('\n');

const outJs = join(OUT, 'lines.js');
if (CHECK) {
  const stale = !existsSync(outJs) || readFileSync(outJs, 'utf8') !== source || copies.some(([from, to]) => !existsSync(to) || !readFileSync(to).equals(readFileSync(from)));
  if (stale) { console.error('audio/lines/ is stale: run node tools/story-lines.mjs'); process.exit(1); }
  console.log(`audio/lines/ is up to date (${Object.keys(lines).length} lines, ${files.length} clips)`);
} else {
  if (existsSync(OUT)) rmSync(OUT, { recursive: true });
  for (const [from, to] of copies) { mkdirSync(dirname(to), { recursive: true }); copyFileSync(from, to); }
  writeFileSync(outJs, source);
  const bytes = files.reduce((n, f) => n + statSync(join(ROOT, f)).size, 0);
  console.log(`wrote audio/lines/: ${Object.keys(lines).length} lines, ${copies.length} clips copied · precache list ${files.length} clips (with audio/voice/), ${(bytes / 1048576).toFixed(2)} MB` +
    ` · ${Object.keys(open).length} openers · ${Object.keys(clear).length} level clears · ${Object.keys(joke).length} jokes` +
    ` · subtitle only: ${Object.keys(lines).filter((id) => !lines[id][3]).join(', ') || 'none'}`);
}

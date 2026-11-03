// Every spoken line in the game that has NO recording yet, keyed the way the game finds a recording by words:
// audio/talk/<hash>.mp3, hash = FNV-1a of SPEAKER + '|' + exact words (index.html talkHash / lineClip).
// Sources: the story tables (audio/lines/lines.js + audio/dad-lines.js + audio/story-fixes.js), every line table in
// index.html written as   id: ['SPEAKER', 'words', seconds, ...],   and the level files' talk bubbles.
// A line counts as recorded when it has its own clip (a path in its 4th place), a boss clip (audio/voice/<id>.mp3 for a
// boss line without `true`), or a talk clip already in audio/talk/clips.js.
// usage: node tools/all-lines-extract.cjs <repo> <out.json>      (2026-11-03 audit, Shad: "record them all")
const fs = require('fs'), path = require('path'), vm = require('vm');
const [root, out] = process.argv.slice(2);
const hash = (who, text) => { let h = 0x811c9dc5; const s = who + '|' + text; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8); };
const spokenOf = (t) => String(t).replace(/<[^>]+>/g, ' ').replace(/\([^)]*\)/g, ' ').replace(/[—–]/g, ', ').replace(/\s+/g, ' ').trim();
const ctx = { self: {} }; vm.createContext(ctx);
for (const f of ['audio/talk/clips.js', 'audio/talk/clips-all.js', 'audio/lines/lines.js', 'audio/dad-lines.js', 'audio/story-fixes.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx);
const talk = ctx.self.KINAN_TALK_CLIPS || {};
const lines = new Map(), recorded = { own: 0, boss: 0, talk: 0 };
const add = (who, text, where, own) => {
  if (typeof who !== 'string' || typeof text !== 'string' || !/^[A-Z]/.test(who)) return;
  const h = hash(who, text);
  if (own) { recorded.own++; return; }
  if (process.env.ALL_LINES !== "1" && talk[h]) { recorded.talk++; return; }
  const spoken = spokenOf(text);
  if (!/[A-Za-z0-9]/.test(spoken)) return;   // a stage direction only: nothing to say
  if (!lines.has(h)) lines.set(h, { hash: h, who, text, spoken, where });
};
/* 1. story lines */
const S = ctx.self.KINAN_STORY;
for (const id of Object.keys(S.lines)) { const d = S.lines[id]; add(d[0], d[1], 'story ' + id, typeof d[3] === 'string' && d[3]); }
/* 2. index.html line tables */
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const re = /^\s+([A-Za-z0-9_]+): (\[\s*(?:"[A-Z][^"]{0,40}"|'[A-Z][^']{0,40}')\s*,\s*(['"]).*?\3\s*,\s*[0-9.]+[^\]]*\]),?\s*(?:\/\*.*)?$/gm;   /* a speaker may have an apostrophe ("THE NEIGHBOUR'S WIFE") */
let m;
while ((m = re.exec(html))) {
  let d; try { d = vm.runInContext(m[2], vm.createContext({})); } catch (e) { continue; }
  if (!Array.isArray(d) || typeof d[1] !== 'string') continue;
  const id = m[1];
  const own = typeof d[3] === 'string' && d[3] ? true : (d.length >= 3 && d[3] === undefined && fs.existsSync(path.join(root, 'audio', 'voice', id + '.mp3')));
  add(d[0], d[1], 'index.html ' + id, own);
}
/* 3. level talk bubbles */
for (const w of fs.readdirSync(path.join(root, 'levels')).filter((x) => /^w\d\d$/.test(x))) {
  for (const f of fs.readdirSync(path.join(root, 'levels', w)).filter((x) => x.endsWith('.js'))) {
    const defs = []; const c = { self: {}, window: {} };
    c.self.KinanLevels = c.window.KinanLevels = c.KinanLevels = { add: (d) => defs.push(d), register: (d) => defs.push(d) };
    vm.createContext(c);
    try { vm.runInContext(fs.readFileSync(path.join(root, 'levels', w, f), 'utf8'), c); } catch (e) { continue; }
    for (const d of defs) for (const a of (Array.isArray(d.areas) ? d.areas : [d])) for (const t of (a.talk || [])) add(t[1], t[2], 'level ' + d.id, false);
  }
}
const list = [...lines.values()];
fs.writeFileSync(out, JSON.stringify(list, null, 1));
const by = {}; for (const l of list) by[l.who] = (by[l.who] || 0) + 1;
console.log('lines with no recording:', list.length, '| already recorded:', JSON.stringify(recorded));
console.log(Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' | '));

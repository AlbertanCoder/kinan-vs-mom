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
/* what the voice reads: no tags, stage directions or emoji. 2026-11-11 (Season 2): a word in CAPITALS is read as a word, never
   spelled out (GOZAIMASU, WHOLE), and the creature noises are written the way they sound */
const SOUNDS = [[/\bh+s{2,}\b/gi, 'hisss'], [/\bg+r{2,}\b/gi, 'grrrr'], [/\bhm\b/gi, 'hmm'], [/\bkiii\b/gi, 'kee'], [/\bcrude-ly\b/gi, 'crudely']];
const spokenOf = (t) => {
  let x = String(t).replace(/<[^>]+>/g, ' ').replace(/\([^)]*\)/g, ' ').replace(/[—–]/g, ', ').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu, ' ').replace(/\s+/g, ' ').trim();
  if (process.env.SPOKEN_KEEP_CAPS === '1') return x;   /* (the first recordings were made from the words as written) */
  for (const [re, to] of SOUNDS) x = x.replace(re, to);
  x = x.replace(/\b[A-Z][A-Z']+\b/g, (w) => w.toLowerCase());
  return x.replace(/(^|[.!?]\s+)([a-z])/g, (m, a, b) => a + b.toUpperCase());
};
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
/* 4. Season 2 (Worlds 12-15): the lines said in the moment (index.html s2Say: they find a recording by speaker + words too) */
const lit = (name) => { const m = new RegExp('const ' + name + ' = (\\{[\\s\\S]*?\\n\\});').exec(html); return m ? vm.runInContext('(' + m[1] + ')', vm.createContext({})) : {}; };
const POP = lit('S2_POPPERS'), SUM = lit('S2_SUMMITS'), RISE = lit('S2_RISES');
for (const k of Object.keys(POP)) { const p = POP[k]; add(p.who, p.start, 's2 popper ' + k); add('GLITCHY', p.tip, 's2 popper ' + k); add(p.who, p.friend, 's2 popper ' + k); add('SABUMNIM', p.sab, 's2 popper ' + k); }
for (const k of Object.keys(SUM)) { add(SUM[k].who, SUM[k].start, 's2 summit ' + k); add(SUM[k].who, SUM[k].friend, 's2 summit ' + k); }
for (const k of Object.keys(RISE)) add(RISE[k].say[0], RISE[k].say[1], 's2 rise ' + k);
const cleanSaid = (t) => String(t).replace(/<[^>]+>/g, '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu, '').replace(/\s*\+\d+\s*$/, '').replace(/\s+/g, ' ').trim();   /* = index.html s2CleanSaid */
const S2_SAID = [   /* said from the code: the tips, the chase's own lines, and the helpers' messages (toast) as they are said in a Season 2 level */
  ['GLITCHY', 'Jump ON his head, Kinan! Land on top of him!'], ['ANNIE', 'AVALANCHE! Run, Kinan, RUN! Do not look back!'], ['GLITCHY', 'Phew! We out-ran it!'],
  ['MOM', 'Care package! Eat this burger, sweetie 🍔'], ['MOM', 'Nobody messes with MY boy! 🍔'], ['MOM', 'Mom to the rescue! Hearts refilled! 🍔'],
  ['ROBIN', 'Back from camp, bud! A cheeseburger joke? Nah. Too cheesy 🍔'], ['ROBIN', 'Nobody beats up the birthday boy! Not on my grill-watch 🍔'],
  ['ROBIN', "Dad's home from the oilfield! Hearts refilled, and that's crude-ly honest 🍔"],
  ['MOM', 'A little something to keep you going! Bun appetit! 🍔 +1 ❤'], ['ROBIN', 'A little something to keep you going! Bun appetit! 🍔 +1 ❤'],
  ['ROBIN', 'DAD SPECIAL! Hydro vac! 💨 Stand back, bud, this really sucks!'],
  ['SHAD', 'CONSTRUCTION SLAM! 👊 Hard hat on, bud! ⛑️'], ['SHAD', 'Apprentice carpenter on site! 👊 Safety first, wear this! ⛑️'],
  ['SHAD', "Measure twice, slam once! 👊 Here's a hard hat! ⛑️"], ['SHAD', "Rebar day is DONE. 👊 Here's a hard hat! ⛑️"], ['GLITCHY', "Okay! You've got this. 💪"]
];
for (const [who, text] of S2_SAID) add(who, cleanSaid(text), 's2 said');
{ const m = /const S2_ROPE_TIP = '([^']*)'/.exec(html); if (m) add('GLITCHY', m[1], 's2 rope tip'); }   /* Glitchy's rope tip (2026-11-14) */
for (const w of fs.readdirSync(path.join(root, 'levels')).filter((x) => /^w1[2-9]$|^lab$/.test(x))) {
  for (const f of fs.readdirSync(path.join(root, 'levels', w)).filter((x) => x.endsWith('.js'))) {
    const defs = []; const c = { self: {}, window: {}, URLSearchParams, location: { search: '' } };
    c.self.KinanLevels = c.window.KinanLevels = c.KinanLevels = { add: (d) => defs.push(d), register: (d) => defs.push(d) };
    vm.createContext(c);
    try { vm.runInContext(fs.readFileSync(path.join(root, 'levels', w, f), 'utf8'), c); } catch (e) { continue; }
    for (const d of defs) for (const a of (Array.isArray(d.areas) ? d.areas : [d])) {
      const b = a.s2boss; if (!b) continue;
      if (b.say) add(b.say[0], b.say[1], 's2 level ' + d.id); if (b.done) add(b.done[0], b.done[1], 's2 level ' + d.id);
      for (const t of b.after || []) add(t[0], t[1], 's2 level ' + d.id);
    }
  }
}
const list = [...lines.values()];
fs.writeFileSync(out, JSON.stringify(list, null, 1));
const by = {}; for (const l of list) by[l.who] = (by[l.who] || 0) + 1;
console.log('lines with no recording:', list.length, '| already recorded:', JSON.stringify(recorded));
console.log(Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' | '));

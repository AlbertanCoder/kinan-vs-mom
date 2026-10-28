/* Kinan vs. Worlds - list every line the game can speak through VO.speak (plus the helper lines),
   read straight from index.html. Prints JSON to stdout; writes nothing.
     node extract_lines.cjs [path/to/index.html]
   Each line: html (exactly what say()/toast() gets), plain (the same text VO.speak builds for its
   clip lookup), key (speakerOf(html, who), the code's speaker key), name (the bold speaker name, or
   NARRATOR / BOSS), src (where it comes from). */
'use strict';
const fs = require('fs');
const path = require('path');

const file = process.argv[2] || path.join(__dirname, '..', '..', 'index.html');
const src = fs.readFileSync(file, 'utf8');
const lines = src.split(/\r?\n/);

function fail(msg) { process.stderr.write('extract_lines: ' + msg + '\n'); process.exit(2); }
function lineNo(re, from) { for (let i = from || 0; i < lines.length; i++) if (re.test(lines[i])) return i; fail('not found: ' + re); }

/* ---- the classic stages' data: from `const MOMT` to the DAY table (LV 0..51) */
const a = lineNo(/^const MOMT = /), b = lineNo(/^\/\* the day goes by/, a);
const lvSrc = lines.slice(a, b).join('\n').replace(/^const LV = /m, 'LV = ').replace(/^const MOMT = /m, 'MOMT = ');
const stub = new Proxy(function () { return stub; }, { get: (t, k) => (k === Symbol.toPrimitive ? () => 0 : stub), apply: () => stub });
const scope = new Proxy({}, {
  has: () => true,
  get: (t, k) => { if (k === Symbol.unscopables) return undefined; if (k in t) return t[k]; if (k in globalThis) return globalThis[k]; return stub; },
  set: (t, k, v) => { t[k] = v; return true; }
});
const LV = new Function('sb', 'with (sb) {' + lvSrc + '\n; return LV; }')(scope);

/* ---- the WORLDS table (classic worlds 1-5 = LV from..to) */
const WORLDS = [];
for (const l of lines) {
  const m = /\{ n: (\d+), name: '([^']*)'.*?from: (\d+), to: (\d+)/.exec(l);
  if (m && /^(const WORLDS|  \{ n:|WORLDS\.push)/.test(l)) WORLDS.push({ n: +m[1], name: m[2], from: +m[3], to: +m[4] });
}
const W5 = WORLDS.filter((w) => w.n <= 5);
if (W5.length !== 5) fail('could not read classic worlds 1-5');
const worldOf = (i) => { if (i === 51) return 6; let n = 1; for (const w of WORLDS) if (i >= w.from) n = w.n; return n; };

/* ---- speakerOf + the SPEAKERS table, exactly as index.html has them */
const spLine = lines[lineNo(/^const SPEAKERS = \{/)] + lines[lineNo(/^const SPEAKERS = \{/) + 1];
const SPEAKERS = new Function('return ' + spLine.replace(/^const SPEAKERS = /, '').replace(/;\s*$/, ''))();
function speakerOf(html, who) {
  const m = /^<b>([^<:(]+?)\s*(?:\([^)]*\))?:<\/b>/.exec(html || '');
  if (!m) return null;
  const name = m[1].trim().toUpperCase();
  if (name === 'BOSS') return who || 'm';
  return SPEAKERS[name] || who || null;
}
function nameOf(html) {
  const m = /^<b>([^<:(]+?)\s*(?:\([^)]*\))?:<\/b>/.exec(html || '');
  return m ? m[1].trim().toUpperCase() : 'NARRATOR';
}
/* VO.speak's plain text (same regexes, same order) */
const plainOf = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/[\uD83C-\uD83F][\uDC00-\uDFFF]/g, ' ').replace(/\s+/g, ' ').trim();

/* ---- bossTough / bossRules (to know the stomp counts the boss lines print) */
const bossTough = (i) => { const w = worldOf(i), k = i - WORLDS[w - 1].from; if (w === 1) return Math.max(0, (k - 4) * 0.4); return 2.5 + (w - 2) * 1.5 + k * 0.25; };
const hpChoices = (i, d) => [d.hp + Math.min(4, Math.round(bossTough(i) * 0.75)), Math.max(2, Math.round(d.hp * 0.7))];   /* normal, helping hand */

/* every literal a source line must still hold, so a changed template is caught instead of silently missed */
function need(fragment) { if (src.indexOf(fragment) < 0) fail('index.html no longer holds: ' + fragment); }
const evalLit = (lit) => new Function('return ' + lit)();
const LIT = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g;

const out = [];
const seen = new Map();
function add(html, who, srcTag, extra) {
  if (typeof html !== 'string' || !plainOf(html)) return;
  if (seen.has(html)) { seen.get(html).src.push(srcTag); return; }
  const e = Object.assign({ html: html, plain: plainOf(html), key: speakerOf(html, who), name: nameOf(html), src: [srcTag] }, extra || {});
  seen.set(html, e);
  out.push(e);
}

/* 1. the classic stages of worlds 1-5: intro, boss title + bossIntro, win */
for (const w of W5) {
  for (let i = w.from; i <= w.to; i++) {
    const s = LV[i];
    if (!s) fail('no LV[' + i + ']');
    const tag = 'W' + w.n + ' stage ' + (i - w.from + 1) + ' (' + s.place + ')';
    (s.intro || []).forEach((h, n) => add(h, 'k', tag + ' intro ' + (n + 1)));
    const d = s.boss;
    if (d) {
      add('<b>BOSS:</b> ' + d.title.toUpperCase() + '!', d.face || 'm', tag + ' boss title', { tts: d.title + '!' });
      (s.bossIntro || []).forEach((h, n) => add(h, d.face || 'm', tag + ' bossIntro ' + (n + 1)));
      if (!(s.final || s.final2 || s.final3 || s.final4 || s.final5 || s.finalWorld)) (s.win || []).forEach((h, n) => add(h, d.face || 'm', tag + ' win ' + (n + 1)));
      /* the boss fight's opening instruction (startBoss) */
      const hps = hpChoices(i, d);
      if (d.kind === 'siblings') hps.forEach((hp) => add('Stomp <b>both</b> of them to win: <b>' + hp + '</b> stomps for Shad and <b>' + Math.max(2, hp - 2) + '</b> for Chenoa. Go go go!', 'k', tag + ' boss start'));
      else if (d.kind === 'final') hps.forEach((hp) => add('Kinan gets the <b>Party Popper</b> for the final fight! Stomp Mom <b>' + hp + ' times</b>. Go go go!', 'k', tag + ' boss start'));
      else if (d.kind !== 'team') hps.forEach((hp) => add('Jump on their head <b>' + hp + ' times</b> to win!', 'k', tag + ' boss start'));
    } else {
      const who = ({ shad: 's', chenoa: 'c' })[s.goalRide] || 'd';
      (s.win || []).forEach((h, n) => add(h, who, tag + ' win ' + (n + 1)));
    }
  }
}
need("await say('<b>BOSS:</b> ' + d.title.toUpperCase() + '!', d.face || 'm', 'a');");
need("await say('Stomp <b>both</b> of them to win: <b>' + hp + '</b> stomps for Shad and <b>' + ch.max + '</b> for Chenoa. Go go go!', 'k');");
need("await say('Kinan gets the <b>Party Popper</b> for the final fight! Stomp Mom <b>' + hp + ' times</b>. Go go go!', 'k');");
need("await say('Jump on their head <b>' + hp + ' times</b> to win!', 'k');");
need("Math.max(2, hp - 2)");

/* 2. the team boss (Mom + Chenoa, stages 1-7 and 1-10): its fixed say() lines */
{
  const s0 = lineNo(/if \(d\.kind === 'team'\) \{/), s1 = lineNo(/\} else if \(d\.kind === 'siblings'\)/, s0);
  for (let k = s0; k < s1; k++) {
    const m = /await say\(((?:'(?:[^'\\]|\\.)*')|(?:"(?:[^"\\]|\\.)*")), '([a-z]+)'/.exec(lines[k]);
    if (m) add(evalLit(m[1]), m[2], 'W1 team boss (Mom + Chenoa)');
  }
}

/* 3. losing a heart in a classic stage (die()): the cheer-up lines */
{
  const k = lineNo(/const line = atBoss \? \(\{ 1: /);
  const stmt = lines[k] + '\n' + lines[k + 1];
  (stmt.match(LIT) || []).map(evalLit).filter((t) => /^<b>/.test(t)).forEach((t) => add(t, null, 'classic: lost a heart (die)'));
}

/* 4. the new game's helper (Glitchy) lines: toasts today, voiced so the wiring can use them */
{
  const k1 = lineNo(/toast\('<b>GLITCHY:<\/b> Okay!/), k2 = lineNo(/toast\('✨ <b>GLITCHY:<\/b> Follow me!'/), k3 = lineNo(/toast\('✨ <b>GLITCHY:<\/b> I\\'ll bug the boss/);
  add(evalLit(lines[k1].match(LIT)[0]), 'mech', 'new game: helper (Glitchy says no thanks)', { toast: true });
  const f = lines[k2].match(LIT).map(evalLit);   /* '✨ ... Follow me!', ' I made you a safe path.', ' I cleared the way.' */
  add(f[0] + f[1], 'mech', 'new game: helper (Glitchy shows the way)', { toast: true });
  add(f[0] + f[2], 'mech', 'new game: helper (Glitchy shows the way)', { toast: true });
  add(evalLit(lines[k3].match(LIT)[0]), 'mech', 'new game: boss helper (Glitchy)', { toast: true });
}

/* 5. the new game's boss arenas: subtitle-only lines (no recording in audio/voice/) */
{
  const s0 = lineNo(/^const ARENA_LINES = \{/), s1 = lineNo(/^\};/, s0);
  const AL = new Function('return ' + lines.slice(s0, s1 + 1).join('\n').replace(/^const ARENA_LINES = /, '').replace(/;\s*$/, ''))();
  for (const id of Object.keys(AL)) {
    const d = AL[id];
    const html = '<b>' + d[0] + ':</b> ' + d[1];
    if (d[3]) add(html, null, 'new game arena ' + id + ' (subtitle only)', { arenaId: id, subtitleOnly: true });
  }
  process.stderr.write('arena lines with recordings: ' + Object.keys(AL).filter((id) => !AL[id][3]).length + '\n');
}

process.stdout.write(JSON.stringify({ file: path.resolve(file), count: out.length, lines: out }, null, 1));

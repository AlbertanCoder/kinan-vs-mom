import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createContext, runInContext } from 'node:vm';

/* 2026-11-03 audit follow-up (Shad: "you should fix them up"):
   - Shad's answer 19, game-wide: what the game SHOWS or SAYS uses look-alike names for real attractions and businesses
     (the Hilltop Castle, the Giant Tower, the City Tower, the Science Dome, the Nature Dome, ...). Public places stay
     (cities, rivers, mountains, parks, streets, bridges, the Stampede), and so does West Edmonton Mall (Shad asked for it,
     qa-privacy-trademarks.test.ts). The Original Birthday Game (2026) in index.html is kept as it was.
   - Shad's answer 9: the Edmonton grandma's surname is a real family surname: it is in no file the repo ships.
   Checked: every level name and talk line (levels/, 3d/levels/), every story line after its fixes (audio/), and every map
   label and stop name (map/). The banned words are written with [ ] so this file never spells them out either. */
const ROOT = join(__dirname, '..', '..', '..');
const REAL = /Casa L[o]ma|\bCN T[o]wer|Calgary T[o]wer|Capilan[o]|Science W[o]rld|Bi[o]dome|Muttar[t]|Bessb[o]rough|Stante[c]|Saddled[o]me|\bBC Plac[e]|Harbour Centr[e]|Tyrrel[l]|Ice Distric[t]/i;
const SURNAME = new RegExp('grandma.?' + ['h', 'u', 'n', 't', 'e', 'r'].join(''), 'i');

type Talk = [number, string, string, number?, string?];
type Def = { id: string; name?: string; talk?: Talk[]; areas?: { name?: string; talk?: Talk[] }[] };
function levelDefs(dir: string): Def[] {
  const defs: Def[] = [];
  for (const sub of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const files = sub.isDirectory() ? readdirSync(join(ROOT, dir, sub.name)).map((f) => join(dir, sub.name, f)) : [join(dir, sub.name)];
    for (const f of files.filter((x) => x.endsWith('.js'))) {
      const reg = (d: Def) => { defs.push(d); };
      const ctx = createContext({ self: {}, window: {}, KinanLevels: { register: reg, add: reg }, G3_LEVELS: {} });
      (ctx as any).self.KinanLevels = (ctx as any).window.KinanLevels = (ctx as any).KinanLevels;
      try { runInContext(readFileSync(join(ROOT, f), 'utf8'), ctx); } catch { /* a file that needs the page (3d/ engine hooks) */ }
    }
  }
  return defs;
}

describe('QA follow-up: look-alike names on screen, no family surname', () => {
  const defs = levelDefs('levels');
  it('reads the level files (sanity)', () => {
    expect(defs.length).toBeGreaterThan(100);
    expect(defs.find((d) => d.id === '8-castle')!.name).toBe('THE HILLTOP CASTLE');
  });
  it('no real attraction name in a level name or a talk line', () => {
    const hits: string[] = [];
    for (const d of defs) {
      for (const a of [d, ...(d.areas || [])]) {
        if (a.name && REAL.test(a.name)) hits.push(`${d.id} name: ${a.name}`);
        for (const t of a.talk || []) if (REAL.test(t[2])) hits.push(`${d.id} talk: ${t[1]}: ${t[2]}`);
      }
    }
    for (const f of readdirSync(join(ROOT, '3d', 'levels')).filter((x) => x.endsWith('.js'))) {
      for (const m of readFileSync(join(ROOT, '3d', 'levels', f), 'utf8').matchAll(/(?:name|title|intro|text|say|line)\s*:\s*(['"`])((?:(?!\1).)*)\1/g)) if (REAL.test(m[2])) hits.push(`3d/levels/${f}: ${m[2]}`);
    }
    expect(hits).toEqual([]);
  });
  it('no real attraction name in a story line (after audio/story-fixes.js)', () => {
    const ctx = createContext({ self: {} as any });
    for (const f of ['audio/lines/lines.js', 'audio/dad-lines.js', 'audio/story-fixes.js']) runInContext(readFileSync(join(ROOT, f), 'utf8'), ctx);
    const S = (ctx as any).self.KINAN_STORY;
    const hits = Object.keys(S.lines).filter((id) => REAL.test(S.lines[id][1]) || SURNAME.test(S.lines[id][0])).map((id) => `${id}: ${S.lines[id][0]}: ${S.lines[id][1]}`);
    expect(hits).toEqual([]);
    expect(S.lines.w04_grandmaedm_01[0]).toBe('GRANDMA (EDMONTON)');
  });
  it('no real attraction name in a map label or a map stop', () => {
    const hits: string[] = [];
    for (const f of ['engine.js', ...readdirSync(join(ROOT, 'map', 'worlds')).filter((x) => /^w\d\d[a-z_0-9]*\.js$/.test(x) && x !== 'w12_models.js').map((x) => 'worlds/' + x)]) {
      const s = readFileSync(join(ROOT, 'map', f), 'utf8');
      for (const m of s.matchAll(/label\([^,]+,[^,]+,\s*'([^']+)'|name:\s*'([^']+)'/g)) { const t = m[1] || m[2]; if (REAL.test(t)) hits.push(`map/${f}: ${t}`); }
    }
    expect(hits).toEqual([]);
  });
  it("the Edmonton grandma's surname is in no file the game ships", () => {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
        const rel = dir ? dir + '/' + e.name : e.name;
        if (/^(\.git|\.claude|node_modules|vendor|audit|test-results|playwright-report|kick-shots|w12-finale-shots)$/.test(e.name) || rel.startsWith('audio/talk')) continue;
        if (e.isDirectory()) walk(rel);
        else if (/\.(js|html|json|md|mjs|cjs|py|ps1|ts)$/.test(e.name) && SURNAME.test(readFileSync(join(ROOT, rel), 'utf8'))) hits.push(rel);
      }
    };
    walk('');
    expect(hits).toEqual([]);
  });
});

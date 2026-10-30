import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createContext, runInContext } from 'node:vm';

/* THE LEVEL TALK BUBBLES' VOICES (Shad, 2026-10-30: "you can't even hear Robin talk ... you can see the subtitles"): every
   DAD and GRANDPA line in a level's talk bubbles has a recording, audio/talk/<hash>.mp3 listed in audio/talk/clips.js, where
   hash = FNV-1a of SPEAKER + '|' + the exact words (index.html talkHash), and sw.js precaches them for offline play. */
const ROOT = join(__dirname, '..', '..', '..');
const talkHash = (who: string, text: string): string => { let h = 0x811c9dc5; const s = who + '|' + text; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8); };
type Talk = [number, string, string, number?, string?];
type Def = { id: string; talk?: Talk[]; areas?: { talk?: Talk[] }[] };

function levelTalk(): { id: string; who: string; text: string }[] {
  const out: { id: string; who: string; text: string }[] = [];
  for (const w of readdirSync(join(ROOT, 'levels')).filter((d) => /^w\d\d$/.test(d))) {
    for (const f of readdirSync(join(ROOT, 'levels', w)).filter((x) => x.endsWith('.js'))) {
      const defs: Def[] = []; const reg = { add: (d: Def) => defs.push(d), register: (d: Def) => defs.push(d) };
      const c: Record<string, unknown> = { KinanLevels: reg, self: { KinanLevels: reg }, window: { KinanLevels: reg } }; createContext(c);
      runInContext(readFileSync(join(ROOT, 'levels', w, f), 'utf8'), c);
      for (const d of defs) for (const a of (Array.isArray(d.areas) ? d.areas : [d])) for (const t of a.talk || []) out.push({ id: d.id, who: t[1], text: t[2] });
    }
  }
  return out;
}

describe('the level talk bubbles speak (Dad and Grandpa)', () => {
  const c: Record<string, unknown> = {}; c.self = c; createContext(c);
  runInContext(readFileSync(join(ROOT, 'audio', 'talk', 'clips.js'), 'utf8'), c);
  const CLIPS = c.KINAN_TALK_CLIPS as Record<string, number>, FILES = c.KINAN_TALK_FILES as string[];

  it('every DAD and GRANDPA talk line in Worlds 1-10 has its clip, and the file is there', () => {
    const lines = levelTalk().filter((l) => l.who === 'DAD' || l.who === 'GRANDPA');
    expect(lines.length).toBeGreaterThan(100);
    const missing = lines.filter((l) => !CLIPS[talkHash(l.who, l.text)] || !existsSync(join(ROOT, 'audio', 'talk', talkHash(l.who, l.text) + '.mp3')));
    expect(missing.map((l) => `${l.id} ${l.who}: ${l.text.slice(0, 50)}`)).toEqual([]);
    for (const f of FILES) expect(existsSync(join(ROOT, f)), f).toBe(true);
  });

  it('the game and sw.js use the same key and load the list; the whole offline cache with the voices stays under 30 MB', () => {
    const html = readFileSync(join(ROOT, 'index.html'), 'utf8'), sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
    expect(html).toContain('<script src="audio/talk/clips.js"></script>');
    expect(html).toContain("'audio/talk/' + talkHash(t[1], t[2]) + '.mp3'");
    expect(sw).toContain("importScripts('./audio/talk/clips.js');");
    expect(sw).toContain(".concat((self.KINAN_TALK_FILES || []).map((f) => './' + f))");
    const talk = FILES.reduce((n, f) => n + statSync(join(ROOT, f)).size, 0);
    const listed = (src: string): string[] => [...src.matchAll(/'\.\/([^']+)'/g)].map((m) => m[1]);
    const base = listed(/const ASSETS = \[([\s\S]*?)\]/.exec(sw)![1]).filter((f) => f !== '');
    const mapList = listed(/const MAP_FILES = \[([\s\S]*?)\];/.exec(sw)![1]);
    const s: Record<string, unknown> = {}; s.self = s; createContext(s);
    runInContext(readFileSync(join(ROOT, 'levels', 'manifest.js'), 'utf8'), s);
    runInContext(readFileSync(join(ROOT, 'audio', 'lines', 'lines.js'), 'utf8'), s);
    runInContext(readFileSync(join(ROOT, 'audio', 'dad-lines.js'), 'utf8'), s);
    const all = [...new Set(['index.html', ...base, ...(s.KINAN_LEVEL_FILES as string[]).map((f) => `levels/${f}`), ...mapList, ...(s.KINAN_STORY_FILES as string[]), ...FILES])];
    const bytes = all.reduce((n, f) => n + (existsSync(join(ROOT, f)) ? statSync(join(ROOT, f)).size : 0), 0);
    console.log(`talk voices: ${FILES.length} clips, ${(talk / 1048576).toFixed(2)} MB · whole precache: ${(bytes / 1048576).toFixed(2)} MB`);
    expect(bytes).toBeLessThan(30 * 1048576);
  });
});

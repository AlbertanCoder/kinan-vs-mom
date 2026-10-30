import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createContext, runInContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

/* DAD CRACKS A JOKE ABOUT EVERYTHING (Shad, 2026-10-29), Grandpa's joke-off, the wheeze-laugh, Mom's reactions and
   "no conversation over 5 lines". The table is tools/dad-lines.mjs; this checks every part of it is in the game:
   the story overlay (audio/dad-lines.js over audio/lines/lines.js), the level files' talk bubbles and index.html. */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
type Line = [string, string, number, string | null];
type Story = { lines: Record<string, Line>; intro: Record<string, string[]>; exit: Record<string, string[]>; open: Record<string, string[]>;
  clear: Record<string, string[]>; joke: Record<string, string>; jokeMore: Record<string, string[]>; escape: Record<string, string[]>; fx: Record<string, string> };
type Talk = [number, string, string, number?, string?];
type Table = {
  STORY_REWRITE: Record<string, [string, string]>; STORY_ADD: Record<string, [string, string]>;
  GROUPS: Record<string, Record<string, string | string[]>>; JOKE_MORE: Record<string, string[]>;
  REPLACE: [string, string, string, string?][]; ADD_TALK: Record<string, Talk[]>; WORLD10_LATER: [string, string][];
};
const T = (await import(pathToFileURL(join(ROOT, 'tools', 'dad-lines.mjs')).href)) as Table;
const story = (withOverlay: boolean): Story => {
  const c: Record<string, unknown> = {}; c.self = c; createContext(c);
  runInContext(readFileSync(join(ROOT, 'audio', 'lines', 'lines.js'), 'utf8'), c);
  if (withOverlay) runInContext(readFileSync(join(ROOT, 'audio', 'dad-lines.js'), 'utf8'), c);
  return c.KINAN_STORY as Story;
};
const BASE = story(false), S = story(true);
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
type Area = { cols: number; talk?: Talk[] };
type Level = Area & { id: string; world: number; areas?: Area[] };
const LEVELS: Level[] = (() => {
  const c: Record<string, unknown> = {}; c.self = c; createContext(c);
  runInContext(readFileSync(join(ROOT, 'levels', 'manifest.js'), 'utf8'), c);
  const out: Level[] = [];
  c.KinanLevels = { register: (d: Level) => out.push(d) };
  for (const f of c.KINAN_LEVEL_FILES as string[]) runInContext(readFileSync(join(ROOT, 'levels', f), 'utf8'), c);
  return out;
})();

describe("Dad's lines", () => {
  it('every rewritten story line says its joke now, still as DAD, and never plays the clip of its old words', () => {
    for (const [id, [oldText, newText]] of Object.entries(T.STORY_REWRITE)) {
      expect(BASE.lines[id]?.[1], `${id} in the voice script`).toBe(oldText);
      expect(S.lines[id].slice(0, 2), id).toEqual(['DAD', newText]);
      expect(S.lines[id][3] === null || S.lines[id][3] === `audio/rerecord/${id}.mp3`, `${id}: no old clip`).toBe(true);
      expect(S.lines[id][2], id).toBeGreaterThan(1);
    }
  });
  it("the new lines, 3-1's joke-off, Grandpa's video calls and the cut conversations are what the table says", () => {
    for (const [id, [, text]] of Object.entries(T.STORY_ADD)) expect(S.lines[id]?.[1], id).toBe(text);
    for (const [k, g] of Object.entries(T.GROUPS)) for (const [where, ids] of Object.entries(g)) {
      expect((S as unknown as Record<string, Record<string, unknown>>)[k][where], `${k} ${where}`).toEqual(ids);
      for (const id of ([] as string[]).concat(ids)) expect(S.lines[id], id).toBeTruthy();
    }
    expect(S.jokeMore).toEqual(T.JOKE_MORE);
    for (const id of Object.values(T.JOKE_MORE).flat()) expect(S.lines[id], id).toBeTruthy();
    expect(S.open['3-1'].map((id) => S.lines[id][0])).toEqual(['GRANDMA', 'GRANDPA', 'DAD', 'GRANDPA', 'KINAN']);
    expect(S.lines[S.joke['4-4']][0]).toBe('GRANDPA');
    expect(T.WORLD10_LATER.length).toBeGreaterThanOrEqual(2);
  });
  it('every boss line, toast and level bubble swap is in its file (and the old words are gone); a re-recorded boss line plays its new clip (audio/voice/<id>.mp3, 2026-10-29)', () => {
    for (const [f, oldS, newS, note] of T.REPLACE) {
      const src = readFileSync(join(ROOT, f), 'utf8');
      expect(src.includes(newS), `${f}: ${newS.slice(0, 60)}`).toBe(true);
      expect(src.includes(oldS), `${f} still says: ${oldS.slice(0, 60)}`).toBe(false);
      if (note && note.startsWith('voiced: ')) { expect(newS, note).not.toMatch(/, true\],$/); expect(existsSync(join(ROOT, 'audio', 'voice', note.slice(8) + '.mp3')), note).toBe(true); }
    }
    expect(html).not.toContain("Easy, big fella. Easy. Don't fight him");
  });
  it("every new bubble is in its level: the wheeze-laughs, Mom's laughs and walk-offs, Grandpa's calls", () => {
    const byFile = new Map<string, string>();
    for (const [f, lines] of Object.entries(T.ADD_TALK)) {
      const src = byFile.get(f) || readFileSync(join(ROOT, f), 'utf8');
      byFile.set(f, src);
      for (const t of lines) expect(src.includes(JSON.stringify(t[2])), `${f}: ${t[2].slice(0, 50)}`).toBe(true);
    }
    const all = LEVELS.flatMap((l) => (l.areas || [l]).flatMap((a) => a.talk || []).map((t) => ({ w: l.world, id: l.id, t })));
    const wheeze = all.filter((x) => x.t[4] === 'wheeze'), walk = all.filter((x) => x.t[4] === 'walkoff');
    for (let w = 1; w <= 9; w++) expect(wheeze.filter((x) => x.w === w).length, `World ${w}: a wheeze-laugh`).toBeGreaterThanOrEqual(1);
    for (const x of wheeze) {
      expect(x.t[1], `${x.id}: only Dad wheezes`).toBe('DAD');
      expect(/castle/.test(x.id), `${x.id}: never in a boss level`).toBe(false);
      const area = LEVELS.find((l) => l.id === x.id)!;
      const talk = (area.areas || [area]).flatMap((a) => a.talk || []);
      const next = talk[talk.indexOf(x.t) + 1];
      expect(next && next[0] === x.t[0] && next[1] !== 'DAD', `${x.id}: someone else finishes the punchline`).toBe(true);
    }
    for (const x of walk) expect(x.t[1], x.id).toBe('MOM');
    expect(walk.length).toBeGreaterThanOrEqual(4);
  });
});

describe('no conversation over 5 lines (Shad, 2026-10-29)', () => {
  it('every story group (a world intro or exit, a level opener or clear, a castle escape, a joke with its joke-off) is 5 lines or fewer', () => {
    for (const k of ['intro', 'exit', 'open', 'clear', 'escape'] as const) {
      for (const [where, ids] of Object.entries(S[k] || {})) expect(ids.length, `${k} ${where}`).toBeLessThanOrEqual(5);
    }
    for (const where of Object.keys(S.joke)) expect(1 + (S.jokeMore[where] || []).length, `joke ${where}`).toBeLessThanOrEqual(5);
  });
  it("a level's talk bubbles that come together (within 3 columns) are 5 lines or fewer", () => {
    for (const l of LEVELS) for (const a of l.areas || [l]) {
      const cols = (a.talk || []).map((t) => t[0]).sort((x, y) => x - y);
      let run = 0;
      cols.forEach((c, i) => { run = i && c - cols[i - 1] <= 3 ? run + 1 : 1; expect(run, `${l.id}: talk near column ${c}`).toBeLessThanOrEqual(5); });
    }
  });
});

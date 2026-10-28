import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

/* QA 2026-10-28 (MAJOR): the title promises 4 cats and 2 dogs, but no authored level had a pet
   rescue. Each pet now waits in a crate in one level file (`pet: { id, col, row }`,
   docs/LEVEL-AUTHORING.md §4.4), placed by the story bible ("The six pets: one per world, Worlds
   1 to 5"): Ginger 1-1 and Chikastino 1-5 (World 1 table), Vader 2-4 (the library), Hunter 3-3
   (rescued at camp), Duchess 4-castle (rescued at the restaurant), Tuxedo 5-fort (the midway).
   No browser: the registry and the level files run in a Node vm, as in levels-registry.test.ts. */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const LEVELS = join(ROOT, 'levels');
type Pet = { id: string; col: number; row: number };
type Area = { cols: number; heights: (number | null)[]; solid?: number[][]; tiles?: Record<string, number[][]>; pet?: Pet; arena?: { col: number } };
type Def = Area & { id: string; areas?: Area[] };
type Registry = { get(id: string): Def | null; list(): string[]; problems(): string[]; validate(d: unknown): string[] };

function load(): Registry {
  const ctx: Record<string, unknown> = { console: { error: () => undefined, log: () => undefined } };
  ctx.self = ctx;
  createContext(ctx);
  const run = (rel: string): void => { runInContext(readFileSync(join(LEVELS, rel), 'utf8'), ctx, { filename: rel }); };
  run('registry.js');
  runInContext(readFileSync(join(LEVELS, 'manifest.js'), 'utf8'), ctx);
  for (const f of ctx.KINAN_LEVEL_FILES as string[]) run(f);
  return ctx.KinanLevels as Registry;
}
const BIBLE: Record<string, string> = { cat1: '1-1', dog1: '1-5', cat2: '2-4', dog2: '3-3', cat3: '4-castle', cat4: '5-fort' };

describe('QA fix: the six pets wait in Worlds 1-5', () => {
  const K = load();
  it('every level still loads with no problems', () => expect(K.problems()).toEqual([]));

  it('each pet is in exactly one level, the one the story bible names', () => {
    const where: Record<string, string[]> = {};
    for (const id of K.list()) {
      const d = K.get(id)!;
      for (const a of d.areas || [d]) if (a.pet) (where[a.pet.id] = where[a.pet.id] || []).push(id);
    }
    expect(Object.fromEntries(Object.entries(where).map(([p, ids]) => [p, ids.join(',')]))).toEqual(BIBLE);
  });

  it('every crate stands in the open on flat ground, before any boss arena (a kid runs into it)', () => {
    for (const [pet, id] of Object.entries(BIBLE)) {
      const d = K.get(id)!;
      const a = (d.areas || [d]).find((x) => x.pet)!;
      const { col, row } = a.pet!;
      const solidAt = (c: number, r: number): boolean =>
        (a.solid || []).some(([c0, r0, c1, r1]) => c >= c0 && c <= c1 && r >= r0 && r <= r1) ||
        Object.values(a.tiles || {}).some((cells) => cells.some((cell) => cell[0] === c && cell[1] === r));
      expect(solidAt(col, row), `${pet} in ${id}: the crate cell is free`).toBe(false);
      expect(a.heights[col], `${pet} in ${id}: ground under it`).toBe((row + 1) * 16);
      expect(a.heights[col - 1], `${pet} in ${id}: flat on the left`).toBe((row + 1) * 16);
      expect(a.heights[col + 1], `${pet} in ${id}: flat on the right`).toBe((row + 1) * 16);
      if (a.arena) expect(col, `${pet} in ${id}: before the arena's checkpoint`).toBeLessThan(a.arena.col - 4);
    }
  });

  it('the registry refuses a broken pet: an unknown pet, a crate outside the level, two crates in one level', () => {
    const base = JSON.parse(JSON.stringify(K.get('1-1')));
    expect(K.validate(Object.assign({}, base, { pet: { id: 'cat9', col: 16, row: 11 } })).join(' ')).toContain('pet must be');
    expect(K.validate(Object.assign({}, base, { pet: { id: 'cat1', col: 999, row: 11 } })).join(' ')).toContain('pet must be');
    const two = JSON.parse(JSON.stringify(K.get('5-fort')));
    two.areas[0].pet = { id: 'dog1', col: 20, row: 11 };
    expect(K.validate(two).join(' ')).toContain('only one pet crate per level');
  });
});

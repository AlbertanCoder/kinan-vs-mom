import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

/* Engine pass B1 — the data contract for boss arenas (levels/registry.js,
   docs/LEVEL-AUTHORING.md §4.7): the shape problems that would break a fight,
   and the lint rules that treat an arena as the level's finale. */

const LEVELS = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'levels');
type Registry = { validate(d: unknown): string[]; lint(d: unknown): string[] };

function registry(): Registry {
  const ctx: Record<string, unknown> = { console: { error: () => undefined, log: () => undefined } };
  ctx.self = ctx;
  createContext(ctx);
  runInContext(readFileSync(join(LEVELS, 'registry.js'), 'utf8'), ctx, { filename: 'registry.js' });
  return ctx.KinanLevels as Registry;
}
const flat = (n: number, h = 192): (number | null)[] => Array.from({ length: n }, () => h);
/* a small castle: 30 columns of platforming with a 3-pit, a 24-wide arena (gate c33, floor c34-57, door c58), the goal at c62 */
function castle(over: Record<string, unknown> = {}, arena: Record<string, unknown> = {}) {
  const heights = flat(66);
  heights[10] = heights[11] = heights[12] = null;
  return {
    id: '1-castle', world: 1, slot: 11, name: 'TEST CASTLE', cols: 66, heights,
    tiles: { gift: [[5, 8]], brick: [[20, 8]] }, foes: [[25, 11, 'sock']], candles: [[60, 11], [61, 11], [63, 11], [64, 11]],
    arena: Object.assign({ col: 34, cols: 24, boss: 'mom' }, arena),
    goal: { col: 62, row: 11 },
    ...over
  };
}

describe('boss arenas in the level contract (B1)', () => {
  const K = registry();

  it('a well-formed arena level has no problems and no lint', () => {
    expect(K.validate(castle())).toEqual([]);
    expect(K.lint(castle())).toEqual([]);
  });

  it('B2: the World 3-5 bosses are known (moose, foreman, conductor, chenoa, barker, bronco)', () => {
    for (const boss of ['moose', 'foreman', 'conductor', 'chenoa', 'barker', 'bronco']) {
      expect(K.validate(castle({}, { boss })), boss).toEqual([]);
      expect(K.lint(castle({}, { boss })), boss).toEqual([]);
    }
    expect(K.validate(castle({}, { boss: 'bronco', phases: [{ windup: 40, calm: 2 }, { windup: 36 }] }))).toEqual([]);
  });

  it('refuses an unknown boss, a bad width, a bad phase count, and an arena with no room for its gates', () => {
    expect(K.validate(castle({}, { boss: 'dragon' })).join()).toMatch(/arena\.boss "dragon"/);
    expect(K.validate(castle({}, { cols: 8 })).join()).toMatch(/arena\.cols must be 12-60/);
    expect(K.validate(castle({}, { phases: 5 })).join()).toMatch(/arena\.phases/);
    expect(K.validate(castle({}, { col: 50 })).join()).toMatch(/room for its gates/);
    expect(K.validate(castle({}, { phases: [{ windup: 40 }, { windup: 30 }] }))).toEqual([]);   /* a list of overrides is fine */
  });

  it('refuses a floor that is not flat open ground between the gates', () => {
    const bumpy = castle();
    (bumpy.heights as (number | null)[])[40] = 184;
    expect(K.validate(bumpy).join()).toMatch(/arena floor must be flat/);
    expect(K.validate(castle({ solid: [[40, 10, 41, 11]] })).join()).toMatch(/arena must be open ground: solid/);
    expect(K.validate(castle({ tiles: { gift: [[40, 8]] } })).join()).toMatch(/arena must be open ground: tiles\.gift/);
    expect(K.validate(castle({ tiles: { shelf: [[40, 9], [41, 9]] } }))).toEqual([]);   /* desks are shelves */
  });

  it('refuses a goal in front of the boss door, two arenas, and a checkpoint that is not before the gate', () => {
    expect(K.validate(castle({ goal: { col: 45, row: 11 } })).join()).toMatch(/goal must stand past the arena/);
    const two = { id: '2-castle', world: 2, slot: 11, name: 'TWO', spawn: { col: 2, row: 11 }, areas: [
      { id: 'a', name: 'A', cols: 40, heights: flat(40), arena: { col: 6, cols: 24, boss: 'mom' }, tiles: { gift: [[2, 8]] } },
      { id: 'b', name: 'B', cols: 40, heights: flat(40), arena: { col: 6, cols: 24, boss: 'principal' }, goal: { col: 36, row: 11 } }] };
    expect(K.validate(two).join()).toMatch(/only one boss arena/);
    expect(K.validate(castle({}, { checkpoint: { col: 40, row: 11 } })).join()).toMatch(/checkpoint must stand before/);
    const pitBefore = castle();
    (pitBefore.heights as (number | null)[])[30] = null;   /* col - 4: the default checkpoint spot */
    expect(K.validate(pitBefore).join()).toMatch(/over a pit/);
  });

  it('lint: the arena is the toy of every screen it crosses, and the gap caps count acts in the platforming before the gate', () => {
    expect(K.lint(castle()).join()).not.toMatch(/no toy|flat run/);
    /* a 5-pit at c22-26 is act 3 of the 33 platforming columns (cap 5) — over all 66 columns it would be act 2 (cap 4) */
    const late = castle();
    const h = late.heights as (number | null)[];
    h[10] = h[11] = h[12] = 192;
    h[22] = h[23] = h[24] = h[25] = h[26] = null;
    expect(K.lint(late)).toEqual([]);
    const noArena = castle({ arena: undefined, heights: h.slice(), tiles: { gift: [[5, 8], [40, 8]], brick: [[20, 8], [56, 8]] } });
    expect(K.lint(noArena).join()).toMatch(/pit at cols 22-26 is 5 wide; act 2 allows 4/);
  });
});

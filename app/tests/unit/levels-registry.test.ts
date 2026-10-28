import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

/* M4b "levels as files" — the data gate for every level file (no browser).
   Loads levels/registry.js + levels/manifest.js + each level file in a Node vm
   sandbox, exactly as the page does, and holds every level to the contract
   (problems) and the design rules (lint). docs/LEVEL-AUTHORING.md §5-§6. */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const LEVELS = join(ROOT, 'levels');

type Cell = [number, number, ...unknown[]];
type Area = { id?: string; name?: string; cols: number; heights: (number | null)[]; foes?: Cell[]; tiles?: Record<string, Cell[]>; candles?: Cell[];
  secrets?: { kind: string; col: number; row: number; prize: string }[]; goal?: { col: number; row: number }; [k: string]: unknown };
type Def = Area & { id: string; world: number; slot: number; name: string; areas?: Area[]; noSecrets?: string };
type Registry = {
  register(d: unknown): boolean; get(id: string): Def | null; list(): string[]; problems(): string[];
  validate(d: unknown): string[]; lint(d: unknown): string[]; fileFor(id: string): string | null; ready: boolean;
};

function sandbox() {
  const errors: string[] = [];
  const ctx: Record<string, unknown> = { console: { error: (m: string) => errors.push(m), log: () => undefined } };
  ctx.self = ctx;
  createContext(ctx);
  const run = (rel: string): void => { runInContext(readFileSync(join(LEVELS, rel), 'utf8'), ctx, { filename: rel }); };
  run('registry.js');
  return { ctx, errors, run, K: ctx.KinanLevels as Registry };
}

/* the same rule as tools/levels-manifest.mjs: every *.js in levels/wNN/ except _drafts */
function filesOnDisk(): string[] {
  return readdirSync(LEVELS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^w\d\d$/.test(d.name)).map((d) => d.name).sort()
    .flatMap((w) => readdirSync(join(LEVELS, w)).filter((f) => f.endsWith('.js') && !f.startsWith('_')).sort().map((f) => `${w}/${f}`));
}
function manifestFiles(): string[] {
  const ctx: Record<string, unknown> = {};
  ctx.self = ctx;
  createContext(ctx);
  runInContext(readFileSync(join(LEVELS, 'manifest.js'), 'utf8'), ctx);
  return [...(ctx.KINAN_LEVEL_FILES as string[])];
}
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

describe('level files (M4b)', () => {
  it('the manifest lists exactly the level files on disk (else run: node tools/levels-manifest.mjs)', () => {
    expect(manifestFiles()).toEqual(filesOnDisk());
    expect(filesOnDisk().length).toBeGreaterThan(0);
  });

  it('every level file registers exactly one level, in its own file, with no problems', () => {
    for (const file of manifestFiles()) {
      const s = sandbox();
      s.run(file);
      expect(s.errors, file).toEqual([]);
      expect(s.K.problems(), file).toEqual([]);
      expect(s.K.list(), file).toHaveLength(1);
      const id = s.K.list()[0];
      expect(s.K.fileFor(id), `${file} must hold level ${id}`).toBe(file);
    }
  });

  it('all levels load together: unique ids, unique map slots per world, the loader reports ready', () => {
    const s = sandbox();
    expect(s.K.ready).toBe(true);   /* no document in Node: the registry is ready at once */
    for (const file of manifestFiles()) s.run(file);
    expect(s.errors).toEqual([]);
    expect(s.K.problems()).toEqual([]);
    const ids = s.K.list();
    expect(new Set(ids).size).toBe(ids.length);
    const slots = ids.map((id) => `${s.K.get(id)!.world}:${s.K.get(id)!.slot}`);
    expect(new Set(slots).size, 'two levels claim the same stop on a world map').toBe(slots.length);
  });

  it('every level passes the design-rule lint (toys per screen, flats, gaps per act, secrets)', () => {
    const s = sandbox();
    for (const file of manifestFiles()) s.run(file);
    for (const id of s.K.list()) expect(s.K.lint(s.K.get(id)), id).toEqual([]);
  });

  it('the template stays a clean, copyable example (problem- and lint-free)', () => {
    const s = sandbox();
    s.run('_template.js');
    expect(s.errors).toEqual([]);
    expect(s.K.list()).toHaveLength(1);
    expect(s.K.lint(s.K.get(s.K.list()[0]))).toEqual([]);
    expect(manifestFiles()).not.toContain('_template.js');
  });

  it('1-5 THE FRONT YARD carries the Wild Yard design (WORLD1-LEVEL-DESIGN §2.4) with the picket arch as its goal', () => {
    const s = sandbox();
    s.run('w01/l05.js');
    const d = s.K.get('1-5')!;
    expect(d).toMatchObject({ world: 1, slot: 5, name: 'THE FRONT YARD', cols: 162, theme: 5 });
    expect(d.heights).toHaveLength(162);
    expect(d.secrets!.map((x) => x.kind)).toEqual(['visible', 'hidden', 'skill']);
    expect(d.goldenCandle).toEqual({ col: 38, row: 9 });
    expect(d.checkpoint).toEqual({ col: 96, row: 11 });
    expect(d.goal).toEqual({ col: 160, row: 11 });
    expect(d.foes).toHaveLength(10);
    expect(d.candles).toHaveLength(29);
  });
});

describe('the registry refuses what would break the engine (problems)', () => {
  const base = (): Def => {
    const s = sandbox();
    s.run('_template.js');
    return clone(s.K.get(s.K.list()[0])!);
  };
  const problems = (d: unknown): string[] => sandbox().K.validate(d);

  it('a clean level has no problems', () => { expect(problems(base())).toEqual([]); });
  it('ids follow the world-slot pattern and match the world', () => {
    expect(problems({ ...base(), id: '1-9' }).join()).toMatch(/id "1-9"/);
    expect(problems({ ...base(), id: '12-1', world: 12 }).join()).toMatch(/worlds 1-11/);
    expect(problems({ ...base(), id: '2-3' }).join()).toMatch(/world must be 2/);
  });
  it('heights: only flat, 2:1 or 1:1 steps, on the tile grid, never a zigzag', () => {
    const cliff = base(); cliff.heights[10] = 144;
    expect(problems(cliff).join()).toMatch(/step of/);
    const odd = base(); odd.heights[0] = 188;
    expect(problems(odd).join()).toMatch(/multiple of 8/);
    const zig = base(); zig.heights.splice(0, 3, 192, 184, 192);
    expect(problems(zig).join()).toMatch(/zigzag/);
    const short = base(); short.heights.pop();
    expect(problems(short).join()).toMatch(/exactly cols/);
  });
  it('cells stay inside the area, one goal, known gift prizes', () => {
    const out = base(); out.candles = [[60, 3]];
    expect(problems(out).join()).toMatch(/outside the area/);
    const noGoal = base(); delete noGoal.goal;
    expect(problems(noGoal).join()).toMatch(/exactly one goal/);
    const gift = base(); gift.tiles = { gift: [[9, 8, 'pizza']] };
    expect(problems(gift).join()).toMatch(/gift prize "pizza"/);
  });
  it('registering the same id twice is refused (one file per level)', () => {
    const s = sandbox();
    expect(s.K.register(base())).toBe(true);
    expect(s.K.register(base())).toBe(false);
    expect(s.K.problems().join()).toMatch(/registered twice/);
    expect(s.errors.length).toBeGreaterThan(0);   /* loud on console.error -> the e2e gate fails too */
  });
});

describe('the lint holds the design rules (docs/LEVEL-AUTHORING.md §5)', () => {
  const base = (): Def => {
    const s = sandbox();
    s.run('_template.js');
    return clone(s.K.get(s.K.list()[0])!);
  };
  const lint = (d: unknown): string[] => sandbox().K.lint(d);

  it('no flat run over 8 tiles without a toy, foe, coin run or wall', () => {
    const d = base();
    d.heights = d.heights.map((h, c) => (c >= 27 && c <= 43 ? 192 : h));
    d.tiles = { gift: d.tiles!.gift!, spring: [] }; d.foes = [[5, 11, 'sock']]; d.candles = []; d.solid = [];   /* cols 20-43: one bare flat */
    d.secrets = [{ kind: 'visible', col: 50, row: 7, prize: 'heart' }, { kind: 'hidden', col: 51, row: 6, prize: 'GOLDEN CANDLE' }, { kind: 'skill', col: 52, row: 7, prize: 'hat' }];
    d.goldenCandle = { col: 51, row: 6 };
    expect(lint(d).join()).toMatch(/flat run at cols/);
  });
  it('gaps per act: 3 / 4 / 5 tiles', () => {
    const d = base(); d.heights.splice(14, 4, null, null, null, null);
    expect(lint(d).join()).toMatch(/act 1 allows 3/);
  });
  it('every screen has a toy', () => {
    const d = base();
    d.tiles = {}; d.pipes = []; d.foes = [[40, 11, 'sock']];
    d.secrets = [{ kind: 'visible', col: 45, row: 7, prize: 'heart' }, { kind: 'hidden', col: 34, row: 6, prize: 'GOLDEN CANDLE' }, { kind: 'skill', col: 49, row: 7, prize: 'hat' }];
    expect(lint(d).join()).toMatch(/screen 1 \(cols 0-26\) has no toy/);
  });
  it('a regular level hides 3 secrets + a golden candle (or says why not)', () => {
    const d = base(); d.secrets = d.secrets!.slice(0, 2);
    expect(lint(d).join()).toMatch(/exactly 3 secrets/);
    expect(lint({ ...d, noSecrets: 'a story corridor' })).toEqual([]);
  });
});

describe('wiring: the page and the service worker see every level', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  it('index.html loads the manifest, then the registry, before the game script', () => {
    const m = html.indexOf('<script src="levels/manifest.js"></script>');
    const r = html.indexOf('<script src="levels/registry.js"></script>');
    const game = html.indexOf("'use strict';");
    expect(m).toBeGreaterThan(0);
    expect(r).toBeGreaterThan(m);
    expect(game).toBeGreaterThan(r);
  });
  it('sw.js precaches the registry, the manifest and every manifest file (cache version bumped)', () => {
    expect(sw).toContain("importScripts('./levels/manifest.js')");
    expect(sw).toContain("'./levels/manifest.js'");
    expect(sw).toContain("'./levels/registry.js'");
    expect(sw).toContain("(self.KINAN_LEVEL_FILES || []).map((f) => './levels/' + f)");
    expect(sw).not.toMatch(/kinan-vs-mom-v(3[0-4]|[12]\d|\d)'/);   /* v35: engine pass A changed index.html and levels/w01/l04.js */
  });
});

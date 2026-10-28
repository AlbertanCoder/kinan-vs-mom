import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

/* The overworld map's data (map/worlds/*.js, docs/OVERWORLD-MAP.md) against the level files
   (levels/wNN/*.js): the game launches the level whose world + slot match the stop number, so a
   stop's kind and number must agree with the file at that slot. No browser: the world files run in
   a Node vm with a stub of the engine's helpers (they only register data and drawing functions). */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const WORLD_FILES = ['w01', 'w02', 'w03', 'w04', 'w05', 'w06', 'w06t', 'w07', 'w08', 'w09', 'w09t', 'w10', 'w11', 'w12'];

type Stop = { at: [number, number]; name: string; st: string };
type World = { n: number; travel?: boolean; stops: Stop[]; entryPath?: unknown; exitPath?: unknown; edges?: [unknown, unknown, ...unknown[]][] };
type Def = { id: string; world: number; slot: number; kind?: string };

function loadWorlds(): World[] {
  const W: World[] = [];
  const noop = (): void => undefined;
  const K: Record<string, unknown> = {
    W, P: {}, A: {}, GROUND: {}, RIM: {}, LINE: {}, CLIFFS: {}, WATER: {},
    px: noop, box: noop, shadow: noop, spr: noop, txt: noop, poly: noop, mapleLeaf: noop, polyDist: () => 0,
    hash: (a: number, b: number) => { let n = (a * 374761393 + b * 668265263) | 0; n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) / 4294967295; },
    homes: (list: [number, number, string][]) => list.map(([a, b, c]) => ['home', a, b, c]),
    textW: (s: string) => String(s).length * 4, g: () => ({}),
  };
  const ctx: Record<string, unknown> = { KINAN: K, Math, console };
  ctx.window = ctx;
  createContext(ctx);
  for (const f of WORLD_FILES) runInContext(readFileSync(join(ROOT, 'map', 'worlds', `${f}.js`), 'utf8'), ctx, { filename: `${f}.js` });
  return W.slice().sort((a, b) => a.n - b.n);
}
function loadLevels(): Def[] {
  const defs: Def[] = [];
  const ctx: Record<string, unknown> = { KinanLevels: { register: (d: Def) => { defs.push(d); return true; } } };
  ctx.self = ctx;
  createContext(ctx);
  runInContext(readFileSync(join(ROOT, 'levels', 'manifest.js'), 'utf8'), ctx);
  for (const f of ctx.KINAN_LEVEL_FILES as string[]) runInContext(readFileSync(join(ROOT, 'levels', f), 'utf8'), ctx, { filename: f });
  return defs;
}
const kindOf = (s: Stop): string => (s.st === 'open' || s.st === 'lock' || s.st === 'red' ? 'level' : s.st);

const worlds = loadWorlds();
const levels = loadLevels();

describe('the overworld map data (map/worlds)', () => {
  it('has Worlds 1-12 plus the two road trips (6.5 and 9.5)', () => {
    expect(worlds.map((w) => w.n)).toEqual([1, 2, 3, 4, 5, 6, 6.5, 7, 8, 9, 9.5, 10, 11, 12]);
    expect(worlds.filter((w) => w.travel).map((w) => w.n)).toEqual([6.5, 9.5]);
  });

  it('every world has 11 stops: 8 levels, a fort, a secret and the castle last', () => {
    for (const w of worlds.filter((v) => !v.travel)) {
      const kinds = w.stops.map(kindOf);
      expect(kinds, `World ${w.n}`).toHaveLength(11);
      expect(kinds.filter((k) => k === 'level'), `World ${w.n}`).toHaveLength(8);
      expect(kinds.filter((k) => k === 'fort'), `World ${w.n}`).toHaveLength(1);
      expect(kinds.filter((k) => k === 'secret'), `World ${w.n}`).toHaveLength(1);
      expect(kinds[10], `World ${w.n}`).toBe('boss');
    }
  });

  it('every level file sits on the stop of its world and slot, with the same kind and number', () => {
    expect(levels.length).toBeGreaterThan(0);
    for (const d of levels) {
      const w = worlds.find((v) => v.n === d.world && !v.travel);
      expect(w, d.id).toBeTruthy();
      const s = w!.stops[d.slot - 1];
      expect(s, `${d.id}: no stop ${d.slot} on World ${d.world}'s map`).toBeTruthy();
      const kind = /-fort$/.test(d.id) ? 'fort' : /-secret$/.test(d.id) ? 'secret' : /-castle$/.test(d.id) ? 'boss' : 'level';
      expect(kindOf(s), `${d.id} is on "${s.name}"`).toBe(kind);
      if (kind === 'level') expect(s.name.split('  ')[0], `${d.id} is on "${s.name}"`).toBe(d.id);
    }
  });

  it('the regular stops are numbered N-1 … N-8 in trail order on every world', () => {
    for (const w of worlds.filter((v) => !v.travel)) {
      const nums = w.stops.filter((s) => kindOf(s) === 'level').map((s) => s.name.split('  ')[0]);
      expect(nums, `World ${w.n}`).toEqual([1, 2, 3, 4, 5, 6, 7, 8].map((k) => `${w.n}-${k}`));
    }
  });

  it('the worlds join up: every world from 1 to 9 exits where the next one (or its road trip) enters', () => {
    for (let k = 0; k < worlds.length - 1; k++) {
      const a = worlds[k], b = worlds[k + 1];
      if (a.n >= 10) continue;   /* 10 -> 11 is the glitch, 11 -> 12 the 2D -> 3D transition */
      expect(!!a.exitPath, `World ${a.n} exit`).toBe(true);
      expect(!!b.entryPath, `World ${b.n} entry`).toBe(true);
    }
  });
});

/* every runtime file of the map, World 12 and the fonts is precached (offline after one load), and the
   whole precache stays phone-sized */
function filesUnder(dir: string): string[] {
  return readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? filesUnder(`${dir}/${d.name}`) : [`${dir}/${d.name}`]));
}
describe('the offline cache (sw.js) carries the map, World 12 and the fonts', () => {
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  const listed = (src: string): string[] => [...src.matchAll(/'\.\/([^']+)'/g)].map((m) => m[1]);
  const mapList = listed(/const MAP_FILES = \[([\s\S]*?)\];/.exec(sw)![1]);
  it('lists every .js / .html / .css / .woff2 file in map/, 3d/ and fonts/ (and nothing that is not there)', () => {
    const onDisk = ['map', '3d', 'fonts'].flatMap(filesUnder).filter((f) => /\.(js|html|css|woff2)$/.test(f)).sort();
    expect(mapList.slice().sort()).toEqual(onDisk);
    expect(sw).toContain('.concat(MAP_FILES)');
  });
  it('the whole precache is under 30 MB', () => {
    const base = listed(/const ASSETS = \[([\s\S]*?)\]/.exec(sw)![1]).filter((f) => f !== '');
    const levelFiles = (() => { const c: Record<string, unknown> = {}; c.self = c; createContext(c); runInContext(readFileSync(join(ROOT, 'levels', 'manifest.js'), 'utf8'), c); return (c.KINAN_LEVEL_FILES as string[]).map((f) => `levels/${f}`); })();
    const all = [...new Set(['index.html', ...base, ...levelFiles, ...mapList])];
    const bytes = all.reduce((n, f) => n + statSync(join(ROOT, f)).size, 0);
    console.log(`precache: ${all.length} files, ${(bytes / 1048576).toFixed(2)} MB`);
    expect(bytes).toBeLessThan(30 * 1048576);
  });
});

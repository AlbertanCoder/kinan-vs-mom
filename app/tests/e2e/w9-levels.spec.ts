import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* World 9 — Montreal, the level files (2026-10-29; the castle and the bosses come in the second run). For every World 9
   level file:
   - it is registered as World 9 on the right map stop and passes the gate (no problems, no lint),
   - it reaches LEVEL CLEAR with the plain dev bot (auto(30, {run: true}), god mode, foes cleared) with 0 pit falls
     (no search fallback, as World 8's spec),
   - every secret is reachable: from a spot on the main path just before it, a best-first search over real-input moves
     (god mode, foes cleared, a move that drops into a pit is cut off) finds it (SECRET n/3 marked),
   - a full-run jump off every high spot comes down on floor,
   - each level's twist exists and does its thing, and each level wears its own Montreal look (110-119),
   - 9-6's secret exit (in the launch tube) opens 9-secret on the World 9 map,
   - the memory gift (his stomp rocket, on its stand) is remembered in 9-6, Annie speaks over her drones in 9-3 and 9-8,
   - no page errors anywhere. */

const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';
const W9 = ['1', '2', '3', '4', '5', 'fort', '6', 'secret', '7', '8', 'castle'].map((s) => `9-${s}`);   /* 9-castle: added by the second run (2026-10-29) */
/* the map stop each file stands on (map/worlds/w09.js: the secret comes right after 9-6, the space centre) */
const SLOT: Record<string, number> = { '9-1': 1, '9-2': 2, '9-3': 3, '9-4': 4, '9-5': 5, '9-fort': 6, '9-6': 7, '9-secret': 8, '9-7': 9, '9-8': 10, '9-castle': 11 };
/* each level's own look (index.html MTL_LOOKS): theme number and backdrop */
const LOOK: Record<string, [number, string]> = {
  '9-1': [110, 'oldmtl'], '9-2': [111, 'oldport'], '9-3': [112, 'metro'], '9-4': [113, 'mountroyal'], '9-5': [114, 'biodome'],
  '9-fort': [115, 'olympic'], '9-6': [116, 'spacectr'], '9-7': [117, 'lofts'], '9-8': [118, 'confhall'], '9-secret': [119, 'undercity'],
  '9-castle': [120, 'confstage']
};
/* where each secret's route starts: a flat column of the main path just before it (in the level's own columns) */
const SECRET_FROM: Record<string, number[]> = {
  '9-1': [113, 86, 246],
  '9-2': [117, 110, 246],
  '9-3': [111, 83, 163],
  '9-4': [56, 123, 246],
  '9-5': [105, 78, 190],
  '9-6': [30, 216, 112],
  '9-7': [27, 90, 244],
  '9-8': [86, 127, 244]
};
/* the high spots with a pit after them: a full-run jump off each must come down on floor. from..to is the top of the
   spot, top its row (Kinan's feet on it), pits the first column of each pit ahead that a jump from there could come
   down in. */
const HIGH: { id: string; what: string; from: number; to: number; top: number; pits: number[] }[] = [
  { id: '9-1', what: 'the first facade roof', from: 74, to: 79, top: 6, pits: [98] },
  { id: '9-1', what: 'the flower balcony', from: 119, to: 121, top: 6, pits: [141] },
  { id: '9-1', what: 'the second facade roof', from: 208, to: 213, top: 5, pits: [230] },
  { id: '9-1', what: 'the bell tower ledge', from: 249, to: 251, top: 3, pits: [] },
  { id: '9-2', what: 'the clock tower quay (the cable catches him)', from: 57, to: 65, top: 10, pits: [66, 74, 89] },
  { id: '9-2', what: 'the container stack', from: 121, to: 124, top: 6, pits: [141] },
  { id: '9-2', what: 'the ferry quay (the cable catches him)', from: 169, to: 176, top: 10, pits: [177, 184, 199] },
  { id: '9-2', what: 'the clock tower ledge', from: 250, to: 252, top: 3, pits: [] },
  { id: '9-3', what: 'the parked train (last car)', from: 44, to: 51, top: 10, pits: [52, 91] },
  { id: '9-3', what: 'the mezzanine', from: 108, to: 115, top: 8, pits: [116, 141] },
  { id: '9-3', what: 'the high ledge over the concourse', from: 160, to: 162, top: 4, pits: [181] },
  { id: '9-3', what: 'the second train (car D)', from: 209, to: 218, top: 10, pits: [219] },
  { id: '9-4', what: 'the summit rock', from: 63, to: 65, top: 5, pits: [85] },
  { id: '9-4', what: 'the wooden-stairs plateau', from: 93, to: 98, top: 7, pits: [99, 141] },
  { id: '9-4', what: 'the big rock stairs', from: 159, to: 161, top: 5, pits: [162, 179] },
  { id: '9-4', what: 'the windy ridge', from: 205, to: 210, top: 6, pits: [211, 223] },
  { id: '9-4', what: 'the telescope platform', from: 250, to: 252, top: 1, pits: [] },
  { id: '9-5', what: 'the root tunnel roof', from: 81, to: 85, top: 8, pits: [97] },
  { id: '9-5', what: 'the puffin rock', from: 106, to: 108, top: 6, pits: [128] },
  { id: '9-5', what: 'the iceberg', from: 201, to: 204, top: 7, pits: [205, 223] },
  { id: '9-5', what: 'the snowy ledge', from: 202, to: 204, top: 3, pits: [205, 223] },
  { id: '9-fort', what: 'the leaning ledges', from: 94, to: 96, top: 4, pits: [110] },
  { id: '9-fort', what: "the top of the tower's back (down to the deck)", from: 162, to: 166, top: 6, pits: [167] },
  { id: '9-6', what: 'the zero-g shelf (light gravity)', from: 36, to: 38, top: 6, pits: [84] },
  { id: '9-6', what: 'the training wall (light gravity)', from: 60, to: 67, top: 7, pits: [84] },
  { id: '9-6', what: 'the first moon rock (light gravity)', from: 176, to: 177, top: 7, pits: [200] },
  { id: '9-6', what: 'the second moon rock (light gravity)', from: 181, to: 182, top: 7, pits: [200] },
  { id: '9-6', what: 'the launch tower (light gravity)', from: 116, to: 118, top: 8, pits: [140] },
  { id: '9-6', what: 'the rocket nose (light gravity)', from: 119, to: 121, top: 3, pits: [140] },
  { id: '9-7', what: 'the desks', from: 29, to: 31, top: 10, pits: [50] },
  { id: '9-7', what: 'the bookshelf', from: 32, to: 34, top: 6, pits: [50] },
  { id: '9-7', what: 'the standing whiteboard before chair bridge 2', from: 153, to: 154, top: 10, pits: [168] },
  { id: '9-7', what: 'the giant standing whiteboard', from: 211, to: 212, top: 10, pits: [225] },
  { id: '9-7', what: 'the first boardroom shelf', from: 250, to: 251, top: 6, pits: [] },
  { id: '9-7', what: 'the top boardroom shelf', from: 254, to: 256, top: 2, pits: [] },
  { id: '9-8', what: 'the demo booth', from: 45, to: 47, top: 10, pits: [72] },
  { id: '9-8', what: 'the jumbotron ledge', from: 88, to: 90, top: 6, pits: [104] },
  { id: '9-8', what: "the prize booth's counter", from: 129, to: 132, top: 8, pits: [148] },
  { id: '9-8', what: 'the speaker stack', from: 250, to: 251, top: 8, pits: [] },
  { id: '9-8', what: 'the lighting rig', from: 253, to: 255, top: 4, pits: [] }
];

type Secret = { kind: string; col: number; row: number; prize: string; exit?: string };
type Area = { cols: number; heights: (number | null)[]; secrets?: Secret[]; talk?: [number, string, string, number?][] };
type LevelDef = Area & { id: string; world: number; slot: number; kind?: string; theme?: number; areas?: Area[]; goal: { col: number; row: number } };
type MapState = { mounted: boolean; busy: boolean; world: number | null; at: number; walking: boolean; crossing: boolean; banner: string | null; notice: string | null; celebrate?: number | null; stops: { id: string | null; kind: string; built: boolean; state: string | null }[] };
type Dev = {
  playLevel: (id: string) => unknown;
  levelInfo: () => { id: string | null; cleared: boolean; returned: boolean; toast: string; candles: number; secretsFound: boolean[]; secretExit: { tx: number; ty: number; to: string; open: boolean } | null; look: { theme: number; bg: string | null; place: string | null } | null };
  levels: () => { levels: { id: string; problems: string[]; lint: string[] }[] };
  godMode: () => void;
  clearFoes: () => void;
  place: (x: number, y: number) => unknown;
  step: (n: number, hold?: Record<string, boolean>) => { x: number; y: number; onGround: boolean }[];
  tile: (tx: number, ty: number) => number;
  mapState: () => MapState;
  progress: () => { levelsBeaten: Record<string, number>; unlockedLevels: string[] };
  owRelease: (n: number) => number;
};
type Win = { __k11: Dev; KinanLevels: { ready: boolean; list: () => string[]; get: (id: string) => LevelDef } };

const fixture = (name: string): string =>
  readFileSync(fileURLToPath(new URL(`../fixtures/saves/${name}`, import.meta.url)), 'utf8');

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/* the sample save (no pets along: Ginger's higher jump is not what the levels were built for) */
async function boot(page: Page): Promise<void> {
  await page.addInitScript(({ key, raw }) => {
    if (sessionStorage.getItem('kv-seeded')) return;
    const data = JSON.parse(raw);
    data.pets = { ids: [], names: {} };
    delete data.explorer;
    localStorage.setItem(key, JSON.stringify(data));
    sessionStorage.setItem('kv-seeded', '1');
  }, { key: CURRENT, raw: fixture('kinan-remaster-v1.sample.json') });
  await page.goto(DEV_URL);
  await page.waitForFunction(() => {
    const w = window as unknown as Win;
    return typeof w.__k11 === 'object' && !!w.KinanLevels && w.KinanLevels.ready;
  });
}

/* the plain dev bot: auto(30, {run: true}) from the spawn, god mode, foes cleared (geometry only), no search fallback */
const ROUTE = `(id) => {
  const k = window.__k11;
  k.playLevel(id); k.godMode(); k.clearFoes();
  let n = 0, far = 0;
  const fellNear = [];
  for (; n < 500 && !k.levelInfo().cleared; n++) {
    const x0 = k.probe().x, f0 = k.levelInfo().falls || 0;
    k.auto(30, { run: true });
    far = Math.max(far, Math.floor(k.probe().x / 16));
    if ((k.levelInfo().falls || 0) > f0) fellNear.push(Math.floor(x0 / 16));
  }
  return { cleared: k.levelInfo().cleared, n, falls: k.levelInfo().falls || 0, fellNear, far, at: [Math.floor(k.probe().x / 16), Math.floor(k.probe().y / 16)] };
}`;

/* reach secret number k of a level (w8-levels.spec.ts's SEEK, unchanged): stand Kinan on the main path at column
   'from', then a best-first search over real-input moves until the level marks that secret found. */
const SEEK = `(id, k, from) => {
  const K = window.__k11, def = window.KinanLevels.get(id);
  const list = def.areas || [def], H = [], secs = [];
  let base = 0;
  for (const a of list) { for (const h of a.heights) H.push(h); for (const s of a.secrets || []) secs.push(Object.assign({}, s, { col: s.col + base })); base += a.cols; }
  const sec = secs[k];
  const fresh = () => { K.playLevel(id); K.godMode(); K.clearFoes(); };
  fresh();
  const tx = sec.col * 16 + 8, ty = sec.row * 16 + 8;
  const still = { left: false, right: false, jump: false, fire: false };
  K.place(from * 16 + 3, H[from] - 16); K.step(12, still);
  const found = () => !!K.levelInfo().secretsFound[k];
  if (found()) return { found: true, tries: 0, from };
  const MOVES = [];
  for (const d of [1, -1]) {
    MOVES.push({ d, run: 0, tap: false, hold: 0, len: 16, fire: false });
    MOVES.push({ d, run: 0, tap: true, hold: 4, len: 70, fire: false });
    MOVES.push({ d, run: 0, tap: true, hold: 12, len: 90, fire: false });
    MOVES.push({ d, run: 0, tap: true, hold: 30, len: 110, fire: false });
    MOVES.push({ d, run: 14, tap: true, hold: 30, len: 120, fire: true });
    MOVES.push({ d, run: 6, tap: true, hold: 30, len: 120, fire: true });
  }
  MOVES.push({ d: 0, run: 0, tap: true, hold: 30, len: 90, fire: false });
  const key = (p) => Math.round(p.x / 6) + ':' + Math.round(p.y / 6);
  const dist = (p) => Math.abs(p.x + 5 - tx) + Math.abs(p.y + 8 - ty) * 1.5;
  const p0 = K.probe(), open = [{ x: p0.x, y: p0.y }], seen = new Set([key(p0)]);
  let tries = 0;
  while (open.length && tries < 3000) {
    open.sort((p, q) => dist(p) - dist(q));
    const s = open.shift();
    for (const m of MOVES) {
      tries++;
      K.place(s.x, s.y); K.step(1, still);
      let fell = false, last = null, air = false;
      const hold = { left: m.d < 0, right: m.d > 0, fire: m.fire, jump: false };
      for (let f = 0; f < m.run && !fell; f++) { last = K.step(1, hold)[0]; fell = last.y > 236; if (found()) return { found: true, tries, from }; }
      for (let g = 0; g < m.len && !fell; g++) {
        last = K.step(1, Object.assign({}, hold, { jump: m.tap && g < m.hold, tapJump: m.tap && g === 0 }))[0];
        if (found()) return { found: true, tries, from };
        fell = last.y > 236;
        if (!last.onGround) air = true;
        if (m.tap && air && last.onGround) break;
      }
      for (let g = 0; g < 8 && !fell; g++) { last = K.step(1, still)[0]; fell = last.y > 236; }
      if (found()) return { found: true, tries, from };
      if (K.levelInfo().cleared) { fresh(); continue; }
      if (fell || !last || !last.onGround || seen.has(key(last))) continue;
      seen.add(key(last)); open.push({ x: last.x, y: last.y });
    }
  }
  return { found: false, tries, from, kind: sec.kind, at: [sec.col, sec.row] };
}`;

test.describe('World 9 · the level files', () => {
  test('all 10 World 9 level files are registered as World 9 on their map stops, pass the gate and wear their own Montreal look', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const reg = await page.evaluate(() => {
      const w = window as unknown as Win;
      const all = w.KinanLevels.list();
      const ids = all.filter((id) => id.startsWith('9-'));
      const defs = ids.map((id) => { const d = w.KinanLevels.get(id); w.__k11.playLevel(id); return { id, world: d.world, slot: d.slot, theme: d.theme, look: w.__k11.levelInfo().look, pet: 'pet' in d || (d.areas || []).some((a) => 'pet' in a) }; });
      const lv = w.__k11.levels().levels.filter((x) => x.id.startsWith('9-'));
      /* Worlds 1-8 never wear a Montreal look */
      const borrowed = all.filter((id) => !id.startsWith('9-')).map((id) => [id, w.KinanLevels.get(id).theme]).filter(([, t]) => typeof t === 'number' && (t as number) >= 110 && (t as number) <= 119);
      return { ids, defs, bad: lv.filter((x) => x.problems.length || x.lint.length), borrowed };
    });
    expect([...reg.ids].sort()).toEqual([...W9].sort());
    expect(reg.bad).toEqual([]);
    expect(reg.borrowed, 'no level outside World 9 wears a Montreal look').toEqual([]);
    for (const d of reg.defs) {
      expect(d.world, d.id).toBe(9);
      expect(d.slot, d.id).toBe(SLOT[d.id]);
      expect(d.theme, `${d.id} wears its own Montreal look`).toBe(LOOK[d.id][0]);
      expect(d.look && d.look.bg, `${d.id}: the look's backdrop`).toBe(LOOK[d.id][1]);
      expect(d.pet, `${d.id}: no pet crate (all six are found by World 5)`).toBe(false);
    }
    expect(new Set(reg.defs.map((d) => d.theme)).size, 'ten levels, ten different looks').toBe(reg.defs.length);
    expect(errors).toEqual([]);
  });

  test('every Montreal backdrop draws (each level shown for a second at its start, middle and end) with no page error', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const out = await page.evaluate((ids) => {
      const w = window as unknown as Win & { __k11: { probe: () => { x: number } } }, k = w.__k11;
      return ids.filter((id) => !!w.KinanLevels.get(id)).map((id) => {
        const d = w.KinanLevels.get(id), H = (d.areas || [d]).flatMap((a) => a.heights);
        k.playLevel(id); k.godMode(); k.clearFoes();
        const spots = [3, Math.floor(H.length / 2), H.length - 4].map((c) => { let x = c; while (x > 0 && H[x] == null) x--; return x; });
        for (const c of spots) { k.place(c * 16 + 3, (H[c] as number) - 40); k.step(40, {}); }
        return { id, look: k.levelInfo().look };
      });
    }, W9);
    for (const o of out) expect(o.look && o.look.theme, o.id).toBe(LOOK[o.id][0]);
    expect(errors).toEqual([]);
  });

  test('no World 9 foe starts inside a block or waits at a lip, no block hangs over a take-off, and no candle is lost inside a block', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const out = await page.evaluate((ids) => {
      const w = window as unknown as Win, k = w.__k11;
      return ids.filter((id) => !!w.KinanLevels.get(id)).map((id) => {
        const d = w.KinanLevels.get(id);
        const list = (d.areas || [d]) as (Area & { foes?: [number, number, string][]; candles?: [number, number][] })[];
        k.playLevel(id);
        const FLYERS = ['plane', 'camera', 'brush', 'ghost', 'sparkler', 'crow', 'mosquito', 'magpie', 'goose', 'seagull', 'umbrellabat', 'raincloud', 'scanner', 'deleter'];
        const badFoes: number[][] = [], atLip: (number | string)[][] = [], overTakeoff: number[][] = [];
        let base = 0, authored = 0;
        for (const a of list) {
          const H = a.heights, tiles = (a as unknown as { tiles?: { gift?: number[][]; brick?: number[][] } }).tiles || {};
          for (const f of a.foes || []) {
            const t = k.tile(base + f[0], f[1]);
            if (t !== 0) badFoes.push([base + f[0], f[1], t]);
            const onGround = H[f[0]] != null && f[1] === (H[f[0]] as number) / 16 - 1;
            if (!FLYERS.includes(f[2]) && onGround && (H[f[0] - 1] === null || H[f[0] + 1] === null)) atLip.push([base + f[0], f[1], f[2]]);
          }
          for (const g of [...(tiles.gift || []), ...(tiles.brick || [])]) {
            const c = g[0], h = H[c];
            if (h != null && H[c + 1] === null && g[1] >= h / 16 - 5 && g[1] < h / 16) overTakeoff.push([base + c, g[1]]);
          }
          authored += (a.candles || []).length;
          base += a.cols;
        }
        return { id, badFoes, atLip, overTakeoff, authored, live: k.levelInfo().candles };
      });
    }, W9);
    for (const o of out) {
      expect(o.badFoes, `${o.id}: foes inside blocks [col, row, tile]`).toEqual([]);
      expect(o.atLip, `${o.id}: walkers or hoppers waiting at a lip [col, row, type]`).toEqual([]);
      expect(o.overTakeoff, `${o.id}: blocks over a gap's take-off column [col, row]`).toEqual([]);
      expect(o.live, `${o.id}: every authored candle is in the level`).toBe(o.authored);
    }
    expect(errors).toEqual([]);
  });

  test('a full-run jump off every World 9 high spot comes down on floor, with a tile to spare before the next pit', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    await boot(page);
    const out = await page.evaluate((spots) => {
      type Probe = { x: number; y: number; vx: number; vy: number; onGround: boolean };
      const k = (window as unknown as Win).__k11 as unknown as Omit<Dev, 'step'> & { step: (n: number, hold?: Record<string, boolean>) => Probe[]; probe: () => Probe };
      const still = { left: false, right: false, jump: false, fire: false };
      const go = { left: false, right: true, jump: false, fire: true };
      return spots.map((s) => {
        k.playLevel(s.id); k.godMode(); k.clearFoes();
        const start = (): void => { k.place(s.from * 16 + 1, s.top * 16 - 16); k.step(30, still); };
        start();
        let leave = 0;
        while (leave < 120 && k.step(1, go)[0].onGround) leave++;
        const res: { d: number; v0: number; landed: boolean; x: number; room: number }[] = [];
        for (let d = -10; d <= 7; d++) {
          start();
          if (leave + d > 0) k.step(leave + d, go);
          const v0 = k.probe().vx;
          let p = k.step(1, Object.assign({}, go, { jump: true, tapJump: true }))[0];
          if (p.vy > -4) continue;   /* no jump came out (past the coyote time): not a jump off the spot */
          let air = !p.onGround;
          for (let f = 0; f < 300 && p.y <= 236; f++) {
            p = k.step(1, Object.assign({}, go, { jump: f < 30 }))[0];
            if (!p.onGround) air = true;
            else if (air) break;
          }
          const landed = air && p.onGround && p.y <= 236;
          const pit = s.pits.find((c) => c * 16 > p.x);
          res.push({ d, v0: Math.round(v0 * 100) / 100, landed, x: Math.round(p.x), room: pit === undefined ? 999 : pit * 16 - (p.x + 10) });
        }
        return { id: s.id, what: s.what, leave, res };
      });
    }, HIGH);
    for (const o of out) {
      const far = o.res.reduce((m, r) => Math.max(m, r.x), 0), fast = o.res.reduce((m, r) => Math.max(m, r.v0), 0);
      const tight = o.res.reduce((m, r) => Math.min(m, r.room), 999);
      console.log(`${o.id} ${o.what}: ${o.res.length} jumps (top speed ${fast} px/f), farthest landing x=${far} (column ${Math.floor(far / 16)}), least floor left before the next pit ${tight} px`);
      expect(o.res.length, `${o.id} ${o.what}: jumps tried`).toBeGreaterThan(10);
      expect(fast, `${o.id} ${o.what}: Kinan reached full run speed (RUN_MAX 3.2)`).toBeGreaterThanOrEqual(3.1);
      for (const r of o.res) {
        expect(r.landed, `${o.id} ${o.what}: jump at frame ${r.d} from the edge lands on floor (x=${r.x})`).toBe(true);
        expect(r.room, `${o.id} ${o.what}: jump at frame ${r.d} from the edge leaves a tile of floor before the next pit (x=${r.x})`).toBeGreaterThanOrEqual(16);
      }
    }
    expect(errors).toEqual([]);
  });

  for (const id of W9) {
    test(`${id} reaches LEVEL CLEAR with the plain dev bot, no pit falls`, async ({ page }) => {
      test.setTimeout(240_000);
      const errors = watchErrors(page);
      await boot(page);
      const r = await page.evaluate(({ id, route }) => (0, eval)(route)(id), { id, route: ROUTE }) as { cleared: boolean; n: number; falls: number; fellNear: number[]; far: number; at: number[] };
      console.log(`${id} LEVEL CLEAR: ${r.cleared ? 'CLEAR' : 'NOT CLEAR'} n=${r.n} pit falls ${r.falls}` + (r.falls ? ' (a chunk starting near column ' + r.fellNear.join(', ') + ')' : '') + (r.cleared ? '' : ` (got to column ${r.far}, stopped at ${JSON.stringify(r.at)})`));
      expect(r.cleared, `${id}: the plain dev bot reaches the goal`).toBe(true);
      expect(r.falls, `${id}: pit falls on the way`).toBe(0);
      expect(errors).toEqual([]);
    });
  }

  for (const id of Object.keys(SECRET_FROM)) {
    test(`${id}: every secret is reachable from the main path`, async ({ page }) => {
      test.setTimeout(240_000);
      const errors = watchErrors(page);
      await boot(page);
      const out = await page.evaluate(({ id, from, seek }) => {
        const def = (window as unknown as Win).KinanLevels.get(id);
        const n = (def.areas || [def]).reduce((s, a) => s + (a.secrets || []).length, 0);
        return { n, res: from.map((col, k) => (0, eval)(seek)(id, k, col)) };
      }, { id, from: SECRET_FROM[id], seek: SEEK }) as { n: number; res: { found: boolean; tries: number; from: number }[] };
      console.log(`${id} secrets: ` + out.res.map((r, k) => `#${k + 1} ${r.found ? 'found' : 'NOT FOUND'} (${r.tries} moves from c${r.from})`).join(' · '));
      expect(out.res.length, `${id}: a route start for every secret`).toBe(out.n);
      for (const [k, r] of out.res.entries()) expect(r, `${id} secret #${k + 1}`).toMatchObject({ found: true });
      expect(errors).toEqual([]);
    });
  }
});

/* ---- the twists: each World 9 level's own trick exists and does its thing (scripts run in the page) ---- */
test.describe('World 9 · the twists', () => {
  test('9-1 twist: THE BALCONIES and THE CARRIAGES. Kinan jumps up through a balcony and stands on it; three carriages roll the street; one carries him on its roof for 2 s', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('9-1'); k.godMode(); k.clearFoes();
      const info = k.twistInfo();
      const balconies = info.skins.filter((s) => s[0] === 'balcony').length;
      /* under the first balcony (c8-10, row 9): one jump up through it, and he stands on it */
      k.place(9 * 16 + 3, 176); k.step(5, still);
      k.step(1, { jump: true, tapJump: true }); k.step(40, { jump: true }); k.step(40, still);
      const onBalcony = k.probe();
      const xs = info.rollers.map(() => []), ys = info.rollers.map(() => []);
      for (let f = 0; f < 400; f++) { k.step(1, still); k.twistInfo().rollers.forEach((m, i) => { xs[i].push(m.x); ys[i].push(m.y); }); }
      const span = (a) => Math.round((Math.max(...a) - Math.min(...a)) * 10) / 10;
      const m0 = k.twistInfo().rollers[0];
      k.place(m0.x + m0.w / 2 - 5, m0.y - 24); k.step(12, still);
      const on = k.twistInfo().rollers[0].riding;
      let rode = 0; const kx = [];
      for (let f = 0; f < 120; f++) { const p = k.step(1, still)[0]; if (k.twistInfo().rollers[0].riding && p.onGround) rode++; kx.push(p.x); }
      return { balconies, onBalcony: { y: Math.round(onBalcony.y), onGround: onBalcony.onGround }, looks: info.rollers.map((m) => m.look), xSpan: xs.map(span), ySpan: ys.map(span), on, rode, moved: span(kx), falls: k.levelInfo().falls || 0 };
    })()`) as { balconies: number; onBalcony: { y: number; onGround: boolean }; looks: string[]; xSpan: number[]; ySpan: number[]; on: boolean; rode: number; moved: number; falls: number };
    console.log('9-1 balconies and carriages: ' + JSON.stringify(r));
    expect(r.balconies, 'iron balconies').toBeGreaterThanOrEqual(6);
    expect(r.onBalcony, 'he stands on the balcony (row 9)').toEqual({ y: 9 * 16 - 16, onGround: true });
    expect(r.looks).toEqual(['carriage', 'carriage', 'carriage']);
    for (const s of r.xSpan) expect(s, 'each carriage rolls along the street').toBeGreaterThanOrEqual(15);
    for (const s of r.ySpan) expect(s, 'a carriage rolls level (no bob)').toBe(0);
    expect(r.on, 'Kinan lands on the roof').toBe(true);
    expect(r.rode, 'it carries him for the whole 2 s').toBe(120);
    expect(r.moved, 'the carriage carried him along').toBeGreaterThan(20);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test('9-2 twist: THE ZIP LINES. Jump up under a cable and Kinan catches it, slides down it faster and faster, lets go at the far mast and lands on the quay; a fresh JUMP lets go early', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('9-2'); k.godMode(); k.clearFoes();
      const info = k.twistInfo();
      /* under Z2 (c31 -> c47) near its start: one jump straight up */
      k.place(32 * 16 + 3, 176); k.step(5, still);
      k.step(1, { jump: true, tapJump: true });
      let caught = -1;
      for (let f = 0; f < 30 && caught < 0; f++) { k.step(1, { jump: true }); if (k.twistInfo().zipping) caught = f; }
      const a = k.probe(); k.step(10, still); const b = k.probe(); k.step(30, still); const c = k.probe();
      const mid = k.twistInfo();
      k.step(150, still);
      const end = k.probe(), after = k.twistInfo();
      /* again, and let go after a quarter second with a fresh JUMP press */
      k.place(32 * 16 + 3, 176); k.step(5, still);
      k.step(1, { jump: true, tapJump: true }); k.step(20, { jump: true }); k.step(15, still);
      const held = k.twistInfo().zipping;
      k.step(1, { jump: true, tapJump: true }); k.step(2, { jump: true });
      const letGo = k.twistInfo();
      return { zips: info.zips.length, caught, v1: Math.round((b.x - a.x) * 10) / 100, v2: Math.round((c.x - b.x) * 10) / 300, down: Math.round(c.y - a.y), midZipping: mid.zipping,
        end: { x: Math.round(end.x), y: Math.round(end.y), onGround: end.onGround }, rides: after.zipRides, zippingAtEnd: after.zipping, held, letGo: letGo.zipping, grabs: letGo.grabs, falls: k.levelInfo().falls || 0 };
    })()`) as { zips: number; caught: number; v1: number; v2: number; down: number; midZipping: boolean; end: { x: number; y: number; onGround: boolean }; rides: number; zippingAtEnd: boolean; held: boolean; letGo: boolean; grabs: number; falls: number };
    console.log('9-2 zip lines: ' + JSON.stringify(r));
    expect(r.zips, 'eight zip lines over the harbour').toBe(8);
    expect(r.caught, 'his hands catch the cable on the way up').toBeGreaterThanOrEqual(0);
    expect(r.midZipping, 'still on the cable 40 frames later').toBe(true);
    expect(r.v2, 'faster and faster (px a frame)').toBeGreaterThan(r.v1);
    expect(r.down, 'the cable runs downhill').toBeGreaterThan(0);
    expect(r.rides, 'he let go at the far mast').toBeGreaterThanOrEqual(1);
    expect(r.zippingAtEnd).toBe(false);
    expect(r.end.onGround, 'and landed on the quay').toBe(true);
    expect(r.end.y).toBe(176);
    expect(r.end.x, 'past the far mast (c47)').toBeGreaterThan(47 * 16);
    expect(r.held, 'hanging on').toBe(true);
    expect(r.letGo, 'a fresh JUMP lets go').toBe(false);
    expect(r.grabs).toBeGreaterThanOrEqual(2);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test("9-3 twist: THE ESCALATORS and ANNIE'S SCANNER DRONES. An escalator carries Kinan down (or up) while he stands still, the wrong-way one pulls him back; a scanner's beam BEEPs when he walks into it and the drone follows him; Annie speaks over her drones", async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('9-3'); k.godMode();
      const info = k.twistInfo(), def = window.KinanLevels.get('9-3'), H = def.heights;
      const ride = (c, n) => { k.place(c * 16 + 3, H[c] - 20); k.step(6, still); const a = k.probe(); k.step(n, still); const b = k.probe(); return { dx: Math.round(b.x - a.x), dy: Math.round(b.y - a.y), onGround: b.onGround, esc: k.twistInfo().esc }; };
      /* the first scanner, over the mezzanine (c71): stand on the mezzanine under it, in its beam */
      const scanners = () => k.kickInfo().foes.map((f, i) => Object.assign({ i }, f)).filter((f) => f.type === 'scanner');
      k.place(70 * 16, 128 - 16); k.step(2, still);
      const s0 = scanners().sort((a, b) => Math.abs(a.x - 71 * 16) - Math.abs(b.x - 71 * 16))[0];
      let scans = 0;
      for (let f = 0; f < 140 && !scans; f++) { k.place(k.kickInfo().foes[s0.i].x + 1, 128 - 16); k.step(1, still); scans = k.twistInfo().scans; }
      const fx0 = k.kickInfo().foes[s0.i].x;
      k.place(fx0 + 56, 128 - 16); k.step(50, still);
      const fx1 = k.kickInfo().foes[s0.i].x;
      const down = ride(11, 50), up = ride(62, 40), wrong = ride(154, 40);
      const annie = def.talk.filter((t) => t[1] === 'ANNIE').map((t) => t[2]);
      return { escs: info.escs.length, down, up, wrong, drones: scanners().length, scans, followed: Math.round(fx1 - fx0), annie };
    })()`) as { escs: number; down: { dx: number; dy: number; onGround: boolean; esc: number }; up: { dx: number; dy: number; onGround: boolean; esc: number }; wrong: { dx: number; dy: number; onGround: boolean; esc: number }; drones: number; scans: number; followed: number; annie: string[] };
    console.log('9-3 escalators and scanners: ' + JSON.stringify(r));
    expect(r.escs, 'nine escalators').toBe(9);
    expect(r.down.dx, 'down the long escalator, standing still').toBeGreaterThanOrEqual(40);
    expect(r.down.dy, 'and down').toBeGreaterThan(15);
    expect(r.up.dx, 'up an escalator, standing still').toBeGreaterThanOrEqual(30);
    expect(r.up.dy, 'and up').toBeLessThan(-10);
    expect(r.wrong.dx, 'the wrong-way escalator pulls him back').toBeLessThanOrEqual(-25);
    expect(r.drones, "Annie's scanner drones").toBeGreaterThanOrEqual(12);
    expect(r.scans, 'its beam scanned him').toBeGreaterThanOrEqual(1);
    expect(r.followed, 'and the drone followed him').toBeGreaterThanOrEqual(25);
    expect(r.annie.length, 'Annie speaks over her drones').toBeGreaterThanOrEqual(2);
    expect(r.annie.join(' ')).toContain("Chalo, drones! (Let's go!)");
    expect(errors).toEqual([]);
  });

  test('9-4 twist: THE CLIMB and THE WIND. The dev bot climbs eight tiles from the foot of the mountain to the lookout; near the top a gust is warned for 1 s, then pushes Kinan back, and never off the ledge he stands on', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('9-4'); k.godMode(); k.clearFoes();
      const def = window.KinanLevels.get('9-4'), H = def.heights;
      let top = 999;
      for (let n = 0; n < 400 && !k.levelInfo().cleared; n++) { k.auto(10, { run: true }); const p = k.probe(); if (p.onGround) top = Math.min(top, p.y); }
      const climbed = { from: H[def.spawn.col], to: H[def.goal.col], highestFeet: top + 16, cleared: k.levelInfo().cleared };
      /* the gust on the windy ridge: stand still in the middle of c205-210, then right at its left lip (the c200-204 pit) */
      const gust = (x) => {
        k.playLevel('9-4'); k.godMode(); k.clearFoes();
        k.place(x, 96 - 16); k.step(5, still);
        let warnAt = -1, gustAt = -1;
        for (let f = 0; f < 340 && gustAt < 0; f++) { const t = k.twistInfo(); if (t.warn && warnAt < 0) warnAt = f; if (t.gustOn && t.gust > 0) gustAt = f; k.step(1, still); }
        const x0 = k.probe().x; k.step(80, still); const p = k.probe();
        return { warnAt, gustAt, pushed: Math.round(p.x - x0), onGround: p.onGround, falls: k.levelInfo().falls || 0, gusts: k.twistInfo().gusts };
      };
      return { wind: k.twistInfo().wind, climbed, mid: gust(208 * 16), lip: gust(205 * 16 + 1) };
    })()`) as { wind: number; climbed: { from: number; to: number; highestFeet: number; cleared: boolean }; mid: { warnAt: number; gustAt: number; pushed: number; onGround: boolean; falls: number; gusts: number }; lip: { warnAt: number; gustAt: number; pushed: number; onGround: boolean; falls: number; gusts: number } };
    console.log('9-4 climb and wind: ' + JSON.stringify(r));
    expect(r.climbed.from - r.climbed.to, 'the lookout is eight tiles above the foot of the mountain').toBe(128);
    expect(r.climbed.cleared).toBe(true);
    expect(r.climbed.highestFeet, 'the bot climbed to the lookout').toBeLessThanOrEqual(80);
    expect(r.wind, 'windy columns near the top').toBeGreaterThan(60);
    expect(r.mid.warnAt, 'the gust is warned first').toBeGreaterThanOrEqual(0);
    expect(r.mid.gustAt - r.mid.warnAt, 'a full second of warning').toBeGreaterThanOrEqual(55);
    expect(r.mid.pushed, 'the gust pushed him back').toBeLessThan(-4);
    expect(r.mid.onGround).toBe(true);
    expect(r.lip.onGround, 'never off the ledge he stands on').toBe(true);
    expect(r.lip.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test('9-5 twist: THE BIODOME FLOORS. The rainforest moss slows Kinan to a walk, the wet floor by the waterfall and the cold zone\'s ice make him slide on; penguins waddle in the cold zone', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('9-5'); k.godMode();
      const info = k.twistInfo();
      const penguins = k.kickInfo().foes.filter((f) => f.type === 'penguin').length;
      k.clearFoes();
      /* run right at full speed, let go once Kinan's middle is past column 'at', measure how far he slides (7-3's way) */
      const slide = (from, at) => {
        k.place(from * 16 + 3, 176); k.step(3, {});
        let g = 0;
        while (k.probe().x + 5 < at * 16 + 8 && g++ < 300) k.step(1, { right: true, fire: true });
        const x0 = k.probe().x, v0 = k.probe().vx;
        let n = 0;
        while (Math.abs(k.probe().vx) > 0 && n < 300) { k.step(1, still); n++; }
        return { d: Math.round(k.probe().x - x0), v0: Math.round(v0 * 100) / 100, onGround: k.probe().onGround };
      };
      const plain = slide(16, 22), wet = slide(59, 61), icy = slide(179, 184);
      /* the first moss (c9-14, floor 192): the top speed on it, and just before it */
      k.place(2 * 16 + 3, 176); k.step(3, {});
      let mossTop = 0, before = 0, g = 0;
      while (k.probe().x + 5 < 15 * 16 && g++ < 400) {
        const p = k.step(1, { right: true, fire: true })[0], c = Math.floor((p.x + 5) / 16);
        if (c >= 12 && c <= 14 && p.onGround) mossTop = Math.max(mossTop, Math.abs(p.vx));
        if (c >= 6 && c <= 8) before = Math.max(before, Math.abs(p.vx));
      }
      return { moss: info.moss, slime: info.slime, ice: info.ice, penguins, plain, wet, icy, mossTop, before, falls: k.levelInfo().falls || 0 };
    })()`) as { moss: number; slime: number; ice: number; penguins: number; plain: { d: number; v0: number; onGround: boolean }; wet: { d: number; v0: number; onGround: boolean }; icy: { d: number; v0: number; onGround: boolean }; mossTop: number; before: number; falls: number };
    console.log('9-5 biodome floors: ' + JSON.stringify(r));
    expect(r.moss, 'moss columns in the rainforest').toBe(11);
    expect(r.slime, "the waterfall's wet floor").toBe(8);
    expect(r.ice, 'the cold zone is ice to the end').toBe(130);
    expect(r.before, 'full run before the moss').toBeGreaterThan(3);
    expect(r.mossTop, 'a slow walk on the moss').toBeLessThanOrEqual(1.2);
    expect(r.mossTop).toBeGreaterThan(0.5);
    expect(r.wet.d, 'on the wet floor he slides more than twice as far before he stops').toBeGreaterThan(r.plain.d * 2);
    expect(r.icy.d, 'on the ice he slides more than twice as far before he stops').toBeGreaterThan(r.plain.d * 2);
    expect(r.wet.onGround && r.icy.onGround, 'and stays on the floor').toBe(true);
    expect(r.penguins, 'penguins in the cold zone').toBeGreaterThanOrEqual(10);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test("9-fort twist: THE TILTED CLIMB. The leaning tower's climb only slopes up; the lift track carries Kinan up the slant while he stands still; the leaning ledges step up to the right; the dev bot climbs to the top; the observation deck leaves 24+ flat empty tiles for the boss", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('9-fort'); k.godMode(); k.clearFoes();
      const info = k.twistInfo(), def = window.KinanLevels.get('9-fort'), H = def.heights;
      let up = 0, down = 0;
      for (let c = 1; c < H.length; c++) if (H[c] != null && H[c - 1] != null && H[c] !== H[c - 1]) { if (Math.abs(H[c] - H[c - 1]) <= 16) { if (H[c] < H[c - 1]) up++; else down++; } }
      const ride = (c, n) => { k.place(c * 16 + 3, H[c] - 20); k.step(6, still); const a = k.probe(); k.step(n, still); const b = k.probe(); return { dx: Math.round(b.x - a.x), dy: Math.round(b.y - a.y), esc: k.twistInfo().esc }; };
      const lift1 = ride(67, 40), lift2 = ride(118, 24);
      const ledges = [k.tile(91, 6) !== 0, k.tile(94, 4) !== 0, k.tile(91, 4) === 0];
      k.playLevel('9-fort'); k.godMode(); k.clearFoes();
      let top = 999;
      for (let n = 0; n < 400 && !k.levelInfo().cleared; n++) { k.auto(10, { run: true }); const p = k.probe(); if (p.onGround) top = Math.min(top, p.y); }
      /* the boss's ground: the flattest run of floor before the goal, and nothing in c195-221 */
      let flat = 0, run = 0;
      for (let c = 1; c < def.goal.col; c++) { run = H[c] != null && H[c] === H[c - 1] ? run + 1 : 0; flat = Math.max(flat, run + 1); }
      const inArena = (c) => c >= 195 && c <= 221;
      const stuff = [...def.foes.filter((f) => inArena(f[0])), ...def.candles.filter((c) => inArena(c[0])), ...(def.tiles.gift || []).filter((g) => inArena(g[0])), ...(def.tiles.brick || []).filter((g) => inArena(g[0]))];
      return { escs: info.escs.length, up, down, lift1, lift2, ledges, climbed: { from: H[def.spawn.col], highestFeet: top + 16, cleared: k.levelInfo().cleared }, flat, stuff: stuff.length, arena: def.arena ? { col: def.arena.col, cols: def.arena.cols, boss: def.arena.boss } : null };
    })()`) as { escs: number; up: number; down: number; lift1: { dx: number; dy: number; esc: number }; lift2: { dx: number; dy: number; esc: number }; ledges: boolean[]; climbed: { from: number; highestFeet: number; cleared: boolean }; flat: number; stuff: number; arena: { col: number; cols: number; boss: string } | null };
    console.log('9-fort tilted climb: ' + JSON.stringify(r));
    expect(r.escs, 'two lift tracks').toBe(2);
    expect(r.up, 'the climb slopes up (slope columns)').toBeGreaterThanOrEqual(14);
    expect(r.down, 'and never slopes back down').toBe(0);
    expect(r.lift1.dx, 'lift track 1 carries him while he stands still').toBeGreaterThanOrEqual(30);
    expect(r.lift1.dy, 'up the slant').toBeLessThan(-10);
    expect(r.lift2.dy, 'lift track 2 too').toBeLessThan(-10);
    expect(r.ledges, 'the leaning ledges: two steps, the higher one further right').toEqual([true, true, true]);
    expect(r.climbed.cleared).toBe(true);
    expect(r.climbed.from - r.climbed.highestFeet, 'the bot climbed seven tiles up the tower').toBeGreaterThanOrEqual(112);
    expect(r.flat, 'flat open ground for the boss (second run)').toBeGreaterThanOrEqual(24);
    expect(r.stuff, 'the boss ground c195-221 is empty').toBe(0);
    /* 2026-10-29 (the second run): the hunter drone's arena stands on that empty ground, where the header said (it was "no arena yet") */
    expect(r.arena, 'the hunter drone on the observation deck').toEqual({ col: 196, cols: 24, boss: 'hunter-drone' });
    expect(errors).toEqual([]);
  });

  test('9-6 twist: LOW GRAVITY. In a training zone the same jump floats far higher and stays up longer; outside it the jump is the normal one; his stomp rocket is remembered', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('9-6'); k.godMode(); k.clearFoes();
      const info = k.twistInfo(), def = window.KinanLevels.get('9-6');
      /* one held jump straight up from the floor (row 12): how high, how long in the air, and was he in light gravity */
      const hop = (c) => {
        k.place(c * 16 + 3, 176); k.step(10, still);
        const y0 = k.probe().y; let top = y0, air = 0, low = false;
        k.step(1, { jump: true, tapJump: true });
        for (let f = 0; f < 240; f++) { const p = k.step(1, { jump: f < 40 })[0]; top = Math.min(top, p.y); if (k.twistInfo().inLow) low = true; if (p.onGround) break; air++; }
        return { rise: Math.round(y0 - top), air, low };
      };
      const plain = hop(10), light = hop(46), moon = hop(180);
      const memory = def.talk.filter((t) => t[1] === 'KINAN' && /stomp rocket/i.test(t[2])).map((t) => t[0]);
      const prop = def.skins.filter((s) => s[0] === 'stomprocket').map((s) => s.slice(1));   /* the pixel prop on its stand */
      const old = JSON.stringify(def).match(/figurine/gi) || [];
      /* the training wall (c60) and the moon rocks (c176, c181): five tiles up from the floor */
      const rocks = [60, 176, 181].map((c) => { let top = 12; while (top > 0 && k.tile(c, top - 1) !== 0) top--; return (12 - top) * 16; });
      return { lowGrav: info.lowGrav, plain, light, moon, memory, prop, old: old.length, rocks, falls: k.levelInfo().falls || 0 };
    })()`) as { lowGrav: number; plain: { rise: number; air: number; low: boolean }; light: { rise: number; air: number; low: boolean }; moon: { rise: number; air: number; low: boolean }; memory: number[]; prop: number[][]; old: number; rocks: number[]; falls: number };
    console.log('9-6 low gravity: ' + JSON.stringify(r));
    expect(r.lowGrav, 'three light-gravity zones').toBe(111);
    expect(r.plain.low).toBe(false);
    expect(r.plain.rise, 'the normal full jump (about 4.3 tiles)').toBeLessThanOrEqual(72);
    expect(r.light.low && r.moon.low, 'in the training room and on the moon walk').toBe(true);
    expect(r.light.rise, 'a floaty jump: over 6 tiles high').toBeGreaterThanOrEqual(100);
    expect(r.light.air, 'and much longer in the air').toBeGreaterThan(r.plain.air * 1.4);
    expect(r.moon.rise).toBeGreaterThanOrEqual(100);
    for (const h of r.rocks) {
      expect(h, 'the training wall and the moon rocks: higher than a normal jump goes').toBeGreaterThan(r.plain.rise);
      expect(h, 'but a floaty jump clears them').toBeLessThan(r.light.rise);
    }
    /* 2026-10-29 (Shad): the age-9 memory gift is his stomp rocket now (it was the feelings figurines) */
    expect(r.memory, 'Kinan remembers his stomp rocket (age 9), as he reaches the exhibit hall').toEqual([248]);
    expect(r.prop, 'the stomp rocket stands on its display stand in the exhibit hall').toEqual([[252, 10, 253, 11]]);
    expect(r.old, 'the old gift is gone').toBe(0);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test('9-secret twist: THE LONG TUNNEL RUN. Three long tunnels whose roofs no full jump bumps, two moving walkways, and candles on nearly every tile', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('9-secret'); k.godMode(); k.clearFoes();
      const def = window.KinanLevels.get('9-secret'), info = k.twistInfo();
      let roofCols = 0;
      for (let c = 0; c < def.cols; c++) if (k.tile(c, 4) !== 0 && k.tile(c, 3) !== 0) roofCols++;
      const hop = (c) => { k.place(c * 16 + 3, 176); k.step(10, still); const y0 = k.probe().y; let top = y0; k.step(1, { jump: true, tapJump: true }); for (let f = 0; f < 120; f++) { const p = k.step(1, { jump: f < 40 })[0]; top = Math.min(top, p.y); if (p.onGround) break; } return Math.round(y0 - top); };
      return { candles: k.levelInfo().candles, cols: def.cols, roofCols, belts: info.belts.length, open: hop(60), tunnel: [hop(32), hop(90), hop(145)] };
    })()`) as { candles: number; cols: number; roofCols: number; belts: number; open: number; tunnel: number[] };
    console.log('9-secret tunnel run: ' + JSON.stringify(r));
    expect(r.candles, 'candles on nearly every tile').toBeGreaterThanOrEqual(r.cols);
    expect(r.roofCols, 'three long tunnels').toBeGreaterThanOrEqual(75);
    expect(r.belts, 'two moving walkways').toBe(2);
    for (const t of r.tunnel) expect(t, 'a full jump in a tunnel goes as high as in the open (the roof is never bumped)').toBe(r.open);
    expect(errors).toEqual([]);
  });

  test('9-7 twist: THINGS ON WHEELS and THE WHITEBOARD MAZE. Chairs and scooters roll level; standing still on a chair bridge carries Kinan over the gap; hanging whiteboards are walked under, standing ones hopped over', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('9-7'); k.godMode(); k.clearFoes();
      const info = k.twistInfo();
      const xs = info.rollers.map(() => []), ys = info.rollers.map(() => []);
      for (let f = 0; f < 600; f++) { k.step(1, still); k.twistInfo().rollers.forEach((m, i) => { xs[i].push(m.x); ys[i].push(m.y); }); }
      const span = (a) => Math.round((Math.max(...a) - Math.min(...a)) * 10) / 10;
      /* CHAIR BRIDGE 1 (rollers[1], over the 3 gap c50-52): wait for it at the near lip, step onto its far half, hold still */
      let g = 0;
      while (g++ < 1200 && k.twistInfo().rollers[1].x > 49 * 16) k.step(1, still);
      const m = k.twistInfo().rollers[1];
      k.place(m.x + m.w - 11, m.y - 16); k.step(1, still);
      let rode = 0, end = k.probe();
      for (let f = 0; f < 600; f++) { end = k.step(1, still)[0]; if (k.twistInfo().rollers[1].riding) rode++; else if (rode > 0 && end.onGround) break; }
      /* walk (no jump) under the first hanging whiteboard (c112-113) */
      k.place(109 * 16, 176); k.step(5, still);
      let maxY = 0, minY = 999;
      for (let f = 0; f < 70; f++) { const p = k.step(1, { right: true })[0]; maxY = Math.max(maxY, p.y); minY = Math.min(minY, p.y); }
      const under = { x: Math.round(k.probe().x), minY: Math.round(minY), maxY: Math.round(maxY) };
      const boards = info.skins.filter((s) => s[0] === 'whiteboard');
      const hanging = boards.filter((s) => k.tile(s[1], 9) !== 0 && k.tile(s[1], 10) === 0 && k.tile(s[1], 11) === 0).length;
      const standing = boards.filter((s) => k.tile(s[1], 10) !== 0 && k.tile(s[1], 11) !== 0 && k.tile(s[1], 9) === 0).length;
      return { looks: info.rollers.map((q) => q.look), xSpan: xs.map(span), ySpan: ys.map(span), rode, end: { x: Math.round(end.x), y: Math.round(end.y), onGround: end.onGround }, under, hanging, standing, falls: k.levelInfo().falls || 0 };
    })()`) as { looks: string[]; xSpan: number[]; ySpan: number[]; rode: number; end: { x: number; y: number; onGround: boolean }; under: { x: number; minY: number; maxY: number }; hanging: number; standing: number; falls: number };
    console.log('9-7 wheels and whiteboards: ' + JSON.stringify(r));
    expect(r.looks).toEqual(['chair', 'chair', 'scooter', 'chair', 'scooter']);
    for (const s of r.xSpan) expect(s, 'each chair and scooter rolls').toBeGreaterThanOrEqual(15);
    for (const s of r.ySpan) expect(s, 'and rolls level').toBe(0);
    expect(r.rode, 'the chair carried him').toBeGreaterThanOrEqual(60);
    expect(r.end.onGround, 'and he stands on the far side').toBe(true);
    expect(r.end.y).toBe(176);
    expect(r.end.x + 10, 'onto the far lip (c53)').toBeGreaterThan(53 * 16);
    expect(r.under.x, 'he walked under the hanging whiteboard').toBeGreaterThan(114 * 16);
    expect([r.under.minY, r.under.maxY], 'on the floor the whole way').toEqual([176, 176]);
    expect(r.hanging, 'hanging whiteboards').toBeGreaterThanOrEqual(5);
    expect(r.standing, 'standing whiteboards').toBeGreaterThanOrEqual(5);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test("9-8 twist: ANNIE'S FIREWALLS and DELETION DRONES. A firewall opens, flickers a warning, shuts and opens again; shutting never traps Kinan; the corridor opens left to right as a wave; a deletion drone drifts after him; Annie speaks over her drones", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('9-8'); k.godMode();
      const def = window.KinanLevels.get('9-8'), info = k.twistInfo();
      const drones = k.kickInfo().foes.map((f, i) => Object.assign({ i }, f)).filter((f) => f.type === 'deleter');
      /* a deletion drone (the one over the demo stage, c93): Kinan on the stage 3 tiles to its right */
      const d0 = drones.sort((a, b) => Math.abs(a.x - 93 * 16) - Math.abs(b.x - 93 * 16))[0];
      const dx0 = k.kickInfo().foes[d0.i].x;
      k.place(dx0 + 48, 160 - 16); k.step(60, still);
      const dx1 = k.kickInfo().foes[d0.i].x;
      k.clearFoes();
      /* F1 (c38) over 480 frames: open, warning, shut, open again */
      let open = 0, shut = 0, reopened = false, warnFirst = false, prevWarn = false, wasShut = false;
      for (let f = 0; f < 480; f++) { k.step(1, still); const w = k.twistInfo().fws[0]; if (w.solid) { shut++; if (!wasShut && prevWarn) warnFirst = true; wasShut = true; } else { open++; if (wasShut) reopened = true; } prevWarn = w.warn; }
      /* never trapped: stand in F1's column while it flickers, until it shuts */
      let g = 0;
      while (g++ < 600 && !k.twistInfo().fws[0].warn) k.step(1, still);
      const push0 = k.twistInfo().fwPush;
      k.place(38 * 16 + 3, 176); k.step(1, still);
      g = 0;
      while (g++ < 120 && !k.twistInfo().fws[0].solid) { k.place(38 * 16 + 3, 176); k.step(1, still); }
      k.step(2, still);
      const p = k.probe(), inWall = k.tile(Math.floor((p.x + 5) / 16), Math.floor((p.y + 8) / 16)) !== 0;
      /* THE FIREWALL CORRIDOR (F4-F7): the frame each one opens in its cycle goes up from left to right */
      const opens = def.firewalls.slice(3, 7).map((f) => (f[3] - f[5]) % f[3]);
      const annie = def.talk.filter((t) => t[1] === 'ANNIE').map((t) => t[2]);
      return { fws: info.fws.length, open, shut, warnFirst, reopened, pushed: k.twistInfo().fwPush - push0, inWall, x: Math.round(p.x), opens, deleters: drones.length, chased: Math.round(dx1 - dx0), annie, falls: k.levelInfo().falls || 0 };
    })()`) as { fws: number; open: number; shut: number; warnFirst: boolean; reopened: boolean; pushed: number; inWall: boolean; x: number; opens: number[]; deleters: number; chased: number; annie: string[]; falls: number };
    console.log('9-8 firewalls and deletion drones: ' + JSON.stringify(r));
    expect(r.fws, 'thirteen firewalls').toBe(13);
    expect(r.open, 'F1 is open part of the time').toBeGreaterThan(100);
    expect(r.shut, 'and shut part of the time').toBeGreaterThan(100);
    expect(r.warnFirst, 'it flickers a warning before it shuts').toBe(true);
    expect(r.reopened, 'and opens again').toBe(true);
    expect(r.pushed, 'shutting put him out of the wall').toBeGreaterThanOrEqual(1);
    expect(r.inWall, 'never inside the shut wall').toBe(false);
    expect(r.opens, 'the corridor opens left to right, 20 frames apart').toEqual([0, 20, 40, 60]);
    expect(r.deleters, "Annie's deletion drones").toBeGreaterThanOrEqual(6);
    expect(r.chased, 'the drone drifted after him').toBeGreaterThanOrEqual(10);
    expect(r.annie.length, 'Annie speaks over her drones').toBeGreaterThanOrEqual(2);
    expect(r.annie.join(' ')).toContain("Chalo! (Let's go!)");
    expect(r.annie.join(' ')).toContain('Shabash, Kinan! (Well done!)');
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });
});

/* ---- World 9 on the map: 9-6's secret exit opens 9-secret ---- */
async function mapNow(page: Page): Promise<MapState> { return page.evaluate(() => (window as unknown as Win).__k11.mapState()); }
async function settle(page: Page, timeout = 60_000): Promise<MapState> {
  await page.waitForFunction(() => { const k = (window as unknown as Win).__k11 as Dev & { cut: () => { on: boolean } }; const s = k.mapState(); return s.mounted && !s.walking && !s.crossing && !s.busy && !s.banner && !k.cut().on; }, null, { timeout });
  return mapNow(page);
}
/* a save standing on a World 9 stop, every level before it beaten (World 9 opened on the map with owRelease(9)) */
async function seedWorld9(page: Page, at: string): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
  await page.evaluate(({ key, at }) => {
    const w = window as unknown as Win, K = w.KinanLevels, me = K.get(at), beaten: Record<string, number> = {};
    w.__k11.owRelease(9);
    const ids = K.list();
    for (const id of ids) { const d = K.get(id); if (!/secret/.test(id) && (d.world < me.world || (d.world === me.world && d.slot < me.slot))) beaten[id] = 1; }
    localStorage.setItem(key, JSON.stringify({ unlocked: 1, beaten: [], introSeen: true, beltSeen: 8, levelsBeaten: beaten, unlockedLevels: ids.filter((id) => /secret/.test(id) && K.get(id).world < me.world), escapes: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1 }, wmap: { w: 9, at: me.slot - 1 } }));
  }, { key: CURRENT, at });
  await page.reload();
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
}

test.describe('World 9 · on the map', () => {
  test("9-6's secret exit (in the launch tube): bump the glinting block, walk through the door -> SECRET LEVEL FOUND! and the 9-secret stop opens", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await seedWorld9(page, '9-6');
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    const secretAt = s0.stops.findIndex((q) => q.kind === 'secret');
    expect(s0.stops[s0.at].id).toBe('9-6');
    expect(s0.stops[secretAt]).toMatchObject({ id: '9-secret', state: 'locked' });
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe('9-6');
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11, def = (window as unknown as Win).KinanLevels.get('9-6');
      const list = def.areas || [def];
      let base = 0, s: Secret | null = null;
      for (const a of list) { const q = (a.secrets || []).find((x) => x.exit); if (q && !s) s = Object.assign({}, q, { col: q.col + base }); base += a.cols; }
      k.godMode(); k.clearFoes();
      const closed = k.levelInfo().secretExit;
      let fy = s!.row + 1; while (fy < 15 && !k.tile(s!.col, fy)) fy++;
      for (const dx of [2, -6, 8]) {
        if (k.levelInfo().secretExit!.open) break;
        k.place(s!.col * 16 + dx, fy * 16 - 16); k.step(15, {});
        k.step(45, { jump: true, tapJump: true }); k.step(40, { jump: false });
      }
      const X = k.levelInfo().secretExit!;
      if (X.open) { k.place(X.tx * 16 + 3, X.ty * 16); k.step(80, {}); }
      const toast = k.levelInfo().toast;
      for (let n = 0; n < 900 && !k.levelInfo().returned; n++) k.step(1);
      return { to: s!.exit, closed, opened: X.open, toast, returned: k.levelInfo().returned, unlocked: k.progress().unlockedLevels };
    });
    expect(r.to).toBe('9-secret');
    expect(r.closed!.open).toBe(false);
    expect(r.opened).toBe(true);
    expect(r.toast).toContain('SECRET EXIT FOUND');
    expect(r.unlocked).toContain('9-secret');
    expect(r.returned).toBe(true);
    await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy; });
    const s1 = await mapNow(page);
    expect(s1.notice).toBe('SECRET LEVEL FOUND!');
    expect(s1.stops[secretAt]).toMatchObject({ id: '9-secret', kind: 'secret', state: 'open' });
    expect(s1.celebrate).toBe(secretAt);
    expect(errors).toEqual([]);
  });
});

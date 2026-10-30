import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* World 10 — Niagara Falls, the level files (2026-10-29; the second run added the castle, 10-castle, and the bosses: the fights
   themselves are in w10-world.spec.ts). For every World 10 level file:
   - it is registered as World 10 on the right map stop and passes the gate (no problems, no lint),
   - it reaches LEVEL CLEAR with the plain dev bot (auto(30, {run: true}), god mode, foes cleared) with 0 pit falls
     (no search fallback, as Worlds 8 and 9),
   - every secret is reachable: from a spot on the main path just before it, a best-first search over real-input moves
     (god mode, foes cleared, a move that drops into a pit is cut off) finds it (SECRET n/3 marked),
   - a full-run jump off every high spot comes down on floor,
   - no candle is lost inside a block, no foe starts inside one or waits at a lip,
   - each level's twist exists and does its thing, and each level wears its own Niagara look (NIA_LOOKS 200-209),
   - 10-6's secret exit (off the cable car) unlocks 10-secret,
   - the memory gift (the Chicken Rider popcorn bucket and the Idol Hunter light stick) is remembered in 10-1,
   - no page errors anywhere.
   (World 10 is open on the map since the second run: w10-world.spec.ts. These specs start the levels with ?devtools=1.) */

const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';
const W10 = ['1', '2', '3', '4', '5', 'fort', '6', 'secret', '7', '8', 'castle'].map((s) => `10-${s}`);   /* 10-castle: added in the second run */
/* the map stop each file stands on (map/worlds/w10.js: the secret comes right after 10-6, the cable car) */
const SLOT: Record<string, number> = { '10-1': 1, '10-2': 2, '10-3': 3, '10-4': 4, '10-5': 5, '10-fort': 6, '10-6': 7, '10-secret': 8, '10-7': 9, '10-8': 10, '10-castle': 11 };
/* each level's own look (index.html NIA_LOOKS): theme number and backdrop. 200-210, not 120-129: MTL_LOOKS 120 is World 9's castle. */
const LOOK: Record<string, [number, string]> = {
  '10-1': [200, 'niaclifton'], '10-2': [201, 'niaboat'], '10-3': [202, 'niabehind'], '10-4': [203, 'niatower'], '10-5': [204, 'niaconserv'],
  '10-fort': [205, 'niapicnic'], '10-6': [206, 'niawhirl'], '10-7': [207, 'niaclock'], '10-8': [208, 'niamirror'], '10-secret': [209, 'niafireworks'],
  '10-castle': [210, 'niaparty']
};
/* where each secret's route starts: a flat column of the main path just before it (in the level's own columns) */
const SECRET_FROM: Record<string, (number | number[])[]> = {   /* a column, or [column, feet y] to start on top of a pillar */
  '10-1': [84, 150, 222],
  '10-2': [16, 44, 202],
  '10-3': [44, 147, 223],
  '10-4': [[123, 112], 66, 66],
  '10-5': [20, 66, 201],
  '10-6': [30, [128, 64], 116],
  '10-7': [26, 66, 126],
  '10-8': [31, 174, 104]
};
/* the high spots with a pit after them: a full-run jump off each must come down on floor. from..to is the top of the
   spot, top its row (Kinan's feet on it), pits the first column of each pit ahead that a jump from there could come
   down in. */
const HIGH: { id: string; what: string; from: number; to: number; top: number; pits: number[]; pre?: number }[] = [   /* pre: frames to wait first, so the run-up is not in a gust of wind */
  { id: '10-1', what: 'the first arcade roof', from: 31, to: 36, top: 9, pits: [49] },
  { id: '10-1', what: 'the first prize closet roof', from: 97, to: 101, top: 9, pits: [114] },
  { id: '10-1', what: 'the second prize closet roof', from: 164, to: 168, top: 9, pits: [180] },
  { id: '10-1', what: 'the third prize closet roof', from: 240, to: 244, top: 9, pits: [] },
  { id: '10-1', what: 'the sky shelf', from: 232, to: 234, top: 4, pits: [] },
  { id: '10-2', what: "the tour boat's hull", from: 18, to: 28, top: 10, pits: [40] },
  { id: '10-2', what: 'the boathouse roof', from: 48, to: 52, top: 9, pits: [66] },
  { id: '10-2', what: 'the pier shed roof', from: 87, to: 91, top: 9, pits: [104] },
  { id: '10-2', what: "the sky ferry's far ledge", from: 218, to: 220, top: 6, pits: [222] },
  { id: '10-2', what: 'the boat shed roof', from: 246, to: 250, top: 9, pits: [] },
  { id: '10-3', what: 'the first rock closet', from: 52, to: 56, top: 9, pits: [] },
  { id: '10-3', what: 'the second rock closet', from: 150, to: 154, top: 9, pits: [168] },
  { id: '10-4', what: 'the first shop roof', from: 31, to: 36, top: 9, pits: [48] },
  { id: '10-4', what: 'the second shop roof', from: 52, to: 56, top: 9, pits: [] },
  { id: '10-4', what: 'the third shop roof', from: 84, to: 88, top: 9, pits: [] },
  { id: '10-4', what: 'the first pillar', from: 99, to: 116, top: 7, pits: [] },
  { id: '10-4', what: "the skybridge's far half", from: 121, to: 138, top: 7, pits: [], pre: 130 },
  { id: '10-4', what: "the deck's far end (in the wind)", from: 181, to: 199, top: 2, pits: [], pre: 60 },
  { id: '10-4', what: 'the lower deck', from: 203, to: 216, top: 4, pits: [] },
  { id: '10-4', what: 'the last deck', from: 220, to: 229, top: 6, pits: [] },
  { id: '10-4', what: 'the first step', from: 230, to: 235, top: 8, pits: [] },
  { id: '10-4', what: 'the second step', from: 236, to: 241, top: 10, pits: [] },
  { id: '10-4', what: 'the last shop roof', from: 259, to: 263, top: 9, pits: [] },
  { id: '10-5', what: 'the first glass shed', from: 52, to: 56, top: 9, pits: [] },
  { id: '10-5', what: 'the second glass shed', from: 124, to: 128, top: 9, pits: [145] },
  { id: '10-5', what: 'the last glass shed', from: 248, to: 252, top: 9, pits: [] },
  { id: '10-fort', what: 'the first hamper', from: 24, to: 28, top: 9, pits: [48] },
  { id: '10-fort', what: "the hill's picnic table", from: 70, to: 73, top: 8, pits: [100] },
  { id: '10-fort', what: 'the second hamper', from: 112, to: 116, top: 9, pits: [128] },
  { id: '10-6', what: 'the station shed', from: 20, to: 24, top: 9, pits: [48] },
  { id: '10-6', what: 'the perch (floating rock)', from: 126, to: 131, top: 4, pits: [168] },
  { id: '10-6', what: 'the far ledge (floating rock)', from: 142, to: 147, top: 4, pits: [168] },
  { id: '10-6', what: 'the second shed', from: 150, to: 154, top: 9, pits: [168] },
  { id: '10-6', what: 'the last shed', from: 246, to: 250, top: 9, pits: [] },
  { id: '10-7', what: 'the hedge', from: 30, to: 33, top: 8, pits: [48] },
  { id: '10-7', what: 'the first garden shed', from: 116, to: 120, top: 9, pits: [168] },
  { id: '10-7', what: 'the floating ledge', from: 132, to: 135, top: 4, pits: [168] },
  { id: '10-7', what: 'the second garden shed', from: 198, to: 202, top: 9, pits: [215] },
  { id: '10-7', what: 'the last garden shed', from: 248, to: 252, top: 9, pits: [] },
  { id: '10-8', what: 'the first mirror wall', from: 20, to: 21, top: 9, pits: [50] },
  { id: '10-8', what: 'the first mirror cabinet', from: 64, to: 68, top: 9, pits: [90] },
  { id: '10-8', what: 'the mirror wall before the glass stair', from: 102, to: 103, top: 9, pits: [119] },
  { id: '10-8', what: 'the second mirror wall', from: 131, to: 132, top: 9, pits: [159] },
  { id: '10-8', what: 'the second mirror cabinet', from: 140, to: 144, top: 9, pits: [159] },
  { id: '10-8', what: 'the third mirror wall', from: 166, to: 167, top: 9, pits: [187] },
  { id: '10-8', what: 'the wall between the first two of three doors', from: 200, to: 201, top: 9, pits: [218] },
  { id: '10-8', what: 'the last mirror cabinet', from: 256, to: 260, top: 9, pits: [] },
  { id: '10-secret', what: 'the first fireworks crate', from: 86, to: 90, top: 9, pits: [103] },
  { id: '10-secret', what: 'the second fireworks crate', from: 160, to: 164, top: 9, pits: [177] }
];

type Secret = { kind: string; col: number; row: number; prize: string; exit?: string };
type Area = { cols: number; heights: (number | null)[]; secrets?: Secret[]; talk?: [number, string, string, number?, string?][] };
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
  const fc = Array.isArray(from) ? from[0] : from, fy = Array.isArray(from) ? from[1] : H[from];   /* a column, or [column, feet y] to start on top of a pillar */
  K.place(fc * 16 + 3, fy - 16); K.step(12, still);
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

test.describe('World 10 · the level files', () => {
  test('all 11 World 10 level files are registered as World 10 on their map stops, pass the gate and wear their own Niagara look', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const reg = await page.evaluate(() => {
      const w = window as unknown as Win;
      const all = w.KinanLevels.list();
      const ids = all.filter((id) => id.startsWith('10-'));
      const defs = ids.map((id) => { const d = w.KinanLevels.get(id); w.__k11.playLevel(id); return { id, world: d.world, slot: d.slot, theme: d.theme, look: w.__k11.levelInfo().look, pet: 'pet' in d || (d.areas || []).some((a) => 'pet' in a) }; });
      const lv = w.__k11.levels().levels.filter((x) => x.id.startsWith('10-'));
      /* Worlds 1-9 never wear a Niagara look (200-210) */
      const borrowed = all.filter((id) => !id.startsWith('10-')).map((id) => [id, w.KinanLevels.get(id).theme]).filter(([, t]) => typeof t === 'number' && (t as number) >= 200 && (t as number) <= 210);
      return { ids, defs, bad: lv.filter((x) => x.problems.length || x.lint.length), borrowed };
    });
    expect([...reg.ids].sort()).toEqual([...W10].sort());
    expect(reg.bad).toEqual([]);
    expect(reg.borrowed, 'no level outside World 10 wears a Niagara look').toEqual([]);
    for (const d of reg.defs) {
      expect(d.world, d.id).toBe(10);
      expect(d.slot, d.id).toBe(SLOT[d.id]);
      expect(d.theme, `${d.id} wears its own Niagara look`).toBe(LOOK[d.id][0]);
      expect(d.look && d.look.bg, `${d.id}: the look's backdrop`).toBe(LOOK[d.id][1]);
      expect(d.pet, `${d.id}: no pet crate (all six are found by World 5)`).toBe(false);
    }
    expect(new Set(reg.defs.map((d) => d.theme)).size, 'eleven levels, eleven different looks').toBe(reg.defs.length);
    expect(errors).toEqual([]);
  });

  test('the map names the observation tower plainly (no business name on the World 10 map stop or label)', async () => {
    const src = readFileSync(fileURLToPath(new URL('../../../map/worlds/w10.js', import.meta.url)), 'utf8');
    expect(src).toContain("name:'10-4  THE OBSERVATION TOWER'");
    expect(src).toContain("K.P.label(X,Y+4,'THE OBSERVATION TOWER')");
    expect(src).not.toContain("name:'10-4  THE SKYLON TOWER'");
    expect(src).not.toContain("'SKYLON TOWER'");
    /* no attraction's own business name anywhere in the map file, its text included (v53 review: the Aero Car label and two Skylon lines) */
    expect(src).not.toMatch(/skylon|aero car/i);
    expect(src).toContain("'WHIRLPOOL CABLE CAR'");   /* the label says what the stop says: 10-6 THE WHIRLPOOL CABLE CAR */
  });

  for (const id of W10) {
    test(`${id}: its Niagara backdrop draws (start, middle and end of the level) with no page error`, async ({ page }, info) => {
      test.setTimeout(120_000);
      const errors = watchErrors(page);
      await boot(page);
      const out = await page.evaluate((id) => {
        const w = window as unknown as Win & { __k11: { probe: () => { x: number } } }, k = w.__k11;
        if (!w.KinanLevels.get(id)) return null;
        const d = w.KinanLevels.get(id), H = (d.areas || [d]).flatMap((a) => a.heights);
        k.playLevel(id); k.godMode(); k.clearFoes();
        const spots = [3, Math.floor(H.length / 2), H.length - 4].map((c) => { let x = c; while (x > 0 && H[x] == null) x--; return x; });
        for (const c of spots) { k.place(c * 16 + 3, (H[c] as number) - 40); k.step(40, {}); }
        k.place(spots[1] * 16 + 3, (H[spots[1]] as number) - 40); k.step(30, {});
        return { id, look: k.levelInfo().look };
      }, id);
      if (out) {
        expect(out.look && out.look.theme, id).toBe(LOOK[id][0]);
        expect(out.look && out.look.bg, id).toBe(LOOK[id][1]);
        await page.screenshot({ path: info.outputPath(`w10-look-${id}.png`) });   /* a picture of each look, kept in test-results */
      }
      expect(errors).toEqual([]);
    });
  }

  test('no World 10 foe starts inside a block or waits at a lip, no block hangs over a take-off, and no candle is lost inside a block', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const out = await page.evaluate((ids) => {
      const w = window as unknown as Win, k = w.__k11;
      return ids.filter((id) => !!w.KinanLevels.get(id)).map((id) => {
        const d = w.KinanLevels.get(id);
        const list = (d.areas || [d]) as (Area & { foes?: [number, number, string][]; candles?: [number, number][] })[];
        k.playLevel(id);
        const FLYERS = ['plane', 'camera', 'brush', 'ghost', 'sparkler', 'crow', 'mosquito', 'magpie', 'goose', 'seagull', 'umbrellabat', 'raincloud', 'scanner', 'deleter'];
        const badFoes: number[][] = [], atLip: (number | string)[][] = [], overTakeoff: number[][] = [], dupes: number[][] = [], inBlock: number[][] = [];
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
          const seen = new Set<string>();
          for (const c of a.candles || []) {
            const key = `${base + c[0]},${c[1]}`;
            if (seen.has(key)) dupes.push([base + c[0], c[1]]);
            seen.add(key);
            if (k.tile(base + c[0], c[1]) !== 0) inBlock.push([base + c[0], c[1]]);
          }
          base += a.cols;
        }
        return { id, badFoes, atLip, overTakeoff, dupes, inBlock, authored, live: k.levelInfo().candles };
      });
    }, W10);
    for (const o of out) {
      expect(o.badFoes, `${o.id}: foes inside blocks [col, row, tile]`).toEqual([]);
      expect(o.atLip, `${o.id}: walkers or hoppers waiting at a lip [col, row, type]`).toEqual([]);
      expect(o.overTakeoff, `${o.id}: blocks over a gap's take-off column [col, row]`).toEqual([]);
      expect(o.inBlock, `${o.id}: candles sealed inside a block [col, row]`).toEqual([]);
      expect(o.dupes, `${o.id}: two candles in one cell [col, row]`).toEqual([]);
      expect(o.live, `${o.id}: every authored candle is in the level`).toBe(o.authored);
    }
    expect(errors).toEqual([]);
  });

  test('a full-run jump off every World 10 high spot comes down on floor, with a tile to spare before the next pit', async ({ page }) => {
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
        const start = (): void => { k.place(s.from * 16 + 1, s.top * 16 - 16); k.step(30 + (s.pre || 0), still); };
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

  for (const id of W10) {
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

/* ---- the twists: each World 10 level's own trick exists and does its thing (scripts run in the page) ---- */
test.describe('World 10 · the twists', () => {
  test('10-1 twist: NEON SIGNS THAT BLINK. A sign glows, flickers a warning, goes dark and comes back; it carries Kinan while it glows and drops him when it goes dark; a wave of signs lights one after the other; one sign never lights; the Chicken Rider bucket and the Idol Hunter light stick are remembered', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('10-1'); k.godMode(); k.clearFoes();
      const def = window.KinanLevels.get('10-1'), info = k.twistInfo(), N = info.neons;
      /* N2 (index 1, over the 3 gap c49-51): 700 frames of its clock: on, a flicker before dark, dark, on again */
      let first = { on: -1, warn: -1, off: -1, again: -1 };
      const starts = N.map(() => -1);   /* the first frame each sign comes on after being dark (a rising edge) */
      let prev = k.twistInfo().neons.map((n) => n.off);
      for (let f = 0; f < 700; f++) {
        k.step(1, still);
        const s = k.twistInfo().neons;
        if (s[1].warn && first.warn < 0) first.warn = f;
        if (s[1].off && first.off < 0) first.off = f;
        if (!s[1].off && first.off >= 0 && first.again < 0) first.again = f;
        s.forEach((n, i) => { if (prev[i] && !n.off && starts[i] < 0) starts[i] = f; });
        prev = s.map((n) => n.off);
      }
      /* wait until N2 glows, set Kinan on it: it carries him (standing at floor level over the pit) ... */
      let g = 0; while (g++ < 700 && k.twistInfo().neons[1].off) k.step(1, still);
      k.place(50 * 16 + 3, 176); k.step(6, still);
      const onSign = { riding: k.twistInfo().neons[1].riding, y: Math.round(k.probe().y), onGround: k.probe().onGround };
      /* ... and when it goes dark he is dropped (he falls into the pit; god mode keeps him whole) */
      const drops0 = k.twistInfo().neonDrops;
      g = 0; while (g++ < 700 && !k.twistInfo().neons[1].off) { k.place(50 * 16 + 3, 176); k.step(1, still); }
      k.step(2, still);
      const dropped = k.twistInfo().neonDrops - drops0;
      /* the wave: the three signs of THE WAVE (index 5, 6, 7) light 40 frames apart; the stair (3, 4) 50 apart; the sky signs (14, 15, 16) 40 apart */
      const gap = (a, b, per) => ((starts[b] - starts[a]) % per + per) % per;
      const dark = N[8];
      const lit = Object.keys(N).filter((i) => N[i].on >= 130).length;
      const memory = def.talk.filter((t) => t[1] === 'KINAN' && /Chicken Rider/.test(t[2]) && /Idol Hunter/.test(t[2])).map((t) => t[0]);
      const props = def.skins.filter((s) => s[0] === 'chickenrider' || s[0] === 'idolhunter').map((s) => s.join(','));
      const tiles = props.map((p) => p.split(',').slice(1, 5).map(Number)).map(([c0, r0, c1, r1]) => { let solid = 0; for (let c = c0; c <= c1; c++) for (let rr = r0; rr <= r1; rr++) if (k.tile(c, rr) !== 0) solid++; return solid; });
      return { signs: N.length, looks: N.map((n) => n.look), first, onSign, dropped, dark: { on: dark.on, per: dark.per }, lit, wave: [gap(5, 6, 270), gap(6, 7, 270)], stair: gap(2, 3, 300), sky: [gap(15, 16, 280), gap(16, 17, 280)], memory, props, tiles, falls: k.levelInfo().falls || 0 };
    })()`) as { signs: number; looks: string[]; first: { on: number; warn: number; off: number; again: number }; onSign: { riding: boolean; y: number; onGround: boolean }; dropped: number; dark: { on: number; per: number }; lit: number; wave: number[]; stair: number; sky: number[]; memory: number[]; props: string[]; tiles: number[]; falls: number };
    console.log('10-1 neon signs: ' + JSON.stringify(r));
    expect(r.signs, 'eighteen neon signs').toBe(18);
    expect(new Set(r.looks).size, 'bar, arrow and star signs').toBe(3);
    expect(r.first.warn, 'N2 flickers a warning ...').toBeGreaterThan(0);
    expect(r.first.off, '... then goes dark ...').toBeGreaterThan(r.first.warn);
    expect(r.first.again, '... and comes back').toBeGreaterThan(r.first.off);
    expect(r.onSign, 'a glowing sign carries Kinan at floor level, over the pit').toEqual({ riding: true, y: 176, onGround: true });
    expect(r.dropped, 'a sign that goes dark drops him').toBeGreaterThanOrEqual(1);
    expect(r.dark.on, 'one sign never lights').toBe(0);
    expect(r.lit, 'every other sign glows for at least 130 frames of its cycle (about 2 s)').toBe(17);
    expect(r.stair, 'the second sign of the stair lights 50 frames after the first').toBe(50);
    expect(r.wave, 'the wave: each sign lights 40 frames after the one below').toEqual([40, 40]);
    expect(r.sky, 'the sky signs: the same wave').toEqual([40, 40]);
    expect(r.memory, 'Kinan remembers the Chicken Rider popcorn bucket and the Idol Hunter light stick (age 10), as he reaches the prize counters').toEqual([64]);
    expect(r.props, 'both props stand on their prize counters').toEqual(['chickenrider,66,9,67,10', 'idolhunter,72,9,73,10']);
    expect(r.tiles, 'each counter is solid').toEqual([4, 4]);
    expect(errors).toEqual([]);
  });

  test('10-2 twist: BOATS and the falls\' SPRAY. Tour boats drift across every channel and carry Kinan; the spray is warned (mist, droplets, "SPRAY!") for 1 s before each gust and a gust makes the same jump fall shorter; the sky ferry is a lifeboat that carries him between two high ledges', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('10-2'); k.godMode(); k.clearFoes();
      const info = k.twistInfo(), def = window.KinanLevels.get('10-2');
      const span = (a) => Math.round((Math.max(...a) - Math.min(...a)) * 10) / 10;
      /* the boats drift: 400 frames of every boat's x */
      const xs = info.boats.map(() => []);
      for (let f = 0; f < 400; f++) { k.step(1, still); k.twistInfo().boats.forEach((b, i) => xs[i].push(b.x)); }
      /* ride B1 (the dock's 3 channel c12-14): put him on its deck, it carries him */
      const b0 = k.twistInfo().boats[0];
      k.place(b0.x + b0.w / 2 - 5, b0.y - 16); k.step(10, still);
      const on = k.twistInfo().boats[0].riding; const px0 = k.probe().x; k.step(40, still); const rode = k.twistInfo().boats[0].riding, moved = Math.round(Math.abs(k.probe().x - px0));
      /* the sky ferry (the lifeboat, row 6): ride it between the two high ledges */
      const lb = k.twistInfo().boats.findIndex((b) => b.look === 'lifeboat');
      const b1 = k.twistInfo().boats[lb];
      k.place(b1.x + b1.w / 2 - 5, b1.y - 16); k.step(10, still);
      const lbOn = k.twistInfo().boats[lb].riding, ly = Math.round(k.probe().y);
      /* the spray: the cue before a gust, and the same running jump in a gust vs in the calm (spray zone c70-82, the dock before THE PIER) */
      const jump = () => {
        k.place(72 * 16 + 3, 176); k.step(6, still);
        const x0 = k.probe().x; k.step(1, { right: true, jump: true, tapJump: true });
        let p = k.probe(), air = false;
        for (let f = 0; f < 200; f++) { p = k.step(1, { right: true, jump: f < 30 })[0]; if (!p.onGround) air = true; else if (air) break; }
        return Math.round(p.x - x0);
      };
      const stand = () => { k.place(76 * 16 + 3, 176); k.step(4, still); const x0 = k.probe().x; k.step(40, still); return Math.round(x0 - k.probe().x); };
      const until = (ph) => { let g = 0; while (g++ < 1200 && k.twistInfo().phase !== ph) k.step(1, still); };
      until(0);
      let warnFrames = 0, gustFrames = 0, warnBeforeGust = true, sawGust = false;
      for (let f = 0; f < 330; f++) { k.step(1, still); const t = k.twistInfo(); if (t.warn) warnFrames++; if (t.gustOn) { gustFrames++; sawGust = true; } else if (!sawGust && !t.warn && f > 70) warnBeforeGust = false; }
      until(58);   /* the jump takes off at phase 60: the gust is on from then, full strength by 72 */
      const windy = jump();
      until(70);
      const pushed = stand();   /* standing in the gust: it pushes him back */
      until(200);
      const calm = jump();
      const still0 = stand();
      const gust1 = def.wind.length;
      return { boats: info.boats.length, looks: info.boats.map((b) => b.look), spans: xs.map(span), on, rode, moved, lbOn, ly, spray: info.spray, wind: info.wind, warnFrames, gustFrames, warnBeforeGust, windy, calm, pushed, still0, zones: gust1, falls: k.levelInfo().falls || 0 };
    })()`) as { boats: number; looks: string[]; spans: number[]; on: boolean; rode: boolean; moved: number; lbOn: boolean; ly: number; spray: boolean; wind: number; warnFrames: number; gustFrames: number; warnBeforeGust: boolean; windy: number; calm: number; pushed: number; still0: number; zones: number; falls: number };
    console.log('10-2 boats and spray: ' + JSON.stringify(r));
    expect(r.boats, 'eleven boats: ten tour boats and the lifeboat').toBe(11);
    expect(r.looks.filter((l) => l === 'tour').length).toBe(10);
    expect(r.looks.filter((l) => l === 'lifeboat').length).toBe(1);
    for (const s of r.spans) expect(s, 'each boat drifts to and fro').toBeGreaterThanOrEqual(15);
    expect(r.on, 'Kinan lands on a boat and rides it').toBe(true);
    expect(r.rode).toBe(true);
    expect(r.moved, 'the boat carried him').toBeGreaterThanOrEqual(8);
    expect(r.lbOn, 'he rides the lifeboat').toBe(true);
    expect(r.ly, 'its deck is level with the high ledges (row 6)').toBeLessThanOrEqual(6 * 16 - 16 + 2);
    expect(r.spray, 'the spray cue is on').toBe(true);
    expect(r.wind, 'the spray zones cover many columns').toBeGreaterThan(80);
    expect(r.warnFrames, 'a whole second of warning before the gust').toBe(60);
    expect(r.gustFrames, 'then a gust of 1.5 s').toBe(90);
    expect(r.calm - r.windy, 'a gust makes the same walking jump fall a little shorter (the push is weaker in the air, World 7\'s rule)').toBeGreaterThanOrEqual(2);
    expect(r.pushed, 'standing in a gust, he is pushed back').toBeGreaterThanOrEqual(15);
    expect(r.still0, 'and standing in the calm he is not').toBe(0);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test('10-3 twist: WATER CURTAINS. A curtain drips, drips hard as a warning, pours, drips again; the pour slows and pushes Kinan back and never hurts; between pours he walks through at full speed; three curtains pour one at a time; none is near a gap; the tunnel roofs are never bumped', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('10-3'); k.clearFoes();   /* no god mode: the pour must never cost a heart */
      const def = window.KinanLevels.get('10-3'), info = k.twistInfo(), H = def.heights;
      const hp0 = k.twistInfo().hp;
      /* C1 (index 0, c34-36, period 420, pour 90) over 900 frames: the order of its states */
      const states = []; let warnBeforePour = true, prev = '', pours = 0, warns = 0, calm = 0;
      for (let f = 0; f < 900; f++) {
        k.step(1, still);
        const c = k.twistInfo().curts[0], s = c.pour ? 'pour' : c.warn ? 'warn' : 'drip';
        if (s === 'pour') pours++; else if (s === 'warn') warns++; else calm++;
        if (s === 'pour' && prev !== 'pour' && prev !== 'warn') warnBeforePour = false;
        prev = s;
      }
      const wait = (state) => { let g = 0; while (g++ < 1500) { const c = k.twistInfo().curts[0]; if ((state === 'pour' && c.pour) || (state === 'drip' && !c.pour && !c.warn)) return true; k.step(1, still); } return false; };
      /* walk right through C1 (running) while it pours, and again while it only drips: how far in 30 frames starting at its left edge */
      const run = (state) => { wait(state); k.place(34 * 16 - 8, 176); k.step(2, still); const x0 = k.probe().x; k.step(30, { right: true, fire: true }); return Math.round(k.probe().x - x0); };
      const slow = run('pour'), free = run('drip');
      /* standing in the pour: pushed back */
      wait('pour'); k.place(35 * 16, 176); k.step(4, still); const inside = k.twistInfo().curtIn; const s0 = k.probe().x; k.step(30, still); const pushed = Math.round(s0 - k.probe().x);
      k.step(60, still);
      const soaked = k.twistInfo().soaked, hp1 = k.twistInfo().hp;
      /* the three curtains of tunnel 3 (index 3, 4, 5): never two pour together */
      let two = 0, one = 0;
      for (let f = 0; f < 720; f++) { k.step(1, still); const cs = k.twistInfo().curts; const n = [3, 4, 5].filter((i) => cs[i].pour).length; if (n >= 2) two++; if (n === 1) one++; }
      /* no curtain within 4 tiles of a pit, and the climb's three ledges stand */
      let nearGap = 0; for (const c of def.curtains) for (let x = c[0] - 4; x <= c[1] + 4; x++) if (H[x] == null) nearGap++;
      const ledges = [[228, 9], [230, 6], [228, 3]].map((p) => k.tile(p[0], p[1]));
      /* a full jump inside tunnel 1 goes as high as in the open (the roof is never bumped) */
      const hop = (c, y) => { k.place(c * 16 + 3, y); k.step(10, still); const y0 = k.probe().y; let top = y0; k.step(1, { jump: true, tapJump: true }); for (let f = 0; f < 120; f++) { const p = k.step(1, { jump: f < 40 })[0]; top = Math.min(top, p.y); if (p.onGround) break; } return Math.round(y0 - top); };
      const open = hop(8, 176), tunnel = [hop(24, 176), hop(120, 176), hop(200, 176)], tunnel2 = hop(74, 160);   /* (c74: clear of the gift block at c76) */
      return { curtains: info.curts.length, pours, warns, calm, warnBeforePour, slow, free, pushed, inside, soaked, hpSame: hp1 === hp0, two, one, nearGap, ledges, open, tunnel, tunnel2, falls: k.levelInfo().falls || 0 };
    })()`) as { curtains: number; pours: number; warns: number; calm: number; warnBeforePour: boolean; slow: number; free: number; pushed: number; inside: number; soaked: number; hpSame: boolean; two: number; one: number; nearGap: number; ledges: number[]; open: number; tunnel: number[]; tunnel2: number; falls: number };
    console.log('10-3 water curtains: ' + JSON.stringify(r));
    expect(r.curtains, 'eleven curtains').toBe(11);
    expect(r.pours, 'C1 pours for 90 of every 420 frames').toBeGreaterThanOrEqual(180);
    expect(r.warns, 'with 50 frames of heavy drips before each pour').toBeGreaterThanOrEqual(100);
    expect(r.calm, 'and a long calm between').toBeGreaterThan(r.pours);
    expect(r.warnBeforePour, 'the warning always comes right before a pour').toBe(true);
    expect(r.slow, 'running through the pour: slowed to a crawl').toBeLessThanOrEqual(24);
    expect(r.free, 'running through while it only drips: full speed').toBeGreaterThanOrEqual(45);
    expect(r.pushed, 'standing in the pour: pushed back').toBeGreaterThanOrEqual(10);
    expect(r.inside, 'the push is backwards (left)').toBe(-1);
    expect(r.soaked, 'the level counts each soaking').toBeGreaterThanOrEqual(2);
    expect(r.hpSame, 'the water never costs a heart').toBe(true);
    expect(r.two, 'the tunnel-3 curtains never pour two at a time').toBe(0);
    expect(r.one, 'but one is always pouring in turn').toBeGreaterThan(400);
    expect(r.nearGap, 'no curtain is within 4 tiles of a pit').toBe(0);
    expect(r.ledges.every((t) => t !== 0), 'the three ledges of the curtain climb').toBe(true);
    for (const t of r.tunnel) expect(t, 'a full jump in a tunnel goes as high as in the open (the roof is never bumped)').toBe(r.open);
    expect(r.tunnel2, 'and in the second tunnel (floor one tile up)').toBe(r.open);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test('10-4 twist: THE YELLOW OUTSIDE ELEVATORS. A lift waits at each end and rides between its two rows, flush with the ledges; the climb is higher than any jump so Kinan rides it; its shaft has a floor, never a pit; the wind blows near the top; nothing under the tower is a pit', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('10-4'); k.godMode(); k.clearFoes();
      const def = window.KinanLevels.get('10-4'), info = k.twistInfo(), H = def.heights;
      const rises = info.lifts.map((l) => (l.yb - l.yt) / 16), widths = info.lifts.map((l) => l.w / 16);
      /* how high a full held jump goes from the floor */
      k.place(10 * 16 + 3, 176); k.step(10, still); const y0 = k.probe().y; let topY = y0; k.step(1, { jump: true, tapJump: true });
      for (let f = 0; f < 120; f++) { const p = k.step(1, { jump: f < 40 })[0]; topY = Math.min(topY, p.y); if (p.onGround) break; }
      const jumpRise = Math.round(y0 - topY);
      /* ride a lift: wait for it at the bottom, step on, count the frames he is carried and the highest he gets */
      const ride = (i) => {
        let g = 0; const at = () => k.twistInfo().lifts[i];
        while (g++ < 1500 && !(at().wait > 0 && at().y === at().yb)) k.step(1, still);
        const L = at(); k.place(L.x + L.w / 2 - 5, L.y - 16); k.step(3, still);
        let carried = 0, minY = 999, dirs = new Set(), waits = 0;
        for (let f = 0; f < 700; f++) { const p = k.step(1, still)[0]; const l = at(); if (l.riding) carried++; minY = Math.min(minY, p.y); if (l.wait > 0) waits++; dirs.add(l.dir); }
        return { carried, minY: Math.round(minY), dirs: [...dirs].sort(), waits, yt: L.yt, yb: L.yb };
      };
      const up1 = ride(2); k.playLevel('10-4'); k.godMode(); k.clearFoes();
      const up2 = ride(3);
      const dockTop = [[99, 7], [142, 2], [31, 9]].map(([c, r]) => k.tile(c, r) !== 0 && k.tile(c, r - 1) === 0);
      let pits = 0; for (let c = 60; c < H.length; c++) if (H[c] == null) pits++;
      return { lifts: info.lifts.length, rises, widths, jumpRise, up1, up2, dockTop, pits, wind: info.wind, falls: k.levelInfo().falls || 0 };
    })()`) as { lifts: number; rises: number[]; widths: number[]; jumpRise: number; up1: { carried: number; minY: number; dirs: number[]; waits: number; yt: number; yb: number }; up2: { carried: number; minY: number; dirs: number[]; waits: number; yt: number; yb: number }; dockTop: boolean[]; pits: number; wind: number; falls: number };
    console.log('10-4 elevators: ' + JSON.stringify(r));
    expect(r.lifts, 'six lifts: the baggage lift, the express lift, two ways up, two window washers').toBe(6);
    expect(r.rises, 'the rises (tiles)').toEqual([3, 7, 5, 5, 2, 2]);
    for (const w of r.widths) expect(w, 'every lift is 3 tiles wide').toBe(3);
    expect(r.jumpRise, 'a full jump (about 4.3 tiles) cannot climb the 5 tile rises: the lifts are the way up').toBeLessThan(5 * 16);
    expect(r.up1.carried, 'the first lift carries Kinan').toBeGreaterThan(100);
    expect(r.up1.minY, 'up to the skybridge (ledge at y=112, feet on it)').toBe(112 - 16);
    expect(r.up1.dirs, 'it goes up and comes down again').toEqual([-1, 1]);
    expect(r.up1.waits, 'and waits at each end').toBeGreaterThan(150);
    expect(r.up2.minY, 'the second lift takes him up to the deck (y=32)').toBe(32 - 16);
    expect(r.dockTop.every(Boolean), 'each lift docks flush with a ledge').toBe(true);
    expect(r.pits, 'no pit after the plaza: nothing under the tower is a pit').toBe(0);
    expect(r.wind, 'the wind blows near the top').toBeGreaterThan(50);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test('10-5 twist: GIANT LEAVES and BUTTERFLY SWARMS. A leaf throws Kinan far higher than a jump and comes down on floor with room before the next pond (walking or running); nothing stands in a leaf\'s arc; a swarm drifts over each pond and carries him; one swarm flies high', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('10-5'); k.godMode(); k.clearFoes();
      const def = window.KinanLevels.get('10-5'), info = k.twistInfo(), H = def.heights;
      const span = (a) => Math.round((Math.max(...a) - Math.min(...a)) * 10) / 10;
      const xs = info.rollers.map(() => []), ys = info.rollers.map(() => []);
      for (let f = 0; f < 600; f++) { k.step(1, still); k.twistInfo().rollers.forEach((m, i) => { xs[i].push(m.x); ys[i].push(m.y); }); }
      /* ride the first swarm (over the 3 pond c14-16) */
      const m0 = k.twistInfo().rollers[0];
      k.place(m0.x + m0.w / 2 - 5, m0.y - 16); k.step(10, still);
      const on = k.twistInfo().rollers[0].riding; const px0 = k.probe().x; k.step(40, still); const rode = k.twistInfo().rollers[0].riding, moved = Math.round(Math.abs(k.probe().x - px0));
      /* a normal full jump, and the bounce off each leaf (walking and running), up to the landing */
      const hop = () => { k.place(10 * 16 + 3, 176); k.step(10, still); const y0 = k.probe().y; let topY = y0; k.step(1, { jump: true, tapJump: true }); for (let f = 0; f < 120; f++) { const p = k.step(1, { jump: f < 40 })[0]; topY = Math.min(topY, p.y); if (p.onGround) break; } return Math.round(y0 - topY); };
      const jumpRise = hop();
      const pits = (c) => { for (let x = c; x < H.length; x++) if (H[x] == null) return x; return 9999; };
      const leaves = [[24, 17], [100, 97], [156, 149], [203, 201]].map(([pad, from]) => {
        const out = {};
        for (const mode of ['walk', 'run']) {
          k.place(from * 16 + 1, H[from] - 16); k.step(20, still);
          /* the leaf is set flush in the floor: walking (or running) onto it throws him; a kid keeps JUMP held while he rises */
          const hold = { right: true, fire: mode === 'run' }; let p = k.probe(), minY = p.y, bounced = false;
          for (let f = 0; f < 500; f++) {
            p = k.step(1, Object.assign({}, hold, { jump: bounced && p.vy < 0 }))[0];
            minY = Math.min(minY, p.y);
            if (p.vy <= -10) bounced = true;
            if (bounced && p.onGround && f > 5) break;
          }
          const col = Math.floor((p.x + 5) / 16);
          out[mode] = { rise: Math.round((H[from] - 16 - minY) / 16 * 10) / 10, col, floor: H[col] != null, toPit: pits(col) - col, bounced };
        }
        return Object.assign({ pad }, out);
      });
      /* nothing stands in a leaf's arc: no gift, brick or flyer within the 14 columns after a leaf */
      const bad = [];
      const flyers = ['mosquito'];
      for (const pad of [24, 100, 156, 203]) {
        for (const g of [].concat(def.tiles.gift, def.tiles.brick)) if (g[0] >= pad - 1 && g[0] <= pad + 13) bad.push(['block', g[0], g[1]]);
        for (const f of def.foes) if (flyers.includes(f[2]) && f[0] >= pad - 1 && f[0] <= pad + 13) bad.push(['flyer', f[0], f[1]]);
      }
      const leafSkins = info.skins.filter((s) => s[0] === 'leaf').length, springs = [24, 25, 100, 101, 156, 157, 203, 204].map((c) => k.tile(c, 12));
      return { rollers: info.rollers.length, looks: [...new Set(info.rollers.map((m) => m.look))], xSpan: xs.map(span), ySpan: ys.map(span), high: info.rollers[8].y, on, rode, moved, jumpRise, leaves, bad, leafSkins, springs, falls: k.levelInfo().falls || 0 };
    })()`) as { rollers: number; looks: string[]; xSpan: number[]; ySpan: number[]; high: number; on: boolean; rode: boolean; moved: number; jumpRise: number; leaves: { pad: number; walk: { rise: number; col: number; floor: boolean; toPit: number }; run: { rise: number; col: number; floor: boolean; toPit: number } }[]; bad: unknown[]; leafSkins: number; springs: number[]; falls: number };
    console.log('10-5 leaves and swarms: ' + JSON.stringify(r));
    expect(r.rollers, 'nine swarms: one over each of the eight ponds and one high').toBe(9);
    expect(r.looks).toEqual(['butterflies']);
    for (const s of r.xSpan) expect(s, 'each swarm drifts').toBeGreaterThanOrEqual(15);
    for (const s of r.ySpan) expect(s, 'and flies level').toBe(0);
    expect(r.high, 'the high swarm flies 6 tiles over the floor (row 6)').toBe(96);
    expect(r.on, 'Kinan lands on a swarm and rides it').toBe(true);
    expect(r.rode).toBe(true);
    expect(r.moved, 'it carried him').toBeGreaterThanOrEqual(5);
    expect(r.leafSkins, 'four giant leaves').toBe(4);
    expect(r.springs.every((t) => t === 6), 'each leaf is two spring tiles').toBe(true);
    for (const l of r.leaves) for (const m of [l.walk, l.run]) {
      expect(m.rise, `the leaf at c${l.pad} throws him far higher than a jump (${r.jumpRise / 16} tiles)`).toBeGreaterThanOrEqual(8);
      expect(m.floor, `and he comes down on floor (c${m.col})`).toBe(true);
      expect(m.toPit, `with 3+ tiles of floor before the next pond (c${m.col})`).toBeGreaterThanOrEqual(3);
    }
    expect(r.bad, 'no block or flyer stands in a leaf\'s arc').toEqual([]);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test('10-fort twist: THE PICNIC PARK RUN. Red wagons roll over the ditches and carry Kinan; the quilt is a bouncy pad; blankets and lawn chairs are ledges you jump up through; baskets are steps; 28 tiles of flat open lawn are left empty for the boss; Grandpa waits on a lawn chair past it', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('10-fort'); k.godMode(); k.clearFoes();
      const def = window.KinanLevels.get('10-fort'), info = k.twistInfo(), H = def.heights;
      const span = (a) => Math.round((Math.max(...a) - Math.min(...a)) * 10) / 10;
      const xs = info.rollers.map(() => []), ys = info.rollers.map(() => []);
      for (let f = 0; f < 600; f++) { k.step(1, still); k.twistInfo().rollers.forEach((m, i) => { xs[i].push(m.x); ys[i].push(m.y); }); }
      const m0 = k.twistInfo().rollers[0];
      k.place(m0.x + m0.w / 2 - 5, m0.y - 16); k.step(10, still);
      const on = k.twistInfo().rollers[0].riding; const px0 = k.probe().x; k.step(40, still); const rode = k.twistInfo().rollers[0].riding, moved = Math.round(Math.abs(k.probe().x - px0));
      /* the quilt (c84-85, flush in the floor): walk onto it from c83 */
      k.place(83 * 16 + 1, 176); k.step(10, still);
      let p = k.probe(), minY = p.y, bounced = false;
      for (let f = 0; f < 500; f++) { p = k.step(1, { right: true, jump: bounced && p.vy < 0 })[0]; minY = Math.min(minY, p.y); if (p.vy <= -10) bounced = true; if (bounced && p.onGround && f > 5) break; }
      const col = Math.floor((p.x + 5) / 16); let pit = 9999; for (let x = col; x < H.length; x++) if (H[x] == null) { pit = x; break; }
      const quilt = { rise: Math.round((176 - minY) / 16 * 10) / 10, col, floor: H[col] != null, toPit: pit - col, bounced };
      /* a ledge: a full jump from under the first blanket (c35) goes up through it and he stands on it (top y=128) */
      const up = (c, r) => { k.place(c * 16 + 3, 176); k.step(10, still); k.step(1, { jump: true, tapJump: true }); for (let f = 0; f < 90; f++) k.step(1, { jump: f < 40 }); const q = k.probe(); return { y: Math.round(q.y), onGround: q.onGround, want: r * 16 - 16 }; };
      const blanket = up(35, 8), chair = up(41, 10);
      const open = []; const inLawn = (c) => c >= 195 && c <= 222;
      for (const c of def.candles) if (inLawn(c[0])) open.push(['candle', c[0], c[1]]);
      for (const f of def.foes) if (inLawn(f[0])) open.push(['foe', f[0], f[1]]);
      for (const key of Object.keys(def.tiles)) for (const t of def.tiles[key]) if (inLawn(t[0])) open.push([key, t[0], t[1]]);
      for (const s of def.solid) if (!(s[2] < 195 || s[0] > 222)) open.push(['solid', s[0], s[1]]);
      let flat = true; for (let c = 180; c < 240; c++) if (H[c] !== 192) flat = false;
      const gifts = def.tiles.gift.filter((g) => g[2]).map((g) => g.join(','));
      const grandpa = def.talk.filter((t) => t[1] === 'GRANDPA').map((t) => t[0]), grandmas = [...new Set(def.talk.filter((t) => /GRANDMA/.test(t[1])).map((t) => t[1]))];
      const ledges = [[34, 8], [41, 10], [66, 7], [146, 10], [228, 10]].map(([c, rr]) => k.tile(c, rr)), baskets = [[31, 10], [24, 9], [70, 8]].map(([c, rr]) => k.tile(c, rr));
      return { rollers: info.rollers.length, looks: [...new Set(info.rollers.map((m) => m.look))], xSpan: xs.map(span), ySpan: ys.map(span), on, rode, moved, quilt, blanket, chair, open, flat, gifts, grandpa, grandmas, ledges, baskets, kind: def.kind, secrets: (def.secrets || []).length, arena: def.arena || null, goal: def.goal.col, falls: k.levelInfo().falls || 0 };
    })()`) as { rollers: number; looks: string[]; xSpan: number[]; ySpan: number[]; on: boolean; rode: boolean; moved: number; quilt: { rise: number; col: number; floor: boolean; toPit: number; bounced: boolean }; blanket: { y: number; onGround: boolean; want: number }; chair: { y: number; onGround: boolean; want: number }; open: unknown[]; flat: boolean; gifts: string[]; grandpa: number[]; grandmas: string[]; ledges: number[]; baskets: number[]; kind: string; secrets: number; arena: unknown; goal: number; falls: number };
    console.log('10-fort picnic run: ' + JSON.stringify(r));
    expect(r.kind).toBe('fort');
    expect(r.rollers, 'six wagons').toBe(6);
    expect(r.looks).toEqual(['wagon']);
    for (const s of r.xSpan) expect(s, 'each wagon rolls to and fro').toBeGreaterThanOrEqual(15);
    for (const s of r.ySpan) expect(s, 'and rolls level').toBe(0);
    expect(r.on, 'Kinan lands on a wagon').toBe(true);
    expect(r.rode).toBe(true);
    expect(r.moved, 'it carries him').toBeGreaterThanOrEqual(5);
    expect(r.quilt.bounced, 'the quilt throws him').toBe(true);
    expect(r.quilt.rise, 'far higher than a jump').toBeGreaterThanOrEqual(8);
    expect(r.quilt.floor, 'and he comes down on floor').toBe(true);
    expect(r.quilt.toPit, 'with 3+ tiles before the next ditch').toBeGreaterThanOrEqual(3);
    expect(r.blanket, 'a full jump from under a blanket lands him on it').toEqual({ y: 128 - 16, onGround: true, want: 128 - 16 });
    expect(r.chair, 'and on a lawn chair').toEqual({ y: 160 - 16, onGround: true, want: 160 - 16 });
    expect(r.ledges.every((t) => t === 7), 'blankets and lawn chairs are ledges (jump up through them)').toBe(true);
    expect(r.baskets.every((t) => t === 1 || t === 5), 'baskets are solid steps').toBe(true);
    expect(r.open, 'the open lawn (c195-222) holds nothing at all').toEqual([]);
    expect(r.flat, 'and the ground is flat from c180 to the end').toBe(true);
    expect(r.gifts, 'a heart just before the lawn and a cake past it').toEqual(['194,8,heart', '224,8,cake']);
    expect(r.arena, 'the open lawn holds the Grandmas\' arena (the second run): gates at c196 and c221').toEqual({ col: 197, cols: 24, boss: 'grandmas' });
    expect(r.secrets, 'a fort has no secrets').toBe(0);
    expect(r.grandpa, 'Grandpa cheers from his lawn chair past the lawn').toEqual([226]);
    expect(r.grandmas.sort(), 'both Grandmas: Edmonton and Onion Lake').toEqual(['GRANDMA (EDMONTON)', 'GRANDMA (ONION LAKE)']);
    expect(r.goal, 'the goal is past the lawn').toBeGreaterThan(222);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test("10-6 twist: CABLE CARS. Open cars drift over every chasm and carry Kinan; the pad throws him onto the floating perch; the high car carries him over the 9 gap to the far ledge; bumping the glinting block there opens the SECRET DOOR and walking in unlocks 10-secret", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('10-6'); k.godMode(); k.clearFoes();
      const def = window.KinanLevels.get('10-6'), info = k.twistInfo(), H = def.heights;
      const span = (a) => Math.round((Math.max(...a) - Math.min(...a)) * 10) / 10;
      const xs = info.rollers.map(() => []), ys = info.rollers.map(() => []);
      for (let f = 0; f < 600; f++) { k.step(1, still); k.twistInfo().rollers.forEach((m, i) => { xs[i].push(m.x); ys[i].push(m.y); }); }
      /* ride the first car (the 3 chasm c14-16) */
      const m0 = k.twistInfo().rollers[0];
      k.place(m0.x + m0.w / 2 - 5, m0.y - 16); k.step(10, still);
      const on = k.twistInfo().rollers[0].riding; const px0 = k.probe().x; k.step(40, still); const rode = k.twistInfo().rollers[0].riding, moved = Math.round(Math.abs(k.probe().x - px0));
      /* THE PAD (c120-121, flush): run onto it from c113 and land on the perch (top y=64, feet) */
      k.place(113 * 16 + 1, 176); k.step(10, still);
      let p = k.probe(), bounced = false, peak = p.y, landed = null;
      for (let f = 0; f < 300; f++) { p = k.step(1, { right: true, fire: true, jump: bounced && p.vy < 0 })[0]; peak = Math.min(peak, p.y); if (p.vy <= -10) bounced = true; if (bounced && p.onGround && f > 5) { landed = { x: Math.round(p.x), y: Math.round(p.y) }; break; } }
      const perch = { bounced, rise: Math.round((176 - peak) / 16 * 10) / 10, landed };
      /* THE HIGH WIRE: from the perch, board the high car (row 4) at its left end, ride to its right end, step onto the far ledge */
      k.place(128 * 16 + 3, 48); k.step(10, still);
      const car = () => k.twistInfo().rollers[8];
      let g = 0; while (g++ < 1500 && car().x > 132 * 16 + 3) k.step(1, still);
      k.place(car().x + 16, car().y - 16); k.step(3, still);
      const boarded = car().riding; g = 0;
      while (g++ < 1500 && car().x < 2224 - 3) k.step(1, still);
      let q = k.probe(); for (let f = 0; f < 80 && q.x < 2280; f++) q = k.step(1, { right: true })[0];
      const onFar = { x: Math.round(q.x), y: Math.round(q.y), onGround: q.onGround, tile: k.tile(Math.floor((q.x + 5) / 16), 4) };
      /* the secret exit: closed until the block is bumped; bump it from the ledge; walk into the door */
      const X0 = k.levelInfo().secretExit;
      k.place(144 * 16 + 3, 48); k.step(5, still); k.step(1, { jump: true, tapJump: true }); k.step(25, { jump: true });
      const X1 = k.levelInfo().secretExit;
      k.place(143 * 16 + 3, 48); k.step(2, still);
      let n = 0; while (n++ < 200 && !k.levelInfo().cleared) k.step(1, still);
      const li = k.levelInfo(), unlocked = k.progress().unlockedLevels;
      return { cars: info.rollers.length, looks: [...new Set(info.rollers.map((m) => m.look))], xSpan: xs.map(span), ySpan: ys.map(span), high: info.rollers[8].y, on, rode, moved, pad: [120, 121].map((c) => k.tile(c, 12)), slabs: [[126, 4], [131, 5], [142, 4], [147, 5]].map(([c, rr]) => k.tile(c, rr)), perch, boarded, onFar, X0, X1, cleared: li.cleared, toast: li.toast, unlocked, falls: li.falls || 0 };
    })()`) as { cars: number; looks: string[]; xSpan: number[]; ySpan: number[]; high: number; on: boolean; rode: boolean; moved: number; pad: number[]; slabs: number[]; perch: { bounced: boolean; rise: number; landed: { x: number; y: number } | null }; boarded: boolean; onFar: { x: number; y: number; onGround: boolean; tile: number }; X0: { tx: number; ty: number; to: string; open: boolean }; X1: { tx: number; ty: number; to: string; open: boolean }; cleared: boolean; toast: string; unlocked: string[]; falls: number };
    console.log('10-6 cable cars: ' + JSON.stringify(r));
    expect(r.cars, 'nine cars: one over each of the eight chasms and the high car').toBe(9);
    expect(r.looks).toEqual(['cablecar']);
    for (const s of r.xSpan) expect(s, 'each car drifts').toBeGreaterThanOrEqual(15);
    for (const s of r.ySpan) expect(s, 'and rides level').toBe(0);
    expect(r.high, 'the high car hangs 8 tiles over the floor (row 4)').toBe(64);
    expect(r.on, 'Kinan lands in a car and rides it').toBe(true);
    expect(r.rode).toBe(true);
    expect(r.moved, 'it carried him').toBeGreaterThanOrEqual(5);
    expect(r.pad, 'the pad is two spring tiles flush in the floor').toEqual([6, 6]);
    expect(r.slabs.every((t) => t === 1), 'the perch and the far ledge are floating rock').toBe(true);
    expect(r.perch.bounced, 'the pad throws him').toBe(true);
    expect(r.perch.rise, 'about 9 tiles up').toBeGreaterThanOrEqual(8);
    expect(r.perch.landed, 'and he comes down on the perch (feet on y=64)').toMatchObject({ y: 48 });
    expect(r.perch.landed!.x, 'at the perch, columns 126-131').toBeGreaterThanOrEqual(126 * 16 - 5);
    expect(r.boarded, 'he boards the high car from the perch').toBe(true);
    expect(r.onFar, 'and it carries him to the far ledge').toMatchObject({ y: 48, onGround: true, tile: 1 });
    expect(r.X0, 'the secret door is shut until the block is bumped').toMatchObject({ to: '10-secret', open: false });
    expect(r.X1, 'then the door opens, on the far ledge').toMatchObject({ tx: 143, ty: 3, to: '10-secret', open: true });
    expect(r.cleared, 'walking into the door clears the level').toBe(true);
    expect(r.toast).toContain('SECRET EXIT FOUND');
    expect(r.unlocked, '10-secret is unlocked').toContain('10-secret');
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test("10-7 twist: CLOCK HANDS. Every pit has a little clock whose platform comes up flush with the left lip, sweeps over the top and comes down flush with the right lip; it carries Kinan across; the great clock's minute hand swings by the floor and past the floating ledge; its slow hour hand turns beside it", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('10-7'); k.godMode(); k.clearFoes();
      const def = window.KinanLevels.get('10-7'), info = k.twistInfo(), H = def.heights;
      const pits = []; for (let c = 0; c < H.length; c++) if (H[c] == null && (c === 0 || H[c - 1] != null)) { let e = c; while (H[e + 1] == null) e++; pits.push([c * 16, (e + 1) * 16]); }
      const hs = () => k.twistInfo().hands;
      /* 1100 frames of every bridging hand: flush with the left lip, flush with the right lip, over the top of the pit */
      const seen = pits.map(() => ({ left: false, right: false, top: false, hi: 999 }));
      for (let f = 0; f < 1100; f++) {
        k.step(1, still);
        pits.forEach(([pl, pr], i) => { const p = hs()[i].pads[0], r = p.x + p.w;
          if (Math.abs(p.y - 192) <= 6 && r >= pl + 8 && p.x <= pl + 6) seen[i].left = true;
          if (Math.abs(p.y - 192) <= 6 && p.x <= pr - 8 && r >= pr + 8) seen[i].right = true;
          if (p.x >= pl && r <= pr && p.y < 192) { seen[i].top = true; seen[i].hi = Math.min(seen[i].hi, Math.round(p.y)); } });
      }
      /* ride the first clock (H1, the 3 pit): board at the left lip, ride over, step off at the right lip */
      const ride = (i) => {
        const [pl, pr] = pits[i], pad = () => hs()[i].pads[0];
        let g = 0, px = pad().x; while (g++ < 4000) { k.step(1, still); const p = pad(); if (Math.abs(p.y - 192) <= 6 && p.x + p.w >= pl + 8 && p.x <= pl + 6 && p.x > px) break; px = p.x; }
        const p0 = pad(); k.place(pl + 4, p0.y - 16); k.step(3, still);   /* step off the lip onto the platform, which reaches 6+ px over the pit */
        const boarded = pad().riding; let carried = 0; g = 0;
        while (g++ < 4000) { const q = pad(); if (q.riding) carried++; if (Math.abs(q.y - 192) <= 6 && q.x <= pr - 8 && q.x + q.w >= pr + 8 && g > 30) break; k.step(1, still); }
        let q = k.probe(); for (let f = 0; f < 60 && q.x < pr + 6; f++) q = k.step(1, { right: true })[0];
        q = k.step(40, { right: true }).at(-1);   /* he walks on: the platform leaves him on the floor */
        return { boarded, carried, x: Math.round(q.x), pr, y: Math.round(q.y), onGround: q.onGround };
      };
      const ride1 = ride(0), ride5 = ride(5);
      /* THE GREAT CLOCK: the minute hand (hands[8]) swings past the floor and comes level with the floating ledge at 10:30 */
      const mp = () => hs()[8].pads[0], hub = hs()[8];
      let low = 999, high = 0; for (let f = 0; f < 700; f++) { k.step(1, still); low = Math.min(low, mp().y); high = Math.max(high, mp().y); }
      let g = 0, prevY = mp().y; while (g++ < 3000) { k.step(1, still); const y = mp().y; if (y > 135 && y < 160 && mp().x < hub.cx - 30 && y < prevY) break; prevY = y; }
      const m0 = mp(); k.place(m0.x + m0.w / 2 - 5, m0.y - 16); k.step(3, still);
      const mBoard = mp().riding; g = 0; while (g++ < 3000 && mp().y > 62) k.step(1, still);
      let z = k.probe(); for (let f = 0; f < 40 && z.x > 2170; f++) z = k.step(1, { left: true })[0];
      z = k.step(12, still).at(-1);
      const ledge = { x: Math.round(z.x), y: Math.round(z.y), onGround: z.onGround };
      const sl = [[132, 4], [135, 5]].map(([c, rr]) => k.tile(c, rr));
      return { hands: info.hands.length, looks: info.hands.map((h) => h.look), pits: pits.length, seen, ride1, ride5, mBoard, low: Math.round(low), high: Math.round(high), ledge, sl, hubRow: Math.round(hub.cy / 16 * 10) / 10, hour: hs()[9].pads[0].r / 16, falls: k.levelInfo().falls || 0 };
    })()`) as { hands: number; looks: string[]; pits: number; seen: { left: boolean; right: boolean; top: boolean; hi: number }[]; ride1: { boarded: boolean; carried: number; x: number; pr: number; y: number; onGround: boolean }; ride5: { boarded: boolean; carried: number; x: number; pr: number; y: number; onGround: boolean }; mBoard: boolean; low: number; high: number; ledge: { x: number; y: number; onGround: boolean }; sl: number[]; hubRow: number; hour: number; falls: number };
    console.log('10-7 clock hands: ' + JSON.stringify(r));
    expect(r.hands, 'ten hands: eight little clocks in the pits, and the great clock\'s two').toBe(10);
    expect(r.looks.slice(0, 9).every((l) => l === 'minute') && r.looks[9] === 'hour').toBe(true);
    expect(r.pits, 'eight pits, eight clocks').toBe(8);
    r.seen.forEach((s, i) => { expect(s.left, `clock ${i + 1}: flush with the left lip`).toBe(true); expect(s.right, `clock ${i + 1}: flush with the right lip`).toBe(true); expect(s.top, `clock ${i + 1}: over the top of its pit`).toBe(true); });
    for (const rd of [r.ride1, r.ride5]) {
      expect(rd.boarded, 'Kinan boards the platform at the left lip').toBe(true);
      expect(rd.carried, 'it carries him across').toBeGreaterThan(40);
      expect(rd.x, 'he steps off onto the far side').toBeGreaterThan(rd.pr);
      expect(rd.onGround && rd.y === 176, 'and stands on the floor there').toBe(true);
    }
    expect(r.high - r.low, 'the great clock\'s minute hand sweeps a big circle (8 tiles across)').toBeGreaterThanOrEqual(120);
    expect(r.mBoard, 'Kinan boards the minute hand as it swings by on the way up').toBe(true);
    expect(r.ledge, 'and steps off onto the floating ledge (feet on y=64)').toMatchObject({ y: 48, onGround: true });
    expect(r.ledge.x, 'on the ledge (columns 132-135)').toBeLessThan(2176);
    expect(r.sl, 'the ledge is solid').toEqual([1, 1]);
    expect(r.hour, 'the hour hand is short').toBeLessThan(3);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test('10-8 twist: MIRRORS THAT LIE. Mirror doors open, flicker a warning, shut and open again and never trap Kinan; three doors in a row open 60 frames apart; gold arrows are real and the blue reflected ones are not; the decoy corridors are open underneath (nobody is trapped) and end in glass; the mirror walls are jumpable; four glass steps light one after the other', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('10-8'); k.godMode(); k.clearFoes();
      const def = window.KinanLevels.get('10-8'), info = k.twistInfo();
      /* the first door (D1, c58): 700 frames of its clock */
      let open = 0, shut = 0, warn = 0, reopened = false, warnFirst = false, prevWarn = false, wasShut = false;
      const starts = info.fws.map(() => -1), prevShut = info.fws.map((f) => f.shut);
      for (let f = 0; f < 700; f++) {
        k.step(1, still);
        const fw = k.twistInfo().fws;
        const w = fw[0]; if (w.solid) { shut++; if (!wasShut && prevWarn) warnFirst = true; wasShut = true; } else { open++; if (wasShut) reopened = true; } if (w.warn) warn++; prevWarn = w.warn;
        fw.forEach((d, i) => { if (prevShut[i] && !d.shut && starts[i] < 0) starts[i] = f; prevShut[i] = d.shut; });
      }
      /* never trapped: stand in D1's column as it shuts */
      let g = 0; while (g++ < 600 && !k.twistInfo().fws[0].warn) k.step(1, still);
      const push0 = k.twistInfo().fwPush;
      g = 0; while (g++ < 120 && !k.twistInfo().fws[0].solid) { k.place(58 * 16 + 3, 176); k.step(1, still); }
      k.step(2, still);
      const p = k.probe(), inWall = k.tile(Math.floor((p.x + 5) / 16), Math.floor((p.y + 8) / 16)) !== 0;
      /* the three doors in a row (index 4, 5, 6): their first opening, 60 frames apart (mod their 240 period) */
      const gap = (a, b) => ((starts[b] - starts[a]) % 240 + 240) % 240;
      /* the glass steps: rising edges of the four panes (a few frames of run-up are needed: a second pass) */
      const gl = info.neons.map((n, i) => [n, i]).filter(([n]) => n.look === 'glass').map(([, i]) => i);
      const gs = gl.map(() => -1); let gprev = gl.map((i) => k.twistInfo().neons[i].off);
      for (let f = 0; f < 700; f++) { k.step(1, still); const nn = k.twistInfo().neons; gl.forEach((i, j) => { if (gprev[j] && !nn[i].off && gs[j] < 0) gs[j] = f; gprev[j] = nn[i].off; }); }
      /* a pane carries him while it glows: stand on the first pane when it is lit */
      let h = 0; while (h++ < 700 && k.twistInfo().neons[gl[0]].off) k.step(1, still);
      k.place(104 * 16 + 8, 160 - 16); k.step(6, still); const onPane = k.twistInfo().neons[gl[0]].riding;
      /* the arrows: gold ones are real, blue reflected ones are marked fake */
      const sk = def.skins.map((s) => s[0]);
      const real = sk.filter((s) => s === 'mirror:right').length, fake = sk.filter((s) => s === 'mirror:fakeright').length;
      /* mirror walls: three tiles of glass, jumpable (a full jump is 65 px, three tiles are 48) */
      const wall = [[20, 9], [20, 10], [20, 11]].map(([c, rr]) => k.tile(c, rr)).concat(k.tile(20, 8));
      /* the decoy corridor over the path: ledges on the step, open underneath, glass at the end */
      const cor = []; for (let c = 26; c <= 35; c++) cor.push(k.tile(c, 8));
      const under = []; for (let c = 26; c <= 35; c++) for (let rr = 9; rr <= 11; rr++) if (!(c >= 34 && rr === 10)) under.push(k.tile(c, rr));
      const glassEnd = [6, 7, 8].map((rr) => k.tile(36, rr));
      const heartAt = def.secrets.find((s) => s.kind === 'visible');
      const bonus = { boards: def.tiles.board.length, cracks: def.tiles.crack.length };
      return { doors: info.mirrorDoors, fws: info.fws.length, open, shut, warn, warnFirst, reopened, pushed: k.twistInfo().fwPush - push0, inWall, row: [gap(4, 5), gap(5, 6)], glassSteps: gl.length, glassWave: [gs[1] - gs[0], gs[2] - gs[1], gs[3] - gs[2]], onPane, real, fake, wall, cor, under, glassEnd, heart: [heartAt.col, heartAt.row], bonus, falls: k.levelInfo().falls || 0 };
    })()`) as { doors: number; fws: number; open: number; shut: number; warn: number; warnFirst: boolean; reopened: boolean; pushed: number; inWall: boolean; row: number[]; glassSteps: number; glassWave: number[]; onPane: boolean; real: number; fake: number; wall: number[]; cor: number[]; under: number[]; glassEnd: number[]; heart: number[]; bonus: { boards: number; cracks: number }; falls: number };
    console.log('10-8 mirrors: ' + JSON.stringify(r));
    expect(r.doors, 'nine mirror doors').toBe(9);
    expect(r.fws).toBe(9);
    expect(r.open, 'D1 is open part of the time').toBeGreaterThan(100);
    expect(r.shut, 'and shut part of the time').toBeGreaterThan(100);
    expect(r.warn, 'it flickers a warning before it shuts').toBeGreaterThanOrEqual(50);
    expect(r.warnFirst, 'the warning comes right before it shuts').toBe(true);
    expect(r.reopened, 'and it opens again').toBe(true);
    expect(r.pushed, 'shutting put him out of the door').toBeGreaterThanOrEqual(1);
    expect(r.inWall, 'never inside the shut door').toBe(false);
    expect(r.row, 'three doors in a row: each opens 60 frames after the one before').toEqual([60, 60]);
    expect(r.glassSteps, 'four glass steps').toBe(4);
    expect(r.glassWave, 'each lights 40 frames after the one below').toEqual([40, 40, 40]);
    expect(r.onPane, 'a glowing pane carries him').toBe(true);
    expect(r.real, 'gold arrows (the real way)').toBeGreaterThanOrEqual(8);
    expect(r.fake, 'blue reflected arrows (the lures)').toBe(2);
    expect(r.wall, 'a mirror wall: three solid tiles with open air above').toEqual([1, 1, 1, 0]);
    expect(r.cor.every((t) => t === 7), 'the decoy corridor: ledges').toBe(true);
    expect(r.under.every((t) => t === 0), 'open underneath: step off and he is back on the path').toBe(true);
    expect(r.glassEnd.every((t) => t === 1), 'and it ends in glass').toBe(true);
    expect(r.heart, 'the heart waits at the corridor\'s end').toEqual([27, 7]);
    expect(r.bonus, 'three kick boards, two slam spots').toEqual({ boards: 3, cracks: 6 });
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test('10-secret twist: LAUNCH PADS AND A SKY FULL OF CANDLES. Each barge ends in a launch pad that throws Kinan over the river gap onto the next barge (from a standing start and from a run), through a burst of candles; the decks are strung with candles; it is a reward level (no secrets, a few crew, a finale)', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('10-secret'); k.godMode(); k.clearFoes();
      const def = window.KinanLevels.get('10-secret'), info = k.twistInfo(), H = def.heights;
      /* the bounce off each pad: from 1 tile before it (a slow start) and from 6 tiles before it (a run), up to the landing */
      const pits = (c) => { for (let x = c; x < H.length; x++) if (H[x] == null) return x; return 9999; };
      const pads = [29, 64, 101, 137, 175, 213].map((pad) => {
        const out = { pad };
        for (const [mode, from] of [['slow', pad - 1], ['run', pad - 6]]) {
          k.place(from * 16 + 1, H[from] - 16); k.step(20, still);
          let p = k.probe(), minY = p.y, bounced = false, px = p.x;
          for (let f = 0; f < 500; f++) {
            p = k.step(1, { right: true, jump: bounced && p.vy < 0 })[0];
            minY = Math.min(minY, p.y);
            if (p.vy <= -10) bounced = true;
            if (bounced && p.onGround && f > 5) break;
          }
          const col = Math.floor((p.x + 5) / 16);
          out[mode] = { bounced, rise: Math.round((176 - minY) / 16 * 10) / 10, col, floor: H[col] != null, past: col - (pit0(pad)) };
        }
        return out;
      });
      function pit0(pad) { let c = pad; while (H[c] != null) c++; let e = c; while (H[e + 1] == null) e++; return e; }   /* the last column of the gap after this pad */
      const sk = info.skins.filter((s) => s[0] === 'launchpad').length, springs = [29, 30, 64, 65, 101, 102, 137, 138, 175, 176, 213, 214].map((c) => k.tile(c, 12));
      const bad = []; for (const pad of [29, 64, 101, 137, 175, 213]) for (const g of [].concat(def.tiles.gift, def.tiles.brick)) if (g[0] >= pad - 1 && g[0] <= pad + 13 && g[0] < pad + 30 && g[0] > pad) bad.push([pad, g[0], g[1]]);
      const crateGap = [[86, 90, 101], [160, 164, 175]].map(([a, b, p]) => p - b);
      return { pads, sk, springs, candles: def.candles.length, gifts: def.tiles.gift.length, secrets: (def.secrets || []).length, kind: def.kind, foes: def.foes.length, bad: bad.filter((b) => b[1] < b[0] + 11 && b[1] > b[0]), crateGap, gaps: (() => { const o = []; let c = 0; while (c < H.length) { if (H[c] == null) { let e = c; while (H[e + 1] == null) e++; o.push(e - c + 1); c = e + 1; } else c++; } return o; })(), falls: k.levelInfo().falls || 0 };
    })()`) as { pads: { pad: number; slow: { bounced: boolean; rise: number; col: number; floor: boolean; past: number }; run: { bounced: boolean; rise: number; col: number; floor: boolean; past: number } }[]; sk: number; springs: number[]; candles: number; gifts: number; secrets: number; kind: string; foes: number; bad: unknown[]; crateGap: number[]; gaps: number[]; falls: number };
    console.log('10-secret launch pads: ' + JSON.stringify(r));
    expect(r.kind).toBe('secret');
    expect(r.sk, 'six launch pads').toBe(6);
    expect(r.springs.every((t) => t === 6), 'each pad is two spring tiles').toBe(true);
    for (const p of r.pads) for (const m of [p.slow, p.run]) {
      expect(m.bounced, `the pad at c${p.pad} throws him`).toBe(true);
      expect(m.rise, 'about 9 tiles up').toBeGreaterThanOrEqual(8);
      expect(m.floor, `and he comes down on a barge (c${m.col})`).toBe(true);
      expect(m.past, 'past the river gap').toBeGreaterThanOrEqual(1);
    }
    expect(r.gaps, 'six river gaps: 3, 3, 4, 4, 4, 4').toEqual([3, 3, 4, 4, 4, 4]);
    expect(r.candles, 'a sky full of candles').toBeGreaterThanOrEqual(350);
    expect(r.gifts, 'a gift on every barge and the finale row').toBeGreaterThanOrEqual(14);
    expect(r.secrets, 'a reward level has no secrets to find').toBe(0);
    expect(r.foes, 'a few crew only').toBeLessThanOrEqual(8);
    expect(r.bad, 'no gift or brick in a pad\'s arc').toEqual([]);
    expect(r.crateGap.every((g) => g >= 8), 'no crate within 8 tiles of a pad').toBe(true);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });
});

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* World 11 — Inside the Console, the level files (2026-10-29; the castle and the bosses come in the second run).
   Modelled on w9-levels.spec.ts. For every World 11 level file:
   - it is registered as World 11 on the right map stop and passes the gate (no problems, no lint),
   - it reaches LEVEL CLEAR with the plain dev bot (auto(30, {run: true}), god mode, foes cleared) with 0 pit falls,
   - every secret is reachable: from a spot on the main path just before it, a best-first search over real-input moves finds it,
   - a full-run jump off every high spot comes down on floor,
   - each level's twist exists and does its thing, and each level wears its own console look (130-139),
   - 11-7's secret exit (a corrupted save) opens 11-secret on the World 11 map, the memory gift (Shad's console) is in 11-7,
     and Shad's Dev Room carries the thank-you note word for word,
   - no page errors anywhere. */

const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';
const W11 = ['1', '2', '3', '4', '5', 'fort', '6', '7', 'secret', '8', 'castle'].map((s) => `11-${s}`);   /* 11-castle (Glitchy's Last Stand) came in the second run */
/* the map stop each file stands on (map/worlds/w11.js: 11-1..11-5, the fort, 11-6, 11-7, the secret, 11-8, the castle) */
const SLOT: Record<string, number> = { '11-1': 1, '11-2': 2, '11-3': 3, '11-4': 4, '11-5': 5, '11-fort': 6, '11-6': 7, '11-7': 8, '11-secret': 9, '11-8': 10, '11-castle': 11 };
/* each level's own look (index.html CON_LOOKS): theme number and backdrop */
const LOOK: Record<string, [number, string]> = {
  '11-1': [130, 'wrongway'], '11-2': [131, 'brickrealm'], '11-3': [132, 'starbase'], '11-4': [133, 'dinovalley'], '11-5': [134, 'cakeverse'],
  '11-fort': [135, 'coreguard'], '11-6': [136, 'copycity'], '11-7': [137, 'savevault'], '11-8': [138, 'portalmach'], '11-secret': [139, 'devroom'],
  '11-castle': [140, 'coreheart']   /* the second run: Glitchy's core */
};
/* regular levels (3 secrets + a golden candle each) */
const REGULAR = ['11-1', '11-2', '11-3', '11-4', '11-5', '11-6', '11-7', '11-8'];

type Secret = { kind: string; col: number; row: number; prize: string; exit?: string };
type Area = { cols: number; heights: (number | null)[]; secrets?: Secret[]; talk?: [number, string, string, number?][] };
type LevelDef = Area & { id: string; world: number; slot: number; kind?: string; theme?: number; areas?: Area[]; goal: { col: number; row: number } };
type MapState = { mounted: boolean; busy: boolean; world: number | null; at: number; walking: boolean; crossing: boolean; banner: string | null; notice: string | null; celebrate?: number | null; stops: { id: string | null; kind: string; built: boolean; state: string | null }[] };
type Probe = { x: number; y: number; vx: number; vy: number; onGround: boolean };
type Dev = {
  playLevel: (id: string) => unknown;
  levelInfo: () => { id: string | null; cleared: boolean; returned: boolean; toast: string; candles: number; secretsFound: boolean[]; secretExit: { tx: number; ty: number; to: string; open: boolean } | null; look: { theme: number; bg: string | null; place: string | null } | null };
  levels: () => { levels: { id: string; problems: string[]; lint: string[] }[] };
  godMode: () => void;
  clearFoes: () => void;
  place: (x: number, y: number) => unknown;
  step: (n: number, hold?: Record<string, boolean>) => Probe[];
  probe: () => Probe;
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
    if (k.arenaInfo() && k.arenaInfo().beltWait) k.cutSkip();   /* 11-castle: Sabumnim's black belt comes first (a tap skips it) */
    k.auto(30, { run: true });
    far = Math.max(far, Math.floor(k.probe().x / 16));
    if ((k.levelInfo().falls || 0) > f0) fellNear.push(Math.floor(x0 / 16));
  }
  return { cleared: k.levelInfo().cleared, n, falls: k.levelInfo().falls || 0, fellNear, far, at: [Math.floor(k.probe().x / 16), Math.floor(k.probe().y / 16)] };
}`;

/* where a secret's route starts: the nearest flat floor column of the main path at least 4 columns before it (in the level's own columns) */
const FROM_FOR = `(id, k) => {
  const def = window.KinanLevels.get(id), H = def.heights, sec = def.secrets[k], S = def.solid || [], O = def.open || [];
  const inSolid = (c) => S.some((b) => c >= b[0] && c <= b[2] && b[3] >= 11 && !O.some((o) => c >= o[0] && c <= o[2] && o[1] <= 11 && o[3] >= 11));
  for (let c = sec.col - 4; c > 3; c--) if (H[c] === 192 && H[c - 1] === 192 && H[c + 1] === 192 && !inSolid(c) && !inSolid(c - 1) && !inSolid(c + 1)) return c;
  return 3;
}`;

/* reach secret number k of a level (w8/w9-levels.spec.ts's SEEK, unchanged): stand Kinan on the main path at column
   'from', then a best-first search over real-input moves until the level marks that secret found. */
const SEEK = `(id, k, from, pre) => {
  const K = window.__k11, def = window.KinanLevels.get(id);
  const list = def.areas || [def], H = [], secs = [];
  let base = 0;
  for (const a of list) { for (const h of a.heights) H.push(h); for (const s of a.secrets || []) secs.push(Object.assign({}, s, { col: s.col + base })); base += a.cols; }
  const sec = secs[k];
  const fresh = () => { K.playLevel(id); K.godMode(); K.clearFoes(); if (pre) (0, eval)(pre)(K, def); };
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
  for (const d of [1, -1]) MOVES.push({ d, run: 0, tap: false, hold: 0, len: 24, fire: false, kick: true });   /* a KICK every 10 frames, facing d */
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
        last = K.step(1, Object.assign({}, hold, { jump: m.tap && g < m.hold, tapJump: m.tap && g === 0, tapFire: !!m.kick && g % 10 === 0 }))[0];
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

/* what a kid has done before a level's secrets are in reach: 11-3's secret behind the gold gate needs the energy wand (picked up on the
   main path at its pedestal), so the secret search starts with Kinan having touched it */
const PRE: Record<string, string> = {
  '11-3': `(K, def) => { const w = def.wand; K.place(w[0] * 16 + 3, (w[1] + 1) * 16 - 16); K.step(6, { left: false, right: false, jump: false, fire: false }); }`
};

/* the high spots with a pit after them, read from the level itself: every solid block that stands on the floor with its top at
   least one tile above Kinan's standing row, and the pits (first column) within 16 columns after it. A full-run jump off it
   must come down on floor. (Blocks inside a flipped-controls stretch are left out: the test holds RIGHT, which flips there.) */
const SPOTS = `(id) => {
  const def = window.KinanLevels.get(id), H = def.heights, S = def.solid || [], fl = def.flip, out = [];
  for (const b of S) {
    const c0 = b[0], r0 = b[1], c1 = b[2], r1 = b[3];
    let grounded = true;
    for (let c = c0; c <= c1; c++) if (H[c] == null || r1 + 1 < Math.floor(H[c] / 16)) grounded = false;
    if (!grounded || r0 > 10) continue;
    if (S.some((q) => q !== b && q[0] <= c1 && q[2] >= c0 && q[1] <= r0 - 1 && q[3] >= r0 - 1)) continue;   /* no headroom (a ceiling right above it): nobody stands there */
    if (fl && c1 >= fl.from - 9 && c0 <= fl.to + 10) continue;
    const pits = [];
    for (let c = c1 + 1; c < Math.min(H.length, c1 + 17); c++) if (H[c] === null && H[c - 1] !== null) pits.push(c);
    out.push({ from: c0, to: c1, top: r0, pits, what: 'block c' + c0 + '-' + c1 + ' top row ' + r0 });
  }
  return out;
}`;

test.describe('World 11 · the level files', () => {
  test('all World 11 level files are registered as World 11 on their map stops, pass the gate and wear their own console look', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const reg = await page.evaluate(() => {
      const w = window as unknown as Win;
      const all = w.KinanLevels.list();
      const ids = all.filter((id) => id.startsWith('11-'));
      const defs = ids.map((id) => { const d = w.KinanLevels.get(id); w.__k11.playLevel(id); return { id, world: d.world, slot: d.slot, theme: d.theme, look: w.__k11.levelInfo().look, pet: 'pet' in d || (d.areas || []).some((a) => 'pet' in a) }; });
      const lv = w.__k11.levels().levels.filter((x) => x.id.startsWith('11-'));
      /* Worlds 1-10 never wear a console look */
      const borrowed = all.filter((id) => !id.startsWith('11-')).map((id) => [id, w.KinanLevels.get(id).theme]).filter(([, t]) => typeof t === 'number' && (t as number) >= 130 && (t as number) <= 139);
      return { ids, defs, bad: lv.filter((x) => x.problems.length || x.lint.length), borrowed };
    });
    expect([...reg.ids].sort()).toEqual([...W11].sort());
    expect(reg.bad).toEqual([]);
    expect(reg.borrowed, 'no level outside World 11 wears a console look').toEqual([]);
    for (const d of reg.defs) {
      expect(d.world, d.id).toBe(11);
      expect(d.slot, d.id).toBe(SLOT[d.id]);
      expect(d.theme, `${d.id} wears its own console look`).toBe(LOOK[d.id][0]);
      expect(d.look && d.look.bg, `${d.id}: the look's backdrop`).toBe(LOOK[d.id][1]);
      expect(d.pet, `${d.id}: no pet crate (all six are found by World 5)`).toBe(false);
    }
    expect(new Set(reg.defs.map((d) => d.theme)).size, 'ten levels, ten different looks').toBe(reg.defs.length);
    expect(errors).toEqual([]);
  });

  test('every console backdrop draws (each level shown for a second at its start, middle and end) with no page error', async ({ page }) => {
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
    }, W11);
    for (const o of out) expect(o.look && o.look.theme, o.id).toBe(LOOK[o.id][0]);
    expect(errors).toEqual([]);
  });

  test('no World 11 foe starts inside a block or waits at a lip, no block hangs over a take-off, and no candle is lost inside a block', async ({ page }) => {
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
    }, W11);
    for (const o of out) {
      expect(o.badFoes, `${o.id}: foes inside blocks [col, row, tile]`).toEqual([]);
      expect(o.atLip, `${o.id}: walkers or hoppers waiting at a lip [col, row, type]`).toEqual([]);
      expect(o.overTakeoff, `${o.id}: blocks over a gap's take-off column [col, row]`).toEqual([]);
      expect(o.live, `${o.id}: every authored candle is in the level`).toBe(o.authored);
    }
    expect(errors).toEqual([]);
  });

  test('a full-run jump off every World 11 high spot comes down on floor, with a tile to spare before the next pit', async ({ page }) => {
    test.setTimeout(480_000);
    const errors = watchErrors(page);
    await boot(page);
    const spots = await page.evaluate(({ ids, spotsFn }) => ids.filter((id) => !!(window as unknown as Win).KinanLevels.get(id)).flatMap((id) => ((0, eval)(spotsFn)(id) as { from: number; to: number; top: number; pits: number[]; what: string }[]).map((s) => Object.assign({ id }, s))), { ids: W11, spotsFn: SPOTS });
    const out = await page.evaluate((list) => {
      const k = (window as unknown as Win).__k11;
      const still = { left: false, right: false, jump: false, fire: false };
      const go = { left: false, right: true, jump: false, fire: true };
      return list.filter((s) => s.pits.length).map((s) => {
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
    }, spots);
    for (const o of out) {
      const far = o.res.reduce((m, r) => Math.max(m, r.x), 0), fast = o.res.reduce((m, r) => Math.max(m, r.v0), 0);
      const tight = o.res.reduce((m, r) => Math.min(m, r.room), 999);
      console.log(`${o.id} ${o.what}: ${o.res.length} jumps (top speed ${fast} px/f), farthest landing x=${far} (column ${Math.floor(far / 16)}), least floor left before the next pit ${tight} px`);
      for (const r of o.res) {
        expect(r.landed, `${o.id} ${o.what}: jump at frame ${r.d} from the edge lands on floor (x=${r.x})`).toBe(true);
        expect(r.room, `${o.id} ${o.what}: jump at frame ${r.d} from the edge leaves a tile of floor before the next pit (x=${r.x})`).toBeGreaterThanOrEqual(16);
      }
    }
    expect(spots.length, 'there are high spots to check').toBeGreaterThan(5);
    expect(errors).toEqual([]);
  });

  for (const id of W11) {
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

  for (const id of REGULAR) {
    test(`${id}: every secret is reachable from the main path`, async ({ page }) => {
      test.setTimeout(300_000);
      const errors = watchErrors(page);
      await boot(page);
      const out = await page.evaluate(({ id, seek, fromFor, pre }) => {
        const def = (window as unknown as Win).KinanLevels.get(id);
        const n = (def.areas || [def]).reduce((s, a) => s + (a.secrets || []).length, 0);
        const froms = Array.from({ length: n }, (_, k) => (0, eval)(fromFor)(id, k) as number);
        return { n, res: froms.map((col, k) => (0, eval)(seek)(id, k, col, pre)) };
      }, { id, seek: SEEK, fromFor: FROM_FOR, pre: PRE[id] || '' }) as { n: number; res: { found: boolean; tries: number; from: number }[] };
      console.log(`${id} secrets: ` + out.res.map((r, k) => `#${k + 1} ${r.found ? 'found' : 'NOT FOUND'} (${r.tries} moves from c${r.from})`).join(' · '));
      expect(out.n, `${id}: three secrets`).toBe(3);
      for (const [k, r] of out.res.entries()) expect(r, `${id} secret #${k + 1}`).toMatchObject({ found: true });
      expect(errors).toEqual([]);
    });
  }
});

/* ---- the twists: each World 11 level's own trick exists and does its thing (scripts run in the page) ---- */
test.describe('World 11 · the twists', () => {
  test('11-1 twist: THE CONTROLS FLIP. A big sign, a calm 3-2-1 on the ground, LEFT is RIGHT for one short stretch, a 3-2-1 back, and from then on the controls are normal for good; never over a pit', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false }, def = window.KinanLevels.get('11-1'), H = def.heights, f = def.flip;
      k.playLevel('11-1'); k.godMode(); k.clearFoes();
      const info0 = k.twistInfo().w11;
      const S = def.solid || [];
      /* a column with nothing solid within 3 columns (so a short walk is never stopped by a hurdle), searched from c up to hi */
      const clear = (c, hi) => { for (let q = c; q <= hi; q++) if (H[q] === 192 && !S.some((b) => q >= b[0] - 3 && q <= b[2] + 3 && b[3] >= 10)) return q; return c; };
      const moved = (col, hold, hi) => { const cc = clear(col, hi == null ? col + 6 : hi); k.place(cc * 16 + 3, 192 - 16); k.step(4, still); const a = k.probe().x; k.step(14, hold); const b = k.probe().x; return Math.round(b - a); };
      const right = { left: false, right: true, jump: false, fire: false }, left = { left: true, right: false, jump: false, fire: false };
      /* a column of the flat approach, well before the plates: normal */
      const before = { right: moved(f.from - 14, right), left: moved(f.from - 14, left) };
      /* the plates: 3 at from-9..from-7, 2 at from-6..from-4, 1 at from-3..from-1 (still normal there) */
      const plates = [];
      for (const c of [f.from - 8, f.from - 5, f.from - 2]) { k.place(c * 16 + 3, 192 - 16); k.step(3, still); const i = k.twistInfo().w11.flip; plates.push([i.ph, i.num, i.on]); }
      const preMove = moved(f.from - 5, right);
      /* inside the stretch: flipped */
      const inside = { right: moved(f.from + 3, right, f.to), left: moved(f.from + 3, left, f.to), mid: moved(Math.floor((f.from + f.to) / 2), right, f.to) };
      /* the plates back: 3, 2, 1 (still flipped) */
      const post = [];
      for (const c of [f.to + 2, f.to + 5, f.to + 8]) { k.place(c * 16 + 3, 192 - 16); k.step(3, still); const i = k.twistInfo().w11.flip; post.push([i.ph, i.num, i.on]); }
      const postMove = moved(f.to + 5, right);
      /* past the NORMAL line: normal, for good (even walking back through the stretch) */
      const after = { right: moved(f.to + 14, right), left: moved(f.to + 14, left) };
      const done = k.twistInfo().w11.flip.done;
      const back = moved(f.from + 3, right, f.to);
      const inside2 = k.twistInfo().w11.flip.on;
      let pitFree = true; for (let c = f.from - 9; c <= f.to + 10; c++) if (H[c] == null) pitFree = false;
      const shown = k.twistInfo().w11.shown.map((s) => s.split('|')[0]);
      return { sign: f.sign, from: f.from, to: f.to, stretch: f.to - f.from + 10, info0: !!info0, before, plates, preMove, inside, post, postMove, after, done, back, inside2, pitFree, shown, falls: k.levelInfo().falls || 0 };
    })()`) as { sign: number; from: number; to: number; stretch: number; info0: boolean; before: { right: number; left: number }; plates: [string, number, boolean][]; preMove: number; inside: { right: number; left: number; mid: number }; post: [string, number, boolean][]; postMove: number; after: { right: number; left: number }; done: boolean; back: number; inside2: boolean; pitFree: boolean; shown: string[]; falls: number };
    console.log('11-1 the flip: ' + JSON.stringify(r));
    expect(r.info0, 'the flip is a level key').toBe(true);
    expect(r.sign, 'the sign stands before the plates').toBeLessThan(r.from - 9);
    expect(r.before.right, 'normal before the plates: RIGHT goes right').toBeGreaterThan(20);
    expect(r.before.left, 'and LEFT goes left').toBeLessThan(-20);
    expect(r.plates, 'the 3-2-1 plates').toEqual([['pre', 3, false], ['pre', 2, false], ['pre', 1, false]]);
    expect(r.preMove, 'still normal while the plates count down').toBeGreaterThan(20);
    expect(r.inside.right, 'inside the stretch RIGHT goes LEFT').toBeLessThan(-20);
    expect(r.inside.left, 'and LEFT goes RIGHT').toBeGreaterThan(20);
    expect(r.inside.mid, 'in the middle too').toBeLessThan(-20);
    expect(r.post, 'the 3-2-1 back, still flipped').toEqual([['post', 3, true], ['post', 2, true], ['post', 1, true]]);
    expect(r.postMove, 'flipped until the NORMAL line').toBeLessThan(-20);
    expect(r.after.right, 'past the NORMAL line RIGHT goes right again').toBeGreaterThan(20);
    expect(r.after.left, 'and LEFT goes left').toBeLessThan(-20);
    expect(r.done, 'it settled for good').toBe(true);
    expect(r.back, 'even back inside the old stretch the controls stay normal').toBeGreaterThan(20);
    expect(r.inside2, 'and it is not flipped any more').toBe(false);
    expect(r.stretch, 'a short stretch').toBeLessThanOrEqual(40);
    expect(r.pitFree, 'no pit from the first plate to the NORMAL line').toBe(true);
    for (const w of ['3', '2', '1', 'FLIP!', 'NORMAL']) expect(r.shown, `the screen said ${w}`).toContain(w);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test('11-2 twist: STUD SWITCHES. Stepping on a stud snaps its bricks into place one by one, solid for good; without the stud the five-tile tower is a wall, with it Kinan climbs it; a second stud on the landing builds the way up the seven-tile tower; a stud bridges a gap', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      const w = () => k.twistInfo().w11, fresh = () => { k.playLevel('11-2'); k.godMode(); k.clearFoes(); };
      fresh();
      const studs0 = w().studs, n0 = studs0.length, s0 = studs0[0];
      const before = s0.bricks.filter((b) => b[3]).length;
      k.place(s0.c * 16 + 3, 176); k.step(2, still);
      const pressed = w().studs[0].pressed;
      const seq = []; for (let f = 0; f < 45; f++) { k.step(1, still); seq.push(w().studs[0].n); }
      const after = w().studs[0].bricks.filter((b) => b[3]).length;
      const steps = seq.every((v, i) => v - (i ? seq[i - 1] : 0) <= 1);
      k.step(120, still);
      const stillThere = w().studs[0].bricks.filter((b) => b[3]).length;
      /* with the stud pressed, the bot climbs the five-tile tower (c24-27, top row 7: his feet at y=112) */
      k.place(15 * 16 + 3, 176); k.step(3, still);
      let minY = 999; for (let f = 0; f < 150; f++) { k.auto(1, { run: true }); const g = k.probe(); if (g.onGround) minY = Math.min(minY, g.y); }   /* the highest spot he STANDS on */
      /* without it (a fresh level, the stud at c10 never touched) the tower is a wall */
      fresh(); k.place(15 * 16 + 3, 176); k.step(3, still);
      let minY2 = 999; for (let f = 0; f < 240; f++) { k.auto(1, { run: true }); const g = k.probe(); if (g.onGround) minY2 = Math.min(minY2, g.y); }
      const wall = k.probe();
      /* the two-step climb: stud B (on the landing) builds the stairs up the seven-tile tower (top row 5: feet at y=80) */
      fresh(); k.place(99 * 16 + 3, 176); k.step(3, still);
      let minY3 = 999; for (let f = 0; f < 170; f++) { k.auto(1, { run: true }); const g = k.probe(); if (g.onGround) minY3 = Math.min(minY3, g.y); }
      const chainPressed = w().studs.map((s) => s.pressed);
      /* a stud that bridges the first gap (c44-46): the bricks are solid at row 12 */
      fresh(); const s1 = w().studs[1];
      k.place(s1.c * 16 + 3, 176); k.step(60, still);
      const bridge = w().studs[1].bricks.map((b) => b[3]);
      return { n0, before, pressed, seq: seq.filter((v, i) => i % 6 === 0), after, steps, stillThere, minY, minY2, wallX: Math.round(wall.x), minY3, chainPressed, bridge, snapped: w().snapped, skins: k.twistInfo().skins.map((s) => s[0]), falls: k.levelInfo().falls || 0 };
    })()`) as { n0: number; before: number; pressed: boolean; seq: number[]; after: number; steps: boolean; stillThere: number; minY: number; minY2: number; wallX: number; minY3: number; chainPressed: boolean[]; bridge: boolean[]; snapped: number; skins: string[]; falls: number };
    console.log('11-2 stud switches: ' + JSON.stringify(r));
    expect(r.n0, 'eight stud switches').toBe(8);
    expect(r.before, 'the stairs are not there before the stud is pressed').toBe(0);
    expect(r.pressed, 'standing on the pad presses it').toBe(true);
    expect(r.steps, 'the bricks snap in one at a time').toBe(true);
    expect(r.after, 'all ten bricks of the staircase are solid').toBe(10);
    expect(r.stillThere, 'and they stay for good').toBe(10);
    expect(r.minY, 'with the stairs, the bot reaches the top of the tower (feet on row 7)').toBeLessThanOrEqual(96);
    expect(r.minY2, 'without the stud the five-tile tower is a wall').toBeGreaterThan(140);
    expect(r.wallX, 'stopped at its foot').toBeLessThan(24 * 16);
    expect(r.minY3, 'the second stud builds the way up the seven-tile tower (feet on row 5)').toBeLessThanOrEqual(64);
    expect(r.chainPressed[4], 'stud B on the landing was pressed').toBe(true);
    expect(r.bridge.every(Boolean) && r.bridge.length === 3, 'the bridge stud makes a solid bridge').toBe(true);
    expect(r.skins.filter((s) => s === 'toybrick').length, 'towers of toy bricks').toBeGreaterThanOrEqual(10);
    expect(r.skins, 'the Heart of the Blocks').toContain('blockheart');
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test('11-3 twist: TIMED LASER GATES and THE ENERGY WAND. A gate is red for 60 frames of every 180, dark between, with a flicker before it turns on; the beam hurts only while red; a corridor of gates opens in a wave; the gold gate is solid until a kick with the wand cuts it', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false }, run = { left: false, right: true, jump: false, fire: true };
      const w = () => k.twistInfo().w11, hp = () => k.twistInfo().hp, fresh = () => { k.playLevel('11-3'); k.clearFoes(); };   /* no god mode: the beams really hurt */
      fresh();
      const lz = w().lasers;
      const gates = lz.length, marked = lz.filter((l) => l.cut).length, tall = lz.filter((l) => l.r1 - l.r0 >= 4).length, low = lz.filter((l) => l.r0 === l.r1 && !l.cut).length;
      /* the rhythm of the first gate (c22): 540 frames */
      const g0 = []; for (let f = 0; f < 540; f++) { k.step(1, still); const l = w().lasers[0]; g0.push(l.active ? 1 : l.warn ? 2 : 0); }
      const runs = []; let cur = g0[0], n = 0; for (const v of g0) { if (v === cur) n++; else { runs.push([cur, n]); cur = v; n = 1; } } runs.push([cur, n]);
      const onRuns = runs.filter((q) => q[0] === 1 && q[1] === 60 || false).length, warnRuns = runs.filter((q) => q[0] === 2).map((q) => q[1]);
      /* the beam hurts only while red: wait for red, stand in it; wait for dark, walk through it */
      fresh(); let f1 = 0; while (!w().lasers[0].active && f1++ < 400) k.step(1, still);
      const hp0 = hp(); k.place(22 * 16 + 3, 176); k.step(2, still); const hurt = hp0 - hp();
      fresh(); k.step(1, still); f1 = 0; while (!(!w().lasers[0].active && !w().lasers[0].warn) && f1++ < 400) k.step(1, still);
      const hp1 = hp(); k.place(20 * 16, 176); k.step(2, still); k.step(24, run); const through = { dx: Math.round(k.probe().x - 20 * 16), hurt: hp1 - hp() };
      /* THE CORRIDOR RUN: four tall gates 8 tiles apart open in a wave; a steady run from c178, tried at 30 different moments */
      let ok = 0, bad = 0;
      for (let d = 0; d < 150; d += 5) {
        fresh(); k.step(d, still); k.place(178 * 16, 176); k.step(2, still);
        const h0 = hp(); k.step(150, run);
        if (hp() === h0) ok++; else bad++;
      }
      /* the gold gate: solid until a kick with the wand cuts it */
      fresh();
      const gold = w().lasers.findIndex((l) => l.cut), g = w().lasers[gold];
      k.place((g.c - 1) * 16 + 3, 176); k.step(2, { right: true }); k.step(1, { right: true, tapFire: true }); k.step(24, { right: true });
      const before = { done: w().lasers[gold].done, solid: w().lasers[gold].solid, wand: w().hasWand, cuts: w().cuts };
      k.place(w().wand.c * 16 + 3, (w().wand.r + 1) * 16 - 16); k.step(6, still);
      const gotWand = w().hasWand;
      k.place((g.c - 1) * 16 + 3, 176); k.step(2, { right: true }); k.step(1, { right: true, tapFire: true }); k.step(24, { right: true });
      const after = { done: w().lasers[gold].done, solid: w().lasers[gold].solid, cuts: w().cuts, tile: k.tile(g.c, g.r0) };
      const hp2 = hp(); k.step(60, { right: true });
      const inside = { x: Math.round(k.probe().x), hurt: hp2 - hp() };
      return { gates, marked, tall, low, onRuns, warnRuns: warnRuns.slice(0, 3), first: runs.slice(0, 4), hurt, through, ok, bad, before, gotWand, after, inside, goldCol: g.c, wandAt: w().wand ? [w().wand.c, w().wand.r] : null, skins: k.twistInfo().skins.filter((s) => s[0] === 'panel').length };
    })()`) as { gates: number; marked: number; tall: number; low: number; onRuns: number; warnRuns: number[]; first: [number, number][]; hurt: number; through: { dx: number; hurt: number }; ok: number; bad: number; before: { done: boolean; solid: boolean; wand: boolean; cuts: number }; gotWand: boolean; after: { done: boolean; solid: boolean; cuts: number; tile: number }; inside: { x: number; hurt: number }; goldCol: number; wandAt: number[] | null; skins: number };
    console.log('11-3 lasers and the wand: ' + JSON.stringify(r));
    expect(r.gates, 'twelve laser gates').toBe(12);
    expect(r.marked, 'one gold gate').toBe(1);
    expect(r.tall, 'tall gates (wait for the dark)').toBe(7);
    expect(r.low, 'low trip-beams (jump them)').toBe(4);
    expect(r.onRuns, 'red for exactly 60 frames each time').toBeGreaterThanOrEqual(2);
    expect(r.warnRuns.every((n) => n === 40), 'a 40-frame flicker before each red').toBe(true);
    expect(r.hurt, 'standing in a red beam costs a heart').toBe(1);
    expect(r.through.dx, 'walking through the dark gate').toBeGreaterThan(30);
    expect(r.through.hurt, 'costs nothing').toBe(0);
    expect(r.ok, 'a steady run through the four-gate wave is safe from most starting moments').toBeGreaterThanOrEqual(15);
    expect(r.bad, 'and still dangerous when you arrive in the red').toBeGreaterThanOrEqual(5);
    expect(r.before, 'without the wand a kick does nothing to the gold gate: solid, uncut').toMatchObject({ done: false, solid: true, wand: false, cuts: 0 });
    expect(r.gotWand, 'the wand is picked up on the main path').toBe(true);
    expect(r.after, 'with the wand a kick cuts it for good').toMatchObject({ done: true, solid: false, cuts: 1, tile: 0 });
    expect(r.inside.x, 'and Kinan walks into the vault').toBeGreaterThan((r.goldCol + 1) * 16);
    expect(r.inside.hurt, 'unhurt').toBe(0);
    expect(r.wandAt, 'the wand pedestal').toEqual([63, 11]);
    expect(errors).toEqual([]);
  });

  test('11-4 twist: VOLCANO VENT LIFTS and THE BABY DINO. A vent rests, steams for 40 frames, puffs its cloud up five or six tiles, holds and sinks; the cloud carries Kinan up to a cliff top; the shaft never hurts; the lost baby follows him once he finds it', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      const w = () => k.twistInfo().w11, hp = () => k.twistInfo().hp, fresh = () => { k.playLevel('11-4'); k.godMode(); k.clearFoes(); };
      fresh();
      const vs = w().vents, n = vs.length, rises = vs.map((v) => v.rise / 16), cols = vs.map((v) => Math.round(v.x / 16));
      /* the first vent's cycle over 900 frames */
      const ys = [], warns = []; for (let f = 0; f < 900; f++) { k.step(1, still); const v = w().vents[0]; ys.push(v.y); warns.push(v.warn ? 1 : 0); }
      const top = Math.min(...ys), rest = Math.max(...ys), atTop = ys.filter((y) => Math.abs(y - top) < 0.5).length, warnRuns = []; let wn = 0;
      for (const v of warns) { if (v) wn++; else if (wn) { warnRuns.push(wn); wn = 0; } }
      /* ride the first vent: wait for its steam, stand on the cloud, wait for the puff, then walk right onto the cliff top (c59) */
      const ride = (i, dir, n) => {
        fresh(); let f = 0; while (!w().vents[i].warn && f++ < 900) k.step(1, still);
        const v = w().vents[i]; k.place(v.x + 16, 176); k.step(4, still);
        let high = 999, riding = 0; for (let g = 0; g < 160; g++) { const p = k.step(1, still)[0]; if (p.onGround) high = Math.min(high, p.y); if (w().vents[i].riding) riding++; }
        const topY = k.probe().y;
        const p2 = k.step(n, { left: dir < 0, right: dir > 0, jump: false, fire: false }); const end = p2[p2.length - 1];
        return { high: Math.round(high), topY: Math.round(topY), riding, endX: Math.round(end.x), endY: Math.round(end.y), onGround: end.onGround, falls: k.levelInfo().falls || 0 };
      };
      const first = ride(0, 1, 40), second = ride(1, -1, 14);
      /* the shaft never hurts: stand over a vent whose cloud is up, drop two tiles, nothing lost */
      fresh(); let h = 0; while (!(w().vents[0].up > 0.99) && h++ < 900) k.step(1, still);
      const hpB = hp(); k.place(w().vents[0].x + 8, 150); k.step(1, still);
      const p3 = k.step(30, still); const shaft = { y: Math.round(p3[p3.length - 1].y), hurt: hpB - hp(), falls: k.levelInfo().falls || 0 };
      /* the lost baby */
      fresh(); const b0 = w().baby; k.place(80 * 16, 176); k.step(20, still); const far = w().baby.got;
      k.place(92 * 16 + 3, 176); k.step(6, still); const found = w().baby.got;
      k.place(98 * 16, 176); k.step(40, { right: true, fire: true }); const bx = w().baby.x, px = k.probe().x;
      return { n, rises, cols, top, rest, atTop, warnRuns: warnRuns.slice(0, 2), first, second, shaft, b0, far, found, dx: Math.round(px - bx), by: w().baby.y, falls: k.levelInfo().falls || 0, skins: k.twistInfo().skins.filter((s) => s[0] === 'lavarock').length };
    })()`) as { n: number; rises: number[]; cols: number[]; top: number; rest: number; atTop: number; warnRuns: number[]; first: { high: number; topY: number; riding: number; endX: number; endY: number; onGround: boolean; falls: number }; second: { high: number; topY: number; riding: number; endX: number; endY: number; onGround: boolean; falls: number }; shaft: { y: number; hurt: number; falls: number }; b0: { x: number; y: number; got: boolean }; far: boolean; found: boolean; dx: number; by: number; falls: number; skins: number };
    console.log('11-4 vents and the baby: ' + JSON.stringify(r));
    expect(r.n, 'four vent lifts').toBe(4);
    expect(r.rises, 'five, six, five and five tiles').toEqual([5, 6, 5, 5]);
    expect(r.cols, 'where the shafts are').toEqual([56, 100, 150, 205]);
    expect(r.rest, 'at rest the cloud is flush with the floor').toBe(192);
    expect(r.top, 'it puffs up five tiles').toBeCloseTo(112, 0);
    expect(r.atTop, 'and holds for two seconds').toBeGreaterThanOrEqual(110);
    expect(r.warnRuns.every((n) => n === 40), 'a 40-frame steam warning first').toBe(true);
    expect(r.first.riding, 'the cloud carried him').toBeGreaterThanOrEqual(100);
    expect(r.first.high, 'up to the top of the five-tile cliff (feet on row 7)').toBe(96);
    expect(r.first.endX, 'and he stepped onto the cliff').toBeGreaterThan(59 * 16);
    expect(r.first.endY, 'standing on the cliff top').toBe(96);
    expect(r.second.high, 'the six-tile vent carries him to row 6').toBe(80);
    expect(r.second.endX, 'and LEFT from the top of it, onto the nest ledge').toBeLessThan(100 * 16);
    expect(r.second.endY, 'standing on the ledge').toBe(80);
    expect(r.shaft.hurt, 'dropping into a shaft costs nothing').toBe(0);
    expect(r.shaft.y, 'he stands on the shaft floor (feet at row 14)').toBe(208);
    expect(r.far, 'the baby is not found from afar').toBe(false);
    expect(r.found, 'walking into the nest finds it').toBe(true);
    expect(Math.abs(r.dx), 'and it follows close behind (under 6 tiles)').toBeLessThan(96);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test('11-5 twist: GLASS BRIDGES. A candle switch fades glass tiles in over a gap for a few seconds; they wait while Kinan is on them, flicker before they go, and a new press starts the timer again; under a low cake overhang the gap cannot be jumped; one switch lights three bridges', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false }, run = { left: false, right: true, jump: false, fire: true };
      const w = () => k.twistInfo().w11, fresh = () => { k.playLevel('11-5'); k.godMode(); k.clearFoes(); };
      fresh();
      const gl = w().glass, n = gl.length, sw = gl.map((g) => [g.c, g.r]), before = gl.map((g) => g.on);
      const solidBefore = w().glass[3].solid.slice();
      /* the second switch (c42) lights the bridge over the 3 gap at c70-72 */
      const g1 = 3 - 1;   /* gl[2] is c42: indexes: 0 c12, 1 c18 (ledge), 2 c42, 3 c98, 4 c122, 5 c144, 6 c176 */
      k.place(42 * 16 + 3, 176); k.step(3, still);
      const lit = w().glass[2], timer0 = lit.timer, solidOn = lit.solid.slice();
      /* it fades after 6 s when he is away (c45: not near the deck) */
      k.place(45 * 16, 176); const t0 = w().glass[2].timer; k.step(300, still); const t300 = w().glass[2].timer, stillOn = w().glass[2].on;
      k.step(61, still); const gone = !w().glass[2].on, tileGone = k.tile(71, 12);
      /* a new press: the timer is back at 360 */
      k.place(42 * 16 + 3, 176); k.step(3, still); const again = w().glass[2].timer;
      /* standing on the glass: the timer waits (it never takes the floor from under him) */
      k.place(71 * 16 + 3, 176 - 0); k.step(2, still); k.step(500, still);
      const onGlass = { on: w().glass[2].on, y: Math.round(k.probe().y), timer: w().glass[2].timer, falls: k.levelInfo().falls || 0 };
      /* once he steps off, it goes (and flickers first: the last 60 frames) */
      k.place(80 * 16, 176); const flick = []; for (let f = 0; f < 140; f++) { k.step(1, still); flick.push(w().glass[2].timer); }
      const offAfter = !w().glass[2].on;
      /* a jump across the 4 gap at c113-116, under the overhang (cols 105-118, two tiles of headroom), never makes it: a full run, a jump at every
         distance (frames 4-72), the late coyote jumps included */
      fresh(); let crossed = 0, late = 0, tries = 0;
      for (let t = 4; t <= 72; t += 1) {
        k.place(103 * 16, 176); k.step(2, still);
        k.step(t, run); const p = k.step(1, Object.assign({}, run, { jump: true, tapJump: true }))[0]; tries++;
        let q = p; for (let f = 0; f < 90 && q.y <= 236 && !(f > 4 && q.onGround); f++) q = k.step(1, Object.assign({}, run, { jump: true }))[0];
        if (q.onGround && q.x > 117 * 16) { if (p.y <= 178) crossed++; else late++; }   /* a take-off from the floor, or a coyote jump after he has already dropped past the lip */
      }
      /* with the glass lit, the same crossing is a walk */
      fresh(); k.place(40 * 16, 176); k.step(3, still); for (let i = 0; i < 14; i++) k.auto(30, { run: true });
      const walked = Math.round(k.probe().x), walkOk = walked > 75 * 16 && (k.levelInfo().falls || 0) === 0;
      /* one switch, three bridges (c176 -> c190-194, c199-203, c208-211) */
      fresh(); k.place(176 * 16 + 3, 176); k.step(3, still);
      const three = w().glass[6], ov = k.twistInfo().skins.filter((s) => s[0] === 'cakewall').length;
      return { n, sw, before: before.some(Boolean), solidBefore, timer0, solidOn, t0, t300, stillOn, gone, tileGone, again, onGlass, flickMin: Math.min(...flick), flickFrom: flick.findIndex((v) => v < 60), offAfter, tries, crossed, late, walkOk, walked, threeDecks: three.deck.length, threeSolid: three.solid, threeOn: three.on, cakewalls: ov, falls: k.levelInfo().falls || 0 };
    })()`) as { n: number; sw: number[][]; before: boolean; solidBefore: boolean[]; timer0: number; solidOn: boolean[]; t0: number; t300: number; stillOn: boolean; gone: boolean; tileGone: number; again: number; onGlass: { on: boolean; y: number; timer: number; falls: number }; flickMin: number; flickFrom: number; offAfter: boolean; tries: number; crossed: number; late: number; walkOk: boolean; walked: number; threeDecks: number; threeSolid: boolean[]; threeOn: boolean; cakewalls: number; falls: number };
    console.log('11-5 glass bridges: ' + JSON.stringify(r));
    expect(r.n, 'seven candle switches').toBe(7);
    expect(r.before, 'no glass at the start').toBe(false);
    expect(r.solidBefore.every((s) => !s), 'the deck tiles are empty air until the switch is lit').toBe(true);
    expect(r.timer0, 'lit: six seconds on the clock (360 frames, one already ticked)').toBeGreaterThanOrEqual(359);
    expect(r.solidOn.every(Boolean), 'and the glass is solid').toBe(true);
    expect(r.t300, 'away from it, the clock runs down').toBeLessThan(r.t0 - 250);
    expect(r.stillOn, 'still there after five seconds').toBe(true);
    expect(r.gone, 'gone after six').toBe(true);
    expect(r.tileGone, 'and the tile is air again').toBe(0);
    expect(r.again, 'a new press starts the clock again').toBeGreaterThanOrEqual(359);
    expect(r.onGlass.on, 'on the glass, it waits').toBe(true);
    expect(r.onGlass.y, 'and he stands where he was').toBe(176);
    expect(r.onGlass.falls, 'no fall').toBe(0);
    expect(r.flickFrom, 'it flickers for the last second').toBeGreaterThanOrEqual(0);
    expect(r.offAfter, 'and goes once he is off').toBe(true);
    expect(r.tries, 'tried jump after jump').toBeGreaterThan(20);
    expect(r.crossed, 'a jump from the floor never crosses the gap under the overhang').toBe(0);
    expect(r.late, 'only a frame-perfect coyote jump after dropping past the lip squeezes across (at most 3 of the 8 coyote frames)').toBeLessThanOrEqual(3);
    expect(r.walkOk, 'with the glass lit he just walks across').toBe(true);
    expect(r.threeDecks, 'three bridges for one switch').toBe(3);
    expect(r.threeSolid.every(Boolean) && r.threeOn, 'all lit together').toBe(true);
    expect(r.cakewalls, 'cake walls and overhangs').toBeGreaterThanOrEqual(8);
    expect(errors).toEqual([]);
  });

  test('11-fort twist: A RUN ALONG THE CIRCUIT BOARDS. Data buses carry Kinan along (one runs against him); fire-pixel walls come in pairs that take turns, with a flicker before they shut; shutting never traps him', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      const w = () => k.twistInfo(), fresh = () => { k.playLevel('11-fort'); k.godMode(); k.clearFoes(); };
      fresh();
      const info = w(), belts = info.belts.map((b) => b.slice()), fws = info.fws.map((f) => ({ c: f.c, r0: f.r0, r1: f.r1, per: f.per, open: f.open }));
      /* a bus under his feet carries him: stand still on each for 40 frames */
      const carry = belts.map((b) => { k.place((b[0] + 4) * 16, 176); k.step(4, still); const a = k.probe().x; k.step(40, still); return Math.round(k.probe().x - a); });
      /* the pairs take turns: sample the first pair (c146, c154) for 720 frames: exactly one is shut at every frame */
      fresh(); const xor = []; let warned = 0;
      for (let f = 0; f < 720; f++) { k.step(1, still); const fw = w().fws; xor.push(fw[0].shut !== fw[1].shut); if (fw[0].warn || fw[1].warn) warned++; }
      const everyFrame = xor.every(Boolean);
      const shuts = w().fwShut;
      /* never trapped: stand inside the first wall while it is open; when it shuts he is put out on the nearer side */
      fresh(); let f2 = 0; while (w().fws[0].shut && f2++ < 400) k.step(1, still);
      k.place(146 * 16 + 3, 176); let inside = 0; for (let f = 0; f < 260; f++) { k.step(1, still); const p = k.probe(); if (p.x + 10 > 146 * 16 && p.x < 147 * 16 && w().fws[0].shut) inside++; }
      const push = w().fwPush;
      return { belts, fws: fws.length, carry, everyFrame, warned, shuts, inside, push, falls: k.levelInfo().falls || 0, firepixels: k.twistInfo().skins.filter((s) => s[0] === 'firepixels').length, chips: k.twistInfo().skins.filter((s) => s[0] === 'chip').length };
    })()`) as { belts: number[][]; fws: number; carry: number[]; everyFrame: boolean; warned: number; shuts: number; inside: number; push: number; falls: number; firepixels: number; chips: number };
    console.log('11-fort buses and fire walls: ' + JSON.stringify(r));
    expect(r.belts.length, 'four data buses').toBe(4);
    expect(r.belts.map((b) => b[3]), 'running right, left, right, fast right').toEqual([1.2, -1, 1, 1.5]);
    expect(r.carry[0], 'the first bus carries him right (1.2 px a frame)').toBeGreaterThan(40);
    expect(r.carry[1], 'the bus running left pulls him back').toBeLessThan(-30);
    expect(r.carry[2], 'the third carries him right').toBeGreaterThan(30);
    expect(r.carry[3], 'the fast one carries him fastest').toBeGreaterThan(55);
    expect(r.fws, 'six fire walls in three pairs').toBe(6);
    expect(r.everyFrame, 'in a pair exactly one wall is shut at every moment').toBe(true);
    expect(r.warned, 'a flicker warns before a wall shuts').toBeGreaterThan(60);
    expect(r.shuts, 'the walls shut again and again').toBeGreaterThanOrEqual(2);
    expect(r.inside, 'he is never left inside a shut wall').toBe(0);
    expect(r.push, 'shutting put him out on the nearer side').toBeGreaterThanOrEqual(1);
    expect(r.firepixels, 'the great wall of fire-pixels behind the goal').toBe(1);
    expect(r.chips, 'chips and capacitors').toBeGreaterThanOrEqual(2);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test('11-6 twist: COPY, PASTE, PASTE. One block of five roofs built three times from the same recipe, each paste changing one thing: PASTE 1 has a ghost stepping stone (no floor), PASTE 2 a lower third roof; the enemies are copied too', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      const def = window.KinanLevels.get('11-6'), H = def.heights, S = def.solid || [], SK = def.skins || [], F = def.foes || [];
      const A = 40, B = 92, C = 144, W = 52;
      const slice = (c0) => H.slice(c0, c0 + W);
      const diff = (x, y) => x.map((v, i) => (v === y[i] ? -1 : i)).filter((i) => i >= 0);
      const dAB = diff(slice(A), slice(B)), dAC = diff(slice(A), slice(C));
      const stone = (c0) => S.some((b) => b[0] === c0 + 29 && b[1] === 11 && b[2] === c0 + 29 && b[3] === 11);
      const skinsIn = (kind, c0) => SK.filter((s) => s[0] === kind && s[1] >= c0 && s[1] < c0 + W).length;
      const foes = (c0) => F.filter((f) => f[0] >= c0 && f[0] < c0 + W).map((f) => f[0] - c0 + ':' + f[2]).sort().join(',');
      /* the ghost stone is intangible; the real one holds him */
      const drop = (col) => { k.playLevel('11-6'); k.godMode(); k.clearFoes(); k.place(col * 16 + 3, 150); let maxY = 0; for (let f = 0; f < 50; f++) { const p = k.step(1, still)[0]; maxY = Math.max(maxY, p.y); } return { maxY: Math.round(maxY), tile: k.tile(col, 11) }; };
      const real = drop(A + 29), ghost = drop(B + 29), real2 = drop(C + 29);
      const pits = (c0) => { const o = []; for (let c = c0; c < c0 + W; c++) if (H[c] === null && H[c - 1] !== null) o.push(c - c0); return o; };
      return { dAB, dAC, hAC: dAC.map((i) => [slice(A)[i], slice(C)[i]]), stones: [stone(A), stone(B), stone(C)], ghosts: [skinsIn('ghost', A), skinsIn('ghost', B), skinsIn('ghost', C)], bugs: [skinsIn('bug', A), skinsIn('bug', B), skinsIn('bug', C)],
        copyStamps: SK.filter((s) => s[0] === 'stamp:COPY').length, pasteStamps: SK.filter((s) => s[0] === 'stamp:PASTE').length, foesA: foes(A), foesB: foes(B), foesC: foes(C), real, ghost, real2, pitsA: pits(A), pitsB: pits(B), pitsC: pits(C),
        clones: F.filter((f) => f[2] === 'robot' && F.filter((g) => g[2] === 'robot' && Math.abs(g[0] - f[0]) <= 2).length >= 3).length };
    })()`) as { dAB: number[]; dAC: number[]; hAC: number[][]; stones: boolean[]; ghosts: number[]; bugs: number[]; copyStamps: number; pasteStamps: number; foesA: string; foesB: string; foesC: string; real: { maxY: number; tile: number }; ghost: { maxY: number; tile: number }; real2: { maxY: number; tile: number }; pitsA: number[]; pitsB: number[]; pitsC: number[]; clones: number };
    console.log('11-6 copy and paste: ' + JSON.stringify(r));
    expect(r.dAB, 'PASTE 1 has exactly the same ground as COPY').toEqual([]);
    expect(r.dAC, 'PASTE 2 differs only on the third roof (eight columns)').toEqual([20, 21, 22, 23, 24, 25, 26, 27]);
    expect(r.hAC.every(([a, c]) => a === 176 && c === 192), 'that roof is one tile lower').toBe(true);
    expect(r.stones, 'the stepping stone is real in COPY, missing in PASTE 1, real in PASTE 2').toEqual([true, false, true]);
    expect(r.ghosts, 'a ghost only in PASTE 1').toEqual([0, 1, 0]);
    expect(r.bugs, 'BUG? tags on the two pastes').toEqual([0, 1, 1]);
    expect(r.copyStamps, 'one COPY stamp').toBe(1);
    expect(r.pasteStamps, 'two PASTE stamps').toBe(2);
    expect(r.foesB, 'the enemies are copied: the same types in the same places on the second block').toBe(r.foesA);
    expect(r.foesC, 'and on the third (the walker on the lower roof stands one row lower)').toBe(r.foesA);
    expect(r.pitsA, 'four 3-wide gaps per block').toEqual([8, 17, 28, 37]);
    expect([r.pitsB.join(), r.pitsC.join()]).toEqual([r.pitsA.join(), r.pitsA.join()]);
    expect(r.real.maxY, 'the real stone holds him (feet on row 11)').toBeLessThanOrEqual(160);
    expect(r.real2.maxY, 'the real stone of PASTE 2 holds him').toBeLessThanOrEqual(160);
    expect(r.ghost.maxY, 'the ghost stone has no floor: he falls through').toBeGreaterThan(200);
    expect(r.ghost.tile, 'nothing is there').toBe(0);
    expect(r.clones, 'a row of identical robots in the street (and the last street)').toBeGreaterThanOrEqual(6);
    expect(errors).toEqual([]);
  });

  test("11-7 twist: TEN ROOMS, ONE FAMILIAR TRICK EACH. Home's spring and bricks, the school desks, the oilfield's bobbing beam, the mall rink's ice, the Stampede's low ropes, Drumheller's light gravity, Vancouver's slime, Toronto's walkways, Montreal's escalators, the little boat at Niagara; and Shad's console glows in the middle hall", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      const def = window.KinanLevels.get('11-7'), SK = def.skins, H = def.heights;
      const w = () => k.twistInfo(), fresh = () => { k.playLevel('11-7'); k.godMode(); k.clearFoes(); };
      fresh();
      const info = w();
      const stamps = SK.filter((s) => s[0].indexOf('stamp:') === 0).sort((a, b) => a[1] - b[1]).map((s) => s[0].slice(6));
      const inRoom = (c, lo, hi) => c >= lo && c <= hi;
      const tricks = {
        spring: def.tiles.spring.every((t) => inRoom(t[0], 20, 41)) && def.tiles.spring.length >= 1,
        desks: def.tiles.shelf.filter((t) => inRoom(t[0], 42, 63)).length >= 8,
        beam: def.planks.length === 1 && inRoom(def.planks[0][0], 64, 85), ice: def.ice.length === 1 && inRoom(def.ice[0][0], 86, 107) && inRoom(def.ice[0][1], 86, 107),
        ropes: def.signs.length === 2 && def.signs.every((s) => inRoom(s[0], 108, 129) && s[1] === 'jump'), light: def.lowGrav.length === 1 && inRoom(def.lowGrav[0][0], 130, 151),
        slime: def.slime.length === 1 && inRoom(def.slime[0][0], 166, 187), walkways: def.belts.length === 2 && def.belts.every((b) => inRoom(b[0], 188, 209)), escalators: def.escalators.length === 2 && def.escalators.every((e) => inRoom(e[0], 210, 231)),
        boat: def.boats.length === 1 && inRoom(def.boats[0][0], 232, 253)
      };
      /* what each does, measured */
      const jump = (col) => { k.place(col * 16 + 3, 176); k.step(5, still); let minY = 999; k.step(1, { jump: true, tapJump: true }); for (let f = 0; f < 70; f++) { const p = k.step(1, { jump: true })[0]; minY = Math.min(minY, p.y); } return Math.round(176 - minY); };
      const lowRise = jump(135), plainRise = jump(120);
      const decay = (col, dir, hold, wait) => { k.place(col * 16 + 3, 176); k.step(4, still); const h = { left: dir < 0, right: dir > 0, jump: false, fire: false }; const a = k.step(hold, h); const v0 = Math.abs(a[a.length - 1].vx); const b = k.step(wait, still); return Math.round(Math.abs(b[b.length - 1].vx) / Math.max(0.01, v0) * 100) / 100; };
      const iceRatio = decay(94, -1, 10, 15), plainRatio = decay(160, 1, 10, 15), slimeRatio = decay(174, -1, 10, 15);
      const stand = (col, n) => { k.place(col * 16 + 3, 176 - (H[col] === 192 ? 0 : 192 - H[col])); k.step(6, still); const a = k.probe(); k.step(n, still); const b = k.probe(); return { dx: Math.round(b.x - a.x), dy: Math.round(b.y - a.y) }; };
      const beltA = stand(195, 40), beltB = stand(202, 40), escUp = stand(216, 30);
      fresh(); const ys = []; for (let f = 0; f < 260; f++) { k.step(1, still); ys.push(w().movers.find((m) => m.kind === 'plank').y); }
      const bobs = Math.round((Math.max(...ys) - Math.min(...ys)) * 10) / 10;
      fresh(); const xs = []; let riding = 0; for (let f = 0; f < 500; f++) { k.step(1, still); const m = w().movers.find((q) => q.kind === 'boat'); xs.push(m.x); }
      const boatSpan = Math.round(Math.max(...xs) - Math.min(...xs));
      const bm = w().movers.find((q) => q.kind === 'boat'); k.place(bm.x + 16, 176); k.step(5, still); for (let f = 0; f < 60; f++) { k.step(1, still); if (w().movers.find((q) => q.kind === 'boat').riding) riding++; }
      const memory = def.talk.filter((t) => t[1] === 'KINAN' && /console Shad built me/.test(t[2])), consoleSkin = SK.filter((s) => s[0] === 'console');
      return { stamps, tricks, lowRise, plainRise, iceRatio, plainRatio, slimeRatio, beltA, beltB, escUp, bobs, boatSpan, riding, memory: memory.map((t) => [t[0], t[2]]), consoleSkin: consoleSkin.map((s) => s.slice(1)), n: def.cols, falls: k.levelInfo().falls || 0 };
    })()`) as { stamps: string[]; tricks: Record<string, boolean>; lowRise: number; plainRise: number; iceRatio: number; plainRatio: number; slimeRatio: number; beltA: { dx: number; dy: number }; beltB: { dx: number; dy: number }; escUp: { dx: number; dy: number }; bobs: number; boatSpan: number; riding: number; memory: [number, string][]; consoleSkin: number[][]; n: number; falls: number };
    console.log('11-7 rooms: ' + JSON.stringify(r));
    expect(r.stamps, 'the rooms in order, each with its rubber stamp').toEqual(['THE VAULT', 'HOME', 'SCHOOL', 'OILFIELD', 'EDMONTON', 'STAMPEDE', 'DRUMHELLER', 'VANCOUVER', 'TORONTO', 'MONTREAL', 'NIAGARA']);
    for (const [name, ok] of Object.entries(r.tricks)) expect(ok, `${name} is in its own room`).toBe(true);
    expect(r.lowRise, 'light gravity (Drumheller): a jump rises much higher').toBeGreaterThan(r.plainRise * 1.4);
    expect(r.iceRatio, 'the rink: Kinan slides on after letting go').toBeGreaterThan(0.5);
    expect(r.slimeRatio, 'slug slime: slippery too').toBeGreaterThan(0.2);
    expect(r.plainRatio, 'ordinary floor stops quickly').toBeLessThan(0.2);
    expect(r.beltA.dx, 'Toronto: the walkway carries him right').toBeGreaterThan(25);
    expect(r.beltB.dx, 'and the next one carries him left').toBeLessThan(-18);
    expect(r.escUp.dx, 'Montreal: the escalator carries him along...').toBeGreaterThan(15);
    expect(r.escUp.dy, '...and up').toBeLessThan(-8);
    expect(r.bobs, 'the oilfield beam bobs up and down').toBeGreaterThanOrEqual(8);
    expect(r.boatSpan, 'the little boat drifts back and forth').toBeGreaterThanOrEqual(20);
    expect(r.riding, 'and carries him').toBeGreaterThanOrEqual(40);
    expect(r.memory, "the memory: Kinan's line, word for word").toEqual([[266, 'Wait... this is the console Shad built me. It was in the box the whole time.']]);
    expect(r.consoleSkin, "Shad's handmade console on its stand in the middle of the vault").toEqual([[274, 10, 275, 11]]);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test('11-8 twist: PORTALS. A ring sends Kinan out of its partner (matching colours); the IN ring of each machine wall is just before it and the OUT ring just behind; an OUT ring sends nobody anywhere; the yellow ring works both ways; the walls cannot be jumped; the level stacks every World 11 hazard', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false }, def = window.KinanLevels.get('11-8');
      const w = () => k.twistInfo().w11, fresh = () => { k.playLevel('11-8'); k.godMode(); k.clearFoes(); };
      fresh();
      const P = w().portals, colors = P.map((p) => p.color), twoWay = P.filter((p) => p.two).length;
      /* the first wall: walk into the orange IN ring (c41) and come out of the OUT ring (c49) */
      const a = P.find((p) => p.color === '#ff8a3d'); k.place(a.a[0] * 16 - 20, 176); k.step(2, still);
      const before = k.probe().x; k.step(40, { right: true, fire: true });
      const after = k.probe(), tele = w().tele;
      k.step(70, { right: true, fire: true });
      const keepOn = { tele: w().tele, x: Math.round(k.probe().x) };
      /* an OUT ring sends nobody: walk into it from the right */
      fresh(); k.place(a.b[0] * 16 + 56, 176); k.step(2, still); k.step(60, { left: true, fire: true });
      const outRing = { tele: w().tele, x: Math.round(k.probe().x) };
      /* the wall itself: from the floor in front of it, no run and no jump gets over (c44-46, eight tiles) */
      fresh(); let best = 0;
      for (let t = 0; t < 12; t++) { k.place((a.a[0] + 2) * 16 + t * 2, 176); k.step(2, still); for (let f = 0; f < 50; f++) { k.step(1, { right: true, fire: true, jump: f > 4 && f < 40, tapJump: f === 5 }); best = Math.max(best, k.probe().x); if (w().tele) break; } if (w().tele) break; }
      const overWall = { crossed: best > 47 * 16, tele: w().tele };
      /* the yellow ring (the sealed vault) works both ways: in at the plinth, out in the vault, back in the vault, out at the plinth */
      fresh(); const y = P.find((p) => p.two);
      k.place(y.a[0] * 16 + 3, 176); k.step(3, still); const inVault = { x: Math.round(k.probe().x), y: Math.round(k.probe().y), tele: w().tele };
      k.step(30, { right: true }); k.step(30, { left: true });
      /* the blue ring on the perch: the OUT ring is a free ride past the gears */
      fresh(); const blue = P.find((p) => p.color === '#6fa0ff');
      k.place(blue.a[0] * 16 + 3, blue.a[1] * 16 + 16 - 16); k.step(3, still); const perch = { x: Math.round(k.probe().x), tele: w().tele, onGround: k.probe().onGround };
      /* the screen follows him (the camera jumps along) */
      const camX = k.probe().camX, wantX = k.probe().x - 432 * 0.42;
      fresh();
      const L = k.twistInfo();
      return { n: P.length, colors, uniqueColors: new Set(colors).size, twoWay, before: Math.round(before), after: { x: Math.round(after.x), y: Math.round(after.y), onGround: after.onGround }, tele, keepOn, outRing, overWall, inVault, perch, camGap: Math.round(Math.abs(camX - wantX)),
        lasers: def.lasers.length, fire: def.firewalls.length, belts: def.belts.length, planks: def.planks.length, walls: def.solid.filter((b) => b[1] === 4 && b[3] === 11 && b[2] - b[0] === 2).length, falls: k.levelInfo().falls || 0, A: P.map((p) => p.a), B: P.map((p) => p.b) };
    })()`) as { n: number; colors: string[]; uniqueColors: number; twoWay: number; before: number; after: { x: number; y: number; onGround: boolean }; tele: number; keepOn: { tele: number; x: number }; outRing: { tele: number; x: number }; overWall: { crossed: boolean; tele: number }; inVault: { x: number; y: number; tele: number }; perch: { x: number; tele: number; onGround: boolean }; camGap: number; lasers: number; fire: number; belts: number; planks: number; walls: number; falls: number; A: number[][]; B: number[][] };
    console.log('11-8 portals: ' + JSON.stringify(r));
    expect(r.n, 'six pairs: four machine walls, the sealed vault and the perch').toBe(6);
    expect(r.uniqueColors, 'every pair has its own colour').toBe(6);
    expect(r.twoWay, 'one both-ways ring (the vault)').toBe(1);
    expect(r.tele, 'walking into the IN ring: one trip').toBe(1);
    expect(r.after.x, 'and he stands at the OUT ring behind the wall (c49)').toBeGreaterThan(48 * 16);
    expect(r.after.onGround, 'on flat floor').toBe(true);
    expect(r.keepOn.tele, 'standing in the OUT ring never bounces him back').toBe(1);
    expect(r.keepOn.x, 'he walks on').toBeGreaterThan(52 * 16);
    expect(r.outRing.tele, 'an OUT ring sends nobody anywhere').toBe(0);
    expect(r.outRing.x, 'walking left from behind the wall he reaches the wall itself').toBeGreaterThan(46 * 16);
    expect(r.overWall.crossed, 'no jump gets over an eight-tile machine wall').toBe(false);
    expect(r.inVault.tele, 'the yellow ring takes him into the vault').toBeGreaterThanOrEqual(1);
    expect(r.inVault.y, 'standing in the vault (feet on row 7)').toBe(96);
    expect(r.perch.tele, 'the blue ring on the perch').toBe(1);
    expect(r.perch.x, 'comes out past the gears (c167)').toBeGreaterThan(166 * 16);
    expect(r.perch.onGround).toBe(true);
    expect(r.camGap, 'the picture follows him through').toBeLessThan(60);
    expect(r.lasers, 'twelve laser gates').toBe(12);
    expect(r.fire, 'six fire walls in three pairs').toBe(6);
    expect(r.belts, 'one bus against him').toBe(1);
    expect(r.planks, 'one bobbing beam').toBe(1);
    expect(r.walls, 'four machine walls').toBe(4);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test("11-secret: SHAD'S DEV ROOM. A calm room (no foes, no gaps, no lasers, nothing that hurts), candles, pencil sketches drawn by the game, and Shad's thank-you note on the desk, word for word", async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, def = window.KinanLevels.get('11-secret');
      const draws = []; k.playLevel('11-secret'); const info = k.twistInfo();
      const note = def.talk.filter((t) => t[0] === 118);
      return { kind: def.kind, foes: (def.foes || []).length, gaps: def.heights.filter((h) => h === null).length, flat: def.heights.every((h) => h === 192),
        twists: ['lasers', 'vents', 'firewalls', 'glass', 'portals', 'flip', 'studs', 'belts', 'wind', 'ice', 'slime', 'lowGrav'].filter((key) => key in def),
        candles: def.candles.length, noteTexts: note.map((t) => t[2]), noteWho: note.map((t) => t[1]), noteMax: Math.max(...note.map((t) => t[2].length)),
        desk: def.skins.filter((s) => s[0] === 'desk').map((s) => s.slice(1)), look: k.levelInfo().look, secrets: (def.secrets || []).length, hasTwist: !!info };
    })()`) as { kind: string; foes: number; gaps: number; flat: boolean; twists: string[]; candles: number; noteTexts: string[]; noteWho: string[]; noteMax: number; desk: number[][]; look: { theme: number; bg: string; place: string }; secrets: number; hasTwist: boolean };
    console.log("11-secret Shad's Dev Room: " + JSON.stringify(r));
    const NOTE = "Hey bud, you found my secret room! This is where I built your game: every world, every boss, and every one of Dad's jokes (sorry). I made it for your 11th birthday because you're the best little brother there is. Thanks for playing, for laughing, and for never giving up, even on the hard levels. Keep kicking, keep building, keep being you. Happy birthday, Kinan. Love, Big Bro Shad.";
    expect(r.kind).toBe('secret');
    expect(r.foes, 'no foes: nothing can hurt him').toBe(0);
    expect(r.gaps, 'no gaps').toBe(0);
    expect(r.flat, 'one flat carpet').toBe(true);
    expect(r.twists, 'no hazard keys at all').toEqual([]);
    expect(r.candles, 'candles').toBeGreaterThanOrEqual(60);
    expect(r.noteTexts.join(' '), "the note, word for word (four bubbles at the desk)").toBe(NOTE);
    expect(r.noteTexts.length, 'a conversation of four (the rule is five at most)').toBe(4);
    expect(r.noteMax, 'each bubble fits the 140 letters').toBeLessThanOrEqual(140);
    expect(r.noteWho.every((w) => w === 'SHAD'), "in Shad's own name").toBe(true);
    expect(r.desk, 'the desk the note lies on, with the note drawn on it').toEqual([[124, 10, 127, 11]]);
    expect(r.look.bg, "the dev room's look").toBe('devroom');
    expect(errors).toEqual([]);
  });
});

/* ---- World 11 on the map: 11-7's secret exit (a corrupted save) opens 11-secret ---- */
async function mapNow(page: Page): Promise<MapState> { return page.evaluate(() => (window as unknown as Win).__k11.mapState()); }
async function settle(page: Page, timeout = 60_000): Promise<MapState> {
  await page.waitForFunction(() => { const k = (window as unknown as Win).__k11 as Dev & { cut: () => { on: boolean } }; const s = k.mapState(); return s.mounted && !s.walking && !s.crossing && !s.busy && !s.banner && !k.cut().on; }, null, { timeout });
  return mapNow(page);
}
/* a save standing on a World 11 stop, every level before it beaten. World 11 is released in this build (OW_RELEASED 11,
   v54): the map is open without a test's owRelease(11), so these tests check the build's own release */
async function seedWorld11(page: Page, at: string): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
  const missing = await page.evaluate(({ key, at }) => {
    const w = window as unknown as Win, K = w.KinanLevels, me = K.get(at), beaten: Record<string, number> = {}, gone: string[] = [];
    const ids = K.list();
    for (const id of ids) { const d = K.get(id); if (!/secret/.test(id) && (d.world < me.world || (d.world === me.world && d.slot < me.slot))) beaten[id] = 1; }
    /* every level of Worlds 1-10 beaten (World 10's files are in this copy since the merge: none may be missing) */
    for (let wn = 1; wn <= 10; wn++) for (const s of ['1', '2', '3', '4', '5', '6', '7', '8', 'fort', 'castle']) { if (!K.get(`${wn}-${s}`)) gone.push(`${wn}-${s}`); beaten[`${wn}-${s}`] = 1; }
    localStorage.setItem(key, JSON.stringify({ unlocked: 1, beaten: [], introSeen: true, beltSeen: 8, levelsBeaten: beaten, unlockedLevels: ids.filter((id) => /secret/.test(id) && K.get(id).world < me.world), escapes: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1 }, wmap: { w: 11, at: me.slot - 1 } }));
    return gone;
  }, { key: CURRENT, at });
  expect(missing, 'every World 1-10 level file is in this copy').toEqual([]);
  await page.reload();
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
}

test.describe('World 11 · on the map', () => {
  test("11-7's secret exit (the corrupted save): bump the glinting block, walk through the door -> SECRET LEVEL FOUND! and the 11-secret stop opens", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await seedWorld11(page, '11-7');
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    const secretAt = s0.stops.findIndex((q) => q.kind === 'secret');
    expect(s0.stops[s0.at].id).toBe('11-7');
    expect(s0.stops[secretAt]).toMatchObject({ id: '11-secret', state: 'locked' });
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe('11-7');
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11, def = (window as unknown as Win).KinanLevels.get('11-7');
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
    expect(r.to).toBe('11-secret');
    expect(r.closed!.open).toBe(false);
    expect(r.opened).toBe(true);
    expect(r.toast).toContain('SECRET EXIT FOUND');
    expect(r.unlocked).toContain('11-secret');
    expect(r.returned).toBe(true);
    await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy; });
    const s1 = await mapNow(page);
    expect(s1.notice).toBe('SECRET LEVEL FOUND!');
    expect(s1.stops[secretAt]).toMatchObject({ id: '11-secret', kind: 'secret', state: 'open' });
    expect(s1.celebrate).toBe(secretAt);
    expect(errors).toEqual([]);
  });

  test('the World 11 trail runs 11-1 .. 11-5, the fort THE CORE GUARDIAN, 11-6, 11-7, the secret, 11-8 and the castle, and every built stop launches its level file', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await seedWorld11(page, '11-1');
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    const ids = s0.stops.map((q) => q.id), kinds = s0.stops.map((q) => q.kind);
    expect(ids, 'the trail, in order (the castle stop came with the second run)').toEqual(['11-1', '11-2', '11-3', '11-4', '11-5', '11-fort', '11-6', '11-7', '11-secret', '11-8', '11-castle']);
    expect(kinds).toEqual(['level', 'level', 'level', 'level', 'level', 'fort', 'level', 'level', 'secret', 'level', 'boss']);
    expect(s0.stops.every((q) => q.built), 'all eleven stops are built').toBe(true);
    const name = await page.evaluate(() => {
      const w = window as unknown as { KINAN?: { W?: { n: number; stops: { name: string }[] }[] } };
      const w11 = w.KINAN && w.KINAN.W && w.KINAN.W.find((q) => q.n === 11);
      return w11 ? w11.stops.map((q) => q.name) : [];
    });
    if (name.length) expect(name[5], 'the fort is renamed (World 9 owns "Annie\'s Firewall")').toBe('FORT  THE CORE GUARDIAN');
    expect(errors).toEqual([]);
  });
});

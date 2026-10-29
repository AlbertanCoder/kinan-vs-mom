import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* World 7 — Vancouver, the level files (2026-10-28; the bosses and 7-castle came in the second run, their fights are
   in w7-world.spec.ts). For every World 7 level file:
   - it is registered as World 7 on the right map stop and passes the gate (no problems, no lint),
   - it reaches LEVEL CLEAR with the dev bot (auto(30, {run: true}); for a level auto() can't finish, the same best-first
     search over real-input moves that w6-world.spec.ts uses),
   - every secret is reachable: from a spot on the main path just before it, a best-first search over real-input moves
     (god mode, foes cleared, a move that drops into a pit is cut off) finds it (SECRET n/3 marked),
   - 7-fort's secret exit (on the gondola) opens 7-secret on the World 7 map,
   - World 7's map stops are these level files,
   - no page errors anywhere. */

const BASE = 'http://127.0.0.1:4174/index.html';
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';
const W7 = ['1', '2', '3', '4', '5', 'fort', 'secret', '6', '7', '8', 'castle'].map((s) => `7-${s}`);
/* the map stop each file stands on (map/worlds/w07.js: the secret comes right after the fort) */
const SLOT: Record<string, number> = { '7-1': 1, '7-2': 2, '7-3': 3, '7-4': 4, '7-5': 5, '7-fort': 6, '7-secret': 7, '7-6': 8, '7-7': 9, '7-8': 10, '7-castle': 11 };
/* where each secret's route starts: a flat column of the main path just before it (in the level's own columns) */
const SECRET_FROM: Record<string, number[]> = {
  '7-1': [62, 121, 257],
  '7-2': [192, 88, 257],
  '7-3': [147, 116, 260],
  '7-4': [53, 72, 181],
  '7-5': [123, 225, 261],
  '7-fort': [103],
  '7-6': [163, 154, 265],
  '7-7': [126, 205, 248],
  '7-8': [107, 145, 196]
};
/* the high spots with a pit after them: a full-run jump off each must come down on floor (columns in the level's own
   numbering, areas joined: the fort's gondola area starts at column 81, its summit at 162). from..to is the top of the
   spot, top its row, pits the first column of each pit ahead that a jump from there could come down in. */
const HIGH: { id: string; what: string; from: number; to: number; top: number; pits: number[] }[] = [
  { id: '7-fort', what: "the gondola's top-station deck", from: 153, to: 161, top: 3, pits: [174] },   /* 2026-10-28: the first ski run moved to local c12-16 (174-178) */
  { id: '7-7', what: 'the last exhibit', from: 250, to: 254, top: 4, pits: [273] },
  { id: '7-7', what: 'the hat ledge under the dome', from: 257, to: 258, top: 1, pits: [273] },
  { id: '7-8', what: 'the express car', from: 200, to: 207, top: 6, pits: [224] }   /* 2026-10-28: the gangway ledge (c208-212, row 7) now covers the c210-212 coupling: the next pit ahead is c224 */
];

type Secret = { kind: string; col: number; row: number; prize: string; exit?: string };
type Area = { cols: number; heights: (number | null)[]; secrets?: Secret[] };
type LevelDef = Area & { id: string; world: number; slot: number; kind?: string; theme?: number; areas?: Area[] };
type MapState = { mounted: boolean; busy: boolean; world: number | null; at: number; walking: boolean; crossing: boolean; banner: string | null; notice: string | null; celebrate?: number | null; stops: { id: string | null; kind: string; built: boolean; state: string | null }[] };
type Dev = {
  playLevel: (id: string) => unknown;
  levelInfo: () => { id: string | null; cleared: boolean; returned: boolean; toast: string; candles: number; secretsFound: boolean[]; secretExit: { tx: number; ty: number; to: string; open: boolean } | null };
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

/* reach LEVEL CLEAR: auto(30, {run: true}) first; for a level auto() can't finish, a best-first search over short
   real-input moves from spots Kinan has really stood on (w6-world.spec.ts ROUTE). God mode, foes cleared; a move
   that drops toward a pit is cut off before it kills. */
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
  if (k.levelInfo().cleared) return { how: 'auto', n, cleared: true, falls: k.levelInfo().falls, fellNear };
  const autoFar = far, autoAt = [Math.floor(k.probe().x / 16), Math.floor(k.probe().y / 16)];
  far = 0;
  k.playLevel(id); k.godMode(); k.clearFoes();
  k.step(20, { left: false, right: false });
  const MOVES = [];
  for (const d of [1, -1]) {
    MOVES.push({ d, run: 0, tap: false, hold: 0, len: 30 });
    MOVES.push({ d, run: 0, tap: true, hold: 4, len: 90 });
    MOVES.push({ d, run: 0, tap: true, hold: 30, len: 110 });
    MOVES.push({ d, run: 18, tap: true, hold: 30, len: 120, fire: true });
  }
  MOVES.push({ d: 0, run: 0, tap: true, hold: 30, len: 90 });
  const key = (p) => Math.round(p.x / 8) + ':' + Math.round(p.y / 8);
  const p0 = k.probe(), open = [{ x: p0.x, y: p0.y }], seen = new Set([key(p0)]);
  let tries = 0;
  const still = { left: false, right: false, jump: false, fire: false };
  while (open.length && tries < 6000) {
    open.sort((p, q) => q.x - p.x);
    const s = open.shift();
    for (const m of MOVES) {
      tries++;
      k.place(s.x, s.y); k.step(1, still);
      let fell = false, last = null, air = false;
      const hold = { left: m.d < 0, right: m.d > 0, fire: !!m.fire, jump: false };
      for (let f = 0; f < m.run && !fell; f++) { last = k.step(1, hold)[0]; fell = last.y > 236; }
      for (let g = 0; g < m.len && !fell; g++) {
        last = k.step(1, Object.assign({}, hold, { jump: m.tap && g < m.hold, tapJump: m.tap && g === 0 }))[0];
        if (k.levelInfo().cleared) return { how: 'search', n, tries, cleared: true, autoFar, autoAt };
        fell = last.y > 236;
        if (!last.onGround) air = true;
        if (m.tap && air && last.onGround) break;
      }
      for (let g = 0; g < 8 && !fell; g++) { last = k.step(1, still)[0]; fell = last.y > 236; }
      if (k.levelInfo().cleared) return { how: 'search', n, tries, cleared: true, autoFar, autoAt };
      if (fell || !last || !last.onGround || seen.has(key(last))) continue;
      seen.add(key(last)); open.push({ x: last.x, y: last.y }); far = Math.max(far, Math.floor(last.x / 16));
    }
  }
  return { how: 'none', n, tries, cleared: false, autoFar, autoAt, searchFar: far };
}`;

/* reach secret number k of a level: stand Kinan on the main path at column 'from', then a best-first search over
   real-input moves (walk, run, short and full jumps, both ways), always trying first from the spot nearest the
   secret, until the level marks that secret found (its gift block bumped or its prize picked up). God mode, foes
   cleared; a move that falls into a pit is dropped; a move that walks through the goal restarts the level. */
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

test.describe('World 7 · the level files', () => {
  test('all 11 World 7 level files are registered as World 7 on their map stops and pass the gate', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const reg = await page.evaluate(() => {
      const w = window as unknown as Win;
      const ids = w.KinanLevels.list().filter((id) => id.startsWith('7-'));
      const defs = ids.map((id) => { const d = w.KinanLevels.get(id); return { id, world: d.world, slot: d.slot, theme: d.theme, pet: 'pet' in d || (d.areas || []).some((a) => 'pet' in a) }; });
      const lv = w.__k11.levels().levels.filter((x) => x.id.startsWith('7-'));
      return { ids, defs, bad: lv.filter((x) => x.problems.length || x.lint.length) };
    });
    expect([...reg.ids].sort()).toEqual([...W7].sort());
    expect(reg.bad).toEqual([]);
    for (const d of reg.defs) {
      expect(d.world, d.id).toBe(7);
      expect(d.slot, d.id).toBe(SLOT[d.id]);
      expect(d.theme, `${d.id} borrows a Vancouver look (themes 41-50)`).toBeGreaterThanOrEqual(41);
      expect(d.theme, `${d.id} borrows a Vancouver look (themes 41-50)`).toBeLessThanOrEqual(50);
      expect(d.pet, `${d.id}: no pet crate (all six are found by World 5)`).toBe(false);
    }
    expect(errors).toEqual([]);
  });

  test('no World 7 foe starts inside a block or waits at a lip, no block hangs over a take-off, and no candle is lost inside a block', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const out = await page.evaluate((ids) => {
      const w = window as unknown as Win, k = w.__k11;
      return ids.filter((id) => !!w.KinanLevels.get(id)).map((id) => {
        const d = w.KinanLevels.get(id);
        const list = (d.areas || [d]) as (Area & { foes?: [number, number, string][]; candles?: [number, number][] })[];
        k.playLevel(id);
        const FLYERS = ['plane', 'camera', 'brush', 'ghost', 'sparkler', 'crow', 'mosquito', 'magpie', 'goose', 'seagull', 'umbrellabat', 'raincloud'];
        const badFoes: number[][] = [], atLip: (number | string)[][] = [], overTakeoff: number[][] = [];
        let base = 0, authored = 0;
        for (const a of list) {
          const H = a.heights, tiles = (a as unknown as { tiles?: { gift?: number[][]; brick?: number[][] } }).tiles || {};
          for (const f of a.foes || []) {
            const t = k.tile(base + f[0], f[1]);
            if (t !== 0) badFoes.push([base + f[0], f[1], t]);
            /* a walker or hopper standing on the ground row next to a pit (one tile either side) waits at a lip */
            const onGround = H[f[0]] != null && f[1] === (H[f[0]] as number) / 16 - 1;
            if (!FLYERS.includes(f[2]) && onGround && (H[f[0] - 1] === null || H[f[0] + 1] === null)) atLip.push([base + f[0], f[1], f[2]]);
          }
          /* a block right over the last ground column before a pit, low enough to bump on a jump from there */
          for (const g of [...(tiles.gift || []), ...(tiles.brick || [])]) {
            const c = g[0], h = H[c];
            if (h != null && H[c + 1] === null && g[1] >= h / 16 - 5 && g[1] < h / 16) overTakeoff.push([base + c, g[1]]);
          }
          authored += (a.candles || []).length;
          base += a.cols;
        }
        return { id, badFoes, atLip, overTakeoff, authored, live: k.levelInfo().candles };
      });
    }, W7);
    for (const o of out) {
      expect(o.badFoes, `${o.id}: foes inside blocks [col, row, tile]`).toEqual([]);
      expect(o.atLip, `${o.id}: walkers or hoppers waiting at a lip [col, row, type]`).toEqual([]);
      expect(o.overTakeoff, `${o.id}: blocks over a gap's take-off column [col, row]`).toEqual([]);
      expect(o.live, `${o.id}: every authored candle is in the level`).toBe(o.authored);
    }
    expect(errors).toEqual([]);
  });

  test("a full-run jump off the high spots comes down on floor: 7-fort's top-station deck, 7-7's last exhibit and hat ledge, 7-8's express car", async ({ page }) => {
    test.setTimeout(120_000);
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
        /* how many frames of RUN carry Kinan off the far end */
        start();
        let leave = 0;
        while (leave < 120 && k.step(1, go)[0].onGround) leave++;
        /* jump on every frame from 10 before he leaves to 7 after (coyote time is 8 frames), RUN held, JUMP held 30 frames */
        const res: { d: number; v0: number; landed: boolean; x: number; room: number }[] = [];
        for (let d = -10; d <= 7; d++) {
          start();
          if (leave + d > 0) k.step(leave + d, go);
          const v0 = k.probe().vx;
          let p = k.step(1, Object.assign({}, go, { jump: true, tapJump: true }))[0];
          if (p.vy > -4) continue;   /* no jump came out (past the coyote time): not a jump off the spot */
          let air = !p.onGround;
          for (let f = 0; f < 240 && p.y <= 236; f++) {
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

  for (const id of W7) {
    test(`${id} reaches LEVEL CLEAR with the dev bot`, async ({ page }) => {
      test.setTimeout(240_000);
      const errors = watchErrors(page);
      await boot(page);
      const r = await page.evaluate(({ id, route }) => (0, eval)(route)(id), { id, route: ROUTE }) as { how: string; n: number; tries?: number; cleared: boolean; falls?: number; fellNear?: number[]; autoFar?: number; autoAt?: number[]; searchFar?: number };
      console.log(`${id} LEVEL CLEAR: ${r.cleared ? 'CLEAR' : 'NOT CLEAR'} ${r.how}${r.how === 'search' ? ' (' + r.tries + ' moves)' : ' n=' + r.n}` +
        (r.falls != null ? ` pit falls ${r.falls}` + (r.falls ? ' (a chunk starting near column ' + (r.fellNear || []).join(', ') + ')' : '') : '') +
        (r.how === 'auto' ? '' : ` (auto got to column ${r.autoFar}, stopped at ${JSON.stringify(r.autoAt)}${r.cleared ? '' : '; the search got to column ' + r.searchFar})`));
      expect(r.cleared, `${id} (${r.how})`).toBe(true);
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

/* ---- the twists (2026-10-28): each World 7 level's own trick exists and does its thing (scripts run in the page) ---- */
test.describe('World 7 · the twists', () => {
  test('the skins (looks only): green steel towers on 7-4, cedar trunks on 7-3, train cars on 7-8, the Chief\'s granite on 7-secret; every skinned cell is still the solid block it was', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const out = await page.evaluate(`(() => {
      const k = window.__k11;
      return ['7-4', '7-3', '7-8', '7-secret'].map((id) => {
        k.playLevel(id);
        const t = k.twistInfo(), notSolid = [];
        for (const [kind, c0, r0, c1, r1] of t.skins) for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) if (k.tile(c, r) !== 1) notSolid.push([kind, c, r, k.tile(c, r)]);
        return { id, kinds: t.skins.map((s) => s[0]), trainCars: t.trainCars, notSolid };
      });
    })()`) as { id: string; kinds: string[]; trainCars: number; notSolid: unknown[] }[];
    console.log('skins: ' + JSON.stringify(out));
    expect(out.map((o) => [o.id, o.kinds])).toEqual([['7-4', ['steel', 'steel']], ['7-3', ['cedar', 'cedar', 'cedar', 'cedar']], ['7-8', ['car']], ['7-secret', ['granite', 'granite', 'granite', 'granite']]]);
    expect(out[2].trainCars, '7-8: train-car columns under the roofs').toBeGreaterThan(250);
    for (const o of out) expect(o.notSolid, `${o.id}: a skin only paints solid blocks`).toEqual([]);
    expect(errors).toEqual([]);
  });
  test('7-4 twist: THE WIND. Every gust is warned for 1 s, then pushes Kinan back on the deck, and never off a ledge', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11;
      k.playLevel('7-4'); k.godMode(); k.clearFoes();
      const off = k.twistInfo();
      /* a flat spot of the deck (the bridge area starts at column 81; local 9 is open deck, the deck top is row 8) */
      const spot = (c) => { k.place(c * 16 + 3, 112); k.step(2, {}); };
      spot(90);
      let g = 0;
      while (k.twistInfo().phase !== 1 && g++ < 400) k.step(1, {});
      spot(90);
      const xWarn0 = k.probe().x, warn = k.twistInfo().warn, toast = k.levelInfo().toast;
      k.step(54, {});
      const xWarn1 = k.probe().x, stillWarn = k.twistInfo().warn;
      k.step(95, {});
      const xGust = k.probe().x, gusts = k.twistInfo().gusts;
      /* the far lip of the 4-wide hole (local 20-23 = columns 101-104): a gust never pushes Kinan off it */
      g = 0;
      while (k.twistInfo().phase !== 58 && g++ < 400) k.step(1, {});
      k.place(105 * 16 + 1, 112); k.step(100, {});
      const lip = k.twistInfo();
      return { wind: off.wind, warn, toast, stillWarn, xWarn0, xWarn1, xGust, gusts, lipX: lip.px, lipGround: lip.onGround };
    })()`) as Record<string, number | boolean | string>;
    console.log('7-4 wind: ' + JSON.stringify(r));
    expect(r.wind as number, 'wind columns in 7-4: the approach (27), the whole bridge (135), off its end (22)').toBe(184);
    expect(r.warn, 'the warning is on first').toBe(true);
    expect(String(r.toast)).toContain('WIND');
    expect(r.stillWarn).toBe(true);
    expect(r.xWarn1, 'the warning itself pushes nothing').toBeCloseTo(r.xWarn0 as number, 1);
    expect(r.xGust as number, 'the gust pushed Kinan back (left) by more than a tile').toBeLessThan((r.xWarn1 as number) - 16);
    expect(r.gusts as number).toBeGreaterThanOrEqual(1);
    expect(r.lipGround, 'still standing on the lip after a gust').toBe(true);
    expect(r.lipX as number, 'not pushed into the hole').toBeGreaterThanOrEqual(105 * 16 - 9);
    expect(errors).toEqual([]);
  });

  test('7-3 twist: BANANA-SLUG TRACTION. Slime makes stopping slower, moss slows Kinan to a walk, slugs leave slime trails', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11;
      k.playLevel('7-3'); k.godMode(); k.clearFoes();
      const info = k.twistInfo();
      /* run right at full speed, let go once Kinan's middle is past column 'at', measure how far he slides */
      const slide = (from, at) => {
        k.place(from * 16 + 3, 176); k.step(3, {});
        let g = 0;
        while (k.probe().x + 5 < at * 16 + 8 && g++ < 200) k.step(1, { right: true, fire: true });
        const x0 = k.probe().x, v0 = k.probe().vx;
        let n = 0;
        while (Math.abs(k.probe().vx) > 0 && n < 200) { k.step(1, { left: false, right: false, jump: false, fire: false }); n++; }
        return { d: Math.round(k.probe().x - x0), v0: Math.round(v0 * 100) / 100, frames: n };
      };
      const plain = slide(94, 100), slimy = slide(20, 27);
      /* moss on the root ridge (columns 60-63, floor 160): the top speed there */
      k.place(52 * 16 + 3, 176); k.step(3, {});
      let mossTop = 0, before = 0, g = 0;
      while (k.probe().x + 5 < 64 * 16 && g++ < 400) {
        const p = k.step(1, { right: true, fire: true })[0], c = Math.floor((p.x + 5) / 16);
        if (c >= 62 && c <= 63 && p.onGround) mossTop = Math.max(mossTop, Math.abs(p.vx));
        if (c >= 54 && c <= 56) before = Math.max(before, Math.abs(p.vx));
      }
      /* the slugs, left in: they leave slime trails behind them */
      k.playLevel('7-3'); k.godMode(); k.step(240, {});
      const trail = k.twistInfo().slimeLive;
      return { slime: info.slime, moss: info.moss, slugTrail: info.slugTrail, plain, slimy, mossTop, before, trail };
    })()`) as { slime: number; moss: number; slugTrail: boolean; plain: { d: number; v0: number }; slimy: { d: number; v0: number }; mossTop: number; before: number; trail: number };
    console.log('7-3 traction: ' + JSON.stringify(r));
    expect(r.slime, 'slime pool columns').toBe(20);
    expect(r.moss, 'moss columns').toBe(25);
    expect(r.slugTrail).toBe(true);
    expect(r.plain.v0).toBeGreaterThan(3);
    expect(r.slimy.v0).toBeGreaterThan(3);
    expect(r.slimy.d, 'on slime he slides more than twice as far before he stops').toBeGreaterThan(r.plain.d * 2);
    expect(r.before, 'full run before the moss').toBeGreaterThan(3);
    expect(r.mossTop, 'a slow walk on the moss').toBeLessThanOrEqual(1.2);
    expect(r.mossTop).toBeGreaterThan(0.5);
    expect(r.trail, 'slime tiles left behind by the slugs').toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });

  test('7-2 twist: THE WAVES. The water bubbles first, then a wave splashes over the seawall and knocks Kinan back (never into the water)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11;
      k.playLevel('7-2'); k.godMode(); k.clearFoes();
      const info = k.twistInfo();
      /* the dev bot plays the level frame by frame, noting every wave and where it came */
      let firstWave = null, bubbling = false, knocked = 0, lastSplash = 0;
      for (let f = 0; f < 6000 && !k.levelInfo().cleared; f++) {
        k.auto(1, { run: true });
        const p = k.probe(), t = k.twistInfo();
        if (t.wave && !firstWave) firstWave = { x: t.wave.x, at: f, kinanX: p.x };
        if (t.wave && t.wave.t > 5 && t.wave.t < 45) bubbling = true;
        if (t.splashed > lastSplash) { knocked++; lastSplash = t.splashed; }
      }
      /* a wave right at Kinan: stand still in front of it and get splashed back */
      k.playLevel('7-2'); k.godMode(); k.clearFoes();
      let g = 0;
      while ((k.twistInfo().t + 1) % 260 !== 0 && g++ < 400) k.step(1, { left: false, right: false });
      k.place(24 * 16 + 3, 160); k.step(1, { right: true });
      const w = k.twistInfo().wave;
      k.place(w.x - 20, 160); k.step(48, { left: false, right: false });
      const x0 = k.probe().x;
      k.step(30, { left: false, right: false });
      const after = k.twistInfo();
      return { waves: info.waves, waveN: k.twistInfo().waveN, firstWave, bubbling, knocked, wave: w, x0, x1: after.px, splashed: after.splashed };
    })()`) as { waves: number; firstWave: { x: number; at: number; kinanX: number } | null; bubbling: boolean; knocked: number; wave: { x: number }; x0: number; x1: number; splashed: number };
    console.log('7-2 waves: ' + JSON.stringify(r));
    expect(r.waves, 'wave columns (all but the reward screen)').toBe(270);
    expect(r.firstWave, 'a wave came while Kinan walked the seawall').not.toBeNull();
    expect(r.bubbling, 'it bubbled first').toBe(true);
    expect(r.wave, 'a wave right in front of Kinan').not.toBeNull();
    expect(r.splashed, 'the splash hit him').toBeGreaterThan(0);
    expect(r.x1, 'knocked back, away from the wave').toBeLessThan(r.x0 - 8);
    expect(errors).toEqual([]);
  });

  test('7-5 twist: THE SWAY. The bridge nudges Kinan to and fro, and the loose planks bob on their ropes, solid, carrying him', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('7-5'); k.godMode(); k.clearFoes();
      const info = k.twistInfo();
      /* the planks move: their heights over 2.5 s */
      const ys = info.movers.map(() => []), xs = info.movers.map(() => []);
      for (let f = 0; f < 150; f++) { k.step(1, still); k.twistInfo().movers.forEach((m, i) => { ys[i].push(m.y); xs[i].push(m.x); }); }
      const span = (a) => Math.round((Math.max(...a) - Math.min(...a)) * 10) / 10;
      /* stand on the twin bridge's first plank (columns 171-172) and ride it for 2 s */
      const m0 = k.twistInfo().movers[2];
      k.place(m0.x + m0.w / 2 - 5, m0.y - 24); k.step(12, still);
      const on = k.twistInfo().movers[2].riding;
      let rode = 0, offBy = 0;
      for (let f = 0; f < 120; f++) {
        const p = k.step(1, still)[0], t = k.twistInfo(), m = t.movers[2];
        if (m.riding && p.onGround) rode++;
        offBy = Math.max(offBy, Math.abs(Math.abs(m.x + m.w / 2 - (p.x + 5))));
      }
      /* the deck sways: standing still on the first bridge's flat bottom (column 33), Kinan is nudged to and fro */
      k.place(33 * 16 + 3, 144); k.step(5, still);
      const dx = [];
      for (let f = 0; f < 440; f++) dx.push(k.step(1, still)[0].x);
      const p = k.probe();
      return { planks: info.movers.length, kinds: info.movers.map((m) => m.kind), sway: info.sway, ySpan: ys.map(span), xSpan: xs.map(span), on, rode, offBy, swayX: span(dx), stillOn: p.onGround && p.y < 200 };
    })()`) as { planks: number; kinds: string[]; sway: number; ySpan: number[]; xSpan: number[]; on: boolean; rode: number; offBy: number; swayX: number; stillOn: boolean };
    console.log('7-5 sway: ' + JSON.stringify(r));
    expect(r.planks).toBe(5);
    expect(r.kinds.every((x) => x === 'plank')).toBe(true);
    expect(r.sway, 'sway columns on the four bridges').toBe(101);
    for (const s of r.ySpan) expect(s, 'each plank bobs up and down').toBeGreaterThanOrEqual(9);
    for (const s of r.xSpan) expect(s, 'each plank swings a little').toBeGreaterThan(2);
    expect(r.on, 'Kinan lands on the plank').toBe(true);
    expect(r.rode, 'it carries him for the whole 2 s').toBe(120);
    expect(r.offBy, 'he moves with it (stays near its middle)').toBeLessThan(6);
    expect(r.swayX, 'the deck nudges him to and fro').toBeGreaterThan(4);
    expect(r.stillOn, 'and never off the bridge').toBe(true);
    expect(errors).toEqual([]);
  });

  test('7-6 twist: PULLEYS. Stand on a rope platform and it sinks while its partner rises; a jump from the risen one bumps the high gift; a water taxi drifts', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('7-6'); k.godMode(); k.clearFoes();
      const info = k.twistInfo();
      const ms = () => k.twistInfo().movers;
      const a0 = ms()[0], b0 = ms()[1];
      /* drop onto the teaching pair's left platform (columns 96-97) and stand there 1.5 s */
      k.place(a0.x + 11, a0.y - 30); k.step(10, still);
      const landed = ms()[0].riding;
      k.step(80, still);
      const a1 = ms()[0], b1 = ms()[1];
      /* jump across onto the risen partner, then straight up: the gift over it (column 100, row 3) */
      const tileBefore = k.tile(100, 3);
      k.step(1, { right: true, jump: true, tapJump: true });
      for (let f = 0; f < 60 && !ms()[1].riding; f++) k.step(1, { right: true, jump: f < 30 });
      const onB = ms()[1].riding, bTop = ms()[1].y;
      /* (again, standing still under the gift's column the moment he lands on the risen partner) */
      k.place(a0.x + 11, a0.y - 30); k.step(90, still);
      const bb = ms()[1];
      k.place(bb.x + 18, bb.y - 20); k.step(6, still);
      const jumpFrom = k.probe();
      const up = k.step(1, { jump: true, tapJump: true }).concat(k.step(40, { jump: true })); k.step(40, still);
      const peak = Math.min(...up.map((p) => p.y));
      const tileAfter = k.tile(100, 3);
      /* nobody on them: they ease back level */
      k.place(90 * 16, 160); k.step(200, still);
      const a2 = ms()[0], b2 = ms()[1];
      /* the water taxi drifts */
      const boatX = [];
      for (let f = 0; f < 200; f++) { k.step(1, still); boatX.push(ms().find((m) => m.kind === 'boat').x); }
      return { kinds: info.movers.map((m) => m.kind), a0: a0.y, b0: b0.y, landed, a1: a1.y, b1: b1.y, onB, bTop, tileBefore, tileAfter, peak, jumpFromY: jumpFrom.y, a2: a2.y, b2: b2.y,
        boat: Math.max(...boatX) - Math.min(...boatX) };
    })()`) as { kinds: string[]; a0: number; b0: number; landed: boolean; a1: number; b1: number; onB: boolean; bTop: number; tileBefore: number; tileAfter: number; a2: number; b2: number; boat: number };
    console.log('7-6 pulleys: ' + JSON.stringify(r));
    expect(r.kinds).toEqual(['pulley', 'pulley', 'pulley', 'pulley', 'pulley', 'pulley', 'boat']);
    expect(r.landed, 'Kinan stands on the left platform').toBe(true);
    expect(r.a1, 'it sank 1.5 tiles').toBeCloseTo(r.a0 + 24, 0);
    expect(r.b1, 'its partner rose 1.5 tiles').toBeCloseTo(r.b0 - 24, 0);
    expect(r.onB, 'he hops across onto the risen partner').toBe(true);
    expect(r.tileBefore, 'the high gift').toBe(3);
    expect(r.tileAfter, 'bumped from the risen platform (used)').not.toBe(3);
    expect(r.a2, 'left alone, they ease back level').toBeCloseTo(r.a0, 0);
    expect(r.b2).toBeCloseTo(r.b0, 0);
    expect(r.boat, 'the water taxi drifts across its gap').toBeGreaterThan(40);
    expect(errors).toEqual([]);
  });

  test('7-7 twist: CIRCUITS. The red door blocks Kinan; bumping its switch swaps the red and blue blocks (CLICK) and lets him through; the magnet lift pulls him up', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('7-7'); k.godMode(); k.clearFoes();
      const i0 = k.twistInfo();
      /* run into the red door (column 103) */
      k.place(98 * 16 + 3, 176); k.step(3, still); k.step(70, { right: true });
      const blockedX = k.probe().x;
      /* jump right there: the switch over his head (column 102, row 8) */
      k.step(1, { right: true, jump: true, tapJump: true });
      let toast = '';
      for (let f = 0; f < 40; f++) { k.step(1, { right: true, jump: true }); const t = k.levelInfo().toast; if (/CLICK/.test(t)) toast = t; }
      k.step(40, { right: true });
      const i1 = k.twistInfo(), x1 = k.probe().x;
      /* the magnet lift (column 315, rows 8-11): stand in it */
      k.place(315 * 16 + 3, 176); k.step(2, still);
      const y0 = k.probe().y;
      let lifted = false, top = 999;
      for (let f = 0; f < 60; f++) { const p = k.step(1, still)[0]; if (k.twistInfo().lift) lifted = true; top = Math.min(top, p.y); }
      k.step(9, { right: true }); k.step(30, still);
      const onShelf = k.probe();
      return { i0: { sw: i0.sw, red: i0.red.map((b) => b[2]), blue: i0.blue.map((b) => b[2]), switches: i0.switches, magnets: i0.magnets },
        blockedX, toast, i1: { sw: i1.sw, flips: i1.flips, red: i1.red.map((b) => b[2]), blue: i1.blue.map((b) => b[2]) }, x1, y0, lifted, top, shelfY: onShelf.y, shelfGround: onShelf.onGround };
    })()`) as { i0: { sw: number; red: boolean[]; blue: boolean[]; switches: number[][]; magnets: number[][] }; blockedX: number; toast: string; i1: { sw: number; flips: number; red: boolean[]; blue: boolean[] }; x1: number; y0: number; lifted: boolean; top: number; shelfY: number; shelfGround: boolean };
    console.log('7-7 circuits: ' + JSON.stringify(r));
    expect(r.i0.switches).toEqual([[102, 8], [149, 8], [226, 8], [280, 8]]);
    expect(r.i0.sw).toBe(0);
    expect(r.i0.red.every(Boolean), 'red blocks start solid').toBe(true);
    expect(r.i0.blue.some(Boolean), 'blue blocks start see-through').toBe(false);
    expect(r.blockedX, 'the red door stops him').toBeLessThanOrEqual(103 * 16 - 9);
    expect(r.toast).toContain('CLICK');
    expect(r.i1.flips).toBe(1);
    expect(r.i1.sw).toBe(1);
    expect(r.i1.red.some(Boolean), 'red blocks off').toBe(false);
    expect(r.i1.blue.every(Boolean), 'blue blocks on').toBe(true);
    expect(r.x1, 'through the open door').toBeGreaterThan(104 * 16);
    /* (the sound: flipCircuit plays SFX.power, checked by reading the code, not by ear) */
    expect(r.i0.magnets).toEqual([[315, 8, 11]]);
    expect(r.lifted).toBe(true);
    expect(r.top, 'pulled up the column').toBeLessThanOrEqual(r.y0 - 48);
    expect(r.shelfGround).toBe(true);
    expect(r.shelfY, 'off the top onto the shelf (row 8)').toBe(8 * 16 - 16);
    expect(errors).toEqual([]);
  });

  test('7-8 twist: THE MOVING TRAIN. The city rushes past while Kinan stands still; signs warn, then knock him if he jumps into one; low cables warn, then hurt if he walks into one; walking off the express car lands on the gangway', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('7-8'); k.clearFoes();
      k.place(2 * 16 + 3, 160); k.step(5, still);
      const a = k.twistInfo(), camA = k.probe().camX;
      k.step(60, still);
      const b = k.twistInfo(), camB = k.probe().camX;
      const signs = b.signs;
      /* the overhead sign at column 80 (roof 128): stand 3 tiles before it, then jump right into it */
      const duck = signs.find((s) => s.kind === 'duck');
      k.arenaSetHp(3);
      k.place(77 * 16 + 3, 112); k.step(20, still);
      const hp0 = k.twistInfo().hp, hits0 = k.twistInfo().signHits;
      /* walking under it is safe */
      k.step(50, { right: true, fire: false });
      const hpWalk = k.twistInfo().hp, pastX = k.probe().x;
      k.arenaSetHp(3);
      k.place(duck.x + 9, 112); k.step(20, still);
      k.step(1, { jump: true, tapJump: true }); k.step(30, { jump: true }); k.step(30, still);
      const hpJump = k.twistInfo().hp, hitsJump = k.twistInfo().signHits;
      /* the low cable at column 7 (platform 176): walk into it */
      k.arenaSetHp(3);
      k.place(3 * 16 + 3, 160); k.step(130, still);
      k.step(60, { right: true, fire: false });
      const hpCable = k.twistInfo().hp;
      /* walking off the express car (top row 6, columns 200-207) at a walk and at a run lands on the gangway, never in the coupling */
      k.godMode();
      const off = [];
      for (const run of [false, true]) {
        /* a slow step off the very end, or a full run off it, letting go of nothing but never jumping */
        if (run) { k.place(201 * 16 + 3, 80); k.step(20, still); } else { k.place(208 * 16 - 4, 80); k.step(20, still); }
        let p = k.probe(), air = false;
        for (let f = 0; f < 120; f++) {
          p = k.step(1, run ? { right: true, fire: true } : { right: f < 3, fire: false })[0];
          if (!p.onGround) air = true; else if (air) break;
        }
        off.push({ run, x: Math.round(p.x), y: Math.round(p.y), onGround: p.onGround, falls: k.levelInfo().falls || 0 });
      }
      return { rush: a.rush, storm: a.storm, rushA: a.rushX, rushB: b.rushX, camA, camB, signCols: a.signCols, signs, duck, hp0, hits0, hpWalk, pastX, hpJump, hitsJump, hpCable, off };
    })()`) as { rush: boolean; storm: number; rushA: number; rushB: number; camA: number; camB: number; signCols: (number | string)[][]; signs: { kind: string }[]; hp0: number; hits0: number; hpWalk: number; pastX: number; hpJump: number; hitsJump: number; hpCable: number; off: { run: boolean; x: number; y: number; onGround: boolean; falls: number }[] };
    console.log('7-8 train: ' + JSON.stringify(r));
    expect(r.rush).toBe(true);
    expect(r.storm).toBe(300);
    expect(r.camB, 'Kinan stood still: the camera did not move').toBe(r.camA);
    expect(r.rushB - r.rushA, 'but the city behind rushed past (5 px a frame)').toBe(300);
    expect(r.signCols).toEqual([[7, 'jump'], [80, 'duck'], [157, 'jump']]);
    expect(r.signs.length).toBe(3);
    expect(r.signs.map((s) => (s as unknown as { y: number }).y), 'on the floor: the platform (176), the Main Street car (128), the tunnel floor (144)').toEqual([176 - 7, 128 - 34, 144 - 7]);
    expect(r.hpWalk, 'walking under the sign is safe').toBe(r.hp0);
    expect(r.pastX, 'and he got past it').toBeGreaterThan(81 * 16);
    expect(r.hitsJump, 'jumping into the sign hits it').toBeGreaterThan(r.hits0);
    expect(r.hpJump, 'and costs a heart').toBeLessThan(3);
    expect(r.hpCable, 'walking into the low cable costs a heart').toBeLessThan(3);
    for (const o of r.off) {
      expect(o.onGround, `walked off the express car (${o.run ? 'run' : 'walk'}): standing`).toBe(true);
      expect(o.falls, `walked off the express car (${o.run ? 'run' : 'walk'}): no fall`).toBe(0);
      expect(o.y, `walked off the express car (${o.run ? 'run' : 'walk'}): on the gangway (row 7)`).toBe(7 * 16 - 16);
    }
    expect(errors).toEqual([]);
  });
});

/* ---- the map ---- */
async function mapNow(page: Page): Promise<MapState> { return page.evaluate(() => (window as unknown as Win).__k11.mapState()); }
async function settle(page: Page, timeout = 60_000): Promise<MapState> {
  await page.waitForFunction(() => { const k = (window as unknown as Win).__k11 as Dev & { cut: () => { on: boolean } }; const s = k.mapState(); return s.mounted && !s.walking && !s.crossing && !s.busy && !s.banner && !k.cut().on; }, null, { timeout });
  return mapNow(page);
}
/* a save standing on a World 7 stop, every level before it beaten (World 7 opened on the map with owRelease(7)) */
async function seedWorld7(page: Page, at: string): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
  await page.evaluate(({ key, at }) => {
    const w = window as unknown as Win, K = w.KinanLevels, me = K.get(at), beaten: Record<string, number> = {};
    w.__k11.owRelease(7);
    const ids = K.list();
    for (const id of ids) { const d = K.get(id); if (!/secret/.test(id) && (d.world < me.world || (d.world === me.world && d.slot < me.slot))) beaten[id] = 1; }
    localStorage.setItem(key, JSON.stringify({ unlocked: 1, beaten: [], introSeen: true, levelsBeaten: beaten, unlockedLevels: ids.filter((id) => /secret/.test(id) && K.get(id).world < me.world), escapes: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 }, wmap: { w: 7, at: me.slot - 1 } }));
  }, { key: CURRENT, at });
  await page.reload();
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
}

test.describe('World 7 · on the map', () => {
  test("World 7's map stops are its level files: 7-1 .. 7-5, 7-fort, 7-secret, 7-6 .. 7-8, 7-castle", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await seedWorld7(page, '7-1');
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    expect(s0).toMatchObject({ world: 7, at: 0 });
    expect(s0.stops.map((q) => [q.id, q.kind, q.built])).toEqual([
      ['7-1', 'level', true], ['7-2', 'level', true], ['7-3', 'level', true], ['7-4', 'level', true], ['7-5', 'level', true],
      ['7-fort', 'fort', true], ['7-secret', 'secret', true], ['7-6', 'level', true], ['7-7', 'level', true], ['7-8', 'level', true],
      ['7-castle', 'boss', true]]);
    expect(s0.stops[0].state).toBe('open');
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe('7-1');
    expect(errors).toEqual([]);
  });

  test("7-fort's secret exit (on the gondola): bump the glinting block, walk through the door -> SECRET LEVEL FOUND! and the 7-secret stop opens", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await seedWorld7(page, '7-fort');
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    const secretAt = s0.stops.findIndex((q) => q.kind === 'secret');
    expect(s0.stops[s0.at].id).toBe('7-fort');
    expect(s0.stops[secretAt]).toMatchObject({ id: '7-secret', state: 'locked' });
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe('7-fort');
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11, def = (window as unknown as Win).KinanLevels.get('7-fort');
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
    expect(r.to).toBe('7-secret');
    expect(r.closed!.open).toBe(false);
    expect(r.opened).toBe(true);
    expect(r.toast).toContain('SECRET EXIT FOUND');
    expect(r.unlocked).toContain('7-secret');
    expect(r.returned).toBe(true);
    await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy; });
    const s1 = await mapNow(page);
    expect(s1.notice).toBe('SECRET LEVEL FOUND!');
    expect(s1.stops[secretAt]).toMatchObject({ id: '7-secret', kind: 'secret', state: 'open' });
    expect(s1.celebrate).toBe(secretAt);
    expect(errors).toEqual([]);
  });
});

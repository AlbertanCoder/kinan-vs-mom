import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* World 8 — Toronto, the level files (2026-10-29; the second run added the octopus arena to 8-fort and 8-castle,
   CASA LOMA: the bosses themselves are proved in w8-world.spec.ts). For every World 8
   level file:
   - it is registered as World 8 on the right map stop and passes the gate (no problems, no lint),
   - it reaches LEVEL CLEAR with the plain dev bot (auto(30, {run: true}), god mode, foes cleared) with 0 pit falls
     (no search fallback: World 7's spec falls back to a search, World 8's does not),
   - every secret is reachable: from a spot on the main path just before it, a best-first search over real-input moves
     (god mode, foes cleared, a move that drops into a pit is cut off) finds it (SECRET n/3 marked),
   - a full-run jump off every high spot comes down on floor,
   - each level's twist exists and does its thing,
   - 8-6's secret exit (at the lighthouse) opens 8-secret on the World 8 map,
   - World 8's map stops are these level files,
   - no page errors anywhere. */

const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';
const W8 = ['1', '2', '3', '4', '5', 'fort', '6', 'secret', '7', '8', 'castle'].map((s) => `8-${s}`);   /* 8-castle: the second run (2026-10-29) */
/* the map stop each file stands on (map/worlds/w08.js: the secret comes right after 8-6, the island lighthouse) */
const SLOT: Record<string, number> = { '8-1': 1, '8-2': 2, '8-3': 3, '8-4': 4, '8-5': 5, '8-fort': 6, '8-6': 7, '8-secret': 8, '8-7': 9, '8-8': 10, '8-castle': 11 };
/* where each secret's route starts: a flat column of the main path just before it (in the level's own columns) */
const SECRET_FROM: Record<string, number[]> = {
  '8-1': [62, 96, 203],
  '8-2': [118, 62, 225],
  '8-3': [57, 171, 227],
  '8-4': [120, 82, 250],
  '8-5': [120, 230, 200],
  '8-6': [36, 230, 200],
  '8-7': [56, 118, 207],
  '8-8': [76, 18, 177]
};
/* the high spots with a pit after them: a full-run jump off each must come down on floor. from..to is the top of the
   spot, top its row (Kinan's feet on it), pits the first column of each pit ahead that a jump from there could come
   down in. */
const HIGH: { id: string; what: string; from: number; to: number; top: number; pits: number[] }[] = [
  { id: '8-1', what: 'the arrivals board', from: 66, to: 68, top: 5, pits: [120] },
  { id: '8-1', what: 'carousel 2', from: 113, to: 119, top: 10, pits: [120, 143] },
  { id: '8-1', what: 'the tall carousel', from: 168, to: 175, top: 9, pits: [176, 195] },   /* its belt runs left: start 2 tiles in, so the settle frames never carry him off its left end */
  { id: '8-1', what: 'the big sign', from: 209, to: 211, top: 3, pits: [228] },
  { id: '8-2', what: 'the viaduct lamp', from: 124, to: 127, top: 7, pits: [140] },
  { id: '8-2', what: 'the signal gantry', from: 229, to: 231, top: 2, pits: [246] },
  { id: '8-3', what: 'the last O of the sign', from: 54, to: 56, top: 9, pits: [94] },
  { id: '8-3', what: 'the maple leaf ledge', from: 58, to: 60, top: 6, pits: [94] },
  { id: '8-3', what: 'the second arch', from: 92, to: 98, top: 8, pits: [114] },
  { id: '8-3', what: 'the third arch', from: 112, to: 119, top: 7, pits: [193] },
  { id: '8-3', what: "City Hall's podium", from: 170, to: 179, top: 8, pits: [193, 206] },
  { id: '8-3', what: 'the arch top', from: 232, to: 234, top: 2, pits: [] },
  { id: '8-4', what: 'the window ledge', from: 126, to: 128, top: 3, pits: [140] },
  { id: '8-4', what: 'the roundhouse roof', from: 257, to: 259, top: 3, pits: [] },
  { id: '8-5', what: 'the top shelf', from: 206, to: 208, top: 2, pits: [224] },
  { id: '8-6', what: 'the wheelhouse roof', from: 40, to: 44, top: 5, pits: [61] },
  { id: '8-6', what: 'the lifeguard chair', from: 206, to: 208, top: 3, pits: [223] },
  { id: '8-secret', what: 'the lamp gallery', from: 46, to: 56, top: 2, pits: [88] },
  { id: '8-7', what: 'the patio', from: 35, to: 44, top: 10, pits: [45, 76] },
  { id: '8-7', what: 'the garden car', from: 58, to: 63, top: 9, pits: [76] },
  { id: '8-7', what: "the garden car's trellis", from: 60, to: 62, top: 5, pits: [76] },
  { id: '8-7', what: 'the tall shop roof', from: 93, to: 99, top: 6, pits: [113] },
  { id: '8-7', what: 'the taller shop roof', from: 147, to: 153, top: 5, pits: [169] },
  { id: '8-7', what: 'the rooftop patio rail', from: 213, to: 215, top: 3, pits: [229] },
  { id: '8-7', what: 'the tallest shop roof', from: 238, to: 242, top: 5, pits: [] },
  { id: '8-8', what: 'the billboard', from: 80, to: 84, top: 5, pits: [99] },
  { id: '8-8', what: 'the highest roof (act 2)', from: 139, to: 152, top: 7, pits: [153, 172] },
  { id: '8-8', what: 'the antenna', from: 183, to: 185, top: 2, pits: [200] },
  { id: '8-8', what: 'the highest roof (act 3)', from: 237, to: 248, top: 7, pits: [249, 267] }
];

type Secret = { kind: string; col: number; row: number; prize: string; exit?: string };
type Area = { cols: number; heights: (number | null)[]; secrets?: Secret[] };
type LevelDef = Area & { id: string; world: number; slot: number; kind?: string; theme?: number; snatch?: boolean; areas?: Area[] };
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

/* reach secret number k of a level: stand Kinan on the main path at column 'from', then a best-first search over
   real-input moves (walk, run, short and full jumps, both ways), always trying first from the spot nearest the
   secret, until the level marks that secret found (its gift block bumped or its prize picked up). God mode, foes
   cleared; a move that falls into a pit is dropped; a move that walks through the goal restarts the level.
   (w7-levels.spec.ts's SEEK, unchanged.) */
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

test.describe('World 8 · the level files', () => {
  test('all 11 World 8 level files are registered as World 8 on their map stops and pass the gate', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const reg = await page.evaluate(() => {
      const w = window as unknown as Win;
      const ids = w.KinanLevels.list().filter((id) => id.startsWith('8-'));
      const defs = ids.map((id) => { const d = w.KinanLevels.get(id); return { id, world: d.world, slot: d.slot, theme: d.theme, snatch: !!d.snatch, pet: 'pet' in d || (d.areas || []).some((a) => 'pet' in a) }; });
      const lv = w.__k11.levels().levels.filter((x) => x.id.startsWith('8-'));
      return { ids, defs, bad: lv.filter((x) => x.problems.length || x.lint.length) };
    });
    expect([...reg.ids].sort()).toEqual([...W8].sort());
    expect(reg.bad).toEqual([]);
    for (const d of reg.defs) {
      expect(d.world, d.id).toBe(8);
      expect(d.slot, d.id).toBe(SLOT[d.id]);
      expect(Number.isInteger(d.theme), `${d.id} borrows a look`).toBe(true);
      expect(d.snatch, `${d.id}: World 8's raccoons grab candles and run`).toBe(true);
      expect(d.pet, `${d.id}: no pet crate (all six are found by World 5)`).toBe(false);
    }
    expect(errors).toEqual([]);
  });

  test('no World 8 foe starts inside a block or waits at a lip, no block hangs over a take-off, and no candle is lost inside a block', async ({ page }) => {
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
    }, W8);
    for (const o of out) {
      expect(o.badFoes, `${o.id}: foes inside blocks [col, row, tile]`).toEqual([]);
      expect(o.atLip, `${o.id}: walkers or hoppers waiting at a lip [col, row, type]`).toEqual([]);
      expect(o.overTakeoff, `${o.id}: blocks over a gap's take-off column [col, row]`).toEqual([]);
      expect(o.live, `${o.id}: every authored candle is in the level`).toBe(o.authored);
    }
    expect(errors).toEqual([]);
  });

  test('a full-run jump off every World 8 high spot comes down on floor, with a tile to spare before the next pit', async ({ page }) => {
    test.setTimeout(180_000);
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

  for (const id of W8) {
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

/* ---- the twists: each World 8 level's own trick exists and does its thing (scripts run in the page) ---- */
test.describe('World 8 · the twists', () => {
  test('8-1 twist: THE BELTS. A walkway carries Kinan while he stands still (either way), a carousel carries him on top, in the air he keeps his own speed, and no belt carries him into a gap', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('8-1'); k.godMode(); k.clearFoes();
      const info = k.twistInfo();
      const ride = (c, row, n) => { k.place(c * 16 + 3, row * 16 - 16); k.step(5, still); const x0 = k.probe().x; k.step(n, still); const p = k.probe(); return { dx: Math.round(p.x - x0), onGround: p.onGround, belt: k.twistInfo().belt }; };
      const walkway = ride(12, 12, 60), wrongWay = ride(50, 12, 60), carousel = ride(93, 10, 40);
      /* standing still on the first walkway, jump straight up: in the air the belt no longer carries him */
      k.place(13 * 16 + 3, 176); k.step(5, still);
      k.step(1, { jump: true, tapJump: true }); k.step(2, { jump: true });
      const a0 = k.probe().x; k.step(14, { jump: true }); const a1 = k.probe().x, airborne = !k.probe().onGround;
      /* every belt that carries Kinan forward: stand on its first tile for 8 s and he is still on solid floor, no fall */
      const fwd = info.belts.filter((b) => b[3] > 0).map((b) => {
        k.place(b[0] * 16 + 3, b[2] * 16 - 16); k.step(480, still);
        const p = k.probe();
        return { belt: b, onGround: p.onGround, y: Math.round(p.y), falls: k.levelInfo().falls || 0, col: Math.floor((p.x + 5) / 16) };
      });
      return { belts: info.belts, walkway, wrongWay, carousel, air: Math.round((a1 - a0) * 100) / 100, airborne, fwd, beltT: k.twistInfo().beltT };
    })()`) as { belts: number[][]; walkway: { dx: number; onGround: boolean; belt: number }; wrongWay: { dx: number; onGround: boolean; belt: number }; carousel: { dx: number; onGround: boolean; belt: number }; air: number; airborne: boolean; fwd: { belt: number[]; onGround: boolean; y: number; falls: number; col: number }[]; beltT: number };
    console.log('8-1 belts: ' + JSON.stringify(r));
    expect(r.belts.length, 'walkways and carousels').toBe(10);
    expect(r.walkway.dx, 'the walkway carried him right about 1 px a frame').toBeGreaterThanOrEqual(55);
    expect(r.walkway.belt).toBe(1);
    expect(r.wrongWay.dx, 'the wrong-way walkway carried him left').toBeLessThanOrEqual(-40);
    expect(r.carousel.dx, 'the carousel carried him along its top (left)').toBeLessThanOrEqual(-30);
    expect(r.carousel.onGround).toBe(true);
    expect(r.airborne, 'he was in the air').toBe(true);
    expect(Math.abs(r.air), 'in the air the belt does not carry him').toBeLessThan(1);
    for (const f of r.fwd) {
      expect(f.falls, `belt ${JSON.stringify(f.belt)}: no fall`).toBe(0);
      expect(f.onGround, `belt ${JSON.stringify(f.belt)}: still standing at column ${f.col}`).toBe(true);
      expect(f.y, `belt ${JSON.stringify(f.belt)}: on its own floor`).toBe(f.belt[2] * 16 - 16);
    }
    expect(errors).toEqual([]);
  });

  test('8-2 twist: THE SUBWAY. The city rushes past while Kinan stands still, silver subway cars, the signs warn where they stand, and in a tunnel the roof cuts a full jump short (out on the viaduct it does not)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('8-2'); k.godMode(); k.clearFoes();
      k.place(2 * 16 + 3, 176); k.step(5, still);
      const a = k.twistInfo(), camA = k.probe().camX;
      k.step(60, still);
      const b = k.twistInfo(), camB = k.probe().camX;
      /* a full jump (JUMP held) standing on a car: in the first tunnel (car 5, c63) and out in the open (car 3, c45) */
      const apex = (c) => { k.place(c * 16 + 3, 144); k.step(10, still); const ys = k.step(1, { jump: true, tapJump: true }).concat(k.step(40, { jump: true })); k.step(30, still); return Math.min(...ys.map((p) => p.y)); };
      return { rush: a.rush, subway: a.subway, trainCars: a.trainCars, signCols: a.signCols, signs: b.signs.map((s) => [s.kind, s.y]), rushA: a.rushX, rushB: b.rushX, camA, camB,
        tunnelTop: apex(63), openTop: apex(45), ceiling: k.tile(63, 5) };
    })()`) as { rush: boolean; subway: boolean; trainCars: number; signCols: (number | string)[][]; signs: (string | number)[][]; rushA: number; rushB: number; camA: number; camB: number; tunnelTop: number; openTop: number; ceiling: number };
    console.log('8-2 subway: ' + JSON.stringify(r));
    expect(r.rush).toBe(true);
    expect(r.subway, 'silver cars with a red stripe').toBe(true);
    expect(r.trainCars, 'car sides under the roofs').toBeGreaterThan(200);
    expect(r.camB, 'Kinan stood still: the camera did not move').toBe(r.camA);
    expect(r.rushB - r.rushA, 'but the city behind rushed past (5 px a frame)').toBe(300);
    expect(r.signCols).toEqual([[8, 'duck'], [38, 'jump'], [100, 'duck'], [148, 'jump']]);
    expect(r.signs, 'on their floors: the platform (192), a roof (160), the tunnel roof (160), under the road deck (160)').toEqual([['duck', 192 - 34], ['jump', 160 - 7], ['duck', 160 - 34], ['jump', 160 - 7]]);
    expect(r.ceiling, 'the tunnel roof is solid').toBe(1);
    expect(r.tunnelTop, 'in the tunnel his head stops at the roof (row 6)').toBeGreaterThanOrEqual(96);
    expect(r.openTop, 'in the open a full jump goes over 4 tiles up').toBeLessThan(80);
    expect(errors).toEqual([]);
  });

  test('8-3 twist: THE ICE and THE TORONTO SIGN. On the rink Kinan is slow to get going and slides far when he lets go; the seven giant letters are solid platforms painted as lit-up letters', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('8-3'); k.godMode(); k.clearFoes();
      const info = k.twistInfo();
      /* run right from 'from', let go once his middle is past column 'at', measure the slide; and the frames to reach 3 px/f */
      const slide = (from, at) => {
        k.place(from * 16 + 3, 176); k.step(3, still);
        let g = 0, fast = -1;
        while (k.probe().x + 5 < at * 16 + 8 && g++ < 300) { const p = k.step(1, { right: true, fire: true })[0]; if (fast < 0 && p.vx >= 3) fast = g; }
        const x0 = k.probe().x, v0 = k.probe().vx;
        let n = 0;
        while (Math.abs(k.probe().vx) > 0 && n < 300) { k.step(1, still); n++; }
        return { d: Math.round(k.probe().x - x0), v0: Math.round(v0 * 100) / 100, toFast: fast, falls: k.levelInfo().falls || 0 };
      };
      const plain = slide(1, 9), icy = slide(118, 125);
      /* the letters: every painted cell is solid, and Kinan stands on top of the first T */
      const notSolid = [];
      for (const [kind, c0, r0, c1, r1] of info.skins) for (let c = c0; c <= c1; c++) for (let rr = r0; rr <= r1; rr++) if (k.tile(c, rr) !== 1) notSolid.push([kind, c, rr, k.tile(c, rr)]);
      k.place(31 * 16 + 3, 112); k.step(30, still);
      const onT = k.probe();
      return { ice: info.ice, letters: info.skins.map((s) => s[0]), notSolid, plain, icy, onT: { y: onT.y, onGround: onT.onGround } };
    })()`) as { ice: number; letters: string[]; notSolid: unknown[]; plain: { d: number; v0: number; toFast: number; falls: number }; icy: { d: number; v0: number; toFast: number; falls: number }; onT: { y: number; onGround: boolean } };
    console.log('8-3 ice and letters: ' + JSON.stringify(r));
    expect(r.ice, 'ice columns: the plaza patch (9), the rink (78), the back rink (54)').toBe(141);
    expect(r.letters).toEqual(['letter:T', 'letter:O', 'letter:R', 'letter:O', 'letter:N', 'letter:T', 'letter:O']);
    expect(r.notSolid, 'a letter skin only paints solid blocks').toEqual([]);
    expect(r.onT.onGround, 'Kinan stands on top of the T').toBe(true);
    expect(r.onT.y, 'on its top (row 9)').toBe(9 * 16 - 16);
    expect(r.plain.v0).toBeGreaterThan(3);
    expect(r.icy.v0).toBeGreaterThan(3);
    expect(r.icy.toFast, 'on the ice he is slower to get going').toBeGreaterThan(r.plain.toFast);
    expect(r.icy.d, 'on the ice he slides more than three times as far before he stops').toBeGreaterThan(r.plain.d * 3);
    expect(r.icy.falls, 'and the long icy landing keeps the slide out of the water').toBe(0);
    expect(errors).toEqual([]);
  });

  test('8-4 twist: THE WIND and THE GLASS FLOOR. A gust is warned for 1 s, then pushes Kinan back, and never off the EdgeWalk; the glass floor is a see-through skin on solid floor', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('8-4'); k.godMode(); k.clearFoes();
      const info = k.twistInfo();
      /* the look-out terrace (floor 96, flat c61-80): wait for a gust's first frame */
      const spot = (c) => { k.place(c * 16 + 3, 80); k.step(2, still); };
      spot(72);
      let g = 0;
      while (k.twistInfo().phase !== 1 && g++ < 400) k.step(1, still);
      spot(72);
      const xWarn0 = k.probe().x, warn = k.twistInfo().warn, toast = k.levelInfo().toast;
      k.step(54, still);
      const xWarn1 = k.probe().x, stillWarn = k.twistInfo().warn;
      k.step(95, still);
      const xGust = k.probe().x, gusts = k.twistInfo().gusts;
      /* the far lip of the EdgeWalk's 4-wide gap (c194-197, floor 64): a gust never pushes Kinan off it */
      g = 0;
      while (k.twistInfo().phase !== 58 && g++ < 400) k.step(1, still);
      k.place(198 * 16 + 1, 48); k.step(100, still);
      const lip = k.twistInfo();
      const notSolid = [];
      for (const [kind, c0, r0, c1, r1] of info.skins) for (let c = c0; c <= c1; c++) for (let rr = r0; rr <= r1; rr++) if (k.tile(c, rr) !== 1) notSolid.push([kind, c, rr, k.tile(c, rr)]);
      k.place(100 * 16 + 3, 80); k.step(20, still);
      const onGlass = k.probe();
      return { wind: info.wind, warn, toast, stillWarn, xWarn0, xWarn1, xGust, gusts, lipX: lip.px, lipGround: lip.onGround, falls: k.levelInfo().falls || 0,
        glass: info.skins.map((s) => s[0]), notSolid, onGlass: { y: onGlass.y, onGround: onGlass.onGround } };
    })()`) as Record<string, unknown> & { xWarn0: number; xWarn1: number; xGust: number; gusts: number; lipX: number; notSolid: unknown[]; glass: string[]; onGlass: { y: number; onGround: boolean } };
    console.log('8-4 wind and glass: ' + JSON.stringify(r));
    expect(r.wind, 'wind columns: the terrace (20), the glass floor (27), the EdgeWalk (75)').toBe(122);
    expect(r.warn, 'the warning is on first').toBe(true);
    expect(String(r.toast)).toContain('WIND');
    expect(r.stillWarn).toBe(true);
    expect(r.xWarn1, 'the warning itself pushes nothing').toBeCloseTo(r.xWarn0, 1);
    expect(r.xGust, 'the gust pushed Kinan back (left) by more than a tile').toBeLessThan(r.xWarn1 - 16);
    expect(r.gusts).toBeGreaterThanOrEqual(1);
    expect(r.lipGround, 'still standing on the lip after a gust').toBe(true);
    expect(r.lipX, 'not pushed into the gap').toBeGreaterThanOrEqual(198 * 16 - 9);
    expect(r.falls).toBe(0);
    expect(r.glass).toEqual(['glass', 'glass', 'glass', 'glass']);
    expect(r.notSolid, 'the glass skin only paints solid floor').toEqual([]);
    expect(r.onGlass.onGround, 'Kinan stands on the glass floor').toBe(true);
    expect(r.onGlass.y).toBe(6 * 16 - 16);
    expect(errors).toEqual([]);
  });

  test("8-5 twist: BREAK THE BRICKS and MILO'S BUILD. A bonk pops a brick; the red wall stops Kinan until he bumps the build block over his head, then the wall comes apart and its bricks make a bridge he walks across; Milo speaks once", async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('8-5'); k.godMode(); k.clearFoes();
      const i0 = k.twistInfo();
      /* the first row of bricks (c6-9, row 8): jump straight up under c7 */
      const b0 = k.tile(7, 8);
      k.place(7 * 16 + 3, 176); k.step(3, still); k.step(1, { jump: true, tapJump: true }); k.step(30, { jump: true }); k.step(30, still);
      const b1 = k.tile(7, 8), broken = k.levelInfo().bricksBroken;
      /* run into the red wall (c98) */
      k.place(92 * 16 + 3, 176); k.step(3, still); k.step(80, { right: true });
      const blockedX = k.probe().x;
      /* jump right there: the build block (c97, row 8) is over his head */
      k.step(1, { right: true, jump: true, tapJump: true });
      let toast = '';
      for (let f = 0; f < 40; f++) { k.step(1, { right: true, jump: true }); const t = k.levelInfo().toast; if (/CLICK/.test(t)) toast = t; }
      /* walk on across the bridge (c101-104) and stop on the floor past it (the next gap is at c113) */
      for (let f = 0; f < 160 && k.probe().x < 106 * 16; f++) k.step(1, { right: true });
      k.step(30, still);
      const i1 = k.twistInfo();
      const talk = window.KinanLevels.get('8-5').talk.filter((t) => t[1] === 'MILO');
      return { b0, b1, broken, switches: i0.switches, red0: i0.red.map((b) => b[2]), blue0: i0.blue.map((b) => b[2]), blockedX, toast,
        flips: i1.flips, red1: i1.red.map((b) => b[2]), blue1: i1.blue.map((b) => b[2]), x1: k.probe().x, falls: k.levelInfo().falls || 0, milo: talk.length, miloCol: talk.length ? talk[0][0] : null };
    })()`) as { b0: number; b1: number; broken: number; switches: number[][]; red0: boolean[]; blue0: boolean[]; blockedX: number; toast: string; flips: number; red1: boolean[]; blue1: boolean[]; x1: number; falls: number; milo: number; miloCol: number | null };
    console.log('8-5 bricks and build: ' + JSON.stringify(r));
    expect(r.b0, 'a brick').toBe(2);
    expect(r.b1, 'bonked from below, it popped').toBe(0);
    expect(r.broken).toBeGreaterThanOrEqual(1);
    expect(r.switches).toEqual([[97, 8]]);
    expect(r.red0.every(Boolean), 'the red wall starts solid').toBe(true);
    expect(r.blue0.some(Boolean), 'no bridge yet').toBe(false);
    expect(r.blockedX, 'the red wall stops him').toBeLessThanOrEqual(98 * 16 - 9);
    expect(r.toast, "Milo's build: the wall comes apart and the bricks snap into a bridge").toContain('bridge');
    expect(r.flips).toBe(1);
    expect(r.red1.some(Boolean), 'the wall is gone').toBe(false);
    expect(r.blue1.every(Boolean), 'the bridge is built').toBe(true);
    expect(r.x1, 'he walked across the bridge').toBeGreaterThan(105 * 16);
    expect(r.falls, 'without falling').toBe(0);
    expect(r.milo, 'Milo speaks once, on the video call').toBe(1);
    expect(r.miloCol as number, 'before the build spot').toBeLessThan(97);
    expect(errors).toEqual([]);
  });

  test('8-fort twist: UNDER THE WATER. Fish swim behind the glass, the shark tunnel has moving walkways, and the big tank leaves 24+ tiles of flat open ground before the goal for the boss (the octopus arena, second run)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('8-fort'); k.godMode(); k.clearFoes();
      const info = k.twistInfo(), def = window.KinanLevels.get('8-fort'), H = def.heights;
      /* the longest flat run that ends at the goal */
      let c = def.goal.col, run = 0;
      while (c >= 0 && H[c] === H[def.goal.col]) { c--; run++; }
      /* the arena floor the second run will use (c180-203): nothing in it above the floor */
      const things = [];
      for (let x = 180; x <= 203; x++) for (let y = 0; y < 12; y++) if (k.tile(x, y) !== 0) things.push([x, y, k.tile(x, y)]);
      const candlesIn = (def.candles || []).filter((p) => p[0] >= 180 && p[0] <= 203).length;
      /* the shark tunnel's walkway carries him */
      k.place(60 * 16 + 3, 176); k.step(5, still); const x0 = k.probe().x; k.step(60, still);
      const ride = Math.round(k.probe().x - x0);
      /* and the fish swim while he watches (the backdrop draws them every frame: no page error) */
      k.place(70 * 16 + 3, 176); k.step(600, still);
      return { fish: info.fish, belts: info.belts.length, ride, flatRun: run, goal: def.goal.col, things, candlesIn, arena: 'arena' in def, boss: def.arena ? def.arena.boss : null, arenaCol: def.arena ? def.arena.col : null };
    })()`) as { fish: boolean; belts: number; ride: number; flatRun: number; goal: number; things: unknown[]; candlesIn: number; arena: boolean; boss: string | null; arenaCol: number | null };
    console.log('8-fort: ' + JSON.stringify(r));
    expect(r.fish, 'fish behind the glass').toBe(true);
    expect(r.belts, 'the shark tunnel walkways').toBe(4);
    expect(r.ride, 'the walkway carried him').toBeGreaterThanOrEqual(55);
    expect(r.flatRun, 'flat open ground up to the goal').toBeGreaterThanOrEqual(24 + 10);
    expect(r.things, 'nothing on the future arena floor (c180-203)').toEqual([]);
    expect(r.candlesIn, 'no candles on the future arena floor').toBe(0);
    /* 2026-10-29 (the second run): the arena is in now, on that floor (it was "the boss arena comes in the second run") */
    expect(r.arena, 'the boss arena is in (the second run)').toBe(true);
    expect(r.boss).toBe('octopus');
    expect(r.arenaCol, 'the arena floor is c180-203').toBe(180);
    expect(errors).toEqual([]);
  });

  test('8-6 twist: THE BOATS. A boat drifts back and forth in every water gap, bobbing; Kinan lands on one and it carries him, solid, for 2 s', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('8-6'); k.godMode(); k.clearFoes();
      const info = k.twistInfo();
      const xs = info.movers.map(() => []), ys = info.movers.map(() => []);
      for (let f = 0; f < 400; f++) { k.step(1, still); k.twistInfo().movers.forEach((m, i) => { xs[i].push(m.x); ys[i].push(m.y); }); }
      const span = (a) => Math.round((Math.max(...a) - Math.min(...a)) * 10) / 10;
      /* drop onto the first lagoon's boat (c90-93) and ride it for 2 s */
      const m0 = k.twistInfo().movers[2];
      k.place(m0.x + m0.w / 2 - 5, m0.y - 24); k.step(12, still);
      const on = k.twistInfo().movers[2].riding;
      let rode = 0, offBy = 0;
      const kx = [];
      for (let f = 0; f < 120; f++) {
        const p = k.step(1, still)[0], m = k.twistInfo().movers[2];
        if (m.riding && p.onGround) rode++;
        offBy = Math.max(offBy, Math.abs(m.x + m.w / 2 - (p.x + 5)));
        kx.push(p.x);
      }
      return { kinds: info.movers.map((m) => m.kind), xSpan: xs.map(span), ySpan: ys.map(span), on, rode, offBy: Math.round(offBy * 10) / 10, moved: span(kx), falls: k.levelInfo().falls || 0 };
    })()`) as { kinds: string[]; xSpan: number[]; ySpan: number[]; on: boolean; rode: number; offBy: number; moved: number; falls: number };
    console.log('8-6 boats: ' + JSON.stringify(r));
    expect(r.kinds).toEqual(['boat', 'boat', 'boat', 'boat', 'boat', 'boat', 'boat', 'boat']);
    for (const s of r.xSpan) expect(s, 'each boat drifts across its gap').toBeGreaterThanOrEqual(15);
    for (const s of r.ySpan) expect(s, 'each boat bobs').toBeGreaterThan(1);
    expect(r.on, 'Kinan lands on the boat').toBe(true);
    expect(r.rode, 'it carries him for the whole 2 s').toBe(120);
    expect(r.offBy, 'he moves with it (stays near its middle)').toBeLessThan(6);
    expect(r.moved, 'the boat carried him along').toBeGreaterThan(20);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test('8-secret twist: THE VERTICAL CLIMB. The dev bot climbs the lighthouse landings to the lamp gallery ten tiles over the beach, and on to the goal', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11;
      k.playLevel('8-secret'); k.godMode(); k.clearFoes();
      let top = 999, n = 0;
      for (; n < 4000 && !k.levelInfo().cleared; n++) { k.auto(1, { run: true }); const p = k.probe(); if (p.onGround) top = Math.min(top, p.y); }
      return { top, cleared: k.levelInfo().cleared, gallery: [46, 56].map((c) => k.tile(c, 2)), falls: k.levelInfo().falls || 0 };
    })()`) as { top: number; cleared: boolean; gallery: number[]; falls: number };
    console.log('8-secret climb: ' + JSON.stringify(r));
    expect(r.gallery, 'the lamp gallery is solid stone').toEqual([1, 1]);
    expect(r.top, 'he stood on the lamp gallery (row 2: ten tiles over the beach)').toBe(2 * 16 - 16);
    expect(r.cleared).toBe(true);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test('8-7 twist: SPRINGY AWNINGS. The tall shop is too tall to jump, but its awning bounces Kinan over it; the bike racks are steps', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('8-7'); k.godMode(); k.clearFoes();
      /* a full jump from the street (c84): how high does it get him? */
      k.place(84 * 16 + 3, 176); k.step(10, still);
      let top = 999;
      k.step(1, { jump: true, tapJump: true });
      for (let f = 0; f < 60; f++) { const p = k.step(1, { jump: true })[0]; top = Math.min(top, p.y); }
      const blocked = { x: k.probe().x, top: Math.round(top) };
      /* now drop onto the awning (the spring at c92), JUMP and right held: up and over */
      k.place(92 * 16 + 3, 120);
      let over = false, onRoof = false, peak = 999;
      for (let f = 0; f < 150; f++) {
        const p = k.step(1, { right: f > 20, jump: true })[0];
        peak = Math.min(peak, p.y);
        if (p.onGround && Math.abs(p.y - 80) < 1 && p.x > 93 * 16 - 8 && p.x < 100 * 16) onRoof = true;
        if (p.x > 100 * 16) { over = true; }
        if (onRoof || (over && p.onGround)) break;   /* up: stop there (the next gap is at c113) */
      }
      /* the bike racks: stand on the top one */
      k.place(124 * 16 + 3, 112); k.step(20, still);
      const rack = k.probe();
      return { springs: [14, 92, 146, 212, 237].map((c) => k.tile(c, 11)), shop: k.tile(93, 6), blocked, over, onRoof, peak: Math.round(peak), rack: { y: rack.y, onGround: rack.onGround }, falls: k.levelInfo().falls || 0 };
    })()`) as { springs: number[]; shop: number; blocked: { x: number; top: number }; over: boolean; onRoof: boolean; peak: number; rack: { y: number; onGround: boolean }; falls: number };
    console.log('8-7 awnings: ' + JSON.stringify(r));
    expect(r.springs, 'five springy awnings').toEqual([6, 6, 6, 6, 6]);
    expect(r.shop, 'the tall shop is solid').toBe(1);
    expect(r.blocked.top, 'a full jump from the street never gets his feet up to the roof (y 96): only the awning does').toBeGreaterThan(96 - 16);
    expect(r.peak, 'the awning throws him high').toBeLessThan(80);
    expect(r.onRoof || r.over, 'the awning got him up onto the roof or over the shop').toBe(true);
    expect(r.rack.onGround, 'the top bike rack is a step').toBe(true);
    expect(r.rack.y).toBe(9 * 16 - 16);
    expect(r.falls).toBe(0);
    expect(errors).toEqual([]);
  });

  test('8-8 twist: THE RACCOON GANG (all of World 8). A raccoon grabs a candle and runs instead of hurting; a stomp gives it back, and so does a KICK', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`(() => {
      const k = window.__k11, still = { left: false, right: false, jump: false, fire: false };
      k.playLevel('8-8');
      const gang = k.kickInfo().foes.filter((f) => f.type === 'raccoon').length;
      k.clearFoes();
      k.addCandles(5);
      /* a raccoon walks into Kinan on the first roof (flat at 160, columns 0-13) */
      k.place(4 * 16 + 3, 144); k.step(5, still);
      const got0 = k.levelInfo().got, hp0 = k.levelInfo().hp;
      k.addFoe('raccoon', 7, 9);
      let f = 0;
      while (k.twistInfo().snatched === 0 && f++ < 240) k.step(1, still);
      const after = k.levelInfo(), toast = after.toast, coon = k.kickInfo().foes[0];
      k.step(10, still);
      const coon2 = k.kickInfo().foes[0];
      /* stomp it: drop onto it from above, a little ahead of where it is running */
      const dir = Math.sign(coon2.x - coon.x) || 1;
      for (const lead of [20, 14, 26, 8]) {
        if (!k.kickInfo().foes[0].alive) break;
        const c = k.kickInfo().foes[0];
        k.place(c.x + dir * lead, c.y - 30);
        for (let g = 0; g < 40 && k.kickInfo().foes[0].alive; g++) k.step(1, still);
      }
      const stomped = { got: k.levelInfo().got, alive: k.kickInfo().foes[0].alive, gotBack: k.twistInfo().gotBack };
      /* a second raccoon (on the same roof), then a kick */
      k.clearFoes(); k.place(9 * 16 + 3, 144); k.step(5, still);
      const g2a = k.levelInfo().got;
      k.addFoe('raccoon', 6, 9);
      f = 0; while (k.twistInfo().snatched < 2 && f++ < 400) k.step(1, still);
      const g2b = k.levelInfo().got;
      k.step(3, still);
      const c3 = k.kickInfo().foes[0], right = c3.x > k.probe().x;
      k.place(c3.x + (right ? -12 : 12), 144); k.step(1, { right: right, left: !right });
      const g2c = k.levelInfo().got;
      k.step(1, { tapFire: true }); k.step(20, still);
      return { gang, snatch: k.twistInfo().snatch, got0, hp0, gotAfter: after.got, hpAfter: after.hp, toast, coonVx: coon2.x - coon.x, stomped, g2a, g2b, g2c,
        kicked: { got: k.levelInfo().got, gotBack: k.twistInfo().gotBack, dizzy: k.kickInfo().foes[0].dizzy }, falls: k.levelInfo().falls || 0 };
    })()`) as { gang: number; snatch: boolean; got0: number; hp0: number; gotAfter: number; hpAfter: number; toast: string; coonVx: number; stomped: { got: number; alive: boolean; gotBack: number }; g2a: number; g2b: number; g2c: number; kicked: { got: number; gotBack: number; dizzy: number }; falls: number };
    console.log('8-8 raccoons: ' + JSON.stringify(r));
    expect(r.gang, 'the raccoon gang on the roofs').toBeGreaterThanOrEqual(15);
    expect(r.falls).toBe(0);
    expect(r.snatch).toBe(true);
    expect(r.gotAfter, 'a candle grabbed').toBe(r.got0 - 1);
    expect(r.hpAfter, 'no heart lost').toBe(r.hp0);
    expect(r.toast).toContain('raccoon');
    expect(Math.abs(r.coonVx), 'it runs off fast (2 px a frame, 10 frames)').toBeGreaterThanOrEqual(15);
    expect(r.stomped.alive, 'stomped').toBe(false);
    expect(r.stomped.gotBack, 'the stomp gave the candle back').toBe(1);
    expect(r.stomped.got, 'his count is back up (a roof candle may come along on the drop)').toBeGreaterThanOrEqual(r.got0);
    expect(r.g2b, 'the second raccoon grabbed one').toBe(r.g2a - 1);
    expect(r.kicked.got, 'the kick gave it back').toBe(r.g2c + 1);
    expect(r.kicked.dizzy, 'kicked: dizzy').toBeGreaterThan(0);
    expect(r.kicked.gotBack).toBe(2);
    expect(errors).toEqual([]);
  });

  test('taekwondo boards (World 8): 2-3 bonus boards in the world, each at standing height, never in a boss arena', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((ids) => {
      const w = window as unknown as Win & { __k11: { kickInfo: () => { boards: number[][] } } };
      return ids.filter((id) => !!w.KinanLevels.get(id)).map((id) => { w.__k11.playLevel(id); return { id, boards: w.__k11.kickInfo().boards }; });
    }, W8);
    console.log('World 8 boards: ' + JSON.stringify(r.filter((o) => o.boards.length)));
    const total = r.reduce((s, o) => s + o.boards.length, 0);
    expect(total, 'bonus boards across World 8').toBeGreaterThanOrEqual(2);
    expect(total).toBeLessThanOrEqual(3);
    expect(errors).toEqual([]);
  });
});

/* ---- the map ---- */
async function mapNow(page: Page): Promise<MapState> { return page.evaluate(() => (window as unknown as Win).__k11.mapState()); }
async function settle(page: Page, timeout = 60_000): Promise<MapState> {
  await page.waitForFunction(() => { const k = (window as unknown as Win).__k11 as Dev & { cut: () => { on: boolean } }; const s = k.mapState(); return s.mounted && !s.walking && !s.crossing && !s.busy && !s.banner && !k.cut().on; }, null, { timeout });
  return mapNow(page);
}
/* a save standing on a World 8 stop, every level before it beaten (World 8 opened on the map with owRelease(8)) */
async function seedWorld8(page: Page, at: string): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
  await page.evaluate(({ key, at }) => {
    const w = window as unknown as Win, K = w.KinanLevels, me = K.get(at), beaten: Record<string, number> = {};
    w.__k11.owRelease(8);
    const ids = K.list();
    for (const id of ids) { const d = K.get(id); if (!/secret/.test(id) && (d.world < me.world || (d.world === me.world && d.slot < me.slot))) beaten[id] = 1; }
    localStorage.setItem(key, JSON.stringify({ unlocked: 1, beaten: [], introSeen: true, levelsBeaten: beaten, unlockedLevels: ids.filter((id) => /secret/.test(id) && K.get(id).world < me.world), escapes: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1 }, wmap: { w: 8, at: me.slot - 1 } }));
  }, { key: CURRENT, at });
  await page.reload();
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
}

test.describe('World 8 · on the map', () => {
  test("World 8's map stops are its level files: 8-1 .. 8-5, 8-fort, 8-6, 8-secret, 8-7, 8-8, 8-castle", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await seedWorld8(page, '8-1');
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    expect(s0).toMatchObject({ world: 8, at: 0 });
    expect(s0.stops.slice(0, 10).map((q) => [q.id, q.kind, q.built])).toEqual([
      ['8-1', 'level', true], ['8-2', 'level', true], ['8-3', 'level', true], ['8-4', 'level', true], ['8-5', 'level', true],
      ['8-fort', 'fort', true], ['8-6', 'level', true], ['8-secret', 'secret', true], ['8-7', 'level', true], ['8-8', 'level', true]]);
    expect(s0.stops[10].kind).toBe('boss');
    expect([s0.stops[10].id, s0.stops[10].built], 'the castle stop is 8-castle (the second run)').toEqual(['8-castle', true]);
    expect(s0.stops[0].state).toBe('open');
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe('8-1');
    expect(errors).toEqual([]);
  });

  test("8-6's secret exit (at the old lighthouse): bump the glinting stone, walk through the door -> SECRET LEVEL FOUND! and the 8-secret stop opens", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await seedWorld8(page, '8-6');
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    const secretAt = s0.stops.findIndex((q) => q.kind === 'secret');
    expect(s0.stops[s0.at].id).toBe('8-6');
    expect(s0.stops[secretAt]).toMatchObject({ id: '8-secret', state: 'locked' });
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe('8-6');
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11, def = (window as unknown as Win).KinanLevels.get('8-6');
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
    expect(r.to).toBe('8-secret');
    expect(r.closed!.open).toBe(false);
    expect(r.opened).toBe(true);
    expect(r.toast).toContain('SECRET EXIT FOUND');
    expect(r.unlocked).toContain('8-secret');
    expect(r.returned).toBe(true);
    await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy; });
    const s1 = await mapNow(page);
    expect(s1.notice).toBe('SECRET LEVEL FOUND!');
    expect(s1.stops[secretAt]).toMatchObject({ id: '8-secret', kind: 'secret', state: 'open' });
    expect(s1.celebrate).toBe(secretAt);
    expect(errors).toEqual([]);
  });
});

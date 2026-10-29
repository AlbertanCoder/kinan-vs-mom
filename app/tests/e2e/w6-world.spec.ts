import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* World 6 — Drumheller (2026-10-28). The whole world end to end:
   - every World 6 level file reaches LEVEL CLEAR with the dev bot (auto(30, {run: true}); a best-first search over
     real-input moves for a level auto() can't finish, the same ROUTE b2-boss-arenas.spec.ts uses),
   - 6-7's secret exit (THE CANYON CRACK) opens 6-secret on the map,
   - the fort mini-boss (the magpie flock, 2 phases) and the castle boss (Robo-Rex, 3 phases) follow the B1/B2 rules
     (dumb first, smarter after every hit with a banner, every tell 0.6 s or more, no game over, Glitchy after 5 lost
     fights, a befriend moment, LEVEL CLEAR) and are beaten by __k11.arenaBot through the real input state,
   - beating 5-castle opens World 6 on the map; beating 6-castle plays Glitchy's escape (the tour bus west) and opens
     the way on to World 7 (it showed World 7's "coming soon" sign until World 7 was released, 2026-10-28: see
     w7-world.spec.ts; World 8's sign is checked there),
   - no page errors anywhere. */

const BASE = 'http://127.0.0.1:4174/index.html';
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';
const W6 = ['1', '2', '3', '4', '5', 'fort', '6', '7', 'secret', '8', 'castle'].map((s) => `6-${s}`);

type LogEv = { f: number; ev: string; phase: number; atk?: string; wind?: number; feint?: boolean; real?: boolean; turn?: boolean; hp?: number; n?: number; stolen?: number };
type Boss = { x: number; y: number; w: number; h: number; state: string; t: number; phase: number; hp: number; max: number; cur: string | null; face: number; inv: number; dir: number };
type Arena = {
  kind: string; name: string; state: string; gateL: number; gateR: number; c0: number; cols: number; floorY: number;
  phases: { pattern: string[]; windup: number; rest: number; tired: number; n: number }[]; cp: { x: number; tx: number; ty: number }; cpHit: boolean; helped: boolean; tries: number; glitchy: boolean;
  gates: { L: boolean; R: boolean }; boss: Boss; tell: string; pat: string;
  shots: { kind: string; x: number; y: number; vx: number; roll: boolean; tx: number | null }[]; marks: { x: number; y: number }[]; ring: { x: number } | null;
  built: number[][]; minions: number; log: LogEv[]; line: string | null; lineQ: string[]; voiceLog: string[]; subtitle: string;
  hud: { shown: boolean; name: string; pips: number; live: number };
  px: number; py: number; vx: number; vy: number; onGround: boolean; inv: number; dead: number; hp: number; maxHp: number; deaths: number; frame: number;
  wires?: number; stolen?: number; riding?: boolean;
};
type MapState = { mounted: boolean; busy: boolean; world: number | null; at: number; walking: boolean; crossing: boolean; banner: string | null; notice: string | null; celebrate?: number | null; gate?: number | null; stops: { id: string | null; kind: string; built: boolean; state: string | null }[] };
type Dev = {
  playLevel: (id: string) => unknown;
  levelInfo: () => { id: string | null; cleared: boolean; returned: boolean; toast: string; goal: { tx: number } | null; arena: { kind: string } | null; helperOffer?: boolean; secretExit: { tx: number; ty: number; to: string; open: boolean } | null };
  levels: () => { levels: { id: string; problems: string[]; lint: string[] }[] };
  godMode: () => void;
  clearFoes: () => void;
  place: (x: number, y: number) => unknown;
  step: (n: number, hold?: Record<string, boolean>) => { x: number; y: number; onGround: boolean }[];
  tile: (tx: number, ty: number) => number;
  auto: (n: number, opts?: { run?: boolean }) => unknown;
  arenaInfo: () => Arena | null;
  arenaBot: (n: number) => Arena;
  arenaSetHp: (n: number) => number;
  arenaLines: () => { id: string; who: string; text: string; seconds: number; clip: boolean }[];
  arenaKinds: () => { kind: string; name: string; phases: number; lines: { intro: string[]; retry: string[]; phase: (string | null)[]; first: Record<string, string>; defeat: string[] } }[];
  mapState: () => MapState;
  progress: () => { wmap: { w: number; at: number } | null; levelsBeaten: Record<string, number>; unlockedLevels: string[]; wallet?: number };
  cut: () => { on: boolean; kind: string | null };
  cutSpeed: (n: number) => number;
};
type LevelDef = { id: string; world: number; slot: number; secrets?: { col: number; row: number; exit?: string }[] };
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

/* reach LEVEL CLEAR: auto(30, {run: true}) first (it fights a boss arena too); for a level auto() can't finish, a
   best-first search over short real-input moves from spots Kinan has really stood on (b2-boss-arenas.spec.ts).
   God mode, foes cleared; a move that drops toward a pit is cut off before it kills. */
const ROUTE = `(id) => {
  const k = window.__k11;
  k.playLevel(id); k.godMode(); k.clearFoes();
  let n = 0;
  for (; n < 500 && !k.levelInfo().cleared; n++) k.auto(30, { run: true });
  const a = k.arenaInfo();
  if (k.levelInfo().cleared || a) return { how: 'auto', n, cleared: k.levelInfo().cleared, boss: a ? a.state : null };
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
        if (k.levelInfo().cleared) return { how: 'search', n, tries, cleared: true, boss: null };
        fell = last.y > 236;
        if (!last.onGround) air = true;
        if (m.tap && air && last.onGround) break;
      }
      for (let g = 0; g < 8 && !fell; g++) { last = k.step(1, still)[0]; fell = last.y > 236; }
      if (k.levelInfo().cleared) return { how: 'search', n, tries, cleared: true, boss: null };
      if (fell || !last || !last.onGround || seen.has(key(last))) continue;
      seen.add(key(last)); open.push({ x: last.x, y: last.y });
    }
  }
  return { how: 'none', n, tries, cleared: false, boss: null };
}`;

/* ---- the World 6 bosses ---- */
const ARENAS = [
  { id: '6-fort', kind: 'magpies', phases: 2, windups: [54, 42] },
  { id: '6-castle', kind: 'robo-rex', phases: 3, windups: [52, 42, 36] }
] as const;

/* in the page: load a level and stand Kinan just before the arena's checkpoint flag (foes cleared) */
const TO_ARENA = `(id) => {
  const k = window.__k11;
  k.playLevel(id); k.clearFoes();
  const a = k.arenaInfo();
  k.place(a.cp.x - 6, a.floorY - 18); k.step(20);
  return k.arenaInfo();
}`;

type FightResult = { a: Arena; frames: number; hitsTaken: number; tc: Record<string, number>; cleared: boolean; builtAt2: number; wiresAtHit: number[]; rode: boolean };
const FIGHT = `(src, id) => {
  const k = window.__k11;
  (0, eval)(src)(id);
  let a = k.arenaInfo(), frames = 0, hitsTaken = 0, last = a.hp, builtAt2 = -1, lastHits = 0, rode = false;
  const wiresAtHit = [];
  const tc = { windup: 0, bang: 0, open: 0, stomp: 0, rain: 0, rainMarked: 0, swoop: 0, swoopMarked: 0, sweep: 0, sweepBand: 0, sweeping: 0, sweepingBand: 0, lowOpen: 0, highBusy: 0, busy: 0 };
  while (frames < 20000 && a.state !== 'open') {
    a = k.arenaBot(1); frames++;
    if (a.hp < last) hitsTaken++;
    last = a.hp;
    const b = a.boss, hits = a.log.filter((e) => e.ev === 'hit').length;
    if (hits > lastHits) { wiresAtHit.push(a.wires); lastHits = hits; }
    if (b.phase === 2 && builtAt2 < 0 && b.state === 'pace') builtAt2 = a.built.length;
    if (b.state === 'windup') { tc.windup++; if (a.tell === '!') tc.bang++; }
    if (b.state === 'windup' && b.cur === 'rain') { tc.rain++; if (a.marks.length > 0) tc.rainMarked++; }
    if (b.state === 'windup' && b.cur === 'swoop') { tc.swoop++; if (a.marks.length > 0) tc.swoopMarked++; }
    if (b.state === 'windup' && b.cur === 'sweep') { tc.sweep++; if (a.ring && a.ringW > 40) tc.sweepBand++; }
    if (b.state === 'sweep') { tc.sweeping++; if (a.ring && a.ringW > 40) tc.sweepingBand++; }
    if (b.state === 'tired' || b.state === 'dizzy') {
      tc.open++; if (a.tell === 'STOMP') tc.stomp++;
      if (b.t < 60 && b.y + b.h >= a.floorY - 1) tc.lowOpen++;   /* settled on the floor for the window */
    }
    if (b.state === 'pace' || b.state === 'windup') { tc.busy++; if (b.y + b.h <= a.floorY - 30) tc.highBusy++; }
  }
  for (let n = 0; n < 1500 && !k.levelInfo().cleared; n++) { const x = k.arenaBot(1); if (x.riding) rode = true; }
  return { a: k.arenaInfo(), frames, hitsTaken, tc, cleared: k.levelInfo().cleared, builtAt2, wiresAtHit, rode };
}`;

/* lose the fight on purpose: one heart left, then walk into the boss (a flying one: jump into it from below) */
const LOSE = `(id) => {
  const k = window.__k11;
  let a = k.arenaInfo(), n = 0;
  for (; n < 400 && a.state === 'wait'; n++) a = k.arenaBot(1);
  for (n = 0; n < 400 && !(a.boss.state === 'pace' || a.boss.state === 'windup'); n++) a = k.arenaBot(1);
  const d0 = a.deaths;
  k.arenaSetHp(1);
  for (n = 0; n < 1500 && k.arenaInfo().deaths === d0; n++) {
    const b = k.arenaInfo();
    const toward = b.boss.x + b.boss.w / 2 > b.px + 5;
    const under = Math.abs(b.boss.x + b.boss.w / 2 - b.px - 6) < 14;
    k.step(1, { right: toward, left: !toward, jump: under, tapJump: under && b.onGround });
  }
  k.step(1, { right: false, left: false, jump: false });
  return k.arenaInfo();
}`;

function tellsByPhase(log: LogEv[]): Map<number, number[]> {
  const out = new Map<number, number[]>();
  let wind: LogEv | null = null;
  for (const e of log) {
    if (e.ev === 'windup') wind = e;
    if (e.ev === 'attack' && wind) {
      const list = out.get(e.phase) ?? [];
      list.push(e.f - wind.f);
      out.set(e.phase, list);
      wind = null;
    }
  }
  return out;
}
const mean = (xs: number[]): number => xs.reduce((s, x) => s + x, 0) / xs.length;

test.describe('World 6 · the bosses load, and they are a step up from World 5', () => {
  test('the magpie flock (6-fort) and Robo-Rex (6-castle) load in authored terrain: their boss, phases, the boss door shut, the entry gate open, the checkpoint before it, the goal past it', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const out = await page.evaluate((list) => {
      const k = (window as unknown as Win).__k11;
      const reg = k.levels().levels;
      return list.map((id) => {
        k.playLevel(id);
        const a = k.arenaInfo()!, info = k.levelInfo();
        const door: number[] = [], entry: number[] = [];
        for (let r = 0; r < a.floorY / 16; r++) { door.push(k.tile(a.gateR, r)); entry.push(k.tile(a.gateL, r)); }
        const r = reg.find((x) => x.id === id);
        return { a, info, door, entry, problems: r ? r.problems : ['not registered'], lint: r ? r.lint : [] };
      });
    }, ARENAS.map((x) => x.id));
    for (const [i, lv] of ARENAS.entries()) {
      const o = out[i];
      expect(o.problems, lv.id).toEqual([]);
      expect(o.lint, lv.id).toEqual([]);
      expect(o.a.kind, lv.id).toBe(lv.kind);
      expect(o.a.state, lv.id).toBe('wait');
      expect(o.a.phases.length, lv.id).toBe(lv.phases);          /* castle 3, fort 2 */
      expect(o.a.boss.max, lv.id).toBe(lv.phases);               /* one hit per phase */
      expect(o.a.phases.map((p) => p.windup), lv.id).toEqual([...lv.windups]);
      expect(o.a.cols, lv.id).toBe(24);
      expect(o.a.gates, lv.id).toEqual({ L: false, R: true });
      expect(o.door.every((t) => t === 5), `${lv.id} boss door is a full-height wall`).toBe(true);
      expect(o.entry.every((t) => t === 0), `${lv.id} entry gate open`).toBe(true);
      expect(o.a.cp.tx, lv.id).toBeLessThan(o.a.gateL);
      expect(o.info.goal!.tx, lv.id).toBeGreaterThan(o.a.gateR);
    }
    expect(errors).toEqual([]);
  });

  test('difficulty climbs: the magpie flock is quicker than the Carnival Barker (5-fort), Robo-Rex quicker than Bronco (5-castle), with patterns at least as long', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const ph = await page.evaluate((ids) => {
      const k = (window as unknown as Win).__k11;
      return ids.map((id) => { k.playLevel(id); return k.arenaInfo()!.phases.map((p) => ({ windup: p.windup, rest: p.rest, tired: p.tired, n: p.pattern.length })); });
    }, ['5-fort', '6-fort', '5-castle', '6-castle']);
    const sum = (list: { windup: number; rest: number; tired: number }[]) => list.reduce((s, p) => s + p.windup + p.rest + p.tired, 0);
    const len = (list: { n: number }[]) => list.reduce((s, p) => s + p.n, 0);
    expect(sum(ph[1]), 'fort 6 quicker than fort 5').toBeLessThan(sum(ph[0]));
    expect(len(ph[1]), 'fort 6 patterns at least as long').toBeGreaterThanOrEqual(len(ph[0]));
    expect(sum(ph[3]), 'castle 6 quicker than castle 5').toBeLessThan(sum(ph[2]));
    expect(len(ph[3]), 'castle 6 patterns at least as long').toBeGreaterThanOrEqual(len(ph[2]));
    for (const list of [ph[1], ph[3]]) for (let p = 1; p < list.length; p++) expect(list[p].windup).toBeLessThan(list[p - 1].windup);
    for (const list of ph) for (const p of list) expect(p.windup).toBeGreaterThanOrEqual(36);   /* 0.6 s at 60 fps */
    expect(errors).toEqual([]);
  });

  /* measured like qa7-boss-order.spec.ts measures the castles: the boss bot (it reads only what a kid can see) fights
     from the checkpoint from eight different entries (the helpers hop at random, so more entries than qa7's four).
     It never loses a World 6 fight (the fights stay fair), and Robo-Rex still lands hits on it. Not compared with
     Bronco's count on purpose: every hit the bot takes from Bronco is a row of firework shadows clamped onto one spot
     against the right gate where it stands (or a hit while he turns his charge there) — a World 5 trap the World 6
     bosses don't have (rowFit). "Harder than Bronco" is the numbers test above (shorter tells, rests and naps,
     longer patterns). The entries only step forward from the flag: 6-fort's flag stands one tile past a 5-wide gap,
     so qa7's "16 px further back" entry would start Kinan over the pit */
  test('bot hits over eight entries: never a lost fight against the magpie flock or Robo-Rex, and Robo-Rex still lands hits', async ({ page }) => {
    test.setTimeout(420_000);
    const errors = watchErrors(page);
    await boot(page);
    const ENTRIES: [number, number][] = [[0, 0], [16, 25], [32, 50], [8, 100], [0, 75], [24, 10], [40, 40], [4, 130]];
    const res: Record<string, { hits: number[]; deaths: number; open: boolean }> = {};
    for (const id of ['5-fort', '6-fort', '5-castle', '6-castle']) {
      res[id] = await page.evaluate(({ id, ENTRIES }) => {
        const k = (window as unknown as Win).__k11 as Dev & { storyStop: () => void };
        const hits: number[] = [];
        let deaths = 0, open = true;
        for (const [dx, wait] of ENTRIES) {
          k.playLevel(id); k.clearFoes(); k.storyStop();
          let a = k.arenaInfo()!;
          k.place(a.cp.x - 6 + dx, a.floorY - 18); k.step(20 + wait);
          a = k.arenaInfo()!;
          let last = a.hp, n = 0, f = 0;
          while (f < 20000 && a.state !== 'open') { a = k.arenaBot(1); f++; if (a.hp < last) n++; last = a.hp; }
          hits.push(n); deaths += a.deaths; open = open && a.state === 'open';
        }
        return { hits, deaths, open };
      }, { id, ENTRIES });
    }
    const total = (id: string): number => res[id].hits.reduce((s, n) => s + n, 0);
    console.log('W6 boss order (bot hits over 8 entries): ' + Object.entries(res).map(([id, r]) => `${id} ${total(id)} [${r.hits.join(' ')}]`).join(' · '));
    for (const id of Object.keys(res)) {
      expect(res[id].open, `${id}: every fight won`).toBe(true);
      expect(res[id].deaths, `${id}: never a lost fight`).toBe(0);
    }
    expect(total('6-castle'), 'Robo-Rex is no pushover: he lands hits on the bot').toBeGreaterThanOrEqual(4);
    expect(errors).toEqual([]);
  });
});

test.describe('World 6 · each boss is beaten by a fair scripted run, and gets smarter after each hit', () => {
  for (const lv of ARENAS) {
    test(`${lv.id} (${lv.kind}): a scripted run from the checkpoint beats it with the starting hearts — tells first, smarter every phase, then befriended and LEVEL CLEAR`, async ({ page }) => {
      test.setTimeout(180_000);
      const errors = watchErrors(page);
      await boot(page);
      const r = await page.evaluate(({ fight, src, id }) => (0, eval)(fight)(src, id), { fight: FIGHT, src: TO_ARENA, id: lv.id }) as FightResult;
      const a = r.a, log = a.log;
      const evs = (name: string) => log.filter((e) => e.ev === name);
      console.log(`${lv.id}: beaten in ${r.frames} frames, hits taken ${r.hitsTaken}, deaths ${a.deaths}, tells ${JSON.stringify(r.tc)}, wires ${JSON.stringify(r.wiresAtHit)}, rode ${r.rode}`);
      expect(a.state).toBe('open');
      expect(a.deaths).toBe(0);
      expect(a.boss.state).toBe('friend');
      expect(r.cleared).toBe(true);
      /* one phase per hit; the last hit befriends */
      const hits = evs('hit');
      expect(hits.length).toBe(lv.phases);
      expect(evs('phase').map((e) => e.phase)).toEqual(Array.from({ length: lv.phases - 1 }, (_, i) => i + 2));
      for (let i = 0; i < hits.length - 1; i++) {
        const next = log[log.indexOf(hits[i]) + 1];
        expect(next.ev, 'a hit makes it smarter at once').toBe('phase');
        expect(next.phase).toBe(hits[i].phase + 1);
      }
      expect(log[log.indexOf(hits[hits.length - 1]) + 1].ev).toBe('befriend');
      /* every attack had a wind-up of 0.6 s or more, with the "!" drawn the whole time; the stomp window wears its arrow */
      const tells = tellsByPhase(log);
      const all = [...tells.values()].flat();
      expect(all.length).toBeGreaterThanOrEqual(lv.phases * 2);
      for (const t of all) expect(t).toBeGreaterThanOrEqual(36);
      expect(r.tc.bang).toBe(r.tc.windup);
      expect(r.tc.stomp).toBe(r.tc.open);
      expect(r.tc.rainMarked).toBe(r.tc.rain);
      expect(r.tc.swoopMarked).toBe(r.tc.swoop);                  /* a shadow on the floor for every diving magpie, the whole wind-up */
      expect(r.tc.sweepBand).toBe(r.tc.sweep);                    /* the tail's reach on the floor for the whole wind-up ... */
      expect(r.tc.sweepingBand).toBe(r.tc.sweeping);              /* ... and the sweep itself */
      for (let p = 2; p <= lv.phases; p++) expect(mean(tells.get(p)!), `phase ${p} tells shorter than phase ${p - 1}`).toBeLessThan(mean(tells.get(p - 1)!));
      const atkSet = (p: number) => new Set(evs('attack').filter((e) => e.phase === p).map((e) => e.atk));
      for (let p = 2; p <= lv.phases; p++) expect([...atkSet(p)].some((x) => !atkSet(p - 1).has(x)), `phase ${p} has a new attack`).toBe(true);
      expect(evs('feint').filter((e) => e.phase === 1)).toEqual([]);
      expect(evs('feint').filter((e) => e.phase >= 2).length).toBeGreaterThan(0);
      for (const f of evs('feint')) expect(log[log.indexOf(f) + 1].ev).toBe('stomp');
      /* the befriend moment: the boss's kind words */
      const kinds = await page.evaluate(() => (window as unknown as Win).__k11.arenaKinds());
      const K = kinds.find((x) => x.kind === lv.kind)!;
      for (const id of K.lines.defeat) expect(a.voiceLog, `${lv.kind} said ${id}`).toContain(id);
      for (const id of K.lines.intro) expect(a.voiceLog, `${lv.kind} intro ${id}`).toContain(id);
      if (lv.kind === 'magpies') {
        expect(evs('attack').some((e) => e.atk === 'swoop' && e.phase === 1), 'phase 1: the swoops').toBe(true);
        expect(evs('attack').some((e) => e.atk === 'rain' && e.phase === 2), 'phase 2: the shiny junk on the shadows').toBe(true);
        expect(r.tc.highBusy, 'up in the air while it attacks').toBeGreaterThan(r.tc.busy * 0.8);
        expect(r.tc.lowOpen, 'dips down to the floor for the stomp window').toBeGreaterThan(0);
        expect(a.pat).toBe('STOMP');
      }
      if (lv.kind === 'robo-rex') {
        expect(r.wiresAtHit, 'one wire fixed per hit').toEqual([1, 2, 3]);
        expect(a.wires).toBe(3);
        expect(a.pat).toBe('FIX');
        expect(evs('build').map((e) => e.phase), 'Shad builds the platforms when phase 2 starts').toEqual([2]);
        expect(r.builtAt2).toBe(6);
        expect(evs('attack').some((e) => e.atk === 'wave' && e.phase === 1), 'phase 1: the stomp shockwave').toBe(true);
        expect(evs('attack').some((e) => e.atk === 'sweep' && e.phase === 1), 'phase 1: the tail sweep').toBe(true);
        expect(evs('attack').some((e) => e.atk === 'blow' && e.phase === 2), 'phase 2: the roar').toBe(true);
        expect(evs('attack').some((e) => e.atk === 'charge2' && e.phase === 3), 'phase 3: the charge').toBe(true);
        expect(evs('windup').some((e) => e.atk === 'charge2' && e.turn && e.phase === 3), 'phase 3: the charge turns at the gate with a fresh "!"').toBe(true);
        expect(r.rode, 'befriended, Robo-Rex gives Kinan a ride').toBe(true);
        expect(evs('ride').length).toBe(1);
      }
      expect(errors).toEqual([]);
    });
  }

  test('the magpies grab a candle when a dive lands, and the flock gives every one back when it is befriended', async ({ page }) => {
    test.setTimeout(150_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(({ src }) => {
      const k = (window as unknown as Win).__k11 as Dev & { addCandles: (n: number) => void; state: () => { candles: number } };
      (0, eval)(src)('6-fort');
      k.addCandles(10);
      let a = k.arenaInfo()!;
      for (let n = 0; n < 400 && a.state === 'wait'; n++) a = k.arenaBot(1);
      const c0 = k.state().candles;
      /* stand still on the first shadow: the dive lands on Kinan */
      for (let n = 0; n < 900 && !a.log.some((e) => e.ev === 'steal'); n++) {
        const m = a.marks[0];
        const toward = m ? m.x - (a.px + 6) : 0;
        k.step(1, { right: toward > 3, left: toward < -3 });
        a = k.arenaInfo()!;
      }
      const stolen = a.stolen ?? 0, c1 = k.state().candles;
      for (let n = 0; n < 20000 && a.state !== 'open'; n++) a = k.arenaBot(1);
      return { stolen, c0, c1, c2: k.state().candles, end: a };
    }, { src: TO_ARENA });
    expect(r.stolen).toBe(1);
    expect(r.c1).toBe(r.c0 - 1);
    const give = r.end.log.find((e) => e.ev === 'giveback');
    expect(give, 'the flock gives the candles back').toBeTruthy();
    expect(give!.n).toBeGreaterThanOrEqual(1);
    expect(r.end.stolen).toBe(0);
    expect(r.c2, 'every grabbed candle came back').toBe(r.c0);
    expect(errors).toEqual([]);
  });
});

test.describe('World 6 · no game over in a boss fight, and Glitchy helps after 5 lost fights', () => {
  for (const lv of ARENAS) {
    test(`${lv.id}: the last heart goes back to the arena checkpoint; the boss restarts at full health on re-entry`, async ({ page }) => {
      test.setTimeout(120_000);
      const errors = watchErrors(page);
      await boot(page);
      const r = await page.evaluate(({ src, lose, id }) => {
        const k = (window as unknown as Win).__k11;
        const a0 = (0, eval)(src)(id) as Arena;
        let a = k.arenaInfo()!;
        for (let n = 0; n < 8000 && a.boss.phase < 2; n++) a = k.arenaBot(1);
        for (let n = 0; n < 200 && a.boss.state === 'hurt'; n++) a = k.arenaBot(1);
        const mid = { phase: a.boss.phase, built: a.built.length };
        const lost = (0, eval)(lose)(id) as Arena;
        const info = k.levelInfo() as unknown as { toast: string; dialog: boolean; screen: boolean };
        let again = k.arenaInfo()!;
        for (let n = 0; n < 400 && again.state === 'wait'; n++) again = k.arenaBot(1);
        return { a0, mid, lost, toast: info.toast, dialog: info.dialog, screen: info.screen, again };
      }, { src: TO_ARENA, lose: LOSE, id: lv.id });
      expect(r.mid.phase).toBe(2);
      if (lv.kind === 'robo-rex') expect(r.mid.built).toBe(6);
      expect(r.lost.deaths).toBe(1);
      expect(Math.abs(r.lost.px - r.a0.cp.x), 'back at the arena checkpoint').toBeLessThanOrEqual(2);
      expect(r.lost.hp).toBe(r.lost.maxHp);
      expect(r.lost.state).toBe('wait');
      expect(r.lost.gates).toEqual({ L: false, R: true });
      expect(r.lost.boss).toMatchObject({ phase: 1, hp: lv.phases, state: 'wait' });
      expect(r.lost.built).toEqual([]);
      expect(r.lost.hud.shown).toBe(false);
      expect(r.toast).toContain('checkpoint');
      expect(r.dialog).toBe(false);
      expect(r.screen).toBe(false);
      expect(r.again.state).toBe('fight');
      expect(r.again.tries).toBe(2);
      expect(errors).toEqual([]);
    });
  }

  for (const lv of ARENAS) {
    test(`5 lost fights against ${lv.kind}: Glitchy offers boss help; "Yes" — an extra heart, slower tells; still beatable`, async ({ page }) => {
      test.setTimeout(240_000);
      const errors = watchErrors(page);
      await boot(page);
      const r = await page.evaluate(({ src, lose, id }) => {
        const k = (window as unknown as Win).__k11;
        (0, eval)(src)(id);
        const seen: { deaths: number; offer: boolean }[] = [];
        for (let i = 0; i < 5; i++) {
          const a = (0, eval)(lose)(id) as Arena;
          seen.push({ deaths: a.deaths, offer: !!k.levelInfo().helperOffer });
        }
        return { seen };
      }, { src: TO_ARENA, lose: LOSE, id: lv.id });
      expect(r.seen.map((s) => s.deaths)).toEqual([1, 2, 3, 4, 5]);
      expect(r.seen.slice(0, 4).every((s) => !s.offer)).toBe(true);
      expect(r.seen[4].offer).toBe(true);
      await expect(page.locator('#glitchyAsk')).toBeVisible();
      await expect(page.locator('#glitchyAskText')).toContainText('extra heart');
      await page.locator('#glitchyYes').click();
      await expect(page.locator('#glitchyAsk')).toBeHidden();
      const after = await page.evaluate(() => {
        const k = (window as unknown as Win).__k11;
        const help = k.arenaInfo()!;
        let a = help;
        for (let n = 0; n < 400 && a.state === 'wait'; n++) a = k.arenaBot(1);
        const started = a;
        let frames = 0;
        while (frames < 20000 && a.state !== 'open') { a = k.arenaBot(1); frames++; }
        return { help, started, end: a };
      });
      expect(after.help.helped).toBe(true);
      expect(after.help.maxHp).toBe(4);
      expect(after.started.glitchy).toBe(true);
      const winds = after.end.log.filter((e) => e.ev === 'windup' && e.phase === 1 && e.f > after.started.frame - 5 && !e.real && !e.turn);
      expect(winds.length).toBeGreaterThan(0);
      for (const w of winds) expect(w.wind!).toBeGreaterThan(after.end.phases[0].windup);
      expect(after.end.state).toBe('open');
      expect(errors).toEqual([]);
    });
  }
});

/* ---- the map: World 6 opens after the 5-castle; the 6-castle opens the way west to World 7 (released 2026-10-28) ---- */
type Fly = { kind: string; phase: string; leg: number; legs: number; world: number; home: string; riding: string | null } | null;
type MapS = MapState & { fly: Fly };
type CutS = { on: boolean; mode: string | null; lines: string[] };
async function mapNow(page: Page): Promise<MapS> { return page.evaluate(() => (window as unknown as Win).__k11.mapState() as MapS); }
async function settle(page: Page, timeout = 60_000): Promise<MapS> {
  await page.waitForFunction(() => { const k = (window as unknown as Win).__k11 as Dev & { cut: () => { on: boolean } }; const s = k.mapState(); return s.mounted && !s.walking && !s.crossing && !s.busy && !s.banner && !k.cut().on; }, null, { timeout });
  return mapNow(page);
}
async function seedSave(page: Page, make: string): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
  await page.evaluate(({ key, make }) => {
    const ids = (window as unknown as Win).KinanLevels.list();
    localStorage.setItem(key, JSON.stringify((0, eval)(make)(ids)));
  }, { key: CURRENT, make });
  await page.reload();
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
}
/* in the page: the castle fight from its checkpoint by the boss bot, then on to LEVEL CLEAR and back to the map */
const BEAT_HERE = `() => {
  const k = window.__k11;
  k.clearFoes();
  const a0 = k.arenaInfo(); k.place(a0.cp.x - 6, a0.floorY - 18); k.step(20);
  let a = k.arenaInfo();
  for (let f = 0; f < 20000 && a.state !== 'open'; f++) a = k.arenaBot(1);
  for (let m = 0; m < 1500 && !k.levelInfo().cleared; m++) k.arenaBot(1);
  for (let m = 0; m < 1500 && !k.levelInfo().returned; m++) k.step(1, { right: true });
  return { level: k.levelInfo(), deaths: a.deaths, state: a.state };
}`;

test.describe('World 6 · on the map', () => {
  test('World 6 opens after the 5-castle: the way on is open (no "coming soon" sign), Kinan walks into World 6, and its stops are the eleven level files 6-1 .. 6-8, 6-fort, 6-secret, 6-castle', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = watchErrors(page);
    await seedSave(page, `(ids) => ({ unlocked: 1, beaten: [], introSeen: true, levelsBeaten: Object.fromEntries(ids.filter((id) => Number(id.split('-')[0]) <= 5 && id !== '5-castle').map((id) => [id, 1])), unlockedLevels: ['1-secret', '2-secret', '3-secret', '4-secret', '5-secret'], wmap: { w: 5, at: 10 } })`);
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    expect(s0).toMatchObject({ world: 5, at: 10 });
    expect(s0.stops[10]).toMatchObject({ id: '5-castle', built: true, state: 'open' });
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe('5-castle');
    const r = await page.evaluate(`(${BEAT_HERE})()`) as { level: { cleared: boolean; returned: boolean }; deaths: number; state: string };
    expect(r.state).toBe('open');
    expect(r.level.cleared).toBe(true);
    expect(r.level.returned).toBe(true);
    /* Glitchy escapes into World 6 first; World 5's escape is on foot, as it always was (no ride) */
    await expect(page.locator('#cut')).toBeVisible();
    const rides = new Set<string | null>();
    for (let i = 0; i < 30; i++) { const f = (await mapNow(page)).fly; if (f) rides.add(f.riding); await page.waitForTimeout(80); }
    expect([...rides]).toEqual([null]);
    await page.locator('#cutSkip').click();
    await expect(page.locator('#cut')).toBeHidden();
    const s1 = await settle(page);
    expect(s1.stops[10].state).toBe('beaten');
    expect(s1.gate ?? null).toBeNull();                              /* the World 6 sign is gone */
    expect(s1.notice).toBe('THE WAY ON TO THE NEXT WORLD IS OPEN!');
    await page.locator('#owNext').click();
    await expect.poll(async () => (await mapNow(page)).crossing).toBe(true);
    const s2 = await settle(page);
    expect(s2).toMatchObject({ world: 6, at: 0 });
    expect(await page.evaluate(() => (window as unknown as Win).__k11.progress().wmap)).toEqual({ w: 6, at: 0 });
    expect(s2.stops.map((q) => [q.id, q.kind, q.built])).toEqual([
      ['6-1', 'level', true], ['6-2', 'level', true], ['6-3', 'level', true], ['6-4', 'level', true], ['6-5', 'level', true],
      ['6-fort', 'fort', true], ['6-6', 'level', true], ['6-7', 'level', true], ['6-secret', 'secret', true], ['6-8', 'level', true],
      ['6-castle', 'boss', true]]);
    expect(s2.stops[0].state).toBe('open');
    expect(s2.stops[1].state).toBe('locked');
    /* PLAY on the first stop launches 6-1 */
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe('6-1');
    expect(errors).toEqual([]);
  });

  test('the 6-castle: the exit stays shut until Robo-Rex is fixed; then Glitchy escapes on the tour bus west over the road trip toward World 7, and the way on into World 7 is open', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    await seedSave(page, `(ids) => ({ unlocked: 1, beaten: [], introSeen: true, levelsBeaten: Object.fromEntries(ids.filter((id) => Number(id.split('-')[0]) <= 6 && id !== '6-castle').map((id) => [id, 1])), unlockedLevels: ['1-secret', '2-secret', '3-secret', '4-secret', '5-secret', '6-secret'], escapes: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 }, wmap: { w: 6, at: 10 } })`);
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    expect(s0).toMatchObject({ world: 6, at: 10 });
    expect(s0.stops[10]).toMatchObject({ id: '6-castle', kind: 'boss', built: true, state: 'open' });
    await page.locator('#owNext').click();
    const s1 = await settle(page);
    expect(s1).toMatchObject({ world: 6, at: 10 });                  /* the exit is shut */
    expect(s1.notice).toContain('CASTLE');
    await page.evaluate(() => (window as unknown as Win).__k11.cutSpeed(3));
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe('6-castle');
    const r = await page.evaluate(`(${BEAT_HERE})()`) as { level: { cleared: boolean; returned: boolean }; deaths: number; state: string };
    expect(r.state).toBe('open');
    expect(r.level.cleared).toBe(true);
    expect(r.level.returned).toBe(true);
    /* the escape: Glitchy rides the tour bus out of Drumheller, over the 6.5 road trip, into World 7 */
    await expect.poll(async () => (await page.evaluate(() => (window as unknown as Win).__k11.cut() as unknown as CutS)).mode, { timeout: 15_000, intervals: [100] }).toBe('escape');
    const worlds = new Set<number>(), riding: { world: number; riding: string | null }[] = [];
    for (let i = 0; i < 400; i++) {
      const f = (await mapNow(page)).fly;
      if (!f) break;
      worlds.add(f.world); riding.push({ world: f.world, riding: f.riding });
      expect(f.home).toBe('6:10');                                   /* Kinan stays at the castle */
      await page.waitForTimeout(50);
    }
    expect([...worlds]).toEqual(expect.arrayContaining([6, 6.5, 7]));
    expect(riding.filter((x) => x.world === 6.5).every((x) => x.riding === 'bus'), 'on the road trip he is on the bus').toBe(true);
    expect(riding.some((x) => x.riding === 'bus')).toBe(true);
    await expect.poll(async () => (await page.evaluate(() => (window as unknown as Win).__k11.cut() as unknown as CutS)).on, { timeout: 30_000 }).toBe(false);
    const c = await page.evaluate(() => (window as unknown as Win).__k11.cut() as unknown as CutS);
    expect(c.lines).toEqual(['w06_kinan_12', 'w06_glitchy_02', 'w06_robin_01']);   /* "He's on the tour bus! Through the mountains!" */
    const s2 = await settle(page);
    expect(s2).toMatchObject({ world: 6, at: 10 });
    expect(s2.stops[10].state).toBe('beaten');
    /* 2026-10-28: World 7 is released (OW_RELEASED 7), so the way on is open (it was a "WORLD 7 COMING SOON!" sign:
       that sign moved on past the 7-castle for World 8, w7-world.spec.ts and c1-cutscenes.spec.ts) and leads over the
       6.5 road trip into World 7 */
    expect(s2.notice).toBe('THE WAY ON TO THE NEXT WORLD IS OPEN!');
    expect(s2.gate ?? null).toBeNull();
    expect(await page.evaluate(() => (window as unknown as Win).__k11.progress() as unknown as { escapes: Record<string, number> })).toMatchObject({ escapes: { 6: 1 } });
    await page.locator('#owNext').click();
    await expect.poll(async () => (await mapNow(page)).crossing).toBe(true);
    expect(await settle(page, 90_000)).toMatchObject({ world: 7, at: 0 });
    expect(await page.evaluate(() => (window as unknown as Win).__k11.progress().wmap)).toEqual({ w: 7, at: 0 });
    expect(errors).toEqual([]);
  });

  test("6-7's secret exit (THE CANYON CRACK): bump the glinting rock, walk through the door -> SECRET LEVEL FOUND! and the 6-secret stop opens and sparkles", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await seedSave(page, `(ids) => {
      const K = window.KinanLevels, me = K.get('6-7'), beaten = {};
      for (const id of ids) { const d = K.get(id); if (!/secret/.test(id) && (d.world < me.world || (d.world === me.world && d.slot < me.slot))) beaten[id] = 1; }
      return { unlocked: 1, beaten: [], introSeen: true, levelsBeaten: beaten, unlockedLevels: ids.filter((id) => /secret/.test(id) && K.get(id).world < me.world), escapes: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 }, wmap: { w: 6, at: me.slot - 1 } };
    }`);
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    const secretAt = s0.stops.findIndex((q) => q.kind === 'secret');
    expect(s0.stops[s0.at].id).toBe('6-7');
    expect(s0.stops[secretAt]).toMatchObject({ id: '6-secret', state: 'locked' });
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe('6-7');
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11, def = (window as unknown as Win).KinanLevels.get('6-7');
      const s = (def.secrets || []).find((q) => q.exit)!;
      k.godMode(); k.clearFoes();
      const closed = k.levelInfo().secretExit;
      let fy = s.row + 1; while (fy < 15 && !k.tile(s.col, fy)) fy++;
      for (const dx of [2, -6, 8]) {
        if (k.levelInfo().secretExit!.open) break;
        k.place(s.col * 16 + dx, fy * 16 - 16); k.step(15, {});
        k.step(45, { jump: true, tapJump: true }); k.step(40, { jump: false });
      }
      const X = k.levelInfo().secretExit!;
      if (X.open) { k.place(X.tx * 16 + 3, X.ty * 16); k.step(80, {}); }
      const toast = k.levelInfo().toast;
      for (let n = 0; n < 900 && !k.levelInfo().returned; n++) k.step(1);
      return { to: s.exit, closed, opened: X.open, toast, returned: k.levelInfo().returned, unlocked: k.progress().unlockedLevels };
    });
    expect(r.to).toBe('6-secret');
    expect(r.closed!.open).toBe(false);
    expect(r.opened).toBe(true);
    expect(r.toast).toContain('SECRET EXIT FOUND');
    expect(r.unlocked).toContain('6-secret');
    expect(r.returned).toBe(true);
    await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy; });
    const s1 = await mapNow(page);
    expect(s1.notice).toBe('SECRET LEVEL FOUND!');
    expect(s1.stops[secretAt]).toMatchObject({ id: '6-secret', kind: 'secret', state: 'open' });
    expect(s1.celebrate).toBe(secretAt);
    expect(s1.stops[s0.at].state).toBe('beaten');
    expect(errors).toEqual([]);
  });

  test('World 6 story bubbles: the castle approach says its lines (Shad on the radio, Kinan, Robo-Rex) as subtitles, without recordings', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11 as Dev & { storyInfo: () => { log: { id: string; src: string | null }[]; cur: string | null } };
      k.playLevel('6-castle'); k.godMode(); k.clearFoes();
      const seen: string[] = [];
      for (let n = 0; n < 60; n++) {
        k.auto(10, { run: true });
        const s = k.storyInfo();
        if (s.cur && /^talk_6-castle_/.test(s.cur) && !seen.includes(s.cur)) seen.push(s.cur);
        if (k.arenaInfo()!.state !== 'wait') break;
      }
      const sub = (document.getElementById('storyLine') as HTMLElement).textContent || '';
      return { seen, log: k.storyInfo().log.filter((x) => /^talk_/.test(x.id)), sub };
    });
    expect(r.log.length).toBeGreaterThan(0);
    expect(r.log[0].id).toBe('talk_6-castle_0');
    for (const x of r.log) expect(x.src, 'subtitle only').toBeNull();
    expect(errors).toEqual([]);
  });
});

test.describe('World 6 · every level file', () => {
  test('all 11 World 6 level files are registered, pass the gate, and reach LEVEL CLEAR — the fort and the castle fight their bosses with auto(30, {run: true})', async ({ page }) => {
    test.setTimeout(420_000);
    const errors = watchErrors(page);
    await boot(page);
    const reg = await page.evaluate(() => {
      const w = window as unknown as Win;
      const ids = w.KinanLevels.list().filter((id) => id.startsWith('6-'));
      const lv = w.__k11.levels().levels.filter((x) => x.id.startsWith('6-'));
      return { ids, bad: lv.filter((x) => x.problems.length || x.lint.length) };
    });
    const ids = reg.ids.filter((id) => W6.includes(id));
    const out = await page.evaluate(({ list, route }) => list.map((id) => Object.assign({ id }, (0, eval)(route)(id))), { list: ids, route: ROUTE }) as { id: string; how: string; n: number; tries?: number; cleared: boolean; boss: string | null }[];
    console.log(`W6 LEVEL CLEAR: ` + out.map((o) => `${o.id} ${o.cleared ? 'CLEAR' : 'NOT CLEAR'} ${o.how}${o.how === 'search' ? ' (' + o.tries + ' moves)' : ' n=' + o.n}${o.boss ? ' boss=' + o.boss : ''}`).join(' · '));
    expect([...reg.ids].sort()).toEqual([...W6].sort());
    expect(reg.bad).toEqual([]);
    for (const lv of out) expect(lv.cleared, `${lv.id} (${lv.how})`).toBe(true);
    expect(out.filter((o) => o.boss).map((o) => [o.id, o.boss, o.how]).sort()).toEqual([['6-castle', 'open', 'auto'], ['6-fort', 'open', 'auto']]);
    expect(errors).toEqual([]);
  });
});

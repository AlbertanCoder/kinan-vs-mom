import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* World 7 — Vancouver (2026-10-28). The world end to end (w7-levels.spec.ts covers the level files one by one):
   - the fort mini-boss (the Giant Banana Slug, 2 phases) and the castle boss (Drizzle, 3 phases) follow the B1/B2 rules
     (dumb first, smarter after every hit with a banner, every tell 0.6 s or more, no game over, Glitchy after 5 lost
     fights, a befriend moment, LEVEL CLEAR) and are beaten by __k11.arenaBot through the real input state,
   - Drizzle is never stomped: each hit is Kinan switching on a sun lamp while Drizzle rests; the third lamp is the
     rainbow and the sky clears,
   - 7-castle (THE BIG STORM AT CANADA PLACE) reaches LEVEL CLEAR,
   - beating 6-castle opens World 7 on the map; beating 7-castle plays Glitchy's escape (a parcel on a cargo plane,
     east toward Toronto) and opens the way on to World 8 (it showed World 8's "coming soon" sign until World 8 was
     released, 2026-10-29: see w8-world.spec.ts; World 9's sign is checked there and in c1-cutscenes.spec.ts),
   - 7-6 shows the foam block pickaxe memory, and no page errors anywhere. */

const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';

type LogEv = { f: number; ev: string; phase: number; atk?: string; wind?: number; feint?: boolean; real?: boolean; turn?: boolean; hp?: number; lamp?: boolean };
type Boss = { x: number; y: number; w: number; h: number; state: string; t: number; phase: number; hp: number; max: number; cur: string | null; face: number; inv: number; dir: number };
type Arena = {
  kind: string; name: string; state: string; gateL: number; gateR: number; c0: number; cols: number; floorY: number;
  phases: { pattern: string[]; windup: number; rest: number; tired: number; n: number }[]; cp: { x: number; tx: number; ty: number }; cpHit: boolean; helped: boolean; tries: number; glitchy: boolean;
  gates: { L: boolean; R: boolean }; boss: Boss; tell: string; pat: string;
  shots: { kind: string; x: number; y: number; vx: number; roll: boolean; tx: number | null; friendly: boolean }[]; marks: { x: number; y: number; lane?: number; bolt?: boolean }[]; ring: { x: number } | null;
  built: number[][]; minions: number; log: LogEv[]; line: string | null; lineQ: string[]; voiceLog: string[]; subtitle: string;
  hud: { shown: boolean; name: string; pips: number; live: number };
  px: number; py: number; vx: number; vy: number; onGround: boolean; inv: number; dead: number; hp: number; maxHp: number; deaths: number; frame: number;
  lamps: { x: number; lit: boolean }[]; sunny: boolean; flowers: number; umbrella: boolean; slime: number; napped: boolean;
};
type MapState = { mounted: boolean; busy: boolean; world: number | null; at: number; walking: boolean; crossing: boolean; banner: string | null; notice: string | null; celebrate?: number | null; gate?: number | null; stops: { id: string | null; kind: string; built: boolean; state: string | null }[] };
type Dev = {
  playLevel: (id: string) => unknown;
  levelInfo: () => { id: string | null; cleared: boolean; returned: boolean; toast: string; goal: { tx: number } | null; arena: { kind: string } | null; helperOffer?: boolean };
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
  arenaKinds: () => { kind: string; name: string; phases: number; lines: { intro: string[]; retry: string[]; phase: (string | null)[]; first: Record<string, string>; defeat: string[] } }[];
  mapState: () => MapState;
  progress: () => { wmap: { w: number; at: number } | null; levelsBeaten: Record<string, number>; unlockedLevels: string[] };
  cut: () => { on: boolean; kind: string | null };
  cutSpeed: (n: number) => number;
};
type Win = { __k11: Dev; KinanLevels: { ready: boolean; list: () => string[]; get: (id: string) => { id: string; world: number; slot: number; talk?: [number, string, string, number?][] } } };

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

/* ---- the World 7 bosses ---- */
const ARENAS = [
  { id: '7-fort', kind: 'banana-slug', phases: 2, windups: [52, 40] },
  { id: '7-castle', kind: 'drizzle', phases: 3, windups: [50, 40, 36] }
] as const;

/* in the page: load a level and stand Kinan just before the arena's checkpoint flag (foes cleared) */
const TO_ARENA = `(id) => {
  const k = window.__k11;
  k.playLevel(id); k.clearFoes();
  const a = k.arenaInfo();
  k.place(a.cp.x - 6, a.floorY - 18); k.step(20);
  return k.arenaInfo();
}`;

type FightResult = { a: Arena; frames: number; hitsTaken: number; tc: Record<string, number>; cleared: boolean; litAtHit: number[]; tallOpen: number; maxSlime: number; umbrellaSeen: boolean; napped: boolean };
const FIGHT = `(src, id) => {
  const k = window.__k11;
  (0, eval)(src)(id);
  let a = k.arenaInfo(), frames = 0, hitsTaken = 0, last = a.hp, lastHits = 0, tallOpen = 0, maxSlime = 0, umbrellaSeen = false;
  const litAtHit = [];
  const tc = { windup: 0, bang: 0, open: 0, stomp: 0, lamp: 0, rain: 0, rainMarked: 0, slam: 0, slamRing: 0, lanes: 0, lanesMarked: 0, pour: 0, pourMarked: 0,
    bolt: 0, boltMarked: 0, lowOpen: 0, highBusy: 0, busy: 0, curl: 0, curlLow: 0 };
  while (frames < 20000 && a.state !== 'open') {
    a = k.arenaBot(1); frames++;
    if (a.hp < last) hitsTaken++;
    last = a.hp;
    const b = a.boss, hits = a.log.filter((e) => e.ev === 'hit').length;
    if (hits > lastHits) { litAtHit.push(a.lamps.filter((l) => l.lit).length); lastHits = hits; }
    maxSlime = Math.max(maxSlime, a.slime);
    if (a.umbrella || a.shots.some((s) => s.kind === 'umbrella')) umbrellaSeen = true;
    if (b.state === 'windup') { tc.windup++; if (a.tell === '!') tc.bang++; }
    if (b.state === 'windup' && b.cur === 'rain') { tc.rain++; if (a.marks.length > 0) tc.rainMarked++; }
    if (b.state === 'windup' && b.cur === 'slam') { tc.slam++; if (a.ring) tc.slamRing++; }
    if (b.state === 'windup' && b.cur === 'lanes') { tc.lanes++; if (a.marks.length > 0 && a.marks.every((m) => m.lane)) tc.lanesMarked++; }
    if (b.state === 'pour') { tc.pour++; if (a.marks.length > 0 && a.marks.every((m) => m.lane)) tc.pourMarked++; }
    if (b.state === 'windup' && b.cur === 'bolt') { tc.bolt++; if (a.marks.length > 0 && a.marks.every((m) => m.bolt)) tc.boltMarked++; }
    if (b.state === 'charge' && b.cur === 'curl') { tc.curl++; if (b.h <= 20) tc.curlLow++; }
    if (b.state === 'tired' || b.state === 'dizzy') {
      tc.open++; if (a.tell === 'STOMP') tc.stomp++; if (a.tell === 'LAMP') tc.lamp++;
      if (b.h > 18) tallOpen++;
      if (b.t < 60 && b.y + b.h >= a.floorY - 1) tc.lowOpen++;
    }
    if (b.state === 'pace' || b.state === 'windup') { tc.busy++; if (b.y + b.h <= a.floorY - 30) tc.highBusy++; }
  }
  let napped = false;
  for (let n = 0; n < 1500 && !k.levelInfo().cleared; n++) { const x = k.arenaBot(1); if (x.napped) napped = true; }
  for (let n = 0; n < 900 && !napped && id === '7-fort'; n++) { const x = k.arenaBot(1); if (x.napped) napped = true; }
  return { a: k.arenaInfo(), frames, hitsTaken, tc, cleared: k.levelInfo().cleared, litAtHit, tallOpen, maxSlime, umbrellaSeen, napped };
}`;

/* lose the fight on purpose: one heart left, then into the danger (the slug: walk into it; Drizzle is a soft cloud,
   so stand in its rain lanes and on its lightning targets) */
const LOSE = `(id) => {
  const k = window.__k11;
  let a = k.arenaInfo(), n = 0;
  for (; n < 400 && a.state === 'wait'; n++) a = k.arenaBot(1);
  for (n = 0; n < 400 && !(a.boss.state === 'pace' || a.boss.state === 'windup'); n++) a = k.arenaBot(1);
  const d0 = a.deaths;
  k.arenaSetHp(1);
  for (n = 0; n < 3000 && k.arenaInfo().deaths === d0; n++) {
    const b = k.arenaInfo();
    const m = b.marks.find((q) => q.lane || q.bolt) || b.marks[0];
    const target = b.kind === 'drizzle' ? (m ? m.x : b.px + 6) : b.boss.x + b.boss.w / 2;
    const toward = target > b.px + 7, away = target < b.px + 5;
    const under = b.kind !== 'drizzle' && Math.abs(b.boss.x + b.boss.w / 2 - b.px - 6) < 14;
    k.step(1, { right: toward, left: away && !toward, jump: under, tapJump: under && b.onGround });
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

test.describe('World 7 · the bosses load, and they are a step up from World 6', () => {
  test('the Giant Banana Slug (7-fort) and Drizzle (7-castle) load in authored terrain: their boss, phases, the boss door shut, the entry gate open, the checkpoint before it, the goal past it', async ({ page }) => {
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
    /* Drizzle's three sun lamps stand on the pier inside the arena, all dark at the start */
    const d = out[1].a;
    expect(d.lamps.length).toBe(3);
    for (const l of d.lamps) { expect(l.lit).toBe(false); expect(l.x).toBeGreaterThan((d.gateL + 1) * 16); expect(l.x).toBeLessThan(d.gateR * 16); }
    expect(d.pat).toBe('SUN LAMP');
    expect(errors).toEqual([]);
  });

  test('difficulty climbs: the Giant Banana Slug is quicker than the magpie flock (6-fort), Drizzle quicker than Robo-Rex (6-castle), with patterns at least as long', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const ph = await page.evaluate((ids) => {
      const k = (window as unknown as Win).__k11;
      return ids.map((id) => { k.playLevel(id); return k.arenaInfo()!.phases.map((p) => ({ windup: p.windup, rest: p.rest, tired: p.tired, n: p.pattern.length })); });
    }, ['6-fort', '7-fort', '6-castle', '7-castle']);
    const sum = (list: { windup: number; rest: number; tired: number }[]) => list.reduce((s, p) => s + p.windup + p.rest + p.tired, 0);
    const len = (list: { n: number }[]) => list.reduce((s, p) => s + p.n, 0);
    expect(sum(ph[1]), 'fort 7 quicker than fort 6').toBeLessThan(sum(ph[0]));
    expect(len(ph[1]), 'fort 7 patterns at least as long').toBeGreaterThanOrEqual(len(ph[0]));
    expect(sum(ph[3]), 'castle 7 quicker than castle 6').toBeLessThan(sum(ph[2]));
    expect(len(ph[3]), 'castle 7 patterns at least as long').toBeGreaterThanOrEqual(len(ph[2]));
    for (let p = 0; p < ph[1].length; p++) expect(ph[1][p].windup, 'each fort 7 tell a little shorter than fort 6').toBeLessThan(ph[0][p].windup);
    for (let p = 0; p < 2; p++) expect(ph[3][p].windup, 'castle 7 tells a little shorter than castle 6 (the last is at the 0.6 s floor)').toBeLessThan(ph[2][p].windup);
    for (const list of [ph[1], ph[3]]) for (let p = 1; p < list.length; p++) expect(list[p].windup).toBeLessThan(list[p - 1].windup);
    for (const list of ph) for (const p of list) expect(p.windup).toBeGreaterThanOrEqual(36);   /* 0.6 s at 60 fps */
    expect(errors).toEqual([]);
  });

  /* the boss bot (it reads only what a kid can see) fights from the checkpoint from eight different entries, as
     w6-world.spec.ts measures World 6. It never loses a World 7 fight (the fights stay fair), and Drizzle still lands
     hits on it (it is no pushover). The World 6 bosses run alongside for the log line only. */
  test('bot hits over eight entries: never a lost fight against the Giant Banana Slug or Drizzle, and Drizzle still lands hits', async ({ page }) => {
    test.setTimeout(420_000);
    const errors = watchErrors(page);
    await boot(page);
    const ENTRIES: [number, number][] = [[0, 0], [16, 25], [32, 50], [8, 100], [0, 75], [24, 10], [40, 40], [4, 130]];
    const res: Record<string, { hits: number[]; deaths: number; open: boolean }> = {};
    for (const id of ['6-fort', '7-fort', '6-castle', '7-castle']) {
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
    console.log('W7 boss order (bot hits over 8 entries): ' + Object.entries(res).map(([id, r]) => `${id} ${total(id)} [${r.hits.join(' ')}]`).join(' · '));
    for (const id of ['7-fort', '7-castle']) {
      expect(res[id].open, `${id}: every fight won`).toBe(true);
      expect(res[id].deaths, `${id}: never a lost fight`).toBe(0);
    }
    expect(total('7-castle'), 'Drizzle is no pushover: the rain lands on the bot').toBeGreaterThanOrEqual(4);
    expect(errors).toEqual([]);
  });
});

test.describe('World 7 · each boss is beaten by a fair scripted run, and gets smarter after each hit', () => {
  for (const lv of ARENAS) {
    test(`${lv.id} (${lv.kind}): a scripted run from the checkpoint beats it with the starting hearts — tells first, smarter every phase, then befriended and LEVEL CLEAR`, async ({ page }) => {
      test.setTimeout(180_000);
      const errors = watchErrors(page);
      await boot(page);
      const r = await page.evaluate(({ fight, src, id }) => (0, eval)(fight)(src, id), { fight: FIGHT, src: TO_ARENA, id: lv.id }) as FightResult;
      const a = r.a, log = a.log;
      const evs = (name: string) => log.filter((e) => e.ev === name);
      console.log(`${lv.id}: beaten in ${r.frames} frames, hits taken ${r.hitsTaken}, deaths ${a.deaths}, tells ${JSON.stringify(r.tc)}, lamps ${JSON.stringify(r.litAtHit)}, slime ${r.maxSlime}, napped ${r.napped}`);
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
      /* every attack had a wind-up of 0.6 s or more, with the "!" drawn the whole time; its floor marks the whole time */
      const tells = tellsByPhase(log);
      const all = [...tells.values()].flat();
      expect(all.length).toBeGreaterThanOrEqual(lv.phases * 2);
      for (const t of all) expect(t).toBeGreaterThanOrEqual(36);
      expect(r.tc.bang).toBe(r.tc.windup);
      expect(r.tc.rainMarked).toBe(r.tc.rain);
      expect(r.tc.slamRing).toBe(r.tc.slam);                      /* the slug's lunge: its red ring the whole wind-up */
      expect(r.tc.lanesMarked).toBe(r.tc.lanes);                  /* a rain lane's drips the whole wind-up ... */
      expect(r.tc.pourMarked).toBe(r.tc.pour);                    /* ... and while it pours */
      expect(r.tc.boltMarked).toBe(r.tc.bolt);                    /* lightning: its flashing target the whole wind-up */
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
      if (lv.kind === 'banana-slug') {
        expect(r.tc.stomp).toBe(r.tc.open);                       /* the stomp window wears its arrow */
        expect(a.pat).toBe('STOMP');
        expect(evs('attack').some((e) => e.atk === 'slam' && e.phase === 1), 'phase 1: the lunge').toBe(true);
        expect(evs('attack').some((e) => e.atk === 'curl' && e.phase === 1), 'phase 1: the roll').toBe(true);
        expect(evs('attack').some((e) => e.atk === 'rain' && e.phase === 2), 'phase 2: the slime spit').toBe(true);
        expect(r.tc.curlLow, 'curled up into a ball while it rolls').toBe(r.tc.curl);
        expect(r.tc.curl).toBeGreaterThan(0);
        expect(r.tallOpen, 'it stretches up to catch its breath: its head is the soft spot').toBe(r.tc.open);
        expect(r.maxSlime, 'slippery slime on the floor').toBeGreaterThan(0);
        expect(hits.every((h) => !h.lamp)).toBe(true);
        expect(r.napped, 'befriended, it slides off to nap in the cedars').toBe(true);
      }
      if (lv.kind === 'drizzle') {
        expect(r.tc.lamp, 'while Drizzle rests the arrow points at a sun lamp').toBe(r.tc.open);
        expect(r.tc.stomp, 'never a STOMP arrow on Drizzle').toBe(0);
        expect(a.pat).toBe('SUN LAMP');
        expect(hits.every((h) => h.lamp), 'every hit is a sun lamp switched on, never a stomp').toBe(true);
        expect(r.litAtHit, 'one lamp per hit').toEqual([1, 2, 3]);
        expect(a.lamps.every((l) => l.lit)).toBe(true);
        expect(a.sunny, 'the third lamp: the rainbow, and the sky clears').toBe(true);
        expect(evs('rainbow').length).toBe(1);
        expect(evs('attack').some((e) => e.atk === 'lanes' && e.phase === 1), 'phase 1: the rain lanes').toBe(true);
        expect(evs('attack').some((e) => e.atk === 'blow' && e.phase === 2), 'phase 2: the gusts').toBe(true);
        expect(evs('attack').some((e) => e.atk === 'bolt' && e.phase === 3), 'phase 3: the warned lightning').toBe(true);
        expect(evs('attack').some((e) => e.atk === 'bolt' && e.phase < 3), 'no lightning before phase 3').toBe(false);
        expect(r.umbrellaSeen, 'an umbrella comes down for the gusts').toBe(true);
        expect(r.tc.highBusy, 'Drizzle floats up over the harbour').toBe(r.tc.busy);
        expect(r.tc.lowOpen, 'Drizzle never comes down to the floor (nobody stomps it)').toBe(0);
        expect(r.tc.boltMarked).toBeGreaterThan(0);
      }
      expect(errors).toEqual([]);
    });
  }
});

test.describe('World 7 · no game over in a boss fight, and Glitchy helps after 5 lost fights', () => {
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
        const mid = { phase: a.boss.phase, lit: a.lamps.filter((l) => l.lit).length };
        const lost = (0, eval)(lose)(id) as Arena;
        const info = k.levelInfo() as unknown as { toast: string; dialog: boolean; screen: boolean };
        let again = k.arenaInfo()!;
        for (let n = 0; n < 400 && again.state === 'wait'; n++) again = k.arenaBot(1);
        return { a0, mid, lost, toast: info.toast, dialog: info.dialog, screen: info.screen, again };
      }, { src: TO_ARENA, lose: LOSE, id: lv.id });
      expect(r.mid.phase).toBe(2);
      if (lv.kind === 'drizzle') expect(r.mid.lit).toBe(1);
      expect(r.lost.deaths).toBe(1);
      expect(Math.abs(r.lost.px - r.a0.cp.x), 'back at the arena checkpoint').toBeLessThanOrEqual(2);
      expect(r.lost.hp).toBe(r.lost.maxHp);
      expect(r.lost.state).toBe('wait');
      expect(r.lost.gates).toEqual({ L: false, R: true });
      expect(r.lost.boss).toMatchObject({ phase: 1, hp: lv.phases, state: 'wait' });
      expect(r.lost.lamps.every((l) => !l.lit), 'the lamps go dark again').toBe(true);
      expect(r.lost.slime, 'the slime dries up').toBe(0);
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

/* ---- the map: World 7 opens after the 6-castle; the 7-castle opens the way east into World 8 (released 2026-10-29) ---- */
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

test.describe('World 7 · on the map', () => {
  test('World 7 opens after the 6-castle: no "coming soon" sign, Kinan crosses into World 7, and its stops are the eleven level files 7-1 .. 7-8, 7-fort, 7-secret, 7-castle', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    await seedSave(page, `(ids) => ({ unlocked: 1, beaten: [], introSeen: true, levelsBeaten: Object.fromEntries(ids.filter((id) => Number(id.split('-')[0]) <= 6 && id !== '6-castle').map((id) => [id, 1])), unlockedLevels: ['1-secret', '2-secret', '3-secret', '4-secret', '5-secret', '6-secret'], escapes: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 }, wmap: { w: 6, at: 10 } })`);
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    expect(s0).toMatchObject({ world: 6, at: 10 });
    expect(s0.stops[10]).toMatchObject({ id: '6-castle', built: true, state: 'open' });
    await page.evaluate(() => (window as unknown as Win).__k11.cutSpeed(3));
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe('6-castle');
    const r = await page.evaluate(`(${BEAT_HERE})()`) as { level: { cleared: boolean; returned: boolean }; deaths: number; state: string };
    expect(r.state).toBe('open');
    expect(r.level.cleared).toBe(true);
    expect(r.level.returned).toBe(true);
    /* Glitchy escapes on the tour bus first (World 6's escape, unchanged) */
    await expect.poll(async () => (await page.evaluate(() => (window as unknown as Win).__k11.cut() as unknown as CutS)).mode, { timeout: 15_000, intervals: [100] }).toBe('escape');
    await page.locator('#cutSkip').click();
    await expect(page.locator('#cut')).toBeHidden();
    const s1 = await settle(page);
    expect(s1.stops[10].state).toBe('beaten');
    expect(s1.gate ?? null).toBeNull();                              /* the World 7 sign is gone */
    expect(s1.notice).toBe('THE WAY ON TO THE NEXT WORLD IS OPEN!');
    await page.locator('#owNext').click();
    await expect.poll(async () => (await mapNow(page)).crossing).toBe(true);
    const s2 = await settle(page, 90_000);
    expect(s2.world).toBe(7);
    expect(s2.at).toBe(0);
    expect(s2.stops.map((q) => [q.id, q.kind, q.built])).toEqual([
      ['7-1', 'level', true], ['7-2', 'level', true], ['7-3', 'level', true], ['7-4', 'level', true], ['7-5', 'level', true],
      ['7-fort', 'fort', true], ['7-secret', 'secret', true], ['7-6', 'level', true], ['7-7', 'level', true], ['7-8', 'level', true],
      ['7-castle', 'boss', true]]);
    expect(s2.stops[0].state).toBe('open');
    expect(s2.stops[1].state).toBe('locked');
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe('7-1');
    expect(errors).toEqual([]);
  });

  /* 2026-10-29: World 8 is released (OW_RELEASED 8), so the way on is open (it was a "WORLD 8 COMING SOON!" sign: that
     sign moved on past the 8-castle for World 9, w8-world.spec.ts and c1-cutscenes.spec.ts) and leads into World 8 */
  test('the 7-castle: the exit stays shut until Drizzle is befriended; then Glitchy hides in a parcel on a cargo plane east toward World 8, and the way on into World 8 is open', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    await seedSave(page, `(ids) => ({ unlocked: 1, beaten: [], introSeen: true, levelsBeaten: Object.fromEntries(ids.filter((id) => Number(id.split('-')[0]) <= 7 && id !== '7-castle').map((id) => [id, 1])), unlockedLevels: ['1-secret', '2-secret', '3-secret', '4-secret', '5-secret', '6-secret', '7-secret'], escapes: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 }, wmap: { w: 7, at: 10 } })`);
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    expect(s0).toMatchObject({ world: 7, at: 10 });
    expect(s0.stops[10]).toMatchObject({ id: '7-castle', kind: 'boss', built: true, state: 'open' });
    await page.locator('#owNext').click();
    const s1 = await settle(page);
    expect(s1).toMatchObject({ world: 7, at: 10 });                  /* the exit is shut */
    expect(s1.notice).toContain('CASTLE');
    await page.evaluate(() => (window as unknown as Win).__k11.cutSpeed(3));
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe('7-castle');
    const r = await page.evaluate(`(${BEAT_HERE})()`) as { level: { cleared: boolean; returned: boolean }; deaths: number; state: string };
    expect(r.state).toBe('open');
    expect(r.level.cleared).toBe(true);
    expect(r.level.returned).toBe(true);
    /* the escape: Glitchy climbs into a parcel, the cargo plane flies it out of Vancouver over the seam into World 8 */
    await expect.poll(async () => (await page.evaluate(() => (window as unknown as Win).__k11.cut() as unknown as CutS)).mode, { timeout: 15_000, intervals: [100] }).toBe('escape');
    const worlds = new Set<number>(), riding: { world: number; riding: string | null; phase: string }[] = [];
    for (let i = 0; i < 400; i++) {
      const f = (await mapNow(page)).fly;
      if (!f) break;
      worlds.add(f.world); riding.push({ world: f.world, riding: f.riding, phase: f.phase });
      expect(f.home).toBe('7:10');                                   /* Kinan stays at the castle */
      await page.waitForTimeout(50);
    }
    expect([...worlds]).toEqual(expect.arrayContaining([7, 8]));
    expect(riding.some((x) => x.riding === 'cargo'), 'the parcel rides the cargo plane').toBe(true);
    expect(riding.filter((x) => x.riding).every((x) => x.riding === 'cargo')).toBe(true);
    await expect.poll(async () => (await page.evaluate(() => (window as unknown as Win).__k11.cut() as unknown as CutS)).on, { timeout: 30_000 }).toBe(false);
    const c = await page.evaluate(() => (window as unknown as Win).__k11.cut() as unknown as CutS);
    expect(c.lines).toEqual(['w07_shad_04', 'w07_glitchy_01', 'w07_robin_03']);   /* "He's hiding in a parcel... on a cargo plane!" */
    const s2 = await settle(page);
    expect(s2).toMatchObject({ world: 7, at: 10 });
    expect(s2.stops[10].state).toBe('beaten');
    expect(s2.gate ?? null).toBeNull();                              /* no World 8 sign any more */
    expect(s2.notice).toBe('THE WAY ON TO THE NEXT WORLD IS OPEN!');
    expect(await page.evaluate(() => (window as unknown as Win).__k11.progress() as unknown as { escapes: Record<string, number> })).toMatchObject({ escapes: { 7: 1 } });
    await page.locator('#owNext').click();
    await expect.poll(async () => (await mapNow(page)).crossing).toBe(true);
    expect(await settle(page, 90_000)).toMatchObject({ world: 8, at: 0 });
    expect(await page.evaluate(() => (window as unknown as Win).__k11.progress().wmap)).toEqual({ w: 8, at: 0 });
    expect(errors).toEqual([]);
  });

  test('World 7 story bubbles: the castle approach says its lines (Shad on the radio, Kinan, Drizzle) as subtitles, without recordings', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11 as Dev & { storyInfo: () => { log: { id: string; src: string | null }[]; cur: string | null; queue: string[] } };
      k.playLevel('7-castle'); k.godMode(); k.clearFoes();
      const seen = new Set<string>();
      for (let n = 0; n < 60; n++) {
        k.auto(10, { run: true });
        const s = k.storyInfo();
        for (const id of [s.cur, ...s.queue]) if (id && /^talk_7-castle_/.test(id)) seen.add(id);
        if (k.arenaInfo()!.state !== 'wait') break;
      }
      return { seen: [...seen], log: k.storyInfo().log.filter((x) => /^talk_/.test(x.id)) };
    });
    /* every one of the castle's nine bubbles comes up as Kinan passes its column (the bot runs faster than they can
       all be said: the ones still waiting are dropped when the fight starts, as in every arena level) */
    expect(r.seen.length).toBe(9);
    expect(r.log.length).toBeGreaterThan(0);
    expect(r.log[0].id).toBe('talk_7-castle_0');
    for (const x of r.log) expect(x.src, 'subtitle only').toBeNull();
    expect(errors).toEqual([]);
  });
});

test.describe('World 7 · the memory gift', () => {
  test("7-6 Granville Island: at the kids market's toy stall Kinan remembers the foam block pickaxe (story bible, age 7) in a story bubble", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const w = window as unknown as Win;
      const k = w.__k11 as Dev & { storyInfo: () => { cur: string | null; queue: string[] } };
      const talk = w.KinanLevels.get('7-6').talk || [];
      const at = talk.findIndex((t) => /foam block pickaxe/.test(t[2]));
      k.playLevel('7-6'); k.godMode(); k.clearFoes();
      const seen = new Set<string>();
      for (let n = 0; n < 200 && !k.levelInfo().cleared; n++) {
        k.auto(10, { run: true });
        const s = k.storyInfo();
        for (const id of [s.cur, ...s.queue]) if (id) seen.add(id);
      }
      return { at, line: at >= 0 ? talk[at] : null, seen: [...seen], cleared: k.levelInfo().cleared };
    });
    expect(r.at, 'the pickaxe line is in 7-6').toBeGreaterThanOrEqual(0);
    expect(r.line![1]).toBe('KINAN');
    expect(r.line![2]).toContain('toy stall');
    expect(r.seen, 'it comes up on the way through').toContain(`talk_7-6_${r.at}`);
    expect(r.cleared).toBe(true);
    expect(errors).toEqual([]);
  });
});

test.describe('World 7 · the fort and the castle with the dev bot', () => {
  test('7-fort and 7-castle reach LEVEL CLEAR with auto(30, {run: true}), fighting their bosses on the way', async ({ page }) => {
    test.setTimeout(300_000);
    const errors = watchErrors(page);
    await boot(page);
    const out = await page.evaluate((list) => list.map((id) => {
      const k = (window as unknown as Win).__k11;
      k.playLevel(id); k.godMode(); k.clearFoes();
      let n = 0;
      for (; n < 500 && !k.levelInfo().cleared; n++) k.auto(30, { run: true });
      const a = k.arenaInfo();
      return { id, n, cleared: k.levelInfo().cleared, boss: a ? a.state : null };
    }), ['7-fort', '7-castle']);
    console.log('W7 fort + castle: ' + out.map((o) => `${o.id} ${o.cleared ? 'CLEAR' : 'NOT CLEAR'} n=${o.n} boss=${o.boss}`).join(' · '));
    for (const o of out) { expect(o.cleared, o.id).toBe(true); expect(o.boss, o.id).toBe('open'); }
    expect(errors).toEqual([]);
  });
});

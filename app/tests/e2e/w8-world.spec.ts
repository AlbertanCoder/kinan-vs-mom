import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* World 8 — Toronto (2026-10-29, the second run). The world end to end (w8-levels.spec.ts covers the level files):
   - the fort mini-boss (the Big Octopus, 2 phases) and the castle boss (the Raccoon King, 3 phases) follow the B1/B2
     rules (dumb first, smarter after every hit with a banner, every tell 0.6 s or more, no game over, Glitchy after 5
     lost fights, a befriend moment, LEVEL CLEAR) and are beaten by __k11.arenaBot through the real input state,
   - the Raccoon King is never stomped: each hit is Kinan offering him a shiny bottle cap while he rests; the third cap
     is the trade,
   - the KICK never hurts either boss (it bats the octopus's ink blobs back: they splat on it harmlessly),
   - 8-castle (CASA LOMA) reaches LEVEL CLEAR,
   - beating 7-castle opens World 8 on the map; beating 8-castle plays Glitchy's escape (a hockey bag on the train east
     to Montreal), then Sabumnim's belt scene (red belt, 2 stripes), and the way on is World 9's "coming soon" sign,
   - 8-castle's treasure room shows the moving-day box memory,
   - every World 8 level wears its own Toronto look (index.html TO_LOOKS 100-109; none borrows another world's), 8-2's
     viaduct opens onto the sky, and Milo's line in 8-5 is labelled MILO in the gold every name uses, with his face in a
     little video-call window while he talks, and no page errors anywhere. */

const BASE = 'http://127.0.0.1:4174/index.html';
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';

type LogEv = { f: number; ev: string; phase: number; atk?: string; wind?: number; feint?: boolean; real?: boolean; turn?: boolean; hp?: number; lamp?: boolean; cap?: boolean };
type Boss = { x: number; y: number; w: number; h: number; state: string; t: number; phase: number; hp: number; max: number; cur: string | null; face: number; inv: number; dir: number };
type Arena = {
  kind: string; name: string; state: string; gateL: number; gateR: number; c0: number; cols: number; floorY: number;
  phases: { pattern: string[]; windup: number; rest: number; tired: number; n: number }[]; cp: { x: number; tx: number; ty: number }; cpHit: boolean; helped: boolean; tries: number; glitchy: boolean;
  gates: { L: boolean; R: boolean }; boss: Boss; tell: string; pat: string;
  shots: { kind: string; x: number; y: number; vx: number; roll: boolean; tx: number | null; friendly: boolean }[]; marks: { x: number; y: number; grab?: boolean }[]; ring: { x: number } | null;
  minions: number; log: LogEv[]; line: string | null; lineQ: string[]; voiceLog: string[]; subtitle: string; stolen: number;
  hud: { shown: boolean; name: string; pips: number; live: number };
  px: number; py: number; vx: number; vy: number; onGround: boolean; inv: number; dead: number; hp: number; maxHp: number; deaths: number; frame: number;
  cap: { x: number; y: number } | null; capHeld: boolean; ink: { x: number; t: number; dur: number } | null; batted: number;
};
type MapState = { mounted: boolean; busy: boolean; world: number | null; at: number; walking: boolean; crossing: boolean; banner: string | null; notice: string | null; gate?: number | null; stops: { id: string | null; kind: string; built: boolean; state: string | null }[] };
type Dev = {
  playLevel: (id: string) => unknown;
  levelInfo: () => { id: string | null; cleared: boolean; returned: boolean; toast: string; goal: { tx: number } | null; helperOffer?: boolean };
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
  kickInfo: () => { kicks: number; batted: number; kicked: number };
  mapState: () => MapState;
  progress: () => { wmap: { w: number; at: number } | null; levelsBeaten: Record<string, number>; unlockedLevels: string[] };
  cutSpeed: (n: number) => number;
  storyStop: () => void;
  belt: () => { rank: number; label: string; key: string; stripes: number; seen: number | null };
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

/* ---- the World 8 bosses ---- */
const ARENAS = [
  { id: '8-fort', kind: 'octopus', phases: 2, windups: [50, 38] },
  { id: '8-castle', kind: 'raccoon-king', phases: 3, windups: [48, 38, 36] }
] as const;

/* in the page: load a level and stand Kinan just before the arena's checkpoint flag (foes cleared) */
const TO_ARENA = `(id) => {
  const k = window.__k11;
  k.playLevel(id); k.clearFoes(); k.storyStop();
  const a = k.arenaInfo();
  k.place(a.cp.x - 6, a.floorY - 18); k.step(20);
  return k.arenaInfo();
}`;

type FightResult = { a: Arena; frames: number; hitsTaken: number; tc: Record<string, number>; cleared: boolean; capsAtHit: number[]; flatOpen: number; inkPhases: number[]; inkMax: number };
const FIGHT = `(src, id) => {
  const k = window.__k11;
  (0, eval)(src)(id);
  let a = k.arenaInfo(), frames = 0, hitsTaken = 0, last = a.hp, lastHits = 0, flatOpen = 0, inkMax = 0, gotCaps = 0;
  const capsAtHit = [], inkPhases = [];
  const tc = { windup: 0, bang: 0, open: 0, stomp: 0, cap: 0, grab: 0, grabMarked: 0, sweep: 0, sweepRing: 0, capOut: 0, held: 0 };
  while (frames < 20000 && a.state !== 'open') {
    a = k.arenaBot(1); frames++;
    if (a.hp < last) hitsTaken++;
    last = a.hp;
    const b = a.boss, hits = a.log.filter((e) => e.ev === 'hit').length;
    gotCaps = a.log.filter((e) => e.ev === 'capgot').length;
    if (hits > lastHits) { capsAtHit.push(gotCaps); lastHits = hits; }
    if (a.ink) { inkMax = Math.max(inkMax, a.ink.t); if (inkPhases.indexOf(b.phase) < 0) inkPhases.push(b.phase); }
    if (b.state === 'windup') { tc.windup++; if (a.tell === '!') tc.bang++; }
    if (b.state === 'windup' && b.cur === 'grab') { tc.grab++; if (a.marks.length > 0 && a.marks.every((m) => m.grab)) tc.grabMarked++; }
    if (b.state === 'windup' && b.cur === 'sweep') { tc.sweep++; if (a.ring) tc.sweepRing++; }
    if (b.state === 'windup' && a.ink) tc.inkTell = (tc.inkTell || 0) + 1;
    if (b.state === 'tired' || b.state === 'dizzy') {
      tc.open++; if (a.tell === 'STOMP') tc.stomp++; if (a.tell === 'CAP') tc.cap++;
      if (a.cap || a.capHeld) tc.capOut++;
      if (b.h <= 16) flatOpen++;
    }
    if (a.capHeld) tc.held++;
  }
  for (let n = 0; n < 1500 && !k.levelInfo().cleared; n++) k.arenaBot(1);
  return { a: k.arenaInfo(), frames, hitsTaken, tc, cleared: k.levelInfo().cleared, capsAtHit, flatOpen, inkPhases, inkMax };
}`;

/* lose the fight on purpose: one heart left, then walk into the busy boss (or stand on a grab shadow) */
const LOSE = `(id) => {
  const k = window.__k11;
  let a = k.arenaInfo(), n = 0;
  for (; n < 400 && a.state === 'wait'; n++) a = k.arenaBot(1);
  for (n = 0; n < 400 && !(a.boss.state === 'pace' || a.boss.state === 'windup'); n++) a = k.arenaBot(1);
  const d0 = a.deaths;
  k.arenaSetHp(1);
  for (n = 0; n < 3000 && k.arenaInfo().deaths === d0; n++) {
    const b = k.arenaInfo();
    const m = b.marks.find((q) => q.grab);
    const target = m ? m.x : b.boss.x + b.boss.w / 2;
    const toward = target > b.px + 7, away = target < b.px + 5;
    k.step(1, { right: toward, left: away && !toward, jump: false });
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

test.describe('World 8 · the bosses load, and they are a step up from World 7', () => {
  test('the Big Octopus (8-fort) and the Raccoon King (8-castle) load in authored terrain: their boss, phases, the boss door shut, the entry gate open, the checkpoint before it, the goal past it', async ({ page }) => {
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
      expect(o.a.cap, `${lv.id}: no bottle cap out before the fight`).toBeNull();
    }
    expect(out[0].a.pat).toBe('PAT');      /* the octopus gets a gentle pat on the head */
    expect(out[1].a.pat).toBe('OFFER');    /* the King is offered a bottle cap, never stomped */
    expect(errors).toEqual([]);
  });

  test('difficulty climbs: the Big Octopus is quicker than the Giant Banana Slug (7-fort); the Raccoon King has shorter tells and rests than Drizzle (7-castle) and longer patterns', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const ph = await page.evaluate((ids) => {
      const k = (window as unknown as Win).__k11;
      return ids.map((id) => { k.playLevel(id); return k.arenaInfo()!.phases.map((p) => ({ windup: p.windup, rest: p.rest, tired: p.tired, n: p.pattern.length })); });
    }, ['7-fort', '8-fort', '7-castle', '8-castle']);
    const sum = (list: { windup: number; rest: number; tired: number }[]) => list.reduce((s, p) => s + p.windup + p.rest + p.tired, 0);
    const len = (list: { n: number }[]) => list.reduce((s, p) => s + p.n, 0);
    expect(sum(ph[1]), 'fort 8 quicker than fort 7').toBeLessThan(sum(ph[0]));
    expect(len(ph[1]), 'fort 8 patterns at least as long').toBeGreaterThanOrEqual(len(ph[0]));
    for (let p = 0; p < ph[1].length; p++) expect(ph[1][p].windup, 'each fort 8 tell a little shorter than fort 7').toBeLessThan(ph[0][p].windup);
    /* the castle: the trade takes two steps (fetch the cap, then offer it), so the King's rest windows are a little
       longer than Drizzle's; everything he does is quicker and there is more of it */
    for (let p = 0; p < 2; p++) expect(ph[3][p].windup, 'castle 8 tells a little shorter than castle 7 (the last is at the 0.6 s floor)').toBeLessThan(ph[2][p].windup);
    expect(ph[3][2].windup).toBe(36);
    for (let p = 0; p < 3; p++) expect(ph[3][p].rest, 'castle 8 rests between attacks shorter than castle 7').toBeLessThan(ph[2][p].rest);
    expect(len(ph[3]), 'castle 8 patterns at least as long').toBeGreaterThanOrEqual(len(ph[2]));
    for (const list of [ph[1], ph[3]]) for (let p = 1; p < list.length; p++) expect(list[p].windup).toBeLessThan(list[p - 1].windup);
    for (const list of ph) for (const p of list) expect(p.windup).toBeGreaterThanOrEqual(36);   /* 0.6 s at 60 fps */
    expect(errors).toEqual([]);
  });

  /* the boss bot (it reads only what a kid can see) fights from the checkpoint from six different entries. It never
     loses a World 8 fight (the fights stay fair), and the Raccoon King still lands hits on it (he is no pushover) */
  test('bot hits over six entries: never a lost fight against the Big Octopus or the Raccoon King, and the King still lands hits', async ({ page }) => {
    test.setTimeout(420_000);
    const errors = watchErrors(page);
    await boot(page);
    const ENTRIES: [number, number][] = [[0, 0], [16, 25], [32, 50], [8, 100], [0, 75], [24, 10]];
    const res: Record<string, { hits: number[]; deaths: number; open: boolean }> = {};
    for (const id of ['8-fort', '8-castle']) {
      res[id] = await page.evaluate(({ id, ENTRIES }) => {
        const k = (window as unknown as Win).__k11;
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
    console.log('W8 bosses (bot hits over 6 entries): ' + Object.entries(res).map(([id, r]) => `${id} ${total(id)} [${r.hits.join(' ')}] deaths ${r.deaths}`).join(' · '));
    for (const id of ['8-fort', '8-castle']) {
      expect(res[id].open, `${id}: every fight won`).toBe(true);
      expect(res[id].deaths, `${id}: never a lost fight`).toBe(0);
    }
    expect(total('8-castle'), 'the Raccoon King is no pushover: his paws and bins land on the bot').toBeGreaterThanOrEqual(3);
    expect(errors).toEqual([]);
  });
});

test.describe('World 8 · each boss is beaten by a fair scripted run, and gets smarter after each hit', () => {
  for (const lv of ARENAS) {
    test(`${lv.id} (${lv.kind}): a scripted run from the checkpoint beats it with the starting hearts — tells first, smarter every phase, then befriended and LEVEL CLEAR`, async ({ page }) => {
      test.setTimeout(180_000);
      const errors = watchErrors(page);
      await boot(page);
      const r = await page.evaluate(({ fight, src, id }) => (0, eval)(fight)(src, id), { fight: FIGHT, src: TO_ARENA, id: lv.id }) as FightResult;
      const a = r.a, log = a.log;
      const evs = (name: string) => log.filter((e) => e.ev === name);
      console.log(`${lv.id}: beaten in ${r.frames} frames, hits taken ${r.hitsTaken}, deaths ${a.deaths}, tells ${JSON.stringify(r.tc)}, caps ${JSON.stringify(r.capsAtHit)}, ink phases ${JSON.stringify(r.inkPhases)}`);
      console.log(`${lv.id} rest windows: ` + log.filter((e) => ['tired', 'dizzy', 'capspawn', 'capgot', 'hit'].includes(e.ev)).map((e) => `${e.ev}@${e.f}`).join(' '));
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
      /* every attack had a wind-up of 0.6 s or more, with the "!" drawn the whole time; a grab's shadows the whole time */
      const tells = tellsByPhase(log);
      const all = [...tells.values()].flat();
      expect(all.length).toBeGreaterThanOrEqual(lv.phases * 2);
      for (const t of all) expect(t).toBeGreaterThanOrEqual(36);
      expect(r.tc.bang).toBe(r.tc.windup);
      expect(r.tc.grab).toBeGreaterThan(0);
      expect(r.tc.grabMarked, 'a grab: its shadows on the floor the whole wind-up').toBe(r.tc.grab);
      expect(r.tc.sweepRing, 'a sweep: its band on the floor the whole wind-up').toBe(r.tc.sweep);
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
      if (lv.kind === 'octopus') {
        expect(r.tc.stomp).toBe(r.tc.open);                       /* the rest window wears its arrow (the word on it: PAT) */
        expect(r.flatOpen, 'it flops flat on the floor to rest: its head is the soft spot').toBe(r.tc.open);
        expect(evs('attack').some((e) => e.atk === 'grab' && e.phase === 1), 'phase 1: the tentacle slams').toBe(true);
        expect(evs('attack').some((e) => e.atk === 'sweep' && e.phase === 1), 'phase 1: the low sweep').toBe(true);
        expect(evs('attack').some((e) => e.atk === 'toss' && e.phase === 1), 'phase 1: an ink blob').toBe(true);
        expect(evs('attack').some((e) => e.atk === 'ink' && e.phase === 2), 'phase 2: the ink cloud').toBe(true);
        expect(r.inkPhases, 'no ink cloud before phase 2').toEqual([2]);
        expect(r.tc.inkTell ?? 0, 'the ink is gone before the next wind-up starts').toBe(0);
        expect(hits.every((h) => !h.cap)).toBe(true);
      }
      if (lv.kind === 'raccoon-king') {
        expect(r.tc.cap, 'while the King rests the arrow points at the bottle cap (or at him, cap in hand)').toBe(r.tc.open);
        expect(r.tc.stomp, 'never a STOMP arrow on the King').toBe(0);
        expect(r.tc.capOut, 'a bottle cap is out (or in Kinan\'s hand) in every rest window').toBe(r.tc.open);
        expect(hits.every((h) => h.cap), 'every hit is a bottle cap offered, never a stomp').toBe(true);
        expect(r.capsAtHit, 'one cap picked up per trade').toEqual([1, 2, 3]);
        expect(evs('attack').some((e) => e.atk === 'grab' && e.phase === 1), 'phase 1: the snatching paws').toBe(true);
        expect(evs('attack').some((e) => e.atk === 'roll' && e.phase === 2), 'phase 2: the rolling bins').toBe(true);
        expect(evs('attack').some((e) => e.atk === 'roll' && e.phase === 1), 'no bins before phase 2').toBe(false);
        expect(evs('attack').some((e) => e.atk === 'charge' && e.phase === 3), 'phase 3: the belly slide').toBe(true);
        expect(a.stolen, 'every candle the paws grabbed is given back at the trade').toBe(0);
        expect(a.cap).toBeNull();
        expect(a.capHeld).toBe(false);
      }
      expect(errors).toEqual([]);
    });
  }
});

test.describe('World 8 · no game over in a boss fight, and Glitchy helps after 5 lost fights', () => {
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
        const mid = { phase: a.boss.phase };
        const lost = (0, eval)(lose)(id) as Arena;
        const info = k.levelInfo() as unknown as { toast: string; dialog: boolean; screen: boolean };
        let again = k.arenaInfo()!;
        for (let n = 0; n < 400 && again.state === 'wait'; n++) again = k.arenaBot(1);
        return { a0, mid, lost, toast: info.toast, dialog: info.dialog, screen: info.screen, again };
      }, { src: TO_ARENA, lose: LOSE, id: lv.id });
      expect(r.mid.phase).toBe(2);
      expect(r.lost.deaths).toBe(1);
      expect(Math.abs(r.lost.px - r.a0.cp.x), 'back at the arena checkpoint').toBeLessThanOrEqual(2);
      expect(r.lost.hp).toBe(r.lost.maxHp);
      expect(r.lost.state).toBe('wait');
      expect(r.lost.gates).toEqual({ L: false, R: true });
      expect(r.lost.boss).toMatchObject({ phase: 1, hp: lv.phases, state: 'wait' });
      expect(r.lost.cap, 'no bottle cap left out').toBeNull();
      expect(r.lost.capHeld, 'and none in his hand').toBe(false);
      expect(r.lost.ink, 'no ink left').toBeNull();
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

/* ---- taekwondo: the KICK never hurts a boss (bosses are calmed and befriended) ---- */
test.describe('World 8 · the kick never hurts either boss', () => {
  for (const lv of ARENAS) {
    test(`${lv.id}: forty kicks at ${lv.kind} (busy and resting) never take a hit off it${lv.kind === 'octopus' ? '; a kicked ink blob flies back and splats on it harmlessly' : ''}`, async ({ page }) => {
      test.setTimeout(120_000);
      const errors = watchErrors(page);
      await boot(page);
      const r = await page.evaluate(({ src, id }) => {
        const k = (window as unknown as Win).__k11;
        (0, eval)(src)(id);
        k.godMode();
        let a = k.arenaInfo()!;
        for (let n = 0; n < 3000 && a.state !== 'fight'; n++) a = k.arenaBot(1);
        const hp0 = a.boss.hp;
        const hitsNow = (): number => k.arenaInfo()!.log.filter((e) => e.ev === 'hit').length;
        const states = new Set<string>();
        let kicks = 0, kickHits = 0;   /* hits that land while Kinan is only kicking (the bot's own pats in between don't count) */
        const kickOnce = (): void => {
          const b = k.arenaInfo()!.boss;
          states.add(b.state);
          k.place(b.x - 14, k.arenaInfo()!.floorY - 16);
          k.step(1, { right: true }); k.step(1, { right: false });
          const k0 = k.kickInfo().kicks;
          for (let t = 0; t < 40 && k.kickInfo().kicks === k0; t++) k.step(1, { tapFire: true });
          k.step(16);
          kicks++;
        };
        let h = hitsNow();
        for (let n = 0; n < 20; n++) kickOnce();   /* while it is busy */
        kickHits += hitsNow() - h;
        const busyHp = k.arenaInfo()!.boss.hp;
        a = k.arenaInfo()!;
        for (let n = 0; n < 6000 && !(a.boss.state === 'tired' || a.boss.state === 'dizzy'); n++) a = k.arenaBot(1);
        const restHp = a.boss.hp;
        h = hitsNow();
        for (let n = 0; n < 20 && (k.arenaInfo()!.boss.state === 'tired' || k.arenaInfo()!.boss.state === 'dizzy'); n++) kickOnce();   /* while it rests */
        kickHits += hitsNow() - h;
        const restAfter = k.arenaInfo()!.boss.hp;
        /* the octopus: wait for an ink blob in flight, then kick it from right behind it; the blob flies back and splats */
        let batted = 0, splat = 0, batHp = -1, batAfter = -1;
        if (id === '8-fort') {
          for (let tries = 0; tries < 6 && batted === 0; tries++) {
            a = k.arenaInfo()!;
            for (let n = 0; n < 6000 && !a.shots.some((s) => s.kind === 'inkblob' && !s.friendly); n++) a = k.arenaBot(1);
            batHp = k.arenaInfo()!.boss.hp; h = hitsNow();
            for (let f = 0; f < 24 && k.arenaInfo()!.batted === 0; f++) {
              const s = k.arenaInfo()!.shots.find((q) => q.kind === 'inkblob' && !q.friendly);
              if (!s) break;
              if (f === 0) { k.place(s.x - 14, s.y - 6); k.step(1, { right: true }); }
              k.place(s.x - 14, s.y - 6);
              k.step(1, f === 1 ? { tapFire: true } : {});
            }
            batted = k.arenaInfo()!.batted;
          }
          const s0 = k.arenaInfo()!.log.filter((e) => e.ev === 'splat').length;
          for (let n = 0; n < 120 && k.arenaInfo()!.log.filter((e) => e.ev === 'splat').length === s0; n++) k.step(1);
          kickHits += hitsNow() - h;
          splat = k.arenaInfo()!.log.filter((e) => e.ev === 'splat').length;
          batAfter = k.arenaInfo()!.boss.hp;
        }
        const end = k.arenaInfo()!;
        return { kicks, kicked: k.kickInfo().kicked, states: [...states], hp0, busyHp, restHp, restAfter, kickHits, batted, splat, batHp, batAfter, max: end.boss.max };
      }, { src: TO_ARENA, id: lv.id });
      console.log(`${lv.id} kicks: ${JSON.stringify(r)}`);
      expect(r.kicks).toBeGreaterThanOrEqual(21);
      expect(r.hp0).toBe(r.max);
      expect(r.busyHp, 'twenty kicks while it is busy take nothing off it').toBe(r.max);
      expect(r.restAfter, 'kicks while it rests take nothing off it').toBe(r.restHp);
      expect(r.kickHits, 'no kick ever counts as a hit').toBe(0);
      expect(r.kicked, 'no foe is kicked in a boss fight').toBe(0);
      if (lv.kind === 'octopus') {
        expect(r.batted, 'an ink blob was batted back').toBeGreaterThanOrEqual(1);
        expect(r.splat, 'it splatted on the octopus').toBeGreaterThanOrEqual(1);
        expect(r.batAfter, 'the splat took nothing off it').toBe(r.batHp);
      }
      expect(errors).toEqual([]);
    });
  }
});

/* ---- the map: World 8 opens after the 7-castle; the 8-castle opens the way east to World 9's "coming soon" sign ---- */
type Fly = { kind: string; phase: string; leg: number; legs: number; world: number; home: string; riding: string | null } | null;
type MapS = MapState & { fly: Fly };
type CutS = { on: boolean; mode: string | null; lines: string[]; belt: { rank: number; catchup: boolean; line: string } | null };
async function mapNow(page: Page): Promise<MapS> { return page.evaluate(() => (window as unknown as Win).__k11.mapState() as MapS); }
async function cutNow(page: Page): Promise<CutS> { return page.evaluate(() => (window as unknown as { __k11: { cut: () => CutS } }).__k11.cut()); }
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

test.describe('World 8 · on the map', () => {
  test('World 8 opens after the 7-castle: no "coming soon" sign, Kinan crosses into World 8, and its stops are the eleven level files 8-1 .. 8-8, 8-fort, 8-secret, 8-castle', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    await seedSave(page, `(ids) => ({ unlocked: 1, beaten: [], introSeen: true, beltSeen: 7, levelsBeaten: Object.fromEntries(ids.filter((id) => Number(id.split('-')[0]) <= 7).map((id) => [id, 1])), unlockedLevels: ['1-secret', '2-secret', '3-secret', '4-secret', '5-secret', '6-secret', '7-secret'], escapes: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1 }, wmap: { w: 7, at: 10 } })`);
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    expect(s0).toMatchObject({ world: 7, at: 10 });
    expect(s0.stops[10]).toMatchObject({ id: '7-castle', state: 'beaten' });
    expect(s0.gate ?? null, 'no World 8 sign').toBeNull();
    await page.locator('#owNext').click();
    await expect.poll(async () => (await mapNow(page)).crossing).toBe(true);
    const s2 = await settle(page, 90_000);
    expect(s2.world).toBe(8);
    expect(s2.at).toBe(0);
    expect(s2.stops.map((q) => [q.id, q.kind, q.built])).toEqual([
      ['8-1', 'level', true], ['8-2', 'level', true], ['8-3', 'level', true], ['8-4', 'level', true], ['8-5', 'level', true],
      ['8-fort', 'fort', true], ['8-6', 'level', true], ['8-secret', 'secret', true], ['8-7', 'level', true], ['8-8', 'level', true],
      ['8-castle', 'boss', true]]);
    expect(s2.stops[0].state).toBe('open');
    expect(s2.stops[1].state).toBe('locked');
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe('8-1');
    expect(errors).toEqual([]);
  });

  test('the 8-castle: the exit stays shut until the Raccoon King is befriended; then Glitchy zips into a hockey bag on the train east, Sabumnim ties on the red belt with 2 stripes, and the way on is a "WORLD 9 COMING SOON!" sign', async ({ page }) => {
    test.setTimeout(300_000);
    const errors = watchErrors(page);
    await seedSave(page, `(ids) => ({ unlocked: 1, beaten: [], introSeen: true, beltSeen: 7, levelsBeaten: Object.fromEntries(ids.filter((id) => Number(id.split('-')[0]) <= 8 && id !== '8-castle').map((id) => [id, 1])), unlockedLevels: ['1-secret', '2-secret', '3-secret', '4-secret', '5-secret', '6-secret', '7-secret', '8-secret'], escapes: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1 }, wmap: { w: 8, at: 10 } })`);
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    expect(s0).toMatchObject({ world: 8, at: 10 });
    expect(s0.stops[10]).toMatchObject({ id: '8-castle', kind: 'boss', built: true, state: 'open' });
    await page.locator('#owNext').click();
    const s1 = await settle(page);
    expect(s1).toMatchObject({ world: 8, at: 10 });                  /* the exit is shut */
    expect(s1.notice).toContain('CASTLE');
    await page.evaluate(() => (window as unknown as Win).__k11.cutSpeed(3));
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe('8-castle');
    const r = await page.evaluate(`(${BEAT_HERE})()`) as { level: { cleared: boolean; returned: boolean }; deaths: number; state: string };
    expect(r.state).toBe('open');
    expect(r.level.cleared).toBe(true);
    expect(r.level.returned).toBe(true);
    /* the escape: Glitchy zips himself into a hockey bag, the train takes it out of Toronto over the seam into World 9 */
    await expect.poll(async () => (await cutNow(page)).mode, { timeout: 15_000, intervals: [100] }).toBe('escape');
    const worlds = new Set<number>(), riding: { world: number; riding: string | null; phase: string }[] = [];
    for (let i = 0; i < 400; i++) {
      const f = (await mapNow(page)).fly;
      if (!f) break;
      worlds.add(f.world); riding.push({ world: f.world, riding: f.riding, phase: f.phase });
      expect(f.home).toBe('8:10');                                   /* Kinan stays at the castle */
      await page.waitForTimeout(50);
    }
    expect([...worlds]).toEqual(expect.arrayContaining([8, 9]));
    expect(riding.some((x) => x.riding === 'hockeybag'), 'the hockey bag rides the train').toBe(true);
    expect(riding.filter((x) => x.riding).every((x) => x.riding === 'hockeybag')).toBe(true);
    /* Sabumnim's belt scene follows the escape: World 8's line, red belt with 2 stripes */
    await expect.poll(async () => (await cutNow(page)).mode, { timeout: 30_000, intervals: [100] }).toBe('belt');
    const belt = await cutNow(page);
    /* "He's in a hockey bag! On the train!" first; at the test's 3x speed the flight ends before Annie's second line,
       which then waits in the story queue (cutFinish), so the escape heard the first three */
    expect(belt.lines.slice(0, 3)).toEqual(['w08_kinan_13', 'w08_glitchy_02', 'w08_annie_02']);
    for (const id of belt.lines) expect(['w08_kinan_13', 'w08_glitchy_02', 'w08_annie_02', 'w08_annie_pa01']).toContain(id);
    expect(belt.belt).toMatchObject({ rank: 8, catchup: false, line: 'belt_w08' });
    expect(await page.evaluate(() => (window as unknown as Win).__k11.belt())).toMatchObject({ rank: 8, key: 'red', stripes: 2, label: 'Red belt · 2 stripes' });
    await expect.poll(async () => (await cutNow(page)).on, { timeout: 40_000 }).toBe(false);
    const s2 = await settle(page);
    expect(s2).toMatchObject({ world: 8, at: 10 });
    expect(s2.stops[10].state).toBe('beaten');
    expect(s2.notice).toBe('WORLD 9 COMING SOON!');
    expect(s2.gate).toBe(9);
    expect(await page.evaluate(() => (window as unknown as Win).__k11.progress() as unknown as { escapes: Record<string, number>; beltSeen: number })).toMatchObject({ escapes: { 8: 1 }, beltSeen: 8 });
    await page.locator('#owNext').click();
    await expect.poll(async () => (await mapNow(page)).banner).toBe('WORLD 9 COMING SOON!');
    expect(await settle(page)).toMatchObject({ world: 8, at: 10 });
    expect(await page.evaluate(() => (window as unknown as Win).__k11.progress().wmap)).toEqual({ w: 8, at: 10 });
    expect(errors).toEqual([]);
  });

  test('World 8 story bubbles: the castle approach says its lines (Shad on the radio, Kinan, the family, the Raccoon King) as subtitles, without recordings', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11 as Dev & { storyInfo: () => { log: { id: string; src: string | null }[]; cur: string | null; queue: string[] } };
      k.playLevel('8-castle'); k.godMode(); k.clearFoes();
      const seen = new Set<string>();
      for (let n = 0; n < 80; n++) {
        k.auto(10, { run: true });
        const s = k.storyInfo();
        for (const id of [s.cur, ...s.queue]) if (id && /^talk_8-castle_/.test(id)) seen.add(id);
        if (k.arenaInfo()!.state !== 'wait') break;
      }
      const talk = (window as unknown as Win).KinanLevels.get('8-castle').talk || [];
      return { seen: [...seen], n: talk.length, who: [...new Set(talk.map((t) => t[1]))], log: k.storyInfo().log.filter((x) => /^talk_/.test(x.id)) };
    });
    expect(r.n).toBe(10);
    expect(r.seen.length, 'every bubble comes up on the way to the arena').toBe(r.n);
    expect(r.who).toEqual(expect.arrayContaining(['SHAD', 'KINAN', 'MOM', 'DAD', 'CHENOA', 'THE RACCOON KING']));
    expect(r.log.length).toBeGreaterThan(0);
    expect(r.log[0].id).toBe('talk_8-castle_0');
    for (const x of r.log) expect(x.src, 'subtitle only').toBeNull();
    expect(errors).toEqual([]);
  });
});

test.describe('World 8 · the memory gift', () => {
  test("8-castle's treasure room: in the Raccoon King's treasure pile Kinan finds his moving-day box with the Pocket Critter dino card (story bible, age 8: the year he moved to Saskatoon)", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const w = window as unknown as Win;
      const k = w.__k11 as Dev & { storyInfo: () => { cur: string | null; queue: string[] }; arenaInfo: () => Arena | null };
      const talk = w.KinanLevels.get('8-castle').talk || [];
      const at = talk.findIndex((t) => /MOVING-DAY BOX/.test(t[2]));
      k.playLevel('8-castle'); k.godMode(); k.clearFoes();
      const seen = new Set<string>();
      let arenaAt = -1;
      for (let n = 0; n < 700 && !k.levelInfo().cleared; n++) {
        k.auto(10, { run: true });
        const s = k.storyInfo();
        for (const id of [s.cur, ...s.queue]) if (id) seen.add(id);
        if (arenaAt < 0 && k.arenaInfo()!.state !== 'wait') arenaAt = n;
      }
      const a = k.arenaInfo()!;
      return { at, line: at >= 0 ? talk[at] : null, seen: [...seen], cleared: k.levelInfo().cleared, gateL: a.gateL, cpTx: a.cp.tx };
    });
    expect(r.at, 'the moving-day box line is in 8-castle').toBeGreaterThanOrEqual(0);
    expect(r.line![1]).toBe('KINAN');
    expect(r.line![2]).toContain('Pocket Critter dino card');
    expect(r.line![2]).toContain('Saskatoon');
    expect(r.line![0], 'in the treasure room: past the checkpoint, before the arena gate').toBeGreaterThanOrEqual(r.cpTx);
    expect(r.line![0]).toBeLessThan(r.gateL);
    expect(r.seen, 'it comes up on the way through').toContain(`talk_8-castle_${r.at}`);
    expect(r.cleared).toBe(true);
    expect(errors).toEqual([]);
  });
});

test.describe('World 8 · the fort and the castle with the dev bot', () => {
  test('8-fort and 8-castle reach LEVEL CLEAR with auto(30, {run: true}), fighting their bosses on the way', async ({ page }) => {
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
    }), ['8-fort', '8-castle']);
    console.log('W8 fort + castle: ' + out.map((o) => `${o.id} ${o.cleared ? 'CLEAR' : 'NOT CLEAR'} n=${o.n} boss=${o.boss}`).join(' · '));
    for (const o of out) { expect(o.cleared, o.id).toBe(true); expect(o.boss, o.id).toBe('open'); }
    expect(errors).toEqual([]);
  });
});

/* ---- Toronto looks: World 8's own backdrops (index.html TO_LOOKS 100-109, drawn by W8BG) ---- */
const LOOKS = [
  ['8-1', 100, 'toskyline'], ['8-2', 101, 'tosubway'], ['8-3', 102, 'tosquare'], ['8-4', 103, 'toskyline'], ['8-6', 104, 'tolake'],
  ['8-7', 106, 'kensington'], ['8-8', 107, 'toskyline'], ['8-secret', 108, 'tolake'], ['8-fort', 105, 'toaquarium'], ['8-castle', 109, 'casaloma']
] as const;
type Look = { theme: number; bg: string | null; place: string | null };
type LookDev = Dev & { freeze: (on: boolean) => unknown; probe: () => { x: number; y: number }; storyNext: () => string | null; storyInfo: () => { cur: string | null; queue: string[] } };
type Pic = { colours: number; bright: number };
/* in the page, after two frames are drawn: the top 40% of the picture (the backdrop, above the ground): how many
   different colours (5 bits a channel) and how bright it is on average (0-255) */
const PICTURE = `async () => {
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
  const cv = document.querySelector('#cv'), d = cv.getContext('2d').getImageData(0, 0, cv.width, Math.round(cv.height * 0.4)).data;
  const bins = new Set(); let sum = 0;
  for (let i = 0; i < d.length; i += 4) { bins.add(((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3)); sum += (d[i] + d[i + 1] + d[i + 2]) / 3; }
  return { colours: bins.size, bright: Math.round(sum / (d.length / 4)) };
}`;

test.describe('World 8 · the Toronto looks', () => {
  test("every World 8 level wears its own Toronto look (none borrows another world's) and draws it without errors; 8-2's viaduct opens onto the sky", async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const pics: Record<string, Pic> = {};
    for (const [id, theme, bg] of LOOKS) {
      const r = await page.evaluate((i) => {
        const w = window as unknown as { __k11: LookDev; KinanLevels: { get: (x: string) => { theme: number } } };
        const k = w.__k11; k.playLevel(i); k.storyStop(); k.freeze(true);
        return { file: w.KinanLevels.get(i).theme, look: (k.levelInfo() as unknown as { look: Look | null }).look };
      }, id);
      expect(r.file, `${id}'s level file`).toBe(theme);
      expect(r.look, `${id} wears ${bg}`).toMatchObject({ theme, bg });
      pics[id] = await page.evaluate(`(${PICTURE})()`) as Pic;
      await page.locator('#cv').screenshot({ path: testInfo.outputPath(`look-${id}.png`) });
      await page.evaluate(() => (window as unknown as { __k11: LookDev }).__k11.freeze(false));
    }
    console.log('W8 looks (colours/brightness of the backdrop): ' + LOOKS.map(([id]) => `${id} ${pics[id].colours}/${pics[id].bright}`).join(' · '));
    for (const [id] of LOOKS) expect(pics[id].colours, `${id}: a whole scene, not a bare sky`).toBeGreaterThan(40);
    /* 8-2: in the tunnel the backdrop is dark; out on the viaduct (c135-161) it is the open sky over the Don Valley */
    const via = await page.evaluate(async (src) => {
      const k = (window as unknown as { __k11: LookDev }).__k11, pic = (0, eval)(src) as () => Promise<Pic>;
      k.playLevel('8-2'); k.storyStop(); k.godMode(); k.clearFoes();
      k.freeze(true); const tunnel = await pic(); k.freeze(false);
      k.place(148 * 16 + 3, 40); k.step(40);
      k.freeze(true); const open = await pic(); k.freeze(false);
      return { tunnel, open, x: Math.round(k.probe().x / 16) };
    }, PICTURE);
    await page.locator('#cv').screenshot({ path: testInfo.outputPath('look-8-2-viaduct.png') });
    console.log(`8-2 tunnel ${JSON.stringify(via.tunnel)} · viaduct (c${via.x}) ${JSON.stringify(via.open)}`);
    expect(via.x).toBeGreaterThanOrEqual(135);
    expect(via.x).toBeLessThanOrEqual(161);
    expect(via.open.bright, 'the viaduct is open to the sky').toBeGreaterThan(via.tunnel.bright + 50);
    expect(errors).toEqual([]);
  });

  test("8-5: Milo's video-call line is labelled MILO in the gold every name uses, and his face shows in a little call window while he talks (and only then)", async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(async () => {
      const w = window as unknown as Win, k = w.__k11 as LookDev;
      const call = (): string | null => (k.levelInfo() as unknown as { call: string | null }).call;
      const talk = w.KinanLevels.get('8-5').talk || [], at = talk.findIndex((t) => t[1] === 'MILO'), id = `talk_8-5_${at}`;
      k.playLevel('8-5'); k.godMode(); k.clearFoes(); k.storyStop();
      const atStart = call();
      let n = 0;
      for (; n < 400; n++) { const s = k.storyInfo(); if (s.cur === id || s.queue.indexOf(id) >= 0) break; k.auto(5, { run: true }); }
      for (let q = 0; q < 10 && k.storyInfo().cur !== id; q++) k.storyNext();   /* the lines before his, heard to the end now */
      k.freeze(true);
      await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => res(null))));
      const box = document.getElementById('storyLine')!, b = box.querySelector('b');
      const cv = document.querySelector('#cv') as HTMLCanvasElement, cx = cv.getContext('2d')!;
      const px = (x: number, y: number): number[] => Array.from(cx.getImageData(x, y, 1, 1).data.slice(0, 3));
      const during = { cur: k.storyInfo().cur, call: call(), html: box.innerHTML, hidden: box.hidden, colour: b ? getComputedStyle(b).color : null,
        border: px(cv.width - 69, 50), face: px(cv.width - 66 + 10 + 5 * 3 + 1, 26 + 37), w: cv.width };
      return { at, id, n, atStart, during, after: 'not yet' as string | null };
    });
    await page.locator('#cv').screenshot({ path: testInfo.outputPath('milo-call.png') });   /* still frozen: his call on screen */
    r.after = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11 as LookDev;
      k.freeze(false); k.storyNext();
      return (k.levelInfo() as unknown as { call: string | null }).call;
    });
    console.log(`8-5 Milo: ${JSON.stringify(r)}`);
    expect(r.at, "Milo's line is in 8-5").toBeGreaterThanOrEqual(0);
    expect(r.atStart, 'no call window before he calls').toBeNull();
    expect(r.during.cur).toBe(r.id);
    expect(r.during.hidden).toBe(false);
    expect(r.during.html.startsWith('<b>MILO:</b> '), 'the subtitle says who is talking: MILO').toBe(true);
    expect(r.during.colour, "his name in the gold every speaker's name uses (--gold #f6c445)").toBe('rgb(246, 196, 69)');
    expect(r.during.call, 'his face is in the call window').toBe('MILO');
    expect(r.during.border, 'the call window is drawn (its gold frame)').toEqual([246, 196, 69]);
    const [fr, fg, fb] = r.during.face;
    expect(Math.abs(fr - 0xe8) + Math.abs(fg - 0xb4) + Math.abs(fb - 0x8a), 'his face (skin tone) in the window').toBeLessThan(12);
    expect(r.after, 'the window closes when his line is done').toBeNull();
    expect(errors).toEqual([]);
  });
});

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* Builder-owned (outside the TE globs). Engine pass B2 — the bosses of Worlds 3, 4 and 5 in authored
   terrain: the Big Bull Moose (3-fort), the Safety Foreman (3-castle), the Coaster Conductor (4-fort),
   Chenoa's Restaurant Rush (4-castle), the Carnival Barker (5-fort) and Bronco at the Grandstand Show
   (5-castle). Same rules as B1 (story bible "Game rules"; Shad's rulings): dumb first, smarter after every
   hit with a banner, castles 3 phases and forts 2, every attack a "!" tell of 0.6 s or more, no game over
   (the arena's checkpoint, the boss at full health), Glitchy after 5 lost fights, a befriend moment, then
   LEVEL CLEAR; a castle opens its world's exit on the map. Every fight is played through the real input
   state (the boss bot sets input.left / right / jump / jumpBuf / runHeld, the fields a keyboard or the
   touch pad feed) and read back through __k11.arenaInfo(). */

const BASE = 'http://127.0.0.1:4174/index.html';
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';

type LogEv = { f: number; ev: string; phase: number; atk?: string; wind?: number; feint?: boolean; real?: boolean; turn?: boolean; aim?: number; pc?: number; vx?: number; hp?: number; n?: number; high?: boolean };
type Boss = { x: number; y: number; w: number; h: number; state: string; t: number; phase: number; hp: number; max: number; cur: string | null; face: number; inv: number; dir: number };
type Arena = {
  kind: string; name: string; state: string; gateL: number; gateR: number; c0: number; cols: number; floorY: number;
  phases: { pattern: string[]; windup: number; rest: number; tired: number; calm?: number }[]; cp: { x: number; tx: number; ty: number }; cpHit: boolean; helped: boolean; tries: number; glitchy: boolean;
  gates: { L: boolean; R: boolean }; boss: Boss; tell: string; pat: string;
  shots: { kind: string; x: number; y: number; vx: number; roll: boolean; tx: number | null }[]; marks: { x: number; y: number }[]; ring: { x: number } | null;
  note: { x: number; y: number } | null; noteGot: boolean; built: number[][];
  minions: number; log: LogEv[]; line: string | null; lineQ: string[]; voiceLog: string[]; subtitle: string;
  hud: { shown: boolean; name: string; pips: number; live: number };
  camX: number; px: number; py: number; vx: number; vy: number; onGround: boolean; inv: number; dead: number; hp: number; maxHp: number; deaths: number; frame: number;
};
type Hold = { left?: boolean; right?: boolean; jump?: boolean; tapJump?: boolean; fire?: boolean };
type Dev = {
  playLevel: (id: string) => unknown;
  levelInfo: () => { id: string | null; cleared: boolean; returned: boolean; toast: string; dialog: boolean; screen: boolean; goal: { tx: number } | null; arena: { kind: string } | null; helperOffer?: boolean };
  levels: () => { levels: { id: string; problems: string[]; lint: string[] }[] };
  godMode: () => void;
  clearFoes: () => void;
  place: (x: number, y: number) => unknown;
  step: (n: number, hold?: Hold) => { x: number }[];
  tile: (tx: number, ty: number) => number;
  auto: (n: number, opts?: { run?: boolean }) => unknown;
  arenaInfo: () => Arena | null;
  arenaBot: (n: number) => Arena;
  arenaSetHp: (n: number) => number;
  arenaLines: () => { id: string; who: string; text: string; seconds: number; clip: boolean }[];
  arenaKinds: () => { kind: string; name: string; phases: number; lines: { intro: string[]; retry: string[]; phase: (string | null)[]; first: Record<string, string>; defeat: string[] } }[];
  freeze: (on: boolean) => boolean;
  mapState: () => MapState;
  mapWarp: (n: number, at: number) => MapState | null;
  progress: () => { wmap: { w: number; at: number } | null };
};
type MapState = { mounted: boolean; busy: boolean; world: number | null; at: number; walking: boolean; crossing: boolean; banner: string | null; notice: string | null; stops: { id: string | null; kind: string; built: boolean; state: string | null }[] };
type Win = { __k11: Dev; KinanLevels: { ready: boolean; list: () => string[] } };

/* the B2 arenas: castles (3 phases) climb Principal < Foreman < Chenoa < Bronco; forts (2) Moose < Conductor < Barker */
const ARENAS = [
  { id: '3-fort', kind: 'moose', phases: 2 },
  { id: '3-castle', kind: 'foreman', phases: 3 },
  { id: '4-fort', kind: 'conductor', phases: 2 },
  { id: '4-castle', kind: 'chenoa', phases: 3 },
  { id: '5-fort', kind: 'barker', phases: 2 },
  { id: '5-castle', kind: 'bronco', phases: 3 }
] as const;

const fixture = (name: string): string =>
  readFileSync(fileURLToPath(new URL(`../fixtures/saves/${name}`, import.meta.url)), 'utf8');

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

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

/* in the page: load a level and stand Kinan just before the arena's checkpoint flag (foes cleared) */
const TO_ARENA = `(id) => {
  const k = window.__k11;
  k.playLevel(id); k.clearFoes();
  const a = k.arenaInfo();
  k.place(a.cp.x - 6, a.floorY - 18); k.step(20);
  return k.arenaInfo();
}`;

test.describe('B2 · the World 3-5 arenas load in authored terrain', () => {
  test('each new arena loads: its boss, its phases, the boss door shut, the entry gate open, the checkpoint before it, the goal past it', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const out = await page.evaluate((list) => {
      const k = (window as unknown as Win).__k11;
      const reg = k.levels().levels;
      return list.map((lv) => {
        k.playLevel(lv.id);
        const a = k.arenaInfo()!, info = k.levelInfo();
        const rows = a.floorY / 16;
        const door: number[] = [], entry: number[] = [];
        for (let r = 0; r < rows; r++) { door.push(k.tile(a.gateR, r)); entry.push(k.tile(a.gateL, r)); }
        const r = reg.find((x) => x.id === lv.id)!;
        return { id: lv.id, a, info, door, entry, problems: r ? r.problems : ['not registered'], lint: r ? r.lint : [] };
      });
    }, ARENAS.map((x) => ({ id: x.id })));
    for (const [i, lv] of ARENAS.entries()) {
      const o = out[i];
      expect(o.problems, lv.id).toEqual([]);
      expect(o.lint, lv.id).toEqual([]);
      expect(o.a.kind, lv.id).toBe(lv.kind);
      expect(o.info.arena?.kind, lv.id).toBe(lv.kind);
      expect(o.a.state, lv.id).toBe('wait');
      expect(o.a.phases.length, lv.id).toBe(lv.phases);          /* castles 3, forts 2 */
      expect(o.a.boss.max, lv.id).toBe(lv.phases);               /* one hit per phase */
      expect(o.a.cols, lv.id).toBe(24);                          /* the whole fight framed on one screen */
      expect(o.a.gates, lv.id).toEqual({ L: false, R: true });
      expect(o.door.every((t) => t === 5), `${lv.id} boss door is a full-height wall`).toBe(true);
      expect(o.entry.every((t) => t === 0), `${lv.id} entry gate open`).toBe(true);
      expect(o.a.cp.tx, lv.id).toBeLessThan(o.a.gateL);
      expect(o.a.gateL - o.a.cp.tx, lv.id).toBeLessThanOrEqual(4);
      expect(o.info.goal!.tx, lv.id).toBeGreaterThan(o.a.gateR);
      expect(o.a.hud.shown, lv.id).toBe(false);
      /* every tell is at least 0.6 s, and each phase is quicker than the one before (dumb, then smarter) */
      for (const p of o.a.phases) expect(p.windup, lv.id).toBeGreaterThanOrEqual(36);
      for (let p = 1; p < o.a.phases.length; p++) {
        expect(o.a.phases[p].windup, `${lv.id} phase ${p + 1} tells`).toBeLessThan(o.a.phases[p - 1].windup);
        expect(o.a.phases[p].rest, `${lv.id} phase ${p + 1} rests`).toBeLessThan(o.a.phases[p - 1].rest);
        expect(o.a.phases[p].tired, `${lv.id} phase ${p + 1} stomp window`).toBeLessThan(o.a.phases[p - 1].tired);
      }
    }
    expect(errors).toEqual([]);
  });

  test('difficulty climbs world by world: each castle boss is quicker than the one before (Principal < Foreman < Chenoa < Bronco), each fort too (Moose < Conductor < Barker)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const ph = await page.evaluate((ids) => {
      const k = (window as unknown as Win).__k11;
      return ids.map((id) => { k.playLevel(id); return k.arenaInfo()!.phases.map((p) => ({ windup: p.windup, rest: p.rest, tired: p.tired, n: p.pattern.length })); });
    }, ['2-castle', '3-castle', '4-castle', '5-castle', '2-fort', '3-fort', '4-fort', '5-fort']);
    const sum = (list: { windup: number; rest: number; tired: number }[]) => list.reduce((s, p) => s + p.windup + p.rest + p.tired, 0);
    const len = (list: { n: number }[]) => list.reduce((s, p) => s + p.n, 0);
    for (let i = 1; i < 4; i++) {
      expect(sum(ph[i]), `castle ${i + 2} quicker than castle ${i + 1}`).toBeLessThan(sum(ph[i - 1]));
      expect(len(ph[i]), `castle ${i + 2} patterns at least as long`).toBeGreaterThanOrEqual(len(ph[i - 1]));
      expect(sum(ph[4 + i]), `fort ${i + 2} quicker than fort ${i + 1}`).toBeLessThan(sum(ph[4 + i - 1]));
    }
    expect(errors).toEqual([]);
  });
});

/* ---- the fights: beaten through real input, smarter after every hit ---- */
type FightResult = { a: Arena; frames: number; hitsTaken: number; tellChecks: { rain: number; rainMarked: number; slam: number; slamRinged: number; windup: number; bang: number; open: number; stomp: number }; cleared: boolean; builtAt2: number };
const FIGHT = `(src, id) => {
  const k = window.__k11;
  (0, eval)(src)(id);
  let a = k.arenaInfo(), frames = 0, hitsTaken = 0, last = a.hp, builtAt2 = -1;
  const tc = { rain: 0, rainMarked: 0, slam: 0, slamRinged: 0, windup: 0, bang: 0, open: 0, stomp: 0 };
  while (frames < 15000 && a.state !== 'open') {
    a = k.arenaBot(1); frames++;
    if (a.hp < last) hitsTaken++;
    last = a.hp;
    const b = a.boss;
    if (b.phase === 2 && builtAt2 < 0 && b.state === 'pace') builtAt2 = a.built.length;
    if (b.state === 'windup') { tc.windup++; if (a.tell === '!') tc.bang++; }
    if (b.state === 'windup' && b.cur === 'rain') { tc.rain++; if (a.marks.length > 0) tc.rainMarked++; }
    if (b.state === 'windup' && b.cur === 'slam') { tc.slam++; if (a.ring) tc.slamRinged++; }
    if (b.state === 'tired' || b.state === 'dizzy') { tc.open++; if (a.tell === 'STOMP') tc.stomp++; }
  }
  for (let n = 0; n < 300 && !k.levelInfo().cleared; n++) k.arenaBot(1);
  return { a: k.arenaInfo(), frames, hitsTaken, tellChecks: tc, cleared: k.levelInfo().cleared, builtAt2 };
}`;

/* the measured tell before each attack: frames from its (last) wind-up to the attack itself */
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

test.describe('B2 · every World 3-5 boss is beaten by a fair scripted run, and gets smarter after each hit', () => {
  for (const lv of ARENAS) {
    test(`${lv.id} (${lv.kind}): a scripted run from the checkpoint beats it with the starting hearts — tells first, smarter every phase, then befriended and LEVEL CLEAR`, async ({ page }) => {
      test.setTimeout(150_000);
      const errors = watchErrors(page);
      await boot(page);
      const r = await page.evaluate(({ fight, src, id }) => (0, eval)(fight)(src, id), { fight: FIGHT, src: TO_ARENA, id: lv.id }) as FightResult;
      const a = r.a, log = a.log;
      const evs = (name: string) => log.filter((e) => e.ev === name);
      console.log(`${lv.id}: beaten in ${r.frames} frames, hits taken ${r.hitsTaken}, deaths ${a.deaths}, tells ${JSON.stringify(r.tellChecks)}`);
      /* beaten, fair: the bot never lost all its hearts */
      expect(a.state).toBe('open');
      expect(a.deaths).toBe(0);
      expect(a.boss.state).toBe('friend');
      expect(r.cleared).toBe(true);
      /* one phase per hit: hit -> phase (smarter, with its banner) ... the last hit -> befriend */
      const hits = evs('hit');
      expect(hits.length).toBe(lv.phases);
      expect(evs('phase').map((e) => e.phase)).toEqual(Array.from({ length: lv.phases - 1 }, (_, i) => i + 2));
      for (let i = 0; i < hits.length - 1; i++) {
        const next = log[log.indexOf(hits[i]) + 1];
        expect(next.ev, 'a hit makes it smarter at once').toBe('phase');
        expect(next.phase).toBe(hits[i].phase + 1);
      }
      expect(log[log.indexOf(hits[hits.length - 1]) + 1].ev).toBe('befriend');
      /* the tells: every attack had a wind-up of 0.6 s or more, with the "!" drawn the whole time */
      const tells = tellsByPhase(log);
      const all = [...tells.values()].flat();
      expect(all.length).toBeGreaterThanOrEqual(lv.phases * 2);
      for (const t of all) expect(t).toBeGreaterThanOrEqual(36);
      expect(r.tellChecks.bang).toBe(r.tellChecks.windup);
      expect(r.tellChecks.stomp).toBe(r.tellChecks.open);           /* tired or dizzy always wears the arrow */
      expect(r.tellChecks.rainMarked).toBe(r.tellChecks.rain);      /* rain: the shadows are on the floor for the whole wind-up */
      expect(r.tellChecks.slamRinged).toBe(r.tellChecks.slam);      /* the ground pound: the red ring for the whole wind-up */
      /* smarter, measured: the tells get shorter every phase */
      for (let p = 2; p <= lv.phases; p++) expect(mean(tells.get(p)!), `phase ${p} tells shorter than phase ${p - 1}`).toBeLessThan(mean(tells.get(p - 1)!));
      /* smarter, behaviour: each phase brings an attack the phase before it did not have */
      const atkSet = (p: number) => new Set(evs('attack').filter((e) => e.phase === p).map((e) => e.atk));
      for (let p = 2; p <= lv.phases; p++) expect([...atkSet(p)].some((x) => !atkSet(p - 1).has(x)), `phase ${p} has a new attack`).toBe(true);
      /* phase 2 feints (and the real attack starts with a STOMP); phase 1 never does */
      expect(evs('feint').filter((e) => e.phase === 1)).toEqual([]);
      expect(evs('feint').filter((e) => e.phase >= 2).length).toBeGreaterThan(0);
      for (const f of evs('feint')) expect(log[log.indexOf(f) + 1].ev).toBe('stomp');
      /* the befriend moment: the boss's kind words were played */
      expect(a.voiceLog.length).toBeGreaterThan(1);
      const kinds = await page.evaluate(() => (window as unknown as Win).__k11.arenaKinds());
      const K = kinds.find((x) => x.kind === lv.kind)!;
      for (const id of K.lines.defeat) expect(a.voiceLog, `${lv.kind} said ${id}`).toContain(id);
      /* the boss's own new move, by kind */
      if (lv.kind === 'bronco') {
        /* real strategy: every pat window came after Kinan grabbed the music in that pattern */
        let got = false;
        for (const e of log) {
          if (e.ev === 'music') got = true;
          if (e.ev === 'tired' || e.ev === 'dizzy') { expect(got, 'Bronco settles only after the music').toBe(true); got = false; }
          if (e.ev === 'hit' || e.ev === 'start') got = false;
        }
        expect(evs('windup').some((e) => e.atk === 'charge2' && e.turn && e.phase >= 2), 'phase 2: the charge turns at the gate with a fresh "!"').toBe(true);
        expect(evs('note').some((e) => e.phase === 1 && !e.high) && evs('note').some((e) => e.phase >= 2 && e.high), 'the music floats higher from phase 2').toBe(true);
        expect(a.pat).toBe('PAT');
      }
      if (lv.kind === 'chenoa') {
        expect(evs('build').map((e) => e.phase), 'Shad builds the platforms when phase 2 starts').toEqual([2]);
        expect(r.builtAt2).toBe(6);
        expect(evs('attack').some((e) => e.atk === 'charge' && e.phase === 3), 'phase 3: the rush').toBe(true);
      }
      if (lv.kind === 'conductor') expect(evs('attack').some((e) => e.atk === 'wave' && e.phase === 2), 'phase 2: the whistle shockwave').toBe(true);
      if (lv.kind === 'foreman') {
        expect(evs('attack').some((e) => e.atk === 'blow' && e.phase === 2), 'phase 2: the megaphone').toBe(true);
        expect(evs('attack').some((e) => e.atk === 'toss' && e.phase === 3), 'phase 3: the hard hats').toBe(true);
      }
      if (lv.kind === 'moose') expect(a.pat, 'calm him: a pat, not a stomp').toBe('PAT');
      expect(errors).toEqual([]);
    });
  }

  test('Bronco stays spooked without the music: no pat window until Kinan grabs it, then he settles', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((src) => {
      const k = (window as unknown as Win).__k11;
      (0, eval)(src)('5-castle');
      let a = k.arenaInfo()!;
      for (let n = 0; n < 400 && a.state === 'wait'; n++) a = k.arenaBot(1);
      k.godMode();
      /* keep Kinan away from the music for two whole patterns: on the far side from it, and before it floats in,
         on Bronco's side (it always floats in on the side away from him) */
      const lo = (a.gateL + 1) * 16 + 4, hi = a.gateR * 16 - 20, mid = (lo + hi) / 2;
      let notes = 0;
      for (let n = 0; n < 1600; n++) {
        a = k.arenaInfo()!;
        if (a.note) notes++;
        const x = a.note ? (a.note.x < mid ? hi : lo) : (a.boss.x + a.boss.w / 2 < mid ? lo : hi);
        if (Math.abs(a.px - x) > 4) k.place(x, a.floorY - 18);
        k.step(1, { left: false, right: false, jump: false });
      }
      const spooked = a.log.filter((e) => e.ev === 'spooked').length, tired = a.log.filter((e) => e.ev === 'tired' || e.ev === 'dizzy').length;
      /* now grab it: stand on the music */
      a = k.arenaInfo()!;
      for (let n = 0; n < 300 && a.note; n++) { k.place(a.note.x - 5, a.note.y - 6); k.step(1, {}); a = k.arenaInfo()!; }
      const gotIt = a.noteGot;
      let settled = false;
      for (let n = 0; n < 900 && !settled; n++) { k.place(a.gateL * 16 + 40, a.floorY - 18); k.step(1, {}); a = k.arenaInfo()!; settled = a.boss.state === 'tired'; }
      return { notes, spooked, tired, gotIt, settled, tell: a.tell };
    }, TO_ARENA);
    expect(r.notes).toBeGreaterThan(0);
    expect(r.spooked).toBeGreaterThanOrEqual(1);
    expect(r.tired).toBe(0);
    expect(r.gotIt).toBe(true);
    expect(r.settled).toBe(true);
    expect(r.tell).toBe('STOMP');
    expect(errors).toEqual([]);
  });

  test('the tells are on the picture for a drawn boss: a red "!" over the moose while he paws, a gold PAT arrow while he is puffed out', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await boot(page);
    const found = async (state: string, hue: 'red' | 'gold') => page.evaluate(async ({ src, state, hue }) => {
      const k = (window as unknown as Win).__k11;
      let a = k.arenaInfo();
      if (!a || a.state !== 'fight') { a = (0, eval)(src)('3-fort') as Arena; for (let n = 0; n < 400 && a.state === 'wait'; n++) a = k.arenaBot(1); }
      k.godMode();
      /* Kinan waits in a corner (no stomping) until the moose is in the state; the camera settles on the arena */
      k.place((a!.gateL + 1) * 16 + 4, a!.floorY - 18);
      for (let n = 0; n < 4000 && !(a!.boss.state === state && n > 60); n++) { k.step(1, { left: false, right: false, jump: false }); a = k.arenaInfo(); }
      if (a!.boss.state !== state) return -1;
      k.freeze(true);
      const cv = document.querySelector('#cv') as HTMLCanvasElement, cx = cv.getContext('2d')!;
      let hits = 0;
      for (let f = 0; f < 12; f++) {
        await new Promise((res) => requestAnimationFrame(() => res(null)));
        const b = k.arenaInfo()!, x0 = Math.round(b.boss.x - b.camX + b.boss.w / 2) - 10, y0 = Math.max(0, b.boss.y - 40);
        const img = cx.getImageData(x0, y0, 20, 40).data;
        for (let i = 0; i < img.length; i += 4) {
          const r = img[i], g = img[i + 1], bl = img[i + 2];
          const ok = hue === 'red' ? r > 170 && r - Math.max(g, bl) > 120 : r > 170 && g > 130 && bl < 120 && r - bl > 110 && Math.abs(r - g) < 70;
          if (ok) { hits++; break; }
        }
      }
      k.freeze(false);
      return hits;
    }, { src: TO_ARENA, state, hue });
    expect(await found('windup', 'red'), 'the red "!"').toBeGreaterThan(0);
    expect(await found('dizzy', 'gold'), 'the gold PAT arrow').toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });
});

/* ---- no game over, and the helper works in a World 3-5 boss fight ---- */
const LOSE = `(id) => {
  const k = window.__k11;
  let a = k.arenaInfo(), n = 0;
  for (; n < 400 && a.state === 'wait'; n++) a = k.arenaBot(1);
  for (n = 0; n < 400 && !(a.boss.state === 'pace' || a.boss.state === 'windup'); n++) a = k.arenaBot(1);
  const d0 = a.deaths;
  k.arenaSetHp(1);
  for (n = 0; n < 900 && k.arenaInfo().deaths === d0; n++) {
    const b = k.arenaInfo();
    const toward = b.boss.x + b.boss.w / 2 > b.px + 5;
    k.step(1, { right: toward, left: !toward });
  }
  k.step(1, { right: false, left: false });
  return k.arenaInfo();
}`;

test.describe('B2 · no game over in a World 3-5 boss fight, and Glitchy helps after 5 lost fights', () => {
  for (const lv of ARENAS) {
    test(`${lv.id}: the last heart goes back to the arena checkpoint; the boss restarts at full health on re-entry`, async ({ page }) => {
      test.setTimeout(90_000);
      const errors = watchErrors(page);
      await boot(page);
      const r = await page.evaluate(({ src, lose, id }) => {
        const k = (window as unknown as Win).__k11;
        const a0 = (0, eval)(src)(id) as Arena;
        /* get into phase 2 first (and in Chenoa's kitchen, let Shad build), so the reset has something to undo */
        let a = k.arenaInfo()!;
        for (let n = 0; n < 6000 && a.boss.phase < 2; n++) a = k.arenaBot(1);
        for (let n = 0; n < 200 && a.boss.state === 'hurt'; n++) a = k.arenaBot(1);
        const mid = { phase: a.boss.phase, built: a.built.length };
        const lost = (0, eval)(lose)(id) as Arena;
        const info = k.levelInfo();
        let again = k.arenaInfo()!;
        for (let n = 0; n < 400 && again.state === 'wait'; n++) again = k.arenaBot(1);
        return { a0, mid, lost, toast: info.toast, dialog: info.dialog, screen: info.screen, again };
      }, { src: TO_ARENA, lose: LOSE, id: lv.id });
      expect(r.mid.phase).toBe(2);
      if (lv.kind === 'chenoa') expect(r.mid.built).toBe(6);
      expect(r.lost.deaths).toBe(1);
      expect(Math.abs(r.lost.px - r.a0.cp.x), 'back at the arena checkpoint').toBeLessThanOrEqual(2);
      expect(r.lost.hp).toBe(r.lost.maxHp);                       /* full hearts */
      expect(r.lost.state).toBe('wait');
      expect(r.lost.gates).toEqual({ L: false, R: true });
      expect(r.lost.boss).toMatchObject({ phase: 1, hp: lv.phases, state: 'wait' });   /* the boss at full health */
      expect(r.lost.built).toEqual([]);                           /* Shad's platforms come down with the reset */
      expect(r.lost.note).toBeNull();
      expect(r.lost.hud.shown).toBe(false);
      expect(r.toast).toContain('checkpoint');
      expect(r.dialog).toBe(false);
      expect(r.screen).toBe(false);
      expect(r.again.state).toBe('fight');
      expect(r.again.tries).toBe(2);
      expect(errors).toEqual([]);
    });
  }

  test('5 lost fights against Bronco: Glitchy offers boss help; "Yes" — an extra heart, slower tells; Bronco is still beatable', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(({ src, lose }) => {
      const k = (window as unknown as Win).__k11;
      (0, eval)(src)('5-castle');
      const seen: { deaths: number; offer: boolean }[] = [];
      for (let i = 0; i < 5; i++) {
        const a = (0, eval)(lose)('5-castle') as Arena;
        seen.push({ deaths: a.deaths, offer: !!k.levelInfo().helperOffer });
      }
      return { seen };
    }, { src: TO_ARENA, lose: LOSE });
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
      while (frames < 15000 && a.state !== 'open') { a = k.arenaBot(1); frames++; }
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
});

/* ---- a castle opens its world's exit on the map ---- */
async function settle(page: Page): Promise<MapState> {
  await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.walking && !s.crossing && !s.busy && !s.banner; }, null, { timeout: 60_000 });
  return page.evaluate(() => (window as unknown as Win).__k11.mapState());
}
test.describe('B2 · beating a castle opens that world\'s exit on the map', () => {
  for (const n of [3, 4, 5]) {
    test(`the ${n}-castle: the seam stays shut until the boss is befriended, then Kinan walks off the map into World ${n + 1}`, async ({ page }) => {
      test.setTimeout(180_000);
      const errors = watchErrors(page);
      /* every level file of Worlds 1..n beaten except this castle; standing on the castle */
      await page.goto(DEV_URL);
      await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
      await page.evaluate(({ key, n }) => {
        const ids = (window as unknown as Win).KinanLevels.list().filter((id) => Number(id.split('-')[0]) <= n && id !== n + '-castle');
        localStorage.setItem(key, JSON.stringify({ unlocked: 1, beaten: [], levelsBeaten: Object.fromEntries(ids.map((id) => [id, 1])), wmap: { w: n, at: 10 } }));
      }, { key: CURRENT, n });
      await page.reload();
      await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
      await page.locator('#startBtn').click({ force: true });
      await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy; });
      const s0 = await page.evaluate(() => (window as unknown as Win).__k11.mapState());
      expect(s0).toMatchObject({ world: n, at: 10 });
      expect(s0.stops[10]).toMatchObject({ id: `${n}-castle`, kind: 'boss', built: true, state: 'open' });
      await page.locator('#owNext').click();
      const s1 = await settle(page);
      expect(s1).toMatchObject({ world: n, at: 10 });              /* the exit is shut */
      expect(s1.notice).toContain('CASTLE');
      await page.locator('#owPlay').click();
      await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe(`${n}-castle`);
      const info = await page.evaluate(() => {
        const k = (window as unknown as Win).__k11;
        k.clearFoes();
        const a0 = k.arenaInfo()!; k.place(a0.cp.x - 6, a0.floorY - 18); k.step(20);
        let a = k.arenaInfo()!;
        for (let f = 0; f < 15000 && a.state !== 'open'; f++) a = k.arenaBot(1);
        for (let m = 0; m < 400 && !k.levelInfo().cleared; m++) k.arenaBot(1);
        for (let m = 0; m < 1500 && !k.levelInfo().returned; m++) k.step(1, { right: true });
        return { level: k.levelInfo(), deaths: a.deaths, state: a.state };
      });
      expect(info.state).toBe('open');
      expect(info.level.cleared).toBe(true);
      expect(info.level.returned).toBe(true);
      await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy; });
      const s2 = await page.evaluate(() => (window as unknown as Win).__k11.mapState());
      expect(s2.stops[10].state).toBe('beaten');
      expect(s2.notice).toBe('THE WAY ON TO THE NEXT WORLD IS OPEN!');
      await page.locator('#owNext').click();
      await expect.poll(async () => (await page.evaluate(() => (window as unknown as Win).__k11.mapState())).crossing).toBe(true);
      const s3 = await settle(page);
      expect(s3).toMatchObject({ world: n + 1, at: 0 });
      expect((await page.evaluate(() => (window as unknown as Win).__k11.progress().wmap))).toEqual({ w: n + 1, at: 0 });
      expect(errors).toEqual([]);
    });
  }
});

/* ---- voices and every World 3-5 level file ---- */
/* reach LEVEL CLEAR: auto(30, {run: true}) first (it fights a boss arena too). Two World 3 levels need a turn
   back or a climb auto() never tries (3-2's semi-trailer: over the top, not under it; 3-7's switchback rack),
   so for a level auto() can't finish, a best-first search over short real-input moves (walk, hop, jump,
   running jump, either way, or straight up) from spots Kinan has really stood on finds the way to the goal.
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
test.describe('B2 · boss voices and the 33 World 3-5 level files', () => {
  test('every line a World 3-5 boss names exists; each recorded one is served from audio/voice/ as audio', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(async (kinds) => {
      const k = (window as unknown as Win).__k11;
      const lines = k.arenaLines(), byId = new Map(lines.map((l) => [l.id, l]));
      const named: string[] = [];
      for (const kd of k.arenaKinds().filter((x) => (kinds as string[]).includes(x.kind))) {
        const L = kd.lines;
        named.push(...L.intro, ...L.retry, ...L.phase.filter((x): x is string => !!x), ...Object.values(L.first), ...L.defeat);
      }
      const uniq = [...new Set(named)];
      const files: { id: string; status: number; type: string | null }[] = [];
      for (const id of uniq.filter((x) => byId.get(x)?.clip)) {
        const res = await fetch(`audio/voice/${id}.mp3`);
        files.push({ id, status: res.status, type: res.headers.get('content-type') });
      }
      return { missing: uniq.filter((id) => !byId.has(id)), files, n: uniq.length };
    }, ARENAS.map((x) => x.kind));
    expect(r.missing).toEqual([]);
    expect(r.files.length).toBe(32);                              /* the recorded clips; the moose and Bronco snort in subtitles (V3: Chenoa's "Bounce it back!" removed, QA) */
    for (const f of r.files) { expect(f.status, f.id).toBe(200); expect(f.type, f.id).toContain('audio/mpeg'); }
    expect(errors).toEqual([]);
  });

  for (const w of [3, 4, 5]) {
    test(`all 11 World ${w} level files reach LEVEL CLEAR — the fort and the castle fight their bosses with auto(30, {run: true})`, async ({ page }) => {
      test.setTimeout(300_000);
      const errors = watchErrors(page);
      await boot(page);
      const ids = ['1', '2', '3', '4', '5', 'fort', '6', '7', 'secret', '8', 'castle'].map((s) => `${w}-${s}`);
      const out = await page.evaluate(({ list, route }) => list.map((id) => Object.assign({ id }, (0, eval)(route)(id))), { list: ids, route: ROUTE }) as { id: string; how: string; n: number; tries?: number; cleared: boolean; boss: string | null }[];
      console.log(`B2 World ${w} LEVEL CLEAR: ` + out.map((o) => `${o.id} ${o.how}${o.how === 'search' ? ' (' + o.tries + ' moves)' : ' n=' + o.n}${o.boss ? ' boss=' + o.boss : ''}`).join(' · '));
      for (const lv of out) expect(lv.cleared, `${lv.id} (${lv.how})`).toBe(true);
      expect(out.filter((o) => o.boss).map((o) => [o.id, o.boss, o.how])).toEqual([[`${w}-fort`, 'open', 'auto'], [`${w}-castle`, 'open', 'auto']]);
      expect(errors).toEqual([]);
    });
  }
});

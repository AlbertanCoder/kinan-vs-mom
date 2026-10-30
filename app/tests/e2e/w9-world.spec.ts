import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* World 9 — Montreal (2026-10-29). The world end to end (w9-levels.spec.ts covers the level files):
   - the fort mini-boss (the hunter drone, 2 phases) and the castle boss (Annie's Firewall, 3 phases) follow the B1/B2
     rules (dumb first, smarter after every hit, every tell 0.6 s or more, no game over) and are beaten by
     __k11.arenaBot through the real input state, ending in LEVEL CLEAR,
   - the Firewall is never stomped: each hit is Kinan touching a glowing logic lock while it rests; Annie is never hit,
   - the turning-point lines play ("Okay. I was wrong about you, little guy."),
   - the KICK never hurts either boss, and no page errors. */

const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';

type LogEv = { f: number; ev: string; phase: number; atk?: string; wind?: number; hp?: number; lock?: boolean };
type Boss = { x: number; y: number; w: number; h: number; state: string; t: number; phase: number; hp: number; max: number; cur: string | null };
type Arena = {
  kind: string; name: string; state: string; floorY: number; phases: { windup: number }[]; cp: { x: number };
  boss: Boss; tell: string; log: LogEv[]; deaths: number; hp: number; voiceLog: string[]; subtitle: string;
  lock: { x: number; y: number; up: number } | null; pads: { x: number; k: number; lit: boolean }[] | null; rerouted: number; annie: object | null; annieHits: number; batted: number;
};
type Dev = {
  playLevel: (id: string) => unknown;
  levelInfo: () => { id: string | null; cleared: boolean };
  godMode: () => void; clearFoes: () => void; storyStop: () => void;
  place: (x: number, y: number) => unknown;
  step: (n: number, hold?: Record<string, boolean>) => unknown;
  auto: (n: number, opts?: { run?: boolean }) => unknown;
  arenaInfo: () => Arena | null;
  arenaBot: (n: number) => Arena;
  kickInfo: () => { kicks: number };
};
type Win = { __k11: Dev; KinanLevels: { ready: boolean } };

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

const ARENAS = [
  { id: '9-fort', kind: 'hunter-drone', phases: 2 },
  { id: '9-castle', kind: 'firewall', phases: 3 }
] as const;

const TO_ARENA = `(id) => {
  const k = window.__k11;
  k.playLevel(id); k.clearFoes(); k.storyStop();
  const a = k.arenaInfo();
  k.place(a.cp.x - 6, a.floorY - 18); k.step(20);
  return k.arenaInfo();
}`;

const FIGHT = `(src, id) => {
  const k = window.__k11;
  (0, eval)(src)(id);
  let a = k.arenaInfo(), frames = 0, windup = 0, bang = 0, lockOut = 0, padsOut = 0;
  const phasesSeen = [];
  while (frames < 30000 && a.state !== 'open') {
    a = k.arenaBot(1); frames++;
    const b = a.boss;
    if (b.state === 'windup') { windup++; if (a.tell === '!') bang++; }
    if (a.lock) lockOut++;
    if (a.pads) padsOut++;
    if (phasesSeen.indexOf(b.phase) < 0) phasesSeen.push(b.phase);
  }
  for (let n = 0; n < 2500 && !k.levelInfo().cleared; n++) k.arenaBot(1);
  return { a: k.arenaInfo(), frames, windup, bang, lockOut, padsOut, phasesSeen, cleared: k.levelInfo().cleared };
}`;

test.describe('World 9 · the hunter drone and Annie\'s Firewall', () => {
  test('9-fort and 9-castle load with no problems and declare their arenas', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev & { levels: () => { refused: unknown[]; levels: { id: string; problems: string[] }[] }; levelProblems: () => string[] } }).__k11;
      const out: Record<string, unknown> = { refused: k.levels().refused, w9: k.levels().levels.filter((l) => l.id.startsWith('9-')).map((l) => [l.id, l.problems]) };
      for (const id of ['9-fort', '9-castle']) { k.playLevel(id); out[id] = { problems: k.levelProblems(), kind: k.arenaInfo() ? k.arenaInfo()!.kind : null }; }
      return out;
    });
    expect(r.refused).toEqual([]);
    expect(r['9-fort']).toEqual({ problems: [], kind: 'hunter-drone' });
    expect(r['9-castle']).toEqual({ problems: [], kind: 'firewall' });
    expect(r.refused).toEqual([]);
    expect(errors).toEqual([]);
  });

  for (const lv of ARENAS) {
    test(`${lv.id} (${lv.kind}): a scripted run from the checkpoint beats it: tells of 0.6 s or more, smarter every phase, then a calm ending and LEVEL CLEAR`, async ({ page }) => {
      test.setTimeout(240_000);
      const errors = watchErrors(page);
      await boot(page);
      const r = await page.evaluate(({ to, fight, id }) => (0, eval)(fight)(to, id), { to: TO_ARENA, fight: FIGHT, id: lv.id }) as
        { a: Arena; frames: number; windup: number; bang: number; lockOut: number; padsOut: number; phasesSeen: number[]; cleared: boolean };
      expect(r.a.kind).toBe(lv.kind);
      expect(r.a.phases.length).toBe(lv.phases);
      for (const ph of r.a.phases) expect(ph.windup).toBeGreaterThanOrEqual(36);   /* 0.6 s at 60 fps */
      const hits = r.a.log.filter((e) => e.ev === 'hit');
      expect(hits.length).toBe(lv.phases);
      expect(r.phasesSeen.length).toBe(lv.phases);
      expect(r.windup).toBeGreaterThan(0);
      expect(r.bang).toBe(r.windup);   /* every wind-up shows its "!" */
      expect(r.a.deaths).toBe(0);
      expect(r.a.boss.state).toBe('friend');
      expect(r.cleared).toBe(true);
      if (lv.kind === 'firewall') {
        expect(hits.every((e) => e.lock === true)).toBe(true);   /* every hit is a logic lock, never a stomp */
        expect(r.lockOut).toBeGreaterThan(0);
        expect(r.padsOut).toBeGreaterThan(0);   /* the reroute's circuit pads came up */
        expect(r.a.annie).not.toBeNull();
        expect(r.a.annieHits).toBe(0);   /* Annie is never hit */
        const said = r.a.voiceLog.concat(r.a.log.map((e) => e.ev)).join(' ');
        expect(said).toContain('t_fw_08');   /* the turning point: "Okay. I was wrong about you, little guy." */
      }
      expect(errors).toEqual([]);
    });

    test(`${lv.id}: forty kicks at ${lv.kind} (busy and resting) never take a hit off it`, async ({ page }) => {
      test.setTimeout(120_000);
      const errors = watchErrors(page);
      await boot(page);
      const r = await page.evaluate(({ src, id }) => {
        const k = (window as unknown as Win).__k11;
        (0, eval)(src)(id);
        k.godMode();
        let a = k.arenaInfo()!;
        for (let n = 0; n < 3000 && a.state !== 'fight'; n++) a = k.arenaBot(1);
        const hitsNow = (): number => k.arenaInfo()!.log.filter((e) => e.ev === 'hit').length;
        let kicks = 0;
        const kickOnce = (): void => {
          /* kick from the side away from a glowing logic lock (touching the lock is the Firewall's real hit, not a kick) */
          const a1 = k.arenaInfo()!, b = a1.boss, fromRight = !!a1.lock && a1.lock.x < b.x + b.w / 2;
          k.place(fromRight ? b.x + b.w + 4 : b.x - 14, a1.floorY - 16);
          if (fromRight) { k.step(1, { left: true }); k.step(1, { left: false }); } else { k.step(1, { right: true }); k.step(1, { right: false }); }
          const k0 = k.kickInfo().kicks;
          for (let t = 0; t < 40 && k.kickInfo().kicks === k0; t++) k.step(1, { tapFire: true });
          k.step(16);
          kicks++;
        };
        const hp0 = k.arenaInfo()!.boss.hp;
        let h = hitsNow(), kickHits = 0;
        for (let n = 0; n < 20; n++) kickOnce();
        kickHits += hitsNow() - h;
        const busyHp = k.arenaInfo()!.boss.hp;
        a = k.arenaInfo()!;
        for (let n = 0; n < 8000 && !(a.boss.state === 'tired' || a.boss.state === 'dizzy'); n++) a = k.arenaBot(1);
        const restHp = a.boss.hp;
        h = hitsNow();
        for (let n = 0; n < 20 && (k.arenaInfo()!.boss.state === 'tired' || k.arenaInfo()!.boss.state === 'dizzy'); n++) kickOnce();
        kickHits += hitsNow() - h;
        const restAfter = k.arenaInfo()!.boss.hp;
        return { hp0, busyHp, restHp, restAfter, kicks, kickHits, annieHits: k.arenaInfo()!.annieHits };
      }, { src: TO_ARENA, id: lv.id });
      expect(r.kicks).toBeGreaterThanOrEqual(20);
      expect(r.busyHp).toBe(r.hp0);
      expect(r.kickHits).toBe(0);
      expect(r.restAfter).toBe(r.restHp);
      expect(r.annieHits).toBe(0);
      expect(errors).toEqual([]);
    });
  }

  test('both fights draw live (the drone, its beam and scanner bots; the walls, pads, cube, lock and Annie on her booth) without page errors', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const seen: string[] = [];
    for (const id of ['9-fort', '9-castle']) {
      await page.evaluate(({ src, lid }) => { (0, eval)(src)(lid); (window as unknown as Win).__k11.godMode(); }, { src: TO_ARENA, lid: id });
      for (let i = 0; i < 12; i++) {
        const s = await page.evaluate(() => { const a = (window as unknown as Win).__k11.arenaBot(150); return a.boss.state + (a.lock ? '+lock' : '') + (a.pads ? '+pads' : ''); });
        seen.push(id + ':' + s);
        await page.waitForTimeout(250);   /* the real frame loop draws this moment */
      }
    }
    console.log('W9 drawn states: ' + seen.join(' · '));
    expect(errors).toEqual([]);
  });

  test('9-castle story bubbles: Shad on the radio ("That\'s Annie! She thinks he\'s a virus..."), Kinan, the family and Annie over the speakers, as text only', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const talk = await page.evaluate(() => (window as unknown as { KinanLevels: { get: (id: string) => { talk: [number, string, string][]; theme: number } } }).KinanLevels.get('9-castle'));
    const who = new Set(talk.talk.map((t) => t[1]));
    for (const w of ['KINAN', 'SHAD', 'ANNIE', 'MOM', 'DAD', 'CHENOA']) expect(who.has(w), w).toBe(true);
    expect(talk.talk.some((t) => t[1] === 'SHAD' && t[2].includes("That's Annie! She thinks he's a virus..."))).toBe(true);
    expect(talk.theme).toBe(120);   /* its own conference-stage backdrop */
    expect(errors).toEqual([]);
  });

  test('9-fort and 9-castle reach LEVEL CLEAR with auto(30, {run: true}), fighting their bosses on the way', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    await boot(page);
    for (const id of ['9-fort', '9-castle']) {
      const o = await page.evaluate((lid) => {
        const k = (window as unknown as Win).__k11;
        k.playLevel(lid); k.godMode(); k.clearFoes();
        for (let n = 0; n < 500 && !k.levelInfo().cleared; n++) k.auto(30, { run: true });
        const a = k.arenaInfo();
        return { cleared: k.levelInfo().cleared, boss: a ? a.state : null };
      }, id);
      expect(o.cleared, id).toBe(true);
      expect(o.boss, id).toBe('open');
    }
    expect(errors).toEqual([]);
  });
});

/* ---- on the map ---- */
type MapS = { mounted: boolean; walking: boolean; crossing: boolean; busy: boolean; banner: string | null; notice: string | null; world: number | null; at: number; gate?: number | null;
  stops: { id: string | null; kind: string; built: boolean; state: string | null }[]; fly?: { world: number; riding: string | null; phase: string; home: string } | null };
type CutS = { on: boolean; mode: string | null; lines: string[]; belt?: { rank: number; catchup: boolean; line: string } };
type MapDev = Dev & { mapState: () => MapS; cut: () => CutS; cutSpeed: (n: number) => number; levelInfo: () => { id: string | null; cleared: boolean; returned: boolean };
  progress: () => { wmap: { w: number; at: number } | null; escapes: Record<string, number>; beltSeen: number }; belt: () => { rank: number; key: string; stripes: number } };
const mk = (page: Page) => ({
  map: (): Promise<MapS> => page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.mapState()),
  cut: (): Promise<CutS> => page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.cut())
});
async function settle(page: Page, timeout = 60_000): Promise<MapS> {
  await page.waitForFunction(() => { const k = (window as unknown as { __k11: MapDev }).__k11; const s = k.mapState(); return s.mounted && !s.walking && !s.crossing && !s.busy && !s.banner && !k.cut().on; }, null, { timeout });
  return mk(page).map();
}
async function seedSave(page: Page, make: string): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
  await page.evaluate(({ key, make }) => {
    const ids = (window as unknown as { KinanLevels: { list: () => string[] } }).KinanLevels.list();
    localStorage.setItem(key, JSON.stringify((0, eval)(make)(ids)));
  }, { key: CURRENT, make });
  await page.reload();
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
}
const BEAT_HERE = `() => {
  const k = window.__k11;
  k.clearFoes();
  const a0 = k.arenaInfo(); k.place(a0.cp.x - 6, a0.floorY - 18); k.step(20);
  let a = k.arenaInfo();
  for (let f = 0; f < 30000 && a.state !== 'open'; f++) a = k.arenaBot(1);
  for (let m = 0; m < 2500 && !k.levelInfo().cleared; m++) k.arenaBot(1);
  for (let m = 0; m < 1500 && !k.levelInfo().returned; m++) k.step(1, { right: true });
  return { level: k.levelInfo(), deaths: a.deaths, state: a.state, annieHits: a.annieHits };
}`;
const SECRETS = (n: number): string => JSON.stringify(Array.from({ length: n }, (_, i) => `${i + 1}-secret`));
const ESCAPES = (n: number): string => JSON.stringify(Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, 1])));

test.describe('World 9 · on the map', () => {
  test('World 9 opens after the 8-castle: no "coming soon" sign, Kinan crosses into World 9, and its stops are 9-1 .. 9-8, 9-fort, 9-secret, 9-castle', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    await seedSave(page, `(ids) => ({ unlocked: 1, beaten: [], introSeen: true, beltSeen: 8, levelsBeaten: Object.fromEntries(ids.filter((id) => Number(id.split('-')[0]) <= 8).map((id) => [id, 1])), unlockedLevels: ${SECRETS(8)}, escapes: ${ESCAPES(8)}, wmap: { w: 8, at: 10 } })`);
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    expect(s0).toMatchObject({ world: 8, at: 10 });
    expect(s0.gate ?? null, 'no World 9 sign').toBeNull();
    await page.locator('#owNext').click();
    await expect.poll(async () => (await mk(page).map()).crossing).toBe(true);
    const s2 = await settle(page, 90_000);
    expect(s2.world).toBe(9);
    expect(s2.at).toBe(0);
    expect(s2.stops.map((q) => [q.id, q.kind, q.built])).toEqual([
      ['9-1', 'level', true], ['9-2', 'level', true], ['9-3', 'level', true], ['9-4', 'level', true], ['9-5', 'level', true],
      ['9-fort', 'fort', true], ['9-6', 'level', true], ['9-secret', 'secret', true], ['9-7', 'level', true], ['9-8', 'level', true],
      ['9-castle', 'boss', true]]);
    expect(s2.stops[0].state).toBe('open');
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.levelInfo().id)).toBe('9-1');
    expect(errors).toEqual([]);
  });

  /* 2026-10-29: World 10 is released (OW_RELEASED 10), so the way on is open (it was a "WORLD 10 COMING SOON!" sign: that
     sign now stands past the 10-castle for World 11: w10-world.spec.ts, c1-cutscenes.spec.ts) */
  test('the 9-castle: the exit stays shut until the cube opens; then Glitchy bolts onto a tour boat, Sabumnim\'s belt scene follows, and the way on leads over the boat trip into World 10', async ({ page }) => {
    test.setTimeout(300_000);
    const errors = watchErrors(page);
    await seedSave(page, `(ids) => ({ unlocked: 1, beaten: [], introSeen: true, beltSeen: 8, levelsBeaten: Object.fromEntries(ids.filter((id) => Number(id.split('-')[0]) <= 9 && id !== '9-castle').map((id) => [id, 1])), unlockedLevels: ${SECRETS(9)}, escapes: ${ESCAPES(8)}, wmap: { w: 9, at: 10 } })`);
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    expect(s0).toMatchObject({ world: 9, at: 10 });
    expect(s0.stops[10]).toMatchObject({ id: '9-castle', kind: 'boss', built: true, state: 'open' });
    await page.locator('#owNext').click();
    const s1 = await settle(page);
    expect(s1).toMatchObject({ world: 9, at: 10 });   /* the exit is shut */
    await page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.cutSpeed(3));
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.levelInfo().id)).toBe('9-castle');
    const r = await page.evaluate(`(${BEAT_HERE})()`) as { level: { cleared: boolean; returned: boolean }; state: string; annieHits: number };
    expect(r.state).toBe('open');
    expect(r.level.cleared).toBe(true);
    expect(r.level.returned).toBe(true);
    expect(r.annieHits).toBe(0);
    await expect.poll(async () => (await mk(page).cut()).mode, { timeout: 15_000, intervals: [100] }).toBe('escape');
    const worlds = new Set<number>(), riding: (string | null)[] = [];
    for (let i = 0; i < 400; i++) {
      const f = (await mk(page).map()).fly;
      if (!f) break;
      worlds.add(f.world); riding.push(f.riding);
      expect(f.home).toBe('9:10');
      await page.waitForTimeout(50);
    }
    expect(riding.some((x) => x === 'boat'), 'Glitchy rides the tour boat').toBe(true);
    expect(riding.filter((x) => x).every((x) => x === 'boat')).toBe(true);
    /* Sabumnim's belt scene follows the escape: World 9's line */
    await expect.poll(async () => (await mk(page).cut()).mode, { timeout: 30_000, intervals: [100] }).toBe('belt');
    const belt = await mk(page).cut();
    expect(belt.lines[0]).toBe('w09_glitchy_03');
    for (const id of belt.lines) expect(['w09_glitchy_03', 'w09_annie_19', 'w09_robin_01']).toContain(id);
    expect(belt.belt).toMatchObject({ rank: 9, catchup: false, line: 'belt_w09' });
    await expect.poll(async () => (await mk(page).cut()).on, { timeout: 40_000 }).toBe(false);
    const s2 = await settle(page);
    expect(s2).toMatchObject({ world: 9, at: 10 });
    expect(s2.stops[10].state).toBe('beaten');
    expect(s2.notice).not.toBe('WORLD 10 COMING SOON!');
    expect(s2.gate ?? null).toBeNull();
    expect(await page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.progress())).toMatchObject({ escapes: { 9: 1 }, beltSeen: 9 });
    await page.locator('#owNext').click();
    await expect.poll(async () => (await mk(page).map()).crossing, { timeout: 10_000 }).toBe(true);
    await page.evaluate(() => (window as unknown as { KINAN: { speed: (n: number) => void } }).KINAN.speed(6));   /* the boat trip is a long road (as in the seams test) */
    expect(await settle(page, 90_000)).toMatchObject({ world: 10, at: 0 });
    expect(await page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.progress().wmap)).toEqual({ w: 10, at: 0 });
    expect(errors).toEqual([]);
  });
});

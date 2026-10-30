import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* FAMILY HELPERS MOVE LIKE KINAN (fixes run 2, Shad: "it looks like I'm just running through walls").
   index.html block "FAMILY HELPERS MOVE LIKE KINAN": Dad (Mom with the care package in Worlds 2+) and Big Bro Shad's
   CONSTRUCTION SLAM come to Kinan along the ground with the level's own collision, jumping walls and gaps the way he
   would; when the way is impossible they leap in from the nearest screen edge onto a safe spot beside him. Here, in two
   levels of every world 1-8 and in the 1-castle arena with its gates shut, Kinan is stopped at several places, each
   helper is called, and every frame of the way in, the visit and the way out his box is checked against the tiles. */
const DEV_URL = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html?devtools=1`;

type Fam = { x: number; y: number; w: number; h: number; state: string; how: string | null; jumps: number; onGround: boolean; overlap: boolean; mom: boolean } | null;
type Info = { dad: Fam; bro: Fam; px: number; py: number; camX: number };
type Dev = {
  playLevel: (id: string) => unknown; godMode: () => void; clearFoes: () => void; storyStop: () => void; freeze: (on: boolean) => boolean;
  auto: (n: number, o?: { run?: boolean }) => unknown; step: (n: number, o?: Record<string, boolean>) => { onGround: boolean }[];
  place: (x: number, y: number) => unknown; levelInfo: () => { cleared: boolean };
  famCall: (who: 'dad' | 'bro') => Info; famInfo: () => Info;
  arenaInfo: () => { state: string; cp: { x: number }; floorY: number } | null;
  state: () => { onGround: boolean; boss: string };
};
type Win = Window & { __k11: Dev; KinanLevels: { ready: boolean; list: () => string[]; get: (id: string) => { world: number } } };
type Visit = { level: string; at: number; who: string; came: boolean; how: string | null; jumps: number; bad: string[]; dist: number; where: string; waited: boolean; kinanGround: boolean };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function boot(page: Page): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
}

/* in the page: call one helper and step until he is gone, checking every frame */
const VISIT = `(level, at, who) => {
  const k = window.__k11;
  for (let n = 0; n < 90 && !k.state().onGround; n++) k.step(1);
  const kinanGround = k.state().onGround;
  let i = k.famCall(who), came = false, how = null, jumps = 0, dist = 1e9, waited = false;
  const bad = [];
  for (let f = 0; f < 520; f++) {
    const h = i[who];
    if (!h) break;
    if (h.how === 'wait') { waited = true; k.step(1); i = k.famInfo(); continue; }   /* not on screen while he waits */
    if (h.overlap) bad.push(f + ':' + h.state + ':' + h.how + '@' + h.x + ',' + h.y + ' vy ' + h.vy + ' land ' + h.land + ' tiles ' + JSON.stringify(h.hits));
    if (!came && (h.state === 'act' || h.state === 'jump')) { came = true; how = h.how; jumps = h.jumps; dist = Math.abs(h.x - i.px); }
    k.step(1);
    i = k.famInfo();
  }
  const s = k.state(), tx = Math.floor((s.px + 5) / 16), ty = Math.floor((s.py + 17) / 16);
  const where = came ? '' : 'kinan ' + s.px + ',' + s.py + ' ground ' + s.onGround + ' tiles below ' + [0, 1, 2].map((d) => k.tile(tx, ty + d)).join('/');
  return { level, at, who, came, how, jumps, bad, dist, where, waited, kinanGround };
}`;

test.describe('Family helpers come to Kinan like Kinan would: never through a wall', () => {
  test('two levels of every world 1-8: Dad (or Mom) and Big Bro never overlap a solid tile, on the way in, there, or on the way out', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    await boot(page);
    const levels = await page.evaluate(() => {
      const K = (window as unknown as Win).KinanLevels, out: string[] = [];
      for (let w = 1; w <= 8; w++) {
        const ids = K.list().filter((id) => K.get(id).world === w && /^\d+-\d+$/.test(id));
        if (ids[1]) out.push(ids[1]);
        if (ids[4]) out.push(ids[4]);
      }
      return out;
    });
    expect(levels.length).toBe(16);
    const visits: Visit[] = [];
    for (const id of levels) {
      const r = await page.evaluate(`((VISIT) => {
        const k = window.__k11, out = [];
        k.playLevel(${JSON.stringify(id)}); k.godMode(); k.clearFoes(); k.storyStop();
        for (let at = 0; at < 4 && !k.levelInfo().cleared; at++) {
          k.auto(110 + at * 40, { run: true });
          if (k.levelInfo().cleared) break;
          out.push(VISIT(${JSON.stringify(id)}, at, 'bro'));
          out.push(VISIT(${JSON.stringify(id)}, at, 'dad'));
        }
        k.freeze(true);
        return out;
      })(${VISIT})`) as Visit[];
      visits.push(...r);
    }
    console.log('helper visits: ' + JSON.stringify(visits.map((v) => `${v.level}#${v.at} ${v.who}: ${v.came ? v.how : 'stayed away'} jumps ${v.jumps}`)));
    expect(visits.length).toBeGreaterThanOrEqual(80);
    const walls = visits.filter((v) => v.bad.length).map((v) => `${v.level}#${v.at} ${v.who}: ${v.bad.slice(0, 3).join(' | ')}`);
    expect(walls, 'helpers inside a wall').toEqual([]);
    for (const v of visits) {
      expect(v.bad, `${v.level} stop ${v.at}, ${v.who}: inside a wall`).toEqual([]);
      /* he comes; the one exception is Kinan up in the air with nothing to stand on near him: then the helper waits out of sight */
      if (!v.came) expect({ waited: v.waited, kinanGround: v.kinanGround }, `${v.level} stop ${v.at}, ${v.who}: came to Kinan (${v.where})`).toEqual({ waited: true, kinanGround: false });
      else expect(v.dist, `${v.level} stop ${v.at}, ${v.who}: beside Kinan`).toBeLessThan(432 * 0.5);
    }
    expect(visits.filter((v) => v.came).length, 'almost every call comes').toBeGreaterThan(visits.length - 4);
    /* they really run (and jump things on the way) most of the time; the leap is for the impossible ways */
    const runs = visits.filter((v) => v.how === 'run');
    expect(runs.length).toBeGreaterThan(visits.length / 2);
    expect(runs.filter((v) => v.jumps > 0).length, 'some runs jump a wall or a gap').toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });

  test('the 1-castle arena with its gates shut: the way in is impossible, so they leap in beside Kinan, never through the gate', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(`((VISIT) => {
      const k = window.__k11;
      k.playLevel('1-castle'); k.godMode(); k.clearFoes(); k.storyStop();
      const a0 = k.arenaInfo(); k.place(a0.cp.x - 6, a0.floorY - 18); k.step(20);
      for (let n = 0; n < 600 && k.arenaInfo().state !== 'fight'; n++) k.step(1, { right: true });
      const fight = k.arenaInfo().state;
      k.step(12);
      const out = [VISIT('1-castle', 0, 'bro'), VISIT('1-castle', 0, 'dad')];
      k.freeze(true);
      return { fight, out };
    })(${VISIT})`) as { fight: string; out: Visit[] };
    console.log('arena visits: ' + JSON.stringify(r));
    expect(r.fight, 'the fight is on: the gates are shut').toBe('fight');
    for (const v of r.out) {
      expect(v.bad, `${v.who}: inside a wall`).toEqual([]);
      expect(v.came, `${v.who}: came to Kinan`).toBe(true);
      expect(v.how, `${v.who}: the gate is shut, so he leaps in`).toBe('leapt');
    }
    expect(errors).toEqual([]);
  });
});

import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/* WORLD 12's ROUGH-DRAFT SIDE LEVELS (12-4, 12-5, the fort and 12-6 are the live sneak peek; 12-7, the secret and 12-8 are
   Developer mode only): 12-4 THE WEIR RAPIDS, 12-5 THE BROADWAY BRIDGE ARCHES,
   FORT DOWNTOWN SKYLINE and 12-6 KINSMEN PARK RIDES. For each one:
   - it loads as a 2.5D level (a small window and low quality: software WebGL is slow) with the title it should have,
     candles, three golden candles, 2 to 4 foes, the one checkpoint and an open goal;
   - the foes are gentle: Kinan stands in the first one and keeps every heart, and a KICK sends it off;
   - a fall in the river or the street only goes back to the start or the checkpoint (nobody is hurt, nobody is out);
   - the goal can be reached with the dev hooks (a teleport near the end, then real key presses, as w12-finale.spec.ts
     does): LEVEL CLEAR, and the clear is saved under the level's map stop;
   - the map side: the stop opens the level, and World 12 stays unreleased (OW_RELEASED 11).
   No page errors in any of it. Screenshots for Shad: app/w12-levels-shots/<project>/ */
const BASE = `http://127.0.0.1:${process.env.KVM_PORT || '4174'}/`;
const SHOTS = fileURLToPath(new URL('../../w12-levels-shots/', import.meta.url));
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

type LevelDef = { file: string; stop: string; title: string; minCandles: number };
const LEVELS: LevelDef[] = [
  { file: '12-4', stop: '12-4', title: 'THE WEIR RAPIDS', minCandles: 50 },
  { file: '12-5', stop: '12-5', title: 'THE BROADWAY BRIDGE ARCHES', minCandles: 50 },
  { file: '12-fort', stop: '12-fort', title: 'FORT: DOWNTOWN SKYLINE', minCandles: 50 },
  { file: '12-6', stop: '12-6', title: 'KINSMEN PARK RIDES', minCandles: 50 },
  { file: '12-7', stop: '12-7', title: 'THE ART GALLERY', minCandles: 50 },
  { file: '12-secret', stop: '12-secret', title: 'SECRET: UNDER THE RIVER', minCandles: 50 },
  { file: '12-8', stop: '12-8', title: 'THE ARENA', minCandles: 50 },
];

type Info = { mode: string; pos: number[]; hearts: number; maxHearts: number; grounded: boolean; checkpoint: number[]; enemiesAlive: number; totalCandles: number; totalGolden: number; cleared: boolean; deaths: number };
type Foe = { alive: boolean; def: { type: string }; pos: { x: number; y: number; z: number } };
type Game = {
  ready: boolean; mode: string; time: number; respawning?: boolean; onUpdate: (fn: () => void) => void;
  player: { kick: () => void; place: (x: number, y: number, z: number, yaw: number) => void };
  side: { at: (s: number) => { x: number; z: number; tx: number; tz: number }; project: (x: number, z: number) => { s: number } } | null;
  start: () => void; info: () => Info; sideInfo: () => { s: number; off: number; length: number } | null;
  teleport: (x: number, y: number, z: number, yaw?: number) => void;
  entities: { goal: { locked: boolean; p: { x: number; y: number; z: number } } | null; enemies: Foe[]; checkpoints: unknown[]; movers: unknown[] };
  level: { id: string; killY: number };
};
type Win = { GAME?: Game; KinanLevels?: { ready: boolean }; __k11: { owLevelFile: (id: string) => string | null } };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function shot(page: Page, name: string): Promise<void> {
  const dir = `${SHOTS}${test.info().project.name}/`;
  mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: `${dir}${name}.png` });
}
/* 2026-10-30 (the World 12 sneak peek): the first four are the live levels and open exactly as the live site opens them; the
   other three (and every other World 12 level) open only with ?devtools=1 (localhost), as the dev map link does (w12-preview.spec.ts) */
const LIVE = ['12-4', '12-5', '12-fort', '12-6'];
async function boot(page: Page, def: LevelDef): Promise<void> {
  await page.setViewportSize({ width: 640, height: 360 });
  await page.goto(`${BASE}3d/level-12-1.html?level=${def.file}&id=${def.stop}&q=low${LIVE.includes(def.file) ? '' : '&devtools=1'}`);
  await page.waitForFunction(() => { const g = (window as unknown as Win).GAME; return !!(g && g.ready && g.player); }, null, { timeout: 150_000 });
  await page.evaluate(() => { const g = (window as unknown as Win).GAME!; if (g.mode === 'title') g.start(); });
}
const settle = (page: Page, ms = 700) => page.waitForTimeout(ms);

test.describe('World 12 rough-draft side levels', () => {
  for (const def of LEVELS) {
    test(`${def.stop} ${def.title}: loads, foes are gentle, a fall only goes back, the goal is reached`, async ({ page }) => {
      test.setTimeout(420_000);
      const errors = watchErrors(page);
      await boot(page, def);
      expect(await page.evaluate(() => document.getElementById('titlecard')!.querySelector('h1')!.textContent)).toBe(def.title);
      const r = await page.evaluate(() => {
        const g = (window as unknown as Win).GAME!, i = g.info();
        return { id: g.level.id, foes: i.enemiesAlive, candles: i.totalCandles, golden: i.totalGolden, side: g.sideInfo(), cps: g.entities.checkpoints.length, movers: g.entities.movers.length, locked: g.entities.goal!.locked, hearts: i.hearts, killY: g.level.killY };
      });
      expect(r.id).toBe(def.file);
      expect(r.foes, 'two to four gentle foes').toBeGreaterThanOrEqual(2);
      expect(r.foes).toBeLessThanOrEqual(4);
      expect(r.candles).toBeGreaterThan(def.minCandles);
      expect(r.golden).toBe(3);
      expect(r.cps, 'one checkpoint').toBe(1);
      expect(r.movers, 'something moves').toBeGreaterThan(0);
      expect(r.side!.length).toBeGreaterThan(200);
      expect(r.locked, 'the goal is open').toBe(false);
      await settle(page, 1500);
      await shot(page, `${def.stop}-01-start`);

      /* the foes are gentle: Kinan stands right in the first one and keeps every heart ... */
      const stood = await page.evaluate(async () => {
        const g = (window as unknown as Win).GAME!, e = g.entities.enemies[0], h0 = g.info().hearts;
        const a = g.side!.at(g.side!.project(e.pos.x, e.pos.z).s - 0.2);
        for (let k = 0; k < 6; k++) { g.teleport(e.pos.x, e.pos.y + 0.1, e.pos.z, Math.atan2(a.tx, a.tz) * 180 / Math.PI); await new Promise((res) => setTimeout(res, 250)); }
        return { h0, h1: g.info().hearts, alive: e.alive };
      });
      expect(stood.h1, 'standing in a foe hurts nobody').toBe(stood.h0);
      expect(stood.alive).toBe(true);
      /* ... and a KICK sends it off (and the second foe too, by the same kick) */
      const kicked = await page.evaluate(async () => {
        const g = (window as unknown as Win).GAME!, out: boolean[] = [];
        for (const e of g.entities.enemies.slice(0, 2)) {
          const s = g.side!.project(e.pos.x, e.pos.z).s, a = g.side!.at(s - 1.4);   // 1.4 behind the foe, facing it: the kick reaches 1.6
          g.teleport(a.x, e.pos.y + 0.1, a.z, Math.atan2(a.tx, a.tz) * 180 / Math.PI);
          g.player.kick();
          await new Promise((res) => setTimeout(res, 300));
          out.push(!e.alive);
        }
        return out;
      });
      expect(kicked, 'a kick sends a foe off').toEqual([true, true]);

      /* a fall only goes back: into the river (or the street) below the level, then the start or the checkpoint */
      const fell = await page.evaluate(async () => {
        const g = (window as unknown as Win).GAME!, a = g.side!.at(60);
        g.teleport(a.x, g.level.killY - 3, a.z);
        const t0 = Date.now();
        while (!g.respawning && Date.now() - t0 < 8000) await new Promise((res) => setTimeout(res, 100));
        const went = !!g.respawning;
        while (g.respawning && Date.now() - t0 < 16000) await new Promise((res) => setTimeout(res, 100));
        await new Promise((res) => setTimeout(res, 500));
        const i = g.info(), c = i.checkpoint;
        return { went, back: !g.respawning, near: Math.hypot(i.pos[0] - c[0], i.pos[2] - c[2]), mode: i.mode, hearts: i.hearts };
      });
      expect(fell.went, 'falling starts the retry').toBe(true);
      expect(fell.back, 'and it ends').toBe(true);
      expect(fell.near, 'back at the start or the checkpoint').toBeLessThan(6);
      expect(fell.mode).toBe('play');
      expect(fell.hearts, 'nobody is out').toBeGreaterThan(0);

      /* the goal, with the dev hooks: a teleport near the end, then walk into it with a real key */
      await page.evaluate(() => {
        const g = (window as unknown as Win).GAME!, G = g.entities.goal!.p, s = g.side!.project(G.x, G.z).s, a = g.side!.at(s - 5);
        g.teleport(a.x, G.y + 0.3, a.z, Math.atan2(a.tx, a.tz) * 180 / Math.PI);
      });
      await page.waitForFunction(() => (window as unknown as Win).GAME!.info().grounded, null, { timeout: 30_000 });
      await shot(page, `${def.stop}-02-near-the-goal`);
      await page.keyboard.down('KeyD');
      await page.waitForFunction(() => (window as unknown as Win).GAME!.info().cleared, null, { timeout: 90_000 });
      await page.keyboard.up('KeyD');
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('kinan-remaster-v1') || '{}').levelsBeaten);
      expect(saved[def.stop], 'the clear is saved under the map stop').toBe(1);
      await expect(page.locator('#clear.on #btn-map')).toBeVisible({ timeout: 30_000 });   // the LEVEL CLEAR panel
      await shot(page, `${def.stop}-03-level-clear`);
      expect(errors, errors.join('\n')).toEqual([]);
    });
  }

  /* the parts most likely to be wrong, checked on the game's own clock: the arches can be walked, the train and a Ferris seat carry Kinan */
  test('12-5: walking right (no jumps) climbs over the first two arches to the gap', async ({ page }) => {
    test.setTimeout(300_000);
    const errors = watchErrors(page);
    await boot(page, LEVELS[1]);
    const r = await page.evaluate(() => new Promise<{ s: number; y: number; maxY: number; t: number; fell: boolean }>((resolve) => {
      const g = (window as unknown as Win).GAME!, t0 = g.time;
      let maxY = 0, fell = false;
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD', key: 'KeyD' }));
      g.onUpdate(() => {
        const i = g.info(), s = g.sideInfo()!.s;
        maxY = Math.max(maxY, i.pos[1]); fell = fell || !!g.respawning;
        if (s >= 136 || fell || g.time - t0 > 60) { window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD', key: 'KeyD' })); resolve({ s, y: i.pos[1], maxY, t: g.time - t0, fell }); }
      });
    }));
    expect(r.fell, 'nobody fell').toBe(false);
    expect(r.s, `walked to the gap in ${r.t.toFixed(1)} s`).toBeGreaterThanOrEqual(136);
    expect(r.maxY, 'over the crown of arch 2').toBeGreaterThan(6);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('12-6: the little train and a Ferris-wheel seat carry Kinan along', async ({ page }) => {
    test.setTimeout(300_000);
    const errors = watchErrors(page);
    await boot(page, LEVELS[3]);
    /* the page's game object, loosely typed: this probe reaches into the movers */
    const r = await page.evaluate(() => new Promise<{ train: number[]; wheel: number[]; fell: boolean }>((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = (window as any).GAME;
      type P = { x: number; y: number; z: number };
      const sOf = (p: P): number => g.side.project(p.x, p.z).s;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lifts = g.entities.movers.filter((m: any) => m.kind === 'lift'), wheel = g.entities.movers.find((m: any) => m.kind === 'wheel');
      const probe = (top: () => P, secs: number) => new Promise<number[]>((done) => {
        const p0 = { ...top() }; g.teleport(p0.x, p0.y + 0.4, p0.z, -90);
        const t0 = g.time, start = sOf(p0); let worst = 0, moved = 0;
        g.onUpdate(() => {
          if (g.time - t0 > secs) return;
          const k = top(), i = g.info(), d = Math.hypot(i.pos[0] - k.x, i.pos[2] - k.z, (i.pos[1] - k.y) * 0.5);
          worst = Math.max(worst, d); moved = Math.max(moved, Math.abs(sOf(k) - start) + Math.abs(k.y - p0.y));
          if (g.time - t0 > secs - 0.05) done([+worst.toFixed(2), +moved.toFixed(2)]);
        });
      });
      let fell = false;
      g.onUpdate(() => { fell = fell || !!g.respawning; });
      probe(() => lifts[1].g.position, 6).then((train) => probe(() => wheel.seats[0].g.position, 4).then((w) => resolve({ train, wheel: w, fell })));
    }));
    expect(r.fell, 'nobody fell off').toBe(false);
    expect(r.train[1], 'the train moved').toBeGreaterThan(5);
    expect(r.train[0], 'and Kinan stayed on the car').toBeLessThan(2.6);
    expect(r.wheel[1], 'the seat went round').toBeGreaterThan(4);
    expect(r.wheel[0], 'and Kinan stayed on the seat').toBeLessThan(2.6);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  /* 12-7: the roof slide really carries Kinan down, and the hidden painting behind the start opens the SECRET stop in the save */
  test('12-7: the roof slide carries Kinan down; the hidden painting opens the secret stop', async ({ page }) => {
    test.setTimeout(300_000);
    const errors = watchErrors(page);
    await boot(page, LEVELS[4]);
    const slid = await page.evaluate(() => new Promise<{ s0: number; s1: number; y1: number; fell: boolean }>((resolve) => {
      const g = (window as unknown as Win).GAME!, a = g.side!.at(324), t0 = g.time;
      g.teleport(a.x, 10 * (370 - 324) / 52 + 0.4, a.z, -90);   // on the roof slope at s 324 (the slope runs from s 318, y 10, down to s 370, y 0)
      const s0 = g.sideInfo()!.s;
      let fell = false;
      g.onUpdate(() => {
        fell = fell || !!g.respawning;
        if (g.time - t0 > 4) resolve({ s0, s1: g.sideInfo()!.s, y1: g.info().pos[1], fell });
      });
    }));
    expect(slid.fell, 'nobody fell').toBe(false);
    expect(slid.s1 - slid.s0, 'the slide carried him down the roof with no key pressed').toBeGreaterThan(25);
    expect(slid.y1, 'down at the terrace').toBeLessThan(3);
    /* the painting: s 7, behind the start */
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('kinan-remaster-v1') || '{}').unlockedLevels || [])).not.toContain('12-secret');
    await page.evaluate(() => { const g = (window as unknown as Win).GAME!, a = g.side!.at(9); g.teleport(a.x, 0.3, a.z, 90); });
    await page.waitForFunction(() => (JSON.parse(localStorage.getItem('kinan-remaster-v1') || '{}').unlockedLevels || []).includes('12-secret'), null, { timeout: 30_000 });
    await shot(page, '12-7-04-secret-opened');
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('the map side: every new stop opens its level, and World 12 stays unreleased', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await page.goto(`${BASE}index.html?devtools=1`);
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    for (const def of LEVELS) expect(await page.evaluate((id) => (window as unknown as Win).__k11.owLevelFile(id), def.stop), `${def.stop} opens ${def.file}`).toBe(def.file);
    expect(readFileSync(`${ROOT}index.html`, 'utf8')).toContain('const OW_RELEASED = 11;');
    const sw = readFileSync(`${ROOT}sw.js`, 'utf8');
    for (const def of LEVELS) expect(sw, `${def.file}.js is cached for offline play`).toContain(`./3d/levels/${def.file}.js`);
    expect(errors, errors.join('\n')).toEqual([]);
  });
});

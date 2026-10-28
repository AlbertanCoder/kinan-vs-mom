import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* Builder-owned (outside the TE globs). M4b "levels as files": every level
   registered from levels/ builds in the real engine with a spawn on solid
   ground and a goal; the dev URL ?devtools=1&level=<id> plays one level; the
   goal is a non-blocking LEVEL CLEAR that returns to the map stub; authored
   levels never write a CONTINUE spot; production ignores ?level=. */

const BASE = 'http://127.0.0.1:4174/index.html';
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';
const T = 16;

type Info = {
  id: string | null; name: string | null; world: number | null; slot: number | null; cols: number; w: number;
  goal: { x: number; tx: number; ty: number } | null; start: { col: number; row: number } | null;
  area: string | null; seams: { x: number; to: string; done: boolean }[];
  newWorld: boolean; cleared: boolean; returned: boolean; screen: boolean; dialog: boolean; toast: string;
};
type Probe = { x: number; y: number; vx: number; vy: number; onGround: boolean };
type Dev = {
  levels: () => { ready: boolean; refused: string[]; levels: { id: string; file: string; problems: string[]; lint: string[] }[] };
  playLevel: (idOrDef: unknown) => { id: string; cols: number } | null;
  levelInfo: () => Info;
  levelProblems: () => string[];
  godMode: () => void;
  clearFoes: () => void;
  place: (x: number, y: number) => { x: number; y: number; onGround: boolean };
  step: (n: number, hold?: { left?: boolean; right?: boolean; jump?: boolean; tapJump?: boolean; fire?: boolean }) => Probe[];
  state: () => { paused: boolean };
  progress: () => { resume?: { i: number } };
};
type Win = { __k11: Dev; KinanLevels?: { ready: boolean }; __dlg?: number };

const fixture = (name: string): string =>
  readFileSync(fileURLToPath(new URL(`../fixtures/saves/${name}`, import.meta.url)), 'utf8');

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

async function seed(page: Page): Promise<void> {
  await page.addInitScript(({ key, raw }) => {
    const data = JSON.parse(raw);
    data.mapWorld = 1;
    data.mapSeen = {};
    data.mapSel = {};
    delete data.explorer;
    data.pets = { ids: [], names: {} };
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: CURRENT, raw: fixture('kinan-remaster-v1.sample.json') });
}

async function boot(page: Page, url = DEV_URL): Promise<void> {
  await seed(page);
  await page.goto(url);
  await page.waitForFunction(() => {
    const w = window as unknown as Win;
    return typeof w.__k11 === 'object' && !!w.KinanLevels && w.KinanLevels.ready;
  });
}

test.describe('M4b levels as files — every registered level builds and plays', () => {
  test('every registered level builds with a spawn on solid ground and a reachable-standing goal', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      const reg = k.levels();
      const out = reg.levels.map((lv) => {
        const started = k.playLevel(lv.id);
        const info = k.levelInfo();
        k.godMode(); k.clearFoes();
        /* the spawn: dropped there, Kinan comes to rest on ground near it */
        const sx = info.start!.col * 16, sy = info.start!.row * 16;
        k.place(sx, sy);
        const s = k.step(90);
        const atSpawn = s[s.length - 1];
        /* the goal: dropped from 3 tiles above it, there is ground to stand on */
        k.place(info.goal!.tx * 16 + 3, (info.goal!.ty - 3) * 16);
        const g = k.step(120);
        const atGoal = g[g.length - 1];
        return {
          id: lv.id, problems: lv.problems, lint: lv.lint, started: !!started, newWorld: info.newWorld, cols: info.cols, w: info.w,
          goal: info.goal, spawnGrounded: atSpawn.onGround && Math.abs(atSpawn.x - sx) < 2, spawnFeet: atSpawn.y + 16,
          goalGrounded: atGoal.onGround, goalX: atGoal.x
        };
      });
      return { refused: reg.refused, n: reg.levels.length, out };
    });
    expect(r.refused).toEqual([]);
    expect(r.n).toBeGreaterThan(0);
    for (const lv of r.out) {
      expect(lv.problems, lv.id).toEqual([]);
      expect(lv.lint, lv.id).toEqual([]);
      expect(lv.started, lv.id).toBe(true);
      expect(lv.newWorld, lv.id).toBe(true);   /* the §1.1 feel, §2 slopes and §3 camera run every authored level */
      expect(lv.goal, lv.id).not.toBeNull();
      expect(lv.goal!.tx, lv.id).toBeLessThan(lv.cols);
      expect(lv.spawnGrounded, `${lv.id} spawn`).toBe(true);
      expect(lv.spawnFeet, `${lv.id} spawn`).toBeLessThanOrEqual(15 * T);
      expect(lv.goalGrounded, `${lv.id} goal`).toBe(true);
    }
    expect(errors).toEqual([]);
  });

  test('the dev URL ?devtools=1&level=1-5 spawns Kinan in that level', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page, `${DEV_URL}&level=1-5`);
    await page.waitForFunction(() => (window as unknown as Win).__k11.levelInfo().id === '1-5');
    const info = await page.evaluate(() => (window as unknown as Win).__k11.levelInfo());
    expect(info).toMatchObject({ id: '1-5', name: 'THE FRONT YARD', world: 1, slot: 5, cols: 162, newWorld: true, screen: false });
    await expect(page.locator('#stage')).toBeVisible();
    await expect(page.locator('.lvl')).toContainText('1-5');
    expect(errors).toEqual([]);
  });

  test('the goal: a non-blocking LEVEL CLEAR (zero screens), a victory lap, then back to the map stub', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const w = window as unknown as Win, k = w.__k11;
      k.playLevel('1-5'); k.godMode(); k.clearFoes();
      w.__dlg = 0;
      const mo = new MutationObserver(() => { if (!(document.querySelector('#dialog') as HTMLElement).hidden) w.__dlg!++; });
      mo.observe(document.querySelector('#dialog')!, { attributes: true, attributeFilter: ['hidden'] });
      k.place(150 * 16, 160);
      k.step(40);
      let f = 0;
      while (!k.levelInfo().cleared && f < 400) { k.step(1, { right: true, fire: true }); f++; }
      const atClear = k.levelInfo();
      const lap = k.step(60, { right: true, fire: true });   /* play continues: Kinan still moves */
      const midLap = k.levelInfo();
      k.step(70, { right: true, fire: true });
      const after = k.levelInfo();
      mo.disconnect();
      return { f, atClear, moved: lap[lap.length - 1].x > lap[0].x, midLap, after, dlg: w.__dlg };
    });
    expect(r.atClear.cleared).toBe(true);
    expect(r.atClear.toast).toContain('LEVEL CLEAR');
    expect(r.atClear.screen).toBe(false);   /* no results screen */
    expect(r.moved).toBe(true);             /* non-blocking */
    expect(r.midLap.returned).toBe(false);
    expect(r.after.returned).toBe(true);    /* 120 frames later: back to the map */
    expect(r.after.screen).toBe(true);
    expect(r.dlg).toBe(0);
    /* 2026-10-27: the overworld map replaced the title-screen stub */
    await expect(page.locator('#owHost .km-canvas')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('saves stay safe: an authored level never writes a CONTINUE spot, and Restart replays it (not legacy stage 0)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const before = await page.evaluate(() => JSON.stringify((window as unknown as Win).__k11.progress().resume ?? null));
    await page.evaluate(() => { const k = (window as unknown as Win).__k11; k.playLevel('1-5'); k.godMode(); k.clearFoes(); });
    /* cross the checkpoint (it autosaves in legacy stages) and pause (autosave too) */
    await page.evaluate(() => { const k = (window as unknown as Win).__k11; k.place(95 * 16, 150); k.step(20); k.step(40, { right: true }); });
    await page.locator('#menuBtn').click();
    await expect(page.locator('#menu')).toBeVisible();
    const during = await page.evaluate(() => JSON.stringify((window as unknown as Win).__k11.progress().resume ?? null));
    expect(during).toBe(before);
    await page.locator('#restartBtn').click();
    const info = await page.evaluate(() => (window as unknown as Win).__k11.levelInfo());
    expect(info.id).toBe('1-5');
    expect(info.cleared).toBe(false);
    await expect(page.locator('.lvl')).toContainText('1-5');
    expect(errors).toEqual([]);
  });

  test('a draft level object plays without registering; a broken one is refused with the reason', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      const flat = (n: number) => Array.from({ length: n }, () => 192);
      const draft = { id: '11-8', world: 11, slot: 10, name: 'DRAFT', cols: 27, heights: flat(27), foes: [[10, 11, 'sock']], goal: { col: 24, row: 11 }, noSecrets: 'test' };
      const ok = k.playLevel(draft);
      const okInfo = k.levelInfo();
      const bad = k.playLevel({ ...draft, heights: flat(26) });
      return { ok: !!ok, id: okInfo.id, bad, why: k.levelProblems() };
    });
    expect(r.ok).toBe(true);
    expect(r.id).toBe('11-8');
    expect(r.bad).toBeNull();
    expect(r.why.join()).toMatch(/exactly cols/);
    expect(errors).toEqual([]);
  });

  test('production ignores ?level= (developer-only, like ?w6)', async ({ page }) => {
    const errors = watchErrors(page);
    await seed(page);
    await page.goto(`${BASE}?level=1-5`);
    await page.waitForFunction(() => !!(window as unknown as Win).KinanLevels && (window as unknown as Win).KinanLevels!.ready);
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => typeof (window as unknown as { __k11?: unknown }).__k11)).toBe('undefined');
    await expect(page.locator('#screen h1.title')).toBeVisible();
    await expect(page.locator('#stage')).toBeHidden();
    expect(errors).toEqual([]);
  });
});

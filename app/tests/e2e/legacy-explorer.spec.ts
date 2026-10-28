import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const DEV_URL = 'http://127.0.0.1:4174/index.html?devtools=1';
const PROD_URL = 'http://127.0.0.1:4174/index.html';
const CURRENT = 'kinan-remaster-v1';
type Dev = {
  progress: () => { explorer?: { world: number } | null; beaten: number[] };
  state: () => { stage: number; boss: string };
  auto: (frames: number) => unknown;
  explorerInfo: () => { world: number; onMap: boolean; x: number; y: number; camX: number; camY: number; entrances: number };
  explorerGo: (w: number) => { world: number };
  explorerTeleport: (x: number, y: number) => { x: number; y: number };
  explorerDoor: (k: number) => { x: number; y: number; stage: number } | null;
  overThemes: () => { world: number; grass: string; sky: string; weather: string; scene: string }[];
};
const fixture = (name: string): string => readFileSync(fileURLToPath(new URL(`../fixtures/saves/${name}`, import.meta.url)), 'utf8');
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function seedOpen(page: Page): Promise<void> {
  await page.addInitScript(({ key, raw }) => {
    const data = JSON.parse(raw);
    data.wonWorlds = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    data.unlocked = 82;
    data.beaten = Array.from({ length: 78 }, (_, i) => i);
    data.mapWorld = 0;
    data.mapSeen = {};
    data.mapSel = {};
    data.explorer = null;
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: CURRENT, raw: fixture('kinan-remaster-v1.sample.json') });
}
async function devReady(page: Page): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object');
}

test.describe('World Explorer — big scrolling worlds with doors', () => {
  test('title PLAY drops the player into an explorable world', async ({ page }) => {
    const errors = watchErrors(page);
    await seedOpen(page); await page.goto(PROD_URL);
    /* START pulses (the "beat" animation), so force the click like the regression suite does.
       2026-10-27 (Producer ruling, Contract §9): title PLAY opens the overworld map (map/engine.js), not the
       legacy Explorer (the Explorer stays reachable through the dev hooks below and the old stage map);
       a stage started from the map still offers "World map" in its pause menu */
    await page.locator('#startBtn').click({ force: true });
    /* 2026-10-28: a new save's first PLAY plays the opening cutscene first (c1-cutscenes.spec.ts); SKIP ends it */
    await expect(page.locator('#cut')).toBeVisible();
    await page.locator('#cutSkip').click();
    await expect(page.locator('#owHost .km-canvas')).toBeVisible();
    await page.locator('#owPlay').click();
    await expect(page.locator('#stage')).toBeVisible();
    await expect(page.locator('#cv')).toBeVisible();
    await page.locator('#menuBtn').click();
    await expect(page.locator('#mapBtnP')).toContainText('World map');
    expect(errors).toEqual([]);
  });

  test('the world is multi-screen and the camera follows Kinan everywhere', async ({ page }) => {
    const errors = watchErrors(page);
    await seedOpen(page); await devReady(page);
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerGo(1))).toMatchObject({ world: 1 });
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerInfo())).toMatchObject({ world: 1, onMap: true, entrances: 11 });
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerTeleport(1100, 500));
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.auto(50));
    const info = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerInfo());
    expect(info.camX).toBeGreaterThan(600);   /* the screen moved with him right... */
    expect(info.camY).toBeGreaterThan(200);   /* ...and down the map */
    expect(errors).toEqual([]);
  });

  test('standing on a doormat enters its stage and the map remembers the spot', async ({ page }) => {
    const errors = watchErrors(page);
    await seedOpen(page); await devReady(page);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerGo(1));
    const door = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerDoor(0)) as { x: number; y: number; stage: number };
    expect(door).toBeTruthy();
    await page.evaluate((d) => (window as unknown as { __k11: Dev }).__k11.explorerTeleport(d.x, d.y - 2), door);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.auto(60));
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().stage)).toBe(0);
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.progress().explorer)).toMatchObject({ world: 1 });
    expect(errors).toEqual([]);
  });

  test('walking quickly past a door never traps the player', async ({ page }) => {
    const errors = watchErrors(page);
    await seedOpen(page); await devReady(page);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerGo(1));
    const door = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerDoor(1)) as { x: number; y: number; stage: number };
    expect(door).toBeTruthy();
    await page.evaluate((d) => (window as unknown as { __k11: Dev }).__k11.explorerTeleport(d.x + 10, d.y - 2), door);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.auto(6));
    await page.evaluate((d) => (window as unknown as { __k11: Dev }).__k11.explorerTeleport(d.x + 90, d.y - 2), door);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.auto(10));
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerInfo())).onMap).toBe(true);
    expect(errors).toEqual([]);
  });

  test('the edge gates walk between open worlds', async ({ page }) => {
    const errors = watchErrors(page);
    await seedOpen(page); await devReady(page);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerGo(2));
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerTeleport(1378, 400));
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.auto(12));
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerInfo().world)).toBe(3);
    expect(errors).toEqual([]);
  });

  test('every world map is visually unique (the "worlds look the same" fix)', async ({ page }) => {
    const errors = watchErrors(page);
    await seedOpen(page); await devReady(page);
    const themes = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.overThemes());
    expect(themes.length).toBe(11);
    const grass = new Set(themes.map((t) => t.grass));
    const sky = new Set(themes.map((t) => t.sky));
    const weather = new Set(themes.map((t) => t.weather));
    expect(grass.size).toBeGreaterThanOrEqual(9);   /* at most two worlds may share a grass tone */
    expect(sky.size).toBeGreaterThanOrEqual(9);
    expect(weather.size).toBeGreaterThanOrEqual(8); /* each world has its own air */
    expect(errors).toEqual([]);
  });
});
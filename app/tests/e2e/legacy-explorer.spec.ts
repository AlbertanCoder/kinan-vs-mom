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
    data.codes = [2, 3, 4, 5];   /* Worlds 2-5 open with reward codes */
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
    /* START pulses (the "beat" animation), so force the click like the regression suite does */
    await page.locator('#startBtn').click({ force: true });
    await expect(page.locator('#stage')).toBeVisible();
    await expect(page.locator('#cv')).toBeVisible();
    await page.locator('#pauseBtn').click();
    await expect(page.locator('#mapBtnP')).toContainText('World map');
    expect(errors).toEqual([]);
  });

  test('the world is multi-screen and the camera follows Kinan everywhere', async ({ page }) => {
    const errors = watchErrors(page);
    await seedOpen(page); await devReady(page);
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerGo(1))).toMatchObject({ world: 1 });
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerInfo())).toMatchObject({ world: 1, onMap: true, entrances: 11 });
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerTeleport(1500, -80));
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.auto(50));
    const info = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerInfo());
    expect(info.camX).toBeGreaterThan(800);   /* the screen moved with him to the right */
    expect(info.camY).toBeLessThan(-20);      /* ...and up the hill */
    expect(errors).toEqual([]);
  });

  test('standing on a doormat enters its stage and the map remembers the spot', async ({ page }) => {
    const errors = watchErrors(page);
    await seedOpen(page); await devReady(page);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerGo(1));
    const door = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerDoor(0));
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
    const door = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerDoor(1));
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
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerTeleport(1765, 140));
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.auto(12));
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.explorerInfo().world)).toBe(3);
    expect(errors).toEqual([]);
  });
});
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* JUMP TO A LEVEL (2026-11-10, Shad: after beating the game, get back to World 1 without walking through every stop).
   Menu › 🧭 Jump to a level, or JUMP beside the map's PLAY: the worlds Kinan has reached, then that world's beaten or open
   levels; a tap puts Kinan on that stop. Locked and "coming soon" stops are never offered. From a level it leaves the level. */
const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html?devtools=1`;
const CURRENT = 'kinan-remaster-v1';
type Win = Window & {
  __k11: { mapState: () => { mounted: boolean; busy: boolean; world: number | null; at: number; notice: string | null }; state: () => { running: boolean }; progress: () => { wmap: { w: number; at: number } | null } };
  KinanLevels: { ready: boolean; list: () => string[] };
};

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
/* Worlds 1-2 all beaten (their belts given, so no belt scene on the map), Kinan standing in World 3 */
async function bootDone(page: Page): Promise<void> {
  await page.goto(BASE);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
  await page.evaluate((key) => {
    const lb: Record<string, number> = {};
    (window as unknown as Win).KinanLevels.list().filter((id) => /^[12]-/.test(id)).forEach((id) => { lb[id] = 1; });
    localStorage.setItem(key, JSON.stringify({ unlocked: 1, beaten: [], introSeen: true, levelsBeaten: lb, unlockedLevels: ['1-secret', '2-secret'],
      wmap: { w: 3, at: 0 }, escapes: { 1: 1, 2: 1 }, beltSeen: 99 }));
  }, CURRENT);
  await page.reload();
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
  await page.locator('#startBtn').click({ force: true });
  await mapIdle(page);
}
async function mapIdle(page: Page, world?: number): Promise<void> {
  await page.waitForFunction((w) => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy && (w == null || s.world === w); }, world);
}
const mapState = (page: Page) => page.evaluate(() => (window as unknown as Win).__k11.mapState());

test('JUMP on the map lists only reached worlds and their open/beaten levels, and puts Kinan on the chosen stop', async ({ page }) => {
  const errors = watchErrors(page);
  await bootDone(page);
  expect((await mapState(page)).world).toBe(3);
  await expect(page.locator('#owJump')).toBeVisible();
  await page.locator('#owJump').click();
  await expect(page.locator('#menuJump')).toBeVisible();
  const worlds = page.locator('#jumpBody button[data-w]');
  await expect(worlds).toHaveCount(3);   /* Worlds 1, 2 and 3 (where he stands); World 4 is still locked */
  await expect(worlds.nth(0)).toContainText('World 1');
  await expect(worlds.nth(2)).toContainText('here');
  /* World 3: only its first stop is open */
  await page.locator('#jumpBody button[data-w="3"]').click();
  await expect(page.locator('#jumpBody button[data-at]')).toHaveCount(1);
  await page.locator('#jumpBack').click();
  /* World 1: every built stop, all beaten */
  await page.locator('#jumpBody button[data-w="1"]').click();
  const stops = page.locator('#jumpBody button[data-at]');
  expect(await stops.count()).toBeGreaterThanOrEqual(10);
  await expect(stops.nth(2)).toContainText('1-3');
  await stops.nth(2).click();
  await mapIdle(page, 1);
  const s = await mapState(page);
  expect(s.at).toBe(2);
  expect(s.notice).toBe('JUMPED TO 1-3');
  await expect(page.locator('#menu')).toBeHidden();
  expect(await page.evaluate(() => (window as unknown as Win).__k11.progress().wmap)).toEqual({ w: 1, at: 2 });
  expect(errors).toEqual([]);
});

test('Menu › Jump to a level works from inside a level of the map, and leaves the level', async ({ page }) => {
  const errors = watchErrors(page);
  await bootDone(page);
  await page.locator('#owPlay').click();
  await page.waitForFunction(() => (window as unknown as Win).__k11.state().running);
  await page.locator('#menuBtn').click();
  await expect(page.locator('#jumpBtnP')).toBeVisible();
  await page.locator('#jumpBtnP').click();
  await page.locator('#jumpBody button[data-w="2"]').click();
  await page.locator('#jumpBody button[data-at]').last().click();   /* the 2-castle */
  await mapIdle(page, 2);
  expect(await page.evaluate(() => (window as unknown as Win).__k11.state().running)).toBe(false);
  expect((await mapState(page)).notice).toBe('JUMPED TO WORLD 2 CASTLE');
  expect(errors).toEqual([]);
});

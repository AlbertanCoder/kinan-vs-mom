import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const DEV_URL = 'http://127.0.0.1:4174/index.html?devtools=1';
const PROD_URL = 'http://127.0.0.1:4174/index.html';
const CURRENT = 'kinan-remaster-v1';
type Dev = {
  progress: () => { wonWorlds: number[]; unlocked: number; beaten: number[] };
  jumpToStage: (index: number) => void;
  warpBoss: () => void;
  auto: (frames: number) => { boss: string };
  killBosses: () => void;
  morph: () => unknown;
  state: () => { boss: string };
};
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
async function seedWorld6(page: Page): Promise<void> {
  await page.addInitScript(({ key, raw }) => {
    const data = JSON.parse(raw);
    data.wonWorlds = [5];
    data.unlocked = 57;
    data.beaten = Array.from({ length: 52 }, (_, i) => i);
    data.codes = [];
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: CURRENT, raw: fixture('kinan-remaster-v1.sample.json') });
}
async function dismissStory(page: Page): Promise<void> {
  for (let i = 0; i < 24 && await page.locator('#dialog').isVisible(); i++) {
    await page.locator('#dialog').click();
    await page.waitForTimeout(30);
  }
  await expect(page.locator('#dialog')).toBeHidden();
}

test.describe('World 6 — Vancouver and the Rain', () => {
  test('opens after World 5 with all five authored stages on the map', async ({ page }) => {
    const errors = watchErrors(page);
    await seedWorld6(page);
    await page.goto(PROD_URL);
    await page.locator('#menuBtn').click(); await page.locator('#partyBtn').click(); await page.locator('#classicBtn').click();   /* 2026-10-28: Classic stages are in THE MENU's More games */
    await expect(page.locator('.worldtab[data-world="6"]')).toHaveClass(/on/);
    await expect(page.locator('.lvbtn')).toHaveCount(5);
    for (const name of ['Sea-to-Sky', 'Stanley Park', 'Granville Science World', 'SkyTrain', 'Rainbow Observatory']) {
      await expect(page.locator('.lvbtn').filter({ hasText: name })).toHaveCount(1);
    }
    expect(errors).toEqual([]);
  });

  test('starts every new stage in 2D without requesting the archived 3D engine', async ({ page }) => {
    const errors = watchErrors(page);
    const requests: string[] = [];
    page.on('request', (req) => requests.push(req.url()));
    await seedWorld6(page);
    await page.goto(PROD_URL);
    await page.locator('#menuBtn').click(); await page.locator('#partyBtn').click(); await page.locator('#classicBtn').click();   /* 2026-10-28: Classic stages are in THE MENU's More games */
    for (let i = 52; i <= 56; i++) {
      await page.locator('#stagesBtn').click();
      await page.locator(`[data-lv="${i}"]`).click();
      await expect(page.locator('#stage')).toBeVisible();
      await expect(page.locator('#cv')).toBeVisible();
      await dismissStory(page);
      await page.locator('#menuBtn').click();
      await page.locator('#mapBtnP').click();
      await expect(page.locator('.lvbtn')).toHaveCount(5);
    }
    expect(requests.filter((url) => url.includes('galaxy3d'))).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('Drizzle finale records World 6 completion without a 3D morph', async ({ page }) => {
    const errors = watchErrors(page);
    await seedWorld6(page);
    await page.goto(DEV_URL);
    await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object');
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.jumpToStage(56));
    await dismissStory(page);
    await page.evaluate(() => { const k = (window as unknown as { __k11: Dev }).__k11; k.warpBoss(); k.auto(1); });
    await dismissStory(page);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().boss)).toBe('fight');
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.killBosses());
    await dismissStory(page);
    const completed = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.progress());
    expect(completed.wonWorlds).toContain(6);
    expect(completed.beaten).toContain(56);
    expect(completed.unlocked).toBeGreaterThanOrEqual(57);
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.morph())).toBeNull();
    expect(errors).toEqual([]);
  });
});

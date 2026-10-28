import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const DEV_URL = 'http://127.0.0.1:4174/index.html?devtools=1';
const PROD_URL = 'http://127.0.0.1:4174/index.html';
const CURRENT = 'kinan-remaster-v1';
type Dev = {
  progress: () => { wonWorlds: number[]; unlocked: number; beaten: number[] };
  jumpToStage: (index: number) => void;
  friendSet: (id: string | null) => unknown;
  friendCall: () => { result: boolean; info: { platforms: number; friendCooldown: number } };
  petCheckpoint: () => unknown;
  petAbilityTick: (frames: number) => { platforms: number };
  warpBoss: () => void;
  godMode: () => void;
  auto: (frames: number) => { boss: string; shots: number };
  killBosses: () => void;
  morph: () => unknown;
  state: () => { boss: string; shots: number };
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
async function seedWorld7(page: Page): Promise<void> {
  await page.addInitScript(({ key, raw }) => {
    const data = JSON.parse(raw);
    data.wonWorlds = [5, 6];
    data.unlocked = 62;
    data.beaten = Array.from({ length: 57 }, (_, i) => i);
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

test.describe('World 7 — the Brick Realms', () => {
  test('opens after World 6 with all five brick stages on the map', async ({ page }) => {
    const errors = watchErrors(page);
    await seedWorld7(page);
    await page.goto(PROD_URL);
    await page.locator('#mapBtn').click();
    await expect(page.locator('.worldtab[data-world="7"]')).toHaveClass(/on/);
    await expect(page.locator('.lvbtn')).toHaveCount(5);
    for (const name of ['Great Brick Bin', 'Fire-Truck Brick City', 'Machine Brickwilds', 'Studded Skyscraper Tower', 'BRICK-REX']) {
      await expect(page.locator('.lvbtn').filter({ hasText: name })).toHaveCount(1);
    }
    expect(errors).toEqual([]);
  });

  test('Milo builds and expires a recipe at a World 7 build pad', async ({ page }) => {
    const errors = watchErrors(page);
    await seedWorld7(page);
    await page.goto(DEV_URL);
    await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object');
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.jumpToStage(11));
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.friendSet('milo'));
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.jumpToStage(57));
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petCheckpoint());
    const built = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.friendCall());
    expect(built.result).toBe(true);
    expect(built.info.platforms).toBeGreaterThan(0);
    expect(built.info.friendCooldown).toBe(1500);
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petAbilityTick(480))).platforms).toBe(0);
    expect(errors).toEqual([]);
  });

  test('starts every brick-realm stage in 2D without requesting the archived engine', async ({ page }) => {
    const errors = watchErrors(page);
    const requests: string[] = [];
    page.on('request', (req) => requests.push(req.url()));
    await seedWorld7(page);
    await page.goto(PROD_URL);
    await page.locator('#mapBtn').click();
    for (let i = 57; i <= 61; i++) {
      await page.locator('#stagesBtn').click();
      await page.locator(`[data-lv="${i}"]`).click();
      await expect(page.locator('#stage')).toBeVisible();
      await expect(page.locator('#cv')).toBeVisible();
      await dismissStory(page);
      await page.locator('#pauseBtn').click();
      await page.locator('#mapBtnP').click();
      await expect(page.locator('.lvbtn')).toHaveCount(5);
    }
    expect(requests.filter((url) => url.includes('galaxy3d'))).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('caps BRICK-REX projectiles at four and records World 7 completion without a morph', async ({ page }) => {
    const errors = watchErrors(page);
    await seedWorld7(page);
    await page.goto(DEV_URL);
    await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object');
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.jumpToStage(61));
    await dismissStory(page);
    await page.evaluate(() => { const k = (window as unknown as { __k11: Dev }).__k11; k.warpBoss(); k.auto(1); });
    await dismissStory(page);
    await page.evaluate(() => { const k = (window as unknown as { __k11: Dev }).__k11; k.godMode(); k.auto(240); });
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state())).shots).toBeLessThanOrEqual(4);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.killBosses());
    await dismissStory(page);
    const completed = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.progress());
    expect(completed.wonWorlds).toContain(7);
    expect(completed.beaten).toContain(61);
    expect(completed.unlocked).toBeGreaterThanOrEqual(62);
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.morph())).toBeNull();
    expect(errors).toEqual([]);
  });
});

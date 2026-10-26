import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const DEV_URL = 'http://127.0.0.1:4174/index.html?devtools=1';
const PROD_URL = 'http://127.0.0.1:4174/index.html';
const CURRENT = 'kinan-remaster-v1';
type Dev = {
  progress: () => { wonWorlds: number[]; unlocked: number; beaten: number[] };
  jumpToStage: (index: number) => void;
  petCheckpoint: () => { platforms: number };
  petAbilityTick: (frames: number) => { platforms: number };
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
async function seedWorld8(page: Page): Promise<void> {
  await page.addInitScript(({ key, raw }) => {
    const data = JSON.parse(raw);
    data.wonWorlds = [5, 6, 7];
    data.unlocked = 67;
    data.beaten = Array.from({ length: 62 }, (_, i) => i);
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

test.describe('World 8 — Prehistoric Dinosaur Adventure', () => {
  test('opens after World 7 with all five dinosaur stages on the map', async ({ page }) => {
    const errors = watchErrors(page);
    await seedWorld8(page);
    await page.goto(PROD_URL);
    await page.locator('#mapBtn').click();
    await expect(page.locator('.worldtab[data-world="8"]')).toHaveClass(/on/);
    await expect(page.locator('.lvbtn')).toHaveCount(5);
    for (const name of ['Badlands Fossil Dig', 'Fern Jungle', 'Brachiosaurus River', 'Raptor Canyon', 'Alpha T-Rex Nest']) {
      await expect(page.locator('.lvbtn').filter({ hasText: name })).toHaveCount(1);
    }
    expect(errors).toEqual([]);
  });

  test('creates a Brachiosaurus platform at the checkpoint and preserves it', async ({ page }) => {
    const errors = watchErrors(page);
    await seedWorld8(page);
    await page.goto(DEV_URL);
    await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object');
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.jumpToStage(64));
    const bridge = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petCheckpoint());
    expect(bridge.platforms).toBeGreaterThan(0);
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petAbilityTick(500))).platforms).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });

  test('starts every dinosaur stage in 2D without requesting the archived engine', async ({ page }) => {
    const errors = watchErrors(page);
    const requests: string[] = [];
    page.on('request', (req) => requests.push(req.url()));
    await seedWorld8(page);
    await page.goto(PROD_URL);
    await page.locator('#mapBtn').click();
    for (let i = 62; i <= 66; i++) {
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

  test('Alpha T-Rex reunion records World 8 completion without a 3D morph', async ({ page }) => {
    const errors = watchErrors(page);
    await seedWorld8(page);
    await page.goto(DEV_URL);
    await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object');
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.jumpToStage(66));
    await dismissStory(page);
    await page.evaluate(() => { const k = (window as unknown as { __k11: Dev }).__k11; k.warpBoss(); k.auto(1); });
    await dismissStory(page);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().boss)).toBe('fight');
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.killBosses());
    await dismissStory(page);
    const completed = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.progress());
    expect(completed.wonWorlds).toContain(8);
    expect(completed.beaten).toContain(66);
    expect(completed.unlocked).toBeGreaterThanOrEqual(67);
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.morph())).toBeNull();
    expect(errors).toEqual([]);
  });
});

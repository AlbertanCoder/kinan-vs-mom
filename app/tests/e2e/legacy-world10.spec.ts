import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const DEV_URL = 'http://127.0.0.1:4174/index.html?devtools=1';
const PROD_URL = 'http://127.0.0.1:4174/index.html';
const CURRENT = 'kinan-remaster-v1';
type Dev = {
  progress: () => { wonWorlds: number[]; unlocked: number; beaten: number[]; pendingCutscene?: string | null };
  jumpToStage: (index: number) => void;
  state: () => { stage: number; boss: string };
  warpBoss: () => void;
  auto: (frames: number) => { boss: string };
  killBosses: () => void;
  morph: () => unknown;
  world10Info: () => { stage: number; world: number; place: string; grandmas: boolean; momBoss: boolean; finalWorld: number; pending: string | null };
};
const fixture = (name: string): string => readFileSync(fileURLToPath(new URL(`../fixtures/saves/${name}`, import.meta.url)), 'utf8');
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function seedWorld10(page: Page, extra?: Record<string, unknown>): Promise<void> {
  await page.addInitScript(({ key, raw, extra }) => {
    const data = JSON.parse(raw);
    data.wonWorlds = [2, 3, 4, 5, 6, 7, 8, 9];
    data.unlocked = 77;
    data.beaten = Array.from({ length: 72 }, (_, i) => i);
    data.codes = [];
    data.mapWorld = 0;
    data.mapSeen = {};
    data.mapSel = {};
    Object.assign(data, extra || {});
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: CURRENT, raw: fixture('kinan-remaster-v1.sample.json'), extra: extra || {} });
}
async function dismissStory(page: Page): Promise<void> {
  await expect(page.locator('#dialog')).toBeVisible({ timeout: 5000 });
  for (let i = 0; i < 30 && await page.locator('#dialog').isVisible(); i++) {
    await page.locator('#dialog').click();
    await page.waitForTimeout(30);
  }
  await expect(page.locator('#dialog')).toBeHidden();
}
async function devStage(page: Page, stage: number): Promise<void> {
  await page.evaluate((i) => (window as unknown as { __k11: Dev }).__k11.jumpToStage(i), stage);
  await dismissStory(page);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().stage)).toBe(stage);
}

test.describe('World 10 — Birthday Multiverse', () => {
  test('opens after World 9 with all five multiverse stages on the map', async ({ page }) => {
    const errors = watchErrors(page);
    await seedWorld10(page); await page.goto(PROD_URL); await page.locator('#mapBtn').click();
    await expect(page.locator('.worldtab[data-world="10"]')).toHaveClass(/on/);
    await expect(page.locator('.lvbtn')).toHaveCount(5);
    await expect(page.locator('.lvchip')).toHaveCount(5);
    for (const name of ['Portal Piñata Plaza', 'Mirror-Twin Skyscrapers', 'Candy Cosmos Causeway', "The Grandmothers' Hearth", 'The Birthday That Never Was']) {
      await expect(page.locator('.lvbtn').filter({ hasText: name })).toHaveCount(1);
    }
    expect(errors).toEqual([]);
  });

  test('starts every multiverse stage in 2D without requesting the archived engine', async ({ page }) => {
    const errors = watchErrors(page); const requests: string[] = [];
    page.on('request', (req) => requests.push(req.url()));
    await seedWorld10(page); await page.goto(PROD_URL); await page.locator('#mapBtn').click();
    for (let i = 72; i <= 76; i++) {
      await page.locator('#stagesBtn').click();
      await page.locator(`[data-lv="${i}"]`).click();
      await expect(page.locator('#stage')).toBeVisible(); await expect(page.locator('#cv')).toBeVisible();
      await dismissStory(page);
      await page.locator('#pauseBtn').click(); await page.locator('#mapBtnP').click();
      await expect(page.locator('.lvbtn')).toHaveCount(5);
    }
    expect(requests.filter((url) => url.includes('galaxy3d'))).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('the Grandmothers are their own encounter with their own boss name', async ({ page }) => {
    const errors = watchErrors(page); await seedWorld10(page); await page.goto(DEV_URL);
    await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object'); await devStage(page, 75);
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.world10Info())).toMatchObject({ stage: 75, world: 10, grandmas: true, momBoss: false, finalWorld: 0 });
    await page.evaluate(() => { const k = (window as unknown as { __k11: Dev }).__k11; k.warpBoss(); k.auto(1); }); await dismissStory(page);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().boss)).toBe('fight');
    await expect(page.locator('#bossName')).toContainText('THE GRANDMOTHERS');
    expect(errors).toEqual([]);
  });

  test('the Mom encounter is separate from the Grandmothers', async ({ page }) => {
    const errors = watchErrors(page); await seedWorld10(page); await page.goto(DEV_URL);
    await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object'); await devStage(page, 76);
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.world10Info())).toMatchObject({ stage: 76, world: 10, grandmas: false, momBoss: true, finalWorld: 10 });
    await page.evaluate(() => { const k = (window as unknown as { __k11: Dev }).__k11; k.warpBoss(); k.auto(1); }); await dismissStory(page);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().boss)).toBe('fight');
    await expect(page.locator('#bossName')).toContainText('MOM');
    expect(errors).toEqual([]);
  });

  test('the finale saves completion and the World 11 unlock BEFORE the cinematic', async ({ page }) => {
    const errors = watchErrors(page); await seedWorld10(page); await page.goto(DEV_URL);
    await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object'); await devStage(page, 76);
    await page.evaluate(() => { const k = (window as unknown as { __k11: Dev }).__k11; k.warpBoss(); k.auto(1); }); await dismissStory(page);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().boss)).toBe('fight');
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.killBosses());
    await expect(page.locator('#dialog')).toBeVisible();   /* the cinematic is playing right now */
    const mid = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.progress());
    expect(mid.wonWorlds).toContain(10); expect(mid.beaten).toContain(76); expect(mid.unlocked).toBeGreaterThanOrEqual(77);
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.world10Info())).pending).toBe('w10-finale');
    await dismissStory(page);
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.world10Info())).pending).toBeNull();
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.morph())).toBeNull();
    expect(errors).toEqual([]);
  });

  test('a refresh mid-cinematic resumes and clears the saved finale', async ({ page }) => {
    const errors = watchErrors(page);
    await seedWorld10(page, { pendingCutscene: 'w10-finale' }); await page.goto(PROD_URL);
    await page.locator('#mapBtn').click();
    await expect(page.locator('#dialog')).toBeVisible();   /* the interrupted cinematic comes back */
    await dismissStory(page);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('kinan-remaster-v1') || '{}'));
    expect(saved.pendingCutscene == null).toBe(true);
    expect(errors).toEqual([]);
  });
});
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
  world11Info: () => { stage: number; world: number; place: string; look3d: boolean; glitchy: boolean; finalWorld: number; tier2: boolean; pending: string | null };
};
const fixture = (name: string): string => readFileSync(fileURLToPath(new URL(`../fixtures/saves/${name}`, import.meta.url)), 'utf8');
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function seedWorld11(page: Page, wonWorlds?: number[]): Promise<void> {
  await page.addInitScript(({ key, raw, won }) => {
    const data = JSON.parse(raw);
    data.wonWorlds = won;
    data.codes = [];
    data.unlocked = 82;
    data.beaten = Array.from({ length: 78 }, (_, i) => i);
    data.mapWorld = 0;
    data.mapSeen = {};
    data.mapSel = {};
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: CURRENT, raw: fixture('kinan-remaster-v1.sample.json'), won: wonWorlds || [2, 3, 4, 5, 6, 7, 8, 9, 10] });
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

test.describe('World 11 — Kinan vs. the Glitch (flat-plane 3D, saved game finale)', () => {
  test('opens after World 10 with all five glitch stages on the map', async ({ page }) => {
    const errors = watchErrors(page);
    await seedWorld11(page); await page.goto(PROD_URL); await page.locator('#mapBtn').click();
    await expect(page.locator('.worldtab[data-world="11"]')).toHaveClass(/on/);
    await expect(page.locator('.lvbtn')).toHaveCount(5);
    await expect(page.locator('.lvchip')).toHaveCount(5);
    for (const name of ['The Wrong-Way Portal', 'Depth Drop Caverns', 'Backwards Boulevard', 'The Portal Machine', "Glitchy's Last Stand"]) {
      await expect(page.locator('.lvbtn').filter({ hasText: name })).toHaveCount(1);
    }
    expect(errors).toEqual([]);
  });

  test('every stage runs flat-plane 3D without requesting the archived engine', async ({ page }) => {
    const errors = watchErrors(page); const requests: string[] = [];
    page.on('request', (req) => requests.push(req.url()));
    await seedWorld11(page); await page.goto(PROD_URL); await page.locator('#mapBtn').click();
    for (let i = 77; i <= 81; i++) {
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

  test('the freak-out world is flat-plane 3D and the gold UI is active', async ({ page }) => {
    const errors = watchErrors(page); await seedWorld11(page); await page.goto(DEV_URL);
    await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object'); await devStage(page, 77);
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.world11Info())).toMatchObject({ stage: 77, world: 11, place: 'The Wrong-Way Portal', look3d: true, glitchy: false, tier2: true });
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.morph())).toBeNull();
    await devStage(page, 80);
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.world11Info())).look3d).toBe(true);
    expect(errors).toEqual([]);
  });

  test('Glitchy is the final encounter and the game finale saves before its cinematic', async ({ page }) => {
    const errors = watchErrors(page); await seedWorld11(page); await page.goto(DEV_URL);
    await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object'); await devStage(page, 81);
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.world11Info())).toMatchObject({ glitchy: true, finalWorld: 11, look3d: true });
    await page.evaluate(() => { const k = (window as unknown as { __k11: Dev }).__k11; k.warpBoss(); k.auto(1); }); await dismissStory(page);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().boss)).toBe('fight');
    await expect(page.locator('#bossName')).toContainText('GLITCHY');
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.killBosses());
    await expect(page.locator('#dialog')).toBeVisible();   /* the game-finale cinematic is playing right now */
    const mid = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.progress());
    expect(mid.wonWorlds).toContain(11); expect(mid.beaten).toContain(81);
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.world11Info())).pending).toBe('w11-finale');
    await dismissStory(page);
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.world11Info())).pending).toBeNull();
    expect(errors).toEqual([]);
  });

  test('the gold tier-2 UI is persistent after the World 10 win and absent before it', async ({ page }) => {
    const errors = watchErrors(page);
    await seedWorld11(page); await page.goto(PROD_URL);
    expect(await page.evaluate(() => document.documentElement.classList.contains('tier2'))).toBe(true);
    await page.reload();
    expect(await page.evaluate(() => document.documentElement.classList.contains('tier2'))).toBe(true);
    await seedWorld11(page, [2, 3, 4, 5, 6, 7, 8, 9]); await page.reload();
    expect(await page.evaluate(() => document.documentElement.classList.contains('tier2'))).toBe(false);
    expect(errors).toEqual([]);
  });
});
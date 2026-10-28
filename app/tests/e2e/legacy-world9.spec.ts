import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const DEV_URL = 'http://127.0.0.1:4174/index.html?devtools=1';
const PROD_URL = 'http://127.0.0.1:4174/index.html';
const CURRENT = 'kinan-remaster-v1';
type Dev = {
  progress: () => { wonWorlds: number[]; unlocked: number; beaten: number[] };
  jumpToStage: (index: number) => void;
  state: () => { stage: number; boss: string };
  warpBoss: () => void;
  auto: (frames: number) => { boss: string };
  killBosses: () => void;
  friendSet: (id: string | null) => unknown;
  friendCall: () => { result: boolean; info: { platforms: number; friendCooldown: number } };
  petCheckpoint: () => unknown;
  morph: () => unknown;
  world9Info: () => { stage: number; world: number; place: string; laserTutorial: boolean; forcePads: number; rhythm: boolean; conveyor: boolean; annie: boolean };
  world9Laser: () => { slow: boolean; hint: boolean; remaining: number };
  world9Force: () => { recipe: string; result: boolean; built: number; bricks: number };
  world9Rhythm: () => { phase: number; offset: number; rush: number; boss: string };
  world9Art: () => { speaker: string; portrait: boolean; sprite: boolean; title: string; annie: boolean; finalWorld: number; path: number };
};
const fixture = (name: string): string => readFileSync(fileURLToPath(new URL(`../fixtures/saves/${name}`, import.meta.url)), 'utf8');
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function seedWorld9(page: Page): Promise<void> {
  await page.addInitScript(({ key, raw }) => {
    const data = JSON.parse(raw);
    data.wonWorlds = [5, 6, 7, 8];
    data.unlocked = 72;
    data.beaten = Array.from({ length: 67 }, (_, i) => i);
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
async function devStage(page: Page, stage: number): Promise<void> {
  await page.evaluate((i) => (window as unknown as { __k11: Dev }).__k11.jumpToStage(i), stage);
  await dismissStory(page);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().stage)).toBe(stage);
}

test.describe('World 9 — Starbase & Annie’s Arrival', () => {
  test('opens after World 8 with all five Starbase stages on the map', async ({ page }) => {
    const errors = watchErrors(page);
    await seedWorld9(page); await page.goto(PROD_URL); await page.locator('#menuBtn').click(); await page.locator('#partyBtn').click(); await page.locator('#classicBtn').click();   /* 2026-10-28: Classic stages are in THE MENU's More games */
    await expect(page.locator('.worldtab[data-world="9"]')).toHaveClass(/on/);
    await expect(page.locator('.lvbtn')).toHaveCount(5);
    for (const name of ['Twin-Sun Outpost', 'Droid Factory', 'Laser Corridors', '2D Trench Run', "Annie's Galactic Kitchen"]) {
      await expect(page.locator('.lvbtn').filter({ hasText: name })).toHaveCount(1);
    }
    expect(errors).toEqual([]);
  });

  test('starts every Starbase stage in 2D without requesting the archived engine', async ({ page }) => {
    const errors = watchErrors(page); const requests: string[] = [];
    page.on('request', (req) => requests.push(req.url()));
    await seedWorld9(page); await page.goto(PROD_URL); await page.locator('#menuBtn').click(); await page.locator('#partyBtn').click(); await page.locator('#classicBtn').click();   /* 2026-10-28: Classic stages are in THE MENU's More games */
    for (let i = 67; i <= 71; i++) {
      await page.locator('#stagesBtn').click();
      await page.locator(`[data-lv="${i}"]`).click();
      await expect(page.locator('#stage')).toBeVisible(); await expect(page.locator('#cv')).toBeVisible();
      await dismissStory(page);
      await page.locator('#menuBtn').click(); await page.locator('#mapBtnP').click();
      await expect(page.locator('.lvbtn')).toHaveCount(5);
    }
    expect(requests.filter((url) => url.includes('galaxy3d'))).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('Twin-Sun laser school slows shots and shows a deflection hint', async ({ page }) => {
    const errors = watchErrors(page); await seedWorld9(page); await page.goto(DEV_URL);
    await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object'); await devStage(page, 67);
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.world9Info())).toMatchObject({ stage: 67, laserTutorial: true, forcePads: 1 });
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.world9Laser())).toMatchObject({ slow: true, hint: true });
    expect(errors).toEqual([]);
  });

  test('Droid Factory Force pads build a real route through Milo', async ({ page }) => {
    const errors = watchErrors(page); await seedWorld9(page); await page.goto(DEV_URL);
    await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object'); await devStage(page, 68);
    const result = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.world9Force());
    expect(['bridge', 'stairs']).toContain(result.recipe); expect(result.result).toBe(true);
    expect(result.built).toBeGreaterThan(0); expect(result.bricks).toBeGreaterThan(0); expect(errors).toEqual([]);
  });

  test('Laser Corridors and 2D Trench Run are separate real stages', async ({ page }) => {
    const errors = watchErrors(page); await seedWorld9(page); await page.goto(DEV_URL);
    await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object');
    await devStage(page, 69);
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.world9Info())).toMatchObject({ place: 'Starbase Laser Corridors', laserTutorial: true, world: 9 });
    await devStage(page, 70);
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.world9Info())).toMatchObject({ place: '2D Trench Run', world: 9, laserTutorial: false });
    expect(errors).toEqual([]);
  });

  test('Annie has a distinct sprite, portrait speaker, and heroic kitchen data', async ({ page }) => {
    const errors = watchErrors(page); await seedWorld9(page); await page.goto(DEV_URL);
    await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object'); await devStage(page, 71);
    const art = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.world9Art());
    expect(art).toMatchObject({ speaker: 'a', portrait: true, sprite: true, annie: true, finalWorld: 9, path: 5 });
    expect(art.title).toContain('Annie');
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.world9Info())).toMatchObject({ rhythm: true, conveyor: true, annie: true });
    expect(errors).toEqual([]);
  });

  test('Annie rhythm and conveyor run during the cook-off', async ({ page }) => {
    const errors = watchErrors(page); await seedWorld9(page); await page.goto(DEV_URL);
    await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object'); await devStage(page, 71);
    await page.evaluate(() => { const k = (window as unknown as { __k11: Dev }).__k11; k.warpBoss(); k.auto(1); }); await dismissStory(page);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().boss)).toBe('fight');
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.world9Rhythm());
    const result = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.world9Rhythm());
    expect(result.phase).toBeGreaterThan(0); expect(result.offset).toBeGreaterThan(0); expect(result.rush).toBeGreaterThan(0); expect(errors).toEqual([]);
  });

  test('Annie cook-off records World 9 completion without a 3D morph', async ({ page }) => {
    const errors = watchErrors(page); await seedWorld9(page); await page.goto(DEV_URL);
    await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object'); await devStage(page, 71);
    await page.evaluate(() => { const k = (window as unknown as { __k11: Dev }).__k11; k.warpBoss(); k.auto(1); }); await dismissStory(page);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().boss)).toBe('fight');
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.killBosses()); await dismissStory(page);
    const completed = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.progress());
    expect(completed.wonWorlds).toContain(9); expect(completed.beaten).toContain(71); expect(completed.unlocked).toBeGreaterThanOrEqual(72);
    expect(completed.wonWorlds).not.toContain(11);
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.morph())).toBeNull(); expect(errors).toEqual([]);
  });

  test('World 9 map and progression preserve the earlier world ranges', async ({ page }) => {
    const errors = watchErrors(page); await seedWorld9(page); await page.goto(PROD_URL); await page.locator('#menuBtn').click(); await page.locator('#partyBtn').click(); await page.locator('#classicBtn').click();   /* 2026-10-28: Classic stages are in THE MENU's More games */
    await expect(page.locator('.worldtab[data-world="9"]')).toHaveClass(/on/);
    await page.locator('.worldtab[data-world="8"]').click(); await expect(page.locator('.lvbtn')).toHaveCount(5);
    await page.locator('.worldtab[data-world="7"]').click(); await expect(page.locator('.lvbtn')).toHaveCount(5);
    await page.locator('.worldtab[data-world="6"]').click(); await expect(page.locator('.lvbtn')).toHaveCount(5);
    expect(errors).toEqual([]);
  });
});


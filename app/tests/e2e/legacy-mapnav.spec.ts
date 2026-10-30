import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const PROD_URL = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
const CURRENT = 'kinan-remaster-v1';
const fixture = (name: string): string => readFileSync(fileURLToPath(new URL(`../fixtures/saves/${name}`, import.meta.url)), 'utf8');
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function seed(page: Page, o: { unlocked: number; beatenTo: number; wonWorlds: number[]; codes?: number[] }): Promise<void> {
  await page.addInitScript(({ key, raw, o }) => {
    const data = JSON.parse(raw);
    data.wonWorlds = o.wonWorlds.slice();
    data.unlocked = o.unlocked;
    data.beaten = Array.from({ length: o.beatenTo + 1 }, (_, i) => i);
    data.codes = (o.codes || []).slice();
    data.mapWorld = 0;
    data.mapSeen = {};
    data.mapSel = {};
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: CURRENT, raw: fixture('kinan-remaster-v1.sample.json'), o });
}
async function openMap(page: Page): Promise<void> {
  await page.goto(PROD_URL);
  await page.locator('#menuBtn').click(); await page.locator('#partyBtn').click(); await page.locator('#classicBtn').click();   /* 2026-10-28: Classic stages are in THE MENU's More games */
  await expect(page.locator('.maptitle')).toBeVisible();
}
async function dismissStory(page: Page): Promise<void> {
  await expect(page.locator('#dialog')).toBeVisible({ timeout: 5000 });
  for (let i = 0; i < 24 && await page.locator('#dialog').isVisible(); i++) {
    await page.locator('#dialog').click();
    await page.waitForTimeout(30);
  }
  await expect(page.locator('#dialog')).toBeHidden();
}

test.describe('Map navigation — world cards, stage chips and the stage card', () => {
  test('opens on the next world with a progress card for every built world', async ({ page }) => {
    const errors = watchErrors(page);
    await seed(page, { unlocked: 42, beatenTo: 40, wonWorlds: [2, 3, 4], codes: [2, 3, 4, 5] }); await openMap(page);
    await expect(page.locator('.worldtab[data-world="5"]')).toHaveClass(/on/);
    await expect(page.locator('.worldtab')).toHaveCount(11);   /* every built world has a card */
    await expect(page.locator('.worldtab .wtico').first()).toBeVisible();
    await expect(page.locator('.worldtab .wtp').first()).toHaveText(/\d+\/\d+/);
    await expect(page.locator('.maptitle')).toContainText('World 5');
    expect(errors).toEqual([]);
  });

  test('world cards switch worlds and the stage list follows', async ({ page }) => {
    const errors = watchErrors(page);
    await seed(page, { unlocked: 72, beatenTo: 66, wonWorlds: [2, 3, 4, 5, 6, 7, 8] }); await openMap(page);
    await expect(page.locator('.worldtab[data-world="9"]')).toHaveClass(/on/);
    await page.locator('.worldtab[data-world="8"]').click();
    await expect(page.locator('.worldtab[data-world="8"]')).toHaveClass(/on/);
    await expect(page.locator('.maptitle')).toContainText('World 8');
    await page.locator('#stagesBtn').click();
    await expect(page.locator('.lvbtn')).toHaveCount(5);
    expect(errors).toEqual([]);
  });

  test('stage chips select stops and the stage card follows', async ({ page }) => {
    const errors = watchErrors(page);
    await seed(page, { unlocked: 72, beatenTo: 66, wonWorlds: [2, 3, 4, 5, 6, 7, 8] }); await openMap(page);
    await expect(page.locator('.lvchip')).toHaveCount(5);
    await expect(page.locator('.lvchip[data-stop="0"]')).toHaveClass(/on/);
    await page.locator('.lvchip[data-stop="4"]').click();
    await expect(page.locator('.lvchip[data-stop="4"]')).toHaveClass(/on/);
    await expect(page.locator('#wmInfo')).toContainText("Annie's Galactic Kitchen");
    await expect(page.locator('#wmInfo')).toContainText('Stage 5 of 5');
    await expect(page.locator('#wmPlay')).toContainText('STAGE 5');
    await expect(page.locator('#wmPlay')).toBeEnabled();
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#wmInfo')).toContainText('2D Trench Run');
    await expect(page.locator('#wmPlay')).toContainText('STAGE 4');
    expect(errors).toEqual([]);
  });

  test('locked chips say what to beat first and stay locked', async ({ page }) => {
    const errors = watchErrors(page);
    await seed(page, { unlocked: 64, beatenTo: 62, wonWorlds: [2, 3, 4, 5, 6, 7] }); await openMap(page);
    await expect(page.locator('.lvchip[data-locked]')).toHaveCount(3);
    await page.locator('.lvchip[data-stop="4"]').click();
    await expect(page.locator('#wmInfo')).toContainText('beat stage 4 first');
    await expect(page.locator('.lvchip[data-stop="4"]')).not.toHaveClass(/on/);
    await expect(page.locator('.lvchip[data-stop="1"]')).toHaveClass(/on/);
    expect(errors).toEqual([]);
  });

  test('PLAY starts the selected stage and pause returns to the map', async ({ page }) => {
    const errors = watchErrors(page);
    await seed(page, { unlocked: 72, beatenTo: 66, wonWorlds: [2, 3, 4, 5, 6, 7, 8] }); await openMap(page);
    await page.locator('.lvchip[data-stop="2"]').click();
    await page.locator('#wmPlay').click();
    await expect(page.locator('#stage')).toBeVisible();
    await expect(page.locator('#cv')).toBeVisible();
    await dismissStory(page);
    await page.locator('#menuBtn').click();
    await expect(page.locator('#mapBtnP')).toBeVisible();
    await page.locator('#mapBtnP').click();
    await expect(page.locator('.maptitle')).toContainText('World 9');
    await expect(page.locator('.lvchip').nth(2)).toHaveClass(/on/);
    expect(errors).toEqual([]);
  });

  test('every world card opens a map with exactly one stage chip per stage', async ({ page }) => {
    const errors = watchErrors(page);
    await seed(page, { unlocked: 82, beatenTo: 77, wonWorlds: [2, 3, 4, 5, 6, 7, 8, 9, 10] }); await openMap(page);
    const sizes = [11, 10, 10, 10, 10, 5, 5, 5, 5, 5, 5];   /* worlds 1-11: keep in sync when adding stages */
    for (let w = 1; w <= 11; w++) {
      await page.locator(`.worldtab[data-world="${w}"]`).click();
      await expect(page.locator('.maptitle')).toContainText('World ' + w);
      await expect(page.locator('.lvchip')).toHaveCount(sizes[w - 1]);
    }
    expect(errors).toEqual([]);
  });
});
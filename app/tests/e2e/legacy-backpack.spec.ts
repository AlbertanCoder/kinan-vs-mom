import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const GAME_URL = 'http://127.0.0.1:4174/index.html';
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

test.describe('The Backpack — one simple place for pets, hats and the shop', () => {
  test('the Backpack button opens pets, hats and the Party Shop together', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(GAME_URL);
    await page.locator('#petsBtnT').click();
    await expect(page.locator('#screen h1.title')).toHaveText(/Party Shop/);
    await expect(page.locator('#petLoadoutStatus')).toBeVisible();
    await expect(page.locator('#soloPets')).toBeVisible();
    await expect(page.locator('.hatrow')).toBeVisible();
    await expect(page.locator('.shopgrid').first()).toBeVisible();
    await expect(page.locator('#walletN')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('the Party Shop button opens the same Backpack', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(GAME_URL);
    await page.locator('#shopBtn').click();
    await expect(page.locator('#screen h1.title')).toHaveText(/Party Shop/);
    await expect(page.locator('#petLoadoutStatus')).toBeVisible();
    await expect(page.locator('#petsBack')).toBeVisible();
    await page.locator('#petsBack').click();
    await expect(page.locator('#startBtn')).toBeVisible();   /* Done comes back to the title */
    expect(errors).toEqual([]);
  });
});
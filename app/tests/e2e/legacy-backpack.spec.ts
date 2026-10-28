import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const GAME_URL = 'http://127.0.0.1:4174/index.html';
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/* Shad's ruling (27 Oct): the pet screen was "too crowded" — pets moved to their own simple 🐾 Pets
   screen (picture, name, one power line); the Backpack keeps friends, hats and the Party Shop. */
test.describe('The Backpack and the Pets screen', () => {
  test('the 🐾 Pets button opens only the pets: six cards and Done', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(GAME_URL);
    await page.locator('#petsBtnT').click();
    await expect(page.locator('#screen h1.title')).toHaveText('Pets');
    await expect(page.locator('.petcard')).toHaveCount(6);
    await expect(page.locator('#screen .hatrow, #screen .shopgrid, #screen input')).toHaveCount(0);
    await page.locator('#petsBack').click();
    await expect(page.locator('#startBtn')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('the Party Shop button opens the Backpack: friends, hats and the shop (no pet editor)', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(GAME_URL);
    await page.locator('#shopBtn').click();
    await expect(page.locator('#screen h1.title')).toHaveText(/Party Shop/);
    await expect(page.locator('.hatrow')).toBeVisible();
    await expect(page.locator('.shopgrid').first()).toBeVisible();
    await expect(page.locator('#walletN')).toBeVisible();
    await expect(page.locator('#screen .petcard, #screen .petedit')).toHaveCount(0);
    await expect(page.locator('#petsBack')).toBeVisible();
    await page.locator('#petsBack').click();
    await expect(page.locator('#startBtn')).toBeVisible();   /* Done comes back to the title */
    expect(errors).toEqual([]);
  });
});
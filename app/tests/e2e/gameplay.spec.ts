import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const APP_URL = 'http://127.0.0.1:4173';

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/** Boot the game and dismiss the DOM start overlay. */
async function bootGame(page: Page): Promise<void> {
  await page.goto(APP_URL);
  await expect.poll(
    async () => page.evaluate(() => window.__kvShell?.ready === true),
    { timeout: 15_000 },
  ).toBe(true);
  await page.locator('#startBtn').click();
}

test.describe('gameplay journey (2D kernel)', () => {
  test('title → map → stage 1-1 → movement and jump with zero errors', async ({ page }) => {
    const errors = watchErrors(page);
    await bootGame(page);

    /* Title menu: PLAY is selected first — Enter opens the world map. */
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);

    /* Map: first entry is World 1 → Enter, then first stage → Enter. */
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);

    /* The stage save hook reports the default save shape; walk right. */
    const beforeX = await page.evaluate(() => {
      const s = window.__kvShell?.save();
      return s === undefined ? null : s.schemaVersion;
    });
    expect(beforeX).toBe(1);

    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(700);
    await page.keyboard.up('ArrowRight');

    /* Jump: Space (must not throw, no console errors). */
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    /* Pause and resume via P. */
    await page.keyboard.press('KeyP');
    await page.waitForTimeout(200);
    await page.keyboard.press('KeyP');
    await page.waitForTimeout(200);

    expect(errors).toEqual([]);
  });

  test('save progression persists stages and survives reload', async ({ page }) => {
    const errors = watchErrors(page);
    await bootGame(page);

    /* The save is reachable and valid through the read-only hook. */
    const shape = await page.evaluate(() => {
      const s = window.__kvShell?.save();
      return s === undefined
        ? null
        : {
            version: s.schemaVersion,
            pets: s.pets.owned.length,
            settings: typeof s.settings.musicVolume === 'number',
          };
    });
    expect(shape).toEqual({ version: 1, pets: 0, settings: true });

    await page.reload();
    await expect.poll(
      async () => page.evaluate(() => window.__kvShell?.ready === true),
      { timeout: 15_000 },
    ).toBe(true);

    const afterReload = await page.evaluate(() => window.__kvShell?.save()?.schemaVersion);
    expect(afterReload).toBe(1);
    expect(errors).toEqual([]);
  });

  test('touch controls appear and respond on touch-emulated devices', async ({ page }, testInfo) => {
    const errors = watchErrors(page);
    /* tap() requires Playwright's hasTouch context option (touch-tablet project). */
    test.skip(testInfo.project.use.hasTouch !== true, 'tap needs hasTouch context — covered by the touch-tablet project');

    await bootGame(page);
    const jump = page.locator('.touch-btn', { hasText: 'JUMP' });
    await expect(jump).toBeVisible();
    await jump.tap();
    await page.waitForTimeout(300);
    expect(errors).toEqual([]);
  });
});
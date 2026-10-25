import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const APP_URL = 'http://127.0.0.1:4175';

/** Collects console/page errors; any entry fails the test. */
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

test.describe('M1 shell smoke', () => {
  test('boots the Phaser shell with zero console/page errors', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(APP_URL);

    await expect(page.locator('#shellStatus')).toHaveText('Waiting for input');
    await expect(page.getByRole('heading', { name: 'KINAN VS. WORLDS' })).toBeVisible();

    /* Phaser canvas is present and the shell reports ready. */
    await expect.poll(
      async () => page.evaluate(() => window.__kvShell?.ready === true),
      { timeout: 15_000 },
    ).toBe(true);
    await expect(page.locator('#game-root canvas')).toHaveCount(1);

    expect(errors).toEqual([]);
  });

  test('primary input interaction works (desktop click / touch tap)', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(APP_URL);

    await expect(page.locator('#shellStatus')).toHaveText('Waiting for input');
    await page.locator('#startBtn').click();
    await expect(page.locator('#shellStatus')).toHaveText(
      'Game ready â€” use the map to pick a stage.',
    );

    expect(errors).toEqual([]);
  });

  test('viewport stays usable in the emulated device orientation', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(APP_URL);

    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    const start = page.locator('#startBtn');
    await expect(start).toBeVisible();
    const box = await start.boundingBox();
    expect(box).not.toBeNull();
    if (viewport !== null && box !== null) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
    }

    expect(errors).toEqual([]);
  });
});

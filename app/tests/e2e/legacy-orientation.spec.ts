import { expect, test, type Browser, type ConsoleMessage, type Page } from '@playwright/test';

const DEV_URL = 'http://127.0.0.1:4174/index.html?devtools=1';
const PROD_URL = 'http://127.0.0.1:4174/index.html';
const LANDSCAPE = { width: 844, height: 390 };
const PORTRAIT = { width: 390, height: 844 };

type DevHooks = {
  jumpToStage: (index: number) => void;
  advance: () => void;
  state: () => { paused: boolean };
};

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

async function touchPage(browser: Browser, viewport: { width: number; height: number }) {
  const context = await browser.newContext({ viewport, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const page = await context.newPage();
  return { context, page };
}

async function startStage(page: Page): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => typeof (window as unknown as { __k11?: DevHooks }).__k11 === 'object');
  await page.evaluate(() => (window as unknown as { __k11: DevHooks }).__k11.jumpToStage(0));
  await expect(page.locator('#stage')).toBeVisible();
}

async function dismissStory(page: Page): Promise<void> {
  for (let i = 0; i < 18 && await page.locator('#dialog').isVisible(); i++) {
    await page.locator('#dialog').click();
    await page.waitForTimeout(40);
  }
  await expect(page.locator('#dialog')).toBeHidden();
}

async function paused(page: Page): Promise<boolean> {
  return page.evaluate(() => (window as unknown as { __k11: DevHooks }).__k11.state().paused);
}

test.describe('legacy orientation safety', () => {
  test('touch portrait shows an upright rotate gate without rotating the app', async ({ browser }) => {
    const { context, page } = await touchPage(browser, PORTRAIT);
    const errors = watchErrors(page);
    try {
      await page.goto(PROD_URL);
      await expect(page.locator('#portraitGate')).toBeHidden();
      await startStage(page);

      const gate = page.locator('#portraitGate');
      await expect(gate).toBeVisible();
      await expect(gate).toContainText(/rotate to landscape/i);
      const box = await gate.boundingBox();
      expect(box?.x).toBe(0);
      expect(box?.y).toBe(0);
      expect(box?.width).toBe(PORTRAIT.width);
      expect(box?.height).toBe(PORTRAIT.height);
      const layout = await page.evaluate(() => ({
        rotated: document.documentElement.classList.contains('rotated'),
        appTransform: getComputedStyle(document.getElementById('app') as HTMLElement).transform,
        canvasTransform: getComputedStyle(document.getElementById('cv') as HTMLElement).transform,
      }));
      expect(layout).toEqual({ rotated: false, appTransform: 'none', canvasTransform: 'none' });
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  });

  test('rotation pauses for the gate and resumes only the orientation pause', async ({ browser }) => {
    const { context, page } = await touchPage(browser, LANDSCAPE);
    const errors = watchErrors(page);
    try {
      await startStage(page);
      await dismissStory(page);
      await expect.poll(() => paused(page)).toBe(false);
      await expect(page.locator('#portraitGate')).toBeHidden();

      await page.setViewportSize(PORTRAIT);
      await expect(page.locator('#portraitGate')).toBeVisible();
      await expect.poll(() => paused(page)).toBe(true);

      await page.setViewportSize(LANDSCAPE);
      await expect(page.locator('#portraitGate')).toBeHidden();
      await expect.poll(() => paused(page)).toBe(false);
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  });

  test('returning to landscape never clears a manual pause', async ({ browser }) => {
    const { context, page } = await touchPage(browser, LANDSCAPE);
    const errors = watchErrors(page);
    try {
      await startStage(page);
      await dismissStory(page);
      await page.locator('#menuBtn').click();
      await expect(page.locator('#menu')).toBeVisible();
      await expect.poll(() => paused(page)).toBe(true);

      await page.setViewportSize(PORTRAIT);
      await expect(page.locator('#portraitGate')).toBeVisible();
      await page.setViewportSize(LANDSCAPE);
      await expect(page.locator('#portraitGate')).toBeHidden();
      await expect.poll(() => paused(page)).toBe(true);
      await expect(page.locator('#menu')).toBeVisible();
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  });

  test('a narrow desktop window does not trigger the touch-only gate', async ({ browser }) => {
    const context = await browser.newContext({ viewport: PORTRAIT, hasTouch: false, isMobile: false });
    const page = await context.newPage();
    const errors = watchErrors(page);
    try {
      await page.goto(PROD_URL);
      await expect(page.locator('#portraitGate')).toBeHidden();
      expect(await page.evaluate(() => matchMedia('(hover: none)').matches)).toBe(false);
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  });
});

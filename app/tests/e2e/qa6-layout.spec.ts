import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* QA 2026-10-28 (MINOR): on a sideways iPhone the map picture was only 361 x 201 (the four tools took a
   whole row under it); at 1920 x 1080 the game sat in a narrow ~880 px column. Sideways phones now put the
   tools in a slim column beside PLAY so the picture gets the panel's height; big screens let the game
   grow with the window (the picture keeps its 432:240 shape and never makes the page scroll). */
const BASE = 'http://127.0.0.1:4174/index.html';
type Box = { x: number; y: number; width: number; height: number };
type Win = Window & { KINAN?: { state: () => { mounted: boolean; busy: boolean; walking: boolean; crossing: boolean; banner: string | null } } };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function openMap(page: Page): Promise<void> {
  await page.goto(BASE);
  await page.locator('#startBtn').click({ force: true });
  /* 2026-10-28: a new save's first PLAY plays the opening cutscene first (c1-cutscenes.spec.ts); SKIP ends it */
  await expect(page.locator('#cut')).toBeVisible();
  await page.locator('#cutSkip').click();
  await page.waitForFunction(() => { const k = (window as unknown as Win).KINAN; return !!k && k.state().mounted && !k.state().busy; });
  await expect(page.locator('#owHost .km-canvas')).toBeVisible();
  await page.waitForTimeout(300);   /* the picture is fitted on the next frame (ResizeObserver) */
}
const overlap = (a: Box, b: Box): boolean => a.x < b.x + b.width - 0.5 && b.x < a.x + a.width - 0.5 && a.y < b.y + b.height - 0.5 && b.y < a.y + a.height - 0.5;
const inside = (a: Box, vw: number, vh: number): boolean => a.x >= -0.5 && a.y >= -0.5 && a.x + a.width <= vw + 0.5 && a.y + a.height <= vh + 0.5;
async function noScroll(page: Page): Promise<void> {
  const s = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight, iw: innerWidth, ih: innerHeight }));
  expect(s.w, 'no sideways scroll').toBeLessThanOrEqual(s.iw + 1);
  expect(s.h, 'no page scroll').toBeLessThanOrEqual(s.ih + 1);
}

for (const vp of [{ width: 750, height: 342 }, { width: 844, height: 390 }]) {
  test.describe(`QA fix: the map uses a sideways phone's screen (${vp.width} x ${vp.height})`, () => {
    test.use({ viewport: vp, hasTouch: true });
    test('the picture is big (QA measured 361 x 201 at 750 x 342), the buttons sit beside it, the menu button is up in the corner, nothing covers it', async ({ page }) => {
      const errors = watchErrors(page);
      await openMap(page);
      const canvas = (await page.locator('#owHost .km-canvas').boundingBox())!;
      const btn = async (id: string): Promise<Box> => (await page.locator(id).boundingBox())!;
      const [prev, next, play] = [await btn('#owPrev'), await btn('#owNext'), await btn('#owPlay')];
      /* 2026-10-28: the four map tools (Title, Pets, Shop, How to play) moved into THE MENU: one button in the header's corner */
      const tools = [await btn('#menuBtn')];
      await noScroll(page);
      expect(inside(canvas, vp.width, vp.height)).toBe(true);
      expect(canvas.width / canvas.height).toBeGreaterThan(1.7);
      expect(canvas.width / canvas.height).toBeLessThan(1.9);
      expect(canvas.height, 'the picture gets most of the height').toBeGreaterThanOrEqual(vp.height * 0.72);
      expect(canvas.width * canvas.height, 'far bigger than QA\'s 361 x 201').toBeGreaterThan(361 * 201 * 1.5);
      for (const b of [prev, next, play]) {
        expect(inside(b, vp.width, vp.height)).toBe(true);
        expect(Math.min(b.width, b.height), 'thumb-sized').toBeGreaterThanOrEqual(56);
        expect(overlap(b, canvas)).toBe(false);
      }
      expect(next.x + next.width).toBeLessThanOrEqual(canvas.x + 1);   /* ◀ ▶ left of the picture */
      expect(play.x).toBeGreaterThanOrEqual(canvas.x + canvas.width - 1);   /* PLAY right of it */
      for (const t of tools) {
        expect(inside(t, vp.width, vp.height), 'the menu button is on screen').toBe(true);
        expect(overlap(t, canvas) || overlap(t, play) || overlap(t, prev) || overlap(t, next), 'it never covers the picture or a button').toBe(false);
        expect(t.y + t.height, 'it sits above the picture, in the slim top bar').toBeLessThanOrEqual(canvas.y + 1);
        expect(t.x + t.width, 'in the right corner').toBeGreaterThan(vp.width - 80);
        expect(t.width, 'a wide target').toBeGreaterThanOrEqual(60);
        expect(t.height, 'as tall as the slim top bar allows (its tap area reaches 8 px further above and below)').toBeGreaterThanOrEqual(28);
      }
      await page.locator('#menuBtn').tap();
      await page.locator('#howBtn').tap();
      await expect(page.locator('#screen')).toContainText('The story and the moves');
      expect(errors).toEqual([]);
    });
  });
}

test.describe('QA fix: a 1920 x 1080 screen gets a big game, not an 880 px column', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });
  test('the map and a level grow with the window and still fit without scrolling', async ({ page }) => {
    const errors = watchErrors(page);
    await openMap(page);
    const map = (await page.locator('#owHost .km-canvas').boundingBox())!;
    expect(map.width, 'the map picture').toBeGreaterThan(1200);
    expect(inside(map, 1920, 1080)).toBe(true);
    await noScroll(page);
    /* PLAY waits until Kinan stands still on the map (no walk, crossing or world banner), as in the map tests */
    await page.waitForFunction(() => { const s = (window as unknown as Win).KINAN!.state(); return s.mounted && !s.busy && !s.walking && !s.crossing && !s.banner; }, null, { timeout: 30_000 });
    await page.locator('#owPlay').click();   /* 1-1 from the map */
    await expect(page.locator('#stage')).toBeVisible({ timeout: 15_000 });
    const stage = (await page.locator('#stage').boundingBox())!;
    const pad = await page.locator('.pad').boundingBox();
    expect(stage.width, 'the level picture').toBeGreaterThan(1400);
    expect(stage.width / stage.height).toBeGreaterThan(1.7);
    expect(inside(stage, 1920, 1080)).toBe(true);
    if (pad && pad.height > 0) expect(pad.y + pad.height, 'the buttons under it are on screen').toBeLessThanOrEqual(1080);
    await noScroll(page);
    expect(errors).toEqual([]);
  });

  test('a 1280 x 720 window keeps today\'s layout (the 880 px column)', async ({ browser }, testInfo) => {
    /* the touch-tablet project's browser counts as a touch device, whose sideways layout uses the whole width by design */
    test.skip(testInfo.project.name === 'touch-tablet-chromium', 'a touch tablet gets the sideways layout (full width), not the desktop column');
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await ctx.newPage();
    await page.goto(BASE);
    const app = (await page.locator('.app').boundingBox())!;
    expect(Math.round(app.width)).toBeLessThanOrEqual(880);
    await ctx.close();
  });
});

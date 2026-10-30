import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* D1 — every device (2026-10-28, Shad: "iPhone, desktop, Android, tablet, iPad ... most computers, phones and tablets").
   Runs on every project, including the phone and iPad profiles (android-phone = Pixel 7, iphone = iPhone 13,
   ipad = iPad gen 7 landscape), which run only this file.
   · The title, map and a level load with no page errors and no sideways scrolling.
   · Touch screens get the touch buttons, inside the screen and off the picture; a mouse-and-keyboard computer gets the keys line.
   · A phone held upright: menus and the map still work; a level pauses behind the rotate screen, which always explains how to
     turn Auto-rotate / the rotation lock off, and offers "Play sideways" where the browser can turn the game itself.
   · Auto LITE: a slow device switches to LITE effects once, with a note; choosing in Settings turns that off for good. */
const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';
const SAVED = { introSeen: true, levelsBeaten: { '1-1': 1 }, wmap: { w: 1, at: 1 } };

type Dev = {
  mapState: () => { mounted: boolean; busy: boolean; walking: boolean };
  state: () => { paused: boolean; running: boolean };
  progress: () => Record<string, unknown>;
  autoLiteFeed: (ms: number, n?: number) => { lite: boolean; done: boolean; chosen: boolean };
};
type Win = Window & { __k11: Dev; KinanLevels: { ready: boolean }; __lockCalls?: string[]; __fsCalls?: number };
type Box = { l: number; t: number; r: number; b: number };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function seed(page: Page, data: Record<string, unknown>): Promise<void> {
  await page.addInitScript(({ key, d }) => {
    if (sessionStorage.getItem('d1-seeded')) return;
    sessionStorage.setItem('d1-seeded', '1');
    localStorage.setItem(key, JSON.stringify(Object.assign({ unlocked: 1, beaten: [] }, d)));
  }, { key: CURRENT, d: data });
}
async function boot(page: Page): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
}
async function mapUp(page: Page): Promise<void> {
  await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy && !s.walking; });
  await expect(page.locator('#owHost .km-canvas')).toBeVisible();
}
const noSidewaysScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
const portrait = (page: Page) => page.evaluate(() => innerHeight > innerWidth);
async function toLevel(page: Page): Promise<void> {
  await page.locator('#startBtn').click({ force: true });
  await mapUp(page);
  await page.locator('#owPlay').click();
}

test.describe('D1 · the game on every device', () => {
  test('title, map and a level load cleanly; the right controls for the device; no sideways scrolling', async ({ page }, info) => {
    const errors = watchErrors(page);
    await seed(page, SAVED);
    await boot(page);
    await expect(page.locator('#startBtn')).toBeVisible();
    expect(await noSidewaysScroll(page), 'title fits the width').toBe(true);
    const upright = await portrait(page);
    await toLevel(page);
    if (upright) {
      /* a phone held upright: the level waits behind the rotate screen; then the phone turns */
      await expect(page.locator('#portraitGate')).toBeVisible();
      await expect(page.locator('#rotateHelp')).toBeVisible();
      await expect(page.locator('#rotateHelp')).toContainText('Auto rotate');
      await expect(page.locator('#rotateHelp')).toContainText('iPhone');
      const vp = page.viewportSize()!;
      await page.setViewportSize({ width: vp.height, height: vp.width });
    }
    await expect(page.locator('#portraitGate')).toBeHidden();
    await expect(page.locator('#stage')).toBeVisible();
    expect(await noSidewaysScroll(page), 'the level fits the width').toBe(true);
    if (info.project.use.hasTouch) {
      /* touch: the three buttons show, fully on screen (engine-pass-a checks they stay off the play area) */
      for (const k of ['left', 'right', 'jump']) await expect(page.locator(`#pad [data-k="${k}"]`)).toBeVisible();
      const lay = await page.evaluate(() => ({
        buttons: ['left', 'right', 'jump'].map((k) => { const b = document.querySelector(`#pad [data-k="${k}"]`)!.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; }),
        vw: innerWidth, vh: innerHeight
      }));
      for (const b of lay.buttons as Box[]) expect(b.l >= -1 && b.t >= -1 && b.r <= lay.vw + 1 && b.b <= lay.vh + 1, 'button inside the screen').toBe(true);
    } else {
      /* a mouse-and-keyboard computer: the keys line, no touch buttons */
      await expect(page.locator('#keys')).toBeVisible();
      await expect(page.locator('#pad')).toBeHidden();
    }
    expect(errors).toEqual([]);
  });

  test('a phone held upright: the map works upright, and "Play sideways" asks the browser to go full screen and turn', async ({ page }, info) => {
    test.skip(!info.project.use.hasTouch, 'touch devices only');
    const errors = watchErrors(page);
    await page.addInitScript(() => {
      const w = window as unknown as Win;
      w.__lockCalls = []; w.__fsCalls = 0;
      try {
        if (screen.orientation) Object.defineProperty(screen.orientation, 'lock', { configurable: true, value: async (o: string) => { w.__lockCalls!.push(o); } });
        Object.defineProperty(Element.prototype, 'requestFullscreen', { configurable: true, value: async () => { w.__fsCalls = (w.__fsCalls || 0) + 1; } });
      } catch (e) { /* a browser that refuses the stand-in simply shows the help line */ }
    });
    await seed(page, SAVED);
    const vp = page.viewportSize()!;
    if (vp.width > vp.height) await page.setViewportSize({ width: vp.height, height: vp.width });   /* hold it upright */
    await boot(page);
    await page.locator('#startBtn').click({ force: true });
    await mapUp(page);
    await expect(page.locator('#portraitGate')).toBeHidden();   /* the map and menus work upright */
    await page.locator('#owPlay').click();
    await expect(page.locator('#portraitGate')).toBeVisible();
    await expect(page.locator('#rotateHelp')).toBeVisible();
    /* the level waits while upright: paused (WebKit applies it a frame after the gate shows) and Kinan doesn't move */
    await page.waitForFunction(() => (window as unknown as Win).__k11.state().paused, null, { timeout: 3000 });
    const px0 = await page.evaluate(() => (window as unknown as { __k11: { state: () => { px: number } } }).__k11.state().px);
    await page.waitForTimeout(1000);
    expect(await page.evaluate(() => (window as unknown as { __k11: { state: () => { px: number } } }).__k11.state().px), 'Kinan stays put behind the rotate screen').toBe(px0);
    const go = page.locator('#rotateGo');
    if (await go.isVisible()) {
      await go.click();
      await page.waitForFunction(() => ((window as unknown as Win).__lockCalls || []).length > 0);
      const calls = await page.evaluate(() => ({ lock: (window as unknown as Win).__lockCalls, fs: (window as unknown as Win).__fsCalls }));
      expect(calls.lock).toEqual(['landscape']);
      expect(calls.fs).toBe(1);
    } else {
      expect(info.project.name, 'only a browser without the turn-it-yourself feature hides the button').not.toBe('android-phone');
    }
    expect(errors).toEqual([]);
  });

  test('auto LITE: a slow device switches to LITE effects once, with a note; a Settings choice turns it off for good', async ({ page }) => {
    const errors = watchErrors(page);
    await seed(page, SAVED);
    await boot(page);
    const fast = await page.evaluate(() => (window as unknown as Win).__k11.autoLiteFeed(16, 240));
    expect(fast, 'a fast device keeps FULL effects').toEqual({ lite: false, done: true, chosen: false });
    await page.reload();
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    const slow = await page.evaluate(() => (window as unknown as Win).__k11.autoLiteFeed(40, 240));
    expect(slow, 'a slow device goes LITE').toEqual({ lite: true, done: true, chosen: false });
    await expect(page.locator('#toast')).toContainText('LITE');
    await expect(page.locator('body')).toHaveClass(/\blite\b/);
    /* the player picks FULL in Settings: auto LITE never comes back */
    await page.evaluate(() => (document.querySelector('#fxBtn') as HTMLButtonElement).click());
    await page.reload();
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    const after = await page.evaluate(() => (window as unknown as Win).__k11.autoLiteFeed(40, 240));
    expect(after, 'the Settings choice wins').toEqual({ lite: false, done: false, chosen: true });
    expect(errors).toEqual([]);
  });
});

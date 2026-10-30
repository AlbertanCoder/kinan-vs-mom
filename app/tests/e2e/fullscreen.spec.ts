import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* FULL SCREEN ON A COMPUTER (Shad, 2026-10-29: "make the desktop version go full screen as well in the menu options").
   index.html "FULL SCREEN": ⛶ Fullscreen in Settings shows on every screen the menu opens from (the title, the map, a
   level), fills the screen with the WHOLE page (the document element, not just the game picture), reads "Exit
   fullscreen" while on, and F toggles it. fsLayout scales the page up as one picture with its shape kept.
   Headless Chromium runs the real Fullscreen API without resizing the window, so the layout is checked at 1920x1080
   with the same code path a real full screen takes. Phones and tablets keep the old button (not tested here). */
const DEV_URL = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html?devtools=1`;
const SHOTS = fileURLToPath(new URL('../../kick-shots/', import.meta.url));

type Dev = {
  playLevel: (id: string) => unknown; worldMap: () => boolean; clearFoes: () => void; freeze: (on: boolean) => boolean;
  mapState: () => { mounted: boolean; busy?: boolean }; cut: () => { on: boolean }; cutSkip: () => unknown;
  menu: () => { open: boolean; page: string; from: string };
};
type Win = Window & { __k11: Dev; KinanLevels: { ready: boolean }; __fsReq?: string[] };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function boot(page: Page): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
  /* note which element each fullscreen request asks for (the real request still runs) */
  await page.evaluate(() => {
    const w = window as unknown as Win, orig = Element.prototype.requestFullscreen;
    w.__fsReq = [];
    Element.prototype.requestFullscreen = function (this: Element, o?: FullscreenOptions) {
      w.__fsReq!.push(this === document.documentElement ? 'html' : this.id || this.tagName);
      return orig.call(this, o);
    };
  });
}
async function toMap(page: Page): Promise<void> {
  await page.evaluate(() => (window as unknown as Win).__k11.worldMap());
  await page.waitForFunction(() => {
    const k = (window as unknown as Win).__k11;
    if (k.cut().on) k.cutSkip();
    const s = k.mapState();
    return s.mounted && !s.busy && !k.cut().on;
  }, null, { timeout: 45_000, polling: 250 });
}
async function toLevel(page: Page): Promise<void> {
  await page.evaluate(() => { const k = (window as unknown as Win).__k11; k.playLevel('1-1'); k.clearFoes(); });
  await page.waitForFunction(() => !(document.getElementById('stage') as HTMLElement).hidden);
}
/* open the menu's Settings page and read the full screen button */
async function fullButton(page: Page): Promise<{ hidden: boolean; visible: boolean; text: string }> {
  await page.evaluate(() => {
    const m = document.getElementById('menu') as HTMLElement;
    if (m.hidden) (document.getElementById('menuBtn') as HTMLButtonElement).click();
    (document.getElementById('settingsBtn') as HTMLButtonElement).click();
  });
  const b = page.locator('#fullBtn');
  return { hidden: await b.evaluate((e) => (e as HTMLElement).hidden === true), visible: await b.isVisible(), text: (await b.textContent()) || '' };
}
async function closeMenu(page: Page): Promise<void> {
  await page.evaluate(() => { const m = document.getElementById('menu') as HTMLElement; if (!m.hidden) (document.getElementById('menuX') as HTMLButtonElement).click(); });
}
/* wait until the page has taken the change in (fullscreenchange comes a frame after the browser switches) */
const waitFs = (page: Page, on: boolean) => page.waitForFunction((on) =>
  !!document.fullscreenElement === on && document.documentElement.classList.contains('fsdesk') === on &&
  (document.getElementById('fullBtn') as HTMLElement).textContent === (on ? '⛶ Exit fullscreen' : '⛶ Fullscreen'), on);
const fsState = (page: Page) => page.evaluate(() => ({
  el: document.fullscreenElement === document.documentElement ? 'html' : document.fullscreenElement ? document.fullscreenElement.id || 'other' : null,
  cls: document.documentElement.classList.contains('fsdesk'), label: (document.getElementById('fullBtn') as HTMLElement).textContent,
  req: (window as unknown as Win).__fsReq!.slice()
}));
/* where the page's parts sit on the screen (screen pixels) */
const layout = (page: Page) => page.evaluate(() => {
  const r = (id: string) => { const e = document.getElementById(id) as HTMLElement; if (!e || e.hidden) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
  const cv = document.getElementById('cv') as HTMLCanvasElement;
  return { vw: innerWidth, vh: innerHeight, body: r('app') && (() => { const b = document.body.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; })(), app: r('app'), stage: r('stage'), screen: r('screen'),
    hud: (() => { const b = (document.querySelector('.hud') as HTMLElement).getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; })(),
    pixelated: getComputedStyle(cv).imageRendering, bg: getComputedStyle(document.body).backgroundColor };
});

test.describe('Full screen on a computer', () => {
  test.skip(({ browserName, isMobile }) => browserName !== 'chromium' || !!isMobile, 'desktop Chromium: the Fullscreen API runs headless there');

  test('⛶ Fullscreen shows in Settings on the title, the map and in a level; the key lines list F', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await boot(page);
    const title = await fullButton(page);
    expect(title).toEqual({ hidden: false, visible: true, text: '⛶ Fullscreen' });
    expect(await page.evaluate(() => getComputedStyle(document.getElementById('menuHint') as HTMLElement, '::after').content)).toBe('" · F full screen"');
    await closeMenu(page);
    await toMap(page);
    expect(await fullButton(page)).toEqual({ hidden: false, visible: true, text: '⛶ Fullscreen' });
    expect(await page.evaluate(() => (window as unknown as Win).__k11.menu().from)).toBe('map');
    await closeMenu(page);
    await toLevel(page);
    expect(await fullButton(page)).toEqual({ hidden: false, visible: true, text: '⛶ Fullscreen' });
    expect(await page.evaluate(() => (window as unknown as Win).__k11.menu().from)).toBe('game');
    await closeMenu(page);
    expect(await page.evaluate(() => getComputedStyle(document.getElementById('keys') as HTMLElement, '::after').content)).toBe('" · F full screen"');
    expect(errors).toEqual([]);
  });

  test('the button and F fullscreen the WHOLE page; the label follows the state; Esc never opens the menu while it is on', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await boot(page);
    await fullButton(page);
    await page.locator('#fullBtn').click();
    await waitFs(page, true);
    let s = await fsState(page);
    expect(s).toMatchObject({ el: 'html', cls: true, label: '⛶ Exit fullscreen', req: ['html'] });
    /* fixes run 2: choosing it closed the menu (so the game can be played); open Settings again to leave */
    expect(await page.evaluate(() => (window as unknown as Win).__k11.menu().open)).toBe(false);
    await fullButton(page);
    await page.locator('#fullBtn').click();
    await waitFs(page, false);
    s = await fsState(page);
    expect(s).toMatchObject({ el: null, cls: false, label: '⛶ Fullscreen' });
    expect(await page.evaluate(() => document.body.style.transform)).toBe('');
    await closeMenu(page);

    /* F on the map and in a level */
    await toMap(page);
    await page.keyboard.press('f');
    await waitFs(page, true);
    expect(await fsState(page)).toMatchObject({ el: 'html', cls: true, label: '⛶ Exit fullscreen', req: ['html', 'html'] });
    await page.keyboard.press('f');
    await waitFs(page, false);
    expect((await fsState(page)).label).toBe('⛶ Fullscreen');
    await toLevel(page);
    await page.keyboard.press('f');
    await waitFs(page, true);
    expect(await fsState(page)).toMatchObject({ el: 'html', cls: true, req: ['html', 'html', 'html'] });
    /* Esc while full screen is the browser's (it leaves full screen): the game does not pause on that press */
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => (window as unknown as Win).__k11.menu().open)).toBe(false);
    await page.evaluate(() => (document.fullscreenElement ? document.exitFullscreen() : undefined));
    await waitFs(page, false);
    /* F typed into a text box is just a letter */
    await page.evaluate(() => { const i = document.createElement('input'); i.id = 'fsTyping'; document.body.appendChild(i); i.focus(); });
    await page.keyboard.press('f');
    await page.waitForTimeout(200);
    expect((await fsState(page)).el).toBe(null);
    expect(errors).toEqual([]);
  });

  test('in full screen at 1920x1080 the map and a level fill the screen, the shape kept, pixel art sharp (pictures for Shad)', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await boot(page);
    mkdirSync(SHOTS, { recursive: true });
    const normal = await layout(page);
    await toMap(page);
    await page.keyboard.press('f');
    await page.waitForFunction(() => document.documentElement.classList.contains('fsdesk'));
    await page.waitForTimeout(400);   /* the map refits to its new box */
    const map = await layout(page);
    /* the whole page covers the screen; the app is scaled up as one picture and centred */
    expect(map.body!.x).toBeCloseTo(0, 0); expect(map.body!.y).toBeCloseTo(0, 0);
    expect(map.body!.w).toBeCloseTo(1920, 0); expect(map.body!.h).toBeCloseTo(1080, 0);
    const s = Math.min(1920 / 908, 1080 / 604);   /* index.html FS_W x FS_H, the page's usual size, fitted to the screen */
    expect(map.app!.w).toBeCloseTo(880 * s, -1);   /* the 880-wide page scaled up as one picture */
    expect(map.hud.h).toBeGreaterThan(normal.hud.h * 1.6);   /* the top bar (and its words) grow with it */
    expect(map.app!.h).toBeGreaterThan(1040);
    expect(Math.abs(map.app!.x + map.app!.w / 2 - 960)).toBeLessThan(2);
    expect(map.screen!.w).toBeGreaterThan(1500);
    expect(map.bg).toBe('rgb(0, 0, 0)');
    await page.screenshot({ path: SHOTS + 'fullscreen-map.png' });

    await toLevel(page);
    await page.evaluate(() => (window as unknown as Win).__k11.freeze(true));
    await page.waitForTimeout(300);
    const lvl = await layout(page);
    expect(lvl.stage!.w).toBeGreaterThan(1500);
    expect(lvl.stage!.w / lvl.stage!.h).toBeGreaterThan(1.76); expect(lvl.stage!.w / lvl.stage!.h).toBeLessThan(1.84);   /* 432:240, not stretched */
    expect(lvl.stage!.y).toBeGreaterThanOrEqual(lvl.hud.y + lvl.hud.h);
    expect(lvl.stage!.y + lvl.stage!.h).toBeLessThanOrEqual(1080);
    expect(lvl.hud.w).toBeCloseTo(lvl.stage!.w, -1);
    expect(['pixelated', 'crisp-edges']).toContain(lvl.pixelated);   /* scaled by whole blocks of pixels, never smoothed */
    await page.screenshot({ path: SHOTS + 'fullscreen-level.png' });

    /* leaving puts the page back exactly */
    await page.evaluate(() => document.exitFullscreen());
    await page.waitForFunction(() => !document.documentElement.classList.contains('fsdesk'));
    const back = await layout(page);
    expect(back.app!.w).toBeCloseTo(normal.app!.w, 0);
    expect(errors).toEqual([]);
  });

  /* Fixes run 2 (Shad: "when you go into full screen, you can't actually play the game. The controls don't work"):
     choosing ⛶ Fullscreen in the menu closes the menu and the game plays on; the keys (and a gamepad) move Kinan. */
  type St = { px: number; py: number; onGround: boolean; paused: boolean };
  const st = (page: Page) => page.evaluate(() => (window as unknown as { __k11: { state: () => St } }).__k11.state());
  /* hold → for a moment, then tap jump: how far he ran and how high he rose (real frames, as a player would) */
  async function runAndJump(page: Page, press: { right: () => Promise<void>; stop: () => Promise<void>; jump: () => Promise<void>; land: () => Promise<void> }) {
    const a = await st(page);
    await press.right(); await page.waitForTimeout(700); await press.stop();
    const b = await st(page);
    await page.waitForFunction(() => (window as unknown as { __k11: { state: () => St } }).__k11.state().onGround, null, { timeout: 5000 });
    const y0 = (await st(page)).py;
    await press.jump();
    let top = y0;
    for (let i = 0; i < 14; i++) { await page.waitForTimeout(40); top = Math.min(top, (await st(page)).py); }
    await press.land();
    return { ran: b.px - a.px, rose: y0 - top, paused: b.paused };
  }
  const keys = (page: Page) => ({
    right: () => page.keyboard.down('ArrowRight'), stop: () => page.keyboard.up('ArrowRight'),
    jump: () => page.keyboard.down('Space'), land: () => page.keyboard.up('Space'),
  });
  async function startLevel(page: Page): Promise<void> {
    await toLevel(page);
    await page.evaluate(() => { const k = (window as unknown as { __k11: { storyStop: () => void; godMode: () => void } }).__k11; k.storyStop(); k.godMode(); });
    await page.waitForFunction(() => (window as unknown as { __k11: { state: () => St } }).__k11.state().onGround, null, { timeout: 5000 });
  }

  test('fixes run 2: ⛶ Fullscreen from the menu in a level closes the menu, and the keys and a gamepad move Kinan', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await boot(page);
    await startLevel(page);
    /* the way a player does it: MENU (the game pauses), Settings, ⛶ Fullscreen */
    await page.locator('#menuBtn').click();
    expect((await st(page)).paused).toBe(true);
    await page.locator('#settingsBtn').click();
    await page.locator('#fullBtn').click();
    await waitFs(page, true);
    const now = await page.evaluate(() => ({
      menu: (window as unknown as Win).__k11.menu().open,
      focus: document.activeElement ? document.activeElement.tagName : null,
    }));
    expect(now).toEqual({ menu: false, focus: 'BODY' });
    expect((await st(page)).paused).toBe(false);
    const k = await runAndJump(page, keys(page));
    expect(k.paused).toBe(false);
    expect(k.ran, 'holding → runs him right').toBeGreaterThan(24);
    expect(k.rose, 'SPACE jumps').toBeGreaterThan(16);
    /* a gamepad too: the stick right, then A */
    await page.evaluate(() => {
      const pad = { id: 'test pad', connected: true, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
      (window as unknown as { __pad: typeof pad }).__pad = pad;
      Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [pad] });
    });
    type PadWin = { __pad: { axes: number[]; buttons: { pressed: boolean }[] } };
    const g = await runAndJump(page, {
      right: () => page.evaluate(() => { (window as unknown as PadWin).__pad.axes[0] = 1; }),
      stop: () => page.evaluate(() => { (window as unknown as PadWin).__pad.axes[0] = 0; }),
      jump: () => page.evaluate(() => { (window as unknown as PadWin).__pad.buttons[0].pressed = true; }),
      land: () => page.evaluate(() => { (window as unknown as PadWin).__pad.buttons[0].pressed = false; }),
    });
    expect(g.ran, 'the stick runs him right').toBeGreaterThan(24);
    expect(g.rose, 'A jumps').toBeGreaterThan(16);
    expect((await fsState(page)).el).toBe('html');
    await page.evaluate(() => document.exitFullscreen());
    await waitFs(page, false);
    expect(errors).toEqual([]);
  });

  test('fixes run 2: F in a level goes full screen and the keys still move Kinan; on the map too', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await boot(page);
    await startLevel(page);
    await page.keyboard.press('f');
    await waitFs(page, true);
    expect(await page.evaluate(() => (window as unknown as Win).__k11.menu().open)).toBe(false);
    const k = await runAndJump(page, keys(page));
    expect(k.paused).toBe(false);
    expect(k.ran).toBeGreaterThan(24);
    expect(k.rose).toBeGreaterThan(16);
    await page.keyboard.press('f');
    await waitFs(page, false);
    /* the map in full screen answers the keys: → walks Kinan to the next spot */
    await toMap(page);
    await page.keyboard.press('f');
    await waitFs(page, true);
    const before = await page.evaluate(() => JSON.stringify((window as unknown as { __k11: { mapState: () => unknown } }).__k11.mapState()));
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1500);
    const after = await page.evaluate(() => JSON.stringify((window as unknown as { __k11: { mapState: () => unknown } }).__k11.mapState()));
    expect(after, 'the map moved on → in full screen').not.toBe(before);
    await page.keyboard.press('f');
    await waitFs(page, false);
    expect(errors).toEqual([]);
  });
});

import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* V2 — auto-run (2026-10-28). The "Auto-run" setting is ON by default on every device: Kinan runs by himself
   (§1.1 RUN_MAX), and holding SHIFT or X walks (WALK_MAX). Off = classic hold-to-run: no key walks, SHIFT / X
   runs. Gamepad B runs either way. The §1.1 numbers never change (FEEL.WALK_MAX 1.9, RUN_MAX 3.2): only which
   input means "run". Driven by real key events (and a stand-in gamepad); speeds read from the engine's probe. */
const DEV_URL = 'http://127.0.0.1:4174/index.html?devtools=1';
type Probe = { x: number; vx: number; onGround: boolean };
type Dev = {
  playLevel: (id: string) => unknown; godMode: () => void; clearFoes: () => void; place: (x: number, y: number) => unknown;
  probe: () => Probe; step: (n: number, h?: Record<string, unknown>) => Probe[]; progress: () => { autoRun?: boolean };
  feelProbe?: () => unknown;
};
type Win = { __k11: Dev; KinanLevels: { ready: boolean }; __pad: { axes: number[]; buttons: { pressed: boolean; value: number }[] } };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function boot(page: Page, pad = false): Promise<void> {
  await page.addInitScript((withPad) => {
    HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };   /* no sound from a test page */
    if (!withPad) return;
    const w = window as unknown as Win;
    w.__pad = { axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
    Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [Object.assign({ id: 'test pad', index: 0, connected: true, mapping: 'standard' }, w.__pad)] });
  }, pad);
  await page.goto(DEV_URL);
  await page.waitForFunction(() => { const w = window as unknown as Win; return typeof w.__k11 === 'object' && !!w.KinanLevels && w.KinanLevels.ready; });
}
/* 1-1: off the bed onto the long flat bedroom floor (cols 0-29), no socks, nothing can hurt him */
async function floor(page: Page): Promise<void> {
  await page.evaluate(() => {
    const k = (window as unknown as Win).__k11;
    k.playLevel('1-1'); k.godMode(); k.clearFoes();
    k.place(8 * 16, 150); k.step(30);
  });
  await page.locator('#cv').focus().catch(() => {});
}
const vx = (page: Page): Promise<number> => page.evaluate(() => (window as unknown as Win).__k11.probe().vx);
/* hold the keys (real key events) until Kinan's speed settles; that speed */
async function topSpeed(page: Page, keys: string[]): Promise<number> {
  await floor(page);
  for (const k of keys) await page.keyboard.down(k);
  let top = 0;
  try {
    await expect.poll(async () => { top = await vx(page); return top; }, { timeout: 4000, intervals: [50] }).toBeGreaterThanOrEqual(1.9);
    await page.waitForTimeout(250);   /* past the acceleration: ACC_GROUND 0.30 reaches RUN_MAX in ~11 frames */
    top = await vx(page);
  } finally {
    for (const k of keys.slice().reverse()) await page.keyboard.up(k);
  }
  return Math.round(top * 100) / 100;
}

test.describe('V2 · auto-run', () => {
  test('ON by default on every device: holding → alone runs at RUN_MAX (3.2); holding SHIFT walks (1.9); so does holding X', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    expect((await page.evaluate(() => (window as unknown as Win).__k11.progress())).autoRun).toBe(true);
    expect(await topSpeed(page, ['ArrowRight'])).toBe(3.2);
    expect(await topSpeed(page, ['Shift', 'ArrowRight'])).toBe(1.9);
    expect(await topSpeed(page, ['x', 'ArrowRight'])).toBe(1.9);
    expect(errors).toEqual([]);
  });

  test('the Auto-run switch in the pause menu turns it OFF: classic hold-to-run (no key walks, SHIFT runs); the save keeps it', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await floor(page);
    await page.locator('#pauseBtn').click();
    await expect(page.locator('#autoRunBtn')).toHaveText('Auto-run: ON');
    await page.locator('#autoRunBtn').click();
    await expect(page.locator('#autoRunBtn')).toHaveText('Auto-run: OFF');
    await page.locator('#resumeBtn').click();
    expect((await page.evaluate(() => (window as unknown as Win).__k11.progress())).autoRun).toBe(false);
    await expect(page.locator('#keys')).toContainText('hold SHIFT to run');
    expect(await topSpeed(page, ['ArrowRight'])).toBe(1.9);
    expect(await topSpeed(page, ['Shift', 'ArrowRight'])).toBe(3.2);
    await page.reload();
    await page.waitForFunction(() => { const w = window as unknown as Win; return typeof w.__k11 === 'object' && !!w.KinanLevels && w.KinanLevels.ready; });
    expect((await page.evaluate(() => (window as unknown as Win).__k11.progress())).autoRun).toBe(false);
    expect(await topSpeed(page, ['ArrowRight'])).toBe(1.9);
    expect(errors).toEqual([]);
  });

  test('gamepad: the stick alone runs with auto-run on; B runs with auto-run off', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page, true);
    const padSpeed = async (b: boolean): Promise<number> => {
      await floor(page);
      await page.evaluate((hold) => { const p = (window as unknown as Win).__pad; p.axes[0] = 1; p.buttons[1].pressed = hold; p.buttons[1].value = hold ? 1 : 0; }, b);
      let top = 0;
      await expect.poll(async () => { top = await vx(page); return top; }, { timeout: 4000, intervals: [50] }).toBeGreaterThanOrEqual(1.9);
      await page.waitForTimeout(250);
      top = await vx(page);
      await page.evaluate(() => { const p = (window as unknown as Win).__pad; p.axes[0] = 0; p.buttons[1].pressed = false; p.buttons[1].value = 0; });
      return Math.round(top * 100) / 100;
    };
    expect(await padSpeed(false)).toBe(3.2);
    expect(await padSpeed(true)).toBe(3.2);
    await page.locator('#pauseBtn').click();
    await page.locator('#autoRunBtn').click();
    await page.locator('#resumeBtn').click();
    expect(await padSpeed(true)).toBe(3.2);
    /* with a mouse-and-keyboard device the stick alone walks then, so B is what runs (a touch device always runs) */
    if (await page.evaluate(() => matchMedia('(any-pointer: fine)').matches)) expect(await padSpeed(false)).toBe(1.9);
    expect(errors).toEqual([]);
  });

  test('the how-to says it: the keys line and How to play (with its own Auto-run switch)', async ({ page }, testInfo) => {
    const errors = watchErrors(page);
    await boot(page);
    await floor(page);
    const fine = await page.evaluate(() => matchMedia('(hover:hover) and (pointer:fine)').matches);
    if (fine) await expect(page.locator('#keys')).toContainText('Kinan runs by himself');
    expect(await page.locator('#keys').textContent()).toContain('hold SHIFT or X to walk');
    await page.evaluate(() => (window as unknown as { __k11: { worldMap: () => void } }).__k11.worldMap());
    await page.locator('#owHow').click();
    await expect(page.locator('.howto')).toContainText('Kinan runs by himself');
    await expect(page.locator('#howAutoRun')).toHaveText(/Auto-run: ON/);
    if (testInfo.project.name === 'desktop-chromium') {   /* page 2 of How to play holds the switch */
      await page.locator('.scrfoot button', { hasText: '▶' }).first().click();
      await page.waitForTimeout(400);
    }
    if (testInfo.project.name === 'desktop-chromium') await page.screenshot({ path: fileURLToPath(new URL('../../v2-shots/how-to-auto-run.png', import.meta.url)) });
    await page.locator('#howAutoRun').click();
    await expect(page.locator('#howAutoRun')).toHaveText(/Auto-run: OFF/);
    expect((await page.evaluate(() => (window as unknown as Win).__k11.progress())).autoRun).toBe(false);
    expect(errors).toEqual([]);
  });
});

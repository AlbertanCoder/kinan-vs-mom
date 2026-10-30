import { expect, test, type Browser, type ConsoleMessage, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/* W12 2.5D TEST (2026-10-29): 3d/levels/12-3-side.js, a side-on rebuild of 12-3 (THE RIVER VALLEY) using the
   opt-in side mode in the 3D engine (3d/js/side.js). A test level only: not on the map, not published.
   - the page loads 12-3-side with no page errors
   - the side camera stays square on to the path (never behind Kinan), swings smoothly round a corner, and
     ignores Q/E and mouse drags
   - Kinan stays on the path line while running and jumping; right = forward, left = back
   - double jump, wall jump, ledge grab (and the tower ladder climb) each work at least once
   - the pelican at the end finishes the level
   - the original 12-3 still loads with the free camera
   - a touch device gets the side buttons (the 2D game's layout), not the joystick
   Screenshots for Shad: app/w12-side-shots/<project>/ (start, corner swing, tower, wall jump, end, phone). */
const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/`;
/* 2026-10-30 (the World 12 sneak peek): neither is one of the four live levels, so the 3D page opens them with ?devtools=1 only (w12-preview.spec.ts) */
const SIDE_URL = `${BASE}3d/level-12-1.html?level=12-3-side&devtools=1`;
const ORIG_URL = `${BASE}3d/level-12-1.html?level=12-3&devtools=1`;
const SHOTS = fileURLToPath(new URL('../../w12-side-shots/', import.meta.url));

type Counts = { doubleJumps: number; wallKicks: number; ledgeGrabs: number; climbs: number; pullUps: number };
type Info = { mode: string; pos: number[]; state: string; grounded: boolean; counts: Counts; cleared: boolean; camYaw: number };
type SideInfo = { s: number; off: number; length: number; camAlong: number; camToward: number; camYaw: number; override: boolean; cutscene: boolean };
type Game = {
  ready: boolean; mode: string; time: number; side: { at: (s: number) => { x: number; z: number; tx: number; tz: number } } | null;
  start: () => void; info: () => Info; sideInfo: () => SideInfo | null; teleport: (x: number, y: number, z: number, yaw?: number) => void;
  player: { invuln: number } | null;
};
type Win = { GAME?: Game };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

async function boot(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await page.waitForFunction(() => { const g = (window as unknown as Win).GAME; return !!(g && g.ready && g.player); }, null, { timeout: 150_000 });
  await page.evaluate(() => { const g = (window as unknown as Win).GAME!; if (g.mode === 'title') g.start(); g.player!.invuln = 1e9; });
}

const gameTime = (page: Page) => page.evaluate(() => (window as unknown as Win).GAME!.time);
/* wait for game time (not wall time): the software renderer in CI can be slow, the game's clock is what counts */
async function waitGame(page: Page, secs: number): Promise<void> {
  const t = (await gameTime(page)) + secs;
  await page.waitForFunction((tt) => (window as unknown as Win).GAME!.time >= tt, t, { timeout: 90_000 });
}
const info = (page: Page) => page.evaluate(() => (window as unknown as Win).GAME!.info());
const side = (page: Page) => page.evaluate(() => (window as unknown as Win).GAME!.sideInfo()!);

/* put Kinan at distance s along the path, height y, facing forward, and wait for him to land */
async function goTo(page: Page, s: number, y: number): Promise<void> {
  await page.evaluate(([ss, yy]) => {
    const g = (window as unknown as Win).GAME!;
    const a = g.side!.at(ss);
    g.teleport(a.x, yy, a.z, Math.atan2(a.tx, a.tz) * 180 / Math.PI);
  }, [s, y]);
  await page.waitForFunction(() => { const i = (window as unknown as Win).GAME!.info(); return i.grounded && i.state === 'ground'; }, null, { timeout: 60_000 });
  await waitGame(page, 0.15);
}

/* timed key presses on the GAME's clock: [seconds after now, 'down' | 'up', key code]. Each is a real keyboard event on
   window (the game's own key listeners), sent between two frames, so a double jump 0.25 s after a jump really is 0.25 s
   (Playwright round trips are slower than a jump). Resolves when the last one has been sent. */
async function keyScript(page: Page, steps: [number, 'down' | 'up', string][]): Promise<void> {
  await page.evaluate((st) => {
    const g = (window as unknown as Win).GAME! as unknown as { time: number; onUpdate: (fn: () => void) => void; __keysLeft?: number };
    const t0 = g.time, list = st.slice();
    g.__keysLeft = list.length;
    g.onUpdate(() => {
      while (list.length && g.time - t0 >= list[0][0]) {
        const [, kind, code] = list.shift()!;
        setTimeout(() => { window.dispatchEvent(new KeyboardEvent(kind === 'down' ? 'keydown' : 'keyup', { code, key: code === 'Space' ? ' ' : code })); g.__keysLeft = (g.__keysLeft || 1) - 1; }, 0);
      }
    });
  }, steps);
  await page.waitForFunction(() => ((window as unknown as Win).GAME! as unknown as { __keysLeft: number }).__keysLeft === 0, null, { timeout: 90_000 });
}

async function shot(page: Page, name: string): Promise<void> {
  const dir = `${SHOTS}${test.info().project.name}/`;
  mkdirSync(dir, { recursive: true });
  // the test keeps Kinan safe (invulnerable), which makes him blink: show him steadily for the picture
  await page.evaluate(() => { (window as unknown as Win).GAME!.player!.invuln = 0; });
  await waitGame(page, 0.05);
  await page.screenshot({ path: `${dir}${name}.png` });
  await page.evaluate(() => { (window as unknown as Win).GAME!.player!.invuln = 1e9; });
}

/* the camera is beside the path, looking square at it from the camera side */
function expectSquareOn(si: SideInfo, label: string): void {
  expect(Math.abs(si.camAlong), `${label}: camera view along the path (0 = square on) ${JSON.stringify(si)}`).toBeLessThan(0.35);
  expect(si.camToward, `${label}: camera looks at the path from the side ${JSON.stringify(si)}`).toBeLessThan(-0.9);
}

test.describe('World 12 2.5D test level (12-3-side)', () => {
  test('side mode: camera, path, moves and the pelican', async ({ page }) => {
    test.setTimeout(600_000);
    const errors = watchErrors(page);
    await boot(page, SIDE_URL);
    expect(await page.evaluate(() => document.body.classList.contains('side'))).toBe(true);
    expect(await page.evaluate(() => document.getElementById('titlecard')!.querySelector('h1')!.textContent)).toBe('THE RIVER VALLEY (2.5D TEST)');
    await waitGame(page, 0.5);

    await test.step('start: the camera is beside the path', async () => {
      const si = await side(page);
      expect(si.length).toBeGreaterThan(350);
      expect(Math.abs(si.off)).toBeLessThan(0.02);
      expectSquareOn(si, 'start');
      await shot(page, '01-start');
    });

    await test.step('right runs forward along the path, he stays on the line while running and jumping', async () => {
      await goTo(page, 14, 0.2);
      const s0 = (await side(page)).s;
      let maxOff = 0, lastS = s0, back = 0;
      await page.keyboard.down('KeyD');
      // run about 12 along the flat parkway (stop well before the leaf pile and the tower), jumping twice on the way
      let jumps = 0;
      for (let i = 0; i < 60 && lastS < s0 + 12; i++) {
        if ((jumps === 0 && lastS > s0 + 3) || (jumps === 1 && lastS > s0 + 8)) { await page.keyboard.press('Space'); jumps++; }
        await waitGame(page, 0.05);
        const si = await side(page);
        maxOff = Math.max(maxOff, Math.abs(si.off));
        if (si.s < lastS - 0.05) back++;
        lastS = si.s;
        if (!si.cutscene && !si.override) expectSquareOn(si, `running ${i}`);
      }
      await page.keyboard.up('KeyD');
      expect(jumps).toBe(2);
      expect(lastS - s0, 'right moved Kinan forward along the path').toBeGreaterThan(5);
      expect(back, 'he never went backward while holding right').toBe(0);
      expect(maxOff, 'he stayed on the path line').toBeLessThan(0.05);
      // left runs back
      await waitGame(page, 0.4);
      const s1 = (await side(page)).s;
      await keyScript(page, [[0, 'down', 'KeyA'], [0.8, 'up', 'KeyA']]);
      await waitGame(page, 0.2);
      const si = await side(page);
      expect(si.s, 'left moved Kinan back along the path').toBeLessThan(s1 - 2);
      expect(Math.abs(si.off)).toBeLessThan(0.05);
    });

    await test.step('Q/E and mouse drags do not turn the side camera', async () => {
      await goTo(page, 20, 0.2);
      await waitGame(page, 0.6);
      const y0 = (await side(page)).camYaw;
      await page.keyboard.down('KeyQ');
      await waitGame(page, 0.6);
      await page.keyboard.up('KeyQ');
      await page.mouse.move(640, 360); await page.mouse.down(); await page.mouse.move(900, 300, { steps: 6 }); await page.mouse.up();
      await waitGame(page, 0.3);
      const si = await side(page);
      expect(Math.abs(si.camYaw - y0), 'camera yaw unchanged').toBeLessThan(1);
      expectSquareOn(si, 'after Q and drag');
    });

    await test.step('double jump', async () => {
      await goTo(page, 22, 0.2);
      const before = (await info(page)).counts.doubleJumps;
      await keyScript(page, [[0, 'down', 'Space'], [0.2, 'up', 'Space'], [0.25, 'down', 'Space'], [0.32, 'up', 'Space']]);
      await waitGame(page, 0.1);
      expect((await info(page)).counts.doubleJumps, 'jump, then jump again in the air').toBeGreaterThan(before);
      const si = await side(page);
      expect(Math.abs(si.off)).toBeLessThan(0.05);
    });

    await test.step('the first corner: the camera swings smoothly and stays square on', async () => {
      await goTo(page, 110, -3.0);   // on the ramp down, far enough back that the camera has not started turning yet
      await waitGame(page, 0.4);
      const yaw0 = (await side(page)).camYaw;
      const timed = () => page.evaluate(() => { const g = (window as unknown as Win).GAME!; return { ...g.sideInfo()!, t: g.time }; });
      let maxRate = 0, last = await timed(), maxOff = 0, shotTaken = false;
      await page.keyboard.down('KeyD');
      for (let i = 0; i < 60; i++) {
        await waitGame(page, 0.1);
        const si = await timed();
        maxRate = Math.max(maxRate, Math.abs(si.camYaw - last.camYaw) / Math.max(1e-3, si.t - last.t)); last = si;
        maxOff = Math.max(maxOff, Math.abs(si.off));
        expectSquareOn(si, `corner ${i}`);
        if (!shotTaken && si.s > 129) { await shot(page, '02-corner-swing'); shotTaken = true; }
        if (si.s > 142) break;
      }
      await page.keyboard.up('KeyD');
      await waitGame(page, 1.2);
      const end = await side(page);
      expect(end.s, 'ran round the corner').toBeGreaterThan(134);
      expect(Math.abs(end.camYaw - yaw0), 'camera turned with the path (25 degrees)').toBeGreaterThan(18);
      expect(Math.abs(end.camYaw - yaw0)).toBeLessThan(32);
      expect(maxRate, 'no sudden camera jumps (degrees per game second)').toBeLessThan(60);
      expect(maxOff, 'on the path line round the corner').toBeLessThan(0.05);
    });

    await test.step('the lookout tower: push into the ladder, climb up, pull up onto the first deck', async () => {
      await goTo(page, 54, 0.2);
      const before = (await info(page)).counts;
      await page.keyboard.down('KeyD');
      await page.waitForFunction(() => (window as unknown as Win).GAME!.info().state === 'climb', null, { timeout: 30_000 });
      await page.keyboard.up('KeyD');
      await page.keyboard.down('KeyW');
      await page.waitForFunction((n) => { const i = (window as unknown as Win).GAME!.info(); return i.counts.pullUps > n && i.grounded; }, before.pullUps, { timeout: 30_000 });
      await page.keyboard.up('KeyW');
      const i = await info(page);
      expect(i.counts.climbs).toBeGreaterThan(before.climbs);
      expect(i.pos[1], 'standing on the first deck').toBeGreaterThan(3.8);
      expect(Math.abs((await side(page)).off)).toBeLessThan(0.05);
      await goTo(page, 68, 19.3);   // high up the tower for the picture
      await waitGame(page, 1.0);
      await shot(page, '03-tower');
    });

    await test.step('wall jump in the ravine shaft', async () => {
      let kicked = false;
      for (let attempt = 0; attempt < 4 && !kicked; attempt++) {
        await goTo(page, 156.1, -17.8);
        const before = (await info(page)).counts.wallKicks;
        // hold right into the pillar wall, jump up it, then jump again: a kick off the wall
        await keyScript(page, [[0, 'down', 'KeyD'], [0.15, 'down', 'Space'], [0.43, 'up', 'Space'], [0.46, 'down', 'Space'], [0.52, 'up', 'Space'], [0.6, 'up', 'KeyD']]);
        await waitGame(page, 0.1);
        kicked = (await info(page)).counts.wallKicks > before;
      }
      expect(kicked, 'Kinan kicked off the pillar wall').toBe(true);
      expect(Math.abs((await side(page)).off)).toBeLessThan(0.05);
      await shot(page, '04-wall-jump');
    });

    await test.step('ledge grab at the big step, then climb up', async () => {
      let grabbed = false;
      for (let attempt = 0; attempt < 4 && !grabbed; attempt++) {
        await goTo(page, 190.7, -7.8);
        const before = (await info(page)).counts.ledgeGrabs;
        // hold right into the big step and jump (one plain jump): he catches the edge, keeps pushing = climbs up
        await keyScript(page, [[0, 'down', 'KeyD'], [0.15, 'down', 'Space'], [0.7, 'up', 'Space'], [1.6, 'up', 'KeyD']]);
        grabbed = (await info(page)).counts.ledgeGrabs > before;
        if (grabbed) await page.waitForFunction(() => { const i = (window as unknown as Win).GAME!.info(); return i.grounded && i.pos[1] > -3.3; }, null, { timeout: 30_000 });
      }
      expect(grabbed, 'Kinan grabbed the edge of the big step').toBe(true);
      expect((await info(page)).pos[1], 'and climbed on top of it').toBeGreaterThan(-3.3);
    });

    await test.step('the pelican at the end finishes the level', async () => {
      await goTo(page, 379, -26.4);
      await page.keyboard.down('KeyD');
      await page.waitForFunction(() => (window as unknown as Win).GAME!.info().cleared, null, { timeout: 60_000 });
      await page.keyboard.up('KeyD');
      expect((await info(page)).mode).toBe('clear');
      await waitGame(page, 1.6);
      await shot(page, '05-end');
    });

    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('the original 12-3 still has the free camera', async ({ page }) => {
    test.setTimeout(300_000);
    const errors = watchErrors(page);
    await boot(page, ORIG_URL);
    expect(await page.evaluate(() => (window as unknown as Win).GAME!.sideInfo())).toBeNull();
    expect(await page.evaluate(() => document.body.classList.contains('side'))).toBe(false);
    expect(await page.locator('#sidepad').count()).toBe(0);
    await waitGame(page, 0.5);
    const y0 = (await info(page)).camYaw;
    await page.keyboard.down('KeyQ');
    await waitGame(page, 0.6);
    await page.keyboard.up('KeyQ');
    const y1 = (await info(page)).camYaw;
    expect(Math.abs(y1 - y0), 'Q turns the free camera').toBeGreaterThan(20);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('a touch phone gets the side buttons, not the joystick', async ({ browser, browserName }) => {
    test.setTimeout(300_000);
    const ctx = await (browser as Browser).newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: browserName === 'chromium', deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    const errors = watchErrors(page);
    try {
      await page.goto(SIDE_URL);
      await page.waitForFunction(() => { const g = (window as unknown as Win).GAME; return !!(g && g.ready && g.player); }, null, { timeout: 150_000 });
      // a touch screen shows the touch controls at once; if this browser does not report one, the first tap does
      if (!(await page.evaluate(() => document.body.classList.contains('touch')))) await page.touchscreen.tap(420, 120);
      await page.evaluate(() => { const g = (window as unknown as Win).GAME!; if (g.mode === 'title') g.start(); });
      await expect(page.locator('body')).toHaveClass(/\btouch\b/);
      await expect(page.locator('body')).toHaveClass(/\bside\b/);
      for (const k of ['left', 'right', 'up', 'down']) await expect(page.locator(`#sidepad [data-k="${k}"]`)).toBeVisible();
      await expect(page.locator('#btn-jump')).toBeVisible();
      await expect(page.locator('#btn-action')).toBeVisible();
      await expect(page.locator('#stick-hint')).toBeHidden();
      // the pad sits bottom-left, JUMP bottom-right
      const pad = (await page.locator('#sidepad').boundingBox())!, jump = (await page.locator('#btn-jump').boundingBox())!;
      expect(pad.x + pad.width).toBeLessThan(844 / 2);
      expect(pad.y + pad.height).toBeGreaterThan(390 * 0.6);
      expect(jump.x).toBeGreaterThan(844 / 2);
      // pressing ▶ runs Kinan forward along the path
      await page.evaluate(() => { (window as unknown as Win).GAME!.player!.invuln = 1e9; });
      await goTo(page, 20, 0.2);
      const s0 =(await page.evaluate(() => (window as unknown as Win).GAME!.sideInfo()!)).s;
      const r = (await page.locator('#sidepad [data-k="right"]').boundingBox())!;
      await page.locator('#sidepad').dispatchEvent('pointerdown', { pointerId: 7, pointerType: 'touch', clientX: r.x + r.width / 2, clientY: r.y + r.height / 2, isPrimary: true, bubbles: true });
      await waitGame(page, 0.8);
      await page.locator('#sidepad').dispatchEvent('pointerup', { pointerId: 7, pointerType: 'touch', clientX: r.x + r.width / 2, clientY: r.y + r.height / 2, isPrimary: true, bubbles: true });
      const s1 = (await page.evaluate(() => (window as unknown as Win).GAME!.sideInfo()!)).s;
      expect(s1 - s0, 'the touch ▶ button runs Kinan forward').toBeGreaterThan(2);
      await waitGame(page, 0.4);
      await shot(page, '06-phone-touch-buttons');
      expect(errors, errors.join('\n')).toEqual([]);
    } finally {
      await ctx.close();
    }
  });
});

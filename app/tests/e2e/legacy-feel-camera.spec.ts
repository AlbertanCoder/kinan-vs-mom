import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/*
 * TE-1 · FEEL & PHYSICS — live camera measurements (TEST-PLAN K20-K22).
 * Pins the CURRENT follow camera in-engine: the 42% anchor, the level-edge and
 * boss-arena clamps, and the 1:1 no-smoothing follow. Contract §3 replaces this
 * camera later (M3); these pins move to the §3 acceptance in the same commit.
 */

const DEV_URL = 'http://127.0.0.1:4174/index.html?devtools=1';
const CURRENT = 'kinan-remaster-v1';
const W = 432;
const PLAYER_W = 10;

type Probe = {
  x: number; y: number; vx: number; vy: number; onGround: boolean;
  camX: number; arenaX: number; w: number; len: number; boss: string; rows: string[];
};
type Dev = {
  jumpToStage: (i: number) => void;
  godMode: () => void;
  clearFoes: () => void;
  place: (x: number, y: number) => { x: number; y: number; onGround: boolean };
  probe: () => Probe;
  state: () => { stage: number; boss: string };
  warpBoss: () => void;
  auto: (n: number) => unknown;
  step: (n: number, hold?: { left?: boolean; right?: boolean; jump?: boolean; tapJump?: boolean }) => Probe[];
};

const fixture = (name: string): string =>
  readFileSync(fileURLToPath(new URL(`../fixtures/saves/${name}`, import.meta.url)), 'utf8');

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

async function seed(page: Page): Promise<void> {
  await page.addInitScript(({ key, raw }) => {
    const data = JSON.parse(raw);
    data.codes = [2, 3, 4, 5];
    data.mapWorld = 1;
    data.mapSeen = {};
    data.mapSel = {};
    delete data.explorer;
    data.pets = { ids: [], names: {} };
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: CURRENT, raw: fixture('kinan-remaster-v1.sample.json') });
}

async function dismissStory(page: Page): Promise<void> {
  await expect(page.locator('#stage')).toBeVisible();
  for (let i = 0; i < 30 && await page.locator('#dialog').isVisible(); i++) {
    await page.locator('#dialog').click({ force: true });
    await page.waitForTimeout(30);
  }
  await expect(page.locator('#dialog')).toBeHidden();
}

async function boot(page: Page, stage = 0): Promise<void> {
  await seed(page);
  await page.goto(DEV_URL);
  await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object');
  await page.evaluate((i) => (window as unknown as { __k11: Dev }).__k11.jumpToStage(i), stage);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().stage)).toBe(stage);
  await dismissStory(page);
}

type Sample = { t: number; p: Probe };

async function record(page: Page, durationMs: number): Promise<Sample[]> {
  return page.evaluate((dur) => {
    const k = (window as unknown as { __k11: Dev }).__k11;
    const out: Sample[] = [];
    return new Promise<Sample[]>((resolve) => {
      const t0 = performance.now();
      const tick = (): void => {
        out.push({ t: performance.now() - t0, p: k.probe() });
        if (performance.now() - t0 < dur || out.length < 42) requestAnimationFrame(tick);   /* ≥42 frames: throttled rAF still yields a full set */
        else resolve(out);
      };
      requestAnimationFrame(tick);
    });
  }, durationMs);
}

async function settle(page: Page, x: number): Promise<Probe> {
  await page.evaluate((px) => {
    const k = (window as unknown as { __k11: Dev }).__k11;
    k.clearFoes(); k.godMode();
    k.place(px, 30);
  }, x);
  await expect.poll(async () => {
    const p = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.probe());
    return p.onGround && p.vy === 0;
  }, { timeout: 3000 }).toBe(true);
  return page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.probe());
}

/** The engine's own X anchor: camX = round(clamp(px + w/2 − W*0.42, lo, hi)). */
function anchorError(p: Probe): number {
  return Math.abs(p.camX - (p.x + PLAYER_W / 2 - W * 0.42));
}

test.describe('live camera feel (current follow camera, in-engine measurements)', () => {
  test('keeps Kinan at 42% of the screen while running (camera anchor)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await settle(page, 900);
    await page.keyboard.down('ArrowRight');
    const samples = await record(page, 700);
    await page.keyboard.up('ArrowRight');
    const mid = samples.filter((s) => s.p.x > 250 && s.p.x < s.p.w * 16 - 300);
    expect(mid.length).toBeGreaterThan(5);
    for (const s of mid) expect(anchorError(s.p)).toBeLessThanOrEqual(1.2);
    expect(errors).toEqual([]);
  });

  test('follows 1:1 with no smoothing lag (camera smoothing pin)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await settle(page, 900);
    await page.keyboard.down('ArrowRight');
    const samples = await record(page, 700);
    await page.keyboard.up('ArrowRight');
    for (let i = 1; i < samples.length; i++) {
      const dx = samples[i].p.x - samples[i - 1].p.x;
      const dcam = samples[i].p.camX - samples[i - 1].p.camX;
      if (Math.abs(dx) > 0.01) expect(Math.abs(dcam - dx)).toBeLessThanOrEqual(1.5);
    }
    expect(errors).toEqual([]);
  });

  test('never scrolls left of the level start (camera clamp)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await settle(page, 60);
    await page.keyboard.down('ArrowLeft');
    const samples = await record(page, 700);
    await page.keyboard.up('ArrowLeft');
    for (const s of samples) expect(s.p.camX).toBe(0);
    const end = samples[samples.length - 1].p;
    expect(end.x).toBe(0);   /* and the level wall stops him exactly at x = 0 */
    expect(errors).toEqual([]);
  });

  test('never scrolls past the level end (camera clamp)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    /* enter the arena the way the game does (the threshold at x > (arenaX+3)*T
       fires startBoss) and dismiss the intro between evaluates — the proven
       pattern from the boss-arena clamp test above */
    await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.godMode(); k.warpBoss(); k.auto(1);
    });
    await dismissStory(page);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().boss)).toBe('fight');
    /* frame-exact: one atomic walk measures the §3 clamp against the live camera */
    const r = await page.evaluate((W2) => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.clearFoes();
      const p0 = k.probe();
      const lo = p0.arenaX * 16;
      const hi = Math.min(p0.w * 16 - W2, (p0.arenaX + 29) * 16 - W2);
      const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
      k.place(2150, 30);
      const s = k.step(30).concat(k.step(60, { right: true }));
      return {
        hi,
        modelOk: s.every((p) => p.camX === clamp(Math.round(p.x + 5 - W2 * 0.42), lo, hi)),
        maxCam: Math.max(...s.map((p) => p.camX)),
      };
    }, W);
    expect(r.modelOk).toBe(true);                 /* every frame: live camX matches the §3 model exactly */
    expect(r.maxCam).toBeLessThanOrEqual(r.hi);   /* never scrolls past the level end */
    expect(errors).toEqual([]);
  });

  test('stays anchored during fast falls and high jumps (camera vertical pin)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    /* fast fall from the sky */
    await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.clearFoes(); k.godMode(); k.place(900, -120);
    });
    const fall = await record(page, 1200);
    for (const s of fall) expect(anchorError(s.p)).toBeLessThanOrEqual(1.2);
    /* a full jump from the ground */
    await settle(page, 900);
    await page.keyboard.down('Space');
    const jump = await record(page, 1000);
    await page.keyboard.up('Space');
    for (const s of jump) expect(anchorError(s.p)).toBeLessThanOrEqual(1.2);
    expect(errors).toEqual([]);
  });

  test('stays inside the boss arena while the fight runs (camera clamp)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.godMode(); k.warpBoss(); k.auto(1);
    });
    await dismissStory(page);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().boss)).toBe('fight');
    const arenaLo = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.probe().arenaX * 16);
    await page.keyboard.down('ArrowLeft');
    const samples = await record(page, 1500);
    await page.keyboard.up('ArrowLeft');
    const late = samples.slice(-5);
    for (const s of late) expect(s.p.camX).toBe(arenaLo);
    expect(errors).toEqual([]);
  });
});


import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/*
 * TE-1 · FEEL & PHYSICS — CONTRACT ACCEPTANCE (GAME-DESIGN-CONTRACT.md §1.4 / §3).
 * The §1.4 derived targets are measured in-engine through the Builder's own
 * feelProbe hook ("verify by measurement, not vibes"). The slope and camera
 * acceptance rows await M2/M3 terrain and camera work and trip on automatically
 * once their fixtures exist (see docs/TEST-PLAN-FEEL-PHYSICS.md §7-8).
 */

const DEV_URL = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html?devtools=1`;
const CURRENT = 'kinan-remaster-v1';

type FeelProbe = {
  constants: Record<string, number | null>;
  apexPx: number; apexTiles: number;
  riseFrames: number; fallFrames: number;
  tapApexPx: number; tapApexTiles: number; tapRatio: number;
  runJumpPx: number;
};
type Dev = { feelProbe: () => FeelProbe };

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

async function bootProbe(page: Page): Promise<FeelProbe> {
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
  await page.goto(DEV_URL);
  await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object');
  return page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.feelProbe());
}

test.describe('contract §1.4 feel acceptance (in-engine feelProbe)', () => {
  test('every §1.1 constant in the engine matches the locked table', async ({ page }) => {
    const errors = watchErrors(page);
    const probe = await bootProbe(page);
    expect(probe.constants.RUN_MAX).toBe(3.2);
    expect(probe.constants.JUMP_V).toBe(-7.6);
    expect(probe.constants.GRAV_HOLD).toBe(0.42);
    expect(probe.constants.GRAV_FALL).toBe(0.66);
    expect(probe.constants.MAX_FALL).toBe(9.0);
    expect(probe.constants.JUMP_CUT).toBe(-2.6);
    expect(probe.constants.COYOTE).toBe(8);
    expect(probe.constants.JUMP_BUF).toBe(8);
    expect(probe.constants.STOMP_HIGH).toBe(-7.0);
    expect(probe.constants.STOMP_LOW).toBe(-4.6);
    expect(probe.constants.SPRING_V).toBe(-11.0);
    expect(errors).toEqual([]);
  });

  test('a full jump apex is 4.3 tiles ± 0.25 (§1.4)', async ({ page }) => {
    const errors = watchErrors(page);
    const probe = await bootProbe(page);
    expect(probe.apexPx).toBeCloseTo(64.98, 1);
    expect(probe.apexTiles).toBeGreaterThanOrEqual(4.05);
    expect(probe.apexTiles).toBeLessThanOrEqual(4.55);
    expect(errors).toEqual([]);
  });

  test('tap-vs-hold jump height ratio is ≤ 0.5 (§1.4)', async ({ page }) => {
    const errors = watchErrors(page);
    const probe = await bootProbe(page);
    expect(probe.tapRatio).toBeLessThanOrEqual(0.5);
    expect(probe.tapApexTiles).toBeGreaterThanOrEqual(1.5);
    expect(probe.tapApexTiles).toBeLessThanOrEqual(2.0);
    expect(errors).toEqual([]);
  });

  test('rise ~18 frames, fall ~14 — the fall feels faster than the rise (§1.1)', async ({ page }) => {
    const errors = watchErrors(page);
    const probe = await bootProbe(page);
    expect(probe.riseFrames).toBeGreaterThanOrEqual(17);
    expect(probe.riseFrames).toBeLessThanOrEqual(20);
    expect(probe.fallFrames).toBeGreaterThanOrEqual(13);
    expect(probe.fallFrames).toBeLessThanOrEqual(15);
    expect(probe.fallFrames).toBeLessThan(probe.riseFrames);
    expect(errors).toEqual([]);
  });

  test('a full-run jump crosses about 103 px — 6.5 tiles of air (§1.1)', async ({ page }) => {
    const errors = watchErrors(page);
    const probe = await bootProbe(page);
    expect(probe.runJumpPx).toBeGreaterThanOrEqual(95);
    expect(probe.runJumpPx).toBeLessThanOrEqual(115);
    expect(errors).toEqual([]);
  });
});

test.describe('contract §1.4 / §3 acceptance — waiting on M2 terrain and M3 camera', () => {
  test.fixme('slope walking never jitters (position monotonic on a 2:1 slope)', () => {
    /* AWAITS M2: the height-mask slope terrain (contract §2.2 normative).
       The unit model in legacy-feel-terrain.test.ts already pins the semantics. */
  });

  test.fixme('camera Y rises during a 4-tile jump (measured, not eyeballed)', () => {
    /* AWAITS M3: the contract §3 camera. The current camera pins camY = 0. */
  });

  test.fixme('camera never snaps: max per-frame camX delta at RUN_MAX < 1.5 px', () => {
    /* AWAITS M3: contract §3 camera (deadzone + lead + 0.14 lerp). TE-1 finding F3:
       at RUN_MAX 3.2 px/f a continuously-panning camera must exceed 1.5 px/f once
       it leaves the deadzone — the Architect should confirm the probe's intent. */
  });

  test.fixme('no clamp event while the probe crosses a boss threshold', () => {
    /* AWAITS M3: the NEVER-CLAMP-ON-FUN rule (contract §3). */
  });
});


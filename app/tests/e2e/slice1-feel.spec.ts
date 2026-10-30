import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* Builder-owned focused spec for Slice 1 (name sits OUTSIDE the Test Engineers'
   owned globs: legacy-feel-* is TE1's, legacy-* is TE2's). Measures the locked
   movement spec (contract §1.1) through the game's own feelProbe — contract §1.4:
   "verify by measurement, not vibes". Test Engineer 1 hardens these numbers into
   the pinned legacy-feel-* suites. */

const DEV_URL = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html?devtools=1`;

type FeelConstants = {
  WALK_MAX: number; RUN_MAX: number; RUSH_MAX: number;
  ACC_GROUND: number; ACC_AIR: number; ACC_SKID: number;
  FRIC_GROUND: number; FRIC_AIR: number;
  JUMP_V: number; GRAV_HOLD: number; GRAV_FALL: number;
  MAX_FALL: number; JUMP_CUT: number;
  COYOTE: number; JUMP_BUF: number;
  STOMP_HIGH: number; STOMP_LOW: number; SPRING_V: number;
};

type FeelProbe = {
  constants: FeelConstants;
  apexPx: number; apexTiles: number;
  riseFrames: number; fallFrames: number;
  tapApexPx: number; tapApexTiles: number; tapRatio: number;
  runJumpPx: number;
};

function isFeelProbe(v: unknown): v is FeelProbe {
  if (!v || typeof v !== 'object') return false;
  const r = v as Record<string, unknown>;
  const c = r.constants;
  if (!c || typeof c !== 'object') return false;
  const k = c as Record<string, unknown>;
  return typeof r.apexTiles === 'number' && typeof r.tapRatio === 'number'
    && typeof r.runJumpPx === 'number' && typeof r.riseFrames === 'number'
    && typeof r.fallFrames === 'number' && typeof r.tapApexTiles === 'number'
    && typeof k.WALK_MAX === 'number' && typeof k.JUMP_V === 'number'
    && typeof k.JUMP_CUT === 'number' && typeof k.SPRING_V === 'number';
}

async function probe(page: Page): Promise<FeelProbe> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => typeof (window as unknown as { __k11?: unknown }).__k11 === 'object');
  const raw = await page.evaluate(() => {
    const dev = (window as unknown as { __k11: { feelProbe?: () => unknown } }).__k11;
    return dev.feelProbe ? dev.feelProbe() : null;
  });
  if (!isFeelProbe(raw)) throw new Error('feelProbe missing or malformed');
  return raw;
}

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

test.describe('Slice 1 feel — contract §1.1 measured (§1.4)', () => {
  test('FEEL constants match the contract table exactly', async ({ page }) => {
    const errors = watchErrors(page);
    const r = await probe(page);
    const c = r.constants;
    expect(c.WALK_MAX).toBe(1.9);
    expect(c.RUN_MAX).toBe(3.2);
    expect(c.RUSH_MAX).toBe(4.2);
    expect(c.ACC_GROUND).toBe(0.30);
    expect(c.ACC_AIR).toBe(0.20);
    expect(c.ACC_SKID).toBe(0.55);
    expect(c.FRIC_GROUND).toBe(0.80);
    expect(c.FRIC_AIR).toBe(0.96);
    expect(c.JUMP_V).toBe(-7.6);
    expect(c.GRAV_HOLD).toBe(0.42);
    expect(c.GRAV_FALL).toBe(0.66);
    expect(c.MAX_FALL).toBe(9.0);
    expect(c.JUMP_CUT).toBe(-2.6);
    expect(c.COYOTE).toBe(8);
    expect(c.JUMP_BUF).toBe(8);
    expect(c.STOMP_HIGH).toBe(-7.0);
    expect(c.STOMP_LOW).toBe(-4.6);
    expect(c.SPRING_V).toBe(-11.0);
    expect(errors).toEqual([]);
  });

  test('derived feel targets hold — full jump apex 4.3 tiles ± 0.25', async ({ page }) => {
    const r = await probe(page);
    expect(Math.abs(r.apexTiles - 4.3)).toBeLessThanOrEqual(0.25);
  });

  test('tap-vs-hold jump height ratio ≤ 0.5 and tap apex 1.5–2 tiles', async ({ page }) => {
    const r = await probe(page);
    expect(r.tapRatio).toBeLessThanOrEqual(0.5);
    expect(r.tapApexTiles).toBeGreaterThanOrEqual(1.5);
    expect(r.tapApexTiles).toBeLessThanOrEqual(2.0);
  });

  test('rise ≈ 18 frames, fall ≈ 14 frames, full-run jump ≈ 103 px', async ({ page }) => {
    const r = await probe(page);
    expect(r.riseFrames).toBeGreaterThanOrEqual(16);
    expect(r.riseFrames).toBeLessThanOrEqual(20);
    expect(r.fallFrames).toBeGreaterThanOrEqual(12);
    expect(r.fallFrames).toBeLessThanOrEqual(16);
    expect(r.runJumpPx).toBeGreaterThanOrEqual(90);
    expect(r.runJumpPx).toBeLessThanOrEqual(115);
  });
});
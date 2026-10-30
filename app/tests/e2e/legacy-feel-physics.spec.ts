import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/*
 * TE-1 · FEEL & PHYSICS — live movement measurements (TEST-PLAN D-series, §1.4).
 * Bootstraps the REAL game (repository-root index.html) on the dev gate, stages
 * precise moments with the window.__k11 probes and measures the feel in-engine:
 * top speed, acceleration, friction, jump arc, terminal fall, coyote, buffer,
 * stomp bounce. Test names read like sentences of the feel spec.
 */

const DEV_URL = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html?devtools=1`;
const CURRENT = 'kinan-remaster-v1';

type Probe = {
  x: number; y: number; vx: number; vy: number; onGround: boolean;
  camX: number; arenaX: number; w: number; len: number; boss: string; rows: string[];
};
type Dev = {
  jumpToStage: (i: number) => void;
  advance: () => void;
  godMode: () => void;
  clearFoes: () => void;
  place: (x: number, y: number) => { x: number; y: number; onGround: boolean };
  probe: () => Probe;
  state: () => { stage: number; hp: number; foes: number };
  dropOnFoe: (n?: number) => { x: number; y: number; foe: string; fy: number; hp: number } | null;
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
    /* KNOWN TRAPS: the fixture leaks map fields; pets grant a double jump — the base feel is measured petless.
       (Worlds 2-5 used to need reward codes here; since 2026-10-28 every world opens by playing.) */
    data.mapWorld = 1;
    data.mapSeen = {};
    data.mapSel = {};
    delete data.explorer;
    data.pets = { ids: [], names: {} };
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: CURRENT, raw: fixture('kinan-remaster-v1.sample.json') });
}

async function dismissStory(page: Page): Promise<void> {
  /* #dialog lives INSIDE #stage — only touch it once the stage is up */
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

/** In-page rAF recorder: exact probe values with wall-clock stamps. */
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

/** Put Kinan in the air at x and let him settle on the floor below. */
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

test.describe('live movement feel (legacy tuning, in-engine measurements)', () => {
  test('runs at exactly 3.0 px per frame (top speed)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await settle(page, 800);
    await page.keyboard.down('ArrowRight');
    const samples = await record(page, 700);
    await page.keyboard.up('ArrowRight');
    expect(Math.max(...samples.map((s) => s.p.vx))).toBe(3);
    expect(errors).toEqual([]);
  });

  test('reaches top speed in about six frames (acceleration)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    /* frame-exact: step() owns the physics timeline — rAF cadence can't skew it */
    const toTop = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.clearFoes(); k.godMode();
      k.place(800, 30);
      k.step(200);                        /* settle on the floor below */
      const s = k.step(20, { right: true });
      return s.findIndex((p) => p.vx >= 2.95);   /* frames held before top speed */
    });
    expect(toTop, 'vx must reach 2.95').toBeGreaterThanOrEqual(0);
    expect(toTop).toBeLessThanOrEqual(8);   /* ACC_GROUND 0.55: ~6 frames to RUN_MAX */
    expect(errors).toEqual([]);
  });

  test('stops from a full run in about fourteen frames (friction)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.clearFoes(); k.godMode();
      k.place(800, 30);
      k.step(200);
      k.step(60, { right: true });        /* full run */
      const running = k.probe();
      const s = k.step(40, { right: false, left: false });   /* keys released */
      const stopIdx = s.findIndex((p) => p.vx === 0);
      return { stopIdx, drift: stopIdx >= 0 ? Math.abs(s[stopIdx].x - running.x) : 1e9 };
    });
    expect(r.stopIdx, 'vx must return to exactly 0').toBeGreaterThanOrEqual(0);
    expect(r.stopIdx).toBeLessThanOrEqual(27);   /* ~14 frames of skid (was <450 ms) */
    expect(r.drift).toBeLessThan(25);
    expect(errors).toEqual([]);
  });

  test('a held jump rises about 84 px and lands about 38 frames later (jump arc)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.clearFoes(); k.godMode();
      k.place(800, 30);
      k.step(200);
      const groundY = k.probe().y;
      const s = k.step(80, { tapJump: true, jump: true });   /* held the whole arc */
      const air = s.filter((p) => !p.onGround);
      return {
        rise: groundY - Math.min(...s.map((p) => p.y)),
        airFrames: air.length,
        landed: s[s.length - 1].onGround,
      };
    });
    expect(r.rise).toBeGreaterThan(78);
    expect(r.rise).toBeLessThan(92);
    expect(r.landed).toBe(true);
    expect(r.airFrames).toBeGreaterThan(30);
    expect(r.airFrames).toBeLessThan(52);   /* ≈38 frames of airtime at 60 Hz (was 520–850 ms) */
    expect(errors).toEqual([]);
  });

  test('letting go of jump early is a shorter hop (variable jump)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const g1 = await settle(page, 800);
    await page.keyboard.down('Space');
    await page.keyboard.up('Space');
    const tap = await record(page, 900);
    const g2 = await settle(page, 800);
    await page.keyboard.down('Space');
    const hold = await record(page, 900);
    await page.keyboard.up('Space');
    const tapApex = g1.y - Math.min(...tap.map((s) => s.p.y));
    const holdApex = g2.y - Math.min(...hold.map((s) => s.p.y));
    expect(holdApex - tapApex).toBeGreaterThan(8);
    expect(tapApex).toBeLessThan(holdApex);
    expect(errors).toEqual([]);
  });

  test('falls at exactly 8.6 px per frame (terminal fall)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.clearFoes(); k.godMode(); k.place(800, -120);
    });
    const samples = await record(page, 1500);
    expect(Math.max(...samples.map((s) => s.p.vy))).toBe(8.6);
    expect(errors).toEqual([]);
  });

  test('a jump pressed right after leaving the ground still fires (coyote)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    /* frame-exact: one atomic step() scenario */
    const minVy = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.clearFoes(); k.godMode();
      k.place(800, 40);           /* place() primes the coyote timer exactly like a ledge */
      k.step(1);                  /* one frame off the (faked) ground */
      const s = k.step(3, { tapJump: true });   /* the press */
      return Math.min(...s.map((p) => p.vy));
    });
    expect(minVy).toBeLessThan(-4);   /* the jump fired */
    expect(errors).toEqual([]);
  });

  test('a jump pressed too late after leaving the ground does not fire (coyote)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const minVy = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.clearFoes(); k.godMode();
      k.place(800, -200);         /* long fall: the coyote window dies mid-air */
      k.step(10);                 /* the window is gone */
      const s = k.step(3, { tapJump: true });
      return Math.min(...s.map((p) => p.vy));
    });
    expect(minVy).toBeGreaterThan(-3);   /* no hidden hop */
    expect(errors).toEqual([]);
  });

  test('a jump pressed just before landing fires on touchdown (buffer)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.clearFoes(); k.godMode();
      k.place(800, 30);
      k.step(200);
      const groundY = k.probe().y;
      /* measure the fall once, then replay it with the keydown exactly 3 frames
         before touchdown — the buffered jump must fire on the landing frame */
      k.place(800, groundY - 110);
      const fall = k.step(60);
      const landIdx = fall.findIndex((p) => p.onGround);
      k.place(800, groundY - 110);
      k.step(Math.max(1, landIdx - 3));
      k.step(1, { tapJump: true });      /* the buffered keydown */
      const post = k.step(30);
      return { landIdx, minVy: Math.min(...post.map((p) => p.vy)) };
    });
    expect(r.landIdx).toBeGreaterThan(5);
    expect(r.minVy).toBeLessThan(-4);   /* buffered hop fired on touchdown */
    expect(errors).toEqual([]);
  });

  test('stomping bounces -6.0, or -7.8 with jump held (stomp bounce)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    /* frame-exact: one atomic scenario, sampled per physics update */
    const r = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.godMode();
      const hpBefore = k.state().hp;
      /* tapped stomp */
      k.dropOnFoe(0);
      const tap = k.step(30);
      /* held stomp — jump is held at contact time (pure state, no key edge) */
      k.dropOnFoe(0);
      const held = k.step(30, { jump: true });
      return {
        tapBounce: Math.min(...tap.map((p) => p.vy)),
        heldBounce: Math.min(...held.map((p) => p.vy)),
        hpBefore, hpAfter: k.state().hp,
      };
    });
    expect(r.tapBounce).toBeLessThanOrEqual(-5.2);
    expect(r.tapBounce).toBeGreaterThanOrEqual(-6.2);
    expect(r.heldBounce).toBeLessThanOrEqual(-7.1);
    expect(r.heldBounce).toBeGreaterThanOrEqual(-8.0);
    expect(r.hpAfter).toBe(r.hpBefore);   /* a stomp is justice: Kinan never takes the hit */
    expect(errors).toEqual([]);
  });
});



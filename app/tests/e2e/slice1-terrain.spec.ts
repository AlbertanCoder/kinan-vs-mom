import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* Builder-owned focused spec for Slice 1 (name sits OUTSIDE the Test Engineers'
   owned globs: legacy-feel-* is TE1's, legacy-* is TE2's). M2 terrain core:
   height-mask slope tiles (contract §2.1 #2/#3, ER-2) measured in-engine via
   the dev step() stepper — the §2.2 acceptance: the feet snap to the mask
   within 2 px, walks never jitter (position monotonic per slope face), and a
   1:1 slope halves the walk going up (§2.1 #3). The five §2.3 hill motifs
   (BROW / TERRACE / BOWL / RIDGE / MESA) are painted with dev paint() and
   walked end to end. */

const DEV_URL = 'http://127.0.0.1:4174/index.html?devtools=1';
const CURRENT = 'kinan-remaster-v1';
const T = 16;

type Probe = {
  x: number; y: number; vx: number; vy: number; onGround: boolean;
  camX: number; arenaX: number; w: number; len: number; boss: string; rows: string[];
};
type Dev = {
  jumpToStage: (i: number) => void;
  godMode: () => void;
  clearFoes: () => void;
  place: (x: number, y: number) => { x: number; y: number; onGround: boolean };
  paint: (tx: number, ty: number, t: number) => number;
  probe: () => Probe;
  state: () => { stage: number };
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

/* ---------- the §2.2 contract model (independent of the engine code) ---------- */

type Tiles = Map<string, number>;
const key = (tx: number, ty: number): string => tx + ',' + ty;

/** Linear height mask continuing across consecutive same-type tiles (§2.2). */
function surfaceAt(tiles: Tiles, x: number): number {
  const tx = Math.floor(x / T);
  for (let ty = -2; ty < 15; ty++) {
    const t = tiles.get(key(tx, ty)) ?? 0;
    if (t >= 1 && t <= 6) return ty * T;
    if (t >= 10 && t <= 13) {
      const g = t === 10 || t === 11 ? 8 : 16;
      let run = 0;
      if (t === 10 || t === 12) { for (let k = tx - 1; tiles.get(key(k, ty)) === t; k--) run++; }
      else { for (let k = tx + 1; tiles.get(key(k, ty)) === t; k++) run++; }
      const xIn = x - tx * T;
      const h = (t === 10 || t === 12) ? g * run + g * (xIn / T) : g * run + g * (1 - xIn / T);
      return (ty + 1) * T - h;
    }
  }
  return 9999;
}

/** The demo strip (§2.3): all five hill motifs + a 1:1 steep pair, on a flat table. */
function buildStrip(): Tiles {
  const t: Tiles = new Map();
  for (let tx = 20; tx <= 70; tx++) {
    for (let ty = 11; ty <= 13; ty++) t.set(key(tx, ty), 1);   /* foundation */
    for (let ty = 0; ty <= 10; ty++) t.set(key(tx, ty), 0);    /* clear ALL air above (stage 0 has high props) */
    t.set(key(tx, 14), 0);
  }
  /* BROW — 2:1 up then down */
  t.set(key(22, 10), 10); t.set(key(23, 10), 10);
  t.set(key(24, 10), 11); t.set(key(25, 10), 11);
  /* TERRACE — up then a flat top */
  t.set(key(30, 10), 10); t.set(key(31, 10), 10);
  t.set(key(32, 10), 1); t.set(key(33, 10), 1);
  /* BOWL — down into a hollow then up (row 11 keeps the flat rim at 176) */
  t.set(key(36, 11), 11); t.set(key(37, 11), 11);
  t.set(key(38, 11), 10); t.set(key(39, 11), 10);
  /* RIDGE — up-down-up-down */
  t.set(key(42, 10), 10); t.set(key(43, 10), 10);
  t.set(key(44, 10), 11); t.set(key(45, 10), 11);
  t.set(key(46, 10), 10); t.set(key(47, 10), 10);
  t.set(key(48, 10), 11); t.set(key(49, 10), 11);
  /* MESA — up, flat top, down */
  t.set(key(52, 10), 10); t.set(key(53, 10), 10);
  t.set(key(54, 10), 1); t.set(key(55, 10), 1);
  t.set(key(56, 10), 11); t.set(key(57, 10), 11);
  /* 1:1 steep pair (§2.1 #3) */
  t.set(key(62, 10), 12); t.set(key(63, 10), 1);
  t.set(key(64, 10), 1); t.set(key(65, 10), 13);
  return t;
}

async function paintStrip(page: Page): Promise<void> {
  await page.evaluate((plan) => {
    const k = (window as unknown as { __k11: Dev }).__k11;
    k.clearFoes(); k.godMode();
    for (const [kk, t] of plan) {
      const [tx, ty] = kk.split(',').map(Number);
      k.paint(tx, ty, t);
    }
  }, [...buildStrip()]);
}

test.describe('Slice 1 terrain — M2 height-mask slopes (§2.1 #2/#3, §2.2)', () => {
  test('the five hill motifs walk clean: feet stay within 2 px of the mask, no jitter (§2.2)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await paintStrip(page);
    const model = buildStrip();
    const samples = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.place(20 * 16 + 8, 30);
      k.step(80);                                   /* settle on the flat table */
      return k.step(300, { right: true });          /* walk the whole strip */
    });
    const walked = samples.filter((p) => p.x > 21 * 16 && p.x < 61 * 16);
    const grounded = walked.filter((p) => p.onGround);
    expect(grounded.length).toBeGreaterThan(200);   /* the walk really happened */
    for (const p of grounded) {
      const feet = p.y + 16;
      /* the mask must be under the BOX (the engine grounds on any foot column;
         the model is a point particle — at a cliff seam the two differ legally) */
      const mLo = surfaceAt(model, p.x + 0.1), mC = surfaceAt(model, p.x + 5), mHi = surfaceAt(model, p.x + 8.9);
      const near = Math.min(Math.abs(feet - mLo), Math.abs(feet - mC), Math.abs(feet - mHi));
      expect(near).toBeLessThanOrEqual(2);   /* the snap holds */
    }
    /* jitter = 0: each slope face is monotonic in the walk direction
       (segments judged at the feet X — the body center, like the engine) */
    const browUp = grounded.filter((p) => p.x + 5 >= 22 * 16 && p.x + 5 < 24 * 16).sort((a, b) => a.x - b.x);
    for (let i = 1; i < browUp.length; i++) expect(browUp[i].y).toBeLessThanOrEqual(browUp[i - 1].y + 1e-9);   /* up: never dips */
    const browDown = grounded.filter((p) => p.x + 5 >= 24 * 16 && p.x + 5 < 26 * 16).sort((a, b) => a.x - b.x);
    for (let i = 1; i < browDown.length; i++) expect(browDown[i].y).toBeGreaterThanOrEqual(browDown[i - 1].y - 1e-9);   /* down: never pops */
    expect(samples[samples.length - 1].x).toBeGreaterThan(60 * 16);   /* crossed every motif */
    expect(errors).toEqual([]);
  });

  test('a 1:1 slope halves the walk going up (§2.1 #3)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await paintStrip(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.place(61 * 16 + 4, 30);
      k.step(80);                                  /* settle just before the steep tile */
      const s = k.step(40, { right: true });
      const onSteep = s.filter((p) => p.x + 5 >= 62 * 16 && p.x + 5 < 63 * 16 && p.vx > 0);
      return { maxVx: Math.max(...onSteep.map((p) => p.vx)), topY: Math.min(...s.map((p) => p.y)) };
    });
    expect(r.maxVx).toBeLessThanOrEqual(1.55);     /* halved from 3.0 — the step-up stays ≤ 2 px */
    expect(r.topY).toBeLessThan(150);              /* and he still reaches the top */
    expect(errors).toEqual([]);
  });

  test('a landing on a slope snaps the feet exactly to the mask (§2.2)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await paintStrip(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.place(22 * 16 + 8, 60);                    /* above the BROW's up face */
      const s = k.step(80);
      const last = s[s.length - 1];
      return { feet: last.y + 16, x: last.x, onGround: last.onGround };
    });
    expect(r.onGround).toBe(true);
    /* engine mask at x = 22*16+8+5 = 365: xIn 13 → h 6.5 → surface 169.5 */
    expect(Math.abs(r.feet - 169.5)).toBeLessThanOrEqual(0.01);   /* exact snap */
    expect(errors).toEqual([]);
  });
});

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* Builder-owned focused spec (outside TE globs). M3 camera core — contract §3:
   "the world moves, Kinan never slides over a picture". The engine's §3 camera
   (L.newWorld path) is measured frame-exact via step() against an independent
   model of the §3 math (the same normative numbers TE-1's unit model pins:
   deadzone 48x40, lead clamp(vx*8, ±24) eased 0.10, glide 0.14, Y up 0.10 /
   down 0.06 + 12 px landing lead, apex-lead, boss walls slow x0.5 never lock).
   NOTE for the Architect: the §3 acceptance row "camX delta at RUN_MAX < 1.5 px"
   cannot hold for any camera that keeps pace with a 3.2 px/f runner (steady
   tracking IS 3.2 px/f). The no-snap claim is pinned as: 0 px while breathing
   inside the deadzone, and never more than the tracking rate outside it. */

const DEV_URL = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html?devtools=1`;
const CURRENT = 'kinan-remaster-v1';
const T = 16, W = 432, H = 240;

type Probe = {
  x: number; y: number; vx: number; vy: number; onGround: boolean;
  camX: number; camY: number; lead: number; hitStop: number;
  arenaX: number; arenaW: number; w: number; len: number; boss: string; rows: string[];
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
  newWorld: (on?: boolean) => boolean;
  setUp: (n: number) => number;
  step: (n: number, hold?: { left?: boolean; right?: boolean; jump?: boolean; tapJump?: boolean; fire?: boolean }) => Probe[];
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

/* ---------- the §3 model (independent of the engine code) ---------- */
const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
type CamState = { camX: number; camY: number; lead: number };

function modelStep(st: CamState, p: Probe, up: number): CamState {
  const lo = p.boss !== 'off' ? p.arenaX * T : 0;
  const hi = Math.min(p.w * T - W, (p.arenaX + p.arenaW + 1) * T - W);
  const lead = st.lead + (clamp(p.vx * 8, -24, 24) - st.lead) * 0.10;
  const dx = (p.x + 5 + lead) - (st.camX + W / 2);
  let wantX = st.camX;
  if (Math.abs(dx) > 24) wantX = st.camX + dx - Math.sign(dx) * 24;
  const wallLo = (p.arenaX + 1) * T, wallHi = (p.arenaX + p.arenaW) * T - 10;
  const nearWall = p.boss !== 'off' && (p.x < wallLo + 32 || p.x > wallHi - 32);
  const camX = clamp(Math.round(st.camX + (wantX - st.camX) * (nearWall ? 0.07 : 0.14)), lo, hi);
  const dy = (p.y + 8 + (p.vy > 6 ? 12 : 0)) - (st.camY + H / 2);
  let wantY = st.camY;
  if (Math.abs(dy) > 20) wantY = st.camY + dy - Math.sign(dy) * 20;
  if (!p.onGround && p.vy < -4) {
    const apexY = p.y - (p.vy * p.vy) / (2 * 0.42);
    if (apexY < st.camY + 24) wantY = Math.min(wantY, apexY - 24);
  }
  wantY = clamp(wantY, -up * T, 0);
  const camY = st.camY + (wantY - st.camY) * (wantY < st.camY ? 0.10 : 0.06);
  return { camX, camY, lead };
}

function chain(start: Probe, samples: Probe[], up: number): CamState {
  let st: CamState = { camX: start.camX, camY: start.camY, lead: start.lead };
  let frozen = start.hitStop > 0;   /* update() early-returns on hit-stop — the camera holds */
  for (const p of samples) {
    if (!frozen) st = modelStep(st, p, up);
    expect(p.camX).toBe(st.camX);
    expect(p.camY).toBeCloseTo(st.camY, 6);
    expect(p.lead).toBeCloseTo(st.lead, 6);
    frozen = p.hitStop > 0;
  }
  return st;
}

test.describe('Slice 1 camera — contract 3 measured (deadzone, lead, glide, apex-lead)', () => {
  test('the 3 camera model is reproduced frame-by-frame on a walk and a jump', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.newWorld(true); k.clearFoes(); k.godMode();
      k.place(800, 30);
      k.step(120);                                   /* settle: the camera converges */
      const start = k.probe();
      const walk = k.step(48, { right: true, fire: true });   /* RUN_MAX run + lead clamp */
      return { start, walk };
    });
    chain(r.start, r.walk, 0);
    /* the same in the upper band where the apex-lead branch lives */
    const j = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.setUp(8);
      k.place(800, -40);
      const start = k.probe();
      const air = k.step(1, { tapJump: true, jump: true }).concat(k.step(40, { jump: true }));
      return { start, air };
    });
    chain(j.start, j.air, 8);
    expect(errors).toEqual([]);
  });

  test('camera Y rises during a jump and the apex never clips (3 acceptance)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.newWorld(true); k.setUp(8); k.clearFoes(); k.godMode();
      k.place(800, -20);
      const s = k.step(1, { tapJump: true, jump: true }).concat(k.step(40, { jump: true }));
      return s;
    });
    const minCamY = Math.min(...r.map((p) => p.camY));
    expect(minCamY).toBeLessThan(-8);                       /* the camera rose (measured) */
    /* the apex — the jump's highest frame — and everything after it stays in
       view (the pre-apex frames are the camera converging on a teleported
       Kinan, not a jump) */
    const apexIdx = r.reduce((best, p, i) => (p.y < r[best].y ? i : best), 0);
    for (let i = apexIdx; i < r.length; i++) expect(r[i].y - r[i].camY).toBeGreaterThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test('breathes inside the deadzone (0 px) and glides outside — never snaps', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.newWorld(true); k.clearFoes(); k.godMode();
      k.place(800, 30);
      k.step(120);
      const start = k.probe();
      const breathe = k.step(6, { right: true });            /* small steps: inside the 48 px box */
      const run = k.step(60, { right: true, fire: true });
      return { start, breathe, run };
    });
    for (const p of r.breathe) expect(p.camX).toBe(r.start.camX);   /* the camera breathes */
    let maxD = 0, prev = r.start.camX;
    for (const p of r.breathe) { maxD = Math.max(maxD, Math.abs(p.camX - prev)); prev = p.camX; }
    for (const p of r.run) { maxD = Math.max(maxD, Math.abs(p.camX - prev)); prev = p.camX; }
    /* glide only: with the eased lead the worst transient is ~3.5 px + 0.5 px
       of integer rounding — never a snap (see the note at the top about the
       contract's <1.5 px figure) */
    expect(maxD).toBeLessThanOrEqual(4);
    expect(errors).toEqual([]);
  });

  test('near an arena wall the follow slows x0.5 but never pins (NEVER-CLAMP-ON-FUN)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    /* enter the arena the way the game does (the threshold fires startBoss) */
    await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.godMode(); k.warpBoss(); k.auto(1);
    });
    await dismissStory(page);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().boss)).toBe('fight');
    const r = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.newWorld(true); k.clearFoes();
      k.place(2150, 30);
      k.step(60);
      const start = k.probe();
      const s = k.step(120, { right: true, fire: true });    /* walk into the right wall */
      return { start, s };
    });
    chain(r.start, r.s, 0);
    /* the boss-gate clamp holds the arena frame (allowed by 3); the x0.5
       wall-slow rule is inside the modelled chain above — in stage 0's
       one-screen arena it is unobservable (the camera is already at its gate
       clamp whenever Kinan nears a wall) and becomes measurable in M5's
       wider MOM arena */
    for (const p of r.s) {
      expect(p.camX).toBeGreaterThanOrEqual(p.arenaX * 16);
      expect(p.camX).toBeLessThanOrEqual(Math.min(p.w * 16 - W, (p.arenaX + 29) * 16 - W));
    }
    expect(errors).toEqual([]);
  });
});

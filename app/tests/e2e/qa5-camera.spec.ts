import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* QA 2026-10-28 (MINOR): on big bounces (springs, stomps) Kinan went up to 49 px off the top of the
   picture in 1-1, 3-5, 3-6, 3-7, 3-8, 4-4, 4-6, 4-8 and 5-7 — the authored levels' camera could never
   rise above row 0. The camera now follows him up there (only while he, or the apex of his rise,
   comes within 24 px of the top edge) and settles back down after. The jump numbers (§1.1) are
   untouched. Each level is played the way QA measured it — auto(…, { run: true }), foes on — with
   Math.random seeded so every browser plays the same run; Kinan's top must stay inside the picture. */
const BASE = 'http://127.0.0.1:4174/index.html';
const DEV_URL = `${BASE}?devtools=1`;
const LEVELS = ['1-1', '3-5', '3-6', '3-7', '3-8', '4-4', '4-6', '4-8', '5-7'];

type Probe = { x: number; y: number; vy: number; onGround: boolean; camY: number };
type Dev = {
  playLevel: (id: string) => unknown; godMode: () => void; freeze: (on: boolean) => void; auto: (n: number, o?: { run?: boolean }) => unknown;
  step: (n: number, o?: Record<string, boolean>) => Probe[]; probe: () => Probe; levelInfo: () => { cleared: boolean };
};
type Win = Window & { __k11: Dev; KinanLevels: { ready: boolean } };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

test.describe('QA fix: the camera follows Kinan up on big bounces', () => {
  test('Kinan stays inside the picture on the big bounces of 1-1, 3-5, 3-6, 3-7, 3-8, 4-4, 4-6, 4-8 and 5-7, and the camera settles back after', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    await page.goto(DEV_URL);
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    const out = [];
    for (const id of LEVELS) {
      out.push(await page.evaluate((id) => {
        let seed = 20261028;
        const rnd0 = Math.random;
        Math.random = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
        const k = (window as unknown as Win).__k11;
        k.playLevel(id); k.godMode(); k.freeze(false);
        let yMin = 1e9, syMin = 1e9, camMin = 0, f = 0;
        for (; f < 2400 && !k.levelInfo().cleared; f++) {
          k.auto(1, { run: true });
          const p = k.probe();
          yMin = Math.min(yMin, p.y); syMin = Math.min(syMin, p.y - p.camY); camMin = Math.min(camMin, p.camY);
        }
        const cleared = k.levelInfo().cleared;
        let settled: number | null = null;
        if (cleared) { const last = k.step(100, {}).pop()!; settled = last.camY; }   /* the victory lap on the floor: the camera comes back down */
        k.freeze(true);
        Math.random = rnd0;
        return { id, cleared, yMin: Math.round(yMin), syMin: Math.round(syMin), camMin: Math.round(camMin), settled };
      }, id));
    }
    console.log('QA camera: ' + out.map((r) => `${r.id} top ${r.yMin} px, on screen >= ${r.syMin} px, camera up to ${r.camMin}`).join(' · '));
    for (const r of out) {
      expect(r.yMin, `${r.id}: a big bounce took Kinan to the top of the level`).toBeLessThan(4);
      expect(r.syMin, `${r.id}: Kinan's top stays inside the picture`).toBeGreaterThanOrEqual(8);
      if (r.settled !== null) expect(r.settled, `${r.id}: back on the floor, the camera comes home`).toBeGreaterThan(-4);
    }
    expect(errors).toEqual([]);
  });

  test('normal play keeps the old framing: standing on the floor or a high ledge, the camera stays at row 0', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(DEV_URL);
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-1'); k.godMode();
      const walk = k.step(120, { right: true });                         /* the bedroom floor */
      const hop = k.step(1, { tapJump: true, jump: true }).concat(k.step(50, { jump: true }), k.step(40, {}));   /* a full jump */
      return { walk: Math.min(...walk.map((p) => p.camY)), hop: Math.min(...hop.map((p) => p.camY)) };
    });
    expect(r.walk).toBe(0);
    expect(r.hop).toBe(0);
    expect(errors).toEqual([]);
  });
});

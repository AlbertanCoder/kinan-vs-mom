import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* SEASON 2 STEP 1 (2026-11-10, docs/SEASON-2-PLAN.md): tall levels. A level file's `up: N` adds N rows above row 0 and the
   camera follows Kinan up and down. The test level levels/lab/playground.js (?lab=playground, three screens tall) must be
   climbable (every tower shelf and every spring reaches the next), a three-screen fall must keep Kinan in the picture and
   cost nothing, and a test level saves nothing. */
const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
type Where = { x: number; y: number; w: number; h: number; onGround: boolean; hp: number; camY: number; up: number; levelId: string | null };
type Hold = { left?: boolean; right?: boolean; jump?: boolean; tapJump?: boolean };
type K = { where: () => Where; place: (x: number, y: number) => unknown; step: (n: number, hold?: Hold) => unknown; state: () => { running: boolean } };
type Win = Window & { __k11: K };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function openLab(page: Page): Promise<void> {
  await page.goto(`${BASE}?devtools=1&lab=playground`);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).__k11.state().running);
}

test('?lab=playground plays the three-screen-tall test level; every shelf of the tower is one hop from the last', async ({ page }) => {
  const errors = watchErrors(page);
  await openLab(page);
  const me = await page.evaluate(() => (window as unknown as Win).__k11.where());
  expect(me.levelId).toBe('lab-playground');
  expect(me.up).toBe(30);
  /* [row, first col] of each 4-wide shelf, from the ground up, then the last step beside the roof and the roof */
  const steps = [[12, 1], [9, 5], [6, 10], [3, 5], [0, 10], [-3, 5], [-6, 10], [-9, 5], [-12, 10], [-15, 5], [-18, 10], [-21, 15]];
  for (let i = 0; i < steps.length - 1; i++) {
    const landed = await page.evaluate(([from, to]) => {
      const Kk = (window as unknown as Win).__k11, T = 16, [r0, c0] = from, [r1, c1] = to, h = Kk.where().h, w = Kk.where().w;
      Kk.place(c1 > c0 ? (c0 + 4) * T - w - 2 : c0 * T + 2, r0 * T - h);
      Kk.step(3, { left: false, right: false, jump: false });
      const dir: Hold = c1 > c0 ? { right: true, left: false } : { left: true, right: false };
      for (let f = 0; f < 120; f++) {
        Kk.step(1, Object.assign({ jump: true }, f > 2 ? dir : {}, f === 0 ? { tapJump: true } : {}));
        const p = Kk.where(), cx = p.x + p.w / 2;
        if (f > 5 && p.onGround) { Kk.step(2, { left: false, right: false, jump: false }); return Math.round((p.y + p.h) / T) === r1 && cx >= c1 * T - 6 && cx <= (c1 + 4) * T + 6; }
      }
      return false;
    }, [steps[i], steps[i + 1]]);
    expect(landed, `hop ${JSON.stringify(steps[i])} -> ${JSON.stringify(steps[i + 1])}`).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('a three-screen drop off the roof keeps Kinan in the picture and costs no heart; the springs reach the sky ledge', async ({ page }) => {
  const errors = watchErrors(page);
  await openLab(page);
  const drop = await page.evaluate(() => {
    const Kk = (window as unknown as Win).__k11, h = Kk.where().h;
    Kk.place(61 * 16, -20 * 16 - h); Kk.step(90, {});   /* the camera settles on the roof first */
    const hp0 = Kk.where().hp;
    let margin = 1e9;
    for (let k = 0; k < 400; k++) {
      Kk.step(1, { right: k < 40 });
      const p = Kk.where();
      margin = Math.min(margin, p.y - p.camY, p.camY + 240 - (p.y + p.h));
      if (p.onGround && k > 40) break;
    }
    const p = Kk.where();
    return { margin, hp0, hp: p.hp, row: Math.round((p.y + p.h) / 16) };
  });
  expect(drop.row).toBe(12);   /* landed on the ground, 32 rows below the roof */
  expect(drop.hp).toBe(drop.hp0);
  expect(drop.margin).toBeGreaterThanOrEqual(8);   /* never off the top or bottom of the picture */
  const springs = await page.evaluate(() => {
    const Kk = (window as unknown as Win).__k11, out: boolean[] = [];
    for (const [sx, sr, tc, tr] of [[76, 12, 80, 5], [82, 5, 86, -2], [88, -2, 91, -9]]) {
      const h = Kk.where().h;
      Kk.place((sx - 2) * 16, sr * 16 - h); Kk.step(10, { right: false, jump: false });
      let ok = false;
      for (let f = 0; f < 240 && !ok; f++) {
        Kk.step(1, { right: true, jump: true });
        const p = Kk.where();
        ok = p.onGround && Math.round(p.y + p.h) === tr * 16 && p.x + p.w / 2 >= tc * 16;
      }
      Kk.step(2, { right: false, jump: false });
      out.push(ok);
    }
    return out;
  });
  expect(springs).toEqual([true, true, true]);
  expect(errors).toEqual([]);
});

test('the playground opens on the live build too (no developer mode) and a test level saves nothing', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto(`${BASE}?lab=playground`);
  await expect(page.locator('#stageLbl')).toContainText('TEST LEVEL', { timeout: 30_000 });
  const saved = await page.evaluate(() => localStorage.getItem('kinan-remaster-v1') || '');
  expect(saved).not.toContain('lab-');
  expect(errors).toEqual([]);
});

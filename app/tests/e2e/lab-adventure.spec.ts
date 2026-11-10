import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* The ?lab=adventure test level, MOUNTAINS TO THE SEA (2026-11-10, docs/SEASON-2-PLAN.md "The adventure test level"):
   it loads, its climbs work, Mr. Mole and King Crab can be calmed with stomps (and the walls close for the fight), the goal
   waits for King Crab, a golden candle is never saved from a test level, and the end card shows the numbers. */
const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
type Hold = { left?: boolean; right?: boolean; jump?: boolean; tapJump?: boolean };
type Boss = { kind: string; state: string; hits: number; hole: { x: number; y: number } | null; summitY: number; crab: { x: number; w: number; st: string } | null };
type K = {
  where: () => { x: number; y: number; w: number; h: number; vx: number; vy: number; onGround: boolean; up: number; levelId: string | null };
  place: (x: number, y: number) => unknown; step: (n: number, hold?: Hold) => unknown; state: () => { running: boolean }; godMode: () => void;
  s2: () => { bosses: Boss[]; goldGot: boolean; locked: boolean; cleared: boolean }; s2Freeze: (on: boolean) => boolean;
  progress: () => { goldenCandles?: Record<string, number> };
};
type Win = Window & { __k11: K };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

test('the adventure: climbs, Mr. Mole, the glitch tide and King Crab, the goal and the end card', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = watchErrors(page);
  await page.goto(`${BASE}?devtools=1&lab=adventure`);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).__k11.state().running);
  const r = await page.evaluate(() => {
    const Kk = (window as unknown as Win).__k11, out: Record<string, unknown> = {};
    const stand = (col: number, row: number) => { const h = Kk.where().h; Kk.place(col * 16 + 3, row * 16 - h); Kk.step(4, {}); };
    const feet = () => { const p = Kk.where(); return { col: Math.floor((p.x + p.w / 2) / 16), row: Math.round((p.y + p.h) / 16 * 100) / 100, g: p.onGround }; };
    const until = (n: number, hold: (f: number) => Hold, done: () => boolean) => { for (let f = 0; f < n; f++) { Kk.step(1, hold(f)); if (f > 8 && done()) return true; } return false; };
    out.up = Kk.where().up; out.id = Kk.where().levelId;
    /* act 1: the wall-jump chimney up the cliff */
    stand(72, 12); let dir = 1; Kk.step(1, { right: true, tapJump: true, jump: true });
    out.chimney = until(1200, () => { const p = Kk.where(), o: Hold = { right: dir > 0, left: dir < 0, jump: true }; if (!p.onGround && Math.abs(p.vx) < 0.01) { o.tapJump = true; dir = -dir; o.right = dir > 0; o.left = dir < 0; } if (p.onGround) o.tapJump = true; return o; }, () => feet().g && feet().row <= -14);
    /* act 2: Mr. Mole (both walls shut while he fights; three stomps) */
    Kk.godMode(); stand(130 + 84, 12); until(200, () => ({ right: true }), () => Kk.s2().bosses[0].state !== 'wait'); Kk.step(1, { right: false });
    stand(130 + 110, 12); until(40, () => ({ right: true }), () => false); out.moleWallHeld = feet().col <= 130 + 111;
    for (let i = 0; i < 4000 && Kk.s2().bosses[0].state !== 'friend'; i++) {
      const B = Kk.s2().bosses[0];
      if (B.state === 'up' && B.hole) { Kk.place(B.hole.x - 5, B.hole.y - 60); for (let f = 0; f < 50 && Kk.s2().bosses[0].hits === B.hits; f++) Kk.step(1, {}); } else Kk.step(1, {});
    }
    out.mole = Kk.s2().bosses[0].state; out.moleHits = Kk.s2().bosses[0].hits;
    stand(130 + 110, 12); out.moleOut = until(120, () => ({ right: true }), () => feet().col >= 130 + 114);
    /* act 3: the golden candle under the rock (a test level never saves it) */
    stand(270 + 108, 12); out.gold = until(300, () => ({ right: true }), () => Kk.s2().goldGot);
    out.goldSaved = JSON.stringify(Kk.progress().goldenCandles || {}).indexOf('lab-') >= 0;
    /* act 4: the goal waits for King Crab; the tide starts when he walks in */
    stand(420 + 13, 12); out.tide = Kk.s2().bosses[1].state;
    stand(420 + 39, 12); Kk.step(30, {}); out.goalLocked = Kk.s2().locked && !Kk.s2().cleared;
    stand(420 + 20, -34); for (let i = 0; i < 200 && Kk.s2().bosses[1].state !== 'crab'; i++) Kk.step(1, {});
    for (let i = 0; i < 6000 && Kk.s2().bosses[1].state !== 'friend'; i++) {
      const B = Kk.s2().bosses[1];
      if (B.crab && B.crab.st === 'tired') { Kk.place(B.crab.x + B.crab.w / 2 - 5, B.summitY - 80); for (let f = 0; f < 60 && Kk.s2().bosses[1].hits === B.hits; f++) Kk.step(1, {}); } else Kk.step(1, {});
    }
    out.crab = Kk.s2().bosses[1].state;
    stand(420 + 36, -34); out.cleared = until(400, () => ({ right: true }), () => Kk.s2().cleared);
    Kk.step(400, { right: false });
    return out;
  });
  expect(r.id).toBe('lab-adventure');
  expect(r.up).toBe(45);
  expect(r.chimney).toBe(true);
  expect(r.moleWallHeld).toBe(true);
  expect(r.mole).toBe('friend');
  expect(r.moleHits).toBe(4);   /* 4 stomps since Shad's "too easy" */
  expect(r.moleOut).toBe(true);
  expect(r.gold).toBe(true);
  expect(r.goldSaved).toBe(false);
  expect(r.tide).toBe('rise');
  expect(r.goalLocked).toBe(true);
  expect(r.crab).toBe('friend');
  expect(r.cleared).toBe(true);
  await expect(page.locator('.s2card')).toContainText('YOU MADE IT', { timeout: 15_000 });
  await expect(page.locator('.s2card')).toContainText('ACT 4: THE SEA CAVE');
  /* the feedback questions, one at a time, then one message to send Shad with the card's numbers and every answer */
  await page.locator('#s2Ask').click();
  for (let q = 0; q < 14; q++) await page.locator('.s2opts button').first().click();
  await page.locator('#s2Name').fill('Tester');
  await page.locator('#s2Done').click();
  const msg = await page.locator('#s2Out').inputValue();
  expect(msg).toContain('KINAN TEST RESULTS');
  expect(msg).toContain('Player: Tester');
  expect(msg).toContain('14. Would you play a whole world like this? Yes!');
  expect(errors).toEqual([]);
});

test('stopping early: Menu › I\'m done asks why, then the card, the questions and a message that says where and why', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto(`${BASE}?devtools=1&lab=adventure`);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).__k11.state().running);
  await page.evaluate(() => { const Kk = (window as unknown as Win).__k11, h = Kk.where().h; Kk.place((130 + 30) * 16, 12 * 16 - h); Kk.step(30, {}); });
  await page.locator('#menuBtn').click();
  await page.locator('#s2QuitBtn').click();
  await page.locator('#s2QuitNo').click();   /* "No, keep playing" goes back */
  await expect(page.locator('#menuMain')).toBeVisible();
  await page.locator('#s2QuitBtn').click();
  await page.locator('#s2QuitWhy button').first().click();   /* Too hard */
  await expect(page.locator('.s2card')).toContainText('THANKS FOR PLAYING');
  await page.locator('#s2Ask').click();
  for (let q = 0; q < 14; q++) await page.locator('#s2Skip').click();
  await page.locator('#s2Done').click();
  const msg = await page.locator('#s2Out').inputValue();
  expect(msg).toContain('Finished: NO - stopped in ACT 2: THE OLD MINE. Why: Too hard');
  expect(msg).toMatch(/Act 2 \d+:\d\d/);
  expect(errors).toEqual([]);
});

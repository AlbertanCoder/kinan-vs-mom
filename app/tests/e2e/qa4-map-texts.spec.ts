import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* QA 2026-10-28 (MINOR x3):
   - after 3-8's secret exit the map said "THE CASTLE IS OPEN!": every secret exit now says
     SECRET LEVEL FOUND! and the secret stop it opened sparkles (all five: 1-7, 2-7, 3-8, 4-7, 5-6);
   - outdated texts: How to play talked about stars, puzzle pieces, "saves at every checkpoint" and
     "hearts are your lives"; the title said "No stars yet" (it counts golden candles now); there was
     no way to start a new save from the map flow (Start over, with a confirm screen);
   - the top bar read "LEVEL 1-castle": the fort / secret / castle levels have proper names.
   The title itself stays "Kinan vs. Mom" (it becomes Kinan vs. Worlds only after World 11). */
const BASE = 'http://127.0.0.1:4174/index.html';
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';

type Stop = { id: string | null; kind: string; state: string | null };
type MapState = { mounted: boolean; busy: boolean; walking: boolean; crossing: boolean; banner: string | null; world: number | null; at: number; notice: string | null; celebrate: number | null; stops: Stop[] };
type Dev = {
  mapState: () => MapState; levelInfo: () => { id: string | null; cleared: boolean; returned: boolean; secretExit: { tx: number; ty: number; open: boolean } | null };
  playLevel: (id: string) => unknown; godMode: () => void; clearFoes: () => void; freeze: (on: boolean) => void; tile: (c: number, r: number) => number;
  place: (x: number, y: number) => unknown; step: (n: number, o?: Record<string, boolean>) => unknown[];
  progress: () => Record<string, unknown> & { levelsBeaten: Record<string, number>; pets: { ids: string[] }; wallet: number; codes: number[]; wmap: unknown };
};
type Def = { id: string; world: number; slot: number; secrets?: { col: number; row: number; exit?: string }[] };
type Win = Window & { __k11: Dev; KinanLevels: { ready: boolean; list: () => string[]; get: (id: string) => Def } };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function boot(page: Page): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
}
async function settle(page: Page): Promise<MapState> {
  await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy && !s.walking && !s.crossing; }, null, { timeout: 45_000 });
  return page.evaluate(() => (window as unknown as Win).__k11.mapState());
}

test.describe('QA fix: a secret exit announces the secret', () => {
  for (const exitId of ['1-7', '2-7', '3-8', '4-7', '5-6']) {
    test(`${exitId}'s secret exit: the map says SECRET LEVEL FOUND! and the secret stop sparkles`, async ({ page }) => {
      test.setTimeout(90_000);
      const errors = watchErrors(page);
      await boot(page);
      /* a save that stands on this stop with everything before it beaten */
      const seed = await page.evaluate((exitId) => {
        const K = (window as unknown as Win).KinanLevels, me = K.get(exitId), beaten: Record<string, number> = {};
        for (const id of K.list()) { const d = K.get(id); if (!/secret/.test(id) && (d.world < me.world || (d.world === me.world && d.slot < me.slot))) beaten[id] = 1; }
        const unlocked = K.list().filter((id) => /secret/.test(id) && K.get(id).world < me.world);
        return { unlocked: 1, beaten: [], levelsBeaten: beaten, unlockedLevels: unlocked, wmap: { w: me.world, at: me.slot - 1 } };
      }, exitId);
      await page.evaluate(({ key, d }) => localStorage.setItem(key, JSON.stringify(d)), { key: CURRENT, d: seed });
      await boot(page);
      await page.locator('#startBtn').click({ force: true });
      const s0 = await settle(page);
      const secretAt = s0.stops.findIndex((q) => q.kind === 'secret');
      expect(s0.stops[s0.at].id).toBe(exitId);
      expect(s0.stops[secretAt].state).toBe('locked');
      await page.locator('#owPlay').click();
      await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe(exitId);
      /* bump the secret-exit block from the floor under it, then stand in the door it opens */
      const r = await page.evaluate((id) => {
        const k = (window as unknown as Win).__k11, def = (window as unknown as Win).KinanLevels.get(id);
        const s = (def.secrets || []).find((q) => q.exit)!;
        k.godMode(); k.clearFoes();
        let fy = s.row + 1; while (fy < 15 && !k.tile(s.col, fy)) fy++;
        for (const dx of [2, -6, 8]) {
          if (k.levelInfo().secretExit!.open) break;
          k.place(s.col * 16 + dx, fy * 16 - 16); k.step(15, {});
          k.step(45, { jump: true, tapJump: true }); k.step(40, { jump: false });
        }
        const X = k.levelInfo().secretExit!;
        if (X.open) { k.place(X.tx * 16 + 3, X.ty * 16); k.step(80, {}); }
        for (let n = 0; n < 900 && !k.levelInfo().returned; n++) k.step(1);
        return { to: s.exit, returned: k.levelInfo().returned };
      }, exitId);
      expect(r.returned).toBe(true);
      await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy; });
      const s1 = await page.evaluate(() => (window as unknown as Win).__k11.mapState());
      expect(s1.notice).toBe('SECRET LEVEL FOUND!');
      expect(s1.stops[secretAt]).toMatchObject({ id: r.to, kind: 'secret', state: 'open' });
      expect(s1.celebrate).toBe(secretAt);   /* the newly opened secret stop sparkles */
      expect(s1.stops[s0.at].state).toBe('beaten');
      expect(errors).toEqual([]);
    });
  }
});

test.describe('QA fix: the texts match the game', () => {
  test('How to play explains today\'s rules: candles and golden candles, no game over, auto-run (SHIFT/X walks), pets that work by themselves, bosses that get smarter', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await page.locator('#howBtn').click();
    const t = (await page.locator('#screen').innerText()).replace(/\s+/g, ' ');
    for (const want of ['The story and the moves', 'Kinan runs by himself', 'SHIFT or X to walk', 'golden candle', 'No game over', 'checkpoint flag',
      '4 cats and 2 dogs', 'crate', 'work all by themselves', 'smarter', 'castle boss', 'world map', 'saves itself after every level']) {
      expect(t, want).toContain(want);
    }
    for (const gone of [/\bstars?\b/i, /puzzle piece/i, /saves itself at every checkpoint/i, /hearts are your lives/i, /\bLe[g]o\b/i]) expect(t).not.toMatch(gone);   /* [g]: this file never prints the brand word */
    expect(errors).toEqual([]);
  });

  test('the title counts golden candles (no more "No stars yet") and keeps the name Kinan vs. Mom', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await expect(page.locator('h1.title')).toContainText('Kinan vs. Mom');
    await expect(page.locator('#goldTip')).toHaveText('No golden candles yet. Every numbered level hides one!');
    await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ unlocked: 1, beaten: [], goldenCandles: { '1-1': 1, '1-5': 1, '2-3': 1 } })), CURRENT);
    await boot(page);
    const total = await page.evaluate(() => { const K = (window as unknown as Win).KinanLevels; return K.list().filter((id) => /^\d+-\d+$/.test(id)).length; });
    await expect(page.locator('#goldTip')).toHaveText(`3 of ${total} golden candles found. Every numbered level hides one!`);
    expect(await page.locator('.titletip').innerText()).not.toMatch(/star/i);
    expect(errors).toEqual([]);
  });

  test('Start over asks first: "No" keeps the game, "Yes" starts a brand-new save (Builder levels and reward codes stay)', async ({ page }) => {
    const errors = watchErrors(page);
    await page.addInitScript((key) => {
      if (sessionStorage.getItem('qa4-seeded')) return;
      sessionStorage.setItem('qa4-seeded', '1');
      localStorage.setItem(key, JSON.stringify({ unlocked: 1, beaten: [], levelsBeaten: { '1-1': 1, '1-2': 1 }, wmap: { w: 1, at: 2 }, wallet: 40, totalCandles: 40,
        goldenCandles: { '1-1': 1 }, pets: { ids: ['cat1'], names: {}, equippedCat: 'cat1', equippedDog: null }, codes: [3] }));
    }, CURRENT);
    await boot(page);
    await expect(page.locator('#startBtn')).toContainText('CONTINUE');
    await page.locator('#newBtn').click();
    await expect(page.locator('#screen')).toContainText('Start a brand-new game?');
    await page.locator('#startOverNo').click();
    await expect(page.locator('#startBtn')).toContainText('CONTINUE');
    let p = await page.evaluate(() => (window as unknown as Win).__k11.progress());
    expect(Object.keys(p.levelsBeaten)).toEqual(['1-1', '1-2']);
    await page.locator('#newBtn').click();
    await page.locator('#startOverYes').click();
    await expect(page.locator('#startBtn')).toContainText('START');
    await expect(page.locator('#goldTip')).toContainText('No golden candles yet');
    p = await page.evaluate(() => (window as unknown as Win).__k11.progress());
    expect(p).toMatchObject({ levelsBeaten: {}, wmap: null, wallet: 0, goldenCandles: {}, unlockedLevels: [], codes: [3] });
    expect(p.pets.ids).toEqual([]);
    /* it is saved: a reload is still the new game, and PLAY opens the map at World 1, stop 1 */
    await page.reload();
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    expect(Object.keys((await page.evaluate(() => (window as unknown as Win).__k11.progress())).levelsBeaten)).toEqual([]);
    await page.locator('#startBtn').click({ force: true });
    const s = await settle(page);
    expect(s).toMatchObject({ world: 1, at: 0 });
    expect(errors).toEqual([]);
  });

  test('the top bar names the fort, secret and castle levels properly (no "LEVEL 1-castle")', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const want: Record<string, RegExp> = {
      '1-1': /^LEVEL 1-1 · KINAN'S BEDROOM$/, '1-fort': /^WORLD 1 FORT · /, '1-secret': /^WORLD 1 SECRET · /, '1-castle': /^WORLD 1 CASTLE · /, '5-castle': /^WORLD 5 CASTLE · /,
    };
    for (const [id, re] of Object.entries(want)) {
      await page.evaluate((id) => { const k = (window as unknown as Win).__k11; k.playLevel(id); k.freeze(true); }, id);
      const lbl = (await page.locator('#stageLbl').innerText()).trim();
      expect(lbl, id).toMatch(re);
      expect(lbl, id).not.toMatch(/castle|fort|secret/);   /* never the lowercase file id */
    }
    expect(errors).toEqual([]);
  });
});

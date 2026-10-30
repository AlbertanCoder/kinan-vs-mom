import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* The overworld map in the game (map/engine.js + map/worlds/*.js, docs/OVERWORLD-MAP.md):
   title -> PLAY -> the map at the saved spot -> a stop launches its level file (world + slot) ->
   LEVEL CLEAR -> back on the map with the stop beaten and the next one open; secret exits open
   their secret stop; a castle opens the world's seam; "Coming soon" stops are safe. */
const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;   /* the copy's own port, as every other spec (d599b82) */
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';

type Stop = { name: string; kind: string; id: string | null; built: boolean; state: string | null };
type MapState = { mounted: boolean; busy: boolean; world: number | null; at: number; walking: boolean; crossing: boolean; three: boolean; threeReady: boolean; banner: string | null; notice: string | null; stops: Stop[] };
type Info = { id: string | null; cleared: boolean; returned: boolean; toast: string; goal: { x: number; tx: number; ty: number } | null; secretExit: { to: string; open: boolean } | null };
type Arena = { state: string; cp: { x: number }; floorY: number };
type Dev = {
  mapState: () => MapState; mapWarp: (n: number, at: number) => MapState | null;
  levelInfo: () => Info; playLevel: (id: string) => unknown; godMode: () => void; clearFoes: () => void;
  place: (x: number, y: number) => unknown; step: (n: number, o?: Record<string, boolean>) => { x: number }[];
  progress: () => { wmap: { w: number; at: number } | null; levelsBeaten: Record<string, number>; unlockedLevels: string[]; wallet: number };
  arenaInfo: () => Arena; arenaBot: (n: number) => Arena;
};
type Win = Window & { __k11: Dev; KinanLevels: { ready: boolean; list: () => string[]; get: (id: string) => { world: number; slot: number } } };

const W1 = ['1-1', '1-2', '1-3', '1-4', '1-5', '1-fort', '1-6', '1-7', '1-8'];
const W2 = ['2-1', '2-2', '2-3', '2-4', '2-5', '2-fort', '2-6', '2-7', '2-8', '2-castle'];
const beaten = (ids: string[]): Record<string, number> => Object.fromEntries(ids.map((id) => [id, 1]));

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
/* a save written once per test (a reload or the way back from a 3D level keeps what the game saved) */
async function seed(page: Page, data: Record<string, unknown>): Promise<void> {
  await page.addInitScript(({ key, d }) => {
    if (sessionStorage.getItem('ow-seeded')) return;
    sessionStorage.setItem('ow-seeded', '1');
    localStorage.setItem(key, JSON.stringify(Object.assign({ unlocked: 1, beaten: [] }, d)));
  }, { key: CURRENT, d: data });
}
async function boot(page: Page): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
}
const mapState = (page: Page): Promise<MapState> => page.evaluate(() => (window as unknown as Win).__k11.mapState());
async function openMap(page: Page, o: { intro?: boolean } = {}): Promise<MapState> {
  await page.locator('#startBtn').click({ force: true });   /* PLAY pulses (the "beat" animation) */
  /* 2026-10-28: a new save's first PLAY plays the opening cutscene (c1-cutscenes.spec.ts); these map tests skip it */
  if (o.intro) await expect(page.locator('#cut')).toBeVisible();
  if (await page.locator('#cut').isVisible()) { await page.locator('#cutSkip').click(); await expect(page.locator('#cut')).toBeHidden(); }
  await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy; });
  await expect(page.locator('#owHost .km-canvas')).toBeVisible();
  return mapState(page);
}
/* wait until Kinan stands still on the map (no walk, no crossing, no banner) */
async function settle(page: Page): Promise<MapState> {
  await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.walking && !s.crossing && !s.busy && !s.banner; }, null, { timeout: 45_000 });
  return mapState(page);
}
/* finish the running level by its goal (geometry only), then let the victory lap run out */
const FINISH = `() => {
  const k = window.__k11; k.godMode(); k.clearFoes();
  const g = k.levelInfo().goal; k.place(g.x - 48, g.ty * 16 - 30); k.step(30);
  for (let f = 0; f < 900 && !k.levelInfo().cleared; f++) k.step(1, { right: true });
  for (let f = 0; f < 900 && !k.levelInfo().returned; f++) k.step(1, { right: true });
  return k.levelInfo();
}`;

test.describe('the overworld map between levels', () => {
  test('a new save: title PLAY -> (the opening cutscene, skipped) -> the map at World 1 stop 1 -> 1-1 -> LEVEL CLEAR -> back on the map with 1-2 open', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await expect(page.locator('#startBtn')).toContainText('PLAY');
    const s0 = await openMap(page, { intro: true });   /* a new save: the opening plays first */
    expect(s0).toMatchObject({ world: 1, at: 0 });
    expect(s0.stops[0]).toMatchObject({ id: '1-1', state: 'open', built: true });
    expect(s0.stops[1]).toMatchObject({ id: '1-2', state: 'locked' });
    /* the path past an unbeaten level stays shut */
    await page.locator('#owNext').click();
    const s1 = await settle(page);
    expect(s1.at).toBe(0);
    expect(s1.notice).toContain('1-1');
    /* PLAY launches the authored level file of this stop */
    await page.locator('#owPlay').click();
    await expect(page.locator('#stage')).toBeVisible();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe('1-1');
    const info = await page.evaluate(`(${FINISH})()`) as Info;
    expect(info.cleared).toBe(true);
    expect(info.returned).toBe(true);
    /* back on the map: 1-1 beaten (red), 1-2 open, saved */
    await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy; });
    await expect(page.locator('#owHost .km-canvas')).toBeVisible();
    await expect(page.locator('#stage')).toBeHidden();
    const s2 = await mapState(page);
    expect(s2).toMatchObject({ world: 1, at: 0 });
    expect(s2.stops[0].state).toBe('beaten');
    expect(s2.stops[1]).toMatchObject({ id: '1-2', state: 'open' });
    expect(s2.notice).toBe('1-2 IS OPEN!');
    await page.locator('#owNext').click();
    const s3 = await settle(page);
    expect(s3.at).toBe(1);
    const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}'), CURRENT);
    expect(saved.levelsBeaten).toEqual({ '1-1': 1 });
    expect(saved.wmap).toEqual({ w: 1, at: 1 });
    /* a reload comes back to the same spot */
    await page.reload();
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    await expect(page.locator('#startBtn')).toContainText('CONTINUE');
    expect(await openMap(page)).toMatchObject({ world: 1, at: 1 });
    expect(errors).toEqual([]);
  });

  test('every built stop of Worlds 1-3 launches the level file with its world and slot; the 3-castle is "Coming soon"', async ({ page }) => {
    const errors = watchErrors(page);
    await seed(page, { levelsBeaten: beaten([...W1, '1-castle', ...W2]) });
    await boot(page);
    await openMap(page);
    const r = await page.evaluate(() => {
      const w = window as unknown as Win, out: { n: number; i: number; id: string | null; built: boolean; kind: string; slotOk: boolean }[] = [];
      for (const n of [1, 2, 3]) {
        const s = w.__k11.mapWarp(n, 0)!;
        s.stops.forEach((q, i) => {
          const d = q.built && q.id ? w.KinanLevels.get(q.id) : null;
          out.push({ n, i, id: q.id, built: q.built, kind: q.kind, slotOk: !!d && d.world === n && d.slot === i + 1 });
        });
      }
      return out;
    });
    expect(r).toHaveLength(33);
    for (const q of r) {
      expect(q.id!.startsWith(`${q.n}-`)).toBe(true);
      if (q.id === '3-castle' && !q.built) continue;   /* the only World 1-3 stop without a level file yet */
      expect(q.built, `${q.n}:${q.i} ${q.id}`).toBe(true);
      expect(q.slotOk, `${q.n}:${q.i} ${q.id}`).toBe(true);
    }
    expect(r.filter((q) => q.kind === 'secret').map((q) => q.id)).toEqual(['1-secret', '2-secret', '3-secret']);
    expect(r.filter((q) => q.kind === 'fort').map((q) => q.i)).toEqual([5, 5, 5]);
    expect(r.filter((q) => q.kind === 'boss').map((q) => q.i)).toEqual([10, 10, 10]);
    expect(errors).toEqual([]);
  });

  test("1-7's secret exit opens the secret stop on the map (and the 2-7 / 3-8 exits lead to their worlds' secret stops)", async ({ page }) => {
    const errors = watchErrors(page);
    await seed(page, { levelsBeaten: beaten(W1.slice(0, 7)), wmap: { w: 1, at: 7 } });
    await boot(page);
    const s0 = await openMap(page);
    expect(s0).toMatchObject({ world: 1, at: 7 });
    expect(s0.stops[8]).toMatchObject({ id: '1-secret', kind: 'secret', state: 'locked' });
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe('1-7');
    /* the painting room (the same moves as engine-pass-a's secret-exit test) */
    const info = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.godMode(); k.clearFoes();
      k.place(123 * 16, 160); k.step(10);
      let f = 0;
      while (f < 240 && k.step(1, { left: true })[0].x > 118 * 16 + 10) f++;
      k.step(12, { left: false }); k.step(1);
      k.step(40, { tapJump: true, jump: true });
      k.step(40, { left: true }); k.step(20);
      const atExit = k.levelInfo();
      for (let n = 0; n < 900 && !k.levelInfo().returned; n++) k.step(1);
      return { toast: atExit.toast, returned: k.levelInfo().returned };
    });
    expect(info.toast).toContain('SECRET EXIT FOUND');
    expect(info.returned).toBe(true);
    await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy; });
    const s1 = await mapState(page);
    expect(s1.stops[7]).toMatchObject({ id: '1-7', state: 'beaten' });
    expect(s1.stops[8]).toMatchObject({ id: '1-secret', state: 'open' });
    expect(s1.stops[9]).toMatchObject({ id: '1-8', state: 'open' });
    /* QA 2026-10-28: a secret exit announces the secret it found (it used to name whatever stop opened next) */
    expect(s1.notice).toBe('SECRET LEVEL FOUND!');
    await page.locator('#owNext').click();
    expect((await settle(page)).at).toBe(8);   /* the spur is walkable now */
    /* the other two secret exits point at their own world's secret stop */
    const exits = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      return ['2-7', '3-8'].map((id) => { k.playLevel(id); return k.levelInfo().secretExit?.to ?? null; });
    });
    expect(exits).toEqual(['2-secret', '3-secret']);
    expect(errors).toEqual([]);
  });

  test('the 1-castle: the seam stays shut until Mom is befriended, then Kinan walks off the map into World 2', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await seed(page, { levelsBeaten: beaten(W1), unlockedLevels: ['1-secret'], wmap: { w: 1, at: 10 } });
    await boot(page);
    const s0 = await openMap(page);
    expect(s0.stops[10]).toMatchObject({ id: '1-castle', kind: 'boss', state: 'open' });
    await page.locator('#owNext').click();
    const s1 = await settle(page);
    expect(s1).toMatchObject({ world: 1, at: 10 });
    expect(s1.notice).toContain('CASTLE');
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe('1-castle');
    const info = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.clearFoes();
      const a0 = k.arenaInfo(); k.place(a0.cp.x - 6, a0.floorY - 18); k.step(20);
      let a = k.arenaInfo();
      for (let f = 0; f < 15000 && a.state !== 'open'; f++) a = k.arenaBot(1);
      for (let n = 0; n < 400 && !k.levelInfo().cleared; n++) k.arenaBot(1);
      for (let n = 0; n < 1200 && !k.levelInfo().returned; n++) k.step(1, { right: true });
      return k.levelInfo();
    });
    expect(info.cleared).toBe(true);
    expect(info.returned).toBe(true);
    /* 2026-10-28: back on the map Glitchy escapes into World 2 first (c1-cutscenes.spec.ts); SKIP ends it */
    await expect(page.locator('#cut')).toBeVisible();
    await page.locator('#cutSkip').click();
    await expect(page.locator('#cut')).toBeHidden();
    await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy; });
    const s2 = await mapState(page);
    expect(s2.stops[10].state).toBe('beaten');
    expect(s2.notice).toBe('THE WAY ON TO THE NEXT WORLD IS OPEN!');
    await page.locator('#owNext').click();
    await expect.poll(async () => (await mapState(page)).crossing).toBe(true);
    const s3 = await settle(page);
    expect(s3).toMatchObject({ world: 2, at: 0 });
    expect(s3.stops[0]).toMatchObject({ id: '2-1', state: 'open' });
    expect((await page.evaluate(() => (window as unknown as Win).__k11.progress().wmap))).toEqual({ w: 2, at: 0 });
    expect(errors).toEqual([]);
  });

  test('a "Coming soon" stop is safe: PLAY says so and launches nothing, and it never blocks the trail', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    /* 2026-10-28: this build releases Worlds 1-5 (World 6 waits behind its "coming soon" sign, c1-cutscenes.spec.ts).
       The stops and castles with no level file are in the later worlds, so this test opens every world's map first */
    expect(await page.evaluate(() => (window as unknown as { __k11: { owRelease: (n: number) => number } }).__k11.owRelease(12))).toBe(12);
    await openMap(page);
    /* level files keep arriving: find the first stop with no file yet and the first castle with no file yet */
    const plan = await page.evaluate(() => {
      const w = window as unknown as Win, k = w.__k11;
      let soon: { n: number; i: number } | null = null, castle: number | null = null;
      /* World 9 is complete (v52): Worlds 10-11 have their maps but no level files yet */
      for (let n = 1; n <= 11 && (!soon || castle === null); n++) {
        const s = k.mapWarp(n, 0)!;
        s.stops.forEach((q, i) => { if (!soon && !q.built && q.kind !== 'secret' && i < 10) soon = { n, i }; });
        if (castle === null && !s.stops[10].built) castle = n;
      }
      return { soon, castle, ids: w.KinanLevels.list() } as { soon: { n: number; i: number } | null; castle: number | null; ids: string[] };
    });
    expect(plan.soon).not.toBeNull();
    expect(plan.castle).not.toBeNull();
    /* every built level beaten: the whole trail up to there is open. Written by an init script on the reload, so a
       story line finishing on the old page (it saves) can never write over it (2026-10-28: a firefox race) */
    await page.addInitScript(({ key, ids, at }) => {
      if (sessionStorage.getItem('ow-soon-seeded')) return;
      sessionStorage.setItem('ow-soon-seeded', '1');
      localStorage.setItem(key, JSON.stringify({ unlocked: 1, beaten: [], levelsBeaten: Object.fromEntries(ids.map((id) => [id, 1])), wmap: { w: at.n, at: at.i } }));
    }, { key: CURRENT, ids: plan.ids, at: plan.soon! });
    await page.reload();
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    const s0 = await openMap(page);
    expect(s0).toMatchObject({ world: plan.soon!.n, at: plan.soon!.i });
    expect(s0.stops[plan.soon!.i]).toMatchObject({ built: false, state: 'open' });
    await page.locator('#owPlay').click();
    await expect.poll(async () => (await mapState(page)).banner).toBe('COMING SOON!');
    await settle(page);   /* the banner runs out (slower on a slow frame rate); nothing launched */
    await expect(page.locator('#stage')).toBeHidden();
    expect(await page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBeNull();
    /* it does not block: Kinan walks on past it */
    await page.locator('#owNext').click();
    await expect.poll(async () => { const q = await mapState(page); return (q.world ?? 0) * 100 + q.at; }, { timeout: 30_000 }).toBeGreaterThan(plan.soon!.n * 100 + plan.soon!.i);
    await settle(page);
    /* a castle with no level file yet leaves its seam open: on into the next world. B2 (2026-10-28): with
       the World 3-5 castles built, the first one missing is World 6's, whose seam is the bus road trip (6.5,
       ~3,500 px of road), so the walk runs at KINAN.speed(6) like the seams spec */
    await page.evaluate((n) => (window as unknown as Win).__k11.mapWarp(n, 10), plan.castle!);
    await settle(page);
    await page.evaluate(() => (window as unknown as { KINAN: { speed: (n: number) => void } }).KINAN.speed(6));
    await page.locator('#owNext').click();
    const s2 = await settle(page);
    expect(s2).toMatchObject({ world: plan.castle! + 1, at: 0 });
    expect(errors).toEqual([]);
  });

  test("a level's pause menu goes back to the world map, not the old stage map", async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await openMap(page);
    await page.locator('#owPlay').click();
    await expect(page.locator('#stage')).toBeVisible();
    await page.locator('#menuBtn').click();
    await expect(page.locator('#mapBtnP')).toContainText('World map');
    await page.locator('#mapBtnP').click();
    await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy; });
    expect(await mapState(page)).toMatchObject({ world: 1, at: 0 });
    await expect(page.locator('.maptitle')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});

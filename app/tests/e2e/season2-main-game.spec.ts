import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* SEASON 2 IN THE MAIN GAME (Shad, 2026-11-12, launch answers 34 and 38; docs/SEASON-2-PLAN.md "Into the main game"):
   - a new player: after the 11-castle the new end of World 11 plays, then the way on flies the family to India (World 12),
     whose first stop is open; no ?season2=1, no SEASON 2 TEST badge, the title counts 15 worlds;
   - a player who beat World 11 before Season 2 joined the game: the next time the map opens the new World 11 ending plays,
     then the trip to India is open;
   - the 3D World 12 sneak peek's clears (saved under 12-4, 12-5, 12-fort, 12-6, the same ids as India's stops) move to
     the 3D bonus's own progress: India's stops are not beaten by them (M1, app/audit/season2-ready/FINDINGS.md);
   - ?world=13 opens Japan's map with its first level ready, on a fresh save and on a save that has played (nothing lost);
     ?world=12, 14 and 15 the same;
   - the 3D bonus stop past the 11-castle still opens 3D Saskatoon (its four levels, the sneak-peek sign). */
const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';

type Stop = { name: string; kind: string; id: string | null; built: boolean; state: string | null };
type MapS = { mounted: boolean; busy: boolean; walking: boolean; crossing: boolean; world: number | null; bonus: boolean; at: number; three: boolean; threeReady: boolean;
  banner: string | null; notice: string | null; gate: number | null; stops: Stop[] };
type CutS = { on: boolean; mode: string | null; ending: { beats: string[]; beat: number; card: boolean } | null };
type Prog = { levelsBeaten: Record<string, number>; unlockedLevels: string[]; bonus3d: { beaten: Record<string, number>; unlocked: string[] }; bonus3dMoved: boolean;
  wmap: { w: number; at: number; b?: number } | null; wallet: number; s2EndingDue?: boolean; endingSeen: boolean; pets: { ids: string[] } };
type Dev = { mapState: () => MapS; mapGo: (d: number) => MapS; mapPlay: () => MapS; mapWarp: (n: number | string, at: number) => MapS | null; progress: () => Prog; cut: () => CutS;
  cutSpeed: (n: number) => number; cutSkip: () => unknown; beatLevel: (id: string) => Record<string, unknown>; worldMap: (o?: Record<string, unknown>) => boolean };
type Win = Window & { __k11: Dev; KinanLevels: { ready: boolean; list: () => string[]; get: (id: string) => { world: number } | null } };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
const k11 = <T>(page: Page, fn: string): Promise<T> => page.evaluate(`(${fn})(window.__k11)`) as Promise<T>;
const ready = (page: Page) => page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
const mapState = (page: Page): Promise<MapS> => k11<MapS>(page, '(k) => k.mapState()');
const progress = (page: Page): Promise<Prog> => k11<Prog>(page, '(k) => k.progress()');
async function settle(page: Page, timeout = 60_000): Promise<MapS> {
  await page.waitForFunction(() => { const k = (window as unknown as Win).__k11, s = k.mapState(); return s.mounted && !s.walking && !s.crossing && !s.busy && !s.banner && !k.cut().on; }, null, { timeout });
  return mapState(page);
}
/* the ending, skipped beat by beat; returns the beats it showed */
async function skipEnding(page: Page): Promise<{ beats: string[]; card: boolean }> {
  await expect.poll(async () => (await k11<CutS>(page, '(k) => k.cut()')).mode, { timeout: 15_000 }).toBe('ending');
  const c0 = await k11<CutS>(page, '(k) => k.cut()');
  const beats = c0.ending!.beats;
  await k11(page, '(k) => k.cutSpeed(12)');
  await page.waitForFunction(() => { const c = (window as unknown as Win).__k11.cut(); return !c.on || (c.ending && c.ending.card); }, null, { timeout: 60_000 });   /* the card under TO BE CONTINUED */
  const card = !!(await k11<CutS>(page, '(k) => k.cut()')).ending!.card;
  for (let i = 0; i < 40 && (await k11<CutS>(page, '(k) => k.cut()')).on; i++) { await k11(page, '(k) => k.cutSkip()'); await page.waitForTimeout(80); }
  expect((await k11<CutS>(page, '(k) => k.cut()')).on, 'the ending was skipped to its end').toBe(false);
  return { beats, card };
}
/* every level of Worlds 1-11 (and the secrets they open), from the level files */
const W11_IDS = `(() => { const K = window.KinanLevels; return K.list().filter((id) => { const d = K.get(id); return d && d.world >= 1 && d.world <= 11; }); })()`;
/* a save written before the page loads (once per test: a reload keeps what the game saved since) */
async function seed(page: Page, make: string): Promise<void> {
  await page.goto(DEV_URL);
  await ready(page);
  await page.evaluate(({ key, make }) => {
    const save = (0, eval)(make) as Record<string, unknown>;
    localStorage.setItem(key, JSON.stringify(Object.assign({ unlocked: 1, beaten: [] }, save)));
  }, { key: CURRENT, make });
  await page.reload();
  await ready(page);
}
const BEATEN_W11 = (but: string[] = []) => `Object.fromEntries(${W11_IDS}.filter((id) => !${JSON.stringify(but)}.includes(id)).map((id) => [id, 1]))`;
const SECRETS_W11 = `${W11_IDS}.filter((id) => /-secret$/.test(id))`;
const ESCAPES = '{ 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1 }';

test.describe('Season 2 in the main game', () => {
  test('a fresh save: no test badge, the title counts 15 worlds, and no ?season2=1 is needed (an old ?season2=1 link opens the normal game)', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(BASE);
    await page.waitForFunction(() => !!(window as unknown as Win).KinanLevels?.ready);
    await expect(page.locator('#saveNote')).toContainText('15 worlds');
    await expect(page.locator('#s2badge')).toHaveCount(0);
    /* an old shared test link: the normal game, its own save (no test save is written) */
    await page.goto(`${BASE}?season2=1`);
    await page.waitForFunction(() => !!(window as unknown as Win).KinanLevels?.ready);
    await expect(page.locator('#saveNote')).toContainText('15 worlds');
    await expect(page.locator('#s2badge')).toHaveCount(0);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => localStorage.getItem('kinan-season2-test-v1')), 'no test save').toBeNull();
    expect(await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}').wmap || null, CURRENT), 'nothing seeded on the real save').toBeNull();
    expect(errors).toEqual([]);
  });

  test('a new player reaches World 12 after World 11: the new end of World 11 plays, then the bonus stop and the flight to India, whose first stop is open', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = watchErrors(page);
    await seed(page, `({ introSeen: true, beltSeen: 11, blackBelt: true, escapes: ${ESCAPES}, levelsBeaten: ${BEATEN_W11(['11-castle'])}, unlockedLevels: ${SECRETS_W11}, wmap: { w: 11, at: 10 } })`);
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    expect(s0).toMatchObject({ world: 11, at: 10, gate: null });
    expect(s0.stops[10]).toMatchObject({ id: '11-castle', state: 'open' });
    expect(s0.stops[11], 'the 3D bonus stop waits for the castle').toMatchObject({ kind: 'bonus', state: 'locked' });
    expect(await k11(page, '(k) => k.mapGo(1)')).toBeTruthy();
    await expect.poll(async () => (await mapState(page)).notice).toBe('BEAT THE CASTLE TO OPEN THE PATH');
    /* the 11-castle is won (as its LEVEL CLEAR does): the new end of World 11 plays over the map */
    await k11(page, "(k) => k.worldMap(k.beatLevel('11-castle'))");
    const end = await skipEnding(page);
    expect(end.beats).toEqual(['friend', 'name', 's2home', 's2party', 's2globe', 's2india', 'tbc', 'credits']);
    expect(end.card, 'the Season 2 card under TO BE CONTINUED').toBe(true);
    const s1 = await settle(page);
    expect(s1).toMatchObject({ world: 11, at: 10, gate: null });
    expect(s1.stops[10].state).toBe('beaten');
    expect(s1.stops[11]).toMatchObject({ kind: 'bonus', built: true, state: 'open' });
    /* on: the bonus stop (off the trail, never in the way), then the airport: the plane to India */
    await k11(page, '(k) => k.mapGo(1)');
    expect(await settle(page)).toMatchObject({ world: 11, at: 11 });
    await k11(page, '(k) => k.mapGo(1)');
    await expect.poll(async () => (await mapState(page)).banner).toBe('✈ FLYING TO INDIA!');
    const s2 = await settle(page);
    expect(s2).toMatchObject({ world: 12, bonus: false, three: false, at: 0 });
    expect(s2.stops.map((q) => q.id)).toEqual(['12-1', '12-2', '12-3', '12-4', '12-fort', '12-5', '12-6', '12-7', '12-secret', '12-8', '12-castle']);
    expect(s2.stops[0]).toMatchObject({ id: '12-1', built: true, state: 'open' });
    expect(s2.stops.slice(1).filter((q) => q.kind !== 'secret').map((q) => q.state)).toEqual(Array(9).fill('locked'));
    expect((await progress(page)).wmap).toEqual({ w: 12, at: 0 });
    /* ◀ from India's first stop goes back to the 11-castle, not the bonus stop */
    await k11(page, '(k) => k.mapGo(-1)');
    expect(await settle(page)).toMatchObject({ world: 11, at: 10 });
    /* India's first level opens */
    await k11(page, "(k) => k.mapWarp(12, 0)");
    await settle(page);
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: { levelInfo: () => { id: string | null } } }).__k11.levelInfo().id)).toBe('12-1');
    await expect(page.locator('#s2QuitBtn'), 'no test feedback in a story level').toBeHidden();
    expect(errors).toEqual([]);
  });

  test('a save from before Season 2 that beat World 11 and the 3D sneak peek: India stays unbeaten, the new ending plays once when the map opens, then the trip to India', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = watchErrors(page);
    /* the live game's save: Worlds 1-11 beaten, the old ending seen, the four 3D sneak-peek levels cleared (the 3D page wrote them
       into levelsBeaten), the 12-7 painting's secret in unlockedLevels, standing on the 3D map's stop 6 */
    await seed(page, `({ introSeen: true, beltSeen: 11, blackBelt: true, endingSeen: true, glitchyTeam: true, worldsName: true, escapes: ${ESCAPES}, wallet: 40, totalCandles: 40,
      levelsBeaten: Object.assign(${BEATEN_W11()}, { '12-4': 1, '12-5': 1, '12-fort': 1, '12-6': 1 }), unlockedLevels: ${SECRETS_W11}.concat(['12-secret']), wmap: { w: 12, at: 6 } })`);
    const p0 = await progress(page);
    expect(Object.keys(p0.levelsBeaten).filter((id) => /^12-/.test(id)), 'no World 12 clear left in levelsBeaten').toEqual([]);
    expect(p0.unlockedLevels).not.toContain('12-secret');
    expect(p0.bonus3d).toEqual({ beaten: { '12-4': 1, '12-5': 1, '12-fort': 1, '12-6': 1 }, unlocked: ['12-secret'] });
    expect(p0).toMatchObject({ bonus3dMoved: true, s2EndingDue: true, wallet: 40, wmap: { w: 11, at: 11 } });
    expect(p0.levelsBeaten['11-castle']).toBe(1);
    /* written back at once (the save on the device, not only the game's copy) */
    const raw = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), CURRENT);
    expect(raw.levelsBeaten['12-4']).toBeUndefined();
    expect(raw.bonus3d.beaten['12-4']).toBe(1);
    await page.locator('#startBtn').click({ force: true });
    const end = await skipEnding(page);
    expect(end.beats).toEqual(['friend', 'name', 's2home', 's2party', 's2globe', 's2india', 'tbc', 'credits']);
    const s1 = await settle(page);
    expect(s1).toMatchObject({ world: 11, at: 11 });
    expect(s1.stops[11]).toMatchObject({ kind: 'bonus', state: 'open' });
    expect((await progress(page)).s2EndingDue).toBe(false);
    await k11(page, '(k) => k.mapGo(1)');
    await expect.poll(async () => (await mapState(page)).banner).toBe('✈ FLYING TO INDIA!');
    const s2 = await settle(page);
    expect(s2).toMatchObject({ world: 12, bonus: false, at: 0 });
    const india = Object.fromEntries(s2.stops.map((q) => [q.id, q.state]));
    expect(india, 'the sneak peek did not beat India').toMatchObject({ '12-1': 'open', '12-4': 'locked', '12-5': 'locked', '12-fort': 'locked', '12-6': 'locked', '12-secret': 'locked' });
    /* once: a reload does not play the ending again */
    await page.reload();
    await ready(page);
    await page.locator('#startBtn').click({ force: true });
    expect(await settle(page)).toMatchObject({ world: 12, at: 0 });
    expect((await k11<CutS>(page, '(k) => k.cut()')).on).toBe(false);
    expect(errors).toEqual([]);
  });

  test('?world=13 opens Japan with its first level ready: on a fresh save, on a save that has played (nothing lost), and on one further along', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = watchErrors(page);
    const open = async (n: number): Promise<MapS> => {
      await page.goto(`${BASE}?devtools=1&world=${n}`);
      await ready(page);
      await page.waitForFunction((w) => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && s.world === w; }, n, { timeout: 30_000 });
      return settle(page);
    };
    /* a fresh save (nothing on this device) */
    const s0 = await open(13);
    expect(s0).toMatchObject({ world: 13, at: 0 });
    expect(s0.stops[0]).toMatchObject({ id: '13-1', built: true, state: 'open' });
    expect(new URL(page.url()).searchParams.get('world'), 'the link is used once').toBeNull();
    const p0 = await progress(page);
    for (const id of ['1-1', '11-castle', '12-1', '12-castle']) expect(p0.levelsBeaten[id], id).toBe(1);
    expect(p0.levelsBeaten['13-1']).toBeUndefined();
    expect((await k11<CutS>(page, '(k) => k.cut()')).on, 'no cutscene').toBe(false);
    /* the same for India, Mexico and France */
    for (const n of [12, 14, 15]) {
      await page.evaluate(() => localStorage.clear());
      const s = await open(n);
      expect(s, `?world=${n}`).toMatchObject({ world: n, at: 0 });
      expect(s.stops[0], `?world=${n}`).toMatchObject({ id: `${n}-1`, state: 'open' });
    }
    /* a save that has played (World 3, candles, pets): it keeps all of it and Japan opens */
    await page.evaluate((k) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify({ unlocked: 1, beaten: [], introSeen: true, wallet: 77, totalCandles: 90,
      levelsBeaten: { '1-1': 1, '1-2': 1, '3-4': 1 }, goldenCandles: { '1-1': 1 }, pets: { ids: ['cat1', 'dog1'], names: { cat1: 'Ginger' }, equippedCat: 'cat1', equippedDog: 'dog1' }, wmap: { w: 3, at: 3 } })); }, CURRENT);
    const s1 = await open(13);
    expect(s1).toMatchObject({ world: 13, at: 0 });
    expect(s1.stops[0]).toMatchObject({ id: '13-1', state: 'open' });
    const p1 = await progress(page);
    expect(p1).toMatchObject({ wallet: 77, pets: { ids: ['cat1', 'dog1'] } });
    expect(p1.levelsBeaten['3-4']).toBe(1);
    /* further along (in Mexico, Japan beaten): Japan's map opens, nothing is undone */
    await page.evaluate((k) => { const d = JSON.parse(localStorage.getItem(k)!); for (const id of ['13-1', '13-2', '13-castle', '14-1']) d.levelsBeaten[id] = 1; d.wmap = { w: 14, at: 1 }; localStorage.setItem(k, JSON.stringify(d)); }, CURRENT);
    const s2 = await open(13);
    expect(s2).toMatchObject({ world: 13, at: 0 });
    expect(s2.stops[0]).toMatchObject({ id: '13-1', state: 'beaten' });
    const p2 = await progress(page);
    for (const id of ['13-1', '13-2', '13-castle', '14-1']) expect(p2.levelsBeaten[id], id).toBe(1);
    expect(p2.wallet).toBe(77);
    /* a reload (the address has no ?world now) keeps where Kinan walked to */
    await k11(page, '(k) => k.mapGo(1)');
    expect((await settle(page)).at).toBe(1);
    await page.reload();
    await ready(page);
    expect((await progress(page)).wmap).toEqual({ w: 13, at: 1 });
    expect(errors).toEqual([]);
  });

  test('the 3D bonus stop past the 11-castle still opens 3D Saskatoon: the sneak peek with its four levels, and BACK comes out on the bonus stop', async ({ page }) => {
    test.setTimeout(300_000);   /* software WebGL draws the 3D map slowly */
    const errors = watchErrors(page);
    await seed(page, `({ introSeen: true, beltSeen: 11, blackBelt: true, endingSeen: true, glitchyTeam: true, worldsName: true, escapes: ${ESCAPES},
      levelsBeaten: ${BEATEN_W11()}, unlockedLevels: ${SECRETS_W11}, bonus3d: { beaten: { '12-5': 1 }, unlocked: [] }, bonus3dMoved: true, wmap: { w: 11, at: 11 } })`);
    await page.locator('#startBtn').click({ force: true });
    expect(await settle(page)).toMatchObject({ world: 11, at: 11 });
    await page.locator('#owPlay').click();
    await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.bonus && s.three && s.threeReady; }, null, { timeout: 150_000 });
    const s = await mapState(page);
    expect(s.world).toBe(12);
    expect(s.stops.map((q) => [q.id, q.built, q.state])).toEqual([
      ['12-1', false, 'open'], ['12-2', false, 'open'], ['12-3', false, 'open'], ['12-4', true, 'open'], ['12-5', true, 'beaten'], ['12-fort', true, 'open'],
      ['12-6', true, 'open'], ['12-7', false, 'open'], ['12-secret', false, 'open'], ['12-8', false, 'open'], ['12-castle', false, 'open']]);
    await expect(page.locator('#owHost .k3-peek')).toContainText('SNEAK PEEK');
    await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return !s.walking; }, null, { timeout: 30_000 });
    expect((await progress(page)).wmap).toEqual({ w: 11, at: 11, b: 0 });
    /* BACK (◀ from its first stop): out on the bonus stop of World 11's map */
    /* (the 3D map takes ◀ once its fly-in is done: asked again until it leaves, and only while it is up) */
    await expect.poll(() => k11<number | null>(page, '(k) => { if (window.KINAN3D && KINAN3D.active) k.mapGo(-1); return k.mapState().three ? 12 : k.mapState().world; }'), { timeout: 30_000, intervals: [500] }).toBe(11);
    expect(await settle(page)).toMatchObject({ world: 11, at: 11, bonus: false });
    expect((await progress(page)).wmap).toEqual({ w: 11, at: 11 });
    expect(errors).toEqual([]);
  });
});

import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* The overworld map's seams and World 12 (docs/OVERWORLD-MAP.md): walking off a world's edge crosses
   into the next one (road trips 6.5 and 9.5 included), World 10 glitches into World 11, World 11 plays
   the 2D->3D transition into the 3D map, and a World 12 stop opens its 3D level, which saves its clear
   and comes back to the 3D map. The equipped pets follow Kinan in 3D. */
const BASE = 'http://127.0.0.1:4174/index.html';
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';

type Stop = { name: string; kind: string; id: string | null; built: boolean; state: string | null };
type MapState = { mounted: boolean; busy: boolean; world: number | null; at: number; walking: boolean; crossing: boolean; three: boolean; threeReady: boolean; banner: string | null; notice: string | null; stops: Stop[] };
type K3State = { at: number; ready: boolean; walking: boolean; banner: boolean; intro: number; transition: number | null; transitionDone: boolean; pets: string[] };
type Win = Window & {
  __k11: { mapState: () => MapState; mapWarp: (n: number, at: number) => MapState | null; progress: () => { levelsBeaten: Record<string, number>; wmap: { w: number; at: number } | null } };
  KinanLevels: { ready: boolean; list: () => string[] };
  KINAN: { speed: (v: number) => number };
  KINAN3D?: { state: () => K3State };
  GAME?: { player?: unknown; mode: string; start?: () => void; levelClear: (g: unknown) => void; info: () => { pets: string[]; cleared: boolean } };
};

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
const ready = (page: Page) => page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
const mapState = (page: Page): Promise<MapState> => page.evaluate(() => (window as unknown as Win).__k11.mapState());
async function openMap(page: Page): Promise<MapState> {
  await page.locator('#startBtn').click({ force: true });
  await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy; });
  return mapState(page);
}
async function settle(page: Page, timeout = 60_000): Promise<MapState> {
  await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.walking && !s.crossing && !s.busy && !s.banner; }, null, { timeout });
  return mapState(page);
}
/* a save where every level file is beaten (so every trail is open), standing on a given stop */
async function standOn(page: Page, at: { w: number; at: number }, extra: Record<string, unknown> = {}): Promise<void> {
  await page.goto(DEV_URL);
  await ready(page);
  await page.evaluate(({ key, at, extra }) => {
    const ids = (window as unknown as Win).KinanLevels.list();
    localStorage.setItem(key, JSON.stringify(Object.assign({ unlocked: 1, beaten: [], levelsBeaten: Object.fromEntries(ids.map((id) => [id, 1])), wmap: at }, extra)));
  }, { key: CURRENT, at, extra });
  await page.reload();
  await ready(page);
}

test.describe('the map seams: one journey across the worlds', () => {
  test('the road trips: World 6 -> the bus (6.5) -> World 7, and World 9 -> the boat (9.5) -> World 10', async ({ page }) => {
    test.setTimeout(150_000);
    const errors = watchErrors(page);
    await standOn(page, { w: 6, at: 10 });
    expect(await openMap(page)).toMatchObject({ world: 6, at: 10 });
    await page.evaluate(() => (window as unknown as Win).KINAN.speed(6));   /* the trip itself is ~3,500 px of road */
    await page.locator('#owNext').click();
    await expect.poll(async () => (await mapState(page)).world, { timeout: 30_000, intervals: [100] }).toBe(6.5);
    expect(await settle(page, 90_000)).toMatchObject({ world: 7, at: 0 });
    await page.evaluate(() => (window as unknown as Win).__k11.mapWarp(9, 10));
    await settle(page);
    await page.locator('#owNext').click();
    await expect.poll(async () => (await mapState(page)).world, { timeout: 30_000, intervals: [100] }).toBe(9.5);
    expect(await settle(page, 90_000)).toMatchObject({ world: 10, at: 0 });
    expect(await page.evaluate(() => (window as unknown as Win).__k11.progress().wmap)).toEqual({ w: 10, at: 0 });
    /* and back the other way: off World 10's first stop onto the boat, home to World 9 */
    await page.locator('#owPrev').click();
    expect(await settle(page, 90_000)).toMatchObject({ world: 9, at: 10 });
    expect(errors).toEqual([]);
  });

  test('World 10 glitches into World 11; after World 11 the 2D->3D transition plays and the 3D World 12 map mounts with the equipped pets', async ({ page }) => {
    test.setTimeout(150_000);
    const errors = watchErrors(page);
    await standOn(page, { w: 10, at: 10 }, { pets: { ids: ['cat3', 'dog2'], names: {}, equippedCat: 'cat3', equippedDog: 'dog2' } });
    await openMap(page);
    await page.locator('#owNext').click();
    await expect.poll(async () => (await mapState(page)).banner).toBe('WAIT... DID THE WORLD JUST GLITCH?');
    expect(await settle(page)).toMatchObject({ world: 11, at: 0 });
    await page.evaluate(() => (window as unknown as Win).__k11.mapWarp(11, 10));
    await settle(page);
    await page.locator('#owNext').click();
    await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.world === 12 && s.three && s.threeReady; }, null, { timeout: 90_000 });
    const k3 = await page.evaluate(() => (window as unknown as Win).KINAN3D!.state());
    expect(k3.pets).toEqual(['Duchess the cat', 'Hunter the dog']);
    const s = await mapState(page);
    expect(s.stops[0]).toMatchObject({ id: '12-1', built: true, state: 'open' });
    expect(s.stops[1]).toMatchObject({ id: '12-2', built: true, state: 'locked' });
    expect(s.stops[3]).toMatchObject({ id: '12-4', built: false });
    expect(s.stops[10]).toMatchObject({ id: '12-castle', built: true });
    await expect(page.locator('#owHost .k3-wrap canvas')).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as Win).__k11.progress().wmap)).toEqual({ w: 12, at: 0 });
    expect(errors).toEqual([]);
  });

  test('a World 12 stop opens its 3D level (pets along); the clear is saved and BACK TO THE MAP lands on the 3D map with the next stop open', async ({ page }) => {
    test.setTimeout(240_000);   /* software WebGL (headless, 2x pixels on the tablet project) draws the 3D map slowly */
    const errors = watchErrors(page);
    await standOn(page, { w: 12, at: 0 }, { pets: { ids: ['cat2', 'dog1'], names: {}, equippedCat: 'cat2', equippedDog: 'dog1' } });
    await openMap(page);
    await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.three && s.threeReady; }, null, { timeout: 90_000 });
    await page.locator('#owPlay').click();   /* PLAY works as soon as the 3D map is ready (the fly-in may still run) */
    await page.waitForURL(/\/3d\/level-12-1\.html\?level=12-1&id=12-1$/, { timeout: 60_000 });
    await page.waitForFunction(() => { const g = (window as unknown as Win).GAME; return !!(g && g.player); }, null, { timeout: 90_000 });
    expect((await page.evaluate(() => (window as unknown as Win).GAME!.info().pets))).toEqual(['cat2', 'dog1']);
    /* the level's own goal calls levelClear: here it is called directly (the 3D levels have their own play tests) */
    await page.evaluate(() => { const g = (window as unknown as Win).GAME!; if (g.mode === 'title' && g.start) g.start(); g.levelClear({ def: { yaw: 0 } }); });
    const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}').levelsBeaten, CURRENT);
    expect(saved['12-1']).toBe(1);
    await expect(page.locator('#clear.on #btn-map')).toBeVisible({ timeout: 10_000 });
    await page.locator('#btn-map').click();
    await page.waitForURL(/\/index\.html\?devtools=1$/, { timeout: 30_000 });   /* back to the page it came from */
    await ready(page);
    await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.world === 12 && s.three && s.threeReady; }, null, { timeout: 90_000 });
    const s = await mapState(page);
    expect(s.at).toBe(0);
    expect(s.stops[0]).toMatchObject({ id: '12-1', state: 'beaten' });
    expect(s.stops[1]).toMatchObject({ id: '12-2', state: 'open' });
    /* the backup-first rule held: the previous good record is the backup */
    const backup = await page.evaluate((k) => JSON.parse(localStorage.getItem(k + '-backup') || 'null'), CURRENT);
    expect(backup && typeof backup.unlocked).toBe('number');
    expect(errors).toEqual([]);
  });
});

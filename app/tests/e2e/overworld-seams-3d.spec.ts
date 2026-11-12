import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* The overworld map's seams and the 3D map (docs/OVERWORLD-MAP.md): walking off a world's edge crosses
   into the next one (road trips 6.5 and 9.5 included), World 10 glitches into World 11, the bonus stop past
   the 11-castle plays the 2D->3D transition into 3D Saskatoon (since 2026-11-12, Season 2 in the main game,
   the 3D World 12 is a bonus off the trail: World 12 is India), and a 3D stop opens its 3D level, which saves
   its clear in the bonus's own progress (bonus3d) and comes back to the 3D map. The equipped pets follow
   Kinan in 3D. */
const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';

type Stop = { name: string; kind: string; id: string | null; built: boolean; state: string | null };
type MapState = { mounted: boolean; busy: boolean; world: number | null; at: number; walking: boolean; crossing: boolean; three: boolean; threeReady: boolean; banner: string | null; notice: string | null; stops: Stop[] };
type K3State = { at: number; ready: boolean; walking: boolean; banner: boolean; intro: number; transition: number | null; transitionDone: boolean; pets: string[] };
type Win = Window & {
  __k11: { mapState: () => MapState; mapWarp: (n: number, at: number) => MapState | null; progress: () => { levelsBeaten: Record<string, number>; wmap: { w: number; at: number; b?: number } | null } };
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
async function standOn(page: Page, at: { w: number; at: number; b?: number }, extra: Record<string, unknown> = {}): Promise<void> {
  await page.goto(DEV_URL);
  await ready(page);
  /* 2026-11-12: the build releases all 15 worlds; bonus3dFull(true) is the developer view of all eleven 3D stops (walked in order);
     the live sneak peek (four stops) is w12-preview.spec.ts */
  expect(await page.evaluate(() => (window as unknown as { __k11: { bonus3dFull: (on: boolean) => boolean } }).__k11.bonus3dFull(true))).toBe(true);
  await page.evaluate(({ key, at, extra }) => {
    const ids = (window as unknown as Win).KinanLevels.list();
    localStorage.setItem(key, JSON.stringify(Object.assign({ unlocked: 1, beaten: [], bonus3dMoved: true, levelsBeaten: Object.fromEntries(ids.map((id) => [id, 1])), wmap: at }, extra)));   /* bonus3dMoved: a save of this version (India's 12-* clears stay India's) */
  }, { key: CURRENT, at, extra });
  await page.reload();
  await ready(page);
}

test.describe('the map seams: one journey across the worlds', () => {
  test('the road trips: World 6 -> the bus (6.5) -> World 7, and World 9 -> the boat (9.5) -> World 10', async ({ page }) => {
    test.setTimeout(150_000);
    const errors = watchErrors(page);
    /* 2026-10-29 (taekwondo): a save with castles beaten and no belt seen gets Sabumnim's catch-up scene as the map
       opens (taekwondo.spec.ts covers it); this test is about the roads, so its player has already seen the belts
       (on WebKit the scene held the first ▶ click for ~29 s of the 150 s) */
    await standOn(page, { w: 6, at: 10 }, { beltSeen: 12 });
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

  test('World 10 glitches into World 11; the bonus stop past the 11-castle plays the 2D->3D transition and the 3D map mounts with the equipped pets', async ({ page }) => {
    test.setTimeout(150_000);
    const errors = watchErrors(page);
    await standOn(page, { w: 10, at: 10 }, { pets: { ids: ['cat3', 'dog2'], names: {}, equippedCat: 'cat3', equippedDog: 'dog2' } });
    await openMap(page);
    await page.locator('#owNext').click();
    await expect.poll(async () => (await mapState(page)).banner).toBe('WAIT... DID THE WORLD JUST GLITCH?');
    expect(await settle(page)).toMatchObject({ world: 11, at: 0 });
    await page.evaluate(() => (window as unknown as Win).__k11.mapWarp(11, 10));
    await settle(page);
    await page.locator('#owNext').click();   /* on from the castle: the bonus stop */
    expect(await settle(page)).toMatchObject({ world: 11, at: 11 });
    expect((await mapState(page)).stops[11]).toMatchObject({ kind: 'bonus', state: 'open' });
    await page.locator('#owPlay').click();
    await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.world === 12 && s.three && s.threeReady; }, null, { timeout: 90_000 });
    const k3 = await page.evaluate(() => (window as unknown as Win).KINAN3D!.state());
    expect(k3.pets).toEqual(['Duchess the cat', 'Hunter the dog']);
    const s = await mapState(page);
    expect(s.stops[0]).toMatchObject({ id: '12-1', built: true, state: 'open' });
    expect(s.stops[1]).toMatchObject({ id: '12-2', built: true, state: 'locked' });
    /* the rough-draft side levels (12-4, 12-5, the fort, 12-6, 12-7, the secret, 12-8: w12-levels-draft.spec.ts) are all built now */
    expect(s.stops[3]).toMatchObject({ id: '12-4', built: true });
    expect(s.stops[4]).toMatchObject({ id: '12-5', built: true });
    expect(s.stops[5]).toMatchObject({ id: '12-fort', built: true });
    expect(s.stops[6]).toMatchObject({ id: '12-6', built: true });
    expect(s.stops[7]).toMatchObject({ id: '12-7', built: true });
    expect(s.stops[8]).toMatchObject({ id: '12-secret', built: true, state: 'locked' });   /* the secret is built too; it stays closed until the painting in 12-7 has been walked into */
    expect(s.stops[9]).toMatchObject({ id: '12-8', built: true });
    expect(s.stops[10]).toMatchObject({ id: '12-castle', built: true });
    await expect(page.locator('#owHost .k3-wrap canvas')).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as Win).__k11.progress().wmap)).toEqual({ w: 11, at: 11, b: 0 });
    expect(errors).toEqual([]);
  });

  test('a 3D stop opens its 3D level (pets along); the clear is saved and BACK TO THE MAP lands on the 3D map with the next stop open', async ({ page }) => {
    test.setTimeout(240_000);   /* software WebGL (headless, 2x pixels on the tablet project) draws the 3D map slowly */
    const errors = watchErrors(page);
    await standOn(page, { w: 11, at: 11, b: 0 }, { pets: { ids: ['cat2', 'dog1'], names: {}, equippedCat: 'cat2', equippedDog: 'dog1' } });
    await openMap(page);
    await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.three && s.threeReady; }, null, { timeout: 90_000 });
    await page.locator('#owPlay').click();   /* PLAY works as soon as the 3D map is ready (the fly-in may still run) */
    /* 2026-10-30 (the World 12 sneak peek): this is the developer view (all of 3D Saskatoon in this tab by bonus3dFull(true), so every stop
       opens its level); the map carries ?devtools=1 on to the 3D page, which opens any level only then. What the live site opens,
       and what it refuses, is in w12-preview.spec.ts */
    await page.waitForURL(/\/3d\/level-12-1\.html\?level=12-1&id=12-1&devtools=1$/, { timeout: 60_000 });
    await page.waitForFunction(() => { const g = (window as unknown as Win).GAME; return !!(g && g.player); }, null, { timeout: 90_000 });
    expect((await page.evaluate(() => (window as unknown as Win).GAME!.info().pets))).toEqual(['cat2', 'dog1']);
    /* the level's own goal calls levelClear: here it is called directly (the 3D levels have their own play tests) */
    await page.evaluate(() => { const g = (window as unknown as Win).GAME!; if (g.mode === 'title' && g.start) g.start(); g.levelClear({ def: { yaw: 0 } }); });
    const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}'), CURRENT);
    expect(saved.bonus3d.beaten['12-1'], "in the 3D bonus's own progress").toBe(1);
    expect(saved.levelsBeaten['12-1'], "India's 12-1 is untouched (the save had it beaten already: still 1, not removed)").toBe(1);
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

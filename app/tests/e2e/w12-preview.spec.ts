import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* THE WORLD 12 SNEAK PEEK (Shad's decision, 2026-10-30): exactly four World 12 levels are playable on the live site:
   12-4 THE WEIR RAPIDS, 12-5 THE BROADWAY BRIDGE ARCHES, FORT DOWNTOWN SKYLINE (12-fort) and 12-6 KINSMEN PARK RIDES.
   Every other World 12 stop (12-1, 12-2, 12-3, 12-7, the secret, 12-8, the Bessborough castle) says "coming soon".
   The Bessborough festival, the finale and the memory gallery stay hidden; developer mode (?devtools=1) reaches everything.
   OW_RELEASED stays 11. Most of this runs the way the live site runs: no ?devtools=1 (so no __k11 hooks), only the public
   window.KINAN map API. (c1-cutscenes.spec.ts: the sign past the 11-castle; w11-world.spec.ts: the ending walks on.) */
const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const level3d = (q: string) => new URL(`3d/level-12-1.html?${q}`, BASE).href;

const PREVIEW = ['12-4', '12-5', '12-fort', '12-6'];
const TITLES: Record<string, string> = { '12-4': 'THE WEIR RAPIDS', '12-5': 'THE BROADWAY BRIDGE ARCHES', '12-fort': 'FORT: DOWNTOWN SKYLINE', '12-6': 'KINSMEN PARK RIDES' };
/* the eleven stops in map order: the four open ones, then everything else behind "coming soon" */
const STOPS = ['12-1', '12-2', '12-3', '12-4', '12-5', '12-fort', '12-6', '12-7', '12-secret', '12-8', '12-castle'];

type Stop = { name: string; kind: string; id: string | null; built: boolean; state: string | null };
type MapState = { mounted: boolean; busy: boolean; world: number | null; at: number; walking: boolean; three: boolean; threeReady: boolean; banner: string | null; stops: Stop[] };
type Game = { ready: boolean; mode: string; candles: number; player: unknown; start: () => void; levelClear: (g: unknown) => void };
type Win = Window & {
  KinanLevels: { ready: boolean; list: () => string[] }; KINAN: { state: () => MapState & { gatePeek: boolean }; warp: (n: number, at: number) => MapState | null; play: () => void };
  KINAN3D?: { state: () => { banner: boolean; ready: boolean } }; GAME?: Game;
  __k11?: { ending: () => { peek: string; peekOn: boolean }; endingPlay: () => boolean; cut: () => { on: boolean; ending: { beat: number; beats: string[]; t: number; peek: boolean } | null }; cutSpeed: (n: number) => number; cutSkip: () => unknown; owRelease: (n: number) => number };
};

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
/* a list written as `const W12_PREVIEW = ['12-4', ...]` in a source file */
const previewList = (file: string): string[] | null => {
  const m = /const W12_PREVIEW = \[([^\]]*)\]/.exec(readFileSync(`${ROOT}${file}`, 'utf8'));
  return m ? [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) : null;
};

test.describe('World 12 sneak peek · the files', () => {
  test('the preview list is the same in the game and on the 3D page, OW_RELEASED stays 11, and the cache carries what the preview needs', () => {
    expect(previewList('index.html'), 'W12_PREVIEW in index.html').toEqual(PREVIEW);
    expect(previewList('3d/js/main.js'), 'W12_PREVIEW in 3d/js/main.js').toEqual(PREVIEW);
    expect(readFileSync(`${ROOT}index.html`, 'utf8')).toContain('const OW_RELEASED = 11;');
    const sw = readFileSync(`${ROOT}sw.js`, 'utf8');
    expect(sw, 'the cache name was bumped for the sneak peek').toContain("const CACHE = 'kinan-vs-mom-v55';");
    for (const f of ['3d/level-12-1.html', '3d/js/main.js', '3d/js/side.js', '3d/js/props-city.js', '3d/js/props-festival.js', '3d/assets/models.js', ...PREVIEW.map((id) => `3d/levels/${id}.js`)]) expect(sw, `${f} is cached`).toContain(`./${f}`);
  });
});

test.describe('World 12 sneak peek · the live 3D page', () => {
  test('it opens the four sneak-peek levels; every other World 12 level, by any address, says coming soon and never loads its file', async ({ page }) => {
    test.setTimeout(150_000);
    const errors = watchErrors(page);
    const requested: string[] = [];
    page.on('request', (r) => { const m = /\/3d\/levels\/([\w-]+)\.js/.exec(r.url()); if (m) requested.push(m[1]); });
    /* the four: the title card names the level (the page went on to load it) */
    for (const id of PREVIEW) {
      await page.goto(level3d(`level=${id}&id=${id}`));
      await expect(page.locator('#titlecard h1'), `${id} opens`).toHaveText(TITLES[id], { timeout: 60_000 });
      expect(requested, `${id}'s file was loaded`).toContain(id);
    }
    /* everything else, however the address is written: a friendly page, no level file asked for, nothing saved */
    requested.length = 0;
    const blocked = ['level=12-castle', 'level=12-castle&id=12-castle', 'level=12-1&id=12-1', 'level=12-2&id=12-2', 'level=12-3&id=12-3', 'level=12-7&id=12-7', 'level=12-secret&id=12-secret',
      'level=12-8&id=12-8', 'level=12-arena&id=12-castle', 'level=12-3-side', 'level=12-4&id=12-castle', 'level=12-castle&id=12-4', 'level=12-castle&devtools=true', 'level=12-castle&devtools=0', ''];
    for (const q of blocked) {
      await page.goto(level3d(q));
      await expect(page.locator('#loading p'), q).toContainText('COMING SOON');
      await expect(page.locator('#loading p')).toContainText('sneak peek');
      await expect(page.locator('#btn-soon')).toBeVisible();
      expect(await page.evaluate(() => !!(window as unknown as Win).GAME), `${q}: no game was started`).toBe(false);
      expect(await page.evaluate(() => document.getElementById('titlecard')!.classList.contains('on')), `${q}: no title card`).toBe(false);
    }
    expect(requested, 'no blocked level file was ever requested').toEqual([]);
    expect(await page.evaluate((k) => localStorage.getItem(k), CURRENT), 'nothing was saved').toBeNull();
    /* the button leads back to the game */
    await page.goto(level3d('level=12-castle&id=12-castle'));
    await page.locator('#btn-soon').click();
    await page.waitForURL(/\/index\.html$/, { timeout: 30_000 });
    expect(errors).toEqual([]);
  });

  test('developer mode (?devtools=1, localhost) still opens every World 12 level, the Bessborough festival included', async ({ page }) => {
    test.setTimeout(90_000);
    for (const [id, title] of [['12-castle', 'THE BESSBOROUGH BIRTHDAY FESTIVAL'], ['12-1', "KINAN'S 3D HOUSE"], ['12-7', 'THE ART GALLERY']] as const) {
      await page.goto(level3d(`level=${id}&id=${id}&devtools=1`));
      await expect(page.locator('#titlecard h1'), `${id} opens in developer mode`).toHaveText(title, { timeout: 60_000 });
    }
  });
});

test.describe('World 12 sneak peek · the game', () => {
  test('the title still counts 11 worlds and the Memory gallery button stays hidden until World 12 is released', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(BASE);
    await page.waitForFunction(() => !!(window as unknown as Win).KinanLevels?.ready);
    expect(await page.evaluate(() => (window as unknown as Win).__k11), 'the live page has no developer hooks').toBeUndefined();
    await expect(page.locator('#saveNote')).toContainText('11 worlds');
    await page.locator('#titleMenuBtn').click();
    await expect(page.locator('#menu')).toBeVisible();
    await expect(page.locator('#galleryBtn')).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('World 12 opens as a sneak peek: the four levels are open from the start in any order, every other stop is coming soon and safe, a clear saves its candles, and the map says more is coming', async ({ page }) => {
    test.setTimeout(420_000);   /* software WebGL draws the 3D map and a 3D level slowly */
    const errors = watchErrors(page);
    await page.goto(BASE);
    await page.waitForFunction(() => !!(window as unknown as Win).KinanLevels?.ready);
    /* a player who beat World 1-11 (the 11-castle included) and nothing in World 12, with 5 candles in the wallet, standing on World 12's first stop */
    await page.evaluate((key) => {
      const ids = (window as unknown as Win).KinanLevels.list().filter((id) => Number(id.split('-')[0]) <= 11);
      localStorage.setItem(key, JSON.stringify({ unlocked: 1, beaten: [], introSeen: true, beltSeen: 12, endingSeen: true, glitchyTeam: true, worldsName: true, wallet: 5, totalCandles: 5,
        escapes: { 10: 1 }, unlockedLevels: ['10-secret', '11-secret'], levelsBeaten: Object.fromEntries(ids.map((id) => [id, 1])), wmap: { w: 12, at: 0 } }));
    }, CURRENT);
    await page.reload();
    await page.waitForFunction(() => !!(window as unknown as Win).KinanLevels?.ready);
    await page.locator('#startBtn').click({ force: true });
    await page.waitForFunction(() => { const s = (window as unknown as Win).KINAN?.state(); return !!s && s.mounted && s.world === 12 && s.three && s.threeReady; }, null, { timeout: 150_000 });
    const state = () => page.evaluate(() => (window as unknown as Win).KINAN.state());
    const calm = () => page.waitForFunction(() => { const k = (window as unknown as Win).KINAN3D!.state(); return k.ready && !k.banner; }, null, { timeout: 30_000 });
    const home = page.url();

    /* the map: the four are open (and none was walked to or beaten first), every other stop is built:false, nothing is locked */
    const s0 = await state();
    expect(s0.stops.map((q) => q.id)).toEqual(STOPS);
    expect(s0.stops.map((q) => [q.id, q.built])).toEqual(STOPS.map((id) => [id, PREVIEW.includes(id)]));
    expect(s0.stops.map((q) => q.state), 'all open, none beaten, none locked').toEqual(STOPS.map(() => 'open'));
    await expect(page.locator('#owHost .k3-peek'), 'the map says it is a sneak peek and more is coming').toContainText('SNEAK PEEK');
    await expect(page.locator('#owHost .k3-peek')).toContainText('MORE IS COMING');

    /* every other stop: PLAY says COMING SOON, and nothing launches */
    for (const id of STOPS.filter((s) => !PREVIEW.includes(s))) {
      await page.evaluate((i) => (window as unknown as Win).KINAN.warp(12, i), STOPS.indexOf(id));
      await calm();
      await page.evaluate(() => (window as unknown as Win).KINAN.play());
      await expect(page.locator('#owHost .k3-ban'), `${id} is coming soon`).toHaveText('COMING SOON!');
      expect(page.url(), `${id} launched nothing`).toBe(home);
      await expect(page.locator('#stage')).toBeHidden();
    }

    /* 12-6 first, with 12-4, 12-5 and the fort unbeaten: it opens its level */
    await page.evaluate(() => (window as unknown as Win).KINAN.warp(12, 6));
    await calm();
    await page.evaluate(() => (window as unknown as Win).KINAN.play());
    await page.waitForURL(/\/3d\/level-12-1\.html\?level=12-6&id=12-6$/, { timeout: 60_000 });
    await expect(page.locator('#titlecard h1')).toHaveText('KINSMEN PARK RIDES', { timeout: 60_000 });
    await page.waitForFunction(() => { const g = (window as unknown as Win).GAME; return !!(g && g.ready && g.player); }, null, { timeout: 200_000 });
    /* seven candles picked up, then the goal: the clear and the candles are saved */
    await page.evaluate(() => { const g = (window as unknown as Win).GAME!; if (g.mode === 'title') g.start(); g.candles = 7; g.levelClear({ def: { yaw: 0 } }); });
    const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}'), CURRENT);
    expect(saved.levelsBeaten['12-6'], 'the clear').toBe(1);
    expect(saved.levelsBeaten['12-4'], 'nothing else was beaten').toBeUndefined();
    expect([saved.wallet, saved.totalCandles], 'the 7 candles join the 5 in the wallet').toEqual([12, 12]);
    await expect(page.locator('#clear.on #btn-map')).toBeVisible({ timeout: 15_000 });
    await page.locator('#btn-map').click();
    await page.waitForURL(/\/index\.html$/, { timeout: 30_000 });

    /* back on World 12's 3D map: 12-6 beaten, the other three still open, the wallet counted, the sign still up */
    await page.waitForFunction(() => { const s = (window as unknown as Win).KINAN?.state(); return !!s && s.mounted && s.world === 12 && s.three && s.threeReady; }, null, { timeout: 150_000 });
    const s1 = await state();
    expect(s1.at).toBe(6);
    expect(s1.stops.map((q) => q.state)).toEqual(STOPS.map((id) => (id === '12-6' ? 'beaten' : 'open')));
    await expect(page.locator('#owHost .k3-hr')).toContainText('12');
    await expect(page.locator('#owHost .k3-peek')).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe('World 12 sneak peek · the World 11 ending', () => {
  test('TO BE CONTINUED is followed by the sneak-peek card, which appears once the words have typed out, and only while the sneak peek is on', async ({ page }) => {
    test.setTimeout(150_000);
    const errors = watchErrors(page);
    await page.goto(DEV_URL);
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    const info = await page.evaluate(() => (window as unknown as Win).__k11!.ending());
    expect(info.peek).toBe('WORLD 12 SNEAK PEEK: Four levels of 3D Saskatoon are open now. Much more is coming!');
    expect(info.peekOn).toBe(true);
    /* the card's pixels: bright text where the card goes (under TO BE CONTINUED), dark before it appears */
    const bright = () => page.evaluate(() => { const d = (document.getElementById('cutCv') as HTMLCanvasElement).getContext('2d')!.getImageData(100, 148, 232, 48).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 150 || d[i + 1] > 150) n++; return n; });
    await page.evaluate(() => { const k = (window as unknown as Win).__k11!; k.cutSpeed(12); k.endingPlay(); });
    await page.waitForFunction(() => { const k = (window as unknown as Win).__k11!, c = k.cut(); if (c.on && c.ending && c.ending.beats[c.ending.beat] === 'tbc') { k.cutSpeed(1); return true; } return false; }, null, { timeout: 60_000, polling: 'raf' });
    const early = await page.evaluate(() => (window as unknown as Win).__k11!.cut().ending!);
    expect(early.t, 'sampled early in TO BE CONTINUED').toBeLessThan(2500);
    expect(await bright(), 'no card before the words have typed out').toBe(0);
    await page.waitForFunction(() => (window as unknown as Win).__k11!.cut().ending!.t > 4400, null, { timeout: 30_000 });
    expect(await bright(), 'the card is on the picture').toBeGreaterThan(200);
    expect((await page.evaluate(() => (window as unknown as Win).__k11!.cut().ending!)).peek).toBe(true);
    /* World 12 released (developer view): no sneak-peek card in the ending */
    await page.evaluate(() => (window as unknown as Win).__k11!.cutSpeed(12));
    for (let i = 0; i < 80 && (await page.evaluate(() => (window as unknown as Win).__k11!.cut().on)); i++) { await page.evaluate(() => (window as unknown as Win).__k11!.cutSkip()); await page.waitForTimeout(100); }
    expect(await page.evaluate(() => (window as unknown as Win).__k11!.cut().on), 'the first ending was skipped to its end').toBe(false);
    await page.evaluate(() => { const k = (window as unknown as Win).__k11!; k.owRelease(12); k.cutSpeed(12); k.endingPlay(); });
    await page.waitForFunction(() => { const c = (window as unknown as Win).__k11!.cut(); return !c.on && !!c.ending && c.ending.beat >= 6; }, null, { timeout: 90_000 });
    expect((await page.evaluate(() => (window as unknown as Win).__k11!.cut().ending!)).peek, 'no card once World 12 is released').toBe(false);
    expect((await page.evaluate(() => (window as unknown as Win).__k11!.ending())).peekOn).toBe(false);
    expect(errors).toEqual([]);
  });
});

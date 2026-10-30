import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* World 9 extras (Shad, 2026-10-29).
   D  THE TITLE COUNT: the PLAY button of a new save names how many worlds this build lets him play (the released
      worlds, OW_RELEASED), not a fixed "12 worlds", and follows a release by itself; the rest of the line and the
      title's subtitle stay as they were.
   A  ANNIE'S LINK (docs/ANNIE-LINK.md): index.html?world=9&guest=annie opens World 9 on a save of its own (Worlds 1-8
      counted as done, World 9's first stop, the World 9 opening on the first PLAY); a shared device's main save is
      never touched; after the 9-castle the map offers "Play the whole game from World 1", which opens the main save.
   C  MOVE MY SAVE (Menu > Settings): a short code (and a QR code) of the whole save; "Enter a save code" on another
      device copies it in after a confirm step, keeping a backup; a bad code is refused with a friendly message. */
const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
const DEV_URL = `${BASE}?devtools=1`;
const ANNIE_URL = `${BASE}?world=9&guest=annie&devtools=1`;
const MAIN = 'kinan-remaster-v1';
const ANNIE = 'kinan-remaster-annie-v1';
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const HTML = readFileSync(`${ROOT}index.html`, 'utf8');
const RELEASED = Number(/const OW_RELEASED = (\d+);/.exec(HTML)![1]);
const STORY = (() => {
  const c: Record<string, unknown> = {}; c.self = c;
  new Function('self', readFileSync(`${ROOT}audio/lines/lines.js`, 'utf8'))(c);
  return c.KINAN_STORY as { escape: Record<string, string[]> };
})();

type MapState = { mounted: boolean; busy: boolean; world: number | null; at: number; walking: boolean; crossing: boolean; banner: string | null; stops: { id: string | null; state: string | null }[] };
type Dev = {
  mapState: () => MapState; cut: () => { on: boolean; mode: string | null; lines: string[] }; cutSpeed: (n: number) => number;
  progress: () => { introSeen: boolean; wmap: { w: number; at: number } | null; escapes: Record<string, number>; levelsBeaten: Record<string, number> };
  owRelease: (n: number) => number;
};
type Win = Window & { __k11: Dev; KinanLevels: { ready: boolean; list: () => string[] } };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
/* storage written once per test, before the page's own script (a reload keeps what the game saved) */
async function seedStore(page: Page, items: Record<string, unknown>): Promise<void> {
  await page.addInitScript((items) => {
    if (sessionStorage.getItem('x-seeded')) return;
    sessionStorage.setItem('x-seeded', '1');
    for (const k in items) localStorage.setItem(k, JSON.stringify(items[k]));
  }, items);
}
async function ready(page: Page): Promise<void> {
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
}
const mapState = (page: Page): Promise<MapState> => page.evaluate(() => (window as unknown as Win).__k11.mapState());
const progress = (page: Page) => page.evaluate(() => (window as unknown as Win).__k11.progress());
const raw = (page: Page, key: string): Promise<string | null> => page.evaluate((k) => localStorage.getItem(k), key);
async function settle(page: Page, timeout = 45_000): Promise<MapState> {
  await page.waitForFunction(() => { const k = (window as unknown as Win).__k11, s = k.mapState(); return s.mounted && !s.walking && !s.crossing && !s.busy && !s.banner && !k.cut().on; }, null, { timeout });
  return mapState(page);
}
/* the main save of someone who already plays on this device (Kinan's) */
const KINAN_SAVE = { unlocked: 1, beaten: [], introSeen: true, wallet: 37, totalCandles: 37, levelsBeaten: { '1-1': 1, '1-2': 1 }, wmap: { w: 1, at: 2 } };

test.describe('D · the title counts the released worlds', () => {
  test('a new save\'s PLAY button names the released worlds (OW_RELEASED), follows a release by itself, and keeps the rest of the line and the subtitle', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(DEV_URL);
    await ready(page);
    expect(RELEASED).toBe(10);   /* 2026-10-29: World 10 (Niagara Falls) is released (it was 9) */
    await expect(page.locator('#saveNote')).toHaveText(`${RELEASED} worlds · 1 birthday · 4 cats · 2 dogs`);
    await expect(page.locator('#startBtn b')).toHaveText('PLAY · START');
    await expect(page.locator('h1.title .t2')).toHaveText('Birthday Remaster');
    await expect(page.locator('.titleeye')).toHaveText('A birthday game from Shad · Saskatoon, Saskatchewan');
    /* a release (a later build's OW_RELEASED, here a test's owRelease) changes it without a reload */
    expect(await page.evaluate(() => (window as unknown as Win).__k11.owRelease(11))).toBe(11);   /* the next release (it was 10 while 9 were out) */
    await expect(page.locator('#saveNote')).toHaveText('11 worlds · 1 birthday · 4 cats · 2 dogs');
    expect(await page.evaluate(() => (window as unknown as Win).__k11.owRelease(1))).toBe(1);
    await expect(page.locator('#saveNote')).toHaveText('1 world · 1 birthday · 4 cats · 2 dogs');
    expect(await page.evaluate((n) => (window as unknown as Win).__k11.owRelease(n), RELEASED)).toBe(RELEASED);
    await expect(page.locator('#saveNote')).toHaveText(`${RELEASED} worlds · 1 birthday · 4 cats · 2 dogs`);
    /* the same after a reload, and no fixed "12 worlds" anywhere on the title */
    await page.reload();
    await ready(page);
    await expect(page.locator('#saveNote')).toHaveText(`${RELEASED} worlds · 1 birthday · 4 cats · 2 dogs`);
    expect(await page.locator('#screen').innerText()).not.toContain('12 worlds');
    expect(errors).toEqual([]);
  });

  test('a save already on the map still reads "Continue on the world map" (unchanged)', async ({ page }) => {
    const errors = watchErrors(page);
    await seedStore(page, { [MAIN]: KINAN_SAVE });
    await page.goto(DEV_URL);
    await ready(page);
    await expect(page.locator('#saveNote')).toHaveText('Continue on the world map · World 1 · 2 levels cleared');
    await expect(page.locator('#startBtn b')).toHaveText('PLAY · CONTINUE');
    expect(errors).toEqual([]);
  });
});

test.describe('A · Annie\'s link', () => {
  test('?world=9&guest=annie opens World 9 on its own save (Worlds 1-8 done) with the World 9 opening, and the main save is untouched', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    const backup = { ...KINAN_SAVE, wallet: 30 };
    await seedStore(page, { [MAIN]: KINAN_SAVE, [`${MAIN}-backup`]: backup });
    await page.goto(DEV_URL);
    await ready(page);
    const mainBefore = await raw(page, MAIN), backupBefore = await raw(page, `${MAIN}-backup`);
    expect(JSON.parse(mainBefore!)).toMatchObject({ wallet: 37, wmap: { w: 1, at: 2 } });

    await page.goto(ANNIE_URL);
    await ready(page);
    /* her title: a new game that starts in World 9 */
    await expect(page.locator('#startBtn b')).toHaveText('PLAY · START');
    await expect(page.locator('#saveNote')).toHaveText('World 9 · Montreal');
    expect(await page.locator('#screen').innerText()).not.toMatch(/annie/i);   /* a surprise: the screen never names her */
    await page.evaluate(() => (window as unknown as Win).__k11.cutSpeed(6));
    await page.locator('#startBtn').click({ force: true });
    /* the World 9 opening: the camera follows Glitchy across World 9's map with the lines of his train ride into Montreal */
    await expect.poll(async () => { const c = await page.evaluate(() => (window as unknown as Win).__k11.cut()); return c.on ? c.mode : null; }).toBe('intro');
    await expect.poll(async () => (await mapState(page)).world).toBe(9);
    await expect.poll(async () => (await page.evaluate(() => (window as unknown as Win).__k11.cut())).lines[0] ?? null, { timeout: 20_000 }).toBe(STORY.escape['8'][0]);
    const s = await settle(page, 90_000);
    expect(s).toMatchObject({ world: 9, at: 0 });
    expect(s.stops[0].state).toBe('open');
    const p = await progress(page);
    expect(p.introSeen).toBe(true);
    expect(p.wmap).toEqual({ w: 9, at: 0 });
    /* Worlds 1-8 counted as done: every level file of those worlds is beaten on her save, none of World 9's */
    const ids = await page.evaluate(() => (window as unknown as Win).KinanLevels.list());
    const w18 = ids.filter((id) => Number(id.split('-')[0]) <= 8);
    expect(w18.length).toBe(88);
    expect(w18.filter((id) => !p.levelsBeaten[id])).toEqual([]);
    expect(Object.keys(p.levelsBeaten).filter((id) => id.startsWith('9-'))).toEqual([]);
    for (let w = 1; w <= 8; w++) expect(p.escapes[w], `World ${w}'s escape`).toBe(1);
    /* her own save holds it; the main save and its backup are exactly as they were */
    const annie = JSON.parse((await raw(page, ANNIE))!);
    expect(annie).toMatchObject({ introSeen: true, wmap: { w: 9, at: 0 } });
    expect(Object.keys(annie.levelsBeaten).length).toBe(88);
    expect(await raw(page, MAIN)).toBe(mainBefore);
    expect(await raw(page, `${MAIN}-backup`)).toBe(backupBefore);
    /* no offer before the 9-castle */
    await expect(page.locator('#guestOffer')).toHaveCount(0);
    /* the opening is once: the link again goes straight to the map, still on World 9's first stop */
    await page.reload();
    await ready(page);
    await expect(page.locator('#startBtn b')).toHaveText('PLAY · CONTINUE');
    await page.locator('#startBtn').click({ force: true });
    expect(await settle(page)).toMatchObject({ world: 9, at: 0 });
    expect(await page.evaluate(() => (window as unknown as Win).__k11.cut().lines.length)).toBe(0);
    /* and the normal game still opens the main save, as it was */
    await page.goto(DEV_URL);
    await ready(page);
    expect(await progress(page)).toMatchObject({ wmap: { w: 1, at: 2 }, levelsBeaten: { '1-1': 1, '1-2': 1 } });
    await expect(page.locator('#saveNote')).toHaveText('Continue on the world map · World 1 · 2 levels cleared');
    expect(await raw(page, MAIN)).toBe(mainBefore);
    expect(errors).toEqual([]);
  });

  test('after the 9-castle Annie\'s map offers "Play the whole game from World 1", which opens the main save; the normal game never shows it', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await seedStore(page, { [MAIN]: KINAN_SAVE });
    await page.goto(ANNIE_URL);
    await ready(page);
    /* her save with World 9 finished too: every World 1-9 level, the escapes and belts seen, back on the 9-castle */
    await page.evaluate((key) => {
      const ids = (window as unknown as Win).KinanLevels.list().filter((id) => Number(id.split('-')[0]) <= 9);
      localStorage.setItem(key, JSON.stringify({ unlocked: 1, beaten: [], introSeen: true, beltSeen: 9, escapes: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1 }, levelsBeaten: Object.fromEntries(ids.map((id) => [id, 1])), wmap: { w: 9, at: 10 } }));
    }, ANNIE);
    const mainBefore = await raw(page, MAIN);
    await page.reload();
    await ready(page);
    await page.locator('#startBtn').click({ force: true });
    expect(await settle(page)).toMatchObject({ world: 9, at: 10 });
    const offer = page.locator('#guestOffer');
    await expect(offer).toBeVisible();
    await expect(offer).toContainText('You beat World 9!');
    const btn = page.locator('#guestWholeBtn');
    await expect(btn).toHaveText('▶ Play the whole game from World 1');
    /* it sits inside the map picture */
    const box = (await offer.boundingBox())!, map = (await page.locator('#owHost .km-screen').boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(map.x); expect(box.x + box.width).toBeLessThanOrEqual(map.x + map.width + 1);
    expect(box.y).toBeGreaterThanOrEqual(map.y); expect(box.y + box.height).toBeLessThanOrEqual(map.y + map.height + 1);
    expect(await raw(page, MAIN)).toBe(mainBefore);
    await btn.click();
    /* the same game without the link's two words, on the main save */
    await page.waitForURL((u) => !u.search.includes('guest') && !u.search.includes('world='));
    await ready(page);
    expect(new URL(page.url()).search).toBe('?devtools=1');
    expect(await progress(page)).toMatchObject({ wmap: { w: 1, at: 2 }, levelsBeaten: { '1-1': 1, '1-2': 1 } });
    expect(await raw(page, MAIN)).toBe(mainBefore);   /* exactly as it was, until the main game itself saves */
    await page.locator('#startBtn').click({ force: true });
    expect(await settle(page)).toMatchObject({ world: 1, at: 2 });
    await expect(page.locator('#guestOffer')).toHaveCount(0);
    /* the main game saves its own spot as the map opens: still Kinan's game, nothing of Annie's in it */
    const main = JSON.parse((await raw(page, MAIN))!);
    expect(main).toMatchObject({ wallet: 37, wmap: { w: 1, at: 2 } });
    expect(main.levelsBeaten).toEqual({ '1-1': 1, '1-2': 1 });
    expect(errors).toEqual([]);
  });

  test('the main game with World 9 beaten never shows the offer, and either word alone is the normal game', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(DEV_URL);
    await ready(page);
    await page.evaluate((key) => {
      const ids = (window as unknown as Win).KinanLevels.list().filter((id) => Number(id.split('-')[0]) <= 9);
      localStorage.setItem(key, JSON.stringify({ unlocked: 1, beaten: [], introSeen: true, beltSeen: 9, escapes: { 9: 1 }, levelsBeaten: Object.fromEntries(ids.map((id) => [id, 1])), wmap: { w: 9, at: 10 } }));
    }, MAIN);
    for (const url of [DEV_URL, `${BASE}?guest=annie&devtools=1`, `${BASE}?world=9&devtools=1`]) {
      await page.goto(url);
      await ready(page);
      await page.locator('#startBtn').click({ force: true });
      expect(await settle(page), url).toMatchObject({ world: 9, at: 10 });
      await expect(page.locator('#guestOffer')).toHaveCount(0);
      expect(await raw(page, ANNIE), url).toBeNull();
    }
    expect(errors).toEqual([]);
  });
});

/* a well-played save: much of it is not what a new save has (so the code has something to carry), with a name that
   is not plain ASCII */
const RICH_SAVE = {
  unlocked: 1, beaten: [], introSeen: true, wallet: 412, totalCandles: 530, beltSeen: 3, hat: 'party', kickLearned: true,
  levelsBeaten: { '1-1': 1, '1-2': 1, '1-3': 1, '1-4': 1, '1-5': 1, '1-fort': 1, '1-6': 1, '1-7': 1, '1-8': 1, '1-castle': 1, '2-1': 1, '2-2': 1, '2-3': 1, '2-4': 1, '2-5': 1, '2-fort': 1, '2-6': 1, '2-7': 1, '2-8': 1, '2-castle': 1, '3-1': 1, '3-2': 1, '3-3': 1 },
  goldenCandles: { '1-1': 1, '1-3': 1, '2-2': 1 }, unlockedLevels: ['1-secret'], escapes: { 1: 1, 2: 1 },
  pets: { ids: ['cat1', 'dog1', 'cat2'], names: { cat1: 'Mittens ✨', dog1: 'Biscuit' }, equippedCat: 'cat2', equippedDog: 'dog1' },
  storyHeard: { w01_kinan_01: 1, w01_mom_12: 1, w02_robin_01: 1 }, vol: { music: 60, sfx: 85, vo: 100 }, autoRun: false,
  wmap: { w: 3, at: 3 }
};
async function openMove(page: Page): Promise<void> {
  await page.locator('#titleMenuBtn').click();
  await page.locator('#settingsBtn').click();
  await expect(page.locator('#moveSaveBtn')).toBeVisible();
  await page.locator('#moveSaveBtn').click();
  await expect(page.locator('#menuMove')).toBeVisible();
}
async function codeOf(page: Page): Promise<string> {
  await expect(page.locator('#moveCode')).toHaveValue(/^K1\./);
  return page.locator('#moveCode').inputValue();
}

test.describe('C · Move my save', () => {
  test('Settings > Move my save shows a short code and a QR code; "Enter a save code" on another device copies the save in exactly, after a confirm step, keeping a backup', async ({ page, browser }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await seedStore(page, { [MAIN]: RICH_SAVE });
    await page.goto(DEV_URL);
    await ready(page);
    const saveA = await page.evaluate(() => (window as unknown as { __k11: { progress: () => Record<string, unknown> } }).__k11.progress());
    await openMove(page);
    const code = await codeOf(page);
    /* short: deflated, without what every new save has; far shorter than the save itself */
    const full = JSON.stringify(saveA).length;
    console.log(`move code: ${code.length} characters for a ${full}-character save`);
    expect(code).toMatch(/^K1\.[A-Za-z0-9_-]+\.[0-9a-z]{7}$/);
    expect(code.length).toBeLessThan(full / 2);
    /* the QR code: drawn, a real QR size (17 + 4 x version modules, a 4-module border), the three finder squares,
       and it holds the game's address with the code in it */
    const qr = await page.evaluate((code) => {
      const c = document.querySelector('#moveQr') as HTMLCanvasElement;
      const q = (window as unknown as { __k11: { qrMatrix: (t: string) => { size: number; version: number; fb: number; mods: number[][] } } }).__k11.qrMatrix(location.origin + location.pathname + '?save=' + code);
      const n = q.size + 8, s = c.width / n, g = c.getContext('2d')!;
      const dark = (x: number, y: number) => g.getImageData(Math.floor((x + 4.5) * s), Math.floor((y + 4.5) * s), 1, 1).data[0] < 128;
      let same = 0, finder = 0;
      for (let y = 0; y < q.size; y++) for (let x = 0; x < q.size; x++) if (dark(x, y) === !!q.mods[y][x]) same++;
      for (const [ox, oy] of [[0, 0], [q.size - 7, 0], [0, q.size - 7]]) for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
        const d = Math.max(Math.abs(x - 3), Math.abs(y - 3)); if (dark(ox + x, oy + y) === (d !== 2)) finder++;
      }
      return { hidden: c.hidden, width: c.width, n, size: q.size, version: q.version, fb: q.fb, same, finder, quiet: !dark(-2, -2) };
    }, code);
    expect(qr.hidden).toBe(false);
    expect(qr.size).toBe(17 + 4 * qr.version);
    expect(qr.width % qr.n).toBe(0);
    expect(qr.same).toBe(qr.size * qr.size);   /* the canvas shows the matrix exactly */
    expect(qr.finder).toBe(3 * 49);
    expect(qr.fb).toBe(0x77c4);   /* the format bits of level L, mask 0 */
    expect(qr.quiet).toBe(true);

    /* another device: its own save (and backup) */
    const ctxB = await browser.newContext({ serviceWorkers: 'block' });
    const pageB = await ctxB.newPage();
    const errorsB = watchErrors(pageB);
    const OTHER = { unlocked: 1, beaten: [], introSeen: true, wallet: 9, totalCandles: 9, levelsBeaten: { '1-1': 1 }, wmap: { w: 1, at: 1 } };
    await seedStore(pageB, { [MAIN]: OTHER, [`${MAIN}-backup`]: OTHER });
    await pageB.goto(DEV_URL);
    await ready(pageB);
    const saveB = await pageB.evaluate(() => (window as unknown as { __k11: { progress: () => Record<string, unknown> } }).__k11.progress());
    const rawB = await raw(pageB, MAIN);
    await openMove(pageB);
    await pageB.locator('#moveEnter').click();
    await expect(pageB.locator('#moveIn')).toBeVisible();
    await pageB.locator('#moveInput').fill(code);
    await pageB.locator('#moveUse').click();
    /* the confirm step: it says it replaces this device's save and keeps a backup; nothing has changed yet */
    await expect(pageB.locator('#moveConfirm')).toBeVisible();
    await expect(pageB.locator('#moveMsg')).toContainText('replaces the save on this device');
    await expect(pageB.locator('#moveMsg')).toContainText('World 1 · 1 level cleared · 9 candles');
    await expect(pageB.locator('#moveMsg')).toContainText('World 3 · 23 levels cleared · 412 candles');
    await expect(pageB.locator('#moveMsg')).toContainText('backup');
    expect(await raw(pageB, MAIN)).toBe(rawB);
    /* "No" changes nothing */
    await pageB.locator('#moveNo').click();
    await expect(pageB.locator('#moveConfirm')).toBeHidden();
    expect(await raw(pageB, MAIN)).toBe(rawB);
    expect(await raw(pageB, `${MAIN}-before-move`)).toBeNull();
    /* "Yes" copies it in */
    await pageB.locator('#moveInput').fill(code);
    await pageB.locator('#moveUse').click();
    await pageB.locator('#moveYes').click();
    await expect(pageB.locator('#menu')).toBeHidden();
    await expect(pageB.locator('#startBtn')).toBeVisible();
    const after = () => pageB.evaluate(() => (window as unknown as { __k11: { progress: () => Record<string, unknown> } }).__k11.progress());
    expect(await after()).toEqual(saveA);   /* the round trip is exact: every field of the save */
    expect(JSON.parse((await raw(pageB, `${MAIN}-before-move`))!)).toEqual(saveB);   /* this device's old save, kept */
    expect(JSON.parse((await raw(pageB, `${MAIN}-backup`))!)).toEqual(JSON.parse(rawB!));   /* and the usual backup is the old one */
    await expect(pageB.locator('#saveNote')).toHaveText('Continue on the world map · World 3 · 23 levels cleared');
    /* it stays after a reload */
    await pageB.reload();
    await ready(pageB);
    expect(await after()).toEqual(saveA);
    expect(errorsB).toEqual([]);
    await ctxB.close();
    expect(errors).toEqual([]);
  });

  test('a bad code is refused with a friendly message and changes nothing; typing in the code box never works the menu keys', async ({ page }) => {
    const errors = watchErrors(page);
    await seedStore(page, { [MAIN]: RICH_SAVE });
    await page.goto(DEV_URL);
    await ready(page);
    await openMove(page);
    const code = await codeOf(page);
    await page.locator('#moveEnter').click();
    const rawBefore = await raw(page, MAIN);
    const flip = (s: string, i: number) => s.slice(0, i) + (s[i] === 'A' ? 'B' : 'A') + s.slice(i + 1);
    const bad = ['', 'hello', 'K1.abc.0000000', code.slice(0, Math.floor(code.length / 2)), flip(code, 10), flip(code, code.length - 12), code.replace('K1.', 'K0.'), 'K0.' + Buffer.from('[1,2,3]').toString('base64url') + '.0000000'];
    for (const b of bad) {
      await page.locator('#moveInput').fill(b);
      await page.locator('#moveUse').click();
      await expect(page.locator('#moveMsg'), JSON.stringify(b.slice(0, 20))).toContainText('that code doesn\'t work');
      await expect(page.locator('#moveMsg')).toContainText('This device\'s save was not changed.');
      await expect(page.locator('#moveMsg')).toHaveClass(/bad/);
      await expect(page.locator('#moveConfirm')).toBeHidden();
      expect(await raw(page, MAIN)).toBe(rawBefore);
    }
    expect(await raw(page, `${MAIN}-before-move`)).toBeNull();
    /* P (which closes the menu), M (mute) and F typed into the box are letters of the code */
    await page.locator('#moveInput').fill('');
    await page.locator('#moveInput').focus();
    await page.keyboard.type('Pp Mm Ff');
    await expect(page.locator('#menu')).toBeVisible();
    await expect(page.locator('#moveInput')).toHaveValue('Pp Mm Ff');
    expect(errors).toEqual([]);
  });

  test('the QR code\'s address (?save=...) opens the game with the code waiting in "Enter a save code"; nothing changes until Yes', async ({ page }) => {
    const errors = watchErrors(page);
    await seedStore(page, { [MAIN]: RICH_SAVE });
    await page.goto(DEV_URL);
    await ready(page);
    await openMove(page);
    const code = await codeOf(page);
    await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ unlocked: 1, beaten: [], introSeen: true, wallet: 2, levelsBeaten: { '1-1': 1 }, wmap: { w: 1, at: 1 } })), MAIN);
    await page.goto(`${DEV_URL}&save=${code}`);
    await ready(page);
    const rawBefore = await raw(page, MAIN);
    await expect(page.locator('#menuMove')).toBeVisible();
    await expect(page.locator('#moveIn')).toBeVisible();
    await expect(page.locator('#moveInput')).toHaveValue(code);
    expect(new URL(page.url()).searchParams.get('save')).toBeNull();
    expect(await raw(page, MAIN)).toBe(rawBefore);
    await page.locator('#moveUse').click();
    await page.locator('#moveYes').click();
    expect(await progress(page)).toMatchObject({ wmap: { w: 3, at: 3 } });
    expect(errors).toEqual([]);
  });
});

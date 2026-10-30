import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* The overworld map on phones and tablets, and offline after one load (docs/OVERWORLD-MAP.md):
   the picture fits the screen with its ◀ ▶ PLAY buttons beside it (phone sideways) or under it
   (phone upright, tablet), nothing scrolls, every button is a comfortable thumb target and never
   covers the picture; with the network gone, a reload still plays (sw.js precache). */
const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;

type Box = { x: number; y: number; width: number; height: number };
type MapState = { mounted: boolean; busy: boolean; world: number | null; at: number; walking: boolean; banner: string | null };
type Win = Window & { KINAN?: { state: () => MapState } };

function watchErrors(page: Page, expected?: RegExp): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error' && !(expected && expected.test(msg.location().url))) errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function openMap(page: Page): Promise<void> {
  await page.goto(BASE);
  await page.locator('#startBtn').click({ force: true });
  /* 2026-10-28: a new save's first PLAY plays the opening cutscene first (c1-cutscenes.spec.ts); SKIP ends it */
  await expect(page.locator('#cut')).toBeVisible();
  await page.locator('#cutSkip').click();
  await page.waitForFunction(() => { const k = (window as unknown as Win).KINAN; return !!k && k.state().mounted && !k.state().busy; });
  await expect(page.locator('#owHost .km-canvas')).toBeVisible();
}
const overlap = (a: Box, b: Box): boolean => a.x < b.x + b.width - 0.5 && b.x < a.x + a.width - 0.5 && a.y < b.y + b.height - 0.5 && b.y < a.y + a.height - 0.5;
const inside = (a: Box, vw: number, vh: number): boolean => a.x >= -0.5 && a.y >= -0.5 && a.x + a.width <= vw + 0.5 && a.y + a.height <= vh + 0.5;

async function layout(page: Page) {
  const vp = page.viewportSize()!;
  const canvas = (await page.locator('#owHost .km-canvas').boundingBox())!;
  const btns = await Promise.all(['#owPrev', '#owNext', '#owPlay'].map(async (id) => ({ id, box: (await page.locator(id).boundingBox())! })));
  const tools = (await page.locator('#menuBtn').boundingBox())!;   /* 2026-10-28: the map's tool row became THE MENU button in the header's corner */
  const scroll = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight, iw: innerWidth, ih: innerHeight }));
  return { vp, canvas, btns, tools, scroll };
}
function checkLayout(l: Awaited<ReturnType<typeof layout>>, side: 'beside' | 'under'): void {
  const { vp, canvas, btns, tools, scroll } = l;
  expect(scroll.w, 'no sideways scroll').toBeLessThanOrEqual(scroll.iw + 1);
  expect(scroll.h, 'no page scroll').toBeLessThanOrEqual(scroll.ih + 1);
  expect(inside(canvas, vp.width, vp.height), 'the whole map picture is on screen').toBe(true);
  expect(canvas.width / canvas.height).toBeGreaterThan(1.7);   /* 432:240, never squashed */
  expect(canvas.width / canvas.height).toBeLessThan(1.9);
  expect(canvas.width, 'a usefully big picture').toBeGreaterThanOrEqual(Math.min(vp.width, vp.height * 1.8) * 0.45);
  for (const b of btns) {
    expect(inside(b.box, vp.width, vp.height), `${b.id} on screen`).toBe(true);
    expect(b.box.width, `${b.id} wide enough for a thumb`).toBeGreaterThanOrEqual(56);
    expect(b.box.height, `${b.id} tall enough for a thumb`).toBeGreaterThanOrEqual(56);
    expect(overlap(b.box, canvas), `${b.id} never covers the map`).toBe(false);
  }
  const [prev, next, play] = btns.map((b) => b.box);
  expect(overlap(prev, next) || overlap(next, play) || overlap(prev, play), 'buttons apart').toBe(false);
  if (side === 'beside') {   /* phone sideways: ◀ ▶ left of the picture, PLAY right of it */
    expect(next.x + next.width).toBeLessThanOrEqual(canvas.x + 1);
    expect(play.x).toBeGreaterThanOrEqual(canvas.x + canvas.width - 1);
  } else {                   /* upright phone / tablet: the buttons sit under the picture */
    expect(Math.min(prev.y, next.y, play.y)).toBeGreaterThanOrEqual(canvas.y + canvas.height - 1);
  }
  expect(inside(tools, vp.width, vp.height), 'the menu button is on screen').toBe(true);
  expect(overlap(tools, canvas), 'the menu button never covers the map').toBe(false);
  for (const b of btns) expect(overlap(tools, b.box), `the menu button never covers ${b.id}`).toBe(false);
}

test.describe('the map on phones and tablets', () => {
  test.describe('iPhone sideways (844 x 390)', () => {
    test.use({ viewport: { width: 844, height: 390 }, hasTouch: true });
    test('the map fits beside big ◀ ▶ PLAY buttons, and a tap walks and plays', async ({ page }) => {
      const errors = watchErrors(page);
      await openMap(page);
      checkLayout(await layout(page), 'beside');
      await page.locator('#owPlay').tap();
      await expect(page.locator('#stage')).toBeVisible();
      expect(errors).toEqual([]);
    });
  });
  test.describe('iPhone upright (390 x 844)', () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
    test('the map fills the width with the buttons under it; no rotate gate on the map', async ({ page }) => {
      const errors = watchErrors(page);
      await openMap(page);
      checkLayout(await layout(page), 'under');
      await expect(page.locator('#portraitGate')).toBeHidden();
      await page.locator('#owNext').tap();
      await expect.poll(() => page.evaluate(() => (window as unknown as Win).KINAN!.state().at)).toBe(0);   /* 1-1 not beaten: the path stays shut */
      expect(errors).toEqual([]);
    });
  });
  test.describe('Android tablet sideways (1280 x 800)', () => {
    test.use({ viewport: { width: 1280, height: 800 }, hasTouch: true });
    test('a big map with the buttons under it', async ({ page }) => {
      const errors = watchErrors(page);
      await openMap(page);
      const l = await layout(page);
      checkLayout(l, 'under');
      expect(l.canvas.width).toBeGreaterThan(700);   /* the game window is at most 880 px wide, like the levels */
      expect(errors).toEqual([]);
    });
  });
});

test.describe('offline after one load', () => {
  test.use({ serviceWorkers: 'allow' });
  test('with the network gone, a reload opens the title, the map, a level and a World 12 3D level from the cache', async ({ page, context, browserName }) => {
    test.setTimeout(150_000);
    const errors = watchErrors(page);
    await page.goto(BASE);
    const hasSW = await page.evaluate(() => 'serviceWorker' in navigator);
    test.skip(!hasSW, `${browserName} here has no service workers`);
    /* the first visit installs sw.js, which precaches everything (about 13 MB) before it takes over */
    await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 90_000 });
    const missing = await page.evaluate(async () => {
      const want = ['index.html', 'map/engine.js', 'map/worlds/w12_models.js', '3d/level-12-1.html', '3d/assets/models.js', 'map/worlds/vendor/three-0.160.0/build/three.module.js', 'fonts/pixelify-sans-latin.woff2', 'levels/w01/l01.js',
        'audio/lines/lines.js', 'audio/lines/w01/w01_kinan_01.mp3', 'audio/lines/w05/w05_robin_05.mp3', 'audio/voice/w01_mom_03.mp3', 'audio/voice/w05_kinan_11.mp3',
        'audio/lines/w01/w01_kinan_19.mp3', 'audio/lines/w01/w01_shad_05.mp3', 'audio/lines/w01/w01_mom_12.mp3', 'audio/lines/w06/w06_kinan_12.mp3'];   /* C1: the cutscene voices and a World 6-10 exit line   /* V1/V3: the Worlds 1-5 story and boss voices */
      const out: string[] = [];
      for (const f of want) if (!(await caches.match(f))) out.push(f);
      return out;
    });
    expect(missing).toEqual([]);
    await context.setOffline(true);
    const before = errors.length;
    const probe = await page.evaluate(() => fetch('levels/manifest.js?offline-check=' + Date.now()).then(() => 'online', () => 'offline'));
    await page.waitForTimeout(300);
    errors.splice(before);   /* this probe is meant to fail (WebKit also reports it as a page error); nothing else runs meanwhile */
    /* Playwright's Firefox leaves a service worker's own fetches online after setOffline (the probe above
       reaches the server), so there it could not prove anything: Chromium and WebKit carry this check */
    test.skip(probe === 'online' && browserName === 'firefox', 'setOffline does not take service-worker fetches offline in Playwright Firefox');
    expect(probe).toBe('offline');
    await page.reload();
    await expect(page.locator('#startBtn')).toBeVisible();
    await page.locator('#startBtn').click({ force: true });
    /* offline too: the new save's opening cutscene starts from the cache, then SKIP */
    await expect(page.locator('#cut')).toBeVisible();
    await page.locator('#cutSkip').click();
    await page.waitForFunction(() => { const k = (window as unknown as Win).KINAN; return !!k && k.state().mounted && !k.state().busy; }, null, { timeout: 30_000 });
    await expect(page.locator('#owHost .km-canvas')).toBeVisible();
    await page.locator('#owPlay').click();
    await expect(page.locator('#stage')).toBeVisible();
    await expect(page.locator('#stageLbl')).toContainText('1-1');
    /* World 12's 3D level page, its modules, three.js, the packed models and the font, all from the cache */
    await page.goto(new URL('3d/level-12-1.html?level=12-2&id=12-2', BASE).href);
    await page.waitForFunction(() => { const g = (window as unknown as { GAME?: { player?: unknown } }).GAME; return !!(g && g.player); }, null, { timeout: 90_000 });
    await expect(page.locator('#titlecard h1')).toBeVisible();
    await expect(page.locator('#titlecard h1')).toHaveText('NEIGHBOURHOOD ROOFTOPS');   /* V3: the card names the level */
    expect(await page.evaluate(async () => (await document.fonts.load("700 20px 'Pixelify Sans'")).length)).toBeGreaterThan(0);   /* fonts/ from the cache */
    await context.setOffline(false);
    expect(errors).toEqual([]);
  });
});

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* C2 — one clean menu, no codes, a Ko-fi slot (2026-10-28, Shad; index.html block "THE MENU").
   One ☰ MENU button in the top corner on every screen opens one panel: Resume · World map · Pets · Shop ·
   Settings (sound / music / voice, Auto-run, Install the app, "Support future worlds" on Ko-fi, credits) ·
   How to play · Watch the intro · More games · Title screen. In a level it is the pause. The old scattered
   buttons are gone (the header's pause / sound / audio / install buttons, the map's bottom row, the title's tool
   row); the touch controls stay. The reward codes are gone: everything unlocks by playing. KOFI_URL is set to
   Shad's page; the Support button and the credits line show only when it is set and never during play. */
const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';
const KOFI = 'https://ko-fi.com/albertancoder';
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

type MapState = { mounted: boolean; busy: boolean; world: number | null; at: number; walking: boolean; crossing: boolean; banner: string | null };
type Dev = {
  mapState: () => MapState; state: () => { paused: boolean; running: boolean }; levelInfo: () => { id: string | null };
  progress: () => { autoRun: boolean; wmap: { w: number; at: number } | null; introSeen: boolean } & Record<string, unknown>;
  cut: () => { on: boolean; mode: string | null; replay: boolean }; cutSkip: () => unknown; kofi: (url?: string) => string; menu: () => { open: boolean; page: string };
  step: (n: number, o?: Record<string, boolean>) => unknown;
};
type Win = Window & { __k11: Dev; KinanLevels: { ready: boolean } };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function seed(page: Page, data: Record<string, unknown>): Promise<void> {
  await page.addInitScript(({ key, d }) => {
    if (sessionStorage.getItem('c2-seeded')) return;
    sessionStorage.setItem('c2-seeded', '1');
    localStorage.setItem(key, JSON.stringify(Object.assign({ unlocked: 1, beaten: [] }, d)));
  }, { key: CURRENT, d: data });
}
async function boot(page: Page): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
}
const dev = <T>(page: Page, fn: (k: Dev) => T): Promise<T> => page.evaluate(`(${fn.toString()})(window.__k11)`) as Promise<T>;
const mapState = (page: Page) => page.evaluate(() => (window as unknown as Win).__k11.mapState());
async function mapUp(page: Page): Promise<void> {
  await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy && !s.walking; });
  await expect(page.locator('#owHost .km-canvas')).toBeVisible();
}
async function openMenu(page: Page): Promise<void> {
  await page.locator('#menuBtn').click();
  await expect(page.locator('#menu')).toBeVisible();
  await expect(page.locator('#menuMain')).toBeVisible();
}
const SAVED = { introSeen: true, levelsBeaten: { '1-1': 1 }, wmap: { w: 1, at: 1 } };
const ENTRIES = ['#resumeBtn', '#mapBtnP', '#petsBtnP', '#shopBtn', '#settingsBtn', '#howBtn', '#introBtn', '#partyBtn', '#titleBtnP'];

test.describe('C2 · one menu button, nothing scattered', () => {
  test('one ☰ MENU button in the top corner on the title, the map and in a level; the old pause / sound / audio / install buttons and bottom rows are gone; the touch controls stay', async ({ page }, info) => {
    const errors = watchErrors(page);
    await seed(page, SAVED);
    await boot(page);
    const corner = async (where: string) => {
      const b = (await page.locator('#menuBtn').boundingBox())!, hud = (await page.locator('header.hud').boundingBox())!;
      expect(b, where).not.toBeNull();
      expect(b.y, `${where}: at the top`).toBeLessThan(90);
      expect(b.x + b.width, `${where}: in the top bar's right corner (the game is a centred column on a wide screen)`).toBeGreaterThan(hud.x + hud.width - 40);
      expect(b.height, `${where}: thumb-sized`).toBeGreaterThanOrEqual(30);
    };
    const gone = ['#pauseBtn', '#vol', '#installBtn', '#installBtn2', '#audioBox', '#volX', '#mobileFoot', '#owTitle', '#owPets', '#owShop', '#owHow', '#codeBtn', '#petsBtnT'];
    const noneOf = async (where: string) => { for (const id of gone) await expect(page.locator(id), `${where}: ${id}`).toHaveCount(0); };
    /* the title: PLAY / CONTINUE, Start over and Menu, nothing else */
    await expect(page.locator('#startBtn')).toContainText('CONTINUE');
    await expect(page.locator('#screen button')).toHaveCount(3);
    await expect(page.locator('#newBtn')).toBeVisible();
    await expect(page.locator('#titleMenuBtn')).toBeVisible();
    await expect(page.locator('#snd')).toBeHidden();   /* the sound switch lives in Settings now */
    await corner('title'); await noneOf('title');
    /* the map: the picture and its own walk / PLAY buttons only */
    await page.locator('#startBtn').click({ force: true });
    await mapUp(page);
    await expect(page.locator('#screen .btnrow')).toHaveCount(0);
    for (const id of ['#owPrev', '#owNext', '#owPlay']) await expect(page.locator(id)).toBeVisible();
    await corner('map'); await noneOf('map');
    /* a level: the menu button, and on a touch screen the touch controls */
    await page.locator('#owPlay').click();
    await expect(page.locator('#stage')).toBeVisible();
    await corner('level'); await noneOf('level');
    if (info.project.use.hasTouch) {
      for (const k of ['left', 'right', 'jump']) await expect(page.locator(`#pad [data-k="${k}"]`)).toBeVisible();
    }
    expect(errors).toEqual([]);
  });

  test('the title is simple: a new save shows PLAY and Menu (no Start over yet); the menu opens from the title too', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await expect(page.locator('#startBtn')).toContainText('PLAY');
    await expect(page.locator('#screen button')).toHaveCount(2);
    await expect(page.locator('#newBtn')).toHaveCount(0);
    await page.locator('#titleMenuBtn').click();
    await expect(page.locator('#menu')).toBeVisible();
    for (const id of ENTRIES) await expect(page.locator(id), id).toBeVisible();
    await expect(page.locator('#restartBtn')).toBeHidden();   /* only while a game runs */
    await page.locator('#resumeBtn').click();
    await expect(page.locator('#menu')).toBeHidden();
    await expect(page.locator('#startBtn')).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe('C2 · every menu entry works', () => {
  test('from the map: Resume, World map, Pets, Shop, Settings, How to play, Watch the intro, More games and Title screen each do their job and come back to the map', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await seed(page, SAVED);
    await boot(page);
    await page.locator('#startBtn').click({ force: true });
    await mapUp(page);
    /* Resume closes it; Esc opens and closes it; while it is open the map does not walk */
    await openMenu(page);
    for (const id of ENTRIES) await expect(page.locator(id), id).toBeVisible();
    await page.locator('#resumeBtn').click();
    await expect(page.locator('#menu')).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(page.locator('#menu')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);
    expect((await mapState(page)).walking).toBe(false);
    expect((await mapState(page)).at).toBe(1);
    await page.keyboard.press('Escape');
    await expect(page.locator('#menu')).toBeHidden();
    /* World map: already there, it just closes */
    await openMenu(page); await page.locator('#mapBtnP').click();
    await expect(page.locator('#menu')).toBeHidden(); await mapUp(page);
    /* Pets */
    await openMenu(page); await page.locator('#petsBtnP').click();
    await expect(page.locator('.petcard')).toHaveCount(6);
    await page.locator('#petsBack').click(); await mapUp(page);
    /* Shop */
    await openMenu(page); await page.locator('#shopBtn').click();
    await expect(page.locator('#walletN')).toBeVisible();
    await page.locator('#petsBack').click(); await mapUp(page);
    /* How to play */
    await openMenu(page); await page.locator('#howBtn').click();
    await expect(page.locator('#screen .howto')).toBeVisible();
    await page.locator('#backBtn').click(); await mapUp(page);
    /* Settings: the sound switch, the three volumes, Auto-run, Install the app, Support future worlds, credits */
    await openMenu(page); await page.locator('#settingsBtn').click();
    await expect(page.locator('#menuSettings')).toBeVisible();
    for (const id of ['#snd', '#volMusic', '#volSfx', '#volVo', '#autoRunBtn', '#installBtnP', '#kofiBtn', '#creditsLine']) await expect(page.locator(id), id).toBeVisible();
    await expect(page.locator('#autoRunBtn')).toHaveText('Auto-run: ON');
    await page.locator('#autoRunBtn').click();
    await expect(page.locator('#autoRunBtn')).toHaveText('Auto-run: OFF');
    expect((await dev(page, (k) => k.progress())).autoRun).toBe(false);
    await page.locator('#autoRunBtn').click();
    await page.locator('#volMusic').fill('30');
    expect((await dev(page, (k) => k.progress())).vol).toMatchObject({ music: 30 });
    await page.locator('#menuBack').click();
    await expect(page.locator('#menuMain')).toBeVisible();
    await page.locator('#resumeBtn').click();
    /* Watch the intro: plays it again, then back on the map at the same spot */
    await openMenu(page); await page.locator('#introBtn').click();
    await expect(page.locator('#cut')).toBeVisible();
    expect(await dev(page, (k) => k.cut())).toMatchObject({ on: true, mode: 'intro', replay: true });
    await page.locator('#cutSkip').click();
    await expect(page.locator('#cut')).toBeHidden();
    await mapUp(page);
    expect(await mapState(page)).toMatchObject({ world: 1, at: 1 });
    /* More games: Family Brawl, Family Kart and Builder live here now */
    await openMenu(page); await page.locator('#partyBtn').click();
    await expect(page.locator('#menuParty')).toBeVisible();
    for (const id of ['#smashBtn', '#kartBtn', '#buildBtn']) await expect(page.locator(id), id).toBeVisible();
    await page.locator('#smashBtn').click();
    await expect(page.locator('#menu')).toBeHidden();
    await expect(page.locator('#screen')).toContainText(/Family Brawl/i);
    /* Title screen */
    await openMenu(page); await page.locator('#titleBtnP').click();
    await expect(page.locator('#menu')).toBeHidden();
    await expect(page.locator('#startBtn')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('in a level the menu is the pause: Resume plays on; Shop and How to play come back to the paused level; World map leaves it; Support never shows during play', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await seed(page, SAVED);
    await boot(page);
    await page.locator('#startBtn').click({ force: true });
    await mapUp(page);
    await page.locator('#owPlay').click();
    await expect(page.locator('#stage')).toBeVisible();
    await expect.poll(() => dev(page, (k) => k.levelInfo().id)).toBe('1-2');
    await openMenu(page);
    expect(await dev(page, (k) => k.state())).toMatchObject({ paused: true, running: true });
    await expect(page.locator('#restartBtn')).toBeVisible();
    /* Settings during play: no Support button, no Ko-fi line */
    await page.locator('#settingsBtn').click();
    await expect(page.locator('#autoRunBtn')).toBeVisible();
    await expect(page.locator('#kofiBtn')).toBeHidden();
    await expect(page.locator('#kofiCredit')).toBeHidden();
    await page.locator('#menuBack').click();
    /* Shop, then back to the same paused level */
    await page.locator('#shopBtn').click();
    await expect(page.locator('#walletN')).toBeVisible();
    await page.locator('#petsBack').click();
    await expect(page.locator('#stage')).toBeVisible();
    await expect(page.locator('#menu')).toBeVisible();
    expect(await dev(page, (k) => k.state())).toMatchObject({ paused: true, running: true });
    expect(await dev(page, (k) => k.levelInfo().id)).toBe('1-2');
    /* How to play, then back */
    await page.locator('#howBtn').click();
    await expect(page.locator('#screen .howto')).toBeVisible();
    await page.locator('#backBtn').click();
    await expect(page.locator('#stage')).toBeVisible();
    await expect(page.locator('#menu')).toBeVisible();
    /* Resume: the game runs on */
    await page.locator('#resumeBtn').click();
    await expect(page.locator('#menu')).toBeHidden();
    expect(await dev(page, (k) => k.state())).toMatchObject({ paused: false, running: true });
    const x0 = await page.evaluate(() => (window as unknown as { __k11: { state: () => { px: number } } }).__k11.state().px);
    await page.keyboard.down('ArrowRight'); await page.waitForTimeout(600); await page.keyboard.up('ArrowRight');
    const x1 = await page.evaluate(() => (window as unknown as { __k11: { state: () => { px: number } } }).__k11.state().px);
    expect(x1, 'Kinan runs again').toBeGreaterThan(x0 + 20);
    /* P opens the menu too; World map leaves the level for the map */
    await page.keyboard.press('KeyP');
    await expect(page.locator('#menu')).toBeVisible();
    await page.locator('#mapBtnP').click();
    await mapUp(page);
    await expect(page.locator('#stage')).toBeHidden();
    expect(errors).toEqual([]);
  });
});

test.describe('C2 · Ko-fi', () => {
  test('KOFI_URL is Shad\'s page: "Support future worlds" opens https://ko-fi.com/albertancoder in a new tab and the credits line names it; empty, both are hidden', async ({ page }) => {
    const errors = watchErrors(page);
    expect(readFileSync(`${ROOT}index.html`, 'utf8')).toContain(`const KOFI_URL = '${KOFI}';`);
    await boot(page);
    await openMenu(page);
    await page.locator('#settingsBtn').click();
    const b = page.locator('#kofiBtn');
    await expect(b).toBeVisible();
    await expect(b).toHaveText(/Support future worlds/);
    await expect(b).toHaveAttribute('href', KOFI);
    await expect(b).toHaveAttribute('target', '_blank');
    await expect(b).toHaveAttribute('rel', /noopener/);
    await expect(page.locator('#kofiCredit')).toBeVisible();
    await expect(page.locator('#kofiLink')).toHaveAttribute('href', KOFI);
    await expect(page.locator('#creditsLine')).toContainText('ko-fi.com/albertancoder');
    /* a click opens a new tab on that address (the page itself stays); the test answers for ko-fi.com, no real network */
    await page.context().route('https://ko-fi.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<title>Ko-fi stand-in</title>' }));
    const [tab] = await Promise.all([page.context().waitForEvent('page'), b.click()]);
    await tab.waitForLoadState('domcontentloaded');
    expect(tab.url()).toBe(KOFI);
    expect(await tab.evaluate(() => window.opener)).toBeNull();   /* rel=noopener: the game's page is never reachable from there */
    await tab.close();
    expect(page.url()).toContain('/index.html');
    /* KOFI_URL empty: the button and the credits line are hidden */
    expect(await dev(page, (k) => k.kofi(''))).toBe('');
    await page.locator('#menuBack').click(); await page.locator('#settingsBtn').click();
    await expect(page.locator('#kofiBtn')).toBeHidden();
    await expect(page.locator('#kofiCredit')).toBeHidden();
    expect(await page.locator('#creditsLine').innerText()).not.toContain('ko-fi');   /* innerText: what shows (the hidden span's words do not) */
    expect(await page.evaluate((u) => (window as unknown as Win).__k11.kofi(u), KOFI)).toBe(KOFI);
    await page.locator('#menuBack').click(); await page.locator('#settingsBtn').click();
    await expect(page.locator('#kofiBtn')).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe('C2 · no codes', () => {
  test('no code-entry UI anywhere (the title, every menu page, the classic stage map) and the classic worlds open by playing', async ({ page }) => {
    const errors = watchErrors(page);
    const src = readFileSync(`${ROOT}index.html`, 'utf8');
    for (const word of ['CODE_HASH', 'CODE_SALT', 'codeScreen', 'useCode', 'id="rcode"', 'codeBtnM', 'codeBtnE', 'Reward code']) expect(src, word).not.toContain(word);
    /* an old save that beat World 1 of the classic stages: World 2 is open with no code */
    await seed(page, { introSeen: true, wmap: { w: 1, at: 0 }, won: true, beaten: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], unlocked: 12, codes: [] });
    await boot(page);
    const noCodeUi = async (where: string) => {
      await expect(page.locator('#screen input:visible, #menu input:visible:not([type=range]):not([type=checkbox])'), where).toHaveCount(0);
      expect(await page.locator('body').innerText(), where).not.toMatch(/reward code|unlock code/i);
    };
    await noCodeUi('title');
    await openMenu(page);
    await noCodeUi('menu');
    await page.locator('#settingsBtn').click(); await noCodeUi('settings'); await page.locator('#menuBack').click();
    await page.locator('#partyBtn').click(); await noCodeUi('more games');
    await expect(page.locator('#classicBtn')).toBeVisible();   /* Classic stages: this save has some */
    await page.locator('#classicBtn').click();
    await expect(page.locator('#menu')).toBeHidden();
    await expect(page.locator('.mapscr')).toBeVisible();
    await noCodeUi('classic stage map');
    expect(await page.evaluate(() => (window as unknown as { __k11: { worlds?: { open: (n: number) => boolean } } }).__k11.worlds?.open(2))).toBe(true);
    /* the old save's codes are not kept */
    expect((await dev(page, (k) => k.progress())).codes).toBeUndefined();
    expect(errors).toEqual([]);
  });
});

import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/*
 * Legacy-first regression gate. The real game is the repository-root
 * index.html (what GitHub Pages ships). Every overhaul change must keep these
 * features working: the styled title, Story mode, Family Brawl, Family Kart,
 * Builder, Party Shop and How to play — with zero console/page errors.
 */
const GAME_URL = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

async function openTitle(page: Page): Promise<void> {
  await page.goto(GAME_URL);
  await expect(page.locator('#screen h1.title .t1')).toHaveText('Kinan vs. Mom');
}

/** Go back to the title screen from any menu without relying on its layout. */
async function backToTitle(page: Page): Promise<void> {
  await page.goto(GAME_URL);
  await expect(page.locator('#startBtn')).toBeVisible();
}

test.describe('legacy game regression (real game, no downgrade)', () => {
  /* 2026-10-28 (Shad): the title is PLAY / Start over / Menu; every mode and tool moved into THE MENU (More games has
     Family Brawl, Family Kart and Builder); the reward code button is gone (everything unlocks by playing) */
  test('the title and its menu keep every mode and tool (no reward code)', async ({ page }) => {
    const errors = watchErrors(page);
    await openTitle(page);
    await expect(page.locator('#startBtn')).toBeVisible();
    await expect(page.locator('#titleMenuBtn')).toBeVisible();
    await expect(page.locator('#screen img.logo')).toBeVisible();
    await page.locator('#menuBtn').click();
    for (const id of ['#howBtn', '#shopBtn', '#petsBtnP', '#settingsBtn', '#introBtn']) await expect(page.locator(id), `${id} must be in the menu`).toBeVisible();
    await page.locator('#partyBtn').click();
    for (const id of ['#smashBtn', '#kartBtn', '#buildBtn']) await expect(page.locator(id), `${id} must be in the menu's More games`).toBeVisible();
    await expect(page.locator('#codeBtn')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('Story mode starts a real stage with the story dialog', async ({ page }) => {
    const errors = watchErrors(page);
    await openTitle(page);

    /* START has a deliberate pulsing "beat" animation, so it is never
       "stable" for Playwright's actionability check; a person can still tap it. */
    await page.locator('#startBtn').click({ force: true });
    /* 2026-10-28: a new save's first PLAY plays the opening cutscene first (c1-cutscenes.spec.ts); SKIP ends it */
    await expect(page.locator('#cut')).toBeVisible();
    await page.locator('#cutSkip').click();
    /* 2026-10-27 (Producer ruling, Contract §9): PLAY opens the overworld map first (it used to open
       the legacy World Explorer); the map's PLAY starts the real stage at Kinan's spot (1-1) */
    await expect(page.locator('#owHost .km-canvas')).toBeVisible();
    await page.locator('#owPlay').click();
    await expect(page.locator('#stage')).toBeVisible();
    await expect(page.locator('#cv')).toBeVisible();
    await expect(page.locator('#menuBtn')).toBeVisible();   /* 2026-10-28: THE MENU is the pause */

    /* the game canvas is actually drawn (not a blank/single-colour frame);
       poll because the first painted frame can lag behind the click on WebKit */
    const colourCount = () => page.evaluate(() => {
      const cv = document.getElementById('cv') as HTMLCanvasElement;
      const ctx = cv.getContext('2d');
      if (ctx === null) return 0;
      const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
      const seen = new Set<number>();
      for (let i = 0; i < data.length; i += 4 * 13) {
        seen.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
      }
      return seen.size;
    });
    await expect.poll(colourCount, { timeout: 5000 }).toBeGreaterThan(20);
    expect(errors).toEqual([]);
  });

  const menus: { name: string; button: string; heading: RegExp }[] = [
    { name: 'Family Brawl', button: '#smashBtn', heading: /Family Brawl/ },
    { name: 'Family Kart', button: '#kartBtn', heading: /Family Kart/ },
    { name: 'Builder', button: '#buildBtn', heading: /Builder/ },
    { name: 'Party Shop', button: '#shopBtn', heading: /Party Shop/ },
    { name: 'How to play', button: '#howBtn', heading: /story and the moves/i },
  ];

  for (const menu of menus) {
    test(`${menu.name} still opens`, async ({ page }) => {
      const errors = watchErrors(page);
      await backToTitle(page);
      await page.locator('#menuBtn').click();   /* 2026-10-28: every mode and tool is in THE MENU */
      if (['#smashBtn', '#kartBtn', '#buildBtn'].includes(menu.button)) await page.locator('#partyBtn').click();
      await page.locator(menu.button).click();
      await expect(page.locator('#screen h1.title')).toHaveText(menu.heading);
      expect(errors).toEqual([]);
    });
  }
});

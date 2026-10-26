import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/*
 * Legacy-first regression gate. The real game is the repository-root
 * index.html (what GitHub Pages ships). Every overhaul change must keep these
 * features working: the styled title, Story mode, Family Brawl, Family Kart,
 * Builder, Party Shop and How to play — with zero console/page errors.
 */
const GAME_URL = 'http://127.0.0.1:4174/index.html';

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
  test('title screen keeps every mode and tool', async ({ page }) => {
    const errors = watchErrors(page);
    await openTitle(page);

    for (const id of ['#startBtn', '#smashBtn', '#kartBtn', '#buildBtn', '#howBtn', '#shopBtn', '#codeBtn']) {
      await expect(page.locator(id), `${id} must stay on the title screen`).toBeVisible();
    }
    await expect(page.locator('#screen img.logo')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('Story mode starts a real stage with the story dialog', async ({ page }) => {
    const errors = watchErrors(page);
    await openTitle(page);

    /* START has a deliberate pulsing "beat" animation, so it is never
       "stable" for Playwright's actionability check; a person can still tap it. */
    await page.locator('#startBtn').click({ force: true });
    await expect(page.locator('#stage')).toBeVisible();
    await expect(page.locator('#cv')).toBeVisible();
    await expect(page.locator('#dialog')).toBeVisible();
    await expect(page.locator('#dtext')).not.toBeEmpty();

    /* the game canvas is actually drawn (not a blank/single-colour frame) */
    const colours = await page.evaluate(() => {
      const cv = document.getElementById('cv') as HTMLCanvasElement;
      const ctx = cv.getContext('2d');
      if (ctx === null) return 0;
      const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
      const seen = new Set<number>();
      for (let i = 0; i < data.length; i += 4 * 97) {
        seen.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
      }
      return seen.size;
    });
    expect(colours, 'stage canvas should render detailed art').toBeGreaterThan(20);
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
      await page.locator(menu.button).click();
      await expect(page.locator('#screen h1.title')).toHaveText(menu.heading);
      expect(errors).toEqual([]);
    });
  }
});

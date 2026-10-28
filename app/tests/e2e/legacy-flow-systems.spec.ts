import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/*
 * Test Engineer 2 — Systems & Flow.
 * Contract: docs/GAME-DESIGN-CONTRACT.md (§4 seam spec, §6 what we keep).
 * This suite pins the systems the rebuild must never break: saves survive
 * mid-boss play, reward codes survive real save commits and keep the world
 * unlock order honest, and Party Shop purchases survive a reload.
 * The seam walk-through suite (legacy-flow-seam-*.spec.ts) lands with the
 * M4/M5 seam engine, mapped to Contract §4.
 */
const DEV_URL = 'http://127.0.0.1:4174/index.html?devtools=1';
const PROD_URL = 'http://127.0.0.1:4174/index.html';
const CURRENT = 'kinan-remaster-v1';

type Dev = {
  progress: () => { resume?: { i: number; atBoss: boolean } | null; beaten: number[]; codes: number[] };
  jumpToStage: (index: number) => void;
  state: () => { stage: number; boss: string };
  warpBoss: () => void;
  auto: (frames: number) => unknown;
  petSave: () => { i: number; atBoss: boolean } | null;
};

const fixture = (name: string): string =>
  readFileSync(fileURLToPath(new URL(`../fixtures/saves/${name}`, import.meta.url)), 'utf8');

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/* Build a save record on top of the sample fixture. The fixture leaks
   navigation fields, so every seed resets mapWorld/mapSeen/mapSel/explorer. */
function progressRecord(mutate: (data: Record<string, unknown>) => void): string {
  const data = JSON.parse(fixture('kinan-remaster-v1.sample.json')) as Record<string, unknown>;
  data.mapWorld = 0;
  data.mapSeen = {};
  data.mapSel = {};
  data.explorer = null;
  mutate(data);
  return JSON.stringify(data);
}

/* Seed the device ONCE, like a returning player's real localStorage: a reload
   must not re-clobber what the game itself saved mid-session. */
async function seedOnce(page: Page, records: Record<string, string>): Promise<void> {
  await page.addInitScript((entries) => {
    for (const [key, value] of Object.entries(entries)) {
      if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
    }
  }, records);
}

async function dismissStory(page: Page): Promise<void> {
  await expect(page.locator('#dialog')).toBeVisible({ timeout: 5000 });
  for (let i = 0; i < 30 && (await page.locator('#dialog').isVisible()); i++) {
    await page.locator('#dialog').click();
    await page.waitForTimeout(30);
  }
  await expect(page.locator('#dialog')).toBeHidden();
}

test.describe('Systems & Flow — saves, codes and purchases survive the session', () => {
  test('a mid-boss save keeps the continue point at the boss across a reload', async ({ page }) => {
    const errors = watchErrors(page);
    await seedOnce(page, {
      [CURRENT]: progressRecord((d) => {
        d.wonWorlds = [5, 6, 7, 8];
        d.unlocked = 72;
        d.beaten = Array.from({ length: 67 }, (_, i) => i);
        d.codes = [];
      }),
    });
    await page.goto(DEV_URL);
    await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object');
    /* a real player is standing inside the Annie cook-off boss fight */
    await page.evaluate((i) => (window as unknown as { __k11: Dev }).__k11.jumpToStage(i), 71);
    await dismissStory(page);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().stage)).toBe(71);
    await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.warpBoss();
      k.auto(1);
    });
    await dismissStory(page);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().boss)).toBe('fight');

    /* the game autosaves right here — mid-boss */
    const resume = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petSave());
    expect(resume).toMatchObject({ i: 71, atBoss: true });

    /* ...the player closes the tab and comes back */
    await page.reload();
    await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object');
    /* 2026-10-27: title PLAY opens the overworld map; a half-played classic stage resumes from the
       title's "Classic stages" button, which names where it left off */
    await expect(page.locator('#mapBtn')).toHaveAttribute('title', /at the boss/);
    await page.locator('#mapBtn').click();
    await expect(page.locator('#stage')).toBeVisible();
    await dismissStory(page);   /* the boss fight starts over from its intro */
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().stage)).toBe(71);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.auto(30));
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().boss)).toBe('fight');
    /* a mid-boss save never pretends the stage was cleared */
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.progress().beaten)).not.toContain(71);
    expect(errors).toEqual([]);
  });

  test('reward codes survive a save commit and keep the world unlock order', async ({ page }) => {
    const errors = watchErrors(page);
    await seedOnce(page, {
      [CURRENT]: progressRecord((d) => {
        d.wonWorlds = [2, 3, 4];   /* Worlds 2-4 beaten; World 5 waits at the map */
        d.unlocked = 42;
        d.beaten = Array.from({ length: 41 }, (_, i) => i);
        d.codes = [2, 3, 4, 5];   /* Worlds 2-5 open with reward codes */
      }),
    });
    await page.goto(PROD_URL);
    const worldsOpen = async () => {
      await page.locator('#codeBtn').click();
      for (const n of [2, 3, 4, 5]) {
        const row = page.locator('#worldList li').filter({ has: page.locator('b:text-is("World ' + n + '")') });
        await expect(row).toHaveCount(1);
        await expect(row).toContainText('✅');   /* open or beaten — never "needs a reward code" */
      }
      /* the unlock order is honest: World 6 still waits for World 5 */
      await expect(page.locator('#worldList')).toContainText('beat World 5 first');
      await page.locator('#rcodeBack').click();
      await expect(page.locator('#startBtn')).toBeVisible();
    };
    await worldsOpen();

    /* a real save commit (current + backup) must round-trip the codes */
    await page.locator('#snd').click();
    await page.reload();
    await worldsOpen();
    const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}') as { codes: number[] }, CURRENT);
    expect(saved.codes).toEqual([2, 3, 4, 5]);
    expect(errors).toEqual([]);
  });

  test('a Party Shop purchase survives a reload', async ({ page }) => {
    const errors = watchErrors(page);
    await seedOnce(page, {
      [CURRENT]: progressRecord((d) => {
        d.wallet = 1000;
        d.owned = [];
      }),
    });
    await page.goto(PROD_URL);
    await page.locator('#shopBtn').click();
    await expect(page.locator('#walletN')).toBeVisible();
    const card = page.locator('.shopcard:not(.own):visible').first();
    await expect(card).toBeVisible();
    const id = (await card.getAttribute('data-item')) as string;
    expect(id).toBeTruthy();
    const item = `[data-item="${id}"]`;
    await page.locator(item).click();   /* first tap: "Tap again: buy for N" */
    await page.locator(item).click();   /* confirmed: it is yours */
    await expect(page.locator(item)).toHaveClass(/own/);

    /* ...the player closes the tab and comes back: it is still theirs */
    await page.reload();
    await page.locator('#shopBtn').click();
    await expect(page.locator(item)).toHaveClass(/own/);
    const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}') as { owned: string[] }, CURRENT);
    expect(saved.owned).toContain(id);
    expect(errors).toEqual([]);
  });
});
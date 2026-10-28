import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const DEV_URL = 'http://127.0.0.1:4174/index.html?devtools=1';
const PROD_URL = 'http://127.0.0.1:4174/index.html';
const CURRENT = 'kinan-remaster-v1';
type Dev = {
  audioInfo: () => { on: boolean; vol: { music: number; sfx: number; vo: number }; narration: boolean; captions: boolean; clips: number; tts: boolean };
  audioCue: (k: string) => { caption: string | null };
};
const fixture = (name: string): string => readFileSync(fileURLToPath(new URL(`../fixtures/saves/${name}`, import.meta.url)), 'utf8');
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function openAudioBox(page: Page): Promise<void> {
  await page.locator('#vol').click();
  await expect(page.locator('#audioBox')).toBeVisible();
}

test.describe('Natural audio — channel controls, captions, clips-first voice', () => {
  test('the audio panel opens with three channels, device voice and captions controls', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(PROD_URL);
    await openAudioBox(page);
    await expect(page.locator('#volMusic')).toBeVisible();
    await expect(page.locator('#volSfx')).toBeVisible();
    await expect(page.locator('#volVo')).toBeVisible();
    await expect(page.locator('#volNarr')).not.toBeChecked();   /* V1 (Shad, 2026-10-28): the device voice is OFF by default */
    await expect(page.locator('#volCaps')).toBeChecked();
    await page.locator('#volX').click();
    await expect(page.locator('#audioBox')).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('audio settings persist across reloads', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(PROD_URL);
    await openAudioBox(page);
    await page.locator('#volMusic').fill('40');
    await page.locator('#volSfx').fill('60');
    await page.locator('#volVo').fill('20');
    await page.locator('#volNarr').check();   /* V1: off by default, so the switch that must persist is turning it ON */
    await page.locator('#volX').click();
    await page.reload();
    await openAudioBox(page);
    await expect(page.locator('#volMusic')).toHaveValue('40');
    await expect(page.locator('#volSfx')).toHaveValue('60');
    await expect(page.locator('#volVo')).toHaveValue('20');
    await expect(page.locator('#volNarr')).toBeChecked();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('kinan-remaster-v1') || '{}'));
    expect(saved.vol).toMatchObject({ music: 40, sfx: 60, vo: 20 });
    expect(saved.deviceVoice).toBe(true);
    expect(errors).toEqual([]);
  });

  test('captions describe sounds and the toggle hides them', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(DEV_URL);
    await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object');
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.audioCue('win'))).toMatchObject({ caption: '(victory jingle)' });
    await openAudioBox(page);
    await page.locator('#volCaps').uncheck();
    await page.locator('#volX').click();
    expect(await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.audioCue('win'))).toMatchObject({ caption: null });
    expect(errors).toEqual([]);
  });

  test('the family’s recorded clips work with no speech synthesis at all', async ({ page }) => {
    const errors = watchErrors(page);
    await page.addInitScript(() => {
      Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true });
    });
    await page.addInitScript(({ key, raw }) => {
      const data = JSON.parse(raw);
      data.wonWorlds = [];
      data.codes = [];
      data.unlocked = 2;
      data.beaten = [0];
      data.mapWorld = 0;
      data.mapSeen = {};
      data.mapSel = {};
      localStorage.setItem(key, JSON.stringify(data));
    }, { key: CURRENT, raw: fixture('kinan-remaster-v1.sample.json') });
    await page.goto(PROD_URL);
    await expect(page.locator('#mapBtn')).toBeVisible();
    await page.locator('#mapBtn').click();
    await page.locator('.lvchip[data-stop="0"]').click();
    await page.locator('#wmPlay').click();
    await expect(page.locator('#stage')).toBeVisible();
    await expect(page.locator('#dialog')).toBeVisible({ timeout: 5000 });
    for (let i = 0; i < 24 && await page.locator('#dialog').isVisible(); i++) {
      await page.locator('#dialog').click();
      await page.waitForTimeout(30);
    }
    await expect(page.locator('#dialog')).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('the mute switch still toggles and persists', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(PROD_URL);
    await page.locator('#snd').click();
    await expect(page.locator('#snd')).toHaveAttribute('aria-pressed', 'false');
    await page.reload();
    await expect(page.locator('#snd')).toHaveAttribute('aria-pressed', 'false');
    await page.locator('#snd').click();
    await expect(page.locator('#snd')).toHaveAttribute('aria-pressed', 'true');
    expect(errors).toEqual([]);
  });
});
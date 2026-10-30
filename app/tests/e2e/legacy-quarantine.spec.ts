import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const LEGACY_URL = `http://127.0.0.1:${process.env.KVM_PORT || 4174}`;

const sampleSave = (name: string): string =>
  readFileSync(
    fileURLToPath(new URL(`../fixtures/saves/${name}`, import.meta.url)),
    'utf8',
  );

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

test.describe('legacy quarantine (reference build)', () => {
  test('does not eagerly load the old 3D scripts', async ({ page }) => {
    const errors = watchErrors(page);
    const requested: string[] = [];
    page.on('request', (req) => requested.push(req.url()));

    await page.goto(`${LEGACY_URL}/index.html`);
    await page.waitForLoadState('load');

    expect(requested.filter((u) => u.includes('galaxy3d'))).toEqual([]);
    const galaxy = await page.evaluate(() => (window as unknown as { GALAXY3D?: unknown }).GALAXY3D);
    expect(galaxy).toBeUndefined();
    expect(errors).toEqual([]);
  });

  test('blocks the ?w6 public 3D shortcut', async ({ page }) => {
    const errors = watchErrors(page);
    const requested: string[] = [];
    page.on('request', (req) => requested.push(req.url()));

    await page.goto(`${LEGACY_URL}/index.html?w6=play`);
    await page.waitForLoadState('load');
    /* The old behavior started the galaxy level after 500ms. Give it time. */
    await page.waitForTimeout(1500);

    expect(requested.filter((u) => u.includes('galaxy3d'))).toEqual([]);
    const galaxy = await page.evaluate(() => (window as unknown as { GALAXY3D?: unknown }).GALAXY3D);
    expect(galaxy).toBeUndefined();
    expect(errors).toEqual([]);
  });

  test('blocks the ?creator=SHAD permanent unlock shortcut', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(`${LEGACY_URL}/index.html?creator=SHAD`);
    await page.waitForLoadState('load');
    await page.waitForTimeout(1500);

    /* The creator pass sets progress.creatorUntil for one hour; assert it never fired. */
    const saved = await page.evaluate(() => {
      const raw = window.localStorage.getItem('kinan-remaster-v1');
      return raw === null ? null : (JSON.parse(raw) as { creatorUntil?: number });
    });
    expect(saved === null || !saved.creatorUntil).toBe(true);
    expect(errors).toEqual([]);
  });

  test('exposes no production debug hooks (window.__k11)', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(`${LEGACY_URL}/index.html`);
    await page.waitForLoadState('load');

    const hooks = await page.evaluate(() => (window as unknown as { __k11?: unknown }).__k11);
    expect(hooks).toBeUndefined();
    expect(errors).toEqual([]);
  });

  test('preserves legacy save keys untouched (kinan-remaster-v1, k11v3)', async ({ page }) => {
    const errors = watchErrors(page);
    const v1 = sampleSave('kinan-remaster-v1.sample.json');
    const k11 = sampleSave('k11v3.sample.json');

    await page.addInitScript(
      ([v1Raw, k11Raw]) => {
        window.localStorage.setItem('kinan-remaster-v1', v1Raw);
        window.localStorage.setItem('k11v3', k11Raw);
        window.localStorage.setItem('k11v3-sound', 'true');
      },
      [v1, k11] as [string, string],
    );

    await page.goto(`${LEGACY_URL}/index.html`);
    await page.waitForLoadState('load');

    const after = await page.evaluate(() => ({
      v1: window.localStorage.getItem('kinan-remaster-v1'),
      k11: window.localStorage.getItem('k11v3'),
      sound: window.localStorage.getItem('k11v3-sound'),
    }));

    expect(after.v1).not.toBeNull();
    expect(after.k11).toBe(k11);
    expect(after.sound).toBe('true');
    /* The v1 record must survive load: same data, no key deletion. */
    expect(JSON.parse(after.v1 as string).totalCandles).toBe(
      JSON.parse(v1).totalCandles,
    );
    expect(errors).toEqual([]);
  });

  test('dev gate still works locally with ?devtools=1 (reference only)', async ({ page }) => {
    const errors = watchErrors(page);
    const requested: string[] = [];
    page.on('request', (req) => requested.push(req.url()));

    await page.goto(`${LEGACY_URL}/index.html?devtools=1&w6=play`);
    await page.waitForLoadState('load');
    await page.waitForTimeout(1500);

    /* Local + explicit flag may load the archived 3D for reference. */
    expect(requested.filter((u) => u.includes('galaxy3d')).length).toBeGreaterThan(0);
    /* But the recorded page errors must still be clean. */
    expect(errors).toEqual([]);
  });
});

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const LEGACY_URL = 'http://127.0.0.1:4174/index.html?devtools=1';
const PRODUCTION_URL = 'http://127.0.0.1:4174/index.html';
const CURRENT = 'kinan-remaster-v1';
const BACKUP = 'kinan-remaster-v1-backup';
const K11 = 'k11v3';
const SOUND = 'k11v3-sound';

type Progress = { unlocked: number; totalCandles: number; pets: { ids: string[] } };
type DevHooks = { progress: () => Progress; grantPets: () => string[] };

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

async function seed(page: Page, records: Record<string, string>): Promise<void> {
  await page.addInitScript((entries) => {
    for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
  }, records);
}

async function openDev(page: Page): Promise<void> {
  await page.goto(LEGACY_URL);
  await page.waitForFunction(() => typeof (window as unknown as { __k11?: DevHooks }).__k11 === 'object');
}

async function progress(page: Page): Promise<Progress> {
  return page.evaluate(() => (window as unknown as { __k11: DevHooks }).__k11.progress());
}

async function grantPets(page: Page): Promise<void> {
  await page.evaluate(() => (window as unknown as { __k11: DevHooks }).__k11.grantPets());
}

async function readKey(page: Page, key: string): Promise<string | null> {
  return page.evaluate((k) => localStorage.getItem(k), key);
}

test.describe('legacy save backup and recovery', () => {
  test('writes the previous valid current save as the last-known-good backup', async ({ page }) => {
    const errors = watchErrors(page);
    const v1 = fixture('kinan-remaster-v1.sample.json');
    const k11 = fixture('k11v3.sample.json');
    await seed(page, { [CURRENT]: v1, [K11]: k11, [SOUND]: 'true' });
    await openDev(page);
    await grantPets(page);

    const current = JSON.parse((await readKey(page, CURRENT)) as string) as Progress;
    const backup = JSON.parse((await readKey(page, BACKUP)) as string) as Progress;
    expect(current.pets.ids).toHaveLength(6);
    expect(backup).toMatchObject(JSON.parse(v1));
    expect(await readKey(page, K11)).toBe(k11);
    expect(await readKey(page, SOUND)).toBe('true');
    expect(errors).toEqual([]);
  });

  test('recovers and restores a damaged current record from its backup', async ({ page }) => {
    const errors = watchErrors(page);
    const v1 = fixture('kinan-remaster-v1.sample.json');
    await seed(page, { [CURRENT]: '{"unlocked":"bad","pets":null}', [BACKUP]: v1 });
    await openDev(page);

    expect((await progress(page)).totalCandles).toBe(214);
    expect(JSON.parse((await readKey(page, CURRENT)) as string).totalCandles).toBe(214);
    expect(JSON.parse((await readKey(page, BACKUP)) as string)).toMatchObject({ unlocked: 12, totalCandles: 214 });
    expect(errors).toEqual([]);
  });

  test('keeps k11v3 migration read-only and backs up the migrated save on commit', async ({ page }) => {
    const errors = watchErrors(page);
    const k11 = fixture('k11v3.sample.json');
    await seed(page, { [CURRENT]: '{broken', [BACKUP]: '{also broken', [K11]: k11, [SOUND]: 'false' });
    await openDev(page);

    expect((await progress(page)).totalCandles).toBe(88);
    expect((await progress(page)).unlocked).toBe(7);
    expect(await readKey(page, K11)).toBe(k11);
    expect(await readKey(page, SOUND)).toBe('false');
    await grantPets(page);
    expect(JSON.parse((await readKey(page, CURRENT)) as string).totalCandles).toBe(88);
    expect(JSON.parse((await readKey(page, BACKUP)) as string).totalCandles).toBe(88);
    expect(await readKey(page, K11)).toBe(k11);
    expect(errors).toEqual([]);
  });

  test('loads older sparse v1 records without requiring a backup or migration', async ({ page }) => {
    const errors = watchErrors(page);
    const sparse = JSON.stringify({
      unlocked: '12', beaten: [0, 1], totalCandles: 50,
      pets: { cat: true, dog: true, names: {} },
    });
    await seed(page, { [CURRENT]: sparse });
    await openDev(page);

    const loaded = await progress(page);
    expect(loaded.unlocked).toBe(12);
    expect(loaded.totalCandles).toBe(50);
    expect(loaded.pets.ids).toEqual(['cat1', 'dog1']);
    expect(errors).toEqual([]);
  });

  test('does not replace current when the backup cannot be written', async ({ page }) => {
    const errors = watchErrors(page);
    const v1 = fixture('kinan-remaster-v1.sample.json');
    await page.addInitScript(({ currentKey, backupKey, raw }) => {
      const original = Storage.prototype.setItem;
      original.call(localStorage, currentKey, raw);
      Storage.prototype.setItem = function (key, value) {
        if (key === backupKey) throw new Error('simulated quota exhaustion');
        return original.call(this, key, value);
      };
    }, { currentKey: CURRENT, backupKey: BACKUP, raw: v1 });
    await openDev(page);
    await grantPets(page);

    expect(await readKey(page, CURRENT)).toBe(v1);
    expect(await readKey(page, BACKUP)).toBeNull();
    expect(errors).toEqual([]);
  });

  test('keeps the last-known-good backup when the current write fails', async ({ page }) => {
    const errors = watchErrors(page);
    const v1 = fixture('kinan-remaster-v1.sample.json');
    await page.addInitScript(({ currentKey, raw }) => {
      const original = Storage.prototype.setItem;
      original.call(localStorage, currentKey, raw);
      Storage.prototype.setItem = function (key, value) {
        if (key === currentKey) throw new Error('simulated current-write failure');
        return original.call(this, key, value);
      };
    }, { currentKey: CURRENT, raw: v1 });
    await openDev(page);
    await grantPets(page);

    expect(await readKey(page, CURRENT)).toBe(v1);
    expect(JSON.parse((await readKey(page, BACKUP)) as string)).toEqual(JSON.parse(v1));
    expect(errors).toEqual([]);
  });

  test('backs up a normal production-mode settings save with developer hooks disabled', async ({ page }) => {
    const errors = watchErrors(page);
    const v1 = fixture('kinan-remaster-v1.sample.json');
    await seed(page, { [CURRENT]: v1 });
    await page.goto(PRODUCTION_URL);

    expect(await page.evaluate(() => typeof (window as unknown as { __k11?: unknown }).__k11)).toBe('undefined');
    await page.locator('#snd').click();

    const current = JSON.parse((await readKey(page, CURRENT)) as string) as Progress & { sound: boolean };
    const backup = JSON.parse((await readKey(page, BACKUP)) as string) as Progress & { sound: boolean };
    expect(current.sound).toBe(false);
    expect(backup).toMatchObject(JSON.parse(v1));
    expect(errors).toEqual([]);
  });
});

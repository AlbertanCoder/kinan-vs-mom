import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const DEV_URL = 'http://127.0.0.1:4174/index.html?devtools=1';
const CURRENT = 'kinan-remaster-v1';

type PetInfo = {
  ids: string[]; equippedCat: string | null; equippedDog: string | null;
  liveCats: number; liveDogs: number; cleanLandings: number;
  zoomies: number; zoomiesCooldown: number;
  dogs: { id: string; cooldown: number; warning: number }[];
  stunnedFoes: number[];
};
type Dev = {
  progress: () => { pets: { ids: string[]; equippedCat: string | null; equippedDog: string | null } };
  grantPets: () => string[];
  jumpToStage: (index: number) => void;
  petInfo: () => PetInfo;
  petLand: () => PetInfo;
  petAbilityTick: (frames: number) => PetInfo;
  petTickPets: (frames: number) => PetInfo;
  petBark: (offscreen: boolean) => { alive: boolean; stun: number; cooldown: number; warning: number } | null;
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
async function openDev(page: Page, raw = fixture('kinan-remaster-v1.sample.json')): Promise<void> {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: CURRENT, value: raw });
  await page.goto(DEV_URL);
  await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object');
}
async function progress(page: Page) {
  return page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.progress());
}
async function info(page: Page): Promise<PetInfo> {
  return page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petInfo());
}
async function startStage(page: Page): Promise<void> {
  await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.jumpToStage(0));
  await expect(page.locator('#stage')).toBeVisible();
}

test.describe('companion collection and loadout', () => {
  test('migrates a collection to a default pair and spawns only equipped pets', async ({ page }) => {
    const errors = watchErrors(page);
    await openDev(page);
    expect((await progress(page)).pets.equippedCat).toBe('cat1');
    expect((await progress(page)).pets.equippedDog).toBe('dog1');
    expect((await progress(page)).pets.ids).toHaveLength(3);
    await startStage(page);
    const current = await info(page);
    expect(current.liveCats).toBe(1);
    expect(current.liveDogs).toBe(1);
    expect(current.ids).toHaveLength(3);
    expect(current.equippedCat).toBe('cat1');
    expect(current.equippedDog).toBe('dog1');
    expect(errors).toEqual([]);
  });

  test('title menu replaces per-species slots and Solo removes all followers', async ({ page }) => {
    const errors = watchErrors(page);
    await openDev(page);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.grantPets());
    await page.locator('#petsBtnT').click();
    await expect(page.locator('#screen h1.title')).toHaveText('Pet loadout');
    await expect(page.locator('input[data-pet="cat1"]')).toHaveValue('Garfield');
    await expect(page.locator('input[data-pet="dog1"]')).toHaveValue('Chikastino');
    await page.locator('[data-equip="cat2"]').click();
    expect((await progress(page)).pets.equippedCat).toBe('cat2');
    await page.locator('[data-equip="cat3"]').click();
    expect((await progress(page)).pets.equippedCat).toBe('cat3');
    await page.locator('[data-equip="dog2"]').click();
    expect((await progress(page)).pets.equippedDog).toBe('dog2');
    await expect(page.locator('.petname.equipped')).toHaveCount(2);
    await page.locator('#soloPets').click();
    expect((await progress(page)).pets.equippedCat).toBeNull();
    expect((await progress(page)).pets.equippedDog).toBeNull();
    await expect(page.locator('#petLoadoutStatus')).toContainText('Solo');
    await startStage(page);
    expect((await info(page)).liveCats).toBe(0);
    expect((await info(page)).liveDogs).toBe(0);
    expect(errors).toEqual([]);
  });

  test('Garfield triggers 2.5-second Zoomies after three landings with a 15-second cooldown', async ({ page }) => {
    const errors = watchErrors(page);
    await openDev(page);
    await startStage(page);
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petLand())).cleanLandings).toBe(1);
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petLand())).cleanLandings).toBe(2);
    const triggered = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petLand());
    expect(triggered.zoomies).toBe(150);
    expect(triggered.zoomiesCooldown).toBe(900);
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petAbilityTick(150))).zoomies).toBe(0);
    expect((await info(page)).zoomiesCooldown).toBe(750);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petLand());
    expect((await info(page)).zoomies).toBe(0);
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petAbilityTick(750))).zoomiesCooldown).toBe(0);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petLand());
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petLand());
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petLand())).zoomies).toBe(150);
    expect(errors).toEqual([]);
  });

  test('Chikastino stuns without killing and cannot bark again for 14 seconds', async ({ page }) => {
    const errors = watchErrors(page);
    await openDev(page);
    await startStage(page);
    const bark = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petBark(false));
    expect(bark?.alive).toBe(true);
    expect(bark?.stun).toBe(90);
    expect(bark?.cooldown).toBe(0);
    expect((await info(page)).stunnedFoes).toHaveLength(1);
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petTickPets(840))).dogs[0].cooldown).toBe(840);
    expect((await info(page)).stunnedFoes).toHaveLength(1);
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petTickPets(1))).dogs[0].cooldown).toBe(0);
    expect((await info(page)).stunnedFoes).toHaveLength(1);
    expect(errors).toEqual([]);
  });

  test('Chikastino warns about off-screen threats without stunning them', async ({ page }) => {
    const errors = watchErrors(page);
    await openDev(page);
    await startStage(page);
    const warning = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petBark(true));
    expect(warning?.warning).toBeGreaterThan(0);
    expect(warning?.stun).toBe(0);
    expect(warning?.alive).toBe(true);
    expect((await info(page)).stunnedFoes).toHaveLength(0);
    expect(errors).toEqual([]);
  });
});

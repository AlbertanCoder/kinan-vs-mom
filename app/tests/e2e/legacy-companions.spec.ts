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
  vaderCooldown: number; tuxCooldown: number;
  hunterUsed: boolean; hunterT: number; duchessUsed: boolean;
  hp: number; maxHp: number; pulledCoins: number; scoutTargets: number;
};
type Dev = {
  progress: () => { pets: { ids: string[]; equippedCat: string | null; equippedDog: string | null }; resume?: { hunterUsed?: boolean; duchessUsed?: boolean } };
  grantPets: () => string[];
  jumpToStage: (index: number) => void;
  petInfo: () => PetInfo;
  petLand: () => PetInfo;
  petAbilityTick: (frames: number) => PetInfo;
  petTickPets: (frames: number) => PetInfo;
  petBark: (offscreen: boolean) => { alive: boolean; stun: number; cooldown: number; warning: number } | null;
  petEquip: (cat: string | null, dog: string | null) => PetInfo | null;
  petFreeze: () => boolean;
  petVader: () => PetInfo;
  petHunter: () => { saved: boolean; info: PetInfo };
  petSave: () => { hunterT: number; hunterUsed: boolean };
  petFood: () => PetInfo;
  petCheckpoint: (reset?: boolean) => PetInfo;
  petTux: () => { stun: number; charge: number; info: PetInfo } | null;
  petHurt: () => { vx: number; vy: number; hp: number };
  petSpot: () => { x: number; y: number; pet: string } | null;
  pieces: () => { x: number; y: number }[];
  teleport: (x: number) => void;
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

  test('the Pets screen replaces the old per-species slots; tapping an equipped pet again sends it home (solo)', async ({ page }) => {
    const errors = watchErrors(page);
    await openDev(page);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.grantPets());
    await page.locator('#petsBtnT').click();
    await expect(page.locator('#screen h1.title')).toHaveText('Pets');
    await expect(page.locator('[data-equip="cat1"]')).toContainText('Ginger');      /* the save said Garfield: renamed (Shad's ruling) */
    await expect(page.locator('[data-equip="dog1"]')).toContainText('Chikastino');
    await page.locator('[data-equip="cat2"]').click();
    expect((await progress(page)).pets.equippedCat).toBe('cat2');
    await page.locator('[data-equip="cat3"]').click();
    expect((await progress(page)).pets.equippedCat).toBe('cat3');
    await page.locator('[data-equip="dog2"]').click();
    expect((await progress(page)).pets.equippedDog).toBe('dog2');
    await expect(page.locator('.petcard.on')).toHaveCount(2);
    await page.locator('[data-equip="cat3"]').click();                               /* tap again: home */
    await page.locator('[data-equip="dog2"]').click();
    expect((await progress(page)).pets.equippedCat).toBeNull();
    expect((await progress(page)).pets.equippedDog).toBeNull();
    await expect(page.locator('.petcard.on')).toHaveCount(0);
    await startStage(page);
    expect((await info(page)).liveCats).toBe(0);
    expect((await info(page)).liveDogs).toBe(0);
    expect(errors).toEqual([]);
  });

  test('Ginger has one power (the higher jump): no Kitten Zoomies and no double jump any more', async ({ page }) => {
    const errors = watchErrors(page);
    await openDev(page);
    await startStage(page);
    for (let n = 0; n < 3; n++) await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petLand());
    const after = await info(page);
    expect(after.equippedCat).toBe('cat1');
    expect(after.zoomies).toBe(0);
    expect(after.zoomiesCooldown).toBe(0);
    expect(await page.evaluate(() => (window as unknown as { __k11: { state: () => { airJumps: number } } }).__k11.state().airJumps)).toBe(0);
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

  test('Chikastino has one power: no off-screen warning any more, and an enemy off screen is never stunned', async ({ page }) => {
    const errors = watchErrors(page);
    await openDev(page);
    await startStage(page);
    const far = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petBark(true));
    expect(far?.warning).toBe(0);
    expect(far?.stun).toBe(0);
    expect(far?.alive).toBe(true);
    expect((await info(page)).stunnedFoes).toHaveLength(0);
    expect(errors).toEqual([]);
  });

  test('Vader scouts interactables and pulses pickup-only attraction every eight seconds', async ({ page }) => {
    const errors = watchErrors(page);
    await openDev(page);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.grantPets());
    await startStage(page);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petEquip('cat2', 'dog1'));
    const pieces = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.pieces());
    expect(pieces.length).toBeGreaterThan(0);
    await page.evaluate((x) => (window as unknown as { __k11: Dev }).__k11.teleport(x), pieces[0].x);
    const pulse = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petVader());
    expect(pulse.vaderCooldown).toBe(480);
    expect(pulse.pulledCoins).toBeGreaterThan(0);
    expect(pulse.scoutTargets).toBeGreaterThan(0);
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petAbilityTick(480))).vaderCooldown).toBe(0);
    expect(errors).toEqual([]);
  });

  test('Hunter saves Kinan once when a hit would take his last heart (and only once per level)', async ({ page }) => {
    const errors = watchErrors(page);
    await openDev(page);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.grantPets());
    await startStage(page);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petEquip(null, 'dog2'));
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petFreeze());
    const first = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petHunter());
    expect(first.saved).toBe(true);
    expect(first.info.hp).toBe(1);
    expect(first.info.hunterUsed).toBe(true);
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petSave())).hunterUsed).toBe(true);
    const second = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petHunter());
    expect(second.saved).toBe(false);                 /* used up: this hit takes the last heart */
    expect(second.info.hp).toBe(0);
    expect(errors).toEqual([]);
  });

  test('Duchess brings a snack that heals one heart every 12 seconds while one is missing (no food bonus, no checkpoint rest)', async ({ page }) => {
    const errors = watchErrors(page);
    await openDev(page);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.grantPets());
    await startStage(page);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petEquip('cat3', 'dog1'));
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petFreeze());   /* frame-exact from here */
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petFood())).hp).toBe(2);   /* a heart is one heart */
    const rested = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petCheckpoint());
    expect(rested.hp).toBe(1);                        /* no checkpoint snack */
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petTickPets(719))).hp).toBe(1);
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petTickPets(1))).hp).toBe(2);
    expect((await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petTickPets(720))).hp).toBe(3);
    expect(errors).toEqual([]);
  });

  test('Tuxedo shrugs off hits: half the knockback, and no more Senior Glare', async ({ page }) => {
    const errors = watchErrors(page);
    await openDev(page);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.grantPets());
    await startStage(page);
    await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petEquip('cat4', 'dog1'));
    const glare = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petTux());
    expect(glare?.stun).toBe(0);
    expect(glare?.charge).toBe(30);
    const hit = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.petHurt());
    expect(hit.vx).toBeCloseTo(-1.1, 2);              /* legacy HURT_VX 2.2 x 0.5 */
    expect(hit.vy).toBeCloseTo(-1.7, 2);              /* legacy HURT_VY -3.4 x 0.5 */
    expect(errors).toEqual([]);
  });
});

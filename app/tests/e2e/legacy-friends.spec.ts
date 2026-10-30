import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const DEV_URL = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html?devtools=1`;
const CURRENT = 'kinan-remaster-v1';

type FriendInfo = {
  friendAssist: string | null; friendsUnlocked: string[]; friendCooldown: number;
  aidenUsed: boolean; aidenT: number; platforms: number; distractedFoes: number[];
  checkpoint: boolean; boss: string; hp: number; equippedCat: string | null;
  equippedDog: string | null; liveCats: number; liveDogs: number;
};
type Dev = {
  progress: () => { friendAssist: string | null; friendsUnlocked: string[] };
  jumpToStage: (index: number) => void;
  petInfo: () => FriendInfo;
  friendSet: (id: string | null) => FriendInfo | null;
  friendCall: () => { result: boolean; info: FriendInfo };
  petAbilityTick: (frames: number) => FriendInfo;
  petCheckpoint: (reset?: boolean) => FriendInfo;
  petFreeze: () => boolean;
  friendTickFoes: (frames: number) => FriendInfo;
  petSetBoss: (mode: string) => FriendInfo;
  goHome: () => boolean;
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
async function openDev(page: Page): Promise<void> {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: CURRENT, value: fixture('kinan-remaster-v1.sample.json') });
  await page.goto(DEV_URL);
  await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object');
}
const call = (page: Page, fn: (k: Dev) => unknown) =>
  page.evaluate((source) => {
    const k = (window as unknown as { __k11: Dev }).__k11;
    return new Function('k', `return (${source})(k)`)(k);
  }, fn.toString());
const info = (page: Page) => call(page, (k) => k.petInfo());
const progress = (page: Page) => call(page, (k) => k.progress());
async function dismissStory(page: Page): Promise<void> {
  for (let i = 0; i < 18 && await page.locator('#dialog').isVisible(); i++) {
    await page.locator('#dialog').click();
    await page.waitForTimeout(35);
  }
  await expect(page.locator('#dialog')).toBeHidden();
}

test.describe('Friend Assist and checkpoint loadout', () => {
  test('World 2 unlocks both friends and the menu allows only one assist or none', async ({ page }) => {
    const errors = watchErrors(page);
    await openDev(page);
    expect((await progress(page)).friendsUnlocked).toEqual([]);
    await call(page, (k) => k.jumpToStage(11));
    await expect(page.locator('#stage')).toBeVisible();
    expect((await progress(page)).friendsUnlocked).toEqual(['milo', 'aiden']);
    await call(page, (k) => k.goHome());
    await page.locator('#menuBtn').click();   /* 2026-10-28: the Shop is in THE MENU (c2-menu.spec.ts) */
    await expect(page.locator('#shopBtn')).toBeVisible();
    await page.locator('#shopBtn').click();   /* Friend Assist lives in the Backpack · Party Shop (pets have their own screen now) */
    await expect(page.locator('#screen h1.title')).toHaveText(/Backpack/);
    await page.locator('[data-friend="milo"]').click();
    expect((await progress(page)).friendAssist).toBe('milo');
    await page.locator('[data-friend="aiden"]').click();
    expect((await progress(page)).friendAssist).toBe('aiden');
    await page.locator('[data-friend=""]').click();
    expect((await progress(page)).friendAssist).toBeNull();
    expect(errors).toEqual([]);
  });

  test('Milo expires platforms after eight seconds and cools down for twenty-five seconds', async ({ page }) => {
    const errors = watchErrors(page);
    await openDev(page);
    await call(page, (k) => k.jumpToStage(11));
    await call(page, (k) => k.friendSet('milo'));
    const built = await call(page, (k) => k.friendCall());
    expect(built.result).toBe(true);
    expect(built.info.platforms).toBeGreaterThan(0);
    expect(built.info.friendCooldown).toBe(1500);
    await call(page, (k) => k.petFreeze());
    const expired = await call(page, (k) => k.petAbilityTick(480));
    expect(expired.platforms).toBe(0);
    expect(expired.friendCooldown).toBe(1020);
    expect((await call(page, (k) => k.petAbilityTick(1020))).friendCooldown).toBe(0);
    expect((await call(page, (k) => k.friendCall())).result).toBe(true);
    expect(errors).toEqual([]);
  });

  test('Aiden heals and distracts for three seconds only once per checkpoint', async ({ page }) => {
    const errors = watchErrors(page);
    await openDev(page);
    await call(page, (k) => k.jumpToStage(11));
    await call(page, (k) => k.friendSet('aiden'));
    const supported = await call(page, (k) => k.petCheckpoint());
    expect(supported.aidenUsed).toBe(true);
    expect(supported.aidenT).toBe(180);
    expect(supported.hp).toBe(2);
    expect(supported.distractedFoes.length).toBeGreaterThan(0);
    await call(page, (k) => k.petFreeze());
    expect((await call(page, (k) => k.friendTickFoes(180))).distractedFoes).toHaveLength(0);
    expect((await call(page, (k) => k.petAbilityTick(180))).aidenT).toBe(0);
    const again = await call(page, (k) => k.petCheckpoint(false));
    expect(again.hp).toBe(1);
    expect(again.aidenUsed).toBe(true);
    expect((await call(page, (k) => k.friendCall())).result).toBe(false);
    expect(errors).toEqual([]);
  });

  test('checkpoint swaps preserve the paused stage and boss attempts explain instead of locking (round-2 P14)', async ({ page }) => {
    const errors = watchErrors(page);
    await openDev(page);
    await call(page, (k) => k.jumpToStage(0));
    await dismissStory(page);
    await call(page, (k) => k.petCheckpoint());
    await page.locator('#menuBtn').click();
    await expect(page.locator('#menu')).toBeVisible();
    await expect(page.locator('#petsBtnP')).toBeEnabled();
    await page.locator('#petsBtnP').click();
    await expect(page.locator('#screen h1.title')).toHaveText('Pets');
    await page.locator('[data-equip="cat2"]').click();
    await page.locator('#petsBack').click();
    await expect(page.locator('#menu')).toBeVisible();
    const swapped = await info(page);
    expect(swapped.checkpoint).toBe(true);
    expect(swapped.equippedCat).toBe('cat2');
    expect(swapped.equippedDog).toBe('dog1');
    expect(swapped.liveCats).toBe(1);
    expect(swapped.liveDogs).toBe(1);
    await call(page, (k) => k.petSetBoss('fight'));
    /* round-2 P14: the button stays tappable — during a boss attempt a tap
       explains where pets can change instead of showing a dead button */
    await expect(page.locator('#petsBtnP')).toBeEnabled();
    await page.locator('#petsBtnP').click();
    await expect(page.locator('#toast')).toContainText('Pets can be changed');
    /* ...and the lock itself still holds: no loadout opens during the attempt */
    await expect(page.locator('#screen')).toBeHidden();
    await expect(page.locator('#menu')).toBeVisible();
    expect((await info(page)).equippedCat).toBe('cat2');
    expect(errors).toEqual([]);
  });
});

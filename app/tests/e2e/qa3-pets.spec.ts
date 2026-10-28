import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* QA 2026-10-28 (MAJOR): pets could not be found — authored levels had no pet rescue, but the title
   promises 4 cats and 2 dogs. Each pet now waits in a crate on the main path of one level (story
   bible: Ginger 1-1, Chikastino 1-5, Vader 2-4, Hunter 3-3, Duchess 4-castle, Tuxedo 5-fort). The
   crate glows with a gold arrow over it and the pet calls out ("MEOW?" / "WOOF?") as Kinan comes
   near; walking into it rescues the pet: it joins the collection, Kinan's "joins the team" line plays
   at that moment (it used to wait for LEVEL CLEAR), and the pet shows on the Pets screen, ready to
   equip. Nothing is equipped for him: he picks who comes along (Ginger's higher jump carries further
   than the levels' jumps were built for, so taking her is his choice). */
const BASE = 'http://127.0.0.1:4174/index.html';
const DEV_URL = `${BASE}?devtools=1`;

type Story = { cur: string | null; queue: string[]; log: { id: string }[] };
type Dev = {
  playLevel: (id: string) => unknown; godMode: () => void; clearFoes: () => void; storyStop: () => void; freeze: (on: boolean) => void;
  auto: (n: number, o?: { run?: boolean }) => unknown; step: (n: number, o?: Record<string, boolean>) => { x: number; y: number; onGround: boolean }[];
  place: (x: number, y: number) => unknown; levelInfo: () => { cleared: boolean; returned: boolean; toast: string }; cut: () => { on: boolean }; cutSkip: () => unknown;
  petSpot: () => { x: number; y: number; pet: string; open: boolean; hinted: boolean } | null; storyInfo: () => Story; storyNext: () => unknown;
  progress: () => { pets: { ids: string[]; equippedCat: string | null; equippedDog: string | null } };
};
type Win = Window & { __k11: Dev; KinanLevels: { ready: boolean } };
const PETS: [string, string, string, string][] = [
  ['1-1', 'cat1', 'Ginger', 'w01_kinan_15'], ['1-5', 'dog1', 'Chikastino', 'w01_kinan_16'], ['2-4', 'cat2', 'Vader', 'w02_kinan_08'],
  ['3-3', 'dog2', 'Hunter', 'w03_kinan_08'], ['4-castle', 'cat3', 'Duchess', 'w04_kinan_12'], ['5-fort', 'cat4', 'Tuxedo', 'w05_kinan_12'],
];

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function boot(page: Page): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
}

test.describe('QA fix: the six pets can be rescued', () => {
  test('each pet waits in its level, a plain run rescues it, and its joins-the-team line plays at the rescue', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    /* one level at a time: the story lines run on timers, so the page gets a moment between levels to say what is queued */
    const out: { res: Record<string, unknown>[]; pets: { ids: string[]; equippedCat: string | null; equippedDog: string | null } } = { res: [], pets: { ids: [], equippedCat: null, equippedDog: null } };
    for (const [id, pet, , line] of PETS) {
      const r = await page.evaluate(({ id, pet }) => {
        const k = (window as unknown as Win).__k11;
        k.playLevel(id); k.godMode(); k.clearFoes(); k.storyStop(); k.freeze(false);
        const crate = k.petSpot();
        let atRescue: string[] | null = null, rescueToast = '';
        for (let f = 0; f < 20000 && !k.levelInfo().cleared; f += 5) {
          k.auto(5, { run: true });
          if (!atRescue && k.progress().pets.ids.indexOf(pet) >= 0) {
            const s = k.storyInfo(); atRescue = [s.cur || ''].concat(s.queue); rescueToast = k.levelInfo().toast;
          }
        }
        const cleared = k.levelInfo().cleared;
        for (let n = 0; n < 900 && !k.levelInfo().returned; n++) k.step(1);   /* the victory lap ends (back to the map), as in play */
        k.freeze(true);
        return { crate, atRescue, rescueToast, cleared };
      }, { id, pet });
      await page.waitForTimeout(400);   /* the story player picks up what waited for the fight */
      /* let everything queued be said: the pet's line is heard to the end (a boss intro may cut it short; it comes back first) */
      const said = await page.evaluate((line) => {
        const k = (window as unknown as Win).__k11;
        if (k.cut().on) k.cutSkip();   /* 2026-10-28: a castle (4-castle) ends in Glitchy's escape on the map: skipped, the story goes on */
        for (let i = 0; i < 12; i++) { const q = k.storyInfo(); if (!q.cur && !q.queue.length) break; k.storyNext(); }
        return (k.progress() as unknown as { storyHeard: Record<string, number> }).storyHeard[line] || 0;
      }, line);
      out.res.push(Object.assign({ id, pet, line, said }, r));
    }
    out.pets = await page.evaluate(() => (window as unknown as Win).__k11.progress().pets);
    for (const r of out.res as { id: string; pet: string; line: string; said: number; crate: unknown; atRescue: string[] | null; rescueToast: string; cleared: boolean }[]) {
      expect(r.crate, r.id).toMatchObject({ pet: r.pet });
      expect(r.cleared, r.id).toBe(true);
      expect(r.atRescue, `${r.id}: rescued on the way`).not.toBeNull();
      expect(r.atRescue, `${r.id}: the joins-the-team line is said at the rescue`).toContain(r.line);
      if (r.id === '1-1') expect(r.rescueToast, r.id).toContain('joined your collection');   /* (later on, Shad's drop-in banner can share that moment) */
      expect(r.said, `${r.id}: the pet line was heard to the end`).toBe(1);
    }
    expect([...out.pets.ids].sort()).toEqual(['cat1', 'cat2', 'cat3', 'cat4', 'dog1', 'dog2']);
    /* nothing was equipped for him: he picks on the Pets screen */
    expect(out.pets.equippedCat).toBeNull();
    expect(out.pets.equippedDog).toBeNull();
    expect(errors).toEqual([]);
  });

  test('walking (SHIFT/X held) rescues them too: Hunter where Kinan drops off the back porch, Vader before the reading-nook chair', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11, out: Record<string, boolean> = {};
      /* 3-3: on the back porch deck (cols 197-207, top row 10), walk off its far end */
      k.playLevel('3-3'); k.godMode(); k.clearFoes(); k.storyStop();
      k.place(202 * 16, 9 * 16 - 2); k.step(10);
      k.step(120, { right: true, fire: true });
      out.hunter = k.progress().pets.ids.indexOf('dog2') >= 0;
      /* 2-4: walk the library floor towards the armchair (cols 203-205) */
      k.playLevel('2-4'); k.godMode(); k.clearFoes(); k.storyStop();
      k.place(188 * 16, 11 * 16); k.step(10);
      k.step(150, { right: true, fire: true });
      out.vader = k.progress().pets.ids.indexOf('cat2') >= 0;
      return out;
    });
    expect(r).toEqual({ hunter: true, vader: true });
    expect(errors).toEqual([]);
  });

  test('the crate calls out as Kinan comes near, and a pet already found leaves no crate behind', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-1'); k.godMode(); k.clearFoes(); k.storyStop();
      const crate = k.petSpot()!;
      k.place(crate.x - 9 * 16, 11 * 16); k.step(3);
      const far = k.petSpot()!.hinted;
      k.step(30, { right: true });
      const near = k.petSpot()!;
      for (let f = 0; f < 200 && k.progress().pets.ids.indexOf('cat1') < 0; f++) k.step(1, { right: true });
      const got = k.progress().pets.ids.indexOf('cat1') >= 0;
      k.playLevel('1-1');
      return { far, near, got, again: k.petSpot(), owned: k.progress().pets.ids };
    });
    expect(r.far).toBe(false);
    expect(r.near).toMatchObject({ hinted: true, open: false });   /* "MEOW?" as he comes within 7 tiles */
    expect(r.got).toBe(true);
    expect(r.again).toBeNull();
    expect(r.owned).toEqual(['cat1']);
    expect(errors).toEqual([]);
  });

  test('a pet walked past is not named at LEVEL CLEAR (its line belongs to the rescue)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-5'); k.godMode(); k.clearFoes(); k.storyStop();
      const g = (k.levelInfo() as unknown as { goal: { x: number; ty: number } }).goal;
      k.place(g.x - 48, (g.ty - 3) * 16); k.step(10);   /* far past Chikastino's crate (col 25) */
      for (let f = 0; f < 300 && !k.levelInfo().cleared; f++) k.step(1, { right: true });
      const s = k.storyInfo();
      return { cleared: k.levelInfo().cleared, talk: [s.cur, ...s.queue], owned: k.progress().pets.ids };
    });
    expect(r.cleared).toBe(true);
    expect(r.owned).toEqual([]);
    expect(r.talk).not.toContain('w01_kinan_16');   /* "Chikastino! Good boy!" */
    expect(errors).toEqual([]);
  });

  test('rescued pets show on the Pets screen and can be equipped (one cat, one dog)', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await boot(page);
    /* before: every card is locked */
    await page.locator('#menuBtn').click(); /* 2026-10-28: Pets / Shop / How to play are in THE MENU (c2-menu.spec.ts) */ 
    await page.locator('#petsBtnP').click();
    await expect(page.locator('.petcard')).toHaveCount(6);
    await expect(page.locator('.petcard.locked')).toHaveCount(6);
    await page.locator('#petsBack').click();
    await page.evaluate((PETS) => {
      const k = (window as unknown as Win).__k11;
      for (const [id] of PETS) {
        k.playLevel(id); k.godMode(); k.clearFoes(); k.storyStop();
        const c = k.petSpot()!;
        k.place(c.x - 40, c.y); k.step(5);
        k.step(60, { right: true });
      }
      k.freeze(true);
    }, PETS);
    expect([...(await page.evaluate(() => (window as unknown as Win).__k11.progress().pets.ids))].sort()).toEqual(['cat1', 'cat2', 'cat3', 'cat4', 'dog1', 'dog2']);
    /* a fresh load (the rescues were saved), then Pets: all six found, none taken along yet */
    await page.goto(DEV_URL);
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    await page.locator('#menuBtn').click(); /* 2026-10-28: Pets / Shop / How to play are in THE MENU (c2-menu.spec.ts) */ 
    await page.locator('#petsBtnP').click();
    await expect(page.locator('.petcard.locked')).toHaveCount(0);
    for (const [, , name] of PETS) await expect(page.locator('.petcard').filter({ hasText: name })).toHaveCount(1);
    await expect(page.locator('.petcard.on')).toHaveCount(0);
    /* take Ginger, then swap her for Duchess, and take Hunter: one cat and one dog */
    await page.locator('.petcard[data-equip="cat1"]').click();
    await expect(page.locator('.petcard[data-equip="cat1"]')).toHaveClass(/\bon\b/);
    await page.locator('.petcard[data-equip="cat3"]').click();
    await page.locator('.petcard[data-equip="dog2"]').click();
    await expect(page.locator('.petcard[data-equip="cat3"]')).toHaveClass(/\bon\b/);
    await expect(page.locator('.petcard[data-equip="dog2"]')).toHaveClass(/\bon\b/);
    await expect(page.locator('.petcard.on')).toHaveCount(2);
    const pets = await page.evaluate(() => (window as unknown as Win).__k11.progress().pets);
    expect(pets.equippedCat).toBe('cat3');
    expect(pets.equippedDog).toBe('dog2');
    /* the equipped pets follow Kinan into a level (their powers ride along) */
    const follow = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11 as unknown as Dev & { petInfo: () => { equippedCat: string; liveCats: number; liveDogs: number; dogs: { id: string }[] } };
      k.playLevel('1-2'); k.freeze(true);
      return k.petInfo();
    });
    expect(follow).toMatchObject({ equippedCat: 'cat3', liveCats: 1, liveDogs: 1 });
    expect(follow.dogs.map((d) => d.id)).toEqual(['dog2']);
    expect(errors).toEqual([]);
  });
});

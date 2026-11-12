import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* QA 2026-10-28 (MAJOR): pets could not be found — authored levels had no pet rescue, but the title
   promises 4 cats and 2 dogs. Each pet now waits in a crate on the main path of one level (story
   bible: Ginger 1-1, Chikastino 1-5, Vader 2-4, Hunter 3-3, Duchess 4-castle, Tuxedo 5-fort). The
   crate glows with a gold arrow over it and the pet calls out ("MEOW?" / "WOOF?") as Kinan comes
   near; walking into it rescues the pet: it joins the collection, Kinan's "joins the team" line plays
   at that moment (it used to wait for LEVEL CLEAR), and the pet shows on the Pets screen.
   Fixes run 2 (Shad, on World 2-3: "I haven't unlocked a pet yet"): the first cat and the first dog
   rescued join the team for real (equipped, following Kinan at once, "GINGER JOINED THE TEAM!");
   a later rescue joins the collection without replacing the one following. */
const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
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
      if (r.id === '1-1') expect(r.rescueToast, r.id).toContain('GINGER JOINED THE TEAM!');   /* fixes run 2: the pet joins the team at the rescue */
      expect(r.said, `${r.id}: the pet line was heard to the end`).toBe(1);
    }
    expect([...out.pets.ids].sort()).toEqual(['cat1', 'cat2', 'cat3', 'cat4', 'dog1', 'dog2']);
    /* fixes run 2: the first cat (Ginger, 1-1) and the first dog (Chikastino, 1-5) joined the team; later rescues did not replace them */
    expect(out.pets.equippedCat).toBe('cat1');
    expect(out.pets.equippedDog).toBe('dog1');
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
    /* a fresh load (the rescues were saved), then Pets: all six found; the first cat and dog rescued joined the team (fixes run 2) */
    await page.goto(DEV_URL);
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    await page.locator('#menuBtn').click(); /* 2026-10-28: Pets / Shop / How to play are in THE MENU (c2-menu.spec.ts) */
    await page.locator('#petsBtnP').click();
    await expect(page.locator('.petcard.locked')).toHaveCount(0);
    for (const [, , name] of PETS) await expect(page.locator('.petcard').filter({ hasText: name })).toHaveCount(1);
    await expect(page.locator('.petcard.on')).toHaveCount(2);
    await expect(page.locator('.petcard[data-equip="cat1"]')).toHaveClass(/\bon\b/);
    await expect(page.locator('.petcard[data-equip="dog1"]')).toHaveClass(/\bon\b/);
    /* swap Ginger for Duchess, and Chikastino for Hunter: still one cat and one dog */
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

/* Fixes run 2 (Shad, on World 2-3: "I haven't unlocked a pet yet"): a rescue left both slots empty, so no pet followed
   Kinan unless he found the Pets menu. Now the first cat and the first dog rescued join the team on the spot. */
type PetLive = { equippedCat: string | null; equippedDog: string | null; liveCats: number; ids: string[]; cats: { id: string; x: number; y: number }[] };
type Win2 = Window & { __k11: Dev & { petInfo: () => PetLive; state: () => { px: number; py: number } } };
test.describe('Fixes run 2: pets join the team', () => {
  test('rescuing Ginger in 1-1 equips her, says GINGER JOINED THE TEAM!, and she follows Kinan at once', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win2).__k11;
      k.playLevel('1-1'); k.godMode(); k.clearFoes(); k.storyStop();
      const before = k.petInfo();
      const c = k.petSpot()!;
      k.place(c.x - 40, c.y); k.step(5);
      let f = 0;
      for (; f < 200 && k.progress().pets.ids.indexOf('cat1') < 0; f++) k.step(1, { right: true });
      const at = k.petInfo(), toast = k.levelInfo().toast;
      /* run on for two seconds: she keeps up with him */
      k.step(120, { right: true });
      const later = k.petInfo(), s = k.state();
      return { before, at, toast, later, px: s.px, rescued: f < 200 };
    });
    expect(r.before).toMatchObject({ equippedCat: null, liveCats: 0 });
    expect(r.rescued).toBe(true);
    expect(r.at).toMatchObject({ equippedCat: 'cat1', liveCats: 1 });
    expect(r.at.cats.map((c) => c.id)).toEqual(['cat1']);
    expect(r.toast).toContain('GINGER JOINED THE TEAM!');
    expect(r.later.cats).toHaveLength(1);
    expect(Math.abs(r.later.cats[0].x - r.px), 'Ginger is right behind Kinan').toBeLessThan(5 * 16);
    expect(errors).toEqual([]);
  });

  test('a cat rescued later joins the collection but does not replace Ginger', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win2).__k11;
      const rescue = (id: string, pet: string) => {
        k.playLevel(id); k.godMode(); k.clearFoes(); k.storyStop();
        const c = k.petSpot()!;
        k.place(c.x - 40, c.y); k.step(5);
        for (let f = 0; f < 200 && k.progress().pets.ids.indexOf(pet) < 0; f++) k.step(1, { right: true });
      };
      rescue('1-1', 'cat1');
      rescue('2-4', 'cat2');
      const p = k.petInfo(), toast = k.levelInfo().toast;
      k.freeze(true);
      return { p, toast };
    });
    expect(r.p.ids).toEqual(['cat1', 'cat2']);
    expect(r.p.equippedCat).toBe('cat1');
    expect(r.p.cats.map((c) => c.id)).toEqual(['cat1']);
    expect(r.toast).toContain('VADER JOINED THE TEAM!');
    expect(r.toast).toContain('Ginger keeps following you');
    expect(errors).toEqual([]);
  });

  test('an old save with Ginger rescued but nothing equipped loads with Ginger following', async ({ page }) => {
    const errors = watchErrors(page);
    const old = JSON.stringify({ unlocked: 1, beaten: [], pets: { ids: ['cat1'], names: {}, equippedCat: null, equippedDog: null } });
    await page.addInitScript((raw) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('kinan-remaster-v1', raw); sessionStorage.setItem('seeded', '1'); } }, old);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win2).__k11;
      const saved = k.progress().pets;
      k.playLevel('1-2'); k.freeze(true);
      return { saved, live: k.petInfo() };
    });
    expect(r.saved).toMatchObject({ ids: ['cat1'], equippedCat: 'cat1', equippedDog: null });
    expect(r.live).toMatchObject({ equippedCat: 'cat1', liveCats: 1 });
    /* sending her home on the Pets screen is still his choice, and it survives a reload */
    await page.reload();
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    await page.locator('#menuBtn').click();
    await page.locator('#petsBtnP').click();
    await page.locator('.petcard[data-equip="cat1"]').click();
    await expect(page.locator('.petcard.on')).toHaveCount(0);
    await page.reload();
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    expect(await page.evaluate(() => (window as unknown as Win).__k11.progress().pets.equippedCat)).toBeNull();
    expect(errors).toEqual([]);
  });
});

/* 2026-11-04 (Shad, final QC): "the cats and the dogs ... when Kinan is over a ledge they just seem to float in the air".
   A following pet now stands on the floor under its OWN feet (index.html petFloorY), not at Kinan's height.
   2026-11-11 (the pet brain): pets now really jump and fall, with gravity, where Kinan jumped (Shad: "they should move
   fluidly like how I do"). The old check counted ANY 12 frames in the air as floating, which a real jump also is. Now a
   pet in the air is floating only when it is not moving like a jump or a fall: gravity speeds a fall up every frame. */
type PetXY = { id: string; x: number; y: number; ground?: boolean };
type Win3 = Window & { __k11: Dev & { grantPets: () => string[]; petEquip: (c: string | null, d: string | null) => unknown; petInfo: () => { cats: PetXY[]; dogs: PetXY[] }; petFloor: (x: number, footY: number) => number; state: () => { px: number; py: number; onGround: boolean }; tile: (tx: number, ty: number) => number } };
test.describe('pets stand on the floor (2026-11-04)', () => {
  test("1-7 (Chenoa's art room): a cat and a dog following Kinan over the ledges stand on the floor under them, never in the air", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win3).__k11;
      k.playLevel('1-7'); k.godMode(); k.clearFoes(); k.storyStop(); k.freeze(false);
      k.grantPets(); k.petEquip('cat1', 'dog1');
      k.playLevel('1-7'); k.godMode(); k.clearFoes(); k.storyStop(); k.freeze(false);
      let samples = 0, floating = 0, worst = 0, ledgeShot: { px: number; py: number; cat: PetXY; dog: PetXY } | null = null;
      const bad: string[] = [];   /* the first floating samples, for the error message */
      const streak: Record<string, number> = {};   /* only a pet that STAYS in the air without falling like a real jump or fall (2 samples in a row) is floating */
      const lastY: Record<string, number> = {}, lastD: Record<string, number> = {};   /* its height and how far it moved down at the last sample (3 frames apart) */
      const air: Record<string, number> = {};   /* samples since it left the ground (the first two hold the take-off, half on the ground) */
      const H = { cat: 10, dog: 11 };
      for (let f = 0; f < 6000 && !k.levelInfo().cleared; f += 3) {
        k.auto(3, { run: true });
        const info = k.petInfo();
        for (const [kind, list] of [['cat', info.cats], ['dog', info.dogs]] as const) {
          for (const p of list) {
            const foot = p.y + H[kind];
            const floor = k.petFloor(p.x, foot);   /* the surface under the pet's own column (its own foot height as the start) */
            if (p.ground) { if (floor !== foot) samples++; streak[kind + p.id] = 0; lastY[kind + p.id] = p.y; lastD[kind + p.id] = 0; air[kind + p.id] = 0; continue; }   /* 2026-11-11: standing (on a slope or a thin platform too, which petFloor does not see) */
            if (floor === foot) continue;            /* nothing to stand on within reach (a pit): it keeps the trail height, by design */
            samples++;
            const gap = floor - foot;                /* how far above the floor its feet are */
            const sk = kind + p.id, d = lastY[sk] == null ? 0 : p.y - lastY[sk], pd = lastD[sk] == null ? d : lastD[sk];
            lastY[sk] = p.y; lastD[sk] = d; air[sk] = (air[sk] || 0) + 1;
            const arc = d - pd >= 2 || d >= 15 || air[sk] <= 2;      /* gravity: over 3 frames a jump or a fall moves down about 4 px more each time (less the rounding) */
            streak[sk] = gap > 3 && !arc ? (streak[sk] || 0) + 1 : 0;
            if (streak[sk] >= 2) { floating++; if (gap > worst) worst = gap; if (bad.length < 10) { const st2 = k.state(); bad.push(`f${f} ${kind} x${Math.round(p.x)} foot${Math.round(foot)} floor${floor} kinan x${st2.px} y${st2.py} ${st2.onGround ? 'ground' : 'air'}`); } }
          }
        }
        /* a picture for Shad: Kinan standing on a raised ledge with the pets on the floor behind him */
        const st = k.state();
        if (!ledgeShot && st.onGround && info.cats[0] && Math.abs(info.cats[0].y - st.py) > 24) ledgeShot = { px: st.px, py: st.py, cat: info.cats[0], dog: info.dogs[0] };
      }
      return { samples, floating, worst, ledgeShot, bad, cleared: k.levelInfo().cleared };
    });
    expect(r.samples, 'pets were sampled over the level').toBeGreaterThan(100);   /* the dev bot crosses 1-7 in about 33 x 30 frames */
    expect(r.floating / r.samples, `pets in the air over a floor: ${r.floating} of ${r.samples} samples (worst ${r.worst} px): ${r.bad.join(' | ')}`).toBeLessThan(0.02);
    expect(errors).toEqual([]);
  });
  test('1-7 picture: Kinan on a ledge, the pets on the floor under them (audit/out/pets-ledge.png)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win3).__k11;
      k.playLevel('1-7'); k.godMode(); k.clearFoes(); k.storyStop(); k.freeze(false);
      k.grantPets(); k.petEquip('cat1', 'dog1');
      k.playLevel('1-7'); k.godMode(); k.clearFoes(); k.storyStop(); k.freeze(false);
      /* walk to the first raised ledge (a surface with floor at least 2 tiles lower just behind it) */
      let shot = null as null | { px: number; py: number; cat: { x: number; y: number }; dog: { x: number; y: number } };
      for (let f = 0; f < 4000 && !shot && !k.levelInfo().cleared; f += 2) {
        k.auto(2, { run: true });
        const st = k.state(), info = k.petInfo();
        if (st.onGround && info.cats[0] && info.cats[0].y - st.py > 20) { k.step(20, { left: false, right: false }); const i2 = k.petInfo(); shot = { px: st.px, py: st.py, cat: i2.cats[0], dog: i2.dogs[0] }; }
      }
      k.freeze(true);
      return shot;
    });
    await page.screenshot({ path: 'audit/out/pets-ledge.png' });
    expect(r, 'Kinan reached a ledge with the pets lower than him').not.toBeNull();
    expect(r!.cat.y, 'the cat is below Kinan (on the lower floor), not beside him in the air').toBeGreaterThan(r!.py + 16);
    expect(errors).toEqual([]);
  });
});

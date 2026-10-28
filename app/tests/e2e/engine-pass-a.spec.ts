import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { devices, expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* Builder-owned (outside the TE globs). Engine pass A — "rules and pets"
   (Shad's rulings in the story bible's "Game rules" section, 27 Oct 2026).
   Every check drives the real engine frame by frame through the dev stepper
   (step(n, hold) = held buttons, tapJump = one key press), the same input path
   a keyboard or the touch pad feeds. */

const BASE = 'http://127.0.0.1:4174/index.html';
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';
const T = 16;

type Hud = { candles: string; gold: string; candleIcon: boolean; goldIcon: boolean };
type Info = {
  id: string | null; cleared: boolean; toast: string; got: number; candlesGot: number; hp: number;
  secretsFound: boolean[]; secretExit: { tx: number; ty: number; to: string; open: boolean } | null;
  goldenSaved: boolean; items: { kind: string; x: number; y: number; secret: number | null }[]; hud: Hud;
  helper: { x: number; toX: number } | null;
};
type Probe = { x: number; y: number; vx: number; vy: number; onGround: boolean };
type Hold = { left?: boolean; right?: boolean; jump?: boolean; tapJump?: boolean; fire?: boolean };
type Dev = {
  playLevel: (id: string) => unknown;
  levelInfo: () => Info;
  godMode: () => void;
  clearFoes: () => void;
  place: (x: number, y: number) => { x: number; y: number };
  step: (n: number, hold?: Hold) => Probe[];
  tile: (tx: number, ty: number) => number;
  progress: () => { goldenCandles?: Record<string, number>; unlockedLevels?: string[] };
  auto: (n: number, opts?: { run?: boolean }) => { paused: boolean; px: number };
};
type Win = { __k11: Dev; KinanLevels?: { ready: boolean } };

const fixture = (name: string): string =>
  readFileSync(fileURLToPath(new URL(`../fixtures/saves/${name}`, import.meta.url)), 'utf8');

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/* seeds the sample save ONCE per tab (a reload keeps what the game saved) */
async function seed(page: Page, pets: unknown = { ids: [], names: {} }): Promise<void> {
  await page.addInitScript(({ key, raw, petsJson }) => {
    if (sessionStorage.getItem('kv-seeded')) return;
    const data = JSON.parse(raw);
    data.pets = JSON.parse(petsJson);
    delete data.explorer;
    localStorage.setItem(key, JSON.stringify(data));
    sessionStorage.setItem('kv-seeded', '1');
  }, { key: CURRENT, raw: fixture('kinan-remaster-v1.sample.json'), petsJson: JSON.stringify(pets) });
}

async function ready(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const w = window as unknown as Win;
    return typeof w.__k11 === 'object' && !!w.KinanLevels && w.KinanLevels.ready;
  });
}

async function boot(page: Page, pets?: unknown): Promise<void> {
  await seed(page, pets);
  await page.goto(DEV_URL);
  await ready(page);
}

test.describe('pass A · candles, golden candles and secret prizes', () => {
  test('a candle pickup counts: walking through floor candles adds each one to the HUD candle counter', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-1'); k.godMode(); k.clearFoes();
      k.step(30);                                    /* settle on the bed */
      const before = k.levelInfo();
      k.step(150, { right: true });                  /* hop off the bed and walk over the floor candles at cols 9-11 */
      const after = k.levelInfo();
      return { before, after };
    });
    expect(r.before.got).toBe(0);
    expect(r.after.candlesGot).toBeGreaterThanOrEqual(3);
    expect(r.after.got).toBe(r.after.candlesGot);              /* every candle touched counted exactly once */
    expect(r.after.hud.candles).toBe(String(r.after.got));     /* the HUD shows the count... */
    expect(r.after.hud.candleIcon).toBe(true);                 /* ...next to a candle icon, not a coin */
    await expect(page.locator('#cnt')).toHaveAttribute('title', /candles/);
    expect(errors).toEqual([]);
  });

  test('a golden candle block: one head bump pays the golden candle, the HUD shows 1/1 and the save keeps it per level', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-1'); k.godMode(); k.clearFoes();
      const before = { tile: k.tile(71, 9), info: k.levelInfo() };
      /* under the desk: the gold block is the desk's underside at (71,9); Kinan stands below it */
      k.place(71 * 16 + 3, 11 * 16);
      k.step(10);
      k.step(40, { tapJump: true, jump: true });
      const after = { tile: k.tile(71, 9), info: k.levelInfo(), saved: k.progress().goldenCandles };
      return { before, after };
    });
    expect(r.before.tile).toBe(3);                    /* an unbumped gift block */
    expect(r.before.info.goldenSaved).toBe(false);
    expect(r.before.info.hud.gold).toBe('0/1');
    expect(r.before.info.hud.goldIcon).toBe(true);    /* the HUD's old star is a golden candle now */
    expect(r.after.tile).toBe(4);                     /* bumped: a used block */
    expect(r.after.info.goldenSaved).toBe(true);
    expect(r.after.saved).toMatchObject({ '1-1': 1 });
    expect(r.after.info.hud.gold).toBe('1/1');
    expect(r.after.info.secretsFound[1]).toBe(true);  /* the golden candle is 1-1's hidden secret */

    /* a reload keeps it (saved per level, not per run) */
    await page.reload();
    await ready(page);
    const again = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      const saved = k.progress().goldenCandles;
      k.playLevel('1-1');
      const one = k.levelInfo();
      k.playLevel('1-2');
      return { saved, one, two: k.levelInfo() };
    });
    expect(again.saved).toMatchObject({ '1-1': 1 });
    expect(again.one.hud.gold).toBe('1/1');
    expect(again.two.hud.gold).toBe('0/1');           /* per level: 1-2's is still out there */
    expect(errors).toEqual([]);
  });

  test("a secret with no gift block floats its prize: 1-5's ledge secret pays a heart and 5 candles", async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-5'); k.godMode(); k.clearFoes();
      const start = k.levelInfo();
      const prize = start.items.find((it) => it.secret === 0)!;
      /* stand on the secret ledge (shelf cols 90-92, row 9) right of the prize, then walk into it */
      k.place(92 * 16 + 2, 8 * 16);
      k.step(8);
      const hp0 = k.levelInfo().hp;
      /* walk left only until the prize is taken (the ledge ends over gap 4; touch auto-runs) */
      for (let f = 0; f < 60 && !k.levelInfo().secretsFound[0]; f++) k.step(1, { left: true });
      return { prize, hp0, after: k.levelInfo() };
    });
    expect(r.prize.kind).toBe('heart');
    expect(r.after.secretsFound[0]).toBe(true);
    expect(r.after.got).toBeGreaterThanOrEqual(5);              /* the bonus candles */
    expect(r.after.hp).toBe(r.hp0 + 1);                         /* the heart (full hearts grow the bar by one) */
    expect(r.after.items.some((it) => it.secret === 0)).toBe(false);
    expect(errors).toEqual([]);
  });

  test("1-7's secret exit: crawl into the painting room, bump the golden block, walk into the door -> SECRET EXIT FOUND and '1-secret' is saved", async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-7'); k.godMode(); k.clearFoes();
      const closed = k.levelInfo().secretExit;
      /* from the raised floor right of the room, crawl left through the gap in its back wall */
      k.place(123 * 16, 160);
      k.step(10);
      let f = 0;
      while (f < 240 && k.step(1, { left: true })[0].x > 118 * 16 + 10) f++;   /* let go early: he slides ~7 px */
      k.step(12, { left: false });
      const inRoom = k.step(1)[0];
      k.step(40, { tapJump: true, jump: true });       /* the golden block in the room's ceiling */
      const opened = k.levelInfo();
      k.step(40, { left: true });                      /* into the door by the painting */
      k.step(80);
      return { closed, inRoom, opened, after: k.levelInfo(), unlocked: k.progress().unlockedLevels, golden: k.progress().goldenCandles };
    });
    expect(r.closed).toMatchObject({ to: '1-secret', open: false });
    expect(Math.floor((r.inRoom.x + 5) / T)).toBe(118);   /* his middle is under the golden block */
    expect(r.opened.secretExit!.open).toBe(true);
    expect(r.opened.goldenSaved).toBe(true);
    expect(r.after.cleared).toBe(true);
    expect(r.after.toast).toContain('SECRET EXIT FOUND');
    expect(r.after.toast).toContain('1-secret');
    expect(r.unlocked).toEqual(['1-secret']);
    expect(r.golden).toMatchObject({ '1-7': 1 });
    expect(errors).toEqual([]);
  });
});

/* ---- pets: one simple power each, automatic (no button) ---- */
type PetInfo = { ids: string[]; names: Record<string, string>; equippedCat: string | null; equippedDog: string | null;
  liveCats: number; liveDogs: number; stunnedFoes: number[]; pulledCoins: number; hunterUsed: boolean; hp: number; maxHp: number };
type PetDev = Dev & { petInfo: () => PetInfo; state: () => { paused: boolean; airJumps: number; px: number }; goHome: () => boolean };
const ALL_PETS = ['cat1', 'cat2', 'cat3', 'cat4', 'dog1', 'dog2'];
const withPets = (cat: string | null, dog: string | null) => ({ ids: ALL_PETS, names: {}, equippedCat: cat, equippedDog: dog });

/* one held jump from 1-1's flat floor (S1): how high, and whether a second press in the air does anything */
async function jumpProbe(page: Page): Promise<{ apex: number; airJumps: number; inAir: boolean; secondPressRose: boolean }> {
  return page.evaluate(() => {
    const k = (window as unknown as { __k11: PetDev }).__k11;
    k.playLevel('1-1'); k.godMode(); k.clearFoes();
    k.place(14 * 16, 11 * 16); k.step(20);
    const y0 = k.step(1)[0].y;
    const up = k.step(60, { tapJump: true, jump: true });
    const apex = y0 - Math.min(...up.map((p) => p.y));
    k.step(30, { jump: false });                                  /* land and settle */
    /* a second full jump, held to just past its top; then JUMP again in mid-air (a double jump would rise) */
    let s = k.step(1, { tapJump: true, jump: true })[0], n = 0;
    while (s.vy <= 0.5 && n < 40) { s = k.step(1, { jump: true })[0]; n++; }
    const inAir = !s.onGround;
    const again = k.step(10, { tapJump: true, jump: true });      /* lands ~14 frames later: the 8-frame buffer has expired */
    return { apex, airJumps: k.state().airJumps, inAir, secondPressRose: again.some((p) => p.vy < -1) };
  });
}

/* falls into the pit at 1-1 cols 89-90 once (dropped over it), and lets the respawn settle */
const PIT_FALL = `(() => { const k = window.__k11; k.place(89 * 16 + 4, 150); k.step(70); return k.petInfo(); })()`;

test.describe('pass A · pets: one simple power each, automatic', () => {
  test('an old save that still says Garfield loads as Ginger, and the next save writes Ginger', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page, { ids: ['cat1', 'dog1'], names: { cat1: 'Garfield', dog1: 'Chikastino' } });
    const p = await page.evaluate(() => (window as unknown as { __k11: PetDev }).__k11.petInfo());
    expect(p.names.cat1).toBe('Ginger');
    expect(p.equippedCat).toBe('cat1');
    await page.locator('#petsBtnT').click();
    await expect(page.locator('#screen h1.title')).toHaveText('Pets');
    await expect(page.locator('[data-equip="cat1"]')).toContainText('Ginger');
    await expect(page.locator('#screen')).not.toContainText('Garfield');
    await page.locator('[data-equip="dog1"]').click();          /* any save (here: leaving the dog home) */
    const stored = await page.evaluate((key) => localStorage.getItem(key), CURRENT);
    expect(stored).toContain('"cat1":"Ginger"');
    expect(stored).not.toContain('Garfield');
    expect(errors).toEqual([]);
  });

  test('the Pets screen is simple: a picture, the name and one power line per pet; one cat + one dog', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page, withPets('cat1', 'dog1'));
    await page.locator('#petsBtnT').click();
    const cards = page.locator('.petcard');
    await expect(cards).toHaveCount(6);
    await expect(page.locator('[data-equip="cat1"]')).toContainText('Jumps higher');
    await expect(page.locator('[data-equip="dog1"]')).toContainText('Barks to stun nearby enemies');
    await expect(page.locator('[data-equip="cat2"]')).toContainText('Finds secrets and pulls in candles');
    await expect(page.locator('[data-equip="dog2"]')).toContainText('Saves you once');
    await expect(page.locator('[data-equip="cat3"]')).toContainText('snack that heals');
    await expect(page.locator('[data-equip="cat4"]')).toContainText('Shrugs off hits');
    for (let i = 0; i < 6; i++) await expect(cards.nth(i).locator('img')).toHaveCount(1);
    await expect(page.locator('#screen input, #screen .hatrow, #screen .shopgrid, #screen [data-friend]')).toHaveCount(0);
    await page.locator('[data-equip="cat4"]').click();       /* a second cat replaces the first: still one cat */
    await page.locator('[data-equip="dog2"]').click();
    await expect(page.locator('.petcard.on')).toHaveCount(2);
    const p = await page.evaluate(() => (window as unknown as { __k11: PetDev }).__k11.petInfo());
    expect(p.equippedCat).toBe('cat4');
    expect(p.equippedDog).toBe('dog2');
    expect(errors).toEqual([]);
  });

  test('Ginger: every jump goes higher, by herself — and 2D has one jump (no double jump)', async ({ page, browser }) => {
    const errors = watchErrors(page);
    await boot(page, withPets('cat1', null));
    const ginger = await jumpProbe(page);
    const ctx2 = await browser.newContext();
    const solo = await ctx2.newPage();
    await boot(solo, withPets(null, null));
    const base = await jumpProbe(solo);
    await ctx2.close();
    expect(base.apex).toBeGreaterThan(60);                       /* the locked §1.1 jump (~4.3 tiles) */
    expect(base.apex).toBeLessThan(75);
    expect(ginger.apex).toBeGreaterThan(base.apex + 10);         /* Ginger: clearly higher */
    expect(ginger.airJumps).toBe(0);
    expect(ginger.inAir).toBe(true);
    expect(ginger.secondPressRose).toBe(false);                  /* no double jump */
    expect(errors).toEqual([]);
  });

  test('Chikastino: barks by himself and stuns a nearby enemy (it stays alive)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page, withPets(null, 'dog1'));
    const r = await page.evaluate(() => {
      const k = (window as unknown as { __k11: PetDev }).__k11;
      k.playLevel('1-1'); k.godMode();
      let stunned: number[] = [], f = 0;
      /* no buttons: Kinan only stays near the first sock (it walks), Chikastino does the rest */
      for (; f < 1100 && !stunned.length; f++) {
        const s = k.state() as unknown as { px: number; foePos: [number, number, string][] };
        const foe = s.foePos[0];
        if (foe && Math.abs(foe[0] - s.px) > 90) k.place(foe[0] + 40, 11 * 16);
        k.step(1);
        stunned = k.petInfo().stunnedFoes;
      }
      return { stunned, frames: f, alive: (k.state() as unknown as { foes: number }).foes };
    });
    expect(r.stunned.length).toBeGreaterThan(0);     /* the bark fired with no button; stunnedFoes lists only LIVE foes */
    expect(r.frames).toBeLessThan(1100);             /* within his 14-second rhythm */
    expect(errors).toEqual([]);
  });

  test('Vader: pulls candles in by himself while Kinan stands still', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page, withPets('cat2', null));
    const r = await page.evaluate(() => {
      const k = (window as unknown as { __k11: PetDev }).__k11;
      k.playLevel('1-1'); k.godMode(); k.clearFoes();
      k.place(16 * 16, 11 * 16);                     /* the candles at cols 9-11 are on screen, out of reach */
      k.step(5);
      const before = k.levelInfo().got;
      let pulled = 0;
      for (let f = 0; f < 600 && !pulled; f++) { k.step(1); pulled = k.petInfo().pulledCoins; }
      k.step(120);
      return { before, pulled, after: k.levelInfo().got, x: k.state().px };
    });
    expect(r.pulled).toBeGreaterThan(0);
    expect(r.after).toBeGreaterThan(r.before);       /* the pulled candles reached him */
    expect(Math.abs(r.x - 16 * 16)).toBeLessThan(4); /* he never moved */
    expect(errors).toEqual([]);
  });

  test('Hunter: saves Kinan once when he would lose his last heart (a pit at 1 heart leaves him at 1)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page, withPets(null, 'dog2'));
    const r = await page.evaluate((pit) => {
      const k = (window as unknown as { __k11: PetDev }).__k11;
      k.playLevel('1-1'); k.godMode(); k.clearFoes();
      const seen: { hp: number; used: boolean }[] = [];
      /* fall in until he is at 1 heart and Dad has been and gone (Dad's one heal per level) */
      for (let n = 0; n < 6; n++) { const p = (0, eval)(pit); seen.push({ hp: p.hp, used: p.hunterUsed }); if (p.hunterUsed) break; }
      return { seen, info: k.levelInfo() };
    }, PIT_FALL);
    const last = r.seen[r.seen.length - 1];
    expect(last.used).toBe(true);                    /* Hunter fired by himself... */
    expect(last.hp).toBe(1);                         /* ...and kept him on his last heart */
    expect(r.seen.slice(0, -1).every((s) => !s.used)).toBe(true);
    expect(errors).toEqual([]);
  });

  test('Duchess: brings a snack that heals a heart, by herself', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page, withPets('cat3', null));
    const r = await page.evaluate((pit) => {
      const k = (window as unknown as { __k11: PetDev }).__k11;
      k.playLevel('1-1'); k.godMode(); k.clearFoes();
      const hurt = (0, eval)(pit) as PetInfo;        /* one pit: 3 -> 2 hearts */
      let f = 0;
      for (; f < 1200 && k.petInfo().hp < hurt.maxHp; f++) k.step(1);
      return { hurt: hurt.hp, max: hurt.maxHp, healed: k.petInfo().hp, frames: f };
    }, PIT_FALL);
    expect(r.hurt).toBe(r.max - 1);
    expect(r.healed).toBe(r.max);
    expect(r.frames).toBeLessThan(1200);
    expect(errors).toEqual([]);
  });

  test('Tuxedo: shrugs off hits — a sock knocks Kinan back half as far', async ({ page, browser }) => {
    const errors = watchErrors(page);
    const knock = async (p: Page) => p.evaluate(() => {
      const k = (window as unknown as { __k11: PetDev }).__k11;
      k.playLevel('1-1');
      k.place(17 * 16, 11 * 16);                     /* the sock at col 19 walks into him */
      for (let f = 0; f < 400; f++) {
        const s = k.step(1)[0];
        if (k.petInfo().hp < 3) return { vx: s.vx, vy: s.vy, hp: k.petInfo().hp };
      }
      return null;
    });
    await boot(page, withPets('cat4', null));
    const tux = await knock(page);
    const ctx2 = await browser.newContext();
    const solo = await ctx2.newPage();
    await boot(solo, withPets(null, null));
    const base = await knock(solo);
    await ctx2.close();
    expect(base).not.toBeNull();
    expect(tux).not.toBeNull();
    expect(Math.abs(base!.vx)).toBeCloseTo(2.4, 1);               /* §1.3 hurt knockback */
    expect(Math.abs(tux!.vx)).toBeCloseTo(Math.abs(base!.vx) / 2, 1);
    expect(Math.abs(tux!.vy)).toBeLessThan(Math.abs(base!.vy));
    expect(errors).toEqual([]);
  });
});

/* ---- no lives, no game over · the Glitchy helper ---- */
type Life = { hp: number; maxHp: number; falls: number; deaths: number; x: number; y: number; paused: boolean; dialog: boolean; offer: boolean; got: number; cp: boolean; toast: string };
const LIFE = `(() => { const k = window.__k11, i = k.levelInfo(), s = k.state();
  return { hp: i.hp, maxHp: s.max, falls: i.falls, deaths: i.deaths, x: s.px, y: s.py, paused: s.paused, dialog: i.dialog, offer: i.helperOffer, got: i.got, cp: i.checkpointHit, toast: i.toast }; })()`;
/* 1-5's gap 5 (cols 125-129, after the checkpoint at col 96): dropped over it, then the respawn settles */
const GAP5_FALL = `(() => { const k = window.__k11; k.place(127 * 16, 150); k.step(90); return null; })()`;
/* the same fall, quick (20 frames: he is under the screen by frame ~17), so Dad's one heal can't arrive in between */
const GAP5_QUICK = `(() => { const k = window.__k11; k.place(127 * 16, 150); k.step(20); return null; })()`;

test.describe('pass A · no lives, no game over, and Glitchy shows the way', () => {
  test('losing the last heart puts Kinan back at the checkpoint with full hearts and every candle he had — no game over, no screen', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(({ life, fall }) => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      const run = (src: string) => (0, eval)(src);
      k.playLevel('1-5'); k.godMode(); k.clearFoes();
      k.step(60, { right: true });                     /* walk over the porch candles */
      k.place(93 * 16, 11 * 16);
      k.step(40, { right: true });                     /* past the checkpoint flag at col 96 */
      k.step(30, { right: false });                    /* let go (a held button stays held between steps) */
      const atCp = run(life);
      const falls: unknown[] = [];
      for (let n = 0; n < 3; n++) { run(fall); falls.push(run(life)); }
      k.step(60);                                      /* the last fall's tumble, then the respawn */
      return { atCp, falls, end: run(life) };
    }, { life: LIFE, fall: GAP5_QUICK });
    const atCp = r.atCp as Life, end = r.end as Life;
    expect(atCp.cp).toBe(true);
    expect(atCp.got).toBeGreaterThan(0);
    expect(end.deaths).toBe(1);                         /* the third pit took the last heart */
    expect(end.hp).toBe(end.maxHp);                     /* back with full hearts */
    expect(Math.abs(end.x - 96 * T)).toBeLessThan(T);   /* at the checkpoint */
    const lastFall = r.falls[2] as Life;                 /* the moment the last heart went (a candle over gap 5 can be grabbed on the way down) */
    expect(lastFall.hp).toBe(0);
    expect(end.got).toBe(lastFall.got);                 /* every candle kept through the restart... */
    expect(end.got).toBeGreaterThanOrEqual(atCp.got);   /* ...including the ones from before the checkpoint */
    expect(end.dialog).toBe(false);                     /* no story box, no game-over screen */
    expect(end.paused).toBe(false);
    expect(end.toast).toContain('checkpoint');
    expect(errors).toEqual([]);
  });

  test('5 deaths in one spot: Glitchy offers to show the way — "No thanks" closes it, play goes on, and nothing changes', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(({ life, fall }) => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      const run = (src: string) => (0, eval)(src);
      k.playLevel('1-5'); k.godMode(); k.clearFoes();
      k.place(93 * 16, 11 * 16); k.step(40, { right: true }); k.step(20, { right: false });
      const seen: Life[] = [];
      for (let n = 0; n < 5; n++) { run(fall); seen.push(run(life)); }
      const frozen = k.step(30, { right: true });
      return { seen, frozenMoved: Math.abs(frozen[frozen.length - 1].x - frozen[0].x) };
    }, { life: LIFE, fall: GAP5_FALL });
    expect(r.seen.slice(0, 4).every((s) => !s.offer)).toBe(true);
    expect(r.seen[4].offer).toBe(true);                 /* the fifth fall in the same spot */
    expect(r.frozenMoved).toBe(0);                      /* the question waits for an answer */
    await expect(page.locator('#glitchyAsk')).toBeVisible();
    await page.locator('#glitchyNo').click();           /* he can say no */
    await expect(page.locator('#glitchyAsk')).toBeHidden();
    const after = await page.evaluate(({ life }) => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      const moved = k.step(30, { right: true });
      const bridge = [125, 126, 127, 128, 129].map((c) => k.tile(c, 12));
      return { state: (0, eval)(life), moved: moved[moved.length - 1].x - moved[0].x, bridge };
    }, { life: LIFE });
    expect((after.state as Life).offer).toBe(false);
    expect(after.moved).toBeGreaterThan(10);            /* play goes on */
    expect(after.bridge).toEqual([0, 0, 0, 0, 0]);      /* no helper platform */
    expect(errors).toEqual([]);
  });

  test('5 deaths in one spot: "Yes" — Glitchy flies the route and a safe platform spans the gap; Kinan crosses and clears the level', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await page.evaluate(({ fall }) => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.playLevel('1-5'); k.godMode(); k.clearFoes();
      k.place(93 * 16, 11 * 16); k.step(40, { right: true }); k.step(20, { right: false });
      for (let n = 0; n < 5; n++) (0, eval)(fall);
    }, { fall: GAP5_FALL });
    await expect(page.locator('#glitchyAsk')).toBeVisible();
    await page.locator('#glitchyYes').click();
    await expect(page.locator('#glitchyAsk')).toBeHidden();
    const r = await page.evaluate(({ life }) => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      const bridge = [125, 126, 127, 128, 129].map((c) => k.tile(c, 12));
      const guide = k.levelInfo().helper;
      const falls0 = (0, eval)(life).falls;
      for (let i = 0; i < 20 && !k.levelInfo().cleared; i++) k.auto(60);
      return { bridge, guide, falls0, end: (0, eval)(life), cleared: k.levelInfo().cleared };
    }, { life: LIFE });
    expect(r.bridge).toEqual([1, 1, 1, 1, 1]);          /* the safe platform over the deadly gap */
    expect(r.guide).not.toBeNull();                     /* Glitchy is flying the way */
    expect((r.end as Life).falls).toBe(r.falls0);       /* crossed without falling */
    expect(r.cleared).toBe(true);
    expect(errors).toEqual([]);
  });
});

/* ---- bricks and hidden blocks; every World 1 level still clears ---- */
type Blocks = { hidden: { tx: number; ty: number; glint: boolean }[]; bricksBroken: number };
test.describe('pass A · bricks break, hidden blocks appear, World 1 still clears', () => {
  test("a brick breaks when Kinan head-bumps it (1-1's brick row)", async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-1'); k.godMode(); k.clearFoes();
      const before = k.tile(48, 9);
      k.place(48 * 16 + 3, 11 * 16); k.step(10);
      const s = k.step(30, { tapJump: true, jump: true });
      const info = k.levelInfo() as unknown as Blocks;
      return { before, after: k.tile(48, 9), broken: info.bricksBroken, top: Math.min(...s.map((p) => p.y)) };
    });
    expect(r.before).toBe(2);
    expect(r.after).toBe(0);                 /* gone */
    expect(r.broken).toBe(1);
    expect(r.top).toBeGreaterThan(9 * T);    /* the bump stopped his rise at the brick's underside */
    expect(errors).toEqual([]);
  });

  test("1-4 Brick City's bricks are its floor, stairs and bridges: they stay put", async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-4'); k.godMode(); k.clearFoes();
      k.place(36 * 16 + 3, 11 * 16); k.step(10);   /* in the room under the first raised bridge */
      k.step(30, { tapJump: true, jump: true });
      return { tile: k.tile(36, 9), broken: (k.levelInfo() as unknown as Blocks).bricksBroken };
    });
    expect(r.tile).toBe(2);
    expect(r.broken).toBe(0);
    expect(errors).toEqual([]);
  });

  test('a hidden gift block is invisible until bumped, glints every 4 seconds, and appears when bumped (1-6)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-6'); k.godMode(); k.clearFoes();
      const start = (k.levelInfo() as unknown as Blocks).hidden;
      /* stand under the booth's overhang; count the glint over 240 frames */
      k.place(121 * 16 + 3, 11 * 16);
      let glints = 0;
      for (let f = 0; f < 240; f++) { k.step(1); if ((k.levelInfo() as unknown as Blocks).hidden.some((h) => h.glint)) glints++; }
      const pixelBefore = k.tile(121, 10);
      k.step(30, { tapJump: true, jump: true });
      return { start, glints, pixelBefore, after: k.tile(121, 10), hiddenAfter: (k.levelInfo() as unknown as Blocks).hidden, golden: k.levelInfo().goldenSaved };
    });
    expect(r.start).toEqual([{ tx: 121, ty: 10, glint: expect.any(Boolean) }]);
    expect(r.glints).toBeGreaterThan(0);          /* a faint glint... */
    expect(r.glints).toBeLessThanOrEqual(12);     /* ...only a few frames in every 4 seconds */
    expect(r.pixelBefore).toBe(3);                /* a real (solid) gift block, just not drawn */
    expect(r.after).toBe(4);                      /* bumped: it appears, used */
    expect(r.hiddenAfter).toEqual([]);
    expect(r.golden).toBe(true);
    expect(errors).toEqual([]);
  });

  test("a hidden block set in a wall pops when Kinan walks into it (1-5's terrace fake wall)", async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-5'); k.godMode(); k.clearFoes();
      k.place(35 * 16, 9 * 16); k.step(10);        /* on the terrace, left of the wall at col 38 */
      k.step(60, { right: true });
      return { tile: k.tile(38, 9), golden: k.levelInfo().goldenSaved, hidden: (k.levelInfo() as unknown as Blocks).hidden };
    });
    expect(r.tile).toBe(4);
    expect(r.golden).toBe(true);
    expect(r.hidden).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('all 10 World 1 levels still reach LEVEL CLEAR from ?devtools=1&level=<id> with auto(30, {run: true})', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = watchErrors(page);
    await seed(page);
    const ids = ['1-1', '1-2', '1-3', '1-4', '1-5', '1-fort', '1-6', '1-7', '1-secret', '1-8'];
    const out: { id: string; cleared: boolean; falls: number; n: number }[] = [];
    for (const id of ids) {
      await page.goto(`${DEV_URL}&level=${id}`);
      await ready(page);
      await page.waitForFunction((want) => (window as unknown as Win).__k11.levelInfo().id === want, id);
      out.push(await page.evaluate((want) => {
        const k = (window as unknown as Win).__k11;
        k.godMode(); k.clearFoes();
        let n = 0;
        for (; n < 400 && !k.levelInfo().cleared; n++) k.auto(30, { run: true });
        const i = k.levelInfo() as unknown as { cleared: boolean; falls: number };
        return { id: want, cleared: i.cleared, falls: i.falls, n };
      }, id));
    }
    for (const lv of out) expect(lv.cleared, `${lv.id} (falls ${lv.falls}, ${lv.n} x auto(30))`).toBe(true);
    console.log('W1 auto(30,{run:true}) clears: ' + out.map((o) => `${o.id} n=${o.n} falls=${o.falls}`).join(' · '));
    expect(errors).toEqual([]);
  });
});

/* ---- phones and tablets: the buttons stay off the play area ---- */
type Box = { l: number; t: number; r: number; b: number; w: number; h: number };
type Layout = { stage: Box; buttons: (Box & { k: string })[]; vw: number; vh: number; scrollW: number; scrollH: number; sideways: boolean; gate: boolean; paused: boolean };
async function layoutOf(page: Page): Promise<Layout> {
  return page.evaluate(() => {
    const box = (el: Element) => { const b = el.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
    const buttons = Array.from(document.querySelectorAll<HTMLElement>('#pad button'))
      .filter((b) => b.offsetParent !== null && !b.hidden && b.getBoundingClientRect().width > 0)
      .map((b) => ({ k: b.dataset.k || '', ...box(b) }));
    return {
      stage: box(document.querySelector('#stage')!), buttons, vw: innerWidth, vh: innerHeight,
      scrollW: document.documentElement.scrollWidth, scrollH: document.documentElement.scrollHeight,
      sideways: document.documentElement.classList.contains('sideways'),
      gate: !(document.querySelector('#portraitGate') as HTMLElement).hidden,
      paused: (window as unknown as { __k11: { state: () => { paused: boolean } } }).__k11.state().paused
    };
  });
}
const overlaps = (a: Box, b: Box) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
async function deviceLevel(browser: import('@playwright/test').Browser, device: string) {
  const ctx = await browser.newContext({ ...devices[device] });
  const page = await ctx.newPage();
  const errors = watchErrors(page);
  await boot(page);
  await page.evaluate(() => (window as unknown as Win).__k11.playLevel('1-1'));
  await page.waitForTimeout(300);
  return { ctx, page, errors };
}
function expectButtonsOffThePicture(L: Layout) {
  expect(L.sideways).toBe(true);
  expect(L.buttons.map((b) => b.k)).toEqual(expect.arrayContaining(['left', 'right', 'jump', 'fire']));
  for (const b of L.buttons) {
    expect(overlaps(b, L.stage), `${b.k} button covers the picture`).toBe(false);
    expect(b.l).toBeGreaterThanOrEqual(0); expect(b.r).toBeLessThanOrEqual(L.vw + 0.5);
    expect(b.t).toBeGreaterThanOrEqual(0); expect(b.b).toBeLessThanOrEqual(L.vh + 0.5);
    expect(Math.min(b.w, b.h), `${b.k} is thumb-sized`).toBeGreaterThanOrEqual(44);
  }
  expect(L.stage.b).toBeLessThanOrEqual(L.vh + 0.5);   /* the whole picture is on screen */
  expect(L.scrollW).toBeLessThanOrEqual(L.vw);          /* no sideways scroll */
}

test.describe('pass A · phones and tablets: the buttons never cover the play area', () => {
  for (const device of ['iPhone 13 landscape', 'iPhone 14 landscape']) {
    test(`${device} (WebKit): the picture fills the height, the buttons sit in the side gutters`, async ({ browser, browserName }) => {
      test.skip(browserName !== 'webkit', 'iPhone sizes are checked in WebKit');
      const { ctx, page, errors } = await deviceLevel(browser, device);
      const L = await layoutOf(page);
      expectButtonsOffThePicture(L);
      expect(L.stage.h).toBeGreaterThanOrEqual(L.vh * 0.82);     /* as big as the screen allows */
      const left = L.buttons.filter((b) => b.k === 'left' || b.k === 'right'), right = L.buttons.filter((b) => b.k === 'jump' || b.k === 'fire');
      for (const b of left) expect(b.r).toBeLessThanOrEqual(L.stage.l);
      for (const b of right) expect(b.l).toBeGreaterThanOrEqual(L.stage.r);
      /* real thumbs: a touch on JUMP jumps */
      const jump = L.buttons.find((b) => b.k === 'jump')!;
      const y0 = await page.evaluate(() => (window as unknown as { __k11: { state: () => { py: number } } }).__k11.state().py);
      await page.touchscreen.tap(jump.l + jump.w / 2, jump.t + jump.h / 2);
      await page.waitForFunction((y) => (window as unknown as { __k11: { state: () => { py: number } } }).__k11.state().py < y - 4, y0, { timeout: 5000 });   /* a quick tap = a short hop (the jump cut on release) */
      expect(errors).toEqual([]);
      await ctx.close();
    });
  }

  test('iPhone 13 portrait (WebKit): the rotate gate shows and the level waits, paused', async ({ browser, browserName }) => {
    test.skip(browserName !== 'webkit', 'iPhone sizes are checked in WebKit');
    const { ctx, page, errors } = await deviceLevel(browser, 'iPhone 13');
    await expect(page.locator('#portraitGate')).toBeVisible();
    const L = await layoutOf(page);
    expect(L.gate).toBe(true);
    expect(L.paused).toBe(true);
    expect(L.scrollW).toBeLessThanOrEqual(L.vw);
    expect(errors).toEqual([]);
    await ctx.close();
  });

  test('Android tablet sideways (Chromium, Galaxy Tab S4): the picture runs full width, the buttons sit under it', async ({ browser, browserName }, info) => {
    test.skip(browserName !== 'chromium' || info.project.name !== 'touch-tablet-chromium', 'Android tablet sizes are checked in the touch Chromium project');
    for (const device of ['Galaxy Tab S4 landscape', 'Galaxy Tab S9 landscape']) {
      const { ctx, page, errors } = await deviceLevel(browser, device);
      const L = await layoutOf(page);
      expectButtonsOffThePicture(L);
      expect(L.stage.w, device).toBeGreaterThanOrEqual(L.vw * 0.8);
      for (const b of L.buttons) expect(b.t, `${device} ${b.k}`).toBeGreaterThanOrEqual(L.stage.b);
      expect(errors).toEqual([]);
      await ctx.close();
    }
  });
});

test('the how-to says it plainly: on a keyboard, hold SHIFT to run — the 4- and 5-tile gaps need it', async ({ page }) => {
  const errors = watchErrors(page);
  await boot(page);
  await page.locator('#howBtn').click();
  await expect(page.locator('#screen')).toContainText('hold SHIFT to run');
  await expect(page.locator('#screen')).toContainText('4 and 5 tiles wide');
  expect(errors).toEqual([]);
});

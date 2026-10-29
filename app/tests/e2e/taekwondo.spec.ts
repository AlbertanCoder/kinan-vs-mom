import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* TAEKWONDO (Shad, 2026-10-28): the real Kinan is a purple belt. Without the Confetti Blaster the POW
   button (X on a keyboard) reads KICK: a quick kick that breaks wooden boards (never bricks), knocks a
   small foe back dizzy (stompable), bats a thrown thing back at whoever threw it, and never touches a
   boss. Belts are the game's levelling (purple, then a step per castle), worked out from the save;
   Sabumnim's belt scene plays once per world after Glitchy's escape, and a returning player gets one
   catch-up scene. index.html blocks "TAEKWONDO", "BELTS" and "BELT SCENES". */
const BASE = 'http://127.0.0.1:4174/index.html';
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';
const T = 16;

type Foe = { type: string; x: number; y: number; alive: boolean; dizzy: number; tough: boolean; arena: boolean };
type Shot = { kind: string; x: number; y: number; vx: number; vy: number; batted: boolean; from: number };
type Kick = {
  kickT: number; kicks: number; face: number; px: number; py: number; vx: number; vy: number; power: string | null;
  boards: [number, number][]; boardsBroken: number; kicked: number; batted: number; blasts: number; hp: number; got: number;
  foes: Foe[]; shots: Shot[]; pow: { text: string; disabled: boolean }; hint: boolean; learned: boolean;
  belt: { rank: number; label: string; color: string; drawn: string | null };
};
type Arena = { state: string; cp: { x: number }; floorY: number; boss: { x: number; y: number; w: number; hp: number; max: number; state: string }; log: { ev: string }[]; shots: unknown[] };
type Dev = {
  playLevel: (id: string) => unknown; place: (x: number, y: number) => unknown; step: (n: number, o?: Record<string, boolean>) => unknown[];
  clearFoes: () => void; addFoe: (type: string, tx: number, ty: number) => number; godMode: () => void; giveItem: (k: string) => string | null;
  paint: (tx: number, ty: number, t: number) => number; tile: (tx: number, ty: number) => number | null; kickInfo: () => Kick; arenaInfo: () => Arena; arenaBot: (n: number) => Arena;
  levelInfo: () => { id: string | null };
};
type Win = Window & { __k11: Dev; KinanLevels: { ready: boolean } };

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
const kick = (page: Page): Promise<Kick> => page.evaluate(() => (window as unknown as Win).__k11.kickInfo());

test.describe('Taekwondo · the kick', () => {
  test('1-1: KICK breaks the board under the bed (a crack, the board is gone) and the candles behind it can be collected', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((T) => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-1'); k.clearFoes();
      const before = k.kickInfo();
      /* Kinan hops off the bed: he lands past the board (it is never in his way) */
      k.step(60, { right: true });
      const past = k.kickInfo();
      /* stand just right of the board, turn to face it, and kick */
      k.place(7 * T + 2, 11 * T); k.step(8, { right: false });
      k.step(1, { left: true }); k.step(10, { left: false });
      const faced = k.kickInfo();
      k.step(1, { tapFire: true }); const pressed = k.kickInfo();
      k.step(12);
      const after = k.kickInfo();
      /* walk in under the bed for the candles the board guarded */
      const got0 = after.got;
      k.step(70, { left: true }); k.step(1, { left: false });
      return { before, past, faced, pressed, after, got0, got1: k.kickInfo().got, x: k.kickInfo().px };
    }, T);
    expect(r.before.boards).toEqual([[6, 11]]);
    expect(r.before.pow).toEqual({ text: 'KICK', disabled: false });
    expect(r.past.px).toBeGreaterThan(7 * T);                    /* hopping off the bed never needs the board broken */
    expect(r.faced.face).toBe(-1);
    expect(r.pressed.kickT).toBeGreaterThan(0);
    expect(r.after.boards).toEqual([]);
    expect(r.after.boardsBroken).toBe(1);
    expect(r.after.learned).toBe(true);
    expect(r.x).toBeLessThan(5 * T);                             /* he walked in under the bed */
    expect(r.got1).toBeGreaterThanOrEqual(r.got0 + 3);            /* the candles behind the board */
    expect(errors).toEqual([]);
  });

  test('1-1: the first time, a hint near the board says how to kick, and Kinan says Sabumnim\'s line', async ({ page }, info) => {
    const errors = watchErrors(page);
    await boot(page);
    await page.evaluate(() => { const k = (window as unknown as Win).__k11; k.playLevel('1-1'); k.clearFoes(); k.step(2); });
    expect((await kick(page)).hint).toBe(true);
    await expect(page.locator('#toast')).toContainText(info.project.name === 'touch-tablet-chromium' ? 'Tap KICK' : 'Press X');
    await page.locator('#cv').screenshot({ path: info.outputPath('board-1-1.png') });   /* for a look by eye (test-results) */
    await page.evaluate(() => (window as unknown as Win).__k11.step(70, { right: true }));
    await expect.poll(async () => page.locator('#storyLine').textContent(), { timeout: 20_000 }).toContain('Sabumnim always says: focus first, then kick!');
    expect(errors).toEqual([]);
  });

  test('every World 1-7 board is a bonus spot: 2-3 per world, each kicked open from beside it with candles behind it', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((T) => {
      const w = window as unknown as Win & { KinanLevels: { list: () => string[]; get: (id: string) => { world: number; areas?: { tiles?: { board?: number[][] } }[]; tiles?: { board?: number[][] } } } };
      const K = w.KinanLevels, k = w.__k11, perWorld: Record<number, number> = {};
      const ids = K.list().filter((id) => { const d = K.get(id); return d.world <= 7 && (d.areas || [d]).some((a) => !!(a.tiles && a.tiles.board)); });
      const res = ids.map((id) => {
        k.playLevel(id); k.godMode(); k.clearFoes();
        const list = k.kickInfo().boards;
        perWorld[K.get(id).world] = (perWorld[K.get(id).world] || 0) + list.length;
        return { id, boards: list.map(([bx, by]) => {
          /* stand just right of the board (on the floor or on its ledge), face it, kick, then step in for what it guarded */
          k.place((bx + 1) * T + 2, by * T); k.step(4, { left: false, right: false });
          k.step(1, { left: true }); k.step(3, { left: false });
          const g0 = k.kickInfo().got;
          k.step(1, { tapFire: true }); k.step(14);
          const open = !k.kickInfo().boards.some(([x, y]) => x === bx && y === by);
          k.step(40, { left: true }); k.step(1, { left: false });
          return { at: [bx, by], open, got: k.kickInfo().got - g0 };
        }) };
      });
      return { res, perWorld };
    }, T);
    for (const lv of r.res) for (const b of lv.boards) {
      expect(b.open, `${lv.id} board ${b.at}: the kick breaks it`).toBe(true);
      expect(b.got, `${lv.id} board ${b.at}: candles behind it`).toBeGreaterThanOrEqual(2);
    }
    for (let n = 1; n <= 7; n++) {
      expect(r.perWorld[n] || 0, `World ${n}: boards`).toBeGreaterThanOrEqual(2);
      expect(r.perWorld[n] || 0, `World ${n}: boards`).toBeLessThanOrEqual(3);
    }
    expect(errors).toEqual([]);
  });

  test('ordinary bricks never break from a kick (some levels use them as floors and bridges)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((T) => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-1'); k.clearFoes();
      k.paint(78, 11, 2);                                        /* a brick right in front of him, at his height */
      k.place(78 * T - 12, 11 * T); k.step(8);
      k.step(1, { right: true }); k.step(8, { right: false });
      const seen: (number | null)[] = [];
      for (let n = 0; n < 4; n++) { k.step(1, { tapFire: true }); k.step(24); seen.push(k.tile(78, 11)); }
      return { kicks: k.kickInfo().kicks, seen, brick: k.tile(78, 11), broken: k.kickInfo().boardsBroken, x: k.kickInfo().px };
    }, T);
    expect(r.kicks).toBe(4);
    expect(r.x + 10).toBeGreaterThan(78 * T - 16);                /* the brick was inside the kick's reach */
    expect(r.seen).toEqual([2, 2, 2, 2]);
    expect(r.brick).toBe(2);
    expect(r.broken).toBe(0);
    expect(errors).toEqual([]);
  });

  test('a kicked small foe is knocked back and dizzy for about 1.5 s, then a stomp beats it; a tough one only flinches', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((T) => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-1'); k.clearFoes();
      k.place(76 * T + 2, 11 * T); k.step(6);
      k.step(1, { right: true }); k.step(6, { right: false });
      k.addFoe('sock', 77, 11);
      k.step(1, { tapFire: true });
      let hit = -1;
      for (let n = 0; n < 16 && hit < 0; n++) { k.step(1); if (k.kickInfo().foes[0].dizzy > 0) hit = n; }
      const kicked = k.kickInfo().foes[0];
      k.step(20);
      const slid = k.kickInfo().foes[0];
      const hp0 = k.kickInfo().hp;
      /* walk into it while it is dizzy: no harm */
      k.step(30, { right: true }); k.step(1, { right: false });
      const bumped = k.kickInfo();
      /* hop on it: the stomp still beats it */
      const f = bumped.foes[0];
      k.place(f.x - 1, f.y - 30); const stomp = k.step(30);
      const after = { alive: k.kickInfo().foes.some((q) => q.alive) };   /* a beaten foe fades out of the list */
      /* a tough foe (a mall walker) only flinches */
      k.clearFoes(); k.place(82 * T + 2, 11 * T); k.step(6);
      k.addFoe('mallwalker', 83, 11);
      k.step(1, { right: true }); k.step(2, { right: false });
      k.step(1, { tapFire: true }); k.step(14);
      const tough = k.kickInfo().foes[0];
      return { hit, kicked, slid, hp0, bumpedHp: bumped.hp, bumpedFoe: bumped.foes[0], after, stomped: stomp.length, tough };
    }, T);
    expect(r.hit).toBeGreaterThanOrEqual(0);
    expect(r.kicked.alive).toBe(true);
    expect(r.kicked.dizzy).toBeGreaterThan(80);                   /* ~90 frames = 1.5 s */
    expect(r.kicked.dizzy).toBeLessThanOrEqual(90);
    expect(r.slid.x - r.kicked.x).toBeGreaterThan(8);              /* knocked back, away from Kinan */
    expect(r.bumpedHp).toBe(r.hp0);
    expect(r.after.alive).toBe(false);                            /* stompable */
    expect(r.tough.alive).toBe(true);
    expect(r.tough.dizzy).toBe(0);                                /* a tough foe only flinches */
    expect(errors).toEqual([]);
  });

  test('a thrown thing is batted back toward whoever threw it', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((T) => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-1'); k.clearFoes(); k.godMode();
      k.place(76 * T + 2, 11 * T); k.step(6);
      k.step(1, { right: true }); k.step(6, { right: false });
      k.addFoe('teacher', 82, 11);
      let pressed = false, batted: Shot | null = null, sawShot = false;
      for (let n = 0; n < 600 && !batted; n++) {
        const s = k.kickInfo().shots[0];
        const me = k.kickInfo();
        if (s && !s.batted) {
          sawShot = true;
          /* will the thing be inside the kick's reach while the leg is out (3 to 10 frames on)? Then press now */
          const bx = me.px + 10 - 3, by = me.py + 2;
          let soon = false;
          for (let t = 3; t <= 10; t++) { const fx = s.x + s.vx * t, fy = s.y + s.vy * t + 0.085 * t * t; if (fx < bx + 18 && fx + 8 > bx && fy < by + 13 && fy + 8 > by) soon = true; }
          if (!pressed && soon) { pressed = true; k.step(1, { tapFire: true }); continue; }
        }
        k.step(1);
        const s2 = k.kickInfo().shots[0];
        if (s2 && s2.batted) batted = s2;
        if (pressed && !k.kickInfo().shots.length && !batted) pressed = false;
      }
      let hitThrower = false;
      for (let n = 0; n < 200 && batted && !hitThrower; n++) { k.step(1); hitThrower = k.kickInfo().foes[0].dizzy > 0; }
      return { sawShot, batted, hitThrower, count: k.kickInfo().batted, hp: k.kickInfo().hp };
    }, T);
    expect(r.sawShot).toBe(true);
    expect(r.batted).not.toBeNull();
    expect(r.batted!.vx).toBeGreaterThan(0);                      /* back toward the teacher, on Kinan's right */
    expect(r.count).toBe(1);
    expect(r.hitThrower).toBe(true);                              /* it lands on the one who threw it */
    expect(errors).toEqual([]);
  });

  test('in a boss arena the kick never touches the boss or its attacks (1-castle)', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-castle'); k.clearFoes(); k.godMode();
      const a0 = k.arenaInfo(); k.place(a0.cp.x - 6, a0.floorY - 18); k.step(20);
      let a = k.arenaInfo();
      for (let f = 0; f < 3000 && a.state !== 'fight'; f++) a = k.arenaBot(1);
      const hp0 = a.boss.hp;
      let kicks = 0;
      for (let n = 0; n < 40; n++) {
        const b = k.arenaInfo().boss;
        k.place(b.x - 12, k.arenaInfo().floorY - 16);
        k.step(1, { right: true }); k.step(1, { right: false });
        const k0 = k.kickInfo().kicks;
        for (let t = 0; t < 40 && k.kickInfo().kicks === k0; t++) k.step(1, { tapFire: true });   /* press until the kick is out */
        k.step(16);
        kicks = k.kickInfo().kicks;
      }
      const a1 = k.arenaInfo();
      return { state: a1.state, hp0, hp1: a1.boss.hp, max: a1.boss.max, kicks, batted: k.kickInfo().batted, kicked: k.kickInfo().kicked, hits: a1.log.filter((e) => e.ev === 'hit' || e.ev === 'stomp').length };
    });
    expect(r.state).toBe('fight');
    expect(r.kicks).toBe(40);
    expect(r.hp1).toBe(r.hp0);
    expect(r.hp1).toBe(r.max);
    expect(r.kicked).toBe(0);
    expect(r.batted).toBe(0);
    expect(errors).toEqual([]);
  });

  test('the POW button reads KICK without a power-up and POW with the Confetti Blaster, which still shoots', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-2'); k.clearFoes();
      k.step(4);
      const plain = k.kickInfo().pow;
      k.giveItem('popper'); k.step(2);
      const blaster = k.kickInfo().pow;
      k.step(1, { tapFire: true }); k.step(1);
      const shot = k.kickInfo();
      return { plain, blaster, blasts: shot.blasts, kickT: shot.kickT, kicks: shot.kicks };
    });
    expect(r.plain).toEqual({ text: 'KICK', disabled: false });
    expect(r.blaster).toEqual({ text: 'POW', disabled: false });
    expect(r.blasts).toBe(1);
    expect(r.kickT).toBe(0);
    expect(r.kicks).toBe(0);
    await expect(page.locator('#powBtn')).toHaveText('POW');
    expect(errors).toEqual([]);
  });

  test('holding X still walks (auto-run on): the kick fires on the press and never slows the walk', async ({ page, browserName }, info) => {
    test.skip(info.project.name === 'touch-tablet-chromium', 'touch always runs; the X key is a keyboard thing');
    const errors = watchErrors(page);
    await boot(page);
    /* 1-1's flat floor from the desk to the bookshelf (cols 74-88) */
    await page.evaluate((T) => { const k = (window as unknown as Win).__k11; k.playLevel('1-1'); k.clearFoes(); k.godMode(); k.place(74 * T, 11 * T); k.step(10); }, T);
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(400);
    const run = await kick(page);
    await page.keyboard.down('KeyX');
    const vs: number[] = [];
    for (let n = 0; n < 6; n++) { await page.waitForTimeout(80); vs.push((await kick(page)).vx); }
    const walk = await kick(page);
    await page.keyboard.up('KeyX');
    await page.keyboard.up('ArrowRight');
    expect(run.vx).toBeGreaterThan(3.1);                          /* running: RUN_MAX 3.2 */
    expect(walk.kicks).toBe(1);                                    /* one press, one kick */
    for (const v of vs.slice(1)) expect(v).toBeCloseTo(1.9, 1);   /* walking: WALK_MAX 1.9, through and after the kick */
    expect(browserName).toBeTruthy();
    expect(errors).toEqual([]);
  });
});

/* ---------------- belts ---------------- */
type Belt = { rank: number; label: string; color: string; key: string; stripes: number; seen: number | null };
type CutS = { on: boolean; mode: string | null; beat: string | null; sub: string; lines: string[]; belt: { rank: number; from: number; catchup: boolean; call: boolean; line: string; lines: string[] } | null };
type MapS = { mounted: boolean; busy: boolean; walking: boolean; crossing: boolean; banner: string | null; notice: string | null; world: number | null; at: number; fly: unknown };
type DevB = Dev & { belt: (p?: { levelsBeaten: Record<string, number> }) => Belt; cut: () => CutS; cutSpeed: (n: number) => number; cutSkip: () => CutS; mapState: () => MapS; progress: () => { beltSeen: number | null; escapes: Record<string, number> };
  levelInfo: () => { id: string | null; cleared: boolean; returned: boolean }; freeze: (on: boolean) => boolean };
type WinB = Window & { __k11: DevB; KinanLevels: { ready: boolean; list: () => string[] } };
const W1 = ['1-1', '1-2', '1-3', '1-4', '1-5', '1-fort', '1-6', '1-7', '1-8', '1-secret'];
const CASTLES_1_6 = Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [`${n}-castle`, 1]));
async function seed(page: Page, data: Record<string, unknown>): Promise<void> {
  await page.addInitScript(({ key, d }) => {
    if (sessionStorage.getItem('tkd-seeded')) return;
    sessionStorage.setItem('tkd-seeded', '1');
    localStorage.setItem(key, JSON.stringify(Object.assign({ unlocked: 1, beaten: [] }, d)));
  }, { key: CURRENT, d: data });
}
const dev = <R,>(page: Page, f: (k: DevB) => R): Promise<R> => page.evaluate(`(${f.toString()})(window.__k11)`) as Promise<R>;
async function settle(page: Page): Promise<MapS> {
  await page.waitForFunction(() => { const k = (window as unknown as WinB).__k11, s = k.mapState(); return s.mounted && !s.walking && !s.crossing && !s.busy && !s.banner && !k.cut().on; }, null, { timeout: 60_000 });
  return dev(page, (k) => k.mapState());
}
const BEAT_CASTLE = `() => {
  const k = window.__k11; k.clearFoes();
  const a0 = k.arenaInfo(); k.place(a0.cp.x - 6, a0.floorY - 18); k.step(20);
  let a = k.arenaInfo();
  for (let f = 0; f < 15000 && a.state !== 'open'; f++) a = k.arenaBot(1);
  for (let n = 0; n < 400 && !k.levelInfo().cleared; n++) k.arenaBot(1);
  for (let n = 0; n < 1500 && !k.levelInfo().returned; n++) k.step(1, { right: true });
  return k.levelInfo();
}`;

test.describe('Taekwondo · belts', () => {
  test('a fresh save is a purple belt; the menu shows it with its icon', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    expect(await dev(page, (k) => k.belt())).toMatchObject({ rank: 0, key: 'purple', stripes: 0, label: 'Purple belt', seen: 0 });
    await page.locator('#menuBtn').click();
    await expect(page.locator('#menuBelt')).toHaveText('Purple belt');
    await expect(page.locator('#menuBelt svg.belticon')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('a save with castles 1-6 beaten is a red belt (no new save version): the menu and the map\'s top bar show it', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await seed(page, { introSeen: true, levelsBeaten: CASTLES_1_6, wmap: { w: 1, at: 0 } });
    await boot(page);
    expect(await dev(page, (k) => k.belt())).toMatchObject({ rank: 6, key: 'red', stripes: 0, label: 'Red belt', color: '#e8202f' });
    /* the stripes table: 1-castle + 2-castle = purple with 2 stripes; up to 5 = blue with 2; 7 = red with 1 */
    expect(await page.evaluate(() => [2, 5, 7, 10, 11, 12].map((n) => { const lb: Record<string, number> = {}; for (let w = 1; w <= n; w++) lb[w + '-castle'] = 1; return (window as unknown as WinB).__k11.belt({ levelsBeaten: lb }).label; })))
      .toEqual(['Purple belt · 2 stripes', 'Blue belt · 2 stripes', 'Red belt · 1 stripe', 'Red-black belt', 'Red-black belt · 1 stripe', 'Black belt']);
    await page.locator('#startBtn').click({ force: true });
    await page.waitForFunction(() => (window as unknown as WinB).__k11.mapState().mounted);
    await dev(page, (k) => k.cutSkip());   /* the catch-up scene (its own test below) */
    await settle(page);
    /* the map's top bar: the belt box with the red belt icon, left of the candles */
    const red = await page.evaluate(() => {
      const c = document.querySelector('#owHost .km-canvas') as HTMLCanvasElement; const sx = c.width / 432;
      const d = c.getContext('2d')!.getImageData(0, 0, c.width, Math.round(30 * sx)).data;
      let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] === 0xe8 && d[i + 1] === 0x20 && d[i + 2] === 0x2f) n++;
      return n;
    });
    expect(red).toBeGreaterThan(20);
    await page.locator('#menuBtn').click();
    await expect(page.locator('#menuBelt')).toHaveText('Red belt');
    expect(errors).toEqual([]);
  });

  test('Kinan\'s sprite wears his belt colour at the waist (purple on a fresh save, red with castles 1-6)', async ({ page }) => {
    const errors = watchErrors(page);
    /* the picture has the game's vignette and faint lines over it, so colours are matched by family, only at his waist
       (sprite rows 12-16 under his shirt): purple = blue over red over green; red = the belt's bright red, not his darker tee */
    const count = (kind: 'purple' | 'red') => page.evaluate((kind) => {
      const c = document.getElementById('cv') as HTMLCanvasElement, s = c.width / 432, D = (window as unknown as { __k11Draw: { sx: number; sy: number } }).__k11Draw;
      const x0 = Math.round((D.sx + 2) * s), y0 = Math.round((D.sy + 12) * s), d = c.getContext('2d')!.getImageData(x0, y0, Math.round(12 * s), Math.round(4 * s)).data;
      let n = 0;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        if (kind === 'purple' ? b > r + 15 && b > g + 40 && r > g + 30 : r > 190 && g < 50 && b < 60) n++;
      }
      return n / (s * s);
    }, kind);
    const pose = async () => { await page.evaluate((T) => { const k = (window as unknown as WinB).__k11; k.playLevel('1-2'); k.clearFoes(); k.place(6 * T, 11 * T); k.step(20); k.freeze(true); }, T); await page.waitForTimeout(250); };
    await boot(page);
    await pose();
    expect((await kick(page)).belt.drawn).toBe('#7b3fc4');
    expect(await count('purple')).toBeGreaterThan(8);
    expect(await count('red')).toBe(0);
    await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ unlocked: 1, beaten: [], introSeen: true, beltSeen: 6, levelsBeaten: { '1-castle': 1, '2-castle': 1, '3-castle': 1, '4-castle': 1, '5-castle': 1, '6-castle': 1 } })), CURRENT);
    await boot(page);
    await pose();
    expect((await kick(page)).belt.drawn).toBe('#e8202f');
    expect(await count('red')).toBeGreaterThan(8);
    expect(await count('purple')).toBe(0);
    expect(errors).toEqual([]);
  });

  test('after the 1-castle: Glitchy escapes, then Sabumnim\'s belt scene plays in person (bow, tie, his line, Kinan bows, NEW BELT!), once only', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = watchErrors(page);
    await seed(page, { introSeen: true, levelsBeaten: Object.fromEntries(W1.map((id) => [id, 1])), unlockedLevels: ['1-secret'], wmap: { w: 1, at: 10 } });
    await boot(page);
    await page.locator('#startBtn').click({ force: true });
    await settle(page);
    expect((await dev(page, (k) => k.cut())).on).toBe(false);   /* no castle beaten yet: no belt owed */
    await dev(page, (k) => k.cutSpeed(3));
    await dev(page, (k) => k.playLevel('1-castle'));
    expect(await page.evaluate(`(${BEAT_CASTLE})()`)).toMatchObject({ cleared: true, returned: true });
    await expect.poll(async () => (await dev(page, (k) => k.cut())).mode, { timeout: 15_000, intervals: [100] }).toBe('escape');
    await expect.poll(async () => (await dev(page, (k) => k.cut())).mode, { timeout: 60_000, intervals: [100] }).toBe('belt');
    await expect(page.locator('#cutCv')).toBeVisible();
    const beats: string[] = [], subs: string[] = [];
    for (let i = 0; i < 2000; i++) {
      const c = await dev(page, (k) => k.cut());
      if (!c.on) break;
      if (c.beat && beats[beats.length - 1] !== c.beat && (c.beat === 'tie' || c.beat === 'banner')) await page.locator('#cutCv').screenshot({ path: test.info().outputPath(`belt-in-person-${c.beat}.png`) });
      if (c.beat && beats[beats.length - 1] !== c.beat) beats.push(c.beat);
      if (c.sub && subs[subs.length - 1] !== c.sub) subs.push(c.sub);
      await page.waitForTimeout(25);
    }
    expect(beats).toEqual(['in', 'bow', 'tie', 'line', 'bowback', 'banner', 'out']);
    expect(subs).toEqual(['SABUMNIM: You kept going, even when it got hard. That is perseverance. Your first stripe.']);
    const c = await dev(page, (k) => k.cut());
    expect(c.belt).toMatchObject({ rank: 1, from: 0, catchup: false, call: false, line: 'belt_w01', lines: ['belt_w01'] });
    expect(c.lines.length).toBeGreaterThan(0);                    /* the escape's own lines are still its record */
    const s = await settle(page);
    expect(s.notice).toBe('THE WAY ON TO THE NEXT WORLD IS OPEN!');   /* the escape's notice, after Sabumnim */
    expect(await dev(page, (k) => k.progress().beltSeen)).toBe(1);
    expect(await dev(page, (k) => k.belt().label)).toBe('Purple belt · 1 stripe');
    /* never again: a reload and PLAY */
    await page.reload();
    await page.waitForFunction(() => !!(window as unknown as WinB).__k11 && (window as unknown as WinB).KinanLevels?.ready);
    await page.locator('#startBtn').click({ force: true });
    await settle(page);
    await page.waitForTimeout(600);
    expect((await dev(page, (k) => k.cut())).on).toBe(false);
    expect(errors).toEqual([]);
  });

  test('a returning player with castles 1-6 already beaten gets ONE catch-up scene by video call ("You have been busy, Kinan.") with the red belt', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await seed(page, { introSeen: true, levelsBeaten: CASTLES_1_6, escapes: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 }, wmap: { w: 1, at: 0 } });
    await boot(page);
    await dev(page, (k) => k.cutSpeed(4));
    await page.locator('#startBtn').click({ force: true });
    await expect.poll(async () => (await dev(page, (k) => k.cut())).mode, { timeout: 20_000, intervals: [100] }).toBe('belt');
    expect((await dev(page, (k) => k.cut())).belt).toMatchObject({ rank: 6, catchup: true, call: true, line: 'belt_catchup' });
    expect(await dev(page, (k) => k.progress().beltSeen)).toBe(6);   /* saved as it starts */
    await expect.poll(async () => (await dev(page, (k) => k.cut())).sub, { timeout: 15_000, intervals: [50] }).toBe('SABUMNIM: You have been busy, Kinan.');
    await page.locator('#cutCv').screenshot({ path: test.info().outputPath('belt-call.png') });
    await expect.poll(async () => (await dev(page, (k) => k.cut())).on, { timeout: 30_000 }).toBe(false);
    await settle(page);
    /* once: a reload and PLAY plays nothing */
    await page.reload();
    await page.waitForFunction(() => !!(window as unknown as WinB).__k11 && (window as unknown as WinB).KinanLevels?.ready);
    await page.locator('#startBtn').click({ force: true });
    await settle(page);
    await page.waitForTimeout(800);
    expect((await dev(page, (k) => k.cut())).on).toBe(false);
    expect(errors).toEqual([]);
  });
});

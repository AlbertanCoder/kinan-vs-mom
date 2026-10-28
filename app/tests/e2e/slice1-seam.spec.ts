import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* Builder-owned focused spec (outside TE globs). M4 — the authored Wild Yard
   (docs/WORLD1-LEVEL-DESIGN.md §2.4 normative) + the §4.1 seam engine.
   M4b (Producer ruling 2026-10-27): the Wild Yard is now level 1-5 THE FRONT
   YARD (levels/w01/l05.js) and its picket arch is the level's goal — levels
   return to the world map. In-level seams still join the areas of one level
   with zero screens (proven below on a two-area level). */

const DEV_URL = 'http://127.0.0.1:4174/index.html?devtools=1';
const CURRENT = 'kinan-remaster-v1';
const T = 16;

type Secret = { kind: string; col: number; row: number; prize: string };
type LevelInfo = {
  id: string | null; area: string | null; areas: { id: string; name: string; from: number; to: number }[];
  seams: { x: number; to: string; done: boolean }[];
  secrets: Secret[]; golden: { col: number; row: number } | null;
  checkpoint: { x: number; tx: number; ty: number } | null; goal: { x: number; tx: number; ty: number } | null; cols: number;
  candles: number; foes: number; gifts: number; newWorld: boolean; cleared: boolean; returned: boolean; screen: boolean; toast: string;
  falls: number;   /* pass A: pit falls this run (a death no longer pauses on a story box) */
};
type Probe = { x: number; y: number; vx: number; vy: number; onGround: boolean; camX: number; camY: number; lead: number; hitStop: number; arenaX: number; arenaW: number; w: number; len: number; boss: string; rows: string[] };
type Dev = {
  playLevel: (idOrDef: unknown) => { id: string; cols: number } | null;
  levelInfo: () => LevelInfo;
  godMode: () => void;
  clearFoes: () => void;
  place: (x: number, y: number) => { x: number; y: number; onGround: boolean };
  step: (n: number, hold?: { left?: boolean; right?: boolean; jump?: boolean; tapJump?: boolean; fire?: boolean }) => Probe[];
  auto: (n: number, opts?: { run?: boolean }) => { px: number; paused: boolean; onGround: boolean };
};
type Win = { __k11: Dev; KinanLevels?: { ready: boolean }; __dlg?: number };

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

async function boot(page: Page): Promise<void> {
  await page.addInitScript(({ key, raw }) => {
    const data = JSON.parse(raw);
    data.codes = [2, 3, 4, 5];
    data.mapWorld = 1;
    data.mapSeen = {};
    data.mapSel = {};
    delete data.explorer;
    data.pets = { ids: [], names: {} };
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: CURRENT, raw: fixture('kinan-remaster-v1.sample.json') });
  await page.goto(DEV_URL);
  await page.waitForFunction(() => {
    const w = window as unknown as Win;
    return typeof w.__k11 === 'object' && !!w.KinanLevels && w.KinanLevels.ready;
  });
}

test.describe('Slice 1 M4 — the authored Wild Yard (level 1-5) + the zero-screen seam (4.1)', () => {
  test('1-5 spawns with every screen carrying its toys (M4 acceptance)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const info = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-5');
      return k.levelInfo();
    });
    expect(info.id).toBe('1-5');
    expect(info.area).toBe('1-5');
    expect(info.newWorld).toBe(true);          /* the new engine runs the yard */
    expect(info.cols).toBe(162);               /* the Wild Yard alone: the 1-2 house stub is gone (levels return to the map) */
    expect(info.candles).toBeGreaterThanOrEqual(28);   /* 29 authored; the one inside the golden-candle block is dropped */
    expect(info.foes).toBe(10);                /* the yard bugs (walker rhythm, ER-10) */
    expect(info.gifts).toBe(3);                /* popper + heart + the golden-candle block */
    expect(errors).toEqual([]);
  });

  test('the 2.4 normative geometry IS the ground under Kinan', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-5'); k.godMode(); k.clearFoes();
      const at = (col: number, fromY = 30): number => {
        k.place(col * 16 + 8, fromY);
        const s = k.step(120);
        return s[s.length - 1].y + 16;         /* the feet */
      };
      return { flat: at(20), browTop: at(13), browFace: at(8), deck: at(68), tunnel: at(68, 170) };
    });
    expect(Math.abs(r.flat - 192)).toBeLessThanOrEqual(1);     /* A1 flat */
    expect(Math.abs(r.browTop - 176)).toBeLessThanOrEqual(1);  /* the brow top (col 13 is clear of the gift) */
    /* the 2:1 face at col 8: xIn 13 -> h 6.5 -> surface 185.5 */
    expect(Math.abs(r.browFace - 185.5)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(r.deck - 128)).toBeLessThanOrEqual(1);     /* the B1 deck top */
    expect(Math.abs(r.tunnel - 192)).toBeLessThanOrEqual(1);   /* the run-under floor, measured from inside the tunnel */
    expect(errors).toEqual([]);
  });

  test('the far lip of every pit is ground at its authored height — never a pillar', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const lips = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-5'); k.godMode(); k.clearFoes();
      /* the first column after gap3 (c52), gap4 (c90) and gap5 (c130): drop
         from y=165 (under Secret-1's semisolid ledge at c90, row 9; open air
         above the 192 ground at all three) and read the feet */
      return [52, 90, 130].map((col) => {
        k.place(col * 16 + 3, 165);
        const s = k.step(120);
        const last = s[s.length - 1];
        return { col, feet: last.y + 16, x: last.x };
      });
    });
    for (const l of lips) {
      expect(Math.abs(l.feet - 192), `col ${l.col}`).toBeLessThanOrEqual(1);   /* 192 = the authored lip height */
      expect(Math.abs(l.x - (l.col * T + 3)), `col ${l.col}`).toBeLessThan(2);   /* landed where placed: no wall pushed him */
    }
    expect(errors).toEqual([]);
  });

  test('spawn to the picket arch is playable: a geometry-only run makes every gap (RUN held)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-5'); k.godMode(); k.clearFoes();
      /* auto() holds right and jumps at gaps and walls, frame-exact. Pass A: a death no
         longer opens a story box (no game over), so every pit fall is counted instead */
      let s = { px: 0, paused: false, onGround: true };
      for (let i = 0; i < 40 && !k.levelInfo().cleared && !s.paused && !k.levelInfo().falls; i++) s = k.auto(60, { run: true });
      return { cleared: k.levelInfo().cleared, paused: s.paused, falls: k.levelInfo().falls, px: s.px };
    });
    expect(r.falls).toBe(0);               /* never fell in a pit (stricter than the old pause check: one fall fails) */
    expect(r.paused).toBe(false);
    expect(r.cleared).toBe(true);          /* walked through the arch */
    expect(r.px).toBeGreaterThan(159 * T);
    expect(errors).toEqual([]);
  });

  test('3 secrets + the golden candle are present (Playbook 4.4 ledger)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const info = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-5');
      return k.levelInfo();
    });
    expect(info.secrets.map((s) => s.kind)).toEqual(['visible', 'hidden', 'skill']);
    expect(info.secrets[1].prize).toBe('GOLDEN CANDLE');
    expect(info.golden).toEqual({ col: 38, row: 9 });          /* inside Secret-2 */
    expect(info.checkpoint).toMatchObject({ tx: 96, ty: 11 });
    expect(errors).toEqual([]);
  });

  test('the picket arch is the goal: LEVEL CLEAR with ZERO screens while Kinan keeps walking', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const w = window as unknown as Win, k = w.__k11;
      k.playLevel('1-5'); k.godMode(); k.clearFoes();
      /* watch the story dialog for the whole walk: the goal may never show a screen */
      w.__dlg = 0;
      const mo = new MutationObserver(() => {
        const d = document.querySelector('#dialog');
        if (d && !(d as HTMLElement).hidden) w.__dlg!++;
      });
      mo.observe(document.querySelector('#dialog')!, { attributes: true, attributeFilter: ['hidden'] });
      k.place(150 * 16, 30);
      k.step(60);                                   /* settle before the arch */
      const s = k.step(100, { right: true, fire: true });   /* walk through it */
      mo.disconnect();
      const info = k.levelInfo();
      return { dlg: w.__dlg, cleared: info.cleared, toast: info.toast, screen: info.screen, lastX: s[s.length - 1].x, moved: s.filter((p) => p.onGround).length > 30 };
    });
    expect(r.cleared).toBe(true);           /* the arch = the goal */
    expect(r.toast).toContain('LEVEL CLEAR');
    expect(r.screen).toBe(false);           /* a banner, never a results screen */
    expect(r.lastX).toBeGreaterThan(160 * T);   /* past the arch, still walking */
    expect(r.dlg).toBe(0);                  /* ZERO screens */
    expect(r.moved).toBe(true);
    expect(errors).toEqual([]);
  });

  test('an in-level seam joins two areas of one level with ZERO screens (4.1)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const w = window as unknown as Win, k = w.__k11;
      const flat = (n: number) => Array.from({ length: n }, () => 192);
      /* a draft two-area level (not registered): the porch, then the house */
      k.playLevel({
        id: '1-8', world: 1, slot: 10, name: 'SEAM PROBE', noSecrets: 'engine probe',
        areas: [
          { id: 'probe-yard', name: 'THE YARD', cols: 27, heights: flat(27), foes: [[8, 11, 'sock']] },
          { id: 'probe-house', name: 'THE HOUSE', cols: 27, heights: flat(27), tiles: { gift: [[8, 8]] }, goal: { col: 24, row: 11 } }
        ]
      });
      k.godMode(); k.clearFoes();
      w.__dlg = 0;
      const mo = new MutationObserver(() => { if (!(document.querySelector('#dialog') as HTMLElement).hidden) w.__dlg!++; });
      mo.observe(document.querySelector('#dialog')!, { attributes: true, attributeFilter: ['hidden'] });
      const before = k.levelInfo();
      k.place(20 * 16, 150); k.step(30);
      const s = k.step(80, { right: true, fire: true });
      mo.disconnect();
      const info = k.levelInfo();
      return { before: before.area, seams: before.seams.length, area: info.area, done: info.seams[0].done, toast: info.toast, lastX: s[s.length - 1].x, dlg: w.__dlg, cleared: info.cleared };
    });
    expect(r.before).toBe('probe-yard');
    expect(r.seams).toBe(1);
    expect(r.area).toBe('probe-house');     /* walked into the next area */
    expect(r.done).toBe(true);
    expect(r.toast).toContain('THE HOUSE');  /* a banner slides in */
    expect(r.lastX).toBeGreaterThan(27 * T);
    expect(r.cleared).toBe(false);          /* the seam is not the goal */
    expect(r.dlg).toBe(0);                  /* ZERO screens — the walk never stopped */
    expect(errors).toEqual([]);
  });
});

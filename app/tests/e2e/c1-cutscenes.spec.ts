import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* C1 — the cutscenes (2026-10-28, Shad's picks; index.html block "CUTSCENES", map/engine.js fly()).
   THE OPENING: the first PLAY of a new save plays Kinan's bedroom (he wakes up, Shad's gift-card message, one
   little peek, Glitchy bursts out, zips past Mom, out of the window), then Glitchy across World 1's real map, and
   lands on World 1, stop 1. Skippable (a tap, any key, SKIP), never again on that save, replayable.
   THE ESCAPE: back on the map after a castle win Glitchy runs off into the next world (once per world).
   The cutscenes run faster here with __k11.cutSpeed(n) (the same frames, n times quicker). */
const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

type Line = [string, string, number, string | null];
type Story = { lines: Record<string, Line>; exit: Record<string, string[]>; intro: Record<string, string[]>; cutscene: string[] };
type Cut = { on: boolean; mode: string | null; phase: string | null; beat: string | null; t: number; total: number; replay: boolean; lines: string[]; sub: string };
type Fly = { kind: string; phase: string; leg: number; legs: number; world: number; home: string } | null;
type MapState = { mounted: boolean; busy: boolean; world: number | null; at: number; walking: boolean; crossing: boolean; banner: string | null; notice: string | null; fly: Fly; stops: { id: string | null; state: string | null }[] };
type Dev = {
  cut: () => Cut; cutSpeed: (n: number) => number; cutSkip: () => Cut; mapState: () => MapState; mapWarp: (n: number, at: number) => MapState | null;
  progress: () => { introSeen: boolean; wmap: { w: number; at: number } | null; escapes: Record<string, number>; storyHeard: Record<string, number>; levelsBeaten: Record<string, number> };
  storyInfo: () => { cur: string | null; queue: string[] }; levelInfo: () => { id: string | null; cleared: boolean; returned: boolean };
  playLevel: (id: string) => unknown; place: (x: number, y: number) => unknown; step: (n: number, o?: Record<string, boolean>) => unknown; clearFoes: () => void;
  arenaInfo: () => { state: string; cp: { x: number }; floorY: number }; arenaBot: (n: number) => { state: string };
};
type Win = Window & { __k11: Dev; KinanLevels: { ready: boolean; list: () => string[] }; KINAN: { speed: (n: number) => number; fly: (k: string, o: Record<string, unknown>) => boolean; state: () => MapState } };

const STORY: Story = (() => {
  const c: Record<string, unknown> = {}; c.self = c;
  new Function('self', readFileSync(`${ROOT}audio/lines/lines.js`, 'utf8'))(c);
  return c.KINAN_STORY as Story;
})();
const W1 = ['1-1', '1-2', '1-3', '1-4', '1-5', '1-fort', '1-6', '1-7', '1-8', '1-secret'];

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
/* a save written once per test (a reload keeps what the game saved) */
async function seed(page: Page, data: Record<string, unknown>): Promise<void> {
  await page.addInitScript(({ key, d }) => {
    if (sessionStorage.getItem('c1-seeded')) return;
    sessionStorage.setItem('c1-seeded', '1');
    localStorage.setItem(key, JSON.stringify(Object.assign({ unlocked: 1, beaten: [] }, d)));
  }, { key: CURRENT, d: data });
}
async function boot(page: Page, url = DEV_URL): Promise<void> {
  await page.goto(url);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
}
const cut = (page: Page): Promise<Cut> => page.evaluate(() => (window as unknown as Win).__k11.cut());
const mapState = (page: Page): Promise<MapState> => page.evaluate(() => (window as unknown as Win).__k11.mapState());
const progress = (page: Page) => page.evaluate(() => (window as unknown as Win).__k11.progress());
async function settle(page: Page, timeout = 45_000): Promise<MapState> {
  await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.walking && !s.crossing && !s.busy && !s.banner && !(window as unknown as Win).__k11.cut().on; }, null, { timeout });
  return mapState(page);
}
/* the castle fight, played by the boss bot through the real inputs, to LEVEL CLEAR and back to the map */
const BEAT_CASTLE = `() => {
  const k = window.__k11; k.clearFoes();
  const a0 = k.arenaInfo(); k.place(a0.cp.x - 6, a0.floorY - 18); k.step(20);
  let a = k.arenaInfo();
  for (let f = 0; f < 15000 && a.state !== 'open'; f++) a = k.arenaBot(1);
  for (let n = 0; n < 400 && !k.levelInfo().cleared; n++) k.arenaBot(1);
  for (let n = 0; n < 1500 && !k.levelInfo().returned; n++) k.step(1, { right: true });
  return k.levelInfo();
}`;

test.describe('C1 · the opening cutscene', () => {
  test('a new save: PLAY plays the bedroom beat by beat with voices and subtitles, then Glitchy across World 1, and lands on World 1, stop 1', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await boot(page);
    /* 2x: every bedroom beat lasts long enough to be seen by polling, even on a slow browser frame (the shortest is 0.9 s) */
    await page.evaluate(() => (window as unknown as Win).__k11.cutSpeed(2));
    await expect(page.locator('#startBtn')).toContainText('PLAY');
    await page.locator('#startBtn').click({ force: true });   /* PLAY pulses (the "beat" animation) */
    await expect(page.locator('#cut')).toBeVisible();
    await expect(page.locator('#cutCv')).toBeVisible();
    await expect(page.locator('#cutSkip')).toBeVisible();
    /* the bedroom: every beat in order, each line with its subtitle; Shad is only the gift card */
    const beats: string[] = [], subs: string[] = [];
    let painted = 0;
    const colours = () => page.evaluate(() => { const c = document.getElementById('cutCv') as HTMLCanvasElement; const d = c.getContext('2d')!.getImageData(0, 0, 432, 240).data; const cols = new Set<number>(); for (let i = 0; i < d.length; i += 4 * 97) cols.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]); return cols.size; });
    for (let i = 0; i < 1500; i++) {
      const c = await cut(page);
      if (c.phase !== 'room') break;
      if (c.beat && beats[beats.length - 1] !== c.beat) beats.push(c.beat);
      if (c.sub && subs[subs.length - 1] !== c.sub) subs.push(c.sub);
      if (c.beat === 'peek' && !painted) painted = await colours();   /* mid-bedroom (it ends in a fade to black) */
      await page.waitForTimeout(40);
    }
    await page.evaluate(() => { const w = window as unknown as Win; w.__k11.cutSpeed(8); if (w.KINAN) w.KINAN.speed(8); });   /* the map part, quicker */
    expect(beats).toEqual(['dawn', 'wake', 'card', 'peek', 'burst', 'zip', 'mom', 'window', 'fade']);
    expect(subs).toEqual(expect.arrayContaining(["SHAD (GIFT CARD): Don't open this until I get there!", 'MOM: Kinan, NO!', "KINAN: It's my birthday! I'm eleven!"]));
    /* the bedroom was really drawn (the room's pixels, not a blank canvas) */
    expect(painted).toBeGreaterThan(8);
    /* the map: the camera follows Glitchy through World 1 (Kinan waits at stop 1), then the player has the map */
    await expect.poll(async () => (await mapState(page)).fly?.kind ?? null, { timeout: 20_000, intervals: [100] }).toBe('intro');
    const f = (await mapState(page)).fly!;
    expect(f).toMatchObject({ world: 1, home: '1:0' });
    await expect(page.locator('#cutCv')).toBeHidden();    /* over the map only the subtitle and SKIP show */
    await expect.poll(async () => (await cut(page)).on, { timeout: 40_000 }).toBe(false);
    await expect(page.locator('#cut')).toBeHidden();
    const s = await settle(page);
    expect(s).toMatchObject({ mounted: true, world: 1, at: 0, fly: null });
    expect(s.stops[0]).toMatchObject({ id: '1-1', state: 'open' });
    const c = await cut(page);
    expect(c.lines).toEqual(STORY.cutscene);
    expect(STORY.cutscene).toEqual(['w01_kinan_19', 'w01_shad_05', 'w01_kinan_02', 'w01_glitchy_01', 'w01_kinan_03', 'w01_mom_12', 'w01_glitchy_02', 'gen_kinan_24', 'w01_kinan_20']);
    for (const id of STORY.cutscene) expect(STORY.lines[id][3], id).toMatch(/^audio\/lines\/(w01|gen)\/.+\.mp3$/);   /* each one a clip in the picked voices */
    const p = await progress(page);
    expect(p.introSeen).toBe(true);
    expect(p.wmap).toEqual({ w: 1, at: 0 });
    /* World 1's map intro goes on from where the bedroom ends: Mom's room rule (2026-10-29: the intro was cut to 5 lines,
       Shad's "did you open it?!" went: no conversation over 5 lines) */
    await expect.poll(async () => (await page.evaluate(() => (window as unknown as Win).__k11.storyInfo())).cur, { timeout: 10_000 }).toBe('w01_mom_01');
    expect(errors).toEqual([]);
  });

  test('skip: SKIP, a tap anywhere or any key ends it at once; skipped in the bedroom it lands on World 1, stop 1; on the map the key never launches a level', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    /* SKIP, right away */
    await boot(page);
    await page.locator('#startBtn').click({ force: true });
    await expect(page.locator('#cut')).toBeVisible();
    await page.locator('#cutSkip').click();
    await expect(page.locator('#cut')).toBeHidden();
    expect(await settle(page)).toMatchObject({ world: 1, at: 0 });
    expect((await progress(page)).introSeen).toBe(true);
    /* a tap on the picture, in the middle of the bedroom (a new save again) */
    await page.evaluate((k) => { localStorage.removeItem(k); localStorage.removeItem(k + '-backup'); }, CURRENT);
    await boot(page);
    expect((await progress(page)).introSeen).toBe(false);
    await page.locator('#startBtn').click({ force: true });
    await expect.poll(async () => (await cut(page)).beat).toBe('wake');
    await page.locator('#cut').click({ position: { x: 200, y: 200 } });
    await expect(page.locator('#cut')).toBeHidden();
    expect(await settle(page)).toMatchObject({ world: 1, at: 0 });
    await expect(page.locator('#stage')).toBeHidden();
    /* a key, while Glitchy runs on the map: the map never sees it (Enter would have launched 1-1) */
    await page.evaluate((k) => { localStorage.removeItem(k); localStorage.removeItem(k + '-backup'); }, CURRENT);
    await boot(page);
    await page.evaluate(() => (window as unknown as Win).__k11.cutSpeed(8));
    await page.locator('#startBtn').click({ force: true });
    await expect.poll(async () => (await mapState(page)).fly?.phase ?? null, { timeout: 30_000 }).toBe('run');
    await page.keyboard.press('Enter');
    await expect(page.locator('#cut')).toBeHidden();
    const s = await settle(page);
    expect(s).toMatchObject({ world: 1, at: 0, fly: null });
    await page.waitForTimeout(600);
    await expect(page.locator('#stage')).toBeHidden();
    expect(await page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBeNull();
    expect(errors).toEqual([]);
  });

  test('it plays once per save: a second launch goes straight to the map; Watch the intro plays it again and never moves Kinan\'s saved spot', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await boot(page);
    await page.locator('#startBtn').click({ force: true });
    await page.locator('#cutSkip').click();
    await settle(page);
    /* a second launch: PLAY goes straight to the map, no cutscene */
    await page.reload();
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    await expect(page.locator('#startBtn')).toContainText('CONTINUE');
    await page.locator('#startBtn').click({ force: true });
    await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy; });
    expect((await cut(page)).on).toBe(false);
    await expect(page.locator('#cut')).toBeHidden();
    /* later the player is in World 2: watching it again shows World 1 for the chase, then comes back to his spot */
    await page.evaluate(() => (window as unknown as { __k11: { storyStop: () => boolean } }).__k11.storyStop());   /* no story line can save over the edit below */
    await page.evaluate((key) => {
      const d = JSON.parse(localStorage.getItem(key)!);
      d.levelsBeaten = Object.fromEntries(['1-1', '1-2', '1-3', '1-4', '1-5', '1-fort', '1-6', '1-7', '1-8', '1-castle', '2-1', '2-2', '2-3'].map((id) => [id, 1]));
      d.wmap = { w: 2, at: 3 }; d.escapes = { 1: 1 };
      localStorage.setItem(key, JSON.stringify(d));
    }, CURRENT);
    await page.reload();
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    await page.locator('#startBtn').click({ force: true });
    expect(await settle(page)).toMatchObject({ world: 2, at: 3 });
    await page.evaluate(() => (window as unknown as Win).__k11.cutSpeed(8));
    await openReplay(page);
    await expect(page.locator('#cut')).toBeVisible();
    expect(await cut(page)).toMatchObject({ on: true, mode: 'intro', replay: true });
    await expect.poll(async () => (await mapState(page)).fly?.kind ?? null, { timeout: 30_000, intervals: [100] }).toBe('intro');
    expect((await mapState(page)).world).toBe(1);
    await expect.poll(async () => (await cut(page)).on, { timeout: 40_000 }).toBe(false);
    expect(await settle(page)).toMatchObject({ world: 2, at: 3 });   /* back on the map where he was */
    expect((await progress(page)).wmap).toEqual({ w: 2, at: 3 });
    expect((await cut(page)).lines).toEqual(STORY.cutscene);
    expect(errors).toEqual([]);
  });
});

/* Watch the intro: THE MENU's entry (c2-menu.spec.ts) */
async function openReplay(page: Page): Promise<void> {
  await page.locator('#menuBtn').click();
  await expect(page.locator('#introBtn')).toBeVisible();
  await page.locator('#introBtn').click();
}

test.describe('C1 · Glitchy escapes after a castle', () => {
  test('the 1-castle won: back on the map Glitchy runs off into World 2 with the exit lines, Kinan stays at the castle; once only', async ({ page }) => {
    test.setTimeout(150_000);
    const errors = watchErrors(page);
    await seed(page, { introSeen: true, levelsBeaten: Object.fromEntries(W1.map((id) => [id, 1])), unlockedLevels: ['1-secret'], wmap: { w: 1, at: 10 } });
    await boot(page);
    await page.locator('#startBtn').click({ force: true });
    await settle(page);
    expect((await cut(page)).on).toBe(false);   /* standing at a castle not beaten yet: nothing plays */
    await page.evaluate(() => (window as unknown as Win).__k11.cutSpeed(3));
    await page.evaluate(() => (window as unknown as Win).__k11.playLevel('1-castle'));
    const info = await page.evaluate(`(${BEAT_CASTLE})()`) as { cleared: boolean; returned: boolean };
    expect(info).toMatchObject({ cleared: true, returned: true });
    await expect.poll(async () => (await cut(page)).mode, { timeout: 15_000, intervals: [100] }).toBe('escape');
    await expect(page.locator('#cut')).toBeVisible();
    /* the camera follows him over the seam into World 2; Kinan's spot stays the castle */
    const seen = new Set<number>();
    for (let i = 0; i < 300; i++) {
      const s = await mapState(page);
      if (!s.fly) break;
      seen.add(s.fly.world);
      expect(s.fly.home).toBe('1:10');
      await page.waitForTimeout(60);
    }
    expect([...seen]).toEqual(expect.arrayContaining([1, 2]));
    await expect.poll(async () => (await cut(page)).on, { timeout: 20_000 }).toBe(false);
    const s = await settle(page);
    expect(s).toMatchObject({ world: 1, at: 10 });
    expect(s.stops[10].state).toBe('beaten');
    expect(s.notice).toBe('THE WAY ON TO THE NEXT WORLD IS OPEN!');
    const c = await cut(page);
    expect(c.lines).toEqual(STORY.exit['1']);   /* "Beep! Boop-boop!", "He jumped in the school bus!", "Stay on him, bud." */
    const p = await progress(page);
    expect(p.escapes).toEqual({ 1: 1 });
    for (const id of STORY.exit['1']) expect(p.storyHeard[id], id).toBe(1);
    /* a second visit never replays it: a reload and PLAY, then the castle won again */
    await page.reload();
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    await page.locator('#startBtn').click({ force: true });
    await settle(page);
    await page.waitForTimeout(500);
    expect((await cut(page)).on).toBe(false);
    await page.evaluate(() => (window as unknown as Win).__k11.playLevel('1-castle'));
    expect(await page.evaluate(`(${BEAT_CASTLE})()`)).toMatchObject({ cleared: true, returned: true });
    await page.waitForFunction(() => { const s = (window as unknown as Win).__k11.mapState(); return s.mounted && !s.busy; });
    await page.waitForTimeout(800);
    expect((await cut(page)).on).toBe(false);
    expect((await mapState(page)).fly).toBeNull();
    expect(errors).toEqual([]);
  });

  test('skip: SKIP ends the escape at once with Kinan at the castle; the lines not heard play later when he walks into World 2', async ({ page }) => {
    test.setTimeout(150_000);
    const errors = watchErrors(page);
    await seed(page, { introSeen: true, levelsBeaten: Object.fromEntries(W1.map((id) => [id, 1])), unlockedLevels: ['1-secret'], wmap: { w: 1, at: 10 } });
    await boot(page);
    await page.locator('#startBtn').click({ force: true });
    await settle(page);
    await page.evaluate(() => (window as unknown as Win).__k11.playLevel('1-castle'));
    expect(await page.evaluate(`(${BEAT_CASTLE})()`)).toMatchObject({ cleared: true, returned: true });
    await expect.poll(async () => (await cut(page)).mode, { timeout: 15_000, intervals: [100] }).toBe('escape');
    await expect.poll(async () => (await mapState(page)).fly?.phase ?? null).toBe('run');
    await page.locator('#cutSkip').click();
    await expect(page.locator('#cut')).toBeHidden();
    const s = await settle(page);
    expect(s).toMatchObject({ world: 1, at: 10, fly: null, notice: 'THE WAY ON TO THE NEXT WORLD IS OPEN!' });
    expect((await progress(page)).escapes).toEqual({ 1: 1 });
    /* on to World 2: the exit lines the skip cut off are said on arrival */
    await page.locator('#owNext').click();
    const s2 = await settle(page);
    expect(s2).toMatchObject({ world: 2, at: 0 });
    const q = await page.evaluate(() => (window as unknown as Win).__k11.storyInfo());
    expect([q.cur, ...q.queue]).toEqual(expect.arrayContaining([STORY.exit['1'][STORY.exit['1'].length - 1]]));
    expect(errors).toEqual([]);
  });

  /* 2026-10-28: World 6 (Drumheller) is released (OW_RELEASED 6), so the "coming soon" sign moved one world on: it was
     "World 6 is not in this build" past the 5-castle; the same checks stood past the 6-castle for World 7.
     2026-10-28 (later): World 7 (Vancouver) is released too (OW_RELEASED 7), so the same checks now stand past the
     7-castle for World 8. The road out of World 7 crosses straight into World 8 (no road-trip world between them).
     2026-10-29: World 8 (Toronto) is released too (OW_RELEASED 8), so the same checks now stand past the 8-castle for
     World 9. The road out of World 8 (the rail to Montreal) crosses straight into World 9.
     2026-10-29 (later): World 9 (Montreal) is released too (OW_RELEASED 9), so the same checks stood past the
     9-castle for World 10 (the boat road trip, World 9.5, lies between them).
     2026-10-29 (World 10's second run): World 10 (Niagara Falls) is released too (OW_RELEASED 10), so the same checks
     stood past the 10-castle for World 11 (no road between them: World 10 glitches into World 11).
     2026-10-30 (v54): World 11 (Inside the Console) is released too (OW_RELEASED 11), so the same checks now stand past
     the 11-castle for World 12 (3D Saskatoon: the 2D-to-3D change lies between them).
     2026-10-30 (the World 12 SNEAK PEEK, Shad's decision): World 12 itself is still not released (OW_RELEASED stays 11), but four of
     its levels are playable, so the sign past the 11-castle is now a "SNEAK PEEK!" sign (Glitchy still waving) and the way on is
     OPEN: Kinan walks through it and the 2D-to-3D change plays into World 12's 3D map. The "coming soon" side of World 12 (every
     stop but the four) is in w12-preview.spec.ts; the sign with the world released is still "gone", as this test always checked */
  test('World 12 is a sneak peek in this build: past the World 11 castle stands a "SNEAK PEEK!" sign with Glitchy waving, and Kinan walks on through it into the 3D map, which says so', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    /* every World 1-11 level beaten, the escape already seen, standing on the 11-castle (World 12 is not released: only its sneak peek is open) */
    await page.evaluate((key) => {
      const ids = (window as unknown as Win).KinanLevels.list().filter((id) => Number(id.split('-')[0]) <= 11);
      localStorage.setItem(key, JSON.stringify({ unlocked: 1, beaten: [], introSeen: true, escapes: { 10: 1 }, levelsBeaten: Object.fromEntries(ids.map((id) => [id, 1])), unlockedLevels: ['10-secret', '11-secret'], wmap: { w: 11, at: 10 } }));
    }, CURRENT);
    await page.reload();
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    expect(s0).toMatchObject({ world: 11, at: 10 });
    expect(s0.stops[10]).toMatchObject({ id: '11-castle', state: 'beaten' });
    expect((s0 as unknown as { gate: number | null }).gate).toBe(12);   /* the sign stands on the road out */
    expect((s0 as unknown as { gatePeek: boolean }).gatePeek, 'the sign is the sneak peek, not "coming soon"').toBe(true);
    /* the sign and Glitchy are drawn (gold board, Glitchy's purple), and they are gone once the world is released.
       A rainy map lays rgba(20,30,60,.10) over the whole picture (.22 in a storm, rainFx in map/engine.js), so a colour
       counts as itself or as itself under that rain tint (within 2 per channel) */
    const colours = () => page.evaluate(() => {
      const c = document.querySelector('#owHost .km-canvas') as HTMLCanvasElement; const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
      const is = (i: number, r: number, g: number, b: number) => [0, 0.1, 0.22].some((a) => Math.abs(d[i] - Math.round(r * (1 - a) + 20 * a)) <= 2 && Math.abs(d[i + 1] - Math.round(g * (1 - a) + 30 * a)) <= 2 && Math.abs(d[i + 2] - Math.round(b * (1 - a) + 60 * a)) <= 2);
      let gold = 0, purple = 0;
      for (let i = 0; i < d.length; i += 4) { if (is(i, 0xf6, 0xc4, 0x45)) gold++; if (is(i, 0x7a, 0x2f, 0xd0)) purple++; }
      return { gold, purple };
    });
    /* World 11's map cycles its colours (map/worlds/w11.js: purple and gold among them), so a whole-picture count
       changes from frame to frame (measured 2026-10-30 on WebKit: 522 MORE purple pixels without the sign than with
       it). So the map's clock is held for the two pictures (every frame is drawn at the same moment: the map engine
       takes its time only from requestAnimationFrame), and the sign and Glitchy are the only change between them */
    const hold = (on: boolean) => page.evaluate((on) => {
      type Raf = (cb: FrameRequestCallback) => number;
      const w = window as unknown as { requestAnimationFrame: Raf; __realRaf?: Raf };
      if (on) {
        const real = w.__realRaf || w.requestAnimationFrame.bind(window);
        /* the held moment is a calm one of World 11's glitch (glitchFx in map/engine.js; at the castle it is at full strength), the
           same moment for both pictures. Measured 2026-10-30 (desktop Chromium, 18 held moments): Glitchy's purple count with the
           sign is 393 at a clean moment, 110 to 368 at others, and 0 in the whole-picture dark flash (Math.sin(t / 650) > 0.9; 6 of
           the 18 moments tried), so a clock held at "now" could fail the "more than 150" below (it did: 0 purple, then 129).
           A calm moment has: no flash, no tear (t % 400 >= 250), none of the 14 random bars (hash(floor(t / 180) + 7 i, 1) <= 0.5),
           no sprite jitter (floor(t / 90) % 7 != 0) and no thin glitch lines (floor(t / 140) % 9 != 0) */
        const hash = (window as unknown as { KINAN: { hash: (a: number, b: number) => number } }).KINAN.hash;
        let T = performance.now();
        search: for (let s = 1; s < 400000; s++) {
          for (let i = 0; i < 14; i++) if (hash(s + i * 7, 1) > 0.5) continue search;
          for (let o = 0; o < 180; o += 5) {
            const t = s * 180 + o;
            if (Math.sin(t / 650) <= 0.5 && t % 400 >= 270 && Math.floor(t / 90) % 7 !== 0 && Math.floor(t / 140) % 9 !== 0) { T = t; break search; }
          }
        }
        w.__realRaf = real; w.requestAnimationFrame = (cb) => real(() => cb(T));
      }
      else if (w.__realRaf) { w.requestAnimationFrame = w.__realRaf; delete w.__realRaf; }
    }, on);
    await hold(true);
    await page.waitForTimeout(300);
    const withSign = await colours();
    await page.locator('#owHost .km-canvas').screenshot({ path: test.info().outputPath('world-12-sign.png') });   /* for review: the sign and Glitchy on World 11's map */
    expect(withSign.purple).toBeGreaterThan(50);
    await page.evaluate(() => (window as unknown as { __k11: { owRelease: (n: number) => number } }).__k11.owRelease(12));
    await page.waitForTimeout(300);
    const without = await colours();
    await hold(false);
    console.log('World 12 sign colours: ' + JSON.stringify({ withSign, without }));
    /* "the sign's Glitchy purple goes": with the clock held, every purple pixel that leaves is Glitchy's (the sign itself
       has none). World 10's map lost 1,247 (measured 2026-10-29 on desktop Chromium: 3,947 -> 2,700, so it asked for
       600); World 11's map loses fewer, measured 2026-10-30 with the clock held: 393 and 393 on desktop Chromium, 223 and 328 on WebKit
       (why fewer is not traced: World 11's sign stands on its road out, not on a spot of its own). So: more than 150 */
    expect(withSign.purple - without.purple, "Glitchy's purple goes with the sign").toBeGreaterThan(150);
    expect(without.gold).toBeLessThan(withSign.gold);
    await page.evaluate(() => (window as unknown as { __k11: { owRelease: (n: number) => number } }).__k11.owRelease(11));
    /* a save that somehow stands in World 12 without the 11-castle beaten comes back to the furthest open stop: the 11-castle
       (World 12 opens only after it, sneak peek or not) */
    await page.evaluate(() => (window as unknown as { __k11: { storyStop: () => boolean } }).__k11.storyStop());   /* no story line can save over the edit below */
    await page.evaluate((key) => { const d = JSON.parse(localStorage.getItem(key)!); delete d.levelsBeaten['11-castle']; d.wmap = { w: 12, at: 0 }; localStorage.setItem(key, JSON.stringify(d)); }, CURRENT);
    await page.reload();
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    await page.locator('#startBtn').click({ force: true });
    expect(await settle(page)).toMatchObject({ world: 11, at: 10 });
    /* with the 11-castle beaten the sneak peek's road leads on out of World 11: the sign does not stop Kinan, the 2D-to-3D
       change plays and he lands on World 12's first stop on the 3D map (which says it is a sneak peek), as
       overworld-seams-3d.spec.ts's "after World 11 the 2D->3D transition plays" does for the released world */
    await page.evaluate(() => (window as unknown as { __k11: { storyStop: () => boolean } }).__k11.storyStop());
    await page.evaluate((key) => { const d = JSON.parse(localStorage.getItem(key)!); d.levelsBeaten['11-castle'] = 1; d.wmap = { w: 11, at: 10 }; localStorage.setItem(key, JSON.stringify(d)); }, CURRENT);
    await page.reload();
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    await page.locator('#startBtn').click({ force: true });
    expect(await settle(page)).toMatchObject({ world: 11, at: 10 });
    await page.locator('#owNext').click();
    await page.waitForFunction(() => { const s = (window as unknown as { __k11: { mapState: () => { world: number | null; three?: boolean; threeReady?: boolean } } }).__k11.mapState(); return s.world === 12 && !!s.three && !!s.threeReady; }, null, { timeout: 90_000 });
    expect(await mapState(page)).toMatchObject({ world: 12, at: 0 });
    expect((await progress(page)).wmap).toEqual({ w: 12, at: 0 });
    await expect(page.locator('#owHost .k3-peek'), "World 12's map says it is a sneak peek").toContainText('SNEAK PEEK');
    await expect(page.locator('#owHost .k3-peek')).toContainText('MORE IS COMING');
    expect(errors).toEqual([]);
  });

  test('the escape runs into worlds not built yet, over the road trips and the glitch into World 11; never after World 11 (its 2D-to-3D change stays)', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await seed(page, { introSeen: true, wmap: { w: 1, at: 0 } });
    await boot(page);
    await page.locator('#startBtn').click({ force: true });
    await settle(page);
    const want: Record<number, number[]> = { 5: [5, 6], 6: [6, 6.5, 7], 9: [9, 9.5, 10], 10: [10, 11] };
    for (const n of [5, 6, 9, 10]) {
      await page.evaluate((n) => (window as unknown as Win).__k11.mapWarp(n, 10), n);
      await page.waitForTimeout(300);
      const ok = await page.evaluate(() => { const K = (window as unknown as Win).KINAN; K.speed(10); return K.fly('escape', {}); });
      expect(ok, `World ${n}`).toBe(true);
      const seen = new Set<number>();
      for (let i = 0; i < 400; i++) { const s = await mapState(page); if (!s.fly) break; seen.add(s.fly.world); await page.waitForTimeout(40); }
      expect([...seen].sort((a, b) => a - b), `World ${n}`).toEqual(want[n]);
      expect(await mapState(page), `World ${n}`).toMatchObject({ world: n, at: 10, busy: false });
    }
    await page.evaluate(() => (window as unknown as Win).__k11.mapWarp(11, 10));
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => (window as unknown as Win).KINAN.fly('escape', {}))).toBe(false);
    expect(errors).toEqual([]);
  });
});

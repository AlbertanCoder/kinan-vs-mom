import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* SUBTITLES AND VOICES ON/OFF (fixes run 2, Shad: "the ability to turn on and off the subtitles... or the voices").
   Settings has "Subtitles: ON/OFF" and "Voices: ON/OFF", saved on this device, both ON by default. Subtitles OFF hides
   the spoken lines' words (a level, the map, cutscenes and Sabumnim's belt scenes); Voices OFF plays no spoken line.
   Neither changes a line's timing: with voices off the words stay up for the line's normal time, with subtitles off the
   voice still plays, and with both off every scene still moves on when its line would have ended.
   "Captions for sounds" is its own switch and is not touched. Audio is spied on (every src an audio element is given)
   and never really plays. */
const DEV_URL = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html?devtools=1`;
const CURRENT = 'kinan-remaster-v1';

type Line = [string, string, number, string | null];
type Info = { cur: string | null; queue: string[]; levelSub: string; mapSub: string };
type Dev = {
  storyInfo: () => Info; storyStop: () => boolean; playLevel: (id: string) => unknown; freeze: (on: boolean) => boolean;
  cut: () => { on: boolean; mode: string | null; sub: string; belt: { line: string } | null }; cutSpeed: (n: number) => number;
  mapState: () => { mounted: boolean; busy: boolean };
  progress: () => { subtitles?: boolean; voices?: boolean; captions?: boolean };
};
type Win = Window & { __k11: Dev; KinanLevels: { ready: boolean }; KINAN_STORY: { lines: Record<string, Line>; open: Record<string, string[]> }; __srcLog: string[] };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
/* before the game runs: note every src an audio element is given; play() resolves silently */
async function spy(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as Win;
    w.__srcLog = [];
    const d = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
    if (d && d.set && d.get) {
      const get = d.get, set = d.set;
      Object.defineProperty(HTMLMediaElement.prototype, 'src', { configurable: true, enumerable: d.enumerable, get() { return get.call(this); }, set(v: string) { w.__srcLog.push(String(v)); set.call(this, v); } });
    }
    HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
  });
}
async function seed(page: Page, data: Record<string, unknown>): Promise<void> {
  await page.addInitScript(({ key, d }) => {
    if (sessionStorage.getItem('sv-seeded')) return;
    sessionStorage.setItem('sv-seeded', '1');
    localStorage.setItem(key, JSON.stringify(Object.assign({ unlocked: 1, beaten: [] }, d)));
  }, { key: CURRENT, d: data });
}
async function boot(page: Page): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
}
const dev = <R,>(page: Page, f: (k: Dev) => R): Promise<R> => page.evaluate(`(${f.toString()})(window.__k11)`) as Promise<R>;
const srcs = (page: Page): Promise<string[]> => page.evaluate(() => (window as unknown as Win).__srcLog.filter((s) => /\.mp3/.test(s)));
async function settings(page: Page): Promise<void> {
  await page.evaluate(() => {
    const m = document.getElementById('menu') as HTMLElement;
    if (m.hidden) (document.getElementById('menuBtn') as HTMLButtonElement).click();
    (document.getElementById('settingsBtn') as HTMLButtonElement).click();
  });
}
const CASTLES_1_6 = Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [`${n}-castle`, 1]));

test.describe('Settings: Subtitles and Voices switches', () => {
  test('both are ON on a new save; tapping them turns them OFF, and the choice is remembered on this device', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await settings(page);
    await expect(page.locator('#subsBtn')).toHaveText('Subtitles: ON');
    await expect(page.locator('#voicesBtn')).toHaveText('Voices: ON');
    await expect(page.locator('#subsBtn')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#volVo')).toBeVisible();   /* the voice volume slider stays */
    const caps = await page.locator('#volCaps').isChecked();
    await page.locator('#subsBtn').click();
    await page.locator('#voicesBtn').click();
    await expect(page.locator('#subsBtn')).toHaveText('Subtitles: OFF');
    await expect(page.locator('#voicesBtn')).toHaveText('Voices: OFF');
    await expect(page.locator('#voicesBtn')).toHaveAttribute('aria-pressed', 'false');
    expect(await dev(page, (k) => k.progress())).toMatchObject({ subtitles: false, voices: false });
    expect(await page.locator('#volCaps').isChecked()).toBe(caps);   /* "Captions for sounds" is its own switch */
    await page.reload();
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    expect(await page.evaluate(() => document.documentElement.classList.contains('nosubs'))).toBe(true);
    await settings(page);
    await expect(page.locator('#subsBtn')).toHaveText('Subtitles: OFF');
    await expect(page.locator('#voicesBtn')).toHaveText('Voices: OFF');
    await page.locator('#subsBtn').click();
    await page.locator('#voicesBtn').click();
    await expect(page.locator('#subsBtn')).toHaveText('Subtitles: ON');
    await expect(page.locator('#voicesBtn')).toHaveText('Voices: ON');
    expect(await page.evaluate(() => document.documentElement.classList.contains('nosubs'))).toBe(false);
    expect(errors).toEqual([]);
  });

  for (const [subs, voices] of [[true, true], [true, false], [false, true], [false, false]] as const) {
    const name = `subtitles ${subs ? 'ON' : 'OFF'} · voices ${voices ? 'ON' : 'OFF'}`;
    test(`${name}: Sabumnim's belt scene, the map's story line and a level's opener; every line ends on time`, async ({ page }) => {
      test.setTimeout(120_000);
      const errors = watchErrors(page);
      await spy(page);
      await seed(page, { introSeen: true, levelsBeaten: CASTLES_1_6, escapes: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 }, wmap: { w: 1, at: 0 }, subtitles: subs, voices: voices });
      await boot(page);
      expect(await dev(page, (k) => k.progress())).toMatchObject({ subtitles: subs, voices: voices });

      /* 1. Sabumnim's catch-up belt scene (a cutscene) as the map opens */
      await dev(page, (k) => k.cutSpeed(4));
      await page.locator('#startBtn').click({ force: true });
      await expect.poll(async () => (await dev(page, (k) => k.cut())).mode, { timeout: 20_000, intervals: [100] }).toBe('belt');
      await expect.poll(async () => (await dev(page, (k) => k.cut())).sub, { timeout: 15_000, intervals: [50] }).toBe('SABUMNIM: You have been busy, Kinan.');
      expect(await page.locator('#cutSub').isVisible(), 'the scene subtitle').toBe(subs);
      expect((await srcs(page)).some((s) => s.indexOf('audio/belt/belt_catchup.mp3') >= 0), 'Sabumnim\'s voice').toBe(voices);
      await expect.poll(async () => (await dev(page, (k) => k.cut())).on, { timeout: 30_000 }).toBe(false);   /* the scene moves on by itself */

      /* 2. the map's story line (World 1's intro, now that the scene is over) */
      await page.waitForFunction(() => { const k = (window as unknown as Win).__k11, s = k.mapState(); return s.mounted && !s.busy && !k.cut().on; }, null, { timeout: 30_000 });
      await expect.poll(async () => (await dev(page, (k) => k.storyInfo())).mapSub, { timeout: 15_000 }).not.toBe('');
      const mapLine = (await dev(page, (k) => k.storyInfo())).cur!;
      const clip = await page.evaluate((id) => (window as unknown as Win).KINAN_STORY.lines[id][3], mapLine);
      expect(await page.locator('#storyLineMap').isVisible(), 'the map subtitle').toBe(subs);
      if (clip) expect((await srcs(page)).some((s) => s.indexOf(clip) >= 0), 'the map line\'s voice').toBe(voices);

      /* 3. a level's opener: heard (or not), shown (or not), and over after its normal time either way */
      await dev(page, (k) => { k.storyStop(); k.playLevel('1-1'); });
      const lv = await dev(page, (k) => k.storyInfo());
      expect(lv.cur).not.toBeNull();
      const [, text, secs, file] = await page.evaluate((id) => (window as unknown as Win).KINAN_STORY.lines[id], lv.cur!);
      expect(lv.levelSub).toContain(text);
      expect(await page.locator('#storyLine').isVisible(), 'the level subtitle').toBe(subs);
      if (file) expect((await srcs(page)).some((s) => s.indexOf(file) >= 0), 'the opener\'s voice').toBe(voices);
      const ms = Math.round(Math.max(1.2, secs) * 1000) + 300;
      await page.waitForTimeout(Math.round(ms * 0.6));
      expect((await dev(page, (k) => k.storyInfo())).cur, 'the line keeps its normal time').toBe(lv.cur);
      await page.waitForTimeout(Math.round(ms * 0.4) + 500);
      expect((await dev(page, (k) => k.storyInfo())).cur, 'and then moves on').not.toBe(lv.cur);
      expect(errors).toEqual([]);
    });
  }
});

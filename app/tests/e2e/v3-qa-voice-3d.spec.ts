import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* V3 (2026-10-28): the QA playtest's voice items and the 3D title card.
   - iOS Safari only lets an audio element start inside a tap or key press: the voice player is made on the
     first one and unlocked with a silent blip, and every line after reuses that one element.
   - Chenoa's first plate throw no longer says "Bounce it back!" (plates can't be bounced): "Hot plate! Move!".
   - The 3D level's title card names the real level, not always "KINAN'S 3D HOUSE". */
const DEV_URL = 'http://127.0.0.1:4174/index.html?devtools=1';
const BASE = 'http://127.0.0.1:4174/';
type Arena = { state: string; line: string | null; gateL: number; voiceLog: string[] };
type Dev = {
  storyInfo: () => { cur: string | null; log: { id: string }[] }; storyStop: () => boolean;
  playLevel: (id: string) => unknown; godMode: () => void; clearFoes: () => void; place: (x: number, y: number) => unknown; step: (n: number) => unknown;
  arenaInfo: () => Arena | null; arenaBot: (n: number) => Arena | null;
  arenaKinds: () => { kind: string; lines: { intro: string[]; retry: string[]; phase: (string | null)[]; first: Record<string, string>; defeat: string[] } }[];
  arenaLines: () => { id: string; who: string; text: string; clip: boolean }[];
};
type Win = { __k11: Dev; KinanLevels: { ready: boolean }; __srcLog: string[]; __els: number; KINAN?: { state: () => { mounted: boolean; busy: boolean } } };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
/* every src an audio element is given, and how many different elements were ever given one */
async function spy(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as Win & { __seen: WeakSet<object> };
    w.__srcLog = []; w.__els = 0; w.__seen = new WeakSet();
    const d = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
    if (d && d.set && d.get) {
      const get = d.get, set = d.set;
      Object.defineProperty(HTMLMediaElement.prototype, 'src', { configurable: true, enumerable: d.enumerable, get() { return get.call(this); },
        set(v: string) { if (!w.__seen.has(this)) { w.__seen.add(this); w.__els++; } w.__srcLog.push(String(v)); set.call(this, v); } });
    }
    HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
  });
}
async function boot(page: Page): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => { const w = window as unknown as Win; return typeof w.__k11 === 'object' && !!w.KinanLevels && w.KinanLevels.ready; });
}

test.describe('V3 · iOS: one voice player, unlocked on the first tap', () => {
  test('the first tap makes the voice player and plays a silent blip on it; the opening cutscene, the map intro, a level opener and a boss line all reuse that one element', async ({ page }) => {
    const errors = watchErrors(page);
    await spy(page);
    await boot(page);
    expect(await page.evaluate(() => (window as unknown as Win).__srcLog.length)).toBe(0);   /* the title: nothing yet */
    await page.locator('#startBtn').click({ force: true });
    /* 2026-10-28: a new save opens with the cutscene (c1-cutscenes.spec.ts): its first line plays on the same element, then SKIP */
    await expect(page.locator('#cut')).toBeVisible();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__srcLog.some((s) => s.endsWith('audio/lines/w01/w01_kinan_19.mp3'))), { timeout: 15_000 }).toBe(true);
    await page.locator('#cutSkip').click();
    await page.waitForFunction(() => { const k = (window as unknown as Win).KINAN; return !!k && k.state().mounted && !k.state().busy; }, null, { timeout: 30_000 });
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.storyInfo().cur)).toBe('w01_shad_01');
    const r = await page.evaluate(() => {
      const w = window as unknown as Win, k = w.__k11;
      k.playLevel('1-castle'); k.godMode(); k.clearFoes();
      let a = k.arenaInfo()!;
      k.place((a.gateL - 4) * 16, 40); k.step(20);
      for (let n = 0; n < 200 && a && !a.voiceLog.length; n++) a = k.arenaBot(10)!;
      return { log: w.__srcLog.slice(), els: w.__els, voice: a.voiceLog.slice() };
    });
    expect(r.log[0]).toMatch(/^data:audio\/wav;base64,/);                       /* the unlock blip, on the tap */
    expect(r.log.some((s) => s.endsWith('audio/lines/w01/w01_kinan_19.mp3'))).toBe(true);   /* the cutscene */
    expect(r.log.some((s) => s.endsWith('audio/lines/w01/w01_shad_01.mp3'))).toBe(true);    /* the map intro */
    expect(r.log.some((s) => s.endsWith('audio/lines/w01/w01_shad_02.mp3'))).toBe(true);
    expect(r.voice.length).toBeGreaterThan(0);
    expect(r.log.some((s) => s.endsWith(`audio/voice/${r.voice[0]}.mp3`))).toBe(true);
    expect(r.els).toBe(1);                                                    /* one element for every voice line */
    expect(errors).toEqual([]);
  });
});

test.describe('V3 · Chenoa never promises a move that does not exist', () => {
  test('her first plate throw says "Hot plate! Hot plate! Move!"; no boss line says to bounce anything back', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await spy(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      const lines = new Map(k.arenaLines().map((l) => [l.id, l.text]));
      const named = k.arenaKinds().flatMap((kd) => [...kd.lines.intro, ...kd.lines.retry, ...kd.lines.phase.filter((x): x is string => !!x), ...Object.values(kd.lines.first), ...kd.lines.defeat]);
      const chenoa = k.arenaKinds().find((kd) => kd.kind === 'chenoa')!.lines;
      k.playLevel('4-castle'); k.godMode(); k.clearFoes(); k.storyStop();
      let a = k.arenaInfo()!;
      k.place((a.gateL - 4) * 16, 40); k.step(20);
      for (let n = 0; n < 300 && a && a.voiceLog.indexOf('w04_chenoa_04') < 0; n++) a = k.arenaBot(10)!;
      return { first: chenoa.first, bounce: named.filter((id) => /bounce/i.test(lines.get(id) || '')), hasOld: lines.has('w04_chenoa_03'), said: a.voiceLog };
    });
    expect(r.first).toEqual({ toss: 'w04_chenoa_04' });
    expect(r.bounce).toEqual([]);
    expect(r.hasOld).toBe(false);
    expect(r.said).toContain('w04_chenoa_04');
    expect(r.said).not.toContain('w04_chenoa_03');
    expect(errors).toEqual([]);
  });
});

test.describe('V3 · the 3D title card names the level', () => {
  for (const lv of [
    { level: '12-1', id: '12-1', world: 'WORLD 12-1', title: "KINAN'S 3D HOUSE", sub: 'Explore every room, now with a back side!' },
    { level: '12-2', id: '12-2', world: 'WORLD 12-2', title: 'NEIGHBOURHOOD ROOFTOPS', sub: 'Run across the roofs of your street!' },   /* its cardText */
    { level: '12-3', id: '12-3', world: 'WORLD 12-3', title: 'THE RIVER VALLEY TRAIL', sub: 'Wind your way down to the river!' },
    { level: '12-arena', id: '12-castle', world: 'WORLD 12 · CASTLE', title: "BIG BRICK'S ARENA", sub: 'The king of the angry bricks!' }
  ]) {
    test(`${lv.level}: the card says ${lv.title}`, async ({ page }) => {
      const errors = watchErrors(page);
      await page.goto(new URL(`3d/level-12-1.html?level=${lv.level}&id=${lv.id}`, BASE).href);
      await expect(page.locator('#titlecard h1')).toHaveText(lv.title, { timeout: 30_000 });
      await expect(page.locator('#titlecard .world')).toHaveText(lv.world);
      await expect(page.locator('#titlecard .sub')).toHaveText(lv.sub);
      expect(await page.title()).toBe(`Kinan vs. Worlds ${lv.world.replace('WORLD ', '')}: ${lv.title}`);
      expect(errors).toEqual([]);
    });
  }
});

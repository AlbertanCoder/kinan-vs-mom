import { expect, test, type Page } from '@playwright/test';

/* The level talk bubbles speak (Shad, 2026-10-30: "you can't even hear Robin talk ... it's just silence"): when Kinan walks
   up to Dad's joke in 3-2 (the pumpjack one, col 30), the line plays its recording from audio/talk/, not just a subtitle,
   and never the device voice. */
const DEV_URL = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html?devtools=1`;
type Win = { __k11: Record<string, (...a: any[]) => any>; KinanLevels: { ready: boolean }; KINAN_STORY: { lines: Record<string, [string, string, number, string | null]> }; __srcLog: string[]; __speak: number };

async function spy(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as Win; w.__srcLog = []; w.__speak = 0;
    const d = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
    if (d && d.set && d.get) { const get = d.get, set = d.set; Object.defineProperty(HTMLMediaElement.prototype, 'src', { configurable: true, enumerable: d.enumerable, get() { return get.call(this); }, set(v: string) { w.__srcLog.push(String(v)); set.call(this, v); } }); }
    HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
    if ('speechSynthesis' in window) Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { getVoices: () => [], speak() { w.__speak++; }, cancel() {}, onvoiceschanged: null } });
    localStorage.setItem('kinan-remaster-v1', JSON.stringify({ unlocked: 1, beaten: [], introSeen: true, pets: { ids: [], names: {}, soloCat: true, soloDog: true } }));
  });
}

test('Dad\'s joke in 3-2 plays its recording (audio/talk/), and the clip is served', async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = []; page.on('pageerror', (e) => errors.push(e.message));
  await spy(page);
  await page.goto(DEV_URL);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
  const r = await page.evaluate(() => {
    const w = window as unknown as Win, k = w.__k11, T = 16;
    k.playLevel('3-2'); k.godMode(); k.clearFoes(); k.storyStop();
    const line = w.KINAN_STORY.lines['talk_3-2_0'];
    const n = w.__srcLog.length;
    k.place(28 * T, 6 * T); k.step(90, { left: false, right: true });
    return { line, srcs: w.__srcLog.slice(n) };
  });
  expect(r.line[0]).toBe('DAD');
  expect(r.line[3]).toMatch(/^audio\/talk\/[0-9a-f]{8}\.mp3$/);
  expect(r.srcs.some((s) => s.includes(r.line[3]!)), JSON.stringify(r.srcs)).toBe(true);
  const res = await page.request.get(DEV_URL.replace(/index\.html.*/, r.line[3]!));
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('audio/mpeg');
  expect(await page.evaluate(() => (window as unknown as Win).__speak)).toBe(0);
  expect(errors).toEqual([]);
});

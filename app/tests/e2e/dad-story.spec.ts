import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* DAD'S WHEEZE-LAUGH, MOM'S REACTIONS, SKIP EVERYWHERE (Shad, 2026-10-29). A level's talk bubble can carry an fx:
   'wheeze' (Dad starts a joke, can't finish it: his face doubled over and shaking in the subtitle, the subtitle
   wobbling, a breathy hee-hee-hee from the game's own sound) and the next bubble is someone else's punchline;
   'walkoff' (Mom: "Is that all you do, tell jokes?", her face walks out of the box) and Dad keeps going.
   Every story line can be skipped: a tap on the subtitle, Enter in a level, Esc on the map; a cutscene by any key.
   index.html blocks "STORY LINES" (Story.text, Story.skip) and buildLevel's talk; tools/dad-lines.mjs. */
const DEV_URL = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html?devtools=1`;
const T = 16;
type Info = { cur: string | null; queue: string[]; levelSub: string; mapSub: string; fx: string | null; wheezes: number; skipped: number; face: string; heard: string[] };
type Dev = {
  playLevel: (id: string) => unknown; place: (x: number, y: number) => unknown; step: (n: number) => unknown; godMode: () => void; clearFoes: () => void;
  storyInfo: () => Info; storyNext: () => string | null; storyStop: () => boolean; worldMap: () => boolean;
  mapState: () => { mounted: boolean }; cut: () => { on: boolean };
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
/* a level with only its bubbles at column 30 talking: Kinan steps past column 30 */
const atTalk = (page: Page, id: string): Promise<Info> => page.evaluate(({ id, T }) => {
  const k = (window as unknown as Win).__k11;
  k.playLevel(id); k.godMode(); k.clearFoes(); k.storyStop();
  k.place(31 * T + 2, 4 * T); k.step(2);
  return k.storyInfo();
}, { id, T });

test.describe("Dad's wheeze-laugh and Mom's reactions", () => {
  test('3-2: Dad starts a joke and cannot finish it (the wheeze plays, his face is doubled over), then Kinan finishes the punchline', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const a = await atTalk(page, '3-2');
    expect(a.cur).toBe('talk_3-2_0');
    expect(a.fx).toBe('wheeze');
    expect(a.wheezes).toBe(1);
    expect(a.face).toContain('fx-wheeze');
    expect(a.levelSub).toMatch(/^DAD: What did the oil say to the pumpjack\? .*I can't—$/);
    await expect(page.locator('#storyLine .fxbreak')).toBeVisible();
    const b = await page.evaluate(() => { const k = (window as unknown as Win).__k11; k.storyNext(); return k.storyInfo(); });
    expect(b.cur).toBe('talk_3-2_1');
    expect(b.fx).toBeNull();
    expect(b.levelSub).toMatch(/^KINAN: \.\.\.for information\./);
    expect(errors).toEqual([]);
  });

  test("5-5: Dad's joke, Mom asks if that is all he does and walks off, Dad keeps going", async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const a = await atTalk(page, '5-5');
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11, out: Info[] = [];
      for (let i = 0; i < 2; i++) { k.storyNext(); out.push(k.storyInfo()); }
      return out;
    });
    expect(a.levelSub).toMatch(/^DAD: /);
    expect(r[0].fx).toBe('walkoff');
    expect(r[0].face).toContain('fx-walkoff');
    expect(r[0].levelSub).toMatch(/^MOM: Is that all you do, tell jokes\?/);
    expect(r[1].levelSub).toMatch(/^DAD: \.\.\.I'll be here all week/);
    expect(errors).toEqual([]);
  });
});

test.describe('every conversation can be skipped', () => {
  test('in a level: Enter skips the whole conversation, and so does a tap on the subtitle', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    expect((await atTalk(page, '3-2')).cur).toBe('talk_3-2_0');
    await page.keyboard.press('Enter');
    const a = await page.evaluate(() => (window as unknown as Win).__k11.storyInfo());
    expect(a.cur).toBeNull();
    expect(a.queue).toEqual([]);
    expect(a.skipped).toBe(1);
    await expect(page.locator('#storyLine')).toBeHidden();
    expect((await atTalk(page, '5-5')).cur).toBe('talk_5-5_0');
    await page.locator('#storyLine').click();
    const b = await page.evaluate(() => (window as unknown as Win).__k11.storyInfo());
    expect(b.cur).toBeNull();
    expect(b.queue).toEqual([]);
    expect(b.skipped).toBe(2);
    expect(errors).toEqual([]);
  });

  test("on the map: Enter skips World 1's intro (Esc stays the menu key), and the skipped lines count as heard", async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await page.evaluate(() => (window as unknown as Win).__k11.worldMap());
    await page.waitForFunction(() => (window as unknown as Win).__k11.mapState().mounted, null, { timeout: 30_000 });
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.storyInfo().cur), { timeout: 15_000 }).toBe('w01_kinan_01');
    await expect(page.locator('#storyLineMap')).toBeVisible();
    await page.keyboard.press('Enter');
    const a = await page.evaluate(() => (window as unknown as Win).__k11.storyInfo());
    expect(a.cur).toBeNull();
    expect(a.skipped).toBe(1);
    expect(a.heard).toEqual(expect.arrayContaining(['w01_kinan_01', 'w01_mom_02']));
    await expect(page.locator('#storyLineMap')).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('a cutscene: the opening skips with a key', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await page.locator('#startBtn').click({ force: true });
    await expect(page.locator('#cut')).toBeVisible();
    await page.waitForTimeout(700);
    await page.keyboard.press('Space');
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.cut().on), { timeout: 15_000 }).toBe(false);
    expect(errors).toEqual([]);
  });
});

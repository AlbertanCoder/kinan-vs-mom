import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* QA 2026-10-28 (MINOR): the bot's hits per castle showed the World 3 Safety Foreman as the hardest
   (mostly the walking cone on the 5-pit's runway), while Chenoa (World 4) and Bronco (World 5) cost no
   hits at all. The cone is gone, the Foreman's phase 2 calls one walking cone and drops three cones
   (was two and four), and Chenoa and Bronco press harder (more things per attack, helpers that walk in,
   shorter rests, longer patterns, a smarter phase 3), every tell still 0.6 s or more. Measured here the way the
   other boss tests play: the boss bot (it reads only what a kid can see) fights each castle boss from
   its checkpoint, from four different entries; the hits it takes must climb World 3 < World 4 < World 5,
   and it never loses a fight (the fights stay fair). */
const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
const DEV_URL = `${BASE}?devtools=1`;
const ENTRIES: [number, number][] = [[0, 0], [-16, 25], [16, 50], [8, 100]];

type Arena = { state: string; hp: number; deaths: number; cp: { x: number }; floorY: number; phases: { windup: number }[] };
type Dev = {
  playLevel: (id: string) => unknown; clearFoes: () => void; storyStop: () => void; place: (x: number, y: number) => unknown;
  step: (n: number, o?: Record<string, boolean>) => unknown[]; arenaInfo: () => Arena; arenaBot: (n: number) => Arena;
};
type Win = Window & { __k11: Dev; KinanLevels: { ready: boolean } };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

test.describe('QA fix: the castle bosses get harder world by world', () => {
  test('bot hits per castle climb: the Safety Foreman (3) < Chenoa (4) < Bronco (5), with no lost fight and every tell 0.6 s or more', async ({ page }) => {
    test.setTimeout(300_000);
    const errors = watchErrors(page);
    await page.goto(DEV_URL);
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    const res: Record<string, { hits: number[]; deaths: number; open: boolean; tellMin: number }> = {};
    for (const id of ['3-castle', '4-castle', '5-castle']) {
      res[id] = await page.evaluate(({ id, ENTRIES }) => {
        const k = (window as unknown as Win).__k11, hits: number[] = [];
        let deaths = 0, open = true, tellMin = 999;
        for (const [dx, wait] of ENTRIES) {
          k.playLevel(id); k.clearFoes(); k.storyStop();
          let a = k.arenaInfo();
          tellMin = Math.min(tellMin, ...a.phases.map((p) => p.windup));
          k.place(a.cp.x - 6 + dx, a.floorY - 18); k.step(20 + wait);
          a = k.arenaInfo();
          let last = a.hp, n = 0, f = 0;
          while (f < 15000 && a.state !== 'open') { a = k.arenaBot(1); f++; if (a.hp < last) n++; last = a.hp; }
          hits.push(n); deaths += a.deaths; open = open && a.state === 'open';
        }
        return { hits, deaths, open, tellMin };
      }, { id, ENTRIES });
    }
    const total = (id: string): number => res[id].hits.reduce((s, n) => s + n, 0);
    console.log('QA boss order (bot hits over 4 entries): ' + Object.entries(res).map(([id, r]) => `${id} ${total(id)} [${r.hits.join(' ')}]`).join(' · '));
    for (const id of Object.keys(res)) {
      expect(res[id].open, `${id}: every fight won`).toBe(true);
      expect(res[id].deaths, `${id}: never a lost fight`).toBe(0);
      expect(res[id].tellMin, `${id}: every tell 0.6 s or more`).toBeGreaterThanOrEqual(36);
    }
    expect(total('3-castle'), 'World 3 < World 4').toBeLessThan(total('4-castle'));
    expect(total('4-castle'), 'World 4 < World 5').toBeLessThan(total('5-castle'));
    expect(errors).toEqual([]);
  });

  test("3-castle: the 5-pit's runway is clear (the walking cone that guarded it is gone)", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(DEV_URL);
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    const foes = await page.evaluate(() => {
      const d = (window as unknown as { KinanLevels: { get: (id: string) => { foes: [number, number, string][] } } }).KinanLevels.get('3-castle');
      return d.foes.filter((f) => f[0] >= 48 && f[0] <= 70);
    });
    expect(foes).toEqual([]);
    expect(errors).toEqual([]);
  });
});

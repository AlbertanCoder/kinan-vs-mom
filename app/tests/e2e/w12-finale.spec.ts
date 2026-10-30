import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/* WORLD 12's FINALE (rough draft, Developer mode only). Three tests:
   1. the level: it loads as a 2.5D level with no enemies, the family, the five fuses and Kinan's black belt, and a scripted
      run from the start line with real key presses on the game's clock finishes it: the floating presents, the terrace,
      Big Bro Shad's crates (kicked), the raft, the stacked presents, the balloon lift, the pier, all five fuses kicked.
      The party stays shut until all five are lit. (A small window and low quality: software WebGL is slow.)
   2. the ending: with the fuses lit by the dev hook, the goal plays it to THE END with a tap for each part, then the
      credits, then the gallery with the 11 gifts, ages 1 to 11; the clear is saved under 12-castle.
   3. the map side: the castle stop opens 12-castle, the two stops are renamed, the gallery button stays hidden until World 12
      is released in the tab, and it opens the same 11 gifts.
   Screenshots for Shad: app/w12-finale-shots/<project>/ */
const BASE = `http://127.0.0.1:${process.env.KVM_PORT || '4174'}/`;
/* 2026-10-30 (the World 12 sneak peek): the live site's 3D page says "coming soon" for 12-castle; ?devtools=1 (localhost) opens it, as the dev map link does (w12-preview.spec.ts) */
const LEVEL_URL = `${BASE}3d/level-12-1.html?level=12-castle&id=12-castle&devtools=1`;
const SHOTS = fileURLToPath(new URL('../../w12-finale-shots/', import.meta.url));
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

type Info = { mode: string; pos: number[]; state: string; anim: string; grounded: boolean; counts: { kicks: number }; enemiesAlive: number; totalCandles: number; totalGolden: number };
type Mover = { kind: string; g: { position: { x: number; y: number; z: number } } };
type Fuse = { lit: boolean };
type Game = {
  ready: boolean; mode: string; time: number; respawning?: boolean; player: { model: { getObjectByName: (n: string) => unknown } } | null;
  side: { at: (s: number) => { x: number; z: number; tx: number; tz: number }; project: (x: number, z: number) => { s: number } } | null;
  start: () => void; info: () => Info; sideInfo: () => { s: number; off: number; length: number } | null;
  teleport: (x: number, y: number, z: number, yaw?: number) => void;
  onUpdate: (fn: () => void) => void;
  entities: { goal: { locked: boolean } | null; movers: Mover[] };
  festival: { lit: number; fuses: Fuse[]; lightFuse: (f: Fuse) => void };
  family: { members: Record<string, { label: string }> };
  finale?: { state: () => { part: string | null; parts: string[]; lines: string[]; done: boolean } };
};
type Win = { GAME?: Game; KinanLevels?: { ready: boolean }; __runLog: string[]; __k11: { owLevelFile: (id: string) => string | null; owRelease: (n: number) => number } };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function shot(page: Page, name: string): Promise<void> {
  const dir = `${SHOTS}${test.info().project.name}/`;
  mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: `${dir}${name}.png` });
}
async function boot(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await page.waitForFunction(() => { const g = (window as unknown as Win).GAME; return !!(g && g.ready && g.player); }, null, { timeout: 150_000 });
  await page.evaluate(() => { const g = (window as unknown as Win).GAME!; if (g.mode === 'title') g.start(); });
}
const part = (page: Page) => page.evaluate(() => (window as unknown as Win).GAME!.finale?.state().part ?? null);

/* the whole run, played in the page on the game's clock: real key events on window, the game's own listeners.
   A fall into the river stops it with the log so far (the run has no way back from a checkpoint). */
const THE_RUN = async (): Promise<string[]> => {
  const g = (window as unknown as Win).GAME!;
  const log: string[] = (window as unknown as Win).__runLog = [];
  let cond: (() => boolean) | null = null, done: (() => void) | null = null, fail: ((e: Error) => void) | null = null;
  g.onUpdate(() => {
    if (g.respawning && fail) { const f = fail; cond = null; fail = null; f(new Error(`fell in the river: ${log.join(' | ')}`)); return; }
    if (cond && cond()) { const d = done!; cond = null; d(); }
  });
  const until = (fn: () => boolean) => new Promise<void>((r, x) => { cond = fn; done = r; fail = x; });
  const key = (k: 'keydown' | 'keyup', code: string) => window.dispatchEvent(new KeyboardEvent(k, { code, key: code === 'Space' ? ' ' : code }));
  const s = () => g.sideInfo()!.s, i = () => g.info(), y = () => i().pos[1], ground = () => i().grounded;
  const wait = (sec: number) => { const t = g.time + sec; return until(() => g.time >= t); };
  const go = () => key('keydown', 'KeyD'), stop = () => key('keyup', 'KeyD');
  const jump = async (hold = 0.22) => { key('keydown', 'Space'); await wait(hold); key('keyup', 'Space'); };
  const reach = (x: number) => until(() => s() >= x);
  const land = (x: number) => until(() => ground() && s() >= x);
  const runTo = async (x: number) => { go(); await reach(x); stop(); await wait(0.35); };
  const kick = async () => { key('keydown', 'KeyF'); await wait(0.06); key('keyup', 'KeyF'); await wait(0.45); };
  const lift = (n: number) => g.entities.movers.filter((m) => m.kind === 'lift')[n].g.position;
  const say = (m: string) => log.push(`${m}: s=${s().toFixed(1)} y=${y().toFixed(1)} t=${g.time.toFixed(1)}`);

  // the floating presents
  go(); await reach(70.8); await jump(); await land(76); await reach(79.6); await jump(); await land(85); await reach(88.8); await jump(); await land(94);
  say('over the slip');
  // the bouncy present, the corner, the stacked presents up to the terrace
  await reach(116.6); await jump(); await land(122);
  await reach(170.2); await jump(); await land(171.9); await reach(175.5); await jump(); await until(() => ground() && y() > 3); await reach(180.3); await jump(); await until(() => ground() && y() > 4.8); await reach(185.2); await jump(); await until(() => ground() && y() > 5.9);
  say('on the terrace');
  // down the ramp, Big Bro Shad's crates: two kicks
  await runTo(255.6); await kick(); await kick();
  say('kicked the crates');
  // fuse 1
  await runTo(310); await kick();
  say('fuse 1');
  // the raft: hop on at this end, ride, hop off at the far end
  await runTo(316.4);
  await until(() => g.side!.project(lift(0).x, lift(0).z).s < 321);
  go(); await jump(); await land(318.3); stop();
  await until(() => g.side!.project(lift(0).x, lift(0).z).s > 328.8);
  go(); await jump(); await land(332);
  say('over the raft');
  // the stacked presents, fuse 2 on top
  await reach(334.8); await jump(); await until(() => ground() && y() > 2); await reach(340.2); await jump(); await until(() => ground() && y() > 4.2); stop(); await wait(0.35); await kick();
  say('fuse 2');
  // the balloon lift up to the pier (run to its edge and double jump), fuse 3
  go(); await until(() => ground() && y() < 0.5 && s() > 348); await reach(350.6); stop(); await wait(0.35);
  await until(() => lift(1).y < 1.5);
  go(); await jump(); await until(() => ground() && s() >= 355.2 && y() > 0.5); await reach(356.4); stop();
  say('on the lift');
  await until(() => lift(1).y > 8.6);
  go(); await reach(359.2); await jump(0.2); await wait(0.1); await jump(0.15); await until(() => ground() && s() >= 364 && y() > 7.5); await reach(367.8); stop(); await wait(0.35); await kick();
  say('fuse 3');
  // down the steps, fuses 4 and 5
  go(); await until(() => ground() && y() < 5.5 && s() > 377); stop(); await wait(0.35); await kick();
  say('fuse 4');
  go(); await until(() => ground() && y() < 0.5 && s() > 383); await reach(389.8); stop(); await wait(0.35); await kick();
  say('fuse 5');
  // to the party
  go();
  await until(() => !!g.finale);
  stop();
  say('at the party');
  return log;
};

test.describe('World 12 finale', () => {
  test('the festival: loads, and a scripted run with real keys finishes it with all five fuses', async ({ page }) => {
    test.setTimeout(480_000);
    const errors = watchErrors(page);
    await page.setViewportSize({ width: 640, height: 360 });
    await boot(page, `${LEVEL_URL}&q=low`);
    expect(await page.evaluate(() => document.getElementById('titlecard')!.querySelector('h1')!.textContent)).toBe('THE BESSBOROUGH BIRTHDAY FESTIVAL');
    const r = await page.evaluate(() => {
      const g = (window as unknown as Win).GAME!, i = g.info();
      return { enemies: i.enemiesAlive, candles: i.totalCandles, golden: i.totalGolden, side: g.sideInfo(), labels: Object.values(g.family.members).map((m) => m.label).sort(), locked: g.entities.goal!.locked, fuses: g.festival.fuses.length, belt: !!g.player!.model.getObjectByName('Kinan_belt') };
    });
    expect(r.enemies, 'nobody to fight').toBe(0);
    expect(r.candles).toBeGreaterThan(40);
    expect(r.golden).toBe(3);
    expect(r.side!.length).toBeGreaterThan(430);
    expect(r.labels).toEqual(['Annie', 'Big Bro Shad', 'Big Sis Chenoa', 'Dad', 'GRANDPA', 'Mom', 'the Grandmas']);
    expect(r.locked, 'the party waits for the fireworks').toBe(true);
    expect(r.fuses).toBe(5);
    expect(r.belt, "Kinan's black belt").toBe(true);

    const log = await Promise.race([
      page.evaluate(THE_RUN),
      page.waitForTimeout(360_000).then(async () => { throw new Error('the run got stuck: ' + (await page.evaluate(() => (window as unknown as Win).__runLog.join(' | ')))); }),
    ]);
    console.log(log.join('\n'));
    const end = await page.evaluate(() => { const g = (window as unknown as Win).GAME!; return { lit: g.festival.lit, locked: g.entities.goal!.locked, kicks: g.info().counts.kicks, part: !!g.finale }; });
    expect(end.lit, 'all five fuses').toBe(5);
    expect(end.locked).toBe(false);
    expect(end.kicks, 'two crates and five fuses').toBeGreaterThanOrEqual(7);
    expect(end.part, 'the goal started the ending').toBe(true);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('the ending plays to THE END, the credits, then the 11 gifts', async ({ page }) => {
    test.setTimeout(300_000);
    const errors = watchErrors(page);
    await boot(page, LEVEL_URL);
    await shot(page, '01-start');
    /* a picture of the kick by Big Bro Shad's crates (the pose held long enough for the slow renderer) */
    await page.evaluate(() => {
      const g = (window as unknown as Win).GAME!, a = g.side!.at(252);
      g.teleport(a.x, 0.2, a.z, Math.atan2(a.tx, a.tz) * 180 / Math.PI);
    });
    await page.waitForFunction(() => { const g = (window as unknown as Win).GAME!; return g.info().grounded; }, null, { timeout: 30_000 });
    await page.evaluate(() => { ((window as unknown as Win).GAME!.player as unknown as { kickT: number }).kickT = 4; });
    await page.waitForFunction(() => (window as unknown as Win).GAME!.info().anim === 'kick', null, { timeout: 30_000 });
    await page.waitForTimeout(700);
    await shot(page, '01b-kick-and-hammer');
    /* the fuses by the dev hook (the run above kicks them for real); Kinan walks into the goal */
    await page.evaluate(() => {
      const g = (window as unknown as Win).GAME!, a = g.side!.at(404);
      g.festival.fuses.forEach((f) => g.festival.lightFuse(f));
      g.teleport(a.x, 0.2, a.z, Math.atan2(a.tx, a.tz) * 180 / Math.PI);
    });
    await page.keyboard.down('KeyD');
    await page.waitForFunction(() => !!(window as unknown as Win).GAME!.finale, null, { timeout: 60_000 });
    await page.keyboard.up('KeyD');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('kinan-remaster-v1') || '{}').levelsBeaten);
    expect(saved['12-castle'], 'the clear is saved').toBe(1);

    await expect(page.locator('#finale')).toBeVisible();
    await page.waitForFunction(() => (window as unknown as Win).GAME!.finale!.state().part === 'party', null, { timeout: 30_000 });
    await expect(page.locator('#finale .fin-banner')).toHaveText('HAPPY 11TH BIRTHDAY, KINAN!');
    expect(await page.evaluate(() => (window as unknown as Win).GAME!.finale!.state().parts)).toEqual(['party', 'cake', 'fireworks', 'theend', 'credits']);
    await shot(page, '02-party');
    await page.waitForFunction(() => (window as unknown as Win).GAME!.finale!.state().lines.includes('Mom'), null, { timeout: 60_000 });
    await page.waitForTimeout(1500);
    await shot(page, '03-party-mom');
    await page.mouse.click(640, 300);
    await expect.poll(() => part(page)).toBe('cake');
    await expect(page.locator('#finale .fin-sub')).toBeVisible();
    await expect(page.locator('#finale .fin-sub')).toContainText('dear Kinan');
    await page.waitForTimeout(1200);
    await shot(page, '04-cake');
    await page.mouse.click(640, 300);
    await expect.poll(() => part(page)).toBe('fireworks');
    await page.waitForFunction(() => (window as unknown as Win).GAME!.finale!.state().lines.includes('Annie'), null, { timeout: 90_000 });
    await shot(page, '05-fireworks');
    await page.mouse.click(640, 300);
    await expect.poll(() => part(page)).toBe('theend');
    await expect(page.locator('#finale .fin-end')).toBeVisible();
    await expect(page.locator('#finale .fin-end')).toHaveText('THE END · Happy 11th birthday, Kinan!');
    await shot(page, '06-the-end');
    await page.mouse.click(640, 300);
    await expect.poll(() => part(page)).toBe('credits');
    await expect(page.locator('#finale .fin-end')).toBeHidden();
    await expect(page.locator('#finale .fin-credits')).toContainText('Big Bro Shad');
    await page.waitForTimeout(1500);
    await shot(page, '07-credits');
    await page.mouse.click(640, 300);

    await expect(page.locator('#memoryGallery .gift')).toHaveCount(11);
    expect(await page.locator('#memoryGallery .gift').evaluateAll((a) => a.map((e) => Number((e as HTMLElement).dataset.age)))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    await expect(page.locator('#memoryGallery .gift[data-age="1"] .gline')).toContainText('Baby Fin! My singing shark!');
    await expect(page.locator('#memoryGallery .gift[data-age="11"] .gline')).toContainText('the console Shad built me');
    const painted = await page.locator('#memoryGallery .gift canvas').evaluateAll((a) => a.map((c) => { const d = (c as HTMLCanvasElement).getContext('2d')!.getImageData(0, 0, 64, 64).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; }));
    expect(Math.min(...painted), 'every gift has its picture').toBeGreaterThan(300);
    await shot(page, '08-gallery');
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('the map and the menu: the castle stop, the new names, the gallery button', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await page.goto(`${BASE}index.html?devtools=1`);
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    expect(await page.evaluate(() => (window as unknown as Win).__k11.owLevelFile('12-castle'))).toBe('12-castle');
    const map = readFileSync(`${ROOT}map/worlds/w12.js`, 'utf8');
    expect(map).toContain("name:'12-7  THE ART GALLERY'");
    expect(map).toContain("name:'12-8  THE ARENA'");
    expect(map).not.toMatch(/'[^']*(SASKTEL|REMAI)[^']*'/);
    expect(readFileSync(`${ROOT}index.html`, 'utf8')).toContain('const OW_RELEASED = 11;');
    /* World 12 not released: no gallery button */
    await page.locator('#titleMenuBtn').click();
    await expect(page.locator('#menu')).toBeVisible();
    await expect(page.locator('#galleryBtn')).toBeHidden();
    await page.locator('#menuX').click();
    /* released in this tab (the dev hook): the button shows and opens the 11 gifts over the menu */
    await page.evaluate(() => (window as unknown as Win).__k11.owRelease(12));
    await page.locator('#titleMenuBtn').click();
    await expect(page.locator('#galleryBtn')).toBeVisible();
    await page.locator('#galleryBtn').click();
    await expect(page.locator('#memoryGallery .gift')).toHaveCount(11);
    await shot(page, '09-gallery-from-menu');
    await page.locator('#memoryGallery .mg-close').click();
    await expect(page.locator('#memoryGallery')).toHaveCount(0);
    await expect(page.locator('#menu')).toBeVisible();
    expect(errors, errors.join('\n')).toEqual([]);
  });
});

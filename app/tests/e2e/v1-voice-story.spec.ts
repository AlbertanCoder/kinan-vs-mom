import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* V1 — voice + story (2026-10-28). Worlds 1-5 tell the story in Shad's picked voices:
   the world intro on the map, every level's opener at its start (the audio element's src is spied, the
   subtitle read off the screen), joins-the-team / memory-gift lines at a LEVEL CLEAR, Robin's dad joke at a
   World 3-5 checkpoint, Kinan's barks; the classic stages play audio/vo2; the device voice (speechSynthesis)
   is OFF by default, English-only when switched on, and the new flow never calls it.
   Lines are stepped with __k11.storyNext() (a line "heard to the end") so nothing waits on real seconds. */
const DEV_URL = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html?devtools=1`;
const PROD_URL = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
const CURRENT = 'kinan-remaster-v1';
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

type Line = [string, string, number, string | null];
type Story = { lines: Record<string, Line>; intro: Record<string, string[]>; exit: Record<string, string[]>; open: Record<string, string[]>;
  clear: Record<string, string[]>; joke: Record<string, string>; bark: Record<string, string[]>; cutscene: string[] };
type Info = { cur: string | null; kind: string | null; queue: string[]; log: { id: string; kind: string; src: string | null }[]; heard: string[];
  mapWorld: number; levelSub: string; mapSub: string; voSrc: string | null; loaded: boolean };
type Probe = { x: number; y: number };
type Dev = {
  storyInfo: () => Info; storyNext: () => string | null; storyStop: () => boolean;
  playLevel: (id: string) => { id: string } | null; levelInfo: () => { id: string | null; cleared: boolean; returned: boolean; checkpoint: { x: number; tx: number; ty: number } | null; goal: { x: number; tx: number; ty: number } | null; cols: number; secretsFound: boolean[] };
  auto: (n: number, o?: { run?: boolean }) => unknown; step: (n: number, h?: Record<string, unknown>) => Probe[]; place: (x: number, y: number) => unknown;
  godMode: () => void; clearFoes: () => void; worldMap: () => boolean; mapWarp: (n: number, at: number) => unknown;
  mapState: () => { mounted: boolean; busy?: boolean; world?: number };
  arenaBot: (n: number) => { state: string; line: string | null; gateL: number } | null; arenaInfo: () => { state: string; line: string | null; gateL: number } | null;
  audioInfo: () => { narration: boolean; deviceVoice: boolean }; voPick: (who: string) => { name: string; lang: string } | null;
  progress: () => { storyHeard?: Record<string, number>; deviceVoice?: boolean; narration?: boolean };
};
type Win = { __k11: Dev; KinanLevels: { ready: boolean; list: () => string[] }; KINAN_STORY: Story; __srcLog: string[]; __speak: number; KINAN?: { state: () => { mounted: boolean; busy: boolean } } };

const STORY: Story = (() => {
  const c: Record<string, unknown> = {}; c.self = c;
  new Function('self', readFileSync(`${ROOT}audio/lines/lines.js`, 'utf8') + '\n' + readFileSync(`${ROOT}audio/dad-lines.js`, 'utf8'))(c);   /* + Dad's joke pass, as the game loads it */
  return c.KINAN_STORY as Story;
})();
const fixture = (name: string): string => readFileSync(fileURLToPath(new URL(`../fixtures/saves/${name}`, import.meta.url)), 'utf8');

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
/* spies, before the game runs: every src an audio element is given; every speechSynthesis.speak call.
   play() resolves silently (a test page never makes sound and never trips the autoplay rules) */
async function spy(page: Page, voices?: { name: string; lang: string }[]): Promise<void> {
  await page.addInitScript((fake) => {
    const w = window as unknown as Win;
    w.__srcLog = []; w.__speak = 0;
    const d = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
    if (d && d.set && d.get) {
      const get = d.get, set = d.set;
      Object.defineProperty(HTMLMediaElement.prototype, 'src', { configurable: true, enumerable: d.enumerable, get() { return get.call(this); }, set(v: string) { w.__srcLog.push(String(v)); set.call(this, v); } });
    }
    HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
    if (!window.speechSynthesis && fake) {   /* a browser build with no speech at all: a stand-in, so the English-only pick is still tested */
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { getVoices: () => fake, speak() { w.__speak++; }, cancel() {}, onvoiceschanged: null } });
    } else if (window.speechSynthesis) {
      const count = function () { w.__speak++; };
      try { Object.defineProperty(Object.getPrototypeOf(speechSynthesis), 'speak', { configurable: true, value: count }); } catch (e) { /* the instance below */ }
      try { Object.defineProperty(speechSynthesis, 'speak', { configurable: true, value: count }); } catch (e) { /* read-only: counted on the prototype */ }
      if (fake) try { Object.defineProperty(speechSynthesis, 'getVoices', { configurable: true, value: () => fake }); } catch (e) { /* no fake voices */ }
    }
  }, voices || null);
}
async function seed(page: Page, edit: (d: Record<string, unknown>) => void = () => {}): Promise<void> {
  await page.addInitScript(({ key, raw, fn }) => {
    if (sessionStorage.getItem('kv-seeded')) return;
    const data = JSON.parse(raw);
    data.pets = { ids: [], names: {} };
    delete data.explorer;
    (new Function('d', fn))(data);
    localStorage.setItem(key, JSON.stringify(data));
    sessionStorage.setItem('kv-seeded', '1');
  }, { key: CURRENT, raw: fixture('kinan-remaster-v1.sample.json'), fn: `(${edit.toString()})(d)` });
}
async function boot(page: Page, url = DEV_URL): Promise<void> {
  await page.goto(url);
  await page.waitForFunction(() => {
    const w = window as unknown as Win;
    return typeof w.__k11 === 'object' && !!w.KinanLevels && w.KinanLevels.ready;
  });
}
const info = (page: Page): Promise<Info> => page.evaluate(() => (window as unknown as Win).__k11.storyInfo());
const srcs = (page: Page): Promise<string[]> => page.evaluate(() => (window as unknown as Win).__srcLog.slice());
async function mapReady(page: Page): Promise<void> {
  await page.waitForFunction(() => { const k = (window as unknown as Win).KINAN; return !!k && k.state().mounted && !k.state().busy; }, null, { timeout: 30_000 });
}
const subOf = (id: string): string => `${STORY.lines[id][0]}: ${STORY.lines[id][1]}`;

test.describe('V1 · the story lines of Worlds 1-5', () => {
  test('the table: every line has a speaker, an English subtitle and its clip on disk; every level id it names has a file', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const ids = await page.evaluate(() => (window as unknown as Win).KinanLevels.list());
    const named = [...Object.keys(STORY.open), ...Object.keys(STORY.clear), ...Object.keys(STORY.joke)];
    for (const id of named) expect(ids, id).toContain(id);
    const all = [...Object.values(STORY.intro), ...Object.values(STORY.exit), ...Object.values(STORY.open), ...Object.values(STORY.clear),
      Object.values(STORY.joke), ...Object.values(STORY.bark)].flat();
    for (const id of all) expect(STORY.lines[id], id).toBeTruthy();
    const files = await page.evaluate(async (list) => {
      const out: { f: string; status: number; type: string | null }[] = [];
      for (const f of list) { const r = await fetch(f); out.push({ f, status: r.status, type: r.headers.get('content-type') }); }
      return out;
    }, [...new Set(Object.values(STORY.lines).map((l) => l[3]).filter((f): f is string => !!f))]);
    for (const f of files) { expect(f.status, f.f).toBe(200); expect(f.type, f.f).toContain('audio/mpeg'); }
    /* no subtitle-only lines left: Grandpa got his voice 2026-10-29 (audio/rerecord) */
    expect(Object.keys(STORY.lines).filter((id) => !STORY.lines[id][3]).sort()).toEqual([]);
    /* Annie's Punjabi lines carry their English subtitle */
    expect(STORY.lines.w04_annie_pa01[1]).toBe('Wait, Shad, your console did all this? Oh, my goodness.');
    expect(STORY.lines.w05_annie_pa01[1]).toBe("Hurry up, guys! It's heading for the fireworks.");
    /* Robin is Kinan's dad */
    expect(STORY.lines.w03_robin_01[0]).toBe('DAD');
    expect(errors).toEqual([]);
  });

  test('starting each World 1-5 level plays its opener clip (the audio element gets its src) and shows its subtitle; the 6 with none stay quiet', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await spy(page);
    await boot(page);
    const ids = (await page.evaluate(() => (window as unknown as Win).KinanLevels.list())).filter((id) => /^[1-5]-/.test(id));
    expect(ids.length).toBe(55);
    const quiet: string[] = [];
    for (const id of ids) {
      const r = await page.evaluate((lv) => {
        const w = window as unknown as Win, k = w.__k11;
        k.storyStop();
        const n = w.__srcLog.length;
        k.playLevel(lv);
        return { info: k.storyInfo(), srcs: w.__srcLog.slice(n) };
      }, id);
      const open = STORY.open[id];
      if (!open) { quiet.push(id); expect(r.info.cur, id).toBeNull(); expect(r.srcs, id).toEqual([]); continue; }
      const first = open[0], clip = STORY.lines[first][3]!;
      expect(r.info.cur, id).toBe(first);
      expect(r.srcs.length, id).toBe(1);
      expect(r.srcs[0], id).toContain(clip);
      expect(r.info.voSrc, id).toContain(clip);
      expect(r.info.levelSub, id).toBe(subOf(first));
      await expect(page.locator('#storyLine')).toBeVisible();
      await expect(page.locator('#storyLine')).toHaveText(subOf(first));
    }
    /* no scripted opener: the forts (their boss arena speaks the intro) and 3-8 */
    expect(quiet.sort()).toEqual(['1-fort', '2-fort', '3-8', '3-fort', '4-fort', '5-fort']);
    expect(await page.evaluate(() => (window as unknown as Win).__speak)).toBe(0);
    expect(errors).toEqual([]);
  });

  test('a line never blocks play: Kinan keeps moving while his opener talks, and a joke waits for the line before it', async ({ page }) => {
    const errors = watchErrors(page);
    await spy(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('3-2'); k.godMode(); k.clearFoes();
      const talking = k.storyInfo().cur;
      k.step(20);
      const x0 = k.step(1)[0].x;
      const x1 = k.step(40, { right: true }).pop()!.x;
      const cp = k.levelInfo().checkpoint!;
      k.place(cp.x + 24, (cp.ty - 2) * 16); k.step(4);
      return { talking, x0, x1, after: k.storyInfo(), paused: !!document.querySelector('#pause:not([hidden])') };
    });
    expect(r.talking).toBe('w03_kinan_02');
    expect(r.x1).toBeGreaterThan(r.x0 + 40);
    expect(r.paused).toBe(false);
    expect(r.after.cur).toBe('w03_kinan_02');        /* the opener is still talking... */
    expect(r.after.queue).toEqual(['jk_w03_2']);     /* ...so Robin's joke waits for it, it never talks over it */
    expect(errors).toEqual([]);
  });

  test("Robin's dad joke: at the checkpoint (3-2, 4-fort), 40% in where there is none (the castles); every World 3-5 level has one but 3-fort (the moose arena tells it)", async ({ page }) => {
    const errors = watchErrors(page);
    await spy(page);
    await boot(page);
    const ids = ['3', '4', '5'].flatMap((w) => ['1', '2', '3', '4', '5', 'fort', '6', '7', '8', 'secret', 'castle'].map((s) => `${w}-${s}`));
    expect(ids.filter((id) => !STORY.joke[id])).toEqual(['3-fort']);
    for (const id of ['3-2', '4-fort', '3-castle', '5-castle']) {
      const r = await page.evaluate((lv) => {
        const w = window as unknown as Win, k = w.__k11;
        k.playLevel(lv); k.godMode(); k.clearFoes(); k.storyStop();
        const cp = k.levelInfo().checkpoint, cols = k.levelInfo().cols;
        const before = k.storyInfo().cur;
        const n = w.__srcLog.length;
        if (cp) { k.place(cp.x + 24, (cp.ty - 2) * 16); } else { k.place(Math.round(cols * 0.45) * 16, 40); }
        k.step(30);
        return { before, info: k.storyInfo(), srcs: w.__srcLog.slice(n), cp: !!cp };
      }, id);
      expect(r.before, id).toBeNull();
      expect(r.info.cur, id).toBe(STORY.joke[id]);
      expect(r.info.levelSub, id).toBe(subOf(STORY.joke[id]));
      expect(r.srcs[0], id).toContain(STORY.lines[STORY.joke[id]][3]!);
      expect(r.cp, id).toBe(!/castle/.test(id));
    }
    expect(errors).toEqual([]);
  });

  /* QA 2026-10-28: a pet's joins-the-team line moved to its rescue (qa3-pets.spec.ts), so 1-1's LEVEL CLEAR
     now says the memory gift only (Baby Fin, then Shad); the test walks past Ginger's crate on purpose */
  test('LEVEL CLEAR: the memory gift plays once (1-1: Baby Fin, then Shad); the next clear is a Kinan bark', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await spy(page);
    await boot(page);
    /* a few steps before the bedroom door (no secret on the way), then walk into it */
    const clearOnce = () => page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-1'); k.godMode(); k.clearFoes(); k.storyStop();
      const g = k.levelInfo().goal!;
      k.place(g.x - 48, (g.ty - 3) * 16); k.step(10);
      for (let f = 0; f < 300 && !k.levelInfo().cleared; f++) k.step(1, { right: true });
      const s = k.storyInfo();
      return { cleared: k.levelInfo().cleared, talk: [s.cur, ...s.queue] };
    });
    const first = await clearOnce();
    expect(first.cleared).toBe(true);
    expect(first.talk).toEqual(['w01_kinan_17', 'w01_shad_03']);
    const heard = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11, seen: { id: string | null; sub: string }[] = [];
      for (let i = 0; i < 2; i++) { const s = k.storyInfo(); seen.push({ id: s.cur, sub: s.levelSub || s.mapSub }); k.storyNext(); }
      return { seen, saved: Object.keys(k.progress().storyHeard || {}) };
    });
    expect(heard.seen.map((s) => s.id)).toEqual(['w01_kinan_17', 'w01_shad_03']);
    expect(heard.seen[0].sub).toBe(subOf('w01_kinan_17'));
    expect(heard.saved).toEqual(expect.arrayContaining(['w01_kinan_17', 'w01_shad_03']));
    const again = await clearOnce();
    expect(again.talk).toEqual([STORY.bark.clear[0]]);   /* "Level clear!" */
    expect(STORY.lines[STORY.bark.clear[0]][1]).toBe('Level clear!');
    expect(errors).toEqual([]);
  });

  test("Kinan's barks: a golden candle (1-1's desk block) and a secret (1-5's ledge prize)", async ({ page }) => {
    const errors = watchErrors(page);
    await spy(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-1'); k.godMode(); k.clearFoes(); k.storyStop();
      k.place(71 * 16 + 3, 11 * 16); k.step(10);
      k.step(40, { tapJump: true, jump: true });
      const golden = k.storyInfo();
      k.playLevel('1-5'); k.godMode(); k.clearFoes(); k.storyStop();
      k.place(92 * 16 + 2, 8 * 16); k.step(8);
      for (let f = 0; f < 60 && !k.levelInfo().secretsFound[0]; f++) k.step(1, { left: true });
      return { golden, secret: k.storyInfo(), found: k.levelInfo().secretsFound[0] };
    });
    expect(STORY.bark.golden).toContain(r.golden.cur);
    expect(r.golden.queue).toEqual([]);              /* the golden candle is also 1-1's hidden secret: one bark, not two */
    expect(r.found).toBe(true);
    expect(r.secret.cur).toBe(STORY.bark.secret[0]);
    expect(r.secret.levelSub).toBe('KINAN: Got it!');
    expect(errors).toEqual([]);
  });

  test('a boss fight wins: its line cuts the opener short and story waits while the arena fights', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await spy(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-castle'); k.godMode(); k.clearFoes();
      const opener = k.storyInfo().cur;
      let a = k.arenaInfo();
      k.place((a!.gateL - 4) * 16, 40); k.step(20);   /* a few steps before the arena (the opener is still talking) */
      a = k.arenaInfo();
      for (let n = 0; n < 200 && a && a.state !== 'fight'; n++) a = k.arenaBot(10);
      for (let n = 0; n < 20 && a && !a.line; n++) a = k.arenaBot(2);
      return { opener, arena: a, story: k.storyInfo() };
    });
    expect(r.opener).toBe('w01_shad_02');
    expect(r.arena!.state).toBe('fight');
    expect(r.arena!.line).toBeTruthy();
    expect(r.story.cur).toBeNull();
    expect(r.story.levelSub).toBe('');
    expect(errors).toEqual([]);
  });
});

test.describe('V1 · the world intro on the map', () => {
  test("a new save: the map plays World 1's intro in order with its subtitle under the map picture; heard lines are saved and never repeat", async ({ page }) => {
    const errors = watchErrors(page);
    await spy(page);
    await boot(page);
    await page.evaluate(() => (window as unknown as Win).__k11.worldMap());
    await mapReady(page);
    await expect.poll(async () => (await info(page)).cur).toBe('w01_kinan_01');
    await expect(page.locator('#owHost .km-screen #storyLineMap')).toBeVisible();
    await expect(page.locator('#storyLineMap')).toHaveText(subOf('w01_kinan_01'));
    expect((await srcs(page)).some((s) => s.endsWith('audio/lines/w01/w01_kinan_01.mp3'))).toBe(true);
    const order = await page.evaluate((n) => {
      const k = (window as unknown as Win).__k11, seen: string[] = [];
      for (let i = 0; i < n; i++) { seen.push(String(k.storyInfo().cur)); k.storyNext(); }
      return { seen, after: k.storyInfo() };
    }, STORY.intro['1'].length);
    expect(order.seen).toEqual(STORY.intro['1']);
    expect(order.after.cur).toBeNull();
    expect(order.after.heard).toEqual(expect.arrayContaining(STORY.intro['1']));
    await expect(page.locator('#storyLineMap')).toBeHidden();
    /* back on the map later: nothing repeats */
    await page.evaluate(() => (window as unknown as Win).__k11.worldMap());
    await mapReady(page);
    await page.waitForTimeout(400);
    expect((await info(page)).cur).toBeNull();
    expect(await page.evaluate(() => (window as unknown as Win).__speak)).toBe(0);
    expect(errors).toEqual([]);
  });

  test("walking into World 4: World 3's exit lines, then World 4's intro; Annie's Punjabi line shows its English subtitle", async ({ page }) => {
    const errors = watchErrors(page);
    await spy(page);
    await boot(page);
    await page.evaluate(() => (window as unknown as Win).__k11.worldMap());
    await mapReady(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.storyStop();
      k.mapWarp(4, 0);
      const s = k.storyInfo(), talk = [s.cur, ...s.queue];
      const subs: Record<string, string> = {};
      for (let i = 0; i < talk.length; i++) { const c = k.storyInfo(); subs[String(c.cur)] = c.mapSub; k.storyNext(); }
      return { talk, subs };
    });
    expect(r.talk).toEqual([...STORY.exit['3'], ...STORY.intro['4']]);
    expect(r.subs.w04_annie_pa01).toBe('ANNIE: Wait, Shad, your console did all this? Oh, my goodness.');
    expect(r.subs.w04_annie_pa01).not.toContain('Rabba');
    expect(errors).toEqual([]);
  });

  /* 2026-10-29 (Shad): the visit is now Dad and Grandpa's joke-off, cut to 5 lines (the rest moved to the checkpoint and LEVEL CLEAR) */
  test("3-1 (Onion Lake): the whole visit plays the first time (Grandpa voiced), then only Grandma's first line", async ({ page }) => {
    const errors = watchErrors(page);
    await spy(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const w = window as unknown as Win, k = w.__k11;
      k.storyStop();
      const n = w.__srcLog.length;
      k.playLevel('3-1');
      const s = k.storyInfo(), first = [s.cur, ...s.queue];
      const grandpa: { sub: string; src: string | null }[] = [];
      for (let i = 0; i < first.length; i++) { const c = k.storyInfo(); if (c.cur && c.cur.indexOf('grandpa') >= 0) grandpa.push({ sub: c.levelSub, src: c.log[c.log.length - 1].src }); k.storyNext(); }
      const clips = w.__srcLog.slice(n);
      k.playLevel('3-1');
      const s2 = k.storyInfo();
      return { first, grandpa, clips, second: [s2.cur, ...s2.queue] };
    });
    expect(r.first).toEqual(STORY.open['3-1']);
    expect(r.first.length).toBe(5);
    expect(r.grandpa.length).toBe(2);
    for (const g of r.grandpa) { expect(g.src).toMatch(/audio\/rerecord\/w03_grandpa_0\d\.mp3$/); expect(g.sub).toMatch(/^GRANDPA: /); }
    expect(r.clips.length).toBe(5);                   /* all five opener lines are voiced now: Grandma, Grandpa x2, Dad, Kinan's groan (2026-10-29) */
    expect(r.second).toEqual(['w03_robinsmom_01']);
    expect(errors).toEqual([]);
  });
});

test.describe('V1 · no robot voice', () => {
  test('the new flow never calls speechSynthesis.speak, even with the device voice switched on: title, PLAY, the opening cutscene, the map intro, a level, LEVEL CLEAR, back to the map', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await spy(page, [{ name: 'Microsoft Natural Voice (French)', lang: 'fr-FR' }, { name: 'English Natural', lang: 'en-US' }]);
    await seed(page, (d) => { d.deviceVoice = true; d.levelsBeaten = {}; d.wmap = null; });
    await boot(page);
    const cut = () => page.evaluate(() => (window as unknown as { __k11: { cut: () => { on: boolean; lines: string[] } } }).__k11.cut());
    await page.evaluate(() => (window as unknown as { __k11: { cutSpeed: (n: number) => number } }).__k11.cutSpeed(12));
    await page.locator('#startBtn').click({ force: true });   /* the title button bobs (never "stable"), like overworld-phone-offline */
    /* 2026-10-28: a new save opens with the cutscene (c1-cutscenes.spec.ts): its voices are recorded clips as well */
    expect((await cut()).on).toBe(true);
    await expect.poll(async () => (await cut()).on, { timeout: 45_000 }).toBe(false);
    expect((await cut()).lines).toEqual(STORY.cutscene);
    await mapReady(page);
    /* World 1's map intro goes on after the bedroom (its first lines were the bedroom's own story; index.html CUT_COVERS).
       2026-10-29: the intro was cut to 5 lines (Shad: no conversation over 5), so it goes on with Mom, not Shad */
    const after = STORY.intro['1'].find((id) => ['w01_kinan_01', 'w01_kinan_02', 'w01_glitchy_01', 'w01_kinan_03'].indexOf(id) < 0)!;
    expect(after).toBe('w01_mom_01');
    await expect.poll(async () => (await info(page)).cur).toBe(after);
    await page.evaluate(() => (window as unknown as Win).__k11.storyNext());
    await page.locator('#owPlay').click();
    await expect(page.locator('#stage')).toBeVisible();
    await expect.poll(async () => (await info(page)).log.some((l) => l.id === 'w01_kinan_05')).toBe(true);
    await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.godMode(); k.clearFoes();
      for (let n = 0; n < 400 && !k.levelInfo().cleared; n++) k.auto(30, { run: true });
      for (let n = 0; n < 200 && !k.levelInfo().returned; n++) k.step(1, { right: true });
    });
    await mapReady(page);
    expect((await info(page)).log.map((l) => l.id)).toEqual(expect.arrayContaining([after, 'w01_kinan_05']));
    expect(await page.evaluate(() => (window as unknown as Win).__speak)).toBe(0);
    expect(errors).toEqual([]);
  });

  test('the device voice is ON by default (an old save\'s "narration: true" too), an explicit OFF is kept, and it only ever picks an English voice', async ({ page }) => {
    const errors = watchErrors(page);
    await spy(page, [{ name: 'Microsoft Natural Voice (French)', lang: 'fr-FR' }, { name: 'Google Deutsch Natural', lang: 'de-DE' }, { name: 'Daniel', lang: 'en-GB' }]);
    await seed(page, (d) => { d.narration = true; delete d.deviceVoice; });
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      return { a: k.audioInfo(), saved: k.progress(), kid: k.voPick('k'), mom: k.voPick('m') };
    });
    /* 2026-10-31 (Shad: "a lot of the characters' voices don't work"): ON by default. 41% of the written dialog
       lines have no recording, so an old save that only stored the old default of false comes back speaking. */
    expect(r.a.deviceVoice).toBe(true);
    expect(r.saved.narration).toBeUndefined();
    expect(r.kid).toEqual({ name: 'Daniel', lang: 'en-GB' });   /* "natural" matches the French voice first: skipped, it is not English */
    expect(r.mom).toEqual({ name: 'Daniel', lang: 'en-GB' });
    await page.locator('#menuBtn').click();   /* 2026-10-28: the audio settings are THE MENU's Settings page */
    await page.locator('#settingsBtn').click();
    await expect(page.locator('#volNarr')).toBeChecked();
    /* the player turns it off: that choice sticks (deviceVoiceSet), through a reload as well */
    await page.locator('#volNarr').uncheck();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('kinan-remaster-v1') || '{}'));
    expect(saved.deviceVoice).toBe(false);
    expect(saved.deviceVoiceSet).toBe(1);
    await page.reload();
    await boot(page);
    expect(await page.evaluate(() => (window as unknown as Win).__k11.audioInfo().deviceVoice)).toBe(false);
    expect(errors).toEqual([]);
  });

  test('with no English voice on the device, the device voice says nothing at all', async ({ page }) => {
    const errors = watchErrors(page);
    await spy(page, [{ name: 'Microsoft Natural Voice (French)', lang: 'fr-FR' }]);
    await boot(page);
    expect(await page.evaluate(() => (window as unknown as Win).__k11.voPick('k'))).toBeNull();
    expect(errors).toEqual([]);
  });
});

test.describe('V1 · the classic stages speak with audio/vo2', () => {
  test('a classic stage\'s story box plays its audio/vo2 clip (clips.json from audio/vo2), never vo/ and never the device voice', async ({ page }) => {
    const errors = watchErrors(page);
    const requested: string[] = [];
    page.on('request', (req) => requested.push(req.url()));
    await spy(page);
    await seed(page, (d) => { d.won = false; d.wonWorlds = []; d.unlocked = 2; d.beaten = [0]; d.mapWorld = 0; d.mapSeen = {}; d.mapSel = {}; });   /* won = false: with the reward codes gone, a won World 1 opens World 2 (C2) */
    await page.goto(PROD_URL);
    await page.locator('#menuBtn').click(); await page.locator('#partyBtn').click(); await page.locator('#classicBtn').click();   /* 2026-10-28: Classic stages are in THE MENU's More games */
    await page.locator('.lvchip[data-stop="0"]').click();
    await page.locator('#wmPlay').click();
    await expect(page.locator('#dialog')).toBeVisible({ timeout: 5000 });
    await expect.poll(async () => (await srcs(page)).length, { timeout: 5000 }).toBeGreaterThan(0);
    for (let i = 0; i < 3 && await page.locator('#dialog').isVisible(); i++) { await page.locator('#dialog').click(); await page.waitForTimeout(150); await page.locator('#dialog').click(); await page.waitForTimeout(150); }
    const all = await srcs(page);
    /* V3: the first tap also unlocks the voice player for iOS with one silent blip (a data: URL); every clip is audio/vo2 */
    expect(all.filter((s) => s.startsWith('data:audio/wav')).length).toBeLessThanOrEqual(1);
    const log = all.filter((s) => !s.startsWith('data:audio/wav'));
    expect(log.length).toBeGreaterThan(0);
    for (const s of log) expect(s).toMatch(/^(.*\/)?audio\/vo2\/[a-z0-9_]+\.mp3$/);
    expect(requested.some((u) => u.endsWith('/audio/vo2/clips.json'))).toBe(true);
    expect(requested.some((u) => /\/vo\/[^/]+$/.test(new URL(u).pathname))).toBe(false);
    expect(await page.evaluate(() => (window as unknown as Win).__speak)).toBe(0);
    expect(errors).toEqual([]);
  });
});

test.describe('V1 · screenshots: a subtitle on screen', () => {
  for (const shot of [
    { name: 'desktop', viewport: { width: 1280, height: 720 }, touch: false },
    { name: 'phone', viewport: { width: 844, height: 390 }, touch: true }
  ]) {
    test(`${shot.name}: the subtitle sits inside the picture (map and level) and nothing covers it`, async ({ browser, browserName }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop-chromium', 'screenshots once, from Chromium (the subtitle itself is checked on every browser above)');
      const ctx = await browser.newContext({ viewport: shot.viewport, hasTouch: shot.touch, isMobile: shot.touch && browserName === 'chromium', deviceScaleFactor: shot.touch ? 3 : 1, serviceWorkers: 'block' });
      const page = await ctx.newPage();
      const errors = watchErrors(page);
      await spy(page);
      await boot(page);
      const dir = `${ROOT}app/v1-shots`;
      mkdirSync(dir, { recursive: true });
      await page.evaluate(() => (window as unknown as Win).__k11.worldMap());
      await mapReady(page);
      await expect(page.locator('#storyLineMap')).toBeVisible();
      const inside = async (sub: string, pic: string): Promise<boolean> => {
        const a = await page.locator(sub).boundingBox(), b = await page.locator(pic).boundingBox();
        return !!a && !!b && a.x >= b.x - 1 && a.y >= b.y - 1 && a.x + a.width <= b.x + b.width + 1 && a.y + a.height <= b.y + b.height + 1;
      };
      expect(await inside('#storyLineMap', '#owHost .km-screen')).toBe(true);
      await page.screenshot({ path: `${dir}/${shot.name}-map-subtitle.png` });
      await page.evaluate(() => { const k = (window as unknown as Win).__k11; k.storyStop(); k.playLevel('4-1'); });
      await expect(page.locator('#storyLine')).toBeVisible();
      await expect(page.locator('#storyLine')).toHaveText(subOf('w04_kinan_03'));
      expect(await inside('#storyLine', '#cv')).toBe(true);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${dir}/${shot.name}-level-subtitle.png` });
      await page.evaluate(() => { const k = (window as unknown as Win).__k11; k.storyStop(); k.worldMap(); });
      await mapReady(page);
      /* World 3's 3 exit lines and World 4's first 5 intro lines, then Annie's Punjabi line (its English subtitle) */
      await page.evaluate(() => { const k = (window as unknown as Win).__k11; k.storyStop(); k.mapWarp(4, 0); for (let i = 0; i < 8; i++) k.storyNext(); });
      await expect(page.locator('#storyLineMap')).toHaveText(subOf('w04_annie_pa01'));
      await page.screenshot({ path: `${dir}/${shot.name}-map-annie-punjabi.png` });
      expect(errors).toEqual([]);
      await ctx.close();
    });
  }
});

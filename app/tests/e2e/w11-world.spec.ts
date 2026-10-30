import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* World 11 — Inside the Console (2026-10-29), the world end to end (w11-levels.spec.ts covers the level files):
   - the realm guardians (Brick-Rex 11-2, the Robot Commander 11-3, the Alpha T-Rex 11-4, Mirror Kinan 11-5), the Core
     Guardian (11-fort) and Glitchy's Last Stand (11-castle) follow the arena rules (dumb first, smarter after every
     phase, every tell 0.6 s or more, no game over) and are beaten by __k11.arenaBot through the real input state,
     ending in LEVEL CLEAR; every hit is the guardian's task, never a stomp; the KICK never hurts any of them,
   - Sabumnim's black belt plays right before the Last Stand with the whole team shown, and is saved,
   - lost tries in the Last Stand: a different family member gives a tip each time; after 5 an extra heart is offered,
   - the final hug ends the fight; Glitchy joins the team; the game's name becomes "Kinan vs. Worlds" only after the
     11-castle and stays after a reload; the 3D cutscene, World 12's teaser, TO BE CONTINUED (with the World 12 sneak-peek
     card) and the credits play and can be skipped; World 12 is a sneak peek (2026-10-30: four of its levels are open, the
     rest "coming soon", w12-preview.spec.ts) and Kinan walks on from the 11-castle into its map; no page errors. */

const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';

type LogEv = { f: number; ev: string; phase: number; atk?: string; wind?: number; hp?: number; task?: string; hug?: boolean; from?: string; who?: string; move?: string };
type Boss = { x: number; y: number; w: number; h: number; state: string; t: number; phase: number; hp: number; max: number; cur: string | null };
type X11 = { task: string; tips: { who: string; move: string; text: string }[]; extraHeart: boolean; hug: boolean; gap: { open: boolean } } | null;
type Arena = {
  kind: string; name: string; state: string; floorY: number; phases: { windup: number; pattern: string[] }[]; cp: { x: number }; tries: number;
  boss: Boss; tell: string; log: LogEv[]; deaths: number; hp: number; maxHp: number; voiceLog: string[]; subtitle: string; x11: X11; beltWait: boolean;
};
type Dev = {
  playLevel: (id: string) => unknown;
  levelInfo: () => { id: string | null; cleared: boolean; returned: boolean };
  godMode: () => void; clearFoes: () => void; storyStop: () => void;
  place: (x: number, y: number) => unknown;
  step: (n: number, hold?: Record<string, boolean>) => unknown;
  arenaInfo: () => Arena | null;
  arenaBot: (n: number) => Arena;
  arenaSetHp: (n: number) => number;
  kickInfo: () => { kicks: number };
  cutSkip: () => unknown;
};
type Win = { __k11: Dev; KinanLevels: { ready: boolean } };

const fixture = (name: string): string =>
  readFileSync(fileURLToPath(new URL(`../fixtures/saves/${name}`, import.meta.url)), 'utf8');

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

async function boot(page: Page): Promise<void> {
  await page.addInitScript(({ key, raw }) => {
    if (sessionStorage.getItem('kv-seeded')) return;
    const data = JSON.parse(raw);
    data.pets = { ids: [], names: {} };
    delete data.explorer;
    localStorage.setItem(key, JSON.stringify(data));
    sessionStorage.setItem('kv-seeded', '1');
  }, { key: CURRENT, raw: fixture('kinan-remaster-v1.sample.json') });
  await page.goto(DEV_URL);
  await page.waitForFunction(() => {
    const w = window as unknown as Win;
    return typeof w.__k11 === 'object' && !!w.KinanLevels && w.KinanLevels.ready;
  });
}

const ARENAS = [
  { id: '11-2', kind: 'brick-rex', phases: 3, task: 'heart' },
  { id: '11-3', kind: 'droid-commander', phases: 3, task: 'dock' },
  { id: '11-4', kind: 'alpha-rex', phases: 3, task: 'baby' },
  { id: '11-5', kind: 'mirror-kinan', phases: 3, task: 'pad' },
  { id: '11-fort', kind: 'core-guardian', phases: 2, task: 'vent' },
  { id: '11-castle', kind: 'glitchy-last', phases: 3, task: 'pixels' }
] as const;

/* to the arena's checkpoint (Sabumnim's scene, if it comes, is skipped like a tap) */
const TO_ARENA = `(id) => {
  const k = window.__k11;
  k.playLevel(id); k.clearFoes(); k.storyStop();
  const a = k.arenaInfo();
  k.place(a.cp.x - 6, a.floorY - 18); k.step(20);
  return k.arenaInfo();
}`;

const FIGHT = `(src, id) => {
  const k = window.__k11;
  (0, eval)(src)(id);
  let a = k.arenaInfo(), frames = 0, windup = 0, bang = 0, belt = 0, rests = 0;
  const phasesSeen = [], froms = [], tells = {};
  let wState = '', wRun = 0, wFrom = null;
  while (frames < 40000 && a.state !== 'open') {
    if (a.beltWait) { belt++; k.cutSkip(); }
    a = k.arenaBot(1); frames++;
    const b = a.boss;
    if (b.state === 'windup') { windup++; if (a.tell === '!') bang++; }
    if (a.tell === 'TASK') rests++;
    if (phasesSeen.indexOf(b.phase) < 0) phasesSeen.push(b.phase);
    if (a.from && froms.indexOf(a.from) < 0) froms.push(a.from);
    /* the shortest tell each borrowed move had before it really came (a fake or a reset mid-tell is not counted) */
    if (b.state === 'windup') { if (wState !== 'windup') { wRun = 0; wFrom = a.from; } wRun++; }
    else if (wState === 'windup' && wFrom && a.log.slice(-6).some((e) => e.ev === 'attack' && e.from === wFrom)) tells[wFrom] = Math.min(tells[wFrom] == null ? 1e9 : tells[wFrom], wRun);
    wState = b.state;
  }
  for (let n = 0; n < 2500 && !k.levelInfo().cleared; n++) k.arenaBot(1);
  return { a: k.arenaInfo(), frames, windup, bang, belt, rests, phasesSeen, froms, tells, cleared: k.levelInfo().cleared };
}`;

test.describe('World 11 · the guardians, the Core Guardian and Glitchy\'s Last Stand', () => {
  test('the six World 11 fight levels load with no problems and declare their arenas', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((list) => {
      const k = (window as unknown as { __k11: Dev & { levels: () => { refused: unknown[] }; levelProblems: () => string[] } }).__k11;
      const out: Record<string, unknown> = { refused: k.levels().refused };
      for (const id of list) { k.playLevel(id); out[id] = { problems: k.levelProblems(), kind: k.arenaInfo() ? k.arenaInfo()!.kind : null }; }
      return out;
    }, ARENAS.map((a) => a.id));
    expect(r.refused).toEqual([]);
    for (const lv of ARENAS) expect(r[lv.id], lv.id).toEqual({ problems: [], kind: lv.kind });
    expect(errors).toEqual([]);
  });

  for (const lv of ARENAS) {
    test(`${lv.id} (${lv.kind}): a scripted run from the checkpoint calms it: tells of 0.6 s or more, smarter every phase, every hit its task (never a stomp), then LEVEL CLEAR`, async ({ page }) => {
      test.setTimeout(300_000);
      const errors = watchErrors(page);
      await boot(page);
      const r = await page.evaluate(({ to, fight, id }) => (0, eval)(fight)(to, id), { to: TO_ARENA, fight: FIGHT, id: lv.id }) as
        { a: Arena; frames: number; windup: number; bang: number; belt: number; rests: number; phasesSeen: number[]; froms: string[]; tells: Record<string, number>; cleared: boolean };
      console.log(`${lv.id}: ${r.frames} frames, deaths ${r.a.deaths}, tries ${r.a.tries}, hits ${JSON.stringify(r.a.log.filter((e) => e.ev === 'hit'))}`);
      expect(r.a.kind).toBe(lv.kind);
      expect(r.a.phases.length).toBe(lv.phases);
      for (const ph of r.a.phases) expect(ph.windup).toBeGreaterThanOrEqual(36);   /* 0.6 s at 60 fps */
      const hits = r.a.log.filter((e) => e.ev === 'hit');
      expect(hits.length).toBe(lv.phases);
      expect(hits.every((e) => e.task === lv.task), 'every hit is the task, never a stomp').toBe(true);
      expect(r.phasesSeen.length).toBe(lv.phases);
      expect(r.windup).toBeGreaterThan(0);
      expect(r.bang).toBe(r.windup);   /* every wind-up shows its "!" */
      expect(r.rests).toBeGreaterThan(0);   /* the gold arrow points at the task while it rests */
      expect(r.a.boss.state).toBe('friend');
      expect(r.cleared).toBe(true);
      if (lv.kind === 'glitchy-last') {
        expect(r.belt, 'the black belt scene came first').toBeGreaterThan(0);
        expect(hits[hits.length - 1].hug, 'the last hit is a hug').toBe(true);
        /* one move from every boss, one at a time, in world order (World 10's two sit between World 9's and World 11's) */
        expect(r.froms.slice(0, 3)).toEqual(['mom', 'neighbour', 'principal']);
        for (const f of ['goalie', 'bronco', 'magpies', 'drizzle', 'octopus', 'firewall', 'grandmas', 'mom-final', 'brick-rex', 'droid-commander', 'alpha-rex', 'mirror-kinan', 'core-guardian']) expect(r.froms, f).toContain(f);
        const at = (f: string): number => r.froms.indexOf(f);
        expect([at('firewall') < at('grandmas'), at('grandmas') < at('mom-final'), at('mom-final') < at('brick-rex')], 'World 10\'s moves come after World 9\'s and before World 11\'s').toEqual([true, true, true]);
        for (const f of ['grandmas', 'mom-final']) expect(r.tells[f], `${f}: its "!" lasts 0.6 s or more before it comes`).toBeGreaterThanOrEqual(36);
        const said = r.a.voiceLog.join(' ');
        expect(said).toContain('t_last_04');   /* "Th... thank... you." */
        expect(r.a.log.some((e) => e.ev === 'join')).toBe(true);
      } else expect(r.a.deaths, 'the bot calms it without losing a fight').toBe(0);
      expect(errors).toEqual([]);
    });

    test(`${lv.id}: forty kicks at ${lv.kind} (busy and resting) never take a hit off it`, async ({ page }) => {
      test.setTimeout(150_000);
      const errors = watchErrors(page);
      await boot(page);
      const r = await page.evaluate(({ src, id }) => {
        const k = (window as unknown as Win).__k11;
        (0, eval)(src)(id);
        k.godMode();
        let a = k.arenaInfo()!;
        for (let n = 0; n < 3000 && a.state !== 'fight'; n++) { if (a.beltWait) k.cutSkip(); a = k.arenaBot(1); }
        const hitsNow = (): number => k.arenaInfo()!.log.filter((e) => e.ev === 'hit').length;
        let kicks = 0;
        const kickOnce = (): void => {
          const a1 = k.arenaInfo()!, b = a1.boss;
          k.place(b.x - 14, a1.floorY - 16);
          k.step(1, { right: true }); k.step(1, { right: false });
          const k0 = k.kickInfo().kicks;
          for (let t = 0; t < 40 && k.kickInfo().kicks === k0; t++) k.step(1, { tapFire: true });
          k.step(16);
          kicks++;
        };
        const hp0 = k.arenaInfo()!.boss.hp;
        let h = hitsNow(), kickHits = 0;
        for (let n = 0; n < 20; n++) kickOnce();
        kickHits += hitsNow() - h;
        const busyHp = k.arenaInfo()!.boss.hp;
        a = k.arenaInfo()!;
        for (let n = 0; n < 9000 && !(a.boss.state === 'tired' || a.boss.state === 'dizzy'); n++) a = k.arenaBot(1);
        const restHp = a.boss.hp;
        h = hitsNow();
        for (let n = 0; n < 20 && (k.arenaInfo()!.boss.state === 'tired' || k.arenaInfo()!.boss.state === 'dizzy'); n++) kickOnce();
        kickHits += hitsNow() - h;
        return { hp0, busyHp, restHp, restAfter: k.arenaInfo()!.boss.hp, kicks, kickHits };
      }, { src: TO_ARENA, id: lv.id });
      expect(r.kicks).toBeGreaterThanOrEqual(20);
      expect(r.busyHp).toBe(r.hp0);
      expect(r.kickHits).toBe(0);
      expect(r.restAfter).toBe(r.restHp);
      expect(errors).toEqual([]);
    });
  }

  test('every World 11 fight draws live (the guardians, their tells and their tasks) without page errors', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = watchErrors(page);
    await boot(page);
    const seen: string[] = [];
    for (const lv of ARENAS) {
      await page.evaluate(({ src, lid }) => { (0, eval)(src)(lid); (window as unknown as Win).__k11.godMode(); }, { src: TO_ARENA, lid: lv.id });
      for (let i = 0; i < 8; i++) {
        const s = await page.evaluate(() => { const k = (window as unknown as Win).__k11; let a = k.arenaInfo()!; if (a.beltWait) k.cutSkip(); a = k.arenaBot(160); return a.boss.state + (a.tell === 'TASK' ? '+task' : ''); });
        seen.push(lv.id + ':' + s);
        await page.waitForTimeout(200);   /* the real frame loop draws this moment */
      }
    }
    console.log('W11 drawn states: ' + seen.join(' · '));
    expect(errors).toEqual([]);
  });

  test('pictures for review: each guardian winding up and resting, the black belt with the team, every part of the ending (saved with the test output)', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    await boot(page);
    const shot = async (loc: string, name: string): Promise<void> => { await page.waitForTimeout(160); await page.locator(loc).screenshot({ path: test.info().outputPath(name + '.png') }); };
    const freeze = (on: boolean) => page.evaluate((v) => (window as unknown as { __k11: { freeze: (b: boolean) => boolean } }).__k11.freeze(v), on);
    /* the black belt first (it plays once): the team round Kinan, Sabumnim on the screen */
    await page.evaluate((src) => { const k = (window as unknown as Win).__k11; (0, eval)(src)('11-castle'); let a = k.arenaInfo()!; for (let n = 0; n < 600 && !a.beltWait; n++) a = k.arenaBot(1); }, TO_ARENA);
    await page.waitForTimeout(3600); await shot('#cutCv', 'belt-black');
    await page.evaluate(() => (window as unknown as Win).__k11.cutSkip());
    for (const lv of ARENAS) {
      await page.evaluate(({ src, lid }) => { (0, eval)(src)(lid); (window as unknown as Win).__k11.godMode(); }, { src: TO_ARENA, lid: lv.id });
      for (const want of ['windup', 'rest']) {
        await page.evaluate((w) => {
          const k = (window as unknown as Win).__k11;
          let a = k.arenaInfo()!;
          for (let n = 0; n < 9000; n++) { if (a.beltWait) k.cutSkip(); a = k.arenaBot(1); if (w === 'windup' ? a.boss.state === 'windup' && a.boss.t < 20 : a.tell === 'TASK') break; }
          if (w === 'rest') for (let n = 0; n < 24 && k.arenaInfo()!.tell === 'TASK'; n++) k.step(1);   /* the task's things appear (Kinan stands still) */
        }, want);
        await freeze(true); await shot('#cv', `${lv.id}-${want}`); await freeze(false);
      }
    }
    /* the ending, part by part */
    await page.evaluate(() => { const k = (window as unknown as { __k11: MapDev }).__k11; k.cutSpeed(2); k.endingPlay(); });
    const at = [[2600, 'end-1-friend'], [5000, 'end-2-name'], [3200, 'end-3-unfold-flat'], [2600, 'end-4-unfold-3d'], [2200, 'end-5-hands'], [4400, 'end-6-turn'], [6500, 'end-7-turn-birthday'], [4600, 'end-8-teaser'], [2400, 'end-9-tbc'], [5000, 'end-10-credits']] as const;
    for (const [ms, name] of at) { await page.waitForTimeout(ms); await shot('#cutCv', name); }
    expect(errors).toEqual([]);
  });
});

/* ---- the Last Stand: the black belt first, the family's tips on lost tries, the extra heart ---- */
test.describe("World 11 · Glitchy's Last Stand", () => {
  test("Sabumnim's black belt plays right before the Last Stand, by video call with the whole team gathered round Kinan; it is saved and never plays twice", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((src) => {
      const k = (window as unknown as Win).__k11 as Dev & { cut: () => { on: boolean; mode: string; belt: { rank: number; line: string; team: string[]; call: boolean } | null }; progress: () => { beltSeen: number } };
      (0, eval)(src)('11-castle');
      let a = k.arenaInfo()!;
      for (let n = 0; n < 600 && !a.beltWait && a.state === 'wait'; n++) a = k.arenaBot(1);
      const during = { wait: a.beltWait, state: a.state, cut: k.cut(), saved: JSON.parse(localStorage.getItem('kinan-remaster-v1') || '{}').blackBelt === true };
      k.cutSkip();
      for (let n = 0; n < 200 && a.state !== 'fight'; n++) a = k.arenaBot(1);
      const after = { state: a.state, belts: a.log.filter((e) => e.ev === 'belt').length };
      /* lose the fight once: back at the flag, walk in again: no second black belt */
      k.place(a.cp.x - 6, a.floorY - 18);
      for (let n = 0; n < 4000 && k.arenaInfo()!.log.filter((e) => e.ev === 'reset').length === 0; n++) {
        const b = k.arenaInfo()!; if (b.state === 'fight') { k.arenaSetHp(1); k.place(b.boss.x + 4, b.floorY - 16); } k.step(1);
      }
      a = k.arenaInfo()!;
      for (let n = 0; n < 900 && a.state !== 'fight'; n++) a = k.arenaBot(1);
      return { during, after, again: { state: a.state, belts: a.log.filter((e) => e.ev === 'belt').length, wait: a.beltWait }, beltSeen: k.progress().beltSeen };
    }, TO_ARENA);
    expect(r.during.wait).toBe(true);
    expect(r.during.state, 'the fight waits for Sabumnim').toBe('wait');
    expect(r.during.cut).toMatchObject({ on: true, mode: 'belt', belt: { line: 'belt_black', call: true, team: ['ANNIE', 'MOM', 'DAD', 'CHENOA', 'SHAD'] } });
    expect(r.during.saved, 'saved the moment it starts').toBe(true);
    expect(r.after).toEqual({ state: 'fight', belts: 1 });
    expect(r.again).toEqual({ state: 'fight', belts: 1, wait: false });
    expect(r.beltSeen).toBe(11);
    expect(errors).toEqual([]);
  });

  test('after each lost try a different family member gives a tip about the move that got him, and after 5 lost tries Kinan is offered an extra heart for the rest of the fight', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    await boot(page);
    const lose = `(k) => {
      let a = k.arenaInfo();
      for (let n = 0; n < 3000 && a.state !== 'fight'; n++) { if (a.beltWait) k.cutSkip(); a = k.arenaBot(1); }
      const r0 = a.log.filter((e) => e.ev === 'reset').length;
      for (let n = 0; n < 5000 && k.arenaInfo().log.filter((e) => e.ev === 'reset').length === r0; n++) {
        const b = k.arenaInfo();
        if (b.state === 'fight' && !b.dead) { k.arenaSetHp(1); k.place(b.boss.x + 4, b.floorY - 16); }
        k.step(1);
      }
      k.step(40);
      return k.arenaInfo();
    }`;
    await page.evaluate((src) => { (0, eval)(src)('11-castle'); }, TO_ARENA);
    const tips: { who: string; move: string; text: string }[] = [];
    let subtitles: string[] = [];
    for (let i = 0; i < 5; i++) {
      const a = await page.evaluate((fn) => (0, eval)(fn)((window as unknown as Win).__k11), lose) as Arena;
      tips.splice(0, tips.length, ...a.x11!.tips);
      subtitles = subtitles.concat(a.subtitle ? [a.subtitle] : []);
      if (i < 4) await expect(page.locator('#glitchyAsk')).toBeHidden();
    }
    expect(tips.map((t) => t.who), 'a different family member each time').toEqual(['MOM', 'DAD', 'CHENOA', 'SHAD', 'ANNIE']);
    for (const t of tips) { expect(t.text).toContain('that was '); expect(t.text.length).toBeGreaterThan(40); }
    expect(subtitles.some((s) => /^(MOM|DAD|CHENOA|SHAD|ANNIE):/.test(s)), 'the tip shows as a subtitle').toBe(true);
    /* the fifth lost try: the offer of an extra heart */
    await expect(page.locator('#glitchyAsk')).toBeVisible();
    await expect(page.locator('#glitchyAskTitle')).toHaveText('An extra heart for the Last Stand?');
    const before = await page.evaluate(() => (window as unknown as Win).__k11.arenaInfo()!.maxHp);
    await page.locator('#glitchyYes').click();
    const after = await page.evaluate(() => { const a = (window as unknown as Win).__k11.arenaInfo()!; return { maxHp: a.maxHp, hp: a.hp, extra: a.x11!.extraHeart, heart: a.log.some((e) => e.ev === 'heart') }; });
    expect(after).toEqual({ maxHp: Math.min(5, before + 1), hp: Math.min(5, before + 1), extra: true, heart: true });
    /* it lasts the rest of the fight: the next lost try keeps it, and the tip goes round to Mom again */
    const a6 = await page.evaluate((fn) => (0, eval)(fn)((window as unknown as Win).__k11), lose) as Arena;
    expect(a6.maxHp).toBe(after.maxHp);
    expect(a6.x11!.tips[5].who).toBe('MOM');
    expect(errors).toEqual([]);
  });

  test("World 10's two borrowed moves: Grandma's spinning cane and Mom's laundry basket roll in the middle of phase 3, each with its label, drawn live, and a tip from each family member (Mom names her basket as hers; Mom and Dad say \"your grandma's cane\")", async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    await boot(page);
    await page.evaluate((src) => { (0, eval)(src)('11-castle'); (window as unknown as Win).__k11.godMode(); }, TO_ARENA);
    type TipDev = { lastStand: () => { borrow: Record<string, { label: string; roller?: string }>; tips: Record<string, [string, string]>; rollers: Record<string, [number, number]> };
      x11TipNow: (move: string) => { who: string; move: string; text: string } | null };
    const r = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev & TipDev }).__k11, ls = k.lastStand(), said: Record<string, string[]> = {};
      let a = k.arenaInfo()!;
      for (let n = 0; n < 3000 && a.state !== 'fight'; n++) { if (a.beltWait) k.cutSkip(); a = k.arenaBot(1); }   /* the black belt first, then the fight */
      /* five lost tries to each move: the tip goes round the family (Mom, Dad, Chenoa, Shad, Annie) */
      for (const move of ['grandmas', 'mom-final']) said[move] = [0, 1, 2, 3, 4].map(() => { const t = k.x11TipNow(move)!; return t.who + ': ' + t.text; });
      return { grandmas: ls.borrow.grandmas, momFinal: ls.borrow['mom-final'], tips: [ls.tips.grandmas, ls.tips['mom-final']], rollers: ls.rollers, pattern: k.arenaInfo()!.phases[2].pattern, said };
    });
    expect(r.grandmas).toEqual({ label: "GRANDMA'S SPINNING CANE", roller: 'cane' });
    expect(r.momFinal).toEqual({ label: "MOM'S LAUNDRY BASKET", roller: 'laundry' });
    expect(r.rollers, 'the cane is low and long (jump it); the laundry is the size Mom\'s always was').toEqual({ cane: [14, 6], laundry: [14, 10] });
    expect(r.tips.every((t) => !!t && t[1].length > 30), 'both have a family tip').toBe(true);
    expect(r.pattern.slice(1, 5), 'one at a time, between World 9\'s firewall and World 11\'s brick shower').toEqual(['bolt@firewall', 'roll@grandmas', 'roll@mom-final', 'shower@brick-rex']);
    const cane = "it spins in low along the floor, just like at the picnic. Jump the low part!";
    expect(r.said.grandmas).toEqual([`MOM: Sweetie, that was your grandma's cane: ${cane}`, `DAD: Bud, that was your grandma's cane: ${cane}`,
      `CHENOA: Little bro, that was Grandma's cane: ${cane}`, `SHAD: Hey bud, that was Grandma's cane: ${cane}`, `ANNIE: Kinan, that was Grandma's cane: ${cane}`]);
    const basket = 'it rolls along the floor at you, like in chore two. Jump it just before it reaches you.';
    expect(r.said['mom-final']).toEqual([`MOM: Sweetie, that was my laundry basket: ${basket}`, `DAD: Bud, that was Mom's laundry basket: ${basket}`,
      `CHENOA: Little bro, that was Mom's laundry basket: ${basket}`, `SHAD: Hey bud, that was Mom's laundry basket: ${basket}`, `ANNIE: Kinan, that was Mom's laundry basket: ${basket}`]);
    /* in the real fight: each one's label pops up over Glitchy, then it rolls along the floor (the frame loop draws it) */
    for (const from of ['grandmas', 'mom-final']) {
      const s = await page.evaluate((f) => {
        const k = (window as unknown as Win).__k11;
        let a = k.arenaInfo()!, n = 0;
        for (; n < 40000 && !a.log.some((e) => e.ev === 'attack' && e.from === f); n++) { if (a.beltWait) k.cutSkip(); a = k.arenaBot(1); }
        const a2 = k.arenaBot(12) as Arena & { shots: { kind: string; roll: boolean; friendly: boolean }[] };
        return { n, phase: a.boss.phase, borrow: a.log.some((e) => e.ev === 'borrow' && e.from === f), rollers: a2.shots.filter((q) => q.roll && !q.friendly).map((q) => q.kind) };
      }, from);
      expect(s.n, `${from} came within the run`).toBeLessThan(40000);
      expect(s.phase).toBe(3);
      expect(s.borrow, `${from}: its label popped up`).toBe(true);
      expect(s.rollers, `${from}: it rolls`).toContain(from === 'grandmas' ? 'cane' : 'laundry');
      await page.waitForTimeout(250);   /* the real frame loop draws it */
      await page.locator('#cv').screenshot({ path: test.info().outputPath(`11-castle-${from}.png`) });
    }
    expect(errors).toEqual([]);
  });
});

/* ---- the map and the ending ---- */
type MapS = { mounted: boolean; walking: boolean; crossing: boolean; busy: boolean; banner: string | null; notice: string | null; world: number | null; at: number; gate?: number | null; gatePeek?: boolean;
  three?: boolean; threeReady?: boolean; stops: { id: string | null; kind: string; built: boolean; state: string | null }[] };
type CutS = { on: boolean; mode: string | null; ending: { beat: number; beats: string[]; lines: string[]; skips: number; replay: boolean; t: number; peek: boolean } | null };
type EndInfo = { name: string; label: string; title: string; worldsName: boolean; glitchyTeam: boolean; endingSeen: boolean; beats: string[]; lines: [string, string, string][]; credits: string[]; menuBtn: boolean; peek: string; peekOn: boolean };
type MapDev = Dev & { mapState: () => MapS; cut: () => CutS; cutSpeed: (n: number) => number; owRelease: (n: number) => number; ending: () => EndInfo; endingPlay: () => boolean;
  progress: () => { levelsBeaten: Record<string, number> } };
const dev = (page: Page) => ({
  map: (): Promise<MapS> => page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.mapState()),
  cut: (): Promise<CutS> => page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.cut()),
  ending: (): Promise<EndInfo> => page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.ending())
});
async function settle(page: Page, timeout = 60_000): Promise<MapS> {
  await page.waitForFunction(() => { const k = (window as unknown as { __k11: MapDev }).__k11; const s = k.mapState(); return s.mounted && !s.walking && !s.crossing && !s.busy && !s.banner && !k.cut().on; }, null, { timeout });
  return dev(page).map();
}
/* a save: every level of Worlds 1-10 beaten (World 10's files are in this copy since the merge), plus `extra`; the map opened up to `release` */
async function seedSave(page: Page, extra: Record<string, unknown>, beatW11: (id: string) => boolean, release: number): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
  await page.evaluate(({ key, extra, beat, release }) => {
    const w = window as unknown as { KinanLevels: { list: () => string[] }; __k11: MapDev };
    w.__k11.owRelease(release);
    const ids = w.KinanLevels.list(), beaten: Record<string, number> = {}, keep = (0, eval)(beat) as (id: string) => boolean;
    for (const id of ids) if (Number(id.split('-')[0]) <= 10 || keep(id)) beaten[id] = 1;
    for (let wn = 1; wn <= 10; wn++) for (const s of ['1', '2', '3', '4', '5', '6', '7', '8', 'fort', 'castle']) beaten[`${wn}-${s}`] = 1;
    const secrets = ids.filter((id) => /secret/.test(id) && Number(id.split('-')[0]) <= 11);
    localStorage.setItem(key, JSON.stringify(Object.assign({ unlocked: 1, beaten: [], introSeen: true, levelsBeaten: beaten, unlockedLevels: secrets,
      escapes: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1 } }, extra)));
  }, { key: CURRENT, extra, beat: beatW11.toString(), release });
  await page.reload();
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
}
const BEAT_HERE = `() => {
  const k = window.__k11;
  k.clearFoes();
  const a0 = k.arenaInfo(); k.place(a0.cp.x - 6, a0.floorY - 18); k.step(20);
  let a = k.arenaInfo();
  for (let f = 0; f < 40000 && a.state !== 'open'; f++) { if (a.beltWait) k.cutSkip(); a = k.arenaBot(1); }
  for (let m = 0; m < 2500 && !k.levelInfo().cleared; m++) k.arenaBot(1);
  for (let m = 0; m < 1500 && !k.levelInfo().returned; m++) k.step(1, { right: true });
  return { level: k.levelInfo(), state: a.state, join: a.log.some((e) => e.ev === 'join'), hug: a.log.filter((e) => e.ev === 'hit').pop() };
}`;

test.describe('World 11 · on the map, and the ending', () => {
  test('the 10-castle opens World 11 once it is released (before that, its "coming soon" sign stands there); its stops are 11-1 .. 11-8, the fort THE CORE GUARDIAN, the secret and the castle', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    /* World 11 not released: past the World 10 castle the way on is its "coming soon" sign */
    await seedSave(page, { beltSeen: 11, wmap: { w: 10, at: 10 } }, () => false, 10);
    await page.locator('#startBtn').click({ force: true });
    expect(await settle(page)).toMatchObject({ world: 10, at: 10, gate: 11 });
    /* released (v54: the build's own OW_RELEASED is 11; owRelease(0) goes back to the build's number): no sign, and
       Kinan crosses into World 11 through the door in the mist */
    expect(await page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.owRelease(0)), "this build's release").toBe(11);
    await page.reload();
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    expect(s0).toMatchObject({ world: 10, at: 10 });
    expect(s0.gate ?? null, 'no World 11 sign').toBeNull();
    await page.locator('#owNext').click();
    /* World 10 glitches into World 11 (World 10's seam, in this copy since the merge: its banner first) */
    await expect.poll(async () => (await dev(page).map()).banner, { timeout: 10_000 }).toBe('WAIT... DID THE WORLD JUST GLITCH?');
    await expect.poll(async () => (await dev(page).map()).world, { timeout: 90_000, intervals: [200] }).toBe(11);
    const s1 = await settle(page, 120_000);
    expect(s1.world).toBe(11);
    expect(s1.at).toBe(0);
    expect(s1.stops.map((q) => [q.id, q.kind, q.built])).toEqual([
      ['11-1', 'level', true], ['11-2', 'level', true], ['11-3', 'level', true], ['11-4', 'level', true], ['11-5', 'level', true],
      ['11-fort', 'fort', true], ['11-6', 'level', true], ['11-7', 'level', true], ['11-secret', 'secret', true], ['11-8', 'level', true],
      ['11-castle', 'boss', true]]);
    expect(s1.stops[0].state).toBe('open');
    expect(s1.stops[10].state).toBe('locked');
    const names = await page.evaluate(() => { const w = window as unknown as { KINAN: { W: { n: number; stops: { name: string }[] }[] } }; return w.KINAN.W.find((q) => q.n === 11)!.stops.map((q) => q.name); });
    expect(names[5]).toBe('FORT  THE CORE GUARDIAN');
    expect(errors).toEqual([]);
  });

  test("the 11-castle: the final hug ends the fight, Glitchy joins the team, the ending plays (the name card, the 3D cutscene, World 12's teaser, TO BE CONTINUED with the World 12 sneak-peek card, the credits), the name becomes Kinan vs. Worlds for good, and Kinan walks on from the castle into World 12's sneak peek", async ({ page }) => {
    test.setTimeout(400_000);
    const errors = watchErrors(page);
    await seedSave(page, { beltSeen: 11, blackBelt: true, wmap: { w: 11, at: 10 } }, (id: string) => /^11-/.test(id) && id !== '11-castle', 11);
    /* before: still "Kinan vs. Mom" */
    await expect(page.locator('#screen h1.title .t1')).toHaveText('Kinan vs. Mom');
    const e0 = await dev(page).ending();
    expect(e0).toMatchObject({ name: 'Kinan vs. Mom', worldsName: false, glitchyTeam: false, endingSeen: false, menuBtn: false });
    expect(e0.title.startsWith('Kinan vs. Mom')).toBe(true);
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    expect(s0).toMatchObject({ world: 11, at: 10 });
    expect(s0.stops[10]).toMatchObject({ id: '11-castle', kind: 'boss', built: true, state: 'open' });
    await page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.cutSpeed(12));
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as Win).__k11.levelInfo().id)).toBe('11-castle');
    expect((await dev(page).ending()).name, 'not before the castle is won').toBe('Kinan vs. Mom');
    const r = await page.evaluate(`(${BEAT_HERE})()`) as { level: { cleared: boolean; returned: boolean }; state: string; join: boolean; hug: LogEv };
    expect(r.state).toBe('open');
    expect(r.hug).toMatchObject({ ev: 'hit', hp: 0, task: 'pixels', hug: true });   /* the last hit is a hug */
    expect(r.join, 'Glitchy joins the team').toBe(true);
    expect(r.level.cleared).toBe(true);
    expect(r.level.returned).toBe(true);
    /* the ending plays over the map, beat by beat */
    await expect.poll(async () => (await dev(page).cut()).mode, { timeout: 15_000, intervals: [100] }).toBe('ending');
    const beats: string[] = [];
    let last: CutS | null = null;
    for (let i = 0; i < 600; i++) {
      const c = await dev(page).cut();
      if (!c.on) break;
      last = c;
      const b = c.ending!.beats[c.ending!.beat];
      if (b && beats[beats.length - 1] !== b) beats.push(b);
      await page.waitForTimeout(60);
    }
    expect(beats).toEqual(['friend', 'name', 'unfold', 'turn', 'teaser', 'tbc', 'credits']);
    /* the World 12 sneak-peek card was painted under TO BE CONTINUED (it stays true once shown; the card's pixels are checked in w12-preview.spec.ts) */
    expect(last!.ending!.peek, 'the sneak-peek card was shown in the ending').toBe(true);
    const said = last!.ending!.lines;
    for (const id of ['end_glitchy_01', 'end_kinan_02', 'end_mom_02', 'end_kinan_03', 'end_annie_01', 'end_chenoa_01', 'end_dad_01', 'end_glitchy_02', 'end_shad_02']) expect(said, id).toContain(id);
    const info = await dev(page).ending();
    const text = Object.fromEntries(info.lines.map(([id, who, t]) => [id, `${who}: ${t}`]));
    expect(text.end_kinan_02).toBe('KINAN: We did it! ...Why can I see the BACK of my house?!');
    expect(text.end_mom_02).toBe('MOM: Kinan, stay close!');
    expect(text.end_kinan_03).toBe("KINAN: WHAT IS GOING ON HERE?! My hands are 3D! ...Okay, that's cool, BUT WHAT?!");
    expect(text.end_annie_01).toBe('ANNIE: Definitely not in the recipe.');
    expect(text.end_chenoa_01).toBe("CHENOA: Little bro, don't touch anything!");
    expect(text.end_dad_01).toBe('DAD: One dimension at a time, guys.');
    expect(text.end_glitchy_02).toBe('GLITCHY: Th... thank... you.');
    expect(text.end_shad_02).toBe('SHAD: Welcome to your eleventh birthday, bud.');
    for (const who of ['Kinan', 'Mom', 'Dad', 'Big Sis Chenoa', 'Big Bro Shad', 'Annie', 'GRANDPA', 'the Grandmas',   /* GRANDPA as labelled (the World 11 review, 4477a7b) */ 'Sabumnim', 'Glitchy', 'Ginger', 'Chikastino', 'Vader', 'Hunter', 'Duchess', 'Tuxedo',
      'Bronco', 'Robo-Rex', 'Drizzle', 'the Raccoon King', 'Brick-Rex', 'the Alpha T-Rex']) expect(info.credits, who).toContain(who);
    expect(info.credits.join(' ')).toContain("Made for Kinan's 11th birthday by Big Bro Shad");
    /* the card's words: the hint that four levels are open now and a lot more is coming */
    expect(info.peekOn).toBe(true);
    expect(info.peek).toBe('WORLD 12 SNEAK PEEK: Four levels of 3D Saskatoon are open now. Much more is coming!');
    /* after it: the name, Glitchy on the team, World 12 behind its SNEAK PEEK sign (2026-10-30: it was a "coming soon" sign) */
    expect(info).toMatchObject({ name: 'Kinan vs. Worlds', label: 'KINAN vs. WORLDS', worldsName: true, glitchyTeam: true, endingSeen: true, menuBtn: true });
    expect(info.title.startsWith('Kinan vs. Worlds')).toBe(true);
    const s1 = await settle(page);
    expect(s1).toMatchObject({ world: 11, at: 10, notice: 'WORLD 12 SNEAK PEEK IS OPEN!', gate: 12, gatePeek: true });
    expect(s1.stops[10].state).toBe('beaten');
    /* and the sign does not stop him: Kinan walks on from the 11-castle into World 12's 3D map (the 2D-to-3D change plays) */
    await page.locator('#owNext').click();
    await page.waitForFunction(() => { const s = (window as unknown as { __k11: MapDev }).__k11.mapState(); return s.world === 12 && !!s.three && !!s.threeReady; }, null, { timeout: 120_000 });
    await expect(page.locator('#owHost .k3-peek')).toContainText('SNEAK PEEK');
    /* it stays after a reload: the title says Kinan vs. Worlds */
    await page.reload();
    await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
    await expect(page.locator('#screen h1.title .t1')).toHaveText('Kinan vs. Worlds');
    expect(await dev(page).ending()).toMatchObject({ name: 'Kinan vs. Worlds', worldsName: true, glitchyTeam: true, menuBtn: true });
    /* the menu replays it, and every part can be skipped (the 3D cutscene after its first 3 s) */
    await page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.cutSpeed(1));
    await page.locator('#titleMenuBtn').click();
    await page.locator('#endingBtn').click();
    await expect.poll(async () => (await dev(page).cut()).mode).toBe('ending');
    expect((await dev(page).cut()).ending!.replay).toBe(true);
    const order: string[] = [];
    for (let i = 0; i < 60; i++) {
      const c = await dev(page).cut();
      if (!c.on) break;
      const b = c.ending!.beats[c.ending!.beat];
      if (order[order.length - 1] !== b) order.push(b);
      if (b === 'unfold' && c.ending!.t < 3000) {   /* the 3D cutscene holds its first 3 s */
        const before = c.ending!.beat;
        await page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.cutSkip());
        const c2 = await dev(page).cut();
        if (c2.ending!.t < 3000) expect(c2.ending!.beat, 'no skip in the first 3 s').toBe(before);
        await page.waitForTimeout(3100);
      }
      await page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.cutSkip());
      await page.waitForTimeout(80);
    }
    expect((await dev(page).cut()).on, 'skipped to the end').toBe(false);
    expect(order).toEqual(['friend', 'name', 'unfold', 'turn', 'teaser', 'tbc', 'credits']);
    expect(errors).toEqual([]);
  });
});

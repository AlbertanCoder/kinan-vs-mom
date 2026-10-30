import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* World 10 — Niagara Falls (2026-10-29). The world end to end (w10-levels.spec.ts covers the level files):
   - THE GRANDMOTHERS' PICNIC (10-fort, 'grandmas'): two SOLO phases (GRANDMA (EDMONTON)'s complaint bubbles, GRANDMA
     (ONION LAKE)'s cane boomerangs, both with cheek-pinch circles), a checkpoint, the TAG TEAM; one shared STEAM meter;
     beaten by dodging (__k11.arenaBot through the real input state), then ONE ENORMOUS HUG, food and LEVEL CLEAR;
     GRANDPA cheers from his lawn chair and nothing ever reaches him,
   - MOM'S LAST INSPECTION (10-castle, 'mom-final'): three chores, each one trickier (TIDY THE ROOM, DODGE THE LAUNDRY
     PILE, CARRY THE CAKE SAFELY); a cake drop restarts only that round; the ending: Mom is proud ("You're ready, my
     boy."), joins the team, Grandpa's joke-off with Dad's wheeze-laugh and Mom's laugh, the cake and the song, then THE
     TURN (the Falls flow upward, the picture tears, a door opens in the mist), then LEVEL CLEAR,
   - every tell is 0.6 s or more and shows its "!"; the KICK never touches the Grandmas or Mom; nobody is ever hit
     (no 'hit' in the fights' logs); no game over (a lost fight starts again from its own checkpoint),
   - on the map: World 10 opens after the 9-castle; the 10-castle plays Glitchy's exit, then Sabumnim's belt scene, and
     the way on opens into World 11 (released in v54: the world glitches, World 11's arrival lines follow). No page errors. */

const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';

type LogEv = { f: number; ev: string; phase: number; atk?: string; wind?: number; hp?: number; tell?: number; speed?: number; live?: number; n?: number; by?: string; who?: string };
type Haz = { kind: string; st: string; t: number; tell: number; x: number; y: number; xs: number[] | null; got: boolean; bang: boolean };
type W10 = {
  kind: string; phase: number; cp: number; brk: number; tells: number[]; gotK: number; kickFrames: number; kickNear: number; haz: Haz[];
  end: { beat: number; ready: boolean; skips: number } | null; lo: number; hi: number; mid: number;
  steam?: number; done?: number; used?: number; grans?: Record<string, { x: number; st: string; sit: boolean }>; gp?: { x: number; y: number; w: number; h: number }; gpHits?: number; hug?: boolean; food?: boolean;
  tidy?: number; launched?: number; dodged?: number; held?: string | null; items?: { kind: string; st: string; x: number; tx: number; bin: string | null }[];
  bins?: { kind: string; x: number; col: string; word: string }[]; cake?: string; drops?: number; bounces?: number; hops?: number; stand?: number; table?: { x: number; w: number };
  castle?: { x0: number; x1: number }; tables?: { x: number; w: number }[] | null; joined?: boolean; party?: boolean; candles?: boolean; turn?: number; flow?: number; door?: number; tear?: number;
};
type Boss = { x: number; y: number; w: number; h: number; state: string; t: number; phase: number; hp: number; max: number };
type Arena = {
  kind: string; name: string; state: string; floorY: number; phases: { windup: number; speed: number; live: number }[]; cp: { x: number }; tries: number; helped: boolean;
  boss: Boss; log: LogEv[]; deaths: number; hp: number; maxHp: number; voiceLog: string[]; subtitle: string; line: string | null; lineQ: string[]; px: number; py: number;
  hud: { shown: boolean; name: string; pips: number; live: number }; w10: W10; wheezes: number;
};
type Dev = {
  playLevel: (id: string) => unknown;
  levelInfo: () => { id: string | null; cleared: boolean; returned: boolean };
  godMode: () => void; clearFoes: () => void; storyStop: () => void;
  place: (x: number, y: number) => unknown;
  step: (n: number, hold?: Record<string, boolean>) => unknown;
  auto: (n: number, opts?: { run?: boolean }) => unknown;
  arenaInfo: () => Arena | null;
  arenaBot: (n: number) => Arena;
  arenaSetHp: (n: number) => number;
  kickInfo: () => { kicks: number };
};
type Win = { __k11: Dev; KinanLevels: { ready: boolean; get: (id: string) => { talk: [number, string, string, number?, string?][]; theme: number; arena?: unknown } } };

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

/* stand Kinan just before the arena's checkpoint flag (foes cleared, story lines stopped) */
const TO_ARENA = `(id) => {
  const k = window.__k11;
  k.playLevel(id); k.clearFoes(); k.storyStop();
  const a = k.arenaInfo();
  k.place(a.cp.x - 6, a.floorY - 18); k.step(20);
  return k.arenaInfo();
}`;

/* the bot plays the fight to the end and on to LEVEL CLEAR; it samples every frame */
const FIGHT = `(src, id) => {
  const k = window.__k11;
  (0, eval)(src)(id);
  let a = k.arenaInfo(), frames = 0, tellFrames = 0, bangs = 0, steamLow = 1, hudPips = -1, hudSeen = false, fightHp = 99;
  const phasesSeen = [], movesSeen = {}, roundTells = {};
  while (frames < 40000 && a.state !== 'open') {
    a = k.arenaBot(1); frames++;
    const w = a.w10;
    if (a.state === 'fight') {
      fightHp = Math.min(fightHp, a.hp);
      if (phasesSeen.indexOf(w.phase) < 0) phasesSeen.push(w.phase);
      for (const h of w.haz) { movesSeen[h.kind] = (movesSeen[h.kind] || 0) + 1; if (h.st === 'tell') { tellFrames++; if (h.bang) bangs++; } }
      if (w.steam != null) steamLow = Math.min(steamLow, w.steam);
      if (a.hud.shown) { hudSeen = true; hudPips = a.hud.pips; }
    }
  }
  for (let n = 0; n < 3000 && !k.levelInfo().cleared; n++) k.arenaBot(1);
  return { a: k.arenaInfo(), frames, tellFrames, bangs, steamLow, hudPips, hudSeen, fightHp, phasesSeen, movesSeen, cleared: k.levelInfo().cleared };
}`;

type FightR = { a: Arena; frames: number; tellFrames: number; bangs: number; steamLow: number; hudPips: number; hudSeen: boolean; fightHp: number; phasesSeen: number[]; movesSeen: Record<string, number>; cleared: boolean };

test.describe("World 10 · the Grandmothers' Picnic (10-fort)", () => {
  test('10-fort declares the Grandmas\' arena on the open lawn and loads with no problems', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev & { levelProblems: () => string[] } }).__k11;
      k.playLevel('10-fort');
      const a = k.arenaInfo()!;
      return { problems: k.levelProblems(), kind: a.kind, gateL: (a as unknown as { gateL: number }).gateL, gateR: (a as unknown as { gateR: number }).gateR, phases: a.phases.length,
        arena: (window as unknown as Win).KinanLevels.get('10-fort').arena };
    });
    expect(r.problems).toEqual([]);
    expect(r).toMatchObject({ kind: 'grandmas', gateL: 196, gateR: 221, phases: 3, arena: { col: 197, cols: 24, boss: 'grandmas' } });
    expect(errors).toEqual([]);
  });

  test('the bot dodges until both Grandmas run out of steam: two solo phases, a checkpoint, the tag team, one shared meter, tells of 0.6 s or more, then ONE ENORMOUS HUG, food and LEVEL CLEAR', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(({ to, fight }) => (0, eval)(fight)(to, '10-fort'), { to: TO_ARENA, fight: FIGHT }) as FightR;
    const w = r.a.w10, log = r.a.log;
    console.log(`10-fort: ${r.frames} frames, moves ${JSON.stringify(r.movesSeen)}, got Kinan ${w.gotK}x, lowest hp ${r.fightHp}, deaths ${r.a.deaths}; ` +
      log.filter((e) => /^(got|dodge|steamout|phase|reset|start)$/.test(e.ev)).map((e) => `${e.f}:${e.ev}${e.atk ? ':' + e.atk : ''}`).join(' '));
    expect(r.a.kind).toBe('grandmas');
    expect(r.phasesSeen).toEqual([1, 2, 3]);
    for (const ph of r.a.phases) expect(ph.windup).toBeGreaterThanOrEqual(36);
    expect(Math.min(...w.tells)).toBeGreaterThanOrEqual(36);   /* every move's tell: 0.6 s or more */
    expect(r.tellFrames).toBeGreaterThan(0);
    expect(r.bangs).toBe(r.tellFrames);   /* every tell shows its "!" */
    for (const m of ['bubble', 'cane', 'pinch']) expect(r.movesSeen[m] || 0, m).toBeGreaterThan(0);
    /* the solo phases are one Grandma each, the third both at once */
    const wind = log.filter((e) => e.ev === 'windup');
    expect(new Set(wind.filter((e) => e.phase === 1).map((e) => e.who))).toEqual(new Set(['ed']));
    expect(new Set(wind.filter((e) => e.phase === 2).map((e) => e.who))).toEqual(new Set(['ol']));
    expect(new Set(wind.filter((e) => e.phase === 3).map((e) => e.who))).toEqual(new Set(['ed', 'ol']));
    expect(log.filter((e) => e.ev === 'steamout').map((e) => e.phase)).toEqual([1, 2, 3]);
    expect(log.some((e) => e.ev === 'checkpoint' && e.phase === 3)).toBe(true);
    /* one shared meter (not two health bars), and it runs all the way down */
    expect(r.hudSeen).toBe(true);
    expect(r.hudPips).toBe(1);
    expect(r.steamLow).toBeLessThan(0.1);
    /* nobody is hit: no 'hit' ever; Grandpa is never reached */
    expect(log.filter((e) => e.ev === 'hit')).toEqual([]);
    expect(w.gpHits).toBe(0);
    expect(r.a.deaths).toBe(0);
    /* the ending: one enormous hug, food, then the gates open and LEVEL CLEAR */
    expect(w.hug).toBe(true);
    expect(w.food).toBe(true);
    expect(log.some((e) => e.ev === 'hug')).toBe(true);
    const said = r.a.voiceLog.join(' ');
    for (const id of ['t_gm_ol_04', 't_gm_ed_05', 't_gm_ol_05', 't_w10_gp_02']) expect(said, id).toContain(id);
    expect(r.cleared).toBe(true);
    expect(errors).toEqual([]);
  });
});

test.describe("World 10 · Mom's Last Inspection (10-castle)", () => {
  test('10-castle is the party at the Falls: its own backdrop, the arena by the big table, story bubbles as text only', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const w = window as unknown as Win & { __k11: Dev & { levelProblems: () => string[] } };
      w.__k11.playLevel('10-castle');
      const d = w.KinanLevels.get('10-castle'), a = w.__k11.arenaInfo()!;
      return { problems: w.__k11.levelProblems(), look: (w.__k11.levelInfo() as unknown as { look: { theme: number; bg: string } }).look, kind: a.kind, phases: a.phases.length, who: [...new Set(d.talk.map((t) => t[1]))], fx: d.talk.filter((t) => t[4]).length };
    });
    expect(r.problems).toEqual([]);
    expect(r.look).toMatchObject({ theme: 210, bg: 'niaparty' });
    expect(r.kind).toBe('mom-final');
    expect(r.phases).toBe(3);
    for (const who of ['KINAN', 'MOM', 'DAD', 'CHENOA', 'SHAD', 'ANNIE']) expect(r.who, who).toContain(who);
    expect(r.fx, 'no wheeze-laugh in a castle level\'s bubbles (dad-lines.test.ts)').toBe(0);
    expect(errors).toEqual([]);
  });

  test('the bot does all three chores, each round trickier, then the ending: Mom is proud and joins the team, the joke-off, the cake, THE TURN, LEVEL CLEAR', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(({ to, fight }) => (0, eval)(fight)(to, '10-castle'), { to: TO_ARENA, fight: FIGHT }) as FightR;
    const w = r.a.w10, log = r.a.log;
    console.log(`10-castle: ${r.frames} frames, moves ${JSON.stringify(r.movesSeen)}, got Kinan ${w.gotK}x, drops ${w.drops}, lowest hp ${r.fightHp}, deaths ${r.a.deaths}; ` +
      log.filter((e) => /^(got|dodge|tidy|drop|roundwon|phase|reset|start|delivered|join|turn|tear|door|beat|endready)$/.test(e.ev)).map((e) => `${e.f}:${e.ev}${e.atk ? ':' + e.atk : ''}`).join(' '));
    expect(r.a.kind).toBe('mom-final');
    expect(r.phasesSeen).toEqual([1, 2, 3]);
    /* each round trickier: shorter tells, faster things, then two at once */
    const ph = r.a.phases;
    expect(ph[0].windup).toBeGreaterThan(ph[1].windup);
    expect(ph[1].windup).toBeGreaterThan(ph[2].windup);
    expect(ph[2].windup).toBeGreaterThanOrEqual(36);
    expect(ph[0].speed).toBeLessThan(ph[1].speed);
    expect(ph[1].speed).toBeLessThan(ph[2].speed);
    expect(ph[2].live).toBeGreaterThan(ph[1].live);
    expect(Math.min(...w.tells)).toBeGreaterThanOrEqual(36);
    expect(r.bangs).toBe(r.tellFrames);
    expect(log.filter((e) => e.ev === 'phase').length, 'the "getting smarter" banner after rounds 1 and 2').toBe(2);
    /* round 1: five things tidied into the bins of their colour */
    expect(log.filter((e) => e.ev === 'tidy').length).toBe(5);
    expect(w.items!.filter((i) => i.st === 'binned').every((i) => i.bin === i.kind)).toBe(true);
    /* round 2: eight laundry moves dodged: baskets, socks and the towel */
    expect(log.filter((e) => e.ev === 'dodge' && e.phase === 2).length).toBe(8);
    for (const m of ['basket', 'socks', 'towel']) expect(log.some((e) => e.ev === 'windup' && e.phase === 2 && e.atk === m), m).toBe(true);
    /* round 3: the cake picked up and delivered, over the bouncy castle, with balloons */
    expect(log.some((e) => e.ev === 'cakeup')).toBe(true);
    expect(log.some((e) => e.ev === 'delivered')).toBe(true);
    expect(log.some((e) => e.ev === 'windup' && e.phase === 3 && e.atk === 'balloon')).toBe(true);
    expect(w.bounces).toBeGreaterThan(0);
    /* nobody is hit, no game over */
    expect(log.filter((e) => e.ev === 'hit')).toEqual([]);
    expect(r.a.deaths).toBe(0);
    /* the ending: proud ("You're ready, my boy."), joins the team, the joke-off (Dad's wheeze-laugh), the cake, THE TURN */
    const said = r.a.voiceLog;
    for (const id of ['t_mf_08', 't_mf_09', 't_mf_10', 't_w10_gp_03', 't_w10_dad_02', 't_w10_gp_04', 't_w10_kinan_05', 't_mf_11', 't_w10_all_01', 't_w10_kinan_07', 't_w10_glitchy_01']) expect(said, id).toContain(id);
    expect(said.indexOf('t_mf_10')).toBeLessThan(said.indexOf('t_w10_gp_03'));   /* Mom joins, then the joke-off ... */
    expect(said.indexOf('t_mf_11')).toBeLessThan(said.indexOf('t_w10_all_01'));   /* ... before the cake ... */
    expect(said.indexOf('t_w10_all_01')).toBeLessThan(said.indexOf('t_w10_kinan_07'));   /* ... then THE TURN */
    expect(r.a.wheezes).toBeGreaterThanOrEqual(1);
    expect(w.joined).toBe(true);
    expect(log.some((e) => e.ev === 'join' && e.who === 'MOM')).toBe(true);
    expect(w.party && w.candles).toBe(true);
    for (const ev of ['turn', 'tear', 'door']) expect(log.some((e) => e.ev === ev), ev).toBe(true);
    expect(w.flow, 'the Falls flow UPWARD').toBeLessThan(0);
    expect(w.door).toBe(1);
    expect(r.cleared).toBe(true);
    expect(errors).toEqual([]);
  });

  test('a cake drop restarts only the cake round: no heart lost, the cake goes back on its stand, the chores already done stay done; after 5 drops Glitchy offers his help', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((src) => {
      const k = (window as unknown as Win).__k11;
      (0, eval)(src)('10-castle');
      let a = k.arenaInfo()!;
      for (let n = 0; n < 20000 && !(a.state === 'fight' && a.w10.phase === 3 && a.w10.brk === 0 && a.w10.cake === 'held'); n++) a = k.arenaBot(1);
      const before = { won: a.boss.max - a.boss.hp, cp: a.w10.cp, phase: a.w10.phase };
      /* walk him into the first rolling table from the side, cake in his hands */
      let hpAtDrop = [0, 0];
      const bump = (): Arena => {
        let b = k.arenaInfo()!;
        for (let n = 0; n < 200 && b.w10.cake !== 'held'; n++) { k.place(b.w10.stand! - 5, b.floorY - 18); k.step(1, {}); b = k.arenaInfo()!; }   /* pick the cake up */
        for (let n = 0; n < 120 && (b.w10.cake !== 'held' || (b as unknown as { inv: number }).inv > 0); n++) { k.step(1, {}); b = k.arenaInfo()!; }
        const t = b.w10.tables![0], hp0 = b.hp;
        k.place(t.x - 14, b.floorY - 18);
        for (let n = 0; n < 40 && k.arenaInfo()!.w10.cake === 'held'; n++) k.step(1, { right: true });
        hpAtDrop = [hp0, k.arenaInfo()!.hp];
        return k.arenaInfo()!;
      };
      const d1 = bump();
      const after = { won: d1.boss.max - d1.boss.hp, cp: d1.w10.cp, hp: hpAtDrop[1], hpBefore: hpAtDrop[0], phase: d1.w10.phase, state: d1.state, cake: d1.w10.cake, drops: d1.w10.drops, haz: d1.w10.haz.length };
      k.step(60, {});
      const back = k.arenaInfo()!.w10.cake;
      const resets = k.arenaInfo()!.log.filter((e) => e.ev === 'reset').length;
      const asked = (): boolean => !(document.getElementById('glitchyAsk') as HTMLElement).hidden;
      for (let i = 0; i < 16 && !asked() && k.arenaInfo()!.w10.drops! < 5; i++) { k.step(80, {}); k.arenaSetHp(3); bump(); }
      const ask = asked();
      (document.getElementById('glitchyYes') as HTMLElement).click();
      k.step(5, {});
      const fin = k.arenaInfo()!;
      return { before, after, back, resets, drops: fin.w10.drops, ask, helped: fin.helped, maxHp: fin.maxHp, log: fin.log.filter((e) => e.ev === 'drop').length };
    }, TO_ARENA) as { before: Record<string, number>; after: Record<string, unknown>; back: string; resets: number; drops: number; ask: boolean; helped: boolean; maxHp: number; log: number };
    console.log('10-castle cake drops: ' + JSON.stringify(r));
    expect(r.before).toMatchObject({ won: 2, cp: 3, phase: 3 });   /* tidy and laundry done */
    expect(r.after).toMatchObject({ won: 2, cp: 3, phase: 3, state: 'fight', cake: 'drop', drops: 1, haz: 0 });   /* still done; only the cake round goes again */
    expect(r.after.hp, 'a drop never costs a heart').toBe(r.after.hpBefore);
    expect(r.back, 'the cake comes back on its stand').toBe('stand');
    expect(r.resets, 'the fight itself never restarts').toBe(0);
    expect(r.drops, 'the offer comes with the 5th lost try (play waits for the answer)').toBe(5);
    expect(r.ask, 'after 5 drops Glitchy offers his help').toBe(true);
    expect(r.helped).toBe(true);
    expect(errors).toEqual([]);
  });

  test('no game over: the last heart in the laundry round puts Kinan back at the checkpoint and the fight starts again at that round', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((src) => {
      const k = (window as unknown as Win).__k11;
      (0, eval)(src)('10-castle');
      let a = k.arenaInfo()!;
      for (let n = 0; n < 20000 && !(a.state === 'fight' && a.w10.phase === 2 && a.w10.haz.some((h) => h.kind === 'basket' && h.st === 'go')); n++) a = k.arenaBot(1);
      k.arenaSetHp(1);
      const h = k.arenaInfo()!.w10.haz.find((x) => x.kind === 'basket')!;
      k.place(h.x - 5, a.floorY - 18);
      for (let n = 0; n < 200 && k.arenaInfo()!.state === 'fight'; n++) k.step(1, {});
      const lost = k.arenaInfo()!;
      a = lost;
      for (let n = 0; n < 2000 && a.state !== 'fight'; n++) a = k.arenaBot(1);
      return { lostState: lost.state, deaths: lost.deaths, phaseAfter: a.w10.phase, cp: a.w10.cp, tries: a.tries, hp: a.hp, maxHp: a.maxHp, log: a.log.filter((e) => /^(reset|start|checkpoint)$/.test(e.ev)).map((e) => e.ev + ':' + e.phase) };
    }, TO_ARENA) as { lostState: string; deaths: number; phaseAfter: number; cp: number; tries: number; hp: number; maxHp: number; log: string[] };
    console.log('10-castle no game over: ' + JSON.stringify(r));
    expect(r.lostState).toBe('wait');
    expect(r.deaths).toBe(1);
    expect(r.tries).toBe(2);
    expect(r.phaseAfter, 'back in the laundry round, not the first chore').toBe(2);
    expect(r.cp).toBe(2);
    expect(r.hp).toBe(r.maxHp);
    expect(r.log).toContain('checkpoint:2');
    expect(errors).toEqual([]);
  });
});

test.describe('World 10 · nobody is ever hit', () => {
  for (const lv of [{ id: '10-fort', kind: 'grandmas' }, { id: '10-castle', kind: 'mom-final' }]) {
    test(`${lv.id}: twenty kicks right next to ${lv.kind === 'grandmas' ? 'the Grandmas' : 'Mom'} never take anything off; only the fight's own goals move it on`, async ({ page }) => {
      test.setTimeout(120_000);
      const errors = watchErrors(page);
      await boot(page);
      const r = await page.evaluate(({ src, id }) => {
        const k = (window as unknown as Win).__k11;
        (0, eval)(src)(id);
        k.godMode();
        let a = k.arenaInfo()!;
        for (let n = 0; n < 3000 && a.state !== 'fight'; n++) a = k.arenaBot(1);
        const states: string[] = [];
        let kicks = 0;
        for (let n = 0; n < 20; n++) {
          const b = k.arenaInfo()!, w = b.w10;
          const body = w.grans ? (w.grans.ed.sit ? w.grans.ol : w.grans.ed) : { x: b.boss.x };
          k.place(body.x - 12, b.floorY - 18);
          k.step(1, { right: true }); k.step(1, { right: false });
          const k0 = k.kickInfo().kicks;
          for (let t = 0; t < 40 && k.kickInfo().kicks === k0; t++) k.step(1, { tapFire: true });
          k.step(16, {});
          kicks++;
          states.push(k.arenaInfo()!.boss.state);
        }
        a = k.arenaInfo()!;
        const log = a.log;
        const progress = log.filter((e) => e.ev === 'steamout' || e.ev === 'roundwon').length;
        return { kicks, kickNear: a.w10.kickNear, hits: log.filter((e) => e.ev === 'hit').length, hurt: states.filter((s) => s === 'hurt').length,
          hpDrop: a.boss.max - a.boss.hp, progress, gpHits: a.w10.gpHits || 0, kicknearLog: log.filter((e) => e.ev === 'kicknear').length };
      }, { src: TO_ARENA, id: lv.id }) as { kicks: number; kickNear: number; hits: number; hurt: number; hpDrop: number; progress: number; gpHits: number; kicknearLog: number };
      console.log(`${lv.id} kicks: ` + JSON.stringify(r));
      expect(r.kicks).toBe(20);
      expect(r.kickNear, 'the kicks did reach them').toBeGreaterThan(0);
      expect(r.hits, 'no hit, ever').toBe(0);
      expect(r.hurt).toBe(0);
      expect(r.hpDrop, 'the fight only moves on through its own goals (steam out, a chore done)').toBe(r.progress);
      expect(r.gpHits, 'Grandpa is never reached').toBe(0);
      expect(errors).toEqual([]);
    });
  }

  test('the Grandmas\' tag team is a checkpoint: the last heart there starts the fight again at the tag team', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((src) => {
      const k = (window as unknown as Win).__k11;
      (0, eval)(src)('10-fort');
      let a = k.arenaInfo()!;
      for (let n = 0; n < 20000 && !(a.state === 'fight' && a.w10.phase === 3 && a.w10.haz.some((h) => h.kind === 'pinch' && h.st === 'tell')); n++) a = k.arenaBot(1);
      k.arenaSetHp(1);
      const h = k.arenaInfo()!.w10.haz.find((x) => x.kind === 'pinch' && x.st === 'tell')!;
      for (let n = 0; n < 300 && k.arenaInfo()!.state === 'fight'; n++) { if (!(k.arenaInfo() as unknown as { dead: number }).dead) k.place(h.xs![0] - 5, a.floorY - 18); k.step(1, {}); }
      const lost = k.arenaInfo()!;
      a = lost;
      for (let n = 0; n < 2000 && a.state !== 'fight'; n++) a = k.arenaBot(1);
      return { lostState: lost.state, phaseAfter: a.w10.phase, steam: a.w10.steam, hud: a.hud.pips, grans: a.w10.grans };
    }, TO_ARENA) as { lostState: string; phaseAfter: number; steam: number; hud: number; grans: Record<string, { sit: boolean }> };
    expect(r.lostState).toBe('wait');
    expect(r.phaseAfter).toBe(3);
    expect(r.steam, 'the steam they already used stays used').toBeLessThan(0.45);
    expect(r.hud).toBe(1);
    expect(r.grans.ed.sit || r.grans.ol.sit, 'both Grandmas up for the tag team').toBe(false);
    expect(errors).toEqual([]);
  });

  test('both fights draw live (the Grandmas, Grandpa, the bubbles, cane and pinch circles; the toy box, bins, laundry, the cake, the party and THE TURN) without page errors', async ({ page }, info) => {
    test.setTimeout(180_000);
    const errors = watchErrors(page);
    await boot(page);
    const seen: string[] = [];
    for (const id of ['10-fort', '10-castle']) {
      await page.evaluate(({ src, lid }) => { (0, eval)(src)(lid); (window as unknown as Win).__k11.godMode(); }, { src: TO_ARENA, lid: id });
      for (let i = 0; i < 20; i++) {
        const s = await page.evaluate(() => { const a = (window as unknown as Win).__k11.arenaBot(450); return a.state + ':' + a.w10.phase + ':' + a.w10.haz.map((h) => h.kind).join('+') + (a.w10.turn ? ':turn' : ''); });
        seen.push(id + '=' + s);
        await page.waitForTimeout(200);   /* the real frame loop draws this moment */
        await page.screenshot({ path: info.outputPath(`w10-${id}-${String(i).padStart(2, '0')}.png`) });   /* a picture of each moment, kept in test-results */
      }
    }
    console.log('W10 drawn states: ' + seen.join(' · '));
    expect(errors).toEqual([]);
  });
});

/* ---- on the map ---- */
type MapS = { mounted: boolean; walking: boolean; crossing: boolean; busy: boolean; banner: string | null; notice: string | null; world: number | null; at: number; gate?: number | null;
  stops: { id: string | null; kind: string; built: boolean; state: string | null }[]; fly?: { world: number; riding: string | null; phase: string; home: string } | null };
type CutS = { on: boolean; mode: string | null; lines: string[]; belt?: { rank: number; catchup: boolean; line: string } };
type MapDev = Dev & { mapState: () => MapS; cut: () => CutS; cutSpeed: (n: number) => number; levelInfo: () => { id: string | null; cleared: boolean; returned: boolean };
  progress: () => { wmap: { w: number; at: number } | null; escapes: Record<string, number>; beltSeen: number } };
const mk = (page: Page) => ({
  map: (): Promise<MapS> => page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.mapState()),
  cut: (): Promise<CutS> => page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.cut())
});
async function settle(page: Page, timeout = 60_000): Promise<MapS> {
  await page.waitForFunction(() => { const k = (window as unknown as { __k11: MapDev }).__k11; const s = k.mapState(); return s.mounted && !s.walking && !s.crossing && !s.busy && !s.banner && !k.cut().on; }, null, { timeout });
  return mk(page).map();
}
async function seedSave(page: Page, make: string): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
  await page.evaluate(({ key, make }) => {
    const ids = (window as unknown as { KinanLevels: { list: () => string[] } }).KinanLevels.list();
    localStorage.setItem(key, JSON.stringify((0, eval)(make)(ids)));
  }, { key: CURRENT, make });
  await page.reload();
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
}
const BEAT_HERE = `() => {
  const k = window.__k11;
  k.clearFoes();
  const a0 = k.arenaInfo(); k.place(a0.cp.x - 6, a0.floorY - 18); k.step(20);
  let a = k.arenaInfo();
  for (let f = 0; f < 40000 && a.state !== 'open'; f++) a = k.arenaBot(1);
  for (let m = 0; m < 3000 && !k.levelInfo().cleared; m++) k.arenaBot(1);
  for (let m = 0; m < 1500 && !k.levelInfo().returned; m++) k.step(1, { right: true });
  return { level: k.levelInfo(), deaths: a.deaths, state: a.state, joined: a.w10.joined };
}`;
const SECRETS = (n: number): string => JSON.stringify(Array.from({ length: n }, (_, i) => `${i + 1}-secret`));
const ESCAPES = (n: number): string => JSON.stringify(Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, 1])));

test.describe('World 10 · on the map', () => {
  test('World 10 opens after the 9-castle: no "coming soon" sign, Kinan crosses into World 10, and its stops are 10-1 .. 10-8, 10-fort, 10-secret, 10-castle (10-4 is THE OBSERVATION TOWER)', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    await seedSave(page, `(ids) => ({ unlocked: 1, beaten: [], introSeen: true, beltSeen: 9, levelsBeaten: Object.fromEntries(ids.filter((id) => Number(id.split('-')[0]) <= 9).map((id) => [id, 1])), unlockedLevels: ${SECRETS(9)}, escapes: ${ESCAPES(9)}, wmap: { w: 9, at: 10 } })`);
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    expect(s0).toMatchObject({ world: 9, at: 10 });
    expect(s0.gate ?? null, 'no World 10 sign any more').toBeNull();
    await page.locator('#owNext').click();
    await expect.poll(async () => (await mk(page).map()).crossing).toBe(true);
    const s2 = await settle(page, 90_000);
    expect(s2.world).toBe(10);
    expect(s2.at).toBe(0);
    expect(s2.stops.map((q) => [q.id, q.kind, q.built])).toEqual([
      ['10-1', 'level', true], ['10-2', 'level', true], ['10-3', 'level', true], ['10-4', 'level', true], ['10-5', 'level', true],
      ['10-fort', 'fort', true], ['10-6', 'level', true], ['10-secret', 'secret', true], ['10-7', 'level', true], ['10-8', 'level', true],
      ['10-castle', 'boss', true]]);
    expect(s2.stops[0].state).toBe('open');
    const tower = await page.evaluate(() => (window as unknown as { KINAN: { W: { n: number; travel?: boolean; stops: { name: string }[] }[] } }).KINAN.W.find((w) => w.n === 10 && !w.travel)!.stops[3].name);
    expect(tower).toContain('THE OBSERVATION TOWER');
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.levelInfo().id)).toBe('10-1');
    expect(errors).toEqual([]);
  });

  test('the 10-castle: THE TURN in the level, then Glitchy runs into the console, Sabumnim\'s belt scene follows (World 10\'s line), and the way on opens: the world glitches and World 11\'s arrival lines follow the door in the mist', async ({ page }) => {
    test.setTimeout(360_000);
    const errors = watchErrors(page);
    await seedSave(page, `(ids) => ({ unlocked: 1, beaten: [], introSeen: true, beltSeen: 9, levelsBeaten: Object.fromEntries(ids.filter((id) => Number(id.split('-')[0]) <= 10 && id !== '10-castle').map((id) => [id, 1])), unlockedLevels: ${SECRETS(10)}, escapes: ${ESCAPES(9)}, wmap: { w: 10, at: 10 } })`);
    await page.locator('#startBtn').click({ force: true });
    const s0 = await settle(page);
    expect(s0).toMatchObject({ world: 10, at: 10 });
    expect(s0.stops[10]).toMatchObject({ id: '10-castle', kind: 'boss', built: true, state: 'open' });
    await page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.cutSpeed(3));
    await page.locator('#owPlay').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.levelInfo().id)).toBe('10-castle');
    const r = await page.evaluate(`(${BEAT_HERE})()`) as { level: { cleared: boolean; returned: boolean }; state: string; joined: boolean; deaths: number };
    expect(r.state).toBe('open');
    expect(r.joined, 'Mom joined the team').toBe(true);
    expect(r.level.cleared).toBe(true);
    expect(r.level.returned).toBe(true);
    await expect.poll(async () => (await mk(page).cut()).mode, { timeout: 15_000, intervals: [100] }).toBe('escape');
    const homes = new Set<string>();
    for (let i = 0; i < 400; i++) {
      const f = (await mk(page).map()).fly;
      if (!f) break;
      homes.add(f.home);
      await page.waitForTimeout(50);
    }
    expect([...homes]).toEqual(['10:10']);
    /* Sabumnim's belt scene follows the exit: World 10's line */
    await expect.poll(async () => (await mk(page).cut()).mode, { timeout: 30_000, intervals: [100] }).toBe('belt');
    const belt = await mk(page).cut();
    expect(belt.lines[0]).toBe('w10_glitchy_exit');
    for (const id of belt.lines) expect(['w10_glitchy_exit', 'w10_kinan_exit', 'w10_mom_exit', 'w10_robin_exit']).toContain(id);
    expect(belt.belt).toMatchObject({ rank: 10, catchup: false, line: 'belt_w10' });
    await expect.poll(async () => (await mk(page).cut()).on, { timeout: 40_000 }).toBe(false);
    const s2 = await settle(page);
    expect(s2).toMatchObject({ world: 10, at: 10 });
    expect(s2.stops[10].state).toBe('beaten');
    /* World 11 is released (OW_RELEASED 11, v54): no "coming soon" sign; the way on is open */
    expect(s2.notice).toBe('THE WAY ON TO THE NEXT WORLD IS OPEN!');
    expect(s2.gate ?? null, 'no World 11 sign').toBeNull();
    expect(await page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.progress())).toMatchObject({ escapes: { 10: 1 }, beltSeen: 10 });
    await page.locator('#owNext').click();
    await expect.poll(async () => (await mk(page).map()).banner).toBe('WAIT... DID THE WORLD JUST GLITCH?');
    expect(await settle(page, 90_000)).toMatchObject({ world: 11, at: 0 });
    expect((await page.evaluate(() => (window as unknown as { __k11: MapDev }).__k11.progress())).wmap).toEqual({ w: 11, at: 0 });
    /* World 11's arrival lines, in order, the first one following World 10's door in the mist */
    const q = await page.evaluate(() => (window as unknown as { __k11: MapDev & { storyInfo: () => { cur: string | null; queue: string[]; log: { id: string }[]; mapWorld: number } } }).__k11.storyInfo());
    expect(q.mapWorld).toBe(11);
    /* Story.log records a line as it starts, so the line playing now is in the log and in cur (measured on desktop
       Chromium: w11_in_kinan_01 in both): each line counted once, in order */
    expect([...new Set([...q.log.map((x) => x.id), q.cur, ...q.queue])].filter((id) => !!id && /^w11_in_/.test(id))).toEqual(['w11_in_kinan_01', 'w11_in_mom_01', 'w11_in_shad_01', 'w11_in_annie_01']);
    const door = await page.evaluate(() => (window as unknown as { KINAN_STORY: { lines: Record<string, [string, string]> } }).KINAN_STORY.lines.w11_in_kinan_01[1]);
    expect(door).toContain('The door in the mist');
    expect(errors).toEqual([]);
  });
});

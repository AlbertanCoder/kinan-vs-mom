import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* Builder-owned (outside the TE globs). Engine pass B1 — boss arenas in
   authored terrain (Contract §4.2; story bible "Game rules": every world ends
   in a boss, and bosses start out dumb and get smarter each time Kinan lands
   a hit). Every fight here is played through the real input state (the dev
   stepper and the boss bot set input.left / right / jump / jumpBuf, the same
   fields a keyboard or the touch pad feed) and read back through
   __k11.arenaInfo(). The bot only reads what a kid can see: the boss's pose,
   the floor marks, where a throw is headed, what is rolling at him. */

const BASE = 'http://127.0.0.1:4174/index.html';
const DEV_URL = `${BASE}?devtools=1`;
const CURRENT = 'kinan-remaster-v1';

type LogEv = { f: number; ev: string; phase: number; atk?: string; wind?: number; feint?: boolean; real?: boolean; aim?: number; pc?: number; vx?: number; hp?: number; tries?: number };
type Boss = { x: number; y: number; w: number; h: number; state: string; t: number; phase: number; hp: number; max: number; cur: string | null; face: number; inv: number; dir: number };
type Arena = {
  kind: string; name: string; state: string; gateL: number; gateR: number; c0: number; cols: number; floorY: number;
  phases: { pattern: string[]; windup: number }[]; cp: { x: number; tx: number; ty: number }; cpHit: boolean; helped: boolean; tries: number; glitchy: boolean;
  gates: { L: boolean; R: boolean }; boss: Boss; tell: string;
  shots: { kind: string; x: number; y: number; roll: boolean; tx: number | null }[]; marks: { x: number; y: number }[]; ring: { x: number } | null;
  minions: number; log: LogEv[]; line: string | null; lineQ: string[]; voiceLog: string[]; subtitle: string;
  hud: { shown: boolean; name: string; pips: number; live: number };
  camX: number; px: number; py: number; vx: number; vy: number; onGround: boolean; inv: number; dead: number; hp: number; maxHp: number; deaths: number; frame: number;
};
type Hold = { left?: boolean; right?: boolean; jump?: boolean; tapJump?: boolean; fire?: boolean };
type Dev = {
  playLevel: (id: string) => unknown;
  levelInfo: () => { id: string | null; cleared: boolean; toast: string; dialog: boolean; screen: boolean; goal: { tx: number } | null; checkpointHit: boolean; arena: { kind: string } | null };
  levels: () => { levels: { id: string; problems: string[]; lint: string[] }[] };
  godMode: () => void;
  clearFoes: () => void;
  place: (x: number, y: number) => unknown;
  step: (n: number, hold?: Hold) => unknown[];
  tile: (tx: number, ty: number) => number;
  auto: (n: number, opts?: { run?: boolean }) => { paused: boolean };
  arenaInfo: () => Arena | null;
  arenaBot: (n: number) => Arena;
  arenaSetHp: (n: number) => number;
  arenaLines: () => { id: string; who: string; text: string; seconds: number; clip: boolean }[];
  freeze: (on: boolean) => boolean;
};
type Win = { __k11: Dev; KinanLevels?: { ready: boolean } };

const ARENAS = [
  { id: '1-castle', kind: 'mom', phases: 3 },
  { id: '2-castle', kind: 'principal', phases: 3 },
  { id: '1-fort', kind: 'neighbour', phases: 2 },
  { id: '2-fort', kind: 'goalie', phases: 2 }
] as const;

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

/* in the page: load a level and stand Kinan just before the arena's checkpoint flag (foes cleared; in 2-fort
   the tile before the flag is the edge of a pit, so he stands on the flag's own tile) */
const TO_ARENA = `(id) => {
  const k = window.__k11;
  k.playLevel(id); k.clearFoes();
  const a = k.arenaInfo();
  k.place(a.cp.x - 6, a.floorY - 18); k.step(20);
  return k.arenaInfo();
}`;

test.describe('B1 · boss arenas load in authored terrain', () => {
  test('each arena loads: its boss, its phases, the boss door shut, the entry gate open, the checkpoint before it', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const out = await page.evaluate((list) => {
      const k = (window as unknown as Win).__k11;
      const reg = k.levels().levels;
      return list.map((lv) => {
        k.playLevel(lv.id);
        const a = k.arenaInfo()!, info = k.levelInfo();
        const rows = a.floorY / 16;
        const door: number[] = [], entry: number[] = [];
        for (let r = 0; r < rows; r++) { door.push(k.tile(a.gateR, r)); entry.push(k.tile(a.gateL, r)); }
        const r = reg.find((x) => x.id === lv.id)!;
        return { id: lv.id, a, info, door, entry, problems: r.problems, lint: r.lint };
      });
    }, ARENAS.map((x) => ({ id: x.id })));
    for (const [i, lv] of ARENAS.entries()) {
      const o = out[i];
      expect(o.problems, lv.id).toEqual([]);
      expect(o.lint, lv.id).toEqual([]);
      expect(o.a.kind, lv.id).toBe(lv.kind);
      expect(o.info.arena?.kind, lv.id).toBe(lv.kind);
      expect(o.a.state, lv.id).toBe('wait');
      expect(o.a.phases.length, lv.id).toBe(lv.phases);
      expect(o.a.boss.max, lv.id).toBe(lv.phases);              /* one stomp per phase */
      expect(o.a.cols, lv.id).toBe(24);                         /* the whole fight framed on one screen */
      expect(o.a.gates, lv.id).toEqual({ L: false, R: true });
      expect(o.door.every((t) => t === 5), `${lv.id} boss door is a full-height wall`).toBe(true);
      expect(o.entry.every((t) => t === 0), `${lv.id} entry gate open`).toBe(true);
      expect(o.a.cp.tx, lv.id).toBeLessThan(o.a.gateL);         /* the checkpoint stands just before the gate */
      expect(o.a.gateL - o.a.cp.tx, lv.id).toBeLessThanOrEqual(4);
      expect(o.info.goal!.tx, lv.id).toBeGreaterThan(o.a.gateR); /* the goal is past the boss door */
      expect(o.a.hud.shown, lv.id).toBe(false);
    }
    expect(errors).toEqual([]);
  });

  test('stepping in shuts the gate behind Kinan, the boss is named, the hp bar shows one pip per phase, the intro line is subtitled', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((src) => {
      const k = (window as unknown as Win).__k11;
      const before = (0, eval)(src)('1-castle') as Arena;
      let a = before;
      for (let n = 0; n < 200 && a.state === 'wait'; n++) a = k.arenaBot(1);
      const atStart = a;
      const s = k.step(6, { right: false });
      return { before, atStart, after: k.arenaInfo()!, moved: s.length, toast: k.levelInfo().toast, dialog: k.levelInfo().dialog };
    }, TO_ARENA);
    expect(r.before.cpHit).toBe(false);
    expect(r.atStart.cpHit).toBe(true);                          /* walked past the arena's flag on the way in */
    expect(r.atStart.state).toBe('fight');
    expect(r.atStart.gates).toEqual({ L: true, R: true });       /* locked edges */
    expect(r.atStart.boss.state).toBe('intro');
    expect(r.after.hud).toMatchObject({ shown: true, pips: 3, live: 3 });
    expect(r.after.hud.name).toContain('MOM, THE ROOM INSPECTOR');
    expect(r.toast).toContain('MOM, THE ROOM INSPECTOR');
    expect(r.toast).toContain('STOMP');
    expect(r.after.subtitle).toBe('MOM: Room inspection! Nobody leaves until every sock is sorted.');
    expect(r.after.voiceLog[0]).toBe('w01_mom_03');
    expect(r.dialog).toBe(false);                                /* no story box: play never stops */
    expect(errors).toEqual([]);
  });
});

/* ---- the fights: beaten through real input, smarter after every hit ---- */
type FightResult = { a: Arena; frames: number; hitsTaken: number; tellChecks: { rain: number; rainMarked: number; slam: number; slamRinged: number; windup: number; bang: number; open: number; stomp: number }; cleared: boolean };
const FIGHT = `(src, id) => {
  const k = window.__k11;
  (0, eval)(src)(id);
  let a = k.arenaInfo(), frames = 0, hitsTaken = 0, last = a.hp;
  const tc = { rain: 0, rainMarked: 0, slam: 0, slamRinged: 0, windup: 0, bang: 0, open: 0, stomp: 0 };
  while (frames < 12000 && a.state !== 'open') {
    a = k.arenaBot(1); frames++;
    if (a.hp < last) hitsTaken++;
    last = a.hp;
    const b = a.boss;
    if (b.state === 'windup') { tc.windup++; if (a.tell === '!') tc.bang++; }
    if (b.state === 'windup' && b.cur === 'rain') { tc.rain++; if (a.marks.length > 0) tc.rainMarked++; }
    if (b.state === 'windup' && b.cur === 'slam') { tc.slam++; if (a.ring) tc.slamRinged++; }
    if (b.state === 'tired' || b.state === 'dizzy') { tc.open++; if (a.tell === 'STOMP') tc.stomp++; }
  }
  for (let n = 0; n < 200 && !k.levelInfo().cleared; n++) k.arenaBot(1);
  return { a: k.arenaInfo(), frames, hitsTaken, tellChecks: tc, cleared: k.levelInfo().cleared };
}`;

/* the measured tell before each attack: frames from its (last) wind-up to the attack itself */
function tellsByPhase(log: LogEv[]): Map<number, number[]> {
  const out = new Map<number, number[]>();
  let wind: LogEv | null = null;
  for (const e of log) {
    if (e.ev === 'windup') wind = e;
    if (e.ev === 'attack' && wind) {
      const list = out.get(e.phase) ?? [];
      list.push(e.f - wind.f);
      out.set(e.phase, list);
      wind = null;
    }
  }
  return out;
}
const mean = (xs: number[]): number => xs.reduce((s, x) => s + x, 0) / xs.length;

test.describe('B1 · every boss is beaten by a fair scripted run, and gets smarter after each hit', () => {
  for (const lv of ARENAS) {
    test(`${lv.id} (${lv.kind}): a scripted run from the checkpoint beats it with the starting hearts — tells first, smarter every phase, then befriended and LEVEL CLEAR`, async ({ page }) => {
      test.setTimeout(150_000);
      const errors = watchErrors(page);
      await boot(page);
      const r = await page.evaluate(({ fight, src, id }) => (0, eval)(fight)(src, id), { fight: FIGHT, src: TO_ARENA, id: lv.id }) as FightResult;
      const a = r.a, log = a.log;
      const evs = (name: string) => log.filter((e) => e.ev === name);
      console.log(`${lv.id}: beaten in ${r.frames} frames, hits taken ${r.hitsTaken}, deaths ${a.deaths}, tells ${JSON.stringify(r.tellChecks)}`);
      /* beaten, fair: the bot never lost all its hearts */
      expect(a.state).toBe('open');
      expect(a.deaths).toBe(0);
      expect(a.boss.state).toBe('friend');
      expect(r.cleared).toBe(true);
      /* one phase per hit: hit -> phase (smarter) ... the last hit -> befriend */
      const hits = evs('hit');
      expect(hits.length).toBe(lv.phases);
      expect(evs('phase').map((e) => e.phase)).toEqual(Array.from({ length: lv.phases - 1 }, (_, i) => i + 2));
      for (let i = 0; i < hits.length - 1; i++) {
        const next = log[log.indexOf(hits[i]) + 1];
        expect(next.ev, 'a hit makes it smarter at once').toBe('phase');
        expect(next.phase).toBe(hits[i].phase + 1);
      }
      expect(log[log.indexOf(hits[hits.length - 1]) + 1].ev).toBe('befriend');
      /* the tells: every attack had a wind-up of 0.6 s or more, with the "!" drawn the whole time */
      const tells = tellsByPhase(log);
      const all = [...tells.values()].flat();
      expect(all.length).toBeGreaterThanOrEqual(lv.phases * 2);     /* every phase's pattern has at least two attacks */
      for (const t of all) expect(t).toBeGreaterThanOrEqual(36);
      expect(r.tellChecks.bang).toBe(r.tellChecks.windup);
      expect(r.tellChecks.stomp).toBe(r.tellChecks.open);           /* tired or dizzy always wears the STOMP arrow */
      expect(r.tellChecks.rainMarked).toBe(r.tellChecks.rain);      /* rain: the shadows are on the floor for the whole wind-up */
      expect(r.tellChecks.slamRinged).toBe(r.tellChecks.slam);      /* the slam: the red ring for the whole wind-up */
      /* smarter, measured: the tells get shorter every phase */
      for (let p = 2; p <= lv.phases; p++) expect(mean(tells.get(p)!), `phase ${p} tells shorter than phase ${p - 1}`).toBeLessThan(mean(tells.get(p - 1)!));
      /* smarter, behaviour: each phase brings an attack the phase before it did not have */
      const atkSet = (p: number) => new Set(evs('attack').filter((e) => e.phase === p).map((e) => e.atk));
      for (let p = 2; p <= lv.phases; p++) expect([...atkSet(p)].some((x) => !atkSet(p - 1).has(x)), `phase ${p} has a new attack`).toBe(true);
      /* phase 2 feints (and the real attack starts with a STOMP); phase 1 never does */
      expect(evs('feint').filter((e) => e.phase === 1)).toEqual([]);
      expect(evs('feint').filter((e) => e.phase >= 2).length).toBeGreaterThan(0);
      for (const f of evs('feint')) expect(log[log.indexOf(f) + 1].ev).toBe('stomp');
      /* the befriend moment: the boss's kind words were played */
      expect(a.voiceLog.length).toBeGreaterThan(1);
      expect(errors).toEqual([]);
    });
  }

  test("Mom's phase 3 aims where Kinan is GOING; in phase 1 she throws at where he IS", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((src) => {
      const k = (window as unknown as Win).__k11;
      (0, eval)(src)('1-castle');
      let a = k.arenaInfo()!;
      for (let n = 0; n < 9000 && !(a.boss.phase === 3 && a.boss.state === 'pace'); n++) a = k.arenaBot(1);
      /* phase 3 has just begun: Kinan goes to the left wall, then walks right while she winds up her first throw */
      k.godMode();
      k.place((a.gateL + 1) * 16 + 2, a.floorY - 16);
      const before = a.log.length;
      let tossed: LogEv | null = null;
      for (let n = 0; n < 400 && !tossed; n++) {
        k.step(1, { right: true, fire: false });
        const now = k.arenaInfo()!;
        tossed = now.log.slice(before).find((e) => e.ev === 'attack' && e.atk === 'toss') ?? null;
      }
      k.step(1, { right: false });
      return { p1: a.log.filter((e) => e.ev === 'attack' && e.atk === 'toss' && e.phase === 1), tossed };
    }, TO_ARENA);
    expect(r.p1.length).toBeGreaterThan(0);
    for (const e of r.p1) expect(Math.abs(e.aim! - e.pc!), 'phase 1: at where he is').toBeLessThanOrEqual(7);
    expect(r.tossed).not.toBeNull();
    expect(r.tossed!.phase).toBe(3);
    expect(r.tossed!.vx!).toBeGreaterThan(1);                       /* he was walking right */
    expect(r.tossed!.aim! - r.tossed!.pc!, 'phase 3: ahead of him').toBeGreaterThan(40);
    expect(errors).toEqual([]);
  });

  test('the tells are on the picture: a red "!" over Mom while she winds up, a gold STOMP arrow while she is tired', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await boot(page);
    /* by hue, not exact colour (the vignette shades the picture): 'red' = the "!" (#ff4a4a), 'gold' = the arrow (#f6c445) */
    const found = async (state: string, hue: 'red' | 'gold') => page.evaluate(async ({ src, state, hue }) => {
      const k = (window as unknown as Win).__k11;
      let a = k.arenaInfo();
      if (!a || a.state !== 'fight') a = (0, eval)(src)('1-castle') as Arena;
      for (let n = 0; n < 4000 && a!.boss.state !== state; n++) a = k.arenaBot(1);
      k.freeze(true);
      const cv = document.querySelector('#cv') as HTMLCanvasElement, cx = cv.getContext('2d')!;
      let hits = 0;
      for (let f = 0; f < 12; f++) {
        await new Promise((res) => requestAnimationFrame(() => res(null)));
        const b = k.arenaInfo()!, x0 = Math.round(b.boss.x - b.camX + b.boss.w / 2) - 10, y0 = Math.max(0, b.boss.y - 40);
        const img = cx.getImageData(x0, y0, 20, 40).data;
        for (let i = 0; i < img.length; i += 4) {
          const r = img[i], g = img[i + 1], bl = img[i + 2];
          const ok = hue === 'red' ? r > 170 && r - Math.max(g, bl) > 120 : r > 170 && g > 130 && bl < 120 && r - bl > 110 && Math.abs(r - g) < 70;
          if (ok) { hits++; break; }
        }
      }
      k.freeze(false);
      return hits;
    }, { src: TO_ARENA, state, hue });
    expect(await found('intro', 'red'), 'no "!" before she winds up (the check can fail)').toBe(0);
    expect(await found('windup', 'red'), 'the red "!"').toBeGreaterThan(0);
    expect(await found('tired', 'gold'), 'the gold STOMP arrow').toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });
});

/* ---- no game over, and the helper works in a boss fight ---- */
const LOSE = `(id) => {
  /* re-enter, drop to one heart, walk into the busy boss until the heart goes, then the respawn */
  const k = window.__k11;
  let a = k.arenaInfo(), n = 0;
  for (; n < 400 && a.state === 'wait'; n++) a = k.arenaBot(1);
  for (n = 0; n < 200 && !(a.boss.state === 'pace' || a.boss.state === 'windup'); n++) a = k.arenaBot(1);
  const d0 = a.deaths;
  k.arenaSetHp(1);
  for (n = 0; n < 600 && k.arenaInfo().deaths === d0; n++) {
    const b = k.arenaInfo();
    const toward = b.boss.x + b.boss.w / 2 > b.px + 5;
    k.step(1, { right: toward, left: !toward });
  }
  k.step(1, { right: false, left: false });
  return k.arenaInfo();
}`;

test.describe('B1 · no game over in a boss fight, and Glitchy helps after 5 lost fights', () => {
  for (const lv of ARENAS) {
    test(`${lv.id}: the last heart goes back to the checkpoint just before the arena; the fight starts fresh on re-entry`, async ({ page }) => {
      test.setTimeout(90_000);
      const errors = watchErrors(page);
      await boot(page);
      const r = await page.evaluate(({ src, lose, id }) => {
        const k = (window as unknown as Win).__k11;
        const a0 = (0, eval)(src)(id) as Arena;
        const lost = (0, eval)(lose)(id) as Arena;
        const info = k.levelInfo();
        let again = k.arenaInfo()!;
        for (let n = 0; n < 400 && again.state === 'wait'; n++) again = k.arenaBot(1);
        return { a0, lost, toast: info.toast, dialog: info.dialog, screen: info.screen, again };
      }, { src: TO_ARENA, lose: LOSE, id: lv.id });
      expect(r.lost.deaths).toBe(1);
      expect(Math.abs(r.lost.px - r.a0.cp.x), 'back at the arena checkpoint').toBeLessThanOrEqual(2);
      expect(r.lost.hp).toBe(r.lost.maxHp);                       /* full hearts */
      expect(r.lost.state).toBe('wait');                          /* the fight is reset ... */
      expect(r.lost.gates).toEqual({ L: false, R: true });        /* ... the entry gate open again, the door still shut */
      expect(r.lost.boss).toMatchObject({ phase: 1, hp: lv.phases, state: 'wait' });
      expect(r.lost.hud.shown).toBe(false);
      expect(r.toast).toContain('checkpoint');
      expect(r.dialog).toBe(false);                               /* no game-over box, no screen */
      expect(r.screen).toBe(false);
      expect(r.again.state).toBe('fight');                        /* walking back in starts it again */
      expect(r.again.tries).toBe(2);
      expect(errors).toEqual([]);
    });
  }

  test('5 lost fights: Glitchy offers boss help; "Yes" — an extra heart, and he bugs Mom (slower tells, longer naps); she is still beatable', async ({ page }) => {
    test.setTimeout(150_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(({ src, lose }) => {
      const k = (window as unknown as Win).__k11;
      (0, eval)(src)('1-castle');
      const seen: { deaths: number; offer: boolean }[] = [];
      for (let i = 0; i < 5; i++) {
        const a = (0, eval)(lose)('1-castle') as Arena;
        seen.push({ deaths: a.deaths, offer: !!(k.levelInfo() as unknown as { helperOffer: boolean }).helperOffer });
      }
      const frozen = k.step(30, { right: true }) as { x: number }[];
      return { seen, frozen: Math.abs(frozen[frozen.length - 1].x - frozen[0].x) };
    }, { src: TO_ARENA, lose: LOSE });
    expect(r.seen.map((s) => s.deaths)).toEqual([1, 2, 3, 4, 5]);
    expect(r.seen.slice(0, 4).every((s) => !s.offer)).toBe(true);
    expect(r.seen[4].offer).toBe(true);
    expect(r.frozen).toBe(0);                                      /* the question waits for an answer */
    await expect(page.locator('#glitchyAsk')).toBeVisible();
    await expect(page.locator('#glitchyAskTitle')).toContainText('boss');
    await expect(page.locator('#glitchyAskText')).toContainText('extra heart');
    await page.locator('#glitchyYes').click();
    await expect(page.locator('#glitchyAsk')).toBeHidden();
    const after = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      const help = k.arenaInfo()!;
      const toast = k.levelInfo().toast;
      let a = help;
      for (let n = 0; n < 400 && a.state === 'wait'; n++) a = k.arenaBot(1);
      const started = a;
      let frames = 0;
      while (frames < 12000 && a.state !== 'open') { a = k.arenaBot(1); frames++; }
      return { help, toast, started, end: a };
    });
    expect(after.help.helped).toBe(true);
    expect(after.help.maxHp).toBe(4);                              /* the extra heart */
    expect(after.help.hp).toBe(4);
    expect(after.toast).toContain('GLITCHY');
    expect(after.started.state).toBe('fight');
    expect(after.started.glitchy).toBe(true);                      /* he flies with the fight */
    const winds = after.end.log.filter((e) => e.ev === 'windup' && e.phase === 1 && e.f > after.started.frame - 5 && !e.real);
    expect(winds.length).toBeGreaterThan(0);
    for (const w of winds) expect(w.wind!).toBeGreaterThan(after.end.phases[0].windup);   /* slower tells than without help */
    expect(after.end.state).toBe('open');                          /* and Kinan wins */
    expect(errors).toEqual([]);
  });
});

/* ---- voices and every level ---- */
test.describe('B1 · boss voices and the 22 World 1-2 level files', () => {
  test('every recorded boss line is in audio/voice/ (served as audio), and each boss names only lines that exist', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(async () => {
      const k = (window as unknown as Win).__k11 as Dev & { arenaKinds: () => { kind: string; lines: Record<string, unknown> }[] };
      const lines = k.arenaLines();
      const files: { id: string; status: number; type: string | null }[] = [];
      for (const l of lines.filter((x) => x.clip)) {
        const res = await fetch(`audio/voice/${l.id}.mp3`);
        files.push({ id: l.id, status: res.status, type: res.headers.get('content-type') });
      }
      const ids = new Set(lines.map((l) => l.id));
      const named: string[] = [];
      for (const kd of k.arenaKinds()) {
        const L = kd.lines as { intro: string[]; retry: string[]; phase: (string | null)[]; first: Record<string, string>; defeat: string[] };
        named.push(...L.intro, ...L.retry, ...L.phase.filter((x): x is string => !!x), ...Object.values(L.first), ...L.defeat);
      }
      return { n: lines.length, files, missing: named.filter((id) => !ids.has(id)) };
    });
    expect(r.files.length).toBe(55);   /* B1's 23 + B2's 32 (Worlds 3-5; V3 removed Chenoa's "Bounce it back!", QA 2026-10-28); every one is fetched below */
    for (const f of r.files) { expect(f.status, f.id).toBe(200); expect(f.type, f.id).toContain('audio/mpeg'); }
    expect(r.missing).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('all 22 World 1 and World 2 level files reach LEVEL CLEAR with auto(30, {run: true}) — the four with a boss fight it out', async ({ page }) => {
    test.setTimeout(300_000);
    const errors = watchErrors(page);
    await boot(page);
    const ids = ['1-1', '1-2', '1-3', '1-4', '1-5', '1-fort', '1-6', '1-7', '1-secret', '1-8', '1-castle',
      '2-1', '2-2', '2-3', '2-4', '2-5', '2-fort', '2-6', '2-7', '2-secret', '2-8', '2-castle'];
    const out = await page.evaluate((list) => {
      const k = (window as unknown as Win).__k11;
      return list.map((id) => {
        k.playLevel(id); k.godMode(); k.clearFoes();
        let n = 0;
        for (; n < 400 && !k.levelInfo().cleared; n++) k.auto(30, { run: true });
        const a = k.arenaInfo();
        return { id, cleared: k.levelInfo().cleared, n, boss: a ? a.state : null };
      });
    }, ids);
    console.log('B1 auto(30,{run:true}) clears: ' + out.map((o) => `${o.id} n=${o.n}${o.boss ? ' boss=' + o.boss : ''}`).join(' · '));
    for (const lv of out) expect(lv.cleared, `${lv.id} (${lv.n} x auto(30))`).toBe(true);
    for (const lv of out.filter((o) => o.boss)) expect(lv.boss, lv.id).toBe('open');   /* the boss was befriended on the way */
    expect(out.filter((o) => o.boss).map((o) => o.id)).toEqual(['1-fort', '1-castle', '2-fort', '2-castle']);
    expect(errors).toEqual([]);
  });
});


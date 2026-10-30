import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* THE GLITCH HUNT (Shad, 2026-10-29: "the only glitch that should be in the game is Glitchy").
   A regression sweep over Worlds 1-8 with the game's own dev hooks:
   - every candle can be reached: no candle sealed in a pocket of solid tiles with no way in (a breakable brick or a
     kickable board counts as a way in; plain ground, gift blocks and springs do not);
   - every level, a bot run with every foe watched frame by frame (__k11.foeScan): never inside solid tiles, never
     turning back and forth on the spot, never standing on nothing, never below the level while alive, never gone
     while alive;
   - every boss (each world's fort and castle), three bot fights: the boss stays in its arena and out of the walls and
     floor, never NaN, never frozen, every attack after a "!" wind-up of at least 0.6 s, every phase reached and the
     fight won;
   - no page errors. */
const DEV_URL = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html?devtools=1`;
const SLOTS = ['1', '2', '3', '4', '5', 'fort', '6', '7', 'secret', '8', 'castle'];
const TELL_MIN = 36;   /* 0.6 s at 60 frames a second */

type Win = Window & { __k11: Record<string, (...a: any[]) => any>; KinanLevels: { ready: boolean; get: (id: string) => any; list: () => string[] } };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function boot(page: Page): Promise<void> {
  /* the bot plays plain Kinan, as when this hunt was written: since fixes run 2 a rescued pet follows by itself (Ginger from
     1-1 jumps higher, the bot overshoots, dies 5 times and Glitchy's offer freezes the next level), so rescues stay home */
  await page.addInitScript(() => {
    if (sessionStorage.getItem('gh-seeded')) return;
    sessionStorage.setItem('gh-seeded', '1');
    localStorage.setItem('kinan-remaster-v1', JSON.stringify({ pets: { ids: [], names: {}, soloCat: true, soloDog: true } }));
  });
  await page.goto(DEV_URL);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
}

/* ---- in the page: the candle check ---- */
function sealedCandles(ids: string[]): { id: string; sealed: [number, number][]; total: number }[] {
  const w = window as unknown as Win, k = w.__k11, K = w.KinanLevels;
  const out: { id: string; sealed: [number, number][]; total: number }[] = [];
  for (const id of ids) {
    if (!K.get(id)) continue;
    k.playLevel(id);
    const info = k.levelInfo(), cols = info.w, ROWS = 15;
    const def = K.get(id), list = Array.isArray(def.areas) ? def.areas : [def];
    /* a cell Kinan can be in, or open: not solid; a brick (2) breaks, a board or a gate (5) opens, but a steel pipe riser
       (also a 5, since 2026-10-29) never does */
    const pipe = new Set<number>(info.pipeCells || []);
    const open = (x: number, y: number) => { if (x < 0 || x >= cols || y >= ROWS) return false; if (y < 0) return true; const t = k.tile(x, y); return !(t >= 1 && t <= 6) || t === 2 || (t === 5 && !pipe.has(y * cols + x)); };
    const seen = new Uint8Array(cols * (ROWS + 1));
    const at = (x: number, y: number) => (y + 1) * cols + x;
    const q: [number, number][] = [[info.start.col, info.start.row]];
    seen[at(info.start.col, info.start.row)] = 1;
    while (q.length) {
      const [x, y] = q.pop()!;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= cols || ny < -1 || ny >= ROWS || seen[at(nx, ny)] || !open(nx, ny)) continue;
        seen[at(nx, ny)] = 1; q.push([nx, ny]);
      }
    }
    const sealed: [number, number][] = [];
    let base = 0, total = 0;
    for (const a of list) {
      for (const [cx, cy] of a.candles || []) {
        total++;
        const x = base + cx;
        /* a candle in an open cell must be reached; a candle in a block's cell counts when a reached cell touches it */
        const ok = open(x, cy) ? !!seen[at(x, cy)] : [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => x + dx >= 0 && x + dx < cols && cy + dy >= -1 && cy + dy < ROWS && !!seen[at(x + dx, cy + dy)]);
        if (!ok) sealed.push([x, cy]);
      }
      base += a.cols;
    }
    out.push({ id, sealed, total });
  }
  return out;
}

/* ---- in the page: one level's bot run, or one boss fight, with every foe (and the boss) watched ---- */
type RunOpts = { id: string; fight: number; frames: number; tellMin: number };
type RunOut = { id: string; frames: number; cleared: boolean; bossDone: boolean | null; phases: number[]; fails: string[]; foeTypes: string[]; watched: number };
function watchRun(o: RunOpts): RunOut {
  const w = window as unknown as Win, k = w.__k11, T = 16;
  const fails: string[] = [], failSet = new Set<string>();
  const fail = (s: string) => { if (!failSet.has(s) && fails.length < 40) { failSet.add(s); fails.push(s); } };
  const fin = (...v: number[]) => v.every((n) => typeof n === 'number' && Number.isFinite(n));
  k.playLevel(o.id); k.godMode();
  const boss = o.fight >= 0;
  if (boss) {
    k.clearFoes();
    const a0 = k.arenaInfo();
    if (!a0) return { id: o.id, frames: 0, cleared: false, bossDone: null, phases: [], fails: ['no arena in ' + o.id], foeTypes: [], watched: 0 };
    k.place(a0.cp.x - 6, a0.floorY - 18); k.step(20 + o.fight * 41, { right: false });   /* a different start each fight (the boss's clock runs on) */
  }
  type Rec = { s: number; t: number; flips: number[]; solidN: number; floatN: number; lastY: number; y: number; alive: boolean; arena: boolean; type: string };
  let recs = new Map<object, Rec>();
  let gen = '', lastPx = -1e9, stuckT = 0, n = 0, frame0 = 0;
  const foeTypes = new Set<string>();
  /* the boss watch */
  const seenLog = new Set<object>();
  let lastWind = -1e9, lastKey = '', sameN = 0, hpT = 0, lastHp = -1, fighting = false, idle = 0, introDone = false;
  const phases: number[] = [];
  let watched = 0;
  for (; n < o.frames; n++) {
    let a = null;
    if (boss) {
      /* each fight differs: once the boss's intro is over Kinan stands still and lets it come at him (none, 2 s, 4 s;
         god mode keeps him safe), then the bot plays: the boss aims at where he is, so the fight runs differently */
      if (introDone && idle < o.fight * 120) { idle++; k.step(1, { left: false, right: false, jump: false }); a = k.arenaInfo(); } else a = k.arenaBot(1);
      if (a && a.state === 'open') break;
    }
    else {
      k.auto(1, { run: true });
      if (k.levelInfo().cleared) break;
    }
    const s = k.foeScan();
    const g = s.id + ':' + s.deaths;
    if (g !== gen) { gen = g; recs = new Map(); frame0 = s.frame; }   /* a new life: start watching afresh */
    /* the bot is stuck somewhere: carry Kinan on to the next stretch of ground (the foes there still get watched) */
    if (!boss) {
      if (s.px > lastPx + 16) { lastPx = s.px; stuckT = 0; } else if (++stuckT > 360) {
        stuckT = 0;
        for (let c = Math.floor(s.px / T) + 6; c < s.cols; c++) {
          let r = -1;
          for (let y = 1; y < 15; y++) { const t = k.tile(c, y); if (t >= 1 && t <= 7 && !k.tile(c, y - 1) && !(y > 1 && k.tile(c, y - 2) >= 1 && k.tile(c, y - 2) <= 6)) { r = y; break; } }
          if (r > 0) { k.place(c * T + 3, r * T - 18); lastPx = c * T; break; }
        }
      }
    }
    const now = new Set<object>();
    for (const f of s.foes) {
      now.add(f.o);
      let r = recs.get(f.o);
      if (!r) { r = { s: Math.sign(f.vx), t: f.t, flips: [], solidN: 0, floatN: 0, lastY: f.y, y: f.y, alive: f.alive, arena: f.arena, type: f.type }; recs.set(f.o, r); }
      r.alive = f.alive; r.y = f.y;
      if (!f.alive) continue;
      foeTypes.add(f.type);
      const cx = Math.floor((f.x + f.w / 2) / T), cy = Math.floor((f.y + f.h / 2) / T);
      /* the tiles round it (2 = brick, 3 = gift, 5 = board, 7 = shelf, 10-13 = slopes), for the report */
      const map = () => [-2, -1, 0, 1, 2].map((dy) => [-3, -2, -1, 0, 1, 2, 3].map((dx) => { const t = k.tile(cx + dx, cy + dy) | 0; return (t < 10 ? ' ' : '') + t; }).join(' ')).join(' / ');
      const at = `${o.id} ${f.type} near c${cx} r${cy}`;
      if (!fin(f.x, f.y, f.vx, f.vy)) { fail(`${o.id} ${f.type}: position is not a number (x=${f.x}, y=${f.y})`); continue; }
      if (f.y > s.H + 40) fail(`${at}: fell below the level and was never removed (y=${Math.round(f.y)})`);
      const moved = f.t !== r.t; r.t = f.t;   /* the game moved this foe this frame (not paused, not too far from Kinan) */
      if (!moved) continue;
      if (!f.near || f.dizzy > 0 || f.stun > 0 || f.hidden) { r.s = Math.sign(f.vx); r.lastY = f.y; r.flips = []; continue; }
      watched++;
      /* inside solid tiles (flyers float over the scenery by design; one stuck in a wall for 4 s is still a glitch) */
      if (f.inSolid) { r.solidN++; if (r.solidN === (f.beh === 'flyer' ? 240 : 20)) fail(`${at}: stuck inside solid tiles [${f.beh} tiles: ${map()}]`); } else r.solidN = 0;
      /* turning back and forth on the spot: 8 turns inside half a second */
      const sg = Math.sign(f.vx);
      if (sg !== 0 && r.s !== 0 && sg !== r.s) { r.flips.push(s.frame); r.flips = r.flips.filter((t) => s.frame - t < 30); if (r.flips.length >= 8) fail(`${at}: jitters back and forth on the spot (8 turns in 0.5 s) [${f.beh} x=${f.x.toFixed(1)} y=${f.y.toFixed(1)} ground=${f.onGround} tiles: ${map()}]`); }
      if (sg !== 0) r.s = sg;
      /* standing on nothing: not a flyer, not on the ground and not falling for half a second */
      if (f.beh !== 'flyer' && !f.flee && !f.onGround && Math.abs(f.y - r.lastY) < 0.01) { if (++r.floatN === 30) fail(`${at}: stands still in the air (walked off into nothing without falling) [${f.beh} y=${f.y.toFixed(1)} vy=${f.vy} tiles: ${map()}]`); } else r.floatN = 0;
      r.lastY = f.y;
    }
    /* gone while alive (a boss's helpers come and go with the fight; a new life rebuilds the list; one that fell out of
       the bottom or flew off the top is removed on purpose) */
    if (s.frame > frame0) for (const [obj, r] of recs) if (!now.has(obj)) { if (r.alive && !r.arena && r.y <= s.H && r.y >= -20) fail(`${o.id} ${r.type}: vanished while still alive (last at y=${Math.round(r.y)})`); recs.delete(obj); }
    if (boss && a) {
      const b = a.boss;
      if (a.state !== 'fight') continue;
      if (!fighting) { fighting = true; lastHp = b.hp; hpT = 0; phases.push(b.phase); }
      if (b.state !== 'intro') introDone = true;
      if (!fin(b.x, b.y, b.w, b.h)) { fail(`${o.id} boss: position is not a number (x=${b.x}, y=${b.y})`); continue; }
      const lo = (a.gateL + 1) * T, hi = a.gateR * T;
      if (b.state !== 'friend' && (b.x < lo - 2 || b.x + b.w > hi + 2)) fail(`${o.id} boss (${a.kind}) left its arena in "${b.state}" (x ${b.x}..${b.x + b.w}, arena ${lo}..${hi})`);
      if (b.y + b.h > a.floorY + 3) fail(`${o.id} boss (${a.kind}) sank into the floor in "${b.state}" (feet ${b.y + b.h}, floor ${a.floorY})`);
      for (let ty = Math.floor((b.y + 3) / T); ty <= Math.floor((b.y + b.h - 4) / T); ty++) {
        for (let tx = Math.floor((b.x + 3) / T); tx <= Math.floor((b.x + b.w - 4) / T); tx++) {
          const t = k.tile(tx, ty);
          if (t >= 1 && t <= 6) fail(`${o.id} boss (${a.kind}) inside a wall/floor tile in "${b.state}" (c${tx} r${ty})`);
        }
      }
      const key = `${b.x}|${b.y}|${b.state}|${b.phase}|${b.hp}`;
      if (key === lastKey) { if (++sameN === 300) fail(`${o.id} boss (${a.kind}) froze for 5 s in "${b.state}"`); } else { sameN = 0; lastKey = key; }
      if (b.hp !== lastHp) { lastHp = b.hp; hpT = 0; if (!phases.includes(b.phase)) phases.push(b.phase); } else if (++hpT === 7200) fail(`${o.id} boss (${a.kind}) stuck: no hit and no new phase for 2 minutes of bot play (state "${b.state}", phase ${b.phase})`);
      for (const e of a.log) {
        if (seenLog.has(e)) continue;
        seenLog.add(e);
        if (e.ev === 'windup') { lastWind = e.f; if (e.wind < o.tellMin) fail(`${o.id} boss (${a.kind}) "${e.atk}" wind-up only ${e.wind} frames`); }
        else if (e.ev === 'feint' || e.ev === 'reset' || e.ev === 'start') lastWind = -1e9;
        else if (e.ev === 'attack') { if (e.f - lastWind < o.tellMin) fail(`${o.id} boss (${a.kind}) "${e.atk}" attacked ${e.f - lastWind < 1e6 ? (e.f - lastWind) + ' frames after' : 'without'} its "!" tell`); lastWind = -1e9; }
      }
    }
  }
  const a = boss ? k.arenaInfo() : null;
  return { id: o.id, frames: n, cleared: !!k.levelInfo().cleared, bossDone: boss ? !!(a && a.state === 'open') : null, phases, fails, foeTypes: [...foeTypes], watched };
}

test.describe('The glitch hunt · Worlds 1-8', () => {
  test.skip(({ browserName, isMobile }) => browserName !== 'chromium' || !!isMobile, 'one sweep, on desktop Chromium');

  test('every candle in Worlds 1-10 can be reached: none sealed in a pocket with no way in', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap((wn) => SLOTS.map((s) => `${wn}-${s}`));
    const out = await page.evaluate(sealedCandles, ids);
    console.log(`candles checked in ${out.length} levels: ${out.reduce((n, l) => n + l.total, 0)}`);
    expect(out.length).toBe(110);   /* Worlds 9 and 10 joined the check in v53 (a 9-castle candle sat inside its steps) */
    expect(out.filter((l) => l.sealed.length).map((l) => `${l.id}: ${l.sealed.map(([c, r]) => `c${c} r${r}`).join(', ')}`)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('1-5: the three candles under the deck — in through the hole, all three collected, back out on the spring', async ({ page }) => {
    const errors = watchErrors(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    await boot(page);
    /* a picture for Shad: the planks and the hole in the deck, the spring below, the candles in the tunnel */
    await page.evaluate(() => { const k = (window as unknown as Win).__k11; k.playLevel('1-5'); k.clearFoes(); k.godMode(); k.place(62 * 16, 9 * 16 - 18); k.step(30, { left: false, right: false }); k.freeze(true); });
    await page.waitForTimeout(300);
    await page.screenshot({ path: fileURLToPath(new URL('../../kick-shots/1-5-tunnel.png', import.meta.url)) });
    await page.evaluate(() => (window as unknown as Win).__k11.freeze(false));
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11, T = 16;
      k.playLevel('1-5'); k.godMode(); k.clearFoes();
      const got0 = k.levelInfo().candlesGot;
      k.place(70 * T + 3, 8 * T - 18);   /* on the deck, over the hole (c70) */
      let s = k.step(70, { left: true, right: false });   /* drop in, steering left past the spring, along the tunnel */
      const inTunnel = s[s.length - 1];
      const got1 = k.levelInfo().candlesGot;
      s = k.step(70, { left: false, right: true });   /* back right onto the spring: up and out through the hole */
      s = s.concat(k.step(150, { left: false, right: false }));   /* and down again */
      const top = Math.min(...s.map((p: { y: number }) => p.y)), end = s[s.length - 1];
      return { got: got1 - got0, inTunnel: { y: inTunnel.y, onGround: inTunnel.onGround }, top, end: { x: end.x, y: end.y, onGround: end.onGround } };
    });
    expect(r.inTunnel).toEqual({ y: 12 * 16 - 16, onGround: true });   /* standing on the tunnel floor */
    expect(r.got).toBe(3);
    expect(r.top).toBeLessThan(8 * 16 - 16);   /* the spring threw him above the deck */
    expect(r.end.onGround).toBe(true);
    /* out: not back inside the tunnel (columns 64-71, under the deck at row 8) */
    expect(r.end.x + 10 > 64 * 16 && r.end.x < 72 * 16 && r.end.y > 8 * 16, `ended at x=${r.end.x} y=${r.end.y}`).toBe(false);
    expect(errors).toEqual([]);
  });

  test('every pipe in Worlds 1-9 is a solid steel riser Kinan stands on: both cells solid, none buried in the ground', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await boot(page);
    /* Shad 2026-10-29: "you can't even stand on them". A pipe whose cells were already ground draws over the dirt and holds
       nothing (1-5's c63 riser sat inside the slope top until the v52 review); a level whose pipes are only markers says
       pipesSolid: false (3-6) */
    const r = await page.evaluate((ids: string[]) => {
      const w = window as unknown as Win, k = w.__k11, K = w.KinanLevels, bad: string[] = [];
      let pipes = 0;
      for (const id of ids) {
        if (!K.get(id)) continue;
        k.playLevel(id);
        const info = k.levelInfo();
        if (!info.pipesSolid) continue;
        const cells = new Set<number>(info.pipeCells);
        for (const [c, row] of info.pipes) {
          pipes++;
          for (const y of [row - 1, row]) if (!cells.has(y * info.w + c) || k.tile(c, y) !== 5) bad.push(`${id} pipe c${c} r${row}: cell r${y} is not a riser`);
        }
      }
      /* and Kinan stands on one: dropped onto 1-5's riser by the checkpoint (c108, rows 10-11), he lands on its top */
      const T = 16;
      k.playLevel('1-5'); k.godMode(); k.clearFoes();
      k.place(108 * T + 2, 7 * T);
      const s = k.step(60, { left: false, right: false }), end = s[s.length - 1];
      return { bad, pipes, end: { y: end.y, onGround: end.onGround } };
    }, [1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap((wn) => SLOTS.map((sl) => `${wn}-${sl}`)));
    console.log(`solid pipes checked: ${r.pipes}`);
    expect(r.pipes).toBeGreaterThan(0);
    expect(r.bad).toEqual([]);
    expect(r.end).toEqual({ y: 10 * 16 - 16, onGround: true });   /* on the riser's top (row 10), not the ground (row 12) */
    expect(errors).toEqual([]);
  });
  for (const wn of [1, 2, 3, 4, 5, 6, 7, 8]) {
    test(`World ${wn}: every level's foes behave on a bot run; the fort and castle bosses, three fights each`, async ({ page }) => {
      test.setTimeout(600_000);
      const errors = watchErrors(page);
      await boot(page);
      const levels = SLOTS.filter((s) => s !== 'fort' && s !== 'castle').map((s) => `${wn}-${s}`);
      const fails: string[] = [], lines: string[] = [];
      for (const id of levels) {
        const r = await page.evaluate(watchRun, { id, fight: -1, frames: 5400, tellMin: TELL_MIN });
        lines.push(`${id}: ${r.frames} frames${r.cleared ? ' CLEAR' : ''}, foes ${r.foeTypes.join('/') || '-'} (${r.watched} foe-frames)`);
        fails.push(...r.fails);
      }
      for (const id of [`${wn}-fort`, `${wn}-castle`]) {
        for (let fight = 0; fight < 3; fight++) {
          const r = await page.evaluate(watchRun, { id, fight, frames: 24000, tellMin: TELL_MIN });
          lines.push(`${id} fight ${fight + 1}: ${r.frames} frames, phases ${r.phases.join('>')}, ${r.bossDone ? 'WON' : 'NOT WON'}`);
          fails.push(...r.fails);
          if (!r.bossDone) fails.push(`${id} fight ${fight + 1}: the bot never won (phases reached ${r.phases.join('>') || 'none'})`);
        }
      }
      console.log(`World ${wn} glitch hunt:\n  ` + lines.join('\n  '));
      expect(fails).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
});

#!/usr/bin/env node
/*
 * SEASON 2 SWEEP (2026-11-11, play-tester A). A robot with real inputs (the game's own input flags: left, right, jump,
 * kick, down) plays every Season 2 level (Worlds 12-15: 44 levels, the forts, secrets and castles too) from its start,
 * and writes what happened, level by level, so "the robot clears all 44" is a file and not a sentence.
 *
 *   node tools/s2-sweep.mjs                    play all 44 levels, write app/audit/season2-ready/sweep.json
 *   node tools/s2-sweep.mjs --levels 12-1,13-4 only these levels, to app/audit/season2-ready/sweep-partial.json
 *                                              (a quick look; never the saved proof)
 *   node tools/s2-sweep.mjs --shots <dir>      also save a screenshot at every stuck spot (default: none)
 *   node tools/s2-sweep.mjs --resume           the whole sweep, carried on from app/audit/season2-ready/sweep-progress.json
 *                                              (written after every level) when the code is the same; a run stopped by the
 *                                              laptop-heat rule picks up at the next level. Same levels, seeds and pass rule
 *   node tools/s2-sweep.mjs --verify           no browser: check sweep.json is bound to the current code (sha256 of
 *                                              index.html, sw.js, every file under levels/ and map/, and this file):
 *                                              STALE = exit 2. Then exit 0 only if every one of the 44 levels was
 *                                              cleared WITHOUT god mode, with 0 page errors and 0 s2audit problems.
 *
 * Per level it records: cleared (and whether only god mode got there), frames, deaths (back to a checkpoint), hearts
 * lost, hazard falls, stuck spots (no progress for STUCK_FRAMES, with x,y and the tile), page errors and console
 * errors, candles collected vs total, __k11.s2audit() (unreachable candles / gifts / golden candle, foes in walls,
 * ladders to nowhere, an unreachable goal) taken at the spawn, Glitchy's help offers (5 falls in one spot), and the
 * pets' frames inside a wall / floating / in a hazard (the measures of tools/pet-probe.mjs).
 *
 * How it works: it starts tools/preview-server.mjs on port 4183, opens index.html?devtools=1 in headless (Season 2 is part
 * of the main game since 2026-11-12: no ?season2=1)
 * Chromium (one browser, one page), and for each level calls __k11.playLevel(id), then steps the game itself
 * (update(), 60 per game second) in batches while the page's own clock is paused, choosing the keys every frame from
 * what a player can see: the ground, walls, hazard trenches, ropes, bars, rings, ladders, water, foes and the bosses.
 * Between batches real time passes, so the talk lines (they run on real timers) move on: a castle's exit opens only
 * after its rescue lines are said. Math.random is seeded per level, so a run is repeatable on the same code.
 * A level the robot cannot clear is tried once more with god mode (nothing can hurt Kinan; hazard falls still count),
 * and that is recorded as clearedGod: it is a finding, never a pass.
 */
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4183;
const OUT_DIR = join(ROOT, 'app', 'audit', 'season2-ready');
const DEFAULT_OUT = join(OUT_DIR, 'sweep.json');
const args = process.argv.slice(2);
const argVal = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };

const MAX_FRAMES = 30000;     /* 8 minutes of game time per try */
const STUCK_FRAMES = 420;     /* 7 s of game time with no progress = a stuck spot */
const GIVE_UP_FRAMES = 2700;  /* 45 s with no progress: the robot gives the level up */
const BATCH = 600;            /* game frames per page call (10 s of game time) */

/* the 44 Season 2 levels: levels/w12..w15 (l01..l08, fort, secret, castle) */
function levelIds() {
  const ids = [];
  for (const w of [12, 13, 14, 15]) {
    const dir = join(ROOT, 'levels', 'w' + w);
    for (const f of readdirSync(dir).sort()) {
      const m = /^l0?(\d+)\.js$/.exec(f);
      if (m) ids.push(w + '-' + Number(m[1]));
      else if (/^(fort|secret|castle)\.js$/.test(f)) ids.push(w + '-' + f.replace('.js', ''));
    }
  }
  const order = (id) => { const [w, s] = id.split('-'); return Number(w) * 100 + (/^\d+$/.test(s) ? Number(s) : s === 'fort' ? 4.5 : s === 'secret' ? 50 : 60); };
  return ids.sort((a, b) => order(a) - order(b));
}

/* ---------------------------------------------------------------- hashes */
function sha(file) { return createHash('sha256').update(readFileSync(file)).digest('hex'); }
function filesUnder(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...filesUnder(p)); else out.push(p);
  }
  return out;
}
function hashes() {
  const h = { 'index.html': sha(join(ROOT, 'index.html')), 'sw.js': sha(join(ROOT, 'sw.js')), 'tools/s2-sweep.mjs': sha(fileURLToPath(import.meta.url)) };
  for (const d of ['levels', 'map']) for (const f of filesUnder(join(ROOT, d)).sort()) h[relative(ROOT, f).split('\\').join('/')] = sha(f);
  return h;
}

/* ---------------------------------------------------------------- the pass rule */
function auditCount(a) { return a ? (a.unreach || []).length + (a.issues || []).length : 1; }
function judge(saved, ids) {
  const fails = [];
  for (const id of ids) {
    const r = saved.levels[id];
    if (!r) { fails.push(`${id}: not in the results`); continue; }
    if (!r.cleared) fails.push(`${id}: not cleared by the robot${r.clearedGod ? ' (cleared only with god mode)' : ''}${r.stuck && r.stuck.length ? `; stuck at ${r.stuck.map((s) => `x${s.x},y${s.y}`).join(' ')}` : ''}`);
    if ((r.pageErrors || []).length) fails.push(`${id}: ${r.pageErrors.length} page error(s): ${r.pageErrors[0]}`);
    if (auditCount(r.audit)) fails.push(`${id}: s2audit found ${auditCount(r.audit)} problem(s): ${JSON.stringify([...(r.audit && r.audit.unreach || []), ...(r.audit && r.audit.issues || [])].slice(0, 3))}`);
  }
  return fails;
}

/* ---------------------------------------------------------------- verify */
if (args.includes('--verify')) {
  const OUT = DEFAULT_OUT;
  if (!existsSync(OUT)) { console.log(`NO RESULTS: ${relative(ROOT, OUT)} does not exist. Run node tools/s2-sweep.mjs first.`); process.exit(2); }
  const saved = JSON.parse(readFileSync(OUT, 'utf8'));
  if (saved.partial) { console.log('REFUSED: the saved results are a partial run (--levels). Run the whole sweep.'); process.exit(2); }
  const now = hashes(), was = saved.hashes || {};
  const stale = [...new Set([...Object.keys(now), ...Object.keys(was)])].filter((k) => now[k] !== was[k]);
  if (stale.length) { console.log(`STALE: the code changed since the sweep was saved (${stale.length} file(s)): ${stale.slice(0, 8).join(', ')}${stale.length > 8 ? ' ...' : ''}`); process.exit(2); }
  const ids = levelIds();
  if (ids.length !== 44) { console.log(`FAIL: expected 44 Season 2 levels, found ${ids.length}`); process.exit(1); }
  console.log(`results: ${relative(ROOT, OUT)} (${Object.keys(saved.levels).length} levels, saved ${saved.when}), hashes match (${Object.keys(now).length} files)`);
  for (const id of ids) {
    const r = saved.levels[id];
    if (!r) { console.log(`  FAIL ${id} missing`); continue; }
    const ok = r.cleared && !(r.pageErrors || []).length && !auditCount(r.audit);
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${id.padEnd(10)} cleared ${r.cleared ? 'yes' : r.clearedGod ? 'GOD ' : 'NO  '} deaths ${r.deaths} stuck ${(r.stuck || []).length} pageErrors ${(r.pageErrors || []).length} audit ${auditCount(r.audit)} candles ${r.candles}/${r.candlesTotal}`);
  }
  const fails = judge(saved, ids);
  if (fails.length) { console.log(`FAIL (${fails.length}):\n  ` + fails.join('\n  ')); process.exit(1); }
  console.log('PASS: all 44 Season 2 levels cleared by the robot without god mode, 0 page errors, 0 s2audit problems');
  process.exit(0);
}

/* ---------------------------------------------------------------- the page side */
/* installed once in the page. Everything the robot reads comes through the dev hooks (__k11.petWorld(), s2audit(),
   state(), foes()); everything it does is the player's input flags. */
function pageInstall() {
  const w = window, k = w.__k11, G = () => k.petWorld();
  const seed = (s) => { let a = s >>> 0; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const bot = w.__s2bot = {};

  /* ---- the pets (the same measures as tools/pet-probe.mjs) ---- */
  const pet = { on: false, stats: {} };
  const petSample = () => {
    if (!pet.on) return;
    const { P, pets, L, T, ROWS, solid, tileAt, slopeSurfaceY, s2InWater } = G();
    if (!P || !L) return;
    const mid = (p) => p.x + (p.w || 12) / 2;
    const box = (p, hgt) => { const cx = mid(p); for (let ty = Math.floor((p.y + 2) / T); ty <= Math.floor((p.y + hgt - 4) / T); ty++) for (let tx = Math.floor((cx - 3) / T); tx <= Math.floor((cx + 3) / T); tx++) if (tx >= 0 && tx < L.w && solid(tx, ty)) return true; return false; };
    const supported = (p, hgt) => {
      const feet = p.y + hgt, r = Math.round(feet / T);
      if (Math.abs(feet - r * T) <= 1.5) for (let tx = Math.floor(p.x / T); tx <= Math.floor((p.x + (p.w || 12) - 1) / T); tx++) if (solid(tx, r) || tileAt(tx, r) === 7) return true;
      const cx = mid(p), c2 = Math.floor(cx / T);
      for (let ty = Math.floor(feet / T) - 1; ty <= Math.floor(feet / T) + 1; ty++) { const s = slopeSurfaceY(c2, ty, cx); if (s != null && Math.abs(feet - s) <= 3) return true; }
      return false;
    };
    const allowed = (p, hgt) => !!(p.s2swim || p.s2climb || p.s2leap || P.s2warp || s2InWater(mid(p), p.y + hgt / 2));
    const inPit = (p, hgt) => { if (p.y + hgt > ROWS * T + 8) return true; for (const Z of L.s2.hazards) if (mid(p) > Z.x0 && mid(p) < Z.x1 && p.y + hgt > Z.y0 + 2) return true; return false; };
    for (const [p, kind, hgt] of pets.cats.map((c) => [c, 'cat', 10]).concat(pets.dogs.map((d) => [d, 'dog', 11]))) {
      const key = kind + ':' + p.id;
      const S = pet.stats[key] || (pet.stats[key] = { id: p.id, kind, frames: 0, inWallFrames: 0, floatingFrames: 0, pitFrames: 0, first: [], prev: null });
      S.frames++;
      const cur = { x: p.x, y: p.y };
      const note = (what) => { if (S.first.length < 4) S.first.push(`${what} pet(${Math.round(p.x)},${Math.round(p.y)}) kinan(${Math.round(P.x)},${Math.round(P.y)})`); };
      if (S.prev) {
        const dx = p.x - S.prev.x, dy = p.y - S.prev.y, ddy = dy - S.prev.dy, big = Math.abs(dx) >= 12 || Math.abs(dy) >= 24;
        cur.dy = dy;
        if (box(p, hgt)) { S.inWallFrames++; note('in-wall'); }
        const pit = inPit(p, hgt); if (pit) { S.pitFrames++; if (!S.prev.pit) note('pit'); } cur.pit = pit;
        const sup = supported(p, hgt); cur.sup = sup;
        if (!big && !pit && !sup && !allowed(p, hgt)) { const arc = ddy >= 0.1 || dy >= 5 || S.prev.sup || (dy < 0 && S.prev.dy >= -0.01); if (!arc) { S.floatingFrames++; note('floating'); } }
      } else cur.dy = 0;
      S.prev = cur;
    }
  };
  k.petProbe(petSample);

  /* ---- the robot's eyes ---- */
  const press = (m, input, n) => { input.jumpBuf = 8; m.hold = Math.max(m.hold, n || 16); m.lastPress = m.f; };
  const hazardAhead = (S, P, dir, T) => {   /* the nearest hazard trench in front of his feet: [zone, px to its edge] */
    let best = null, bd = 1e9;
    for (const Z of S.hazards) {
      const d = dir > 0 ? Z.x0 - (P.x + P.w) : P.x - Z.x1;
      if (d > -P.w && d < bd && d < 5 * T) { bd = d; best = Z; }
    }
    return best ? [best, bd] : null;
  };

  /* one frame's keys */
  function decide(g, m) {
    const { P, L, input, solid, tileAt, T } = g, S = L.s2;
    const cx = P.x + P.w / 2, cy = P.y + P.h / 2, feet = P.y + P.h, col = Math.floor(cx / T), frow = Math.floor((feet - 1) / T);
    const up = L.up | 0;
    let tx = L.w * T + 100, mode = 'run', bossB = null;
    let wantJump = false, holdN = 16, fire = false, down = false, still = false, noJumpHold = false;
    /* the bosses */
    for (const B of S.bosses) {
      if (B.kind === 'mole' && cx > B.x0 && cx < B.x1 && B.state !== 'wait' && B.state !== 'friend') { mode = 'mole'; bossB = B; }
      if (B.kind === 'tide' && P.x + P.w > B.x0 && P.x < B.x1) {
        if (B.state === 'crab' && B.crab) { mode = 'crab'; bossB = B; }
        else if (feet > B.summitY + 2) { mode = 'shaft'; bossB = B; }
      }
    }
    m.mode = mode;
    if (mode === 'mole') {
      const B = bossB, h = B.hole;
      if (B.state === 'up' && h) {
        tx = h.x;
        if (P.onGround && Math.abs(h.x - cx) < 34) wantJump = true;
      } else if (B.state === 'tell' && h) {
        tx = h.x + (cx < h.x ? -26 : 26);
      } else still = true;
      for (const d of B.drops || []) if (!d.fall && Math.abs(d.x - cx) < 14) { tx = cx + (d.x < cx ? 40 : -40); still = false; }   /* a marked ceiling rock: step aside */
    } else if (mode === 'crab') {
      /* a summit creature (King Crab's rules: it walks at him, shows a tell, charges to a wall and is dizzy there). Since
         2026-11-12 it reaches every tile of the summit (there is no safe corner any more), so the robot fights it the way
         a player does: it keeps about seven tiles away on its own side, jumps straight up as a charge comes at it (the
         creature runs on under him to the wall, or stops under him at the wall, dizzy), jumps over it if it walks him into
         a wall, and hops on its head while it is dizzy */
      const B = bossB, c = B.crab, ccx = c.x + c.w / 2, T = g.T;
      m.bossInfo = c.st + ':' + Math.round(ccx) + ':h' + B.hits;
      const SPD = [2.7, 3.2, 3.7, 4.1][Math.min(3, B.hits)];
      const wl = B.x0 + 8, wr = B.gateCol * T - 8;   /* where his middle can be on the summit (the left wall, the shut gate) */
      const side = cx < ccx ? -1 : 1, gapB = side < 0 ? c.x - (P.x + P.w) : P.x - (c.x + c.w), coming = c.dir === side;
      if (c.st === 'tired') {
        tx = ccx + side * 9;   /* land on his side of its middle: the stomp pushes it away from him */
        if (P.onGround && Math.abs(tx - cx) < 34) { wantJump = true; holdN = 14; }
        if (!P.onGround && Math.abs(tx - cx) < 5) still = true;
      } else if (c.st === 'charge' && coming) {
        tx = cx; still = true;
        if (P.onGround && gapB < 16 * SPD) { wantJump = true; holdN = 22; }   /* straight up, ~16 frames ahead: it runs on under him */
      } else if (c.st === 'charge') {
        tx = ccx + side * 24;   /* it ran past him: run after it, so he is there while it is dizzy at the wall */
      } else {
        const want = ccx + side * 7 * T;
        if ((want < wl || want > wr) && c.st === 'walk' && coming && gapB < 10) {   /* backed into a wall: over its head */
          tx = ccx - side * 7 * T; if (P.onGround) { wantJump = true; holdN = 22; }
        } else { tx = Math.max(wl, Math.min(wr, want)); if (Math.abs(tx - cx) < 2) still = true; }
        if (Math.abs(ccx - cx) > 100) for (const q of B.bubbles) {   /* a lobbed bubble (only from far away): step out of its way */
          const a2 = 0.04, b2 = q.vy, c2 = q.y - (B.summitY - 8), disc = b2 * b2 - 4 * a2 * c2;
          if (disc < 0) continue;
          const tl = (-b2 + Math.sqrt(disc)) / (2 * a2), lx = q.x + q.vx * tl;
          if (tl > 0 && tl < 90 && Math.abs(lx - cx) < 20) { tx = cx + (lx < cx ? 44 : -44); still = false; }
        }
      }
      for (const wv of B.waves) if (Math.abs(wv.x - cx) < 30 && P.onGround) wantJump = true;
    } else if (mode === 'shaft') {
      const B = bossB;
      let best = null, bd = 1e9;
      for (const c of S.climbs) {
        if (c.x + T < B.x0 || c.x > B.x1) continue;
        if (Math.abs(c.bot - feet) <= T + 2 && c.top < feet - T) { const d = Math.abs(c.x + T / 2 - cx); if (d < bd) { bd = d; best = c; } }
      }
      if (best) { tx = best.x + T / 2; m.climbTo = best; if (Math.abs(tx - cx) < 4 && P.onGround) { still = true; wantJump = true; } }
      else tx = (B.x0 + B.x1) / 2;
    }
    if (!S.bosses.length || mode === 'run') {
      /* the castle's summit after the fight: the goal (behind the gate) */
      if (L.goal) tx = Math.max(tx, (L.goal.tx + 1) * T);
    }
    let dir = still ? 0 : tx > cx + 3 ? 1 : tx < cx - 3 ? -1 : 0;
    m.dbg = { tx: Math.round(tx), dir, mode, feet: Math.round(feet), climbTo: m.climbTo ? [m.climbTo.x / T, m.climbTo.top / T, m.climbTo.bot / T] : null };
    /* ---- held by something ---- */
    if (P.s2rope) {   /* a rope or the grappling hook: face the way on, let go on the forward swing */
      const R = P.s2rope, f = dir || 1;
      input.left = f < 0; input.right = f > 0; input.jump = false; input.down = false;
      if (R.t > 14 && Math.cos(R.ph) * f > -0.2 && (P.face || 1) === f) input.jumpBuf = 8;
      return dir;
    }
    if (P.s2bar) { input.left = dir < 0; input.right = dir >= 0; input.jump = false; input.down = false; return dir; }
    if (P.s2climb) {   /* a ladder or vine: up (hold JUMP), off sideways only when it is not the way */
      const C = P.s2climb, upWay = m.climbing && (mode === 'shaft' || m.climbing === C);
      input.left = input.right = false; input.down = false;
      if (upWay || mode === 'shaft') { input.jump = true; }
      else { input.jump = true; if (m.f - (m.climbStart || 0) > 240) { input.right = dir >= 0; input.left = dir < 0; input.jumpBuf = 8; } }   /* jump off: an arrow with a fresh JUMP tap (an arrow with JUMP held climbs on) */
      return dir;
    }
    m.climbing = mode === 'shaft' ? m.climbTo : (m.climbing && P.onGround && Math.abs(feet - m.climbFeet) > 2 * T ? null : m.climbing);
    /* ---- swimming ---- */
    const wet = S.water.find((r) => cx >= r.x0 && cx < r.x1 && cy >= r.y0 && cy < r.y1);
    if (wet) {
      input.left = dir < 0; input.right = dir > 0; input.down = false;
      const nearBank = dir > 0 ? wet.x1 - cx < 3 * T : cx - wet.x0 < 3 * T;
      /* a stroke when he sinks; at the far bank, a stroke at the surface jumps him out */
      if (m.f - (m.lastPress || 0) > 5 && ((nearBank && P.y < wet.y0 + 6) || P.vy > 0.3)) press(m, input, 8);
      input.jump = m.hold > 0; if (m.hold > 0) m.hold--;
      return dir;
    }
    /* ---- on the ground or in the air ---- */
    const front = dir > 0 ? P.x + P.w : P.x;
    if (P.onGround && dir) {
      const fx = Math.floor((front + dir * 3) / T);
      /* a wall in front of his feet: how tall? */
      let hgt = 0; for (let r = frow; r >= frow - 20 && solid(fx, r); r--) hgt++;
      const board = L.boards && L.boards.size && L.boards.has((frow + up) * L.w + fx);
      if (board) { fire = true; }
      else if (hgt > 0 && hgt <= 4) { wantJump = true; holdN = 18; }
      else if (hgt > 4) {
        /* too tall to jump: a ladder or vine by it? else wall-jump */
        const c = S.climbs.find((c2) => Math.abs(c2.x + T / 2 - cx) < 3 * T && c2.bot >= feet - 2 && c2.top < feet - T);
        if (c) { tx = c.x + T / 2; dir = Math.abs(tx - cx) < 3 ? 0 : tx > cx ? 1 : -1; m.climbing = c; m.climbFeet = feet; if (!dir) { wantJump = true; m.climbStart = m.f; } }
        else { wantJump = true; holdN = 18; m.wallJump = m.f; }
      }
      /* a hazard trench ahead: jump at its edge */
      const hz = hazardAhead(S, P, dir, T);
      if (hz) {
        const [Z, d] = hz, speed = Math.abs(P.vx);
        if (d <= Math.max(3, speed * 2.2) && d > -P.w + 2) { wantJump = true; holdN = 22; m.overZ = Z; }
      }
      /* a foe in front: jump on it */
      if (m.f % 3 === 0) m.foesNow = k.foes();
      for (const f of m.foesNow || []) if (f.alive && (f.x - P.x) * dir > 0 && Math.abs(f.x - P.x) < 34 && Math.abs(f.y - P.y) < 24) { wantJump = true; break; }
      /* a low ceiling: never jump into it (the tunnel crawl handles it) */
      if (solid(col, frow - 1) || solid(col, frow - 2)) { if (!fire && hgt <= 1) wantJump = wantJump && !solid(col, frow - 1); }
    }
    if (!P.onGround) {
      /* the grappling hook: JUMP near a gold ring ahead */
      if (S.rings.length && !(P.s2ropeCd > 0) && m.f - (m.lastPress || 0) > 6) {
        for (const R of S.rings) if (R !== P.s2ringLast && (R.x - cx) * (dir || 1) > 0 && R.y < P.y - 4 && Math.hypot(R.x - cx, R.y - P.y) < 90) { press(m, input, 8); break; }
      }
      /* the dash kick over a wide trench */
      if (S.dash && !P.s2dashUsed && P.vy > -1.2) {
        const Z = S.hazards.find((z) => cx > z.x0 - 2 * T && cx < z.x1);
        if (Z && (dir > 0 ? Z.x1 - cx : cx - Z.x0) > 2.5 * T && feet > Z.y0 - 6 * T) fire = true;
      }
      /* the wall jump: a wall at his side in the air */
      if (m.wallJump && m.f - m.wallJump < 600 && P.s2wallT > 0 && P.vy > -1.5 && m.f - (m.lastPress || 0) > 8) press(m, input, 14);
    }
    if (wantJump && P.onGround && m.f - (m.lastPress || 0) > 10) press(m, input, holdN);
    /* hold JUMP: a full jump; in France also the glide while falling over a trench or a drop */
    let hold = m.hold > 0; if (m.hold > 0) m.hold--;
    if (S.glide && !P.onGround && P.vy > 0.5 && !noJumpHold && mode === 'run') hold = true;   /* (never in a fight: a glide floats him past the stomp) */
    if (mode === 'shaft' && m.climbing && !P.onGround) hold = true;
    input.jump = hold;
    input.left = dir < 0; input.right = dir > 0;
    input.fireHeld = false; input.runHeld = false;
    if (fire && m.f - (m.lastFire || 0) > 12) { input.fireBuf = 10; m.lastFire = m.f; }
    input.down = down;
    return dir;
  }

  /* ---- a level ---- */
  bot.start = (a) => {
    const g0 = G(), progress = g0.progress;
    progress.pets.ids = ['cat1', 'dog1', 'cat2', 'dog2', 'cat3', 'cat4'];
    progress.pets.equippedCat = a.cat; progress.pets.equippedDog = a.dog; progress.pets.soloCat = false; progress.pets.soloDog = false;
    seed(a.seed);
    k.storyStop();
    const info = k.playLevel(a.id);
    if (!info) return { error: 'level did not load: ' + JSON.stringify(k.levelProblems()) };
    k.freeze(true);
    const g = G();
    g.setFrame(0); seed(a.seed);
    const audit = k.s2audit();
    const st = k.state();
    bot.m = { f: 0, hold: 0, lastPress: -99, lastFire: -99, god: !!a.god, best: -1e9, bestY: 1e9, hitsSeen: 0, noProg: 0, stuck: [], stuckNow: false, recover: 0, recN: 0,
      deaths0: g.deaths, hp: g.P.hp, hearts: 0, falls: 0, fallAt: [], liveIssues: [], trace: a.trace ? [] : null, offers: [], stuckTotal: 0, gaveUp: false, cols: g.L.w, spawn: { x: Math.round(g.P.x), y: Math.round(g.P.y) }, modes: {} };
    pet.on = true; pet.stats = {};
    return { audit, candlesTotal: st.totalCandles, cols: g.L.w, spawn: bot.m.spawn, goal: g.L.goal ? { tx: g.L.goal.tx, ty: g.L.goal.ty } : null };
  };
  bot.run = (n) => {
    const m = bot.m;
    k.freeze(false);
    let g = G();
    for (let i = 0; i < n; i++) {
      g = G();
      const { P, L, input } = g;
      if (!L || !L.s2 || L.cleared) break;
      const ask = document.getElementById('glitchyAsk');
      if (ask && !ask.hidden) {   /* Glitchy's help offer (5 falls in one spot): the robot says no, and it is written down */
        m.offers.push({ x: Math.round(P.x), y: Math.round(P.y), f: m.f });
        w.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyN', key: 'n' }));
        w.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyN', key: 'n' }));
      }
      if (m.god) P.inv = Math.max(P.inv, 9e5);
      m.f++;
      /* progress: farther right, higher up (a shaft), a boss stomp */
      const hits = L.s2.bosses.reduce((s, B) => s + (B.hits || 0) + (B.state === 'friend' ? 10 : 0) + (B.state === 'done' ? 10 : 0), 0);
      const cxp = P.x + P.w / 2, fy = P.y + P.h;
      let prog = false;
      if (cxp > m.best + 6) { m.best = cxp; prog = true; }
      if (m.mode === 'shaft' && fy < m.bestY - 6) { m.bestY = fy; prog = true; }
      if (hits > m.hitsSeen) { m.hitsSeen = hits; prog = true; } else if (hits < m.hitsSeen) m.hitsSeen = hits;   /* a lost fight starts over */
      if (m.f % 30 === 0) { const si = k.storyInfo(); m.holdNow = si.hold; m.talkWait = L.s2.bosses.some((B) => B.state === 'friend' && B.lockGoal) && k.s2().locked; }
      if (m.talkWait) { m.talkFrames = (m.talkFrames || 0) + 1; if (m.talkFrames % 30 === 0) { m.yield = true; } }   /* the castle's exit waits for its rescue lines (real-time talk): let real time pass */
      if (prog || m.holdNow || m.talkWait || P.dead) { m.noProg = 0; m.recover = 0; } else m.noProg++;
      if (m.noProg === STUCK_FRAMES_) {
        const where = { x: Math.round(P.x), y: Math.round(P.y), col: Math.floor(cxp / g.T), row: Math.floor((fy - 1) / g.T), f: m.f, mode: m.mode, ground: !!P.onGround,
          rope: !!P.s2rope, bar: !!P.s2bar, climb: !!P.s2climb, swim: !!P.s2swim, hp: P.hp, best: Math.round(m.best), robot: m.dbg || null };
        m.stuck.push(where); m.stuckNow = true; m.recover = m.mode === 'crab' || m.mode === 'mole' ? 0 : 1;   /* in a boss fight the robot keeps fighting (a stomp is the progress) */
      }
      if (cxp > (m.far || -1e9) + 6 || (m.mode === 'shaft' && fy < (m.farY || 1e9) - 6) || prog && hits > 0) { m.far = Math.max(m.far || -1e9, cxp); if (m.mode === 'shaft') m.farY = Math.min(m.farY || 1e9, fy); m.farF = m.f; }
      if (m.noProg >= GIVE_UP_ || m.f - (m.farF || 0) > 2 * GIVE_UP_) { m.gaveUp = true; m.gaveUpWhy = m.noProg >= GIVE_UP_ ? 'no progress' : 'keeps falling back (no new ground for ' + Math.round(2 * GIVE_UP_ / 60) + ' s)'; break; }
      let dir;
      if (m.recover) {   /* stuck: try something else for a while (back off and take a run-up, jump the other way, let go) */
        const r = m.noProg - STUCK_FRAMES_, kind = Math.floor(r / 150) % 4, t = r % 150;
        input.fireHeld = false; input.runHeld = false; input.down = false; input.fireBuf = 0;
        if (kind === 0) { input.left = t < 40; input.right = t >= 40; if (t === 60) input.jumpBuf = 8; input.jump = t >= 60 && t < 84; }
        else if (kind === 1) { input.left = false; input.right = true; if (t % 30 === 0) input.jumpBuf = 8; input.jump = t % 30 < 20; }
        else if (kind === 2) { input.left = false; input.right = t > 30; input.down = t < 10; input.jump = false; if (t === 50) input.fireBuf = 10; }
        else { input.right = false; input.left = t < 70; if (t % 35 === 0) input.jumpBuf = 8; input.jump = t % 35 < 22; }
        dir = 0;
      } else dir = decide(g, m);
      m.modes[m.mode] = (m.modes[m.mode] || 0) + 1;
      const hp0 = P.hp, y0 = P.y, dead0 = !!P.dead;
      g.update(1 / 60);
      const g2 = G();
      if (g2.P.hp < hp0 && !g2.P.dead) m.hearts += hp0 - g2.P.hp;
      if (g2.P.y - y0 > 40 && !dead0 && !g2.P.dead && !g2.P.s2dash) { m.falls++; if (m.fallAt.length < 12) m.fallAt.push({ x: Math.round(P.x), y: Math.round(y0), f: m.f }); }   /* a hazard touch drops him off the bottom of the picture (the pit rule) */
      if (m.trace && m.f % 15 === 0 && m.trace.length < 4000) m.trace.push([m.f, Math.round(g2.P.x), Math.round(g2.P.y), m.mode, m.dbg ? m.dbg.dir : null, m.dbg ? m.dbg.tx : null, g2.P.hp, g2.P.onGround ? 1 : 0, g2.P.s2rope ? 'R' : g2.P.s2bar ? 'B' : g2.P.s2climb ? 'C' : g2.P.s2swim ? 'W' : '', m.recover ? 'REC' : '', m.mode === 'crab' ? m.bossInfo : '']);
      if ((dead0 && !g2.P.dead) || g2.P.y - y0 > 40 || y0 - g2.P.y > 40) { m.best = g2.P.x + g2.P.w / 2; m.bestY = g2.P.y + g2.P.h; }   /* back at a checkpoint or safe ground: progress counts from here */
      if (m.f >= MAX_FRAMES_) break;
      if (m.stuckNow) break;   /* the caller may take a screenshot of the stuck spot */
      if (m.yield) { m.yield = false; m.yielded = true; break; }
    }
    k.freeze(true);
    g = G();
    if (g.L && g.L.s2 && !g.L.cleared) {   /* the audit again during play: a foe that walked into a wall (not the pass rule: that is the audit at the start) */
      const au = k.s2audit();
      for (const q of (au && au.issues) || []) { const key = q.join(','); if (!m.liveIssues.some((x) => x.key === key) && m.liveIssues.length < 20) m.liveIssues.push({ key, f: m.f, issue: q }); }
    }
    const st = k.state();
    const talk = !!m.yielded; m.yielded = false;
    return { talk, f: m.f, cleared: !!(g.L && g.L.cleared), x: Math.round(g.P.x), y: Math.round(g.P.y), stuckNow: m.stuckNow, gaveUp: m.gaveUp, done: !!(g.L && g.L.cleared) || m.gaveUp || m.f >= MAX_FRAMES_, candles: st.candles, mode: m.mode };
  };
  bot.shotReady = () => { bot.m.stuckNow = false; const g = G(); g.draw(); return true; };
  bot.end = () => {
    const m = bot.m, g = G();
    pet.on = false;
    const pets = Object.values(pet.stats).map((s) => ({ id: s.id, kind: s.kind, frames: s.frames, inWallFrames: s.inWallFrames, floatingFrames: s.floatingFrames, pitFrames: s.pitFrames, first: s.first }));
    const st = k.state();
    return { frames: m.f, cleared: !!(g.L && g.L.cleared), deaths: g.deaths - m.deaths0, heartsLost: m.hearts, falls: m.falls, fallAt: m.fallAt, trace: m.trace, stuck: m.stuck, gaveUp: m.gaveUp, gaveUpWhy: m.gaveUpWhy || null, helpOffers: m.offers, auditDuringPlay: m.liveIssues.map((x) => ({ f: x.f, issue: x.issue })),
      candles: st.candles, candlesTotal: st.totalCandles, end: { x: Math.round(g.P.x), y: Math.round(g.P.y), col: Math.floor((g.P.x + g.P.w / 2) / g.T), best: Math.round(m.best), cols: m.cols },
      bosses: g.L && g.L.s2 ? g.L.s2.bosses.map((B) => ({ kind: B.kind, state: B.state, hits: B.hits })) : [], goalLocked: g.L && g.L.s2 ? k.s2().locked : null, talkQueue: k.storyInfo().queue.length,
      modes: m.modes, pets, s2stats: g.L && g.L.s2 ? JSON.parse(JSON.stringify(g.L.s2.stats)) : null };
  };
}

/* ---------------------------------------------------------------- run */
async function waitHttp(url, ms) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try { const r = await fetch(url); if (r.ok) return true; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PAIRS = [['cat2', 'dog1'], ['cat3', 'dog2'], ['cat4', 'dog1'], ['cat2', 'dog2']];

async function main() {
  const all = levelIds();
  const only = argVal('--levels') ? argVal('--levels').split(',') : null;
  const shotsDir = argVal('--shots') ? resolve(argVal('--shots')) : null;
  const OUT = resolve(argVal('--out') || (only ? join(OUT_DIR, 'sweep-partial.json') : DEFAULT_OUT));
  const levels = only || all;
  for (const id of levels) if (!all.includes(id)) throw new Error('not a Season 2 level: ' + id);
  const before = hashes();
  const require = createRequire(join(ROOT, 'app', 'package.json'));
  const { chromium } = require('@playwright/test');
  const server = spawn(process.execPath, [join(ROOT, 'tools', 'preview-server.mjs'), '--root', ROOT, '--port', String(PORT)], { stdio: 'ignore' });
  let browser = null;
  const t0 = Date.now();
  try {
    if (!(await waitHttp(`http://127.0.0.1:${PORT}/index.html`, 15000))) throw new Error('preview server did not start on port ' + PORT);
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' });
    let cur = '(page load)';
    const errs = {};
    const add = (kind, msg) => { (errs[cur] = errs[cur] || { page: [], console: [] })[kind].push(msg.slice(0, 400)); };
    page.on('pageerror', (e) => add('page', e.message));
    page.on('console', (m) => { if (m.type() === 'error') add('console', m.text()); });
    await page.goto(`http://127.0.0.1:${PORT}/index.html?devtools=1`);   /* the normal game (Season 2 is in it since 2026-11-12) */
    await page.waitForFunction(() => !!window.__k11 && window.KinanLevels && window.KinanLevels.ready, null, { timeout: 30000 });
    const src = `(${pageInstall.toString()})();`.replace(/STUCK_FRAMES_/g, String(STUCK_FRAMES)).replace(/GIVE_UP_/g, String(GIVE_UP_FRAMES)).replace(/MAX_FRAMES_/g, String(MAX_FRAMES));
    await page.addScriptTag({ content: src });
    if (!(await page.evaluate(() => !!window.__s2bot))) throw new Error('the robot could not be installed (are the __k11 dev hooks there?)');
    let results = {}, resumed = 0;
    const PROGRESS = join(OUT_DIR, 'sweep-progress.json');
    if (args.includes('--resume') && !only && existsSync(PROGRESS)) {
      const pr = JSON.parse(readFileSync(PROGRESS, 'utf8'));
      if (JSON.stringify(pr.hashes) === JSON.stringify(before)) { results = pr.levels || {}; resumed = Object.keys(results).length; console.log(`resuming: ${resumed} level(s) already played on this code`); }
      else console.log('sweep-progress.json is from other code: starting over');
    }
    for (let n = 0; n < levels.length; n++) {
      const id = levels[n], pair = PAIRS[n % PAIRS.length];
      if (results[id]) continue;   /* (--resume: played already on this same code) */
      const tries = [];
      for (const god of args.includes('--god') ? [true] : [false, true]) {
        cur = id;
        const t1 = Date.now();
        const s = await page.evaluate((a) => window.__s2bot.start(a), { id, cat: pair[0], dog: pair[1], seed: 2000 + all.indexOf(id), god, trace: args.includes('--trace') });
        if (s.error) throw new Error(`${id}: ${s.error}`);
        let r, guard = 0, shots = [];
        do {
          r = await page.evaluate((b) => window.__s2bot.run(b), BATCH);
          if (r.stuckNow) {
            if (shotsDir && !god && shots.length < 3) {
              await page.evaluate(() => window.__s2bot.shotReady());
              mkdirSync(shotsDir, { recursive: true });
              const file = join(shotsDir, `stuck-${id}-x${r.x}-y${r.y}.png`);
              await page.screenshot({ path: file });
              shots.push(relative(ROOT, file).split('\\').join('/'));
            } else await page.evaluate(() => { window.__s2bot.m.stuckNow = false; });
          }
          await sleep(r.done ? 0 : r.talk ? 500 : 40);   /* real time for the talk timers (a castle's rescue lines: game time at real speed) */
        } while (!r.done && ++guard < 2000);
        const e = await page.evaluate(() => window.__s2bot.end());
        tries.push(Object.assign({ god, seconds: Math.round((Date.now() - t1) / 1000), audit: s.audit, goal: s.goal, spawn: s.spawn, shots }, e));
        if (e.cleared) break;
      }
      const first = tries[0], last = tries[tries.length - 1];
      const er = errs[id] || { page: [], console: [] };
      results[id] = {
        cleared: first.cleared, clearedGod: !first.cleared && last.god ? last.cleared : null,
        frames: first.frames, deaths: first.deaths, heartsLost: first.heartsLost, falls: first.falls, fallAt: first.fallAt, stuck: first.stuck, gaveUp: first.gaveUp, gaveUpWhy: first.gaveUpWhy, helpOffers: first.helpOffers,
        candles: first.candles, candlesTotal: first.candlesTotal, bosses: first.bosses, goalLocked: first.goalLocked, auditDuringPlay: first.auditDuringPlay, talkQueue: first.talkQueue, audit: first.audit, end: first.end, goal: first.goal, spawn: first.spawn, shots: first.shots,
        pageErrors: er.page, consoleErrors: er.console, pets: first.pets, modes: first.modes, s2stats: first.s2stats, trace: first.trace || undefined,
        godTry: last.god ? { cleared: last.cleared, frames: last.frames, deaths: last.deaths, falls: last.falls, stuck: last.stuck, end: last.end } : null
      };
      const R = results[id], pw = R.pets.reduce((s, p) => s + p.inWallFrames, 0), pf = R.pets.reduce((s, p) => s + p.floatingFrames, 0), pp = R.pets.reduce((s, p) => s + p.pitFrames, 0);
      if (!only) { mkdirSync(OUT_DIR, { recursive: true }); writeFileSync(PROGRESS, JSON.stringify({ hashes: before, levels: results })); }
      console.log(`${id.padEnd(10)} ${R.cleared ? 'CLEARED' : R.clearedGod ? 'GOD-ONLY' : 'NOT-CLEARED'} frames ${String(R.frames).padStart(5)} deaths ${R.deaths} falls ${R.falls} hearts ${R.heartsLost} stuck ${R.stuck.length}${R.stuck.length ? ' @' + R.stuck.map((q) => `(${q.x},${q.y})`).join('') : ''} candles ${R.candles}/${R.candlesTotal} audit ${auditCount(R.audit)} auditInPlay ${(R.auditDuringPlay || []).length} pageErr ${R.pageErrors.length} consoleErr ${R.consoleErrors.length} pets wall ${pw} float ${pf} pit ${pp}${R.helpOffers.length ? ' helpOffers ' + R.helpOffers.length : ''}`);
    }
    const after = hashes();
    if (JSON.stringify(after) !== JSON.stringify(before)) throw new Error('the code changed while the sweep ran: results not saved');
    const saved = { tool: 'tools/s2-sweep.mjs', when: new Date().toISOString(), seconds: Math.round((Date.now() - t0) / 1000), partial: !!only || args.includes('--god'), hashes: after,
      rule: 'pass = every level cleared by the robot without god mode, 0 page errors, 0 s2audit problems (unreach + issues)', loadErrors: errs['(page load)'] || null, levels: results };
    const fails = judge(saved, levels);
    saved.pass = !only && fails.length === 0; saved.failures = fails;
    const tot = { levels: levels.length, cleared: levels.filter((i) => results[i].cleared).length, godOnly: levels.filter((i) => results[i].clearedGod).length,
      notCleared: levels.filter((i) => !results[i].cleared && !results[i].clearedGod).length, deaths: levels.reduce((s, i) => s + results[i].deaths, 0),
      stuckSpots: levels.reduce((s, i) => s + results[i].stuck.length, 0), pageErrors: levels.reduce((s, i) => s + results[i].pageErrors.length, 0),
      consoleErrors: levels.reduce((s, i) => s + results[i].consoleErrors.length, 0), auditProblems: levels.reduce((s, i) => s + auditCount(results[i].audit), 0),
      candles: levels.reduce((s, i) => s + results[i].candles, 0), candlesTotal: levels.reduce((s, i) => s + results[i].candlesTotal, 0) };
    saved.totals = tot; saved.resumedLevels = resumed;
    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify(saved, null, 1));
    if (!only && existsSync(join(OUT_DIR, 'sweep-progress.json'))) unlinkSync(join(OUT_DIR, 'sweep-progress.json'));   /* (the whole sweep is saved: the progress file is done) */
    console.log(`\nsaved ${relative(ROOT, OUT)} in ${saved.seconds}s (${levels.length} levels${only ? ', PARTIAL' : ''})`);
    console.log('totals: ' + JSON.stringify(tot));
    if (fails.length) { console.log(`FAIL (${fails.length}):\n  ` + fails.join('\n  ')); process.exitCode = 1; } else console.log('PASS');
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
}
main().catch((e) => { console.error(e); process.exitCode = 1; });

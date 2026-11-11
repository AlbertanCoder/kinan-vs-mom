#!/usr/bin/env node
/*
 * PET PROBE (2026-11-11, pets round 1). Measures how the following cat and dog move, frame by frame, in a sample of
 * levels, so "the pets go through walls / float / slide across the screen" is a number and not a feeling.
 *
 *   node tools/pet-probe.mjs                      run every sample level, write app/audit/pets-round1/results.json
 *   node tools/pet-probe.mjs --out <file.json>    same, to another file (the baseline was saved this way)
 *   node tools/pet-probe.mjs --levels 7-7,13-1    only these levels (a quick look; never the saved proof)
 *   node tools/pet-probe.mjs --strips <dir>       also save frame strips (PNG contact sheets) of 7-7 and 13-1
 *   node tools/pet-probe.mjs --verify             no browser: check the saved results still match the code (sha256 of
 *                                                 index.html, every levels/**\/*.js and this file) and that every
 *                                                 threshold below passes. Exit 0 only when both hold.
 *
 * How it works: it starts tools/preview-server.mjs on port 4181, opens index.html?devtools=1 in headless Chromium,
 * gives Kinan a cat AND a dog, god mode, then drives him with the same script in every level: the dev autopilot run,
 * stops, several turn-arounds, jumps in place and on the run, a plain run that walks off ledges, more autopilot. The
 * game's updatePets() is wrapped so every pet update is sampled. Math.random is seeded and the frame counter reset at
 * each level start, so two runs of the same code give the same numbers.
 */
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4181;
const DEFAULT_OUT = join(ROOT, 'app', 'audit', 'pets-round1', 'results.json');
const args = process.argv.slice(2);
const argVal = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const OUT = resolve(argVal('--out') || DEFAULT_OUT);

/* the sample: two or more levels from every world 1-11 (7-7 included, castles and forts too) and eight Season 2 levels */
const LEVELS = [
  '1-3', '1-7', '1-castle', '2-2', '2-6', '2-fort', '3-4', '3-castle', '4-2', '4-fort', '5-3', '5-castle',
  '6-2', '6-6', '7-3', '7-7', '7-fort', '8-2', '8-5', '9-4', '9-castle', '10-1', '10-6', '11-2', '11-fort',
  '3-7', '5-6', '8-castle', '10-castle', '11-6',
  '12-2', '12-5', '13-1', '13-castle', '14-3', '14-6', '15-5', '15-fort'
];
/* the pets each level brings (cat, dog): both dogs and three cats take turns. Ginger (cat1) is left out: her higher
   jump would change Kinan's own path between runs */
const PAIRS = [['cat2', 'dog1'], ['cat3', 'dog2'], ['cat4', 'dog1'], ['cat2', 'dog2']];

/* THRESHOLDS: Shad's rules for the pets, as numbers. Every one must hold over the whole sample. */
const KINAN_TOP = 4.2;   /* Kinan's fastest run (FEEL.RUSH_MAX, px per frame) */
const THRESHOLDS = {
  inWallFrames: { max: 0, why: 'never through walls: no frame with a pet\'s body inside a solid tile' },
  floatingFrames: { max: 0, why: 'never floating: no frame in the air that is not a real jump or fall (swimming, climbing and pipes excepted)' },
  speedSpikes: { max: 0, why: 'no sliding or racing across the screen: never faster than Kinan can run (+1 px) except in a poof' },
  turnMaxDx: { max: KINAN_TOP, why: 'when Kinan turns around the pets stop and turn: in the 40 frames after a turn no pet moves faster than his top run speed' },
  pitFrames: { max: 0, why: 'never into a bottomless pit or the Season 2 glitch' },
  poofsPerMinute: { max: 2, why: 'poofing back beside Kinan is the rare rescue for a pet left far behind, not how they move (per pet, per minute of play)' },
  catMedianPx: { max: 36, why: 'the cat follows about one body behind Kinan (median distance)' },
  dogMedianPx: { max: 56, why: 'the dog follows a little further back than the cat, never 80+ px (median distance)' }
};

/* the driving script, the same in every level: [kind, frames, held keys] */
const SCRIPT = [
  ['auto', 240],
  ['hold', 40, {}],                                   /* stop */
  ['hold', 50, { left: true }],                       /* turn around and walk back past the pets */
  ['hold', 25, {}],
  ['hold', 70, { right: true }],                      /* turn again */
  ['hold', 18, { left: true }], ['hold', 18, { right: true }], ['hold', 18, { left: true }], ['hold', 40, { right: true }],   /* quick flips */
  ['auto', 240],
  ['hold', 1, { tapJump: true, jump: true }], ['hold', 14, { jump: true }], ['hold', 40, {}],                                 /* a jump in place */
  ['hold', 1, { right: true, tapJump: true, jump: true }], ['hold', 14, { right: true, jump: true }], ['hold', 30, { right: true }],   /* a jump on the run */
  ['hold', 1, { right: true, tapJump: true, jump: true }], ['hold', 14, { right: true, jump: true }], ['hold', 30, { right: true }],
  ['hold', 90, { right: true }],                      /* a plain run: walks off ledges (and into a pit now and then) */
  ['auto', 300],
  ['hold', 40, {}], ['hold', 60, { left: true }], ['hold', 30, {}], ['hold', 60, { right: true }],
  ['auto', 420]
];
const CASTLE_EXTRA = 900;   /* a castle or fort: more autopilot, so the boss arena is reached */

/* ---------------------------------------------------------------- hashes */
function sha(file) { return createHash('sha256').update(readFileSync(file)).digest('hex'); }
function levelFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...levelFiles(p));
    else if (name.endsWith('.js')) out.push(p);
  }
  return out;
}
function hashes() {
  const h = { 'index.html': sha(join(ROOT, 'index.html')), 'tools/pet-probe.mjs': sha(fileURLToPath(import.meta.url)) };
  for (const f of levelFiles(join(ROOT, 'levels')).sort()) h[relative(ROOT, f).split('\\').join('/')] = sha(f);
  return h;
}

/* ---------------------------------------------------------------- thresholds */
function totals(levels) {
  const t = { inWallFrames: 0, floatingFrames: 0, speedSpikes: 0, turnMaxDx: 0, pitFrames: 0, poofs: 0, petFrames: 0, catDist: [], dogDist: [], turns: 0 };
  for (const id of Object.keys(levels)) {
    for (const p of levels[id].pets) {
      t.inWallFrames += p.inWallFrames; t.floatingFrames += p.floatingFrames; t.speedSpikes += p.speedSpikes;
      t.turnMaxDx = Math.max(t.turnMaxDx, p.turnMaxDx); t.pitFrames += p.pitFrames; t.poofs += p.poofs; t.petFrames += p.frames;
      (p.kind === 'cat' ? t.catDist : t.dogDist).push(p.medianDist);
    }
    t.turns += levels[id].turns;
  }
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  return {
    inWallFrames: t.inWallFrames, floatingFrames: t.floatingFrames, speedSpikes: t.speedSpikes, turnMaxDx: Math.round(t.turnMaxDx * 100) / 100,
    pitFrames: t.pitFrames, poofs: t.poofs, poofsPerMinute: Math.round((t.poofs / Math.max(1, t.petFrames / 3600)) * 100) / 100,
    catMedianPx: med(t.catDist), dogMedianPx: med(t.dogDist), petFrames: t.petFrames, turns: t.turns
  };
}
function judge(tot) {
  const fails = [];
  for (const [k, th] of Object.entries(THRESHOLDS)) if (!(tot[k] <= th.max)) fails.push(`${k} = ${tot[k]} (must be <= ${th.max}: ${th.why})`);
  return fails;
}

/* ---------------------------------------------------------------- verify */
if (args.includes('--verify')) {
  if (!existsSync(OUT)) { console.log(`NO RESULTS: ${OUT} does not exist. Run node tools/pet-probe.mjs first.`); process.exit(2); }
  const saved = JSON.parse(readFileSync(OUT, 'utf8'));
  if (saved.partial) { console.log('REFUSED: the saved results are a partial run (--levels). Run the whole probe.'); process.exit(2); }
  const now = hashes(), was = saved.hashes || {};
  const stale = [...new Set([...Object.keys(now), ...Object.keys(was)])].filter((k) => now[k] !== was[k]);
  if (stale.length) { console.log(`STALE: the code changed since the results were saved (${stale.length} file(s)): ${stale.slice(0, 8).join(', ')}${stale.length > 8 ? ' ...' : ''}`); process.exit(2); }
  const tot = totals(saved.levels), fails = judge(tot);
  console.log(`results: ${relative(ROOT, OUT)} (${Object.keys(saved.levels).length} levels, saved ${saved.when}), hashes match (${Object.keys(now).length} files)`);
  for (const [k, th] of Object.entries(THRESHOLDS)) console.log(`  ${tot[k] <= th.max ? 'ok  ' : 'FAIL'} ${k} = ${tot[k]} (max ${th.max})`);
  if (fails.length) { console.log('FAIL:\n  ' + fails.join('\n  ')); process.exit(1); }
  console.log('PASS: every pet threshold holds');
  process.exit(0);
}

/* ---------------------------------------------------------------- the page side */
/* installed once per page: seeds Math.random and hooks the game's pet update (__k11.petProbe) so every one is measured.
   The game lives inside one closure: what the probe reads comes through __k11.petWorld() (dev builds only) */
function pageInstall(opts) {
  const w = window;
  let P, pets, L, camX, camY, W, T, ROWS, solid, tileAt, slopeSurfaceY, s2InWater, draw, cv;
  const refresh = () => { const G = w.__k11.petWorld(); ({ P, pets, L, camX, camY, W, T, ROWS, solid, tileAt, slopeSurfaceY, s2InWater, draw, cv } = G); return G; };
  const seed = (s) => { let a = s >>> 0; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  w.__petSeed = seed;
  const KTOP = opts.KINAN_TOP;
  const R = w.__petProbe = { on: false, pets: {}, turns: [], f: 0, prevP: null, prevFace: 0, shots: null, sheet: null };
  const box = (p, hgt) => {   /* the body: 8 px wide in the middle of the 12 px sprite, from 2 px under its top to 2 px over its feet */
    for (let ty = Math.floor((p.y + 2) / T); ty <= Math.floor((p.y + hgt - 2) / T); ty++)
      for (let tx = Math.floor((p.x + 2) / T); tx <= Math.floor((p.x + 9) / T); tx++) if (tx >= 0 && tx < L.w && solid(tx, ty)) return true;
    return false;
  };
  const supported = (p, hgt) => {
    const feet = p.y + hgt, r = Math.round(feet / T);
    if (Math.abs(feet - r * T) <= 1.5) for (let tx = Math.floor((p.x + 2) / T); tx <= Math.floor((p.x + 9) / T); tx++) if (solid(tx, r) || tileAt(tx, r) === 7) return true;
    const cx = p.x + 6, ctx2 = Math.floor(cx / T);
    for (let ty = Math.floor(feet / T) - 1; ty <= Math.floor(feet / T) + 1; ty++) { const s = slopeSurfaceY(ctx2, ty, cx); if (s != null && Math.abs(feet - s) <= 3) return true; }
    if (L.tw && L.tw.movers) for (const m of L.tw.movers) if (p.x + 10 > m.x && p.x + 2 < m.x + m.w && Math.abs(feet - m.y) <= 3) return true;
    return false;
  };
  const allowed = (p, hgt) => {
    if (p.s2swim || p.s2climb || p.s2leap) return true;
    if (L.s2 && (P.s2warp || s2InWater(p.x + 6, p.y + hgt / 2))) return true;
    return false;
  };
  const inPit = (p, hgt) => {
    if (p.y + hgt > ROWS * T + 8) return true;
    if (L.s2) for (const Z of L.s2.hazards) if (p.x + 6 > Z.x0 && p.x + 6 < Z.x1 && p.y + hgt > Z.y0 + 2) return true;
    return false;
  };
  R.begin = (id) => { refresh(); R.on = true; R.id = id; R.pets = {}; R.turns = []; R.f = 0; R.prevP = { x: P.x, y: P.y }; R.prevFace = P.face; R.cleared = false; };
  R.sample = () => {
    if (!R.on) return;
    refresh();
    if (!P || !L) return;
    R.f++;
    const kdx = P.x - R.prevP.x;
    R.prevP = { x: P.x, y: P.y };
    const limit = Math.max(KTOP, Math.abs(kdx)) + 1;
    if (P.face !== R.prevFace && R.prevFace) R.turns.push({ at: R.f, max: {} });
    R.prevFace = P.face;
    const list = pets.cats.map((c) => [c, 'cat', 10]).concat(pets.dogs.map((d) => [d, 'dog', 11]));
    for (const [p, kind, hgt] of list) {
      const key = kind + ':' + p.id;
      let S = R.pets[key];
      if (!S) S = R.pets[key] = { id: p.id, kind, frames: 0, inWallFrames: 0, floatingFrames: 0, speedSpikes: 0, pitFrames: 0, pitEvents: 0, poofs: 0, offscreen: 0, faceFlips: 0, dist: [], prev: null, pend: null, inPitPrev: false, firstBad: [] };
      S.frames++;
      const cur = { x: p.x, y: p.y, face: p.face };
      const bad = (what) => { if (S.firstBad.length < 6) S.firstBad.push(`${what} f${R.f} pet(${Math.round(p.x)},${Math.round(p.y)}) kinan(${Math.round(P.x)},${Math.round(P.y)}${P.onGround ? ' ground' : ' air'})`); };
      if (S.prev) {
        const dx = p.x - S.prev.x, dy = p.y - S.prev.y, ddy = dy - S.prev.dy;
        cur.dy = dy;
        /* a poof: one big step (12 px or more across, or 24 up or down) that ends at rest (the next frame moves no faster
           than Kinan). A slide (the old lerp) is big steps one after another: those count as speed spikes */
        if (S.pend) { if (Math.abs(dx) <= limit && Math.abs(dy) <= 12) S.poofs++; else { S.speedSpikes += 1; bad('spike(big step)'); } S.pend = null; }
        const big = Math.abs(dx) >= 12 || Math.abs(dy) >= 24;
        if (big) S.pend = true;
        else if (Math.abs(dx) > limit) { S.speedSpikes++; bad('spike dx=' + dx.toFixed(1)); }
        for (const T0 of R.turns) if (R.f - T0.at <= 40 && !big) T0.max[key] = Math.max(T0.max[key] || 0, Math.abs(dx));
        if (box(p, hgt)) { S.inWallFrames++; bad('in-wall'); }
        const pit = inPit(p, hgt);
        if (pit) { S.pitFrames++; if (!S.inPitPrev) { S.pitEvents++; bad('pit'); } }
        S.inPitPrev = pit;
        if (!big && !pit && !supported(p, hgt) && !allowed(p, hgt)) {
          const arc = ddy >= 0.1 || dy >= 5 || (dy < 0 && S.prev.dy >= -0.01);   /* gravity pulling it down, a fast fall, or the take-off frame */
          if (!arc) { S.floatingFrames++; bad('floating dy=' + dy.toFixed(2)); }
        }
        if ((cur.face || 1) !== (S.prev.face || 1)) S.faceFlips++;
      } else cur.dy = 0;
      if (p.x + 12 < camX - 8 || p.x > camX + W + 8) S.offscreen++;
      S.dist.push(Math.abs(p.x + 6 - (P.x + P.w / 2)));
      S.prev = cur;
    }
    if (R.shots && R.shots.at.indexOf(R.f) >= 0) {   /* a frame for the strip */
      draw();
      const k = R.shots.n++, cols = R.shots.cols, tw = R.shots.tw, th = R.shots.th;
      const g = R.sheet.getContext('2d'), x = (k % cols) * tw, y = Math.floor(k / cols) * (th + 14) + 26;
      g.imageSmoothingEnabled = false;
      /* zoomed in on Kinan: a 216 x 120 piece of the picture around him, drawn twice as big; a yellow mark over the cat, a blue one over the dog */
      const sc = cv.width / W, cw = tw / 2, ch = th / 2, H0 = cv.height / sc;
      const sx = Math.max(0, Math.min(W - cw, P.x - camX + P.w / 2 - cw / 2)), sy = Math.max(0, Math.min(H0 - ch, P.y - (camY || 0) - ch * 0.55));
      g.drawImage(cv, sx * sc, sy * sc, cw * sc, ch * sc, x, y, tw, th);
      const mark = (p, col) => { const mx = x + (p.x + 6 - camX - sx) * 2, my = y + (p.y - (camY || 0) - sy) * 2 - 8; if (mx < x || mx > x + tw || my < y || my > y + th) return; g.fillStyle = col; g.beginPath(); g.moveTo(mx - 5, my - 7); g.lineTo(mx + 5, my - 7); g.lineTo(mx, my); g.fill(); };
      pets.cats.forEach((c) => mark(c, '#ffe14a')); pets.dogs.forEach((d) => mark(d, '#4ad8ff'));
      g.fillStyle = '#000'; g.fillRect(x, y + th, tw, 14);
      g.fillStyle = '#fff'; g.font = '11px monospace'; g.fillText(R.shots.label(R.f), x + 4, y + th + 11);
    }
  };
  R.end = () => {
    R.on = false;
    const out = { turns: R.turns.length, pets: [] };
    for (const key of Object.keys(R.pets)) {
      const S = R.pets[key], d = S.dist.slice().sort((a, b) => a - b);
      let tmax = 0;
      for (const T0 of R.turns) tmax = Math.max(tmax, T0.max[key] || 0);
      out.pets.push({ id: S.id, kind: S.kind, frames: S.frames, inWallFrames: S.inWallFrames, floatingFrames: S.floatingFrames, speedSpikes: S.speedSpikes,
        turnMaxDx: Math.round(tmax * 100) / 100, pitFrames: S.pitFrames, pitEvents: S.pitEvents, poofs: S.poofs, offscreenFrames: S.offscreen, faceFlips: S.faceFlips,
        medianDist: Math.round(d[Math.floor(d.length / 2)] || 0), p90Dist: Math.round(d[Math.floor(d.length * 0.9)] || 0), firstBad: S.firstBad });
    }
    return out;
  };
  w.__k11.petProbe(() => R.sample());
}

/* one level, start to end of the script, in one synchronous go (the page's own clock can't step in between) */
function pageRunLevel(a) {
  const k = window.__k11, R = window.__petProbe, G = () => k.petWorld();
  const progress = G().progress, input = G().input, update = G().update;
  progress.pets.ids = ['cat1', 'dog1', 'cat2', 'dog2', 'cat3', 'cat4'];
  progress.pets.equippedCat = a.cat; progress.pets.equippedDog = a.dog; progress.pets.soloCat = false; progress.pets.soloDog = false;
  window.__petSeed(a.seed);
  const info = k.playLevel(a.id);
  if (!info) return { error: 'level did not load: ' + JSON.stringify(k.levelProblems()) };
  k.godMode(); k.storyStop(); k.freeze(false);
  G().setFrame(0);
  window.__petSeed(a.seed);
  R.begin(a.id);
  if (a.shots) {
    R.shots = { at: a.shots.at, n: 0, cols: a.shots.cols, tw: a.shots.tw, th: a.shots.th, label: (f) => a.id + '  frame ' + f + '  ' + (a.shots.names[f] || '') };
    const rows = Math.ceil(a.shots.at.length / a.shots.cols);
    R.sheet = document.createElement('canvas'); R.sheet.width = a.shots.cols * a.shots.tw; R.sheet.height = rows * (a.shots.th + 14) + 26;
    const g = R.sheet.getContext('2d'); g.fillStyle = '#111'; g.fillRect(0, 0, R.sheet.width, R.sheet.height);
    g.fillStyle = '#fff'; g.font = 'bold 14px sans-serif'; g.fillText(a.shots.title, 8, 18);
  } else R.shots = null;
  const setKeys = (h) => {
    input.left = !!h.left; input.right = !!h.right; input.jump = !!h.jump; input.fireHeld = false; input.runHeld = false; input.down = false;
    if (h.tapJump) input.jumpBuf = 8;
  };
  let frames = 0;
  for (const [kind, n, h] of a.script) {
    const { L, P } = G();
    if (!L || L.cleared || !P || L.explorer) break;
    if (kind === 'auto') { k.auto(n, { run: true }); frames += n; continue; }
    for (let i = 0; i < n; i++) { setKeys(h || {}); update(1 / 60); frames++; }
    setKeys({});
  }
  const out = R.end();
  out.frames = frames; out.cleared = !!(G().L && G().L.cleared); out.deaths = G().deaths;
  if (a.shots) { out.sheet = R.sheet.toDataURL('image/png'); R.shots = null; R.sheet = null; }
  k.freeze(true);
  return out;
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
async function main() {
  const only = argVal('--levels') ? argVal('--levels').split(',') : null;
  const stripsDir = argVal('--strips') ? resolve(argVal('--strips')) : null;
  const levels = only || LEVELS;
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
    const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
    await page.goto(`http://127.0.0.1:${PORT}/index.html?devtools=1`);
    await page.waitForFunction(() => !!window.__k11 && window.KinanLevels && window.KinanLevels.ready, null, { timeout: 30000 });
    await page.addScriptTag({ content: `(${pageInstall.toString()})(${JSON.stringify({ KINAN_TOP })});
window.__petRunLevel = ${pageRunLevel.toString()};` });
    if (!(await page.evaluate(() => !!window.__petProbe))) throw new Error('the probe could not hook the pets (is __k11.petProbe in index.html?)');
    const results = {};
    const STRIP_LEVELS = { '7-7': 'World 7-7', '13-1': 'Season 2: 13-1' };
    for (let n = 0; n < levels.length; n++) {
      const id = levels[n], pair = PAIRS[n % PAIRS.length];
      const script = SCRIPT.concat(SCRIPT).map((s) => s.slice());   /* the script twice: about a minute of play per level */
      if (/castle|fort/.test(id)) script.push(['auto', CASTLE_EXTRA]);
      let shots = null;
      if (stripsDir && STRIP_LEVELS[id]) {
        /* the first stop-and-turn-around (frames 240-420: stop, walk back, turn again) and a jump on the run, every 6 frames */
        const at = [], names = {};
        for (let f = 270; f <= 420; f += 6) { at.push(f); names[f] = f < 280 ? 'stopped' : f < 330 ? 'turned back' : f < 355 ? 'stopped' : 'turned again'; }
        shots = { at, names, cols: 4, tw: 432, th: 240, title: `${STRIP_LEVELS[id]} (${process.env.PET_PROBE_LABEL || 'this code'}): Kinan stops, turns back, stops, turns again. Every 6th frame, zoomed on Kinan. Yellow mark = cat, blue mark = dog.` };
      }
      const r = await page.evaluate((a) => window.__petRunLevel(a), { id, cat: pair[0], dog: pair[1], seed: 1000 + n, script, shots });
      if (r.error) throw new Error(`${id}: ${r.error}`);
      if (r.sheet) {
        mkdirSync(stripsDir, { recursive: true });
        const file = join(stripsDir, `strip-${id}-${process.env.PET_PROBE_LABEL || 'run'}.png`);
        writeFileSync(file, Buffer.from(r.sheet.split(',')[1], 'base64'));
        delete r.sheet;
        console.log(`  strip saved: ${relative(ROOT, file)}`);
      }
      results[id] = r;
      const pp = r.pets.map((p) => `${p.kind} wall ${p.inWallFrames} float ${p.floatingFrames} spikes ${p.speedSpikes} turn ${p.turnMaxDx} pit ${p.pitFrames} poofs ${p.poofs} dist ${p.medianDist}`).join(' | ');
      console.log(`${id.padEnd(9)} ${String(r.frames).padStart(5)} frames  ${pp}`);
    }
    const after = hashes();
    if (JSON.stringify(after) !== JSON.stringify(before)) throw new Error('the code changed while the probe ran: results not saved');
    const tot = totals(results), fails = judge(tot);
    const out = { tool: 'tools/pet-probe.mjs', when: new Date().toISOString(), seconds: Math.round((Date.now() - t0) / 1000), partial: !!only, hashes: after,
      thresholds: THRESHOLDS, totals: tot, pass: fails.length === 0, failures: fails, pageErrors: errors, levels: results };
    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify(out, null, 1));
    console.log(`\nsaved ${relative(ROOT, OUT)} in ${out.seconds}s (${levels.length} levels${only ? ', PARTIAL' : ''})`);
    console.log('totals: ' + JSON.stringify(tot));
    if (errors.length) console.log('page errors: ' + errors.slice(0, 5).join(' | '));
    if (fails.length) { console.log('FAIL:\n  ' + fails.join('\n  ')); process.exitCode = 1; } else console.log('PASS: every pet threshold holds');
    if (errors.length) process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
}
main().catch((e) => { console.error(e); process.exitCode = 1; });

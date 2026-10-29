#!/usr/bin/env node
/* Finds quiet spots for a taekwondo BOARD NOOK (docs/LEVEL-AUTHORING.md §4.3 `board`): a 6-wide ledge two
   tiles above flat floor (Kinan walks under it, so it never blocks the main path) with a board on it and
   candles sealed behind it. A spot is listed when the floor is flat and pit-free around it, the cells the
   nook and its approach use are empty, and no foe stands near (the dev bot jumps at foes).
     node tools/board-spots.mjs [world ...]      e.g. node tools/board-spots.mjs 2 3
   Prints: level id, area index, local column c, floor row R. The nook for (c, R):
     solid [c, R-3, c+5, R-3] (the ledge) · solid [c+2, R-5, c+5, R-5] (the roof) · solid [c+5, R-4, c+5, R-4] (the back wall)
     board [c+2, R-4] · candles [c+3, R-4], [c+4, R-4] */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { levelFiles } from './levels-manifest.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const want = process.argv.slice(2).map(Number).filter(Boolean);
const ctx = { console };
ctx.self = ctx;
vm.createContext(ctx);
vm.runInContext(readFileSync(join(ROOT, 'levels', 'registry.js'), 'utf8'), ctx);
for (const f of levelFiles()) vm.runInContext(readFileSync(join(ROOT, 'levels', f), 'utf8'), ctx);
const K = ctx.KinanLevels;
const STD = new Set(['id', 'world', 'slot', 'kind', 'name', 'theme', 'cols', 'heights', 'solid', 'deck', 'fakeWall', 'tiles', 'pipes', 'foes', 'candles', 'secrets',
  'goldenCandle', 'checkpoint', 'arena', 'pet', 'spawn', 'goal', 'noSecrets', 'talk', 'areas', 'toyBricks', 'rush', 'storm']);
for (const id of K.list()) {
  const def = K.get(id);
  if (want.length && want.indexOf(def.world) < 0) continue;
  const areas = def.areas || [def];
  const out = [];
  areas.forEach((a, ai) => {
    const H = a.heights, n = a.cols, used = new Set(), foeCols = [];
    const mark = (c, r) => used.add(c + ',' + r);
    for (const r of a.solid || []) for (let y = r[1]; y <= r[3]; y++) for (let c = r[0]; c <= r[2]; c++) mark(c, y);
    for (const key of Object.keys(a.tiles || {})) for (const t of a.tiles[key]) mark(t[0], t[1]);
    for (const t of a.candles || []) mark(t[0], t[1]);
    for (const t of a.pipes || []) { mark(t[0], t[1]); mark(t[0] + 1, t[1]); }
    for (const t of a.foes || []) { mark(t[0], t[1]); foeCols.push(t[0]); }
    for (const s of a.secrets || []) mark(s.col, s.row);
    for (const k of ['goldenCandle', 'checkpoint', 'goal', 'spawn']) if (a[k]) mark(a[k].col, a[k].row);
    if (a.pet) mark(a.pet.col, a.pet.row);
    if (a.deck) for (let c = a.deck[0]; c <= a.deck[1]; c++) for (let y = 0; y < 15; y++) mark(c, y);
    if (a.fakeWall) for (let c = a.fakeWall[0]; c <= a.fakeWall[1]; c++) for (let y = 0; y < 15; y++) mark(c, y);
    const extra = Object.keys(a).filter((k) => !STD.has(k));
    const arena = a.arena ? [a.arena.col - 6, a.arena.col + a.arena.cols + 1] : null;
    const spawnC = (a.spawn || def.spawn || { col: 2 }).col, goalC = a.goal ? a.goal.col : n;
    let last = -99;
    for (let c = 4; c + 9 < n; c++) {
      const h = H[c];
      if (h == null || h % 16) continue;
      const R = h / 16;
      if (R < 7) continue;
      let ok = true;
      for (let x = c - 4; x <= c + 9 && ok; x++) if (H[x] !== h) ok = false;          /* flat, no pit, a runway each side */
      for (let x = c - 1; x <= c + 6 && ok; x++) for (let y = R - 7; y <= R - 1; y++) if (used.has(x + ',' + y)) { ok = false; break; }
      if (ok && foeCols.some((fc) => fc >= c - 9 && fc <= c + 12)) ok = false;
      if (ok && arena && c + 6 >= arena[0] && c - 1 <= arena[1]) ok = false;
      if (ok && (Math.abs(c - spawnC) < 6 || Math.abs(c - goalC) < 8)) ok = false;
      if (ok && c - last >= 10) { out.push(`${id} area ${ai} c ${c} R ${R}${extra.length ? '  (twist keys: ' + extra.join(',') + ')' : ''}`); last = c; }
    }
  });
  console.log(out.length ? out.join('\n') : `${id}: no spot`);
}

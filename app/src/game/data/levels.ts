/**
 * Deterministic seeded level builder (pure, Phaser-free).
 *
 * Stages are generated from a stable stage ID, so the same stage always
 * produces the identical layout (unit-tested). Worlds 1-10 are 2D tile
 * courses: solid ground, floating platforms, coins, three stars,
 * checkpoints, hazards, enemies, and a goal flag. Boss stages are flat
 * arenas with side platforms.
 */

import type { Rect } from '../../engine/platformer';

export const TILE = 40;
export const ROWS = 15;
const GROUND_ROW = 13;

export type EntityKind =
  | 'coin'
  | 'star'
  | 'enemy'
  | 'checkpoint'
  | 'goal'
  | 'boss'
  | 'food';

export interface LevelEntity {
  kind: EntityKind;
  x: number;
  y: number;
}

export interface LevelData {
  id: string;
  cols: number;
  rows: number;
  tileSize: number;
  pixelWidth: number;
  pixelHeight: number;
  solids: Rect[];
  spikes: Rect[];
  spawn: { x: number; y: number };
  entities: LevelEntity[];
  isBoss: boolean;
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface BuildLevelOptions {
  isBoss: boolean;
  /** 0-based stage order inside a world; scales layout difficulty. */
  difficulty: number;
}

export function buildLevel(
  stageId: string,
  opts: BuildLevelOptions,
): LevelData {
  const rnd = mulberry32(hashString(stageId));
  const difficulty = Math.max(0, Math.min(5, opts.difficulty));
  const cols = opts.isBoss ? 60 : 92 + difficulty * 8;

  const grid: string[][] = [];
  for (let r = 0; r < ROWS; r++) grid.push(new Array<string>(cols).fill(' '));
  for (let c = 0; c < cols; c++) {
    grid[GROUND_ROW][c] = '#';
    grid[GROUND_ROW + 1][c] = '#';
  }

  const setTile = (c: number, r: number, ch: string): void => {
    if (c < 0 || c >= cols || r < 0 || r >= ROWS) return;
    grid[r][c] = ch;
  };

  if (opts.isBoss) {
    /* flat arena with two side platform pairs */
    for (let c = 3; c <= 10; c++) setTile(c, 10, '#');
    for (let c = cols - 11; c <= cols - 4; c++) setTile(c, 10, '#');
    for (let c = 13; c <= 19; c++) setTile(c, 7, '#');
    for (let c = cols - 20; c <= cols - 14; c++) setTile(c, 7, '#');
    for (let c = 5; c <= 9; c++) setTile(c, 9, 'o');
    for (let c = cols - 10; c <= cols - 6; c++) setTile(c, 9, 'o');
    setTile(16, 6, '*');
    setTile(cols - 17, 6, '*');
    setTile(Math.floor(cols / 2), GROUND_ROW - 2, '*');
    setTile(3, GROUND_ROW - 1, 'p');
    setTile(Math.floor(cols * 0.68), GROUND_ROW - 1, 'b');
    setTile(cols - 4, GROUND_ROW - 1, 'g');
  } else {
    /* pits with coin arcs */
    const pitCount = 3 + difficulty;
    for (let i = 0; i < pitCount; i++) {
      const start = 16 + Math.floor(rnd() * (cols - 34));
      const width = 2 + Math.floor(rnd() * (1 + Math.min(2, difficulty)));
      for (let c = start; c < start + width && c < cols - 12; c++) {
        setTile(c, GROUND_ROW, ' ');
        setTile(c, GROUND_ROW + 1, ' ');
        setTile(c, GROUND_ROW - 2, 'o');
      }
    }

    /* floating platforms with coin runs */
    const platformCount = 7 + difficulty * 2;
    const platformTops: number[] = [];
    for (let i = 0; i < platformCount; i++) {
      const px = 10 + Math.floor(rnd() * (cols - 24));
      const py = 7 + Math.floor(rnd() * 5);
      const len = 3 + Math.floor(rnd() * 4);
      for (let c = px; c < px + len; c++) setTile(c, py, '#');
      for (let c = px; c < px + len; c += 2) setTile(c, py - 1, 'o');
      platformTops.push(py);
    }

    /* spikes on open ground */
    for (let i = 0; i < 2 + difficulty; i++) {
      const sx = 22 + Math.floor(rnd() * (cols - 44));
      if (grid[GROUND_ROW - 1][sx] === ' ') setTile(sx, GROUND_ROW - 1, '^');
    }

    /* patrolling enemies */
    for (let i = 0; i < 4 + difficulty; i++) {
      const ex = 18 + Math.floor(rnd() * (cols - 36));
      if (grid[GROUND_ROW - 1][ex] === ' ' && grid[GROUND_ROW][ex] === '#') {
        setTile(ex, GROUND_ROW - 1, 'e');
      }
    }

    /* healing snacks */
    for (let i = 0; i < 1 + (difficulty >= 2 ? 1 : 0); i++) {
      const fx = 30 + Math.floor(rnd() * (cols - 50));
      if (grid[GROUND_ROW - 1][fx] === ' ') setTile(fx, GROUND_ROW - 1, 'f');
    }

    /* three stars: above the highest platform, mid-air, before the goal.
       placeStar nudges upward so a star never overwrites solid geometry. */
    const highY = platformTops.length > 0 ? Math.min(...platformTops) : 7;
    const placeStar = (c: number, r0: number): void => {
      let r = r0;
      while (r > 1 && grid[r][c] === '#') r--;
      setTile(c, r, '*');
    };
    placeStar(Math.floor(cols * 0.3), highY - 1);
    placeStar(Math.floor(cols * 0.55), 8);
    placeStar(Math.floor(cols * 0.82), 9);

    /* checkpoint mid-stage, spawn and goal */
    setTile(Math.floor(cols * 0.5), GROUND_ROW - 1, 'c');
    setTile(3, GROUND_ROW - 1, 'p');
    setTile(cols - 4, GROUND_ROW - 1, 'g');
  }

  return gridToLevel(stageId, grid, opts.isBoss);
}

function gridToLevel(
  id: string,
  grid: string[][],
  isBoss: boolean,
): LevelData {
  const solids: Rect[] = [];
  const spikes: Rect[] = [];
  const entities: LevelEntity[] = [];
  let spawn = { x: 3 * TILE + TILE / 2, y: (GROUND_ROW - 1) * TILE };

  for (let r = 0; r < grid.length; r++) {
    /* merge horizontal solid runs into one rect */
    let runStart = -1;
    for (let c = 0; c <= grid[r].length; c++) {
      const solid = c < grid[r].length && grid[r][c] === '#';
      if (solid && runStart < 0) runStart = c;
      if (!solid && runStart >= 0) {
        solids.push({
          x: runStart * TILE,
          y: r * TILE,
          w: (c - runStart) * TILE,
          h: TILE,
        });
        runStart = -1;
      }
    }

    for (let c = 0; c < grid[r].length; c++) {
      const ch = grid[r][c];
      const x = c * TILE + TILE / 2;
      const y = r * TILE + TILE / 2;
      if (ch === '^') spikes.push({ x: c * TILE, y: r * TILE, w: TILE, h: TILE });
      else if (ch === 'o') entities.push({ kind: 'coin', x, y });
      else if (ch === '*') entities.push({ kind: 'star', x, y });
      else if (ch === 'e') entities.push({ kind: 'enemy', x, y });
      else if (ch === 'f') entities.push({ kind: 'food', x, y });
      else if (ch === 'c') entities.push({ kind: 'checkpoint', x, y });
      else if (ch === 'g') entities.push({ kind: 'goal', x, y });
      else if (ch === 'b') entities.push({ kind: 'boss', x, y });
      else if (ch === 'p') spawn = { x, y: y - 6 };
    }
  }

  return {
    id,
    cols: grid[0].length,
    rows: grid.length,
    tileSize: TILE,
    pixelWidth: grid[0].length * TILE,
    pixelHeight: grid.length * TILE,
    solids,
    spikes,
    spawn,
    entities,
    isBoss,
  };
}
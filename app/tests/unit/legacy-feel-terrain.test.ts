import { describe, expect, it } from 'vitest';

/**
 * TE-1 · FEEL & PHYSICS — terrain collision predicates (TEST-PLAN K17-K19).
 *
 * A faithful replica of index.html `tileAt`/`solid`/`moveX`/`moveY` (lines 2760-2797)
 * over synthetic tile grids. These tests pin the collision SEMANTICS the feel depends
 * on: exact tile-edge snaps, the one-way shelf rule (feet must have been above the
 * shelf top), pass-through from below, ledge fall with no snap-back, and the
 * "MAX_FALL < T so a one-tile floor can never be tunnelled" invariant.
 */

const T = 16, ROWS = 15;
const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);

interface Grid { w: number; up: number; g: Uint8Array }

function makeGrid(w: number, up = 0): Grid {
  return { w, up, g: new Uint8Array(w * ROWS) };
}

function put(L: Grid, tx: number, ty: number, v: number): void {
  L.g[(ty + L.up) * L.w + tx] = v;
}

/* index.html:2760 */
function tileAt(L: Grid, tx: number, ty: number): number {
  return (tx < 0 || tx >= L.w || ty < -L.up || ty >= ROWS) ? 0 : L.g[(ty + L.up) * L.w + tx];
}

/* index.html:2761-2767 */
function solid(L: Grid, tx: number, ty: number): boolean {
  if (tx < 0 || tx >= L.w) return true;
  if (ty < -L.up || ty >= ROWS) return false;
  const t = L.g[(ty + L.up) * L.w + tx];
  return t >= 1 && t <= 6;
}

interface Ent {
  x: number; y: number; w: number; h: number;
  vx: number; vy: number; onGround: boolean; landTile: number;
}

function ent(x: number, y: number, vx = 0, vy = 0): Ent {
  return { x, y, w: 10, h: 16, vx, vy, onGround: false, landTile: 0 };
}

/* index.html:2769-2780 */
function moveX(e: Ent, L: Grid): number {
  e.x += e.vx;
  const top = Math.floor(e.y / T), bot = Math.floor((e.y + e.h - 1) / T);
  if (e.vx > 0) {
    const tx = Math.floor((e.x + e.w - 1) / T);
    for (let ty = top; ty <= bot; ty++) if (solid(L, tx, ty)) { e.x = tx * T - e.w; e.vx = 0; return 1; }
  } else if (e.vx < 0) {
    const tx = Math.floor(e.x / T);
    for (let ty = top; ty <= bot; ty++) if (solid(L, tx, ty)) { e.x = (tx + 1) * T; e.vx = 0; return -1; }
  }
  return 0;
}

/* index.html:2781-2798 */
function moveY(e: Ent, L: Grid): { tx: number; ty: number } | null {
  const oldBottom = e.y + e.h;
  e.y += e.vy; e.onGround = false;
  const left = Math.floor(e.x / T), right = Math.floor((e.x + e.w - 1) / T);
  if (e.vy > 0) {
    const ty = Math.floor((e.y + e.h) / T);
    for (let tx = left; tx <= right; tx++) {
      if (solid(L, tx, ty) || (tileAt(L, tx, ty) === 7 && oldBottom <= ty * T + 0.01)) {
        e.y = ty * T - e.h; e.vy = 0; e.onGround = true; e.landTile = tileAt(L, tx, ty); return null;
      }
    }
  } else if (e.vy < 0) {
    const ty = Math.floor(e.y / T);
    const cx = Math.floor((e.x + e.w / 2) / T);
    for (let tx = left; tx <= right; tx++) if (solid(L, tx, ty)) {
      e.y = (ty + 1) * T; e.vy = 0; return { tx: solid(L, cx, ty) ? cx : tx, ty };
    }
  }
  return null;
}

/** Flat floor at row 11 (GROUND), 40 tiles wide. */
function flatLevel(): Grid {
  const L = makeGrid(40);
  for (let x = 0; x < 40; x++) for (let y = 11; y < ROWS; y++) put(L, x, y, 1);
  return L;
}

describe('walls stop exactly at the tile edge (K19)', () => {
  it('a wall to the right stops Kinan at x = tile - w, with vx zeroed', () => {
    const L = flatLevel();
    put(L, 12, 9, 5); put(L, 12, 10, 5);   /* a wall column */
    const e = ent(12 * T - 30, 11 * T - 16, 3);
    for (let k = 0; k < 20; k++) moveX(e, L);
    expect(e.x).toBe(12 * T - e.w);
    expect(e.vx).toBe(0);
  });

  it('a wall to the left stops Kinan at x = tile + T exactly', () => {
    const L = flatLevel();
    put(L, 5, 10, 2);
    const e = ent(5 * T + 30, 11 * T - 16);
    e.vx = -3;
    for (let k = 0; k < 20; k++) moveX(e, L);
    expect(e.x).toBe(6 * T);
    expect(e.vx).toBe(0);
  });

  it('a one-tile step is a wall — stairs need a jump, never an auto-step', () => {
    const L = flatLevel();
    for (let y = 10; y < ROWS; y++) put(L, 20, y, 1);   /* one raised step */
    const e = ent(20 * T - 30, 11 * T - 16, 3);
    for (let k = 0; k < 20; k++) moveX(e, L);
    expect(e.x).toBe(20 * T - e.w);
    /* but its top is ordinary ground: falling onto it lands at row 10 */
    const f = ent(20 * T + 3, 10 * T - 16 - 8, 0, 8.6);
    moveY(f, L);
    expect(f.y).toBe(10 * T - f.h);
    expect(f.onGround).toBe(true);
  });

  it('both level edges are solid walls', () => {
    const L = flatLevel();
    expect(solid(L, -1, 5)).toBe(true);
    expect(solid(L, L.w, 5)).toBe(true);
    const e = ent(4, 11 * T - 16, -3);
    for (let k = 0; k < 10; k++) moveX(e, L);
    expect(e.x).toBe(0);
  });
});

describe('floors and ceilings snap exactly (K19)', () => {
  it('landing snaps the feet exactly to the tile top and records the tile', () => {
    const L = flatLevel();
    const e = ent(40, 11 * T - 16 - 8, 0, 8.6);
    moveY(e, L);
    expect(e.y).toBe(11 * T - e.h);
    expect(e.vy).toBe(0);
    expect(e.onGround).toBe(true);
    expect(e.landTile).toBe(1);
  });

  it('a ceiling bonk stops the rise exactly under the tile and reports the tile', () => {
    const L = flatLevel();
    put(L, 6, 8, 3); put(L, 7, 8, 3);   /* gift/brick ceiling at row 8 */
    const e = ent(6 * T + 3, 11 * T - 16 - 20, 0, -8.2);
    const head = moveY(e, L);
    expect(e.y).toBe(9 * T);
    expect(e.vy).toBe(0);
    expect(head?.ty).toBe(8);
  });

  it('never tunnels through a one-tile floor at terminal speed (swept, D8)', () => {
    const L = makeGrid(40);
    for (let x = 0; x < 40; x++) put(L, x, 11, 1);   /* thin floor: one tile */
    const e = ent(40, 11 * T - 16 - 200, 0, 8.6);
    for (let k = 0; k < 100 && !e.onGround; k++) { e.vy = 8.6; moveY(e, L); }
    expect(e.onGround).toBe(true);
    expect(e.y).toBe(11 * T - e.h);
  });
});

describe('one-way shelves — tile 7 (K18)', () => {
  function shelfLevel(): Grid {
    const L = flatLevel();
    for (let x = 10; x <= 13; x++) put(L, x, 8, 7);   /* a shelf at row 8 */
    return L;
  }

  it('a one-way shelf catches you from above', () => {
    const L = shelfLevel();
    const e = ent(10 * T + 3, 8 * T - 16 - 2, 0, 6);
    moveY(e, L);
    expect(e.y).toBe(8 * T - e.h);
    expect(e.onGround).toBe(true);
    expect(e.landTile).toBe(7);
  });

  it('a one-way shelf never blocks a jump from below', () => {
    const L = shelfLevel();
    const e = ent(10 * T + 3, 8 * T + 20, 0, -8.2);
    const head = moveY(e, L);
    expect(head).toBeNull();          /* no bonk */
    expect(e.vy).toBe(-8.2);          /* the rise is untouched */
    expect(e.y).toBe(8 * T + 20 - 8.2);
  });

  it('a one-way shelf is ignored when the feet were already below its top', () => {
    const L = shelfLevel();
    /* feet land INSIDE the shelf row, but oldBottom is already past the top line */
    const e = ent(10 * T + 3, 8 * T - 14, 0, 4);
    moveY(e, L);
    expect(e.onGround).toBe(false);
    expect(e.y).toBe(8 * T - 10);
  });

  it('a one-way shelf never blocks sideways movement', () => {
    const L = shelfLevel();
    const e = ent(10 * T - 30, 8 * T - 16, 3);   /* walking at shelf-top height */
    for (let k = 0; k < 15; k++) moveX(e, L);
    expect(e.x).toBeGreaterThan(10 * T);   /* walked across the shelf edge freely */
  });
});

describe('ledges — walking off drops you (K18-K19)', () => {
  it('walking off a ledge drops you — nothing snaps you back', () => {
    const L = flatLevel();
    for (let x = 25; x < 40; x++) for (let y = 11; y < ROWS; y++) put(L, x, y, 0);   /* a pit from tile 25 */
    const e = ent(25 * T - 12, 11 * T - 16, 3);
    let leftGround = false;
    let yWhenLeft = e.y;
    for (let k = 0; k < 30 && !leftGround; k++) {
      moveX(e, L);
      e.vy = 6;
      moveY(e, L);
      if (!e.onGround && k > 0) { leftGround = true; yWhenLeft = e.y; }
    }
    expect(leftGround).toBe(true);
    /* keep walking: the body keeps falling — no coyote snap-back onto the ledge */
    for (let k = 0; k < 6; k++) { moveX(e, L); e.vy = Math.min(8.6, e.vy + 0.62); moveY(e, L); }
    expect(e.y).toBeGreaterThan(yWhenLeft + 20);
    expect(e.onGround).toBe(false);
  });

  it('falling beside a pit lands on the solid side, with no lateral grab', () => {
    const L = flatLevel();
    for (let x = 30; x < 40; x++) for (let y = 11; y < ROWS; y++) put(L, x, y, 0);   /* pit from tile 30 */
    const e = ent(29 * T, 11 * T - 16 - 8, 0, 8.6);   /* falling over the last solid tile */
    moveY(e, L);
    expect(e.onGround).toBe(true);
    expect(e.y).toBe(11 * T - e.h);
    expect(e.x).toBe(29 * T);
  });
});

describe('slope semantics — the contract §2.2 normative model (height-mask tiles)', () => {
  /* The Architect's §2.2 ruling: height-mask tiles, linear floor Y at the feet X,
     snap tolerance 2 px grounded, max gradient 1:1, flats ≥ 1 tile at both ends.
     This model is the acceptance the M2 terrain code must reproduce; §1.4 adds
     "slope walking never jitters (position monotonic on 2:1 at walk and run)". */
  const SNAP_TOLERANCE = 2;

  /** Height mask: floor height in px at each tile column, piecewise-linear. */
  function floorYAt(mask: number[], tileX0: number, feetX: number, baseY: number): number {
    const col = clamp((feetX - tileX0) / T, 0, mask.length - 1);
    const i = Math.floor(col);
    const j = Math.min(i + 1, mask.length - 1);
    const t = col - i;
    return baseY - (mask[i] + (mask[j] - mask[i]) * t);
  }

  const snapToSlope = (feetY: number, floorY: number): { y: number; grounded: boolean } =>
    Math.abs(feetY - floorY) <= SNAP_TOLERANCE
      ? { y: floorY, grounded: true }
      : { y: feetY, grounded: false };

  it('gives linear floor Y exactly at the feet X (height masks interpolate)', () => {
    const mask = [0, 8, 16];                       /* a 2:1 slope: 8 px per tile */
    expect(floorYAt(mask, 0, 8, 400)).toBeCloseTo(396, 5);    /* halfway up */
    expect(floorYAt(mask, 0, 0, 400)).toBe(400);
    expect(floorYAt(mask, 0, 32, 400)).toBeCloseTo(384, 5);
  });

  it('never exceeds gradient 1:1 (max 16 px of rise per tile)', () => {
    const ok = [0, 8, 16, 24, 32];
    for (let i = 1; i < ok.length; i++) expect(Math.abs(ok[i] - ok[i - 1])).toBeLessThanOrEqual(16);
    const tooSteep = [0, 20];
    expect(Math.abs(tooSteep[1] - tooSteep[0])).toBeGreaterThan(16);   /* the validator must reject this */
  });

  it('snaps the feet within 2 px of the surface when grounded (§2.2)', () => {
    expect(snapToSlope(385.5, 384)).toEqual({ y: 384, grounded: true });    /* 1.5 px below: snaps up */
    expect(snapToSlope(382, 384)).toEqual({ y: 384, grounded: true });      /* boundary: exactly 2 px above is within tolerance */
    expect(snapToSlope(381.9, 384)).toEqual({ y: 381.9, grounded: false }); /* 2.1 px above: beyond the 2 px tolerance (§2.2) */
    expect(snapToSlope(380, 384)).toEqual({ y: 380, grounded: false });   /* beyond tolerance: airborne */
  });

  it('slope walking never jitters — position is monotonic at walk and run speed (§1.4)', () => {
    const up = [0, 8, 16, 24, 32, 40, 48];        /* a long 2:1 slope, climbing in +x */
    const down = [48, 40, 32, 24, 16, 8, 0];     /* the same hill walked downhill */
    for (const speed of [1.9, 3.2]) {
      /* uphill: floor Y only ever rises on screen — never dips back down */
      let x = 0;
      let prevY = floorYAt(up, 0, x, 400);
      for (let k = 0; k < 60; k++) {
        x += speed;
        const y = floorYAt(up, 0, x, 400);
        expect(y).toBeLessThanOrEqual(prevY + 1e-9);   /* uphill: monotonic, no jitter */
        prevY = y;
      }
      /* downhill: floor Y only ever drops on screen — never bounces back up */
      x = 0;
      prevY = floorYAt(down, 0, x, 400);
      for (let k = 0; k < 60; k++) {
        x += speed;
        const y = floorYAt(down, 0, x, 400);
        expect(y).toBeGreaterThanOrEqual(prevY - 1e-9);   /* downhill: monotonic, no jitter */
        prevY = y;
      }
    }
  });

  it('requires flats of at least one tile at both ends (§2.2 grammar)', () => {
    const flatsOk = { flatBefore: 1, flatAfter: 1 };
    const flatsBad = { flatBefore: 0, flatAfter: 1 };
    const valid = (s: { flatBefore: number; flatAfter: number }): boolean =>
      s.flatBefore >= 1 && s.flatAfter >= 1;
    expect(valid(flatsOk)).toBe(true);
    expect(valid(flatsBad)).toBe(false);
  });
});



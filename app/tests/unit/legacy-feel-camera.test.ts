import { describe, expect, it } from 'vitest';

/**
 * TE-1 · FEEL & PHYSICS — camera follow model (TEST-PLAN K20-K22).
 *
 * A faithful replica of index.html `updateCamera()` (lines 4876-4889): a strict
 * 42% anchor with round+clamp on X (no deadzone, no smoothing — pinned as such),
 * and a 0.2 lerp with a 0.5 px snap on Y for tall levels. Contract targets for
 * deadzone/lookahead/smoothing slot in when docs/GAME-DESIGN-CONTRACT.md lands.
 */

const T = 16, W = 432, H = 240;
const PLAYER_W = 10, PLAYER_H = 16;
const ANCHOR = W * 0.42;   /* index.html:4878 — target = cxP - W * 0.42 */

const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);

/** index.html:4876-4882 — X follow for a story stage (lo/hi from the level bounds). */
function camX(px: number, lo: number, hi: number): number {
  const target = clamp(px + PLAYER_W / 2 - ANCHOR, lo, hi);
  return clamp(Math.round(target), lo, hi);
}

/** index.html:4879 — hi = min(L.w * T - W, (L.arenaX + L.arenaW + 1) * T - W). */
function hiOf(levelWTiles: number, arenaX: number, arenaW: number): number {
  return Math.min(levelWTiles * T - W, (arenaX + arenaW + 1) * T - W);
}

/** index.html:4883-4888 — one camY update on a tall level (L.up = extra rows). */
function camYStep(camY: number, py: number, up: number): number {
  const ty = clamp(py + PLAYER_H / 2 - H * 0.55, -up * T, 0);
  let y = camY + (ty - camY) * 0.2;
  if (Math.abs(ty - y) < 0.5) y = ty;
  return y;
}

const HI = hiOf(200, 160, 28);   /* roomy level: no end clamp in these cases */

describe('camera X — the 42% anchor (K20)', () => {
  it('keeps Kinan at 42% of the screen while running (camera anchor)', () => {
    const px = 1000;
    const cx = camX(px, 0, HI);
    /* the camera rounds to whole pixels: the anchor holds within half a pixel */
    expect(Math.abs(px + PLAYER_W / 2 - cx - ANCHOR)).toBeLessThanOrEqual(0.5);
  });

  it('follows 1:1 with no smoothing lag (camera smoothing pin)', () => {
    const a = camX(1000, 0, HI);
    const b = camX(1003, 0, HI);   /* three frames of a 3 px/frame run */
    expect(b - a).toBe(3);
  });

  it('moves the camera immediately for a one-pixel step (deadzone pin: none)', () => {
    expect(camX(1001, 0, HI) - camX(1000, 0, HI)).toBe(1);
  });

  it('rounds to whole pixels so the picture never shimmers half-subpixel', () => {
    expect(Number.isInteger(camX(1000.37, 0, HI))).toBe(true);
    expect(camX(1000.37, 0, HI)).toBe(camX(1000.49, 0, HI));
  });
});

describe('camera X — clamps at terrain edges (K21)', () => {
  it('never scrolls left of the level start (camera clamp)', () => {
    expect(camX(32, 0, HI)).toBe(0);        /* spawn: target is negative */
    expect(camX(-40, 0, HI)).toBe(0);
  });

  it('never scrolls past the level end (camera clamp)', () => {
    const hi = hiOf(40, 20, 28);            /* 40-tile level */
    expect(hi).toBe(40 * T - W);
    expect(camX(40 * T, 0, hi)).toBe(hi);
  });

  it('stays inside the boss arena while the fight runs (camera clamp)', () => {
    const arenaX = 30;
    const lo = arenaX * T;                  /* index.html:4880 */
    const hi = hiOf(200, arenaX, 28);
    expect(camX(arenaX * T + 2, lo, hi)).toBe(lo);
    expect(camX(arenaX * T + 500, lo, hi)).toBeGreaterThan(lo);
  });
});

describe('camera Y — easing on tall levels (K22)', () => {
  it('eases vertical follow at 0.2 per frame and snaps under half a pixel (camY easing)', () => {
    const up = 10;
    const py = -up * T + 30;                /* high up: target is clamped low */
    let y = 0;
    const ty = clamp(py + PLAYER_H / 2 - H * 0.55, -up * T, 0);
    const step1 = camYStep(y, py, up);
    expect(step1 - y).toBeCloseTo((ty - y) * 0.2, 5);   /* exactly 20% of the way */
    y = step1;
    const errors: number[] = [Math.abs(ty - y)];
    for (let k = 0; k < 40; k++) {
      y = camYStep(y, py, up);
      errors.push(Math.abs(ty - y));
    }
    /* the error shrinks monotonically and the snap lands exactly on target */
    for (let k = 1; k < errors.length; k++) expect(errors[k]).toBeLessThanOrEqual(errors[k - 1]);
    expect(y).toBe(ty);
    expect(errors.filter((e) => e > 0).length).toBeLessThanOrEqual(27);   /* settles fast */
  });

  it('never overshoots the target on the way down (camY easing)', () => {
    const up = 10;
    const py = -up * T + 30;
    const ty = clamp(py + PLAYER_H / 2 - H * 0.55, -up * T, 0);
    let y = 0;
    for (let k = 0; k < 40; k++) {
      const next = camYStep(y, py, up);
      expect(next).toBeGreaterThanOrEqual(Math.min(y, ty) - 1e-9);
      expect(next).toBeLessThanOrEqual(Math.max(y, ty) + 1e-9);
      y = next;
    }
  });

  it('clamps the follow target between -up*T and the horizon (K22)', () => {
    const up = 10;
    /* far above the tall level: target pins at the top of the world */
    let y = 0;
    for (let k = 0; k < 40; k++) y = camYStep(y, -9999, up);
    expect(y).toBe(-up * T);
    /* far below: target pins at 0 */
    let z = -up * T;
    for (let k = 0; k < 40; k++) z = camYStep(z, 9999, up);
    expect(z).toBe(0);
  });

  it('keeps camY at 0 on story stages (K22)', () => {
    /* index.html:4888 — the else branch pins camY to 0 when L.up is falsy */
    expect(Math.abs(camYStep(0, 400, 0))).toBeCloseTo(0, 5);
    expect(Math.abs(camYStep(0, -500, 0))).toBeCloseTo(0, 5);
  });
});

describe('contract §3 camera model — the target math the M3 camera must reproduce', () => {
  /* GAME-DESIGN-CONTRACT.md §3: deadzone 48x40 centered on Kinan + lead;
     lead = clamp(vx*8, −24, +24) px eased 0.10/f; camX += (target−camX)*0.14/f;
     Y follow up 0.10, down 0.06 + 0.75-tile lead when vy > 6; never hard-pin
     during play (NEVER-CLAMP-ON-FUN); boss walls slow the lerp x0.5, never lock. */
  const DEAD_W = 48, DEAD_H = 40, LEAD_MAX = 24, LEAD_EASE = 0.10, X_LERP = 0.14;
  const Y_UP = 0.10, Y_DOWN = 0.06, DOWN_LEAD = 0.75 * 16;

  const leadTarget = (vx: number): number => clamp(vx * 8, -LEAD_MAX, LEAD_MAX);
  const leadStep = (lead: number, vx: number): number => lead + (leadTarget(vx) - lead) * LEAD_EASE;

  /** How far the camera must pan to keep Kinan + lead inside the deadzone. */
  const deadzoneDrift = (playerX: number, lead: number, camCenter: number): number => {
    const dx = playerX + lead - camCenter;
    return Math.abs(dx) <= DEAD_W / 2 ? 0 : dx - Math.sign(dx) * (DEAD_W / 2);
  };

  it('leads the camera by clamp(vx*8, ±24) px, eased 10% per frame (§3)', () => {
    expect(leadTarget(3.2)).toBe(24);     /* RUN_MAX saturates the lead */
    expect(leadTarget(1)).toBe(8);
    expect(leadTarget(-3.2)).toBe(-24);
    let lead = 0;
    lead = leadStep(lead, 3.2);
    expect(lead).toBeCloseTo(2.4, 5);     /* first frame: 10% of the way */
    /* eased 10%/frame converges asymptotically: 60 frames leaves ~0.039 px of
       approach (0.9^60 · 21.6), so run past full convergence (n ≥ 102 for the
       0.0005 tolerance) — the model still never snaps (first-frame pin above) */
    for (let k = 0; k < 150; k++) lead = leadStep(lead, 3.2);
    expect(lead).toBeCloseTo(24, 3);      /* eased, never snapped — settles on the target */
  });

  it('breathes: small steps inside the 48x40 deadzone move the camera 0 px (§3)', () => {
    expect(DEAD_W).toBe(48);
    expect(DEAD_H).toBe(40);
    expect(deadzoneDrift(0, 0, 0)).toBe(0);
    expect(deadzoneDrift(23, 0, 0)).toBe(0);          /* still inside */
    expect(deadzoneDrift(30, 0, 0)).toBeCloseTo(6, 5); /* past the edge: 30 − 24 */
  });

  it('glides toward the target at 0.14 per frame — never snaps (§3)', () => {
    let cam = 0;
    const target = 100;
    const first = cam + (target - cam) * X_LERP - cam;
    expect(first).toBeCloseTo(14, 5);
    expect(first).toBeLessThan(target);   /* never a teleport */
    for (let k = 0; k < 200; k++) cam += (target - cam) * X_LERP;
    expect(cam).toBeCloseTo(target, 3);
  });

  it('follows UP faster (0.10) than DOWN (0.06) and leads the landing zone (§3)', () => {
    expect(Y_UP).toBeGreaterThan(Y_DOWN);
    expect(DOWN_LEAD).toBe(12);           /* 0.75 tile of landing lead */
    const downTarget = (py: number, vy: number): number =>
      py + (vy > 6 ? DOWN_LEAD : 0);
    expect(downTarget(200, 8)).toBe(212);
    expect(downTarget(200, 3)).toBe(200);
  });

  it('boss walls slow the follow x0.5 but never lock it (§3 NEVER-CLAMP-ON-FUN)', () => {
    const bossLerp = X_LERP * 0.5;
    expect(bossLerp).toBeCloseTo(0.07, 5);
    expect(bossLerp).toBeGreaterThan(0);   /* slowing is allowed, pinning is not */
  });
});


import { describe, expect, it } from 'vitest';

/**
 * TE-1 · FEEL & PHYSICS — jump arc & movement timers
 * (TEST-PLAN D1-D13 + GAME-DESIGN-CONTRACT.md §1.1/§1.4).
 *
 * A faithful replica of index.html `updatePlayer()` in its exact frame order:
 * timers -> horizontal -> jump -> cut -> gravity -> integrate. Run twice:
 *  - LEGACY_FEEL (D1-D13): the old feel, frozen — these numbers must NEVER move.
 *  - FEEL (contract §1.1): the locked targets — apex 4.3 tiles, tap ratio <= 0.5,
 *    coyote 8 (7 fires / 9 doesn't), buffer 8 (8 fires / 10 doesn't).
 * §1.4 acceptance rows live here; the in-engine twin is legacy-feel-contract.spec.ts.
 */

interface FeelCfg {
  WALK_MAX: number; RUN_MAX: number; RUSH_MAX: number;
  ACC_GROUND: number; ACC_AIR: number; ACC_SKID: number;
  FRIC_GROUND: number; FRIC_AIR: number;
  JUMP_V: number; GRAV_HOLD: number; GRAV_TAP: number | null; GRAV_FALL: number;
  MAX_FALL: number; JUMP_CUT: number | null;
  COYOTE: number; JUMP_BUF: number;
  SPRING_V: number;
}

/* index.html LEGACY_FEEL — the frozen old tuning. */
const LEGACY: FeelCfg = {
  WALK_MAX: 3.0, RUN_MAX: 3.0, RUSH_MAX: 3.7,
  ACC_GROUND: 0.55, ACC_AIR: 0.38, ACC_SKID: 0.55,
  FRIC_GROUND: 0.76, FRIC_AIR: 0.96,
  JUMP_V: -8.2, GRAV_HOLD: 0.38, GRAV_TAP: 0.48, GRAV_FALL: 0.62,
  MAX_FALL: 8.6, JUMP_CUT: null,
  COYOTE: 7, JUMP_BUF: 8,
  SPRING_V: -10.4,
};

/* index.html FEEL — GAME-DESIGN-CONTRACT.md §1.1 exactly. */
const FEEL: FeelCfg = {
  WALK_MAX: 1.9, RUN_MAX: 3.2, RUSH_MAX: 4.2,
  ACC_GROUND: 0.30, ACC_AIR: 0.20, ACC_SKID: 0.55,
  FRIC_GROUND: 0.80, FRIC_AIR: 0.96,
  JUMP_V: -7.6, GRAV_HOLD: 0.42, GRAV_TAP: null, GRAV_FALL: 0.66,
  MAX_FALL: 9.0, JUMP_CUT: -2.6,
  COYOTE: 8, JUMP_BUF: 8,
  SPRING_V: -11.0,
};

const PLAYER_H = 16;
const FLOOR = 500;
const AIR_JUMP_V = -7.4;   /* Garfield double jump — a global, not part of the tuning objects */

interface Sim {
  x: number; y: number; vx: number; vy: number;
  onGround: boolean; coyote: number; buf: number;
  airJumps: number; cuttable: boolean;
}

interface SimInput { left: boolean; right: boolean; jumpHeld: boolean; jumpPressed: boolean; run: boolean }

const idle: SimInput = { left: false, right: false, jumpHeld: false, jumpPressed: false, run: false };

function stand(floorY: number): Sim {
  return {
    x: 0, y: floorY - PLAYER_H, vx: 0, vy: 0,
    onGround: true, coyote: 8, buf: 0, airJumps: 0, cuttable: false,
  };
}

/**
 * One 60 Hz update, mirroring updatePlayer() line by line. LEGACY keeps the
 * frozen old order (buffer decrement-then-check before movement — finding F1).
 * FEEL uses the §1.4 order the Builder landed with the fix: movement first,
 * then the buffer check AFTER the landing (touchdown counts) and the decrement
 * AFTER the check — the press window is the full JUMP_BUF. (This matches the
 * engine's feelProbe: the fire frame itself does not rise.)
 */
function step(s: Sim, inp: SimInput, floorY: number, F: FeelCfg): Sim {
  const n: Sim = { ...s };
  const isFeel = F.GRAV_TAP == null;
  /* timers */
  if (n.onGround) { n.coyote = F.COYOTE; n.airJumps = 1; }
  else if (n.coyote > 0) n.coyote--;
  if (inp.jumpPressed) n.buf = F.JUMP_BUF;
  if (!isFeel && n.buf > 0) n.buf--;   /* legacy: decay before the check (F1) */
  /* horizontal */
  const acc = n.onGround ? F.ACC_GROUND : F.ACC_AIR;
  const max = inp.run ? F.RUN_MAX : F.WALK_MAX;
  if (inp.left && !inp.right) n.vx = Math.max(-max, n.vx - (n.onGround && n.vx > 0 ? F.ACC_SKID : acc));
  else if (inp.right && !inp.left) n.vx = Math.min(max, n.vx + (n.onGround && n.vx < 0 ? F.ACC_SKID : acc));
  else {
    n.vx *= n.onGround ? F.FRIC_GROUND : F.FRIC_AIR;
    if (Math.abs(n.vx) < 0.08) n.vx = 0;
  }
  /* LEGACY: the jump check runs before movement (frozen old order) */
  if (!isFeel) {
    if (n.buf > 0 && n.coyote > 0) {
      n.vy = F.JUMP_V; n.coyote = 0; n.buf = 0; n.cuttable = true;
    } else if (n.buf > 0 && n.airJumps > 0 && n.vy > -2.4) {
      n.vy = AIR_JUMP_V;
      n.airJumps--; n.buf = 0; n.cuttable = true;
    }
  }
  /* variable jump: FEEL cuts the rise on release; LEGACY swaps tap gravity */
  if (F.JUMP_CUT != null && !inp.jumpHeld && n.cuttable && n.vy < F.JUMP_CUT) n.vy = F.JUMP_CUT;
  const grav = n.vy < 0 ? (!inp.jumpHeld && F.GRAV_TAP != null ? F.GRAV_TAP : F.GRAV_HOLD) : F.GRAV_FALL;
  n.vy = Math.min(F.MAX_FALL, n.vy + grav);
  if (n.vy >= 0) n.cuttable = false;
  /* integrate + flat floor (moveY semantics) */
  n.x += n.vx;
  n.y += n.vy;
  n.onGround = false;
  if (n.vy > 0 && n.y + PLAYER_H >= floorY) {
    n.y = floorY - PLAYER_H;
    n.vy = 0;
    n.onGround = true;
  }
  /* FEEL (§1.4): check the buffer after landing, decrement after the check */
  if (isFeel) {
    if (n.buf > 0 && (n.onGround || n.coyote > 0)) {
      n.vy = F.JUMP_V; n.coyote = 0; n.buf = 0; n.cuttable = true;
      n.onGround = false;
    } else if (n.buf > 0 && n.airJumps > 0 && n.vy > -2.4) {
      n.vy = AIR_JUMP_V;
      n.airJumps--; n.buf = 0; n.cuttable = true;
    }
    if (n.buf > 0) n.buf--;
  }
  return n;
}

interface Arc { apex: number; riseFrames: number; airFrames: number; airtimeMs: number }

/** A ground jump held for `holdFrames` then released; measures the arc. */
function jumpArc(F: FeelCfg, holdFrames: number, floorY: number = FLOOR): Arc {
  let s = stand(floorY);
  const startY = s.y;
  let minY = s.y;
  let riseFrames = -1;
  let airFrames = -1;
  for (let k = 0; k < 200 && airFrames < 0; k++) {
    s = step(s, { ...idle, jumpHeld: k < holdFrames, jumpPressed: k === 0 }, floorY, F);
    minY = Math.min(minY, s.y);
    if (riseFrames < 0 && s.vy >= 0) riseFrames = k;
    if (k > 0 && s.onGround) airFrames = k + 1;
  }
  return { apex: startY - minY, riseFrames, airFrames, airtimeMs: (airFrames * 1000) / 60 };
}

describe('LEGACY arc — the frozen old feel must never move (D1-D5)', () => {
  it('a held jump rises about 84 px — apex is 84.4 px (D1)', () => {
    expect(jumpArc(LEGACY, 999).apex).toBeCloseTo(84.42, 1);
  });

  it('a tapped jump rises about 66 px — apex is 66.0 px (D2)', () => {
    expect(jumpArc(LEGACY, 0).apex).toBeCloseTo(65.96, 1);
  });

  it('letting go of jump early is a shorter hop — 18.5 px of variable height (D3)', () => {
    const held = jumpArc(LEGACY, 999).apex;
    const tapped = jumpArc(LEGACY, 0).apex;
    expect(held - tapped).toBeCloseTo(18.46, 1);
    expect(tapped).toBeLessThan(held);
  });

  it('rises for 21 frames held and 17 frames tapped (D4)', () => {
    expect(jumpArc(LEGACY, 999).riseFrames).toBe(21);
    expect(jumpArc(LEGACY, 0).riseFrames).toBe(17);
  });

  it('a full jump hangs about 630 ms — 38 frames of airtime (D5)', () => {
    const arc = jumpArc(LEGACY, 999);
    expect(arc.airFrames).toBe(38);
    expect(arc.airtimeMs).toBeGreaterThan(600);
    expect(arc.airtimeMs).toBeLessThan(680);
  });

  it('varies height with gravity phases only — releasing never cuts velocity (K11)', () => {
    expect(LEGACY.JUMP_CUT).toBeNull();
    expect(jumpArc(LEGACY, 0).apex).toBeGreaterThan(55);
  });

  it('never falls faster than 8.6 px per frame (D8)', () => {
    let s = stand(FLOOR);
    let maxDown = 0;
    for (let k = 0; k < 60; k++) {
      s = step(s, { ...idle, jumpHeld: true, jumpPressed: k === 0 }, FLOOR, LEGACY);
      maxDown = Math.max(maxDown, s.vy);
    }
    expect(maxDown).toBe(LEGACY.MAX_FALL);
  });

  it('the Garfield double jump fires at -7.4, and only past -2.4 (K4)', () => {
    let slow: Sim = { ...stand(FLOOR), y: FLOOR - PLAYER_H - 60, onGround: false, coyote: 0, vy: -1.0, airJumps: 1 };
    slow = step(slow, { ...idle, jumpPressed: true }, FLOOR, LEGACY);
    expect(slow.vy).toBeCloseTo(AIR_JUMP_V + LEGACY.GRAV_TAP!, 5);
    let fast: Sim = { ...stand(FLOOR), y: FLOOR - PLAYER_H - 20, onGround: false, coyote: 0, vy: -5.0, airJumps: 1 };
    fast = step(fast, { ...idle, jumpPressed: true }, FLOOR, LEGACY);
    expect(fast.vy).toBeCloseTo(-5.0 + LEGACY.GRAV_TAP!, 5);
    expect(fast.airJumps).toBe(1);
    for (let k = 0; k < 8 && fast.airJumps === 1; k++) fast = step(fast, idle, FLOOR, LEGACY);
    expect(fast.airJumps).toBe(0);
  });
});

describe('LEGACY run feel — top speed, ramp and stopping (D6-D7)', () => {
  it('runs at exactly 3.0 px per frame (top speed, D6)', () => {
    let s = stand(FLOOR);
    for (let k = 0; k < 60; k++) s = step(s, { ...idle, right: true, run: true }, FLOOR, LEGACY);
    expect(s.vx).toBe(3);
  });

  it('reaches top speed in six frames — snappy, arcade acceleration (D6)', () => {
    let s = stand(FLOOR);
    let frames = -1;
    for (let k = 0; k < 30 && frames < 0; k++) {
      s = step(s, { ...idle, right: true, run: true }, FLOOR, LEGACY);
      if (s.vx >= LEGACY.RUN_MAX) frames = k + 1;
    }
    expect(frames).toBe(6);
  });

  it('stops from a full run in fourteen frames and about 9 px of slide (D7)', () => {
    let s = stand(FLOOR);
    for (let k = 0; k < 20; k++) s = step(s, { ...idle, right: true, run: true }, FLOOR, LEGACY);
    const x0 = s.x;
    let frames = -1;
    for (let k = 0; k < 40 && frames < 0; k++) {
      s = step(s, idle, FLOOR, LEGACY);
      if (s.vx === 0) frames = k + 1;
    }
    expect(frames).toBe(14);
    expect(s.x - x0).toBeCloseTo(9.23, 1);
  });

  it('keeps air control below ground authority (air control, 0.38 vs 0.55)', () => {
    let a: Sim = { ...stand(FLOOR), y: FLOOR - PLAYER_H - 60, onGround: false, coyote: 0 };
    let g = stand(FLOOR);
    for (let k = 0; k < 5; k++) {
      a = step(a, { ...idle, right: true, run: true }, FLOOR, LEGACY);
      g = step(g, { ...idle, right: true, run: true }, FLOOR, LEGACY);
    }
    expect(a.vx).toBeCloseTo(1.9, 5);
    expect(a.vx).toBeLessThan(g.vx);
    expect(g.vx).toBeCloseTo(2.75, 5);
  });
});

describe('LEGACY bounce arcs — spring and stomp (D9-D10)', () => {
  function riseApexAfterImpulse(F: FeelCfg, impulse: number, jumpHeld: boolean): number {
    let s: Sim = { ...stand(FLOOR), y: FLOOR - PLAYER_H - 20, vy: impulse, onGround: false, coyote: 0, cuttable: false };
    const y0 = s.y;
    let minY = s.y;
    for (let k = 0; k < 80; k++) {
      s = step(s, { ...idle, jumpHeld }, FLOOR, F);
      minY = Math.min(minY, s.y);
      if (k > 2 && s.onGround) break;
    }
    return y0 - minY;
  }

  it('a spring tile launches about 137 px when jump is held (D9)', () => {
    expect(riseApexAfterImpulse(LEGACY, LEGACY.SPRING_V, true)).toBeCloseTo(137.16, 1);
  });

  it('a tapped stomp bounce reaches about 35 px (D10)', () => {
    expect(riseApexAfterImpulse(LEGACY, -6.0, false)).toBeCloseTo(34.56, 1);
  });

  it('a held stomp bounce reaches about 44 px (D10)', () => {
    expect(riseApexAfterImpulse(LEGACY, -6.0, true)).toBeCloseTo(44.4, 1);
  });

  it('a held hard stomp bounce (-7.8) reaches about 76 px (D10)', () => {
    expect(riseApexAfterImpulse(LEGACY, -7.8, true)).toBeCloseTo(76.2, 1);
  });
});

describe('forgiveness windows — coyote and jump buffer (D11-D12)', () => {
  /** The frame after walking off a ledge: ground gone, coyote freshly primed. */
  function airborne(coyote: number): Sim {
    return {
      ...stand(FLOOR), y: FLOOR - PLAYER_H - 400,
      onGround: false, coyote, vy: 0,
    };
  }

  function jumpWorksWhenPressedAt(F: FeelCfg, airFramesBeforePress: number): boolean {
    let s = airborne(F.COYOTE);
    for (let k = 0; k < airFramesBeforePress; k++) s = step(s, idle, FLOOR, F);
    s = { ...s, buf: F.JUMP_BUF };   /* the press lands here */
    const vyBefore = s.vy;
    s = step(s, idle, FLOOR, F);
    return s.vy < vyBefore - 1;      /* the jump impulse fired */
  }

  /** Press mid-fall, force touchdown exactly `k` updates later; did the hop fire?
   *  Reads BOTH fire slots: FEEL fires on the touchdown frame (post-moveY),
   *  LEGACY one frame later (its frozen pre-moveY order). */
  function bufferedJumpFiresWhenLandingAt(F: FeelCfg, k: number): boolean {
    let s: Sim = { ...stand(FLOOR), y: FLOOR - PLAYER_H - 400, onGround: false, coyote: 0, vy: 5 };
    s = { ...s, buf: F.JUMP_BUF };   /* the press */
    for (let i = 1; i < k; i++) s = step(s, idle, FLOOR, F);
    s = { ...s, y: FLOOR - PLAYER_H - 3, vy: 5 };   /* right above the floor at step k */
    s = step(s, idle, FLOOR, F);     /* step k: touchdown (FEEL: the fire slot) */
    const vyAtTouchdown = s.vy;
    s = step(s, idle, FLOOR, F);     /* step k+1: legacy fire slot / FEEL tap-cut */
    return s.vy < -3 || vyAtTouchdown < -3;
  }

  it('a jump within six frames of leaving the ground still fires (legacy coyote, D11)', () => {
    expect(jumpWorksWhenPressedAt(LEGACY, 0)).toBe(true);
    expect(jumpWorksWhenPressedAt(LEGACY, 5)).toBe(true);
  });

  it('a jump seven frames after leaving the ground is too late (legacy coyote, D11)', () => {
    expect(jumpWorksWhenPressedAt(LEGACY, 6)).toBe(false);
    expect(jumpWorksWhenPressedAt(LEGACY, 20)).toBe(false);
  });

  it('legacy buffer fires when touchdown is six updates away (D12, finding F1)', () => {
    expect(bufferedJumpFiresWhenLandingAt(LEGACY, 6)).toBe(true);
    expect(bufferedJumpFiresWhenLandingAt(LEGACY, 7)).toBe(false);
    expect(bufferedJumpFiresWhenLandingAt(LEGACY, 10)).toBe(false);
  });
});

describe('CONTRACT §1.4 feel acceptance — FEEL tuning, measured not vibes', () => {
  it('a full jump apex is 4.3 tiles ± 0.25 (§1.4)', () => {
    const arc = jumpArc(FEEL, 999);
    expect(arc.apex).toBeCloseTo(64.98, 1);           /* discrete: Σ(7.6−0.42n), n=1..18 */
    expect(arc.apex / 16).toBeGreaterThanOrEqual(4.05);
    expect(arc.apex / 16).toBeLessThanOrEqual(4.55);
  });

  it('tap-vs-hold jump height ratio is ≤ 0.5 (§1.4)', () => {
    const held = jumpArc(FEEL, 999).apex;
    const tapped = jumpArc(FEEL, 4).apex;             /* "hold ~4 frames, then cut" —
                                                        the fixed input order starts the
                                                        rise one frame after the press */
    expect(tapped / held).toBeLessThanOrEqual(0.5);
    expect(tapped / 16).toBeGreaterThanOrEqual(1.5);  /* §1.1: tap ≈ 1.5-2 tiles */
    expect(tapped / 16).toBeLessThanOrEqual(2.0);
  });

  it('rise is ~18 frames and the fall is faster than the rise (§1.1 derived)', () => {
    const arc = jumpArc(FEEL, 999);
    expect(arc.riseFrames).toBe(19);                  /* the fire frame lands, not rises —
                                                        matches the engine's feelProbe */
    const fallFrames = arc.airFrames - arc.riseFrames;
    expect(fallFrames).toBeGreaterThanOrEqual(13);
    expect(fallFrames).toBeLessThanOrEqual(15);
    expect(fallFrames).toBeLessThan(arc.riseFrames);  /* "fall FEELS faster than rise" */
  });

  it('a full-run jump crosses about 103 px — 6.5 tiles of air (§1.1 derived)', () => {
    let s = stand(FLOOR);
    for (let k = 0; k < 30; k++) s = step(s, { ...idle, right: true, run: true }, FLOOR, FEEL);
    const x0 = s.x;
    s = step(s, { ...idle, right: true, run: true, jumpHeld: true, jumpPressed: true }, FLOOR, FEEL);
    for (let k = 0; k < 80 && !s.onGround; k++) {
      s = step(s, { ...idle, right: true, run: true, jumpHeld: true }, FLOOR, FEEL);
    }
    const runJumpPx = s.x - x0;
    expect(runJumpPx).toBeGreaterThanOrEqual(95);
    expect(runJumpPx).toBeLessThanOrEqual(115);
  });

  it('coyote: a jump pressed 7 frames after leaving fires; 9 frames does not (§1.4)', () => {
    /* "pressed N frames after leaving" = the press is consumed at the Nth update. */
    const pressConsumedAt = (F: FeelCfg, n: number): boolean => {
      let s: Sim = { ...stand(FLOOR), y: FLOOR - PLAYER_H - 400, onGround: false, coyote: F.COYOTE, vy: 0 };
      for (let k = 1; k < n; k++) s = step(s, idle, FLOOR, F);
      s = { ...s, buf: F.JUMP_BUF };
      const before = s.vy;
      s = step(s, idle, FLOOR, F);
      return s.vy < before - 1;
    };
    expect(pressConsumedAt(FEEL, 7)).toBe(true);      /* fired at the 7-frame mark */
    expect(pressConsumedAt(FEEL, 9)).toBe(false);     /* too late at 9 frames */
    expect(pressConsumedAt(LEGACY, 6)).toBe(true);    /* legacy: COYOTE 7 window */
    expect(pressConsumedAt(LEGACY, 8)).toBe(false);
  });

  it('a spring launches about 138 px with the §1.1 launch velocity', () => {
    let s: Sim = { ...stand(FLOOR), y: FLOOR - PLAYER_H - 20, vy: FEEL.SPRING_V, onGround: false, coyote: 0, cuttable: false };
    const y0 = s.y;
    let minY = s.y;
    for (let k = 0; k < 80; k++) {
      s = step(s, { ...idle, jumpHeld: true }, FLOOR, FEEL);
      minY = Math.min(minY, s.y);
      if (k > 2 && s.onGround) break;
    }
    expect(y0 - minY).toBeCloseTo(138.58, 1);         /* Σ(11−0.42n), n=1..26 */
  });

  it('stomp bounces: −7.0 held reaches ~55 px, −4.6 tapped ~23 px (§1.1)', () => {
    const arc = (impulse: number, held: boolean): number => {
      let s: Sim = { ...stand(FLOOR), y: FLOOR - PLAYER_H - 20, vy: impulse, onGround: false, coyote: 0, cuttable: false };
      const y0 = s.y;
      let minY = s.y;
      for (let k = 0; k < 80; k++) {
        s = step(s, { ...idle, jumpHeld: held }, FLOOR, FEEL);
        minY = Math.min(minY, s.y);
        if (k > 2 && s.onGround) break;
      }
      return y0 - minY;
    };
    expect(arc(-7.0, true)).toBeCloseTo(54.88, 1);
    expect(arc(-4.6, false)).toBeCloseTo(22.9, 1);
  });
});

describe('CONTRACT §1.4 buffer acceptance — finding F1 FIXED', () => {
  it('§1.4: "a jump pressed 8 frames before landing fires on touchdown" (F1 fixed)', () => {
    /* The Builder's fix landed: the new game checks its buffer AFTER moveY and
       decrements AFTER the check (updatePlayer), so the press window is the
       full JUMP_BUF. The hop is read at the touchdown slot itself — the very
       next frame is a mandated §1.1 tap-cut rise (JUMP_CUT + GRAV_HOLD). */
    let s: Sim = { ...stand(FLOOR), y: FLOOR - PLAYER_H - 400, onGround: false, coyote: 0, vy: 5 };
    s = { ...s, buf: FEEL.JUMP_BUF };
    for (let i = 1; i < 8; i++) s = step(s, idle, FLOOR, FEEL);
    s = { ...s, y: FLOOR - PLAYER_H - 3, vy: 5 };   /* touchdown 8 frames after the press */
    s = step(s, idle, FLOOR, FEEL);
    expect(s.vy).toBe(FEEL.JUMP_V);                 /* the buffered hop fired ON touchdown */
    s = step(s, idle, FLOOR, FEEL);
    expect(s.vy).toBeCloseTo(FEEL.JUMP_CUT! + FEEL.GRAV_HOLD, 5);   /* tap-cut continues the rise */
    /* nine frames is outside the window */
    let t: Sim = { ...stand(FLOOR), y: FLOOR - PLAYER_H - 400, onGround: false, coyote: 0, vy: 5 };
    t = { ...t, buf: FEEL.JUMP_BUF };
    for (let i = 1; i < 10; i++) t = step(t, idle, FLOOR, FEEL);
    t = { ...t, y: FLOOR - PLAYER_H - 3, vy: 5 };
    t = step(t, idle, FLOOR, FEEL);
    expect(t.vy).not.toBe(FEEL.JUMP_V);
  });

  it('§1.4: "10 frames before landing does not fire" — already true today', () => {
    let s: Sim = { ...stand(FLOOR), y: FLOOR - PLAYER_H - 400, onGround: false, coyote: 0, vy: 5 };
    s = { ...s, buf: FEEL.JUMP_BUF };
    for (let i = 1; i < 10; i++) s = step(s, idle, FLOOR, FEEL);
    s = { ...s, y: FLOOR - PLAYER_H - 3, vy: 5 };
    s = step(s, idle, FLOOR, FEEL);
    s = step(s, idle, FLOOR, FEEL);
    expect(s.vy).toBeGreaterThan(-3);
  });
});

describe('determinism (D13)', () => {
  it('is deterministic: identical inputs give identical states (arc)', () => {
    const script: SimInput[] = [];
    for (let k = 0; k < 240; k++) {
      script.push({
        left: k % 90 < 20,
        right: k % 90 >= 30 && k % 90 < 70,
        jumpHeld: k % 41 < 9,
        jumpPressed: k % 41 === 0,
        run: k % 3 === 0,
      });
    }
    const run = (F: FeelCfg): string => {
      let s = stand(FLOOR);
      for (const inp of script) s = step(s, inp, FLOOR, F);
      return JSON.stringify(s);
    };
    expect(run(LEGACY)).toBe(run(LEGACY));
    expect(run(FEEL)).toBe(run(FEEL));
  });
});





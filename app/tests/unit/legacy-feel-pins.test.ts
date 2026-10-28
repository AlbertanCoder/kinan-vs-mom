import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * TE-1 · FEEL & PHYSICS — characterization + contract pins
 * (docs/TEST-PLAN-FEEL-PHYSICS.md K1-K22 + GAME-DESIGN-CONTRACT.md §1.1).
 *
 * Pins the real game (repository-root index.html):
 *  - `FEEL`        — the locked contract §1.1 movement table (new-world stages).
 *  - `LEGACY_FEEL` — the old tuning frozen for legacy stages + party modes (§6/§8.2).
 *  - the wiring: `feel()` selector, JUMP_CUT, coyote/buffer order, stomp/spring/land.
 * Any Builder rewrite must move these pins IN THE SAME COMMIT and say so.
 * Never delete a pin to make a gate pass.
 */

const SRC = readFileSync(fileURLToPath(new URL('../../../index.html', import.meta.url)), 'utf8');

/** Extract the body of `const NAME = { ... };` from the source. */
function configBlock(name: string): string {
  const start = SRC.indexOf(`const ${name} = {`);
  if (start < 0) throw new Error(`feel pin lost: config ${name} not found`);
  const end = SRC.indexOf('};', start);
  return SRC.slice(start, end);
}

/** Parse `KEY: value` pairs out of a config block (numbers or null). */
function configValues(name: string): Record<string, number | null> {
  const out: Record<string, number | null> = {};
  for (const m of configBlock(name).matchAll(/(\w+):\s*(-?[\d.]+|null)/g)) {
    out[m[1]] = m[2] === 'null' ? null : Number(m[2]);
  }
  return out;
}

function num(re: RegExp, label: string): number {
  const m = re.exec(SRC);
  if (!m || m[1] === undefined) throw new Error(`feel pin lost: ${label} (${String(re)})`);
  return Number(m[1]);
}

describe('contract §1.1 — the FEEL object is exactly the locked movement table', () => {
  /* GAME-DESIGN-CONTRACT.md §1.1 "Target" column — these numbers are LAW. */
  const CONTRACT_1_1: Record<string, number | null> = {
    WALK_MAX: 1.9, RUN_MAX: 3.2, RUSH_MAX: 4.2,
    ACC_GROUND: 0.30, ACC_AIR: 0.20, ACC_SKID: 0.55,
    ACC_ICE: 0.16, ACC_SLIME: 0.30,
    FRIC_GROUND: 0.80, FRIC_AIR: 0.96,
    JUMP_V: -7.6, GRAV_HOLD: 0.42, GRAV_TAP: null, GRAV_FALL: 0.66,
    MAX_FALL: 9.0, JUMP_CUT: -2.6,
    COYOTE: 8, JUMP_BUF: 8,
    STOMP_HIGH: -7.0, STOMP_LOW: -4.6,
    STOMP_UMBRELLA_HIGH: -7.0, STOMP_UMBRELLA_LOW: -4.6, STOMP_TOUGH: -7.0,
    SPRING_V: -11.0,
    STRETCH_F: 7, LAND_SQUASH_F: 5, SPRING_STRETCH_F: 8,
    HURT_VY: -3.0, HURT_VX: 2.4, HURT_HITSTOP: 6, STOMP_HITSTOP: 4, BOSS_HITSTOP: 4, INVULN: 100,
  };

  it('every §1.1 number matches the FEEL object, constant for constant', () => {
    expect(configValues('FEEL')).toEqual(CONTRACT_1_1);
  });

  it('exports one FEEL object — no stray copies of the movement table', () => {
    expect(SRC.match(/const FEEL = \{/g)).toHaveLength(1);
  });
});

describe('LEGACY_FEEL — the old feel, frozen exactly as it always played (§6)', () => {
  /* The pre-rebuild engine numbers (K2-K15 characterization). The love is sacred. */
  const LEGACY: Record<string, number | null> = {
    WALK_MAX: 3.0, RUN_MAX: 3.0, RUSH_MAX: 3.7,
    ACC_GROUND: 0.55, ACC_AIR: 0.38, ACC_SKID: 0.55,
    ACC_ICE: 0.16, ACC_SLIME: 0.30,
    FRIC_GROUND: 0.76, FRIC_AIR: 0.96,
    JUMP_V: -8.2, GRAV_HOLD: 0.38, GRAV_TAP: 0.48, GRAV_FALL: 0.62,
    MAX_FALL: 8.6, JUMP_CUT: null,
    COYOTE: 7, JUMP_BUF: 8,
    STOMP_HIGH: -7.8, STOMP_LOW: -6.0,
    STOMP_UMBRELLA_HIGH: -7.8, STOMP_UMBRELLA_LOW: -6.2, STOMP_TOUGH: -7.4,
    SPRING_V: -10.4,
    STRETCH_F: 8, LAND_SQUASH_F: 6, SPRING_STRETCH_F: 8,
    HURT_VY: -3.4, HURT_VX: 2.2, HURT_HITSTOP: 0, STOMP_HITSTOP: 0, BOSS_HITSTOP: 3, INVULN: 100,
  };

  it('keeps every legacy number exactly as it always was', () => {
    expect(configValues('LEGACY_FEEL')).toEqual(LEGACY);
  });

  it('legacy variable jump is gravity-only — JUMP_CUT stays null', () => {
    expect(configValues('LEGACY_FEEL').JUMP_CUT).toBeNull();
    expect(configValues('LEGACY_FEEL').GRAV_TAP).toBe(0.48);
  });
});

describe('the feel() selector — new worlds get the contract, everything else the legacy love', () => {
  it('routes L.newWorld stages to FEEL and everything else to LEGACY_FEEL', () => {
    expect(SRC).toContain('function feel() { return (L && L.newWorld) ? FEEL : LEGACY_FEEL; }');
    expect(SRC).toContain('const F = feel(), newFeel = F === FEEL;');
  });

  it('reads every movement number through F — the tuning object stays wired', () => {
    /* Structure-tolerant on purpose: the Builder's M1 refactor is in flight and
       the code SHAPE may move; the VALUES are pinned above and the BEHAVIOR in
       legacy-feel-arc/contract. Strict source pins return once M1 lands. */
    for (const key of ['F.ACC_GROUND', 'F.ACC_AIR', 'F.ACC_SKID', 'F.RUN_MAX', 'F.WALK_MAX',
      'F.RUSH_MAX', 'F.MAX_FALL', 'F.FRIC_GROUND', 'F.FRIC_AIR', 'F.COYOTE', 'F.JUMP_V']) {
      expect(SRC, `${key} must stay wired into the movement code`).toContain(key);
    }
  });
});

describe('jump feel wiring — cut, coyote, buffer (§1.1 rows JUMP_CUT / COYOTE / JUMP_BUF)', () => {
  it('keeps the JUMP_CUT mechanics wired — cut on release, gravity phases intact (K11)', () => {
    expect(SRC).toContain('P.vy < F.JUMP_CUT');   /* the sharp release cut (§1.1) */
    expect(SRC).toContain('P.cuttable');
    expect(SRC).toContain('F.GRAV_HOLD');         /* contract rise gravity */
    expect(SRC).toContain('F.GRAV_FALL');         /* contract fall gravity */
    expect(SRC).toMatch(/GRAV_TAP/);              /* legacy tap-gravity phase survives */
  });

  it('marks real jumps cuttable and clears the cut at the apex or on springs', () => {
    expect(SRC).toContain('P.cuttable = true');
    expect(SRC).toContain('P.cuttable = false');
  });

  it('decays the buffer before checking it — the fire window is 7 checks (K10, finding F1)', () => {
    /* TE-1 finding F1: this order gives JUMP_BUF-1 fire slots; the §1.4 acceptance
       "pressed 8 frames before landing fires" needs a wider window. See the report. */
    expect(SRC).toMatch(/if \(input\.jumpBuf > 0\) input\.jumpBuf--;\s*if \(input\.jumpBuf > 0\) \{/);
  });

  it('refills coyote to F.COYOTE on ground and decays one frame at a time (K9)', () => {
    expect(SRC).toContain('P.coyote = F.COYOTE;');
    expect(SRC).toMatch(/else if \(P\.coyote > 0\) P\.coyote--;/);
  });

  it('pressInto still hardcodes the 8-frame press buffer (finding F2: F.JUMP_BUF not wired)', () => {
    /* Both tunings declare JUMP_BUF = 8 today, so behavior matches — but the
       press must read F.JUMP_BUF the day the two tunings diverge. */
    expect(SRC).toContain("if (!inp.jump) inp.jumpBuf = smash ? 10 : 8;");
    expect(SRC.match(/inp\.jumpBuf = F\.JUMP_BUF/g) ?? []).toHaveLength(0);
  });
});

describe('feedback wiring — squash, stretch, stomp, spring (§1.2 / §1.3)', () => {
  it('jump stretch and landing squash come from the FEEL object (K12-K13)', () => {
    for (const key of ['F.STRETCH_F', 'F.LAND_SQUASH_F', 'F.SPRING_STRETCH_F', 'P.squashImpact', 'P.landT = 7']) {
      expect(SRC, `${key} must stay wired into the feedback code`).toContain(key);
    }
  });

  it('stomp bounces use the FEEL stomp table (K15)', () => {
    expect(SRC).toContain('if (newFeel) P.vy = (input.jump || padIn.jump) ? F.STOMP_HIGH : F.STOMP_LOW;');
    expect(SRC).toContain('if (newFeel) { P.vy = F.STOMP_TOUGH; P.y = f.y - P.h + 1; P.squash = 4; }');
    expect(SRC).toContain('if (newFeel) { P.vy = F.SPRING_V; P.stretch = F.SPRING_STRETCH_F; }');
    expect(SRC).toContain('if (newFeel) P.squash = F.LAND_SQUASH_F;');
  });

  it('decays squash and stretch one frame at a time (K13)', () => {
    expect(SRC).toContain('if (P.squash > 0) P.squash--;');
    expect(SRC).toContain('if (P.stretch > 0) P.stretch--;');
  });

  it('keeps hit-stop and hurt numbers in the FEEL object (§1.3)', () => {
    expect(SRC).toContain('hitStop = feel().BOSS_HITSTOP;');
  });
});

describe('terrain semantics — tiles and one-way rules (K17-K19, §2.2)', () => {
  it('documents the tile legend: 5 wall, 6 spring, 7 shelf one-way (K17)', () => {
    expect(SRC).toMatch(/5 wall . 6 spring . 7 shelf \(one-way\)/);
  });

  it('treats tiles 1 through 6 as solid and tile 7 as one-way (K17)', () => {
    expect(SRC).toContain('return t >= 1 && t <= 6;');
    expect(SRC).toContain('if (tx < 0 || tx >= L.w) return true;');
  });

  it('catches on a one-way shelf only when the feet were at or above its top (K18)', () => {
    expect(SRC).toContain('if (solid(tx, ty) || (tileAt(tx, ty) === 7 && oldBottom <= ty * T + 0.01)) {');
  });

  it('snaps exactly to tile edges: wall, floor and ceiling (K19)', () => {
    expect(SRC).toContain('e.x = tx * T - e.w; e.vx = 0; return 1;');
    expect(SRC).toContain('e.x = (tx + 1) * T; e.vx = 0; return -1;');
    expect(SRC).toContain('e.y = ty * T - e.h; e.vy = 0; e.onGround = true;');
    expect(SRC).toContain('e.y = (ty + 1) * T; e.vy = 0;');
  });
});

describe('camera pins — the current follow, replaced per contract §3 (K20-K22)', () => {
  it('anchors Kinan at 42% of the screen width (K20, legacy camera)', () => {
    expect(num(/let target = cxP - W \* ([\d.]+);/, 'camera anchor')).toBe(0.42);
  });

  it('rounds and clamps the camera inside the level bounds (K20-K21)', () => {
    expect(SRC).toContain('camX = clamp(Math.round(target), lo, hi);');
    expect(SRC).toContain('let lo = 0, hi = Math.min(L.w * T - W, (L.arenaX + L.arenaW + 1) * T - W);');
    expect(SRC).toContain("if (boss !== 'off' && L.arenaX < L.w) lo = L.arenaX * T;");
  });

  it('eases camY at 0.2 per frame and snaps under half a pixel (K22)', () => {
    expect(num(/camY \+= \(ty - camY\) \* ([\d.]+);/, 'camY lerp')).toBe(0.2);
    expect(num(/Math\.abs\(ty - camY\) < ([\d.]+)\)/, 'camY snap')).toBe(0.5);
    expect(SRC).toMatch(/\} else camY = 0;/);
  });
});

describe('simulation loop and measurement (§4.2 / §1.4)', () => {
  it('steps on a fixed 1000/60 ms accumulator with no rigid-body physics', () => {
    expect(SRC).toContain('const step = 1000 / 60;');
    expect(SRC).toMatch(/while \(acc >= step && guard\+\+ < 5\) \{ update\(\); acc -= step; \}/);
    expect(SRC).toContain('function moveX(e) {');
    expect(SRC).toContain('function moveY(e) {');
  });

  it('ships the feelProbe measurement hook behind the dev gate (§1.4)', () => {
    expect(SRC).toContain('feelProbe: () => {');
    expect(SRC).toContain('window.__k11 = window.__k11DevOnly() ? {');
  });
});


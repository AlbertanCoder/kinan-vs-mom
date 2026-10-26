/**
 * Deterministic fixed-timestep 2D platformer controller (pure, Phaser-free).
 *
 * Master design document 4.2: fixed timestep, swept collisions, coyote time,
 * jump buffering, variable jump height, deterministic replay fixtures.
 * No unconstrained rigid-body physics for Kinan.
 *
 * All math is deterministic: same state + same input sequence always produces
 * the same result, so unit tests can assert exact behavior.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlatformerInput {
  /** -1, 0, or 1 (analog values are quantized by the input layer). */
  moveX: number;
  jumpHeld: boolean;
  /** Rising edge this step. */
  jumpPressed: boolean;
  /** Falling edge this step. */
  jumpReleased: boolean;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  onGround: boolean;
  facing: number;
  coyoteMs: number;
  jumpBufferMs: number;
  extraJumps: number;
  /** Milliseconds of knockback invulnerability remaining. */
  invulnMs: number;
}

export interface PlayerConfig {
  gravity: number;
  maxFall: number;
  runSpeed: number;
  groundAccel: number;
  airAccel: number;
  groundFriction: number;
  jumpSpeed: number;
  /** Velocity multiplier applied when jump is released while rising. */
  jumpCut: number;
  coyoteMs: number;
  jumpBufferMs: number;
  maxExtraJumps: number;
  knockbackX: number;
  knockbackY: number;
}

export const DEFAULT_PLAYER_CONFIG: PlayerConfig = {
  gravity: 2400,
  maxFall: 1400,
  runSpeed: 340,
  groundAccel: 3200,
  airAccel: 2200,
  groundFriction: 3000,
  jumpSpeed: 860,
  jumpCut: 0.42,
  coyoteMs: 90,
  jumpBufferMs: 110,
  maxExtraJumps: 0,
  knockbackX: 320,
  knockbackY: 520,
};

/** Fixed simulation timestep: 60 updates per second. */
export const FIXED_DT_MS = 1000 / 60;

export function createPlayerState(x: number, y: number): PlayerState {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    w: 32,
    h: 44,
    onGround: false,
    facing: 1,
    coyoteMs: 0,
    jumpBufferMs: 0,
    extraJumps: 0,
    invulnMs: 0,
  };
}

export interface StepResult {
  state: PlayerState;
  jumped: boolean;
  landed: boolean;
  hitHead: boolean;
}

const MAX_SUBSTEP_PX = 8;

function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

/**
 * Advance one fixed timestep. Swept substeps prevent tunneling through thin
 * floors at high fall speeds.
 */
export function stepPlayer(
  state: PlayerState,
  input: PlatformerInput,
  solids: readonly Rect[],
  dtMs: number,
  cfg: PlayerConfig = DEFAULT_PLAYER_CONFIG,
): StepResult {
  const s: PlayerState = { ...state };
  let jumped = false;
  let landed = false;
  let hitHead = false;

  const dt = dtMs / 1000;

  /* --- timers --- */
  s.jumpBufferMs = input.jumpPressed
    ? cfg.jumpBufferMs
    : Math.max(0, s.jumpBufferMs - dtMs);
  s.coyoteMs = s.onGround ? cfg.coyoteMs : Math.max(0, s.coyoteMs - dtMs);
  s.invulnMs = Math.max(0, s.invulnMs - dtMs);

  /* --- horizontal movement --- */
  const targetVx = input.moveX * cfg.runSpeed;
  const accel = s.onGround
    ? input.moveX !== 0
      ? cfg.groundAccel
      : cfg.groundFriction
    : cfg.airAccel;
  if (s.vx < targetVx) s.vx = Math.min(targetVx, s.vx + accel * dt);
  else if (s.vx > targetVx) s.vx = Math.max(targetVx, s.vx - accel * dt);
  if (input.moveX !== 0) s.facing = input.moveX > 0 ? 1 : -1;

  /* --- jump --- */
  const groundedOrCoyote = s.onGround || s.coyoteMs > 0;
  if (s.jumpBufferMs > 0 && groundedOrCoyote) {
    s.vy = -cfg.jumpSpeed;
    s.onGround = false;
    s.coyoteMs = 0;
    s.jumpBufferMs = 0;
    jumped = true;
  } else if (
    input.jumpPressed &&
    !groundedOrCoyote &&
    s.extraJumps > 0
  ) {
    s.extraJumps -= 1;
    s.vy = -cfg.jumpSpeed;
    jumped = true;
  }
  if (input.jumpReleased && s.vy < 0) {
    s.vy *= cfg.jumpCut; /* variable jump height */
  }

  /* --- gravity --- */
  s.vy = Math.min(cfg.maxFall, s.vy + cfg.gravity * dt);

  /* --- swept integration --- */
  const distX = s.vx * dt;
  const distY = s.vy * dt;
  const n = Math.max(
    1,
    Math.ceil(Math.max(Math.abs(distX), Math.abs(distY)) / MAX_SUBSTEP_PX),
  );
  const dx = distX / n;
  const dy = distY / n;
  s.onGround = false;

  for (let i = 0; i < n; i++) {
    /* X axis */
    s.x += dx;
    const boxX: Rect = { x: s.x, y: s.y, w: s.w, h: s.h };
    for (const solid of solids) {
      if (!overlaps(boxX, solid)) continue;
      if (dx > 0) s.x = solid.x - s.w;
      else if (dx < 0) s.x = solid.x + solid.w;
      s.vx = 0;
      boxX.x = s.x;
    }

    /* Y axis */
    s.y += dy;
    const boxY: Rect = { x: s.x, y: s.y, w: s.w, h: s.h };
    for (const solid of solids) {
      if (!overlaps(boxY, solid)) continue;
      if (dy > 0) {
        s.y = solid.y - s.h;
        s.vy = 0;
        s.onGround = true;
        landed = true;
      } else if (dy < 0) {
        s.y = solid.y + solid.h;
        s.vy = 0;
        hitHead = true;
      }
      boxY.y = s.y;
    }
  }

  if (landed) s.extraJumps = cfg.maxExtraJumps;

  return { state: s, jumped, landed, hitHead };
}

/** Apply a hit: knockback + invulnerability window. Returns the new state. */
export function applyKnockback(
  state: PlayerState,
  fromX: number,
  cfg: PlayerConfig = DEFAULT_PLAYER_CONFIG,
  scale = 1,
): PlayerState {
  const dir = state.x + state.w / 2 < fromX ? -1 : 1;
  return {
    ...state,
    vx: dir * cfg.knockbackX * scale,
    vy: -cfg.knockbackY * scale,
    onGround: false,
    invulnMs: 1200,
  };
}

import { describe, expect, it } from 'vitest';
import {
  createPlayerState,
  stepPlayer,
  DEFAULT_PLAYER_CONFIG,
  FIXED_DT_MS,
  type PlatformerInput,
  type Rect,
} from '../../src/engine/platformer';

const FLAT_GROUND: Rect[] = [{ x: -1000, y: 500, w: 4000, h: 100 }];
const LEDGE: Rect[] = [{ x: 0, y: 500, w: 400, h: 100 }];

const idle: PlatformerInput = {
  moveX: 0,
  jumpHeld: false,
  jumpPressed: false,
  jumpReleased: false,
};
const jumpNow: PlatformerInput = { ...idle, jumpHeld: true, jumpPressed: true };
const jumpHeld: PlatformerInput = { ...idle, jumpHeld: true };
const jumpReleased: PlatformerInput = { ...idle, jumpReleased: true };

function settle(
  state: ReturnType<typeof createPlayerState>,
  solids: Rect[],
  cfg = DEFAULT_PLAYER_CONFIG,
) {
  let s = state;
  for (let i = 0; i < 60; i++) {
    s = stepPlayer(s, idle, solids, FIXED_DT_MS, cfg).state;
  }
  return s;
}

describe('fixed-timestep platformer controller', () => {
  it('falls onto the ground and reports landing', () => {
    let s = createPlayerState(100, 100);
    s = settle(s, FLAT_GROUND);
    expect(s.onGround).toBe(true);
    expect(s.y).toBeCloseTo(500 - s.h, 3);
  });

  it('clamps fall speed to maxFall', () => {
    let s = { ...createPlayerState(100, -20000), vy: 0 };
    for (let i = 0; i < 200; i++) s = stepPlayer(s, idle, FLAT_GROUND, FIXED_DT_MS).state;
    expect(s.vy).toBeLessThanOrEqual(DEFAULT_PLAYER_CONFIG.maxFall);
  });

  it('supports coyote time: a jump shortly after leaving a ledge still fires', () => {
    let s = settle(createPlayerState(370, 400), LEDGE);
    expect(s.onGround).toBe(true);
    /* walk off the ledge edge (x >= 400) */
    for (let i = 0; i < 40 && s.onGround; i++) {
      s = stepPlayer(s, { ...idle, moveX: 1 }, LEDGE, FIXED_DT_MS).state;
    }
    expect(s.onGround).toBe(false);
    expect(s.coyoteMs).toBeGreaterThan(0);
    const r = stepPlayer(s, jumpNow, LEDGE, FIXED_DT_MS);
    expect(r.jumped).toBe(true);
    expect(r.state.vy).toBeLessThan(0);
  });

  it('supports jump buffering: a press just before landing fires on touchdown', () => {
    let s = settle(createPlayerState(100, 100), FLAT_GROUND);
    s = stepPlayer(s, jumpNow, FLAT_GROUND, FIXED_DT_MS).state;
    s = stepPlayer(s, jumpReleased, FLAT_GROUND, FIXED_DT_MS).state;
    /* fall back; press jump within the 110ms buffer window before landing */
    let pressed = false;
    let firedOnLand = false;
    for (let i = 0; i < 300 && !firedOnLand; i++) {
      const nearGround = s.y > 500 - s.h - 30 && s.vy > 0;
      const input = nearGround && !pressed ? jumpNow : jumpHeld;
      if (nearGround && !pressed) pressed = true;
      const r = stepPlayer(s, input, FLAT_GROUND, FIXED_DT_MS);
      s = r.state;
      if (pressed && r.jumped) firedOnLand = true;
    }
    expect(pressed).toBe(true);
    expect(firedOnLand).toBe(true);
  });

  it('variable jump height: releasing early is lower than holding', () => {
    let hold = settle(createPlayerState(100, 100), FLAT_GROUND);
    let cut = hold;
    hold = stepPlayer(hold, jumpNow, FLAT_GROUND, FIXED_DT_MS).state;
    cut = stepPlayer(cut, jumpNow, FLAT_GROUND, FIXED_DT_MS).state;
    cut = stepPlayer(cut, jumpReleased, FLAT_GROUND, FIXED_DT_MS).state;
    let holdMinY = hold.y;
    let cutMinY = cut.y;
    for (let i = 0; i < 120; i++) {
      hold = stepPlayer(hold, jumpHeld, FLAT_GROUND, FIXED_DT_MS).state;
      cut = stepPlayer(cut, idle, FLAT_GROUND, FIXED_DT_MS).state;
      holdMinY = Math.min(holdMinY, hold.y);
      cutMinY = Math.min(cutMinY, cut.y);
    }
    expect(holdMinY).toBeLessThan(cutMinY); /* held jump reaches higher */
  });

  it('is deterministic: identical inputs give identical states', () => {
    const inputs: PlatformerInput[] = [];
    for (let i = 0; i < 240; i++) {
      inputs.push({
        moveX: i % 80 < 40 ? 1 : -1,
        jumpHeld: i % 37 < 8,
        jumpPressed: i % 37 === 0,
        jumpReleased: i % 37 === 8,
      });
    }
    const run = () => {
      let s = createPlayerState(100, 100);
      for (const input of inputs) s = stepPlayer(s, input, LEDGE, FIXED_DT_MS).state;
      return JSON.stringify(s);
    };
    expect(run()).toBe(run());
  });

  it('never tunnels through thin floors at terminal velocity', () => {
    const thinFloor: Rect[] = [{ x: -1000, y: 500, w: 4000, h: 20 }];
    let s = { ...createPlayerState(100, 0), vy: 1400 };
    for (let i = 0; i < 120; i++) s = stepPlayer(s, idle, thinFloor, FIXED_DT_MS).state;
    expect(s.onGround).toBe(true);
    expect(s.y).toBeCloseTo(500 - s.h, 3);
  });

  it('grants Ginger-style extra air jumps from config', () => {
    const cfg = { ...DEFAULT_PLAYER_CONFIG, maxExtraJumps: 1 };
    let s = settle(createPlayerState(100, 100), FLAT_GROUND, cfg);
    s = stepPlayer(s, jumpNow, FLAT_GROUND, FIXED_DT_MS, cfg).state;
    s = stepPlayer(s, jumpReleased, FLAT_GROUND, FIXED_DT_MS, cfg).state;
    s = stepPlayer(s, idle, FLAT_GROUND, FIXED_DT_MS, cfg).state;
    expect(s.onGround).toBe(false);
    expect(s.extraJumps).toBe(1);
    const r = stepPlayer(s, jumpNow, FLAT_GROUND, FIXED_DT_MS, cfg);
    expect(r.jumped).toBe(true); /* mid-air jump works */
    expect(r.state.extraJumps).toBe(0);
  });
});
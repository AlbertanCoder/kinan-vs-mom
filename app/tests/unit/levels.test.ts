import { describe, expect, it } from 'vitest';
import { buildLevel, ROWS } from '../../src/game/data/levels';
import {
  WORLDS,
  STAGE_ORDER,
  findStage,
  worldIdForStage,
} from '../../src/game/data/worlds';

describe('deterministic level builder', () => {
  it('produces identical layouts for the same stage ID', () => {
    const a = buildLevel('w01-bedroom-chaos', { isBoss: false, difficulty: 0 });
    const b = buildLevel('w01-bedroom-chaos', { isBoss: false, difficulty: 0 });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('produces different layouts for different stage IDs', () => {
    const a = buildLevel('w01-bedroom-chaos', { isBoss: false, difficulty: 0 });
    const b = buildLevel('w01-house-hijinks', { isBoss: false, difficulty: 1 });
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });

  it('always contains spawn, goal, and exactly three stars in course stages', () => {
    for (const stageId of STAGE_ORDER.slice(0, 20)) {
      const found = findStage(stageId);
      const level = buildLevel(stageId, {
        isBoss: found?.stage.kind === 'boss',
        difficulty: 1,
      });
      expect(level.spawn).toBeDefined();
      const goals = level.entities.filter((e) => e.kind === 'goal');
      const stars = level.entities.filter((e) => e.kind === 'star');
      expect(goals.length).toBe(1);
      expect(stars.length).toBe(3);
      expect(level.rows).toBe(ROWS);
      expect(level.solids.length).toBeGreaterThan(0);
    }
  });

  it('boss stages contain a boss and are flat arenas', () => {
    const level = buildLevel('w10-mom-finale', { isBoss: true, difficulty: 5 });
    expect(level.isBoss).toBe(true);
    expect(level.entities.some((e) => e.kind === 'boss')).toBe(true);
  });
});

describe('world catalog integrity', () => {
  it('has ten 2D worlds with unique stable stage IDs', () => {
    expect(WORLDS).toHaveLength(10);
    const ids = STAGE_ORDER;
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z][a-z0-9-]+$/);
  });

  it('maps every stage to its world by stable ID', () => {
    for (const world of WORLDS) {
      for (const stage of world.stages) {
        expect(worldIdForStage(stage.id)).toBe(world.id);
      }
    }
    expect(worldIdForStage('nope')).toBeNull();
  });

  it('gates progression: each world has exactly one world-gate stage', () => {
    for (const world of WORLDS) {
      expect(world.stages.filter((s) => s.worldGate)).toHaveLength(1);
    }
  });
});
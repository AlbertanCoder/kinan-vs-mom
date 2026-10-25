import { describe, expect, it } from 'vitest';
import { GameRuntime } from '../../src/game/state';
import { SAVE_KEY, type GameSave } from '../../src/shared/save';
import type { StorageLike } from '../../src/shared/migration';

class MemoryStorage implements StorageLike {
  private map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }
}

function persistedSave(storage: StorageLike): GameSave {
  const raw = storage.getItem(SAVE_KEY);
  expect(raw).not.toBeNull();
  return JSON.parse(raw as string) as GameSave;
}

describe('game runtime progression persistence', () => {
  it('commits stage stars, best time, coins, and the next-stage unlock', () => {
    const storage = new MemoryStorage();
    const runtime = new GameRuntime(storage);
    runtime.addCoins(7);

    expect(runtime.recordStageClear('w01-bedroom-chaos', 2, 1234)).toBe(true);
    expect(runtime.isStageUnlocked('w01-house-hijinks')).toBe(true);

    const restored = new GameRuntime(storage);
    expect(restored.save.coins).toBe(7);
    expect(restored.stageProgress('w01-bedroom-chaos')).toEqual({
      cleared: true,
      stars: 2,
      bestTimeMs: 1234,
    });

    restored.recordStageClear('w01-bedroom-chaos', 1, 2000);
    expect(restored.stageProgress('w01-bedroom-chaos')).toEqual({
      cleared: true,
      stars: 2,
      bestTimeMs: 1234,
    });
  });

  it('commits the World 10 unlock with the cinematic still pending', () => {
    const storage = new MemoryStorage();
    const runtime = new GameRuntime(storage);

    expect(runtime.recordStageClear('w10-mom-finale', 3, 5000)).toBe(true);
    const persisted = persistedSave(storage);
    expect(persisted.world10Complete).toBe(true);
    expect(persisted.world11Unlocked).toBe(true);
    expect(persisted.pendingDimensionCutscene).toBe(true);
    expect(persisted.dimensionCutsceneSeen).toBe(false);

    const recovered = new GameRuntime(storage);
    expect(recovered.save.pendingDimensionCutscene).toBe(true);
    recovered.markDimensionCutsceneSeen();
    expect(persistedSave(storage).pendingDimensionCutscene).toBe(false);
    expect(persistedSave(storage).dimensionCutsceneSeen).toBe(true);
  });

  it('reports a failed unlock commit instead of claiming persistence', () => {
    class FailingStorage extends MemoryStorage {
      override setItem(): void {
        throw new Error('storage unavailable');
      }
    }

    const storage = new FailingStorage();
    const runtime = new GameRuntime(storage);
    expect(runtime.recordStageClear('w10-mom-finale', 3, 5000)).toBe(false);
    expect(storage.getItem(SAVE_KEY)).toBeNull();
  });
});

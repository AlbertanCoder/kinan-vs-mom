/**
 * Game runtime state: one mutable, observable save + progression helpers.
 * Persistence goes through shared/migration.ts (backup-first commits).
 * This is the single writer of the new-schema save during play.
 */

import {
  createDefaultSave,
  type GameSave,
  type StageProgress,
  type AccessibilitySettings,
} from '../shared/save';
import {
  loadSave,
  persistSave,
  exportSave,
  importSave,
  type LoadResult,
  type StorageLike,
} from '../shared/migration';
import { STAGE_ORDER, worldIdForStage, findStage } from './data/worlds';

class GameRuntime {
  save: GameSave;
  private storage: StorageLike;
  private listeners = new Set<() => void>();

  constructor(storage: StorageLike) {
    this.storage = storage;
    const result: LoadResult = loadSave(storage);
    this.save = result.save;
    this.migrationReport = result.report;
  }

  migrationReport: LoadResult['report'];

  onChange(listener: () => void): void {
    this.listeners.add(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
    persistSave(this.storage, this.save);
  }

  /* ---------- progression ---------- */

  isStageUnlocked(stageId: string): boolean {
    const index = STAGE_ORDER.indexOf(stageId);
    if (index < 0) return false;
    if (index === 0) return true;
    return this.isStageCleared(STAGE_ORDER[index - 1]);
  }

  isStageCleared(stageId: string): boolean {
    const worldId = worldIdForStage(stageId);
    if (worldId === null) return false;
    return this.save.worlds[worldId]?.[stageId]?.cleared === true;
  }

  stageProgress(stageId: string): StageProgress {
    const worldId = worldIdForStage(stageId);
    return (
      this.save.worlds[worldId ?? '']?.[stageId] ?? {
        cleared: false,
        stars: 0,
      }
    );
  }

  /**
   * Master doc 11.2: commit world10Complete / world11Unlocked /
   * pendingDimensionCutscene immediately when Mom is defeated — BEFORE any
   * cinematic runs. A crash afterwards resumes from the pending event.
   */
  recordStageClear(stageId: string, stars: number, timeMs: number): void {
    const found = findStage(stageId);
    if (found === null) return;
    const { world, stage } = found;
    const record = this.save.worlds[world.id] ?? {};
    const prev = record[stageId];
    record[stageId] = {
      cleared: true,
      stars: Math.max(prev?.stars ?? 0, stars),
      bestTimeMs:
        prev?.bestTimeMs === undefined ? timeMs : Math.min(prev.bestTimeMs, timeMs),
    };
    this.save.worlds[world.id] = record;

    if (stage.worldGate && world.id === 'world-10-birthday-multiverse') {
      this.save.world10Complete = true;
      this.save.world11Unlocked = true;
      this.save.pendingDimensionCutscene = true;
    }
    this.notify();
  }

  /** Call when the dimension cinematic completes or is skipped. */
  markDimensionCutsceneSeen(): void {
    this.save.dimensionCutsceneSeen = true;
    this.save.pendingDimensionCutscene = false;
    this.notify();
  }

  /* ---------- loadout ---------- */

  grantPet(petId: GameSave['pets']['owned'][number], customName?: string): void {
    if (!this.save.pets.owned.includes(petId)) this.save.pets.owned.push(petId);
    if (customName !== undefined) this.save.pets.customNames[petId] = customName;
    this.notify();
  }

  setLoadout(cat: GameSave['pets']['equippedCat'], dog: GameSave['pets']['equippedDog']): void {
    this.save.pets.equippedCat = cat;
    this.save.pets.equippedDog = dog;
    this.notify();
  }

  setFriend(friend: GameSave['friendAssist']): void {
    this.save.friendAssist = friend;
    this.notify();
  }

  addCoins(n: number): void {
    this.save.coins += n;
    this.notify();
  }

  updateSettings(patch: Partial<AccessibilitySettings>): void {
    this.save.settings = { ...this.save.settings, ...patch };
    this.notify();
  }

  /* ---------- local export/import ---------- */

  export(): string {
    return exportSave(this.save);
  }

  import(raw: string): boolean {
    const parsed = importSave(raw);
    if (parsed === null) return false;
    this.save = parsed;
    this.notify();
    return true;
  }

  reset(): void {
    this.save = createDefaultSave();
    this.notify();
  }
}

/** Bound to window.localStorage in main.ts. */
export type { StorageLike };
export { GameRuntime };
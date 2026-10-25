/**
 * Legacy save migration (master design document section 11.1).
 *
 * - Migrates BOTH `kinan-remaster-v1` and legacy `k11v3` into the versioned
 *   `kinan-worlds-v1` schema.
 * - Legacy keys are READ-ONLY: never written, renamed, or deleted here.
 * - A last-known-good backup is written and re-read/validated BEFORE any
 *   new-schema record is committed.
 *
 * Provisional mapping assumptions (documented, reversible):
 * - Legacy pet slots map in acquisition order: cat1..cat4 -> Garfield, Vader,
 *   Duchess, Tuxedo; dog1..dog2 -> Chikastino, Hunter. Custom names carry over.
 * - Each beaten legacy stage clears one stage of the new stage order.
 * - Legacy candles carry over as coins.
 */

import {
  SAVE_KEY,
  SAVE_SCHEMA_VERSION,
  createDefaultSave,
  isSaveShapeValid,
  parseLegacyK11v3,
  parseLegacyRemasterV1,
  type GameSave,
  type StageProgress,
} from './save';
import { STAGE_ORDER, worldIdForStage } from '../game/data/worlds';
import type { PetId } from './ids';

export const LEGACY_PET_MAP: Readonly<Record<string, PetId>> = {
  cat1: 'pet-garfield',
  cat2: 'pet-vader',
  cat3: 'pet-duchess',
  cat4: 'pet-tuxedo',
  dog1: 'pet-chikastino',
  dog2: 'pet-hunter',
};

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface MigrationReport {
  migrated: boolean;
  sources: string[];
  warnings: string[];
}

export interface LoadResult {
  save: GameSave;
  report: MigrationReport;
}

function safeParse(raw: string | null): unknown {
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function applyStageProgress(
  save: GameSave,
  beatenCount: number,
  candles: number,
  extraClears: number,
): void {
  const clearCount = Math.min(beatenCount + extraClears, STAGE_ORDER.length);
  for (let i = 0; i < clearCount; i++) {
    const stageId = STAGE_ORDER[i];
    const worldId = worldIdForStage(stageId);
    if (worldId === null) continue;
    const record: Record<string, StageProgress> = save.worlds[worldId] ?? {};
    record[stageId] = {
      cleared: true,
      stars: Math.max(record[stageId]?.stars ?? 0, i < beatenCount ? 1 : 0),
    };
    save.worlds[worldId] = record;
  }
  save.coins += Math.max(0, candles);
}

function migrateLegacyInto(
  save: GameSave,
  raw: unknown,
  source: string,
  report: MigrationReport,
): void {
  if (raw === null) return;

  if (source === 'kinan-remaster-v1') {
    const v1 = parseLegacyRemasterV1(raw);
    applyStageProgress(save, v1.beaten.length, v1.totalCandles, 0);
    for (const legacyId of v1.ownedPetIds) {
      const mapped = LEGACY_PET_MAP[legacyId];
      if (mapped !== undefined && !save.pets.owned.includes(mapped)) {
        save.pets.owned.push(mapped);
      }
      const custom = v1.petNames[legacyId];
      if (mapped !== undefined && custom !== undefined) {
        save.pets.customNames[mapped] = custom;
      }
    }
    report.sources.push(source);
    return;
  }

  const k11 = parseLegacyK11v3(raw);
  applyStageProgress(save, k11.beaten.length, k11.totalCandles, 0);
  if (k11.hasCat && !save.pets.owned.includes('pet-garfield')) {
    save.pets.owned.push('pet-garfield');
  }
  if (k11.hasDog && !save.pets.owned.includes('pet-chikastino')) {
    save.pets.owned.push('pet-chikastino');
  }
  report.sources.push(source);
}

/**
 * Build a migrated save from legacy storage records. Reads storage only —
 * never writes. Returns a default save when no legacy data exists.
 */
export function migrateFromLegacy(storage: StorageLike): LoadResult {
  const report: MigrationReport = { migrated: false, sources: [], warnings: [] };
  const save = createDefaultSave();

  const rawV1 = storage.getItem('kinan-remaster-v1');
  const rawK11 = storage.getItem('k11v3');
  const sound = storage.getItem('k11v3-sound');

  if (rawV1 !== null) {
    migrateLegacyInto(save, safeParse(rawV1), 'kinan-remaster-v1', report);
  }
  if (rawK11 !== null) {
    /* First-N stage mapping makes both sources idempotent on overlap;
       no extra clears are granted beyond what each source actually earned. */
    migrateLegacyInto(save, safeParse(rawK11), 'k11v3', report);
  }
  if (sound === 'false') {
    save.settings.musicVolume = 0;
    save.settings.sfxVolume = 0;
    save.settings.voiceVolume = 0;
    report.warnings.push('k11v3-sound=false honored: volumes start muted.');
  }

  report.migrated = report.sources.length > 0;
  return { save, report };
}

/** Commit order per master doc 11.1: backup + validate first, then write. */
export function commitMigratedSave(
  storage: StorageLike,
  save: GameSave,
): boolean {
  if (!isSaveShapeValid(save)) return false;
  const serialized = JSON.stringify(save);
  storage.setItem(`${SAVE_KEY}-backup`, serialized);
  const verified = safeParse(storage.getItem(`${SAVE_KEY}-backup`));
  if (verified === null || (verified as GameSave).schemaVersion !== SAVE_SCHEMA_VERSION) {
    return false; /* backup failed validation — do not commit */
  }
  storage.setItem(SAVE_KEY, serialized);
  return true;
}

/**
 * Load the new save, migrating legacy data when the new record is absent.
 * Legacy keys are left untouched in every path.
 */
export function loadSave(storage: StorageLike): LoadResult {
  const rawNew = safeParse(storage.getItem(SAVE_KEY));
  if (rawNew !== null && isSaveShapeValid(rawNew as GameSave)) {
    return {
      save: rawNew as GameSave,
      report: { migrated: false, sources: [], warnings: [] },
    };
  }

  const migrated = migrateFromLegacy(storage);
  if (migrated.report.migrated) {
    if (commitMigratedSave(storage, migrated.save)) {
      return migrated;
    }
    migrated.report.warnings.push('Backup validation failed; migration not committed.');
  }
  return { save: createDefaultSave(), report: migrated.report };
}

/** Persist the current save with a last-known-good backup first. */
export function persistSave(storage: StorageLike, save: GameSave): boolean {
  return commitMigratedSave(storage, save);
}

/** Local export (master doc 11.1: no account required). */
export function exportSave(save: GameSave): string {
  return JSON.stringify(save, null, 2);
}

/** Local import with full validation; null on any invalid payload. */
export function importSave(raw: string): GameSave | null {
  try {
    const parsed = JSON.parse(raw) as GameSave;
    return isSaveShapeValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
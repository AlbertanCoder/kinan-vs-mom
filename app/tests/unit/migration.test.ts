import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  loadSave,
  migrateFromLegacy,
  commitMigratedSave,
  exportSave,
  importSave,
  type StorageLike,
} from '../../src/shared/migration';
import {
  SAVE_KEY,
  LEGACY_KEYS,
  createDefaultSave,
  isSaveShapeValid,
} from '../../src/shared/save';

const fixture = (name: string): string =>
  readFileSync(
    fileURLToPath(new URL(`../fixtures/saves/${name}`, import.meta.url)),
    'utf8',
  );

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
  keys(): string[] {
    return [...this.map.keys()];
  }
}

function storageWithLegacy(): MemoryStorage {
  const s = new MemoryStorage();
  s.setItem('kinan-remaster-v1', fixture('kinan-remaster-v1.sample.json'));
  s.setItem('k11v3', fixture('k11v3.sample.json'));
  s.setItem('k11v3-sound', 'true');
  return s;
}

describe('legacy save migration (master doc 11.1)', () => {
  it('migrates both legacy formats into the versioned schema', () => {
    const s = storageWithLegacy();
    const { save, report } = migrateFromLegacy(s);
    expect(report.migrated).toBe(true);
    expect(report.sources).toContain('kinan-remaster-v1');
    expect(report.sources).toContain('k11v3');
    expect(save.schemaVersion).toBe(1);
    expect(isSaveShapeValid(save)).toBe(true);
  });

  it('preserves legacy keys untouched (read-only)', () => {
    const s = storageWithLegacy();
    const before = LEGACY_KEYS.map((k) => s.getItem(k));
    loadSave(s);
    const after = LEGACY_KEYS.map((k) => s.getItem(k));
    expect(after).toEqual(before);
  });

  it('maps legacy pet slots and custom names by documented order', () => {
    const s = storageWithLegacy();
    const { save } = migrateFromLegacy(s);
    /* fixture: cat1, cat2, dog1 owned; cat1 named "Garfield", dog1 "Chikastino" */
    expect(save.pets.owned).toContain('pet-garfield');
    expect(save.pets.owned).toContain('pet-vader');
    expect(save.pets.owned).toContain('pet-chikastino');
    expect(save.pets.customNames['pet-garfield']).toBe('Garfield');
    expect(save.pets.customNames['pet-chikastino']).toBe('Chikastino');
  });

  it('carries candles over as coins and grants stage clears', () => {
    const s = storageWithLegacy();
    const { save } = migrateFromLegacy(s);
    expect(save.coins).toBeGreaterThan(0);
    const cleared = Object.values(save.worlds)
      .flatMap((record) => Object.values(record ?? {}))
      .filter((p) => p.cleared);
    expect(cleared.length).toBeGreaterThan(0);
  });

  it('commits backup-first: a last-known-good record exists and validates', () => {
    const s = storageWithLegacy();
    loadSave(s);
    const backup = s.getItem(`${SAVE_KEY}-backup`);
    expect(backup).not.toBeNull();
    expect(JSON.parse(backup as string).schemaVersion).toBe(1);
    expect(s.getItem(SAVE_KEY)).not.toBeNull();
  });

  it('honors k11v3-sound=false by starting muted', () => {
    const s = storageWithLegacy();
    s.setItem('k11v3-sound', 'false');
    const { save, report } = migrateFromLegacy(s);
    expect(save.settings.musicVolume).toBe(0);
    expect(report.warnings.length).toBeGreaterThan(0);
  });

  it('refuses to commit an invalid save', () => {
    const s = new MemoryStorage();
    const bad = { schemaVersion: 999 } as never;
    expect(commitMigratedSave(s, bad)).toBe(false);
    expect(s.getItem(SAVE_KEY)).toBeNull();
  });

  it('returns a default save when nothing exists', () => {
    const s = new MemoryStorage();
    const { save, report } = loadSave(s);
    expect(report.migrated).toBe(false);
    expect(save.schemaVersion).toBe(1);
  });

  it('loads an existing new-schema save without re-migration', () => {
    const s = storageWithLegacy();
    const first = loadSave(s).save;
    first.coins = 999;
    commitMigratedSave(s, first);
    const second = loadSave(s);
    expect(second.save.coins).toBe(999);
    expect(second.report.migrated).toBe(false);
  });

  it('export/import round-trips and rejects corrupt payloads', () => {
    const s = storageWithLegacy();
    const { save } = migrateFromLegacy(s);
    const raw = exportSave(save);
    const imported = importSave(raw);
    expect(imported).not.toBeNull();
    expect(imported?.coins).toBe(save.coins);
    expect(importSave('{corrupt')).toBeNull();
    expect(importSave('{"schemaVersion":1}')).toBeNull();
  });

  it('never throws or accepts malformed current-schema records', () => {
    const malformed = [
      '{corrupt',
      '{"schemaVersion":1}',
      '{"schemaVersion":1,"pets":null}',
      JSON.stringify({ ...createDefaultSave(), settings: undefined }),
      JSON.stringify({ ...createDefaultSave(), coins: -1 }),
    ];

    for (const raw of malformed) {
      const s = new MemoryStorage();
      s.setItem(SAVE_KEY, raw);
      expect(() => loadSave(s)).not.toThrow();
      const result = loadSave(s);
      expect(isSaveShapeValid(result.save)).toBe(true);
      expect(result.save.coins).toBe(0);
    }
  });

  it('keeps the previous valid save as the last-known-good backup', () => {
    const s = new MemoryStorage();
    const first = createDefaultSave();
    const second = { ...first, coins: 10 };
    const third = { ...second, coins: 20 };

    expect(commitMigratedSave(s, first)).toBe(true);
    expect(commitMigratedSave(s, second)).toBe(true);
    expect(commitMigratedSave(s, third)).toBe(true);

    expect(JSON.parse(s.getItem(SAVE_KEY) as string).coins).toBe(20);
    expect(JSON.parse(s.getItem(`${SAVE_KEY}-backup`) as string).coins).toBe(10);
  });

  it('recovers and restores a valid backup when the current record is damaged', () => {
    const s = new MemoryStorage();
    const original = createDefaultSave();
    const latest = { ...original, coins: 42 };
    commitMigratedSave(s, original);
    commitMigratedSave(s, latest);
    commitMigratedSave(s, { ...latest, coins: 43 });
    s.setItem(SAVE_KEY, '{"schemaVersion":1,"pets":null}');

    const recovered = loadSave(s);
    expect(recovered.save.coins).toBe(42);
    expect(recovered.report.warnings.join(' ')).toMatch(/recovered/i);
    expect(JSON.parse(s.getItem(SAVE_KEY) as string).coins).toBe(42);
  });

  it('returns false instead of committing when the backup cannot be written', () => {
    class FailingBackupStorage extends MemoryStorage {
      override setItem(key: string, value: string): void {
        if (key === `${SAVE_KEY}-backup`) throw new Error('quota exhausted');
        super.setItem(key, value);
      }
    }

    const s = new FailingBackupStorage();
    expect(() => commitMigratedSave(s, createDefaultSave())).not.toThrow();
    expect(commitMigratedSave(s, createDefaultSave())).toBe(false);
    expect(s.getItem(SAVE_KEY)).toBeNull();
  });
});
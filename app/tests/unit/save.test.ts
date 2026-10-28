import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  LEGACY_KEYS,
  SAVE_KEY,
  SAVE_SCHEMA_VERSION,
  createDefaultSave,
  isFriendAssistValid,
  isLoadoutValid,
  isSaveShapeValid,
  parseLegacyK11v3,
  parseLegacyRemasterV1,
} from '../../src/shared/save';

const fixture = (name: string): unknown =>
  JSON.parse(
    readFileSync(
      fileURLToPath(new URL(`../fixtures/saves/${name}`, import.meta.url)),
      'utf8',
    ),
  );

describe('new save schema scaffolding', () => {
  it('creates a valid default save at the current schema version', () => {
    const save = createDefaultSave();
    expect(save.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(isSaveShapeValid(save)).toBe(true);
    expect(save.pets.equippedCat).toBeNull();
    expect(save.pets.equippedDog).toBeNull();
  });

  it('enforces one cat and one dog, or solo (master doc 6.1)', () => {
    const pets = createDefaultSave().pets;
    expect(isLoadoutValid(pets)).toBe(true);

    /* equipped pets must be owned */
    pets.equippedCat = 'pet-ginger';
    expect(isLoadoutValid(pets)).toBe(false);

    pets.owned.push('pet-ginger', 'pet-chikastino');
    expect(isLoadoutValid(pets)).toBe(true);

    /* Tuxedo is a black cat (master doc 6.1) — he cannot fill the dog slot */
    pets.owned.push('pet-tuxedo');
    pets.equippedDog = 'pet-tuxedo';
    expect(isLoadoutValid(pets)).toBe(false);

    pets.equippedDog = 'pet-chikastino';
    expect(isLoadoutValid(pets)).toBe(true);

    (pets as { equippedCat: unknown }).equippedCat = 'not-a-pet';
    expect(isLoadoutValid(pets)).toBe(false);
  });

  it('accepts at most one Friend Assist', () => {
    expect(isFriendAssistValid(null)).toBe(true);
    expect(isFriendAssistValid('friend-milo')).toBe(true);
    expect(isFriendAssistValid('friend-aiden')).toBe(true);
    expect(isFriendAssistValid('friend-nobody' as never)).toBe(false);
  });

  it('keeps the legacy keys registered for preservation', () => {
    expect([...LEGACY_KEYS]).toEqual(['kinan-remaster-v1', 'k11v3', 'k11v3-sound']);
    expect(SAVE_KEY).not.toBe('kinan-remaster-v1');
  });

  it('rejects malformed nested data without throwing', () => {
    const valid = createDefaultSave();
    const sparsePets = createDefaultSave();
    sparsePets.pets.owned = new Array(1);
    const invalid: unknown[] = [
      null,
      [],
      { ...valid, worlds: null },
      { ...valid, worlds: { 'Invalid ID': {} } },
      {
        ...valid,
        worlds: {
          'world-01-saskatoon-home': {
            'w01-bedroom-chaos': { cleared: true, stars: 4 },
          },
        },
      },
      { ...valid, settings: { ...valid.settings, touchScale: 2 } },
      {
        ...valid,
        pets: { ...valid.pets, owned: ['pet-ginger', 'pet-ginger'] },
      },
      { ...valid, pets: { ...valid.pets, customNames: { unknown: 'name' } } },
      { ...valid, friendAssist: 'friend-nobody' },
      { ...valid, world11Unlocked: 'true' },
      sparsePets,
    ];

    for (const candidate of invalid) {
      expect(() => isSaveShapeValid(candidate)).not.toThrow();
      expect(isSaveShapeValid(candidate)).toBe(false);
    }
  });
});

describe('legacy read-only adapters', () => {
  it('parses the kinan-remaster-v1 fixture without mutating it', () => {
    const raw = fixture('kinan-remaster-v1.sample.json');
    const before = JSON.stringify(raw);
    const summary = parseLegacyRemasterV1(raw);

    expect(summary.key).toBe('kinan-remaster-v1');
    expect(summary.unlocked).toBe(12);
    expect(summary.beaten).toHaveLength(12);
    expect(summary.totalCandles).toBe(214);
    expect(summary.ownedPetIds).toEqual(['cat1', 'cat2', 'dog1']);
    expect(summary.petNames.dog1).toBe('Chikastino');
    expect(summary.won).toBe(true);
    expect(JSON.stringify(raw)).toBe(before);
  });

  it('parses the k11v3 fixture including the separate sound key', () => {
    const raw = fixture('k11v3.sample.json');
    const summary = parseLegacyK11v3(raw, true);

    expect(summary.key).toBe('k11v3');
    expect(summary.unlocked).toBe(7);
    expect(summary.beaten).toEqual([0, 1, 2, 3]);
    expect(summary.totalCandles).toBe(88);
    expect(summary.hasCat).toBe(true);
    expect(summary.hasDog).toBe(true);
    expect(summary.sound).toBe(true);
  });

  it('treats the sound key default as audible (legacy behavior)', () => {
    expect(parseLegacyK11v3({}).sound).toBe(true);
    expect(parseLegacyK11v3({}, false).sound).toBe(false);
  });

  it('never throws on damaged or missing saves', () => {
    expect(() => parseLegacyRemasterV1(null)).not.toThrow();
    expect(() => parseLegacyRemasterV1('corrupt')).not.toThrow();
    expect(() => parseLegacyRemasterV1([1, 2, 3])).not.toThrow();
    expect(() => parseLegacyK11v3(undefined)).not.toThrow();

    const summary = parseLegacyRemasterV1({ pets: { ids: 'oops', names: 5 } });
    expect(summary.ownedPetIds).toEqual([]);
    expect(summary.petNames).toEqual({});
    expect(summary.unlocked).toBe(1);
  });
});

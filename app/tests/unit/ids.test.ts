import { describe, expect, it } from 'vitest';
import {
  FRIEND_IDS,
  PET_IDS,
  WORLD_IDS,
  assertUniqueIds,
  isStableId,
} from '../../src/shared/ids';

describe('stable IDs', () => {
  it('every registered ID is a stable kebab-case string', () => {
    for (const id of [...WORLD_IDS, ...PET_IDS, ...FRIEND_IDS]) {
      expect(isStableId(id), id).toBe(true);
    }
  });

  it('IDs are unique across all registries', () => {
    expect(() =>
      assertUniqueIds([...WORLD_IDS, ...PET_IDS, ...FRIEND_IDS]),
    ).not.toThrow();
  });

  it('registers exactly eleven worlds, six pets, and two friends', () => {
    expect(WORLD_IDS).toHaveLength(11);
    expect(PET_IDS).toHaveLength(6);
    expect(FRIEND_IDS).toHaveLength(2);
  });

  it('rejects array-position identities and malformed IDs', () => {
    expect(isStableId('0')).toBe(false);
    expect(isStableId('World_1')).toBe(false);
    expect(isStableId('')).toBe(false);
    expect(isStableId(7)).toBe(false);
    expect(isStableId(null)).toBe(false);
    expect(isStableId('pet--ginger')).toBe(false);
  });

  it('flags duplicates', () => {
    expect(() => assertUniqueIds(['a', 'b', 'a'])).toThrow(/Duplicate/);
  });
});

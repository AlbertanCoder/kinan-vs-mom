/**
 * Stable string IDs (Milestone 1 scaffolding).
 *
 * Per the master design document, worlds, stages, characters, pets, friends,
 * audio, and objectives use stable string IDs. Array position is never a
 * permanent save identity — these IDs are the contract the M2 save schema
 * and migration will be built against.
 */

export type WorldId =
  | 'world-01-saskatoon-home'
  | 'world-02-saskatoon-school'
  | 'world-03-alberta-work-trip'
  | 'world-04-edmonton'
  | 'world-05-calgary-stampede'
  | 'world-06-vancouver-rain'
  | 'world-07-lego-brick-realms'
  | 'world-08-prehistoric'
  | 'world-09-starbase-annie'
  | 'world-10-birthday-multiverse'
  | 'world-11-dimension-11';

export type PetId =
  | 'pet-garfield'
  | 'pet-chikastino'
  | 'pet-vader'
  | 'pet-hunter'
  | 'pet-duchess'
  | 'pet-tuxedo';

export type FriendId = 'friend-milo' | 'friend-aiden';

export const WORLD_IDS: readonly WorldId[] = [
  'world-01-saskatoon-home',
  'world-02-saskatoon-school',
  'world-03-alberta-work-trip',
  'world-04-edmonton',
  'world-05-calgary-stampede',
  'world-06-vancouver-rain',
  'world-07-lego-brick-realms',
  'world-08-prehistoric',
  'world-09-starbase-annie',
  'world-10-birthday-multiverse',
  'world-11-dimension-11',
];

export const PET_IDS: readonly PetId[] = [
  'pet-garfield',
  'pet-chikastino',
  'pet-vader',
  'pet-hunter',
  'pet-duchess',
  'pet-tuxedo',
];

/** Species split for the loadout rule (one cat AND one dog) — master doc 6.1. */
export const CAT_IDS: readonly PetId[] = [
  'pet-garfield',
  'pet-vader',
  'pet-duchess',
  'pet-tuxedo',
];
export const DOG_IDS: readonly PetId[] = ['pet-chikastino', 'pet-hunter'];

export const FRIEND_IDS: readonly FriendId[] = ['friend-milo', 'friend-aiden'];

/** Lowercase kebab-case slugs that start with a letter — readable, stable,
 *  and never an array position ("0", "7", ... are always invalid). */
const STABLE_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export function isStableId(value: unknown): value is string {
  return typeof value === 'string' && STABLE_ID_PATTERN.test(value);
}

export function assertUniqueIds(ids: readonly string[]): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      throw new Error(`Duplicate stable ID: ${id}`);
    }
    seen.add(id);
  }
}

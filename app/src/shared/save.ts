/**
 * Save scaffolding and the legacy compatibility boundary (Milestone 1).
 *
 * The new runtime reads legacy saves ONLY through the read-only adapters in
 * this module. Adapters never write, delete, or rename legacy storage keys —
 * migration lands in M2 only after fixtures validate and a last-known-good
 * backup succeeds (master design document section 11.1).
 */

import { PET_IDS, CAT_IDS, DOG_IDS, FRIEND_IDS, type PetId, type FriendId } from './ids';

export const SAVE_SCHEMA_VERSION = 1;

/** Storage key for the new versioned save. */
export const SAVE_KEY = 'kinan-worlds-v1';

/**
 * Legacy keys that MUST survive upgrades untouched. Erasing any of these
 * before a validated migration is a bug.
 */
export const LEGACY_KEYS = ['kinan-remaster-v1', 'k11v3', 'k11v3-sound'] as const;

export interface AccessibilitySettings {
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  captions: boolean;
  reducedMotion: boolean;
  screenShake: boolean;
  /** Touch control scale 0.8 – 1.4. */
  touchScale: number;
}

export const DEFAULT_SETTINGS: AccessibilitySettings = {
  musicVolume: 0.8,
  sfxVolume: 0.8,
  voiceVolume: 0.9,
  captions: true,
  reducedMotion: false,
  screenShake: true,
  touchScale: 1,
};

export interface StageProgress {
  cleared: boolean;
  stars: number;
  /** Best clear time in milliseconds. */
  bestTimeMs?: number;
}

export interface PetState {
  owned: PetId[];
  /** At most one cat and one dog may be equipped, or neither (solo). */
  equippedCat: PetId | null;
  equippedDog: PetId | null;
  customNames: Partial<Record<PetId, string>>;
}

export interface GameSave {
  schemaVersion: number;
  worlds: Partial<Record<string, Record<string, StageProgress>>>;
  pets: PetState;
  /** At most one Friend Assist (Milo or Aiden), or none. */
  friendAssist: FriendId | null;
  /** Set immediately when Mom is defeated — before the cinematic (section 11.2). */
  world10Complete: boolean;
  world11Unlocked: boolean;
  pendingDimensionCutscene: boolean;
  dimensionCutsceneSeen: boolean;
  /** Lifetime coins (legacy "candles" migrate here). */
  coins: number;
  settings: AccessibilitySettings;
}

export function createDefaultSave(): GameSave {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    worlds: {},
    pets: {
      owned: [],
      equippedCat: null,
      equippedDog: null,
      customNames: {},
    },
    friendAssist: null,
    world10Complete: false,
    world11Unlocked: false,
    pendingDimensionCutscene: false,
    dimensionCutsceneSeen: false,
    coins: 0,
    settings: { ...DEFAULT_SETTINGS },
  };
}

/** Loadout rule: one cat AND one dog, or solo (master doc section 6). */
export function isLoadoutValid(pets: PetState): boolean {
  const { owned, equippedCat, equippedDog } = pets;
  if (equippedCat !== null) {
    if (!CAT_IDS.includes(equippedCat)) return false;
    if (!owned.includes(equippedCat)) return false;
  }
  if (equippedDog !== null) {
    if (!DOG_IDS.includes(equippedDog)) return false;
    if (!owned.includes(equippedDog)) return false;
  }
  return true;
}

export function isFriendAssistValid(friend: FriendId | null): boolean {
  return friend === null || FRIEND_IDS.includes(friend);
}

export function isPetRosterValid(pets: PetState): boolean {
  return pets.owned.every((id) => PET_IDS.includes(id));
}

export function isSaveShapeValid(save: GameSave): boolean {
  return (
    save.schemaVersion === SAVE_SCHEMA_VERSION &&
    isPetRosterValid(save.pets) &&
    isLoadoutValid(save.pets) &&
    isFriendAssistValid(save.friendAssist)
  );
}

/* ------------------------------------------------------------------ *
 * Legacy read-only adapters (compatibility/reference boundary)
 * ------------------------------------------------------------------ */

export interface LegacyRemasterV1Summary {
  key: 'kinan-remaster-v1';
  unlocked: number;
  beaten: number[];
  totalCandles: number;
  ownedPetIds: string[];
  petNames: Record<string, string>;
  won: boolean;
}

export interface LegacyK11v3Summary {
  key: 'k11v3';
  unlocked: number;
  beaten: number[];
  totalCandles: number;
  hasCat: boolean;
  hasDog: boolean;
  sound: boolean;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asNumberArray(value: unknown): number[] {
  return Array.isArray(value) ? value.filter((n): n is number => typeof n === 'number') : [];
}

/** Read-only: summarizes `localStorage["kinan-remaster-v1"]` without touching storage. */
export function parseLegacyRemasterV1(raw: unknown): LegacyRemasterV1Summary {
  const data = asRecord(raw);
  const pets = asRecord(data.pets);
  const names = asRecord(pets.names);
  return {
    key: 'kinan-remaster-v1',
    unlocked: typeof data.unlocked === 'number' ? data.unlocked : 1,
    beaten: asNumberArray(data.beaten),
    totalCandles: typeof data.totalCandles === 'number' ? data.totalCandles : 0,
    ownedPetIds: Array.isArray(pets.ids)
      ? pets.ids.filter((id): id is string => typeof id === 'string')
      : [],
    petNames: Object.fromEntries(
      Object.entries(names).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
    ),
    won: data.won === true,
  };
}

/**
 * Read-only: summarizes the original game's `localStorage["k11v3"]` record.
 * `sound` lives in the separate "k11v3-sound" key (legacy behavior).
 */
export function parseLegacyK11v3(raw: unknown, sound: unknown = true): LegacyK11v3Summary {
  const data = asRecord(raw);
  const pets = asRecord(data.pets);
  return {
    key: 'k11v3',
    unlocked: typeof data.unlocked === 'number' ? data.unlocked : 1,
    beaten: asNumberArray(data.beaten),
    totalCandles: typeof data.totalCandles === 'number' ? data.totalCandles : 0,
    hasCat: pets.cat === true,
    hasDog: pets.dog === true,
    sound: sound !== false,
  };
}

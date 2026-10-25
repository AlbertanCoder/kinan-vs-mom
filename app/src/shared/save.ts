/**
 * Save scaffolding and the legacy compatibility boundary (Milestone 1).
 *
 * The new runtime reads legacy saves ONLY through the read-only adapters in
 * this module. Adapters never write, delete, or rename legacy storage keys —
 * migration lands in M2 only after fixtures validate and a last-known-good
 * backup succeeds (master design document section 11.1).
 */

import {
  PET_IDS,
  CAT_IDS,
  DOG_IDS,
  FRIEND_IDS,
  isStableId,
  type PetId,
  type FriendId,
} from './ids';

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

export function isFriendAssistValid(friend: unknown): friend is FriendId | null {
  return (
    friend === null ||
    (typeof friend === 'string' && FRIEND_IDS.includes(friend as FriendId))
  );
}

export function isPetRosterValid(pets: PetState): boolean {
  /* Array.from also visits sparse slots, which JSON data must never smuggle
     through validation as apparently empty ownership entries. */
  const owned = Array.from(pets.owned);
  return (
    owned.every((id) => typeof id === 'string' && PET_IDS.includes(id)) &&
    new Set(owned).size === owned.length
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNumberInRange(value: unknown, min: number, max: number): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}

function isStageProgressValid(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    typeof value.cleared === 'boolean' &&
    typeof value.stars === 'number' &&
    Number.isInteger(value.stars) &&
    value.stars >= 0 &&
    value.stars <= 3 &&
    (value.bestTimeMs === undefined ||
      (isNumberInRange(value.bestTimeMs, 0, Number.MAX_SAFE_INTEGER) &&
        Number.isInteger(value.bestTimeMs)))
  );
}

function areWorldsValid(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return Object.entries(value).every(([worldId, stages]) => {
    if (!isStableId(worldId) || !isRecord(stages)) return false;
    return Object.entries(stages).every(
      ([stageId, progress]) =>
        isStableId(stageId) && isStageProgressValid(progress),
    );
  });
}

function areSettingsValid(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    isNumberInRange(value.musicVolume, 0, 1) &&
    isNumberInRange(value.sfxVolume, 0, 1) &&
    isNumberInRange(value.voiceVolume, 0, 1) &&
    typeof value.captions === 'boolean' &&
    typeof value.reducedMotion === 'boolean' &&
    typeof value.screenShake === 'boolean' &&
    isNumberInRange(value.touchScale, 0.8, 1.4)
  );
}

/** Full, non-throwing validation for data loaded from storage or local import. */
export function isSaveShapeValid(save: unknown): save is GameSave {
  if (!isRecord(save) || save.schemaVersion !== SAVE_SCHEMA_VERSION) return false;
  if (!areWorldsValid(save.worlds) || !areSettingsValid(save.settings)) return false;

  const pets = save.pets;
  if (!isRecord(pets) || !Array.isArray(pets.owned)) return false;
  const customNames = pets.customNames;
  if (!isRecord(customNames)) return false;
  if (
    !Object.entries(customNames).every(
      ([id, name]) =>
        PET_IDS.includes(id as PetId) && typeof name === 'string',
    )
  ) {
    return false;
  }

  const petState = pets as unknown as PetState;
  return (
    isPetRosterValid(petState) &&
    isLoadoutValid(petState) &&
    isFriendAssistValid(save.friendAssist) &&
    typeof save.world10Complete === 'boolean' &&
    typeof save.world11Unlocked === 'boolean' &&
    typeof save.pendingDimensionCutscene === 'boolean' &&
    typeof save.dimensionCutsceneSeen === 'boolean' &&
    isNumberInRange(save.coins, 0, Number.MAX_SAFE_INTEGER)
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

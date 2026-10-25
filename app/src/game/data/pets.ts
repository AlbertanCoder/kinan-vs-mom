/**
 * Companion roster — exact identities and abilities from
 * MASTER_GAME_DESIGN_DOC.md sections 6.1-6.2. Real pets, fictional friends.
 */

import type { PetId, FriendId } from '../../shared/ids';
import { CAT_IDS, DOG_IDS } from '../../shared/ids';

export type AbilityKind =
  | 'air-jump'
  | 'bark-stun'
  | 'coin-pull'
  | 'snack-fetch'
  | 'snack-rest'
  | 'knockback-reduce';

export interface PetDef {
  id: PetId;
  name: string;
  species: 'cat' | 'dog';
  identity: string;
  abilityName: string;
  ability: AbilityKind;
  abilityText: string;
  /** World where the pet joins (display only). */
  unlockAt: string;
}

export const PETS: PetDef[] = [
  {
    id: 'pet-garfield', name: 'Garfield', species: 'cat',
    identity: 'Youngest orange tabby; playful kitten energy',
    abilityName: 'Kitten Zoomies', ability: 'air-jump',
    abilityText: 'One extra air jump; three clean landings grant a speed boost.',
    unlockAt: 'World 1, Bedroom Chaos',
  },
  {
    id: 'pet-chikastino', name: 'Chikastino', species: 'dog',
    identity: 'Boxer/border collie mix; barks at neighbours',
    abilityName: 'Neighbourhood Watch', ability: 'bark-stun',
    abilityText: 'Warning barks stun nearby enemies briefly (14s cooldown).',
    unlockAt: 'World 1, neighborhood',
  },
  {
    id: 'pet-vader', name: 'Vader', species: 'cat',
    identity: 'Small, kitten-like, extremely curious cat',
    abilityName: 'Curious Force', ability: 'coin-pull',
    abilityText: 'Pulls nearby out-of-reach coins toward Kinan (8s cooldown).',
    unlockAt: 'World 2, school',
  },
  {
    id: 'pet-hunter', name: 'Hunter', species: 'dog',
    identity: 'Border-collie look; shy and runs away',
    abilityName: 'Courage Fetch', ability: 'snack-fetch',
    abilityText: 'Once per level at one heart, fetches a healing snack.',
    unlockAt: 'World 3, camp',
  },
  {
    id: 'pet-duchess', name: 'Duchess', species: 'cat',
    identity: 'Regal long-haired white-and-brown cat; hungry and lazy',
    abilityName: 'Royal Snack Break', ability: 'snack-rest',
    abilityText: 'Food restores one extra heart; checkpoint rest heals two.',
    unlockAt: 'World 4, restaurant',
  },
  {
    id: 'pet-tuxedo', name: 'Tuxedo', species: 'cat',
    identity: 'Black cat with white paws and white V-shaped chest; oldest and cranky',
    abilityName: 'Senior Glare', ability: 'knockback-reduce',
    abilityText: '20% less knockback; glare interrupts charging enemies (16s).',
    unlockAt: 'World 5, Stampede',
  },
];

export interface FriendDef {
  id: FriendId;
  name: string;
  identity: string;
  assistText: string;
}

export const FRIENDS: FriendDef[] = [
  {
    id: 'friend-milo', name: 'Milo',
    identity: 'LEGO-loving classmate',
    assistText: 'Builds a temporary platform for eight seconds (25s cooldown).',
  },
  {
    id: 'friend-aiden', name: 'Aiden',
    identity: 'Sporty classmate',
    assistText: 'Healing snack once per checkpoint; distracts enemies 3s.',
  },
];

export function petById(id: PetId): PetDef | null {
  return PETS.find((p) => p.id === id) ?? null;
}

export function friendById(id: FriendId): FriendDef | null {
  return FRIENDS.find((f) => f.id === id) ?? null;
}

/**
 * Tuxedo is a black cat per the master document despite the name.
 * The species split for the loadout rule lives in shared/ids.ts
 * (cats = Garfield, Vader, Duchess, Tuxedo; dogs = Chikastino, Hunter).
 */
export { CAT_IDS, DOG_IDS };
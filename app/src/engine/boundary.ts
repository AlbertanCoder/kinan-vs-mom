/**
 * Engine boundary (Milestone 1).
 *
 * Worlds 1-10 run on Phaser 3 (2D). World 11 alone uses Three.js, and only
 * after its unlock or an explicit local developer preview. Neither engine may
 * silently write the other engine's private state — shared progression lives
 * in `shared/save.ts`.
 */

import type { GameSave } from '../shared/save';
import { isDevToolsEnabled, type DevGateContext } from '../shared/devGate';

export type EngineKind = 'phaser-2d' | 'three-3d';

export interface EngineDescriptor {
  kind: EngineKind;
  /** Stable world IDs this engine may render. */
  worlds: string[];
}

export const ENGINE_2D: EngineDescriptor = {
  kind: 'phaser-2d',
  worlds: [
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
  ],
};

export const ENGINE_3D: EngineDescriptor = {
  kind: 'three-3d',
  worlds: ['world-11-dimension-11'],
};

/** World 11 loads its Three.js engine only after the World 10 completion unlock. */
export function canLoad3DEngine(save: GameSave, ctx?: DevGateContext): boolean {
  if (save.world11Unlocked && save.world10Complete) return true;
  return ctx !== undefined && isDevToolsEnabled(ctx);
}

export function engineForWorld(
  worldId: string,
  save: GameSave,
  ctx?: DevGateContext,
): EngineDescriptor | null {
  if (ENGINE_3D.worlds.includes(worldId)) {
    return canLoad3DEngine(save, ctx) ? ENGINE_3D : null;
  }
  return ENGINE_2D.worlds.includes(worldId) ? ENGINE_2D : null;
}

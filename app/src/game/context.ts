/**
 * Shared runtime singletons for all scenes. Scenes import these instead of
 * passing instances through scene-data plumbing.
 */
import { InputManager } from './input';
import { GameRuntime, type StorageLike } from './state';

export const inputMgr = new InputManager();
export const runtime = new GameRuntime(window.localStorage as unknown as StorageLike);
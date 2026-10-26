import { describe, expect, it } from 'vitest';
import {
  hasDevToolsFlag,
  isDevToolsEnabled,
  isLegacy3DAllowed,
  isLocalHost,
} from '../../src/shared/devGate';
import { canLoad3DEngine, engineForWorld, ENGINE_2D, ENGINE_3D } from '../../src/engine/boundary';
import { createDefaultSave } from '../../src/shared/save';

describe('developer-tooling gate', () => {
  it('requires the explicit flag', () => {
    expect(hasDevToolsFlag('')).toBe(false);
    expect(hasDevToolsFlag('?devtools=1')).toBe(true);
    expect(hasDevToolsFlag('?devtools=0')).toBe(false);
    expect(hasDevToolsFlag('?devtools=true')).toBe(false);
    expect(hasDevToolsFlag('?other=1')).toBe(false);
    expect(hasDevToolsFlag('?x=1&devtools=1')).toBe(true);
  });

  it('allows local hosts only', () => {
    expect(isLocalHost('localhost')).toBe(true);
    expect(isLocalHost('127.0.0.1')).toBe(true);
    expect(isLocalHost('[::1]')).toBe(true);
    expect(isLocalHost('albertancoder.github.io')).toBe(false);
    expect(isLocalHost('kinan-vs-mom.netlify.app')).toBe(false);
    expect(isLocalHost('')).toBe(false);
  });

  it('is enabled only with the flag AND a local host', () => {
    expect(isDevToolsEnabled({ search: '?devtools=1', hostname: 'localhost' })).toBe(true);
    expect(isDevToolsEnabled({ search: '?devtools=1', hostname: 'albertancoder.github.io' })).toBe(false);
    expect(isDevToolsEnabled({ search: '', hostname: 'localhost' })).toBe(false);
    expect(isDevToolsEnabled({ search: '', hostname: 'albertancoder.github.io' })).toBe(false);
  });

  it('keeps the quarantined legacy 3D behind the same gate', () => {
    expect(isLegacy3DAllowed({ search: '?devtools=1', hostname: '127.0.0.1' })).toBe(true);
    expect(isLegacy3DAllowed({ search: '?devtools=1&creator=SHAD', hostname: 'example.com' })).toBe(false);
    expect(isLegacy3DAllowed({ search: '?w6=play', hostname: 'albertancoder.github.io' })).toBe(false);
  });
});

describe('engine boundary', () => {
  it('never loads the 3D engine before the World 10 unlock', () => {
    const save = createDefaultSave();
    expect(canLoad3DEngine(save)).toBe(false);
    expect(canLoad3DEngine(save, { search: '', hostname: 'localhost' })).toBe(false);
  });

  it('loads the 3D engine after the unlock transaction, without any URL flag', () => {
    const save = createDefaultSave();
    save.world10Complete = true;
    save.world11Unlocked = true;
    expect(canLoad3DEngine(save)).toBe(true);
    expect(engineForWorld('world-11-dimension-11', save)).toEqual(ENGINE_3D);
  });

  it('allows a local developer preview via the explicit gate', () => {
    const save = createDefaultSave();
    expect(canLoad3DEngine(save, { search: '?devtools=1', hostname: 'localhost' })).toBe(true);
  });

  it('routes Worlds 1-10 to the 2D engine even after the 3D unlock', () => {
    const save = createDefaultSave();
    save.world10Complete = true;
    save.world11Unlocked = true;
    expect(engineForWorld('world-01-saskatoon-home', save)).toEqual(ENGINE_2D);
    expect(engineForWorld('world-10-birthday-multiverse', save)).toEqual(ENGINE_2D);
  });

  it('refuses World 11 entirely when locked', () => {
    expect(engineForWorld('world-11-dimension-11', createDefaultSave())).toBeNull();
    expect(engineForWorld('world-unknown', createDefaultSave())).toBeNull();
  });
});

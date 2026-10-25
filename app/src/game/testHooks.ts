import type { GameRuntime } from './state';
import { createDefaultSave, type GameSave } from '../shared/save';

export interface ShellTestHooks {
  ready: boolean;
  milestone: number;
  save: () => GameSave;
}

declare global {
  interface Window {
    __kvShell?: ShellTestHooks;
  }
}

/**
 * Minimal readiness hooks for the automated browser smoke tests.
 * Read-only by design: no unlock or debug capabilities (master design
 * document section 2 — no public unlock shortcuts in the production runtime).
 */
export function installShellTestHooks(runtime?: GameRuntime): void {
  window.__kvShell = {
    ready: false,
    milestone: 2,
    save: () => (runtime === undefined ? createDefaultSave() : runtime.save),
  };
}

export function markShellReady(): void {
  if (window.__kvShell !== undefined) {
    window.__kvShell.ready = true;
  }
}

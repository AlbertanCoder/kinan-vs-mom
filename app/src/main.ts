import Phaser from 'phaser';
import { createGameConfig } from './game/config';
import { BootScene } from './game/scenes/BootScene';
import { TitleScene } from './game/scenes/TitleScene';
import { MapScene } from './game/scenes/MapScene';
import { StageScene } from './game/scenes/StageScene';
import { SettingsScene } from './game/scenes/SettingsScene';
import type { Action } from './game/input';
import { inputMgr, runtime } from './game/context';
import { audio } from './game/audio';
import { installShellTestHooks } from './game/testHooks';

/*
 * Kinan vs. Worlds — 2D runtime (Phaser 3 + TypeScript + Vite).
 * Worlds 1-10 run here; World 11 alone will use Three.js behind
 * src/engine/boundary.ts after its unlock. Offline bundled, no CDN.
 */

installShellTestHooks(runtime);

const game = new Phaser.Game(
  createGameConfig([BootScene, TitleScene, MapScene, StageScene, SettingsScene]),
);

/* ---------- touch controls (adjustable, multitouch, master doc 4.2) ---------- */

const TOUCH_ACTIONS: { action: Action; label: string; cls: string }[] = [
  { action: 'left', label: '◀', cls: 'dpad' },
  { action: 'right', label: '▶', cls: 'dpad' },
  { action: 'down', label: '▼', cls: 'dpad' },
  { action: 'jump', label: 'JUMP', cls: 'btn' },
  { action: 'ability', label: 'ABILITY', cls: 'btn' },
  { action: 'context', label: 'CONTEXT', cls: 'btn' },
  { action: 'pause', label: '⏸', cls: 'btn' },
];

function buildTouchControls(): void {
  const root = document.getElementById('touch-controls');
  if (root === null) return;
  for (const def of TOUCH_ACTIONS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `touch-btn ${def.cls}`;
    btn.textContent = def.label;
    btn.setAttribute('aria-label', def.label);
    const press = (e: Event): void => {
      e.preventDefault();
      inputMgr.touchPress(def.action);
      audio.init();
    };
    const release = (e: Event): void => {
      e.preventDefault();
      inputMgr.touchRelease(def.action);
    };
    btn.addEventListener('pointerdown', press);
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
    btn.addEventListener('pointerleave', release);
    root.appendChild(btn);
  }
  const scale = (): void => {
    root.style.setProperty('--touch-scale', String(runtime.save.settings.touchScale));
  };
  scale();
  runtime.onChange(scale);
}

buildTouchControls();

/* Show touch controls when the platform reports touch capability. */
if (navigator.maxTouchPoints > 0 || 'ontouchstart' in window) {
  document.body.classList.add('touch-enabled');
}

/* ---------- first-gesture audio init (autoplay policy) ---------- */
window.addEventListener(
  'pointerdown',
  () => {
    audio.init();
    audio.setVolumes(runtime.save.settings.musicVolume, runtime.save.settings.sfxVolume);
  },
  { once: true },
);

/* ---------- status line for the DOM shell / smoke tests ---------- */
const statusEl = document.getElementById('shellStatus');
const startBtn = document.getElementById('startBtn');

function onPrimaryInput(): void {
  if (statusEl !== null) {
    statusEl.textContent = 'Game ready — use the map to pick a stage.';
  }
  document.getElementById('shell-ui')?.classList.add('hidden');
  audio.init();
}

if (startBtn !== null) {
  startBtn.addEventListener('click', onPrimaryInput);
  startBtn.addEventListener('touchstart', onPrimaryInput, { passive: true });
}

window.addEventListener('beforeunload', () => {
  game.destroy(true);
});

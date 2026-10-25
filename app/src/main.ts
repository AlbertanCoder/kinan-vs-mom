import Phaser from 'phaser';
import { createGameConfig } from './game/config';
import { BootScene } from './game/scenes/BootScene';
import { TitleScene } from './game/scenes/TitleScene';
import { installShellTestHooks } from './game/testHooks';

/*
 * Milestone 1 shell: boots the approved Phaser 3 + TypeScript + Vite
 * foundation with placeholder visuals only. No worlds, physics, or audio
 * exist yet — those arrive in later milestones through their own gates.
 */

installShellTestHooks();

const game = new Phaser.Game(createGameConfig([BootScene, TitleScene]));

const statusEl = document.getElementById('shellStatus');
const startBtn = document.getElementById('startBtn');

function onPrimaryInput(): void {
  if (statusEl !== null) {
    statusEl.textContent = 'Shell interaction OK — full input mapping arrives in M2.';
  }
}

if (startBtn !== null) {
  startBtn.addEventListener('click', onPrimaryInput);
  startBtn.addEventListener('touchstart', onPrimaryInput, { passive: true });
}

window.addEventListener('beforeunload', () => {
  game.destroy(true);
});

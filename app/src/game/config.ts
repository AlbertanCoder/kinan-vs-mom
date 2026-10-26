import Phaser from 'phaser';

/** Base stage size for the 2D games (landscape). Scaled with FIT letterboxing. */
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export function createGameConfig(
  scene: Phaser.Types.Scenes.SceneType[],
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: 'game-root',
    backgroundColor: '#0b0d20',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    /* Audio manager arrives in M2; disable Phaser audio for this shell. */
    audio: { noAudio: true },
    scene,
  };
}

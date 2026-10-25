import Phaser from 'phaser';
import { markShellReady } from '../testHooks';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.text(
      width / 2,
      height * 0.62,
      'Phaser 3 shell booted (placeholder visuals)',
      {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '28px',
        color: '#f4f1e8',
      },
    ).setOrigin(0.5);
    markShellReady();
  }
}


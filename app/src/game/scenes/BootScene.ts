import Phaser from 'phaser';

/**
 * Boot: start the title menu. Placeholder art; real animation arrives
 * with the art milestones.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x14162b);
    this.add
      .text(width / 2, height / 2, 'KINAN VS. WORLDS', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '48px',
        color: '#f4f1e8',
      })
      .setOrigin(0.5);
    this.scene.start('title');
  }
}

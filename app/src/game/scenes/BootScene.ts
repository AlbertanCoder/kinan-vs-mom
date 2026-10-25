import Phaser from 'phaser';

/**
 * Boot placeholder scene. Real art/animation arrive in later milestones;
 * this scene only proves the engine boots and renders deterministically.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add
      .rectangle(width / 2, height / 2, width, height, 0x14162b)
      .setDepth(0);
    this.add
      .rectangle(width / 2, height / 2, width * 0.8, height * 0.12, 0x0b0d20)
      .setStrokeStyle(4, 0xf4f1e8)
      .setDepth(1);
    this.scene.start('title');
  }
}

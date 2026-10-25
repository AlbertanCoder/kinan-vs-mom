import Phaser from 'phaser';
import { markShellReady } from '../testHooks';
import { inputMgr } from '../context';
import { audio } from '../audio';

/**
 * Title menu: Play (world map), Settings. Keyboard/gamepad/touch all
 * drive the same action map.
 */
export class TitleScene extends Phaser.Scene {
  private selectedIndex = 0;
  private items: Phaser.GameObjects.Text[] = [];
  private labels = ['PLAY', 'SETTINGS'];

  constructor() {
    super('title');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x14162b);
    this.add
      .text(width / 2, height * 0.28, 'KINAN VS. WORLDS', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '64px',
        color: '#ffd34d',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height * 0.4, 'A birthday adventure across ten worlds', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '24px',
        color: '#f4f1e8',
      })
      .setOrigin(0.5);

    this.items = this.labels.map((label, i) => {
      const t = this.add
        .text(width / 2, height * 0.58 + i * 64, label, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '34px',
          color: '#f4f1e8',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => {
        this.selectedIndex = i;
        this.activate();
      });
      return t;
    });
    this.refresh();

    this.add
      .text(width / 2, height * 0.9, 'Move: arrows/WASD · Jump: Space · Ability: X · Context: E', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '18px',
        color: '#9aa0b5',
      })
      .setOrigin(0.5);

    markShellReady();
  }

  private refresh(): void {
    this.items.forEach((t, i) => {
      t.setColor(i === this.selectedIndex ? '#ffd34d' : '#f4f1e8');
      t.setText(i === this.selectedIndex ? `▶ ${this.labels[i]} ◀` : this.labels[i]);
    });
  }

  private activate(): void {
    audio.init();
    audio.sfx('select');
    if (this.selectedIndex === 0) {
      this.scene.start('map');
    } else {
      this.scene.start('settings', { returnTo: 'title' });
    }
  }

  update(): void {
    inputMgr.update();
    if (inputMgr.justPressed('up')) {
      this.selectedIndex = (this.selectedIndex + this.items.length - 1) % this.items.length;
      audio.sfx('select');
      this.refresh();
    }
    if (inputMgr.justPressed('down')) {
      this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
      audio.sfx('select');
      this.refresh();
    }
    if (inputMgr.justPressed('confirm')) {
      this.activate();
    }
  }
}


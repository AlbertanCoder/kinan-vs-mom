import Phaser from 'phaser';
import { inputMgr, runtime } from '../context';
import { audio } from '../audio';

interface RowDef {
  label: () => string;
  adjust: (dir: number) => void;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, Math.round(n * 10) / 10));
}

/**
 * Accessibility settings (master doc 12.1): separate volume sliders,
 * captions, reduced motion, screen shake, touch control scale.
 */
export class SettingsScene extends Phaser.Scene {
  private returnTo = 'title';
  private index = 0;
  private lines: Phaser.GameObjects.Text[] = [];
  private rowDefs: RowDef[] = [];

  constructor() {
    super('settings');
  }

  init(data: { returnTo: string }): void {
    this.returnTo = data.returnTo ?? 'title';
    this.index = 0;
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x10142c);
    this.add
      .text(width / 2, 60, 'SETTINGS', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '40px',
        color: '#ffd34d',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.rowDefs = [
      {
        label: () => `Music volume: ${Math.round(runtime.save.settings.musicVolume * 100)}%`,
        adjust: (d) =>
          runtime.updateSettings({
            musicVolume: clamp01(runtime.save.settings.musicVolume + d * 0.1),
          }),
      },
      {
        label: () => `SFX volume: ${Math.round(runtime.save.settings.sfxVolume * 100)}%`,
        adjust: (d) =>
          runtime.updateSettings({
            sfxVolume: clamp01(runtime.save.settings.sfxVolume + d * 0.1),
          }),
      },
      {
        label: () => `Voice volume: ${Math.round(runtime.save.settings.voiceVolume * 100)}%`,
        adjust: (d) =>
          runtime.updateSettings({
            voiceVolume: clamp01(runtime.save.settings.voiceVolume + d * 0.1),
          }),
      },
      {
        label: () => `Captions: ${runtime.save.settings.captions ? 'ON' : 'OFF'}`,
        adjust: () => runtime.updateSettings({ captions: !runtime.save.settings.captions }),
      },
      {
        label: () => `Reduced motion: ${runtime.save.settings.reducedMotion ? 'ON' : 'OFF'}`,
        adjust: () => runtime.updateSettings({ reducedMotion: !runtime.save.settings.reducedMotion }),
      },
      {
        label: () => `Screen shake: ${runtime.save.settings.screenShake ? 'ON' : 'OFF'}`,
        adjust: () => runtime.updateSettings({ screenShake: !runtime.save.settings.screenShake }),
      },
      {
        label: () => `Touch control size: ${runtime.save.settings.touchScale.toFixed(1)}×`,
        adjust: (d) =>
          runtime.updateSettings({
            touchScale: Math.min(1.4, Math.max(0.8, runtime.save.settings.touchScale + d * 0.1)),
          }),
      },
    ];

    this.lines = this.rowDefs.map((row, i) => {
      const t = this.add
        .text(width / 2, 140 + i * 56, row.label(), {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '26px',
          color: '#f4f1e8',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => {
        this.index = i;
        this.adjust(1);
      });
      return t;
    });

    this.add
      .text(width / 2, height - 70, '← → adjust · Esc back', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '18px',
        color: '#9aa0b5',
      })
      .setOrigin(0.5);

    this.refresh();
  }

  private refresh(): void {
    this.lines.forEach((t, i) => {
      t.setText(this.rowDefs[i].label());
      t.setColor(i === this.index ? '#ffd34d' : '#f4f1e8');
    });
    audio.setVolumes(runtime.save.settings.musicVolume, runtime.save.settings.sfxVolume);
  }

  private adjust(dir: number): void {
    this.rowDefs[this.index].adjust(dir);
    audio.sfx('select');
    this.refresh();
  }

  update(): void {
    inputMgr.update();
    const count = this.rowDefs.length;
    if (inputMgr.justPressed('up')) {
      this.index = (this.index + count - 1) % count;
      this.refresh();
    }
    if (inputMgr.justPressed('down')) {
      this.index = (this.index + 1) % count;
      this.refresh();
    }
    if (inputMgr.justPressed('right') || inputMgr.justPressed('confirm')) this.adjust(1);
    if (inputMgr.justPressed('left')) this.adjust(-1);
    if (inputMgr.justPressed('cancel') || inputMgr.justPressed('pause')) {
      this.scene.start(this.returnTo);
    }
  }
}
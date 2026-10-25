import Phaser from 'phaser';
import { inputMgr, runtime } from '../context';
import { audio } from '../audio';
import { WORLDS, WORLD_11 } from '../data/worlds';
import { PETS, FRIENDS, CAT_IDS } from '../data/pets';
import type { PetId, FriendId } from '../../shared/ids';

type MapPage = 'worlds' | 'stages' | 'loadout';

interface MapEntry {
  label: string;
  enabled: boolean;
  run: () => void;
}

/**
 * World map: world select, stage select, and companion loadout.
 * Keyboard/gamepad/touch unified. World 11 appears only after the
 * World 10 unlock transaction (master doc 11.2).
 */
export class MapScene extends Phaser.Scene {
  private page: MapPage = 'worlds';
  private index = 0;
  private lines: Phaser.GameObjects.Text[] = [];
  private header!: Phaser.GameObjects.Text;
  private footer!: Phaser.GameObjects.Text;
  private currentWorld = 0;

  constructor() {
    super('map');
  }

  init(): void {
    this.page = 'worlds';
    this.index = 0;
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x10142c);
    this.header = this.add
      .text(width / 2, 60, 'SELECT WORLD', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '40px',
        color: '#ffd34d',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.footer = this.add
      .text(width / 2, height - 40, '', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '18px',
        color: '#9aa0b5',
      })
      .setOrigin(0.5);
    this.render();
  }

  private headerText(): string {
    if (this.page === 'worlds') return 'SELECT WORLD';
    if (this.page === 'stages') return WORLDS[this.currentWorld].name;
    return 'COMPANION LOADOUT';
  }

  private render(): void {
    for (const line of this.lines) line.destroy();
    this.lines = [];
    const { width } = this.scale;
    const entries = this.entries();
    const first = Math.max(0, Math.min(this.index - 6, entries.length - 13));
    const visible = entries.slice(first, first + 13);
    visible.forEach((entry, i) => {
      const absIndex = first + i;
      const t = this.add
        .text(width / 2, 130 + i * 42, entry.label, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '24px',
          color: absIndex === this.index ? '#ffd34d' : entry.enabled ? '#f4f1e8' : '#5a5f75',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => {
        if (!entry.enabled) return;
        this.index = absIndex;
        this.select();
      });
      this.lines.push(t);
    });
    this.footer.setText(`coins: ${runtime.save.coins} · ↑↓ move · Enter select · Esc back`);
    this.header.setText(this.headerText());
  }

  private worldEntries(): MapEntry[] {
    const list: MapEntry[] = WORLDS.map((world, i) => ({
      label: `${world.name} — ${world.subtitle}`,
      enabled: runtime.isStageUnlocked(world.stages[0].id),
      run: () => {
        this.currentWorld = i;
        this.page = 'stages';
        this.index = 0;
      },
    }));
    list.push({
      label: `${WORLD_11.name} — ${WORLD_11.subtitle} (Three.js, after World 10)`,
      enabled: runtime.save.world11Unlocked,
      run: () => {
        this.footer.setText('World 11 3D slice arrives in its own milestone — 2D play stays available.');
      },
    });
    list.push({
      label: 'COMPANION LOADOUT',
      enabled: true,
      run: () => {
        this.page = 'loadout';
        this.index = 0;
      },
    });
    return list;
  }

  private stageEntries(): MapEntry[] {
    return WORLDS[this.currentWorld].stages.map((stage) => {
      const progress = runtime.stageProgress(stage.id);
      const stars = '★'.repeat(progress.stars) + '☆'.repeat(Math.max(0, 3 - progress.stars));
      return {
        label: `${progress.cleared ? '✓ ' : ''}${stage.name} ${stage.kind === 'boss' ? '[BOSS]' : ''} ${stars}`,
        enabled: runtime.isStageUnlocked(stage.id),
        run: () => {
          this.scene.start('stage', { stageId: stage.id });
        },
      };
    });
  }

  private loadoutEntries(): MapEntry[] {
    const petEntries: MapEntry[] = PETS.map((pet) => {
      const owned = runtime.save.pets.owned.includes(pet.id);
      const isCat = CAT_IDS.includes(pet.id);
      const equipped = isCat
        ? runtime.save.pets.equippedCat === pet.id
        : runtime.save.pets.equippedDog === pet.id;
      return {
        label: `${equipped ? '✓ ' : ''}${pet.name} (${isCat ? 'cat' : 'dog'}) — ${pet.abilityName}${owned ? '' : ' [LOCKED]'}`,
        enabled: owned,
        run: () => {
          const cur = runtime.save.pets;
          if (isCat) {
            runtime.setLoadout(
              cur.equippedCat === pet.id ? null : (pet.id as PetId),
              cur.equippedDog,
            );
          } else {
            runtime.setLoadout(
              cur.equippedCat,
              cur.equippedDog === pet.id ? null : (pet.id as PetId),
            );
          }
        },
      };
    });
    const friendEntries: MapEntry[] = FRIENDS.map((friend) => ({
      label: `${runtime.save.friendAssist === friend.id ? '✓ ' : ''}Assist: ${friend.name} — ${friend.assistText}`,
      enabled: true,
      run: () => {
        runtime.setFriend(
          runtime.save.friendAssist === friend.id ? null : (friend.id as FriendId),
        );
      },
    }));
    return [...petEntries, ...friendEntries];
  }

  private entries(): MapEntry[] {
    if (this.page === 'worlds') return this.worldEntries();
    if (this.page === 'stages') return this.stageEntries();
    return this.loadoutEntries();
  }

  private select(): void {
    const entry = this.entries()[this.index];
    if (entry === undefined || !entry.enabled) return;
    audio.init();
    audio.sfx('select');
    entry.run();
    this.render();
  }

  private back(): void {
    if (this.page === 'worlds') {
      this.scene.start('title');
      return;
    }
    this.page = 'worlds';
    this.index = 0;
    this.render();
  }

  update(): void {
    inputMgr.update();
    const count = this.entries().length;
    if (inputMgr.justPressed('up')) {
      this.index = (this.index + count - 1) % count;
      audio.sfx('select');
      this.render();
    }
    if (inputMgr.justPressed('down')) {
      this.index = (this.index + 1) % count;
      audio.sfx('select');
      this.render();
    }
    if (inputMgr.justPressed('confirm')) this.select();
    if (inputMgr.justPressed('cancel') || inputMgr.justPressed('pause')) this.back();
  }
}
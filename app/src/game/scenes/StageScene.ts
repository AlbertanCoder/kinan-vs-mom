import Phaser from 'phaser';
import { inputMgr, runtime } from '../context';
import { audio } from '../audio';
import { buildLevel, TILE, type LevelData, type LevelEntity } from '../data/levels';
import { findStage } from '../data/worlds';
import {
  stepPlayer,
  createPlayerState,
  applyKnockback,
  DEFAULT_PLAYER_CONFIG,
  FIXED_DT_MS,
  type PlayerState,
  type PlayerConfig,
  type Rect,
} from '../../engine/platformer';

interface EnemyState {
  x: number;
  y: number;
  vx: number;
  alive: boolean;
  stunMs: number;
  rect: Rect;
}

interface BossState {
  x: number;
  y: number;
  vx: number;
  hp: number;
  maxHp: number;
  alive: boolean;
  stunMs: number;
  rect: Rect;
}

interface Pickup {
  entity: LevelEntity;
  taken: boolean;
}

const BASE_HEARTS = 3;

function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

/** Draw a 5-point star (Graphics has no fillStar). */
function drawStar(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  outer: number,
  inner: number,
): void {
  const path: number[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    path.push(x + r * Math.cos(angle), y + r * Math.sin(angle));
  }
  g.beginPath();
  g.moveTo(path[0], path[1]);
  for (let i = 2; i < path.length; i += 2) g.lineTo(path[i], path[i + 1]);
  g.closePath();
  g.fillPath();
}

/**
 * The 2D platform stage: fixed-timestep controller, camera follow,
 * coins/stars/checkpoints, enemies, spikes, goal, and a compact boss
 * encounter on boss stages. Placeholder vector art.
 */
export class StageScene extends Phaser.Scene {
  private stageId = '';
  private level!: LevelData;
  private player!: PlayerState;
  private cfg: PlayerConfig = { ...DEFAULT_PLAYER_CONFIG };
  private accumulator = 0;
  private graphics!: Phaser.GameObjects.Graphics;
  private hud!: Phaser.GameObjects.Text;
  private pickups: Pickup[] = [];
  private enemies: EnemyState[] = [];
  private boss: BossState | null = null;
  private hearts = BASE_HEARTS;
  private coinsCollected = 0;
  private starsCollected = 0;
  private checkpoint: { x: number; y: number } | null = null;
  private finished = false;
  private paused = false;
  private startTimeMs = 0;
  private elapsedMs = 0;
  private overlayText!: Phaser.GameObjects.Text;
  private abilityCooldownMs = 0;
  private friendUsedAtCheckpoint = false;

  constructor() {
    super('stage');
  }

  init(data: { stageId: string }): void {
    this.stageId = data.stageId;
    this.finished = false;
    this.paused = false;
    this.hearts = BASE_HEARTS;
    this.coinsCollected = 0;
    this.starsCollected = 0;
    this.checkpoint = null;
    this.accumulator = 0;
    this.elapsedMs = 0;
    this.abilityCooldownMs = 0;
    this.friendUsedAtCheckpoint = false;
  }

  create(): void {
    const found = findStage(this.stageId);
    const difficulty =
      found === null ? 0 : found.world.stages.findIndex((s) => s.id === this.stageId);
    this.level = buildLevel(this.stageId, {
      isBoss: found?.stage.kind === 'boss',
      difficulty: Math.max(0, difficulty),
    });

    /* pet passives shape the controller config (master doc 6.1) */
    const { equippedCat, equippedDog } = runtime.save.pets;
    this.cfg = { ...DEFAULT_PLAYER_CONFIG };
    if (equippedCat === 'pet-garfield' || equippedDog === 'pet-garfield') {
      this.cfg.maxExtraJumps = 1; /* Kitten Zoomies */
    }
    if (equippedCat === 'pet-tuxedo' || equippedDog === 'pet-tuxedo') {
      this.cfg.knockbackX *= 0.8; /* Senior Glare */
      this.cfg.knockbackY *= 0.8;
    }

    this.player = createPlayerState(this.level.spawn.x, this.level.spawn.y);
    this.player.extraJumps = this.cfg.maxExtraJumps;

    this.pickups = this.level.entities
      .filter((e) => e.kind !== 'boss')
      .map((entity) => ({ entity, taken: false }));
    this.enemies = this.level.entities
      .filter((e) => e.kind === 'enemy')
      .map((e) => ({
        x: e.x,
        y: e.y - 20,
        vx: 70,
        alive: true,
        stunMs: 0,
        rect: { x: e.x - 18, y: e.y - 20, w: 36, h: 40 },
      }));
    const bossSpawn = this.level.entities.find((e) => e.kind === 'boss');
    if (bossSpawn !== undefined) {
      this.boss = {
        x: bossSpawn.x,
        y: bossSpawn.y - 40,
        vx: 90,
        hp: 6,
        maxHp: 6,
        alive: true,
        stunMs: 0,
        rect: { x: bossSpawn.x - 40, y: bossSpawn.y - 40, w: 80, h: 80 },
      };
    }

    this.graphics = this.add.graphics();
    this.hud = this.add
      .text(20, 16, '', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '22px',
        color: '#f4f1e8',
      })
      .setScrollFactor(0);
    this.overlayText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, '', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '36px',
        color: '#ffd34d',
        backgroundColor: '#14162bcc',
        padding: { x: 24, y: 16 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(10);

    this.cameras.main.setBounds(0, 0, this.level.pixelWidth, this.level.pixelHeight);
    audio.startMusic(this.level.isBoss);
    this.startTimeMs = performance.now();
  }

  private togglePause(): void {
    if (this.finished) return;
    this.paused = !this.paused;
    audio.sfx('pause');
    this.overlayText.setText(this.paused ? 'PAUSED — press P to resume' : '');
    if (this.paused) audio.stopMusic();
    else audio.startMusic(this.level.isBoss);
  }

  update(_time: number, deltaMs: number): void {
    inputMgr.update();
    if (this.finished || this.paused) {
      this.draw();
      return;
    }

    this.elapsedMs = performance.now() - this.startTimeMs;
    this.accumulator = Math.min(this.accumulator + deltaMs, 120);
    this.abilityCooldownMs = Math.max(0, this.abilityCooldownMs - deltaMs);

    while (this.accumulator >= FIXED_DT_MS) {
      this.stepSimulation(FIXED_DT_MS);
      this.accumulator -= FIXED_DT_MS;
    }

    if (inputMgr.justPressed('pause')) this.togglePause();
    if (inputMgr.justPressed('ability')) this.useAbility();
    if (inputMgr.justPressed('context')) this.useFriendAssist();

    this.draw();
    this.updateHud();
  }

  private stepSimulation(dtMs: number): void {
    const input = {
      moveX: inputMgr.moveX,
      jumpHeld: inputMgr.isDown('jump'),
      jumpPressed: inputMgr.justPressed('jump'),
      jumpReleased: inputMgr.justReleased('jump'),
    };
    const result = stepPlayer(this.player, input, this.level.solids, dtMs, this.cfg);
    this.player = result.state;
    if (result.jumped) audio.sfx('jump');

    if (this.player.y > this.level.pixelHeight + 200) {
      this.hurt(this.player.x, true);
    }

    const box: Rect = {
      x: this.player.x,
      y: this.player.y,
      w: this.player.w,
      h: this.player.h,
    };

    if (this.player.invulnMs <= 0) {
      for (const spike of this.level.spikes) {
        if (rectsOverlap(box, spike)) {
          this.hurt(spike.x + spike.w / 2);
          break;
        }
      }
    }

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      enemy.stunMs = Math.max(0, enemy.stunMs - dtMs);
      if (enemy.stunMs <= 0) {
        enemy.x += (enemy.vx * dtMs) / 1000;
        const probe: Rect = {
          x: enemy.x - 18 + Math.sign(enemy.vx) * 20,
          y: enemy.y + 4,
          w: 8,
          h: 8,
        };
        const againstWall = this.level.solids.some((s) => rectsOverlap(probe, s));
        const overPit = !this.level.solids.some(
          (s) =>
            s.x < enemy.x + 20 &&
            s.x + s.w > enemy.x + 20 &&
            s.y > enemy.y &&
            s.y < enemy.y + 80,
        );
        if (againstWall || overPit) enemy.vx *= -1;
      }
      enemy.rect = { x: enemy.x - 18, y: enemy.y - 20, w: 36, h: 40 };
      if (rectsOverlap(box, enemy.rect)) {
        const stomp = this.player.vy > 0 && this.player.y + this.player.h < enemy.y + 10;
        if (stomp) {
          enemy.alive = false;
          this.player.vy = -620;
          audio.sfx('stomp');
        } else if (this.player.invulnMs <= 0) {
          this.hurt(enemy.x);
        }
      }
    }

    if (this.boss !== null && this.boss.alive) {
      const b = this.boss;
      b.stunMs = Math.max(0, b.stunMs - dtMs);
      if (b.stunMs <= 0) {
        b.x += (b.vx * dtMs) / 1000;
        if (b.x < TILE * 6 || b.x > this.level.pixelWidth - TILE * 6) b.vx *= -1;
      }
      b.rect = { x: b.x - 40, y: b.y - 40, w: 80, h: 80 };
      if (rectsOverlap(box, b.rect)) {
        const stomp = this.player.vy > 0 && this.player.y + this.player.h < b.y + 10;
        if (stomp) {
          b.hp -= 1;
          b.stunMs = 600;
          this.player.vy = -720;
          audio.sfx('bossHit');
          if (b.hp <= 0) {
            b.alive = false;
            audio.sfx('goal');
          }
        } else if (this.player.invulnMs <= 0) {
          this.hurt(b.x);
        }
      }
    }

    for (const pickup of this.pickups) {
      if (pickup.taken) continue;
      const r: Rect = {
        x: pickup.entity.x - 16,
        y: pickup.entity.y - 16,
        w: 32,
        h: 32,
      };
      if (!rectsOverlap(box, r)) continue;
      if (pickup.entity.kind === 'goal' && this.boss !== null && this.boss.alive) {
        this.overlayText.setText('Defeat the boss first!');
        continue;
      }
      pickup.taken = true;
      if (pickup.entity.kind === 'coin') {
        this.coinsCollected += 1;
        audio.sfx('coin');
      } else if (pickup.entity.kind === 'star') {
        this.starsCollected += 1;
        audio.sfx('star');
      } else if (pickup.entity.kind === 'food') {
        this.hearts = Math.min(BASE_HEARTS, this.hearts + 1);
        audio.sfx('coin');
      } else if (pickup.entity.kind === 'checkpoint') {
        this.checkpoint = { x: pickup.entity.x, y: pickup.entity.y - 20 };
        this.friendUsedAtCheckpoint = false;
        audio.sfx('star');
      } else if (pickup.entity.kind === 'goal') {
        this.completeStage();
      }
    }
  }

  private hurt(fromX: number, isFall = false): void {
    this.hearts -= 1;
    audio.sfx('hurt');
    const respawn = this.checkpoint ?? this.level.spawn;
    if (this.hearts <= 0) {
      this.hearts = BASE_HEARTS;
      this.player = {
        ...createPlayerState(respawn.x, respawn.y),
        extraJumps: this.cfg.maxExtraJumps,
      };
      this.overlayText.setText('Try again! Hearts refilled.');
      this.time.delayedCall(1200, () => {
        if (!this.finished) this.overlayText.setText('');
      });
      return;
    }
    if (isFall) {
      this.player = {
        ...createPlayerState(respawn.x, respawn.y),
        extraJumps: this.cfg.maxExtraJumps,
      };
    } else {
      this.player = applyKnockback(this.player, fromX, this.cfg);
    }
  }

  /** Pet signature abilities (master doc 6.1). */
  private useAbility(): void {
    if (this.abilityCooldownMs > 0) return;
    const { equippedCat, equippedDog } = runtime.save.pets;
    const pet = equippedDog ?? equippedCat;
    if (pet === 'pet-vader') {
      /* Curious Force: pull nearby coins toward Kinan */
      for (const pickup of this.pickups) {
        if (pickup.taken || pickup.entity.kind !== 'coin') continue;
        const dx = this.player.x - pickup.entity.x;
        const dy = this.player.y - pickup.entity.y;
        if (dx * dx + dy * dy < 360 * 360) {
          pickup.entity = {
            ...pickup.entity,
            x: pickup.entity.x + dx * 0.12,
            y: pickup.entity.y + dy * 0.12,
          };
        }
      }
      this.abilityCooldownMs = 8000;
      audio.sfx('coin');
      return;
    }
    if (pet === 'pet-chikastino') {
      /* Neighbourhood Watch: bark-stun nearby enemies */
      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        if (Math.abs(enemy.x - this.player.x) < 320) enemy.stunMs = 1500;
      }
      if (this.boss !== null && this.boss.alive && Math.abs(this.boss.x - this.player.x) < 320) {
        this.boss.stunMs = Math.max(this.boss.stunMs, 700);
      }
      this.abilityCooldownMs = 14000;
      audio.sfx('stomp');
      return;
    }
    if (pet === 'pet-hunter' && this.hearts < BASE_HEARTS) {
      /* Courage Fetch */
      this.hearts += 1;
      this.abilityCooldownMs = 30000;
      audio.sfx('star');
      return;
    }
    if (pet === 'pet-duchess' && !this.level.isBoss && this.hearts < BASE_HEARTS) {
      /* Royal Snack Break (not in bosses/challenges) */
      this.hearts = Math.min(BASE_HEARTS, this.hearts + 2);
      this.abilityCooldownMs = 25000;
      audio.sfx('star');
      return;
    }
    if (this.player.onGround) {
      this.player = { ...this.player, vx: this.player.facing * 520 };
      this.abilityCooldownMs = 2500;
      audio.sfx('jump');
    }
  }

  /** Friend Assist (master doc 6.2). */
  private useFriendAssist(): void {
    const friend = runtime.save.friendAssist;
    if (friend === 'friend-milo') {
      /* temporary buildable platform, eight seconds */
      const platform: Rect = {
        x: this.player.x + this.player.w / 2 - 80,
        y: this.player.y + this.player.h + 60,
        w: 160,
        h: 24,
      };
      this.level.solids.push(platform);
      this.time.delayedCall(8000, () => {
        const i = this.level.solids.indexOf(platform);
        if (i >= 0) this.level.solids.splice(i, 1);
      });
      audio.sfx('stomp');
      return;
    }
    if (friend === 'friend-aiden' && !this.friendUsedAtCheckpoint) {
      this.friendUsedAtCheckpoint = true;
      if (this.hearts < BASE_HEARTS) this.hearts += 1;
      for (const enemy of this.enemies) {
        if (enemy.alive && Math.abs(enemy.x - this.player.x) < 320) enemy.stunMs = 3000;
      }
      audio.sfx('star');
    }
  }

  private completeStage(): void {
    if (this.finished) return;
    this.finished = true;
    audio.stopMusic();
    audio.sfx('goal');
    runtime.addCoins(this.coinsCollected);
    const clearCommitted = runtime.recordStageClear(
      this.stageId,
      this.starsCollected,
      Math.round(this.elapsedMs),
    );
    const isFinal = this.stageId === 'w10-mom-finale';
    if (isFinal) {
      /* The unlock is committed before any cinematic. The actual cinematic is
         later-milestone scope, so keep the recovery flag pending until an
         explicit completion or skip action exists. */
      this.overlayText.setText(
        clearCommitted
          ? 'WORLD 10 COMPLETE!\nDimension 11 unlocked — cinematic pending.'
          : 'WORLD 10 FINISHED\nSave failed — the Dimension 11 unlock is not committed yet.',
      );
    } else {
      const saveWarning = clearCommitted
        ? ''
        : '\nSAVE FAILED — progress may be lost on reload.';
      this.overlayText.setText(
        `STAGE CLEAR!\n★ ${this.starsCollected}/3 · coins +${this.coinsCollected}${saveWarning}\nEnter: continue`,
      );
    }
    const continueToMap = (): void => {
      this.scene.start('map');
    };
    this.input.keyboard?.once('keydown-ENTER', continueToMap);
    this.input.once('pointerdown', continueToMap);
  }

  private updateHud(): void {
    const hearts =
      '♥'.repeat(this.hearts) + '♡'.repeat(Math.max(0, BASE_HEARTS - this.hearts));
    const bossHp =
      this.boss !== null && this.boss.alive
        ? ` · BOSS ${'▮'.repeat(Math.max(0, this.boss.hp))}${'▯'.repeat(Math.max(0, this.boss.maxHp - this.boss.hp))}`
        : '';
    this.hud.setText(`${hearts}  ★ ${this.starsCollected}/3  ● ${this.coinsCollected}${bossHp}`);
  }

  private draw(): void {
    const g = this.graphics;
    const found = findStage(this.stageId);
    const sky = found?.world.sky ?? 0x14162b;
    const ground = found?.world.ground ?? 0x4e9e8f;
    const accent = found?.world.accent ?? 0xff6b6b;
    g.clear();
    g.fillStyle(sky, 1);
    g.fillRect(0, 0, this.level.pixelWidth, this.level.pixelHeight);

    for (const solid of this.level.solids) {
      g.fillStyle(ground, 1);
      g.fillRect(solid.x, solid.y, solid.w, solid.h);
      g.fillStyle(0xffffff, 0.12);
      g.fillRect(solid.x, solid.y, solid.w, 6);
    }

    g.fillStyle(0xff4d4d, 1);
    for (const spike of this.level.spikes) {
      g.fillTriangle(
        spike.x,
        spike.y + spike.h,
        spike.x + spike.w / 2,
        spike.y,
        spike.x + spike.w,
        spike.y + spike.h,
      );
    }

    for (const pickup of this.pickups) {
      if (pickup.taken) continue;
      const { x, y, kind } = pickup.entity;
      if (kind === 'coin') {
        g.fillStyle(0xffd34d, 1);
        g.fillCircle(x, y, 12);
        g.fillStyle(0xb8860b, 1);
        g.fillCircle(x, y, 6);
      } else if (kind === 'star') {
        g.fillStyle(0xffe14d, 1);
        drawStar(g, x, y, 20, 9);
      } else if (kind === 'food') {
        g.fillStyle(0x9fe870, 1);
        g.fillRoundedRect(x - 14, y - 12, 28, 24, 6);
      } else if (kind === 'checkpoint') {
        g.fillStyle(0x66d9c8, 1);
        g.fillRect(x - 4, y - 40, 8, 60);
        g.fillTriangle(x, y - 40, x + 30, y - 28, x, y - 16);
      } else if (kind === 'goal') {
        g.fillStyle(0xffd34d, 1);
        g.fillRect(x - 5, y - 90, 10, 110);
        g.fillStyle(0xff6b6b, 1);
        g.fillTriangle(x, y - 90, x + 56, y - 68, x, y - 46);
      }
    }

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      g.fillStyle(enemy.stunMs > 0 ? 0x9aa0b5 : accent, 1);
      g.fillRoundedRect(enemy.rect.x, enemy.rect.y, enemy.rect.w, enemy.rect.h, 10);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(enemy.x - 7, enemy.y - 6, 5);
      g.fillCircle(enemy.x + 7, enemy.y - 6, 5);
      g.fillStyle(0x14162b, 1);
      g.fillCircle(enemy.x - 7, enemy.y - 6, 2.5);
      g.fillCircle(enemy.x + 7, enemy.y - 6, 2.5);
    }

    if (this.boss !== null && this.boss.alive) {
      const b = this.boss;
      g.fillStyle(0x8a2be2, 1);
      g.fillRoundedRect(b.rect.x, b.rect.y, b.rect.w, b.rect.h, 16);
      g.fillStyle(0xffd34d, 1);
      g.fillCircle(b.x - 16, b.y - 12, 9);
      g.fillCircle(b.x + 16, b.y - 12, 9);
      g.fillStyle(0x14162b, 1);
      g.fillCircle(b.x - 16, b.y - 12, 4);
      g.fillCircle(b.x + 16, b.y - 12, 4);
    }

    /* Kinan: red star-emblem shirt, jeans, sneakers (placeholder shapes) */
    const p = this.player;
    const blink = p.invulnMs > 0 && Math.floor(p.invulnMs / 120) % 2 === 0;
    if (!blink) {
      g.fillStyle(0x2b4fd8, 1); /* jeans */
      g.fillRect(p.x + 6, p.y + 26, 20, 14);
      g.fillStyle(0xff4d4d, 1); /* red shirt */
      g.fillRect(p.x + 4, p.y + 12, 24, 16);
      g.fillStyle(0xffe14d, 1); /* star emblem */
      drawStar(g, p.x + 16, p.y + 20, 6, 3);
      g.fillStyle(0xf7c86b, 1); /* head */
      g.fillCircle(p.x + 16, p.y + 6, 10);
      g.fillStyle(0x3b2b1b, 1); /* hair */
      g.fillRoundedRect(p.x + 7, p.y - 5, 18, 8, 3);
      g.fillStyle(0xf4f1e8, 1); /* sneakers */
      g.fillRect(p.x + 4, p.y + 38, 10, 6);
      g.fillRect(p.x + 18, p.y + 38, 10, 6);
    }

    this.cameras.main.scrollX = Phaser.Math.Clamp(
      this.player.x - this.scale.width / 2,
      0,
      Math.max(0, this.level.pixelWidth - this.scale.width),
    );
    this.cameras.main.scrollY = Phaser.Math.Clamp(
      this.player.y - this.scale.height / 2,
      0,
      Math.max(0, this.level.pixelHeight - this.scale.height),
    );
  }
}
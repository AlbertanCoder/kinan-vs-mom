/**
 * Offline procedural audio (master design document section 5.3 scaffolding).
 * WebAudio synthesis only — no runtime CDN, no browser-TTS, no samples.
 * Separate music/SFX/voice buses with independent volume sliders.
 * Safe initialization: the context starts only after a user gesture.
 */

export class AudioManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private musicVolume = 0.8;
  private sfxVolume = 0.8;
  private musicTimer: number | null = null;
  private musicStep = 0;

  /** Must be called from a user gesture (browser autoplay policy). */
  init(): void {
    if (this.ctx !== null) return;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctor === undefined) return;
    this.ctx = new Ctor();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.voiceGain = this.ctx.createGain();
    this.musicGain.connect(this.ctx.destination);
    this.sfxGain.connect(this.ctx.destination);
    this.voiceGain.connect(this.ctx.destination);
    this.musicGain.gain.value = this.musicVolume * 0.25;
    this.sfxGain.gain.value = this.sfxVolume * 0.5;
    this.voiceGain.gain.value = 0.9;
  }

  setVolumes(music: number, sfx: number): void {
    this.musicVolume = music;
    this.sfxVolume = sfx;
    if (this.musicGain !== null) this.musicGain.gain.value = music * 0.25;
    if (this.sfxGain !== null) this.sfxGain.gain.value = sfx * 0.5;
  }

  private tone(
    freq: number,
    durMs: number,
    type: OscillatorType,
    when = 0,
    slideTo?: number,
  ): void {
    if (this.ctx === null || this.sfxGain === null) return;
    const t = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo !== undefined) osc.frequency.linearRampToValueAtTime(slideTo, t + durMs / 1000);
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + durMs / 1000);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + durMs / 1000 + 0.02);
  }

  sfx(name: 'jump' | 'coin' | 'star' | 'hurt' | 'stomp' | 'goal' | 'select' | 'pause' | 'bossHit'): void {
    switch (name) {
      case 'jump': this.tone(320, 140, 'square', 0, 520); break;
      case 'coin': this.tone(880, 80, 'square'); this.tone(1320, 120, 'square', 0.07); break;
      case 'star': this.tone(660, 100, 'triangle'); this.tone(880, 100, 'triangle', 0.1); this.tone(1100, 200, 'triangle', 0.2); break;
      case 'hurt': this.tone(220, 260, 'sawtooth', 0, 110); break;
      case 'stomp': this.tone(180, 90, 'square', 0, 90); break;
      case 'bossHit': this.tone(140, 180, 'sawtooth', 0, 70); break;
      case 'goal': [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 220, 'triangle', i * 0.12)); break;
      case 'select': this.tone(520, 60, 'triangle'); break;
      case 'pause': this.tone(440, 80, 'sine', 0, 330); break;
    }
  }

  /** Tiny adaptive loop: boss mode adds a lower bass step. */
  startMusic(boss = false): void {
    if (this.ctx === null || this.musicGain === null) return;
    this.stopMusic();
    const scale = boss
      ? [110, 130.8, 146.8, 164.8, 146.8, 130.8]
      : [261.6, 329.6, 392, 329.6, 293.7, 349.2, 440, 349.2];
    this.musicStep = 0;
    this.musicTimer = window.setInterval(() => {
      if (this.ctx === null || this.musicGain === null) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = boss ? 'sawtooth' : 'triangle';
      osc.frequency.value = scale[this.musicStep % scale.length];
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.42);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(t);
      osc.stop(t + 0.5);
      this.musicStep += 1;
    }, boss ? 300 : 420);
  }

  stopMusic(): void {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const audio = new AudioManager();
// Tiny synthesized sound effects + a cheerful original music loop (WebAudio, no files).
// Starts on the first key press / tap (browsers block audio before that). M toggles music.
export class Audio {
  constructor() {
    this.ctx = null; this.musicOn = true; this.master = null; this.musicGain = null; this.nextNote = 0; this.step = 0;
    try { this.musicOn = localStorage.getItem('k3d-music') !== 'off'; } catch (e) { /* storage blocked */ }
  }
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.5; this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = this.musicOn ? 0.32 : 0; this.musicGain.connect(this.master);
    this.nextNote = this.ctx.currentTime + 0.1;
    const n = this.ctx.sampleRate * 0.4;
    this.noiseBuf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  }
  toggleMusic() {
    this.musicOn = !this.musicOn;
    try { localStorage.setItem('k3d-music', this.musicOn ? 'on' : 'off'); } catch (e) { /* ignore */ }
    if (this.musicGain) this.musicGain.gain.setTargetAtTime(this.musicOn ? 0.32 : 0, this.ctx.currentTime, 0.1);
    return this.musicOn;
  }
  tone(type, f0, f1, dur, vol = 0.2, when = 0, dest = null) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime + when;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || this.master); o.start(t); o.stop(t + dur + 0.02);
  }
  noise(dur, vol = 0.2, freq = 1200, when = 0, q = 1) {
    const c = this.ctx; if (!c) return;
    const t = c.currentTime + when;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t); s.stop(t + dur + 0.02);
  }
  play(name) {
    if (!this.ctx) return;
    switch (name) {
      case 'jump': this.tone('square', 330, 620, 0.13, 0.09); break;
      case 'jump2': this.tone('square', 392, 760, 0.15, 0.09); break;
      case 'jump3': this.tone('square', 440, 880, 0.12, 0.08); this.tone('square', 660, 1320, 0.14, 0.07, 0.1); break;
      case 'candle': this.tone('triangle', 988, 988, 0.07, 0.16); this.tone('triangle', 1319, 1319, 0.22, 0.16, 0.06); break;
      case 'star': [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone('triangle', f, f, 0.25, 0.18, i * 0.08)); this.tone('sine', 2093, 2093, 0.5, 0.08, 0.42); break;
      case 'stomp': this.tone('sine', 180, 60, 0.18, 0.3); this.noise(0.12, 0.2, 900); this.tone('square', 600, 1200, 0.08, 0.05, 0.05); break;
      case 'hurt': this.tone('sawtooth', 420, 140, 0.35, 0.12); break;
      case 'boing': this.tone('sine', 180, 520, 0.2, 0.25); this.tone('sine', 520, 300, 0.22, 0.15, 0.18); break;
      case 'checkpoint': [659, 784, 988].forEach((f, i) => this.tone('square', f, f, 0.12, 0.08, i * 0.09)); break;
      case 'pound': this.tone('sine', 140, 40, 0.3, 0.4); this.noise(0.25, 0.28, 300); break;
      case 'spin': this.noise(0.22, 0.12, 2500, 0, 3); break;
      case 'skid': this.noise(0.18, 0.08, 1800, 0, 2); break;
      case 'land': this.tone('sine', 120, 70, 0.1, 0.16); break;
      case 'bonk': this.tone('square', 180, 120, 0.09, 0.1); break;
      case 'alert': this.tone('square', 1046, 1046, 0.06, 0.07); this.tone('square', 1318, 1318, 0.08, 0.07, 0.08); break;
      case 'open': [784, 988, 1175, 1568].forEach((f, i) => this.tone('triangle', f, f, 0.18, 0.13, i * 0.06)); break;
      case 'meow': this.tone('sine', 760, 520, 0.28, 0.1); break;
      case 'woof': this.tone('square', 240, 150, 0.1, 0.08); this.tone('square', 240, 150, 0.1, 0.08, 0.16); break;
      case 'heal': this.tone('triangle', 784, 1568, 0.25, 0.12); break;
      case 'clear': [523, 659, 784, 659, 784, 1047].forEach((f, i) => this.tone('square', f, f, i === 5 ? 0.6 : 0.16, 0.09, i * 0.15)); [262, 330, 392].forEach((f, i) => this.tone('triangle', f, f, 0.9, 0.12, 0.75 + i * 0.01)); break;
      case 'down': [523, 466, 415, 349].forEach((f, i) => this.tone('square', f, f, 0.18, 0.08, i * 0.16)); break;
      case 'grab': this.tone('triangle', 520, 700, 0.07, 0.1); break;
      case 'climb': this.tone('triangle', 400, 820, 0.16, 0.1); break;
      case 'throw': this.noise(0.12, 0.1, 1600, 0, 2); this.tone('square', 300, 520, 0.08, 0.06); break;
      case 'break': this.noise(0.22, 0.28, 700, 0, 1.4); this.tone('square', 220, 110, 0.12, 0.08); break;
      case 'gift': this.tone('square', 660, 660, 0.06, 0.08); this.tone('square', 990, 990, 0.12, 0.08, 0.06); break;
      case 'power': [523, 784, 1047, 1319, 1568].forEach((f, i) => this.tone('square', f, f, 0.1, 0.07, i * 0.05)); break;
      case 'pew': this.tone('square', 1200, 300, 0.12, 0.07); this.noise(0.08, 0.08, 4000); break;
      case 'secret': [784, 1047, 1319, 1760].forEach((f, i) => this.tone('triangle', f, f, 0.14, 0.09, i * 0.09)); break;
      case 'scrape': this.noise(0.18, 0.06, 500, 0, 1); break;
      case 'click': this.tone('square', 900, 600, 0.05, 0.1); this.tone('triangle', 500, 500, 0.12, 0.1, 0.05); break;
      case 'hop': this.tone('sine', 300, 600, 0.1, 0.1); break;
      case 'huh': this.tone('triangle', 500, 700, 0.12, 0.08); this.tone('triangle', 700, 520, 0.14, 0.08, 0.12); break;
      case 'windup': this.tone('sawtooth', 160, 420, 0.5, 0.06); break;
      case 'lunge': this.noise(0.18, 0.14, 1200, 0, 1.5); break;
      case 'roar': this.tone('sawtooth', 120, 60, 0.7, 0.18); this.noise(0.6, 0.2, 300, 0, 0.8); break;
      default: break;
    }
  }
  // original bouncy loop (C major), scheduled ahead
  updateMusic() {
    const c = this.ctx; if (!c) return;
    const bpm = 132, s16 = 60 / bpm / 4;
    const mel = [72, 0, 76, 0, 79, 0, 76, 0, 77, 0, 74, 0, 72, 0, 0, 0, 74, 0, 77, 0, 81, 0, 79, 0, 77, 76, 74, 0, 72, 0, 0, 0,
      72, 0, 76, 0, 79, 0, 84, 0, 83, 0, 79, 0, 81, 0, 79, 0, 77, 0, 74, 0, 76, 0, 72, 0, 74, 0, 71, 0, 72, 0, 0, 0];
    const bass = [48, 55, 52, 55, 50, 57, 53, 57, 50, 57, 53, 57, 43, 50, 47, 50];
    while (this.nextNote < c.currentTime + 0.15) {
      const i = this.step % mel.length;
      const m = mel[i];
      const when = this.nextNote - c.currentTime;
      if (m) this.tone('triangle', midi(m), midi(m), s16 * 1.8, 0.11, when, this.musicGain);
      if (i % 4 === 0) { const bn = bass[(i / 4) % bass.length]; this.tone('square', midi(bn), midi(bn), s16 * 1.6, 0.05, when, this.musicGain); }
      if (i % 8 === 4) this.noiseTo(0.04, 0.05, 6000, when);
      this.nextNote += s16; this.step++;
    }
  }
  noiseTo(dur, vol, freq, when) {
    const c = this.ctx, t = c.currentTime + when;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = freq;
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.musicGain); s.start(t); s.stop(t + dur + 0.02);
  }
}
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

// Procedural canvas textures (no image files needed): floors, rugs, grass, posters, signs, the TV screen.
// A level can register its own painter: textures.define('name', (ctx, w, h) => {...}, {size, repeat, rough}).
import * as THREE from 'three';
import { rng } from './util.js';

const FONT = "'Pixelify Sans', 'Courier New', monospace";

export class Textures {
  constructor(renderer) {
    this.renderer = renderer;
    this.defs = new Map();
    this.cache = new Map();
    this.mats = new Map();
    this.anim = [];
    for (const [k, v] of Object.entries(PAINTERS)) this.defs.set(k, v);
  }
  define(name, paint, opts = {}) { this.defs.set(name, Object.assign({ paint }, opts)); }

  get(name) {
    if (this.cache.has(name)) return this.cache.get(name);
    let def = this.defs.get(name);
    if (!def && name.startsWith('sign:')) def = signDef(name.slice(5));
    if (!def) def = this.defs.get('missing');
    const size = def.size || 256;
    const c = document.createElement('canvas');
    c.width = Array.isArray(size) ? size[0] : size; c.height = Array.isArray(size) ? size[1] : size;
    const ctx = c.getContext('2d');
    def.paint(ctx, c.width, c.height, 0);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    if (def.repeat !== false) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    if (def.pixel) { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; }
    if (def.animate) this.anim.push({ t, ctx, w: c.width, h: c.height, def, acc: 0 });
    this.cache.set(name, t);
    return t;
  }

  material(name) {
    if (this.mats.has(name)) return this.mats.get(name);
    const def = this.defs.get(name) || (name.startsWith('sign:') ? { rough: 0.8 } : {});
    const map = this.get(name);
    let m;
    if (def.glow) m = new THREE.MeshBasicMaterial({ map, toneMapped: def.toneMapped !== false });
    else m = new THREE.MeshStandardMaterial({ map, roughness: def.rough ?? 0.75, metalness: 0, envMapIntensity: 0.5, transparent: !!def.alpha, alphaTest: def.alpha ? 0.5 : 0, side: def.double ? THREE.DoubleSide : THREE.FrontSide });
    if (def.polyOffset) { m.polygonOffset = true; m.polygonOffsetFactor = -1; m.polygonOffsetUnits = -1; }
    this.mats.set(name, m);
    return m;
  }

  update(dt, time) {
    for (const a of this.anim) {
      a.acc += dt;
      if (a.acc < (a.def.every || 0.1)) continue;
      a.acc = 0;
      a.def.paint(a.ctx, a.w, a.h, time);
      a.t.needsUpdate = true;
    }
  }
}

// ---------------------------------------------------------------- painters
function noise(ctx, w, h, n, colors, rmin, rmax, seed) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = colors[(r() * colors.length) | 0];
    const s = rmin + r() * (rmax - rmin);
    ctx.globalAlpha = 0.25 + r() * 0.35;
    ctx.beginPath(); ctx.arc(r() * w, r() * h, s, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function star(ctx, cx, cy, R, r, n = 5) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r : R; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  ctx.closePath();
}
function text(ctx, s, x, y, size, color, outline, align = 'center') {
  ctx.font = `700 ${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
  if (outline) { ctx.lineWidth = Math.max(3, size * 0.16); ctx.strokeStyle = outline; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
  ctx.fillStyle = color; ctx.fillText(s, x, y);
}

const PAINTERS = {
  missing: { paint: (c, w, h) => { c.fillStyle = '#ff00ff'; c.fillRect(0, 0, w, h); } },
  wood: {
    size: 256, rough: 0.6, paint(c, w, h) {
      const cols = ['#d9a066', '#cf9558', '#e2ad74', '#c98c50'];
      const r = rng(7);
      for (let i = 0; i < 4; i++) {
        c.fillStyle = cols[i]; c.fillRect(0, i * h / 4, w, h / 4);
        const off = r() * w;
        c.fillStyle = 'rgba(90,50,20,.35)'; c.fillRect(off, i * h / 4, 3, h / 4); c.fillRect((off + w / 2) % w, i * h / 4, 3, h / 4);
        c.fillStyle = 'rgba(255,240,210,.18)'; c.fillRect(0, i * h / 4 + 2, w, 3);
        c.fillStyle = 'rgba(90,50,20,.30)'; c.fillRect(0, (i + 1) * h / 4 - 3, w, 3);
      }
      noise(c, w, h, 120, ['#b07440', '#f0c08a'], 1, 3, 3);
    },
  },
  deck: {
    size: 256, rough: 0.8, paint(c, w, h) {
      for (let i = 0; i < 5; i++) {
        c.fillStyle = i % 2 ? '#b8835a' : '#c48f63'; c.fillRect(i * w / 5, 0, w / 5, h);
        c.fillStyle = 'rgba(70,40,20,.45)'; c.fillRect((i + 1) * w / 5 - 4, 0, 4, h);
        c.fillStyle = 'rgba(70,40,20,.5)'; c.fillRect(i * w / 5 + w / 10 - 2, 30 + i * 40 % 200, 4, 4); c.fillRect(i * w / 5 + w / 10 - 2, 30 + (i * 40 + 128) % 256, 4, 4);
      }
      noise(c, w, h, 90, ['#8d5a33', '#e0b088'], 1, 3, 9);
    },
  },
  tiles: {
    size: 256, rough: 0.35, paint(c, w, h) {
      const n = 4, s = w / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        c.fillStyle = (i + j) % 2 ? '#f6f1e4' : '#e86a5a'; c.fillRect(i * s, j * s, s, s);
        c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(i * s + 4, j * s + 4, s - 8, 6);
      }
      c.strokeStyle = 'rgba(80,60,50,.35)'; c.lineWidth = 3;
      for (let i = 0; i <= n; i++) { c.beginPath(); c.moveTo(i * s, 0); c.lineTo(i * s, h); c.stroke(); c.beginPath(); c.moveTo(0, i * s); c.lineTo(w, i * s); c.stroke(); }
    },
  },
  carpet: {
    size: 256, rough: 0.95, paint(c, w, h) {
      c.fillStyle = '#6aa8f0'; c.fillRect(0, 0, w, h);
      noise(c, w, h, 900, ['#5b97e0', '#7cb6f5', '#4f8ad6'], 1, 2.5, 4);
    },
  },
  concrete: {
    size: 256, rough: 0.9, paint(c, w, h) {
      c.fillStyle = '#c9c4d6'; c.fillRect(0, 0, w, h);
      noise(c, w, h, 400, ['#b5afc6', '#dad6e4', '#a9a3bb'], 2, 7, 5);
      c.strokeStyle = 'rgba(90,80,110,.25)'; c.lineWidth = 3; c.strokeRect(0, 0, w, h);
    },
  },
  grass: {
    size: 256, rough: 1, paint(c, w, h) {
      c.fillStyle = '#62c544'; c.fillRect(0, 0, w, h);
      noise(c, w, h, 700, ['#55b83a', '#74d356', '#4aa833', '#86dd62'], 3, 10, 6);
      const r = rng(11);
      c.strokeStyle = 'rgba(60,140,40,.5)'; c.lineWidth = 2;
      for (let i = 0; i < 200; i++) { const x = r() * w, y = r() * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 4, y - 6 - r() * 5); c.stroke(); }
    },
  },
  path: {
    size: 256, rough: 0.9, paint(c, w, h) {
      c.fillStyle = '#e9d7b4'; c.fillRect(0, 0, w, h);
      const s = w / 2;
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        c.fillStyle = (i + j) % 2 ? '#f0e2c4' : '#e3cfa8'; roundRect(c, i * s + 4, j * s + 4, s - 8, s - 8, 12); c.fill();
      }
      noise(c, w, h, 150, ['#cdb68c', '#fff3dc'], 1, 3, 12);
    },
  },
  asphalt: {
    size: 256, rough: 0.95, paint(c, w, h) {
      c.fillStyle = '#5c6070'; c.fillRect(0, 0, w, h);
      noise(c, w, h, 600, ['#4c5060', '#6c7080', '#555a6a'], 1, 3, 13);
      c.fillStyle = '#f6c445'; c.fillRect(w / 2 - 6, 0, 12, h * 0.55);
    },
  },
  rugRound: {
    size: 256, rough: 0.95, repeat: false, alpha: true, paint(c, w, h) {
      const cx = w / 2, cy = h / 2;
      const rings = ['#e86a5a', '#ffd23f', '#5cc2a8', '#ff8fb8', '#ffffff', '#e86a5a'];
      for (let i = 0; i < rings.length; i++) { c.fillStyle = rings[i]; c.beginPath(); c.arc(cx, cy, w / 2 - 2 - i * 20, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = '#ffd23f'; star(c, cx, cy, 40, 18); c.fill();
    },
  },
  rugRoad: {
    size: 512, rough: 0.95, repeat: false, paint(c, w, h) {
      // a kid's play-mat with roads and houses
      c.fillStyle = '#7fd14d'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#6a6f80'; c.fillRect(0, h * 0.42, w, h * 0.16); c.fillRect(w * 0.42, 0, w * 0.16, h);
      c.fillStyle = '#fff'; for (let i = 0; i < w; i += 40) { c.fillRect(i, h / 2 - 3, 22, 6); c.fillRect(w / 2 - 3, i, 6, 22); }
      const blocks = [[40, 40, '#ff8fb8'], [360, 50, '#ffd23f'], [50, 360, '#7ec8ff'], [370, 380, '#ff9a3c']];
      for (const [x, y, col] of blocks) { c.fillStyle = col; c.fillRect(x, y, 90, 70); c.fillStyle = '#d9443a'; c.beginPath(); c.moveTo(x - 8, y); c.lineTo(x + 45, y - 40); c.lineTo(x + 98, y); c.fill(); }
      c.strokeStyle = '#3a8a2a'; c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10);
    },
  },
  rugStripe: {
    size: 256, rough: 0.95, repeat: false, paint(c, w, h) {
      const cols = ['#3f63a8', '#f6c445', '#e8473c', '#f6c445'];
      for (let i = 0; i < 8; i++) { c.fillStyle = cols[i % 4]; c.fillRect(0, i * h / 8, w, h / 8); }
      c.strokeStyle = '#2b3a7a'; c.lineWidth = 12; c.strokeRect(6, 6, w - 12, h - 12);
    },
  },
  bricks: {
    size: 256, rough: 0.85, paint(c, w, h) {
      c.fillStyle = '#e9e2f2'; c.fillRect(0, 0, w, h);
      const bw = 64, bh = 32;
      for (let j = 0; j < h / bh; j++) for (let i = -1; i < w / bw + 1; i++) {
        const x = i * bw + (j % 2 ? bw / 2 : 0), y = j * bh;
        c.fillStyle = ['#d9cfe8', '#cfc4e2', '#e2dbef'][(i + j * 3 + 9) % 3]; c.fillRect(x + 3, y + 3, bw - 6, bh - 6);
      }
    },
  },
  siding: {
    size: 256, rough: 0.8, paint(c, w, h) {
      for (let j = 0; j < 8; j++) {
        c.fillStyle = '#f4e7c8'; c.fillRect(0, j * h / 8, w, h / 8);
        c.fillStyle = 'rgba(150,120,70,.28)'; c.fillRect(0, (j + 1) * h / 8 - 5, w, 5);
        c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(0, j * h / 8, w, 3);
      }
    },
  },
  shingles: {
    size: 256, rough: 0.8, paint(c, w, h) {
      c.fillStyle = '#c23a31'; c.fillRect(0, 0, w, h);
      const sw = 42, sh = 32;
      for (let j = 0; j < h / sh + 1; j++) for (let i = -1; i < w / sw + 1; i++) {
        const x = i * sw + (j % 2 ? sw / 2 : 0), y = j * sh;
        c.fillStyle = ['#e0483c', '#d6433a', '#e85246'][(i * 7 + j * 3 + 30) % 3];
        roundRect(c, x + 2, y, sw - 4, sh + 6, 10); c.fill();
        c.fillStyle = 'rgba(120,20,20,.35)'; c.fillRect(x + 2, y + sh + 2, sw - 4, 4);
      }
    },
  },
  // ---- wallpapers (world-aligned on wall faces, 4 units per repeat)
  wpStars: {
    size: 256, rough: 0.85, paint(c, w, h) {
      c.fillStyle = '#a9d8ff'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#b8e0ff'; for (let i = 0; i < 4; i++) c.fillRect(i * 64, 0, 32, h);
      const pts = [[32, 40, '#ffffff'], [160, 30, '#f6c445'], [96, 120, '#ffffff'], [224, 140, '#f6c445'], [40, 200, '#f6c445'], [170, 220, '#ffffff']];
      for (const [x, y, col] of pts) { c.fillStyle = col; star(c, x, y, 13, 6); c.fill(); }
    },
  },
  wpStripes: {
    size: 256, rough: 0.85, paint(c, w, h) {
      c.fillStyle = '#cdeec0'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#bfe6b0'; for (let i = 0; i < 8; i++) c.fillRect(i * 32, 0, 14, h);
      c.fillStyle = '#ffffff'; c.globalAlpha = 0.5; for (let i = 0; i < 8; i++) c.fillRect(i * 32 + 15, 0, 3, h); c.globalAlpha = 1;
    },
  },
  wpDots: {
    size: 256, rough: 0.8, paint(c, w, h) {
      c.fillStyle = '#fff2c9'; c.fillRect(0, 0, w, h);
      const cols = ['#ffb3a0', '#9fd8c8', '#ffd23f'];
      for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) { c.fillStyle = cols[(i + j) % 3]; c.beginPath(); c.arc(i * 43 + (j % 2) * 21 + 10, j * 43 + 10, 6, 0, Math.PI * 2); c.fill(); }
    },
  },
  wpHall: {
    size: 256, rough: 0.85, paint(c, w, h) {
      c.fillStyle = '#fde9b8'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#f6d998'; for (let i = 0; i < 4; i++) c.fillRect(i * 64 + 20, 0, 24, h);
      c.fillStyle = '#e8473c'; c.globalAlpha = 0.18; for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(i * 64 + 32, j * 64 + 32, 7, 0, Math.PI * 2); c.fill(); } c.globalAlpha = 1;
    },
  },
  wpBase: {
    size: 256, rough: 0.9, paint(c, w, h) {
      // basement: chunky painted toy-brick wall
      c.fillStyle = '#d4cbe6'; c.fillRect(0, 0, w, h);
      const bw = 128, bh = 64, cols = ['#e3dcf0', '#d9cff0', '#efe9f8', '#cfc4e6'];
      for (let j = 0; j < 4; j++) for (let i = -1; i < 3; i++) {
        const x = i * bw + (j % 2 ? bw / 2 : 0), y = j * bh;
        c.fillStyle = cols[(i + j * 2 + 8) % 4]; roundRect(c, x + 4, y + 4, bw - 8, bh - 8, 10); c.fill();
        c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x + 12, y + 9, bw - 24, 5);
      }
    },
  },
  ballpit: {
    size: 256, rough: 0.4, paint(c, w, h) {
      c.fillStyle = '#7ec8ff'; c.fillRect(0, 0, w, h);
      const r = rng(21), cols = ['#ff5fa2', '#ffd23f', '#3f8fe8', '#5cc23a', '#ff9a3c', '#9b6cff'];
      for (let i = 0; i < 160; i++) {
        const x = r() * w, y = r() * h, s = 10 + r() * 6; c.fillStyle = cols[(r() * cols.length) | 0];
        c.beginPath(); c.arc(x, y, s, 0, Math.PI * 2); c.fill();
        c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(x - s * .35, y - s * .35, s * .3, 0, Math.PI * 2); c.fill();
      }
    },
  },
  // ---- pictures (single use, not repeating)
  posterRocket: {
    size: [256, 340], repeat: false, rough: 0.6, paint(c, w, h) {
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1c2160'); g.addColorStop(1, '#5a3fa8'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      noise(c, w, h, 60, ['#ffffff', '#fff3a0'], 1, 2.5, 2);
      c.save(); c.translate(w / 2, h / 2 - 10); c.rotate(-0.35);
      c.fillStyle = '#ff9a3c'; c.beginPath(); c.moveTo(-18, 70); c.lineTo(0, 120); c.lineTo(18, 70); c.fill();
      c.fillStyle = '#ffffff'; roundRect(c, -30, -60, 60, 135, 28); c.fill();
      c.fillStyle = '#e8473c'; c.beginPath(); c.moveTo(-30, -30); c.quadraticCurveTo(0, -120, 30, -30); c.fill();
      c.fillStyle = '#e8473c'; c.beginPath(); c.moveTo(-30, 40); c.lineTo(-55, 80); c.lineTo(-30, 75); c.fill(); c.beginPath(); c.moveTo(30, 40); c.lineTo(55, 80); c.lineTo(30, 75); c.fill();
      c.fillStyle = '#7ec8ff'; c.beginPath(); c.arc(0, -10, 16, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#3f63a8'; c.lineWidth = 5; c.stroke();
      c.restore();
      text(c, 'TO THE', w / 2, h - 62, 26, '#f6c445', '#1b1220');
      text(c, 'STARS!', w / 2, h - 30, 34, '#f6c445', '#1b1220');
      c.strokeStyle = '#f6c445'; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8);
    },
  },
  posterDino: {
    size: [256, 340], repeat: false, rough: 0.6, paint(c, w, h) {
      c.fillStyle = '#9ff0d0'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(200, 60, 34, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#5cc23a'; c.fillRect(0, h - 70, w, 70);
      // dino
      c.fillStyle = '#3fae5a';
      c.beginPath(); c.ellipse(120, 200, 70, 45, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(170, 190); c.quadraticCurveTo(210, 120, 200, 90); c.lineTo(225, 85); c.quadraticCurveTo(235, 140, 190, 215); c.fill();
      c.beginPath(); c.ellipse(212, 88, 26, 18, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(55, 200); c.quadraticCurveTo(10, 210, 5, 250); c.quadraticCurveTo(40, 230, 70, 225); c.fill();
      c.fillRect(80, 230, 22, 45); c.fillRect(140, 230, 22, 45);
      c.fillStyle = '#ff9a3c'; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(70 + i * 20, 160 - Math.sin(i / 5 * Math.PI) * 10); c.lineTo(80 + i * 20, 135 - Math.sin(i / 5 * Math.PI) * 14); c.lineTo(90 + i * 20, 160 - Math.sin(i / 5 * Math.PI) * 10); c.fill(); }
      c.fillStyle = '#fff'; c.beginPath(); c.arc(218, 82, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = '#1b1220'; c.beginPath(); c.arc(220, 82, 3.5, 0, Math.PI * 2); c.fill();
      text(c, 'RAWR!', w / 2, 36, 40, '#e8473c', '#ffffff');
      c.strokeStyle = '#3f63a8'; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8);
    },
  },
  posterKinan: {
    size: [384, 192], repeat: false, rough: 0.6, paint(c, w, h) {
      c.fillStyle = '#c2414f'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#f6c445'; for (let i = 0; i < 6; i++) { star(c, 30 + i * 65, 30, 14, 6); c.fill(); star(c, 30 + i * 65, h - 30, 14, 6); c.fill(); }
      text(c, 'KINAN', w / 2, h / 2 + 2, 92, '#f6c445', '#1b1220');
    },
  },
  posterGlitchy: {
    size: [256, 256], repeat: false, rough: 0.6, paint(c, w, h) {
      c.fillStyle = '#1e2150'; c.fillRect(0, 0, w, h);
      const g = c.createLinearGradient(0, 60, 0, 200); g.addColorStop(0, '#ff3df0'); g.addColorStop(1, '#00ffd0');
      c.fillStyle = g; c.beginPath(); c.arc(w / 2, h / 2 + 6, 72, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#1b1220'; c.beginPath(); c.ellipse(w / 2 - 26, h / 2, 12, 17, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(w / 2 + 26, h / 2, 12, 17, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(w / 2 - 22, h / 2 - 6, 5, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(w / 2 + 30, h / 2 - 6, 5, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#1b1220'; c.lineWidth = 5; c.beginPath(); c.arc(w / 2, h / 2 + 22, 14, 0.2, Math.PI - 0.2); c.stroke();
      c.fillStyle = '#ff3df0'; c.fillRect(30, 40, 14, 14); c.fillStyle = '#00ffd0'; c.fillRect(205, 190, 14, 14); c.fillRect(210, 50, 10, 10);
      text(c, 'GLITCHY', w / 2, 225, 30, '#00ffd0', '#1b1220');
    },
  },
  posterMap: {
    size: [340, 256], repeat: false, rough: 0.6, paint(c, w, h) {
      c.fillStyle = '#f4e7c8'; c.fillRect(0, 0, w, h);
      c.strokeStyle = '#8a5a34'; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8);
      c.setLineDash([10, 8]); c.strokeStyle = '#e8473c'; c.lineWidth = 5;
      c.beginPath(); c.moveTo(30, 200); c.bezierCurveTo(90, 120, 140, 230, 190, 140); c.bezierCurveTo(230, 70, 280, 120, 300, 60); c.stroke(); c.setLineDash([]);
      for (let i = 1; i <= 11; i++) { const t = i / 12; const x = 30 + t * 270, y = 200 - Math.sin(t * Math.PI * 1.3) * 90 - t * 40; c.fillStyle = '#3f63a8'; c.beginPath(); c.arc(x, y, 9, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = '#f6c445'; star(c, 300, 60, 18, 8); c.fill(); c.strokeStyle = '#1b1220'; c.lineWidth = 2; c.stroke();
      text(c, '11 WORLDS', w / 2, 32, 30, '#1b1220');
    },
  },
  photoFamily: {
    size: [256, 200], repeat: false, rough: 0.5, paint(c, w, h) {
      c.fillStyle = '#7ec8ff'; c.fillRect(0, 0, w, h); c.fillStyle = '#62c544'; c.fillRect(0, h * 0.65, w, h);
      const ppl = [[60, '#c2414f', 46], [110, '#3f63a8', 60], [160, '#ff8fb8', 56], [205, '#f6c445', 40]];
      for (const [x, col, s] of ppl) { c.fillStyle = col; roundRect(c, x - s * 0.35, h * 0.95 - s * 1.5, s * 0.7, s, 10); c.fill(); c.fillStyle = '#d9a27a'; c.beginPath(); c.arc(x, h * 0.95 - s * 1.65, s * 0.32, 0, Math.PI * 2); c.fill(); c.fillStyle = '#4a2c1a'; c.beginPath(); c.arc(x, h * 0.95 - s * 1.78, s * 0.3, Math.PI, 0); c.fill(); }
      c.strokeStyle = '#8a5a34'; c.lineWidth = 14; c.strokeRect(0, 0, w, h);
    },
  },
  photoDog: {
    size: [200, 200], repeat: false, rough: 0.5, paint(c, w, h) {
      c.fillStyle = '#ffd23f'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(100, 115, 52, 48, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#8a5a34'; c.beginPath(); c.ellipse(58, 90, 18, 34, 0.3, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(142, 90, 18, 34, -0.3, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(120, 100, 18, 16, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#1b1220'; c.beginPath(); c.arc(82, 105, 7, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(118, 105, 7, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(100, 128, 10, 7, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#ffffff'; c.lineWidth = 12; c.strokeRect(0, 0, w, h);
    },
  },
  window: {
    size: [128, 128], repeat: false, glow: true, paint(c, w, h) {
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#9fd8ff'); g.addColorStop(1, '#e8f7ff'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    },
  },
  tv: {
    size: [256, 144], repeat: false, glow: true, pixel: true, animate: true, every: 0.08, paint(c, w, h, t) {
      // The TV plays the 2D game: a pixel Kinan running past blocks and coins.
      c.fillStyle = '#7ec8ff'; c.fillRect(0, 0, w, h);
      const sc = (t * 60) % 64;
      c.fillStyle = '#ffffff'; for (let i = 0; i < 4; i++) { const x = ((i * 80 - t * 15) % 320 + 320) % 320 - 40; c.fillRect(x, 20 + (i % 2) * 14, 36, 10); c.fillRect(x + 8, 14 + (i % 2) * 14, 18, 8); }
      c.fillStyle = '#62c544'; c.fillRect(0, h - 28, w, 28);
      c.fillStyle = '#8a5a34'; for (let x = -sc; x < w; x += 16) c.fillRect(x, h - 14, 8, 6);
      c.fillStyle = '#ff9a3c'; for (let x = -((t * 60) % 96); x < w; x += 96) { c.fillRect(x + 40, h - 70, 16, 16); c.fillStyle = '#ffd23f'; c.fillRect(x + 44, h - 92 + Math.sin(t * 6 + x) * 3, 8, 12); c.fillStyle = '#ff9a3c'; }
      // pixel Kinan
      const kx = 70, ky = h - 28, f = Math.floor(t * 10) % 2;
      c.fillStyle = '#1b1220'; c.fillRect(kx + (f ? 0 : 4), ky - 6, 6, 6); c.fillRect(kx + (f ? 10 : 6), ky - 6, 6, 6);
      c.fillStyle = '#3f63a8'; c.fillRect(kx + 2, ky - 14, 12, 8);
      c.fillStyle = '#c2414f'; c.fillRect(kx, ky - 26, 16, 12);
      c.fillStyle = '#f6c445'; c.fillRect(kx + 6, ky - 22, 4, 4);
      c.fillStyle = '#d9a27a'; c.fillRect(kx + 1, ky - 40, 14, 14);
      c.fillStyle = '#4a2c1a'; c.fillRect(kx, ky - 42, 16, 5); c.fillStyle = '#b88a3e'; c.fillRect(kx + 9, ky - 44, 3, 4);
      c.fillStyle = '#1b1220'; c.fillRect(kx + 10, ky - 34, 2, 3);
      c.fillStyle = 'rgba(255,255,255,.08)'; for (let y = 0; y < h; y += 4) c.fillRect(0, y, w, 1);
      text(c, 'KINAN VS. MOM', w / 2, 10, 12, '#f6c445', '#1b1220');
    },
  },
};

// Signs: 'sign:LINE 1|LINE 2' -> a wooden board with crisp pixel text.
function signDef(body) {
  const lines = body.split('|');
  const long = Math.max(...lines.map((s) => s.length));
  const W = 512, H = Math.max(160, 70 + lines.length * 74);
  return {
    size: [W, H], repeat: false, rough: 0.8, paint(c, w, h) {
      c.fillStyle = '#8a5a34'; roundRect(c, 0, 0, w, h, 28); c.fill();
      c.fillStyle = '#c98b52'; roundRect(c, 10, 10, w - 20, h - 20, 22); c.fill();
      c.fillStyle = 'rgba(255,240,210,.22)'; c.fillRect(24, 22, w - 48, 8);
      const size = Math.min(64, Math.floor((w - 60) / Math.max(4, long) * 1.65));
      lines.forEach((s, i) => text(c, s, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.12, size, '#fff8e6', '#5e3b20'));
    },
  };
}
export function signAspect(body) {
  const lines = body.split('|').length;
  return Math.max(160, 70 + lines * 74) / 512;
}

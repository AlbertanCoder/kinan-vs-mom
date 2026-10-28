// Prop library, part 3: Kinan's 3D Saskatoon (World 12-2 rooftops and 12-3 river valley).
// A level uses it with  props: CITY  (merged over the shared prop library) and  textures: CITY_TEXTURES.
// Houses have walkable roofs with FLAT GUTTER LEDGES along the eaves, so Kinan can grab and run along them,
// and ladders / trellises can be climbed straight onto them. Placement is like every prop:
// ['name', x, y, z, yawDegrees, {options}], front of a prop = local +z.
import * as THREE from 'three';
import { rng } from './util.js';
import { toyMat, dBox, dSphere, dCyl, bake, placeGroup } from './props.js';

const SID = 'sidingLines', ROOFTEX = 'roofRows', WIN = '#8fd3ff', TRIM = '#ffffff';
const LEAVES = ['#f2b632', '#f7c948', '#e8902f', '#b8cf45', '#d9603b'];
const NOCOL = { col: false, r: 0, cast: false };
const nc = (o = {}) => Object.assign({}, NOCOL, o);

// ------------------------------------------------------------------ textures (procedural, no files)
function speckle(c, w, h, n, cols, r0, r1, seed, a0 = 0.25, a1 = 0.6) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    c.fillStyle = cols[(r() * cols.length) | 0]; c.globalAlpha = a0 + r() * (a1 - a0);
    c.beginPath(); c.arc(r() * w, r() * h, r0 + r() * (r1 - r0), 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
}
export const CITY_TEXTURES = {
  // cut-out siding grooves (any wall colour shows through): a light board edge + a dark shadow line per board
  sidingLines: {
    size: 128, alpha: true, rough: 0.8, polyOffset: true, paint(c, w, h) {
      c.clearRect(0, 0, w, h);
      for (let j = 0; j < 4; j++) { const y = j * h / 4; c.fillStyle = 'rgba(255,255,255,0.85)'; c.fillRect(0, y + 1, w, 3); c.fillStyle = 'rgba(60,45,40,0.8)'; c.fillRect(0, y + h / 4 - 5, w, 4); }
    },
  },
  // cut-out shingle rows for any roof colour
  roofRows: {
    size: 128, alpha: true, rough: 0.8, polyOffset: true, paint(c, w, h) {
      c.clearRect(0, 0, w, h);
      for (let j = 0; j < 4; j++) {
        const y = j * h / 4;
        c.fillStyle = 'rgba(30,25,35,0.75)'; c.fillRect(0, y + h / 4 - 5, w, 5);
        for (let i = 0; i < 4; i++) c.fillRect(((i + (j % 2) * 0.5) * w / 4) | 0, y, 4, h / 4);
        c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(0, y, w, 2);
      }
    },
  },
  water: {
    size: 128, rough: 0.15, animate: true, every: 0.1, paint(c, w, h, t) {
      c.fillStyle = '#3f9fc4'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#57b6d6'; c.fillRect(0, 0, w, h / 2);
      for (let i = 0; i < 9; i++) {
        const y = (i * 37 + t * 22) % h, x = (i * 53 + Math.sin(t * 1.3 + i) * 10 + w) % w;
        c.fillStyle = i % 3 ? 'rgba(220,250,255,0.55)' : 'rgba(255,255,255,0.8)';
        c.fillRect(x, y, 22 + (i % 4) * 8, 3); c.fillRect((x + 64) % w, (y + 64) % h, 14, 2);
      }
    },
  },
  gravel: { size: 256, rough: 0.95, paint(c, w, h) { c.fillStyle = '#bfb39c'; c.fillRect(0, 0, w, h); speckle(c, w, h, 900, ['#a89a80', '#d6ccb8', '#8f8370', '#e6dccb'], 1, 3.5, 21); } },
  leafGrass: {
    size: 256, rough: 1, paint(c, w, h) {
      c.fillStyle = '#7cbf45'; c.fillRect(0, 0, w, h);
      speckle(c, w, h, 600, ['#6aae38', '#8fcf55', '#5e9e34', '#a7d462'], 3, 9, 6);
      speckle(c, w, h, 120, ['#f2b632', '#e8902f', '#d9603b', '#f7c948'], 2, 4.5, 8, 0.7, 1);
    },
  },
  clay: {
    size: 256, rough: 1, paint(c, w, h) {
      const cols = ['#d4a86a', '#c9975a', '#dcb57c', '#c28e55'];
      for (let i = 0; i < 6; i++) { c.fillStyle = cols[i % 4]; c.fillRect(0, i * h / 6, w, h / 6 + 1); }
      speckle(c, w, h, 300, ['#b5814a', '#e8c894', '#a9773f'], 2, 6, 31);
      c.fillStyle = 'rgba(90,60,30,.25)'; for (let i = 0; i < 6; i++) c.fillRect(0, (i + 1) * h / 6 - 3, w, 3);
    },
  },
  sand: { size: 256, rough: 1, paint(c, w, h) { c.fillStyle = '#ead9a6'; c.fillRect(0, 0, w, h); speckle(c, w, h, 700, ['#d9c58c', '#f6e9c0', '#cbb57a'], 1, 3, 41); } },
  trail: { size: 256, rough: 1, paint(c, w, h) { c.fillStyle = '#d8b98a'; c.fillRect(0, 0, w, h); speckle(c, w, h, 700, ['#c7a676', '#e6cca3', '#b8966a'], 1.5, 4, 51); speckle(c, w, h, 40, ['#e8902f', '#f2b632'], 2, 4, 52, 0.7, 1); } },
};

// ------------------------------------------------------------------ helpers
const shade = (hex, k = 0.78) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); };
// a window on a wall whose outside face is local z=0 (facing +z). x = centre, y = bottom.
function win(b, x, y, w, h, o = {}) {
  const fr = o.frame || TRIM;
  b.box(x, y - 0.32, 0.2, w + 0.7, 0.32, 0.42, fr, nc());
  b.box(x, y, 0.07, w + 0.36, h, 0.16, fr, nc());
  b.box(x, y + 0.18, 0.13, w - 0.2, h - 0.36, 0.1, o.glass || WIN, nc({ mat: 'gloss' }));
  if (w > 1.7) b.box(x, y + 0.18, 0.2, 0.18, h - 0.36, 0.06, fr, nc());
  b.box(x, y + h * 0.5, 0.2, w - 0.2, 0.16, 0.06, fr, nc());
  if (o.shutters) for (const sx of [-1, 1]) b.box(x + sx * (w / 2 + 0.6), y, 0.1, 0.75, h, 0.14, o.shutters, nc());
}
// run fn(faceWidth, side) in a frame on each wall face (local z=0 = the face, +z = outward, x along the face)
function onFaces(b, W, D, fn) {
  b.push(0, 0, D / 2, 0); fn(W, 'front'); b.pop();
  b.push(0, 0, -D / 2, 180); fn(W, 'back'); b.pop();
  b.push(W / 2, 0, 0, 90); fn(D, 'east'); b.pop();
  b.push(-W / 2, 0, 0, -90); fn(D, 'west'); b.pop();
}
// gable roof sloping along local x (ridge along z): walkable slopes + flat gutter ledges along both eaves
function gable(b, W, D, H, R, o) {
  const run = W / 2 - 0.9, L = D + 1.6, roof = o.roof || '#d9443a';
  for (const s of [-1, 1]) {
    b.ramp(s * run, 0, H, 0, 0, H + R, D - 0.2, o.color || '#ffd9a8', { base: H - 0.05, col: false, cast: false });  // gable fill
    b.ramp(s * run, 0, H, 0, 0, H + R, L, null, { vis: false, base: H - 0.4, cam: true });                       // walkable slope
    b.ramp(s * run, 0, H + 0.02, 0, 0, H + R + 0.02, L, roof, { thick: 0.45, col: false, over: 0.12 });          // roof plate
    b.texSlope(ROOFTEX, s * run, 0, H + 0.06, 0, 0, H + R + 0.06, L - 0.1, 2.4);
    b.box(s * W / 2, H - 0.55, 0, 1.8, 0.55, L, o.eave || '#f7f3ea', { r: 0.12, cam: true });                   // gutter ledge (top = H)
  }
  b.box(0, H + R - 0.2, 0, 0.9, 0.4, L + 0.1, o.ridge || shade(roof, 0.75), { col: false, r: 0.16 });
}

export const CITY = {
  // ================================================================ houses
  // {w, d, h, rise, gable:'front'|'side', flat, color, trim, roof, door:{x,color}, porch:{x,w,d,roof}, chimney:[x,z], storeys,
  //  banner:'TEXT', noWin:[sides]}
  house(b, o) {
    const W = o.w || 16, D = o.d || 18, H = o.h || 8, R = o.rise ?? 5, flat = !!o.flat;
    const col = o.color || '#ffd9a8', trim = o.trim || TRIM, roof = o.roof || '#d9443a';
    const bodyH = flat ? H - 0.45 : H;
    b.box(0, 0, 0, W, bodyH, D, col, { r: 0.18, cam: true });
    b.box(0, -0.3, 0, W + 0.4, 0.95, D + 0.4, o.base || '#d8cfc2', nc({ r: 0.1 }));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(sx * (W / 2 - 0.05), 0, sz * (D / 2 - 0.05), 0.6, bodyH, 0.6, trim, nc({ r: 0.1 }));
    if (o.band) for (const [x, z, w, d] of [[0, D / 2, W + 0.3, 0.4], [0, -D / 2, W + 0.3, 0.4], [W / 2, 0, 0.4, D + 0.3], [-W / 2, 0, 0.4, D + 0.3]]) b.box(x, o.band, z, w, 0.5, d, trim, nc());
    const storeys = o.storeys || (H > 13 ? 2 : 1), sh = H / storeys;
    const doorX = o.door ? (o.door.x ?? W * 0.22) : null;
    onFaces(b, W, D, (fw, side) => {
      if (o.siding !== false) b._wallFace(SID, -fw / 2 + 0.3, fw / 2 - 0.3, 0.65, bodyH - 0.1, 0.03, 1, o.sidingScale || 2.6, 0);
      if (o.noWin && o.noWin.includes(side)) return;
      const n = Math.max(1, Math.floor(fw / (flat ? 4.6 : 6)));
      for (let st = 0; st < storeys; st++) for (let i = 0; i < n; i++) {
        const x = -fw / 2 + fw * (i + 0.5) / n;
        if (side === 'front' && st === 0 && doorX !== null && Math.abs(x - doorX) < 3.4) continue;
        const ww = flat ? Math.min(3.4, fw / n - 1.2) : Math.min(3.2, fw / n - 2), wh = flat ? sh - 2.4 : Math.min(3.6, sh - 3.4);
        if (ww > 0.8 && wh > 1) win(b, x, st * sh + (flat ? 1.6 : 2.4), ww, wh, { glass: o.glass, frame: o.frame, shutters: side === 'front' ? o.shutters : null });
      }
    });
    if (o.door) {
      b.push(doorX, 0, D / 2, 0);
      b.box(0, 0.2, 0.08, 2.7, 5.0, 0.24, o.door.color || '#e8473c', nc({ r: 0.08 }));
      b.box(0, 0.2, 0.02, 3.4, 5.4, 0.16, trim, nc({ r: 0.06 }));
      b.sphere(0.85, 2.6, 0.3, 0.18, 'gold', nc({ mat: 'gloss' }));
      if (!o.porch) b.box(0, 0, 1.0, 4.0, 0.4, 2.0, '#d8cfc2', { r: 0.1 });
      b.pop();
    }
    if (o.porch) {
      const p = o.porch, pw = p.w || 9, pd = p.d || 4.4, px = p.x ?? doorX ?? 0, ry = p.roof ?? 6.2;
      b.box(px, 0, D / 2 + pd / 2, pw, 0.8, pd, p.color || '#f7f3ea', { r: 0.12 });
      b.texQuad('deck', px - pw / 2 + 0.2, D / 2 + 0.2, px + pw / 2 - 0.2, D / 2 + pd - 0.2, 0.81, 4);
      b.box(px, 0, D / 2 + pd + 0.7, 3.6, 0.4, 1.4, p.color || '#f7f3ea', { r: 0.1 });
      for (const sx of [-1, 1]) b.cyl(px + sx * (pw / 2 - 0.5), 0.8, D / 2 + pd - 0.5, 0.35, ry - 0.8, trim, { col: true, seg: 10 });
      if (p.roof !== false) {
        b.box(px, ry, D / 2 + pd / 2 + 0.2, pw + 0.8, 0.55, pd + 1.0, p.roofColor || roof, { r: 0.15 });
        b.box(px, ry - 0.3, D / 2 + pd / 2 + 0.2, pw + 0.4, 0.35, pd + 0.6, trim, nc({ r: 0.1 }));
      }
      if (p.rail !== false) for (const sx of [-1, 1]) b.box(px + sx * (pw / 2 - 0.2), 0.8, D / 2 + pd / 2, 0.3, 1.5, pd - 0.6, trim, { r: 0.08 });
    }
    // roof
    if (flat) {
      b.box(0, H - 0.45, 0, W + 0.5, 0.45, D + 0.5, roof, { r: 0.1, cam: true });
      b.box(0, H - 0.75, 0, W + 0.7, 0.32, D + 0.7, trim, nc({ r: 0.08 }));
    } else if (o.gable === 'side') { b.push(0, 0, 0, 90); gable(b, D, W, H, R, { color: col, roof, eave: o.eave }); b.pop(); }
    else gable(b, W, D, H, R, { color: col, roof, eave: o.eave });
    if (o.chimney) {
      const [cx, cz] = o.chimney, run = (o.gable === 'side' ? D : W) / 2 - 0.9;
      const u = o.gable === 'side' ? Math.abs(cz) : Math.abs(cx);
      const sy = flat ? H : H + R * Math.max(0, 1 - u / run);
      b.box(cx, sy - 1.4, cz, 2.4, 4.6, 2.4, '#c8553d', { r: 0.12, cam: true });
      b.box(cx, sy + 3.2, cz, 2.9, 0.45, 2.9, '#9aa3b2', { r: 0.12 });
    }
    if (o.banner) {
      const bx = o.porch ? (o.porch.x ?? doorX ?? 0) : 0, by = o.porch ? (o.porch.roof ?? 6.2) + 0.55 : H - 3;
      const bz = D / 2 + (o.porch ? (o.porch.d || 4.4) + 0.4 : 0.4);
      b.box(bx, by, bz, 10, 2.5, 0.3, '#f6c445', nc({ r: 0.12 }));
      b.texPanel('sign:' + o.banner, bx, by + 1.25, bz + 0.2, 9.4, 2.1, 0);
    }
  },
  // detached garage on the back lane (door = local front +z): flat walkable roof at h
  garage(b, o) {
    const W = o.w || 10, D = o.d || 8, H = o.h || 6, col = o.color || '#e3dcd0';
    b.box(0, 0, 0, W, H - 0.4, D, col, { r: 0.15, cam: true });
    b.box(0, H - 0.4, 0, W + 0.5, 0.4, D + 0.5, o.roof || '#5f6675', { r: 0.1, cam: true });
    onFaces(b, W, D, (fw) => b._wallFace(SID, -fw / 2 + 0.2, fw / 2 - 0.2, 0.4, H - 0.6, 0.03, 1, 2.6, 0));
    b.box(0, 0.1, D / 2 + 0.06, W - 2, H - 1.8, 0.16, o.door || '#f7f3ea', nc({ r: 0.06 }));
    for (let i = 1; i < 4; i++) b.box(0, 0.1 + i * (H - 1.8) / 4, D / 2 + 0.16, W - 2.2, 0.12, 0.05, '#cfc8bc', nc());
    b.box(W / 2 - 1.6, H - 2.4, D / 2 + 0.1, 0.4, 0.4, 0.2, '#fff6c8', nc({ mat: 'glow' }));
  },
  // ================================================================ street + yard
  car(b, o) {
    const c = o.color || '#e8473c', L = o.len || 8, W = 4.2;
    b.box(0, 0, 0, W, 2.2, L, null, { vis: false });
    b.box(0, 2.2, -0.3, W - 0.7, 1.3, L * 0.52, null, { vis: false });
    b.box(0, 0.75, 0, W, 1.45, L, c, { r: 0.55, col: false });
    b.box(0, 2.15, -0.3, W - 0.7, 1.35, L * 0.52, c, { r: 0.45, col: false });
    for (const sx of [-1, 1]) b.box(sx * (W / 2 - 0.36), 2.35, -0.3, 0.12, 0.95, L * 0.44, '#9fd8ff', nc({ mat: 'gloss' }));
    for (const sz of [-1, 1]) b.box(0, 2.35, -0.3 + sz * (L * 0.26 - 0.05), W - 1.2, 0.95, 0.12, '#9fd8ff', nc({ mat: 'gloss' }));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.cyl(sx * (W / 2 - 0.15), 0.75, sz * L * 0.3, 0.78, 0.6, '#2a2a33', nc({ rz: 90, seg: 14 }));
    for (const sx of [-1, 1]) { b.sphere(sx * 1.3, 1.5, L / 2 - 0.02, 0.34, '#fff6c8', nc({ mat: 'glow', seg: 8, s: [1, 0.8, 0.4] })); b.box(sx * 1.4, 1.25, -L / 2 - 0.02, 0.7, 0.4, 0.1, '#ff4a4a', nc({ mat: 'glow' })); }
    b.box(0, 0.55, L / 2 + 0.05, W - 0.2, 0.45, 0.3, '#dfe3ea', nc({ r: 0.12 }));
    b.box(0, 0.55, -L / 2 - 0.05, W - 0.2, 0.45, 0.3, '#dfe3ea', nc({ r: 0.12 }));
  },
  // autumn street elm (trunk collides, leaves do not)
  elm(b, o) {
    const s = o.s || 1, r = rng(o.seed || 5), leaf = o.leaf || LEAVES;
    b.cyl(0, 0, 0, 0.8 * s, 7.5 * s, '#7a5236', { taper: 0.68, col: true, cr: 0.85 * s, seg: 12 });
    const top = 7.2 * s;
    b.sphere(0, top + 3.0 * s, 0, 3.7 * s, leaf[0], { seg: 14 });
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28 + r(); b.sphere(Math.cos(a) * 3.3 * s, top + (1.2 + r() * 2.4) * s, Math.sin(a) * 3.3 * s, (2.0 + r() * 0.8) * s, leaf[(i + 1) % leaf.length], { seg: 12 }); }
  },
  // the BIG ELM: a giant tree with branch platforms spiralling up (branches: [[angleDeg, topY, len], ...]) and a kite stuck on top
  bigElm(b, o) {
    const Ht = o.h || 26, leaf = o.leaf || LEAVES, r = rng(o.seed || 77);
    b.cyl(0, 0, 0, 1.7, Ht, '#7a5236', { taper: 0.6, col: true, cr: 1.7, seg: 16, cam: true });
    for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28 + 0.4; b.box(Math.cos(a) * 1.8, 0, Math.sin(a) * 1.8, 1.4, 1.2, 1.4, '#6b4529', nc({ r: 0.4, yaw: a * 57 })); }   // roots
    for (const [ang, top, len, wid] of o.branches || []) {
      b.push(0, 0, 0, ang);
      const L = len || 5, w = wid || 2.6;
      b.box(0, top - 0.9, 1.0 + L / 2, w, 0.9, L, '#8a5a34', { r: 0.32, cam: true });
      b.box(0, top - 1.6, 1.4, 1.1, 0.8, 1.6, '#7a5236', nc({ r: 0.3 }));
      b.sphere(0, top - 1.4, 1.2 + L + 0.5, 1.25, leaf[(((Math.round(ang / 30)) % leaf.length) + leaf.length) % leaf.length], nc({ seg: 10 }));
      b.pop();
    }
    for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28 + r(); b.sphere(Math.cos(a) * (5 + r() * 2), Ht + 3 + r() * 3.5, Math.sin(a) * (5 + r() * 2), 3.2 + r(), leaf[i % leaf.length], nc({ seg: 14 })); }
    b.sphere(0, Ht + 6, 0, 5.2, leaf[1], nc({ seg: 16 }));
    if (o.kite) {
      const [kx, ky, kz] = o.kite;
      b.box(kx, ky, kz, 2.5, 2.5, 0.16, '#ff5fa2', nc({ rz: 45 }));
      b.box(kx, ky - 0.52, kz + 0.1, 0.12, 3.54, 0.1, '#ffffff', nc());
      b.box(kx, ky + 1.19, kz + 0.1, 3.54, 0.12, 0.1, '#ffffff', nc());
      for (let i = 0; i < 4; i++) b.box(kx + Math.sin(i) * 0.3, ky - 1.2 - i * 0.8, kz, 0.5, 0.25, 0.1, ['#ffd23f', '#3f8fe8', '#5cc23a', '#e8473c'][i], nc({ rz: 30 }));
    }
  },
  // climbable ladder against a wall (wall face = local z=0, ladder sticks out to +z). d = how far it stands out:
  // 1.2 for a house eave (clears the 0.9 gutter ledge), 0.5 for a flat roof
  ladder(b, o) {
    const H = o.h || 8, d = o.d ?? 1.2, w = o.w || 1.9, c = o.color || '#cfd6e2';
    b.box(0, 0, d / 2, w, H, d, null, { vis: false, climb: true, phys: { noLedge: true } });
    const tilt = Math.atan2(d - 0.15, H) * 180 / Math.PI;
    for (const sx of [-1, 1]) b.box(sx * (w / 2 - 0.12), -0.1, d * 0.55, 0.24, H + 0.9, 0.24, c, nc({ r: 0.06, rx: -tilt, mat: 'gloss' }));
    for (let y = 1; y < H; y += 1.25) b.box(0, y, d * (1 - y / H) + 0.15 * (y / H) + 0.05, w - 0.25, 0.16, 0.2, c, nc({ mat: 'gloss' }));
  },
  // climbable garden trellis with ivy and flowers (same rules as the ladder)
  trellis(b, o) {
    const H = o.h || 10, d = o.d ?? 0.5, w = o.w || 4, r = rng(o.seed || 13);
    b.box(0, 0, d / 2, w, H, d, null, { vis: false, climb: true, phys: { noLedge: true } });
    for (let x = -w / 2; x <= w / 2 + 0.01; x += w / 4) b.box(x, 0, 0.18, 0.16, H, 0.16, '#f7f3ea', nc());
    for (let y = 0.6; y < H; y += 1.4) b.box(0, y, 0.22, w, 0.16, 0.14, '#f7f3ea', nc());
    for (let i = 0; i < Math.round(H * 1.4); i++) b.sphere((r() - 0.5) * w, r() * H, 0.35, 0.45 + r() * 0.3, r() < 0.5 ? '#4cb043' : '#5cc23a', nc({ seg: 8, s: [1, 1, 0.5] }));
    for (let i = 0; i < Math.round(H * 0.6); i++) b.sphere((r() - 0.5) * w, r() * H, 0.6, 0.18, o.flower || '#ff5fa2', nc({ seg: 6 }));
  },
  // a pile of fallen leaves: soft and bouncy (jump onto it). {r, bounce}
  leafPile(b, o) {
    const R = o.r || 2.2, r = rng(o.seed || 9), cols = ['#e8902f', '#f2b632', '#d9603b', '#f7c948'];
    for (let i = 0; i < 7; i++) { const a = r() * 6.28, d = r() * R * 0.5; b.sphere(Math.cos(a) * d, 0.1, Math.sin(a) * d, R * (0.45 + r() * 0.25), cols[i % 4], nc({ s: [1, 0.42, 1], seg: 10, mat: 'soft' })); }
    for (let i = 0; i < 12; i++) { const a = r() * 6.28, d = R * (0.9 + r() * 0.8); b.box(Math.cos(a) * d, 0.02, Math.sin(a) * d, 0.45, 0.05, 0.3, cols[i % 4], nc({ yaw: r() * 180, mat: 'soft' })); }
    if (o.bounce !== false) b.cyl(0, 0, 0, R * 0.8, 0.45, null, { vis: false, col: true, phys: { bounce: o.bounce || 17 } });
  },
  fenceLow(b, o) {
    // a low picket fence from (0,0) to (len,0) along local x that Kinan can hop (its collider is as tall as it looks)
    const L = o.len || 8, H = o.h || 2.4, c = o.color || '#f7f3ea', n = Math.max(1, Math.round(L / 1.0));
    for (let i = 0; i <= n; i++) b.box(L * i / n, 0, 0, 0.42, H, 0.24, c, nc({ r: 0.1 }));
    for (const y of [0.6, H - 0.7]) b.box(L / 2, y, -0.2, L, 0.3, 0.16, c, nc());
    b.box(L / 2, 0, 0, L, H, 0.5, null, { vis: false, phys: { noWallJump: true } });
  },
  powerPole(b, o) {
    const H = o.h || 12;
    b.cyl(0, 0, 0, 0.36, H, '#8a6a4a', { col: true, seg: 10, taper: 0.85 });
    b.box(0, H - 1.6, 0, 5.2, 0.32, 0.32, '#7a5a3a', nc());
    for (const x of [-2.2, 0, 2.2]) b.cyl(x, H - 1.28, 0, 0.14, 0.4, '#7be3a3', nc({ seg: 6, mat: 'gloss' }));
    if (o.can) b.cyl(0.55, H - 4.2, 0, 0.55, 1.4, '#9aa3b2', nc({ seg: 10 }));
  },
  wires(b, o) {
    // three slightly sagging wires from (0, y, 0) to (len, y, 0)
    const L = o.len || 24, y = o.y || 10.7, n = 6;
    for (const dz of [-2.2, 0, 2.2]) for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n, sag = (t) => -Math.sin(t * Math.PI) * 0.7;
      const x0 = t0 * L, x1 = t1 * L, y0 = y + sag(t0), y1 = y + sag(t1);
      b.box((x0 + x1) / 2, (y0 + y1) / 2, dz, Math.hypot(x1 - x0, y1 - y0), 0.07, 0.07, '#2a2a33', nc({ rz: Math.atan2(y1 - y0, x1 - x0) * 57.3 }));
    }
  },
  hoop(b, o) {
    b.cyl(0, 0, 0, 0.2, 7.2, '#5f6675', { col: true, seg: 8 });
    b.box(0, 6.4, 0.5, 3.2, 2.1, 0.18, '#ffffff', nc({ r: 0.08 }));
    b.box(0, 6.8, 0.62, 1.2, 0.9, 0.06, '#e8473c', nc());
    b.torus(0, 6.6, 1.25, 0.6, 0.06, '#ff7a1a', nc());
    b.cone(0, 5.8, 1.25, 0.55, 0.8, '#ffffff', nc({ rx: 180, seg: 8 }));
  },
  hockeyNet(b, o) {
    for (const sx of [-1, 1]) b.box(sx * 1.8, 0, 0, 0.16, 2.0, 0.16, '#e8473c', nc());
    b.box(0, 1.9, 0, 3.7, 0.16, 0.16, '#e8473c', nc());
    b.box(0, 0, -0.8, 3.6, 1.9, 1.5, '#f7f3ea', { r: 0.2, mat: 'soft' });
    b.cyl(0.6, 0, 1.6, 0.35, 0.12, '#2a2a33', nc({ seg: 10 }));
  },
  pumpkin(b, o) {
    const s = o.s || 1;
    b.sphere(0, 0.62 * s, 0, 0.85 * s, '#ff8a1a', nc({ s: [1, 0.74, 1], seg: 12 }));
    b.cyl(0, 1.15 * s, 0, 0.1 * s, 0.4 * s, '#5e8a2a', nc({ seg: 6 }));
    if (o.face) for (const sx of [-1, 1]) b.box(sx * 0.3 * s, 0.75 * s, 0.78 * s, 0.22 * s, 0.22 * s, 0.06, '#ffe27a', nc({ mat: 'glow', rz: 45 }));
  },
  bench(b, o) {
    const W = o.w || 4.2;
    b.box(0, 0, 0, W, 1.5, 1.4, null, { vis: false });
    for (let i = 0; i < 3; i++) b.box(0, 1.25, -0.45 + i * 0.45, W, 0.2, 0.36, '#c98b52', nc({ r: 0.06 }));
    for (let i = 0; i < 2; i++) b.box(0, 1.9 + i * 0.55, -0.68, W, 0.36, 0.14, '#c98b52', nc({ r: 0.06 }));
    for (const sx of [-1, 1]) { b.box(sx * (W / 2 - 0.4), 0, 0, 0.2, 1.3, 1.2, '#2b3a7a', nc()); b.box(sx * (W / 2 - 0.4), 1.3, -0.7, 0.2, 1.4, 0.16, '#2b3a7a', nc()); }
  },
  railing(b, o) {
    // wooden railing along local x from 0 to len (collider as tall as it looks: Kinan can hop over it)
    const L = o.len || 10, H = o.h || 2.0, c = o.color || '#8d5a33', n = Math.max(1, Math.round(L / 2.6));
    for (let i = 0; i <= n; i++) b.box(L * i / n, 0, 0, 0.36, H, 0.36, c, nc({ r: 0.08 }));
    for (const y of [H * 0.45, H - 0.2]) b.box(L / 2, y, 0, L, 0.24, 0.2, c, nc({ r: 0.06 }));
    b.box(L / 2, 0, 0, L, H, 0.45, null, { vis: false, phys: { noWallJump: true } });
  },
  // ================================================================ road work (the flooded trench in 12-2)
  barrier(b, o) {
    const L = o.len || 4.4;
    b.box(0, 0, 0, L, 1.7, 0.5, null, { vis: false, phys: { noWallJump: true } });
    for (const sx of [-1, 1]) b.box(sx * (L / 2 - 0.3), 0, 0, 0.25, 1.6, 0.9, '#5f6675', nc());
    for (const y of [0.55, 1.15]) for (let i = 0; i < 4; i++) b.box(-L / 2 + L * (i + 0.5) / 4, y, 0, L / 4, 0.36, 0.14, i % 2 ? '#ffffff' : '#ff7a1a', nc());
    b.sphere(L / 2 - 0.3, 1.85, 0, 0.18, '#ffd23f', nc({ mat: 'glow', seg: 8 }));
  },
  cone(b, o) {
    b.box(0, 0, 0, 1.1, 0.14, 1.1, '#2a2a33', nc({ r: 0.04 }));
    b.cone(0, 0.12, 0, 0.48, 1.25, '#ff7a1a', nc({ seg: 10 }));
    b.cyl(0, 0.62, 0, 0.27, 0.18, '#ffffff', nc({ seg: 10, taper: 0.85 }));
  },
  digger(b, o) {
    const y0 = 0, c = '#ffd23f';
    for (const sx of [-1, 1]) b.box(sx * 1.9, y0, 0, 1.3, 1.4, 7.0, '#2a2a33', { r: 0.5 });
    b.box(0, y0 + 1.4, 0, 4.6, 2.0, 5.0, c, { r: 0.3 });
    b.box(-0.8, y0 + 3.4, -0.6, 2.6, 2.6, 2.8, c, { r: 0.3 });
    b.box(-0.8, y0 + 3.9, 0.82, 2.1, 1.7, 0.1, '#9fd8ff', nc({ mat: 'gloss' }));
    b.box(1.2, y0 + 3.4, 0.3, 1.0, 0.7, 0.9, '#2a2a33', nc({ r: 0.1 }));
    // arm (visual): boom up and out, stick down, bucket
    b.box(1.2, y0 + 3.6, 3.0, 0.9, 0.9, 5.6, c, nc({ r: 0.25, rx: -35 }));
    b.box(1.2, y0 + 3.2, 6.7, 0.8, 4.2, 0.8, c, nc({ r: 0.25 }));
    b.box(1.2, y0 + 1.6, 7.3, 1.8, 1.4, 1.6, '#5f6675', nc({ r: 0.2 }));
  },
  // a concrete culvert pipe lying along local z (a stepping stone in water): flat top at y + 2r
  pipe(b, o) {
    const R = o.r || 1.7, L = o.len || 6;
    b.box(0, 0, 0, R * 1.9, R * 2, L, null, { vis: false, cam: true });
    b.cyl(0, R, 0, R, L, o.color || '#c4c0b6', nc({ rx: 90, seg: 18, bevel: 0.25 }));
    for (const sz of [-1, 1]) b.cyl(0, R, sz * (L / 2 + 0.01), R * 0.68, 0.06, '#4b4f5a', nc({ rx: 90, seg: 18, bevel: 0 }));
    b.box(0, R * 2 - 0.05, 0, R * 1.2, 0.12, L - 0.6, '#d8d4ca', nc());
  },
  // ================================================================ river valley
  aspen(b, o) {
    const s = o.s || 1, r = rng(o.seed || 3);
    b.cyl(0, 0, 0, 0.45 * s, 9 * s, '#e9e4d6', { taper: 0.8, col: true, cr: 0.5 * s, seg: 10 });
    for (let i = 0; i < 5; i++) b.box(0, (1.5 + i * 1.6) * s, 0, 0.94 * s * (1 - i * 0.04), 0.14, 0.94 * s, '#4b4f5a', nc({ r: 0.05, yaw: i * 50 }));
    const leaf = o.leaf || ['#f7c948', '#f2b632', '#ffd23f', '#e8b52f'];
    b.sphere(0, 10 * s, 0, 2.5 * s, leaf[0], nc({ seg: 12, s: [1, 1.35, 1] }));
    for (let i = 0; i < 4; i++) { const a = i / 4 * 6.28 + r(); b.sphere(Math.cos(a) * 1.7 * s, (8.4 + r() * 3) * s, Math.sin(a) * 1.7 * s, 1.5 * s, leaf[(i + 1) % leaf.length], nc({ seg: 10 })); }
  },
  rockBig(b, o) {
    // a chunky boulder you can stand on (flat-ish top at h)
    const W = o.w || 3.6, H = o.h || 2, D = o.d || W, c = o.color || '#a7a29a';
    b.box(0, 0, 0, W, H, D, c, { r: Math.min(0.9, H * 0.4, W * 0.3), cam: true });
    b.box(W * 0.12, H - 0.25, -D * 0.1, W * 0.6, 0.4, D * 0.55, shade(c, 1.1), nc({ r: 0.2 }));
  },
  log(b, o) {
    // a fallen log lying along local x (stand on its flat top at 2r)
    const L = o.len || 8, R = o.r || 0.9;
    b.box(0, 0, 0, L, R * 2, R * 1.9, null, { vis: false });
    b.cyl(0, R, 0, R, L, '#8a5a34', nc({ rz: 90, seg: 14 }));
    for (const sx of [-1, 1]) b.cyl(sx * (L / 2 + 0.01), R, 0, R * 0.8, 0.06, '#e2ae73', nc({ rz: 90, seg: 14, bevel: 0 }));
  },
  pelican(b, o) {
    // the white pelicans of the river (o.fly = circle radius: flies round in circles)
    const g = new THREE.Group(), s = o.s || 1;
    const white = toyMat('#fbfbf7', 0.6), orange = toyMat('#ff9a3c', 0.45), black = toyMat('#2a2a33', 0.6);
    dSphere(g, 0, 1.6, 0, 0.9, null, { mat: white, s: [0.9, 0.8, 1.5] });
    dSphere(g, 0, 2.7, 1.0, 0.42, null, { mat: white });
    dCyl(g, 0, 1.9, 0.9, 0.22, 0.9, null, { mat: white });
    const bill = dBox(g, 0, 2.55, 1.9, 0.3, 0.22, 1.8, null, { mat: orange, r: 0.08 });
    dSphere(g, 0, 2.38, 1.7, 0.3, null, { mat: orange, s: [0.8, 0.7, 2] });
    for (const sx of [-1, 1]) dSphere(g, sx * 0.25, 2.85, 1.25, 0.08, null, { mat: black });
    const wings = [];
    for (const sx of [-1, 1]) {
      const wg = new THREE.Group(); wg.position.set(sx * 0.7, 1.8, 0); g.add(wg);
      dBox(wg, sx * (o.fly ? 1.4 : 0.1), -0.2, 0, o.fly ? 2.8 : 0.4, 0.25, 1.6, null, { mat: white, r: 0.1 });
      dBox(wg, sx * (o.fly ? 2.9 : 0.1), -0.2, -0.5, o.fly ? 0.6 : 0.4, 0.22, 0.7, null, { mat: black, r: 0.08 });
      wings.push(wg);
    }
    if (!o.fly) for (const sx of [-1, 1]) dCyl(g, sx * 0.3, 0, 0.2, 0.08, 1.0, null, { mat: orange });
    void bill;
    bake(g, false);
    g.scale.setScalar(s);
    const grp = placeGroup(b, g, 0, 0, 0, 0);
    const base = grp.position.clone(), ph = (o.seed || 1) * 1.3, yaw0 = grp.rotation.y;
    b.game.onUpdate((t) => {
      if (o.fly) {
        const a = t * (o.speed || 0.25) + ph;
        grp.position.set(base.x + Math.cos(a) * o.fly, base.y + Math.sin(t * 0.7 + ph) * 1.5, base.z + Math.sin(a) * o.fly);
        grp.rotation.y = -a; grp.rotation.z = 0.25;
        const f = Math.sin(t * 5 + ph) * 0.45; wings[0].rotation.z = f; wings[1].rotation.z = -f;
      } else { grp.position.y = base.y + Math.abs(Math.sin(t * 1.4 + ph)) * 0.05; grp.rotation.y = yaw0 + Math.sin(t * 0.5 + ph) * 0.4; }
    });
  },
  // ================================================================ far-away landmarks (no colliders)
  bessborough(b, o) {
    // the castle-like hotel by the river: buff walls, steep copper-green roofs, round turrets, a central tower
    const s = o.s || 1, wall = '#ecd9b2', roof = '#5aa891', dark = '#46546e';
    const B = (x, y, z, w, h, d, c, extra) => b.box(x * s, y * s, z * s, w * s, h * s, d * s, c, nc(Object.assign({ r: 0.25 * s }, extra || {})));
    const prism = (x, y, z, w, h, d, c) => { for (const sz of [-1, 1]) b.ramp(x * s, (z + sz * d / 2) * s, y * s, x * s, z * s, (y + h) * s, w * s, c, { base: y * s, col: false, cast: false }); };
    B(0, 0, 0, 64, 26, 14, wall);
    prism(0, 26, 0, 66, 12, 15, roof);
    B(-27, 0, 9, 12, 26, 12, wall); B(27, 0, 9, 12, 26, 12, wall);
    prism(-27, 26, 9, 13, 11, 13, roof); prism(27, 26, 9, 13, 11, 13, roof);
    B(0, 0, 2, 20, 40, 18, wall);
    b.cone(0, 40 * s, 2 * s, 14.4 * s, 18 * s, roof, nc({ seg: 4, yaw: 45 }));
    B(0, 57, 2, 1.6, 4, 1.6, roof);
    for (const [x, z] of [[-33, 15], [33, 15], [-33, -7], [33, -7], [-10, 11], [10, 11]]) {
      b.cyl(x * s, 0, z * s, 3.4 * s, 34 * s, wall, nc({ seg: 12 }));
      b.cone(x * s, 34 * s, z * s, 4.2 * s, 10 * s, roof, nc({ seg: 12 }));
    }
    for (let i = -6; i <= 6; i++) for (let j = 0; j < 4; j++) if (Math.abs(i) > 1 || j < 3) B(i * 4.4, 4 + j * 5.4, 7.05, 1.6, 2.6, 0.2, dark);
    for (let i = -2; i <= 2; i++) for (let j = 0; j < 6; j++) B(i * 3.6, 4 + j * 5.6, 11.05, 1.5, 2.6, 0.2, dark);
    for (const x of [-20, -12, 12, 20]) { B(x, 27, 6.5, 3, 4, 2.4, wall); prism(x, 31, 6.5, 3.2, 2.6, 2.6, roof); }
    B(0, 0, 13, 10, 7, 4, '#c9b48c');
    b.box(0, 58 * s, 2 * s, 0.25 * s, 6 * s, 0.25 * s, '#ffffff', nc());
    b.box(1.5 * s, 62 * s, 2 * s, 3 * s, 1.8 * s, 0.1, '#e8473c', nc());
  },
  tower(b, o) {
    const W = o.w || 14, D = o.d || 14, H = o.h || 50, c = o.color || '#cfd6e2', g = o.glass || '#7ec8ff';
    b.box(0, 0, 0, W, H, D, c, nc({ r: 0.4 }));
    for (let y = 3; y < H - 2; y += 3.4) {
      b.box(0, y, D / 2 + 0.05, W - 1.6, 1.8, 0.12, g, nc({ mat: 'gloss' }));
      b.box(W / 2 + 0.05, y, 0, 0.12, 1.8, D - 1.6, g, nc({ mat: 'gloss' }));
      b.box(-W / 2 - 0.05, y, 0, 0.12, 1.8, D - 1.6, g, nc({ mat: 'gloss' }));
    }
    b.box(0, H, 0, W * 0.6, 3, D * 0.6, shade(c, 0.85), nc({ r: 0.3 }));
    if (o.spire) b.cone(0, H + 3, 0, 1.4, 8, '#dfe3ea', nc({ seg: 8 }));
  },
  // concrete arch bridge (the Broadway Bridge look) along local x, deck at y = deck; arches stand on the water (y = 0)
  archBridge(b, o) {
    const L = o.len || 180, n = o.arches || 6, span = L / n, R = span * 0.46, Y = o.deck || R + 3, c = o.color || '#d6d0c2';
    b.box(0, Y, 0, L, 1.8, 11, c, nc({ r: 0.4 }));
    for (const sz of [-1, 1]) b.box(0, Y + 1.8, sz * 5.2, L, 1.1, 0.5, '#f7f3ea', nc());
    for (let i = 0; i < n; i++) {
      const x = -L / 2 + span * (i + 0.5);
      for (const sz of [-1, 1]) b.torus(x, 0, sz * 3.6, R, 1.3, c, nc({ rx: 0 }));
      for (let k = -3; k <= 3; k++) { const px = x + k * R / 3.6, top = Math.sqrt(Math.max(0, R * R - (k * R / 3.6) ** 2)); for (const sz of [-1, 1]) b.box(px, top, sz * 3.6, 0.9, Math.max(0.5, Y - top), 1.1, c, nc()); }
      if (i > 0) b.box(x - span / 2, -4, 0, 4, Y + 4, 12, shade(c, 0.9), nc({ r: 0.5 }));
    }
  },
  // steel truss bridge (the old Traffic Bridge look) along local x
  trussBridge(b, o) {
    const L = o.len || 160, n = o.spans || 4, span = L / n, Y = o.deck || 14, Ht = 9, c = o.color || '#9aa8b8';
    b.box(0, Y, 0, L, 1.2, 9, '#cfc8bc', nc({ r: 0.3 }));
    for (let i = 0; i < n; i++) {
      const x0 = -L / 2 + i * span;
      for (const sz of [-1, 1]) {
        const z = sz * 4.4;
        b.box(x0 + span / 2, Y + Ht, z, span * 0.8, 0.6, 0.6, c, nc());
        for (let k = 0; k <= 4; k++) b.box(x0 + span * (0.1 + k * 0.2), Y + 1.2, z, 0.45, Ht, 0.45, c, nc());
        for (let k = 0; k < 4; k++) { const xa = x0 + span * (0.1 + k * 0.2), xb = xa + span * 0.2, up = k % 2 === 0; b.box((xa + xb) / 2, Y + 1.2 + Ht / 2 - 0.2, z, Math.hypot(xb - xa, Ht), 0.4, 0.4, c, nc({ rz: (up ? 1 : -1) * Math.atan2(Ht, xb - xa) * 57.3 })); }
        b.ramp(x0, z, Y + 1.2, x0 + span * 0.1, z, Y + Ht + 0.6, 0.6, c, { thick: 0.5, col: false, cast: false });
        b.ramp(x0 + span, z, Y + 1.2, x0 + span * 0.9, z, Y + Ht + 0.6, 0.6, c, { thick: 0.5, col: false, cast: false });
      }
      if (i > 0) b.box(x0, -4, 0, 3.6, Y + 4, 10, '#c9c2b4', nc({ r: 0.5 }));
    }
  },
  // trail-head map board
  mapBoard(b, o) {
    for (const sx of [-1, 1]) b.box(sx * 1.8, 0, 0, 0.35, 4.4, 0.35, '#8d5a33', { col: true, r: 0.08 });
    b.box(0, 2.0, 0, 4.2, 2.6, 0.3, '#8d5a33', nc({ r: 0.1 }));
    b.texPanel('sign:' + (o.text || 'RIVER|VALLEY|TRAIL'), 0, 3.3, 0.17, 3.9, 2.3, 0);
    b.ramp(0, -0.9, 4.4, 0, 0, 5.0, 4.8, '#5e3b20', { thick: 0.25, col: false });
    b.ramp(0, 0.9, 4.4, 0, 0, 5.0, 4.8, '#5e3b20', { thick: 0.25, col: false });
  },
};

// Show the level's own name on the title card + loading screen (the shared page says 12-1).
export function titleCard(L) {
  try {
    const card = document.getElementById('titlecard');
    if (!card) return;
    const w = card.querySelector('.world'), h = card.querySelector('h1'), s = card.querySelector('.sub');
    if (w) w.textContent = 'WORLD ' + L.id;
    if (h) h.textContent = L.title;
    if (s) s.textContent = L.cardText || L.subtitle;
    document.title = 'Kinan vs. Worlds ' + L.id + ': ' + L.title;
  } catch (e) { /* no DOM (tools): ignore */ }
}

// Make a lift look like a balloon raft: a bunch of balloons rides along with the moving platform nearest (x,z).
export function balloonRaft(b, x, y, z, seed = 3) {
  const cols = ['#e8473c', '#ffd23f', '#3f8fe8', '#ff5fa2', '#5cc23a', '#9b6cff'];
  const g = new THREE.Group(), r = rng(seed), items = [];
  for (let i = 0; i < 7; i++) {
    const bx = (r() - 0.5) * 2.4, bz = (r() - 0.5) * 2.4, by = 6.5 + r() * 2;
    const bal = dSphere(g, bx, by, bz, 0.95, null, { mat: toyMat(cols[i % cols.length], 0.25, { envMapIntensity: 1 }), s: [1, 1.18, 1], seg: 16 });
    items.push([bal, by, r() * 6]);
    for (const [cx, cz] of [[-1.9, -1.9], [1.9, 1.9]]) {
      const dir = new THREE.Vector3(bx - cx, by - 0.95, bz - cz), len = dir.length();
      const str = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, len, 4), toyMat('#ffffff', 0.6));
      str.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      str.position.set((bx + cx) / 2, 0.2 + (by - 0.95) / 2, (bz + cz) / 2); g.add(str);
    }
  }
  b.game.scene.add(g);
  let lift = null;
  b.game.onUpdate((t) => {
    if (!lift) {
      const ms = b.game.entities && b.game.entities.movers; if (!ms) return;
      let best = 1e9;
      for (const m of ms) if (m.kind === 'lift') { const d = Math.hypot(m.g.position.x - x, m.g.position.z - z) + Math.abs(m.g.position.y - y); if (d < best) { best = d; lift = m; } }
      if (!lift) return;
    }
    g.position.copy(lift.g.position);
    for (const [bal, by, ph] of items) { bal.position.y = by + Math.sin(t * 1.6 + ph) * 0.18; }
  });
  return g;
}

// Prop library, part 1: shared helpers + indoor furniture and toys.
// A prop is a function (b, o) called with the builder frame already moved/turned to the prop's spot,
// so it draws in its own local space (front = +z). Scale: Kinan is ~2.1 tall, furniture is toy-giant.
// Level files place props as ['name', x, y, z, yawDegrees, {options}].
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { roundedBoxGeo, roundCylGeo } from './build.js';
import { rng } from './util.js';
import { YARD } from './props-yard.js';

// ---------- dynamic (animated) mesh helpers: real meshes with shared materials
const matCache = new Map();
export function toyMat(color, rough = 0.6, opts = {}) {
  const key = color + '|' + rough + '|' + JSON.stringify(opts);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: 0, envMapIntensity: 0.55 }, opts)));
  return matCache.get(key);
}
export function dBox(parent, x, y, z, w, h, d, color, o = {}) {
  const m = new THREE.Mesh(roundedBoxGeo(w, h, d, o.r !== undefined ? o.r : Math.min(0.2, Math.min(w, h, d) * 0.2), 2), o.mat || toyMat(color, o.rough));
  m.position.set(x, y + h / 2, z); parent.add(m); return m;
}
export function dSphere(parent, x, y, z, r, color, o = {}) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, o.seg || 16, (o.seg || 16) >> 1), o.mat || toyMat(color, o.rough));
  m.position.set(x, y, z); if (o.s) m.scale.set(...o.s); parent.add(m); return m;
}
export function dCyl(parent, x, y, z, r, h, color, o = {}) {
  const m = new THREE.Mesh(roundCylGeo(r * (o.taper || 1), r, h, Math.min(0.1, r * 0.25), o.seg || 18), o.mat || toyMat(color, o.rough));
  m.position.set(x, y + h / 2, z); parent.add(m); return m;
}
// Merge the plain-coloured meshes under a group into ONE vertex-coloured mesh (fewer draw calls).
// deep=true also swallows meshes inside nested groups (only use when those groups never animate).
// Meshes with textures or non-standard materials (glow etc.) are left alone.
const bakedMats = new Map();
export function bake(group, deep = true) {
  group.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(group.matrixWorld).invert();
  const take = [];
  const visit = (o) => {
    for (const c of o.children) {
      if (c.isMesh && c.material && c.material.isMeshStandardMaterial && !c.material.map && !c.material.vertexColors && !c.material.transparent) take.push(c);
      else if (deep && !c.isMesh && c.children.length) visit(c);
    }
  };
  visit(group);
  if (take.length < 2) return group;
  const byRough = new Map();
  for (const m of take) {
    const r = Math.round((m.material.roughness ?? 0.6) * 4) / 4;
    if (!byRough.has(r)) byRough.set(r, []);
    byRough.get(r).push(m);
  }
  const tmp = new THREE.Matrix4();
  for (const [rough, list] of byRough) {
    const geos = list.map((m) => {
      let g = m.geometry.clone();
      for (const n of Object.keys(g.attributes)) if (n !== 'position' && n !== 'normal') g.deleteAttribute(n);
      if (!g.index) { const idx = []; for (let i = 0; i < g.attributes.position.count; i++) idx.push(i); g.setIndex(idx); }
      tmp.multiplyMatrices(inv, m.matrixWorld);
      g.applyMatrix4(tmp);
      const c = m.material.color, n = g.attributes.position.count, col = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      return g;
    });
    const merged = mergeGeometries(geos, false);
    if (!merged) continue;
    if (!bakedMats.has(rough)) bakedMats.set(rough, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: rough, metalness: 0, envMapIntensity: 0.55 }));
    const mesh = new THREE.Mesh(merged, bakedMats.get(rough));
    group.add(mesh);
    for (const m of list) m.parent.remove(m);
  }
  return group;
}

// Put a dynamic group at the builder's current frame (+ local offset).
export function placeGroup(b, g, x = 0, y = 0, z = 0, yawDeg = 0) {
  const [wx, wy, wz] = b.toWorld(x, y, z);
  g.position.set(wx, wy, wz); g.rotation.y = b.f.yaw + yawDeg * Math.PI / 180;
  b.game.scene.add(g);
  return g;
}

// ---------- toy brick (2x4 style) with studs
export function brick(b, x, y, z, nx, nz, color, o = {}) {
  const u = o.u || 1.2, h = (o.h || 1.2) * u;
  const w = nx * u, d = nz * u;
  b.box(x, y, z, w - 0.04, h, d - 0.04, color, Object.assign({ r: 0.12 * u, mat: 'gloss' }, o));
  if (o.studs !== false) for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++)
    b.cyl(x - w / 2 + u * (i + 0.5), y + h - 0.02, z - d / 2 + u * (j + 0.5), 0.34 * u, 0.22 * u, color, { mat: 'gloss', seg: 12, bevel: 0.05 * u });
  return y + h;
}
const BRICK_COLS = ['#e8473c', '#3f8fe8', '#ffd23f', '#5cc23a', '#ff9a3c', '#ffffff', '#9b6cff', '#ff8fb8'];

export const PROPS = {
  // ======================= BEDROOM
  bed(b, o) {
    const W = o.w || 7, L = o.l || 11;
    b.box(0, 0, 0, W, 1.3, L, 'woodDark', { r: 0.25 });
    // mattress + blanket are a live group so they can wobble when bounced on
    const g = new THREE.Group();
    dBox(g, 0, 0, 0, W - 0.5, 1.0, L - 0.6, '#ffffff', { r: 0.4 });
    dBox(g, 0, 0.55, 1.2, W - 0.2, 0.6, L * 0.62, o.blanket || '#3f63a8', { r: 0.3 });
    const starM = toyMat('#f6c445', 0.5);
    for (const [sx, sz] of [[-1.6, -0.2], [1.5, 1.8], [-1.2, 3.6], [1.7, 4.4], [0.1, 2.4]]) dSphere(g, sx, 1.16, sz + 0.6, 0.38, null, { mat: starM, s: [1, 0.25, 1] });
    dBox(g, 0, 0.9, -L / 2 + 1.7, W * 0.62, 0.8, 2.2, '#fffaf0', { r: 0.4 });
    bake(g);
    const grp = placeGroup(b, g, 0, 1.3, 0);
    const base = grp.position.y;
    let wob = 0;
    b.game.onUpdate((t, dt) => { if (wob > 0) { wob = Math.max(0, wob - dt); const k = Math.sin(wob * 30) * wob * 0.5; grp.scale.set(1 + k * 0.15, 1 - k, 1 + k * 0.15); grp.position.y = base; } });
    b.box(0, 1.3, 0, W - 0.5, 1.0, L - 0.6, null, { vis: false, phys: { bounce: o.bounce || 21, onBounce: () => { wob = 0.5; } } });
    // headboard & footboard
    b.box(0, 0, -L / 2 - 0.1, W + 0.4, 4.6, 0.7, 'wood', { r: 0.3, cam: true });
    b.cyl(0, 4.3, -L / 2 - 0.1, 1.2, 0.6, 'gold', { rx: 90, col: false });
    b.box(0, 0, L / 2 + 0.1, W + 0.4, 2.9, 0.6, 'wood', { r: 0.25 });
    for (const sx of [-1, 1]) { b.cyl(sx * (W / 2 + 0.05), 4.6, -L / 2 - 0.1, 0.45, 0.5, 'woodLight', { col: false }); b.cyl(sx * (W / 2 + 0.05), 2.9, L / 2 + 0.1, 0.4, 0.45, 'woodLight', { col: false }); }
  },
  desk(b, o) {
    const W = o.w || 7.5, D = 3.6, H = 3.2;
    b.box(0, H - 0.45, 0, W, 0.45, D, 'woodLight', { r: 0.15 });
    for (const sx of [-1]) for (const sz of [-1, 1]) b.box(sx * (W / 2 - 0.4), 0, sz * (D / 2 - 0.4), 0.55, H - 0.45, 0.55, 'wood', { col: false });
    b.box(-W / 2 + 0.4, 0, 0, 0.55, H - 0.45, D - 0.3, null, { vis: false });
    b.box(W / 2 - 1.3, 0, 0, 2.4, H - 0.45, D - 0.2, '#7ec8ff', { r: 0.15, cam: true });
    for (let i = 0; i < 3; i++) { b.box(W / 2 - 1.3, 0.25 + i * 0.85, D / 2 - 0.05, 2.0, 0.6, 0.2, '#a9d8ff', { col: false, r: 0.08 }); b.sphere(W / 2 - 1.3, 0.55 + i * 0.85, D / 2 + 0.1, 0.13, 'gold', { col: false }); }
    // computer monitor with glowing screen
    b.box(-0.6, H, -0.9, 0.9, 0.5, 0.9, '#2a2a33', { col: false });
    b.box(-0.6, H + 0.4, -1.0, 3.6, 2.3, 0.35, '#2a2a33', { r: 0.15 });
    b.box(-0.6, H + 0.55, -0.8, 3.2, 1.95, 0.05, '#8fe3ff', { mat: 'glow', col: false, r: 0 });
    // lamp + pencils + books
    b.cyl(2.4, H, -0.9, 0.5, 0.2, '#ff5fa2', { col: false });
    b.box(2.4, H + 0.2, -0.9, 0.18, 1.6, 0.18, '#ff5fa2', { col: false, r: 0.06 });
    b.cone(2.4, H + 1.6, -0.6, 0.65, 0.9, '#ff5fa2', { col: false, rx: 25 });
    b.cyl(-2.8, H, 0.6, 0.35, 0.7, '#5cc23a', { col: false });
    for (let i = 0; i < 4; i++) b.box(-2.8 + (i - 1.5) * 0.12, H + 0.6, 0.6, 0.08, 0.6, 0.08, BRICK_COLS[i], { col: false, r: 0.03 });
    b.box(1.1, H, 0.7, 1.8, 0.35, 1.3, '#e8473c', { col: false }); b.box(1.1, H + 0.35, 0.7, 1.6, 0.3, 1.2, '#3f8fe8', { col: false });
  },
  chair(b, o) {
    const c = o.color || 'kinanRed';
    b.box(0, 1.5, 0, 2.6, 0.4, 2.6, c, { r: 0.15 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(sx * 1.05, 0, sz * 1.05, 0.35, 1.5, 0.35, 'woodDark', { col: false });
    b.box(0, 0, 0, 2.3, 1.5, 2.3, null, { vis: false });
    b.box(0, 1.9, -1.15, 2.6, 2.6, 0.35, c, { r: 0.15 });
  },
  bookshelf(b, o) {
    const W = o.w || 6, H = o.h || 7.3, D = o.d || 2.6, n = o.n || 4;
    const col = o.color || 'woodLight';
    const climb = !!o.climb;   // climb:true = Kinan can climb the shelves
    b.box(-W / 2 + 0.2, 0, 0, 0.4, H, D, col, { r: 0.12, cam: true, climb });
    b.box(W / 2 - 0.2, 0, 0, 0.4, H, D, col, { r: 0.12, cam: true, climb });
    b.box(0, 0, -D / 2 + 0.15, W, H, 0.3, 'woodDark', { r: 0.08, cam: true, climb });
    const r = rng(o.seed || 3);
    for (let i = 0; i <= n; i++) {
      const y = i === 0 ? 0 : (H / n) * i - 0.35;
      b.box(0, y, 0, W - 0.1, 0.35, D, col, { r: 0.1, climb });
      if (i < n) {
        let x = -W / 2 + 0.6;
        const top = (H / n) * (i + 1) - 0.35 - y - 0.45;
        while (x < W / 2 - 0.8) {
          const bw = 0.35 + r() * 0.35, bh = Math.min(top, 1.0 + r() * 0.6);
          if (r() < 0.12) { x += 0.5; continue; }
          b.box(x + bw / 2, y + 0.35, -D / 2 + 0.95, bw, bh, 1.25, BRICK_COLS[(r() * 8) | 0], { col: false, r: 0.05 });
          x += bw + 0.04;
        }
      }
    }
  },
  wardrobe(b, o) {
    const W = o.w || 6, H = o.h || 7, D = 3;
    b.box(0, 0, 0, W, H, D, o.color || '#f7f3ea', { r: 0.3, cam: true });
    b.box(0, 0.4, D / 2, 0.08, H - 0.8, 0.1, '#c9c2b0', { col: false, r: 0 });
    for (const sx of [-1, 1]) b.sphere(sx * 0.45, H * 0.5, D / 2 + 0.1, 0.18, 'gold', { col: false });
    b.box(0, H - 0.05, 0, W + 0.3, 0.3, D + 0.3, 'woodLight', { col: false, r: 0.12 });
  },
  wallShelf(b, o) {
    const W = o.w || 5, D = o.d || 2;
    b.box(0, 0, 0, W, 0.35, D, o.color || 'woodLight', { r: 0.1 });
    for (const sx of [-1, 1]) b.box(sx * (W / 2 - 0.5), -0.9, -D / 2 + 0.2, 0.25, 0.9, 0.4, 'gold', { col: false });
    if (o.trophy) { b.cyl(W / 2 - 1, 0.35, 0, 0.4, 0.3, 'gold', { mat: 'gloss' }); b.cyl(W / 2 - 1, 0.65, 0, 0.18, 0.5, 'gold', { mat: 'gloss' }); b.cone(W / 2 - 1, 1.15, 0, 0.45, 0.6, 'gold', { mat: 'gloss', rx: 180 }); }
  },
  toybox(b, o) {
    b.box(0, 0, 0, 4.2, 2.4, 3, o.color || '#ff9a3c', { r: 0.25 });
    b.box(0, 2.3, 0, 4.4, 0.45, 3.2, '#ffd23f', { r: 0.2 });
    b.sphere(0, 1.4, 1.55, 0.5, '#e8473c', { s: [1, 1, 0.4] });
  },
  beanbag(b, o) {
    b.sphere(0, 0.9, 0, 1.9, o.color || '#9b6cff', { s: [1, 0.55, 1], seg: 20 });
    b.cyl(0, 0, 0, 1.8, 1.55, null, { vis: false, col: true, phys: { bounce: 13 } });
  },
  brickStack(b, o) {
    // a little tower of toy bricks; o.n bricks, o.u size
    const r = rng(o.seed || 9);
    let y = 0;
    const u = o.u || 1.2;
    for (let i = 0; i < (o.n || 3); i++) {
      const nx = o.nx || (r() < 0.5 ? 2 : 3), nz = o.nz || 2;
      const ox = o.wobble === false ? 0 : (r() - 0.5) * u * 0.6;
      y = brick(b, ox, y, 0, nx, nz, (o.colors || BRICK_COLS)[(r() * (o.colors || BRICK_COLS).length) | 0], { u });
    }
  },
  brickCastle(b, o) {
    // a small brick castle Kinan built: walls you can climb, towers with flag
    const u = 1.0;
    const cols = o.colors || ['#7ec8ff', '#ffffff', '#a9d8ff'];
    for (let ix = -3; ix <= 3; ix++) for (const iz of [-2, 2]) for (let k = 0; k < 2; k++) brick(b, ix * 2 * u, k * 1.2 * u, iz * u, 2, 1, cols[(ix + k + 9) % 3], { u, studs: k === 1 });
    for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) brick(b, sx * 7 * u, k * 1.2 * u, 0, 2, 2, k === 3 ? '#e8473c' : cols[k % 3], { u });
    for (const sx of [-1, 1]) { b.box(sx * 7, 4.8, 0, 0.12, 2, 0.12, 'white', { col: false, r: 0 }); b.box(sx * 7 + 0.5, 5.9, 0, 0.9, 0.6, 0.06, 'gold', { col: false, r: 0 }); }
  },
  poster(b, o) {
    b.box(0, -o.h / 2 - 0.1, -0.05, o.w + 0.25, o.h + 0.2, 0.1, o.frame || '#ffffff', { col: false, r: 0.04, cast: false });
    b.texPanel(o.tex, 0, 0, 0.03, o.w, o.h, 0);
  },
  photo(b, o) {
    const w = o.w || 2.4, h = o.h || 1.9;
    b.box(0, -h / 2 - 0.15, -0.06, w + 0.3, h + 0.3, 0.14, o.frame || '#8a5a34', { col: false, r: 0.05, cast: false });
    b.texPanel(o.tex, 0, 0, 0.03, w, h, 0);
  },
  rug(b, o) { b.texRect(o.tex, 0, 0, o.w, o.d, 0.02); },
  lampFloor(b, o) {
    b.cyl(0, 0, 0, 0.9, 0.3, '#5f6675', { col: true });
    b.box(0, 0.3, 0, 0.25, 6.2, 0.25, '#5f6675', { col: false, r: 0.08 });
    b.cyl(0, 6.4, 0, 1.4, 1.5, o.color || '#ffd23f', { taper: 0.6, col: false });
    b.sphere(0, 6.4, 0, 0.5, '#fff6c8', { mat: 'glow', col: false });
    b.cyl(0, 0.3, 0, 0.3, 6.2, null, { vis: false, col: true });
  },
  plant(b, o) {
    const s = o.s || 1;
    b.cyl(0, 0, 0, 1.0 * s, 1.6 * s, o.pot || '#e8734a', { taper: 1.2, col: true });
    b.cyl(0, 1.45 * s, 0, 0.95 * s, 0.15 * s, '#6b4226', { col: false });
    const r = rng(o.seed || 5);
    for (let i = 0; i < 7; i++) { const a = r() * 6.28, d = r() * 0.7 * s; b.sphere(Math.cos(a) * d, (1.9 + r() * 1.6) * s, Math.sin(a) * d, (0.55 + r() * 0.35) * s, i % 2 ? 'leaf' : 'leaf2', { col: false, s: [1, 1.3, 1] }); }
  },
  laundry(b, o) {
    b.cyl(0, 0, 0, 1.4, 1.8, '#f7f3ea', { taper: 1.15, col: true, phys: {} });
    b.torus(0, 1.8, 0, 1.55, 0.13, '#cfd6e2');
    const cols = ['#c2414f', '#3f63a8', '#ffd23f', '#ffffff', '#5cc23a'];
    for (let i = 0; i < 6; i++) b.sphere(Math.cos(i * 1.1) * 0.7, 1.9 + (i % 2) * 0.3, Math.sin(i * 1.1) * 0.7, 0.6, cols[i % 5], { col: false, s: [1, 0.6, 1] });
  },
  // ======================= LIVING ROOM
  couch(b, o) {
    const W = o.w || 15, D = 6, c = o.color || '#2fb5a8', c2 = o.color2 || '#27a094';
    b.box(0, 0, 0, W, 1.2, D, c2, { r: 0.4, cam: true });
    const n = o.n || 3, cw = (W - 2.6) / n;
    for (let i = 0; i < n; i++) b.box(-W / 2 + 1.3 + cw * (i + 0.5), 1.2, 0.6, cw - 0.12, 1.1, D - 1.8, c, { r: 0.5 });
    b.box(0, 1.2, -D / 2 + 0.85, W - 2.4, 3.4, 1.7, c, { r: 0.6, cam: true });
    for (let i = 0; i < n; i++) b.box(-W / 2 + 1.3 + cw * (i + 0.5), 2.2, -D / 2 + 1.9, cw - 0.3, 2.4, 1.0, c, { r: 0.45, col: false });
    for (const sx of [-1, 1]) b.box(sx * (W / 2 - 0.65), 0, 0, 1.3, 3.4, D, c2, { r: 0.55, cam: true });
    // throw pillows
    b.box(-W / 2 + 2.4, 2.3, -0.9, 2.0, 1.8, 0.7, '#ffd23f', { r: 0.35, col: false, yaw: 12 });
    b.box(W / 2 - 2.4, 2.3, -0.9, 2.0, 1.8, 0.7, '#ff8fb8', { r: 0.35, col: false, yaw: -12 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.cyl(sx * (W / 2 - 0.6), -0.0, sz * (D / 2 - 0.6), 0.25, 0.3, 'woodDark', { col: false });
  },
  armchair(b, o) {
    const c = o.color || '#ff9a3c';
    b.box(0, 0, 0, 5.4, 1.2, 5, c, { r: 0.4 });
    b.box(0, 1.2, 0.5, 3.3, 1.0, 3.6, '#ffb565', { r: 0.45 });
    b.box(0, 1.2, -1.9, 5.4, 3.6, 1.3, c, { r: 0.55, cam: true });
    for (const sx of [-1, 1]) b.box(sx * 2.25, 0, 0, 1.0, 2.8, 5, c, { r: 0.45, cam: true });
  },
  coffeeTable(b, o) {
    b.box(0, 1.5, 0, 6.5, 0.4, 3.6, 'woodLight', { r: 0.15 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(sx * 2.8, 0, sz * 1.4, 0.4, 1.5, 0.4, 'wood', { col: false });
    b.box(0, 0, 0, 6.2, 1.5, 3.2, null, { vis: false });
    b.cyl(-1.6, 1.9, 0.2, 1.0, 0.45, '#ffffff', { col: false, taper: 1.3 });
    b.sphere(-1.9, 2.5, 0.1, 0.38, '#e8473c', { col: false }); b.sphere(-1.3, 2.5, 0.4, 0.36, '#ffd23f', { col: false }); b.sphere(-1.6, 2.6, -0.2, 0.34, '#ff9a3c', { col: false });
    b.box(1.6, 1.9, 0, 1.8, 0.3, 1.2, '#3f8fe8', { col: false }); b.box(1.7, 2.2, 0.05, 1.6, 0.28, 1.1, '#ffd23f', { col: false });
    b.box(0.5, 1.9, 1.1, 0.5, 0.18, 1.1, '#2a2a33', { col: false, yaw: 20 });
  },
  tvStand(b, o) {
    b.box(0, 0, 0, 10, 2.4, 2.6, o.color || '#ffffff', { r: 0.2, cam: true });
    for (const sx of [-1, 0, 1]) b.box(sx * 3.2, 0.4, 1.32, 2.9, 1.5, 0.1, '#e4e8f0', { col: false, r: 0.05 });
    b.box(0, 2.4, -0.2, 2.2, 0.35, 1.2, '#2a2a33', { col: false });
    b.box(0, 2.75, -0.35, 0.5, 0.6, 0.4, '#2a2a33', { col: false });
    b.box(0, 3.0, -0.45, 8.4, 4.6, 0.45, '#2a2a33', { r: 0.18, cam: true });
    b.texPanel('tv', 0, 5.3, -0.2, 7.8, 4.05, 0);
    // game console + controller
    b.box(-3.3, 2.4, 0.2, 1.6, 0.5, 1.2, '#f7f3ea', { col: false });
    b.box(3.4, 2.4, 0.4, 1.1, 0.3, 0.7, '#e8473c', { col: false });
  },
  // ======================= KITCHEN
  counter(b, o) {
    const W = o.w || 10, D = 3.2, H = 3.4, c = o.color || '#7fd1c8';
    b.box(0, 0, 0, W, H - 0.35, D - 0.2, c, { r: 0.15, cam: true });
    b.box(0, 0, 0.2, W - 0.2, 0.4, D - 0.5, '#2a2a33', { col: false, r: 0.05 });
    b.box(0, H - 0.4, 0.05, W + 0.2, 0.42, D + 0.15, o.top || '#f7f3ea', { r: 0.12 });
    const n = Math.max(1, Math.round(W / 3.2));
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + (W / n) * (i + 0.5);
      b.box(x, 0.55, D / 2 - 0.08, W / n - 0.3, H - 1.25, 0.12, '#a3e3dc', { col: false, r: 0.08 });
      b.box(x + (W / n) * 0.3, H - 1.5, D / 2 + 0.05, 0.16, 0.6, 0.16, '#cfd6e2', { col: false, r: 0.05 });
    }
    if (o.sink) {
      b.box(o.sink, H - 0.05, 0.1, 3.0, 0.1, 2.0, '#9aa3b2', { col: false, r: 0.1, mat: 'gloss' });
      b.box(o.sink, H, -1.2, 0.35, 1.6, 0.35, '#cfd6e2', { col: false, mat: 'gloss', r: 0.1 });
      b.box(o.sink, H + 1.45, -0.7, 0.3, 0.3, 1.2, '#cfd6e2', { col: false, mat: 'gloss', r: 0.1 });
    }
    if (o.stove !== undefined) {
      b.box(o.stove, H, 0, 3.6, 0.12, 2.6, '#2a2a33', { col: false, r: 0.05 });
      for (const [sx, sz] of [[-0.85, -0.6], [0.85, -0.6], [-0.85, 0.6], [0.85, 0.6]]) b.torus(o.stove + sx, H + 0.15, sz, 0.42, 0.07, '#e8473c');
      b.box(o.stove, 0.6, D / 2 - 0.02, 3.2, 1.8, 0.14, '#2a2a33', { col: false, r: 0.06 });
      b.box(o.stove, 0.85, D / 2 + 0.05, 2.4, 1.1, 0.06, '#ffb565', { col: false, r: 0, mat: 'glow' });
    }
    // kitchen stuff on top
    if (o.stuff) {
      b.box(o.stuff, H, -0.5, 1.6, 1.3, 1.1, '#e8473c', { col: false, r: 0.3 });   // toaster
      b.box(o.stuff - 0.3, H + 1.3, -0.5, 0.5, 0.25, 0.9, '#2a2a33', { col: false, r: 0.05 });
      b.cyl(o.stuff + 2.2, H, -0.6, 0.6, 1.5, '#ffd23f', { col: false });     // cookie jar
      b.sphere(o.stuff + 2.2, H + 1.6, -0.6, 0.3, '#ff9a3c', { col: false });
    }
  },
  upperCab(b, o) {
    const W = o.w || 10, H = o.h || 2.4, D = 2.0;
    b.box(0, 0, 0, W, H, D, o.color || '#fffaf0', { r: 0.15 });
    const n = Math.max(1, Math.round(W / 2.6));
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + (W / n) * (i + 0.5);
      b.box(x, 0.2, D / 2 - 0.05, W / n - 0.3, H - 0.4, 0.12, '#f2ead6', { col: false, r: 0.06 });
      b.sphere(x + (W / n) * 0.3, 0.45, D / 2 + 0.1, 0.13, 'gold', { col: false });
    }
  },
  fridge(b, o) {
    const W = 4.6, H = o.h || 7.4, D = 3.6, c = o.color || '#dff6f0';
    b.box(0, 0, 0, W, H, D, c, { r: 0.45, mat: 'gloss', cam: true });
    b.box(0, H * 0.62, D / 2 + 0.02, W - 0.3, 0.12, 0.1, '#b9d9d0', { col: false, r: 0 });
    b.box(W / 2 - 0.7, H * 0.68, D / 2 + 0.2, 0.25, 1.6, 0.3, '#cfd6e2', { col: false, mat: 'gloss', r: 0.1 });
    b.box(W / 2 - 0.7, H * 0.25, D / 2 + 0.2, 0.25, 2.2, 0.3, '#cfd6e2', { col: false, mat: 'gloss', r: 0.1 });
    // magnets + a drawing of Glitchy
    const mags = ['#e8473c', '#ffd23f', '#3f8fe8', '#5cc23a'];
    mags.forEach((m, i) => b.sphere(-1.2 + i * 0.7, H * 0.85, D / 2 + 0.08, 0.2, m, { col: false, s: [1, 1, 0.4] }));
    b.texPanel('posterGlitchy', -0.4, H * 0.38, D / 2 + 0.04, 1.8, 1.8, 0);
  },
  table(b, o) {
    const W = o.w || 9, D = o.d || 5.5, H = 3.0;
    b.box(0, H - 0.4, 0, W, 0.4, D, o.color || 'woodLight', { r: 0.15 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(sx * (W / 2 - 0.5), 0, sz * (D / 2 - 0.5), 0.5, H - 0.4, 0.5, 'wood', { col: true });
    if (o.cake !== false) {
      // a birthday cake on the table
      b.cyl(0, H, 0, 1.5, 0.12, '#ffffff', { col: false });
      b.cyl(0, H + 0.12, 0, 1.25, 0.9, '#ff8fb8', { col: false });
      b.cyl(0, H + 1.02, 0, 0.85, 0.7, '#fff2c9', { col: false });
      for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; b.box(Math.cos(a) * 0.5, H + 1.7, Math.sin(a) * 0.5, 0.12, 0.5, 0.12, BRICK_COLS[i], { col: false, r: 0.04 }); b.sphere(Math.cos(a) * 0.5, H + 2.32, Math.sin(a) * 0.5, 0.1, '#ffcf4a', { mat: 'glow', col: false, s: [1, 1.6, 1] }); }
    }
  },
  island(b, o) {
    PROPS.counter(b, Object.assign({ w: o.w || 8, color: o.color || '#ffd23f' }, o));
  },
  // ======================= BASEMENT
  brickTower(b, o) {
    // a chunky climbable tower of big bricks (brick city)
    const u = o.u || 1.5, n = o.n || 4, nx = o.nx || 2, nz = o.nz || 2;
    const r = rng(o.seed || 17);
    let y = 0;
    for (let i = 0; i < n; i++) y = brick(b, 0, y, 0, nx, nz, (o.colors || BRICK_COLS)[(r() * (o.colors || BRICK_COLS).length) | 0], { u, studs: i === n - 1 || o.allStuds });
    if (o.windows) for (let i = 0; i < n; i++) for (const sx of [-1, 1]) b.box(sx * nx * u * 0.25, i * 1.2 * u + 0.35 * u, nz * u / 2, nx * u * 0.3, 0.5 * u, 0.08, '#fff6b0', { col: false, r: 0.05, mat: 'glow' });
  },
  brickHouse(b, o) {
    // brick building with a pointy brick roof (brick city)
    const u = o.u || 1.5, n = o.n || 3, nx = o.nx || 4, nz = o.nz || 3, c = o.color || '#ffd23f';
    let y = 0;
    for (let i = 0; i < n; i++) y = brick(b, 0, y, 0, nx, nz, i % 2 ? c : (o.color2 || c), { u, studs: false });
    for (let i = 0; i < n; i++) for (let k = 0; k < nx - 1; k++) b.box(-nx * u / 2 + u * (k + 1), i * 1.2 * u + 0.4 * u, nz * u / 2 + 0.02, u * 0.5, u * 0.55, 0.1, '#7ec8ff', { col: false, r: 0.04 });
    let w = nx;
    while (w > 0) { y = brick(b, 0, y, 0, w, nz, o.roof || '#e8473c', { u, studs: w <= 2 }); w -= 2; }
  },
  washer(b, o) {
    b.box(0, 0, 0, 4.2, 4.4, 4, '#f7f3ea', { r: 0.35, cam: true });
    b.cyl(0, 2.0, 2.0, 1.25, 0.25, '#cfd6e2', { rx: 90, col: false });
    b.cyl(0, 2.0, 2.12, 0.95, 0.12, '#7ec8ff', { rx: 90, col: false, mat: 'gloss' });
    b.box(0, 3.7, 1.98, 3.4, 0.5, 0.1, '#cfd6e2', { col: false, r: 0.04 });
    b.sphere(1.3, 3.95, 2.05, 0.15, o.dot || '#5cc23a', { col: false, mat: 'glow' });
  },
  boxes(b, o) {
    const r = rng(o.seed || 31);
    let y = 0;
    for (let i = 0; i < (o.n || 3); i++) { const s = 2.6 - i * 0.4; b.box((r() - 0.5) * 0.6, y, (r() - 0.5) * 0.6, s, s * 0.8, s, '#d9a56b', { r: 0.12, yaw: (r() - 0.5) * 20 }); b.box(0, y + s * 0.8 - 0.02, 0, s * 0.3, 0.05, s + 0.02, '#c08850', { col: false, r: 0 }); y += s * 0.8; }
  },
  ballPit(b, o) {
    const W = o.w || 7, D = o.d || 9, H = o.h || 1.6;
    for (const [x, z, w, d] of [[0, -D / 2, W, 0.6], [0, D / 2, W, 0.6], [-W / 2, 0, 0.6, D], [W / 2, 0, 0.6, D]]) b.box(x, 0, z, w + 0.6, H + 0.5, d + 0.01, '#ff5fa2', { r: 0.28 });
    b.box(0, 0, 0, W - 0.6, H, D - 0.6, null, { vis: false, phys: { bounce: o.bounce || 15 } });
    b.texRect('ballpit', 0, 0, W - 0.5, D - 0.5, H + 0.01, 2);
    const r = rng(7), cols = ['#ff5fa2', '#ffd23f', '#3f8fe8', '#5cc23a', '#ff9a3c', '#9b6cff'];
    for (let i = 0; i < 46; i++) b.sphere((r() - 0.5) * (W - 1.4), H + 0.1, (r() - 0.5) * (D - 1.4), 0.42, cols[i % 6], { col: false, mat: 'gloss', seg: 10, ao: false });
  },
  // swaying curtains for a window. Place at the window centre-top on the inside wall face, facing into the room.
  // {w: window width, h: curtain length, color, color2}
  curtains(b, o) {
    const w = o.w || 4, h = o.h || 4.5, c = o.color || '#ff8fb8', c2 = o.color2 || '#ffffff';
    b.box(0, 0.15, 0.35, w + 2.6, 0.22, 0.22, '#c98b52', { col: false, r: 0.1, cast: false });   // rod
    for (const sx of [-1, 1]) b.sphere(sx * (w / 2 + 1.35), 0.26, 0.35, 0.22, 'gold', { col: false });
    for (const sx of [-1, 1]) {
      const g = new THREE.Group();
      for (let k = 0; k < 3; k++) dBox(g, sx * (k * 0.42 - 0.42), -h, (k % 2) * 0.12, 0.5, h, 0.14, k === 1 ? c2 : c, { r: 0.07 });
      dBox(g, 0, -h * 0.55, 0.22, 1.5, 0.22, 0.2, c2, { r: 0.08 });                              // tie-back
      bake(g);
      const grp = placeGroup(b, g, sx * (w / 2 + 0.75), 0.15, 0.45);
      const ph = Math.random() * 6;
      b.game.onUpdate((t) => { grp.rotation.x = Math.sin(t * 1.25 + ph) * 0.05 - 0.02; grp.rotation.z = Math.sin(t * 0.8 + ph) * 0.025; });
    }
  },
  // plain rounded block (stools, carts, platforms): {w,h,d,color,r}
  block(b, o) { b.box(0, 0, 0, o.w || 2, o.h || 2, o.d || 2, o.color || 'white', { r: o.r, mat: o.mat, cam: o.cam, phys: o.phys }); },
  sign(b, o) {
    const w = o.w || 5;
    const lines = o.text.split('|').length;
    const h = w * Math.max(160, 70 + lines * 74) / 512;
    const y = o.wall ? 0 : (o.postH || 2.6);
    if (!o.wall) { b.box(0, 0, -0.1, 0.4, y + h * 0.5, 0.4, 'woodDark', { col: true, r: 0.1 }); }
    b.box(0, y, -0.15, w + 0.1, h + 0.1, 0.25, '#8a5a34', { col: !o.wall, r: 0.1 });
    b.texPanel('sign:' + o.text, 0, y + h / 2 + 0.05, 0.0, w, h, 0);
    if (o.back) b.texPanel('sign:' + o.text, 0, y + h / 2 + 0.05, -0.3, w, h, 180);
  },
};

// merge in the yard props
Object.assign(PROPS, YARD);

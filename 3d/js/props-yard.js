// Prop library, part 2: yard, garden and street props (used by 12-1 and reusable for every outdoor World 12 level).
import * as THREE from 'three';
import { rng } from './util.js';
import { toyMat, dBox, dSphere, dCyl, placeGroup, bake } from './props.js';

export const YARD = {
  tree(b, o) {
    // chunky round tree (like the concept renders): trunk + clustered leaf balls
    const s = o.s || 1, r = rng(o.seed || 1);
    b.cyl(0, 0, 0, 0.75 * s, 5.5 * s, o.trunk || '#8a5a34', { taper: 0.75, col: true, cr: 0.8 * s });
    const leaf = o.leaf || ['#4cb043', '#5cc23a', '#7fd14d'];
    const top = 5.2 * s;
    b.sphere(0, top + 2.2 * s, 0, 3.2 * s, leaf[0], { seg: 18 });
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28 + r(); b.sphere(Math.cos(a) * 2.6 * s, top + (1.2 + r() * 1.6) * s, Math.sin(a) * 2.6 * s, (1.7 + r() * 0.6) * s, leaf[i % leaf.length], { seg: 14 }); }
    b.sphere(0.4 * s, top + 4.4 * s, 0.2 * s, 2.0 * s, leaf[2 % leaf.length], { seg: 14 });
  },
  pine(b, o) {
    const s = o.s || 1;
    b.cyl(0, 0, 0, 0.5 * s, 2 * s, '#8a5a34', { col: true });
    for (let i = 0; i < 3; i++) b.cone(0, (1.6 + i * 2.0) * s, 0, (3.0 - i * 0.75) * s, 3.4 * s, i % 2 ? '#3f9e44' : '#2f8a3a', { seg: 10 });
  },
  bush(b, o) {
    const s = o.s || 1, r = rng(o.seed || 4);
    for (let i = 0; i < 4; i++) b.sphere((r() - 0.5) * 2 * s, (0.9 + r() * 0.4) * s, (r() - 0.5) * 1.4 * s, (1.0 + r() * 0.4) * s, i % 2 ? '#5cc23a' : '#4cb043', { seg: 12 });
    if (o.flowers) for (let i = 0; i < 5; i++) b.sphere((r() - 0.5) * 2.4 * s, (1.4 + r() * 0.8) * s, (r() - 0.5) * 1.8 * s, 0.22 * s, o.flowers, { col: false, seg: 8 });
    b.cyl(0, 0, 0, 1.4 * s, 1.6 * s, null, { vis: false, col: !!o.solid });
  },
  // Fence run from (0,0) to (len,0) in local x. Picket style (white) or wood.
  fence(b, o) {
    const L = o.len, H = o.h || 3.4, c = o.color || '#ffffff', step = o.step || 1.1;
    const n = Math.max(1, Math.round(L / step));
    for (let i = 0; i <= n; i++) {
      const x = (L / n) * i;
      if (o.picket !== false) { b.box(x, 0, 0, 0.55, H, 0.3, c, { col: false, r: 0.12 }); b.cone(x, H, 0, 0.36, 0.45, c, { seg: 4, yaw: 45 }); }
    }
    for (let k = 0; k < 2; k++) b.box(L / 2, 0.8 + k * (H - 1.9), -0.25, L, 0.35, 0.2, o.rail || c, { col: false, r: 0.08 });
    for (let i = 0; i <= Math.ceil(L / 8); i++) b.box(Math.min(L, i * 8), 0, -0.2, 0.7, H + 0.2, 0.6, o.post || c, { col: false, r: 0.15 });
    b.box(L / 2, 0, 0, L, H + 6, 0.6, null, { vis: false, cam: false, phys: { noLedge: true, noWallJump: true } });
  },
  flowerBed(b, o) {
    const W = o.w || 6, D = o.d || 2.4, r = rng(o.seed || 2);
    b.box(0, 0, 0, W + 0.4, 0.6, D + 0.4, '#8d5a33', { r: 0.2, col: false });
    b.box(0, 0.05, 0, W, 0.6, D, '#6b4226', { r: 0.15, col: false });
    const cols = o.cols || ['#ff5fa2', '#ffd23f', '#ffffff', '#ff9a3c', '#9b6cff'];
    for (let i = 0; i < Math.round(W * D * 1.4); i++) {
      const x = (r() - 0.5) * (W - 0.6), z = (r() - 0.5) * (D - 0.6), h = 0.5 + r() * 0.7;
      b.box(x, 0.6, z, 0.08, h, 0.08, '#3f9e44', { col: false, r: 0.02, cast: false });
      b.sphere(x, 0.65 + h, z, 0.24, cols[(r() * cols.length) | 0], { col: false, seg: 8, s: [1, 0.7, 1] });
    }
  },
  veggies(b, o) {
    const W = o.w || 7, D = o.d || 3;
    b.box(0, 0, 0, W + 0.6, 1.0, D + 0.6, '#b8835a', { r: 0.15 });
    b.box(0, 0.1, 0, W, 1.0, D, '#6b4226', { col: false, r: 0.1 });
    for (let i = 0; i < 6; i++) {
      const x = -W / 2 + 0.7 + i * (W - 1.4) / 5;
      if (i % 2) { b.cone(x, 0.9, 0, 0.32, 1.0, '#ff9a3c', { rx: 180, col: false }); b.sphere(x, 1.4, 0, 0.42, '#5cc23a', { col: false, s: [0.6, 1, 0.6] }); }
      else { b.sphere(x, 1.5, 0, 0.6, '#3f9e44', { col: false }); b.sphere(x + 0.3, 1.3, 0.4, 0.3, '#e8473c', { col: false }); b.sphere(x - 0.3, 1.6, -0.3, 0.28, '#e8473c', { col: false }); }
    }
  },
  trampoline(b, o) {
    const R = o.r || 4.2, H = o.legs || 2.2;
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; b.box(Math.cos(a) * (R - 0.3), 0, Math.sin(a) * (R - 0.3), 0.3, H, 0.3, '#5f6675', { col: false, r: 0.1 }); }
    b.torus(0, H, 0, R, 0.35, o.rim || '#3f8fe8');
    b.cyl(0, H - 0.2, 0, R - 0.3, 0.2, '#2a2a33', { col: false, seg: 24 });
    b.cyl(0, H + 0.02, 0, R * 0.42, 0.02, '#ffd23f', { col: false, seg: 24, bevel: 0 });
    b.cyl(0, 0, 0, R - 0.2, H, null, { vis: false, col: true, phys: { bounce: o.bounce || 27, onBounce: o.onBounce } });
  },
  treehouse(b, o) {
    // Kinan's fort: a 12x10 deck at height H on posts, the tree trunk at the back right, a hut at the back left,
    // the front (+z) open, a small super-trampoline on the deck, and chunky ladder-stairs up the left side.
    const H = o.h || 9;
    const leaf = ['#4cb043', '#5cc23a', '#7fd14d'];
    b.cyl(3.6, 0, -3.0, 1.6, H + 8, '#8a5a34', { taper: 0.72, col: true, cr: 1.6 });
    for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28; b.sphere(3.6 + Math.cos(a) * 4.6, H + 9 + Math.sin(i * 2.1) * 1.2, -5.5 + Math.sin(a) * 3.2, 3.1, leaf[i % 3], { seg: 14 }); }
    b.sphere(3.6, H + 12.2, -5, 4.4, leaf[1], { seg: 18 });
    // deck
    b.box(0, H - 0.6, 0, 12, 0.6, 10, 'woodLight', { r: 0.15 });
    for (let i = 0; i < 9; i++) b.box(-5.4 + i * 1.35, H - 0.56, 0, 1.15, 0.06, 9.6, i % 2 ? '#d9a066' : '#c98c50', { col: false, r: 0, cast: false });
    for (const [x, z] of [[-5.6, -4.6], [5.6, -4.6], [-5.6, 4.6], [5.6, 4.6]]) b.cyl(x, 0, z, 0.45, H - 0.6, 'woodDark', { col: true });
    // railings: back + right; left has the ladder gap
    b.box(0, H, -4.8, 12, 1.5, 0.3, 'wood', { r: 0.1 });
    b.box(5.85, H, 0, 0.3, 1.5, 10, 'wood', { r: 0.1 });
    b.box(-5.85, H, -2.8, 0.3, 1.5, 4.4, 'wood', { r: 0.1 });
    // hut
    b.box(-2.8, H, -2.6, 5, 4.0, 4.2, '#ff9a3c', { r: 0.2 });
    b.box(-2.8, H, -0.45, 1.8, 2.7, 0.12, '#5e3b20', { col: false, r: 0.05 });
    b.ramp(-2.8 - 3.0, -2.6, H + 4.0, -2.8, -2.6, H + 6.2, 4.7, '#e8473c', { thick: 0.35, over: 0.3, col: false });
    b.ramp(-2.8 + 3.0, -2.6, H + 4.0, -2.8, -2.6, H + 6.2, 4.7, '#e8473c', { thick: 0.35, over: 0.3, col: false });
    b.box(-2.8, H + 4.0, -2.6, 5.2, 2.0, 4.2, null, { vis: false });
    b.texPanel("sign:KINAN'S|FORT", -2.8, H + 3.0, -0.38, 2.8, 1.1, 0);
    // super trampoline on the deck
    b.push(1.6, H, 2.4);
    YARD.trampoline(b, { r: 2.3, legs: 1.0, bounce: o.bounce || 31 });
    b.pop();
    // ladder-stairs up the left side (low end far left)
    b.stairs(-15, 2.2, 0, -6.0, 2.2, H, 3.2, 12, 'woodLight', { color2: '#d9a066', base: 0 });
    for (const sz of [-1, 1]) b.ramp(-15, 2.2 + sz * 1.75, 0.9, -6.0, 2.2 + sz * 1.75, H + 1.3, 0.3, 'wood', { thick: 0.3, col: false });
  },
  swingset(b, o) {
    const W = 10, H = 7;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.ramp(sx * W / 2, sz * 2.4, 0, sx * W / 2, 0, H, 0.5, '#e8473c', { thick: 0.5, col: false });
    b.cyl(0, H, 0, 0.35, W + 1, '#ffd23f', { rz: 90, col: false });
    for (const sx of [-1, 1]) b.cyl(sx * W / 2, 0, 0, 0.6, H, null, { vis: false, col: true });
    // live swings
    for (const [i, x] of [[0, -2.2], [1, 2.2]]) {
      const pivot = new THREE.Group();
      const ropeM = toyMat('#cfd6e2', 0.6);
      for (const sx of [-1, 1]) { const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.6, 6), ropeM); rope.position.set(sx * 0.9, -2.3, 0); pivot.add(rope); }
      dBox(pivot, 0, -4.9, 0, 2.2, 0.25, 1.1, i ? '#3f8fe8' : '#5cc23a');
      bake(pivot);
      placeGroup(b, pivot, x, H + 0.5, 0);
      const ph = i * 1.7;
      b.game.onUpdate((t) => { pivot.rotation.x = Math.sin(t * 1.9 + ph) * 0.45; });
    }
  },
  sandbox(b, o) {
    const W = o.w || 7;
    for (const [x, z, w, d] of [[0, -W / 2, W, 0.5], [0, W / 2, W, 0.5], [-W / 2, 0, 0.5, W], [W / 2, 0, 0.5, W]]) b.box(x, 0, z, w + 0.5, 0.9, d, '#e2ae73', { r: 0.15 });
    b.box(0, 0, 0, W - 0.3, 0.6, W - 0.3, '#f2d79b', { col: false, r: 0.1 });
    b.cone(-1.2, 0.5, 0.8, 1.3, 1.3, '#f2d79b', { col: false });
    b.cyl(1.4, 0.5, -1.0, 0.6, 1.0, '#e8473c', { taper: 1.3, col: false });
    b.box(1.6, 0.6, 1.4, 0.3, 0.2, 1.6, '#3f8fe8', { col: false, yaw: 30 });
  },
  shed(b, o) {
    const W = 9, D = 7, H = 5.5;
    b.box(0, 0, 0, W, H, D, o.color || '#9fd8ff', { r: 0.2, cam: true });
    for (let i = 0; i < 7; i++) b.box(-W / 2 + 0.65 + i * (W - 1.3) / 6, 0.2, D / 2 + 0.02, 0.1, H - 0.4, 0.08, '#7fbde8', { col: false, r: 0 });
    b.box(0, 0, D / 2 + 0.05, 3.4, 4.2, 0.2, '#ffffff', { col: false, r: 0.08 });
    b.box(0, 0.1, D / 2 + 0.12, 3.0, 3.9, 0.1, '#7fbde8', { col: false, r: 0.05 });
    b.ramp(-W / 2 - 0.8, 0, H, 0, 0, H + 2.6, D + 1.4, '#e8473c', { thick: 0.4, over: 0.4, base: H });
    b.ramp(W / 2 + 0.8, 0, H, 0, 0, H + 2.6, D + 1.4, '#e8473c', { thick: 0.4, over: 0.4, base: H });
  },
  doghouse(b, o) {
    b.box(0, 0, 0, 4.4, 3.2, 4.4, '#ffffff', { r: 0.2 });
    b.box(0, 0, 2.22, 1.8, 2.2, 0.1, '#2a2a33', { col: false, r: 0.5 });
    b.ramp(-2.7, 0, 3.0, 0, 0, 4.8, 5.2, '#d9443a', { thick: 0.3, over: 0.2, base: 3.0 });
    b.ramp(2.7, 0, 3.0, 0, 0, 4.8, 5.2, '#d9443a', { thick: 0.3, over: 0.2, base: 3.0 });
    b.texPanel('sign:CHIKASTINO', 0, 2.65, 2.26, 2.6, 0.75, 0);
    b.cyl(2.8, 0, 2.2, 0.6, 0.3, '#3f8fe8', { col: false });
    b.sphere(2.8, 0.3, 2.2, 0.35, '#c98b52', { col: false, s: [1, 0.4, 1] });
  },
  clothesline(b, o) {
    const L = o.len || 14, H = 6;
    for (const x of [0, L]) { b.box(x, 0, 0, 0.4, H, 0.4, '#cfd6e2', { r: 0.1, col: true }); b.box(x, H - 0.3, 0, 0.3, 0.3, 2.2, '#cfd6e2', { col: false, r: 0.08 }); }
    b.box(L / 2, H - 0.1, 0, L, 0.06, 0.06, '#ffffff', { col: false, r: 0 });
    const cols = ['#c2414f', '#3f8fe8', '#ffd23f', '#ffffff', '#5cc23a', '#ff8fb8'];
    for (let i = 0; i < 6; i++) {
      const g = new THREE.Group();
      const isShirt = i % 2 === 0;
      dBox(g, 0, -2.0, 0, isShirt ? 1.9 : 1.1, isShirt ? 1.9 : 2.0, 0.12, cols[i], { r: 0.05 });
      if (isShirt) { dBox(g, -1.15, -0.95, 0, 0.6, 0.8, 0.1, cols[i], { r: 0.05 }); dBox(g, 1.15, -0.95, 0, 0.6, 0.8, 0.1, cols[i], { r: 0.05 }); }
      bake(g);
      placeGroup(b, g, 1.4 + i * (L - 2.8) / 5, H - 0.1, 0);
      b.game.onUpdate((t) => { g.rotation.x = Math.sin(t * 2.3 + i * 0.9) * 0.25 + 0.15; g.rotation.z = Math.sin(t * 1.7 + i) * 0.05; });
    }
  },
  mailbox(b, o) {
    b.box(0, 0, 0, 0.4, 3.4, 0.4, 'woodDark', { r: 0.1, col: true });
    b.box(0, 3.3, 0, 1.2, 1.1, 2.2, o.color || '#3f8fe8', { r: 0.5 });
    b.box(0.65, 3.8, -0.4, 0.1, 1.0, 0.25, '#e8473c', { col: false, r: 0.03 });
    b.texPanel('sign:KINAN', 0.63, 3.85, 0.2, 1.4, 0.45, 90);
  },
  bbq(b, o) {
    b.sphere(0, 2.9, 0, 1.4, '#2a2a33', { s: [1, 0.8, 1], col: false, mat: 'gloss' });
    for (let i = 0; i < 3; i++) { const a = i / 3 * 6.28; b.box(Math.cos(a) * 0.9, 0, Math.sin(a) * 0.9, 0.2, 2.4, 0.2, '#5f6675', { col: false, r: 0.05 }); }
    b.cyl(0, 0, 0, 1.2, 3.8, null, { vis: false, col: true });
  },
  picnicTable(b, o) {
    b.box(0, 2.6, 0, 7, 0.35, 3.2, '#c98b52', { r: 0.12 });
    for (const sz of [-1, 1]) b.box(0, 1.4, sz * 2.7, 7, 0.3, 1.2, '#c98b52', { r: 0.1 });
    for (const sx of [-1, 1]) { b.box(sx * 2.8, 0, 0, 0.4, 2.6, 2.6, '#8d5a33', { r: 0.1, col: false }); b.box(sx * 2.8, 0, 0, 0.4, 1.4, 6.4, '#8d5a33', { r: 0.1, col: false }); }
    b.box(0, 0, 0, 6.6, 2.6, 2.8, null, { vis: false });
    for (const sz of [-1, 1]) b.box(0, 0, sz * 2.7, 6.6, 1.4, 1.0, null, { vis: false });
  },
  balloons(b, o) {
    const cols = o.cols || ['#e8473c', '#ffd23f', '#3f8fe8', '#ff5fa2', '#5cc23a'];
    const g = new THREE.Group();
    const r = rng(o.seed || 12);
    const items = [];
    for (let i = 0; i < (o.n || 5); i++) {
      const bx = (r() - 0.5) * 2, bz = (r() - 0.5) * 2, by = (o.h || 5) + r() * 1.6;
      const bal = dSphere(g, bx, by, bz, 0.75, null, { mat: toyMat(cols[i % cols.length], 0.25, { envMapIntensity: 1 }), s: [1, 1.18, 1], seg: 18 });
      const dir = new THREE.Vector3(bx, by - 0.85 - 0.9, bz);
      const len = dir.length();
      const str = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, len, 4), toyMat('#ffffff', 0.6));
      str.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      str.position.set(bx / 2, 0.9 + (by - 0.85 - 0.9) / 2, bz / 2);
      g.add(str);
      items.push([bal, by, r() * 6]);
    }
    placeGroup(b, g, 0, 0, 0);
    b.cyl(0, 0, 0, 0.3, 0.9, '#ffffff', { col: false });
    b.game.onUpdate((t) => { for (const [bal, by, ph] of items) { bal.position.y = by + Math.sin(t * 1.6 + ph) * 0.15; bal.rotation.z = Math.sin(t + ph) * 0.1; } });
  },
  banner(b, o) {
    // birthday banner between two posts
    const W = o.w || 14, H = o.h || 7;
    for (const sx of [-1, 1]) b.box(sx * W / 2, 0, 0, 0.45, H + 1.2, 0.45, '#ffffff', { r: 0.12, col: true });
    b.box(0, H - 1.2, -0.1, W - 0.6, 2.4, 0.15, '#f6c445', { col: false, r: 0.08 });
    b.texPanel('sign:' + (o.text || 'HAPPY BIRTHDAY|KINAN!'), 0, H, 0.0, W - 1.2, 2.2, 0);
    b.texPanel('sign:' + (o.text || 'HAPPY BIRTHDAY|KINAN!'), 0, H, -0.2, W - 1.2, 2.2, 180);
  },
  bunting(b, o) {
    // flag string from (0,yA,0) to (len, yB, 0)
    const L = o.len, cols = ['#e8473c', '#ffd23f', '#3f8fe8', '#5cc23a', '#ff5fa2', '#ff9a3c'];
    const n = Math.round(L / 1.3);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, x = t * L, y = (o.y || 6) - Math.sin(t * Math.PI) * (o.sag || 1.2);
      b.cone(x, y - 0.95, 0, 0.42, 0.9, cols[i % cols.length], { rx: 180, seg: 3, col: false, cast: false });
    }
    b.box(L / 2, (o.y || 6) - (o.sag || 1.2) * 0.6, 0, L, 0.05, 0.05, '#ffffff', { col: false, r: 0, cast: false });
  },
  streetLamp(b, o) {
    b.cyl(0, 0, 0, 0.45, 0.6, '#2b3a7a', { col: true });
    b.box(0, 0.5, 0, 0.3, 8, 0.3, '#2b3a7a', { r: 0.1, col: false });
    b.sphere(0, 8.8, 0, 0.8, '#fff6c8', { mat: 'glow', col: false });
    b.cone(0, 9.2, 0, 1.0, 0.8, '#2b3a7a', { col: false });
    b.cyl(0, 0, 0, 0.3, 8.5, null, { vis: false, col: true });
  },
  bins(b, o) {
    for (const [i, c] of [[0, '#3f8fe8'], [1, '#5cc23a']]) { b.box(i * 2.4, 0, 0, 2.0, 3.0, 2.2, c, { r: 0.25 }); b.box(i * 2.4, 3.0, 0.1, 2.2, 0.3, 2.5, c, { r: 0.12, col: false }); }
  },
  rock(b, o) {
    const s = o.s || 1;
    b.sphere(0, 0.4 * s, 0, 1.2 * s, '#a7a29a', { s: [1.3, 0.75, 1], seg: 10, col: true });
  },
  hydrant(b, o) {
    b.cyl(0, 0, 0, 0.55, 2.0, '#e8473c', { col: true });
    b.sphere(0, 2.0, 0, 0.55, '#e8473c', { col: false });
    for (const sx of [-1, 1]) b.cyl(sx * 0.6, 1.3, 0, 0.22, 0.4, '#e8473c', { rz: 90, col: false });
  },
  neighbor(b, o) {
    // simple chunky neighbour house for the background
    const W = o.w || 22, D = o.d || 18, H = o.h || 10, c = o.color || '#ffd9a8', roof = o.roof || '#3f63a8';
    b.box(0, 0, 0, W, H, D, c, { r: 0.3, col: !!o.solid, cast: false });
    b.ramp(0, -D / 2 - 1.2, H, 0, 0, H + 6, W + 1.4, roof, { thick: 0.6, col: false, cast: false });
    b.ramp(0, D / 2 + 1.2, H, 0, 0, H + 6, W + 1.4, roof, { thick: 0.6, col: false, cast: false });
    for (const sx of [-1, 1]) { b.box(sx * W / 4, H * 0.45, D / 2 + 0.05, W / 5, H / 3.2, 0.2, '#9fd8ff', { col: false, r: 0.1, mat: 'glow' }); b.box(sx * W / 4, H * 0.45 - 0.25, D / 2 + 0.25, W / 5 + 0.6, 0.3, 0.4, '#ffffff', { col: false, r: 0.08 }); }
    b.box(0, 0, D / 2 + 0.1, 3, 6, 0.3, o.door || '#e8473c', { col: false, r: 0.1 });
  },
  cloud(b, o) {
    const s = o.s || 1, r = rng(o.seed || 3);
    for (let i = 0; i < 6; i++) b.sphere((i - 2.5) * 3.4 * s, (r() * 1.6) * s, (r() - 0.5) * 3 * s, (2.6 + r() * 2.2) * s, '#ffffff', { col: false, mat: 'cloud', seg: 14, cast: false, ao: false });
  },
};

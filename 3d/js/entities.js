// Everything that moves or can be touched: candles, Candle Stars, enemies, checkpoints, goal, pets,
// moving platforms (ceiling fan, toy train, lifts, spinners), pound boxes, hints, Glitchy, particles, blob shadows.
// All are created from plain data in the level file (see levels/12-1.js for every field).
import * as THREE from 'three';
import { savePose, moved, topAt } from './physics.js';
import { damp, dampAngle, clamp, angleDiff, rng, TAU } from './util.js';
import { toyMat, dBox, dSphere, dCyl, bake } from './props.js';
import { roundedBoxGeo } from './build.js';
import { Boxes } from './boxes.js';
import { initBrain, think, harmful, takeHit, stun, animateEnemy, addMarks } from './ai.js';
import { Boss } from './boss.js';
import { mergeByNode, countTris } from './kinan.js';

// The family pets, exactly as the 2D game's PET_DEFS (Kinan vs. Mom). cat1 is Ginger, the family's orange kitten.
// One cat + one dog come along. Each has ONE automatic power, the same idea as in 2D.
export const PET_DEFS = {
  cat1: { kind: 'cat', name: 'GINGER', color: '#d98a3d', shade: '#a85f22', power: 'boost', perk: 'Kitten Boost: jump from her paw prints to fly up high' },
  dog1: { kind: 'dog', name: 'CHIKASTINO', color: '#f0e2c8', shade: '#a8692e', power: 'bark', perk: 'Neighbourhood Watch: barks to stun nearby enemies' },
  cat2: { kind: 'cat', name: 'VADER', color: '#9a9aa6', shade: '#5e5e6a', power: 'secrets', perk: 'Curious Force: finds secrets and pulls in candles' },
  dog2: { kind: 'dog', name: 'HUNTER', color: '#4a4a58', shade: '#26262f', power: 'rescue', perk: 'Courage Fetch: saves Kinan once when he would lose his last heart' },
  cat3: { kind: 'cat', name: 'DUCHESS', color: '#f0e2c8', shade: '#c4ad84', power: 'snack', perk: 'Royal Snack Break: a snack that heals' },
  cat4: { kind: 'cat', name: 'TUXEDO', color: '#6b6f7a', shade: '#3b3f4a', power: 'shrug', perk: 'Senior Glare: shrugs off hits (less knockback)' },
};
const SAVE_KEY = 'kinan-remaster-v1';
// equipped cat + dog: ?cat=cat2&dog=dog2 (or none) on the URL, else the Kinan vs. Mom save when this page can read it, else Ginger + Chikastino
export function petLoadout() {
  const q = new URLSearchParams(location.search);
  let cat = 'cat1', dog = 'dog1', names = {};
  try {
    const p = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (p && p.pets) {
      if ('equippedCat' in p.pets) cat = p.pets.equippedCat; if ('equippedDog' in p.pets) dog = p.pets.equippedDog;
      if (p.pets.names && typeof p.pets.names === 'object') names = p.pets.names;
    }
  } catch (e) { /* storage blocked: defaults */ }
  if (q.has('cat')) cat = q.get('cat'); if (q.has('dog')) dog = q.get('dog');
  const out = [];
  if (cat && PET_DEFS[cat] && PET_DEFS[cat].kind === 'cat') out.push({ id: cat, ...PET_DEFS[cat], name: String(names[cat] || PET_DEFS[cat].name).toUpperCase().slice(0, 14) });
  if (dog && PET_DEFS[dog] && PET_DEFS[dog].kind === 'dog') out.push({ id: dog, ...PET_DEFS[dog], name: String(names[dog] || PET_DEFS[dog].name).toUpperCase().slice(0, 14) });
  return out;
}

const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);

// ------------------------------------------------------------------ particles (one draw call)
export class Particles {
  constructor(scene, max = 600) {
    this.max = max; this.n = 0;
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(max * 3); this.col = new Float32Array(max * 3); this.size = new Float32Array(max); this.alpha = new Float32Array(max);
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('size', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('alpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    g.setDrawRange(0, 0);
    this.mat = new THREE.ShaderMaterial({
      uniforms: { uScale: { value: 600 } },
      vertexShader: `attribute float size; attribute float alpha; attribute vec3 color; varying vec3 vC; varying float vA; uniform float uScale;
        void main(){ vC=color; vA=alpha; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=size*uScale/max(0.1,-mv.z); gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `varying vec3 vC; varying float vA; void main(){ vec2 d=gl_PointCoord-0.5; float r=length(d); if(r>0.5) discard; float a=smoothstep(0.5,0.28,r)*vA; gl_FragColor=vec4(vC*(1.0+0.35*smoothstep(0.3,0.0,r)),a); }`,
      transparent: true, depthWrite: false,
    });
    this.points = new THREE.Points(g, this.mat);
    this.points.frustumCulled = false; this.points.renderOrder = 5;
    scene.add(this.points);
    this.geo = g;
    this.p = []; // particle records
    this._c = new THREE.Color();
  }
  emit(x, y, z, vx, vy, vz, color, size, life, grav = 0, drag = 0) {
    if (this.p.length >= this.max) this.p.shift();
    this._c.set(color);
    this.p.push({ x, y, z, vx, vy, vz, r: this._c.r, g: this._c.g, b: this._c.b, size, life, max: life, grav, drag });
  }
  sparkle(p, color = '#ffe27a', n = 14, speed = 5) {
    for (let i = 0; i < n; i++) { const a = Math.random() * TAU, e = Math.random() * 2 - 0.4; this.emit(p.x, p.y, p.z, Math.cos(a) * speed * (0.4 + Math.random()), e * speed, Math.sin(a) * speed * (0.4 + Math.random()), color, 0.35 + Math.random() * 0.25, 0.5 + Math.random() * 0.3, 6, 2); }
  }
  dust(p, n = 6, spread = 1.2) {
    for (let i = 0; i < n; i++) { const a = Math.random() * TAU; this.emit(p.x + Math.cos(a) * 0.3, p.y + 0.15, p.z + Math.sin(a) * 0.3, Math.cos(a) * spread * 2, 1 + Math.random() * 1.5, Math.sin(a) * spread * 2, '#f3efe6', 0.5 + Math.random() * 0.4, 0.45, -1, 3); }
  }
  poof(p, color = '#ffffff', n = 14) {
    for (let i = 0; i < n; i++) { const a = Math.random() * TAU, u = Math.random(); this.emit(p.x, p.y + 0.6, p.z, Math.cos(a) * 4 * u, 2 + Math.random() * 3, Math.sin(a) * 4 * u, color, 0.8 + Math.random() * 0.6, 0.5 + Math.random() * 0.2, -2, 4); }
  }
  ring(p, n = 22, color = '#fff6d6') {
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU; this.emit(p.x + Math.cos(a) * 0.5, p.y + 0.2, p.z + Math.sin(a) * 0.5, Math.cos(a) * 9, 0.8, Math.sin(a) * 9, color, 0.7, 0.4, 0, 5); }
  }
  confetti(p, n = 50) {
    const cols = ['#e8473c', '#ffd23f', '#3f8fe8', '#5cc23a', '#ff5fa2', '#ff9a3c', '#00ffd0'];
    for (let i = 0; i < n; i++) { const a = Math.random() * TAU; this.emit(p.x, p.y, p.z, Math.cos(a) * 6 * Math.random(), 6 + Math.random() * 8, Math.sin(a) * 6 * Math.random(), cols[i % cols.length], 0.32, 2.2 + Math.random(), 7, 1.2); }
  }
  heart(p) { this.emit(p.x, p.y, p.z, 0, 2.2, 0, '#ff5fa2', 0.9, 1.0, 0, 0.5); }
  update(dt) {
    let k = 0;
    const out = [];
    for (const q of this.p) {
      q.life -= dt; if (q.life <= 0) continue;
      q.vy -= q.grav * dt;
      const dr = Math.exp(-q.drag * dt); q.vx *= dr; q.vz *= dr; if (q.drag) q.vy *= Math.exp(-q.drag * 0.3 * dt);
      q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt;
      this.pos[k * 3] = q.x; this.pos[k * 3 + 1] = q.y; this.pos[k * 3 + 2] = q.z;
      this.col[k * 3] = q.r; this.col[k * 3 + 1] = q.g; this.col[k * 3 + 2] = q.b;
      const t = q.life / q.max;
      this.size[k] = q.size * (0.5 + 0.5 * t); this.alpha[k] = Math.min(1, t * 2.2);
      out.push(q); k++;
    }
    this.p = out;
    this.geo.setDrawRange(0, k);
    for (const a of ['position', 'color', 'size', 'alpha']) this.geo.attributes[a].needsUpdate = true;
  }
}

// ------------------------------------------------------------------ blob shadow
let blobTex = null;
function getBlobTex() {
  if (blobTex) return blobTex;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(20,10,40,0.62)'); g.addColorStop(0.55, 'rgba(20,10,40,0.45)'); g.addColorStop(1, 'rgba(20,10,40,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  blobTex = new THREE.CanvasTexture(c);
  return blobTex;
}
export class Blob {
  constructor(scene, world, size = 1) {
    this.world = world; this.size = size;
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: getBlobTex(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    this.mesh.rotation.x = -Math.PI / 2; this.mesh.renderOrder = 3;
    scene.add(this.mesh);
  }
  update(x, y, z, maxDrop = 40) {
    const g = this.world.groundAt(x, z, y + 0.2, 0);
    if (!g || y - g.y > maxDrop) { this.mesh.visible = false; return; }
    const h = y - g.y;
    const s = this.size * clamp(1.1 - h * 0.035, 0.45, 1.1);
    this.mesh.visible = true;
    this.mesh.position.set(x, g.y + 0.04, z);
    this.mesh.scale.set(s, s, 1);
    this.mesh.material.opacity = clamp(1 - h * 0.025, 0.35, 1);
    const c = g.c;
    if (c.type === 'ramp') {
      const slope = Math.atan2(c.h1 - c.h0, c.hz * 2);
      this.mesh.rotation.set(-Math.PI / 2, 0, 0);
      this.mesh.rotation.order = 'YXZ';
      this.mesh.rotation.y = c.yaw; this.mesh.rotation.x = -Math.PI / 2 - slope;
      this.mesh.position.y = g.y + 0.08;
    } else { this.mesh.rotation.order = 'XYZ'; this.mesh.rotation.set(-Math.PI / 2, 0, 0); }
  }
  set visible(v) { this.mesh.visible = v; }
}

// ------------------------------------------------------------------ main container
export class Entities {
  constructor(game) {
    this.g = game; this.scene = game.scene; this.world = game.world;
    this.candles = []; this.stars = []; this.enemies = []; this.checkpoints = []; this.pets = []; this.movers = []; this.poundBoxes = []; this.hints = [];
    this.goal = null; this.time = 0;
    this.boxes = new Boxes(this);
    this.trail = []; this.pawSpots = []; this.petCd = { bark: 4, snack: 6 }; this.boss = null; this.magnet = 0;
  }

  build(L, b) {
    let spare = 30 + (L.enemies || []).length + (L.boss ? 12 : 0);
    for (const p of L.poundBoxes || []) spare += p.candles || 6;
    for (const d of L.boxes || []) spare += d.kind === 'crate' ? (d.candles !== undefined ? d.candles : 2) : d.kind === 'prize' ? (d.candles || 0) : 0;
    for (const c of L.cages || []) if (c.prize && c.prize.item === 'present') spare += 8;
    this.buildCandles(L.candles || [], spare);
    (L.goldenCandles || L.stars || []).forEach((s, i) => this.addStar(s, i));
    this.totalGolden = this.stars.length;
    (L.enemies || []).forEach((e) => this.addEnemy(e));
    (L.checkpoints || []).forEach((c, i) => this.addCheckpoint(c, i));
    this.loadout = petLoadout();
    for (const def of this.loadout) this.addPet(def, (L.pets || []).find((p) => p.type === def.kind) || {});
    (L.movers || []).forEach((m) => this.addMover(m, b));
    (L.poundBoxes || []).forEach((p) => this.addPoundBox(p, b));
    this.boxes.build(L);
    (L.pawSpots || []).forEach((p) => this.addPawSpot(p));
    if (L.boss) this.boss = new Boss(this, L.boss);
    this.hints = (L.hints || []).map((h) => ({ ...h, p: v3(h.pos), shownAt: -999, inside: false }));
    if (L.goal) this.addGoal(L.goal);
  }

  // ---------------- candles (instanced)
  buildCandles(list, spare = 24) {
    const N = list.length + spare;
    // body: 3 striped bands baked with vertex colours
    const parts = [];
    const bands = 4;
    for (let i = 0; i < bands; i++) {
      const g = new THREE.CylinderGeometry(0.2, 0.2, 1.05 / bands, 12, 1, false);
      g.translate(0, (i + 0.5) * 1.05 / bands, 0);
      const n = g.attributes.position.count, col = new Float32Array(n * 3).fill(i % 2 ? 1 : 0.62);
      g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.deleteAttribute('uv');
      parts.push(g);
    }
    const wick = new THREE.CylinderGeometry(0.035, 0.035, 0.18, 5); wick.translate(0, 1.13, 0);
    { const n = wick.attributes.position.count; wick.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3).fill(0.15), 3)); wick.deleteAttribute('uv'); }
    parts.push(wick);
    const bodyG = mergeSimple(parts);
    const bodyM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, envMapIntensity: 0.8 });
    this.candleBody = new THREE.InstancedMesh(bodyG, bodyM, N);
    const flameG = new THREE.SphereGeometry(0.17, 10, 8); flameG.scale(1, 1.7, 1); flameG.translate(0, 1.42, 0);
    this.candleFlame = new THREE.InstancedMesh(flameG, new THREE.MeshBasicMaterial({ color: '#ffb83a' }), N);
    const coreG = new THREE.SphereGeometry(0.09, 8, 6); coreG.scale(1, 1.5, 1); coreG.translate(0, 1.36, 0.0);
    this.candleCore = new THREE.InstancedMesh(coreG, new THREE.MeshBasicMaterial({ color: '#fff6c8' }), N);
    for (const m of [this.candleBody, this.candleFlame, this.candleCore]) { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; this.scene.add(m); }
    // glow points
    const gp = new Float32Array(N * 3);
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(gp, 3).setUsage(THREE.DynamicDrawUsage));
    this.glowMat = new THREE.ShaderMaterial({
      uniforms: { uScale: { value: 600 } },
      vertexShader: `uniform float uScale; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=1.5*uScale/max(0.1,-mv.z); gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `void main(){ float r=length(gl_PointCoord-0.5); float a=smoothstep(0.5,0.0,r); gl_FragColor=vec4(1.0,0.8,0.35,a*0.55); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.candleGlow = new THREE.Points(gg, this.glowMat); this.candleGlow.frustumCulled = false; this.candleGlow.renderOrder = 4;
    this.scene.add(this.candleGlow);
    this.glowPos = gp;
    const tints = ['#ff8fb8', '#7ec8ff', '#ffd23f', '#9ff0a0', '#c9b6ff', '#ffb27a'];
    const c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const p = list[i];
      this.candles.push({ x: p ? p[0] : 0, y: p ? p[1] : -999, z: p ? p[2] : 0, alive: !!p, ph: i * 1.7, spare: !p, vy: 0, settle: 0 });
      c.set(tints[i % tints.length]);
      this.candleBody.setColorAt(i, c);
    }
    this.candleBody.instanceColor.needsUpdate = true;
    this.totalCandles = list.length;
    this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._s = new THREE.Vector3(1, 1, 1); this._p = new THREE.Vector3(); this._up = new THREE.Vector3(0, 1, 0);
  }
  spawnCandle(x, y, z, vy = 8, auto = false) {
    let c = this.candles.find((k) => k.spare && !k.alive && !k.used);
    if (!c) { c = this.candles.find((k) => k.spare && !k.alive); }
    if (!c) return;
    c.used = true;
    c.x = x; c.y = y; c.z = z; c.alive = true; c.vy = vy; c.settle = 1; c.spawnT = auto ? 0.42 : 0.35; c.auto = auto;
    this.totalCandles += 1;
    this.g.hud.candles(this.g.candles, this.totalCandles);
  }
  updateCandles(dt, t, pp) {
    const px = pp.x, py = pp.y + 1.0, pz = pp.z;
    let n = 0;
    for (let i = 0; i < this.candles.length; i++) {
      const c = this.candles[i];
      if (!c.alive) { this._s.set(0, 0, 0); this._p.set(0, -999, 0); }
      else {
        if (c.settle) {
          // dropped candle: hop out and land
          c.vy -= 30 * dt; c.y += c.vy * dt;
          const g = this.world.groundAt(c.x, c.z, c.y + 0.5, 0);
          if (g && c.y <= g.y + 0.2 && c.vy < 0) { c.y = g.y + 0.2; c.settle = 0; }
          c.spawnT -= dt;
        }
        const bob = Math.sin(t * 2.6 + c.ph) * 0.14;
        this._p.set(c.x, c.y + bob, c.z);
        this._q.setFromAxisAngle(this._up, t * 1.8 + c.ph);
        this._s.set(1, 1, 1);
        const dx = c.x - px, dy = (c.y + 0.6) - py, dz = c.z - pz;
        const d2 = dx * dx + dy * dy + dz * dz;
        // the lasso (far) and Vader (near) pull candles in
        if (this.magnet > 0 && !(c.spawnT > 0) && d2 < this.magnet * this.magnet && d2 > 0.01) {
          const d = Math.sqrt(d2), k = Math.min(d, 20 * dt) / d;
          c.x -= dx * k; c.y -= dy * k; c.z -= dz * k; c.settle = 0;
        }
        if ((c.auto && !(c.spawnT > 0)) || (!(c.spawnT > 0) && d2 < 1.45 * 1.45)) {
          c.alive = false; this.g.collectCandle(new THREE.Vector3(c.x, c.y + 0.9, c.z));
        }
        this.glowPos[n * 3] = c.x; this.glowPos[n * 3 + 1] = c.y + bob + 1.42; this.glowPos[n * 3 + 2] = c.z; n++;
      }
      this._m.compose(this._p, this._q, this._s);
      this.candleBody.setMatrixAt(i, this._m);
      const fl = 1 + Math.sin(t * 17 + c.ph * 3) * 0.12;
      this._s.multiplyScalar(1); const sy = this._s.y;
      this._m.compose(this._p, this._q, this._s.set(this._s.x * fl, sy * (2 - fl), this._s.z * fl));
      this.candleFlame.setMatrixAt(i, this._m);
      this.candleCore.setMatrixAt(i, this._m);
    }
    this.candleBody.instanceMatrix.needsUpdate = true; this.candleFlame.instanceMatrix.needsUpdate = true; this.candleCore.instanceMatrix.needsUpdate = true;
    this.candleGlow.geometry.setDrawRange(0, n);
    this.candleGlow.geometry.attributes.position.needsUpdate = true;
  }

  // ---------------- golden candles (the rare big prize, like Mario's Power Stars)
  addStar(s, i) {
    const grp = new THREE.Group();
    const body = new THREE.Group(); grp.add(body);
    const gold = new THREE.MeshStandardMaterial({ color: '#ffcf3a', roughness: 0.22, metalness: 0.35, emissive: '#7a4a00', emissiveIntensity: 0.6, envMapIntensity: 1.3 });
    const stripe = new THREE.MeshStandardMaterial({ color: '#fff3c4', roughness: 0.3, metalness: 0.2, emissive: '#806020', emissiveIntensity: 0.4 });
    const can = new THREE.Mesh(roundCyl(0.62, 1.9), gold); can.position.y = -0.2; body.add(can);
    for (const y of [-0.75, 0.05]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.63, 0.09, 8, 24), stripe); r.rotation.x = Math.PI / 2; r.position.y = y; body.add(r); }
    const drip = new THREE.Mesh(new THREE.SphereGeometry(0.66, 18, 10, 0, TAU, 0, Math.PI / 2), stripe); drip.scale.y = 0.35; drip.position.y = 0.75; body.add(drip);
    const eyeM = toyMat('#1b1220', 0.2);
    for (const sx of [-1, 1]) { const e = dSphere(body, sx * 0.22, 0.05, 0.58, 0.11, null, { mat: eyeM, s: [1, 1.7, 0.6] }); e.position.y = 0.05; }
    dCyl(body, 0, 0.9, 0, 0.05, 0.3, '#3a2a20');
    const fl = dSphere(body, 0, 1.45, 0, 0.26, null, { mat: new THREE.MeshBasicMaterial({ color: '#ffb83a' }), s: [1, 1.7, 1] });
    dSphere(fl, 0, -0.05, 0.02, 0.55, null, { mat: new THREE.MeshBasicMaterial({ color: '#fff6c8' }), s: [0.6, 0.6, 0.6] });
    // halo
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 4.5), new THREE.MeshBasicMaterial({ map: haloTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    grp.add(halo);
    grp.position.copy(v3(s.pos));
    grp.scale.setScalar(s.s || 1);
    this.scene.add(grp);
    const blob = new Blob(this.scene, this.world, 2.0 * (s.s || 1));
    this.stars.push({ i, def: s, grp, star: body, halo, fl, base: grp.position.clone(), alive: true, blob });
  }
  updateStars(dt, t, pp, cam) {
    for (const s of this.stars) {
      if (!s.alive) {
        if (s.fly > 0) { s.fly -= dt; s.grp.position.y += dt * 10; s.grp.scale.multiplyScalar(Math.exp(-dt * 4)); s.star.rotation.y += dt * 20; if (s.fly <= 0) s.grp.visible = false; }
        continue;
      }
      s.grp.position.y = s.base.y + Math.sin(t * 2) * 0.25;
      s.star.rotation.y = t * 1.6;
      s.halo.quaternion.copy(cam.quaternion);
      s.halo.material.opacity = 0.7 + Math.sin(t * 5) * 0.2;
      s.fl.scale.set(1, 1.7 + Math.sin(t * 19) * 0.25, 1);
      s.blob.update(s.base.x, s.base.y, s.base.z, 12);
      if (Math.random() < dt * 6) this.g.particles.emit(s.grp.position.x + (Math.random() - 0.5) * 2, s.grp.position.y + (Math.random() - 0.5) * 2, s.grp.position.z + (Math.random() - 0.5) * 2, 0, 0.8, 0, '#fff2a0', 0.3, 0.8, 0, 0);
      const d = s.grp.position.distanceTo(new THREE.Vector3(pp.x, pp.y + 1, pp.z));
      if (d < 2.0) {
        s.alive = false; s.fly = 0.6; s.blob.visible = false;
        this.g.collectGolden(s.i, s.def, s.grp.position.clone());
      }
    }
  }

  // ---------------- enemies
  addEnemy(e) {
    const grp = new THREE.Group();
    const base = v3(e.pos);
    let parts;
    if (e.type === 'brick') { parts = buildBrickEnemy(grp, e.color || '#e8473c'); bake(parts.body); parts.feet.forEach((f) => bake(f)); bake(parts.mark); }
    else { parts = buildSock(grp, e.color); bake(parts.body); }
    grp.position.copy(base);
    this.scene.add(grp);
    const en = {
      def: e, type: e.type || 'sock', grp, parts, pos: base.clone(), home: base.clone(), yaw: (e.yaw || 0) * Math.PI / 180,
      patrol: (e.patrol || []).map((p) => new THREE.Vector3(p[0], base.y, p[1])), pi: 0, dir: 1,
      speed: e.speed || (e.type === 'brick' ? 2.6 : 2.3), r: e.type === 'brick' ? 1.1 : 0.75, h: e.type === 'brick' ? 2.2 : 2.1,
      state: 'walk', t: Math.random() * 5, alive: true, blob: new Blob(this.scene, this.world, e.type === 'brick' ? 2.6 : 1.7),
    };
    initBrain(en, this.enemies.length);
    addMarks(en);
    this.enemies.push(en);
    return en;
  }
  updateEnemies(dt, pl) {
    const pp = pl.pos;
    for (const e of this.enemies) {
      e.t += dt;
      if (!e.alive) {
        if (e.state === 'squash') {
          e.st -= dt;
          e.grp.scale.set(1 + (0.3 - e.st) * 2.2, Math.max(0.12, e.st / 0.3), 1 + (0.3 - e.st) * 2.2);
          if (e.st <= 0) { e.state = 'gone'; e.grp.visible = false; e.blob.visible = false; this.g.particles.poof(e.pos, '#ffffff', 16); }
        }
        continue;
      }
      if (e.hidden) continue;
      // touch Kinan first (stomp from above, butt slam, sugar rush, or get hurt by a harmful enemy)
      const dist = Math.hypot(pp.x - e.pos.x, pp.z - e.pos.z);
      if (dist < e.r + 0.5 && pp.y < e.pos.y + e.h && pp.y + 2.0 > e.pos.y && pl.state !== 'dead' && e.state !== 'hide') {
        if (pl.pw.rush > 0) { takeHit(this, e, 'rush'); continue; }
        if (pl.state === 'pound') { takeHit(this, e, 'pound'); continue; }
        if (pl.vel.y < -0.5 && pp.y > e.pos.y + e.h * 0.45) { takeHit(this, e, 'stomp'); continue; }
        if (harmful(e) && pl.invuln <= 0) pl.hurt(e.pos.x, e.pos.z);
      }
      const moving = think(this, e, pl, dt);
      if (!e.alive) continue;
      animateEnemy(e, moving, dt);
      e.blob.update(e.pos.x, e.pos.y + 0.1, e.pos.z, 6);
    }
  }
  hitEnemy(e, how) { if (e.alive) takeHit(this, e, how); }
  onEnemyNotice(e) {
    this.g.firstTime('alert-enemy', 'That one SPOTTED you (see the "!"). When it crouches and shakes, step aside, then bop it while it is dizzy!');
  }
  defeat(e, pl, stomp) {
    if (!e.alive) return;
    e.alive = false; e.state = 'squash'; e.st = 0.3;
    this.g.sfx('stomp');
    this.g.particles.sparkle(new THREE.Vector3(e.pos.x, e.pos.y + 1.2, e.pos.z), '#ffffff', 10, 4);
    if (stomp) pl.bounceOff(this.g.input.jumpHeld);
    this.spawnCandle(e.pos.x, e.pos.y + 1.5, e.pos.z, 9);
    this.g.stats.bops++;
    this.g.camRig.shake(0.12);
  }

  // ---------------- checkpoints
  addCheckpoint(c, i) {
    const grp = new THREE.Group();
    dCyl(grp, 0, 0, 0, 1.1, 0.35, '#3a3f86');
    dCyl(grp, 0, 0.35, 0, 0.75, 0.15, '#f6c445');
    dCyl(grp, 0, 0.4, 0, 0.12, 4.4, '#ffffff');
    dSphere(grp, 0, 4.85, 0, 0.3, '#f6c445');
    const flag = new THREE.Group(); flag.position.set(0, 4.3, 0); grp.add(flag);
    const fm = new THREE.MeshStandardMaterial({ color: '#9aa3b2', roughness: 0.6 });
    const cloth = new THREE.Mesh(roundedBoxGeo(2.0, 1.3, 0.12, 0.05, 1), fm); cloth.position.set(1.05, -0.6, 0); flag.add(cloth);
    const starM = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5 });
    const emb = dSphere(flag, 1.05, -0.6, 0.08, 0.3, null, { mat: starM, s: [1, 1, 0.3] });
    bake(grp, false);
    grp.position.copy(v3(c.pos)); grp.rotation.y = (c.yaw || 0) * Math.PI / 180;
    this.scene.add(grp);
    this.checkpoints.push({ i, def: c, grp, flag, fm, emb, active: false, p: v3(c.pos) });
  }
  updateCheckpoints(dt, t, pp) {
    for (const c of this.checkpoints) {
      c.flag.rotation.y = Math.sin(t * 3 + c.i) * 0.2;
      if (!c.active && Math.hypot(pp.x - c.p.x, pp.z - c.p.z) < 1.9 && Math.abs(pp.y - c.p.y) < 2.5) {
        for (const o of this.checkpoints) if (o.active && o !== c) { o.active = false; o.fm.color.set('#9aa3b2'); }
        c.active = true; c.fm.color.set('#f6c445'); c.emb.material = toyMat('#e8473c', 0.4);
        this.g.setCheckpoint(c);
      }
    }
  }

  // ---------------- goal
  addGoal(gd) {
    const grp = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(gd.ring || 3.4, 0.22, 10, 40), new THREE.MeshBasicMaterial({ color: '#ffe27a' }));
    grp.add(ring);
    grp.position.copy(v3(gd.pos)); grp.position.y += gd.ringY || 4;
    grp.rotation.y = (gd.yaw || 0) * Math.PI / 180;
    this.scene.add(grp);
    this.goal = { def: gd, grp, ring, p: v3(gd.pos), r: gd.r || 2.6, done: false, locked: !!gd.locked };
    if (gd.locked) grp.visible = false;   // e.g. a boss arena: the way out appears when the boss is beaten
  }
  updateGoal(dt, t, pp) {
    const G = this.goal; if (!G || G.locked) return;
    G.ring.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
    G.ring.rotation.z = t * 0.6;
    if (Math.random() < dt * 14) { const a = Math.random() * TAU, R = G.def.ring || 3.4; const wp = new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0).applyQuaternion(G.grp.quaternion).add(G.grp.position); this.g.particles.emit(wp.x, wp.y, wp.z, 0, 0.5, 0, Math.random() < 0.5 ? '#ffe27a' : '#ff8fb8', 0.4, 0.9, 0, 0); }
    if (!G.done && Math.hypot(pp.x - G.p.x, pp.z - G.p.z) < G.r && Math.abs(pp.y - G.p.y) < 3) { G.done = true; this.g.levelClear(G); }
  }

  // ---------------- pets: the equipped cat + dog come along (they follow Kinan's footsteps) and use their power on their own
  addPet(def, place) {
    const grp = new THREE.Group();
    // the approved pet model (pets/glb loaded in game.init); the old blocky pet only if neither copy of the model loaded
    const model = this.g.petModels && this.g.petModels[def.id];
    let parts;
    if (model) parts = buildPetModel(grp, model.scene, def.kind);
    else {
      parts = def.kind === 'dog' ? buildDog(grp, def.color, def.shade) : buildCat(grp, def.color, def.shade);
      bake(parts.head); bake(parts.tail); parts.legs.forEach((l) => bake(l)); bake(grp, false);
      parts.h = def.kind === 'dog' ? 2.3 : 1.8; parts.foot = def.kind === 'dog' ? 2.2 : 1.5;
    }
    parts.from = model ? model.from : 'procedural';
    // start just behind Kinan (cat close, dog a step further)
    const sp = this.g.level.spawn.pos, yaw = (this.g.level.spawn.yaw || 0) * Math.PI / 180;
    const fx = Math.sin(yaw), fz = Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
    const back = def.kind === 'dog' ? 3.0 : 1.8, right = def.kind === 'dog' ? 2.0 : 1.2;
    const start = place.follow === false && place.pos ? v3(place.pos) : new THREE.Vector3(sp[0] - fx * back + rx * right, sp[1], sp[2] - fz * back + rz * right);
    grp.position.copy(start);
    this.scene.add(grp);
    const label = makeLabel(def.name);
    label.position.set(0, parts.h + 0.5, 0); grp.add(label);
    this.pets.push({ def, id: def.id, kind: def.kind, power: def.power, place, follow: place.follow !== false, grp, parts, h: parts.h, pos: start.clone(), target: start.clone(), yaw: 0, t: Math.random() * 9, wait: 1, label, y: start.y, blob: new Blob(this.scene, this.world, parts.foot), happy: 0, hop: 0, bark: 0, lag: def.kind === 'cat' ? 5 : 9 });
    if (def.power === 'rescue') this.g.player.hunterReady = true;
    if (def.power === 'shrug') this.g.player.knockMul = 0.45;
  }
  pet(kind) { return this.pets.find((a) => a.kind === kind); }
  petPower(name) {
    const map = { ginger: 'boost', chikastino: 'bark', vader: 'secrets', hunter: 'rescue', duchess: 'snack', tuxedo: 'shrug' };
    const pw = map[name] || name;
    return this.pets.some((a) => a.power === pw);
  }
  petCheer(kind) {
    const a = this.pet(kind); if (!a) return;
    a.hop = 0.5; this.g.particles.heart(new THREE.Vector3(a.pos.x, a.y + a.h + 0.3, a.pos.z));
  }
  // teleport a pet (with a poof) when it is far behind
  poofPet(a, x, y, z) {
    this.g.particles.poof(a.pos, '#ffffff', 8);
    a.pos.set(x, y, z); a.y = y; a.target.set(x, y, z);
    this.g.particles.poof(a.pos, '#ffffff', 8);
  }
  updatePets(dt, pl) {
    const pp = pl.pos;
    // Kinan's footsteps (only where he stood on something)
    if (pl.grounded && pl.state !== 'climb') {
      const last = this.trail[this.trail.length - 1];
      if (!last || Math.hypot(pp.x - last.x, pp.z - last.z) > 0.7 || Math.abs(pp.y - last.y) > 0.4) {
        this.trail.push({ x: pp.x, y: pp.y, z: pp.z });
        if (this.trail.length > 60) this.trail.shift();
      }
    }
    for (const a of this.pets) {
      a.t += dt;
      const dP = Math.hypot(pp.x - a.pos.x, pp.z - a.pos.z), dy = pp.y - a.y;
      const near = dP < 9 && Math.abs(dy) < 3;
      let speed = a.kind === 'dog' ? 7 : 6;
      let moving = false;
      if (a.follow) {
        // far behind (teleport, slide, a fall, a different floor): catch up with a poof once Kinan is standing somewhere
        if ((dP > 24 || Math.abs(dy) > 7) && pl.grounded && this.trail.length) {
          const tp = this.trail[Math.max(0, this.trail.length - 3)];
          this.poofPet(a, tp.x + (a.kind === 'dog' ? 1 : -1), tp.y, tp.z);
          this.trail.length = 0; this.trail.push({ x: pp.x, y: pp.y, z: pp.z });
        }
        const spot = a.power === 'boost' ? this.pawSpotUnder(pl) : null;
        if (spot) { a.target.set(spot.p.x + 1.4, spot.p.y, spot.p.z + 0.6); speed = 10; }
        else if (this.trail.length > a.lag && dP > 2.4) {
          const tp = this.trail[this.trail.length - 1 - a.lag];
          a.target.set(tp.x, tp.y, tp.z);
          speed = Math.min(11, Math.max(speed, dP * 1.1));
        } else if (dP > 3.2 && this.trail.length) {
          const tp = this.trail[0]; a.target.set(tp.x, tp.y, tp.z);
        } else a.target.copy(a.pos);
        const mx = a.target.x - a.pos.x, mz = a.target.z - a.pos.z, ml = Math.hypot(mx, mz);
        const ty = a.target.y;
        if (ty - a.y > 3.6) { /* too high to hop up: wait and look up at Kinan */ }
        else if (ml > 0.3) {
          const st = Math.min(ml, speed * dt);
          a.pos.x += mx / ml * st; a.pos.z += mz / ml * st;
          a.yaw = dampAngle(a.yaw, Math.atan2(mx, mz), 9, dt); moving = true;
          if (Math.abs(ty - a.y) > 0.3 && a.hop <= 0) a.hop = 0.35;
          a.y += (ty - a.y) * Math.min(1, dt * 7);
        } else a.y += (ty - a.y) * Math.min(1, dt * 7);
        if (!moving && dP < 6) a.yaw = dampAngle(a.yaw, Math.atan2(pp.x - a.pos.x, pp.z - a.pos.z), 5, dt);
      } else {
        // stay-at-home pet (follow:false): wander its area
        const area = a.place.area || [a.pos.x - 3, a.pos.z - 3, a.pos.x + 3, a.pos.z + 3];
        a.wait -= dt;
        if (a.wait <= 0 && a.pos.distanceTo(a.target) < 0.4) { a.target.set(area[0] + Math.random() * (area[2] - area[0]), a.y, area[1] + Math.random() * (area[3] - area[1])); a.wait = 1.5 + Math.random() * 3; }
        const mx = a.target.x - a.pos.x, mz = a.target.z - a.pos.z, ml = Math.hypot(mx, mz);
        moving = ml > 0.4 && a.wait < 1.4;
        if (moving) { const st = Math.min(ml, 2.4 * dt); a.pos.x += mx / ml * st; a.pos.z += mz / ml * st; a.yaw = dampAngle(a.yaw, Math.atan2(mx, mz), 7, dt); }
      }
      // gently move out of Kinan's way
      if (dP < 1.3 && !(a.power === 'boost' && this.pawSpotUnder(pl))) { a.pos.x -= (pp.x - a.pos.x) / (dP || 1) * dt * 4; a.pos.z -= (pp.z - a.pos.z) / (dP || 1) * dt * 4; }
      if (a.hop > 0) a.hop -= dt;
      const ph = a.t * (moving ? 12 : 0);
      const hopY = a.hop > 0 ? Math.sin((0.35 - Math.min(0.35, a.hop)) / 0.35 * Math.PI) * 0.9 : 0;
      a.grp.position.set(a.pos.x, a.y + hopY + (moving ? Math.abs(Math.sin(ph)) * 0.12 : 0), a.pos.z);
      a.grp.rotation.y = a.yaw;
      a.parts.legs.forEach((l, i) => { l.rotation.x = moving ? Math.sin(ph + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 0.6 : 0; });
      a.parts.tail.rotation.y = Math.sin(a.t * (a.kind === 'dog' ? (near ? 18 : 7) : 2.5)) * (a.kind === 'dog' ? 0.6 : 0.35);
      // head: a curious tilt while standing, nods while trotting, chin up for a bark
      if (a.bark > 0) a.bark -= dt;
      const barkUp = a.bark > 0 ? Math.sin(Math.min(1, a.bark / 0.5) * Math.PI) * 0.55 : 0;
      a.parts.head.rotation.z = moving ? 0 : Math.sin(a.t * 1.2 + (a.kind === 'dog' ? 2 : 0)) * 0.14;
      a.parts.head.rotation.x = (moving ? Math.sin(ph * 2) * 0.06 : Math.sin(a.t * 2.3) * 0.05) - barkUp;
      // the body rocks with the trot and noses up on a hop (the approved models; the blocky stand-in has no inner group)
      if (a.parts.inner) a.parts.inner.rotation.x = (moving ? Math.cos(ph) * 0.08 : 0) - (hopY > 0 ? 0.22 * Math.cos(Math.PI * clamp(1 - a.hop / 0.35, 0, 1)) : 0);
      a.label.visible = dP < 10;
      a.blob.update(a.pos.x, a.y + 0.1, a.pos.z, 4);
      a.happy -= dt;
      if (near && dP < 3.5 && a.happy <= 0) { a.happy = 5 + Math.random() * 4; this.g.particles.heart(new THREE.Vector3(a.pos.x, a.y + a.h + 0.3, a.pos.z)); this.g.sfx(a.kind === 'dog' ? 'woof' : 'meow'); }
    }
    this.petPowers(dt, pl);
  }
  // the automatic pet powers (no button)
  petPowers(dt, pl) {
    const g = this.g, pp = pl.pos;
    this.petCd.bark -= dt; this.petCd.snack -= dt;
    for (const a of this.pets) {
      if (a.power === 'bark' && this.petCd.bark <= 0) {
        // Chikastino: an enemy coming for Kinan? WOOF: everything nearby is stunned for a moment
        const near = this.enemies.filter((e) => e.alive && !e.hidden && e.state !== 'hide' && e.state !== 'stun' && Math.hypot(e.pos.x - pp.x, e.pos.z - pp.z) < 6.5 && Math.abs(e.pos.y - pp.y) < 3 && (['notice', 'chase', 'windup', 'lunge', 'reveal'].includes(e.state) || Math.hypot(e.pos.x - pp.x, e.pos.z - pp.z) < 3.5));
        const boss = this.boss && this.boss.alive && this.boss.state === 'windup' && Math.hypot(this.boss.pos.x - pp.x, this.boss.pos.z - pp.z) < 10 ? this.boss : null;
        if (near.length || boss) {
          near.forEach((e) => stun(this, e));
          if (boss) boss.stun(0.9);
          this.petCd.bark = 10;
          this.stats.barks = (this.stats.barks || 0) + 1;
          g.sfx('woof'); g.particles.ring(new THREE.Vector3(a.pos.x, a.y + 0.4, a.pos.z), 26, '#7be3a3');
          a.hop = 0.35; a.bark = 0.5;
          g.hud.toast('WOOF! ' + a.def.name + ' STUNNED THEM!', 1.1);
        }
      }
      if (a.power === 'snack' && this.petCd.snack <= 0 && pl.hearts < pl.maxHearts && pl.hearts > 0) {
        // Duchess: a snack that heals
        this.petCd.snack = 25;
        pl.heal(1); g.sfx('heal');
        this.stats.snacks = (this.stats.snacks || 0) + 1;
        g.particles.heart(new THREE.Vector3(pp.x, pp.y + 2.4, pp.z)); g.particles.heart(new THREE.Vector3(a.pos.x, a.y + a.h + 0.3, a.pos.z));
        g.hud.toast(a.def.name + ' BROUGHT A SNACK! +1 HEART', 1.6);
      }
      if (a.power === 'secrets') {
        // Vader: finds secrets (hidden ? boxes show up as ghosts) and pulls in candles (the magnet below)
        for (const bx of this.boxes.list) if (bx.hidden && !bx.sensed && Math.hypot(bx.pos.x - pp.x, bx.pos.z - pp.z) < 12 && Math.abs(bx.pos.y - pp.y) < 8) { bx.sensed = true; g.sfx('meow'); g.hud.toast(a.def.name + ' FOUND A SECRET!', 1.4); this.stats.secrets = (this.stats.secrets || 0) + 1; }
      }
    }
    this.magnet = Math.max(pl.pw.lasso ? 14 : 0, this.petPower('secrets') ? 5 : 0);
  }
  // Ginger's paw prints: jump from them and she launches Kinan high
  addPawSpot(p) {
    const grp = new THREE.Group();
    const m = toyMat('#a85f22', 0.6);
    for (const [ox, oz, a] of [[-0.45, -0.3, 0.3], [0.5, 0.25, -0.3]]) {
      const paw = new THREE.Group(); paw.position.set(ox, 0.03, oz); paw.rotation.y = a; grp.add(paw);
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.05, 14), m); paw.add(pad);
      for (let k = 0; k < 3; k++) { const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.05, 10), m); toe.position.set((k - 1) * 0.22, 0, 0.36 - Math.abs(k - 1) * 0.06); paw.add(toe); }
    }
    const ring = new THREE.Mesh(new THREE.RingGeometry((p.r || 1.4) - 0.15, p.r || 1.4, 32), new THREE.MeshBasicMaterial({ color: '#ffd23f', transparent: true, opacity: 0.55, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.04; grp.add(ring);
    grp.position.set(...p.pos);
    this.scene.add(grp);
    this.pawSpots.push({ def: p, grp, ring, p: v3(p.pos), r: p.r || 1.4, boost: p.boost || 24 });
  }
  pawSpotUnder(pl) {
    if (!pl.grounded) return null;
    for (const s of this.pawSpots) if (Math.hypot(pl.pos.x - s.p.x, pl.pos.z - s.p.z) < s.r && Math.abs(pl.pos.y - s.p.y) < 0.6) return s;
    return null;
  }
  pawBoost(pl) {
    const s = this.pawSpotUnder(pl);
    const cat = this.pets.find((a) => a.power === 'boost');
    if (!s || !cat) return 0;
    if (Math.hypot(cat.pos.x - s.p.x, cat.pos.z - s.p.z) > 4) this.poofPet(cat, s.p.x + 1.4, s.p.y, s.p.z + 0.6);
    cat.hop = 0.35; cat.yaw = Math.atan2(pl.pos.x - cat.pos.x, pl.pos.z - cat.pos.z);
    this.stats.boosts = (this.stats.boosts || 0) + 1;
    this.g.hud.toast(cat.def.name + ': KITTEN BOOST!', 1.3);
    this.g.sfx('meow');
    this.g.particles.ring(new THREE.Vector3(s.p.x, s.p.y + 0.2, s.p.z), 22, '#ffd23f');
    return s.boost;
  }
  shootConfetti(pl) { this.boxes.shoot(pl); }

  // ---------------- movers
  addMover(m, b) {
    if (m.type === 'fan') this.addFan(m);
    else if (m.type === 'train') this.addTrain(m, b);
    else if (m.type === 'lift') this.addLift(m);
    else if (m.type === 'spinner') this.addSpinner(m);
  }
  addFan(m) {
    const [x, y, z] = m.pos, n = m.blades || 4, R = m.len || 5.4, W = m.width || 1.7, ceil = m.ceil || y + 2.5;
    const grp = new THREE.Group(); grp.position.set(x, y, z);
    const spin = new THREE.Group(); grp.add(spin);
    const hubM = toyMat(m.hub || '#ffffff', 0.4);
    dCyl(grp, 0, 0.35, 0, 0.18, ceil - y - 0.35, '#ffffff');
    dCyl(grp, 0, ceil - y - 0.3, 0, 0.8, 0.3, '#ffffff');
    dCyl(spin, 0, -0.55, 0, 0.95, 0.9, null, { mat: hubM });
    dSphere(spin, 0, -0.6, 0, 0.55, '#ffd23f', { mat: new THREE.MeshBasicMaterial({ color: '#fff3b0' }) });
    const cols = m.colors || ['#7ec8ff', '#ffd23f', '#ff8fb8', '#9ff0a0'];
    const blades = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const bg = new THREE.Group(); bg.rotation.y = a; spin.add(bg);
      dBox(bg, 0, 0.0, 1.0 + R / 2, W, 0.3, R, cols[i % cols.length], { r: 0.14 });
      dBox(bg, 0, -0.05, 0.9, 0.5, 0.35, 1.0, '#ffffff', { r: 0.1 });
      const c = this.world.add({ type: 'box', moving: true, cx: x, cy: y + 0.15, cz: z, hx: W / 2, hy: 0.15, hz: R / 2, yaw: a, a0: a, R: 1.0 + R / 2 });
      blades.push(c);
    }
    bake(spin); bake(grp, false);
    // hub collider (stand on the hub too)
    const hc = this.world.add({ type: 'cyl', moving: true, cx: x, cz: z, cy: y, r: 0.95, minY: y - 0.55, maxY: y + 0.35 });
    this.scene.add(grp);
    this.movers.push({
      kind: 'fan', grp, spin, blades, hub: hc, speed: m.speed || 0.7, ang: 0,
      update(dt) {
        this.ang += this.speed * dt;
        spin.rotation.y = this.ang;
        for (const c of this.blades) {
          savePose(c);
          const a = c.a0 + this.ang;
          c.yaw = a; c.cx = x + Math.sin(a) * c.R; c.cz = z + Math.cos(a) * c.R;
          moved(c);
        }
        savePose(hc); hc.yaw = this.ang; moved(hc);
      },
    });
  }
  addTrain(m, b) {
    const [cx, y, cz] = m.center, rx = m.rx, rz = m.rz, speed = m.speed || 4.5, nCars = m.cars || 3;
    // track (static, merged)
    const steps = 64;
    for (let i = 0; i < steps; i++) {
      const a = i / steps * TAU, a2 = (i + 1) / steps * TAU;
      const x0 = cx + rx * Math.cos(a), z0 = cz + rz * Math.sin(a), x1 = cx + rx * Math.cos(a2), z1 = cz + rz * Math.sin(a2);
      const len = Math.hypot(x1 - x0, z1 - z0), yaw = Math.atan2(x1 - x0, z1 - z0) * 180 / Math.PI;
      b.push((x0 + x1) / 2, y, (z0 + z1) / 2, yaw);
      b.box(0, 0, 0, 3.2, 0.2, 0.5, '#8d5a33', { col: false, r: 0.05, cast: false });
      for (const sx of [-1, 1]) b.box(sx * 1.0, 0.2, 0, 0.22, 0.2, len + 0.05, '#9aa3b2', { col: false, r: 0.04, mat: 'gloss', cast: false });
      b.pop();
    }
    const cars = [];
    const carCols = m.colors || ['#e8473c', '#3f8fe8', '#ffd23f', '#5cc23a'];
    for (let k = 0; k <= nCars; k++) {
      const g = new THREE.Group();
      const loco = k === 0;
      const L = loco ? 4.2 : 3.6, W = 2.8, H = loco ? 2.0 : 1.6;
      dBox(g, 0, 0.35, 0, W, H, L, loco ? '#e8473c' : carCols[(k - 1) % carCols.length], { r: 0.3 });
      for (const sz of [-1, 1]) for (const sx of [-1, 1]) { const wh = dCyl(g, sx * 1.45, 0.55, sz * L * 0.3, 0.55, 0.3, '#2a2a33'); wh.rotation.z = Math.PI / 2; wh.position.y = 0.55; }
      if (loco) {
        dBox(g, 0, 2.35, -0.9, W - 0.2, 1.6, 1.8, '#2b3a7a', { r: 0.25 });
        dBox(g, 0, 3.9, -0.9, W + 0.3, 0.3, 2.2, '#e8473c', { r: 0.12 });
        dCyl(g, 0, 2.35, 1.2, 0.45, 1.3, '#2a2a33');
        dSphere(g, 0, 1.35, L / 2 + 0.05, 0.4, '#fff6b0', { mat: new THREE.MeshBasicMaterial({ color: '#fff6b0' }) });
        dCyl(g, 0, 0.35, L / 2, 1.0, 0.25, '#f6c445');
      } else {
        // a star painted on each car's side
        for (const sx of [-1, 1]) dSphere(g, sx * 1.42, 1.15, 0, 0.32, '#ffffff', { s: [0.3, 1, 1] });
      }
      bake(g);
      this.scene.add(g);
      const top = loco ? 4.2 : 1.95;
      const col = this.world.add({ type: 'box', moving: true, cx: cx + rx, cy: y + (top) / 2, cz: cz, hx: W / 2, hy: top / 2, hz: L / 2, yaw: 0 });
      cars.push({ g, col, L, off: k });
    }
    const spacing = 4.4;
    const self = this;
    this.movers.push({
      kind: 'train', cars, ang: m.start || 0, smoke: 0,
      update(dt) {
        const dl = (a) => Math.hypot(rx * Math.sin(a), rz * Math.cos(a));
        this.ang += speed / dl(this.ang) * dt * (m.dir || 1);
        for (const c of cars) {
          let a = this.ang;
          for (let s = 0; s < c.off * 4; s++) a -= (spacing / 4) / dl(a) * (m.dir || 1);
          const px = cx + rx * Math.cos(a), pz = cz + rz * Math.sin(a);
          const tx = -rx * Math.sin(a) * (m.dir || 1), tz = rz * Math.cos(a) * (m.dir || 1);
          const yaw = Math.atan2(tx, tz);
          c.g.position.set(px, y + 0.25, pz); c.g.rotation.y = yaw;
          savePose(c.col);
          c.col.cx = px; c.col.cz = pz; c.col.yaw = yaw; c.col.cy = y + 0.25 + c.col.hy;
          moved(c.col);
        }
        this.smoke -= dt;
        if (this.smoke <= 0) {
          this.smoke = 0.25;
          const l = cars[0].g;
          const p = new THREE.Vector3(0, 3.9, 1.2).applyMatrix4(l.matrixWorld);
          self.g.particles.emit(p.x, p.y, p.z, (Math.random() - 0.5), 2.5, (Math.random() - 0.5), '#ffffff', 0.9, 1.2, -0.5, 1);
        }
      },
    });
  }
  addLift(m) {
    const [w, h, d] = m.size || [4, 0.8, 4];
    const g = new THREE.Group();
    dBox(g, 0, -h, 0, w, h, d, m.color || '#ffd23f', { r: 0.2 });
    if (m.studs !== false) for (let i = 0; i < Math.floor(w / 1.4); i++) for (let j = 0; j < Math.floor(d / 1.4); j++) dCyl(g, -w / 2 + 0.7 + i * 1.4, 0, -d / 2 + 0.7 + j * 1.4, 0.4, 0.25, m.color || '#ffd23f');
    bake(g);
    this.scene.add(g);
    const A = v3(m.from), B = v3(m.to);
    const col = this.world.add({ type: 'box', moving: true, cx: A.x, cy: A.y - h / 2, cz: A.z, hx: w / 2, hy: h / 2, hz: d / 2, yaw: 0 });
    const period = m.period || 6, pause = m.pause || 1;
    let t = m.phase || 0;
    this.movers.push({
      kind: 'lift', g, col,
      update(dt) {
        t += dt;
        const cyc = period + pause * 2, u = (t % cyc);
        let k;
        if (u < pause) k = 0; else if (u < pause + period / 2) k = (u - pause) / (period / 2); else if (u < pause * 2 + period / 2) k = 1; else k = 1 - (u - pause * 2 - period / 2) / (period / 2);
        k = k * k * (3 - 2 * k);
        const p = A.clone().lerp(B, k);
        g.position.copy(p);
        savePose(col); col.cx = p.x; col.cy = p.y - h / 2; col.cz = p.z; moved(col);
      },
    });
  }
  addSpinner(m) {
    // a turning platform (e.g. a spinning toy top or record): box collider spins on its centre
    const [w, h, d] = m.size || [6, 0.8, 2];
    const g = new THREE.Group();
    dBox(g, 0, -h, 0, w, h, d, m.color || '#9b6cff', { r: 0.25 });
    dCyl(g, 0, -h - 0.6, 0, 0.5, 0.6, '#ffffff');
    const P = v3(m.pos);
    g.position.copy(P);
    this.scene.add(g);
    const col = this.world.add({ type: 'box', moving: true, cx: P.x, cy: P.y - h / 2, cz: P.z, hx: w / 2, hy: h / 2, hz: d / 2, yaw: 0 });
    let a = 0;
    this.movers.push({ kind: 'spinner', update(dt) { a += (m.speed || 1) * dt; g.rotation.y = a; savePose(col); col.yaw = a; moved(col); } });
  }

  // ---------------- pound boxes (ground-pound to open: candles burst out)
  addPoundBox(p, b) {
    const g = new THREE.Group();
    dBox(g, 0, 0, 0, 3.2, 2.2, 3.2, p.color || '#ff9a3c', { r: 0.3 });
    const lid = new THREE.Group(); lid.position.set(0, 2.2, -1.6); g.add(lid);
    dBox(lid, 0, 0, 1.6, 3.4, 0.5, 3.4, '#ffd23f', { r: 0.2 });
    dSphere(lid, 0, 0.55, 1.6, 0.55, '#e8473c', { s: [1, 0.6, 1] });
    bake(lid); bake(g, false);
    // "pound me" arrow (added after baking: it bobs on its own)
    const arr = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.8, 4), toyMat('#ffffff', 0.4)); arr.rotation.x = Math.PI; arr.position.set(0, 4.1, 0); g.add(arr);
    g.position.copy(v3(p.pos)); g.rotation.y = (p.yaw || 0) * Math.PI / 180;
    this.scene.add(g);
    const col = this.world.add({ type: 'box', cx: p.pos[0], cy: p.pos[1] + 1.35, cz: p.pos[2], hx: 1.6, hy: 1.35, hz: 1.6, yaw: g.rotation.y });
    this.poundBoxes.push({ def: p, g, lid, arr, col, open: false, p: v3(p.pos) });
  }
  updateBoxes(dt, t) {
    for (const bx of this.poundBoxes) {
      if (!bx.open) { bx.arr.position.y = 4.1 + Math.sin(t * 5) * 0.25; bx.arr.rotation.y = t * 2; }
      else if (bx.lid.rotation.x > -2.0) bx.lid.rotation.x -= dt * 9;
    }
  }
  pounded(pos) {
    // shockwave: bop enemies, open boxes
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (Math.hypot(e.pos.x - pos.x, e.pos.z - pos.z) < 3.4 && Math.abs(e.pos.y - pos.y) < 1.6) takeHit(this, e, 'pound');
    }
    if (this.boss) this.boss.pounded(pos);
    for (const bx of this.poundBoxes) {
      if (bx.open) continue;
      if (Math.hypot(bx.p.x - pos.x, bx.p.z - pos.z) < 2.2 && pos.y > bx.p.y + 1.5 && pos.y < bx.p.y + 3.5) {
        bx.open = true; bx.arr.visible = false;
        this.g.sfx('open');
        this.g.particles.confetti(new THREE.Vector3(bx.p.x, bx.p.y + 3, bx.p.z), 30);
        const n = bx.def.candles || 6;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * TAU;
          this.spawnCandle(bx.p.x + Math.cos(a) * 3.2, bx.p.y + 3, bx.p.z + Math.sin(a) * 3.2, 10 + Math.random() * 3);
        }
        if (bx.def.message) this.g.hud.toast(bx.def.message);
      }
    }
  }

  // ---------------- hints (Glitchy speech bubble)
  updateHints(t, pp) {
    for (const h of this.hints) {
      const d = Math.hypot(pp.x - h.p.x, pp.z - h.p.z), inY = Math.abs(pp.y - h.p.y) < (h.dy || 4);
      const inside = d < (h.r || 4) && inY;
      if (inside && !h.inside && t - h.shownAt > (h.again || 30)) { h.shownAt = t; this.g.hint(h.text, h.camDone ? null : h.cam); h.camDone = true; }
      h.inside = inside;
    }
  }

  updateMovers(dt) { for (const m of this.movers) m.update(dt); }

  // hide far-away / other-floor entities (saves draw calls on iPad)
  cull(pp) {
    const vis = (p, R = 80) => { const dx = p.x - pp.x, dz = p.z - pp.z; return Math.abs(p.y - pp.y) < 15 && dx * dx + dz * dz < R * R; };
    for (const e of this.enemies) { if (!e.alive) continue; const v = vis(e.pos); e.hidden = !v; e.grp.visible = v; if (!v) e.blob.visible = false; }
    for (const a of this.pets) { const v = a.follow || vis(a.pos); a.grp.visible = v; if (!v) a.blob.visible = false; }
    for (const c of this.checkpoints) c.grp.visible = vis(c.p, 90);
    for (const bx of this.poundBoxes) bx.g.visible = vis(bx.p);
    this.boxes.cull(vis);
    for (const m of this.movers) if (m.kind === 'train') { const v = pp.y < 2 && pp.y > -14 && Math.abs(pp.x) < 30 && Math.abs(pp.z) < 22; m.cars.forEach((c) => { c.g.visible = v; }); }
  }

  get stats() { return this.g.stats; }
  update(dt, t, pl, cam) {
    this.time = t;
    this.cullT = (this.cullT || 0) - dt;
    if (this.cullT <= 0) { this.cullT = 0.25; this.cull(pl.pos); }
    this.updateCandles(dt, t, pl.pos);
    this.updateStars(dt, t, pl.pos, cam);
    this.updateEnemies(dt, pl);
    this.updateCheckpoints(dt, t, pl.pos);
    this.updateGoal(dt, t, pl.pos);
    this.updatePets(dt, pl);
    this.updateBoxes(dt, t);
    this.boxes.update(dt, t, pl);
    if (this.boss) this.boss.update(dt, pl);
    for (const s of this.pawSpots) s.ring.material.opacity = 0.35 + Math.sin(t * 4) * 0.2;
    this.updateHints(t, pl.pos);
  }
}

// ------------------------------------------------------------------ character builders
function buildSock(grp, color) {
  const body = new THREE.Group(); grp.add(body);
  const white = toyMat(color || '#fbfbf7', 0.85);
  const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.58, 1.0, 6, 16), white); leg.position.set(0, 1.25, 0); body.add(leg);
  const foot = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 0.75, 6, 14), white); foot.rotation.x = Math.PI / 2; foot.position.set(0, 0.5, 0.35); body.add(foot);
  dSphere(body, 0, 0.5, 1.05, 0.42, '#e86a8a', { s: [1, 0.85, 0.6] });
  dSphere(body, 0, 0.62, -0.35, 0.44, '#e86a8a', { s: [1, 0.9, 0.6] });
  dCyl(body, 0, 1.9, 0, 0.62, 0.22, '#e8473c'); dCyl(body, 0, 2.12, 0, 0.62, 0.2, '#3f8fe8');
  dCyl(body, 0, 2.3, 0, 0.6, 0.12, '#fbfbf7');
  const ew = toyMat('#ffffff', 0.2), ep = toyMat('#1b1220', 0.2);
  for (const sx of [-1, 1]) { dSphere(body, sx * 0.24, 1.45, 0.5, 0.22, null, { mat: ew, s: [1, 1.2, 0.6] }); dSphere(body, sx * 0.22, 1.43, 0.62, 0.11, null, { mat: ep, s: [1, 1.2, 0.6] }); dSphere(body, sx * 0.2, 1.5, 0.69, 0.035, null, { mat: ew }); }
  const mouth = dSphere(body, 0, 1.12, 0.56, 0.12, '#5a1a22', { s: [1.3, 0.6, 0.5] });
  dSphere(body, -0.38, 1.2, 0.48, 0.09, '#ff9ab0', { s: [1, 0.6, 0.5] }); dSphere(body, 0.38, 1.2, 0.48, 0.09, '#ff9ab0', { s: [1, 0.6, 0.5] });
  return { body };
}
function buildBrickEnemy(grp, color) {
  const body = new THREE.Group(); body.position.y = 0.45; grp.add(body);
  const m = toyMat(color, 0.3, { envMapIntensity: 0.9 });
  const blk = new THREE.Mesh(roundedBoxGeo(2.2, 1.5, 1.7, 0.22, 2), m); blk.position.y = 0.75; body.add(blk);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.3, 14), m); s.position.set(sx * 0.55, 1.6, sz * 0.42); body.add(s); }
  const ew = toyMat('#ffffff', 0.2), ep = toyMat('#1b1220', 0.2);
  for (const sx of [-1, 1]) {
    dSphere(body, sx * 0.45, 0.85, 0.82, 0.28, null, { mat: ew, s: [1, 1.1, 0.5] });
    dSphere(body, sx * 0.42, 0.8, 0.94, 0.13, null, { mat: ep, s: [1, 1.1, 0.5] });
    const brow = dBox(body, sx * 0.45, 1.12, 0.86, 0.6, 0.14, 0.12, '#1b1220', { r: 0.05 }); brow.rotation.z = sx * -0.35;
  }
  dBox(body, 0, 0.35, 0.86, 0.6, 0.12, 0.1, '#5a1a22', { r: 0.05 });
  const feet = [];
  for (const sx of [-1, 1]) { const f = new THREE.Group(); f.position.set(sx * 0.6, 0.0, 0); grp.add(f); dSphere(f, 0, 0.22, 0.15, 0.3, '#2a2a33', { s: [1, 0.7, 1.4] }); feet.push(f); }
  // "!" alert mark
  const mark = new THREE.Group(); mark.position.set(0, 3.0, 0); grp.add(mark);
  dBox(mark, 0, 0.35, 0, 0.25, 0.8, 0.25, '#ffd23f', { r: 0.1 }); dSphere(mark, 0, 0.12, 0, 0.15, '#ffd23f');
  mark.visible = false;
  return { body, feet, mark };
}
// The approved pet models (worlds/w12_assets/pet_<id>.glb, the same files as the World 12 map), at the map's size next to
// Kinan. The model has head + tail pivots (Cat_head / Cat_tail or Dog_*); here each leg (with its paw, and Hunter's
// sock) gets a hip pivot too, so the pets walk with real steps. Faces +Z, feet at y=0.
export const PET_SCALE = { cat: 1.3, dog: 1.15 };
function buildPetModel(grp, scene, kind) {
  const K = kind === 'dog' ? 'Dog' : 'Cat';
  const root = scene.children.find((o) => o.getObjectByName(K + '_head')) || scene;
  const tris = countTris(scene);
  // leg pivots: <name>_leg<x><z>, _paw<x><z>, _sock<x><z> share the <x><z> suffix (+-1)
  const groups = new Map();
  for (const o of [...root.children]) {
    const m = /_(leg|paw|sock)(-?1)(-?1)$/.exec(o.name);
    if (!m) continue;
    const key = m[2] + m[3];
    if (!groups.has(key)) groups.set(key, { leg: null, all: [] });
    const gr = groups.get(key); gr.all.push(o); if (m[1] === 'leg') gr.leg = o;
  }
  const legs = [];
  for (const [key, gr] of groups) {
    if (!gr.leg || !gr.leg.geometry) continue;
    gr.leg.updateMatrix(); gr.leg.geometry.computeBoundingBox();
    const bb = gr.leg.geometry.boundingBox.clone().applyMatrix4(gr.leg.matrix);
    const hip = new THREE.Group(); hip.name = K + '_leg' + key;
    hip.position.set((bb.min.x + bb.max.x) / 2, bb.max.y, (bb.min.z + bb.max.z) / 2);
    root.add(hip);
    for (const o of gr.all) { o.position.sub(hip.position); hip.add(o); }
    legs.push(hip);
  }
  // same order as the blocky pets: front left, front right, back left, back right (gait phases rely on it)
  legs.sort((a, b) => (b.position.z > 0) - (a.position.z > 0) || a.position.x - b.position.x);
  // where the nose, eyes and face markings sit in the model (before merging), so a test can check e.g. which eye
  // Chikastino's dark ring is on
  scene.updateMatrixWorld(true);
  const centre = (o) => new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()).toArray().map((v) => +v.toFixed(3));
  const anat = { nose: null, eyes: [], marks: [] };
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (/_nose$/.test(o.name)) anat.nose = centre(o);
    else if (/_eyew\d+$/.test(o.name)) anat.eyes.push(centre(o));
    else if (/_mark\d*$/.test(o.name)) anat.marks.push({ name: o.name, c: centre(o) });
  });
  scene.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = false; o.receiveShadow = false;
    const m = o.material;
    if (m && m.isMeshStandardMaterial) { m.envMapIntensity = 0.55; m.roughness = Math.max(0.28, m.roughness); m.metalness = 0; }
  });
  mergeByNode(scene);
  const inner = new THREE.Group(); inner.name = 'petModel';
  inner.scale.setScalar(PET_SCALE[kind]);
  inner.add(scene); grp.add(inner);
  const box = new THREE.Box3().setFromObject(inner);
  const size = box.getSize(new THREE.Vector3());
  return {
    legs, inner, tris, name: root.name, anat,
    head: scene.getObjectByName(K + '_head') || new THREE.Group(),
    tail: scene.getObjectByName(K + '_tail') || new THREE.Group(),
    h: box.max.y, foot: Math.max(1.0, Math.max(size.x, size.z) * 1.25),
  };
}
function buildCat(grp, color, shade) {
  const o = color || '#d98a3d', o2 = shade || '#a85f22';
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.9, 6, 14), toyMat(o, 0.8)); body.rotation.x = Math.PI / 2; body.position.y = 0.85; grp.add(body);
  for (let i = 0; i < 3; i++) dBox(grp, 0, 1.15, -0.4 + i * 0.4, 0.5, 0.12, 0.14, o2, { r: 0.05 });
  const head = new THREE.Group(); head.position.set(0, 1.35, 0.75); grp.add(head);
  dSphere(head, 0, 0, 0, 0.48, o, { s: [1.1, 1, 1] });
  dSphere(head, 0, -0.12, 0.33, 0.24, '#ffffff', { s: [1.2, 0.8, 0.7] });
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.35, 4), toyMat(o, 0.8)); ear.position.set(sx * 0.27, 0.42, 0); ear.rotation.z = sx * -0.3; head.add(ear);
    dSphere(head, sx * 0.17, 0.08, 0.38, 0.1, '#1b1220', { s: [1, 1.3, 0.6] });
    dSphere(head, sx * 0.15, 0.12, 0.45, 0.03, '#ffffff');
  }
  dSphere(head, 0, -0.04, 0.48, 0.06, '#ff7aa0');
  const legs = [];
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const l = new THREE.Group(); l.position.set(sx * 0.25, 0.6, sz * 0.45); grp.add(l); dCyl(l, 0, -0.6, 0, 0.13, 0.6, o); dSphere(l, 0, -0.58, 0.04, 0.15, '#ffffff', { s: [1, 0.7, 1.2] }); legs.push(l); }
  const tail = new THREE.Group(); tail.position.set(0, 1.0, -0.85); grp.add(tail);
  for (let i = 0; i < 5; i++) dSphere(tail, 0, i * 0.2, -i * 0.12, 0.12, i === 4 ? '#ffffff' : o);
  return { legs, tail, head };
}
function buildDog(grp, color, shade) {
  const w = color || '#f0e2c8', br = shade || '#a8692e';
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.6, 1.3, 6, 14), toyMat(w, 0.8)); body.rotation.x = Math.PI / 2; body.position.y = 1.15; grp.add(body);
  dSphere(grp, 0.3, 1.45, -0.3, 0.42, br, { s: [0.8, 0.6, 1] });
  const head = new THREE.Group(); head.position.set(0, 1.85, 1.05); grp.add(head);
  dSphere(head, 0, 0, 0, 0.62, w);
  dSphere(head, 0.22, 0.15, 0.2, 0.32, br, { s: [1, 1, 0.8] });
  dSphere(head, 0, -0.18, 0.5, 0.32, w, { s: [1, 0.8, 1] });
  dSphere(head, 0, -0.08, 0.8, 0.12, '#1b1220');
  const tongue = dSphere(head, 0, -0.38, 0.62, 0.12, '#ff7aa0', { s: [1, 0.4, 1.3] });
  for (const sx of [-1, 1]) {
    const ear = dSphere(head, sx * 0.55, -0.05, -0.05, 0.25, br, { s: [0.5, 1.3, 0.9] }); ear.rotation.z = sx * 0.3;
    dSphere(head, sx * 0.22, 0.12, 0.52, 0.1, '#1b1220', { s: [1, 1.2, 0.6] });
    dSphere(head, sx * 0.2, 0.16, 0.6, 0.035, '#ffffff');
  }
  const legs = [];
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const l = new THREE.Group(); l.position.set(sx * 0.35, 0.8, sz * 0.6); grp.add(l); dCyl(l, 0, -0.8, 0, 0.17, 0.8, sz < 0 && sx > 0 ? br : w); legs.push(l); }
  const tail = new THREE.Group(); tail.position.set(0, 1.45, -1.15); grp.add(tail);
  const tt = dCyl(tail, 0, 0, -0.2, 0.1, 0.7, br); tt.rotation.x = -0.8;
  return { legs, tail, head };
}

function makeLabel(text) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const x = c.getContext('2d');
  x.fillStyle = 'rgba(20,22,50,.82)'; x.beginPath(); x.roundRect ? x.roundRect(4, 8, 248, 48, 16) : x.rect(4, 8, 248, 48); x.fill();
  x.font = "700 30px 'Pixelify Sans', monospace"; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#f6c445'; x.fillText(text, 128, 33);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true }));
  s.scale.set(2.4, 0.6, 1);
  return s;
}

let _halo = null;
function haloTex() {
  if (_halo) return _halo;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,240,150,0.85)'); g.addColorStop(0.35, 'rgba(255,210,80,0.35)'); g.addColorStop(1, 'rgba(255,200,60,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  _halo = new THREE.CanvasTexture(c);
  return _halo;
}

function roundCyl(r, h) { const g = new THREE.CylinderGeometry(r, r, h, 20, 1); return g; }

function mergeSimple(geoms) {
  // tiny merge for a few non-indexed-compatible geometries (position, normal, color)
  let total = 0; const idx = [];
  const P = [], N = [], C = [];
  for (const g of geoms) {
    const gi = g.index ? g : g;
    const pos = gi.attributes.position, nor = gi.attributes.normal, col = gi.attributes.color;
    const base = total;
    for (let i = 0; i < pos.count; i++) { P.push(pos.getX(i), pos.getY(i), pos.getZ(i)); N.push(nor.getX(i), nor.getY(i), nor.getZ(i)); C.push(col.getX(i), col.getY(i), col.getZ(i)); }
    if (gi.index) for (let i = 0; i < gi.index.count; i++) idx.push(gi.index.getX(i) + base);
    else for (let i = 0; i < pos.count; i++) idx.push(i + base);
    total += pos.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  out.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  out.setIndex(idx);
  return out;
}

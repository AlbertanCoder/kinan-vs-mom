// 3D Kinan + Glitchy.
// Kinan is the approved "braid1" model (one braid down his back with a red tie), the same file the World 12 map uses:
// worlds/w12_assets/kinan.glb, or its packed copy in assets/models.js where .glb files cannot be served (see models.js).
// Pivots: Kinan_hip-1/1 (legs), Kinan_sh-1/1 (shoulders), Kinan_el-1/1 (elbows), Kinan_head (head + hair). The braid
// gets its own pivot here (Kinan_braid) so it hangs and swings on its own instead of tilting into his back with the head.
// Only if both copies fail, a procedural chunky Kinan with the same pivot names is built (last resort).
// Kinan faces +Z, feet at y=0, about 2.0 units tall.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { damp, clamp } from './util.js';
import { loadModel } from './models.js';

const C = {
  skin: '#d9a27a', skin2: '#c98d66', hair: '#4a2c1a', streak: '#b88a3e', shirt: '#c2414f', shirt2: '#a8333f',
  star: '#f6c445', jeans: '#3f63a8', jeans2: '#5679bd', shoe: '#2a2a33', sole: '#f2efe8', eyew: '#ffffff', iris: '#5a3a1e',
  pupil: '#141018', cheek: '#ee8a7a', mouth: '#5a1a22', accent: '#e8473c',
};

export function countTris(root) {
  let n = 0;
  root.traverse((o) => { if (o.isMesh && o.geometry) n += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; });
  return Math.round(n);
}

// url: the real kinan.glb; null = skip the model and use the procedural Kinan (?kinan=procedural)
export async function makeKinan(url, envMap) {
  if (url) {
    const got = await loadModel('kinan', url);
    if (got) {
      const scene = got.gltf.scene;
      const need = ['Kinan_hip-1', 'Kinan_hip1', 'Kinan_sh-1', 'Kinan_sh1', 'Kinan_head'];
      if (need.every((n) => scene.getObjectByName(n))) {
        const tris = countTris(scene);
        scene.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = false; o.receiveShadow = false;
            const m = o.material;
            if (m && m.isMeshStandardMaterial) { m.envMapIntensity = 0.55; m.roughness = Math.max(0.35, m.roughness); m.metalness = 0; }
          }
        });
        const braid = makeBraidPivot(scene);
        mergeByNode(scene);
        const holder = new THREE.Group();
        holder.add(scene);
        return { model: holder, source: got.from, tris, braid: !!braid, name: (scene.getObjectByName('Kinan') || scene).name };
      }
      console.warn('kinan model is missing walk pivots; using procedural Kinan');
    }
  }
  const model = proceduralKinan();
  return { model, source: 'procedural', tris: countTris(model), braid: false, name: 'Kinan' };
}

// His BLACK belt (earned before Glitchy's Last Stand): a band round the waist, a knot at the front, two tails.
// Goes on the model itself, not a limb, so it stays on his waist whatever the legs and arms do.
export function addBlackBelt(model) {
  const hip = model.getObjectByName('Kinan_hip1') || model.getObjectByName('Kinan_hip-1');
  model.updateMatrixWorld(true);
  const p = new THREE.Vector3();
  if (hip) { hip.getWorldPosition(p); model.worldToLocal(p); } else p.y = 0.74;
  const black = mat('#17171f', 0.55), g = new THREE.Group();
  g.name = 'Kinan_belt';
  g.position.y = p.y + 0.09;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.335, 0.335, 0.11, 28, 1, true), black);
  band.material.side = THREE.DoubleSide;
  band.scale.set(1, 1, 0.8);
  g.add(band);
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), black);
  knot.scale.set(1.25, 0.9, 0.7); knot.position.set(0, 0, 0.275);
  g.add(knot);
  for (const sx of [-1, 1]) {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.28, 0.03), black);
    tail.position.set(sx * 0.075, -0.15, 0.285); tail.rotation.z = sx * 0.2;
    g.add(tail);
  }
  model.add(g);
  return g;
}

// Move the braid (Kinan_braid_lobe0..7, _tie, _tip) under a new pivot at its root, the nape of his neck.
function makeBraidPivot(scene) {
  const head = scene.getObjectByName('Kinan_head');
  if (!head) return null;
  const parts = head.children.filter((o) => /^Kinan_braid_/.test(o.name));
  if (!parts.length) return null;
  const top = parts.reduce((a, o) => (o.position.y > a.position.y ? o : a), parts[0]);
  const piv = new THREE.Group();
  piv.name = 'Kinan_braid';
  piv.position.set(0, top.position.y + 0.03, top.position.z + 0.01);
  head.add(piv);
  for (const o of parts) { o.position.sub(piv.position); piv.add(o); }
  return piv;
}

// Merge sibling meshes that share a material under each node (keeps the limb pivots, cuts draw calls ~3x).
export function mergeByNode(root) {
  const nodes = [];
  root.traverse((o) => nodes.push(o));
  for (const n of nodes) {
    const byMat = new Map();
    for (const c of n.children) {
      if (!c.isMesh || c.children.length || !c.geometry) continue;
      const k = c.material.uuid;
      if (!byMat.has(k)) byMat.set(k, []);
      byMat.get(k).push(c);
    }
    for (const [, list] of byMat) {
      if (list.length < 2) continue;
      const geos = list.map((m) => {
        m.updateMatrix();
        const g = m.geometry.clone();
        for (const a of Object.keys(g.attributes)) if (a !== 'position' && a !== 'normal' && !(a === 'color' && m.material.vertexColors)) g.deleteAttribute(a);
        if (!g.index) { const idx = []; for (let i = 0; i < g.attributes.position.count; i++) idx.push(i); g.setIndex(idx); }
        return g.applyMatrix4(m.matrix);
      });
      const merged = mergeGeometries(geos, false);
      if (!merged) continue;
      const mesh = new THREE.Mesh(merged, list[0].material);
      mesh.castShadow = false;
      n.add(mesh);
      for (const m of list) n.remove(m);
    }
  }
}

// ------------------------------------------------------------------ procedural fallback
function mat(c, rough = 0.6) { return new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0, envMapIntensity: 0.5 }); }
function capsule(r, len, m) { const g = new THREE.CapsuleGeometry(r, len, 6, 14); return new THREE.Mesh(g, m); }
function sph(r, m, s = [1, 1, 1], seg = 20) { const me = new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg >> 1), m); me.scale.set(...s); return me; }

export function proceduralKinan() {
  const M = {}; for (const [k, v] of Object.entries(C)) M[k] = mat(v, k === 'eyew' || k === 'pupil' ? 0.25 : 0.62);
  const root = new THREE.Group(); root.name = 'Kinan';
  const add = (p, o, x, y, z) => { o.position.set(x, y, z); p.add(o); return o; };
  // legs
  for (const sx of [-1, 1]) {
    const hip = new THREE.Group(); hip.name = 'Kinan_hip' + sx; add(root, hip, 0.125 * sx, 0.74, 0);
    add(hip, capsule(0.11, 0.42, M.jeans), 0, -0.3, 0);
    add(hip, new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.12, 0.09, 16), M.jeans2), 0, -0.53, 0);
    const shoe = add(hip, new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.16, 4, 12), M.shoe), 0, -0.64, 0.05); shoe.rotation.x = Math.PI / 2; shoe.scale.set(1, 1, 0.75);
    const sole = add(hip, new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.36), M.sole), 0, -0.71, 0.05);
    add(hip, new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.05, 0.08), M.accent), 0, -0.62, -0.03);
  }
  add(root, new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.08, 4, 16), M.jeans), 0, 0.74, 0).scale.set(1.15, 0.8, 0.85);
  const torso = add(root, new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.32, 6, 18), M.shirt), 0, 1.0, 0); torso.scale.set(1.05, 1, 0.82);
  // star on chest
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.045 : 0.105; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? shape.lineTo(x, y) : shape.moveTo(x, y); }
  const starG = new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 2 });
  add(root, new THREE.Mesh(starG, M.star), 0, 1.04, 0.19);
  add(root, new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.14, 14), M.skin), 0, 1.3, 0);
  // head
  const head = new THREE.Group(); head.name = 'Kinan_head'; add(root, head, 0, 1.31, 0);
  add(head, sph(0.37, M.skin, [1, 0.97, 0.98], 32), 0, 0.34, 0);
  add(head, sph(0.28, M.skin, [1.05, 0.8, 0.95]), 0, 0.2, 0.05);
  for (const sx of [-1, 1]) {
    add(head, sph(0.075, M.skin, [0.55, 0.9, 1.1]), sx * 0.355, 0.31, 0);
    add(head, sph(0.09, M.eyew, [1, 1.25, 0.55]), sx * 0.13, 0.37, 0.31);
    add(head, sph(0.06, M.iris, [1, 1.25, 0.5]), sx * 0.128, 0.36, 0.345);
    add(head, sph(0.035, M.pupil, [1, 1.25, 0.5]), sx * 0.126, 0.36, 0.365);
    add(head, sph(0.017, M.eyew, [1, 1, 0.6]), sx * 0.11, 0.39, 0.375);
    add(head, sph(0.055, M.cheek, [1.1, 0.7, 0.4]), sx * 0.22, 0.26, 0.29);
    const brow = add(head, new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.08, 4, 8), M.hair), sx * 0.13, 0.5, 0.33); brow.rotation.z = Math.PI / 2 + sx * 0.15;
  }
  add(head, sph(0.04, M.skin2), 0, 0.3, 0.37);
  const mouth = add(head, sph(0.06, M.mouth, [1.3, 0.55, 0.4]), 0, 0.19, 0.33);
  // hair: cap + chunky tufts + tan streak
  add(head, sph(0.385, M.hair, [1.02, 0.78, 1.02], 28), 0, 0.46, -0.03);
  const tuft = (x, y, z, rx, rz, l, m = M.hair) => { const c = new THREE.Mesh(new THREE.ConeGeometry(0.08, l, 8), m); c.position.set(x, y, z); c.rotation.set(rx, 0, rz); head.add(c); };
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; tuft(Math.cos(a) * 0.2, 0.7, Math.sin(a) * 0.2 - 0.02, Math.sin(a) * 0.6, -Math.cos(a) * 0.6, 0.24); }
  for (let i = 0; i < 5; i++) tuft(-0.2 + i * 0.1, 0.6, 0.3, 1.1, 0, 0.16);
  tuft(0.02, 0.8, 0.02, 0.1, -0.25, 0.3, mat(C.streak));
  // arms
  for (const sx of [-1, 1]) {
    const sh = new THREE.Group(); sh.name = 'Kinan_sh' + sx; add(root, sh, 0.285 * sx, 1.19, 0); sh.rotation.z = 0.17 * sx;
    add(sh, sph(0.115, M.shirt, [1, 1.1, 1]), 0, -0.04, 0);
    add(sh, capsule(0.068, 0.18, M.skin), 0, -0.17, 0);
    const el = new THREE.Group(); el.name = 'Kinan_el' + sx; add(sh, el, 0, -0.29, 0);
    add(el, capsule(0.066, 0.15, M.skin), 0, -0.11, 0);
    const wr = new THREE.Group(); wr.name = 'Kinan_wr' + sx; add(el, wr, 0, -0.25, 0);
    add(wr, sph(0.09, M.skin, [1, 0.95, 1]), 0, -0.04, 0);
  }
  root.traverse((o) => { if (o.isMesh) { o.castShadow = false; } });
  const holder = new THREE.Group(); holder.add(root);
  return holder;
}

// ------------------------------------------------------------------ rig / animation
const PIVOTS = { hipL: 'Kinan_hip-1', hipR: 'Kinan_hip1', shL: 'Kinan_sh-1', shR: 'Kinan_sh1', elL: 'Kinan_el-1', elR: 'Kinan_el1', head: 'Kinan_head' };
export class KinanRig {
  constructor(model) {
    this.p = {}; this.q0 = {}; this.cur = {};
    for (const [k, n] of Object.entries(PIVOTS)) {
      const o = model.getObjectByName(n);
      if (!o) continue;
      this.p[k] = o; this.q0[k] = o.quaternion.clone(); this.cur[k] = new THREE.Vector3();
    }
    this._e = new THREE.Euler(); this._q = new THREE.Quaternion();
    this.phase = 0; this.t = 0;
    // the braid: a damped spring. bA = swing away from his back (0 = hanging against it, never into it), bS = side sway
    this.braid = model.getObjectByName('Kinan_braid');
    this.bA = 0.06; this.bV = 0; this.bS = 0; this.bSV = 0;
    this._qb = new THREE.Quaternion(); this._qs = new THREE.Quaternion();
    this._ax = new THREE.Vector3(1, 0, 0); this._az = new THREE.Vector3(0, 0, 1);
  }
  // how far the braid swings out behind him for each pose (radians), before the spring
  braidTarget(s) {
    const vy = s.vy || 0, sp = Math.min(1.4, s.speed || 0);
    const fallLift = clamp(-vy * 0.055, 0, 1.3);
    switch (s.mode) {
      case 'walk': case 'carry': return 0.08 + 0.12 * sp;
      case 'run': return 0.42;
      case 'slide': return 0.55;
      case 'jump': return 0.04;
      case 'fall': case 'carryAir': return 0.25 + fallLift;
      case 'flip': case 'tuck': return 1.25;
      case 'pound': return 0.5 + clamp(-vy * 0.06, 0, 1.6);
      case 'land': case 'skid': return 0;
      case 'hurt': return 0.75 + Math.sin(this.t * 20) * 0.25;
      case 'cheer': return 0.15 + Math.abs(Math.sin(this.t * 6)) * 0.25;
      case 'wallslide': return 0.3 + fallLift * 0.5;
      case 'hang': case 'climb': case 'climbIdle': return 0.05;
      case 'climbup': return 0.2;
      case 'throw': return 0.3;
      case 'float': return 0.12;
      default: return 0.06;
    }
  }
  updateBraid(s, dt) {
    const k = 95, d = 8.5;
    this.bV += (k * (this.braidTarget(s) - this.bA) - d * this.bV) * dt;
    this.bA += this.bV * dt;
    if (this.bA < 0) { this.bA = 0; if (this.bV < 0) this.bV *= -0.25; }   // it bumps his back, it does not go through
    if (this.bA > 2.3) { this.bA = 2.3; if (this.bV > 0) this.bV = 0; }
    const moving = s.mode === 'walk' || s.mode === 'run' || s.mode === 'carry';
    const sway = moving ? Math.sin(this.phase) * 0.1 * Math.min(1, s.speed || 0) : 0;
    this.bSV += (60 * (sway - this.bS) - 7 * this.bSV) * dt; this.bS += this.bSV * dt;
    // keep it hanging from the nape in his body's frame: undo the head's own turn, then swing
    const hq = this.p.head ? this.p.head.quaternion : this._q.identity();
    this.braid.quaternion.copy(hq).invert()
      .multiply(this._qb.setFromAxisAngle(this._ax, this.bA))
      .multiply(this._qs.setFromAxisAngle(this._az, this.bS));
  }
  // s = {mode, speed (0..1+), dt, look (head yaw), vy (his vertical speed, for the braid)}
  update(s) {
    const dt = s.dt; this.t += dt;
    const T = {};
    const set = (k, x = 0, y = 0, z = 0) => { T[k] = [x, y, z]; };
    for (const k of Object.keys(this.p)) set(k);
    let rate = 14;
    const t = this.t;
    switch (s.mode) {
      case 'walk': case 'run': {
        const run = s.mode === 'run';
        this.phase += dt * (run ? 13.5 : 4 + 8 * s.speed);
        const w = Math.sin(this.phase);
        const A = run ? 0.95 : 0.25 + 0.5 * s.speed, Aa = run ? 1.1 : 0.25 + 0.5 * s.speed;
        set('hipL', -w * A); set('hipR', w * A);
        set('shL', w * Aa, 0, -0.12); set('shR', -w * Aa, 0, 0.12);
        set('elL', run ? -1.3 : -0.35 - 0.3 * s.speed); set('elR', run ? -1.3 : -0.35 - 0.3 * s.speed);
        set('head', run ? 0.1 : 0.03, s.look || 0, Math.sin(this.phase) * 0.04);
        rate = 18;
        break;
      }
      case 'jump': {
        set('hipL', -0.85); set('hipR', 0.45);
        set('shR', -2.7, 0, 0.25); set('shL', 0.7, 0, -0.35);
        set('elR', -0.2); set('elL', -0.6);
        set('head', -0.15, s.look || 0);
        rate = 20; break;
      }
      case 'fall': {
        const f = Math.sin(t * 16) * 0.15;
        set('hipL', -0.35 + f); set('hipR', 0.3 - f);
        set('shL', -0.2, 0, -1.35 - f); set('shR', -0.2, 0, 1.35 + f);
        set('elL', -0.4); set('elR', -0.4);
        set('head', 0.1, s.look || 0);
        rate = 10; break;
      }
      case 'flip': case 'tuck': {
        set('hipL', -1.5); set('hipR', -1.5);
        set('shL', -1.2, 0, -0.3); set('shR', -1.2, 0, 0.3);
        set('elL', -1.6); set('elR', -1.6);
        set('head', 0.3);
        rate = 24; break;
      }
      case 'pound': {
        set('hipL', 0.1); set('hipR', -0.1);
        set('shL', 0, 0, -2.75); set('shR', 0, 0, 2.75);
        set('elL', -0.2); set('elR', -0.2);
        set('head', 0.25);
        rate = 30; break;
      }
      case 'land': {
        set('hipL', -0.25); set('hipR', 0.2);
        set('shL', 0.2, 0, -0.6); set('shR', 0.2, 0, 0.6);
        set('elL', -0.5); set('elR', -0.5);
        set('head', 0.2);
        rate = 25; break;
      }
      case 'hurt': {
        const f = Math.sin(t * 20) * 0.3;
        set('hipL', -0.5 + f); set('hipR', 0.4 - f);
        set('shL', -2.2, 0, -0.6); set('shR', -2.2, 0, 0.6);
        set('head', -0.35);
        rate = 20; break;
      }
      case 'cheer': {
        const b = Math.abs(Math.sin(t * 6));
        set('shL', 0, 0, -2.75 + b * 0.2); set('shR', 0, 0, 2.75 - b * 0.2);
        set('elL', -0.25); set('elR', -0.25);
        set('hipL', -0.15); set('hipR', 0.15);
        set('head', -0.2, Math.sin(t * 3) * 0.2);
        rate = 12; break;
      }
      case 'slide': {
        set('hipL', -1.35); set('hipR', -1.45);
        set('shL', -0.4, 0, -1.9); set('shR', -0.4, 0, 1.9);
        set('elL', -0.3); set('elR', -0.3);
        set('head', -0.25);
        rate = 16; break;
      }
      case 'skid': {
        set('hipL', -0.7); set('hipR', 0.2);
        set('shL', -0.8, 0, -0.9); set('shR', -0.8, 0, 0.9);
        set('head', -0.2);
        rate = 20; break;
      }
      case 'hang': {   // hanging from a ledge: arms up, legs dangling
        const sw = Math.sin(t * 3) * 0.08;
        set('shL', -2.9, 0, -0.2); set('shR', -2.9, 0, 0.2); set('elL', -0.15); set('elR', -0.15);
        set('hipL', 0.1 + sw); set('hipR', -0.05 - sw); set('head', -0.25);
        rate = 16; break;
      }
      case 'climbup': {
        set('shL', -1.4, 0, -0.3); set('shR', -1.4, 0, 0.3); set('elL', -1.6); set('elR', -1.6);
        set('hipL', -1.3); set('hipR', -0.4); set('head', 0.15);
        rate = 20; break;
      }
      case 'climb': case 'climbIdle': {   // climbing a shelf: hand over hand
        const c = s.mode === 'climb' ? Math.sin(t * 9) : 0;
        set('shL', -2.5 + c * 0.45, 0, -0.25); set('shR', -2.5 - c * 0.45, 0, 0.25); set('elL', -0.6 - c * 0.3); set('elR', -0.6 + c * 0.3);
        set('hipL', -0.7 - c * 0.4); set('hipR', -0.7 + c * 0.4); set('head', -0.2);
        rate = 16; break;
      }
      case 'wallslide': {
        set('shL', -2.2, 0, -0.6); set('shR', -2.2, 0, 0.6); set('elL', -0.5); set('elR', -0.5);
        set('hipL', -0.6); set('hipR', 0.1); set('head', 0.2);
        rate = 18; break;
      }
      case 'push': case 'pull': {
        const w = Math.sin(t * (s.mode === 'push' ? 7 : 6));
        set('shL', -1.45, 0, -0.1); set('shR', -1.45, 0, 0.1); set('elL', -0.35); set('elR', -0.35);
        set('hipL', -w * 0.45 - 0.2); set('hipR', w * 0.45 - 0.2); set('head', s.mode === 'push' ? 0.1 : -0.15);
        rate = 14; break;
      }
      case 'carry': case 'carryIdle': case 'carryAir': {   // a box held over his head: arms straight up, fists under its corners
        this.phase += dt * (s.mode === 'carry' ? 4 + 8 * s.speed : 0);
        const w = s.mode === 'carry' ? Math.sin(this.phase) : 0;
        set('shL', -0.08, 0, -2.75); set('shR', -0.08, 0, 2.75); set('elL', -0.05); set('elR', -0.05);
        if (s.mode === 'carryAir') { set('hipL', -0.7); set('hipR', 0.3); } else { set('hipL', -w * 0.6); set('hipR', w * 0.6); }
        set('head', -0.05);
        rate = 16; break;
      }
      case 'throw': {
        set('shR', -2.9, 0, 0.2); set('shL', -1.2, 0, -0.2); set('elR', -0.1); set('elL', -0.4);
        set('hipL', -0.4); set('hipR', 0.3); set('head', 0.1);
        rate = 24; break;
      }
      case 'kick': {   // the taekwondo front kick: right leg snaps up and out, arms back for balance
        set('hipR', -1.75); set('hipL', 0.18);
        set('shL', 0.5, 0, -0.6); set('shR', 0.7, 0, 0.6); set('elL', -0.9); set('elR', -0.9);
        set('head', 0.05);
        rate = 34; break;
      }
      case 'float': {   // hanging under the umbrella
        set('shR', -3.0, 0, 0.1); set('shL', -0.3, 0, -0.6); set('elR', -0.2); set('elL', -0.4);
        set('hipL', -0.25 + Math.sin(t * 4) * 0.1); set('hipR', 0.15 - Math.sin(t * 4) * 0.1); set('head', -0.1);
        rate = 10; break;
      }
      default: { // idle
        const br = Math.sin(t * 2.2);
        set('shL', 0.04 * br, 0, -0.1 - 0.03 * br); set('shR', 0.04 * br, 0, 0.1 + 0.03 * br);
        set('elL', -0.18); set('elR', -0.18);
        const look = Math.sin(t * 0.6) > 0.7 ? Math.sin(t * 1.3) * 0.45 : 0;
        set('head', 0.02 * br, look + (s.look || 0), 0);
        rate = 8;
      }
    }
    for (const k of Object.keys(this.p)) {
      const c = this.cur[k], tg = T[k];
      c.x = damp(c.x, tg[0], rate, dt); c.y = damp(c.y, tg[1], rate, dt); c.z = damp(c.z, tg[2], rate, dt);
      this._e.set(c.x, c.y, c.z, 'XYZ');
      this.p[k].quaternion.copy(this.q0[k]).multiply(this._q.setFromEuler(this._e));
    }
    if (this.braid) this.updateBraid(s, Math.min(dt, 1 / 30));
  }
}

// ------------------------------------------------------------------ Glitchy
export async function makeGlitchy(url) {
  const got = url ? await loadModel('glitchy', url) : null;
  if (got) {
    try {
      const gltf = got.gltf;
      gltf.scene.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = false;
        if (o.material) o.material.side = THREE.FrontSide;   // his dark outline is an inside-out hull: front faces only (as on the map)
        if (o.material && o.material.name === 'GlitchBody') {
          const g = o.geometry; g.computeBoundingBox();
          const pos = g.attributes.position, n = pos.count, col = new Float32Array(n * 3);
          const a = new THREE.Color('#ff4df2'), b = new THREE.Color('#38ffd6'), tmp = new THREE.Color();
          const y0 = g.boundingBox.min.y, y1 = g.boundingBox.max.y;
          for (let i = 0; i < n; i++) { tmp.copy(b).lerp(a, (pos.getY(i) - y0) / (y1 - y0)); col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b; }
          g.setAttribute('color', new THREE.BufferAttribute(col, 3));
          o.material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.25, metalness: 0, emissive: '#3a1050', envMapIntensity: 1 });
        }
      });
      mergeByNode(gltf.scene);
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = box.getSize(new THREE.Vector3());
      const holder = new THREE.Group();
      const s = 0.95 / Math.max(size.x, size.y, size.z);
      gltf.scene.scale.setScalar(s);
      const c = box.getCenter(new THREE.Vector3()).multiplyScalar(s);
      gltf.scene.position.sub(c);
      holder.add(gltf.scene);
      return holder;
    } catch (e) { console.warn('glitchy.glb not loaded:', e && e.message); }
  }
  // fallback: gradient blob with eyes
  const holder = new THREE.Group();
  const g = new THREE.SphereGeometry(0.42, 24, 16);
  const pos = g.attributes.position, col = new Float32Array(pos.count * 3);
  const a = new THREE.Color('#ff4df2'), b = new THREE.Color('#38ffd6'), tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) { tmp.copy(b).lerp(a, (pos.getY(i) + 0.42) / 0.84); col.set([tmp.r, tmp.g, tmp.b], i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  holder.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.25, emissive: '#3a1050' })));
  const eye = new THREE.MeshStandardMaterial({ color: '#141018', roughness: 0.2 });
  for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), eye); e.scale.set(1, 1.4, 0.6); e.position.set(sx * 0.14, 0.04, 0.38); holder.add(e); }
  return holder;
}

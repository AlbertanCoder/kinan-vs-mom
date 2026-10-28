// Boxes you can bonk, slam, carry, throw, stack, push and pull, plus the BIG BUTTON + cage puzzle
// and the power-ups that pop out of ? boxes. Everything comes from plain level data:
//
//   boxes:  [{ kind:'prize', pos:[x,y,z], item:'umbrella' }          ? block (Mario style): bonk from below or slam from above
//            { kind:'prize', pos, candles:5 }                        ... pops a candle per bonk (5 times)
//            { kind:'prize', pos, item:'heart', hidden:true }        ... invisible until bonked (Vader the cat spots these)
//            { kind:'crate', pos, candles:3 }                         wooden crate: breaks when bonked / slammed / thrown; can be carried
//            { kind:'block', pos, color:'#3f8fe8' }                   sturdy toy block: carry, throw, put down, STACK
//            { kind:'heavy', pos }]                                   big toy chest: too heavy to lift; push it, or ACTION to grab + pull
//   buttons: [{ pos, opens:'cage1' }]   held down by any box (or Kinan, but he can't be in two places at once)
//   cages:   [{ id:'cage1', pos, prize:{ item:'present' } }]
// pos is the BOTTOM centre. Items: popper, hat, lasso, umbrella, cake, heart, present.
import * as THREE from 'three';
import { moved, savePose, rectBlocked, spaceFree } from './physics.js';
import { toyMat, dBox, dSphere, dCyl, bake } from './props.js';
import { roundedBoxGeo } from './build.js';
import { TAU } from './util.js';

const SIZES = { prize: [1.7, 1.7, 1.7], crate: [2.0, 1.8, 2.0], block: [2.0, 1.8, 2.0], heavy: [3.0, 2.4, 3.0] };
export const ITEMS = {
  popper: { name: 'PARTY POPPER!', text: 'Press ACTION to shoot confetti at the bad guys!' },
  hat: { name: 'PARTY HAT!', text: 'It takes one hit for you.' },
  lasso: { name: 'LASSO!', text: 'Candles fly to you from far away. YEEHAW!' },
  umbrella: { name: 'UMBRELLA!', text: 'Hold JUMP while you fall to float down slowly.' },
  cake: { name: 'SUGAR RUSH!', text: 'Super fast and unstoppable!' },
  heart: { name: 'EXTRA HEART!', text: '' },
  present: { name: 'BIRTHDAY PRESENT!', text: 'An extra heart and a pile of candles!' },
};

let qTex = null, usedTex = null;
function faceTex(q) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = q ? '#ffd23f' : '#c99a62'; x.fillRect(0, 0, 128, 128);
  x.fillStyle = q ? '#ffb000' : '#a77a46';
  for (const [px, py] of [[16, 16], [112, 16], [16, 112], [112, 112]]) { x.beginPath(); x.arc(px, py, 7, 0, TAU); x.fill(); }
  if (q) {
    x.font = "700 96px 'Pixelify Sans', monospace"; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#b86a00'; x.fillText('?', 68, 72); x.fillStyle = '#ffffff'; x.fillText('?', 64, 66);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export class Boxes {
  constructor(ent) {
    this.ent = ent; this.g = ent.g; this.scene = ent.scene; this.world = ent.world;
    this.list = []; this.buttons = []; this.cages = []; this.items = []; this.shots = [];
    this.byId = new Map();
  }

  build(L) {
    (L.boxes || []).forEach((d) => this.add(d));
    (L.cages || []).forEach((d) => this.addCage(d));
    (L.buttons || []).forEach((d) => this.addButton(d));
  }

  // ------------------------------------------------------------ creation
  add(d) {
    const kind = d.kind || 'crate';
    const [w, h, dd] = d.size || SIZES[kind];
    const grp = new THREE.Group();
    if (kind === 'prize') {
      if (!qTex) { qTex = faceTex(true); usedTex = faceTex(false); }
      const mat = new THREE.MeshStandardMaterial({ map: qTex, roughness: 0.4, envMapIntensity: 0.6 });
      const m = new THREE.Mesh(roundedBoxGeo(w, h, dd, 0.16, 2), mat); m.position.y = h / 2; grp.add(m);
      grp.userData.mat = mat;
    } else if (kind === 'crate') {
      dBox(grp, 0, 0, 0, w, h, dd, '#d9a56b', { r: 0.12 });
      for (const sz of [-1, 1]) { const p = dBox(grp, 0, h * 0.1, sz * (dd / 2 + 0.01), w * 0.92, 0.22, 0.08, '#b07a45', { r: 0.04 }); p.rotation.z = 0.72; }
      for (const sx of [-1, 1]) { const p = dBox(grp, sx * (w / 2 + 0.01), h * 0.1, 0, 0.08, 0.22, dd * 0.92, '#b07a45', { r: 0.04 }); p.rotation.x = 0.72; }
      dBox(grp, 0, h - 0.06, 0, w + 0.06, 0.12, dd + 0.06, '#b07a45', { r: 0.04 });
      dBox(grp, 0, 0, 0, w + 0.06, 0.12, dd + 0.06, '#b07a45', { r: 0.04 });
      bake(grp);
    } else if (kind === 'block') {
      const col = d.color || '#3f8fe8';
      dBox(grp, 0, 0, 0, w, h, dd, col, { r: 0.2, rough: 0.3 });
      for (const sx of [-0.5, 0.5]) for (const sz of [-0.5, 0.5]) dCyl(grp, sx * w * 0.5, h - 0.02, sz * dd * 0.5, 0.32, 0.22, col, { rough: 0.3 });
      bake(grp);
    } else if (kind === 'heavy') {
      dBox(grp, 0, 0, 0, w, h, dd, '#b97a45', { r: 0.18 });
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) dBox(grp, sx * (w / 2 - 0.25), 0, sz * (dd / 2 - 0.25), 0.62, h + 0.04, 0.62, '#f6c445', { r: 0.12 });
      dBox(grp, 0, h * 0.45, dd / 2 + 0.02, w * 0.7, 0.3, 0.1, '#8a5a34', { r: 0.05 });
      dBox(grp, 0, h * 0.45, -dd / 2 - 0.02, w * 0.7, 0.3, 0.1, '#8a5a34', { r: 0.05 });
      dBox(grp, w / 2 + 0.02, h * 0.45, 0, 0.1, 0.3, dd * 0.7, '#8a5a34', { r: 0.05 });
      dBox(grp, -w / 2 - 0.02, h * 0.45, 0, 0.1, 0.3, dd * 0.7, '#8a5a34', { r: 0.05 });
      bake(grp);
    }
    const pos = new THREE.Vector3(d.pos[0], d.pos[1], d.pos[2]);
    grp.position.copy(pos);
    this.scene.add(grp);
    const col = this.world.add({ type: 'box', moving: true, cx: pos.x, cy: pos.y + h / 2, cz: pos.z, hx: w / 2, hy: h / 2, hz: dd / 2, yaw: 0, cam: kind === 'heavy' });
    const bx = { kind, def: d, grp, col, pos, hx: w / 2, hy: h / 2, hz: dd / 2, state: 'rest', vel: new THREE.Vector3(), alive: true, hits: 0, bob: 0, hidden: !!d.hidden, id: d.id };
    col.box = bx;
    savePose(col);
    // a crate or block placed in mid-air hangs there (like a Mario brick block) until it is bonked or slammed
    if (kind !== 'prize') { const g = this.world.groundAt(pos.x, pos.z, pos.y + 0.05, 0.3); bx.fixed = d.fixed !== undefined ? !!d.fixed : (!g || g.y < pos.y - 0.1); }
    if (kind === 'prize' || kind === 'crate') col.onBonk = (pl) => this.bonk(bx, pl);
    if (bx.hidden) { grp.visible = false; col.noWall = true; col.noGround = true; }
    if (d.id) this.byId.set(d.id, bx);
    this.list.push(bx);
    return bx;
  }

  addButton(d) {
    const grp = new THREE.Group();
    dCyl(grp, 0, 0, 0, 1.6, 0.18, '#ffffff');
    const plate = new THREE.Group(); grp.add(plate);
    dCyl(plate, 0, 0.12, 0, 1.25, 0.28, '#e8473c', { rough: 0.35 });
    bake(grp, false); bake(plate);
    grp.position.set(d.pos[0], d.pos[1], d.pos[2]);
    this.scene.add(grp);
    this.buttons.push({ def: d, grp, plate, p: new THREE.Vector3(...d.pos), pressed: false, by: null, offT: 0 });
  }

  addCage(d) {
    // toy cage: four posts, bars and a roof around a pedestal; it lifts up while its button is held down
    const W = d.w || 3.6, H = d.h || 3.4;
    const cage = new THREE.Group();
    const cols = ['#3f8fe8', '#ff5fa2', '#ffd23f', '#5cc23a'];
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) dCyl(cage, sx * W / 2, 0, sz * W / 2, 0.22, H, '#ffffff');
    for (let i = 0; i < 4; i++) for (let k = 1; k < 5; k++) {
      const a = i * Math.PI / 2, t = -W / 2 + (W / 5) * k;
      const x = Math.cos(a) * W / 2 + Math.sin(a) * t, z = Math.sin(a) * W / 2 - Math.cos(a) * t;
      dCyl(cage, x, 0, z, 0.11, H, cols[(i + k) % 4]);
    }
    dBox(cage, 0, H, 0, W + 0.5, 0.35, W + 0.5, '#e8473c', { r: 0.15 });
    dBox(cage, 0, 0, 0, W + 0.5, 0.2, W + 0.5, '#ffffff', { r: 0.08 });
    bake(cage);
    const base = new THREE.Group();
    dCyl(base, 0, 0, 0, 0.9, 0.7, '#f6c445');
    bake(base);
    const p = new THREE.Vector3(...d.pos);
    cage.position.copy(p); base.position.copy(p);
    this.scene.add(cage); this.scene.add(base);
    const col = this.world.add({ type: 'box', moving: true, cx: p.x, cy: p.y + H / 2, cz: p.z, hx: W / 2 + 0.25, hy: H / 2 + 0.18, hz: W / 2 + 0.25, yaw: 0, cam: false, noLedge: true });
    savePose(col);
    const cg = { def: d, cage, base, col, p, H, lift: 0, open: false, prizeTaken: false, item: null };
    // the prize waits on the pedestal
    if (d.prize && d.prize.item) cg.item = this.spawnItem(d.prize.item, new THREE.Vector3(p.x, p.y + 0.75, p.z), false);
    this.cages.push(cg);
    if (d.id) this.byId.set(d.id, cg);
  }

  // ------------------------------------------------------------ interaction API (used by the player)
  // the box in front of Kinan he could pick up or grab: {box, kind, nx, nz} (n = face normal toward Kinan)
  interactable(pl) {
    const p = pl.pos, fx = Math.sin(pl.facing), fz = Math.cos(pl.facing);
    let best = null, bestD = 1e9;
    for (const bx of this.list) {
      if (!bx.alive || bx.state !== 'rest' || bx.hidden || bx.kind === 'prize' || bx.fixed) continue;
      const bottom = bx.pos.y, top = bottom + bx.hy * 2;
      if (bottom > p.y + 1.0 || top < p.y + 0.3) continue;
      const qx = Math.max(bx.pos.x - bx.hx, Math.min(p.x, bx.pos.x + bx.hx)), qz = Math.max(bx.pos.z - bx.hz, Math.min(p.z, bx.pos.z + bx.hz));
      const d = Math.hypot(p.x - qx, p.z - qz);
      if (d > pl.body.r + 0.75) continue;
      const tx = bx.pos.x - p.x, tz = bx.pos.z - p.z, tl = Math.hypot(tx, tz) || 1;
      if ((tx * fx + tz * fz) / tl < 0.35) continue;      // must be roughly in front
      if (d < bestD) { bestD = d; best = bx; }
    }
    if (!best) return null;
    // face normal (axis) from the box toward Kinan
    const dx = (p.x - best.pos.x) / best.hx, dz = (p.z - best.pos.z) / best.hz;
    const n = Math.abs(dx) > Math.abs(dz) ? [Math.sign(dx), 0] : [0, Math.sign(dz)];
    return { box: best, kind: best.kind, nx: n[0], nz: n[1] };
  }

  pickUp(bx, pl) {
    if (bx.kind !== 'crate' && bx.kind !== 'block') return false;
    bx.state = 'carried'; bx.carriedBy = pl; bx.col.solid = false;
    return true;
  }

  drop(bx, pl) {
    // let go of a carried box (hurt / respawn): it falls where Kinan is
    if (bx.state !== 'carried') return;
    bx.state = 'fall'; bx.vel.set(0, 2, 0); bx.carriedBy = null; bx.col.solid = false;
    pl.carrying = null;
  }

  setDown(bx, pl) {
    const fx = Math.sin(pl.facing), fz = Math.cos(pl.facing);
    // a box right in front? stack neatly on top of it (easy to aim, even on a phone)
    for (const o of this.list) {
      if (o === bx || !o.alive || o.state !== 'rest' || o.hidden || o.kind === 'prize') continue;
      const dx = o.pos.x - pl.pos.x, dz = o.pos.z - pl.pos.z, d = Math.hypot(dx, dz);
      const top = o.pos.y + o.hy * 2;
      if (d > o.hx + bx.hx + 1.4 || (dx * fx + dz * fz) / (d || 1) < 0.5 || top > pl.pos.y + 2.7 || top < pl.pos.y - 0.5) continue;
      if (rectBlocked(this.world, o.pos.x, o.pos.z, bx.hx, bx.hz, top + 0.03, top + bx.hy * 2, bx.col)) continue;
      bx.pos.set(o.pos.x, top, o.pos.z); bx.state = 'rest'; bx.carriedBy = null; bx.col.solid = true; bx.ground = o.col;
      this.syncCol(bx); this.g.sfx('land');
      return true;
    }
    for (const dist of [pl.body.r + bx.hx + 0.2, pl.body.r + bx.hx + 0.6]) {
      const tx = pl.pos.x + fx * dist, tz = pl.pos.z + fz * dist;
      const g = this.world.groundAt(tx, tz, pl.pos.y + bx.hy * 2 + 0.7, Math.min(bx.hx, bx.hz) * 0.5);
      if (!g || g.y < pl.pos.y - 3) continue;
      if (g.c && g.c.bounce) continue;
      if (rectBlocked(this.world, tx, tz, bx.hx, bx.hz, g.y + 0.03, g.y + bx.hy * 2, bx.col)) continue;
      bx.pos.set(tx, g.y, tz); bx.state = 'rest'; bx.carriedBy = null; bx.col.solid = true; bx.ground = g.c;
      this.syncCol(bx);
      this.g.sfx('land');
      return true;
    }
    return false;
  }

  throwBox(bx, pl, h, v) {
    const fx = Math.sin(pl.facing), fz = Math.cos(pl.facing);
    bx.state = 'thrown'; bx.carriedBy = null; bx.col.solid = false;
    bx.vel.set(fx * h, v, fz * h);
    bx.thrownT = 0;
  }

  // slide a resting box by (dx,dz) if nothing is in the way; boxes on top ride along. Returns true if it moved.
  tryMove(bx, dx, dz) {
    if (bx.state !== 'rest' || bx.fixed) return false;
    const nx = bx.pos.x + dx, nz = bx.pos.z + dz;
    if (rectBlocked(this.world, nx, nz, bx.hx, bx.hz, bx.pos.y + 0.06, bx.pos.y + bx.hy * 2, bx.col)) return false;
    // don't shove a box into the enemies or pets standing there
    this.moveBy(bx, dx, 0, dz);
    if (!this.pushSfxT || this.g.time - this.pushSfxT > 0.32) { this.pushSfxT = this.g.time; this.g.sfx('scrape'); }
    return true;
  }
  moveBy(bx, dx, dy, dz) {
    bx.pos.x += dx; bx.pos.y += dy; bx.pos.z += dz;
    savePose(bx.col);
    this.syncCol(bx, true);
    for (const o of this.list) if (o !== bx && o.alive && o.state === 'rest' && o.ground === bx.col) this.moveBy(o, dx, dy, dz);
  }
  syncCol(bx, keepPose) {
    const c = bx.col;
    if (!keepPose) savePose(c);
    c.cx = bx.pos.x; c.cy = bx.pos.y + bx.hy; c.cz = bx.pos.z;
    moved(c);
    bx.grp.position.copy(bx.pos);
  }

  // ------------------------------------------------------------ hits
  bonk(bx, pl) {
    if (!bx.alive) return;
    if (bx.kind === 'crate') { this.breakBox(bx); return; }
    if (bx.kind !== 'prize' || bx.used) { bx.bob = 0.12; return; }
    if (bx.hidden) { bx.hidden = false; bx.grp.visible = true; bx.col.noWall = false; bx.col.noGround = false; this.g.sfx('secret'); }
    bx.bob = 0.2;
    const top = new THREE.Vector3(bx.pos.x, bx.pos.y + bx.hy * 2, bx.pos.z);
    const d = bx.def;
    if (d.item) {
      // no room above (a ? box right under the ceiling)? the prize drops out of the bottom instead
      const room = spaceFree(this.world, top.x, top.z, top.y + 0.05, top.y + 1.6, 0.4, bx.col);
      if (room) this.spawnItem(d.item, top.clone().add(new THREE.Vector3(0, 0.1, 0)), true);
      else { const it = this.spawnItem(d.item, new THREE.Vector3(top.x, bx.pos.y - 1.3, top.z), false); it.hop = 'pending'; }
      this.useUp(bx);
    } else {
      bx.hits++;
      this.ent.spawnCandle(top.x, top.y + 0.3, top.z, 13, true);
      if (bx.hits >= (d.candles || 1)) this.useUp(bx);
    }
    this.g.sfx('gift');
    this.g.particles.sparkle(top, '#fff2a0', 10, 4);
  }
  useUp(bx) {
    bx.used = true;
    const m = bx.grp.userData.mat; if (m) { m.map = usedTex; m.needsUpdate = true; }
  }
  slammed(c) {
    const bx = c && c.box; if (!bx || !bx.alive) return false;
    if (bx.kind === 'crate') { this.breakBox(bx); return true; }
    if (bx.kind === 'prize' && !bx.used) { this.bonk(bx, null); return true; }
    return false;
  }
  breakBox(bx) {
    if (!bx.alive) return;
    bx.alive = false; bx.state = 'broken';
    this.world.remove(bx.col); bx.col.solid = false;
    bx.grp.visible = false;
    const c = new THREE.Vector3(bx.pos.x, bx.pos.y + bx.hy, bx.pos.z);
    for (let i = 0; i < 16; i++) { const a = Math.random() * TAU; this.g.particles.emit(c.x, c.y, c.z, Math.cos(a) * 6 * Math.random(), 4 + Math.random() * 6, Math.sin(a) * 6 * Math.random(), i % 2 ? '#d9a56b' : '#b07a45', 0.55, 0.7, 18, 1); }
    this.g.sfx('break');
    this.g.camRig.shake(0.12);
    const n = bx.def.candles !== undefined ? bx.def.candles : 2;
    for (let i = 0; i < n; i++) { const a = (i / Math.max(1, n)) * TAU; this.ent.spawnCandle(c.x + Math.cos(a) * 1.4, c.y + 0.5, c.z + Math.sin(a) * 1.4, 9 + Math.random() * 3); }
    if (bx.def.item) this.spawnItem(bx.def.item, c, true);
    this.g.stats.boxes = (this.g.stats.boxes || 0) + 1;
    // anything that was standing on it falls
    for (const o of this.list) if (o.alive && o.state === 'rest' && o.ground === bx.col) o.state = 'fall';
  }

  // ------------------------------------------------------------ power-up items
  spawnItem(kind, at, rise) {
    const grp = new THREE.Group();
    buildItem(grp, kind);
    grp.position.copy(at);
    this.scene.add(grp);
    // rise = pops out of a box, then hops off and lands where Kinan can grab it (like a Mario mushroom)
    const it = { kind, grp, base: at.clone(), p: at.clone(), rise: rise ? 0 : 1, hop: rise ? 'pending' : 'done', v: new THREE.Vector3(), t: Math.random() * 3, got: false, clearR: 1.45 };
    this.items.push(it);
    return it;
  }
  collectItem(it) {
    if (it.got) return;
    it.got = true; it.grp.visible = false;
    const g = this.g, pl = g.player, pw = pl.pw;
    const info = ITEMS[it.kind] || { name: it.kind.toUpperCase(), text: '' };
    switch (it.kind) {
      case 'popper': pw.popper = true; break;
      case 'hat': pw.hat = true; break;
      case 'lasso': pw.lasso = true; break;
      case 'umbrella': pw.umbrella = true; break;
      case 'cake': pw.rush = 8.3; break;
      case 'heart': pl.maxHearts = Math.min(5, Math.max(pl.maxHearts, pl.hearts + 1)); pl.heal(1); break;
      case 'present':
        pl.maxHearts = Math.min(5, pl.maxHearts + 1); pl.heal(9);
        for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; this.ent.spawnCandle(it.base.x + Math.cos(a) * 2.4, it.base.y + 1, it.base.z + Math.sin(a) * 2.4, 11); }
        break;
    }
    g.hud.hearts(pl.hearts, pl.maxHearts);
    g.hud.powers(pw);
    g.sfx(it.kind === 'heart' || it.kind === 'present' ? 'heal' : 'power');
    g.particles.confetti(it.grp.position.clone(), 30);
    g.hud.banner(info.name, info.text, 2.4);
    g.stats.items = (g.stats.items || 0) + 1;
    for (const cg of this.cages) if (cg.item === it) cg.prizeTaken = true;
  }

  // ------------------------------------------------------------ the party popper's confetti
  shoot(pl) {
    if (this.shots.length >= 3) return;
    const fx = Math.sin(pl.facing), fz = Math.cos(pl.facing);
    this.shots.push({ x: pl.pos.x + fx * 0.8, y: pl.pos.y + 1.3, z: pl.pos.z + fz * 0.8, vx: fx * 24, vz: fz * 24, life: 0.6 });
    this.g.sfx('pew');
  }

  // ------------------------------------------------------------ per frame
  update(dt, t, pl) {
    const W = this.world;
    for (const bx of this.list) {
      if (!bx.alive) continue;
      // a carried box is drawn after Kinan, so where it rests on his hair it hides it instead of showing his purple
      // "behind furniture" silhouette on top of the box
      const ro = bx.state === 'carried';
      if (!!bx.drawAfterKinan !== ro) {
        bx.drawAfterKinan = ro;
        bx.grp.traverse((o) => { if (!o.isMesh) return; if (o.userData.ro0 === undefined) o.userData.ro0 = o.renderOrder; o.renderOrder = ro ? 3 : o.userData.ro0; });
      }
      if (bx.state === 'carried') {
        const cp = bx.carriedBy || pl;
        const lift = cp.liftT > 0 ? 1 - cp.liftT / 0.25 : 1;
        // resting on his head and raised fists (braid1 Kinan: top of hair 2.03, raised fists ~1.9)
        bx.pos.set(cp.pos.x + Math.sin(cp.facing) * 0.15, cp.pos.y + 1.0 + 0.94 * lift, cp.pos.z + Math.cos(cp.facing) * 0.15);
        bx.grp.rotation.y = cp.facing;
        this.syncCol(bx);
        continue;
      }
      if (bx.state === 'thrown' || bx.state === 'fall') {
        bx.thrownT = (bx.thrownT || 0) + dt;
        bx.vel.y = Math.max(-40, bx.vel.y - 34 * dt);
        const n = Math.max(1, Math.ceil(dt / (1 / 90))), s = dt / n;
        for (let i = 0; i < n && bx.alive && (bx.state === 'thrown' || bx.state === 'fall'); i++) {
          // sideways: walls stop it (crates smash)
          const nx = bx.pos.x + bx.vel.x * s, nz = bx.pos.z + bx.vel.z * s;
          if (bx.vel.x || bx.vel.z) {
            if (rectBlocked(W, nx, nz, bx.hx * 0.9, bx.hz * 0.9, bx.pos.y + 0.25, bx.pos.y + bx.hy * 2 - 0.1, bx.col)) {
              if (bx.kind === 'crate' && bx.state === 'thrown') { this.breakBox(bx); break; }
              bx.vel.x = 0; bx.vel.z = 0;
            } else { bx.pos.x = nx; bx.pos.z = nz; }
          }
          // down: land on the ground or another box
          const ny = bx.pos.y + bx.vel.y * s;
          const g = W.groundAt(bx.pos.x, bx.pos.z, bx.pos.y + 0.3, Math.min(bx.hx, bx.hz) * 0.6);
          if (g && bx.vel.y <= 0 && ny <= g.y && g.c !== bx.col) {
            bx.pos.y = g.y;
            if (bx.kind === 'crate' && bx.state === 'thrown') { this.breakBox(bx); break; }
            bx.state = 'rest'; bx.vel.set(0, 0, 0); bx.ground = g.c; bx.col.solid = true;
            this.g.sfx('land'); this.g.particles.dust(bx.pos, 5, 1.2);
          } else bx.pos.y = ny;
          if (bx.pos.y < this.g.level.killY) { bx.alive = false; bx.grp.visible = false; this.world.remove(bx.col); }
        }
        // thrown boxes bop enemies
        if (bx.alive && bx.state === 'thrown') {
          for (const e of this.ent.enemies) {
            if (!e.alive || e.hidden) continue;
            if (Math.hypot(e.pos.x - bx.pos.x, e.pos.z - bx.pos.z) < e.r + bx.hx && Math.abs(e.pos.y + 1 - (bx.pos.y + bx.hy)) < 2) {
              this.ent.hitEnemy(e, 'throw');
              if (bx.kind === 'crate') this.breakBox(bx); else { bx.vel.x *= -0.2; bx.vel.z *= -0.2; }
              break;
            }
          }
        }
        this.syncCol(bx);
        continue;
      }
      // resting: still supported?
      if (bx.state === 'rest' && bx.kind !== 'prize' && !bx.fixed) {
        const g = W.groundAt(bx.pos.x, bx.pos.z, bx.pos.y + 0.3, Math.min(bx.hx, bx.hz) * 0.6);
        if (!g || g.y < bx.pos.y - 0.05) { bx.state = 'fall'; bx.vel.set(0, 0, 0); bx.col.solid = false; }
        else { bx.ground = g.c; savePose(bx.col); }
      }
      if (bx.bob > 0) { bx.bob = Math.max(0, bx.bob - dt); bx.grp.position.y = bx.pos.y + Math.sin((0.2 - bx.bob) / 0.2 * Math.PI) * 0.35; }
      if (bx.hidden) {
        // Vader the cat spots hidden boxes: a faint ghost + sparkles
        const seen = this.ent.petPower('vader') && Math.hypot(pl.pos.x - bx.pos.x, pl.pos.z - bx.pos.z) < 14;
        bx.grp.visible = !!seen;
        if (seen) { bx.grp.traverse((o) => { if (o.material) { o.material.transparent = true; o.material.opacity = 0.45; } }); if (Math.random() < dt * 8) this.g.particles.emit(bx.pos.x + (Math.random() - 0.5) * 2, bx.pos.y + Math.random() * 2, bx.pos.z + (Math.random() - 0.5) * 2, 0, 0.6, 0, '#9fe0ff', 0.35, 0.8, 0, 0); }
      } else if (bx.kind === 'prize' && bx.grp.userData.revealed !== true && bx.def.hidden) {
        bx.grp.userData.revealed = true; bx.grp.traverse((o) => { if (o.material) { o.material.transparent = false; o.material.opacity = 1; } });
      }
    }
    // buttons: pressed by a resting box or by Kinan standing on them
    for (const bt of this.buttons) {
      let by = null;
      for (const bx of this.list) {
        if (!bx.alive || bx.state !== 'rest' || bx.kind === 'prize') continue;
        if (Math.abs(bx.pos.x - bt.p.x) < bx.hx + 0.5 && Math.abs(bx.pos.z - bt.p.z) < bx.hz + 0.5 && Math.abs(bx.pos.y - bt.p.y) < 0.6) { by = bx; break; }
      }
      const kin = pl.grounded && Math.hypot(pl.pos.x - bt.p.x, pl.pos.z - bt.p.z) < 1.5 && Math.abs(pl.pos.y - bt.p.y) < 0.6;
      const down = !!by || kin;
      if (down && !bt.pressed) { this.g.sfx('click'); if (by) this.g.firstTime('button-box', 'The crate is HEAVY enough to hold the button down. The cage is open!'); }
      if (!down && bt.pressed) bt.offT = 0.05;
      bt.pressed = down; bt.by = by ? 'box' : kin ? 'kinan' : null;
      if (!down) bt.offT -= dt;
      bt.plate.position.y = down ? -0.2 : 0;
      const cg = this.byId.get(bt.def.opens);
      if (cg) cg.want = down || bt.offT > 0;
    }
    // cages
    for (const cg of this.cages) {
      const kinInside = Math.abs(pl.pos.x - cg.p.x) < cg.col.hx + 0.5 && Math.abs(pl.pos.z - cg.p.z) < cg.col.hz + 0.5 && pl.pos.y < cg.p.y + cg.H;
      const target = cg.want || cg.prizeTaken ? cg.H + 1.2 : (kinInside && cg.lift > 0.3 ? cg.lift : 0);
      const sp = target > cg.lift ? 6 : 30;
      cg.lift = cg.lift < target ? Math.min(target, cg.lift + sp * dt) : Math.max(target, cg.lift - sp * dt);
      cg.open = cg.lift >= 2.4;
      cg.cage.position.y = cg.p.y + cg.lift;
      savePose(cg.col); cg.col.cy = cg.p.y + cg.lift + cg.col.hy; moved(cg.col);
      if (cg.item && !cg.item.got) cg.item.reachable = cg.open;
    }
    // items: rise out of the box, bob, collect on touch
    for (const it of this.items) {
      if (it.got) continue;
      it.t += dt;
      if (it.rise < 1) {
        it.rise = Math.min(1, it.rise + dt * 2.5);
        it.p.set(it.base.x, it.base.y + it.rise * 1.25, it.base.z);
      } else if (it.hop === 'pending') {
        let hx = pl.pos.x - it.p.x, hz = pl.pos.z - it.p.z; const hl = Math.hypot(hx, hz);
        if (hl < 0.3) { hx = 1; hz = 0; } else { hx /= hl; hz /= hl; }
        it.v.set(hx * 3.5, 6.5, hz * 3.5); it.hop = 'air';
      } else if (it.hop === 'air') {
        it.v.y = Math.max(-30, it.v.y - 30 * dt);
        it.p.addScaledVector(it.v, dt);
        // once it is clear of the box it drops straight down (so it stays on the same ledge as Kinan)
        if (Math.hypot(it.p.x - it.base.x, it.p.z - it.base.z) > (it.clearR || 1.4)) { it.v.x = 0; it.v.z = 0; }
        const g = W.groundAt(it.p.x, it.p.z, it.p.y + 0.25, 0.3);
        if (g && it.v.y < 0 && it.p.y <= g.y + 0.25) { it.p.y = g.y + 0.25; it.hop = 'done'; this.g.sfx('land'); }
        if (it.p.y < this.g.level.killY) { it.got = true; it.grp.visible = false; continue; }
      }
      it.grp.position.set(it.p.x, it.p.y + (it.hop === 'done' ? Math.sin(it.t * 3) * 0.15 : 0), it.p.z);
      it.grp.rotation.y = it.t * 2;
      if (it.reachable === false) continue;
      const p = it.grp.position;
      if (it.rise >= 1 && Math.hypot(pl.pos.x - p.x, pl.pos.z - p.z) < 1.6 && pl.pos.y < p.y + 1.0 && pl.pos.y + 2.2 > p.y) this.collectItem(it);
    }
    // confetti shots
    for (const s of this.shots) {
      s.life -= dt;
      s.x += s.vx * dt; s.z += s.vz * dt;
      for (let k = 0; k < 2; k++) this.g.particles.emit(s.x, s.y, s.z, (Math.random() - 0.5) * 3, Math.random() * 2, (Math.random() - 0.5) * 3, ['#ff5fa2', '#ffd23f', '#7ec8ff', '#5cc23a'][(Math.random() * 4) | 0], 0.3, 0.45, 6, 1);
      for (const e of this.ent.enemies) {
        if (!e.alive || e.hidden) continue;
        if (Math.hypot(e.pos.x - s.x, e.pos.z - s.z) < e.r + 0.5 && s.y > e.pos.y - 0.2 && s.y < e.pos.y + e.h + 0.3) { this.ent.hitEnemy(e, 'confetti'); s.life = 0; break; }
      }
      for (const bx of this.list) {
        if (s.life <= 0 || !bx.alive || bx.kind !== 'crate' || bx.state !== 'rest') continue;
        if (Math.abs(s.x - bx.pos.x) < bx.hx + 0.2 && Math.abs(s.z - bx.pos.z) < bx.hz + 0.2 && s.y > bx.pos.y && s.y < bx.pos.y + bx.hy * 2) { this.breakBox(bx); s.life = 0; }
      }
      if (s.life > 0 && rectBlocked(W, s.x, s.z, 0.15, 0.15, s.y - 0.1, s.y + 0.1)) s.life = 0;
    }
    this.shots = this.shots.filter((s) => s.life > 0);
  }

  cull(vis) {
    for (const bx of this.list) if (bx.alive && !bx.hidden) bx.grp.visible = bx.state === 'carried' || vis(bx.pos);
  }
}

// ------------------------------------------------------------ item models (small toys)
function buildItem(grp, kind) {
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.95, 14, 10), new THREE.MeshBasicMaterial({ color: '#fff3b0', transparent: true, opacity: 0.22, depthWrite: false }));
  glow.position.y = 0.55; grp.add(glow);
  if (kind === 'popper') {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.1, 14), toyMat('#ff5fa2', 0.4)); c.rotation.x = Math.PI; c.position.y = 0.55; grp.add(c);
    for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.36 - i * 0.1, 0.05, 6, 16), toyMat('#ffd23f', 0.4)); r.rotation.x = Math.PI / 2; r.position.y = 0.9 - i * 0.25; grp.add(r); }
    for (let i = 0; i < 5; i++) dSphere(grp, Math.cos(i * 1.3) * 0.35, 1.2 + (i % 2) * 0.2, Math.sin(i * 1.3) * 0.35, 0.09, ['#7ec8ff', '#5cc23a', '#ffd23f', '#ff9a3c', '#9b6cff'][i]);
  } else if (kind === 'hat') {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.2, 16), toyMat('#3f8fe8', 0.45)); c.position.y = 0.6; grp.add(c);
    for (let i = 0; i < 6; i++) dSphere(grp, Math.cos(i) * 0.3 * (1 - (i % 3) * 0.25), 0.3 + (i % 3) * 0.28, Math.sin(i) * 0.3 * (1 - (i % 3) * 0.25), 0.08, '#ffd23f');
    dSphere(grp, 0, 1.25, 0, 0.18, '#ff5fa2');
  } else if (kind === 'lasso') {
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.09, 8, 24), toyMat('#e2ae73', 0.7)); r.position.y = 0.6; grp.add(r);
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.08, 8, 20), toyMat('#c98b52', 0.7)); r2.position.set(0.15, 0.55, 0.05); r2.rotation.y = 0.5; grp.add(r2);
  } else if (kind === 'umbrella') {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.8, 0.45, 8), toyMat('#ff5fa2', 0.45)); c.position.y = 1.05; grp.add(c);
    dCyl(grp, 0, 0, 0, 0.05, 1.0, '#ffffff');
    dSphere(grp, 0, 1.32, 0, 0.08, '#ffd23f');
  } else if (kind === 'cake') {
    dCyl(grp, 0, 0, 0, 0.55, 0.45, '#ff8fb8'); dCyl(grp, 0, 0.45, 0, 0.42, 0.35, '#fff2c9');
    dCyl(grp, 0, 0.8, 0, 0.06, 0.35, '#7ec8ff'); dSphere(grp, 0, 1.22, 0, 0.09, '#ffb83a');
  } else if (kind === 'heart' || kind === 'present') {
    if (kind === 'heart') {
      for (const sx of [-1, 1]) dSphere(grp, sx * 0.25, 0.85, 0, 0.32, '#e8364b');
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.75, 16), toyMat('#e8364b', 0.4)); c.rotation.x = Math.PI; c.position.y = 0.45; grp.add(c);
    } else {
      dBox(grp, 0, 0, 0, 1.3, 1.1, 1.3, '#f6c445', { r: 0.12 });
      dBox(grp, 0, 0, 0, 0.3, 1.14, 1.34, '#e8364b', { r: 0.05 }); dBox(grp, 0, 0, 0, 1.34, 1.14, 0.3, '#e8364b', { r: 0.05 });
      for (const sx of [-1, 1]) dSphere(grp, sx * 0.25, 1.25, 0, 0.22, '#e8364b', { s: [1.2, 0.7, 0.7] });
    }
  }
}

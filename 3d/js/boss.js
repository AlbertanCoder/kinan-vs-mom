// Boss framework: a boss that gets SMARTER every time Kinan hits it.
// Level data:  boss: { kind:'brick', name:'BIG BRICK', pos:[x,y,z], arena:[x0,z0,x1,z1], hp:3, color, wakeR }
//
//   phase 1 (dumb)    : stalks slowly, long wind-up (crouch + shake + flashing "!"), charges straight at where Kinan WAS,
//                       bonks the arena wall and sits DIZZY (squashed low): jump on its head!
//   phase 2 (smarter) : faster, shorter wind-up, sometimes FAKES a charge (the real one always starts with a big STOMP
//                       + dust ring), calls 2 sock minions (their shadows show where they land)
//   phase 3 (smartest): aims where Kinan is GOING (eyes glow red), adds a jump-slam (a red ring marks the landing spot a
//                       full second ahead; be in the air or out of the ring), calls 2 alert minions
// Contact from the side hurts; landing on its head while it is not dizzy just bounces Kinan off (no damage).
import * as THREE from 'three';
import { dBox, dSphere, dCyl, bake, toyMat } from './props.js';
import { roundedBoxGeo } from './build.js';
import { clamp, dampAngle, TAU } from './util.js';

const PH = {
  stalk: [2.6, 3.6, 4.6], stalkT: [2.2, 1.5, 1.1],
  windup: [1.15, 0.85, 0.7], charge: [12, 15, 17], dizzy: [2.6, 2.1, 1.7],
  feint: [0, 0.4, 0.3], slam: [0, 0, 0.5],
};
export const BOSS_TIMING = PH;

export class Boss {
  constructor(ent, d) {
    this.ent = ent; this.g = ent.g; this.def = d;
    this.name = d.name || 'BIG BRICK';
    this.pos = new THREE.Vector3(...d.pos); this.home = this.pos.clone();
    this.arena = d.arena; this.hpMax = d.hp || 3; this.hp = this.hpMax; this.phase = 1;
    this.S = d.scale || 2.0; this.R = 1.15 * this.S; this.H = 2.2 * this.S;
    this.state = 'sleep'; this.st = 0; this.yaw = Math.PI; this.alive = true; this.t = 0;
    this.aim = new THREE.Vector3(); this.log = []; this.hits = 0; this.feinted = false; this.attackN = 0;
    this.build(d.color || '#e8473c');
    this.ring = this.makeRing();
  }

  build(color) {
    const grp = new THREE.Group(); const body = new THREE.Group(); body.position.y = 0.45; grp.add(body);
    const m = toyMat(color, 0.3, { envMapIntensity: 0.9 });
    const blk = new THREE.Mesh(roundedBoxGeo(2.2, 1.5, 1.7, 0.22, 2), m); blk.position.y = 0.75; body.add(blk);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.3, 14), m); s.position.set(sx * 0.55, 1.6, sz * 0.42); body.add(s); }
    const ew = toyMat('#ffffff', 0.2);
    this.pupilMat = new THREE.MeshStandardMaterial({ color: '#1b1220', roughness: 0.2, emissive: '#ff0000', emissiveIntensity: 0 });
    for (const sx of [-1, 1]) {
      dSphere(body, sx * 0.45, 0.85, 0.82, 0.28, null, { mat: ew, s: [1, 1.1, 0.5] });
      dSphere(body, sx * 0.42, 0.8, 0.94, 0.13, null, { mat: this.pupilMat, s: [1, 1.1, 0.5] });
      const brow = dBox(body, sx * 0.45, 1.12, 0.86, 0.6, 0.14, 0.12, '#1b1220', { r: 0.05 }); brow.rotation.z = sx * -0.35;
    }
    dBox(body, 0, 0.35, 0.86, 0.7, 0.14, 0.1, '#5a1a22', { r: 0.05 });
    // a crown so everyone knows it is the boss
    const crown = new THREE.Group(); crown.position.y = 1.78; body.add(crown);
    dCyl(crown, 0, 0, 0, 0.62, 0.22, '#f6c445');
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; const c = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.4, 6), toyMat('#f6c445', 0.3)); c.position.set(Math.cos(a) * 0.5, 0.4, Math.sin(a) * 0.5); crown.add(c); dSphere(crown, Math.cos(a) * 0.5, 0.62, Math.sin(a) * 0.5, 0.07, i % 2 ? '#e8364b' : '#3f8fe8'); }
    const feet = [];
    for (const sx of [-1, 1]) { const f = new THREE.Group(); f.position.set(sx * 0.6, 0, 0); grp.add(f); dSphere(f, 0, 0.22, 0.15, 0.3, '#2a2a33', { s: [1, 0.7, 1.4] }); feet.push(f); }
    bake(crown);
    // "!" sign
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'); x.font = "700 56px 'Pixelify Sans', monospace"; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.lineWidth = 8; x.strokeStyle = '#1b1220'; x.strokeText('!', 32, 36); x.fillStyle = '#ff4a4a'; x.fillText('!', 32, 36);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    this.mark = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
    this.mark.scale.set(0.8, 0.8, 1); this.mark.position.y = 3.0; this.mark.visible = false; grp.add(this.mark);
    grp.scale.setScalar(this.S);
    grp.position.copy(this.pos);
    this.g.scene.add(grp);
    this.grp = grp; this.body = body; this.feet = feet;
  }
  makeRing() {
    const r = new THREE.Mesh(new THREE.RingGeometry(4.2, 5.2, 40), new THREE.MeshBasicMaterial({ color: '#ff3b3b', transparent: true, opacity: 0.6, depthWrite: false }));
    r.rotation.x = -Math.PI / 2; r.visible = false; r.renderOrder = 4;
    this.g.scene.add(r);
    return r;
  }

  set(s, t = 0) { if (this.state !== s) { this.log.push(s); if (this.log.length > 40) this.log.shift(); } this.state = s; this.st = t; }
  get top() { return this.pos.y + this.H * (this.state === 'dizzy' ? 0.58 : 1); }
  get vulnerable() { return this.state === 'dizzy'; }
  stun(t) { if (this.state === 'windup' || this.state === 'stalk') { this.set('stalk', 0); this.stunT = t; } }

  inArena(x, z, pad = 0) { const a = this.arena; return x > a[0] + pad && x < a[2] - pad && z > a[1] + pad && z < a[3] - pad; }

  update(dt, pl) {
    if (!this.alive) { this.updateDead(dt); return; }
    this.t += dt; this.st -= dt; if (this.stunT > 0) this.stunT -= dt;
    const pp = pl.pos, i = this.phase - 1;
    const dx = pp.x - this.pos.x, dz = pp.z - this.pos.z, dist = Math.hypot(dx, dz);
    let moving = false, squash = 1, shake = 0, lift = 0;
    this.mark.visible = false;
    this.pupilMat.emissiveIntensity = this.phase >= 3 ? 1.2 : 0;
    switch (this.state) {
      case 'sleep':
        if (dist < (this.def.wakeR || 16) && Math.abs(pp.y - this.pos.y) < 4) {
          this.set('intro', 1.8);
          this.g.hud.banner(this.name + '!', this.def.intro || 'Dodge the charge. When it is DIZZY, jump on its head!', 2.6);
          this.g.sfx('roar'); this.g.camRig.shake(0.4);
        }
        break;
      case 'intro':
        this.yaw = dampAngle(this.yaw, Math.atan2(dx, dz), 4, dt);
        lift = Math.abs(Math.sin(this.t * 10)) * 0.3;
        if (this.st <= 0) this.set('stalk', PH.stalkT[i]);
        break;
      case 'stalk': {
        if (this.stunT > 0) { shake = 0.08; break; }
        this.yaw = dampAngle(this.yaw, Math.atan2(dx, dz), 5, dt);
        if (dist > this.R + 2.5) moving = this.move(dx / dist, dz / dist, PH.stalk[i] * dt);
        if (this.st <= 0) this.chooseAttack(pl);
        break;
      }
      case 'windup': {
        // telegraph: crouch, shake, flashing red "!"
        squash = 0.82; shake = 0.12;
        this.mark.visible = Math.floor(this.t * 10) % 2 === 0;
        const aim = this.aimPoint(pl);
        this.yaw = dampAngle(this.yaw, Math.atan2(aim.x - this.pos.x, aim.z - this.pos.z), 6, dt);
        if (this.feint && this.st < this.feintAt) { this.set('feint', PH.feint[i]); this.g.sfx('huh'); this.feinted = true; break; }
        if (this.st <= 0) {
          const a = this.aimPoint(pl);
          let ax = a.x - this.pos.x, az = a.z - this.pos.z; const al = Math.hypot(ax, az) || 1; ax /= al; az /= al;
          this.aim.set(ax, 0, az); this.yaw = Math.atan2(ax, az);
          this.set('charge', 3.0); this.g.sfx('lunge'); this.attackN++;
        }
        break;
      }
      case 'feint':
        // fake! hop back, then the REAL charge (always starts with a stomp + dust ring)
        lift = Math.sin((PH.feint[i] - this.st) / PH.feint[i] * Math.PI) * 0.8;
        if (this.st <= 0) { this.feint = false; this.realStomp(); this.set('windup', PH.windup[i] * 0.8); }
        break;
      case 'charge': {
        const step = PH.charge[i] * dt;
        moving = true;
        if (Math.random() < dt * 20) this.g.particles.dust(this.pos, 2, 1.2);
        const ok = this.move(this.aim.x, this.aim.z, step, true);
        if (!ok) { this.set('dizzy', PH.dizzy[i]); this.g.sfx('bonk'); this.g.sfx('pound'); this.g.camRig.shake(0.5); this.g.particles.ring(this.pos.clone().add(new THREE.Vector3(this.aim.x * this.R, 1, this.aim.z * this.R)), 16, '#ffffff'); }
        else if (this.st <= 0) this.set('stalk', PH.stalkT[i]);
        break;
      }
      case 'leap': {
        // jump-slam: arc to the marked spot
        const k = 1 - Math.max(0, this.st) / 1.0;
        this.pos.x = this.from.x + (this.slamAt.x - this.from.x) * k;
        this.pos.z = this.from.z + (this.slamAt.z - this.from.z) * k;
        this.pos.y = this.home.y + Math.sin(k * Math.PI) * 9;
        this.ring.visible = true; this.ring.position.set(this.slamAt.x, this.home.y + 0.06, this.slamAt.z);
        this.ring.material.opacity = 0.35 + 0.35 * Math.abs(Math.sin(this.t * 12));
        if (this.st <= 0) {
          this.pos.set(this.slamAt.x, this.home.y, this.slamAt.z); this.ring.visible = false;
          this.g.sfx('pound'); this.g.camRig.shake(0.6); this.g.particles.ring(this.pos, 30, '#ffd23f'); this.g.particles.dust(this.pos, 16, 3);
          if (pl.grounded && Math.hypot(pp.x - this.pos.x, pp.z - this.pos.z) < 5.2 && Math.abs(pp.y - this.pos.y) < 1.2) pl.hurt(this.pos.x, this.pos.z);
          this.set('dizzy', PH.dizzy[i] * 0.85);
        }
        break;
      }
      case 'dizzy':
        squash = 0.58;
        this.body.rotation.z = Math.sin(this.t * 7) * 0.2;
        if (Math.random() < dt * 10) this.g.particles.emit(this.pos.x + Math.cos(this.t * 5) * 1.6, this.top + 0.6, this.pos.z + Math.sin(this.t * 5) * 1.6, 0, 0.4, 0, '#fff2a0', 0.5, 0.6, 0, 0);
        if (this.st <= 0) { this.body.rotation.z = 0; this.set('stalk', PH.stalkT[i]); }
        break;
      case 'hit':
        // hurt: back off to the middle, then come back smarter
        squash = 0.7 + Math.sin(this.t * 30) * 0.1;
        { const c = this.center(); const hx = c.x - this.pos.x, hz = c.z - this.pos.z, hl = Math.hypot(hx, hz); if (hl > 0.5) moving = this.move(hx / hl, hz / hl, 6 * dt); }
        if (this.st <= 0) { this.body.rotation.z = 0; this.set('stalk', PH.stalkT[this.phase - 1]); }
        break;
    }
    this.contact(pl);
    this.g.camRig.focus = this.state === 'sleep' ? null : this.pos;
    // animate
    const ph = this.t * (this.state === 'charge' ? 16 : 7);
    const sy = squash, sxz = 1 / Math.sqrt(sy);
    this.grp.scale.set(this.S * sxz, this.S * sy, this.S * sxz);
    this.grp.position.set(this.pos.x + (shake ? (Math.random() - 0.5) * shake * 3 : 0), this.pos.y + lift + (moving && this.state !== 'leap' ? Math.abs(Math.sin(ph)) * 0.25 : 0), this.pos.z);
    this.grp.rotation.y = this.yaw;
    this.feet[0].position.z = moving ? Math.sin(ph) * 0.3 : 0; this.feet[1].position.z = moving ? -Math.sin(ph) * 0.3 : 0;
    this.body.rotation.x = this.state === 'charge' ? 0.28 : 0;
  }

  center() { const a = this.arena; return new THREE.Vector3((a[0] + a[2]) / 2, this.home.y, (a[1] + a[3]) / 2); }

  // where to charge: phase 3 leads the target (predicts where Kinan is going)
  aimPoint(pl) {
    if (this.phase < 3) return pl.pos;
    const d = Math.hypot(pl.pos.x - this.pos.x, pl.pos.z - this.pos.z);
    const tLead = clamp(d / PH.charge[2], 0, 1.1);
    const a = this.arena;
    return new THREE.Vector3(clamp(pl.pos.x + pl.vel.x * tLead, a[0] + 2, a[2] - 2), pl.pos.y, clamp(pl.pos.z + pl.vel.z * tLead, a[1] + 2, a[3] - 2));
  }

  chooseAttack(pl) {
    const i = this.phase - 1;
    if (this.phase >= 3 && this.attackN % 2 === 1) {
      // jump-slam at where Kinan is going
      const a = this.aimPoint(pl);
      this.from = this.pos.clone(); this.slamAt = new THREE.Vector3(a.x, this.home.y, a.z);
      this.set('leap', 1.0); this.attackN++; this.g.sfx('boing');
      return;
    }
    this.feint = this.phase >= 2 && (this.attackN % 3 === 1);
    this.feintAt = PH.windup[i] * 0.45;
    if (!this.feint && this.phase >= 2) this.realStomp();
    this.set('windup', PH.windup[i]); this.g.sfx('windup');
  }
  realStomp() { this.g.sfx('pound'); this.g.particles.ring(this.pos, 20, '#fff6d6'); this.g.camRig.shake(0.15); }

  // move; returns false when blocked by the arena edge (a charge then ends in a bonk)
  move(ux, uz, step, charging = false) {
    const nx = this.pos.x + ux * step, nz = this.pos.z + uz * step;
    if (!this.inArena(nx, nz, this.R + 0.3)) return false;
    this.pos.x = nx; this.pos.z = nz;
    return true;
  }

  contact(pl) {
    if (this.state === 'sleep' || this.state === 'leap' && this.st > 0.15) return;
    const pp = pl.pos, d = Math.hypot(pp.x - this.pos.x, pp.z - this.pos.z);
    if (d > this.R + 0.55 || pp.y > this.top + 0.6 || pp.y + 2 < this.pos.y) return;
    const fromAbove = pl.vel.y < -0.5 && pp.y > this.top - 1.0;
    if (fromAbove || pl.state === 'pound') {
      if (this.vulnerable) { this.takeHit(pl); return; }
      if (this.state !== 'hit') { pl.bounceOff(false); this.g.sfx('boing'); return; }
    }
    if (this.state === 'dizzy' || this.state === 'hit' || this.state === 'intro') {
      // push Kinan out gently
      const k = (this.R + 0.55 - d) / (d || 1);
      pp.x += (pp.x - this.pos.x) * k; pp.z += (pp.z - this.pos.z) * k;
      return;
    }
    if (pl.invuln <= 0) pl.hurt(this.pos.x, this.pos.z);
  }

  pounded(pos) {
    if (!this.alive || !this.vulnerable) return;
    if (Math.hypot(pos.x - this.pos.x, pos.z - this.pos.z) < this.R + 1.2 && pos.y >= this.top - 1.2) this.takeHit(this.g.player);
  }

  takeHit(pl) {
    this.hp--; this.hits++;
    pl.bounceOff(true); pl.body.vel.y = 20;
    this.g.sfx('stomp'); this.g.sfx('bonk'); this.g.camRig.shake(0.5);
    this.g.particles.sparkle(new THREE.Vector3(this.pos.x, this.top + 0.5, this.pos.z), '#ffffff', 24, 7);
    this.g.stats.bossHits = (this.g.stats.bossHits || 0) + 1;
    if (this.hp <= 0) { this.die(); return; }
    this.phase = Math.min(3, this.phase + 1);
    this.set('hit', 1.3);
    this.feinted = false; this.attackN = 0;
    const msg = this.phase === 2
      ? ['GETTING SMARTER!', 'It FAKES charges now. The real one starts with a big STOMP.']
      : ['SMARTEST!', 'It aims where you are GOING and jumps! Watch the RED RING.'];
    this.g.hud.banner(this.name + ' IS ' + msg[0], msg[1], 3.0);
    this.callMinions();
  }

  callMinions() {
    const a = this.arena, n = 2;
    for (let k = 0; k < n; k++) {
      const x = a[0] + 4 + Math.random() * (a[2] - a[0] - 8), z = a[1] + 4 + Math.random() * (a[3] - a[1] - 8);
      const tier = this.phase >= 3 ? 'alert' : 'dumb';
      const e = this.ent.addEnemy({ type: 'sock', tier, pos: [x, this.home.y + 14, z], patrol: [[x - 3, z], [x + 3, z]], color: tier === 'alert' ? '#ffe0ec' : '#fff3c4', sight: 9 });
      e.home.y = this.home.y; e.minion = true;
    }
    this.g.sfx('alert');
  }

  die() {
    this.alive = false; this.state = 'defeat'; this.deadT = 1.4; this.log.push('defeat');
    this.g.camRig.focus = null;
    this.g.sfx('clear'); this.g.camRig.shake(0.6);
    this.g.hud.banner(this.name + ' WAS BEATEN!', 'A golden candle appeared!', 3.0);
    for (const e of this.ent.enemies) if (e.alive && e.minion) this.ent.defeat(e, this.g.player, false);
    const c = this.center();
    const s = { pos: [c.x, c.y + 3.2, c.z], name: this.def.prize || 'BOSS BEATER' };
    this.ent.addStar(s, this.ent.stars.length); this.ent.totalGolden = this.ent.stars.length;
    this.g.hud.stars(this.g.starsGot, this.ent.totalGolden);
    if (this.ent.goal && this.ent.goal.locked) { this.ent.goal.locked = false; this.ent.goal.grp.visible = true; }
  }
  updateDead(dt) {
    if (this.deadT === undefined) return;
    this.deadT -= dt;
    const k = Math.max(0, this.deadT / 1.4);
    this.grp.scale.set(this.S * (1 + (1 - k)), this.S * k, this.S * (1 + (1 - k)));
    this.grp.rotation.y += dt * 10;
    if (Math.random() < dt * 30) this.g.particles.confetti(new THREE.Vector3(this.pos.x, this.pos.y + 3, this.pos.z), 4);
    if (this.deadT <= 0) { this.grp.visible = false; this.g.particles.poof(this.pos, '#ffffff', 30); this.deadT = undefined; }
  }

  info() { return { state: this.state, phase: this.phase, hp: this.hp, alive: this.alive, pos: [+this.pos.x.toFixed(2), +this.pos.y.toFixed(2), +this.pos.z.toFixed(2)], log: this.log.slice(-12), feinted: this.feinted, hits: this.hits }; }
}

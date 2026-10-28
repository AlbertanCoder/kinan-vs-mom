// Kinan the player: Mario-style 3D movement.
//  - analog speed with acceleration / deceleration, quick turns, skid when reversing at speed
//  - Shift (or full stick) runs
//  - variable jump height (let go early = short hop), coyote time, jump buffering
//  - chained jumps: jump again right after landing for a higher 2nd jump, then a flipping 3rd jump
//  - DOUBLE JUMP: press jump again in the air (not after the flipping 3rd jump)
//  - WALL JUMP: slide down a tall wall (hold toward it), press jump to kick off the other way
//  - LEDGE GRAB: Kinan catches edges he just misses; jump (or push toward the wall) pulls him up, pull back drops
//  - CLIMB: walk into anything tagged climb:true (bookshelves...), up/down/sideways, jump kicks off, the top pulls up
//  - BOXES: ACTION picks up / throws / puts down toy blocks and crates, grabs heavy crates (push + pull),
//    walking into a heavy crate pushes it; bonk boxes from below, butt slam them from above
//  - butt slam (ground pound): press Shift or ACTION in the air: spin, slam, shockwave
//  - bounce pads (bed, trampoline, ball pit), moving platforms carry him
//  - power-ups from ? boxes: party popper, party hat, lasso, umbrella, cake (sugar rush), heart
import * as THREE from 'three';
import { stepBody, carry, spaceFree, topAt, circleTouches } from './physics.js';
import { clamp, damp, angleDiff, wrapAngle } from './util.js';
import { KinanRig } from './kinan.js';

const P = {
  walk: 8.0, run: 13.0, accel: 34, decel: 40, skidDecel: 70,
  turnFast: 16, turnSlow: 7.5, airAccel: 26, airTurn: 7,
  jump: [15.2, 18.6, 22.0], runJumpBonus: 0.12,
  gUp: 40, gCut: 95, gDown: 52, maxFall: 42,
  coyote: 0.12, buffer: 0.15, chainWindow: 0.22,
  poundHover: 0.26, poundSpeed: 40, stompBounce: 13, stompBounceHeld: 18.5,
  airJump: 14.5,                         // double jump
  wallSlide: 4.5, kickH: 9.5, kickV: 16, kickLock: 0.24,
  ledgeLo: 1.0, ledgeHi: 2.35, hang: 1.95, climbUpTime: 0.34,
  climbUp: 4.4, climbSide: 3.2,
  push: 3.0, pull: 2.6,
  throwH: 12, throwV: 6.5,
};
export const MOVES = P;

export class Player {
  constructor(game, model) {
    this.game = game;
    this.root = new THREE.Group();        // at feet, turned to facing
    this.squashG = new THREE.Group();     // squash & stretch
    this.spinG = new THREE.Group();       // flips, spins around the body centre
    this.spinG.position.y = 1.0;
    model.position.y = -1.0;
    this.root.add(this.squashG); this.squashG.add(this.spinG); this.spinG.add(model);
    this.model = model;
    this.rig = new KinanRig(model);
    this.body = { pos: new THREE.Vector3(), vel: new THREE.Vector3(), r: 0.45, h: 2.0, step: 0.5, snap: 0.65, grounded: false, ground: null, lastVy: 0 };
    this.facing = 0; this.speed = 0;
    this.state = 'ground';
    this.t = 0;
    this.sinceGround = 0; this.sinceLand = 9; this.bufferT = 9;
    this.chain = 0; this.flipT = 0;
    this.poundT = 0; this.landT = 0; this.hurtT = 0; this.invuln = 0; this.cheerT = 0; this.skidding = false;
    this.sy = 1; this.sv = 0;
    this.hearts = 3; this.maxHearts = 3;
    this.frozen = false;
    this.ev = {};
    this.animMode = 'idle';
    // new moves
    this.airJumps = 1; this.wallT = 9; this.wallN = [0, 1]; this.wallC = null; this.lastKickN = null; this.kickLock = 0;
    this.ledge = null; this.climbUpS = null; this.climbS = null; this.ledgeCd = 0; this.climbCd = 0; this.climbPushT = 0;
    this.carrying = null; this.grab = null; this.pushT = 0; this.pushing = false; this.pulling = false; this.throwT = 0; this.liftT = 0;
    this.touch = null; this.preVel = new THREE.Vector3();
    this.moveDir = [0, 0]; this.moveMag = 0;
    this.counts = { doubleJumps: 0, wallKicks: 0, ledgeGrabs: 0, climbs: 0, pullUps: 0, throws: 0, pickUps: 0 };
    // power-ups + pet perks
    this.pw = { popper: false, hat: false, lasso: false, umbrella: false, rush: 0 };
    this.floating = false; this.knockMul = 1; this.hunterReady = false;
    this.umbrellaMesh = makeUmbrella(); this.umbrellaMesh.visible = false; this.root.add(this.umbrellaMesh);
  }

  get pos() { return this.body.pos; }
  get vel() { return this.body.vel; }
  get grounded() { return this.body.grounded; }

  place(x, y, z, yawDeg = 0) {
    this.body.pos.set(x, y, z); this.body.vel.set(0, 0, 0);
    this.facing = yawDeg * Math.PI / 180; this.speed = 0;
    this.body.grounded = false; this.state = 'air'; this.chain = 0;
    this.ledge = null; this.climbS = null; this.climbUpS = null; this.grab = null; this.airJumps = 1; this.lastKickN = null;
    if (this.carrying) this.game.entities.boxes.drop(this.carrying, this);
    this.sync();
  }

  squash(amount) { this.sy = 1 - amount; this.sv = 0; }
  stretch(amount) { this.sy = 1 + amount; this.sv = 0; }

  jumpNow(vy, kind = 'jump') {
    this.body.vel.y = vy; this.body.grounded = false; this.state = 'air'; this.sinceGround = 9;
    this.stretch(0.16);
    this.game.sfx(kind === 'flip' ? 'jump3' : kind === 'jump2' ? 'jump2' : kind === 'boost' ? 'boing' : 'jump');
    this.game.particles.dust(this.pos, 6, 1.2);
  }

  bounceOff(held) {
    // after stomping an enemy
    this.body.vel.y = held ? P.stompBounceHeld : P.stompBounce;
    this.state = 'air'; this.body.grounded = false; this.poundT = 0; this.chain = 1; this.sinceGround = 9;
    this.airJumps = 1; this.lastKickN = null;
    this.stretch(0.18);
  }

  hurt(fromX, fromZ) {
    if (this.invuln > 0 || this.state === 'dead' || this.frozen) return false;
    if (this.pw.rush > 0) return false;
    const g = this.game;
    if (this.pw.hat) {
      this.pw.hat = false; this.invuln = 1.4; g.sfx('bonk'); g.hud.toast('THE PARTY HAT SAVED YOU!', 1.4); g.hud.powers(this.pw);
      g.particles.confetti(new THREE.Vector3(this.pos.x, this.pos.y + 2.4, this.pos.z), 16);
      this.knock(fromX, fromZ, 0.6); return true;
    }
    if (this.hearts <= 1 && this.hunterReady) {
      this.hunterReady = false; this.invuln = 2.4; g.sfx('woof'); g.hud.toast('HUNTER TO THE RESCUE!', 1.8);
      g.entities.petCheer('dog');
      this.knock(fromX, fromZ, 0.5); return true;
    }
    this.hearts -= 1;
    g.sfx('hurt');
    g.hud.hearts(this.hearts, this.maxHearts);
    if (this.carrying) g.entities.boxes.drop(this.carrying, this);
    this.knock(fromX, fromZ, 1);
    this.invuln = 1.6;
    g.camRig.shake(0.35);
    if (this.hearts <= 0) g.playerDown();
    return true;
  }
  knock(fromX, fromZ, k) {
    let dx = this.pos.x - fromX, dz = this.pos.z - fromZ;
    const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
    const m = k * this.knockMul;
    this.body.vel.set(dx * 9 * m, 9 * Math.max(0.6, m), dz * 9 * m);
    this.body.grounded = false; this.speed = 0;
    this.ledge = null; this.climbS = null; this.grab = null;
    this.state = 'hurt'; this.hurtT = 0.55 * Math.max(0.5, m); this.poundT = 0;
  }

  heal(n = 1) { this.hearts = Math.min(this.maxHearts, this.hearts + n); this.game.hud.hearts(this.hearts, this.maxHearts); }

  update(dt, input, camYaw) {
    this.t += dt;
    const b = this.body, game = this.game;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.cheerT > 0) { this.cheerT -= dt; }
    this.kickLock = Math.max(0, this.kickLock - dt); this.ledgeCd -= dt; this.climbCd -= dt; this.throwT -= dt; this.liftT -= dt;
    if (this.pw.rush > 0) { this.pw.rush -= dt; if (this.pw.rush <= 0) { this.pw.rush = 0; game.hud.powers(this.pw); } else if (Math.random() < dt * 30) game.particles.emit(b.pos.x + (Math.random() - 0.5), b.pos.y + Math.random() * 2, b.pos.z + (Math.random() - 0.5), 0, 1, 0, ['#ff5fa2', '#ffd23f', '#7ec8ff'][(Math.random() * 3) | 0], 0.35, 0.5, 0, 1); }

    // ---- intent (camera relative)
    let mx = 0, mz = 0, mag = 0;
    if (!this.frozen && this.state !== 'dead') {
      const ix = input.move.x, iy = input.move.y;
      mag = Math.min(1, Math.hypot(ix, iy));
      const s = Math.sin(camYaw), c = Math.cos(camYaw);
      // forward = away from camera = (-sin, -cos); right = (cos, -sin)
      mx = ix * c + iy * -s; mz = ix * -s + iy * -c;
      const l = Math.hypot(mx, mz); if (l > 0) { mx /= l; mz /= l; }
    }
    this.moveDir[0] = mx; this.moveDir[1] = mz; this.moveMag = mag;
    const wantYaw = mag > 0.05 ? Math.atan2(mx, mz) : this.facing;
    const running = input.runHeld || this.pw.rush > 0;
    const topSpeed = (running ? P.run : P.walk) * (mag > 0.05 ? Math.max(0.3, mag) : 0) * (this.pw.rush > 0 ? 1.4 : 1);
    const into = (n) => (mag > 0.05 ? -(mx * n[0] + mz * n[1]) * mag : 0);   // how hard the stick pushes toward a wall with normal n

    // ---- buffered jump / pound / action input
    if (input.jumpPressed && !this.frozen) this.bufferT = 0; else this.bufferT += dt;
    const act = input.actionPressed && !this.frozen && this.state !== 'dead';
    const poundPress = (input.poundPressed || (act && !this.carrying)) && !this.frozen;

    // ---- moving platform carry (once per frame)
    if (b.grounded && b.ground && b.ground.moving) {
      const dyaw = carry(b.ground, b.pos);
      this.facing += dyaw;
    }

    // ---- state logic
    let doPhysics = true;
    if (this.state === 'cheer') {
      this.speed = 0; b.vel.x = b.vel.z = 0;
      if (this.cheerT <= 0) this.state = b.grounded ? 'ground' : 'air';
    }
    if (this.state === 'hurt') {
      this.hurtT -= dt;
      if (this.hurtT <= 0 && b.grounded) this.state = 'ground';
    }
    this.sliding = false; this.pushing = false; this.pulling = false; this.floating = false;
    const T = this.touch;   // wall contact from the previous frame
    if (this.state === 'ground' && b.grounded && b.ground && b.ground.slide) {
      // slide: whoosh downhill, steer a little, can still jump off
      const gc = b.ground, up = gc.h1 > gc.h0 ? 1 : -1;
      const downYaw = Math.atan2(-Math.sin(gc.yaw) * up, -Math.cos(gc.yaw) * up);
      const steer = mag > 0.05 ? clamp(angleDiff(downYaw, wantYaw), -0.6, 0.6) : 0;
      this.facing = wrapAngle(this.facing + angleDiff(this.facing, downYaw + steer) * (1 - Math.exp(-10 * dt)));
      this.speed = Math.min(19, Math.max(this.speed, 5) + 26 * dt);
      b.vel.x = Math.sin(this.facing) * this.speed; b.vel.z = Math.cos(this.facing) * this.speed;
      this.sliding = true; this.skidding = false;
      if (Math.random() < dt * 20) game.particles.emit(b.pos.x, b.pos.y + 0.2, b.pos.z, 0, 1, 0, '#fff6d6', 0.35, 0.4, 0, 2);
      if (this.bufferT < P.buffer) { this.bufferT = 9; this.doJump(); }
    } else if (this.state === 'ground' || this.state === 'land') {
      if (this.state === 'land') { this.landT -= dt; if (this.landT <= 0) this.state = 'ground'; }
      const canMove = this.state === 'ground';
      // ACTION on the ground: carry / throw / put down / grab a heavy crate / confetti
      if (act && canMove) this.groundAction();
      if (this.state === 'grab') { /* started grabbing this frame */ }
      else {
        // turning & speed
        const diff = angleDiff(this.facing, wantYaw);
        if (canMove && mag > 0.05) {
          if (!this.skidding && Math.abs(diff) > 2.3 && this.speed > 7.5) { this.skidding = true; game.sfx('skid'); }
          if (this.skidding) {
            this.speed = Math.max(0, this.speed - P.skidDecel * dt);
            if (this.speed < 1.2) { this.skidding = false; this.facing = wantYaw; }
            if (Math.random() < 0.5) game.particles.dust(b.pos, 1, 0.8);
          } else {
            const turn = this.speed < 3 ? 30 : P.turnFast - (P.turnFast - P.turnSlow) * clamp(this.speed / P.run, 0, 1);
            const step = turn * dt;
            this.facing = wrapAngle(this.facing + clamp(diff, -step, step));
            const align = Math.max(0, Math.cos(angleDiff(this.facing, wantYaw)));
            const target = topSpeed * (0.25 + 0.75 * align);
            this.speed = this.speed < target ? Math.min(target, this.speed + P.accel * dt) : Math.max(target, this.speed - P.decel * dt);
          }
        } else {
          this.skidding = false;
          this.speed = Math.max(0, this.speed - P.decel * dt);
        }
        // pushing a heavy crate by walking into it
        if (canMove && T && T.c.box && T.c.box.kind === 'heavy' && !this.carrying && into([T.nx, T.nz]) > 0.7) {
          this.pushT += dt; this.pushLost = 0;
          if (this.pushT > 0.18) {
            const ax = axisOf(T.nx, T.nz);
            if (game.entities.boxes.tryMove(T.c.box, -ax[0] * P.push * dt, -ax[1] * P.push * dt)) { this.pushing = true; this.speed = P.push + 0.4; }
            else this.speed = Math.min(this.speed, 1);
          }
        } else if ((this.pushLost = (this.pushLost || 0) + dt) > 0.15) { this.pushT = 0; this.pushLost = 0; }
        if (this.pushing) this.pushLost = 0;
        b.vel.x = Math.sin(this.facing) * this.speed;
        b.vel.z = Math.cos(this.facing) * this.speed;
        // start climbing by walking into a climbable surface
        if (canMove && T && T.climb && !this.carrying && this.climbCd <= 0 && into([T.cnx, T.cnz]) > 0.6) {
          this.climbPushT += dt;
          if (this.climbPushT > 0.1) this.startClimb(T.climb, T.cnx, T.cnz);
        } else this.climbPushT = 0;
        // jump
        if (this.state !== 'climb' && this.bufferT < P.buffer && canMove) {
          this.bufferT = 9;
          this.doJump();
        }
      }
    } else if (this.state === 'air') {
      // air control: steer velocity, keep momentum (a wall kick briefly locks steering so he flies off the wall)
      const ctl = this.kickLock > 0 ? 0.25 : 1;
      if (mag > 0.05) {
        const maxH = Math.max(P.walk, this.airMax || 0);
        b.vel.x += mx * P.airAccel * mag * dt * ctl; b.vel.z += mz * P.airAccel * mag * dt * ctl;
        const h = Math.hypot(b.vel.x, b.vel.z);
        if (h > maxH) { b.vel.x *= maxH / h; b.vel.z *= maxH / h; }
        if (this.kickLock <= 0) this.facing = wrapAngle(this.facing + clamp(angleDiff(this.facing, wantYaw), -P.airTurn * dt, P.airTurn * dt));
      } else if (this.kickLock <= 0) {
        // gentle air drag so jumps feel controllable
        const h = Math.hypot(b.vel.x, b.vel.z), nh = Math.max(0, h - 6 * dt);
        if (h > 0) { b.vel.x *= nh / h; b.vel.z *= nh / h; }
      }
      this.speed = Math.hypot(b.vel.x, b.vel.z);
      // umbrella: hold JUMP while falling to float down slowly
      if (this.pw.umbrella && input.jumpHeld && b.vel.y < 0) { this.floating = true; }
      // jumps in the air: coyote jump > wall kick > double jump
      if (this.bufferT < P.buffer) {
        if (this.sinceGround < P.coyote && b.vel.y <= 0.5) { this.bufferT = 9; this.doJump(); }
        else if (this.wallT < 0.14 && this.canKick(this.wallN)) { this.bufferT = 9; this.wallKick(this.wallN); }
        else if (this.bufferT === 0 && this.airJumps > 0 && !this.carrying && !this.noAirJump && !this.nearLanding()) { this.bufferT = 9; this.doubleJump(); }
      }
      // ACTION in the air while carrying = throw
      if (act && this.carrying) this.throwBox();
      // butt slam
      else if (poundPress) {
        const g = game.world.groundAt(b.pos.x, b.pos.z, b.pos.y + 0.1, 0.2);
        if (!g || b.pos.y - g.y > 1.4) { this.state = 'pound'; this.poundT = 0; b.vel.set(0, 0, 0); this.speed = 0; game.sfx('spin'); }
      }
    } else if (this.state === 'pound') {
      this.poundT += dt;
      if (this.poundT < P.poundHover) { b.vel.set(0, 1.5, 0); }
      else { b.vel.x = 0; b.vel.z = 0; b.vel.y = -P.poundSpeed; }
    } else if (this.state === 'wallslide') {
      const n = this.wallN;
      this.facing = Math.atan2(-n[0], -n[1]);
      b.vel.x = -n[0] * 2.0; b.vel.z = -n[1] * 2.0;     // hug the wall (keeps the contact alive)
      this.speed = 0;
      if (this.bufferT < P.buffer && this.canKick(n)) { this.bufferT = 9; this.wallKick(n); }
      else if (into(n) < -0.5 || poundPress) { this.state = 'air'; b.vel.x = n[0] * 3; b.vel.z = n[1] * 3; this.ledgeCd = 0.25; }
    } else if (this.state === 'ledge') {
      doPhysics = false;
      const L = this.ledge;
      L.t += dt; b.vel.set(0, 0, 0); this.speed = 0;
      this.facing = Math.atan2(-L.nx, -L.nz);
      const push = into([L.nx, L.nz]);
      if (L.t > 0.2 && (this.bufferT < P.buffer || push > 0.5)) { this.bufferT = 9; this.startClimbUp(L.top, L.nx, L.nz, L.c); }
      else if (L.t > 0.12 && (push < -0.5 || poundPress)) { this.state = 'air'; this.ledge = null; this.ledgeCd = 0.45; b.vel.set(L.nx * 2.5, 0, L.nz * 2.5); }
    } else if (this.state === 'climbup') {
      doPhysics = false;
      const C = this.climbUpS;
      C.t += dt;
      const k = Math.min(1, C.t / P.climbUpTime);
      const ky = Math.min(1, k / 0.6), kx = Math.max(0, (k - 0.45) / 0.55);
      b.pos.set(C.from.x + (C.to.x - C.from.x) * kx, C.from.y + (C.to.y + 0.02 - C.from.y) * (1 - (1 - ky) * (1 - ky)), C.from.z + (C.to.z - C.from.z) * kx);
      b.vel.set(0, 0, 0); this.speed = 0;
      if (k >= 1) {
        b.pos.copy(C.to);
        const g = game.world.groundAt(b.pos.x, b.pos.z, b.pos.y + 0.3, b.r * 0.55);
        if (g) { b.pos.y = g.y; b.grounded = true; b.ground = g.c; }
        this.state = 'ground'; this.climbUpS = null; this.ledge = null; this.climbS = null; this.sinceLand = 9;
        this.counts.pullUps++;
        doPhysics = true;
      }
    } else if (this.state === 'climb') {
      const C = this.climbS;
      const n = [C.nx, C.nz];
      this.facing = Math.atan2(-n[0], -n[1]);
      const up = this.frozen ? 0 : clamp(input.move.y, -1, 1), side = this.frozen ? 0 : clamp(input.move.x, -1, 1);
      // sideways along the surface, matched to the camera's right
      let tx = n[1], tz = -n[0];
      if (tx * Math.cos(camYaw) + tz * -Math.sin(camYaw) < 0) { tx = -tx; tz = -tz; }
      b.vel.set(-n[0] * 1.2 + tx * side * P.climbSide, up * P.climbUp, -n[1] * 1.2 + tz * side * P.climbSide);
      this.speed = 0;
      C.moving = Math.abs(up) > 0.2 || Math.abs(side) > 0.2;
      if (this.bufferT < P.buffer) {
        this.bufferT = 9;
        this.state = 'air'; this.climbS = null; this.climbCd = 0.35; this.kickLock = 0.2;
        b.vel.set(n[0] * 7.5, 14, n[1] * 7.5); this.airMax = 8; this.facing = Math.atan2(n[0], n[1]);
        this.jumpNow(14, 'jump2'); b.vel.x = n[0] * 7.5; b.vel.z = n[1] * 7.5;
      } else if (act || input.poundPressed) {
        this.state = 'air'; this.climbS = null; this.climbCd = 0.45; b.vel.set(n[0] * 2.5, 0, n[1] * 2.5);
      }
    } else if (this.state === 'grab') {
      doPhysics = false;
      const G = this.grab, box = G.box;
      this.facing = Math.atan2(-G.nx, -G.nz);
      b.vel.set(0, 0, 0); this.speed = 0;
      if (act || this.bufferT < P.buffer || !box.alive || box.state !== 'rest') { this.state = 'ground'; this.grab = null; if (this.bufferT < P.buffer) { this.bufferT = 9; this.doJump(); } }
      else {
        const along = into([G.nx, G.nz]);
        if (Math.abs(along) > 0.35) {
          const d = Math.sign(along) * (along > 0 ? P.push : P.pull) * dt;
          if (d > 0) {
            if (game.entities.boxes.tryMove(box, -G.nx * d, -G.nz * d)) { b.pos.x -= G.nx * d; b.pos.z -= G.nz * d; this.pushing = true; }
          } else {
            const nx = b.pos.x + G.nx * -d, nz = b.pos.z + G.nz * -d;
            const g = game.world.groundAt(nx, nz, b.pos.y + 0.3, b.r * 0.55);
            if (g && Math.abs(g.y - b.pos.y) < 0.3 && spaceFree(game.world, nx, nz, b.pos.y + 0.55, b.pos.y + 1.95, b.r)) {
              if (game.entities.boxes.tryMove(box, G.nx * -d, G.nz * -d, true)) { b.pos.x = nx; b.pos.z = nz; this.pulling = true; }
            }
          }
        }
      }
    }

    // ---- gravity
    if (!b.grounded && doPhysics && this.state !== 'pound' && this.state !== 'climb') {
      let g = b.vel.y > 0 ? (input.jumpHeld || this.state === 'hurt' || this.forceFull ? P.gUp : P.gCut) : P.gDown;
      b.vel.y = Math.max(-P.maxFall, b.vel.y - g * dt);
      if (this.state === 'wallslide') b.vel.y = Math.max(b.vel.y, -P.wallSlide);
      if (this.floating) b.vel.y = Math.max(b.vel.y, -3.0);
    }

    // ---- physics with substeps
    const wasGrounded = b.grounded;
    this.ev.landed = null; this.ev.bonk = null; this.ev.wall = null; this.ev.climb = null;
    this.preVel.copy(b.vel);
    if (doPhysics) {
      const n = Math.max(1, Math.ceil(dt / (1 / 120)));
      const sdt = dt / n;
      for (let i = 0; i < n; i++) {
        stepBody(game.world, b, sdt, this.ev);
        if (this.ev.landed) break;
      }
    }
    if (this.ev.bonk && (this.state === 'air' || this.state === 'climb')) {
      game.sfx('bonk');
      if (this.ev.bonk.onBonk) this.ev.bonk.onBonk(this);
    }
    // wall contact summary (used now and next frame)
    this.touch = this.ev.wall ? { c: this.ev.wall, nx: this.ev.wallNx, nz: this.ev.wallNz, climb: this.ev.climb, cnx: this.ev.climbNx, cnz: this.ev.climbNz } : (this.ev.climb ? { c: this.ev.climb, nx: this.ev.climbNx, nz: this.ev.climbNz, climb: this.ev.climb, cnx: this.ev.climbNx, cnz: this.ev.climbNz } : null);
    // pushing into a wall: lose speed instead of running on the spot
    if (this.ev.wall && b.grounded && this.state === 'ground' && !this.sliding && !this.pushing && !(this.pushT > 0 && this.ev.wall.box)) {
      this.speed = Math.min(this.speed, Math.hypot(b.vel.x, b.vel.z) + 0.6);
    }
    if (doPhysics) this.afterPhysics(dt, into);

    // ---- landing / leaving ground
    if (b.grounded) {
      this.sinceGround = 0; this.airJumps = 1; this.lastKickN = null; this.noAirJump = false;
      if (!wasGrounded && this.ev.landed) this.onLand(this.ev.landed);
      if (this.state === 'wallslide' || this.state === 'climb' && (input.move.y < -0.2 || this.frozen)) { this.state = 'ground'; this.climbS = null; }
    } else if (doPhysics) {
      this.sinceGround += dt;
      if (wasGrounded && (this.state === 'ground' || this.state === 'land')) { this.state = 'air'; this.airMax = this.speed; this.flipT = 0; }
    }
    if (b.grounded && this.state === 'air') this.state = 'ground';
    this.sinceLand += dt;

    // ---- fell out of the world
    if (b.pos.y < game.level.killY) game.fellOut();

    this.animate(dt, wantYaw);
    this.sync();
  }

  // wall slide / ledge grab / climb entry + upkeep, using this frame's contacts
  afterPhysics(dt, into) {
    const b = this.body, game = this.game, T = this.touch;
    const wallOK = (c) => !!c && !c.bounce && !c.noWallJump && (!c.moving || !!c.box) && (c.type !== 'cyl' || (c.r > 2.5 && !c.moving));
    // --- climbing upkeep
    if (this.state === 'climb') {
      const C = this.climbS;
      if (T && T.climb) {
        C.lost = 0; C.c = T.climb;
        C.nx = damp(C.nx, T.cnx, 12, dt); C.nz = damp(C.nz, T.cnz, 12, dt);
        const l = Math.hypot(C.nx, C.nz) || 1; C.nx /= l; C.nz /= l;
      } else C.lost += dt;
      // the very top of the climbable thing: pull up onto it (or stop there if there is no room)
      const top = this.climbTopNear();
      if (b.vel.y > 0.5 && top - b.pos.y < 1.75) {
        if (this.canStandOn(top, C.nx, C.nz)) { this.startClimbUp(top, C.nx, C.nz, C.c); return; }
        b.pos.y = Math.min(b.pos.y, top - 1.75); b.vel.y = 0;
      }
      if (C.lost > 0.15) { this.state = 'air'; this.climbS = null; this.climbCd = 0.3; }
      return;
    }
    if (this.state !== 'air' && this.state !== 'wallslide') { this.wallT += dt; return; }
    // --- climbable surface caught in the air
    if (T && T.climb && !this.carrying && this.climbCd <= 0 && b.vel.y < 9 && (into([T.cnx, T.cnz]) > 0.3 || (this.preVel.x * -T.cnx + this.preVel.z * -T.cnz) > 1.5)) {
      this.startClimb(T.climb, T.cnx, T.cnz); return;
    }
    if (T && wallOK(T.c)) {
      const c = T.c, n = [T.nx, T.nz];
      const top = c.type === 'ramp' ? -Infinity : this.wallTop(c, n);
      const pushIn = into(n) > 0.25 || (this.preVel.x * -n[0] + this.preVel.z * -n[1]) > 1.0;
      // --- ledge grab: the top edge is just above (hands can reach it)
      const dh = top - b.pos.y;
      if (!this.carrying && this.ledgeCd <= 0 && b.vel.y <= 3 && !c.noLedge && pushIn && dh >= P.ledgeLo && dh <= P.ledgeHi && this.canStandOn(top, n[0], n[1])) {
        this.startLedge(top, n[0], n[1], c); return;
      }
      // --- wall slide + wall kick window: a real wall that rises well above Kinan's head (a box he could grab is not one)
      const tall = (c.type === 'ramp' ? topAt(c, b.pos.x, b.pos.z) : top) > b.pos.y + 2.4 && c.minY < b.pos.y + 0.6;
      if (tall) {
        this.wallT = 0; this.wallN = n; this.wallC = c;
        if (this.state === 'air' && !this.carrying && b.vel.y < 2 && into(n) > 0.35 && this.canKick(n)) { this.state = 'wallslide'; this.slideLost = 0; }
        if (this.state === 'wallslide') this.slideLost = 0;
        return;
      }
    }
    this.wallT += dt;
    if (this.state === 'wallslide') { this.slideLost = (this.slideLost || 0) + dt; if (this.slideLost > 0.1) this.state = 'air'; }
  }

  // the real top of the wall Kinan is touching: a tower of separate bricks counts as one wall
  wallTop(c, n) {
    const b = this.body, px = b.pos.x - n[0] * (b.r + 0.12), pz = b.pos.z - n[1] * (b.r + 0.12);
    const list = this.game.world.query(px - 0.3, pz - 0.3, px + 0.3, pz + 0.3, this._wt || (this._wt = []));
    let top = c.maxY;
    for (let grew = true; grew;) {
      grew = false;
      for (const o of list) {
        if (o.type === 'ramp' || o.noWall || o.solid === false || o.maxY <= top + 0.01 || o.minY > top + 0.05) continue;
        if (!circleTouches(o, px, pz, 0.25)) continue;
        top = o.maxY; grew = true;
      }
    }
    return top;
  }

  // highest top of the climbable shapes right around Kinan
  climbTopNear() {
    const b = this.body, R = b.r + 0.7;
    const list = this.game.world.query(b.pos.x - R, b.pos.z - R, b.pos.x + R, b.pos.z + R, this._ctn || (this._ctn = []));
    let top = -Infinity;
    const climbs = list.filter((c) => c.climb);
    for (const c of climbs) if (c.minY < b.pos.y + 2.6 && c.maxY > top) top = c.maxY;
    // follow the shelves upward: boards a short step apart count as one climbable surface
    for (let grew = true; grew;) {
      grew = false;
      for (const c of climbs) if (c.minY <= top + 2.0 && c.maxY > top + 0.01) { top = c.maxY; grew = true; }
    }
    return top;
  }

  // can Kinan stand on top of an edge at height `top`, just past a wall with outward normal (nx,nz)?
  canStandOn(top, nx, nz) {
    const b = this.body, w = this.game.world;
    const sx = b.pos.x - nx * (b.r + 0.6), sz = b.pos.z - nz * (b.r + 0.6);
    const g = w.groundAt(sx, sz, top + 0.05, 0.2);
    if (!g || Math.abs(g.y - top) > 0.06) return false;
    return spaceFree(w, sx, sz, top + 0.06, top + 1.95, b.r * 0.9);
  }

  canKick(n) {
    if (this.carrying) return false;
    if (!this.lastKickN) return true;
    return this.lastKickN[0] * n[0] + this.lastKickN[1] * n[1] < 0.5;   // kicks must alternate walls (no climbing a single wall)
  }

  wallKick(n) {
    const b = this.body;
    this.state = 'air';
    this.facing = Math.atan2(n[0], n[1]);
    this.jumpNow(P.kickV, 'jump2');
    b.vel.x = n[0] * P.kickH; b.vel.z = n[1] * P.kickH;
    this.airMax = P.kickH; this.kickLock = P.kickLock; this.lastKickN = [n[0], n[1]];
    this.forceFull = false; this.wallT = 9; this.chain = 1;
    this.counts.wallKicks++;
    this.forceFull = true;   // every kick is the same height (easy to chain for an 11-year-old)
    this.game.particles.dust(new THREE.Vector3(b.pos.x - n[0] * 0.4, b.pos.y + 1, b.pos.z - n[1] * 0.4), 6, 1);
  }

  doubleJump() {
    const b = this.body;
    const vy = Math.max(P.airJump, b.vel.y * 0.5 + 10);
    this.airJumps--;
    this.flipT = 0.0001; this.forceFull = false;
    this.jumpNow(vy, 'jump2');
    this.game.particles.ring(new THREE.Vector3(b.pos.x, b.pos.y - 0.1, b.pos.z), 12, '#fff2b0');
    this.counts.doubleJumps++;
  }

  nearLanding() {
    // a jump pressed just before landing is kept for the landing jump instead of spending the double jump
    const b = this.body;
    if (b.vel.y > 0) return false;
    const g = this.game.world.groundAt(b.pos.x, b.pos.z, b.pos.y + 0.1, b.r * 0.55);
    return !!g && b.pos.y - g.y < Math.max(0.45, -b.vel.y * 0.07);
  }

  startLedge(top, nx, nz, c) {
    const b = this.body;
    this.state = 'ledge';
    this.ledge = { top, nx, nz, c, t: 0 };
    b.pos.y = top - P.hang; b.vel.set(0, 0, 0); this.speed = 0;
    this.facing = Math.atan2(-nx, -nz);
    this.counts.ledgeGrabs++;
    this.game.sfx('grab');
    this.game.firstTime('ledge', 'You GRABBED the edge! Press JUMP or push forward to pull up. Pull back to let go.');
  }

  startClimbUp(top, nx, nz, c) {
    const b = this.body;
    this.state = 'climbup';
    this.climbUpS = { t: 0, from: b.pos.clone(), to: new THREE.Vector3(b.pos.x - nx * (b.r + 0.6), top, b.pos.z - nz * (b.r + 0.6)), c };
    this.game.sfx('climb');
  }

  startClimb(c, nx, nz) {
    const b = this.body;
    this.state = 'climb';
    this.climbS = { c, nx, nz, lost: 0, top: c.maxY, moving: false };
    b.vel.set(0, 0, 0); this.speed = 0; this.climbPushT = 0;
    this.facing = Math.atan2(-nx, -nz);
    this.counts.climbs++;
    this.game.sfx('grab');
    this.game.firstTime('climb', 'CLIMBING! Push UP and DOWN, or sideways. JUMP kicks off. Climb to the top to pull yourself up.');
  }

  groundAction() {
    const g = this.game, box = this.carrying;
    if (box) {
      if (this.speed < 2.5 && g.entities.boxes.setDown(box, this)) { this.carrying = null; return; }
      this.throwBox(); return;
    }
    const near = g.entities.boxes.interactable(this);
    if (near) {
      if (near.kind === 'heavy') {
        const ax = axisOf(near.nx, near.nz);
        this.state = 'grab'; this.grab = { box: near.box, nx: ax[0], nz: ax[1] };
        this.speed = 0; g.sfx('grab');
        g.firstTime('grab', 'GRABBED the crate! Push the stick toward it to PUSH, away from it to PULL. ACTION lets go.');
        return;
      }
      if (g.entities.boxes.pickUp(near.box, this)) { this.carrying = near.box; this.liftT = 0.25; this.counts.pickUps++; g.sfx('grab'); g.firstTime('carry', 'Got it! ACTION while moving THROWS it. Stand still and press ACTION to put it down (on top of another box to stack!).'); return; }
    }
    if (this.pw.popper) { g.entities.shootConfetti(this); this.throwT = 0.22; }
  }

  throwBox() {
    const box = this.carrying; if (!box) return;
    this.carrying = null; this.throwT = 0.3; this.counts.throws++;
    this.game.entities.boxes.throwBox(box, this, P.throwH + this.speed * 0.4, P.throwV + Math.max(0, this.body.vel.y * 0.3));
    this.game.sfx('throw');
  }

  doJump() {
    const b = this.body;
    const sp = this.speed;
    // Ginger's power: jumping from her paw prints = a big KITTEN BOOST
    const boost = this.carrying ? 0 : this.game.entities.pawBoost(this);
    if (boost) {
      this.chain = 1; this.airMax = Math.max(sp, P.walk); this.flipT = 0.0001; this.forceFull = true;
      this.jumpNow(boost, 'boost');
      return;
    }
    if (this.sinceLand < P.chainWindow && this.chain >= 1 && sp > 4) this.chain = Math.min(3, this.chain + 1);
    else this.chain = 1;
    if (this.chain === 3 && sp < 7) this.chain = 2;
    if (this.carrying) this.chain = 1;
    const vy = P.jump[this.chain - 1] + P.runJumpBonus * sp;
    this.airMax = Math.max(sp, P.walk);
    this.flipT = this.chain === 3 ? 0.0001 : 0;
    this.forceFull = false;
    this.noAirJump = this.chain === 3;   // jump, higher, highest: no double jump after the flip
    this.jumpNow(vy, this.chain === 3 ? 'flip' : this.chain === 2 ? 'jump2' : 'jump');
  }

  onLand(info) {
    const b = this.body;
    const c = info.c;
    const impact = -(info.vy || 0);
    this.sinceLand = 0; this.flipT = 0;
    if (this.state === 'pound') {
      this.game.groundPound(b.pos.clone(), c);
      if (c && c.bounce) { this.bouncePad(c, true); return; }
      this.state = 'land'; this.landT = 0.28; this.speed = 0;
      this.squash(0.4);
      return;
    }
    if (c && c.bounce) { this.bouncePad(c, false); return; }
    if (this.state === 'hurt') { this.squash(0.25); return; }
    this.squash(clamp(impact / 70, 0.08, 0.32));
    if (impact > 30) { this.state = 'land'; this.landT = 0.08; this.game.particles.dust(b.pos, 8, 1.6); this.game.sfx('land'); }
    else if (impact > 12) { this.game.particles.dust(b.pos, 4, 1.0); this.state = 'ground'; }
    else this.state = 'ground';
  }

  bouncePad(c, pounded) {
    const held = this.game.input.jumpHeld;
    const vy = c.bounce * (pounded ? 1.25 : held ? 1.12 : 1);
    this.body.vel.y = vy; this.body.grounded = false; this.state = 'air'; this.sinceGround = 9;
    this.forceFull = true; this.chain = 0; this.airMax = Math.max(this.speed, P.walk);
    this.squash(0.35);
    this.game.sfx('boing');
    if (c.onBounce) c.onBounce();
  }

  cheer(time = 1.3) { this.state = 'cheer'; this.cheerT = time; }

  animate(dt, wantYaw) {
    const b = this.body;
    // squash & stretch spring
    this.sv += (1 - this.sy) * 260 * dt; this.sv *= Math.exp(-14 * dt); this.sy += this.sv * dt;
    const sy = clamp(this.sy, 0.55, 1.4), sxz = 1 / Math.sqrt(sy);
    this.squashG.scale.set(sxz, sy, sxz);

    let mode = 'idle', spin = 0;
    const sp = this.speed;
    switch (this.state) {
      case 'ground':
        mode = this.sliding ? 'slide' : this.pushing ? 'push' : this.skidding ? 'skid' : sp > 10.5 ? 'run' : sp > 0.6 ? 'walk' : 'idle';
        break;
      case 'land': mode = 'land'; break;
      case 'air':
        if (this.flipT > 0) {
          this.flipT += dt;
          mode = 'flip';
          spin = Math.min(1, this.flipT / 0.62) * Math.PI * 2;
          if (this.flipT > 0.62) { this.flipT = 0; }
        } else mode = this.floating ? 'float' : b.vel.y > 1.5 ? 'jump' : 'fall';
        break;
      case 'pound':
        mode = this.poundT < P.poundHover ? 'tuck' : 'pound';
        spin = this.poundT < P.poundHover ? (this.poundT / P.poundHover) * Math.PI * 2 : 0;
        break;
      case 'hurt': mode = 'hurt'; break;
      case 'cheer': mode = 'cheer'; break;
      case 'wallslide': mode = 'wallslide'; break;
      case 'ledge': mode = 'hang'; break;
      case 'climbup': mode = 'climbup'; break;
      case 'climb': mode = this.climbS && this.climbS.moving ? 'climb' : 'climbIdle'; break;
      case 'grab': mode = this.pulling ? 'pull' : 'push'; break;
    }
    if (this.carrying && (mode === 'idle' || mode === 'walk' || mode === 'run' || mode === 'jump' || mode === 'fall' || mode === 'land' || mode === 'skid')) mode = mode === 'idle' ? 'carryIdle' : mode === 'jump' || mode === 'fall' ? 'carryAir' : 'carry';
    if (this.throwT > 0 && !this.carrying && (this.state === 'ground' || this.state === 'air')) mode = 'throw';
    this.animMode = mode;
    this.spinG.rotation.x = spin;
    // lean into speed, tilt into turns
    const lean = this.sliding ? -0.35 : mode === 'push' ? 0.32 : mode === 'pull' ? -0.22 : this.state === 'ground' ? clamp(sp / P.run, 0, 1) * 0.18 : 0;
    const turnLean = this.state === 'ground' ? clamp(angleDiff(this.facing, wantYaw), -1, 1) * clamp(sp / P.run, 0, 1) * -0.18 : 0;
    this.leanX = damp(this.leanX || 0, lean, 10, dt);
    this.leanZ = damp(this.leanZ || 0, turnLean, 8, dt);
    this.squashG.rotation.set(this.leanX, 0, this.leanZ);
    this.rig.update({ mode, speed: clamp(sp / P.walk, 0, 1.4), dt, look: 0, vy: b.vel.y });
    this.umbrellaMesh.visible = this.floating;
    // blink while invulnerable
    this.model.visible = !(this.invuln > 0 && this.state !== 'dead' && Math.floor(this.invuln * 14) % 2 === 0);
  }

  sync() {
    this.root.position.copy(this.body.pos);
    this.root.rotation.y = this.facing;
  }
}

// snap a wall normal to the nearest world axis (crates are axis-aligned)
function axisOf(nx, nz) { return Math.abs(nx) > Math.abs(nz) ? [Math.sign(nx), 0] : [0, Math.sign(nz)]; }

// the umbrella power-up, open over Kinan while he floats
function makeUmbrella() {
  const g = new THREE.Group();
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.5, 0.8, 8, 1, true), new THREE.MeshStandardMaterial({ color: '#ff5fa2', roughness: 0.5, side: THREE.DoubleSide }));
  canopy.position.y = 3.6; g.add(canopy);
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 6), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5 }));
  stick.position.y = 2.7; g.add(stick);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshStandardMaterial({ color: '#ffd23f', roughness: 0.4 }));
  tip.position.y = 4.05; g.add(tip);
  return g;
}

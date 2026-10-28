// Third-person camera: follows behind/above Kinan, swings round smoothly when he turns,
// Q/E (or a drag) nudges it, it keeps steady height during jumps, and it pulls in instead of clipping walls.
// Levels can set camera "zones" (boxes) with their own distance/pitch, e.g. tighter inside rooms.
import * as THREE from 'three';
import { clamp, damp, angleDiff } from './util.js';

export class CameraRig {
  constructor(camera, world) {
    this.cam = camera; this.world = world;
    this.yaw = 0; this.pitch = 0.36; this.dist = 11; this.curDist = 11;
    this.wantDist = 11; this.wantPitch = 0.36; this.userPitch = 0;
    this.target = new THREE.Vector3();
    this.look = new THREE.Vector3();
    this.manualT = 0; this.shakeA = 0;
    this.zones = []; this.defaults = { dist: 12, pitch: 0.36, height: 1.5 };
    this.height = 1.5;
    this.override = null;          // {pos, look} for cut-scenes
  }

  setZones(zones, defaults) {
    this.zones = zones || [];
    if (defaults) Object.assign(this.defaults, defaults);
  }

  zoneFor(p) {
    for (const z of this.zones) {
      if (p.x >= z.min[0] && p.x <= z.max[0] && p.y >= z.min[1] && p.y <= z.max[1] && p.z >= z.min[2] && p.z <= z.max[2]) return z;
    }
    return this.defaults;
  }

  snap(player, yawDeg) {
    if (yawDeg !== undefined) this.yaw = yawDeg * Math.PI / 180;
    else this.yaw = player.facing + Math.PI;
    this.target.copy(player.pos);
    const z = this.zoneFor(player.pos);
    this.dist = this.curDist = z.dist || this.defaults.dist;
    this.pitch = z.pitch || this.defaults.pitch;
    this.update(0.016, player, null, true);
  }

  shake(a) { this.shakeA = Math.max(this.shakeA, a); }

  update(dt, player, input, instant = false) {
    const p = player.pos;
    const z = this.zoneFor(p);
    this.dist = damp(this.dist, z.dist || this.defaults.dist, 2.5, dt);
    this.height = damp(this.height, z.height || this.defaults.height, 3, dt);
    const basePitch = z.pitch || this.defaults.pitch;

    // manual control
    if (input) {
      const turn = input.camTurn * 2.3 * dt + input.camDX * 0.0065;
      if (turn !== 0) { this.yaw += turn; this.manualT = 1.6; }
      if (input.camDY) { this.userPitch = clamp(this.userPitch + input.camDY * 0.004, -0.25, 0.55); this.manualT = 1.6; }
    }
    this.pitch = damp(this.pitch, clamp(basePitch + this.userPitch, 0.08, 1.15), 4, dt);
    this.manualT -= dt;

    // boss fights: keep the boss in view (camera behind Kinan, looking toward the boss)
    if (this.focus && this.manualT <= 0 && Math.hypot(p.x - this.focus.x, p.z - this.focus.z) > 2) {
      const want = Math.atan2(p.x - this.focus.x, p.z - this.focus.z);
      this.yaw += angleDiff(this.yaw, want) * (1 - Math.exp(-2.5 * dt));
    }
    // a camera zone can ask for a fixed view direction (e.g. looking into the wall-jump canyon from its open end)
    else if (z.yaw !== undefined && this.manualT <= 0) {
      this.yaw += angleDiff(this.yaw, z.yaw * Math.PI / 180) * (1 - Math.exp(-3 * dt));
    }
    // auto swing behind Kinan while he moves (not when he runs toward the camera)
    else if (this.manualT <= 0 && player.speed > 1.5 && (player.state === 'ground' || player.state === 'air')) {
      const behind = player.facing + Math.PI;
      const d = angleDiff(this.yaw, behind);
      if (Math.abs(d) < 2.35) {
        const k = (player.state === 'ground' ? 1.25 : 0.6) * clamp(player.speed / 13, 0, 1);
        this.yaw += d * (1 - Math.exp(-k * dt));
      }
    }

    // follow target: x/z tight, y steady while airborne
    if (instant) this.target.copy(p);
    else {
      this.target.x = damp(this.target.x, p.x, 11, dt);
      this.target.z = damp(this.target.z, p.z, 11, dt);
      const dy = p.y - this.target.y;
      if (player.grounded || player.state === 'pound' || dy < -1.5 || dy > 4) {
        this.target.y = damp(this.target.y, p.y, dy < 0 ? 9 : 5, dt);
      }
    }
    this.look.set(this.target.x, this.target.y + this.height, this.target.z);

    let pos;
    if (this.override) {
      pos = this.override.pos; this.look.copy(this.override.look);
      this.cam.position.lerp(pos, instant ? 1 : 1 - Math.exp(-3 * dt));
    } else {
      // collision: cast from the look point back toward the camera. If something close blocks the view,
      // try looking from higher or lower before pulling in (avoids huge close-ups of Kinan's hair).
      const free = (pitch) => {
        const cp = Math.cos(pitch);
        return this.world.rayCam(this.look.x, this.look.y, this.look.z, Math.sin(this.yaw) * cp, Math.sin(pitch), Math.cos(this.yaw) * cp, this.dist + 0.6);
      };
      let best = this.pitch, bestHit = free(this.pitch);
      if (bestHit < this.dist * 0.7) {
        for (const dp of [0.28, 0.55, -0.22, -0.4, 0.8]) {
          const pt = clamp(this.pitch + dp, -0.25, 1.25);
          const h = free(pt);
          if (h > bestHit + 1.2) { bestHit = h; best = pt; }
          if (bestHit >= this.dist * 0.85) break;
        }
      }
      this.avoidPitch = damp(this.avoidPitch ?? this.pitch, best, best === this.pitch ? 2.5 : 5, dt);
      if (instant) this.avoidPitch = best;
      const usePitch = this.avoidPitch;
      const cp = Math.cos(usePitch), sp = Math.sin(usePitch);
      const dx = Math.sin(this.yaw) * cp, dy = sp, dz = Math.cos(this.yaw) * cp;
      const hit = this.world.rayCam(this.look.x, this.look.y, this.look.z, dx, dy, dz, this.dist + 0.6);
      const allowed = Math.max(1.4, hit - 0.55);
      if (allowed < this.curDist || instant) this.curDist = Math.min(allowed, this.dist);
      else this.curDist = damp(this.curDist, Math.min(allowed, this.dist), 3.5, dt);
      this.cam.position.set(this.look.x + dx * this.curDist, this.look.y + dy * this.curDist, this.look.z + dz * this.curDist);
    }
    if (this.shakeA > 0) {
      this.cam.position.x += (Math.random() - 0.5) * this.shakeA;
      this.cam.position.y += (Math.random() - 0.5) * this.shakeA;
      this.shakeA = Math.max(0, this.shakeA - dt * 1.4);
    }
    this.cam.lookAt(this.look);
  }
}

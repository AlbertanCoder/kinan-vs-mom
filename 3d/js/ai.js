// Enemy brains, three tiers. Each enemy in the level data picks one:  { type:'sock', tier:'dumb'|'alert'|'smart', ... }
//   dumb  : patrols, never notices Kinan, happily walks off edges (and keeps wandering wherever it lands)
//   alert : patrols; spots Kinan in front of it (and not behind a wall), shows "!", chases while he is in range,
//           gives up ("?") when he gets away or it strays too far from home, then walks back
//   smart : like alert, plus it flanks (circles round to Kinan's side), jumps up ledges and over gaps,
//           dodges a stomp now and then, can lie in AMBUSH (flat on the floor) and runs away when hurt (2 hits)
// Fair-play rules (an 11-year-old has to be able to react):
//   - every attack is a WIND-UP (crouch + shake + flashing red "!", 0.55 s) then a short LUNGE along a direction
//     locked at the start of the wind-up, so stepping aside always works; after a lunge it is DIZZY (no damage, easy stomp)
//   - spotting ("!"), popping out of an ambush, dizzy, stunned and running away never hurt
//   - chasers are slower than Kinan walks
import * as THREE from 'three';
import { spaceFree } from './physics.js';
import { clamp, dampAngle, TAU } from './util.js';

const GRAV = 40;
const HARMLESS = new Set(['notice', 'reveal', 'hide', 'recover', 'stun', 'retreat', 'hurt', 'dodge', 'giveup']);
export const TIMING = { notice: 0.5, windup: 0.55, lunge: 0.34, recover: 0.95, giveup: 0.9, reveal: 0.7, stun: 2.0, retreat: 2.2, dodge: 0.28 };

let markMats = null;
function markMat(text, color) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d');
  x.font = "700 56px 'Pixelify Sans', monospace"; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.lineWidth = 8; x.strokeStyle = '#1b1220'; x.strokeText(text, 32, 36); x.fillStyle = color; x.fillText(text, 32, 36);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true, depthTest: false });
}
export function addMarks(e) {
  if (!markMats) markMats = { ex: markMat('!', '#ffd23f'), red: markMat('!', '#ff4a4a'), q: markMat('?', '#ffffff') };
  const s = new THREE.Sprite(markMats.ex); s.scale.set(1.1, 1.1, 1); s.position.y = e.h + 1.0; s.visible = false; s.renderOrder = 6;
  e.grp.add(s); e.mark = s;
}
function showMark(e, kind) {
  if (!e.mark) return;
  if (!kind) { e.mark.visible = false; return; }
  e.mark.material = markMats[kind]; e.mark.visible = true;
}

export function initBrain(e, idx) {
  const d = e.def;
  e.tier = d.tier || (e.type === 'brick' ? 'alert' : 'dumb');
  e.vy = 0; e.air = false; e.st = 0; e.hp = d.hp || (e.tier === 'smart' ? 2 : 1);
  e.side = idx % 2 ? 1 : -1; e.dodgeCd = 0; e.chaseT = 0; e.stuckT = 0; e.noticeCd = 0; e.wander = false;
  e.sight = d.sight || (e.tier === 'smart' ? 10 : 8);
  e.chaseSpeed = d.chase || (e.tier === 'smart' ? 5.6 : e.type === 'brick' ? 5.0 : 4.4);
  e.leash = d.leash || (e.tier === 'smart' ? 16 : 12);
  e.log = [];
  if (d.ambush) { e.state = 'hide'; } else e.state = 'walk';
}

function setState(e, s, t = 0) {
  if (e.state !== s) { e.log.push(s); if (e.log.length > 24) e.log.shift(); }
  e.state = s; e.st = t;
}

// can the enemy see Kinan? (in front of it, close enough, same floor, no wall in between)
function canSee(ent, e, pl, dist, dyP) {
  if (pl.state === 'dead' || dist > e.sight || Math.abs(dyP) > 2.6) return false;
  const fx = Math.sin(e.yaw), fz = Math.cos(e.yaw);
  const dx = pl.pos.x - e.pos.x, dz = pl.pos.z - e.pos.z;
  if (dist > 3.2 && (dx * fx + dz * fz) / (dist || 1) < 0.2) return false;     // behind it
  // line of sight from its eyes to Kinan's chest
  const y0 = e.pos.y + 1.3, y1 = pl.pos.y + 1.0;
  for (let i = 1; i < 5; i++) {
    const t = i / 5, y = y0 + (y1 - y0) * t;
    if (!spaceFree(ent.world, e.pos.x + dx * t, e.pos.z + dz * t, y - 0.1, y + 0.1, 0.12)) return false;
  }
  return true;
}

// try to move toward (tx,tz). mode: 'fall' (dumb: may walk off edges) | 'safe' | 'jump' (smart)
// returns 'ok' | 'wall' | 'edge' | 'jump' | 'none'
function stepToward(ent, e, tx, tz, speed, dt, mode, turnRate = 8) {
  const mx = tx - e.pos.x, mz = tz - e.pos.z, ml = Math.hypot(mx, mz);
  if (ml < 0.05) return 'none';
  e.yaw = dampAngle(e.yaw, Math.atan2(mx, mz), turnRate, dt);
  return stepDir(ent, e, mx / ml, mz / ml, Math.min(ml, speed * dt), mode);
}
function stepDir(ent, e, ux, uz, step, mode) {
  const W = ent.world;
  const nx = e.pos.x + ux * step, nz = e.pos.z + uz * step;
  if (e.air) { if (spaceFree(W, nx, nz, e.pos.y + 0.4, e.pos.y + e.h - 0.1, e.r * 0.55)) { e.pos.x = nx; e.pos.z = nz; return 'ok'; } return 'wall'; }
  const g = W.groundAt(nx, nz, e.pos.y + 0.6, 0.25);
  const free = spaceFree(W, nx, nz, e.pos.y + 0.6, e.pos.y + e.h - 0.1, e.r * 0.55);
  if (!free) {
    if (mode === 'jump') {
      // a low ledge in front? hop up onto it
      const ax = e.pos.x + ux * (e.r + 0.9), az = e.pos.z + uz * (e.r + 0.9);
      const up = W.groundAt(ax, az, e.pos.y + 3.0, 0.3);
      if (up && up.y > e.pos.y + 0.6 && up.y < e.pos.y + 2.9 && spaceFree(W, ax, az, up.y + 0.1, up.y + e.h, e.r * 0.5)) { jump(ent, e, 14, ux, uz, 4.5); return 'jump'; }
    }
    return 'wall';
  }
  if (g && Math.abs(g.y - e.pos.y) < 0.65) { e.pos.x = nx; e.pos.z = nz; e.pos.y = g.y; return 'ok'; }
  // an edge
  if (mode === 'fall') { e.pos.x = nx; e.pos.z = nz; e.air = true; e.vy = 0; return 'ok'; }
  if (mode === 'jump') {
    const pl = ent.g.player;
    const drop = g ? e.pos.y - g.y : 99;
    if (drop < 4.6 && pl.pos.y < e.pos.y - 0.5) { e.pos.x = nx; e.pos.z = nz; e.air = true; e.vy = 3; return 'jump'; }
    // a small gap: land on the other side
    for (const d of [2.5, 3.5]) {
      const fx = e.pos.x + ux * d, fz = e.pos.z + uz * d;
      const far = W.groundAt(fx, fz, e.pos.y + 0.6, 0.3);
      if (far && Math.abs(far.y - e.pos.y) < 0.65) { jump(ent, e, 11, ux, uz, d / 0.55); return 'jump'; }
    }
  }
  return 'edge';
}
function jump(ent, e, vy, ux, uz, h) {
  e.air = true; e.vy = vy; e.jvx = ux * h; e.jvz = uz * h;
  ent.g.sfx('hop');
}

// gravity + landing
function vertical(ent, e, dt) {
  const W = ent.world;
  if (!e.air) {
    const g = W.groundAt(e.pos.x, e.pos.z, e.pos.y + 0.6, 0.25);
    if (!g || g.y < e.pos.y - 0.65) { e.air = true; e.vy = 0; }
    else { e.pos.y = g.y; return; }
  }
  const oldY = e.pos.y;
  e.vy = Math.max(-40, e.vy - GRAV * dt);
  if (e.jvx || e.jvz) {
    const nx = e.pos.x + e.jvx * dt, nz = e.pos.z + e.jvz * dt;
    if (spaceFree(W, nx, nz, e.pos.y + 0.4, e.pos.y + e.h - 0.1, e.r * 0.55)) { e.pos.x = nx; e.pos.z = nz; } else { e.jvx = 0; e.jvz = 0; }
  }
  e.pos.y += e.vy * dt;
  const g = W.groundAt(e.pos.x, e.pos.z, Math.max(oldY, e.pos.y) + 0.2, 0.25);
  if (g && e.vy <= 0 && e.pos.y <= g.y) {
    const fell = e.home.y - g.y;
    e.pos.y = g.y; e.air = false; e.vy = 0; e.jvx = e.jvz = 0;
    if (e.tier === 'dumb' && Math.abs(fell) > 0.6) { e.wander = true; e.home.y = g.y; }
  }
  if (e.pos.y < ent.g.level.killY) { e.alive = false; e.state = 'gone'; e.grp.visible = false; e.blob.visible = false; }
}

export function think(ent, e, pl, dt) {
  const pp = pl.pos;
  const dx = pp.x - e.pos.x, dz = pp.z - e.pos.z, dist = Math.hypot(dx, dz), dyP = pp.y - e.pos.y;
  e.st -= dt; e.dodgeCd -= dt; e.noticeCd -= dt; if (e.hitCd > 0) e.hitCd -= dt;
  const safe = e.tier === 'smart' ? 'jump' : 'safe';
  let moving = false;

  // ---- smart: dodge a stomp coming down on it (then a few seconds before it can dodge again)
  if (e.tier === 'smart' && e.dodgeCd <= 0 && !e.air && !HARMLESS.has(e.state) && e.state !== 'lunge' && dist < 2.7 && dyP > e.h * 0.4 && dyP < e.h + 5 && pl.vel.y < -1) {
    let ux = -dx / (dist || 1), uz = -dz / (dist || 1);
    if (dist < 0.4) { ux = Math.cos(pl.facing); uz = -Math.sin(pl.facing); }
    e.ddx = ux; e.ddz = uz; e.dodgeCd = 5; e.dodges = (e.dodges || 0) + 1;
    setState(e, 'dodge', TIMING.dodge); ent.g.sfx('spin'); showMark(e, 'ex');
  }

  switch (e.state) {
    case 'hide': {   // ambush: lying flat, waiting
      showMark(e, null);
      if (dist < (e.def.ambushR || 5.5) && Math.abs(dyP) < 2.5 && pl.state !== 'dead') { setState(e, 'reveal', TIMING.reveal); ent.g.sfx('alert'); showMark(e, 'ex'); }
      break;
    }
    case 'reveal': {
      e.yaw = dampAngle(e.yaw, Math.atan2(dx, dz), 10, dt);
      if (e.st <= 0) startWindup(ent, e, dx, dz, dist);
      break;
    }
    case 'walk': case 'home': {
      showMark(e, null);
      if (e.tier !== 'dumb' && e.noticeCd <= 0 && canSee(ent, e, pl, dist, dyP)) {
        setState(e, 'notice', TIMING.notice); e.chaseT = 0; e.stuckT = 0; ent.g.sfx('alert'); showMark(e, 'ex');
        if (ent.onEnemyNotice) ent.onEnemyNotice(e);
        break;
      }
      if (e.state === 'home') {
        const r = stepToward(ent, e, e.home.x, e.home.z, e.speed, dt, safe);
        moving = r === 'ok' || r === 'jump';
        if (Math.hypot(e.home.x - e.pos.x, e.home.z - e.pos.z) < 0.6 || r === 'wall' || r === 'edge') setState(e, 'walk');
        break;
      }
      // patrol (or wander if a dumb one fell somewhere new)
      if (e.wander || !e.patrol.length) {
        const r = e.wander || e.tier === 'dumb' ? stepDir(ent, e, Math.sin(e.yaw), Math.cos(e.yaw), e.speed * dt, 'fall') : 'none';
        moving = r === 'ok';
        if (r === 'wall') e.yaw += Math.PI * (0.75 + Math.random() * 0.5);
      } else {
        const to = e.patrol[e.pi];
        const r = stepToward(ent, e, to.x, to.z, e.speed, dt, e.tier === 'dumb' ? 'fall' : safe);
        moving = r === 'ok' || r === 'jump';
        if (Math.hypot(to.x - e.pos.x, to.z - e.pos.z) < 0.35 || r === 'wall' || r === 'edge') {
          e.pi += e.dir;
          if (e.pi >= e.patrol.length || e.pi < 0) { if (e.def.loop) e.pi = 0; else { e.dir *= -1; e.pi += 2 * e.dir; } }
          e.pi = clamp(e.pi, 0, e.patrol.length - 1);
        }
      }
      break;
    }
    case 'notice': {
      e.yaw = dampAngle(e.yaw, Math.atan2(dx, dz), 12, dt);
      if (e.st <= 0) { setState(e, 'chase'); showMark(e, null); }
      break;
    }
    case 'chase': {
      e.chaseT += dt;
      const home = Math.hypot(e.pos.x - e.home.x, e.pos.z - e.home.z);
      if (pl.state === 'dead' || dist > e.sight * 1.7 || Math.abs(dyP) > 3.2 || e.chaseT > 10 || home > e.leash || e.stuckT > 1.6) {
        setState(e, 'giveup', TIMING.giveup); showMark(e, 'q'); ent.g.sfx('huh'); break;
      }
      if (dist < (e.type === 'brick' ? 3.0 : 2.6) && Math.abs(dyP) < 1.6) { startWindup(ent, e, dx, dz, dist); break; }
      let tx = pp.x, tz = pp.z;
      if (e.tier === 'smart' && dyP > 1.0 && dist < 3.2 && !pl.grounded) {
        // Kinan is coming down from above: a smart one backs off and waits for him to land
        const r = stepDir(ent, e, -dx / (dist || 1), -dz / (dist || 1), e.chaseSpeed * dt, safe);
        moving = r === 'ok';
        break;
      }
      if (e.tier === 'smart') {
        // flank: come in from Kinan's side, aiming a little ahead of where he is going
        const px = -dz / (dist || 1), pz = dx / (dist || 1), off = e.side * clamp(dist * 0.45, 0, 3.2);
        tx += px * off + pl.vel.x * 0.3; tz += pz * off + pl.vel.z * 0.3;
      }
      const r = stepToward(ent, e, tx, tz, e.chaseSpeed, dt, safe, 9);
      moving = r === 'ok' || r === 'jump';
      if (r === 'wall' || r === 'edge') e.stuckT += dt; else e.stuckT = Math.max(0, e.stuckT - dt);
      break;
    }
    case 'windup': {
      // telegraph: crouch + shake + flashing red "!" while facing the locked lunge direction
      e.yaw = dampAngle(e.yaw, Math.atan2(e.ldx, e.ldz), 14, dt);
      showMark(e, Math.floor(e.st * 10) % 2 ? 'red' : 'ex');
      if (e.st <= 0) { setState(e, 'lunge', TIMING.lunge); ent.g.sfx('lunge'); showMark(e, null); }
      break;
    }
    case 'lunge': {
      const r = stepDir(ent, e, e.ldx, e.ldz, (e.type === 'brick' ? 11 : 10) * dt, 'safe');
      moving = true;
      if (Math.random() < dt * 14) ent.g.particles.dust(e.pos, 1, 0.6);
      if (r === 'wall' || r === 'edge' || e.st <= 0) { setState(e, 'recover', TIMING.recover); }
      break;
    }
    case 'recover': case 'stun': {
      if (Math.random() < dt * 6) ent.g.particles.emit(e.pos.x + Math.cos(e.t * 6) * 0.7, e.pos.y + e.h + 0.3, e.pos.z + Math.sin(e.t * 6) * 0.7, 0, 0.5, 0, '#fff2a0', 0.3, 0.5, 0, 0);
      if (e.st <= 0) {
        if (e.tier !== 'dumb' && dist < e.sight * 1.3 && Math.abs(dyP) < 2.6) { setState(e, 'chase'); e.chaseT = Math.min(e.chaseT, 6); }
        else if (e.tier === 'dumb') setState(e, 'walk');
        else { setState(e, 'giveup', TIMING.giveup); showMark(e, 'q'); }
      }
      break;
    }
    case 'giveup': {
      if (e.st <= 0) { setState(e, 'home'); showMark(e, null); e.noticeCd = 1.5; }
      break;
    }
    case 'hurt': {
      if (e.st <= 0) { setState(e, 'retreat', TIMING.retreat); showMark(e, null); }
      break;
    }
    case 'retreat': {
      // run away from Kinan for a bit, then come back for more (direction picked when it got hurt if he is right on top)
      if (dist > 1.2) { e.rdx = -dx / dist; e.rdz = -dz / dist; }
      let r = stepDir(ent, e, e.rdx, e.rdz, 6.4 * dt, safe);
      if (r === 'wall' || r === 'edge') { const a = Math.atan2(e.rdx, e.rdz) + (Math.random() < 0.5 ? 1.2 : -1.2); e.rdx = Math.sin(a); e.rdz = Math.cos(a); }
      e.yaw = dampAngle(e.yaw, Math.atan2(e.rdx, e.rdz), 10, dt);
      moving = r === 'ok' || r === 'jump';
      if (e.st <= 0) { if (dist < e.sight * 1.4) setState(e, 'chase'); else setState(e, 'home'); e.chaseT = 0; e.stuckT = 0; }
      break;
    }
    case 'dodge': {
      stepDir(ent, e, e.ddx, e.ddz, 11 * dt, 'safe');
      moving = true;
      if (e.st <= 0) { setState(e, 'chase'); showMark(e, null); e.chaseT = 0; }
      break;
    }
  }
  vertical(ent, e, dt);
  return moving;
}

function startWindup(ent, e, dx, dz, dist) {
  e.ldx = dx / (dist || 1); e.ldz = dz / (dist || 1);
  setState(e, 'windup', TIMING.windup);
  ent.g.sfx('windup');
}

export function harmful(e) { return !HARMLESS.has(e.state); }

// a hit from Kinan: smart enemies take 2 (and run away after the first), the rest pop at once
export function takeHit(ent, e, how) {
  const pl = ent.g.player;
  if (e.hitCd > 0 && how !== 'pound') { if (how === 'stomp') pl.bounceOff(ent.g.input.jumpHeld); return; }   // just got hit: Kinan bounces off
  if (e.state === 'hide' || e.state === 'reveal') { if (how !== 'pound') { setState(e, 'reveal', 0.3); if (how === 'stomp') pl.bounceOff(ent.g.input.jumpHeld); return; } }
  if (how !== 'pound' && how !== 'rush' && e.hp > 1) {
    e.hp--; e.hitCd = 0.9;
    setState(e, 'hurt', 0.35); showMark(e, null);
    { const dx = e.pos.x - pl.pos.x, dz = e.pos.z - pl.pos.z, d = Math.hypot(dx, dz); const a = d > 0.4 ? Math.atan2(dx, dz) : pl.facing + Math.PI * 0.5; e.rdx = Math.sin(a); e.rdz = Math.cos(a); }
    ent.g.sfx('stomp');
    ent.g.particles.sparkle(new THREE.Vector3(e.pos.x, e.pos.y + 1.2, e.pos.z), '#ffffff', 8, 4);
    if (how === 'stomp') pl.bounceOff(ent.g.input.jumpHeld);
    e.squashT = 0.3;
    return;
  }
  ent.defeat(e, pl, how === 'stomp');
}

export function stun(ent, e, t = TIMING.stun) {
  if (!e.alive || e.state === 'hide') return false;
  setState(e, 'stun', t); showMark(e, null);
  return true;
}

// per-type animation on top of the brain state
export function animateEnemy(e, moving, dt) {
  const ph = e.t * (e.state === 'lunge' ? 18 : e.state === 'chase' || e.state === 'retreat' ? 12 : 8);
  let sy = 1, sxz = 1, lift = 0, tilt = 0, lean = 0;
  if (e.state === 'hide') { sy = 0.28; sxz = 1.25; }
  else if (e.state === 'reveal') { const k = 1 - Math.max(0, e.st) / TIMING.reveal; sy = 0.28 + 0.72 * k; sxz = 1.25 - 0.25 * k; tilt = Math.sin(e.t * 40) * 0.12; }
  else if (e.state === 'notice') lift = Math.abs(Math.sin((TIMING.notice - e.st) / TIMING.notice * Math.PI)) * 0.9;
  else if (e.state === 'windup') { sy = 0.78; sxz = 1.14; tilt = Math.sin(e.t * 55) * 0.1; }
  else if (e.state === 'lunge') lean = 0.45;
  else if (e.state === 'recover' || e.state === 'stun') tilt = Math.sin(e.t * 9) * 0.25;
  else if (e.state === 'hurt') { sy = 0.6; sxz = 1.3; }
  if (e.squashT > 0) e.squashT -= dt;
  e.grp.scale.set(sxz, sy, sxz);
  if (e.type === 'brick') {
    e.grp.position.set(e.pos.x, e.pos.y + lift + (moving && !e.air ? Math.abs(Math.sin(ph)) * 0.18 : 0), e.pos.z);
    e.parts.feet[0].position.z = Math.sin(ph) * 0.3 * (moving ? 1 : 0); e.parts.feet[1].position.z = -Math.sin(ph) * 0.3 * (moving ? 1 : 0);
    e.parts.body.rotation.x = lean || (e.state === 'chase' ? 0.15 : 0);
    e.parts.body.rotation.z = tilt;
    e.parts.mark.visible = false;
  } else {
    e.grp.position.set(e.pos.x, e.pos.y + lift + (e.state === 'hide' ? 0 : Math.abs(Math.sin(ph * 0.5)) * 0.35), e.pos.z);
    e.parts.body.rotation.z = tilt || Math.sin(ph * 0.5) * 0.18;
    e.parts.body.rotation.x = lean;
  }
  e.grp.rotation.y = e.yaw;
  void TAU;
}

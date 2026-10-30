// The game: renderer, lights, sky, level loading, the main loop and the rules
// (candles, golden candles, hearts, checkpoints, respawn, level clear).
// Losing: there are no lives and no game over. On the last heart Kinan starts again at the last checkpoint
// and keeps every candle. Die 5 times around the same checkpoint and Glitchy offers to show the way (say yes or no).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { World } from './physics.js';
import { Builder } from './build.js';
import { Textures } from './textures.js';
import { PROPS } from './props.js';
import { Entities, Particles, Blob, petLoadout } from './entities.js';
import { makeKinan, makeGlitchy, addBlackBelt } from './kinan.js';
import { loadModel, loadLog, petURL } from './models.js';
import { Player } from './player.js';
import { CameraRig } from './camera.js';
import { Input } from './input.js';
import { HUD } from './hud.js';
import { Audio } from './audio.js';
import { damp, dampAngle, clamp } from './util.js';
import { SidePath } from './side.js';

export class Game {
  constructor(container, level, opts = {}) {
    this.container = container; this.level = level; this.opts = opts;
    this.updaters = [];
    this.candles = 0; this.starsGot = [false, false, false];
    this.stats = { bops: 0, time: 0, deaths: 0 };
    this.seen = new Set(); this.deathsAt = {}; this.cpIndex = -1; this.guide = null; this.asking = false;
    this.mode = 'loading';
    this.time = 0;
    this.ready = false;
  }

  onUpdate(fn) { this.updaters.push(fn); }
  sfx(name) { this.audio.play(name); }

  async init() {
    const L = this.level;
    const q = this.opts.quality || 'auto';
    const isTouch = matchMedia('(pointer: coarse)').matches;
    // ---- renderer
    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.maxPR = q === 'low' ? 1 : q === 'high' ? 2 : Math.min(window.devicePixelRatio || 1, isTouch ? 1.5 : 1.75);
    this.pr = this.maxPR;
    r.setPixelRatio(this.pr);
    r.setSize(window.innerWidth, window.innerHeight);
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = L.exposure || 1.05;
    r.shadowMap.enabled = q !== 'low';
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(r.domElement);

    const scene = this.scene = new THREE.Scene();
    const sky = L.sky || {};
    scene.background = new THREE.Color(sky.horizon || '#cfeaff');
    scene.fog = new THREE.Fog(sky.fog || '#d7eeff', sky.fogNear || 120, sky.fogFar || 420);
    this.camera = new THREE.PerspectiveCamera(L.fov || 55, window.innerWidth / window.innerHeight, 0.15, 900);

    // soft image-based light for nice plastic highlights
    const pm = new THREE.PMREMGenerator(r);
    scene.environment = pm.fromScene(new RoomEnvironment(r), 0.04).texture;

    const li = L.light || {};
    this.hemi = new THREE.HemisphereLight(li.sky || '#e4f2ff', li.ground || '#f2d9bd', li.hemi ?? 1.1);
    scene.add(this.hemi);
    const sun = this.sun = new THREE.DirectionalLight(li.sun || '#fff0d8', li.sunI ?? 2.1);
    this.sunOff = new THREE.Vector3(...(li.dir || [26, 50, 32])).normalize().multiplyScalar(70);
    sun.castShadow = r.shadowMap.enabled;
    const sm = q === 'high' ? 4096 : isTouch ? 1024 : 2048;
    sun.shadow.mapSize.set(sm, sm);
    const S = li.shadowSize || 30;
    Object.assign(sun.shadow.camera, { left: -S, right: S, top: S, bottom: -S, near: 5, far: 160 });
    sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04;
    scene.add(sun); scene.add(sun.target);
    this.makeSky(sky);

    // ---- materials for merged geometry
    this.materials = {
      toy: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0, envMapIntensity: 0.5 }),
      soft: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, envMapIntensity: 0.3 }),
      gloss: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.26, metalness: 0, envMapIntensity: 0.9 }),
      glow: new THREE.MeshBasicMaterial({ vertexColors: true }),
      glass: new THREE.MeshStandardMaterial({ color: '#d4f0ff', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.22, depthWrite: false, envMapIntensity: 1.5 }),
      cloud: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, emissive: '#c8dcf0', emissiveIntensity: 0.55, fog: false }),
    };

    // ---- world + static level
    this.world = new World(8);
    this.side = L.side ? new SidePath(L.side) : null;   // 2.5D side mode (only levels that ask for it)
    this.textures = new Textures(r);
    if (L.textures) for (const [k, v] of Object.entries(L.textures)) this.textures.define(k, v.paint, v);
    this.particles = new Particles(scene);
    const b = this.builder = new Builder(this, L.zoneOf);
    if (L.palette) Object.assign(b.pal, L.palette);
    const P = Object.assign({}, PROPS, L.props || {});
    b.prop = (name, x, y, z, yaw = 0, o = {}) => {
      const fn = P[name];
      if (!fn) { console.warn('unknown prop', name); return; }
      b.push(x, y, z, yaw); fn(b, o); b.pop();
    };
    L.build(b, P);
    (L.place || []).forEach(([name, x, y, z, yaw, o]) => b.prop(name, x, y, z, yaw || 0, o || {}));
    this.entities = new Entities(this);
    const res = b.finalize(scene, this.materials, this.textures);
    this.castByZone = res.castByZone;
    this.statTris = res.tris; this.statMeshes = res.meshes.length;

    // ---- Kinan + Glitchy
    const k = await makeKinan(L.assets && L.assets.kinan, scene.environment);
    this.kinanSource = k.source;
    this.kinanModel = { name: k.name, tris: k.tris, braid: k.braid };
    addBlackBelt(k.model);   // earned before Glitchy's Last Stand: he wears it all through World 12
    // the equipped cat + dog's approved models (only those two load)
    this.petModels = {};
    await Promise.all(petLoadout().map(async (def) => {
      const got = await loadModel('pet_' + def.id, petURL(L.assets && L.assets.pets, def.id));
      if (got) this.petModels[def.id] = { scene: got.gltf.scene, from: got.from };
    }));
    this.player = new Player(this, k.model);
    scene.add(this.player.root);
    // silhouette: when furniture is in front of Kinan, a purple shape still shows where he is.
    // Order: world (0) -> silhouette (1, only where hidden) -> Kinan (2, overwrites it where visible).
    const silM = new THREE.MeshBasicMaterial({ color: '#6a4bc4', depthFunc: THREE.GreaterDepth, depthWrite: false, fog: false });
    const kinMeshes = [];
    k.model.traverse((o) => { if (o.isMesh) kinMeshes.push(o); });
    for (const o of kinMeshes) { o.renderOrder = 2; const s = new THREE.Mesh(o.geometry, silM); s.renderOrder = 1; s.frustumCulled = false; o.add(s); }
    this.playerBlob = new Blob(scene, this.world, 1.55);
    // entities come after Kinan exists (pets read his perks)
    this.entities.build(L, this.builder);
    this.starsGot = new Array(this.entities.totalGolden).fill(false);
    const res2 = this.builder.finalize(scene, this.materials, this.textures);
    for (const [z, list] of Object.entries(res2.castByZone)) (this.castByZone[z] || (this.castByZone[z] = [])).push(...list);
    this.statTris += res2.tris; this.statMeshes += res2.meshes.length;
    this.glitchy = await makeGlitchy(L.assets && L.assets.glitchy);
    scene.add(this.glitchy);
    this.glitchyPos = new THREE.Vector3();
    this.glitchySpin = 0;

    // ---- systems
    this.input = new Input(this.container);
    this.hud = new HUD();
    this.audio = new Audio();
    this.camRig = new CameraRig(this.camera, this.world);
    this.camRig.setZones(L.camZones, L.camDefaults);
    if (this.side) { this.camRig.setSide(this.side); this.input.setSide(true); }

    this.respawn = { pos: L.spawn.pos.slice(), yaw: L.spawn.yaw || 0 };
    this.player.place(...this.respawn.pos, this.respawn.yaw);
    this.player.body.grounded = true; this.player.state = 'ground';
    this.camRig.snap(this.player, L.spawn.camYaw);
    this.glitchyPos.copy(this.player.pos).add(new THREE.Vector3(-1.4, 2.6, -0.5));
    this.hud.candles(0, this.entities.totalCandles);
    this.hud.stars(this.starsGot, this.entities.totalGolden);
    this.hud.hearts(this.player.hearts, this.player.maxHearts);
    this.hud.powers(this.player.pw);
    this.hud.pets(this.entities.loadout);
    this.currentZone = null;
    this.updateShadowZone(true);

    // tone down the flat room-environment light so colours stay saturated and toy-like
    const envK = (L.light && L.light.env !== undefined) ? L.light.env : 0.4;
    const seen = new Set();
    scene.traverse((o) => {
      const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      for (const m of ms) if (!seen.has(m) && 'envMapIntensity' in m) { seen.add(m); m.envMapIntensity *= envK; }
    });

    if (L.setup) L.setup(this);   // a level's own moving parts (12-castle: the family, the fuses, the cake)

    window.addEventListener('resize', () => this.resize());
    this.resize();
    this.lastT = performance.now();
    this.frames = 0; this.fpsAcc = 0; this.fps = 60; this.slowT = 0;
    this.mode = 'title';
    this.hud.title(true);
    this.hud.ready();
    this.ready = true;
    this.renderer.setAnimationLoop((t) => this.frame(t));
    if (this.opts.autostart) this.start();
  }

  makeSky(sky) {
    const geo = new THREE.SphereGeometry(700, 32, 16);
    const top = new THREE.Color(sky.top || '#3d8ee8'), mid = new THREE.Color(sky.mid || '#86c8ff'), hor = new THREE.Color(sky.horizon || '#e3f5ff');
    const pos = geo.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 700;
      if (y > 0.25) c.copy(mid).lerp(top, Math.min(1, (y - 0.25) / 0.6));
      else c.copy(hor).lerp(mid, Math.max(0, y) / 0.25);
      col.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false });
    this.skyMesh = new THREE.Mesh(geo, m);
    this.skyMesh.renderOrder = -10;
    this.scene.add(this.skyMesh);
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.fov = (this.level.fov || 55) * (w / h < 1 ? 1.25 : 1);
    this.camera.updateProjectionMatrix();
    const scale = h * this.pr / (2 * Math.tan(this.camera.fov * Math.PI / 360));
    this.particles.mat.uniforms.uScale.value = scale;
    if (this.entities.glowMat) this.entities.glowMat.uniforms.uScale.value = scale;
  }

  start() {
    if (this.mode !== 'title') return;
    this.mode = 'play';
    this.hud.title(false);
    this.audio.unlock();
    const L = this.level;
    if (L.intro) setTimeout(() => this.hint(L.intro), 900);
  }

  // ---------------------------------------------------------------- loop
  frame(now) {
    let dt = (now - this.lastT) / 1000; this.lastT = now;
    if (!(dt > 0)) dt = 1 / 60;
    dt = Math.min(dt, 1 / 20);
    this.adapt(dt);
    const inp = this.input;
    inp.update();
    if (inp.anyEdge && this.audio.ctx === null && this.mode !== 'title') this.audio.unlock();
    if (this.mode === 'title') {
      if (!this.side) { this.camRig.yaw += dt * 0.12; this.camRig.manualT = 1; }
      if (inp.anyEdge) { this.start(); inp.endFrame(); }
    }
    else if (this.mode === 'ask') {
      if (inp.confirmPressed) { this.answerHelp(true); inp.endFrame(); }
      else if (inp.cancelPressed) { this.answerHelp(false); inp.endFrame(); }
    }
    else if (this.mode === 'play' && inp.pausePressed) { this.mode = 'paused'; this.hud.pause(true); }
    else if (this.mode === 'paused' && (inp.pausePressed || inp.confirmPressed)) { this.mode = 'play'; this.hud.pause(false); inp.endFrame(); }
    if (this.cutsceneOn && (inp.wasPressed('Space') || inp.wasPressed('Enter') || inp.touchJumpEdge || inp.pad.edge[0])) { this.cutsceneEnd(); inp.endFrame(); }
    if (inp.wasPressed('KeyM')) this.hud.toast(this.audio.toggleMusic() ? 'MUSIC ON' : 'MUSIC OFF', 1.2);
    if (this.mode === 'clear' && this.clearReady && inp.confirmPressed) { if (this.opts.onDone) this.opts.onDone(); else location.reload(); }

    if (this.mode !== 'paused' && this.mode !== 'ask') this.update(dt);
    inp.endFrame();
    this.renderer.render(this.scene, this.camera);
  }

  adapt(dt) {
    // keep it smooth on slower iPads: lower the resolution a bit if frames are slow
    this.frames++; this.fpsAcc += dt;
    if (this.fpsAcc >= 1) {
      this.fps = this.frames / this.fpsAcc; this.frames = 0; this.fpsAcc = 0;
      if (this.hud && this.hud.el.fps && this.opts.debug) this.hud.el.fps.textContent = `${this.fps.toFixed(0)} fps  pr ${this.pr.toFixed(2)}  ${this.kinanSource}`;
      if (this.mode === 'play' && this.opts.quality !== 'high') {
        if (this.fps < 45) this.slowT++; else this.slowT = 0;
        if (this.slowT >= 2 && this.pr > 0.75) { this.pr = Math.max(0.75, this.pr - 0.25); this.renderer.setPixelRatio(this.pr); this.resize(); this.slowT = 0; }
      }
    }
  }

  update(dt) {
    this.time += dt;
    const t = this.time, pl = this.player;
    if (this.mode === 'play') this.stats.time += dt;
    this.input.enabled = this.mode === 'play';
    this.entities.updateMovers(dt);
    pl.update(dt, this.input, this.camRig.yaw);
    this.entities.update(dt, t, pl, this.camera);
    for (const fn of this.updaters) fn(t, dt);
    this.textures.update(dt, t);
    this.camRig.update(dt, pl, this.mode === 'play' ? this.input : null);
    this.particles.update(dt);
    this.hud.update(dt);
    this.audio.updateMusic && this.audio.musicOn && this.audio.updateMusic();
    // blob shadow under Kinan (always)
    this.playerBlob.update(pl.pos.x, pl.pos.y + 0.05, pl.pos.z, 60);
    this.labelT = (this.labelT || 0) - dt;
    if (this.labelT <= 0) { this.labelT = 0.15; this.hud.action(this.actionLabel()); }
    // Glitchy floats by Kinan's shoulder
    const f = pl.facing, side = new THREE.Vector3(Math.cos(f) * -1.35 + Math.sin(f) * -0.5, 2.55 + Math.sin(t * 2.2) * 0.22, -Math.sin(f) * -1.35 + Math.cos(f) * -0.5);
    if (this.side) {
      // 2.5D: Glitchy floats just behind Kinan's back and a little away from the camera (never in front of him)
      const cy = this.camRig.yaw;
      side.set(-Math.sin(f) * 1.1 - Math.sin(cy) * 1.2, side.y, -Math.cos(f) * 1.1 - Math.cos(cy) * 1.2);
    }
    const want = this.guide ? this.guideTarget(dt) : pl.pos.clone().add(side);
    this.glitchyPos.x = damp(this.glitchyPos.x, want.x, 4, dt); this.glitchyPos.y = damp(this.glitchyPos.y, want.y, 4, dt); this.glitchyPos.z = damp(this.glitchyPos.z, want.z, 4, dt);
    this.glitchy.position.copy(this.glitchyPos);
    this.glitchySpin = Math.max(0, this.glitchySpin - dt);
    const toCam = Math.atan2(this.camera.position.x - this.glitchyPos.x, this.camera.position.z - this.glitchyPos.z);
    this.glitchy.rotation.y = dampAngle(this.glitchy.rotation.y, (pl.speed > 2 ? f : toCam * 0.5 + f * 0.5) + this.glitchySpin * 12, 6, dt);
    this.glitchy.rotation.z = Math.sin(t * 1.7) * 0.12;
    if (Math.random() < dt * 3) this.particles.emit(this.glitchyPos.x + (Math.random() - 0.5) * 0.6, this.glitchyPos.y - 0.3, this.glitchyPos.z + (Math.random() - 0.5) * 0.6, 0, -0.4, 0, Math.random() < 0.5 ? '#ff3df0' : '#00ffd0', 0.18, 0.9, 0, 0);
    // sun + shadow camera follow Kinan
    this.sun.position.copy(pl.pos).add(this.sunOff);
    this.sun.target.position.copy(pl.pos);
    this.updateShadowZone();
    this.skyMesh.position.copy(this.camera.position);
  }

  updateShadowZone(force) {
    const p = this.player.pos;
    const z = this.level.zoneOf ? this.level.zoneOf(p.x, p.y + 0.5, p.z) : 'o';
    if (z === this.currentZone && !force) return;
    this.currentZone = z;
    for (const [zone, list] of Object.entries(this.castByZone)) {
      const on = zone === z || zone === 'o' || (z === 'o' && zone === 'r');
      for (const m of list) m.castShadow = on;
    }
  }

  // ---------------------------------------------------------------- rules
  collectCandle(p) {
    this.candles++;
    this.sfx('candle');
    this.particles.sparkle(p, '#ffe27a', 10, 4);
    this.hud.candles(this.candles, this.entities.totalCandles);
    if (this.candles % 10 === 0 && this.player.hearts < this.player.maxHearts) { this.player.heal(1); this.sfx('heal'); this.hud.toast('+1 HEART', 1.2); }
  }
  collectGolden(i, def, p) {
    this.starsGot[i] = true;
    const n = this.starsGot.filter(Boolean).length;
    this.sfx('star');
    this.particles.confetti(p, 60);
    this.particles.sparkle(p, '#fff2a0', 30, 7);
    this.hud.stars(this.starsGot, this.entities.totalGolden);
    this.hud.banner('GOLDEN CANDLE!', `${def.name || ''}  ·  ${n}/${this.entities.totalGolden}`);
    this.player.cheer(1.3);
    this.player.heal(3);
  }
  setCheckpoint(c) {
    this.respawn = { pos: [c.p.x, c.p.y + 0.2, c.p.z + 0], yaw: c.def.yaw || 0, camYaw: c.def.camYaw };
    this.cpIndex = c.i;
    if (this.guide) this.endGuide(true);
    this.sfx('checkpoint');
    this.hud.toast('CHECKPOINT!');
    this.particles.confetti(new THREE.Vector3(c.p.x, c.p.y + 5, c.p.z), 30);
    this.player.heal(3);
  }
  hint(text, cam) {
    this.hud.hint(text);
    this.glitchySpin = 0.5;
    if (cam && this.mode === 'play' && !this.cutsceneOn) this.cutscene(cam);
  }
  // short camera moment (e.g. the first look at the back of the house); Kinan waits, any key skips
  cutscene(cam) {
    this.cutsceneOn = true;
    this.player.frozen = true;
    this.camRig.override = { pos: new THREE.Vector3(...cam.pos), look: new THREE.Vector3(...cam.look) };
    const end = () => {
      if (!this.cutsceneOn) return;
      this.cutsceneOn = false; this.camRig.override = null; this.player.frozen = false;
      this.camRig.snap(this.player, this.camRig.yaw * 180 / Math.PI);
    };
    this.cutsceneEnd = end;
    setTimeout(end, (cam.time || 3) * 1000);
  }
  groundPound(pos, c) {
    this.entities.boxes.slammed(c);
    this.sfx('pound');
    this.particles.ring(pos);
    this.particles.dust(pos, 10, 2);
    this.camRig.shake(0.3);
    this.entities.pounded(pos);
  }
  fellOut() {
    if (this.respawning) return;
    this.player.hearts -= 1;
    this.hud.hearts(Math.max(0, this.player.hearts), this.player.maxHearts);
    if (this.player.hearts <= 0) this.noteDeath();
    this.doRespawn();
  }
  playerDown() {
    if (this.respawning) return;
    this.sfx('down');
    this.hud.toast('OOPS! BACK TO THE CHECKPOINT', 1.6);
    this.noteDeath();
    this.doRespawn(1.0);
  }
  // 5 losses around the same checkpoint: Glitchy offers to show the way (Kinan can say no)
  noteDeath() {
    this.stats.deaths++;
    const k = String(this.cpIndex);
    this.deathsAt[k] = (this.deathsAt[k] || 0) + 1;
    if (this.deathsAt[k] >= (this.level.helpAfter || 5) && !this.guide) { this.deathsAt[k] = 0; this.askHelpSoon = true; }
  }
  askHelp() {
    this.mode = 'ask'; this.asking = true;
    this.hud.ask(true, this.level.helpText || 'That part is tricky! Want Glitchy to show you the way?');
  }
  answerHelp(yes) {
    this.mode = 'play'; this.asking = false; this.hud.ask(false);
    this.stats.helpAnswers = (this.stats.helpAnswers || []).concat(yes ? 'yes' : 'no');
    if (yes) this.startGuide(); else this.hud.toast('OK! YOU GOT THIS!', 1.4);
  }
  startGuide() {
    const L = this.level, gs = L.guides || {};
    let pts = gs[String(this.cpIndex)];
    if (!pts) {
      const next = this.entities.checkpoints.find((c) => c.i === this.cpIndex + 1);
      pts = [next ? [next.p.x, next.p.y, next.p.z] : (L.goal ? L.goal.pos : L.spawn.pos)];
    }
    this.guide = { pts: pts.map((q) => new THREE.Vector3(q[0], q[1], q[2])), i: 0, t: 0 };
    this.hud.hint('Follow me! I will float along the way. Watch the sparkles!');
  }
  guideTarget(dt) {
    const G = this.guide, pl = this.player;
    G.t += dt;
    const tgt = G.pts[G.i];
    const here = this.glitchyPos;
    const dK = here.distanceTo(pl.pos);
    // lead the way, but wait for Kinan if he falls behind
    let want = tgt.clone().add(new THREE.Vector3(0, 2.8, 0));
    if (dK > 9) want = here.clone().lerp(pl.pos.clone().add(new THREE.Vector3(0, 2.8, 0)), 0.5);
    if (pl.pos.distanceTo(tgt) < 3.2) { G.i++; if (G.i >= G.pts.length) { this.endGuide(false); return pl.pos.clone().add(new THREE.Vector3(-1.3, 2.6, -0.5)); } }
    if (Math.random() < dt * 20) this.particles.emit(here.x, here.y - 0.4, here.z, 0, -0.2, 0, '#00ffd0', 0.4, 2.5, 0, 0);
    return want;
  }
  endGuide(reached) { if (!this.guide) return; this.guide = null; this.hud.hint(reached ? 'You made it! Nice!' : 'There you go!'); }
  // what the ACTION button does right now (shown on the touch button)
  actionLabel() {
    const pl = this.player;
    if (pl.carrying) return pl.speed < 2.5 && pl.grounded ? 'PUT' : 'THROW';
    if (pl.state === 'grab') return 'LET GO';
    if (pl.state === 'climb' || pl.state === 'ledge') return 'DROP';
    if (!pl.grounded) return 'SLAM';
    const near = this.entities.boxes.interactable(pl);
    if (near) return near.kind === 'heavy' ? 'GRAB' : 'LIFT';
    if (pl.pw.popper) return 'POP!';
    return this.side ? 'KICK' : 'ACTION';
  }
  firstTime(key, text) {
    if (this.seen.has(key)) return false;
    this.seen.add(key);
    if (text) this.hint(text);
    return true;
  }
  doRespawn(delay = 0.3) {
    this.respawning = true;
    this.player.frozen = true;
    setTimeout(() => this.hud.fade(true), delay * 1000);
    setTimeout(() => {
      const r = this.respawn;
      this.player.place(r.pos[0], r.pos[1], r.pos[2], r.yaw);
      this.player.state = 'air';
      if (this.player.hearts <= 0) this.player.hearts = this.player.maxHearts;
      this.hud.hearts(this.player.hearts, this.player.maxHearts);
      this.player.invuln = 1.5;
      this.player.pw.rush = 0; this.hud.powers(this.player.pw);
      this.player.frozen = false;
      this.camRig.snap(this.player, r.camYaw);
      this.hud.fade(false);
      this.respawning = false;
      if (this.askHelpSoon) { this.askHelpSoon = false; setTimeout(() => { if (this.mode === 'play') this.askHelp(); }, 500); }
    }, delay * 1000 + 450);
  }
  levelClear(goal) {
    if (this.mode === 'clear') return;
    this.mode = 'clear';
    if (this.opts.onClear) { try { this.opts.onClear(this.level.id, this.candles); } catch (e) { console.warn('could not save the clear', e); } }
    const pl = this.player;
    if (this.level.finale) { this.level.finale(this, goal); return; }   // 12-castle: the ending plays instead of the LEVEL CLEAR panel
    pl.frozen = true; pl.cheer(99);
    pl.facing = (goal.def.yaw || 0) * Math.PI / 180;   // turn round to face the camera (the door is behind him)
    if (this.side) pl.facing = this.camRig.yaw;          // 2.5D: face the side camera
    this.sfx('clear');
    for (let i = 0; i < 4; i++) setTimeout(() => this.particles.confetti(new THREE.Vector3(pl.pos.x, pl.pos.y + 6, pl.pos.z), 50), i * 350);
    // 2.5D: further back and lower, so what waits behind him (the pelican) fits in the picture above the clear panel
    const bd = this.side ? 12.5 : 8, bh = this.side ? 2.2 : 3.2, ly = this.side ? -0.8 : -0.6;
    const back = new THREE.Vector3(Math.sin(pl.facing) * bd, bh, Math.cos(pl.facing) * bd);
    this.camRig.override = { pos: pl.pos.clone().add(back), look: pl.pos.clone().add(new THREE.Vector3(0, ly, 0)) };
    this.hud.banner('LEVEL CLEAR!', this.level.clearText || '', 2.2);
    setTimeout(() => {
      this.hud.clear({ candles: this.candles, totalCandles: this.entities.totalCandles, golden: this.starsGot.filter(Boolean).length, totalGolden: this.entities.totalGolden, bops: this.stats.bops, time: this.stats.time });
      this.clearReady = true;
    }, 2200);
  }

  // ---------------------------------------------------------------- testing / debug helpers
  teleport(x, y, z, yawDeg) {
    this.player.place(x, y, z, yawDeg !== undefined ? yawDeg : this.player.facing * 180 / Math.PI);
    this.camRig.snap(this.player);
  }
  setCamYaw(deg) { this.camRig.yaw = deg * Math.PI / 180; this.camRig.manualT = 3; }
  // 2.5D test helper: where Kinan is on the path and how the camera looks at it
  //   off = Kinan's distance from the path line; camAlong = camera view . path direction (0 = square on);
  //   camToward = camera view . (path -> camera side) (-1 = looking straight at the path from the camera side)
  sideInfo() {
    if (!this.side) return null;
    const p = this.player.pos, pr = this.side.project(p.x, p.z);
    const v = new THREE.Vector3(); this.camera.getWorldDirection(v);
    const h = Math.hypot(v.x, v.z) || 1;
    return {
      s: +pr.s.toFixed(2), off: +pr.off.toFixed(3), length: +this.side.length.toFixed(1), tx: +pr.tx.toFixed(3), tz: +pr.tz.toFixed(3),
      camAlong: +((v.x * pr.tx + v.z * pr.tz) / h).toFixed(3), camToward: +((v.x * pr.nx + v.z * pr.nz) / h).toFixed(3),
      camYaw: +(this.camRig.yaw * 180 / Math.PI).toFixed(1), override: !!this.camRig.override, cutscene: !!this.cutsceneOn,
    };
  }
  // the world position at distance s along the 2.5D path (y = the given height)
  sidePoint(s, y = 0) { if (!this.side) return null; const a = this.side.at(s); return [a.x, y, a.z]; }
  info() {
    const p = this.player;
    return {
      mode: this.mode, pos: [+p.pos.x.toFixed(2), +p.pos.y.toFixed(2), +p.pos.z.toFixed(2)], state: p.state, anim: p.animMode, grounded: p.grounded,
      speed: +p.speed.toFixed(2), facing: +(p.facing * 180 / Math.PI).toFixed(1), camYaw: +(this.camRig.yaw * 180 / Math.PI).toFixed(1),
      candles: this.candles, totalCandles: this.entities.totalCandles, golden: this.starsGot.filter(Boolean).length, totalGolden: this.entities.totalGolden, hearts: p.hearts, maxHearts: p.maxHearts,
      carrying: p.carrying ? p.carrying.kind : null, counts: { ...p.counts }, pw: { ...p.pw }, pets: this.entities.pets.map((a) => a.id), deaths: this.stats.deaths, asking: this.asking, guide: !!this.guide,
      boss: this.entities.boss ? this.entities.boss.info() : null, vel: [+p.vel.x.toFixed(2), +p.vel.y.toFixed(2), +p.vel.z.toFixed(2)],
      bops: this.stats.bops, enemiesAlive: this.entities.enemies.filter((e) => e.alive).length, checkpoint: this.respawn.pos,
      fps: +this.fps.toFixed(1), pr: this.pr, tris: this.statTris, meshes: this.statMeshes, kinan: this.kinanSource,
      kinanModel: this.kinanModel, models: { ...loadLog },
      petModels: this.entities.pets.map((a) => ({ id: a.id, from: a.parts.from, name: a.parts.name || null, tris: a.parts.tris || 0, h: +a.h.toFixed(2), legs: a.parts.legs.length })),
      calls: this.renderer.info.render.calls, frameTris: this.renderer.info.render.triangles, zone: this.currentZone, cleared: this.mode === 'clear',
    };
  }
}

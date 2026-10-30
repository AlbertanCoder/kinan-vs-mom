// THE FINALE (World 12's last act). Two halves, both driven by levels/12-castle.js:
//   setupFestival(game, cfg)   the level's moving parts: the family on the way, the five firework fuses (a happy challenge:
//                              Kinan KICKS each fuse for Glitchy; the party opens when all five are lit), the cake
//   playFinale(game)           the ending, in the same 3D scene: THE PARTY, THE CAKE ("Happy Birthday"), THE FIREWORKS over
//                              the Bessborough and the river, THE END, the credits, then the memory gallery, then the map.
// Each part is skipped with a tap (or a key). Nobody is beaten up in any of it. All times run on the game's clock.
import * as THREE from 'three';
import { toyMat, dBox, dSphere, dCyl, bake } from './props.js';
import { makeFamily } from './family.js';
import { openGallery } from './gallery.js';

const TAU = Math.PI * 2;
const COLORS = ['#ff5fa2', '#ffd23f', '#7ec8ff', '#5cc23a', '#ff9a3c', '#c79bff'];

// the same credits as World 11's ending (index.html END_CREDITS)
const CREDITS = [['KINAN vs. WORLDS', 'title'], ['STARRING', 'head'], ['Kinan', 'name'], ['THE TEAM', 'head'], ['Mom', 'name'], ['Dad', 'name'], ['Big Sis Chenoa', 'name'], ['Big Bro Shad', 'name'],
  ['Annie', 'name'], ['Glitchy', 'name'], ['THE FAMILY', 'head'], ['GRANDPA', 'name'], ['the Grandmas', 'name'], ['Sabumnim', 'name'], ['THE PETS', 'head'], ['Ginger', 'name'], ['Chikastino', 'name'],
  ['Vader', 'name'], ['Hunter', 'name'], ['Duchess', 'name'], ['Tuxedo', 'name'], ['FRIENDS MADE ON THE WAY', 'head'], ['Bronco', 'name'], ['Robo-Rex', 'name'], ['Drizzle', 'name'],
  ['the Raccoon King', 'name'], ['Brick-Rex', 'name'], ['the Alpha T-Rex', 'name'], ['', 'gap'], ["Made for Kinan's 11th birthday", 'made'], ['by Big Bro Shad', 'made'], ['', 'gap'], ['HAPPY BIRTHDAY, KINAN!', 'title']];

// the last lines: one each, five or fewer in a scene. who = family member id (the camera goes to them), or null = stay wide
const PARTS = [
  { id: 'party', title: 'HAPPY 11TH BIRTHDAY, KINAN!', lines: [
    ['mom', 'Mom', "Eleven years old. You chased that little glitch across the whole country, and you still made it home for cake."],
    ['dad', 'Dad', "What goes up and never comes down? Your age, bud. Happy birthday."],
    ['chenoa', 'Big Sis Chenoa', "You're still the most annoying little brother in Canada. And the best one."],
  ] },
  { id: 'cake', song: true, lines: [
    ['grandmas', 'the Grandmas', "Make a wish, then eat! Eleven worlds and you're still skin and bones!"],
    ['grandpa', 'GRANDPA', "Back in my day we only had the one world. You did good, kid."],
  ] },
  { id: 'fireworks', lines: [
    ['annie', 'Annie', 'Janamdin mubarak, Kinan! (Happy birthday!) Now THAT is in the recipe.'],
    ['shad', 'Big Bro Shad', "I built you one little console, bud. You turned it into eleven worlds. Best build I ever made."],
    [null, 'Glitchy', 'Th... thank... you. Best. Birthday. Ever.'],
    [null, 'Kinan', "This is the best birthday in the whole world. All twelve of them!"],
  ] },
];
const SONG = 'Happy birthday to you, happy birthday to you, happy birthday dear Kinan, happy birthday to you!';
const SONG_NOTES = [[67, 0.75], [67, 0.25], [69, 1], [67, 1], [72, 1], [71, 2], [67, 0.75], [67, 0.25], [69, 1], [67, 1], [74, 1], [72, 2],
  [67, 0.75], [67, 0.25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2], [77, 0.75], [77, 0.25], [76, 1], [72, 1], [74, 1], [72, 2.5]];
const BEAT = 0.36;
const SONG_TIME = SONG_NOTES.reduce((s, n) => s + n[1], 0) * BEAT;
const lineTime = (t) => Math.max(2.8, t.split(/\s+/).length * 0.36 + 1);
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

const STYLE = `
body.finale-on .hud,body.finale-on #touch,body.finale-on #btn-pause{display:none!important}
#finale{position:fixed;inset:0;z-index:12;display:block;color:#fff;cursor:pointer;touch-action:manipulation;user-select:none;-webkit-user-select:none}
#finale [hidden]{display:none!important}
#finale .fin-banner{position:absolute;top:max(14px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);width:min(92vw,720px);text-align:center;font:700 clamp(24px,5vw,42px)/1.1 'Pixelify Sans',monospace;color:#f6c445;text-shadow:0 3px 0 #1b1220,0 0 14px rgba(0,0,0,.45)}
#finale .fin-sub{position:absolute;left:50%;bottom:max(38px,calc(env(safe-area-inset-bottom) + 28px));transform:translateX(-50%);width:min(92vw,780px);box-sizing:border-box;padding:10px 16px;font:400 clamp(17px,2.8vw,23px)/1.28 'Nunito',system-ui,sans-serif;text-align:center;background:rgba(14,16,44,.82);border:3px solid #f6c445;border-radius:12px}
#finale .fin-sub b{color:#f6c445}
#finale .fin-end{position:absolute;inset:0;display:flex;flex-wrap:wrap;gap:0 .4em;align-content:center;justify-content:center;text-align:center;padding:16px;font:700 clamp(28px,6vw,54px)/1.2 'Pixelify Sans',monospace;color:#f6c445;text-shadow:0 4px 0 #1b1220,0 0 22px rgba(0,0,0,.6)}
#finale .fin-credits{position:absolute;inset:0;overflow:hidden;background:rgba(9,10,28,.8)}
#finale .fin-roll{position:absolute;left:0;right:0;top:0;text-align:center;will-change:transform}
#finale .fin-roll p{margin:0;font:700 19px/1.45 'Pixelify Sans',monospace;color:#f4f1e8}
#finale .fin-roll .head{margin-top:16px;font-size:15px;color:#7be3a3}
#finale .fin-roll .title{margin:14px 0;font-size:30px;color:#f6c445}
#finale .fin-roll .made{color:#ff9ac8}
#finale .fin-roll .gap{height:22px}
#finale .fin-tap{position:absolute;right:max(12px,env(safe-area-inset-right));bottom:max(8px,env(safe-area-inset-bottom));font:700 13px 'Pixelify Sans',monospace;color:rgba(255,255,255,.8);text-shadow:0 1px 0 #000}
`;

// ---------------------------------------------------------------- fireworks
export class Fireworks {
  constructor(game) { this.g = game; this.list = []; }
  // a rocket from `from` to `to`, bursting there (delay in game seconds)
  launch(from, to, color, delay = 0) {
    this.list.push({ from: from.clone(), to: to.clone(), p: from.clone(), color, t: -delay, dur: 1.15 });
    if (delay <= 0) this.g.sfx('pew');
  }
  update(dt) {
    const P = this.g.particles;
    this.list = this.list.filter((r) => {
      const was = r.t;
      r.t += dt;
      if (r.t < 0) return true;
      if (was < 0) this.g.sfx('pew');
      const k = Math.min(1, r.t / r.dur), e = 1 - (1 - k) * (1 - k);
      r.p.lerpVectors(r.from, r.to, e);
      P.emit(r.p.x, r.p.y, r.p.z, 0, -2, 0, '#ffe9a8', 0.9, 0.5, 0, 0);
      if (k < 1) return true;
      this.burst(r.to, r.color);
      return false;
    });
  }
  burst(p, color) {
    const P = this.g.particles, n = 70;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, u = Math.random() * 2 - 1, q = Math.sqrt(1 - u * u), sp = 19 + Math.random() * 7;
      P.emit(p.x, p.y, p.z, Math.cos(a) * q * sp, u * sp, Math.sin(a) * q * sp, i % 5 ? color : '#ffffff', 3.2, 1.6 + Math.random() * 0.6, 6, 1.5);
    }
    this.g.sfx('pound'); this.g.sfx('secret');
  }
}

// ---------------------------------------------------------------- the five fuses
function makeFuse(game, def, i) {
  const col = COLORS[i % COLORS.length], g = new THREE.Group(), rocket = new THREE.Group();
  g.position.set(...def.pos); g.rotation.y = (def.yaw || 0) * Math.PI / 180;
  // the launcher stands behind the path line (local -z), the fuse post beside Kinan's feet
  dBox(g, 0, 0, -2.6, 1.9, 0.5, 1.9, '#8d5a33', { r: 0.1 });
  dCyl(g, 0, 0, -1.2, 0.24, 1.2, '#f7f3ea', { seg: 10 });
  dSphere(g, 0, 1.45, -1.2, 0.36, '#e8473c', { seg: 12, rough: 0.3 });
  dBox(g, 0, 0.1, -1.95, 0.12, 0.12, 1.5, '#3a2a20', { r: 0.03 });                 // the fuse cord along the ground
  bake(g, false);
  rocket.position.set(0, 0.5, -2.6); g.add(rocket);
  dCyl(rocket, 0, 0, 0, 0.5, 2.3, col, { seg: 14, rough: 0.3 });
  dCyl(rocket, 0, 0.8, 0, 0.53, 0.32, '#ffffff', { seg: 14 });
  dCyl(rocket, 0, 2.3, 0, 0.5, 0.14, '#ffd23f', { seg: 14 });
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.56, 1.0, 14), toyMat('#ffd23f', 0.3)); tip.position.y = 2.95; rocket.add(tip);
  bake(rocket);
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.75, 4), toyMat('#ffffff', 0.4));
  arrow.rotation.x = Math.PI; arrow.position.set(0, 3.1, -1.2); g.add(arrow);
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffe27a' }));
  spark.position.set(0, 1.95, -1.2); spark.visible = false; g.add(spark);
  game.scene.add(g);
  return { def, g, rocket, arrow, spark, lit: false, i, color: col, to: new THREE.Vector3(...def.pos).add(new THREE.Vector3(0, 40 + i * 3, 30)) };
}

function makeCake(game, pos, yaw) {
  const g = new THREE.Group(), flames = [];
  g.position.set(...pos); g.rotation.y = yaw * Math.PI / 180;
  dCyl(g, 0, 0, 0, 3.0, 1.0, '#fff4dc', { seg: 24 });   // the table
  let top = 1.0;
  for (const [r, h, c1, c2] of [[2.5, 1.2, '#ffd1e6', '#ff6fae'], [1.9, 1.05, '#fff3c4', '#f6c445'], [1.3, 0.95, '#cfeeff', '#3f8fe8']]) {
    dCyl(g, 0, top, 0, r, h, c1, { seg: 24 });
    dCyl(g, 0, top + h - 0.05, 0, r + 0.08, 0.16, c2, { seg: 24 });
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; dSphere(g, Math.cos(a) * (r + 0.02), top + h - 0.14, Math.sin(a) * (r + 0.02), 0.13, c2, { s: [1, 1.5, 1], seg: 8 }); }
    top += h;
  }
  const flameM = new THREE.MeshBasicMaterial({ color: '#ffb83a' });
  for (let i = 0; i < 11; i++) {
    const a = i / 11 * TAU, r = i === 10 ? 0 : 0.92, x = i === 10 ? 0 : Math.cos(a) * r, z = i === 10 ? 0 : Math.sin(a) * r;
    dCyl(g, x, top, z, 0.08, 0.55, i % 2 ? '#ff5fa2' : '#ffffff', { seg: 8 });
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), flameM); f.scale.set(1, 1.6, 1); f.position.set(x, top + 0.74, z);
    g.add(f); flames.push(f);
  }
  bake(g, false);
  game.scene.add(g);
  return { g, flames, top };
}

// ---------------------------------------------------------------- the level's half
// cfg: { along: {id: [x,y,z,yaw]}, party: {id: [x,y,z,yaw]}, kinan: [x,y,z], fuses: [{pos, yaw}], cake: [x,y,z,yaw], shots: {...} }
export function setupFestival(game, cfg) {
  const fam = game.family = makeFamily(game), fw = game.fireworks = new Fireworks(game);
  for (const [id, p] of Object.entries(cfg.along)) fam.place(id, ...p);
  const fuses = cfg.fuses.map((d, i) => makeFuse(game, d, i));
  const cake = makeCake(game, cfg.cake.slice(0, 3), cfg.cake[3] || 0);
  const F = game.festival = { cfg, fuses, cake, lit: 0, nagT: 0, autoT: 0, auto: false };
  const litAll = () => fuses.every((f) => f.lit);
  F.lightFuse = (f) => {
    if (f.lit) return;
    f.lit = true; F.lit++;
    f.arrow.visible = false; f.spark.visible = true;
    const from = new THREE.Vector3(); f.rocket.getWorldPosition(from); from.y += 2;
    f.rocket.visible = false;
    fw.launch(from, f.to, f.color);
    game.particles.sparkle(from, '#ffe27a', 16, 5);
    game.glitchySpin = 0.5;
    game.hud.toast(`FIREWORK ${F.lit} OF ${fuses.length} LIT!`, 1.8);
    if (litAll()) {
      const G = game.entities.goal;
      if (G) { G.locked = false; G.grp.visible = true; }
      game.hud.banner('ALL FIVE LIT!', 'Glitchy is so happy! Run to the party!', 3);
      game.sfx('star');
    }
  };
  game.onKick = (foot) => {
    for (const f of fuses) {
      const p = f.g.position;
      if (!f.lit && Math.hypot(foot.x - p.x, foot.z - p.z) < 3.0 && Math.abs(foot.y - (p.y + 1)) < 2.4) { F.lightFuse(f); return; }
    }
  };
  game.onUpdate((t, dt) => {
    fam.update(t, dt);
    fw.update(dt);
    for (const f of fuses) {
      if (!f.lit) f.arrow.position.y = 3.1 + Math.sin(t * 5 + f.i) * 0.22;
      else if (f.spark.visible && t % 0.4 < dt) game.particles.emit(f.g.position.x, f.g.position.y + 2, f.g.position.z, 0, 2, 0, '#ffe27a', 0.5, 0.5, 2, 0);
    }
    for (const fl of cake.flames) if (fl.visible) fl.scale.y = 1.5 + Math.sin(t * 13 + fl.position.x * 9) * 0.3;
    // the party waits for the fireworks: a friendly word if Kinan gets there early
    F.nagT -= dt;
    const G = game.entities.goal;
    if (G && G.locked && game.mode === 'play' && F.nagT <= 0 && Math.hypot(game.player.pos.x - G.p.x, game.player.pos.z - G.p.z) < 7) {
      F.nagT = 7;
      game.hint(`Glitchy needs a hand first! ${fuses.length - F.lit} more to go: run back and KICK the fuses.`);
    }
    // the sky keeps going during the ending
    if (F.auto) {
      F.autoT -= dt;
      if (F.autoT <= 0) {
        F.autoT = 0.7 + Math.random() * 0.5;
        const s = cfg.shots.sky, from = new THREE.Vector3(...s.from[(Math.random() * s.from.length) | 0]);
        const to = new THREE.Vector3(s.at[0] + (Math.random() - 0.5) * s.spread[0], s.at[1] + Math.random() * s.spread[1], s.at[2] + (Math.random() - 0.5) * s.spread[2]);
        fw.launch(from, to, COLORS[(Math.random() * COLORS.length) | 0]);
      }
    }
  });
  return F;
}

// ---------------------------------------------------------------- the ending's half
class Finale {
  constructor(game) {
    this.g = game; this.F = game.festival; this.cfg = this.F.cfg;
    this.part = -1; this.t = 0; this.say = []; this.log = []; this.done = false; this.parts = [];
    this.lookAt = new THREE.Vector3(); this.camTo = new THREE.Vector3();
    this.buildParts();
  }
  buildParts() {
    const lead = (p) => (p.song ? SONG_TIME + 3.2 : 1.8);
    for (const p of PARTS) {
      let t = lead(p);
      const sched = p.lines.map((l) => { const at = t, d = lineTime(l[2]); t += d + 0.25; return { at, d, who: l[0], label: l[1], text: l[2] }; });
      this.parts.push({ id: p.id, title: p.title, song: !!p.song, sched, dur: t + 0.8 });
    }
    this.parts.push({ id: 'theend', sched: [], dur: 7 });
    this.parts.push({ id: 'credits', sched: [], dur: 30 });
  }
  state() { const p = this.parts[this.part]; return { part: p ? p.id : null, parts: this.parts.map((q) => q.id), lines: this.log.slice(), done: this.done, t: +this.t.toFixed(2) }; }

  start() {
    const g = this.g, pl = g.player;
    pl.frozen = true;
    if (!document.getElementById('finaleStyle')) { const st = document.createElement('style'); st.id = 'finaleStyle'; st.textContent = STYLE; document.head.appendChild(st); }
    document.body.classList.add('finale-on');
    const el = this.el = document.createElement('div'); el.id = 'finale';
    el.innerHTML = '<div class="fin-banner" hidden></div><div class="fin-sub" hidden></div><div class="fin-end" hidden></div><div class="fin-credits" hidden><div class="fin-roll"></div></div><div class="fin-tap">TAP FOR THE NEXT PART</div>';
    document.body.appendChild(el);
    const q = (c) => el.querySelector(c);
    this.ui = { banner: q('.fin-banner'), sub: q('.fin-sub'), end: q('.fin-end'), credits: q('.fin-credits'), roll: q('.fin-roll') };
    for (const [txt, kind] of CREDITS) { const p = document.createElement('p'); p.className = kind; p.textContent = txt; this.ui.roll.appendChild(p); }
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); this.next(); });
    this.onKey = (e) => { if (e.repeat) return; if (['Space', 'Enter', 'Escape', 'KeyF', 'KeyJ'].includes(e.code)) { e.preventDefault(); this.next(); } };
    window.addEventListener('keydown', this.onKey);
    g.hud.fade(true);
    this.stageT = 0.45;   // a short fade, then everyone is at the party
    this.tick = (t, dt) => this.update(dt);
    g.onUpdate(this.tick);
  }
  // everyone at the party: the fade hides the move
  stage() {
    const g = this.g, c = this.cfg, pl = g.player, fam = g.family;
    for (const [id, p] of Object.entries(c.party)) { fam.place(id, ...p); fam.members[id].party = true; }
    if (g.entities.goal) g.entities.goal.grp.visible = false;   // the gold ring has done its job: nothing in front of the cake
    pl.place(c.kinan[0], c.kinan[1] + 0.02, c.kinan[2], 0);
    pl.frozen = true; pl.cheer(9999);
    pl.facing = g.camRig.yaw; pl.sync();
    g.entities.pets.forEach((a, i) => { a.pos.set(c.kinan[0] + (i ? 2.6 : -2.6), c.kinan[1], c.kinan[2] + 0.6); a.target.copy(a.pos); });
    g.hud.fade(false);
    this.goto(0);
  }
  cam(pos, look, cut) {
    const r = this.g.camRig;
    if (!r.override) r.override = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
    r.override.pos.set(...pos); r.override.look.set(...look);
    if (cut) this.g.camera.position.set(...pos);
  }
  // the camera goes to whoever is talking
  focus(who) {
    const m = this.g.family.members[who]; if (!m) return;
    const p = m.root.position, s = this.cfg.shots;
    this.cam([p.x + s.toCam[0] * 7.5, p.y + 3.2, p.z + s.toCam[2] * 7.5], [p.x, p.y + 2.4, p.z]);
  }
  goto(i) {
    this.part = i; this.t = 0; this.next_ = 0;
    const p = this.parts[i], ui = this.ui, s = this.cfg.shots;
    ui.sub.hidden = true; ui.banner.hidden = true; ui.end.hidden = true; ui.credits.hidden = true;
    if (!p) { this.finish(); return; }
    if (p.title) { ui.banner.textContent = p.title; ui.banner.hidden = false; }
    if (p.id === 'party') this.cam(s.party.pos, s.party.look, true);
    if (p.id === 'cake') { this.cam(s.cake.pos, s.cake.look, true); this.sing(); }
    if (p.id === 'fireworks') { this.dusk(); this.cam(s.sky.pos, s.sky.look, true); this.turnToSky(); this.F.auto = true; this.F.autoT = 0; }
    if (p.id === 'theend') { ui.end.innerHTML = '<span>THE END</span> <span>·</span> <span>Happy 11th birthday, Kinan!</span>'; ui.end.hidden = false; }
    if (p.id === 'credits') { ui.roll.style.transform = `translateY(${window.innerHeight}px)`; ui.credits.hidden = false; }
  }
  sing() {
    const g = this.g, a = g.audio;
    this.ui.sub.innerHTML = '♪ ' + SONG + ' ♪'; this.ui.sub.hidden = false;
    if (a && a.ctx) {
      if (a.musicGain) a.musicGain.gain.setTargetAtTime(0, a.ctx.currentTime, 0.2);
      let w = 0.1;
      for (const [n, b] of SONG_NOTES) { a.tone('triangle', midi(n), midi(n), b * BEAT * 0.95, 0.2, w); a.tone('sine', midi(n - 12), midi(n - 12), b * BEAT * 0.95, 0.1, w); w += b * BEAT; }
    }
  }
  blow() {
    const g = this.g, c = this.F.cake;
    this.F.cake.flames.forEach((f) => { f.visible = false; });
    const p = new THREE.Vector3(); c.g.getWorldPosition(p); p.y += c.top + 1;
    g.particles.confetti(p, 90); g.sfx('clear');
    this.ui.sub.hidden = true;
    this.cheers = true;
  }
  // the sun goes down for the fireworks
  dusk() {
    const g = this.g, geo = g.skyMesh.geometry, pos = geo.attributes.position, col = geo.attributes.color, c = new THREE.Color();
    const top = new THREE.Color('#141a52'), mid = new THREE.Color('#5a3f96'), hor = new THREE.Color('#ff9a6a');
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 700;
      if (y > 0.25) c.copy(mid).lerp(top, Math.min(1, (y - 0.25) / 0.6)); else c.copy(hor).lerp(mid, Math.max(0, y) / 0.25);
      col.setXYZ(i, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
    g.scene.background.set('#5a3f96'); g.scene.fog.color.set('#5a4a8a');
    g.hemi.intensity *= 0.62; g.sun.intensity *= 0.42; g.sun.color.set('#ffb489');
  }
  // the family turns to watch the sky
  turnToSky() {
    const g = this.g, s = this.cfg.shots.sky.at;
    for (const m of Object.values(g.family.members)) { const p = m.root.position; m.root.rotation.y = Math.atan2(s[0] - p.x, s[2] - p.z); }
  }
  say_(l) {
    this.log.push(l.label);
    const ui = this.ui, b = document.createElement('b'); b.textContent = l.label + ': ';
    ui.sub.textContent = ''; ui.sub.append(b, document.createTextNode(l.text)); ui.sub.hidden = false;
    if (l.who && this.parts[this.part].id !== 'fireworks') this.focus(l.who);
  }
  update(dt) {
    if (this.done) return;
    if (this.stageT > 0) { this.stageT -= dt; if (this.stageT <= 0) this.stage(); return; }
    const p = this.parts[this.part]; if (!p) return;
    this.t += dt;
    if (p.song && !this.blown && this.t >= SONG_TIME + 0.4) { this.blown = true; this.blow(); }
    while (this.next_ < p.sched.length && this.t >= p.sched[this.next_].at) this.say_(p.sched[this.next_++]);
    if (this.next_ > 0) { const l = p.sched[this.next_ - 1]; if (this.t > l.at + l.d) this.ui.sub.hidden = true; }
    if (p.id === 'credits') {
      const h = this.ui.roll.scrollHeight, H = window.innerHeight, end = H / 2 - h + 20, y = Math.max(H - (this.t / (p.dur - 4)) * (H - end), end);
      this.ui.roll.style.transform = `translateY(${y.toFixed(1)}px)`;
    }
    if (this.t >= p.dur) this.goto(this.part + 1);
  }
  // a tap: on to the next part
  next() {
    if (this.done || this.stageT > 0 || this.part < 0) return;
    const p = this.parts[this.part];
    if (p && p.song && !this.blown) { this.blown = true; this.blow(); }
    this.goto(this.part + 1);
  }
  finish() {
    if (this.done) return;
    this.done = true;
    window.removeEventListener('keydown', this.onKey);
    this.el.remove();
    this.g.finaleDone = true;
    openGallery({ closeLabel: 'BACK TO THE MAP', onClose: () => { document.body.classList.remove('finale-on'); if (this.g.opts.onDone) this.g.opts.onDone(); } });
  }
}

export function playFinale(game) {
  const f = game.finale = new Finale(game);
  f.start();
  return f;
}

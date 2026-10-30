// The family in 3D, for World 12's festival and finale: bright chunky toys built from the same primitives as the props.
// Colours and clothes come from the approved 2D designs (index.html, "the family, the approved designs"); the World 12
// rules on top: Dad has his moustache, Annie her camel coat and no sunglasses, Big Bro Shad a hard hat, a hi-vis vest
// and a claw hammer. Everyone faces +z with their feet at y=0, and hops and waves when Kinan comes near.
//   const fam = makeFamily(game);  fam.place('mom', x, y, z, yawDeg);  fam.update(t, dt);  fam.members.mom.party = true
import * as THREE from 'three';
import { toyMat, dBox, dSphere, dCyl, bake } from './props.js';
import { Blob } from './entities.js';
import { damp } from './util.js';

const INK = '#141018';

function eyes(p, y, o = {}) {
  for (const sx of [-1, 1]) {
    dSphere(p, sx * 0.15, y + 0.05, 0.36, 0.085, '#ffffff', { s: [1, 1.2, 0.5], seg: 10 });
    dSphere(p, sx * 0.15, y + 0.04, 0.4, 0.05, o.eye || '#2a1a12', { s: [1, 1.2, 0.5], seg: 10 });
    dBox(p, sx * 0.15, y + 0.18, 0.37, 0.17, 0.04, 0.03, o.brow || '#2a1a12', { r: 0.015 });
  }
}
const smile = (p, y) => dBox(p, 0, y - 0.21, 0.385, 0.2, 0.05, 0.03, '#7d1f33', { r: 0.02 });
function glasses(p, y) {
  for (const sx of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.018, 6, 14), toyMat(INK)); r.position.set(sx * 0.15, y + 0.05, 0.41); p.add(r); }
  dBox(p, 0, y + 0.04, 0.42, 0.09, 0.025, 0.02, INK, { r: 0.01 });
}

// one person: spec { scale, skin, shirt, sleeve, legs, shoe, wide, skirt }, then `dress(body, armL, armR, m)` adds the rest
function person(s, dress) {
  const H = s.scale || 1, legH = 0.95 * H, torH = 0.92 * H, W = s.wide || 0.82, shY = legH + torH - 0.14, headY = legH + torH + 0.4;
  const root = new THREE.Group(), body = new THREE.Group(), armL = new THREE.Group(), armR = new THREE.Group();
  root.add(body); body.add(armL); body.add(armR);
  armL.position.set(-(W / 2 + 0.11), shY, 0); armR.position.set(W / 2 + 0.11, shY, 0);
  if (s.skirt) dCyl(body, 0, 0.32, 0, 0.5, legH - 0.2, s.skirt, { taper: 0.82, seg: 16 });
  for (const sx of [-1, 1]) {
    dBox(body, sx * 0.2, 0.1, 0, 0.27, legH - 0.05, 0.3, s.legs);
    dBox(body, sx * 0.2, 0, 0.07, 0.31, 0.2, 0.46, s.shoe || INK, { r: 0.08 });
  }
  dBox(body, 0, legH - 0.04, 0, W, torH, 0.5, s.shirt, { r: 0.17 });
  dCyl(body, 0, legH + torH - 0.05, 0, 0.13, 0.16, s.skin, { seg: 10 });
  dSphere(body, 0, headY, 0, 0.42, s.skin, { seg: 20 });
  for (const sx of [-1, 1]) dSphere(body, sx * 0.41, headY, 0, 0.075, s.skin, { s: [0.55, 0.9, 1], seg: 8 });
  for (const [arm] of [[armL], [armR]]) {
    dBox(arm, 0, -0.78 * H, 0, 0.23, 0.8 * H, 0.26, s.sleeve || s.shirt);
    dSphere(arm, 0, -0.84 * H, 0, 0.14, s.skin, { seg: 10 });
  }
  const m = { H, legH, torH, shY, headY, W };
  dress(body, armL, armR, m);
  bake(body, false); bake(armL); bake(armR);
  return { root, body, armL, armR, m, c: 0, ph: Math.random() * 6, party: false };
}

// a little name sign that floats over a head (the same on-screen labels as the rest of the game)
function nameTag(text) {
  const c = document.createElement('canvas'); c.width = 320; c.height = 72;
  const x = c.getContext('2d');
  x.font = "700 40px 'Pixelify Sans', monospace"; x.textAlign = 'center'; x.textBaseline = 'middle';
  const w = Math.min(312, x.measureText(text).width + 36);
  x.fillStyle = 'rgba(20,22,50,.86)'; x.beginPath();
  if (x.roundRect) x.roundRect(160 - w / 2, 6, w, 60, 14); else x.rect(160 - w / 2, 6, w, 60);
  x.fill();
  x.strokeStyle = '#f6c445'; x.lineWidth = 4; x.stroke();
  x.fillStyle = '#ffffff'; x.fillText(text, 160, 38);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, fog: false }));
  sp.scale.set(3.2, 0.72, 1); sp.renderOrder = 6;
  return sp;
}

const mom = () => person({ skin: '#c98d63', shirt: '#5b46a8', legs: '#2b2f45' }, (b, l, r, m) => {
  const y = m.headY;
  eyes(b, y, { brow: '#1d1416' }); smile(b, y);
  dSphere(b, 0, y + 0.13, -0.05, 0.45, '#1d1416', { s: [1.02, 0.86, 1], seg: 16 });     // short dark hair
  for (const sx of [-1, 1]) dSphere(b, sx * 0.34, y - 0.08, -0.02, 0.17, '#1d1416', { s: [0.7, 1.2, 1], seg: 10 });
  const by = m.legH + m.torH * 0.66;                                                      // the white butterfly
  for (const sx of [-1, 1]) { dSphere(b, sx * 0.12, by + 0.05, 0.26, 0.12, '#ffffff', { s: [1, 1.2, 0.3], seg: 8 }); dSphere(b, sx * 0.09, by - 0.1, 0.26, 0.08, '#ffffff', { s: [1, 1.1, 0.3], seg: 8 }); }
});

const dad = () => person({ scale: 1.04, skin: '#ecbd98', shirt: '#2b2f45', legs: '#2b2f45' }, (b, l, r, m) => {
  const y = m.headY;
  eyes(b, y); smile(b, y - 0.02);
  dSphere(b, 0, y + 0.17, -0.02, 0.44, '#6b6f7a', { s: [1.02, 0.72, 1.02], seg: 16 });    // grey work cap
  dBox(b, 0, y + 0.13, 0.36, 0.62, 0.07, 0.34, '#5e5e6a', { r: 0.03 });                    // its brim
  for (const sx of [-1, 1]) dBox(b, sx * 0.38, y - 0.12, 0.05, 0.08, 0.26, 0.14, '#9a9aa6', { r: 0.03 });   // grey sideburns
  dBox(b, -0.11, y - 0.14, 0.4, 0.21, 0.09, 0.06, '#3b2618', { r: 0.035 }).rotation.z = -0.22;   // HIS MOUSTACHE
  dBox(b, 0.11, y - 0.14, 0.4, 0.21, 0.09, 0.06, '#3b2618', { r: 0.035 }).rotation.z = 0.22;
  const sy = m.legH + m.torH * 0.42;                                                       // reflective stripes on the coveralls
  dBox(b, 0, sy, 0.235, m.W + 0.02, 0.09, 0.05, '#c9c9cf', { r: 0.02 });
  for (const sx of [-1, 1]) dBox(b, sx * 0.2, 0.42, 0.14, 0.29, 0.07, 0.04, '#c9c9cf', { r: 0.02 });
  for (const a of [l, r]) dBox(a, 0, -0.5, 0.12, 0.25, 0.07, 0.04, '#c9c9cf', { r: 0.02 });
});

const chenoa = () => person({ scale: 1.14, skin: '#c98d63', shirt: '#1b1220', legs: '#2b2f45', shoe: '#8a8a98' }, (b, l, r, m) => {
  const y = m.headY;
  eyes(b, y, { brow: '#1d1416' }); smile(b, y);
  dSphere(b, 0, y + 0.12, -0.06, 0.45, '#1d1416', { s: [1.02, 0.88, 1], seg: 16 });       // hair pulled up...
  dSphere(b, 0, y + 0.52, -0.2, 0.1, '#f6c445', { seg: 10 });                              // the gold tie
  dSphere(b, 0, y + 0.66, -0.26, 0.2, '#1d1416', { s: [0.9, 1.1, 0.9], seg: 10 });         // ...into a high ponytail
  dSphere(b, 0, y + 0.42, -0.42, 0.18, '#1d1416', { s: [0.85, 1.6, 0.85], seg: 10 });
  dBox(b, 0, m.legH * 0.45, 0.235, 0.74, m.torH * 0.72 + m.legH * 0.55, 0.05, '#c2414f', { r: 0.03 });   // the plain red server apron
  dBox(b, 0.23, m.legH + m.torH * 0.56, 0.27, 0.11, 0.09, 0.03, '#ffffff', { r: 0.02 });   // her dove pin
});

const shad = () => person({ scale: 1.02, skin: '#d9a27a', shirt: '#ff8a3d', legs: '#a8692e', shoe: '#6b3f18' }, (b, l, r, m) => {
  const y = m.headY;
  eyes(b, y); smile(b, y - 0.01);
  dSphere(b, 0, y + 0.13, 0, 0.45, '#f6c445', { s: [1.03, 0.8, 1.03], seg: 16, rough: 0.3 });   // the hard hat
  dCyl(b, 0, y + 0.12, 0, 0.56, 0.06, '#f6c445', { seg: 18, rough: 0.3 });
  dBox(b, 0, y + 0.34, 0, 0.14, 0.26, 0.76, '#ffd86a', { r: 0.05 });                       // its ridge
  dBox(b, 0, y - 0.33, 0.33, 0.16, 0.14, 0.1, '#3b2618', { r: 0.04 });                     // the goatee
  const t = m.legH - 0.02;                                                                 // the lime hi-vis vest over the orange shirt
  for (const sx of [-1, 1]) dBox(b, sx * 0.25, t + 0.12, 0.02, 0.33, m.torH - 0.16, 0.55, '#c6f03a', { r: 0.05 });
  dBox(b, 0, t + 0.12, -0.02, m.W + 0.02, m.torH - 0.16, 0.5, '#c6f03a', { r: 0.05 });
  for (const sx of [-1, 1]) dBox(b, sx * 0.25, t + 0.5, 0.31, 0.34, 0.08, 0.04, '#f4f1e8', { r: 0.02 });
  dBox(b, 0, t - 0.06, 0, m.W + 0.05, 0.16, 0.54, '#6b3f18', { r: 0.04 });                 // the tool belt
  dBox(b, -0.3, t - 0.2, 0.28, 0.2, 0.2, 0.12, '#f6c445', { r: 0.05 });                    // the yellow tape measure
  // the claw hammer, in his right hand: the handle sticks out sideways so it reads from the side camera
  dBox(r, 0.42, -0.9, 0, 0.84, 0.1, 0.1, '#a8692e', { r: 0.03 });
  dBox(r, 0.86, -1.08, 0, 0.2, 0.4, 0.2, '#c9c9cf', { r: 0.05 });
  const claw = dBox(r, 0.97, -0.72, 0, 0.13, 0.26, 0.14, '#c9c9cf', { r: 0.03 }); claw.rotation.z = -0.5;
});

const annie = () => person({ skin: '#b97f57', shirt: '#b98a50', legs: '#1b1220', skirt: '#b98a50' }, (b, l, r, m) => {
  const y = m.headY;
  eyes(b, y, { brow: '#1d1416' }); smile(b, y);
  dSphere(b, 0, y + 0.12, -0.08, 0.47, '#1d1416', { s: [1.04, 0.9, 1], seg: 16 });         // long curly dark hair
  for (const [px, py, pz, pr] of [[-0.42, y - 0.1, -0.1, 0.22], [0.42, y - 0.1, -0.1, 0.22], [-0.46, y - 0.42, -0.12, 0.21], [0.46, y - 0.42, -0.12, 0.21], [-0.36, y - 0.72, -0.14, 0.19], [0.36, y - 0.72, -0.14, 0.19], [0, y - 0.4, -0.34, 0.34], [-0.2, y - 0.72, -0.3, 0.22], [0.2, y - 0.72, -0.3, 0.22]]) dSphere(b, px, py, pz, pr, '#1d1416', { seg: 10 });
  dBox(b, 0, m.legH + 0.26, 0, m.W + 0.05, 0.14, 0.54, '#6b3f18', { r: 0.04 });            // the wrap belt of her camel coat
  const lap = dBox(b, 0.02, m.legH + 0.12, 0.25, 0.14, m.torH - 0.2, 0.05, '#8f6a3c', { r: 0.02 }); lap.rotation.z = -0.28;
  dBox(l, 0.14, -0.86, 0.26, 0.5, 0.36, 0.04, INK, { r: 0.03 });                           // her tablet
  dBox(l, 0.14, -0.83, 0.285, 0.44, 0.3, 0.02, '#7ee8ff', { r: 0.01 });
});

function grandmaOne() {
  return person({ scale: 0.86, skin: '#c98d63', shirt: '#2f9a95', legs: '#c98d63', skirt: '#9b2d6b' }, (b, l, r, m) => {
    const y = m.headY;
    eyes(b, y, { brow: '#9a9aa6' }); smile(b, y); glasses(b, y);
    dSphere(b, 0, y + 0.14, -0.06, 0.45, '#9a9aa6', { s: [1.03, 0.86, 1], seg: 16 });      // grey hair
    dSphere(b, 0, y + 0.5, -0.14, 0.17, '#9a9aa6', { seg: 10 });
    dBox(b, 0, m.legH, 0.235, 0.22, m.torH - 0.04, 0.05, '#f4f1e8', { r: 0.02 });          // the cardigan's front
    // her walker with tennis balls
    for (const sx of [-1, 1]) for (const sz of [0.34, 0.86]) { dBox(b, sx * 0.56, 0.08, sz, 0.07, 1.12, 0.07, '#c9c9cf', { r: 0.02 }); }
    for (const sx of [-1, 1]) { dBox(b, sx * 0.56, 1.18, 0.6, 0.08, 0.07, 0.62, '#c9c9cf', { r: 0.02 }); dSphere(b, sx * 0.56, 0.07, 0.86, 0.1, '#c6f03a', { seg: 10 }); dSphere(b, sx * 0.56, 0.07, 0.34, 0.1, '#c6f03a', { seg: 10 }); }
    dBox(b, 0, 1.18, 0.86, 1.14, 0.07, 0.07, '#c9c9cf', { r: 0.02 });
  });
}
function grandmaTwo() {
  return person({ scale: 0.86, skin: '#ecbd98', shirt: '#b49ad8', legs: '#6b6f7a' }, (b, l, r, m) => {
    const y = m.headY;
    eyes(b, y, { brow: '#f4f1e8' }); smile(b, y);
    dSphere(b, 0, y + 0.14, -0.06, 0.43, '#f4f1e8', { s: [1.03, 0.86, 1], seg: 12 });      // curly white hair
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; dSphere(b, Math.cos(a) * 0.38, y + 0.2 + (i % 2) * 0.12, Math.sin(a) * 0.36 - 0.05, 0.15, '#f4f1e8', { seg: 8 }); }
    dBox(b, 0, m.legH + m.torH * 0.72, 0.235, 0.34, 0.09, 0.05, '#6b3f18', { r: 0.02 });
  });
}

const grandpa = () => person({ scale: 0.92, skin: '#ecbd98', shirt: '#e8364b', legs: '#6b6f7a', sleeve: '#a8692e' }, (b, l, r, m) => {
  const y = m.headY;
  eyes(b, y, { brow: '#f4f1e8' }); smile(b, y - 0.04); glasses(b, y);
  dSphere(b, 0, y + 0.03, -0.03, 0.42, '#ecbd98', { seg: 12 });
  for (const sx of [-1, 1]) dSphere(b, sx * 0.37, y + 0.02, -0.08, 0.15, '#f4f1e8', { seg: 10 });   // white hair at the sides
  dBox(b, -0.12, y - 0.16, 0.39, 0.25, 0.11, 0.07, '#f4f1e8', { r: 0.04 }).rotation.z = -0.22;       // a big white moustache like Dad's
  dBox(b, 0.12, y - 0.16, 0.39, 0.25, 0.11, 0.07, '#f4f1e8', { r: 0.04 }).rotation.z = 0.22;
  dCyl(b, 0, y + 0.3, 0, 0.36, 0.2, '#f6c445', { seg: 12 });                               // his gold paper crown
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.2, 4), toyMat('#f6c445')); tip.position.set(Math.sin(a) * 0.33, y + 0.58, Math.cos(a) * 0.33); b.add(tip); }
  const t = m.legH - 0.02;                                                                 // the brown cardigan over the red shirt
  for (const sx of [-1, 1]) dBox(b, sx * 0.29, t + 0.02, 0.0, 0.27, m.torH - 0.02, 0.54, '#a8692e', { r: 0.05 });
  dBox(b, 0, t + 0.04, -0.03, m.W + 0.03, m.torH - 0.06, 0.48, '#a8692e', { r: 0.05 });
});

export function makeFamily(game) {
  const scene = game.scene, members = {};
  const add = (id, label, parts) => {
    const root = parts.length === 1 ? parts[0].root : new THREE.Group();
    if (parts.length > 1) parts.forEach((p, i) => { p.root.position.x = (i ? 1 : -1) * 1.15; root.add(p.root); });
    const tag = nameTag(label);
    tag.position.y = Math.max(...parts.map((p) => p.m.headY)) + 1.25;
    root.add(tag);
    scene.add(root);
    members[id] = { id, label, root, parts, tag, party: false, blobs: parts.map(() => new Blob(scene, game.world, 2.1)) };
  };
  add('mom', 'Mom', [mom()]);
  add('dad', 'Dad', [dad()]);
  add('chenoa', 'Big Sis Chenoa', [chenoa()]);
  add('shad', 'Big Bro Shad', [shad()]);
  add('annie', 'Annie', [annie()]);
  add('grandpa', 'GRANDPA', [grandpa()]);
  add('grandmas', 'the Grandmas', [grandmaOne(), grandmaTwo()]);
  const v = new THREE.Vector3();
  const F = {
    members,
    place(id, x, y, z, yawDeg = 0) {
      const m = members[id];
      m.root.position.set(x, y, z); m.root.rotation.y = yawDeg * Math.PI / 180;
      m.root.updateMatrixWorld(true);
      m.parts.forEach((p, i) => { p.root.getWorldPosition(v); m.blobs[i].update(v.x, y + 0.2, v.z, 8); });
    },
    update(t, dt) {
      const pp = game.player.pos;
      for (const m of Object.values(members)) {
        const near = m.party || Math.hypot(pp.x - m.root.position.x, pp.z - m.root.position.z) < 13;
        for (const p of m.parts) {
          p.c = damp(p.c, near ? 1 : 0, 6, dt);
          const wave = Math.sin(t * 9 + p.ph) * 0.22 * p.c;
          p.body.position.y = Math.abs(Math.sin(t * 5.5 + p.ph)) * 0.26 * p.c;
          p.armL.rotation.z = -0.1 - 2.45 * p.c + wave;
          p.armR.rotation.z = 0.1 + 2.45 * p.c + wave;
        }
      }
    },
  };
  return F;
}

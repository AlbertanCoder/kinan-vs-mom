// =====================================================================================
//  WORLD 12-6  ·  KINSMEN PARK RIDES  ·  ROUGH DRAFT (2026-10-30, Developer mode only)
// =====================================================================================
// A short 2.5D run through the kids' park: ride the little train across the pond, ride the Ferris wheel's seats, and hop the
// carousel horses. Nobody is beaten up: the four foes only wander and are stomped or KICKED away (they never hurt), and the
// only way to fall is into the pond, which just goes back to the start (or the checkpoint).
// Everything is placed by s = distance along the path (0 = start, 440 = the path's end) and off = how far behind the path
// line (away from the camera; negative = toward it). The path is one straight line, heading west.
//   s   0- 70  the park gate, a playground, a wandering sock, the train station
//   s  70-150  the POND: the little train carries Kinan across (hop from car to car)
//   s 150-186  the far station: the one checkpoint, a wandering brick, Big Bro Shad's crates (KICK them)
//   s 186-252  the FERRIS WHEEL: hop on a seat at the bottom, ride up for the golden candle, hop off on the far side
//   s 254-330  the CAROUSEL: horses that bob up and down, a golden candle under the roof     s 330-375 the goal
import * as THREE from 'three';
import { CITY, CITY_TEXTURES, titleCard } from '../js/props-city.js';
import { FESTIVAL } from '../js/props-festival.js';
import { dBox, dCyl, dSphere, bake } from '../js/props.js';
import { savePose, moved } from '../js/physics.js';

const T0 = 0, WATER = -2.6, BASE = -9;
const X0 = 380, Z0 = -40;
const PATH = [[X0, Z0], [X0 - 440, Z0]];
// world [x, y, z] at distance s along the path, `off` behind the path line
const W = (s, y = 0, off = 0) => [X0 - s, y, Z0 + off];
const XZ = (s) => [X0 - s, Z0];
const FACE = 180, FWD = -90;                  // a prop facing the camera; Kinan facing right (forward)
const zoneAt = (s0, s1, y0, y1, o) => ({ min: [X0 - s1, y0, Z0 - 20], max: [X0 - s0, y1, Z0 + 14], ...o });
const row = (s0, s1, n, y, off = 0) => Array.from({ length: n }, (_, i) => W(s0 + (s1 - s0) * (n === 1 ? 0 : i / (n - 1)), y, off));

// the path strip: 2.5 toward the camera (a cut-away, like the 2D game), 12 behind (see 12-3-side.js)
const FRONT = -2.5, BACKO = 12;
const POND = [70, 150];
// the little train: three cars (centre s at the near station, at the far station), they shuttle across the pond
const TRAIN = [{ a: 72.5, z: 136.3, color: '#3f8fe8' }, { a: 78.1, z: 141.9, color: '#ffd23f' }, { a: 83.7, z: 147.5, color: '#e8473c' }];
// the Ferris wheel: hub (s, y), radius, six seats; platforms to get on and off at the seats' lowest height
const WHEEL = { s: 222, y: 9.5, r: 7, n: 6, speed: 0.4, low: 2.5, on: [196, 215], off: [229, 242] };
// the carousel horses (centre s) bob between two heights
const HORSES = [{ s: 274, ph: 0 }, { s: 286, ph: 1.4 }, { s: 298, ph: 2.8 }, { s: 310, ph: 4.2 }];
const DECK = 0.6, ROOF = 10;
const GOAL_S = 346;

const L = {
  id: '12-6',
  title: 'KINSMEN PARK RIDES',
  subtitle: 'the train, the Ferris wheel and the carousel',
  cardText: 'Ride the train, the Ferris wheel and the carousel!',
  clearText: 'What a day at the park! What a day at the park! More of Saskatoon is on the way!',
  intro: 'The kids\' park! Run RIGHT. Hop on the little train, ride the Ferris wheel and hop the carousel horses!',
  helpAfter: 5,
  assets: { kinan: '../worlds/w12_assets/kinan.glb', glitchy: '../worlds/w12_assets/glitchy.glb', pets: '../worlds/w12_assets/pet_{id}.glb' },
  props: { ...CITY, ...FESTIVAL },
  textures: CITY_TEXTURES,
  presentBoxes: true,   // wrapped birthday presents instead of "?" boxes
  killY: -6.2,
  sky: { top: '#3a86e0', mid: '#8ccaf5', horizon: '#fde8c6', fog: '#f4e4c8', fogNear: 170, fogFar: 680 },
  light: { sky: '#e8f4ff', ground: '#f4dcc0', hemi: 0.74, sun: '#fff0d0', sunI: 2.6, dir: [26, 52, -30], shadowSize: 30, env: 0.4 },
  exposure: 0.92,
  // ---- 2.5D side mode (see js/side.js)
  side: { path: PATH, dist: 17, height: 2.2, pitch: 0.15, lookAhead: 3.5, round: 9 },
  spawn: { pos: W(4, T0), yaw: FWD },
  zoneOf: () => 'o',
  camZones: [
    zoneAt(190, 252, -2, 24, { dist: 27, pitch: 0.22, height: 5.5 }),                // the Ferris wheel: the whole wheel stays in the picture
    zoneAt(258, 326, -2, 14, { dist: 22, pitch: 0.2, height: 3.6 }),                 // the carousel
  ],

  // ===================================================================== static scenery
  build(b) {
    titleCard(L);
    b.push(X0, 0, Z0, 180);      // from here: x = s (distance along the path), z = -off (negative = behind the path)
    // a box in path terms: s0..s1 along, y0..y1, offA..offB across (offA = the camera side)
    const slab = (s0, s1, y0, y1, offA, offB, color, o = {}) => b.box((s0 + s1) / 2, y0, -(offA + offB) / 2, s1 - s0, y1 - y0, offB - offA, color, o);
    const topTex = (tex, s0, s1, y, offA, offB, scale = 8) => b.texQuad(tex, s0, -offB, s1, -offA, y, scale);
    const end = (s, y0, y1, dir) => {   // a clay face across the path at s (dir +1 faces forward, -1 back)
      b.push(s, 0, 0, dir > 0 ? 90 : -90);
      b._wallFace('clay', dir > 0 ? FRONT : -BACKO, dir > 0 ? BACKO : -FRONT, y0, y1, 0.03, 1, 6, 0);
      b.pop();
    };
    const ground = (s0, s1, y1, color) => {      // the park path's ground from s0 to s1, top at y1
      slab(s0, s1, BASE, y1, FRONT, BACKO, color, { r: 0.05, cast: false });
      topTex('leafGrass', s0, s1, y1 + 0.012, FRONT, BACKO);
      b._wallFace('clay', s0, s1, BASE, y1, -FRONT + 0.03, 1, 6, 0);
    };
    const ZC = -(FRONT + BACKO) / 2, WD = BACKO - FRONT;
    const ramp = (sHi, yHi, sLo, yLo, color) => {
      b.ramp(sLo, ZC, yLo, sHi, ZC, yHi, WD, color, { base: BASE });
      b.texSlope('trail', sLo, ZC, yLo + 0.02, sHi, ZC, yHi + 0.02, WD - 0.2, 6);
    };

    // ---------- the park path: the gate end, the far station and everything after the pond
    ground(-14, POND[0], T0, '#7cbf45'); end(POND[0], BASE, T0, 1); topTex('trail', -14, POND[0], T0 + 0.02, -1.7, 1.7, 6);
    ground(POND[1], 186, T0, '#86c25a'); end(POND[1], BASE, T0, -1); topTex('trail', POND[1], 186, T0 + 0.02, -1.7, 1.7, 6);
    // the Ferris wheel's platforms (solid), ramps up and down; the ground goes on under the wheel
    ground(186, 420, T0, '#86c25a'); topTex('trail', 186, 254, T0 + 0.02, -1.7, 1.7, 6);
    ramp(196, WHEEL.low, 186, T0, '#d8b98a');
    slab(WHEEL.on[0], WHEEL.on[1], BASE, WHEEL.low, FRONT, BACKO, '#c9975a', { r: 0.2 }); topTex('deck', WHEEL.on[0], WHEEL.on[1], WHEEL.low + 0.014, FRONT, BACKO, 4);
    b._wallFace('clay', WHEEL.on[0], WHEEL.on[1], T0, WHEEL.low, -FRONT + 0.03, 1, 6, 0); end(WHEEL.on[1], T0, WHEEL.low, 1);
    slab(WHEEL.off[0], WHEEL.off[1], BASE, WHEEL.low, FRONT, BACKO, '#c9975a', { r: 0.2 }); topTex('deck', WHEEL.off[0], WHEEL.off[1], WHEEL.low + 0.014, FRONT, BACKO, 4);
    b._wallFace('clay', WHEEL.off[0], WHEEL.off[1], T0, WHEEL.low, -FRONT + 0.03, 1, 6, 0); end(WHEEL.off[0], T0, WHEEL.low, -1);
    ramp(242, WHEEL.low, 254, T0, '#d8b98a');
    // the carousel's floor (a step up) and its roof
    ramp(262, DECK, 254, T0, '#d8b98a');
    slab(262, 322, BASE, DECK, FRONT, BACKO, '#f1e3c2', { r: 0.2 }); topTex('deck', 262, 322, DECK + 0.014, FRONT, BACKO, 4);
    b._wallFace('clay', 262, 322, T0, DECK, -FRONT + 0.03, 1, 6, 0); end(322, T0, DECK, 1);
    b.cone(292, ROOF, -10, 22, 5, '#e8473c', { seg: 16, col: false, cast: false });
    b.torus(292, ROOF + 0.05, -10, 22, 0.4, '#ffd23f', { col: false, cast: false });
    b.box(292, ROOF + 4.8, -10, 0.2, 2.2, 0.2, '#ffd23f', { col: false }); b.box(293.2, ROOF + 6.4, -10, 2.4, 1.0, 0.1, '#ff5fa2', { col: false });
    for (const s of [272, 292, 312]) slab(s - 0.25, s + 0.25, DECK, ROOF, 11, 11.5, '#ffd23f', { col: false, r: 0.1 });

    // ---------- the pond, the train track over it, the lawn all round
    topTex('water', POND[0] - 4, POND[1] + 4, WATER, -14, 20, 8);
    slab(POND[0] - 4, POND[1] + 4, BASE, WATER - 0.05, -14, 20, '#7a8f6a', { col: false, r: 0, cast: false });
    for (let s = POND[0] + 1; s < POND[1]; s += 2) slab(s - 0.3, s + 0.3, -1.7, -1.5, -1.7, 1.7, '#8d5a33', { col: false, r: 0.03 });
    for (const off of [-1.05, 1.05]) slab(POND[0] - 2, POND[1] + 2, -1.5, -1.35, off - 0.15, off + 0.15, '#9aa3b2', { col: false, r: 0.04, mat: 'gloss' });
    for (let s = POND[0] + 6; s < POND[1]; s += 10) slab(s - 0.4, s + 0.4, BASE, -1.7, -1.6, 1.6, '#8d5a33', { col: false, r: 0.05 });
    const lawn = (s0, s1, offA, offB) => { slab(s0, s1, BASE, -0.05, offA, offB, '#84c652', { col: false, r: 0, cast: false }); topTex('leafGrass', s0, s1, -0.038, offA, offB); };
    lawn(-300, POND[0] - 4, -90, FRONT); lawn(POND[1] + 4, 700, -90, FRONT);        // in front of the path
    lawn(POND[0] - 4, POND[1] + 4, -90, -14);                                      // the pond's near shore, toward the camera
    lawn(-300, POND[0] - 4, BACKO, 120); lawn(POND[1] + 4, 700, BACKO, 120);        // behind the path
    lawn(POND[0] - 4, POND[1] + 4, 20, 120);                                       // the pond's far shore
    // the Ferris wheel's frame and rim (the seats and spokes turn: see setup)
    b.torus(WHEEL.s, WHEEL.y, -2.4, WHEEL.r, 0.22, '#e8473c', { rx: 0, col: false, cast: false });
    b.torus(WHEEL.s, WHEEL.y, -2.4, WHEEL.r * 0.5, 0.14, '#ffffff', { rx: 0, col: false, cast: false });
    for (const sg of [-1, 1]) b.box(WHEEL.s + sg * 3, -0.9, -2.4, 0.9, 11.3, 0.9, '#3f8fe8', { col: false, r: 0.1, rz: sg * 32.3 });   // the two legs, hub to ground
    b.box(WHEEL.s, 0, -2.4, 14, 0.6, 1.4, '#3f8fe8', { col: false, r: 0.1 });
    b.pop();

    // ---------- far away: downtown
    for (const [x, z, w, h, c] of [[-100, 340, 18, 96, '#cfd6e2'], [-40, 360, 14, 72, '#e3dcd0'], [60, 350, 16, 108, '#b8c8dc'], [260, 330, 12, 64, '#dcd2c2'], [330, 380, 20, 128, '#c4d0de'], [400, 370, 14, 84, '#e6e0d6'], [-160, 330, 16, 70, '#d6dce6'], [450, 345, 16, 88, '#c4d0de']]) b.prop('tower', x, 0, z, 180, { w, d: w, h, color: c, spire: h > 100 });
  },

  // ===================================================================== props (data)
  place: [
    // ---------- the gate and the playground
    ['festArch', ...W(12, T0, 3.4), FACE, { text: 'KINSMEN|PARK', w: 10 }],
    ['balloons', ...W(4, T0, 3.2), 0, { seed: 1 }], ['balloons', ...W(24, T0, 3.2), 0, { seed: 2 }],
    ['swingset', ...W(36, T0, 5.6), FACE, {}],
    ['sandbox', ...W(50, T0, 5.2), FACE, {}],
    ['picnicTable', ...W(60, T0, 4.4), FACE, {}],
    ['stall', ...W(44, T0, 8.4), FACE, { text: 'BALLOON|STAND', awning: '#ff5fa2', goods: ['#e8473c', '#3f8fe8', '#ffd23f'] }],
    ['sign', ...W(66, T0, 2.6), FACE, { text: 'TRAIN ->', w: 2.4, postH: 1.3 }],
    // ---------- the far station
    ['sign', ...W(154, T0, 2.6), FACE, { text: 'FAR|STATION', w: 2.4, postH: 1.3 }],
    ['bench', ...W(160, T0, 3.4), FACE, {}], ['bunting', ...W(164, T0, 2.9), FACE, { len: 14 }],
    ['sign', ...W(182, T0, 2.6), FACE, { text: 'FERRIS|WHEEL ->', w: 2.8, postH: 1.3 }],
    // ---------- the carousel and the end of the park
    ['sign', ...W(252, T0, 2.6), FACE, { text: 'CAROUSEL ->', w: 3.0, postH: 1.3 }],
    ['bunting', ...W(332, T0, 2.9), FACE, { len: 16 }],
    ['festArch', ...W(GOAL_S, T0, 5), FACE, { text: 'WHAT A DAY!', w: 11 }],
    ['balloons', ...W(338, T0, 3.2), 0, { seed: 3 }], ['balloons', ...W(358, T0, 3.2), 0, { seed: 4 }],
    ['bench', ...W(352, T0, 3.4), FACE, {}],
    // ---------- trees and sky
    ...[[-8, 8], [18, 9], [30, 10], [56, 8.5], [158, 9], [172, 8], [236, 14], [248, 9], [334, 9.5], [366, 9]].map(([s, off], i) => ['aspen', ...W(s, T0, off), 0, { s: 1.0 + (i % 3) * 0.12, seed: i + 1 }]),
    ...[[8, 11], [168, 10.5], [340, 11]].map(([s, off], i) => ['elm', ...W(s, T0, off), 0, { s: 1.0, seed: 70 + i }]),
    ['pelican', 60, 12, 120, 0, { fly: 40, seed: 1, speed: 0.2 }], ['pelican', -60, 18, 150, 0, { fly: 30, seed: 3, speed: 0.26 }],
    ['cloud', -120, 90, 180, 0, { s: 1.8, seed: 1 }], ['cloud', 80, 110, 240, 0, { s: 2.2, seed: 2 }], ['cloud', 260, 100, 40, 0, { s: 2.0, seed: 3 }],
    ['cloud', -240, 105, 60, 0, { s: 2.1, seed: 6 }], ['cloud', 140, 95, 120, 0, { s: 1.7, seed: 4 }],
  ],

  // ===================================================================== collectibles
  candles: [
    ...row(6, 28, 6, T0 + 0.4), ...row(34, 62, 6, T0 + 0.4),
    ...TRAIN.map((c) => W(c.a + 63.8 / 2 - 4 + 3 * TRAIN.indexOf(c), 1.5)),
    ...row(152, 180, 6, T0 + 0.4),
    ...[188, 191, 194].map((s) => W(s, 2.5 * (s - 186) / 10 + 0.9)), ...row(198, 213, 4, WHEEL.low + 0.4),
    W(222, 5.5), W(231, 7.0),
    ...row(231, 240, 3, WHEEL.low + 0.4), ...[245, 249].map((s) => W(s, 2.5 * (254 - s) / 12 + 0.9)),
    W(257, 1.4), W(260, 1.8), ...row(264, 320, 12, DECK + 0.4), W(280, 5), W(292, 5), W(304, 5),
    ...row(324, 342, 4, T0 + 0.4), ...row(350, 372, 5, T0 + 0.4),
  ],
  goldenCandles: [
    { pos: W(110, 5.0), name: 'THE LITTLE TRAIN' },
    { pos: W(WHEEL.s, WHEEL.y + WHEEL.r + 2.4), name: 'TOP OF THE WHEEL' },
    { pos: W(292, DECK + 6.6), name: 'UNDER THE CAROUSEL ROOF' },
  ],
  boxes: [
    { kind: 'prize', pos: W(22, T0 + 3.6), candles: 5 },
    { kind: 'prize', pos: W(48, T0 + 3.6), item: 'umbrella' },
    { kind: 'prize', pos: W(168, T0 + 3.6), item: 'heart' },
    { kind: 'prize', pos: W(204, WHEEL.low + 3.6), candles: 5 },
    { kind: 'prize', pos: W(236, WHEEL.low + 3.6), item: 'cake' },
    { kind: 'prize', pos: W(338, T0 + 3.6), item: 'heart' },
    // Big Bro Shad's crates: stuck in the way until Kinan kicks them (they cannot be lifted)
    { kind: 'crate', pos: W(178, T0), candles: 3, fixed: true },
    { kind: 'crate', pos: W(178, T0 + 1.8), candles: 3, fixed: true },
  ],

  // ===================================================================== foes (gentle: they only wander), pets, movers, the checkpoint
  enemies: [
    { type: 'sock', tier: 'dumb', pos: W(30, T0), patrol: [XZ(18), XZ(40)] },
    { type: 'brick', tier: 'dumb', pos: W(166, T0), patrol: [XZ(156), XZ(172)] },
    { type: 'sock', tier: 'dumb', pos: W(235, WHEEL.low), patrol: [XZ(231), XZ(240)], color: '#d6f5ff' },
    { type: 'brick', tier: 'dumb', pos: W(334, T0), patrol: [XZ(326), XZ(342)], color: '#3f8fe8' },
  ],
  pets: [{ type: 'cat' }, { type: 'dog' }],
  movers: [
    // the little train: three cars that shuttle across the pond together (the cars are dressed in setup)
    ...TRAIN.map((c) => ({ type: 'lift', from: W(c.a, T0), to: W(c.z, T0), size: [5, 1.2, 3], period: 18, pause: 2, color: c.color, studs: false })),
    // the carousel horses: they bob up and down, one after the other
    ...HORSES.map((h) => ({ type: 'lift', from: W(h.s, DECK + 1.0), to: W(h.s, DECK + 2.4), size: [3.4, 0.6, 2.2], period: 5.6, pause: 0.2, phase: h.ph, color: '#ffffff', studs: false })),
  ],
  checkpoints: [
    { pos: W(156, T0), yaw: FWD },
  ],
  hints: [
    { pos: W(10, T0), r: 5, text: 'Mom: Kinsmen Park! I brought you here every summer, Kinan. Go on, ride everything!' },
    { pos: W(24, T0), r: 4, text: 'A friendly sock. Jump on its head or press ACTION to KICK it away. Nobody gets hurt!' },
    { pos: W(66, T0), r: 3, text: 'The little train! Wait for it at the station, then hop on and hop from car to car. The pond is deep!' },
    { pos: W(152, T0), r: 3, text: 'Whoo-whoo! You made it across the pond.' },
    { pos: W(172, T0), r: 6, text: 'Crates in the way! Stand next to them and press ACTION to KICK them. Black belt style!' },
    { pos: W(190, T0), r: 3, text: 'The Ferris wheel! Wait for a seat to come down, hop on and ride up for the golden candle. Hop off on the far side.' },
    { pos: W(256, T0), r: 3, text: 'Big Sis Chenoa: The carousel! Hop on the horses, they bob up and down. The golden candle is under the roof!' },
    { pos: W(330, T0), r: 5, text: 'GRANDPA: In my day the carousel horses were real. ...No they were not, kid.' },
  ],
  goal: { pos: W(GOAL_S, T0), r: 2.6, yaw: 0, ring: 3, ringY: 3.6 },

  // ===================================================================== a level's own moving parts and rules
  setup(game) {
    // gentle: nothing here hurts Kinan; a KICK sends a nearby foe off (the stomp is the game's own)
    game.player.hurt = () => false;
    game.onKick = (foot) => {
      for (const e of game.entities.enemies) if (e.alive && Math.hypot(e.pos.x - foot.x, e.pos.z - foot.z) < 1.9 && Math.abs(e.pos.y + 1 - foot.y) < 2.2) game.entities.hitEnemy(e, 'rush');
    };
    const lifts = game.entities.movers.filter((m) => m.kind === 'lift');
    const wheelOf = (g, x, y, z, r, h, color) => { const w = dCyl(g, 0, 0, 0, r, h, color, { seg: 12 }); w.rotation.x = Math.PI / 2; w.position.set(x, y, z); return w; };

    // ---------- the little train: a flat car, a coal car, an engine with a boiler and a chimney
    const cars = lifts.slice(0, TRAIN.length);
    cars.forEach((m, i) => {
      for (const c of m.g.children) c.visible = false;
      dBox(m.g, 0, -1.2, 0, 5, 1.2, 2.8, TRAIN[i].color, { r: 0.25 });
      dBox(m.g, 0, -0.12, 0, 5.1, 0.12, 2.9, '#f7f3ea', { r: 0.04 });
      for (const sx of [-1.6, 1.6]) for (const sz of [-1.45, 1.45]) wheelOf(m.g, sx, -1.15, sz, 0.55, 0.3, '#2a2a33');
      if (i === cars.length - 1) {   // the engine: the boiler and chimney sit behind Kinan's line
        const boiler = dCyl(m.g, 0, 0, 0, 0.8, 3.6, '#2b3a7a', { seg: 14 }); boiler.rotation.z = Math.PI / 2; boiler.position.set(-0.4, 0.8, 1.15);
        dCyl(m.g, -1.7, 0.8, 1.15, 0.34, 1.5, '#2a2a33', { seg: 10 });
        dSphere(m.g, -2.2, 0.8, 1.15, 0.32, '#fff6b0', { seg: 8 });
        dBox(m.g, 1.6, 0, 1.3, 1.1, 2.2, 0.12, '#e8473c', { r: 0.05 });
        m.chimney = new THREE.Vector3(-1.7, 2.4, 1.15);
      } else {
        dBox(m.g, 0, 0, 1.4, 5, 0.9, 0.12, TRAIN[i].color, { r: 0.05 });
        dSphere(m.g, 0.4, 0.4, 0.9, 0.5, i ? '#3f3a36' : '#ffd23f', { s: [1.6, 0.8, 1], seg: 10 });
      }
    });
    const loco = cars[cars.length - 1]; let puff = 0;
    game.onUpdate((t, dt) => {
      puff -= dt; if (puff > 0 || !loco) return; puff = 0.3;
      const p = loco.chimney.clone().add(loco.g.position);
      game.particles.emit(p.x, p.y, p.z, (Math.random() - 0.5), 2.5, (Math.random() - 0.5), '#ffffff', 0.9, 1.2, -0.5, 1);
    });

    // ---------- the carousel horses: a horse whose back is the platform, with its brass pole up to the roof
    const horseCols = ['#ffffff', '#ff8fb8', '#7ee8ff', '#ffd23f'];
    const poles = [];
    lifts.slice(TRAIN.length, TRAIN.length + HORSES.length).forEach((m, i) => {
      for (const c of m.g.children) c.visible = false;
      const col = horseCols[i % horseCols.length];
      dSphere(m.g, 0, -0.5, 0, 1.0, col, { s: [1.7, 0.5, 0.8], seg: 14 });                       // the body (its top is the platform)
      dBox(m.g, -1.45, -0.3, 0, 0.6, 1.3, 0.55, col, { r: 0.2 });                                   // the neck
      dSphere(m.g, -1.85, 0.95, 0, 0.42, col, { s: [1.5, 1, 0.9], seg: 10 });                      // the head
      dBox(m.g, -1.4, 1.1, 0, 0.7, 0.18, 0.18, '#e8473c', { r: 0.05 });                            // the mane
      for (const sx of [-1.1, 1.1]) for (const sz of [-0.45, 0.45]) dBox(m.g, sx, -1.55, sz, 0.28, 1.2, 0.28, col, { r: 0.1 });
      dBox(m.g, 1.65, -0.9, 0, 0.2, 1.0, 0.3, '#e8473c', { r: 0.08 });                             // the tail
      const pole = new THREE.Group(); pole.position.set(0, -1.3, 1.0); m.g.add(pole);
      dCyl(pole, 0, 0, 0, 0.09, 10, '#ffd23f', { seg: 8 });
      poles.push([pole, m.g]);
    });
    game.onUpdate(() => { for (const [pole, g] of poles) pole.scale.y = Math.max(0.05, (ROOF - 0.4 - (g.position.y - 1.3)) / 10); });

    // ---------- the Ferris wheel: the spokes turn, and each seat is a moving platform that rides round the rim
    const { s: WS, y: WY, r: R, n: N, speed: OM } = WHEEL;
    const spokes = new THREE.Group(); spokes.position.set(X0 - WS, WY, Z0 + 2.4); game.scene.add(spokes);
    const arms = [];
    const seatCols = ['#e8473c', '#3f8fe8', '#ffd23f', '#5cc23a', '#ff5fa2', '#9b6cff'];
    const hub = dCyl(spokes, 0, 0, 0, 1.0, 1.0, '#ffd23f', { seg: 14 }); hub.rotation.x = Math.PI / 2; hub.position.set(0, 0, 0);
    const seats = [];
    const seatPos = (i, ang) => { const a = i / N * Math.PI * 2 + ang; return [X0 - (WS + R * Math.sin(a)), WY - R * Math.cos(a), Z0]; };
    for (let i = 0; i < N; i++) {
      const arm = new THREE.Group(); spokes.add(arm); arms.push(arm);
      dBox(arm, 0, -R, 0, 0.24, R, 0.24, '#e8473c', { r: 0.06 });
      const g = new THREE.Group();
      dBox(g, 0, -0.7, 0, 3.6, 0.7, 3.0, seatCols[i], { r: 0.2 });                                  // the seat: its top is the platform
      dBox(g, 0, 0, 1.35, 3.6, 1.7, 0.12, seatCols[i], { r: 0.05 });                                // the back of the cabin
      for (const sx of [-1.75, 1.75]) dBox(g, sx, 0, 1.2, 0.12, 1.4, 0.4, '#f7f3ea', { r: 0.04 });
      bake(g, false); game.scene.add(g);
      const [x, y, z] = seatPos(i, 0);
      const col = game.world.add({ type: 'box', moving: true, cx: x, cy: y - 0.35, cz: z, hx: 1.8, hy: 0.35, hz: 1.5, yaw: 0 });
      g.position.set(x, y, z);
      seats.push({ g, col });
    }
    let ang = 0;
    game.entities.movers.push({
      kind: 'wheel', seats,
      update(dt) {
        ang += OM * dt;
        arms.forEach((arm, i) => { arm.rotation.z = -(i / N * Math.PI * 2 + ang); });
        seats.forEach((st, i) => {
          const [x, y, z] = seatPos(i, ang);
          st.g.position.set(x, y, z);
          savePose(st.col); st.col.cx = x; st.col.cy = y - 0.35; st.col.cz = z; moved(st.col);
        });
      },
    });
  },
};

export default L;

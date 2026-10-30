// =====================================================================================
//  WORLD 12-4  ·  THE WEIR RAPIDS  ·  ROUGH DRAFT (2026-10-30, Developer mode only)
// =====================================================================================
// A short 2.5D run across the river weir: hop the stepping stones, ride the floating logs over the rushing water, cross
// the wrapped presents, then climb the fish ladder to the top of the weir. Nobody is beaten up: the four foes only wander
// and are stomped or KICKED away (they never hurt), and falling in the river only retries from the checkpoint.
// Everything is placed by s = distance along the path (0 = start, 440 = the path's end) and off = how far behind the path
// line (away from the camera; negative = toward it). The path is one straight line, heading west.
//   s   0- 52  the west bank: a sign, a wandering sock, the first presents
//   s  57- 99  five stepping stones, up and down
//   s  99-113  floating log 1 (the pier is the one checkpoint)
//   s 113-135  the middle of the weir (concrete pier): a wandering brick, a heart present
//   s 135-189  floating log 2, three stones, floating log 3
//   s 189-211  a big stone, then two wrapped presents floating on the water
//   s 214-262  the east bank: a wandering sock, Big Bro Shad's crates (KICK them)
//   s 262-328  the FISH LADDER: stairs of pools, the fish elevator, a wandering brick
//   s 331-372  the top of the weir: GRANDPA's bench, the goal
import * as THREE from 'three';
import { CITY, CITY_TEXTURES, titleCard } from '../js/props-city.js';
import { FESTIVAL } from '../js/props-festival.js';
import { dCyl, dSphere } from '../js/props.js';

const T0 = 0, WATER = -3.2, UPSTREAM = -1.0, BASE = -9, TOP = 11.2;
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
// stepping stones [s from, s to, top], the floating logs (centre s from, to, top), the fish ladder
const STONES = [[57, 62, 0.4], [66.5, 71, 1.2], [75.5, 80.5, 0.2], [85, 89.5, 1.6], [94, 99, 0.6], [149, 153.5, 1.0], [158, 162.5, 2.2], [167, 171, 1.0], [189, 195, 1.0]];
const LOGS = [[101.5, 110.5, 0.2], [137.5, 146.5, 0.4], [173.5, 186.5, 1.0]];
const STEPS = [[262, 270, 1.6], [273, 280, 3.2], [283, 290, 4.8], [300, 310, 8.4], [313, 319, 9.8], [322, 328, 11.2]];   // [from, to, top]; each has a 3 long pool in front
const ELEV = { s: 295, from: 4.8, to: 8.4 };
const GOAL_S = 352;

const L = {
  id: '12-4',
  title: 'THE WEIR RAPIDS',
  subtitle: 'hop the stones over the rushing water',
  cardText: 'Hop the stones and ride the logs across the weir!',
  clearText: 'You crossed the weir! Next stop: the Broadway Bridge!',
  intro: 'The weir! Run RIGHT and hop the stones, the logs and the presents. Then climb the fish ladder!',
  helpAfter: 5,
  assets: { kinan: '../worlds/w12_assets/kinan.glb', glitchy: '../worlds/w12_assets/glitchy.glb', pets: '../worlds/w12_assets/pet_{id}.glb' },
  props: { ...CITY, ...FESTIVAL },
  textures: CITY_TEXTURES,
  presentBoxes: true,   // wrapped birthday presents instead of "?" boxes
  killY: -6.4,
  sky: { top: '#3a86e0', mid: '#8ccaf5', horizon: '#fde8c6', fog: '#f4e4c8', fogNear: 170, fogFar: 680 },
  light: { sky: '#e8f4ff', ground: '#f4dcc0', hemi: 0.74, sun: '#fff0d0', sunI: 2.6, dir: [26, 52, -30], shadowSize: 30, env: 0.4 },
  exposure: 0.92,
  // ---- 2.5D side mode (see js/side.js)
  side: { path: PATH, dist: 17, height: 2.2, pitch: 0.15, lookAhead: 3.5, round: 9 },
  spawn: { pos: W(4, T0), yaw: FWD },
  zoneOf: () => 'o',
  camZones: [
    zoneAt(255, 372, -2, 18, { dist: 21, pitch: 0.2, height: 3.4 }),                // the fish ladder: look up to the top of the weir
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
    // the bank's ground from s0 to s1 with its top at y1
    const ground = (s0, s1, y1, color) => {
      slab(s0, s1, BASE, y1, FRONT, BACKO, color, { r: 0.05, cast: false });
      topTex('leafGrass', s0, s1, y1 + 0.012, FRONT, BACKO);
      b._wallFace('clay', s0, s1, BASE, y1, -FRONT + 0.03, 1, 6, 0);
      end(s0, BASE, y1, -1); end(s1, BASE, y1, 1);
    };
    const trail = (s0, s1, y) => topTex('trail', s0, s1, y + 0.02, -1.7, 1.7, 6);

    // ---------- the banks, the pier, the top of the weir
    ground(-14, 52, T0, '#7cbf45'); trail(-14, 52, T0);
    slab(113, 135, BASE, 0.4, FRONT, 6, '#cfc8bc', { r: 0.2 }); topTex('gravel', 113, 135, 0.412, FRONT, 6, 6);
    for (const [s0, s1] of [[113, 135]]) slab(s0, s1, 0.4, 0.9, FRONT, FRONT + 0.4, '#a9a393', { col: false, r: 0.08 });
    ground(214, 262, T0, '#86c25a'); trail(214, 262, T0);
    // the stepping stones
    for (const [s0, s1, top] of STONES) {
      slab(s0, s1, BASE, top, -2.3, 2.3, '#a7a29a', { r: 0.5 });
      slab(s0 + 0.3, s1 - 0.3, top - 0.18, top + 0.01, -2.0, 2.0, '#c9c4b8', { col: false, r: 0.15 });
    }
    // the fish ladder: stairs, each with a pool in front (a puddle of water), then the fish elevator and the top of the weir
    STEPS.forEach(([s0, s1, top], i) => {
      const low = i === 0 ? T0 : STEPS[i - 1][2], pool0 = i === 3 ? s0 - 2.5 : s0 - 3;
      slab(s0, s1, BASE, top, FRONT, BACKO, '#d8d2c4', { r: 0.2 });                                     // the step
      topTex('gravel', s0, s1, top + 0.012, FRONT, BACKO, 6);
      if (i > 0) {   // a pool in front of it: its floor is level with the step below, with a puddle of water on it
        slab(pool0, s0, BASE, low, FRONT, BACKO, '#d8d2c4', { r: 0.2 });
        topTex('gravel', pool0, s0, low + 0.012, FRONT, BACKO, 6);
        slab(pool0, s0, low + 0.02, low + 0.08, -1.9, 1.9, '#6fc4ff', { col: false, r: 0.02, mat: 'glow' });
      }
      slab(s0 - 0.12, s0 + 0.12, low + 0.06, top, -2.0, 2.0, '#eaf8ff', { col: false, r: 0.03, mat: 'glow' });   // water pouring down to it
    });
    slab(328, 376, BASE, TOP, FRONT, BACKO, '#d8d2c4', { r: 0.2 }); topTex('deck', 328, 376, TOP + 0.014, FRONT, BACKO, 4);
    for (const x of [331, 346, 361, 375]) slab(x - 0.15, x + 0.15, TOP, TOP + 1.4, FRONT + 0.2, FRONT + 0.5, '#f7f3ea', { col: false, r: 0.05 });
    slab(331, 375, TOP + 1.2, TOP + 1.45, FRONT + 0.15, FRONT + 0.55, '#f7f3ea', { col: false, r: 0.05 });

    // ---------- the water: the lower river in front, the upstream pool behind, the white-water slope of the weir between them
    b.texQuad('water', -300, -420, 800, 420, WATER, 10);
    b.texQuad('water', -300, -420, 800, -9, UPSTREAM, 10);
    b.texSlope('water', 117, 8, WATER + 0.06, 117, -9, UPSTREAM + 0.02, 252, 6);
    slab(-14, 262, WATER - 0.2, UPSTREAM + 0.4, 8.6, 10.4, '#e7e1d3', { col: false, r: 0.3 });   // the weir's concrete lip
    // lawn on the land behind the banks
    for (const [s0, s1] of [[-14, 52], [214, 262]]) { slab(s0, s1, BASE, UPSTREAM + 0.01, BACKO, 60, '#84c652', { col: false, r: 0, cast: false }); topTex('leafGrass', s0, s1, UPSTREAM + 0.02, BACKO, 60); }
    b.pop();

    // ---------- across the river: downtown and the bridges
    b.box(0, -24, 380, 1400, 34, 200, '#86c25a', { col: false, r: 0, cast: false });
    b.ramp(0, 270, WATER - 0.2, 0, 282, 10, 1400, '#d4a86a', { base: -24, col: false, cast: false });
    for (const [x, z, w, h, c] of [[-100, 340, 18, 96, '#cfd6e2'], [-40, 360, 14, 72, '#e3dcd0'], [60, 350, 16, 108, '#b8c8dc'], [110, 330, 12, 64, '#dcd2c2'], [160, 380, 20, 128, '#c4d0de'], [230, 370, 14, 84, '#e6e0d6'], [290, 330, 16, 70, '#d6dce6'], [340, 345, 16, 88, '#c4d0de'], [400, 350, 18, 80, '#e3dcd0']]) b.prop('tower', x, 10, z, 180, { w, d: w, h, color: c, spire: h > 100 });
    b.prop('archBridge', 60, WATER, 150, 90, { len: 250, arches: 8, deck: 13 });
    b.prop('trussBridge', 330, WATER, 150, 90, { len: 250, spans: 5, deck: 14 });
  },

  // ===================================================================== props (data)
  place: [
    // ---------- the west bank
    ['mapBoard', ...W(8, T0, 4), FACE, { text: 'THE WEIR|RAPIDS' }],
    ['sign', ...W(16, T0, 2.6), FACE, { text: 'STONES ->', w: 2.8, postH: 1.3 }],
    ['bench', ...W(38, T0, 3.2), FACE, {}],
    ['pelican', ...W(46, T0, 4.4), FACE, { s: 1.3, seed: 4 }],
    ['bunting', ...W(28, T0, 2.9), FACE, { len: 14 }],
    ['balloons', ...W(48, T0, 3.2), 0, { seed: 1 }],
    // ---------- the pier: a pelican watches
    ['pelican', ...W(131, 0.4, 3.6), FACE + 30, { s: 1.5, seed: 2 }],
    ['sign', ...W(116, 0.4, 2.6), FACE, { text: 'THE|WEIR', w: 2.2, postH: 1.2 }],
    // ---------- two wrapped presents floating on the water (stones to hop)
    ['present', ...W(199.5, WATER - 0.4), FACE, { w: 5, h: 3.8, d: 6, n: 0 }],
    ['present', ...W(208.5, WATER - 0.4), FACE, { w: 5, h: 3.8, d: 6, n: 3 }],
    // ---------- the east bank
    ['sign', ...W(232, T0, 2.6), FACE, { text: 'FISH|LADDER ->', w: 2.8, postH: 1.3 }],
    ['cone', ...W(246, T0, 2.6), 0, {}], ['cone', ...W(256, T0, 2.6), 0, {}],
    ['bunting', ...W(238, T0, 2.9), FACE, { len: 12 }],
    // ---------- the top of the weir
    ['bench', ...W(340, TOP, 3.4), FACE, {}],
    ['festArch', ...W(GOAL_S, TOP, 5), FACE, { text: 'WEIR CROSSED!', w: 12 }],
    ['balloons', ...W(334, TOP, 3.2), 0, { seed: 2 }], ['balloons', ...W(370, TOP, 3.2), 0, { seed: 3 }],
    // ---------- trees
    ...[[-8, 8], [14, 9], [30, 8.5], [42, 9], [220, 8], [236, 9], [252, 8.5]].map(([s, off], i) => ['aspen', ...W(s, T0, off), 0, { s: 1.0 + (i % 3) * 0.12, seed: i + 1 }]),
    ...[[6, 10], [226, 10.5]].map(([s, off], i) => ['elm', ...W(s, T0, off), 0, { s: 1.0, seed: 70 + i }]),
    ['pelican', 60, 12, 120, 0, { fly: 40, seed: 1, speed: 0.2 }], ['pelican', -60, 18, 150, 0, { fly: 30, seed: 3, speed: 0.26 }],
    ['cloud', -120, 90, 180, 0, { s: 1.8, seed: 1 }], ['cloud', 80, 110, 240, 0, { s: 2.2, seed: 2 }], ['cloud', 260, 100, 40, 0, { s: 2.0, seed: 3 }],
    ['cloud', -240, 105, 60, 0, { s: 2.1, seed: 6 }], ['cloud', 140, 95, 120, 0, { s: 1.7, seed: 4 }],
  ],

  // ===================================================================== collectibles
  candles: [
    ...row(6, 46, 9, T0 + 0.4),
    ...STONES.slice(0, 5).map(([s0, s1, top]) => W((s0 + s1) / 2, top + 1.1)),
    W(106, 1.5), ...row(116, 132, 5, 0.8),
    W(142, 1.7), ...STONES.slice(5, 8).map(([s0, s1, top]) => W((s0 + s1) / 2, top + 1.1)), W(180, 2.2),
    ...row(190.5, 193.5, 2, 1.5), W(199.5, 1.4), W(208.5, 1.4),
    ...row(216, 244, 8, T0 + 0.4),
    ...STEPS.map(([s0, s1, top]) => W((s0 + s1) / 2, top + 0.6)), W(266, 2.0), W(277, 3.6), W(286.5, 5.2),
    W(295, 7.0), W(305, 9.0), W(316, 10.4), ...row(333, 348, 5, TOP + 0.4), ...row(356, 372, 4, TOP + 0.4),
  ],
  goldenCandles: [
    { pos: W(160.2, 2.2 + 4.6), name: 'OVER THE ROARING WATER' },
    { pos: W(ELEV.s, ELEV.to + 3.6), name: 'THE FISH ELEVATOR' },
    { pos: W(360, TOP + 4.6), name: 'TOP OF THE WEIR' },
  ],
  boxes: [
    { kind: 'prize', pos: W(22, T0 + 3.6), candles: 5 },
    { kind: 'prize', pos: W(48, T0 + 3.6), item: 'umbrella' },
    { kind: 'prize', pos: W(124, 0.4 + 3.6), item: 'heart' },
    { kind: 'prize', pos: W(151.2, 1.0 + 3.6), candles: 5 },
    { kind: 'prize', pos: W(236, T0 + 3.6), item: 'cake' },
    { kind: 'prize', pos: W(277, 3.2 + 3.6), candles: 5 },
    { kind: 'prize', pos: W(340, TOP + 3.6), item: 'heart' },
    // Big Bro Shad's crates: stuck in the way until Kinan kicks them (they cannot be lifted)
    { kind: 'crate', pos: W(252, T0), candles: 3, fixed: true },
    { kind: 'crate', pos: W(252, T0 + 1.8), candles: 3, fixed: true },
  ],

  // ===================================================================== foes (gentle: they only wander), pets, movers, the checkpoint
  enemies: [
    { type: 'sock', tier: 'dumb', pos: W(30, T0), patrol: [XZ(22), XZ(44)] },
    { type: 'brick', tier: 'dumb', pos: W(124, 0.4), patrol: [XZ(118), XZ(131)] },
    { type: 'sock', tier: 'dumb', pos: W(228, T0), patrol: [XZ(220), XZ(244)], color: '#d6f5ff' },
    { type: 'brick', tier: 'dumb', pos: W(305, 8.4), patrol: [XZ(302), XZ(308)], color: '#3f8fe8' },
  ],
  pets: [{ type: 'cat' }, { type: 'dog' }],
  movers: [
    ...LOGS.map(([a, z, top], i) => ({ type: 'lift', from: W(a, top), to: W(z, top), size: [5, 1.0, 2.6], period: 6 + i, pause: 1.2, color: '#8a5a34', studs: false })),   // the floating logs
    { type: 'lift', from: W(ELEV.s, ELEV.from), to: W(ELEV.s, ELEV.to), size: [5, 0.8, 3.2], period: 6, pause: 1.2, color: '#5fc4ff' },          // the fish elevator
  ],
  checkpoints: [
    { pos: W(116, 0.4), yaw: FWD },
  ],
  hints: [
    { pos: W(10, T0), r: 5, text: 'Dad: Bud, look, the weir! The pelicans sit here all day. Run RIGHT and hop across to the other side!' },
    { pos: W(52, T0), r: 3, text: 'Stepping stones! Jump from stone to stone. Falling in only sends you back to the last checkpoint.' },
    { pos: W(98, 0.6), r: 3, text: 'A floating log! Wait for it to drift close, then hop on and ride across.' },
    { pos: W(120, 0.4), r: 5, text: 'Big Bro Shad: The weir keeps the river level. It is also great for hopping. Heart present up there!' },
    { pos: W(188, 1.0), r: 3, text: 'Big Sis Chenoa: Wrapped presents float! Hop across them, little bro. You can do it!' },
    { pos: W(244, T0), r: 6, text: 'Crates in the way! Stand next to them and press ACTION to KICK them. Black belt style!' },
    { pos: W(260, T0), r: 3, text: 'The FISH LADDER! The fish hop up it to get past the weir. So can you!' },
    { pos: W(291, 4.8), r: 3, text: 'The fish elevator! Hop on and ride up. Jump off at the top!' },
    { pos: W(336, TOP), r: 5, text: "GRANDPA: The top of the weir. In my day we swam up this. ...No we didn't." },
  ],
  goal: { pos: W(GOAL_S, TOP), r: 2.6, yaw: 0, ring: 3, ringY: 3.6 },

  // ===================================================================== a level's own moving parts
  setup(game) {
    // gentle: nothing here hurts Kinan; a KICK sends a nearby foe off (the stomp is the game's own)
    game.player.hurt = () => false;
    game.onKick = (foot) => {
      for (const e of game.entities.enemies) if (e.alive && Math.hypot(e.pos.x - foot.x, e.pos.z - foot.z) < 1.9 && Math.abs(e.pos.y + 1 - foot.y) < 2.2) game.entities.hitEnemy(e, 'rush');
    };
    // the floating logs: a round log lying along the path on top of each lift
    const lifts = game.entities.movers.filter((m) => m.kind === 'lift');
    for (const m of lifts.slice(0, LOGS.length)) {
      for (const c of m.g.children) c.visible = false;
      const r = 1.15, body = dCyl(m.g, 0, 0, 0, r, 5, '#8a5a34', { seg: 14 });
      body.rotation.z = Math.PI / 2; body.position.set(0, -r, 0);
      for (const sx of [-1, 1]) { const e = dCyl(m.g, 0, 0, 0, r * 0.82, 0.08, '#e2ae73', { seg: 14 }); e.rotation.z = Math.PI / 2; e.position.set(sx * 2.5, -r, 0); }
    }
    // the white water: foam streaks run down the slope of the weir toward the camera
    const N = 72, foam = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.05, 0.22), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8 }), N);
    foam.frustumCulled = false; game.scene.add(foam);
    const bits = Array.from({ length: N }, (_, i) => ({ s: 6 + ((i * 53) % 255) + (i % 5) * 0.7, off: -8 + ((i * 37) % 170) / 10, len: 1.4 + (i % 4) * 0.7, v: 3.2 + (i % 3) * 1.1 }));
    const dummy = new THREE.Object3D();
    game.onUpdate((t, dt) => {
      bits.forEach((f, i) => {
        f.off -= f.v * dt; if (f.off < -8) f.off += 17;
        dummy.position.set(X0 - f.s, WATER + 0.12 + (f.off + 8) / 17 * (UPSTREAM - WATER), Z0 + f.off);
        dummy.scale.set(f.len, 1, 1); dummy.updateMatrix(); foam.setMatrixAt(i, dummy.matrix);
      });
      foam.instanceMatrix.needsUpdate = true;
    });
    // three fish leap by the ladder (just for show)
    const fish = [];
    for (let i = 0; i < 3; i++) {
      const g = new THREE.Group();
      dSphere(g, 0, 0, 0, 0.45, '#ff9a3c', { s: [1.7, 0.8, 0.6], seg: 10 });
      const tail = dSphere(g, -0.85, 0, 0, 0.3, '#ff7a1c', { s: [0.6, 1.1, 0.3], seg: 8 }); tail.rotation.z = 0.4;
      game.scene.add(g); fish.push({ g, s: [150, 186, 268][i], ph: i * 2.1 });
    }
    game.onUpdate((t) => {
      for (const f of fish) {
        const k = ((t * 0.35 + f.ph) % 1), h = Math.sin(Math.min(1, k * 2.2) * Math.PI);
        f.g.visible = k < 0.45;
        f.g.position.set(X0 - f.s - k * 3, WATER + h * 3.4, Z0 - 3.2);
        f.g.rotation.z = Math.cos(Math.min(1, k * 2.2) * Math.PI) * -0.9;
        f.g.rotation.y = Math.PI;
      }
    });
  },
};

export default L;

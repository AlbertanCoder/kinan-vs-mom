// =====================================================================================
//  WORLD 12 FORT  ·  DOWNTOWN SKYLINE  ·  ROUGH DRAFT (2026-10-30, Developer mode only)
// =====================================================================================
// A short 2.5D run over the downtown rooftops, ending in a gentle "fort" challenge: no fight, just the SKYWALK, where
// three window-cleaner platforms ride up and down their ropes between the towers. Nobody is beaten up: the four foes
// only wander and are stomped or KICKED away (they never hurt), and falling to the street only retries from the checkpoint.
// Everything is placed by s = distance along the path (0 = start, 440 = the path's end) and off = how far behind the path
// line (away from the camera; negative = toward it). The path is one straight line, heading west.
//   s   0- 40  the first rooftop: a sock, air-conditioner boxes, a prize        s  44- 98  four roofs, up and down
//   s  98-118  the street canyon: a balloon raft                                  s 118-148 a long roof, a brick
//   s 152-184  three roofs, each higher                                           s 184-222 the FORT tower: the checkpoint, Big Bro Shad's crates (KICK them)
//   s 222-260  THE SKYWALK: three window-cleaner platforms and two balconies       s 260-320 the second tower: the goal, LEVEL CLEAR
import { CITY, CITY_TEXTURES, titleCard, balloonRaft } from '../js/props-city.js';
import { FESTIVAL } from '../js/props-festival.js';
import { dBox } from '../js/props.js';
import * as THREE from 'three';

const T0 = 0, STREET = -70, TOWER = 7, BEAM = 17;
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
// the rooftops [s from, s to, top, colour]
const ROOFS = [
  [-14, 40, 0, '#c9b79c'], [44, 60, 2.0, '#b9c3d6'], [64, 76, 0.5, '#d7c3a5'], [80, 98, 1.0, '#c4cfdd'],
  [118, 148, 1.0, '#d9cdb8'], [152.5, 164.5, 3.0, '#b9c3d6'], [168.5, 180, 5.0, '#d7c3a5'],
  [184, 222, TOWER, '#c4cfdd'], [260, 320, TOWER, '#d9cdb8'],
];
const LEDGES = [[232, 236], [246, 250]];                 // the skywalk's balconies, at the tower's height
const RIGS = [{ s: 227, ph: 0 }, { s: 241, ph: 2.1 }, { s: 255, ph: 4.2 }];   // the window cleaners' platforms (they ride from y 5 to y 9)
const GOAL_S = 292;

const L = {
  id: '12-fort',
  title: 'FORT: DOWNTOWN SKYLINE',
  subtitle: 'over the rooftops to the skywalk',
  cardText: 'Hop across the rooftops and cross the skywalk!',
  clearText: 'The fort is yours, Kinan! Next stop: Kinsmen Park!',
  intro: 'The downtown rooftops! Run RIGHT and hop from roof to roof. At the end: the skywalk and the window cleaners!',
  helpAfter: 5,
  assets: { kinan: '../worlds/w12_assets/kinan.glb', glitchy: '../worlds/w12_assets/glitchy.glb', pets: '../worlds/w12_assets/pet_{id}.glb' },
  props: { ...CITY, ...FESTIVAL },
  textures: CITY_TEXTURES,
  presentBoxes: true,   // wrapped birthday presents instead of "?" boxes
  killY: -18,
  sky: { top: '#3a86e0', mid: '#8ccaf5', horizon: '#fde8c6', fog: '#f4e4c8', fogNear: 170, fogFar: 680 },
  light: { sky: '#e8f4ff', ground: '#f4dcc0', hemi: 0.74, sun: '#fff0d0', sunI: 2.6, dir: [26, 52, -30], shadowSize: 30, env: 0.4 },
  exposure: 0.92,
  // ---- 2.5D side mode (see js/side.js)
  side: { path: PATH, dist: 17, height: 2.2, pitch: 0.15, lookAhead: 3.5, round: 9 },
  spawn: { pos: W(4, T0), yaw: FWD },
  zoneOf: () => 'o',
  camZones: [
    zoneAt(148, 330, -4, 26, { dist: 21, pitch: 0.18, height: 3.4 }),               // the tall roofs and the skywalk: back off and look up a little
  ],

  // ===================================================================== static scenery
  build(b) {
    titleCard(L);
    b.push(X0, 0, Z0, 180);      // from here: x = s (distance along the path), z = -off (negative = behind the path)
    // a box in path terms: s0..s1 along, y0..y1, offA..offB across (offA = the camera side)
    const slab = (s0, s1, y0, y1, offA, offB, color, o = {}) => b.box((s0 + s1) / 2, y0, -(offA + offB) / 2, s1 - s0, y1 - y0, offB - offA, color, o);
    const topTex = (tex, s0, s1, y, offA, offB, scale = 8) => b.texQuad(tex, s0, -offB, s1, -offA, y, scale);
    // a building whose flat roof is the platform: windows on its front, a low kerb on the camera side, a parapet behind
    const building = (s0, s1, top, color) => {
      slab(s0, s1, STREET, top, FRONT, BACKO, color, { r: 0.3, cast: false });
      topTex('gravel', s0, s1, top + 0.012, FRONT, BACKO, 6);
      slab(s0, s1, top, top + 0.35, FRONT, FRONT + 0.4, '#a9a393', { col: false, r: 0.08 });
      slab(s0, s1, top, top + 1.1, 11, 11.6, '#a9a393', { col: false, r: 0.08 });
      for (let y = top - 3.4; y > top - 24; y -= 3.6) slab(s0 + 0.9, s1 - 0.9, y, y + 1.9, FRONT - 0.07, FRONT + 0.02, '#8fd3ff', { col: false, r: 0.02, mat: 'gloss' });
    };
    // an air-conditioner box on the roof (a little hop), and a water tank behind
    const ac = (s, top) => { slab(s - 1.3, s + 1.3, top, top + 1.4, -1.0, 1.0, '#c9ced6', { r: 0.18 }); slab(s - 0.9, s + 0.9, top + 1.4, top + 1.5, -0.7, 0.7, '#7a8394', { col: false, r: 0.04 }); };
    const tank = (s, top, off) => { b.cyl(s, top + 2.6, -off, 1.9, 3.4, '#8a5a34', { seg: 14, col: false }); b.cone(s, top + 6, -off, 2.2, 1.8, '#5e3b20', { seg: 14, col: false }); for (const sx of [-1.2, 1.2]) b.box(s + sx, top, -off, 0.3, 2.7, 0.3, '#5e3b20', { col: false, r: 0.05 }); };

    ROOFS.forEach(([s0, s1, top, color]) => building(s0, s1, top, color));
    ac(12, 0); ac(123, 1.0); ac(218, TOWER); ac(308, TOWER);
    tank(8, 0, 7); tank(135, 1.0, 7); tank(272, TOWER, 7); tank(70, 0.5, 7);

    // ---------- the skywalk: a tower behind the balconies, the balconies, a glass roof, and the beam the cleaners hang from
    slab(222, 260, STREET, BEAM + 1, 6, 14, '#aeb9c9', { r: 0.3, cast: false });
    for (let y = BEAM - 3; y > TOWER - 24; y -= 3.6) slab(224, 258, y, y + 1.9, 5.93, 6.02, '#8fd3ff', { col: false, r: 0.02, mat: 'gloss' });
    for (const [s0, s1] of LEDGES) {
      slab(s0, s1, TOWER - 0.8, TOWER, -1.9, 6, '#d8d2c4', { r: 0.15 });
      topTex('deck', s0, s1, TOWER + 0.012, -1.9, 6, 4);
      slab(s0, s1, TOWER, TOWER + 0.35, -1.9, -1.5, '#a9a393', { col: false, r: 0.08 });
    }
    slab(222, 260, TOWER + 4.4, TOWER + 4.8, -0.2, 6, '#f7f3ea', { col: false, r: 0.08 });                      // the glass roof's frame
    slab(222, 260, TOWER + 0.4, TOWER + 4.4, 5.6, 5.8, '#d4f0ff', { col: false, mat: 'glass', r: 0.02, cast: false });   // a glass wall behind the balconies
    for (const s of [222.4, 240, 259.6]) slab(s - 0.2, s + 0.2, TOWER, TOWER + 4.8, 5.4, 5.9, '#f7f3ea', { col: false, r: 0.06 });
    slab(222, 260, BEAM, BEAM + 0.5, -0.2, 6, '#e8473c', { col: false, r: 0.1 });                                // the red beam the window cleaners' ropes hang from
    for (const s of [224, 258]) slab(s - 0.25, s + 0.25, TOWER, BEAM, 5.0, 5.6, '#e8473c', { col: false, r: 0.08 });

    // ---------- the street far below, the downtown behind
    b.texQuad('gravel', -300, -420, 800, 420, STREET, 12);
    b.pop();
    // a skyline of towers: a near row (lower than the roofs you run on, so you see the tops) and a far row (taller)
    for (const [s, off, w, h, c] of [[-10, 30, 18, 80, '#cfd6e2'], [40, 38, 14, 86, '#e3dcd0'], [90, 28, 16, 78, '#b8c8dc'], [140, 36, 14, 82, '#dcd2c2'], [200, 42, 20, 96, '#c4d0de'], [270, 30, 14, 80, '#e6e0d6'], [330, 36, 16, 84, '#d6dce6'],
      [10, 80, 22, 140, '#c4d0de'], [80, 96, 20, 170, '#b8c8dc'], [150, 84, 24, 150, '#e3dcd0'], [220, 100, 22, 180, '#cfd6e2'], [290, 90, 20, 154, '#dcd2c2'], [360, 100, 24, 168, '#c4d0de']]) {
      b.prop('tower', ...W(s, STREET, off), 180, { w, d: w, h, color: c, spire: h > 150 });
    }
    b.prop('bessborough', 340, -14, 330, 180, { s: 1.0 });
    // the balloon raft over the street canyon
    balloonRaft(b, ...W(100.5, 1.0), 3);
  },

  // ===================================================================== props (data)
  place: [
    // ---------- the first rooftop
    ['sign', ...W(14, T0, 2.6), FACE, { text: 'ROOFTOPS ->', w: 3.0, postH: 1.3 }],
    ['bench', ...W(32, T0, 3.4), FACE, {}],
    ['bunting', ...W(20, T0, 2.9), FACE, { len: 14 }],
    ['balloons', ...W(38, T0, 3.2), 0, { seed: 1 }],
    ['aspen', ...W(2, T0, 8), 0, { s: 0.5, seed: 3 }], ['aspen', ...W(28, T0, 9), 0, { s: 0.45, seed: 4 }],
    // ---------- along the roofs
    ['cone', ...W(52, 2.0, 2.6), 0, {}], ['cone', ...W(90, 1.0, 2.6), 0, {}],
    ['sign', ...W(96, 1.0, 2.6), FACE, { text: 'RAFT ->', w: 2.4, postH: 1.3 }],
    ['balloons', ...W(125, 1.0, 3.2), 0, { seed: 2 }],
    ['bench', ...W(142, 1.0, 3.4), FACE, {}],
    ['aspen', ...W(122, 1.0, 9), 0, { s: 0.45, seed: 5 }],
    // ---------- the fort tower and the skywalk
    ['festArch', ...W(190, TOWER, 3.4), FACE, { text: 'THE FORT', w: 9 }],
    ['sign', ...W(216, TOWER, 2.6), FACE, { text: 'WINDOW|CLEANERS', w: 3.0, postH: 1.3 }],
    // ---------- the second tower
    ['festArch', ...W(GOAL_S, TOWER, 5), FACE, { text: 'THE FORT IS YOURS!', w: 14 }],
    ['balloons', ...W(268, TOWER, 3.2), 0, { seed: 3 }], ['balloons', ...W(314, TOWER, 3.2), 0, { seed: 4 }],
    ['bench', ...W(280, TOWER, 3.4), FACE, {}],
    ['pelican', 60, 22, 140, 0, { fly: 40, seed: 1, speed: 0.2 }], ['pelican', -20, 30, 170, 0, { fly: 30, seed: 3, speed: 0.26 }],
    ['cloud', -120, 90, 180, 0, { s: 1.8, seed: 1 }], ['cloud', 80, 110, 240, 0, { s: 2.2, seed: 2 }], ['cloud', 260, 100, 40, 0, { s: 2.0, seed: 3 }],
    ['cloud', -240, 105, 60, 0, { s: 2.1, seed: 6 }], ['cloud', 140, 95, 120, 0, { s: 1.7, seed: 4 }],
  ],

  // ===================================================================== collectibles
  candles: [
    ...row(2, 18, 5, T0 + 0.4), ...row(26, 38, 3, T0 + 0.4),
    W(42, 2.6), ...row(46, 58, 3, 2.4), W(62, 3.0), ...row(66, 74, 2, 0.9), W(78, 2.4), ...row(82, 96, 4, 1.4),
    W(108, 3.0), W(116, 2.4), ...row(120, 146, 6, 1.4),
    W(150, 4.4), ...row(154, 163, 2, 3.4), W(166.5, 5.6), ...row(170, 178, 2, 5.4), W(182, 7.6), ...row(186, 220, 8, TOWER + 0.4),
    W(227, 6.4), ...LEDGES.map(([a, z]) => W((a + z) / 2, TOWER + 0.5)), W(241, 6.4), W(255, 6.4),
    ...row(264, 288, 6, TOWER + 0.4), ...row(296, 316, 5, TOWER + 0.4),
  ],
  goldenCandles: [
    { pos: W(108, 1 + 5), name: 'ABOVE THE STREET' },
    { pos: W(241, 9 + 5.2), name: 'THE WINDOW CLEANERS' },
    { pos: W(300, TOWER + 4.6), name: 'ON TOP OF THE FORT' },
  ],
  boxes: [
    { kind: 'prize', pos: W(22, T0 + 3.6), candles: 5 },
    { kind: 'prize', pos: W(52, 2.0 + 3.6), item: 'umbrella' },
    { kind: 'prize', pos: W(90, 1.0 + 3.6), item: 'heart' },
    { kind: 'prize', pos: W(132, 1.0 + 3.6), candles: 5 },
    { kind: 'prize', pos: W(205, TOWER + 3.6), item: 'cake' },
    { kind: 'prize', pos: W(284, TOWER + 3.6), item: 'heart' },
    // Big Bro Shad's crates: stuck in the way until Kinan kicks them (they cannot be lifted)
    { kind: 'crate', pos: W(214, TOWER), candles: 3, fixed: true },
    { kind: 'crate', pos: W(214, TOWER + 1.8), candles: 3, fixed: true },
  ],

  // ===================================================================== foes (gentle: they only wander), pets, movers, the checkpoint
  enemies: [
    { type: 'sock', tier: 'dumb', pos: W(28, T0), patrol: [XZ(20), XZ(36)] },
    { type: 'brick', tier: 'dumb', pos: W(134, 1.0), patrol: [XZ(128), XZ(144)] },
    { type: 'sock', tier: 'dumb', pos: W(198, TOWER), patrol: [XZ(192), XZ(208)], color: '#d6f5ff' },
    { type: 'brick', tier: 'dumb', pos: W(285, TOWER), patrol: [XZ(274), XZ(296)], color: '#3f8fe8' },
  ],
  pets: [{ type: 'cat' }, { type: 'dog' }],
  movers: [
    { type: 'lift', from: W(100.5, 1.0), to: W(115.5, 1.0), size: [5, 0.8, 4.2], period: 6, pause: 1, color: '#ffd23f', studs: false },       // the balloon raft
    // the window cleaners' platforms: they ride up and down their ropes (they pass the balconies' height every few seconds)
    ...RIGS.map((r) => ({ type: 'lift', from: W(r.s, 5), to: W(r.s, 9), size: [5, 0.7, 3.2], period: 4, pause: 0.6, phase: r.ph, color: '#ffd23f' })),
  ],
  checkpoints: [
    { pos: W(188, TOWER), yaw: FWD },
  ],
  hints: [
    { pos: W(8, T0), r: 5, text: 'Dad: Bud, look at that skyline! You can run right across the rooftops. Go on, I will wait down here.' },
    { pos: W(42, T0), r: 3, text: 'Rooftops! Jump the gaps. If you fall to the street you only go back to the start.' },
    { pos: W(98, 1.0), r: 4, text: 'A balloon raft across the street! Hop on and ride.' },
    { pos: W(20, T0), r: 4, text: 'A friendly sock. Jump on its head or press ACTION to KICK it away. Nobody gets hurt!' },
    { pos: W(188, TOWER), r: 5, text: 'Annie: Chalo, Kinan! (Let us go!) The fort is this tower. A skywalk and window cleaners, no fighting!' },
    { pos: W(208, TOWER), r: 6, text: 'Big Bro Shad: Crates in the way, bud! Press ACTION to KICK them. Black belt style!' },
    { pos: W(222, TOWER), r: 3, text: 'The window cleaners ride up and down on their ropes. Hop on when one is level with you!' },
    { pos: W(262, TOWER), r: 4, text: 'GRANDPA: You crossed the skywalk! In my day the elevator was broken. ...It still is.' },
  ],
  goal: { pos: W(GOAL_S, TOWER), r: 2.6, yaw: 0, ring: 3, ringY: 3.6 },

  // ===================================================================== a level's own moving parts and rules
  setup(game) {
    // gentle: nothing here hurts Kinan; a KICK sends a nearby foe off (the stomp is the game's own)
    game.player.hurt = () => false;
    game.onKick = (foot) => {
      for (const e of game.entities.enemies) if (e.alive && Math.hypot(e.pos.x - foot.x, e.pos.z - foot.z) < 1.9 && Math.abs(e.pos.y + 1 - foot.y) < 2.2) game.entities.hitEnemy(e, 'rush');
    };
    // the window cleaners' platforms: a back rail, two ropes that always reach up to the red beam
    const rigs = game.entities.movers.filter((m) => m.kind === 'lift').slice(1);
    const ropes = [];
    rigs.forEach((m) => {
      dBox(m.g, 0, 0.05, 1.45, 5, 1.3, 0.12, '#e8473c', { r: 0.05 });
      for (const sx of [-1, 1]) dBox(m.g, sx * 2.4, 0.05, 1.3, 0.14, 1.3, 0.14, '#e8473c', { r: 0.05 });
      for (const sx of [-2.2, 2.2]) {
        const rope = new THREE.Group(); rope.position.set(sx, 0, 1.4); m.g.add(rope);
        dBox(rope, 0, 0, 0, 0.08, 10, 0.08, '#3a3f4a', { r: 0.02 });
        ropes.push([rope, m.g]);
      }
    });
    game.onUpdate(() => { for (const [rope, g] of ropes) rope.scale.y = Math.max(0.05, (BEAM - g.position.y) / 10); });
  },
};

export default L;

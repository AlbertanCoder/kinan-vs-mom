// =====================================================================================
//  WORLD 12-8  ·  THE ARENA  ·  ROUGH DRAFT (2026-10-30, Developer mode only)
// =====================================================================================
// A short 2.5D run on game night: the parking lot under a big round arena, the concourse with its snack stands, up the
// stands (the seats are the stairs), along the top walkway under the scoreboard (a gap crossed on the light rig's lift),
// down the other stands and across the floor to the players' tunnel. The last World 12 level before the festival.
// Nobody is beaten up: the four foes only wander and are stomped or KICKED away (they never hurt), and falling into the
// walkway's gap only retries from the checkpoint.
// Everything is placed by s = distance along the path (0 = start, 460 = the path's end) and off = how far behind the path
// line (away from the camera; negative = toward it). The path is one straight line, heading west.
//   s   0- 70  the parking lot: lamps, a sock, the banner arch      s  70-150 the CONCOURSE: three snack stands, a sock
//   s 150-215  UP THE STANDS (stairs, the checkpoint at s 150)       s 215-252 the top walkway under the SCOREBOARD (a brick)
//   s 252-270  the gap: the light rig's lift (the golden candle)     s 270-335 DOWN THE STANDS
//   s 335-460  the arena floor: centre ice (a golden candle), a sock, the goal and LEVEL CLEAR
import { CITY, CITY_TEXTURES, titleCard } from '../js/props-city.js';
import { FESTIVAL } from '../js/props-festival.js';

const T0 = 0, TOP = 12, BASE = -12;
const X0 = 380, Z0 = -40;
const PATH = [[X0, Z0], [X0 - 460, Z0]];
// world [x, y, z] at distance s along the path, `off` behind the path line
const W = (s, y = 0, off = 0) => [X0 - s, y, Z0 + off];
const XZ = (s) => [X0 - s, Z0];
const FACE = 180, FWD = -90;                  // a prop facing the camera; Kinan facing right (forward)
const zoneAt = (s0, s1, y0, y1, o) => ({ min: [X0 - s1, y0, Z0 - 20], max: [X0 - s0, y1, Z0 + 14], ...o });
const row = (s0, s1, n, y, off = 0) => Array.from({ length: n }, (_, i) => W(s0 + (s1 - s0) * (n === 1 ? 0 : i / (n - 1)), y, off));

// the path strip: 2.5 toward the camera (a cut-away, like the 2D game), 10 behind (the seats start there)
const FRONT = -2.5, BACKO = 10;
const UP0 = 150, UP1 = 215, GAP = [252, 262], WALK1 = 270, DOWN1 = 335;
// the height of the walking surface at s (0 on the floor, TOP on the walkway), for the candles
const surf = (s) => (s < UP0 ? 0 : s <= UP1 ? TOP * (s - UP0) / (UP1 - UP0) : s <= WALK1 ? TOP : s <= DOWN1 ? TOP * (DOWN1 - s) / (DOWN1 - WALK1) : 0);
const GOAL_S = 408;
const ICE_S = 382;                                                          // centre ice: a round pedestal

const L = {
  id: '12-8',
  title: 'THE ARENA',
  subtitle: 'game night at the big round arena',
  cardText: 'Game night! Run through the concourse, up the stands and across the arena floor!',
  clearText: 'GAME ON, Kinan! Next stop: the Bessborough festival!',
  intro: 'Game night at the arena! Run RIGHT: through the concourse, up the stands, over the top and down to the floor!',
  helpAfter: 5,
  assets: { kinan: '../worlds/w12_assets/kinan.glb', glitchy: '../worlds/w12_assets/glitchy.glb', pets: '../worlds/w12_assets/pet_{id}.glb' },
  props: { ...CITY, ...FESTIVAL },
  textures: CITY_TEXTURES,
  presentBoxes: true,   // wrapped birthday presents instead of "?" boxes
  killY: -16,
  sky: { top: '#232a6b', mid: '#8a5aa8', horizon: '#ffb089', fog: '#c78fa0', fogNear: 170, fogFar: 700 },
  light: { sky: '#f0e4ff', ground: '#f4c8b0', hemi: 0.8, sun: '#fff0d8', sunI: 2.3, dir: [26, 52, -30], shadowSize: 30, env: 0.45 },
  exposure: 0.95,
  // ---- 2.5D side mode (see js/side.js)
  side: { path: PATH, dist: 17, height: 2.2, pitch: 0.15, lookAhead: 3.5, round: 9 },
  spawn: { pos: W(14, T0), yaw: FWD },
  zoneOf: () => 'o',
  camZones: [
    zoneAt(150, 335, -4, 40, { dist: 24, pitch: 0.22, height: 5 }),                 // the stands and the walkway: back off and look up
    zoneAt(335, 460, -4, 30, { dist: 22, pitch: 0.18, height: 4.4 }),               // the arena floor
  ],

  // ===================================================================== static scenery
  build(b) {
    titleCard(L);
    b.push(X0, 0, Z0, 180);      // from here: x = s (distance along the path), z = -off (negative = behind the path)
    // a box in path terms: s0..s1 along, y0..y1, offA..offB across (offA = the camera side)
    const slab = (s0, s1, y0, y1, offA, offB, color, o = {}) => b.box((s0 + s1) / 2, y0, -(offA + offB) / 2, s1 - s0, y1 - y0, offB - offA, color, o);
    const topTex = (tex, s0, s1, y, offA, offB, scale = 8) => b.texQuad(tex, s0, -offB, s1, -offA, y, scale);
    const floor = (s0, s1, y, color, tex) => { slab(s0, s1, BASE, y, FRONT, BACKO, color, { r: 0.05, cast: false }); topTex(tex, s0, s1, y + 0.012, FRONT, BACKO, 6); };
    // stairs along the path: the steps are the seats (alternating reds), solid underneath
    const stairs = (sA, yA, sB, yB, n) => {
      const zc = -(FRONT + BACKO) / 2;
      b.stairs(sA, zc, yA, sB, zc, yB, BACKO - FRONT, n, '#e8473c', { color2: '#c2362c', nose: '#ffffff', base: BASE });
    };
    const lamp = (s) => { b.cyl(s, T0, -4, 0.18, 7.5, '#3a3f4a', { col: false, seg: 10 }); b.sphere(s, 8, -4, 0.75, '#fff3b0', { col: false, mat: 'glow', seg: 10 }); };

    // ---------- the ground: the parking lot, the concourse, the stands, the walkway, the arena floor
    floor(-8, 70, T0, '#5d6270', 'asphalt');
    for (let s = 6; s < 64; s += 8) slab(s, s + 0.3, T0, T0 + 0.04, 5, 10, '#ffffff', { col: false, r: 0.01, cast: false });   // parking lines
    floor(70, UP0, T0, '#e4dfd2', 'tiles');
    stairs(UP0, T0, UP1, TOP, 20);
    floor(UP1, GAP[0], TOP, '#d9cdb8', 'deck'); floor(GAP[1], WALK1, TOP, '#d9cdb8', 'deck');
    stairs(WALK1, TOP, DOWN1, T0, 20);
    floor(DOWN1, 470, T0, '#e6f1fa', 'tiles');
    b.box(-9, T0, 0, 1, 16, 8, null, { vis: false, phys: { noLedge: true, noWallJump: true } });   // an invisible fence at the left end
    // the gap in the walkway: nothing but the back of the stands (the light rig's lift crosses it)
    slab(GAP[0], GAP[1], BASE, TOP - 3, 6, BACKO, '#8f1f2a', { col: false, r: 0.05, cast: false });

    // ---------- the concourse: a back wall with bright posters, a ceiling with lights, the gate
    slab(70, UP0, BASE, 15, 9, 9.4, '#2b2f55', { col: false, r: 0.05, cast: false });
    [[76, '#ff5fa2'], [82, '#ffd23f'], [100, '#3f8fe8'], [122, '#5cc23a'], [128, '#ff9a3c'], [138, '#9b6cff'], [144, '#e8473c']].forEach(([s, c], i) => slab(s, s + 3.4, 8.2 + (i % 2) * 1.2, 12.2 + (i % 2) * 1.2, 8.5, 8.9, c, { col: false, r: 0.05, cast: false }));
    slab(70, UP0, 14.4, 15.4, FRONT, BACKO, '#1d2140', { col: false, r: 0.1, cast: false });
    for (let s = 80; s < UP0 - 4; s += 14) slab(s, s + 6, 14.2, 14.45, -1, 5, '#fff3b0', { col: false, mat: 'glow', r: 0.05, cast: false });
    for (const s of [70, UP0]) slab(s - 0.6, s + 0.6, T0, 15, 2.8, 9.4, '#f7f3ea', { col: false, r: 0.08 });          // the gate's pillars (behind the path)
    slab(69.4, 70.6, 10, 15, FRONT, 2.8, '#e8473c', { col: false, r: 0.08 });                                         // the gate's header
    // ---------- the stands behind the path: rows of seats rising away from the camera, with a crowd, and a far wall
    const cols = ['#e8473c', '#3f8fe8', '#ffd23f', '#ffffff', '#5cc23a', '#ff5fa2'];
    for (let i = 0; i < 9; i++) slab(146, 470, BASE, 3 + i * 2.8, 10 + i * 3.4, 13.4 + i * 3.4, i % 2 ? '#2a5bd7' : '#c2362c', { col: false, r: 0.1, cast: false });
    slab(146, 470, BASE, 56, 41, 42, '#2b2f55', { col: false, r: 0.05, cast: false });
    let k = 11;
    const rnd = () => (k = (k * 16807) % 2147483647) / 2147483647;
    for (let n = 0; n < 90; n++) {
      const i = 1 + Math.floor(rnd() * 8), s = 152 + rnd() * 310, off = 11.5 + i * 3.4, y = 3 + i * 2.8, c = cols[Math.floor(rnd() * cols.length)];
      slab(s - 0.4, s + 0.4, y, y + 0.9, off - 0.4, off + 0.4, c, { col: false, r: 0.2, cast: false });
      b.sphere(s, y + 1.3, -off, 0.42, '#ffcf9f', { col: false, seg: 8 });
    }

    // ---------- the scoreboard hanging over the walkway: a big dark board with a lit face, four rods up to the roof
    slab(228, 252, 15.6, 21, 3.2, 8, '#1d2440', { col: false, r: 0.2 });
    slab(228.5, 251.5, 16.1, 20.5, 3.0, 3.25, '#0b1020', { col: false, r: 0.1 });
    b.texPanel('sign:KINAN  11|GAME NIGHT!', 240, 18.3, -3.0 + 0.05, 22, 4.2, 0);
    for (const s of [229.5, 250.5]) for (const off of [3.8, 7.4]) slab(s - 0.1, s + 0.1, 21, 44, off - 0.1, off + 0.1, '#3a3f4a', { col: false, r: 0.03 });
    for (const s of [229, 251]) slab(s - 0.5, s + 0.5, 20.6, 21.2, 3.0, 8.2, '#ffd23f', { col: false, mat: 'glow', r: 0.1 });
    // ---------- the light rig over the gap: a truss with lamps (its lift hangs under it)
    slab(GAP[0] - 2, GAP[1] + 2, 24, 24.7, 0.5, 6, '#c9ced6', { col: false, r: 0.1 });
    for (let s = GAP[0] - 1; s <= GAP[1] + 1; s += 3.5) { b.cone(s, 21.4, -3.6, 0.8, 2.6, '#fff3b0', { col: false, mat: 'glow', seg: 8, rx: 180 }); }
    for (const s of [GAP[0] - 1.5, GAP[1] + 1.5]) slab(s - 0.15, s + 0.15, 12.2, 24.7, 3.4, 3.8, '#c9ced6', { col: false, r: 0.04 });

    // ---------- centre ice: a round pedestal (golden candle over it) and a red ring on the floor
    b.cyl(ICE_S, T0, 0, 3.6, 1.6, '#7ec8ff', { col: true, seg: 24, mat: 'gloss', bevel: 0.25 });
    b.torus(ICE_S, T0 + 0.07, 0, 9, 0.16, '#e8473c', { col: false, cast: false });
    b.torus(ICE_S, T0 + 0.07, 0, 14.5, 0.16, '#3f8fe8', { col: false, cast: false });
    b.pop();

    // ---------- outside: the big round arena itself (a drum with a blue band and a flat dome) and the lamps
    for (const s of [14, 40, 62]) { b.push(X0, 0, Z0, 180); lamp(s); b.pop(); }
    const [dx, , dz] = W(130, 0, 175);
    b.cyl(dx, -12, dz, 120, 66, '#e9edf6', { col: false, seg: 48, cast: false });
    b.cyl(dx, 30, dz, 120.6, 7, '#2a5bd7', { col: false, seg: 48, cast: false });
    b.sphere(dx, 54, dz, 120, '#cfd6e2', { col: false, s: [1, 0.2, 1], seg: 32, cast: false });
    b.texQuad('asphalt', X0 - 700, Z0 - 60, X0 + 400, Z0 + 150, -0.05, 12);
  },

  // ===================================================================== props (data)
  place: [
    // ---------- the lot and the gate
    ['festArch', ...W(48, T0, 3.4), FACE, { text: 'GAME NIGHT!', w: 12 }],
    ['balloons', ...W(8, T0, 3.2), 0, { seed: 1 }], ['balloons', ...W(60, T0, 3.2), 0, { seed: 2 }],
    ['cone', ...W(28, T0, 2.6), 0, {}], ['cone', ...W(34, T0, 2.6), 0, {}],
    ['bunting', ...W(24, T0, 2.9), FACE, { len: 14 }],
    // ---------- the concourse
    ['stall', ...W(92, T0, 6.4), FACE, { text: 'SNACK|STAND', awning: '#e8473c', goods: ['#ffd23f', '#ffffff', '#ff9a3c'] }],
    ['stall', ...W(114, T0, 6.4), FACE, { text: 'POPCORN', awning: '#ffd23f', goods: ['#fff4c8', '#ffffff', '#ffd23f'] }],
    ['stall', ...W(136, T0, 6.4), FACE, { text: 'LEMONADE', awning: '#3f8fe8', goods: ['#ffe45c', '#ffffff', '#7ee8ff'] }],
    ['bench', ...W(103, T0, 3.8), FACE, {}], ['bench', ...W(125, T0, 3.8), FACE, {}],
    // ---------- the walkway and the floor
    ['sign', ...W(UP0 + 4, T0, 2.6), FACE, { text: 'TO THE|STANDS', w: 3.0, postH: 1.3 }],
    ['sign', ...W(UP1 + 2, TOP, 2.6), FACE, { text: 'MIND THE|GAP!', w: 3.0, postH: 1.3 }],
    ['festArch', ...W(GOAL_S, T0, 5), FACE, { text: 'GAME ON!', w: 14 }],
    ['balloons', ...W(396, T0, 3.2), 0, { seed: 3 }], ['balloons', ...W(430, T0, 3.2), 0, { seed: 4 }],
    ['bunting', ...W(440, T0, 2.9), FACE, { len: 14 }],
    ['cloud', -120, 90, 180, 0, { s: 1.8, seed: 1 }], ['cloud', 80, 110, 240, 0, { s: 2.2, seed: 2 }], ['cloud', 260, 100, 40, 0, { s: 2.0, seed: 3 }],
  ],

  // ===================================================================== collectibles
  candles: [
    ...row(6, 66, 10, T0 + 0.4),
    ...row(74, 148, 12, T0 + 0.4),
    ...Array.from({ length: 9 }, (_, i) => { const s = 154 + i * 6.5; return W(s, surf(s) + 1.4); }),
    ...row(218, 250, 6, TOP + 0.4), W(257, 17.4), ...row(266, 269, 2, TOP + 0.4),
    ...Array.from({ length: 9 }, (_, i) => { const s = 274 + i * 6.5; return W(s, surf(s) + 1.4); }),
    ...row(340, 376, 6, T0 + 0.4), ...row(388, 402, 3, T0 + 0.4), ...row(414, 452, 7, T0 + 0.4),
  ],
  goldenCandles: [
    { pos: W(240, TOP + 4.6), name: 'THE SCOREBOARD' },
    { pos: W(257, 20.2), name: 'THE LIGHT RIG' },
    { pos: W(ICE_S, 1.6 + 3.2), name: 'CENTRE ICE' },
  ],
  boxes: [
    { kind: 'prize', pos: W(24, T0 + 3.6), candles: 5 },
    { kind: 'prize', pos: W(104, T0 + 3.6), item: 'hat' },
    { kind: 'prize', pos: W(126, T0 + 3.6), item: 'heart' },
    { kind: 'prize', pos: W(184, surf(184) + 3.6), item: 'umbrella' },
    { kind: 'prize', pos: W(232, TOP + 3.6), item: 'cake' },
    { kind: 'prize', pos: W(304, surf(304) + 3.6), candles: 5 },
    { kind: 'prize', pos: W(364, T0 + 3.6), item: 'heart' },
  ],

  // ===================================================================== foes (gentle: they only wander), pets, movers, the checkpoint
  enemies: [
    { type: 'sock', tier: 'dumb', pos: W(42, T0), patrol: [XZ(30), XZ(56)] },
    { type: 'sock', tier: 'dumb', pos: W(120, T0), patrol: [XZ(100), XZ(128)], color: '#ffe0a8' },
    { type: 'brick', tier: 'dumb', pos: W(236, TOP), patrol: [XZ(224), XZ(248)], color: '#3f8fe8' },
    { type: 'sock', tier: 'dumb', pos: W(362, T0), patrol: [XZ(346), XZ(372)], color: '#d6f5ff' },
  ],
  pets: [{ type: 'cat' }, { type: 'dog' }],
  movers: [
    // the light rig's lift: it crosses the gap in the walkway and rises a little, so a hop onto it needs a good moment
    { type: 'lift', from: W(257, TOP + 0.2), to: W(257, TOP + 3.4), size: [4.4, 0.8, 3.4], period: 5.5, pause: 1.0, color: '#ffd23f', studs: false },
  ],
  checkpoints: [
    { pos: W(UP0, T0), yaw: FWD },
  ],
  hints: [
    { pos: W(18, T0), r: 4, text: 'Dad: Bud, game night! The whole city is here. Run RIGHT into the arena!' },
    { pos: W(36, T0), r: 3, text: 'A friendly sock. Jump on its head or press ACTION to KICK it away. Nobody gets hurt!' },
    { pos: W(100, T0), r: 5, text: 'Mom: Popcorn for the birthday boy! Go on, the game starts soon.' },
    { pos: W(UP0 + 3, T0), r: 4, text: 'Big Bro Shad: Up the stands, bud! The seats are the stairs. Keep running RIGHT!' },
    { pos: W(UP1 + 1, TOP), r: 4, text: 'Annie: Chalo, Kinan! (Let us go!) Look, the scoreboard says KINAN! Jump up for the golden candle.' },
    { pos: W(GAP[0] - 2, TOP), r: 3, text: 'A gap in the walkway! Hop on the light rig lift when it comes down. Falling only sends you back a little way.' },
    { pos: W(WALK1 + 8, surf(WALK1 + 8)), r: 4, text: 'GRANDPA: In my day the scoreboard was a man with a chalkboard. ...Go on, kid, down you go!' },
    { pos: W(374, T0), r: 5, text: 'Big Sis Chenoa: One more stop, little bro: the Bessborough festival! I painted the banners!' },
  ],
  goal: { pos: W(GOAL_S, T0), r: 2.6, yaw: 0, ring: 3, ringY: 3.6 },

  // ===================================================================== a level's own rules
  setup(game) {
    // gentle: nothing here hurts Kinan; a KICK sends a nearby foe off (the stomp is the game's own)
    game.player.hurt = () => false;
    game.onKick = (foot) => {
      for (const e of game.entities.enemies) if (e.alive && Math.hypot(e.pos.x - foot.x, e.pos.z - foot.z) < 1.9 && Math.abs(e.pos.y + 1 - foot.y) < 2.2) game.entities.hitEnemy(e, 'rush');
    };
  },
};

export default L;

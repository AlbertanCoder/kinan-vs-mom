// =====================================================================================
//  WORLD 12-5  ·  THE BROADWAY BRIDGE ARCHES  ·  ROUGH DRAFT (2026-10-30, Developer mode only)
// =====================================================================================
// A short 2.5D run along the deck of the big concrete bridge and up and over its four arches, high above the river.
// Two gaps in the deck are crossed on balloon rafts. Nobody is beaten up: the three foes only wander and are stomped or
// KICKED away (they never hurt), and falling off the bridge only retries from the checkpoint.
// Everything is placed by s = distance along the path (0 = start, 440 = the path's end) and off = how far behind the path
// line (away from the camera; negative = toward it). The path is one straight line, heading west.
//   s   0- 50  the east end of the bridge: lamps, cones, a heart present
//   s  50- 84  ARCH 1: up, over, down        s  84-100 deck: a wandering sock, the one checkpoint (s 94)
//   s 100-140  ARCH 2 (higher)               s 140-158 a gap in the deck: the balloon raft
//   s 158-180  deck: a wandering brick
//   s 180-222  ARCH 3 (the big one: golden candle on top)
//   s 222-250  deck: Big Bro Shad's crates (KICK them)    s 250-268 a gap: the second balloon raft
//   s 268-314  ARCH 4 (the highest)          s 314-375 the far end: a wandering sock, the goal
import { CITY, CITY_TEXTURES, titleCard, balloonRaft } from '../js/props-city.js';
import { FESTIVAL } from '../js/props-festival.js';

const T0 = 0, WATER = -17, RIVERBED = -24, DECK = 1.8;     // the deck is a slab DECK thick under y = 0
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
// the arches: [foot s, crown starts, crown ends, foot s (far side), crown height]
const ARCHES = [[50, 62, 72, 84, 5], [100, 115, 125, 140, 6.5], [180, 195, 207, 222, 7], [268, 286, 296, 314, 8.5]];
const DECKS = [[50, 140], [158, 250], [268, 400]];      // the road slab; the gaps are 140-158 and 250-268
const GAPS = [[140, 158], [250, 268]];
const GOAL_S = 345;
// the height of the arches' surface at s (0 on the flat deck)
const archY = (s) => {
  for (const [a, b, c, d, top] of ARCHES) {
    if (s >= a && s < b) return top * (s - a) / (b - a);
    if (s >= b && s <= c) return top;
    if (s > c && s <= d) return top * (d - s) / (d - c);
  }
  return 0;
};

const L = {
  id: '12-5',
  title: 'THE BROADWAY BRIDGE ARCHES',
  subtitle: 'up and over the big concrete arches',
  cardText: 'Run along the bridge and up and over its big arches!',
  clearText: 'Over the bridge! Next stop: the downtown rooftops!',
  intro: 'The bridge! Run RIGHT up and over the big arches. Hop the balloon rafts across the gaps!',
  helpAfter: 5,
  assets: { kinan: '../worlds/w12_assets/kinan.glb', glitchy: '../worlds/w12_assets/glitchy.glb', pets: '../worlds/w12_assets/pet_{id}.glb' },
  props: { ...CITY, ...FESTIVAL },
  textures: CITY_TEXTURES,
  presentBoxes: true,   // wrapped birthday presents instead of "?" boxes
  killY: -14,
  sky: { top: '#3a86e0', mid: '#8ccaf5', horizon: '#fde8c6', fog: '#f4e4c8', fogNear: 170, fogFar: 680 },
  light: { sky: '#e8f4ff', ground: '#f4dcc0', hemi: 0.74, sun: '#fff0d0', sunI: 2.6, dir: [26, 52, -30], shadowSize: 30, env: 0.4 },
  exposure: 0.92,
  // ---- 2.5D side mode (see js/side.js)
  side: { path: PATH, dist: 17, height: 2.2, pitch: 0.15, lookAhead: 3.5, round: 9 },
  spawn: { pos: W(4, T0), yaw: FWD },
  zoneOf: () => 'o',
  camZones: [
    zoneAt(46, 330, -6, 16, { dist: 21, pitch: 0.18, height: 3.2 }),               // the arches: back off so the crowns stay in the picture
  ],

  // ===================================================================== static scenery
  build(b) {
    titleCard(L);
    b.push(X0, 0, Z0, 180);      // from here: x = s (distance along the path), z = -off (negative = behind the path)
    // a box in path terms: s0..s1 along, y0..y1, offA..offB across (offA = the camera side)
    const slab = (s0, s1, y0, y1, offA, offB, color, o = {}) => b.box((s0 + s1) / 2, y0, -(offA + offB) / 2, s1 - s0, y1 - y0, offB - offA, color, o);
    const topTex = (tex, s0, s1, y, offA, offB, scale = 8) => b.texQuad(tex, s0, -offB, s1, -offA, y, scale);
    const CONC = '#d6d0c2', ZC = -(FRONT + BACKO) / 2, WD = BACKO - FRONT;
    // an arch's foot ramps and its crown: the ramp down to the deck is solid (to the deck's underside), the crown is a slab
    // with an opening under it, like the real arches
    const archHump = ([a, b1, c, d, top]) => {
      b.ramp(a, ZC, 0, b1, ZC, top, WD, CONC, { base: -DECK }); b.texSlope('gravel', a, ZC, 0.02, b1, ZC, top + 0.02, WD - 0.2, 6);
      b.ramp(d, ZC, 0, c, ZC, top, WD, CONC, { base: -DECK }); b.texSlope('gravel', d, ZC, 0.02, c, ZC, top + 0.02, WD - 0.2, 6);
      slab(b1 - 0.4, c + 0.4, top - DECK, top, FRONT, BACKO, CONC, { r: 0.2 }); topTex('gravel', b1, c, top + 0.012, FRONT, BACKO, 6);
      slab(b1, c, top - DECK - 0.2, top - DECK + 0.01, FRONT, FRONT + 0.5, '#a9a393', { col: false, r: 0.05 });   // the crown's lower edge, seen from the side
    };

    // ---------- the east approach and the bridge deck
    slab(-14, 50, RIVERBED, T0, FRONT, BACKO, '#86c25a', { r: 0.05, cast: false }); topTex('leafGrass', -14, 50, T0 + 0.012, FRONT, BACKO);
    b._wallFace('clay', -14, 50, RIVERBED, T0, -FRONT + 0.03, 1, 6, 0);
    topTex('trail', -14, 50, T0 + 0.02, -1.7, 1.7, 6);
    for (const [s0, s1] of DECKS) {
      slab(s0, s1, -DECK, T0, FRONT, BACKO, CONC, { r: 0.15, cast: false });
      topTex('gravel', s0, s1, T0 + 0.012, FRONT, BACKO, 6);
      for (let s = s0 + 4; s < s1 - 3; s += 8) slab(s, s + 3, T0 + 0.012, T0 + 0.03, -0.12, 0.12, '#ffd23f', { col: false, r: 0.01 });   // the centre line
      slab(s0, s1, T0, T0 + 0.35, FRONT, FRONT + 0.4, '#a9a393', { col: false, r: 0.08 });
      slab(s0, s1, T0, T0 + 1.3, 6, 6.5, '#f7f3ea', { col: false, r: 0.08 });          // the railing wall behind the road
      for (let s = s0 + 2; s < s1; s += 12) slab(s - 0.3, s + 0.3, T0, T0 + 2.0, 6, 6.8, '#f7f3ea', { col: false, r: 0.1 });
    }
    ARCHES.forEach(archHump);
    // under the bridge: piers every 36, with a concrete arch between each pair (front and back), standing in the river
    for (let s = 50; s <= 410; s += 36) slab(s - 2, s + 2, RIVERBED, -DECK, -2.0, 7.5, '#c9c2b2', { col: false, r: 0.3 });
    for (let s = 68; s <= 392; s += 36) for (const off of [-2.0, 7.5]) b.torus(s, WATER - 0.6, -off, 16.2, 1.1, CONC, { rx: 0, col: false, cast: false });

    // ---------- the river far below
    b.texQuad('water', -300, -420, 800, 420, WATER, 10);
    b.pop();

    // ---------- across the river: downtown and the other bridges
    b.box(0, -44, 380, 1400, 40, 200, '#86c25a', { col: false, r: 0, cast: false });
    b.ramp(0, 270, WATER - 0.2, 0, 282, -3.5, 1400, '#d4a86a', { base: -44, col: false, cast: false });
    b.prop('bessborough', 150, -3.5, 330, 180, { s: 1.0 });
    for (const [x, z, w, h, c] of [[-100, 340, 18, 96, '#cfd6e2'], [-40, 360, 14, 72, '#e3dcd0'], [60, 350, 16, 108, '#b8c8dc'], [260, 330, 12, 64, '#dcd2c2'], [330, 380, 20, 128, '#c4d0de'], [400, 370, 14, 84, '#e6e0d6'], [-160, 330, 16, 70, '#d6dce6'], [450, 345, 16, 88, '#c4d0de']]) b.prop('tower', x, -3.5, z, 180, { w, d: w, h, color: c, spire: h > 100 });
    b.prop('trussBridge', 330, WATER, 150, 90, { len: 250, spans: 5, deck: 14 });
    // the two balloon rafts over the gaps
    balloonRaft(b, ...W(145.5, T0), 3);
    balloonRaft(b, ...W(255.5, T0), 5);
  },

  // ===================================================================== props (data)
  place: [
    // ---------- the east end
    ['mapBoard', ...W(8, T0, 4), FACE, { text: 'BROADWAY|BRIDGE' }],
    ['cone', ...W(40, T0, 2.6), 0, {}], ['cone', ...W(44, T0, 2.6), 0, {}],
    ['bunting', ...W(26, T0, 2.9), FACE, { len: 16 }],
    ['balloons', ...W(48, T0, 3.2), 0, { seed: 1 }],
    // ---------- along the deck
    ...[16, 76, 130, 190, 236, 306, 356].map((s, i) => ['streetLamp', ...W(s, archY(s), 5.4), 0, {}]),
    ['sign', ...W(92, T0, 2.6), FACE, { text: 'ARCHES|AHEAD!', w: 2.8, postH: 1.3 }],
    ['sign', ...W(136, archY(136), 2.6), FACE, { text: 'MIND THE|GAP!', w: 2.6, postH: 1.3 }],
    ['bench', ...W(170, T0, 3.4), FACE, {}],
    ['cone', ...W(232, T0, 2.6), 0, {}], ['cone', ...W(246, T0, 2.6), 0, {}],
    ['bunting', ...W(236, T0, 2.9), FACE, { len: 14 }],
    ['sign', ...W(320, T0, 2.6), FACE, { text: 'DOWNTOWN ->', w: 3.0, postH: 1.3 }],
    ['festArch', ...W(GOAL_S, T0, 5), FACE, { text: 'OVER THE BRIDGE!', w: 13 }],
    ['balloons', ...W(334, T0, 3.2), 0, { seed: 2 }], ['balloons', ...W(366, T0, 3.2), 0, { seed: 3 }],
    // ---------- trees at the east end, birds, clouds
    ...[[-8, 8], [14, 9], [32, 8.5], [42, 9]].map(([s, off], i) => ['aspen', ...W(s, T0, off), 0, { s: 1.0 + (i % 3) * 0.12, seed: i + 1 }]),
    ['pelican', 60, 12, 120, 0, { fly: 40, seed: 1, speed: 0.2 }], ['pelican', 160, 14, 160, 0, { fly: 30, seed: 3, speed: 0.26 }], ['pelican', 290, 10, 130, 0, { fly: 36, seed: 5, speed: 0.22 }],
    ['cloud', -120, 90, 180, 0, { s: 1.8, seed: 1 }], ['cloud', 80, 110, 240, 0, { s: 2.2, seed: 2 }], ['cloud', 260, 100, 40, 0, { s: 2.0, seed: 3 }],
    ['cloud', -240, 105, 60, 0, { s: 2.1, seed: 6 }], ['cloud', 140, 95, 120, 0, { s: 1.7, seed: 4 }],
  ],

  // ===================================================================== collectibles
  candles: [
    ...row(6, 46, 8, T0 + 0.4),
    // over the arches: the candles follow the curve
    ...[54, 58, 62, 67, 72, 77, 81].map((s) => W(s, archY(s) + 0.9)),
    ...row(88, 98, 3, T0 + 0.4),
    ...[104, 109, 115, 120, 125, 130, 135].map((s) => W(s, archY(s) + 0.9)),
    W(145.5, 1.6), W(152, 2.0), ...row(160, 178, 5, T0 + 0.4),
    ...[184, 189, 195, 201, 207, 213, 218].map((s) => W(s, archY(s) + 0.9)),
    ...row(225, 248, 7, T0 + 0.4), W(255.5, 1.6), W(262, 2.0),
    ...[272, 278, 286, 291, 296, 303, 309].map((s) => W(s, archY(s) + 0.9)),
    ...row(318, 342, 7, T0 + 0.4), ...row(350, 370, 5, T0 + 0.4),
  ],
  goldenCandles: [
    { pos: W(149, 5.2), name: 'OVER THE GAP' },
    { pos: W(201, 7 + 4.6), name: 'THE BIG ARCH' },
    { pos: W(291, 8.5 + 4.6), name: 'TOP OF THE BRIDGE' },
  ],
  boxes: [
    { kind: 'prize', pos: W(30, T0 + 3.6), candles: 5 },
    { kind: 'prize', pos: W(92, T0 + 3.6), item: 'umbrella' },
    { kind: 'prize', pos: W(168, T0 + 3.6), item: 'heart' },
    { kind: 'prize', pos: W(226, T0 + 3.6), candles: 5 },
    { kind: 'prize', pos: W(322, T0 + 3.6), item: 'cake' },
    { kind: 'prize', pos: W(362, T0 + 3.6), item: 'heart' },
    // Big Bro Shad's crates: stuck in the way until Kinan kicks them (they cannot be lifted)
    { kind: 'crate', pos: W(240, T0), candles: 3, fixed: true },
    { kind: 'crate', pos: W(240, T0 + 1.8), candles: 3, fixed: true },
  ],

  // ===================================================================== foes (gentle: they only wander), pets, movers, the checkpoint
  enemies: [
    { type: 'sock', tier: 'dumb', pos: W(92, T0), patrol: [XZ(87), XZ(98)] },
    { type: 'brick', tier: 'dumb', pos: W(170, T0), patrol: [XZ(162), XZ(176)] },
    { type: 'sock', tier: 'dumb', pos: W(326, T0), patrol: [XZ(318), XZ(334)], color: '#d6f5ff' },
  ],
  pets: [{ type: 'cat' }, { type: 'dog' }],
  movers: [
    { type: 'lift', from: W(142.5, T0), to: W(155.5, T0), size: [5, 0.8, 4.2], period: 6, pause: 1, color: '#ffd23f', studs: false },       // the balloon rafts
    { type: 'lift', from: W(252.5, T0), to: W(265.5, T0), size: [5, 0.8, 4.2], period: 6, pause: 1, color: '#ff5fa2', studs: false },
  ],
  checkpoints: [
    { pos: W(94, T0), yaw: FWD },      // after the two easy arches, before the first gap: every fall below this point comes back here
  ],
  hints: [
    { pos: W(12, T0), r: 5, text: 'Annie: Chalo, Kinan! (Let us go!) That is the Broadway bridge. Run RIGHT, up and over the big arches!' },
    { pos: W(48, T0), r: 3, text: 'The first arch! Just run up one side and down the other. The whole river is under you.' },
    { pos: W(94, T0), r: 4, text: 'A friendly sock on the road. Jump on its head or press ACTION to KICK it away. Nobody gets hurt!' },
    { pos: W(138, T0), r: 3, text: 'A gap in the deck! Hop on the balloon raft. Falling only sends you back to the last checkpoint.' },
    { pos: W(166, T0), r: 4, text: 'Dad: Bud, the Broadway bridge has seven arches. I counted. Twice. Do not tell your mother.' },
    { pos: W(232, T0), r: 6, text: 'Crates in the way! Stand next to them and press ACTION to KICK them. Black belt style!' },
    { pos: W(264, T0), r: 3, text: 'Another gap! The pink raft will carry you across.' },
    { pos: W(286, 8.5), r: 5, dy: 3, text: 'Big Sis Chenoa: The top of the bridge! Best view in the whole city. Wave at the pelicans!' },
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

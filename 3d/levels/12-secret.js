// =====================================================================================
//  WORLD 12 SECRET  ·  UNDER THE RIVER  ·  ROUGH DRAFT (2026-10-30, Developer mode only)
// =====================================================================================
// A short, hidden-feeling 2.5D run through a glass tunnel under the river, lit by glowing pipes. It opens on the map once
// Kinan has walked into the glowing painting behind the start of 12-7 (the art gallery). It ends in the VAULT: a big round
// golden room with the three golden candles on pedestals. Nobody is beaten up: the three foes only wander and are stomped or
// KICKED away (they never hurt), and falling into the flooded part only retries from the checkpoint.
// Everything is placed by s = distance along the path (0 = start, 340 = the path's end) and off = how far behind the path
// line (away from the camera; negative = toward it). The path is one straight line, heading west.
//   s   0- 40  the hatch landing: the ladder up, a sign         s  40-104 the glowing pipes: three pipe hurdles, a wandering sock
//   s 104-150  the FLOODED part: hop the glowing pipes over the water (the checkpoint is at s 104)
//   s 150-212  the pump room: a hill of pillars, a piston lift, a wandering brick       s 212-232 pipe steps up to the vault
//   s 232-320  THE VAULT: three golden candles on pedestals, a sock, the goal (a ladder up to the sandbar)
import { CITY, CITY_TEXTURES, titleCard } from '../js/props-city.js';
import { FESTIVAL } from '../js/props-festival.js';

const T0 = 0, POOL = -2.2, BASE = -9, CEIL = 14, VAULT = 6, VCEIL = 24;
const X0 = 380, Z0 = -40;
const PATH = [[X0, Z0], [X0 - 340, Z0]];
// world [x, y, z] at distance s along the path, `off` behind the path line
const W = (s, y = 0, off = 0) => [X0 - s, y, Z0 + off];
const XZ = (s) => [X0 - s, Z0];
const FACE = 180, FWD = -90;                  // a prop facing the camera; Kinan facing right (forward)
const zoneAt = (s0, s1, y0, y1, o) => ({ min: [X0 - s1, y0, Z0 - 20], max: [X0 - s0, y1, Z0 + 14], ...o });
const row = (s0, s1, n, y, off = 0) => Array.from({ length: n }, (_, i) => W(s0 + (s1 - s0) * (n === 1 ? 0 : i / (n - 1)), y, off));

// the path strip: 2.5 toward the camera (a cut-away, like the 2D game), 12 behind (see 12-3-side.js)
const FRONT = -2.5, BACKO = 12;
const HURDLES = [58, 66, 74];                                               // glowing pipes across the floor (a hop each)
const BRIDGES = [[114, 0.8, '#ffd23f'], [124, 1.8, '#37e6ff'], [134, 2.8, '#ff5fa2'], [144, 1.8, '#37e6ff']];   // [s, top, colour]: pipes over the water
const HILL = [[158, 1.8], [165, 3.0], [172, 4.2], [179, 3.0], [186, 1.8], [193, 1.2]];   // pillars in the pump room [s, top]
const STEPS = [[214, 1.5], [220, 3.0], [226, 4.5]];                          // pipe steps up to the vault
const GOAL_S = 302;

const L = {
  id: '12-secret',
  title: 'SECRET: UNDER THE RIVER',
  subtitle: 'a hidden tunnel of glowing pipes',
  cardText: 'A secret tunnel under the river! Follow the glowing pipes to the golden vault!',
  clearText: 'The secret vault is yours, Kinan! Back to the map!',
  intro: 'A secret tunnel under the river! Run RIGHT and follow the glowing pipes. At the end: the golden vault!',
  helpAfter: 5,
  assets: { kinan: '../worlds/w12_assets/kinan.glb', glitchy: '../worlds/w12_assets/glitchy.glb', pets: '../worlds/w12_assets/pet_{id}.glb' },
  props: { ...CITY, ...FESTIVAL },
  textures: CITY_TEXTURES,
  presentBoxes: true,   // wrapped birthday presents instead of "?" boxes
  killY: -8,
  sky: { top: '#0b1a33', mid: '#13294d', horizon: '#1d3f6e', fog: '#0f2442', fogNear: 90, fogFar: 340 },
  light: { sky: '#cfe4ff', ground: '#6a7fa8', hemi: 0.95, sun: '#e8f0ff', sunI: 1.9, dir: [20, 50, -30], shadowSize: 30, env: 0.5 },
  exposure: 1.0,
  // ---- 2.5D side mode (see js/side.js)
  side: { path: PATH, dist: 17, height: 2.2, pitch: 0.15, lookAhead: 3.5, round: 9 },
  spawn: { pos: W(14, T0), yaw: FWD },
  zoneOf: () => 'o',
  camZones: [
    zoneAt(150, 232, -4, 18, { dist: 20, pitch: 0.17, height: 3.2 }),               // the pump room: a little further back
    zoneAt(232, 340, 0, 30, { dist: 23, pitch: 0.2, height: 4.6 }),                 // the vault: look up at the pedestals
  ],

  // ===================================================================== static scenery
  build(b) {
    titleCard(L);
    b.push(X0, 0, Z0, 180);      // from here: x = s (distance along the path), z = -off (negative = behind the path)
    // a box in path terms: s0..s1 along, y0..y1, offA..offB across (offA = the camera side)
    const slab = (s0, s1, y0, y1, offA, offB, color, o = {}) => b.box((s0 + s1) / 2, y0, -(offA + offB) / 2, s1 - s0, y1 - y0, offB - offA, color, o);
    const topTex = (tex, s0, s1, y, offA, offB, scale = 8) => b.texQuad(tex, s0, -offB, s1, -offA, y, scale);
    const floor = (s0, s1, y, color, tex) => { slab(s0, s1, BASE, y, FRONT, BACKO, color, { r: 0.05, cast: false }); topTex(tex, s0, s1, y + 0.012, FRONT, BACKO, 6); };
    // a glowing pipe running along the back wall (a rounded box), and an upright one
    const pipe = (s0, s1, y, color, th = 0.9) => slab(s0, s1, y, y + th, 7.6, 7.6 + th, color, { col: false, r: th * 0.46, mat: 'glow', cast: false });
    const riser = (s, y0, y1, color) => b.cyl(s, y0, -8.1, 0.45, y1 - y0, color, { seg: 12, mat: 'glow', cast: false });
    // a pipe you can stand on: a glowing round-edged column (feet in the water)
    const post = (s, top, w, color, base = T0) => slab(s - w / 2, s + w / 2, base, top, -1.8, 2.2, color, { r: 0.8, mat: 'glow' });

    // ---------- the floor: the landing and the glowing pipes, the flooded part, the pump room, the steps, the vault
    floor(-6, 108, T0, '#46566e', 'deck');
    floor(148, 232, T0, '#46566e', 'deck');
    floor(232, 340, VAULT, '#f2dca0', 'tiles');                          // the vault floor: a golden block
    b.texQuad('water', 108, -BACKO, 148, -FRONT, POOL, 6);              // the flooded part
    slab(108, 148, -5.5, -0.15, FRONT, FRONT + 0.1, '#7be3ff', { col: false, mat: 'glass', cast: false, r: 0.02 });
    b.box(-6.5, T0, 0, 1, 16, 8, null, { vis: false, phys: { noLedge: true, noWallJump: true } });   // an invisible fence at the left end

    // ---------- the tunnel's back wall and the ceiling (the river above: a glass roof with the water on top)
    slab(-6, 232, BASE, CEIL, 9, 9.4, '#1c3556', { col: false, r: 0.05, cast: false });
    for (let y = 2; y < CEIL; y += 3) slab(-6, 232, y, y + 0.25, 8.6, 8.9, '#2a4a70', { col: false, r: 0.05, cast: false });   // plates
    slab(-6, 232, CEIL, CEIL + 0.5, FRONT, BACKO, '#2a4a70', { col: false, r: 0.1, cast: false });
    b.texQuad('water', -6, -BACKO, 232, -FRONT, CEIL - 0.05, 12, true);
    for (let s = 10; s < 232; s += 26) slab(s - 0.4, s + 0.4, T0, CEIL, 2.8, 9, '#33527d', { col: false, r: 0.08 });   // ribs behind the path
    // the vault: taller and golden
    slab(232, 340, BASE, VCEIL, 9, 9.4, '#3b2f5c', { col: false, r: 0.05, cast: false });
    for (let y = VAULT + 2; y < VCEIL; y += 4) slab(232, 340, y, y + 0.3, 8.6, 8.9, '#f6c445', { col: false, r: 0.05, mat: 'glow', cast: false });
    slab(232, 340, VCEIL, VCEIL + 0.5, FRONT, BACKO, '#2a2540', { col: false, r: 0.1, cast: false });
    slab(231.6, 232.8, VAULT, VCEIL, 2.8, 9.4, '#2a2540', { col: false, r: 0.05 });                     // the vault's near wall, behind the path (an edge-on strip)
    b.torus(GOAL_S, VAULT + 8.5, -8.2, 5.2, 0.7, '#f6c445', { rx: 0, col: false, mat: 'glow' });           // the big round vault door, glowing gold
    b.torus(GOAL_S, VAULT + 8.5, -8.3, 3.6, 0.35, '#37e6ff', { rx: 0, col: false, mat: 'glow' });

    // ---------- glowing pipes on the walls: horizontal runs at three heights, uprights between them, and little red valve wheels
    pipe(-6, 104, 3.6, '#37e6ff'); pipe(-6, 104, 7.4, '#ffd23f'); pipe(20, 232, 11.2, '#ff5fa2');
    pipe(150, 232, 3.6, '#ffd23f'); pipe(150, 232, 7.4, '#37e6ff');
    for (const s of [16, 52, 92, 156, 200]) riser(s, T0, CEIL, '#37e6ff');
    for (const s of [34, 76, 178, 218]) riser(s, T0, CEIL, '#ff5fa2');
    for (const s of [30, 84, 170, 210]) b.torus(s, 5.2, -7.0, 0.9, 0.22, '#e8473c', { rx: 0, col: false });
    // the hatch: a ladder up the wall at the start and a glowing square at the top
    for (const dx of [-0.7, 0.7]) slab(8 + dx - 0.07, 8 + dx + 0.07, T0, CEIL - 1, 8.0, 8.2, '#c9ced6', { col: false, r: 0.03 });
    for (let y = 1; y < CEIL - 1; y += 1.2) slab(7.3, 8.7, y, y + 0.14, 8.0, 8.2, '#c9ced6', { col: false, r: 0.03 });
    slab(5, 11, CEIL - 0.5, CEIL, 5, 9, '#37e6ff', { col: false, mat: 'glow', r: 0.1 });

    // ---------- things to hop on and over
    for (const s of HURDLES) slab(s - 0.9, s + 0.9, T0, 1.4, -1.8, 2.2, '#37e6ff', { r: 0.6, mat: 'glow' });      // pipes across the floor
    for (const [s, top, color] of BRIDGES) post(s, top, 5, color, -6);                                          // pipes standing in the water
    for (const [s, top] of HILL) b.cyl(s, T0, 0, 1.2, top, '#ff9a3c', { col: true, seg: 18, mat: 'gloss', bevel: 0.2 });   // the pump room's pillars
    for (const [s, top] of STEPS) post(s, top, 4, '#ffd23f');
    // the vault's pedestals: the first, a tall tower with two steps, and a last one with a step
    slab(242.5, 245.5, VAULT, VAULT + 0.9, -1.6, 2.0, '#fff4c8', { r: 0.25, mat: 'gloss' });
    slab(254.5, 257.5, VAULT, VAULT + 1.5, -1.6, 2.0, '#fff4c8', { r: 0.25, mat: 'gloss' });
    slab(259.5, 262.5, VAULT, VAULT + 2.3, -1.6, 2.0, '#fff4c8', { r: 0.25, mat: 'gloss' });
    slab(264.5, 267.5, VAULT, VAULT + 3.0, -1.6, 2.0, '#ffd23f', { r: 0.25, mat: 'gloss' });
    slab(276.5, 279.5, VAULT, VAULT + 1.2, -1.6, 2.0, '#fff4c8', { r: 0.25, mat: 'gloss' });
    slab(282.5, 285.5, VAULT, VAULT + 2.4, -1.6, 2.0, '#ffd23f', { r: 0.25, mat: 'gloss' });
    // the ladder up to the sandbar by the goal: just to look at
    for (const dx of [-0.8, 0.8]) slab(GOAL_S + dx - 0.08, GOAL_S + dx + 0.08, VAULT, VAULT + 12, 8.0, 8.2, '#c9ced6', { col: false, r: 0.03 });
    for (let y = VAULT + 1; y < VAULT + 12; y += 1.2) slab(GOAL_S - 0.9, GOAL_S + 0.9, y, y + 0.14, 8.0, 8.2, '#c9ced6', { col: false, r: 0.03 });
    b.pop();
  },

  // ===================================================================== props (data)
  place: [
    ['sign', ...W(26, 8.6, 8.2), FACE, { text: 'UNDER THE|RIVER', w: 5, wall: true }],
    ['sign', ...W(108, T0, 2.6), FACE, { text: 'MIND THE|WATER!', w: 3.2, postH: 1.3 }],
    ['sign', ...W(240, VAULT + 7, 8.2), FACE, { text: 'THE VAULT', w: 6, wall: true }],
    ['cone', ...W(52, T0, 2.6), 0, {}], ['cone', ...W(80, T0, 2.6), 0, {}],
    ['balloons', ...W(296, VAULT, 3.4), 0, { seed: 2 }], ['balloons', ...W(310, VAULT, 3.4), 0, { seed: 4 }],
    ['bunting', ...W(272, VAULT, 2.9), FACE, { len: 14, h: 5 }],
  ],

  // ===================================================================== collectibles
  candles: [
    ...row(6, 34, 6, T0 + 0.4), ...row(40, 54, 3, T0 + 0.4), ...HURDLES.map((s) => W(s, 3.0)), ...row(80, 100, 5, T0 + 0.4), W(104, 0.4),
    ...BRIDGES.map(([s, top]) => W(s, top + 1.5)), ...row(150, 155, 2, T0 + 0.4),
    ...HILL.map(([s, top]) => W(s, top + 1.5)), W(176, 7.4), ...row(197, 210, 5, T0 + 0.4),
    ...STEPS.map(([s, top]) => W(s, top + 1.5)),
    ...row(234, 240, 2, VAULT + 0.4), ...row(248, 252, 2, VAULT + 0.4), ...row(270, 274, 2, VAULT + 0.4), ...row(288, 298, 3, VAULT + 0.4),
    ...[256, 261].map((s, i) => W(s, VAULT + 2.8 + i * 0.8)), W(281, VAULT + 2.6),
  ],
  goldenCandles: [
    { pos: W(244, VAULT + 2.5), name: 'THE FIRST PEDESTAL' },
    { pos: W(266, VAULT + 4.6), name: 'THE TALL PEDESTAL' },
    { pos: W(284, VAULT + 4.0), name: 'THE LAST PEDESTAL' },
  ],
  boxes: [
    { kind: 'prize', pos: W(20, T0 + 3.6), candles: 5 },
    { kind: 'prize', pos: W(92, T0 + 3.6), item: 'hat' },
    { kind: 'prize', pos: W(152, T0 + 3.6), item: 'heart' },
    { kind: 'prize', pos: W(204, T0 + 3.6), item: 'umbrella' },
    { kind: 'prize', pos: W(272, VAULT + 3.6), item: 'cake' },
  ],

  // ===================================================================== foes (gentle: they only wander), pets, movers, the checkpoint
  enemies: [
    { type: 'sock', tier: 'dumb', pos: W(90, T0), patrol: [XZ(80), XZ(100)], color: '#a8d8ff' },
    { type: 'brick', tier: 'dumb', pos: W(204, T0), patrol: [XZ(198), XZ(210)], color: '#3f8fe8' },
    { type: 'sock', tier: 'dumb', pos: W(270, VAULT), patrol: [XZ(262), XZ(282)], color: '#fff4c8' },
  ],
  pets: [{ type: 'cat' }, { type: 'dog' }],
  movers: [
    // a piston lift riding high over the pillars (extra candles on the way)
    { type: 'lift', from: W(176, 5.6), to: W(176, 8.6), size: [4.2, 0.8, 3.2], period: 5, pause: 0.8, color: '#37e6ff', studs: false },
  ],
  checkpoints: [
    { pos: W(104, T0), yaw: FWD },
  ],
  hints: [
    { pos: W(16, T0), r: 4, text: 'Dad: Bud, nobody knows this tunnel is here! Follow the glowing pipes. Run RIGHT.' },
    { pos: W(56, T0), r: 3, text: 'Glowing pipes across the floor. Hop over them!' },
    { pos: W(84, T0), r: 4, text: 'A soggy sock. Jump on its head or press ACTION to KICK it away. Nobody gets hurt!' },
    { pos: W(106, T0), r: 3, text: 'The tunnel is flooded! Hop across the glowing pipes. Falling in only sends you back a little way.' },
    { pos: W(152, T0), r: 5, text: 'Big Sis Chenoa: I love the colours down here! The pillars are a hill. Hop up and over!' },
    { pos: W(214, 1.5), r: 4, text: 'Annie: Chalo, Kinan! (Let us go!) The golden vault is just up the steps!' },
    { pos: W(240, VAULT), r: 5, text: 'Three golden candles on three pedestals! Hold JUMP to go extra high.' },
    { pos: W(296, VAULT), r: 4, text: 'Mom: Is that the river over our heads? ...Do not look up! Now climb that ladder, birthday boy.' },
  ],
  goal: { pos: W(GOAL_S, VAULT), r: 2.6, yaw: 0, ring: 3, ringY: 3.6 },

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

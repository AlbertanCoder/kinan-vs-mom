// =====================================================================================
//  WORLD 12-7  ·  THE ART GALLERY  ·  ROUGH DRAFT (2026-10-30, Developer mode only)
// =====================================================================================
// A short 2.5D run through a modern riverside gallery: three big bright rooms whose walls are made of colour blocks (all
// made-up art, no real pictures or names), sculptures to hop on, a pool in the floor crossed on floating sculptures, then
// a climb up the sculptures to the roof and a long slide down the sloping roof. Nobody is beaten up: the four foes only
// wander and are stomped or KICKED away (they never hurt), and falling in the pool only retries from the checkpoint.
// A hidden glowing painting stands behind the start: run LEFT and walk into it to open the SECRET under the river.
// Everything is placed by s = distance along the path (0 = start, 440 = the path's end) and off = how far behind the path
// line (away from the camera; negative = toward it). The path is one straight line, heading west.
//   s   0- 70  the riverside plaza: the secret painting (s 7), a sock, the banner arch       s  70-140 SUNNY ROOM: the cube tower, a big ball
//   s 140-214  BLUE ROOM: the pool (s 158-196) and its floating sculptures, the checkpoint     s 214-256 GREEN ROOM: the sculpture stairs
//   s 256-318  the roof (a skylight, a wandering sock)                                          s 318-370 the SLOPING ROOF: slide!
//   s 370-440  the riverside terrace: the goal, LEVEL CLEAR
import { CITY, CITY_TEXTURES, titleCard } from '../js/props-city.js';
import { FESTIVAL } from '../js/props-festival.js';

const T0 = 0, WATER = -3.4, POOL = -2.4, BASE = -9, ROOF = 10;
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
// the three rooms [from, to, name, wall colour, colour blocks, accent]
const ROOMS = [
  [70, 140, 'SUNNY|ROOM', '#fff0dc', ['#ff5fa2', '#ffd23f', '#ff9a3c', '#e8473c', '#ffffff'], '#ff5fa2'],
  [140, 214, 'BLUE|ROOM', '#e4f1ff', ['#3f8fe8', '#7ec8ff', '#2fc4b2', '#9b6cff', '#ffffff'], '#3f8fe8'],
  [214, 256.5, 'GREEN|ROOM', '#e8f8e0', ['#5cc23a', '#b5e655', '#ffd23f', '#2fc4b2', '#ff9a3c'], '#5cc23a'],
];
const POOLS = [158, 196];                                 // the pool in the floor
const CUBES = [[84, 1.8, '#ff5fa2'], [89, 3.4, '#ffd23f'], [94, 5.0, '#3f8fe8'], [99, 3.4, '#5cc23a'], [104, 1.8, '#9b6cff']];   // the cube tower [s, top, colour]
const STAIRS = [[222, 1.8, '#ff9a3c'], [229, 3.6, '#3f8fe8'], [236, 5.4, '#ff5fa2'], [243, 7.2, '#5cc23a'], [250, 9.0, '#ffd23f']];   // sculptures up to the roof
const ROOF0 = 256.5, ROOF1 = 318, SLIDE0 = 318, SLIDE1 = 370;
const slideY = (s) => ROOF * (SLIDE1 - s) / (SLIDE1 - SLIDE0);
const GOAL_S = 398;
const PAINT_S = 7;                                        // the secret painting

const L = {
  id: '12-7',
  title: 'THE ART GALLERY',
  subtitle: 'bright rooms, sculptures and a roof slide',
  cardText: 'Run through the bright rooms, climb the sculptures and slide down the roof!',
  clearText: 'What a masterpiece, Kinan! Next stop: the arena!',
  intro: 'The art gallery! Run RIGHT through the bright rooms and hop on the sculptures. At the top: a roof slide!',
  helpAfter: 5,
  assets: { kinan: '../worlds/w12_assets/kinan.glb', glitchy: '../worlds/w12_assets/glitchy.glb', pets: '../worlds/w12_assets/pet_{id}.glb' },
  props: { ...CITY, ...FESTIVAL },
  textures: CITY_TEXTURES,
  presentBoxes: true,   // wrapped birthday presents instead of "?" boxes
  killY: -8,
  sky: { top: '#3a86e0', mid: '#8ccaf5', horizon: '#fde8c6', fog: '#f4e4c8', fogNear: 170, fogFar: 680 },
  light: { sky: '#e8f4ff', ground: '#f4dcc0', hemi: 0.78, sun: '#fff0d0', sunI: 2.5, dir: [26, 52, -30], shadowSize: 30, env: 0.4 },
  exposure: 0.92,
  // ---- 2.5D side mode (see js/side.js)
  side: { path: PATH, dist: 17, height: 2.2, pitch: 0.15, lookAhead: 3.5, round: 9 },
  spawn: { pos: W(22, T0), yaw: FWD },
  zoneOf: () => 'o',
  camZones: [
    zoneAt(70, 214, -4, 16, { dist: 19, pitch: 0.16, height: 3 }),                  // the rooms: a little further back
    zoneAt(214, 372, -4, 26, { dist: 22, pitch: 0.2, height: 4 }),                  // the stairs, the roof and the slide: look up
  ],

  // ===================================================================== static scenery
  build(b) {
    titleCard(L);
    b.push(X0, 0, Z0, 180);      // from here: x = s (distance along the path), z = -off (negative = behind the path)
    // a box in path terms: s0..s1 along, y0..y1, offA..offB across (offA = the camera side)
    const slab = (s0, s1, y0, y1, offA, offB, color, o = {}) => b.box((s0 + s1) / 2, y0, -(offA + offB) / 2, s1 - s0, y1 - y0, offB - offA, color, o);
    const topTex = (tex, s0, s1, y, offA, offB, scale = 8) => b.texQuad(tex, s0, -offB, s1, -offA, y, scale);
    const floor = (s0, s1, color, tex) => { slab(s0, s1, BASE, T0, FRONT, BACKO, color, { r: 0.05, cast: false }); topTex(tex, s0, s1, T0 + 0.012, FRONT, BACKO, 6); };
    const ramp = (sHi, yHi, sLo, yLo, color, o = {}, tex = null) => {
      const zc = -(FRONT + BACKO) / 2, w = BACKO - FRONT;
      b.ramp(sLo, zc, yLo, sHi, zc, yHi, w, color, { base: BASE, ...o });
      if (tex) b.texSlope(tex, sLo, zc, yLo + 0.02, sHi, zc, yHi + 0.02, w - 0.2, 6);
    };
    // sculptures you can stand on: columns (cubes), drums and a ball, in glossy toy colours
    const cube = (s, top, w, color, base = T0) => slab(s - w / 2, s + w / 2, base, top, -1.8, 2.2, color, { r: 0.28, mat: 'gloss' });
    const drum = (s, top, r, color, base = T0) => b.cyl(s, base, 0, r, top - base, color, { col: true, seg: 18, mat: 'gloss', bevel: 0.2 });
    // the made-up pictures: stacks of colour blocks on a room's back wall (a tiny fixed random, so it looks the same every time)
    const art = (s0, s1, pal, seed) => {
      let k = seed;
      const rnd = () => (k = (k * 16807) % 2147483647) / 2147483647;
      for (let a = s0 + 1.5; a < s1 - 6;) {
        const w = 4 + Math.floor(rnd() * 5);
        let y = 1.2 + rnd() * 1.5;
        for (let j = 0; j < 3 && y < 10; j++) {
          const h = 1.6 + rnd() * 3.4;
          slab(a, a + w, y, y + h, 8.55 - j * 0.03, 8.9, pal[Math.floor(rnd() * pal.length)], { col: false, r: 0.04, cast: false });
          y += h + 0.45;
        }
        a += w + 1.2 + rnd() * 2.5;
      }
    };

    // ---------- the floor: the plaza, the rooms (with the pool gap), the wing, the terrace
    floor(0, 70, '#cfc7b8', 'concrete');
    floor(70, POOLS[0], '#f2eee6', 'tiles');
    floor(POOLS[1], ROOF0, '#f2eee6', 'tiles');
    floor(SLIDE1, 440, '#cfc7b8', 'concrete');
    // the pool: water in the gap, a glass front, and the wall behind it going down
    b.texQuad('water', POOLS[0], -BACKO, POOLS[1], -FRONT, POOL, 6);
    slab(POOLS[0], POOLS[1], -5.5, -0.15, FRONT, FRONT + 0.1, '#bfe6ff', { col: false, mat: 'glass', cast: false, r: 0.02 });
    // the left end of the plaza: an invisible fence (the painting stands just inside)
    b.box(-1, T0, 0, 1, 14, 8, null, { vis: false, phys: { noLedge: true, noWallJump: true } });

    // ---------- the rooms: pale walls with colour-block pictures, doorways between them, a coloured band on top
    for (const [s0, s1, , wall, pal, accent] of ROOMS) {
      slab(s0, s1, BASE, 14, 9, 9.4, wall, { col: false, r: 0.05, cast: false });
      slab(s0, s1, 12.2, 14, 8.4, 9.4, accent, { col: false, r: 0.06, cast: false });
      art(s0, s1, pal, Math.round(s0) + 7);
    }
    // doorways: a pillar behind the path, a header above it (the path itself stays wide open)
    for (const [s, accent] of [[70, '#ff5fa2'], [140, '#3f8fe8'], [214, '#5cc23a']]) {
      slab(s - 0.6, s + 0.6, T0, 14, 2.8, 9.4, '#f7f3ea', { col: false, r: 0.08 });
      slab(s - 0.6, s + 0.6, 8.2, 12.2, FRONT, 2.8, accent, { col: false, r: 0.08 });
    }
    // the sculptures you can climb: the cube tower in the sunny room
    for (const [s, top, color] of CUBES) cube(s, top, 3.8, color);
    // a big ball (a toy-like round sculpture)
    b.sphere(116, 1.8, 0, 1.8, '#ffd23f', { col: true, mat: 'gloss', seg: 18 });
    // the pool's floating sculptures (their feet go down into the water): a drum, a cube, a drum
    drum(164, 0.8, 2.2, '#ff5fa2', -6); cube(180, 1.8, 3.6, '#ff9a3c', -6); drum(193.5, 0.5, 1.5, '#ffd23f', -6);
    // the stairs of sculptures up to the roof, in the green room
    for (const [s, top, color] of STAIRS) cube(s, top, 3.8, color);

    // ---------- pictures and sculptures that are just to look at (behind the path, nobody can reach them)
    b.torus(108, 6.6, -5.5, 2.4, 0.6, '#ff5fa2', { rx: 0, col: false, mat: 'gloss' });                 // an upright pink ring
    b.sphere(128, 1.4, -5.2, 1.4, '#3f8fe8', { col: false, mat: 'gloss', seg: 14 }); b.box(128, 0, -5.2, 1.6, 0.5, 1.6, '#f7f3ea', { col: false, r: 0.1 });
    b.cone(176, 0, -5.4, 1.7, 5.4, '#9b6cff', { col: false, seg: 4 });                                  // a purple pyramid on the far side of the pool
    b.box(204, 0, -5.2, 1.4, 6.2, 1.4, '#2fc4b2', { col: false, r: 0.2, mat: 'gloss' }); b.box(204, 6.2, -5.2, 2.6, 0.9, 2.6, '#ffd23f', { col: false, r: 0.2, mat: 'gloss' });
    b.sphere(232, 5.4, -6.2, 1.5, '#e8473c', { col: false, mat: 'gloss', seg: 14 });
    // the secret painting behind the start: a gold frame on an easel, glowing blue
    for (const dx of [-2.3, 2.3]) b.box(PAINT_S + dx, T0, -1.2, 0.3, 4.4, 0.3, '#8d5a33', { col: false, r: 0.08 });
    b.box(PAINT_S, 1.2, -1.2, 5.4, 4.4, 0.4, '#f6c445', { col: false, r: 0.1, mat: 'gloss' });
    b.box(PAINT_S, 1.7, -0.95, 4.4, 3.4, 0.2, '#7be3ff', { col: false, mat: 'glow', r: 0.05 });
    b.sphere(PAINT_S - 0.9, 3.4, -0.8, 0.55, '#ffffff', { col: false, mat: 'glow', seg: 8 }); b.box(PAINT_S + 0.6, 2.0, -0.82, 1.7, 0.7, 0.1, '#ff5fa2', { col: false, r: 0.04 });

    // ---------- the wing and the roof: a solid block with a window ribbon, the flat roof, the skylight
    slab(ROOF0, ROOF1, BASE, T0, FRONT, BACKO, '#f2eee6', { r: 0.05, cast: false });
    slab(ROOF0, ROOF1, T0, ROOF - 0.6, FRONT, BACKO, '#e8e2d4', { r: 0.2, cast: false });
    for (let s = ROOF0 + 3; s < ROOF1 - 6; s += 9) slab(s, s + 6, 3.2, 6.6, FRONT - 0.07, FRONT + 0.02, '#8fd3ff', { col: false, r: 0.02, mat: 'gloss' });
    slab(ROOF0, ROOF1, ROOF - 0.6, ROOF, FRONT, BACKO, '#f7f3ea', { r: 0.1, cast: false });
    slab(ROOF0, ROOF1, ROOF, ROOF + 0.35, FRONT, FRONT + 0.4, '#a9a393', { col: false, r: 0.08 });
    slab(ROOF0, ROOF1, ROOF, ROOF + 1.1, 11, 11.6, '#a9a393', { col: false, r: 0.08 });
    b.cone(288, ROOF, -4.5, 3.6, 3.4, '#bfe6ff', { seg: 4, col: false, mat: 'glass', cast: false });           // the skylight: a glass pyramid
    // the sloping roof you slide down: a solid slope with shingle rows (the slide)
    ramp(SLIDE0, ROOF, SLIDE1, T0, '#9fb4c8', { phys: { slide: true } }, 'roofRows');
    b.pop();

    // ---------- the river behind the plaza and the terrace, and downtown across it
    b.texQuad('water', X0 - 700, Z0 + 11, X0 + 400, Z0 + 110, WATER, 10);
    b.box(X0 - 150, -24, Z0 + 230, 1100, 23, 240, '#86c25a', { col: false, r: 0, cast: false });
    b.texQuad('leafGrass', X0 - 700, Z0 + 110, X0 + 400, Z0 + 350, -1 + 0.012, 8);
    for (const [s, off, w, h, c] of [[-10, 130, 18, 80, '#cfd6e2'], [50, 140, 14, 86, '#e3dcd0'], [110, 128, 16, 78, '#b8c8dc'], [170, 150, 14, 82, '#dcd2c2'], [230, 136, 20, 96, '#c4d0de'], [300, 130, 14, 80, '#e6e0d6'],
      [360, 146, 16, 84, '#d6dce6'], [420, 132, 18, 90, '#cfd6e2'], [30, 190, 22, 140, '#c4d0de'], [130, 200, 20, 170, '#b8c8dc'], [260, 190, 24, 150, '#e3dcd0'], [390, 196, 22, 160, '#dcd2c2']]) {
      b.prop('tower', ...W(s, -1, off), 180, { w, d: w, h, color: c, spire: h > 150 });
    }
  },

  // ===================================================================== props (data)
  place: [
    // ---------- the plaza
    ['festArch', ...W(40, T0, 3.4), FACE, { text: 'THE ART|GALLERY', w: 10 }],
    ['bench', ...W(14, T0, 3.4), FACE, {}], ['bench', ...W(60, T0, 3.4), FACE, {}],
    ['balloons', ...W(28, T0, 3.2), 0, { seed: 1 }], ['balloons', ...W(64, T0, 3.2), 0, { seed: 2 }],
    ['aspen', ...W(4, T0, 8), 0, { s: 0.5, seed: 3 }], ['aspen', ...W(52, T0, 9), 0, { s: 0.45, seed: 4 }],
    // ---------- the rooms' names on their walls, a sign by the pool
    ['sign', ...W(105, 8.4, 8.2), FACE, { text: 'SUNNY|ROOM', w: 5, wall: true }],
    ['sign', ...W(177, 8.4, 8.2), FACE, { text: 'BLUE|ROOM', w: 5, wall: true }],
    ['sign', ...W(235, 8.4, 8.2), FACE, { text: 'GREEN|ROOM', w: 5, wall: true }],
    ['sign', ...W(150, T0, 2.6), FACE, { text: 'MIND THE|POOL!', w: 3.2, postH: 1.3 }],
    // ---------- the terrace
    ['festArch', ...W(GOAL_S, T0, 5), FACE, { text: 'WHAT A MASTERPIECE!', w: 14 }],
    ['balloons', ...W(380, T0, 3.2), 0, { seed: 3 }], ['balloons', ...W(420, T0, 3.2), 0, { seed: 4 }],
    ['bunting', ...W(410, T0, 2.9), FACE, { len: 14 }],
    ['bench', ...W(386, T0, 3.4), FACE, {}],
    ['aspen', ...W(376, T0, 9), 0, { s: 0.5, seed: 5 }], ['aspen', ...W(432, T0, 8), 0, { s: 0.5, seed: 6 }],
    ['pelican', 60, 22, 60, 0, { fly: 40, seed: 1, speed: 0.2 }], ['pelican', -20, 30, 80, 0, { fly: 30, seed: 3, speed: 0.26 }],
    ['cloud', -120, 90, 180, 0, { s: 1.8, seed: 1 }], ['cloud', 80, 110, 240, 0, { s: 2.2, seed: 2 }], ['cloud', 260, 100, 40, 0, { s: 2.0, seed: 3 }],
    ['cloud', -240, 105, 60, 0, { s: 2.1, seed: 6 }], ['cloud', 140, 95, 120, 0, { s: 1.7, seed: 4 }],
  ],

  // ===================================================================== collectibles
  candles: [
    ...row(12, 66, 9, T0 + 0.4),
    ...row(74, 80, 2, T0 + 0.4), ...CUBES.map(([s, top]) => W(s, top + 1.3)), ...row(108, 112, 2, T0 + 0.4), W(116, 4.6), ...row(120, 136, 5, T0 + 0.4),
    ...row(144, 154, 3, T0 + 0.4), W(164, 2.2), W(172, 5.0), W(180, 3.3), W(188, 5.0), W(193.5, 1.8), ...row(198, 211, 4, T0 + 0.4),
    ...STAIRS.map(([s, top]) => W(s, top + 1.3)),
    ...row(262, 314, 9, ROOF + 0.4),
    ...Array.from({ length: 9 }, (_, i) => { const s = 324 + i * 5.2; return W(s, slideY(s) + 1.2); }),
    ...row(374, 432, 9, T0 + 0.4),
  ],
  goldenCandles: [
    { pos: W(94, 5.0 + 4.2), name: 'THE CUBE TOWER' },
    { pos: W(174, 6.8), name: 'THE FLOATING SCULPTURE' },
    { pos: W(288, ROOF + 4.8), name: 'THE SKYLIGHT' },
  ],
  boxes: [
    { kind: 'prize', pos: W(30, T0 + 3.6), candles: 5 },
    { kind: 'prize', pos: W(76, T0 + 3.6), item: 'hat' },
    { kind: 'prize', pos: W(130, T0 + 3.6), item: 'heart' },
    { kind: 'prize', pos: W(148, T0 + 3.6), candles: 5 },
    { kind: 'prize', pos: W(205, T0 + 3.6), item: 'umbrella' },
    { kind: 'prize', pos: W(272, ROOF + 3.6), item: 'cake' },
    { kind: 'prize', pos: W(410, T0 + 3.6), item: 'heart' },
  ],

  // ===================================================================== foes (gentle: they only wander), pets, movers, the checkpoint
  enemies: [
    { type: 'sock', tier: 'dumb', pos: W(48, T0), patrol: [XZ(40), XZ(60)] },
    { type: 'sock', tier: 'dumb', pos: W(128, T0), patrol: [XZ(120), XZ(136)] },
    { type: 'brick', tier: 'dumb', pos: W(205, T0), patrol: [XZ(199), XZ(211)] },
    { type: 'sock', tier: 'dumb', pos: W(290, ROOF), patrol: [XZ(274), XZ(306)], color: '#d6f5ff' },
  ],
  pets: [{ type: 'cat' }, { type: 'dog' }],
  movers: [
    // the pool: two floating sculptures that rise and sink between the stones
    { type: 'lift', from: W(172, 0.4), to: W(172, 3.4), size: [4.2, 0.8, 3.2], period: 5, pause: 0.8, color: '#3f8fe8' },
    { type: 'lift', from: W(188, 3.4), to: W(188, 0.4), size: [4.2, 0.8, 3.2], period: 5, pause: 0.8, color: '#2fc4b2' },
  ],
  checkpoints: [
    { pos: W(146, T0), yaw: FWD },
  ],
  hints: [
    { pos: W(24, T0), r: 4, text: 'Dad: Bud, a whole art gallery! Run RIGHT. Look with your eyes, and hop with your feet.' },
    { pos: W(8, T0), r: 3, text: 'A glowing painting! Hmm... it looks like you could step right into it.' },
    { pos: W(44, T0), r: 3, text: 'A friendly sock. Jump on its head or press ACTION to KICK it away. Nobody gets hurt!' },
    { pos: W(72, T0), r: 5, text: 'Big Sis Chenoa: Every picture in here is made up, just like my banners. Hop on the sculptures, they like it!' },
    { pos: W(82, T0), r: 3, text: 'The cube tower! Hop up the cubes. Hold JUMP to go extra high for the golden candle.' },
    { pos: W(150, T0), r: 4, text: 'A pool in the floor! Hop across the floating sculptures. Falling in only sends you back a little way.' },
    { pos: W(218, T0), r: 5, text: 'Annie: Chalo, Kinan! (Let us go!) Climb the sculptures all the way up to the roof!' },
    { pos: W(316, ROOF), r: 3, text: 'GRANDPA: A slide on the roof? In my day we called that a fall. ...Wheee! Go on, kid!' },
  ],
  goal: { pos: W(GOAL_S, T0), r: 2.6, yaw: 0, ring: 3, ringY: 3.6 },

  // ===================================================================== a level's own rules
  setup(game) {
    // gentle: nothing here hurts Kinan; a KICK sends a nearby foe off (the stomp is the game's own)
    game.player.hurt = () => false;
    game.onKick = (foot) => {
      for (const e of game.entities.enemies) if (e.alive && Math.hypot(e.pos.x - foot.x, e.pos.z - foot.z) < 1.9 && Math.abs(e.pos.y + 1 - foot.y) < 2.2) game.entities.hitEnemy(e, 'rush');
    };
    // the secret painting behind the start: walk into it and the SECRET under the river opens on the map
    const paint = XZ(PAINT_S);
    let opened = false;
    game.onUpdate(() => {
      const p = game.player.pos;
      if (opened || game.mode !== 'play' || Math.hypot(p.x - paint[0], p.z - paint[1]) > 2.6) return;
      opened = true;
      if (game.opts && game.opts.onUnlock) { try { game.opts.onUnlock('12-secret'); } catch (e) { console.warn('could not save the secret', e); } }
      game.sfx('secret');
      game.hud.toast('A SECRET TUNNEL OPENED UNDER THE RIVER! Look for it on the map.', 3.2);
    });
  },
};

export default L;

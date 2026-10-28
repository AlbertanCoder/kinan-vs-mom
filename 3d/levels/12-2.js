// =====================================================================================
//  WORLD 12-2  ·  NEIGHBOURHOOD ROOFTOPS  ·  "run across the roofs of his street"
// =====================================================================================
// Kinan steps out of his front door onto his own street, now in full 3D, on an October afternoon in Saskatoon.
// The party is at the Bessborough, way past the east end of the street, across the river valley.
// The quickest way there is OVER THE ROOFTOPS:
//   car / bins / ladder -> three bungalows (gutter to gutter) -> ivy trellis up the grey infill -> jump to the tall white
//   infill -> BALLOON RAFT over the flooded road work -> yellow house -> the purple Victorian -> climb the ivy on its tower
//   -> the LOOKOUT at the top (goal ring) with the whole river valley in view.
// Other routes: the street (sugar rush) and the culvert pipes across the trench, the back lane, the big elm.
// Golden candles: 0 WALL-JUMP ALLEY (between the two infills, under the awning), 1 TOP OF THE BIG ELM (branch spiral, a kite),
//                 2 BACK LANE BUTTON (push the heavy crate onto the big button: the cage lifts).
// Secrets: a hidden ? box over the leaf pile in Kinan's back yard, a SECRET STASH toy box on a garage roof (box stack),
//          a hidden heart over the culvert pipes.
// Coordinates: x = east, z = toward the street (south). Houses of Kinan's row: z -14..4 (fronts face +z).
import { subtractRects } from '../js/build.js';
import { CITY, CITY_TEXTURES, titleCard, balloonRaft } from '../js/props-city.js';

const ring = (cx, y, cz, r, n, a0 = 0) => Array.from({ length: n }, (_, i) => [cx + Math.cos(a0 + i / n * Math.PI * 2) * r, y, cz + Math.sin(a0 + i / n * Math.PI * 2) * r]);
const line = (a, b, n) => Array.from({ length: n }, (_, i) => { const t = n === 1 ? 0 : i / (n - 1); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; });

// ---------- Kinan's row (north side of the street). Front-gable roofs: slopes face east/west, flat gutter ledges along both eaves.
const HZ = -5, HD = 18;                          // house centre z and depth (fronts at z = 4)
const ROW = {
  n1: { x: -74, w: 16, h: 7, rise: 4.5 },
  n2: { x: -52, w: 18, h: 8.5, rise: 5 },
  n3: { x: -29, w: 16, h: 10, rise: 6 },
  n4: { x: -8, w: 12, h: 16, flat: true },
  n5: { x: 7.8, w: 14, h: 20, flat: true },
  n6: { x: 56, w: 16, h: 12, rise: 6 },
  n7: { x: 80, w: 20, h: 14, rise: 9 },
};
const ridgeY = (k) => ROW[k].h + ROW[k].rise;
// height of a front-gable roof at world x (on the slope; the outer 0.9 either side of a wall is the flat gutter ledge)
const roofAt = (k, x) => { const r = ROW[k], run = r.w / 2 - 0.9; return r.h + r.rise * Math.max(0, 1 - Math.abs(x - r.x) / run); };
const TR = [22, 42];                             // the flooded road-work trench (x range)
const TOWER = { x: 80, z: 4, top: 30 };          // the Victorian's lookout tower (goal on its deck)
const ELM = { x: -17.5, z: 11 };                 // the BIG ELM in front of the lavender house
// branch platforms: [yaw (0 = toward the street, 90 = east), top y, length]
const BRANCHES = [[20, 3.0, 5], [-40, 5.8, 5], [-100, 8.6, 5], [-160, 11.4, 4.6], [140, 14.2, 5.2], [80, 17.0, 5], [20, 19.8, 5], [-40, 22.6, 5]];
const tip = (yaw, top, r) => [ELM.x + Math.sin(yaw * Math.PI / 180) * r, top + 0.4, ELM.z + Math.cos(yaw * Math.PI / 180) * r];

const L = {
  id: '12-2',
  title: 'NEIGHBOURHOOD ROOFTOPS',
  subtitle: 'run across the roofs of his street',
  cardText: 'Run across the roofs of your street!',
  clearText: 'What a view! Next stop: the river valley.',
  intro: 'Your whole STREET went 3D! The party is at the Bessborough, way past the end of the street. Take the ROOFTOPS!',
  helpAfter: 5,
  assets: { kinan: '../worlds/w12_assets/kinan.glb', glitchy: '../worlds/w12_assets/glitchy.glb', pets: '../worlds/w12_assets/pet_{id}.glb' },
  props: CITY,
  textures: CITY_TEXTURES,
  killY: -4.5,                                   // only the flooded trench is deep enough to fall into
  sky: { top: '#3a86e0', mid: '#8ccaf5', horizon: '#fde8c6', fog: '#f4e4c8', fogNear: 170, fogFar: 660 },
  light: { sky: '#e8f4ff', ground: '#f4dcc0', hemi: 0.74, sun: '#fff0d0', sunI: 2.6, dir: [30, 50, 22], shadowSize: 34, env: 0.4 },
  exposure: 0.92,
  spawn: { pos: [-94, 0, 12.6], yaw: 90, camYaw: -96 },          // on the front walk, looking east down the street
  zoneOf: () => 'o',
  camDefaults: { dist: 15, pitch: 0.42, height: 1.6 },
  camZones: [
    // the wall-jump alley between the two infills: look in from the street so both walls stay in view
    { min: [-2.6, -1, -14.5], max: [1.4, 15.6, 6], dist: 11, pitch: 0.3, height: 2.2, yaw: 0 },
    // climbing the big elm: a closer, flatter camera that stays under the leaves
    { min: [ELM.x - 9, 1.5, ELM.z - 8], max: [ELM.x + 9, 30, ELM.z + 9], dist: 11.5, pitch: 0.3, height: 1.8 },
  ],

  // ===================================================================== static scenery
  build(b) {
    titleCard(L);
    const edge = { vis: false, phys: { noLedge: true, noWallJump: true } };
    // ---------- ground: one big lawn slab with the trench cut out, textured strips on top
    const hole = [[TR[0], -52, TR[1], 75]];
    b.slab(-118, -52, 118, 75, -1, 0, '#7cbf45', hole, { cam: true });
    const quad = (tex, r, y, s, holes = hole) => { for (const [x0, z0, x1, z1] of subtractRects(r, holes)) b.texQuad(tex, x0, z0, x1, z1, y, s); };
    quad('leafGrass', [-118, -52, 118, 75], 0.012, 8);
    for (const [x0, x1] of [[-118, TR[0]], [TR[1], 96]]) {
      b.texQuad('asphalt', x0, 21, x1, 35, 0.025, 14);                 // the street
      b.texQuad('path', x0, 15, x1, 18, 0.03, 3);                       // sidewalks
      b.texQuad('path', x0, 38, x1, 41, 0.03, 3);
      b.texQuad('gravel', x0, -50, x1, -40, 0.025, 6);                  // the back lane
      for (const z of [21, 35]) b.box((x0 + x1) / 2, -0.2, z, x1 - x0, 0.45, 0.5, '#dcd6c8', { col: false, r: 0.08, cast: false });
    }
    b.texQuad('asphalt', 96, -52, 110, 75, 0.025, 14);                  // the crescent along the riverbank
    b.texQuad('path', 110, -52, 112, 75, 0.03, 3);
    // front walks + driveways
    for (const [x, w] of [[-94, 2.6], [-77, 2.6], [-48, 2.6], [-32, 2.6], [-10.5, 2.6], [10.8, 2.6], [59, 2.6], [74.5, 2.6]]) b.texQuad('path', x - w / 2, 4, x + w / 2, 15, 0.028, 3);
    for (const x of [-85, 45]) b.texQuad('gravel', x - 2.6, 4, x + 2.6, 15, 0.027, 5);
    // grass beyond the playable area (visual)
    b.texQuad('leafGrass', -420, -420, 112, -52, -0.04, 8); b.texQuad('leafGrass', -420, 75, 112, 420, -0.04, 8); b.texQuad('leafGrass', -420, -52, -118, 75, -0.04, 8);
    // ---------- the flooded road work: concrete sides, muddy bottom, water (falling in = back to the checkpoint)
    for (const x of [TR[0] - 0.2, TR[1] + 0.2]) b.box(x, -6, 11.5, 0.5, 6.05, 127, '#b8bcc6', { col: false, r: 0.05, cast: false });
    b.box((TR[0] + TR[1]) / 2, -7, 11.5, TR[1] - TR[0], 0.6, 127, '#6b5a44', { col: false, r: 0, cast: false });
    b.texQuad('water', TR[0], -52, TR[1], 75, -2.2, 6);
    // ---------- invisible walls round the neighbourhood (tall: the roofs reach 30)
    b.box(-118.5, 0, 11.5, 1, 60, 130, null, edge); b.box(0, 0, -51.6, 240, 60, 1, null, edge);
    b.box(0, 0, 75.5, 240, 60, 1, null, edge); b.box(112.6, 0, 11.5, 1, 60, 130, null, edge);
    // ---------- the lookout tower on the Victorian (goal deck at TOWER.top, open on the north side where the ivy arrives)
    const T = TOWER;
    b.box(T.x, 0, T.z, 7, T.top, 7, '#f08aa8', { r: 0.2, cam: true });
    b.box(T.x, T.top - 0.5, T.z, 7.6, 0.5, 7.6, '#fff6dc', { col: false, r: 0.12 });
    b.texQuad('deck', T.x - 3.4, T.z - 3.4, T.x + 3.4, T.z + 3.4, T.top + 0.015, 4);
    for (const y of [3, 9, 15, 21, 25.5]) for (const [px, pz, yaw] of [[T.x, T.z + 3.5, 0], [T.x + 3.5, T.z, 90], [T.x - 3.5, T.z, -90]]) {
      b.push(px, 0, pz, yaw);
      b.box(0, y - 0.3, 0.2, 2.6, 0.32, 0.42, '#fff6dc', { col: false, r: 0, cast: false });
      b.box(0, y, 0.07, 2.4, 3.2, 0.16, '#fff6dc', { col: false, r: 0, cast: false });
      b.box(0, y + 0.18, 0.13, 2.0, 2.84, 0.1, '#8fd3ff', { col: false, r: 0, mat: 'gloss', cast: false });
      b.pop();
    }
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.cyl(T.x + sx * 3.1, T.top, T.z + sz * 3.1, 0.3, 7, '#fff6dc', { col: true, seg: 8 });
    for (const [x, z, w, d] of [[T.x, T.z + 3.1, 6.2, 0.3], [T.x + 3.1, T.z, 0.3, 6.2], [T.x - 3.1, T.z, 0.3, 6.2]]) b.box(x, T.top, z, w, 1.3, d, '#fff6dc', { r: 0.08 });
    for (const sx of [-1, 1]) b.box(T.x + sx * 2.35, T.top, T.z - 3.1, 1.5, 1.3, 0.3, '#fff6dc', { r: 0.08 });
    b.cone(T.x, T.top + 7, T.z, 5.6, 4.2, '#5f6675', { seg: 4, yaw: 45, col: false });
    b.box(T.x, T.top + 11.1, T.z, 0.18, 2.2, 0.18, '#f6c445', { col: false });
    b.box(T.x + 0.9, T.top + 12.4, T.z, 1.6, 0.9, 0.08, '#e8473c', { col: false });
    // ---------- the awning over the wall-jump alley (golden candle 0 hides under it; no dropping in from the roofs)
    b.box(-0.6, 13.4, -6, 2.8, 0.55, 6.4, '#ff5fa2', { r: 0.12, phys: { noLedge: true } });
    for (let i = 0; i < 4; i++) b.box(-1.65 + i * 0.7, 13.25, -6, 0.35, 0.2, 6.5, i % 2 ? '#ffffff' : '#ff5fa2', { col: false, r: 0.05 });
    // ---------- far away: the river valley, the Bessborough across the river, downtown, the bridges
    b.ramp(162, 11.5, -38, 113, 11.5, -0.1, 700, '#8cc456', { base: -40, col: false, cast: false });
    b.texQuad('water', 162, -420, 340, 420, -38, 10);
    b.box(520, -42, 0, 360, 12, 840, '#86c25a', { col: false, r: 0, cast: false });
    b.ramp(340, 0, -38.2, 360, 0, -30.1, 840, '#d4a86a', { base: -40, col: false, cast: false });
    b.prop('bessborough', 382, -30, -24, -90, { s: 1.05 });
    for (const [x, z, w, h, c] of [[440, -110, 18, 96, '#cfd6e2'], [458, -64, 14, 72, '#e3dcd0'], [470, 40, 16, 108, '#b8c8dc'], [446, 86, 12, 64, '#dcd2c2'], [492, -10, 20, 128, '#c4d0de'], [520, 70, 14, 84, '#e6e0d6'], [512, -150, 16, 70, '#d6dce6']]) b.prop('tower', x, -30, z, -90, { w, d: w, h, color: c, spire: h > 100 });
    b.prop('archBridge', 251, -38, -150, 0, { len: 190, arches: 6 });
    b.prop('trussBridge', 251, -38, 150, 0, { len: 190, spans: 4, deck: 20 });
  },

  // ===================================================================== props (data)
  place: [
    // ---------- KINAN'S HOUSE (same colours as 12-1: cream siding, red roof, red door, the birthday banner on the porch)
    ['house', -100, 0, -4, 0, { w: 24, d: 20, h: 12, rise: 7, gable: 'side', storeys: 2, color: '#f4e7c8', roof: '#d9443a', door: { x: 6, color: '#e8473c' }, porch: { x: 6, w: 10, d: 4.4, roof: 6.4 }, banner: 'HAPPY BIRTHDAY|KINAN!', chimney: [-6, -3] }],
    ['mailbox', -88.6, 0, 16.4, 0, {}],
    ['balloons', -89.4, 0.8, 10.6, 0, { n: 5, h: 5.5, seed: 4 }],
    // ---------- KINAN'S ROW (the rooftop run)
    ['house', ROW.n1.x, 0, HZ, 0, { ...ROW.n1, d: HD, color: '#c9f2d6', roof: '#3f63a8', door: { x: -3, color: '#3f63a8' }, chimney: [4, -9] }],
    ['house', ROW.n2.x, 0, HZ, 0, { ...ROW.n2, d: HD, color: '#ffd9a8', roof: '#5f6675', door: { x: 4, color: '#2fb5a8' }, porch: { x: 4, w: 8, d: 4, roof: 6 }, shutters: '#2fb5a8' }],
    ['house', ROW.n3.x, 0, HZ, 0, { ...ROW.n3, d: HD, color: '#d9ccff', roof: '#e8473c', door: { x: -3, color: '#ffd23f' }, porch: { x: -3, w: 8, d: 4, roof: 6.6 } }],
    ['house', ROW.n4.x, 0, HZ, 0, { ...ROW.n4, d: HD, color: '#5f6675', roof: '#2a2a33', trim: '#f7f3ea', glass: '#bfe6ff', door: { x: -2.5, color: '#e2ae73' }, storeys: 3, band: 5.3 }],
    ['house', ROW.n5.x, 0, HZ, 0, { ...ROW.n5, d: HD, color: '#f7f3ea', roof: '#5f6675', trim: '#2a2a33', frame: '#2a2a33', glass: '#7ec8ff', door: { x: 3, color: '#2a2a33' }, storeys: 4 }],
    ['house', ROW.n6.x, 0, HZ, 0, { ...ROW.n6, d: HD, color: '#fff1b8', roof: '#9b6cff', door: { x: 3, color: '#9b6cff' }, porch: { x: 3, w: 8, d: 4, roof: 6.4 }, storeys: 2 }],
    ['house', ROW.n7.x, 0, HZ, 0, { ...ROW.n7, d: HD, color: '#f08aa8', roof: '#5f6675', trim: '#fff6dc', door: { x: -6.5, color: '#2b3a7a' }, porch: { x: -6.5, w: 6, d: 4, roof: 6.6 }, storeys: 2, shutters: '#2b3a7a' }],
    // climbing help: bins + a ladder on the green bungalow, the ivy trellis up the grey infill, a ladder after the trench,
    // ivy up the Victorian's tower (from its roof ridge to the lookout)
    ['bins', -83.4, 0, -1.4, 90, {}],
    ['ladder', -82, 0, -9, -90, { h: ROW.n1.h }],
    ['trellis', -14, 0, -5, -90, { h: 16, d: 0.5, w: 4, seed: 4 }],
    ['ladder', 48, 0, -8, -90, { h: ROW.n6.h }],
    ['trellis', TOWER.x, 21, TOWER.z - 3.5, 180, { h: TOWER.top - 21, d: 0.5, w: 3.6, seed: 9, flower: '#ffd23f' }],
    ['sign', -84.8, 0, 5.6, 0, { text: 'ROOFTOP|RUN ->', w: 2.8, postH: 1.4 }],
    // ---------- THE BIG ELM (golden candle 1 at the top, a kite stuck in it)
    ['bigElm', ELM.x, 0, ELM.z, 0, { h: 26, branches: BRANCHES, kite: [ELM.x - 4.2, 24.6, ELM.z + 5.4] }],
    ['leafPile', ELM.x + 2.4, 0, ELM.z + 3.2, 0, { r: 2.0, seed: 3 }],
    ['leafPile', -26.5, 0, 16.2, 0, { r: 2.4, seed: 5 }],
    ['sign', -12.5, 0, 16.2, 0, { text: 'THE BIG|ELM', w: 2.6, postH: 1.3 }],
    // ---------- garages on the back lane, fences between the back yards
    ['garage', -100, 0, -34, 180, { w: 12, color: '#fdf0d5' }], ['garage', -74, 0, -34, 180, { w: 10, color: '#d6e4ff' }],
    ['garage', -52, 0, -34, 180, { w: 10, color: '#ffe0c2' }], ['garage', -29, 0, -34, 180, { w: 10, color: '#e3dcd0' }],
    ['garage', -1, 0, -34, 180, { w: 14, color: '#cfd6e2', roof: '#2a2a33' }], ['garage', 56, 0, -34, 180, { w: 10, color: '#fff6dc' }],
    ['garage', 80, 0, -34, 180, { w: 12, color: '#e9f7e0' }],
    // moving boxes piled up as steps beside the blue garage (the way up to the SECRET STASH on its roof)
    ...[[-31.6, 1.8], [-34.2, 3.4], [-36.8, 4.9]].map(([z, h]) => ['block', -67.3, 0, z, 0, { w: 2.6, h, d: 2.6, color: '#d9a56b', r: 0.12 }]),
    ...[[-31.6, 1.8], [-34.2, 3.4], [-36.8, 4.9]].map(([z, h]) => ['block', -67.3, h - 0.02, z, 0, { w: 0.8, h: 0.06, d: 2.64, color: '#b07a45', r: 0 }]),
    ...[-86, -63, -40, -17.5, 67].map((x) => ['fenceLow', x, 0, -29.6, -90, { len: 15.6 }]),
    ['fenceLow', -112, 0, -29.6, 0, { len: 6 }], ['fenceLow', -88, 0, -29.6, 0, { len: 6 }],
    ['hoop', -40, 0, -38.6, 180, {}], ['hockeyNet', -10, 0, -48, 0, {}],
    ['leafPile', -104, 0, -22, 0, { r: 2.6, seed: 8 }],
    ['clothesline', -60, 0, -22, 0, { len: 12 }],
    ['trampoline', -29, 0, -22, 0, { r: 3.4, bounce: 22 }],
    ...[-108, -84, -60, -36, -12, 12, 50, 74, 92].map((x, i) => ['powerPole', x, 0, -51, 90, { can: i % 3 === 1 }]),
    ...[[-108, 24], [-84, 24], [-60, 24], [-36, 24], [-12, 24], [50, 24], [74, 18]].map(([x, len]) => ['wires', x, 0, -51, 0, { len, y: 11.0 }]),
    // ---------- the street: elms on the boulevards, parked cars, a sugar-rush ? box
    ...[-108, -64, -40, 4, 18, 52, 66, 92].map((x, i) => ['elm', x, 0, 19.5, 0, { s: 0.95 + (i % 3) * 0.08, seed: 10 + i }]),
    ...[-100, -78, -56, -34, -10, 10, 50, 70, 90].map((x, i) => ['elm', x, 0, 36.5, 0, { s: 1.0 + (i % 2) * 0.1, seed: 30 + i }]),
    ['car', -85, 0, 11.6, 0, { color: '#3f8fe8' }],
    ['car', -68, 0, 23.4, 90, { color: '#ffd23f' }], ['car', -26, 0, 23.4, 90, { color: '#5cc23a' }],
    ['car', 60, 0, 23.4, 90, { color: '#ff8fb8' }], ['car', -92, 0, 32.6, -90, { color: '#e8473c' }],
    ['car', -46, 0, 32.6, -90, { color: '#9b6cff' }], ['car', 4, 0, 32.6, -90, { color: '#ffffff' }], ['car', 84, 0, 32.6, -90, { color: '#2fb5a8' }],
    ['streetLamp', -50, 0, 17.6, 0, {}], ['streetLamp', 9, 0, 17.6, 0, {}], ['streetLamp', 70, 0, 17.6, 0, {}], ['streetLamp', -80, 0, 38.6, 0, {}], ['streetLamp', -20, 0, 38.6, 0, {}],
    ['hydrant', -70, 0, 17.2, 0, {}], ['hydrant', 64, 0, 39, 0, {}],
    // October: pumpkins on the steps
    ['pumpkin', -97.5, 0.8, 10.2, 0, { s: 0.9, face: true }], ['pumpkin', -49.5, 0.8, 8.0, 0, {}], ['pumpkin', -25.8, 0.8, 8.4, 0, { s: 1.2, face: true }],
    ['pumpkin', 60.4, 0.8, 8.0, 0, { face: true }], ['pumpkin', 73.2, 0.8, 8.2, 0, { s: 0.8 }],
    ['bush', -106, 0, 7.8, 0, { s: 1.0, flowers: '#ff5fa2' }], ['bush', -78, 0, 5.4, 0, {}], ['bush', -56, 0, 5.4, 0, { flowers: '#ffd23f' }],
    ['bush', 52, 0, 5.4, 0, {}], ['bush', 86, 0, 5.4, 0, { flowers: '#ffffff' }],
    // ---------- the south side of the street (more houses, more roofs)
    ['house', -98, 0, 59, 180, { w: 18, h: 8, rise: 5, d: 18, color: '#ffd1e0', roof: '#5f6675', door: { x: 3, color: '#e8473c' } }],
    ['house', -74, 0, 59, 180, { w: 16, h: 7, rise: 4.5, d: 18, color: '#fff1b8', roof: '#2fb5a8', door: { x: -3, color: '#2fb5a8' } }],
    ['house', -50, 0, 59, 180, { w: 18, h: 11, rise: 6, d: 18, color: '#d6e4ff', roof: '#e8473c', door: { x: 4, color: '#3f63a8' }, storeys: 2 }],
    ['house', -26, 0, 59, 180, { w: 16, h: 7.5, rise: 5, d: 18, color: '#e3f0d0', roof: '#9b6cff', door: { x: -3, color: '#9b6cff' } }],
    ['house', -2, 0, 59, 180, { w: 16, h: 9, rise: 5.5, d: 18, color: '#ffe0c2', roof: '#3f63a8', door: { x: 3, color: '#ffd23f' } }],
    ['house', 56, 0, 59, 180, { w: 18, h: 8, rise: 5, d: 18, color: '#c9f2d6', roof: '#e8473c', door: { x: 3, color: '#e8473c' } }],
    ['house', 80, 0, 59, 180, { w: 16, h: 10, rise: 6, d: 18, color: '#d9ccff', roof: '#5f6675', door: { x: -3, color: '#ffd23f' }, storeys: 2 }],
    ['ladder', -66, 0, 56, 90, { h: 7 }],
    ['pumpkin', -96, 0, 48.6, 0, { face: true }], ['pumpkin', -48, 0, 48.6, 0, { s: 1.3 }],
    // ---------- road work: barriers, cones, the digger, culvert pipes across the flooded street
    ...[[21.2, 9, 90], [21.2, 15.5, 90], [21.2, 43, 90], [21.2, 47.5, 90], [42.8, 9, 90], [42.8, 15.5, 90], [42.8, 43, 90], [42.8, 47.5, 90]].map(([x, z, yaw]) => ['barrier', x, 0, z, yaw, { len: 4.4 }]),
    ...[[21, 20], [21, 36], [43, 20], [43, 36], [21, -42], [43, -48]].map(([x, z]) => ['cone', x, 0, z, 0, {}]),
    ['pipe', 26, -2.6, 28, 0, { len: 8 }], ['pipe', 38, -2.6, 28, 0, { len: 8 }],
    ['digger', 50, 0, -45, -90, {}],
    ['sign', 17.6, 0, 26, 90, { text: 'ROAD WORK|AGAIN!', w: 3.6, postH: 1.2 }],
    ['sign', 14, 20, -10.5, 90, { text: 'BALLOON|RAFT', w: 2.8, postH: 1.1 }],
    // ---------- the crescent by the riverbank (the trail to 12-3 starts here)
    ['railing', 111, 0, -52, -90, { len: 127, h: 2.0, color: '#2b3a7a' }],
    ['bench', 106, 0, -2, -90, {}], ['bench', 106, 0, 14, -90, {}],
    ['mapBoard', 104, 0, 6, -90, { text: 'RIVER|VALLEY|TRAIL' }],
    ['elm', 104, 0, -24, 0, { s: 1.1, seed: 50 }], ['elm', 104, 0, 34, 0, { s: 1.05, seed: 51 }],
    // ---------- background neighbourhood
    ...[-96, -60, -24, 12, 48, 84].map((x, i) => ['neighbor', x, 0, -82, 0, { color: ['#ffd9a8', '#d6e4ff', '#e3f0d0', '#ffd1e0', '#fff1b8', '#c9f2d6'][i], roof: ['#3f63a8', '#e8473c', '#5f6675', '#9b6cff', '#2fb5a8', '#e8473c'][i] }]),
    ...[-96, -60, -24, 12, 48, 84].map((x, i) => ['neighbor', x, 0, 102, 180, { color: ['#c9f2d6', '#ffe0c2', '#d6e4ff', '#fff1b8', '#ffd1e0', '#e3f0d0'][i], roof: ['#e8473c', '#5f6675', '#3f63a8', '#e8473c', '#9b6cff', '#5f6675'][i] }]),
    ['neighbor', -146, 0, -10, 90, { color: '#ffe0c2', roof: '#e8473c' }], ['neighbor', -146, 0, 40, 90, { color: '#d6e4ff', roof: '#5f6675' }],
    ...[[-150, -60], [-60, -110], [40, -112], [-140, 90], [0, 128], [90, 126]].map(([x, z], i) => ['elm', x, 0, z, 0, { s: 1.3, seed: 60 + i }]),
    ['pelican', 236, -14, -10, 0, { fly: 34, seed: 1, speed: 0.22 }], ['pelican', 260, -8, 30, 0, { fly: 26, seed: 4, speed: 0.27 }],
    ['cloud', -120, 90, -180, 0, { s: 1.7, seed: 1 }], ['cloud', 80, 110, -240, 0, { s: 2.1, seed: 2 }], ['cloud', 260, 100, -40, 0, { s: 2.0, seed: 3 }],
    ['cloud', 200, 120, 160, 0, { s: 2.3, seed: 4 }], ['cloud', -60, 95, 220, 0, { s: 1.8, seed: 5 }], ['cloud', -240, 105, 30, 0, { s: 2.0, seed: 6 }],
    ['cloud', 360, 130, 90, 0, { s: 2.4, seed: 7 }],
  ],

  // ===================================================================== collectibles
  candles: [
    // front walk + Kinan's yard
    ...line([-94, 0.4, 12], [-94, 0.4, 16.5], 3), ...ring(-89.5, 0.4, 13.5, 2.4, 5, 0.6),
    // bungalow ridges + gutter hops
    ...line([ROW.n1.x, ridgeY('n1') + 0.4, -10], [ROW.n1.x, ridgeY('n1') + 0.4, 1], 4),
    [-65.6, 7.4, -3], [-63.5, 9.6, -3], [-61.5, 8.9, -3],
    ...line([ROW.n2.x, ridgeY('n2') + 0.4, -10], [ROW.n2.x, ridgeY('n2') + 0.4, 1], 4),
    [-42.6, 8.9, -3], [-40, 11.4, -3], [-37.4, 10.4, -3],
    ...line([ROW.n3.x, ridgeY('n3') + 0.4, -10], [ROW.n3.x, ridgeY('n3') + 0.4, 1], 4),
    // the trellis + the grey infill roof
    [-14.95, 4, -5], [-14.95, 8, -5], [-14.95, 12, -5], ...ring(-6.5, 16.4, -3.5, 2.2, 5),
    // the big elm: one on every branch tip
    ...BRANCHES.slice(0, 7).map(([yaw, top, len]) => tip(yaw, top, 1 + (len || 5) - 0.8)),
    // the wall-jump alley (a trail up the open part) + the white infill roof
    [-0.6, 3.2, -12], [-0.6, 6.2, -12], [-0.6, 9.2, -12], [-0.6, 12.2, -12],
    ...line([4, 20.4, -2], [12, 20.4, -2], 3),
    // the balloon raft ride over the trench
    ...line([21, 21.6, -5], [41, 21.6, -5], 6),
    // yellow house + Victorian + the tower ivy
    ...line([ROW.n6.x, ridgeY('n6') + 0.4, -10], [ROW.n6.x, ridgeY('n6') + 0.4, 1], 4),
    [67, 14.8, -4], [70, 14.4, -4],
    [74, roofAt('n7', 74) + 0.4, -6], [77, roofAt('n7', 77) + 0.4, -6], ...line([TOWER.x, ridgeY('n7') + 0.4, -10], [TOWER.x, ridgeY('n7') + 0.4, -1.5], 3),
    [TOWER.x, 24.5, 0.0], [TOWER.x, 27.5, 0.0],
    // the street (sugar rush run) + the culvert pipes
    ...line([-80, 0.4, 28], [-6, 0.4, 28], 9), ...line([48, 0.4, 28], [92, 0.4, 28], 5),
    [26, 1.2, 28], [38, 1.2, 28],
    // the back lane
    ...line([-110, 0.4, -45], [-70, 0.4, -45], 4), ...line([-24, 0.4, -44], [14, 0.4, -44], 4),
    [-67.3, 2.2, -31.6], [-67.3, 3.8, -34.2], [-67.3, 5.3, -36.8],
    // the crescent + the south side of the street
    ...ring(99.5, 0.4, 6, 3, 6), ...line([-98, 13.4, 52], [-98, 13.4, 64], 3), ...line([-50, 17.4, 52], [-50, 17.4, 64], 3),
  ],
  goldenCandles: [
    { pos: [-0.6, 10.2, -6], name: 'WALL-JUMP ALLEY' },
    { pos: tip(-40, 22.6, 4.2).map((v, i) => (i === 1 ? v + 1.4 : v)), name: 'TOP OF THE BIG ELM' },
    { pos: [-40, 1.7, -47.5], name: 'BACK LANE BUTTON' },
  ],
  boxes: [
    { kind: 'prize', pos: [-89.5, 3.6, 13.5], item: 'popper' },
    { kind: 'prize', pos: [-50, 3.6, 28], item: 'cake' },
    { kind: 'prize', pos: [-66, 3.6, -45], item: 'lasso' },
    { kind: 'prize', pos: [10.5, 23.6, -10], item: 'umbrella' },
    { kind: 'prize', pos: [54, 3.6, 12.5], item: 'hat' },
    { kind: 'prize', pos: [76, 3.6, 12.5], item: 'heart' },
    { kind: 'prize', pos: [-30, 3.6, 28], candles: 5 },
    // secrets: over the leaf pile in Kinan's back yard (bounce up and bonk it), and over the culvert pipes
    { kind: 'prize', pos: [-104, 4.6, -22], candles: 5, hidden: true },
    { kind: 'prize', pos: [32, 5.0, 28], item: 'heart', hidden: true },
    // the back-lane puzzle: push the heavy crate onto the big button
    { kind: 'heavy', pos: [-62, 0, -44], id: 'lane-crate' },
    { kind: 'crate', pos: [-88, 0, -45], candles: 3 }, { kind: 'crate', pos: [-20, 0, -41.6], candles: 2 },
    { kind: 'crate', pos: [62, 0, -45], candles: 3 },
    { kind: 'block', pos: [-96, 0, -24], color: '#3f8fe8' },
  ],
  buttons: [{ pos: [-50, 0, -44], opens: 'lane-cage' }],
  cages: [{ id: 'lane-cage', pos: [-40, 0, -47.5] }],
  pawSpots: [{ pos: [-23.3, 0, 17.9], r: 1.4, boost: 24 }],     // open sky above, 3 steps out from the 2nd branch's tip
  poundBoxes: [
    { pos: [-76, 6, -34], candles: 6, color: '#5cc23a', message: 'SECRET STASH!' },
  ],

  // ===================================================================== enemies, pets, movers
  // Mario ramp: dumb socks on the first roofs and the street, alert ones in the lane and on the high roofs,
  // smart ones round the elm and on the last house.
  enemies: [
    { type: 'sock', tier: 'dumb', pos: [ROW.n1.x, ridgeY('n1'), -6], patrol: [[ROW.n1.x, -11], [ROW.n1.x, 1]] },
    { type: 'sock', tier: 'dumb', pos: [-52, roofAt('n2', -52), -8], patrol: [[-59, -8], [-45, -8]], color: '#fff3c4' },
    { type: 'sock', tier: 'dumb', pos: [-60, 0, 16.5], patrol: [[-80, 16.5], [-40, 16.5]] },
    { type: 'sock', tier: 'dumb', pos: [-20, 0, 28], patrol: [[-40, 28], [0, 28]], color: '#d6f5ff' },
    { type: 'sock', tier: 'alert', pos: [10, 20, -8], patrol: [[12.5, -11], [12.5, 1]], sight: 7 },
    { type: 'brick', tier: 'alert', pos: [-56, 0, -48.5], patrol: [[-72, -48.5], [-45, -48.5]], sight: 8 },
    { type: 'brick', tier: 'alert', pos: [0, 0, -46], patrol: [[-20, -46], [15, -46]], color: '#3f8fe8', sight: 8 },
    { type: 'sock', tier: 'smart', pos: [-26.5, 0, 16.2], ambush: true, ambushR: 4, color: '#f2b632' },
    { type: 'sock', tier: 'alert', pos: [ROW.n6.x, ridgeY('n6'), -6], patrol: [[ROW.n6.x, -12], [ROW.n6.x, 1]], sight: 7, color: '#ffe0ec' },
    { type: 'brick', tier: 'smart', pos: [84, roofAt('n7', 84), -9], patrol: [[84, -12], [84, -3]], color: '#9b6cff', sight: 8 },
    { type: 'sock', tier: 'smart', pos: [60, 0, 12], patrol: [[50, 12], [66, 12]], color: '#d6f5ff' },
    { type: 'sock', tier: 'dumb', pos: [70, 0, 16.5], patrol: [[48, 16.5], [92, 16.5]] },
    { type: 'sock', tier: 'dumb', pos: [100, 0, 0], patrol: [[100, -20], [100, 22]], color: '#fff3c4' },
  ],
  pets: [{ type: 'cat' }, { type: 'dog' }],
  movers: [
    // the balloon raft over the trench (top flush with the white infill's roof)
    { type: 'lift', from: [17.6, ROW.n5.h, -5], to: [44.6, ROW.n5.h, -5], size: [4.4, 0.8, 4.4], period: 8, pause: 1.6, color: '#f6c445' },
    // a floating pallet between the culvert pipes (wait for it to line up)
    { type: 'lift', from: [32, 0.8, 24.6], to: [32, 0.8, 31.4], size: [4.4, 0.8, 4.4], period: 6, pause: 1.2, color: '#c98b52', studs: false },
  ],
  checkpoints: [
    { pos: [-29, 0, 12.4], yaw: 90 },
    { pos: [-8, ROW.n4.h, -10], yaw: 90 },
    { pos: [45.5, 0, 12], yaw: 90 },
    { pos: [-30, 0, -44], yaw: 90 },
  ],
  hints: [
    { pos: [-94, 0, 17], r: 3.6, text: 'Whoa... your whole STREET is 3D! See the castle way past the end of the street? That is the Bessborough. Party time!', cam: { pos: [-64, 30, 44], look: [70, 12, -8], time: 3.6 } },
    { pos: [-84, 0, 3], r: 4.2, text: 'Hop on the car or the bins (or climb the ladder), then jump to the roof. Kinan grabs the gutter by himself!' },
    { pos: [-62, 8, -4], r: 6, dy: 6, text: 'ROOFTOP RUN! Jump from gutter to gutter. Push the stick all the way (or hold SHIFT) for longer jumps.' },
    { pos: [ELM.x, 0, ELM.z + 5], r: 4.6, text: 'THE BIG ELM! Its branches go round and up like stairs. Something pink is stuck way up top...' },
    { pos: [-16.5, 0, -5], r: 3.6, text: 'An ivy trellis: CLIMB it! Walk into it, then hold UP.' },
    { pos: [-0.6, 0, 3.4], r: 2.8, text: 'A narrow gap between two tall houses... WALL JUMP up it! Something golden is hiding under that awning.' },
    { pos: [-8, ROW.n4.h, -6], r: 5, dy: 3, text: 'Jump up to the white house, then ride the BALLOON RAFT over the road work!' },
    { pos: [17.6, ROW.n5.h, -5], r: 3, dy: 3, text: 'All aboard the balloon raft! Stand still and enjoy the ride.' },
    { pos: [16, 0, 28], r: 6, text: 'ROAD WORK! The street is flooded. Hop across the pipes (wait for the floating pallet), or take the balloon raft up on the roofs.' },
    { pos: [-58, 0, -44], r: 5, text: 'A GOLDEN CANDLE in a cage! The BIG BUTTON opens it, but only while something HEAVY sits on it. Push that big crate!' },
    { pos: [46, 0, -2], r: 4, text: 'A ladder! Up you go.' },
    { pos: [TOWER.x, ridgeY('n7'), -4], r: 4.5, dy: 4, text: 'Climb the ivy up the tower! The lookout on top can see the whole river valley.' },
    { pos: [-104, 0, -18], r: 5, text: 'A pile of leaves! Jump in it. Is something hiding up there?' },
    { pos: [104, 0, 6], r: 5, text: 'The river valley trail starts here. But first: the lookout on that tower!' },
  ],
  goal: { pos: [TOWER.x, TOWER.top, TOWER.z], r: 2.4, yaw: -90, ring: 2.6, ringY: 3.3 },
  // Glitchy's way-finding paths (offered after 5 losses near a checkpoint). Key = checkpoint index, -1 = the start.
  guides: {
    '-1': [[-94, 0, 14], [-85, 0, 3], [-83.4, 3, -1.4], [-74, ridgeY('n1'), -3], [-52, ridgeY('n2'), -3], [-29, 0, 12.4]],
    0: [[-17, 0, 3], [-15.2, 0, -5], [-15.2, 16, -5], [-8, ROW.n4.h, -10]],
    1: [[-1, ROW.n4.h, -5], [4, ROW.n5.h, -5], [17.6, ROW.n5.h, -5], [44, ROW.n5.h, -5], [45, 0, 12]],
    2: [[46.5, 0, -8], [48, ROW.n6.h, -8], [ROW.n6.x, ridgeY('n6'), -6], [71, ROW.n7.h, -6], [TOWER.x, ridgeY('n7'), -2], [TOWER.x, TOWER.top, TOWER.z]],
    3: [[-30, 0, -40], [-18, 0, -22], [-18, 0, 4], [-29, 0, 12.4]],
  },
};

// the balloons tied to the raft (they ride along with the lift)
const build0 = L.build;
L.build = function (b) { build0.call(this, b); balloonRaft(b, 17.6, ROW.n5.h, -5, 7); };

export default L;

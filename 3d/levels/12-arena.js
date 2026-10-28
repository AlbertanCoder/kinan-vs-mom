// =====================================================================================
//  WORLD 12 · BOSS ARENA  ·  "BIG BRICK"  (open with level-12-1.html?level=12-arena)
// =====================================================================================
// A square play mat walled in by giant toy bricks. BIG BRICK, the king of the angry toy bricks, charges at Kinan.
// It bonks the walls and gets dizzy: jump on its head. Every hit makes it smarter (see js/boss.js):
//   1 dumb: long wind-up, charges at where Kinan was
//   2 smarter: fakes charges (the real one starts with a STOMP), calls sock minions
//   3 smartest: aims where Kinan is going (red eyes), jump-slams with a red ring warning
// Beat it and a golden candle appears in the middle; then the goal ring opens at the north end.
const ring = (cx, y, cz, r, n, a0 = 0) => Array.from({ length: n }, (_, i) => [cx + Math.cos(a0 + i / n * Math.PI * 2) * r, y, cz + Math.sin(a0 + i / n * Math.PI * 2) * r]);
const A = 19;   // half size of the arena floor

export default {
  id: '12-arena',
  title: "BIG BRICK'S ARENA",
  subtitle: 'the king of the angry bricks',
  clearText: 'BIG BRICK is beaten! Back to the party!',
  intro: 'BIG BRICK is waiting at the far end. Step onto the mat to wake it up!',
  assets: { kinan: '../worlds/w12_assets/kinan.glb', glitchy: '../worlds/w12_assets/glitchy.glb', pets: '../worlds/w12_assets/pet_{id}.glb' },
  killY: -30,
  sky: { top: '#3d6fe8', mid: '#9cc8ff', horizon: '#ffe6c8', fog: '#ffe2c4', fogNear: 140, fogFar: 420 },
  light: { hemi: 0.75, sunI: 2.5, dir: [20, 52, 28], shadowSize: 32, env: 0.4 },
  exposure: 0.95,
  spawn: { pos: [0, 0, A - 6], yaw: 180 },
  zoneOf: () => 'o',
  camDefaults: { dist: 15, pitch: 0.46, height: 1.6 },
  camZones: [],
  helpAfter: 5,
  helpText: 'BIG BRICK is tough! Want Glitchy to give you a tip?',

  build(b) {
    // lawn + play mat
    b.slab(-60, -60, 60, 60, -1, 0, '#62c544', [], { cam: true });
    b.texQuad('grass', -60, -60, 60, 60, 0.012, 7);
    b.texQuad('grass', -300, -300, 300, 300, -0.04, 7);
    b.texRect('rugRoad', 0, 0, 2 * A, 2 * A, 0.03, 2);
    // the arena wall: a ring of giant toy bricks (BIG BRICK bonks these and gets dizzy)
    const cols = ['#e8473c', '#3f8fe8', '#ffd23f', '#5cc23a', '#ff9a3c', '#9b6cff'];
    let k = 0;
    for (let x = -A; x < A; x += 4) for (const z of [-A - 1, A + 1]) b.box(x + 2, 0, z, 3.96, 3.2, 2, cols[k++ % cols.length], { r: 0.3, mat: 'gloss', phys: { noLedge: true } });
    for (let z = -A; z < A; z += 4) for (const x of [-A - 1, A + 1]) b.box(x, 0, z + 2, 2, 3.2, 3.96, cols[k++ % cols.length], { r: 0.3, mat: 'gloss', phys: { noLedge: true } });
    for (const [x, z] of [[-A - 1, -A - 1], [A + 1, -A - 1], [-A - 1, A + 1], [A + 1, A + 1]]) { b.box(x, 0, z, 3, 6, 3, '#ffffff', { r: 0.4, mat: 'gloss' }); b.box(x, 6, z, 3.4, 0.6, 3.4, '#e8473c', { r: 0.25 }); }
    // invisible fence beyond the wall
    for (const [x, z, w, d] of [[0, -A - 6, 2 * A + 14, 1], [0, A + 6, 2 * A + 14, 1], [-A - 6, 0, 1, 2 * A + 14], [A + 6, 0, 1, 2 * A + 14]]) b.box(x, 0, z, w, 12, d, null, { vis: false, phys: { noLedge: true, noWallJump: true } });
  },

  place: [
    ['sign', -9, 0, A + 3.6, 180, { text: "BIG BRICK'S|ARENA", w: 4 }],
    ['balloons', -A - 1, 6.6, -A - 1, 0, { n: 4, h: 4, seed: 3 }], ['balloons', A + 1, 6.6, -A - 1, 0, { n: 4, h: 4, seed: 5 }],
    ['tree', -32, 0, -30, 0, { s: 1.3, seed: 2 }], ['tree', 34, 0, -28, 0, { s: 1.2, seed: 5 }], ['tree', -34, 0, 30, 0, { s: 1.1, seed: 8 }], ['tree', 33, 0, 32, 0, { s: 1.25, seed: 11 }],
    ['cloud', -120, 80, -160, 0, { s: 1.6, seed: 1 }], ['cloud', 80, 95, -200, 0, { s: 2.0, seed: 2 }],
  ],
  candles: [...ring(0, 0.4, 0, 8, 8), [-14, 0.4, 14], [14, 0.4, 14], [-14, 0.4, -14], [14, 0.4, -14]],
  goldenCandles: [],
  boxes: [
    { kind: 'prize', pos: [-12, 3.6, 12], item: 'heart' },
    { kind: 'prize', pos: [12, 3.6, 12], item: 'hat' },
    { kind: 'crate', pos: [-16, 0, 0], candles: 3 },
    { kind: 'crate', pos: [16, 0, 0], candles: 3 },
  ],
  boss: { kind: 'brick', name: 'BIG BRICK', pos: [0, 0, -A + 5], arena: [-A, -A, A, A], hp: 3, color: '#e8473c', wakeR: 22, prize: 'BRICK KING' },
  checkpoints: [{ pos: [7, 0, A - 4], yaw: 180 }],
  hints: [
    { pos: [0, 0, A - 7], r: 4, text: 'When BIG BRICK crouches and flashes "!", it is about to charge. Run to the side!' },
  ],
  guides: { '-1': [[-A + 4, 0, 0], [0, 0, A - 6]], 0: [[-A + 4, 0, 0], [0, 0, A - 6]] },
  goal: { pos: [0, 0, -A + 2], r: 2.6, yaw: 0, ring: 2.9, ringY: 3.4, locked: true },
};

// =====================================================================================
//  WORLD 12 CASTLE  ·  THE BESSBOROUGH BIRTHDAY FESTIVAL  ·  ROUGH DRAFT (2026-10-30, Developer mode only)
// =====================================================================================
// A 2.5D festival run along the riverbank to the Bessborough, and World 12's finale. Nobody is beaten up: there are no
// enemies at all, the last stretch is a happy challenge (KICK the five firework fuses for Glitchy), falling in the river
// only retries from the last checkpoint. It ends at the birthday party on the lawn; js/finale.js then plays the ending.
// Everything is placed by s = distance along the path (0 = start, 440 = the end) and off = how far behind the path line
// (away from the camera; negative = toward it). The camera watches from the land side with the river behind Kinan.
//   s   0- 72  the festival gate: Mom's cupcakes, the Grandmas' cookies
//   s  72- 94  the boat slip: hop across the floating presents
//   s  94-140  Dad's stall with his JOKE BOOK, the bouncy present (golden candle), first corner at 140
//   s 150-188  Big Sis Chenoa's paint stall, the stacked presents up to the terrace
//   s 188-230  the terrace: Annie's photo booth, the ramp down
//   s 240-300  second corner at 240, Big Bro Shad's crates (KICK them), GRANDPA's bench
//   s 300-396  THE FIREWORKS: five fuses over water, presents, a balloon raft, a balloon lift and the pier
//   s 396-440  the party lawn in front of the Bessborough: the cake, the goal
import { CITY, CITY_TEXTURES, titleCard, balloonRaft } from '../js/props-city.js';
import { FESTIVAL } from '../js/props-festival.js';
import { setupFestival, playFinale } from '../js/finale.js';

const T0 = 0, WATER = -3.4, LAWN = -2.7, BASE = -9, TERRACE = 6, PIER = 8;
const TURN = 20 * Math.PI / 180;
const P1 = [110, -40], P2 = [110 - 100 * Math.cos(TURN), -40 + 100 * Math.sin(TURN)];
// heading west (-x): the camera sits on the land side (-z) looking toward the river (+z)
const PATH = [[250, -40], P1, P2, [P2[0] - 200, P2[1]]];

const SEGS = [];
for (let i = 0, s = 0; i < PATH.length - 1; i++) {
  const [x0, z0] = PATH[i], [x1, z1] = PATH[i + 1], len = Math.hypot(x1 - x0, z1 - z0);
  const tx = (x1 - x0) / len, tz = (z1 - z0) / len;
  SEGS.push({ s0: s, s1: s + len, x0, z0, tx, tz, yaw: Math.atan2(-tz, tx) * 180 / Math.PI });
  s += len;
}
const CORNERS = SEGS.slice(1).map((g) => g.s0);
const segAt = (s) => SEGS.find((g) => s < g.s1) || SEGS[SEGS.length - 1];
// world [x, y, z] at distance s along the path, `off` behind the path line
const W = (s, y = 0, off = 0) => { const g = segAt(s), d = s - g.s0; return [g.x0 + g.tx * d + g.tz * off, y, g.z0 + g.tz * d - g.tx * off]; };
const FACE = (s) => segAt(s).yaw;                                                          // a prop facing the camera
const FWD = (s) => { const g = segAt(s); return Math.atan2(g.tx, g.tz) * 180 / Math.PI; };  // Kinan facing right (forward)
const zoneAt = (s0, s1, y0, y1, o) => {
  const ps = [W(s0, 0, -20), W(s0, 0, 14), W(s1, 0, -20), W(s1, 0, 14)], xs = ps.map((p) => p[0]), zs = ps.map((p) => p[2]);
  return { min: [Math.min(...xs), y0, Math.min(...zs)], max: [Math.max(...xs), y1, Math.max(...zs)], ...o };
};
const row = (s0, s1, n, y, off = 0) => Array.from({ length: n }, (_, i) => W(s0 + (s1 - s0) * (n === 1 ? 0 : i / (n - 1)), y, off));

// the path strip: 2.5 toward the camera (a cut-away, like the 2D game), 12 behind (see 12-3-side.js)
const FRONT = -2.5, BACKO = 12, SPLIT = 3;
const FUSE_AT = [[312, T0], [345, 4.4], [370, PIER], [380, 5], [392, T0]];
const GOAL_S = 410;

const L = {
  id: '12-castle',
  title: 'THE BESSBOROUGH BIRTHDAY FESTIVAL',
  subtitle: 'the whole city throws a party',
  cardText: 'The whole team is waiting! Run along the river to the party!',
  clearText: 'Happy birthday, Kinan!',
  intro: 'The whole team is waiting at the Bessborough! Run RIGHT along the river!',
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
  spawn: { pos: W(4, T0), yaw: FWD(4) },
  zoneOf: () => 'o',
  camZones: [
    zoneAt(352, 392, -3, 16, { dist: 20, pitch: 0.18, height: 3 }),                 // the pier and the balloon lift
    zoneAt(396, 445, -3, 12, { dist: 22, pitch: 0.08, height: 3.8 }),               // the party lawn: the Bessborough fills the picture
  ],

  // ===================================================================== static scenery
  build(b) {
    titleCard(L);
    const inSeg = (s, fn) => { const g = segAt(s); b.push(g.x0, 0, g.z0, g.yaw); fn(g); b.pop(); };
    const slab = (s0, s1, y0, y1, offA, offB, color, o = {}) => inSeg((s0 + s1) / 2, (g) => b.box((s0 + s1) / 2 - g.s0, y0, -(offA + offB) / 2, s1 - s0, y1 - y0, offB - offA, color, o));
    const topTex = (tex, s0, s1, y, offA, offB, scale = 8) => inSeg((s0 + s1) / 2, (g) => b.texQuad(tex, s0 - g.s0, -offB, s1 - g.s0, -offA, y, scale));
    const face = (s0, s1, y0, y1, offA) => inSeg((s0 + s1) / 2, (g) => b._wallFace('clay', s0 - g.s0, s1 - g.s0, y0, y1, -offA + 0.03, 1, 6, 0));
    const turnAt = (c) => { const i = SEGS.findIndex((g) => Math.abs(g.s0 - c) < 1e-6); return SEGS[i - 1].tx * SEGS[i].tz - SEGS[i - 1].tz * SEGS[i].tx; };
    const TH = Math.tan(TURN / 2);
    // the path's ground from s0 to s1, split at corners (each piece runs on just far enough to close the gap outside a turn)
    const ground = (s0, s1, y1, color, o = {}) => {
      const tex = o.tex === undefined ? 'leafGrass' : o.tex;
      const cuts = [s0, ...CORNERS.filter((c) => c > s0 + 0.01 && c < s1 - 0.01), s1];
      for (let i = 0; i < cuts.length - 1; i++) {
        const a = cuts[i], e = cuts[i + 1];
        inSeg((a + e) / 2, (g) => {
          for (const [oA, oB] of [[FRONT, SPLIT], [SPLIT, BACKO]]) {
            const reach = oA < 0 ? -oA : oB;
            const outside = (c) => (turnAt(c) < 0) === (oA < 0);
            const x0 = a - g.s0 - (i > 0 && outside(a) ? reach * TH + 0.3 : 0);
            const x1 = e - g.s0 + (i < cuts.length - 2 && outside(e) ? reach * TH + 0.3 : 0);
            b.box((x0 + x1) / 2, BASE, -(oA + oB) / 2, x1 - x0, y1 - BASE, oB - oA, color, { r: 0.05, cast: false });
            if (tex) b.texQuad(tex, x0, -oB, x1, -oA, y1 + 0.012 + i * 0.003, 8);
            if (oA < 0) b._wallFace('clay', x0, x1, BASE, y1, -oA + 0.03, 1, 6, 0);
          }
        });
      }
    };
    const ramp = (sHi, yHi, sLo, yLo, color, tex = 'trail') => inSeg((sHi + sLo) / 2, (g) => {
      const zc = -(FRONT + BACKO) / 2, w = BACKO - FRONT;
      b.ramp(sLo - g.s0, zc, yLo, sHi - g.s0, zc, yHi, w, color, { base: BASE });
      if (tex) b.texSlope(tex, sLo - g.s0, zc, yLo + 0.02, sHi - g.s0, zc, yHi + 0.02, w - 0.2, 6);
    });
    const trail = (s0, s1, y) => topTex('trail', s0, s1, y + 0.02, -1.7, 1.7, 6);
    const end = (s, y0, y1, dir) => inSeg(s, (g) => {   // a clay face across the path at s (dir +1 faces forward, -1 back)
      b.push(s - g.s0, 0, 0, dir > 0 ? 90 : -90);
      b._wallFace('clay', dir > 0 ? FRONT : -BACKO, dir > 0 ? BACKO : -FRONT, y0, y1, 0.03, 1, 6, 0);
      b.pop();
    });

    // ---------- the path, start to end
    ground(-8, 72, T0, '#7cbf45'); trail(-8, 72, T0); end(72, BASE, T0, 1);
    ground(94, 318, T0, '#86c25a'); end(94, BASE, T0, -1); end(318, BASE, T0, 1);
    trail(94, 138.5, T0); trail(141.5, 188, T0); trail(230, 238.5, T0); trail(241.5, 318, T0);
    // the terrace and its ramp down
    slab(188, 214, T0, TERRACE, FRONT, BACKO, '#c9975a', { r: 0.2 }); face(188, 214, T0, TERRACE, FRONT); end(188, T0, TERRACE, -1);
    topTex('leafGrass', 188, 214, TERRACE + 0.012, FRONT, BACKO); trail(188, 214, TERRACE);
    ramp(214, TERRACE, 230, T0, '#c9975a');
    // the island in the fireworks stretch
    ground(332, 352, T0, '#92c95e'); end(332, BASE, T0, -1); end(352, BASE, T0, 1); trail(332, 352, T0);
    // the pier (a tall toy block) and everything after it
    slab(364, 376, BASE, PIER, FRONT, BACKO, '#c48f63', { r: 0.2 }); face(364, 376, BASE, PIER, FRONT); end(364, BASE, PIER, -1);
    topTex('deck', 364, 376, PIER + 0.014, FRONT, BACKO, 4);
    ground(376, 452, T0, '#92c95e'); trail(376, 452, T0);

    // ---------- the land: a low lawn on the camera side (water shows through the slip), the river behind, the hotel grounds
    const lawn = (x0, x1, z0, z1) => {
      b.box((x0 + x1) / 2, BASE, (z0 + z1) / 2, x1 - x0, LAWN - BASE, z1 - z0, '#84c652', { col: false, r: 0, cast: false });
      b.texQuad('leafGrass', x0, z0, x1, z1, LAWN + 0.012, 8);
    };
    const slipX = [W(72)[0], W(94)[0]], z8 = -8.3;
    lawn(slipX[0], 276, -150, z8); lawn(-260, slipX[1], -150, z8); lawn(slipX[1], slipX[0], -150, -44);
    b.box(130, BASE, -5, 280, -3.0 - BASE, 7, '#ead9a6', { col: false, r: 0, cast: false });   // a thin beach
    const hotelS0 = 376, hotelS1 = 520;
    slab(hotelS0, hotelS1, BASE, T0, BACKO, 130, '#92c95e', { col: false, r: 0.05, cast: false });
    topTex('leafGrass', hotelS0, hotelS1, 0.012, BACKO, 130);
    b.texQuad('water', -700, -180, 700, 520, WATER, 10);

    // ---------- the Bessborough, right behind the party
    const [hx, , hz] = W(GOAL_S + 2, 0, 66);
    b.prop('bessborough', hx, T0, hz, 180, { s: 0.8 });

    // ---------- across the river: downtown and the bridges
    b.box(0, -24, 380, 1400, 34, 200, '#86c25a', { col: false, r: 0, cast: false });
    b.ramp(0, 270, WATER - 0.2, 0, 282, 10, 1400, '#d4a86a', { base: -24, col: false, cast: false });
    for (const [x, z, w, h, c] of [[-120, 340, 18, 96, '#cfd6e2'], [-80, 360, 14, 72, '#e3dcd0'], [30, 350, 16, 108, '#b8c8dc'], [70, 330, 12, 64, '#dcd2c2'], [-10, 380, 20, 128, '#c4d0de'], [110, 370, 14, 84, '#e6e0d6'], [-160, 330, 16, 70, '#d6dce6'], [190, 345, 16, 88, '#c4d0de'], [-280, 350, 18, 80, '#e3dcd0']]) b.prop('tower', x, 10, z, 180, { w, d: w, h, color: c, spire: h > 100 });
    b.prop('archBridge', 60, WATER, 150, 90, { len: 250, arches: 8, deck: 13 });
    b.prop('trussBridge', 200, WATER, 150, 90, { len: 250, spans: 5, deck: 14 });

    // the two balloon rides
    balloonRaft(b, ...W(320.5, 0), 3);
    balloonRaft(b, ...W(357.5, 1), 5);
  },

  // ===================================================================== props (data)
  place: [
    // ---------- the gate
    ['festArch', ...W(14, T0, 3.4), FACE(14), { text: 'HAPPY BIRTHDAY|KINAN!', w: 12 }],
    ['balloons', ...W(6, T0, 3.2), 0, { seed: 1 }], ['balloons', ...W(22, T0, 3.2), 0, { seed: 2 }],
    ['stall', ...W(30, T0, 6.4), FACE(30), { text: "MOM'S|CUPCAKES", awning: '#9b6cff', goods: ['#ff8fb8', '#ffffff', '#c79bff'] }],
    ['bunting', ...W(42, T0, 2.9), FACE(42), { len: 14 }],
    ['stall', ...W(56, T0, 6.4), FACE(56), { text: "THE GRANDMAS'|COOKIES", awning: '#2f9a95', goods: ['#d9a56b', '#f4e1c0', '#8d5a33'] }],
    ['balloons', ...W(66, T0, 3.2), 0, { seed: 3 }],
    // ---------- the boat slip: floating presents
    ['present', ...W(78.5, WATER - 0.4), FACE(78), { w: 5, h: 3.8, d: 6, n: 0 }],
    ['present', ...W(87.5, WATER - 0.4), FACE(87), { w: 5, h: 3.8, d: 6, n: 1 }],
    // ---------- Dad's stall and his joke book
    ['stall', ...W(104, T0, 6.4), FACE(104), { text: "DAD'S|GRILL", awning: '#3f8fe8', goods: ['#b86a3c', '#f4e1c0', '#5cc23a'] }],
    ['jokeBook', ...W(112, T0, 3.6), FACE(112), {}],
    ['present', ...W(120, T0), FACE(120), { w: 3.6, h: 1, d: 5, n: 3, bounce: 25, bow: false }],
    ['bunting', ...W(128, T0, 2.9), FACE(128), { len: 12 }],
    // ---------- Big Sis Chenoa's paint stall, the stacked presents
    ['stall', ...W(160, T0, 6.4), FACE(160), { text: "CHENOA'S|PAINT STALL", awning: '#ff5fa2', goods: ['#e8473c', '#3f8fe8', '#ffd23f'] }],
    ['balloons', ...W(150, T0, 3.2), 0, { seed: 4 }],
    ['present', ...W(174, T0), FACE(174), { w: 4.4, h: 1.7, d: 8, n: 2 }],
    ['present', ...W(179, T0), FACE(179), { w: 4.4, h: 3.4, d: 8, n: 4 }],
    ['present', ...W(184, T0), FACE(184), { w: 4.4, h: 5.0, d: 8, n: 5 }],
    // ---------- the terrace: Annie's photo booth
    ['festArch', ...W(195, TERRACE, 3.4), FACE(195), { text: 'SMILE!', w: 9 }],
    ['stall', ...W(207, TERRACE, 6.4), FACE(207), { text: "ANNIE'S|PHOTO BOOTH", awning: '#ffd23f', goods: ['#7ee8ff', '#ffffff', '#ff9a3c'] }],
    // ---------- Big Bro Shad's job site, GRANDPA's bench
    ['stall', ...W(250, T0, 6.4), FACE(250), { text: "SHAD'S|TOOL TENT", awning: '#ff9a3c', goods: ['#c9c9cf', '#ffd23f', '#a8692e'] }],
    ['cone', ...W(246, T0, 2.6), 0, {}], ['cone', ...W(254, T0, 2.6), 0, {}],
    ['bench', ...W(292, T0, 3.8), FACE(292), {}],
    ['bunting', ...W(278, T0, 2.9), FACE(278), { len: 14 }],
    // ---------- the fireworks stretch
    ['sign', ...W(304, T0, 2.8), FACE(304), { text: 'FIREWORKS|THIS WAY!', w: 3.4, postH: 1.5 }],
    ['present', ...W(339, T0), FACE(339), { w: 5, h: 2.2, d: 6.6, n: 1 }],
    ['present', ...W(345, T0), FACE(345), { w: 5, h: 4.4, d: 6.6, n: 0, bow: false }],
    ['present', ...W(380, T0), FACE(380), { w: 5, h: 5, d: 6.6, n: 4, bow: false }],
    ['present', ...W(385, T0), FACE(385), { w: 5, h: 2.5, d: 6.6, n: 3 }],
    // ---------- the party lawn
    ['festArch', ...W(GOAL_S, T0, 16), FACE(GOAL_S), { text: 'HAPPY 11TH BIRTHDAY|KINAN!', w: 22 }],
    ['partyTable', ...W(GOAL_S - 16, T0, 9), FACE(GOAL_S), { w: 10 }], ['partyTable', ...W(GOAL_S + 16, T0, 9), FACE(GOAL_S), { w: 10 }],
    ['balloons', ...W(GOAL_S - 8, T0, 8), 0, { seed: 5 }], ['balloons', ...W(GOAL_S + 8, T0, 8), 0, { seed: 6 }],
    ['bunting', ...W(GOAL_S - 24, T0, 13), FACE(GOAL_S), { len: 20, h: 7 }], ['bunting', ...W(GOAL_S + 24, T0, 13), FACE(GOAL_S), { len: 20, h: 7 }],
    // ---------- trees along the way
    ...[[-4, 8], [36, 8.5], [68, 8], [100, 9], [132, 8], [146, 9], [176, 10], [226, 9], [236, 10], [268, 9], [284, 8.5], [298, 9.5], [312, 10]].map(([s, off], i) => ['aspen', ...W(s, T0, off), 0, { s: 1.0 + (i % 3) * 0.12, seed: i + 1 }]),
    ...[[20, 10], [62, 10.5], [116, 10], [270, 10.5]].map(([s, off], i) => ['elm', ...W(s, T0, off), 0, { s: 1.0, seed: 70 + i }]),
    ...[[400, 22], [424, 22], [388, 30], [436, 30]].map(([s, off], i) => ['aspen', ...W(s, T0, off), 0, { s: 1.15, seed: 30 + i }]),
    ['pelican', 60, 12, 120, 0, { fly: 40, seed: 1, speed: 0.2 }], ['pelican', -60, 18, 150, 0, { fly: 30, seed: 3, speed: 0.26 }],
    ['cloud', -120, 90, 180, 0, { s: 1.8, seed: 1 }], ['cloud', 80, 110, 240, 0, { s: 2.2, seed: 2 }], ['cloud', 260, 100, 40, 0, { s: 2.0, seed: 3 }],
    ['cloud', -240, 105, 60, 0, { s: 2.1, seed: 6 }], ['cloud', 140, 95, 120, 0, { s: 1.7, seed: 4 }],
  ],

  // ===================================================================== collectibles
  candles: [
    ...row(8, 24, 5, T0 + 0.4), ...row(30, 66, 10, T0 + 0.4), W(78.5, 1.4), W(87.5, 1.4),
    ...row(96, 116, 6, T0 + 0.4), ...row(124, 136, 4, T0 + 0.4), ...row(146, 170, 7, T0 + 0.4),
    W(174, 2.2), W(179, 3.9), W(184, 5.5), ...row(190, 212, 7, TERRACE + 0.4), W(218, 5), W(222, 3.4), W(226, 1.9),
    ...row(232, 252, 6, T0 + 0.4), ...row(264, 310, 12, T0 + 0.4), W(325, 1.6), ...row(333, 335, 2, T0 + 0.4), W(339, 2.7), W(345, 4.9),
    W(357.5, 5), ...row(366.5, 374.5, 3, PIER + 0.4), W(385, 3), ...row(388, 396, 3, T0 + 0.4),
  ],
  goldenCandles: [
    { pos: W(120, T0 + 8.6), name: 'THE BOUNCY PRESENT' },
    { pos: W(195, TERRACE + 5.4), name: 'SMILE!' },
    { pos: W(370, PIER + 5.4), name: 'TOP OF THE PIER' },
  ],
  boxes: [
    { kind: 'prize', pos: W(34, T0 + 3.6), candles: 5 },
    { kind: 'prize', pos: W(62, T0 + 3.6), item: 'lasso' },
    { kind: 'prize', pos: W(130, T0 + 3.6), item: 'heart' },
    { kind: 'prize', pos: W(152, T0 + 3.6), item: 'umbrella' },
    { kind: 'prize', pos: W(208, TERRACE + 3.6), candles: 5 },
    { kind: 'prize', pos: W(272, T0 + 3.6), item: 'cake' },
    { kind: 'prize', pos: W(334, T0 + 3.6), item: 'heart' },
    // Big Bro Shad's crates: stuck in the way until Kinan kicks them (they cannot be lifted)
    { kind: 'crate', pos: W(258, T0), candles: 3, fixed: true },
    { kind: 'crate', pos: W(258, T0 + 1.8), candles: 3, fixed: true },
  ],

  // ===================================================================== movers, pets, checkpoints
  pets: [{ type: 'cat' }, { type: 'dog' }],
  movers: [
    { type: 'lift', from: W(320.5, T0), to: W(329.5, T0), size: [5, 0.8, 4.2], period: 6, pause: 1, color: '#ffd23f', studs: false },     // the balloon raft
    { type: 'lift', from: W(357.5, 1), to: W(357.5, PIER + 1), size: [5, 0.8, 4.2], period: 7, pause: 1.2, color: '#ff5fa2', studs: false },   // the balloon lift
  ],
  checkpoints: [
    { pos: W(96, T0), yaw: FWD(96) },
    { pos: W(150, T0), yaw: FWD(150) },
    { pos: W(200, TERRACE), yaw: FWD(200) },
    { pos: W(300, T0), yaw: FWD(300) },
    { pos: W(334, T0), yaw: FWD(334) },
    { pos: W(388, T0), yaw: FWD(388) },
  ],
  hints: [
    { pos: W(24, T0), r: 5, text: "Mom: There's my birthday boy! Keep running, Kinan, the whole city is waiting!" },
    { pos: W(52, T0), r: 5, text: "the Grandmas: Take a cookie! Take two! You're getting too skinny!" },
    { pos: W(70, T0), r: 3, text: 'Presents on the water! Hop across them. Falling in only sends you back a little way.' },
    { pos: W(106, T0), r: 5, text: "Dad: Bud, look! MY JOKE BOOK! What did the balloon say to the pin? Hi, buster!" },
    { pos: W(116, T0), r: 3, text: 'A bouncy present! Jump on it. Hold JUMP to go extra high for the golden candle.' },
    { pos: W(162, T0), r: 5, text: 'Big Sis Chenoa: I painted every banner on this street. You are welcome, little bro!' },
    { pos: W(204, TERRACE), r: 5, dy: 3, text: "Annie: Chalo, Kinan! (Let's go!) Smile for the photo booth!" },
    { pos: W(248, T0), r: 6, text: 'Big Bro Shad: Crates in the way, bud! Press ACTION to KICK them. Black belt style!' },
    { pos: W(288, T0), r: 5, text: 'GRANDPA: Slow down, kid! In my day birthdays came once a year. ...Huh. They still do.' },
    { pos: W(304, T0), r: 4, text: 'Kinan! Glitchy needs your help! KICK all five fuses and the festival fireworks go up!' },
    { pos: W(309, T0), r: 3, text: 'Stand by the fuse and press ACTION to KICK it!' },
    { pos: W(315, T0), r: 2.5, text: 'Ride the balloon raft across the water.' },
    { pos: W(352, T0), r: 3, text: 'The balloon lift goes all the way up to the pier. Hop on!' },
  ],
  goal: { pos: W(GOAL_S, T0), r: 2.6, yaw: 0, ring: 3, ringY: 3.6, locked: true },

  // ===================================================================== the finale (js/finale.js)
  setup(game) {
    const at = (s, y, off) => [...W(s, y, off), FACE(s)];
    setupFestival(game, {
      along: {
        mom: at(26, T0, 3.2), grandmas: at(50, T0, 3.2), dad: at(108, T0, 3.2), chenoa: at(165, T0, 3.2),
        annie: at(203, TERRACE, 3.0), shad: at(252, T0, 3.2), grandpa: at(289, T0, 3.2),
      },
      party: {
        mom: at(GOAL_S - 4.5, T0, 1.4), dad: at(GOAL_S - 7.6, T0, 2.6), chenoa: at(GOAL_S - 10.8, T0, 3.8), annie: at(GOAL_S - 13.8, T0, 4.8),
        grandmas: at(GOAL_S + 6, T0, 1.6), grandpa: at(GOAL_S + 10.6, T0, 2.8), shad: at(GOAL_S + 14, T0, 4),
      },
      kinan: W(GOAL_S, T0, 0),
      fuses: FUSE_AT.map(([s, y]) => ({ pos: W(s, y), yaw: FACE(s) })),
      cake: [...W(GOAL_S, T0, 5.4), FACE(GOAL_S)],
      shots: {
        toCam: [0, 0, -1],
        party: { pos: W(GOAL_S, 7.5, -25), look: W(GOAL_S, 7, 12) },
        cake: { pos: W(GOAL_S, 5.6, -8.5), look: W(GOAL_S, 3.2, 5) },
        sky: {
          pos: W(GOAL_S + 22, 3, -24), look: W(GOAL_S - 42, 27, 66),
          at: W(GOAL_S - 38, 36, 70), spread: [120, 24, 60],
          from: [W(GOAL_S - 30, 1, 30), W(GOAL_S, 1, 26), W(GOAL_S + 30, 1, 30), W(GOAL_S - 60, -2, 26)],
        },
      },
    });
  },
  finale(game) { playFinale(game); },
};

export default L;

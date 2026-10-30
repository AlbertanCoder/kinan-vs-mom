// =====================================================================================
//  WORLD 12-3 (2.5D TEST)  ·  THE RIVER VALLEY  ·  "the river valley trail, side-on"
// =====================================================================================
// A TEST ONLY (2026-10-29): the same place, story and art as 12-3 (levels/12-3.js, which stays the free-3D level),
// rebuilt as a 2.5D side-scroller so Shad can play both and compare. Not on the map, not published.
// Open it with  3d/level-12-1.html?level=12-3-side
// Kinan runs RIGHT along one path down the east bank of the South Saskatchewan, from the parkway to the riverside
// flats; the camera watches from the land side, so the river, the bridges, the Bessborough and downtown are behind him.
// Everything is placed by s = distance along the path (0 = start, about 395 = the end) and off = how far behind the
// path line (away from the camera; negative = toward it). The path turns twice (25 degrees each) so the camera swings.
//   s   0-100  the parkway (top terrace): candles, a sock, the leaf pile (secret ? box above it), the LOOKOUT TOWER
//   s 100-124  the trail ramp down to the first trail
//   s 130      first corner (toward the river)
//   s 152-166  the ravine: jump the stepping pillar, or fall in and WALL JUMP out (rocks + Ginger's paw prints help)
//   s 192-200  the big step: LEDGE GRAB
//   s 206-232  the MUD SLIDE down to the second trail
//   s 250      second corner (back along the river)
//   s 258-270  the GLOWING CAVE (secret: walk back left after the drop)
//   s 282-305  STACK THE BLOCKS: the golden candle on the clay ledge
//   s 332-366  the river: rocks and the floating log (LOG ROLL golden candle over the water)
//   s 366-395  the island: the pelican finishes the level
import { CITY, CITY_TEXTURES, titleCard } from '../js/props-city.js';

const T0 = 0, T1 = -8, T2 = -16, T3 = -24, WATER = -28.2, ISLE = -26.6, RAV = -18;
const TURN = 25 * Math.PI / 180;
const P1 = [60, -40], P2 = [60 - 120 * Math.cos(TURN), -40 + 120 * Math.sin(TURN)];
// heading west (-x): the camera sits on the land side (-z) looking toward the river (+z)
const PATH = [[190, -40], P1, P2, [P2[0] - 145, P2[1]]];

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
const XZ = (s) => { const p = W(s); return [p[0], p[2]]; };
const FACE = (s) => segAt(s).yaw;                                                          // a prop facing the camera
const FWD = (s) => { const g = segAt(s); return Math.atan2(g.tx, g.tz) * 180 / Math.PI; };  // Kinan facing right (forward)
const BACK = (s) => { const g = segAt(s); return Math.atan2(-g.tx, -g.tz) * 180 / Math.PI; }; // a prop facing left (back down the path)
// a camera zone (world box) round the path from s0 to s1, for Kinan's feet between y0 and y1
const zoneAt = (s0, s1, y0, y1, o) => {
  const ps = [W(s0, 0, -20), W(s0, 0, 14), W(s1, 0, -20), W(s1, 0, 14)], xs = ps.map((p) => p[0]), zs = ps.map((p) => p[2]);
  return { min: [Math.min(...xs), y0, Math.min(...zs)], max: [Math.max(...xs), y1, Math.max(...zs)], ...o };
};
const row = (s0, s1, n, y, off = 0) => Array.from({ length: n }, (_, i) => W(s0 + (s1 - s0) * (n === 1 ? 0 : i / (n - 1)), y, off));

// the trail's ground strip: 2.5 toward the camera (a cut-away, like the 2D game: the dirt shows in front), 12 behind.
// Rule for 2.5D: nothing on the path sticks out more than about 2.5 toward the camera, or (with the camera looking
// ahead) its front corner hides Kinan.
const FRONT = -2.5, BACKO = 12, SPLIT = 3;
const TS = 64, TOP = 22;                          // the lookout tower (s) and its top deck
const DECKS = [[-4, 4], [4, 7], [-4, 10], [4, 13], [-4, 16], [4, 19]];   // [s from the tower centre, top]: zig-zag up its front
const LEDGE = { s0: 192, s1: 200, top: T1 + 5 };  // the big step (a plain jump falls short; Kinan grabs the edge)
const SHELF = { s0: 299, s1: 303, top: T3 + 8.2 }; // the clay ledge with golden candle 1 (two stacked blocks + a jump)
const slideY = (s) => T1 + (s - 206) * (T2 - T1) / 26;

const L = {
  id: '12-3-side',
  title: 'THE RIVER VALLEY (2.5D TEST)',
  subtitle: 'the river valley trail, side-on',
  cardText: 'Run down to the river, side-on!',
  clearText: 'A pelican! Hop on: next stop, the weir rapids!',
  intro: 'The river valley, side-on! Run RIGHT down the trail to the river. A pelican is waiting on the island.',
  helpAfter: 5,
  assets: { kinan: '../worlds/w12_assets/kinan.glb', glitchy: '../worlds/w12_assets/glitchy.glb', pets: '../worlds/w12_assets/pet_{id}.glb' },
  props: CITY,
  textures: CITY_TEXTURES,
  killY: -30.4,
  sky: { top: '#3a86e0', mid: '#8ccaf5', horizon: '#fde8c6', fog: '#f4e4c8', fogNear: 170, fogFar: 680 },
  light: { sky: '#e8f4ff', ground: '#f4dcc0', hemi: 0.74, sun: '#fff0d0', sunI: 2.6, dir: [26, 52, -30], shadowSize: 30, env: 0.4 },
  exposure: 0.92,
  // ---- 2.5D side mode (see js/side.js)
  side: { path: PATH, dist: 17, height: 2.2, pitch: 0.15, lookAhead: 3.5, round: 9 },
  spawn: { pos: W(4, T0), yaw: FWD(4) },
  zoneOf: () => 'o',
  camZones: [
    // the lookout tower: back off and look higher so the decks above stay in view
    { min: [190 - TS - 10, 1.5, -60], max: [190 - TS + 10, 40, -20], dist: 22, pitch: 0.2, height: 3.4 },
    // down in the ravine: look down into it from above the cliff tops (not from inside the pit)
    zoneAt(151, 167, RAV - 2, RAV + 6.5, { dist: 18, pitch: 0.4, height: 2.4 }),
  ],

  // ===================================================================== static scenery
  build(b) {
    titleCard(L);
    const inSeg = (s, fn) => { const g = segAt(s); b.push(g.x0, 0, g.z0, g.yaw); fn(g); b.pop(); };
    // a box in path terms: s0..s1 along, y0..y1, offA..offB across (offA = the camera side)
    const slab = (s0, s1, y0, y1, offA, offB, color, o = {}) => inSeg((s0 + s1) / 2, (g) => b.box((s0 + s1) / 2 - g.s0, y0, -(offA + offB) / 2, s1 - s0, y1 - y0, offB - offA, color, o));
    const topTex = (tex, s0, s1, y, offA, offB, scale = 8) => inSeg((s0 + s1) / 2, (g) => b.texQuad(tex, s0 - g.s0, -offB, s1 - g.s0, -offA, y, scale));
    const face = (s0, s1, y0, y1, offA) => inSeg((s0 + s1) / 2, (g) => b._wallFace('clay', s0 - g.s0, s1 - g.s0, y0, y1, -offA + 0.03, 1, 6, 0));
    const turnAt = (c) => { const i = SEGS.findIndex((g) => Math.abs(g.s0 - c) < 1e-6); return SEGS[i - 1].tx * SEGS[i].tz - SEGS[i - 1].tz * SEGS[i].tx; };
    const TH = Math.tan(TURN / 2);
    // the trail's ground from s0 to s1 with its top at y1: split at corners; on the outside of a turn each piece runs
    // just far enough past the corner to close the gap (in two strips, so nothing pokes out on the inside)
    const ground = (s0, s1, y1, color, o = {}) => {
      const base = o.base ?? -32, tex = o.tex === undefined ? 'leafGrass' : o.tex;
      const cuts = [s0, ...CORNERS.filter((c) => c > s0 + 0.01 && c < s1 - 0.01), s1];
      for (let i = 0; i < cuts.length - 1; i++) {
        const a = cuts[i], e = cuts[i + 1];
        inSeg((a + e) / 2, (g) => {
          for (const [oA, oB] of [[FRONT, SPLIT], [SPLIT, BACKO]]) {
            const reach = oA < 0 ? -oA : oB;
            const outside = (c) => (turnAt(c) < 0) === (oA < 0);   // turning away from the camera opens a gap at the front
            const x0 = a - g.s0 - (i > 0 && outside(a) ? reach * TH + 0.3 : 0);
            const x1 = e - g.s0 + (i < cuts.length - 2 && outside(e) ? reach * TH + 0.3 : 0);
            b.box((x0 + x1) / 2, base, -(oA + oB) / 2, x1 - x0, y1 - base, oB - oA, color, { r: 0.05, cast: false, ...(o.box || {}) });
            if (tex) b.texQuad(tex, x0, -oB, x1, -oA, y1 + 0.012 + i * 0.003, 8);
            if (oA < 0) b._wallFace('clay', x0, x1, Math.max(base, y1 - 26), y1, -oA + 0.03, 1, 6, 0);
          }
        });
      }
    };
    // a ramp along the path from (sHi, yHi) down to (sLo, yLo)
    const ramp = (sHi, yHi, sLo, yLo, color, o = {}, tex = 'trail') => inSeg((sHi + sLo) / 2, (g) => {
      const zc = -(FRONT + BACKO) / 2, w = BACKO - FRONT;
      b.ramp(sLo - g.s0, zc, yLo, sHi - g.s0, zc, yHi, w, color, { base: -32, ...o });
      if (tex) b.texSlope(tex, sLo - g.s0, zc, yLo + 0.02, sHi - g.s0, zc, yHi + 0.02, w - 0.2, 6);
    });
    const trail = (s0, s1, y) => topTex('trail', s0, s1, y + 0.02, -1.7, 1.7, 6);
    // a clay face across the path at s (dir +1 faces forward, -1 faces back): the walls of the ravine and the big step
    const endFace = (s, y0, y1, dir, offA = FRONT, offB = BACKO) => inSeg(s, (g) => {
      b.push(s - g.s0, 0, 0, dir > 0 ? 90 : -90);
      b._wallFace('clay', dir > 0 ? offA : -offB, dir > 0 ? offB : -offA, y0, y1, 0.03, 1, 6, 0);
      b.pop();
    });

    // ---------- the trail, start to end
    ground(-8, 100, T0, '#7cbf45');                       // the parkway (top terrace)
    trail(-8, 100, T0);
    ramp(100, T0, 124, T1, '#d8b98a');                    // the trail ramp down the bank
    ground(124, 152, T1, '#86c25a');                      // first trail (round the first corner)
    trail(124, 129.5, T1); trail(130.5, 152, T1);
    // the ravine: two shafts either side of a stepping pillar, a rock at the foot of each wall
    ground(152, 166, RAV, '#8a6a4a', { tex: null });
    slab(157, 161, RAV, -9, -2, 6, '#c9975a', { r: 0.2 }); face(157, 161, RAV, -9, -2); topTex('leafGrass', 157, 161, -9 + 0.012, -2, 6);
    slab(152, 154.4, RAV, RAV + 3, -2, 5, '#b8ae9c', { r: 0.5 }); slab(163.6, 166, RAV, RAV + 3, -2, 5, '#b8ae9c', { r: 0.5 });
    endFace(152, RAV, T1, 1); endFace(166, RAV, T1, -1); endFace(157, RAV, -9, -1, -2, 6); endFace(161, RAV, -9, 1, -2, 6);
    ground(166, 206, T1, '#86c25a');                      // first trail continues
    trail(166, 206, T1);
    slab(LEDGE.s0, LEDGE.s1, T1, LEDGE.top, -2.2, 6, '#c9975a', { r: 0.25 });   // the big step (ledge grab)
    face(LEDGE.s0, LEDGE.s1, T1, LEDGE.top, -2.2); topTex('leafGrass', LEDGE.s0, LEDGE.s1, LEDGE.top + 0.012, -2.2, 6);
    endFace(LEDGE.s0, T1, LEDGE.top, -1, -2.2, 6); endFace(LEDGE.s1, T1, LEDGE.top, 1, -2.2, 6);
    ramp(206, T1, 232, T2, '#8a6a4a', { phys: { slide: true } }, 'clay');   // the MUD SLIDE
    ground(232, 258, T2, '#8cc456');                      // second trail (round the second corner)
    trail(232, 249.5, T2); trail(250.5, 258, T2);
    // the glowing cave: the second trail's last stretch is hollow underneath, open toward the camera (a cut-away)
    slab(258, 270, -20, T2, FRONT, BACKO, '#8cc456', { r: 0.05, cast: false }); topTex('leafGrass', 258, 270, T2 + 0.012, FRONT, BACKO); trail(258, 270, T2);
    face(258, 270, -20, T2, FRONT);
    slab(258, 270, -32, -20, 2.6, BACKO, '#8cc456', { r: 0.05, cast: false });
    slab(258, 258.6, T3, -20, -3, 2.6, '#00ffd0', { mat: 'glow', r: 0.1 });       // the shimmering wall at the back
    face(258.6, 270, T3, -20, 2.6);
    for (const s of [260, 263.5, 267]) for (const off of [-2.6, 2.4]) b.box(...W(s, -20.6, off), 0.25, 0.25, 0.25, '#7be3ff', { col: false, mat: 'glow' });
    endFace(270, -20, T2, 1);
    ground(258, 322, T3, '#92c95e');                      // the riverside flats
    trail(270, 322, T3);
    // the clay pillar with its ledge sticking out over the path (golden candle 1)
    slab(SHELF.s0 - 0.5, SHELF.s1 + 0.5, T3, SHELF.top - 0.4, 2.3, 6.6, '#d4a86a', { r: 0.4 });
    face(SHELF.s0 - 0.5, SHELF.s1 + 0.5, T3, SHELF.top - 0.4, 2.3);
    slab(SHELF.s0, SHELF.s1, SHELF.top - 0.8, SHELF.top, -1.8, 6.6, '#c28e55', { r: 0.25 });
    topTex('leafGrass', SHELF.s0, SHELF.s1, SHELF.top + 0.012, -1.8, 6.6);
    ramp(322, T3, 332, -26.9, '#ead9a6', {}, 'sand');     // down the beach to the water
    ground(366, 400, ISLE, '#ead9a6', { tex: 'sand' });   // the island

    // ---------- the lookout tower (golden candle 0 on the top deck)
    const tw = '#a8754a', tw2 = '#8d5a33';
    slab(TS - 2.25, TS + 2.25, T0, TOP - 0.6, 1.2, 5.7, tw, { r: 0.12 });                            // the core (behind the path)
    for (let y = 2; y < TOP - 1; y += 4) slab(TS - 2.35, TS + 2.35, y, y + 0.35, 1.0, 1.25, tw2, { col: false, r: 0.05 });
    slab(TS - 6.3, TS - 1.7, T0, DECKS[0][1], -1.7, 1.7, '#b8835a', { r: 0.1 });                        // the lowest deck stands on the ground
    topTex('deck', TS - 6.3, TS - 1.7, DECKS[0][1] + 0.015, -1.7, 1.7, 4);
    for (const [ds, top] of DECKS.slice(1)) {
      slab(TS + ds - 2.3, TS + ds + 2.3, top - 0.6, top, -1.7, 1.7, '#c48f63', { r: 0.1 });
      topTex('deck', TS + ds - 2.3, TS + ds + 2.3, top + 0.015, -1.7, 1.7, 4);
      for (const e of [-1.9, 1.9]) slab(TS + ds + e - 0.17, TS + ds + e + 0.17, top - 3.6, top - 0.6, -1.5, -1.16, tw2, { col: false, r: 0.06 });
    }
    slab(TS - 3.5, TS + 3.5, TOP - 0.6, TOP, -1.7, 5.7, '#c48f63', { r: 0.1 });
    topTex('deck', TS - 3.5, TS + 3.5, TOP + 0.015, -1.7, 5.7, 4);
    for (const ds of [-3.1, 3.1]) for (const off of [-1.4, 5.4]) b.cyl(...W(TS + ds, TOP, off), 0.28, 4.6, '#f7f3ea', { seg: 8 });
    b.cone(...W(TS, TOP + 4.6, 2), 5.6, 3.6, '#2fb5a8', { seg: 4, yaw: 45 + FACE(TS), col: false });
    b.box(...W(TS, TOP + 8.1, 2), 0.16, 1.8, 0.16, '#f6c445', { col: false });

    // ---------- the valley behind the trail: lower terraces, the flats, the beach, the river
    b.box(133, -32, -21, 134, T1 + 32, 14, '#86c25a', { col: false, r: 0, cast: false }); b.texQuad('leafGrass', 66, -28, 200, -14, T1 + 0.012, 8);
    b.box(125, -32, -7, 150, T2 + 32, 14, '#8cc456', { col: false, r: 0, cast: false }); b.texQuad('leafGrass', 50, -14, 200, 0, T2 + 0.012, 8);
    b.box(42, -32, -33, 326, T3 + 32, 134, '#92c95e', { col: false, r: 0, cast: false }); b.texQuad('leafGrass', -121, -100, 205, 34, T3 + 0.012, 8);
    b.ramp(42, 42, WATER + 0.6, 42, 34, T3, 326, '#ead9a6', { base: -32, col: false, cast: false });
    b.texSlope('sand', 42, 42, WATER + 0.62, 42, 34, T3 + 0.02, 326, 8);
    b.texQuad('water', -700, -100, 700, 520, WATER, 10);
    // the broken footbridge across the ravine (behind the path)
    slab(149, 155.5, T1 - 0.6, T1, 3.2, 7, '#b8835a', { col: false, r: 0.08 }); slab(162.5, 169, T1 - 0.6, T1, 3.2, 7, '#b8835a', { col: false, r: 0.08 });

    // ---------- far away: the Bessborough and downtown across the river, the bridges, the weir
    b.box(0, -40, 380, 1400, 26, 200, '#86c25a', { col: false, r: 0, cast: false });
    b.ramp(0, 270, WATER - 0.2, 0, 282, -14.1, 1400, '#d4a86a', { base: -40, col: false, cast: false });
    b.prop('bessborough', -30, -14, 300, 180, { s: 1.1 });
    for (const [x, z, w, h, c] of [[-120, 340, 18, 96, '#cfd6e2'], [-80, 360, 14, 72, '#e3dcd0'], [30, 350, 16, 108, '#b8c8dc'], [70, 330, 12, 64, '#dcd2c2'], [-10, 380, 20, 128, '#c4d0de'], [110, 370, 14, 84, '#e6e0d6'], [-160, 330, 16, 70, '#d6dce6']]) b.prop('tower', x, -14, z, 180, { w, d: w, h, color: c, spire: h > 100 });
    b.prop('archBridge', -170, WATER, 160, 90, { len: 240, arches: 8 });
    b.prop('trussBridge', 175, WATER, 160, 90, { len: 240, spans: 5, deck: 22 });
    for (let i = 0; i < 9; i++) b.box(230 + i * 0.5, WATER - 0.4, 60 + i * 22, 3, 1.0, 22, '#ffffff', { col: false, r: 0.4, mat: 'glow', cast: false });
  },

  // ===================================================================== props (data)
  place: [
    // ---------- the parkway
    ['mapBoard', ...W(8, T0, 4), FACE(8), { text: 'RIVER|VALLEY|TRAIL' }],
    ['sign', ...W(15, T0, 2.6), FACE(15), { text: 'TRAIL ->', w: 2.6, postH: 1.3 }],
    ['sign', ...W(TS - 13, T0, 2.6), FACE(TS), { text: 'LOOKOUT', w: 2.8, postH: 1.4 }],
    ['bench', ...W(36, T0, 3.2), FACE(36), {}], ['bench', ...W(90, T0, 3.2), FACE(90), {}],
    ['ladder', ...W(TS - 6.3, T0), BACK(TS), { h: DECKS[0][1], d: 0.4, color: '#c98b52' }],
    ...[[-4, 7], [2, 8], [22, 6.5], [44, 8.5], [80, 7], [97, 6]].map(([s, off], i) => ['aspen', ...W(s, T0, off), 0, { s: 1.0 + (i % 3) * 0.12, seed: i + 1 }]),
    ...[[28, 9], [56, 9.5], [84, 10]].map(([s, off], i) => ['elm', ...W(s, T0, off), 0, { s: 1.0, seed: 70 + i }]),
    ['pine', ...W(12, T0, 10), 0, { s: 1.1 }], ['bush', ...W(30, T0, 4.4), 0, { s: 0.9 }], ['bush', ...W(74, T0, 4.6), 0, { s: 0.8, flowers: '#ff5fa2' }],
    ['leafPile', ...W(48, T0), 0, { r: 1.6, seed: 2, bounce: 19 }],
    // ---------- the first trail: aspens, the broken footbridge, the picnic spot
    ...[[120, 7], [136, 6.5], [146, 9], [172, 7], [182, 9.5], [204, 7]].map(([s, off], i) => ['aspen', ...W(s, T1, off), 0, { s: 0.95 + (i % 3) * 0.1, seed: 20 + i }]),
    ['picnicTable', ...W(178, T1, 4.2), FACE(178), {}], ['bush', ...W(140, T1, 4.4), 0, { s: 1.0 }],
    ['sign', ...W(147.5, T1, 2.6), FACE(148), { text: 'BRIDGE|OUT!', w: 2.6, postH: 1.2 }],
    ['sign', ...W(202, T1, 2.6), FACE(202), { text: 'MUD|SLIDE!', w: 2.6, postH: 1.6 }],
    // ---------- the second trail and the flats
    ...[[236, 7], [246, 9], [262, 7.5], [276, 8], [290, 9.5], [312, 7], [320, 10]].map(([s, off], i) => ['aspen', ...W(s, s < 258 ? T2 : T3, off), 0, { s: 1.0 + (i % 2) * 0.12, seed: 40 + i }]),
    ['pine', ...W(242, T2, 10), 0, { s: 1.0 }], ['pine', ...W(296, T3, 10.5), 0, { s: 1.1 }],
    ['sign', ...W(272.5, T3, 2.6), FACE(272), { text: 'UNDER THE|RIVER?', w: 2.8, postH: 1.6 }],
    ['sign', ...W(279, T3, 2.6), FACE(279), { text: 'STACK|ME!', w: 2.2, postH: 1.2 }],
    ['rock', ...W(306, T3, 3.4), 0, { s: 1.2 }], ['log', ...W(286, T3, 4.6), 30, { len: 6 }], ['bench', ...W(316, T3, 3.2), FACE(316), {}],
    ['sign', ...W(325, T3 - 1, 2.8), FACE(325), { text: 'TO THE|ISLAND!', w: 2.8, postH: 1.3 }],
    // ---------- the river: stepping rocks, the island
    ['rockBig', ...W(336, -30.2), 0, { w: 3.8, h: 3.6, d: 3.6 }], ['rockBig', ...W(341.5, -30.2), 0, { w: 3.8, h: 3.6, d: 3.6 }],
    ['rockBig', ...W(362.5, -30.2), 0, { w: 3.8, h: 3.6, d: 3.6, color: '#b8ae9c' }],
    ['pelican', ...W(384, ISLE, 3.0), FACE(384), { s: 1.6, seed: 2 }],
    ['pelican', ...W(392, ISLE, 7), FACE(392) + 40, { s: 1.3, seed: 5 }],
    ['pelican', 0, 10, 120, 0, { fly: 40, seed: 1, speed: 0.2 }], ['pelican', -120, 18, 150, 0, { fly: 30, seed: 3, speed: 0.26 }],
    ['aspen', ...W(397, ISLE, 6), 0, { s: 1.1, seed: 81 }], ['pine', ...W(372, ISLE, 8), 0, { s: 1.0 }], ['bush', ...W(378, ISLE, 4.5), 0, {}],
    ['sign', ...W(389, ISLE, 2.8), FACE(389), { text: 'NEXT:|THE WEIR!', w: 2.8, postH: 1.3 }],
    ['cloud', -120, 90, 180, 0, { s: 1.8, seed: 1 }], ['cloud', 80, 110, 240, 0, { s: 2.2, seed: 2 }], ['cloud', 260, 100, 40, 0, { s: 2.0, seed: 3 }],
    ['cloud', -240, 105, 60, 0, { s: 2.1, seed: 6 }], ['cloud', 140, 95, 120, 0, { s: 1.7, seed: 4 }],
  ],

  // ===================================================================== collectibles
  candles: [
    ...row(8, 24, 5, T0 + 0.4), ...row(30, 42, 4, T0 + 0.4), ...row(46, 50, 2, T0 + 4.2),
    ...DECKS.map(([ds, top]) => W(TS + ds, top + 0.4)),
    ...row(76, 96, 5, T0 + 0.4), ...[104, 110, 116, 122].map((s) => W(s, T0 + (s - 100) * (T1 - T0) / 24 + 0.6)),
    ...row(126, 148, 6, T1 + 0.4),
    W(155.6, RAV + 4.5), W(155.6, RAV + 6.5), W(155.6, RAV + 8.5), W(159, -9 + 0.4),        // up the wall-jump shaft, the pillar
    ...row(168, 190, 5, T1 + 0.4), ...row(193.5, 198.5, 3, LEDGE.top + 0.4),
    ...[210, 215, 220, 225, 229].map((s) => W(s, slideY(s) + 0.9)),
    ...row(234, 256, 5, T2 + 0.4),
    ...row(260, 268, 3, T3 + 0.4),                                                            // in the glowing cave
    ...row(272, 279, 3, T3 + 0.4), W(282, T3 + 2.2), W(287.5, T3 + 2.2), W(292.5, T3 + 2.2),  // on the toy blocks
    ...row(297, 305, 3, T3 + 0.4), ...row(308, 320, 4, T3 + 0.4), W(326, -25 + 0.6), W(330, -26.4 + 0.6),
    W(336, ISLE + 1.4), W(341.5, ISLE + 1.4), W(349, ISLE + 1.6), W(355, ISLE + 1.6), W(362.5, ISLE + 1.4),
    ...row(368, 380, 4, ISLE + 0.4),
  ],
  goldenCandles: [
    { pos: W(TS, TOP + 1.7), name: 'LOOKOUT TOWER' },
    { pos: W((SHELF.s0 + SHELF.s1) / 2, SHELF.top + 1.7), name: 'STACK THE BLOCKS' },
    { pos: W(352, ISLE + 4.6), name: 'LOG ROLL' },
  ],
  boxes: [
    { kind: 'prize', pos: W(18, T0 + 3.6), item: 'popper' },
    { kind: 'prize', pos: W(TS + 2, TOP + 2.8), item: 'umbrella' },
    { kind: 'prize', pos: W(142, T1 + 3.6), item: 'lasso' },
    { kind: 'prize', pos: W(176, T1 + 3.6), candles: 5 },
    { kind: 'prize', pos: W(240, T2 + 3.6), item: 'hat' },
    { kind: 'prize', pos: W(312, T3 + 3.6), item: 'cake' },
    { kind: 'prize', pos: W(328, T3 + 2.6), item: 'heart' },
    // secrets: in the glowing cave, over the leaf pile on the parkway (bounce on it)
    { kind: 'prize', pos: W(263.5, T3 + 2.2), item: 'heart', hidden: true },
    { kind: 'prize', pos: W(48, T0 + 5.2), candles: 5, hidden: true },
    // the toy blocks for the clay ledge, a crate
    { kind: 'block', pos: W(282, T3), color: '#3f8fe8' },
    { kind: 'block', pos: W(287.5, T3), color: '#e8473c' },
    { kind: 'block', pos: W(292.5, T3), color: '#ffd23f' },
    { kind: 'crate', pos: W(310, T3), candles: 3 },
  ],
  pawSpots: [
    // Ginger's paw prints on the rock in the wall-jump shaft: KITTEN BOOST out of the ravine
    { pos: W(153.2, RAV + 3), r: 1.1, boost: 24 },
  ],
  poundBoxes: [
    { pos: W(186, T1), candles: 6, color: '#e8473c', message: 'PICNIC BASKET!' },
  ],

  // ===================================================================== enemies, pets, movers
  enemies: [
    { type: 'sock', tier: 'dumb', pos: W(34, T0), patrol: [XZ(28), XZ(42)] },
    { type: 'brick', tier: 'alert', pos: W(86, T0), patrol: [XZ(78), XZ(96)], sight: 8 },
    { type: 'sock', tier: 'alert', pos: W(144, T1), patrol: [XZ(136), XZ(150)], sight: 7 },
    { type: 'sock', tier: 'smart', pos: W(172, T1), ambush: true, ambushR: 4.5, color: '#f2b632' },
    { type: 'brick', tier: 'alert', pos: W(244, T2), patrol: [XZ(236), XZ(248)], color: '#3f8fe8', sight: 8 },
    { type: 'brick', tier: 'smart', pos: W(316, T3), patrol: [XZ(306), XZ(320)], color: '#9b6cff', sight: 8 },
    { type: 'sock', tier: 'dumb', pos: W(372, ISLE), patrol: [XZ(368), XZ(378)], color: '#d6f5ff' },
  ],
  pets: [{ type: 'cat' }, { type: 'dog' }],
  movers: [
    // the floating log between the stepping rocks (wait for it to drift into line)
    { type: 'lift', from: W(347.5, ISLE), to: W(356.5, ISLE), size: [6, 0.8, 3.0], period: 7, pause: 1.4, color: '#8a5a34', studs: false },
  ],
  checkpoints: [
    { pos: W(136, T1), yaw: FWD(136) },
    { pos: W(170, T1), yaw: FWD(170) },
    { pos: W(276, T3), yaw: FWD(276) },
    { pos: W(324, -24.6), yaw: FWD(324) },
  ],
  hints: [
    { pos: W(10, T0), r: 2.5, text: 'Look! The river, the bridges, and the Bessborough across the water. The pelicans are fishing below the weir.', cam: { pos: W(30, 14, -26), look: [-30, -10, 300], time: 3.2 } },
    { pos: W(TS - 11, T0), r: 3.5, text: 'The LOOKOUT TOWER! Push into the ladder and hold UP to climb, then hop up the decks. Best view in Saskatoon!' },
    { pos: W(149, T1), r: 3, text: 'A ravine! Hop across on the pillar. Fall in? Jump at a wall, then jump again to kick off it: WALL JUMP!' },
    { pos: W(155.5, RAV), r: 3, dy: 3, text: 'WALL JUMP out: jump at the wall, press JUMP again to kick off, back and forth. (Or climb the rock and DOUBLE JUMP.)' },
    { pos: W(184, T1), r: 3, text: 'A picnic basket! Jump on top and BUTT SLAM it (ACTION in the air).' },
    { pos: W(190, T1), r: 2, text: 'A big step! Jump at it: Kinan grabs the edge. Press JUMP (or keep pushing) to climb up.' },
    { pos: W(204, T1), r: 3, text: 'The MUD SLIDE! Hold on to your hat!' },
    { pos: W(265, T3), r: 3.5, dy: 3, text: 'A glowing cave... does it go UNDER THE RIVER? Not yet. Maybe someday!' },
    { pos: W(283, T3), r: 3, dy: 3, text: 'A golden candle up on the clay ledge, too high to reach... Stack the toy blocks next to it! ACTION lifts a block, ACTION again puts it down on another one.' },
    { pos: W(329, -26), r: 3, dy: 4, text: 'The river! Hop across the rocks and ride the floating log. Don\'t fall in!' },
    { pos: W(342, ISLE), r: 2.5, dy: 3, text: 'A golden candle over the water! Jump for it from the log!' },
    { pos: W(376, ISLE), r: 3, dy: 3, text: 'A pelican! It is waiting to fly you over the weir...' },
  ],
  goal: { pos: W(384, ISLE), r: 2.6, yaw: 0, ring: 2.9, ringY: 3.4 },
};

export default L;

// =====================================================================================
//  WORLD 12-3  ·  THE RIVER VALLEY TRAIL  ·  "winding 3D trails down to the river"
// =====================================================================================
// From the crescent at the top of the riverbank (where 12-2 ended) the trail zig-zags down the east bank of the
// South Saskatchewan: four terraces (the parkway on top, two trail tiers, the riverside flats) joined by switchback
// ramps, with the Bessborough, the bridges and downtown across the river. At the bottom: rocks and floating logs out
// to the island, where a pelican waits to take Kinan over the weir (12-4).
// Routes: the switchback trail (main), dropping off the cliffs (quick), the MUD SLIDE down the ravine (whee),
//         Ginger's paw prints at the foot of each cliff boost Kinan back UP a terrace.
// Golden candles: 0 LOOKOUT TOWER (ladder + decks spiralling up), 1 STACK THE BLOCKS (the clay pillar on the flats:
//                 stack the toy blocks to reach it), 2 LOG ROLL (ride a floating log out to the sandbar rock).
// Secrets: the glowing cave in the bottom cliff ("under the river?"), a hidden ? box over the leaf pile on the parkway,
//          a picnic basket toy box at the far west end of the first trail.
// Coordinates: x = along the river (east +), z = toward the river (+). Terrace tops: 0, -8, -16, -24; the river at -28.
import { CITY, CITY_TEXTURES, titleCard } from '../js/props-city.js';

const ring = (cx, y, cz, r, n, a0 = 0) => Array.from({ length: n }, (_, i) => [cx + Math.cos(a0 + i / n * Math.PI * 2) * r, y, cz + Math.sin(a0 + i / n * Math.PI * 2) * r]);
const line = (a, b, n) => Array.from({ length: n }, (_, i) => { const t = n === 1 ? 0 : i / (n - 1); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; });

const T0 = 0, T1 = -8, T2 = -16, T3 = -24, WATER = -28.2, ISLE = -26.6;
const Z01 = -44, Z12 = -24, Z23 = -4;           // cliff lines between the terraces
const RV = 5;                                    // the ravine (mud slide) is x -5..5
const SLIDE = { z0: -62, y0: 0, z1: -6, y1: -22.2 };
const slideY = (z) => SLIDE.y0 + (z - SLIDE.z0) * (SLIDE.y1 - SLIDE.y0) / (SLIDE.z1 - SLIDE.z0);
const TOWER = { x: 60, z: -56 };                 // the lookout tower on the top terrace
// tower decks round the core: [side dx, side dz, top y]
const DECKS = [[0, 4.6, 4], [4.6, 0, 7], [0, -4.6, 10], [-4.6, 0, 13], [0, 4.6, 16], [4.6, 0, 19]];
const TOP = 22;
// the clay pillar (golden candle 1): from the ground even a double jump + ledge grab falls short; two stacked blocks + a plain
// jump reach the edge (Kinan grabs it), or one block + a double jump started a step away from the pillar
const PILLAR = { x: -60, z: 16, top: T3 + 8 };

const L = {
  id: '12-3',
  title: 'THE RIVER VALLEY TRAIL',
  subtitle: 'winding 3D trails down to the river',
  cardText: 'Wind your way down to the river!',
  clearText: 'A pelican! Hop on: next stop, the weir rapids!',
  intro: 'The river valley! Follow the trail down to the river. A pelican is waiting on the island.',
  helpAfter: 5,
  assets: { kinan: '../worlds/w12_assets/kinan.glb', glitchy: '../worlds/w12_assets/glitchy.glb', pets: '../worlds/w12_assets/pet_{id}.glb' },
  props: CITY,
  textures: CITY_TEXTURES,
  killY: -30.4,                                  // the river
  sky: { top: '#3a86e0', mid: '#8ccaf5', horizon: '#fde8c6', fog: '#f4e4c8', fogNear: 170, fogFar: 680 },
  light: { sky: '#e8f4ff', ground: '#f4dcc0', hemi: 0.74, sun: '#fff0d0', sunI: 2.6, dir: [26, 52, 30], shadowSize: 34, env: 0.4 },
  exposure: 0.92,
  spawn: { pos: [-92, T0, -56], yaw: 90, camYaw: -100 },
  zoneOf: () => 'o',
  camDefaults: { dist: 15, pitch: 0.42, height: 1.6 },
  camZones: [
    // round the lookout tower: a little further out so the decks above and below stay in view
    { min: [TOWER.x - 9, 2, TOWER.z - 9], max: [TOWER.x + 9, 30, TOWER.z + 9], dist: 13, pitch: 0.36, height: 1.8 },
  ],

  // ===================================================================== static scenery
  build(b) {
    titleCard(L);
    const edge = { vis: false, phys: { noLedge: true, noWallJump: true } };
    const clay = '#c9975a';
    // ---------- the terraces (solid blocks; the ravine splits the upper three)
    const block = (x0, x1, z0, z1, y0, y1, top, tex) => {
      b.box((x0 + x1) / 2, y0, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0, top, { r: 0.05, cam: true, cast: false });
      if (tex) b.texQuad(tex, x0, z0, x1, z1, y1 + 0.012, 8);
    };
    block(-112, 112, -78, -62, -8, T0, '#7cbf45', 'leafGrass');                  // top terrace, north part (full width)
    for (const [x0, x1] of [[-112, -RV], [RV, 112]]) {
      block(x0, x1, -62, Z01, -8, T0, '#7cbf45', 'leafGrass');
      block(x0, x1, Z01, Z12, -16, T1, '#86c25a', 'leafGrass');
      // the cave in the bottom cliff (secret): the second trail tier is split round a tunnel at x -83..-77
      if (x0 < 0) {
        block(-112, -83, Z12, Z23, -24, T2, '#8cc456', 'leafGrass');
        block(-77, -RV, Z12, Z23, -24, T2, '#8cc456', 'leafGrass');
        block(-83, -77, Z12, -16, -24, T2, '#8cc456', 'leafGrass');
        block(-83, -77, -16, Z23, -20, T2, '#8cc456', 'leafGrass');
      } else block(x0, x1, Z12, Z23, -24, T2, '#8cc456', 'leafGrass');
    }
    block(-112, 112, -78, 30, -32, T3, '#92c95e', null);                         // the riverside flats (and the base under everything)
    b.texQuad('leafGrass', -112, Z23, 112, 30, T3 + 0.012, 8);
    // clay cliff faces (south faces of the upper terraces, the ravine walls)
    const face = (x0, x1, y0, y1, z, yaw) => { b.push(0, 0, z, yaw); b._wallFace('clay', x0, x1, y0, y1, 0.03, 1, 6, 0); b.pop(); };
    for (const [x0, x1] of [[-112, -RV], [RV, 112]]) { face(x0, x1, T1, T0, Z01, 0); face(x0, x1, T2, T1, Z12, 0); }
    face(-112, -83, T3, T2, Z23, 0); face(-77, -RV, T3, T2, Z23, 0); face(-83, -77, -20, T2, Z23, 0); face(RV, 112, T3, T2, Z23, 0);   // (leaves the cave mouth open)
    for (const [z0, z1, y0, y1] of [[-62, Z01, -8, T0], [Z01, Z12, -16, T1], [Z12, Z23, -24, T2]]) {
      b.push(RV, 0, 0, -90); b._wallFace('clay', z0, z1, y0, y1, 0.03, 1, 6, 0); b.pop();
      b.push(-RV, 0, 0, 90); b._wallFace('clay', -z1, -z0, y0, y1, 0.03, 1, 6, 0); b.pop();
    }
    // the crescent road along the top, the beach, the river
    b.texQuad('asphalt', -112, -78, 112, -68, T0 + 0.025, 14);
    b.texQuad('path', -112, -68, 112, -65.5, T0 + 0.03, 3);
    b.ramp(0, 40, -27.6, 0, 30, T3, 224, '#ead9a6', { base: -32, cam: true });
    b.texSlope('sand', 0, 40, -27.58, 0, 30, T3 + 0.02, 224, 8);
    b.texQuad('water', -700, 38, 700, 520, WATER, 10);
    // trail strips on each terrace (and the switchback ramps)
    b.texQuad('trail', -112, -58, 112, -54, T0 + 0.02, 6);
    b.texQuad('trail', -112, -32.5, 112, -27.5, T1 + 0.02, 6);
    b.texQuad('trail', -112, -12.5, 112, -7.5, T2 + 0.02, 6);
    b.texQuad('trail', -112, 6, 112, 11, T3 + 0.02, 6);
    // switchback ramps (they hug the cliff below each terrace edge)
    const sw = (xHi, xLo, z, yHi, yLo) => {
      b.ramp(xLo, z, yLo, xHi, z, yHi, 4.6, '#d8b98a', { base: yLo, cam: true });
      b.texSlope('trail', xLo, z, yLo + 0.02, xHi, z, yHi + 0.02, 4.4, 6);
    };
    sw(98, 66, Z01 + 2.3, T0, T1);        // top -> first trail (east end)
    sw(-66, -98, Z12 + 2.3, T1, T2);      // first -> second trail (west end)
    sw(66, 98, Z23 + 2.3, T2, T3);        // second trail -> the flats (east end)
    // ---------- the MUD SLIDE down the ravine, ending in a hop onto a big leaf pile
    b.ramp(0, SLIDE.z1, SLIDE.y1, 0, SLIDE.z0, SLIDE.y0, RV * 2, '#8a6a4a', { base: -32, cam: true, phys: { slide: true } });
    b.texSlope('clay', 0, SLIDE.z1, SLIDE.y1 + 0.02, 0, SLIDE.z0, SLIDE.y0 + 0.02, RV * 2 - 0.2, 4);
    // footbridges across the ravine: top terrace (whole), first trail (broken in the middle), second trail (planks)
    const bridge = (z, y, gap) => {
      const halves = gap ? [[-RV - 0.6, -gap / 2], [gap / 2, RV + 0.6]] : [[-RV - 0.6, RV + 0.6]];
      for (const [x0, x1] of halves) {
        b.box((x0 + x1) / 2, y - 0.6, z, x1 - x0, 0.6, 4.2, '#b8835a', { r: 0.08 });
        b.texQuad('deck', x0, z - 2.1, x1, z + 2.1, y + 0.015, 4);
        for (const sz of [-1, 1]) b.box((x0 + x1) / 2, y, z + sz * 2.0, x1 - x0, 1.6, 0.25, '#8d5a33', { r: 0.06, phys: { noWallJump: true } });
      }
    };
    bridge(-52, T0, 0); bridge(-30, T1, 3.6); bridge(-10, T2, 0);   // each sits 2.5+ above the slide so Kinan whooshes under it
    // the glowing cave (secret): a tunnel into the bottom cliff that ends at a shimmering wall
    b.box(-80, T3, -15.6, 6, 4, 0.6, '#00ffd0', { mat: 'glow', r: 0.1 });
    for (const z of [-13, -9, -5.5]) for (const sx of [-1, 1]) b.box(-80 + sx * 2.85, T3 + 0.4, z, 0.25, 0.25, 0.25, '#7be3ff', { col: false, mat: 'glow' });
    b.box(-80, T3 - 0.02, -10, 6, 0.04, 11.8, '#3a5a74', { col: false, r: 0 });
    // ---------- the lookout tower (golden candle 0 on the top deck)
    const tw = '#a8754a', tw2 = '#8d5a33';
    b.box(TOWER.x, T0, TOWER.z, 4.5, TOP - 0.6, 4.5, tw, { r: 0.12, cam: true });
    for (let y = 2; y < TOP - 1; y += 4) for (const [dx, dz, w, d] of [[0, 2.3, 4.7, 0.3], [0, -2.3, 4.7, 0.3], [2.3, 0, 0.3, 4.7], [-2.3, 0, 0.3, 4.7]]) b.box(TOWER.x + dx, y, TOWER.z + dz, w, 0.35, d, tw2, { col: false, r: 0.05 });
    for (const [dx, dz, top] of DECKS) {
      b.box(TOWER.x + dx, top - 0.6, TOWER.z + dz, 5.4, 0.6, 5.4, '#c48f63', { r: 0.1 });
      b.texQuad('deck', TOWER.x + dx - 2.6, TOWER.z + dz - 2.6, TOWER.x + dx + 2.6, TOWER.z + dz + 2.6, top + 0.015, 4);
      for (const sx of [-1, 1]) b.box(TOWER.x + dx + (dz ? sx * 2.1 : dx > 0 ? 2.1 : -2.1), top - 3.6, TOWER.z + dz + (dx ? sx * 2.1 : dz > 0 ? 2.1 : -2.1), 0.35, 3.0, 0.35, tw2, { col: false, r: 0.06 });
    }
    b.box(TOWER.x, TOP - 0.6, TOWER.z, 7, 0.6, 7, '#c48f63', { r: 0.1 });
    b.texQuad('deck', TOWER.x - 3.4, TOWER.z - 3.4, TOWER.x + 3.4, TOWER.z + 3.4, TOP + 0.015, 4);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.cyl(TOWER.x + sx * 3.1, TOP, TOWER.z + sz * 3.1, 0.28, 4.6, '#f7f3ea', { col: true, seg: 8 });
    b.cone(TOWER.x, TOP + 4.6, TOWER.z, 5.6, 3.6, '#2fb5a8', { seg: 4, yaw: 45, col: false });
    b.box(TOWER.x, TOP + 8.1, TOWER.z, 0.16, 1.8, 0.16, '#f6c445', { col: false });
    // ---------- the clay pillar on the flats (golden candle 1 on top)
    b.box(PILLAR.x, T3, PILLAR.z, 4.2, PILLAR.top - T3, 4.2, '#d4a86a', { r: 0.5, cam: true });
    b.box(PILLAR.x + 0.3, PILLAR.top - 0.3, PILLAR.z - 0.2, 4.6, 0.6, 4.4, '#c28e55', { col: false, r: 0.3 });
    b.push(PILLAR.x, 0, PILLAR.z + 2.13, 0); b._wallFace('clay', -2, 2, T3 + 0.3, PILLAR.top - 0.3, 0.02, 1, 6, 0); b.pop();
    // ---------- the island, its dock and the river rocks
    b.box(40, -32, 74, 52, -26.6 + 32, 20, '#ead9a6', { r: 0.8, cam: true });
    b.texQuad('sand', 14.6, 64.6, 65.4, 83.4, ISLE + 0.015, 8);
    // ---------- invisible walls
    b.box(-112.5, -40, -20, 1, 90, 210, null, edge); b.box(112.5, -40, -20, 1, 90, 210, null, edge);
    b.box(0, -40, -78.5, 226, 90, 1, null, edge);
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
    // ---------- top terrace: the trail head, benches, the railing along the edge (gaps at the ramp and Ginger's paw prints)
    ['mapBoard', -84, T0, -59.5, 0, { text: 'RIVER|VALLEY|TRAIL' }],
    ['sign', -78, T0, -60.2, 0, { text: 'TRAIL ->', w: 2.6, postH: 1.3 }],
    ['sign', -7.6, T0, -63.6, 0, { text: 'MUD|SLIDE!', w: 2.6, postH: 1.6 }],
    ['sign', 52, T0, -48.5, 0, { text: 'LOOKOUT', w: 2.8, postH: 1.4 }],
    ['bench', -60, T0, -46.5, 180, {}], ['bench', 24, T0, -46.5, 180, {}], ['bench', -20, T0, -66, 0, {}],
    ['railing', -112, T0, Z01 - 0.4, 0, { len: 69 }], ['railing', -37, T0, Z01 - 0.4, 0, { len: 32 }],
    ['railing', RV, T0, Z01 - 0.4, 0, { len: 87 }], ['railing', 100, T0, Z01 - 0.4, 0, { len: 12 }],
    ['ladder', TOWER.x, T0, TOWER.z + 6.9, 0, { h: DECKS[0][2], d: 0.5, color: '#c98b52' }],
    ...[-100, -68, -30, 18, 38, 80, 104].map((x, i) => ['aspen', x, T0, -71.5, 0, { s: 1.0 + (i % 3) * 0.12, seed: i + 1 }]),
    ...[[-50, -60], [-14, -56.5], [30, -61], [86, -58]].map(([x, z], i) => ['elm', x, T0, z, 0, { s: 1.0, seed: 70 + i }]),
    ['pine', -100, T0, -47.5, 0, { s: 1.1 }], ['pine', 90, T0, -47, 0, { s: 1.0 }],
    ['leafPile', -40, T0, -60, 0, { r: 2.0, seed: 2 }],
    // ---------- first trail: an aspen grove, a picnic spot at the far west end (the PICNIC BASKET toy box)
    ...[[-90, -40], [-84, -27], [-70, -41], [-50, -27], [-28, -41.5], [-16, -27], [20, -41], [36, -27], [52, -40], [80, -27], [96, -38]].map(([x, z], i) => ['aspen', x, T1, z, 0, { s: 0.95 + (i % 3) * 0.1, seed: 20 + i }]),
    ['picnicTable', -100, T1, -30, 0, {}], ['bush', -108, T1, -38, 0, { s: 1.2 }], ['bush', -106, T1, -42.5, 0, { s: 1.0, flowers: '#ff5fa2' }],
    ['leafPile', -30, T1, -30, 0, { r: 2.4, seed: 4 }],
    ['sign', 64, T1, -40, 90, { text: '<- TRAIL', w: 2.6, postH: 1.2 }],
    ['sign', -10, T1, -38.2, 90, { text: 'BRIDGE|OUT!', w: 2.6, postH: 1.2 }],
    // ---------- second trail
    ...[[-104, -6.5], [-60, -21], [-30, -6.5], [-14, -21], [24, -6.5], [44, -21], [78, -6.5], [100, -20]].map(([x, z], i) => ['aspen', x, T2, z, 0, { s: 1.0 + (i % 2) * 0.12, seed: 40 + i }]),
    ['pine', -46, T2, -20.5, 0, { s: 1.0 }], ['pine', 58, T2, -7, 0, { s: 1.1 }],
    ['leafPile', 34, T2, -9, 0, { r: 2.2, seed: 6 }],
    ['sign', -86, T2, -18, -90, { text: 'TRAIL ->', w: 2.6, postH: 1.2 }],
    // ---------- the riverside flats + the beach
    ...[[-104, 2], [-88, 24], [-70, 4], [-40, 26], [-20, 2], [6, 26], [60, 2], [90, 22], [104, 4]].map(([x, z], i) => ['aspen', x, T3, z, 0, { s: 1.1 + (i % 3) * 0.1, seed: 60 + i }]),
    ['leafPile', 0, T3, -1.6, 0, { r: 2.9, seed: 7, bounce: 21 }],
    ['rock', -30, T3, 16, 0, { s: 1.4 }], ['rock', 74, T3, 26, 0, { s: 1.2 }], ['log', 14, T3, 4, 30, { len: 7 }],
    ['bench', 50, T3, 6, 0, {}],
    ['sign', -66, T3, 11, 0, { text: 'STACK|ME!', w: 2.2, postH: 1.2 }],
    ['sign', -86.2, T3, -2.6, 0, { text: 'UNDER THE|RIVER?', w: 2.8, postH: 2.4 }],
    ['sign', 30, T3, 29, 0, { text: 'TO THE|ISLAND!', w: 2.8, postH: 1.3 }],
    // ---------- the river: stepping rocks to the island, the sandbar rock (golden candle 2)
    ['rockBig', 34, -30.2, 43.5, 0, { w: 3.8, h: 3.6, d: 3.6 }], ['rockBig', 34, -30.2, 49.5, 0, { w: 3.8, h: 3.6, d: 3.6 }],
    ['rockBig', 34, -30.2, 55.5, 0, { w: 3.8, h: 3.6, d: 3.6 }],
    ['rockBig', 61, -30.2, 49.5, 0, { w: 5.2, h: 3.6, d: 5.2, color: '#b8ae9c' }],
    ['pelican', 44, ISLE, 66, 160, { s: 1.6, seed: 2 }],
    ['pelican', 52, ISLE, 79, -40, { s: 1.3, seed: 5 }],
    ['pelican', 0, 10, 120, 0, { fly: 40, seed: 1, speed: 0.2 }], ['pelican', 40, 18, 160, 0, { fly: 30, seed: 3, speed: 0.26 }],
    ['aspen', 22, ISLE, 80, 0, { s: 1.1, seed: 81 }], ['pine', 60, ISLE, 80, 0, { s: 1.0 }], ['bush', 56, ISLE, 68, 0, {}],
    ['sign', 34, ISLE, 66.5, 0, { text: 'NEXT:|THE WEIR!', w: 2.8, postH: 1.3 }],
    // ---------- the crescent houses behind the top terrace (background)
    ...[-96, -60, -24, 12, 48, 84].map((x, i) => ['neighbor', x, 0, -96, 0, { color: ['#ffd9a8', '#d6e4ff', '#e3f0d0', '#ffd1e0', '#fff1b8', '#c9f2d6'][i], roof: ['#3f63a8', '#e8473c', '#5f6675', '#9b6cff', '#2fb5a8', '#e8473c'][i] }]),
    ['cloud', -120, 90, 180, 0, { s: 1.8, seed: 1 }], ['cloud', 80, 110, 240, 0, { s: 2.2, seed: 2 }], ['cloud', 260, 100, 40, 0, { s: 2.0, seed: 3 }],
    ['cloud', -240, 105, 60, 0, { s: 2.1, seed: 6 }], ['cloud', 20, 120, -160, 0, { s: 1.7, seed: 4 }],
  ],

  // ===================================================================== collectibles
  candles: [
    // top terrace trail + the tower decks
    ...line([-82, 0.4, -56], [-20, 0.4, -56], 6), ...line([16, 0.4, -56], [46, 0.4, -56], 4), ...line([80, 0.4, -50], [96, 0.4, -47], 3),
    ...DECKS.map(([dx, dz, top]) => [TOWER.x + dx * 1.15, top + 0.4, TOWER.z + dz * 1.15]),
    // the mud slide (a candle trail down the chute) and the leaf-pile jump at the bottom
    ...[-58, -50, -42, -34, -26, -18, -11].map((z) => [0, slideY(z) + 0.9, z]),
    [0, -21.2, 3.5], [0, -19.2, 6.5], [0, -18.6, 12], [0, -20.2, 15.5],
    // first trail (with the broken bridge)
    ...line([64, -7.6, -30], [10, -7.6, -30], 6), [-0.2, -5.2, -30], ...line([-10, -7.6, -30], [-62, -7.6, -30], 6), ...ring(-100, -7.6, -34, 3, 5),
    // second trail
    ...line([-90, -15.6, -10], [-10, -15.6, -10], 7), ...line([10, -15.6, -10], [62, -15.6, -10], 5),
    // the flats, the clay pillar, the cave, the beach and the river
    ...line([90, -23.6, 8.5], [40, -23.6, 8.5], 5), ...line([20, -23.6, 8.5], [-40, -23.6, 8.5], 5), ...ring(PILLAR.x, -23.6, PILLAR.z, 4.6, 6, 0.4),
    ...line([-80, -23.6, -5], [-80, -23.6, -13], 3),
    [34, -26.2, 43.5], [34, -26.2, 49.5], [34, -26.2, 55.5], ...line([40, -26.6 + 1.4, 49.5], [56, -26.6 + 1.4, 49.5], 3),
    ...ring(40, ISLE + 0.4, 74, 4, 6),
  ],
  goldenCandles: [
    { pos: [TOWER.x, TOP + 1.7, TOWER.z], name: 'LOOKOUT TOWER' },
    { pos: [PILLAR.x, PILLAR.top + 1.7, PILLAR.z], name: 'STACK THE BLOCKS' },
    { pos: [61, ISLE + 1.7, 49.5], name: 'LOG ROLL' },
  ],
  boxes: [
    { kind: 'prize', pos: [-78, 3.6, -50], item: 'popper' },
    { kind: 'prize', pos: [TOWER.x + 2, TOP + 2.8, TOWER.z + 2], item: 'umbrella' },
    { kind: 'prize', pos: [-20, T1 + 3.6, -38], item: 'lasso' },
    { kind: 'prize', pos: [-24, T2 + 3.6, -10], item: 'hat' },
    { kind: 'prize', pos: [20, T3 + 3.6, 12], item: 'cake' },
    { kind: 'prize', pos: [40, T3 + 3.6, 26], item: 'heart' },
    { kind: 'prize', pos: [60, T1 + 3.6, -30], candles: 5 },
    // secrets: in the glowing cave, over the leaf pile on the parkway (bounce on it)
    { kind: 'prize', pos: [-80, T3 + 2.2, -11], item: 'heart', hidden: true },
    { kind: 'prize', pos: [-40, 4.6, -60], candles: 5, hidden: true },
    // the toy blocks for the clay pillar, a crate or two
    { kind: 'block', pos: [-52, T3, 13], color: '#3f8fe8' },
    { kind: 'block', pos: [-55, T3, 23], color: '#e8473c' },
    { kind: 'block', pos: [-67, T3, 22], color: '#ffd23f' },
    { kind: 'crate', pos: [-46, T3, 20], candles: 3 }, { kind: 'crate', pos: [76, T1, -36], candles: 2 },
  ],
  pawSpots: [
    // Ginger's paw prints at the foot of each cliff: KITTEN BOOST back up a terrace (a gap in the railing up top)
    { pos: [-40, T1, -42.2], r: 1.4, boost: 24 },
    { pos: [40, T2, -22.2], r: 1.4, boost: 24 },
    { pos: [-40, T3, -2.2], r: 1.4, boost: 24 },
  ],
  poundBoxes: [
    { pos: [-104, T1, -40], candles: 6, color: '#e8473c', message: 'PICNIC BASKET!' },
  ],

  // ===================================================================== enemies, pets, movers
  enemies: [
    { type: 'sock', tier: 'dumb', pos: [-60, T0, -56], patrol: [[-80, -56], [-40, -56]] },
    { type: 'sock', tier: 'dumb', pos: [24, T0, -50], patrol: [[10, -50], [40, -50]], color: '#fff3c4' },
    { type: 'sock', tier: 'dumb', pos: [TOWER.x, DECKS[2][2], TOWER.z - 4.6], patrol: [[TOWER.x - 1.6, TOWER.z - 4.6], [TOWER.x + 1.6, TOWER.z - 4.6]], speed: 1.4 },
    { type: 'brick', tier: 'alert', pos: [30, T1, -34], patrol: [[20, -34], [50, -34]], sight: 8 },
    { type: 'sock', tier: 'smart', pos: [-30, T1, -30], ambush: true, ambushR: 4.5, color: '#f2b632' },
    { type: 'sock', tier: 'alert', pos: [-74, T1, -33], patrol: [[-90, -33], [-60, -33]], sight: 7 },
    { type: 'brick', tier: 'alert', pos: [-40, T2, -12.5], patrol: [[-60, -12.5], [-20, -12.5]], color: '#3f8fe8', sight: 8 },
    { type: 'sock', tier: 'smart', pos: [40, T2, -13], patrol: [[22, -13], [58, -13]], color: '#d6f5ff' },
    { type: 'brick', tier: 'smart', pos: [-48, T3, 10], patrol: [[-54, 6], [-42, 12]], color: '#9b6cff', sight: 8 },
    { type: 'sock', tier: 'alert', pos: [10, T3, 22], patrol: [[-10, 22], [28, 22]], sight: 7, color: '#ffe0ec' },
    { type: 'sock', tier: 'dumb', pos: [74, T3, 12], patrol: [[60, 12], [92, 12]] },
    { type: 'sock', tier: 'dumb', pos: [50, ISLE, 76], patrol: [[44, 76], [58, 76]], color: '#d6f5ff' },
  ],
  pets: [{ type: 'cat' }, { type: 'dog' }],
  movers: [
    // the floating log between the last rock and the island (wait for it to drift into line)
    { type: 'lift', from: [30, ISLE, 59.8], to: [38, ISLE, 59.8], size: [7, 0.8, 3.2], period: 7, pause: 1.4, color: '#8a5a34', studs: false },
    // the log that ferries out to the sandbar rock and back
    { type: 'lift', from: [39, ISLE, 49.5], to: [55, ISLE, 49.5], size: [6, 0.8, 3.0], period: 8, pause: 1.8, color: '#8a5a34', studs: false },
  ],
  checkpoints: [
    { pos: [62, T1, -36], yaw: -90 },
    { pos: [-94, T2, -12], yaw: 90 },
    { pos: [90, T3, 8], yaw: -90 },
    { pos: [30, T3, 26], yaw: 0 },
  ],
  hints: [
    { pos: [-86, 0, -53], r: 4, text: 'Look! The river, the bridges, and the Bessborough across the water. The pelicans are fishing below the weir.', cam: { pos: [-56, 18, -36], look: [0, -18, 120], time: 3.6 } },
    { pos: [TOWER.x, 0, TOWER.z + 9], r: 4.5, text: 'The LOOKOUT TOWER! Climb the ladder, then hop up the decks, round and round. Best view in Saskatoon!' },
    { pos: [0, 0, -66], r: 4, text: 'The MUD SLIDE! Jump in and steer. Hold on to your hat!' },
    { pos: [-12, T1, -30], r: 4, dy: 3, text: 'The footbridge is broken! Jump the gap. (Fall in and you slide all the way down!)' },
    { pos: [-40, T1, -38], r: 4, dy: 3, text: "Ginger's paw prints! Jump from them for a KITTEN BOOST back up the bank." },
    { pos: [PILLAR.x, T3, PILLAR.z - 6], r: 5, dy: 3, text: 'A golden candle on the clay pillar, too high to reach... Stack the toy blocks next to it! ACTION lifts a block, ACTION again puts it down on another one.' },
    { pos: [-80, T3, -1], r: 3.5, dy: 3, text: 'A glowing cave... it goes UNDER THE RIVER? Not yet. Maybe someday!' },
    { pos: [34, T3, 33], r: 5, dy: 4, text: 'The river! Hop across the rocks and catch the floating log to the island. Don\'t fall in!' },
    { pos: [34, ISLE, 49.5], r: 3, dy: 3, text: 'A log is floating out to that sandbar rock. Ride it!' },
    { pos: [40, ISLE, 68], r: 5, dy: 3, text: 'A pelican! It is waiting to fly you over the weir...' },
  ],
  goal: { pos: [40, ISLE, 74], r: 2.6, yaw: 180, ring: 2.9, ringY: 3.4 },
  guides: {
    '-1': [[-60, 0, -56], [20, 0, -56], [94, 0, -47], [96, 0, -42], [66, T1, -41.5], [62, T1, -36]],
    0: [[30, T1, -30], [6, T1, -30], [-6, T1, -30], [-66, T1, -30], [-68, T1, -22], [-96, T2, -21.5], [-94, T2, -12]],
    1: [[-40, T2, -10], [0, T2, -10], [64, T2, -10], [66, T2, -1.5], [96, T3, -1.5], [90, T3, 8]],
    2: [[60, T3, 9], [34, T3, 20], [30, T3, 26]],
    3: [[34, T3, 33], [34, -26.6, 43.5], [34, -26.6, 49.5], [34, -26.6, 55.5], [34, -26.6, 60.4], [40, ISLE, 66], [40, ISLE, 74]],
  },
};

export default L;

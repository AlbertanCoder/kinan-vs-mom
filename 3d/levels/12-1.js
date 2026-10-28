// =====================================================================================
//  WORLD 12-1  ·  KINAN'S 3D HOUSE  ·  "explore every room, now with a back side"
// =====================================================================================
// A level file = one default export with:
//   build(b)      static scenery (walls, floors, stairs, roof, ground) using the builder b (js/build.js)
//   place         props from the prop library: [name, x, y, z, yawDegrees, {options}]   (js/props*.js)
//   candles       [[x,y,z], ...]  (y = the floor/top they sit on + ~0.4)
//   goldenCandles 3 golden candles {pos, name}  (index 0..2 = obvious, tricky, secret) - the rare big prize
//   enemies       {type:'sock'|'brick', tier:'dumb'|'alert'|'smart', pos, patrol:[[x,z],...], loop?, sight?, ambush?}
//   checkpoints   {pos, yaw (Kinan's facing after respawn)}
//   movers        ceiling fan / toy train / lifts / spinners (see js/entities.js)
//   poundBoxes    toy boxes that burst into candles when butt-slammed
//   boxes         ? boxes, crates, toy blocks, heavy crates (see js/boxes.js); buttons + cages = the box puzzle
//   pawSpots      Ginger's paw prints: jump from them for a KITTEN BOOST
//   climb:true    on a build piece or a prop (bookshelf) = Kinan can climb it
//   guides        Glitchy's "show me the way" paths, one per checkpoint (offered after 5 losses there)
//   pets, hints, goal, spawn, camZones, zoneOf, sky, light
// Units: Kinan is ~2.1 tall. Floors: basement -11, ground 0, upstairs 11. Ceilings 10 above each floor.
// The house interior is x -21..21, z -15..15 (front of the house = +z, the street side).
import { subtractRects } from '../js/build.js';

const G = 0, U = 11, B = -11;          // floor heights
const CREAM = 'cream';

// ---------- small helpers (data generators)
const ring = (cx, y, cz, r, n, a0 = 0) => Array.from({ length: n }, (_, i) => [cx + Math.cos(a0 + i / n * Math.PI * 2) * r, y, cz + Math.sin(a0 + i / n * Math.PI * 2) * r]);
const line = (a, b, n) => Array.from({ length: n }, (_, i) => { const t = n === 1 ? 0 : i / (n - 1); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; });
const inHouse = (x, z) => x > -22.6 && x < 22.6 && z > -16.6 && z < 16.6;
// stairs ramp height (main stairs: z=14 -> y 0, z=-8 -> y 11)
const stairY = (z) => 11 - (z + 8) * (11 / 22) + 0.25;
// back roof height at z (eave z=-17.6 y=21.6, ridge z=0 y=31.6)
const roofY = (z) => 21.6 + (17.6 - Math.abs(z)) * (10 / 17.6);

function floorTex(b, name, rect, holes, y, scale) {
  for (const [x0, z0, x1, z1] of subtractRects(rect, holes)) b.texQuad(name, x0, z0, x1, z1, y, scale);
}

export default {
  id: '12-1',
  title: "KINAN'S 3D HOUSE",
  subtitle: 'explore every room, now with a back side',
  clearText: 'Happy 11th birthday, Kinan!',
  intro: 'Happy birthday, Kinan! The whole house went 3D! Find the 3 golden candles, then get to the FRONT DOOR... from the outside!',
  helpAfter: 5,
  // the real .glb files (GitHub Pages / local server); where they cannot be fetched, assets/models.js holds the same models
  assets: { kinan: '../worlds/w12_assets/kinan.glb', glitchy: '../worlds/w12_assets/glitchy.glb', pets: '../worlds/w12_assets/pet_{id}.glb' },
  killY: -40,
  sky: { top: '#3d8ee8', mid: '#86c8ff', horizon: '#e6f6ff', fog: '#d9efff', fogNear: 140, fogFar: 520 },
  light: { sky: '#e8f4ff', ground: '#f4dcc0', hemi: 0.72, sun: '#fff1da', sunI: 2.6, dir: [24, 52, 30], shadowSize: 32, env: 0.4 },
  exposure: 0.92,

  spawn: { pos: [-6.2, U, -4], yaw: -8 },

  // which "zone" a point is in: b/g/u = basement/ground/upstairs inside the house, r = roof, o = outside.
  // Used to only let the current floor's furniture cast sun shadows (so upstairs beds don't shadow the living room).
  zoneOf(x, y, z) {
    if (inHouse(x, z)) { if (y < -0.5) return 'b'; if (y < 10.5) return 'g'; if (y < 21.3) return 'u'; return 'r'; }
    return 'o';
  },
  camDefaults: { dist: 14, pitch: 0.4, height: 1.5 },
  camZones: [
    // the wall-jump canyon: look in from its open east end so both walls stay in view
    { min: [-44, -1, -27.5], max: [-33.5, 30, -15.5], dist: 13, pitch: 0.32, height: 2.2, yaw: 90 },
    { min: [-21.6, B - 1, -15.6], max: [21.6, -0.6, 15.6], dist: 10.5, pitch: 0.46, height: 1.6 },
    { min: [-21.6, -0.6, -15.6], max: [21.6, 21.2, 15.6], dist: 9.2, pitch: 0.46, height: 1.6 },
  ],

  // ===================================================================== static scenery
  build(b) {
    const ext = (ax, az, bx, bz, y0, y1, inner, holes = [], tex) => b.wall(ax, az, bx, bz, y0, y1, 1, inner, holes, { color2: CREAM, tex, tex2: 'siding', texScale2: 4.5, trim: '#ffffff', trimY: y0 < 0 ? 1 : 0.5 });
    const win = (at, w = 4.5, h = 4.2, y = 3.6) => ({ at, w, h, y, kind: 'window' });

    // ---------------- outside ground (big lawn with a hole for the house and the window well)
    const yardHoles = [[-22, -16, 22, 16], [-17, -21, -11, -16]];
    b.slab(-46, -64, 46, 48, -1, 0, '#62c544', yardHoles, { cam: true });
    floorTex(b, 'grass', [-46, -64, 46, 48], yardHoles, 0.012, 7);
    // endless-looking grass beyond the fence (visual only)
    b.texQuad('grass', -400, -400, 400, -64, -0.04, 7); b.texQuad('grass', -400, 48, 400, 400, -0.04, 7);
    b.texQuad('grass', -400, -64, -46, 48, -0.04, 7); b.texQuad('grass', 46, -64, 400, 48, -0.04, 7);
    // street, curb, sidewalk, front walkway
    b.texQuad('asphalt', -400, 49, 400, 64, 0.02, 16);
    b.box(0, -0.6, 48.5, 92, 0.9, 1, '#d9d4e8', { r: 0.1, cast: false });
    const edge = { vis: false, phys: { noLedge: true, noWallJump: true } };
    b.box(0, 0, 48.6, 92, 8, 0.4, null, edge);            // invisible street barrier
    b.texQuad('path', -46, 44, 46, 48, 0.03, 4);
    b.texQuad('path', 15.5, 22.4, 19.5, 44, 0.03, 4);
    b.texQuad('path', 30, -16, 38, 44, 0.025, 4);                     // side path from the back gate to the front
    // invisible boundary walls (fence line)
    b.box(-46.5, 0, -8, 1, 12, 112, null, edge); b.box(46.5, 0, -8, 1, 12, 112, null, edge);
    b.box(0, 0, -62.5, 94, 12, 1, null, edge);

    // ---------------- floors / ceilings
    b.slab(-21, -15, 21, 15, B - 1, B, '#fffaf0');                                    // basement floor
    floorTex(b, 'concrete', [-21, -15, 21, 15], [], B + 0.012, 8);
    b.slab(-21, -15, 21, 15, -1, 0, '#fffaf0', [[2, -11.5, 10, -6.5]]);               // ground floor (slide hole)
    floorTex(b, 'wood', [-21, -1.5, 21, 15], [], 0.012, 5);                           // living room + foyer
    floorTex(b, 'tiles', [-21, -15, 21, -1.5], [[2, -11.5, 10, -6.5]], 0.012, 4);     // kitchen
    b.slab(-21, -15, 21, 15, 10, 11, '#fffaf0', [[14, -8, 21, 15]]);                  // upstairs floor (stairwell hole)
    floorTex(b, 'carpet', [-21, -15, -3, 15], [], U + 0.012, 6);                      // bedroom
    floorTex(b, 'wood', [-3, -15, 21, -8], [], U + 0.012, 5);                         // hallway
    b.slab(-22, -16, 22, 16, 21, 21.6, '#fffaf0');                                    // upstairs ceiling
    // basement ceiling = underside of the ground floor slab (already there)

    // ---------------- exterior walls
    // ground floor (base -1 so the walls cover the slab edge; window y is measured from -1)
    ext(-22, 15.5, 14, 15.5, -1, 10.5, '#e9f7e0', [win(2.8, 3.6), win(19, 4.6)], 'wpStripes');          // front, living room
    ext(14, 15.5, 22, 15.5, -1, 10.5, '#fdf0d5', [{ at: 3.5, w: 4.4, h: 7.2, y: 1.6, kind: 'door', door: '#e8473c', panel: '#c93a30', side: 1, frame: '#ffffff' }], 'wpHall'); // front door
    ext(22, -15.5, -22, -15.5, -1, 10.5, '#fff6dc', [{ at: 14, w: 5, h: 7.2, y: 1, kind: 'window', frame: '#ffffff' }, win(30, 6, 3.4, 5.6)], 'wpDots'); // back: patio door + sink window
    ext(21.5, 15, 21.5, -8, -1, 10.5, '#fdf0d5', [win(11, 4, 4.2, 5)], 'wpHall');                                  // right, stairs
    ext(21.5, -8, 21.5, -15, -1, 10.5, '#fff6dc', [win(3.5, 3, 3, 5)], 'wpDots');                                  // right, kitchen nook
    ext(-21.5, -15, -21.5, -1.5, -1, 10.5, '#fff6dc', [win(7, 5, 3.6, 5)], 'wpDots');                              // left, kitchen
    ext(-21.5, -1.5, -21.5, 15, -1, 10.5, '#e9f7e0', [win(8.5, 5.5, 4.2, 3.6)], 'wpStripes');                          // left, living room
    // upstairs (base 10.5; window y from 10.5)
    ext(-22, 15.5, -3, 15.5, 10.5, 21.6, '#bfe3ff', [win(7, 5), win(14, 4)], 'wpStars');                            // front, bedroom
    ext(-3, 15.5, 22, 15.5, 10.5, 21.6, '#fdf0d5', [win(7, 4), win(13, 4), win(20.5, 3.4, 4.6, 4)], 'wpHall');      // front, parents + stairwell
    ext(22, -15.5, -3, -15.5, 10.5, 21.6, '#fdf0d5', [win(5, 3.4, 4), win(14, 4, 4), win(22, 3.4, 4)], 'wpHall');  // back, hallway
    ext(-3, -15.5, -22, -15.5, 10.5, 21.6, '#bfe3ff', [win(9, 5)], 'wpStars');                                      // back, bedroom
    ext(21.5, 15, 21.5, -15, 10.5, 21.6, '#fdf0d5', [win(12, 4, 4.6), win(26.5, 3, 4)], 'wpHall');                 // right
    ext(-21.5, -15, -21.5, 15, 10.5, 21.6, '#bfe3ff', [win(10, 4), win(22, 5)], 'wpStars');                         // left, bedroom
    // basement (underground: no outer colour) with the window-well exit (open, no glass)
    const bw = { tex: 'wpBase', texScale: 4, trim: '#9b8fc0' };
    b.wall(-22, 15.5, 22, 15.5, B, -1, 1, '#e3dcf0', [], bw);
    b.wall(22, -15.5, -22, -15.5, B, -1, 1, '#e3dcf0', [{ at: 36, w: 6, y: 7.2, h: 2.6, kind: 'window', noGlass: true, frame: '#ffd23f' }], bw);
    b.wall(21.5, 15, 21.5, -15, B, -1, 1, '#e3dcf0', [], bw);
    b.wall(-21.5, -15, -21.5, 15, B, -1, 1, '#e3dcf0', [], bw);
    // a band of trim between the storeys + base trim
    for (const [x, z, w, d] of [[0, 16.1, 44.4, 0.5], [0, -16.1, 44.4, 0.5], [22.1, 0, 0.5, 32.6], [-22.1, 0, 0.5, 32.6]]) {
      b.box(x, 10.2, z, w, 0.7, d, '#ffffff', { col: false, r: 0.15, cast: false });
      b.box(x, -0.2, z, w + 0.2, 0.8, d + 0.2, '#d9c6a0', { col: false, r: 0.15, cast: false });
    }

    // ---------------- interior walls
    // ground floor: living | kitchen divider with a wide archway, the stair-side wall
    b.wall(-21, -1.5, 14, -1.5, 0, 10, 1, '#fff2c9', [{ at: 23, w: 8, h: 7.6, kind: 'open', frame: '#ffffff' }], { color2: '#cdeec0', tex: 'wpDots', tex2: 'wpStripes', trim: '#ffffff', trim2: '#ffffff' });
    b.wall(14, 8, 14, -1.5, 0, 10, 1, '#cdeec0', [], { color2: '#fde9b8', tex: 'wpStripes', tex2: 'wpHall', trim: '#ffffff' });
    b.wall(14, -1.5, 14, -8, 0, 10, 1, '#fff2c9', [], { color2: '#fde9b8', tex: 'wpDots', tex2: 'wpHall', trim: '#ffffff' });
    // upstairs: bedroom wall with door, hallway wall with two closed doors, stairwell wall
    b.wall(-3, 15, -3, -15, U, 21, 1, '#a9d8ff', [{ at: 26.5, w: 4.6, h: 7.6, kind: 'open', frame: '#ffffff' }], { color2: '#fde9b8', tex: 'wpStars', tex2: 'wpHall', trim: '#ffffff', trim2: '#ffffff' });
    b.wall(-3, -8, 14, -8, U, 21, 1, '#fde9b8', [
      { at: 5, w: 4.4, h: 7.4, kind: 'door', door: '#7ec8ff', panel: '#a9dcff', side: -1 },
      { at: 13, w: 4.4, h: 7.4, kind: 'door', door: '#ff8fb8', panel: '#ffb3cf', side: -1 },
    ], { color2: '#efe6ff', tex: 'wpHall', trim: '#ffffff' });
    b.wall(14, -8, 14, 15, U, 21, 1, '#fde9b8', [], { color2: '#efe6ff', tex: 'wpHall', trim: '#ffffff' });
    // skirting boards along the main rooms
    b.box(-9, 0, -1.0, 24, 0.5, 0.15, '#ffffff', { col: false, r: 0.05, cast: false });

    // ---------------- main stairs (upstairs hallway -> foyer), carpet runner, side rail at the open bottom
    b.stairs(17.5, 14, G, 17.5, -8, U, 7, 22, '#e2ae73', { color2: '#d9a066', runner: '#c2414f', cam: true });

    // ---------------- back deck (outside the patio door), steps, railings
    b.box(9, 0, -20, 14, 2.2, 8, '#c48f63', { r: 0.12 });
    b.texQuad('deck', 2, -24, 16, -16, 2.212, 5);
    b.stairs(9, -27, 0, 9, -24, 2.2, 4, 4, '#c48f63', { color2: '#b8835a' });
    for (const [x, z, w, d] of [[4.5, -23.85, 5, 0.3], [13.5, -23.85, 5, 0.3], [2.15, -20, 0.3, 8], [15.85, -20, 0.3, 8]]) b.box(x, 2.2, z, w, 1.4, d, '#ffffff', { r: 0.1 });

    // ---------------- the slide to the basement (kitchen hole -> ball pit)
    b.ramp(17, -9, -9.2, 2, -9, 0, 5, '#c9b6ff', { base: B, cam: true, phys: { slide: true } });
    b.ramp(17, -9, -9.15, 2, -9, 0.05, 4.4, '#ffd23f', { thick: 0.3, col: false });
    for (const sz of [-1, 1]) {
      b.ramp(17, -9 + sz * 2.65, -8.0, 2, -9 + sz * 2.65, 1.2, 0.35, '#e8473c', { thick: 0.35, col: false });
      b.ramp(17, -9 + sz * 2.65, -8.0, 2, -9 + sz * 2.65, 1.2, 0.4, null, { vis: false, base: B });
    }
    // railings around the kitchen hole (open on the west side = the slide's top)
    b.box(6.15, 0, -11.85, 8.3, 1.6, 0.35, '#ffffff', { r: 0.12 });
    b.box(6.15, 0, -6.15, 8.3, 1.6, 0.35, '#ffffff', { r: 0.12 });
    b.box(10.3, 0, -9, 0.35, 1.6, 6.05, '#ffffff', { r: 0.12 });
    for (const x of [2.2, 4.2, 6.2, 8.2]) { b.box(x, 0, -11.85, 0.3, 1.8, 0.45, '#ffd23f', { col: false, r: 0.1 }); b.box(x, 0, -6.15, 0.3, 1.8, 0.45, '#ffd23f', { col: false, r: 0.1 }); }

    // ---------------- roof (walkable back + front slopes), chimney, gable vents
    for (const s of [-1, 1]) {
      b.ramp(0, s * 17.6, 21.6, 0, 0, 31.6, 44, '#f4e7c8', { base: 21.6, col: false, cast: false });                 // gable wedge
      b.ramp(0, s * 17.6, 21.6, 0, 0, 31.6, 47.4, null, { vis: false, base: 21.6, cam: true });                       // walkable roof
      b.ramp(0, s * 17.9, 21.45, 0, s * -0.2, 31.75, 47.4, '#d9443a', { thick: 0.7, col: false });                    // red roof plate
      b.texSlope('shingles', 0, s * 17.95, 21.45 + 0.24, 0, s * -0.15, 31.72 + 0.24, 47.3, 6.5);
    }
    b.box(0, 31.3, 0, 48, 0.8, 1.4, '#b8332c', { col: false, r: 0.3 });                                              // ridge cap
    for (const sx of [-1, 1]) { b.cyl(sx * 22.1, 25, 0, 1.6, 0.3, '#ffffff', { rz: 90, col: false }); b.cyl(sx * 22.2, 25, 0, 1.2, 0.3, '#7ec8ff', { rz: 90, col: false, mat: 'glow' }); }
    b.box(-12, roofY(-9) - 2.6, -9, 3.2, 4.8, 3.2, '#c8553d', { r: 0.2, cam: true });                                 // chimney (secret star on top)
    b.box(-12, roofY(-9) + 2.0, -9, 3.8, 0.45, 3.8, '#9aa3b2', { r: 0.15 });

    // ---------------- front porch with a little roof, steps
    b.box(17.5, 0, 18.6, 10.6, 0.6, 5.2, '#f7f3ea', { r: 0.15 });
    b.box(17.5, 0, 21.8, 5.2, 0.3, 1.4, '#f7f3ea', { r: 0.12 });
    for (const x of [12.8, 22.2]) b.cyl(x, 0.6, 20.8, 0.4, 8.0, '#ffffff', { col: true });
    b.box(17.5, 8.6, 18.7, 11.6, 0.5, 5.6, '#ffffff', { r: 0.15 });
    b.ramp(17.5, 21.8, 8.9, 17.5, 16.3, 10.3, 12, '#d9443a', { thick: 0.4, col: false });
    b.texQuad('deck', 12.4, 16.1, 22.6, 21.1, 0.62, 4);
    // HAPPY BIRTHDAY KINAN! banner standing on the porch roof (like the World 12 hub concept)
    b.box(17.5, 9.1, 21.0, 11.4, 2.7, 0.3, '#f6c445', { r: 0.12, col: false });
    b.texPanel('sign:HAPPY BIRTHDAY|KINAN!', 17.5, 10.45, 21.2, 10.6, 2.3, 0);

    // ---------------- window well (basement exit into the backyard); floor matches the window sill (-3.8)
    b.box(-14, -4.2, -18.5, 6, 0.4, 5, '#cfc8dc', { r: 0.05, cam: true });
    for (const [x, z, w, d] of [[-16.75, -18.5, 0.5, 5], [-11.25, -18.5, 0.5, 5]]) b.box(x, -3.8, z, w, 4.1, d, '#bfb6cf', { r: 0.1, cam: true });
    b.box(-14, -3.8, -20.75, 6, 3.8, 0.5, '#bfb6cf', { r: 0.1, cam: true });   // south side flush with the lawn: easy last hop
    // brick ledge under the basement window (top -3.8) and a step brick inside the well (top -2.0)
    b.prop('brickTower', -14, B, -13.5, 0, { n: 4, nx: 4, nz: 2, u: 1.5, seed: 30, colors: ['#ffd23f', '#ff9a3c'] });
    b.prop('brickTower', -14, -3.8, -19, 0, { n: 1, nx: 2, nz: 2, u: 1.5, colors: ['#e8473c'] });
  },

  // ===================================================================== props (data)
  place: [
    // ---------- BEDROOM (upstairs, x -21..-3)
    ['rug', -9, U, -2.5, 90, { tex: 'rugRoad', w: 13, d: 11 }],
    ['rug', -9, U, 7.5, 0, { tex: 'rugRound', w: 6.5, d: 6.5 }],
    ['bed', -16.8, U, 9, 180, { blanket: '#3f63a8', bounce: 17 }],
    ['desk', -7, U, 13.2, 180, {}],
    ['chair', -7, U, 10.2, 0, { color: '#c2414f' }],
    ['wardrobe', -17.5, U, -12.5, 0, {}],
    ['bookshelf', -19.7, U, -4, 90, { w: 6, h: 7.3, n: 4, color: '#9fd8ff', seed: 4, climb: true }],
    ['wallShelf', -19.9, U + 7.4, 3.2, 90, { w: 5, d: 2.2, trophy: true }],
    ['brickCastle', -10, U, -3, 90, {}],
    ['brickStack', -15.6, U, -7.6, 15, { n: 3, seed: 3 }],
    ['brickStack', -15, U, 1.2, -20, { n: 2, seed: 8 }],
    ['beanbag', -19.4, U, -9, 0, { color: '#9b6cff' }],
    ['poster', -6.5, U + 5.6, -14.95, 0, { tex: 'posterRocket', w: 3, h: 4 }],
    ['poster', -11, U + 6.0, -14.95, 0, { tex: 'posterMap', w: 3.6, h: 2.7 }],
    ['poster', -20.95, U + 6.4, 9, 90, { tex: 'posterKinan', w: 5.2, h: 2.6, frame: '#f6c445' }],
    ['poster', -3.55, U + 5.4, 5, -90, { tex: 'posterDino', w: 3, h: 4 }],
    ['poster', -3.55, U + 5.4, -3.5, -90, { tex: 'posterGlitchy', w: 3, h: 3 }],
    ['plant', -4.6, U, -14, 0, { s: 0.9, pot: '#ff8fb8', seed: 2 }],
    ['curtains', -15, U + 7.5, 14.95, 180, { w: 5, h: 3.4, color: '#3f63a8', color2: '#f6c445' }],
    ['curtains', -8, U + 7.5, 14.95, 180, { w: 4, h: 3.6, color: '#3f63a8', color2: '#f6c445' }],
    ['curtains', -20.95, U + 7.5, 7, 90, { w: 5, h: 4.6, color: '#3f63a8', color2: '#f6c445' }],
    ['curtains', -3, G + 7.0, 14.95, 180, { w: 4.6, h: 4.8, color: '#ff8fb8' }],
    ['curtains', -20.95, G + 7.0, 7, 90, { w: 5.5, h: 4.8, color: '#ff8fb8' }],
    // lessons in the bedroom: a tall brick stack (DOUBLE JUMP) and the climbable bookshelf (CLIMB)
    ['brickStack', -14.5, U, -3.5, 0, { n: 3, nx: 2, nz: 2, wobble: false, seed: 21 }],
    ['sign', -14.5, U, -0.5, 0, { text: 'DOUBLE|JUMP!', w: 2.2, postH: 1.4 }],
    ['sign', -20.9, U + 8.3, -4, 90, { text: 'CLIMB|ME!', w: 2.4, wall: true }],

    // ---------- HALLWAY (upstairs, x -3..21, z -15..-8)
    ['laundry', 4.2, U, -13.4, 0, {}],
    ['photo', 6, U + 5.4, -8.55, 180, { tex: 'photoFamily', w: 2.6, h: 2.0 }],
    ['photo', 13, U + 5.4, -8.55, 180, { tex: 'photoDog', w: 2, h: 2 }],
    ['plant', 20, U, -14, 0, { s: 1, seed: 6 }],
    ['sign', 2, U + 7.6, -8.55, 180, { text: 'BATHROOM', w: 2.6, wall: true }],
    ['sign', 10, U + 7.6, -8.55, 180, { text: 'MOM & DAD', w: 2.6, wall: true }],
    ['sign', -0.6, U, -9.1, 180, { text: '? BOXES:|BONK THEM!', w: 2.8, postH: 1.2 }],
    // ---------- LIVING ROOM (ground floor front, x -21..14)
    ['rug', -12, G, 8, 0, { tex: 'rugStripe', w: 13, d: 8 }],
    ['couch', -12, G, 2.2, 0, { w: 15 }],
    ['coffeeTable', -12, G, 8, 0, {}],
    ['tvStand', -12, G, 13.6, 180, {}],
    ['armchair', -1.5, G, 9.5, -90, {}],
    ['bookshelf', 9.5, G, 0.3, 0, { w: 5, h: 7.0, n: 4, color: '#e2ae73', seed: 11, climb: true }],
    ['wallShelf', 6.5, G + 7.55, 14, 180, { w: 6.5, d: 2.1 }],
    ['plant', -19.8, G, 13.6, 0, { s: 1.1, seed: 9 }],
    ['lampFloor', -20, G, -0.2, 0, { color: '#ff8fb8' }],
    ['sign', 17.5, G + 3.2, 14.85, 180, { text: 'FRONT DOOR STUCK!|TRY THE BASEMENT|- MOM', w: 3.9, wall: true }],
    ['sign', -4.6, G, 13.6, 200, { text: "GINGER'S|PAW PRINTS", w: 2.6, postH: 1.2 }],
    // ---------- KITCHEN (ground floor back)
    ['counter', -10.5, G, -13.4, 0, { w: 21, sink: 2.5, stove: -5.5, stuff: 7 }],
    ['upperCab', -17.5, G + 5.6, -14, 0, { w: 7, h: 2.0 }],
    ['upperCab', -2.5, G + 5.6, -14, 0, { w: 5, h: 2.0 }],
    ['table', -12, G, -6, 0, { w: 9, d: 5.5 }],
    ['chair', -12, G, -10.3, 0, { color: '#ffd23f' }],
    ['chair', -18.2, G, -6, 90, { color: '#3f8fe8' }],
    ['chair', -5.8, G, -6, -90, { color: '#5cc23a' }],
    ['fridge', 18.4, G, -12.6, -90, {}],
    ['sign', 0.9, G, -13.4, -90, { text: 'BASEMENT|SLIDE!', w: 2.6, postH: 1.6 }],
    ['block', 12, G, -9, 0, { w: 2.4, h: 1.8, d: 2.4, color: '#ffd23f' }],          // stool
    ['block', 15.2, G, -9.6, 0, { w: 2.2, h: 3.4, d: 2.2, color: '#cfd6e2' }],     // cart
    ['block', 15.2, 3.4, -9.8, 0, { w: 2.1, h: 1.8, d: 1.7, color: '#2a2a33' }],   // microwave
    ['block', 15.2, 3.9, -8.92, 0, { w: 1.2, h: 0.9, d: 0.06, color: '#8fe3ff', mat: 'glow' }],
    // ---------- BASEMENT (Brick City)
    ['ballPit', 18.5, B, -9, 0, { w: 5, d: 9, bounce: 14 }],
    ['washer', -19, B, 10, 90, { dot: '#5cc23a' }],
    ['washer', -19, B, 5.4, 90, { dot: '#e8473c' }],
    ['boxes', 18, B, 1, 0, { n: 3, seed: 5 }],
    ['boxes', -18.5, B, -3, 0, { n: 2, seed: 9 }],
    ['brickHouse', 18, B, 10.5, -90, { nx: 3, nz: 3, n: 3, color: '#ff9a3c', color2: '#ffd23f', roof: '#3f8fe8' }],
    ['brickTower', 2, B, -13.3, 0, { n: 1, u: 1.5 }],
    ['brickTower', -3, B, -13.3, 0, { n: 2, u: 1.5, seed: 4 }],
    ['brickTower', -8, B, -13.3, 0, { n: 3, u: 1.5, seed: 8, windows: true }],
    ['brickTower', -1, B, 5, 0, { n: 3, nx: 3, nz: 3, u: 1.5, seed: 12, windows: true }],
    ['sign', 12.5, B, 1.5, -90, { text: 'BRICK|CITY', w: 3.2 }],
    ['sign', -8.6, B + 7.6, -14.95, 0, { text: 'WAY OUT!|TO THE BACKYARD', w: 3.4, wall: true }],
    ['block', -1, B, -5.5, 0, { w: 6, h: 2.2, d: 3, color: '#e8473c' }],          // train station
    ['brickTower', -1, B, -7.75, 0, { n: 1, nx: 2, nz: 1, u: 1.5, colors: ['#ffffff'] }],
    ['sign', -4.6, B, -5.5, -90, { text: 'TRAIN|STATION', w: 2.6, postH: 2.4 }],
    // ---------- BACKYARD (the back side of the house!)
    ['flowerBed', -4, G, -17.6, 0, { w: 6.5, d: 2.2, seed: 3 }],
    ['flowerBed', 19, G, -17.6, 0, { w: 4, d: 2.2, seed: 5 }],
    ['treehouse', -7, G, -27, 0, { h: 9, bounce: 31 }],
    ['trampoline', 15, G, -38, 0, { r: 4.2, bounce: 26 }],
    ['swingset', -28, G, -44, 90, {}],
    ['sandbox', -32, G, -28, 0, {}],
    ['picnicTable', -14, G, -40, 0, {}],
    ['shed', 34, G, -53, 0, { color: '#9fd8ff' }],
    ['doghouse', -37, G, -55, 35, {}],
    ['clothesline', 17, G, -45, 0, { len: 14 }],
    ['veggies', -10, G, -52, 0, { w: 8, d: 3 }],
    ['tree', -40, G, -36, 0, { s: 1.15, seed: 2 }],
    ['tree', 40, G, -30, 0, { s: 1.0, seed: 5 }],
    ['tree', -28, G, -59, 0, { s: 0.9, seed: 8 }],
    ['tree', 42, G, -47, 0, { s: 1.1, seed: 11 }],
    ['pine', 6, G, -58, 0, { s: 1.2 }],
    ['pine', 24, G, -59, 0, { s: 1.0 }],
    ['bush', -44, G, -20, 0, { s: 1.2, flowers: '#ff5fa2' }],
    ['bush', 44, G, -60, 0, { s: 1.1 }],
    ['bush', -20, G, -60, 0, { s: 1.0, flowers: '#ffd23f' }],
    ['rock', -2, G, -46, 0, { s: 1.2 }],
    ['bbq', 13.5, 2.2, -18.6, 0, {}],
    ['balloons', 4, 2.2, -17.4, 0, { n: 4, h: 4.2, seed: 3 }],
    // fences: back + sides + inner fences with an open gate on the east side
    ['fence', -46, G, -62, 0, { len: 92, h: 3.6, color: '#f7f3ea' }],
    ['fence', -46, G, 44, 90, { len: 106, h: 3.6, color: '#f7f3ea' }],
    ['fence', 46, G, -62, -90, { len: 106, h: 3.6, color: '#f7f3ea' }],
    ['fence', -46, G, -16.5, 0, { len: 24, h: 3.6, color: '#f7f3ea' }],
    ['fence', 22, G, -16.5, 0, { len: 8, h: 3.6, color: '#f7f3ea' }],
    ['fence', 38, G, -16.5, 0, { len: 8, h: 3.6, color: '#f7f3ea' }],
    ['sign', 34, G, -15.2, 0, { text: 'TO THE|FRONT YARD', w: 3.8, back: true }],
    // WALL JUMP canyon: two tall brick towers with a narrow gap (top of the north one = an umbrella ? box)
    ['brickTower', -39, G, -18.3, 0, { n: 6, nx: 4, nz: 2, u: 1.5, seed: 41, colors: ['#3f8fe8', '#ffd23f', '#e8473c', '#5cc23a'] }],
    ['brickTower', -39, G, -24.1, 0, { n: 6, nx: 4, nz: 2, u: 1.5, seed: 43, colors: ['#ff9a3c', '#9b6cff', '#3f8fe8', '#ffffff'] }],
    ['sign', -35.9, G + 3.2, -24.1, 90, { text: 'WALL|JUMP!', w: 2.4, wall: true }],
    ['sign', -1, G, -33.5, 0, { text: 'BIG|BUTTON', w: 2.4, postH: 1.3 }],
    // ---------- FRONT YARD
    ['balloons', 12.2, 0.6, 21.2, 0, { n: 5, h: 5.5, seed: 4 }],
    ['balloons', 22.8, 0.6, 21.2, 0, { n: 5, h: 5.5, seed: 7 }],
    ['bunting', 12.4, 0, 21.4, 0, { len: 10.2, y: 7.7, sag: 1.0 }],
    ['tree', -14, G, 32, 0, { s: 1.25, seed: 4 }],
    ['tree', 38, G, 34, 0, { s: 1.05, seed: 7 }],
    ['tree', -38, G, 10, 0, { s: 1.1, seed: 13 }],
    ['bush', -18, G, 18.6, 0, { s: 1.0, flowers: '#ff5fa2' }],
    ['bush', -9, G, 18.6, 0, { s: 1.1, flowers: '#ffffff' }],
    ['bush', 0, G, 18.6, 0, { s: 1.0, flowers: '#ffd23f' }],
    ['bush', 7, G, 18.6, 0, { s: 0.9 }],
    ['flowerBed', -4, G, 25, 0, { w: 8, d: 2.6, seed: 9 }],
    ['mailbox', 23, G, 43.2, 0, {}],
    ['streetLamp', -28, G, 46.4, 0, {}],
    ['streetLamp', 32, G, 46.4, 0, {}],
    ['hydrant', -40, G, 45.5, 0, {}],
    ['bins', 26, G, 17.5, 0, {}],
    // ---------- NEIGHBOURHOOD (background, outside the fence)
    ['neighbor', -45, G, 84, 180, { color: '#ffd9a8', roof: '#3f63a8' }],
    ['neighbor', 0, G, 86, 180, { color: '#c9f2d6', roof: '#e8473c', door: '#3f63a8' }],
    ['neighbor', 45, G, 84, 180, { color: '#ffd1e0', roof: '#5f6675' }],
    ['neighbor', -84, G, 0, 90, { color: '#d6e4ff', roof: '#2fb5a8' }],
    ['neighbor', 84, G, 2, -90, { color: '#fff1b8', roof: '#9b6cff' }],
    ['neighbor', -84, G, -48, 90, { color: '#ffe0c2', roof: '#e8473c' }],
    ['neighbor', 84, G, -50, -90, { color: '#e3f0d0', roof: '#3f63a8' }],
    ['neighbor', -30, G, -100, 0, { color: '#ffd9a8', roof: '#5f6675' }],
    ['neighbor', 30, G, -100, 0, { color: '#d6e4ff', roof: '#e8473c' }],
    ['tree', -64, G, 60, 0, { s: 1.3, seed: 21 }], ['tree', 64, G, 62, 0, { s: 1.2, seed: 22 }], ['tree', -66, G, -24, 0, { s: 1.4, seed: 23 }],
    ['tree', 66, G, -22, 0, { s: 1.3, seed: 24 }], ['tree', 0, G, -82, 0, { s: 1.5, seed: 25 }], ['tree', -60, G, -80, 0, { s: 1.2, seed: 26 }],
    ['tree', 60, G, -82, 0, { s: 1.3, seed: 27 }], ['pine', -100, G, 30, 0, { s: 1.6 }], ['pine', 100, G, -20, 0, { s: 1.5 }],
    ['cloud', -120, 80, -160, 0, { s: 1.6, seed: 1 }], ['cloud', 60, 95, -220, 0, { s: 2.0, seed: 2 }], ['cloud', 210, 85, -60, 0, { s: 1.7, seed: 3 }],
    ['cloud', 180, 105, 140, 0, { s: 2.2, seed: 4 }], ['cloud', -60, 90, 220, 0, { s: 1.8, seed: 5 }], ['cloud', -230, 100, 40, 0, { s: 2.1, seed: 6 }],
    ['cloud', 20, 120, 60, 0, { s: 1.4, seed: 7 }], ['cloud', -160, 110, -40, 0, { s: 1.5, seed: 8 }],
  ],

  // ===================================================================== collectibles
  candles: [
    // bedroom: bed, castle walls + towers, bookshelf steps, wall shelf, desk
    [-16.8, 13.7, 6], [-16.8, 13.7, 11],
    [-12, U + 2.8, -6], [-12, U + 2.8, 0], [-8, U + 2.8, -6], [-8, U + 2.8, 0], [-10, U + 5.2, -10], [-10, U + 5.2, 4],
    [-18.8, U + 2.0, -4], [-18.8, U + 3.8, -4], [-18.8, U + 5.6, -4], [-19.7, U + 7.6, -4],
    [-19.8, U + 7.85, 2.2], [-19.8, U + 7.85, 4.2],
    [-5.5, U + 3.3, 12.6],
    // hallway + stairs
    ...line([0, U + 0.4, -11.5], [12, U + 0.4, -11.5], 5), [4.2, U + 3.0, -13.4],
    [17.5, stairY(-4) + 0.4, -4], [17.5, stairY(0) + 0.4, 0], [17.5, stairY(4) + 0.4, 4], [17.5, stairY(8) + 0.4, 8],
    // living room: couch seats, backrest, coffee table, bookshelf steps, a ring you collect riding the fan
    [-16, 2.7, 3.2], [-12, 2.7, 3.2], [-8, 2.7, 3.2], [-14, 5.0, 0.1], [-10, 5.0, 0.1], [-6, 5.0, 0.1], [-10.2, 2.3, 8.6],
    [8, 2.1, 1.0], [9.5, 3.9, 1.0], [11, 5.6, 1.0],
    ...ring(6.5, 8.1, 7.4, 4.3, 6, 0.4),
    // kitchen: table, counter, upper cabinets, stool -> cart -> microwave -> fridge top
    [-14.5, 3.3, -4.8], [-9.5, 3.3, -4.8], [-19, 3.8, -13.0], [-12.5, 3.8, -13.0], [-3.8, 3.8, -12.6],
    [-19.5, 8.0, -14.0], [-16, 8.0, -14.0], [-2.5, 8.0, -14.0],
    [12, 2.2, -9], [15.2, 5.6, -9.8], ...ring(18.4, 7.8, -12.6, 1.15, 4),
    // the slide
    [5, -1.2, -9], [8, -3.1, -9], [11, -4.9, -9], [14, -6.8, -9],
    // basement: climbing towers, ledge, the train station, the tower in the middle of the train loop, floor trail
    [2, -8.9, -13.3], [-3, -7.1, -13.3], [-8, -5.3, -13.3], [-15.5, -3.4, -13.5], [-12.5, -3.4, -13.5],
    ...ring(-1, -5.3, 5, 1.3, 5), [-1, -8.4, -5.5],
    [9, -10.6, -4], [6, -10.6, -4], [3, -10.6, -2.5],
    // backyard: trampoline sky ring, treehouse ladder + deck, secret column over the fort's trampoline, roof trail
    ...ring(15, 8.5, -38, 2.4, 5),
    [-16.5, 2.4, -24.8], [-11, 6.8, -24.8], [-10, 9.4, -27],
    [-5.4, 13.5, -24.6], [-5.4, 16.5, -24.6], [-5.4, 19.5, -24.6],
    [-5, roofY(-16) + 0.6, -16], [-7.5, roofY(-14) + 0.6, -14], [-10, roofY(-12) + 0.6, -12],
    [-24, 0.4, -40], [-24, 0.4, -47], [6, 2.6, -20.5], [11, 2.6, -21], [-37, 5.2, -55],
    [20, 0.4, -41.5], [24, 0.4, -41.5], [28, 0.4, -41.5],
    [34, 0.4, -24], [34, 0.4, -19], [34, 0.4, -12],
    // side path + front yard
    [34, 0.4, -4], [34, 0.4, 4], [32, 0.4, 12], [28, 0.4, 20],
    [17.5, 0.4, 41], [17.5, 0.4, 36], [17.5, 0.4, 28], [17.5, 1.0, 24.2],
    ...ring(-14, 0.4, 32, 5.2, 6),
    // lessons: on the double-jump brick stack, around Ginger's high ? box, the wall-jump towers
    [-14.5, U + 4.75, -3.5],
    ...ring(-9.5, 6.6, 10.95, 2.0, 5, 0.3),
    [-41, 11.2, -18.3], [-39, 11.2, -18.3], [-37, 11.2, -18.3], [-41, 11.2, -24.1], [-37, 11.2, -24.1],
  ],
  goldenCandles: [
    { pos: [-16.8, 16.6, 8.6], name: 'BED BOUNCE' },
    { pos: [6.5, 8.95, 14.0], name: 'FAN-TASTIC RIDE', s: 0.7 },
    { pos: [-12, roofY(-9) + 3.8, -9], name: 'CHIMNEY SECRET' },
  ],
  // ? boxes, crates, toy blocks and the heavy crate (js/boxes.js). pos = bottom centre.
  boxes: [
    // hallway: bonk lessons
    { kind: 'prize', pos: [2.5, U + 3.6, -10.4], item: 'popper' },
    { kind: 'prize', pos: [6.5, U + 3.6, -10.4], candles: 5 },
    { kind: 'crate', pos: [10.5, U + 3.6, -10.4], candles: 3 },
    { kind: 'crate', pos: [11, U, -13.6], candles: 2 },
    { kind: 'crate', pos: [11, U + 1.8, -13.6], candles: 2 },
    // bedroom secret (Vader the cat spots it; any bonk reveals it)
    { kind: 'prize', pos: [-9, U + 3.6, 8.5], candles: 5, hidden: true },
    // living room: Ginger's KITTEN BOOST reaches this one
    { kind: 'prize', pos: [-9.5, 8.2, 10.95], item: 'heart', id: 'ginger-box' },
    // kitchen: above the birthday-cake table
    { kind: 'prize', pos: [-12, G + 6.4, -4.4], item: 'hat' },
    // basement
    { kind: 'prize', pos: [9, B + 3.6, 3.5], item: 'lasso' },
    // backyard: crates by the window well, the umbrella on the wall-jump tower, the box puzzle
    { kind: 'crate', pos: [-20, G, -21.6], candles: 3 },
    { kind: 'prize', pos: [-39, 14.2, -18.3], item: 'umbrella', id: 'canyon-box' },
    { kind: 'heavy', pos: [2, G, -37.5], id: 'puzzle-crate' },
    { kind: 'block', pos: [-7, G, -37], color: '#3f8fe8', id: 'block-a' },
    { kind: 'block', pos: [-7, G, -40.2], color: '#e8473c', id: 'block-b' },
    { kind: 'prize', pos: [-10, G + 3.6, -47.5], item: 'heart', hidden: true },
    // front yard: a sugar rush for the last stretch
    { kind: 'prize', pos: [14, G + 3.6, 36], item: 'cake' },
  ],
  buttons: [{ pos: [6, G, -42], opens: 'present-cage' }],
  cages: [{ id: 'present-cage', pos: [-3, G, -41], prize: { item: 'present' } }],
  pawSpots: [{ pos: [-9.5, G, 10.95], r: 1.4, boost: 24 }],
  poundBoxes: [
    { pos: [-11.5, U, -13], candles: 6, color: '#ff9a3c' },
    { pos: [-32, G, -28], candles: 6, color: '#5cc23a', message: 'SANDBOX TREASURE!' },
  ],

  // ===================================================================== enemies, pets, movers
  // tier: dumb (patrols, walks off edges) | alert (spots you, chases, gives up) | smart (flanks, jumps, dodges, ambushes, retreats)
  // A Mario-style ramp: dumb ones indoors upstairs, alert ones in the basement, smart ones outside.
  enemies: [
    { type: 'sock', tier: 'dumb', pos: [6, U, -11.5], patrol: [[0, -11.5], [12, -11.5]] },
    { type: 'sock', tier: 'dumb', pos: [-10, G, 10.9], patrol: [[-16, 10.9], [-4, 10.9]] },
    { type: 'sock', tier: 'dumb', pos: [4, G, 5], patrol: [[0, 5], [10, 5]], speed: 2.0 },
    { type: 'sock', tier: 'dumb', pos: [-3, G, -6], patrol: [[-3.5, -9.5], [-3.5, -3.5], [1, -3.5], [1, -9.5]], loop: true, color: '#fff3c4' },
    { type: 'brick', tier: 'alert', pos: [8, B, -3], patrol: [[12, -3], [4, -3]], sight: 8 },
    { type: 'brick', tier: 'alert', pos: [-6, B, -10], patrol: [[-10, -10], [0, -10]], color: '#3f8fe8', sight: 7 },
    { type: 'brick', tier: 'alert', pos: [-5.5, B, 5], patrol: [[-5.5, 5], [-1, 8.6], [-1, 1.4]], loop: true, color: '#ffd23f', sight: 6, leash: 5 },
    { type: 'sock', tier: 'alert', pos: [14, G, -30], patrol: [[6, -30], [22, -30]] },
    { type: 'sock', tier: 'smart', pos: [-24, G, -35], patrol: [[-30, -35], [-18, -35]], color: '#d6f5ff' },
    { type: 'brick', tier: 'alert', pos: [28, G, -30], patrol: [[24, -26], [32, -34]], color: '#5cc23a', sight: 9 },
    { type: 'sock', tier: 'dumb', pos: [17.5, G, 27], patrol: [[12, 27], [23, 27]], color: '#ffe0ec' },
    { type: 'brick', tier: 'smart', pos: [0, G, 33], patrol: [[-6, 30], [6, 35]], color: '#9b6cff', sight: 8 },
    // a silly sock on the kitchen table: its patrol walks it right off the edge
    { type: 'sock', tier: 'dumb', pos: [-13, G + 3.0, -6], patrol: [[-14, -6], [-20, -6]], color: '#d6f5ff' },
    // ambush: a sock buried in the sandbox pops out when Kinan gets close
    { type: 'sock', tier: 'smart', pos: [-29.6, G, -30.6], ambush: true, ambushR: 5, color: '#f2d79b' },
  ],
  // the equipped cat + dog come along (from the Kinan vs. Mom save, else Ginger + Chikastino); ?cat=cat2&dog=dog2 to try others
  pets: [{ type: 'cat' }, { type: 'dog' }],
  movers: [
    { type: 'fan', pos: [6.5, 7.2, 7.4], ceil: 10, len: 5.4, width: 1.7, speed: 0.7, blades: 4 },
    { type: 'train', center: [-1, B, 5], rx: 13, rz: 6, speed: 4.2, cars: 3 },
    { type: 'lift', from: [3.6, B + 0.8, 5], to: [3.6, -5.6, 5], size: [3.2, 0.8, 3.2], period: 7, pause: 1.2, color: '#5cc23a' },
  ],
  checkpoints: [
    { pos: [17.5, U, -12.4], yaw: 0 },
    { pos: [12.5, B, -2.5], yaw: -90 },
    { pos: [-8.5, G, -20.5], yaw: 180 },
    { pos: [34, G, -10], yaw: 0 },
  ],
  hints: [
    { pos: [-14.5, U, 6.5], r: 5, text: 'Bounce on the bed! (Mom is not looking.)' },
    { pos: [-13, U, -1.6], r: 2.6, text: 'DOUBLE JUMP: press JUMP again in the air! Try it on that tall brick stack. (Fall short? Kinan grabs the edge!)' },
    { pos: [-16.8, U, -4], r: 2.4, text: 'Bookshelves are for CLIMBING! Walk into the shelf, then hold UP.' },
    { pos: [0.5, U, -11.2], r: 3.2, text: '? BOXES! Jump under them and BONK them with your head. Crates break too: bonk them, or BUTT SLAM them.' },
    { pos: [-9.5, G, 10.95], r: 2.2, text: "Ginger's PAW PRINTS! Jump from them and she gives you a big KITTEN BOOST." },
    { pos: [-35.5, G, -21.2], r: 3.5, text: 'WALL JUMP! Jump into the gap, hold toward a wall to slide, then press JUMP to kick off the other one. Up, up, up!' },
    { pos: [2, G, -39.5], r: 4.5, text: 'A PRESENT in a cage! The BIG BUTTON opens it, but only while something HEAVY sits on it. Push the crate on (ACTION grabs it to pull).' },
    { pos: [-11.5, U, -10.5], r: 3.8, text: 'A toy box! Jump on top and press SHIFT (or ACTION) in the air to BUTT SLAM it.' },
    { pos: [15, U, -12], r: 5, text: 'Tip: jump again right as you land for a higher jump. Three in a row = a flip!' },
    { pos: [7, G, 3.5], r: 5, text: 'The bookshelf is a staircase... and that ceiling fan looks rideable!' },
    { pos: [17.5, G, 11.5], r: 4, text: 'The front door is stuck! There has to be another way outside.' },
    { pos: [8, G, -13.3], r: 3.2, text: 'Locked! Maybe the basement has a way out...' },
    { pos: [1.2, G, -9], r: 3.5, text: 'The basement stairs turned into a SLIDE! Wheee!' },
    { pos: [12.5, B, -2.5], r: 5, text: 'Brick City! Climb the brick towers to the window up high.' },
    { pos: [5, B, -4], r: 5, text: 'Angry bricks charge when they spot you. Bop them on the head!' },
    { pos: [-1, B, -5.5], r: 3.2, text: 'Hop on the toy train from the station!' },
    { pos: [-13, G, -24], r: 3.6, dy: 1, text: 'Whoa... the BACK SIDE of your house! You have never seen it before!', cam: { pos: [14, 15, -62], look: [-2, 12, -14], time: 3.4 } },
    { pos: [-6, U - 2, -26], r: 5, dy: 3, text: 'Hold JUMP when you land on a trampoline to bounce extra high. Like... roof high.' },
    { pos: [-6, 23, -14], r: 7, dy: 5, text: 'You are on the ROOF! Is that something shiny on the chimney?' },
    { pos: [30, G, 17], r: 8, text: 'There is the front door! Your party is waiting!' },
  ],
  goal: { pos: [17.5, 0.6, 18.2], r: 2.4, yaw: 0, ring: 2.9, ringY: 3.7 },
  // Glitchy's way-finding paths (offered after 5 losses near a checkpoint). Key = checkpoint index, -1 = the start.
  guides: {
    '-1': [[-5.5, U, -9.5], [-1, U, -11.5], [12, U, -11.5], [17.5, U, -12.4]],
    0: [[17.5, U, -2], [17.5, G, 11], [10, G, 9], [3, G, -4], [1.2, G, -9]],
    1: [[4, B, -12], [2, B + 1.8, -13.3], [-3, B + 3.6, -13.3], [-8, B + 5.4, -13.3], [-14, -3.8, -13.5], [-14, -3.8, -18]],
    2: [[0, G, -24], [20, G, -22], [34, G, -16], [34, G, -10]],
    3: [[34, G, 10], [26, G, 22], [17.5, G, 28], [17.5, 0.6, 19]],
  },
};

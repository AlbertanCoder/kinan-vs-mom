// Toy-world builder. Levels and props call these helpers; every solid shape becomes
//  (1) a piece of chunky rounded geometry (merged later into a few big meshes, coloured by vertex colour)
//  (2) optionally a collider in the physics world.
// Coordinates are LOCAL to the current frame (push/pop), so props can be placed and turned freely.
// Boxes are placed by their BASE CENTRE: box(x, y, z, w, h, d) spans x±w/2, y..y+h, z±d/2.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Named colours (sRGB hex). Levels can add more: builder.pal.myColour = '#hex'.
export const PAL = {
  white: '#ffffff', offwhite: '#f7f3ea', cream: '#f4e7c8', cream2: '#eadab4', red: '#e8473c', roof: '#d9443a', roofDark: '#b8332c',
  kinanRed: '#c2414f', gold: '#f6c445', yellow: '#ffd23f', orange: '#ff9a3c', pink: '#ff8fb8', hotpink: '#ff5fa2', purple: '#9b6cff',
  blue: '#3f8fe8', skyblue: '#7ec8ff', navy: '#2b3a7a', teal: '#2fc4b2', green: '#5cc23a', leaf: '#4cb043', leaf2: '#7fd14d', grass: '#62c544',
  darkgreen: '#2f8a3a', brown: '#8a5a34', wood: '#c98b52', woodLight: '#e2ae73', woodDark: '#8d5a33', tan: '#e9c58f', sand: '#f2d79b',
  grey: '#b8bcc6', lightgrey: '#dfe3ea', darkgrey: '#5f6675', black: '#2a2a33', steel: '#cfd6e2', denim: '#3f63a8',
  wallBed: '#a9d8ff', wallHall: '#fde9b8', wallLiving: '#cdeec0', wallKitchen: '#fff2c9', wallBase: '#d9d4e8',
  carpet: '#6aa8f0', rugRed: '#e86a5a', sock: '#ffffff', lime: '#b5e655', mint: '#9ff0d0', lavender: '#c9b6ff', peach: '#ffc59a',
};

const geoCache = new Map();
function cached(key, make) {
  let g = geoCache.get(key);
  if (!g) { g = make(); geoCache.set(key, g); }
  return g;
}
const k2 = (v) => Math.round(v * 100);

export function roundedBoxGeo(w, h, d, r, seg = 2) {
  r = Math.min(r, Math.min(w, h, d) / 2 - 0.002);
  if (r < 0.015) return cached(`b${k2(w)},${k2(h)},${k2(d)}`, () => new THREE.BoxGeometry(w, h, d));
  return cached(`rb${k2(w)},${k2(h)},${k2(d)},${k2(r)},${seg}`, () => new RoundedBoxGeometry(w, h, d, seg, r));
}

// Cylinder with rounded rim (lathe), centred at origin.
export function roundCylGeo(rt, rb, h, bevel, seg = 20) {
  return cached(`rc${k2(rt)},${k2(rb)},${k2(h)},${k2(bevel)},${seg}`, () => {
    const b = Math.min(bevel, rt * 0.5, rb * 0.5, h * 0.3);
    if (b < 0.01) return new THREE.CylinderGeometry(rt, rb, h, seg, 1);
    const pts = [];
    const hh = h / 2;
    pts.push(new THREE.Vector2(0, -hh));
    for (let i = 0; i <= 3; i++) { const a = -Math.PI / 2 + (i / 3) * Math.PI / 2; pts.push(new THREE.Vector2(rb - b + Math.cos(a) * b, -hh + b + Math.sin(a) * b)); }
    for (let i = 0; i <= 3; i++) { const a = (i / 3) * Math.PI / 2; pts.push(new THREE.Vector2(rt - b + Math.cos(a) * b, hh - b + Math.sin(a) * b)); }
    pts.push(new THREE.Vector2(0, hh));
    return new THREE.LatheGeometry(pts, seg);
  });
}

// Wedge (ramp) of length L along +z, width w along x, low height hLow at z=-L/2, high hHigh at z=+L/2, base at y=0.
function wedgeGeo(w, L, hLow, hHigh) {
  const x0 = -w / 2, x1 = w / 2, z0 = -L / 2, z1 = L / 2;
  const v = [
    // bottom
    x0, 0, z0, x1, 0, z0, x1, 0, z1, x0, 0, z0, x1, 0, z1, x0, 0, z1,
    // top (sloped)
    x0, hLow, z0, x1, hHigh, z1, x1, hLow, z0, x0, hLow, z0, x0, hHigh, z1, x1, hHigh, z1,
    // low end face (z0)
    x0, 0, z0, x0, hLow, z0, x1, hLow, z0, x0, 0, z0, x1, hLow, z0, x1, 0, z0,
    // high end face (z1)
    x0, 0, z1, x1, 0, z1, x1, hHigh, z1, x0, 0, z1, x1, hHigh, z1, x0, hHigh, z1,
    // left side (x0)
    x0, 0, z0, x0, 0, z1, x0, hHigh, z1, x0, 0, z0, x0, hHigh, z1, x0, hLow, z0,
    // right side (x1)
    x1, 0, z0, x1, hLow, z0, x1, hHigh, z1, x1, 0, z0, x1, hHigh, z1, x1, 0, z1,
  ];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}

export class Builder {
  constructor(game, zoneOf) {
    this.game = game;
    this.world = game.world;
    this.pal = Object.assign({}, PAL);
    this.parts = [];
    this.tex = new Map();       // texture name -> list of {geom,matrix}
    this.frames = [{ x: 0, y: 0, z: 0, yaw: 0 }];
    this.zoneOf = zoneOf || (() => 'o');
    this.chunk = 56;
    this.colliders = [];
    this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._s = new THREE.Vector3(); this._p = new THREE.Vector3();
    this._up = new THREE.Vector3(0, 1, 0);
  }

  get f() { return this.frames[this.frames.length - 1]; }
  push(x, y, z, yawDeg = 0) {
    const f = this.f;
    const [wx, wy, wz] = this.toWorld(x, y, z);
    this.frames.push({ x: wx, y: wy, z: wz, yaw: f.yaw + yawDeg * Math.PI / 180 });
  }
  pop() { if (this.frames.length > 1) this.frames.pop(); }
  toWorld(lx, ly, lz) {
    const f = this.f, c = Math.cos(f.yaw), s = Math.sin(f.yaw);
    return [f.x + lx * c + lz * s, f.y + ly, f.z - lx * s + lz * c];
  }
  color(c) { return this.pal[c] || c || '#ff00ff'; }

  // Raw geometry part, already centred: world position + yaw + scale.
  part(geom, lx, ly, lz, color, o = {}) {
    const [x, y, z] = this.toWorld(lx, ly, lz);
    const yaw = this.f.yaw + (o.yaw || 0) * Math.PI / 180;
    this._q.setFromAxisAngle(this._up, yaw);
    if (o.rx || o.rz) {
      const e = new THREE.Euler((o.rx || 0) * Math.PI / 180, 0, (o.rz || 0) * Math.PI / 180, 'XYZ');
      this._q.multiply(new THREE.Quaternion().setFromEuler(e));
    }
    const s = o.s || 1;
    if (Array.isArray(s)) this._s.set(s[0], s[1], s[2]); else this._s.set(s, s, s);
    this._p.set(x, y, z);
    const m = new THREE.Matrix4().compose(this._p, this._q, this._s);
    this.parts.push({
      geom, m, color: new THREE.Color(this.color(color)), mat: o.mat || 'toy', cast: o.cast !== false,
      zone: o.zone || this.zoneOf(x, y, z), x, z, ao: o.ao !== false, y,
    });
  }

  // Collider in local frame coordinates (box/ramp centre + yaw are converted to world).
  collider(c) {
    const out = Object.assign({}, c);
    if (c.type === 'cyl') {
      const [x, y, z] = this.toWorld(c.cx, 0, c.cz);
      out.cx = x; out.cz = z; out.minY = c.minY + this.f.y; out.maxY = c.maxY + this.f.y; out.cy = (out.minY + out.maxY) / 2;
    } else if (c.type === 'ramp') {
      const [x, , z] = this.toWorld(c.cx, 0, c.cz);
      out.cx = x; out.cz = z; out.minY = c.minY + this.f.y; out.yaw = (c.yaw || 0) + this.f.yaw;
    } else {
      const [x, y, z] = this.toWorld(c.cx, c.cy, c.cz);
      out.cx = x; out.cy = y; out.cz = z; out.yaw = (c.yaw || 0) + this.f.yaw;
    }
    this.world.add(out);
    return out;
  }

  // ---- primitives -------------------------------------------------------------------------
  box(x, y, z, w, h, d, color, o = {}) {
    if (o.vis !== false) {
      const r = o.r !== undefined ? o.r : Math.min(0.22, Math.min(w, h, d) * 0.2);
      this.part(roundedBoxGeo(w, h, d, r, o.seg || (Math.min(w, h, d) < 0.9 || r < 0.09 ? 1 : 2)), x, y + h / 2, z, color, o);
    }
    if (o.col === false) return null;
    return this.collider(Object.assign({ type: 'box', cx: x, cy: y + h / 2, cz: z, hx: w / 2, hy: h / 2, hz: d / 2, yaw: (o.yaw || 0) * Math.PI / 180, cam: !!o.cam }, o.climb ? { climb: true } : {}, o.phys || {}));
  }

  cyl(x, y, z, r, h, color, o = {}) {
    if (o.vis !== false) {
      const g = roundCylGeo(r * (o.taper || 1), r, h, o.bevel !== undefined ? o.bevel : Math.min(0.12, r * 0.25), o.seg || 20);
      this.part(g, x, y + h / 2, z, color, o);
    }
    if (!o.col) return null;
    return this.collider(Object.assign({ type: 'cyl', cx: x, cz: z, r: o.cr || r, minY: y, maxY: y + h, cam: !!o.cam }, o.phys || {}));
  }

  sphere(x, y, z, r, color, o = {}) {
    const seg = o.seg || 16;
    const g = cached(`sp${k2(r)},${seg}`, () => new THREE.SphereGeometry(r, seg, Math.max(6, seg >> 1)));
    this.part(g, x, y, z, color, o);
    if (o.col) {
      const s = Array.isArray(o.s) ? o.s : [o.s || 1, o.s || 1, o.s || 1];
      return this.collider(Object.assign({ type: 'cyl', cx: x, cz: z, r: r * Math.max(s[0], s[2]) * 0.9, minY: y - r * s[1], maxY: y + r * s[1] * (o.topFrac || 0.85) }, o.phys || {}));
    }
    return null;
  }

  cone(x, y, z, r, h, color, o = {}) {
    const seg = o.seg || 18;
    const g = cached(`cn${k2(r)},${k2(h)},${seg}`, () => new THREE.ConeGeometry(r, h, seg, 1));
    this.part(g, x, y + h / 2, z, color, o);
  }

  torus(x, y, z, R, r, color, o = {}) {
    const g = cached(`to${k2(R)},${k2(r)}`, () => new THREE.TorusGeometry(R, r, 8, 24));
    this.part(g, x, y, z, color, Object.assign({ rx: 90 }, o));
  }

  // Ramp from low end (x0,z0) at height y0 to high end (x1,z1) at y1, width w. Solid underneath down to base.
  ramp(x0, z0, y0, x1, z1, y1, w, color, o = {}) {
    const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz);
    const yawL = Math.atan2(dx, dz);
    const base = o.base !== undefined ? o.base : Math.min(y0, y1);
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (o.vis !== false) {
      if (o.thick) {
        // thin slanted plate (roofs, slides)
        const ang = Math.atan2(y1 - y0, L);
        const len = Math.hypot(L, y1 - y0);
        const g = roundedBoxGeo(w, o.thick, len + (o.over || 0) * 2, Math.min(0.12, o.thick * 0.4), 2);
        this.part(g, cx, (y0 + y1) / 2 - o.thick / 2 * Math.cos(ang), cz, color, Object.assign({}, o, { yaw: yawL * 180 / Math.PI, rx: -ang * 180 / Math.PI }));
      } else {
        const g = wedgeGeo(w, L, y0 - base, y1 - base);
        this.part(g, cx, base, cz, color, Object.assign({}, o, { yaw: yawL * 180 / Math.PI, ao: false }));
      }
    }
    if (o.col === false) return null;
    return this.collider(Object.assign({ type: 'ramp', cx, cz, hx: w / 2, hz: L / 2, yaw: yawL, minY: base, h0: y0 - base, h1: y1 - base, cam: !!o.cam }, o.phys || {}));
  }

  // Staircase: visual steps + one smooth ramp collider.
  stairs(x0, z0, y0, x1, z1, y1, w, n, color, o = {}) {
    const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz);
    const yawDeg = Math.atan2(dx, dz) * 180 / Math.PI;
    const rise = (y1 - y0) / n, run = L / n;
    this.push(x0, 0, z0, yawDeg);
    for (let i = 0; i < n; i++) {
      const top = y0 + rise * (i + 1);
      const base = o.solid === false ? top - rise - 0.4 : (o.base !== undefined ? o.base : y0);
      this.box(0, base, run * (i + 0.5), w, top - base, run + 0.02, i % 2 ? color : (o.color2 || color), { col: false, r: 0.12, cast: o.cast });
      if (o.nose) this.box(0, top - 0.12, run * (i + 0.02) + 0.12, w + 0.1, 0.18, 0.3, o.nose, { col: false, r: 0.08 });
      if (o.runner) this.box(0, top, run * (i + 0.5), w * 0.55, 0.06, run + 0.04, o.runner, { col: false, r: 0.02, mat: 'soft', cast: false });
    }
    this.pop();
    const half = rise / 2;
    return this.ramp(x0, z0, y0 + half, x1, z1, y1 + half, w, color, { vis: false, base: o.base !== undefined ? o.base : y0, cam: !!o.cam });
  }

  // Wall from A to B (local), base y0 to top y1, thickness t. holes: [{at, w, y, h, kind:'open'|'window'|'door', frame}]
  // o.color2 = colour of the outer face (+normal side = left of A->B... use o.flip to swap).
  wall(ax, az, bx, bz, y0, y1, t, color, holes = [], o = {}) {
    const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
    const yawDeg = Math.atan2(-dz, dx) * 180 / Math.PI;
    this.push(ax, 0, az, yawDeg);
    const H = y1 - y0;
    const hs = holes.map((h) => ({ a: h.at - h.w / 2, b: h.at + h.w / 2, y: h.y || 0, h: h.h, kind: h.kind || 'open', frame: h.frame, h0: h })).sort((p, q) => p.a - q.a);
    const piece = (u0, u1, v0, v1) => {
      if (u1 - u0 < 0.01 || v1 - v0 < 0.01) return;
      const cx = (u0 + u1) / 2, w = u1 - u0, hh = v1 - v0;
      // optional textured faces (wallpaper inside = local -z, siding outside = local +z), world-aligned pattern
      if (o.tex) this._wallFace(o.tex, u0, u1, y0 + v0, y0 + v1, -t / 2 - 0.015, -1, o.texScale || 4, o.uOff || 0);
      if (o.tex2) this._wallFace(o.tex2, u0, u1, y0 + v0, y0 + v1, t / 2 + 0.015, 1, o.texScale2 || 5, o.uOff || 0);
      // skirting boards along the floor
      const fl = o.trimY !== undefined ? o.trimY : (y0 < 0 && y0 > -1.5 ? 1 : 0);   // exterior ground walls start below the floor
      if (v0 <= fl + 0.01 && v1 > fl + 0.6) {
        if (o.trim) this.box(cx, y0 + fl, -t / 2 - 0.05, w, 0.55, 0.14, o.trim, { col: false, r: 0.04, cast: false, seg: 1, ao: false });
        if (o.trim2) this.box(cx, y0 + fl, t / 2 + 0.05, w, 0.55, 0.14, o.trim2, { col: false, r: 0.04, cast: false, seg: 1, ao: false });
      }
      if (o.color2) {
        const t1 = t * 0.5;
        this.box(cx, y0 + v0, -t / 4, w, hh, t1, color, { col: false, r: o.r !== undefined ? o.r : 0.06, cast: false, seg: 1 });
        this.box(cx, y0 + v0, t / 4, w, hh, t1, o.color2, { col: false, r: o.r !== undefined ? o.r : 0.06, cast: false, seg: 1, zone: o.zone2 });
      } else {
        this.box(cx, y0 + v0, 0, w, hh, t, color, { col: false, r: o.r !== undefined ? o.r : 0.06, cast: false, seg: 1 });
      }
      this.collider({ type: 'box', cx, cy: y0 + v0 + hh / 2, cz: 0, hx: w / 2, hy: hh / 2, hz: t / 2, cam: o.cam !== false, noGround: o.noGround });
    };
    let cur = 0;
    for (const h of hs) {
      piece(cur, h.a, 0, H);
      piece(h.a, h.b, 0, h.y);
      piece(h.a, h.b, h.y + h.h, H);
      cur = h.b;
      const fc = h.frame || 'white';
      const ft = 0.32;
      if (h.kind === 'window') {
        // frame, sill, cross bars, glass with collider
        this.box((h.a + h.b) / 2, y0 + h.y - 0.1, 0, h.b - h.a + 0.7, 0.32, t + 0.7, fc, { col: false, r: 0.1 });
        this.box((h.a + h.b) / 2, y0 + h.y + h.h - 0.1, 0, h.b - h.a + 0.5, 0.3, t + 0.3, fc, { col: false, r: 0.1 });
        this.box(h.a + ft / 2, y0 + h.y, 0, ft, h.h, t + 0.3, fc, { col: false, r: 0.08 });
        this.box(h.b - ft / 2, y0 + h.y, 0, ft, h.h, t + 0.3, fc, { col: false, r: 0.08 });
        this.box((h.a + h.b) / 2, y0 + h.y, 0, 0.18, h.h, 0.22, fc, { col: false, r: 0.05 });
        this.box((h.a + h.b) / 2, y0 + h.y + h.h / 2 - 0.09, 0, h.b - h.a, 0.18, 0.22, fc, { col: false, r: 0.05 });
        if (!h.h0.noGlass) {
          this.box((h.a + h.b) / 2, y0 + h.y, 0, h.b - h.a - 0.1, h.h, 0.08, '#cfeeff', { mat: 'glass', col: false, r: 0, cast: false });
          this.collider({ type: 'box', cx: (h.a + h.b) / 2, cy: y0 + h.y + h.h / 2, cz: 0, hx: (h.b - h.a) / 2, hy: h.h / 2, hz: t / 2, cam: true });
        }
      } else if (h.kind === 'door' || h.kind === 'open') {
        if (h.frame !== false) {
          this.box(h.a - 0.15, y0 + h.y, 0, 0.36, h.h + 0.2, t + 0.36, fc, { col: false, r: 0.1 });
          this.box(h.b + 0.15, y0 + h.y, 0, 0.36, h.h + 0.2, t + 0.36, fc, { col: false, r: 0.1 });
          this.box((h.a + h.b) / 2, y0 + h.y + h.h, 0, h.b - h.a + 0.66, 0.36, t + 0.36, fc, { col: false, r: 0.1 });
        }
        if (h.kind === 'door') {
          const dc = h.h0.door || 'woodLight';
          const side = h.h0.side || 1;
          this.box((h.a + h.b) / 2, y0 + h.y, side * (t / 2 - 0.15), h.b - h.a - 0.1, h.h - 0.05, 0.3, dc, { col: false, r: 0.08 });
          this.box((h.a + h.b) / 2 - (h.b - h.a) * 0.25, y0 + h.y + h.h * 0.55, side * (t / 2 - 0.15), (h.b - h.a) * 0.32, h.h * 0.32, 0.4, h.h0.panel || dc, { col: false, r: 0.08 });
          this.box((h.a + h.b) / 2 + (h.b - h.a) * 0.25, y0 + h.y + h.h * 0.55, side * (t / 2 - 0.15), (h.b - h.a) * 0.32, h.h * 0.32, 0.4, h.h0.panel || dc, { col: false, r: 0.08 });
          this.sphere((h.b - 0.6), y0 + h.y + h.h * 0.45, side * (t / 2 + 0.1), 0.22, 'gold', { mat: 'gloss' });
          this.collider({ type: 'box', cx: (h.a + h.b) / 2, cy: y0 + h.y + h.h / 2, cz: 0, hx: (h.b - h.a) / 2, hy: h.h / 2, hz: t / 2, cam: true });
        }
      }
    }
    piece(cur, L, 0, H);
    this.pop();
  }

  // Horizontal slab (floor/ceiling) from (x0,z0)-(x1,z1), y0..y1, with rectangular holes [[hx0,hz0,hx1,hz1],...].
  // o.tex: name of a floor texture to lay on top (o.texScale world units per repeat).
  slab(x0, z0, x1, z1, y0, y1, color, holes = [], o = {}) {
    const rects = subtractRects([x0, z0, x1, z1], holes);
    for (const [a, b, c, d] of rects) {
      this.box((a + c) / 2, y0, (b + d) / 2, c - a, y1 - y0, d - b, color, Object.assign({ r: 0.04, seg: 1, cast: false, cam: o.cam !== false, ao: false }, o, { tex: undefined }));
      if (o.tex) this.texQuad(o.tex, a, b, c, d, y1 + 0.012, o.texScale || 4);
      if (o.texBottom) this.texQuad(o.texBottom, a, b, c, d, y0 - 0.012, o.texScale || 4, true);
    }
  }

  // Textured horizontal quad (world-mapped UVs), merged per texture.
  texQuad(name, x0, z0, x1, z1, y, scale = 4, down = false) {
    const [ax, , az] = this.toWorld(x0, y, z0), [bx, , bz] = this.toWorld(x1, y, z1);
    const [cx, , cz] = this.toWorld(x1, y, z0), [dx, , dz] = this.toWorld(x0, y, z1);
    const wy = y + this.f.y;
    const pos = down
      ? [ax, wy, az, cx, wy, cz, bx, wy, bz, ax, wy, az, bx, wy, bz, dx, wy, dz]
      : [ax, wy, az, bx, wy, bz, cx, wy, cz, ax, wy, az, dx, wy, dz, bx, wy, bz];
    const uv = [];
    for (let i = 0; i < pos.length; i += 3) uv.push(pos[i] / scale, -pos[i + 2] / scale);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    this._addTex(name, g, this.zoneOf(ax, wy, az));
  }

  // Vertical textured face in the local frame (x0..x1, y0..y1 at depth z), facing +z (facing=1) or -z (-1).
  _wallFace(name, x0, x1, y0, y1, z, facing, scale, uOff) {
    const P = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => this.toWorld(x, y, z));
    const U = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => [(x + uOff) / scale * facing, (y + this.f.y) / scale]);
    const order = facing > 0 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2];
    const pos = [], uv = [];
    for (const i of order) { pos.push(...P[i]); uv.push(...U[i]); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    this._addTex(name, g, this.zoneOf(P[0][0], (P[0][1] + P[2][1]) / 2, P[0][2]));
  }

  // Sloped textured strip from (x0,z0,y0) to (x1,z1,y1) with horizontal width w (roof shingles).
  texSlope(name, x0, z0, y0, x1, z1, y1, w, scale = 4) {
    const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz);
    const px = -dz / L * w / 2, pz = dx / L * w / 2;
    const P = [[x0 - px, y0, z0 - pz], [x0 + px, y0, z0 + pz], [x1 + px, y1, z1 + pz], [x1 - px, y1, z1 - pz]].map(([x, y, z]) => this.toWorld(x, y, z));
    const len = Math.hypot(L, y1 - y0);
    const U = [[0, 0], [w / scale, 0], [w / scale, len / scale], [0, len / scale]];
    const pos = [], uv = [];
    // pick the winding that faces up
    const ax = P[1][0] - P[0][0], ay = P[1][1] - P[0][1], az = P[1][2] - P[0][2];
    const bx = P[2][0] - P[0][0], by = P[2][1] - P[0][1], bz = P[2][2] - P[0][2];
    const ny = az * bx - ax * bz;
    const order = ny > 0 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2];
    for (const i of order) { pos.push(...P[i]); uv.push(...U[i]); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    this._addTex(name, g, this.zoneOf(P[0][0], P[0][1], P[0][2]));
  }

  // Textured rectangle lying flat in the LOCAL frame (rugs, mats), UVs 0..rep so the picture fits once.
  texRect(name, cx, cz, w, d, y, rep = 1) {
    const P = [[cx - w / 2, cz - d / 2], [cx + w / 2, cz - d / 2], [cx + w / 2, cz + d / 2], [cx - w / 2, cz + d / 2]].map(([x, z]) => this.toWorld(x, y, z));
    const pos = [], uv = [];
    const U = [[0, rep], [rep, rep], [rep, 0], [0, 0]];
    for (const i of [0, 2, 1, 0, 3, 2]) { pos.push(...P[i]); uv.push(...U[i]); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    this._addTex(name, g, this.zoneOf(P[0][0], P[0][1], P[0][2]));
  }

  // Textured vertical picture (poster, sign face, TV). Centre at local (x,y,z), facing local +z turned by yawDeg.
  texPanel(name, x, y, z, w, h, yawDeg = 0, o = {}) {
    const g = new THREE.PlaneGeometry(w, h);
    const [wx, wy, wz] = this.toWorld(x, y, z);
    const m = new THREE.Matrix4().compose(new THREE.Vector3(wx, wy, wz), new THREE.Quaternion().setFromAxisAngle(this._up, this.f.yaw + yawDeg * Math.PI / 180), new THREE.Vector3(1, 1, 1));
    g.applyMatrix4(m);
    this._addTex(name, g, this.zoneOf(wx, wy, wz), o);
  }

  _addTex(name, g, zone, o = {}) {
    if (!this.tex.has(name)) this.tex.set(name, []);
    this.tex.get(name).push({ g, zone, o });
  }

  // Merge everything into meshes. Returns {meshes, castByZone}
  finalize(scene, materials, textures) {
    const groups = new Map();
    for (const p of this.parts) {
      const cx = Math.floor(p.x / this.chunk), cz = Math.floor(p.z / this.chunk);
      const key = `${p.zone}|${cx},${cz}|${p.mat}|${p.cast ? 1 : 0}`;
      let g = groups.get(key);
      if (!g) { g = { zone: p.zone, mat: p.mat, cast: p.cast, list: [] }; groups.set(key, g); }
      g.list.push(p);
    }
    const castByZone = {};
    const meshes = [];
    let tris = 0;
    for (const g of groups.values()) {
      const geoms = [];
      for (const p of g.list) {
        let geo = p.geom.clone();
        for (const name of Object.keys(geo.attributes)) if (name !== 'position' && name !== 'normal') geo.deleteAttribute(name);
        if (!geo.index) {
          const n = geo.attributes.position.count;
          const idx = new (n > 65535 ? Uint32Array : Uint16Array)(n);
          for (let i = 0; i < n; i++) idx[i] = i;
          geo.setIndex(new THREE.BufferAttribute(idx, 1));
        }
        // vertex colour with a soft bottom-darkening "ambient occlusion"
        const pos = geo.attributes.position, n = pos.count;
        const col = new Float32Array(n * 3);
        let minY = Infinity, maxY = -Infinity;
        if (p.ao) for (let i = 0; i < n; i++) { const y = pos.getY(i); if (y < minY) minY = y; if (y > maxY) maxY = y; }
        const span = maxY - minY;
        for (let i = 0; i < n; i++) {
          let f = 1;
          if (p.ao && span > 0.25) { const t = (pos.getY(i) - minY) / span; f = 0.78 + 0.22 * Math.min(1, t * 1.6); }
          col[i * 3] = p.color.r * f; col[i * 3 + 1] = p.color.g * f; col[i * 3 + 2] = p.color.b * f;
        }
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        geo.applyMatrix4(p.m);
        geoms.push(geo);
      }
      // keep index type consistent
      const big = geoms.some((x) => x.index.array instanceof Uint32Array) || geoms.reduce((s, x) => s + x.attributes.position.count, 0) > 65535;
      if (big) for (const x of geoms) if (!(x.index.array instanceof Uint32Array)) x.setIndex(new THREE.BufferAttribute(Uint32Array.from(x.index.array), 1));
      const merged = mergeGeometries(geoms, false);
      for (const x of geoms) x.dispose();
      if (!merged) continue;
      merged.computeBoundingSphere();
      tris += merged.index.count / 3;
      const mesh = new THREE.Mesh(merged, materials[g.mat] || materials.toy);
      mesh.receiveShadow = g.mat !== 'glow' && g.mat !== 'glass';
      mesh.castShadow = false;
      mesh.matrixAutoUpdate = false; mesh.updateMatrix();
      if (g.mat === 'glass') mesh.renderOrder = 2;
      scene.add(mesh);
      meshes.push(mesh);
      if (g.cast) (castByZone[g.zone] || (castByZone[g.zone] = [])).push(mesh);
    }
    // textured quads
    for (const [name, list] of this.tex) {
      const byZone = new Map();
      for (const it of list) { if (!byZone.has(it.zone)) byZone.set(it.zone, []); byZone.get(it.zone).push(it.g); }
      for (const [, gs] of byZone) {
        const merged = mergeGeometries(gs, false);
        if (!merged) continue;
        merged.computeBoundingSphere();
        const mat = textures.material(name);
        const mesh = new THREE.Mesh(merged, mat);
        mesh.receiveShadow = true;
        mesh.matrixAutoUpdate = false; mesh.updateMatrix();
        scene.add(mesh);
        meshes.push(mesh);
        tris += merged.attributes.position.count / 3;
      }
    }
    this.parts = []; this.tex.clear();
    return { meshes, castByZone, tris };
  }
}

// Rectangle minus holes -> list of rectangles [x0,z0,x1,z1].
export function subtractRects(r, holes) {
  if (!holes.length) return [r];
  const xs = new Set([r[0], r[2]]), zs = new Set([r[1], r[3]]);
  for (const h of holes) {
    if (h[0] > r[0] && h[0] < r[2]) xs.add(h[0]); if (h[2] > r[0] && h[2] < r[2]) xs.add(h[2]);
    if (h[1] > r[1] && h[1] < r[3]) zs.add(h[1]); if (h[3] > r[1] && h[3] < r[3]) zs.add(h[3]);
  }
  const X = [...xs].sort((a, b) => a - b), Z = [...zs].sort((a, b) => a - b);
  const out = [];
  for (let j = 0; j < Z.length - 1; j++) {
    let run = null;
    for (let i = 0; i < X.length - 1; i++) {
      const cx = (X[i] + X[i + 1]) / 2, cz = (Z[j] + Z[j + 1]) / 2;
      const inHole = holes.some((h) => cx > h[0] && cx < h[2] && cz > h[1] && cz < h[3]);
      if (!inHole) { if (run) run[2] = X[i + 1]; else run = [X[i], Z[j], X[i + 1], Z[j + 1]]; }
      else if (run) { out.push(run); run = null; }
    }
    if (run) out.push(run);
  }
  return out;
}

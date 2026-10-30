// 2.5D SIDE MODE (opt-in per level, added 2026-10-29 as a test for World 12).
// A level that declares
//     side: { path: [[x, z], ...], dist, height, pitch, lookAhead, round }
// plays like Worlds 1-11 but in the real 3D world: Kinan runs ALONG the path (right = forward, left = back),
// his feet are held on the path line, and the camera watches from the side by itself (no camera turning).
// Levels without `side` never create a SidePath and play exactly as before.
//   path       ground-plane points [x, z] in the order Kinan runs (first point = the left end of the screen)
//   round      corner radius (default 8): corners are rounded so Kinan and the camera swing smoothly
//   dist       camera distance from the path (default 17)      height  look point above Kinan's feet (default 2.2)
//   pitch      camera tilt down, radians (default 0.15)        lookAhead  how far the camera looks ahead (default 3.5)
// The camera sits on the side of the path where, looking at the path, "forward" points to the right of the screen:
// for a path heading toward -x the camera is on the -z side looking toward +z.
import { clamp } from './util.js';

export class SidePath {
  constructor(def) {
    this.def = def;
    const raw = (def.path || []).map(([x, z]) => ({ x, z }));
    if (raw.length < 2) throw new Error('side.path needs at least two points');
    const R = def.round ?? 8;
    const pts = [raw[0]];
    for (let i = 1; i < raw.length - 1; i++) {
      const a = raw[i - 1], b = raw[i], c = raw[i + 1];
      const l1 = Math.hypot(b.x - a.x, b.z - a.z), l2 = Math.hypot(c.x - b.x, c.z - b.z);
      const u1x = (b.x - a.x) / l1, u1z = (b.z - a.z) / l1, u2x = (c.x - b.x) / l2, u2z = (c.z - b.z) / l2;
      const turn = Math.acos(clamp(u1x * u2x + u1z * u2z, -1, 1));
      if (turn < 1e-3) { pts.push(b); continue; }
      // a smooth curve (quadratic Bezier) from a little before the corner to a little after it
      const cut = Math.min(R * Math.tan(turn / 2), l1 * 0.45, l2 * 0.45);
      const p0x = b.x - u1x * cut, p0z = b.z - u1z * cut, p2x = b.x + u2x * cut, p2z = b.z + u2z * cut;
      const n = Math.max(4, Math.ceil(turn / 0.05));
      for (let k = 0; k <= n; k++) {
        const t = k / n, m = 1 - t;
        pts.push({ x: m * m * p0x + 2 * m * t * b.x + t * t * p2x, z: m * m * p0z + 2 * m * t * b.z + t * t * p2z });
      }
    }
    pts.push(raw[raw.length - 1]);
    // drop repeated points, then measure
    this.p = pts.filter((q, i) => i === 0 || Math.hypot(q.x - pts[i - 1].x, q.z - pts[i - 1].z) > 1e-4);
    this.s = [0];
    for (let i = 1; i < this.p.length; i++) this.s.push(this.s[i - 1] + Math.hypot(this.p[i].x - this.p[i - 1].x, this.p[i].z - this.p[i - 1].z));
    this.length = this.s[this.s.length - 1];
  }

  // fills `o` with the path point at segment i, fraction t: position, distance along the path, direction,
  // and the side normal (nx, nz) pointing from the path toward the camera
  _fill(o, i, t) {
    const a = this.p[i], b = this.p[i + 1];
    const L = this.s[i + 1] - this.s[i] || 1;
    o.x = a.x + (b.x - a.x) * t; o.z = a.z + (b.z - a.z) * t;
    o.s = this.s[i] + L * t;
    o.tx = (b.x - a.x) / L; o.tz = (b.z - a.z) / L;
    o.nx = -o.tz; o.nz = o.tx;
    o.i = i;
    return o;
  }

  // nearest point on the path to (x, z); o.off = how far (x, z) is from the line, toward the camera
  project(x, z, o = {}) {
    let best = Infinity, bi = 0, bt = 0;
    for (let i = 0; i < this.p.length - 1; i++) {
      const a = this.p[i], b = this.p[i + 1];
      const dx = b.x - a.x, dz = b.z - a.z, l2 = dx * dx + dz * dz || 1;
      const t = clamp(((x - a.x) * dx + (z - a.z) * dz) / l2, 0, 1);
      const qx = a.x + dx * t - x, qz = a.z + dz * t - z, d2 = qx * qx + qz * qz;
      if (d2 < best) { best = d2; bi = i; bt = t; }
    }
    this._fill(o, bi, bt);
    o.off = (x - o.x) * o.nx + (z - o.z) * o.nz;
    return o;
  }

  // the path point at distance s (clamped to the ends)
  at(s, o = {}) {
    s = clamp(s, 0, this.length);
    let i = 0;
    while (i < this.p.length - 2 && this.s[i + 1] < s) i++;
    const L = this.s[i + 1] - this.s[i] || 1;
    return this._fill(o, i, clamp((s - this.s[i]) / L, 0, 1));
  }

  // the path's direction averaged over [s - w, s + w]: the camera turns with this, so corners swing smoothly
  dirAround(s, w, o = {}) {
    const a = this.at(s - w, this._da || (this._da = {})), b = this.at(s + w, this._db || (this._db = {}));
    let dx = b.x - a.x, dz = b.z - a.z;
    const l = Math.hypot(dx, dz);
    if (l < 1e-3) { const c = this.at(s, o); dx = c.tx; dz = c.tz; } else { dx /= l; dz /= l; }
    o.x = dx; o.z = dz;
    return o;
  }

  // camera yaw (CameraRig convention: camera = look + (sin yaw, ., cos yaw) * dist) for path direction (dx, dz)
  static yawFor(dx, dz) { return Math.atan2(-dz, dx); }
}

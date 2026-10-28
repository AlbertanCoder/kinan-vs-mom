// Collision world: simple, robust shapes that cover a toy house.
//   box  : centre (cx,cy,cz), half sizes (hx,hy,hz), optional yaw (turn around the up axis)
//   ramp : like a box but the top slopes from h0 (at local -z) to h1 (at local +z). Walkable slopes / stairs / roofs.
//   cyl  : upright cylinder (cx,cz,r, minY..maxY)
// Static shapes live in a grid for fast lookups; moving platforms are checked every frame.
// Yaw convention matches three.js rotation.y: local (lx,lz) -> world (cx + lx*c + lz*s, cz - lx*s + lz*c).

export class World {
  constructor(cell = 8) {
    this.cell = cell;
    this.grid = new Map();
    this.statics = [];
    this.movers = [];
    this.stamp = 1;
  }

  add(c) {
    prep(c);
    if (c.moving) this.movers.push(c);
    else {
      this.statics.push(c);
      const s = this.cell;
      const x0 = Math.floor(c.bx0 / s), x1 = Math.floor(c.bx1 / s), z0 = Math.floor(c.bz0 / s), z1 = Math.floor(c.bz1 / s);
      for (let i = x0; i <= x1; i++) for (let j = z0; j <= z1; j++) {
        const k = i * 73856093 ^ j * 19349663;
        let list = this.grid.get(k);
        if (!list) { list = []; this.grid.set(k, list); }
        list.push(c);
      }
    }
    return c;
  }

  remove(c) {
    c.dead = true;
    if (c.moving) this.movers.splice(this.movers.indexOf(c), 1);
  }

  // All colliders whose xz bounds touch the rectangle.
  query(x0, z0, x1, z1, out = []) {
    out.length = 0;
    const st = ++this.stamp, s = this.cell;
    const i0 = Math.floor(x0 / s), i1 = Math.floor(x1 / s), j0 = Math.floor(z0 / s), j1 = Math.floor(z1 / s);
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
      const list = this.grid.get(i * 73856093 ^ j * 19349663);
      if (!list) continue;
      for (const c of list) {
        if (c.stamp === st || c.dead) continue;
        c.stamp = st;
        if (c.bx1 < x0 || c.bx0 > x1 || c.bz1 < z0 || c.bz0 > z1) continue;
        out.push(c);
      }
    }
    for (const c of this.movers) {
      if (c.dead || !c.solid) continue;
      if (c.bx1 < x0 || c.bx0 > x1 || c.bz1 < z0 || c.bz0 > z1) continue;
      out.push(c);
    }
    return out;
  }

  // Highest walkable top under point/circle (x,z,r) that is <= yMax. Returns {y, c} or null.
  groundAt(x, z, yMax, r = 0, out = this._tmp || (this._tmp = [])) {
    const list = this.query(x - r - 0.01, z - r - 0.01, x + r + 0.01, z + r + 0.01, out);
    let best = -Infinity, bc = null;
    for (const c of list) {
      if (c.noGround) continue;
      if (r > 0 ? !circleTouches(c, x, z, r) : !pointInside(c, x, z)) continue;
      const t = topAt(c, x, z);
      if (t <= yMax && t > best) { best = t; bc = c; }
    }
    return bc ? { y: best, c: bc } : null;
  }

  // Segment ray cast against colliders flagged cam:true. Returns hit distance (or maxD).
  rayCam(ox, oy, oz, dx, dy, dz, maxD) {
    const ex = ox + dx * maxD, ez = oz + dz * maxD;
    const list = this.query(Math.min(ox, ex) - 0.5, Math.min(oz, ez) - 0.5, Math.max(ox, ex) + 0.5, Math.max(oz, ez) + 0.5, this._rc || (this._rc = []));
    let best = maxD;
    for (const c of list) {
      if (!c.cam) continue;
      const t = rayBox(c, ox, oy, oz, dx, dy, dz, best);
      if (t < best) best = t;
    }
    return best;
  }
}

export function prep(c) {
  c.type = c.type || 'box';
  c.yaw = c.yaw || 0;
  c.cos = Math.cos(c.yaw); c.sin = Math.sin(c.yaw);
  if (c.solid === undefined) c.solid = true;
  if (c.type === 'cyl') {
    c.bx0 = c.cx - c.r; c.bx1 = c.cx + c.r; c.bz0 = c.cz - c.r; c.bz1 = c.cz + c.r;
  } else {
    const ex = Math.abs(c.cos) * c.hx + Math.abs(c.sin) * c.hz;
    const ez = Math.abs(c.sin) * c.hx + Math.abs(c.cos) * c.hz;
    c.bx0 = c.cx - ex; c.bx1 = c.cx + ex; c.bz0 = c.cz - ez; c.bz1 = c.cz + ez;
  }
  if (c.type === 'box') { c.minY = c.cy - c.hy; c.maxY = c.cy + c.hy; }
  if (c.type === 'ramp') { c.maxY = c.minY + Math.max(c.h0, c.h1); }
  return c;
}

// Re-run after moving a mover (keeps its bounds right).
export function moved(c) {
  c.cos = Math.cos(c.yaw); c.sin = Math.sin(c.yaw);
  if (c.type === 'cyl') {
    c.bx0 = c.cx - c.r; c.bx1 = c.cx + c.r; c.bz0 = c.cz - c.r; c.bz1 = c.cz + c.r;
  } else {
    const ex = Math.abs(c.cos) * c.hx + Math.abs(c.sin) * c.hz;
    const ez = Math.abs(c.sin) * c.hx + Math.abs(c.cos) * c.hz;
    c.bx0 = c.cx - ex; c.bx1 = c.cx + ex; c.bz0 = c.cz - ez; c.bz1 = c.cz + ez;
  }
  if (c.type === 'box') { c.minY = c.cy - c.hy; c.maxY = c.cy + c.hy; }
}

export function toLocal(c, x, z) {
  const dx = x - c.cx, dz = z - c.cz;
  return [dx * c.cos - dz * c.sin, dx * c.sin + dz * c.cos];
}
export function toWorldDir(c, lx, lz) {
  return [lx * c.cos + lz * c.sin, -lx * c.sin + lz * c.cos];
}

export function topAt(c, x, z) {
  if (c.type !== 'ramp') return c.maxY;
  const [, lz] = toLocal(c, x, z);
  const t = (Math.min(Math.max(lz, -c.hz), c.hz) + c.hz) / (2 * c.hz);
  return c.minY + c.h0 + (c.h1 - c.h0) * t;
}

export function pointInside(c, x, z) {
  if (c.type === 'cyl') { const dx = x - c.cx, dz = z - c.cz; return dx * dx + dz * dz <= c.r * c.r; }
  const [lx, lz] = toLocal(c, x, z);
  return Math.abs(lx) <= c.hx && Math.abs(lz) <= c.hz;
}

export function circleTouches(c, x, z, r) {
  if (c.type === 'cyl') { const dx = x - c.cx, dz = z - c.cz, R = c.r + r; return dx * dx + dz * dz <= R * R; }
  const [lx, lz] = toLocal(c, x, z);
  const qx = Math.min(Math.max(lx, -c.hx), c.hx), qz = Math.min(Math.max(lz, -c.hz), c.hz);
  const ddx = lx - qx, ddz = lz - qz;
  return ddx * ddx + ddz * ddz <= r * r;
}

// Push-out vector for a circle overlapping the shape's footprint: [nx, nz, depth] or null.
export function circlePush(c, x, z, r) {
  if (c.type === 'cyl') {
    const dx = x - c.cx, dz = z - c.cz, R = c.r + r;
    const d2 = dx * dx + dz * dz;
    if (d2 >= R * R) return null;
    const d = Math.sqrt(d2);
    if (d < 1e-6) return [1, 0, R];
    return [dx / d, dz / d, R - d];
  }
  const [lx, lz] = toLocal(c, x, z);
  const qx = Math.min(Math.max(lx, -c.hx), c.hx), qz = Math.min(Math.max(lz, -c.hz), c.hz);
  const ddx = lx - qx, ddz = lz - qz;
  const d2 = ddx * ddx + ddz * ddz;
  if (d2 >= r * r) return null;
  let nlx, nlz, depth;
  if (d2 > 1e-10) {
    const d = Math.sqrt(d2);
    nlx = ddx / d; nlz = ddz / d; depth = r - d;
  } else {
    const px = c.hx - Math.abs(lx), pz = c.hz - Math.abs(lz);
    if (px < pz) { nlx = Math.sign(lx) || 1; nlz = 0; depth = px + r; }
    else { nlx = 0; nlz = Math.sign(lz) || 1; depth = pz + r; }
  }
  const [nx, nz] = toWorldDir(c, nlx, nlz);
  return [nx, nz, depth];
}

// Ray vs (possibly turned) box via slabs in local space. Ramps use their bounding box.
function rayBox(c, ox, oy, oz, dx, dy, dz, maxT) {
  let lox, loz, ldx, ldz, hx, hz;
  if (c.type === 'cyl') {
    lox = ox - c.cx; loz = oz - c.cz; ldx = dx; ldz = dz; hx = hz = c.r * 0.85;
  } else {
    const rx = ox - c.cx, rz = oz - c.cz;
    lox = rx * c.cos - rz * c.sin; loz = rx * c.sin + rz * c.cos;
    ldx = dx * c.cos - dz * c.sin; ldz = dx * c.sin + dz * c.cos;
    hx = c.hx; hz = c.hz;
  }
  let t0 = 0, t1 = maxT;
  // x slab
  if (Math.abs(ldx) < 1e-9) { if (lox < -hx || lox > hx) return Infinity; }
  else { let a = (-hx - lox) / ldx, b = (hx - lox) / ldx; if (a > b) [a, b] = [b, a]; t0 = Math.max(t0, a); t1 = Math.min(t1, b); if (t0 > t1) return Infinity; }
  if (Math.abs(ldz) < 1e-9) { if (loz < -hz || loz > hz) return Infinity; }
  else { let a = (-hz - loz) / ldz, b = (hz - loz) / ldz; if (a > b) [a, b] = [b, a]; t0 = Math.max(t0, a); t1 = Math.min(t1, b); if (t0 > t1) return Infinity; }
  const y0 = c.minY, y1 = c.maxY;
  if (Math.abs(dy) < 1e-9) { if (oy < y0 || oy > y1) return Infinity; }
  else { let a = (y0 - oy) / dy, b = (y1 - oy) / dy; if (a > b) [a, b] = [b, a]; t0 = Math.max(t0, a); t1 = Math.min(t1, b); if (t0 > t1) return Infinity; }
  if (c.type === 'ramp') {
    // f(t) = height above the sloped top; the ray is inside the wedge where f < 0
    const k = (c.h1 - c.h0) / (2 * hz);
    const A = oy - (c.minY + c.h0 + k * (loz + hz)), B = dy - k * ldz;
    const f0 = A + B * t0;
    if (f0 < 0) return t0 > 0 ? t0 : Infinity;
    if (B >= 0) return Infinity;
    const th = -A / B;
    return th <= t1 && th > 0 ? th : Infinity;
  }
  return t0 > 0 ? t0 : Infinity; // ignore boxes we start inside of
}

// ---------------------------------------------------------------------------------------------
// Character motor. body = {pos:{x,y,z}, vel:{x,y,z}, r, h, step, grounded, ground}
// Moves the body by its velocity for dt with collisions; reports landing / bonk / pushes.
const _list = [];
export function stepBody(world, b, dt, ev) {
  const p = b.pos, v = b.vel;
  const oldY = p.y;
  // --- horizontal
  p.x += v.x * dt; p.z += v.z * dt;
  const r = b.r;
  for (let iter = 0; iter < 3; iter++) {
    const list = world.query(p.x - r, p.z - r, p.x + r, p.z + r, _list);
    let any = false;
    for (const c of list) {
      if (c.noWall) continue;
      if (c.minY >= p.y + b.h - 0.05) continue;           // entirely above head
      const top = c.type === 'ramp' ? rampTopNear(c, p.x, p.z, r) : c.maxY;
      if (top <= p.y + b.step) continue;                    // low enough to step onto
      const push = circlePush(c, p.x, p.z, r);
      if (!push) continue;
      const [nx, nz, depth] = push;
      p.x += nx * depth; p.z += nz * depth;
      const vn = v.x * nx + v.z * nz;
      if (vn < 0) { v.x -= vn * nx; v.z -= vn * nz; }
      any = true;
      if (ev) {
        // report the tallest wall touched (a stack of bricks = its top brick, for ledges and wall slides)
        if (!ev.wall || c.maxY >= ev.wall.maxY) { ev.wall = c; ev.wallNx = nx; ev.wallNz = nz; }
        if (c.climb && (!ev.climb || c.maxY > ev.climb.maxY)) { ev.climb = c; ev.climbNx = nx; ev.climbNz = nz; }
      }
    }
    if (!any) break;
  }
  // --- vertical
  p.y += v.y * dt;
  if (v.y > 0) {
    const list = world.query(p.x - r, p.z - r, p.x + r, p.z + r, _list);
    const head = p.y + b.h, oldHead = oldY + b.h;
    for (const c of list) {
      if (c.noCeil) continue;
      if (c.minY < oldHead - 0.02 || c.minY > head) continue;
      if (!circleTouches(c, p.x, p.z, r * 0.6)) continue;
      p.y = c.minY - b.h; v.y = 0;
      if (ev) ev.bonk = c;
      break;
    }
  }
  const footR = r * 0.55;
  const reach = Math.max(oldY, p.y) + b.step;
  const g = world.groundAt(p.x, p.z, reach, footR);
  const wasGrounded = b.grounded;
  b.grounded = false;
  if (g) {
    if (v.y <= 0 && p.y <= g.y + 0.001) {
      p.y = g.y; b.grounded = true; b.ground = g.c;
    } else if (wasGrounded && v.y <= 0 && p.y - g.y < b.snap) {
      p.y = g.y; b.grounded = true; b.ground = g.c;  // stick to slopes and stairs going down
    }
  }
  if (b.grounded) {
    if (!wasGrounded && ev) ev.landed = { vy: b.lastVy, c: b.ground };
    v.y = 0;
  } else b.ground = null;
  b.lastVy = v.y;
}

// Is the upright cylinder (x,z,r) between heights y0..y1 free of solid shapes? (ignore = one collider to skip)
const _sf = [];
export function spaceFree(world, x, z, y0, y1, r, ignore = null) {
  const list = world.query(x - r, z - r, x + r, z + r, _sf);
  for (const c of list) {
    if (c === ignore || c.noWall || c.solid === false) continue;
    const top = c.type === 'ramp' ? topAt(c, x, z) : c.maxY;
    if (c.minY >= y1 || top <= y0) continue;
    if (circleTouches(c, x, z, r)) return false;
  }
  return true;
}

// Does an axis-aligned rectangle (cx,cz ± hx,hz) between y0..y1 overlap any solid shape? Used to slide boxes.
export function rectBlocked(world, cx, cz, hx, hz, y0, y1, ignore = null) {
  const list = world.query(cx - hx, cz - hz, cx + hx, cz + hz, _sf);
  for (const c of list) {
    if (c === ignore || c.noWall || c.solid === false || (ignore && ignore.carriedBy === c)) continue;
    const top = c.type === 'ramp' ? Math.max(topAt(c, cx, cz), c.minY + Math.min(c.h0, c.h1)) : c.maxY;
    if (c.minY >= y1 - 0.02 || top <= y0 + 0.02) continue;
    if (rectTouches(c, cx, cz, hx - 0.02, hz - 0.02)) return true;
  }
  return false;
}
function rectTouches(c, cx, cz, hx, hz) {
  if (c.type === 'cyl') {
    const qx = Math.min(Math.max(c.cx, cx - hx), cx + hx), qz = Math.min(Math.max(c.cz, cz - hz), cz + hz);
    const dx = c.cx - qx, dz = c.cz - qz; return dx * dx + dz * dz < c.r * c.r;
  }
  // separating axis test between the query rect (world axes) and the turned box
  const dx = c.cx - cx, dz = c.cz - cz;
  const ux = [c.cos, -c.sin], uz = [c.sin, c.cos];       // the box's local x and z axes in world space
  const axes = [[1, 0], [0, 1], ux, uz];
  for (const [ax, az] of axes) {
    const ra = hx * Math.abs(ax) + hz * Math.abs(az);
    const rb = c.hx * Math.abs(ux[0] * ax + ux[1] * az) + c.hz * Math.abs(uz[0] * ax + uz[1] * az);
    if (Math.abs(dx * ax + dz * az) >= ra + rb) return false;
  }
  return true;
}

function rampTopNear(c, x, z, r) {
  // highest point of the ramp top inside the circle (conservative for walls along a ramp's side)
  const [, lz] = toLocal(c, x, z);
  const hiSide = c.h1 >= c.h0 ? 1 : -1;
  const lzc = Math.min(Math.max(lz + hiSide * r * 0.5, -c.hz), c.hz);
  const t = (lzc + c.hz) / (2 * c.hz);
  return c.minY + c.h0 + (c.h1 - c.h0) * t;
}

// Carry a point riding on a moving collider from its previous pose to the new pose.
export function carry(c, p) {
  if (c.pcx === undefined) return 0;
  const dyaw = c.yaw - c.pyaw;
  const rx = p.x - c.pcx, rz = p.z - c.pcz;
  const co = Math.cos(dyaw), si = Math.sin(dyaw);
  p.x = c.cx + rx * co + rz * si;
  p.z = c.cz - rx * si + rz * co;
  p.y += c.cy - c.pcy;
  return dyaw;
}
export function savePose(c) { c.pcx = c.cx; c.pcy = c.cy; c.pcz = c.cz; c.pyaw = c.yaw; }

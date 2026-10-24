/* ============================================================================
   WORLD 6 — KINAN IN THE STARS · the 3D galaxy (galaxy3d.js)
   ----------------------------------------------------------------------------
   A small self-contained WebGL engine that lives inside the game page. World 5's
   last boss, once beaten, plays the "the world goes 3D" cutscene and World 6 is
   a real 3D level in the spirit of Super Mario Galaxy: one round garden planet
   with curved gravity you run all the way around, Launch Stars to little moonlets,
   star bits, a mini boss (Meteor Mike) and the Power Star.

   Built on plain WebGL (no libraries) so the game stays one offline app that runs
   on desktop, iPhone and tablet. The look is smooth low-poly toon: quantized
   lighting, soft fog, glow sprites — Wii-to-Switch vibes.

   Public surface (used by index.html):
     GALAXY3D.available          — true when WebGL started
     GALAXY3D.start(opts)        — play the 3D level
     GALAXY3D.cutscene(opts)     — the 2D->3D transition cutscene, resolves when done
     GALAXY3D.stop()             — leave 3D, hand the page back to the 2D game
   ============================================================================ */
(function () {
'use strict';

/* ----------------------------------------------------------------------------
   vec3 / mat4 math (column-major mat4, like OpenGL)
   ---------------------------------------------------------------------------- */
const V3 = {
  make: (x, y, z) => [x || 0, y || 0, z || 0],
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  scale: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  len: (a) => Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]),
  norm: (a) => {
    const l = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  },
  lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
};
const M4 = {
  ident: () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  mul: (a, b) => {
    const o = new Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
  },
  persp: (fovy, aspect, near, far) => {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
  },
  ortho: (l, r, b, t, n, f) => [
    2 / (r - l), 0, 0, 0, 0, 2 / (t - b), 0, 0, 0, 0, -2 / (f - n), 0,
    -(r + l) / (r - l), -(t + b) / (t - b), -(f + n) / (f - n), 1
  ],
  lookAt: (eye, at, up) => {
    const z = V3.norm(V3.sub(eye, at)), x = V3.norm(V3.cross(up, z)), y = V3.cross(z, x);
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0,
      -V3.dot(x, eye), -V3.dot(y, eye), -V3.dot(z, eye), 1];
  },
  trs: (t, rotY, s, rotX, rotZ) => {   /* translate * rotY * rotX * rotZ * scale */
    const cy = Math.cos(rotY || 0), sy = Math.sin(rotY || 0);
    const cx = Math.cos(rotX || 0), sx = Math.sin(rotX || 0);
    const cz = Math.cos(rotZ || 0), sz = Math.sin(rotZ || 0);
    const r00 = cy * cz + sy * sx * sz, r01 = cx * sz, r02 = -sy * cz + cy * sx * sz;
    const r10 = -cy * sz + sy * sx * cz, r11 = cx * cz, r12 = sy * sz + cy * sx * cz;
    const r20 = sy * cx, r21 = -sx, r22 = cy * cx;
    const sc = s == null ? 1 : s;
    const sxr = (typeof sc === 'number' ? sc : sc[0]), syr = (typeof sc === 'number' ? sc : sc[1]), szr = (typeof sc === 'number' ? sc : sc[2]);
    return [r00 * sxr, r01 * sxr, r02 * sxr, 0, r10 * syr, r11 * syr, r12 * syr, 0, r20 * szr, r21 * szr, r22 * szr, 0, t[0], t[1], t[2], 1];
  }
};

/* ----------------------------------------------------------------------------
   shaders: one toon program for geometry, one textured program for sprites and
   the flat "2D phase" of the cutscene
   ---------------------------------------------------------------------------- */
const TOON_VS = [
  'attribute vec3 aPos; attribute vec3 aNrm; attribute vec2 aUv; attribute vec3 aCol;',
  'uniform mat4 uProj, uView, uModel;',
  'varying vec3 vNrm; varying vec3 vCol; varying vec2 vUv; varying float vDepth;',
  'void main() {',
  '  vec4 w = uModel * vec4(aPos, 1.0);',
  '  vNrm = mat3(uModel) * aNrm;',
  '  vUv = aUv;',
  '  vCol = aCol;',
  '  vec4 v = uView * w;',
  '  vDepth = -v.z;',
  '  gl_Position = uProj * v;',
  '}'
].join('\n');
const TOON_FS = [
  'precision mediump float;',
  'varying vec3 vNrm; varying vec3 vCol; varying vec2 vUv; varying float vDepth;',
  'uniform sampler2D uTex; uniform float uUseTex;',
  'uniform vec3 uLight; uniform vec3 uAmbient; uniform vec3 uFog; uniform vec2 uFogRange;',
  'uniform float uEmit; uniform float uUnlit; uniform float uAlpha; uniform vec3 uTint;',
  'void main() {',
  '  vec3 n = normalize(vNrm);',
  '  float d = max(dot(n, normalize(uLight)), 0.0);',
  '  float band = smoothstep(0.18, 0.30, d) * 0.28 + smoothstep(0.52, 0.66, d) * 0.30 + smoothstep(0.80, 0.92, d) * 0.20;',
  '  float rim = pow(1.0 - abs(dot(n, vec3(0.0, 0.0, 1.0))), 2.0) * 0.16;',
  '  vec3 base = mix(vCol, texture2D(uTex, vUv).rgb * vCol, uUseTex);',
  '  vec3 lit = base * uTint * (uAmbient + band) + rim * vec3(0.9, 0.95, 1.0);',
  '  vec3 col = mix(lit, base * uTint, uUnlit) + base * uTint * uEmit;',
  '  float fog = clamp((vDepth - uFogRange.x) / (uFogRange.y - uFogRange.x), 0.0, 1.0);',
  '  col = mix(col, uFog, fog * 0.9);',
  '  gl_FragColor = vec4(col, uAlpha);',
  '}'
].join('\n');
const TEX_VS = [
  'attribute vec3 aPos; attribute vec2 aUv; attribute vec3 aCol;',
  'uniform mat4 uProj, uView, uModel;',
  'varying vec2 vUv; varying vec3 vCol; varying float vDepth;',
  'void main() {',
  '  vec4 v = uView * uModel * vec4(aPos, 1.0);',
  '  vDepth = -v.z;',
  '  vUv = aUv; vCol = aCol;',
  '  gl_Position = uProj * v;',
  '}'
].join('\n');
const TEX_FS = [
  'precision mediump float;',
  'varying vec2 vUv; varying vec3 vCol; varying float vDepth;',
  'uniform sampler2D uTex; uniform float uAlpha; uniform vec3 uTint; uniform vec3 uFog; uniform vec2 uFogRange;',
  'void main() {',
  '  vec4 t = texture2D(uTex, vUv);',
  '  if (t.a < 0.02) discard;',
  '  vec3 col = t.rgb * vCol * uTint;',
  '  float fog = clamp((vDepth - uFogRange.x) / (uFogRange.y - uFogRange.x), 0.0, 1.0);',
  '  col = mix(col, uFog, fog * 0.9);',
  '  gl_FragColor = vec4(col, t.a * uAlpha);',
  '}'
].join('\n');

/* ----------------------------------------------------------------------------
   the renderer: one canvas, one context, a small draw queue
   ---------------------------------------------------------------------------- */
const R = {
  gl: null, canvas: null, toon: null, tex: null, lost: false,
  fog: [0.03, 0.05, 0.12], fogRange: [220, 900], light: V3.norm([0.45, 0.85, 0.5]),
  ambient: [0.52, 0.52, 0.58], proj: null, view: null, width: 0, height: 0, dpr: 1, forceUnlit: 0
};
function compile(gl, vsSrc, fsSrc) {
  const mk = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('shader: ' + gl.getShaderInfoLog(s));
    return s;
  };
  const p = gl.createProgram();
  gl.attachShader(p, mk(gl.VERTEX_SHADER, vsSrc));
  gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fsSrc));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
  const out = { prog: p, a: {}, u: {} };
  const na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < na; i++) { const info = gl.getActiveAttrib(p, i); out.a[info.name] = gl.getAttribLocation(p, info.name); }
  const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < nu; i++) { const info = gl.getActiveUniform(p, i); out.u[info.name] = gl.getUniformLocation(p, info.name); }
  return out;
}
function glInit(canvas) {
  const gl = canvas.getContext('webgl', { antialias: true, alpha: false, powerPreference: 'high-performance' })
    || canvas.getContext('experimental-webgl', { antialias: true, alpha: false });
  if (!gl) return false;
  R.gl = gl; R.canvas = canvas;
  R.toon = compile(gl, TOON_VS, TOON_FS);
  R.tex = compile(gl, TEX_VS, TEX_FS);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.CULL_FACE);   /* hand-built winding stays safe on every GPU */
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); R.lost = true; }, false);
  canvas.addEventListener('webglcontextrestored', () => {
    R.lost = false;
    try {
      R.toon = compile(gl, TOON_VS, TOON_FS);
      R.tex = compile(gl, TEX_VS, TEX_FS);
    } catch (e) { R.lost = true; }
  }, false);
  return true;
}
function glSize(w, h, dpr) {
  const gl = R.gl;
  R.dpr = dpr; R.width = w; R.height = h;
  R.canvas.width = Math.round(w * dpr);
  R.canvas.height = Math.round(h * dpr);
  R.canvas.style.width = w + 'px';
  R.canvas.style.height = h + 'px';
  gl.viewport(0, 0, R.canvas.width, R.canvas.height);
}
function makeTexture(canvasOrImg, repeat) {
  const gl = R.gl, t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvasOrImg);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
  return t;
}

/* ----------------------------------------------------------------------------
   mesh builders — low-poly shapes with per-vertex colors.
   Each mesh: { buf, ibuf, count } on the GPU; positions/normals/colors packed.
   ---------------------------------------------------------------------------- */
function uploadMesh(verts, idx) {
  const gl = R.gl;
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  const ibuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
  return { buf: buf, ibuf: ibuf, count: idx.length };
}
/* verts: [px,py,pz, nx,ny,nz, u,v, r,g,b] per vertex — 11 floats */
function meshSphere(rad, seg, rings, colFn, uTile, vTile) {
  const verts = [], idx = [];
  const ut = uTile == null ? 3 : uTile, vt = vTile == null ? 3 : vTile;
  for (let y = 0; y <= rings; y++) {
    const v = y / rings, phi = v * Math.PI;
    for (let x = 0; x <= seg; x++) {
      const u = x / seg, th = u * Math.PI * 2;
      const nx = Math.sin(phi) * Math.cos(th), ny = Math.cos(phi), nz = Math.sin(phi) * Math.sin(th);
      const c = colFn ? colFn(nx, ny, nz) : [1, 1, 1];
      verts.push(nx * rad, ny * rad, nz * rad, nx, ny, nz, u * ut, v * vt, c[0], c[1], c[2]);
    }
  }
  for (let y = 0; y < rings; y++) for (let x = 0; x < seg; x++) {
    const a = y * (seg + 1) + x, b = a + seg + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  return uploadMesh(verts, idx);
}
function meshBox(w, h, d, col) {
  const x = w / 2, y = h / 2, z = d / 2, c = col || [1, 1, 1];
  const faces = [
    [[-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z], [0, 0, 1]],
    [[x, -y, -z], [-x, -y, -z], [-x, y, -z], [x, y, -z], [0, 0, -1]],
    [[x, -y, z], [x, -y, -z], [x, y, -z], [x, y, z], [1, 0, 0]],
    [[-x, -y, -z], [-x, -y, z], [-x, y, z], [-x, y, -z], [-1, 0, 0]],
    [[-x, y, z], [x, y, z], [x, y, -z], [-x, y, -z], [0, 1, 0]],
    [[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z], [0, -1, 0]]
  ];
  const uvs = [[0, 1], [1, 1], [1, 0], [0, 0]];
  const verts = [], idx = [];
  faces.forEach((f, k) => {
    const n = f[4];
    for (let i = 0; i < 4; i++) {
      const uu = uvs[i][0] * Math.max(1, Math.round(w / 6)), vv = uvs[i][1] * Math.max(1, Math.round(h / 6));
      verts.push(f[i][0], f[i][1], f[i][2], n[0], n[1], n[2], uu, vv, c[0], c[1], c[2]);
    }
    const o = k * 4;
    idx.push(o, o + 1, o + 2, o, o + 2, o + 3);
  });
  return uploadMesh(verts, idx);
}
function meshCylinder(rad, h, seg, col, capCol) {
  const verts = [], idx = [], c = col || [1, 1, 1], cc = capCol || c;
  for (let k = 0; k <= seg; k++) {
    const th = k / seg * Math.PI * 2, nx = Math.cos(th), nz = Math.sin(th);
    verts.push(nx * rad, -h / 2, nz * rad, nx, 0, nz, k / seg * Math.max(1, Math.round(rad / 3)), 0, c[0], c[1], c[2]);
    verts.push(nx * rad, h / 2, nz * rad, nx, 0, nz, k / seg * Math.max(1, Math.round(rad / 3)), 1, c[0], c[1], c[2]);
  }
  for (let k = 0; k < seg; k++) {
    const a = k * 2;
    idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const base = verts.length / 11;
  verts.push(0, h / 2, 0, 0, 1, 0, 0.5, 0.5, cc[0], cc[1], cc[2]);     /* top cap center */
  verts.push(0, -h / 2, 0, 0, -1, 0, 0.5, 0.5, cc[0], cc[1], cc[2]);   /* bottom cap center */
  for (let k = 0; k <= seg; k++) {
    const th = k / seg * Math.PI * 2, nx = Math.cos(th), nz = Math.sin(th);
    verts.push(nx * rad, h / 2, nz * rad, 0, 1, 0, 0.5 + nx * 0.5, 0.5 + nz * 0.5, cc[0], cc[1], cc[2]);
    verts.push(nx * rad, -h / 2, nz * rad, 0, -1, 0, 0.5 + nx * 0.5, 0.5 + nz * 0.5, cc[0], cc[1], cc[2]);
  }
  const topC = base, botC = base + 1, ring0 = base + 2;
  for (let k = 0; k < seg; k++) {
    const a = ring0 + k * 2;
    idx.push(topC, a + 2, a, topC, a, a + 2);
    idx.push(botC, a + 1, a + 3, botC, a + 3, a + 1);
  }
  return uploadMesh(verts, idx);
}
function meshStar(outer, inner, depth, col) {
  /* a chunky 5-point star, lying in the XZ plane with the point up in +Y thickness */
  const verts = [], idx = [], c = col || [1, 0.9, 0.4];
  for (let side = 0; side < 2; side++) {
    const y = side ? depth / 2 : -depth / 2, ny = side ? 1 : -1;
    const centerIdx = verts.length / 11;
    verts.push(0, y, 0, 0, ny, 0, 0.5, 0.5, c[0], c[1], c[2]);
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? inner : outer;
      const px = Math.cos(a) * r, pz = Math.sin(a) * r;
      verts.push(px, y, pz, 0, ny, 0, 0.5 + px / (outer * 2), 0.5 + pz / (outer * 2), c[0], c[1], c[2]);
    }
    for (let k = 0; k < 10; k++) {
      const a = centerIdx + 1 + k, b = centerIdx + 1 + ((k + 1) % 10);
      if (side) idx.push(centerIdx, a, b); else idx.push(centerIdx, b, a);
    }
  }
  for (let k = 0; k < 10; k++) {
    const t0 = 1 + k, t1 = 1 + ((k + 1) % 10), b0 = 11 + 1 + k, b1 = 11 + 1 + ((k + 1) % 10);
    idx.push(t0, b0, t1, t1, b0, b1);
  }
  return uploadMesh(verts, idx);
}
function meshRing(r0, r1, seg, col) {
  const verts = [], idx = [], c = col || [1, 0.85, 0.4];
  for (let k = 0; k <= seg; k++) {
    const th = k / seg * Math.PI * 2, cx = Math.cos(th), cz = Math.sin(th);
    verts.push(cx * r0, 0, cz * r0, 0, 1, 0, 0.5 + cx * 0.45, 0.5 + cz * 0.45, c[0], c[1], c[2]);
    verts.push(cx * r1, 0, cz * r1, 0, 1, 0, 0.5 + cx * 0.5, 0.5 + cz * 0.5, c[0], c[1], c[2]);
  }
  for (let k = 0; k < seg; k++) {
    const a = k * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  return uploadMesh(verts, idx);
}
function meshCrystal(col) {
  /* a faceted gem: hexagonal bipyramid with flat per-face normals */
  const verts = [], idx = [], c = col || [0.72, 0.88, 1];
  const ring = [];
  for (let k = 0; k < 6; k++) {
    const a = k / 6 * Math.PI * 2;
    ring.push([Math.cos(a) * 0.8, 0.12, Math.sin(a) * 0.8]);
  }
  const pushFace = (a, b, cc) => {
    const n = V3.norm(V3.cross(V3.sub(b, a), V3.sub(cc, a)));
    for (const p of [a, b, cc]) verts.push(p[0], p[1], p[2], n[0], n[1], n[2], 0.5 + p[0] * 0.4, 0.5 + p[2] * 0.4, c[0], c[1], c[2]);
  };
  const top = [0, 1.7, 0], bot = [0, -1.25, 0];
  for (let k = 0; k < 6; k++) {
    const a = ring[k], b = ring[(k + 1) % 6];
    pushFace(a, b, top);
    pushFace(b, a, bot);
    pushFace(a, b, [0, 0.12, 0]);   /* the belt, so it reads solid from above */
  }
  for (let k = 0; k < verts.length / 11; k++) idx.push(k);
  return uploadMesh(verts, idx);
}
function decalMat(pos, up, size) {
  /* a flat quad lying on a surface (the meshQuad spans XY facing Z: map Z to the surface normal) */
  const n = V3.norm(up);
  let f = V3.cross(n, [0, 0, 1]);
  if (V3.len(f) < 0.1) f = V3.cross(n, [1, 0, 0]);
  f = V3.norm(f);
  const r = V3.norm(V3.cross(n, f));
  return [r[0] * size, r[1] * size, r[2] * size, 0, f[0] * size, f[1] * size, f[2] * size, 0, n[0], n[1], n[2], 0, pos[0], pos[1], pos[2], 1];
}
function drawShadow(pos, up, size, alpha) {
  const p = V3.add(pos, V3.scale(V3.norm(up), 0.12));
  drawSprite(M.quad, TEX.glow, decalMat(p, up, size), { alpha: alpha == null ? 0.34 : alpha, tint: [0.05, 0.06, 0.16] });
}
/* a unit quad (XY plane, facing +Z) with uv — for textured sprites. 8 floats per vertex */
function meshQuad() {
  const gl = R.gl;
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -0.5, -0.5, 0, 0, 1, 1, 1, 1,
    0.5, -0.5, 0, 1, 1, 1, 1, 1,
    0.5, 0.5, 0, 1, 0, 1, 1, 1,
    -0.5, 0.5, 0, 0, 0, 1, 1, 1
  ]), gl.STATIC_DRAW);
  const ibuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
  return { buf: buf, ibuf: ibuf, count: 6, quad: true };
}

/* ----------------------------------------------------------------------------
   drawing
   ---------------------------------------------------------------------------- */
function beginFrame(proj, view, opts) {
  const gl = R.gl;
  opts = opts || {};
  R.proj = proj; R.view = view;
  if (opts.fog) R.fog = opts.fog;
  if (opts.fogRange) R.fogRange = opts.fogRange;
  if (opts.light) R.light = V3.norm(opts.light);
  if (opts.ambient) R.ambient = opts.ambient;
  gl.clearColor(R.fog[0], R.fog[1], R.fog[2], 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
function bindMeshAttrs(prog, mesh) {
  const gl = R.gl;
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buf);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ibuf);
  if (mesh.quad) {
    gl.enableVertexAttribArray(prog.a.aPos);
    gl.vertexAttribPointer(prog.a.aPos, 3, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(prog.a.aUv);
    gl.vertexAttribPointer(prog.a.aUv, 2, gl.FLOAT, false, 32, 12);
    gl.enableVertexAttribArray(prog.a.aCol);
    gl.vertexAttribPointer(prog.a.aCol, 3, gl.FLOAT, false, 32, 20);
  } else {
    gl.enableVertexAttribArray(prog.a.aPos);
    gl.vertexAttribPointer(prog.a.aPos, 3, gl.FLOAT, false, 44, 0);
    gl.enableVertexAttribArray(prog.a.aNrm);
    gl.vertexAttribPointer(prog.a.aNrm, 3, gl.FLOAT, false, 44, 12);
    gl.enableVertexAttribArray(prog.a.aUv);
    gl.vertexAttribPointer(prog.a.aUv, 2, gl.FLOAT, false, 44, 24);
    gl.enableVertexAttribArray(prog.a.aCol);
    gl.vertexAttribPointer(prog.a.aCol, 3, gl.FLOAT, false, 44, 32);
  }
}
function drawMesh(mesh, model, opts) {
  const gl = R.gl, p = R.toon;
  opts = opts || {};
  gl.useProgram(p.prog);
  gl.uniformMatrix4fv(p.u.uProj, false, R.proj);
  gl.uniformMatrix4fv(p.u.uView, false, R.view);
  gl.uniformMatrix4fv(p.u.uModel, false, model);
  gl.uniform3fv(p.u.uLight, R.light);
  gl.uniform3fv(p.u.uAmbient, R.ambient);
  gl.uniform3fv(p.u.uFog, R.fog);
  gl.uniform2fv(p.u.uFogRange, R.fogRange);
  gl.uniform1f(p.u.uEmit, opts.emit || 0);
  gl.uniform1f(p.u.uUnlit, opts.unlit || R.forceUnlit || 0);
  gl.uniform1f(p.u.uAlpha, opts.alpha == null ? 1 : opts.alpha);
  gl.uniform3fv(p.u.uTint, opts.tint || [1, 1, 1]);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, opts.tex || TEX.white);
  gl.uniform1i(p.u.uTex, 0);
  gl.uniform1f(p.u.uUseTex, opts.tex ? 1 : 0);
  if ((opts.alpha == null ? 1 : opts.alpha) < 1) { gl.enable(gl.BLEND); gl.depthMask(false); } else { gl.disable(gl.BLEND); gl.depthMask(true); }
  bindMeshAttrs(p, mesh);
  gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
  gl.depthMask(true); gl.disable(gl.BLEND);
}
function drawSprite(mesh, tex, model, opts) {
  const gl = R.gl, p = R.tex;
  opts = opts || {};
  gl.useProgram(p.prog);
  gl.uniformMatrix4fv(p.u.uProj, false, R.proj);
  gl.uniformMatrix4fv(p.u.uView, false, R.view);
  gl.uniformMatrix4fv(p.u.uModel, false, model);
  gl.uniform3fv(p.u.uFog, R.fog);
  gl.uniform2fv(p.u.uFogRange, R.fogRange);
  gl.uniform1f(p.u.uAlpha, opts.alpha == null ? 1 : opts.alpha);
  gl.uniform3fv(p.u.uTint, opts.tint || [1, 1, 1]);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.uniform1i(p.u.uTex, 0);
  gl.enable(gl.BLEND);
  gl.depthMask(false);
  bindMeshAttrs(p, mesh);
  gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
  gl.depthMask(true);
  gl.disable(gl.BLEND);
}

/* ----------------------------------------------------------------------------
   input: keyboard (desktop) + a virtual stick and JUMP (touch), auto-switching
   ---------------------------------------------------------------------------- */
const IN = {
  keys: {}, move: [0, 0], jump: false, jumpHeld: false, camX: 0,
  touch: { stickId: -1, ox: 0, oy: 0, x: 0, y: 0, camId: -1, cx: 0, cy: 0 }
};
function inKey(e, down) {
  const k = (e.key || '').toLowerCase();
  IN.keys[k] = down;
  if (k === ' ' || k === 'arrowup' || k === 'arrowdown' || k === 'arrowleft' || k === 'arrowright') e.preventDefault();
  if (k === ' ') { IN.jump = down; IN.jumpHeld = down; }
}
function inTick() {
  const k = IN.keys;
  let x = 0, y = 0;
  if (k['a'] || k['arrowleft']) x -= 1;
  if (k['d'] || k['arrowright']) x += 1;
  if (k['w'] || k['arrowup']) y += 1;
  if (k['s'] || k['arrowdown']) y -= 1;
  if (k['q']) IN.camX -= 0.045;
  if (k['e']) IN.camX += 0.045;
  const t = IN.touch;
  if (t.stickId >= 0) {
    x += clamp((t.x - t.ox) / 44, -1, 1);
    y += -clamp((t.y - t.oy) / 44, -1, 1);
  }
  const l = Math.sqrt(x * x + y * y);
  if (l > 1) { x /= l; y /= l; }
  IN.move = [x, y];
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ----------------------------------------------------------------------------
   the little solar system and the physics on it: gravity always pulls toward
   the nearest planet's heart, so you can run all the way around a ball.
   ---------------------------------------------------------------------------- */
const SYS = {
  planets: [],   /* { c, r, kind, col, mesh } */
  bits: [],      /* star bits: { p, taken, spin } */
  sprouts: [],   /* enemies: { planet, dir, axis, t, dead, squash } */
  launches: [],  /* launch stars: { from, to, planet, dir, t } */
  mike: null,    /* the boss */
  star: null,    /* the Power Star, after the boss */
  particles: [],
  time: 0
};
function nearestPlanet(p, maxAdd) {
  let best = null, bestD = 1e9;
  for (const pl of SYS.planets) {
    const d = V3.len(V3.sub(p, pl.c)) - pl.r;
    if (d < bestD) { bestD = d; best = pl; }
  }
  return (maxAdd == null || bestD < maxAdd) ? best : null;
}
const PLAYER = {
  pos: [0, 60, 0], vel: [0, 0, 0], up: [0, 1, 0], face: 0, faceTarget: 0,
  planet: null, grounded: false, coyote: 0, jumpT: 0, hp: 3, inv: 0,
  anim: 0, squash: 0, stretch: 0, flight: null, deadT: 0, heartsLost: 0
};
const GRAV3 = 42, JUMP3 = 21, RUN3 = 15;
function playerPhysics(dt) {
  const P = PLAYER;
  if (P.flight) {   /* riding a Launch Star: a scripted arc to the target moonlet */
    const f = P.flight;
    f.t = Math.min(1, f.t + dt / f.dur);
    const t = f.t, arc = f.arc;
    P.pos = V3.add(V3.lerp(f.from, f.to, t), V3.scale(f.up, Math.sin(t * Math.PI) * arc));
    P.vel = [0, 0, 0];
    P.up = V3.norm(V3.sub(P.pos, f.planet.c));
    if (t >= 1) {
      P.flight = null;
      P.planet = f.planet;
      P.vel = V3.scale(P.up, 2);
    }
    return;
  }
  const pl = P.planet || nearestPlanet(P.pos, 40);
  if (!pl) {   /* drifting in deep space: gently fall toward home */
    const home = SYS.planets[0];
    P.vel = V3.add(P.vel, V3.scale(V3.norm(V3.sub(home.c, P.pos)), GRAV3 * 0.25 * dt));
    P.pos = V3.add(P.pos, V3.scale(P.vel, dt));
    if (V3.len(V3.sub(P.pos, home.c)) < home.r + 60) P.planet = home;
    return;
  }
  P.planet = pl;
  /* gravity toward the planet's heart */
  const toC = V3.sub(pl.c, P.pos), dist = V3.len(toC);
  P.up = V3.scale(toC, -1 / (dist || 1));
  P.vel = V3.add(P.vel, V3.scale(P.up, -GRAV3 * dt));
  /* walk: input in the camera's tangent plane */
  const fwd = V3.norm(V3.cross(P.up, V3.cross(camDir(), P.up)));
  const right = V3.norm(V3.cross(P.up, fwd));
  const wish = V3.add(V3.scale(right, IN.move[0]), V3.scale(fwd, IN.move[1]));
  const wishLen = V3.len(wish);
  if (wishLen > 0.05) {
    P.faceTarget = Math.atan2(wish[0], wish[2]);
    const accel = P.grounded ? 12 : 5;
    const tangentVel = V3.sub(P.vel, V3.scale(P.up, V3.dot(P.vel, P.up)));
    const target = V3.scale(wish, RUN3);
    let tv = V3.lerp(tangentVel, target, Math.min(1, accel * dt));
    if (V3.len(tv) > RUN3) tv = V3.scale(V3.norm(tv), RUN3);
    P.vel = V3.add(tv, V3.scale(P.up, V3.dot(P.vel, P.up)));
  } else if (P.grounded) {
    const tangentVel = V3.sub(P.vel, V3.scale(P.up, V3.dot(P.vel, P.up)));
    P.vel = V3.add(V3.scale(tangentVel, Math.max(0, 1 - 9 * dt)), V3.scale(P.up, V3.dot(P.vel, P.up)));
  }
  /* jump */
  if (IN.jump && (P.grounded || P.coyote > 0)) {
    P.vel = V3.add(V3.sub(P.vel, V3.scale(P.up, V3.dot(P.vel, P.up))), V3.scale(P.up, JUMP3));
    P.grounded = false; P.coyote = 0; P.jumpT = 0; P.stretch = 8;
    if (G3.sfx) G3.sfx('jump');
    burst(P.pos, '#ffffff', 6);
  }
  if (IN.jumpHeld && P.vel && V3.dot(P.vel, P.up) > 0 && P.jumpT < 0.22) {
    P.vel = V3.add(P.vel, V3.scale(P.up, 26 * dt));   /* hold = higher */
  }
  if (P.jumpT != null) P.jumpT += dt;
  /* fly */
  P.pos = V3.add(P.pos, V3.scale(P.vel, dt));
  /* land on the planet's surface */
  const d2 = V3.len(V3.sub(P.pos, pl.c)), skin = 1.15;
  const wasGround = P.grounded;
  if (d2 <= pl.r + skin + 0.12) {
    const n = V3.norm(V3.sub(P.pos, pl.c));
    P.pos = V3.add(pl.c, V3.scale(n, pl.r + skin));
    const radial = V3.dot(P.vel, n);
    if (radial < 0) P.vel = V3.sub(P.vel, V3.scale(n, radial));
    P.grounded = true;
    P.coyote = 0.12;
    if (!wasGround) { P.squash = 6; burst(P.pos, 'rgba(255,255,255,.7)', 4); }
  } else {
    P.grounded = false;
    P.coyote = Math.max(0, P.coyote - dt);
  }
  if (P.grounded) P.anim += V3.len(P.vel) * dt * 1.4;
  if (P.inv > 0) P.inv -= dt;
  if (P.squash > 0) P.squash -= dt * 60;
  if (P.stretch > 0) P.stretch -= dt * 60;
}
function camDir() {
  return CAM.dir;
}
/* ----------------------------------------------------------------------------
   the camera: orbits behind Kinan, always standing on his "up" — the whole
   frame tilts as he runs around a planet, exactly like Super Mario Galaxy
   ---------------------------------------------------------------------------- */
const CAM = { dir: [0, 0, 1], pos: [0, 80, 26], up: [0, 1, 0], fov: 0.9 };
function rotAxis(v, axis, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return V3.add(V3.add(V3.scale(v, c), V3.scale(V3.cross(axis, v), s)), V3.scale(axis, V3.dot(axis, v) * (1 - c)));
}
function camStep(dt) {
  const P = PLAYER, up = P.up;
  if (IN.camX) { CAM.dir = rotAxis(CAM.dir, up, IN.camX); IN.camX = 0; }
  let d = V3.sub(CAM.dir, V3.scale(up, V3.dot(CAM.dir, up)));
  if (V3.len(d) < 0.08) d = V3.cross(up, [0, 1, 0]);
  if (V3.len(d) < 0.08) d = V3.cross(up, [1, 0, 0]);
  CAM.dir = V3.norm(d);
  const want = V3.add(V3.sub(P.pos, V3.scale(CAM.dir, 15)), V3.scale(up, 7.5));
  CAM.pos = V3.lerp(CAM.pos, want, Math.min(1, dt * 4.5));
  CAM.up = V3.norm(V3.lerp(CAM.up, up, Math.min(1, dt * 4.5)));
}
function camMatrices() {
  const aspect = R.width / Math.max(1, R.height);
  const proj = M4.persp(CAM.fov, aspect, 0.5, 1400);
  const eye = CAM.pos, at = V3.add(PLAYER.pos, V3.scale(PLAYER.up, 2.2));
  return { proj: proj, view: M4.lookAt(eye, at, CAM.up) };
}

/* ----------------------------------------------------------------------------
   characters — low-poly rigs built from spheres and boxes
   ---------------------------------------------------------------------------- */
function frameMat(pos, up, face) {   /* a character's stance: Y = up, yaw = facing */
  const n = V3.norm(up);
  let f = [Math.sin(face), 0, Math.cos(face)];
  f = V3.norm(V3.sub(f, V3.scale(n, V3.dot(f, n))));
  if (V3.len(f) < 0.1) f = V3.norm(V3.cross(n, [1, 0, 0]));
  const r = V3.norm(V3.cross(n, f));
  return [r[0], r[1], r[2], 0, n[0], n[1], n[2], 0, f[0], f[1], f[2], 0, pos[0], pos[1], pos[2], 1];
}
function partAt(frame, x, y, z, ry, s, rx, rz) {
  return M4.mul(frame, M4.trs([x, y, z], ry, s, rx, rz));
}
/* Kinan: big expressive head, red shirt, jeans — built to be read from far away */
function drawKinan3D(pos, up, face, o) {
  o = o || {};
  const fr = frameMat(pos, up, face);
  const walk = o.walk || 0, air = o.air || 0, sq = 1 + (o.squash || 0) * 0.02, st = 1 + (o.stretch || 0) * 0.015;
  const swing = Math.sin(walk) * (air ? 0.2 : 0.65), bob = Math.abs(Math.sin(walk)) * (air ? 0 : 0.12);
  const skin = [1.0, 0.83, 0.66], shirt = [0.92, 0.26, 0.24], jeans = [0.24, 0.36, 0.66], hair = [0.28, 0.19, 0.12];
  /* shoes + legs */
  for (let s = -1; s <= 1; s += 2) {
    const sw = swing * s;
    drawMesh(M.box.leg, partAt(fr, s * 0.34, 1.45 * st + bob, sw * 0.5, 0, [sq, st, sq], sw), { tint: jeans });
    drawMesh(M.box.shoe, partAt(fr, s * 0.34, 0.28, sw * 0.9 + 0.12, 0, [sq, 1, sq]), { tint: [0.2, 0.16, 0.18] });
  }
  /* body + belt */
  drawMesh(M.box.body, partAt(fr, 0, 2.62 * st + bob, 0, 0, [sq, st, sq]), { tint: shirt });
  drawMesh(M.box.belt, partAt(fr, 0, 2.02 * st + bob, 0, 0, [sq, st, sq]), { tint: [0.2, 0.16, 0.18] });
  /* arms */
  for (let s = -1; s <= 1; s += 2) {
    const sw2 = -swing * s * (air ? 1.4 : 1), lift = air ? -1.9 : 0;
    drawMesh(M.box.arm, partAt(fr, s * 0.78, 2.72 * st + bob + lift * 0.35, sw2 * 0.5, 0, [sq, st, sq], sw2 * 0.7), { tint: shirt });
    drawMesh(M.box.hand, partAt(fr, s * 0.82, 2.02 * st + bob + lift * 0.55, sw2 * 0.75, 0, 1, sw2 * 0.7), { tint: skin });
  }
  /* head: hair, face, eyes, smile */
  drawMesh(M.sph.head, partAt(fr, 0, 3.86 * st + bob, 0, 0, [sq * 1.06, st, sq * 1.02]), { tint: skin });
  drawMesh(M.sph.hair, partAt(fr, 0, 4.16 * st + bob, -0.06, 0, [sq * 1.1, 0.8, sq * 1.05]), { tint: hair });
  for (let s = -1; s <= 1; s += 2) {
    drawMesh(M.box.eyeW, partAt(fr, s * 0.30, 3.96 * st + bob, 0.86, 0, 1), { tint: [1, 1, 1] });
    drawMesh(M.box.eyeB, partAt(fr, s * 0.32, 3.95 * st + bob, 0.98, 0, 1), { tint: [0.1, 0.1, 0.14] });
  }
  drawMesh(M.box.smile, partAt(fr, 0, 3.58 * st + bob, 0.9, 0, 1), { tint: [0.62, 0.26, 0.22] });
}
/* a space sprout: a hoppy little plant creature you can stomp */
function drawSprout(e) {
  const up = V3.norm(V3.sub(e.pos, e.planet.c));
  const hop = e.dead ? 0 : Math.abs(Math.sin(e.t * 2.2)) * 0.9;
  const fr = frameMat(V3.add(e.pos, V3.scale(up, hop)), up, e.face);
  const squash = e.dead ? 0.25 : 1;
  drawMesh(M.sph.sprout, partAt(fr, 0, 1.0 * squash, 0, 0, [1.15, squash, 1.15]), { tint: e.dead ? [0.5, 0.6, 0.4] : [0.42, 0.78, 0.36] });
  for (let s = -1; s <= 1; s += 2) {
    drawMesh(M.box.eyeW, partAt(fr, s * 0.34, 1.25 * squash, 0.82, 0, 0.9), { tint: [1, 1, 1] });
    drawMesh(M.box.eyeB, partAt(fr, s * 0.35, 1.24 * squash, 0.92, 0, 0.75), { tint: [0.1, 0.12, 0.1] });
    drawMesh(M.box.leaf, partAt(fr, s * 0.95, 1.05 * squash, 0, s * 0.6, 1), { tint: [0.3, 0.62, 0.28] });
  }
}
/* Meteor Mike: a grumpy meteor-rock giant */
function drawMike(m) {
  const up = V3.norm(V3.sub(m.pos, m.planet.c));
  const bob = m.state === 'rest' ? Math.sin(SYS.time * 3) * 0.18 : 0;
  const fr = frameMat(V3.add(m.pos, V3.scale(up, m.hop || 0)), up, m.face);
  drawMesh(M.sph.mike, partAt(fr, 0, 3.2 + bob, 0, 0, 1), { tint: m.hurt > 0 ? [0.75, 0.4, 0.35] : [0.42, 0.36, 0.48] });
  for (let k = 0; k < 7; k++) {   /* boulder spikes */
    const a = k / 7 * Math.PI * 2;
    drawMesh(M.sph.spike, partAt(fr, Math.cos(a) * 2.6, 4.6 + Math.sin(k * 2.4) * 1.1, Math.sin(a) * 2.6, a, 1, 0.7), { tint: [0.32, 0.27, 0.38] });
  }
  for (let s = -1; s <= 1; s += 2) {
    drawMesh(M.box.eyeW, partAt(fr, s * 1.15, 3.9 + bob, 3.15, 0, 1.7), { tint: [1, 1, 0.75] });
    drawMesh(M.box.eyeB, partAt(fr, s * 1.2, 3.85 + bob, 3.38, 0, 1.2), { tint: [0.75, 0.1, 0.1] });
    drawMesh(M.box.brow, partAt(fr, s * 1.2, 4.85 + bob, 3.1, s * -0.5, 1.5), { tint: [0.16, 0.12, 0.2] });
  }
  drawMesh(M.box.mouth, partAt(fr, 0, 2.55 + bob, 3.3, 0, 1), { tint: [0.16, 0.1, 0.14] });
}
/* ----------------------------------------------------------------------------
   particles + glow billboards
   ---------------------------------------------------------------------------- */
function burst(pos, color, n) {
  for (let k = 0; k < n; k++) {
    const v = [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1];
    SYS.particles.push({
      p: pos.slice(), v: V3.scale(V3.norm(v), 4 + Math.random() * 7),
      life: 0.55 + Math.random() * 0.45, size: 0.5 + Math.random() * 0.7, color: color
    });
  }
}
function particlesTick(dt) {
  const ps = SYS.particles;
  for (const q of ps) {
    q.p = V3.add(q.p, V3.scale(q.v, dt));
    q.v = V3.scale(q.v, 1 - dt * 1.6);
    q.life -= dt;
  }
  for (let k = ps.length - 1; k >= 0; k--) if (ps[k].life <= 0) ps.splice(k, 1);
}
function billboardMat(pos, size) {
  const r = V3.norm(V3.cross(CAM.up, CAM.dir));
  return [r[0] * size, r[1] * size, r[2] * size, 0, CAM.up[0] * size, CAM.up[1] * size, CAM.up[2] * size, 0,
    -CAM.dir[0] * size, -CAM.dir[1] * size, -CAM.dir[2] * size, 0, pos[0], pos[1], pos[2], 1];
}

/* ----------------------------------------------------------------------------
   the mesh library — every shape the game draws, built once at startup
   ---------------------------------------------------------------------------- */
const M = { sph: {}, box: {}, star: {}, ring: {}, quad: null };
const TEX = {};
function meshFromModel(name) {
  const m = window.G3_MODELS && window.G3_MODELS[name];
  return (m && m.v && m.v.length && m.i && m.i.length) ? uploadMesh(m.v, m.i) : null;
}
function buildMeshes() {
  M.sph.head = meshFromModel('head') || meshSphere(1.02, 18, 12);
  M.sph.hair = meshFromModel('hair') || meshSphere(1.04, 16, 10);
  M.sph.sprout = meshFromModel('sproutBody') || meshSphere(1.05, 14, 10);
  M.sph.mike = meshFromModel('mikeBody') || meshSphere(3.3, 22, 14, (nx, ny) => { const v = 0.92 + 0.12 * Math.sin(nx * 7 + ny * 5); return [v, v, v]; });
  M.sph.spike = meshFromModel('rockSpike') || meshSphere(0.85, 10, 8);
  M.sph.leaves = meshSphere(2.3, 13, 9, (nx, ny) => { const v = 0.9 + 0.18 * Math.sin(nx * 5 + ny * 3); return [v, v, v]; });
  M.sph.moon = meshSphere(1, 22, 15);
  M.box.leg = meshFromModel('leg') || meshBox(0.55, 1.5, 0.6);
  M.box.shoe = meshFromModel('shoe') || meshBox(0.62, 0.42, 1.0);
  M.box.body = meshFromModel('torso') || meshBox(1.5, 1.45, 0.95);
  M.box.belt = meshFromModel('belt') || meshBox(1.42, 0.3, 0.9);
  M.box.arm = meshFromModel('arm') || meshBox(0.42, 1.15, 0.5);
  M.box.hand = meshFromModel('hand') || meshBox(0.5, 0.5, 0.55);
  M.box.eyeW = meshFromModel('eyeWhite') || meshBox(0.34, 0.42, 0.16);
  M.box.eyeB = meshFromModel('eyePupil') || meshBox(0.18, 0.22, 0.12);
  M.box.smile = meshFromModel('mouth') || meshBox(0.5, 0.12, 0.1);
  M.box.leaf = meshFromModel('leaf') || meshBox(0.9, 0.22, 0.5);
  M.box.brow = meshBox(0.55, 0.16, 0.14);
  M.box.mouth = meshBox(1.1, 0.35, 0.12);
  M.box.leaf = meshBox(0.9, 0.22, 0.5);
  M.box.flower = meshBox(0.55, 0.55, 0.55);
  M.box.trunk = meshCylinder(0.55, 3.2, 10, [1, 1, 1]);
  M.star.bit = meshStar(0.62, 0.28, 0.22, [1, 0.92, 0.5]);
  M.star.power = meshStar(3.4, 1.6, 1.2, [1, 0.88, 0.35]);
  M.star.launch = meshStar(1.7, 0.8, 0.5, [1, 0.95, 0.55]);
  M.ring.gold = meshRing(2.1, 2.55, 26, [1, 0.82, 0.35]);
  M.quad = meshQuad();
  M.crystal = meshCrystal();
  M.box.stem = meshBox(0.24, 1.5, 0.24);
  M.box.tuft = meshBox(0.55, 1.15, 0.55);
  M.box.step = meshBox(2.6, 0.55, 2.6);
  M.box.pillar = meshCylinder(0.85, 7, 12, [1, 1, 1]);
  M.sph.cap = meshSphere(1, 14, 9);
  M.sph.puff = meshSphere(1, 12, 8);
  M.sph.canopy = meshFromModel('canopy') || meshSphere(1, 13, 9, (nx, ny) => { const v = 0.86 + 0.2 * Math.sin(nx * 5 + ny * 4); return [v, v, v]; });
  M.treeTrunk = meshFromModel('trunk') || M.box.pillar;
  M.mushCap = meshFromModel('mushCap') || M.sph.cap;
  M.boulder = meshFromModel('boulder') || M.sph.cap;
  M.flowerHead = meshFromModel('flowerHead') || M.sph.cap;
}
function buildTextures() {
  const T2 = (size, fn, repeat) => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    fn(c.getContext('2d'), size);
    return makeTexture(c, repeat);
  };
  /* a soft round glow */
  const g = document.createElement('canvas');
  g.width = g.height = 64;
  const gc = g.getContext('2d');
  const rg = gc.createRadialGradient(32, 32, 0, 32, 32, 32);
  rg.addColorStop(0, 'rgba(255,255,255,1)');
  rg.addColorStop(0.35, 'rgba(255,255,255,.55)');
  rg.addColorStop(1, 'rgba(255,255,255,0)');
  gc.fillStyle = rg; gc.fillRect(0, 0, 64, 64);
  TEX.glow = makeTexture(g);
  TEX.white = T2(4, (x, s) => { x.fillStyle = '#fff'; x.fillRect(0, 0, s, s); });
  const strokes = (x, s, colors, n, len, rng, w) => {
    for (let k = 0; k < n; k++) {
      x.globalAlpha = 0.14 + rng() * 0.3;
      x.fillStyle = colors[Math.floor(rng() * colors.length)];
      const px = rng() * s, py = rng() * s, a = rng() * Math.PI, L = len * (0.4 + rng());
      x.save(); x.translate(px, py); x.rotate(a);
      x.fillRect(-L / 2, -(w || 2) / 2, L, w || 2);
      x.restore();
    }
    x.globalAlpha = 1;
  };
  const speckle = (x, s, colors, n, rng, size) => {
    for (let k = 0; k < n; k++) {
      x.globalAlpha = 0.2 + rng() * 0.5;
      x.fillStyle = colors[Math.floor(rng() * colors.length)];
      const z = (size || 1.6) * (0.5 + rng());
      x.fillRect(rng() * s, rng() * s, z, z);
    }
    x.globalAlpha = 1;
  };
  const seeded = (a) => () => { a = (a * 16807) % 2147483647; return a / 2147483647; };
  /* grass: warm green wash + blades + clover + tiny flowers */
  TEX.grass = T2(256, (x, s) => {
    const r = seeded(1234);
    const gg = x.createLinearGradient(0, 0, s, s);
    gg.addColorStop(0, '#57c47e'); gg.addColorStop(0.5, '#46a86c'); gg.addColorStop(1, '#63cf8b');
    x.fillStyle = gg; x.fillRect(0, 0, s, s);
    strokes(x, s, ['#2e8a52', '#7fe3a4', '#3fa86a', '#8ef0b4'], 500, 11, r, 2.4);
    speckle(x, s, ['#eafbe9', '#2e8a52'], 240, r, 1.4);
    for (let k = 0; k < 26; k++) {   /* little flowers painted right into the turf */
      x.globalAlpha = 0.85;
      x.fillStyle = ['#fff6c9', '#ffd3e2', '#e8d9ff', '#ffedb0'][k % 4];
      const px = r() * s, py = r() * s, z = 2 + r() * 2.4;
      x.beginPath(); x.arc(px, py, z, 0, 6.284); x.fill();
      x.fillStyle = '#f7b23c'; x.beginPath(); x.arc(px, py, z * 0.38, 0, 6.284); x.fill();
    }
    x.globalAlpha = 1;
  }, true);
  /* stone: cool gray + cracks + mossy speckles */
  TEX.stone = T2(256, (x, s) => {
    const r = seeded(777);
    x.fillStyle = '#9aa3b4'; x.fillRect(0, 0, s, s);
    strokes(x, s, ['#7d8698', '#b7bfcd', '#69738a', '#c6cdd9'], 420, 16, r, 4);
    speckle(x, s, ['#5c6478', '#d3d9e4', '#7fae72'], 320, r, 2);
    x.strokeStyle = 'rgba(70,80,100,.5)'; x.lineWidth = 2;
    for (let k = 0; k < 9; k++) {
      x.beginPath();
      let px = r() * s, py = r() * s;
      x.moveTo(px, py);
      for (let j = 0; j < 6; j++) { px += (r() - 0.5) * 46; py += (r() - 0.5) * 46; x.lineTo(px, py); }
      x.stroke();
    }
  }, true);
  /* wood: warm planks with grain and knots */
  TEX.wood = T2(256, (x, s) => {
    const r = seeded(4242);
    x.fillStyle = '#a9713d'; x.fillRect(0, 0, s, s);
    for (let k = 0; k < 6; k++) {
      x.fillStyle = ['#b57c46', '#9c6535', '#c08a52'][k % 3];
      x.fillRect(0, k * 43, s, 41);
      x.fillStyle = 'rgba(80,45,20,.55)'; x.fillRect(0, k * 43, s, 2.4);
    }
    strokes(x, s, ['#8a5628', '#c9915a', '#7c4c22'], 300, 24, r, 2.2);
    for (let k = 0; k < 12; k++) {
      x.strokeStyle = 'rgba(90,52,22,.5)'; x.lineWidth = 1.6;
      x.beginPath(); x.ellipse(r() * s, r() * s, 4 + r() * 6, 2 + r() * 3, r() * 3, 0, 6.284); x.stroke();
    }
  }, true);
  /* moon soil: dusty with craters */
  TEX.dust = T2(256, (x, s) => {
    const r = seeded(9090);
    x.fillStyle = '#b9a9d6'; x.fillRect(0, 0, s, s);
    strokes(x, s, ['#a291c6', '#cbbde6', '#8f7db8'], 300, 14, r, 4);
    speckle(x, s, ['#8f7db8', '#e2d8f5'], 300, r, 2);
    for (let k = 0; k < 14; k++) {
      const px = r() * s, py = r() * s, z = 6 + r() * 13;
      x.fillStyle = 'rgba(120,100,170,.5)';
      x.beginPath(); x.arc(px, py, z, 0, 6.284); x.fill();
      x.fillStyle = 'rgba(230,220,250,.5)';
      x.beginPath(); x.arc(px - z * 0.2, py - z * 0.25, z * 0.8, 0, 6.284); x.fill();
      x.fillStyle = 'rgba(120,100,170,.42)';
      x.beginPath(); x.arc(px + z * 0.12, py + z * 0.1, z * 0.62, 0, 6.284); x.fill();
    }
  }, true);
  /* water: layered blues with light caustics */
  TEX.water = T2(256, (x, s) => {
    const r = seeded(5150);
    const wg = x.createLinearGradient(0, 0, 0, s);
    wg.addColorStop(0, '#4fc7e8'); wg.addColorStop(1, '#2f7fd0');
    x.fillStyle = wg; x.fillRect(0, 0, s, s);
    for (let k = 0; k < 40; k++) {
      x.globalAlpha = 0.16 + r() * 0.22;
      x.fillStyle = r() < 0.5 ? '#bff0ff' : '#2a6db8';
      x.beginPath();
      x.ellipse(r() * s, r() * s, 20 + r() * 42, 4 + r() * 8, r() * 0.6 - 0.3, 0, 6.284);
      x.fill();
    }
    x.globalAlpha = 1;
    speckle(x, s, ['#eafcff'], 160, r, 1.6);
  }, true);
  /* the home planet's own skin: grass on top, warm soil, starlit purple rock below
     (the sphere's v coordinate runs pole to pole, so this is painted as a band) */
  TEX.home = T2(256, (x, s) => {
    const r = seeded(3131);
    const bg = x.createLinearGradient(0, 0, 0, s);
    bg.addColorStop(0, '#63cf8b'); bg.addColorStop(0.28, '#4db477');
    bg.addColorStop(0.42, '#8a7a5e'); bg.addColorStop(0.55, '#6b5a8f');
    bg.addColorStop(0.8, '#4a3d80'); bg.addColorStop(1, '#3b2f6e');
    x.fillStyle = bg; x.fillRect(0, 0, s, s);
    strokes(x, s, ['#2e8a52', '#7fe3a4', '#8ef0b4'], 260, 10, r, 2.4);
    strokes(x, s, ['#7c68a8', '#5a4a92', '#9a86c8'], 300, 13, r, 3);
    speckle(x, s, ['#eafbe9', '#2e8a52'], 160, r, 1.4);
    speckle(x, s, ['#d9c8ff', '#fff'], 220, r, 1.6);   /* star dust in the rock */
    for (let k = 0; k < 22; k++) {
      x.globalAlpha = 0.85;
      x.fillStyle = ['#fff6c9', '#ffd3e2', '#e8d9ff', '#ffedb0'][k % 4];
      const px = r() * s, py = r() * s * 0.3, z = 2 + r() * 2.2;
      x.beginPath(); x.arc(px, py, z, 0, 6.284); x.fill();
      x.fillStyle = '#f7b23c'; x.beginPath(); x.arc(px, py, z * 0.38, 0, 6.284); x.fill();
    }
    x.globalAlpha = 1;
  }, true);
  /* the deep-space sky: stars, nebula clouds and a ringed planet, painted once */
  const s = document.createElement('canvas');
  s.width = 1024; s.height = 512;
  const sc = s.getContext('2d');
  const bg = sc.createLinearGradient(0, 0, 0, 512);
  bg.addColorStop(0, '#04051a'); bg.addColorStop(0.55, '#0c1038'); bg.addColorStop(1, '#1a1244');
  sc.fillStyle = bg; sc.fillRect(0, 0, 1024, 512);
  for (let k = 0; k < 7; k++) {   /* nebula clouds */
    const x = (k * 197) % 1024, y = 60 + (k * 83) % 320, r = 90 + (k * 47) % 130;
    const ng = sc.createRadialGradient(x, y, 0, x, y, r);
    const c = ['rgba(120,80,220,', 'rgba(255,110,190,', 'rgba(70,160,255,'][k % 3];
    ng.addColorStop(0, c + '0.22)'); ng.addColorStop(1, c + '0)');
    sc.fillStyle = ng; sc.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let k = 0; k < 420; k++) {   /* stars */
    const x = (k * 251 + (k * k * 7)) % 1024, y = (k * 173 + (k * k * 3)) % 512;
    sc.globalAlpha = 0.35 + ((k * 37) % 65) / 100;
    sc.fillStyle = k % 9 === 0 ? '#ffd9a0' : '#eef4ff';
    const sz = k % 11 === 0 ? 2.4 : (k % 4 === 0 ? 1.6 : 1);
    sc.fillRect(x, y, sz, sz);
  }
  sc.globalAlpha = 1;
  sc.fillStyle = '#1f2a66'; sc.beginPath(); sc.arc(800, 130, 62, 0, 6.284); sc.fill();
  const pg = sc.createRadialGradient(778, 108, 8, 800, 130, 62);
  pg.addColorStop(0, '#9fd4ff'); pg.addColorStop(1, '#3b4b9e');
  sc.fillStyle = pg; sc.beginPath(); sc.arc(800, 130, 62, 0, 6.284); sc.fill();
  sc.strokeStyle = 'rgba(246,196,69,.9)'; sc.lineWidth = 10;
  sc.beginPath(); sc.ellipse(800, 140, 100, 26, -0.18, 0, 6.284); sc.stroke();
  TEX.sky = makeTexture(s);
}

/* ----------------------------------------------------------------------------
   the level: one round garden planet, three moonlets, Launch Stars between
   them, star bits, space sprouts, and Meteor Mike's arena
   ---------------------------------------------------------------------------- */
function sphereMesh(rad, colFn, ut, vt) { return meshSphere(rad, 32, 22, colFn, ut, vt); }
function onSphere(pl, dir, h) { return V3.add(pl.c, V3.scale(V3.norm(dir), pl.r + (h || 0))); }
function buildLevel() {
  SYS.planets = []; SYS.bits = []; SYS.sprouts = []; SYS.launches = []; SYS.particles = [];
  SYS.mike = null; SYS.star = null;
  const rnd = (() => { let s = 777; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
  /* the home: a garden planet — painted grass skin over starlit purple rock */
  const home = {
    c: [0, 0, 0], r: 30, kind: 'home', tex: TEX.home,
    mesh: sphereMesh(30, (nx, ny, nz) => {
      const v = 0.92 + 0.12 * Math.sin(nx * 9 + nz * 7);
      return [v, v, v];
    }, 8, 1)
  };
  const moonA = {
    c: [76, 34, -26], r: 9.5, kind: 'moon', tex: TEX.grass,
    mesh: sphereMesh(9.5, (nx, ny) => { const v = 0.86 + 0.16 * Math.sin(nx * 6 + ny * 4); return [v * 0.62, v, v * 0.8]; }, 3, 2)
  };
  const moonB = {
    c: [-62, 48, -52], r: 12, kind: 'moon', tex: TEX.dust,
    mesh: sphereMesh(12, (nx, ny) => { const v = 0.86 + 0.16 * Math.sin(nx * 5 + ny * 6); return [v, v * 0.66, v * 0.42]; }, 3, 2)
  };
  const moonC = {
    c: [26, -52, 62], r: 8, kind: 'hidden', tex: TEX.dust,
    mesh: sphereMesh(8, (nx, ny) => { const v = 0.86 + 0.16 * Math.sin(nx * 7 + ny * 3); return [v * 0.52, v * 0.66, v]; }, 3, 2)
  };
  const arena = {
    c: [-6, 92, -104], r: 18, kind: 'arena', tex: TEX.stone,
    mesh: sphereMesh(18, (nx, ny, nz) => { const v = 0.8 + 0.22 * Math.sin(nx * 8 + ny * 6 + nz * 8); return [v * 0.82, v * 0.72, v]; }, 5, 3)
  };
  SYS.planets.push(home, moonA, moonB, moonC, arena);
  /* ---- the living world: a dense meadow, forests, mushroom rings, crystal fields ---- */
  SYS.deco = [];
  const dpush = (kind, planet, dir, tint, s) => SYS.deco.push({ kind: kind, planet: planet, dir: V3.norm(dir), tint: tint || null, s: s || 1, spin: rnd() * 6 });
  for (let k = 0; k < 130; k++) {   /* grass tufts and wildflowers everywhere */
    const a = rnd() * Math.PI * 2, e = (rnd() - 0.42) * 1.55;
    const dir = [Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)];
    if (rnd() < 0.55) dpush('tuft', home, dir, null, 0.8 + rnd() * 0.8);
    else dpush('flower', home, dir, [[1, 0.62, 0.72], [1, 0.88, 0.4], [0.95, 0.95, 1], [1, 0.5, 0.5], [0.8, 0.6, 1]][k % 5], 0.8 + rnd() * 0.7);
  }
  for (let k = 0; k < 18; k++) {
    const a = rnd() * Math.PI * 2, e = (rnd() - 0.4) * 1.35;
    dpush('tree', home, [Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)], null, 0.85 + rnd() * 0.7);
  }
  for (let k = 0; k < 26; k++) {
    const a = rnd() * Math.PI * 2, e = (rnd() - 0.45) * 1.55;
    dpush('mushroom', home, [Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)], [1, 0.45, 0.42], 0.7 + rnd() * 0.8);
  }
  for (let k = 0; k < 18; k++) {
    const a = rnd() * Math.PI * 2, e = (rnd() - 0.5) * 1.55;
    dpush('rock', home, [Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)], null, 0.6 + rnd() * 1);
  }
  for (let k = 0; k < 14; k++) {
    const a = rnd() * Math.PI * 2, e = (rnd() - 0.5) * 1.55;
    dpush('crystal', home, [Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)], [[0.62, 0.88, 1], [1, 0.82, 0.4], [1, 0.62, 0.83]][k % 3], 0.7 + rnd() * 0.8);
  }
  for (const pl of [moonA, moonB, moonC, arena]) {
    for (let k = 0; k < 11; k++) {
      const a = rnd() * Math.PI * 2, e = (rnd() - 0.5) * 1.6;
      const dir = [Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)];
      const q = rnd();
      if (q < 0.4) dpush('crystal', pl, dir, [[0.62, 0.88, 1], [1, 0.82, 0.4], [0.79, 0.64, 1]][k % 3], 0.5 + rnd() * 0.7);
      else if (q < 0.72) dpush('rock', pl, dir, null, 0.5 + rnd() * 0.9);
      else dpush('mushroom', pl, dir, [0.85, 0.55, 1], 0.5 + rnd() * 0.6);
    }
  }
  /* star bits: rings of them around the planets and long trails between them */
  const bit = (p) => SYS.bits.push({ p: p, taken: false, spin: rnd() * 6 });
  for (let k = 0; k < 14; k++) {
    const a = k / 14 * Math.PI * 2;
    bit(onSphere(home, [Math.cos(a) * 0.9, 0.42, Math.sin(a) * 0.9], 3.2));
  }
  for (let k = 0; k < 8; k++) {
    const t = k / 8;
    bit(V3.lerp(onSphere(home, [0.8, 0.55, -0.35], 4), moonA.c, t + 0.06));
    bit(V3.lerp(onSphere(home, [-0.75, 0.6, -0.3], 4), moonB.c, t + 0.06));
    bit(V3.lerp(onSphere(home, [0.35, -0.85, 0.4], 4), moonC.c, t + 0.06));
  }
  for (let k = 0; k < 6; k++) bit(onSphere(moonC, [Math.cos(k), 0.5, Math.sin(k)], 2.4));
  for (let k = 0; k < 6; k++) bit(onSphere(arena, [Math.cos(k * 2.1), 0.45, Math.sin(k * 2.1)], 3));
  /* space sprouts to stomp */
  const sprout = (pl, dir) => SYS.sprouts.push({ planet: pl, dir: V3.norm(dir), t: rnd() * 6, dead: 0, face: 0, pos: [0, 0, 0] });
  sprout(home, [0.9, 0.35, 0.2]); sprout(home, [-0.6, 0.5, 0.65]); sprout(home, [0.1, -0.75, -0.65]);
  sprout(moonA, [0.7, 0.4, -0.5]); sprout(moonA, [-0.5, 0.6, 0.6]);
  sprout(moonB, [0.2, 0.7, -0.7]); sprout(moonB, [-0.8, 0.3, 0.5]);
  /* Launch Stars: stand on the pad and BLAST to the next world */
  SYS.launches.push(
    { dir: [0.25, 0.95, 0.2], planet: home, target: moonA, arc: 26 },
    { dir: [-0.55, 0.8, -0.25], planet: home, target: moonB, arc: 30 },
    { dir: [0.45, -0.85, 0.28], planet: home, target: moonC, arc: 24 },
    { dir: [0.1, 0.5, 0.85], planet: moonA, target: arena, arc: 34 },
    { dir: [-0.3, 0.85, 0.4], planet: moonB, target: arena, arc: 34 }
  );
  /* ---- the built world: a garden gate, shrines at every Launch Star, a stone path
     around the planet, a lily pond and an old arch on the far side ---- */
  SYS.structures = [];
  const st = (kind, planet, dir, tint, s) => SYS.structures.push({ kind: kind, planet: planet, dir: V3.norm(dir), tint: tint || null, s: s || 1 });
  st('plaza', home, [0, 1, 0]);
  st('gate', home, [0, 1, 0]);
  for (const l of SYS.launches) st('shrine', l.planet, l.dir);
  st('pond', home, [0.55, 0.72, -0.42]);
  st('ruins', home, [-0.72, 0.55, 0.42]);
  for (let k = 0; k < 26; k++) {
    const a = k / 26 * Math.PI * 2;
    st('path', home, [Math.cos(a) * 0.82, 0.52, Math.sin(a) * 0.82], null, 1 + (k % 3) * 0.12);
  }
  /* Meteor Mike, napping on his arena moonlet */
  SYS.mike = {
    planet: arena, dir: [0, 0.35, 1], face: 0, hp: 3, state: 'sleep', t: 0,
    hurt: 0, hop: 0, shock: 0, pos: [0, 0, 0]
  };
}

/* ----------------------------------------------------------------------------
   drawing the whole scene each frame
   ---------------------------------------------------------------------------- */
function renderScene() {
  const cm = camMatrices();
  beginFrame(cm.proj, cm.view, {});
  /* deep space all around */
  drawSprite(M.quad, TEX.sky, billboardMat(V3.add(CAM.pos, V3.scale(CAM.dir, 720)), 1700), { alpha: 1 });
  /* planets */
  for (const pl of SYS.planets) {
    drawMesh(pl.mesh, M4.trs(pl.c, SYS.time * 0.012, 1), { tex: pl.tex });
  }
  const near = (p, d) => V3.len(V3.sub(p, CAM.pos)) < (d || 170);
  /* soft blob shadows first — everything that stands, grounds */
  for (const d of SYS.deco) {
    if (d.kind !== 'tree' && d.kind !== 'mushroom' && d.kind !== 'rock') continue;
    const p = onSphere(d.planet, d.dir, 0);
    if (!near(p, 130)) continue;
    drawShadow(p, d.dir, (d.kind === 'tree' ? 7 : 3.2) * d.s, 0.28);
  }
  for (const e of SYS.sprouts) if (near(e.pos, 130)) drawShadow(e.pos, e.dir, 3.2, 0.3);
  if (SYS.mike && SYS.mike.state !== 'gone') drawShadow(SYS.mike.pos, SYS.mike.dir, 11, 0.32);
  drawShadow(PLAYER.pos, PLAYER.up, 3.4, 0.34);
  /* the meadow: grass tufts, wildflowers, trees, mushrooms, rocks, glowing crystals */
  for (const d of SYS.deco) {
    const up = V3.norm(d.dir);
    const p = onSphere(d.planet, d.dir, 0);
    if (!near(p, 140)) continue;
    const fr = frameMat(p, up, Math.atan2(d.dir[0], d.dir[2]) + d.spin);
    const s = d.s;
    if (d.kind === 'tree') {
      drawMesh(M.treeTrunk, partAt(fr, 0, 3.5 * s, 0, 0, [1.15 * s, s, 1.15 * s]), { tex: TEX.wood });
      drawMesh(M.sph.canopy, partAt(fr, 0, 8.2 * s, 0, d.spin, [3.4 * s, 2.8 * s, 3.4 * s]), { tex: TEX.grass, tint: [0.62, 0.95, 0.7] });
      drawMesh(M.sph.canopy, partAt(fr, -2.2 * s, 6.6 * s, 1.4 * s, 0, [2.2 * s, 1.9 * s, 2.2 * s]), { tex: TEX.grass, tint: [0.55, 0.88, 0.62] });
      drawMesh(M.sph.canopy, partAt(fr, 2.4 * s, 6.9 * s, -1.3 * s, 0, [2.1 * s, 1.8 * s, 2.1 * s]), { tex: TEX.grass, tint: [0.7, 1, 0.78] });
    } else if (d.kind === 'flower') {
      drawMesh(M.box.stem, partAt(fr, 0, 0.8 * s, 0, 0, [0.8 * s, 1.1 * s, 0.8 * s]), { tint: [0.24, 0.55, 0.3] });
      drawMesh(M.flowerHead, partAt(fr, 0, 1.75 * s, 0, SYS.time * 0.3, [0.72 * s, 0.45 * s, 0.72 * s]), { tint: d.tint || [1, 0.7, 0.8], emit: 0.08 });
      drawMesh(M.sph.puff, partAt(fr, 0, 1.92 * s, 0, 0, [0.3 * s, 0.22 * s, 0.3 * s]), { tint: [1, 0.86, 0.35], emit: 0.15 });
    } else if (d.kind === 'tuft') {
      drawMesh(M.box.tuft, partAt(fr, 0, 0.55 * s, 0, d.spin, s), { tex: TEX.grass, tint: [0.85, 1.05, 0.85] });
    } else if (d.kind === 'mushroom') {
      drawMesh(M.box.stem, partAt(fr, 0, 0.75 * s, 0, 0, [1.1 * s, s, 1.1 * s]), { tint: [0.95, 0.88, 0.8] });
      drawMesh(M.mushCap, partAt(fr, 0, 1.8 * s, 0, d.spin, [1.55 * s, 0.85 * s, 1.55 * s]), { tint: d.tint || [1, 0.45, 0.42] });
      drawMesh(M.sph.puff, partAt(fr, 0, 2.1 * s, 0, 0, [0.55 * s, 0.3 * s, 0.55 * s]), { tint: [1, 0.93, 0.86] });
    } else if (d.kind === 'crystal') {
      drawMesh(M.crystal, partAt(fr, 0, 1.25 * s, 0, d.spin, [0.9 * s, 1.15 * s, 0.9 * s]), { tint: d.tint || [0.72, 0.88, 1], emit: 0.32 });
      drawSprite(M.quad, TEX.glow, billboardMat(V3.add(p, V3.scale(up, 1.5 * s)), 5.2 * s), { alpha: 0.28, tint: d.tint || [0.7, 0.85, 1] });
    } else {
      drawMesh(M.boulder, partAt(fr, 0, 0.75 * s, 0, d.spin, [1.7 * s, 1.1 * s, 1.5 * s], 0.5), { tex: TEX.stone, tint: [0.85, 0.82, 0.95] });
    }
  }
  /* the built world: garden gate, Launch Star shrines, the pond, the old ruins, the stone path */
  for (const d of SYS.structures) {
    const up = V3.norm(d.dir);
    const p = onSphere(d.planet, d.dir, 0);
    if (!near(p, 190)) continue;
    const fr = frameMat(p, up, Math.atan2(d.dir[0], d.dir[2]));
    const s = d.s;
    if (d.kind === 'plaza') {
      /* a gentle stone dome at the top of the world — also hides the texture pinch at the pole */
      drawMesh(M.sph.moon, partAt(fr, 0, -3.1 * s, 0, 0, [9.8 * s, 3.4 * s, 9.8 * s]), { tex: TEX.stone, tint: [1.04, 1, 0.92] });
      drawMesh(M.ring.gold, M4.mul(fr, M4.trs([0, 0.32 * s, 0], 0, [3.6 * s, 1, 3.6 * s])), { tex: TEX.stone, tint: [0.82, 0.78, 0.95] });
    } else if (d.kind === 'gate') {
      const sideW = V3.norm(V3.cross(up, d.dir));
      for (let q = -1; q <= 1; q += 2) {
        drawShadow(V3.add(p, V3.scale(sideW, q * 5.4 * s)), up, 4.5, 0.26);
        drawMesh(M.box.pillar, partAt(fr, q * 5.4 * s, 3.9 * s, 0, 0, [1.5 * s, 1.15 * s, 1.5 * s]), { tex: TEX.stone });
        drawMesh(M.sph.puff, partAt(fr, q * 5.4 * s, 8 * s, 0, 0, [0.95 * s, 0.95 * s, 0.95 * s]), { tint: [1, 0.85, 0.4], emit: 0.5 });
        drawSprite(M.quad, TEX.glow, billboardMat(V3.add(V3.add(p, V3.scale(up, 8 * s)), V3.scale(sideW, q * 5.4 * s)), 6 * s), { alpha: 0.4, tint: [1, 0.88, 0.5] });
      }
      drawMesh(M.box.body, partAt(fr, 0, 8.5 * s, 0, 0, [9 * s, 1.15 * s, 2.2 * s]), { tex: TEX.stone });
    } else if (d.kind === 'shrine') {
      let side = V3.norm(V3.cross(up, [0, 1, 0]));
      if (V3.len(side) < 0.1) side = [1, 0, 0];
      const fwd = V3.norm(V3.cross(up, side));
      for (let q = 0; q < 4; q++) {
        const a = q / 4 * Math.PI * 2 + 0.4;
        const off = V3.add(V3.scale(side, Math.cos(a) * 3.6 * s), V3.scale(fwd, Math.sin(a) * 3.6 * s));
        drawMesh(M.box.pillar, M4.mul(frameMat(V3.add(p, off), up, 0), M4.trs([0, 1.7 * s, 0], 0, [0.72 * s, 0.48 * s, 0.72 * s])), { tex: TEX.stone });
      }
      drawMesh(M.crystal, partAt(fr, 0, 3.6 * s + Math.sin(SYS.time * 1.8) * 0.4, 0, SYS.time * 0.8, 0.75 * s), { tint: [1, 0.88, 0.5], emit: 0.5 });
      drawSprite(M.quad, TEX.glow, billboardMat(V3.add(p, V3.scale(up, 3.6 * s)), 6 * s), { alpha: 0.35, tint: [1, 0.9, 0.55] });
    } else if (d.kind === 'pond') {
      drawMesh(M.sph.moon, partAt(fr, 0, -0.5 * s, 0, 0, [7.6 * s, 1.15 * s, 7.6 * s]), { tex: TEX.water, emit: 0.1 });
      drawMesh(M.ring.gold, M4.mul(fr, M4.trs([0, 0.3 * s, 0], 0, [3.3 * s, 1, 3.3 * s])), { tex: TEX.stone, tint: [0.9, 0.88, 1] });
      for (let q = 0; q < 2; q++) {
        const a = SYS.time * 0.5 + q * 3.1;
        const glint = V3.add(V3.add(p, V3.scale(up, 0.6)), V3.scale(V3.norm(V3.cross(up, d.dir)), Math.cos(a) * 4.2 * s));
        drawSprite(M.quad, TEX.glow, billboardMat(glint, 2.6), { alpha: 0.5, tint: [1, 1, 1] });
      }
    } else if (d.kind === 'ruins') {
      for (let q = -1; q <= 1; q++) {
        const h = q === 0 ? 0.62 : 1;
        drawMesh(M.box.pillar, partAt(fr, q * 4.6 * s, 3.5 * s * h, 0, q * 0.2, [1.35 * s, h * s, 1.35 * s]), { tex: TEX.stone, tint: [0.92, 0.88, 1] });
      }
      drawMesh(M.box.body, partAt(fr, -0.4 * s, 7.3 * s, 0, 0, [7.4 * s, 1.05 * s, 1.9 * s], 0, 0.06), { tex: TEX.stone, tint: [0.95, 0.92, 1] });
    } else if (d.kind === 'path') {
      drawMesh(M.box.step, partAt(fr, 0, 0.26 * s, 0, d.spin * 4, [s, 0.8 * s, s]), { tex: TEX.stone, tint: [1.08, 1.04, 0.94] });
    }
  }
  /* Launch Stars: a golden pad and a floating, spinning star */
  for (const l of SYS.launches) {
    const up = V3.norm(l.dir), p = onSphere(l.planet, l.dir, 0.25);
    const fr = frameMat(p, up, 0);
    drawMesh(M.ring.gold, fr, { emit: 0.35 });
    const bob = Math.sin(SYS.time * 2.2) * 0.5;
    drawMesh(M.star.launch, M4.mul(fr, M4.trs([0, 3.6 + bob, 0], SYS.time * 1.4, 1, 0.25)), { emit: 0.55 });
    drawSprite(M.quad, TEX.glow, billboardMat(V3.add(p, V3.scale(up, 3.6 + bob)), 9), { alpha: 0.5, tint: [1, 0.9, 0.5] });
  }
  /* star bits */
  for (const b of SYS.bits) {
    if (b.taken) continue;
    drawMesh(M.star.bit, M4.trs(b.p, SYS.time * 1.8 + b.spin, 1, 0.35), { emit: 0.5 });
    drawSprite(M.quad, TEX.glow, billboardMat(b.p, 3.2), { alpha: 0.35, tint: [1, 0.95, 0.6] });
  }
  /* the sprouts */
  for (const e of SYS.sprouts) drawSprout(e);
  /* Meteor Mike + his shockwave */
  const m = SYS.mike;
  if (m && m.state !== 'gone') {
    drawMike(m);
    if (m.shock > 0) {
      const up = V3.norm(V3.sub(m.pos, m.planet.c));
      const fr = frameMat(m.pos, up, 0);
      const rr = 1 + (1 - m.shock) * 22;
      drawMesh(M.ring.gold, M4.mul(fr, M4.trs([0, 0.7, 0], 0, [rr / 2.4, 1, rr / 2.4])), { emit: 0.7, alpha: m.shock });
    }
  }
  /* the Power Star, when it exists */
  if (SYS.star) {
    const s = SYS.star, bob = Math.sin(SYS.time * 1.6) * 1.1;
    drawMesh(M.star.power, M4.trs([s.p[0], s.p[1] + bob, s.p[2]], SYS.time * 0.9, 1, 0.3), { emit: 0.6 });
    drawSprite(M.quad, TEX.glow, billboardMat([s.p[0], s.p[1] + bob, s.p[2]], 22), { alpha: 0.55, tint: [1, 0.9, 0.45] });
    drawSprite(M.quad, TEX.glow, billboardMat([s.p[0], s.p[1] + bob, s.p[2]], 40), { alpha: 0.22, tint: [1, 0.85, 0.4] });
  }
  /* Kinan */
  const P = PLAYER;
  const blink = P.inv > 0 && Math.floor(SYS.time * 12) % 2 === 0;
  if (!blink) {
    drawKinan3D(P.pos, P.up, P.face, {
      walk: P.anim, air: P.grounded ? 0 : 1,
      squash: P.squash, stretch: P.stretch
    });
  }
  /* particles as soft glows */
  for (const q of SYS.particles) {
    drawSprite(M.quad, TEX.glow, billboardMat(q.p, q.size * 2.2), { alpha: Math.min(1, q.life * 1.6), tint: [1, 1, 1] });
  }
}

/* ----------------------------------------------------------------------------
   gameplay
   ---------------------------------------------------------------------------- */
function hurtPlayer(fromPos) {
  const P = PLAYER;
  if (P.inv > 0 || G3.mode !== 'level') return;
  P.hp -= 1;
  P.heartsLost += 1;
  P.inv = 1.5;
  const up = P.up;
  const away = fromPos ? V3.norm(V3.sub(P.pos, fromPos)) : up;
  P.vel = V3.add(V3.scale(up, 13), V3.scale(away, 7));
  P.grounded = false;
  burst(P.pos, '#ff8f9f', 12);
  if (G3.sfx) G3.sfx('hurt');
  hudUpdate();
  if (P.hp <= 0) {
    P.hp = 3;
    const home = SYS.planets[0];
    P.planet = home;
    P.pos = onSphere(home, [0, 1, 0], 2);
    P.vel = [0, 0, 0];
    burst(P.pos, '#ffffff', 20);
  }
}
function levelTick(dt) {
  const P = PLAYER;
  SYS.time += dt;
  inTick();
  playerPhysics(dt);
  camStep(dt);
  particlesTick(dt);
  /* smooth the facing turn */
  let dFace = P.faceTarget - P.face;
  while (dFace > Math.PI) dFace -= Math.PI * 2;
  while (dFace < -Math.PI) dFace += Math.PI * 2;
  P.face += dFace * Math.min(1, dt * 10);
  /* sprouts patrol their little circle of planet */
  for (const e of SYS.sprouts) {
    if (e.dead > 0) { e.dead += dt; continue; }
    e.t += dt;
    e.dir = rotAxis(e.dir, [0, 1, 0], 0.22 * dt);
    e.pos = onSphere(e.planet, e.dir, 0);
    e.face = Math.atan2(e.dir[0], e.dir[2]);
    const d = V3.len(V3.sub(P.pos, e.pos));
    if (d < 3.1 && P.inv <= 0) {
      const upE = V3.norm(e.dir);
      const above = V3.dot(V3.sub(P.pos, e.pos), upE);
      const falling = V3.dot(P.vel, upE) < -1;
      if (above > 1.4 && falling) {
        e.dead = 0.001;
        P.vel = V3.add(V3.sub(P.vel, V3.scale(upE, V3.dot(P.vel, upE))), V3.scale(upE, 16));
        burst(e.pos, '#9ff08a', 14);
        if (G3.sfx) G3.sfx('stomp');
        hudToast('Squish! 🌱');
      } else {
        hurtPlayer(e.pos);
      }
    }
  }
  /* Launch Stars */
  if (P.grounded && !P.flight) {
    for (const l of SYS.launches) {
      const lp = onSphere(l.planet, l.dir, 0.5);
      if (V3.len(V3.sub(P.pos, lp)) < 5) {
        const up = V3.norm(l.dir);
        const to = onSphere(l.target, V3.norm(V3.sub(l.planet.c, l.target.c)), 2);
        P.flight = {
          from: P.pos.slice(), to: to, t: 0, dur: 1.25, arc: l.arc,
          up: V3.norm(V3.sub(l.target.c, l.planet.c)), planet: l.target
        };
        burst(P.pos, '#ffe36b', 18);
        if (G3.sfx) G3.sfx('launch');
        hudToast('WHEEE! 🚀');
        break;
      }
    }
  }
  /* star bits */
  for (const b of SYS.bits) {
    if (b.taken) continue;
    if (V3.len(V3.sub(P.pos, b.p)) < 3.2) {
      b.taken = true;
      G3.bits += 1;
      burst(b.p, '#ffe36b', 5);
      if (G3.sfx) G3.sfx('bit');
      hudUpdate();
    }
  }
  /* Meteor Mike */
  const m = SYS.mike;
  if (m && m.state !== 'gone') {
    m.t += dt;
    if (m.hurt > 0) m.hurt -= dt;
    if (m.shock > 0) m.shock = Math.max(0, m.shock - dt * 1.1);
    const upM = V3.norm(m.dir);
    m.pos = onSphere(m.planet, m.dir, 0);
    const toPlayer = V3.len(V3.sub(P.pos, m.pos));
    if (m.state === 'sleep') {
      if (toPlayer < 34) {
        m.state = 'chase'; m.t = 0;
        burst(m.pos, '#ff9f5a', 26);
        if (G3.sfx) G3.sfx('boss');
        hudToast('☄️ <b>METEOR MIKE</b> wakes up!');
      }
    } else if (m.state === 'chase') {
      const targetDir = V3.norm(V3.sub(P.pos, m.planet.c));
      m.dir = V3.norm(V3.lerp(m.dir, targetDir, Math.min(1, dt * 0.85)));
      m.face = Math.atan2(m.dir[0], m.dir[2]);
      if (m.t > 2.3) {   /* leap at Kinan */
        m.state = 'leap'; m.t = 0;
        m.leapTo = targetDir;
      }
    } else if (m.state === 'leap') {
      const k = Math.min(1, m.t / 0.8);
      m.dir = V3.norm(V3.lerp(m.dir, m.leapTo, k));
      m.hop = Math.sin(k * Math.PI) * 9;
      if (k >= 1) {
        m.state = 'rest'; m.t = 0; m.hop = 0;
        m.shock = 1;
        shakeBoom();
        burst(m.pos, '#ffcf8a', 22);
        if (G3.sfx) G3.sfx('boom');
        if (P.grounded && toPlayer < 24) hurtPlayer(m.pos);
      }
    } else if (m.state === 'rest') {
      if (m.t > 2.5) { m.state = 'chase'; m.t = 0; }
    }
    /* stomp or touch */
    if (P.inv <= 0 && m.state !== 'sleep') {
      const head = V3.add(m.pos, V3.scale(upM, 4.2 + (m.hop || 0)));
      const d = V3.len(V3.sub(P.pos, head));
      const falling = V3.dot(P.vel, upM) < -1;
      if (d < 6.2 && V3.dot(V3.sub(P.pos, m.pos), upM) > 3.5 && falling) {
        m.hp -= 1;
        m.hurt = 0.7;
        m.state = 'rest'; m.t = -0.6;
        P.vel = V3.add(V3.sub(P.vel, V3.scale(upM, V3.dot(P.vel, upM))), V3.scale(upM, 20));
        burst(head, '#ffd166', 26);
        if (G3.sfx) G3.sfx('stomp');
        hudToast(m.hp > 0 ? ('BOOM! ' + m.hp + ' more stomps!') : '☄️ Down goes Mike!');
        if (m.hp <= 0) {
          m.state = 'gone';
          burst(m.pos, '#ff9f5a', 40);
          burst(m.pos, '#ffe36b', 40);
          /* the star rockets over to the side of the arena — Kinan has to go get it */
          const starDir = V3.norm(m.dir);
          let sAxis = V3.cross(starDir, [0, 1, 0]);
          if (V3.len(sAxis) < 0.1) sAxis = [1, 0, 0];
          SYS.star = { p: onSphere(m.planet, rotAxis(starDir, V3.norm(sAxis), 1.25), 10) };
          hudToast('⭐ The <b>Power Star</b> appeared!');
        }
        hudUpdate();
      } else if (d < 5.6) {
        hurtPlayer(m.pos);
      }
    }
  }
  /* the Power Star ends the level */
  if (SYS.star && V3.len(V3.sub(P.pos, SYS.star.p)) < 5.5) {
    SYS.star = null;
    burst(P.pos, '#ffe36b', 60);
    if (G3.sfx) G3.sfx('win');
    winLevel();
    return;
  }
  /* fell off into deep space */
  const near = nearestPlanet(P.pos, 1e9);
  if (near && V3.len(V3.sub(P.pos, near.c)) > near.r + 160) hurtPlayer(null);
}
function shakeBoom() {
  G3.shake = 1;
}

/* ----------------------------------------------------------------------------
   the 3D game shell: state, HUD, main loop
   ---------------------------------------------------------------------------- */
const G3 = {
  mode: 'off',   /* 'off' | 'level' | 'cutscene' | 'done' */
  bits: 0, shake: 0, sfx: null, say: null, onFinish: null, onCutsceneDone: null,
  running: false, host: null, hud: null, time: 0, cut: null, raf: 0, last: 0
};
const HUD_CSS = [
  'position:absolute;left:10px;right:10px;top:8px;display:flex;gap:8px;align-items:center;',
  'font:600 15px/1.2 "Pixelify Sans",ui-monospace,monospace;color:#f4f1e8;pointer-events:none;',
  'text-shadow:0 2px 0 rgba(0,0,0,.55);z-index:5;'
].join('');
function hudBuild() {
  if (G3.hud) return;
  const d = document.createElement('div');
  d.style.cssText = HUD_CSS;
  d.innerHTML = '<span id="g3hearts"></span><span id="g3bits" style="color:#ffe36b"></span>'
    + '<span style="flex:1"></span><span id="g3pips" style="color:#ff9f5a"></span>'
    + '<span id="g3toast" style="position:absolute;left:0;right:0;top:34px;text-align:center;opacity:0;transition:opacity .3s"></span>';
  G3.host.appendChild(d);
  G3.hud = d;
}
function hudUpdate() {
  if (!G3.hud) return;
  const h = G3.hud.querySelector('#g3hearts');
  if (h) h.textContent = '❤'.repeat(Math.max(0, PLAYER.hp)) + '♡'.repeat(Math.max(0, 3 - PLAYER.hp));
  const b = G3.hud.querySelector('#g3bits');
  if (b) b.textContent = '★ ' + G3.bits;
  const p = G3.hud.querySelector('#g3pips');
  if (p) {
    const m = SYS.mike;
    p.textContent = (m && m.state !== 'gone' && m.state !== 'sleep') ? ('☄️ ' + '●'.repeat(Math.max(0, m.hp))) : '';
  }
}
function hudToast(html) {
  if (!G3.hud) return;
  const t = G3.hud.querySelector('#g3toast');
  if (!t) return;
  t.innerHTML = html;
  t.style.opacity = '1';
  clearTimeout(G3.toast);
  G3.toast = setTimeout(() => { t.style.opacity = '0'; }, 1700);
}
function winLevel() {
  G3.mode = 'done';
  G3.time = SYS.time;
  hudToast('⭐ <b>POWER STAR GET!</b>');
  setTimeout(() => {
    if (G3.onFinish) {
      G3.onFinish({
        bits: G3.bits, total: SYS.bits.length,
        heartsLost: PLAYER.heartsLost, time: Math.round(SYS.time)
      });
    }
  }, 1400);
}
function frameLoop(t) {
  if (!G3.running) return;
  G3.raf = requestAnimationFrame(frameLoop);
  const raw = (t - G3.last) / 1000;
  const dt = (raw > 0 && raw < 1) ? raw : 0.016;   /* first frame and tab switches step one frame */
  G3.last = t;
  try {
    if (G3.mode === 'level') {
      SYS.time += 0;   /* levelTick keeps its own clock */
      levelTick(dt);
    } else if (G3.mode === 'cutscene') {
      cutTick(dt);
    } else if (G3.mode === 'done') {
      SYS.time += dt;
      playerPhysics(dt);
      camStep(dt);
      particlesTick(dt);
      PLAYER.face += dt * 2.4;   /* the victory spin */
      PLAYER.anim += dt * 6;
    }
    if (G3.shake > 0) G3.shake = Math.max(0, G3.shake - dt * 2);
    renderScene();
  } catch (e) {
    G3.running = false;
    if (window.console) console.log('galaxy3d frame error: ' + e);
    throw e;
  }
}
function startLoop() {
  if (G3.running) return;
  G3.running = true;
  G3.last = performance.now();
  G3.raf = requestAnimationFrame(frameLoop);
}
function stopLoop() {
  G3.running = false;
  if (G3.raf) cancelAnimationFrame(G3.raf);
  G3.raf = 0;
}

/* ----------------------------------------------------------------------------
   THE CUTSCENE — Kinan wins, something strange happens, and the world slowly
   turns from a flat 2D game into a crisp 3D galaxy, in one continuous shot.
   The "flat look" is real: the scene renders unlit through a narrow telephoto
   camera, then shading, depth and perspective fade in as the camera pulls back.
   ---------------------------------------------------------------------------- */
const CUT_LINES = [
  [0.4, '<b>KINAN:</b> We did it! The storm is gone! BEST. BIRTHDAY. EVER!', 'k', 'h'],
  [1.9, '<b>MOM:</b> Come here, birthday boy — that was INCREDIBLE!', 'm', 'h'],
  [3.4, '<b>DAD:</b> ...Uh, kids? Why does the horizon look... bent?', 'd', 's'],
  [4.8, '<b>CHENOA:</b> Little bro... the world is doing a THING again!', 'c', 's'],
  [6.3, '<b>KINAN:</b> Whoa... everything feels... different. Like the world just got MORE of itself!', 'k', 's'],
  [8.4, '<b>SHAD:</b> The graphics just got CLEANER. How is this POSSIBLE?!', 's', 's'],
  [10.3, '<b>DAD:</b> Well. I always said we needed more yard.', 'd', 'h']
];
function cutTick(dt) {
  const c = G3.cut;
  c.t += dt;
  const t = c.t;
  while (c.line < CUT_LINES.length && t >= CUT_LINES[c.line][0]) {
    const L = CUT_LINES[c.line++];
    if (G3.say) G3.say(L[1], L[2], L[3]);
  }
  const morphK = clamp((t - 4.6) / 3.6, 0, 1);
  const ease = morphK * morphK * (3 - 2 * morphK);
  R.forceUnlit = 1 - ease;
  SYS.time += dt;
  particlesTick(dt);
  const P = PLAYER, home = SYS.planets[0];
  const up = V3.norm(V3.sub(P.pos, home.c));
  /* Kinan bounces with joy, then floats and looks around as the world changes */
  if (t < 4.6) {
    P.pos = onSphere(home, [0, 1, 0], 2 + Math.abs(Math.sin(t * 7)) * (t < 2.4 ? 1.0 : 0.25));
    P.anim += dt * (t < 2.4 ? 9 : 2);
    P.face += dt * (t < 2.4 ? 2.8 : 0.4);
    if (Math.random() < dt * 6) burst(V3.add(P.pos, V3.scale(up, 3)), ['#ff6fae', '#f6c445', '#7be3a3', '#fff'][Math.floor(Math.random() * 4)], 3);
  } else {
    P.pos = onSphere(home, [0, 1, 0], 2 + ease * 3);
    P.face += dt * 0.8;
    if (Math.random() < dt * 3) burst(V3.add(P.pos, V3.scale(up, 4)), '#ffe36b', 2);
  }
  /* the camera: a flat side view that lifts, tilts and pulls back to reveal space */
  const lift = clamp((t - 2.2) / 6, 0, 1);
  const orbit = -0.35 + t * 0.045 + Math.max(0, t - 8.2) * 0.11;
  const dist = 30 - ease * 6 + Math.max(0, t - 8.2) * 3.6;
  const height = 2 + lift * lift * 26 + ease * 6;
  let dir = rotAxis(V3.norm(V3.cross(up, [0, 0, 1])), up, orbit);
  if (V3.len(dir) < 0.1) dir = [0, 0, 1];
  CAM.dir = dir;
  CAM.up = up;
  CAM.pos = V3.add(V3.add(P.pos, V3.scale(dir, -dist)), V3.scale(up, height));
  CAM.fov = 0.42 + ease * 0.52;
  /* the strange phase wobbles everything a little */
  if (t > 2.6 && t < 6.2) {
    const w = Math.sin(t * 9) * 0.8 * (1 - ease * 0.6);
    CAM.pos = V3.add(CAM.pos, V3.scale(V3.norm(V3.cross(up, dir)), w));
  }
  /* the title card rides in on the reveal */
  if (G3.title) {
    const show = t > 8.7 && t < 12.6;
    G3.title.style.opacity = show ? '1' : '0';
    G3.title.style.transform = 'translate(-50%,-50%) scale(' + (show ? 1 : 0.85) + ')';
    if (show && t < 9.1 && G3.sfx) G3.sfx('win');
  }
  if (t > 12.8 && !c.done) {
    c.done = true;
    R.forceUnlit = 0;
    const cb = G3.onCutsceneDone;
    G3.onCutsceneDone = null;
    if (cb) cb();
  }
}

/* ----------------------------------------------------------------------------
   controls: keyboard + mouse on desktop, thumbstick + JUMP on touch — the game
   shows whichever the device supports, and a swipe turns the camera
   ---------------------------------------------------------------------------- */
function bindControls() {
  const canvas = G3.canvas;
  const kd = (e) => inKey(e, true), ku = (e) => inKey(e, false);
  let mouseDown = false, lastX = 0;
  const md = (e) => { mouseDown = true; lastX = e.clientX; };
  const mm = (e) => { if (mouseDown) { IN.camX += (e.clientX - lastX) * 0.006; lastX = e.clientX; } };
  const mu = () => { mouseDown = false; };
  const ts = (e) => {
    for (const t of e.changedTouches) {
      if (t.clientX < window.innerWidth / 2 && IN.touch.stickId < 0) {
        IN.touch.stickId = t.identifier;
        IN.touch.ox = t.clientX; IN.touch.oy = t.clientY;
        IN.touch.x = t.clientX; IN.touch.y = t.clientY;
      } else if (IN.touch.camId < 0) {
        IN.touch.camId = t.identifier;
        IN.touch.cx = t.clientX; IN.touch.cy = t.clientY;
      }
    }
  };
  const tm = (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === IN.touch.stickId) { IN.touch.x = t.clientX; IN.touch.y = t.clientY; }
      else if (t.identifier === IN.touch.camId) {
        IN.camX += (t.clientX - IN.touch.cx) * 0.007;
        IN.touch.cx = t.clientX; IN.touch.cy = t.clientY;
      }
    }
    e.preventDefault();
  };
  const te = (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === IN.touch.stickId) IN.touch.stickId = -1;
      if (t.identifier === IN.touch.camId) IN.touch.camId = -1;
    }
  };
  window.addEventListener('keydown', kd);
  window.addEventListener('keyup', ku);
  canvas.addEventListener('mousedown', md);
  window.addEventListener('mousemove', mm);
  window.addEventListener('mouseup', mu);
  canvas.addEventListener('touchstart', ts, { passive: false });
  canvas.addEventListener('touchmove', tm, { passive: false });
  canvas.addEventListener('touchend', te);
  canvas.addEventListener('touchcancel', te);
  G3.unbind = () => {
    window.removeEventListener('keydown', kd);
    window.removeEventListener('keyup', ku);
    canvas.removeEventListener('mousedown', md);
    window.removeEventListener('mousemove', mm);
    window.removeEventListener('mouseup', mu);
    canvas.removeEventListener('touchstart', ts);
    canvas.removeEventListener('touchmove', tm);
    canvas.removeEventListener('touchend', te);
    canvas.removeEventListener('touchcancel', te);
    IN.touch.stickId = -1; IN.touch.camId = -1;
    IN.jump = false; IN.jumpHeld = false; IN.keys = {};
  };
}
function buildJumpBtn() {
  if (G3.jumpBtn || !('ontouchstart' in window)) return;
  const b = document.createElement('button');
  b.type = 'button';
  b.setAttribute('aria-label', 'Jump');
  b.textContent = 'JUMP';
  b.style.cssText = 'position:absolute;right:16px;bottom:16px;width:clamp(70px,13vmin,110px);height:clamp(70px,13vmin,110px);'
    + 'border-radius:50%;border:3px solid #f4f1e8;background:#f6c445;color:#0b0d20;z-index:7;touch-action:none;'
    + 'font:700 18px "Pixelify Sans",ui-monospace,monospace;box-shadow:0 3px 0 rgba(0,0,0,.4)';
  const on = (e) => { e.preventDefault(); IN.jump = true; IN.jumpHeld = true; };
  const off = (e) => { e.preventDefault(); IN.jump = false; IN.jumpHeld = false; };
  b.addEventListener('touchstart', on, { passive: false });
  b.addEventListener('touchend', off, { passive: false });
  b.addEventListener('mousedown', on);
  b.addEventListener('mouseup', off);
  G3.host.appendChild(b);
  G3.jumpBtn = b;
}
function resizeNow() {
  if (!G3.host || !R.gl) return;
  const w = G3.host.clientWidth || 640, h = G3.host.clientHeight || 360;
  glSize(w, h, Math.min(2, window.devicePixelRatio || 1));
}
window.addEventListener('resize', () => { if (G3.mode !== 'off') resizeNow(); });

/* ----------------------------------------------------------------------------
   the public surface: index.html calls these three
   ---------------------------------------------------------------------------- */
function ensureInit(host) {
  if (R.gl && G3.canvas) {
    if (G3.canvas.parentNode !== host) host.appendChild(G3.canvas);
    G3.canvas.style.display = 'block';
    return true;
  }
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none;z-index:0';
  const dlg = host.querySelector('#dialog');   /* the game's story boxes stay ON TOP of the 3D view */
  if (dlg) host.insertBefore(canvas, dlg); else host.appendChild(canvas);
  try {
    if (!glInit(canvas)) { host.removeChild(canvas); return false; }
    buildMeshes();
    buildTextures();
  } catch (e) {
    if (window.console) console.log('galaxy3d init failed: ' + e);
    try { host.removeChild(canvas); } catch (e2) {}
    return false;
  }
  G3.canvas = canvas;
  return true;
}
function buildTitle() {
  if (G3.title) return;
  const d = document.createElement('div');
  d.style.cssText = 'position:absolute;left:50%;top:40%;transform:translate(-50%,-50%) scale(.85);opacity:0;'
    + 'transition:opacity .6s,transform .6s;text-align:center;z-index:6;pointer-events:none;white-space:nowrap;'
    + 'font-family:"Pixelify Sans",ui-monospace,monospace;text-shadow:0 3px 0 rgba(0,0,0,.55)';
  d.innerHTML = '<div style="color:#f6c445;font-size:clamp(18px,4vmin,30px);letter-spacing:2px">WORLD 6</div>'
    + '<div style="color:#f4f1e8;font-size:clamp(26px,7vmin,58px);font-weight:700">KINAN IN THE STARS</div>'
    + '<div style="color:#a7a9cc;font-size:clamp(12px,2.6vmin,20px)">a sneak peek at Kinan vs. the Cosmos</div>';
  G3.host.appendChild(d);
  G3.title = d;
}
function resetPlayer() {
  const home = SYS.planets[0];
  PLAYER.pos = onSphere(home, [0, 1, 0], 2);   /* the north pole, clear of every Launch Star */
  PLAYER.vel = [0, 0, 0];
  PLAYER.planet = home;
  PLAYER.up = [0, 1, 0];
  PLAYER.grounded = true;
  PLAYER.hp = 3;
  PLAYER.inv = 0;
  PLAYER.face = 0;
  PLAYER.faceTarget = 0;
  PLAYER.anim = 0;
  PLAYER.heartsLost = 0;
  PLAYER.flight = null;
  CAM.pos = [0, 40, 40];
  CAM.up = [0, 1, 0];
  CAM.dir = V3.norm([0, -0.25, -1]);
  CAM.fov = 0.9;
  IN.camX = 0;
}
function start(opts) {
  opts = opts || {};
  if (!opts.host || !ensureInit(opts.host)) return false;
  G3.host = opts.host;
  G3.sfx = opts.sfx || null;
  G3.onFinish = opts.onFinish || null;
  G3.say = opts.say || null;
  buildLevel();
  resetPlayer();
  G3.bits = 0;
  G3.mode = 'level';
  G3.cut = null;
  R.forceUnlit = 0;
  hudBuild();
  if (G3.hud) G3.hud.style.opacity = '1';
  buildTitle();
  if (G3.title) G3.title.style.opacity = '0';
  if (G3.jumpBtn) G3.jumpBtn.style.display = '';
  hudUpdate();
  buildJumpBtn();
  bindControls();
  resizeNow();
  startLoop();
  if (opts.intro !== false && G3.say) {
    G3.say('<b>KINAN:</b> Everything is ROUND! I can run all the way around the world!', 'k', 'h');
    hudToast('Run around the planet! 🪐 Find the <b>Launch Stars</b>!');
  }
  return true;
}
function cutscene(opts) {
  return new Promise((res) => {
    opts = opts || {};
    if (!opts.host || !ensureInit(opts.host)) { res(); return; }
    G3.host = opts.host;
    G3.sfx = opts.sfx || null;
    G3.say = opts.say || null;
    buildLevel();
    resetPlayer();
    G3.mode = 'cutscene';
    G3.cut = { t: 0, line: 0, done: false };
    R.forceUnlit = 1;
    hudBuild();
    if (G3.hud) G3.hud.style.opacity = '0';
    buildTitle();
    if (G3.jumpBtn) G3.jumpBtn.style.display = 'none';
    bindControls();
    resizeNow();
    G3.onCutsceneDone = () => res();
    startLoop();
  });
}
function stop() {
  stopLoop();
  if (G3.unbind) { G3.unbind(); G3.unbind = null; }
  if (G3.canvas) G3.canvas.style.display = 'none';
  if (G3.hud && G3.hud.parentNode) G3.hud.parentNode.removeChild(G3.hud);
  if (G3.title && G3.title.parentNode) G3.title.parentNode.removeChild(G3.title);
  if (G3.jumpBtn && G3.jumpBtn.parentNode) G3.jumpBtn.parentNode.removeChild(G3.jumpBtn);
  G3.hud = null; G3.title = null; G3.jumpBtn = null;
  G3.mode = 'off';
  G3.cut = null;
}
window.GALAXY3D = {
  get available() {
    if (R.gl) return true;
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch (e) { return false; }
  },
  start: start,
  cutscene: cutscene,
  stop: stop,
  state: () => ({
    mode: G3.mode, bits: G3.bits, total: SYS.bits.length, hp: PLAYER.hp,
    grounded: PLAYER.grounded, time: Math.round(SYS.time),
    mike: SYS.mike ? SYS.mike.state : null, mikeHp: SYS.mike ? SYS.mike.hp : 0,
    star: !!SYS.star, cut: G3.cut ? Math.round(G3.cut.t * 10) / 10 : null
  }),
  /* small hooks the smoke test uses */
  test: {
    player: PLAYER, sys: SYS, tick: (dt) => { levelTick(dt == null ? 0.016 : dt); renderScene(); },
    cutTick: (dt) => { cutTick(dt == null ? 0.016 : dt); renderScene(); },
    render: () => renderScene(),
    teleport: (planetIdx, dir) => {
      const pl = SYS.planets[planetIdx] || SYS.planets[0];
      PLAYER.planet = pl;
      PLAYER.pos = onSphere(pl, dir || [0, 1, 0], 2);
      PLAYER.vel = [0, 0, 0];
    }
  }
};
})();
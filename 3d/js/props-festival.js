// Prop library for World 12's festival (levels/12-castle.js): stalls, the banner arch, wrapped presents to stand on,
// bunting, balloons, Dad's joke book. A prop draws in its own local space, front = +z (see props.js).
const nc = (o = {}) => Object.assign({ col: false }, o);
const PAPER = ['#ff5fa2', '#3f8fe8', '#5cc23a', '#ff9a3c', '#9b6cff', '#e8473c'];
const RIBBON = ['#ffffff', '#ffd23f', '#ffffff', '#ffffff', '#ffd23f', '#ffffff'];

export const FESTIVAL = {
  // a big wrapped present: solid, Kinan stands on it. {w, h, d, n (colour number), bounce}
  present(b, o) {
    const w = o.w || 4, h = o.h || 2, d = o.d || 4, n = (o.n || 0) % PAPER.length, c = o.color || PAPER[n], rib = RIBBON[n];
    b.box(0, 0, 0, w, h, d, c, { r: 0.14, mat: 'gloss', phys: o.bounce ? { bounce: o.bounce } : {} });
    b.box(0, -0.01, 0, Math.min(0.8, w * 0.2), h + 0.05, d + 0.05, rib, nc({ r: 0.04, mat: 'gloss' }));
    b.box(0, -0.01, 0, w + 0.05, h + 0.05, Math.min(0.8, d * 0.2), rib, nc({ r: 0.04, mat: 'gloss' }));
    if (o.bow !== false) {
      for (const sx of [-1, 1]) b.sphere(sx * 0.42, h + 0.2, 0, 0.36, rib, nc({ s: [1.25, 0.7, 0.8], seg: 10, mat: 'gloss' }));
      b.sphere(0, h + 0.2, 0, 0.2, '#ffd23f', nc({ seg: 10, mat: 'gloss' }));
    }
  },
  // a friendly festival stall: counter, striped awning, name board. {text, awning, goods}
  stall(b, o) {
    const W = o.w || 9, aw = o.awning || '#e8473c', wood = '#c48f63', goods = o.goods || ['#ff8fb8', '#ffd23f', '#7ec8ff'];
    b.box(0, 0, 0, W, 1.7, 2.2, '#f7f3ea', nc({ r: 0.12 }));
    b.box(0, 1.7, 0.1, W + 0.3, 0.2, 2.5, wood, nc({ r: 0.06 }));
    for (const sx of [-1, 1]) for (const z of [-1.1, 1.1]) b.box(sx * (W / 2 - 0.1), 0, z, 0.26, 5, 0.26, wood, nc({ r: 0.08 }));
    const n = 7, sw = (W + 0.6) / n;
    for (let i = 0; i < n; i++) b.ramp(-W / 2 - 0.3 + sw * (i + 0.5), 1.9, 4.5, -W / 2 - 0.3 + sw * (i + 0.5), -1.5, 5.8, sw, i % 2 ? '#ffffff' : aw, { thick: 0.16, col: false });
    for (let i = 0; i < n; i++) b.box(-W / 2 - 0.3 + sw * (i + 0.5), 4.05, 1.95, sw, 0.5, 0.1, i % 2 ? '#ffffff' : aw, nc({ r: 0.04 }));
    for (let i = 0; i < Math.floor(W / 1.3); i++) {
      const x = -W / 2 + 0.9 + i * 1.3;
      b.cyl(x, 1.9, 0.3, 0.34, 0.32, '#f4e1c0', nc({ seg: 10 }));
      b.sphere(x, 2.32, 0.3, 0.34, goods[i % goods.length], nc({ s: [1, 0.72, 1], seg: 10 }));
    }
    if (o.text) { b.box(0, 6.1, -0.9, Math.min(W, 7.6), 1.75, 0.2, '#8a5a34', nc({ r: 0.08 })); b.texPanel('sign:' + o.text, 0, 6.98, -0.76, Math.min(W, 7.6) - 0.2, 1.55, 0); }
  },
  // the big banner over the path. {text, w}
  festArch(b, o) {
    const W = o.w || 12, h = 8.2;
    for (const sx of [-1, 1]) {
      b.cyl(sx * W / 2, 0, 0, 0.45, h, sx > 0 ? '#ff5fa2' : '#3f8fe8', nc({ seg: 12 }));
      b.sphere(sx * W / 2, h + 0.3, 0, 0.75, '#ffd23f', nc({ seg: 12, mat: 'gloss' }));
    }
    b.box(0, h - 2.5, 0, W + 0.4, 2.6, 0.3, '#ffffff', nc({ r: 0.1 }));
    b.texPanel('sign:' + (o.text || 'HAPPY BIRTHDAY|KINAN!'), 0, h - 1.2, 0.17, W, 2.4, 0);
  },
  // a string of little flags between two poles, along local x. {len, h}
  bunting(b, o) {
    const L = o.len || 14, h = o.h || 6.2, n = Math.round(L / 1.25), cols = ['#e8473c', '#ffd23f', '#3f8fe8', '#5cc23a', '#ff5fa2'];
    for (const sx of [-1, 1]) b.cyl(sx * L / 2, 0, 0, 0.14, h + 0.3, '#f7f3ea', nc({ seg: 8 }));
    for (let i = 0; i <= n; i++) {
      const u = i / n, x = -L / 2 + L * u, y = h - Math.sin(u * Math.PI) * 0.9;
      b.box(x, y, 0, 1.2, 0.06, 0.06, '#ffffff', nc({ r: 0.01 }));
      b.cone(x, y - 0.75, 0, 0.42, 0.72, cols[i % cols.length], nc({ seg: 3, rx: 180, yaw: 30 }));
    }
  },
  // a bunch of balloons on strings. {seed}
  balloons(b, o) {
    const cols = ['#e8473c', '#ffd23f', '#3f8fe8', '#ff5fa2', '#5cc23a', '#9b6cff'], s = o.seed || 0;
    for (let i = 0; i < 5; i++) {
      const a = i * 1.26 + s, x = Math.cos(a) * 0.8, z = Math.sin(a) * 0.5, y = 4.3 + (i % 3) * 0.7;
      b.box(x * 0.5, 0.2, z * 0.5, 0.05, y - 0.4, 0.05, '#ffffff', nc({ r: 0.01 }));
      b.sphere(x, y, z, 0.62, cols[(i + s) % cols.length], nc({ s: [1, 1.18, 1], seg: 12, mat: 'gloss' }));
    }
    b.cyl(0, 0, 0, 0.3, 0.32, '#ffd23f', nc({ seg: 10 }));
  },
  // Dad's joke book, huge, open on a stand (it follows him into World 12)
  jokeBook(b, o) {
    b.box(0, 0, 0, 0.5, 1.7, 0.5, '#8d5a33', nc({ r: 0.08 }));
    b.box(0, 1.7, 0, 3.0, 0.14, 2.1, '#8d5a33', nc({ r: 0.05, rx: 12 }));
    for (const sx of [-1, 1]) {
      b.box(sx * 1.0, 1.9, 0, 1.9, 0.14, 2.3, '#e8473c', nc({ r: 0.05, rx: 12, mat: 'gloss' }));
      b.box(sx * 0.95, 2.03, 0, 1.75, 0.18, 2.1, '#fbf6e8', nc({ r: 0.04, rx: 12 }));
    }
    b.texPanel('sign:' + (o.text || "DAD'S|JOKE BOOK"), 0, 4.5, 0, 3.6, 1.7, 0);
    for (const sx of [-1, 1]) b.box(sx * 1.7, 0, 0, 0.14, 4.2, 0.14, '#8d5a33', nc({ r: 0.03 }));
  },
  // a long party table with a cloth. {w}
  partyTable(b, o) {
    const W = o.w || 8;
    b.box(0, 1.4, 0, W, 0.2, 2.6, '#fff4dc', nc({ r: 0.06 }));
    b.box(0, 0.5, 1.31, W, 0.95, 0.06, '#ff8fb8', nc({ r: 0.02 }));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box(sx * (W / 2 - 0.3), 0, sz * 1, 0.2, 1.4, 0.2, '#c48f63', nc({ r: 0.05 }));
  },
};

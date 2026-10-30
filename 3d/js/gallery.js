// THE MEMORY GALLERY: all 11 memory gifts (ages 1-11) in a scrolling room, each with its little picture, the age and
// Kinan's own line, word for word as the game says it (the level files and audio/lines/lines.js). No new gift in World 12.
// It opens after the finale (3d/js/finale.js) and from the menu of the 2D game (index.html, #galleryBtn), so it has no
// other files: plain DOM, its own styles, the pictures painted on small canvases.
//   openGallery({ onClose, closeLabel })   -> the overlay element (#memoryGallery)
const K = '#1b1220';

// every painter draws on a 64 x 64 grid (scaled up with crisp pixels, like the 2D game's art)
const rect = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const disc = (c, col, x, y, r, ry) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, r, ry || r, 0, 0, Math.PI * 2); c.fill(); };
const poly = (c, col, ...p) => { c.fillStyle = col; c.beginPath(); p.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); };

export const GIFTS = [
  { age: 1, name: 'Baby Fin', what: 'his singing shark', line: 'Baby Fin! My singing shark! I had this when I was one!',
    draw(c) {
      poly(c, '#3f8fe8', [8, 34], [20, 26], [20, 44]); poly(c, '#2f6fc0', [30, 22], [36, 8], [42, 24]);
      disc(c, '#3f8fe8', 36, 34, 22, 14); disc(c, '#f4f1e8', 40, 40, 16, 7);
      disc(c, '#ffffff', 49, 29, 4); disc(c, K, 50, 29, 2);
      poly(c, '#ffffff', [42, 42], [46, 42], [44, 46]); poly(c, '#ffffff', [48, 42], [52, 41], [50, 45]);
      rect(c, '#ffd23f', 54, 8, 2, 11); rect(c, '#ffd23f', 54, 8, 7, 2); disc(c, '#ffd23f', 52, 19, 3, 2);
    } },
  { age: 2, name: 'The Whirl Spinner', what: 'his spinning toy', line: 'My Whirl Spinner! I used to spin this for hours when I was two!',
    draw(c) {
      [[32, 14, '#e8473c'], [15, 44, '#3f8fe8'], [49, 44, '#5cc23a']].forEach(([x, y, col]) => { poly(c, '#ffd23f', [32, 33], [x - 7, y + (y < 20 ? 2 : -7)], [x + 7, y + (y < 20 ? 2 : -7)]); disc(c, K, x, y, 12); disc(c, col, x, y, 10); disc(c, '#ffffff', x, y, 3); });
      disc(c, K, 32, 34, 9); disc(c, '#ffd23f', 32, 34, 7); disc(c, '#ffffff', 32, 34, 2);
    } },
  { age: 3, name: 'The Rescue Pups fire truck', what: 'in Dad\'s lunch box', line: 'My Rescue Pups fire truck! It was in your lunch box?',
    draw(c) {
      rect(c, '#e8473c', 6, 28, 40, 18); rect(c, '#e8473c', 44, 20, 16, 26); rect(c, '#7ec8ff', 48, 24, 9, 9);
      rect(c, '#ffd23f', 6, 36, 54, 3); rect(c, '#c9c9cf', 10, 20, 32, 3); for (let x = 12; x < 42; x += 6) rect(c, '#c9c9cf', x, 17, 2, 8);
      rect(c, '#2a5bd7', 50, 16, 5, 4);
      for (const x of [16, 46]) { disc(c, K, x, 48, 7); disc(c, '#c9c9cf', x, 48, 3); }
    } },
  { age: 4, name: 'Sporky', what: 'his googly-eyed spork buddy', line: 'Sporky! My googly-eyed spork buddy! I loved him when I was four!',
    draw(c) {
      rect(c, '#f4f1e8', 28, 28, 8, 30); disc(c, '#f4f1e8', 32, 20, 15, 16); rect(c, '#c9c4b8', 22, 4, 3, 9); rect(c, '#c9c4b8', 30, 3, 3, 9); rect(c, '#c9c4b8', 38, 4, 3, 9);
      for (const x of [25, 39]) { disc(c, K, x, 20, 7); disc(c, '#ffffff', x, 20, 6); disc(c, K, x + 2, 22, 3); }
      rect(c, '#7d1f33', 26, 31, 12, 2); rect(c, '#ff5fa2', 8, 36, 20, 3); rect(c, '#ff5fa2', 36, 36, 20, 3);
    } },
  { age: 5, name: 'The rainbow drawing', what: 'for the windows', line: 'My rainbow drawing! We put these in the windows when I was five.',
    draw(c) {
      rect(c, K, 5, 9, 54, 46); rect(c, '#fffdf4', 6, 10, 52, 44);
      ['#e8473c', '#ff9a3c', '#ffd23f', '#5cc23a', '#3f8fe8', '#9b6cff'].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.arc(32, 46, 21 - i * 3, Math.PI, 0); c.stroke(); });
      disc(c, '#ffd23f', 50, 18, 4); rect(c, '#ffd86a', 24, 6, 16, 6);
      for (const [x, y] of [[12, 46], [50, 46]]) { disc(c, '#ffffff', x, y, 7, 4); disc(c, '#e4e8f0', x + 2, y + 1, 5, 3); }
    } },
  { age: 6, name: 'The Pop Pad and the Squish Pal', what: 'from the gift shop', line: "The gift shop! That's where I got the Pop Pad!",
    draw(c) {
      rect(c, K, 4, 8, 38, 38); rect(c, '#ff5fa2', 5, 9, 36, 36);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { disc(c, '#ffb2d4', 12 + i * 7.4, 16 + j * 7.4, 3); disc(c, '#ffffff', 11 + i * 7.4, 15 + j * 7.4, 1); }
      disc(c, K, 44, 44, 17, 14); disc(c, '#7be3a3', 44, 44, 16, 13);
      disc(c, K, 38, 41, 2); disc(c, K, 50, 41, 2); rect(c, K, 41, 48, 6, 2);
    } },
  { age: 7, name: 'The foam block pickaxe', what: 'from the kids market', line: "The toy stall at the kids market! That's where I got my foam block pickaxe when I was seven!",
    draw(c) {
      const p = 4;
      for (let i = 0; i < 9; i++) rect(c, '#8d5a33', 10 + i * p, 50 - i * p, p + 1, p + 1);
      [[3, 2], [4, 2], [5, 2], [6, 2], [7, 3], [8, 4], [9, 5], [10, 6], [10, 7], [10, 8]].forEach(([x, y]) => rect(c, '#3fd8c8', x * p + 4, y * p, p, p));
      [[5, 3], [6, 3], [7, 4], [8, 5], [9, 6], [9, 7]].forEach(([x, y]) => rect(c, '#9ff5ec', x * p + 4, y * p, p, p));
    } },
  { age: 8, name: 'The moving-day box and the Pocket Critter dino card', what: 'the year he moved to Saskatoon', line: "His treasure pile... wait, that's my MOVING-DAY BOX! With my Pocket Critter dino card! I held it the whole drive to Saskatoon.",
    draw(c) {
      rect(c, K, 5, 26, 44, 32); rect(c, '#c99a62', 6, 27, 42, 30); rect(c, '#a77a46', 6, 27, 42, 4); rect(c, '#f3e6a6', 22, 27, 10, 30);
      poly(c, '#d9ab74', [6, 27], [0, 19], [22, 19], [26, 27]); poly(c, '#d9ab74', [48, 27], [54, 19], [32, 19], [28, 27]);
      c.save(); c.translate(44, 22); c.rotate(0.22); rect(c, K, -12, -17, 25, 34); rect(c, '#ffd23f', -11, -16, 23, 32); rect(c, '#7ec8ff', -8, -13, 17, 15); disc(c, '#5cc23a', 0, -5, 6, 4); rect(c, '#5cc23a', 3, -11, 4, 7); rect(c, K, 5, -10, 1, 1); rect(c, '#e8473c', -8, 5, 17, 2); rect(c, '#ffffff', -8, 9, 12, 2); c.restore();
    } },
  { age: 9, name: 'The stomp rocket', what: 'from the space centre', line: 'My STOMP ROCKET! I got it here at the space centre when I was nine. One big stomp on the air pad and WHOOSH, way up!',
    draw(c) {
      rect(c, '#2b2f45', 2, 52, 60, 8); rect(c, '#e8473c', 4, 46, 22, 7); rect(c, '#ffd23f', 8, 44, 14, 3);
      rect(c, '#2f9a95', 24, 49, 20, 3); rect(c, '#c9c9cf', 42, 26, 3, 26);
      rect(c, '#ffffff', 40, 12, 7, 22); poly(c, '#e8473c', [40, 12], [47, 12], [43.5, 3]); poly(c, '#3f8fe8', [40, 28], [36, 36], [40, 34]); poly(c, '#3f8fe8', [47, 28], [51, 36], [47, 34]);
      rect(c, '#ffd23f', 12, 10, 2, 2); rect(c, '#ffd23f', 24, 20, 2, 2); rect(c, '#ffd23f', 56, 16, 2, 2);
    } },
  { age: 10, name: 'The Chicken Rider popcorn bucket and the Idol Hunter light stick', what: 'won at the arcade', line: 'The prize counter! My Chicken Rider popcorn bucket and my Idol Hunter light stick. I won them at this arcade when I was ten!',
    draw(c) {
      poly(c, K, [3, 26], [37, 26], [33, 60], [7, 60]); poly(c, '#fffdf4', [5, 27], [35, 27], [31, 59], [9, 59]);
      for (let i = 0; i < 3; i++) poly(c, '#e8473c', [8 + i * 10, 27], [13 + i * 10, 27], [13 + i * 9, 59], [10 + i * 9, 59]);
      for (let i = 0; i < 5; i++) disc(c, '#ffe9a8', 8 + i * 6, 23 - (i % 2) * 3, 5);
      disc(c, '#ffd23f', 20, 13, 7, 6); poly(c, '#e8473c', [17, 8], [20, 3], [23, 8]); poly(c, '#ff9a3c', [26, 13], [31, 15], [26, 17]); disc(c, K, 23, 12, 1.2);
      rect(c, K, 47, 40, 8, 22); rect(c, '#c9c9cf', 48, 41, 6, 20); disc(c, '#ff5fa2', 51, 22, 11, 19); disc(c, '#ffb2d4', 51, 22, 6, 14); disc(c, '#ffffff', 51, 18, 2.5, 7);
    } },
  { age: 11, name: 'The console Shad built', what: 'his handmade birthday present', line: 'Wait... this is the console Shad built me. It was in the box the whole time.',
    draw(c) {
      disc(c, 'rgba(126,232,255,.35)', 32, 32, 31);
      rect(c, K, 4, 16, 56, 34); rect(c, '#efeaf6', 5, 17, 54, 32); rect(c, K, 16, 20, 32, 22); rect(c, '#7ee8ff', 17, 21, 30, 20);
      disc(c, '#3a3a50', 10, 34, 4); disc(c, '#3a3a50', 54, 34, 4); disc(c, '#6b6f8a', 10, 33, 2); disc(c, '#6b6f8a', 54, 33, 2);
      rect(c, '#ffffff', 22, 30, 20, 7); c.fillStyle = '#c2414f'; c.font = "700 7px 'Pixelify Sans', monospace"; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('KINAN', 32, 34);
      disc(c, '#e8473c', 30, 25, 2.2); disc(c, '#e8473c', 34, 25, 2.2); poly(c, '#e8473c', [27.8, 25.5], [36.2, 25.5], [32, 30]);
      rect(c, '#c9c4b8', 10, 44, 44, 2);
    } },
];

const STYLE = `
#memoryGallery{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;background:linear-gradient(#232659,#3d2a6b 55%,#6a3a7a);color:#f4f1e8;font-family:'Nunito',system-ui,sans-serif}
#memoryGallery .mg-top{flex:none;display:flex;align-items:center;gap:14px;padding:max(10px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) 10px max(16px,env(safe-area-inset-left));background:rgba(11,13,32,.6);border-bottom:3px solid #f6c445}
#memoryGallery h2{margin:0;font:700 clamp(22px,4.4vw,34px)/1.1 'Pixelify Sans',monospace;color:#f6c445;text-shadow:0 2px 0 #1b1220}
#memoryGallery .mg-sub{margin:2px 0 0;font-size:clamp(13px,2.2vw,16px);color:#d8d4f0}
#memoryGallery .mg-close{margin-left:auto;flex:none;font:700 16px 'Pixelify Sans',monospace;color:#1b1220;background:#f6c445;border:3px solid #1b1220;border-radius:10px;padding:10px 16px;box-shadow:0 4px 0 #1b1220;cursor:pointer;touch-action:manipulation}
#memoryGallery .mg-room{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px max(16px,env(safe-area-inset-right)) calc(24px + env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,290px),1fr));gap:14px;align-content:start}
#memoryGallery .gift{display:grid;grid-template-columns:96px 1fr;gap:12px;align-items:start;background:rgba(255,255,255,.1);border:3px solid rgba(246,196,69,.75);border-radius:12px;padding:10px 12px}
#memoryGallery .gift canvas{width:96px;height:96px;image-rendering:pixelated;background:#fff6e0;border:3px solid #1b1220;border-radius:8px}
#memoryGallery .age{display:inline-block;font:800 15px 'Nunito',system-ui,sans-serif;color:#1b1220;background:#f6c445;border-radius:6px;padding:1px 8px}
#memoryGallery .gname{margin:5px 0 1px;font:700 clamp(15px,2.4vw,17px)/1.2 'Nunito',system-ui,sans-serif}
#memoryGallery .gwhat{margin:0;font-size:13px;color:#d8d4f0}
#memoryGallery .gline{grid-column:1 / -1;margin:0;font-size:15px;line-height:1.3;font-style:italic}
`;

export function openGallery(o = {}) {
  const old = document.getElementById('memoryGallery');
  if (old) old.remove();
  if (!document.getElementById('memoryGalleryStyle')) {
    const st = document.createElement('style'); st.id = 'memoryGalleryStyle'; st.textContent = STYLE;
    document.head.appendChild(st);
  }
  const el = document.createElement('div');
  el.id = 'memoryGallery'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Memory gallery');
  const top = document.createElement('div'); top.className = 'mg-top';
  const titles = document.createElement('div');
  const h = document.createElement('h2'); h.textContent = 'MEMORY GALLERY';
  const sub = document.createElement('p'); sub.className = 'mg-sub'; sub.textContent = 'Eleven birthdays, eleven gifts. Glitchy kept every one.';
  titles.append(h, sub);
  const close = document.createElement('button'); close.type = 'button'; close.className = 'mg-close'; close.textContent = o.closeLabel || 'BACK';
  top.append(titles, close);
  const room = document.createElement('div'); room.className = 'mg-room'; room.tabIndex = 0;
  for (const g of GIFTS) {
    const card = document.createElement('article'); card.className = 'gift'; card.dataset.age = String(g.age);
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
    g.draw(c);
    const info = document.createElement('div');
    const age = document.createElement('span'); age.className = 'age'; age.textContent = 'AGE ' + g.age;
    const name = document.createElement('p'); name.className = 'gname'; name.textContent = g.name;
    const what = document.createElement('p'); what.className = 'gwhat'; what.textContent = g.what;
    info.append(age, name, what);
    const line = document.createElement('p'); line.className = 'gline'; line.textContent = '"' + g.line + '"';
    card.append(cv, info, line);
    room.appendChild(card);
  }
  el.append(top, room);
  const done = () => {
    window.removeEventListener('keydown', onKey, true);
    el.remove();
    if (o.onClose) o.onClose();
  };
  const onKey = (e) => { if (e.code === 'Escape') { e.preventDefault(); e.stopPropagation(); done(); } };
  window.addEventListener('keydown', onKey, true);
  close.addEventListener('click', done);
  document.body.appendChild(el);
  close.focus({ preventScroll: true });
  return el;
}

// Boot: read the level id from <body data-level="12-1">, load levels/<id>.js, start the game.
// URL options: ?q=low|high (quality), ?debug=1 (fps readout), ?autostart=1 (skip the title card),
// ?level=12-N (load another level file), ?kinan=procedural (ignore kinan.glb, use the built-in Kinan),
// ?id=12-N|12-castle (the World 12 map stop this level belongs to: a clear is saved under it in the game's save).
import { Game } from './game.js';

// ---- back to the game (2026-10-27): a clear is saved in the Kinan vs. Worlds save the same way the game saves
// (the previous good record is copied to the backup key first), then ../index.html opens straight onto the 3D map.
const SAVE_KEY = 'kinan-remaster-v1', BACKUP_KEY = SAVE_KEY + '-backup';
const validRecord = (p) => !!p && typeof p === 'object' && !Array.isArray(p) && Number.isFinite(Number(p.unlocked)) && Array.isArray(p.beaten);
function readRecord(key) { try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return validRecord(v) ? v : null; } catch (e) { return null; } }
function writeRecord(key, v) { try { const raw = JSON.stringify(v); localStorage.setItem(key, raw); return localStorage.getItem(key) === raw; } catch (e) { return false; } }
export function saveCleared(stopId) {
  if (!/^12-(\d|fort|secret|castle)$/.test(String(stopId || ''))) return false;
  const current = readRecord(SAVE_KEY), backup = readRecord(BACKUP_KEY);
  const next = current ? JSON.parse(JSON.stringify(current)) : { unlocked: 1, beaten: [] };
  next.levelsBeaten = next.levelsBeaten && typeof next.levelsBeaten === 'object' && !Array.isArray(next.levelsBeaten) ? next.levelsBeaten : {};
  next.levelsBeaten[stopId] = 1;
  const previous = current || backup;
  if (previous && !writeRecord(BACKUP_KEY, previous)) return false;
  return writeRecord(SAVE_KEY, next);
}
export function backToMap() {
  let url = '../index.html';
  try {
    sessionStorage.setItem('kinan-return', 'map');
    const u = sessionStorage.getItem('kinan-return-url');   /* the game page this level was opened from (same site only) */
    if (u && !u.startsWith('//') && /^\/[^?#]*(index\.html)?(\?[\w=&.-]*)?$/.test(u)) url = u;
  } catch (e) { /* storage blocked: the title screen opens instead */ }
  location.href = url;
}

const params = new URLSearchParams(location.search);
const id = params.get('level') || document.body.dataset.level || '12-1';
const stopId = params.get('id') || (/^12-\d$/.test(id) ? id : null);

// The title card names the level being played, from the moment it loads (the page's markup is 12-1's card,
// KINAN'S 3D HOUSE; only 12-2 and 12-3 renamed it, later, in their build). Same wording as props-city.js
// titleCard(): the title, the card line (cardText, else the subtitle as a sentence) and the map stop
// (WORLD 12-2; the castle stop, which BIG BRICK's arena stands in for, says WORLD 12 · CASTLE).
function titleCard(level) {
  const card = document.getElementById('titlecard');
  if (!card || !level || !level.title) return;
  const h1 = card.querySelector('h1'), sub = card.querySelector('.sub'), world = card.querySelector('.world');
  const stop = stopId || level.id || id, label = /^12-\d$/.test(stop) ? stop : '12 · ' + String(stop).replace(/^12-/, '').toUpperCase();
  if (h1) h1.textContent = level.title;
  if (world) world.textContent = 'WORLD ' + label;
  if (sub) {
    const s = String(level.subtitle || '').trim();
    sub.textContent = level.cardText || (s ? s.charAt(0).toUpperCase() + s.slice(1) + (/[.!?]$/.test(s) ? '' : '!') : '');
  }
  document.title = 'Kinan vs. Worlds ' + label + ': ' + level.title;
}

function showError(msg) {
  const el = document.getElementById('loading');
  if (el) { el.style.display = ''; el.classList.remove('gone'); el.querySelector('p').textContent = 'Oops, the level did not load: ' + msg; }
  console.error(msg);
}

(async () => {
  try {
    if (document.fonts && document.fonts.load) {
      await Promise.race([Promise.all([document.fonts.load("700 32px 'Pixelify Sans'"), document.fonts.load("400 32px 'Pixelify Sans'")]), new Promise((r) => setTimeout(r, 2500))]);
    }
    const mod = await import(`../levels/${id}.js`);
    if (params.get('kinan') === 'procedural') mod.default.assets = Object.assign({}, mod.default.assets, { kinan: null });   // test the built-in Kinan
    titleCard(mod.default);
    const game = new Game(document.getElementById('game'), mod.default, {
      quality: params.get('q') || 'auto', debug: params.has('debug'), autostart: params.has('autostart'),
      onClear: () => { if (stopId) saveCleared(stopId); },
      onDone: backToMap,
    });
    window.GAME = game;
    // iOS Safari only allows sound to start inside a real touch/key handler, so unlock it right there.
    const unlock = () => { if (game.audio) game.audio.unlock(); };
    for (const ev of ['pointerdown', 'touchend', 'keydown']) window.addEventListener(ev, unlock, { capture: true, passive: true });
    await game.init();
    if (params.has('debug')) document.getElementById('fps').hidden = false;
    document.getElementById('btn-again')?.addEventListener('click', () => location.reload());
    document.getElementById('btn-map')?.addEventListener('click', backToMap);
    document.getElementById('btn-map-p')?.addEventListener('click', backToMap);
    document.getElementById('btn-resume')?.addEventListener('click', () => { game.mode = 'play'; game.hud.pause(false); });
    document.getElementById('btn-pause')?.addEventListener('click', () => { if (game.mode === 'play') { game.mode = 'paused'; game.hud.pause(true); } });
    document.getElementById('btn-yes')?.addEventListener('click', () => { if (game.mode === 'ask') game.answerHelp(true); });
    document.getElementById('btn-no')?.addEventListener('click', () => { if (game.mode === 'ask') game.answerHelp(false); });
  } catch (e) {
    showError(e && (e.stack || e.message) || String(e));
  }
})();

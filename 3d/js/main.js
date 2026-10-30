// Boot: read the level id from <body data-level="12-1">, load levels/<id>.js, start the game.
// URL options: ?q=low|high (quality), ?debug=1 (fps readout), ?autostart=1 (skip the title card),
// ?level=12-N (load another level file), ?kinan=procedural (ignore kinan.glb, use the built-in Kinan),
// ?id=12-N|12-castle (the World 12 map stop this level belongs to: a clear is saved under it in the game's save).
// ?devtools=1 (localhost only): opens any World 12 level; the live site opens only the four sneak-peek levels (see W12_PREVIEW below).
import { Game } from './game.js';

// ---- back to the game (2026-10-27): a clear is saved in the Kinan vs. Worlds save the same way the game saves
// (the previous good record is copied to the backup key first), then ../index.html opens straight onto the 3D map.
const SAVE_KEY = 'kinan-remaster-v1', BACKUP_KEY = SAVE_KEY + '-backup';
const validRecord = (p) => !!p && typeof p === 'object' && !Array.isArray(p) && Number.isFinite(Number(p.unlocked)) && Array.isArray(p.beaten);
function readRecord(key) { try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return validRecord(v) ? v : null; } catch (e) { return null; } }
function writeRecord(key, v) { try { const raw = JSON.stringify(v); localStorage.setItem(key, raw); return localStorage.getItem(key) === raw; } catch (e) { return false; } }
export function saveCleared(stopId, candles) {
  if (!/^12-(\d|fort|secret|castle)$/.test(String(stopId || ''))) return false;
  const current = readRecord(SAVE_KEY), backup = readRecord(BACKUP_KEY);
  const next = current ? JSON.parse(JSON.stringify(current)) : { unlocked: 1, beaten: [] };
  next.levelsBeaten = next.levelsBeaten && typeof next.levelsBeaten === 'object' && !Array.isArray(next.levelsBeaten) ? next.levelsBeaten : {};
  next.levelsBeaten[stopId] = 1;
  // the candles picked up in the level go to the Party Shop wallet, like a 2D level's clear (index.html owLevelBeaten): the sneak peek's
  // levels save "its clear and its candles" (2026-10-30). The golden candles of the 3D levels (their three stars) are not part of the save.
  const add = Math.max(0, Math.floor(Number(candles) || 0));
  if (add) {
    next.wallet = Math.max(0, Math.floor(Number(next.wallet) || 0)) + add;
    next.totalCandles = Math.max(0, Math.floor(Number(next.totalCandles) || 0)) + add;
  }
  const previous = current || backup;
  if (previous && !writeRecord(BACKUP_KEY, previous)) return false;
  return writeRecord(SAVE_KEY, next);
}
// a hidden painting in 12-7 opens the secret stop on the map: the id goes in the save's unlockedLevels (backup-first, like a clear)
export function saveUnlocked(stopId) {
  if (stopId !== '12-secret') return false;
  const current = readRecord(SAVE_KEY), backup = readRecord(BACKUP_KEY);
  const next = current ? JSON.parse(JSON.stringify(current)) : { unlocked: 1, beaten: [] };
  next.unlockedLevels = Array.isArray(next.unlockedLevels) ? next.unlockedLevels : [];
  if (next.unlockedLevels.indexOf(stopId) < 0) next.unlockedLevels.push(stopId);
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

// ---- the World 12 sneak peek (Shad, 2026-10-30): the live site opens exactly four World 12 levels. Every other World 12
// level (and the Bessborough festival, the finale and the rest) says "coming soon" here, even if its address is typed in.
// Keep this list the same as W12_PREVIEW in ../index.html (app/tests/e2e/w12-preview.spec.ts checks that they match).
// Developer mode opens everything: ?devtools=1 on localhost, the same rule as index.html's __k11DevOnly.
const W12_PREVIEW = ['12-4', '12-5', '12-fort', '12-6'];
const devOn = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) && params.get('devtools') === '1';
const levelOpen = devOn || (W12_PREVIEW.includes(id) && (!params.get('id') || W12_PREVIEW.includes(params.get('id'))));

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

// a World 12 level that is not in the sneak peek: a friendly "coming soon" instead of the level (the page never loads its file)
function showSoon() {
  const el = document.getElementById('loading');
  document.title = 'Kinan vs. Worlds: World 12 coming soon';
  if (!el) return;
  el.style.display = ''; el.classList.remove('gone'); el.style.pointerEvents = 'auto';
  el.querySelector('p').textContent = 'WORLD 12 · COMING SOON!\nThis part of 3D Saskatoon is still being built.\nFour levels are open as a sneak peek, and much more is coming!';
  const b = document.createElement('button');
  b.type = 'button'; b.id = 'btn-soon'; b.className = 'btn'; b.textContent = 'BACK TO THE MAP';
  b.addEventListener('click', backToMap);
  el.appendChild(b);
  try { b.focus(); } catch (e) { /* no focus: the button still works */ }
}

(async () => {
  if (!levelOpen) { showSoon(); return; }
  try {
    if (document.fonts && document.fonts.load) {
      await Promise.race([Promise.all([document.fonts.load("700 32px 'Pixelify Sans'"), document.fonts.load("400 32px 'Pixelify Sans'")]), new Promise((r) => setTimeout(r, 2500))]);
    }
    const mod = await import(`../levels/${id}.js`);
    if (params.get('kinan') === 'procedural') mod.default.assets = Object.assign({}, mod.default.assets, { kinan: null });   // test the built-in Kinan
    titleCard(mod.default);
    const game = new Game(document.getElementById('game'), mod.default, {
      quality: params.get('q') || 'auto', debug: params.has('debug'), autostart: params.has('autostart'),
      onClear: (levelId, candles) => { if (stopId) saveCleared(stopId, candles); },
      onUnlock: (secretId) => saveUnlocked(secretId),
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

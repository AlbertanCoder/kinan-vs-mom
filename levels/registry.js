/* ============================================================
   KINAN vs. WORLDS — LEVEL REGISTRY (M4b "levels as files")
   One file per level: levels/wNN/<file>.js calls
     KinanLevels.register({ id: '1-5', world: 1, slot: 5, name: 'THE FRONT YARD', ... })
   This file owns the DATA CONTRACT only — shape checks (problems)
   and the design-rule lint. index.html's buildLevel() turns a
   registered level into terrain and plays it.
   Runs in the page (classic <script>) and in Node tooling (a vm
   context with `self`), so it touches the DOM only in the loader.
   Read docs/LEVEL-AUTHORING.md before writing a level.
   ============================================================ */
(function (root) {
  'use strict';
  var ROWS = 15, T = 16, SCREEN = 27;
  var MIN_COLS = SCREEN, MAX_COLS = 1200;
  var ID_RE = /^([1-9]|1[01])-([1-8]|fort|secret|castle)$/;
  var TOY_KEYS = ['gift', 'brick', 'spring', 'shelf', 'board'];   /* board: a wooden taekwondo board, only a KICK breaks it (2026-10-28) */
  /* what a gift block can pop (index.html hitGift/giveItem); 'gold' marks the
     golden-candle block — its reward is not wired yet (ER-6), it pops nothing */
  var GIFT_PRIZES = ['candle', 'popper', 'cake', 'heart', 'hat', 'lasso', 'umbrella', 'gold'];
  /* B1 boss arenas (docs/LEVEL-AUTHORING.md §4.7): the bosses index.html knows (ARENA_KINDS) */
  var ARENA_BOSSES = ['mom', 'principal', 'neighbour', 'goalie',
    'moose', 'foreman', 'conductor', 'chenoa', 'barker', 'bronco',   /* B2: Worlds 3-5 */
    'magpies', 'robo-rex',   /* World 6: the magpie flock (6-fort), Robo-Rex (6-castle) */
    'banana-slug', 'drizzle',   /* World 7: the Giant Banana Slug (7-fort), Drizzle (7-castle) */
    'octopus', 'raccoon-king'];   /* World 8: the Big Octopus (8-fort), the Raccoon King (8-castle) */
  /* the six family pets (index.html PET_DEFS): cat1 Ginger, dog1 Chikastino, cat2 Vader, dog2 Hunter, cat3 Duchess, cat4 Tuxedo */
  var PET_IDS = ['cat1', 'dog1', 'cat2', 'dog2', 'cat3', 'cat4'];
  var GAP_CAP = [3, 4, 5];   /* Playbook §2: widest pit in act 1 / 2 / 3 (thirds of the level) */
  var FLAT_MAX = 8;          /* Contract §2.3: no flat run over 8 tiles without a toy or a foe */

  var levels = {}, order = [], problems = [];

  function isInt(v) { return typeof v === 'number' && isFinite(v) && Math.floor(v) === v; }
  function isCell(c) { return Array.isArray(c) && c.length >= 2 && isInt(c[0]) && isInt(c[1]); }
  function areasOf(def) { return Array.isArray(def.areas) ? def.areas : [def]; }
  function kindOf(id) {
    var m = ID_RE.exec(id || '');
    if (!m) return null;
    return /^[1-8]$/.test(m[2]) ? 'level' : m[2];
  }
  /* the file a level must live in: levels/w01/l05.js for 1-5, w01/fort.js for 1-fort */
  function fileFor(id) {
    var m = ID_RE.exec(id || '');
    if (!m) return null;
    var w = 'w' + (m[1].length === 1 ? '0' : '') + m[1];
    return w + '/' + (/^[1-8]$/.test(m[2]) ? 'l0' + m[2] : m[2]) + '.js';
  }

  /* ---- PROBLEMS: anything that would break the engine. A level with a
     problem is refused (never registered) and reported on console.error. */
  function problemsOf(def) {
    var out = [];
    if (!def || typeof def !== 'object') return ['the level must be an object'];
    var m = ID_RE.exec(def.id || '');
    if (!m) out.push('id "' + def.id + '" must look like 1-5, 1-fort, 1-secret or 1-castle (worlds 1-11)');
    else if (def.world !== Number(m[1])) out.push('world must be ' + m[1] + ' to match id ' + def.id);
    if (m && def.kind != null && def.kind !== kindOf(def.id)) out.push('kind must be "' + kindOf(def.id) + '" for id ' + def.id);
    if (!isInt(def.slot) || def.slot < 1 || def.slot > 11) out.push('slot (its stop on the world map trail) must be 1-11');
    if (typeof def.name !== 'string' || !def.name.trim() || def.name.length > 40) out.push('name must be 1-40 characters');
    if (def.theme != null && (!isInt(def.theme) || def.theme < 0)) out.push('theme must be a stage index (0, 1, 2, ...)');
    var list = areasOf(def);
    if (!list.length) out.push('areas must hold at least one area');
    var goals = 0, spawns = def.spawn ? 1 : 0, arenas = 0, pets = 0, arenaEnd = -1, goalAt = -1, base = 0;
    list.forEach(function (a, k) {
      if (a && isInt(a.cols)) { if (a.goal && isInt(a.goal.col)) goalAt = base + a.goal.col; }
      var tag = list.length > 1 ? 'area ' + (a && a.id || k) + ': ' : '';
      if (!a || typeof a !== 'object') { out.push(tag + 'must be an object'); return; }
      if (list.length > 1 && (typeof a.id !== 'string' || typeof a.name !== 'string')) out.push(tag + 'each area of a multi-area level needs an id and a name');
      if (!isInt(a.cols) || a.cols < MIN_COLS || a.cols > MAX_COLS) { out.push(tag + 'cols must be a whole number ' + MIN_COLS + '-' + MAX_COLS); return; }
      var H = a.heights;
      if (!Array.isArray(H) || H.length !== a.cols) { out.push(tag + 'heights must list exactly cols (' + a.cols + ') values'); return; }
      var prev = null, prevD = 0;
      for (var c = 0; c < H.length; c++) {
        var h = H[c];
        if (h === null) { prev = null; prevD = 0; continue; }
        if (!isInt(h) || h < 32 || h > 224 || h % 8) { out.push(tag + 'heights[' + c + '] = ' + h + ': use null (pit) or a multiple of 8 from 32 to 224'); continue; }
        var d = prev == null ? 0 : h - prev;
        if (d !== 0 && Math.abs(d) !== 8 && Math.abs(d) !== 16) out.push(tag + 'heights[' + c + ']: a step of ' + d + ' px — slopes step 8 (2:1) or 16 (1:1); build walls with solid blocks');
        if (d === 0 && h % 16) out.push(tag + 'heights[' + c + ']: a flat run must sit on a tile line (a multiple of 16)');
        if (Math.abs(d) === 16 && h % 16) out.push(tag + 'heights[' + c + ']: a 1:1 slope runs between tile lines (multiples of 16)');
        if (d && prevD && (d > 0) !== (prevD > 0)) out.push(tag + 'heights[' + c + ']: slopes must meet a flat between up and down (no zigzag, Contract §2.2)');
        prevD = d; prev = h;
      }
      var inside = function (cell) { return isCell(cell) && cell[0] >= 0 && cell[0] < a.cols && cell[1] >= 0 && cell[1] < ROWS; };
      var tiles = a.tiles || {};
      Object.keys(tiles).forEach(function (key) {
        if (TOY_KEYS.indexOf(key) < 0) { out.push(tag + 'tiles.' + key + ' is not a tile kind (gift, brick, spring, shelf, board)'); return; }
        (tiles[key] || []).forEach(function (cell) { if (!inside(cell)) out.push(tag + 'tiles.' + key + ' cell ' + JSON.stringify(cell) + ' is outside the area'); });
      });
      (tiles.gift || []).forEach(function (cell) {
        if (cell && cell.length > 2 && GIFT_PRIZES.indexOf(cell[2]) < 0) out.push(tag + 'gift prize "' + cell[2] + '" — use one of ' + GIFT_PRIZES.join(', '));
      });
      ['candles', 'foes', 'pipes'].forEach(function (key) {
        (a[key] || []).forEach(function (cell) { if (!inside(cell)) out.push(tag + key + ' cell ' + JSON.stringify(cell) + ' is outside the area'); });
      });
      (a.foes || []).forEach(function (f) { if (f && f.length > 2 && typeof f[2] !== 'string') out.push(tag + 'foe type must be a name like "sock"'); });
      (a.solid || []).forEach(function (r) {
        if (!Array.isArray(r) || r.length !== 4 || !r.every(isInt) || r[0] > r[2] || r[1] > r[3] || !inside([r[0], r[1]]) || !inside([r[2], r[3]])) out.push(tag + 'solid ' + JSON.stringify(r) + ' must be [col0, row0, col1, row1] inside the area');
      });
      if (a.deck != null && !(Array.isArray(a.deck) && a.deck.length === 2 && a.deck.every(isInt) && a.deck[0] <= a.deck[1])) out.push(tag + 'deck must be [firstCol, lastCol]');
      if (a.fakeWall != null && !(Array.isArray(a.fakeWall) && a.fakeWall.length === 2 && a.fakeWall.every(isInt))) out.push(tag + 'fakeWall must be [firstCol, lastCol]');
      (a.secrets || []).forEach(function (s) {
        if (!s || ['visible', 'hidden', 'skill'].indexOf(s.kind) < 0 || !inside([s.col, s.row]) || typeof s.prize !== 'string') out.push(tag + 'secret ' + JSON.stringify(s) + ' needs kind (visible|hidden|skill), col, row and prize');
      });
      ['goldenCandle', 'checkpoint', 'goal', 'spawn'].forEach(function (key) {
        var p = a[key];
        if (p == null) return;
        if (!inside([p.col, p.row])) out.push(tag + key + ' must be { col, row } inside the area');
      });
      if (a.pet != null) {   /* QA fix: a pet crate (LEVEL-AUTHORING §4.4) */
        pets++;
        if (!a.pet || typeof a.pet !== 'object' || PET_IDS.indexOf(a.pet.id) < 0 || !inside([a.pet.col, a.pet.row])) out.push(tag + 'pet must be { id: ' + PET_IDS.join(' | ') + ', col, row } inside the area');
      }
      (a.talk || []).forEach(function (t) {   /* World 6: a story line as Kinan passes a column (LEVEL-AUTHORING §4.4) */
        if (!Array.isArray(t) || !isInt(t[0]) || t[0] < 0 || t[0] >= a.cols || typeof t[1] !== 'string' || !t[1] || typeof t[2] !== 'string' || !t[2] || t[2].length > 140 || (t[3] != null && !(typeof t[3] === 'number' && t[3] > 0 && t[3] <= 8))) {
          out.push(tag + 'talk ' + JSON.stringify(t) + " must be [col, 'WHO', 'what they say' (up to 140 letters), seconds?] inside the area");
        }
      });
      if (a.goal) goals++;
      if (a !== def && a.spawn) spawns++;
      if (a.arena != null) { arenas++; arenaProblems(a, tag, H, inside, out, function (end) { arenaEnd = base + end; }); }
      base += a.cols;
    });
    if (goals !== 1) out.push('exactly one goal is required (found ' + goals + ') — the level ends there and returns to the map');
    if (spawns > 1) out.push('only one spawn (on the level or its first area)');
    if (arenas > 1) out.push('only one boss arena per level (found ' + arenas + ')');
    if (pets > 1) out.push('only one pet crate per level (found ' + pets + ')');
    if (arenaEnd >= 0 && goalAt >= 0 && goalAt <= arenaEnd) out.push("the goal must stand past the arena's right gate (the boss door)");
    return out;
  }
  /* B1: a boss arena is flat open ground between two gate columns (col - 1 and col + cols), wide enough to
     dodge in, with room before it for its checkpoint (docs/LEVEL-AUTHORING.md §4.7) */
  function arenaProblems(a, tag, H, inside, out, setEnd) {
    var A = a.arena;
    if (!A || typeof A !== 'object' || !isInt(A.col) || !isInt(A.cols)) { out.push(tag + 'arena must be { col, cols, boss } (docs/LEVEL-AUTHORING.md §4.7)'); return; }
    if (A.cols < 12 || A.cols > 60) out.push(tag + 'arena.cols must be 12-60 (24 fits one screen with its gates)');
    if (A.col < 4 || A.col + A.cols + 1 > a.cols - 1) { out.push(tag + 'arena needs room for its gates and checkpoint: col >= 4 and col + cols + 1 < the area\'s cols'); return; }
    setEnd(A.col + A.cols);
    var fh = H[A.col];
    for (var c = A.col - 1; c <= A.col + A.cols; c++) if (fh == null || H[c] !== fh) { out.push(tag + 'arena floor must be flat ground from its left gate (col - 1) to its right gate (col + cols)'); break; }
    if (ARENA_BOSSES.indexOf(A.boss) < 0) out.push(tag + 'arena.boss "' + A.boss + '" — use one of ' + ARENA_BOSSES.join(', '));
    if (A.phases != null && !((isInt(A.phases) && A.phases >= 1 && A.phases <= 3) || (Array.isArray(A.phases) && A.phases.length >= 1 && A.phases.length <= 3))) out.push(tag + 'arena.phases must be 1-3, or a list of 1-3 phase objects');
    if (A.checkpoint != null) {
      if (!inside([A.checkpoint.col, A.checkpoint.row])) out.push(tag + 'arena.checkpoint must be { col, row } inside the area');
      else if (A.checkpoint.col >= A.col - 1) out.push(tag + "arena.checkpoint must stand before the arena's left gate");
    } else if (H[A.col - 4] == null) out.push(tag + "the arena's checkpoint (col - 4, three tiles before the gate) is over a pit: give arena.checkpoint { col, row }");
    var gateRows = fh == null ? 0 : fh / T, inArena = function (c, r) { return c >= A.col - 1 && c <= A.col + A.cols && r < gateRows; };
    (a.solid || []).forEach(function (r) {
      if (!Array.isArray(r)) return;
      for (var c = r[0]; c <= r[2]; c++) if (inArena(c, r[1])) { out.push(tag + 'arena must be open ground: solid ' + JSON.stringify(r) + ' stands inside it (desks are shelves)'); return; }
    });
    ['gift', 'brick', 'spring', 'board'].forEach(function (key) {
      ((a.tiles || {})[key] || []).forEach(function (cell) { if (isCell(cell) && inArena(cell[0], cell[1])) out.push(tag + 'arena must be open ground: tiles.' + key + ' ' + JSON.stringify(cell) + ' stands inside it'); });
    });
  }

  /* ---- LINT: the design rules (docs/LEVEL-AUTHORING.md §5). A level with a
     lint warning still plays (so you can test it), but the gate refuses it. */
  function lint(def) {
    var out = [];
    if (problemsOf(def).length) return ['fix the problems first'];
    var list = areasOf(def), base = 0, cols = 0, pits = [], flats = [], actCols = 0;
    var toys = {}, breaks = {};   /* by world column: a toy or foe stands here / the flat is broken here */
    list.forEach(function (a) { cols += a.cols; });
    actCols = cols;
    list.forEach(function (a) {
      var toy = function (cell) { toys[base + cell[0]] = breaks[base + cell[0]] = 1; };
      /* B1: a boss arena is the level's finale: the boss is its toy, and the acts (gap caps) are the thirds
         of the platforming before its left gate */
      if (a.arena) { for (var ac = a.arena.col - 1; ac <= a.arena.col + a.arena.cols; ac++) toy([ac, 0]); actCols = Math.min(actCols, base + a.arena.col - 1); }
      TOY_KEYS.forEach(function (key) { ((a.tiles || {})[key] || []).forEach(toy); });
      (a.foes || []).forEach(toy); (a.pipes || []).forEach(toy);
      (a.secrets || []).forEach(function (s) { toy([s.col, s.row]); });
      (a.candles || []).forEach(function (cell) { breaks[base + cell[0]] = 1; });   /* a candle run keeps a flat alive (WORLD1-LEVEL-DESIGN §2.1) but is not a screen's toy */
      (a.solid || []).forEach(function (r) { for (var c = r[0]; c <= r[2]; c++) breaks[base + c] = 1; });   /* a wall or step is a height change */
      if (a.deck) for (var c = a.deck[0]; c <= a.deck[1]; c++) breaks[base + c] = 1;
      var H = a.heights, x = 0;
      while (x < H.length) {
        var x0 = x;
        if (H[x] === null) { while (x < H.length && H[x] === null) x++; pits.push([base + x0, base + x - 1]); continue; }
        while (x < H.length && H[x] === H[x0]) x++;
        if (x - x0 > FLAT_MAX) flats.push([base + x0, base + x - 1]);
      }
      base += a.cols;
    });
    pits.forEach(function (p) {
      var wide = p[1] - p[0] + 1, act = Math.min(2, Math.floor(p[0] / (actCols / 3))), cap = GAP_CAP[act];
      if (wide > cap) out.push('pit at cols ' + p[0] + '-' + p[1] + ' is ' + wide + ' wide; act ' + (act + 1) + ' allows ' + cap + ' (Playbook §2)');
    });
    flats.forEach(function (f) {
      var ok = false; for (var c = f[0]; c <= f[1]; c++) if (breaks[c]) { ok = true; break; }
      if (!ok) out.push('flat run at cols ' + f[0] + '-' + f[1] + ' is ' + (f[1] - f[0] + 1) + ' tiles with no toy or foe (max ' + FLAT_MAX + ', Contract §2.3)');
    });
    for (var s = 0; s * SCREEN < cols; s++) {
      var any = false; for (var c = s * SCREEN; c < Math.min(cols, (s + 1) * SCREEN); c++) if (toys[c]) { any = true; break; }
      if (!any) out.push('screen ' + (s + 1) + ' (cols ' + s * SCREEN + '-' + (Math.min(cols, (s + 1) * SCREEN) - 1) + ') has no toy (Contract §2.4: bounce, break or discover)');
    }
    if (kindOf(def.id) === 'level' && !def.noSecrets) {
      var secrets = [], golden = 0;
      list.forEach(function (a) { secrets = secrets.concat(a.secrets || []); if (a.goldenCandle) golden++; });
      if (secrets.length !== 3) out.push('a regular level hides exactly 3 secrets (found ' + secrets.length + ') — or set noSecrets: "<why>"');
      if (golden !== 1) out.push('a regular level hides 1 golden candle (found ' + golden + ') — or set noSecrets: "<why>"');
    }
    return out;
  }

  function say(msg) { if (root.console && root.console.error) root.console.error('[levels] ' + msg); }

  function register(def) {
    var id = def && def.id, p = problemsOf(def);
    if (!p.length && levels[id]) p = ['registered twice (one file per level — see docs/LEVEL-AUTHORING.md §6)'];
    if (p.length) { p.forEach(function (m) { problems.push(id + ': ' + m); say(id + ': ' + m); }); return false; }
    levels[id] = def; order.push(id);
    return true;
  }

  var api = {
    ROWS: ROWS, T: T, SCREEN: SCREEN,
    register: register,
    get: function (id) { return levels[id] || null; },
    list: function () { return order.slice(); },
    problems: function () { return problems.slice(); },
    validate: problemsOf,
    lint: lint,
    kindOf: kindOf,
    fileFor: fileFor,
    ready: false,
    whenReady: function (cb) { if (api.ready) cb(); else waiters.push(cb); }
  };
  var waiters = [];
  function done() {
    api.ready = true;
    var w = waiters.splice(0, waiters.length);
    for (var i = 0; i < w.length; i++) { try { w[i](); } catch (e) { say('whenReady: ' + e); } }
  }
  root.KinanLevels = api;

  /* ---- LOADER (page only): every file in levels/manifest.js, in order.
     async=false keeps the order; the game reads levels only after ready. */
  var files = root.KINAN_LEVEL_FILES || [];
  var doc = root.document;
  if (!doc || !doc.createElement) { done(); return; }
  if (!files.length) { done(); return; }
  var left = files.length;
  var finish = function () { if (--left === 0) done(); };
  files.forEach(function (f) {
    var s = doc.createElement('script');
    s.async = false;
    s.src = 'levels/' + f;
    s.onload = finish;
    s.onerror = function () { problems.push(f + ': failed to load'); say(f + ': failed to load'); finish(); };
    (doc.head || doc.documentElement).appendChild(s);
  });
})(typeof self !== 'undefined' ? self : this);

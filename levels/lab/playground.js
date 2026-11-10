/* ============================================================
   SEASON 2 PLAYGROUND (2026-11-10, docs/SEASON-2-PLAN.md step 1)
   A test level that is never on the map: open it with ?lab=playground
   (https://albertancoder.github.io/kinan-vs-mom/?lab=playground).
   It saves nothing (no candles banked, nothing marked beaten).
   It shows the first Season 2 piece: a TALL level. `up: 30` adds 30 rows
   above the usual screen, so this level is three screens tall (rows -30
   to 14) and the camera follows Kinan up and down.
     1. THE TOWER: zig-zag shelves up to the roof (row -21)
     2. THE ROOFTOP: candles, gift blocks and a sock on the roof
     3. THE DROP: jump off the end and fall three screens, candles on the way
     4. THE SPRINGS: three springs on blocks up to the SKY LEDGE
   Each new piece (ladders, pipes, secret rooms, then wall jumps ...) gets
   a corner here first, so Shad can try it on his phone.
   ============================================================ */
(function () {
  var cols = 108, heights = [], shelf = [], candles = [];
  for (var c = 0; c < cols; c++) heights.push(192);
  /* 1. THE TOWER: 4-wide shelves three rows apart, left (cols 5-8) and right (cols 10-13), one column between */
  var steps = [[9, 5], [6, 10], [3, 5], [0, 10], [-3, 5], [-6, 10], [-9, 5], [-12, 10], [-15, 5], [-18, 10]];
  steps.forEach(function (s) {
    for (var k = 0; k < 4; k++) shelf.push([s[1] + k, s[0]]);
    candles.push([s[1] + 1, s[0] - 1], [s[1] + 2, s[0] - 1]);
  });
  for (var k2 = 0; k2 < 3; k2++) shelf.push([15 + k2, -21]);   /* the last step, beside the roof */
  /* 2. THE ROOFTOP: an arc of candles */
  for (var x = 22; x <= 58; x += 3) candles.push([x, -23 - (x % 6 === 1 ? 1 : 0)]);
  /* 3. THE DROP: candles down the fall line */
  for (var y = -16; y <= 6; y += 5) candles.push([66, y]);
  /* 4. THE SKY LEDGE */
  for (var x2 = 92; x2 <= 96; x2++) candles.push([x2, -10]);
  /* ---- AREA 2: THE MOVES (Season 2, 2026-11-10): one stop for each new piece ---- */
  var c2 = 150, h2 = [], m = [];
  for (var i = 0; i < c2; i++) h2.push(192);
  var cand = function (c, r, n) { for (var k = 0; k < (n || 1); k++) m.push([c + k, r]); };
  cand(10, 2, 5);        /* 1. the ladder's platform */
  cand(23, 6, 3); cand(27, 1, 3);   /* 2. the ledges */
  cand(36, -8, 6);       /* 3. the vine's platform */
  for (var r2 = 6; r2 >= -10; r2 -= 4) cand(48, r2, 2);   /* 4. up the wall-jump shaft */
  cand(54, -14, 5);   /* on the platform at the top */
  cand(68, 10, 8); cand(66, 7, 2); cand(76, 7, 2);   /* 5. the pool's floor and middle */
  cand(89, -22, 10);     /* 6. the secret room */
  cand(118, -12, 6);     /* 7. the rooftop */
  KinanLevels.register({
    id: 'lab-playground', world: 0, name: 'SEASON 2 PLAYGROUND',
    theme: 5,
    up: 30,
    moves: true,         /* the wall jump and the ledge grab */
    spawn: { col: 2, row: 11 },
    areas: [
      {
        id: 'tall', name: 'THE TALL PART', cols: cols, heights: heights,
        solid: [
          [19, -20, 62, -19],    /* the roof */
          [80, 5, 83, 5],        /* spring block 1 (a spring lifts Kinan about 9 rows; each block is 7 rows above the last) */
          [86, -2, 89, -2],      /* spring block 2 */
          [91, -9, 97, -9]       /* the SKY LEDGE */
        ],
        tiles: {
          shelf: shelf,
          spring: [[76, 12], [82, 5], [88, -2]],
          gift: [[30, -25, 'candle'], [42, -25, 'heart'], [94, -13, 'hat']]
        },
        candles: candles,
        foes: [[36, -21, 'sock'], [50, -21, 'sock'], [40, 11, 'sock']],
        checkpoint: { col: 72, row: 11 }
      },
      {
        id: 'moves', name: 'THE NEW MOVES', cols: c2, heights: h2,
        solid: [
          [22, 7, 26, 11],       /* 2. a ledge 5 rows up: too high to jump onto, so he grabs it */
          [27, 2, 31, 11],       /*    and a second one 5 rows above that */
          [47, -12, 47, 9],      /* 4. the wall-jump shaft: its left wall (walk in under it, a 2-row gap); 3 tiles wide */
          [51, -12, 51, 11],     /*    its right wall */
          [52, -12, 60, -12],    /*    the platform at the top (level with the wall's top) */
          [61, 4, 61, 11],       /* 5. the pool's left wall */
          [81, 4, 81, 11],       /*    its right wall */
          [86, -28, 104, -28],   /* 6. the secret room: its ceiling */
          [86, -20, 104, -20],   /*    its floor */
          [86, -27, 86, -21], [104, -27, 104, -21],   /* its walls */
          [114, -11, 126, -11]   /* 7. the rooftop the door leads to */
        ],
        tiles: {
          shelf: [[8, 3], [9, 3], [10, 3], [11, 3], [12, 3], [13, 3], [14, 3],   /* 1. the ladder's platform (it climbs up through it) */
                  [34, -7], [35, -7], [36, -7], [37, -7], [38, -7], [39, -7], [40, -7], [41, -7],   /* 3. the vine's platform */
                  [57, 4], [58, 4], [59, 4], [60, 4]],   /* 5. the dock by the pool */
          gift: [[12, -1, 'heart'], [38, -11, 'hat'], [72, 7, 'candle'], [95, -24, 'heart'], [120, -15, 'candle']]
        },
        ladders: [[9, 2, 11], [58, 3, 11]],   /* 1. up to the platform · 5. up to the dock */
        vines: [[35, -8, 11]],                /* 3. up to the vine's platform */
        water: [[62, 4, 80, 11]],             /* 5. the pool: swim down for the candles, a stroke at the top jumps out */
        warps: [
          { kind: 'pipe', col: 88, row: 10, to: { col: 92, row: -20 } },     /* 6. a steel pipe up to the secret room */
          { kind: 'pipe', col: 100, row: -22, to: { col: 108, row: 12 } },  /*    and one back down */
          { kind: 'door', col: 112, row: 12, to: { col: 116, row: -11 } },  /* 7. a door up to the rooftop */
          { kind: 'chute', col: 124, row: -11, to: { col: 130, row: 12 } }  /*    a chute in the roof back down */
        ],
        candles: m,
        foes: [[96, 11, 'sock'], [138, 11, 'sock']],
        checkpoint: { col: 84, row: 11 },
        goal: { col: 144, row: 11 }
      }
    ]
  });
})();

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
  KinanLevels.register({
    id: 'lab-playground', world: 0, name: 'SEASON 2 PLAYGROUND',
    theme: 5,
    up: 30,
    cols: cols,
    heights: heights,
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
    checkpoint: { col: 72, row: 11 },
    spawn: { col: 2, row: 11 },
    goal: { col: 104, row: 11 }
  });
})();

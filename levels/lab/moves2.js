/* SEASON 2 WORLD MOVES TEST (2026-11-10): every new move of Worlds 12-15 in one test level, ?lab=moves2.
   Never on the map; it saves nothing. Area 1: crawl, ropes, monkey bars, grappling hook, dash kick, glide, skateboard.
   Area 2: the flashlight in the dark, the monkey's basket fight. Area 3: the avalanche. Area 4: the monsoon flood + frog. */
(function () {
  var flat = function (n) { var h = []; for (var i = 0; i < n; i++) h.push(192); return h; };
  var pit = function (h, a, b) { for (var c = a; c <= b; c++) h[c] = null; return h; };
  var h1 = flat(200); pit(h1, 30, 40); pit(h1, 50, 60); pit(h1, 70, 80); pit(h1, 90, 96); pit(h1, 116, 134);
  var h2 = flat(120), h3 = flat(140), h4 = flat(60);
  KinanLevels.register({
    id: 'lab-moves2', world: 0, name: 'WORLD MOVES TEST', theme: 5, up: 45, moves: true, crawl: true, dash: true, glide: true, treat: 'ladoo',
    spawn: { col: 2, row: 11 },
    areas: [
      { id: 'moves', name: 'THE NEW MOVES', cols: 200, heights: h1,
        solid: [[10, 8, 20, 10], [100, 6, 101, 11], [110, 4, 115, 11]],
        tiles: { board: [[100, 8], [100, 9], [100, 10], [100, 11], [101, 8], [101, 9], [101, 10], [101, 11]] },
        ropes: [[33, 3, 6], [38, 3, 6]], bars: [[49, 61, 8]], rings: [[73, 6], [78, 6]],
        ladders: [[109, 4, 11]], updrafts: [[124, -6, 127, 11]], skate: [[140, 190]],
        candles: [[12, 11], [14, 11], [16, 11], [35, 6], [55, 10], [75, 8], [93, 9], [120, 6], [125, 2], [150, 10], [160, 10]],
        foes: [[24, 11, 'raccoon']] },
      { id: 'dark', name: 'THE DARK STEPWELL', cols: 120, heights: h2, dark: 'torch',
        s2checkpoints: [[2, 12]],
        solid: [[0, 0, 119, 1], [20, 8, 40, 10], [60, 9, 64, 11], [64, 9, 70, 10]],
        candles: [[25, 11], [30, 11], [35, 11]],
        s2boss: { kind: 'popper', look: 'monkey', col0: 80, col1: 112, rowTop: 4, holes: [[90, 11], [96, 11], [102, 11]] } },
      { id: 'chase', name: 'THE AVALANCHE', cols: 140, heights: h3,
        s2checkpoints: [[2, 12]],
        solid: [[40, 10, 44, 11], [80, 9, 84, 11]],
        s2boss: { kind: 'chase', look: 'snow', startCol: 8, col1: 130 } },
      { id: 'flood', name: 'THE FLOOD', cols: 60, heights: h4,
        s2checkpoints: [[3, 12]],
        solid: [[10, -43, 10, 8], [41, -44, 41, 11], [10, -44, 41, -44]],
        tiles: { shelf: [[12, 6], [13, 6], [14, 6], [15, 6], [16, 6], [17, 6], [18, 6], [19, 6], [20, 6], [21, 6], [11, -10], [12, -10], [13, -10], [14, -10], [15, -10], [16, -10], [17, -10], [18, -10], [19, -10], [20, -10], [21, -10], [22, -10], [23, -10], [24, -10], [25, -10], [26, -10], [27, -10], [28, -10], [29, -10], [30, -10], [31, -10], [32, -10], [33, -10], [34, -10], [35, -10], [36, -10], [37, -10], [38, -10], [39, -10], [40, -10]] },
        ladders: [[13, 6, 11], [22, -10, 5]],
        s2boss: { kind: 'rise', look: 'flood', summit: 'frog', col0: 11, col1: 40, startCol: 13, stopRow: -8, summitRow: -10, crab: [12, 36], gateCol: 37 },
        goal: { col: 39, row: -11 } }
    ]
  });
})();

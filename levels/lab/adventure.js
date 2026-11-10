/* ============================================================
   SEASON 2 ADVENTURE: MOUNTAINS TO THE SEA (2026-11-10, docs/SEASON-2-PLAN.md "The adventure test level")
   A test level that is never on the map: ?lab=adventure
   (https://albertancoder.github.io/kinan-vs-mom/?lab=adventure). It saves nothing; at the end a card shows the time,
   each act's time and lost tries, hearts lost, falls and secrets, to screenshot and send back.
   About 6-8 minutes, medium-hard but fair, four acts with a checkpoint at each:
     1 THE CLIFFS     a vine up a tree, jumps over pits, a ledge to grab, a wall-jump chimney up the cliff, a spring to a
                      hidden gift up high (secret 1), then a long drop
     2 THE OLD MINE   dark (his hard-hat lamp lights the way), a ladder to the upper track, a steel pipe to a hidden room
                      (secret 2), a chute down, a ledge, then MR. MOLE in a three-level arena (boss 1)
     3 THE WATERFALL  swim UP the waterfall, cliff top, dive into the ocean: fish, a reef, the golden candle under a rock,
       AND THE SEA    a gift on the sea floor (secret 3), swim out onto the shore
     4 THE SEA CAVE   the GLITCH TIDE rises behind him: a ladder, a vine, a wall-jump chimney, a ladder, a ledge, a spring,
                      up to the summit and KING CRAB (boss 2); calm him and the way to the goal opens
   Rows: -45 (top) .. 14; the usual ground is row 12 (Kinan stands in row 11).
   ============================================================ */
(function () {
  var flat = function (n) { var h = []; for (var i = 0; i < n; i++) h.push(192); return h; };
  var run = function (out, c, r, n, step) { for (var k = 0; k < n; k++) out.push([c + k * (step || 1), r]); return out; };
  var col = function (out, c, r0, r1, step) { for (var r = r0; r <= r1; r += (step || 1)) out.push([c, r]); return out; };
  var shelfRow = function (out, c0, c1, r) { for (var c = c0; c <= c1; c++) out.push([c, r]); return out; };

  /* ---- ACT 1: THE CLIFFS (130 cols) ---- */
  var h1 = flat(130);
  [44, 45, 46, 52, 53, 54].forEach(function (c) { h1[c] = null; });
  var s1 = [], c1 = [];
  shelfRow(s1, 28, 38, -5);                          /* the treehouse */
  shelfRow(s1, 41, 43, -2); shelfRow(s1, 47, 49, 2); shelfRow(s1, 55, 57, 6);   /* stepping down */
  shelfRow(s1, 86, 94, -22);                         /* the hidden ledge up high (a spring lifts him 9 rows) */
  run(c1, 8, 10, 4, 2); run(c1, 31, -7, 6); run(c1, 42, -4, 2); run(c1, 48, 0, 2); run(c1, 52, 8, 3);
  run(c1, 63, 5, 5); col(c1, 72, -12, 2, 5); col(c1, 73, -10, 4, 5); run(c1, 78, -16, 8, 3); run(c1, 88, -24, 5);
  col(c1, 107, -10, 8, 3); run(c1, 112, 10, 6, 2);

  /* ---- ACT 2: THE OLD MINE (140 cols, dark) ---- */
  var h2 = flat(140), s2 = [], c2 = [];
  shelfRow(s2, 21, 23, 6);                           /* where the ladder comes up through the upper track */
  shelfRow(s2, 88, 94, 8); shelfRow(s2, 104, 110, 8); shelfRow(s2, 95, 103, 4);   /* the mole's arena: three levels */
  run(c2, 6, 9, 4, 2); run(c2, 26, 4, 10, 3); run(c2, 30, 10, 8, 3); run(c2, 38, -4, 8); run(c2, 73, 5, 5); run(c2, 116, 10, 6, 2);

  /* ---- ACT 3: THE WATERFALL AND THE SEA (150 cols) ---- */
  var h3 = flat(150), c3 = [];
  col(c3, 25, -12, 8, 4); col(c3, 26, -10, 6, 4); run(c3, 32, -18, 10, 3); col(c3, 74, -12, -6, 3);
  run(c3, 80, 2, 5, 2); run(c3, 98, -1, 4, 2); run(c3, 120, 4, 6, 2); run(c3, 132, -1, 4, 2); run(c3, 143, -5, 4, 2);

  /* ---- ACT 4: THE SEA CAVE (60 cols, the tall one) ---- */
  var h4 = flat(60), s4 = [], c4 = [];
  shelfRow(s4, 11, 21, 6);                           /* L1, the ladder comes up through it */
  shelfRow(s4, 25, 38, 0);                           /* L2, beside the vine */
  shelfRow(s4, 28, 39, -21);                         /* L5, the ladder comes up through it */
  shelfRow(s4, 11, 40, -34);                         /* the summit (one-way: a fall into the tide pops him back up through it) */
  run(c4, 14, 4, 5, 2); col(c4, 29, -12, -4, 4); col(c4, 30, -10, -2, 4); run(c4, 33, -16, 4, 2); run(c4, 30, -23, 4, 2); run(c4, 19, -28, 4, 2);

  KinanLevels.register({
    id: 'lab-adventure', world: 0, name: 'MOUNTAINS TO THE SEA',
    theme: 5,
    up: 45,
    moves: true,
    spawn: { col: 2, row: 11 },
    areas: [
      {
        id: 'cliffs', name: 'ACT 1: THE CLIFFS', cols: 130, heights: h1,
        talk: [[3, 'SABUMNIM', 'Today is your test, Kinan. Climb, swim, and stay calm. Show me what you learned!', 4],
               [9, 'GLITCHY', 'I am coming too! I promise I will not glitch anything. Probably.', 3.4],
               [60, 'GLITCHY', 'That wall is too high to jump. Jump at it anyway and GRAB the edge!', 3.4],
               [69, 'SABUMNIM', 'Between two walls, kick off one, then the other. Up, up, up!', 3.4],
               [114, 'GLITCHY', 'A mine! It is dark in there. Good thing your hard hat has a lamp!', 3.2]],
        solid: [
          [62, 7, 71, 11],      /* a ledge 5 rows up: grab it */
          [71, -14, 71, 4],     /* the chimney's left wall (a gap at rows 5-6 lets him in from the ledge); 3 tiles to the cliff */
          [75, -14, 104, 11]    /* the cliff */
        ],
        tiles: { shelf: s1, spring: [[50, 12], [90, -14]], gift: [[34, -9, 'heart'], [90, -26, 'candle'], [96, -18, 'popper']] },
        vines: [[30, -6, 11]],
        secrets: [{ kind: 'hidden', col: 90, row: -26, prize: 'heart+candles', glint240: true }],
        candles: c1,
        foes: [[18, 11, 'squirrel'], [24, 7, 'crow'], [36, -6, 'sock'], [48, 6, 'goose'], [58, 11, 'squirrel'], [84, -18, 'seagull'], [98, -18, 'seagull'], [118, 11, 'raccoon']]
      },
      {
        id: 'mine', name: 'ACT 2: THE OLD MINE', cols: 140, heights: h2, dark: true,
        s2checkpoints: [[2, 12], [82, 12]],
        talk: [[118, 'GLITCHY', 'Daylight! And a waterfall. Kinan... can you swim UP a waterfall?', 3.4]],
        solid: [
          [0, 0, 113, 1],       /* the mine's roof */
          [24, 6, 62, 6],       /* the upper track */
          [61, 2, 61, 5],       /* the end of the upper track: take the chute */
          [36, -9, 52, -9], [36, -2, 52, -2], [36, -8, 36, -3], [52, -8, 52, -3],   /* the hidden room above the roof */
          [72, 7, 78, 11]       /* a ledge to grab */
        ],
        tiles: { shelf: s2, gift: [[30, 2, 'candle'], [44, -6, 'heart'], [99, 0, 'heart']] },
        ladders: [[22, 5, 11], [91, 7, 11], [107, 7, 11]],
        warps: [
          { kind: 'pipe', col: 40, row: 4, to: { col: 42, row: -2 } },   /* up to the hidden room */
          { kind: 'pipe', col: 48, row: -4, to: { col: 56, row: 6 } },   /* and back to the track */
          { kind: 'chute', col: 60, row: 6, to: { col: 66, row: 12 } }   /* the chute down */
        ],
        secrets: [{ kind: 'visible', col: 44, row: -6, prize: 'heart' }],
        candles: c2,
        foes: [[12, 6, 'umbrellabat'], [20, 11, 'gopher'], [33, 3, 'umbrellabat'], [40, 11, 'gopher'], [54, 11, 'cart'], [68, 11, 'gopher'], [80, 6, 'umbrellabat']],
        s2boss: { kind: 'mole', col0: 86, col1: 112, rowTop: 2, holes: [[89, 11], [99, 11], [109, 11], [93, 7], [105, 7], [99, 3]] }
      },
      {
        id: 'sea', name: 'ACT 3: THE WATERFALL AND THE SEA', cols: 150, heights: h3,
        s2checkpoints: [[2, 12], [94, 4]],
        talk: [[6, 'SABUMNIM', 'Water is calm. Be like water. Tap JUMP to swim, as long as you like.', 3.6],
               [66, 'GLITCHY', 'Now DIVE! There is something shiny down there...', 3]],
        solid: [
          [22, -15, 23, 8],     /* the rock beside the waterfall (walk in under it) */
          [28, -15, 71, 11],    /* the cliff the waterfall pours over */
          [92, 4, 96, 11],      /* a reef */
          [110, 5, 118, 6],     /* a rock overhang: the golden candle hides under it */
          [141, -3, 149, 11]    /* the shore */
        ],
        tiles: { gift: [[50, -19, 'candle'], [128, 8, 'candle']] },
        water: [[24, -16, 27, 11], [72, -3, 140, 11]],
        goldenCandle: { col: 114, row: 11 },
        secrets: [{ kind: 'hidden', col: 114, row: 11, prize: 'GOLDEN CANDLE' }],   /* under the rock overhang, on the sea floor */
        candles: c3,
        foes: [[12, 11, 'goose'], [40, -16, 'puddlefrog'], [58, -20, 'seagull'], [84, 4, 'fish'], [104, 0, 'fish'], [124, 6, 'fish'], [134, 2, 'fish']]
      },
      {
        id: 'cave', name: 'ACT 4: THE SEA CAVE', cols: 60, heights: h4,
        s2checkpoints: [[3, 12]],
        talk: [[4, 'SABUMNIM', 'The last test. Whatever happens, keep climbing.', 3]],
        solid: [
          [10, -43, 10, 8],     /* the cave's left wall (walk in at the bottom) */
          [41, -44, 41, 11],    /* its right wall */
          [10, -44, 41, -44],   /* its roof */
          [28, -14, 28, -3], [32, -14, 32, -3],   /* the wall-jump chimney, 3 tiles wide (walk in under it from L2) */
          [32, -14, 40, -14],   /* L4, beside the chimney's top */
          [12, -26, 24, -21]    /* a ledge to grab, and the spring's block */
        ],
        tiles: { shelf: s4, spring: [[13, -26]] },
        ladders: [[13, 5, 11], [38, -22, -15]],
        vines: [[24, -1, 11]],
        candles: c4,
        foes: [],   /* the tide is the enemy here */
        s2boss: { kind: 'tide', col0: 11, col1: 40, startCol: 13, stopRow: -32, summitRow: -34, crab: [12, 36], gateCol: 37 },
        goal: { col: 39, row: -35 }
      }
    ]
  });
})();

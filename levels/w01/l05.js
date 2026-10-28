/* ============================================================
   LEVEL 1-5 · THE FRONT YARD  (World 1 · Saskatoon home · trail stop 5)
   The "Wild Yard" design — docs/WORLD1-LEVEL-DESIGN.md §2 (§2.4
   geometry is normative). Moved here from index.html's AREA_1_1 in
   M4b; the data is unchanged except the picket arch, which used to
   be a seam into the house and is now this level's GOAL (Producer
   ruling 2026-10-27: levels start from and return to the world map).
   Idea: SLOPES · signature toy: run DOWN the brow into a stomp chain.
   Acts: porch→terrace (A1-A2) · pipes + bowl (B1-B2) · fence line (C1-C2).
   Owner: whoever is assigned World 1 (docs/LEVEL-AUTHORING.md §6).
   ============================================================ */
KinanLevels.register({
  id: '1-5', world: 1, slot: 5, kind: 'level',
  name: 'THE FRONT YARD',
  theme: 5,                 /* the Saskatoon Front Yard look (stage 5's sky, backdrop and ground) */
  cols: 162,
  heights: [
    /* A1 porch — the brow at c8-16 */ 192,192,192,192,192,192,192,192, 184,176, 176,176,176,176,176, 184,192, 192,192,192,192,192,192,192,192,192,192,
    /* A2 terrace — gap3 at c22-24 */ 192,192,192,192, 184,176,168,160, 160,160,160,160,160,160, 168,176,184,192, 192,192,192,192, null,null,null, 192,192,
    /* B1 pipes — deck c10-17 at y=128 (the run-under) */ 192,192, 184,176,168,160,152,144,136,128, 128,128,128,128,128,128,128,128, 136,144,152,160,168,176,184,192, 192,
    /* B2 gap4 at c5-8 · brow bump c20-23 */ 192,192,192,192,192, null,null,null,null, 192,192,192,192,192,192,192,192,192,192,192, 184,176,176,184, 192,192,192,
    /* C1 fence — gap5 at c17-21 */ 192,192,192, 184,176,168,160, 160,160,160, 168,176,184,192, 192,192,192, null,null,null,null,null, 192,192,192,192,192,
    /* C2 reward run + gate */ 192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  deck: [64, 71],          /* ONE tile thick at y=128 — rows 9-11 under it are the tunnel */
  fakeWall: [38, 39],      /* ground-looking column rows 8-10; the golden candle block sits inside */
  tiles: {
    gift: [[12, 8, 'popper'], [123, 8, 'heart'], [38, 9, 'gold']],
    brick: [[98, 8], [99, 8], [100, 8], [101, 8], [102, 8]],
    spring: [[140, 11], [141, 11]],
    shelf: [[90, 9], [91, 9], [92, 9], [143, 8], [144, 8], [145, 8], [146, 8], [148, 6], [149, 6], [150, 6], [152, 5], [153, 5], [154, 5]]
  },
  pipes: [[63, 11], [95, 11]],
  /* ER-10: the yard bug rides the sock walker's rhythm ("my socks are WALKING") */
  foes: [[6, 11, 'sock'], [45, 11, 'sock'], [46, 11, 'sock'], [66, 7, 'sock'], [69, 7, 'sock'],
         [101, 11, 'sock'], [102, 11, 'sock'], [113, 9, 'sock'], [130, 11, 'sock'], [131, 11, 'sock']],
  candles: [[3,11],[4,11],[12,6],[21,11],[22,11],[36,9],[37,9],[38,9],[47,9],[49,9],[51,9],
            [65,10],[66,10],[67,10],[86,10],[87,10],[88,9],[89,9],[125,9],[127,9],[129,9],
            [144,7],[145,7],[148,4],[149,4],[150,4],[152,3],[153,3],[154,3]],
  secrets: [
    { kind: 'visible', col: 90, row: 9, prize: 'heart+candles' },                  /* Secret-1: the gap-4 arc leads here */
    { kind: 'hidden', col: 38, row: 9, prize: 'GOLDEN CANDLE', glint240: true },   /* Secret-2: the terrace fake wall */
    { kind: 'skill', col: 153, row: 4, prize: 'hat' }                               /* Secret-3: the spring chain */
  ],
  goldenCandle: { col: 38, row: 9 },
  checkpoint: { col: 96, row: 11 },
  spawn: { col: 2, row: 11 },
  pet: { id: 'dog1', col: 25, row: 11 },  /* Chikastino joins: his crate in the yard past the porch brow, on the way */
  goal: { col: 160, row: 11 }   /* the picket arch (was the 1-1 -> 1-2 seam gate at c159-161) */
});

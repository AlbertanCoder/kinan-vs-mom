/* ============================================================
   LEVEL 3-1 · GRANDMA AND GRANDPA'S AT ONION LAKE
   (World 3 · Robin's oilfield trip · trail stop 1)
   Story bible (World 3 table): "A farmyard and garden; Grandma's
   pancakes give a full heal." Glitchy rode Robin's truck radio north,
   so Robin is driving Kinan up to his work site near Fort McMurray.
   First stop: breakfast at Grandma and Grandpa's place at Onion Lake.
   Grandma has her binoculars, Grandpa has his jokes, and the
   farmyard has gone a little wild.
   Idea (ONE): OVER OR UNDER. Every farmyard thing has a high road and
     a low road: run along Grandma's deck or under it, the clothesline
     or the garden, the old truck's roof or the crawl space under it.
     Act 1 teaches it with soft choices (both roads are safe). Act 2
     twists it: at the dugout the low road is WATER (the dock is the
     easy way, the island hops need a run), and in the hay-bale fort
     the low road is the calf pen: Grandpa's calf only charges what he
     can see, so up on the bales you are safe (a chick walks up there).
     Act 3 tests it: the barn (the loft, or the stalls with the calf), a
     clear runway, a 5-wide slough, then the trampoline and Robin's
     truck.
   Acts (72 cols each): teach 0-71 (the deck, the garden and the
     clothesline, a 2-wide ditch, the old truck, the woodpile) · twist
     72-143 (a 3-wide creek, THE DUGOUT, the hay-bale fort, the corral
     ditch 4 wide) · test 144-215 (the ridge by the grain bin, THE BARN,
     a runway and the 5-wide slough, the trampoline and the driveway).
   Signature set-piece: THE HAY-BALE FORT (S5): climb the floating
     bales over the calf, or run the low road under them.
   Secrets: visible = the top of the haystack: from the top bale, a
     big jump out over the calf pen to the ledge (heart + candles,
     128,3) · hidden = a bale in the top row glints: hop into the calf
     pen and bump it from BELOW (GOLDEN CANDLE, 121,7) · skill =
     Grandpa's trampoline is sunk in the lawn and the yard-light ledge
     is BEHIND it: walk onto it slowly and steer back left as you fly;
     a running bounce sails right past it (hat, 196,3).
   Look: borrows the Saskatoon Front Yard look (theme 5): green yard,
     trees and hedges, which reads as Grandma's garden on a sunny
     morning. Per-world art comes later.
   Bubble beats for ER-4 (not wired): c2 Grandpa: "Robin! You made
     good time." Robin: "Had to. I couldn't wait for breakfast, so I
     brought my appetite early." · c14 (deck) Grandma: "Eat! Look at
     you, skin and bones!" (the heart gift is her pancakes) · c110
     checkpoint, Grandpa: "Why don't cows ever have money? The farmer
     milks them dry." Robin: "Dad, that's MY joke." Grandpa: "Where do
     you think you got it?" · c121 Grandma, binoculars up: "Something
     is shining in that haystack." · c208 Grandma: "I packed you a
     lunch for the road. Don't eat it before the first stop sign."
     Robin's joke (World 3 joke book): "Why did the scarecrow win an
     award? He was outstanding in his field."
   ENGINE REQUESTS: a 'pancake' prize that heals every heart (the
     story's full heal; 'heart' stands in) · chick and calf skins
     ('egg', 'minibull' stand in) · Grandma and Grandpa cameos with
     bubbles (ER-4) · a Robin-joke pickup saved per level (bible: every
     level hides a new Robin joke) · a trampoline skin for the spring.
   ============================================================ */
KinanLevels.register({
  id: '3-1', world: 3, slot: 1, kind: 'level',
  name: "GRANDMA AND GRANDPA'S AT ONION LAKE",
  theme: 5,                 /* green yard, trees and hedges: Grandma's garden on a sunny morning */
  cols: 216,
  heights: [
    /* S1 0-26 Robin's truck pulls in · GRANDMA'S DECK (c9-18): over it or under it */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S2 27-53 the garden bed (a BOWL, c30-43) under the clothesline · the ditch c47-48 (2 wide) */
    192,192,192, 200,208, 208,208,208,208,208,208,208,208,208,208, 200,192, 192,192,192, null,null, 192,192,192,192,192,
    /* S3 54-80 the woodpile · GRANDPA'S OLD TRUCK (c62-70, crawl under it) · the creek c75-77 (3 wide) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null, 192,192,192,
    /* S4 81-107 THE DUGOUT: pond c85-88, the island c89-90, pond c91-94 (4 wide each) · a BROW c98-103 */
    192,192,192,192, null,null,null,null, 192,192, null,null,null,null, 192,192,192, 184,176, 176,176,176, 184,192, 192,192,192,
    /* S5 108-134 checkpoint · THE HAY-BALE FORT (c114-126) over the calf pen (posts c112, c128) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,
    /* S6 135-161 the corral ditch c140-143 (4 wide) · the RIDGE by the grain bin (c147-157) */
    192,192,192,192,192, null,null,null,null, 192,192,192, 184,176,168,160, 160,160,160,160, 168,176,184, 192,192,192,192,
    /* S7 162-188 THE BARN (c165-177): the loft or the stalls · a clear runway · the slough c183-187 (5 wide) */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192, null,null,null,null,null, 192,
    /* S8 189-215 reward: Grandpa's trampoline, Grandma's goodbye pancakes, Robin's truck */
    192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192,192
  ],
  solid: [
    [7, 11, 8, 11], [9, 9, 18, 9],        /* S1 the deck stairs and GRANDMA'S DECK (rows 10-11 under it are the low road) */
    [62, 9, 66, 10], [67, 8, 70, 10],     /* S3 the old truck: its box and its cab, up on blocks (crawl under, row 11) */
    [114, 9, 118, 9], [119, 7, 123, 7], [124, 9, 126, 9],   /* S5 THE HAY-BALE FORT: three floating bale rows */
    [112, 11, 112, 11], [128, 11, 128, 11],   /* S5 the calf pen's fence posts: he stays under the bales */
    [165, 3, 177, 3], [165, 4, 165, 8],   /* S7 the barn roof and its door frame (the doorway is rows 9-11) */
    [167, 10, 168, 11],                   /* S7 a hay bale in the stalls: the step up to the loft */
    [175, 11, 175, 11],                   /* S7 the end of the stalls: the calf stays in */
    [195, 4, 197, 4],                     /* S8 the yard-light ledge, BEHIND the trampoline (solid: no jumping up through it) */
    [21, 9, 27, 9], [21, 7, 24, 7], [21, 8, 21, 8]   /* taekwondo (2026-10-28): Grandpa's tool shelf over the lawn (walk under it); its board door faces right */
  ],
  tiles: {
    gift: [[12, 5, 'candle'], [15, 5, 'heart'],                  /* S1 on the deck: Grandma's pancakes */
           [57, 8, 'popper'],                                    /* S3 in the woodpile */
           [101, 7, 'candle'],                                   /* S4 over the brow */
           [106, 8, 'candle'], [121, 7, 'gold'],                 /* S5 before the checkpoint · the glinting bale */
           [151, 6, 'candle'], [153, 6, 'heart'],                /* S6 over the ridge */
           [171, 5, 'candle'],                                   /* S7 in the loft */
           [194, 8, 'heart'], [207, 8, 'candle']],               /* S8 Grandma's goodbye pancakes */
    brick: [[55, 8], [56, 8], [58, 8], [59, 8]],                 /* S3 Grandpa's woodpile: logs crash when you bump them */
    spring: [[199, 12]],                                         /* S8 Grandpa's trampoline, sunk in the lawn */
    shelf: [[31, 9], [32, 9], [33, 9], [34, 9], [35, 9], [36, 9], [37, 9], [38, 9], [39, 9], [40, 9], [41, 9],   /* S2 the clothesline */
            [84, 9], [85, 9], [86, 9], [87, 9], [88, 9], [91, 9], [92, 9], [93, 9], [94, 9], [95, 9], [96, 9],   /* S4 the dock (a broken gap over the island) */
            [127, 4], [128, 4], [129, 4],                                                                       /* S5 the top of the haystack (visible secret) */
            [166, 8], [167, 8], [168, 8], [169, 8], [170, 8], [171, 8], [172, 8], [173, 8], [174, 8], [175, 8], [176, 8], [177, 8]],  /* S7 the hay loft */
    board: [[24, 8]]                                             /* BONUS: hop onto the tool shelf from the right and KICK the board: 2 candles inside */
  },
  /* gophers hop, chicks (eggs) wander, the geese patrol, Grandpa's calf charges what he can see */
  foes: [[23, 11, 'gopher'],
         [36, 12, 'gopher'],                /* in the garden bed */
         [60, 11, 'egg'],
         [95, 4, 'goose'], [98, 11, 'gopher'],
         [120, 11, 'minibull'], [121, 6, 'egg'],   /* the calf, penned under the bales (up there you are too high for him to see); a chick on the top bale */
         [146, 11, 'gopher'], [156, 6, 'crow'],
         [172, 7, 'egg'], [172, 11, 'minibull'],    /* a chick in the loft, the calf in the stalls */
         [192, 11, 'egg']],
  candles: [[3, 11], [4, 11], [10, 8], [17, 8],
            [10, 11], [11, 11], [12, 11], [13, 11], [14, 11], [15, 11], [16, 11], [17, 11],
            [32, 8], [34, 8], [36, 8], [38, 8], [40, 8], [33, 12], [34, 12], [39, 12], [40, 12],
            [46, 10], [47, 9], [48, 9], [49, 10],
            [63, 11], [64, 11], [65, 11], [66, 11], [67, 11], [68, 11], [69, 11], [64, 8], [66, 8], [68, 7], [69, 7],
            [75, 9], [76, 8], [77, 9],
            [85, 8], [87, 8], [92, 8], [94, 8], [89, 11], [90, 11], [86, 11], [93, 11],
            [115, 8], [117, 8], [120, 6], [122, 6], [125, 8], [117, 11], [118, 11], [119, 11], [120, 11], [121, 11], [122, 11], [127, 3], [129, 3],
            [140, 9], [141, 8], [142, 8], [143, 9], [150, 9], [152, 9], [154, 9],
            [170, 7], [173, 7], [176, 7], [178, 10], [180, 11], [181, 11], [184, 8], [185, 7], [186, 7], [187, 8],
            [198, 9], [199, 7], [198, 5], [196, 2], [205, 11], [206, 11], [210, 11], [211, 11],
            [22, 8], [23, 8]],                                   /* behind the tool shelf's board */
  secrets: [
    { kind: 'visible', col: 128, row: 3, prize: 'heart+candles' },                 /* the top of the haystack */
    { kind: 'hidden', col: 121, row: 7, prize: 'GOLDEN CANDLE', glint240: true },  /* the glinting bale, bumped from the low road */
    { kind: 'skill', col: 196, row: 3, prize: 'hat' }                              /* bounce straight up beside the yard light, drift onto it */
  ],
  goldenCandle: { col: 121, row: 7 },
  checkpoint: { col: 110, row: 11 },
  spawn: { col: 2, row: 11 },
  goal: { col: 212, row: 11 }             /* Robin's truck at the end of the driveway */
});

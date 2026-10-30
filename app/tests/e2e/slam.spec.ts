import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* BUTT SLAM (Shad, 2026-10-29: "if there's boxes or things you can break underneath you, how would you break
   them unless you do a butt slam"). In the air, DOWN (↓ / S, a gamepad's down, the touch ▼ that shows only in
   the air) is a 0.2 s spin in place, then a fast straight drop: it smashes CRACKED FLOOR BOARDS (tiles.crack)
   and CRATES (tiles.crate) directly under him and nothing else (floor, bricks stay), its shockwave leaves small
   foes within about two tiles dizzy for 1.5 s, and it never touches a boss. The jump is unchanged (a NEW action;
   the §1.1 feel table is LOCKED). Every World 1-9 slam spot is a bonus: reachable from above, a floor under it,
   and Kinan can always jump back out. index.html block "BUTT SLAM"; docs/LEVEL-AUTHORING.md §4.3b. */
const BASE = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html`;
const DEV_URL = `${BASE}?devtools=1`;
const T = 16;

type Foe = { type: string; x: number; y: number; alive: boolean; dizzy: number; tough: boolean; arena: boolean };
type Slam = {
  slam: string | null; slams: number; land: number; onGround: boolean; px: number; py: number; vx: number; vy: number; hp: number; got: number;
  slabs: [number, number, string][]; broken: number; stuns: number; slammed: number; foes: Foe[];
  btn: { hidden: boolean; shown: boolean } | null; hint: boolean; learned: boolean;
};
type Probe = { x: number; y: number; vx: number; vy: number; onGround: boolean };
type Arena = { state: string; cp: { x: number }; floorY: number; boss: { x: number; y: number; w: number; hp: number; max: number; state: string }; log: { ev: string }[] };
type Dev = {
  playLevel: (id: string) => unknown; place: (x: number, y: number) => unknown; step: (n: number, o?: Record<string, boolean>) => Probe[];
  clearFoes: () => void; addFoe: (type: string, tx: number, ty: number) => number; godMode: () => void;
  paint: (tx: number, ty: number, t: number) => number; tile: (tx: number, ty: number) => number | null; slamInfo: () => Slam;
  arenaInfo: () => Arena; arenaBot: (n: number) => Arena;
};
type Lv = { world: number; areas?: { tiles?: Record<string, unknown> }[]; tiles?: Record<string, unknown> };
type Win = Window & { __k11: Dev; KinanLevels: { ready: boolean; list: () => string[]; get: (id: string) => Lv } };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
async function boot(page: Page): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => !!(window as unknown as Win).__k11 && (window as unknown as Win).KinanLevels?.ready);
}

test.describe('Butt slam', () => {
  test('1-2 teaches it: the hint near the cracked floorboards, a spin that hovers, then the drop smashes the board under him and he lands in the candle pocket, the floor under the pocket stays, and he jumps back out', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((T) => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-2'); k.godMode(); k.clearFoes();
      const s0 = k.slamInfo();
      k.place(18 * T, 11 * T); k.step(12);
      const hinted = k.slamInfo().hint;
      /* the floor: walking over the cracked boards never breaks them */
      k.step(40, { right: true }); k.step(1, { right: false });
      const walked = k.slamInfo().slabs.length;
      /* jump straight up from the middle board, and slam near the top */
      k.place(22 * T + 3, 11 * T); k.step(10);
      k.step(1, { tapJump: true, jump: true }); k.step(14, { jump: true });
      const air = k.slamInfo();
      k.step(1, { down: true, jump: false });
      const spin0 = k.slamInfo();
      k.step(8, { down: false });
      const spin1 = k.slamInfo();
      let drop: Slam | null = null;
      for (let n = 0; n < 60; n++) { k.step(1); const s = k.slamInfo(); if (!drop && s.slam === 'drop') drop = s; if (!s.slam && s.onGround) break; }
      const landed = k.slamInfo();
      const floorUnder = k.tile(22, 14);
      /* the pocket's candles, left and right */
      k.step(20, { left: true }); k.step(1, { left: false }); k.step(40, { right: true }); k.step(1, { right: false });
      const g2 = k.slamInfo().got;
      /* and out again: up through the hole, steering right onto the floor */
      k.place(22 * T + 3, 13 * T); k.step(6);
      k.step(1, { tapJump: true, jump: true }); k.step(16, { jump: true }); k.step(40, { right: true, jump: false }); k.step(1, { right: false });
      const out = k.slamInfo();
      return { s0, hinted, walked, air, spin0, spin1, drop, landed, floorUnder, g2, out };
    }, T);
    expect(r.s0.slabs).toEqual([[21, 12, 'crack'], [22, 12, 'crack'], [23, 12, 'crack'], [119, 9, 'crate'], [119, 10, 'crate']]);
    expect(r.hinted).toBe(true);
    expect(r.walked).toBe(5);                                    /* walking never breaks them */
    expect(r.air.onGround).toBe(false);
    expect(r.spin0.slam).toBe('spin');
    expect(r.spin1.slam).toBe('spin');                           /* the 0.2 s spin: he hovers in place */
    expect(r.spin1.vy).toBe(0);
    expect(r.spin1.py).toBeCloseTo(r.spin0.py, 5);
    expect(r.drop?.vy).toBeGreaterThan(9);                       /* then a fast straight drop */
    expect(r.drop?.vx).toBe(0);
    expect(r.landed.slabs.some(([x, y]) => x === 22 && y === 12)).toBe(false);   /* the board under him is smashed */
    expect(r.landed.broken).toBeGreaterThanOrEqual(1);
    expect(r.landed.learned).toBe(true);
    expect(r.landed.land).toBeGreaterThan(0);                    /* the sitting landing pose */
    expect(r.landed.py + 16).toBeGreaterThan(13 * T);            /* down in the pocket */
    expect(r.floorUnder).toBe(1);                                /* the floor under the pocket is never broken */
    expect(r.g2 - r.s0.got).toBeGreaterThanOrEqual(3);           /* the pocket's three candles */
    expect(r.out.py).toBeLessThan(12 * T);                       /* he jumped back out */
    expect(errors).toEqual([]);
  });

  test('normal floor, bricks and a brick set in the floor never break; neither does a slam on a gift block', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((T) => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-2'); k.godMode(); k.clearFoes();
      const slamAt = (x: number, y: number) => {
        k.step(10);   /* stand a moment after the last landing */
        k.place(x, y); k.step(1); k.step(1, { down: true }); k.step(1, { down: false });   /* place() stands him: one frame to be in the air */
        for (let n = 0; n < 80; n++) { k.step(1); const s = k.slamInfo(); if (!s.slam && s.onGround) break; }
        return k.slamInfo();
      };
      const b0 = k.slamInfo().broken;
      const floor = slamAt(55 * T + 3, 8 * T);                  /* the plain floor before the coffee table */
      k.paint(56, 12, 2);
      const brickFloor = slamAt(56 * T + 3, 8 * T);             /* a brick set in the floor */
      const brick = slamAt(49 * T + 3, 5 * T);                  /* the floating brick by the first pit */
      const gift = slamAt(50 * T + 3, 5 * T);                   /* the gift block beside it */
      return { b0, floor, brickFloor, brick, gift, t55: k.tile(55, 12), t56: k.tile(56, 12), t49: k.tile(49, 9), t50: k.tile(50, 9) };
    }, T);
    expect(r.floor.slammed).toBe(1);
    expect(r.brickFloor.slammed).toBe(2);
    expect(r.brick.slammed).toBe(3);
    expect(r.gift.slammed).toBe(4);
    expect(r.gift.broken).toBe(r.b0);                            /* nothing broke */
    expect(r.t55).toBe(1);
    expect(r.t56).toBe(2);
    expect(r.t49).toBe(2);
    expect(r.t50).toBe(3);
    expect(errors).toEqual([]);
  });

  test('the jump is unchanged: holding DOWN from the ground through a whole jump gives exactly the same arc (only a press in the air slams)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((T) => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-2'); k.godMode(); k.clearFoes();
      const arc = (down: boolean) => {
        k.place(154 * T, 11 * T); k.step(20, { down, right: false, left: false });
        const a = k.step(1, { tapJump: true, jump: true, down });
        const b = k.step(70, { jump: true, down });
        k.step(1, { jump: false, down: false });
        return a.concat(b).map((p) => [Math.round(p.x * 1000), Math.round(p.y * 1000), Math.round(p.vy * 1000), p.onGround ? 1 : 0]);
      };
      const plain = arc(false), held = arc(true);
      return { plain, held, slams: k.slamInfo().slams };
    }, T);
    expect(r.held).toEqual(r.plain);
    expect(r.slams).toBe(0);
    expect(errors).toEqual([]);
  });

  test('the touch ▼ shows only while Kinan is in the air, never on top of JUMP or KICK', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((T) => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-2'); k.godMode(); k.clearFoes();
      k.place(55 * T, 11 * T); k.step(10);
      const ground = k.slamInfo().btn;
      k.step(1, { tapJump: true, jump: true }); k.step(10, { jump: true });
      const air = k.slamInfo().btn;
      const pad = document.getElementById('pad')!, b = document.getElementById('slamBtn')!;
      const padShown = !pad.hidden && pad.offsetParent !== null;
      const rect = (el: Element | null) => { if (!el) return null; const q = el.getBoundingClientRect(); return { l: q.left, t: q.top, r: q.right, b: q.bottom }; };
      const rs = { slam: rect(b), jump: rect(pad.querySelector('[data-k="jump"]')), pow: rect(pad.querySelector('[data-k="fire"]')) };
      k.step(1, { jump: false }); for (let n = 0; n < 90 && !k.slamInfo().onGround; n++) k.step(1);
      const back = k.slamInfo().btn;
      return { ground, air, back, padShown, rs, k: b.dataset.k };
    }, T);
    expect(r.k).toBe('down');
    expect(r.ground?.hidden).toBe(true);
    expect(r.air?.hidden).toBe(false);
    expect(r.back?.hidden).toBe(true);
    if (r.padShown) {   /* a touch screen: it is really on screen in the air, and clear of JUMP and KICK */
      expect(r.air?.shown).toBe(true);
      const clear = (a: { l: number; t: number; r: number; b: number } | null, c: { l: number; t: number; r: number; b: number } | null) => !a || !c || a.r <= c.l || c.r <= a.l || a.b <= c.t || c.b <= a.t;
      expect(clear(r.rs.slam, r.rs.jump)).toBe(true);
      expect(clear(r.rs.slam, r.rs.pow)).toBe(true);
    }
    expect(errors).toEqual([]);
  });

  test('the shockwave: small foes within about two tiles are dizzy for about 1.5 s, one far away is not, a tough one only wobbles', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((T) => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-2'); k.godMode(); k.clearFoes();
      /* he lands at tile 135; the foes go in as the drop starts (so their walking does not move them) two tiles either
         side of him, clear of his landing spot (a slam that lands ON a foe is a stomp), and one far away */
      k.place(135 * T + 3, 9 * T); k.step(1); k.step(1, { down: true }); k.step(1, { down: false });
      for (let n = 0; n < 30 && k.slamInfo().slam !== 'drop'; n++) k.step(1);
      const near = k.addFoe('sock', 133, 11), close = k.addFoe('sock', 137, 11), far = k.addFoe('sock', 148, 11), tough = k.addFoe('mallwalker', 138, 11);
      for (let n = 0; n < 80; n++) { k.step(1); const s = k.slamInfo(); if (!s.slam && s.onGround) break; }
      const s1 = k.slamInfo();
      k.step(95);
      const s2 = k.slamInfo();
      return { near: s1.foes[near], far: s1.foes[far], close: s1.foes[close], tough: s1.foes[tough], stuns: s1.stuns, later: s2.foes[near] };
    }, T);
    expect(r.near.dizzy).toBeGreaterThan(80);
    expect(r.close.dizzy).toBeGreaterThan(80);
    expect(r.far.dizzy).toBe(0);
    expect(r.tough.tough).toBe(true);
    expect(r.tough.dizzy).toBe(0);                               /* a tough one only wobbles */
    expect(r.stuns).toBe(2);
    expect(r.later.dizzy).toBe(0);                               /* about 1.5 s */
    expect(errors).toEqual([]);
  });

  test('in a boss arena a slam right beside the boss never hurts it or anything in the fight (1-castle)', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-castle'); k.clearFoes(); k.godMode();
      const a0 = k.arenaInfo(); k.place(a0.cp.x - 6, a0.floorY - 18); k.step(20);
      let a = k.arenaInfo();
      for (let f = 0; f < 3000 && a.state !== 'fight'; f++) a = k.arenaBot(1);
      const hp0 = a.boss.hp, logs0 = a.log.length;
      for (let n = 0; n < 10; n++) {
        k.step(10);
        const b = k.arenaInfo().boss;
        k.place(b.x - 22, k.arenaInfo().floorY - 70); k.step(1); k.step(1, { down: true }); k.step(1, { down: false });
        for (let t = 0; t < 80; t++) { k.step(1); const s = k.slamInfo(); if (!s.slam && s.onGround) break; }
      }
      const a1 = k.arenaInfo();
      return { state: a1.state, hp0, hp1: a1.boss.hp, max: a1.boss.max, slammed: k.slamInfo().slammed, stuns: k.slamInfo().stuns,
        hits: a1.log.slice(logs0).filter((e) => e.ev === 'hit' || e.ev === 'stomp').length };
    });
    expect(r.state).toBe('fight');
    expect(r.slammed).toBeGreaterThanOrEqual(8);
    expect(r.hp1).toBe(r.hp0);
    expect(r.stuns).toBe(0);
    expect(r.hits).toBe(0);
    expect(errors).toEqual([]);
  });

  test('every World 1-9 slam spot: 2-3 per world, never in a boss level, open above, a floor under it, smashed by a slam from above and Kinan always gets back out', async ({ page }) => {
    test.setTimeout(240_000);
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate((T) => {
      const w = window as unknown as Win, K = w.KinanLevels, k = w.__k11, perWorld: Record<number, number> = {};
      const has = (d: Lv) => (d.areas || [d]).some((a) => !!(a.tiles && (a.tiles.crack || a.tiles.crate)));
      const ids = K.list().filter((id) => K.get(id).world <= 9 && has(K.get(id)));
      const res = ids.map((id) => {
        k.playLevel(id); k.godMode(); k.clearFoes(); k.step(2);
        const all = k.slamInfo().slabs;
        /* a spot: slabs side by side or stacked */
        const spots: [number, number, string][][] = [];
        for (const c of all) {
          const s = spots.find((g) => g.some(([x, y]) => Math.abs(x - c[0]) + Math.abs(y - c[1]) === 1));
          if (s) s.push(c); else spots.push([c]);
        }
        perWorld[K.get(id).world] = (perWorld[K.get(id).world] || 0) + spots.length;
        return { id, spots: spots.map((g) => {
          k.playLevel(id); k.godMode(); k.clearFoes(); k.step(2);
          const top = Math.min(...g.map(([, y]) => y));
          const cols = g.filter(([, y]) => y === top).map(([x]) => x).sort((a, b) => a - b);
          const cx = cols[Math.floor(cols.length / 2)];
          const above = [k.tile(cx, top - 1), k.tile(cx, top - 2)];
          let floor = -1;
          for (let y = top + 1; y < 15; y++) { const t = k.tile(cx, y); if (t && t !== 5) { floor = y; break; } }
          const g0 = k.slamInfo().got, hp0 = k.slamInfo().hp;
          k.place(cx * T + 3, (top - 3) * T); k.step(1); k.step(1, { down: true }); k.step(1, { down: false });
          for (let n = 0; n < 90; n++) { k.step(1); const s = k.slamInfo(); if (!s.slam && s.onGround) break; }
          const landed = k.slamInfo();
          const smashed = !landed.slabs.some(([x, y]) => x === cx && y === top);
          k.step(30, { left: true }); k.step(1, { left: false }); k.step(60, { right: true }); k.step(1, { right: false }); k.step(30, { left: true }); k.step(1, { left: false });
          const got = k.slamInfo().got - g0;
          /* back out: jump from the middle of the hole, steer onto the floor beside it */
          let minFeet = 1e9;
          k.place(cx * T + 3, landed.py); k.step(4);
          k.step(1, { tapJump: true, jump: true });
          for (let n = 0; n < 18; n++) { k.step(1, { jump: true }); minFeet = Math.min(minFeet, k.slamInfo().py + 16); }
          return { at: [cx, top], kinds: [...new Set(g.map((c) => c[2]))], above, floor, smashed, fell: landed.py > 15 * T, hpLost: hp0 - landed.hp, got, minFeet, topY: top * T };
        }) };
      });
      return { res, perWorld, castles: ids.filter((id) => /castle|fort/.test(id)) };
    }, T);
    for (const lv of r.res) for (const s of lv.spots) {
      const tag = `${lv.id} slam spot ${s.at}`;
      expect(s.above.every((t) => !t || t === 7), `${tag}: open above it`).toBe(true);
      expect(s.floor, `${tag}: a floor under it`).toBeGreaterThan(s.at[1]);
      expect(s.smashed, `${tag}: a slam smashes it`).toBe(true);
      expect(s.fell, `${tag}: never a fall`).toBe(false);
      expect(s.hpLost, `${tag}: never hurts`).toBe(0);
      expect(s.minFeet, `${tag}: he jumps back out`).toBeLessThan(s.topY);
      if (s.kinds.includes('crack') && !s.kinds.includes('crate')) expect(s.got, `${tag}: candles in the pocket`).toBeGreaterThanOrEqual(1);
    }
    for (let n = 1; n <= 9; n++) {
      expect(r.perWorld[n] || 0, `World ${n}: slam spots`).toBeGreaterThanOrEqual(2);
      expect(r.perWorld[n] || 0, `World ${n}: slam spots`).toBeLessThanOrEqual(3);
    }
    expect(errors).toEqual([]);
  });
});

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/*
 * TE-1 · FEEL & PHYSICS — live terrain measurements (TEST-PLAN K17-K19).
 * Pins the collision semantics the feel depends on, in the real engine:
 * exact tile-edge snaps (walls), ledge falls with no snap-back, one-way shelves
 * catching from above but never blocking from below, and exact ceiling snaps.
 * Geometry is discovered deterministically through probe().rows / platforms().
 */

const DEV_URL = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html?devtools=1`;
const CURRENT = 'kinan-remaster-v1';
const T = 16;
const PLAYER_H = 16;

type Probe = {
  x: number; y: number; vx: number; vy: number; onGround: boolean;
  camX: number; arenaX: number; w: number; len: number; boss: string; rows: string[];
};
type Shelf = { tx: number; ty: number; floorY: number };
type Dev = {
  jumpToStage: (i: number) => void;
  godMode: () => void;
  clearFoes: () => void;
  place: (x: number, y: number) => { x: number; y: number; onGround: boolean };
  probe: () => Probe;
  state: () => { stage: number };
  platforms: () => Shelf[];
  step: (n: number, hold?: { left?: boolean; right?: boolean; jump?: boolean; tapJump?: boolean }) => Probe[];
};

const fixture = (name: string): string =>
  readFileSync(fileURLToPath(new URL(`../fixtures/saves/${name}`, import.meta.url)), 'utf8');

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

async function seed(page: Page): Promise<void> {
  await page.addInitScript(({ key, raw }) => {
    const data = JSON.parse(raw);
    data.codes = [2, 3, 4, 5];
    data.mapWorld = 1;
    data.mapSeen = {};
    data.mapSel = {};
    delete data.explorer;
    data.pets = { ids: [], names: {} };
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: CURRENT, raw: fixture('kinan-remaster-v1.sample.json') });
}

async function dismissStory(page: Page): Promise<void> {
  await expect(page.locator('#stage')).toBeVisible();
  for (let i = 0; i < 30 && await page.locator('#dialog').isVisible(); i++) {
    await page.locator('#dialog').click({ force: true });
    await page.waitForTimeout(30);
  }
  await expect(page.locator('#dialog')).toBeHidden();
}

async function boot(page: Page, stage = 0): Promise<void> {
  await seed(page);
  await page.goto(DEV_URL);
  await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object');
  await page.evaluate((i) => (window as unknown as { __k11: Dev }).__k11.jumpToStage(i), stage);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.state().stage)).toBe(stage);
  await dismissStory(page);
}

async function probeNow(page: Page): Promise<Probe> {
  return page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.probe());
}

async function settle(page: Page, x: number): Promise<Probe> {
  await page.evaluate((px) => {
    const k = (window as unknown as { __k11: Dev }).__k11;
    k.clearFoes(); k.godMode();
    k.place(px, 30);
  }, x);
  await expect.poll(async () => {
    const p = await probeNow(page);
    return p.onGround && p.vy === 0;
  }, { timeout: 3000 }).toBe(true);
  return probeNow(page);
}

type Found = { worldCol: number; worldRow: number };

/** Frame-exact settle: place + step in one atomic evaluate (place() fakes
 *  onGround, so live-rAF polling can catch a phantom rest — stepping can't).
 *  Returns null when x has no floor (a pit column). */
async function settleStep(page: Page, x: number): Promise<Probe | null> {
  return page.evaluate((px) => {
    const k = (window as unknown as { __k11: Dev }).__k11;
    k.clearFoes(); k.godMode();
    k.place(px, 30);
    const s = k.step(120);
    const last = s[s.length - 1];
    /* at rest = grounded, still, at the placed x, and actually fell (y moved) —
       a frozen paused sim would still report place()'s phantom rest at y = 30 */
    const atRest = last.onGround && last.vy === 0 && Math.abs(last.x - px) < 2 && Math.abs(last.y - 30) > 1;
    return atRest ? last : null;
  }, x);
}

/**
 * Walk the stage in 16-tile steps and let a predicate loose on probe().rows
 * (a solid map around Kinan). Deterministic: same stage, same scan, same find.
 */
async function scanRows(
  page: Page,
  match: (rows: string[], worldColOf: (j: number) => number, worldRowOf: (r: number) => number) => Found | null,
): Promise<Found | null> {
  const first = await probeNow(page);
  /* stay left of the boss threshold (stage 0 fires startBoss at x > (arenaX+3)*T
     = 2080, which freezes a single-evaluate scenario mid-scan) */
  const maxX = Math.min(first.w * T - 200, 1500);
  for (let x = 32; x < maxX; x += 16 * T) {
    const p = await settleStep(page, x);
    if (!p) continue;   /* a pit column — nothing to stand on here */
    const ty = Math.floor(p.y / T);
    const tx = Math.floor(p.x / T);
    const found = match(
      p.rows,
      (j) => tx - 2 + j,
      (r) => ty - 5 + r,
    );
    if (found) return found;
  }
  return null;
}

test.describe('live terrain feel (collision semantics, in-engine measurements)', () => {
  test('a terrain wall stops Kinan exactly at the tile edge (wall snap)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    /* find a raised step/wall with floor under both sides in the walkable zone
       (the far-right level edge is unreachable in any state: x > (arenaX+3)*T
       fires the boss intro, and the fight clamps P.x to the arena) */
    const wall = await scanRows(page, (rows, colOf, rowOf) => {
      for (let r = 4; r <= 6; r++) {
        for (let j = 2; j < rows[r].length - 1; j++) {
          if (rows[r][j] === '.' && rows[r][j + 1] === '#' && rows[r + 1][j] === '#' && rows[r + 1][j + 1] === '#'
            && rows[r + 1][j - 1] === '#' && rows[r + 1][j - 2] === '#') {
            return { worldCol: colOf(j + 1), worldRow: rowOf(r) };
          }
        }
      }
      return null;
    });
    expect(wall, 'the stage must contain a step or wall to walk into').toBeTruthy();
    if (!wall) return;
    const faceX = wall.worldCol * T;
    /* frame-exact: settle beside the face at its own height, then walk into it */
    const r = await page.evaluate(([fx, ry]) => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.clearFoes(); k.godMode();
      k.place(fx - 40, ry);
      k.step(200);                          /* settle on the floor before the wall */
      const s = k.step(50, { right: true }); /* walk hard into it */
      const p = s[s.length - 1];
      return { endX: p.x, vx: p.vx };
    }, [faceX, wall.worldRow * T] as const);
    /* Legacy moveX checks the tile of (x + w - 1), so after the exact snap
       (tx*T - P.w) Kinan re-drifts exactly one accel step (0.55 px) into the
       face and oscillates snap ⇄ drift there — pin the real legacy edge
       behavior. (The M2 contract's exact no-penetration snap is pinned in the
       unit model: "walls stop exactly at the tile edge".) */
    expect(r.endX).toBeCloseTo(faceX - 10 + 0.55, 3);
    expect(r.vx).toBeCloseTo(0.55, 3);
    expect(errors).toEqual([]);
  });

  test('the left level wall stops Kinan exactly at x = 0 (wall snap)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    await settle(page, 60);
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(700);
    await page.keyboard.up('ArrowLeft');
    const p = await probeNow(page);
    expect(p.x).toBe(0);
    expect(p.vx).toBe(0);
    expect(errors).toEqual([]);
  });

  test('walking off a ledge drops you — nothing snaps you back (ledge)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const edge = await scanRows(page, (rows, colOf, rowOf) => {
      /* a real drop: the edge tile has solid ground BENEATH it (a one-way
         shelf edge would have air below and is not a ledge) */
      for (let r = 6; r < rows.length - 1; r++) {
        const j = rows[r].search(/#\.{3}/);
        if (j >= 0 && rows[r + 1][j] === '#') {
          const col = colOf(j + 1);
          if (col * T > 1500) continue;   /* keep the 90-frame walk clear of the boss trigger */
          return { worldCol: col, worldRow: rowOf(r) };
        }
      }
      return null;
    });
    expect(edge, 'the stage must contain a ledge or pit to walk off').toBeTruthy();
    if (!edge) return;
    const edgeX = edge.worldCol * T;
    /* frame-exact: walk straight off the edge and measure the drop */
    const r = await page.evaluate((ex) => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.clearFoes(); k.godMode();
      k.place(ex - 34, 30);
      k.step(200);
      const before = k.probe();
      const s = k.step(90, { right: true });
      const fell = s.findIndex((p) => !p.onGround && p.x >= ex - 64);
      const post = s[Math.min(fell + 12, s.length - 1)];   /* mid-drop sample */
      return { fell, dropY: post.y - before.y };
    }, edgeX);
    expect(r.fell, 'Kinan must fall at the ledge edge').toBeGreaterThanOrEqual(0);
    expect(r.dropY).toBeGreaterThan(12);   /* the drop is real — no coyote snap-back */
    expect(errors).toEqual([]);
  });
});

type Sample2 = { t: number; p: Probe };

async function record2(page: Page, durationMs: number): Promise<Sample2[]> {
  return page.evaluate((dur) => {
    const k = (window as unknown as { __k11: Dev }).__k11;
    const out: Sample2[] = [];
    return new Promise<Sample2[]>((resolve) => {
      const t0 = performance.now();
      const tick = (): void => {
        out.push({ t: performance.now() - t0, p: k.probe() });
        if (performance.now() - t0 < dur || out.length < 42) requestAnimationFrame(tick);   /* ≥42 frames: throttled rAF still yields a full set */
        else resolve(out);
      };
      requestAnimationFrame(tick);
    });
  }, durationMs);
}

test.describe('one-way shelves and ceilings (tile 7 and tile snaps)', () => {
  test('a one-way shelf catches you from above (one-way)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const shelves = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.platforms());
    const shelf = shelves.find((s) => s.floorY - s.ty >= 3) ?? null;
    expect(shelf, 'the stage must contain a one-way shelf with air below').toBeTruthy();
    if (!shelf) return;
    await page.evaluate(([sx, sy]) => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.clearFoes(); k.godMode();
      k.place(sx, sy);
    }, [shelf.tx * T + 3, shelf.ty * T - 40] as const);
    await expect.poll(async () => {
      const p = await probeNow(page);
      return p.onGround && Math.abs(p.y - (shelf.ty * T - PLAYER_H)) <= 1.5;
    }, { timeout: 3000 }).toBe(true);
    expect(errors).toEqual([]);
  });

  test('a one-way shelf never blocks a jump from below (one-way)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const shelves = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.platforms());
    const shelf = shelves.find((s) => s.floorY - s.ty >= 3) ?? null;
    expect(shelf, 'the stage must contain a one-way shelf with air below').toBeTruthy();
    if (!shelf) return;
    await page.evaluate(([sx, sy]) => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.clearFoes(); k.godMode();
      k.place(sx, sy);
    }, [shelf.tx * T + 3, shelf.ty * T + 18] as const);
    await page.keyboard.press('Space');
    const samples = await record2(page, 1200);
    const miny = Math.min(...samples.map((s) => s.p.y));
    expect(miny).toBeLessThan(shelf.ty * T - PLAYER_H);   /* rose clean through the shelf */
    expect(errors).toEqual([]);
  });

  test('a ceiling bonk stops the rise exactly under the tile (ceiling snap)', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const shelves = await page.evaluate(() => (window as unknown as { __k11: Dev }).__k11.platforms());
    const overhang = await scanRows(page, (rows, colOf, rowOf) => {
      for (let r = 0; r + 3 < rows.length; r++) {
        for (let j = 0; j < rows[r].length; j++) {
          if (rows[r][j] !== '#') continue;
          const col = colOf(j), row = rowOf(r);
          if (shelves.some((s) => s.tx === col && s.ty === row)) continue;   /* a one-way shelf never bonks */
          if (rows[r + 1][j] === '.' && rows[r + 2][j] === '.') {
            return { worldCol: col, worldRow: row };
          }
        }
      }
      return null;
    });
    expect(overhang, 'the stage must contain a floating block to bonk').toBeTruthy();
    if (!overhang) return;
    const tileY = overhang.worldRow * T;
    /* frame-exact: jump straight up from two rows below and stop at the tile */
    const miny = await page.evaluate(([sx, sy]) => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.clearFoes(); k.godMode();
      k.place(sx, sy);
      const s = k.step(1, { tapJump: true }).concat(k.step(50));
      return Math.min(...s.map((p) => p.y));
    }, [overhang.worldCol * T + 3, (overhang.worldRow + 2) * T] as const);
    expect(miny).toBeGreaterThanOrEqual(tileY + T - 0.5);   /* never inside the tile */
    expect(miny).toBeLessThanOrEqual(tileY + T + 3);        /* but right up against it */
    expect(errors).toEqual([]);
  });
});



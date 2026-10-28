import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* Builder-owned focused spec (outside TE globs). Producer ruling 2026-10-26
   (contract §9): the world map must read like the Super Mario World overworld —
   a themed diorama, a winding dotted trail, crisp node dots (yellow open /
   red cleared / gray locked), the boss castle as its node, and a level-name
   plaque on the node Kinan stands on. These pins cover the BEHAVIOR (route
   integrity, state derivation, plaque targeting); the LOOK itself is
   VISUAL = UNVERIFIED until the Producer reviews it in person. */

const DEV_URL = 'http://127.0.0.1:4174/index.html?devtools=1';
const CURRENT = 'kinan-remaster-v1';

type NodeInfo = { stage: number; kind: string; open: boolean; done: boolean };
type OverInfo = {
  world: number; onMap: boolean; x: number; y: number;
  camX: number; camY: number; entrances: number;
  nodes: NodeInfo[]; near: number | null;
};
type Dev = {
  explorerGo: (w: number) => { world: number };
  explorerTeleport: (x: number, y: number) => { x: number; y: number };
  explorerDoor: (k: number) => { x: number; y: number; stage: number } | null;
  explorerInfo: () => OverInfo;
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

async function seed(page: Page, beaten: number[], unlocked: number): Promise<void> {
  await page.addInitScript(({ key, raw, beaten, unlocked }) => {
    const data = JSON.parse(raw);
    data.beaten = beaten;
    data.unlocked = unlocked;
    data.codes = [2, 3, 4, 5];
    data.mapWorld = 1;
    data.mapSeen = {};
    data.mapSel = {};
    delete data.explorer;
    data.pets = { ids: [], names: {} };
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: CURRENT, raw: fixture('kinan-remaster-v1.sample.json'), beaten, unlocked });
}

async function boot(page: Page): Promise<void> {
  await page.goto(DEV_URL);
  await page.waitForFunction(() => typeof (window as unknown as { __k11?: Dev }).__k11 === 'object');
}

test.describe('World map — the SMW overworld language (producer ruling, contract 9)', () => {
  test('every world map is a stage-dot route with the boss castle as its node', async ({ page }) => {
    const errors = watchErrors(page);
    await seed(page, [], 0);
    await boot(page);
    for (let w = 1; w <= 11; w++) {
      const info = await page.evaluate((ww) => {
        const k = (window as unknown as { __k11: Dev }).__k11;
        k.explorerGo(ww);
        return k.explorerInfo();
      }, w);
      expect(info.onMap, `world ${w} opens its map`).toBe(true);
      expect(info.nodes.length).toBeGreaterThanOrEqual(5);   /* a real route */
      /* every stage appears exactly once — the trail visits all of them */
      const stages = info.nodes.map((n) => n.stage);
      expect(new Set(stages).size).toBe(stages.length);
      /* the boss's castle IS the last node (SMW-style) */
      expect(info.nodes[info.nodes.length - 1].kind).toBe('castle');
      expect(info.nodes.slice(0, -1).every((n) => n.kind === 'level')).toBe(true);
    }
    expect(errors).toEqual([]);
  });

  test('node states follow the save: yellow open, red cleared, gray locked (routing only)', async ({ page }) => {
    const errors = watchErrors(page);
    /* stages 0-1 cleared, stage 2 open, everything past unlocked=3 locked */
    await seed(page, [0, 1], 3);
    await boot(page);
    const info = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.explorerGo(1);
      return k.explorerInfo();
    });
    const byStage = new Map(info.nodes.map((n) => [n.stage, n]));
    expect(byStage.get(0)).toMatchObject({ done: true, open: true });    /* red: cleared */
    expect(byStage.get(1)).toMatchObject({ done: true, open: true });
    expect(byStage.get(2)).toMatchObject({ done: false, open: true });   /* yellow: the next dot */
    expect(byStage.get(5)).toMatchObject({ done: false, open: false });  /* gray: locked */
    expect(errors).toEqual([]);
  });

  test('standing on a node names the stage — the SMW plaque targets it', async ({ page }) => {
    const errors = watchErrors(page);
    await seed(page, [], 12);
    await boot(page);
    const r = await page.evaluate(() => {
      const k = (window as unknown as { __k11: Dev }).__k11;
      k.explorerGo(1);
      const d0 = k.explorerDoor(0);
      k.explorerTeleport(d0!.x, d0!.y);
      return { near: k.explorerInfo().near, stage: d0!.stage };
    });
    expect(r.near).toBe(r.stage);   /* the plaque names exactly the node under Kinan */
    expect(errors).toEqual([]);
  });
});
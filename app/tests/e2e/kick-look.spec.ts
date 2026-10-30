import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* THE KICK'S LOOK (Shad, 2026-10-29: "it doesn't look like his feet... it looks like something coming out of his
   stomach, like Dad's backhoe"). The kick is drawn as whole poses (index.html "THE KICK, drawn as whole poses"):
   1 CHAMBER (knee up), 2 EXTEND (the leg straight out from the hip with the shoe, a swoosh), 3 RETRACT, and in the
   air a flying side kick. This spec saves pictures for Shad in app/kick-shots/ and pins the pose timing to the
   kick's own hit window (the hit box, timing and effects are pinned by taekwondo.spec.ts). */
const DEV_URL = `http://127.0.0.1:${process.env.KVM_PORT || 4174}/index.html?devtools=1`;
const T = 16;
const SHOTS = fileURLToPath(new URL('../../kick-shots/', import.meta.url));

type Dev = {
  playLevel: (id: string) => unknown; place: (x: number, y: number) => unknown; step: (n: number, o?: Record<string, boolean>) => unknown[];
  clearFoes: () => void; godMode: () => void; freeze: (on: boolean) => boolean;
  kickInfo: () => { kickT: number; face: number; px: number; py: number; vy: number };
};
type Win = Window & { __k11: Dev; KinanLevels: { ready: boolean }; __k11Draw: { kick?: string | null; belt?: string } };

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
const drawnPose = (page: Page): Promise<string | null> => page.evaluate(() => (window as unknown as Win).__k11Draw?.kick ?? null);

test.describe('Taekwondo · the kick\'s look', () => {
  test.skip(({ browserName, isMobile }) => browserName !== 'chromium' || !!isMobile, 'pictures are taken once, on desktop Chromium');

  test('the poses follow the hit window: chamber, then the leg out exactly while it can hit, then retract; in the air a flying kick', async ({ page }) => {
    const errors = watchErrors(page);
    await boot(page);
    const r = await page.evaluate(() => {
      /* index.html's own pose table, through the read-only dev hook */
      const g = (window as unknown as { __k11: { kickArt: () => { kickPoseAt: (age: number, onGround: boolean) => string | null } } }).__k11.kickArt();
      const ground: (string | null)[] = [], air: (string | null)[] = [];
      for (let age = 0; age < 18; age++) { ground.push(g.kickPoseAt(age, true)); air.push(g.kickPoseAt(age, false)); }
      return { ground, air };
    });
    expect(r.ground).toEqual(['chamber', 'chamber', 'chamber', ...Array(11).fill('extend'), 'retract', 'retract', 'retract', 'retract']);
    expect(r.air).toEqual([null, null, null, ...Array(11).fill('air'), null, null, null, null]);
    expect(errors).toEqual([]);
  });

  test('pictures for Shad: every frame at 8x (kick-frames.png) and the ground and air kick in game at 1280x720', async ({ page }) => {
    test.setTimeout(60_000);
    const errors = watchErrors(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    await boot(page);
    mkdirSync(SHOTS, { recursive: true });

    /* 1. the frames, 8x, side by side on a plain background */
    const png = await page.evaluate(() => {
      const g =(window as unknown as { __k11: { kickArt: () => any } }).__k11.kickArt();
      const KS = g.KS, S = 8, CW = 34, CH = 24;   /* his classic look */
      const frames: [string, HTMLCanvasElement, number, string | null][] = [
        ['STANDING', KS.kStand, -1, null], ['1 CHAMBER', KS.kick_chamber, 0, 'chamber'], ['2 EXTEND', KS.kick_extend, 4, 'extend'],
        ['3 RETRACT', KS.kick_retract, 15, 'retract'], ['JUMP', KS.kJump, -1, null], ['AIR KICK', KS.kick_air, 4, 'air']];
      const c = document.createElement('canvas'); c.width = frames.length * CW * S; c.height = CH * S + 44;
      const x = c.getContext('2d')!; x.imageSmoothingEnabled = false;
      x.fillStyle = '#bfe3f5'; x.fillRect(0, 0, c.width, c.height);
      frames.forEach(([label, img, age, pose], i) => {
        const t = document.createElement('canvas'); t.width = CW; t.height = CH;
        const tx = t.getContext('2d')!;
        const air = label === 'JUMP' || label === 'AIR KICK';
        if (!air) { tx.fillStyle = '#8a6a4a'; tx.fillRect(0, 21, CW, 3); }   /* the floor he stands on */
        tx.translate(3, 3);
        tx.drawImage(g.outlined(img), -1, -1);
        g.drawBeltOn(tx, g.beltRank());
        if (age >= 0) g.drawKickSwoosh(tx, age);
        void pose;
        x.drawImage(t, i * CW * S, 0, CW * S, CH * S);
        x.fillStyle = '#1b1220'; x.font = 'bold 26px monospace'; x.fillText(label, i * CW * S + 16, CH * S + 32);
        x.fillStyle = 'rgba(27,18,32,.25)'; x.fillRect((i + 1) * CW * S - 2, 0, 2, c.height);
      });
      return c.toDataURL('image/png');
    });
    writeFileSync(SHOTS + 'kick-frames.png', Buffer.from(png.split(',')[1], 'base64'));

    /* 2. the ground kick in game: 1-1's flat floor by the desk, facing right, the leg out */
    await page.evaluate((T) => {
      const k = (window as unknown as Win).__k11;
      k.playLevel('1-1'); k.clearFoes(); k.godMode();
      k.place(78 * T, 11 * T); k.step(12);
      k.step(1, { right: true }); k.step(8, { right: false });
      k.step(1, { tapFire: true }); k.step(5);
      k.freeze(true);
    }, T);
    await page.waitForTimeout(300);
    expect(await drawnPose(page)).toBe('extend');
    await page.screenshot({ path: SHOTS + 'kick-ground.png' });

    /* 3. the flying kick: jump, then kick on the way up */
    await page.evaluate(() => {
      const k = (window as unknown as Win).__k11;
      k.freeze(false);
      k.step(20);
      k.step(1, { tapJump: true, jump: true }); k.step(9, { jump: true });
      k.step(1, { tapFire: true, jump: true }); k.step(5, { jump: true });
      k.freeze(true);
    });
    await page.waitForTimeout(300);
    expect(await drawnPose(page)).toBe('air');
    await page.screenshot({ path: SHOTS + 'kick-air.png' });
    expect(errors).toEqual([]);
  });
});

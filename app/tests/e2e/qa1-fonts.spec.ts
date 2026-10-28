import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/* QA 2026-10-28 (MAJOR): the pixel fonts never loaded. The @font-face data: URL in index.html was
   broken over two lines, which CSS rejects, so every browser fell back to monospace (Courier on
   WebKit). Pixelify Sans (the game's text) and Nunito (the story subtitles) now load from fonts/.
   Proven here on every browser: the face is "loaded", it was fetched from fonts/, and text set in
   it measures differently from the monospace fallback. */
const BASE = 'http://127.0.0.1:4174/index.html';

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

test.describe('QA fix: the local pixel fonts load', () => {
  test('Pixelify Sans and Nunito load from fonts/ and the title screen is drawn in Pixelify Sans', async ({ page }) => {
    const errors = watchErrors(page);
    const fetched: string[] = [];
    page.on('response', (r) => { if (/\/fonts\/.+\.woff2$/.test(r.url()) && r.status() === 200) fetched.push(r.url().replace(/^.*\/fonts\//, 'fonts/')); });
    await page.goto(BASE);
    await expect(page.locator('#startBtn')).toBeVisible();
    const r = await page.evaluate(async () => {
      const pix = await document.fonts.load('700 40px "Pixelify Sans"');
      const nun = await document.fonts.load('400 20px "Nunito"');
      await document.fonts.ready;
      const status: Record<string, string> = {};
      document.fonts.forEach((f) => { status[f.family.replace(/"/g, '')] = f.status; });
      const width = (family: string): number => {
        const s = document.createElement('span');
        s.style.cssText = 'position:absolute;left:-9999px;white-space:nowrap;font-size:40px;font-family:' + family;
        s.textContent = 'Kinan vs. Mom WWWiii 1-1';
        document.body.appendChild(s);
        const w = s.getBoundingClientRect().width;
        s.remove();
        return w;
      };
      return {
        pixLoaded: pix.length, nunLoaded: nun.length, status,
        checkPix: document.fonts.check('700 16px "Pixelify Sans"'), checkNun: document.fonts.check('16px "Nunito"'),
        pixW: width('"Pixelify Sans", monospace'), nunW: width('Nunito, monospace'), monoW: width('monospace'),
        bodyFont: getComputedStyle(document.querySelector('#startBtn') as Element).fontFamily
      };
    });
    expect(r.pixLoaded).toBeGreaterThan(0);
    expect(r.nunLoaded).toBeGreaterThan(0);
    expect(r.status['Pixelify Sans']).toBe('loaded');
    expect(r.status['Nunito']).toBe('loaded');
    expect(r.checkPix).toBe(true);
    expect(r.checkNun).toBe(true);
    /* text in each face is not the monospace fallback */
    expect(Math.abs(r.pixW - r.monoW)).toBeGreaterThan(8);
    expect(Math.abs(r.nunW - r.monoW)).toBeGreaterThan(8);
    expect(r.bodyFont).toContain('Pixelify Sans');
    expect(fetched).toContain('fonts/pixelify-sans-latin.woff2');
    expect(fetched).toContain('fonts/nunito-latin.woff2');
    expect(errors).toEqual([]);
  });
});

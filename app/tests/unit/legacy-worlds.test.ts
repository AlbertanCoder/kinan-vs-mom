import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/* The live game is the root index.html (legacy-first). Keep its world map honest:
   every built world must have exactly one WM_PATHS stop per stage. A mismatch
   silently strands stages off the world map — the bug class that world growth
   keeps causing (Worlds 10 and 11 both moved these numbers). */
const html = readFileSync(fileURLToPath(new URL('../../../index.html', import.meta.url)), 'utf8');

describe('legacy world map integrity (index.html)', () => {
  it('has exactly one map stop per stage in every built world', () => {
    const ranges = [...html.matchAll(/from: (-?\d+), to: (-?\d+) \}/g)].map((m) => ({ from: Number(m[1]), to: Number(m[2]) }));
    expect(ranges.length).toBeGreaterThanOrEqual(11);
    const pathBody = /const WM_PATHS = \{([\s\S]*?)\n\};/.exec(html);
    expect(pathBody).toBeTruthy();
    const body = pathBody![1];
    const heads = [...body.matchAll(/^  (\d+): \[/gm)];
    expect(heads.length).toBe(ranges.filter((r) => r.from >= 0).length);
    for (let k = 0; k < heads.length; k++) {
      const h = heads[k];
      const start = h.index! + h[0].length;
      const end = k + 1 < heads.length ? heads[k + 1].index! : body.length;
      const stops = (body.slice(start, end).match(/\{ at: \[/g) || []).length;
      const r = ranges[Number(h[1]) - 1];   /* WORLDS entries appear in world order */
      expect(r.from).toBeGreaterThanOrEqual(0);
      expect(stops).toBe(r.to - r.from + 1);
    }
  });

  it('never lets a soon-world carry map stops', () => {
    const body = /const WM_PATHS = \{([\s\S]*?)\n\};/.exec(html)![1];
    const heads = [...body.matchAll(/^  (\d+): \[/gm)].map((h) => Number(h[1]));
    const ranges = [...html.matchAll(/from: (-?\d+), to: (-?\d+) \}/g)].map((m) => ({ from: Number(m[1]), to: Number(m[2]) }));
    for (const n of heads) expect(ranges[n - 1].from).toBeGreaterThanOrEqual(0);
  });
});
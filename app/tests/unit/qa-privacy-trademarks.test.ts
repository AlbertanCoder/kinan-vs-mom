import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/* QA 2026-10-28 (MAJOR x2): the repo is public. No street or home-location detail of the family
   (the streets around Shad's place, Kinan's house and the old route to them) and no trademark the
   game has no right to show (the toy-brick brand, the mall's theme park) may sit in the game's files —
   code, comments, level data, map data, subtitles or the classic stages' clip index. Real landmarks
   and public streets Shad asked for stay (West Edmonton Mall, Whyte Ave, Broadway, ...), and so does
   the map label SHAD'S PLACE (Shad's choice; the map shows no street). This file must not print the
   words either, so the street names are spelled backwards and the brand words are broken with [ ]. */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const back = (s: string): string => s.split('').reverse().join('');
const BANNED: [RegExp, string][] = [
  [new RegExp(back('sdrahcrO'), 'i'), 'a street by Shad\'s place'],
  [new RegExp(back('dlywlydI'), 'i'), 'a street by Kinan\'s house'],
  [/\b92 ?(St|Street)\b/i, 'the road to Shad\'s place'],
  [new RegExp(back('evirD egelloC'), 'i'), 'the route to school'],
  [new RegExp(back('evirD elcriC'), 'i'), 'a road by Kinan\'s house'],
  [/\bLe[g]o\b|\bLE[G]O\b/, 'a trademark (the lowercase foe id is code, never shown)'],
  [/Gala[x]y ?land/i, 'a trademark'],
];
/* everything the game ships and shows: the page, the levels, the maps, the 3D levels, the story
   subtitles and the classic stages' clip index (packed models / vendored three.js are binary blobs) */
const SKIP = /(^|\/)(vendor|node_modules)(\/|$)|w12_models\.js$|3d\/assets\/models\.js$/;
function files(dir: string, ext: RegExp): string[] {
  const out: string[] = [];
  for (const name of readdirSync(join(ROOT, dir))) {
    const rel = dir + '/' + name;
    if (SKIP.test(rel)) continue;
    if (statSync(join(ROOT, rel)).isDirectory()) out.push(...files(rel, ext));
    else if (ext.test(name)) out.push(rel);
  }
  return out;
}

describe('QA fix: privacy and trademarks in the shipped files', () => {
  const shipped = [
    'index.html', 'sw.js', 'manifest.webmanifest', 'README.md', 'audio/lines/lines.js', 'audio/vo2/clips.json',
    ...files('levels', /\.js$/), ...files('map', /\.js$/), ...files('3d', /\.(js|html)$/),
  ];
  it('covers the game files (sanity: the scan really reads them)', () => {
    expect(shipped).toContain('map/worlds/w04.js');
    expect(shipped).toContain('map/worlds/w01.js');
    expect(shipped).toContain('levels/w01/l01.js');
    expect(shipped.length).toBeGreaterThan(70);
  });
  it('no family street names and no trademark words anywhere in them', () => {
    const hits: string[] = [];
    for (const f of shipped) {
      const lines = readFileSync(join(ROOT, f), 'utf8').split('\n');
      lines.forEach((line, i) => {
        for (const [re, why] of BANNED) if (re.test(line)) hits.push(`${relative(ROOT, join(ROOT, f))}:${i + 1} ${why}: ${line.trim().slice(0, 90)}`);
      });
    }
    expect(hits).toEqual([]);
  });
  it("keeps what Shad asked for: the SHAD'S PLACE label, West Edmonton Mall, Whyte Ave, Broadway, the generic theme park label", () => {
    const w04 = readFileSync(join(ROOT, 'map/worlds/w04.js'), 'utf8');
    const w01 = readFileSync(join(ROOT, 'map/worlds/w01.js'), 'utf8');
    /* World 4's map no longer traces the route from Shad's place out of the city (the QE2 south) */
    expect(w04).not.toMatch(/\bQE ?(2|II)\b/);
    expect(w04).toContain("\"SHAD'S PLACE\"");
    expect(w04).toContain("'WEST EDMONTON MALL'");
    expect(w04).toContain("'THEME PARK'");
    expect(w04).toContain('WHYTE AVE');
    expect(w01).toContain("'BROADWAY AVE'");
  });
});

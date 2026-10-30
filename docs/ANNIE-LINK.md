# Annie's link (World 9 extra, Shad 2026-10-29)

Annie's own link to the game. It opens straight into World 9 (Montreal):

https://albertancoder.github.io/kinan-vs-mom/?world=9&guest=annie

Shad shares this link himself. Nothing in the game shows it, names it or points to it.

## What it does
- **Its own save.** The link saves under `kinan-remaster-annie-v1` (and its backup
  `kinan-remaster-annie-v1-backup`). On a shared device, Kinan's main save
  (`kinan-remaster-v1` and its backup) is never read or written by it.
- **Starts in World 9.** The first time it opens, the save has every World 1-8 level counted as done
  (their castles, escapes and belts too, plus the pets those worlds rescue) and stands on World 9's
  first map stop.
- **The World 9 opening.** The first PLAY plays World 9's opening: the lines of Glitchy's train ride
  into Montreal while the camera follows him stop to stop across World 9's map, then back to Kinan on
  stop 1. It plays once per save and can be skipped (tap, any key, or SKIP).
- **After the 9-castle.** Back on the map (after the boat escape and the belt), a friendly box says
  "You beat World 9! Thanks for playing!" with a **Play the whole game from World 1** button. The
  button opens the same game without the link's two words, on the normal (main) save.
- Start over (title screen) on the link puts its own save back to World 9, stop 1.

## Notes
- Both words are needed: `?world=9&guest=annie`. Either one alone opens the normal game.
- The link only works once this branch (feature/worlds-6-10) is on the live site.
- Code: index.html, search `ANNIE'S LINK`. Tests: app/tests/e2e/w9-extras.spec.ts.

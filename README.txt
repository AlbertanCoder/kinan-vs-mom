KINAN vs. MOM — Birthday Remaster (online / installable build)
============================================================

PLAY
  Open index.html through any web server, or use the hosted URL.

INSTALL ON IPHONE / IPAD
  1. Open the link in Safari.
  2. Tap Share (square with the up arrow).
  3. Scroll down → Add to Home Screen → Add.
  It opens full-screen and works offline after the first load.

INSTALL ON ANDROID / TABLET
  1. Open the link in Chrome.
  2. Menu (⋮) → Install app (or Add to Home screen).

WHAT IS IN THIS FOLDER
  index.html                 the whole game (fonts embedded, no external assets)
  manifest.webmanifest       makes it installable
  sw.js                      offline cache (bump CACHE for a new version)
  icons/                     home-screen icons
  robots.txt                 keeps it out of search engines
  netlify.toml               headers if you host on Netlify

HOST IT YOURSELF (30 seconds)
  Option A — Netlify Drop
    Drag this entire folder onto https://app.netlify.com/drop
    You get a link immediately. No build step.

  Option B — GitHub Pages
    Push this folder to a repo, then Settings → Pages →
    Deploy from a branch → main → / (root).

UPDATING
  Replace index.html with a newer build, then change
  `const CACHE = 'kinan-vs-mom-v1'` in sw.js to v2 so devices fetch it.

CONTROLS
  Keyboard: ← → move · SPACE jump (hold = higher) · X pow · P pause · M mute
  Touch: on-screen buttons · Gamepad: supported

SAVES
  Progress (stars, pets, hats, best times) is stored on the device.
  "Start over" on the title screen clears it.

PRIVACY
  No analytics, no ads, no network calls at runtime. The game is one file.

# Kinan vs. Mom — Birthday Remaster

An expanding birthday platformer made by Shad for Kinan.

**Play online:** https://albertancoder.github.io/kinan-vs-mom/

- Original five worlds plus Vancouver, LEGO Brick Realms, prehistoric dinosaurs, Starbase & Annie’s Arrival, the Birthday Multiverse, and the Glitch — eleven worlds in all
- 4 cats and 2 dogs to rescue — equip one cat and one dog, or go solo; only equipped pets follow and grant their perks.
- Stars, hats, best times, combo scoring, touch + keyboard + gamepad
- Installable on iPhone, iPad, Android and tablets; works offline after the first load
- One self-contained HTML file: no external fonts, images or trackers

## Install it like an app

**iPhone / iPad (Safari)** — Share → Add to Home Screen → Add.
**Android / tablet (Chrome)** — Menu → Install app.
It then opens full-screen and runs offline.

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move | ← → / A D | ◀ ▶ |
| Jump | Space / ↑ / W (hold = higher) | JUMP |
| Pow | X / J | POW |
| Friend Assist | E | FRIEND |
| Pause | P / Esc | ⏸ |

Phones and tablets use landscape gameplay. Portrait shows an upright rotate-device prompt and pauses play; the page itself never rotates.

## Run it locally

Open `index.html` directly, or serve this folder with any static server
(the service worker and install prompt need http/https).

## Notes

- Progress is saved on the device (stars, pets, names, hats, best scores), with a verified last-known-good backup and automatic recovery from a damaged current save.
- `robots.txt` and a `noindex` meta tag keep the page out of search engines.
- No analytics, no ads, no network calls at runtime.

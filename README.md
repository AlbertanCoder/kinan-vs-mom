# Kinan vs. Mom — Birthday Remaster

A birthday platformer made by Shad for his little brother Kinan's 11th birthday.

**Play online:** https://albertancoder.github.io/kinan-vs-mom/

- Five worlds across Canada so far: Saskatoon, School, Dad's Oilfield, Edmonton and the Calgary Stampede (55 levels, 10 bosses)
- An animated opening, and a cutscene after every world as Glitchy escapes into the next one; more worlds are coming
- Pets to rescue (one cat and one dog at a time), candles and golden candles, voiced story lines
- One Menu button; everything unlocks by playing
- Plays on iPhone, iPad, Android, tablets and computers (touch, keyboard or gamepad); works offline after the first load

**Support future worlds:** if you'd like to help, there's a Ko-fi page: https://ko-fi.com/albertancoder. The game is free and always will be.

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
| Menu / pause | P / Esc | ☰ MENU |

Phones and tablets play sideways. Held upright, a level pauses behind a rotate screen with a "Play sideways" button (Android) and help for a locked screen; menus and the map work upright.

## Run it locally

Open `index.html` directly, or serve this folder with any static server
(the service worker and install prompt need http/https).

## Notes

- Progress is saved on the device (stars, pets, names, hats, best scores), with a verified last-known-good backup and automatic recovery from a damaged current save.
- `robots.txt` and a `noindex` meta tag keep the page out of search engines.
- No analytics, no ads, no network calls at runtime (the Ko-fi link only opens when you tap it).

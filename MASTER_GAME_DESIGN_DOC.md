# Kinan vs. Worlds — Master Game Design Document

**Status:** Discovery complete (100/100 answers); implementation has not started.
**Created:** 2026-10-25
**Implementation branch:** `overhaul/staging`
**Live production:** GitHub Pages from `main` / root
**Audience:** Kinan, age 11, with desktop, controller, tablet, and phone play.

This is the controlling design and safety document for the ground-up overhaul. It supersedes the earlier World 6 spherical-gravity roadmap and all wizard-school/spell/potion choices. Where an item is explicitly listed as deferred, do not silently invent an answer during implementation.

## 1. Repository and Handoff State

- Repository: `C:\Users\SHADHUNTER\Desktop\Kinan vs. Mom`.
- `origin/main` was last observed at `db99047` and represents the last-known live baseline.
- Local `main` remains at `ebff64a`, one commit ahead of that baseline; it was not pushed, reset, or otherwise modified during discovery/handoff.
- `archive/world6-experiment` preserves `ebff64a`, including the unpublished 3D work and its 26-test mocked smoke harness.
- `overhaul/staging` was created from `origin/main`; the overhaul design document is added here before any production game code.
- The Desktop handoff prompt is `C:\Users\SHADHUNTER\Desktop\KINAN_VS_WORLDS_OVERHAUL_KICKOFF_PROMPT.md`.
- No production deployment, remote branch change, or live `main` merge is authorized by this document.

## 2. Non-Negotiable Safety and Scope Rules

1. Never push directly to live `main`. Use isolated feature branches into `overhaul/staging`, then protected pull requests only after required checks, explicit user playtest approval, and a tagged rollback point.
2. Use Netlify previews for staging/pull requests; production remains on GitHub Pages. External connections must be authenticated and verified rather than assumed.
3. Quarantine the old 3D implementation. Remove eager loading, World 5/World 6 transitions, and public debug entry points from the new runtime. Preserve the experiment only for reference behind a developer-only flag.
4. Worlds 1–10 are polished 2D. Only World 10 completion triggers the one-time World 11 dimensional shift. World 11 uses flat-plane gravity, never spherical gravity.
5. No Harry Potter, wizard-school, house-sorting, spell-kit, or potion content is in active scope. Earlier answers selecting those ideas are void.
6. Keep the game installable and offline-capable. Bundle dependencies/assets; no runtime CDN, cloud TTS, analytics, ads, trackers, or required account.
7. Use **Kinan** in player-visible text. Never display his surname. “Keenan” was a speech-to-text error. Do not publish real school branding, private addresses, private disputes, or reference photos.
8. Use original art and music. Franchise interests are inspiration, not permission to copy commercial assets, film frames, songs, or exact set replicas.
9. Every milestone requires automated checks, zero console/page errors, measured performance, mobile checks, preview playtesting, and explicit user confirmation before the next milestone. Production merges require separate approval.
10. Do not claim a device, browser, frame rate, or visual result was tested when it was not. Mark unavailable coverage as unverified.

## 3. Phase 1 Audit Findings

- The original game is a roughly 14,000-line `index.html` monolith: custom Canvas 2D, inline CSS/JS, procedural WebAudio, PWA caching, plus custom WebGL files. It is not Phaser or Three.js.
- The original five 2D worlds contain 51 stages; the old World 6 adds one 3D stage and Worlds 7–11 are placeholders. Kart, brawl, and level-builder modes also live in the monolith.
- `galaxy3d.js` and `galaxy3d-models.js` are eagerly loaded in the old code. `index.html` hands off after the rainy-world finale and through World 6/debug links.
- Old 3D gravity is planet-centered in `galaxy3d.js:564-703`; this conflicts with the new flat-plane roadmap.
- Tree rendering is around `galaxy3d.js:1362-1373`; the Blender source creates Z-axis trunks at `tools/blender-models.py:114-117` while the runtime rig assumes Y-up.
- Character rendering/face texture is around `galaxy3d.js:765-805,987-1012`; cylindrical UV export is at `tools/blender-models.py:65-66`. Real-browser visual validation was not performed.
- Twenty-nine MP3s exist, but `tools/vo-generate.ps1` uses Microsoft SAPI voices and browser `speechSynthesis` fallback remains at `index.html:767-824`.
- Every rescued old pet spawns and grants perks simultaneously (`index.html:2549-2558,2900-2951`); there is no equipped-loadout state.
- Old 2D uses fixed 60 Hz updates, coyote time, jump buffering, keyboard/gamepad, multitouch Pointer Events, and problematic forced-rotation CSS.
- Saves use `localStorage["kinan-remaster-v1"]`, with legacy `k11v3` migration and array/index-based progression. There is no explicit schema version.
- No repository-local CI or package-based browser runner was found. The archived 3D smoke test passed 26/26 using mocked DOM/WebGL; that does not verify actual rendering, touch, FPS, or physics quality.
- `docs/KINAN-VS-WORLDS-TECHNICAL-PLAN.md` and the Desktop handoff are historical references, not controlling scope. Blender is not installed on this machine.

## 4. Technical Architecture

### 4.1 Runtime and Code Organization

- Worlds 1–10: **Phaser 3 + TypeScript + Vite**.
- World 11: **Three.js**, loaded only after its unlock or an explicit developer preview, behind a clean engine boundary.
- Share versioned progression, loadouts, settings, dialogue metadata, asset manifests, and unlock events through engine-independent modules. Neither engine may silently write another engine’s private state.
- Use stable string IDs for worlds, stages, characters, pets, audio, and objectives; never use array position as a permanent save identity.
- Pin dependencies through project manifests and bundle them for offline use. Do not add another framework without approval.

### 4.2 Movement, Physics, and Input

- 2D uses a fixed-timestep custom character controller with Arcade collision queries, swept collisions, coyote time, jump buffering, variable jump height, and deterministic replay fixtures. Do not use unconstrained rigid-body physics for Kinan.
- Standard boss verbs are movement, head-stomps, POW, abilities, and authored context interactions. Do not introduce a new button during a boss without prior safe teaching.
- Use one action map for keyboard, gamepad, and touch: remapping, hot-plugging, dead zones, correct glyphs, pause handling, and optional vibration.
- Touch uses an adjustable left D-pad and right **Jump / Ability / Context Action** buttons, with multitouch, sliding presses, optional haptics, resizing, and repositioning. Friend Assist’s final gesture mapping is a deferred UI detail and must not compromise these controls.
- Landscape is the gameplay orientation. Portrait shows an upright rotate-device prompt; never rotate the DOM. Scale/letterbox the stage, honor safe areas, and offer fullscreen.

### 4.3 Performance and Compatibility

- Target 60 fps on representative desktop, tablet, and phone hardware; provide a stable 30 fps low-power fallback and automatic quality tiers.
- Test current Safari, Chrome, Edge, and Firefox as available, with zero console/page errors.
- Bound particles, projectiles, debris, followers, and simultaneous audio. No unlimited brick physics, enemy spawns, or complaint bubbles.
- Large audio/art/3D assets use versioned packs and measured loading/memory budgets. Exact budgets are established from the vertical slice rather than fabricated now.

## 5. Art, Animation, and Audio

### 5.1 Kinan and 2D Art

- Use original high-resolution 2D cartoon art, light anime-inspired expressions, bold outlines, smooth animation, and richly layered painted backgrounds.
- Kinan’s likeness is based on reference photos/details supplied and approved by the user. References are for authoring only and are never shipped.
- Default outfit: refined red star-emblem T-shirt, blue jeans, and sneakers. Unlockable toy-brick, dinosaur, sci-fi, and family-themed costumes are cosmetic and do not change collision geometry.
- Use expressive hand-authored animations for idle, run, skid, crouch, jump/fall, landing, abilities, interactions, damage, celebrations, and cutscenes. Gameplay simulation remains 60 Hz; use subtle squash-and-stretch without harming timing.

### 5.2 World 11 Art

- Match the approved 2D style with polished stylized 3D, controlled UVs, proper hair/clothing, rounded jointed rigs, authored animation, clean silhouettes, and richly textured flat-plane environments.
- Do not ship primitive stand-ins as final characters, duplicated faces, or uncorrected Blender-axis models. Blender is currently unavailable; the asset-authoring pipeline must be verified before World 11 production.

### 5.3 Voice, Music, and Effects

- Important dialogue uses reviewed, pre-generated neural voice assets shipped locally. Repeated barks use polished character sounds. Provide synchronized text, subtitles, and no runtime TTS dependency.
- Cast distinct licensed stock voices with age-appropriate expressive performances. No real-person voice cloning or accent imitation without explicit consent.
- Use original cinematic/cartoon/chiptune/world-specific adaptive music, boss layers, voice ducking, and local SFX. Annie’s music is an original bhangra/dhol-inspired composition reviewed by Annie or a knowledgeable contributor.
- Provide separate music/SFX/voice sliders, persistent mute settings, captions, and safe audio initialization after user interaction.

## 6. Companion Collection and Loadout

- Kinan may equip **one cat AND one dog**, or go solo. Swapping is allowed at title/map, home, and checkpoints; it locks during boss attempts and challenge rooms.
- Only equipped pets follow during play. Each has a passive and automatic contextual signature action with clear cooldowns. Pets do not block Kinan, use smart spacing/teleport recovery, and hide during cutscenes.
- One optional Friend Assist slot holds either Milo or Aiden; only one is equipped/called at a time.
- The same collection and rules carry into World 11. Unequipped pets appear as Observatory hub/festival characters rather than extra followers.

### 6.1 Real Pet Roster and Exact Abilities

| Pet | Real identity | Unlock | Locked mechanics |
|---|---|---|---|
| **Garfield** (provisional name) | Youngest orange tabby; playful kitten energy | World 1, Bedroom Chaos | **Kitten Zoomies:** one extra air jump; after three clean landings, a 2.5-second run-acceleration boost with a 15-second cooldown. |
| **Chikastino** | Boxer/border collie mix; mostly white with brown patches and a *Little Rascals*-like look; barks at neighbours/passersby | World 1, neighborhood | **Neighbourhood Watch:** early warning for off-screen enemies/projectiles; automatic bark volleys briefly stun nearby normal enemies and add limited boss stagger, 14-second cooldown. |
| **Vader** | Small, kitten-like, extremely curious cat named after Darth Vader; coat color not specified | World 2, school | **Curious Force:** outlines nearby secret blocks/interactables; every 8 seconds pulls visible out-of-reach coins/drops, never puzzle keys or objectives. |
| **Hunter** | Border-collie appearance, possibly German Shepherd mix; shy and runs away | World 3, camp | **Courage Fetch:** retrieves nearby healing drops; once per level at one heart, runs off-screen and returns after six seconds with a one-heart snack. |
| **Duchess** | Regal long-haired white-and-brown cat; always hungry and lazy | World 4, restaurant | **Royal Snack Break:** food restores one additional heart; once per activated checkpoint, an injured Kinan can rest for a snack restoring up to two hearts; disabled in bosses/challenges. |
| **Tuxedo** | Black cat with white paws and white V-shaped chest; oldest and cranky | World 5, Stampede | **Senior Glare:** 20% less knockback; every 16 seconds interrupts one charging normal enemy for two seconds, with only brief, diminishing boss stagger. |

### 6.2 Fictional School Friends

- **Milo:** brick-building classmate unlocked in World 2. Once every 25 seconds, Kinan can call him to build a temporary platform or staircase for eight seconds. In the toy-brick world he also unlocks optional bonus recipes.
- **Aiden:** Sporty classmate unlocked in World 2. Once per checkpoint, he appears briefly with a healing snack and distracts nearby enemies for three seconds. He has special narrative opportunities in playground and Bronco encounters.

## 7. Kinan’s Interests, Food, and Humor

- **Toy bricks:** Star Wars, Super Mario, Horizon, and probably fire trucks (tentative); no exact sets were confirmed. Use authored quick-build recipes at build pads, collectible bricks, bridges/stairs/ladders/ramps/shields/fire-truck equipment, destructible bounded chunks, rebuildable objectives, hinges/gears/water routes, and shape-plus-stud cues. No unrestricted voxel building.
- **Star Wars:** Original-trilogy inspiration—Luke, Darth Vader, Yoda, droids, stormtroopers, X-wings, and space-station locations. Kinan uses a rechargeable Energy Blade for timed laser deflection and Force pull/push on marked objects. Combat is cartoon-stunning/dismantling with no gore.
- **Dinosaurs:** T-Rex, Triceratops, Velociraptor, Brachiosaurus, Ankylosaurus, and Stegosaurus have distinct roles. Include fossil assembly, baby rescue, short herbivore rides, species-specific routes, Raptor line-of-sight/decoy puzzles, and checkpointed T-Rex chases. Most dinosaurs are friends or misunderstood, not targets to injure.
- **Other play:** Exploration, collecting, secrets, machine/robot encounters, and light environmental puzzles connect Mario and Horizon. School/hobby details emphasize science, space, dinosaurs, machines, computers, and building.
- **Food:** Cookies and chicken nuggets restore one heart; pepperoni pizza restores one heart plus ability energy; cheeseburgers restore two hearts; milkshakes refill the ability meter; rare birthday cake fully heals and grants five seconds of invincibility.
- **Humor:** Use confirmed pet antics, angry toy-brick/socks, dinosaur chaos, machine mishaps, favorite food, and genre crossovers. Use affectionate slapstick and harmless broccoli/slime gross-out moments, followed by reconciliation. No private conflicts, cruel humiliation, ethnic stereotypes, or jokes about real bodies/appearance.
- **Ultimate payoff:** A playable crossover birthday festival with family, all six pets, Milo and Aiden, favorite foods, fireworks, attractions from every world, a group photo, and joyful credits—no final combat.

## 8. Worlds 1–10 Blueprint

Baseline scope is four focused story stages, one boss stage, and one optional challenge per world. Special midboss/finale encounters are listed explicitly. Quality and uniqueness take priority over padding.

### World 1 — Saskatoon Home & Neighborhood

- **Stages:** Bedroom Chaos; House Hijinks; Front-Yard/Neighborhood; Backyard Party; Mom boss; optional challenge.
- **Mechanics:** Teach through play with sock sorting, toy-brick bridge builds, cake/candle sequences, and fence/gate routing. Introduce Mom, Robin, pets, and neighbours.
- **Unlocks:** Garfield in Bedroom Chaos; Chikastino in the neighborhood. The neighbour’s wife has a healing cameo.
- **Boss content:** Fence-Line Feud midboss and Mom’s two-phase Birthday Room Inspection.

### World 2 — Fictionalized Saskatoon School

- **Stages:** School Street/Bus Stop; Classroom & Science Lab; Gym & Fire-Safety Visit; Playground Games; boss; optional challenge. No real school name, logo, staff identity, or layout.
- **Mechanics:** Hands-on circuits/magnets, simple machines, toy-brick fire-truck ladder/hose routing, safe obstacle courses, dodgeball timing, and soccer bank-shot puzzles.
- **Unlocks:** Vader, Milo, and Aiden. Vader scouts secrets, Milo assists builds, and Aiden supports play.
- **Boss content:** A two-phase principal Bell Schedule Challenge and a three-round goalie match. Exact placement within the stage flow is a level-design detail, not permission to increase scope silently.

### World 3 — Robin’s Alberta Work Trip

- **Stages:** Highway & Camp Breakfast; Pumpjack Plains; Hydro Vac Yard & Pipe Rack; Stormy Night Shift; Safety Foreman boss; optional challenge.
- **Mechanics:** Fictional hydro-vac suction/airflow, pipe routing, mud traction, safe platforms around stopped machinery, safety-lock switches, and storm/wind telegraphs. Never simulate unsafe real operation.
- **Unlocks/roles:** Hunter is rescued at camp. Robin, Kinan’s stepdad, is a major Saskatoon/home-hub ally and worksite guide with hydro-vac assists.

### World 4 — Edmonton Family Trip

- **Stages:** Road to Edmonton/River Valley; Mega Mall Waterpark & Ice Rink; Chenoa’s Restaurant Rush; Whyte Ave to High Level Bridge; Chenoa boss; Shad’s optional construction challenge.
- **Mechanics:** Water-slide routes/currents, ice momentum, plate-stack/order-symbol logistics, conveyor kitchens, harmless aromatic-spice wind, and a small dhol-rhythm mechanism foreshadowing Annie.
- **Unlocks/roles:** Duchess is rescued at the restaurant. Shad assists Kinan. Annie’s friendly rivalry with Chenoa and Mom begins through calls, posters, and kitchen chaos.

### World 5 — Calgary Stampede

- **Stages:** Stampede Parade & Pancake Breakfast; Junior Rodeo Games; Midway & Chuckwagon Track; Grandstand Show; Bronco boss; optional machine/fossil exhibition challenge.
- **Mechanics:** Pancake-flip timing/springy griddles, parade rhythm gates, marked-object lasso pulls, chuckwagon routes, ricochet carnival games, and moving barrels. Animals are partners or misunderstood.
- **Unlocks:** Tuxedo is rescued from the noisy festivities. The exhibition foreshadows machines, fossils, and later worlds.

### World 6 — Vancouver & the Rain

- **Stages:** Sea-to-Sky/Suspension Bridge; Stanley Park & Seawall; Granville Island & Science World; SkyTrain/Big Storm; Drizzle boss; optional challenge.
- **Mechanics:** Limited umbrella gliding, redirected rain/waterwheels, puddle-wave timing, banana-slug traction, market pulleys, magnets/circuits, and transit route puzzles. Reduced rain/flash intensity is available; weather never hides hazards.
- **Ending:** Drizzle’s rainbow and a 2D postcard lead to World 7. There is no early 3D handoff.

### World 7 — The Brick Realms

- **Stages:** The Great Brick Bin; Fire-Truck Brick City; Horizon-inspired Machine Brickwilds; Studded Skyscraper Tower; 2D BRICK-REX boss; optional Super Mario-inspired brick-remix challenge.
- **Mechanics:** Shape/stud-coded recipes, hinges, gears, ladders, water routes, machine-part overrides, bounded authored debris, and rebuildable objectives. Milo unlocks optional bonus recipes.
- **IP boundary:** Use original brick builds and original artwork, not copied commercial models or set instructions.

### World 8 — Prehistoric Dinosaur Adventure

- **Stages:** Badlands Fossil Dig; Fern Jungle & Baby-Dino Rescue; Brachiosaurus River & Triceratops Trails; Raptor Canyon/T-Rex Nest; nonlethal Alpha T-Rex encounter; optional Stampede-dino remix.
- **Mechanics:** Fossil routes, temporary contextual species friendships, short herbivore rides, Triceratops block charges, Brachiosaurus moving platforms, Ankylosaurus tail switches, Stegosaurus bridges, Raptor sight/decoy puzzles, and checkpointed pursuits with retry assists.

### World 9 — Star Wars & Annie’s Arrival

- **Stages:** Twin-Sun Outpost; Droid Factory & Hangar; Starbase Laser Corridors; X-Wing-inspired 2D trench run; Annie’s Galactic Kitchen boss; optional Vader-the-cat challenge.
- **Mechanics:** Safe deflection tutorials before real lasers, Force-marked crates/doors/switches, readable droid patrol/alert/stunned states, magnetic conveyors, and flat-plane low-gravity sections. No spherical gravity or 3D exception.
- **Narrative:** Annie’s arrival pays off the Worlds 4–8 buildup. She is Shad’s welcomed girlfriend and a heroic rival, not an irredeemable villain.

### World 10 — The Birthday Multiverse

- **Stages:** Four compact stages remix earlier locations/interests, followed by separate Grandmothers and Mom boss stages and an optional challenge. There is no wizard school, house system, spell kit, or potion content.
- **Mechanics:** Purposeful remix chambers use previously taught rules. Any final-world action is taught safely first. Checkpoints precede bosses, direct boss retries are available, and repeated losses offer optional assists. No mandatory boss rush.
- **Finale:** Mom’s three phases are Ultimate Multi-Tasker, World-Remix Gauntlet, and Birthday Rift. Her defeat completes World 10 and triggers the dimensional event.

## 9. Boss Design and Family Lore

### 9.1 Global Rules

- Use two or three compact learnable phases, clear audiovisual telegraphs, bounded projectiles, and roughly three-to-five-minute fights where practical. Do not use health sponges or surprise one-hit mechanics.
- Adventure is the default. Story assists offer clearer telegraphs, slower projectiles, and extra hearts; Challenge unlocks after first clear. Repeated losses trigger a no-shame assist offer.
- Unlock phase practice and boss replays. Main progression never requires no-hit play; no-hit rewards are optional cosmetics.
- Family and animal encounters end nonlethally, usually through skill, puzzles, understanding, or reconciliation.

### 9.2 Early Bosses

- **Mom, Room Inspector (W1):** Sort runaway socks and stomp animated laundry piles while dodging telegraphed baskets, sweeping gusts, and toy blockades. Win the inspection, then receive Mom’s proud hug.
- **Rude Neighbour (W1):** Sprinkler surges, leaf-blower gusts, and toy-gnome bowling. Chikastino can interrupt him; his wife offers cookie heals; he ultimately joins the party. Never publish his real identity or disputes.
- **Principal (W2):** Bell-wave patterns, hall-pass switches, desk platforms, and simple rhythm signals restore school routine. The fictional principal congratulates Kinan.
- **Goalie (W2):** Three rounds of telegraphed kicks/saves, ball waves, bank shots, and switch-opened lanes. Aiden can distract briefly. Kinan wins through soccer, not violence, and earns the goalie’s respect.
- **Safety Foreman (W3):** Cone patterns, caution-tape gates, safety-lock switches, and timed inspections form a fictional safety-puzzle boss. Robin remains a caring ally, not a villain.
- **Chenoa (W4):** Three phases—return plates with POW; dodge ground-pound shockwaves/moving order stations; survive a restaurant-rush remix. She is open to a cartoon head-bounce only after a clearly missed slam. Shad supplies build assists; she ends with a proud hug.
- **Bronco (W5):** A checkpointed chase, grandstand charges that break hay targets/noisy machines, and a music/safe-gate fireworks-calming sequence. Bronco is frightened and lonely, then becomes Kinan’s friend.
- **Drizzle (W6):** Rain lanes, umbrella-wind gusts, and warned lightning zones. Kinan redirects rain into flowers and activates sun lamps, then shows Drizzle the rainbow and befriends him.

### 9.3 Late Bosses and Family Finale

- **BRICK-REX (W7):** Phase 1 uses tail sweeps/turbo stomps and head-bounce openings; Phase 2 has at most four POW-deflectable brick bombs; Phase 3 exposes the Heart of the Blocks for quick-built ramps/extractors. End with harmless bricks and blinking googly eyes.
- **Alpha T-Rex (W8):** A checkpointed chase, then roar/tail/charge patterns in a nest arena. Kinan uses decoys and switches to free and return her baby, calming the protective parent instead of depleting a health bar.
- **Annie (W9):** Phase 1 deflects golden rotis into serving switches; Phase 2 matches dhol beats to vent harmless aromatic masala clouds and slow her power-up; Phase 3 completes a galactic cook-off with conveyors and head-bounces between glowing prep stations. Chenoa and Mom comment on their friendly rivalry; Annie congratulates Kinan enthusiastically.
- **Annie’s presentation:** Use “Annie” normally and “Amandeep” in formal introductions/credits. She is warm, competitive, clever, heroic, and Shad’s girlfriend. Food art and original bhangra/dhol-inspired music require Annie/knowledgeable review. No accent imitation, religious jokes, or sacred symbols as weapons.
- **Grandmothers (W10):** Two distinct looks, voices, and specialties appear in solo phases, followed by a checkpoint and coordinated tag-team finale. Use shared team meters, not two health sponges. Address each as “Grandma” unless preferred names are supplied.
- **Grandmothers’ attacks:** A steady but capped stream of complaint bubbles pushes Kinan and can be popped with POW; fantasy cane/walker boomerangs have safe return lanes; giant cheek-pinch/hug-and-kiss zones have clear warnings and escape windows. Kinan finally accepts one enormous affectionate hug. Never mock real disability or use endless unskippable audio.
- **Mom (W10):** Ultimate Multi-Tasker combines laundry baskets, order tickets, sweeping gusts, and sorting counters. World-Remix Gauntlet briefly combines rain, conveyors, roti deflection, and toy-brick barriers. Birthday Rift uses candle sequences, present shields, and telegraphed “Mom Radar” markers before the affectionate resolution.
- **Family motive:** A birthday anomaly caused the chaos. Family battles are playful challenges or protective tests. Mom fears Kinan is not ready, then chooses trust. Shad guides/builds, Robin supports, and Chenoa/Annie become teammates. The later 3D shift surprises everyone; it was not Mom’s intentional doing and the adventure is not “only a dream.”

## 10. World 11 — Dimension 11

### 10.1 Scope and Progression

- Use flat-plane gravity and a Birthday Observatory hub with three compact courses: **Saskatoon Skyline**, **Brick & Bone Island**, and **Starbase Playground**, followed by a final anomaly encounter. All 2D worlds remain accessible.
- Movement: fixed world-up gravity, analog walk/run, variable jump, spin/POW, long jump, ground pound, air control, coyote time, jump buffering, and safe ledge recovery.
- Camera: smart follow plus right-stick/swipe orbit, recenter, sensitivity and inversion settings. No forced camera motion or spherical gravity.
- Include **11 Power Stars**: three per course (nine), one hub secret, and one finale star. The anomaly finale opens at eight stars. Everyone who finishes it unlocks the playable birthday festival; all 11 add optional golden photo/cosmetic rewards.
- Preserve the same pet/friend collection and loadout. Adapt abilities with 3D ranges/telegraphs and safe follow/teleport recovery. Unequipped pets socialize in the hub/festival.

### 10.2 Permanent UI Evolution

- World 10 completion unlocks **Kinan vs. Worlds: Dimension 11** branding, a lightweight 3D Observatory title diorama, separate 2D Worlds and 3D Dimension tabs, camera/graphics settings, and festival/gallery access.
- Provide a static lightweight title fallback when WebGL is weak or unavailable. Never delete or hide old 2D saves/worlds behind a mandatory 3D title.

### 10.3 Transformation Cinematic

Target 45–60 seconds: quiet birthday victory -> dimensional tremor -> the flat world unfolding into flat-plane 3D -> Kinan inspecting his hands/turning around -> **Kinan vs. Worlds: Dimension 11** title and Observatory landing.

Use pre-generated VO, subtitles, tap-to-advance, skip after three seconds, reduced motion, and gallery replay. The core approved script is:

> **KINAN:** “We did it! …Why can I see the BACK of my house?!”
> **MOM:** “Kinan, stay close!”
> **KINAN:** “WHAT IS GOING ON HERE?! My hands are 3D! …Okay, that’s cool—BUT WHAT?!”
> **ANNIE:** “Definitely not in the recipe.”
> **CHENOA:** “Little bro, don’t touch anything!”
> **ROBIN:** “One dimension at a time, guys.”
> **SHAD:** “Welcome to your eleventh birthday, bud.”

The tone moves from comic panic to wonder, not sustained horror.

## 11. Save Migration, Unlock Transactions, and Offline Updates

### 11.1 Save Format and Migration

- Add `schemaVersion` and stable string IDs. Preserve progression, pets, custom names, settings, scores/times, unlocks, and custom content where possible.
- Migrate both `kinan-remaster-v1` and legacy `k11v3`; keep old keys until migrated data is validated and a last-known-good backup succeeds.
- Use recoverable backup slots and validation. Provide local save export/import without an account. Never require cloud login or destroy old data during an upgrade.

### 11.2 World 11 Unlock Transaction

1. Immediately after Mom’s defeat, commit `world10Complete`, World 11 unlock, upgraded UI, and `pendingDimensionCutscene` **before** starting the cinematic.
2. Mark the cinematic seen on completion or skip. A crash/reload resumes from the pending event or the unlocked Observatory without losing the achievement.
3. Keep World 11 and upgraded UI unlocked on the static non-WebGL interface. Do not unlock production progress through a public URL parameter.

### 11.3 PWA and Updates

- Precache a small shell and World 1. Cache additional world/audio packs when played and offer a full-offline download with progress/storage estimates.
- Version every asset manifest. Prompt for updates between levels, never force mid-game reloads, and avoid runtime CDN dependencies.
- Test fresh install, upgrade, offline launch, interrupted downloads, cache rollback, and save migration together.

## 12. Accessibility and QA Acceptance

### 12.1 Mandatory Accessibility

- Subtitles/captions, scalable readable text, separate volume controls, reduced motion/flashes, adjustable shake, camera sensitivity/inversion/recentering, and color-plus-shape cues.
- Remapping, resizable touch controls, cutscene skip/replay, pause anywhere, and optional boss/puzzle assists.
- Never communicate essential information by color or audio alone. Accessibility settings do not block story, endings, or achievements.

### 12.2 Automated Gates

- Unit tests for physics, loadouts, progression, migrations, and unlock transactions.
- Deterministic replay fixtures and real-browser Playwright journeys in Chromium, Firefox, and WebKit: menus, saves, touch, bosses, cutscene recovery, and real WebGL.
- Fail on console/page errors. Add visual regression and automated accessibility checks, supplemented by manual review.
- Preserve the archived mocked 3D smoke test only as historical/reference coverage; it is not sufficient validation.

### 12.3 Real-Device Gates

- Test representative iPhone Safari, Android Chrome, tablet/iPad, and desktop browsers when hardware is available. Emulation supplements but does not replace real devices.
- Verify multitouch, orientation, safe areas, controllers, PWA install/offline, audio interruptions, resume, and measured 60 fps target/stable 30 fallback.
- Record device model, OS/browser, build, test date, evidence, and failures. Unavailable hardware is **unverified**, never “passed.”
- Kinan tests preview builds, not unvetted production releases.

## 13. Incremental Implementation Plan

- **M0 — Discovery/handoff (this step):** preserve archive, create staging, publish this design document and Desktop prompt. No production game code.
- **M1 — Safety foundation:** verify branch/preview protection, quarantine old 3D/debug paths, scaffold the approved TypeScript/Vite/Phaser testable shell, add CI/unit/browser/save-fixture gates. Stop for approval.
- **M2 — Shared kernel:** stable-ID saves/migration, input, accessibility settings, audio manager, asset manifests, and offline update skeleton. Stop for approval.
- **M3 — World 1 vertical slice:** one polished stage, core controller, Garfield/Chikastino loadout behavior, one puzzle, checkpoint/save, and a boss prototype. Validate feel before mass production.
- **M4 — World 1 complete:** remaining stages, bosses, art/audio, challenge, and full milestone QA.
- **M5–M13 — Worlds 2–10:** one isolated world at a time, including its companions, bosses, accessibility, saves, and real-device preview approval. Do not start the next world after a failed gate.
- **M14 — World 11 vertical slice:** only after Worlds 1–10 pass. Prove flat-gravity controller, camera, real 3D rendering, asset pipeline, and performance in one small course.
- **M15 — Dimension 11 complete:** unlock transaction, cinematic, permanent UI, three courses, 11 stars, pets, anomaly finale, and recovery tests.
- **M16 — Festival and release candidate:** playable celebration, full migration/offline/accessibility/device matrix, tagged rollback candidate, and explicit production approval.

Asset/audio production and world content may have smaller submilestones, but none bypasses approval. A failed sanity check blocks forward progress until fixed or explicitly rescoped by the user.

## 14. Deferred or Conditional Items (Do Not Invent Silently)

- **Garfield** is a provisional name for the youngest orange tabby; **Tuxedo** is the corrected spelling for the black-and-white cat.
- The Grandmothers’ preferred individual display names were not supplied; “Grandma” is acceptable until then.
- Kinan’s likeness references still require user-provided material and approval. No reference photos ship.
- Fire-truck interest is tentative; exact toy-brick set names were not supplied.
- Neural voice provider, exact licensed voices, and final casting require asset-stage selection/review; runtime API integration is not approved.
- Annie or a knowledgeable contributor must review cultural food/music/art details before final release.
- Friend Assist’s exact input gesture, World 2’s two-boss stage placement, World 11 anomaly mechanics, and detailed asset budgets are milestone-level design tasks.
- Blender is not installed. The World 11 model-authoring/export pipeline must be selected and proven before final 3D asset production.
- Netlify preview authentication, GitHub branch protection, required-check configuration, and real-device availability require verification/setup; none is claimed complete.
- Earlier wizard-school/sorting/spell/potion answers are removed, not deferred features.

## 15. Complete 100-Question Decision Log

This log records the final controlling interpretation. “Superseded” entries remain only to explain history.

| Q | Final decision |
|---:|---|
| 1 | **B:** Archive `ebff64a`; base `overhaul/staging` on last-known `origin/main`; selectively salvage only audited work. |
| 2 | **C:** Protected PR, required checks, explicit playtest approval, tagged rollback. |
| 3 | **B:** Netlify staging/PR previews; GitHub Pages production. |
| 4 | **B:** Phaser 3 + TypeScript + Vite for 2D; Three.js behind a boundary for World 11. |
| 5 | **B:** Archive/quarantine old 3D; remove eager/runtime entry points; developer-only flag. |
| 6 | **B:** Fixed-timestep custom 2D controller with Arcade queries, swept collisions, coyote time, buffering, variable jump. |
| 7 | **B:** Adjustable D-pad + Jump/Ability/Context, multitouch/sliding, optional haptics, resizable/repositionable. |
| 8 | **B:** Landscape gameplay, upright portrait prompt, no DOM rotation, safe scaling/letterboxing/fullscreen. |
| 9 | **B:** Unified remappable keyboard/gamepad actions, hot-plug, dead zones, glyphs, pause, optional vibration. |
| 10 | **B:** 60 fps target, stable 30 fallback, quality tiers, current-browser testing, zero console errors. |
| 11 | **Custom:** Real name is Kinan Umpherville; “Keenan” was speech-to-text error. |
| 12 | **A:** Public text uses only “Kinan”; surname is not displayed. |
| 13 | **B:** Original high-resolution 2D cartoon/anime-expression art with bold outlines and painted layers. |
| 14 | **B:** Approved reference-based cartoon likeness; references never ship. |
| 15 | **B:** Red star shirt/jeans/sneakers default plus optional themed cosmetic costumes. |
| 16 | **B:** Expressive hand-authored action/cutscene animation with 60 Hz gameplay and subtle squash/stretch. |
| 17 | **B:** Cohesive polished stylized 3D with controlled UV faces, proper rigs, and flat-plane environments. |
| 18 | **B:** Reviewed pre-generated neural story VO, polished bleeps, text/subtitles, no runtime TTS. |
| 19 | **B:** Distinct licensed stock voices; no unconsented clones or accent imitation. |
| 20 | **B:** Original adaptive hybrid score, boss layers, ducking, separate sliders, local assets. |
| 21 | **B:** Loadout swaps at title/map/home/checkpoints; locked during bosses/challenges. |
| 22 | **B:** Only equipped cat/dog visible; passive + automatic signature, cooldowns, smart follow, no blocking. |
| 23 | **Custom:** Use real-pet identities; roster was completed in subsequent answers. |
| 24 | **A:** Chikastino — Neighbourhood Watch and cooldown-limited bark control. |
| 25 | **A:** Hunter — Courage Fetch and once-per-level emergency snack. |
| 26 | **A:** Vader — Curious Force secret scouting and safe item pulling. |
| 27 | **A:** Duchess — Royal Snack Break and checkpoint recovery. |
| 28 | **A plus correction:** Tuxedo — Senior Glare; name is **Tuxedo**, not Tuxcedo. |
| 29 | **A:** Garfield (provisional) — Kitten Zoomies, extra air jump, landing-triggered acceleration. |
| 30 | **Custom, both A and B:** Unlock both Milo and Aiden; equip one Friend Assist at a time. |
| 31 | **Custom:** Toy-brick interests are Star Wars, Super Mario, Horizon, and probably fire trucks. |
| 32 | **A:** Authored quick-build recipes and bounded destructible structures; no freeform voxel sandbox. |
| 33 | **A:** Original-trilogy Star Wars inspiration with original artwork. |
| 34 | **A:** Rechargeable Energy Blade deflection and marked-object Force pull/push; no gore. |
| 35 | **B:** T-Rex, Triceratops, Velociraptor, Brachiosaurus, Ankylosaurus, Stegosaurus. |

| 36 | **A:** Fossils, baby rescue, species interactions/rides, environmental puzzles, and slapstick chase. |
| 37 | **Superseded:** An earlier wizard-school selection was revoked when the user removed that franchise/material. |
| 38 | **Skipped, then removed:** No spell/potion mechanics are active. |
| 39 | **Custom:** Pepperoni pizza, chicken nuggets, cheeseburgers, birthday cake, milkshakes, cookies. |
| 40 | **A:** Distinct food healing/energy effects; cake fully heals and grants five seconds invincibility. |
| 41 | **A:** Exploration, secrets, collecting, machines/robots, and light environmental puzzles. |
| 42 | **A:** Science, space, dinosaurs, machines, computers, and building projects. |
| 43 | **A:** Confirmed pet antics and Kinan-interest running jokes. |
| 44 | **A:** Affectionate slapstick, harmless gross-out, reconciliation, no cruel/private/stereotyped humor. |
| 45 | **D:** Playable crossover birthday festival with everyone, attractions, photo, and credits. |
| 46 | **A:** Four story stages + boss + optional challenge as the standard world scope; World 1 is home/neighborhood. |
| 47 | **A:** Playable tutorials, real small puzzles, Garfield and Chikastino unlocks, neighbour’s-wife heal. |
| 48 | **A:** Fictional school with street, classroom/science, gym/fire-safety, playground; unlock Vader/Milo/Aiden. |
| 49 | **A:** Circuits, magnets, simple machines, fire-truck builds, and playground geometry; no homework focus. |
| 50 | **A:** Four-stage Alberta work trip, Robin guide, Hunter rescue, Safety Foreman boss. |
| 51 | **A:** Fictional hydro-vac/pipe/traction/safety/storm puzzles; no unsafe real machinery operation. |
| 52 | **A:** Edmonton mall/restaurant/Whyte Ave/bridge, Duchess rescue, Shad challenge, Annie foreshadowing. |
| 53 | **A:** Water/ice/kitchen/rhythm mechanics with respectful Annie foreshadowing. |
| 54 | **A:** Stampede parade/breakfast/rodeo/midway/grandstand, Tuxedo rescue, Bronco boss. |
| 55 | **A:** Pancakes, rhythm, marked lasso, wagon routes, ricochets, moving barrels; animal-friendly. |
| 56 | **A:** Four-stage Vancouver world with 2D rainbow/postcard ending and no early 3D. |
| 57 | **A:** Umbrella/rain/waterwheel/puddle/traction/magnet/transit puzzles with accessible weather. |
| 58 | **A:** Brick Bin, Fire-Truck City, Machine Brickwilds, Skyscraper, 2D BRICK-REX, brick remix. |
| 59 | **A:** Coded recipes, hinges/gears/water, bounded debris, rebuildable objectives, Milo bonuses. |
| 60 | **A:** Badlands/jungle/river/canyon dinosaur stages and nonlethal Alpha encounter. |
| 61 | **A:** Fossils, contextual species friendships, rides, Raptor puzzles, checkpointed chases and assists. |
| 62 | **A:** Four sci-fi stages followed by Annie’s heavily hyped Galactic Kitchen boss. |
| 63 | **A:** Deflection/Force tutorials, readable droids, flat low gravity, one short 2D trench run. |
| 64 | **Superseded:** Initial wizard-family finale replaced by **Q82’s Birthday Multiverse** after material removal. |
| 65 | **A:** Compact mastery remixes, safe teaching, checkpoints/direct retries/assists, no boss rush; house-specific clause void. |
| 66 | **A:** Learnable compact phases, telegraphs, bounded projectiles, existing controls, nonlethal endings. |
| 67 | **A:** Mom’s two-phase Birthday Room Inspection and proud hug. |
| 68 | **A:** Fictional Fence-Line Feud, Chikastino interrupt, wife’s heal, party reconciliation. |
| 69 | **A:** Principal’s two-phase Bell Schedule Challenge and congratulations. |
| 70 | **A:** Three-round goalie match using bank shots/lane switches, Aiden support, mutual respect. |

| 71 | **A:** Robin is a major ally; fictional Safety Foreman supplies the safety-puzzle boss. |
| 72 | **A:** Chenoa’s three-phase plate/ground-pound/restaurant fight with earned head-bounces and Shad assists. |
| 73 | **A:** Friendly Annie/Chenoa cooking-dance-head-bounce rivalry, Mom referee, Worlds 4–9 buildup, finale teamwork. |
| 74 | **A:** Bronco chase/arena/calming encounter; frightened lonely animal becomes a friend. |
| 75 | **A:** Drizzle weather-routing fight, sun lamps, rainbow friendship, no 3D launch. |
| 76 | **A:** 2D BRICK-REX with tail/stomp, capped POW-deflected bombs, Heart extraction, googly-eye ending. |
| 77 | **A:** Nonlethal protective Alpha T-Rex; decoys/switches rescue and return her baby. |
| 78 | **A:** Annie’s roti deflection, dhol/masala rhythm, conveyor cook-off, and prep-station head-bounces. |
| 79 | **A:** Annie/Amandeep naming, heroic Punjabi identity, reviewed food/music/art, no stereotypes or sacred-symbol weapons. |
| 80 | **A:** Two distinct Grandmothers, solo phases then checkpointed tag-team with shared meters. |
| 81 | **A:** Capped complaint bubbles, telegraphed fantasy cane/walker boomerangs, escapable affection zones, final hug. |
| 82 | **A:** World 10 becomes **The Birthday Multiverse**; Grandmothers then three-phase Mom finale. |
| 83 | **A:** Mom uses household multitasking, bounded world remixes, candles/presents/Mom Radar, then reconciliation. |
| 84 | **A:** Birthday anomaly, playful/protective motives, Mom learns trust, family teamwork, unexpected later 3D. |
| 85 | **A:** Adventure default, Story assists, post-clear Challenge, phase practice/replays, cosmetic no-hit rewards. |
| 86 | **A:** Observatory + Saskatoon Skyline, Brick & Bone Island, Starbase Playground, anomaly finale, flat gravity. |
| 87 | **A:** Flat-gravity 3D moveset and controllable smart follow/orbit camera with accessibility settings. |
| 88 | **A:** 11 stars; finale at eight; festival for all finishers; all 11 grant optional golden cosmetics/photo. |
| 89 | **A:** Five-beat 45–60 second transformation with VO/subtitles/skip/reduced motion/replay. |
| 90 | **A:** Approved comic-panic-to-wonder script featuring “WHAT IS GOING ON HERE?!” |
| 91 | **A:** Permanent Dimension 11 branding/diorama/tabs/settings, 2D preservation, static WebGL fallback. |
| 92 | **A:** Same collection/loadout in 3D, equipped-only followers, all companions in hub/festival. |
| 93 | **A:** Versioned stable-ID saves, verified legacy migration, backups, local export/import, no account. |
| 94 | **A:** Save World 10 completion/World 11/UI/pending cutscene before the cinematic; crash/skip safe. |
| 95 | **A:** Versioned PWA packs, optional full offline download, between-level update prompts, no CDN dependency. |
| 96 | **A:** Unit/deterministic/Playwright/real-WebGL/visual/accessibility gates; console/page errors fail. |
| 97 | **A:** Representative real phones/tablets/desktops/controllers/offline/audio/performance; unavailable means unverified. |
| 98 | **A:** Full caption/text/audio/motion/camera/color/control/accessibility options with no progression penalty. |
| 99 | **A:** Small staging milestones, all sanity/device checks and explicit confirmation, tagged rollback, separate merge approval. |
| 100 | **A:** Produce this master document on staging and the Desktop kickoff prompt; stop before production game code. |

---

**End of controlling design document.** Implementation begins only through the approved staging milestone process described above.

# Kinan vs. Worlds — Technical Plan (post-interview)
*Locked direction: anime-hero Kinan · lush garden planetoid · cinematic tap-through cutscene (VO + Skip) ·
3 Power Stars · GRAVITOR the Gravity Golem · smart auto-camera + adaptive quality tiers.*

## PHASE 1 AUDIT — current files & bug roots
| File | Role | State |
|---|---|---|
| `index.html` | 2D game + VO system + integration hooks | 1.05 MB, healthy; **orientation bug lives here** |
| `galaxy3d.js` | WebGL engine (toon shaders, spherical gravity, boss, cutscene) | ~90 KB, healthy; box-primitive character rig needs rebuild |
| `galaxy3d-models.js` | Blender-exported models (20 parts) | 179 KB, healthy; to be re-exported as anime rig v2 |
| `vo/` + `vo/clips.json` | 29 performed voice clips | healthy, runtime-verified |
| `tools/` | Blender pipelines (models, concept renders, VO) | healthy |
| `sw.js` | offline cache v13 | healthy |

**Bug roots:**
1. **90° sideways viewport** — `index.html:318` `html.rotated .app{transform:rotate(90deg) translate(0,-100%)}` force-rotates the whole app on portrait touch devices, driven by `setOrientationUI()` (`MQ_PORT` → `html.rotated`). Preview windows / tablets show the game sideways. FIX: never rotate content; portrait shows a "rotate your device" hint over an upright letterboxed 16:9 stage.
2. **Blocky look** — engine character rig uses box primitives (`M.box.*`); nature props partly procedural spheres. FIX: Blender v2 rig with smooth capsule limbs + rounded forms; smooth-shaded normals; toon shader upgrade (3-tone bands + fresnel rim + spec sparkle).
3. **Bald/blocky Kinan** — hair-scale regression (fixed 93a565c) + box proportions. FIX: full anime rebuild (below).

## ARCHITECTURE (target)
- **Toon pipeline v2** (galaxy3d.js): 3-tone cel bands, fresnel rim, soft spec sparkle, MatCap-style headroom; `uQuality` uniform tiers (HIGH/MEDIUM/LOW) chosen by a 2-second boot FPS probe; DPR capped `min(dpr,2)`; instanced scatter (flowers/grass/star bits) in a single buffer draw.
- **Kinan v2 rig** (Blender → models v2, same part keys so the procedural animator keeps working):
  head (rounded, UV-mapped for a painted anime **face texture**: big eyes with shine, brows, blush, smile),
  layered spiky hair (3 beveled shells), capsule arms/legs with rounded joints, hands with mitt fingers,
  sneakers with soles+toes, tee with collar+emblem. ~4-6k tris total, smooth normals.
- **Spherical gravity v2**: quaternion slerp of Kinan's up-vector; camera up slerp (no gimbal); auto-follow camera with swipe orbit + snap-back (per interview).
- **Cutscene state machine** `CUT[5]`: (1) False Victory 2D → (2) Dimensional Tremor (screen shake, cosmic rifts) → (3) 2D→3D morph (ortho→perspective, ground curls into sphere) → (4) "Hands" close-up (3D hands turn over) → (5) Title drop KINAN VS. WORLDS + launch into W6-1. Tap-through dialog + VO clips + Skip button after 3 s. Fixed deterministic timeline for testing.
- **World 6-1**: garden planetoid (instanced flowers/grass, trees, bridge, pond, ruins) + 2 moonlets + ringed planet; **3 stars** (main = post-boss; hidden Comet Star behind the pond; 100-Star-Bit rush) with a star-select menu.
- **GRAVITOR** (3 phases): orbiting boulder fists (spin-deflect) → local gravity flips on the arena sphere → exposed core + Launch-Star slam + triple stomp. Max 4 projectiles alive; blob shadows only in boss arena on MED/LOW.
- **Controls**: desktop WASD/Space/Shift(+E/Click)=Spin, C=crouch/pound; mobile thumbstick + JUMP/SPIN/CROUCH buttons + swipe camera; auto-detected.

## TEST PLAN
- Extend `harness3d.html`: orientation assertion (no `rotated` class, canvas upright), FPS probe tiers, cutscene state machine advance, Gravitor phase transitions, 3-star completion paths, spin/pound/crouch verbs, VO line matching (existing vo-check).
- Screenshot script (shot3d) extended for: Kinan v2 close-up, each cutscene stage, Gravitor phases, star-select menu.
- Phase 4 = live playthrough from World 5 boss → cutscene → W6-1 → boss → star, on desktop + a touch-emulated viewport.

## BUILD ORDER
Phase 2: orientation fix → toon shader v2 → Kinan v2 (Blender + face texture) → instanced scatter → quality tiers.
Phase 3: cutscene state machine → World 6-1 (3 stars) → Gravitor → star-select UI → VO lines for new dialog.
Phase 4: verification harness + screenshots + live playthrough.
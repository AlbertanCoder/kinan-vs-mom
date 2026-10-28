# SPRINT PLAN — KINAN VS. WORLDS
### Owner: Architect / Creative Director. Each milestone = ONE builder session = ONE commit (after `cd app && npm run check` is fully green).
**Rule 0: NEVER deploy / push `main` without the Executive Producer's explicit approval. Rule: never weaken a test to pass a gate.**

```
 THE MOUNTAIN
                                        ▲ SLICE 3+ (Worlds 2-…, later sprints)
                                 ▲ SLICE 2 (World 1 polish → World 2 start)
                        👑 ▲ SLICE 1 DONE — EXECUTIVE PRODUCER APPROVAL GATE
                M6 ─── art & story re-home
            M5 ─── 1-3 + MOM arena + World 2 entry
        M4 ─── 1-1 authored + seam engine
    M3 ─── camera (both axes)
 M2 ─── terrain core (slopes, blocks, pipes)
M1 ─── feel core (the locked numbers)
M0 ─── THIS CONTRACT, approved
```

## SLICE 0 — APPROVAL (no code)
| # | Milestone | Acceptance |
|---|---|---|
| M0 | Contract + Playbook + Sprint Plan reviewed by the **Executive Producer** | Producer says APPROVED or files corrections. **Nothing is built before this.** |

## SLICE 1 — WORLD 1 PLAYABLE END-TO-END (the heart)

| # | Milestone (one builder session each) | Owner | Acceptance checks |
|---|---|---|---|
| M1 | **Feel core** — one `FEEL` constants object = Contract §1.1 exactly; variable jump + jump cut; coyote 8f; buffer 8f; squash & stretch (§1.2); hit feedback (§1.3 incl. NO shake on hurt). Builder writes the `legacy-feel-*` e2e stubs; Test Engineer 1 pins `app/tests/unit/**` | Engine Builder (+ Test Eng 1) | Feel §1.4 checklist all green; old `legacy-*` suites still pass |
| M2 | **Terrain core** — height-mask slope collision (2:1 + 1:1, snap, no jitter); auto-tile ground render (3-tone + top rim, §5.1); bricks break/bump; gift blocks; springs; pipes (entry = seam hook); secret blocks w/ glint | Engine Builder | Slope jitter test = 0; every tile of Contract §2.1 exists; a demo strip with all 5 hill motifs runs at 60 fps on the family iPad |
| M3 | **Camera core** — deadzone + lookahead + smoothed X/Y follow + apex-lead + slow-down-not-clamp in arenas (Contract §3); 3-layer parallax | Engine Builder | Camera acceptance tests green (§3); jump apex always on screen in probe run |
| M4 | **World 1-1 authored + seam engine** — Level Designer's 1-1 data (Playbook §4.1) in `index.html` level content; chunk streaming behind gate set-pieces; non-blocking banners; sidekick bubbles v1 | Builder idle → **Level Designer** (content), Builder (streaming) | Seam walk-through: spawn of 1-1 → past the picket gate with **zero screens**; every 1-1 screen has a toy (QC-1 signed); 3 secrets + golden candle present |
| M5 | **1-2 + 1-3 + MOM arena + World 2 entry** — full World 1 terrain; boss arena IN the terrain with SMW gate-lock; win → bridge builds → World 2 first step walks in; checkpoint/save wiring on the new terrain; kept VO wired to bubbles | Level Designer + Engine Builder | **THE SLICE 1 DEMO:** Title → PLAY → 1-1 → 1-2 → 1-3 → Mom fight → walking into World 2, Kinan never stopped; `npm run check` fully green; all `legacy-*` suites pass |
| M6 | **Art & story re-home** — World 1 palette + 6-motions-per-screen pass (Contract §5); birthday story re-homed as bubbles; Mom's intro/taunt/win lines on the arena; pet crate + Party Shop entry survive in-world | Engine Builder (renders) + Level Designer (content) | §7 checklist green; readability rule (25% luminance) holds; VO clips play on bubbles |

### STATUS + NEXT (updated 2026-10-27 — Producer ruling, Contract §9)
| # | Milestone | Status |
|---|---|---|
| M1–M3 | feel · terrain (slopes) · camera | ✅ done (2026-10-26) |
| M4 | the Wild Yard authored + §4.1 seam engine | ✅ done — commit "M4: …" (pit-lip pillar bug fixed; spawn→gate proven playable) |
| **M4b** | **levels as files** — `levels/registry.js` + generated `levels/manifest.js` + one file per level; the Wild Yard moved to `levels/w01/l05.js` as **1-5 The Front Yard** (its arch = the goal → LEVEL CLEAR → back to the map stub); `?devtools=1&level=<id>`; `levels/_template.js` + `docs/LEVEL-AUTHORING.md`; every-level gate (unit lint + e2e build) | ✅ done — commit "M4b: …" |

The 2026-10-27 ruling replaces the old M5/M6 content line (1-2 House → 1-3 Rooftop → Mom → World 2
by seams). **Run order now:**
1. **Level agents build World 1 in `levels/w01/`** — the 10 remaining levels (1-1…1-4, FORT, 1-6,
   1-7, SECRET, 1-8, CASTLE), **one agent per level file**, per `docs/LEVEL-AUTHORING.md` (ownership
   rule §2, rules §5, tests §6). They edit only their own files + the regenerated manifest; engine
   needs go to `docs/BUG-BOARD.md` as ENGINE REQUESTS.
2. **Builder (one code editor at a time) — map integration:** the SMW overworld between levels
   (concept: `Desktop\Kinan Map Concept\worlds.html`), map → level → map, progress saves for
   authored levels, then the castle arena hook (ER-3) so 1-castle's Mom fight lives in its terrain.
3. **Builder — engine requests the levels need:** ER-6 secret glint + secret prizes + golden candle,
   ER-4 bubbles, pipe warps / secret rooms, ER-5 pet crates, ER-9 sprinkler jets.
4. **M6 art & story pass** (palettes per world, bubbles + VO) → **👑 Producer gate:** Title → map →
   World 1's 11 levels → Mom → the map walks on into World 2. "Would I play this game?"
5. Worlds 2–11 in parallel (one folder `levels/wNN/` per world team) once World 1's format is proven.

### 👑 SLICE 1 ACCEPTANCE = EXECUTIVE PRODUCER GATE (between M6 and everything else)
The Producer personally plays the Slice 1 demo and answers ONE question: **"Would I play this game?"**
- **APPROVED** → Slice 2 begins (World 2 = Level Designer's next paper design; Test/QC boards triaged).
- **NOT YET** → the Producer names the 3 worst things; they become M6.1–M6.3; re-demo. No new content until it lands.

## SLICE 2+ (outline only — each becomes its own sprint after Slice 1)
- **M7** World 1 polish + first QC-1/QC-2 bug waves (BUG-BOARD-FUN / BUG-BOARD-TECH must be empty of P1s).
- **M8** World 2 paper design → build → demo (same 6-milestone rhythm, compressed).
- **M9…** Worlds 3+ one at a time. Party modes (kart/smash/builder) only after a world's core loop is signed.

## RUNNING RULES (all sprints)
1. **One terminal edits code at a time** (team rule). QC & Test Engineers never edit game code.
2. **One milestone = one commit**, only after `cd app && npm run check` is fully green.
3. Test suites: `legacy-feel-*` + `app/tests/unit/**` = Test Engineer 1; `legacy-world*`, `legacy-save*`, `legacy-flow-*` + all other `legacy-*` = Test Engineer 2. **Never weaken a test.**
4. Every milestone ends by updating `KINAN_VS_WORLDS_LATEST_HANDOFF.md` (whoever commits last).
5. The standard for everything: **"Would I play this game?"** — breadth is not quality.

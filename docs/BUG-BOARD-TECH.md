# BUG BOARD — TECH · QC-2 "THE TECH" (correctness & quality)

**Owner:** Quality Control 2. Partner: QC-1 (`docs/BUG-BOARD-FUN.md` — fun only). This board is about
**trust**: crashes, broken saves, jank, cross-browser parity, dev-hook hygiene. I hold the release
correctness veto. I never edit game code.

**Evidence labels (never mislabel):**
`AUTOMATED` = exact command + counts · `VISUAL` = what I saw on screen · `AUDIO` = what I heard ·
`DEVICE` = real hardware · `UNVERIFIED` = not checked yet.

**The standard:** "Would I play this game?" includes "would I trust it?" If the build ever slips back
to flat strips / static backdrops / a dragging camera ("moving GIFs behind flat platforms"), that is a
BLOCKER.

---

## STANDING VERDICT

**Ship it? NO — hold for the Slice 1 gate.** Not because the game is broken:

- **The legacy/reference build looks trustworthy.** Three runs' worth of evidence converges on it:
  both chromium projects 100% green (run #1), TE-2's near-clean `347/348`, **zero genuine product
  assertion failures in any of my runs**, zero console/page errors in two probe sessions, save
  backup/recovery verified in code and by suite, dev hooks properly quarantined (apart from the
  `__k11Draw` polish item), and the visual standard holds — real terrain, 2-axis camera, consistent
  pixel art, no "flat strips" regression.
- **But correctness is unproven until one exclusive gate run is green**, and today that has been
  impossible: TECH-001 collisions poisoned runs #1–2, and run #3 landed mid-rebuild (Builder editing
  `index.html`, TE-1 writing pin tests that are themselves red — TECH-006/007).
- Fun readiness is QC-1's call; their verdict is also NOT YET (`docs/BUG-BOARD-FUN.md`).

**To flip this to YES:** (1) park all sessions for one exclusive `cd app && npm run check` with real
counts across desktop-chromium, touch-tablet-chromium, firefox, webkit; (2) TE-1 fixes the pins
helper (TECH-006) and K4 is reconciled with Contract §1.1 (TECH-007); (3) Slice 1 passes the
👑 Executive Producer demo. The release correctness veto stays **held** until then.

---

## TOP 10 RELEASE BLOCKERS

*(ranked; empty slots stay visible so nothing gets quietly dropped)*

1. **TECH-001 (MAJOR, process)** — Gate runs are not parallel-safe: concurrent `playwright test`
   runs destroy each other's evidence (port 4174 + shared `test-results/`). Until one exclusive
   gate run is green, release correctness is **unproven**. → Test Engineer 2 + Builder.
2. **TECH-006 (MAJOR, tests)** — TE-1's new pin suite is red on a test-helper bug
   (`matchAll` non-global regex, 4 failures); unit gate cannot be green until fixed. → Test Engineer 1.
3. **TECH-007 (MAJOR, engine-vs-pin)** — Double-jump impulse pin K4 disagrees with the engine
   (`-6.3` vs `-7.02`); reconcile against Contract §1.1 before Slice 1 sign-off. → Builder + TE-1.
4. *(open)*
5. *(open)*
6. *(open)*
7. *(open)*
8. *(open)*
9. *(open)*
10. *(open)*

---

## HAT 1 — THE CRITIC (visual review, 2026-10-26)

**Method:** `AUTOMATED`+`VISUAL` — headless-Chromium probe against the local preview
(`127.0.0.1:4173`), 5 screenshots taken and reviewed by QC-2 (title menu, explorer world ×2,
"The Kitchen" platforming stage ×2). Dev-gated hooks (`?devtools=1` + localhost) used only for
local stage entry — production gating verified separately.

- **Menu:** consistent pixel art, gold-framed portrait, clear icon buttons (Backpack / How to play /
  Party Shop / Reward code / Install app), paged navigation. Clean, readable, on-style. ✓ *(2026-10-28: replaced by
  PLAY / Start over / Menu and one ☰ MENU panel; the reward codes were removed: everything unlocks by playing.)*
- **Explorer world (World 1):** SMW-style scrolling overworld — path tiles, houses, blossom trees,
  bushes, rocks at multiple depths; two frames show the scenery shifting with the camera (scroll
  confirmed). Touch d-pad + POW/JUMP overlay. ✓
- **Platforming terrain ("The Kitchen", stage 3/11):** layered floor with depth bands, floating
  shelf platforms, glowing pendant lamps, windows with blinds, panelled back wall, dust motes,
  coin arcs, animated slimes (squash-stretch), "(stomp!)" impact caption. **This is real terrain —
  the old "flat strips + static backdrop" failure mode is NOT present.** ✓
- **Camera:** live values from `__k11.state()` (dev build): `px 32→237→493` while
  `camX 0→61→317` — constant 176px lead ≈ 0.41·W (engine targets 0.42, integer-pixel snap, smoothed
  Y via `camY += (ty-camY)*0.2`, `index.html:4882-4888`). 2-axis follow, no drag observed. ✓
- **Motion density:** coins/foes/particles/lamp glows/dust all frame-driven; ≥6 moving elements per
  gameplay screen estimated from code + frames. `UNVERIFIED`: sustained 60fps and per-element motion
  on **real devices** (needs DEVICE pass on a mid-range phone).
- **AUDIO:** `UNVERIFIED` — no audio listened to by QC-2 this session (audio wiring + captions are
  covered by `legacy-audio.spec.ts`, all passing in clean runs).
- **Verdict:** nothing on screen would embarrass the game next to Super Mario World *at the
  correctness level*. Fun/level-design judgment is QC-1's lane (`docs/BUG-BOARD-FUN.md`).

## HAT 3 — THE GUARDIAN (hygiene checklist)

| Check | Result | Evidence |
|---|---|---|
| No console/page errors in menu→game→jump→stage flow | ✅ zero | `AUTOMATED` probe: `errors: []` across 2 sessions (menu, explorer, stage) |
| `window.__k11` (cheats) absent in production | ✅ gated | `AUTOMATED` code read `index.html:704-714, 15550`; asserted by `legacy-quarantine.spec.ts` |
| `?w6` / `?creator=SHAD` blocked in production | ✅ gated | `AUTOMATED` code read `index.html:7108, 10002, 15532`; quarantine suite green in clean runs |
| No `eval` / `new Function` | ✅ none | `AUTOMATED` grep count 0 |
| Reward codes not shipped as plaintext | ✅ SHA-256+salt (2026-10-28: moot, the codes were removed) | `AUTOMATED` code read `index.html:7171-7180` (`crypto.subtle.digest`) |
| Saves survive damage (backup-first, validation, k11v3 read-only migration) | ✅ by design + suite | `AUTOMATED` code read `index.html:749-771, 2436-2540`; `legacy-save-recovery.spec.ts` green in clean runs |
| `sw.js` does not precache quarantined 3D code | ✅ cache `kinan-vs-mom-v30`, clean asset list | `AUTOMATED` file read |
| Dev-hook leak: `window.__k11Draw` | ❌ leaks | see TECH-002 (POLISH) |
| Live site never touched | ✅ | No deploy/push performed by QC-2 (rule 3) |
| Cross-browser parity | ⏳ pending clean 4-browser gate | Gate Log below |
| Frame rate on mid-range phone | `UNVERIFIED` | No device access this session |

---

## FINDINGS

### TECH-001 · MAJOR · Gate runs are not parallel-safe (concurrent-run collision)
- **EVIDENCE:** `AUTOMATED` — process forensics + two run logs + independent QC-1 corroboration.
  - My gate (`npm run check` → 348 tests) started ~10:55. Mid-run, at **10:58:53**, a second
    Playwright run appeared: `cmd /c npx playwright test > te2-baseline-out.txt` (Test Engineer 2
    baseline), with its own preview-server on port **4174** at 10:58:55.
  - My run #1 result: `288 passed / 60 failed (7.1m)`. **Every single failure** is
    `Error: page.goto: Could not connect to server → http://127.0.0.1:4174/index.html` (53 webkit +
    7 late firefox) plus teardown `browserContext.close: ENOENT …\.playwright-artifacts-9\traces\…`
    — **zero `expect()` assertion failures in the entire run**.
  - TE-2's overlapping run finished `347 passed / 1 failed` and **passed the very tests my run
    failed** (e.g. `legacy-world9.spec.ts:67` took 42.1s under contention and passed there).
  - Run #2 hit a THIRD concurrent `playwright test` (PID 16264, 11:11:46, own port-4174 server).
  - **QC-1 hit the same thing independently** (`docs/BUG-BOARD-FUN.md` TECH POINTERS): their capture
    harness died mid-run to the same port/contention class, and they observed that **any
    `playwright test` startup wipes `app/test-results/`** — which is exactly the ENOENT mechanism.
- **REPRO:** Start `npm run check` in one terminal; while e2e is running, start `npx playwright test`
  in another (same `app/` dir). Both use hard-coded `127.0.0.1:4174` (`app/playwright.config.ts`) and
  the shared `app/test-results/` + `.playwright-artifacts-*` folders.
- **EXPECTED:** One completed run = trustworthy counts.
- **ACTUAL:** Runs kill each other's dev server and delete each other's trace artifacts; counts are
  meaningless. A red gate produced this way is *invalid evidence*, not a product verdict. This cost
  QC-2 three full gate attempts today.
- **LIKELY OWNER:** Test Engineer 2 + Builder (tooling) — team rule: **only one gate run at a time on
  this machine**; QC-1's suggestion (one port + one output dir per harness) is the right fix if
  parallel runs are wanted.

### TECH-002 · POLISH · `window.__k11Draw` exposed unconditionally in production
- **EVIDENCE:** `AUTOMATED` — `Select-String 'window\.__k11Draw' index.html` → line 5729
  (`window.__k11Draw = { sx: sx, sy: sy, camX: camX };` runs on every player draw).
- **REPRO:** Open the live build, in the console run `window.__k11Draw`.
- **EXPECTED:** Per `docs/LEGACY-BOUNDARY.md`, dev hooks are undefined in production.
- **ACTUAL:** `__k11` (the cheat object) is correctly gated behind `__k11DevOnly()` (verified:
  `index.html:704-714, 15550`), but this small observability object leaks on every frame.
  Harmless (draw coordinates only — no cheats), but inconsistent with the quarantine contract and
  `legacy-quarantine.spec.ts` doesn't assert on it.
- **LIKELY OWNER:** Builder (engine) — gate it or delete it.

### TECH-003 · MINOR · Stale preview servers left running across sessions
- **EVIDENCE:** `AUTOMATED` — `Get-CimInstance Win32_Process` at 2026-10-26 11:05:
  `node tools/preview-server.mjs --root . --port 8080` (PID 41384) and
  `node ../tools/preview-server.mjs --root .. --port 4173` (PID 46368) both started
  **2026-10-25 15:25/15:35** — still alive a day later.
- **REPRO:** `Get-Process node` after any preview session; nobody kills these.
- **EXPECTED:** Test tooling starts from a clean slate.
- **ACTUAL:** `npm run preview:legacy` (port 8080) will crash with EADDRINUSE against yesterday's
  server; stale servers add CPU/memory pressure during 4-browser runs (playwright.config.ts itself
  warns that extra load once wedged a Firefox renderer).
- **LIKELY OWNER:** Team housekeeping (kill leftovers before gate runs).

### TECH-004 · MINOR · `tools/preview-server.mjs` has no `error` handler — silent EADDRINUSE crash
- **EVIDENCE:** `AUTOMATED` — file read: `server.listen(...)` at line 68 with no `server.on('error')`
  and no `process.on('uncaughtException')`.
- **REPRO:** Start two preview servers on the same port.
- **EXPECTED:** A clear "port busy" message.
- **ACTUAL:** Node throws an unhandled `EADDRINUSE` and the process dies quietly — exactly the kind
  of silent death that made run #1's 60 "Could not connect" failures hard to attribute.
- **LIKELY OWNER:** Builder (tooling, not game code) or Test Engineer 2.

### TECH-005 · RESOLVED-MID-SESSION · Required shared docs (were missing at audit start)
- **EVIDENCE:** `AUTOMATED` — at 11:03 `docs/` held only `KINAN-VS-WORLDS-TECHNICAL-PLAN.md` and
  `LEGACY-BOUNDARY.md`. At ~11:20 the Architect committed `5ea5315` ("M0: approved design contract,
  level playbook and sprint plan") and the files appeared: `docs/GAME-DESIGN-CONTRACT.md`,
  `docs/LEVEL-PLAYBOOK.md`, `docs/SPRINT-PLAN.md` (+ `docs/WORLD1-LEVEL-DESIGN.md`,
  `docs/BUG-BOARD.md` from the Level Designer).
- **STATUS:** no longer an issue. Note for the record: QC-2 audited the *legacy* build this session;
  the contract (Contract §1.1 feel numbers are LOCKED) has **not** yet been audited against the
  rebuilt engine — that review belongs to the Slice 1 gate.

### TECH-006 · MAJOR · TE-1's new pin suite fails on a test-code bug (4 of 5 unit failures)
- **EVIDENCE:** `AUTOMATED` — `cd app && npx vitest run` output (gate log run #3):
  `Test Files 2 failed | 8 passed (10) · Tests 5 failed | 89 passed (94)`, all 5 in
  `app/tests/unit/legacy-feel-*.test.ts` (Test Engineer 1's brand-new files, written 11:19–11:25).
  4 failures are the identical `TypeError: String.prototype.matchAll called with a non-global RegExp
  argument` from the `nums()` helper at `legacy-feel-pins.test.ts:26`.
- **REPRO:** `cd app && npm run test:unit` any time.
- **EXPECTED:** pins parse `index.html` constants and hold the Contract §1.1 numbers.
- **ACTUAL:** the helper's regex is missing the `g` flag, so 4 characterization pins (K7, K8, K10,
  K13) throw before asserting anything. **Fix the helper — do not weaken or skip the pins** (rule 4).
- **LIKELY OWNER:** Test Engineer 1 (their file; QC-2 does not edit tests).

### TECH-007 · MAJOR · Characterization pin K4 disagrees with the engine's double-jump impulse
- **EVIDENCE:** `AUTOMATED` — `legacy-feel-arc.test.ts:157`: "the Garfield double jump fires at -7.4
  and never mid-peak (K4)" — `expected -6.3 to be close to -7.02` (test models impulse
  `-7.4 + GRAV_HOLD` with `GRAV_HOLD=0.38`; measured first post-impulse `vy = -6.3`).
- **CONTEXT / CAVEAT:** measured **while `index.html` had uncommitted modifications** (Builder's M1
  work in flight) — cannot attribute to committed code. Likely the Contract §1.1 numbers are still
  being landed (M1 "Feel core").
- **EXPECTED:** engine matches the LOCKED feel table; the pin certifies it.
- **ACTUAL:** engine and pin disagree by 0.72 px/frame on the double-jump impulse.
- **LIKELY OWNER:** Builder (engine) + Test Engineer 1 (pin) to reconcile against Contract §1.1 —
  the contract decides who moves; never bend the pin to whatever the engine happens to do.

### TECH-008 · MINOR (known env flake) · firefox audio spec can die to `RenderCompositorSWGL`
- **EVIDENCE:** `AUTOMATED` (reported by the Architect's M0 run, recorded in the handoff):
  `legacy-audio.spec.ts` on the **firefox** project crashed with `RenderCompositorSWGL failed mapping
  default framebuffer` under full 4-project parallel load (3 tests); **all 5 passed re-run on firefox
  in isolation (12.6s)**.
- **RULING (the handoff asks QC-2 to decide):** do **NOT** quarantine the spec — that would weaken the
  gate. Policy: if firefox audio fails, re-run that spec on firefox in isolation before filing any bug;
  only a failure that survives isolation is a product finding. (Same class as TECH-001 load flake.)
- **LIKELY OWNER:** Test Engineer 2 (policy owner of `legacy-*.spec.ts`).

---

## GATE LOG (real counts only — never "tests pass")

| # | When | Command | Result | Valid? |
|---|---|---|---|---|
| 1 | 2026-10-26 ~10:55–11:03 | `cd app && npm run check` (typecheck + unit + 348 e2e tests) | `288 passed / 60 failed (7.1m)`; typecheck ✅, unit ✅ | ❌ **INVALID** — TE-2's `npx playwright test` overlapped from 10:58:53 (TECH-001). All 60 failures = `Could not connect to server` + ENOENT teardown races; 0 assertion failures. |
| 2 | 2026-10-26 ~11:06–11:17 | `cd app && npm run check` (solo attempt) | `214 passed / 134 failed (10.3m)`; typecheck ✅, unit ✅ | ❌ **INVALID** — a third party's `playwright test` started 11:11:46 with its own port-4174 server mid-run (TECH-001 again). 30×`ERR_CONNECTION_REFUSED`, 19×test-timeout under load, 36×ENOENT artifact races; the single `expect()` failure is `console.error: ERR_CONNECTION_REFUSED` pollution (`legacy-orientation.spec.ts:115`). 0 genuine product assertion failures. |
| 3 | 2026-10-26 11:22–11:23 | `cd app && npm run check` (machine quiet, exclusive) | typecheck ✅ (`tsc --noEmit` clean) · unit `89 passed / 5 failed (94, 10 files)` · **e2e never started** (chain stops on red unit) | ⏳ **Snapshot of a mid-rebuild tree** — run while the Builder had uncommitted `index.html` edits and TE-1 was still writing `legacy-feel-*.test.ts` (files timestamped 11:19–11:25). All 5 failures are TE-1's in-progress files (TECH-006 ×4 helper bug, TECH-007 ×1 pin mismatch). Not a product verdict; it IS the current state of the tree. |

### Run #3 — authoritative counts (exclusive window)

- typecheck (`tsc --noEmit`): ✅ clean
- unit (vitest): **89/94** — `legacy-feel-pins.test.ts` 4× helper `TypeError` (TECH-006),
  `legacy-feel-arc.test.ts` K4 mismatch (TECH-007). The other 8 files (89 tests) all green.
- e2e across desktop-chromium, touch-tablet-chromium, firefox, webkit: **not reached** (npm `&&`
  chain stops at the red unit stage). An exclusive full run is still owed to the gate.

**Cross-run truth so far (what survives every run):** typecheck and unit pass every time; the 348-test
e2e suite passes substantially whenever it is not sabotaged by a concurrent run (TE-2's near-clean
`347/348`; my chromium projects 100% green in run #1). Only repeated e2e flake candidates under heavy
load: the "starts every X stage in 2D" family (10–20s normally, can exceed the 60s timeout when
multiple browser runs share the CPU) — `UNVERIFIED` as product flake vs load flake.

---

## COORDINATION NOTES

- Fun problems → `docs/BUG-BOARD-FUN.md` (QC-1). QC-1's board did not exist at QC-2 session time.
- **Process rule for everyone (from TECH-001):** only ONE `npm run check` / `playwright test` may run
  at a time on this machine. The gate cannot give real counts otherwise, and a lying gate is worse
  than a red one.
- `KINAN_VS_WORLDS_LATEST_HANDOFF.md` created/updated by this commit (team rules: last committer
  updates it). `docs/GAME-DESIGN-CONTRACT.md`, `docs/LEVEL-PLAYBOOK.md`, `docs/SPRINT-PLAN.md` were
  created by other roles mid-session (see TECH-005) — QC-2 has not yet audited the contract against
  the shipped build.
- I never edited game code, tests, or anyone else's board. Temp probe scripts live in `%TEMP%`
  (`qc2-probe*.cjs`), not in the repo.

### Accepted test-infra notes (not player-facing bugs)

- `#startBtn` (every `.btnbeat`) pulses via infinite CSS animation → Playwright clicks need
  `{ force: true }` (QC-1's pointer; confirmed — my probes use force clicks). Fine as-is; it is a
  test-harness convention, not a UI defect. → shared knowledge for TE-1/TE-2.
- `app/test-results/` is wiped by any `playwright test` startup (outputDir cleanup) — never park
  anything there (this is half of TECH-001's ENOENT mechanism).
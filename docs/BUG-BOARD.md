# BUG BOARD — KINAN VS. WORLDS
Shared coordination board. Owner rules per the team charter:
- **ENGINE REQUESTS** (this section): Level Designer — requests to the Engine & Terrain Builder; always paired with a work-around so content work never blocks.
- `docs/BUG-BOARD-FUN.md` — QC 1 "The Kid" (fun & feel; toys per screen, 6 motions, difficulty).
- `docs/BUG-BOARD-TECH.md` — QC 2 "The Tech" (crashes, saves, jank; holds the release veto).

---

## ENGINE REQUESTS
*Filed by: Level Designer · 2026-10-26 · for: Engine & Terrain Builder · law: `docs/GAME-DESIGN-CONTRACT.md`*

| # | Request | Why (contract ref) | Work-around until built |
|---|---|---|---|
| ER-1 | **Authored-terrain hook**: engine consumes per-area authored data (grid + heights + entities) instead of procedural `build(i)` for story levels | §8.1 (levels = data owned by Level Designer) | `docs/WORLD1-LEVEL-DESIGN.md` §2.4 ships ready-to-wire data; legacy `build(i)` keeps running until the hook lands |
| ER-2 | **Slope tiles #2 (2:1) + #3 (1:1)** as height-mask tiles with snap (tolerance 2 px) | §2.2 (engine has no slope code today) | 1-1's hills degrade to stepped ledges; geometry table unchanged |
| ER-3 | **Mid-world arena logic**: gate rise behind Kinan at threshold (6 f hit-stop), gate fall + self-building bridge/stair on win | §4.2 | 1-1 arena plays as an open set-piece; win bubble fires at the seam column |
| ER-4 | **Column-triggered bubble queue** (sidekick/story/taunt bubbles, 2.5–4 s, skippable with JUMP, VO clip binding) | §4.3 | Story beats land in the handoff doc only; nothing blocks play |
| ER-5 | **Pet-in-box entity** spawnable from authored data (cat → double jump, dog → chases foes) | §6 (pets & perks kept) | Boxes render as gift blocks with a pet prize |
| ER-6 | **Secret block #15 glint** (1 f / 240 f) + **pipe/door #16 diegetic fade** (≤12 f) | §2.1 | Secrets are plain invisible blocks; pipe = instant warp |
| ER-7 | **Wind/push zone** (leaf blower) as a reusable hazard-volume | 1-3 Nosy Neighbour arena toy | Foe fires projectile gusts |
| ER-8 | **Themed spring skin** (kitchen trampoline look for tile #8) | §5.1 readability + legacy look | Default spring skin in all worlds |
| ER-9 | **Sprinkler jet hazard**: telegraphed periodic water jets from hose pipes (1-1's "sprinkler pipes") | Playbook §4.1 act-2 toy | Jets are décor + ordinary foes carry the challenge |
| ER-10 | **Foe skins `bug` (caterpillar) + `kite`** over existing walker/flyer behaviors | Playbook §4.1/§4.3 visuals | `squirrel` (walker) + `plane` (flyer) stand in; same rhythms |

*Severity is the Builder's call; none of these block my next milestone (1-2 design).*

**Status 2026-10-27 (engine pass B1):** ER-3 **built for authored levels** as `arena` (`docs/LEVEL-AUTHORING.md` §4.7): the gate rises behind Kinan at the threshold, the boss door is shut until the boss is befriended, then both gates fall and the goal is a few steps on. Not built: the 6 f hit-stop on the gate rise and a self-building bridge/stair. ER-7 exists only inside the neighbour's arena (his leaf blower pushes Kinan back); a reusable wind volume for level files is still open.

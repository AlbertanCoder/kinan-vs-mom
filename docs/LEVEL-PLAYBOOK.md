# LEVEL PLAYBOOK — KINAN VS. WORLDS
### How a level is built. Owner: Architect → handed to the Level Designer.
**Read first:** `docs/GAME-DESIGN-CONTRACT.md` (feel numbers, terrain grammar, camera & seam rules).

---

## 1. THE 3-ACT LEVEL (every level, no exceptions)

```
 ┌───── ACT 1 · TEACH ─────┬───── ACT 2 · TWIST ─────┬───── ACT 3 · TEST ─────┐
 │  30% of length          │  40% of length          │  30% of length         │
 │  Show ONE new idea in a │  Combine it with a known │  Exam: this idea +    │
 │  safe space. Fail cheap │  one. Raise rhythm. Add │  last level's, faster. │
 │  (soft ground below).   │  the signature toy.     │  End on a HIGH: big    │
 │                         │                         │  toy right before seam │
 └─────────────────────────┴─────────────────────────┴────────────────────────┘
```

- **One new idea per level.** (Slope running, bounce chains, moving platform, dark section…)
- Act 1 teaches by DOING, never by a text wall. One sidekick bubble max: *"Hills are fast downhill!"*
- After every hard screen, a **breath screen** (toy + coins + a view).
- The last screen before a seam is a **reward screen** — the level ends on a smile.

## 2. DIFFICULTY CURVE RULES (numbers from the feel spec)

| Rule | Value (World 1) | Rationale |
|---|---|---|
| Max critical-path gap | act 1: 3 tiles · act 2: 4 · act 3: 5 | full-run jump clears 6.5 tiles; margin = kindness |
| Max drop without warning | 4 tiles | beyond that, show the landing first (camera does the rest) |
| New hazard per screen | 1 | never two firsts at once |
| Enemies per screen | act 1: 1 · act 2: 2 · act 3: 2–3 | enemies are rhythm, not walls |
| Coins/candles | arcs teach jump paths | a coin arc is a promise: "this jump is possible" |
| Punish level | pit costs a heart + respawn at checkpoint | NEVER delete progress (saves are sacred) |

Difficulty climbs ACROSS a world (1-1 easy → 1-3 spicy); each world's act 1 drops back to
comfortable. An 11-year-old must never hit a wall he can't see over.

## 3. SECRET RULES (every level ships exactly 3)

| # | Type | Example | Rule |
|---|---|---|---|
| 1 | **Visible-but-tricky** | coin arc over a scary gap leading to a ledge | rewards courage; visible from the main path |
| 2 | **Hidden-in-terrain** | a suspicious flat wall with a secret block inside | the 1-frame glint every 240 frames is the only hint |
| 3 | **Skill-gated** | a spring chain / stomp chain to a high shelf | rewards mastery; never on the critical path |

Plus **1 golden candle per level** (the big collectible — 3 per world unlocks a Party Shop treat).
Secrets are written on the paper design BEFORE any tiles are placed. No secret → level not done.
## 4. WORLD 1 PAPER DESIGNS — "KINAN VS. MOM" (birthday day, home & yard, Saskatoon)

Theme: the birthday morning the house went WILD. Terrain = yard and house as a rolling platform
world (garden hills, hose pipes, furniture terrain). Day → dusk → night party.
Boss: **MOM** (kept and loved) in the backyard Party Valley arena.

### 4.1 LEVEL 1-1 — "THE WILD YARD" (teaches: run, jump, slopes, stomp)

```
  camera opens on the porch (parallax, honest sky)                        ▼
  [K]~~flat~~  🐛        BROW HILL w/ gift block        TERRACE w/ candles
  ════════════●──╱‾‾‾‾╲═══[?]══╲___╱~~3gap~~╱╲╱╲╱╲~~~spring~~~╱‾‾╲_____
   toys: stomp 🐛 · gift [?] · slope run-down    toys: crest pop · spring to candle shelf
                        🔍SECRET-2: fake "solid" wall at the terrace —
                             secret block holds the GOLDEN CANDLE

      ACT 2 · TWIST — the SPRINKLER PIPES (hose pipes woven INTO the brow hill)
  ═╱‾╲══[pipe]~~╱╲~~~╱‾‾╲~~gap4~~[pipe]══╱╲╱╲╱╲══╱‾‾‾╲═
    run under the hill arch (BOWL motif!) · pipe → tiny under-hill coin grotto
    toys: pipe grotto (discover) · 2-🐛 stomp chain (bounce) · brick row to break

      ACT 3 · TEST — the FENCE LINE (faster, taller)
  ═╱╲╱╲╱╲~~gap5~~╱‾‾‾╱╲═[?]═╲~~gap4~~╱╲╱╲╱╲╱╲~~~[S]~~~~╱╲══ GATE (picket arch)
    reward before the seam: spring chain up to 3 candle arcs + SECRET-3 ledge
```
Legend: `[K]` spawn · `🐛` enemy · `[?]` gift block · `[S]` spring · `[pipe]` hose pipe ·
`~~n~~` gap of n tiles · `🔍` secret · `GATE` seam to 1-2 (no screen!).
**Acts:** 1 = porch→terrace · 2 = pipes/bowl · 3 = fence line.
**Seam:** walk through the picket-arch gate → straight into the house (1-2); camera never stops.
**Signature toy:** slope speed — run DOWN the brow hill into a stomp chain.

### 4.2 LEVEL 1-2 — "THE HOUSE THAT WENT WILD" (teaches: bricks, hidden secrets, climbing)

Interior terrain: couch = BROW hill, coffee table = MESA (run under!), bookshelf = vines,
staircase = the slope showcase. The vertical camera earns its keep here.

```
  bookshelf top ╱╲ candle shelf · SECRET-1 (visible ledge behind the lamp)
  ═══╱╲═[vines]═══════════╱‾‾‾‾╲
  couch BROW  🧱🧱[?]🧱       table MESA (RUN UNDER IT)
  ═╱‾‾╲════●══╱╲════════╱‾‾‾‾‾‾‾╲═══[S]══
  [K] toys: brick row (5) · gift block · under-table 🐛 ambush

      ACT 2 · STAIRCASE VALLEY (the big slope set-piece)
  ═╱╲╱╲╱╲╱╲╱╲╱╲~~gap4~~╱╲╱╲╱╲╱╲═[pipe]═══  ← pipe behind the TV → coin grotto
    toys: stair-slope run (signature) · pipe grotto · stomp chain across the gap

      ACT 3 · THE KITCHEN COUNTER CLIMB (test)
  ═╱╲╱╲╱╲[vines]╱‾╲╱╲~~gap5~~╱‾╲[?]╱╲╱╲~~~[S]~~~╱╲══ DOOR (seam)
    reward: spring chain + golden candle on the fridge shelf (SECRET-2, hidden behind the kettle)
```
**Seam:** the back door → out to the roofline (1-3). One Shad bubble: *"The party's on the ROOF?!"*
**Signature toy:** breaking — the first brick wall hides SECRET-3 (a full-heart room).
### 4.3 LEVEL 1-3 — "ROOFTOP RUSH → PARTY VALLEY" (teaches: nothing new — the EXAM)

Shingle slopes + kite hazards (kept flyer enemy flavor) + the world's biggest drop (camera
showcase) down into the backyard Party Valley → MOM's arena.

```
  dusk sky, Saskatoon far below (parallax, honest)     🪁 = kite foe (flyer)
  ═╱╲╱╲╱╲~~gap4~~🪁╱‾╲╱╲╱╲═[?]═╲~~gap5~~╱╲╱╲╱╲╱╲
    act 1: shingle slopes + kites · candle arcs teach the safe line
  ═╱‾‾╲══[S]══╱╲╱╲╱╲╱╲~~gap5~~╱╲╱╲╱╲╱╲═[S]═╱╲╱╲╱╲
    act 2: the chimney climb — springs + vines up 6 tiles (vertical camera MAX)
    SECRET-1: ledge behind the chimney · SECRET-2: break-brick wall in the attic window
  ═╲  ╲  ╲  ╲  ╲  ╲    THE BIG DROP (8 tiles — camera glides down after him)
  ════════╱‾‾‾‾╲═══[S][S]══╱╲╱╲╱╲╱╲╱╲~~~ FUNNEL ~~~▶ ┌──── MOM ARENA ────┐
    act 3: valley test · reward: spring chain + gold candle (SECRET-3 high shelf)
                                                     gates slide up · Mom fight on real terrain
                                                     win → party bridge builds → WORLD 2
```
**Seam:** valley funnel → arena gates rise (SMW lock). After the win the bridge builds itself
and Kinan walks into World 2's first step. NO victory screen — bubbles + a stats banner.
**Signature toy:** the big drop + spring-chain finale.

### 4.4 WORLD 1 SECRET LEDGER (the Level Designer delivers this table per level)

| Level | Secret-1 (visible) | Secret-2 (hidden) | Secret-3 (skill) | Golden candle |
|---|---|---|---|---|
| 1-1 | coin arc over gap 4 → ledge | fake wall at terrace (glint hint) | spring chain before the gate | inside Secret-2 |
| 1-2 | candle shelf behind the lamp | kettle-hidden fridge shelf | full-heart room behind first bricks | fridge shelf (Secret-2) |
| 1-3 | ledge behind the chimney | attic break-brick wall | high shelf via double spring | valley spring-chain shelf |

## 5. LEVEL DEFINITION OF DONE

- [ ] 3 acts on the paper design; ONE new idea; breath + reward screens placed.
- [ ] **Signature set-piece NAMED on the paper design** — the level's one handcrafted toy + its secrets
      are chosen by a human before any tiles are placed. Procedural chunks are connective tissue only
      (QC-1 FUN-001 design request — accepted by the Architect, 2026-10-26).
- [ ] 3 secrets + 1 golden candle, per the ledger (§3).
- [ ] Every screen has a toy (Contract §2.4) — QC-1 signs the audit.
- [ ] Seam walk-through: start of level → next level's start, Kinan never stops (Contract §4).
- [ ] Difficulty rules of §2 respected (gaps, hazards, enemies).
- [ ] **Would I play this level twice?** (Once for the win, once for the secrets — if not, redraw it.)
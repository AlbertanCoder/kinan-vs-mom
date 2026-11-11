# Season 2 level generator (docs/WORLDS-12-15-PLAN.md): python3 tools/season2/w12.py rewrites levels/w12/*.js, and so on.
# Season 2 level generator (Worlds 12-15). Builds level files from beats. Ground is solid rows 12-13 over a floor at
# row 14 (heights 224), so every gap is a hazard trench (the portal's glitch, lava, flood water...) and not a pit.
import json, os, random

GROUND = 12  # surface row (Kinan stands in row 11)

DROPS = ('tower', 'spring', 'chimney', 'highblock', 'stairs', 'shelves', 'glide', 'pool', 'dig', 'boards')
HAZ = ('gap', 'ropes', 'bars', 'rings', 'dashgap', 'glide', 'pool', 'chimney', 'tower', 'skatest')
def beat(fn):
    def w(self, *a, **k):
        if fn.__name__ in HAZ and self.route and self.route[-1][0] in DROPS: Act.open_area(self, 7)   # solid ground after a high drop
        self.route.append([fn.__name__, self.c, list(a), k]); r = fn(self, *a, **k); self.route[-1].append(self.c); return r
    return w

class Act:
    def __init__(self, L, aid, name):
        self.L = L; self.id = aid; self.name = name
        self.c = 0; self.ground = []; self.solid = []; self.tiles = {}; self.candles = []; self.foes = []
        self.ladders = []; self.vines = []; self.water = []; self.l_ropes = []; self.l_bars = []; self.l_rings = []
        self.updrafts = []; self.l_skate = []; self.hazards = []; self.secrets = []; self.talk = []; self.cps = [[2, GROUND]]
        self.golden = None; self.extra = {}; self.route = []; self.boss = None; self.goal = None; self.rand = random.Random(__import__('zlib').crc32((aid + L.id).encode()))
    # helpers
    def g(self, c0, c1): self.ground.append([c0, c1])
    def sol(self, c0, r0, c1, r1): self.solid.append([c0, r0, c1, r1])
    def tile(self, k, c, r, extra=None): self.tiles.setdefault(k, []).append([c, r] + ([extra] if extra else []))
    def cand(self, cells): self.candles += [list(x) for x in cells]
    def arc(self, c0, n, r=9, step=1):
        for k in range(n):
            mid = (n - 1) / 2; dy = int(round(abs(k - mid) * 0.6))
            self.candles.append([c0 + k * step, r + dy - 1])
    def foe(self, c, kind=None, r=None, fly=False):
        W = self.L.W
        if kind is None: kind = self.rand.choice(W['fly'] if fly else W['walk'])
        if r is None: r = 7 if kind in W['fly'] else GROUND - 1
        self.foes.append([c, r, kind])
    def say(self, col, who, text, secs=None, hold=False):
        self.talk.append([col, who, text] + ([None, 'hold'] if hold else []))   # (the game times each line: len / 15 s, 2.4-6 s; see Level.place_talk)

    # ---------------- beats ----------------
    @beat
    def run(self, n=12, foes=1, fly=False, hidden=False, cand=True):
        x = self.c; self.g(x, x + n - 1)
        if cand and n >= 6: self.arc(x + 2, min(5, n - 4), 10, 1)
        for k in range(foes): self.foe(x + 4 + (k * 5) % max(1, n - 5))
        if fly: self.foe(x + n // 2, fly=True)
        if hidden:   # an invisible gift block over the run: jump into it
            hc = x + n // 2; self.tile('gift', hc, 8, hidden if isinstance(hidden, str) else 'heart')
            self.secrets.append({'kind': 'hidden', 'col': hc, 'row': 8, 'prize': 'heart+candles', 'glint240': True})
        self.c += n
    @beat
    def gap(self, w=3):
        x = self.c; self.hazards.append([x, 13, x + w - 1, 14]); self.arc(x, w, 8); self.c += w
    @beat
    def stairs(self):
        x = self.c; self.g(x, x + 10)
        self.sol(x + 1, 10, x + 3, 11); self.sol(x + 4, 8, x + 6, 11); self.sol(x + 7, 10, x + 9, 11)
        self.cand([[x + 2, 9], [x + 5, 7], [x + 8, 9]]); self.tile('shelf', x + 5, 4); self.tile('shelf', x + 6, 4); self.cand([[x + 5, 3], [x + 6, 3]])
        self.c += 11
    @beat
    def highblock(self, gift='candle'):
        x = self.c; self.g(x, x + 9); self.sol(x + 3, 8, x + 6, 11); self.cand([[x + 4, 7], [x + 5, 7]])
        self.tile('gift', x + 8, 7, gift); self.foe(x + 1); self.c += 10
    @beat
    def shelves(self, visible=None):
        x = self.c; self.g(x, x + 13)
        for c in range(x + 2, x + 6): self.tile('shelf', c, 9)
        for c in range(x + 7, x + 11): self.tile('shelf', c, 6)
        self.cand([[x + 3, 8], [x + 4, 8], [x + 8, 5], [x + 9, 5]]); self.foe(x + 6, fly=True)
        if visible:
            self.tile('gift', x + 9, 2, visible); self.secrets.append({'kind': 'visible', 'col': x + 9, 'row': 2, 'prize': visible})
        else: self.tile('gift', x + 9, 2, 'candle')
        self.c += 14
    @beat
    def spring(self, visible=None):
        x = self.c; self.g(x, x + 11); self.tile('spring', x + 2, GROUND)
        for c in range(x + 1, x + 9): self.tile('shelf', c, 3)
        self.cand([[x + 3, 2], [x + 4, 2], [x + 5, 2], [x + 6, 2]])
        p = visible or 'candle'; self.tile('gift', x + 7, -1, p)
        if visible: self.secrets.append({'kind': 'visible', 'col': x + 7, 'row': -1, 'prize': visible})
        self.foe(x + 9); self.c += 12
    @beat
    def tower(self, kind='ladder', visible=None, top=5):
        x = self.c; self.g(x, x + 12); self.sol(x + 2, top, x + 8, 11)
        (self.ladders if kind == 'ladder' else self.vines).append([x + 1, top, 11])
        self.cand([[x + 1, top + 2], [x + 1, top + 4], [x + 3, top - 1], [x + 5, top - 1], [x + 7, top - 1]])
        if visible: self.tile('gift', x + 5, top - 4, visible); self.secrets.append({'kind': 'visible', 'col': x + 5, 'row': top - 4, 'prize': visible})
        self.foe(x + 6, r=top - 1); self.c += 13
    @beat
    def pool(self, n=10, golden=False, fish=2):
        x = self.c; self.g(x, x + 2); self.sol(x, 9, x + 2, 11)          # left bank (3 rows up)
        w0 = x + 3; w1 = x + 3 + n - 1
        self.water.append([w0, 9, w1, 13])                                  # deep water down to the floor (row 14)
        self.g(w1 + 1, w1 + 3); self.sol(w1 + 1, 9, w1 + 3, 11)            # right bank
        self.cand([[w0 + 2, 11], [w0 + 4, 12], [w0 + 6, 12], [w1 - 1, 11]])
        for k in range(fish): self.foe(w0 + 2 + k * (n // max(1, fish)), self.L.W.get('fish', 'fish'), r=11)
        if golden:
            self.golden = {'col': w0 + n // 2, 'row': 13}; self.secrets.append({'kind': 'hidden', 'col': w0 + n // 2, 'row': 13, 'prize': 'GOLDEN CANDLE'})
        self.c = w1 + 4
    @beat
    def tunnel(self, n=9, golden=False):
        x = self.c; self.g(x, x + n + 3); self.sol(x + 2, 4, x + n + 1, 10)   # a crawl space one tile high (row 11)
        self.cand([[x + 3 + k, 11] for k in range(0, n - 1, 2)])
        if golden: self.golden = {'col': x + 2 + n // 2, 'row': 11}; self.secrets.append({'kind': 'hidden', 'col': x + 2 + n // 2, 'row': 11, 'prize': 'GOLDEN CANDLE'})
        self.cand([[x + 4, 3], [x + 6, 3]]); self.foe(x + n, fly=True)
        self.c += n + 4
    @beat
    def chimney(self):
        x = self.c; self.g(x, x + 15); self.sol(x + 2, 3, x + 2, 9); self.sol(x + 6, 3, x + 14, 11)
        self.cand([[x + 4, 8], [x + 4, 5], [x + 9, 2], [x + 11, 2]]); self.foe(x + 12, r=2)
        self.c += 16
    @beat
    def ropes(self, n=10):
        n = min(n, 10); x = self.c; self.hazards.append([x, 13, x + n - 1, 14])
        self.l_ropes.append([x + 1, 5, 5]); self.l_ropes.append([x + n - 4, 4, 5]); self.cand([[x + 1, 10], [x + n // 2, 7], [x + n - 4, 9]])
        self.c += n
    @beat
    def bars(self, n=10):
        x = self.c; self.hazards.append([x, 13, x + n - 1, 14]); self.l_bars.append([x - 1, x + n, 8])
        self.cand([[x + k, 10] for k in range(1, n - 1, 3)]); self.c += n
    @beat
    def rings(self, n=10):
        x = self.c; self.hazards.append([x, 13, x + n - 1, 14]); self.l_rings += [[x + 2, 6], [x + n - 3, 6]]
        self.cand([[x + 2, 9], [x + n - 3, 9]]); self.c += n
    @beat
    def dashgap(self, n=7):
        x = self.c; self.hazards.append([x, 13, x + n - 1, 14]); self.cand([[x + k, 9] for k in range(1, n, 2)]); self.c += n
    @beat
    def boards(self):
        x = self.c; self.g(x, x + 6); self.sol(x + 3, 2, x + 4, 7)
        for c in (x + 3, x + 4):
            for r in range(8, 12): self.tile('board', c, r)
        self.cand([[x + 6, 10]]); self.c += 7
    @beat
    def dig(self, golden=False):   # cracked ground: a butt slam (or the shovel) drops into a crawl chamber, out through a hole
        x = self.c; self.g(x, x + 1)
        for c in range(x + 2, x + 5): self.tile('crack', c, GROUND)
        self.sol(x + 2, 13, x + 9, 13) if False else None
        self.g(x + 5, x + 9)       # ground over the chamber (row 13 below is open)
        self.extra.setdefault('open', []).append([x + 2, 13, x + 9, 13])
        self.g(x + 12, x + 15)     # x+10..x+11: the hole up (no ground)
        self.cand([[x + 4 + k, 13] for k in range(0, 5, 2)])
        if golden: self.golden = {'col': x + 8, 'row': 13}; self.secrets.append({'kind': 'hidden', 'col': x + 8, 'row': 13, 'prize': 'GOLDEN CANDLE'})
        self.hazards  # (none: the chamber is safe)
        self.c += 16
    @beat
    def glide(self, n=16):
        x = self.c; self.g(x, x + 4); self.sol(x + 1, -2, x + 4, 11); self.ladders.append([x, -2, 11])
        self.hazards.append([x + 5, 13, x + 5 + n - 1, 14]); self.updrafts.append([x + 5 + n // 2 - 2, -8, x + 5 + n // 2 + 1, 12])
        self.cand([[x + 6 + k, 2 + (k % 3)] for k in range(0, n - 2, 3)])
        self.c = x + 5 + n
    @beat
    def skatest(self, n=40, gaps=2):
        x = self.c; self.l_skate.append([x, x + n - 1]); seg = n // (gaps + 1); c = x
        for k in range(gaps + 1):
            e = min(x + n - 1, c + seg - 1) if k < gaps else x + n - 1
            self.g(c, e - (3 if k < gaps else 0)); self.arc(c + 3, 5, 9)
            if k < gaps: self.hazards.append([e - 2, 13, e, 14])
            c = e + 1
        self.foe(x + seg // 2); self.c = x + n
    @beat
    def open_area(self, n): self.g(self.c, self.c + n - 1); self.c += n

    def js(self):
        H = [224] * self.c
        sol = [[a, GROUND, b, 13] for a, b in self.ground] + self.solid
        a = {'id': self.id, 'name': self.name, 'cols': self.c, 'heights': '@H%d' % self.c}
        if self.extra.get('dark'): a['dark'] = self.extra['dark']
        a['s2checkpoints'] = self.cps
        if self.talk: a['talk'] = self.talk
        a['solid'] = sol
        if self.extra.get('open'): a['open'] = self.extra['open']
        if self.tiles: a['tiles'] = self.tiles
        for k in ('ladders', 'vines', 'water', 'ropes', 'bars', 'rings', 'updrafts', 'skate', 'hazards'):
            v = getattr(self, 'l_' + k if k in ('ropes', 'bars', 'rings', 'skate') else k)
            if v: a[k] = v
        if self.hazards: a['hazard'] = self.extra.get('hazard') or self.L.hazard
        if self.golden: a['goldenCandle'] = self.golden
        if self.secrets: a['secrets'] = self.secrets
        a['candles'] = self.candles; a['foes'] = self.foes
        if self.boss: a['s2boss'] = self.boss
        if self.goal: a['goal'] = self.goal
        return a

class Level:
    def __init__(self, W, lid, slot, name, theme, hazard='glitch', flags=None, up=14):
        self.W = W; self.id = lid; self.slot = slot; self.name = name; self.theme = theme; self.hazard = hazard
        self.flags = flags or {}; self.acts = []; self.up = up
    def place_talk(self):
        """Shad's audit (2026-11-10): nobody talks over anyone and every line is heard. The game says one line at a time and
        skips a line once Kinan is 48 columns past it, unless its conversation has started (lines within 3 columns of each
        other). So: lines written close together (within 15 columns) become one conversation, and a conversation that would
        still be waiting when a fast runner (12 columns a second) is 40 columns past it moves on to where the one before ends."""
        RUN = 15.0; secs = lambda t: max(2.4, min(6.0, len(t) / 15.0)) + 0.6
        base = 0; lines = []
        for a in self.acts:
            for t in a.talk: lines.append([base + t[0], t[1], t[2], a, base, len(t) > 4])
            base += a.c
        lines.sort(key=lambda l: l[0])
        groups = []
        lines.sort(key=lambda l: l[0])
        for l in lines:
            if groups and l[0] - groups[-1][-1][0] <= 15 and l[3] is groups[-1][-1][3]: groups[-1].append(l)
            else: groups.append([l])
        for g in groups:
            for k, l in enumerate(g): l[0] = g[0][0] + k   # one conversation: one column apart (the game keeps it together)
        self.talk_moves = []
        for _pass in range(10):   # a moved conversation can land after another one: re-plan in the new order until nothing moves
            groups.sort(key=lambda g: g[0][0]); moved = False; free = 0.0; wait = 0.0   # wait: seconds Kinan stood still for 'hold' lines
            for g in groups:
                c = g[0][0]; a = g[0][3]; b0 = g[0][4]; held = any(l[5] for l in g)
                if held:   # a lesson (Sabumnim's call, a new tool): it stays where it is, and Kinan stands still to hear it
                    arrive = c / RUN + wait; start = max(arrive, free); free = start + sum(secs(l[2]) for l in g)
                    last = max(k for k, l in enumerate(g) if l[5])   # the game holds him until the last 'hold' line is said
                    wait += start + sum(secs(l[2]) for l in g[:last + 1]) - arrive
                    continue
                if free > (c + 28) / RUN + wait:   # it would be skipped: start it where the queue is free (inside its act)
                    nc = min(b0 + a.c - 4, int((free - wait) * RUN) - 20)
                    if nc > c:
                        self.talk_moves.append((g[0][1], c - b0, nc - b0, ' / '.join(l[1] + ': ' + l[2][:40] for l in g)))
                        for k, l in enumerate(g): l[0] = nc + k
                        c = nc; moved = True
                free = max(free, c / RUN + wait) + sum(secs(l[2]) for l in g)
            if not moved: break
        for a in self.acts: a.talk = []
        for l in lines: l[3].talk.append([l[0] - l[4], l[1], l[2]] + ([None, 'hold'] if l[5] else []))
        for mv in self.talk_moves: print('  %s: col %d -> %d  %s' % (self.id, mv[1], mv[2], mv[3]))

    def act(self, name):
        a = Act(self, 'a%d' % (len(self.acts) + 1), name); self.acts.append(a); return a
    def write(self, path, header):
        last = self.acts[-1]
        if not last.goal: last.goal = {'col': last.c - 3, 'row': GROUND - 1}
        d = {'id': self.id, 'world': self.W['n'], 'slot': self.slot, 'name': self.name, 'theme': self.theme, 'up': self.up, 'moves': True}
        d.update(self.flags); d['treat'] = self.W['treat']; d['heartEvery'] = 50; d['maxHearts'] = 4
        d['spawn'] = {'col': 2, 'row': getattr(self, 'spawn_row', GROUND - 1)}
        # every screen (27 cols) needs a toy: add a candle gift over the ground where one is missing
        base = 0; toys = set(); ground = set()
        for a in self.acts:
            for k, v in a.tiles.items():
                for cell in v: toys.add(base + cell[0])
            for f in a.foes: toys.add(base + f[0])
            for s2 in a.secrets: toys.add(base + s2['col'])
            for g0, g1 in a.ground:
                for c in range(g0, g1 + 1): ground.add((base + c, a))
            base += a.c
        total = base
        for sc in range(0, total, 27):
            if any(c in toys for c in range(sc, min(total, sc + 27))): continue
            cands = sorted([(c, a) for (c, a) in ground if sc <= c < sc + 27], key=lambda t: abs(t[0] - (sc + 13)))
            if cands:
                c, a = cands[0]; b0 = sum(x.c for x in self.acts[:self.acts.index(a)]); a.tile('gift', c - b0, 8, 'candle'); toys.add(c)
        self.place_talk()
        d['areas'] = [a.js() for a in self.acts]
        s = json.dumps(d, indent=None, separators=(', ', ': '))
        s = s.replace('"@H', '@H')
        import re
        s = re.sub(r'@H(\d+)"', lambda m: 'h(%s)' % m.group(1), s)
        s = s.replace('}, {"id"', '},\n    {"id"').replace('"areas": [{', '"areas": [\n    {')
        out = '/* ' + header + '\n   GENERATED by the Season 2 level generator (docs/WORLDS-12-15-PLAN.md); ground is solid rows 12-13, every gap a hazard. */\n'
        out += '(function () {\n  var h = function (n) { var a = []; for (var i = 0; i < n; i++) a.push(224); return a; };\n  KinanLevels.register(' + s + ');\n})();\n'
        os.makedirs(os.path.dirname(path), exist_ok=True)
        R = []; base = 0
        for a in self.acts:
            for e in a.route: R.append([e[0], base + e[1], e[2], e[3], base + (e[4] if len(e) > 4 else e[1])])
            base += a.c
        RD = os.environ.get('KV_ROUTES')   # the play-through robot's route (a folder ending in /), only when asked
        if RD:
            os.makedirs(RD, exist_ok=True)
            json.dump({'id': self.id, 'route': R, 'cols': base}, open(RD + self.id + '.json', 'w'))
        open(path, 'w').write(out)

# ---------------- big pieces ----------------
def descent(a, top=-18, step=2, w=4):
    a.route.append(['descent', a.c, [top], {}])
    """from a high ledge (row top) down to the ground in terraces (a step-well going down)"""
    x = a.c; r = top
    a.sol(x, r, x + 7, 13); a.cps = [[2, r]]; a.L.spawn_row = r - 1
    a.cand([[x + 3, r - 2], [x + 5, r - 2]]); x += 8
    while r < GROUND:
        r = min(GROUND, r + step); a.sol(x, r, x + w - 1, 13); a.cand([[x + 1, r - 1]])
        if (x // w) % 3 == 0: a.foe(x + 1, fly=True, r=r - 3)
        x += w
    a.c = x

def arena(a, look, holes=None, width=30):
    a.route.append(['arena', a.c, [look], {}])
    """a popper fight (the mole's rules): a floor, two side shelves (row 8) with ladders at their outer ends, a middle shelf (row 4)"""
    x = a.c; a.g(x, x + width + 3)
    c0 = x + 1; c1 = x + width + 1
    for c in range(c0 + 2, c0 + 9): a.tile('shelf', c, 8)
    for c in range(c1 - 8, c1 - 1): a.tile('shelf', c, 8)
    for c in range(c0 + 11, c1 - 10): a.tile('shelf', c, 4)
    a.ladders += [[c0 + 2, 8, 11], [c1 - 2, 8, 11]]
    mid = (c0 + c1) // 2
    hs = holes or [[mid - 6, 11], [mid, 11], [mid + 6, 11], [c0 + 5, 7], [c1 - 5, 7], [mid, 3]]
    a.boss = {'kind': 'popper', 'look': look, 'col0': c0, 'col1': c1, 'rowTop': 1, 'holes': hs}
    a.cps = [[2, GROUND], [c0 - 3, GROUND]]
    a.c = x + width + 4

def shaft(a, look, summit=None, floors=5, conns=None, say=None, done=None, after=None, width=28, spd=0.7):
    a.route.append(['shaft', a.c, [look, summit, floors, width], {}])
    """the castle's climb: a shaft (walls at x+0 and x+31) with one-way floors every 6 rows; the rise starts as Kinan walks in.
    summit: a creature at the top (frog / tanuki / iguana / gargoyle), or None (a chase: reach the top and it stops)"""
    x = a.c; a.g(x, x + width + 3)
    L0, R0 = x + 1, x + width            # inside the walls
    S = GROUND - 6 * (floors + 1)     # the summit row
    a.sol(x, S - 10, x, 8); a.sol(x + width + 1, S - 10, x + width + 1, 11); a.sol(x, S - 10, x + width + 1, S - 10)
    conns = conns or ['ladder'] * (floors + 1)
    prev = GROUND
    for k in range(floors + 1):
        row = GROUND - 6 * (k + 1)
        right = k % 2 == 0
        cc = R0 - 3 if right else L0 + 3           # the connector's column
        kind = conns[k % len(conns)]
        last = k == floors
        lo, hi = L0, R0
        for c in range(lo, hi + 1): a.tile('shelf', c, row)
        (a.vines if kind == 'vine' else a.ladders).append([cc, row, prev - 1])
        a.cand([[(lo + hi) // 2 - 2, row - 1], [(lo + hi) // 2, row - 1], [(lo + hi) // 2 + 2, row - 1]])
        if not last and k % 2 == 1: a.foe((lo + hi) // 2, fly=True, r=row - 3)
        prev = row
    b = {'kind': 'rise', 'look': look, 'col0': L0, 'col1': R0, 'startCol': L0 + 2, 'stopRow': S + 2, 'summitRow': S, 'spd': spd}
    if summit: b.update({'summit': summit, 'crab': [L0 + 1, R0 - 5], 'gateCol': R0 - 3})
    if say: b['say'] = say
    if done: b['done'] = done
    if after: b['after'] = after
    a.boss = b
    a.cps = [[2, GROUND]]
    a.goal = {'col': R0 - 1, 'row': S - 1}
    a.summit = S
    a.c = x + width + 4
    return S

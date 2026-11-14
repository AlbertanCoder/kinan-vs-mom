# Season 2 level generator (docs/WORLDS-12-15-PLAN.md): python3 tools/season2/w12.py rewrites levels/w12/*.js, and so on.
# Season 2 level generator (Worlds 12-15). Builds level files from beats. Ground is solid rows 12-13 over a floor at
# row 14 (heights 224), so every gap is a hazard trench (the portal's glitch, lava, flood water...) and not a pit.
import json, os, random

GROUND = 12  # surface row (Kinan stands in row 11)

DROPS = ('tower', 'spring', 'chimney', 'highblock', 'stairs', 'shelves', 'glide', 'pool', 'dig', 'boards')
HAZ = ('gap', 'ropes', 'bars', 'rings', 'dashgap', 'glide', 'pool', 'chimney', 'tower', 'skatest')
SWINGS = ('gap', 'ropes', 'rings', 'bars', 'dashgap')
def beat(fn):
    def w(self, *a, **k):
        if fn.__name__ in HAZ and self.route and self.route[-1][0] in DROPS: Act.open_area(self, 7)   # solid ground after a high drop
        # a pool's raised rim right after a swing: the last fling hit the rim and bounced him back into the gap (2026-11-11, 13-secret)
        # two pits back to back made one long one (14-6: a dash gap then a gap, 10 wide): ground between them
        elif fn.__name__ in SWINGS and self.route and self.route[-1][0] in SWINGS: Act.open_area(self, 9 if self.route[-1][0] == 'dashgap' else 5)   # (a dash carries him ~5 tiles)
        # a pit right at a tunnel's mouth: the low roof stops the jump (14-6: every kid fell in): room to run up first
        elif fn.__name__ in SWINGS and self.route and self.route[-1][0] == 'tunnel': Act.open_area(self, 3)
        elif fn.__name__ == 'pool' and self.route and self.route[-1][0] in ('ropes', 'rings', 'bars', 'dashgap', 'gap'): Act.open_area(self, 4)
        self.route.append([fn.__name__, self.c, list(a), k]); r = fn(self, *a, **k); self.route[-1].append(self.c); return r
    return w

def talk_hash(who, text):
    """index.html talkHash: FNV-1a over SPEAKER + '|' + words (UTF-16 code units), 8 hex digits"""
    h = 0x811c9dc5; b = (who + '|' + text).encode('utf-16-le')
    for i in range(0, len(b), 2): h = ((h ^ (b[i] | b[i + 1] << 8)) * 0x01000193) & 0xffffffff
    return '%08x' % h

def load_clips():
    """the recorded lines' lengths (audio/talk/clips*.js: hash -> seconds), so the talk spacing knows how long each line is"""
    import re
    out = {}; d = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'audio', 'talk')
    for f in ('clips.js', 'clips-all.js'):
        try:
            for h, v in re.findall(r'"([0-9a-f]{8})": ([0-9.]+)', open(os.path.join(d, f), encoding='utf-8').read()): out[h] = float(v)
        except OSError: pass
    return out
CLIPS = load_clips()

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
        x = self.c; self.g(x, x + n - 1); t = self.L.tier
        if t >= 0.55 and n >= 10: foes = min(foes + 1, n // 5)            # busier runs later on
        if t >= 0.75 and n >= 12 and not fly and foes and self.rand.random() < 0.5: fly = True
        if cand and n >= 6: self.arc(x + 2, min(5, n - 4), 10, 1)
        if x == 0: foes = 0; fly = False   # an act's first steps (the spawn, a checkpoint): nothing walks or flies into Kinan
                                            # while its first line is said (2026-11-11: a foe stood 2 columns from the spawn)
        used = []   # two foes never start on the same tile (2026-11-11 robot sweep: a run of 10 put both at x + 4, 62 times)
        for k in range(foes):
            m = max(1, n - 5); o = (k * 5) % m
            while o in used and len(used) < m: o = (o + 3) % m
            used.append(o); self.foe(x + 4 + o)
        if fly: self.foe(x + n // 2, fly=True)
        if hidden:   # an invisible gift block over the run: jump into it
            hc = x + n // 2; self.tile('gift', hc, 8, hidden if isinstance(hidden, str) else 'heart')
            self.secrets.append({'kind': 'hidden', 'col': hc, 'row': 8, 'prize': 'heart+candles', 'glint240': True})
        self.c += n
    @beat
    def gap(self, w=3):
        w = min(5, w + (self.L.tier >= 0.45) + (self.L.tier >= 0.8))   # wider later on (he clears 6)
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
        # (2026-11-11 playthrough: the 2 candles on the tunnel's roof (7 rows up) were out of reach, and the flying foe started
        # inside the roof block: both gone; a walker comes out of the tunnel's far end instead)
        self.foe(x + n + 2)
        self.c += n + 4
    @beat
    def chimney(self):
        x = self.c; self.g(x, x + 15); self.sol(x + 2, 3, x + 2, 9); self.sol(x + 6, 3, x + 14, 11)
        self.cand([[x + 4, 8], [x + 4, 5], [x + 9, 2], [x + 11, 2]]); self.foe(x + 12, r=2)
        self.c += 16
    @beat
    def ropes(self, n=10, practice=None):
        """2026-11-14, the real rope (Shad: "too easy... not even a challenge"; his answers: wider gaps with the ropes farther
        apart, chains of 3-4 ropes, ropes at different heights, a practice rope first). Kinan pumps the swing (◀ ▶), climbs
        (▲ ▼) and lets go with the swing. Measured throws (the rope lab): a small swing carries him ~4 tiles past the peg, a
        35-degree one ~7, a big one with a good let-go 8-10. So: the first rope of a level's first rope gap in 13-1 is a
        practice rope over a soft pit (a miss puts him back on the bank, no heart); after it the gaps grow through Japan:
        2 ropes 5 apart, then 3 ropes 6 apart (some higher or lower), then 3-4 ropes 7 apart. The ropes of Worlds 14-15 are
        the hardest kind. `n` is ignored (the old width)."""
        L = self.L; L.rope_n = getattr(L, 'rope_n', 0) + 1
        rd = 1.0 if L.W['n'] != 13 else max(0.0, min(1.0, (L.tier - 0.25) / 0.24))   # 0 at 13-1, 1 at 13-castle
        rd = min(rd, getattr(L, 'rope_rd_max', 1.0))
        if practice is None: practice = L.id == '13-1' and L.rope_n == 1
        x = self.c; lead = 2
        if practice: k, sp, tail = 1, 0, 4
        else:
            k = 2 if rd < 0.3 else 3 if rd < 0.7 else 4
            if k > 2 and self.rand.random() < 0.35: k -= 1   # (a mix: not every gap the longest chain)
            sp = 5 + int(round(2 * rd)); tail = 4 + (1 if rd >= 0.5 else 0)
        while k > 2 and lead + (k - 1) * sp + tail > 26: k -= 1   # (never a whole screen of pit: 27 columns)
        w = lead + (k - 1) * sp + tail
        self.hazards.append([x, 13, x + w - 1, 14] + (['soft'] if practice else []))
        for i in range(k):
            c = x + lead + i * sp
            if i == 0 or rd < 0.35: row, ln = 4, 7               # hangs to just above the pit: a jump off the bank catches it
            else:
                row = 4 + self.rand.choice([-1, 0, 1]); ln = 11 - row - self.rand.choice([0, 1, 2])   # its end at row 9, 10 or 11
            self.l_ropes.append([c, row, ln])
            self.cand([[c, row + ln + 1]] if i == 0 else [[c - sp // 2, 8]])   # under the first rope's end; between the ropes
            if i == k - 1 and rd >= 0.2: self.cand([[c, row + 2]])             # high on the last rope: climb up for it
        self.cand([[x + w - 2, 9]])
        self.c += w
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
        self.foe(x + seg // 2 + (seg if x == 0 else 0)); self.c = x + n   # (never in an act's first steps)
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
        # 2026-11-11 (the owner: "fair, a little challenge, getting harder as you go"): how far into Season 2 this level is,
        # 0 at 12-1 to 1 at 15-castle. Gaps widen, runs get busier and the castle climbs rise faster as it grows.
        order = ['1', '2', '3', '4', 'fort', '5', '6', '7', 'secret', '8', 'castle']
        k = lid.split('-')[1]; self.tier = ((W['n'] - 12) * 11 + (order.index(k) if k in order else 0)) / 43.0
    def place_talk(self):
        """Shad's audit (2026-11-10): nobody talks over anyone and every line is heard. The game says one line at a time and
        skips a line once Kinan is 48 columns past it, unless its conversation has started (lines within 3 columns of each
        other). So: lines written close together (within 15 columns) become one conversation, and a conversation that would
        still be waiting when a fast runner (12 columns a second) is 40 columns past it moves on to where the one before ends."""
        RUN = 8.0   # columns a second: a kid who keeps running (2026-11-11: the recorded voices take about 11 letters a second,
                    # so a line is 5-12 s; a flat-out sprint (15 a second) outruns the talk, and the game drops a line 48 columns late)
        def secs(t, who=None):   # how long the game keeps a line up: its reading time, or its recording + 0.4 s when that is longer
            read = max(2.4, min(6.0, len(t) / 15.0)); clip = CLIPS.get(talk_hash(who, t)) if who else None
            return (max(read, clip + 0.4) if clip else read) + 0.6
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
        if groups and groups[0][0][0] <= 3 and groups[0][0][4] == 0:   # the level's opening conversation starts the moment the level does
            for l in groups[0]: l[0] = 1                                 # (Kinan stands at column 2: a line there waited for his first step)
        self.talk_moves = []
        # (2026-11-14, Shad: nobody talks over a rope or a ring gap) the swing gaps, in level columns: a conversation that would
        # start just before one (within ~3 s at a kid's pace) or on it starts just after it instead (inside its act)
        swings = []; b = 0
        for a in self.acts:
            for r in a.route:
                if r[0] in ('ropes', 'rings') and len(r) > 4: swings.append((b + r[1], b + r[-1], a, b))
            b += a.c
        def off_swings(g):
            if any(l[5] for l in g): return False   # a lesson: Kinan stands still to hear it, before the gap
            c = g[0][0]
            for s0, s1, a, b0 in swings:   # it would START within ~3 s of the gap (24 columns at a kid's pace) or on it
                if s0 - 24 <= c <= s1 + 1 and a is g[0][3] and s1 + 3 < b0 + a.c - 4:
                    self.talk_moves.append((g[0][1], c - b0, s1 + 3 - b0, '(off the swing gap) ' + ' / '.join(l[1] + ': ' + l[2][:30] for l in g)))
                    for k, l in enumerate(g): l[0] = s1 + 3 + k
                    return True
            return False
        for _pass in range(10):
            if not any(off_swings(g) for g in groups): break
        for _pass in range(10):   # a moved conversation can land after another one: re-plan in the new order until nothing moves
            groups.sort(key=lambda g: g[0][0]); moved = False; free = 0.0; wait = 0.0   # wait: seconds Kinan stood still for 'hold' lines
            for g in groups:
                c = g[0][0]; a = g[0][3]; b0 = g[0][4]; held = any(l[5] for l in g)
                if held:   # a lesson (Sabumnim's call, a new tool): it stays where it is, and Kinan stands still to hear it
                    arrive = c / RUN + wait; start = max(arrive, free); free = start + sum(secs(l[2], l[1]) for l in g)
                    last = max(k for k, l in enumerate(g) if l[5])   # the game holds him until the last 'hold' line is said
                    wait += start + sum(secs(l[2], l[1]) for l in g[:last + 1]) - arrive
                    continue
                if free > (c + 28) / RUN + wait:   # it would be skipped: start it where the queue is free (inside its act)
                    nc = min(b0 + a.c - 4, int((free - wait) * RUN) - 20)
                    if nc > c:
                        self.talk_moves.append((g[0][1], c - b0, nc - b0, ' / '.join(l[1] + ': ' + l[2][:40] for l in g)))
                        for k, l in enumerate(g): l[0] = nc + k
                        c = nc; moved = True
                free = max(free, c / RUN + wait) + sum(secs(l[2], l[1]) for l in g)
            if not moved: break
        for g in groups:   # (a check: what the queue moved back over a swing gap)
            c = g[0][0]
            if not any(l[5] for l in g) and any(s0 - 24 <= c <= s1 for s0, s1, a, b0 in swings): print('  %s: NOTE talk over a swing gap at col %d: %s' % (self.id, c, g[0][2][:40]))
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
            # (never in or beside a tower, a wall or a ladder: 2026-11-11, a gift next to the glide tower blocked its climb)
            free = lambda c, a, b0: not any(r[0] - 3 <= c - b0 <= r[2] + 3 and r[1] <= 9 for r in a.solid) and not any(abs(l[0] - (c - b0)) <= 3 for l in a.ladders + a.vines) and not any(abs(r[0] - (c - b0)) <= 7 for r in a.l_ropes)   # (nor in a rope's swing)
            cands = sorted([(c, a) for (c, a) in ground if sc <= c < sc + 27 and free(c, a, sum(x.c for x in self.acts[:self.acts.index(a)]))], key=lambda t: abs(t[0] - (sc + 13)))
            if not cands:   # (a short last screen beside a wall: anywhere not inside a solid)
                cands = sorted([(c, a) for (c, a) in ground if sc <= c < sc + 27 and not any(r[0] <= c - sum(x.c for x in self.acts[:self.acts.index(a)]) <= r[2] and r[1] <= 8 <= r[3] for r in a.solid)], key=lambda t: abs(t[0] - (sc + 13)))
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

def shaft(a, look, summit=None, floors=5, conns=None, say=None, done=None, after=None, width=28, spd=None):
    a.route.append(['shaft', a.c, [look, summit, floors, width], {}])
    """the castle's climb: a shaft (walls at x+0 and x+31) with one-way floors every 6 rows; the rise starts as Kinan walks in.
    summit: a creature at the top (frog / tanuki / iguana / gargoyle), or None (a chase: reach the top and it stops)"""
    if spd is None: spd = round(0.64 + 0.14 * a.L.tier, 3)   # the castle climbs rise a little faster each world
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

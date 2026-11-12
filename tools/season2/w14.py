import sys; sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from lvgen import *
OUT = __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..', '..', 'levels') + '/w14/'
W = {'n': 14, 'treat': 'churro', 'walk': ['roadrunner', 'scorpion', 'gecko', 'scorpion'], 'fly': ['pinata', 'alebrije', 'crow'], 'fish': 'fish'}
HD = "WORLD 14 - MEXICO, Shad's world (docs/STORY-BIBLE.md, docs/WORLDS-12-15-PLAN.md). Move: DASH KICK. Tool: Shad's shovel (slam to dig). Candles are churros."

def lv(lid, slot, name, theme, **kw): return Level(W, lid, slot, name, theme, flags={'crawl': True, 'dash': True}, **kw)

# ---- 14-1 MEXICO CITY MARKET ----
L = lv('14-1', 1, 'MEXICO CITY MARKET', 340)
a = L.act('THE MARKET STALLS')
a.say(2, 'SHAD', 'MEXICO, bud! I have wanted to come here my whole life. Smell that? Churros!')
a.say(10, 'SHAD', 'Tacos, elote, tamales... I am trying EVERYTHING. Hola! Gracias!')
a.run(14); a.shelves(); a.gap(3); a.run(10, fly=True); a.tunnel(8); a.run(10)
a.say(a.c - 4, 'KINAN', 'Sabumnim is calling! I bet it is a new move!', hold=True)
a.say(a.c - 1, 'SABUMNIM', 'The flying kick, Kinan. Jump, then KICK in the air. You fly forward like an arrow.', 4.2, hold=True)
a.dashgap(6); a.run(12)
a = L.act('THE PINATA PLAZA')
a.say(3, 'CHENOA', 'Little bro, every wall here is a different colour. Pink, blue, yellow... I love it!')
a.run(12, hidden=True); a.boards(); a.run(8); a.dashgap(6); a.run(10); a.shelves(visible='heart'); a.gap(3); a.run(10)
a = L.act('THE FLOWER STREET')
a.say(3, 'DAD', 'Kinan, what do you call a sleeping taco? A NACHO-RMAL taco!')
a.say(8, 'KINAN', "Dad. That doesn't even make sense.")
a.run(12, foes=2); a.dashgap(7); a.run(10); a.boards(); a.tunnel(9, golden=True); a.gap(3); a.run(12)
L.write(OUT + 'l01.js', HD)

# ---- 14-2 THE PYRAMID OF THE SUN ----
L = lv('14-2', 2, 'THE PYRAMID OF THE SUN', 341)
a = L.act('THE AVENUE OF THE DEAD')
a.say(2, 'SHAD', 'Teotihuacan! People built this city about 2000 years ago. Bud, it is HUGE.')
a.run(14); a.stairs(); a.dashgap(6); a.run(10, fly=True); a.highblock(); a.run(12)
a = L.act('THE BIG CLIMB')
a.say(3, 'MOM', 'All those steps! Kinan, stay close and watch your feet.')
a.run(12); a.tower('ladder', visible='heart', top=3); a.dashgap(7); a.run(10, hidden=True); a.stairs(); a.boards(); a.run(10)
a = L.act('THE TOP OF THE PYRAMID')
a.say(3, 'SHAD', 'From up here you can see the whole valley. The people who built this were amazing.')
a.run(12); a.chimney(); a.dashgap(6); a.run(10); a.pool(9, golden=True); a.gap(3); a.run(12)
L.write(OUT + 'l02.js', HD)

# ---- 14-3 THE XOCHIMILCO CANALS ----
L = lv('14-3', 3, 'THE XOCHIMILCO CANALS', 342)
a = L.act('THE FLOWER BOATS')
a.say(2, 'ANNIE', 'The canals of Xochimilco! The boats are painted in every colour. Que bonito!')
a.run(12); a.pool(10); a.run(10, fly=True); a.dashgap(6); a.run(10); a.pool(10); a.run(10)
a = L.act('THE MARIACHI BOAT')
a.say(3, 'DAD', 'A boat with a whole band on it! Mom, may I have this dance?')
a.say(8, 'MOM', 'Robin, we are on a BOAT.')
a.run(12, hidden=True); a.shelves(visible='heart'); a.pool(12, golden=True); a.dashgap(6); a.run(10)
a = L.act('THE GARDEN ISLANDS')
a.say(3, 'CHENOA', 'They grow flowers on little floating gardens. Little bro, that is SO cool.')
a.run(12); a.boards(); a.pool(10); a.tunnel(8); a.dashgap(7); a.run(12)
L.write(OUT + 'l03.js', HD)

# ---- 14-4 THE DIG SITE ----
L = lv('14-4', 4, 'THE DIG SITE', 343)
a = L.act("SHAD'S SHOVEL")
a.say(2, 'SHAD', 'A real dig site, bud! Here, take my little shovel. Jump, press DOWN on soft dirt and you dig!', hold=True)
a.say(10, 'KINAN', 'Like a butt slam, but with a SHOVEL. Best. Day. Ever.', hold=True)
a.run(14); a.dig(); a.run(10, fly=True); a.dashgap(6); a.run(10); a.dig(); a.run(10)
a = L.act('THE OLD CARVINGS')
a.say(3, 'SHAD', 'Look at these carvings! Every one tells a story from long, long ago.')
a.run(12, hidden=True); a.dig(golden=True); a.tower('ladder', visible='heart'); a.dashgap(6); a.run(10); a.boards(); a.run(10)
a = L.act('THE TUNNELS')
a.say(3, 'ANNIE', 'My scanner says Glitchy went into the jungle. To the temple!')
a.run(12); a.tunnel(10); a.dig(); a.gap(3); a.run(10, foes=2); a.dashgap(7); a.run(12)
L.write(OUT + 'l04.js', HD)

# ---- 14-fort THE JUNGLE TEMPLE ----
L = lv('14-fort', 5, 'THE JUNGLE TEMPLE', 344)
a = L.act('THE JUNGLE PATH')
a.say(2, 'SHAD', 'A temple in the jungle, bud. Hundreds of years old. We look, and we touch nothing.')
a.run(12); a.dashgap(6); a.run(10, fly=True); a.boards(); a.tower('vine'); a.run(12)
a = L.act('THE FLOODED COURTYARD')
a.say(2, 'GLITCHY', '(from a pool) Bloop! Kinan! A big pink friend found me!')
a.run(6); arena(a, 'axolotl'); a.run(12)
L.write(OUT + 'fort.js', HD)

# ---- 14-5 THE CENOTES ----
L = lv('14-5', 6, 'THE CENOTES', 345)
a = L.act('THE CAVE MOUTH')
a.extra['dark'] = 'torch'
a.say(2, 'ANNIE', 'A cenote: a cave full of clear water. Flashlights on, everybody!')
a.run(12); a.tunnel(8); a.pool(10); a.run(10, fly=True); a.dashgap(6); a.run(10)
a = L.act('THE DEEP POOL')
a.extra['dark'] = 'torch'
a.say(3, 'KINAN', 'The water is SO blue. I can see all the way to the bottom!')
a.run(10); a.pool(14, golden=True); a.run(10, hidden=True); a.pool(10); a.dig(); a.run(10)
a = L.act('THE LIGHT SHAFTS')
a.say(3, 'MOM', 'Sunlight! I was starting to miss the sky.')
a.run(12); a.tower('vine', visible='heart'); a.dashgap(6); a.run(10); a.pool(10); a.run(12)
L.write(OUT + 'l05.js', HD)

# ---- 14-6 THE DAY OF THE DEAD PARADE ----
L = lv('14-6', 7, 'THE DAY OF THE DEAD PARADE', 346)
a = L.act('THE MARIGOLD STREET')
a.say(2, 'SHAD', 'Day of the Dead, bud. Families remember the people they love, with flowers, music and food.')
a.say(10, 'MOM', 'Like when we tell stories about Grandpa. It is a happy way to remember.')
a.run(12); a.shelves(); a.dashgap(6); a.run(10, fly=True); a.boards(); a.run(10)
a = L.act('THE PARADE FLOATS')
a.say(3, 'CHENOA', 'The painted faces and the giant puppets! This is the best art I have EVER seen.')
a.run(12, hidden=True); a.tower('ladder', visible='heart'); a.dashgap(7); a.run(10); a.spring(); a.run(10)
a = L.act('THE MUSIC')
a.say(3, 'DAD', 'Mom! The band is playing our song! ...Okay, every song is our song.')
a.run(12, foes=2); a.tunnel(9, golden=True); a.dashgap(6); a.gap(3); a.run(12)
L.write(OUT + 'l06.js', HD)

# ---- 14-7 THE CACTUS DESERT ----
L = lv('14-7', 8, 'THE CACTUS DESERT', 347)
a = L.act('THE HOT SAND')
a.say(2, 'MOM', 'Water bottles, everyone! And sunscreen. KINAN. Sunscreen.')
a.run(14); a.dashgap(6); a.run(10, fly=True); a.highblock(); a.dig(); a.run(10)
a = L.act('THE ROAD-RUNNER RACE')
a.say(3, 'KINAN', 'A road runner! Bet I can beat you. Ready... GO!')
a.run(16, foes=2); a.dashgap(7); a.run(12, hidden=True); a.shelves(visible='heart'); a.dashgap(6); a.run(12)
a = L.act('THE MESA')
a.say(3, 'SHAD', 'That smoke on the horizon... bud, that is a VOLCANO. And Glitchy is beeping from up there.')
a.run(12); a.chimney(); a.dashgap(6); a.run(10); a.dig(golden=True); a.boards(); a.run(12)
L.write(OUT + 'l07.js', HD)

# ---- 14-secret CHICHEN ITZA AT DAWN ----
L = lv('14-secret', 9, 'CHICHEN ITZA AT DAWN', 348)
a = L.act('THE SUNRISE')
a.say(2, 'SHAD', 'Chichen Itza, at sunrise. The Maya built this, and they knew the stars and the seasons. Wow.')
a.say(10, 'ANNIE', 'Shad, you have been smiling for three days straight.')
a.run(12); a.dashgap(6); a.run(10); a.shelves(); a.pool(10); a.run(10); a.spring(); a.dashgap(6); a.run(16)
L.write(OUT + 'secret.js', HD)

# ---- 14-8 THE VOLCANO (the rising lava) ----
L = lv('14-8', 10, 'THE VOLCANO', 349, hazard='lava', up=40)
a = L.act('THE ASH SLOPES')
a.say(2, 'SHAD', 'Okay, bud. We climb the volcano, we grab Glitchy, we leave. Nice and quick.')
a.run(12); a.dashgap(6); a.run(10, hidden=True); a.shelves(visible='heart'); a.boards(); a.run(12)
a = L.act('THE LAVA RISES!')
a.say(2, 'GLITCHY', '(from above) Beep! It is getting HOT up here!')
a.run(6)
shaft(a, 'lava', None, floors=5, conns=['ladder', 'vine'], done=['SHAD', 'We beat the lava, bud! Now find Glitchy!'])
a.golden = {'col': a.c - 15, 'row': a.summit - 1}; a.secrets.append({'kind': 'hidden', 'col': a.c - 15, 'row': a.summit - 1, 'prize': 'GOLDEN CANDLE'})
L.write(OUT + 'l08.js', HD)

# ---- 14-castle THE CRATER'S HEART ----
L = lv('14-castle', 11, "THE CRATER'S HEART  -  THE LAVA IGUANA", 350, hazard='lava', up=40)
a = L.act('THE CRATER RIM')
a.say(2, 'MOM', 'Kinan. If anything is too hot, you come straight back. Promise?')
a.say(8, 'KINAN', 'Promise, Mom!')
# (2026-11-12, Shad's answer 37: the opening lava pit was 6 wide 3 s in, under the opening subtitle on a phone, and a
#  jump-only player fell in 5 times: now 5 wide (a jump clears it) and at column 19, past the subtitle box: on a phone held
#  sideways the box covers columns 9-18 of the opening screen (tester B's c14P-01-open.png))
a.run(19); a.dashgap(5); a.run(10, fly=True); a.boards(); a.dig(); a.gap(3); a.run(10)
a = L.act("THE IGUANA'S TOWER")
a.say(2, 'GLITCHY', '(from the top) Kinan! A big hot lizard is sitting on me!')
a.run(6)
shaft(a, 'lava', 'iguana', floors=5, conns=['ladder', 'vine'], after=[
    ['GLITCHY', 'HOLA, AMIGOS! Shad taught me! Hola, hola, HOLA!', 3.2],
    ['SHAD', 'Best trip of my LIFE, bud. Muchas gracias, Mexico!', 3.2],
    ['KINAN', 'Oh no, the globe is glowing AGAIN! The portal is pulling him over the ocean!', 3.4],
    ['MOM', 'That tower... those lights... Robin. That is PARIS.', 3.2]])
L.write(OUT + 'castle.js', HD)
print('w14 written')

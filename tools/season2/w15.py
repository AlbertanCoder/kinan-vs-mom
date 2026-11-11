import sys; sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from lvgen import *
OUT = __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..', '..', 'levels') + '/w15/'
W = {'n': 15, 'treat': 'croissant', 'walk': ['snail', 'goat', 'rat', 'snail'], 'fly': ['pigeon', 'bee', 'pigeon'], 'fish': 'fish'}
HD = "WORLD 15 - FRANCE, the Season 2 finale (docs/STORY-BIBLE.md, docs/WORLDS-12-15-PLAN.md). Move: GLIDE. Tool: the skateboard. Candles are croissants."

def lv(lid, slot, name, theme, **kw): return Level(W, lid, slot, name, theme, flags={'crawl': True, 'dash': True, 'glide': True}, **kw)

# ---- 15-1 PARIS STREETS ----
L = lv('15-1', 1, 'PARIS STREETS', 360)
a = L.act('THE CAFES')
a.say(2, 'MOM', 'Paris... the city of love. Oh, Robin, look at the lights.')
a.say(8, 'DAD', 'Ahh, Paris. Mon amour, may I have this dance? Right here on the street?')
a.say(14, 'KINAN', 'Come ON, you guys, STOP! People are LOOKING!')
a.run(16); a.shelves(); a.gap(3); a.run(10, fly=True); a.stairs(); a.run(10)
a.say(a.c - 4, 'KINAN', 'Sabumnim! Saved by the video call!', hold=True)
a.say(a.c - 1, 'SABUMNIM', 'The last move, Kinan: the glide. Jump, then HOLD jump as you fall. Your jacket opens. Float.', 4.4, hold=True)
a.glide(14); a.run(12)
a = L.act('THE SKATE STREET')
a.say(3, 'CHENOA', 'Little bro, I found you a skateboard at the market! Paris streets are made for skating.', hold=True)
a.skatest(40, 2); a.run(10, hidden=True); a.tunnel(8); a.run(10)
a = L.act('THE ROOFTOPS OF PARIS')
a.say(3, 'DAD', 'Kinan, what is a French cat\'s favourite dessert? A chocolate MOUSSE!')
a.run(12); a.tower('ladder', visible='heart'); a.glide(14); a.run(10); a.dashgap(6); a.run(8); a.pool(9, golden=True); a.run(12)
L.write(OUT + 'l01.js', HD)

# ---- 15-2 THE SEINE ----
L = lv('15-2', 2, 'THE SEINE', 361)
a = L.act('THE RIVER BANKS')
a.say(2, 'ANNIE', 'The river Seine! My scanner says Glitchy is somewhere along the water.')
a.run(14); a.pool(10); a.run(10, fly=True); a.dashgap(6); a.run(10); a.pool(12); a.run(10)
a = L.act('THE OLD BRIDGES')
a.say(3, 'MOM', 'Robin, remember when we were young and walked by a river like this?')
a.say(8, 'KINAN', 'Nope. No. Not listening. LA LA LA!')
a.run(12, hidden=True); a.tower('vine', visible='heart'); a.glide(14); a.run(10); a.pool(12, golden=True); a.run(10)
a = L.act('THE BOOK STALLS')
a.say(3, 'SHAD', 'Little green book stalls all along the river, bud. People have sold books here for hundreds of years.')
a.run(12); a.tunnel(8); a.ropes(10); a.run(10); a.bars(10); a.run(12)
L.write(OUT + 'l02.js', HD)

# ---- 15-3 THE CATACOMB TUNNELS ----
L = lv('15-3', 3, 'THE CATACOMB TUNNELS', 362)
a = L.act('THE DARK STAIRS')
a.extra['dark'] = 'torch'
a.say(2, 'CHENOA', 'Tunnels under Paris? Spooky... but kind of cool. Flashlight on, little bro.')
a.run(12); a.tunnel(9); a.gap(3); a.run(10, fly=True); a.tunnel(8); a.run(10)
a = L.act('THE OLD STONE HALLS')
a.extra['dark'] = 'torch'
a.say(3, 'KINAN', 'I am not scared. I am NOT scared. ...Glitchy? Is that you beeping?')
a.say(9, 'GLITCHY', '(far away) Beep! Not here! Up at the palace! The gardens!')
a.run(12, hidden=True); a.chimney(); a.run(8); a.dig(golden=True); a.pool(10); a.run(10)
a = L.act('THE WAY OUT')
a.extra['dark'] = 'torch'
a.say(3, 'DAD', 'Good news, everyone. I can see daylight. Bad news. That was my phone.')
a.run(12); a.tower('ladder', visible='heart'); a.dashgap(6); a.run(10); a.tunnel(9); a.run(12)
L.write(OUT + 'l03.js', HD)

# ---- 15-4 THE PALACE GARDENS ----
L = lv('15-4', 4, 'THE PALACE GARDENS', 363)
a = L.act('THE HEDGE MAZE')
a.say(2, 'SHAD', 'Versailles, bud! A king built this palace. Look at the size of these gardens!')
a.run(12); a.tunnel(8); a.gap(3); a.run(10, fly=True); a.tower('vine'); a.glide(14); a.run(12)
a = L.act('THE FOUNTAINS')
a.say(3, 'MOM', 'Oh, the fountains! Robin, it is like a fairy tale.')
a.say(8, 'DAD', 'And you are my princess.')
a.say(12, 'KINAN', 'Come ON, you guys! I am trying to SAVE A FRIEND here!')
a.run(14, hidden=True); a.pool(12, golden=True); a.spring(visible='heart'); a.glide(14); a.run(10)
a = L.act('THE GRAND CANAL')
a.say(3, 'ANNIE', 'Pigeons. LOTS of pigeons. And they are all flying toward that tower...')
a.run(12, foes=2); a.rings(10); a.run(10); a.pool(10); a.dashgap(6); a.run(12)
L.write(OUT + 'l04.js', HD)

# ---- 15-fort THE TOWER OF PIGEONS ----
L = lv('15-fort', 5, 'THE TOWER OF PIGEONS', 364)
a = L.act('THE CHIMNEY ROOFS')
a.say(2, 'GLITCHY', '(from the roof) Coo... COO! Kinan, the pigeons think I am a pigeon!')
a.run(12); a.tower('ladder'); a.glide(14); a.run(10, fly=True); a.dashgap(6); a.run(12)
a = L.act("THE PIGEON KING'S ROOF")
a.say(2, 'KINAN', 'A pigeon... with a CROWN?')
a.run(6); arena(a, 'pigeon'); a.run(12)
L.write(OUT + 'fort.js', HD)

# ---- 15-5 THE LAVENDER FIELDS ----
L = lv('15-5', 6, 'THE LAVENDER FIELDS', 365)
a = L.act('THE PURPLE ROWS')
a.say(2, 'CHENOA', 'Purple, all the way to the hills! It smells like a giant bubble bath.')
a.run(12); a.glide(14); a.run(10, fly=True); a.stairs(); a.glide(16); a.run(12)
a = L.act('THE WARM WIND')
a.say(3, 'SABUMNIM', 'Feel the warm wind under you, Kinan. Let it carry you up.', 3.4)
a.run(12, hidden=True); a.glide(18); a.run(10); a.shelves(visible='heart'); a.glide(16); a.run(10)
a = L.act('THE WINDMILL HILL')
a.say(3, 'DAD', 'Bees everywhere! Do not worry, Kinan. They are just BUZZY.')
a.run(12, foes=2); a.tunnel(9, golden=True); a.glide(14); a.dashgap(6); a.run(12)
L.write(OUT + 'l05.js', HD)

# ---- 15-6 MONT-SAINT-MICHEL (the tide) ----
L = lv('15-6', 7, 'MONT-SAINT-MICHEL', 366, hazard='tide', up=40)
a = L.act('THE SANDS')
a.say(2, 'ANNIE', 'Mont-Saint-Michel! An island town. When the tide comes in, it comes in FAST.')
a.run(12); a.pool(10); a.run(10, hidden=True); a.shelves(visible='heart'); a.glide(14); a.run(12)
a = L.act('THE TIDE!')
a.say(2, 'MOM', 'Here comes the sea! Kinan, stay close. Up the island, everyone!')
a.run(6)
shaft(a, 'tide', None, floors=5, conns=['vine', 'ladder'], done=['MOM', 'Everybody made it! Oh, Kinan, you were wonderful.'])
a.golden = {'col': a.c - 15, 'row': a.summit - 1}; a.secrets.append({'kind': 'hidden', 'col': a.c - 15, 'row': a.summit - 1, 'prize': 'GOLDEN CANDLE'})
L.write(OUT + 'l06.js', HD)

# ---- 15-7 THE FRENCH ALPS ----
L = lv('15-7', 8, 'THE FRENCH ALPS', 367)
a = L.act('THE SKI LIFT')
a.say(2, 'SHAD', 'The Alps, bud! Mont Blanc is the tallest mountain in Western Europe.')
a.run(12); a.tower('ladder'); a.glide(16); a.run(10, fly=True); a.bars(10); a.run(12)
a = L.act('PEAK TO PEAK')
a.say(3, 'KINAN', 'Gliding from one mountain to the next! I am a BIRD!')
a.run(12, hidden=True); a.glide(18); a.run(8); a.tower('vine', visible='heart'); a.glide(16); a.run(10)
a = L.act('THE GOAT TRAIL')
a.say(3, 'ANNIE', 'Mountain goats! They can climb ANYTHING. Kind of like you, Kinan.')
a.run(12, foes=2); a.rings(10); a.run(10); a.pool(10, golden=True); a.dashgap(6); a.run(12)
L.write(OUT + 'l07.js', HD)

# ---- 15-secret THE ART MUSEUM AFTER DARK ----
L = lv('15-secret', 9, 'THE ART MUSEUM AFTER DARK', 368)
a = L.act("CHENOA'S MUSEUM")
a.say(2, 'CHENOA', 'The art museum, at NIGHT. Little bro, follow me. I know every painting in here.')
a.say(10, 'KINAN', 'Chenoa... did that painting just WINK at me?')
a.say(16, 'CHENOA', 'The glitch is making the paintings come alive. Best. Night. EVER!')
a.run(16); a.shelves(); a.glide(14); a.run(10); a.rings(10); a.run(10); a.spring(); a.pool(10); a.run(16)
L.write(OUT + 'secret.js', HD)

# ---- 15-8 THE EIFFEL TOWER (the gargoyle) ----
L = lv('15-8', 10, 'THE EIFFEL TOWER', 369, up=40)
a = L.act('THE TOWER GARDENS')
a.say(2, 'MOM', 'The Eiffel Tower, all lit up. ...Robin, this is the most romantic night of my life.')
a.say(8, 'KINAN', 'Come ON, you guys! STOP! ...okay, fine. It IS really pretty.')
a.run(12); a.dashgap(6); a.run(10, hidden=True); a.shelves(visible='heart'); a.glide(14); a.run(12)
a = L.act('THE GARGOYLE!')
a.run(6)
shaft(a, 'gargoyle', None, floors=5, conns=['ladder', 'vine'], done=['SHAD', 'You out-climbed a GARGOYLE, bud! Glitchy is at the very top!'])
a.golden = {'col': a.c - 15, 'row': a.summit - 1}; a.secrets.append({'kind': 'hidden', 'col': a.c - 15, 'row': a.summit - 1, 'prize': 'GOLDEN CANDLE'})
L.write(OUT + 'l08.js', HD)

# ---- 15-castle THE PORTAL CORE ----
L = lv('15-castle', 11, 'THE PORTAL CORE', 370, up=40)
a = L.act('EVERY MOVE')
a.say(2, 'SABUMNIM', 'Kinan. Everything you learned on this trip, all at once. Breathe. You are ready.', 4)
a.say(9, 'ANNIE', 'The portal\'s core is at the top of the tower. Shut it, and Glitchy is free for GOOD!')
a.run(12); a.tunnel(8); a.ropes(10); a.run(10); a.bars(10); a.run(10); a.rings(10); a.run(10); a.dashgap(6); a.run(8); a.glide(14); a.run(8); a.pool(10); a.run(12)
a = L.act('THE PORTAL CORE')
a.say(2, 'GLITCHY', '(from the very top) Kinan! The big stone one is guarding the core!')
a.run(6)
shaft(a, 'glitch', 'gargoyle', floors=5, conns=['vine', 'ladder'], after=[
    ['GLITCHY', 'The portal... it is closing! Kinan! I am FREE!', 3],
    ['GLITCHY', 'Namaste. Arigato gozaimasu. Hola. And... merci. Merci, famille.', 3.8],
    ['KINAN', 'Glitchy... that was your best word EVER. Come on. Let\'s go home.', 3.4],
    ['DAD', 'Everybody to the airport! ...Mom, one last dance under the tower first?', 3.4],
    ['KINAN', 'COME ON, you guys! ...okay. ONE dance.', 3]])
L.write(OUT + 'castle.js', HD)
print('w15 written')

import sys; sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from lvgen import *
OUT = __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..', '..', 'levels') + '/w13/'
W = {'n': 13, 'treat': 'sushi', 'walk': ['kitsune', 'robot', 'snowball', 'kitsune'], 'fly': ['lantern', 'crane', 'lantern'], 'fish': 'koi'}
HD = "WORLD 13 - JAPAN, Annie's dream (docs/STORY-BIBLE.md, docs/WORLDS-12-15-PLAN.md). Move: ROPES AND MONKEY BARS. Tool: the grappling hook. Candles are sushi. Annie is the biggest Japan fan ever (anime, history, food, kimono)."

def lv(lid, slot, name, theme, **kw): return Level(W, lid, slot, name, theme, flags={'crawl': True}, **kw)

# ---- 13-1 TOKYO NEON ----
L = lv('13-1', 1, 'TOKYO NEON', 320)
a = L.act('THE BIG CROSSING')
a.say(2, 'ANNIE', "TOKYO! We are REALLY in Tokyo! I have watched SO much anime set here. I know every street!")
a.say(9, 'ANNIE', 'Konnichiwa! That means hello. Everyone, bow a little, like this. So polite!')
a.say(15, 'KINAN', 'A man just gave me a free sticker! Arigato!')
a.say(19, 'ANNIE', 'Kinan! The WHOLE thing! Arigato GOZAIMASU. That is the polite way. Say it all!', 3.4)
a.run(14); a.shelves(); a.gap(3); a.run(10, fly=True); a.stairs(); a.run(10)
a.say(a.c - 4, 'KINAN', 'A video call from Sabumnim! At night? It is morning in Canada!', hold=True)
a.say(a.c - 1, 'SABUMNIM', 'Kinan. Today: ropes. Jump and hold on. Push with the swing, and let go at the top.', 4.2, hold=True)
a.ropes(10); a.run(12)
a = L.act('THE NEON ROOFTOPS')
a.say(3, 'CHENOA', 'Little bro, these signs are like a painting that glows. I could stay here all night.')
a.say(9, 'ANNIE', 'This is EXACTLY like the opening of my favourite anime! Kinan, do a cool pose! ...Perfect.')
a.run(12, hidden=True); a.tower('ladder', visible='heart'); a.ropes(10); a.run(10); a.gap(3); a.run(10); a.ropes(11); a.run(10)
a = L.act('THE NIGHT MARKET')
a.say(3, 'ANNIE', 'Sushi! Ramen! Onigiri! Itadakimasu! ...that is what you say before you eat.')
a.say(16, 'ANNIE', 'Fun fact: sushi started hundreds of years ago, as a way to keep fish fresh with rice. History is DELICIOUS.')
a.say(10, 'DAD', 'I would tell you a ramen joke, but it is too long. It just keeps NOODLING.')
a.run(12, foes=2); a.tunnel(8); a.gap(3); a.run(10); a.pool(9, golden=True); a.ropes(10); a.run(12)
L.write(OUT + 'l01.js', HD)

# ---- 13-2 THE BULLET TRAIN ----
L = lv('13-2', 2, 'THE BULLET TRAIN', 321)
a = L.act('THE STATION')
a.say(2, 'SHAD', 'The bullet train, bud! Over 300 kilometres an hour. Glitchy is riding on the ROOF!')
a.say(9, 'ANNIE', 'The Shinkansen! The first one ran in 1964. I have a poster of this exact train on my wall!')
a.run(14); a.gap(3); a.run(10, fly=True); a.highblock(); a.ropes(10); a.run(12)
a = L.act('ON THE TRAIN ROOF')
a.say(3, 'MOM', 'Kinan! Stay close and hold on tight!')
a.run(12, hidden=True); a.ropes(10); a.run(8); a.bars(10); a.run(8)
a.ropes(11); a.run(10); a.gap(4); a.run(10)
a = L.act('PAST MOUNT FUJI')
a.say(3, 'ANNIE', 'Look out the side! Mount Fuji! Sugoi! That means AMAZING!')
a.run(12); a.shelves(visible='heart'); a.bars(11); a.run(10); a.tunnel(8, golden=True); a.ropes(10); a.run(12)
L.write(OUT + 'l02.js', HD)

# ---- 13-3 KYOTO BAMBOO FOREST ----
L = lv('13-3', 3, 'KYOTO BAMBOO FOREST', 322)
a = L.act('THE BAMBOO PATH')
a.say(2, 'ANNIE', 'Kyoto was the capital of Japan for over a thousand years. And this bamboo forest... listen. It whispers.')
a.run(12); a.tower('vine'); a.ropes(10); a.run(10, fly=True); a.bars(10); a.run(12)
a = L.act("ANNIE'S GADGET")
a.say(3, 'ANNIE', 'Kinan, I built you something! A grappling hook. Jump near a gold ring and it hooks on!', hold=True)
a.say(9, 'KINAN', 'Annie, you are a GENIUS. Okay... here goes!', hold=True)
a.run(12); a.rings(10); a.run(10, hidden=True); a.rings(11); a.run(10); a.tower('vine', visible='heart'); a.run(10)
a = L.act('THE TALL GREEN CLIMB')
a.say(3, 'DAD', 'Bamboo grows almost a metre a day. I wish my hair did that.')
a.run(12); a.ropes(10); a.run(8); a.rings(10); a.run(8); a.pool(10, golden=True); a.bars(10); a.run(12)
L.write(OUT + 'l03.js', HD)

# ---- 13-4 THE THOUSAND GATES ----
L = lv('13-4', 4, 'THE THOUSAND GATES', 323)
a = L.act('THE RED GATES')
a.say(2, 'ANNIE', 'I rented a KIMONO for today! Look, it has little cranes on it. Kirei, right? That means pretty!', hold=True)
a.say(7, 'KINAN', 'Annie, you look like you walked out of a painting.', hold=True)
a.say(12, 'MOM', 'So many red gates, all the way up the mountain. It is so peaceful here.')
a.say(17, 'ANNIE', 'This is a shrine, so we are quiet and respectful. We just walk the path.')
a.run(14); a.stairs(); a.gap(3); a.run(10, fly=True); a.bars(11); a.run(12)
a = L.act('THE FOX PATH')
a.say(3, 'KINAN', 'Foxes! They are everywhere on this mountain.')
a.say(8, 'ANNIE', 'Kitsune! In the old stories, foxes are messengers. I have read every manga about them. Every. Single. One.')
a.run(12, foes=2); a.rings(10); a.run(10, hidden=True); a.chimney(); a.run(8); a.ropes(10); a.run(10)
a = L.act('THE MOUNTAIN TOP')
a.say(3, 'ANNIE', 'Glitchy is at the castle in Osaka! A monkey from the hot springs found him first.')
a.run(12); a.tower('ladder', visible='heart'); a.bars(10); a.run(10); a.tunnel(9, golden=True); a.rings(10); a.run(12)
L.write(OUT + 'l04.js', HD)

# ---- 13-fort OSAKA CASTLE ----
L = lv('13-fort', 5, 'OSAKA CASTLE', 324)
a = L.act('THE CASTLE PARK')
a.say(2, 'ANNIE', 'Osaka Castle! Toyotomi Hideyoshi started building it in 1583. Yes, I memorised that. For FUN.')
a.say(9, 'SHAD', 'Annie, you are a walking history book.')
a.run(12); a.ropes(10); a.run(10, fly=True); a.stairs(); a.bars(10); a.run(12)
a = L.act('THE SNOWY COURTYARD')
a.say(2, 'GLITCHY', '(from a snow pile) Beep! Kinan! Snowballs! Many snowballs!')
a.run(6); arena(a, 'snowmonkey'); a.run(12)
L.write(OUT + 'fort.js', HD)

# ---- 13-5 THE ROBOT CAFE ----
L = lv('13-5', 6, 'THE ROBOT CAFE', 325)
a = L.act('THE FRONT COUNTER')
a.say(2, 'ANNIE', 'A ROBOT SUSHI CAFE! The sushi rides around on a little train! This is the best day of my life!')
a.say(9, 'KINAN', 'Annie, you said that yesterday. And the day before.')
a.say(14, 'ANNIE', 'And it was TRUE every time!')
a.run(16); a.shelves(); a.rings(10); a.run(10, fly=True); a.tunnel(8); a.run(12)
a = L.act('THE KITCHEN')
a.say(3, 'DAD', 'These robots are so polite. One said "arigato" to ME. I think I am in love... with this cafe.')
a.say(9, 'ANNIE', 'Robin, it said arigato GOZAIMASU. The whole thing! Robots have manners.')
a.say(14, 'MOM', 'Robin!')
a.run(12, hidden=True); a.bars(11); a.run(8); a.highblock(); a.ropes(10); a.run(10); a.rings(11); a.run(10)
a = L.act('THE SERVER ROOM')
a.extra['dark'] = 'torch'
a.say(3, 'ANNIE', 'Dark in here. Flashlight on! The robots keep their brains back here.')
a.run(12); a.tower('ladder', visible='heart'); a.tunnel(10, golden=True); a.bars(10); a.run(12)
L.write(OUT + 'l05.js', HD)

# ---- 13-6 THE KOI POND GARDENS ----
L = lv('13-6', 7, 'THE KOI POND GARDENS', 326)
a = L.act('THE STONE BRIDGES')
a.say(2, 'CHENOA', 'Koi fish! Orange and white, like little floating paintings.')
a.run(12); a.pool(10); a.run(8, fly=True); a.ropes(10); a.run(10); a.pool(12); a.run(10)
a = L.act('THE LANTERN GARDEN')
a.say(3, 'ANNIE', 'In Japan, gardens are made to be calm. Everything has its place. Kirei... so pretty.')
a.run(12, hidden=True); a.bars(10); a.pool(10, golden=True); a.rings(10); a.run(10); a.shelves(visible='heart'); a.run(10)
a = L.act('THE TEA HOUSE')
a.say(3, 'MOM', 'A cup of green tea after this. Mom needs a little calm too. Arigato!')
a.say(8, 'ANNIE', 'GOZAIMASU, Mom! ...Okay, okay. I will stop. ...I will not stop.')
a.run(12); a.ropes(11); a.run(8); a.pool(10); a.tunnel(8); a.run(12)
L.write(OUT + 'l06.js', HD)

# ---- 13-7 THE HOT SPRINGS VALLEY ----
L = lv('13-7', 8, 'THE HOT SPRINGS VALLEY', 327)
a = L.act('THE SNOWY PATH')
a.say(2, 'SHAD', 'Snow and hot springs, bud. The monkeys here take hot baths in the winter!')
a.say(9, 'ANNIE', 'Hot springs are called onsen. After, you wear a cosy yukata. I packed TWO. Just in case.')
a.run(12); a.spring(); a.gap(3); a.run(10, fly=True); a.bars(10); a.run(12)
a = L.act('THE STEAM VENTS')
a.say(3, 'KINAN', 'The steam pushes me up like a spring! Whoosh!')
a.run(10); a.spring(visible='heart'); a.pool(10); a.run(10, hidden=True); a.ropes(10); a.run(10); a.rings(10); a.run(10)
a = L.act('THE MONKEY BATHS')
a.say(3, 'DAD', 'Those monkeys look so relaxed. Can I join them? ...Mom says no.')
a.say(9, 'DAD', 'Arigato... gozai... gozaimasu! Annie, did I do it?')
a.say(14, 'ANNIE', 'Robin! Sugoi! I am SO proud of you!')
a.run(12, foes=2); a.pool(12, golden=True); a.chimney(); a.run(8); a.bars(11); a.run(12)
L.write(OUT + 'l07.js', HD)

# ---- 13-secret CHERRY BLOSSOM NIGHT ----
L = lv('13-secret', 9, 'CHERRY BLOSSOM NIGHT', 328)
a = L.act('UNDER THE BLOSSOMS')
a.say(2, 'ANNIE', 'Cherry blossoms at night, with lanterns... I am going to cry. Happy tears!')
a.say(10, 'CHENOA', 'I am painting this. Every single petal.')
a.say(17, 'ANNIE', 'Families picnic under the blossoms every spring. It is called hanami. Best. Tradition. Ever.')
a.run(12); a.ropes(10); a.run(10); a.shelves(); a.bars(10); a.run(10); a.rings(10); a.pool(10); a.run(16)
L.write(OUT + 'secret.js', HD)

# ---- 13-8 MOUNT FUJI (the avalanche) ----
L = lv('13-8', 10, 'MOUNT FUJI', 329)
a = L.act('THE MOUNTAIN TRAIL')
a.say(2, 'ANNIE', 'Mount Fuji! Japan\'s tallest mountain. Glitchy\'s beeps are coming from up there.')
a.run(12); a.ropes(10); a.run(10, hidden=True); a.shelves(visible='heart'); a.bars(10); a.run(12)
a = L.act('AVALANCHE!')
a.say(4, 'KINAN', 'Did you hear that rumble? ...uh oh.')
a.run(14); a.gap(3); a.run(10); a.stairs(); a.run(8); a.gap(3); a.run(10); a.highblock(); a.run(8); a.gap(3); a.run(10)
a.tunnel(8, golden=True); a.run(8); a.gap(3); a.run(16)
a.boss = {'kind': 'chase', 'look': 'snow', 'startCol': 8, 'col1': a.c - 12, 'spd': 2.25,
          'say': ['ANNIE', 'AVALANCHE! Run, Kinan, RUN! Do not look back!'], 'done': ['MOM', 'It stopped! Everyone okay? Kinan, you were SO fast.']}
a.cps = [[2, GROUND]]
L.write(OUT + 'l08.js', HD)

# ---- 13-castle THE TANUKI'S TEMPLE GROUNDS ----
L = lv('13-castle', 11, 'HIMEJI CASTLE  -  THE SAMURAI ARMOUR', 330, up=40)
a = L.act('THE WHITE HERON CASTLE')
a.say(2, 'ANNIE', 'Himeji Castle! They call it the White Heron Castle, because it looks like a bird about to fly!')
a.say(10, 'CHENOA', 'Little bro, Annie has not stopped talking for six days straight. I love it.')
a.run(12); a.ropes(10); a.run(10, fly=True); a.bars(10); a.run(10); a.rings(10); a.run(10)
a = L.act('THE KEEP')
a.say(2, 'GLITCHY', '(from the top) Kinan! An old suit of samurai armour WOKE UP! It is guarding me!')
a.run(6)
shaft(a, 'glitch', 'samurai', floors=5, conns=['ladder', 'vine'], after=[
    ['ANNIE', 'He bowed! Kinan, bow back! Samurai bowed before AND after a match, to say thank you.', 3.6],
    ['KINAN', 'Thank you for the match, sir. ...Annie, you are the BEST tour guide ever.', 3.2],
    ['GLITCHY', 'Kinan! Arigato... GOZAIMASU! The WHOLE thing! Just like Annie said!', 3.2],
    ['ANNIE', 'Glitchy said the whole thing! I am going to cry. Happy tears!', 3],
    ['KINAN', 'The globe again! The portal is pulling him out over the ocean!', 3.2],
    ['ANNIE', 'Japan... you were even better than my dreams. Arigato gozaimasu!', 3.2],
    ['SHAD', 'Hot sun, cactus, pyramids... bud, that is MEXICO. My dream trip! Let\'s go!', 3.6]])
L.write(OUT + 'castle.js', HD)
print('w13 written')

import sys; sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from lvgen import *
OUT = __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..', '..', 'levels') + '/w12/'
W = {'n': 12, 'treat': 'ladoo', 'walk': ['macaque', 'rickshaw', 'peacock', 'macaque'], 'fly': ['paperkite', 'crow', 'paperkite'], 'fish': 'fish'}
HD = 'WORLD 12 - INDIA, Annie\'s home (docs/STORY-BIBLE.md, docs/WORLDS-12-15-PLAN.md). Move: CRAWL. Tool: the flashlight. Candles are ladoos.'

def lv(lid, slot, name, theme, **kw): return Level(W, lid, slot, name, theme, flags={'crawl': True}, **kw)

# ---- 12-1 ANNIE'S VILLAGE ----
L = lv('12-1', 1, "ANNIE'S VILLAGE", 300)
a = L.act('THE WHEAT FIELDS')
a.say(2, 'ANNIE', "Welcome to Punjab, everybody! This is where I grew up. Chalo, let's go!")
a.say(10, 'MOM', 'Kinan, stay close. New country, new rules.')
a.run(14); a.gap(2); a.run(12, fly=True); a.stairs(); a.say(a.c, 'DAD', 'All these wheat fields... you could say Punjab is OUTSTANDING in its field!')
a.run(10); a.gap(3); a.run(8)
a.say(a.c - 4, 'KINAN', 'My phone is ringing! It is Sabumnim, on a video call!')
a.say(a.c - 1, 'SABUMNIM', 'Kinan. A new move today: the crawl. A low place is not a wall. Get down, and go through.', 4.4)
a.tunnel(8); a.run(12)
a = L.act("ANNIE'S FAMILY'S FARM")
a.say(3, 'ANNIE', 'My nani made ladoos for everybody! Grab them all. Shabash, Kinan!')
a.run(12, hidden=True); a.shelves(visible='heart'); a.gap(3); a.run(10)
a.say(a.c, 'CHENOA', 'Little bro, look at all the kites! I need to paint those colours.')
a.tunnel(10); a.highblock(); a.gap(3); a.run(12)
a = L.act('THE TRACTOR TRACK')
a.say(3, 'SHAD', 'The portal glitch is bending this place, bud. Jump the purple gaps!')
a.run(12); a.spring(); a.gap(3); a.run(10, fly=True); a.tunnel(10, golden=True); a.gap(3); a.run(10)
a.say(a.c - 6, 'GLITCHY', '(far away) Kiii... nan! Beep... boop... HELP!')
a.run(12)
L.write(OUT + 'l01.js', HD)

# ---- 12-2 AMRITSAR STREETS ----
L = lv('12-2', 2, 'AMRITSAR STREETS', 301)
a = L.act('THE BUSY LANES')
a.say(2, 'ANNIE', 'Amritsar! The Golden Temple is over there, shining. Isn\'t it beautiful?')
a.say(12, 'KINAN', 'So many market stalls! I can crawl right under them.')
a.run(14); a.tunnel(7); a.run(10, fly=True); a.gap(3); a.tunnel(9); a.run(10); a.stairs(); a.run(12)
a = L.act('UNDER THE STALLS')
a.say(3, 'DAD', 'Kinan, why did the ladoo go to school? To get a little SWEETER!')
a.say(7, 'KINAN', 'Dad... that one was actually kind of good.')
a.run(12); a.tunnel(10); a.shelves(visible='cake'); a.gap(3); a.run(10, hidden=True); a.tunnel(8); a.gap(3); a.run(12)
a = L.act('THE ROOFTOP WALK')
a.say(3, 'MOM', 'Everyone is so kind here. Kinan, say thank you when they give you a ladoo!')
a.run(12); a.tower('ladder'); a.gap(3); a.run(10); a.pool(9, golden=True); a.run(8); a.highblock(); a.run(12)
a.say(a.c - 6, 'ANNIE', 'Glitchy went that way! Toward Delhi. Chalo!')
L.write(OUT + 'l02.js', HD)

# ---- 12-3 THE OLD DELHI BAZAAR ----
L = lv('12-3', 3, 'THE OLD DELHI BAZAAR', 302)
a = L.act('THE SPICE MARKET')
a.say(2, 'CHENOA', 'The colours! The smells! Little bro, this market is like a giant painting.')
a.run(12); a.tunnel(9); a.run(10, fly=True); a.stairs(); a.gap(3); a.run(10); a.tunnel(7); a.run(12)
a.say(a.c - 4, 'KINAN', 'ACHOO! Those spice sacks are tickling my nose!')
a = L.act('THE ROOFTOPS AND WIRES')
a.say(3, 'SHAD', 'Up on the roofs, bud! Everyone up here is flying kites.')
a.run(12); a.tower('ladder', visible='heart'); a.gap(3); a.run(8); a.tower('vine'); a.gap(4); a.run(10, hidden=True); a.run(8)
a = L.act('THE LANTERN LANE')
a.say(3, 'ANNIE', 'Watch out for the cheeky monkeys. They LOVE ladoos.')
a.run(12, foes=2); a.tunnel(10); a.gap(4); a.spring(); a.run(10); a.pool(10, golden=True); a.run(12)
L.write(OUT + 'l03.js', HD)

# ---- 12-4 THE PINK CITY ----
L = lv('12-4', 4, 'THE PINK CITY', 303)
a = L.act('THE PINK WALLS')
a.say(2, 'MOM', 'Jaipur, the Pink City! Kinan, look at all the little windows.')
a.run(12); a.highblock(); a.gap(3); a.run(10, fly=True); a.chimney(); a.run(8)
a.say(a.c - 4, 'SABUMNIM', 'Between two walls, kick off one, then the other. Calm feet, Kinan.', 3.6)
a.gap(3); a.run(12)
a = L.act('THE PALACE WINDOWS')
a.say(3, 'DAD', 'This palace has 953 windows. Imagine cleaning them... Mom, do NOT get ideas!')
a.run(12); a.tower('vine', visible='heart'); a.gap(4); a.run(10); a.tunnel(9); a.run(10, hidden=True); a.gap(4); a.run(8)
a = L.act('UP TO THE FORT ROAD')
a.say(3, 'ANNIE', 'I hear Glitchy! He is up at the Amber Fort... and a monkey has him!')
a.run(12); a.chimney(); a.gap(4); a.run(10, foes=2); a.tunnel(8, golden=True); a.gap(4); a.run(12)
L.write(OUT + 'l04.js', HD)

# ---- 12-fort AMBER FORT ----
L = lv('12-fort', 5, 'AMBER FORT', 304)
a = L.act('THE FORT ROAD')
a.say(2, 'SHAD', 'The Amber Fort, bud! Built hundreds of years ago, up on the hill.')
a.run(12); a.stairs(); a.gap(3); a.run(10, fly=True); a.tunnel(8); a.run(10); a.gap(4); a.run(12)
a = L.act("THE MONKEY'S COURTYARD")
a.say(2, 'ANNIE', 'There he is! The Market Monkey took ALL the ladoos!')
a.run(6); arena(a, 'monkey'); a.run(12)
L.write(OUT + 'fort.js', HD)

# ---- 12-5 THE STEPWELL ----
L = lv('12-5', 6, 'THE STEPWELL', 305, up=24)
a = L.act('THE TOP STEPS')
a.extra['dark'] = 'torch'
descent(a, top=-18); a.say(3, 'ANNIE', 'A stepwell! It goes down, down, down. It is dark... here, take my flashlight!')
a.say(12, 'KINAN', 'A flashlight! It shines wherever I look. Thanks, Annie!')
a.run(10); a.tunnel(8); a.run(10, hidden=True); a.gap(3); a.run(10)
a = L.act('THE DEEP WATER')
a.extra['dark'] = 'torch'
a.say(3, 'MOM', 'Careful, sweetie. Shine the light before you jump.')
a.run(10); a.pool(12, golden=True); a.run(8); a.tunnel(9); a.gap(3); a.run(10)
a = L.act('THE CLIMB BACK UP')
a.say(3, 'DAD', 'Good news: we found the bottom. Bad news: we have to climb back UP.')
a.run(10); a.tower('ladder', visible='heart', top=3); a.gap(3); a.tower('vine'); a.run(10, fly=True); a.stairs(); a.run(12)
L.write(OUT + 'l05.js', HD)

# ---- 12-6 THE KERALA BACKWATERS ----
L = lv('12-6', 7, 'THE KERALA BACKWATERS', 306)
a = L.act('THE PALM CANALS')
a.say(2, 'ANNIE', 'Kerala! Houseboats, palm trees and the calmest water in the world.')
a.run(12); a.pool(10); a.run(10, fly=True); a.pool(12); a.run(10)
a.say(a.c - 3, 'SABUMNIM', 'Water is calm. Be like water, Kinan.', 3)
a = L.act('THE HOUSEBOATS')
a.say(3, 'CHENOA', 'Those boats look like little floating houses. I love it here.')
a.run(10); a.shelves(visible='heart'); a.pool(14, golden=True); a.run(10, hidden=True); a.gap(3); a.run(10)
a = L.act('THE MUD FLATS')
a.say(3, 'DAD', 'Watch the crabs, Kinan. They are a little SHELL-fish.')
a.run(12, foes=2); a.tunnel(8); a.pool(10); a.gap(4); a.run(12)
L.write(OUT + 'l06.js', HD)

# ---- 12-7 THE TIGER RESERVE ----
L = lv('12-7', 8, 'THE TIGER RESERVE', 307)
a = L.act('THE MANGROVES')
a.say(2, 'MOM', 'The Sundarbans. Tigers live here, Kinan. Stay. Very. Close.')
a.run(12); a.tower('vine'); a.gap(3); a.run(10); a.pool(10); a.run(10, fly=True)
a = L.act('THE TIGER CUB')
a.say(3, 'KINAN', 'Aww, a tiger cub! It just wants to play. Hi, little buddy!')
a.say(9, 'ANNIE', 'We look and we do not touch. Tigers are protected here. Chalo, quietly!')
a.run(12); a.tower('vine', visible='heart'); a.gap(4); a.run(10, hidden=True); a.tunnel(9); a.pool(10, golden=True); a.run(10)
a = L.act('THE RIVER BANK')
a.say(3, 'SHAD', 'Mumbai next, bud. The clouds out there look HEAVY.')
a.run(12); a.chimney(); a.gap(4); a.run(10, foes=2); a.stairs(); a.run(12)
L.write(OUT + 'l07.js', HD)

# ---- 12-secret THE TAJ AT MOONLIGHT ----
L = lv('12-secret', 9, 'THE TAJ AT MOONLIGHT', 308)
a = L.act('THE MOONLIT GARDEN')
a.say(2, 'MOM', 'The Taj Mahal, by moonlight. Oh, Kinan... it is the most beautiful thing I have seen.')
a.say(10, 'GLITCHY', '(somewhere) Beeeep... pretty...')
a.run(12); a.pool(10); a.run(10); a.shelves(); a.pool(10); a.run(10); a.spring(); a.pool(10); a.run(16)
L.write(OUT + 'secret.js', HD)

# ---- 12-8 MUMBAI IN THE MONSOON ----
L = lv('12-8', 10, 'MUMBAI IN THE MONSOON', 309, up=40)
a = L.act('THE RAINY STREETS')
a.say(2, 'DAD', "It's raining cats and dogs! ...Vader, Chikastino, I was not talking about you.")
a.run(12); a.tunnel(8); a.gap(3); a.run(10, hidden=True); a.shelves(visible='heart'); a.gap(4); a.run(12)
a = L.act('THE FLOOD!')
a.say(2, 'ANNIE', 'The monsoon is getting stronger. The streets are filling with water!')
a.run(6)
shaft(a, 'flood', None, floors=5, conns=['ladder', 'vine'], say=['ANNIE', 'Hai Rabba! The flood is rising! Up the rooftops, Kinan. CLIMB!'],
      done=['MOM', 'You made it to the top! Oh, Kinan, I was so worried.'])
# the golden candle and the third secret on the climb
a.golden = {'col': a.c - 15, 'row': a.summit - 1}; a.secrets.append({'kind': 'hidden', 'col': a.c - 15, 'row': a.summit - 1, 'prize': 'GOLDEN CANDLE'})
L.write(OUT + 'l08.js', HD)

# ---- 12-castle THE GATEWAY ----
L = lv('12-castle', 11, 'THE GATEWAY  -  THE MONSOON FROG', 310, up=40)
a = L.act('THE SEA WALL')
a.say(2, 'SHAD', 'The Gateway of India, bud. Glitchy is up there somewhere. We are close!')
a.run(12); a.gap(3); a.run(10, fly=True); a.tunnel(8); a.gap(4); a.run(10); a.stairs(); a.run(10)
a = L.act("THE FROG'S TOWER")
a.say(2, 'GLITCHY', '(from the top) Kinan! Up here! A big frog is guarding me!')
a.run(6)
S = shaft(a, 'flood', 'frog', floors=5, conns=['vine', 'ladder'], after=[
    ['GLITCHY', 'Kinan! You came! NAMASTE! ...Annie taught me. Namaste!', 3.4],
    ['ANNIE', 'Shabash, Glitchy! Your first Punjabi... wait. Why is the globe glowing again?', 3.4],
    ['KINAN', 'GLITCHY! The portal is pulling him away again! Where is it taking him?', 3.4],
    ['ANNIE', 'Those lanterns, that music... that is JAPAN! My dream! Chalo, to the airport!', 3.6]])
L.write(OUT + 'castle.js', HD)
print('w12 written')

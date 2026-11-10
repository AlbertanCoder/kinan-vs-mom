# Season 2 foes (Worlds 12-15): 12-wide pixel sprites facing right, normalised here; writes s2foes.js and s2foetable.txt
# (pasted into index.html: S2_FOE_ART after the FOE table, the FOE entries into it)
import json
K='#1b1220'
F = {
 # ---- India ----
 'macaque': ({'b':'#8a6a4a','f':'#f0b8a0','e':K,'r':'#c2414f'}, ['....kkkk....','...kbbbbk...','.kkbffffbkk.','kbkfekkefkbk','.kbffffffbk.','..kbfrrfbk..','..kbbbbbbk..','.kbbbffbbbk.','.kbbffffbbk.','kbbkbbbbkbbk','.kk.kbbk.kk.','....kk.kk...'], 'hopper', {'spd':0.7,'seek':True}),
 'paperkite': ({'r':'#e8364b','y':'#f6c445','g':'#44c55a','t':'#f4f1e8','e':K}, ['.....kk.....','....kyyk....','...kyyyyk...','..kryeeyrk..','.krrryyrrrk.','krrrrrrrrrrk','.kgggrrgggk.','..kggggggk..','...kggggk...','....kggk....','.....kk.....','.....t.t....'], 'flyer', {}),
 'rickshaw': ({'g':'#2f8a3c','y':'#f6c445','w':'#cfe8ff','t':'#4a4f57','e':K}, ['..kkkkkkkk..','.kyyyyyyyyk.','kyyyyyyyyyyk','kywwwkywwwgk','kywwwkywwwgk','kggggggggggk','kggggggggggk','kgggyyggggyk','.kkkkkkkkkk.','.ktk....ktk.','..k......k..','............'], 'walker', {'spd':1.5}),
 'peacock': ({'b':'#2a6ad8','g':'#2f9a6a','y':'#f6c445','t':'#7a5a3a','e':K}, ['.......kk...','......kbbk..','..kg..kbebk.','.kgygk.kbkyk','kgygygkkbk..','kgygygybbk..','kgygygbbbk..','.kgygbbbbk..','..kggbbbk...','....kttk....','....kt.tk...','...kk..kk...'], 'walker', {'spd':0.6}),
 'mudcrab': ({'r':'#c2643a','o':'#e8964a','e':K,'w':'#ffffff'}, ['............','..kw....wk..','..ke....ek..','.kk.kkkk.kk.','krk.krrk.krk','.kkkrrrrkkk.','..krrooorrk.','..krrrrrrrk.','...kkkkkkk..','..k.k..k.k..','.k..k..k..k.','............'], 'walker', {'spd':0.7}),
 # ---- Japan ----
 'kitsune': ({'o':'#e8823a','w':'#f4f1e8','e':K,'r':'#e8364b'}, ['.........k.k','........kokok','........koook','kk......kowek','kok....kooook','koook.kooookk','.kooookooook.','..kooooooook.','..kowwwwwook.','...kok..kok..','...kk....kk..','............'], 'walker', {'spd':1.0}),
 'lantern': ({'r':'#e8364b','y':'#f6c445','l':'#ffb3b3','e':K}, ['.....kk.....','...kkkkkk...','..kyyyyyyk..','.krrrrrrrrk.','krlrrrrrlrrk','krrekrrekrrk','krrrrrrrrrrk','krrrkkkkrrrk','.krrrrrrrrk.','..kyyyyyyk..','...kkkkkk...','.....yy.....'], 'flyer', {}),
 'robot': ({'s':'#c9ced6','d':'#7a8590','b':'#3fa9f5','r':'#e8364b','e':K}, ['.....kk.....','.....kr.....','..kkkkkkkk..','..ksssssssk.','..ksbksbksk.','..ksssssssk.','..kssddsssk.','..kkkkkkkkk.','.kdkbbbbkdk.','.kdkbbbbkdk.','..kkkkkkkk..','..kdk..kdk..'], 'walker', {'spd':0.7}),
 'crane': ({'w':'#f4f1e8','g':'#9aa1ab','r':'#e8364b','y':'#f6c445','e':K}, ['.........kk.','........krrk','........kwek','.......kwwkyk','kkk...kwwk..','kgwk.kwwwk..','.kgwwwwwwk..','..kgwwwwk...','...kkwwk....','.....kk.....','.....k.k....','....k...k...'], 'flyer', {}),
 'koi': ({'w':'#f4f1e8','o':'#ff7a2a','e':K}, ['............','...kkk......','..kowwk..kk.','.kwwowwk.kok','kwowwwwwkoowk','kwwwowwowwok','kewwwwwowok.','.kwwowwwwk..','..kkkwwk....','.....kk.....','............','............'], 'flyer', {'swim':True}),
 'snowball': ({'w':'#f4f8fc','b':'#c9d8ea','e':K,'r':'#e8364b'}, ['....kkkk....','..kkwwwwkk..','.kwwwwwwwwk.','.kwwekwekwk.','kwwwwwwwwwwk','kwwbwrrwwbwk','kwwwwwwwwwwk','kbwwwwwwwwbk','.kbwwwwwwbk.','.kbbwwwwbbk.','..kkbbbbkk..','....kkkk....'], 'walker', {'spd':1.25}),
 # ---- Mexico ----
 'roadrunner': ({'b':'#5a4a6a','t':'#c9a26a','y':'#f6c445','w':'#ffffff','e':K}, ['.......kkk..','..k...kbbbk.','.kbk.kbbwek.','.kbbkkbbbbkyk','..kbbbbbbk..','...kbttbbk..','..kbbbbbk...','.kbbbbbk....','kbk.kyk.....','.k..kyk.....','...ky.ky....','..kk...kk...'], 'walker', {'spd':1.8}),
 'pinata': ({'p':'#ff6fae','y':'#f6c445','b':'#3fa9f5','g':'#44c55a','e':K}, ['.......kk...','......kppk..','......kpek..','..kkkkkppk..','.kppyybbppk.','.kyybbggyyk.','.kbbggppbbk.','.kggppyyggk.','..kk.kk.kk..','..kp.kp.kp..','..kk.kk.kk..','............'], 'flyer', {}),
 'scorpion': ({'r':'#a8423a','o':'#d8743a','e':K}, ['.......kkk..','......kook..','.......kok..','..kk...kok..','.kok..koook.','..kkkkoook..','.kooookok...','koeoooook...','.kooookk....','k.k.k.k.....','............','............'], 'walker', {'spd':0.7}),
 'alebrije': ({'p':'#9b5de5','y':'#f6c445','g':'#44c55a','r':'#ff6fae','e':K}, ['..kk....kk..','.kygk..kgyk.','.kgyyk.kyyk.','..kypyyyyyk.','..kyyppppek.','.kppgggpppkk','kprryyrrppk.','.kppppppppk.','..kprpkprk..','..kk.kk.kk..','............','............'], 'flyer', {}),
 'gecko': ({'g':'#5ab84a','y':'#c8e84a','e':K}, ['............','............','.........kk.','kk.....kkgek','kgk...kgggk.','.kgkkkgyggk.','..kgggyygk..','.kgkgggkgk..','.kk.kk.kk...','............','............','............'], 'hopper', {'spd':0.8,'seek':True}),
 # ---- France ----
 'pigeon': ({'g':'#8a96aa','n':'#4fae8a','p':'#9b5de5','o':'#f39a3a','e':K}, ['.......kkk..','......kgggk.','......kgegko','......kngk..','..kkkknpk...','.kgggggggk..','kggggggggk..','.kgggggggk..','..kkkkkkk...','....ko.ko...','............','............'], 'flyer', {'thief':True}),
 'snail': ({'b':'#c08a4a','s':'#e8c890','g':'#9aa86a','e':K}, ['.........k.k','.........k.k','...kkkk..kek','..kbbbbk.kgk','.kbsssbbkkgk','.kbskksbkggk','.kbssbsbkggk','.kkbbbbkgggk','kggggggggggk','.kkkkkkkkkk.','............','............'], 'walker', {'spd':0.3}),
 'bee': ({'y':'#f6c445','w':'#e6f7ff','e':K}, ['....kk.kk...','...kwwkwwk..','...kwwkwwk..','....kkkkk...','..kyykyykk..','.kyykyykyek.','.kyykyykyyk.','..kyykyykk..','...kkkkk....','............','............','............'], 'flyer', {}),
 'goat': ({'w':'#f4f1e8','g':'#c9c2b8','h':'#8a7a6a','e':K}, ['.........kk.','........khk.','.......kkwkk','.......kwwek','kk..kkkkwwk.','kwkkwwwwwwkk','.kwwwwwwwwk.','.kwwgwwwwwk.','.kwwwwwwwk..','..kgk..kgk..','..kk....kk..','............'], 'charger', {}),
 'rat': ({'g':'#8a8f96','p':'#ff9bb0','w':'#ffffff','e':K}, ['......kkkk..','......kwwwk.','.....kwwwwk.','......kkkk..','......kpkk..','kk..kkggekk.','.k.kgggggpk.','..kggggggk..','.kggggggk...','..kgk.kgk...','..kk..kk....','............'], 'walker', {'spd':1.1}),
}
out=[]
for k,(m,rows,beh,extra) in F.items():
    rows=[(r+'............')[:12] for r in rows][:12]
    while len(rows)<12: rows.insert(0,'.'*12)
    m=dict(m); m['k']=K
    out.append((k,m,rows,beh,extra))
js="/* Worlds 12-15 foes (docs/WORLDS-12-15-PLAN.md): local creatures, drawn as small pixel sprites facing right */\n"
js+="const S2_FOE_ART = {\n"+",\n".join("  %s: { map: %s, rows: %s }"%(k,json.dumps(m),json.dumps(r)) for k,m,r,b,e in out)+"\n};\n"
js+="const S2_FOE_IMG = {};\nfunction s2FoeDraw(f, x, y, w, h) {\n  const A = S2_FOE_ART[f.def.kind];\n  const im = S2_FOE_IMG[f.def.kind] || (S2_FOE_IMG[f.def.kind] = bakeMap(A.rows, A.map));\n  const bob = (f.onGround || f.def.beh === 'flyer') && Math.floor((frame + (f.idx || 0) * 7) / 8) % 2 ? 1 : 0;\n  ctx.drawImage(im, x + Math.round((w - 12) / 2), y + h - 12 - bob);\n}\n"
open('s2foes.js','w').write(js)
foe_lines=[]
for k,m,r,b,e in out:
    d={'beh':b,'kind':k,'color':m.get('b') or list(m.values())[0]}
    d.update(e)
    foe_lines.append("  %s: %s"%(k, json.dumps(d).replace('"beh"','beh').replace('"kind"','kind').replace('"color"','color').replace('"spd"','spd').replace('"seek"','seek').replace('"swim"','swim').replace('"thief"','thief').replace('true','true')))
open('s2foetable.txt','w').write(",\n".join(foe_lines))
print(len(out))

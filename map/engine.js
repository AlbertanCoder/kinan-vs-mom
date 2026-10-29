/* ============================================================
   KINAN VS. WORLDS — THE OVERWORLD MAP ENGINE (Contract §9: an SMW-style map between levels)
   Moved into the game on 2026-10-27 from the concept (Desktop\Kinan Map Concept\worlds.html).
   THIS FILE AND map/worlds/*.js ARE NOW THE SOURCE OF TRUTH (docs/OVERWORLD-MAP.md).
   - Each world is one file, map/worlds/wNN.js, that registers itself with KINAN.W.push({...});
     road trips (w06t = 6.5, w09t = 9.5) are worlds with travel:true.
   - The game (index.html) owns progress: it mounts the map with KINAN.mount(host, opts) and its
     opts.annotate(worlds) marks every stop { kind, id, built, state: locked | open | beaten } and
     every world { done } (its castle is beaten or not built yet). The engine draws those states,
     walks Kinan only where they allow, crosses a world seam only when the world is done, and calls
     opts.onPlay(worldN, stopIndex, stop) for a built, open stop ("Coming soon" for the rest).
   - World 12 is the 3D map (map/worlds/w12_3d.js, window.KINAN3D), loaded on demand through
     opts.need3D(); after World 11 its 2D->3D transition plays.
   ============================================================ */
(function(){
const cv=document.createElement('canvas');cv.width=1296;cv.height=720;cv.className='km-canvas';cv.tabIndex=0;
cv.setAttribute('aria-label','Playable pixel art world map. Use the arrow keys or the arrow buttons to walk Kinan along the path between levels, and Enter or PLAY to play.');
const x=cv.getContext('2d');
const VW=432,VH=240,SC=3; /* the map is drawn at 432x240 pixels, the screen at 3x so words stay sharp */
const PAL={u:'#7a3f26',h:'#4a2c1a',s:'#d9a27a',k:'#1b1220',r:'#c2414f',m:'#7d1f33',y:'#f6c445',j:'#3f63a8',t:'#b88a3e',P:'#f39ac0',w:'#f4f1e8',d:'#3b2618',S:'#c98d63',R:'#e8364b',J:'#2b2f45'};
/* the game's own Kinan sprite (index.html KINAN + LEGS) */
const KINAN=['....kkkkkkkk....','...khhhhhhhhk...','..khhsssssshhk..','..khsddssddshk..','.kSssskssksssSk.','.kSssssssssssSk.','.hksssussusssk..','.dhksssuusssk...','.hkrrrrrrrrrrk..','dkrrrrryyrrrrrk.','hkrrrrrwwrrrrrk.','Rsrrrrrwwrrrrrsk','ksrrrrmmmrrrrrsk','..kjjjjjjjjjjk..','..kjjjj..jjjjk..'];
const LEGS={stand:['....jjj..jjj....','...JRJJ..JJRJ...','...wwww..wwww...'],walk:['...jjj....jjj...','..JRJ......JRJ..','.wwww......wwww.'],jump:['...jjjj..jjjj...','..JRJ......JRJ..','..ww........ww..'],fall:['....jjjjjjjj....','...JRJ....JRJ...','..www......www..']};
let G=x;
let LBL=null; /* while a map is built, labels wait here and are drawn on top of everything */
function px(c,X,Y,w,h){G.fillStyle=c;G.fillRect(Math.round(X),Math.round(Y),w||1,h||1);}
function box(c,X,Y,w,h){px('#1b1220',X-1,Y-1,w+2,h+2);px(c,X,Y,w,h);}
function shadow(X,Y,rx,ry){G.fillStyle='rgba(0,0,0,.2)';G.beginPath();G.ellipse(X,Y,rx,ry||rx*0.3,0,0,Math.PI*2);G.fill();}
function spr(rows,X,Y,pal,s,flip){s=s||1;for(let r=0;r<rows.length;r++){const row=rows[r];for(let c=0;c<row.length;c++){const ch=row[flip?row.length-1-c:c];if(ch==='.')continue;G.fillStyle=pal[ch]||'#f0f';G.fillRect(Math.round(X+c*s),Math.round(Y+r*s),Math.ceil(s),Math.ceil(s));}}}
function hash(a,b){let n=(a*374761393+b*668265263)|0;n=(n^(n>>>13))*1274126177;return ((n^(n>>>16))>>>0)/4294967295;}
let TXT=null; /* while a map is built, words are kept and drawn later at full screen resolution */
/* hand-made pixel fonts for map words (the web font's C and G read as O and B when small) */
const BF_M=Object.assign({'A':'.###./#...#/#...#/#####/#...#/#...#/#...#','B':'####./#...#/#...#/####./#...#/#...#/####.','C':'.###./#...#/#..../#..../#..../#...#/.###.','D':'####./#...#/#...#/#...#/#...#/#...#/####.','E':'#####/#..../#..../####./#..../#..../#####','F':'#####/#..../#..../####./#..../#..../#....','G':'.###./#...#/#..../#.###/#...#/#...#/.####','H':'#...#/#...#/#...#/#####/#...#/#...#/#...#','I':'###/.#./.#./.#./.#./.#./###','J':'..###/...#./...#./...#./...#./#..#./.##..','K':'#...#/#..#./#.#../##.../#.#../#..#./#...#','L':'#..../#..../#..../#..../#..../#..../#####','M':'#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#','N':'#...#/#...#/##..#/#.#.#/#..##/#...#/#...#','O':'.###./#...#/#...#/#...#/#...#/#...#/.###.','P':'####./#...#/#...#/####./#..../#..../#....','Q':'.###./#...#/#...#/#...#/#.#.#/#..#./.##.#','R':'####./#...#/#...#/####./#.#../#..#./#...#','S':'.####/#..../#..../.###./....#/....#/####.','T':'#####/..#../..#../..#../..#../..#../..#..','U':'#...#/#...#/#...#/#...#/#...#/#...#/.###.','V':'#...#/#...#/#...#/#...#/#...#/.#.#./..#..','W':'#...#/#...#/#...#/#.#.#/#.#.#/#.#.#/.#.#.','X':'#...#/#...#/.#.#./..#../.#.#./#...#/#...#','Y':'#...#/#...#/.#.#./..#../..#../..#../..#..','Z':'#####/....#/...#./..#../.#.../#..../#####','0':'.###./#...#/#..##/#.#.#/##..#/#...#/.###.','1':'.#./##./.#./.#./.#./.#./###','2':'.###./#...#/....#/...#./..#../.#.../#####','3':'####./....#/....#/.###./....#/....#/####.','4':'...#./..##./.#.#./#..#./#####/...#./...#.','5':'#####/#..../####./....#/....#/#...#/.###.','6':'..##./.#.../#..../####./#...#/#...#/.###.','7':'#####/....#/...#./..#../.#.../.#.../.#...','8':'.###./#...#/#...#/.###./#...#/#...#/.###.','9':'.###./#...#/#...#/.####/....#/...#./.##..','!':'#/#/#/#/#/./#','&':'.##../#..#./#.#../.#.../#.#.#/#..#./.##.#',"'":'#/#/./././././.','+':'...../..#../..#../#####/..#../..#../.....','-':'..../..../..../####/..../..../....','.':'./././././././#',',':'../../../../../.#/#.',':':'./././#/././#/.','?':'.###./#...#/....#/...#./..#../...../..#..','/':'....#/...#./...#./..#../.#.../.#.../#....','(':'.#/#./#./#./#./#./.#',')':'#./.#/.#/.#/.#/.#/#.'},{h:7,sp:3}),BF_S=Object.assign({'A':'.#./#.#/###/#.#/#.#','B':'##./#.#/##./#.#/##.','C':'.##/#../#../#../.##','D':'##./#.#/#.#/#.#/##.','E':'###/#../##./#../###','F':'###/#../##./#../#..','G':'.##/#../#.#/#.#/.##','H':'#.#/#.#/###/#.#/#.#','I':'###/.#./.#./.#./###','J':'..#/..#/..#/#.#/.#.','K':'#.#/#.#/##./#.#/#.#','L':'#../#../#../#../###','M':'#...#/##.##/#.#.#/#...#/#...#','N':'#..#/##.#/#.##/#..#/#..#','O':'.#./#.#/#.#/#.#/.#.','P':'##./#.#/##./#../#..','Q':'.#./#.#/#.#/##./.##','R':'##./#.#/##./#.#/#.#','S':'.##/#../.#./..#/##.','T':'###/.#./.#./.#./.#.','U':'#.#/#.#/#.#/#.#/###','V':'#.#/#.#/#.#/#.#/.#.','W':'#...#/#...#/#.#.#/##.##/#...#','X':'#.#/#.#/.#./#.#/#.#','Y':'#.#/#.#/.#./.#./.#.','Z':'###/..#/.#./#../###','0':'###/#.#/#.#/#.#/###','1':'.#./##./.#./.#./###','2':'##./..#/.#./#../###','3':'##./..#/.#./..#/##.','4':'#.#/#.#/###/..#/..#','5':'###/#../##./..#/##.','6':'.##/#../###/#.#/###','7':'###/..#/.#./.#./.#.','8':'###/#.#/###/#.#/###','9':'###/#.#/###/..#/##.','!':'#/#/#/./#','&':'.#./#.#/.#./#.#/.##',"'":'#/#/././.','+':'.../.#./###/.#./...','-':'.../.../###/.../...','.':'././././#',',':'./././#/#',':':'./#/./#/.','?':'##./..#/.#./.../.#.','/':'..#/..#/.#./#../#..','(':'.#/#./#./#./.#',')':'#./.#/.#/.#/#.'},{h:5,sp:2}),BFC={};
function bfFont(sz){return sz<=7?BF_S:BF_M;}
function bfGlyph(f,ch){if(!f._p)f._p={};if(ch in f._p)return f._p[ch];const src=f[ch];if(typeof src!=='string'){f._p[ch]=null;return null;}
  const rows=src.split('/');let c0=99,c1=-1;rows.forEach(r=>{for(let i=0;i<r.length;i++)if(r[i]==='#'){if(i<c0)c0=i;if(i>c1)c1=i;}});
  const p=[];rows.forEach((r,y)=>{for(let i=0;i<r.length;i++)if(r[i]==='#')p.push(i-c0,y);});return f._p[ch]={w:c1-c0+1,p};}
function bfWidth(s,sz){const f=bfFont(sz),k=sz>=12?2:1;let w=0;for(const c0 of String(s)){const ch=c0.toUpperCase();if(ch===' '){w+=f.sp+1;continue;}const g=bfGlyph(f,ch);w+=g?g.w+1:f.h;}return Math.max(0,w-1)*k;}
function bfDraw(C,s,X,Y,c,sz){const key=sz+'|'+c+'|'+s;let t=BFC[key];
  if(!t){const f=bfFont(sz),k=sz>=12?2:1;t=document.createElement('canvas');t.width=Math.max(1,bfWidth(s,sz)/k+1);t.height=f.h+1;t.k=k;const q=t.getContext('2d');q.fillStyle=c;let x0=0;
    for(const c0 of String(s)){const ch=c0.toUpperCase();if(ch===' '){x0+=f.sp+1;continue;}const g=bfGlyph(f,ch);
      if(!g){q.font='700 '+(f.h+2)+"px 'Pixelify Sans', monospace";q.textBaseline='top';q.fillText(c0,x0,-1);x0+=f.h;continue;}
      for(let i=0;i<g.p.length;i+=2)q.fillRect(x0+g.p[i],g.p[i+1],1,1);x0+=g.w+1;}
    BFC[key]=t;}
  C.imageSmoothingEnabled=false;C.drawImage(t,Math.round(X),Math.round(Y),t.width*t.k,t.height*t.k);}
function txt(s,X,Y,c,sz,b){if(TXT&&G!==x){const m=G.getTransform();TXT.push([s,X,Y,c,sz,b,[m.a,m.b,m.c,m.d,m.e,m.f]]);return;}bfDraw(G,s,X,Y,c,sz);}
function poly(c,pts,line){G.fillStyle=line||'#1b1220';G.beginPath();pts.forEach(([a,b],i)=>{i?G.lineTo(a,b):G.moveTo(a,b);});G.closePath();G.fill();if(c){G.fillStyle=c;G.beginPath();const cx=pts.reduce((s,p)=>s+p[0],0)/pts.length,cy=pts.reduce((s,p)=>s+p[1],0)/pts.length;pts.forEach(([a,b],i)=>{const k=Math.hypot(a-cx,b-cy);const f=k>0?(k-1.2)/k:1;const q=[cx+(a-cx)*f,cy+(b-cy)*f];i?G.lineTo(q[0],q[1]):G.moveTo(q[0],q[1]);});G.closePath();G.fill();}}
function polyDist(pts,X,Y){let b=1e9;for(let i=1;i<pts.length;i++){const[a1,b1]=pts[i-1],[a2,b2]=pts[i];const dx=a2-a1,dy=b2-b1;let t=((X-a1)*dx+(Y-b1)*dy)/(dx*dx+dy*dy);t=Math.max(0,Math.min(1,t));const d=Math.hypot(X-a1-dx*t,Y-b1-dy*t);if(d<b)b=d;}return b;}

/* ================= GROUND, CLIFF AND WATER LOOKS (flat, cartoon) ================= */
const GROUND={
  grass:(X,Y)=>{const h=hash(X>>1,Y>>1);return h>.985?'#b8f07a':h>.95?'#5cb73a':'#6cc644';},
  forest:(X,Y)=>{const h=hash(X>>1,Y>>1);return h>.97?'#5aae44':h>.9?'#2f7a2c':'#3a8d33';},
  boreal:(X,Y)=>{const h=hash(X>>1,Y>>1);return h>.97?'#7cc05a':h>.92?'#3c7f33':'#4a9238';},
  wheat:(X,Y)=>Y%6<2?'#dcb048':hash(X>>2,Y>>2)>.9?'#f7dd88':'#ecc858',
  paved:(X,Y)=>(X%14===0||Y%12===0)?'#c4bfb2':'#d8d3c6',
  gravel:(X,Y)=>hash(X,Y)>.93?'#9a9282':'#c2baa8',
  mud:(X,Y)=>hash(X>>2,Y>>2)>.9?'#6a4a2e':'#86603c',
  dirt:(X,Y)=>hash(X>>1,Y>>1)>.95?'#b0803f':'#c99a5c',
  sand:(X,Y)=>(Y+Math.round(Math.sin(X/14)*3))%10<2?'#dcbc6c':'#ecd28c',
  snow:(X,Y)=>hash(X>>2,Y>>2)>.9?'#d6e0f4':'#f2f6ff',
  rock:(X,Y)=>hash(X>>2,Y>>2)>.88?'#86827a':'#9a968c',
  badlands:(X,Y)=>['#e0a86c','#c9804c','#ecd0a6','#bb744c'][((Math.floor((Y+Math.sin(X/30)*6)/7))%4+4)%4],
  fern:(X,Y)=>{const h=hash(X>>1,Y>>1);return h>.93?'#5fbf4a':'#2f8a3a';},
  baseplate:(X,Y)=>{const a=X%8,b=Y%8;if(a>=2&&a<=5&&b>=2&&b<=5){if(b===2)return'#8fe09a';return'#57c066';}return'#3fa34d';},
  candy:(X,Y)=>((X>>3)+(Y>>3))&1?'#ffd1e6':'#fff6fb',
  metal:(X,Y)=>(X%24===0||Y%24===0)?'#6f7889':(X%24===3&&Y%24===3)?'#dfe5ee':'#9aa3b2',
  glitch:(X,Y)=>(X%16===0||Y%16===0)?'#5a2fa0':hash(X,Y)>.992?(hash(Y,X)>.5?'#00ffd0':'#ff3df0'):((X>>3)+(Y>>3))&1?'#2a1846':'#24143e'
};
const RIM={grass:'#a8ec74',forest:'#6cc644',boreal:'#7cc05a',wheat:'#fff1b0',paved:'#eeeae0',gravel:'#dcd6c6',mud:'#a8825a',dirt:'#e7c98a',sand:'#fff1c0',snow:'#ffffff',rock:'#c9c4b8',badlands:'#f2dcb8',fern:'#5fbf4a',baseplate:'#7fd88c',candy:'#ffffff',metal:'#dfe5ee',glitch:'#00ffd0'};
const LINE={grass:'#2e6423',forest:'#1b3d14',boreal:'#244a1c',wheat:'#8a6420',paved:'#6b6f7a',gravel:'#6b6f7a',mud:'#3b2618',dirt:'#5e3b20',sand:'#8a6420',snow:'#7d86a8',rock:'#3a3836',badlands:'#5e3b20',fern:'#14391a',baseplate:'#1f5e2a',candy:'#9b2d6b',metal:'#2b2f45',glitch:'#ff3df0'};
const CLIFFS={dirt:['#e7c98a','#c99a5c','#a0703c','#6f4a26','#3b2618'],rock:['#c9c4b8','#a8a296','#86807a','#5e5a56','#3a3836'],candy:['#ffffff','#ffd1e6','#ff9cc8','#ff6fae','#9b2d6b'],
  brick:['#e8364b','#f6c445','#2a5bd7','#44c55a','#1b1220'],metal:['#c9d0dc','#9aa3b2','#6f7889','#4a5160','#2b2f45'],glitch:['#ff3df0','#7a2fd0','#00ffd0','#3a1a70','#140a28'],badlands:['#e6c49a','#d9a066','#c27a4a','#a8664a','#5e3b20']};
const WATER={blue:{a:'#4a8ae0',b:'#4a8ae0',edge:'#2f62b0',foam:'#7fb0f0',sh:'#cfe4ff'},dark:{a:'#3a74b4',b:'#3a74b4',edge:'#22508a',foam:'#5f96d4',sh:'#a8cce8'},
  lego:{a:'#2a5bd7',b:'#2655c8',edge:'#1d44a8',foam:'#5a85f0',sh:'#cfe0ff'},chasm:{a:'#3a1f12',b:'#33190e',edge:'#22100a',foam:'#5a3220',sh:'#ff9a4a'},
  space:{a:'#1a1240',b:'#1a1240',edge:'#120c30',foam:'#2a2060',sh:'#ffffff'},void:{a:'#0b0618',b:'#0b0618',edge:'#05030c',foam:'#2a0f4a',sh:'#00ffd0'},
  muskeg:{a:'#4a7c9a',b:'#4a7c9a',edge:'#2f5670',foam:'#6f9cb4',sh:'#cfe6f0'}};

/* ================= PROPS ================= */
const P={
  canflag(X,Y){px('#1b1220',X-1,Y-30,2,30);px('#1b1220',X+1,Y-31,19,12);px('#d52b1e',X+2,Y-30,4,10);px('#ffffff',X+6,Y-30,9,10);px('#d52b1e',X+15,Y-30,4,10);mapleLeaf(X+10,Y-25);},
  tree(X,Y){shadow(X,Y+1,7);px('#5e3b20',X-1,Y-3,3,5);px('#1b3d14',X-8,Y-15,16,12);px('#1b3d14',X-6,Y-18,12,4);px('#3f9636',X-7,Y-14,14,10);px('#3f9636',X-5,Y-17,10,3);px('#7cd65a',X-5,Y-15,6,3);px('#7cd65a',X-3,Y-17,3,1);},
  pine(X,Y){shadow(X+1,Y+1,6);px('#5e3b20',X,Y-3,2,4);for(let i=0;i<4;i++){const w=4+i*2;px('#123a22',X-w/2,Y-18+i*4,w+2,5);px('#2a6b3e',X-w/2+1,Y-18+i*4,w,4);px('#4f9a5e',X-w/2+1,Y-18+i*4,2,1);}},
  snowpine(X,Y){P.pine(X,Y);px('#ffffff',X-1,Y-18,4,1);px('#ffffff',X-3,Y-14,3,1);px('#ffffff',X+2,Y-10,3,1);},
  bush(X,Y){px('#1b3d14',X-5,Y-6,11,7);px('#3f9636',X-4,Y-5,9,5);[[-2,-4],[1,-3],[3,-5]].forEach(([a,b])=>px('#5b3a8c',X+a,Y+b,2,2));},
  fern(X,Y){for(let i=-3;i<=3;i++){px('#14391a',X+i*2,Y-7+Math.abs(i),2,7-Math.abs(i));px('#4fae4a',X+i*2,Y-6+Math.abs(i),1,5-Math.abs(i));}},
  cycad(X,Y){px('#6f4a26',X-1,Y-10,3,10);[[-7,-12],[-4,-15],[2,-15],[5,-12]].forEach(([a,b])=>{px('#14391a',X+a,Y+b,5,3);px('#3f9636',X+a,Y+b,4,2);});},
  hoodoo(X,Y){shadow(X,Y,5);box('#e0a86c',X-3,Y-14,7,14);px('#c9804c',X-3,Y-9,7,2);px('#ecd0a6',X-3,Y-5,7,2);box('#6f5a48',X-5,Y-18,11,4);},
  cactus(X,Y){box('#3f8f2e',X-1,Y-12,3,12);box('#3f8f2e',X-5,Y-9,2,5);box('#3f8f2e',X+3,Y-8,2,4);},
  rockpile(X,Y){box('#9a968c',X-5,Y-5,7,5);box('#86807a',X,Y-7,6,7);px('#c9c4b8',X,Y-7,6,1);},
  cane(X,Y){for(let i=0;i<14;i++)px(i%4<2?'#e8364b':'#ffffff',X,Y-i,2,1);px('#e8364b',X+1,Y-15,4,2);px('#ffffff',X+4,Y-14,2,3);},
  lolli(X,Y){px('#ffffff',X,Y-8,1,8);box(['#ff6fae','#7ec8ff','#f6c445'][Math.floor(hash(X,Y)*3)],X-3,Y-15,7,7);px('#ffffff',X-1,Y-13,2,2);},
  present(X,Y){const c=['#e8364b','#2a5bd7','#44c55a','#f6c445'][Math.floor(hash(X,Y)*4)];box(c,X-5,Y-9,10,9);px('#ffffff',X-1,Y-9,2,9);px('#ffffff',X-5,Y-6,10,2);px('#ffffff',X-3,Y-12,3,3);px('#ffffff',X+1,Y-12,3,3);},
  cube(X,Y){const c=['#7a2fd0','#00a8c0','#ff3df0','#5a2fa0'][Math.floor(hash(X,Y)*4)];px('#140a28',X-6,Y-12,13,13);px(c,X-5,Y-11,8,8);px('#ffffff',X-5,Y-11,8,1);px('rgba(0,0,0,.45)',X+3,Y-9,3,8);px('rgba(0,0,0,.25)',X-3,Y-3,9,3);},
  upsideTree(X,Y){px('#00ffd0',X-1,Y-18,3,6);px('#140a28',X-8,Y-12,16,12);px('#7a2fd0',X-7,Y-11,14,10);px('#ff3df0',X-5,Y-4,6,2);},
  wirePyramid(X,Y){G.strokeStyle='#00ffd0';G.lineWidth=1;G.beginPath();G.moveTo(X-14,Y);G.lineTo(X,Y-24);G.lineTo(X+14,Y);G.lineTo(X-14,Y);G.moveTo(X,Y-24);G.lineTo(X+4,Y-4);G.lineTo(X+14,Y);G.moveTo(X+4,Y-4);G.lineTo(X-14,Y);G.stroke();},
  minibrick(X,Y){const c=['#e8364b','#f6c445','#2a5bd7','#ffffff','#44c55a'][Math.floor(hash(X,Y)*5)];box(c,X-4,Y-4,9,4);px('rgba(255,255,255,.55)',X-3,Y-5,2,1);px('rgba(255,255,255,.55)',X+1,Y-5,2,1);},
  home(X,Y,roof){shadow(X+10,Y+1,13,3);box('#f6ead2',X,Y-12,20,12);px('#1b1220',X-3,Y-20,26,9);px(roof||'#e8364b',X-2,Y-19,24,7);px('rgba(255,255,255,.4)',X-2,Y-19,24,2);box('#7ec8ff',X+3,Y-9,4,4);box('#7ec8ff',X+13,Y-9,4,4);px('#8a5426',X+8,Y-6,4,6);},
  fence(X,Y,n){for(let i=0;i<n;i++){px('#1b1220',X+i*4-1,Y-7,3,8);px('#ffffff',X+i*4,Y-6,1,6);}px('#ffffff',X-1,Y-4,n*4,1);},
  tower(X,Y,w,h,c,win){shadow(X+w/2,Y+1,w*0.7,3);box(c,X,Y-h,w,h);px('rgba(255,255,255,.22)',X,Y-h,3,h);px('rgba(0,0,0,.15)',X+w-3,Y-h,3,h);for(let yy=Y-h+4;yy<Y-6;yy+=6)for(let xx=X+4;xx<X+w-4;xx+=5)px(win||'#d6eaf4',xx,yy,3,3);},
  sign(X,Y,a,b){px('#1b1220',X+14,Y-10,2,10);box('#2f7d32',X,Y-30,44,20);px('#ffffff',X+1,Y-29,42,1);txt(a,X+3,Y-27,'#ffffff',6,1);if(b)txt(b,X+3,Y-20,'#f6c445',6,1);},
  label(X,Y,s,c){if(LBL){LBL.push([X,Y,s,c]);return;}Y+=8;const w=bfWidth(s,8)+8;px('rgba(17,19,43,.88)',X-w/2,Y,w,12);px('rgba(255,255,255,.18)',X-w/2,Y,w,1);txt(s,X-w/2+4,Y+2,c||'#ffffff',8,1);},
  /* ---- Saskatoon ---- */
  kinanHouse(X,Y){shadow(X+43,Y+2,48,5);box('#f6ead2',X,Y-48,86,48);px('#e2d4b4',X,Y-25,86,1);px('#1b1220',X-6,Y-67,98,20);px('#e8364b',X-5,Y-66,96,18);px('#ff7a88',X-5,Y-66,96,4);px('#a8243a',X-5,Y-51,96,3);box('#8a5a32',X+65,Y-76,8,13);
    [[8,-42],[30,-42],[52,-42],[70,-42],[8,-19],[56,-19],[70,-19]].forEach(([a,b])=>{box('#7ec8ff',X+a,Y+b,8,8);px('#cfeeff',X+a,Y+b,8,2);});px('#f6c445',X+30,Y-42,8,8);px('#fff3c4',X+31,Y-41,3,3);
    box('#a8692e',X+36,Y-16,10,16);px('#f6c445',X+44,Y-8,1,2);for(let i=0;i<8;i++)px(['#ff6fae','#f6c445','#7ec8ff','#8fd94f'][i%4],X+4+i*10,Y-28,6,3);},
  hatch(X,Y){box('#3b2618',X,Y,12,9);px('#6f4a26',X,Y,12,1);px('#6f4a26',X,Y+4,12,1);[[16,4,'#e8364b'],[24,4,'#2a5bd7'],[20,-1,'#f6c445']].forEach(([a,b,c])=>box(c,X+a,Y+b,7,4));},
  mall(X,Y){shadow(X+30,Y+1,34,4);box('#e2d6bc',X,Y-16,60,16);px('#1b1220',X-2,Y-21,64,6);px('#ff6fae',X-1,Y-20,62,4);for(let i=0;i<6;i++)box('#7ec8ff',X+4+i*9,Y-11,6,6);},
  studio(X,Y){shadow(X+14,Y+1,16,3);box('#ffd6e6',X,Y-20,28,20);box('#9b2d6b',X+11,Y-11,6,11);box('#ffffff',X+7,Y-31,3,10);box('#ffffff',X+18,Y-31,3,10);px('#f39ac0',X+8,Y-28,1,6);px('#f39ac0',X+19,Y-28,1,6);px('#2a2f45',X+2,Y-17,6,5);px('#9bd0ff',X+4,Y-16,2,2);},
  remai(X,Y){shadow(X+25,Y+2,32,4);box('#3a3a44',X,Y-10,50,10);box('#4a4a56',X+8,Y-20,46,10);box('#3a3a44',X-4,Y-30,44,10);box('#4a4a56',X+6,Y-40,40,10);for(let r=0;r<4;r++)px('#e8b860',X+10+r*3,Y-36+r*10,24-r*2,1);},
  bessborough(X,Y){shadow(X,Y+2,40,6);box('#efe0bc',X-34,Y-38,68,38);px('#d4c29a',X-34,Y-14,68,2);for(let r=0;r<3;r++)for(let i=0;i<8;i++)box('#5a6fa0',X-29+i*8,Y-33+r*10,3,5);
    px('#1b1220',X-38,Y-54,76,17);px('#3fa88a',X-37,Y-53,74,15);px('#8ce0c4',X-37,Y-53,74,3);
    [-36,26].forEach(a=>{box('#efe0bc',X+a,Y-64,12,28);px('#1b1220',X+a-2,Y-80,16,17);px('#3fa88a',X+a-1,Y-79,14,15);px('#8ce0c4',X+a+4,Y-86,4,8);});
    box('#efe0bc',X-8,Y-74,16,38);px('#1b1220',X-10,Y-94,20,21);px('#3fa88a',X-9,Y-93,18,19);px('#8ce0c4',X-2,Y-102,4,9);box('#2b2f45',X-5,Y-13,10,13);px('#1b1220',X,Y-114,1,12);P.label(X,Y+4,'THE BESSBOROUGH');},
  uofsTower(X,Y){shadow(X+32,Y+2,38,4);box('#c4bcaa',X,Y-26,64,26);for(let r=0;r<4;r++)px('#a8a08e',X,Y-22+r*6,64,1);px('#1b1220',X-3,Y-33,70,8);px('#6f7889',X-2,Y-32,68,6);[[6,-20],[50,-20]].forEach(([a,b])=>box('#cfeeff',X+a,Y+b,6,8));
    box('#c4bcaa',X+24,Y-58,16,34);px('#1b1220',X+22,Y-64,20,7);px('#6f7889',X+23,Y-63,18,5);box('#f6ead2',X+28,Y-50,8,8);px('#1b1220',X+32,Y-48,1,4);P.label(X+32,Y+4,'U of S');},
  school(X,Y){shadow(X+30,Y+2,34,4);box('#c8603c',X,Y-24,56,24);px('#1b1220',X-3,Y-31,62,8);px('#6b6f7a',X-2,Y-30,60,6);[[6,-18],[20,-18],[34,-18],[46,-18]].forEach(([a,b])=>box('#cfeeff',X+a,Y+b,6,7));box('#3f63a8',X+24,Y-10,8,10);
    px('#1b1220',X+64,Y-20,2,20);px('#1b1220',X+86,Y-20,2,20);px('#e8364b',X+64,Y-21,24,3);px('#9a9aa6',X+70,Y-18,1,10);px('#9a9aa6',X+80,Y-18,1,10);px('#1b1220',X+68,Y-8,15,2);box('#f6c445',X+66,Y-4,6,4);},
  shops(X,Y,n){shadow(X+n*15,Y+2,n*16,4);[['#c8603c','#e8364b'],['#d8a870','#2a5bd7'],['#9a6030','#44c55a'],['#c8603c','#f6c445'],['#d8a870','#ff6fae'],['#9a6030','#e8364b']].slice(0,n||5).forEach(([w,a],i)=>{const sx=X+i*30;box(w,sx,Y-22,26,22);for(let k=0;k<6;k++)px(k%2?a:'#ffffff',sx+k*4+1,Y-13,4,4);box('#cfeeff',sx+5,Y-19,6,5);box('#cfeeff',sx+15,Y-19,6,5);});},
  patio(X,Y){px('#1b1220',X,Y-2,34,3);px('#a8692e',X+1,Y-1,32,1);px('#1b1220',X+4,Y,2,6);px('#1b1220',X+28,Y,2,6);[[6,-4],[16,-4],[26,-4]].forEach(([a,b])=>{px('#f4f1e8',X+a,Y+b,6,2);px('#e8364b',X+a+2,Y+b-1,2,1);});},
  cakeVolcano(X,Y){shadow(X,Y+3,54,6);[[-48,0,96,22,'#ffd6e6','#f39ac0'],[-36,-22,72,20,'#fff3c4','#f6c445'],[-24,-42,48,18,'#ffd6e6','#ff6fae']].forEach(([a,b,w,h,c1,c2])=>{box(c1,X+a,Y+b-h,w,h);px(c2,X+a,Y+b-h,w,4);for(let i=0;i<w;i+=8)px(c2,X+a+i,Y+b-h+4,4,3+((i/8)%2)*3);px('rgba(0,0,0,.12)',X+a+w-8,Y+b-h,8,h);});box('#8a5426',X-8,Y-72,16,12);px('#e8364b',X-6,Y-72,12,3);},
  elevator(X,Y){shadow(X+18,Y+2,22,4);box('#c8463e',X,Y-46,22,46);px('#e0605a',X,Y-46,4,46);px('#1b1220',X+2,Y-57,18,12);px('#a8322e',X+3,Y-56,16,10);box('#c8463e',X+22,Y-22,14,22);px('#f4f1e8',X+4,Y-38,14,5);},
  arenaDome(X,Y,c,lbl){shadow(X,Y+2,36,6);G.fillStyle='#1b1220';G.beginPath();G.ellipse(X,Y-10,34,16,0,0,Math.PI*2);G.fill();G.fillStyle='#e6e9f0';G.beginPath();G.ellipse(X,Y-10,33,15,0,0,Math.PI*2);G.fill();G.fillStyle=c;G.fillRect(X-33,Y-8,66,3);G.fillStyle='#ffffff';G.beginPath();G.ellipse(X-6,Y-16,16,5,0,0,Math.PI*2);G.fill();if(lbl)P.label(X,Y+6,lbl);},
  /* ---- Oilfield ---- */
  trailer(X,Y,c){shadow(X+20,Y+1,22,3);box(c||'#eee8d6',X,Y-12,40,12);px('#9a9282',X,Y-3,40,1);for(let i=0;i<4;i++)px('#7ec8ff',X+4+i*9,Y-9,5,4);},
  camp(X,Y){P.trailer(X,Y-18,'#ddd6c2');P.trailer(X,Y);P.trailer(X+46,Y,'#ddd6c2');box('#6b6f7a',X+50,Y-30,8,12);P.label(X+44,Y+4,'WORK CAMP');},
  truck(X,Y,c){shadow(X+20,Y+2,22,3);box(c||'#e8364b',X,Y-10,14,10);box('#cfd6e2',X+2,Y-8,8,4);box('#d4d4da',X+15,Y-13,26,13);px('#1b1220',X+16,Y-7,24,1);px('#1b1220',X+3,Y,5,3);px('#1b1220',X+20,Y,5,3);px('#1b1220',X+32,Y,5,3);px('#f6c445',X+15,Y-15,26,2);},
  haulTruck(X,Y){shadow(X+24,Y+3,30,5);box('#f6c445',X,Y-24,44,16);px('#ffe58a',X,Y-24,44,3);box('#f6c445',X+34,Y-34,14,12);box('#cfeeff',X+38,Y-31,7,5);px('#1b1220',X+2,Y-8,12,9);px('#1b1220',X+30,Y-8,12,9);px('#4a4f57',X+5,Y-5,6,4);px('#4a4f57',X+33,Y-5,6,4);txt('HAUL',X+6,Y-20,'#1b1220',7,1);},
  piperack(X,Y,w){shadow(X+w/2,Y+1,w/2,3);for(let i=0;i<=w;i+=14){px('#1b1220',X+i,Y-22,2,22);}px('#1b1220',X,Y-23,w+2,3);[['#f6c445',-19],['#e8364b',-16],['#9aa3b2',-13]].forEach(([c,o])=>px(c,X,Y+o,w+2,2));},
  derrick(X,Y){shadow(X,Y+2,30,5);for(let i=0;i<64;i+=2){const w=Math.round(24-i*0.32);px('#1b1220',X-w/2,Y-i,1,2);px('#1b1220',X+w/2,Y-i,1,2);if(i%8===0)px('#e8364b',X-w/2,Y-i,w,1);}px('#1b1220',X-3,Y-70,6,6);px('#f6c445',X-2,Y-69,4,4);box('#9aa3b2',X-26,Y-12,52,12);px('#e8364b',X-26,Y-12,52,2);box('#eee8d6',X+30,Y-14,22,14);P.label(X,Y+4,"DAD'S RIG");},
  mine(X,Y){for(let i=0;i<5;i++){G.fillStyle=['#a0703c','#b8894e','#c99a5c','#8a6440','#6a4a2e'][i];G.beginPath();G.ellipse(X,Y+i*3,70-i*12,30-i*5,0,0,Math.PI*2);G.fill();G.strokeStyle='#5e3b20';G.lineWidth=1;G.stroke();}G.fillStyle='#2a1a10';G.beginPath();G.ellipse(X,Y+16,16,6,0,0,Math.PI*2);G.fill();P.label(X,Y+38,'OIL SANDS MINE');},
  moose(X,Y){shadow(X+10,Y+1,12,3);box('#6a4020',X,Y-10,20,8);px('#6a4020',X+2,Y-2,2,4);px('#6a4020',X+15,Y-2,2,4);box('#6a4020',X+18,Y-15,7,8);px('#3b2618',X+24,Y-12,3,4);px('#d8c8a8',X+15,Y-21,4,6);px('#d8c8a8',X+23,Y-21,4,6);px('#d8c8a8',X+13,Y-22,16,2);},
  lightTower(X,Y){px('#1b1220',X,Y-34,2,34);box('#eee8d6',X-6,Y-40,14,6);px('#fff3c4',X-5,Y-39,12,4);box('#f6c445',X-6,Y-6,14,6);},
  /* ---- Edmonton ---- */
  wem(X,Y){shadow(X+95,Y+3,100,6);box('#ece4d0',X,Y-40,190,40);px('#1b1220',X-2,Y-46,194,7);px('#3f63a8',X-1,Y-45,192,5);for(let i=0;i<18;i++)box('#7ec8ff',X+6+i*10,Y-33,6,8);
    box('#7ec8ff',X+8,Y-72,46,28);px('#cfeeff',X+8,Y-72,46,4);[[14,'#e8364b'],[26,'#f6c445'],[38,'#44c55a']].forEach(([a,c])=>{for(let i=0;i<20;i++)px(c,X+a+Math.sin(i/3)*4,Y-70+i,3,2);});
    box('#ffffff',X+70,Y-62,40,18);px('#cfeeff',X+72,Y-58,36,10);P.label(X+95,Y+4,'WEST EDMONTON MALL');},
  coaster(X,Y){G.strokeStyle='#e8364b';G.lineWidth=2;G.beginPath();G.moveTo(X,Y);G.bezierCurveTo(X+10,Y-50,X+30,Y-50,X+34,Y-20);G.arc(X+44,Y-24,10,Math.PI,Math.PI*3);G.bezierCurveTo(X+60,Y-40,X+70,Y-10,X+80,Y);G.stroke();},
  crane(X,Y){for(let i=0;i<70;i+=3){px('#1b1220',X,Y-i,1,2);px('#1b1220',X+5,Y-i,1,2);px('#f6c445',X+1,Y-i,4,1);}px('#1b1220',X-20,Y-72,60,3);px('#f6c445',X-19,Y-71,58,1);box('#6b6f7a',X-22,Y-76,8,6);box('#eee8d6',X+1,Y-80,8,6);},
  legislature(X,Y){shadow(X,Y+2,44,5);box('#ecd8a8',X-40,Y-26,80,26);for(let i=0;i<10;i++)px('#d4bc88',X-36+i*8,Y-24,3,24);box('#ecd8a8',X-16,Y-42,32,16);for(let i=0;i<4;i++)px('#d4bc88',X-12+i*8,Y-40,3,14);
    G.fillStyle='#1b1220';G.beginPath();G.arc(X,Y-42,17,Math.PI,0);G.fill();G.fillStyle='#7fae96';G.beginPath();G.arc(X,Y-42,16,Math.PI,0);G.fill();px('#b4dcc8',X-10,Y-54,6,4);box('#ecd8a8',X-2,Y-64,4,6);px('#1b1220',X,Y-74,1,10);P.label(X,Y+4,'THE LEGISLATURE');},
  stantec(X,Y){shadow(X+9,Y+2,14,4);px('#1b1220',X-1,Y-122,20,123);px('#4a6a9a',X,Y-118,18,118);px('#7a9aca',X+2,Y-118,3,118);for(let i=0;i<118;i+=6)px('#2f4a72',X,Y-118+i,18,1);px('#4a6a9a',X+4,Y-121,10,4);px('#1b1220',X+8,Y-132,1,11);P.label(X+9,Y+4,'STANTEC TOWER');},
  rogersPlace(X,Y){shadow(X,Y+3,46,6);G.fillStyle='#1b1220';G.beginPath();G.ellipse(X,Y-12,44,18,0,0,Math.PI*2);G.fill();G.fillStyle='#d8dde6';G.beginPath();G.ellipse(X,Y-12,43,17,0,0,Math.PI*2);G.fill();
    G.strokeStyle='#ff8a3d';G.lineWidth=3;G.beginPath();G.ellipse(X,Y-12,36,12,0,0.2,Math.PI*1.3);G.stroke();G.strokeStyle='#2a5bd7';G.beginPath();G.ellipse(X,Y-12,26,8,0,3.4,5.8);G.stroke();P.label(X,Y+8,'ICE DISTRICT');},
  princess(X,Y){shadow(X+18,Y+2,20,3);box('#e8d8b8',X,Y-30,36,30);px('#1b1220',X+2,Y-24,32,9);px('#e8364b',X+3,Y-23,30,7);txt('PRINCESS',X+4,Y-23,'#ffffff',6,1);box('#3b2618',X+13,Y-12,10,12);for(let i=0;i<8;i++)px('#f6c445',X+3+i*4,Y-26,1,1);},
  pyramids(X,Y){[[0,22,'#cfeeff'],[26,30,'#bfe6f8'],[60,20,'#cfeeff'],[82,18,'#bfe6f8']].forEach(([a,h,c])=>{G.fillStyle='#1b1220';G.beginPath();G.moveTo(X+a-1,Y+1);G.lineTo(X+a+h,Y-h-1);G.lineTo(X+a+2*h+1,Y+1);G.fill();G.fillStyle=c;G.beginPath();G.moveTo(X+a+1,Y);G.lineTo(X+a+h,Y-h+1);G.lineTo(X+a+2*h-1,Y);G.fill();G.fillStyle='rgba(255,255,255,.6)';G.fillRect(X+a+h-1,Y-h+3,2,h-4);});P.label(X+50,Y+4,'MUTTART PYRAMIDS');},
  busStop(X,Y){px('#1b1220',X,Y-16,2,16);box('#7ec8ff',X+2,Y-16,16,10);box('#e8364b',X+24,Y-12,34,12);for(let i=0;i<4;i++)px('#cfeeff',X+27+i*8,Y-10,5,4);px('#1b1220',X+28,Y,4,2);px('#1b1220',X+50,Y,4,2);},
  restaurant(X,Y){shadow(X+20,Y+2,22,3);box('#c8603c',X,Y-22,40,22);for(let i=0;i<10;i++)px(i%2?'#44c55a':'#ffffff',X+i*4,Y-26,4,5);box('#cfeeff',X+4,Y-16,10,8);box('#3b2618',X+24,Y-14,8,14);},
  funicular(X,Y){for(let i=0;i<40;i++)px('#6b6f7a',X+i,Y+i*0.9,2,2);},
  /* ---- Calgary ---- */
  mountain(X,Y,w,h){G.fillStyle='#1b1220';G.beginPath();G.moveTo(X-1,Y+1);G.lineTo(X+w/2,Y-h-1);G.lineTo(X+w+1,Y+1);G.fill();G.fillStyle='#8a90b0';G.beginPath();G.moveTo(X+1,Y);G.lineTo(X+w/2,Y-h+1);G.lineTo(X+w-1,Y);G.fill();G.fillStyle='#6b7094';G.beginPath();G.moveTo(X+w/2,Y-h+1);G.lineTo(X+w-1,Y);G.lineTo(X+w*0.62,Y);G.fill();
    G.fillStyle='#ffffff';G.beginPath();G.moveTo(X+w/2-w*0.16,Y-h*0.68);G.lineTo(X+w/2,Y-h+1);G.lineTo(X+w/2+w*0.16,Y-h*0.68);G.lineTo(X+w/2+w*0.06,Y-h*0.62);G.lineTo(X+w/2-w*0.04,Y-h*0.7);G.fill();},
  chief(X,Y){shadow(X+50,Y+2,60,6);G.fillStyle='#1b1220';G.beginPath();G.moveTo(X-2,Y+1);G.quadraticCurveTo(X+10,Y-96,X+60,Y-100);G.quadraticCurveTo(X+104,Y-90,X+112,Y+1);G.fill();G.fillStyle='#b8b6ae';G.beginPath();G.moveTo(X,Y);G.quadraticCurveTo(X+11,Y-94,X+60,Y-98);G.quadraticCurveTo(X+102,Y-88,X+110,Y);G.fill();
    for(let i=0;i<6;i++)px('#9a988f',X+20+i*14,Y-80+Math.abs(i-3)*6,3,60);px('#2f7a2c',X+30,Y-98,40,4);P.label(X+56,Y+4,'THE CHIEF');},
  calgaryTower(X,Y){shadow(X,Y+2,10,3);px('#1b1220',X-4,Y-90,8,90);px('#f2eee4',X-3,Y-90,6,90);px('#d8d2c4',X+1,Y-90,2,90);px('#1b1220',X-11,Y-104,22,15);px('#e8364b',X-10,Y-103,20,13);px('#ff8a9a',X-10,Y-103,20,3);px('#1b1220',X-9,Y-110,18,7);px('#9aa3b2',X-8,Y-109,16,5);px('#1b1220',X,Y-122,1,12);P.label(X,Y+4,'CALGARY TOWER');},
  bowTower(X,Y){shadow(X+14,Y+2,18,4);G.fillStyle='#1b1220';G.beginPath();G.moveTo(X,Y);G.quadraticCurveTo(X+16,Y-50,X+4,Y-104);G.lineTo(X+26,Y-104);G.quadraticCurveTo(X+36,Y-50,X+28,Y);G.fill();G.fillStyle='#7ab4d8';G.beginPath();G.moveTo(X+2,Y-1);G.quadraticCurveTo(X+17,Y-50,X+6,Y-102);G.lineTo(X+24,Y-102);G.quadraticCurveTo(X+34,Y-50,X+26,Y-1);G.fill();for(let i=6;i<100;i+=8)px('#4a86b4',X+6,Y-i,20,1);P.label(X+14,Y+4,'THE BOW');},
  wonderland(X,Y){G.strokeStyle='#ffffff';G.lineWidth=1;for(let i=0;i<7;i++){G.beginPath();G.ellipse(X,Y-14,9-i*0.4,14,0,0,Math.PI*2);G.stroke();}for(let k=-12;k<=12;k+=4){G.beginPath();G.moveTo(X-9,Y-14+k);G.lineTo(X+9,Y-14+k);G.stroke();}},
  saddledome(X,Y){shadow(X,Y+2,38,5);box('#d8d2c4',X-32,Y-14,64,14);G.fillStyle='#1b1220';G.beginPath();G.moveTo(X-36,Y-12);G.quadraticCurveTo(X,Y-6,X+36,Y-28);G.lineTo(X+36,Y-14);G.quadraticCurveTo(X,Y+2,X-36,Y-2);G.fill();G.fillStyle='#e8364b';G.beginPath();G.moveTo(X-34,Y-11);G.quadraticCurveTo(X,Y-5,X+34,Y-26);G.lineTo(X+34,Y-16);G.quadraticCurveTo(X,Y,X-34,Y-4);G.fill();P.label(X,Y+4,'SADDLEDOME');},
  arena(X,Y,w,h,c){G.fillStyle='#1b1220';G.beginPath();G.ellipse(X,Y,w+2,h+2,0,0,Math.PI*2);G.fill();G.fillStyle=c||'#c99a5c';G.beginPath();G.ellipse(X,Y,w,h,0,0,Math.PI*2);G.fill();G.strokeStyle='#ffffff';G.lineWidth=1;G.beginPath();G.ellipse(X,Y,w-3,h-3,0,0,Math.PI*2);G.stroke();},
  track(X,Y){P.arena(X,Y,46,20,'#a0703c');G.fillStyle='#62bb3c';G.beginPath();G.ellipse(X,Y,32,10,0,0,Math.PI*2);G.fill();[[-20,-14,'#e8364b'],[14,12,'#2a5bd7']].forEach(([a,b,c])=>{box('#f4f1e8',X+a,Y+b-4,8,5);box(c,X+a-4,Y+b-2,4,3);});},
  tent(X,Y,c){G.fillStyle='#1b1220';G.beginPath();G.moveTo(X-1,Y+1);G.lineTo(X+15,Y-19);G.lineTo(X+31,Y+1);G.fill();for(let i=0;i<8;i++){G.fillStyle=i%2?(c||'#e8364b'):'#ffffff';G.beginPath();G.moveTo(X+15,Y-18);G.lineTo(X+1+i*3.75,Y);G.lineTo(X+1+(i+1)*3.75,Y);G.fill();}px('#1b1220',X+15,Y-24,1,6);px('#f6c445',X+16,Y-24,4,3);},
  grandstand(X,Y){shadow(X+60,Y+2,64,5);for(let r=0;r<5;r++)box(r%2?'#d8d2c4':'#b8b2a6',X+r*3,Y-6-r*6,70-r*6,6);for(let i=0;i<30;i++)px(['#e8364b','#f6c445','#2a5bd7','#ffffff'][i%4],X+4+i*2,Y-28+(i%3)*6,1,1);box('#2b2f45',X+80,Y-18,40,18);px('#f6c445',X+82,Y-16,36,2);P.label(X+60,Y+4,'GRANDSTAND');},
  dinoStatue(X,Y){shadow(X+14,Y+1,16,3);box('#44c55a',X,Y-10,26,8);box('#44c55a',X+22,Y-26,4,16);box('#44c55a',X+22,Y-30,10,5);px('#1b1220',X+29,Y-29,1,1);px('#44c55a',X-6,Y-8,6,3);px('#2f8a3a',X+4,Y-2,3,3);px('#2f8a3a',X+16,Y-2,3,3);},
  skijump(X,Y){G.fillStyle='#1b1220';G.beginPath();G.moveTo(X,Y);G.lineTo(X+10,Y-60);G.lineTo(X+16,Y-60);G.lineTo(X+40,Y);G.fill();G.fillStyle='#e8eefc';G.beginPath();G.moveTo(X+3,Y-2);G.lineTo(X+11,Y-58);G.lineTo(X+15,Y-58);G.lineTo(X+36,Y-2);G.fill();box('#e8364b',X+8,Y-66,10,6);P.label(X+20,Y+4,'SKI JUMPS');},
  /* ---- Vancouver ---- */
  canadaPlace(X,Y){shadow(X+40,Y+3,48,5);box('#d8d2c4',X,Y-10,84,10);for(let i=0;i<5;i++){const sx=X+6+i*15;G.fillStyle='#1b1220';G.beginPath();G.moveTo(sx-1,Y-9);G.lineTo(sx+7,Y-34);G.lineTo(sx+15,Y-9);G.fill();G.fillStyle='#ffffff';G.beginPath();G.moveTo(sx+1,Y-10);G.lineTo(sx+7,Y-31);G.lineTo(sx+13,Y-10);G.fill();G.fillStyle='#e6ecf6';G.fillRect(sx+7,Y-28,3,17);}P.label(X+42,Y+4,'CANADA PLACE');},
  harbourCentre(X,Y){shadow(X+8,Y+2,12,3);box('#c9c4b8',X,Y-74,16,74);for(let i=4;i<70;i+=6)px('#a8a296',X+2,Y-74+i,12,2);G.fillStyle='#1b1220';G.beginPath();G.ellipse(X+8,Y-78,14,5,0,0,Math.PI*2);G.fill();G.fillStyle='#dfe5ee';G.beginPath();G.ellipse(X+8,Y-78,13,4,0,0,Math.PI*2);G.fill();px('#f6c445',X-3,Y-79,22,1);px('#1b1220',X+8,Y-92,1,10);},
  bcPlace(X,Y){shadow(X,Y+3,40,6);G.fillStyle='#1b1220';G.beginPath();G.ellipse(X,Y-10,38,15,0,0,Math.PI*2);G.fill();G.fillStyle='#ffffff';G.beginPath();G.ellipse(X,Y-10,37,14,0,0,Math.PI*2);G.fill();for(let i=-30;i<=30;i+=10){px('#1b1220',X+i,Y-34,2,24);G.strokeStyle='#9aa3b2';G.beginPath();G.moveTo(X+i+1,Y-34);G.lineTo(X,Y-12);G.stroke();}P.label(X,Y+6,'BC PLACE');},
  scienceDome(X,Y){shadow(X,Y+2,18,4);px('#1b1220',X-15,Y-6,30,7);box('#9aa3b2',X-14,Y-6,28,6);G.fillStyle='#1b1220';G.beginPath();G.arc(X,Y-18,15,0,Math.PI*2);G.fill();G.fillStyle='#e8eef6';G.beginPath();G.arc(X,Y-18,14,0,Math.PI*2);G.fill();for(let i=-12;i<=12;i+=4)for(let j=-12;j<=12;j+=4)if(i*i+j*j<150&&((i+j)/4)%2===0)px('#9aa3b2',X+i,Y-18+j,2,2);px('#ffffff',X-7,Y-28,4,3);P.label(X,Y+4,'SCIENCE WORLD');},
  market(X,Y){shadow(X+30,Y+2,34,4);box('#c2414f',X,Y-16,60,16);px('#1b1220',X-2,Y-22,64,7);px('#e8636f',X-1,Y-21,62,5);for(let i=0;i<5;i++)box('#f6c445',X+4+i*12,Y-10,8,10);P.label(X+30,Y+4,'GRANVILLE ISLAND');},
  steamClock(X,Y){box('#6b4a2a',X-3,Y-20,6,20);box('#f4f1e8',X-2,Y-18,4,4);px('#1b1220',X,Y-17,1,2);px('#6b4a2a',X-4,Y-23,8,3);},
  capilano(X,Y){px('#3b2618',X-4,Y-8,72,16);px('#1b1220',X-4,Y-8,72,1);G.strokeStyle='#a8692e';G.lineWidth=1;G.beginPath();G.moveTo(X,Y-6);G.quadraticCurveTo(X+32,Y+8,X+64,Y-6);G.stroke();G.beginPath();G.moveTo(X,Y-2);G.quadraticCurveTo(X+32,Y+12,X+64,Y-2);G.stroke();},
  boatshed(X,Y){box('#eee8d6',X,Y-10,30,10);px('#2f62b0',X,Y-14,30,4);},
  observatory(X,Y){box('#cfd6e2',X-12,Y-14,24,14);G.fillStyle='#1b1220';G.beginPath();G.arc(X,Y-14,13,Math.PI,0);G.fill();G.fillStyle='#e8eef6';G.beginPath();G.arc(X,Y-14,12,Math.PI,0);G.fill();px('#2b2f45',X-2,Y-26,4,12);},
  /* ---- Bricks ---- */
  bigBrick(X,Y,w,h,c){shadow(X+w/2,Y+1,w*0.6,3);box(c,X,Y-h,w,h);for(let i=3;i<w-3;i+=8){px(c,X+i,Y-h-3,5,3);px('rgba(255,255,255,.5)',X+i,Y-h-3,5,1);}px('rgba(0,0,0,.18)',X+w-4,Y-h,4,h);px('rgba(255,255,255,.3)',X,Y-h,w,1);},
  bin(X,Y){box('#2a5bd7',X,Y-34,70,34);px('#5a85f0',X,Y-34,70,3);for(let i=0;i<14;i++)P.minibrick(X+6+hash(i,3)*58,Y-30+hash(i,4)*6);txt('BRICKS',X+14,Y-20,'#ffffff',8,1);},
  fireCity(X,Y){P.bigBrick(X,Y,26,40,'#e8364b');P.bigBrick(X+30,Y,22,28,'#ffffff');P.bigBrick(X+56,Y,24,46,'#e8364b');box('#e8364b',X+10,Y+6,30,10);box('#cfeeff',X+12,Y+8,8,4);px('#1b1220',X+14,Y+16,4,3);px('#1b1220',X+32,Y+16,4,3);px('#f6c445',X+22,Y+5,14,1);},
  skyscraper(X,Y){['#f6c445','#2a5bd7','#e8364b','#ffffff','#44c55a','#f6c445','#2a5bd7','#e8364b'].forEach((c,i)=>P.bigBrick(X+(i%2)*2,Y-i*12,28,12,c));},
  brickRex(X,Y){P.bigBrick(X,Y-10,40,14,'#44c55a');P.bigBrick(X+28,Y-24,22,14,'#44c55a');P.bigBrick(X+40,Y-38,18,12,'#44c55a');px('#ffffff',X+52,Y-34,3,3);px('#1b1220',X+53,Y-33,1,1);P.bigBrick(X+4,Y,8,10,'#2f8a3a');P.bigBrick(X+26,Y,8,10,'#2f8a3a');P.bigBrick(X-14,Y-14,16,8,'#44c55a');},
  /* ---- Drumheller / dinos ---- */
  bigDino(X,Y){shadow(X+24,Y+3,34,5);const c='#7aa04a',d='#5a7a34';box(c,X+6,Y-34,34,18);box(c,X+30,Y-62,22,30);box(c,X+40,Y-74,28,16);px('#ffffff',X+50,Y-61,16,2);px('#1b1220',X+58,Y-71,3,3);px('#e8364b',X+44,Y-64,4,3);
    box(d,X+10,Y-16,7,16);box(d,X+28,Y-16,7,16);box(c,X-14,Y-30,22,8);box(c,X+50,Y-48,8,4);P.label(X+28,Y+4,"WORLD'S LARGEST DINOSAUR");},
  tyrrell(X,Y){shadow(X+34,Y+2,38,4);box('#c9b48a',X,Y-18,68,18);px('#1b1220',X-2,Y-22,72,5);px('#8a6440',X-1,Y-21,70,3);for(let i=0;i<5;i++)box('#7ec8ff',X+6+i*12,Y-13,7,7);P.label(X+34,Y+4,'DINOSAUR MUSEUM');},
  bones(X,Y){px('#f4f1e8',X,Y-2,20,2);for(let i=2;i<18;i+=4){px('#f4f1e8',X+i,Y-6,1,4);px('#f4f1e8',X+i,Y,1,3);}box('#f4f1e8',X+20,Y-5,6,5);px('#1b1220',X+22,Y-4,1,1);box('#a0703c',X-4,Y+2,32,3);},
  volcano(X,Y){shadow(X,Y+2,50,6);G.fillStyle='#1b1220';G.beginPath();G.moveTo(X-48,Y+1);G.lineTo(X-12,Y-50);G.lineTo(X+12,Y-50);G.lineTo(X+48,Y+1);G.fill();G.fillStyle='#6b5a4a';G.beginPath();G.moveTo(X-46,Y);G.lineTo(X-11,Y-48);G.lineTo(X+11,Y-48);G.lineTo(X+46,Y);G.fill();px('#e8364b',X-10,Y-49,20,3);for(let i=0;i<4;i++)px('#ff8a3d',X-4+i*3,Y-46+i*7,3,8);},
  nest(X,Y){G.fillStyle='#6f4a26';G.beginPath();G.ellipse(X,Y,16,6,0,0,Math.PI*2);G.fill();[[-5,'#f4f1e8'],[1,'#e6c49a'],[7,'#f4f1e8']].forEach(([a,c])=>box(c,X+a-2,Y-7,5,6));},
  canyonCrack(X,Y,w){for(let i=0;i<w;i++){const o=Math.round(Math.sin(i/6)*3);px('#3b2618',X+i,Y+o-3,1,7);px('#1b1220',X+i,Y+o-1,1,3);}},
  /* ---- Starbase ---- */
  domeHut(X,Y){G.fillStyle='#1b1220';G.beginPath();G.arc(X,Y,13,Math.PI,0);G.fill();G.fillStyle='#ecd28c';G.beginPath();G.arc(X,Y,12,Math.PI,0);G.fill();px('#3b2618',X-3,Y-6,6,6);px('#fff1c0',X-8,Y-9,4,2);},
  hangar(X,Y){shadow(X+40,Y+2,44,5);G.fillStyle='#1b1220';G.beginPath();G.arc(X+40,Y,42,Math.PI,0);G.fill();G.fillStyle='#9aa3b2';G.beginPath();G.arc(X+40,Y,40,Math.PI,0);G.fill();for(let i=-36;i<=36;i+=8)px('#6f7889',X+40+i,Y-Math.sqrt(1600-i*i),1,Math.sqrt(1600-i*i));px('#2b2f45',X+24,Y-18,32,18);},
  ship(X,Y){box('#dfe5ee',X,Y-4,24,5);box('#dfe5ee',X+18,Y-6,6,9);px('#e8364b',X+2,Y-3,4,2);box('#9aa3b2',X+6,Y-12,4,16);px('#7ec8ff',X+19,Y-5,3,3);},
  droid(X,Y){box('#dfe5ee',X,Y-9,7,9);px('#2a5bd7',X+1,Y-7,5,2);G.fillStyle='#1b1220';G.beginPath();G.arc(X+3.5,Y-9,4,Math.PI,0);G.fill();G.fillStyle='#dfe5ee';G.beginPath();G.arc(X+3.5,Y-9,3,Math.PI,0);G.fill();px('#e8364b',X+3,Y-11,2,1);},
  kitchenDome(X,Y){shadow(X,Y+2,26,5);G.fillStyle='#1b1220';G.beginPath();G.arc(X,Y,22,Math.PI,0);G.fill();G.fillStyle='#f6c445';G.beginPath();G.arc(X,Y,21,Math.PI,0);G.fill();px('#ff8a3d',X-21,Y-6,42,3);px('#3b2618',X-4,Y-10,8,10);box('#9aa3b2',X+10,Y-30,5,12);},
  /* ---- Multiverse ---- */
  pinata(X,Y){px('#1b1220',X,Y-40,1,16);box('#ff6fae',X-8,Y-24,16,10);for(let i=0;i<4;i++)px(['#f6c445','#7ec8ff','#44c55a','#ff8a3d'][i],X-8,Y-22+i*2,16,1);box('#ff6fae',X+6,Y-30,5,7);px('#1b1220',X+8,Y-28,1,1);px('#ff6fae',X-6,Y-14,2,5);px('#ff6fae',X+4,Y-14,2,5);},
  mirrorTowers(X,Y){P.tower(X,Y,18,60,'#7ec8ff','#ffffff');P.tower(X+26,Y,18,60,'#7ec8ff','#ffffff');px('rgba(255,255,255,.45)',X+2,Y-58,4,56);px('rgba(255,255,255,.45)',X+38,Y-58,4,56);px('#f6c445',X+18,Y-30,8,2);},
  cottage(X,Y){shadow(X+20,Y+2,24,4);box('#e6c49a',X,Y-20,40,20);px('#1b1220',X-4,Y-32,48,13);px('#8a5426',X-3,Y-31,46,11);box('#9a968c',X+30,Y-40,7,10);box('#f6c445',X+5,Y-14,8,7);box('#3b2618',X+18,Y-14,8,14);},
  cakeCastle(X,Y){P.cakeVolcano(X,Y);[[-40,'#ff6fae'],[34,'#7ec8ff']].forEach(([a,c])=>{box('#fff3c4',X+a,Y-60,10,40);px('#1b1220',X+a-2,Y-70,14,11);px(c,X+a-1,Y-69,12,9);});},
  planet(X,Y,r,c){G.fillStyle='#1b1220';G.beginPath();G.arc(X,Y,r+1,0,Math.PI*2);G.fill();G.fillStyle=c;G.beginPath();G.arc(X,Y,r,0,Math.PI*2);G.fill();G.fillStyle='rgba(255,255,255,.35)';G.beginPath();G.arc(X-r/3,Y-r/3,r/3,0,Math.PI*2);G.fill();G.strokeStyle='#f6c445';G.lineWidth=2;G.beginPath();G.ellipse(X,Y,r*1.7,r*0.45,-0.3,0,Math.PI*2);G.stroke();},
  /* ---- Glitch ---- */
  cavern(X,Y){G.fillStyle='#000000';G.beginPath();G.ellipse(X,Y,26,12,0,0,Math.PI*2);G.fill();G.strokeStyle='#00ffd0';G.lineWidth=1;G.beginPath();G.ellipse(X,Y,26,12,0,0,Math.PI*2);G.stroke();G.strokeStyle='rgba(255,61,240,.6)';G.beginPath();G.ellipse(X,Y+3,18,7,0,0,Math.PI*2);G.stroke();},
  backwards(X,Y){px('#140a28',X,Y-8,110,12);for(let i=0;i<110;i+=12)px('#ff3df0',X+i+2,Y-3,6,1);G.save();G.translate(X+108,Y-22);G.scale(-1,1);txt('BACKWARDS BLVD',0,0,'#00ffd0',8,1);G.restore();},
  machine(X,Y){shadow(X+28,Y+2,32,4);box('#4a5160',X,Y-40,56,40);px('#6f7889',X,Y-40,56,3);for(let i=0;i<5;i++)box('#2b2f45',X+6+i*10,Y-32,6,6);G.strokeStyle='#00ffd0';G.lineWidth=2;G.beginPath();G.arc(X+28,Y-16,10,0,Math.PI*2);G.stroke();px('#1b1220',X+60,Y-30,4,30);px('#ff3df0',X+62,Y-28,2,26);},
  glitchArena(X,Y){P.arena(X,Y,40,16,'#2a1846');G.strokeStyle='#ff3df0';G.lineWidth=1;G.beginPath();G.ellipse(X,Y,30,10,0,0,Math.PI*2);G.stroke();},
  castle3d(X,Y){for(let d=8;d>=0;d-=2){const c=d?'#5a6f9a':'#9ab0d8';box(c,X-30+d,Y-40-d,60,40);}for(let i=0;i<5;i++)box('#9ab0d8',X-30+i*13,Y-48,8,8);box('#2b2f45',X-6,Y-18,12,18);}
};

const LEAF=['...r...','.r.r.r.','rrrrrrr','.rrrrr.','..rrr..','...r...','...r...'];
function mapleLeaf(cx,cy,wave){for(let r=0;r<7;r++)for(let c=0;c<7;c++)if(LEAF[r][c]==='r')px('#d52b1e',cx-3+c,cy-3+r+(wave?wave(c):0),1,1);}
/* ================= ANIMATED BITS ================= */
const A={
  canflag(t,X,Y){px('#1b1220',X-1,Y,2,30);const wv=i=>Math.round(Math.sin(t/170+i*0.5)*1.2);for(let i=0;i<17;i++){const c=(i<4||i>=13)?'#d52b1e':'#ffffff';px('#1b1220',X+1+i,Y-1+wv(i),1,12);px(c,X+1+i,Y+wv(i),1,10);}mapleLeaf(X+9,Y+5,c=>wv(5+c));},
  smoke(t,X,Y,c){for(let i=0;i<5;i++){const a=((t/1400)+i/5)%1;G.fillStyle=c?'rgba(90,90,100,'+(0.6-a*0.6)+')':'rgba(255,246,220,'+(0.7-a*0.7)+')';G.beginPath();G.arc(X+Math.sin(a*6+i)*5,Y-a*40,3+a*6,0,Math.PI*2);G.fill();}},
  candle(t,X,Y){px('#ff8a3d',X-3,Y+Math.round(Math.sin(t/120)),6,4);px('#f6c445',X-2,Y+1,4,2);},
  flag(t,X,Y,c){for(let i=0;i<9;i++)px(i<5?c:'#ffffff',X+i,Y+Math.round(Math.sin(t/170+i*0.7)*1.3),1,6);},
  zzz(t,X,Y){for(let i=0;i<3;i++){const a=((t/1800)+i/3)%1;G.globalAlpha=1-a;txt('z',X+a*14+i*3,Y-a*26,'#ffffff',6+i*2,1);}G.globalAlpha=1;},
  ferris(t,X,Y,R){px('#1b1220',X-1,Y,3,R+14);px('#1b1220',X-12,Y+R+12,25,3);G.strokeStyle='#ffffff';G.lineWidth=1;G.beginPath();G.arc(X+.5,Y+.5,R,0,Math.PI*2);G.stroke();
    for(let i=0;i<8;i++){const a=t/2200+i*Math.PI/4,cx=X+Math.cos(a)*R,cy=Y+Math.sin(a)*R;G.strokeStyle='rgba(255,255,255,.5)';G.beginPath();G.moveTo(X+.5,Y+.5);G.lineTo(cx,cy);G.stroke();px(['#e8364b','#f6c445','#2a5bd7','#ff6fae'][i%4],cx-2,cy,5,4);}},
  pelican(t,X,Y,i){const dx=Math.sin(t/2600+i*2)*10,b=Math.round(Math.sin(t/400+i)*0.5);const a=X+dx,c=Y-6+b;px('#1b1220',a-1,c-1,10,6);px('#ffffff',a,c,8,4);px('#ffffff',a+5,c-4,3,4);px('#ff8a3d',a+8,c-3,4,2);px('#1b1220',a+6,c-3,1,1);},
  lights(t,X,Y,n){for(let i=0;i<n;i++){const on=Math.floor(t/350+i)%3!==0;px(on?['#f6c445','#ff6fae','#7ec8ff'][i%3]:'#3b2618',X+i*4,Y+Math.round(Math.sin(i/(n-1)*Math.PI)*3),2,2);}},
  weir(t,X,Y){for(let i=-24;i<=24;i++)px('#ffffff',X+i*0.5-6,Y+i*0.9+Math.sin(i)*1,2,2);for(let i=-24;i<=24;i+=3)if(Math.sin(t/150+i)>0)px('#e6f3ff',X+i*0.5-3,Y+3+i*0.9,2,1);},
  pumpjack(t,X,Y){const a=Math.sin(t/400)*0.35;shadow(X+12,Y+1,16,3);box('#2b2f45',X-2,Y-4,26,4);px('#1b1220',X+8,Y-18,2,14);px('#1b1220',X+12,Y-18,2,14);G.save();G.translate(X+11,Y-18);G.rotate(a);G.fillStyle='#1b1220';G.fillRect(-17,-3,34,5);G.fillStyle='#e8364b';G.fillRect(-16,-2,32,3);G.fillStyle='#1b1220';G.fillRect(13,-6,6,10);G.fillStyle='#f6c445';G.fillRect(14,-5,4,8);G.restore();px('#6b6f7a',X+28,Y-12+Math.round(a*14),1,10);box('#6b6f7a',X+25,Y-4,7,4);},
  flare(t,X,Y){px('#1b1220',X,Y-36,3,36);const h=6+Math.round(Math.sin(t/90)*2+Math.sin(t/37));px('#ff8a3d',X-2,Y-36-h,7,h);px('#f6c445',X,Y-34-h/2,3,h/2);},
  storm(t,X,Y){G.fillStyle='rgba(60,64,90,.92)';[[0,0,22],[18,-6,18],[36,0,20],[-16,4,14]].forEach(([a,b,r])=>{G.beginPath();G.arc(X+a,Y+b,r*0.6,0,Math.PI*2);G.fill();});if((t%2600)<120){G.strokeStyle='#fff3c4';G.lineWidth=2;G.beginPath();G.moveTo(X+10,Y+8);G.lineTo(X+4,Y+22);G.lineTo(X+12,Y+22);G.lineTo(X+2,Y+40);G.stroke();}
    for(let i=0;i<14;i++){const yy=(t/6+i*13)%40;px('rgba(160,190,230,.8)',X-14+i*4,Y+8+yy,1,3);}},
  craneHook(t,X,Y){const o=Math.round(Math.sin(t/900)*16);px('#1b1220',X+o,Y,1,18);box('#9aa3b2',X+o-6,Y+18,12,5);},
  coasterCar(t,X,Y){const u=(t/2600)%1;const p=[[0,0],[10,-38],[30,-38],[34,-20],[54,-24],[44,-34],[34,-24],[62,-28],[80,0]];const i=Math.floor(u*(p.length-1)),f=u*(p.length-1)-i;const a=p[i],b=p[i+1];box('#f6c445',X+a[0]+(b[0]-a[0])*f-3,Y+a[1]+(b[1]-a[1])*f-4,7,4);},
  funicularCar(t,X,Y){const u=(Math.sin(t/1500)+1)/2;box('#e8364b',X+u*36-3,Y+u*32-5,8,6);},
  streetcar(t,X,Y1,Y2){const u=(Math.sin(t/2400)+1)/2;const Y=Y1+(Y2-Y1)*u;box('#c8463e',X-4,Y-8,8,16);px('#f6c445',X-4,Y-2,8,1);px('#cfeeff',X-3,Y-6,6,3);},
  skytrain(t,pts){for(let i=1;i<pts.length;i++){const[a,b]=pts[i-1],[c,d]=pts[i];const L=Math.hypot(c-a,d-b);for(let s=0;s<L;s+=2){const X=a+(c-a)*s/L,Y=b+(d-b)*s/L;px('#9aa3b2',X,Y,2,2);if(s%16<2)px('#4a5160',X,Y+2,2,6);}}
    let tot=0;const segs=[];for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);segs.push(l);tot+=l;}let d=((t/40)%(tot+60))-30;for(let k=0;k<3;k++){let dd=d-k*9;if(dd<0||dd>tot)continue;let j=0;while(dd>segs[j]){dd-=segs[j];j++;}const[a,b]=pts[j],[c,e]=pts[j+1];const X=a+(c-a)*dd/segs[j],Y=b+(e-b)*dd/segs[j];box('#ffffff',X-4,Y-4,8,5);px('#2a5bd7',X-4,Y-2,8,1);}},
  gondola(t,X1,Y1,X2,Y2){G.strokeStyle='#1b1220';G.lineWidth=1;G.beginPath();G.moveTo(X1,Y1);G.lineTo(X2,Y2);G.stroke();const u=(Math.sin(t/2000)+1)/2;const X=X1+(X2-X1)*u,Y=Y1+(Y2-Y1)*u;px('#1b1220',X,Y,1,4);box('#e8364b',X-4,Y+4,9,7);px('#cfeeff',X-3,Y+5,7,3);},
  boat(t,X,Y,i){const b=Math.round(Math.sin(t/500+i)*1);box('#ffffff',X,Y+b-4,16,4);px('#2a5bd7',X,Y+b-1,16,1);px('#1b1220',X+7,Y+b-14,1,10);G.fillStyle='#f4f1e8';G.beginPath();G.moveTo(X+8,Y+b-14);G.lineTo(X+15,Y+b-6);G.lineTo(X+8,Y+b-6);G.fill();},
  seaplane(t,X,Y){const o=Math.round(((t/30)%300));const a=X+o-150,b=Y-Math.max(0,o-200)*0.2;box('#ffffff',a,b-3,16,4);px('#e8364b',a+12,b-6,4,3);box('#ffffff',a+5,b-7,4,10);px('#9aa3b2',a+2,b+2,12,1);},
  steam(t,X,Y){for(let i=0;i<3;i++){const a=((t/900)+i/3)%1;G.fillStyle='rgba(255,255,255,'+(0.7-a*0.7)+')';G.beginPath();G.arc(X+Math.sin(a*5)*2,Y-a*14,1.5+a*3,0,Math.PI*2);G.fill();}},
  waterfall(t,X,Y,h){for(let i=0;i<h;i++){px(((i+Math.floor(t/60))%6<3)?'#cfe4ff':'#ffffff',X,Y+i,6,1);}for(let i=0;i<4;i++){const a=((t/500)+i/4)%1;G.fillStyle='rgba(255,255,255,'+(0.8-a*0.8)+')';G.beginPath();G.arc(X+3+Math.sin(i*2)*6*a,Y+h,2+a*4,0,Math.PI*2);G.fill();}},
  rainbow(t,X,Y,R){const a=0.55+Math.sin(t/900)*0.25;['#e8364b','#ff8a3d','#f6c445','#44c55a','#2a5bd7','#9b2d6b'].forEach((c,i)=>{G.strokeStyle=c;G.globalAlpha=a;G.lineWidth=3;G.beginPath();G.arc(X,Y,R-i*3,Math.PI,0);G.stroke();});G.globalAlpha=1;},
  gear(t,X,Y,R,dir){G.save();G.translate(X,Y);G.rotate(t/700*(dir||1));G.fillStyle='#1b1220';for(let i=0;i<8;i++){G.rotate(Math.PI/4);G.fillRect(-3,-R-4,6,6);}G.beginPath();G.arc(0,0,R+1,0,Math.PI*2);G.fill();G.fillStyle='#f6c445';G.beginPath();G.arc(0,0,R,0,Math.PI*2);G.fill();G.fillStyle='#1b1220';G.beginPath();G.arc(0,0,R/3,0,Math.PI*2);G.fill();G.restore();},
  lasers(t,X,Y,w){for(let k=0;k<3;k++){const on=Math.floor(t/400+k)%2;if(on)px('#ff3d3d',X,Y+k*10,w,1),px('rgba(255,61,61,.35)',X,Y+k*10-1,w,3);}},
  brachio(t,X,Y){const b=Math.round(Math.sin(t/700)*2);box('#7cb06a',X,Y-12,34,12);G.strokeStyle='#1b1220';G.lineWidth=6;G.beginPath();G.moveTo(X+30,Y-8);G.quadraticCurveTo(X+44,Y-30,X+40,Y-48+b);G.stroke();G.strokeStyle='#7cb06a';G.lineWidth=4;G.beginPath();G.moveTo(X+30,Y-8);G.quadraticCurveTo(X+44,Y-30,X+40,Y-48+b);G.stroke();box('#7cb06a',X+36,Y-53+b,10,6);px('#1b1220',X+42,Y-51+b,1,1);},
  suns(t,X,Y){[[0,0,10,'#fff1b0'],[26,8,7,'#ffb46a']].forEach(([a,b,r,c])=>{G.fillStyle='rgba(255,230,160,.25)';G.beginPath();G.arc(X+a,Y+b,r+4+Math.sin(t/400)*1.5,0,Math.PI*2);G.fill();G.fillStyle=c;G.beginPath();G.arc(X+a,Y+b,r,0,Math.PI*2);G.fill();});},
  portal(t,X,Y,R,c){for(let i=0;i<3;i++){G.strokeStyle=i===1?'#ffffff':(c||'#b06cff');G.lineWidth=2;G.beginPath();G.ellipse(X,Y,R-i*3,(R-i*3)*1.3,0,t/300+i,t/300+i+Math.PI*1.4);G.stroke();}},
  balloon(t,X,Y,c){const bx=X+Math.round(Math.sin(t/800+X)*2),by=Y+Math.round(Math.cos(t/900+Y)*2);px('#cfd3ea',bx+2,by+8,1,10);px('#1b1220',bx-1,by-1,7,10);px(c,bx,by,5,8);px('#ffffff',bx+1,by+1,1,2);},
  comet(t,X,Y){const u=((t/4000)%1);const a=X+u*200,b=Y+u*60;G.fillStyle='rgba(255,255,255,.8)';G.beginPath();G.arc(a,b,2,0,Math.PI*2);G.fill();G.strokeStyle='rgba(255,241,176,.5)';G.lineWidth=2;G.beginPath();G.moveTo(a,b);G.lineTo(a-18,b-6);G.stroke();},
  blink(t,X,Y){if(Math.floor(t/250)%2)box('#00ffd0',X,Y,4,4);else box('#ff3df0',X,Y,4,4);},
  floatCube(t,X,Y){P.cube(X,Y+Math.round(Math.sin(t/600+X)*3));}
};

/* ================= THE 12 WORLDS =================
   Each world lives in worlds/wNN.js and registers itself with KINAN.W.push({...}). */
const W=[];
const homes=(list)=>list.map(([a,b,c])=>['home',a,b,c]);
/* ================= BUILD A WORLD MAP ================= */
const CLIFF=12;
function catmull(pts,step){if(pts.length<3)return dense(pts,step);const out=[];const P2=[pts[0],...pts,pts[pts.length-1]];for(let i=1;i<P2.length-2;i++){const p0=P2[i-1],p1=P2[i],p2=P2[i+1],p3=P2[i+2];const L=Math.hypot(p2[0]-p1[0],p2[1]-p1[1]);const n=Math.max(2,Math.ceil(L/step));for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;out.push([0.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),0.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]);}}out.push(pts[pts.length-1].slice());return out;}
/* corner-cutting keeps curves inside their waypoints, so a path never loops out over water */
function chaikin(pts,n){let p=pts;for(let k=0;k<n;k++){if(p.length<3)return p;const q=[p[0]];for(let i=0;i<p.length-1;i++){const[a,b]=p[i],[c,d]=p[i+1];q.push([a*0.75+c*0.25,b*0.75+d*0.25],[a*0.25+c*0.75,b*0.25+d*0.75]);}q.push(p[p.length-1]);p=q;}return p;}
function dense(pts,step){const out=[];for(let i=1;i<pts.length;i++){const[a,b]=pts[i-1],[c,d]=pts[i];const L=Math.hypot(c-a,d-b);const n=Math.max(1,Math.ceil(L/step));for(let k=0;k<n;k++)out.push([a+(c-a)*k/n,b+(d-b)*k/n]);}out.push(pts[pts.length-1].slice());return out;}
function build(w){
  const [WW,WH]=w.size;w.WW=WW;w.WH=WH;
  w.rd=(X,Y)=>{let b=1e9;for(const r of (w.rivers||[]))b=Math.min(b,polyDist(r.pts,X,Y)-r.w);return b;};
  const land=(X,Y)=>{
    if(w.mode==='islands'){let v=0;for(const[a,b,r]of w.blobs){const d=((X-a)**2+((Y-b)*1.25)**2)/(r*r);if(d<1)v+=(1-d)**2;}if(v<=0.32)return false;}
    for(const r of (w.rivers||[]))if(polyDist(r.pts,X,Y)+Math.sin(X/23+Y/31)*2<=r.w)return false;
    for(const[a,b,rx,ry]of (w.lakes||[]))if(((X-a)/rx)**2+((Y-b)/ry)**2<1)return false;
    return true;};
  const mask=new Uint8Array(WW*WH);for(let Y=0;Y<WH;Y++)for(let X=0;X<WW;X++)mask[Y*WW+X]=land(X,Y)?1:0;
  const edgeLand=w.mode!=='islands';
  w.M=(X,Y)=>{X=Math.round(X);Y=Math.round(Y);if(X<0||X>=WW||Y<0||Y>=WH)return edgeLand;return mask[Y*WW+X]===1;};
  const M=w.M;
  w.zone=(X,Y)=>{for(const z of (w.zones||[])){if(z.f&&z.f(X,Y,w))return z.k;if(z.e&&((X-z.e[0])/z.e[2])**2+((Y-z.e[1])/z.e[3])**2<1)return z.k;if(z.r&&X>=z.r[0]&&X<z.r[0]+z.r[2]&&Y>=z.r[1]&&Y<z.r[1]+z.r[3])return z.k;}return w.ground;};
  /* the route: smooth curves through each stop's waypoints (sharp zigzags in the Glitch) */
  /* the trail network: every piece of trail is drawn once; side branches hang off it */
  const ptOf=k=>typeof k==='number'?w.stops[k].at:w.J[k];
  /* entryPath / exitPath join this world to its neighbours at the map edge */
  w.J=w.J||{};const xtra=[];if(w.exitPath){w.J.__OUT=w.exitPath.to;xtra.push([w.stops.length-1,'__OUT',w.exitPath.via||[],w.exitPath]);}if(w.entryPath){w.J.__IN=w.entryPath.from;xtra.push(['__IN',0,w.entryPath.via||[],w.entryPath]);}
  w.E=(w.edges||w.stops.slice(1).map((st,i)=>[i,i+1,st.via||[],st.road?{road:1}:0])).concat(xtra).map(([a,b,via,o])=>{const raw=[ptOf(a),...(via||[]),ptOf(b)];const geo=(w.sharp||(o&&o.road))?dense(raw,3):dense(chaikin(raw,4),3);return {a,b,geo,len:segLen(geo),road:!!(o&&o.road),style:(o&&o.style)||null};});
  const key=k=>(typeof k==='number'?'s':'j')+k;
  const route=(from,to)=>{const dist={},prev={},done={},nodes=new Set();w.E.forEach(e=>{nodes.add(key(e.a));nodes.add(key(e.b));});dist[key(from)]=0;
    for(;;){let u=null,ud=1e18;for(const n of nodes)if(!done[n]&&dist[n]!==undefined&&dist[n]<ud){ud=dist[n];u=n;}if(u===null||u===key(to))break;done[u]=1;
      w.E.forEach((e,ei)=>{const ka=key(e.a),kb=key(e.b);const v=ka===u?kb:kb===u?ka:null;if(v===null||done[v])return;const nd=ud+e.len;if(dist[v]===undefined||nd<dist[v]){dist[v]=nd;prev[v]=[u,ei];}});}
    const chain=[];let cur=key(to);while(cur!==key(from)&&prev[cur]){chain.unshift([prev[cur][0],prev[cur][1]]);cur=prev[cur][0];}
    let pts=[];const used=[];chain.forEach(([u,ei])=>{const e=w.E[ei];const g=key(e.a)===u?e.geo:e.geo.slice().reverse();pts=pts.concat(pts.length?g.slice(1):g);used.push(ei);});return {pts,used};};
  w.route=route;   /* the game walks stop to stop through the network (a locked secret spur is skipped, not walked) */
  w.SEGS=[];w.used=[];for(let i=1;i<w.stops.length;i++){const r=route(i-1,i);w.SEGS.push(r.pts.length>1?r.pts:[w.stops[i-1].at,w.stops[i].at]);w.used.push(r.used);}
  if(w.exitPath)w.outGeo=route(w.stops.length-1,'__OUT').pts;if(w.entryPath)w.inGeo=route('__IN',0).pts;
  const base=document.createElement('canvas');base.width=WW;base.height=WH;const g=base.getContext('2d');G=g;
  const img=g.createImageData(WW,WH),D=img.data;const cache={};const hex=h=>cache[h]||(cache[h]=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
  const wat=WATER[w.water],cl=CLIFFS[w.cliff];
  for(let Y=0;Y<WH;Y++)for(let X=0;X<WW;X++){let c;
    if(M(X,Y)){const z=w.zone(X,Y);c=GROUND[z](X,Y);
      if(!M(X,Y-2)||!M(X-2,Y)||!M(X+2,Y))c=RIM[z];
      if(!M(X-1,Y)||!M(X+1,Y)||!M(X,Y-1)||!M(X,Y+1))c=LINE[z];}
    else{let d=0;for(let k=1;k<=CLIFF;k++)if(M(X,Y-k)){d=k;break;}
      if(d){const i=d<=2?0:d<=4?1:d<=7?2:d<=10?3:4;c=cl[i];if(w.cliff==='brick'){c=cl[Math.floor(d/3)%4];if(X%8===0)c='#1b1220';}if(d===5&&((X>>1)&1)&&w.cliff==='dirt')c='#b8894e';}
      else{c=wat.a;if(M(X,Y-CLIFF-1)||M(X,Y-CLIFF-2))c=wat.edge;if(M(X,Y+1)||M(X,Y+2)||M(X,Y+3))c=wat.foam;
        if((w.water==='space'||w.water==='void')&&hash(X,Y)>.996)c=w.water==='void'?'#3a1a70':'#ffffff';}}
    const v=hex(c),o=(Y*WW+X)*4;D[o]=v[0];D[o+1]=v[1];D[o+2]=v[2];D[o+3]=255;}
  g.putImageData(img,0,0);
  /* roads */
  for(const r of (w.roads||[])){const pts=dense(r,1);for(const[X,Y]of pts)if(M(X,Y))px('#4a4e58',X-5,Y-5,11,11);for(const[X,Y]of pts)if(M(X,Y))px('#7a7e88',X-4,Y-4,9,9);pts.forEach(([X,Y],i)=>{if(M(X,Y)&&i%12<6)px('#f6e7a6',X,Y,1,1);});}
  w.bridgeBoxes=[];for(const[bx,by,kind,dir]of (w.bridges||[]))drawBridge(w,bx,by,kind,dir);
  drawPath(w,g);G=g;
  /* scatter, kept clear of the path, the stops and the landmarks */
  const keep=[];w.E.forEach(e=>e.geo.forEach((q,i)=>{if(i%2===0)keep.push([q[0],q[1],15]);}));w.stops.forEach(s=>keep.push([s.at[0],s.at[1],30]));
  (w.props||[]).forEach(p=>keep.push([p[1]+(p[0]==='home'?10:20),p[2]-12,p[0]==='home'?20:46]));(w.roads||[]).forEach(r=>dense(r,6).forEach(([a,b])=>keep.push([a,b,11])));
  if(w.exit)keep.push([w.exit[0],w.exit[1],34]);
  const items=[];
  (w.scatter||[]).forEach((s,si)=>{let placed=0;for(let i=0;i<s.n*12&&placed<s.n;i++){const X=Math.round(hash(i,si*31+w.n*7)*WW),Y=Math.round(hash(i+999,si*17+w.n*13)*WH);
    if(!M(X,Y)||!M(X,Y-6)||!M(X-6,Y)||!M(X+6,Y)||!M(X,Y+4))continue;if(w.zone(X,Y)!==s.zone)continue;if(keep.some(([a,b,r])=>(a-X)**2+(b-Y)**2<r*r))continue;if(items.some(([,a,b])=>(a-X)**2+(b-Y)**2<70))continue;items.push([s.k,X,Y]);placed++;}});
  const all=[...items,...(w.props||[]),...(w.overProps||[])].sort((a,b)=>a[2]-b[2]);
  LBL=[];TXT=[];
  for(const p of all){if(!P[p[0]])throw new Error('World '+w.n+': unknown prop '+p[0]);P[p[0]](...p.slice(1));}
  w.labels=LBL;LBL=null;w.texts=TXT;TXT=null;
  /* tall landmarks Kinan can walk behind: each gets its own layer, drawn over him when he is above its base line */
  w.overs=(w.overProps||[]).map(p=>{const c=document.createElement('canvas');c.width=WW;c.height=WH;const G0=G;G=c.getContext('2d');LBL=[];TXT=[];P[p[0]](...p.slice(1));LBL=null;TXT=null;G=G0;return overBox(w,c,p[2]);});
  G=x;w.base=base;}
function onBridge(w,X,Y){return (w.bridgeBoxes||[]).some(([a,b,c,d])=>X>=a&&X<=c&&Y>=b&&Y<=d);}
function drawPath(w,g){G=g;g.lineJoin='round';g.lineCap='round';
  const stroke=(pts,c,wd,dash)=>{if(pts.length<2)return;g.strokeStyle=c;g.lineWidth=wd;g.setLineDash(dash||[]);g.beginPath();pts.forEach(([a,b],i)=>i?g.lineTo(a,b):g.moveTo(a,b));g.stroke();g.setLineDash([]);};
  /* Shad: one solid trail per world. tan = the warm yellow trail of the real cities */
  const PS={tan:['#7a5420','#f0cf6a','#fff0b0'],gravel:['#4a3a2a','#b8ac94','#d8cfba'],sand:['#8a6420','#f4dca8','#fff1c8'],brick:['#1b1220','#f6c445','#ffe58a'],metal:['#2b2f45','#c9d0dc','#ffffff'],snow:['#6b7090','#eef2fa','#ffffff']};
  const onRoad=(X,Y)=>(w.roads||[]).some(r=>polyDist(r,X,Y)<9);
  w.E.forEach(e=>{if(e.road)return; /* on a road, the road IS the path */
    const style=e.style||w.path||'tan';const floating=style==='neon'||style==='glass'||style==='rainbow';
    const runs=[];let run=[];for(const q of e.geo){const show=floating||!(onRoad(q[0],q[1])||onBridge(w,q[0],q[1])||!w.M(q[0],q[1]));if(show)run.push(q);else{if(run.length>1)runs.push(run);run=[];}}if(run.length>1)runs.push(run);
    for(const r of runs){if(!floating&&segLen(r)<16)continue;
      if(style==='rainbow'){['#9b2d6b','#2a5bd7','#44c55a','#f6c445','#ff8a3d','#e8364b'].forEach((c,i)=>stroke(r,c,12-i*2));}
      else if(style==='neon'){stroke(r,'#3a1070',9);stroke(r,'#ff3df0',6,[22,5]);stroke(r,'#00ffd0',3,[14,9,4,6]);}
      else if(style==='glass'){stroke(r,'rgba(120,220,255,.28)',14);stroke(r,'rgba(190,240,255,.55)',8);stroke(r,'rgba(255,255,255,.9)',2);stroke(r,'rgba(255,255,255,.7)',1,[2,7]);}
      else{const c=PS[style]||PS.tan;stroke(r,c[0],9);stroke(r,c[1],7);stroke(r,c[2],2);}}});
  G=x;}
function drawBridge(w,bx,by,kind,dir){const M=w.M;let t,b;
  if(dir==='h'){let Y=by;let l=-1,r=-1;for(let X=0;X<w.WW;X++){if(!M(X,Y)&&l<0)l=X-2;if(l>=0&&!M(X,Y))r=X+2;}t=l;b=r;}
  else{let y0=by;if(M(bx,y0)){let k=0;while(k<80&&M(bx,y0+k)&&M(bx,y0-k))k++;y0=!M(bx,y0+k)?y0+k:y0-k;}let u=y0,d=y0;while(u>0&&!M(bx,u))u--;while(d<w.WH-1&&!M(bx,d))d++;t=u-1;b=d+2;}
  const L=b-t;const S={traffic:['#8a96a8','#6b7688','#4a5568'],arches:['#e2dccc','#c8c0ae','#9a9282'],rail:['#4a4f57','#6b3f18','#2b2f45'],beam:['#c9c4b8','#a8a296','#6b6f7a'],hlb:['#4a4048','#2e262c','#1b1220'],walterdale:['#d8d2c4','#bdb6a6','#ffffff'],
    peace:['#e8364b','#ff8a9a','#7d1f33'],suspension:['#7a8a7a','#5e6e5e','#2f7d5a'],wood:['#a8692e','#6f4a26','#5e3b20'],brick:['#f6c445','#e8364b','#2a5bd7'],metal:['#9aa3b2','#6f7889','#2b2f45']}[kind];
  const R=(c,u,v,lu,lv)=>{if(dir==='h')px(c,t+u,by+v,lu,lv);else px(c,bx+v,t+u,lv,lu);};
  R('#1b1220',0,-9,L,18);R(S[0],0,-8,L,16);for(let u=0;u<L;u+=4)R(S[1],u,-8,1,16);R(S[2],0,-10,L,2);R(S[2],0,8,L,2);
  if(kind==='truss'||kind==='traffic'||kind==='hlb'){for(let u=0;u<L;u+=6){R('#1b1220',u,-13,2,5);R('#1b1220',u,8,2,5);R(kind==='hlb'?'#6b5a64':'#cfd6e2',u+3,-12,1,3);R(kind==='hlb'?'#6b5a64':'#cfd6e2',u+3,9,1,3);}}
  if(kind==='arches'){for(let u=0;u<L;u+=12){for(let k=0;k<12;k++){const o=Math.round(Math.sin(k/12*Math.PI)*3);R('#f4f1e8',u+k,-11-o,1,2);R('#f4f1e8',u+k,9+o,1,2);}}}
  if(kind==='walterdale'){for(let k=0;k<L;k++){const o=Math.round(Math.sin(k/L*Math.PI)*8);R('#ffffff',k,-12-o,1,2);R('#ffffff',k,10+o,1,2);if(k%6===0){R('#cfd6e2',k,-11-o,1,o+1);R('#cfd6e2',k,10,1,o+1);}}}
  if(kind==='suspension'){[Math.round(L*0.25),Math.round(L*0.75)].forEach(u=>{R('#1b1220',u-2,-13,5,26);R(S[2],u-1,-12,3,24);});for(let u=0;u<L;u+=3)R('#cfd6e2',u,-12+Math.round(Math.abs(Math.sin(u/L*Math.PI*2))*2),1,1);}
  if(kind==='peace'){for(let u=0;u<L;u+=5){R('#ffffff',u,-8,1,16);R(S[0],u+2,-11,2,22);}}
  if(kind==='brick'){for(let u=2;u<L;u+=8){R('rgba(255,255,255,.55)',u,-10,4,1);}}
  if(dir==='h')w.bridgeBoxes.push([t,by-10,b,by+10]);else w.bridgeBoxes.push([bx-10,t,bx+10,b]);}
function segLen(p){let l=0;for(let i=1;i<p.length;i++)l+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);return l;}
function along(p,d){for(let i=1;i<p.length;i++){const l=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);if(d<=l){const t=l?d/l:0;return[p[i-1][0]+(p[i][0]-p[i-1][0])*t,p[i-1][1]+(p[i][1]-p[i-1][1])*t];}d-=l;}return p[p.length-1].slice();}

/* ================= PLAYING ================= */
const NODE={red:['#e8364b','#ff8a9a'],open:['#f6c445','#fff3c4'],lock:['#7d86a8','#c9cfe6'],shop:['#ff6fae','#ffd1e6'],boss:['#e8364b','#ffd1e6'],fort:['#9aa3b2','#dfe5ee'],secret:['#7a2fd0','#e6c8ff']};
/* the kind a world file gave a stop (its st): level | fort | secret | boss | shop | travel */
const kindOf=s=>s.kind||(s.st==='open'||s.st==='lock'||s.st==='red'?'level':s.st);
/* a little traffic cone beside a stop whose level is still being built ("Coming soon") */
function cone(X,Y){px('#1b1220',X-4,Y,9,2);px('#1b1220',X-3,Y-8,7,8);px('#ff8a3d',X-2,Y-7,5,7);px('#ffffff',X-2,Y-4,5,1);px('#ff8a3d',X-3,Y-1,7,1);px('#ffd9b0',X-1,Y-7,1,2);}
/* a stop drawn by its state: locked = faded, open = yellow with a pulse ring, beaten = red; forts and castles fly a
   flag in the same colours (yellow open, red cleared); a secret's star only shines once a secret exit has opened it */
function node(s,t){const k=kindOf(s);if(k==='travel')return;const[X,Y]=s.at;const st=s.state||(k==='level'?(s.st==='lock'?'locked':s.st==='red'?'beaten':'open'):'open');
  const lock=st==='locked',done=st==='beaten',flag=lock?'#7d86a8':done?'#e8364b':'#f6c445';
  G.save();if(lock)G.globalAlpha=k==='secret'?0.35:0.6;
  if(k==='fort'){G.fillStyle='rgba(0,0,0,.35)';G.beginPath();G.ellipse(X,Y+6,10,3,0,0,Math.PI*2);G.fill();box('#9aa3b2',X-7,Y-9,14,14);px('#dfe5ee',X-7,Y-9,14,2);[-7,-2,3].forEach(o=>box('#9aa3b2',X+o,Y-13,4,4));box('#2b2f45',X-2,Y-1,4,6);px('#1b1220',X+6,Y-22,1,10);px('#1b1220',X+6,Y-23,8,6);px(flag,X+7,Y-22,6,4);}
  else if(k==='secret'){const R=8,r2=3.5;G.fillStyle='rgba(0,0,0,.35)';G.beginPath();G.ellipse(X,Y+6,8,3,0,0,Math.PI*2);G.fill();G.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r2:R;G.lineTo(X+Math.cos(a)*rr,Y+Math.sin(a)*rr);}G.closePath();G.fillStyle='#1b1220';G.lineWidth=3;G.strokeStyle='#1b1220';G.stroke();G.fillStyle=lock?'#7d86a8':done?'#e8364b':Math.sin(t/250)>0?'#f6c445':'#ffe58a';G.fill();}
  else{const[c,hl]=NODE[k==='boss'?'boss':k==='shop'?'shop':lock?'lock':done?'red':'open'];const r=k==='boss'?8:6;
    G.fillStyle='rgba(0,0,0,.35)';G.beginPath();G.ellipse(X,Y+5,r+2,3,0,0,Math.PI*2);G.fill();
    G.fillStyle='#1b1220';G.beginPath();G.arc(X,Y,r+1.5,0,Math.PI*2);G.fill();G.fillStyle=k==='boss'?(lock?'#9aa3b2':'#f6c445'):c;G.beginPath();G.arc(X,Y,r,0,Math.PI*2);G.fill();
    if(k==='boss'){G.fillStyle=lock?'#7d86a8':c;G.beginPath();G.arc(X,Y,r-2.5,0,Math.PI*2);G.fill();px('#1b1220',X+7,Y-20,1,14);px('#1b1220',X+7,Y-21,9,7);px(flag,X+8,Y-20,7,5);}
    G.fillStyle=hl;G.fillRect(Math.round(X-r/2),Math.round(Y-r/2),2,2);}
  G.restore();
  if(st==='open'&&s.built!==false&&k!=='shop'){const q=(t/80)%10;G.strokeStyle='rgba(246,196,69,'+(1-q/10)+')';G.lineWidth=1;G.beginPath();G.ellipse(X,Y,8+q,(8+q)*0.7,0,0,Math.PI*2);G.stroke();}
  if(s.built===false&&!lock&&k!=='shop')cone(X+9,Y+4);}
let wi=0,at=0,walk=null,face=1,camX=0,camY=0,banner=null,fade=0,cross=null,notice=null,busy=false,mounted=false,raf=0,root=null,scr=null,ro=null,opts={},celebrate=null,speed=1;
const cur=()=>W[wi];
const idxOf=n=>W.findIndex(v=>v.n===n);
function ensure(w){if(!w.base)build(w);}
function pos(){const w=cur();if(cross)return along(cross.pts,Math.min(cross.d,cross.len));if(!walk)return w.stops[at].at;return along(walk.pts,walk.d);}
function snapCam(){const w=cur(),p=w.stops[at].at;camX=Math.max(0,Math.min(w.WW-VW,p[0]-VW/2));camY=Math.max(0,Math.min(w.WH-VH,p[1]-VH*0.55));}
/* ---- progress (the game decides; see opts.annotate) ---- */
function refresh(){W.forEach(w=>w.stops.forEach(s=>{s.kind=kindOf(s);}));if(opts.annotate)opts.annotate(W);}
/* a secret spur that is still locked (or has no level yet) is walked past, never onto */
const skip=s=>s.kind==='secret'&&(s.state==='locked'||s.built===false);
const worldDone=w=>!!(w.travel||w.done);
function arrived(){const w=cur();if(!w.travel&&opts.onMove)opts.onMove(w.n,at);}
function hint(txt){notice={t:0,txt,dur:1600};}
const label=s=>s.kind==='fort'?'THE FORT':s.kind==='boss'?'THE CASTLE':s.kind==='secret'?'THE SECRET LEVEL':s.name.split('  ')[0];
/* ---- World 12: the 3D map, loaded on demand ---- */
function need3D(){return window.KINAN3D?Promise.resolve():(opts.need3D?opts.need3D():Promise.reject(new Error('no 3D loader')));}
function k3opts(w12,stop){return {at:stop||0,
  back:()=>goWorld(idxOf(11),'last'),
  candles:()=>opts.candles?opts.candles():0,
  skip:k=>!!(w12.stops[k]&&skip(w12.stops[k])),
  canWalk:k=>!!(w12.stops[k]&&w12.stops[k].state!=='locked'),
  onMove:k=>{if(opts.onMove)opts.onMove(12,k);},
  onPlay:k=>{const s=w12.stops[k];if(!s)return null;
    if(s.state==='locked')return {banner:'LOCKED  -  BEAT THE YELLOW DOT FIRST',ok:false};
    if(s.built===false)return {banner:'COMING SOON!',sub:'This level is still being built. Walk on past it!',ok:false};
    return {banner:"LET'S GO!  "+s.name.split('  -  ')[0],ok:true,go:()=>{if(opts.onPlay)opts.onPlay(12,k,s);}};},
  stops:()=>w12.stops.map(s=>({kind:s.kind,state:s.state,built:s.built!==false}))};}
function goWorld(i,stop){wi=i;ensure(cur());const w=cur();at=stop==='last'?w.stops.length-1:Math.max(0,Math.min(w.stops.length-1,stop||0));walk=null;cross=null;snapCam();fade=1;
  const k3=window.KINAN3D;
  if(w.n===12){
    if(!k3){busy=true;need3D().then(()=>{busy=false;if(mounted&&cur()===w)goWorld(i,stop);}).catch(e=>{busy=false;console.warn('[map] the 3D world could not load',e);hint('THE 3D WORLD COULD NOT LOAD');});return;}
    cv.classList.remove('three');cv.style.visibility='hidden';k3.mount(scr,w,k3opts(w,at));}
  else{if(k3&&k3.active)k3.unmount();cv.style.visibility='';cv.classList.toggle('three',w.n===12);}
  arrived();}
/* a world the game has not released yet (the game marks it soon in opts.annotate): the next real world after this one
   stays behind a "COMING SOON" sign at this world's way out, Glitchy waving beside it (Shad, 2026-10-28) */
function gateAhead(){const w=cur();if(!w||w.travel)return null;for(let j=wi+1;j<W.length;j++){if(W[j].travel)continue;return W[j].soon?W[j]:null;}return null;}
function drawGate(w,t,wave){if(w.travel||!w.outGeo||w!==cur())return;const g=gateAhead();if(!g)return;
  const o=w.outGeo,L=segLen(o),p=along(o,Math.max(0,Math.min(L-30,64)));   /* on the road out, a few steps from the castle, where Kinan sees it */const X=Math.round(Math.max(40,Math.min(w.WW-40,p[0]))),Y=Math.round(Math.max(36,Math.min(w.WH-8,p[1])));
  shadow(X,Y+2,22,4);for(const dx of[-16,10]){px('#1b1220',dx+X,Y-9,7,9);px('#ff8a3d',dx+X+1,Y-8,5,8);px('#ffffff',dx+X+1,Y-5,5,1);}
  px('#1b1220',X-20,Y-10,40,4);for(let k=0;k<5;k++)px(k%2?'#ffffff':'#e8364b',X-19+k*8,Y-9,8,2);
  px('#1b1220',X-1,Y-34,3,24);const s1='WORLD '+g.n,s2='COMING SOON!',bw=Math.max(bfWidth(s1,7),bfWidth(s2,7))+12;
  px('#1b1220',X-bw/2-1,Y-51,bw+2,20);px('#f6c445',X-bw/2,Y-50,bw,18);px('#fff3c4',X-bw/2,Y-50,bw,1);
  txt(s1,X-bfWidth(s1,7)/2,Y-47,'#1b1220',7,1);txt(s2,X-bfWidth(s2,7)/2,Y-40,'#7d1f33',7,1);
  if(!wave)return;const gx=X+30,gy=Y-2+Math.round(Math.sin(t/260)*2);glitchySpr(gx,gy,t,1);
  const up=Math.floor(t/220)%2;G.save();G.translate(gx,gy);G.scale(1.3,1.3);px('#7a2fd0',-11,up?-14:-11,3,up?6:3);px('#1b1220',-11,up?-15:-12,3,1);G.restore();}
function edgeSide(w,p){return p[0]<=1?'left':p[0]>=w.WW-1?'right':p[1]<=1?'top':'bottom';}
/* walk off this world's edge into the next one (or back); A = the world that exits, B = the one entered */
function startCross(dir){const w=cur(),j=wi+dir,o=W[j];ensure(o);
  const A=dir>0?w:o,B=dir>0?o:w,ex=A.exitPath.to,en=B.entryPath.from,side=edgeSide(A,ex);
  const off=side==='right'?[A.WW,ex[1]-en[1]]:side==='left'?[-B.WW,ex[1]-en[1]]:side==='bottom'?[ex[0]-en[0],A.WH]:[ex[0]-en[0],-B.WH];
  let pts,offO;
  if(dir>0){offO=off;pts=A.outGeo.concat(B.inGeo.map(([a,b])=>[a+off[0],b+off[1]]));}
  else{offO=[-off[0],-off[1]];pts=B.inGeo.slice().reverse().concat(A.outGeo.slice().reverse().map(([a,b])=>[a+offO[0],b+offO[1]]));}
  cross={dir,other:j,off:offO,pts,d:0,len:segLen(pts),ride:A.exitPath.ride||null};}
function canCross(dir,from){const c=from==null?wi:from,j=c+dir,o=W[j];if(!o)return false;const A=dir>0?W[c]:o,B=dir>0?o:W[c];return !!(A.exitPath&&B.entryPath&&A.n<10);}
function go(dir){if(!mounted||busy)return;if(window.KINAN3D&&KINAN3D.active){KINAN3D.go(dir);return;}
  if(walk||banner||cross)return;const w=cur();let ni=at+dir;
  while(ni>=0&&ni<w.stops.length&&skip(w.stops[ni]))ni+=dir;
  if(ni>=w.stops.length){
    if(!worldDone(w)){hint('BEAT THE CASTLE TO OPEN THE WAY ON');return;}
    const g=gateAhead();if(g){banner={t:0,txt:'WORLD '+g.n+' COMING SOON!',sub:'Glitchy is waiting there. Its levels are on the way!',ok:false,soon:true,dur:2600};return;}
    if(canCross(1)){startCross(1);return;}
    if(w.n===10){banner={t:0,txt:'WAIT... DID THE WORLD JUST GLITCH?',ok:true,glitch:true,then:()=>goWorld(wi+1,0)};return;}
    if(w.n===11){const j=idxOf(12);if(j<0)return;busy=true;
      need3D().then(()=>{busy=false;if(!mounted||cur()!==w)return;const w12=W[j];ensure(w12);
        KINAN3D.transitionFrom2D(cv,w12,Object.assign(k3opts(w12,0),{done:()=>{wi=j;at=0;if(opts.onMove)opts.onMove(12,0);}}));})
        .catch(e=>{busy=false;console.warn('[map] the 3D world could not load',e);hint('THE 3D WORLD COULD NOT LOAD');});return;}
    return;}
  if(ni<0){if(canCross(-1)){startCross(-1);return;}if(wi>0)goWorld(wi-1,'last');return;}
  const s=w.stops[ni];
  if(dir>0&&s.state==='locked'){hint('BEAT '+label(w.stops[at])+' TO OPEN THE PATH');return;}
  const r=w.route(at,ni),pts=r.pts.length>1?r.pts:[w.stops[at].at,s.at];
  walk={pts,d:0,len:segLen(pts),dir,from:at,to:ni};}
function play(){if(!mounted||busy)return;if(window.KINAN3D&&KINAN3D.active){KINAN3D.play();return;}if(walk||banner||cross)return;
  const w=cur(),s=w.stops[at];if(!s||s.kind==='travel')return;
  if(s.state==='locked'){banner={t:0,txt:'LOCKED  -  BEAT THE YELLOW DOT FIRST',ok:false,dur:1400};return;}
  if(s.built===false){banner={t:0,txt:'COMING SOON!',sub:'This level is still being built. Walk on past it!',ok:false,soon:true,dur:2200};return;}
  const i=at;banner={t:0,txt:"LET'S GO!  "+s.name.split('  -  ')[0],ok:true,dur:800,then:()=>{if(mounted&&opts.onPlay)opts.onPlay(w.n,i,s);}};}
/* ---- CUTSCENES (index.html block "CUTSCENES"): Glitchy runs across the map and the camera follows him ----
   fly(kind,o) plays one; the map is busy (no walking, no PLAY) until it ends, then Kinan stands where he was.
   'intro'  (the opening cutscene): from Kinan's stop 0 Glitchy hops stop to stop through the world, past the castle
            and off the map edge, then the camera glides back to Kinan.
   'escape' (after a castle win): Glitchy pops out at the castle, runs off the edge into the next world (through a
            road trip if one is in between; the camera follows him over the seam), hops through that world's first
            stops and vanishes on the way to its castle; then a quick fade back to Kinan at the castle.
   o.onEvent(name,{world}) fires at 'start', 'castle' (intro: past the castle), 'seam' (escape: into the next world),
   'gone' (out of sight); o.onDone(skipped) once, unless the map is unmounted first. A secret spur is never hopped. */
let fly=null;
function flyStops(w,from,to){const ids=[];for(let i=from;i<=to;i++){if(i!==from&&i!==to&&kindOf(w.stops[i])==='secret')continue;ids.push(i);}
  let pts=[];const marks=[0];
  for(let k=1;k<ids.length;k++){const r=w.route(ids[k-1],ids[k]);const seg=r.pts.length>1?r.pts:[w.stops[ids[k-1]].at,w.stops[ids[k]].at];pts=pts.concat(pts.length?seg.slice(1):seg);marks.push(segLen(pts));}
  if(pts.length<2)pts=[w.stops[from].at,w.stops[from].at];return {pts,marks};}
/* bounce marks every ~step px for a stretch with no stops in it (an exit road, a seam) */
function evenMarks(len,step){const n=Math.max(1,Math.round(len/step)),m=[];for(let i=0;i<=n;i++)m.push(len*i/n);return m;}
/* a leg: the world drawn (wi), maybe the next world beside it (other {wi,off}), the path, where each bounce lands */
function legOf(wi,pts,marks,extra){const len=Math.max(1,segLen(pts));return Object.assign({wi,pts,len,marks:marks||evenMarks(len,64)},extra||{});}
function crossLeg(i){const A=W[i],B=W[i+1];ensure(B);const ex=A.exitPath.to,en=B.entryPath.from,side=edgeSide(A,ex);
  const off=side==='right'?[A.WW,ex[1]-en[1]]:side==='left'?[-B.WW,ex[1]-en[1]]:side==='bottom'?[ex[0]-en[0],A.WH]:[ex[0]-en[0],-B.WH];
  return legOf(i,A.outGeo.concat(B.inGeo.map(([a,b])=>[a+off[0],b+off[1]])),null,{other:{wi:i+1,off},road:true});}
function flyLegs(kind,hi,at){const w=W[hi];ensure(w);const legs=[];
  if(kind==='intro'){
    const last=w.stops.length-1,tr=flyStops(w,at,last);legs.push(legOf(hi,tr.pts,tr.marks,{ev:'start'}));
    if(w.outGeo&&w.outGeo.length>1){const o=w.outGeo,a=o[o.length-2],b=o[o.length-1],d=Math.hypot(b[0]-a[0],b[1]-a[1])||1;
      legs.push(legOf(hi,o.concat([[b[0]+(b[0]-a[0])/d*90,b[1]+(b[1]-a[1])/d*90]]),null,{ev:'castle'}));}
    return legs;}
  /* escape: off the edge, over the seam (and through a road trip), into the next real world */
  let i=hi;
  for(let g=0;g<3;g++){const B=W[i+1];if(!B||B.n===12)return null;ensure(B);
    if(canCross(1,i)){legs.push(crossLeg(i));i++;
      if(B.travel){const tr=flyStops(B,0,B.stops.length-1);legs.push(legOf(i,tr.pts,tr.marks,{road:true}));continue;}break;}
    /* no road over this seam (World 10 glitches into 11): run off the edge, then a quick cut */
    const A=W[i],p0=A.stops[A.stops.length-1].at,out=A.outGeo&&A.outGeo.length>1?A.outGeo:[p0,[A.WW+40,p0[1]]];
    legs.push(legOf(i,out,null,{ev:g===0?'start':null,cut:true}));i++;break;}
  const B=W[i];if(!B||B.travel||B.n===12)return null;
  const reg=[];B.stops.forEach((s,k)=>{if(kindOf(s)!=='secret'&&kindOf(s)!=='travel')reg.push(k);});
  const k3=reg[Math.min(3,reg.length-2)]||0,tr=flyStops(B,0,k3);legs.push(legOf(i,tr.pts,tr.marks,{ev:'seam'}));
  const cas=B.stops[B.stops.length-1].at,p=B.stops[k3].at;legs.push(legOf(i,[p,cas],null,{fade:true}));
  return legs;}
function fly1(kind,o){if(!mounted||fly||walk||cross||(window.KINAN3D&&KINAN3D.active))return false;o=o||{};
  const legs=flyLegs(kind,wi,at);if(!legs||!legs.length)return false;
  const total=legs.reduce((s,l)=>s+l.len,0),ms=kind==='intro'?13000:10000;
  banner=null;busy=true;
  fly={kind,legs,li:0,d:0,v:Math.max(0.06,Math.min(0.4,total/ms)),phase:'appear',t:0,a:1,home:{wi,at},o,trail:[],sent:{}};
  return true;}
function flyEv(name){const f=fly;if(!f||f.sent[name])return;f.sent[name]=1;try{if(f.o.onEvent)f.o.onEvent(name,{world:W[f.legs[f.li].wi].n});}catch(e){console.error('[map]',e);}}
function flyEnd(skipped){const f=fly;if(!f)return;fly=null;busy=false;wi=f.home.wi;at=f.home.at;walk=null;cross=null;banner=null;
  if(skipped||f.kind==='escape'){snapCam();fade=skipped?0.5:1;}
  try{if(f.o.onDone)f.o.onDone(!!skipped);}catch(e){console.error('[map]',e);}}
function flyPos(){const f=fly,L=f.legs[f.li],d=Math.min(f.d,L.len),p=along(L.pts,d);let h=0;
  for(let k=1;k<L.marks.length;k++)if(d<=L.marks[k]){const m0=L.marks[k-1],m1=L.marks[k],s=m1-m0;if(s>0.5)h=Math.sin(Math.PI*(d-m0)/s)*Math.max(6,Math.min(24,s*0.2));break;}
  return [p[0],p[1],h];}
/* Glitchy, the same pixel creature as World 11's map: purple, a magenta top, a cyan band, one big eye, three antennae */
function glitchySpr(X,Y,t,a){const j=Math.floor(t/90)%7===0?2:0,x0=-7+j,y0=-13;G.save();G.globalAlpha=a;G.translate(Math.round(X),Math.round(Y));G.scale(1.3,1.3);   /* Kinan's map size */
  
  px('#1b1220',x0-1,y0-1,16,14);px('#7a2fd0',x0,y0,14,12);px('#ff3df0',x0,y0,14,2);px('#00ffd0',x0+(j?2:0),y0+9,14,2);
  px('#ffffff',x0+4,y0+3,6,5);px('#1b1220',x0+6+(j?1:0),y0+4,2,2);px('#1b1220',x0+4,y0+8,6,1);
  px('#7a2fd0',x0-3,y0+4,3,2);px('#7a2fd0',x0+14,y0+4,3,2);[[2,-3],[6,-4],[10,-3]].forEach(([u,v])=>px('#00ffd0',x0+u,y0+v,1,3));
  if(Math.floor(t/140)%9===0){px('rgba(255,61,240,.7)',x0-4,y0+5,22,1);px('rgba(0,255,208,.7)',x0+2,y0+2,16,1);}G.restore();}
function drawFly(t,dt){const f=fly;dt=Math.min(100,dt)*speed;f.t+=dt;
  if(f.phase==='appear'&&f.t>(f.kind==='escape'?900:500)){f.phase='run';f.t=0;flyEv('start');if(f.legs[0].ev&&f.legs[0].ev!=='start')flyEv(f.legs[0].ev);}
  if(f.phase==='run'){f.d+=dt*f.v;let L=f.legs[f.li];
    while(f.d>=L.len){if(f.li>=f.legs.length-1){f.d=L.len;f.phase='gone';f.t=0;flyEv('gone');break;}
      f.d-=L.len;if(L.other){camX-=L.other.off[0];camY-=L.other.off[1];}f.li++;const N=f.legs[f.li];
      if(L.cut){fade=1;const q=N.pts[0];camX=q[0]-VW/2;camY=q[1]-VH*0.55;}
      if(N.ev)flyEv(N.ev);L=N;}}
  if(f.phase==='gone'&&f.t>600){if(f.kind==='escape'){f.phase='fadeout';f.t=0;}else{f.phase='back';f.t=0;}}
  if(f.phase==='fadeout'&&f.t>380){flyEnd(false);return;}
  const L=f.legs[f.li],w=W[L.wi],home=W[f.home.wi].stops[f.home.at].at;wi=L.wi;
  const p=flyPos();
  if(L.fade)f.a=Math.max(0,1-Math.max(0,f.d/L.len-0.35)/0.4);else if(f.phase==='gone'&&f.kind==='intro')f.a=0;
  let tx,ty;
  if(f.phase==='back'){tx=Math.max(0,Math.min(w.WW-VW,home[0]-VW/2));ty=Math.max(0,Math.min(w.WH-VH,home[1]-VH*0.55));}
  else if(L.other){tx=p[0]-VW/2;ty=p[1]-VH*0.55;}
  else{tx=Math.max(0,Math.min(w.WW-VW,p[0]-VW/2));ty=Math.max(0,Math.min(w.WH-VH,p[1]-VH*0.55));}
  const k=f.phase==='back'?0.07:0.12;camX+=(tx-camX)*k;camY+=(ty-camY)*k;
  if(f.phase==='back'&&((Math.abs(tx-camX)<1.5&&Math.abs(ty-camY)<1.5)||f.t>2600)){flyEnd(false);return;}
  const cx=Math.round(camX),cy=Math.round(camY);
  x.fillStyle=WATER[w.water].a;x.fillRect(0,0,VW,VH);x.drawImage(w.base,-cx,-cy);
  const O=L.other?W[L.other.wi]:null;if(O)x.drawImage(O.base,L.other.off[0]-cx,L.other.off[1]-cy);
  x.save();x.translate(-cx,-cy);G=x;
  for(const a of (w.anim||[]))A[a[0]](t,...a.slice(1));w.stops.forEach(s=>node(s,t));drawWorldText(w);if(L.wi===f.home.wi)drawGate(w,t,false);
  if(O){x.save();x.translate(L.other.off[0],L.other.off[1]);for(const a of (O.anim||[]))A[a[0]](t,...a.slice(1));O.stops.forEach(s=>node(s,t));drawWorldText(O);x.restore();}
  if(L.wi===f.home.wi&&!w.travel){const S=1.25,fc=p[0]<home[0]?-1:1,kx=home[0]-8*S,ky=home[1]-18*S+2;
    G.fillStyle='rgba(0,0,0,.38)';G.beginPath();G.ellipse(home[0]+.5,home[1]+3,9,3,0,0,Math.PI*2);G.fill();
    spr(KINAN,kx,ky,PAL,S,fc<0);spr(LEGS.stand,kx,ky+15*S,PAL,S,fc<0);}
  if(f.a>0){const gy=p[1]-p[2]-(f.phase==='appear'?Math.max(0,1-f.t/400)*30:0);
    if(f.phase!=='appear'&&Math.floor(t/60)%2===0){f.trail.push([p[0],gy,t]);if(f.trail.length>14)f.trail.shift();}
    for(const q of f.trail){const age=(t-q[2])/700;if(age<1){G.globalAlpha=(1-age)*f.a;px(age<0.5?'#ff3df0':'#00ffd0',q[0]-1+Math.sin(q[2])*4,q[1]-6+age*6,2,2);G.globalAlpha=1;}}
    if(f.phase==='appear')for(let i=0;i<10;i++){const r=6+f.t/30,ang=i*Math.PI/5+t/200;px(i%2?'#ff3df0':'#00ffd0',p[0]+Math.cos(ang)*r,gy-6+Math.sin(ang)*r*0.7,2,2);}
    if(f.o.ride&&L.road&&f.phase!=='appear'){   /* o.ride (World 6): on the road legs he rides away in the vehicle (the tour bus west), waving from its window */
      const q=along(L.pts,Math.min(L.len,f.d+4));G.globalAlpha=f.a;drawRide(f.o.ride,p[0],p[1],q[0]<p[0]-0.01?-1:1,t,'glitchy');G.globalAlpha=1;}
    else{G.globalAlpha=0.3*f.a;G.fillStyle='#000';G.beginPath();G.ellipse(p[0],p[1]+2,6,2,0,0,Math.PI*2);G.fill();G.globalAlpha=1;
    glitchySpr(p[0],gy,t,f.a);
    if(f.o.ride==='cargo'&&f.phase==='appear'){G.globalAlpha=f.a;box('#c98f52',p[0]-9,p[1]-11,18,11);px('#8a5a2a',p[0]-9,p[1]-7,18,2);px('#8a5a2a',p[0]-1,p[1]-11,2,11);G.globalAlpha=1;}}}   /* World 7: Glitchy climbs into a parcel before the cargo plane takes it */
  x.restore();G=x;fx(t,p[0]);hud();
  if(f.phase==='fadeout'){x.fillStyle='rgba(0,0,0,'+Math.min(1,f.t/380)+')';x.fillRect(0,0,VW,VH);}
  overlays(dt);}
addEventListener('keydown',e=>{if(!mounted||!cv.isConnected||e.ctrlKey||e.metaKey||e.altKey)return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
  const k=e.key;if(['ArrowRight','ArrowUp'].includes(k)){go(1);e.preventDefault();}else if(['ArrowLeft','ArrowDown'].includes(k)){go(-1);e.preventDefault();}
  else if(k==='Enter'||k===' '){if(document.activeElement&&document.activeElement.tagName==='BUTTON'&&!document.activeElement.classList.contains('km-btn'))return;play();e.preventDefault();}});
/* ---- the host: the map picture plus big thumb buttons (◀ ▶ beside or under it, PLAY on the right) ---- */
function css(){if(document.getElementById('km-style'))return;const s=document.createElement('style');s.id='km-style';s.textContent=
  '.km-root{display:grid;grid-template-areas:"scr scr" "l r";grid-template-columns:1fr auto;grid-template-rows:minmax(0,1fr) auto;gap:10px;width:100%;height:100%;min-height:0}'+
  '.km-stage{grid-area:scr;min-width:0;min-height:0;display:flex;align-items:center;justify-content:center}'+
  '.km-screen{position:relative;flex:none;border:3px solid #3a3f86;border-radius:6px;background:#000;overflow:hidden;box-shadow:0 6px 0 #0b0c22;perspective:700px;width:100%;aspect-ratio:432/240}'+
  '.km-canvas{display:block;width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges;outline:none;transition:transform 1.2s ease;transform-origin:50% 70%}'+
  '.km-canvas.three{transform:rotateX(40deg) scale(.9)}'+
  '.km-side{display:flex;gap:12px;align-items:center}.km-l{grid-area:l}.km-r{grid-area:r;justify-content:flex-end}'+
  '.km-btn{font-family:"Pixelify Sans",ui-monospace,monospace;font-weight:700;font-size:24px;min-width:72px;height:60px;border-radius:12px;border:3px solid #0b0c22;background:#282d63;color:#f4f1e8;box-shadow:0 4px 0 #0b0c22;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}'+
  '.km-btn:active{transform:translateY(3px);box-shadow:0 1px 0 #0b0c22}.km-btn:focus-visible{outline:3px solid #f6c445;outline-offset:2px}'+
  '.km-play{background:#e8364b;min-width:120px;border-radius:30px;font-size:22px}'+
  '@media (orientation:landscape) and (max-height:560px){.km-root{grid-template-areas:"l scr r";grid-template-columns:auto minmax(0,1fr) auto;grid-template-rows:minmax(0,1fr);gap:8px}'+
  '.km-l{flex-direction:column;justify-content:center}.km-r{flex-direction:column;justify-content:center}.km-btn{min-width:64px;height:64px}.km-play{min-width:88px;height:88px;border-radius:50%}}'+
  '@media (orientation:portrait) and (max-width:700px){.km-root{gap:12px}.km-btn{min-width:76px;height:66px;font-size:28px}.km-play{min-width:112px}}';
  document.head.appendChild(s);}
/* the picture keeps its 432:240 shape and is as big as the space allows */
function fit(){if(!scr||!root)return;const box=scr.parentNode;const bw=box.clientWidth,bh=box.clientHeight;if(!bw||!bh)return;
  let w=bw,h=w*240/432;if(h>bh){h=bh;w=h*432/240;}scr.style.width=Math.floor(w)+'px';scr.style.height=Math.floor(h)+'px';}
function mount(host,o){unmount();opts=o||{};W.sort((a,b)=>a.n-b.n);css();
  root=document.createElement('div');root.className='km-root';
  root.innerHTML='<div class="km-side km-l"><button type="button" class="km-btn" id="owPrev" aria-label="Walk back to the last stop">◀</button><button type="button" class="km-btn" id="owNext" aria-label="Walk on to the next stop">▶</button></div>'+
    '<div class="km-stage"><div class="km-screen"></div></div>'+
    '<div class="km-side km-r"><button type="button" class="km-btn km-play" id="owPlay">PLAY</button></div>';
  scr=root.querySelector('.km-screen');scr.appendChild(cv);host.appendChild(root);
  root.querySelector('#owPrev').addEventListener('click',()=>go(-1));root.querySelector('#owNext').addEventListener('click',()=>go(1));root.querySelector('#owPlay').addEventListener('click',()=>play());
  if(window.ResizeObserver){ro=new ResizeObserver(fit);ro.observe(scr.parentNode);}fit();
  mounted=true;busy=false;banner=null;notice=null;cross=null;walk=null;celebrate=null;refresh();
  let i=idxOf(opts.world||1);if(i<0||W[i].travel)i=0;
  goWorld(i,opts.at||0);fade=0;
  if(opts.celebrate!=null&&W[i].stops[opts.celebrate])celebrate={k:opts.celebrate,t:0};
  if(opts.notice)notice={t:0,txt:opts.notice,dur:2600};
  last=0;raf=requestAnimationFrame(frame);
  return api.state();}
function unmount(){if(!mounted&&!root)return;mounted=false;busy=false;if(raf)cancelAnimationFrame(raf);raf=0;
  if(window.KINAN3D&&KINAN3D.active)KINAN3D.unmount();
  if(ro){ro.disconnect();ro=null;}if(root&&root.parentNode)root.parentNode.removeChild(root);root=null;scr=null;banner=null;walk=null;cross=null;fly=null;}

/* vehicles Kinan rides on long trips between worlds */
function drawRide(kind,X,Y,f,t,rider){const g=G;g.save();g.translate(Math.round(X),Math.round(Y));if(f<0)g.scale(-1,1);const wh=Math.floor(t/90)%2;
  const wheel=(a)=>{px('#1b1220',a-3,-3,6,6);px(wh?'#6b6f7a':'#9aa3b2',a-1,-1,2,2);};
  const head=rider==='glitchy'
    ?(a,b)=>{px('#1b1220',a-5,b-7,10,8);px('#7a2fd0',a-4,b-6,8,6);px('#ff3df0',a-4,b-6,8,1);px('#00ffd0',a-4,b-1,8,1);px('#ffffff',a-2,b-5,4,3);px('#1b1220',a-1,b-4,2,2);px('#00ffd0',a-2,b-9,1,2);px('#00ffd0',a+1,b-9,1,2);}   /* World 6's escape: Glitchy at the bus window */
    :(a,b)=>{px('#1b1220',a-4,b-6,8,7);px('#4a2c1a',a-3,b-5,6,3);px('#d9a27a',a-3,b-2,6,3);px('#1b1220',a-6,b-4,2,6);px('#3b2618',a-5,b-3,1,4);px('#e8364b',a-5,b,1,1);};   /* Kinan's braid hangs at the back */
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,3,kind==='plane'?16:18,3,0,0,Math.PI*2);g.fill();
  if(kind==='truck'){box('#c2414f',-16,-12,30,9);box('#c2414f',2,-19,12,8);box('#cfeeff',5,-17,7,5);head(-4,-12);wheel(-10);wheel(8);}
  else if(kind==='van'){box('#f4f1e8',-16,-18,32,15);px('#2a5bd7',-16,-10,32,3);box('#cfeeff',6,-16,8,5);box('#cfeeff',-12,-16,14,5);head(-5,-15);wheel(-10);wheel(10);}
  else if(kind==='bus'){box('#f6c445',-20,-19,40,16);px('#2a5bd7',-20,-9,40,2);for(let i=0;i<5;i++)box('#cfeeff',-17+i*7,-17,5,5);head(-10,-15);wheel(-13);wheel(13);}
  else if(kind==='train'){box('#2b3f8f',-22,-17,44,14);px('#f6c445',-22,-9,44,2);for(let i=0;i<5;i++)box('#cfeeff',-18+i*8,-15,5,4);box('#2b3f8f',16,-21,8,6);head(-2,-14);for(const a of[-16,-6,6,16])wheel(a);}
  else if(kind==='boat'){g.fillStyle='#1b1220';g.beginPath();g.moveTo(-20,-6);g.lineTo(20,-6);g.lineTo(14,2);g.lineTo(-16,2);g.fill();g.fillStyle='#2a5bd7';g.beginPath();g.moveTo(-19,-5);g.lineTo(19,-5);g.lineTo(13,1);g.lineTo(-15,1);g.fill();box('#f4f1e8',-10,-14,18,8);box('#cfeeff',-7,-12,4,3);box('#cfeeff',0,-12,4,3);head(-1,-14);if(Math.sin(t/200)>0)px('#ffffff',-22,0,4,1);}
  else if(kind==='plane'){const b=-24+Math.round(Math.sin(t/300));box('#f4f1e8',-18,b,36,8);box('#e8364b',-20,b-6,6,8);box('#dfe5ee',-4,b+2,14,4);box('#dfe5ee',-4,b-4,10,4);for(let i=0;i<4;i++)box('#7ec8ff',2+i*4,b+2,2,2);head(10,b+1);}
  else if(kind==='cargo'){const b=-24+Math.round(Math.sin(t/300));   /* World 7's escape: a grey cargo plane flying east; in its open cargo door, the parcel Glitchy hides in, his eye peeking out */
    box('#9aa3b2',-20,b,40,9);box('#6b6f7a',-22,b-7,7,9);box('#c9d3dd',-4,b+3,15,4);box('#c9d3dd',-4,b-4,11,4);box('#7ec8ff',15,b+2,3,2);
    box('#3b2618',-16,b+1,11,7);box('#c98f52',-15,b+2,9,6);px('#8a5a2a',-15,b+4,9,1);px('#8a5a2a',-11,b+2,1,6);
    px('#ffffff',-14,b+1,3,2);px('#1b1220',-13,b+1,1,1);px('#00ffd0',-14,b-1,1,2);px('#00ffd0',-12,b-1,1,2);}
  g.restore();}
/* the pixel box of a walk-behind layer, plus the map words that fall inside it (redrawn on top of the layer) */
function overBox(w,c,y){const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=-1,y1=-1;
  for(let j=0;j<c.height;j++)for(let i=0;i<c.width;i++)if(d[(j*c.width+i)*4+3]){if(i<x0)x0=i;if(i>x1)x1=i;if(j<y0)y0=j;if(j>y1)y1=j;}
  const inB=(X,Y,pad)=>X>=x0-pad&&X<=x1+pad&&Y>=y0-pad&&Y<=y1+pad;
  return {c,y,labels:(w.labels||[]).filter(l=>inB(l[0],l[1]+14,60)),texts:(w.texts||[]).filter(t=>{const m=t[6];return inB(m[0]*t[1]+m[2]*t[2]+m[4],m[1]*t[1]+m[3]*t[2]+m[5],20);})};}
function drawOvers(w,p){for(const o of (w.overs||[]))if(p[1]<o.y){x.drawImage(o.c,0,0);drawWorldText(o);}}
function drawWorldText(w){for(const [s0,X,Y,c,sz,b,m] of (w.texts||[])){G.save();G.transform(m[0],m[1],m[2],m[3],m[4],m[5]);bfDraw(G,s0,X,Y,c,sz);G.restore();}
  for(const l of (w.labels||[]))P.label(...l);}
function plaque(name){const w=bfWidth(name,10)+28,X=Math.round((VW-w)/2),Y=212;
  G=x;px('#1b1220',X-2,Y-2,w+4,24);px('#c9922f',X-1,Y-1,w+2,22);px('#ffe58a',X-1,Y-1,w+2,1);px('#141632',X+1,Y+1,w-2,18);bfDraw(x,name,X+14,Y+7,'#f6c445',10);}
function crossLabel(o,d){return o.travel?o.hud:(d>0?'ON TO ':'BACK TO ')+'WORLD '+o.n+'  '+o.hud;}
function hud(){G=x;const hw=(cross&&cross.d>cross.len/2)?W[cross.other]:cur();const s=hw.travel?hw.hud:'WORLD '+hw.n+'   '+hw.hud;const w=bfWidth(s,9)+14;px('rgba(17,19,43,.86)',6,6,w,18);px('#3a3f86',6,6,w,1);px('#3a3f86',6,23,w,1);txt(s,12,11,'#f6c445',9,1);
  const cs='CANDLES  '+(opts.candles?opts.candles():0),cw=Math.max(82,bfWidth(cs,8)+16),cx0=VW-6-cw;px('rgba(17,19,43,.86)',cx0,6,cw,18);px('#3a3f86',cx0,6,cw,1);px('#3a3f86',cx0,23,cw,1);txt(cs,cx0+8,11,'#eef0ff',8,0);
  /* taekwondo (2026-10-28): Kinan's belt, a small belt icon + "BLUE BELT  2 STRIPES", left of the candles (under them when the world name is long) */
  const b=opts.belt?opts.belt():null;if(!b)return;
  const bs=b.label,bw=bfWidth(bs,8)+32,row1=cx0-4-bw>6+w+4,bx0=row1?cx0-4-bw:VW-6-bw,by=row1?6:26;
  px('rgba(17,19,43,.86)',bx0,by,bw,18);px('#3a3f86',bx0,by,bw,1);px('#3a3f86',bx0,by+17,bw,1);
  const ix=bx0+6,iy=by+4,R=b.tip||b.color;px('#1b1220',ix-1,iy+1,18,5);px(b.color,ix,iy+2,8,3);px(R,ix+8,iy+2,8,3);
  for(let k=0;k<b.stripes;k++)px('#ffffff',ix+11+k*2,iy+2,1,3);
  px('#1b1220',ix+5,iy,6,7);px(b.dark,ix+6,iy+1,4,5);px('#1b1220',ix+4,iy+6,4,5);px('#1b1220',ix+8,iy+6,4,5);px(b.color,ix+5,iy+6,2,4);px(R,ix+9,iy+6,2,4);
  txt(bs,ix+24,by+5,'#eef0ff',8,0);}
function glitchLevel(){const w=cur();const n=Math.max(1,w.stops.length-1);let v=at;if(walk)v=walk.from+(walk.to-walk.from)*Math.min(1,walk.d/Math.max(1,walk.len));return Math.max(0,Math.min(1,v/n));}
/* lvl 0..1: World 11 starts with light scanlines and ends torn, flickering and colour-split */
function glitchFx(t,strong,lvl){lvl=lvl||0;const a=0.08+0.1*lvl;for(let y=0;y<VH;y+=3){x.fillStyle='rgba(0,0,0,'+a+')';x.fillRect(0,y,VW,1);}
  const p=strong?500:Math.round(1900-1500*lvl);
  if((t%p)<110+140*lvl){const sd=Math.floor(t/p),rows=1+Math.floor(lvl*4);for(let r=0;r<rows;r++){const y=Math.floor(hash(sd,3+r)*(VH-20)),h=6+Math.floor(hash(sd,4+r)*14),dx=Math.round((hash(sd,9+r)-0.5)*(10+44*lvl));x.drawImage(cv,0,y*SC,VW*SC,h*SC,dx,y,VW,h);x.fillStyle=r%2?'rgba(255,61,240,.16)':'rgba(0,255,208,.16)';x.fillRect(0,y,VW,h);}}
  if(lvl>0.3){const n=Math.floor((lvl-0.3)*20);for(let i=0;i<n;i++){const s2=Math.floor(t/180)+i*7;if(hash(s2,1)>0.5){const bw=4+hash(s2,4)*30*lvl,bh=2+hash(s2,5)*10;x.globalAlpha=0.3+0.45*lvl;x.fillStyle=['#00ffd0','#ff3df0','#1b1220','#f6c445','#ffffff'][Math.floor(hash(s2,6)*5)];x.fillRect(Math.round(hash(s2,2)*VW),Math.round(hash(s2,3)*VH),Math.round(bw),Math.round(bh));x.globalAlpha=1;}}}
  if(lvl>0.6&&Math.sin(t/650)>0.9){x.fillStyle='rgba(0,0,0,.28)';x.fillRect(0,0,VW,VH);}
  if(lvl>0.75){x.globalAlpha=0.16+0.1*(lvl-0.75)*4;x.drawImage(cv,0,0,VW*SC,VH*SC,Math.round(2+3*lvl),0,VW,VH);x.globalAlpha=1;}}
function rainFx(t,heavy){x.fillStyle=heavy?'rgba(20,30,60,.22)':'rgba(20,30,60,.10)';x.fillRect(0,0,VW,VH);const n=heavy?140:70;for(let i=0;i<n;i++){const X=(hash(i,1)*VW+t*0.05)%VW,Y=(hash(i,2)*VH+t*0.32)%VH;x.fillStyle='rgba(180,205,240,.7)';x.fillRect(Math.round(X),Math.round(Y),1,heavy?6:4);}
  if(heavy&&(t%3100)<90){x.fillStyle='rgba(255,255,240,.45)';x.fillRect(0,0,VW,VH);}}
function fx(t,atX){const w=cur();let kind=w.fx;
  if(w.weather){const px0=atX!=null?atX:pos()[0];const z=w.weather.find(z=>px0>=z[0]&&px0<z[1]);kind=z?z[2]:null;}
  if(kind==='rain')rainFx(t,false);
  if(kind==='storm')rainFx(t,true);
  if(kind==='snow'){x.fillStyle='rgba(230,240,255,.08)';x.fillRect(0,0,VW,VH);for(let i=0;i<100;i++){const X=(hash(i,5)*VW+Math.sin(t/900+i)*8+t*0.008)%VW,Y=(hash(i,6)*VH+t*0.04)%VH;x.fillStyle='rgba(255,255,255,.92)';x.fillRect(Math.round(X),Math.round(Y),2,2);}}
  if(kind==='fog'){x.fillStyle='rgba(220,226,235,.3)';x.fillRect(0,0,VW,VH);}
  if(kind==='glitch')glitchFx(t,false,w.n===11?glitchLevel():0.15);}

let last=0;
/* one animation frame; the loop stops by itself once the map leaves the page */
function frame(t){raf=0;if(!mounted)return;if(!cv.isConnected){unmount();return;}
  try{draw(t);}catch(e){console.error('[map]',e);unmount();throw e;}
  if(mounted)raf=requestAnimationFrame(frame);}
function draw(t){const dt0=t-(last||t),dt=Math.min(50,dt0);last=t;let w=cur();
  if(window.KINAN3D&&KINAN3D.active&&w.n===12)return;   /* the 3D map draws itself */
  x.setTransform(SC,0,0,SC,0,0);x.imageSmoothingEnabled=false;
  if(fly){drawFly(t,dt0);return;}   /* a cutscene: Glitchy runs and the camera follows him */
  if(cross){cross.d+=dt*(cross.ride?0.16:0.09)*speed;if(cross.d>=cross.len){const o=W[cross.other],cd=cross.dir;camX-=cross.off[0];camY-=cross.off[1];wi=cross.other;at=cd>0?0:o.stops.length-1;cross=null;w=cur();if(o.travel)go(cd);else arrived();}}
  if(walk){walk.d+=dt*(w.travel?0.2:0.09)*speed;if(walk.d>=walk.len){const wd=walk.dir;at=walk.to;walk=null;
    /* road trips carry straight on into the next world */
    if(w.travel){if(wd>0&&at===w.stops.length-1&&canCross(1))startCross(1);else if(wd<0&&at===0&&canCross(-1))startCross(-1);}
    else arrived();}}
  const p=pos();if(walk){const n=along(walk.pts,Math.min(walk.len,walk.d+4));if(Math.abs(n[0]-p[0])>0.2)face=n[0]>p[0]?1:-1;}
  if(cross){const n=along(cross.pts,Math.min(cross.len,cross.d+4));if(Math.abs(n[0]-p[0])>0.2)face=n[0]>p[0]?1:-1;}
  const tx=cross?p[0]-VW/2:Math.max(0,Math.min(w.WW-VW,p[0]-VW/2)),ty=cross?p[1]-VH*0.55:Math.max(0,Math.min(w.WH-VH,p[1]-VH*0.55));camX+=(tx-camX)*0.08;camY+=(ty-camY)*0.08;
  const cx=Math.round(camX),cy=Math.round(camY);
  x.fillStyle=WATER[w.water].a;x.fillRect(0,0,VW,VH);x.drawImage(w.base,-cx,-cy);
  if(cross){const o=W[cross.other];x.drawImage(o.base,cross.off[0]-cx,cross.off[1]-cy);}
  x.save();x.translate(-cx,-cy);G=x;
  const wat=WATER[w.water];for(let i=0;i<150;i++){const X=Math.round((hash(i,1)*w.WW+t*0.012*(i%3+1))%w.WW),Y=Math.round(hash(i,2)*w.WH);if(!w.M(X,Y)&&!w.M(X,Y-CLIFF)&&!w.M(X,Y-5)&&!onBridge(w,X,Y)&&Math.sin(t/300+i)>0)px(wat.sh,X,Y,w.water==='space'||w.water==='void'?1:3,1);}
  for(const a of (w.anim||[]))A[a[0]](t,...a.slice(1));
  w.stops.forEach(s=>node(s,t));drawCelebrate(w,t,dt);drawWorldText(w);drawGate(w,t,!walk&&!cross);
  if(cross){const o=W[cross.other];x.save();x.translate(cross.off[0],cross.off[1]);for(const a of (o.anim||[]))A[a[0]](t,...a.slice(1));o.stops.forEach(s=>node(s,t));drawWorldText(o);x.restore();}
  if(w.travel&&!cross){drawRide(w.ride||'bus',p[0],p[1],face,t);drawOvers(w,p);x.restore();G=x;fx(t);hud();plaque(w.hud);overlays(dt);return;}
  if(cross&&cross.ride){drawRide(cross.ride,p[0],p[1],face,t);x.restore();G=x;fx(t);hud();plaque(crossLabel(W[cross.other],cross.dir));overlays(dt);return;}
  const moving=!!walk||!!cross,step=moving?Math.floor(t/130)%2:0,bob=moving&&step?-1:0;const S=1.25;
  const kx=p[0]-8*S,ky=p[1]-18*S+2+bob;
  G.fillStyle='rgba(0,0,0,.38)';G.beginPath();G.ellipse(p[0]+.5,p[1]+3,9,3,0,0,Math.PI*2);G.fill();
  spr(KINAN,kx,ky,PAL,S,face<0);spr(moving&&step?LEGS.walk:LEGS.stand,kx,ky+15*S,PAL,S,face<0);
  drawOvers(w,p);
  x.restore();G=x;
  fx(t);if(banner&&banner.glitch)glitchFx(t,true);hud();
  if(cross)plaque(crossLabel(W[cross.other],cross.dir));else if(w.travel)plaque(w.hud);else if(!walk&&!banner)plaque(w.stops[at].name);
  overlays(dt);}
/* a newly opened stop sparkles for a few seconds after a LEVEL CLEAR */
function drawCelebrate(w,t,dt){if(!celebrate)return;const s=w.stops[celebrate.k];celebrate.t+=dt;if(!s||celebrate.t>3600){celebrate=null;return;}
  const[X,Y]=s.at;for(let i=0;i<10;i++){const a=t/300+i*Math.PI/5,r=12+Math.sin(t/180+i)*3;px(i%2?'#f6c445':'#ffffff',X+Math.cos(a)*r-1,Y+Math.sin(a)*r*0.7-1,2,2);}}
function overlays(dt){
  if(fade>0){x.fillStyle='rgba(0,0,0,'+fade+')';x.fillRect(0,0,VW,VH);fade=Math.max(0,fade-dt/400);}
  if(notice){notice.t+=dt;const a=Math.min(1,notice.t/150)*(notice.t>notice.dur-250?Math.max(0,(notice.dur-notice.t)/250):1);
    if(notice.t>=notice.dur)notice=null;else{x.globalAlpha=a;const tw=bfWidth(notice.txt,8)+20,X=Math.round((VW-tw)/2);px('#1b1220',X-1,29,tw+2,18);px('#2b2f6a',X,30,tw,16);px('#f6c445',X,30,tw,1);txt(notice.txt,X+10,35,'#ffffff',8,1);x.globalAlpha=1;}}
  if(banner){banner.t+=dt;const D=banner.dur||2000,F=Math.min(300,D/4);const a=Math.min(1,banner.t/200)*(banner.t>D-F?Math.max(0,1-(banner.t-(D-F))/F):1);
    x.fillStyle='rgba(10,10,30,'+(0.55*a)+')';x.fillRect(0,0,VW,VH);x.globalAlpha=a;x.font="700 12px 'Pixelify Sans', monospace";const bw=x.measureText(banner.txt).width+30;
    px('#1b1220',(VW-bw)/2-2,96,bw+4,32);px(banner.glitch?'#5a2fa0':banner.soon?'#2a7fd0':banner.ok?'#e8364b':'#6b6f7a',(VW-bw)/2,98,bw,28);x.fillStyle='#ffffff';x.textBaseline='middle';x.fillText(banner.txt,(VW-bw)/2+15,112.5);
    x.font="400 9px 'Pixelify Sans', monospace";x.fillStyle='#eef0ff';const sub=banner.sub||'';if(sub)x.fillText(sub,VW/2-x.measureText(sub).width/2,140);x.globalAlpha=1;
    if(banner.t>D){const th=banner.then;banner=null;if(th)th();}}}
window.__maps=(only)=>W.filter(w=>!only||only.includes(w.n)).map(w=>{ensure(w);const c=document.createElement('canvas');c.width=w.WW;c.height=w.WH;const g=c.getContext('2d');g.drawImage(w.base,0,0);G=g;for(const a of (w.anim||[]))A[a[0]](1000,...a.slice(1));w.stops.forEach(s=>node(s,1000));drawWorldText(w);G=x;return c.toDataURL();});
const api={
  mount,unmount,go,play,refresh:()=>{if(mounted)refresh();},
  /* what the map shows right now (the game's tests read this) */
  state:()=>{const w=cur(),k3=window.KINAN3D,k3on=!!(k3&&k3.active),ks=k3on&&k3.state?k3.state():null;
    return {mounted,busy,world:w?w.n:null,at:k3on&&ks?ks.at:at,walking:!!walk||!!(ks&&ks.walking),crossing:!!cross,three:k3on,threeReady:!!(ks&&ks.ready),
      banner:banner?banner.txt:(ks&&ks.banner?'3D':null),notice:notice?notice.txt:null,celebrate:celebrate?celebrate.k:null,
      gate:(()=>{const g=mounted&&!fly?gateAhead():null;return g?g.n:null;})(),
      fly:fly?{kind:fly.kind,phase:fly.phase,leg:fly.li,legs:fly.legs.length,world:W[fly.legs[fly.li].wi].n,home:W[fly.home.wi].n+':'+fly.home.at,
        riding:!!(fly.o.ride&&fly.legs[fly.li].road&&fly.phase!=='appear')?fly.o.ride:null}:null,   /* World 6: Glitchy on the tour bus */
      stops:w?w.stops.map(s=>({name:s.name,kind:s.kind,id:s.id||null,built:s.built!==false,state:s.state||null})):[]};},
  /* developer tools: drop Kinan on a world's stop */
  warp:(n,k)=>{const i=idxOf(n);if(i<0||!mounted)return null;goWorld(i,k||0);return api.state();},
  speed:(v)=>{speed=Math.max(0.25,Math.min(12,Number(v)||1));return speed;},
  /* cutscenes (see CUTSCENES above): fly('intro'|'escape', {onEvent, onDone}) -> started?; flySkip() ends one now */
  fly:(kind,o)=>fly1(kind,o),flySkip:()=>{if(!fly)return false;flyEnd(true);return true;},
  notice:(txt,dur)=>{if(mounted&&txt)notice={t:0,txt:String(txt),dur:dur||2600};},   /* tests: long road trips at a multiple of the walking speed */
  worlds:()=>W.slice().sort((a,b)=>a.n-b.n).map(w=>({n:w.n,travel:!!w.travel,hud:w.hud,stops:w.stops.map(s=>({name:s.name,st:s.st,kind:kindOf(s)}))}))
};
/* world files register with KINAN.W.push({...}) and use the drawing helpers below */
window.KINAN=Object.assign(api,{textW:bfWidth,W,P,A,GROUND,RIM,LINE,CLIFFS,WATER,px,box,shadow,spr,txt,hash,poly,polyDist,homes,mapleLeaf,g:()=>G,start:()=>{},goWorld,cur:()=>cur(),KINAN_SPRITE:KINAN,LEGS,PAL});
})();

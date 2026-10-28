/* Road-trip map between World 6 and World 7: THE ROAD WEST (Drumheller to Vancouver).
   Kinan rides the tour bus west, right to left: the badlands and hoodoos, the prairie (wheat, canola, a grain
   elevator, cattle, pumpjacks, a thunderstorm), Calgary's skyline off to the north, the rolling foothills, the
   Rocky Mountains (Banff, Lake Louise, the BC border, Takakkaw Falls, the Rogers Pass snow shed in the snow),
   the Fraser Canyon (fog, the airtram, a road tunnel) and the green Fraser Valley in the rain.
   The right edge lines up with World 6's exit (y 142), the left edge with World 7's entry (Highway 1). */
(function(K){
  const {px,box,shadow,txt,hash,polyDist}=K; const g=()=>K.g(); const P=K.P, A=K.A;
  const O='#1b1220', WW=3468, WH=480;
  const line=(c,w,pts)=>{const G=g();G.strokeStyle=c;G.lineWidth=w;G.lineCap='round';G.lineJoin='round';G.beginPath();pts.forEach(([a,b],i)=>i?G.lineTo(a,b):G.moveTo(a,b));G.stroke();};
  const tri=(c,pts)=>{const G=g();G.fillStyle=c;G.beginPath();pts.forEach(([a,b],i)=>i?G.lineTo(a,b):G.moveTo(a,b));G.closePath();G.fill();};
  const ell=(c,x,y,rx,ry)=>{const G=g();G.fillStyle=c;G.beginPath();G.ellipse(x,y,rx,ry,0,0,Math.PI*2);G.fill();};
  const chaikin=(pts,n)=>{let p=pts;for(let k=0;k<n;k++){const q=[p[0]];for(let i=0;i<p.length-1;i++){const[a,b]=p[i],[c,d]=p[i+1];q.push([a*0.75+c*0.25,b*0.75+d*0.25],[a*0.25+c*0.75,b*0.25+d*0.75]);}q.push(p[p.length-1]);p=q;}return p.map(([a,b])=>[Math.round(a*10)/10,Math.round(b*10)/10]);};
  const dense=(pts,step)=>{const out=[];for(let i=1;i<pts.length;i++){const[a,b]=pts[i-1],[c,d]=pts[i];const L=Math.hypot(c-a,d-b);const n=Math.max(1,Math.ceil(L/step));for(let k=0;k<n;k++)out.push([a+(c-a)*k/n,b+(d-b)*k/n]);}out.push(pts[pts.length-1].slice());return out;};
  const colY=pts=>{const a=new Float32Array(WW+1).fill(NaN);for(const[x,y]of dense(pts,0.5)){const i=Math.round(x);if(i>=0&&i<=WW)a[i]=y;}return a;};

  /* ================= THE HIGHWAY (one road, smoothed once; Kinan's bus uses the same points) ================= */
  const S0=[3200,308], S1=[280,300];   /* 216 px + camera lag from the edges, so arriving here never shows past the map */
  const ENTRY=chaikin([[3468,142],[3424,142],[3378,144],[3346,156],[3328,180],[3322,206],[3322,236],[3322,262],[3314,286],[3292,301],[3264,305],S0],3);
  const MAIN=chaikin([S0,[3140,309],[3090,306],[3030,298],[2960,296],[2890,302],[2820,310],[2750,314],[2680,312],[2610,305],[2540,298],[2470,299],[2400,306],[2330,314],[2260,318],[2190,318],[2120,313],[2050,304],[1980,296],[1910,296],[1840,304],[1770,314],[1700,321],[1630,320],[1560,310],[1490,300],[1420,298],[1350,306],[1280,318],[1220,324],[1176,318],[1150,312],[1130,311],
    [960,311],[938,316],[908,330],[872,346],[832,352],[794,342],[764,322],[734,304],[700,297],[672,306],[654,324],[640,342],[624,349],
    [460,349],[440,344],[420,330],[400,314],[370,303],[330,300],S1],3);
  const EXIT=chaikin([S1,[200,300],[120,300],[0,300]],2);
  const RYc=colY(MAIN), RY=x=>{const v=RYc[Math.max(0,Math.min(WW,Math.round(x)))];return isNaN(v)?300:v;};
  const roadMin=(a,b)=>{let lo=1e9;for(let X=a;X<=b;X+=2)lo=Math.min(lo,RY(X));return lo;};
  const N=(x,w)=>Math.round(roadMin(x,x+(w||20))-9);           /* base line just north of the road */
  const SB=x=>Math.round(RY(x)+40);                              /* sign base just south of the road */

  /* ================= THE RAILWAY: up from the prairie, alongside the highway, into the tunnel under Rogers Pass ================= */
  const tc=[[3112,500],[3084,452],[3046,410],[2994,378],[2930,362]];for(let x=2870;x>=1090;x-=60)tc.push([x,Math.round(RY(x)+52)]);tc.push([1056,Math.round(RY(1056)+52)]);
  const TRACK=chaikin(tc,3), TYc=colY(TRACK);
  const TD=dense(TRACK,1), TL=[0];for(let i=1;i<TD.length;i++)TL.push(TL[i-1]+Math.hypot(TD[i][0]-TD[i-1][0],TD[i][1]-TD[i-1][1]));const TLEN=TL[TL.length-1];
  const tAt=d=>{let lo=0,hi=TL.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(TL[m]<d)lo=m;else hi=m;}const f=(d-TL[lo])/((TL[hi]-TL[lo])||1);return[TD[lo][0]+(TD[hi][0]-TD[lo][0])*f,TD[lo][1]+(TD[hi][1]-TD[lo][1])*f];};

  /* ================= RIVERS ================= */
  const RDR={pts:[[3548,222],[3468,230],[3400,236],[3330,236],[3262,228],[3214,206],[3182,168],[3168,112],[3166,40],[3170,-30]],w:18};  /* Red Deer River, carried on from World 6 */
  const FR1={pts:[[1012,520],[1006,470],[986,428],[952,404],[906,398],[860,404],[818,408],[780,398],[746,380],[712,370],[676,374],[644,388],[612,402],[570,410],[524,408]],w:11};  /* Fraser River in its canyon */
  const FR2={pts:[[530,408],[480,402],[440,397]],w:14};
  const FR3={pts:[[446,397],[400,394],[352,400],[306,414],[268,436],[242,466],[230,520]],w:18};  /* wide Fraser through the valley */
  const frd=(X,Y)=>Math.min(polyDist(FR1.pts,X,Y)-FR1.w,polyDist(FR2.pts,X,Y)-FR2.w,polyDist(FR3.pts,X,Y)-FR3.w);

  /* ================= MOUNTAINS, painted into the ground so the road and trees sit on top =================
     [peakX, peakY, baseY, halfWidthLeft, halfWidthRight, look]. Near ones stop just above the road; their peaks stay inside the camera. */
  const MT=[];
  const mt=(x,h,hl,hr,lk,tall)=>{const by=roadMin(x-hl,x+hr)-12;MT.push([x,Math.max(by-h,RY(x)-124-(tall||0)),by,hl,hr,lk]);};   /* tall: peak runs off the top of the screen */
  const far=(x,hw)=>{const by=roadMin(x-hw,x+hw)-52;MT.push([x,RY(x)-128,by,hw,hw,'f']);};
  const smt=(x,hw,lk,top)=>MT.push([x,top,560,hw,hw,lk]);
  /* the Rockies */
  mt(1738,118,58,50,'r');mt(1650,150,122,30,'r',26);/* Mount Rundle: long slope, steep face */mt(1556,114,54,50,'r');
  mt(1326,122,58,56,'r');mt(1248,150,62,58,'r',24);mt(1170,118,56,54,'r');mt(1086,150,54,50,'r',22);mt(1012,110,48,44,'r');
  [1800,1712,1610,1520,1446,1380,1290,1206,1126,1048].forEach(x=>far(x,64));
  [1880,1960,2040].forEach(x=>far(x,74));                                     /* the Rockies seen far off from the foothills */
  [1720,1588,1452,1316,1186].forEach(x=>{let hi=-1e9;for(let X=x-62;X<=x+62;X+=3){const y=TYc[X];if(!isNaN(y))hi=Math.max(hi,y);}smt(x,62,'r',Math.round(hi+18));});
  /* the Coast Mountains over the canyon, and Golden Ears over the valley */
  mt(948,112,50,44,'c');mt(866,110,58,54,'c');mt(778,118,56,58,'c');mt(688,112,52,52,'c');mt(598,116,58,54,'c');mt(512,110,54,52,'c');
  [930,820,720,620,530].forEach(x=>far(x,60));
  smt(910,58,'c',428);smt(760,60,'c',424);smt(612,56,'c',436);smt(470,50,'c',430);
  mt(334,118,46,26,'e');mt(370,108,26,44,'e');
  MT.sort((a,b)=>b[2]-a[2]);
  const LOOK={r:{sn:.34,rk:.7,s:['#f4f7ff','#c9d2ea'],r:['#c4beb2','#b0aa9e','#8a847a','#7a746a'],f:['#4f9a46','#3f8a3a','#2e6a2e','#285f2a']},
    f:{sn:.42,rk:1.1,s:['#f4f7ff','#d4dbee'],r:['#c4cce0','#aab6ce','#8e9ab6','#8290ac'],f:['#000','#000','#000','#000']},
    c:{sn:.16,rk:.44,s:['#f4f7ff','#c9d2ea'],r:['#aaa69c','#9a968c','#76726a','#6a665e'],f:['#3f8a3a','#2f7a3a','#245f2e','#1f5428']},
    e:{sn:.3,rk:.56,s:['#f4f7ff','#c9d2ea'],r:['#b4aea2','#a49e92','#7c766c','#6e685e'],f:['#4f9a46','#3a8a38','#2a6a2c','#245f28']}};
  function mtnAt(X,Y){for(const m of MT){const[pX,pY,bY,hl,hr,lk]=m;if(Y<pY||X<pX-hl||X>pX+hr)continue;const by=bY+Math.sin(X/13)*2;if(Y>by)continue;
      const t=(Y-pY)/(bY-pY),dx=X-pX,half=(dx<0?hl:hr)*t;if(Math.abs(dx)>half)continue;
      if(half-Math.abs(dx)<1.4&&t<0.9)return['w06t_mrock',lk==='f'?'#6a7494':O];
      const L=LOOK[lk],lit=dx<Math.sin(Y/5)*2,h=hash(X>>1,Y>>1)>.9,sn=L.sn+Math.sin(X/6)*0.03+Math.sin(X/2.3)*0.015;
      if(t<sn)return['w06t_snow',L.s[lit?0:1]];
      if(t<L.rk)return['w06t_mrock',L.r[lit?(h?0:1):(h?3:2)]];
      return['w06t_mforest',L.f[lit?(h?0:1):(h?3:2)]];}return null;}

  /* ================= ROLLING FOOTHILLS ================= */
  const HILLS=[];{let k=0;for(const by of [244,272,300,330,362,396,432,470]){for(let x=1700+(k%2)*34;x<2110;x+=62+Math.round(hash(x,by)*22))HILLS.push([x,by,40+Math.round(hash(by,x)*28),18+Math.round(hash(x+1,by)*14)]);k++;}}
  HILLS.sort((a,b)=>b[1]-a[1]);
  function hillAt(X,Y){for(const[cx,by,rx,ry]of HILLS){if(Y>by||Y<by-ry||X<cx-rx||X>cx+rx)continue;const e=((X-cx)/rx)**2+((Y-by)/ry)**2;if(e>1)continue;
      if(e>1-2.6/ry)return '#3f7a2e';const lit=(X-cx)/rx+(Y-by+ry)/ry*0.5<0.1,h=hash(X>>1,Y>>1)>.92;return lit?(h?'#a8dc6c':'#8ccc58'):(h?'#7cbc4a':'#6aa844');}return null;}

  /* ================= GROUND: which look each spot gets ================= */
  const WAV=(X,Y)=>X+Math.sin(Y/37)*14+Math.sin(Y/13+X/50)*5;      /* wavy borders between the regions */
  const field=(X,Y,pc)=>{const x=X+7,y=Y+3;if(x%96<2||y%44<2)return 'w06t_lane';const h=hash(Math.floor(x/96),Math.floor(y/44)+17);return h<pc[0]?'w06t_canola':h<pc[1]?'w06t_wheat':h<pc[2]?'w06t_pasture':'w06t_fallow';};
  const farm=(X,Y)=>{const x=X+3,y=Y+5;if(x%80<2||y%40<2)return 'w06t_lane';const h=hash(Math.floor(x/80)+40,Math.floor(y/40));return h<.4?'w06t_farm':h<.66?'w06t_berry':'w06t_pasture2';};
  let ZC=null;
  function zoneOf(X,Y){
    const m=mtnAt(X,Y);if(m){ZC=m[1];return m[0];}
    const b=WAV(X,Y),xi=Math.round(X),ty=TYc[xi],snowy=b>1000&&b<=1750&&X<1330+Math.sin(Y/17)*12;
    if(!isNaN(ty)){const d=Y-ty;if(d>=-4&&d<=4)return 'w06t_ballast';if(d>=-9&&d<=22)return snowy?'w06t_rowS':(b>1000&&b<=1750)?'w06t_rowF':'w06t_row';}
    if(b>3050){if(Y<34||Y>404)return 'wheat';if(polyDist(RDR.pts,X,Y)-RDR.w<30)return 'w06t_flats';return 'w06t_bad';}
    const ry=RYc[xi];if(!isNaN(ry)){const d=Y-ry;if(d>5&&d<=24)return snowy?'w06t_rowS':(b>430&&b<=1750)?'w06t_rowF':'w06t_row';}
    if(b>2350)return field(X,Y,[.36,.74,.88]);
    if(b>2050){if(((X-2226)/130)**2+((Y-252)/22)**2<1)return 'w06t_city';return field(X,Y,[.12,.4,.85]);}
    if(b>1750){const hc=hillAt(X,Y);if(hc){ZC=hc;return 'w06t_hills';}return 'w06t_hillgrass';}
    if(b>1000)return snowy?'w06t_forestS':'w06t_forest';
    const rd=frd(X,Y);
    if(b>430)return rd<26?'w06t_rock':'w06t_forestC';
    if(X<140+Math.sin(Y/19)*10||rd<14)return 'grass';
    return farm(X,Y);}
  let zx=-1e9,zy=-1e9,zr='grass',zc=null;
  const ZK=(X,Y)=>{if(X!==zx||Y!==zy){zx=X;zy=Y;ZC=null;zr=zoneOf(X,Y);zc=ZC;}return zr;};
  const zcol=(X,Y)=>{ZK(X,Y);return zc||'#6cc644';};
  const GR=K.GROUND;
  GR.w06t_bad=(X,Y)=>GR.badlands(X-WW,Y);                                    /* same stripes as World 6, lined up at the seam */
  GR.w06t_flats=(X,Y)=>{const h=hash(X>>1,Y>>1);return h>.96?'#a8d870':h>.9?'#7aa84a':'#8cbc58';};
  GR.w06t_ballast=(X,Y)=>hash(X,Y)>.8?'#7d7468':'#9a8f80';
  GR.w06t_row=(X,Y)=>{const h=hash(X>>1,Y>>1);return h>.95?'#b8e080':h>.88?'#7aae48':'#8cc458';};
  GR.w06t_rowF=(X,Y)=>hash(X>>1,Y>>1)>.95?'#7cc05a':'#4f9a3e';
  GR.w06t_rowS=(X,Y)=>hash(X>>2,Y>>2)>.88?'#d6e0f4':'#eef3fc';
  GR.w06t_lane=()=>'#c8d48a';
  GR.w06t_canola=(X,Y)=>(Y%4===0)?'#d4ae18':hash(X>>1,Y>>1)>.94?'#fff27a':'#f4d42c';
  GR.w06t_wheat=(X,Y)=>(Y%5===0)?'#c49434':hash(X>>2,Y>>2)>.9?'#f7dd88':'#e6c05a';
  GR.w06t_pasture=(X,Y)=>{const h=hash(X>>1,Y>>1);return h>.95?'#c4e08a':h>.88?'#8cb050':'#a4c866';};
  GR.w06t_fallow=(X,Y)=>(Y%4<2)?'#a8804c':'#bf9860';
  GR.w06t_city=(X,Y)=>(X%10===0||Y%7===0)?'#aeb2bc':'#c6c9d1';
  GR.w06t_hillgrass=(X,Y)=>hash(X>>1,Y>>1)>.95?'#b8e080':'#9ccc62';
  GR.w06t_forest=(X,Y)=>{const h=hash(X>>1,Y>>1);return h>.96?'#5aae44':h>.9?'#2f7a2c':'#3a8a34';};
  GR.w06t_forestS=(X,Y)=>{const h=hash(X>>1,Y>>1);return h>.93?'#c8d4ea':h>.86?'#9cc0a0':'#eef3fc';};
  GR.w06t_rock=(X,Y)=>['#9a8a74','#b4a088','#7d6e5c','#a8967e'][((Math.floor((Y+Math.sin(X/9)*3)/4))%4+4)%4];
  GR.w06t_forestC=(X,Y)=>{const h=hash(X>>1,Y>>1);return h>.95?'#4f9a46':h>.88?'#245f2e':'#2f7a3a';};
  GR.w06t_farm=(X,Y)=>(Y%4<2)?'#4f9a3a':'#72c04e';
  GR.w06t_berry=(X,Y)=>Y%5===0?'#2a5226':hash(X,Y>>1)>.9?'#4a3f9a':'#3f7a34';
  GR.w06t_pasture2=(X,Y)=>hash(X>>1,Y>>1)>.95?'#a8ec74':'#62bb3c';
  ['w06t_snow','w06t_mrock','w06t_mforest','w06t_hills'].forEach(k=>GR[k]=zcol);
  const KEYS=['w06t_snow','w06t_mrock','w06t_mforest','w06t_ballast','w06t_row','w06t_rowF','w06t_rowS','wheat','w06t_flats','w06t_bad','w06t_lane','w06t_canola','w06t_wheat','w06t_pasture','w06t_fallow','w06t_city',
    'w06t_hills','w06t_hillgrass','w06t_forest','w06t_forestS','w06t_rock','w06t_forestC','grass','w06t_farm','w06t_berry','w06t_pasture2'];
  const RL={w06t_bad:['#f2dcb8','#5e3b20'],w06t_flats:['#b8e080','#2e6423'],w06t_rock:['#d8c8b0','#3b2618'],w06t_forestC:['#6cc644','#1b3d14'],w06t_farm:['#a8ec74','#2e6423'],w06t_berry:['#a8ec74','#2e6423'],
    w06t_pasture2:['#a8ec74','#2e6423'],w06t_row:['#b8e080','#2e6423'],w06t_rowF:['#7cc05a','#1b3d14'],w06t_rowS:['#ffffff','#7d86a8'],w06t_lane:['#e8f0b0','#5e3b20'],w06t_ballast:['#c9c4b8','#3a3836']};
  KEYS.forEach(k=>{if(k==='wheat'||k==='grass')return;const r=RL[k]||['#dcecb0','#3b2618'];K.RIM[k]=r[0];K.LINE[k]=r[1];});

  /* ================= PROPS ================= */
  P.w06t_keep=function(){};   /* reserves room so trees are not scattered on the snow shed, the tunnel and the river crossing */
  P.w06t_lbl=function(X,Y,s){P.label(X,Y,s);};
  P.w06t_sign=function(X,Y,a,b,col){const G=g();const w=Math.ceil(Math.max(K.textW(a,6),b?K.textW(b,6):0))+9;
    shadow(X+w/2,Y+1,w/2-4,2);px(O,X+5,Y-12,2,12);px(O,X+w-7,Y-12,2,12);box(col||'#2f7d32',X,Y-31,w,20);px('#ffffff',X+1,Y-30,w-2,1);
    txt(a,X+4,Y-28,'#ffffff',6,1);if(b)txt(b,X+4,Y-20,'#f6c445',6,1);};
  /* the railway, drawn once along the whole line: ties, then two steel rails */
  P.w06t_track=function(){const G=g();
    for(let i=0;i<TD.length;i+=5){const a=TD[Math.max(0,i-2)],b=TD[Math.min(TD.length-1,i+2)];const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;const nx=-dy/l,ny=dx/l,[x,y]=TD[i];
      G.strokeStyle='#5e3b20';G.lineWidth=2;G.beginPath();G.moveTo(x+nx*4.5,y+ny*4.5);G.lineTo(x-nx*4.5,y-ny*4.5);G.stroke();}
    [-2.5,2.5].forEach(o=>{const pts=TD.filter((q,i)=>i%2===0).map((q,j,arr)=>{const a=arr[Math.max(0,j-1)],b=arr[Math.min(arr.length-1,j+1)];const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return[q[0]-dy/l*o,q[1]+dx/l*o];});
      line('#3a3836',2,pts);line('#c9d0dc',1,pts.map(([a,b])=>[a,b-0.5]));});};
  /* big Drumheller hoodoos come from World 6 (P.w06_hoodoo) */
  /* the classic red prairie grain elevator with its town's name painted on */
  P.w06t_elevator=function(X,Y,name){const G=g();const R='#a8322e',R2='#86241f',T='#f4f1e8';shadow(X+26,Y+2,32,4);
    box(R,X+34,Y-30,20,30);px(R2,X+50,Y-30,4,30);tri(O,[[X+33,Y-29],[X+56,Y-39],[X+56,Y-29]]);tri('#6b6f7a',[[X+35,Y-30],[X+55,Y-38],[X+55,Y-30]]);
    box(R,X,Y-64,36,64);px('#c4483f',X,Y-64,4,64);px(R2,X+32,Y-64,4,64);for(let i=0;i<3;i++)px(T,X,Y-46+i*16,36,1);
    box(R,X+9,Y-76,18,12);tri(O,[[X+5,Y-75],[X+18,Y-85],[X+31,Y-75]]);tri('#6b6f7a',[[X+8,Y-76],[X+18,Y-83],[X+28,Y-76]]);box('#cfeeff',X+15,Y-73,6,4);
    box('#5e3b20',X+12,Y-12,12,12);px(T,X+12,Y-12,12,1);txt(name,X+4,Y-60,T,6,1);
    line(O,2,[[X+38,Y-52],[X+50,Y-40]]);line('#9aa3b2',1,[[X+38,Y-52],[X+50,Y-40]]);P.label(X+28,Y-100,'GRAIN ELEVATOR');};
  P.w06t_barn=function(X,Y,c){c=c||'#c2414f';shadow(X+18,Y+2,24,4);box(c,X,Y-20,36,20);
    K.poly('#6b3a2a',[[X-3,Y-19],[X+4,Y-31],[X+18,Y-37],[X+32,Y-31],[X+39,Y-19]]);px('#f4f1e8',X,Y-20,36,1);
    box('#7a2424',X+11,Y-14,14,14);line('#f4f1e8',1,[[X+11,Y-14],[X+25,Y]]);line('#f4f1e8',1,[[X+25,Y-14],[X+11,Y]]);px('#f4f1e8',X+18,Y-14,1,14);box('#f4f1e8',X+15,Y-28,6,5);};
  P.w06t_silo=function(X,Y){shadow(X+6,Y+1,8,2);box('#cfd6e2',X,Y-36,12,36);for(let i=4;i<34;i+=6)px('#aab2c0',X,Y-36+i,12,1);px('#ffffff',X+1,Y-36,2,36);ell(O,X+6,Y-36,7,4);ell('#9aa3b2',X+6,Y-36,6,3);};
  P.w06t_cow=function(X,Y,c){const w=c==='#f4f1e8';shadow(X+7,Y+1,9,2);px(O,X-1,Y-9,15,8);px(c,X,Y-8,13,6);if(w){px(O,X+3,Y-7,3,3);px(O,X+8,Y-6,3,2);}
    px(O,X+11,Y-12,7,7);px(c,X+12,Y-11,5,5);px('#f39ac0',X+15,Y-8,3,2);px(O,X+12,Y-13,1,2);px(O,X+16,Y-13,1,2);px(O,X+1,Y-2,2,3);px(O,X+9,Y-2,2,3);};
  P.w06t_horse=function(X,Y,c){shadow(X+8,Y+1,10,2);px(O,X-1,Y-12,17,7);px(c,X,Y-11,15,5);px(O,X+1,Y-6,2,6);px(O,X+12,Y-6,2,6);
    px(O,X+13,Y-19,5,10);px(c,X+14,Y-18,3,8);px(O,X+15,Y-20,6,5);px(c,X+16,Y-19,4,3);px('#3b2618',X+13,Y-18,1,6);px('#3b2618',X-3,Y-11,3,6);};
  P.w06t_bale=function(X,Y){shadow(X,Y+1,6,2);ell(O,X,Y-5,6,6);ell('#e6c05a',X,Y-5,5,5);ell('#c49434',X,Y-5,3,3);ell('#f7dd88',X,Y-5,1.5,1.5);};
  P.w06t_rail=function(X,Y,n){for(let i=0;i<=n;i++){px(O,X+i*8,Y-9,3,10);px('#8a5a32',X+i*8+1,Y-8,1,8);}px(O,X,Y-8,n*8+3,2);px(O,X,Y-4,n*8+3,2);px('#a8763c',X,Y-8,n*8+3,1);px('#a8763c',X,Y-4,n*8+3,1);};
  P.w06t_cabin=function(X,Y,roof){shadow(X+11,Y+1,14,3);box('#8a5a32',X,Y-12,22,12);for(let i=2;i<12;i+=3)px('#5e3b20',X,Y-12+i,22,1);px(O,X-3,Y-19,28,8);px(roof||'#3f7a4a',X-2,Y-18,26,6);box('#7a746a',X+16,Y-24,4,7);box('#f6c445',X+4,Y-9,5,4);box('#3b2618',X+12,Y-9,5,9);};
  /* Calgary, off in the distance: hazy towers, the curved Bow and the Calgary Tower */
  P.w06t_skyline=function(X,Y){const G=g();const hz=['#9fb4cc','#8aa2be','#b4c4d8','#7a92b0','#a8bcd2'];shadow(X+56,Y+1,70,3);
    [[0,24,10],[9,38,10],[18,28,9],[26,50,11],[36,42,10],[46,60,12],[57,36,9],[65,46,10],[74,32,9],[82,26,10],[91,20,9]].forEach(([a,h,w],i)=>{box(hz[i%5],X+a,Y-h,w,h);px('rgba(255,255,255,.35)',X+a,Y-h,2,h);for(let yy=Y-h+3;yy<Y-3;yy+=4)px('rgba(255,255,255,.4)',X+a+3,yy,w-5,1);});
    G.fillStyle=O;G.beginPath();G.moveTo(X+101,Y);G.quadraticCurveTo(X+109,Y-34,X+103,Y-64);G.lineTo(X+116,Y-64);G.quadraticCurveTo(X+122,Y-34,X+118,Y);G.fill();
    G.fillStyle='#8ab8d8';G.beginPath();G.moveTo(X+103,Y-1);G.quadraticCurveTo(X+110,Y-34,X+105,Y-62);G.lineTo(X+114,Y-62);G.quadraticCurveTo(X+120,Y-34,X+116,Y-1);G.fill();for(let i=6;i<60;i+=6)px('#6a98bc',X+106,Y-i,10,1);
    px(O,X-15,Y-56,5,56);px('#ece8de',X-14,Y-56,3,56);px(O,X-21,Y-65,17,10);px('#e8364b',X-20,Y-64,15,8);px('#ff8a9a',X-20,Y-64,15,2);px(O,X-18,Y-70,11,6);px('#9aa3b2',X-17,Y-69,9,4);px(O,X-13,Y-78,1,8);};
  /* Lake Louise: turquoise lake, the Victoria Glacier between two dark peaks, a red canoe */
  P.w06t_lakeLouise=function(X,Y){const G=g();
    const M=(x0,y0,w,h,c1,c2,snow)=>{tri(O,[[x0-1,y0+1],[x0+w/2,y0-h-1],[x0+w+1,y0+1]]);tri(c1,[[x0+1,y0],[x0+w/2,y0-h+1],[x0+w-1,y0]]);tri(c2,[[x0+w/2,y0-h+1],[x0+w-1,y0],[x0+w*0.62,y0]]);
      if(snow)tri('#f4f7ff',[[x0+w/2-w*0.16,y0-h*0.66],[x0+w/2,y0-h+1],[x0+w/2+w*0.16,y0-h*0.66],[x0+w/2+w*0.05,y0-h*0.6],[x0+w/2-w*0.05,y0-h*0.7]]);};
    M(X-58,Y-14,116,98,'#e8eef8','#c4cfe6',false);                                     /* Mount Victoria, all glacier */
    for(let i=0;i<5;i++)px('#9aa6c4',X-30+i*14,Y-50+Math.abs(i-2)*8,2,18);
    M(X-82,Y-6,68,80,'#5e6a5e','#46524a',true);M(X+14,Y-6,72,86,'#5e6a5e','#46524a',true);   /* the dark walls either side */
    for(let i=0;i<7;i++){P.pine(X-76+i*9,Y-4+(i%2)*2);P.pine(X+20+i*9,Y-4+((i+1)%2)*2);}
    tri('#f4f7ff',[[X-14,Y-14],[X,Y-40],[X+14,Y-14]]);tri('#cfe4f4',[[X,Y-40],[X+14,Y-14],[X+4,Y-14]]);   /* the glacier tongue down to the water */
    ell(O,X,Y-8,55,10);ell('#2fb8c0',X,Y-8,54,9);ell('#5ad6d6',X-6,Y-10,40,6);ell('#8ef0ea',X-14,Y-11,18,2);
    box('#e8364b',X+16,Y-9,10,2);px('#5e3b20',X+20,Y-12,1,3);
    P.label(X,Y-64,'LAKE LOUISE');};
  P.w06t_elk=function(X,Y){shadow(X+8,Y+1,11,2);px(O,X-1,Y-12,18,8);px('#a8763c',X,Y-11,16,6);px('#e6d0a0',X-1,Y-10,3,4);px(O,X+1,Y-5,2,6);px(O,X+13,Y-5,2,6);
    px(O,X+13,Y-19,6,9);px('#5e3b20',X+14,Y-18,4,8);px(O,X+16,Y-22,7,5);px('#5e3b20',X+17,Y-21,5,3);
    const ant=(a)=>{line('#e6d0a0',1,[[X+18,Y-22],[X+18+a*2,Y-28],[X+18+a*6,Y-33]]);line('#e6d0a0',1,[[X+18+a*2,Y-28],[X+18+a*6,Y-27]]);line('#e6d0a0',1,[[X+18+a*4,Y-31],[X+18+a*8,Y-31]]);};ant(-1);ant(1);};
  P.w06t_goat=function(X,Y){shadow(X+10,Y+1,16,3);K.poly('#8a847a',[[X-8,Y],[X-4,Y-10],[X+10,Y-14],[X+26,Y-9],[X+30,Y]]);px('#b0aa9e',X-2,Y-10,22,2);
    px(O,X+2,Y-22,14,7);px('#ffffff',X+3,Y-21,12,5);px(O,X+3,Y-16,2,4);px(O,X+12,Y-16,2,4);px(O,X+13,Y-27,5,7);px('#ffffff',X+14,Y-26,3,5);px(O,X+14,Y-29,1,3);px(O,X+16,Y-29,1,3);px('#ffffff',X+14,Y-20,2,3);};
  /* a waterfall's rock wall (the water itself is the waterfall animation) */
  P.w06t_cliff=function(X,Y,w,h){shadow(X+w/2,Y+2,w/2+6,3);K.poly('#8a847a',[[X-4,Y],[X,Y-h+10],[X+6,Y-h],[X+w-6,Y-h-2],[X+w,Y-h+12],[X+w+4,Y]]);
    for(let y=Y-h+6;y<Y-4;y+=6)px('#76716a',X+2,y,w-4,2);px('#b0aa9e',X+2,Y-h+2,4,h-6);ell(O,X+w/2,Y-2,w/2+3,4);ell('#7fb0f0',X+w/2,Y-2,w/2+2,3);};
  P.w06t_pool=function(X,Y){ell(O,X,Y-2,11,4);ell('#7fb0f0',X,Y-2,10,3);ell('#cfe4ff',X-3,Y-3,4,1);px('#76716a',X-12,Y-3,3,3);px('#76716a',X+9,Y-4,4,3);};
  P.w06t_railTunnel=function(X,Y){shadow(X-40,Y+30,46,5);
    K.poly('#8a847a',[[X-86,Y+32],[X-74,Y-14],[X-50,Y-34],[X-24,Y-38],[X-4,Y-28],[X+6,Y-10],[X+8,Y+32]]);
    for(let y=Y-30;y<Y+28;y+=7)px('#76716a',X-72,y,74,2);px('#ffffff',X-50,Y-35,24,3);px('#ffffff',X-60,Y-28,10,2);px('#ffffff',X-20,Y-34,12,2);
    box('#c9c4b8',X-10,Y-14,12,16);px('#141018',X-8,Y-12,8,14);px('#141018',X-7,Y-13,6,1);};
  P.w06t_tramStation=function(X,Y){shadow(X+7,Y+1,9,2);box('#e8e2d2',X,Y-10,14,10);px(O,X-2,Y-14,18,5);px('#e8364b',X-1,Y-13,16,3);box('#cfeeff',X+3,Y-7,8,3);};
  /* ---- the two things the bus disappears into (overProps: drawn again over the bus while it is behind them) ---- */
  /* Rogers Pass snow shed: a long concrete gallery buried in snow; dark inside between the columns */
  P.w06t_shed=function(X1,Y,X2){const w=X2-X1;
    px(O,X1-1,Y-25,w+2,26);px('#262632',X1,Y-24,w,24);
    for(let x=X1;x<=X2-5;x+=13){px(O,x-1,Y-24,7,25);px('#bdb8ac',x,Y-24,5,24);px('#dcd8ce',x,Y-24,1,24);}
    px(O,X1-3,Y-31,w+6,8);px('#a8a49a',X1-2,Y-30,w+4,6);px('#c9c4b8',X1-2,Y-30,w+4,1);
    for(let x=X1-4;x<X2+4;x+=2){const h=4+Math.round(Math.sin(x/7)*1.5+hash(x,3)*1.5);px('#ffffff',x,Y-31-h,2,h);}px('#e2e8f6',X1-4,Y-33,w+8,2);
    px(O,X1-1,Y-1,w+2,2);px('#8a867c',X1,Y-1,w,1);};
  /* Yale Tunnel: a rocky bluff the highway runs straight through */
  P.w06t_bluff=function(X1,Y,X2){const G=g();const w=X2-X1,m=(X1+X2)/2;
    const pts=[[X1-4,Y],[X1-2,Y-22],[X1+8,Y-36],[X1+16,Y-50],[X1+32,Y-56],[X1+46,Y-68],[X1+62,Y-62],[m+4,Y-74],[m+26,Y-64],[X2-30,Y-60],[X2-16,Y-48],[X2-6,Y-32],[X2+2,Y-20],[X2+4,Y]];
    K.poly('#a8967e',pts);
    G.save();G.beginPath();pts.forEach(([a,b],i)=>i?G.lineTo(a,b):G.moveTo(a,b));G.closePath();G.clip();
    for(let y=Y-76;y<Y;y++){const k=((Math.floor((y+Math.sin(y/3)*2)/4))%4+4)%4;px(['#9a8a74','#b4a088','#7d6e5c','#a8967e'][k],X1-4,y,w+8,1);}
    for(let y=Y-76;y<Y;y++)px(y%5===0?'#4e4240':'#5e5048',m+14+Math.round(Math.sin(y/7)*4),y,w/2,1);
    [[X1+28,Y-46,10],[m-6,Y-58,12],[X2-40,Y-44,9]].forEach(([a,b,l])=>{for(let i=0;i<l;i++)px(O,a+Math.round(Math.sin(i)*1.5),b+i,1,1);});
    px('#d8c8b0',X1-2,Y-40,6,1);px('#d8c8b0',X1+30,Y-55,10,1);px('#d8c8b0',m-2,Y-72,8,1);G.restore();
    for(const[x,yy]of [[X1+20,Y-50],[X1+38,Y-60],[X1+56,Y-64],[m+14,Y-68],[X2-26,Y-58],[X2-12,Y-46]]){px('#123a22',x-4,yy-9,9,7);px('#2a6b3e',x-3,yy-8,7,5);px('#123a22',x-2,yy-13,5,5);px('#2a6b3e',x-1,yy-12,3,4);px('#5e3b20',x,yy-2,2,3);}
    [X1+12,X2-12].forEach(c=>{px(O,c-13,Y-32,26,33);px(O,c-11,Y-34,22,2);px('#c9c4b8',c-12,Y-31,24,31);px('#c9c4b8',c-10,Y-33,20,2);px('#e8e4da',c-10,Y-33,20,1);
      for(let r=0;r<28;r++){const iw=r<3?12-(3-r)*2:16;px('#141018',c-iw/2,Y-28+r,iw,1);}px('#2b2f45',c-8,Y-6,16,6);});};

  /* ================= ANIMATIONS ================= */
  A.w06t_windpump=function(t,X,Y){const G=g();for(let i=0;i<32;i+=2){const w=Math.round(10-i*0.22);px(O,X-w/2,Y-i,1,2);px(O,X+w/2,Y-i,1,2);if(i%8===0)px(O,X-w/2,Y-i,w+1,1);}
    px(O,X,Y-35,12,1);tri('#e8364b',[[X+10,Y-39],[X+16,Y-35],[X+10,Y-31]]);const a=t/260;
    for(let k=0;k<8;k++){const b=a+k*Math.PI/4;G.strokeStyle=O;G.lineWidth=3;G.beginPath();G.moveTo(X,Y-35);G.lineTo(X+Math.cos(b)*9,Y-35+Math.sin(b)*9);G.stroke();G.strokeStyle='#dfe5ee';G.lineWidth=1;G.beginPath();G.moveTo(X,Y-35);G.lineTo(X+Math.cos(b)*8,Y-35+Math.sin(b)*8);G.stroke();}
    px(O,X-1,Y-36,3,3);};
  A.w06t_turbine=function(t,X,Y){const G=g();px(O,X-2,Y-44,4,44);px('#f4f1e8',X-1,Y-44,2,44);const a=t/420+X;
    for(let k=0;k<3;k++){const b=a+k*2.094;G.strokeStyle=O;G.lineWidth=3;G.beginPath();G.moveTo(X,Y-45);G.lineTo(X+Math.cos(b)*15,Y-45+Math.sin(b)*15);G.stroke();G.strokeStyle='#ffffff';G.lineWidth=1;G.beginPath();G.moveTo(X,Y-45);G.lineTo(X+Math.cos(b)*14,Y-45+Math.sin(b)*14);G.stroke();}
    box('#f4f1e8',X-3,Y-48,6,5);};
  /* a V of birds flying west across [X, X+w] */
  A.w06t_birds=function(t,X,Y,w,n,sp){const u=((t*sp/1000+X*0.37)%1+1)%1,lead=X+w-u*(w+60)+30;for(let i=0;i<n;i++){const k=Math.abs(i-(n-1)/2),bx=Math.round(lead+k*7),by=Math.round(Y+k*4+Math.sin(t/300+i)*1.2);
    if(Math.floor(t/170+i)%2){px(O,bx-3,by,2,1);px(O,bx-1,by+1,2,1);px(O,bx+1,by,2,1);}else{px(O,bx-3,by+1,2,1);px(O,bx-1,by,2,1);px(O,bx+1,by+1,2,1);}}};
  A.w06t_sparkle=function(t,X,Y,rx,ry){for(let i=0;i<8;i++){const ph=(t/650+i*0.37)%1;if(ph>0.45)continue;const s=Math.floor(t/1300+i*0.3);const a=hash(i,s)*6.283,r=0.2+hash(i+5,s)*0.75;px('#ffffff',X+Math.cos(a)*rx*r,Y+Math.sin(a)*ry*r,ph<0.2?2:1,1);}};
  /* freight trains rolling west along the line and into the tunnel under Rogers Pass */
  const TRAINS=[{sp:0.075,ph:0,cars:12},{sp:0.075,ph:0.5,cars:9}];
  const CAR=['#8a5a32','#c8463e','#2f5a8a','#e8a020','#6b6f7a','#3f8a5a'];
  A.w06t_trains=function(t){const span=TLEN+16*14+60;for(const tr of TRAINS){const head=(t*tr.sp+tr.ph*span)%span;
    for(let k=tr.cars;k>=0;k--){const d=head-k*16;if(d<0||d>TLEN-14)continue;const[x0,y0]=tAt(d);const x=Math.round(x0),y=Math.round(y0);
      px(O,x-6,y-1,3,2);px(O,x+3,y-1,3,2);
      if(k===0){box('#c8463e',x-8,y-11,16,9);px('#f6c445',x-8,y-5,16,2);box('#c8463e',x-8,y-15,6,4);px('#cfeeff',x-7,y-14,4,2);px('#ffffff',x-9,y-9,1,2);px('#1b1220',x+2,y-14,3,3);}
      else{const c=CAR[(k*7+tr.cars)%CAR.length];box(c,x-7,y-10,14,8);px('rgba(255,255,255,.3)',x-7,y-10,14,1);px('rgba(0,0,0,.25)',x-7,y-4,14,1);if(k%3===1)for(let i=-5;i<6;i+=3)px('rgba(0,0,0,.25)',x+i,y-9,1,6);}}}};

  /* ================= THE MAP ================= */
  const lbl=(x,y,s)=>['w06t_lbl',x,y,s];
  K.W.push({ n:6.5, travel:true, ride:'bus', hud:'THE ROAD WEST', name:'The Road West: Drumheller to Vancouver',
    where:'The big road trip from Drumheller to Vancouver. The tour bus climbs out of the badlands, rolls across the prairie past wheat and canola fields and through a thunderstorm, passes Calgary\'s skyline off in the distance, crosses the rolling foothills into the Rocky Mountains past Banff and Lake Louise, over the BC border and through the snow shed at Rogers Pass in the snow, winds down the foggy Fraser Canyon and through a tunnel, then rolls across the green Fraser Valley into Vancouver in the rain.',
    marks:'Hoodoos and the Red Deer River, prairie wheat and canola fields, the grain elevator at Carbon, cattle, pumpjacks, a farm windmill and wind turbines, a prairie thunderstorm, the Calgary skyline with the Calgary Tower and the Bow, foothills ranches with horses, Banff and Mount Rundle, Lake Louise and the Victoria Glacier, an elk and a mountain goat, Takakkaw Falls, the BC border, the Rogers Pass snow shed, freight trains racing the bus into the mountain, the Fraser Canyon airtram, the Yale Tunnel, Hope, Golden Ears and the Fraser Valley farms.',
    size:[WW,WH], ground:'grass', water:'blue', cliff:'badlands',
    rivers:[RDR,FR1,FR2,FR3],
    zones:KEYS.map(k=>({k,f:(X,Y)=>ZK(X,Y)===k})),
    roads:[[[3488,142],...ENTRY,...MAIN.slice(1),...EXIT.slice(1),[-20,300]]],
    bridges:[[3322,236,'traffic']],
    entryPath:{from:[WW,142],via:ENTRY.slice(1,-1),road:1},
    exitPath:{to:[0,300],via:EXIT.slice(1,-1),road:1,ride:'bus'},
    stops:[{at:S0,name:'ROAD TRIP  LEAVING DRUMHELLER',st:'travel'},{at:S1,name:'ROAD TRIP  INTO VANCOUVER',st:'travel'}],
    edges:[[0,1,MAIN.slice(1,-1),{road:1}]],
    weather:[[2800,4200,'sun'],[2440,2800,'storm'],[1450,2440,'sun'],[960,1450,'snow'],[700,960,'fog'],[-4000,700,'rain']],
    overProps:[['w06t_shed',968,321,1122],['w06t_bluff',470,362,614]],
    props:[
      ['w06t_track',0,-1000],
      ['w06t_keep',1000,330],['w06t_keep',1070,330],['w06t_keep',1110,330],['w06t_keep',500,370],['w06t_keep',560,370],['w06t_keep',3300,248],
      /* badlands */
      ['dinoStatue',3192,N(3186,40)],['w06_hoodoo',3104,SB(3104)+10,1.6],['w06_hoodoo',3128,SB(3128)+16,1.2],['w06_hoodoo',3076,SB(3076)+14,1.4],
      ['w06t_sign',3150,SB(3150),'HIGHWAY 9 WEST','CALGARY'],lbl(3410,250,'RED DEER RIVER'),
      /* prairie */
      ['w06t_elevator',2904,N(2904,56),'CARBON'],['w06t_barn',2818,N(2818,40)],['w06t_silo',2860,N(2860,12)],['home',2876,N(2876,24),'#2a5bd7'],
      ['fence',2650,RY(2650)+24,22],['w06t_cow',2668,RY(2668)+36,'#1b1220'],['w06t_cow',2694,RY(2694)+42,'#8a5426'],['w06t_cow',2716,RY(2716)+35,'#f4f1e8'],['w06t_cow',2740,RY(2740)+41,'#1b1220'],
      ['w06t_bale',2990,RY(2990)+34],['w06t_bale',3004,RY(3004)+38],['w06t_bale',2560,RY(2560)+36],
      lbl(3030,232,'THE PRAIRIES'),lbl(2560,226,'PRAIRIE STORM'),
      /* Calgary, off to the north */
      ['w06t_skyline',2172,270],lbl(2232,272,'CALGARY'),['w06t_sign',2080,SB(2080),'TRANS-CANADA HWY 1','BANFF  VANCOUVER'],
      /* foothills */
      ['home',1924,N(1924,24),'#8a5426'],['w06t_barn',1954,N(1954,40),'#a8322e'],['w06t_rail',1846,RY(1846)+24,7],
      ['w06t_horse',1852,RY(1852)+40,'#8a5426'],['w06t_horse',1880,RY(1880)+44,'#3b2618'],['w06t_horse',1904,RY(1904)+38,'#e6d0a0'],
      ['w06t_bale',2010,RY(2010)+36],['w06t_bale',2024,RY(2024)+40],lbl(1990,238,'THE FOOTHILLS'),
      /* the Rockies */
      ['w06t_sign',1778,SB(1778),'BANFF','NATIONAL PARK','#6f4a26'],['w06t_elk',1700,RY(1700)+45],['w06t_elk',1666,RY(1666)+46],
      ['w06t_cabin',1582,N(1582,24)],['w06t_cabin',1610,N(1610,24),'#8a3a2a'],['w06t_cabin',1540,N(1540,24),'#2a5b8a'],lbl(1596,262,'BANFF'),lbl(1668,214,'MOUNT RUNDLE'),
      ['w06t_lakeLouise',1430,N(1355,150)],
      ['w06t_sign',1296,SB(1296),'WELCOME TO','BRITISH COLUMBIA','#2a5bd7'],lbl(1300,246,'KICKING HORSE PASS'),
      ['w06t_pool',1179,N(1170,20)+2],lbl(1180,206,'TAKAKKAW FALLS'),['w06t_goat',1146,N(1140,34)],
      lbl(1046,262,'ROGERS PASS'),['w06t_railTunnel',1056,Math.round(RY(1056)+52)],
      /* the Fraser Canyon */
      ['w06t_tramStation',710,Math.round(RY(716)+22)],['w06t_tramStation',684,404],lbl(810,252,'FRASER CANYON'),lbl(542,262,'YALE TUNNEL'),
      ['w06t_sign',396,SB(396),'WELCOME TO','HOPE'],
      /* the Fraser Valley */
      ['w06t_barn',290,N(290,40),'#c2414f'],['w06t_silo',330,N(330,12)],['home',232,N(232,24),'#2a5bd7'],
      ['w06t_cow',300,RY(300)+36,'#f4f1e8'],['w06t_cow',326,RY(326)+44,'#f4f1e8'],['w06t_cow',352,RY(352)+38,'#1b1220'],
      lbl(352,212,'GOLDEN EARS'),lbl(190,236,'FRASER VALLEY'),lbl(372,380,'FRASER RIVER'),
      ['w06t_sign',140,SB(140),'LANGLEY','VANCOUVER AHEAD']],
    scatter:[{k:'w06_hoodoo',n:34,zone:'w06t_bad'},{k:'rockpile',n:12,zone:'w06t_bad'},{k:'cactus',n:8,zone:'w06t_bad'},{k:'tree',n:26,zone:'w06t_flats'},
      {k:'w06t_bale',n:36,zone:'w06t_wheat'},{k:'bush',n:18,zone:'w06t_pasture'},{k:'tree',n:26,zone:'w06t_hillgrass'},{k:'tree',n:18,zone:'w06t_hills'},
      {k:'pine',n:240,zone:'w06t_forest'},{k:'snowpine',n:80,zone:'w06t_forestS'},{k:'pine',n:150,zone:'w06t_mforest'},{k:'pine',n:240,zone:'w06t_forestC'},
      {k:'tree',n:24,zone:'w06t_pasture2'},{k:'tree',n:10,zone:'grass'}],
    anim:[['w06t_trains'],['w06t_windpump',2794,N(2790,10)],['pumpjack',2596,Math.round(RY(2596)+45)],['pumpjack',2520,N(2520,30)],
      ['w06t_turbine',2470,N(2470,6)],['w06t_turbine',2436,N(2436,6)-14],['w06t_turbine',2402,N(2402,6)-28],
      ['storm',2742,Math.round(RY(2742)-112)],['storm',2626,Math.round(RY(2626)-120)],['storm',2512,Math.round(RY(2512)-108)],
      ['w06t_birds',2860,Math.round(RY(2900)-92),420,7,0.05],['w06t_birds',1900,Math.round(RY(1900)-100),300,5,0.06],['w06t_birds',40,206,380,5,0.045],
      ['smoke',1628,N(1610,24)-24],['smoke',1600,N(1582,24)-24],
      ['w06t_sparkle',1430,N(1355,150)-8,46,7],['waterfall',1176,N(1170,20)-70,70],['gondola',717,Math.round(RY(716)+10),691,392],
      ['canflag',1262,Math.round(RY(1262)+12)]] });
})(KINAN);

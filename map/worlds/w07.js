/* World 7: Vancouver (Kinan vs. Drizzle) */
(function(K){
  const {px,box,shadow,txt,hash,polyDist}=K; const g=()=>K.g();

  /* ---------- water bodies (also used to find the seawall band) ---------- */
  const INLET={pts:[[-20,338],[160,338],[240,334],[420,340],[600,336],[800,340],[1000,336],[1160,340]],w:24};
  const FCW={pts:[[100,620],[250,614],[360,608],[420,602]],w:18};          /* False Creek, west part */
  const FCN={pts:[[400,603],[470,594],[560,592],[620,596]],w:12};          /* north of Granville Island */
  const FCE={pts:[[600,596],[700,594],[790,588],[850,582]],w:16};          /* east part, ends at Science World */
  const LAG={pts:[[392,612],[432,648],[580,652]],w:9};                     /* water south of the island (closed at the east, like the real one) */
  const BAY=[0,560,160,220];                                               /* English Bay */
  const SOUND=[40,60,100,90];                                              /* Howe Sound */
  const RIV=[INLET,FCW,FCN,FCE,LAG];
  const ell=(X,Y,e)=>(Math.hypot((X-e[0])/e[2],(Y-e[1])/e[3])-1)*Math.min(e[2],e[3]);
  function wd(X,Y){let d=1e9;for(const r of RIV){const v=polyDist(r.pts,X,Y)-r.w;if(v<d)d=v;}const e=ell(X,Y,BAY);return e<d?e:d;}

  /* ---------- North Shore mountains painted as ground, so the trail shows on top ---------- */
  const GROUSE=[450,92,268,170];
  const MTS=[GROUSE,[700,130,262,110],[810,80,236,120],[1100,84,236,100],[960,64,232,120],[640,70,232,110],[150,60,220,110],[300,40,214,110]];
  for(let i=0;i<17;i++)MTS.push([i*72-20+(i%2)*14,-14+(i%3)*12,150,64,'d']);
  const alpine=(X,Y)=>Y<132+Math.sin(X/47)*18+Math.sin(X/19)*6;
  let mx=-9,my=-9,mr=null;
  function mtn(X,Y){if(X===mx&&Y===my)return mr;mx=X;my=Y;mr=null;
    for(const m of MTS){const[pX,pY,bY,hw]=m;const by=bY+Math.sin(X/13)*3;if(Y<pY||Y>by)continue;const t=(Y-pY)/(bY-pY);const half=hw*t;const dx=X-pX;if(Math.abs(dx)>half)continue;mr=[m,t,dx,half];break;}
    return mr;}
  function mtnCol(X,Y){const r=mtn(X,Y);if(!r)return '#4a9238';const[m,t,dx,half]=r;
    if(half-Math.abs(dx)<1.4&&t<0.86)return '#1b1220';
    const lit=dx<Math.sin(Y/5)*2;const h=hash(X>>1,Y>>1);
    if(m[4]==='d'){if(t<0.36+Math.sin(X/5)*0.04)return lit?'#f2f6ff':'#d2d9ee';return lit?(h>.9?'#c4cadc':'#b4bad0'):(h>.9?'#9aa0b8':'#8c92aa');}
    const sn=0.24+Math.sin(X/6)*0.03+Math.sin(X/2.3)*0.015;
    if(t<sn)return lit?'#f4f7ff':'#c9d2ea';
    if(t<0.5)return lit?(h>.9?'#b4aea2':'#a49e92'):(h>.9?'#8a847a':'#7c766c');
    if(m===GROUSE&&t<0.95){const y=Y-m[1];const r1=m[0]-18-(t-0.5)*60,r2=m[0]+22+(t-0.5)*40;if(Math.abs(X-r1)<2.2||Math.abs(X-r2)<1.8)return lit?'#f4f7ff':'#dfe6f4';}
    return lit?(h>.9?'#4f9a3e':'#3f8a34'):(h>.9?'#3a7a30':'#2e6a2a');}
  /* ---------- the Capilano canyon, painted as ground ---------- */
  const CAN={x:305,y1:150,y2:272};
  function canyon(X,Y){if(Y<CAN.y1||Y>CAN.y2)return null;const t=(Y-CAN.y1)/(CAN.y2-CAN.y1);const hw=4+13*Math.sin(Math.PI*Math.min(1,t*1.15));const cx=CAN.x+Math.sin(Y/16)*3;const d=X-cx,a=Math.abs(d);
    if(a>hw+1)return null;if(a>hw-0.6)return '#1b1220';if(a<1.6)return hash(X,Y>>1)>.7?'#e6f3ff':'#4a8ae0';
    const k=a/hw;if(d<0)return k>.72?'#b4a48e':k>.42?'#8f7f6c':'#5e5048';return k>.72?'#86766a':k>.42?'#685a4e':'#3e342e';}

  K.GROUND.w07_mtnF=mtnCol;K.GROUND.w07_mtnR=mtnCol;K.GROUND.w07_canyon=(X,Y)=>canyon(X,Y)||'#3a7a30';
  K.GROUND.w07_seawall=(X,Y)=>{if(wd(X,Y)>7.2)return '#8a8478';return (X%7===0||Y%4===0)?'#c4bdae':'#e6e0d2';};
  K.GROUND.w07_planks=(X,Y)=>(Y%4===0||(X+((Y>>2)*5))%14===0)?'#7a5430':'#c08a52';
  K.GROUND.w07_port=(X,Y)=>(X%40<2)?'#f6c445':(hash(X>>2,Y>>2)>.92?'#a8a49a':'#bdb9ae');
  K.GROUND.w07_cobble=(X,Y)=>(((X+((Y>>2)&1)*2)%5===0)||Y%4===0)?'#7a5a48':'#b08a70';
  K.GROUND.w07_alpine=(X,Y)=>hash(X>>1,Y>>1)>.9?'#7e8496':'#8c92aa';
  ['w07_mtnF','w07_mtnR','w07_canyon','w07_alpine'].forEach(k=>{K.RIM[k]='#7cc05a';K.LINE[k]='#1b3d14';});
  K.RIM.w07_seawall='#ffffff';K.LINE.w07_seawall='#3a3836';K.RIM.w07_planks='#e0b07a';K.LINE.w07_planks='#3b2618';
  K.RIM.w07_port='#e6e2d8';K.LINE.w07_port='#3a3836';K.RIM.w07_cobble='#d8b498';K.LINE.w07_cobble='#3b2618';

  /* ---------- props ---------- */
  K.P.w07_lbl=function(X,Y,s){K.P.label(X,Y,s);};
  /* border sign with a board as wide as its words (text is drawn sharp at runtime, 7px) */
  K.P.w07_sign=function(X,Y,a,b,col){const G=g();const w=Math.ceil(Math.max(K.textW(a,6),b?K.textW(b,6):0))+9;
    shadow(X+w/2,Y+1,w/2-4,2);px('#1b1220',X+5,Y-12,2,12);px('#1b1220',X+w-7,Y-12,2,12);box(col||'#2f7d32',X,Y-31,w,20);px('#ffffff',X+1,Y-30,w-2,1);
    txt(a,X+4,Y-28,'#ffffff',6,1);if(b)txt(b,X+4,Y-20,'#f6c445',6,1);};
  K.P.w07_chief=function(X,Y){const G=g();shadow(X+45,Y+2,50,5);
    G.fillStyle='#1b1220';G.beginPath();G.moveTo(X-2,Y+1);G.quadraticCurveTo(X+6,Y-76,X+46,Y-80);G.quadraticCurveTo(X+86,Y-72,X+93,Y+1);G.fill();
    G.fillStyle='#c8c6be';G.beginPath();G.moveTo(X,Y);G.quadraticCurveTo(X+8,Y-74,X+46,Y-78);G.quadraticCurveTo(X+84,Y-70,X+91,Y);G.fill();
    G.fillStyle='#a3a198';G.beginPath();G.moveTo(X+58,Y-76);G.quadraticCurveTo(X+84,Y-70,X+91,Y);G.lineTo(X+62,Y);G.fill();
    for(let i=0;i<6;i++)px('#8f8d85',X+12+i*13,Y-62+Math.abs(i-2.5)*6,2,54);
    px('#1b3d14',X+24,Y-80,40,4);px('#3f9636',X+26,Y-79,36,2);
    K.P.label(X+42,Y-4,'THE CHIEF');};
  K.P.w07_ropeBridge=function(X1,X2,Y){const L=X2-X1;
    for(let i=0;i<=L;i++){const s=Math.round(Math.sin(Math.PI*i/L)*3);const x=X1+i;
      px('#1b1220',x,Y-4+s,1,8);px(i%3===0?'#7a4a22':'#d0945a',x,Y-3+s,1,6);
      px('#1b1220',x,Y-8+s,1,3);px('#f0e0b0',x,Y-7+s,1,1);px('#1b1220',x,Y+4+s,1,3);px('#f0e0b0',x,Y+5+s,1,1);
      if(i%5===0){px('#f0e0b0',x,Y-6+s,1,2);px('#f0e0b0',x,Y+3+s,1,2);}}
    [X1-4,X2+1].forEach(x=>{box('#6f4a26',x,Y-13,4,20);px('#a8692e',x,Y-13,4,2);});};
  K.P.w07_canadaPlace=function(X,Y){const G=g();
    const sx=X+58,sy=Y-28;
    G.fillStyle='#1b1220';G.beginPath();G.moveTo(sx-2,sy-15);G.lineTo(sx+134,sy-15);G.lineTo(sx+122,sy+1);G.lineTo(sx+6,sy+1);G.fill();
    G.fillStyle='#ffffff';G.beginPath();G.moveTo(sx,sy-14);G.lineTo(sx+131,sy-14);G.lineTo(sx+121,sy);G.lineTo(sx+7,sy);G.fill();
    px('#2a3f8a',sx+7,sy-4,114,3);for(let i=0;i<19;i++)px('#2a5bd7',sx+12+i*6,sy-11,3,2);
    box('#f4f1e8',sx+18,sy-22,92,8);for(let i=0;i<14;i++)px('#7ec8ff',sx+21+i*6,sy-20,3,3);
    box('#f4f1e8',sx+32,sy-29,60,7);for(let i=0;i<9;i++)px('#7ec8ff',sx+35+i*6,sy-27,3,2);
    box('#e8364b',sx+74,sy-39,12,10);px('#ffffff',sx+74,sy-35,12,2);px('#1b1220',sx+74,sy-39,12,2);
    box('#bdb6a6',X,Y-24,124,24);px('#d8d2c4',X,Y-24,124,2);for(let i=2;i<124;i+=6)px('#6f6a60',X+i,Y-3,2,3);
    box('#ece8de',X+4,Y-18,116,12);for(let i=0;i<14;i++)px('#5a6fa0',X+8+i*8,Y-14,4,4);
    for(let i=0;i<5;i++){const s=X+4+i*23;G.fillStyle='#1b1220';G.beginPath();G.moveTo(s-1,Y-17);G.lineTo(s+11,Y-52);G.lineTo(s+24,Y-17);G.fill();
      G.fillStyle='#ffffff';G.beginPath();G.moveTo(s+1,Y-18);G.lineTo(s+11,Y-49);G.lineTo(s+22,Y-18);G.fill();
      G.fillStyle='#d6dde8';G.beginPath();G.moveTo(s+11,Y-49);G.lineTo(s+22,Y-18);G.lineTo(s+13,Y-18);G.fill();px('#1b1220',s+11,Y-56,1,6);}
    K.P.label(X+62,Y-6,'CANADA PLACE');};
  K.P.w07_steamClock=function(X,Y){shadow(X,Y+1,8,2);box('#5a3a22',X-5,Y-5,10,5);box('#7a5030',X-3,Y-28,6,23);px('#9a6a40',X-3,Y-28,2,23);
    box('#f4f1e8',X-2,Y-24,4,4);px('#1b1220',X,Y-23,1,2);px('#1b1220',X,Y-22,2,1);box('#7a5030',X-5,Y-32,10,4);px('#c9922f',X-1,Y-39,2,7);px('#c9922f',X-3,Y-33,6,1);
    K.P.label(X,Y+4,'GASTOWN STEAM CLOCK');};
  K.P.w07_crane=function(X,Y){const G=g();shadow(X+11,Y+1,16,3);const R='#e8364b',W='#f4f1e8';
    px('#1b1220',X-1,Y-48,4,49);px('#1b1220',X+19,Y-48,4,49);px(R,X,Y-47,2,47);px(R,X+20,Y-47,2,47);
    for(let i=0;i<4;i++){px('#1b1220',X,Y-12-i*10,22,2);px(W,X+1,Y-12-i*10,20,1);}
    G.strokeStyle='#1b1220';G.lineWidth=1;G.beginPath();G.moveTo(X+11,Y-66);G.lineTo(X-36,Y-52);G.moveTo(X+11,Y-66);G.lineTo(X+32,Y-52);G.stroke();
    px('#1b1220',X+9,Y-67,4,16);px(R,X+10,Y-66,2,14);
    px('#1b1220',X-38,Y-53,72,5);px(R,X-37,Y-52,70,3);px(W,X-37,Y-52,70,1);
    box(W,X+5,Y-46,12,6);px('#7ec8ff',X+7,Y-45,8,2);px('#1b1220',X-26,Y-47,1,12);box('#f6c445',X-30,Y-35,9,3);};
  K.P.w07_containers=function(X,Y,n){const cs=['#e8364b','#2a5bd7','#44c55a','#f6c445','#ff8a3d','#7a2fd0'];
    for(let r=0;r<2;r++)for(let i=0;i<n-r;i++){const c=cs[Math.floor(hash(X+i*7,Y+r*3)*6)];const bx=X+i*15+r*7;box(c,bx,Y-7-r*7,13,6);px('rgba(0,0,0,.22)',bx+3,Y-6-r*7,1,4);px('rgba(0,0,0,.22)',bx+7,Y-6-r*7,1,4);px('rgba(255,255,255,.35)',bx,Y-7-r*7,13,1);}};
  function sailboat(X,Y){const G=g();box('#ffffff',X,Y-3,12,3);px('#2a5bd7',X,Y-1,12,1);px('#1b1220',X+5,Y-13,1,10);G.fillStyle='#f4f1e8';G.beginPath();G.moveTo(X+6,Y-13);G.lineTo(X+11,Y-5);G.lineTo(X+6,Y-5);G.fill();}
  K.P.w07_pier=function(X,Y,len){px('#1b1220',X-1,Y-len,6,len);px('#b8844e',X,Y-len,4,len);for(let i=0;i<len;i+=4)px('#7a5430',X,Y-len+i,4,1);
    for(let i=8;i<len;i+=10){sailboat(X-15,Y-len+i);sailboat(X+7,Y-len+i+4);}};
  K.P.w07_floatplane=function(X,Y){px('#1b1220',X-1,Y-2,22,3);px('#dfe5ee',X,Y-1,20,1);px('#1b1220',X+4,Y-6,1,4);px('#1b1220',X+15,Y-6,1,4);
    box('#ffffff',X+2,Y-10,17,5);px('#e8364b',X+2,Y-7,17,1);px('#7ec8ff',X+14,Y-9,3,2);box('#e8364b',X+1,Y-15,3,5);box('#f6c445',X+5,Y-13,14,2);};
  K.P.w07_seabusTerm=function(X,Y){shadow(X,Y+1,14,2);box('#cfd6e2',X-12,Y-11,24,11);px('#7ec8ff',X-10,Y-8,20,3);px('#1b1220',X-14,Y-15,28,5);px('#2a5bd7',X-13,Y-14,26,3);};
  K.P.w07_lonsdale=function(X,Y){shadow(X+20,Y+1,22,3);box('#f6ead2',X,Y-13,40,13);px('#1b1220',X-2,Y-19,44,7);px('#c2414f',X-1,Y-18,42,5);for(let i=0;i<4;i++)box('#f6c445',X+4+i*9,Y-9,5,5);};
  K.P.w07_gondolaBase=function(X,Y){shadow(X,Y+1,12,2);box('#8a5a32',X-9,Y-10,18,10);px('#1b1220',X-11,Y-15,22,6);px('#3f6b4a',X-10,Y-14,20,4);box('#cfeeff',X-6,Y-7,4,4);};
  K.P.w07_granville=function(X,Y){
    px('#1b1220',X-2,Y-2,88,5);px('#c08a52',X-1,Y-1,86,3);for(let i=0;i<86;i+=6)px('#3b2618',X+i,Y+2,2,5);
    shadow(X+42,Y,44,3);box('#e8dcc4',X+3,Y-15,78,14);px('#1b1220',X,Y-23,84,9);px('#c2414f',X+1,Y-22,82,7);for(let i=0;i<82;i+=4)px('#9e2a3a',X+1+i,Y-22,1,7);px('#ef7380',X+1,Y-22,82,1);
    for(let i=0;i<6;i++){box('#f6c445',X+7+i*12,Y-11,7,7);px('#ff8a3d',X+7+i*12,Y-5,7,1);}
    box('#1b1220',X+24,Y-32,38,9);txt('MARKET',X+27,Y-31,'#ff5a5a',7,1);
    sailboat(X+88,Y-1);sailboat(X+20,Y+12);};
  K.P.w07_silos=function(X,Y){[['#e8364b','#f6c445'],['#2a5bd7','#44c55a'],['#ff6fae','#7ec8ff']].forEach(([a,b],i)=>{const sx=X+i*10;box('#d8d2c4',sx,Y-26,8,26);px(a,sx,Y-22,8,7);px(b,sx+2,Y-15,4,6);px('#1b1220',sx+3,Y-20,1,1);px('#1b1220',sx+5,Y-20,1,1);px('#ffffff',sx,Y-26,8,2);});};
  K.P.w07_scienceWorld=function(X,Y){const G=g();shadow(X,Y+2,30,5);
    box('#9aa3b2',X-24,Y-8,48,8);px('#c9d0dc',X-24,Y-8,48,2);for(let i=-20;i<=20;i+=8)px('#6f7889',X+i,Y-6,3,6);
    const cy=Y-32,R=24;G.fillStyle='#1b1220';G.beginPath();G.arc(X,cy,R+1.5,0,Math.PI*2);G.fill();
    for(let yy=-R;yy<=R;yy++)for(let xx=-R;xx<=R;xx++){if(xx*xx+yy*yy>R*R)continue;
      const a=((Math.round(xx+yy*0.58)+700)%7),b=((Math.round(xx-yy*0.58)+700)%7),c=((yy+600)%6);
      let col=(xx+yy<-8)?'#f4f7fb':(xx+yy<14)?'#d6dde8':'#aeb8c8';if(a===0||b===0||c===0)col=(xx+yy<0)?'#b8c2d2':'#8a96a8';px(col,X+xx,cy+yy,1,1);}
    px('#ffffff',X-13,cy-15,6,4);px('#ffffff',X-15,cy-10,3,3);K.P.label(X,Y-66,'SCIENCE WORLD');};
  K.P.w07_totems=function(X,Y){[[0,22],[7,28],[14,20]].forEach(([o,h])=>{const x=X+o;shadow(x+2,Y+1,4,1);px('#1b1220',x-1,Y-h-1,6,h+1);
      for(let k=0;k<h;k+=6){px(['#e8364b','#2a8a8a','#f6c445','#1b1220'][(k/6+o)%4],x,Y-h+k,4,5);px('#ffffff',x+1,Y-h+k+1,1,1);px('#ffffff',x+3,Y-h+k+1,1,1);}
      px('#1b1220',x-4,Y-h-1,12,3);px('#2a8a8a',x-3,Y-h,10,1);});K.P.label(X+9,Y+4,'TOTEM POLES');};
  K.P.w07_lighthouse=function(X,Y){shadow(X,Y+1,5,2);box('#ffffff',X-3,Y-16,6,16);px('#e8364b',X-3,Y-10,6,2);box('#e8364b',X-4,Y-21,8,5);px('#fff3c4',X-2,Y-20,4,2);};
  K.P.w07_siwash=function(X,Y){box('#86807a',X-5,Y-18,10,18);px('#a8a296',X-5,Y-18,3,18);px('#2f7a2c',X-3,Y-24,6,6);px('#1b3d14',X-1,Y-27,2,4);K.P.label(X,Y+6,'SIWASH ROCK');};
  K.P.w07_inukshuk=function(X,Y){shadow(X,Y+1,8,2);box('#9a968c',X-6,Y-8,4,8);box('#9a968c',X+2,Y-8,4,8);box('#b4aea2',X-7,Y-12,14,4);box('#9a968c',X-11,Y-15,22,3);box('#b4aea2',X-4,Y-21,8,6);K.P.label(X,Y+4,'INUKSHUK');};
  K.P.w07_lionsGate=function(X,Y1,Y2){const L=Y2-Y1;
    px('#1f6a3e',X-11,Y1,2,L);px('#1f6a3e',X+9,Y1,2,L);
    [Y1+Math.round(L*0.25),Y1+Math.round(L*0.75)].forEach(ty=>{px('#1b1220',X-16,ty-4,32,8);px('#2f9a5a',X-15,ty-3,30,6);px('#7fe0a4',X-15,ty-3,30,1);px('#1b1220',X-3,ty-2,6,4);});
    [[X-16,Y2+1],[X+11,Y2+1]].forEach(([a,b])=>{box('#d8b878',a,b,6,4);px('#b8944e',a+4,b-2,2,2);});
    K.P.label(X-60,Y1+8,'LIONS GATE BRIDGE');};

  /* ---------- animations ---------- */
  K.A.w07_seabus=function(t,X1,Y1,X2,Y2){const u=(Math.sin(t/2600)+1)/2;const X=X1+(X2-X1)*u,Y=Y1+(Y2-Y1)*u;box('#f4f1e8',X-9,Y-4,18,7);px('#1b1220',X-7,Y-2,14,2);px('#f6c445',X-9,Y+2,18,1);px('#2a5bd7',X-4,Y-7,8,3);};
  K.A.w07_aquabus=function(t,X1,X2,Y){const u=(Math.sin(t/3000)+1)/2;const X=X1+(X2-X1)*u;box('#ffffff',X-6,Y-3,12,4);['#e8364b','#f6c445','#44c55a','#2a5bd7'].forEach((c,i)=>px(c,X-5+i*3,Y-5,3,2));};
  K.A.w07_turbine=function(t,X,Y){const G=g();px('#1b1220',X-1,Y-30,3,30);px('#ffffff',X,Y-30,1,30);const a=t/300;
    for(let k=0;k<3;k++){const b=a+k*2.094;G.strokeStyle='#1b1220';G.lineWidth=3;G.beginPath();G.moveTo(X+.5,Y-31);G.lineTo(X+.5+Math.cos(b)*11,Y-31+Math.sin(b)*11);G.stroke();G.strokeStyle='#ffffff';G.lineWidth=1;G.beginPath();G.moveTo(X+.5,Y-31);G.lineTo(X+.5+Math.cos(b)*10,Y-31+Math.sin(b)*10);G.stroke();}
    box('#ffffff',X-2,Y-33,4,4);};

  /* ---------- the world ---------- */
  /* ---------- downtown: blocks packed with blue-green glass towers of mixed heights ---------- */
  const GLASS=['#5fa8b8','#4a8aa8','#7ab4c8','#3f7a96','#4f9a9a','#6bbcb4','#2f6f88','#5a9ab8','#88c4cc','#3a8a8a','#4a94a4','#6aa8c4'];
  K.P.w07_glass=function(X,Y,w,h,c,v){const G=g();shadow(X+w/2,Y+1,w*0.6,2);const top=(v>>2)&3,face=v&3;let bh=h;
    if(top===1){bh=h-9;box(c,X+3,Y-h,w-6,10);px('rgba(255,255,255,.3)',X+3,Y-h,w-6,1);}
    if(top===2){bh=h-7;K.poly(c,[[X,Y-bh+1],[X+w,Y-h],[X+w,Y-bh+1]]);}
    box(c,X,Y-bh,w,bh);px('rgba(255,255,255,.3)',X,Y-bh,w,1);px('rgba(255,255,255,.26)',X,Y-bh,2,bh);px('rgba(0,0,0,.17)',X+w-3,Y-bh,3,bh);
    if(face===0){for(let yy=Y-bh+3;yy<Y-4;yy+=4)for(let xx=X+3;xx<X+w-3;xx+=4)px('#e6fbff',xx,yy,2,2);}
    else if(face===1){for(let xx=X+3;xx<X+w-2;xx+=3)px('rgba(230,251,255,.5)',xx,Y-bh+2,1,bh-4);}
    else if(face===2){for(let yy=Y-bh+3;yy<Y-3;yy+=4)px('rgba(230,251,255,.6)',X+1,yy,w-2,1);}
    else{for(let yy=Y-bh+2;yy<Y-3;yy+=5)px('rgba(230,251,255,.42)',X+1,yy,w-2,2);for(let i=0;i<Math.min(w,bh)-4;i++)px('rgba(255,255,255,.4)',X+2+i*0.6,Y-bh+6+i,2,1);}
    if(top===3){px('#1b1220',X+Math.floor(w/2),Y-h-10,1,10);px('#e8364b',X+Math.floor(w/2)-1,Y-h-11,3,2);}};
  /* Vancouver House at the foot of the Granville Bridge: narrow at the bottom, wide at the top */
  K.P.w07_vanHouse=function(X,Y){const G=g();shadow(X,Y+1,9,2);const H=76;
    K.poly('#5a9ab8',[[X-5,Y],[X-14,Y-H],[X+14,Y-H],[X+5,Y]]);
    for(let k=4;k<H-2;k+=4){const hw=5+9*k/H;px('rgba(230,251,255,.55)',X-hw+1,Y-k,hw*2-2,1);}
    G.fillStyle='rgba(255,255,255,.28)';G.beginPath();G.moveTo(X-5,Y-1);G.lineTo(X-13,Y-H+1);G.lineTo(X-9,Y-H+1);G.lineTo(X-2,Y-1);G.fill();};
  const towers=[];
  const block=(x0,x1,rows,seed)=>rows.forEach(([by,hmin,hmax],ri)=>{let x=x0+Math.round(hash(seed,ri)*5),k=0;
    for(;;){const w=12+Math.round(hash(seed+ri*7,k)*9);if(x+w>x1)break;
      towers.push(['w07_glass',x,by+Math.round(hash(k,ri+seed)*3),w,hmin+Math.round(hash(seed+3,ri*31+k)*(hmax-hmin)),GLASS[Math.floor(hash(seed+ri,k*3+1)*GLASS.length)],Math.floor(hash(k+seed,ri+9)*16)]);
      x+=w+1+Math.round(hash(seed,k+ri)*2);k++;}});
  block(336,477,[[414,26,38],[438,38,62],[462,50,86]],11);                                    /* Burrard to Granville, north of Georgia (tops stay below the SeaBus terminal) */
  block(338,474,[[496,50,92],[522,60,112],[548,50,100]],23);block(338,438,[[572,30,58]],29);  /* Burrard to Granville, south of Georgia */
  block(488,637,[[420,28,54],[446,40,88],[472,50,104],[498,50,112],[524,40,100],[550,36,80]],37);   /* east of Granville */
  block(652,701,[[500,30,48],[530,40,80],[560,40,100]],51);                                   /* Yaletown, kept below the SkyTrain line */
  block(276,326,[[494,30,60],[518,40,76],[542,36,64]],63);                                    /* the West End */
  towers.push(['w07_glass',704,430,14,56,'#4a8aa8',5],['w07_glass',720,432,14,44,'#6bbcb4',2],['w07_vanHouse',462,586]);
  const H=(xs,y,c)=>xs.map((x,i)=>[x,y+(i%2)*2,c[i%c.length]]);
  const roofs=['#e8364b','#2a5bd7','#8a5426','#44c55a'];
  K.W.push({n:7,hud:'VANCOUVER',name:'Kinan vs. Drizzle',
    where:'A rainy day in Vancouver: in on the mountain highway, round the Stanley Park seawall, over the Lions Gate to the North Shore mountains, back across the harbour on the SeaBus, then Granville Island, Science World and the SkyTrain to Canada Place, where a cargo plane waits to fly him east.',
    marks:'Stanley Park and its stone seawall, Siwash Rock, the Brockton Point totem poles, the green Lions Gate Bridge, the Capilano Suspension Bridge over its canyon, Grouse Mountain with its gondola and wind turbine, the Stawamus Chief and Shannon Falls (secret), Lonsdale Quay and the SeaBus, the Coal Harbour seaplanes, Canada Place and its five sails with a cruise ship, Harbour Centre, the Gastown steam clock, the port cranes, the Burrard and Granville bridges, Granville Island market on the water, BC Place, Science World, the SkyTrain and the English Bay inukshuk.',
    size:[1140,860],ground:'grass',water:'dark',cliff:'rock',path:'tan',
    rivers:[INLET,FCW,FCN,FCE,LAG],lakes:[BAY,SOUND],
    zones:[
      {k:'w07_canyon',f:(X,Y)=>canyon(X,Y)!==null},
      {k:'w07_mtnR',f:(X,Y)=>{const r=mtn(X,Y);return !!r&&r[1]<0.5;}},
      {k:'w07_mtnF',f:(X,Y)=>!!mtn(X,Y)},
      {k:'w07_alpine',f:alpine},
      {k:'w07_planks',r:[432,598,168,50]},
      {k:'w07_port',r:[700,350,460,36]},
      {k:'w07_seawall',f:(X,Y)=>Y>350&&X<880&&wd(X,Y)<9},
      {k:'w07_cobble',r:[740,398,160,46]},
      {k:'sand',f:(X,Y)=>X<310&&Y>496&&Y<600&&wd(X,Y)<24},
      {k:'paved',f:(X,Y)=>X>268&&X<330&&Y>474&&Y<560&&wd(X,Y)>10},   /* the West End */
      {k:'forest',e:[200,420,125,72]},
      {k:'paved',e:[600,480,275,118]}],
    roads:[[[-20,278],[1160,278]],                                   /* Marine Drive, North Shore */
      [[480,470],[330,470],[290,458],[262,436],[250,410],[242,380],[240,358],[240,278]],   /* Georgia St + the park causeway onto the Lions Gate */
      [[330,392],[1160,392]],                                        /* Cordova St along the harbour */
      [[330,392],[330,860]],                                         /* Burrard St + Burrard Bridge */
      [[480,372],[480,860]],                                         /* Granville St + Granville Bridge */
      [[1160,720],[330,720]],                                        /* Highway 1 */
      [[1000,392],[1000,860]]],                                      /* Clark Dr */
    bridges:[[240,334,'suspension'],[330,610,'arches'],[480,594,'traffic'],[480,650,'traffic']],
    J:{B:[330,720],BN:[330,582],C:[250,410],LQ:[520,305],WF:[480,372],GI:[480,624],MS:[905,535]},
    /* one journey: the tour bus from Drumheller rolls in on the Trans-Canada, the cargo plane leaves east over the port */
    entryPath:{from:[1140,720],via:[],road:1},
    exitPath:{to:[1140,392],via:[],road:1,ride:'plane'},
    stops:[
      {at:[600,720],name:'7-1  THE MOUNTAIN HIGHWAY',st:'open'},
      {at:[205,576],name:'7-2  THE SEAWALL',st:'lock'},
      {at:[195,425],name:'7-3  STANLEY PARK FOREST',st:'lock'},
      {at:[240,334],name:'7-4  THE LIONS GATE BRIDGE',st:'lock'},
      {at:[307,220],name:'7-5  CAPILANO SUSPENSION BRIDGE',st:'lock'},
      {at:[450,104],name:'FORT  GROUSE MOUNTAIN TOP',st:'fort'},
      {at:[372,92],name:'SECRET  SEA-TO-SKY AND THE CHIEF',st:'secret'},
      {at:[518,626],name:'7-6  GRANVILLE ISLAND',st:'lock'},
      {at:[890,634],name:'7-7  SCIENCE WORLD',st:'lock'},
      {at:[780,490],name:'7-8  THE SKYTRAIN',st:'lock'},
      {at:[652,392],name:'CASTLE  THE BIG STORM AT CANADA PLACE  -  DRIZZLE',st:'boss'}],
    edges:[[0,'B',[],{road:1}],['B','BN',[[330,610]],{road:1}],['BN',1,[[300,578],[255,574]]],
      [1,2,[[180,540],[178,490],[178,452]]],[2,'C',[[222,418]]],['C',3,[[242,380],[240,358]],{road:1}],
      [3,4,[[240,300],[244,282],[262,250],[282,224]]],[4,5,[[334,219],[372,206],[400,170],[426,126]]],
      [5,6,[[412,90]]],
      [5,'LQ',[[492,135],[528,195],[530,250]]],['LQ','WF',[],{style:'glass'}],['WF','GI',[[480,594]],{road:1}],['GI',7,[]],
      [7,8,[[565,630],[610,642],[660,630],[760,622],[850,625]]],[8,'MS',[[945,628],[952,575]]],['MS',9,[]],[9,10,[[700,440]]]],
    exit:[1100,392],
    props:[
      ['w07_chief',276,86],['w07_ropeBridge',284,331,220],['w07_gondolaBase',490,262],['w07_lonsdale',535,300],['w07_seabusTerm',470,372],
      ['w07_lionsGate',240,309,360],['w07_canadaPlace',545,362],['harbourCentre',742,420],['w07_steamClock',885,442],['shops',776,438,3],
      ['w07_crane',830,384],['w07_crane',930,384],['w07_crane',1030,384],['w07_containers',856,384,4],['w07_containers',956,384,4],['w07_containers',1058,384,5],
      ['w07_pier',345,362,26],['w07_pier',382,363,24],['w07_floatplane',408,352],['w07_floatplane',438,346],
      ['w07_totems',292,384],['w07_lighthouse',320,372],['w07_siwash',80,440],['w07_inukshuk',262,562],
      ['w07_granville',500,617],['w07_silos',442,640],['w07_scienceWorld',905,612],['bcPlace',740,562],
      ['mountain',1030,712,110,90],['mountain',960,860,110,80],['mountain',1050,862,100,96],
      ['w07_sign',1078,758,'WELCOME TO','VANCOUVER'],['w07_sign',1078,428,'TO WORLD 8','TORONTO','#2a5bd7'],
      ...towers,
      ['w07_lbl',150,380,'STANLEY PARK'],['w07_lbl',108,470,'SEAWALL'],['w07_lbl',70,560,'ENGLISH BAY'],['w07_lbl',385,600,'FALSE CREEK'],['w07_lbl',950,296,'BURRARD INLET'],
      ['w07_lbl',50,56,'HOWE SOUND'],['w07_lbl',256,6,'SHANNON FALLS'],['w07_lbl',388,56,'SEA TO SKY'],['w07_lbl',285,186,'CAPILANO SUSPENSION BRIDGE'],
      ['w07_lbl',430,240,'GROUSE MOUNTAIN'],['w07_lbl',555,300,'LONSDALE QUAY'],['w07_lbl',524,328,'SEABUS'],['w07_lbl',425,300,'SEAPLANES'],
      ['w07_lbl',700,356,'HARBOUR CENTRE'],['w07_lbl',960,400,'PORT OF VANCOUVER'],['w07_lbl',560,564,'GRANVILLE ISLAND'],['w07_lbl',840,520,'SKYTRAIN'],['w07_lbl',1056,690,'TRANS-CANADA HWY'],
      ...K.homes([...H([10,40,70,100,130,160,190],270,roofs),...H([600,630,660,690,720,750,780,810,840,870,900,930,960,990,1020,1050,1080,1110],270,roofs),
        ...H([340,370,400,430,500,530,560,640,670,700,730,760,790,820,850,880,910,940],704,roofs),
        ...H([170,200,230,260,290],680,roofs),...H([170,200,230,260,290],740,roofs),...H([170,200,230,260,290],800,roofs),
        ...H([345,375,405,435,500,530,560,590,620,650,680,710,740,770,800,830,860,890,920,950],770,roofs),
        ...H([345,375,405,435,500,530,560,590,620,650,680,710,740,770,800,830,860,890,920],830,roofs),
        ...H([920,950,1020,1050,1080,1110],462,roofs),...H([1020,1050,1080,1110],520,roofs)])],
    scatter:[{k:'pine',n:300,zone:'forest'},{k:'pine',n:160,zone:'w07_mtnF'},{k:'snowpine',n:8,zone:'w07_mtnR'},{k:'snowpine',n:14,zone:'w07_alpine'},{k:'tree',n:50,zone:'grass'}],
    anim:[['skytrain',[[652,390],[700,440],[780,490],[905,535],[1010,560],[1160,582]]],['gondola',458,116,490,254],['w07_turbine',486,122],
      ['waterfall',258,30,54],['w07_seabus',515,314,486,360],['w07_aquabus',420,820,594],['seaplane',520,330],
      ['boat',90,520,0],['boat',60,620,1],['boat',60,96,2],['boat',800,328,3],['boat',300,346,4],['storm',612,262],['steam',885,404]],
    fx:'rain'});
})(KINAN);

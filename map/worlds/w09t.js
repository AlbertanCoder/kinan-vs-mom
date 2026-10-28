/* Road-trip map: Boat to Niagara (Montreal to Niagara Falls).
   Map points the real way: Montreal at the top right, Lake Ontario across the middle, Niagara at the bottom left.
   The tour boat comes out of Montreal up the St. Lawrence (through a Seaway lock), weaves through the Thousand Islands
   and under the Thousand Islands Bridge, passes Kingston, crosses Lake Ontario with Toronto small on the far shore,
   and turns up the Niagara River, which narrows and turns green on the way to the falls in World 10. */
(function(K){
  const {px,box,shadow,txt,hash}=K; const g=()=>K.g();
  const O='#1b1220';

  /* ---------- water ---------- */
  /* a river whose width changes smoothly from w0 (first point) to w1 (last point) */
  const taper=(pts,w0,w1)=>{const n=pts.length-1,o=[];for(let i=0;i<n;i++)o.push({pts:[pts[i],pts[i+1]],w:Math.round(w0+(w1-w0)*i/Math.max(1,n-1))});return o;};
  /* St. Lawrence: 72 px wide where it meets World 9 (same as World 9's narrowed river), widening toward the Thousand Islands */
  const STL=taper([[1620,200],[1540,202],[1470,214],[1400,236],[1350,250],[1280,252],[1230,266],[1195,288]],36,44);
  /* Niagara River: 68 px at the lake, narrowing to 52 px where it meets World 10's upper river */
  const NIA=taper([[308,462],[304,496],[290,526],[262,546],[210,556],[150,553],[90,546],[30,542],[-20,542]],34,26);
  /* the Lachine Canal and the rail line run out of World 9's left edge, so they carry on here */
  const CANAL={pts:[[1620,110],[1560,113],[1510,125],[1472,150],[1452,180]],w:5};
  const RAIL=[[1600,98],[1500,98],[1400,104],[1300,122],[1200,150],[1100,180],[1000,200],[900,206],[760,204],[600,210],[460,214],[380,206],[300,194],[200,190],[-10,190]];
  /* soft-edged patches for forests and vineyards */
  const blob=L=>(X,Y)=>L.some(([cx,cy,rx,ry])=>((X-cx)/rx)**2+((Y-cy)/ry)**2<1+0.18*Math.sin(X/19+cy)+0.14*Math.sin(Y/15+cx));
  const LAKES=[[430,380,300,118],[760,338,240,92],[1090,326,135,62]];     /* Lake Ontario (west, east) and the wide river of the Thousand Islands */

  /* ---------- ground ---------- */
  K.GROUND.w09t_vines=(X,Y)=>Y%9<3?(hash(X>>1,Y>>2)>.6?'#4f9a3a':'#2f7a2c'):(hash(X>>2,Y>>2)>.9?'#b8894e':'#c9a46a');
  K.RIM.w09t_vines='#e0c48a'; K.LINE.w09t_vines='#5e3b20';

  /* ---------- props ---------- */
  K.P.w09t_lbl=function(X,Y,s){K.P.label(X,Y,s);};
  /* a small island drawn the same way the engine draws land: dark outline, light rim, rock cliff on the south side, foam on the north */
  K.P.w09t_isle=function(X,Ytop,rx,ry,seed){const cx=X,cy=Ytop+ry,CL=7,cl=K.CLIFFS.rock,wat=K.WATER.blue;
    const inS=(x,y)=>{const a=(x-cx)/rx,b=(y-cy)/ry;return a*a+b*b<1+0.12*Math.sin((x-cx)*0.5+seed)+0.08*Math.sin((y-cy)*0.8+seed*1.7);};
    for(let y=Math.floor(cy-ry-4);y<=cy+ry+CL+4;y++)for(let x=Math.floor(cx-rx-4);x<=cx+rx+4;x++){let c=null;
      if(inS(x,y)){c=K.GROUND.grass(x,y);if(!inS(x,y-2)||!inS(x-2,y)||!inS(x+2,y))c=K.RIM.grass;if(!inS(x-1,y)||!inS(x+1,y)||!inS(x,y-1)||!inS(x,y+1))c=K.LINE.grass;}
      else{let d=0;for(let k=1;k<=CL;k++)if(inS(x,y-k)){d=k;break;}
        if(d)c=cl[d<=1?0:d<=2?1:d<=4?2:d<=6?3:4];else if(inS(x,y-CL-1)||inS(x,y-CL-2))c=wat.edge;else if(inS(x,y+1)||inS(x,y+2)||inS(x,y+3))c=wat.foam;}
      if(c)px(c,x,y,1,1);}};
  K.P.w09t_cottage=function(X,Y,roof){shadow(X+6,Y+1,8,2);box('#f2e6cc',X,Y-7,12,7);px(O,X-2,Y-12,16,6);px(roof||'#e8364b',X-1,Y-11,14,4);box('#7ec8ff',X+2,Y-5,3,3);px('#8a5426',X+7,Y-4,3,4);};
  K.P.w09t_light=function(X,Y){const G=g();shadow(X,Y+1,5,2);G.fillStyle=O;G.beginPath();G.moveTo(X-5,Y+1);G.lineTo(X-3,Y-20);G.lineTo(X+3,Y-20);G.lineTo(X+5,Y+1);G.fill();
    G.fillStyle='#ffffff';G.beginPath();G.moveTo(X-4,Y);G.lineTo(X-2,Y-19);G.lineTo(X+2,Y-19);G.lineTo(X+4,Y);G.fill();px('#e8364b',X-3,Y-12,6,3);px('#d8d2c4',X+1,Y-19,2,19);
    box('#fff3c4',X-3,Y-25,6,4);px(O,X-4,Y-28,8,3);px('#e8364b',X-3,Y-27,6,2);};
  /* Boldt Castle on Heart Island: grey stone, steep dark roofs, a round tower */
  K.P.w09t_boldt=function(X,Y){const G=g();shadow(X,Y+1,16,3);const S='#c4b49a',D='#a8987c',R='#5a5f6e';
    box(S,X-12,Y-12,24,12);for(let i=0;i<4;i++)box('#4a5a7a',X-9+i*6,Y-9,2,4);px(D,X-12,Y-4,24,1);
    G.fillStyle=O;G.beginPath();G.moveTo(X-14,Y-11);G.lineTo(X-8,Y-19);G.lineTo(X+8,Y-19);G.lineTo(X+14,Y-11);G.fill();G.fillStyle=R;G.beginPath();G.moveTo(X-12,Y-12);G.lineTo(X-7,Y-18);G.lineTo(X+7,Y-18);G.lineTo(X+12,Y-12);G.fill();
    box(S,X-4,Y-26,8,10);box('#4a5a7a',X-1,Y-23,2,3);G.fillStyle=O;G.beginPath();G.moveTo(X-6,Y-25);G.lineTo(X,Y-34);G.lineTo(X+6,Y-25);G.fill();G.fillStyle=R;G.beginPath();G.moveTo(X-4,Y-26);G.lineTo(X,Y-32);G.lineTo(X+4,Y-26);G.fill();
    box(S,X+9,Y-20,6,14);G.fillStyle=O;G.beginPath();G.moveTo(X+7,Y-19);G.lineTo(X+12,Y-27);G.lineTo(X+17,Y-19);G.fill();G.fillStyle='#7a2f2f';G.beginPath();G.moveTo(X+9,Y-20);G.lineTo(X+12,Y-25);G.lineTo(X+15,Y-20);G.fill();
    px(O,X,Y-40,1,6);px('#e8364b',X+1,Y-40,4,2);};
  /* the Seaway lock: a dam across the river with a lock chamber in the middle; the gates stand open for Kinan's boat */
  K.P.w09t_lock=function(X,Y,top,bot){const C='#c9c4b8',L='#e8e4da',S='#4a5160';
    px(O,X-5,top,10,bot-top);px(C,X-4,top,8,bot-top);px(L,X-4,top,2,bot-top);
    for(let y=top+3;y<bot-3;y+=5){if(Math.abs(y-Y)<17)continue;px(S,X-1,y,4,3);}                     /* sluice gates along the dam */
    px('#4a8ae0',X-5,Y-10,10,20);                                                                     /* the chamber opening */
    [Y-16,Y+10].forEach(yy=>{px(O,X-36,yy,72,6);px(C,X-35,yy+1,70,4);px(L,X-35,yy+1,70,1);for(let i=-32;i<34;i+=8)px(S,X+i,yy+2,2,2);});   /* chamber walls with bollards */
    [-34,24].forEach(a=>{px(O,X+a-1,Y-11,12,4);px('#6f4a26',X+a,Y-10,10,2);px(O,X+a-1,Y+6,12,4);px('#6f4a26',X+a,Y+7,10,2);});              /* gate leaves folded open */
    box('#efe9dc',X+10,Y-29,12,9);px(O,X+8,Y-33,16,5);px('#e8364b',X+9,Y-32,14,3);box('#7ec8ff',X+13,Y-26,3,3);px(O,X+27,Y-31,2,15);px('#44c55a',X+26,Y-32,4,3);};
  /* the little Martello tower of Kingston's harbour */
  K.P.w09t_martello=function(X,Y){const G=g();shadow(X,Y+1,9,2);box('#c9c0aa',X-8,Y-14,16,14);px('#e0d8c4',X-8,Y-14,4,14);px('#a89e86',X+4,Y-14,4,14);
    px(O,X-9,Y-18,18,4);px('#8a8270',X-8,Y-17,16,2);px('#3b2618',X-2,Y-8,4,8);px(O,X-6,Y-21,12,3);px('#5a5f6e',X-5,Y-20,10,1);};
  K.P.w09t_stone=function(X,Y,w){shadow(X+w/2,Y+1,w/2+2,2);box('#d6ccb4',X,Y-12,w,12);for(let i=3;i<w-3;i+=5)box('#4a5a7a',X+i,Y-9,2,4);px(O,X-1,Y-15,w+2,4);px('#6f7889',X,Y-14,w,2);};
  /* Toronto far across the lake: small and hazy, the CN Tower still standing far above everything */
  K.P.w09t_toronto=function(X,Y){const H='#6b7a90';
    [[-36,10,12,'#b8c6d6'],[-26,7,18,'#a4b4c8'],[-18,8,13,'#c4d0de'],[-9,6,22,'#9aacc2'],[6,8,20,'#b0bfd2'],[15,6,26,'#a4b4c8'],[22,9,16,'#c4d0de'],[32,7,12,'#b8c6d6']].forEach(([a,w,h,c])=>{px(H,X+a-1,Y-h-1,w+2,h+1);px(c,X+a,Y-h,w,h);for(let yy=Y-h+2;yy<Y-2;yy+=3)px('#dde6f0',X+a+1,yy,w-2,1);});
    px(H,X-1,Y-48,3,48);px('#d8dee8',X,Y-48,1,48);px(H,X-4,Y-34,9,5);px('#d8dee8',X-3,Y-33,7,3);px(H,X-2,Y-40,5,3);px('#e8364b',X,Y-52,1,4);
    px('#8a9ab0',X-40,Y,82,2);};
  K.P.w09t_fortGeorge=function(X,Y){shadow(X+14,Y+1,18,3);for(let i=0;i<30;i+=2){px(O,X+i,Y-9,2,10);px('#a8692e',X+i,Y-8,1,8);}
    box('#c8603c',X+8,Y-17,14,9);px(O,X+6,Y-20,18,4);px('#6f4a26',X+7,Y-19,16,2);};
  K.P.w09t_barn=function(X,Y){shadow(X+11,Y+1,14,3);box('#c2414f',X,Y-14,22,14);px(O,X-2,Y-19,26,6);px('#7d1f33',X-1,Y-18,24,4);px('#ffffff',X+8,Y-10,6,10);px('#c2414f',X+9,Y-9,4,8);px('#ffffff',X+8,Y-10,6,1);
    box('#cfd6e2',X+25,Y-24,7,24);px(O,X+24,Y-27,9,4);px('#9aa3b2',X+25,Y-26,7,2);};
  /* the rail line from World 8 to World 9 runs along the north shore (X,Y only sort it among the props) */
  K.P.w09t_rail=function(X,Y,pts){const seg=f=>{for(let i=1;i<pts.length;i++){const[a,b]=pts[i-1],[c,d]=pts[i];const L=Math.hypot(c-a,d-b);for(let s=0;s<L;s++)f(a+(c-a)*s/L,b+(d-b)*s/L,s);}};
    seg((x,y)=>px(O,x-6,y-6,13,13));seg((x,y)=>px('#5a5650',x-5,y-5,11,11));seg((x,y,s)=>{if(Math.floor(s)%4===0)px('#7a5430',x-1,y-4,2,9);});
    seg((x,y)=>{px('#2b2f45',x,y-3,1,1);px('#cfd6e2',x,y-2,1,1);px('#2b2f45',x,y+2,1,1);px('#cfd6e2',x,y+3,1,1);});};
  /* yellow warning sign by the Niagara Parkway */
  K.P.w09t_warn=function(X,Y,a,b){const G=g();const w=Math.ceil(Math.max(K.textW(a,6),K.textW(b,6)))+9;
    shadow(X+w/2,Y+1,w/2-4,2);px(O,X+5,Y-12,2,12);px(O,X+w-7,Y-12,2,12);box('#f6c445',X,Y-31,w,20);px('#fff3c4',X+1,Y-30,w-2,1);px('#e8364b',X,Y-31,w,2);
    txt(a,X+4,Y-27,'#e8364b',6,1);txt(b,X+4,Y-20,O,6,1);};
  /* Thousand Islands Bridge, seen from above: a deck running north-south with two green towers and its cables. Kinan's boat goes under it. */
  K.P.w09t_tib=function(X,Y,top){const L=Y-top,G=g();shadow(X,Y+1,8,2);
    px(O,X-6,top,13,L);px('#8a96a8',X-5,top,11,L);for(let y=top;y<Y;y+=4)px('#6b7688',X-5,y,11,1);px('#f6e7a6',X,top,1,L);
    px('#2f7d5a',X-7,top,2,L);px('#2f7d5a',X+6,top,2,L);
    [top+L*0.3,top+L*0.7].forEach(ty=>{ty=Math.round(ty);px(O,X-11,ty-4,23,8);px('#2f7d5a',X-10,ty-3,21,6);px('#5fbf8a',X-10,ty-3,21,1);px(O,X-9,ty-14,4,11);px(O,X+6,ty-14,4,11);px('#2f7d5a',X-8,ty-13,2,10);px('#2f7d5a',X+7,ty-13,2,10);px(O,X-9,ty-15,19,3);px('#5fbf8a',X-8,ty-14,17,1);});
    G.strokeStyle='#cfd6e2';G.lineWidth=1;const t1=top+L*0.3-14,t2=top+L*0.7-14;[[-8],[8]].forEach(([o])=>{G.beginPath();G.moveTo(X+o+.5,top+2);G.quadraticCurveTo(X+o+.5,(top+t1)/2+8,X+o+.5,t1);G.quadraticCurveTo(X+o+.5,(t1+t2)/2+20,X+o+.5,t2);G.quadraticCurveTo(X+o+.5,(t2+Y)/2+8,X+o+.5,Y-2);G.stroke();});};
  /* Niagara's green water: repaint the water near the river so it fades from lake blue to the falls' green, then redraw the boat lane on top */
  K.P.w09t_tint=function(X,Y,x0,y0,x1,y1){const w=WD,G=g(),M=w.M,B=K.WATER.blue,N=K.WATER.w10_niagara||{a:'#3aa39c',edge:'#23756f',foam:'#8fe0d2'};
    const rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];const mix=(a,b,f)=>{const p=rgb(a),q=rgb(b);return 'rgb('+p.map((v,i)=>Math.round(v+(q[i]-v)*f)).join(',')+')';};
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){if(M(x,y))continue;let land=false;for(let k=1;k<=12;k++)if(M(x,y-k)){land=true;break;}if(land)continue;
      const f=Math.max(0,Math.min(1,(330-x)/250))*Math.max(0,Math.min(1,(y-468)/36));if(f<=0)continue;
      let k='a';if(M(x,y-13)||M(x,y-14))k='edge';if(M(x,y+1)||M(x,y+2)||M(x,y+3))k='foam';px(mix(B[k],N[k],f),x,y,1,1);}
    G.save();G.beginPath();G.rect(x0,y0,x1-x0,y1-y0);G.clip();G.lineJoin='round';G.lineCap='round';
    const st=(pts,c,wd,dash)=>{G.strokeStyle=c;G.lineWidth=wd;G.setLineDash(dash||[]);G.beginPath();pts.forEach(([a,b],i)=>i?G.lineTo(a,b):G.moveTo(a,b));G.stroke();G.setLineDash([]);};
    w.E.forEach(e=>{const r=e.geo;st(r,'rgba(120,220,255,.28)',14);st(r,'rgba(190,240,255,.55)',8);st(r,'rgba(255,255,255,.9)',2);st(r,'rgba(255,255,255,.7)',1,[2,7]);});
    G.restore();};

  /* ---------- animations ---------- */
  K.A.w09t_spill=function(t,X,Y,top,bot){for(let y=top;y<bot;y++){if(Math.abs(y-Y)<16||WD.M(X+8,y)||WD.M(X+8,y-6))continue;const k=(y+Math.floor(t/90))%5;px(k<2?'#ffffff':'#cfe4ff',X+5+((y*7+Math.floor(t/120))%3),y,2,1);if(k===0)px('#ffffff',X+9+((y+Math.floor(t/150))%4),y,1,1);}};
  K.A.w09t_beam=function(t,X,Y){const on=Math.floor(t/400)%4===0;if(on){const G=g();G.fillStyle='rgba(255,243,196,.55)';G.beginPath();G.moveTo(X,Y);G.lineTo(X-22,Y-6);G.lineTo(X-22,Y+4);G.fill();G.beginPath();G.moveTo(X,Y);G.lineTo(X+22,Y-6);G.lineTo(X+22,Y+4);G.fill();px('#ffffff',X-1,Y-1,3,3);}};
  K.A.w09t_gulls=function(t,X,Y,n){for(let i=0;i<n;i++){const a=t/1800+i*2.1,gx=X+Math.cos(a)*(18+i*5),gy=Y+Math.sin(a*1.3)*7-i*3,f=Math.floor(t/160+i)%2;
    px('#ffffff',gx-3,gy-(f?1:0),3,1);px('#ffffff',gx+1,gy-(f?1:0),3,1);px('#ffffff',gx,gy+(f?0:1),1,1);px('#6b7090',gx-3,gy+1-(f?1:0),1,1);px('#6b7090',gx+3,gy+1-(f?1:0),1,1);}};
  /* a long lake freighter sliding slowly back and forth */
  K.A.w09t_laker=function(t,X1,X2,Y,ph){const u=(Math.sin(t/9000+(ph||0))+1)/2,X=Math.round(X1+(X2-X1)*u),dir=Math.cos(t/9000+(ph||0))>=0?1:-1;
    const f=(a,w)=>dir>0?X+a:X-a-w;
    px(O,f(-30,62),Y-6,62,8);px('#c2414f',f(-29,60),Y-5,60,4);px('#2b2f45',f(-29,60),Y-1,60,2);
    for(let i=0;i<4;i++)px('#6f7889',f(-20+i*9,7),Y-8,7,3);px(O,f(18,12),Y-16,12,11);px('#f4f1e8',f(19,10),Y-15,10,9);px('#7ec8ff',f(20,8),Y-13,8,2);
    px(O,f(-27,5),Y-14,5,9);px('#2b2f45',f(-26,3),Y-13,3,7);
    for(let i=0;i<3;i++){const a=((t/1300)+i/3)%1;g().fillStyle='rgba(90,90,100,'+(0.5-a*0.5)+')';g().beginPath();g().arc(f(-25,0)-dir*a*10,Y-16-a*12,1.5+a*3,0,Math.PI*2);g().fill();}};

  /* ---------- the map ---------- */
  const isles=[[1125,284,15,6,1],[1068,286,12,6,2],[1015,295,9,5,3],[975,304,6,3,4],
    [1205,318,9,4,5],[955,354,5,3,11],[1085,303,4,2,12],[1190,269,5,3,13],[1110,358,17,8,6],[1050,354,12,6,7],[1000,352,8,4,8],[1148,345,6,3,9],[1180,353,6,3,10]];
  const WD={n:9.5,travel:true,ride:'boat',hud:'BOAT TO NIAGARA',name:'Boat to Niagara',
    where:'The tour boat leaves Montreal up the St. Lawrence, rises through a Seaway lock, weaves through the Thousand Islands and under the Thousand Islands Bridge, passes Kingston, crosses Lake Ontario with Toronto small on the far shore, then heads up the narrowing, green Niagara River into the mist toward the falls.',
    marks:'The St. Lawrence River, the Lachine Canal and the rail line out of Montreal, a Seaway lock and dam, the Thousand Islands with Boldt Castle and a lighthouse, the Thousand Islands Bridge, Kingston and its Martello tower, Lake Ontario with lake freighters and sailboats, Toronto and the CN Tower far away, Niagara-on-the-Lake with Fort George and its lighthouse, the Niagara River and the Niagara Parkway.',
    size:[1600,720],ground:'grass',water:'blue',cliff:'rock',path:'glass',
    rivers:[...STL,...NIA,CANAL],lakes:LAKES,
    zones:[
      {k:'wheat',r:[380,40,110,58]},{k:'wheat',r:[700,46,130,64]},{k:'wheat',r:[1010,36,100,60]},{k:'wheat',r:[1290,26,124,54]},{k:'wheat',r:[750,566,120,66]},{k:'wheat',r:[1000,580,110,56]},
      {k:'w09t_vines',f:blob([[92,474,58,32],[166,652,86,30]])},
      {k:'boreal',f:blob([[1110,228,200,32],[1130,432,190,40],[930,250,50,26]])},
      {k:'forest',f:blob([[1470,540,200,150],[1510,380,110,56],[630,624,230,64],[60,70,90,56],[300,80,60,40]])}],
    roads:[[[-10,606],[60,606],[130,612],[190,632],[236,690],[256,730]]],         /* the Niagara Parkway, carrying on from World 10's right edge */
    stops:[{at:[1300,252],name:'MONTREAL HARBOUR',st:'travel'},{at:[288,526],name:'NIAGARA RIVER',st:'travel'}],   /* 288+ px from the seam edges: the camera trails the boat by 30 px (60 fps) to 60 px (30 fps) */
    edges:[[0,1,[[1272,254],[1236,266],[1200,286],[1155,314],[1095,328],[1035,330],[985,334],[905,338],[770,340],[640,340],[520,336],[420,338],[360,354],[326,390],[312,438],[306,474],[302,500]]]],   /* passes under Toronto, then turns south to the Niagara */
    entryPath:{from:[1600,200],via:[[1540,202],[1470,214],[1400,236],[1350,250]],style:'glass'},
    exitPath:{to:[0,542],via:[[262,546],[210,556],[150,553],[90,546],[30,542]],style:'glass',ride:'boat'},
    weather:[[-270,300,'fog']],
    props:[
      ['w09t_tint',0,-60,0,440,340,720],
      ['w09t_rail',1600,96,RAIL],
      ['w09t_lock',1312,251,206,298],
      ...isles.map(([x,y,rx,ry,s])=>['w09t_isle',x,y,rx,ry,s]),
      ['pine',1118,290],['pine',1131,292],['w09t_cottage',1120,292,'#2a5bd7'],['w09t_light',1068,296],['pine',1013,299],['pine',1019,301],['pine',975,307],
      ['pine',1203,322],['pine',955,358],['pine',1190,273],['w09t_boldt',1110,372],['w09t_cottage',1044,363,'#e8364b'],['pine',1058,362],['pine',1000,355],['pine',1148,348],['pine',1180,356],
      ['w09t_martello',962,276],['w09t_stone',904,252,20],['w09t_stone',928,258,18],...K.homes([[860,246,'#e8364b'],[882,236,'#2a5bd7'],[934,236,'#44c55a']]),
      ['w09t_toronto',300,270],
      ['w09t_light',250,490],['w09t_fortGeorge',176,508],...K.homes([[150,478,'#e8364b'],[206,474,'#2a5bd7'],[226,500,'#8a5426']]),
      ['w09t_warn',60,650,'DANGER!','FALLS AHEAD'],
      ['w09t_barn',1420,330],['w09t_barn',700,560],['w09t_barn',1440,60],['w09t_barn',560,110],['w09t_barn',850,92],...K.homes([[1500,300,'#8a5426'],[1560,64,'#e8364b'],[1380,160,'#2a5bd7']]),
      ['w09t_lbl',1480,250,'ST. LAWRENCE RIVER'],['w09t_lbl',1312,294,'SEAWAY LOCK'],['w09t_lbl',1050,238,'THOUSAND ISLANDS'],['w09t_lbl',1215,392,'THOUSAND ISLANDS BRIDGE'],
      ['w09t_lbl',1100,384,'BOLDT CASTLE'],['w09t_lbl',925,176,'KINGSTON'],['w09t_lbl',760,300,'LAKE ONTARIO'],['w09t_lbl',300,278,'TORONTO'],
      ['w09t_lbl',196,436,'NIAGARA-ON-THE-LAKE'],['w09t_lbl',150,580,'NIAGARA RIVER']],
    overProps:[['w09t_tib',1165,386,244]],
    scatter:[{k:'tree',n:150,zone:'grass'},{k:'pine',n:70,zone:'boreal'},{k:'tree',n:90,zone:'forest'},{k:'bush',n:20,zone:'grass'}],
    anim:[['w09t_spill',1312,251,206,298],['w09t_beam',1068,272],['w09t_beam',250,465],
      ['w09t_laker',560,880,300,0],['w09t_laker',430,640,440,2],['boat',700,388,0],['boat',480,300,1],['boat',860,372,2],['boat',1500,238,4],
      ['w09t_gulls',1250,236,3],['w09t_gulls',820,320,4],['w09t_gulls',360,420,3],['w09t_gulls',120,520,2],['canflag',960,224]]};
  K.W.push(WD);
})(KINAN);

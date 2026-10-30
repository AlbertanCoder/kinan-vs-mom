/* World 12: 3D Saskatoon, the birthday festival.
   Same Saskatoon as World 1 (river running bottom-left to top-right, downtown on the north bank),
   but every building is an extruded toy block: front face, lit top, shaded side, long cast shadow. */
(function(K){
  const {px,box,shadow,txt,hash}=K; const g=()=>K.g();

  /* ---------- 3D helpers ---------- */
  const DX=0.8,DY=-0.55;                       /* depth recedes up and to the right */
  const sh=(hex,f)=>{const n=parseInt(hex.slice(1),16);let r=(n>>16)&255,gg=(n>>8)&255,b=n&255;
    if(f<1){r*=f;gg*=f;b*=f;}else{r+=(255-r)*(f-1);gg+=(255-gg)*(f-1);b+=(255-b)*(f-1);}return 'rgb('+Math.round(r)+','+Math.round(gg)+','+Math.round(b)+')';};
  const poly=(c,pts)=>{const G=g();G.fillStyle=c;G.beginPath();pts.forEach(([a,b],i)=>i?G.lineTo(a,b):G.moveTo(a,b));G.closePath();G.fill();};
  /* blk: a box whose front face spans X..X+w, Y-h..Y, extruded d deep. Returns the depth offset. */
  const blk=(X,Y,w,h,d,c,o)=>{o=o||{};const ox=Math.round(d*DX),oy=Math.round(d*DY);
    if(!o.noShadow)poly('rgba(20,24,60,.34)',[[X+w,Y+1],[X+w+ox,Y+oy+1],[X+w+ox+h*0.62,Y+oy+5],[X+w+h*0.62,Y+5]]);
    poly('#1b1220',[[X-1,Y+1],[X-1,Y-h-1],[X+ox-1,Y-h+oy-1],[X+w+ox+1,Y-h+oy-1],[X+w+ox+1,Y+oy+1],[X+w+1,Y+1]]);
    poly(o.side||sh(c,0.66),[[X+w,Y],[X+w,Y-h],[X+w+ox,Y-h+oy],[X+w+ox,Y+oy]]);
    poly(o.top||sh(c,1.28),[[X,Y-h],[X+w,Y-h],[X+w+ox,Y-h+oy],[X+ox,Y-h+oy]]);
    g().fillStyle=c;g().fillRect(X,Y-h,w,h);
    g().fillStyle='rgba(255,255,255,.4)';g().fillRect(X,Y-h,w,1);g().fillStyle='#1b1220';g().fillRect(X+w,Y-h,1,h);g().fillRect(X+w,Y-h,ox+1,0);
    return [ox,oy];};
  /* windows on a front face and on its side face */
  const wins=(X,Y,w,h,d,c,step,top,bot)=>{const ox=Math.round(d*DX),oy=Math.round(d*DY);step=step||6;
    for(let yy=Y-h+(top||4);yy<Y-(bot||5);yy+=step)for(let xx=X+3;xx<X+w-3;xx+=5)px(c,xx,yy,3,3);
    const n=Math.max(1,Math.floor(d/5));for(let k=0;k<n;k++){const sx=X+w+Math.round((k+0.5)*ox/n)-1,so=Math.round((k+0.5)*oy/n);for(let yy=Y-h+(top||4);yy<Y-(bot||5);yy+=step)px(sh(c.startsWith('#')?c:'#cfeeff',0.7),sx,yy+so,2,3);}};
  /* gabled house: walls + both roof planes + front gable */
  const house=(X,Y,w,h,d,wall,roof)=>{const [ox,oy]=blk(X,Y,w,h,d,wall);const rh=Math.round(w*0.42);
    poly('#1b1220',[[X-3,Y-h+1],[X+w/2,Y-h-rh-1],[X+w/2+ox,Y-h-rh+oy-1],[X+w+ox+3,Y-h+oy+1],[X+w+3,Y-h+1]]);
    poly(sh(roof,1.22),[[X-2,Y-h],[X+w/2,Y-h-rh],[X+w/2+ox,Y-h-rh+oy],[X+ox-2,Y-h+oy]]);
    poly(roof,[[X+w/2,Y-h-rh],[X+w+2,Y-h],[X+w+ox+2,Y-h+oy],[X+w/2+ox,Y-h-rh+oy]]);
    poly(sh(wall,0.92),[[X,Y-h],[X+w/2,Y-h-rh+1],[X+w,Y-h]]);
    g().fillStyle='#1b1220';g().fillRect(X+w/2,Y-h-rh,1,1);return [ox,oy,rh];};

  /* ---------- looks ---------- */
  K.WATER.w12_water={a:'#3d8ef2',b:'#3d8ef2',edge:'#2457b8',foam:'#a8d4ff',sh:'#ffffff'};
  K.GROUND.w12_grass=(X,Y)=>{const t=((X>>4)+(Y>>4))&1,h=hash(X>>1,Y>>1);if(h>.985)return '#b8f07a';return t?'#5cc444':'#68ce4e';};
  K.RIM.w12_grass='#b0f080';K.LINE.w12_grass='#2a6420';
  K.GROUND.w12_plaza=(X,Y)=>{if(X%16===0||Y%16===0)return '#b8b2a4';return ((X>>4)+(Y>>4))&1?'#dcd6c8':'#e6e0d2';};
  K.RIM.w12_plaza='#f4f0e6';K.LINE.w12_plaza='#6b6f7a';
  K.GROUND.w12_lawn=(X,Y)=>((X+Y)>>3)&1?'#7ad85a':'#6acb4c';
  K.RIM.w12_lawn='#b8f090';K.LINE.w12_lawn='#2a6420';
  K.GROUND.w12_valley=(X,Y)=>{const h=hash(X>>1,Y>>1);return h>.96?'#62b848':((X>>4)+(Y>>4))&1?'#3f9a38':'#46a33e';};
  K.RIM.w12_valley='#7cd65a';K.LINE.w12_valley='#1f4a18';
  K.GROUND.w12_sand=(X,Y)=>hash(X>>1,Y>>1)>.9?'#e0c080':'#f0d898';
  K.RIM.w12_sand='#fff0c0';K.LINE.w12_sand='#8a6420';

  /* ---------- props ---------- */
  K.P.w12_lbl=function(X,Y,s){K.P.label(X,Y,s);};
  K.P.w12_tree=function(X,Y){blk(X-2,Y,4,6,3,'#8a5426');blk(X-8,Y-5,15,13,9,'#3fae38',{top:'#7ee05a',side:'#2a7f2a'});px('#a8f07a',X-6,Y-16,4,2);};
  K.P.w12_spruce=function(X,Y){blk(X-1,Y,3,4,2,'#6f4a26');[[14,7],[10,7],[6,6]].forEach(([w,h],i)=>blk(X-w/2,Y-4-i*6,w,h,w*0.6,'#2f8a4a',{top:'#5fc070',side:'#1f6436',noShadow:i>0}));};
  K.P.w12_house=function(X,Y,wall,roof){const[ox,oy]=house(X,Y,22,14,14,wall,roof);box('#cfeeff',X+3,Y-10,5,5);box('#cfeeff',X+14,Y-10,5,5);px('#8a5426',X+9,Y-7,4,7);};
  K.P.w12_kinanHouse=function(X,Y){const[ox,oy,rh]=house(X,Y,70,32,26,'#f6ead2','#e8364b');
    [[6,-26],[24,-26],[44,-26],[58,-26],[6,-13],[48,-13],[58,-13]].forEach(([a,b])=>{box('#7ec8ff',X+a,Y+b,8,8);px('#cfeeff',X+a,Y+b,8,2);});px('#f6c445',X+24,Y-26,8,8);
    box('#a8692e',X+30,Y-14,10,14);px('#f6c445',X+38,Y-7,1,2);
    blk(X+52,Y-32-rh+14,7,14,6,'#8a5a32',{noShadow:true});
    for(let i=0;i<9;i++)px(['#ff6fae','#f6c445','#7ec8ff','#8fd94f'][i%4],X+3+i*8,Y-33,5,3);
    K.P.label(X+35,Y+4,"KINAN'S HOUSE");};
  K.P.w12_tower=function(X,Y,w,h,c,win){blk(X,Y,w,h,w*0.7,c);wins(X,Y,w,h,w*0.7,win||'#fff3c4',6,5,6);};
  K.P.w12_shop=function(X,Y,c,aw){blk(X,Y,26,20,14,c);for(let k=0;k<6;k++)px(k%2?aw:'#ffffff',X+k*4+1,Y-12,4,4);box('#cfeeff',X+4,Y-19,6,5);box('#cfeeff',X+15,Y-19,6,5);};
  K.P.w12_bess=function(X,Y){const G0=g();G0.save();G0.translate(X,Y);G0.scale(1.25,1.25);G0.translate(-X,-Y);/* the Bessborough, extruded: cream château, deep green copper roofs, five towers */
    const cr='#efe0bc',cu='#3fa88a';
    poly('rgba(20,24,60,.30)',[[X+40,Y+1],[X+60,Y-11],[X+110,Y-6],[X+90,Y+6]]);
    const [ox,oy]=blk(X-40,Y,80,36,26,cr,{noShadow:true});
    for(let r=0;r<3;r++)for(let i=0;i<9;i++)box('#5a6fa0',X-35+i*9,Y-31+r*10,3,5);wins(X-40,Y,0,36,26,'#5a6fa0',10,5,6);
    for(let k=0;k<4;k++)for(let r=0;r<3;r++)px('#3f4f78',X+40+Math.round((k+0.5)*ox/4),Y-31+r*10+Math.round((k+0.5)*oy/4),2,5);
    /* mansard roof */
    poly('#1b1220',[[X-42,Y-35],[X+42,Y-35],[X+42+ox,Y-35+oy],[X+34+ox,Y-50+oy],[X-34+ox,Y-50+oy],[X-34,Y-50]]);
    poly(sh(cu,0.7),[[X+41,Y-36],[X+41+ox,Y-36+oy],[X+33+ox,Y-49+oy],[X+33,Y-49]]);
    poly(sh(cu,1.35),[[X-33,Y-49],[X+33,Y-49],[X+33+ox,Y-49+oy],[X-33+ox,Y-49+oy]]);
    poly(cu,[[X-41,Y-36],[X+41,Y-36],[X+33,Y-49],[X-33,Y-49]]);
    for(let i=0;i<7;i++)box('#efe0bc',X-28+i*9,Y-46,4,5);
    /* towers with pointed copper caps */
    const tw=(tx,ty,w,h)=>{const [a,b]=blk(tx,ty,w,h,w*0.8,cr,{noShadow:true});box('#5a6fa0',tx+w/2-1,ty-h+5,3,5);
      poly('#1b1220',[[tx-2,ty-h+1],[tx+w/2+a/2,ty-h-w*1.4+b/2-1],[tx+w+a+2,ty-h+b+1],[tx+w+2,ty-h+1]]);
      poly(cu,[[tx-1,ty-h],[tx+w/2+a/2,ty-h-w*1.4+b/2],[tx+w+1,ty-h]]);poly(sh(cu,0.7),[[tx+w+1,ty-h],[tx+w/2+a/2,ty-h-w*1.4+b/2],[tx+w+a+1,ty-h+b]]);};
    tw(X-44,Y-26,12,30);tw(X+32,Y-26,12,30);tw(X-9,Y-34,18,40);tw(X-26,Y-40,9,18);tw(X+17,Y-40,9,18);
    box('#2b2f45',X-5,Y-13,10,13);G0.restore();K.P.label(X+6,Y+6,'THE BESSBOROUGH');};
  K.P.w12_remai=function(X,Y){/* the Remai Modern: dark stacked boxes, each cantilevered, copper trim */
    [[0,0,52,11],[10,-11,50,10],[-6,-21,50,10],[6,-31,46,10]].forEach(([a,b,w,h])=>{const[ox,oy]=blk(X+a,Y+b,w,h,20,'#3d3d48',{top:'#62626e',side:'#2a2a33',noShadow:b<0});px('#e8b860',X+a,Y+b-h,w,1);px('#e8b860',X+a+w,Y+b-h,ox,0);for(let i=4;i<w-4;i+=7)px('#ffe6a0',X+a+i,Y+b-h+4,4,3);});
    K.P.label(X+28,Y+5,'THE ART GALLERY');};
  K.P.w12_painting=function(X,Y){/* the painting Kinan can step through */
    px('#1b1220',X-1,Y-2,2,2);px('#6f4a26',X-8,Y-1,2,8);px('#6f4a26',X+7,Y-1,2,8);
    box('#c9922f',X-12,Y-26,24,22);px('#1b2a6a',X-10,Y-24,20,18);for(let i=0;i<20;i++){const a=i/3;px(['#f6c445','#7ec8ff','#ffffff'][i%3],X+Math.cos(a)*(2+i*0.4),Y-15+Math.sin(a)*(2+i*0.35),2,1);}px('#2f7a2c',X-10,Y-9,20,3);};
  K.P.w12_hatch=function(X,Y){const G=g();G.fillStyle='#1b1220';G.beginPath();G.ellipse(X,Y,9,5,0,0,Math.PI*2);G.fill();G.fillStyle='#6f7889';G.beginPath();G.ellipse(X,Y,8,4,0,0,Math.PI*2);G.fill();px('#9aa3b2',X-6,Y-1,12,1);px('#9aa3b2',X-1,Y-3,1,6);px('#f6c445',X+5,Y-4,3,2);};
  K.P.w12_sasktel=function(X,Y){/* SaskTel Centre: a fat white drum with a blue band and a shallow dome */
    const G=g();poly('rgba(20,24,60,.3)',[[X+30,Y+2],[X+64,Y-4],[X+70,Y+6],[X+20,Y+10]]);
    G.fillStyle='#1b1220';G.beginPath();G.ellipse(X,Y-3,43,15,0,0,Math.PI);G.fill();G.fillRect(X-43,Y-20,86,17);
    G.fillStyle='#c9cfdc';G.beginPath();G.ellipse(X,Y-3,42,14,0,0,Math.PI);G.fill();G.fillRect(X-42,Y-20,84,17);
    G.fillStyle='#9aa3b2';G.fillRect(X+14,Y-20,28,17);G.beginPath();G.ellipse(X,Y-3,42,14,0,0,Math.PI*0.35);G.lineTo(X,Y-3);G.fill();
    G.fillStyle='#2a5bd7';G.fillRect(X-42,Y-14,84,4);
    G.fillStyle='#1b1220';G.beginPath();G.ellipse(X,Y-20,43,15,0,0,Math.PI*2);G.fill();G.fillStyle='#ffffff';G.beginPath();G.ellipse(X,Y-20,42,14,0,0,Math.PI*2);G.fill();
    G.fillStyle='#e6e9f0';G.beginPath();G.ellipse(X+8,Y-18,30,9,0,0,Math.PI*2);G.fill();G.fillStyle='#ffffff';G.beginPath();G.ellipse(X-8,Y-24,18,5,0,0,Math.PI*2);G.fill();
    K.P.label(X,Y+6,'THE ARENA');};
  K.P.w12_carousel=function(X,Y){const G=g();shadow(X+6,Y+3,24,5);
    G.fillStyle='#1b1220';G.beginPath();G.ellipse(X,Y-2,21,7,0,0,Math.PI*2);G.fill();G.fillStyle='#f4f1e8';G.beginPath();G.ellipse(X,Y-2,20,6,0,0,Math.PI*2);G.fill();px('#c9c4b8',X-20,Y-2,40,3);
    for(let i=-16;i<=16;i+=8){px('#f6c445',X+i,Y-22,1,20);px(['#e8364b','#2a5bd7','#ffffff','#44c55a','#ff6fae'][(i+16)/8],X+i-2,Y-12+(i%16?2:0),5,4);}
    G.fillStyle='#1b1220';G.beginPath();G.moveTo(X-23,Y-21);G.lineTo(X,Y-38);G.lineTo(X+23,Y-21);G.fill();for(let i=0;i<8;i++){G.fillStyle=i%2?'#e8364b':'#ffffff';G.beginPath();G.moveTo(X,Y-36);G.lineTo(X-22+i*5.5,Y-22);G.lineTo(X-22+(i+1)*5.5,Y-22);G.fill();}
    px('#1b1220',X,Y-44,1,8);px('#f6c445',X+1,Y-44,4,3);};
  K.P.w12_train=function(X,Y){blk(X,Y,12,8,6,'#2a5bd7');blk(X+14,Y,10,7,6,'#e8364b',{noShadow:true});blk(X+26,Y,10,7,6,'#f6c445',{noShadow:true});px('#1b1220',X+2,Y-14,3,6);};
  K.P.w12_rails=function(X,Y1,Y2){for(let y=Y1;y<=Y2;y+=4){px('#6f4a26',X-6,y,12,2);}px('#6b6f7a',X-4,Y1,1,Y2-Y1);px('#6b6f7a',X+3,Y1,1,Y2-Y1);};
  K.P.w12_uofs=function(X,Y){const[ox,oy]=blk(X,Y,70,26,22,'#c4bcaa');for(let i=0;i<7;i++)box('#cfeeff',X+5+i*9,Y-20,4,8);
    blk(X+26,Y-26,18,30,14,'#c4bcaa',{noShadow:true});box('#f6ead2',X+31,Y-48,8,8);px('#1b1220',X+35,Y-46,1,4);
    poly('#1b1220',[[X+24,Y-55],[X+35+6,Y-70],[X+46+11,Y-63],[X+46,Y-55]]);poly('#6f7889',[[X+25,Y-56],[X+35+6,Y-69],[X+45,Y-56]]);
    K.P.label(X+35,Y+5,'U OF S');};
  K.P.w12_elevator=function(X,Y){blk(X,Y,20,50,16,'#c8463e');blk(X+20,Y,14,24,14,'#c8463e',{noShadow:true});poly('#1b1220',[[X-1,Y-49],[X+10+6,Y-60],[X+21+12,Y-58],[X+21,Y-49]]);poly('#a8322e',[[X,Y-50],[X+10+6,Y-59],[X+20,Y-50]]);px('#f4f1e8',X+3,Y-40,14,5);};
  K.P.w12_cake=function(X,Y){/* a giant three-tier birthday cake on the festival lawn */
    [[0,40,14,'#ffd1e6','#ff6fae'],[14,30,12,'#fff3c4','#f6c445'],[26,20,10,'#cfeeff','#2a5bd7']].forEach(([b,w,h,c1,c2],i)=>{blk(X-w/2,Y-b,w,h,w*0.5,c1,{top:'#ffffff',side:sh(c1,0.8),noShadow:i>0});px(c2,X-w/2,Y-b-h,w,3);for(let k=0;k<w;k+=5)px(c2,X-w/2+k,Y-b-h+3,3,2+(k%2)*2);});
    px('#ffffff',X-4,Y-44,2,7);px('#ffffff',X+2,Y-44,2,7);};
  K.P.w12_stage=function(X,Y){blk(X,Y,40,8,16,'#4a5160');px('#1b1220',X+2,Y-30,2,22);px('#1b1220',X+36,Y-30,2,22);px('#1b1220',X+2,Y-31,36,3);for(let i=0;i<5;i++)px(['#e8364b','#f6c445','#2a5bd7','#44c55a','#ff6fae'][i],X+6+i*7,Y-28,3,3);txt('HAPPY 11TH',X+4,Y-20,'#f6c445',6,1);};
  K.P.w12_tent=function(X,Y,c){c=c||'#e8364b';const G=g();poly('rgba(20,24,60,.3)',[[X+30,Y],[X+42,Y-8],[X+52,Y-2],[X+40,Y+4]]);
    poly('#1b1220',[[X-1,Y+1],[X+15,Y-20],[X+15+10,Y-26],[X+41,Y-6],[X+31,Y+1]]);
    poly(sh(c,0.7),[[X+15,Y-19],[X+25,Y-25],[X+40,Y-6],[X+30,Y]]);
    for(let i=0;i<8;i++){G.fillStyle=i%2?c:'#ffffff';G.beginPath();G.moveTo(X+15,Y-19);G.lineTo(X+i*3.75,Y);G.lineTo(X+(i+1)*3.75,Y);G.fill();}
    px('#1b1220',X+15,Y-25,1,6);px('#f6c445',X+16,Y-25,4,3);};
  K.P.w12_arches=function(X,Y1,Y2){/* the Broadway Bridge's big concrete arches, seen on both sides of the deck */
    const n=3,L=(Y2-Y1)/n,G=g();for(let k=0;k<n;k++){const a=Y1+k*L;
      [[-1,X-11],[1,X+11]].forEach(([s,x0])=>{G.strokeStyle='#1b1220';G.lineWidth=4;G.beginPath();G.ellipse(x0,a+L/2,4,L/2-1,0,s<0?Math.PI/2:-Math.PI/2,s<0?Math.PI*1.5:Math.PI/2);G.stroke();
        G.strokeStyle='#f4f1e8';G.lineWidth=2;G.beginPath();G.ellipse(x0,a+L/2,4,L/2-1,0,s<0?Math.PI/2:-Math.PI/2,s<0?Math.PI*1.5:Math.PI/2);G.stroke();});
      px('rgba(20,24,60,.3)',X+20,a+4,6,L-8);}};
  K.P.w12_bench=function(X,Y){px('#1b1220',X-1,Y-5,14,4);px('#a8692e',X,Y-4,12,2);px('#1b1220',X+1,Y-1,1,2);px('#1b1220',X+10,Y-1,1,2);};

  /* ---------- animations ---------- */
  K.A.w12_weir=function(t,X1,Y1,X2,Y2){const n=Math.round(Math.hypot(X2-X1,Y2-Y1));for(let i=0;i<=n;i+=1){const x=X1+(X2-X1)*i/n,y=Y1+(Y2-Y1)*i/n;px('#1b1220',x-1,y,4,2);px('#ffffff',x,y,3,1);
      if(i%3===0){const k=((t/120)+i)%10;px('rgba(255,255,255,.85)',x+3+k,y+Math.sin(i)*1,3,1);px('rgba(220,240,255,.7)',x+8+k*1.5,y+1,2,1);}}};
  K.A.w12_fireworks=function(t,X,Y){const cols=['#ff3df0','#f6c445','#7ec8ff','#44c55a','#ff8a3d','#ffffff'];
    for(let k=0;k<4;k++){const a=((t/1700)+k/4)%1,cx=X+[-40,-6,30,58][k],cy=Y-[10,28,4,22][k],r=5+a*18,c=cols[(k+Math.floor(t/1700+k/4))%6];
      g().globalAlpha=Math.max(0,1-a*0.85);for(let i=0;i<12;i++){const an=i*Math.PI/6+k;px(c,cx+Math.cos(an)*r-1,cy+Math.sin(an)*r*0.8-1,3,3);px(c,cx+Math.cos(an)*r*0.6,cy+Math.sin(an)*r*0.48,2,2);}px('#ffffff',cx-1,cy-1,3,3);g().globalAlpha=1;}};
  K.A.w12_tube=function(t,X1,Y1,X2,Y2){/* the glass tunnel under the river to the secret hatch */
    const G=g();G.strokeStyle='rgba(20,40,110,.55)';G.lineWidth=9;G.beginPath();G.moveTo(X1,Y1);G.quadraticCurveTo((X1+X2)/2+14,(Y1+Y2)/2,X2,Y2);G.stroke();
    G.strokeStyle='rgba(180,230,255,.75)';G.lineWidth=2;G.setLineDash([3,3]);G.lineDashOffset=-t/60;G.beginPath();G.moveTo(X1,Y1);G.quadraticCurveTo((X1+X2)/2+14,(Y1+Y2)/2,X2,Y2);G.stroke();G.setLineDash([]);G.lineDashOffset=0;
    for(let i=0;i<4;i++){const a=((t/900)+i/4)%1;px('rgba(255,255,255,.8)',X2+6+Math.sin(i*2+a*5)*3,Y2-2-a*10,2,2);}};
  K.A.w12_glow=function(t,X,Y){const p=(Math.sin(t/300)+1)/2;g().fillStyle='rgba(255,230,120,'+(0.25+p*0.3)+')';g().beginPath();g().ellipse(X,Y-15,15+p*3,14+p*3,0,0,Math.PI*2);g().fill();};

  /* ---------- the world ---------- */
  K.W.push({n:12,hud:'WORLD 12 - 3D',name:'The Birthday Festival',
    where:"Glitchy is beaten and the whole game snaps into 3D. Kinan is back home in Saskatoon, the same city as World 1, but now everything stands up off the map. He runs his street, the river valley, the weir and the Broadway Bridge, and ends at the Bessborough, where the whole city throws his birthday festival.",
    marks:"Kinan's house and his street's rooftops, the river valley trail, the weir and its pelicans, the CPR bridge, the Broadway Bridge arches, the downtown skyline, Kinsmen Park's Ferris wheel and carousel, the Remai Modern, a sandbar with a secret hatch, SaskTel Centre, Broadway Avenue, the U of S, a grain elevator and the Bessborough with the festival on its lawn.",
    size:[1000,640],ground:'w12_grass',water:'w12_water',cliff:'dirt',path:'tan',
    rivers:[
      {pts:[[-20,480],[120,478],[240,472],[340,462],[440,448],[540,430],[570,424]],w:22},
      {pts:[[560,426],[600,402],[640,390],[680,384],[720,386],[750,386]],w:11},   /* north channel */
      {pts:[[560,426],[600,444],[640,436],[680,414],[720,396],[750,386]],w:11},   /* south channel: the sandbar sits between */
      {pts:[[740,388],[860,360],[1020,325]],w:22}],
    zones:[
      {k:'w12_sand',e:[634,416,46,12]},
      {k:'w12_lawn',e:[870,300,120,46]},
      {k:'w12_plaza',f:(X,Y)=>(X>296&&X<462&&Y>96&&Y<420)||(X>478&&X<700&&Y>96&&Y<192)},
      {k:'w12_valley',f:(X,Y,w)=>w.rd(X,Y)<30&&!(X>440&&X<990&&Y<400)}],
    roads:[
      [[-10,330],[150,330]],                                   /* Kinan's street */
      [[150,-10],[150,652]],                                   /* a city road over the south bridge */
      [[-10,200],[1010,200]],                                  /* a city road */
      [[150,270],[470,270]],                                   /* a city road */
      [[470,420],[470,-10]],                                   /* 4th Avenue, off the Broadway Bridge */
      [[470,466],[476,560],[480,652]],                         /* Broadway Avenue */
      [[290,652],[330,516],[400,496],[470,482],[540,472],[600,470],[640,462],[700,440],[760,424],[860,402],[1010,368]], /* Saskatchewan Crescent */
      [[150,590],[1010,590]]],                                 /* a city road */
    bridges:[[150,476,'beam'],[300,466,'rail'],[470,442,'arches']],
    J:{c1:[150,404],c2:[150,514]},
    stops:[
      {at:[88,336],name:"12-1  KINAN'S 3D HOUSE",st:'open'},
      {at:[94,382],name:'12-2  NEIGHBOURHOOD ROOFTOPS',st:'lock'},
      {at:[222,518],name:'12-3  THE RIVER VALLEY TRAIL',st:'lock'},
      {at:[330,516],name:'12-4  THE WEIR RAPIDS',st:'lock'},
      {at:[470,442],name:'12-5  THE BROADWAY BRIDGE ARCHES',st:'lock'},
      {at:[470,330],name:'FORT  DOWNTOWN SKYLINE',st:'fort'},
      {at:[540,290],name:'12-6  KINSMEN PARK RIDES',st:'lock'},
      {at:[626,366],name:'12-7  THE ART GALLERY',st:'lock'},
      {at:[630,416],name:'SECRET  UNDER THE RIVER',st:'secret'},
      {at:[715,345],name:'12-8  THE ARENA',st:'lock'},
      {at:[830,325],name:'CASTLE  THE BESSBOROUGH BIRTHDAY FESTIVAL',st:'boss'}],
    edges:[
      [0,1],
      [1,'c1',[[128,396]]],
      ['c1','c2',[],{road:1}],
      ['c2',2,[[182,520]]],
      [2,3,[[276,522]]],
      [3,4,[[400,496],[470,482],[470,466]],{road:1}],
      [4,5,[[470,420]],{road:1}],
      [5,6,[[505,318]]],
      [6,7,[[600,312]]],
      [7,8],
      [7,9,[[670,356]]],
      [9,10,[[770,336]]]],
    exit:[960,260],
    props:[
      /* Kinan's street */
      ['w12_kinanHouse',6,324],
      ['w12_house',8,410,'#f6ead2','#2a5bd7'],['w12_house',44,410,'#ffe0b0','#44c55a'],['w12_house',80,410,'#f6ead2','#e8364b'],
      ['w12_house',100,312,'#ffe0b0','#2a5bd7'],['w12_house',20,250,'#f6ead2','#44c55a'],['w12_house',60,240,'#d8e8ff','#e8364b'],['w12_house',100,250,'#ffe0b0','#8a5426'],
      ['w12_house',20,170,'#ffe0b0','#2a5bd7'],['w12_house',64,160,'#f6ead2','#e8364b'],['w12_house',104,172,'#d8e8ff','#44c55a'],['w12_house',20,90,'#f6ead2','#8a5426'],['w12_house',70,80,'#ffe0b0','#2a5bd7'],
      ['w12_house',190,180,'#f6ead2','#e8364b'],['w12_house',230,170,'#d8e8ff','#2a5bd7'],['w12_house',190,250,'#ffe0b0','#44c55a'],['w12_house',240,256,'#f6ead2','#8a5426'],['w12_house',196,330,'#d8e8ff','#e8364b'],['w12_house',244,330,'#ffe0b0','#2a5bd7'],
      ['w12_house',190,90,'#ffe0b0','#44c55a'],['w12_house',240,80,'#f6ead2','#e8364b'],
      /* rail line through the CPR bridge */
      ['w12_rails',300,-6,438],['w12_rails',300,492,646],
      /* downtown skyline */
      ['w12_tower',318,256,26,96,'#8aa0c8'],['w12_tower',360,262,30,128,'#5c6f9a'],['w12_tower',404,258,22,80,'#9aaac0'],['w12_tower',430,252,26,110,'#6f86b0'],
      ['w12_tower',320,404,24,70,'#a8b4c8'],['w12_tower',356,408,28,96,'#7a8fb8'],['w12_tower',398,410,26,60,'#b0a090'],['w12_tower',428,400,22,84,'#5c6f9a'],
      ['w12_tower',490,186,26,90,'#7a8fb8'],['w12_tower',530,180,30,118,'#5c6f9a'],['w12_tower',576,186,24,76,'#a8b4c8'],['w12_tower',610,182,28,100,'#8aa0c8'],['w12_tower',650,186,22,64,'#b0a090'],
      ['w12_tower',318,186,24,64,'#b0a090'],['w12_tower',354,180,28,84,'#8aa0c8'],['w12_tower',396,186,30,70,'#7a8fb8'],['w12_tower',436,182,20,96,'#a8b4c8'],
      ['w12_lbl',390,420,'DOWNTOWN'],
      /* Kinsmen Park */
      ['w12_carousel',600,276],['w12_train',496,276],['w12_lbl',586,298,'KINSMEN PARK'],['w12_arches',470,421,465],
      /* Remai + secret */
      ['w12_remai',528,398],['w12_painting',606,352],['w12_hatch',640,418],
      /* SaskTel Centre */
      ['w12_sasktel',738,300],
      /* the Bessborough + festival */
      ['w12_bess',890,318],['w12_cake',800,300],['w12_stage',940,300],['w12_tent',770,346],['w12_tent',958,328,'#2a5bd7'],['w12_tent',790,270,'#44c55a'],
      ['w12_lbl',792,232,'BIRTHDAY FESTIVAL'],['w12_house',740,120,'#f6ead2','#e8364b'],['w12_house',800,100,'#ffe0b0','#2a5bd7'],['w12_house',860,130,'#d8e8ff','#44c55a'],['w12_house',930,110,'#f6ead2','#8a5426'],['w12_house',760,60,'#d8e8ff','#2a5bd7'],['w12_house',900,50,'#ffe0b0','#e8364b'],
      /* east side */
      ['w12_shop',488,520,'#c8603c','#e8364b'],['w12_shop',520,520,'#d8a870','#2a5bd7'],['w12_shop',552,520,'#9a6030','#44c55a'],['w12_shop',488,566,'#d8a870','#f6c445'],['w12_shop',520,566,'#c8603c','#ff6fae'],
      ['w12_shop',430,520,'#9a6030','#f6c445'],['w12_shop',398,566,'#c8603c','#2a5bd7'],['w12_shop',430,566,'#d8a870','#e8364b'],
      ['w12_lbl',476,600,'BROADWAY AVE'],
      ['w12_uofs',760,520],['w12_elevator',930,580],
      ['w12_house',600,520,'#f6ead2','#e8364b'],['w12_house',640,530,'#ffe0b0','#2a5bd7'],['w12_house',680,500,'#d8e8ff','#44c55a'],['w12_house',600,630,'#f6ead2','#8a5426'],['w12_house',650,632,'#ffe0b0','#e8364b'],
      ['w12_house',200,630,'#d8e8ff','#2a5bd7'],['w12_house',360,630,'#f6ead2','#44c55a'],['w12_house',860,640,'#ffe0b0','#2a5bd7'],['w12_house',880,470,'#f6ead2','#e8364b'],['w12_house',930,440,'#d8e8ff','#8a5426'],
      ['w12_bench',250,540],['w12_bench',200,544],
      /* labels */
      ['w12_lbl',230,548,'RIVER VALLEY TRAIL'],['w12_lbl',352,478,'THE WEIR'],['w12_lbl',470,404,'BROADWAY BRIDGE'],['w12_lbl',660,440,'UNDER THE RIVER']],
    scatter:[{k:'w12_tree',n:90,zone:'w12_valley'},{k:'w12_spruce',n:20,zone:'w12_valley'},{k:'w12_tree',n:40,zone:'w12_grass'}],
    anim:[
      ['w12_weir',318,448,328,476],['pelican',260,470,0],['pelican',380,455,1],['pelican',520,430,2],['pelican',820,358,3],
      ['ferris',522,232,22],['w12_tube',618,376,640,414],['w12_glow',606,352],
      ['w12_fireworks',880,170],['canflag',890,186],
      ['balloon',760,300,'#e8364b'],['balloon',772,292,'#f6c445'],['balloon',820,280,'#2a5bd7'],['balloon',968,296,'#ff6fae'],['balloon',980,286,'#44c55a'],['balloon',30,270,'#ff6fae'],['balloon',46,264,'#f6c445'],
      ['candle',800,256],['smoke',948,524]]});
})(KINAN);

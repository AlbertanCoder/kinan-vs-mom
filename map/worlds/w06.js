/* World 6: Drumheller (Kinan vs. Robo-Rex) */
(function(K){
  const {px,box,shadow,txt,hash}=K; const g=()=>K.g(); const P=K.P, A=K.A;
  const O='#1b1220';
  const line=(c,w,pts)=>{const G=g();G.strokeStyle=c;G.lineWidth=w;G.lineCap='round';G.lineJoin='round';G.beginPath();pts.forEach(([a,b],i)=>i?G.lineTo(a,b):G.moveTo(a,b));G.stroke();};
  const tri=(c,pts)=>{const G=g();G.fillStyle=c;G.beginPath();pts.forEach(([a,b],i)=>i?G.lineTo(a,b):G.moveTo(a,b));G.closePath();G.fill();};
  const ell=(c,x,y,rx,ry)=>{const G=g();G.fillStyle=c;G.beginPath();G.ellipse(x,y,rx,ry,0,0,Math.PI*2);G.fill();};

  /* Horseshoe Canyon: deep red-striped canyon cut into the prairie, and a warm sunset-tinted badlands patch */
  K.GROUND.w06_canyon=(X,Y)=>['#c8643c','#e09a5c','#a84e30','#f0c08a','#b86a40'][((Math.floor((Y+Math.sin(X/18)*4)/5))%5+5)%5];
  K.RIM.w06_canyon='#f2dcb8';K.LINE.w06_canyon='#5e3b20';
  K.GROUND.w06_sunset=(X,Y)=>['#f0a070','#d8704c','#f6c890','#c85a48'][((Math.floor((Y+Math.sin(X/26)*6)/7))%4+4)%4];
  K.RIM.w06_sunset='#ffe0b8';K.LINE.w06_sunset='#5e3b20';
  K.GROUND.w06_flats=(X,Y)=>{const h=hash(X>>1,Y>>1);return h>.96?'#a8d870':h>.9?'#7aa84a':'#8cbc58';};
  K.RIM.w06_flats='#b8e080';K.LINE.w06_flats='#2e6423';
  /* Horseshoe Canyon sits right beside Highway 9, the way in from Calgary */
  const CY=500;
  const inCanyon=(X,Y)=>{const wob=Math.sin(Y/9)*4+Math.sin(X/13)*3;const dx=(X-250)/(112+wob),dy=(Y-CY)/66;if(dx*dx+dy*dy>=1||Y<CY-64)return false;const tw=48+Math.sin(Y/7)*4;const tx=(X-250)/tw,ty=(Y-CY)/26;const tongue=(tx*tx+ty*ty<1)||(Math.abs(X-250)<tw&&Y<CY);return !tongue;};
  /* border sign with a board as wide as its words (text is drawn sharp at runtime, 7px) */
  P.w06_sign=function(X,Y,a,b,col){const G=g();const w=Math.ceil(Math.max(K.textW(a,6),b?K.textW(b,6):0))+9;
    shadow(X+w/2,Y+1,w/2-4,2);px(O,X+5,Y-12,2,12);px(O,X+w-7,Y-12,2,12);box(col||'#2f7d32',X,Y-31,w,20);px('#ffffff',X+1,Y-30,w-2,1);
    txt(a,X+4,Y-28,'#ffffff',6,1);if(b)txt(b,X+4,Y-20,'#f6c445',6,1);};

  /* ---------------- THE WORLD'S LARGEST DINOSAUR (drawn over Kinan when he walks behind it) ----------------
     A big chunky T-rex on its stone deck with the visitor centre at its feet. The hips, belly and both legs
     are one solid block, so Kinan really vanishes behind it instead of showing between the legs. */
  P.w06_bigdino=function(X,Y){const G=g();const c='#5f9a4a',d='#457a36',dd='#3a6a2e',b='#c8d890',poly=K.poly;
    const el=(col,x,y,rx,ry,r)=>{G.fillStyle=O;G.beginPath();G.ellipse(x,y,rx+1,ry+1,r||0,0,Math.PI*2);G.fill();G.fillStyle=col;G.beginPath();G.ellipse(x,y,rx,ry,r||0,0,Math.PI*2);G.fill();};
    /* (its soft shadow is the separate w06_dinoshadow prop: a see-through shadow drawn twice would darken) */
    /* visitor centre at the dinosaur's feet: sandstone, flat roof, glass front */
    box('#d8b888',X+58,Y-38,50,38);px('#ecd4a8',X+58,Y-38,50,2);px('#c4a070',X+58,Y-20,50,2);
    px(O,X+55,Y-44,56,7);px('#8a5426',X+56,Y-43,54,5);px('#b07440',X+56,Y-43,54,1);
    for(let i=0;i<4;i++)box('#5aa0c8',X+62+i*11,Y-33,7,9);for(let i=0;i<4;i++)px('#9fd0f0',X+62+i*11,Y-33,2,9);
    box('#5aa0c8',X+64,Y-15,24,15);px('#9fd0f0',X+64,Y-15,24,2);px(O,X+76,Y-15,1,15);box('#2f7d32',X+92,Y-15,12,8);px('#f6c445',X+94,Y-12,8,2);
    /* stone deck */
    box('#b8a888',X-16,Y-11,78,11);px('#d8c8a8',X-16,Y-11,78,2);for(let i=-12;i<62;i+=10)px('#9a8a6c',X+i,Y-8,1,8);
    /* tail sweeping down to the ground, thick at the hips */
    poly(c,[[X+6,Y-76],[X-18,Y-62],[X-40,Y-40],[X-60,Y-15],[X-56,Y-11],[X-30,Y-26],[X-6,Y-38],[X+14,Y-44]]);
    px('#7cba5a',X-36,Y-44,10,2);px('#7cba5a',X-20,Y-58,10,2);
    /* far leg, and the shaded belly that fills the gap between the legs */
    poly(dd,[[X+28,Y-62],[X+56,Y-54],[X+56,Y-24],[X+64,Y-12],[X+32,Y-11],[X+32,Y-34]]);
    el(dd,X+24,Y-32,28,21);
    /* body, tilted up toward the head */
    el(c,X+22,Y-60,36,24,-0.55);
    G.fillStyle=b;G.beginPath();G.ellipse(X+34,Y-54,15,10,-0.55,0,Math.PI*2);G.fill();
    px('#7cba5a',X+2,Y-74,14,2);px('#7cba5a',X+12,Y-82,12,2);
    /* near leg: big thigh, shin and three-toed foot */
    el(d,X+8,Y-40,15,17);
    poly(d,[[X,Y-32],[X+20,Y-32],[X+18,Y-14],[X+30,Y-11],[X-6,Y-11]]);
    for(let i=0;i<3;i++)px('#f4f1e8',X-4+i*10,Y-13,3,2);
    /* the stair door into the leg */
    box('#8a5426',X+4,Y-27,7,13);px('#f6c445',X+9,Y-21,1,2);
    /* neck */
    poly(c,[[X+34,Y-92],[X+58,Y-104],[X+64,Y-86],[X+48,Y-70]]);
    /* head: upper jaw, open mouth with visitors waving, lower jaw */
    poly('#7a1f2a',[[X+50,Y-106],[X+100,Y-114],[X+100,Y-96],[X+54,Y-90]]);
    [[60,'#e8364b'],[68,'#2a5bd7'],[76,'#f6c445'],[84,'#ff6fae']].forEach(([a,col])=>{px(col,X+a,Y-101,4,5);px('#d9a27a',X+a,Y-105,4,3);});
    poly(c,[[X+38,Y-124],[X+68,Y-134],[X+102,Y-126],[X+104,Y-116],[X+64,Y-108],[X+44,Y-102]]);
    px('#7cba5a',X+48,Y-128,36,2);
    for(let i=56;i<100;i+=6)px('#ffffff',X+i,Y-112+Math.round((i-56)*-0.1),2,3);
    poly(c,[[X+52,Y-94],[X+100,Y-98],[X+100,Y-90],[X+56,Y-82]]);
    for(let i=60;i<98;i+=6)px('#ffffff',X+i,Y-97,2,2);
    px(O,X+60,Y-124,6,5);px('#f6c445',X+61,Y-123,3,3);px(O,X+98,Y-124,2,1);px('#3f7a34',X+56,Y-129,12,2);
    /* little arms */
    px(O,X+44,Y-76,12,4);px(d,X+45,Y-75,10,2);px(O,X+54,Y-76,3,8);
    P.label(X+40,Y-156,"WORLD'S LARGEST DINOSAUR");};
  /* the dinosaur is drawn as an overProp, which scatter does not see; this blank prop keeps trees off it */
  P.w06_keep=function(){};
  P.w06_dinoshadow=function(X,Y){shadow(X+30,Y+3,74,7);};
  P.w06_swing=function(X,Y1,Y2){/* rope rails, hanger ropes and planks over the suspension bridge, with its timber towers */
    for(let y=Y1+2;y<Y2-1;y+=3)px('#c99a5c',X-6,y,12,2);
    [X-9,X+8].forEach(x=>{const G=g();G.strokeStyle=O;G.lineWidth=1;G.beginPath();G.moveTo(x,Y1-14);G.quadraticCurveTo(x+(x<X?-5:5),(Y1+Y2)/2,x,Y2-14);G.stroke();
      for(let y=Y1;y<Y2;y+=5)px('#5e3b20',x,y-2,1,3);});
    [[X-12,Y1],[X+9,Y1],[X-12,Y2],[X+9,Y2]].forEach(([x,y])=>{box('#8a5a32',x,y-16,4,16);px('#c99a5c',x,y-16,4,2);});};
  /* ---------------- ROYAL TYRRELL MUSEUM (modern, low, in the badlands) ---------------- */
  P.w06_museum=function(X,Y){const G=g();const W=124;
    shadow(X+W/2,Y+3,W/2+8,6);
    /* terraced sandstone body */
    box('#d8b888',X,Y-22,W,22);px('#c4a070',X,Y-12,W,2);px('#ecd4a8',X,Y-22,W,2);
    box('#c9a878',X+8,Y-34,W-34,12);px('#e0c498',X+8,Y-34,W-34,2);
    box('#b89468',X+18,Y-42,W-60,8);
    for(let i=0;i<10;i++)box('#4a6a8a',X+4+i*12,Y-18,7,6);
    /* the big slanted glass atrium */
    tri(O,[[X+60,Y+1],[X+74,Y-52],[X+104,Y-52],[X+112,Y+1]]);tri('#5aa0c8',[[X+62,Y],[X+75,Y-50],[X+103,Y-50],[X+110,Y]]);
    G.save();G.beginPath();G.moveTo(X+62,Y);G.lineTo(X+75,Y-50);G.lineTo(X+103,Y-50);G.lineTo(X+110,Y);G.closePath();G.clip();
    G.fillStyle='#9fd0f0';G.fillRect(X+62,Y-50,8,50);G.fillStyle='#3a7ca8';for(let k=0;k<50;k+=7)G.fillRect(X+60,Y-50+k,52,1);for(let k=0;k<48;k+=8)G.fillRect(X+64+k,Y-50,1,50);G.restore();
    /* entrance */
    box('#2b2f45',X+80,Y-12,14,12);px('#f6c445',X+80,Y-14,14,2);
    /* a skeleton on the lawn sign */
    px('#f4f1e8',X+6,Y-30,1,1);
    P.label(X+W/2,Y+4,'ROYAL TYRRELL MUSEUM');};
  /* the T-rex skeleton sculpture out front */
  P.w06_skeleton=function(X,Y){const c='#f4f1e8';shadow(X+12,Y+1,16,3);
    line(O,3,[[X-14,Y-14],[X,Y-18],[X+16,Y-20]]);line(c,1,[[X-14,Y-14],[X,Y-18],[X+16,Y-20]]);
    for(let i=-10;i<14;i+=3)px(c,X+i,Y-18+(i<0?2:0),1,4);
    line(O,3,[[X+4,Y-18],[X+2,Y-8],[X+6,Y]]);line(c,1,[[X+4,Y-18],[X+2,Y-8],[X+6,Y]]);line(O,3,[[X+10,Y-19],[X+12,Y-8],[X+10,Y]]);line(c,1,[[X+10,Y-19],[X+12,Y-8],[X+10,Y]]);
    box(c,X+16,Y-26,10,6);px(O,X+22,Y-25,1,1);px(O,X+18,Y-21,7,1);};

  /* ---------------- ROBO-REX (the boss) ---------------- */
  P.w06_robo=function(X,Y){const G=g();const m='#9aa3b2',dk='#6f7889';
    shadow(X+26,Y+3,34,5);
    /* tail segments */
    [[-22,-24],[-14,-26],[-6,-28]].forEach(([a,b],i)=>box(i%2?dk:m,X+a,Y+b,9,6));
    /* legs */
    box(dk,X+8,Y-22,10,18);box(dk,X+26,Y-22,10,18);box('#4a5160',X+4,Y-6,16,6);box('#4a5160',X+24,Y-6,16,6);px('#f6c445',X+10,Y-16,6,2);px('#f6c445',X+28,Y-16,6,2);
    /* body with glowing chest panel */
    box(m,X,Y-42,44,22);px('#c9d0dc',X,Y-42,44,3);box('#2b2f45',X+14,Y-36,16,10);px('#00ffd0',X+16,Y-34,12,2);px('#ff3d3d',X+16,Y-30,4,2);px('#f6c445',X+22,Y-30,6,2);
    for(let i=2;i<44;i+=8)px('#4a5160',X+i,Y-24,2,2);
    /* neck and boxy head with a red visor and steel teeth */
    box(m,X+32,Y-56,12,16);box(m,X+34,Y-72,34,16);px('#c9d0dc',X+34,Y-72,34,3);box('#e8364b',X+50,Y-68,14,4);px('#ffb4b4',X+52,Y-67,4,2);
    box(dk,X+38,Y-58,30,6);for(let i=40;i<68;i+=4){px('#ffffff',X+i,Y-58,2,2);}
    px(O,X+42,Y-80,1,8);box('#ff3d3d',X+40,Y-83,4,3);
    /* claw arms */
    box(dk,X+42,Y-38,12,4);px('#ffffff',X+54,Y-38,2,2);px('#ffffff',X+54,Y-35,2,2);
    P.label(X+30,Y-98,'ROBO-REX');};

  /* ---------------- HOODOOS ---------------- */
  P.w06_hoodoo=function(X,Y,s){s=s||1;const w=Math.round(8*s),h=Math.round(22*s);shadow(X,Y+1,w,3);
    const G=g();G.fillStyle=O;G.beginPath();G.moveTo(X-w/2-1,Y+1);G.lineTo(X-w/2+2,Y-h);G.lineTo(X+w/2-2,Y-h);G.lineTo(X+w/2+1,Y+1);G.fill();
    for(let i=0;i<h;i++){const ww=w-Math.round(4*i/h);px(['#e8b07a','#c9804c','#f2d0a6','#bb744c'][Math.floor(i/4)%4],X-ww/2,Y-i,ww,1);}
    ell(O,X,Y-h-2,w*0.9+1,4*s+1);ell('#6f5a48',X,Y-h-2,w*0.9,4*s);ell('#8a7460',X-1,Y-h-3,w*0.6,2*s);};
  P.w06_boardwalk=function(X,Y,n){for(let i=0;i<n;i++){px('#5e3b20',X+i*6,Y-1,6,4);px('#c99a5c',X+i*6,Y,5,2);}px('#5e3b20',X,Y-4,n*6,1);for(let i=0;i<n;i+=2)px('#5e3b20',X+i*6,Y-4,1,4);};

  /* ---------------- FOSSIL DIG ---------------- */
  P.w06_dig=function(X,Y){const G=g();
    shadow(X+40,Y+3,48,5);
    /* the dig pit with a string grid */
    box('#a8784a',X,Y-26,64,26);px('#8a5e36',X,Y-26,64,3);
    for(let i=0;i<=64;i+=16)px('#f4f1e8',X+i,Y-26,1,26);for(let j=0;j<=26;j+=13)px('#f4f1e8',X,Y-26+j,64,1);
    for(let i=0;i<=64;i+=16)for(let j=0;j<=26;j+=13)px('#e8364b',X+i-1,Y-27+j,3,3);
    /* bones coming out of the rock */
    px('#f4f1e8',X+18,Y-17,26,3);for(let i=20;i<42;i+=4){px('#f4f1e8',X+i,Y-22,2,5);px('#f4f1e8',X+i,Y-14,2,3);}box('#f4f1e8',X+44,Y-20,8,6);px(O,X+48,Y-19,1,1);px('#f4f1e8',X+6,Y-8,10,2);px('#f4f1e8',X+50,Y-9,8,2);
    /* tent, wheelbarrow, sieve and tools */
    tri(O,[[X+70,Y+1],[X+84,Y-22],[X+98,Y+1]]);tri('#f6c445',[[X+72,Y],[X+84,Y-20],[X+96,Y]]);tri('#d8a020',[[X+84,Y-20],[X+96,Y],[X+84,Y]]);px('#5e3b20',X+82,Y-8,4,8);
    box('#2a5bd7',X-14,Y-8,10,5);px(O,X-10,Y-3,3,3);px('#6f4a26',X-4,Y-7,6,1);
    box('#9aa3b2',X+66,Y-34,12,4);px('#c9d0dc',X+67,Y-33,10,1);px('#6f4a26',X+68,Y-30,1,4);px('#6f4a26',X+75,Y-30,1,4);
    px('#6f4a26',X+56,Y-40,1,10);box('#9aa3b2',X+54,Y-42,5,3);
    P.label(X+40,Y+4,'FOSSIL DIG');};

  /* ---------------- BLERIOT FERRY: the cable and the little ferry ---------------- */
  P.w06_cable=function(X1,Y1,X2,Y2){line(O,1,[[X1,Y1],[X2,Y2]]);line(O,1,[[X1+10,Y1],[X2+10,Y2]]);box('#6b6f7a',X1-4,Y1-6,6,6);box('#6b6f7a',X2-4,Y2,6,6);box('#6b6f7a',X1+8,Y1-6,6,6);box('#6b6f7a',X2+8,Y2,6,6);
    P.label(X1+52,Y1+46,'BLERIOT FERRY');};
  A.w06_ferry=function(t,X1,Y1,X2,Y2){const u=(Math.sin(t/2200)+1)/2;const x=X1+(X2-X1)*u,y=Y1+(Y2-Y1)*u;
    box('#9aa3b2',x-6,y-5,24,10);px('#c9d0dc',x-6,y-5,24,2);px('#f6c445',x-6,y-6,24,1);px('#f6c445',x-6,y+5,24,1);
    box('#f4f1e8',x+12,y-12,7,8);px('#7ec8ff',x+13,y-11,5,3);box('#e8364b',x-2,y-3,10,5);px('#cfeeff',x,y-2,4,2);};

  /* ---------------- HORSESHOE CANYON + the hidden fossil cave ---------------- */
  P.w06_lookout=function(X,Y){box('#a8692e',X-16,Y-3,32,4);for(let i=-16;i<=16;i+=4)px('#5e3b20',X+i,Y-9,1,7);px('#5e3b20',X-16,Y-9,33,1);P.label(X+96,Y-40,'HORSESHOE CANYON');};
  P.w06_cave=function(X,Y){const G=g();
    G.fillStyle=O;G.beginPath();G.ellipse(X,Y-6,22,14,0,Math.PI,0);G.fill();G.fillStyle='#a8664a';G.beginPath();G.ellipse(X,Y-6,21,13,0,Math.PI,0);G.fill();px('#c27a4a',X-21,Y-10,42,2);px('#d9a066',X-18,Y-15,36,2);
    G.fillStyle=O;G.beginPath();G.ellipse(X,Y-4,10,9,0,Math.PI,0);G.fill();px(O,X-10,Y-4,20,4);
    px('#f6c445',X-5,Y-8,2,2);px('#f4f1e8',X+2,Y-7,4,1);px('#f4f1e8',X+3,Y-9,1,3);};

  /* ---------------- ATLAS COAL MINE tipple, Rosedale's old mine, badlands sunset butte ---------------- */
  P.w06_tipple=function(X,Y){const G=g();shadow(X+14,Y+2,20,4);
    for(let i=0;i<5;i++){px(O,X+i*7,Y-48+i*4,2,48-i*4);}
    box('#8a5a32',X-2,Y-58,24,14);px('#a8763c',X-2,Y-58,24,2);for(let k=0;k<3;k++)px('#5e3b20',X+2+k*7,Y-54,4,6);
    line('#5e3b20',2,[[X+22,Y-52],[X+44,Y-20]]);line('#a8763c',1,[[X+22,Y-54],[X+44,Y-22]]);
    for(let i=0;i<5;i++)line('#5e3b20',1,[[X+i*7,Y-44+i*4],[X+i*7+7,Y-40+i*4+8]]);
    px('#4a4f57',X+38,Y-14,12,6);P.label(X+14,Y+4,'ATLAS COAL MINE');};
  P.w06_minehut=function(X,Y){box('#8a5a32',X,Y-12,20,12);px(O,X-2,Y-16,24,5);px('#6f4a26',X-1,Y-15,22,3);box('#2b2f45',X+7,Y-8,6,8);};
  P.w06_butte=function(X,Y){const G=g();shadow(X,Y+3,46,6);
    G.fillStyle=O;G.beginPath();G.moveTo(X-44,Y+1);G.lineTo(X-30,Y-36);G.lineTo(X+30,Y-36);G.lineTo(X+44,Y+1);G.fill();
    for(let i=0;i<36;i++){const w=88-Math.round(28*i/36);px(['#d8704c','#f6c890','#c85a48','#f0a070','#a84e30'][Math.floor(i/5)%5],X-w/2,Y-i,w,1);}
    px('#6f4a3a',X-30,Y-38,60,3);px('#ffd8a0',X-28,Y-36,22,1);P.label(X,Y+4,'BADLANDS AT SUNSET');};
  P.w06_sun=function(X,Y){const G=g();G.fillStyle='rgba(255,170,80,.35)';G.beginPath();G.arc(X,Y,22,0,Math.PI*2);G.fill();G.fillStyle=O;G.beginPath();G.arc(X,Y,16,0,Math.PI*2);G.fill();G.fillStyle='#ff9a4a';G.beginPath();G.arc(X,Y,15,0,Math.PI*2);G.fill();G.fillStyle='#ffd27a';G.beginPath();G.arc(X-3,Y-3,9,0,Math.PI*2);G.fill();};
  P.w06_lbl=function(X,Y,s,c){P.label(X,Y,s,c);};

  /* Highway through town: north from 6-1 to the dinosaur stop, then it arches round BEHIND the World's
     Largest Dinosaur and its visitor centre and heads east to the hoodoos. Smoothed once here so the road
     and Kinan's walk use exactly the same points. */
  const chaikin=(pts,n)=>{let p=pts;for(let k=0;k<n;k++){const q=[p[0]];for(let i=0;i<p.length-1;i++){const[a,b]=p[i],[c,d]=p[i+1];q.push([a*0.75+c*0.25,b*0.75+d*0.25],[a*0.25+c*0.75,b*0.25+d*0.75]);}q.push(p[p.length-1]);p=q;}return p.map(([a,b])=>[Math.round(a*10)/10,Math.round(b*10)/10]);};
  const S1=[470,462];
  const UP=chaikin([[452,600],[466,530],S1],3);                                                   /* 6-1 north to the dinosaur stop */
  const BEHIND=chaikin([S1,[480,436],[502,420],[550,414],[630,414],[668,424],[694,446],[718,476],[780,520]],3);  /* behind the dinosaur, out east */
  const yAt=(pts,X0)=>{let best=pts[0];for(const q of pts)if(Math.abs(q[0]-X0)<Math.abs(best[0]-X0))best=q;return best[1];};
  K.W.push({ n:6, hud:'DRUMHELLER', name:'Kinan vs. Robo-Rex',
    where:'Drumheller: in on Highway 9 past Horseshoe Canyon and down into the striped badlands of the Red Deer River valley, from the World\'s Largest Dinosaur out to the hoodoos, the fossil beds and the dinosaur museum, over the swinging bridge, past the cable ferry, back down to Horseshoe Canyon and the badlands at sunset, then over the old mine trestle where Robo-Rex runs wild on the Dinosaur Trail. A tour bus heads west through the mountains.',
    marks:"The World's Largest Dinosaur in town, the Royal Tyrrell Museum in the badlands, the hoodoos and the Atlas Coal Mine near East Coulee, the swinging suspension bridge at Rosedale, the Bleriot cable ferry, the Red Deer River, Horseshoe Canyon on the prairie and the fossil dig sites.",
    size:[1040,740], ground:'badlands', water:'blue', cliff:'badlands', path:'sand',
    rivers:[{pts:[[-20,232],[60,224],[130,206],[200,186],[260,200],[300,230],[400,262],[520,286],[620,316],[720,360],[820,400],[920,430],[1060,450]],w:18},{pts:[[694,348],[748,374]],w:26}],
    zones:[{k:'w06_canyon',f:(X,Y)=>inCanyon(X,Y)},{k:'wheat',f:(X,Y)=>Y<34||Y>690||(X<420&&Y>404)},{k:'w06_sunset',e:[96,318,72,52]},
      {k:'w06_flats',e:[580,420,120,50]},{k:'w06_flats',f:(X,Y,w)=>w.rd(X,Y)<30}],
    roads:[
      [[0,612],[110,616],[250,618],[370,614],...UP,...BEHIND.slice(1),[900,566],[1040,606]],   // Hwy 9 in from Calgary past Horseshoe Canyon, behind the big dinosaur, then Hwy 10 to the hoodoos
      [[440,740],[452,600]],                                                                       // Hwy 56 south
      [[0,142],[70,140],[130,132],[190,140],[240,160],[330,198],[480,224],[600,268],[640,296],[640,yAt(BEHIND,640)]],   // North Dinosaur Trail (Hwy 838) west to the mountains + the town bridge
      [[322,266],[350,286],[420,312],[520,330],[600,346],[690,388],[760,430],[780,520]],           // South Dinosaur Trail along the river, from the ferry landing
      [[980,589],[990,520],[990,0]]],                                                              // East Coulee road
    bridges:[[252,198,'wood'],[640,324,'traffic'],[720,360,'suspension'],[990,440,'beam']],
    J:{a:[980,589],b:[990,400],c:[640,296],d:[717,404]},
    /* one journey: the van from Calgary comes in on Highway 9; the tour bus leaves west on the Dinosaur Trail */
    entryPath:{from:[0,612],via:[[110,616],[250,618],[370,614]],road:1},
    exitPath:{to:[0,142],via:[[240,160],[190,140],[130,132],[70,140]],road:1,ride:'bus'},
    stops:[
      {at:[452,600],name:'6-1  INTO THE VALLEY',st:'open'},
      {at:S1,name:"6-2  THE WORLD'S LARGEST DINOSAUR",st:'lock'},
      {at:[900,566],name:'6-3  THE HOODOO TRAIL',st:'lock'},
      {at:[880,262],name:'6-4  THE FOSSIL DIG',st:'lock'},
      {at:[480,224],name:'6-5  THE MUSEUM HALLS',st:'lock'},
      {at:[720,320],name:'FORT  THE SWINGING BRIDGE',st:'fort'},
      {at:[322,266],name:'6-6  THE RIVER FERRY',st:'lock'},
      {at:[250,492],name:'6-7  HORSESHOE CANYON',st:'lock'},
      {at:[250,554],name:'SECRET  THE HIDDEN FOSSIL CAVE',st:'secret'},
      {at:[96,330],name:'6-8  BADLANDS AT SUNSET',st:'lock'},
      {at:[252,165],name:'CASTLE  ROBO-REX RUNS WILD  -  ROBO-REX',st:'boss'}],   /* on the road, 216 px + camera lag from the edge, so arriving back from the road trip never shows past the map */
    edges:[
      [0,1,UP.slice(1,-1),{road:1}],
      [1,2,BEHIND.slice(1),{road:1}],
      [2,'a',[],{road:1}],
      ['a','b',[[990,520]],{road:1}],
      ['b',3,[[962,318]]],
      [3,4,[[780,176],[620,152],[540,190]]],
      [4,'c',[[600,268]],{road:1}],
      ['c',5,[[676,308],[700,312]]],
      [5,'d',[[720,392]]],
      ['d',6,[[690,388],[600,346],[520,330],[420,312],[350,286]],{road:1}],
      [6,7,[[306,330],[266,410]]],
      [7,8,[]],
      [7,9,[[204,504],[160,476],[118,410]]],
      [9,10,[[102,290],[126,262],[170,240],[220,230],[246,222],[252,206],[252,176]]]],
    exit:[20,142],
    overProps:[['w06_bigdino',520,436]],
    props:[
      ['w06_keep',460,420],['w06_keep',530,400],['w06_keep',580,330],['w06_keep',590,410],['w06_keep',500,452],['w06_keep',570,456],['w06_dinoshadow',520,435],['w06_keep',172,262],
      ['w06_museum',350,192],['w06_robo',250,128],
      ['w06_dig',836,282],['w06_tipple',922,512],['w06_swing',720,334,386],['w06_minehut',742,314],
      ['w06_hoodoo',860,612,1.5],['w06_hoodoo',884,628,1.2],['w06_hoodoo',912,612,1.6],['w06_hoodoo',940,630,1.3],['w06_hoodoo',966,616,1.1],['w06_hoodoo',846,546,1.2],['w06_hoodoo',944,548,1.3],['w06_boardwalk',858,640,18],['w06_lbl',912,646,'HOODOOS'],
      ['w06_cable',318,198,316,254],
      ['w06_lookout',250,504],['canyonCrack',236,524,28],['w06_cave',250,588],
      ['w06_sun',150,318],['w06_butte',150,356],
      ['w06_lbl',784,356,'SWINGING BRIDGE'],['w06_lbl',180,190,'OLD MINE TRESTLE'],['w06_lbl',430,258,'RED DEER RIVER'],['w06_lbl',650,500,'DRUMHELLER'],
      ['dinoStatue',404,470],['dinoStatue',728,466],['dinoStatue',492,560],
      ['w06_sign',6,124,'TO WORLD 7','VANCOUVER','#2a5bd7'],['w06_sign',10,598,'WELCOME TO','DRUMHELLER'],
      ...K.homes([[466,380,'#e8364b'],[430,410,'#2a5bd7'],[664,410,'#44c55a'],[694,438,'#8a5426'],[520,540,'#2a5bd7'],[560,520,'#44c55a'],[600,540,'#e8364b'],[640,520,'#8a5426'],[680,540,'#2a5bd7'],[700,500,'#44c55a']])],
    scatter:[{k:'w06_hoodoo',n:26,zone:'badlands'},{k:'tree',n:70,zone:'w06_flats'},{k:'rockpile',n:16,zone:'badlands'},{k:'cactus',n:12,zone:'badlands'},{k:'bush',n:20,zone:'wheat'},{k:'w06_hoodoo',n:6,zone:'w06_canyon'}],
    anim:[['w06_ferry',318,212,318,240],['canflag',498,446]] });
})(KINAN);

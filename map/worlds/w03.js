/* World 3: Robin's Oilfield Trip (Kinan vs. the Safety Foreman) */
(function(K){
  const {px,box,shadow,txt,hash}=K; const g=()=>K.g();
  /* ---------- ground looks ---------- */
  const NX=850,NY=322,NRX=120,NRY=80;   /* the night-shift clearing around Robin's rig */
  const nd=(X,Y)=>((X-NX)/NRX)**2+((Y-NY)/NRY)**2;
  /* the lease road: wide gravel shoulders painted under the gravel path, so it reads as a real road */
  let LM=null,LME=null;
  const leaseMask=w=>{if(LM&&LME===w.E)return LM;LME=w.E;LM=new Uint8Array(w.WW*w.WH);
    w.E.forEach(e=>{if(e.road)return;for(const[x,y]of e.geo){const cx=Math.round(x),cy=Math.round(y);for(let dy=-9;dy<=9;dy++)for(let dx=-9;dx<=9;dx++){const d=dx*dx+dy*dy;if(d>81)continue;const X=cx+dx,Y=cy+dy;if(X<0||Y<0||X>=w.WW||Y>=w.WH)continue;const v=d<=56?2:1;if(LM[Y*w.WW+X]<v)LM[Y*w.WW+X]=v;}}});return LM;};
  let LW=0;K.GROUND.w03_lease=(X,Y)=>LM&&LM[Y*LW+X]===1?'#5e4e36':(hash(X,Y)>.9?'#8a7a5c':'#a8987a');K.RIM.w03_lease='#c8b898';K.LINE.w03_lease='#3b2618';
  K.GROUND.w03_night=(X,Y)=>hash(X>>1,Y>>1)>.95?'#34504a':'#22363a';
  K.GROUND.w03_dusk=(X,Y)=>hash(X>>1,Y>>1)>.95?'#4e7a44':'#36603a';
  K.GROUND.w03_nightpad=(X,Y)=>hash(X,Y)>.9?'#5a5a66':'#484a56';
  K.GROUND.w03_oilsand=(X,Y)=>hash(X>>1,Y>>1)>.9?'#4a3a2a':'#5e4a34';
  K.GROUND.w03_garden=(X,Y)=>Y%8<3?'#5e3b20':((X>>2)%3===0?'#44c55a':'#86603c');
  K.GROUND.w03_muskeg=(X,Y)=>{const h=hash(X>>2,Y>>2);return h>.84?'#4a7c9a':h>.6?'#6a7a3a':'#7d8a44';};
  /* the bottom edge fades from boreal to plain grass, so the map meets World 2 and World 4 (grass) without a hard line */
  K.GROUND.w03_fade=(X,Y)=>hash(X>>1,(Y>>1)+77)<(Y-680)/40?K.GROUND.grass(X,Y):K.GROUND.boreal(X,Y);K.RIM.w03_fade=K.RIM.boreal;K.LINE.w03_fade=K.LINE.boreal;
  K.GROUND.w03_clearing=(X,Y)=>hash(X>>1,Y>>1)>.93?'#c8c070':'#a8b85a';
  [['w03_night','#34504a','#101c20'],['w03_dusk','#4e7a44','#1b3014'],['w03_nightpad','#6a6a76','#1b1220'],['w03_oilsand','#7a6248','#2a1a10'],['w03_garden','#a8ec74','#2e6423'],['w03_muskeg','#a8b870','#244a1c'],['w03_clearing','#d8e08a','#244a1c']]
    .forEach(([k,r,l])=>{K.RIM[k]=r;K.LINE[k]=l;});

  /* ---------- Onion Lake farm ---------- */
  K.P.w03_farmhouse=function(X,Y){shadow(X+26,Y+2,30,4);box('#f4f1e8',X,Y-26,52,26);px('#1b1220',X-4,Y-40,60,15);px('#44c55a',X-3,Y-39,58,13);px('#8fe09a',X-3,Y-39,58,3);box('#9a968c',X+40,Y-48,7,10);
    box('#7ec8ff',X+6,Y-19,9,8);box('#7ec8ff',X+36,Y-19,9,8);box('#8a5426',X+22,Y-16,9,16);px('#a8692e',X-2,Y-4,56,4);for(let i=0;i<56;i+=8)px('#6f4a26',X-2+i,Y-10,2,7);};
  K.P.w03_barn=function(X,Y){shadow(X+24,Y+2,28,4);box('#c2414f',X,Y-30,48,30);const G=g();G.fillStyle='#1b1220';G.beginPath();G.moveTo(X-4,Y-29);G.lineTo(X+10,Y-44);G.lineTo(X+38,Y-44);G.lineTo(X+52,Y-29);G.fill();G.fillStyle='#7d1f33';G.beginPath();G.moveTo(X-2,Y-30);G.lineTo(X+11,Y-42);G.lineTo(X+37,Y-42);G.lineTo(X+50,Y-30);G.fill();
    box('#f4f1e8',X+16,Y-18,16,18);px('#c2414f',X+18,Y-16,12,14);for(let i=0;i<14;i++){px('#f4f1e8',X+18+i*0.85,Y-16+i,2,1);px('#f4f1e8',X+30-i*0.85,Y-16+i,2,1);}box('#f4f1e8',X+19,Y-38,10,7);px('#f6c445',X+21,Y-36,6,4);};
  K.P.w03_coop=function(X,Y){box('#a8692e',X,Y-12,20,12);px('#1b1220',X-2,Y-17,24,6);px('#6f4a26',X-1,Y-16,22,4);px('#1b1220',X+8,Y-6,4,6);[[26,0],[32,4],[24,8]].forEach(([a,b])=>{px('#1b1220',X+a-1,Y+b-5,6,5);px('#ffffff',X+a,Y+b-4,4,3);px('#e8364b',X+a+3,Y+b-6,1,2);px('#f6c445',X+a+4,Y+b-3,1,1);});};
  K.P.w03_mailbox=function(X,Y){shadow(X+1,Y+1,4,2);px('#5e3b20',X,Y-10,2,10);box('#9aa3b2',X-3,Y-15,9,5);px('#c9d0dc',X-2,Y-14,7,1);px('#e8364b',X+6,Y-18,1,5);px('#e8364b',X+6,Y-18,3,2);};
  K.P.w03_bale=function(X,Y){const G=g();G.fillStyle='#1b1220';G.beginPath();G.arc(X,Y-6,7,0,Math.PI*2);G.fill();G.fillStyle='#e8c060';G.beginPath();G.arc(X,Y-6,6,0,Math.PI*2);G.fill();G.strokeStyle='#b8894e';G.beginPath();G.arc(X,Y-6,3,0,Math.PI*2);G.stroke();};
  K.P.w03_lbl=function(X,Y,s){K.P.label(X,Y,s);};
  /* ---------- highway ---------- */
  K.P.w03_fmm=function(X,Y){shadow(X+52,Y+3,56,5);px('#1b1220',X+14,Y-14,4,14);px('#1b1220',X+86,Y-14,4,14);
    box('#1f5e8a',X,Y-52,104,40);px('#ffffff',X+2,Y-50,100,1);px('#ffffff',X+2,Y-15,100,1);txt('WELCOME TO',X+28,Y-48,'#ffffff',7,1);txt('FORT McMURRAY',X+8,Y-37,'#f6c445',11,1);
    for(let i=0;i<10;i++){const x0=X+6+i*8;for(let k=0;k<6;k++)px('#2f8a3a',x0+3-Math.floor(k/2),Y-22+k,1+Math.floor(k/2)*2,1);}px('#1b1220',X+90,Y-28,2,12);px('#ff8a3d',X+89,Y-32,4,4);px('#f6c445',X+90,Y-31,2,2);};
  K.P.w03_shield=function(X,Y,n){px('#1b1220',X+6,Y-10,2,10);box('#ffffff',X,Y-24,14,14);px('#2f7d32',X+1,Y-23,12,4);txt(n,X+2,Y-19,'#1b1220',8,1);};
  K.P.w03_camp=function(X,Y){/* rows of camp trailers + the breakfast kitchen */for(let r=0;r<3;r++)for(let c=0;c<2;c++)K.P.trailer(X+c*46,Y-r*15,r%2?'#ddd6c2':'#eee8d6');
    box('#c8603c',X+96,Y-26,34,26);box('#ffffff',X+98,Y-24,30,8);txt('KITCHEN',X+99,Y-23,'#c8463e',5,1);box('#cfeeff',X+100,Y-13,8,6);box('#3b2618',X+116,Y-12,8,12);box('#9aa3b2',X+122,Y-34,6,8);
    K.P.label(X+64,Y-66,'WORK CAMP');};
  K.P.w03_town=function(X,Y){K.P.label(X,Y,'FORT McMURRAY');};
  K.P.w03_gas=function(X,Y){shadow(X+24,Y+2,28,4);px('#1b1220',X-2,Y-26,52,6);px('#e8364b',X-1,Y-25,50,4);px('#1b1220',X+4,Y-21,2,21);px('#1b1220',X+42,Y-21,2,21);box('#f4f1e8',X+16,Y-10,6,10);box('#f4f1e8',X+28,Y-10,6,10);box('#e2d6bc',X+52,Y-18,26,18);box('#cfeeff',X+56,Y-14,8,6);};
  /* ---------- lease road country ---------- */
  K.P.w03_stuck=function(X,Y){K.P.truck(X,Y,'#2a5bd7');px('#5e3b20',X-2,Y-3,46,4);px('#86603c',X+2,Y-2,6,2);px('#86603c',X+28,Y-2,6,2);};
  K.P.w03_puddle=function(X,Y,w){const G=g();G.fillStyle='#3b2618';G.beginPath();G.ellipse(X,Y,w+1,w*0.4+1,0,0,Math.PI*2);G.fill();G.fillStyle='#6a8aa0';G.beginPath();G.ellipse(X,Y,w,w*0.4,0,0,Math.PI*2);G.fill();px('#cfe4ff',X-w/2,Y-1,3,1);};
  K.P.w03_bullmoose=function(X,Y){shadow(X+18,Y+2,24,4);const B='#5a3418',D='#3b2210';box(B,X,Y-20,36,14);px('#7a4a28',X+2,Y-19,30,3);px(D,X+3,Y-6,4,8);px(D,X+10,Y-6,4,8);px(D,X+24,Y-6,4,8);px(D,X+30,Y-6,4,8);
    box(B,X+30,Y-30,12,14);box(B,X+38,Y-26,10,9);px('#1b1220',X+46,Y-23,2,2);px('#1b1220',X+36,Y-27,2,2);px(D,X+34,Y-16,4,8);
    /* big antlers */const A='#e6d0a0';box(A,X+20,Y-40,14,5);box(A,X+40,Y-40,14,5);[[20,-46],[25,-48],[30,-46],[42,-46],[47,-48],[52,-46]].forEach(([a,b])=>box(A,X+a,Y+b,3,6));px('#1b1220',X+34,Y-36,6,6);px(B,X+35,Y-35,4,4);
    K.P.label(X+24,Y+4,'BIG BULL MOOSE');};
  /* a real hydro-vac truck, side view, cab on the right: white cab with amber beacons, a big debris tank with a ROUND rear door,
     water tank + tool boxes along the side, and the thick black vacuum hose on a boom arching from the tank top over the cab and down */
  const HV_DARK={'#e8364b':'#a8243a','#ff8a3d':'#c25a1c','#f6c445':'#c8941c'};
  K.P.w03_hydrovac=function(X,Y,c){const G=g(),O='#1b1220',dk=HV_DARK[c]||'#6b6f7a';
    shadow(X+36,Y+2,40,5);
    /* chassis rail */
    px(O,X+2,Y-11,64,5);px('#3a3e48',X+3,Y-10,62,3);
    /* side gear under the tank: white water tank, then aluminium tool boxes */
    box('#eef2f8',X+24,Y-16,13,6);px('#ffffff',X+25,Y-15,11,1);px('#b4bcc8',X+24,Y-11,13,1);px(O,X+30,Y-16,1,6);
    box('#c9d0dc',X+39,Y-16,8,6);px('#9aa3b2',X+39,Y-13,8,1);px('#ffffff',X+40,Y-15,2,1);
    /* the debris tank */
    G.fillStyle=O;G.beginPath();G.roundRect(X+4,Y-36,43,23,8);G.fill();
    G.fillStyle=c;G.beginPath();G.roundRect(X+5,Y-35,41,21,7);G.fill();
    px(dk,X+8,Y-19,37,4);px('rgba(255,255,255,.5)',X+16,Y-33,26,2);[24,34].forEach(a=>px(dk,X+a,Y-35,2,21));
    /* round rear door: hinge on top, locking dogs round the rim, inlet in the middle */
    px(O,X+1,Y-39,10,4);px('#9aa3b2',X+2,Y-38,8,2);
    G.fillStyle=O;G.beginPath();G.arc(X+6,Y-24,11,0,Math.PI*2);G.fill();
    G.fillStyle=dk;G.beginPath();G.arc(X+6,Y-24,10,0,Math.PI*2);G.fill();
    G.fillStyle=c;G.beginPath();G.arc(X+6,Y-24,7.5,0,Math.PI*2);G.fill();
    G.fillStyle='rgba(255,255,255,.45)';G.beginPath();G.arc(X+4,Y-27,3,0,Math.PI*2);G.fill();
    G.fillStyle=O;G.beginPath();G.arc(X+6,Y-24,2.6,0,Math.PI*2);G.fill();px('#9aa3b2',X+5,Y-25,2,2);
    [[0,-11],[-10,-3],[-10,4],[0,10],[8,-7],[8,7]].forEach(([a,b])=>px(O,X+6+a-1,Y-24+b-1,3,3));
    /* white cab with windows, nose, bumper and a headlight */
    box('#f4f1e8',X+48,Y-29,15,20);px('#ffffff',X+48,Y-29,15,2);px('#d8d2c4',X+48,Y-12,15,2);
    box('#7ec8ff',X+56,Y-26,6,7);px('#cfeeff',X+57,Y-25,2,5);box('#7ec8ff',X+50,Y-26,4,5);
    box('#f4f1e8',X+63,Y-19,5,10);px('#9aa3b2',X+64,Y-17,3,1);px('#9aa3b2',X+64,Y-15,3,1);px('#f6e7a6',X+66,Y-13,2,2);
    px(O,X+63,Y-10,7,3);
    /* exhaust stack behind the cab */
    px(O,X+45,Y-40,3,14);px('#9aa3b2',X+46,Y-40,1,13);
    /* amber beacons on the cab roof (the flashing glow is an animation) */
    box('#ff8a3d',X+50,Y-32,3,2);box('#ff8a3d',X+58,Y-32,3,2);
    /* wheels: tandem rear axle under the tank, steer axle under the cab */
    [X+13,X+24,X+55].forEach(a=>{G.fillStyle=O;G.beginPath();G.arc(a,Y-4,5,0,Math.PI*2);G.fill();G.fillStyle='#4a4f57';G.beginPath();G.arc(a,Y-4,3.5,0,Math.PI*2);G.fill();px('#c9d0dc',a-1,Y-5,2,2);});
    /* boom on its turret on top of the tank, arching forward over the cab */
    box('#6b6f7a',X+35,Y-40,8,5);
    const boom=[[X+39,Y-40],[X+46,Y-50],[X+58,Y-53],[X+68,Y-47]];
    const L=(col,w,pts)=>{G.strokeStyle=col;G.lineWidth=w;G.lineCap='round';G.lineJoin='round';G.beginPath();pts.forEach(([a,b],i)=>i?G.lineTo(a,b):G.moveTo(a,b));G.stroke();};
    L(O,5,boom);L('#9aa3b2',3,boom);
    /* the fat black vacuum hose hanging from the boom tip down in front of the truck, with a steel dig tube */
    const hose=[[X+68,Y-47],[X+73,Y-40],[X+75,Y-28],[X+74,Y-14]];
    L(O,6,hose);L('#3a3e48',4,hose);for(let k=-44;k<-14;k+=3)px('#6b6f7a',X+73+(k>-30?1:0),Y+k,2,1);
    px(O,X+72,Y-14,4,11);px('#c9d0dc',X+73,Y-14,2,10);};
  /* the steel shop with big bay doors (one open, a truck's round door inside) */
  K.P.w03_shop=function(X,Y){const G=g(),O='#1b1220';shadow(X+46,Y+2,50,5);
    px(O,X-3,Y-46,98,9);px('#6b6f7a',X-2,Y-45,96,7);px('#9aa3b2',X-2,Y-45,96,2);box('#9aa3b2',X+40,Y-52,12,6);
    box('#8aa0b8',X,Y-37,92,37);for(let i=X+3;i<X+92;i+=4)px('#7a90a8',i,Y-37,1,37);
    [[6,0],[34,1],[62,0]].forEach(([a,open])=>{box(open?'#1b1a24':'#e6e9f0',X+a,Y-27,24,27);
      if(open){G.fillStyle=O;G.beginPath();G.arc(X+a+12,Y-12,9,0,Math.PI*2);G.fill();G.fillStyle='#ff8a3d';G.beginPath();G.arc(X+a+12,Y-12,8,0,Math.PI*2);G.fill();G.fillStyle='#c25a1c';G.beginPath();G.arc(X+a+12,Y-12,5,0,Math.PI*2);G.fill();px(O,X+a+11,Y-13,3,3);}
      else for(let r=Y-24;r<Y;r+=4)px('#b4bcc8',X+a,r,24,1);
      px('#f6e7a6',X+a+10,Y-31,4,2);});
    box('#ffffff',X+28,Y-36,36,8);txt('HYDRO VAC',X+30,Y-35,'#c2414f',6,1);};
  /* the slurry dump pit where the trucks empty their tanks */
  K.P.w03_slurry=function(X,Y){const G=g();G.fillStyle='#3b2618';G.beginPath();G.ellipse(X,Y,25,10,0,0,Math.PI*2);G.fill();G.fillStyle='#6b5038';G.beginPath();G.ellipse(X,Y,23,8,0,0,Math.PI*2);G.fill();G.fillStyle='#8a6a4a';G.beginPath();G.ellipse(X-4,Y-1,13,4,0,0,Math.PI*2);G.fill();px('#a8987a',X-8,Y-3,5,1);
    for(let i=-26;i<=26;i+=6){px('#1b1220',X+i,Y-14,1,6);}px('#f6c445',X-26,Y-13,53,1);px('#1b1220',X-26,Y-12,53,1);};
  K.A.w03_amber=function(t,X,Y){if(Math.floor(t/300+X)%2===0){const G=g();G.fillStyle='rgba(255,170,60,.45)';G.beginPath();G.arc(X+1,Y,4,0,Math.PI*2);G.fill();px('#ffe58a',X,Y-1,2,2);}};
  K.P.w03_pipes=function(X,Y,n,c){for(let r=0;r<n;r++)for(let i=0;i<n-r;i++){const cx=X+i*8+r*4,cy=Y-4-r*7;const G=g();G.fillStyle='#1b1220';G.beginPath();G.arc(cx,cy,4.5,0,Math.PI*2);G.fill();G.fillStyle=c||'#9aa3b2';G.beginPath();G.arc(cx,cy,3.5,0,Math.PI*2);G.fill();G.fillStyle='#2b2f45';G.beginPath();G.arc(cx,cy,1.6,0,Math.PI*2);G.fill();}};
  K.P.w03_rack=function(X,Y,w){K.P.piperack(X,Y,w);};
  K.P.w03_pit=function(X,Y,rx,ry){const cols=['#8a6a48','#7a5c3e','#6a4e34','#5a402a','#3a2a1c'];for(let i=0;i<5;i++){const G=g();const a=rx-i*rx*0.18,b=ry-i*ry*0.18;G.fillStyle='#2a1a10';G.beginPath();G.ellipse(X,Y+i*3,a+1,b+1,0,0,Math.PI*2);G.fill();G.fillStyle=cols[i];G.beginPath();G.ellipse(X,Y+i*3,a,b,0,0,Math.PI*2);G.fill();G.fillStyle='rgba(255,255,255,.14)';G.beginPath();G.ellipse(X,Y+i*3-b*0.55,a*0.8,2,0,0,Math.PI*2);G.fill();}
    const G=g();G.fillStyle='#14100c';G.beginPath();G.ellipse(X,Y+14,rx*0.22,ry*0.2,0,0,Math.PI*2);G.fill();px('#4a3a5a',X-6,Y+12,8,2);
    /* haul ramp */G.strokeStyle='#b8a888';G.lineWidth=3;G.beginPath();G.moveTo(X+rx-6,Y-6);G.quadraticCurveTo(X+rx*0.4,Y+ry*0.75,X-rx*0.2,Y+ry*0.45);G.stroke();
    K.P.label(X,Y+ry+6,'OIL SANDS MINE');};
  K.P.w03_headframe=function(X,Y){shadow(X+6,Y+2,12,3);const G=g();G.fillStyle='#14100c';G.beginPath();G.ellipse(X+6,Y-2,9,4,0,0,Math.PI*2);G.fill();
    G.strokeStyle='#1b1220';G.lineWidth=3;G.beginPath();G.moveTo(X-4,Y-2);G.lineTo(X+6,Y-36);G.lineTo(X+16,Y-2);G.moveTo(X+6,Y-36);G.lineTo(X+22,Y-4);G.stroke();G.strokeStyle='#e8364b';G.lineWidth=1;G.beginPath();G.moveTo(X-4,Y-2);G.lineTo(X+6,Y-36);G.lineTo(X+16,Y-2);G.moveTo(X+6,Y-36);G.lineTo(X+22,Y-4);G.stroke();
    G.fillStyle='#1b1220';G.beginPath();G.arc(X+6,Y-36,6,0,Math.PI*2);G.fill();G.strokeStyle='#f6c445';G.lineWidth=1;G.beginPath();G.arc(X+6,Y-36,4,0,Math.PI*2);G.stroke();txt('SHAFT',X-6,Y+1,'#f6c445',5,1);};
  K.P.w03_shovel=function(X,Y){shadow(X+14,Y+2,18,4);box('#f6c445',X,Y-16,26,12);box('#2b2f45',X+4,Y-22,12,7);px('#cfeeff',X+6,Y-20,6,3);px('#1b1220',X-2,Y-4,30,4);
    const G=g();G.strokeStyle='#1b1220';G.lineWidth=3;G.beginPath();G.moveTo(X+22,Y-14);G.lineTo(X+38,Y-30);G.lineTo(X+44,Y-12);G.stroke();box('#6b6f7a',X+38,Y-14,10,8);};
  /* ---------- night shift ---------- */
  K.P.w03_nightpine=function(X,Y){shadow(X+1,Y+1,6);px('#2a1a10',X,Y-3,2,4);for(let i=0;i<4;i++){const w=4+i*2;px('#0a1612',X-w/2,Y-18+i*4,w+2,5);px('#163a2e',X-w/2+1,Y-18+i*4,w,4);px('#2a5a48',X-w/2+1,Y-18+i*4,2,1);}};
  K.P.w03_flood=function(X,Y,dx){const G=g();G.fillStyle='rgba(255,236,150,.16)';G.beginPath();G.ellipse(X+dx,Y+4,42,18,0,0,Math.PI*2);G.fill();G.fillStyle='rgba(255,236,150,.14)';G.beginPath();G.moveTo(X-2,Y-38);G.lineTo(X+dx-36,Y+4);G.lineTo(X+dx+36,Y+4);G.fill();
    px('#1b1220',X,Y-36,2,36);box('#4a4f57',X-7,Y-44,16,7);px('#fff3c4',X-6,Y-39,14,2);box('#f6c445',X-5,Y-6,12,6);};
  K.P.w03_rig=function(X,Y){shadow(X,Y+4,52,7);const G=g();
    G.fillStyle='rgba(255,236,150,.18)';G.beginPath();G.ellipse(X,Y-4,70,26,0,0,Math.PI*2);G.fill();
    box('#6b6f7a',X-40,Y-16,80,16);px('#e8364b',X-40,Y-16,80,3);for(let i=-36;i<36;i+=8)px('#4a4f57',X+i,Y-12,4,10);
    for(let i=0;i<96;i+=2){const w=Math.round(30-i*0.24);px('#1b1220',X-w/2-1,Y-16-i,3,2);px('#1b1220',X+w/2-1,Y-16-i,3,2);px('#f6c445',X-w/2,Y-16-i,1,2);px('#f6c445',X+w/2,Y-16-i,1,2);if(i%10===0){px('#1b1220',X-w/2,Y-17-i,w,2);px('#e8364b',X-w/2+1,Y-17-i,w-2,1);}}
    for(let i=0;i<90;i+=10){const w=Math.round(30-i*0.24);G.strokeStyle='#d8a838';G.lineWidth=1;G.beginPath();G.moveTo(X-w/2,Y-16-i);G.lineTo(X+w/2,Y-26-i);G.stroke();}
    box('#4a4f57',X-6,Y-118,12,8);px('#fff3c4',X-4,Y-116,8,3);px('#1b1220',X,Y-130,1,12);
    box('#eee8d6',X+42,Y-22,30,22);for(let i=0;i<3;i++)px('#fff3c4',X+45+i*9,Y-18,6,5);px('#e8364b',X+42,Y-22,30,3);txt('DOGHOUSE',X+43,Y-8,'#2b2f45',5,1);
    box('#eee8d6',X-74,Y-14,28,14);px('#fff3c4',X-70,Y-10,8,4);px('#fff3c4',X-58,Y-10,8,4);
    K.P.label(X+62,Y-120,"DAD'S RIG");};
  K.A.w03_beacon=function(t,X,Y){if(Math.floor(t/500)%2===0){px('#ff3d3d',X-1,Y-1,3,3);const G=g();G.fillStyle='rgba(255,61,61,.35)';G.beginPath();G.arc(X+.5,Y+.5,4,0,Math.PI*2);G.fill();}else px('#7d1f33',X-1,Y-1,3,3);};

  const HWY=[[332,730],[332,660],[330,626],[322,560],[308,505],[302,470],[296,430],[288,390],[280,350],[278,325],[278,300],[282,262],[290,200],[305,140],[318,70],[325,-10]];

  K.W.push({ n:3, hud:"DAD'S OILFIELD", name:'Kinan vs. the Safety Foreman',
    where:"A road trip with Dad: from Grandma and Grandpa's place at Onion Lake, up Highway 63 to Fort McMurray, then down the gravel lease road through the boreal forest to the oil sands and Robin's drilling rig on the night shift.",
    marks:"Grandma and Grandpa's farm at Onion Lake, Highway 63, the Welcome to Fort McMurray sign, the Athabasca River, the work camp, a muddy lease road, pumpjacks, muskeg ponds, a big bull moose, hydro vac trucks, pipe racks, the oil sands mine with giant haul trucks, a flare stack and Robin's rig under the floodlights.",
    size:[1200,720], ground:'boreal', water:'blue', cliff:'dirt', path:'gravel',
    rivers:[{pts:[[-20,330],[100,318],[220,332],[340,318],[460,340],[560,382],[620,450],[650,540],[660,630],[670,740]],w:22}],
    lakes:[[108,470,68,26],[650,206,13,6],[756,148,15,6]],
    zones:[
      {k:'w03_lease',f:(X,Y,w)=>{const m=leaseMask(w);LW=w.WW;return m[Y*w.WW+X]>0;}},
      {k:'w03_nightpad',e:[842,348,64,30]},
      {k:'w03_night',f:(X,Y)=>nd(X,Y)<0.78+0.22*hash(X>>1,Y>>1)},
      {k:'w03_dusk',f:(X,Y)=>nd(X,Y)<1.18+0.2*hash(X>>1,Y>>1)},
      {k:'w03_oilsand',e:[880,524,140,72]},
      {k:'w03_garden',r:[60,642,104,40]},
      {k:'grass',e:[170,615,165,90]},
      {k:'gravel',e:[352,236,72,30]},
      {k:'mud',e:[456,240,52,22]},
      {k:'w03_clearing',e:[566,168,96,56]},
      {k:'w03_muskeg',e:[705,200,80,46]},
      {k:'gravel',r:[818,58,272,172]},
      {k:'gravel',r:[968,262,126,118]},
      {k:'gravel',e:[1092,512,26,18]},
      {k:'w03_fade',r:[0,680,1200,40]}],
    roads:[HWY,[[1165,-10],[1165,730]]],
    bridges:[[278,326,'beam'],[490,355,'metal']],
    J:{H0:[328,612]},
    stops:[
      {at:[250,612], name:"3-1  GRANDMA AND GRANDPA'S AT ONION LAKE", st:'open'},
      {at:[302,470], name:'3-2  WELCOME TO FORT McMURRAY  -  HIGHWAY 63', st:'lock'},
      {at:[282,262], name:'3-3  CAMP BREAKFAST', st:'lock'},
      {at:[452,236], name:'3-4  THE MUDDY LEASE ROAD', st:'lock'},
      {at:[560,168], name:'3-5  PUMPJACK PLAINS', st:'lock'},
      {at:[714,178], name:'FORT  THE BIG BULL MOOSE', st:'fort'},
      {at:[880,168], name:'3-6  THE HYDRO VAC YARD', st:'lock'},
      {at:[1036,322],name:'3-7  PIPE RACK MAZE', st:'lock'},
      /* stop order = the level files' slots (levels/w03: secret slot 9, 3-8 slot 10; fixed 2026-10-27). The secret is
         still a spur off 3-8 (edge [9,8]): 3-8's old-mine-shaft exit opens it, and the trail walks past it until then */
      {at:[700,530], name:'SECRET  ATHABASCA RIVER RUN', st:'secret'},
      {at:[752,522], name:'3-8  THE BIG DIG', st:'lock'},
      {at:[842,350], name:"CASTLE  NIGHT SHIFT AT DAD'S RIG  -  THE SAFETY FOREMAN", st:'boss'}],
    edges:[
      [0,'H0'],
      ['H0',1,[[322,560],[308,505]],{road:1}],
      [1,2,[[296,430],[288,390],[280,350],[278,325],[278,300]],{road:1}],
      [2,3,[[330,262],[390,252]]],
      [3,4,[[495,220],[525,188]]],
      [4,5,[[620,150],[670,162]]],
      [5,6,[[770,196],[830,182]]],
      [6,7,[[960,182],[1018,240]]],
      [7,9,[[1012,408],[930,440],[828,462]]],
      [9,8,[[726,528]]],
      [9,10,[[720,474],[740,414],[790,374]]]],
    /* Robin's pickup comes up Highway 63 from the school (World 2) and turns in at Grandma and Grandpa's */
    entryPath:{from:[332,720],via:[[332,660],[330,626],[328,612]],road:1},
    /* after the night shift: out the gravel lease road, over the Athabasca and down Highway 63 south to Edmonton (World 4) */
    exitPath:{to:[332,720],via:[[800,352],[760,347],[718,332],[660,318],[600,311],[556,307],[514,314],[492,334],[490,392],[488,460],[472,540],[430,606],[376,650],[340,682],[332,702]],ride:'truck'},
    exit:[332,700],
    props:[
      ['w03_farmhouse',150,604],['w03_barn',52,606],['w03_coop',36,700],['w03_bale',196,700],['w03_bale',214,708],['w03_bale',232,698],
      ['w03_lbl',112,532,"GRANDMA & GRANDPA'S"],['w03_lbl',108,456,'ONION LAKE'],['truck',190,664,'#c2414f'],['w03_mailbox',262,640],['fence',60,640,26],
      ['w03_fmm',318,462],['w03_shield',268,500,'63'],['w03_shield',340,600,'63'],
      ['w03_lbl',150,330,'ATHABASCA RIVER'],
      ['w03_camp',300,240],['truck',356,288,'#f4f1e8'],
      ['w03_town',200,64],['w03_gas',190,110],...K.homes([[150,160,'#e8364b'],[200,190,'#2a5bd7'],[150,220,'#44c55a'],[220,250,'#8a5426'],[160,270,'#2a5bd7'],[230,150,'#44c55a'],[100,200,'#8a5426'],[100,260,'#e8364b']]),
      ['w03_stuck',438,264],['w03_puddle',412,228,6],['w03_puddle',482,252,5],
      ['w03_bullmoose',688,254],['moose',600,250],['moose',1000,640],
      ['w03_shop',926,100],['w03_hydrovac',826,152,'#e8364b'],['w03_hydrovac',908,152,'#ff8a3d'],['w03_hydrovac',990,152,'#f6c445'],['w03_slurry',1050,206],
      ['w03_lbl',972,30,'HYDRO VAC YARD'],
      ['w03_rack',976,292,46],['w03_rack',1048,296,40],['w03_rack',980,348,40],['w03_rack',1062,380,40],['w03_pipes',1060,330,3,'#9aa3b2'],['w03_pipes',990,320,3,'#e8364b'],['w03_lbl',1100,262,'PIPE RACK MAZE'],
      ['w03_pit',890,522,118,50],['haulTruck',836,538],['haulTruck',922,516],['w03_shovel',880,560],['haulTruck',940,558],
      ['w03_headframe',740,566],
      ['w03_flood',770,318,16],['w03_flood',928,308,-16],['w03_flood',900,388,-20],['w03_flood',712,392,24],
      ['w03_rig',842,338],
      
      ['sign',360,714,'EDMONTON','TO WORLD 4'],['sign',276,714,'WELCOME TO','ONION LAKE']],
    scatter:[{k:'pine',n:430,zone:'boreal'},{k:'pine',n:30,zone:'w03_dusk'},{k:'w03_nightpine',n:24,zone:'w03_night'},{k:'tree',n:10,zone:'grass'},{k:'pine',n:10,zone:'w03_muskeg'},{k:'pine',n:14,zone:'w03_fade'}],
    anim:[['pumpjack',478,162],['pumpjack',578,122],['pumpjack',600,206],['pumpjack',536,234],['pumpjack',640,224],
      ['flare',1090,520],['flare',952,374],['smoke',194,556,1],['steam',425,206],['w03_beacon',842,208],...[826,908,990].flatMap(a=>[['w03_amber',a+51,120],['w03_amber',a+59,120]]),['canflag',268,440]] });
})(KINAN);

/* World 9: Montreal (Kinan vs. Annie) */
(function(K){
  const {px,box,shadow,txt,hash}=K; const g=()=>K.g();

  /* ---------- water ---------- */
  /* St. Lawrence: full width round the islands in the east, narrowing west of the Old Port to 72 px at the map edge,
     where it carries on into the Boat to Niagara map at the same width */
  const RIVER={pts:[[560,650],[800,690],[1000,712],[1140,700]],w:48};
  const RIVW=[{pts:[[-20,650],[300,646]],w:36},{pts:[[300,646],[400,647]],w:39},{pts:[[400,647],[480,648]],w:42},{pts:[[480,648],[560,650]],w:45}];
  const NCH={pts:[[560,640],[700,612],[900,604],[1060,612],[1150,660]],w:15};     /* channel between the Old Port and the island */
  const CANAL={pts:[[-20,560],[200,566],[380,590],[478,616]],w:5};                /* Lachine Canal */
  const RAIL=[[0,548],[120,548],[240,550],[340,553],[400,557],[440,560]];               /* rail line in from Toronto, along the canal */
  const MR=[340,200,135,98];                                                         /* Mount Royal */
  const mrK=(X,Y)=>((X-MR[0])/MR[2])**2+((Y-MR[1])/MR[3])**2;

  /* ---------- ground looks ---------- */
  K.GROUND.w09_mtn=(X,Y)=>{const k=mrK(X,Y);const h=hash(X>>1,Y>>1);
    if(k>0.86&&Y>MR[1]+12)return k>0.95?'#5e3b20':(X%6===0?'#8a5c30':'#a8703c');
    if(k<0.13)return h>.9?'#c4f08a':'#9ade6c';
    if(Math.abs(k-0.55)<0.012||Math.abs(k-0.3)<0.01)return '#2f7a2c';
    return h>.92?'#5aae44':h>.85?'#2f7a2c':'#3a8d33';};
  K.GROUND.w09_cobble=(X,Y)=>{const o=((Y>>2)&1)*3;if(Y%4===0||(X+o)%6===0)return '#7a6a5e';return hash(X>>1,Y>>2)>.85?'#b8a898':'#a8988a';};
  K.GROUND.w09_quay=(X,Y)=>(X%12===0||Y%6===0)?'#a8a296':'#cbc5b8';
  K.GROUND.w09_plaza=(X,Y)=>(X%16===0||Y%16===0)?'#cfcabd':'#e6e2d8';
  K.GROUND.w09_flowers=(X,Y)=>{const h=hash(X>>1,Y>>1);if(Y%10<5&&h>.6)return ['#ff6fae','#f6c445','#e8364b','#b06cff'][Math.floor(h*40)%4];return h>.3?'#5cb73a':'#6cc644';};
  K.RIM.w09_mtn='#a8ec74';K.LINE.w09_mtn='#1b3d14';K.RIM.w09_cobble='#d8ccbe';K.LINE.w09_cobble='#3b2618';K.RIM.w09_quay='#ffffff';K.LINE.w09_quay='#3a3836';
  K.RIM.w09_plaza='#ffffff';K.LINE.w09_plaza='#6b6f7a';K.RIM.w09_flowers='#a8ec74';K.LINE.w09_flowers='#2e6423';

  /* ---------- props ---------- */
  K.P.w09_lbl=function(X,Y,s){K.P.label(X,Y,s);};
  /* border sign with a board as wide as its words (text is drawn sharp at runtime, 7px) */
  K.P.w09_sign=function(X,Y,a,b,col){const G=g();const w=Math.ceil(Math.max(K.textW(a,6),b?K.textW(b,6):0))+9;
    shadow(X+w/2,Y+1,w/2-4,2);px('#1b1220',X+5,Y-12,2,12);px('#1b1220',X+w-7,Y-12,2,12);box(col||'#2f7d32',X,Y-31,w,20);px('#ffffff',X+1,Y-30,w-2,1);
    txt(a,X+4,Y-28,'#ffffff',6,1);if(b)txt(b,X+4,Y-20,'#f6c445',6,1);};
  /* the rail line in from Toronto (X,Y only sort it among the props); it ends at a buffer stop in Old Montreal */
  K.P.w09_rail=function(X,Y,pts){const seg=f=>{for(let i=1;i<pts.length;i++){const[a,b]=pts[i-1],[c,d]=pts[i];const L=Math.hypot(c-a,d-b);for(let s=0;s<L;s++)f(a+(c-a)*s/L,b+(d-b)*s/L,s);}};
    seg((x,y)=>px('#1b1220',x-6,y-6,13,13));seg((x,y)=>px('#5a5650',x-5,y-5,11,11));seg((x,y,s)=>{if(Math.floor(s)%4===0)px('#7a5430',x-1,y-4,2,9);});
    seg((x,y)=>{px('#2b2f45',x,y-3,1,1);px('#cfd6e2',x,y-2,1,1);px('#2b2f45',x,y+2,1,1);px('#cfd6e2',x,y+3,1,1);});
    const[ex,ey]=pts[pts.length-1];box('#e8364b',ex-2,ey-6,4,12);px('#ffffff',ex-2,ey-2,4,2);};
  K.P.w09_maple=function(X,Y){const c=['#ff8a3d','#e8364b','#f6c445','#ff6a2a'][Math.floor(hash(X,Y)*4)];shadow(X,Y+1,7);px('#5e3b20',X-1,Y-3,3,5);px('#1b1220',X-8,Y-15,16,12);px('#1b1220',X-6,Y-18,12,4);px(c,X-7,Y-14,14,10);px(c,X-5,Y-17,10,3);px('rgba(255,255,255,.35)',X-5,Y-15,6,3);px('rgba(0,0,0,.15)',X+2,Y-10,5,6);};
  K.P.w09_plex=function(X,Y,c){shadow(X+11,Y+1,13,2);box(c,X,Y-24,22,24);px('#1b1220',X-1,Y-28,24,4);px('#e2dccd',X,Y-27,22,2);
    box('#cfeeff',X+3,Y-21,5,5);box('#cfeeff',X+14,Y-21,5,5);box('#cfeeff',X+3,Y-10,5,5);px('#3b2618',X+15,Y-8,4,8);
    px('#1b1220',X,Y-14,22,1);for(let i=0;i<6;i++)px('#1b1220',X+9+((i%2)?2:0),Y-13+i*2,3,1);px('#1b1220',X+9,Y-14,1,14);px('#1b1220',X+13,Y-14,1,14);};
  K.P.w09_stone=function(X,Y,w,h,roof){shadow(X+w/2,Y+2,w/2+3,3);box('#b8b2a6',X,Y-h,w,h);for(let yy=Y-h+3;yy<Y-2;yy+=5)px('#a29c90',X,yy,w,1);
    for(let yy=Y-h+4;yy<Y-6;yy+=8)for(let xx=X+3;xx<X+w-4;xx+=7)box('#4a5a7a',xx,yy,3,5);
    px('#1b1220',X-2,Y-h-7,w+4,8);px(roof||'#5fa88a',X-1,Y-h-6,w+2,6);px('#9fd8be',X-1,Y-h-6,w+2,1);box('#8a5a42',X+w-7,Y-h-11,4,5);};
  K.P.w09_hdv=function(X,Y){shadow(X+32,Y+2,36,4);box('#c8c0ae',X,Y-24,64,24);for(let i=0;i<7;i++){box('#4a5a7a',X+4+i*8,Y-20,4,6);box('#4a5a7a',X+4+i*8,Y-10,4,6);}
    px('#1b1220',X-2,Y-31,68,8);px('#5fa88a',X-1,Y-30,66,6);px('#9fd8be',X-1,Y-30,66,1);
    box('#c8c0ae',X+24,Y-44,16,14);box('#e8e4da',X+28,Y-41,8,6);px('#1b1220',X+31,Y-40,1,3);px('#1b1220',X+22,Y-52,20,9);px('#5fa88a',X+23,Y-51,18,7);px('#1b1220',X+31,Y-60,1,8);
    K.P.label(X+32,Y+4,'CITY HALL');};
  K.P.w09_bonsecours=function(X,Y){const G=g();shadow(X+40,Y+2,44,4);box('#bcb6aa',X,Y-20,80,20);for(let i=0;i<9;i++)box('#4a5a7a',X+3+i*9,Y-16,4,7);
    px('#1b1220',X-2,Y-25,84,6);px('#8a9098',X-1,Y-24,82,4);
    for(let i=0;i<4;i++)px('#e8e4da',X+30+i*6,Y-20,2,20);
    box('#bcb6aa',X+30,Y-32,20,8);G.fillStyle='#1b1220';G.beginPath();G.arc(X+40,Y-32,11,Math.PI,0);G.fill();G.fillStyle='#dfe5ee';G.beginPath();G.arc(X+40,Y-32,10,Math.PI,0);G.fill();px('#ffffff',X+34,Y-39,3,3);px('#1b1220',X+40,Y-48,1,6);
};
  K.P.w09_clockTower=function(X,Y){shadow(X,Y+2,14,3);px('#1b1220',X-14,Y-3,28,6);px('#a8a296',X-13,Y-2,26,4);
    box('#f2eee4',X-6,Y-48,12,46);px('#d8d2c4',X+2,Y-48,4,46);box('#ffffff',X-4,Y-42,8,8);px('#1b1220',X,Y-41,1,4);px('#1b1220',X,Y-38,3,1);
    const G=g();G.fillStyle='#1b1220';G.beginPath();G.moveTo(X-8,Y-47);G.lineTo(X,Y-62);G.lineTo(X+8,Y-47);G.fill();G.fillStyle='#5fa88a';G.beginPath();G.moveTo(X-6,Y-48);G.lineTo(X,Y-59);G.lineTo(X+6,Y-48);G.fill();
    K.P.label(X+30,Y-56,'CLOCK TOWER');};
  K.P.w09_pier=function(X,Y,len){px('#1b1220',X-1,Y,12,len+1);px('#c9c4b8',X,Y,10,len);for(let i=0;i<len;i+=5)px('#a8a296',X,Y+i,10,1);
    [[X-15,Y+12],[X+12,Y+20]].forEach(([a,b])=>{if(b<Y+len){box('#ffffff',a,b-4,14,4);px('#2a5bd7',a,b-1,14,1);box('#f4f1e8',a+3,b-8,8,4);px('#7ec8ff',a+4,b-7,6,2);}});};
  K.P.w09_guimard=function(X,Y){shadow(X,Y+1,16,2);const G=g();
    [-14,12].forEach(o=>{px('#1b1220',X+o,Y-26,3,26);px('#3f8a5a',X+o+1,Y-25,1,24);box('#ff8a3d',X+o-1,Y-31,5,5);px('#fff3c4',X+o,Y-30,2,2);});
    G.strokeStyle='#1b1220';G.lineWidth=3;G.beginPath();G.moveTo(X-13,Y-22);G.quadraticCurveTo(X,Y-30,X+14,Y-22);G.stroke();G.strokeStyle='#3f8a5a';G.lineWidth=1;G.beginPath();G.moveTo(X-13,Y-22);G.quadraticCurveTo(X,Y-30,X+14,Y-22);G.stroke();
    box('#f6e7a6',X-10,Y-21,22,6);txt('METRO',X-8,Y-21,'#3f6a2a',6,1);
    for(let i=-12;i<13;i+=3)px('#1b1220',X+i,Y-7,1,7);px('#1b1220',X-13,Y-8,27,1);};
  K.P.w09_metroStop=function(X,Y){shadow(X,Y+1,10,2);box('#dfe5ee',X-10,Y-11,20,11);box('#2b2f45',X-3,Y-6,6,6);
    px('#1b1220',X+12,Y-22,2,22);const G=g();G.fillStyle='#1b1220';G.beginPath();G.arc(X+13,Y-25,6,0,Math.PI*2);G.fill();G.fillStyle='#2a5bd7';G.beginPath();G.arc(X+13,Y-25,5,0,Math.PI*2);G.fill();px('#ffffff',X+12,Y-28,2,5);px('#ffffff',X+10,Y-24,6,1);};
  K.P.w09_chalet=function(X,Y){shadow(X+30,Y+2,36,4);box('#dcccaa',X,Y-20,60,20);for(let i=0;i<7;i++)box('#5a6fa0',X+4+i*8,Y-16,4,8);box('#5e3b20',X+26,Y-9,8,9);
    px('#1b1220',X-4,Y-31,68,12);px('#7a8a8a',X-3,Y-30,66,10);px('#a8b8b8',X-3,Y-30,66,2);
    px('#1b1220',X-14,Y+2,88,5);px('#ffffff',X-13,Y+3,86,3);for(let i=0;i<86;i+=4)px('#1b1220',X-13+i,Y+4,1,1);
    px('#1b1220',X+66,Y-4,2,6);box('#2a5bd7',X+63,Y-8,8,4);
    K.P.label(X+30,Y-46,'MOUNT ROYAL LOOKOUT');};
  K.P.w09_stadium=function(X,Y){const G=g();shadow(X,Y+5,74,10);
    G.fillStyle='#1b1220';G.beginPath();G.ellipse(X,Y-12,72,29,0,0,Math.PI*2);G.fill();G.fillStyle='#e8e8e2';G.beginPath();G.ellipse(X,Y-12,71,28,0,0,Math.PI*2);G.fill();
    G.strokeStyle='#a8a8a0';G.lineWidth=2;for(let a=0;a<Math.PI*2;a+=Math.PI/16){G.beginPath();G.moveTo(X+Math.cos(a)*70,Y-12+Math.sin(a)*27);G.lineTo(X+Math.cos(a)*55,Y-12+Math.sin(a)*20);G.stroke();}
    G.fillStyle='#1b1220';G.beginPath();G.ellipse(X,Y-14,53,20,0,0,Math.PI*2);G.fill();G.fillStyle='#f6f6f2';G.beginPath();G.ellipse(X,Y-14,52,19,0,0,Math.PI*2);G.fill();
    G.fillStyle='#e0e0d8';G.beginPath();G.ellipse(X+6,Y-11,42,13,0,0,Math.PI);G.fill();
    const bx=X-60,by=Y-8;
    G.strokeStyle='#6f7889';G.lineWidth=1;for(let i=0;i<6;i++){G.beginPath();G.moveTo(bx+30,by-104);G.lineTo(X-30+i*14,Y-24+Math.abs(i-2.5)*2);G.stroke();}
    G.fillStyle='#1b1220';G.beginPath();G.moveTo(bx-10,by+3);G.quadraticCurveTo(bx-7,by-62,bx+28,by-114);G.lineTo(bx+44,by-104);G.quadraticCurveTo(bx+13,by-58,bx+12,by+3);G.fill();
    G.fillStyle='#e6e2d8';G.beginPath();G.moveTo(bx-8,by+1);G.quadraticCurveTo(bx-5,by-62,bx+29,by-111);G.lineTo(bx+41,by-103);G.quadraticCurveTo(bx+11,by-58,bx+10,by+1);G.fill();
    G.fillStyle='#c4beb0';G.beginPath();G.moveTo(bx+4,by+1);G.quadraticCurveTo(bx+5,by-60,bx+36,by-107);G.lineTo(bx+41,by-103);G.quadraticCurveTo(bx+11,by-58,bx+10,by+1);G.fill();
    G.fillStyle='#1b1220';G.beginPath();G.moveTo(bx+24,by-116);G.lineTo(bx+34,by-124);G.lineTo(bx+50,by-108);G.lineTo(bx+42,by-100);G.fill();G.fillStyle='#7ec8ff';G.beginPath();G.moveTo(bx+26,by-115);G.lineTo(bx+34,by-121);G.lineTo(bx+47,by-108);G.lineTo(bx+41,by-102);G.fill();
    K.P.label(X+66,Y-52,'THE BIG O');};
  K.P.w09_biodome=function(X,Y){const G=g();shadow(X+40,Y+3,46,5);box('#c9c4b8',X,Y-10,80,10);for(let i=4;i<78;i+=8)px('#9a968c',X+i,Y-8,3,8);
    G.fillStyle='#1b1220';G.beginPath();G.ellipse(X+40,Y-10,42,21,0,Math.PI,0);G.fill();G.fillStyle='#ececE6';G.beginPath();G.ellipse(X+40,Y-10,41,20,0,Math.PI,0);G.fill();
    for(let i=-4;i<=4;i++){const a=-Math.PI/2+i*0.33;G.strokeStyle='#1b1220';G.lineWidth=4;G.beginPath();G.moveTo(X+40,Y-11);G.lineTo(X+40+Math.cos(a)*37,Y-11+Math.sin(a)*18);G.stroke();G.strokeStyle='#7ec8ff';G.lineWidth=2;G.beginPath();G.moveTo(X+40,Y-11);G.lineTo(X+40+Math.cos(a)*37,Y-11+Math.sin(a)*18);G.stroke();}
    px('#44c55a',X+6,Y-14,8,4);px('#44c55a',X+66,Y-14,8,4);px('#1b1220',X+72,Y-6,4,6);px('#ffffff',X+73,Y-5,2,4);px('#ff8a3d',X+76,Y-4,1,1);
    K.P.label(X+40,Y-40,'BIODOME');};
  K.P.w09_space=function(X,Y){const G=g();shadow(X+30,Y+2,34,4);box('#3a3f6a',X,Y-14,60,14);for(let i=0;i<6;i++)box('#7ec8ff',X+4+i*9,Y-11,5,5);
    G.fillStyle='#1b1220';G.beginPath();G.arc(X+30,Y-14,22,Math.PI,0);G.fill();G.fillStyle='#2a2f5a';G.beginPath();G.arc(X+30,Y-14,21,Math.PI,0);G.fill();
    [[18,-22],[26,-30],[38,-26],[44,-18],[32,-20],[22,-16]].forEach(([a,b])=>px('#ffffff',X+a,Y+b,1,1));
    G.fillStyle='#f6c445';G.beginPath();G.arc(X+36,Y-24,4,0,Math.PI*2);G.fill();G.strokeStyle='#ff8a3d';G.lineWidth=1;G.beginPath();G.ellipse(X+36,Y-24,8,2,-0.3,0,Math.PI*2);G.stroke();
    K.P.label(X+30,Y-46,'SPACE CENTRE');};
  K.P.w09_rocket=function(X,Y){const G=g();shadow(X,Y+2,16,3);
    G.fillStyle='#1b1220';G.beginPath();G.ellipse(X,Y-2,14,5,0,0,Math.PI*2);G.fill();G.fillStyle='#4a5160';G.beginPath();G.ellipse(X,Y-2,13,4,0,0,Math.PI*2);G.fill();G.fillStyle='#00ffd0';G.beginPath();G.ellipse(X,Y-2,6,2,0,0,Math.PI*2);G.fill();
    for(let i=0;i<48;i+=4){px('#6f7889',X+12,Y-6-i,1,4);px('#6f7889',X+12,Y-6-i,6,1);}px('#6f7889',X+17,Y-54,1,48);
    box('#ffffff',X-5,Y-46,10,40);px('#dfe5ee',X+2,Y-46,3,40);px('#e8364b',X-5,Y-20,10,3);box('#7ec8ff',X-2,Y-38,4,4);
    G.fillStyle='#1b1220';G.beginPath();G.moveTo(X-6,Y-46);G.lineTo(X,Y-60);G.lineTo(X+6,Y-46);G.fill();G.fillStyle='#e8364b';G.beginPath();G.moveTo(X-4,Y-47);G.lineTo(X,Y-57);G.lineTo(X+4,Y-47);G.fill();
    box('#e8364b',X-9,Y-14,4,8);box('#e8364b',X+5,Y-14,4,8);
    K.P.label(X-10,Y+6,'UNDERGROUND CITY');};
  K.P.w09_loft=function(X,Y,w,sign){shadow(X+w/2,Y+2,w/2+4,4);box('#b2533a',X,Y-36,w,36);
    for(let yy=Y-35;yy<Y;yy+=3)for(let xx=X+((yy/3)&1?0:3);xx<X+w;xx+=6)px('#9a4430',xx,yy,1,1);
    for(let r=0;r<3;r++)for(let i=0;i<Math.floor((w-6)/12);i++){box('#cfeeff',X+5+i*12,Y-32+r*11,8,7);px('#1b1220',X+9+i*12,Y-32+r*11,1,7);px('#f6c445',X+5+i*12,Y-27+r*11,3,2);}
    px('#1b1220',X-1,Y-39,w+2,4);px('#8a3a2a',X,Y-38,w,2);
    box('#8a5a32',X+w-18,Y-52,12,10);px('#1b1220',X+w-17,Y-42,1,4);px('#1b1220',X+w-8,Y-42,1,4);px('#5e3b20',X+w-19,Y-55,14,3);
    for(let i=0;i<w-26;i+=4)px(['#f6c445','#ff6fae','#7ec8ff'][(i/4)%3],X+3+i,Y-42+Math.round(Math.sin(i/6)),2,2);
    if(sign){box('#1b1220',X+4,Y-52,sign.length*5+4,9);txt(sign,X+6,Y-51,'#00ffd0',7,1);}};
  K.P.w09_palais=function(X,Y){const W=240,G=g();shadow(X+W/2,Y+3,W/2+6,5);
    box('#d8d2c4',X,Y-46,W,46);px('#ffffff',X,Y-46,W,2);
    const cs=['#ff6fae','#f6c445','#44c55a','#2a5bd7','#ff8a3d','#b06cff','#7ec8ff'];
    for(let r=0;r<5;r++)for(let i=0;i<22;i++){const c=cs[Math.floor(hash(i*3,r+7)*7)];px(c,X+106+i*6,Y-42+r*7,5,6);px('rgba(255,255,255,.4)',X+106+i*6,Y-42+r*7,5,1);}
    box('#cfeeff',X+180,Y-12,26,12);px('#1b1220',X+193,Y-12,1,12);
    box('#2b2f45',X+6,Y-42,94,40);
    box('#1b1220',X+20,Y-40,66,18);for(let i=0;i<5;i++)px(['#00ffd0','#ff6fae','#f6c445'][i%3],X+24,Y-37+i*3,12+((i*17)%40),1);
    for(let r=0;r<3;r++)for(let i=0;i<11;i++)px(['#e8364b','#ff8a3d','#f6c445'][(i+r)%3],X+8+i*8+(r%2)*3,Y-20+r*5,7,4);
    box('#f6c445',X+48,Y-22,10,7);px('#1b1220',X+51,Y-25,4,3);px('#f6c445',X+52,Y-24,2,2);px('#1b1220',X+52,Y-19,2,2);
    px('#6b4a2a',X+6,Y-5,94,5);px('#c08a52',X+6,Y-5,94,1);
    [[112,'#2a5bd7'],[142,'#e8364b'],[172,'#44c55a'],[202,'#b06cff']].forEach(([o,c])=>{px('#1b1220',X+o+10,Y-48,2,6);box(c,X+o,Y-62,22,14);txt('TECH',X+o+2,Y-60,'#ffffff',6,1);px('#ffffff',X+o+3,Y-53,16,1);});
    box('#1b1220',X+8,Y-60,90,11);txt("ANNIE'S TECH CONF",X+11,Y-59,'#00ffd0',7,1);
    K.P.label(X+W/2,Y-80,'CONFERENCE CENTRE');};
  K.P.w09_jcb=function(X,Y1,Y2){for(let y=Y1;y<Y2;y+=6){px('#1b1220',X-13,y,3,7);px('#1b1220',X+10,y,3,7);px('#3f9a6a',X-12,y+1,1,5);px('#3f9a6a',X+11,y+1,1,5);px('#3f9a6a',X-12,y,25,1);}};
  K.P.w09_biosphere=function(X,Y){const G=g();shadow(X,Y+2,18,3);const R=17,cy=Y-R-2;
    G.strokeStyle='#1b1220';G.lineWidth=3;G.beginPath();G.arc(X,cy,R,0,Math.PI*2);G.stroke();
    G.save();G.beginPath();G.arc(X,cy,R,0,Math.PI*2);G.clip();G.fillStyle='rgba(126,200,255,.25)';G.fillRect(X-R,cy-R,2*R,2*R);G.strokeStyle='#dfe5ee';G.lineWidth=1;
    for(let i=-R;i<=R;i+=5){G.beginPath();G.moveTo(X-R,cy+i);G.lineTo(X+R,cy+i);G.stroke();G.beginPath();G.moveTo(X+i-R,cy-R);G.lineTo(X+i+R,cy+R);G.stroke();G.beginPath();G.moveTo(X+i+R,cy-R);G.lineTo(X+i-R,cy+R);G.stroke();}G.restore();
    G.strokeStyle='#ffffff';G.lineWidth=1;G.beginPath();G.arc(X,cy,R,0,Math.PI*2);G.stroke();K.P.label(X,Y+4,'BIOSPHERE');};
  K.P.w09_habitat=function(X,Y){shadow(X+18,Y+1,22,3);[[0,0],[10,0],[20,0],[5,-7],[16,-7],[26,-7],[10,-14],[21,-14],[15,-21]].forEach(([a,b])=>{box('#d8d2c4',X+a,Y+b-7,10,7);px('#7ec8ff',X+a+2,Y+b-5,4,2);px('#3f9636',X+a,Y+b-8,3,1);});K.P.label(X+18,Y+4,'HABITAT 67');};

  /* ---------- animations ---------- */
  K.A.w09_metro=function(t,pts){const segs=[];let tot=0;for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);segs.push(l);tot+=l;}
    for(let i=1;i<pts.length;i++){const[a,b]=pts[i-1],[c,d]=pts[i];const L=segs[i-1];for(let s=0;s<L;s++){const X=a+(c-a)*s/L,Y=b+(d-b)*s/L;px('#1b1220',X-6,Y-6,13,13);}}
    for(let i=1;i<pts.length;i++){const[a,b]=pts[i-1],[c,d]=pts[i];const L=segs[i-1];for(let s=0;s<L;s++){const X=a+(c-a)*s/L,Y=b+(d-b)*s/L;px('#2a2f5a',X-5,Y-5,11,11);if(Math.round(s)%6===0)px('#ff8a3d',X-5,Y-1,11,1);}}
    let d=((t/28)%(tot+70))-35;for(let k=0;k<3;k++){let dd=d-k*12;if(dd<0||dd>tot)continue;let j=0;while(dd>segs[j]){dd-=segs[j];j++;}const[a,b]=pts[j],[c,e]=pts[j+1];const X=a+(c-a)*dd/segs[j],Y=b+(e-b)*dd/segs[j];box('#2a5bd7',X-4,Y-5,9,11);px('#ffffff',X-4,Y-1,9,2);px('#cfeeff',X-3,Y-4,7,2);}};
  K.A.w09_zip=function(t,X1,Y1,X2,Y2){const G=g();[['#1b1220',3],['#f6c445',1]].forEach(([c,w])=>{G.strokeStyle=c;G.lineWidth=w;G.beginPath();G.moveTo(X1,Y1);G.quadraticCurveTo((X1+X2)/2,(Y1+Y2)/2+8,X2,Y2);G.stroke();});
    [[X1,Y1],[X2,Y2]].forEach(([a,b])=>{px('#1b1220',a-1,b,3,40);px('#f6c445',a,b+1,1,38);});
    const u=(t/3500)%1;const X=(1-u)*(1-u)*X1+2*u*(1-u)*(X1+X2)/2+u*u*X2,Y=(1-u)*(1-u)*Y1+2*u*(1-u)*((Y1+Y2)/2+8)+u*u*Y2;
    px('#1b1220',X,Y,1,4);px('#e8364b',X-2,Y+4,5,5);px('#d9a27a',X-1,Y+1,3,3);px('#3f63a8',X-2,Y+9,2,3);px('#3f63a8',X+1,Y+9,2,3);};
  K.A.w09_caleche=function(t,X1,X2,Y){const u=(Math.sin(t/5000)+1)/2;const X=X1+(X2-X1)*u;const dir=Math.cos(t/5000)>=0?1:-1;const f=(a,w)=>dir>0?X+a:X-a-w;
    px('#1b1220',f(-12,24),Y-8,24,1);box('#6b3a22',f(4,10),Y-9,10,5);px('#6b3a22',f(12,3),Y-12,3,4);px('#1b1220',f(14,1),Y-11,1,1);px('#6b3a22',f(5,1),Y-4,1,4);px('#6b3a22',f(12,1),Y-4,1,4);
    box('#2b2f45',f(-14,14),Y-11,14,7);px('#e8364b',f(-14,14),Y-11,14,1);px('#1b1220',f(-14,4),Y-4,4,4);px('#e8364b',f(-13,2),Y-3,2,2);px('#1b1220',f(-4,4),Y-4,4,4);px('#e8364b',f(-3,2),Y-3,2,2);};
  K.A.w09_drones=function(t,X,Y,n){for(let i=0;i<n;i++){const a=X+i*34+Math.sin(t/700+i*2)*6,b=Y+Math.cos(t/500+i)*3;px('#1b1220',a-3,b-1,7,3);px('#9aa3b2',a-5,b-3,3,1);px('#9aa3b2',a+3,b-3,3,1);px((Math.floor(t/300)+i)%2?'#00ffd0':'#ff3df0',a,b,1,1);}};
  K.A.w09_funi=function(t,bx,by){const u=(Math.sin(t/2500)+1)/2*0.85+0.05;const x=(1-u)*(1-u)*(bx+3)+2*u*(1-u)*(bx+6)+u*u*(bx+38),y=(1-u)*(1-u)*by+2*u*(1-u)*(by-60)+u*u*(by-106);box('#e8364b',x-3,y-3,6,5);px('#cfeeff',x-2,y-2,4,2);};

  /* ---------- the world ---------- */
  const bricks=['#b2533a','#c8703c','#9a4a3a','#b8885a'];
  const plexRow=(xs,y)=>xs.map((x,i)=>['w09_plex',x,y+(i%2),bricks[(i+Math.floor(y/9))%4]]);
  const span=(a,b,st)=>{const o=[];for(let x=a;x<=b;x+=st)o.push(x);return o;};
  const tw=[[556,400,20,64,'#8aa0b8'],[582,394,22,74,'#5c6f90','#f6e7a6'],[640,398,20,60,'#9aa8ba'],[666,402,18,52,'#6f86a8'],[690,394,22,72,'#4a6a9a','#f6e7a6'],[716,402,18,56,'#8aa0b8'],[742,398,22,64,'#5c6f90'],[770,402,18,50,'#9aa8ba'],
    [392,400,18,50,'#9aa8ba'],[416,396,20,60,'#6f86a8'],[440,402,16,46,'#8aa0b8']].map(([a,b,w,h,c,wn])=>['tower',a,b,w,h,c,wn||'#d6eaf4']);
  K.P.w09_pvm=function(X,Y){shadow(X+18,Y+2,22,4);box('#b8c0cc',X+12,Y-82,12,82);box('#b8c0cc',X,Y-70,36,58);box('#8a96a8',X+12,Y-82,12,12);
    for(let yy=Y-66;yy<Y-14;yy+=5){px('#6f86a8',X+2,yy,32,2);}for(let yy=Y-80;yy<Y-6;yy+=5)px('#6f86a8',X+14,yy,8,2);px('#1b1220',X+17,Y-92,2,10);px('#ffffff',X+16,Y-93,4,2);};
  K.P.w09_gauche=function(X,Y){shadow(X+12,Y+2,16,4);box('#9aa8ba',X,Y-76,24,76);for(let yy=Y-72;yy<Y-4;yy+=5)for(let xx=X+3;xx<X+21;xx+=5)px('#d6eaf4',xx,yy,3,3);
    const G=g();G.fillStyle='#1b1220';G.beginPath();G.moveTo(X-1,Y-75);G.lineTo(X+12,Y-96);G.lineTo(X+25,Y-75);G.fill();G.fillStyle='#4fae8a';G.beginPath();G.moveTo(X+1,Y-76);G.lineTo(X+12,Y-93);G.lineTo(X+23,Y-76);G.fill();};
  K.W.push({n:9,hud:'MONTREAL',name:'Kinan vs. Annie',
    where:"Montreal: in by train along the Lachine Canal to the cobblestones of Old Montreal, a zip line over the Old Port, the Metro up to the Mount Royal lookout, the Olympic Park, the start-up lofts, and Annie's tech conference downtown, then a tour boat up the St. Lawrence.",
    marks:"Old Montreal's stone buildings, City Hall, Bonsecours Market and horse carriages, the Old Port piers, Clock Tower and zip line, the Metro with its old green entrance, Mount Royal and its lookout in autumn colours, the Plateau's outdoor staircases, the Olympic Stadium and its leaning tower, the Biodome, the space centre and its rocket, brick start-up lofts, the colourful conference centre, the downtown towers, the green Jacques Cartier Bridge, the island amusement park, the Biosphere, Habitat 67, the Lachine Canal and the St. Lawrence River.",
    size:[1120,800],ground:'grass',water:'blue',cliff:'rock',path:'tan',
    rivers:[...RIVW,RIVER,NCH,CANAL],
    zones:[
      {k:'w09_mtn',f:(X,Y)=>mrK(X,Y)<1},
      {k:'w09_quay',f:(X,Y)=>Y>584&&Y<625&&X>468&&X<800},
      {k:'w09_cobble',r:[400,472,402,114]},
      {k:'w09_plaza',e:[925,236,152,74]},
      {k:'w09_flowers',r:[760,60,360,90]},
      {k:'paved',r:[376,326,428,134]}],
    roads:[[[-20,320],[1140,320]],[[-20,465],[1140,465]],[[920,465],[920,820]],[[620,-20],[620,320]],[[920,540],[1140,540]],
      RAIL],                                                        /* bed of the rail line in from Toronto (rails drawn over it) */
    bridges:[[920,605,'traffic'],[920,703,'traffic']],
    J:{MT:[470,336],SH:[560,320],RL:[870,465]},
    /* one journey: the train from Toronto runs in along the canal; the tour boat leaves the Old Port west, up the St. Lawrence */
    entryPath:{from:[0,548],via:RAIL.slice(1,-1),road:1},
    exitPath:{to:[0,650],via:[[630,500],[638,550],[642,598],[628,630],[560,646],[400,648],[200,648]],style:'glass',ride:'boat'},
    stops:[
      {at:[440,560],name:'9-1  OLD MONTREAL',st:'open'},
      {at:[528,590],name:'9-2  THE OLD PORT ZIP LINE',st:'lock'},
      {at:[470,500],name:'9-3  THE METRO',st:'lock'},
      {at:[360,186],name:'9-4  MOUNT ROYAL LOOKOUT',st:'lock'},
      {at:[830,320],name:'9-5  THE BIODOME',st:'lock'},
      {at:[885,262],name:'FORT  THE MONTREAL TOWER',st:'fort'},
      {at:[990,300],name:'9-6  THE SPACE CENTRE',st:'lock'},
      {at:[1062,300],name:'SECRET  THE UNDERGROUND CITY',st:'secret'},
      {at:[905,425],name:'9-7  THE STARTUP LOFTS',st:'lock'},
      {at:[735,465],name:'9-8  THE CONFERENCE FLOOR',st:'lock'},
      {at:[620,465],name:"CASTLE  ANNIE'S FIREWALL  -  ANNIE",st:'boss'}],
    edges:[[0,1,[[480,586]]],[1,2,[[524,566],[496,530]]],[2,'MT',[[470,420]]],
      ['MT',3,[[468,312],[452,278],[420,232]]],[3,'SH',[[440,182],[490,210],[536,270]]],['SH',4,[],{road:1}],
      [4,5,[[850,292]]],[5,6,[[940,288]]],[6,7,[[1026,300]]],[6,8,[[992,350],[968,396]]],[8,'RL',[]],['RL',9,[],{road:1}],[9,10,[],{road:1}]],
    exit:[20,650],
    props:[
      ['w09_rail',0,548,RAIL],
      ['w09_hdv',540,516],['w09_bonsecours',690,588],['w09_stone',664,512,30,26,'#5fa88a'],['w09_stone',700,510,26,30,'#6f9ab8'],['w09_stone',732,512,30,24,'#5fa88a'],['w09_stone',768,510,28,28,'#8a9098'],
      ['w09_stone',566,580,22,22,'#5fa88a'],
      ['w09_clockTower',792,600],['w09_pier',566,606,26],['w09_pier',598,610,24],['w09_pier',700,606,20],
      ['w09_guimard',440,506],['w09_metroStop',506,338],
      ['w09_chalet',320,170],['w09_stadium',945,252],['w09_biodome',790,306],['w09_space',962,282],['w09_rocket',1074,298],
      ['w09_loft',796,452,72,'START-UP'],['w09_loft',1004,456,84,'CODE LAB'],['w09_loft',812,372,60],['w09_loft',1040,380,60],
      ['w09_palais',540,458],['w09_pvm',500,404],['w09_gauche',610,402],...tw,
      ['w09_jcb',920,590,620],['w09_jcb',920,655,751],['w09_biosphere',862,646],['w09_habitat',790,640],['coaster',960,654],
      ['w09_sign',6,540,'WELCOME TO','MONTREAL'],['w09_sign',6,738,'TO WORLD 10','NIAGARA FALLS','#2a5bd7'],
      ...plexRow([500,526,552,578],152),...plexRow([650,676,702,728,754],152),...plexRow([520,546,572,598],202),...plexRow([650,676,702,728,754],202),
      ...plexRow([548,574,600],252),...plexRow([650,676,702,728,754],252),...plexRow([574,600],302),...plexRow([650,676,702,728,754],302),
      ...plexRow(span(10,190,26),360),...plexRow(span(10,350,26),410),...plexRow(span(10,350,26),455),...plexRow(span(230,350,26),360),
      ...plexRow(span(10,180,26),120),...plexRow(span(10,180,26),300),...plexRow(span(88,400,26),515),
      ...plexRow([940,1018,1044,1070,1096],360),...plexRow(span(960,1100,26),520),...plexRow(span(20,700,26),790),...plexRow(span(940,1100,26),790),
      ['w09_lbl',300,690,'ST. LAWRENCE RIVER'],['w09_lbl',690,632,'OLD PORT'],['w09_lbl',730,470,'OLD MONTREAL'],['w09_lbl',290,262,'MOUNT ROYAL'],['w09_lbl',700,264,'PLATEAU'],
      ['w09_lbl',1000,672,'ISLAND AMUSEMENT PARK'],['w09_lbl',1010,592,'JACQUES CARTIER BRIDGE'],['w09_lbl',735,536,'ZIP LINE'],['w09_lbl',150,578,'LACHINE CANAL'],['w09_lbl',940,70,'BOTANICAL GARDEN']],
    scatter:[{k:'w09_maple',n:150,zone:'w09_mtn'},{k:'tree',n:40,zone:'w09_mtn'},{k:'w09_maple',n:30,zone:'grass'},{k:'tree',n:40,zone:'grass'},{k:'bush',n:20,zone:'w09_flowers'},{k:'w09_maple',n:14,zone:'w09_flowers'}],
    anim:[['w09_metro',[[486,490],[486,346]]],['w09_zip',797,548,510,590],['w09_caleche',520,600,552],['w09_drones',600,376,5],['w09_funi',885,244],
      ['coasterCar',960,654],['ferris',1074,624,12],['boat',300,668,0],['boat',640,690,1],['boat',1060,740,2],['boat',190,642,3],['flag',572,456,'#2a5bd7'],['smoke',1074,296]],
    fx:undefined});
})(KINAN);

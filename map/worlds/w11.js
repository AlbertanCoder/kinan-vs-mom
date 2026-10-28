/* World 11: Inside the Console (Kinan and Glitchy).
   Floating islands in a dark void. The route spirals inward: the four mini realms around the
   outside (bricks, starbase, dino valley, chocolate cake), then Glitchy's islands, then the core. */
(function(K){
  const {px,box,shadow,txt,hash}=K; const g=()=>K.g();
  const W11=()=>K.W.find(o=>o.n===11);

  /* ---------- grounds ---------- */
  /* the brick mountain: four stacked studded terraces with brick step faces, built into the ground so the trail climbs it */
  const MT={cx:205,cy:[442,431,420,409],rx:[74,56,39,21],ry:[48,36,25,13],c:['#e8364b','#f6c445','#2a5bd7','#f4f1e8'],s:['#ff6070','#ffe070','#4a7ef0','#ffffff'],d:['#a8243a','#c9962a','#1d44a8','#b8bfcc']};
  const lvl=(X,Y)=>{let L=0;for(let i=0;i<4;i++)if(((X-MT.cx)/MT.rx[i])**2+((Y-MT.cy[i])/MT.ry[i])**2<1)L=i+1;return L;};
  const studs=(X,Y,base,stud,hi)=>{const a=X%8,b=Y%8;if(a>=2&&a<=5&&b>=2&&b<=5)return b===2?hi:stud;return base;};
  K.GROUND.w11_brickMtn=(X,Y)=>{const L=lvl(X,Y);
    for(let h=1;h<=10;h++){const L2=lvl(X,Y-h);if(L2>L){if(h===1||h===10)return '#1b1220';if(h===5)return '#1b1220';const off=h>5?4:0;if((X+off)%8===0)return '#1b1220';return h<3?MT.s[L2-1]:MT.d[L2-1];}}
    if(lvl(X,Y+1)>L||lvl(X-1,Y)>L||lvl(X+1,Y)>L)return '#1b1220';
    if(L===0)return studs(X,Y,'#3fa34d','#57c066','#8fe09a');
    return studs(X,Y,MT.c[L-1],MT.s[L-1],'#ffffff');};
  K.RIM.w11_brickMtn='#7fd88c';K.LINE.w11_brickMtn='#1f5e2a';
  /* the brick sea: blue studs in rolling wave rows */
  K.GROUND.w11_brickSea=(X,Y)=>{const wv=((Y>>3)+Math.round(Math.sin(X/18)*1.2))%3===0;return studs(X,Y,wv?'#2f66e0':'#2a5bd7',wv?'#7aa8ff':'#4a7ef0',wv?'#ffffff':'#9cc0ff');};
  K.RIM.w11_brickSea='#9cc0ff';K.LINE.w11_brickSea='#1d44a8';
  /* starbase deck plates */
  K.GROUND.w11_deck=(X,Y)=>{if(X%20===0||Y%14===0)return '#5e6778';if(X%20===2&&Y%14===2)return '#e8eef6';if(X%20===18&&Y%14===12)return '#e8eef6';return (((X/20|0)+(Y/14|0))&1)?'#9aa3b2':'#aab2c0';};
  K.RIM.w11_deck='#dfe5ee';K.LINE.w11_deck='#2b2f45';
  /* the trench: dark walls with running lights */
  K.GROUND.w11_trench=(X,Y)=>{const r=Y-196;if(r<1||r>12)return '#1b1220';if(r<3)return X%10<5?'#ff8a3d':'#4a5160';if(r>10)return X%10<5?'#7ec8ff':'#4a5160';return (X%6===0)?'#30364c':'#22263a';};
  K.RIM.w11_trench='#4a5160';K.LINE.w11_trench='#1b1220';
  /* hazard stripes on the landing pad ring */
  K.GROUND.w11_hazard=(X,Y)=>((X+Y)>>2)&1?'#f6c445':'#1b1220';
  K.RIM.w11_hazard='#f6c445';K.LINE.w11_hazard='#1b1220';
  /* chocolate frosting with swirls and sprinkles */
  K.GROUND.w11_choc=(X,Y)=>{const h=hash(X,Y);if(h>.988)return ['#ff6fae','#f6c445','#7ec8ff','#ffffff','#44c55a'][Math.floor(hash(Y,X)*5)];const s=Math.sin(X/7+Math.sin(Y/9)*2)+Math.cos(Y/6);return s>1.3?'#9a5a34':s<-1.2?'#5a2e16':'#74401f';};
  K.RIM.w11_choc='#c88a5a';K.LINE.w11_choc='#2a140a';
  /* dev room carpet */
  K.GROUND.w11_carpet=(X,Y)=>((X>>2)+(Y>>2))&1?'#3a4a7a':'#34446e';
  K.RIM.w11_carpet='#7f9ad8';K.LINE.w11_carpet='#141a33';

  /* each realm repaints its own cliff skirt (the engine has one cliff palette per world) */
  const CL={
    brick:(X,d)=>{const row=Math.floor((d-1)/3);if(d%3===0)return '#1b1220';if((X+(row%2)*4)%8===0)return '#1b1220';return ['#e8364b','#f6c445','#2a5bd7','#44c55a'][row%4];},
    metal:(X,d)=>{if(d===1)return '#dfe5ee';if(d>=12)return '#1b1220';if(X%14===0)return '#2b2f45';if(d===7&&X%14===7)return (X%28===7)?'#ff3d3d':'#7ec8ff';return ['#c9d0dc','#9aa3b2','#6f7889','#4a5160','#2b2f45'][Math.min(4,Math.floor(d/3))];},
    dino:(X,d)=>{const s=d+Math.round(Math.sin(X/9)*1.2);return s<=2?'#7cc05a':['#e6c49a','#d9a066','#c27a4a','#a8664a','#5e3b20'][Math.min(4,Math.floor((s-2)/2.2))];},
    choc:(X,d)=>{const drip=2+Math.floor(hash(X>>1,7)*5);if(d<=drip)return d===drip?'#e8d8c8':'#fff6ea';if(d<=5)return '#7a4424';if(d<=7)return '#ffe2b8';if(d<=10)return '#6b3a1f';return '#3b1d0e';},
    carpet:(X,d)=>d<=2?'#7f9ad8':['#5a5f7a','#4a4f68','#3a3f56','#2a2e42'][Math.min(3,Math.floor((d-2)/2.6))]};
  K.P.w11_cliff=function(x0,_s,x1,y0,y1,kind){const w=W11(),G=g();
    for(let X=x0;X<=x1;X++)for(let Y=y0;Y<=y1;Y++){if(w.M(X,Y))continue;let d=0;for(let k=1;k<=12;k++)if(w.M(X,Y-k)){d=k;break;}if(!d)continue;G.fillStyle=CL[kind](X,d);G.fillRect(X,Y,1,1);}};

  /* ---------- props: shared ---------- */
  K.P.w11_lbl=function(X,Y,s){K.P.label(X,Y,s);};
  K.P.w11_errorBox=function(X,Y){box('#dfe5ee',X,Y-30,60,30);px('#2a5bd7',X,Y-30,60,7);txt('ERROR',X+3,Y-30,'#ffffff',6,1);box('#e8364b',X+52,Y-29,5,5);
    px('#f6c445',X+5,Y-20,9,8);px('#1b1220',X+9,Y-18,1,4);px('#1b1220',X+9,Y-13,1,1);txt('KINAN.EXE',X+18,Y-21,'#1b1220',6,1);box('#c9d0dc',X+22,Y-10,16,6);txt('OK',X+26,Y-10,'#1b1220',6,1);};
  K.P.w11_bigPixel=function(X,Y,c){box(c,X,Y-8,8,8);px('rgba(255,255,255,.5)',X,Y-8,8,2);};

  /* ---------- the Wrong-Way Portal ---------- */
  K.P.w11_wrongPortal=function(X,Y){const G=g();shadow(X,Y+2,26,5);
    G.fillStyle='#1b1220';G.beginPath();G.ellipse(X,Y-24,22,26,0,0,Math.PI*2);G.fill();G.fillStyle='#5a2fa0';G.beginPath();G.ellipse(X,Y-24,20,24,0,0,Math.PI*2);G.fill();
    G.fillStyle='#0b0618';G.beginPath();G.ellipse(X,Y-24,14,18,0,0,Math.PI*2);G.fill();
    for(let i=0;i<8;i++){const a=i*Math.PI/4;px('#00ffd0',X+Math.cos(a)*17-1,Y-24+Math.sin(a)*21-1,3,3);}
    box('#5a2fa0',X-24,Y-4,48,5);
    px('#1b1220',X+30,Y-26,2,26);box('#e8364b',X+20,Y-40,26,16);G.save();G.translate(X+44,Y-36);G.scale(-1,1);txt('WRONG',0,0,'#ffffff',6,1);txt('WAY',4,6,'#ffffff',6,1);G.restore();
    K.P.label(X+8,Y+4,'WRONG-WAY PORTAL');};

  /* ---------- Mini Brick Realm ---------- */
  K.P.w11_brickTree=function(X,Y){shadow(X,Y+1,7,2);box('#8a5426',X-2,Y-6,5,6);[[10,-10],[8,-14],[6,-18],[4,-22]].forEach(([w,b])=>{box('#44c55a',X-w/2,Y+b,w,4);px('#8fe09a',X-w/2+1,Y+b-1,2,1);});};
  K.P.w11_brickHouse=function(X,Y,c){shadow(X+11,Y+1,13,3);box('#f4f1e8',X,Y-12,22,12);px('#1b1220',X-2,Y-19,26,8);px(c,X-1,Y-18,24,6);for(let i=1;i<24;i+=6)px('rgba(255,255,255,.6)',X-1+i,Y-20,3,2);box('#7ec8ff',X+3,Y-9,5,4);box('#f6c445',X+13,Y-8,5,8);};
  K.P.w11_brickBridge=function(X,Y1,Y2){/* a deck of coloured bricks across the brick sea */const c=['#e8364b','#f6c445','#f4f1e8','#44c55a'];
    for(let y=Y1;y<=Y2;y+=4){const i=(y-Y1)/4|0;px('#1b1220',X-10,y-1,20,5);px(c[i%4],X-9,y,18,3);px('rgba(255,255,255,.45)',X-9,y,18,1);}
    for(let y=Y1;y<=Y2;y+=8){px('#1b1220',X-12,y-3,4,6);px('#e8364b',X-11,y-2,2,4);px('#1b1220',X+8,y-3,4,6);px('#e8364b',X+9,y-2,2,4);}};
  K.P.w11_brickBoat=function(X,Y){box('#f6c445',X,Y-5,20,5);px('#1b1220',X+9,Y-18,1,13);g().fillStyle='#ffffff';g().beginPath();g().moveTo(X+10,Y-18);g().lineTo(X+19,Y-7);g().lineTo(X+10,Y-7);g().fill();for(let i=2;i<20;i+=6)px('rgba(255,255,255,.6)',X+i,Y-6,3,1);};
  K.P.w11_brickRex=function(X,Y){/* BRICK-REX, made of green bricks, roaring at the summit */
    const B=(x,y,w,h,c)=>{box(c,X+x,Y+y-h,w,h);for(let i=2;i<w-2;i+=6){px(c,X+x+i,Y+y-h-2,4,2);px('rgba(255,255,255,.5)',X+x+i,Y+y-h-2,4,1);}px('rgba(0,0,0,.2)',X+x+w-3,Y+y-h,3,h);};
    shadow(X+22,Y+2,30,5);B(-16,-14,18,8,'#44c55a');B(0,-8,34,14,'#44c55a');B(22,-20,18,14,'#44c55a');B(30,-34,22,14,'#44c55a');
    px('#ffffff',X+44,Y-30,4,4);px('#1b1220',X+46,Y-29,2,2);px('#1b1220',X+33,Y-24,19,2);for(let i=34;i<50;i+=4)px('#ffffff',X+i,Y-23,2,2);
    B(4,0,8,10,'#2f8a3a');B(22,0,8,10,'#2f8a3a');B(30,-16,4,6,'#2f8a3a');px('#e8364b',X+24,Y-36,10,3);K.P.label(X+20,Y+4,'BRICK-REX');};

  /* ---------- Mini Starbase ---------- */
  K.P.w11_hangar=function(X,Y){const G=g();shadow(X,Y+3,50,6);
    G.fillStyle='#1b1220';G.beginPath();G.ellipse(X,Y,48,40,0,Math.PI,0);G.fill();G.fillStyle='#c9d0dc';G.beginPath();G.ellipse(X,Y,46,38,0,Math.PI,0);G.fill();
    G.fillStyle='#9aa3b2';G.beginPath();G.ellipse(X,Y,46,38,0,Math.PI*1.5,0);G.fill();
    for(let i=-40;i<=40;i+=10){const hh=Math.sqrt(Math.max(0,1-(i/46)**2))*38;px('#6f7889',X+i,Y-hh,1,hh);}
    px('#1b1220',X-24,Y-26,48,26);px('#141632',X-23,Y-25,46,25);
    for(let i=0;i<46;i+=6)px('#f6c445',X-23+i,Y-25,3,2);
    /* a starfighter parked inside the bay */
    px('#dfe5ee',X-14,Y-10,28,4);px('#dfe5ee',X-3,Y-16,6,14);px('#e8364b',X-12,Y-10,6,2);px('#e8364b',X+6,Y-10,6,2);px('#7ec8ff',X-1,Y-14,2,3);
    px('#ffffff',X-30,Y-34,6,2);K.P.label(X,Y+4,'HANGAR');};
  K.P.w11_fighter=function(X,Y,c){/* a generic starfighter seen from above: long nose, swept wings, wingtip cannons, glowing twin engines */
    shadow(X,Y+5,18,4);const G=g();
    const wing=(sx)=>{G.fillStyle='#1b1220';G.beginPath();G.moveTo(X+sx*3,Y-12);G.lineTo(X+sx*19,Y);G.lineTo(X+sx*19,Y+4);G.lineTo(X+sx*3,Y+2);G.fill();G.fillStyle='#dfe5ee';G.beginPath();G.moveTo(X+sx*3,Y-10);G.lineTo(X+sx*18,Y+1);G.lineTo(X+sx*18,Y+3);G.lineTo(X+sx*3,Y+1);G.fill();
      px(c,X+(sx>0?8:-12),Y-3,4,2);px('#1b1220',X+sx*19-(sx>0?0:1),Y-10,1,12);};
    wing(1);wing(-1);
    px('#1b1220',X-4,Y-26,8,32);px('#f4f1e8',X-3,Y-25,6,30);px('#c9d0dc',X+1,Y-25,2,30);px(c,X-3,Y-18,6,2);
    px('#1b1220',X-2,Y-16,4,7);px('#7ec8ff',X-1,Y-15,2,5);px('#ffffff',X-1,Y-15,1,2);
    px('#ff8a3d',X-3,Y+5,2,3);px('#ff8a3d',X+1,Y+5,2,3);px('#f6c445',X-3,Y+5,2,1);px('#f6c445',X+1,Y+5,2,1);};
  K.P.w11_pad=function(X,Y){const G=g();G.fillStyle='#1b1220';G.beginPath();G.ellipse(X,Y,24,12,0,0,Math.PI*2);G.fill();G.fillStyle='#4a5160';G.beginPath();G.ellipse(X,Y,23,11,0,0,Math.PI*2);G.fill();
    for(let i=0;i<16;i++){const a=i*Math.PI/8;px(i%2?'#f6c445':'#1b1220',X+Math.cos(a)*20-1,Y+Math.sin(a)*9-1,3,2);}px('#f4f1e8',X-6,Y-4,2,8);px('#f4f1e8',X+4,Y-4,2,8);px('#f4f1e8',X-4,Y-1,8,2);};
  K.P.w11_droid=function(X,Y,c){const G=g();shadow(X+4,Y+1,6,2);box('#e8eef6',X,Y-9,9,9);px(c||'#2a5bd7',X+1,Y-7,7,2);px(c||'#2a5bd7',X+3,Y-4,3,2);G.fillStyle='#1b1220';G.beginPath();G.arc(X+4.5,Y-9,5,Math.PI,0);G.fill();G.fillStyle='#c9d0dc';G.beginPath();G.arc(X+4.5,Y-9,4,Math.PI,0);G.fill();px('#1b1220',X+3,Y-12,3,2);px('#e8364b',X+4,Y-12,1,1);px('#1b1220',X-2,Y-6,2,6);px('#1b1220',X+9,Y-6,2,6);};
  K.P.w11_commander=function(X,Y){/* THE DROID COMMANDER: a tall red-visored droid on a command dais */
    shadow(X,Y+2,22,5);box('#4a5160',X-20,Y-6,40,6);px('#f6c445',X-20,Y-6,40,1);
    box('#c9d0dc',X-9,Y-34,18,28);px('#9aa3b2',X+5,Y-34,4,28);box('#4a5160',X-5,Y-24,10,8);px('#00ffd0',X-3,Y-22,2,2);px('#ff3d3d',X+1,Y-22,2,2);
    box('#c9d0dc',X-15,Y-32,5,16);box('#c9d0dc',X+10,Y-32,5,16);px('#ff3d3d',X+11,Y-38,3,6);
    box('#dfe5ee',X-8,Y-46,16,12);px('#1b1220',X-7,Y-42,14,4);px('#ff3d3d',X-6,Y-41,12,2);px('#1b1220',X,Y-54,1,8);px('#ff3d3d',X-1,Y-56,3,2);
    K.P.label(X,Y+4,'DROID COMMANDER');};
  K.P.w11_ctower=function(X,Y){shadow(X,Y+2,12,3);box('#9aa3b2',X-5,Y-40,10,40);px('#6f7889',X+2,Y-40,3,40);box('#dfe5ee',X-12,Y-52,24,12);px('#1b1220',X-11,Y-48,22,4);px('#7ec8ff',X-10,Y-47,20,2);};
  K.P.w11_crates=function(X,Y){[[0,0],[9,0],[4,-8]].forEach(([a,b])=>{box('#c99a5c',X+a,Y+b-8,8,8);px('#8a6440',X+a,Y+b-5,8,1);px('#8a6440',X+a+3,Y+b-8,1,8);});};
  K.P.w11_turret=function(X,Y){box('#4a5160',X-4,Y-6,8,6);px('#1b1220',X-1,Y-12,2,6);px('#ff3d3d',X-1,Y-13,2,1);};

  /* ---------- Mini Dino Valley ---------- */
  K.P.w11_volcano=function(X,Y){const G=g();shadow(X,Y+3,58,7);
    G.fillStyle='#1b1220';G.beginPath();G.moveTo(X-58,Y+1);G.lineTo(X-14,Y-62);G.lineTo(X+14,Y-62);G.lineTo(X+58,Y+1);G.fill();
    G.fillStyle='#6b5a4a';G.beginPath();G.moveTo(X-56,Y);G.lineTo(X-13,Y-60);G.lineTo(X+13,Y-60);G.lineTo(X+56,Y);G.fill();
    G.fillStyle='#55473a';G.beginPath();G.moveTo(X+2,Y-60);G.lineTo(X+13,Y-60);G.lineTo(X+56,Y);G.lineTo(X+22,Y);G.fill();
    px('#1b1220',X-13,Y-63,26,4);px('#e8364b',X-12,Y-62,24,3);
    [[-6,0],[2,6],[-2,14],[5,22],[0,30]].forEach(([a,b],i)=>{px('#1b1220',X+a-1,Y-60+b,6,9);px(i%2?'#ff8a3d':'#f6c445',X+a,Y-60+b,4,8);});
    [[-40,-8],[30,-14],[-20,-30]].forEach(([a,b])=>{px('#3f8f2e',X+a,Y+b,6,3);});K.P.label(X,Y+4,'THE VOLCANO');};
  K.P.w11_trex=function(X,Y){/* THE ALPHA T-REX: big, green, tiny arms, roaring */
    const c='#5aa84a',d='#3f8236';shadow(X+16,Y+3,30,5);
    box(c,X-20,Y-24,14,8);box(c,X-8,Y-30,30,20);box(d,X,Y-10,8,10);box(d,X+14,Y-10,8,10);box(c,X+14,Y-50,18,24);box(c,X+20,Y-62,26,14);
    px('#1b1220',X+24,Y-50,22,2);for(let i=26;i<46;i+=4){px('#ffffff',X+i,Y-52,2,2);px('#ffffff',X+i+2,Y-49,2,2);}px('#ffffff',X+36,Y-60,4,3);px('#1b1220',X+38,Y-59,2,2);
    box(c,X+30,Y-40,6,3);px(c,X+34,Y-38,2,3);px('#8fd06a',X-6,Y-28,26,2);for(let i=0;i<5;i++)px(d,X+i*6-6,Y-32,3,3);K.P.label(X+14,Y+4,'ALPHA T-REX');};
  K.P.w11_nest=function(X,Y){K.P.nest(X,Y);};
  K.P.w11_bones=function(X,Y){K.P.bones(X,Y);};

  /* ---------- Mini Cake Multiverse (chocolate) ---------- */
  K.P.w11_candle=function(X,Y,c){box(c,X-2,Y-16,5,16);px('rgba(255,255,255,.5)',X-2,Y-16,2,16);px('#1b1220',X,Y-19,1,3);};
  K.P.w11_cherry=function(X,Y){px('#1b1220',X-4,Y-7,9,8);px('#e8364b',X-3,Y-6,7,6);px('#ffffff',X-2,Y-5,2,2);px('#2f7a2c',X,Y-11,1,5);px('#2f7a2c',X+1,Y-11,3,1);};
  K.P.w11_strawberry=function(X,Y){px('#1b1220',X-5,Y-10,11,11);px('#e8364b',X-4,Y-9,9,9);for(let i=0;i<4;i++)px('#fff3c4',X-3+i*2,Y-7+(i%2)*3,1,1);px('#44c55a',X-3,Y-11,7,3);};
  K.P.w11_cupcake=function(X,Y){shadow(X,Y+2,20,4);const G=g();G.fillStyle='#1b1220';G.beginPath();G.moveTo(X-16,Y-20);G.lineTo(X+16,Y-20);G.lineTo(X+12,Y);G.lineTo(X-12,Y);G.fill();
    for(let i=-14;i<14;i+=4){px(i%8?'#ff6fae':'#ffd1e6',X+i+1,Y-19,3,18);}
    [[0,-36,12],[-8,-28,10],[8,-28,10],[0,-26,14]].forEach(([a,b,r])=>{G.fillStyle='#1b1220';G.beginPath();G.arc(X+a,Y+b,r+1,0,Math.PI*2);G.fill();G.fillStyle='#5a2e16';G.beginPath();G.arc(X+a,Y+b,r,0,Math.PI*2);G.fill();});
    px('#9a5a34',X-8,Y-38,6,3);px('#9a5a34',X+2,Y-44,5,2);K.P.w11_cherry(X,Y-46);for(let i=0;i<8;i++)px(['#f6c445','#7ec8ff','#ffffff','#44c55a'][i%4],X-10+i*3,Y-30+(i%3)*4,2,1);};
  K.P.w11_slice=function(X,Y){const G=g();shadow(X+10,Y+2,16,3);G.fillStyle='#1b1220';G.beginPath();G.moveTo(X-1,Y+1);G.lineTo(X+30,Y+1);G.lineTo(X+30,Y-17);G.lineTo(X-1,Y-9);G.fill();
    px('#6b3a1f',X,Y-8,30,8);px('#ffe2b8',X,Y-5,30,2);px('#fff6ea',X,Y-10,30,2);G.fillStyle='#5a2e16';G.beginPath();G.moveTo(X+30,Y-16);G.lineTo(X+30,Y);G.lineTo(X+22,Y);G.lineTo(X+22,Y-14);G.fill();};
  K.P.w11_mirror=function(X,Y){/* MIRROR KINAN: a tall gold mirror and the flipped, colour-swapped Kinan stepping out of it */
    shadow(X,Y+2,20,4);box('#c9922f',X-16,Y-50,32,50);px('#ffe58a',X-16,Y-50,32,2);px('#b4e6ff',X-12,Y-46,24,42);px('rgba(255,255,255,.7)',X-10,Y-44,4,20);px('rgba(255,255,255,.5)',X-4,Y-40,2,10);
    const S=[['..kkkkk..'],['.khhhhhk.'],['.khsssshk'],['.ksksksk.'],['..kssssk.'],['.kjjjjjk.'],['kjjjyjjjk'],['.kjjjjjk.'],['..kmmmk..'],['..kk.kk..']];
    const pal={k:'#1b1220',h:'#4a2c1a',s:'#d9a27a',j:'#2a1846',y:'#00ffd0',m:'#7a2fd0'};
    S.forEach((r,ri)=>{const row=r[0];for(let c=0;c<row.length;c++){const ch=row[row.length-1-c];if(ch!=='.')px(pal[ch],X-5+c,Y-36+ri*2,1,2);}});
    px('#1b1220',X-18,Y-2,36,2);K.P.label(X,Y+4,'MIRROR KINAN');};

  /* ---------- Glitchy's islands ---------- */
  K.P.w11_firewall=function(X,Y,w,gap){/* a brick wall on fire, with a gate in the middle */
    const seg=(x0,x1)=>{box('#a8322e',x0,Y-24,x1-x0,24);for(let r=0;r<4;r++)for(let x=x0+(r%2)*5;x<x1;x+=10){px('#1b1220',x,Y-24+r*6,1,6);}for(let r=1;r<4;r++)px('#1b1220',x0,Y-24+r*6,x1-x0,1);px('#e0605a',x0,Y-24,x1-x0,2);
      for(let x=x0;x<x1;x+=8){box('#a8322e',x,Y-28,5,4);}};
    shadow(X,Y+2,w/2+6,5);seg(X-w/2,X-gap/2);seg(X+gap/2,X+w/2);
    box('#4a5160',X-gap/2-4,Y-36,6,36);box('#4a5160',X+gap/2-2,Y-36,6,36);px('#00ffd0',X-gap/2-3,Y-34,4,3);px('#00ffd0',X+gap/2-1,Y-34,4,3);
    K.P.label(X,Y+4,'THE FIREWALL');};
  K.P.w11_copyBlock=function(X,Y,c){/* one building, pasted three times with ghosting */
    [[10,-10,.35],[5,-5,.6],[0,0,1]].forEach(([a,b,al])=>{g().globalAlpha=al;K.P.tower(X+a,Y+b,22,52,c,'#00ffd0');g().globalAlpha=1;});};
  K.P.w11_cursor=function(X,Y){const G=g();G.fillStyle='#1b1220';G.beginPath();G.moveTo(X,Y-34);G.lineTo(X+22,Y-12);G.lineTo(X+12,Y-12);G.lineTo(X+18,Y);G.lineTo(X+12,Y+2);G.lineTo(X+7,Y-9);G.lineTo(X,Y-3);G.closePath();G.fill();
    G.fillStyle='#ffffff';G.beginPath();G.moveTo(X+2,Y-29);G.lineTo(X+17,Y-14);G.lineTo(X+9,Y-14);G.lineTo(X+14,Y-2);G.lineTo(X+12,Y-1);G.lineTo(X+7,Y-12);G.lineTo(X+2,Y-7);G.closePath();G.fill();};
  K.P.w11_stamp=function(X,Y,s,c){box(c,X,Y-11,s.length*5+8,11);txt(s,X+4,Y-10,'#ffffff',7,1);};
  K.P.w11_vault=function(X,Y){const G=g();shadow(X,Y+3,34,6);box('#6f7889',X-34,Y-50,68,50);px('#9aa3b2',X-34,Y-50,68,3);
    G.fillStyle='#1b1220';G.beginPath();G.arc(X,Y-26,21,0,Math.PI*2);G.fill();G.fillStyle='#c9d0dc';G.beginPath();G.arc(X,Y-26,20,0,Math.PI*2);G.fill();G.fillStyle='#9aa3b2';G.beginPath();G.arc(X,Y-26,14,0,Math.PI*2);G.fill();
    G.strokeStyle='#1b1220';G.lineWidth=2;for(let i=0;i<3;i++){const a=i*Math.PI/3;G.beginPath();G.moveTo(X+Math.cos(a)*11,Y-26+Math.sin(a)*11);G.lineTo(X-Math.cos(a)*11,Y-26-Math.sin(a)*11);G.stroke();}
    px('#1b1220',X-3,Y-29,6,6);px('#f6c445',X-2,Y-28,4,4);txt('SAVE FILES',X-26,Y-49,'#f6c445',6,1);K.P.label(X,Y+4,'SAVE FILE VAULT');};
  K.P.w11_save=function(X,Y,n,bad){/* a save-file disk; the bad one is corrupted */
    box(bad?'#7a2fd0':'#2a5bd7',X,Y-14,14,14);px('#dfe5ee',X+3,Y-14,8,5);px('#1b1220',X+8,Y-13,2,3);px('#f4f1e8',X+2,Y-7,10,6);txt(String(n),X+5,Y-8,'#1b1220',6,1);
    if(bad){px('#00ffd0',X-3,Y-10,6,2);px('#ff3df0',X+10,Y-4,7,2);px('#00ffd0',X+4,Y-16,3,2);}};
  K.P.w11_devRoom=function(X,Y){/* Shad's Dev Room: a desk, two monitors full of code, a chair, a mug and a poster */
    shadow(X,Y+2,30,4);box('#8a5426',X-28,Y-14,56,6);px('#6f4a26',X-26,Y-8,4,8);px('#6f4a26',X+22,Y-8,4,8);
    [[-24,'#00ffd0'],[2,'#f6c445']].forEach(([a,c])=>{box('#1b1220',X+a,Y-32,22,16);px('#141632',X+a+1,Y-31,20,14);for(let i=0;i<5;i++)px(i%2?c:'#ff6fae',X+a+3,Y-29+i*3,4+((i*7)%11),1);px('#1b1220',X+a+10,Y-16,2,3);});
    box('#e8364b',X+30,Y-18,10,12);px('#1b1220',X+33,Y-6,2,6);box('#ffffff',X-10,Y-20,5,5);px('#ffffff',X-5,Y-19,1,2);
    box('#f6c445',X-46,Y-40,16,20);px('#2a5bd7',X-44,Y-36,12,8);px('#e8364b',X-42,Y-26,8,2);
    K.P.label(X,Y+4,"SHAD'S DEV ROOM");};
  K.P.w11_portalMachine=function(X,Y){const G=g();shadow(X,Y+3,46,7);
    box('#4a5160',X-44,Y-12,88,12);px('#6f7889',X-44,Y-12,88,2);for(let i=0;i<8;i++)px(i%2?'#00ffd0':'#ff3df0',X-40+i*11,Y-7,4,2);
    G.fillStyle='#1b1220';G.beginPath();G.ellipse(X,Y-38,28,30,0,0,Math.PI*2);G.fill();G.fillStyle='#9aa3b2';G.beginPath();G.ellipse(X,Y-38,26,28,0,0,Math.PI*2);G.fill();
    G.fillStyle='#0b0618';G.beginPath();G.ellipse(X,Y-38,19,21,0,0,Math.PI*2);G.fill();
    for(let i=0;i<12;i++){const a=i*Math.PI/6;px(i%3?'#6f7889':'#f6c445',X+Math.cos(a)*23-1,Y-38+Math.sin(a)*25-1,3,3);}
    [[-40,'#e8364b'],[30,'#2a5bd7']].forEach(([a,c])=>{box('#6f7889',X+a,Y-30,12,18);px(c,X+a+2,Y-27,3,3);px('#f6c445',X+a+7,Y-27,3,3);px('#00ffd0',X+a+2,Y-21,8,2);});
    G.strokeStyle='#1b1220';G.lineWidth=2;G.beginPath();G.moveTo(X-34,Y-30);G.quadraticCurveTo(X-30,Y-60,X-12,Y-64);G.stroke();G.beginPath();G.moveTo(X+36,Y-30);G.quadraticCurveTo(X+34,Y-60,X+12,Y-64);G.stroke();
    K.P.label(X-78,Y-34,'THE PORTAL MACHINE');};
  K.P.w11_core=function(X,Y){/* Glitchy's core: a stepped tower of glitch blocks around a giant glowing core */
    const G=g();shadow(X,Y+4,70,9);
    [[0,92,14,'#3a1a70'],[1,74,14,'#4a2290'],[2,56,14,'#5a2fa0'],[3,38,14,'#7a2fd0']].forEach(([i,w,h,c])=>{const y=Y-i*h;box(c,X-w,y-h,w*2,h);px('rgba(255,255,255,.18)',X-w,y-h,w*2,2);px('rgba(0,0,0,.25)',X-w,y-3,w*2,3);for(let x=X-w+4;x<X+w-4;x+=12)px(hash(x,i)>.5?'#00ffd0':'#ff3df0',x,y-h+5,4,3);});
    for(let i=0;i<14;i++){const a=hash(i,3)*Math.PI*2,r=60+hash(i,4)*40;px(i%2?'#00ffd0':'#ff3df0',X+Math.cos(a)*r,Y-30+Math.sin(a)*r*0.45,3,3);}
    K.P.label(X,Y+6,"GLITCHY'S CORE");};

  /* ---------- animations ---------- */
  K.A.w11_suns=function(t,X,Y){[[0,0,15,'#fff1b0'],[34,14,10,'#ffb46a']].forEach(([a,b,r,c],i)=>{const p=Math.sin(t/500+i)*1.5;g().fillStyle='rgba(255,230,160,.18)';g().beginPath();g().arc(X+a,Y+b,r+8+p,0,Math.PI*2);g().fill();g().fillStyle='rgba(255,230,160,.3)';g().beginPath();g().arc(X+a,Y+b,r+4+p,0,Math.PI*2);g().fill();g().fillStyle=c;g().beginPath();g().arc(X+a,Y+b,r,0,Math.PI*2);g().fill();g().fillStyle='rgba(255,255,255,.6)';g().beginPath();g().arc(X+a-r/3,Y+b-r/3,r/3,0,Math.PI*2);g().fill();});};
  K.A.w11_radar=function(t,X,Y){const a=t/500;const dx=Math.round(Math.cos(a)*9);px('#1b1220',X,Y-8,1,8);px('#1b1220',X-Math.abs(dx)-1,Y-11,Math.abs(dx)*2+3,4);px('#dfe5ee',X-Math.abs(dx),Y-10,Math.abs(dx)*2+1,2);px('#ff3d3d',X+dx,Y-13,2,2);};
  K.A.w11_flyby=function(t,X,Y,W){const u=((t/5000)%1);const a=X+u*W;if(u>0.98)return;px('#1b1220',a-1,Y-3,14,6);px('#e8eef6',a,Y-2,12,4);px('#e8364b',a+2,Y-2,3,1);px('#ff8a3d',a-3,Y-1,3,2);px('#00ffd0',a+11,Y-1,2,2);};
  K.A.w11_lava=function(t,X,Y){for(let i=0;i<5;i++){const a=((t/900)+i/5)%1;px(i%2?'#ff8a3d':'#f6c445',X-6+i*3+Math.sin(a*6+i)*4,Y-a*26,2+Math.round((1-a)*2),2+Math.round((1-a)*2));}};
  K.A.w11_ptero=function(t,X,Y){const u=t/3200,a=X+Math.cos(u)*40,b=Y+Math.sin(u*2)*8,f=Math.floor(t/200)%2;px('#1b1220',a-1,b-1,6,4);px('#a8664a',a,b,4,2);px('#a8664a',a-8,b-(f?3:0),8,2);px('#a8664a',a+4,b-(f?3:0),8,2);px('#a8664a',a+4,b-2,3,1);};
  K.A.w11_flames=function(t,X0,X1,Y){for(let x=X0;x<X1;x+=4){const h=6+Math.round((Math.sin(t/110+x*0.7)+1)*3+hash(x,Math.floor(t/120))*3);px('#e8364b',x,Y-h,4,h);px('#ff8a3d',x+1,Y-h+2,2,h-2);px('#f6c445',x+1,Y-3,2,3);}};
  K.A.w11_select=function(t,X,Y,w,h){const o=Math.floor(t/120)%8;for(let i=0;i<w;i++){const on=((i+o)%8)<4;px(on?'#ffffff':'#1b1220',X+i,Y,1,1);px(on?'#1b1220':'#ffffff',X+i,Y+h,1,1);}for(let j=0;j<h;j++){const on=((j+o)%8)<4;px(on?'#ffffff':'#1b1220',X,Y+j,1,1);px(on?'#1b1220':'#ffffff',X+w,Y+j,1,1);}};
  K.A.w11_corePulse=function(t,X,Y){const p=(Math.sin(t/260)+1)/2,G=g();
    G.fillStyle='rgba(255,61,240,'+(0.18+p*0.15)+')';G.beginPath();G.arc(X,Y,26+p*6,0,Math.PI*2);G.fill();
    G.fillStyle='#1b1220';G.beginPath();G.arc(X,Y,17,0,Math.PI*2);G.fill();G.fillStyle='#ff3df0';G.beginPath();G.arc(X,Y,16,0,Math.PI*2);G.fill();G.fillStyle='#00ffd0';G.beginPath();G.arc(X,Y,10+p*3,0,Math.PI*2);G.fill();G.fillStyle='#ffffff';G.beginPath();G.arc(X-4,Y-5,4,0,Math.PI*2);G.fill();};
  K.A.w11_glitchy=function(t,X,Y){/* GLITCHY himself: a jittery pixel creature with one big eye, hovering over the core */
    const j=Math.floor(t/90)%7===0?2:0,b=Math.round(Math.sin(t/300)*2),x0=X-9+j,y0=Y-16+b;
    px('#1b1220',x0-1,y0-1,20,18);px('#7a2fd0',x0,y0,18,16);px('#ff3df0',x0,y0,18,3);px('#00ffd0',x0+(j?3:0),y0+12,18,2);
    px('#ffffff',x0+5,y0+4,8,7);px('#1b1220',x0+8+(j?1:0),y0+6,3,3);px('#1b1220',x0+4,y0+13,10,1);
    px('#7a2fd0',x0-4,y0+5,4,3);px('#7a2fd0',x0+18,y0+5,4,3);[[2,-4],[8,-6],[14,-4]].forEach(([a,c])=>px('#00ffd0',x0+a,y0+c,2,4));};
  K.A.w11_glow=function(t,X,Y,c){const p=(Math.sin(t/400+X)+1)/2;g().fillStyle=c||'rgba(0,255,208,.25)';g().globalAlpha=0.5+p*0.5;g().beginPath();g().arc(X,Y,6+p*3,0,Math.PI*2);g().fill();g().globalAlpha=1;};

  /* ---------- corruption: the further Kinan gets along the trail, the more the map itself breaks ---------- */
  /* rotting ground for the late islands (lv 0..1): rows slid sideways, dead black blocks, stuck pixels */
  const ROTC=['#00ffd0','#ff3df0','#ffffff','#f6c445','#7a2fd0'];
  const rotG=lv=>(X,Y)=>{const r=Y>>2,sh=hash(r,77)<lv*0.4?Math.round((hash(r,78)-0.5)*22*lv):0,X2=X+sh;
    if(hash(X2>>3,Y>>3)>1-lv*0.035)return '#0b0618';
    if(hash(X2>>2,(Y>>2)+500)<lv*0.006)return ROTC[Math.floor(hash(Y>>2,X2>>2)*5)];
    if(hash(X,Y)>1-lv*0.02)return ROTC[Math.floor(hash(Y,X)*5)];
    return (X2%16===0||Y%16===0)?'#5a2fa0':((X2>>3)+(Y>>3))&1?'#2a1846':'#24143e';};
  [['w11_rotA',0.5],['w11_rotB',0.65],['w11_rotC',0.78],['w11_rotD',0.88],['w11_rotE',1]].forEach(([k,lv])=>{K.GROUND[k]=rotG(lv);K.RIM[k]='#00ffd0';K.LINE[k]='#ff3df0';});
  /* corruption level of each region, in walking order: [centre x, centre y, radius x, radius y, level, its island blobs] (the Wrong-Way Portal is clean) */
  const ROT=[[205,450,170,165,0.05,[1,2,3]],[225,165,200,110,0.16,[4,5]],[545,150,175,105,0.28,[6,7,8]],[770,120,85,70,0.36,[9]],[905,215,75,62,0.40,[10]],[1020,115,90,72,0.45,[11]],
    [1015,350,115,95,0.55,[12]],[990,560,150,100,0.66,[13,14]],[745,615,115,95,0.76,[15]],[690,718,55,45,0.55,[16]],[525,605,105,90,0.86,[17]],[600,380,185,150,1.0,[18]]];
  const R=(i,s)=>hash(i*7+3,s*131+11);
  const tries=(n,f)=>{let got=0;for(let i=0;i<n*25&&got<n;i++)if(f(i))got++;};
  /* which island blob a point is closest to, so a region never spills onto its neighbours */
  const blobOf=(x,y)=>{let bi=-1,bd=1e9;W11().blobs.forEach(([a,b,r],i)=>{const d=((x-a)**2+((y-b)*1.25)**2)/(r*r);if(d<bd){bd=d;bi=i;}});return bi;};
  const inEll=(x,y,r)=>((x-r[0])/r[2])**2+((y-r[1])/r[3])**2<1&&r[5].includes(blobOf(x,y));
  /* the trail and the stops must stay readable: nothing gets drawn within m px of them */
  const nearTrail=(w,x0,y0,x1,y1,m)=>{for(const e of w.E)for(const q of e.geo)if(q[0]>x0-m&&q[0]<x1+m&&q[1]>y0-m&&q[1]<y1+m)return true;
    for(const s of w.stops)if(s.at[0]>x0-m-12&&s.at[0]<x1+m+12&&s.at[1]>y0-m-14&&s.at[1]<y1+m+12)return true;return false;};
  const allLand=(w,x0,y0,x1,y1)=>{for(let y=y0;y<=y1;y+=2)for(let x=x0;x<=x1;x+=2)if(!w.M(x,y))return false;return w.M(x1,y1);};
  const allVoid=(w,x0,y0,x1,y1)=>{for(let y=y0-14;y<=y1+8;y+=2)for(let x=x0-4;x<=x1+4;x+=2)if(w.M(x,y))return false;return true;};
  /* painters */
  const hole=(x,y,w,h)=>{px('#1b1220',x-1,y-1,w+2,h+2);px('#0b0618',x,y,w,h);px('#7a2fd0',x,y,w,1);px('#3a1a70',x,y+1,w,1);px('#22103e',x,y+2,w,1);
    if(w*h>60){px('#3a1a70',x+Math.floor(w*0.6),y+h-3,1,1);px('#00ffd0',x+2,y+h-2,1,1);}};
  const noise=(x,y,lv)=>{const n=3+Math.floor(hash(x,y)*5*(0.5+lv));for(let i=0;i<n;i++){const sz=hash(i,x+y)>0.7?2:1;px(ROTC[Math.floor(hash(x*(i+1),y)*5)],x+Math.round(hash(x+i,y*3+i)*10),y+Math.round(hash(y+i*7,x+i)*6),sz,sz);}
    if(hash(x,y+9)<lv*0.5)px(ROTC[Math.floor(hash(y,x+3)*5)],x-4,y+3,8+Math.round(hash(x,y+4)*14),1);};
  /* a strip slid sideways; its coloured seams are only painted on land so nothing streaks out into space */
  const tear=(G,w,x,y,sw,sh,dx)=>{G.drawImage(G.canvas,x,y,sw,sh,x+dx,y,sw,sh);
    for(let i=0;i<sw;i++){const X=x+dx+i;if(w.M(X,y))px('rgba(0,255,208,.6)',X,y,1,1);if(w.M(X,y+sh-1))px('rgba(255,61,240,.6)',X,y+sh-1,1,1);}
    const gx=dx>0?x:x+sw+dx;for(let i=0;i<Math.abs(dx);i++)if(w.M(gx+i,y+(sh>>1)))px(dx>0?'rgba(255,61,240,.85)':'rgba(0,255,208,.85)',gx+i,y,1,sh);};
  /* colour-inverted patch, land pixels only */
  const invert=(G,w,x,y,pw,ph)=>{const im=G.getImageData(x,y,pw,ph),d=im.data;
    for(let j=0;j<ph;j++)for(let i=0;i<pw;i++){if(!w.M(x+i,y+j))continue;const o=(j*pw+i)*4;d[o]=255-d[o];d[o+1]=255-d[o+1];d[o+2]=255-d[o+2];}G.putImageData(im,x,y);};
  const landRow=(w,x0,x1,y)=>{for(let k=0;k<=4;k++)if(!w.M(x0+(x1-x0)*k/4,y))return false;return true;};
  const frag=(G,sx,sy,w,h,dx,dy)=>{['#ff3df0','#7a2fd0','#3a1a70','#3a1a70','#140a28','#140a28'].forEach((c,k)=>px(c,dx,dy+h+k,w,1));
    G.drawImage(G.canvas,sx,sy,w,h,dx,dy,w,h);px('#1b1220',dx-1,dy-1,w+2,1);px('#1b1220',dx-1,dy,1,h+6);px('#1b1220',dx+w,dy,1,h+6);px('#1b1220',dx-1,dy+h+6,w+2,1);px('#00ffd0',dx,dy,w,1);
    hole(sx,sy,w,h);};
  const FLK=[],ATR=[];   /* flickering tiles and live tears, found while the map is built, played by A.w11_rot */
  /* drawn before every landmark: missing tiles, pixel noise, chunks broken off into the void */
  K.P.w11_rotUnder=function(){const w=W11(),G=g();FLK.length=0;
    ROT.forEach((r,ri)=>{const [cx,cy,rx,ry,lv]=r,A=Math.PI*rx*ry,rnd=(i,k)=>R(i,ri*16+k);
      tries(Math.round(Math.pow(lv,1.3)*A/2600),i=>{const s=8*(1+Math.floor(rnd(i,1)*(1+lv*1.6))),h=8*(1+Math.floor(rnd(i,2)*(1+lv)));
        const x=Math.round((cx+(rnd(i,3)*2-1)*rx)/8)*8,y=Math.round((cy+(rnd(i,4)*2-1)*ry)/8)*8;
        if(!inEll(x,y,r)||!allLand(w,x-3,y-3,x+s+3,y+h+3)||nearTrail(w,x,y,x+s,y+h,10))return false;hole(x,y,s,h);return true;});
      tries(Math.round(lv*A/1500),i=>{const x=Math.round(cx+(rnd(i,5)*2-1)*rx),y=Math.round(cy+(rnd(i,6)*2-1)*ry);
        if(!inEll(x,y,r)||!allLand(w,x-4,y,x+12,y+7)||nearTrail(w,x-4,y,x+22,y+7,8))return false;noise(x,y,lv);return true;});
      tries(Math.round(lv*lv*6),i=>{const fw=8+Math.round(rnd(i,7)*(6+8*lv)),fh=6+Math.round(rnd(i,8)*5);
        const dx=Math.round(cx+(rnd(i,9)*2-1)*(rx+40)),dy=Math.round(cy+(rnd(i,10)*2-1)*(ry+36));
        const sx=Math.round(cx+(rnd(i,11)*2-1)*rx*0.6),sy=Math.round(cy+(rnd(i,12)*2-1)*ry*0.6);
        if(dx<4||dy<20||dx+fw>w.WW-4||dy+fh>w.WH-10||!r[5].includes(blobOf(dx,dy))||!allVoid(w,dx,dy,dx+fw,dy+fh))return false;
        if(!inEll(sx,sy,r)||!allLand(w,sx-2,sy-2,sx+fw+2,sy+fh+2)||nearTrail(w,sx,sy,sx+fw,sy+fh,9)||Math.hypot(dx-sx,dy-sy)>150)return false;frag(G,sx,sy,fw,fh,dx,dy);return true;});
      if(lv>0.25)tries(Math.round(lv*lv*A/4200),i=>{const s=8*(1+Math.floor(rnd(i,0)*2)),h=8*(1+Math.floor(rnd(i,13)*2)),x=Math.round((cx+(rnd(i,14)*2-1)*rx)/8)*8,y=Math.round((cy+(rnd(i,15)*2-1)*ry)/8)*8;
        if(!inEll(x,y,r)||!allLand(w,x-2,y-2,x+s+2,y+h+2)||nearTrail(w,x,y,x+s,y+h,10))return false;FLK.push([x,y,s,h,rnd(i,16)]);return true;});});w.rotFlicker=FLK.length;};
  /* drawn after every landmark: torn strips slid sideways and colour-inverted patches */
  K.P.w11_rotOver=function(){const w=W11(),G=g();ATR.length=0;
    ROT.forEach((r,ri)=>{const [cx,cy,rx,ry,lv]=r,A=Math.PI*rx*ry,rnd=(i,k)=>R(i,ri*16+k+300);
      tries(Math.round(Math.pow(lv,1.5)*A/5000),i=>{const sw=16+Math.round(rnd(i,1)*(30+70*lv)),sh=2+Math.round(rnd(i,2)*(3+5*lv));let dx=Math.round(3+rnd(i,3)*(4+10*lv));if(rnd(i,4)<0.5)dx=-dx;
        const x=Math.round(cx+(rnd(i,5)*2-1)*rx-sw/2),y=Math.round(cy+(rnd(i,6)*2-1)*ry);
        if(!inEll(x+sw/2,y,r)||!landRow(w,x+sw*0.2,x+sw*0.8,y)||nearTrail(w,Math.min(x,x+dx),y,Math.max(x+sw,x+sw+dx),y+sh,7))return false;tear(G,w,x,y,sw,sh,dx);return true;});
      tries(Math.round(lv*lv*A/11000),i=>{const pw=8+Math.round(rnd(i,7)*(10+18*lv)),ph=6+Math.round(rnd(i,8)*(5+10*lv));
        const x=Math.round(cx+(rnd(i,9)*2-1)*rx-pw/2),y=Math.round(cy+(rnd(i,10)*2-1)*ry-ph/2);
        if(!inEll(x+pw/2,y+ph/2,r)||!w.M(x+pw/2,y+ph/2)||nearTrail(w,x,y,x+pw,y+ph,7))return false;invert(G,w,x,y,pw,ph);return true;});
      if(lv>0.6)tries(Math.round((lv-0.45)*9),i=>{const sw=30+Math.round(rnd(i,11)*60),sh=3+Math.round(rnd(i,12)*6),dx=Math.round((rnd(i,13)<0.5?-1:1)*(4+rnd(i,14)*8));
        const x=Math.round(cx+(rnd(i,15)*2-1)*rx-sw/2),y=Math.round(cy+(rnd(i,0)*2-1)*ry);
        if(!inEll(x+sw/2,y,r)||!landRow(w,x-Math.abs(dx),x+sw+Math.abs(dx),y)||!landRow(w,x-Math.abs(dx),x+sw+Math.abs(dx),y+sh)||nearTrail(w,Math.min(x,x+dx),y,Math.max(x+sw,x+sw+dx),y+sh,8))return false;ATR.push([x,y,sw,sh,dx,rnd(i,1)]);return true;});});w.rotTears=ATR.length;};
  /* live flicker: tiles blink out to the void or flash a stuck colour, and strips near the end jump sideways */
  K.A.w11_rot=function(t){const w=W11();if(!w||!w.base)return;const G=g();
    for(const [x,y,s,h,ph] of FLK){const k=(Math.floor(t/120)+Math.floor(ph*97))%19;
      if(k<2)hole(x,y,s,h);else if(k===6)px(ROTC[Math.floor(ph*5)],x,y,s,h);else if(k===7)px('rgba(255,255,255,.55)',x,y,s,h);}
    for(const [x,y,sw,sh,dx,ph] of ATR){const k=(Math.floor(t/100)+Math.floor(ph*61))%29;
      if(k<3){const d=k===1?-Math.round(dx/2):dx;G.drawImage(w.base,x,y,sw,sh,x+d,y,sw,sh);px('rgba(0,255,208,.5)',x+d,y,sw,1);px('rgba(255,61,240,.5)',x+d,y+sh-1,sw,1);}}};

  /* ---------- the world ---------- */
  K.W.push({n:11,hud:'INSIDE THE CONSOLE',name:'Kinan and Glitchy',
    where:"Mom's fall at Niagara cracks the game open. Kinan drops inside the console, where the old worlds float as broken mini realms in the dark. He crosses them all, then Glitchy's own islands, to reach the core.",
    marks:'Made up: the Wrong-Way Portal; a Mini Brick Realm with a brick mountain to climb and a brick sea to cross; a Mini Starbase with twin suns, a hangar, starfighters, droids and a trench run; a Mini Dino Valley with a volcano and a brachiosaurus; chocolate cake islands joined by glowing glass bridges; the Firewall, Copy-Paste City, the Save File Vault, the Portal Machine and Glitchy\'s core. The further Kinan goes, the more the map itself breaks: missing tiles, pixel noise, torn strips, inverted colours and chunks floating off, worst around Glitchy\'s core.',
    size:[1100,780],mode:'islands',ground:'glitch',water:'void',cliff:'glitch',path:'neon',fx:'glitch',
    blobs:[
      [100,625,85],                                   /* Wrong-Way Portal */
      [230,440,150],[310,520,125],[170,520,105],       /* Mini Brick Realm */
      [210,170,150],[310,160,100],                     /* Mini Starbase */
      [540,150,140],[620,130,95],[470,170,80],         /* Mini Dino Valley */
      [770,120,80],[905,215,72],[1020,115,85],         /* chocolate cake islands */
      [1015,350,110],                                  /* the Firewall */
      [965,565,120],[1045,550,80],                     /* Copy-Paste City */
      [745,615,110],                                   /* Save File Vault */
      [690,718,55],                                    /* Shad's Dev Room */
      [525,605,100],                                   /* Portal Machine */
      [600,375,180]],                                  /* Glitchy's core */
    zones:[
      {k:'w11_brickMtn',e:[205,446,80,62]},{k:'w11_brickSea',e:[310,515,50,30]},{k:'baseplate',e:[250,480,200,170]},
      {k:'w11_trench',r:[128,196,212,14]},{k:'w11_hazard',e:[236,122,26,13]},{k:'w11_deck',e:[230,165,190,110]},
      {k:'fern',e:[545,150,170,110]},
      {k:'w11_choc',e:[770,120,70,60]},{k:'w11_choc',e:[905,215,60,52]},{k:'w11_choc',e:[1020,115,74,62]},
      {k:'w11_carpet',e:[690,718,50,40]},
      /* the late islands rot more and more on the way to the core */
      {k:'w11_rotA',e:[1015,350,118,96]},{k:'w11_rotB',e:[990,560,160,105]},{k:'w11_rotC',e:[745,612,118,96]},{k:'w11_rotD',e:[525,605,110,92]},{k:'w11_rotE',e:[600,380,186,146]}],
    J:{c1:[812,140],c2:[872,195],c3:[940,198],c4:[980,140]},
    stops:[
      {at:[128,628],name:'11-1  THE WRONG-WAY PORTAL',st:'open'},
      {at:[205,408],name:'11-2  MINI BRICK REALM  -  BRICK-REX',st:'lock'},
      {at:[330,150],name:'11-3  MINI STARBASE  -  THE DROID COMMANDER',st:'lock'},
      {at:[548,176],name:'11-4  MINI DINO VALLEY  -  THE ALPHA T-REX',st:'lock'},
      {at:[1010,130],name:'11-5  MINI CAKE MULTIVERSE  -  MIRROR KINAN',st:'lock'},
      {at:[1015,348],name:'FORT  THE FIREWALL',st:'fort'},
      {at:[975,560],name:'11-6  COPY-PASTE CITY',st:'lock'},
      {at:[745,632],name:'11-7  THE SAVE FILE VAULT',st:'lock'},
      {at:[692,712],name:"SECRET  SHAD'S DEV ROOM",st:'secret'},
      {at:[525,605],name:'11-8  THE PORTAL MACHINE',st:'lock'},
      {at:[600,440],name:"CASTLE  GLITCHY'S LAST STAND  -  GLITCHY",st:'boss'}],
    edges:[
      [0,1,[[178,628],[250,606],[298,582],[304,552],[301,482],[274,464],[242,436]]],
      [1,2,[[194,380],[196,350],[160,300],[132,250],[138,214],[172,204],[306,204],[336,182]]],
      [2,3,[[380,140],[432,142],[484,152],[520,168]]],
      [3,'c1',[[620,164],[684,150],[724,132],[770,132]]],
      ['c1','c2',[],{style:'glass'}],
      ['c2','c3',[[905,206]]],
      ['c3','c4',[],{style:'glass'}],
      ['c4',4],
      [4,5,[[1040,160],[1040,240],[1022,300]]],
      [5,6,[[1008,400],[996,470],[984,520]]],
      [6,7,[[910,590],[850,606],[800,614]]],
      [7,8],
      [7,9,[[680,622],[620,612],[580,606]]],
      [9,10,[[540,560],[568,498]]]],
    exit:[680,330],
    props:[
      ['w11_rotUnder',0,-5],['w11_rotOver',0,9000],
      ['w11_cliff',90,-9,400,330,610,'brick'],['w11_cliff',100,-9,390,80,268,'metal'],['w11_cliff',400,-9,700,60,250,'dino'],
      ['w11_cliff',700,-9,840,70,180,'choc'],['w11_cliff',845,-9,960,170,270,'choc'],['w11_cliff',955,-9,1090,60,175,'choc'],['w11_cliff',640,-9,740,680,778,'carpet'],
      /* Wrong-Way Portal */
      ['w11_wrongPortal',84,628],
      /* Brick realm */
      ['w11_brickRex',128,470],['w11_brickBridge',304,478,556],['w11_brickBoat',326,512],['w11_brickBoat',282,532],
      ['w11_brickHouse',310,456,'#e8364b'],['w11_brickHouse',340,470,'#2a5bd7'],['w11_brickHouse',150,520,'#f6c445'],['w11_brickHouse',190,560,'#44c55a'],['w11_brickHouse',350,570,'#e8364b'],
      ['w11_brickTree',118,430],['w11_brickTree',236,520],['w11_brickTree',250,540],['w11_brickTree',366,500],['w11_brickTree',280,410],['w11_brickTree',300,420],['w11_brickTree',170,370],
      ['bigBrick',220,580,24,10,'#f6c445'],['bigBrick',120,560,18,8,'#2a5bd7'],
      ['w11_lbl',304,488,'BRICK SEA'],['w11_lbl',214,494,'BRICK MOUNTAIN'],
      /* Starbase */
      ['w11_hangar',160,170],['w11_fighter',236,118,'#e8364b'],['w11_fighter',282,180,'#2a5bd7'],['w11_fighter',206,104,'#f6c445'],['w11_pad',236,122],
      ['w11_ctower',290,120],['w11_commander',356,160],['w11_droid',214,192,'#2a5bd7'],['w11_droid',258,192,'#e8364b'],['w11_droid',310,170,'#44c55a'],['w11_crates',120,196],['w11_crates',330,118],
      ['w11_turret',150,197],['w11_turret',220,197],['w11_turret',290,197],
      ['w11_lbl',230,212,'THE TRENCH'],
      /* Dino valley */
      ['w11_volcano',612,112],['w11_trex',572,196],['w11_nest',516,198],['w11_bones',440,138],['cycad',470,120],['cycad',650,190],['cycad',500,214],['cycad',430,186],['fern',600,210],['fern',460,160],
      /* Chocolate cake islands */
      ['w11_cupcake',760,120],['w11_candle',734,106,'#ff6fae'],['w11_candle',796,100,'#7ec8ff'],['w11_strawberry',744,150],['w11_cherry',800,156],
      ['w11_slice',890,236],['w11_candle',882,196,'#f6c445'],['w11_cherry',928,228],['w11_strawberry',870,222],
      ['w11_mirror',1052,104],['w11_candle',990,92,'#44c55a'],['w11_candle',1064,140,'#ff6fae'],['w11_strawberry',1000,150],['w11_cherry',1030,148],
      ['w11_lbl',905,262,'MINI CAKE MULTIVERSE'],
      /* Firewall */
      ['w11_firewall',1015,344,130,22],['cube',970,390],['cube',1060,392],
      /* Copy-Paste City */
      ['w11_copyBlock',908,560,'#5a6f9a'],['w11_copyBlock',1010,548,'#5a6f9a'],['w11_copyBlock',1046,590,'#7a5a9a'],['w11_copyBlock',930,610,'#7a5a9a'],['w11_cursor',1056,540],
      ['w11_stamp',950,500,'COPY','#2a5bd7'],['w11_stamp',1040,616,'PASTE','#e8364b'],['w11_lbl',975,624,'COPY-PASTE CITY'],
      /* Save File Vault + Dev Room */
      ['w11_vault',740,600],['w11_save',688,640,1,0],['w11_save',706,650,2,0],['w11_save',722,662,3,1],
      ['w11_devRoom',700,738],
      /* Portal Machine */
      ['w11_portalMachine',525,590],['wirePyramid',476,640],['cube',580,640],
      /* Glitchy's core */
      ['w11_core',612,388],['glitchArena',600,448],['wirePyramid',500,360],['wirePyramid',712,380],['upsideTree',520,430],['upsideTree',690,430],['cube',520,320],['cube',690,320],
      /* the void */
      ['w11_errorBox',300,700],['w11_errorBox',800,470],['planet',80,330,12,'#7ec8ff'],['planet',1060,700,16,'#ff6fae'],['planet',820,300,9,'#f6c445'],
      ['w11_bigPixel',420,280,'#00ffd0'],['w11_bigPixel',860,420,'#ff3df0'],['w11_bigPixel',390,720,'#f6c445'],['w11_bigPixel',1080,250,'#00ffd0']].filter(Boolean),
    scatter:[{k:'minibrick',n:60,zone:'baseplate'},{k:'fern',n:70,zone:'fern'},{k:'cycad',n:16,zone:'fern'},{k:'cube',n:5,zone:'glitch'},{k:'upsideTree',n:2,zone:'glitch'},{k:'w11_cherry',n:8,zone:'w11_choc'},
      {k:'cube',n:4,zone:'w11_rotA'},{k:'cube',n:4,zone:'w11_rotB'},{k:'cube',n:4,zone:'w11_rotC'},{k:'cube',n:4,zone:'w11_rotD'},{k:'cube',n:6,zone:'w11_rotE'},{k:'upsideTree',n:3,zone:'w11_rotC'},{k:'upsideTree',n:5,zone:'w11_rotE'}],
    anim:[
      ['w11_rot'],
      ['w11_suns',50,44],['w11_flyby',120,60,280],['w11_radar',290,72],['lasers',140,186,190],
      ['w11_lava',612,50],['smoke',612,40,1],['brachio',440,212],['w11_ptero',520,60],
      ['candle',734,88],['candle',796,82],['candle',882,178],['candle',990,74],['candle',1064,122],
      ['w11_flames',955,1075,316],
      ['w11_select',884,500,190,124],
      ['portal',84,604,14,'#00ffd0'],['portal',525,552,15,'#ff3df0'],
      ['w11_corePulse',612,330],['w11_glitchy',612,300],
      ['floatCube',420,40],['floatCube',700,30],['floatCube',870,330],['floatCube',40,250],['floatCube',420,690],['floatCube',1080,460],['floatCube',780,520],
      ['comet',380,10],['comet',700,600],
      ['blink',690,682],['blink',710,686]]});
})(KINAN);

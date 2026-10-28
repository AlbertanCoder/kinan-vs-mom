/* World 2: School (Kinan vs. the Bell) */
(function(K){
  const {px,box,shadow,txt,hash}=K; const g=()=>K.g();
  /* ---------- ground looks: blacktop, running track, soccer field ---------- */
  const TX=870,TY=300,TRX=125,TRY=68,TIX=106,TIY=50;
  K.GROUND.w02_blacktop=(X,Y)=>{if(X>560&&X<620&&Y>462&&Y<480&&(X===561||X===619||X===590||Y===463||Y===479||Y===471))return'#f4f1e8';return hash(X>>1,Y>>1)>.93?'#6b6f7a':'#5c606b';};
  K.GROUND.w02_track=(X,Y)=>{const e=Math.sqrt(((X-TX)/TRX)**2+((Y-TY)/TRY)**2);const s=Math.min(1/TRX,1/TRY)*0.8;return [0.9,0.95].some(k=>Math.abs(e-k)<s)?'#f4f1e8':'#c8603c';};
  K.GROUND.w02_field=(X,Y)=>{const L=TX-78,R=TX+78,T=TY-30,B=TY+30;
    if(X===L||X===R||Y===T||Y===B||X===TX)return'#ffffff';if(Math.abs(Math.hypot(X-TX,Y-TY)-12)<0.6)return'#ffffff';
    if((X===L+18||X===R-18)&&Y>TY-16&&Y<TY+16)return'#ffffff';if((Y===TY-16||Y===TY+16)&&(X<L+18||X>R-18))return'#ffffff';
    return ((X>>4)&1)?'#5cb73a':'#6cc644';};
  K.GROUND.w02_lot=(X,Y)=>(X%22===0&&Y%40<14)?'#f4f1e8':(hash(X>>1,Y>>1)>.94?'#7a7e88':'#8a8e98');
  ['w02_blacktop','w02_track','w02_field','w02_lot'].forEach(k=>{K.RIM[k]='#a8ec74';K.LINE[k]='#2e6423';});

  /* ---------- school wings ---------- */
  const sign=(X,Y,w,s,c)=>{const tw=s.length*4+6;box('#ffffff',X+w/2-tw/2,Y,tw,9);txt(s,X+w/2-tw/2+3,Y+1,c||'#1b1220',6,1);};
  const roofTop=(X,Y,w,c)=>{px('#1b1220',X-2,Y-6,w+4,7);px(c,X-1,Y-5,w+2,5);px('rgba(255,255,255,.35)',X-1,Y-5,w+2,1);};
  K.P.w02_hall=function(X,Y){const w=110,h=66;shadow(X+w/2,Y+3,w*0.6,5);box('#c8603c',X,Y-h,w,h);for(let r=0;r<h;r+=6)px('#b0502e',X,Y-h+r,w,1);roofTop(X,Y-h,w,'#6b6f7a');
    for(let i=0;i<4;i++){box('#cfeeff',X+8+i*26,Y-h+20,12,10);box('#cfeeff',X+8+i*26,Y-h+36,12,10);}
    box('#f4f1e8',X+38,Y-30,34,30);box('#3f63a8',X+42,Y-26,12,26);box('#3f63a8',X+56,Y-26,12,26);px('#cfeeff',X+44,Y-24,8,8);px('#cfeeff',X+58,Y-24,8,8);
    /* clock + big sign */
    box('#f4f1e8',X+48,Y-h-16,14,14);px('#1b1220',X+54,Y-h-13,1,5);px('#1b1220',X+54,Y-h-9,4,1);box('#1b1220',X+20,Y-h+5,70,11);txt('SCHOOL',X+36,Y-h+6,'#f6c445',8,1);};
  K.P.w02_science=function(X,Y){const w=82,h=52;shadow(X+w/2,Y+3,w*0.6,4);box('#e2d6bc',X,Y-h,w,h);roofTop(X,Y-h,w,'#6b6f7a');
    for(let i=0;i<4;i++){box('#cfeeff',X+6+i*19,Y-30,12,12);px(['#44c55a','#7a2fd0','#ff6fae','#00a8c0'][i],X+9+i*19,Y-24,6,6);px('#ffffff',X+11+i*19,Y-28,2,4);}
    box('#3f63a8',X+34,Y-14,12,14);sign(X,Y-h+4,w,'SCIENCE LAB','#2a5bd7');
    box('#9aa3b2',X+62,Y-h-14,8,10);};
  K.P.w02_library=function(X,Y){const w=82,h=52;shadow(X+w/2,Y+3,w*0.6,4);box('#a8692e',X,Y-h,w,h);for(let r=0;r<h;r+=6)px('#94582a',X,Y-h+r,w,1);roofTop(X,Y-h,w,'#6b6f7a');
    for(let i=0;i<3;i++){box('#f6ead2',X+6+i*26,Y-32,18,14);for(let k=0;k<6;k++)px(['#e8364b','#2a5bd7','#44c55a','#f6c445','#7a2fd0','#ff8a3d'][(k+i)%6],X+7+i*26+k*3,Y-30,2,12);}
    box('#3b2618',X+35,Y-14,12,14);sign(X,Y-h+4,w,'LIBRARY','#6b3f18');
    /* open book on the roof */px('#1b1220',X+26,Y-h-11,30,8);px('#ffffff',X+27,Y-h-10,13,6);px('#ffffff',X+42,Y-h-10,13,6);px('#9aa3b2',X+29,Y-h-8,9,1);px('#9aa3b2',X+44,Y-h-8,9,1);};
  K.P.w02_gym=function(X,Y){const w=148,h=58;shadow(X+w/2,Y+3,w*0.6,6);box('#d8d2c4',X,Y-h,w,h);px('#2a5bd7',X,Y-18,w,4);
    const G=g();G.fillStyle='#1b1220';G.beginPath();G.ellipse(X+w/2,Y-h,w/2+2,22,0,Math.PI,0);G.fill();G.fillStyle='#9aa3b2';G.beginPath();G.ellipse(X+w/2,Y-h,w/2,20,0,Math.PI,0);G.fill();
    for(let i=-64;i<=64;i+=10){const hh=Math.sqrt(Math.max(0,1-(i/74)**2))*20;px('#6f7889',X+w/2+i,Y-h-hh,1,hh);}px('rgba(255,255,255,.4)',X+20,Y-h-12,40,2);
    box('#cfeeff',X+8,Y-46,26,10);box('#cfeeff',X+w-34,Y-46,26,10);box('#e8364b',X+58,Y-30,32,30);px('#1b1220',X+74,Y-30,1,30);
    box('#1b1220',X+52,Y-h+4,44,13);txt('GYM',X+63,Y-h+5,'#f6c445',10,1);
    G.fillStyle='#1b1220';G.beginPath();G.arc(X+120,Y-26,7,0,Math.PI*2);G.fill();G.fillStyle='#ff8a3d';G.beginPath();G.arc(X+120,Y-26,6,0,Math.PI*2);G.fill();px('#1b1220',X+114,Y-26,12,1);px('#1b1220',X+120,Y-32,1,12);};
  K.P.w02_cafe=function(X,Y){const w=110,h=44;shadow(X+w/2,Y+2,w*0.5,3);box('#f6ead2',X,Y-h,w,h);roofTop(X,Y-h,w,'#44c55a');
    for(let i=0;i<5;i++){box('#cfeeff',X+6+i*21,Y-28,12,10);}for(let i=0;i<14;i++)px(i%2?'#e8364b':'#ffffff',X+4+i*7,Y-16,7,4);
    sign(X,Y-h+4,w,'CAFETERIA','#c8463e');box('#9aa3b2',X+86,Y-h-16,8,12);
    /* apple */px('#1b1220',X+10,Y-h-13,11,10);px('#e8364b',X+11,Y-h-12,9,8);px('#ff8a9a',X+12,Y-h-11,3,2);px('#44c55a',X+16,Y-h-16,4,3);};
  K.P.w02_complab=function(X,Y){const w=100,h=42;shadow(X+w/2,Y+2,w*0.5,3);box('#cfd6e2',X,Y-h,w,h);roofTop(X,Y-h,w,'#4a5160');
    for(let i=0;i<5;i++){box('#2b2f45',X+6+i*19,Y-28,14,12);px('#7ec8ff',X+8+i*19,Y-26,10,7);px('#ffffff',X+9+i*19,Y-25,4,1);}
    sign(X,Y-h+4,w,'COMPUTER LAB','#2b2f45');
    /* satellite dish */px('#1b1220',X+80,Y-h-14,2,9);const G=g();G.fillStyle='#1b1220';G.beginPath();G.ellipse(X+81,Y-h-16,9,5,-0.5,0,Math.PI*2);G.fill();G.fillStyle='#f4f1e8';G.beginPath();G.ellipse(X+81,Y-h-16,8,4,-0.5,0,Math.PI*2);G.fill();};
  K.P.w02_bell=function(X,Y){shadow(X,Y+3,26,5);const G=g();
    box('#b8463a',X-18,Y-112,36,112);for(let r=4;r<112;r+=6)px('#9a3a30',X-18,Y-112+r,36,1);for(let r=0;r<112;r+=12)px('#9a3a30',X-6+((r/12)%2)*12,Y-112+r,1,6);
    px('#f4f1e8',X-20,Y-114,40,4);px('#f4f1e8',X-20,Y-60,40,3);
    box('#3b2618',X-8,Y-22,16,22);G.fillStyle='#3b2618';G.beginPath();G.arc(X,Y-22,8,Math.PI,0);G.fill();px('#f6c445',X+4,Y-12,2,2);
    G.fillStyle='#1b1220';G.beginPath();G.arc(X,Y-86,11,0,Math.PI*2);G.fill();G.fillStyle='#f4f1e8';G.beginPath();G.arc(X,Y-86,10,0,Math.PI*2);G.fill();px('#1b1220',X,Y-93,1,7);px('#1b1220',X,Y-86,5,1);
    /* belfry */box('#f4f1e8',X-20,Y-142,40,28);px('#1b1220',X-14,Y-138,28,22);G.fillStyle='#1b1220';G.beginPath();G.arc(X,Y-138,14,Math.PI,0);G.fill();
    G.fillStyle='#1b1220';G.beginPath();G.moveTo(X-25,Y-141);G.lineTo(X,Y-178);G.lineTo(X+25,Y-141);G.fill();G.fillStyle='#3f63a8';G.beginPath();G.moveTo(X-22,Y-142);G.lineTo(X,Y-175);G.lineTo(X+22,Y-142);G.fill();
    px('#7ea0e8',X-2,Y-170,3,24);K.P.label(X,Y-220,"PRINCIPAL'S BELL TOWER");};
  K.P.w02_bus=function(X,Y,flip){shadow(X+30,Y+2,32,4);box('#f6c445',X,Y-16,58,15);px('#ffe58a',X,Y-16,58,2);px('#1b1220',X,Y-6,58,1);
    for(let i=0;i<7;i++)box('#cfeeff',X+(flip?10:3)+i*7,Y-13,5,4);const hx=flip?X-7:X+58;box('#f6c445',hx,Y-10,7,9);px('#e8364b',flip?X+56:X-3,Y-12,3,3);
    px('#1b1220',X+6,Y-1,8,4);px('#1b1220',X+42,Y-1,8,4);txt('SCHOOL BUS',X+10,Y-5,'#1b1220',5,1);};
  K.P.w02_bussign=function(X,Y){px('#1b1220',X,Y-22,2,22);box('#2a5bd7',X-6,Y-30,14,10);txt('BUS',X-4,Y-29,'#ffffff',6,1);box('#ffffff',X-5,Y-19,12,3);};
  K.P.w02_goal=function(X,Y,d){/* d=1 opens to the right */box('#ffffff',X-(d>0?0:6),Y-10,6,20);for(let i=0;i<20;i+=3)px('#c9cfe6',X-(d>0?0:6)+1,Y-10+i,4,1);px('#ffffff',X-(d>0?0:6),Y-10,8*d,1);};
  K.P.w02_firetruck=function(X,Y){shadow(X+18,Y+2,20,3);box('#e8364b',X,Y-12,34,11);box('#e8364b',X+26,Y-17,10,16);box('#cfeeff',X+29,Y-15,5,4);for(let i=0;i<26;i+=4)px('#ffffff',X+2+i,Y-16,2,1);px('#ffffff',X+2,Y-15,24,1);px('#ffffff',X+2,Y-17,24,1);
    px('#7ec8ff',X+30,Y-20,4,3);px('#1b1220',X+4,Y-1,6,3);px('#1b1220',X+24,Y-1,6,3);px('#f6c445',X+2,Y-7,30,1);};
  K.P.w02_cone=function(X,Y){px('#1b1220',X-4,Y-1,9,2);px('#ff8a3d',X-3,Y-2,7,1);px('#ff8a3d',X-2,Y-6,5,4);px('#ffffff',X-2,Y-5,5,1);px('#ff8a3d',X-1,Y-9,3,3);};
  K.P.w02_hydrant=function(X,Y){box('#e8364b',X,Y-8,6,8);px('#e8364b',X-2,Y-6,10,2);px('#f6c445',X+1,Y-10,4,2);};
  K.P.w02_lostfound=function(X,Y){shadow(X+18,Y+2,22,4);box('#a8692e',X,Y-22,36,22);for(let r=0;r<22;r+=5)px('#8a5426',X,Y-22+r,36,1);px('#1b1220',X-3,Y-30,42,9);px('#6f4a26',X-2,Y-29,40,7);
    box('#ffffff',X+1,Y-20,34,9);txt('LOST+FOUND',X+2,Y-19,'#1b1220',5,1);box('#3b2618',X+13,Y-10,10,10);
    /* spilling box */box('#c99a5c',X+40,Y-10,16,10);px('#e8364b',X+42,Y-14,6,4);px('#2a5bd7',X+50,Y-13,3,6);px('#ffffff',X+46,Y-15,4,4);px('#1b1220',X+47,Y-14,2,2);px('#44c55a',X+56,Y-3,6,3);};
  K.P.w02_monkeybars=function(X,Y){shadow(X+24,Y+2,28,3);[0,46].forEach(a=>{px('#1b1220',X+a,Y-26,3,26);px('#1b1220',X+a+8,Y-22,3,22);});for(let i=0;i<=46;i+=6){px('#1b1220',X+i,Y-28,3,4);px('#e8364b',X+i+1,Y-27,1,2);}px('#e8364b',X,Y-27,49,1);px('#e8364b',X+8,Y-23,49,1);};
  K.P.w02_swings=function(X,Y){shadow(X+24,Y+2,30,3);[[0,1],[52,-1]].forEach(([a,d])=>{for(let i=0;i<28;i++){px('#1b1220',X+a+Math.round(i*0.25)*d-1,Y-i,3,1);px('#2a5bd7',X+a+Math.round(i*0.25)*d,Y-i,1,1);}});box('#2a5bd7',X+5,Y-30,44,3);
    [[14,'#e8364b'],[32,'#f6c445']].forEach(([a,c])=>{px('#6b6f7a',X+a,Y-27,1,18);px('#6b6f7a',X+a+7,Y-27,1,18);box(c,X+a,Y-9,8,3);});};
  K.P.w02_slide=function(X,Y){shadow(X+24,Y+3,30,4);box('#2a5bd7',X,Y-40,4,40);box('#2a5bd7',X+20,Y-40,4,40);box('#f6c445',X-2,Y-42,28,6);px('#1b1220',X-4,Y-56,32,15);px('#44c55a',X-3,Y-55,30,13);px('#8fe09a',X-3,Y-55,30,3);
    for(let i=0;i<8;i++)px('#e8364b',X+5,Y-36+i*5,14,2);const G=g();G.strokeStyle='#1b1220';G.lineWidth=8;G.beginPath();G.moveTo(X+24,Y-38);G.quadraticCurveTo(X+44,Y-30,X+50,Y-2);G.stroke();G.strokeStyle='#f6c445';G.lineWidth=6;G.beginPath();G.moveTo(X+24,Y-38);G.quadraticCurveTo(X+44,Y-30,X+50,Y-2);G.stroke();
    G.strokeStyle='#ffe58a';G.lineWidth=1;G.beginPath();G.moveTo(X+25,Y-39);G.quadraticCurveTo(X+44,Y-32,X+49,Y-4);G.stroke();};
  K.P.w02_car=function(X,Y,c){shadow(X+10,Y+1,12,3);box(c,X,Y-8,20,8);box('#cfeeff',X+4,Y-12,12,4);px('#1b1220',X+2,Y,4,2);px('#1b1220',X+14,Y,4,2);};
  K.P.w02_pickup=function(X,Y,c){c=c||'#2a5bd7';shadow(X+22,Y+2,24,4);box(c,X,Y-12,26,10);box(c,X+26,Y-18,16,16);box('#cfeeff',X+30,Y-16,10,6);px('#1b1220',X+4,Y-1,8,4);px('#1b1220',X+30,Y-1,8,4);px('#9aa3b2',X,Y-13,26,2);box('#9aa3b2',X+42,Y-8,3,4);px('#f6c445',X+42,Y-12,2,2);};
  K.P.w02_lbl=function(X,Y,s){K.P.label(X,Y,s);};
  K.P.w02_schoolsign=function(X,Y){px('#1b1220',X+4,Y-8,2,8);px('#1b1220',X+40,Y-8,2,8);box('#2f7d32',X,Y-24,46,16);txt('SCHOOL',X+6,Y-22,'#ffffff',8,1);txt('ZONE 30',X+8,Y-14,'#f6c445',6,1);};

  /* bus loop: an oval road in front of the school */
  const LX=165,LY=470,LRX=58,LRY=34,loop=[];for(let i=0;i<=36;i++){const a=i/36*Math.PI*2;loop.push([Math.round((LX+Math.cos(a)*LRX)*10)/10,Math.round((LY+Math.sin(a)*LRY)*10)/10]);}
  const arc=(a0,a1,n)=>{const o=[];for(let i=1;i<n;i++){const a=a0+(a1-a0)*i/n;o.push([LX+Math.cos(a)*LRX,LY+Math.sin(a)*LRY]);}return o;};
  /* the bus stop is on the east side of the loop, at the school doors; Tower Lane runs north from it past the bell tower */
  const busAt=[LX+LRX,LY];

  K.W.push({ n:2, hud:'SCHOOL', name:'Kinan vs. the Bell',
    where:'A school day in Saskatoon. Kinan gets off the bus and races the bell around the whole school, from the hallway to the gym, out to the soccer field and up the Principal\'s bell tower.',
    marks:'The bus loop and its yellow buses, the school with its hallway, science lab, library, gym, cafeteria and computer lab, the soccer field and running track, the playground (monkey bars, swings, the big slide), the lost and found shed and the bell tower.',
    size:[1100,680], ground:'grass', water:'blue', cliff:'dirt', path:'tan',
    zones:[
      {k:'w02_field',r:[TX-78,TY-30,157,61]},
      {k:'w02_track',f:(X,Y)=>((X-TX)/TRX)**2+((Y-TY)/TRY)**2<1&&((X-TX)/TIX)**2+((Y-TY)/TIY)**2>=1},
      {k:'w02_blacktop',r:[236,424,480,56]},
      {k:'w02_lot',r:[820,420,190,140]},{k:'w02_lot',r:[8,548,152,44]},
      {k:'sand',e:[340,228,98,58]}],
    roads:[
      [[-10,615],[1110,615]],           /* school street */
      [[-10,70],[1110,70]],             /* back street */
      [[1060,70],[1060,615]],           /* side street */
      loop,                             /* bus loop */
      [[LX,LY+LRY],[LX,615]],           /* bus loop driveway */
      [[915,560],[915,615]],            /* parking lot driveway */
      [[-10,LY],[LX-LRX,LY]],           /* the road in from World 1: the buses come in this way */
      [[LX+LRX,LY],[LX+LRX,-10]]],      /* Tower Lane: bus stop, bell tower, out to the highway (World 3) */
    stops:[
      {at:busAt,     name:'2-1  THE BUS STOP', st:'open'},
      {at:[305,446], name:'2-2  HALLWAY RUSH', st:'lock'},
      {at:[411,446], name:'2-3  THE SCIENCE LAB', st:'lock'},
      {at:[501,446], name:'2-4  THE LIBRARY STACKS', st:'lock'},
      {at:[668,452], name:'2-5  THE GYM', st:'lock'},
      {at:[812,326], name:"FORT  THE GOALIE'S NET", st:'fort'},
      {at:[640,300], name:'2-6  THE CAFETERIA', st:'lock'},
      {at:[490,312], name:'2-7  THE COMPUTER LAB', st:'lock'},
      {at:[484,226], name:'SECRET  LOST AND FOUND', st:'secret'},
      {at:[340,262], name:'2-8  THE PLAYGROUND', st:'lock'},
      {at:[LX+LRX,342], name:"CASTLE  THE PRINCIPAL'S BELL TOWER  -  THE PRINCIPAL", st:'boss'}],
    edges:[
      [0,1,[[262,462]]],
      [1,2,[[358,452]]],[2,3,[[456,452]]],[3,4,[[585,458]]],
      [4,5,[[730,458],[770,420],[790,355]]],
      [5,6,[[770,318],[722,298]]],
      [6,7,[[565,298]]],
      [7,8,[[488,270]]],
      [7,9,[[420,300]]],
      [9,10,[[280,300],[248,328],[234,340]]]],
    /* walking in from World 1 on the bus road, round the top of the loop to the bus stop */
    entryPath:{from:[0,LY],via:[[60,LY],[LX-LRX,LY],...arc(Math.PI,Math.PI*2,12)],road:1},
    /* after the boss, Robin's red pickup takes Kinan up Tower Lane and north to Onion Lake (World 3) */
    exitPath:{to:[LX+LRX,0],via:[[LX+LRX,70]],road:1,ride:'truck'},
    exit:[LX+LRX,24],
    props:[
      ['w02_hall',250,420],['w02_science',370,420],['w02_library',460,420],['w02_gym',552,428],
      ['w02_cafe',585,354],['w02_complab',440,368],
      ['w02_bell',190,338],
      ['w02_bus',108,488],['w02_bus',150,522,1],['w02_bus',24,582],['w02_bus',90,582],['w02_bussign',238,506],['w02_schoolsign',200,600],
      ['sign',8,452,'WELCOME TO','SCHOOL'],['w02_pickup',160,368,'#c2414f'],['sign',236,56,'ONION LAKE','TO WORLD 3'],
      ['w02_firetruck',690,486],['w02_cone',640,476],['w02_cone',656,478],['w02_cone',704,470],['w02_cone',724,472],['w02_hydrant',620,476],
      ['w02_goal',TX-78,TY,1],['w02_goal',TX+78,TY,-1],['w02_lbl',TX,TY+70,'SOCCER FIELD'],
      ['w02_lostfound',466,212],
      ['w02_monkeybars',250,226],['w02_swings',320,206],['w02_slide',384,250],['w02_lbl',340,150,'PLAYGROUND'],
      ['w02_car',836,450,'#e8364b'],['w02_car',880,450,'#2a5bd7'],['w02_car',946,450,'#f4f1e8'],['w02_car',858,500,'#44c55a'],['w02_car',968,500,'#f6c445'],
      ...K.homes([[20,60,'#e8364b'],[80,60,'#2a5bd7'],[134,60,'#44c55a'],[186,60,'#8a5426'],[296,60,'#e8364b'],[340,60,'#2a5bd7'],[380,60,'#44c55a'],[440,60,'#e8364b'],[500,60,'#8a5426'],
        [560,60,'#2a5bd7'],[620,60,'#44c55a'],[680,60,'#e8364b'],[740,60,'#2a5bd7'],[800,60,'#8a5426'],[860,60,'#44c55a'],[920,60,'#e8364b'],[980,60,'#2a5bd7'],
        [20,665,'#2a5bd7'],[80,665,'#e8364b'],[240,665,'#44c55a'],[300,665,'#8a5426'],[360,665,'#2a5bd7'],[420,665,'#e8364b'],[480,665,'#44c55a'],[540,665,'#2a5bd7'],
        [600,665,'#8a5426'],[660,665,'#e8364b'],[720,665,'#44c55a'],[780,665,'#2a5bd7'],[840,665,'#e8364b'],[900,665,'#8a5426'],
        [1072,130,'#e8364b'],[1072,200,'#2a5bd7'],[1072,270,'#44c55a'],[1072,340,'#8a5426'],[1072,410,'#e8364b'],[1072,480,'#2a5bd7'],[1072,550,'#44c55a']])],
    scatter:[{k:'tree',n:70,zone:'grass'},{k:'bush',n:16,zone:'grass'}],
    anim:[['canflag',236,404],['w02_bellswing',190,-128],['steam',675,292],['steam',436,352]] });

  K.A.w02_bellswing=function(t,X,dy){/* dy is relative to the tower base (338) */const Y=338+dy;const a=Math.sin(t/260)*0.5;const G=g();G.save();G.translate(X,Y-8);G.rotate(a);
    G.fillStyle='#1b1220';G.beginPath();G.moveTo(-8,10);G.quadraticCurveTo(-7,-2,0,-3);G.quadraticCurveTo(7,-2,8,10);G.closePath();G.fill();
    G.fillStyle='#f6c445';G.beginPath();G.moveTo(-7,9);G.quadraticCurveTo(-6,-1,0,-2);G.quadraticCurveTo(6,-1,7,9);G.closePath();G.fill();G.fillStyle='#ffe58a';G.fillRect(-4,0,2,7);G.fillStyle='#8a6420';G.fillRect(-1,9,3,3);G.restore();};
})(KINAN);

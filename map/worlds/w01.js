/* World 1: Saskatoon Home (Kinan vs. Mom) */
(function(K){
  const {px,box,shadow,txt,hash}=K; const g=()=>K.g();
  /* ---------- floor looks for the roofless house ---------- */
  K.GROUND.w01_carpet=(X,Y)=>hash(X>>1,Y>>1)>.92?'#9cc0f0':'#b4d0f6';
  K.GROUND.w01_wood=(X,Y)=>(Y%8===0||(X+((Y>>3)%3)*11)%26===0)?'#a8703a':(hash(X>>2,Y)>.9?'#d8a060':'#c88e50');
  K.GROUND.w01_tile=(X,Y)=>((X>>3)+(Y>>3))&1?'#f4f1e8':'#9ad0e8';
  K.GROUND.w01_rug=(X,Y)=>((X>>2)+(Y>>2))%3===0?'#f6c445':'#e8364b';
  K.GROUND.w01_rug2=(X,Y)=>(Math.abs((X%12)-6)+Math.abs((Y%12)-6))<4?'#ffd1e6':'#9b2d6b';
  K.GROUND.w01_lawn=(X,Y)=>((X>>3)&1)?'#78d04e':'#6cc644';
  ['w01_carpet','w01_wood','w01_tile','w01_rug','w01_rug2','w01_lawn'].forEach(k=>{K.RIM[k]='#a8ec74';K.LINE[k]='#2e6423';});

  /* ---------- Kinan's house: roof lifted off, so you see every room ---------- */
  K.P.w01_house=function(X,Y){ /* X,Y = bottom-left corner; house is 210 x 170 */
    const T=Y-170,L=X,R=X+210,MX=X+105,MY=T+85;
    const hw=(x1,x2,y)=>{px('#1b1220',x1-1,y-4,x2-x1+2,10);px('#fff4dc',x1,y-3,x2-x1,3);px('#d9c39a',x1,y,x2-x1,5);};
    const vw=(x,y1,y2)=>{px('#1b1220',x-3,y1-4,7,y2-y1+10);px('#fff4dc',x-2,y1-3,5,y2-y1+3);px('#d9c39a',x-2,y2,5,5);};
    vw(L,T,Y);vw(R,T,Y);vw(MX,T,T+25);vw(MX,T+58,MY+27);vw(MX,MY+59,Y);
    hw(L,R,T);hw(L,MX+37,MY);hw(MX+71,R,MY);hw(L,X+40,Y);hw(X+72,R,Y);
    /* windows */
    [[L+16,T],[L+60,T],[MX+20,T],[MX+64,T],[MX+40,Y],[L+12,Y]].forEach(([a,b])=>{px('#7ec8ff',a,b+1,18,3);px('#cfeeff',a,b+1,18,1);});
    /* front door frame + mat */
    px('#8a5426',X+40,Y-4,3,10);px('#8a5426',X+70,Y-4,3,10);px('#e8364b',X+46,Y+6,22,4);
    K.P.label(X+105,T-26,"KINAN'S HOUSE");};
  K.P.w01_bed=function(X,Y){box('#8a5426',X,Y-26,22,26);box('#2a5bd7',X+1,Y-18,20,17);px('#5a85f0',X+1,Y-18,20,2);box('#ffffff',X+4,Y-24,14,5);px('#f6c445',X+6,Y-12,4,4);};
  K.P.w01_toybox=function(X,Y){box('#e8364b',X,Y-8,14,8);px('#ff8a9a',X,Y-8,14,2);box('#f6c445',X+3,Y-12,4,4);box('#44c55a',X+8,Y-11,4,3);};
  K.P.w01_desk=function(X,Y){box('#a8692e',X,Y-10,20,10);box('#2b2f45',X+5,Y-18,10,7);px('#7ec8ff',X+6,Y-17,8,5);};
  K.P.w01_couch=function(X,Y){box('#44c55a',X,Y-12,40,12);box('#2f8a3a',X,Y-16,40,6);box('#44c55a',X-3,Y-12,5,12);box('#44c55a',X+38,Y-12,5,12);px('#8fe09a',X+4,Y-10,14,3);px('#8fe09a',X+22,Y-10,14,3);};
  K.P.w01_tv=function(X,Y){box('#6b3f18',X,Y-6,26,6);box('#1b1220',X+2,Y-22,22,15);px('#7ec8ff',X+3,Y-21,20,13);px('#f6c445',X+6,Y-17,6,6);px('#e8364b',X+14,Y-15,6,4);};
  K.P.w01_fridge=function(X,Y){box('#eef2fa',X,Y-24,14,24);px('#c9cfe6',X,Y-15,14,1);px('#9aa3b2',X+11,Y-21,1,4);px('#9aa3b2',X+11,Y-11,1,6);px('#ff6fae',X+3,Y-20,3,3);};
  K.P.w01_counter=function(X,Y,w){box('#c9c4b8',X,Y-10,w,10);px('#eeeae0',X,Y-10,w,3);box('#2b2f45',X+4,Y-9,10,4);px('#e8364b',X+6,Y-9,2,1);px('#e8364b',X+10,Y-9,2,1);};
  K.P.w01_cakeTable=function(X,Y){shadow(X+14,Y+1,16,3);box('#a8692e',X,Y-12,28,8);px('#1b1220',X+2,Y-4,2,4);px('#1b1220',X+24,Y-4,2,4);box('#ffd6e6',X+8,Y-20,12,8);px('#ff6fae',X+8,Y-20,12,2);};
  K.P.w01_stairs=function(X,Y){for(let i=0;i<5;i++){box(i%2?'#b8894e':'#c99a5c',X,Y-30+i*6,20,5);}};
  K.P.w01_bricktown=function(X,Y){const B=K.P.bigBrick;B(X,Y,10,14,'#e8364b');B(X+12,Y,12,22,'#2a5bd7');B(X+26,Y,10,10,'#f6c445');B(X+12,Y-22,8,8,'#ffffff');};
  K.P.w01_brickcar=function(X,Y){box('#e8364b',X,Y-6,14,5);box('#cfeeff',X+3,Y-9,6,3);px('#1b1220',X+2,Y-1,3,2);px('#1b1220',X+9,Y-1,3,2);};
  K.P.w01_bike=function(X,Y){g().strokeStyle='#1b1220';g().lineWidth=1.5;[X,X+12].forEach(a=>{g().beginPath();g().arc(a,Y-4,4,0,Math.PI*2);g().stroke();});px('#e8364b',X,Y-8,12,2);px('#e8364b',X+5,Y-12,2,5);px('#1b1220',X+10,Y-13,4,2);};
  K.P.w01_bdaysign=function(X,Y){px('#8a5426',X+3,Y-12,2,12);px('#8a5426',X+31,Y-12,2,12);box('#ffffff',X,Y-24,36,14);txt('HAPPY',X+3,Y-23,'#e8364b',6,1);txt('BDAY!',X+3,Y-17,'#2a5bd7',6,1);px('#f6c445',X+28,Y-22,5,5);};
  K.P.w01_vfence=function(X,Y1,Y2,a,b){for(let y=Y1;y<Y2;y+=4){if(y>a&&y<b)continue;px('#1b1220',X-1,y-1,4,4);px('#ffffff',X,y,2,2);}px('#ffffff',X+2,Y1,1,a-Y1);px('#ffffff',X+2,b,1,Y2-b);};
  K.P.w01_neighbour=function(X,Y){shadow(X+38,Y+2,42,5);box('#d8c8a0',X,Y-36,76,36);px('#1b1220',X-5,Y-52,86,17);px('#6b6f7a',X-4,Y-51,84,15);px('#9aa3b2',X-4,Y-51,84,3);
    box('#7ec8ff',X+8,Y-28,12,10);box('#7ec8ff',X+54,Y-28,12,10);box('#3b2618',X+32,Y-20,10,20);
    /* the nosy neighbour peeking with binoculars */
    px('#d9a27a',X+56,Y-26,8,6);px('#9aa3b2',X+55,Y-24,10,3);px('#1b1220',X+56,Y-24,3,2);px('#1b1220',X+61,Y-24,3,2);px('#f4f1e8',X+55,Y-28,10,2);
    /* gnome + hedge + sign */
    box('#2f8a3a',X-6,Y+6,30,6);box('#2f8a3a',X+50,Y+6,30,6);px('#e8364b',X+28,Y+2,4,4);px('#d9a27a',X+28,Y+6,4,2);px('#2a5bd7',X+28,Y+8,4,4);
    box('#ffffff',X+82,Y-6,30,12);px('#8a5426',X+96,Y+6,2,8);txt('KEEP',X+84,Y-5,'#e8364b',5,1);txt('OFF!',X+84,Y,'#e8364b',5,1);
    K.P.label(X+38,Y-70,'NOSY NEIGHBOUR');};
  K.P.w01_theatre=function(X,Y){shadow(X+22,Y+2,26,4);box('#c8603c',X,Y-34,44,34);box('#f4f1e8',X+4,Y-30,36,10);txt('BROADWAY',X+5,Y-29,'#e8364b',6,1);
    for(let i=0;i<9;i++)px(i%2?'#f6c445':'#fff3c4',X+4+i*4,Y-32,2,1);box('#1b1220',X+2,Y-20,40,3);box('#3b2618',X+16,Y-14,12,14);box('#f6c445',X+20,Y-46,4,12);};
  K.P.w01_kinsmen=function(X,Y){/* carousel + little train loop */shadow(X,Y+2,18,4);box('#ffffff',X-14,Y-10,28,10);for(let i=0;i<7;i++)px(i%2?'#e8364b':'#f6c445',X-14+i*4,Y-10,4,10);
    g().fillStyle='#1b1220';g().beginPath();g().moveTo(X-17,Y-10);g().lineTo(X,Y-22);g().lineTo(X+17,Y-10);g().fill();g().fillStyle='#e8364b';g().beginPath();g().moveTo(X-15,Y-11);g().lineTo(X,Y-21);g().lineTo(X+15,Y-11);g().fill();
    K.P.label(X-50,Y-34,'KINSMEN PARK');};
  K.P.w01_lbl=function(X,Y,s){K.P.label(X,Y,s);};
  K.P.w01_bigbess=function(X,Y){const G=g();const tri=(x1,x2,yb,yt,c)=>{G.fillStyle='#1b1220';G.beginPath();G.moveTo(x1-1,yb+1);G.lineTo((x1+x2)/2,yt-1);G.lineTo(x2+1,yb+1);G.fill();G.fillStyle=c;G.beginPath();G.moveTo(x1+1,yb);G.lineTo((x1+x2)/2,yt+1);G.lineTo(x2-1,yb);G.fill();};
    shadow(X,Y+3,56,7);const C='#efe0bc',CR='#3fa88a',HI='#8ce0c4';
    box(C,X-50,Y-46,100,46);px('#d4c29a',X-50,Y-16,100,2);for(let r=0;r<3;r++)for(let i=0;i<11;i++)box('#5a6fa0',X-45+i*9,Y-41+r*10,3,5);
    /* steep green copper roof with dormers */
    px('#1b1220',X-52,Y-62,104,17);px(CR,X-51,Y-61,102,15);px(HI,X-51,Y-61,102,3);for(let i=0;i<6;i++){box(C,X-44+i*16,Y-58,6,7);tri(X-45+i*16,X-37+i*16,Y-58,Y-64,CR);}
    /* corner towers */
    [-58,40].forEach(a=>{box(C,X+a,Y-70,18,70);for(let r=0;r<5;r++)box('#5a6fa0',X+a+7,Y-64+r*12,4,6);tri(X+a-2,X+a+20,Y-70,Y-98,CR);px(HI,X+a+8,Y-92,2,14);px('#1b1220',X+a+8,Y-106,1,9);});
    /* central tower */
    box(C,X-16,Y-84,32,84);for(let r=0;r<6;r++){box('#5a6fa0',X-10,Y-78+r*11,4,6);box('#5a6fa0',X+6,Y-78+r*11,4,6);}
    tri(X-19,X+19,Y-84,Y-118,CR);px(HI,X-2,Y-112,4,22);[-16,12].forEach(a=>{box(C,X+a,Y-96,5,14);tri(X+a-2,X+a+7,Y-96,Y-106,CR);});
    box('#8a5426',X-7,Y-16,14,16);px('#f6c445',X-5,Y-14,10,3);
    for(let i=-44;i<=44;i+=11){px('#2f8a3a',X+i-3,Y+5,7,4);px('#ff6fae',X+i-1,Y+6,2,2);}
    K.P.label(X,Y-168,'THE BESSBOROUGH');};
  K.P.w01_remai=function(X,Y){shadow(X+34,Y+3,42,5);[[0,0,62,'#5a4038'],[10,-11,64,'#6e4e40'],[-6,-22,60,'#5a4038'],[8,-33,56,'#6e4e40']].forEach(([a,b,w,c])=>{box(c,X+a,Y+b-10,w,10);for(let i=2;i<w-2;i+=3)px('rgba(232,184,96,.45)',X+a+i,Y+b-9,1,8);px('#e8b860',X+a,Y+b-3,w,2);px('rgba(255,255,255,.18)',X+a,Y+b-10,w,1);});
    box('#cfeeff',X+24,Y-8,12,8);K.P.label(X+34,Y-64,'REMAI MODERN');};

  K.W.push({ n:1, hud:'SASKATOON', name:'Kinan vs. Mom',
    where:'His birthday, at home in Saskatoon. He wakes up in his bedroom, sneaks through the house, past the nosy neighbour, downtown and across the river before bedtime at the Bessborough.',
    marks:"Kinan's house (roof off), the nosy neighbour's yard, downtown, River Landing and the Remai Modern, the weir and its pelicans, the Traffic Bridge, the Broadway Bridge, Broadway Avenue, the Bessborough, Kinsmen Park's Ferris wheel and the University of Saskatchewan.",
    size:[1100,680], ground:'grass', water:'blue', cliff:'dirt', path:'tan',
    rivers:[{pts:[[-20,600],[150,578],[320,548],[470,508],[620,490],[760,492],[880,472],[990,392],[1120,325]],w:24}],
    zones:[
      {k:'w01_rug',e:[92,122,20,9]},{k:'w01_rug2',e:[198,124,26,11]},
      {k:'w01_carpet',r:[40,70,105,85]},{k:'w01_wood',r:[145,70,105,85]},{k:'w01_tile',r:[145,155,105,85]},{k:'baseplate',r:[40,155,105,85]},
      {k:'w01_lawn',r:[30,248,300,82]},
      {k:'paved',e:[510,238,128,98]},
      {k:'forest',f:(X,Y,w)=>w.rd(X,Y)<34}],
    roads:[
      [[-10,30],[390,30]],                        /* back lane */
      [[-10,345],[390,345]],                      /* Kinan's street */
      [[390,345],[390,-10]],                      /* a city road */
      [[390,100],[925,100],[945,106],[957,120],[960,140],[960,545],[972,556],[990,560],[1110,560]], /* a city road over the University Bridge */
      [[640,100],[640,690]],                      /* Victoria Ave over the Traffic Bridge */
      [[760,-10],[760,690]]],                     /* 4th Ave, Broadway Bridge, Broadway Ave */
    bridges:[[640,490,'traffic'],[760,492,'arches'],[960,414,'arches']],
    J:{W1:[300,345],W2:[390,345],T1:[640,456],T2:[640,536],B:[760,446]},
    stops:[
      {at:[92,112], name:"1-1  KINAN'S BEDROOM", st:'open'},
      {at:[198,112],name:'1-2  THE LIVING ROOM', st:'lock'},
      {at:[198,198],name:'1-3  THE KITCHEN', st:'lock'},
      {at:[92,198], name:'1-4  BRICK CITY (BASEMENT)', st:'lock'},
      {at:[96,290], name:'1-5  THE FRONT YARD', st:'lock'},
      {at:[290,292],name:'FORT  FENCE-LINE FEUD', st:'fort'},
      {at:[470,298],name:'1-6  BUNNY PHOTO STUDIO', st:'lock'},
      {at:[545,458],name:"1-7  CHENOA'S ART ROOM  -  REMAI MODERN", st:'lock'},
      {at:[452,478],name:'SECRET  THE WEIR AND THE PELICANS', st:'secret'},
      {at:[760,576],name:'1-8  BROADWAY AVENUE DINNER', st:'lock'},
      {at:[826,446],name:'CASTLE  BEDTIME CASTLE  -  THE BESSBOROUGH  -  MOM', st:'boss'}],
    edges:[
      [0,1,[[145,112]]],[1,2,[[199,155]]],[2,3,[[145,198]]],[3,4,[[94,240]]],
      [4,5,[[150,286],[196,289],[245,292]]],
      [5,'W1',[[296,320]]],['W1','W2',[],{road:1}],
      ['W2',6,[[420,342],[448,320]]],
      [6,7,[[492,350],[520,410]]],
      [7,8,[[500,470]]],
      [7,'T1',[[590,458]]],['T1','T2',[],{road:1}],
      ['T2',9,[[680,540],[715,566]]],
      [9,'B',[],{road:1}],['B',10,[[792,447]]]],
    /* the morning after: out along the riverbank, over the University Bridge and east to school (World 2) */
    exitPath:{to:[1100,560],via:[[868,441],[902,420],[930,394],[948,380],[960,376],[960,545],[972,556],[990,560]]},
    exit:[1080,560],
    props:[
      ['w01_house',40,240],
      ['w01_bed',48,104],['w01_toybox',116,88],['w01_desk',50,148],
      ['w01_couch',168,94],['w01_tv',218,150],
      ['w01_fridge',228,182],['w01_counter',152,172,24],['w01_cakeTable',212,232],
      ['w01_stairs',48,196],['w01_bricktown',52,234],['w01_brickcar',112,232],['minibrick',120,170],['minibrick',70,165],['minibrick',128,222],
      ['tree',58,262],['w01_bike',140,322],['w01_bdaysign',30,326],['w01_vfence',196,250,330,278,302],
      ['w01_neighbour',258,246],
      ['tower',404,232,20,70,'#8aa0b8'],['tower',428,222,24,96,'#6f86a8','#f6e7a6'],['tower',456,234,18,58,'#9aa8ba'],['tower',480,226,26,86,'#5c6f90','#cfeeff'],
      ['tower',512,236,16,50,'#8aa0b8','#f6e7a6'],['tower',532,228,22,78,'#6f86a8'],['tower',560,236,18,60,'#9aa8ba','#cfeeff'],['tower',584,230,24,70,'#5c6f90','#f6e7a6'],
      ['studio',456,288],['w01_lbl',566,244,'DOWNTOWN'],
      ['w01_remai',548,448],
      ['w01_lbl',452,528,'THE WEIR'],['w01_lbl',592,508,'TRAFFIC BRIDGE'],['w01_lbl',706,508,'BROADWAY BRIDGE'],['w01_lbl',1008,410,'UNIVERSITY BRIDGE'],
      ['w01_bigbess',826,422],
      ['shops',772,530,2],['patio',774,594],['w01_theatre',778,646],['shops',696,630,2],['shops',696,668,2],['w01_lbl',718,586,'BROADWAY AVE'],
      ['uofsTower',990,500],
      ['w01_kinsmen',928,228],
      ['sign',1050,598,'SCHOOL','TO WORLD 2'],
      ...K.homes([[262,96,'#2a5bd7'],[316,96,'#e8364b'],[262,150,'#44c55a'],[330,150,'#8a5426'],[20,22,'#e8364b'],[70,22,'#44c55a'],[300,22,'#2a5bd7'],
        [20,392,'#2a5bd7'],[70,392,'#e8364b'],[120,392,'#8a5426'],[170,392,'#44c55a'],[220,392,'#2a5bd7'],[270,392,'#e8364b'],[330,392,'#44c55a'],
        [30,450,'#44c55a'],[90,450,'#8a5426'],[150,450,'#2a5bd7'],[210,450,'#e8364b'],[280,450,'#8a5426'],[50,508,'#e8364b'],[120,508,'#44c55a'],[190,508,'#2a5bd7'],
        [430,60,'#e8364b'],[490,60,'#44c55a'],[560,60,'#8a5426'],[680,60,'#2a5bd7'],[680,140,'#e8364b'],[690,200,'#44c55a'],[664,262,'#8a5426'],[708,262,'#2a5bd7'],[664,320,'#e8364b'],[708,320,'#44c55a'],[680,380,'#2a5bd7'],
        [800,600,'#e8364b'],[850,560,'#2a5bd7'],[880,620,'#44c55a'],[830,660,'#8a5426'],[900,520,'#e8364b'],[1020,620,'#2a5bd7'],[1072,654,'#8a5426'],[1030,666,'#44c55a']])],
    scatter:[{k:'tree',n:110,zone:'forest'},{k:'tree',n:46,zone:'grass'},{k:'bush',n:14,zone:'grass'}],
    anim:[['balloon',236,96,'#e8364b'],['balloon',244,92,'#f6c445'],['balloon',228,100,'#2a5bd7'],['candle',226,211],
      ['weir',455,516],['pelican',420,506,0],['pelican',470,522,1],['pelican',500,500,2],['pelican',395,528,3],
      ['ferris',878,150,22],['canflag',825,276],['zzz',846,320],['canflag',600,292]] });
})(KINAN);

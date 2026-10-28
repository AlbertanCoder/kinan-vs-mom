/* World 8: Toronto (Kinan vs. the Raccoon King) */
(function(K){
  const {px,box,shadow,txt,hash,polyDist}=K; const g=()=>K.g();

  /* ---------- water ---------- */
  const LAKE={pts:[[-20,800],[300,786],[600,782],[900,786],[1220,800]],w:128};
  const HARB={pts:[[150,730],[165,640],[215,580],[300,562],[500,556],[700,560],[900,566],[960,580]],w:22};
  const EGAP={pts:[[960,580],[985,630],[995,700]],w:11};
  const DON={pts:[[1150,-20],[1120,120],[1140,260],[1100,400],[1040,500],[985,568]],w:9};
  const lakeD=(X,Y)=>polyDist(LAKE.pts,X,Y)-LAKE.w;
  const donD=(X,Y)=>polyDist(DON.pts,X,Y);
  const HILL=[450,150,128,56];
  const hillK=(X,Y)=>((X-HILL[0])/HILL[2])**2+((Y-HILL[1])/HILL[3])**2;

  /* ---------- ground looks ---------- */
  K.GROUND.w08_hill=(X,Y)=>{const k=hillK(X,Y);if(k>0.8&&Y>HILL[1]+8)return k>0.93?'#6f4a26':(X%5===0?'#8a5c30':'#b07a44');const h=hash(X>>1,Y>>1);return h>.95?'#b8f07a':h>.9?'#6cc644':'#86d65a';};
  K.GROUND.w08_runway=(X,Y)=>{const c=Y%14;if(c===6&&X%16<9)return '#ffffff';return hash(X>>2,Y>>2)>.94?'#5e626c':'#6b6f7a';};
  K.GROUND.w08_square=(X,Y)=>(X%10===0||Y%10===0)?'#c8c2b4':'#e8e4da';
  K.RIM.w08_hill='#b8f07a';K.LINE.w08_hill='#2e6423';K.RIM.w08_runway='#9aa3b2';K.LINE.w08_runway='#2b2f45';K.RIM.w08_square='#ffffff';K.LINE.w08_square='#6b6f7a';

  /* ---------- props ---------- */
  K.P.w08_lbl=function(X,Y,s){K.P.label(X,Y,s);};
  K.P.w08_keep=function(){};   /* draws nothing: keeps scattered trees and raccoons off the tall CN Tower */
  /* border sign with a board as wide as its words (text is drawn sharp at runtime, 7px) */
  K.P.w08_sign=function(X,Y,a,b,col){const G=g();const w=Math.ceil(Math.max(K.textW(a,6),b?K.textW(b,6):0))+9;
    shadow(X+w/2,Y+1,w/2-4,2);px('#1b1220',X+5,Y-12,2,12);px('#1b1220',X+w-7,Y-12,2,12);box(col||'#2f7d32',X,Y-31,w,20);px('#ffffff',X+1,Y-30,w-2,1);
    txt(a,X+4,Y-28,'#ffffff',6,1);if(b)txt(b,X+4,Y-20,'#f6c445',6,1);};
  /* the rail line east to Montreal: ballast, sleepers and two steel rails laid over the old street bed */
  K.P.w08_rail=function(X1,X2,Y){const L=X2-X1;px('#1b1220',X1,Y-6,L,13);px('#5a5650',X1,Y-5,L,11);for(let x=X1;x<X2;x+=4)px('#7a5430',x,Y-4,2,9);
    px('#2b2f45',X1,Y-3,L,1);px('#cfd6e2',X1,Y-2,L,1);px('#2b2f45',X1,Y+2,L,1);px('#cfd6e2',X1,Y+3,L,1);};
  K.P.w08_rstation=function(X,Y){shadow(X,Y+1,24,3);px('#1b1220',X-25,Y-5,50,6);px('#b8b2a6',X-24,Y-4,48,4);
    box('#c2414f',X-17,Y-24,34,19);px('#1b1220',X-20,Y-29,40,6);px('#6b3a22',X-19,Y-28,38,4);for(let i=0;i<4;i++)box('#f6e7a6',X-14+i*8,Y-19,4,6);box('#2b2f45',X-3,Y-12,6,7);
    px('#1b1220',X+19,Y-34,2,30);box('#f6c445',X+15,Y-40,10,6);};
  K.P.w08_raccoon=function(X,Y,crown){shadow(X+3,Y+1,5,1);
    px('#1b1220',X-1,Y-6,9,6);px('#8a8a96',X,Y-5,7,4);px('#b8b8c4',X+1,Y-3,4,1);
    px('#1b1220',X+4,Y-10,7,6);px('#9a9aa6',X+5,Y-9,5,4);px('#1b1220',X+5,Y-8,5,1);px('#ffffff',X+5,Y-8,1,1);px('#ffffff',X+9,Y-8,1,1);px('#1b1220',X+4,Y-11,2,2);px('#1b1220',X+9,Y-11,2,2);px('#1b1220',X+7,Y-6,1,1);
    for(let i=0;i<5;i++){px('#1b1220',X-5+i,Y-6-(i>2?1:0),1,4);px(i%2?'#2b2f45':'#c4c4ce',X-5+i,Y-5-(i>2?1:0),1,2);}
    if(crown){px('#1b1220',X+4,Y-14,7,4);px('#f6c445',X+5,Y-13,5,2);px('#f6c445',X+5,Y-15,1,2);px('#f6c445',X+7,Y-15,1,2);px('#f6c445',X+9,Y-15,1,2);}};
  K.P.w08_roofHome=function(X,Y,roof,rac){K.P.home(X,Y,roof);if(rac)K.P.w08_raccoon(X+6+(rac>1?6:0),Y-19);};
  /* CN Tower, 440 px tall: the Calgary Tower in World 5 is 168 px to its crown (about 176 with the flame), so this is about 2.5x,
     close to the real 553 m against 191 m. Main pod at 62% of the height, SkyPod at 81%, then the mast. Kinan walks behind it (overProp). */
  K.P.w08_cnTower=function(X,Y){const G=g();const O='#1b1220',C='#e2dccd',L='#f4f0e6',S='#bdb5a4';
    shadow(X,Y+2,24,5);
    /* the three flared legs */
    G.fillStyle=O;G.beginPath();G.moveTo(X-22,Y+1);G.quadraticCurveTo(X-8,Y-26,X-7,Y-72);G.lineTo(X+7,Y-72);G.quadraticCurveTo(X+8,Y-26,X+22,Y+1);G.fill();
    G.fillStyle=C;G.beginPath();G.moveTo(X-20,Y);G.quadraticCurveTo(X-7,Y-26,X-6,Y-72);G.lineTo(X+6,Y-72);G.quadraticCurveTo(X+7,Y-26,X+20,Y);G.fill();
    G.fillStyle=S;G.beginPath();G.moveTo(X+2,Y-72);G.lineTo(X+6,Y-72);G.quadraticCurveTo(X+7,Y-26,X+20,Y);G.lineTo(X+5,Y);G.fill();
    G.fillStyle=O;G.beginPath();G.moveTo(X-6,Y);G.lineTo(X-2,Y-60);G.lineTo(X+2,Y-60);G.lineTo(X+6,Y);G.fill();
    G.fillStyle=L;G.beginPath();G.moveTo(X-5,Y);G.lineTo(X-1,Y-58);G.lineTo(X+1,Y-58);G.lineTo(X+4,Y);G.fill();
    /* the long tapering shaft up to the main pod */
    for(let y=Y-72;y>=Y-256;y--){const u=(Y-72-y)/184,w=Math.round(12-4*u),h=Math.floor(w/2);px(O,X-h-1,y,w+2,1);px(C,X-h,y,w,1);px(L,X-h,y,2,1);px(S,X+h-3,y,3,1);px('#a8a08e',X,y,1,1);}
    /* main pod: cone underneath, the glass-floor ring, the window band, the roof ring */
    for(let k=0;k<12;k++){const w=10+k*3;px(O,X-Math.floor(w/2)-1,Y-256-k,w+2,1);px(k<10?S:C,X-Math.floor(w/2),Y-256-k,w,1);}
    px(O,X-22,Y-289,44,22);px(C,X-21,Y-288,42,20);px(L,X-21,Y-288,42,3);px('#9fd8ff',X-21,Y-271,42,3);
    px('#2b2f45',X-21,Y-282,42,7);for(let i=-19;i<20;i+=3)px('#f6e7a6',X+i,Y-280,1,3);px(S,X+14,Y-288,7,20);
    px(O,X-16,Y-295,32,7);px(S,X-15,Y-294,30,5);px(L,X-15,Y-294,30,1);
    /* upper shaft, SkyPod, mast */
    px(O,X-4,Y-350,9,56);px(C,X-3,Y-350,7,56);px(S,X+1,Y-350,3,56);
    px(O,X-8,Y-363,17,14);px(C,X-7,Y-362,15,12);px('#2b2f45',X-7,Y-358,15,4);for(let i=-6;i<8;i+=3)px('#f6e7a6',X+i,Y-357,1,2);px(S,X+4,Y-362,4,12);
    px(O,X-4,Y-374,9,12);px('#9aa3b2',X-3,Y-373,7,11);
    px(O,X-2,Y-430,5,57);px('#cfd6e2',X-1,Y-430,3,57);for(let i=0;i<24;i++)px(i%8<4?'#e8364b':'#ffffff',X-1,Y-430+i,3,1);px(O,X,Y-440,1,10);px('#e8364b',X,Y-441,1,2);
    K.P.label(X-52,Y-290,'CN TOWER');};
  K.P.w08_dome=function(X,Y){const G=g();shadow(X,Y+2,40,6);
    box('#c9c4b8',X-36,Y-12,72,12);for(let i=-32;i<32;i+=6)px('#9a968c',X+i,Y-10,3,8);
    G.fillStyle='#1b1220';G.beginPath();G.ellipse(X,Y-12,37,23,0,Math.PI,0);G.fill();
    G.fillStyle='#eef0f4';G.beginPath();G.ellipse(X,Y-12,36,22,0,Math.PI,0);G.fill();
    G.fillStyle='#d2d8e2';G.beginPath();G.ellipse(X,Y-12,36,22,0,-Math.PI/2,0);G.lineTo(X,Y-12);G.fill();
    G.strokeStyle='#8a96a8';G.lineWidth=1;for(let k=1;k<4;k++){G.beginPath();G.ellipse(X,Y-12,36*k/4,22,0,Math.PI,0);G.stroke();}
    px('#ffffff',X-22,Y-27,10,3);K.P.label(X,Y-44,'DOME STADIUM');};
  K.P.w08_aquarium=function(X,Y){shadow(X+32,Y+2,36,4);box('#dfe6ee',X,Y-22,64,22);
    for(let i=0;i<64;i++){const h=Math.round(5+Math.sin(i/5)*3);px('#1b1220',X+i,Y-24-h,1,h+2);px('#2a8ad7',X+i,Y-23-h,1,h);px('#9fd8ff',X+i,Y-23-h,1,1);}
    box('#2f62b0',X+5,Y-18,54,11);px('#4a8ae0',X+5,Y-18,54,3);
    [[9,-14,'#ff8a3d'],[22,-12,'#f6c445'],[46,-15,'#ff6fae']].forEach(([a,b,c])=>{px(c,X+a,Y+b,5,3);px(c,X+a-2,Y+b-1,2,5);px('#1b1220',X+a+4,Y+b,1,1);});
    px('#9aa3b2',X+30,Y-15,10,3);px('#9aa3b2',X+34,Y-17,2,2);px('#9aa3b2',X+28,Y-16,2,5);px('#ffffff',X+38,Y-14,2,1);
    box('#2b2f45',X+28,Y-6,8,6);K.P.label(X+32,Y-44,'AQUARIUM');};
  K.P.w08_bricks=function(X,Y){shadow(X+32,Y+2,36,4);const B=K.P.bigBrick;
    B(X,Y,22,12,'#e8364b');B(X+22,Y,20,12,'#f6c445');B(X+42,Y,22,12,'#2a5bd7');
    B(X+2,Y-12,20,12,'#44c55a');B(X+22,Y-12,20,12,'#ffffff');B(X+42,Y-12,20,12,'#e8364b');
    B(X+4,Y-24,56,10,'#f6c445');
    box('#1b1220',X+10,Y-44,44,12);txt('BRICKS',X+13,Y-43,'#ffffff',9,1);px('#1b1220',X+31,Y-33,2,4);
    box('#cfeeff',X+26,Y-9,12,9);px('#1b1220',X+31,Y-9,1,9);box('#cfeeff',X+5,Y-20,10,5);box('#cfeeff',X+48,Y-20,10,5);
    /* giant brick robot out front */
    B(X+68,Y,6,8,'#2a5bd7');B(X+76,Y,6,8,'#2a5bd7');B(X+66,Y-8,18,12,'#e8364b');B(X+70,Y-20,10,8,'#f6c445');px('#1b1220',X+72,Y-17,1,1);px('#1b1220',X+77,Y-17,1,1);B(X+62,Y-10,4,8,'#f6c445');B(X+84,Y-10,4,8,'#f6c445');};
  K.P.w08_union=function(X,Y){shadow(X+50,Y+2,54,4);box('#e2d4b0',X,Y-20,100,20);px('#1b1220',X-2,Y-25,104,6);px('#c9b88e',X-1,Y-24,102,4);
    for(let i=0;i<12;i++)px('#bfae88',X+30+i*4,Y-19,2,19);box('#2b2f45',X+44,Y-10,12,10);for(let i=0;i<5;i++){box('#7ec8ff',X+4+i*5,Y-15,3,6);box('#7ec8ff',X+80+i*4,Y-15,2,6);}
    K.P.label(X+50,Y+4,'UNION STATION');};
  K.P.w08_cityHall=function(X,Y){const G=g();shadow(X+52,Y+2,60,5);
    box('#cfcabc',X-4,Y-10,112,10);px('#e8e4da',X-4,Y-10,112,2);
    const tw=(x0,w,h,flip)=>{G.fillStyle='#1b1220';G.beginPath();if(!flip){G.moveTo(x0-1,Y-9);G.lineTo(x0-1,Y-h-1);G.quadraticCurveTo(x0+w+4,Y-h+6,x0+w+1,Y-9);}else{G.moveTo(x0+w+1,Y-9);G.lineTo(x0+w+1,Y-h-1);G.quadraticCurveTo(x0-4,Y-h+6,x0-1,Y-9);}G.fill();
      G.fillStyle='#f0eee6';G.beginPath();if(!flip){G.moveTo(x0,Y-10);G.lineTo(x0,Y-h);G.quadraticCurveTo(x0+w+3,Y-h+6,x0+w,Y-10);}else{G.moveTo(x0+w,Y-10);G.lineTo(x0+w,Y-h);G.quadraticCurveTo(x0-3,Y-h+6,x0,Y-10);}G.fill();
      for(let i=2;i<w-1;i+=3)px('#c4c0b4',x0+i,Y-h+4,1,h-15);
      G.fillStyle='#6f8aa8';const gx=flip?x0+1:x0+w-6;for(let yy=Y-h+6;yy<Y-12;yy+=4)px('#6f8aa8',gx,yy,5,2);};
    tw(X,26,58,false);tw(X+78,28,74,true);
    G.fillStyle='#1b1220';G.beginPath();G.ellipse(X+53,Y-16,20,8,0,0,Math.PI*2);G.fill();G.fillStyle='#f4f2ea';G.beginPath();G.ellipse(X+53,Y-16,19,7,0,0,Math.PI*2);G.fill();
    G.fillStyle='#dcd8cc';G.beginPath();G.ellipse(X+53,Y-14,19,4,0,0,Math.PI);G.fill();px('#1b1220',X+51,Y-24,4,2);
    };
  K.P.w08_torontoSign=function(X,Y){box('#9aa3b2',X-2,Y-3,52,3);const cs=['#e8364b','#2a5bd7','#f6c445','#44c55a','#ff6fae','#ff8a3d','#7ec8ff'];
    'TORONTO'.split('').forEach((ch,i)=>{txt(ch,X+i*7+1,Y-13,'#1b1220',10,1);txt(ch,X+i*7,Y-14,cs[i],10,1);});};
  K.P.w08_pool=function(X,Y){box('#4a8ae0',X,Y-8,46,8);px('#9fd8ff',X+2,Y-7,42,1);
    const G=g();G.strokeStyle='#1b1220';G.lineWidth=3;for(let i=0;i<3;i++){G.beginPath();G.arc(X+8+i*15,Y-6,6,Math.PI,0);G.stroke();}
    G.strokeStyle='#ffffff';G.lineWidth=1.5;for(let i=0;i<3;i++){G.beginPath();G.arc(X+8+i*15,Y-6,6,Math.PI,0);G.stroke();}};
  K.P.w08_casaLoma=function(X,Y){const G=g();shadow(X,Y+3,52,6);const S='#d8c49a',D='#b8a274',R='#4f6b62';
    box(S,X-40,Y-28,80,28);px(D,X-40,Y-12,80,2);for(let i=0;i<9;i++){box('#5a6fa0',X-36+i*9,Y-24,4,6);box('#5a6fa0',X-36+i*9,Y-10,4,5);}
    for(let i=0;i<10;i++)box(S,X-40+i*8,Y-32,5,4);
    box('#3b2618',X-5,Y-12,10,12);px('#5e3b20',X-4,Y-11,8,1);
    /* big round tower, conical roof */
    box(S,X-56,Y-46,18,46);px(D,X-42,Y-46,4,46);for(let k=0;k<3;k++)box('#5a6fa0',X-50,Y-40+k*12,5,6);
    G.fillStyle='#1b1220';G.beginPath();G.moveTo(X-59,Y-45);G.lineTo(X-47,Y-72);G.lineTo(X-35,Y-45);G.fill();G.fillStyle=R;G.beginPath();G.moveTo(X-57,Y-46);G.lineTo(X-47,Y-69);G.lineTo(X-37,Y-46);G.fill();px('#7a9a8e',X-50,Y-62,2,12);
    /* centre tower */
    box(S,X-10,Y-54,20,26);box('#5a6fa0',X-3,Y-48,6,8);G.fillStyle='#1b1220';G.beginPath();G.moveTo(X-13,Y-53);G.lineTo(X,Y-76);G.lineTo(X+13,Y-53);G.fill();G.fillStyle=R;G.beginPath();G.moveTo(X-11,Y-54);G.lineTo(X,Y-73);G.lineTo(X+11,Y-54);G.fill();
    /* square tower with battlements */
    box(S,X+38,Y-50,20,50);px(D,X+54,Y-50,4,50);for(let i=0;i<4;i++)box(S,X+38+i*6,Y-55,4,5);for(let k=0;k<3;k++)box('#5a6fa0',X+44,Y-44+k*12,6,6);
    px('#1b1220',X+48,Y-70,1,15);px('#2a5bd7',X+49,Y-70,8,5);
    K.P.w08_raccoon(X-4,Y-76,true);K.P.label(X-98,Y-10,'CASA LOMA');};
  K.P.w08_kensington=function(X,Y){[['#ff6fae','#44c55a'],['#f6c445','#e8364b'],['#44c5b8','#7a2fd0'],['#b06cff','#f6c445']].forEach(([w,a],i)=>{const sx=X+i*24;shadow(sx+11,Y+1,12,2);box(w,sx,Y-22,22,22);px('#1b1220',sx-1,Y-26,24,5);px(a,sx,Y-25,22,3);
      for(let k=0;k<5;k++)px(k%2?a:'#ffffff',sx+k*4+1,Y-14,4,3);box('#cfeeff',sx+3,Y-21,6,5);box('#cfeeff',sx+13,Y-21,6,5);box('#8a5426',sx+8,Y-8,6,8);});
    [[4,'#e8364b'],[28,'#ff8a3d'],[52,'#44c55a'],[76,'#f6c445']].forEach(([o,c])=>{box('#a8692e',X+o,Y+2,14,5);for(let k=0;k<4;k++)px(c,X+o+1+k*3,Y+1,2,2);});
    K.P.label(X+48,Y-40,'KENSINGTON MARKET');};
  K.P.w08_gardenCar=function(X,Y){shadow(X+12,Y+1,13,2);box('#ff6fae',X,Y-8,24,7);box('#7ec8ff',X+5,Y-12,13,4);px('#1b1220',X+3,Y-1,5,3);px('#1b1220',X+16,Y-1,5,3);
    px('#2f8a3a',X+2,Y-16,20,4);[[4,'#e8364b'],[9,'#f6c445'],[14,'#ffffff'],[19,'#e8364b']].forEach(([o,c])=>px(c,X+o,Y-18,2,2));};
  K.P.w08_station=function(X,Y){shadow(X,Y+1,12,2);box('#cfd6e2',X-11,Y-12,22,12);px('#7ec8ff',X-9,Y-10,18,4);box('#2b2f45',X-4,Y-6,8,6);
    px('#1b1220',X+13,Y-24,2,24);px('#1b1220',X+8,Y-30,12,9);px('#e8364b',X+9,Y-29,10,7);px('#ffffff',X+10,Y-27,8,3);K.P.label(X,Y+4,'SUBWAY');};
  K.P.w08_portal=function(X,Y){const G=g();box('#9a968c',X-11,Y-16,22,16);px('#c9c4b8',X-11,Y-16,22,2);G.fillStyle='#1b1220';G.beginPath();G.arc(X,Y-6,7,Math.PI,0);G.fill();px('#1b1220',X-7,Y-6,14,6);};
  K.P.w08_terminal=function(X,Y){const G=g();shadow(X+50,Y+2,56,5);box('#dfe5ee',X,Y-18,100,18);
    G.fillStyle='#1b1220';G.beginPath();G.ellipse(X+50,Y-18,52,9,0,Math.PI,0);G.fill();G.fillStyle='#9fd8ff';G.beginPath();G.ellipse(X+50,Y-18,51,8,0,Math.PI,0);G.fill();
    for(let i=0;i<12;i++)px('#5a8ac0',X+6+i*8,Y-25+Math.abs(i-5.5),1,8);for(let i=0;i<9;i++)box('#7ec8ff',X+6+i*10,Y-13,6,6);box('#2b2f45',X+44,Y-9,12,9);
    K.P.label(X+50,Y+4,'AIRPORT ARRIVALS');};
  K.P.w08_ctower=function(X,Y){shadow(X,Y+1,7,2);box('#dfe5ee',X-3,Y-34,6,34);box('#2b2f45',X-8,Y-42,16,8);px('#7ec8ff',X-7,Y-40,14,3);px('#1b1220',X,Y-50,1,8);px('#e8364b',X,Y-51,1,1);};
  K.P.w08_plane=function(X,Y,flip){const s=flip?-1:1;const q=(a,b,w,h,c)=>px(c,flip?X-a-w:X+a,Y+b,w,h);
    q(-1,-8,38,7,'#1b1220');q(0,-7,36,5,'#ffffff');q(2,-5,32,1,'#2a5bd7');q(30,-7,5,2,'#7ec8ff');q(0,-16,7,9,'#1b1220');q(1,-15,5,8,'#2a5bd7');q(12,-4,14,3,'#1b1220');q(13,-3,12,1,'#cfd6e2');q(4,-1,3,2,'#1b1220');q(26,-1,3,2,'#1b1220');};
  K.P.w08_lighthouse=function(X,Y){shadow(X,Y+1,7,2);const G=g();G.fillStyle='#1b1220';G.beginPath();G.moveTo(X-7,Y+1);G.lineTo(X-4,Y-28);G.lineTo(X+4,Y-28);G.lineTo(X+7,Y+1);G.fill();
    G.fillStyle='#e6d6b4';G.beginPath();G.moveTo(X-6,Y);G.lineTo(X-3,Y-27);G.lineTo(X+3,Y-27);G.lineTo(X+6,Y);G.fill();px('#c8b48e',X+1,Y-27,2,27);box('#2b2f45',X-1,Y-6,3,6);
    box('#ffffff',X-4,Y-33,8,5);px('#fff3c4',X-3,Y-32,6,3);px('#1b1220',X-5,Y-36,10,3);px('#e8364b',X-4,Y-35,8,2);K.P.label(X,Y+4,'LIGHTHOUSE');};
  K.P.w08_dock=function(X,Y,w){px('#1b1220',X-1,Y-4,w+2,6);px('#c08a52',X,Y-3,w,4);for(let i=1;i<w;i+=5)px('#7a5430',X+i,Y-3,1,4);};

  /* ---------- animations ---------- */
  K.A.w08_subway=function(t,pts){const segs=[];let tot=0;for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);segs.push(l);tot+=l;}
    for(let i=1;i<pts.length;i++){const[a,b]=pts[i-1],[c,d]=pts[i];const L=segs[i-1];const nx=-(d-b)/L,ny=(c-a)/L;for(let s=0;s<L;s+=1){const X=a+(c-a)*s/L,Y=b+(d-b)*s/L;px('#3a3d46',X-5,Y-5,11,11);}}
    for(let i=1;i<pts.length;i++){const[a,b]=pts[i-1],[c,d]=pts[i];const L=segs[i-1];const nx=-(d-b)/L,ny=(c-a)/L;for(let s=0;s<L;s+=1){const X=a+(c-a)*s/L,Y=b+(d-b)*s/L;if(Math.round(s)%4===0)px('#6f4a26',X-nx*3-1,Y-ny*3-1,Math.abs(nx)>.5?7:2,Math.abs(nx)>.5?2:7);px('#cfd6e2',X+nx*2,Y+ny*2,1,1);px('#cfd6e2',X-nx*2,Y-ny*2,1,1);}}
    let d=((t/30)%(tot+80))-40;for(let k=0;k<4;k++){let dd=d-k*12;if(dd<0||dd>tot)continue;let j=0;while(dd>segs[j]){dd-=segs[j];j++;}const[a,b]=pts[j],[c,e]=pts[j+1];const X=a+(c-a)*dd/segs[j],Y=b+(e-b)*dd/segs[j];box('#dfe5ee',X-5,Y-4,11,8);px('#e8364b',X-5,Y,11,2);px('#2b2f45',X-4,Y-3,9,2);}};
  K.A.w08_ferry=function(t,X1,Y1,X2,Y2){const u=(Math.sin(t/3200)+1)/2;const X=X1+(X2-X1)*u,Y=Y1+(Y2-Y1)*u;box('#ffffff',X-11,Y-4,22,6);px('#2a5bd7',X-11,Y,22,2);box('#ffffff',X-6,Y-9,12,5);px('#7ec8ff',X-5,Y-8,10,2);px('#1b1220',X-1,Y-13,2,4);};
  K.A.w08_streetcar=function(t,X1,X2,Y){const u=(Math.sin(t/4000)+1)/2;const X=X1+(X2-X1)*u;box('#e8364b',X-10,Y-5,20,8);px('#ffffff',X-10,Y,20,1);px('#cfeeff',X-8,Y-3,16,2);px('#1b1220',X,Y-9,1,4);};

  /* ---------- the world ---------- */
  const roofs=['#e8364b','#2a5bd7','#8a5426','#44c55a'];
  const row=(xs,y)=>xs.map((x,i)=>['w08_roofHome',x,y+(i%2)*2,roofs[(i+Math.floor(y/7))%4],hash(x,y)>.62?(hash(y,x)>.5?2:1):0]);
  const span=(a,b,st)=>{const o=[];for(let x=a;x<=b;x+=st)o.push(x);return o;};
  const tw=[[440,452,20,56,'#4a8aa8'],[466,446,18,64,'#2b2f45','#f6c445'],[492,452,18,50,'#7ab4c8'],
    [578,450,20,62,'#e0b040','#ffffff'],[604,444,22,70,'#2b2f45','#f6c445'],[632,452,18,54,'#4a8aa8'],[656,446,22,72,'#7ab4c8'],[684,452,18,58,'#2b2f45','#f6c445'],[708,446,20,66,'#5fa8b8'],[734,452,20,56,'#e0b040','#ffffff'],[758,448,16,62,'#4a8aa8'],
    [796,446,22,72,'#2b2f45','#f6c445'],[824,452,18,58,'#7ab4c8'],[848,444,22,74,'#e0b040','#ffffff'],[876,452,16,54,'#4a8aa8']].map(([a,b,w,h,c,wn])=>['tower',a,b,w,h,c,wn||'#e6fbff']);
  K.W.push({n:8,hud:'TORONTO',name:'Kinan vs. the Raccoon King',
    where:'Toronto: off the plane, onto the subway, down to the CN Tower and the lake, a ferry to the Toronto Islands and back over the Western Gap, then up through Kensington Market and the raccoon rooftops to Casa Loma, where the train east to Montreal leaves from the little station at the foot of the hill.',
    marks:'The airport, the subway line, Nathan Phillips Square with its TORONTO sign and the curved City Hall towers, the CN Tower beside the dome stadium, the downtown towers, Union Station, the aquarium, a giant toy-brick store, the island ferry, the Toronto Islands and their lighthouse, the red streetcars, Kensington Market, the Don Valley, Casa Loma on its hill, and raccoons everywhere.',
    size:[1200,780],ground:'grass',water:'blue',cliff:'dirt',path:'tan',
    rivers:[LAKE,HARB,EGAP,DON],lakes:[[700,630,38,8],[850,624,36,8]],
    zones:[
      {k:'w08_runway',r:[0,22,272,14]},{k:'w08_runway',r:[0,170,250,14]},{k:'paved',r:[0,52,250,100]},
      {k:'w08_hill',f:(X,Y)=>hillK(X,Y)<1},
      {k:'w08_square',r:[612,224,168,128]},
      {k:'sand',f:(X,Y)=>Y>600&&X>180&&X<970&&lakeD(X,Y)<14},
      {k:'paved',f:(X,Y)=>X>436&&X<896&&Y>366&&Y<509},
      {k:'forest',f:(X,Y)=>donD(X,Y)<36}],
    roads:[[[-20,515],[1220,515]],[[-20,360],[1220,360]],[[-20,200],[1220,200]],
      [[290,-20],[290,602]],[[430,200],[430,515]],[[780,360],[780,538]],[[900,-20],[900,515]],
      [[300,50],[826,50],[852,76],[852,290]]],                         /* bed of the subway line (the tracks are drawn over it) */
    bridges:[[290,564,'metal'],[0,515,'traffic','h'],[0,360,'traffic','h'],[0,200,'arches','h']],
    J:{SP:[852,290],QS:[705,360],SQ:[430,360],SB:[430,515],BY:[780,515],FT:[780,536],HD:[485,596],BRS:[290,598],BD:[290,305]},
    /* one journey: the cargo plane from Vancouver lands on the runway; the train leaves Casa Loma's station east to Montreal */
    entryPath:{from:[0,177],via:[[90,177],[136,172],[162,154]],style:'glass'},
    exitPath:{to:[1200,200],via:[[452,174],[464,196],[500,200],[700,200],[1000,200]],ride:'train'},
    stops:[
      {at:[172,134],name:'8-1  AIRPORT ARRIVALS',st:'open'},
      {at:[330,50],name:'8-2  THE SUBWAY RUSH',st:'lock'},
      {at:[705,330],name:'8-3  NATHAN PHILLIPS SQUARE',st:'lock'},
      {at:[545,515],name:'8-4  THE CN TOWER GLASS FLOOR',st:'lock'},
      {at:[618,515],name:'8-5  THE BRICK TOY STORE',st:'lock'},
      {at:[700,515],name:'FORT  THE AQUARIUM TUNNEL',st:'fort'},
      {at:[440,614],name:'8-6  FERRY TO THE ISLANDS',st:'lock'},
      {at:[374,642],name:'SECRET  THE ISLAND LIGHTHOUSE',st:'secret'},
      {at:[332,302],name:'8-7  KENSINGTON MARKET',st:'lock'},
      {at:[360,250],name:'8-8  RACCOON ROOFTOPS',st:'lock'},
      {at:[450,152],name:'CASTLE  CASA LOMA  -  THE RACCOON KING',st:'boss'}],
    edges:[[0,1,[[230,110],[280,66]]],[1,'SP',[[826,50],[852,76]],{road:1}],['SP',2,[[826,316],[760,330]]],[2,'QS',[],{road:1}],['QS','SQ',[],{road:1}],['SQ','SB',[],{road:1}],
      ['SB',3,[],{road:1}],[3,4,[],{road:1}],[4,5,[],{road:1}],[5,'BY',[],{road:1}],['BY','FT',[],{road:1}],['FT','HD',[],{style:'glass'}],['HD',6,[]],
      [6,7,[[404,632]]],[6,'BRS',[[384,602],[310,600]]],['BRS','BD',[[290,560],[290,515],[290,360]],{road:1}],['BD',8,[]],
      [8,9,[[352,276]]],[9,10,[[364,222],[370,182],[410,158]]]],
    exit:[1160,200],
    props:[
      ['w08_rail',436,1220,200],['w08_rstation',494,190],
      ['w08_terminal',40,128],['w08_ctower',218,92],['w08_plane',30,34],['w08_plane',150,34],['w08_plane',60,100],['w08_plane',200,64,1],
      ['w08_station',348,92],['w08_portal',852,300],
      ['w08_cityHall',624,300],['w08_torontoSign',616,352],['w08_pool',726,352],
      ['w08_dome',486,500],['w08_bricks',584,503],['w08_aquarium',668,503],['w08_union',800,503],
      ['w08_kensington',306,346],['w08_gardenCar',394,300],['w08_casaLoma',450,138],
      ['w08_lighthouse',352,644],['w08_dock',470,600,26],['w08_dock',766,544,28],
      ['w08_sign',192,166,'WELCOME TO','TORONTO'],['w08_sign',1072,188,'TO WORLD 9','MONTREAL','#2a5bd7'],['w08_lbl',990,206,'RAIL TO MONTREAL'],
      ...tw,
      ...row(span(20,260,30),252),...row(span(20,260,30),302),...row(span(20,260,30),346),
      ...row([300,390],262),...row([300,390],232),...row([450,480,510,570,600],252),...row([450,480,510,570,600],302),...row([450,480,510,570,600],346),
      ...row(span(600,780,30),130),...row(span(600,780,30),180),...row([870],130),...row([870],180),
      ...row(span(916,1070,30),130),...row(span(916,1040,30),180),...row(span(916,1070,30),252),...row(span(916,1070,30),302),...row(span(916,1070,30),346),
      ...row(span(300,410,30),402),...row(span(300,410,30),452),...row(span(300,410,30),500),...row(span(10,270,30),402),...row(span(10,270,30),452),...row(span(10,270,30),500),
      ...row(span(916,1000,30),402),...row(span(916,1000,30),452),
      ['w08_lbl',600,700,'LAKE ONTARIO'],['w08_lbl',560,646,'TORONTO ISLANDS'],['w08_lbl',700,586,'ISLAND FERRY'],['w08_lbl',1150,330,'DON VALLEY'],['w08_lbl',600,30,'SUBWAY LINE'],
      ['w08_lbl',700,212,'NATHAN PHILLIPS SQUARE'],
      ...[80,120,160,200,240,280,320,360,400,440].map(y=>['w08_keep',525,y])],
    overProps:[['w08_cnTower',545,503]],
    scatter:[{k:'tree',n:120,zone:'forest'},{k:'tree',n:70,zone:'grass'},{k:'w08_raccoon',n:34,zone:'grass'},{k:'w08_raccoon',n:6,zone:'paved'},{k:'tree',n:20,zone:'w08_hill'}],
    anim:[['w08_subway',[[300,50],[826,50],[852,76],[852,290]]],['w08_ferry',760,550,500,590],['w08_streetcar',460,690,360],['w08_streetcar',100,260,360],
      ['ferris',600,600,12],['boat',300,700,0],['boat',820,690,1],['boat',1080,620,2],['canflag',610,316]],
    fx:undefined});
})(KINAN);

/* World 10: Niagara Falls (Kinan vs. Mom, again). The last normal world.
   Map is turned so both falls face the camera: the gorge runs left-right across the middle,
   Canada is below it, the USA above it, the Horseshoe Falls at the right end of the gorge. */
(function(K){
  const {px,box,shadow,txt,hash}=K; const g=()=>K.g();

  /* Niagara's famous green water */
  K.WATER.w10_niagara={a:'#3aa39c',b:'#3aa39c',edge:'#23756f',foam:'#8fe0d2',sh:'#e0fff8'};
  /* wine country rows */
  K.GROUND.w10_vines=(X,Y)=>Y%9<3?(hash(X>>1,Y>>2)>.6?'#4f9a3a':'#2f7a2c'):(hash(X>>2,Y>>2)>.9?'#b8894e':'#c9a46a');
  K.RIM.w10_vines='#e0c48a'; K.LINE.w10_vines='#5e3b20';
  /* tidy park lawn (Queen Victoria Park / Goat Island) */
  K.GROUND.w10_lawn=(X,Y)=>{const h=hash(X>>1,Y>>1);return ((X>>3)+(Y>>3))&1?(h>.97?'#a8ec74':'#74cc4c'):(h>.97?'#a8ec74':'#6cc644');};
  K.RIM.w10_lawn='#a8ec74'; K.LINE.w10_lawn='#2e6423';

  /* ---------- props ---------- */
  K.P.w10_flowers=function(X,Y){const c=['#e8364b','#f6c445','#ff6fae','#9b5de5','#ffffff'];for(let i=0;i<5;i++){const a=Math.round(hash(X+i,Y)*8)-4,b=Math.round(hash(Y+i,X)*4)-2;px('#2f7a2c',X+a,Y+b,2,2);px(c[(i+X)%5],X+a,Y+b-1,2,1);}};
  K.P.w10_tower=function(X,Y){
    shadow(X,Y+2,30,5);
    box('#d8d2c4',X-24,Y-14,48,14);px('#bdb6a6',X-24,Y-5,48,2);for(let i=0;i<5;i++)box('#7ec8ff',X-20+i*9,Y-11,5,4);
    px('#1b1220',X-6,Y-100,12,87);px('#ece8de',X-5,Y-100,10,87);px('#cfc9bb',X+1,Y-100,4,87);
    px('#6b6457',X-10,Y-98,3,84);px('#6b6457',X+7,Y-98,3,84);
    px('#1b1220',X-21,Y-117,42,19);px('#efe9dc',X-20,Y-116,40,17);px('#2b3550',X-20,Y-111,40,5);for(let i=0;i<40;i+=4)px('#f6e7a6',X-20+i,Y-110,2,2);px('#d6cfbf',X-20,Y-102,40,3);
    px('#1b1220',X-15,Y-124,30,8);px('#efe9dc',X-14,Y-123,28,6);px('#d6cfbf',X-14,Y-119,28,2);
    px('#1b1220',X-1,Y-138,2,15);px('#e8364b',X-1,Y-140,2,2);
    K.P.label(X,Y+4,'THE OBSERVATION TOWER');};
  K.P.w10_arcade=function(X,Y,w,c,s,sc){shadow(X+w/2,Y+2,w*0.6,3);box(c,X,Y-22,w,22);px('rgba(255,255,255,.25)',X,Y-22,w,2);px('rgba(0,0,0,.18)',X+w-3,Y-22,3,22);
    px('#1b1220',X+1,Y-33,w-2,12);px('#2a1846',X+2,Y-32,w-4,10);txt(s,X+4,Y-31,sc||'#ff3df0',6,1);
    box('#cfeeff',X+4,Y-16,6,6);box('#cfeeff',X+w-10,Y-16,6,6);box('#f6c445',X+w/2-3,Y-9,7,9);};
  K.P.w10_haunted=function(X,Y){shadow(X+18,Y+2,22,3);box('#5a2f7a',X,Y-24,36,24);px('#1b1220',X-3,Y-38,42,15);px('#3a1a50',X-2,Y-37,40,13);
    px('#1b1220',X+14,Y-50,8,13);px('#3a1a50',X+15,Y-49,6,12);box('#f6c445',X+5,Y-18,6,6);box('#f6c445',X+25,Y-18,6,6);px('#1b1220',X+6,Y-16,4,1);box('#1b1220',X+15,Y-11,7,11);
    px('#ffffff',X+30,Y-44,4,5);px('#1b1220',X+31,Y-42,1,1);px('#1b1220',X+33,Y-42,1,1);};
  K.P.w10_dock=function(X,Y){px('#1b1220',X-1,Y-26,10,28);px('#a8692e',X,Y-26,8,27);for(let i=0;i<26;i+=3)px('#6f4a26',X,Y-26+i,8,1);px('#1b1220',X-3,Y-26,2,4);px('#1b1220',X+9,Y-26,2,4);};
  K.P.w10_tableRock=function(X,Y){shadow(X+25,Y+2,30,4);box('#e8e2d2',X,Y-16,50,16);px('#7ec8ff',X+2,Y-12,46,6);for(let i=0;i<46;i+=6)px('#cfeeff',X+2+i,Y-12,2,6);
    px('#1b1220',X-2,Y-20,54,5);px('#6b6f7a',X-1,Y-19,52,3);for(let i=0;i<=50;i+=5)px('#1b1220',X+i,Y-25,1,5);px('#1b1220',X,Y-25,51,1);
    [[6,'#f6c445'],[16,'#f6c445'],[30,'#f6c445']].forEach(([a,c])=>{px(c,X+a,Y-27,3,4);px('#d9a27a',X+a+1,Y-29,2,2);});
    K.P.label(X+25,Y+4,'TABLE ROCK');};
  K.P.w10_tunnel=function(X,Y){/* the Journey Behind the Falls ledge: rock, tunnel mouth, yellow ponchos */
    px('#1b1220',X-14,Y-12,28,13);px('#86807a',X-13,Y-11,26,11);px('#a8a296',X-13,Y-11,26,2);
    g().fillStyle='#1b1220';g().beginPath();g().arc(X-4,Y,7,Math.PI,0);g().fill();
    for(let i=0;i<24;i+=3)px('#1b1220',X-12+i,Y-15,1,4);px('#1b1220',X-12,Y-15,24,1);
    [[3,'#f6c445'],[8,'#f6c445']].forEach(([a,c])=>{px(c,X+a,Y-15,3,4);px('#d9a27a',X+a+1,Y-17,2,2);});};
  K.P.w10_hotel=function(X,Y,w,h,c){K.P.tower(X,Y,w,h,c,'#fff3c4');px('#1b1220',X+2,Y-h-4,w-4,4);px('#e8364b',X+3,Y-h-3,w-6,2);};
  K.P.w10_floralClock=function(X,Y){const G=g();shadow(X,Y+19,36,6);
    G.fillStyle='#1b1220';G.beginPath();G.ellipse(X,Y,33,20,0,0,Math.PI*2);G.fill();
    G.fillStyle='#2f7a2c';G.beginPath();G.ellipse(X,Y,32,19,0,0,Math.PI*2);G.fill();
    G.fillStyle='#f6c445';G.beginPath();G.ellipse(X,Y,27,15,0,0,Math.PI*2);G.fill();
    for(let i=0;i<12;i++){const a=i*Math.PI/6;G.fillStyle=i%2?'#e8364b':'#9b5de5';G.beginPath();G.moveTo(X,Y);G.ellipse(X,Y,24,13,0,a,a+Math.PI/6);G.closePath();G.fill();}
    G.fillStyle='#ffd1e6';G.beginPath();G.ellipse(X,Y,13,7,0,0,Math.PI*2);G.fill();
    for(let i=0;i<12;i++){const a=i*Math.PI/6;px('#ffffff',X+Math.cos(a)*29-1,Y+Math.sin(a)*17-1,3,2);}
    box('#c9c4b8',X+30,Y-36,12,20);px('#1b1220',X+28,Y-42,16,7);px('#6b6f7a',X+29,Y-41,14,5);box('#f4f1e8',X+33,Y-31,6,6);px('#1b1220',X+36,Y-30,1,3);
    K.P.label(X,Y+20,'FLORAL CLOCK');};
  K.P.w10_conservatory=function(X,Y){const G=g();shadow(X+32,Y+2,40,5);
    box('#d8d2c4',X,Y-9,64,9);px('#bdb6a6',X,Y-3,64,2);
    G.fillStyle='#1b1220';G.beginPath();G.ellipse(X+32,Y-9,33,27,0,Math.PI,0);G.fill();
    G.fillStyle='#bfe8f4';G.beginPath();G.ellipse(X+32,Y-9,31,25,0,Math.PI,0);G.fill();
    [[12,-12],[22,-16],[38,-14],[50,-11],[30,-20]].forEach(([a,b])=>{px('#2f8a3a',X+a-4,Y+b,9,6);px('#5fbf4a',X+a-3,Y+b,5,3);});
    G.strokeStyle='#ffffff';G.lineWidth=1;for(let i=-24;i<=24;i+=8){G.beginPath();G.moveTo(X+32+i,Y-9);G.lineTo(X+32+i*0.55,Y-9-Math.sqrt(Math.max(0,625-i*i))*0.98);G.stroke();}
    for(let k=1;k<3;k++){G.beginPath();G.ellipse(X+32,Y-9,31*k/3,25*k/3,0,Math.PI,0);G.stroke();}
    px('rgba(255,255,255,.7)',X+14,Y-28,6,3);box('#3b2618',X+28,Y-8,8,8);
    K.P.label(X+32,Y+4,'BUTTERFLY CONSERVATORY');};
  K.P.w10_picnic=function(X,Y){/* the grandmothers' picnic: two checked blankets, a basket, a pie, a teapot, two grandmas */
    shadow(X+30,Y+2,40,5);
    [[0,-14],[34,-10]].forEach(([a,b])=>{px('#1b1220',X+a-1,Y+b-1,28,14);for(let i=0;i<26;i+=4)for(let j=0;j<12;j+=4)px(((i+j)/4)%2?'#ffffff':'#e8364b',X+a+i,Y+b+j,4,4);});
    box('#a8692e',X+8,Y-12,9,6);px('#6f4a26',X+8,Y-10,9,1);px('#1b1220',X+10,Y-16,5,1);px('#1b1220',X+9,Y-15,1,3);px('#1b1220',X+15,Y-15,1,3);
    box('#f4f1e8',X+40,Y-8,8,4);px('#c99a5c',X+41,Y-8,6,2);box('#7ec8ff',X+52,Y-8,6,5);px('#7ec8ff',X+58,Y-7,2,1);
    const gran=(gx,gy,dress)=>{px('#1b1220',gx-1,gy-15,9,16);px(dress,gx,gy-8,7,8);px('#d9a27a',gx+1,gy-13,5,5);px('#d6d6e0',gx,gy-15,7,3);px('#d6d6e0',gx+5,gy-17,3,3);px('#1b1220',gx+2,gy-11,1,1);px('#1b1220',gx+4,gy-11,1,1);px('#ffffff',gx+1,gy-5,5,1);};
    gran(X+2,Y-1,'#9b5de5');gran(X+60,Y+1,'#2a9d8f');
    px('#1b1220',X+28,Y-30,1,20);px('#1b1220',X+19,Y-33,20,4);px('#ff6fae',X+20,Y-32,18,2);px('#ffffff',X+24,Y-32,4,2);px('#ffffff',X+32,Y-32,4,2);
    K.P.label(X+30,Y+4,"GRANDMAS' PICNIC");};
  /* Kinan walks behind the Mirror Maze (it is an overProp). Text inside an overProp would be painted over whenever he is
     north of it, so the purple sign carries a row of little mirrors and lights and the name sits in the label below. */
  K.P.w10_mirrorMaze=function(X,Y){shadow(X+26,Y+2,30,4);box('#cfd6e2',X,Y-26,52,26);
    for(let i=0;i<5;i++){box('#e8eef8',X+3+i*10,Y-22,7,14);px('#ffffff',X+4+i*10,Y-21,2,6);px('#9aa3b2',X+8+i*10,Y-14,1,5);}
    px('#1b1220',X-2,Y-38,56,12);px('#7a2fd0',X-1,Y-37,54,10);
    for(let i=0;i<8;i++){const mx=X+3+i*6;px('#1b1220',mx,Y-35,5,6);px(i%2?'#e8eef8':'#cfeeff',mx+1,Y-34,3,4);px('#ffffff',mx+1,Y-34,1,1);}
    for(let i=0;i<13;i++)px(['#f6c445','#ff6fae','#00ffd0'][i%3],X+1+i*4,Y-38,2,1);
    box('#2b2f45',X+22,Y-8,8,8);K.P.label(X+26,Y+4,'MIRROR MAZE');};
  K.P.w10_prospect=function(X,Y){px('#1b1220',X-1,Y-40,6,40);px('#9aa3b2',X,Y-40,4,40);for(let i=0;i<40;i+=5)px('#6f7889',X,Y-40+i,4,1);
    px('#1b1220',X-3,Y-46,22,7);px('#dfe5ee',X-2,Y-45,20,5);px('#7ec8ff',X,Y-44,16,2);};
  K.P.w10_usBlock=function(X,Y,w,h,c){K.P.tower(X,Y,w,h,c,'#f6e7a6');};
  K.P.w10_barge=function(X,Y){px('#1b1220',X-1,Y-8,38,10);px('#4a5160',X,Y-7,36,8);px('#6f7889',X,Y-7,36,2);
    [[6,'#e8364b'],[14,'#f6c445'],[22,'#2a5bd7']].forEach(([a,c])=>{px('#1b1220',X+a-1,Y-14,5,8);px(c,X+a,Y-13,3,6);});
    px('#1b1220',X+31,Y-20,1,13);px('#ff6fae',X+32,Y-20,5,3);};
  K.P.w10_party=function(X,Y){/* Mom's birthday party at the falls: big cake, two tables, bunting, presents */
    shadow(X,Y+3,60,6);
    const table=(tx,ty)=>{px('#1b1220',tx-1,ty-9,36,8);px('#ffffff',tx,ty-8,34,6);for(let i=0;i<34;i+=4)px('#e8364b',tx+i,ty-4,2,2);px('#1b1220',tx+2,ty-2,2,4);px('#1b1220',tx+30,ty-2,2,4);
      [[4,'#f6c445'],[13,'#ff6fae'],[22,'#7ec8ff']].forEach(([a,c])=>{px('#1b1220',tx+a,ty-11,6,3);px(c,tx+a+1,ty-11,4,2);});};
    table(X-74,Y+2);table(X+40,Y+2);
    [[-30,'#ffd1e6','#ff6fae',40,15],[-23,'#fff3c4','#f6c445',30,13],[-16,'#cfeeff','#2a5bd7',20,12]].forEach(([o,c1,c2,w,h],i)=>{const by=Y-[0,15,28][i];box(c1,X-w/2,by-h,w,h);px(c2,X-w/2,by-h,w,3);for(let k=0;k<w;k+=6)px(c2,X-w/2+k,by-h+3,3,2+((k/6)%2)*2);px('rgba(0,0,0,.12)',X+w/2-5,by-h,5,h);
      for(let k=3;k<w-3;k+=5)px(['#e8364b','#44c55a','#f6c445','#7ec8ff'][k%4],X-w/2+k,by-h+7,1,1);});
    px('#ffffff',X-6,Y-48,3,8);px('#ffffff',X+3,Y-48,3,8);txt('11',X-6,Y-38,'#e8364b',7,1);
    px('#1b1220',X-70,Y-56,1,46);px('#1b1220',X+70,Y-56,1,46);
    for(let i=0;i<70;i++){const yy=Y-54+Math.round(Math.sin(i/69*Math.PI)*8);px('#1b1220',X-70+i*2,yy,2,1);if(i%3===0){px(['#e8364b','#f6c445','#2a5bd7','#44c55a','#ff6fae'][(i/3)%5],X-70+i*2,yy+1,3,4);}}
    px('rgba(17,19,43,.8)',X-46,Y-70,92,10);txt('HAPPY BIRTHDAY KINAN',X-43,Y-69,'#f6c445',7,1);
    [[-50,0],[-42,4],[48,6],[56,0]].forEach(([a,b])=>K.P.present(X+a,Y+b+12));
    /* Mom, the boss, in her game look (index.html MOM): short dark hair, a purple top with a white butterfly, dark trousers, hands on hips */
    const mx=X+22,my=Y+10;px('#1b1220',mx-1,my-19,11,20);px('#5b46a8',mx,my-10,9,6);px('#2b2f45',mx,my-4,9,4);px('#c98d63',mx+1,my-16,7,6);px('#1d1416',mx,my-19,9,4);px('#1d1416',mx,my-16,2,3);px('#1d1416',mx+7,my-16,2,3);
    px('#ffffff',mx+3,my-8,1,1);px('#ffffff',mx+5,my-8,1,1);px('#ffffff',mx+4,my-7,1,1);
    px('#1b1220',mx+3,my-14,1,1);px('#1b1220',mx+6,my-14,1,1);px('#c98d63',mx-2,my-9,2,3);px('#c98d63',mx+9,my-9,2,3);px('#1b1220',mx+2,my,2,2);px('#1b1220',mx+6,my,2,2);
  };
  K.P.w10_fallsSign=function(X,Y,s){K.P.label(X,Y,s);};
  /* border sign with a board as wide as its words (text is drawn sharp at runtime, 7px) */
  K.P.w10_sign=function(X,Y,a,b,col){const G=g();const w=Math.ceil(Math.max(K.textW(a,6),b?K.textW(b,6):0))+9;
    shadow(X+w/2,Y+1,w/2-4,2);px('#1b1220',X+5,Y-12,2,12);px('#1b1220',X+w-7,Y-12,2,12);box(col||'#2f7d32',X,Y-31,w,20);px('#ffffff',X+1,Y-30,w-2,1);
    txt(a,X+4,Y-28,'#ffffff',6,1);if(b)txt(b,X+4,Y-20,'#f6c445',6,1);};

  /* ---------- animations ---------- */
  K.A.w10_horseshoe=function(t,X0,X1,Y,dip,h){/* a falls curtain facing the camera; dip>0 bends it into a horseshoe */
    for(let x=X0;x<=X1;x++){const u=(x-X0)/(X1-X0),s=Math.sin(Math.PI*u),yb=Math.round(Y-dip*s),hh=Math.round(h+dip*s),col=hash(x,3);
      px('#1d5f5a',x,yb-4,1,3);px('#2f8f86',x,yb-6,1,2);px('#e8fffa',x,yb-1,1,2);
      for(let k=0;k<hh;k++){const q=(k+Math.floor(t/45)+Math.floor(col*9))%9;px(q===0?'#7fcfc2':col>.55?(q<5?'#ffffff':'#e6faf6'):(q<4?'#d0f2ec':'#b4e6dd'),x,yb+1+k,1,1);}
      if(x===X0||x===X1){px('#1b1220',x,yb-1,1,hh+2);}}
    for(let i=0;i<16;i++){const a=((t/650)+i/16)%1,xx=X0+(i+0.5)*(X1-X0)/16+Math.sin(i*3)*3;g().fillStyle='rgba(255,255,255,'+(0.95-a*0.7)+')';g().beginPath();g().arc(xx,Y+h+2-a*8,2+a*4,0,Math.PI*2);g().fill();}};
  K.A.w10_flow=function(t,pts,n){/* white ripples sliding along the river toward the brink */
    let tot=0;const L=[];for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);L.push(l);tot+=l;}
    for(let k=0;k<n;k++){let d=((t/30)+k*tot/n+hash(k,5)*20)%tot;let j=0;while(j<L.length-1&&d>L[j]){d-=L[j];j++;}const[a,b]=pts[j],[c,e]=pts[j+1];const f=d/L[j];const off=(hash(k,9)-0.5)*24;
      const nx=-(e-b)/L[j],ny=(c-a)/L[j];px('#e0fff8',a+(c-a)*f+nx*off,b+(e-b)*f+ny*off,4,1);}};
  K.A.w10_mist=function(t,X,Y,w){for(let i=0;i<10;i++){const a=((t/2400)+i/10)%1,xx=X+(hash(i,7)-0.5)*w+Math.sin(a*4+i)*6;g().fillStyle='rgba(255,255,255,'+(0.5-a*0.45)+')';g().beginPath();g().arc(xx,Y-a*56,5+a*12,0,Math.PI*2);g().fill();}};
  K.A.w10_boat=function(t,X,Y,i){const b=Math.round(Math.sin(t/450+i*2)*1),dx=i?0:Math.round(Math.sin(t/2600)*10);const a=X+dx,c=Y+b;
    px('#1b1220',a-1,c-6,30,8);px('#ffffff',a,c-5,28,6);px('#2a5bd7',a,c-1,28,2);px('#1b1220',a+4,c-11,18,6);px('#dfe5ee',a+5,c-10,16,4);
    for(let k=0;k<6;k++)px(i?'#e8364b':'#2a5bd7',a+6+k*3,c-14,2,3);px('#1b1220',a+12,c-18,1,6);px('#e8364b',a+13,c-18,4,2);};
  K.A.w10_swirl=function(t,X,Y,rx,ry){const G=g();G.lineWidth=1;for(let i=0;i<4;i++){const k=1-i*0.2,a0=t/900*(1+i*0.3)+i*1.7;G.strokeStyle='rgba(224,255,248,'+(0.75-i*0.12)+')';G.beginPath();G.ellipse(X,Y,rx*k*0.8,ry*k*0.8,0,a0,a0+2.2);G.stroke();}
    px('#1d5f5a',X-2,Y-1,4,2);};
  K.A.w10_cablecar=function(t,x1,y1,x2,y2){const G=g();
    [[x1,y1],[x2,y2]].forEach(([a,b])=>{px('#1b1220',a-2,b-24,5,20);px('#6f7889',a-1,b-23,3,18);px('#1b1220',a-6,b-26,13,4);px('#e8364b',a-5,b-25,11,2);});
    G.strokeStyle='#1b1220';G.lineWidth=1;[-24,-21].forEach(o=>{G.beginPath();G.moveTo(x1,y1+o);G.quadraticCurveTo((x1+x2)/2,(y1+y2)/2+o+6,x2,y2+o);G.stroke();});
    const u=(Math.sin(t/2600)+1)/2,cx=x1+(x2-x1)*u,cy=y1+(y2-y1)*u-21+Math.sin(u*Math.PI)*6;
    px('#1b1220',cx,cy,1,5);px('#1b1220',cx-8,cy+5,17,10);px('#f6c445',cx-7,cy+6,15,8);px('#e8364b',cx-7,cy+6,15,2);px('#cfeeff',cx-5,cy+9,3,3);px('#cfeeff',cx-1,cy+9,3,3);px('#cfeeff',cx+3,cy+9,3,3);};
  K.A.w10_fireworks=function(t,X,Y){const cols=['#ff3df0','#f6c445','#7ec8ff','#44c55a','#ff8a3d'];
    for(let k=0;k<3;k++){const a=((t/1500)+k/3)%1,cx=X+[-18,4,22][k],cy=Y-[12,26,6][k],r=5+a*16,c=cols[(k+Math.floor(t/1500+k/3))%5];
      g().globalAlpha=Math.max(0,1-a*0.85);for(let i=0;i<12;i++){const an=i*Math.PI/6+k;px(c,cx+Math.cos(an)*r-1,cy+Math.sin(an)*r*0.8-1,3,3);px(c,cx+Math.cos(an)*r*0.7,cy+Math.sin(an)*r*0.56,2,2);px('#ffffff',cx+Math.cos(an)*r*0.4,cy+Math.sin(an)*r*0.32,1,1);}px('#ffffff',cx-1,cy-1,3,3);g().globalAlpha=1;}};
  K.A.w10_lifts=function(t,X,Y){[[X-11,0],[X+7,1]].forEach(([lx,i])=>{const u=(Math.sin(t/1700+i*2.4)+1)/2,yy=Math.round(Y-22-u*70);px('#1b1220',lx-1,yy-1,6,8);px('#f6c445',lx,yy,4,6);px('#fff3c4',lx,yy+1,4,1);px('#2b3550',lx+1,yy+3,2,2);});};
  K.A.w10_butterflies=function(t,X,Y){const c=['#ff8a3d','#f6c445','#7ec8ff','#ff6fae','#9b5de5'];for(let i=0;i<6;i++){const a=t/900+i*1.3,bx=X+Math.cos(a)*(26+i*3),by=Y-28+Math.sin(a*1.6)*10-i*2,f=Math.floor(t/120+i)%2;
    px('#1b1220',bx,by,1,3);px(c[i%5],bx-2,by-(f?1:0),2,2);px(c[i%5],bx+1,by-(f?1:0),2,2);}};
  K.A.w10_clockHands=function(t,X,Y){const G=g();const m=t/4000,h=t/48000;G.strokeStyle='#1b1220';G.lineWidth=2;G.beginPath();G.moveTo(X,Y);G.lineTo(X+Math.cos(m)*22,Y+Math.sin(m)*12);G.stroke();G.beginPath();G.moveTo(X,Y);G.lineTo(X+Math.cos(h-1.6)*13,Y+Math.sin(h-1.6)*7);G.stroke();px('#1b1220',X-2,Y-2,4,4);};
  K.A.w10_footbridge=function(t,X,Y,w){px('#1b1220',X-1,Y-5,w+2,11);px('#a8692e',X,Y-4,w,9);for(let i=0;i<w;i+=3)px('#6f4a26',X+i,Y-4,1,9);px('#f4f1e8',X,Y-6,w,1);px('#f4f1e8',X,Y+5,w,1);};
  K.A.w10_neon=function(t,X,Y,n,c){for(let i=0;i<n;i++){const on=Math.floor(t/260+i*0.7)%3!==0;px(on?c[i%c.length]:'#3a1a50',X+i*5,Y,3,2);}};
  K.A.w10_glitch=function(t,X,Y){/* the one tiny hint of what's coming */const f=Math.floor(t/170);const c=f%2?'#00ffd0':'#ff3df0';px(c,X,Y-1,1,3);px(c,X-1,Y,3,1);if(f%7===3){px('#00ffd0',X+3,Y+2,4,1);px('#ff3df0',X-5,Y+3,3,1);}};

  /* ---------- the world ---------- */
  K.W.push({n:10,hud:'NIAGARA FALLS',name:'Kinan vs. Mom',
    where:'The last normal world: a birthday trip to Niagara Falls. The tour boat from Montreal sails down the upper river and splashes right over the Horseshoe into the gorge, lands Kinan at Clifton Hill, then he rides the boat into the spray, walks behind the Horseshoe, climbs the observation tower, crosses the whirlpool by cable car and faces Mom at the birthday party on Goat Island.',
    marks:'The Horseshoe Falls and the American Falls, the Niagara gorge, the tour boat, Table Rock, Clifton Hill with its neon arcades and Ferris wheel, the observation tower and its yellow outside elevators, the Rainbow Bridge, the Butterfly Conservatory, the whirlpool cable car, the Floral Clock, the Niagara Parkway and a birthday party on Goat Island.',
    size:[1000,540],ground:'grass',water:'w10_niagara',cliff:'rock',path:'tan',
    rivers:[
      {pts:[[1020,156],[960,150],[900,152],[846,164]],w:26},                        /* upper river, to the Horseshoe */
      {pts:[[946,146],[910,108],[862,70],[790,54],[728,66],[690,95],[676,140],[672,196]],w:12},/* American channel, around Goat Island */
      {pts:[[795,210],[730,222],[665,220],[600,224],[540,232],[480,246],[430,262]],w:20},/* the gorge */
      {pts:[[380,256],[320,228],[240,210],[140,200],[-20,204]],w:18}],             /* lower river, on to the lake */
    lakes:[[800,172,52,18],[795,205,54,28],[672,192,22,10],[400,272,42,30]],      /* above the brink, the plunge basin, American brink, the whirlpool */
    zones:[
      {k:'paved',e:[630,340,66,62]},
      {k:'paved',r:[330,0,200,182]},
      {k:'w10_vines',f:(X,Y)=>Y>462&&X<400},
      {k:'forest',f:(X,Y,w)=>Y>186&&w.rd(X,Y)<36-Math.max(0,X-380)*0.32+Math.sin(X/13+Y/9)*3},
      {k:'w10_lawn',f:(X,Y)=>(X>690&&X<860&&Y>60&&Y<160)||(X>650&&X<860&&Y>235&&Y<262)},
      {k:'forest',f:(X,Y,w)=>X<330&&Y<200}],
    roads:[
      [[-10,345],[200,338],[330,330],[400,322],[445,306],[490,290],[560,278],[640,272],[720,272],[790,268],[840,250],[870,214],[906,198],[950,200],[1010,222]], /* the Niagara Parkway, up along the river above the falls */
      [[640,272],[636,340],[632,410]],                                                    /* Clifton Hill */
      [[1010,418],[880,414],[760,410],[632,410],[520,414],[420,422],[300,426],[150,422],[-10,418]], /* Victoria Ave */
      [[540,281],[540,140],[540,-10]],                                                    /* over the Rainbow Bridge */
      [[-10,96],[540,96]]],                                                               /* the American side */
    bridges:[[540,232,'arches']],
    J:{V1:[852,413]},
    /* one journey: the tour boat from Montreal comes down the upper river from the right edge, over the Horseshoe and down the gorge to Clifton Hill. No exit: World 10 to 11 is the glitch at the castle. */
    entryPath:{from:[1000,154],via:[[940,150],[880,156],[836,170],[812,188],[790,206],[740,220],[680,222],[620,226],[598,244],[606,264],[622,284]],style:'glass'},
    stops:[
      {at:[639,294],name:'10-1  CLIFTON HILL LIGHTS',st:'open'},
      {at:[712,272],name:'10-2  THE BOAT UNDER THE FALLS',st:'lock'},
      {at:[868,212],name:'10-3  BEHIND THE FALLS',st:'lock'},
      {at:[852,386],name:'10-4  THE OBSERVATION TOWER',st:'lock'},
      {at:[740,410],name:'10-5  THE BUTTERFLY CONSERVATORY',st:'lock'},
      {at:[520,414],name:"FORT  THE GRANDMOTHERS' PICNIC",st:'fort'},
      {at:[450,305],name:'10-6  THE WHIRLPOOL CABLE CAR',st:'lock'},
      {at:[360,300],name:'SECRET  THE FIREWORKS BARGE',st:'secret'},
      {at:[505,287],name:'10-7  THE FLORAL CLOCK',st:'lock'},
      {at:[540,165],name:'10-8  THE MIRROR MAZE',st:'lock'},
      {at:[742,140],name:'CASTLE  THE BIRTHDAY PARTY AT THE FALLS  -  MOM',st:'boss'}],
    edges:[
      [0,1,[[640,272]],{road:1}],
      [1,2,[[720,272],[790,268],[840,250]],{road:1}],
      [2,3,[[884,246],[888,300],[866,356]]],
      [3,'V1'],
      ['V1',4,[[760,410]],{road:1}],
      [4,5,[[632,410]],{road:1}],
      [5,6,[[478,372],[458,336]]],
      [6,7],
      [6,8,[[490,290]],{road:1}],
      [8,9,[[540,281],[540,200]],{road:1}],
      [9,10,[[566,166],[602,164],[634,148],[662,137],[700,134]]]],   /* low along the back of the Mirror Maze, so Kinan is hidden behind it */
    exit:[830,110],
    gate:[633,134],   /* the WORLD 11 COMING SOON sign: on the grass by the bridge, clear of the party scene (v53 review) */
    props:[
      ['w10_tower',820,390],
      ['w10_hotel',912,402,24,96,'#c8b89a'],['w10_hotel',940,396,26,118,'#9ab0c8'],['w10_hotel',970,404,22,84,'#d8c8a8'],
      ['w10_tableRock',904,236],['w10_tunnel',856,226],
      ['w10_dock',700,266],
      ['w10_arcade',650,306,36,'#e8364b','ARCADE','#f6c445'],['w10_arcade',650,346,40,'#2a5bd7','FUN HOUSE','#00ffd0'],['w10_arcade',650,388,38,'#44c55a','MINI GOLF','#ff3df0'],
      ['w10_arcade',696,330,34,'#f6c445','CANDY','#ff3df0'],['w10_arcade',696,372,40,'#ff6fae','WAX SHOW','#ffffff'],
      ['w10_haunted',584,398],
      ['w10_conservatory',708,470],['w10_picnic',490,470],['w10_floralClock',530,336],
      ['w10_barge',372,288],
      ['w10_prospect',626,206],
      ['w10_party',792,122],
      ['w10_usBlock',350,90,26,70,'#c8b89a'],['w10_usBlock',382,86,22,52,'#9aa3b2'],['w10_usBlock',420,90,30,84,'#b8a8c8'],['w10_usBlock',460,88,24,60,'#d8c8a8'],['w10_usBlock',490,90,20,44,'#9ab0c8'],
      ['w10_usBlock',360,170,30,40,'#d8c8a8'],['w10_usBlock',400,172,24,52,'#c8b89a'],['w10_usBlock',440,170,28,36,'#9aa3b2'],['w10_usBlock',478,168,26,58,'#b8a8c8'],
      ['w10_sign',928,112,'WELCOME TO','NIAGARA FALLS'],['w10_fallsSign',800,150,'HORSESHOE FALLS'],['w10_fallsSign',700,192,'AMERICAN FALLS'],['w10_fallsSign',540,250,'RAINBOW BRIDGE'],
      ['w10_fallsSign',405,318,'WHIRLPOOL CABLE CAR'],['w10_fallsSign',600,350,'CLIFTON HILL'],['w10_fallsSign',250,330,'NIAGARA PARKWAY'],
      ['w10_fallsSign',160,250,'CANADA'],['w10_fallsSign',160,176,'USA'],
      ...K.homes([[40,470,'#e8364b'],[150,520,'#2a5bd7'],[260,520,'#44c55a'],[620,470,'#8a5426'],[590,522,'#e8364b'],[660,520,'#2a5bd7'],[860,470,'#44c55a'],[900,520,'#e8364b'],[960,480,'#8a5426'],[820,524,'#2a5bd7'],[470,526,'#8a5426'],[40,520,'#44c55a'],
        [30,60,'#2a5bd7'],[90,40,'#e8364b'],[150,70,'#8a5426'],[210,40,'#44c55a'],[260,70,'#e8364b'],[40,150,'#8a5426'],[110,150,'#2a5bd7'],[200,160,'#e8364b']])],
    overProps:[['w10_mirrorMaze',560,172]],
    scatter:[{k:'tree',n:110,zone:'forest'},{k:'tree',n:60,zone:'grass'},{k:'w10_flowers',n:26,zone:'w10_lawn'},{k:'tree',n:10,zone:'w10_lawn'},{k:'bush',n:14,zone:'grass'}],
    anim:[
      ['w10_flow',[[1010,155],[960,150],[900,152],[840,166]],14],['w10_flow',[[930,128],[908,106],[862,70],[790,54],[728,66],[694,100],[680,150],[674,186]],7],['w10_horseshoe',748,846,192,16,16],['w10_horseshoe',651,693,186,0,18],
      ['w10_boat',744,224,0],['w10_boat',688,240,1],
      ['w10_mist',797,206,90],['w10_mist',672,202,22],['rainbow',792,262,24],
      ['w10_swirl',400,272,42,30],['w10_cablecar',450,305,360,300],['w10_fireworks',390,262],
      ['w10_lifts',820,390],['ferris',590,314,18],['w10_butterflies',740,470],['w10_clockHands',530,336],
      ['w10_neon',652,306,7,['#ff3df0','#00ffd0','#f6c445']],['w10_neon',698,330,6,['#f6c445','#ff6fae']],['w10_neon',652,388,7,['#00ffd0','#ff3df0']],
      ['w10_footbridge',662,136,30],
      ['canflag',556,252],
      ['balloon',732,84,'#e8364b'],['balloon',744,78,'#f6c445'],['balloon',838,84,'#2a5bd7'],['balloon',850,92,'#ff6fae'],['candle',789,72],['candle',798,72],
      ['w10_glitch',748,170]]});
})(KINAN);

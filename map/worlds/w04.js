/* World 4: Edmonton Homecoming (Kinan vs. Chenoa) */
(function(K){
  const {px,box,shadow,txt,hash}=K; const g=()=>K.g(); const P=K.P, A=K.A;
  const O='#1b1220';
  const DY=100;   /* the old layout sits DY px lower so Highway 63 from World 3 has room at the top (see sp/sl below) */
  const line=(c,w,pts)=>{const G=g();G.strokeStyle=c;G.lineWidth=w;G.lineCap='round';G.lineJoin='round';G.beginPath();pts.forEach(([a,b],i)=>i?G.lineTo(a,b):G.moveTo(a,b));G.stroke();};
  const tri=(c,pts)=>{const G=g();G.fillStyle=c;G.beginPath();pts.forEach(([a,b],i)=>i?G.lineTo(a,b):G.moveTo(a,b));G.closePath();G.fill();};
  /* a glass barrel vault: x,w = left/width, yb = bottom, yt = top of the arch */
  const vault=(x,w,yb,yt,glass,rib,inner)=>{const G=g();const ys=yt+w*0.28;
    const shape=(o)=>{G.beginPath();G.moveTo(x-o,yb+o);G.lineTo(x-o,ys);G.ellipse(x+w/2,ys,w/2+o,ys-yt+o,0,Math.PI,0);G.lineTo(x+w+o,yb+o);G.closePath();};
    G.fillStyle=O;shape(1);G.fill();G.fillStyle=glass;shape(0);G.fill();
    G.save();shape(0);G.clip();if(inner)inner();G.fillStyle=rib;for(let i=x+5;i<x+w;i+=7)G.fillRect(i,yt-2,1,yb-yt+2);for(let j=ys-6;j>yt-4;j-=6)G.fillRect(x,j,w,1);G.fillStyle='rgba(255,255,255,.45)';G.fillRect(x+3,yt,3,yb-yt);G.restore();};

  /* parking-lot asphalt with white stall lines, a lawn that trees stay off, and a dirt job site */
  K.GROUND.w04_lot=(X,Y)=>{const r=((Y-190-DY)%18+18)%18;if(r===0)return '#e8e6dc';if(r<12&&X%10===0)return '#e8e6dc';return hash(X>>1,Y>>1)>.97?'#7a7e88':'#8a8e98';};
  K.RIM.w04_lot='#b4b8c0';K.LINE.w04_lot='#4a4e58';
  K.GROUND.w04_lawn=K.GROUND.grass;K.RIM.w04_lawn=K.RIM.grass;K.LINE.w04_lawn=K.LINE.grass;
  K.GROUND.w04_site=(X,Y)=>{const h=hash(X>>1,Y>>1);return h>.96?'#9a6a3a':h>.9?'#b8854c':'#c4925a';};
  K.RIM.w04_site='#e7c98a';K.LINE.w04_site='#5e3b20';
  K.GROUND.w04_snow=K.GROUND.snow;K.RIM.w04_snow='#ffffff';K.LINE.w04_snow='#7d86a8';

  /* ---------------- WEST EDMONTON MALL ---------------- */
  P.w04_wem=function(X,Y){const G=g();const W=210;
    shadow(X+W/2+12,Y+3,W/2+20,7);
    /* the long low roof, seen from above, with its glass skylight barrel */
    box('#d6cfbd',X,Y-90,W,64);px('#c2baa6',X,Y-34,W,8);for(let i=X+4;i<X+W;i+=16)px('#c8c0ac',i,Y-88,1,52);
    box('#8fd0f0',X+4,Y-70,W-8,12);px('#e0f6ff',X+4,Y-70,W-8,3);for(let i=X+8;i<X+W-4;i+=6)px('#5a9cc4',i,Y-67,1,9);
    /* ICE RINK (west end), seen through a big skylight */
    box('#6f8aa8',X+5,Y-86,42,28);
    G.fillStyle=O;G.beginPath();G.roundRect(X+8,Y-83,36,22,8);G.fill();G.fillStyle='#ffffff';G.beginPath();G.roundRect(X+9,Y-82,34,20,7);G.fill();
    px('#e8364b',X+26,Y-82,1,20);px('#2a5bd7',X+18,Y-82,1,20);px('#2a5bd7',X+34,Y-82,1,20);
    G.strokeStyle='#e8364b';G.lineWidth=1;G.beginPath();G.arc(X+26.5,Y-72,3.5,0,Math.PI*2);G.stroke();
    /* (the skaters on the ice are animated: A.w04_skaters) */
    /* THE THEME PARK: glass vault with the red triple-loop coaster poking out of it */
    const ga=X+54,gw=70;
    vault(ga,gw,Y-28,Y-96,'#d6f0fb','#a8d6ec');
    for(let i=0;i<6;i++)px(O,ga+8+i*11,Y-56,1,26);
    line(O,5,[[ga+2,Y-30],[ga+12,Y-104],[ga+18,Y-104],[ga+24,Y-44]]);line('#e8364b',3,[[ga+2,Y-30],[ga+12,Y-104],[ga+18,Y-104],[ga+24,Y-44]]);
    [[ga+30,Y-58],[ga+44,Y-62],[ga+58,Y-58]].forEach(([a,b])=>{G.strokeStyle=O;G.lineWidth=5;G.beginPath();G.arc(a,b,12,0,Math.PI*2);G.stroke();G.strokeStyle='#e8364b';G.lineWidth=3;G.beginPath();G.arc(a,b,12,0,Math.PI*2);G.stroke();});
    line(O,5,[[ga+24,Y-46],[ga+66,Y-46],[ga+72,Y-36]]);line('#e8364b',3,[[ga+24,Y-46],[ga+66,Y-46],[ga+72,Y-36]]);
    /* THE WATERPARK: big glass vault, wave pool and beach inside, coloured slides outside */
    const wx=X+130,ww=74;
    vault(wx,ww,Y-28,Y-114,'#cfeefc','#9cd0ea',()=>{px('#2f8ae0',wx,Y-62,ww,34);for(let k=0;k<6;k++)for(let i=0;i<ww;i+=8)px('#ffffff',wx+i+(k%2)*4,Y-60+k*5,4,1);px('#f4dca8',wx,Y-66,ww,6);px('#e0c080',wx,Y-62,ww,1);
      px('#8a5a32',wx+12,Y-90,3,26);[[-8,-92],[2,-94],[-5,-97],[4,-90]].forEach(([a,b])=>px('#3f9636',wx+12+a,Y+b,8,3));px('#8a5a32',wx+58,Y-86,3,22);[[-7,-88],[2,-90],[-4,-92]].forEach(([a,b])=>px('#3f9636',wx+58+a,Y+b,8,3));
      px('#f6c445',wx+30,Y-76,10,2);px('#e8364b',wx+44,Y-72,3,6);px('#ffffff',wx+44,Y-74,3,2);});
    /* slide tower and tubes outside the east end */
    const tx=X+W+4;
    [[tx-2,Y-118,tx+26,Y-4,'#e8364b'],[tx-2,Y-104,tx+30,Y-30,'#f6c445'],[tx-2,Y-92,tx+20,Y-50,'#44c55a'],[tx-2,Y-112,tx+12,Y-12,'#2a5bd7']].forEach(([a,b,c,d,col],i)=>{
      const pts=[];for(let k=0;k<=20;k++){const u=k/20;pts.push([a+(c-a)*u+Math.sin(u*Math.PI*2.2+i)*9,b+(d-b)*u]);}line(O,6,pts);line(col,4,pts);line('rgba(255,255,255,.6)',1,pts);});
    box('#9aa3b2',tx,Y-124,8,124);for(let yy=Y-120;yy<Y;yy+=8)px('#4a5160',tx,yy,8,1);box('#e8364b',tx-3,Y-128,14,5);
    /* the splash pool the slides drop into */
    G.fillStyle=O;G.beginPath();G.roundRect(tx+9,Y-11,26,11,4);G.fill();G.fillStyle='#2f8ae0';G.beginPath();G.roundRect(tx+10,Y-10,24,9,3);G.fill();px('#7fc4ff',tx+12,Y-9,20,1);
    /* the front: one long wall of shops and entrances */
    box('#efe6cf',X,Y-26,W,26);px('#3f63a8',X,Y-26,W,5);px('#7fa0e0',X,Y-26,W,1);
    for(let i=0;i<19;i++)box('#7ec8ff',X+6+i*11,Y-17,7,6);
    [[24,'#e8364b'],[98,'#f6c445'],[172,'#44c55a']].forEach(([a,c])=>{box(c,X+a-5,Y-22,24,5);box('#2b2f45',X+a,Y-15,14,15);px('#cfeeff',X+a+2,Y-13,4,13);px('#cfeeff',X+a+8,Y-13,4,13);});
    P.label(X+W/2+66,Y+4,'WEST EDMONTON MALL');
    P.label(X+26,Y-36,'ICE RINK');P.label(ga+gw/2,Y-36,'THEME PARK');P.label(wx+ww/2,Y-36,'WATERPARK');};
  P.w04_cars=function(X,Y,n,dx){for(let i=0;i<n;i++){const c=['#e8364b','#2a5bd7','#f4f1e8','#44c55a','#f6c445','#3b3f4a'][Math.floor(hash(X+i,Y)*6)];if(hash(i,X+Y)>.82)continue;const x0=X+i*(dx||10);box(c,x0,Y-6,7,6);px('#cfeeff',x0+1,Y-5,5,2);}};
  A.w04_coaster=function(t,X,Y){const u=(t/3200)%1;const ga=X;let a,b;
    if(u<0.25){const k=u/0.25;a=ga+2+10*k;b=Y-30-74*k;}else if(u<0.4){const k=(u-0.25)/0.15;a=ga+18+6*k;b=Y-104+60*k;}
    else if(u<0.85){const k=(u-0.4)/0.45;const L=Math.floor(k*3),f=k*3-L;const cx=ga+30+L*14,cy=L===1?Y-62:Y-58;a=cx+Math.sin(f*Math.PI*2)*12;b=cy+Math.cos(f*Math.PI*2)*12;}
    else{const k=(u-0.85)/0.15;a=ga+66+6*k;b=Y-46+10*k;}box('#f6c445',a-3,b-3,6,4);};

  /* ---- the mall comes alive: skaters, the wave pool, swimmers, slide riders, shoppers, cars and a blinking sign ---- */
  const SUIT=['#e8364b','#2a5bd7','#f6c445','#44c55a','#ff6fae','#ff8a3d'],SKIN=['#f1c8a0','#d9a27a','#a8703c','#7a4a2a'];
  /* a tiny person standing on (x,y): head, shirt, legs that scissor while walking */
  const guy=(x,y,i,step)=>{x=Math.round(x);y=Math.round(y);px(SKIN[i%4],x,y-5,2,2);px(SUIT[i%6],x,y-3,2,2);if(step){px('#2b2f45',x-1,y-1,1,1);px('#2b2f45',x+2,y-1,1,1);}else px('#2b2f45',x,y-1,2,1);};
  A.w04_skaters=function(t,X,Y){const cx=X+25,cy=Y-70;
    for(let i=0;i<5;i++){const a=t/(1500+i*90)+i*1.26,r=11-(i%2)*3;guy(cx+Math.cos(a)*r*1.1,cy+Math.sin(a)*r*0.42+1,i+1,Math.floor(t/220+i)%2);}};
  A.w04_pool=function(t,X,Y){const G=g();const wx=X+130,ww=74,top=Y-60,bot=Y-29;
    G.save();G.beginPath();G.rect(wx,top,ww,bot-top+1);G.clip();
    px('#2f8ae0',wx,top,ww,bot-top+1);
    /* the wave pool: rows of waves roll from the front up to the beach */
    for(let k=0;k<5;k++){const yy=Math.round(bot-((t/95+k*6.4)%32));if(yy<top+1)continue;px('#5aa8f0',wx,yy+1,ww,1);
      for(let i=-8;i<ww;i+=9)px('#ffffff',wx+i+Math.round(Math.sin(t/420+k*2+i)*2)+(k%2)*4,yy,5,1);}
    for(let i=0;i<ww;i+=3)if(Math.sin(t/170+i*1.7)>0.1)px('#ffffff',wx+i,top,2,1);
    /* swimmers bobbing, two of them in tubes */
    [[12,9,0],[28,17,1],[46,7,2],[60,21,3],[20,25,4],[40,27,5],[66,12,6]].forEach(([a,b,i])=>{const sx=Math.round(wx+a+Math.sin(t/2300+i*1.7)*5),sy=Math.round(top+b+Math.sin(t/600+i)*1.2);
      if(i===2||i===5){px(O,sx-3,sy-1,8,4);px(SUIT[i],sx-2,sy,6,2);}else{px('#ffffff',sx-2,sy+1,1,1);px('#ffffff',sx+3,sy+1,1,1);}
      px(SKIN[i%4],sx,sy-2,2,2);px('#4a2c1a',sx,sy-2,2,1);});
    G.restore();
    for(let i=wx+5;i<wx+ww;i+=7)px('#9cd0ea',i,top,1,bot-top+1);px('rgba(255,255,255,.45)',wx+3,top,3,bot-top+1);
    /* someone strolling on the beach */
    const u=(Math.sin(t/3000)+1)/2;guy(wx+20+u*30,Y-61,3,Math.floor(t/200)%2);};
  A.w04_sliders=function(t,X,Y){const tx=X+214;
    const tubes=[[tx-2,Y-118,tx+26,Y-4,0],[tx-2,Y-112,tx+12,Y-12,3]];
    tubes.forEach(([a,b,c,d,i],n)=>{const T=5000,ms=(t+n*2500)%T;
      if(ms<2400){const k=ms/2400;guy(tx+3,Y-2-k*(Y-2-(b+4)),n+2,Math.floor(ms/180)%2);return;}      // climbing the tower stairs
      if(ms<3700){const u=Math.pow((ms-2400)/1300,1.5);const x=a+(c-a)*u+Math.sin(u*Math.PI*2.2+i)*9,y=b+(d-b)*u;      // whoosh down the tube
        px(O,x-2,y-3,5,5);px(SKIN[n+1],x-1,y-2,3,2);px(SUIT[n+2],x-1,y,3,1);return;}
      if(ms<4400){const k=(ms-3700)/700;for(let j=0;j<6;j++){const h=Math.sin(k*Math.PI)*(3+(j%3)*2);px('#ffffff',c-5+j*2,d-2-h,1,1);px('#cfeeff',c-4+j*2,d-1-h*0.5,1,1);}}});};   // splash!
  A.w04_shoppers=function(t,X,Y){const doors=[X+31,X+105,X+179];
    [[44,0,1],[100,1,1],[120,1,0],[196,2,1],[80,0,0],[238,2,1],[58,0,1],[168,1,0]].forEach(([sx,d,inn],i)=>{const T=5200+i*610,u=((t+i*1900)%T)/T;if(u>0.62)return;let k=u/0.62;if(!inn)k=1-k;
      guy(sx+(doors[d]-sx)*k-1,Y+16-15*k,i,Math.floor(t/170+i)%2);});};
  /* cars cruise the lane in front of the doors, from the ring road to 170 St; the blue one stops to drop someone off */
  A.w04_lotcars=function(t,X,Y){const G=g();[[0,'#2a5bd7',1],[0.5,'#f4f1e8',0]].forEach(([o,c,drop])=>{const u=((t/17000)+o)%1;
      const x0=X-14,x1=X+258,stop=X+90;let x,held=0;
      if(!drop)x=x0+(x1-x0)*u;else if(u<0.42)x=x0+(stop-x0)*(u/0.42);else if(u<0.6){x=stop;held=(u-0.42)/0.18;}else x=stop+(x1-stop)*((u-0.6)/0.4);
      const y=Y+9;G.globalAlpha=Math.max(0,Math.min(1,(x-x0)/10,(x1-x)/10));
      box(c,x,y-5,11,5);px('#cfeeff',x+7,y-4,3,3);px('#1b1220',x+1,y,3,1);px('#1b1220',x+7,y,3,1);G.globalAlpha=1;
      if(held>0.2&&held<0.95){const k=(held-0.2)/0.75;guy(x+4+(X+104-x-4)*k,y-2-6*k,5,Math.floor(t/170)%2);}});};
  /* the big WEM pylon sign at the corner of the lot */
  P.w04_pylon=function(X,Y){const G=g();shadow(X,Y+1,8,2);px(O,X-2,Y-18,5,18);px('#9aa3b2',X-1,Y-18,3,18);
    box('#2b2f45',X-13,Y-32,26,14);px('#3f63a8',X-12,Y-31,24,1);
    const tw=K.textW('WEM',8);txt('WEM',X-tw/2,Y-30,'#ffe58a',8,1);};
  A.w04_pylonBulbs=function(t,X,Y){const on=Math.floor(t/140),pts=[];
    for(let i=X-13;i<X+13;i+=2)pts.push([i,Y-33]);for(let j=Y-33;j<Y-18;j+=2)pts.push([X+13,j]);for(let i=X+13;i>X-13;i-=2)pts.push([i,Y-18]);for(let j=Y-18;j>Y-33;j-=2)pts.push([X-14,j]);
    pts.forEach(([a,b],i)=>px((i+on)%3===0?'#ffffff':(i+on)%3===1?'#f6c445':'#8a5a20',a,b,1,1));};

  /* ---------------- SHAD'S JOB SITE (a real construction site) ---------------- */
  P.w04_jobsite=function(X,Y){const G=g();const W=150,D=116;
    /* fence: back and sides */
    for(let x=X;x<=X+W;x+=8){px(O,x,Y-D-8,1,9);}px('#9aa3b2',X,Y-D-6,W,1);px('#9aa3b2',X,Y-D-2,W,1);
    for(let y=Y-D;y<=Y;y+=8){px(O,X,y-6,1,7);px(O,X+W,y-6,1,7);}px('#9aa3b2',X+1,Y-D,1,D);px('#9aa3b2',X+W+1,Y-D,1,D);
    /* site office trailer (back right) */
    box('#f4f1e8',X+96,Y-104,48,14);px('#2a5bd7',X+96,Y-104,48,2);for(let i=0;i<4;i++)box('#7ec8ff',X+100+i*11,Y-100,6,5);px(O,X+100,Y-90,4,3);px(O,X+136,Y-90,4,3);
    /* the building going up: concrete slabs + columns, formwork and rebar on top, scaffolding */
    const bx=X+10,bw=62;
    box('#a8a296',bx-3,Y-46,bw+6,6);
    for(let f=0;f<3;f++){const fy=Y-46-f*18;for(let c=0;c<=bw-4;c+=19)box('#c9c4b8',bx+c,fy-16,4,16);px('#6b6f7a',bx,fy-16,bw,1);
      if(f<2){box('#b4ae9f',bx-3,fy-20,bw+6,4);px('#d8d2c4',bx-3,fy-20,bw+6,1);}}
    /* top floor: plywood wall forms with walers + rebar sticking up */
    for(let i=0;i<5;i++){box('#d8a860',bx+i*12,Y-104,11,12);px('#8a5a2a',bx+i*12,Y-100,11,1);px('#8a5a2a',bx+i*12,Y-96,11,1);px('#5e3b20',bx+i*12+3,Y-102,1,1);px('#5e3b20',bx+i*12+8,Y-98,1,1);}
    for(let i=2;i<bw;i+=4)px('#7a4a2a',bx+i,Y-112,1,8);
    /* scaffolding on the right face */
    for(let yy=Y-100;yy<=Y-46;yy+=9){px('#2a5bd7',bx+bw+2,yy,12,2);px('#f6c445',bx+bw+2,yy-1,12,1);}
    px('#2a5bd7',bx+bw+2,Y-102,2,56);px('#2a5bd7',bx+bw+12,Y-102,2,56);
    for(let yy=Y-100;yy<Y-46;yy+=9)for(let k=0;k<9;k++)px('#5a85f0',bx+bw+3+k,yy+k,1,1);
    /* tower crane */
    const mx=X+84,mb=Y-58,mt=Y-186;
    box('#9a968c',mx-6,mb-3,20,6);
    px(O,mx-1,mt,10,mb-mt);px('#f6c445',mx,mt,8,mb-mt);for(let y=mt;y<mb;y+=8)for(let k=0;k<8;k++)px(O,mx+k,y+k,1,1);px('#c99a20',mx+6,mt,2,mb-mt);
    /* (the jib, hook and load swing round: A.w04_crane) */
    /* excavator digging a trench, with its pile of dug-out dirt (the arm digs: A.w04_digger) */
    G.fillStyle='#6f4a26';G.beginPath();G.ellipse(X+132,Y-30,18,7,0,0,Math.PI*2);G.fill();G.fillStyle='#4a3020';G.beginPath();G.ellipse(X+132,Y-29,14,4,0,0,Math.PI*2);G.fill();
    G.fillStyle=O;G.beginPath();G.ellipse(X+143,Y-36,9,5,0,Math.PI,0);G.fill();G.fillStyle='#8a5a32';G.beginPath();G.ellipse(X+143,Y-36,8,4,0,Math.PI,0);G.fill();px('#a8763c',X+139,Y-39,5,1);px('#6f4a26',X+136,Y-37,14,1);
    px(O,X+94,Y-26,28,7);px('#4a4f57',X+95,Y-25,26,5);for(let i=0;i<26;i+=3)px('#2b2f45',X+95+i,Y-25,1,5);
    box('#f6c445',X+96,Y-36,22,10);px('#ffe58a',X+96,Y-36,22,2);box('#f6c445',X+97,Y-46,10,10);box('#cfeeff',X+99,Y-44,6,5);px(O,X+112,Y-40,6,4);
    /* concrete wall forms: plywood panels, walers, snap ties, braces */
    for(let i=0;i<3;i++){box('#d8a860',X+56+i*11,Y-24,10,13);px('#6f4a26',X+56+i*11,Y-20,10,1);px('#6f4a26',X+56+i*11,Y-15,10,1);px('#3b2618',X+59+i*11,Y-22,1,1);px('#3b2618',X+63+i*11,Y-17,1,1);}
    line('#8a5a2a',1,[[X+58,Y-22],[X+52,Y-11]]);line('#8a5a2a',1,[[X+86,Y-22],[X+90,Y-11]]);
    /* lumber piles (with stickers between the layers) and a plywood stack */
    for(let r=0;r<4;r++){box('#e8c088',X+8,Y-12-r*4,28,3);px('#a8763c',X+8,Y-12-r*4,1,3);px('#a8763c',X+35,Y-12-r*4,1,3);px('#6f4a26',X+14,Y-9-r*4,2,1);px('#6f4a26',X+28,Y-9-r*4,2,1);}
    for(let r=0;r<3;r++){box('#dcb070',X+40,Y-8-r*3,14,2);}
    /* porta-potty */
    box('#2a5bd7',X+140,Y-22,10,16);px('#ffffff',X+139,Y-24,12,3);px(O,X+144,Y-19,1,12);px('#cfeeff',X+141,Y-20,2,2);px('#f6c445',X+146,Y-14,2,1);
    /* hard hat sign */
    box('#f6c445',X+4,Y-30,12,8);px(O,X+9,Y-22,1,6);px('#e8364b',X+7,Y-28,6,2);
    /* the front fence: chain-link panels with a gate */
    for(let x=X;x<=X+W;x+=10){if(x>X+112&&x<X+136)continue;px(O,x,Y-10,1,11);}
    for(let x=X;x<X+W;x++){if(x>X+113&&x<X+136)continue;if((x+Y)%4===0){px('#b4bcc8',x,Y-8,1,1);px('#b4bcc8',x,Y-4,1,1);}if((x+Y)%4===2)px('#b4bcc8',x,Y-6,1,1);}
    px('#9aa3b2',X,Y-10,113,1);px('#9aa3b2',X+136,Y-10,W-136,1);box('#e8364b',X+30,Y-8,18,5);px('#ffffff',X+32,Y-6,14,1);
    P.label(X+W/2,Y-D-34,"SHAD'S JOB SITE");};
  /* the tower crane slews: the jib swings round past the front (it shortens and dips as it points at us) from the street side to over the building and back, the lumber load swaying behind */
  A.w04_crane=function(t,X,Y){const mx=X+84,mt=Y-186,cx=mx+4,jy=mt-4,L=80,Lc=46,T=18000;
    const ease=k=>k<=0?0:k>=1?1:k*k*(3-2*k);
    const ang=tt=>{const u=(((tt%T)+T)%T)/T;return u<0.1?0:u<0.4?Math.PI*ease((u-0.1)/0.3):u<0.6?Math.PI:u<0.9?Math.PI*(1-ease((u-0.6)/0.3)):0;};
    const pt=(a,f)=>[cx+L*f*Math.cos(a),jy+9*f*Math.sin(a)];
    const a=ang(t),c=Math.cos(a),s=Math.sin(a),tip=pt(a,1),ct=[cx-Lc*c,jy-5*s];
    line(O,7,[[cx,jy],ct]);line('#c99a20',5,[[cx,jy],ct]);box('#8a8e98',ct[0]-7,ct[1]-3,14,10);px('#6b6f7a',ct[0]-7,ct[1]+2,14,1);
    px(O,cx-6,mt-2,12,4);px('#4a5160',cx-5,mt-1,10,2);
    tri(O,[[cx-5,mt-1],[cx,mt-16],[cx+5,mt-1]]);tri('#f6c445',[[cx-3,mt-2],[cx,mt-13],[cx+3,mt-2]]);
    line('#6b6f7a',1,[[cx,mt-15],tip]);line('#6b6f7a',1,[[cx,mt-15],ct]);
    box('#f4f1e8',Math.round(cx+7*c-4),mt+1,9,8);px('#7ec8ff',Math.round(cx+7*c-2),mt+3,5,3);
    const wd=7+Math.round(s*3);line(O,wd,[[cx,jy],tip]);line('#f6c445',wd-2,[[cx,jy],tip]);
    const len=Math.hypot(tip[0]-cx,tip[1]-jy);for(let d=4;d<len-2;d+=5){const k=d/len;px(O,cx+(tip[0]-cx)*k,jy+(tip[1]-jy)*k-1+((d/5|0)%2)*2,1,1);}
    if(s>0.55){const e=Math.round(5+s*4);box('#f6c445',tip[0]-e/2,tip[1]-e/2,e,e);line(O,1,[[tip[0]-e/2,tip[1]-e/2],[tip[0]+e/2,tip[1]+e/2]]);line(O,1,[[tip[0]+e/2,tip[1]-e/2],[tip[0]-e/2,tip[1]+e/2]]);}
    const tr=pt(a,0.72),tp=pt(ang(t-260),0.72),sway=Math.max(-6,Math.min(6,(tp[0]-tr[0])*1.4))+Math.sin(t/800)*1.2;
    box('#4a5160',tr[0]-4,tr[1]+2,8,3);
    const h=Math.max(4,18+Math.round(Math.sin(t/1700)*3-14*Math.max(0,-c))),hx=Math.round(tr[0]+sway),hy=Math.round(tr[1]+5+h);
    line(O,1,[[tr[0],tr[1]+5],[hx,hy]]);px(O,hx-1,hy,3,3);line(O,1,[[hx,hy+2],[hx-8,hy+7]]);line(O,1,[[hx,hy+2],[hx+8,hy+7]]);
    for(let r=0;r<3;r++)box('#e8c088',hx-9,hy+7+r*3,18,2);};
  /* the excavator digs: bucket into the trench, scoop, lift, dump on the dirt pile, back down */
  A.w04_digger=function(t,X,Y){const S=[X+116,Y-34],Lb=22,Ls=20,T=5200,D=Math.PI/180;
    const K=[[-50,80],[-53,52],[-80,12],[-70,-18],[-70,-18],[-50,80]],tk=[0,0.2,0.45,0.62,0.76,1];
    const u=(t%T)/T;let i=0;while(i<4&&u>tk[i+1])i++;let f=(u-tk[i])/(tk[i+1]-tk[i]);f=f*f*(3-2*f);
    const a1=(K[i][0]+(K[i+1][0]-K[i][0])*f)*D,a2=(K[i][1]+(K[i+1][1]-K[i][1])*f)*D;
    const E=[S[0]+Lb*Math.cos(a1),S[1]+Lb*Math.sin(a1)],B=[E[0]+Ls*Math.cos(a2),E[1]+Ls*Math.sin(a2)];
    const dumping=u>0.6&&u<0.8,full=u>0.17&&u<=0.6;
    line(O,2,[[X+112,Y-38],[(S[0]+E[0])/2,(S[1]+E[1])/2]]);
    line(O,5,[S,E]);line('#f6c445',3,[S,E]);line(O,4,[E,B]);line('#f6c445',2,[E,B]);px(O,E[0]-1,E[1]-1,3,3);
    const bx=Math.round(B[0]),by=Math.round(B[1]);
    if(dumping){box('#4a4f57',bx-2,by-2,6,4);px('#9aa3b2',bx+3,by-2,1,4);
      const k=(u-0.6)/0.2;for(let j=0;j<6;j++){const q=(k*1.6+j/6)%1;px(j%2?'#6f4a26':'#8a5a32',bx+1+Math.sin(j*2.1)*2,by+2+q*(Y-38-by),2,2);}}
    else{box('#4a4f57',bx-3,by,7,5);px('#9aa3b2',bx-3,by+4,7,1);if(full){px('#6f4a26',bx-3,by-1,7,2);px('#8a5a32',bx-2,by-2,4,1);}}};

  /* ---------------- PRINCESS THEATRE (ornate cream facade + lit marquee) ---------------- */
  P.w04_princess=function(X,Y){const G=g();const W=60;
    shadow(X+W/2,Y+2,W/2+4,4);
    /* raised ornate centre parapet with an arch and finials */
    G.fillStyle=O;G.beginPath();G.moveTo(X+14,Y-50);G.lineTo(X+14,Y-58);G.quadraticCurveTo(X+30,Y-72,X+46,Y-58);G.lineTo(X+46,Y-50);G.fill();
    G.fillStyle='#fbf3e0';G.beginPath();G.moveTo(X+15,Y-50);G.lineTo(X+15,Y-58);G.quadraticCurveTo(X+30,Y-70,X+45,Y-58);G.lineTo(X+45,Y-50);G.fill();
    px('#d8c8a0',X+22,Y-60,16,2);px('#c9a860',X+28,Y-66,4,4);
    [X+2,X+14,X+44,X+56].forEach(a=>{box('#fbf3e0',a,Y-56,3,6);px('#c9a860',a,Y-58,3,2);});
    /* the cream terracotta facade */
    box('#f6eedb',X,Y-50,W,50);px('#d8c8a0',X,Y-50,W,3);for(let i=X+1;i<X+W;i+=4)px('#c8b48a',i,Y-47,2,2);
    [X+2,X+19,X+38,X+55].forEach(a=>{px('#e6d8b8',a,Y-44,3,44);px('#ffffff',a,Y-44,1,44);});
    /* arched upper windows */
    [X+7,X+25,X+43].forEach(a=>{G.fillStyle=O;G.beginPath();G.moveTo(a-1,Y-29);G.lineTo(a-1,Y-38);G.arc(a+5,Y-38,6,Math.PI,0);G.lineTo(a+11,Y-29);G.fill();G.fillStyle='#5a6fa0';G.beginPath();G.moveTo(a,Y-30);G.lineTo(a,Y-38);G.arc(a+5,Y-38,5,Math.PI,0);G.lineTo(a+10,Y-30);G.fill();px('#a8c0e8',a+2,Y-38,2,6);px('#e6d8b8',a+5,Y-42,1,12);});
    /* the big lit PRINCESS marquee */
    px(O,X-5,Y-27,W+10,14);px('#2b2f45',X-4,Y-26,W+8,12);px('#fff3c4',X-1,Y-23,W+2,7);
    const tw=K.textW('PRINCESS',8);txt('PRINCESS',X+W/2-tw/2,Y-24,'#e8364b',8,1);
    px('#e8364b',X-4,Y-14,W+8,2);
    /* entrance doors and poster boxes */
    box('#7d1f33',X+20,Y-11,20,11);px('#cfeeff',X+22,Y-9,4,8);px('#cfeeff',X+28,Y-9,4,8);px('#cfeeff',X+34,Y-9,4,8);box('#f39ac0',X+6,Y-10,7,8);box('#7ec8ff',X+47,Y-10,7,8);
    P.label(X+W/2,Y-90,'PRINCESS THEATRE');};
  A.w04_bulbs=function(t,X,Y,W){const on=Math.floor(t/260);for(let i=0;i<=W+6;i+=3){const k=(i/3+on)%2;px(k?'#ffe58a':'#ffffff',X-3+i,Y-26,1,1);px(k?'#ffffff':'#ffe58a',X-3+i,Y-15,1,1);}for(let j=0;j<10;j+=3){px('#ffe58a',X-4,Y-25+j,1,1);px('#ffe58a',X+W+3,Y-25+j,1,1);}};

  /* ---------------- MUTTART PYRAMIDS ---------------- */
  P.w04_muttart=function(X,Y){const G=g();
    shadow(X+56,Y+2,62,6);box('#d8d2c4',X-2,Y-4,118,5);
    [[22,18],[50,30],[82,28],[104,16]].sort((a,b)=>a[1]-b[1]).forEach(([cx,h])=>{const x=X+cx;
      tri(O,[[x-h-1,Y-3],[x,Y-h-5],[x+h+1,Y-3]]);tri('#cfeefc',[[x-h+1,Y-4],[x,Y-h-3],[x,Y-4]]);tri('#94cce8',[[x,Y-h-3],[x+h-1,Y-4],[x,Y-4]]);
      G.save();G.beginPath();G.moveTo(x-h+1,Y-4);G.lineTo(x,Y-h-3);G.lineTo(x+h-1,Y-4);G.closePath();G.clip();G.strokeStyle='rgba(255,255,255,.75)';G.lineWidth=1;
      for(let k=-h;k<h;k+=5){G.beginPath();G.moveTo(x+k,Y-4);G.lineTo(x+k+h,Y-4-h);G.stroke();G.beginPath();G.moveTo(x+k,Y-4);G.lineTo(x+k-h,Y-4-h);G.stroke();}G.restore();
      px('#ffffff',x-1,Y-h-3,2,3);});
    P.label(X+56,Y+2,'MUTTART PYRAMIDS');};

  /* ---------------- DOWNTOWN: STANTEC TOWER, ROGERS PLACE / ICE DISTRICT ---------------- */
  P.w04_stantec=function(X,Y){const G=g();const W=18,H=150;
    shadow(X+W/2,Y+2,14,4);px(O,X-1,Y-H,W+2,H+1);px('#3d5a86',X,Y-H,W,H);px('#6f92c4',X+2,Y-H,3,H);px('#2c4466',X+W-4,Y-H,4,H);
    for(let i=4;i<H;i+=5)px('#56789f',X,Y-H+i,W,1);for(let i=0;i<H;i+=10)px('#cfe2f6',X+8,Y-H+i,2,5);
    /* the slanted, notched crown */
    tri(O,[[X-1,Y-H],[X+W+1,Y-H-14],[X+W+1,Y-H]]);tri('#5a7cb0',[[X+1,Y-H],[X+W,Y-H-12],[X+W,Y-H]]);px(O,X+W-2,Y-H-26,1,14);
    P.label(X+W/2,Y-H-42,'ICE DISTRICT TOWER');};
  P.w04_rogers=function(X,Y){const G=g();
    shadow(X,Y+3,52,7);
    /* dark glass base */
    px(O,X-47,Y-14,94,15);px('#2b3a5a',X-46,Y-13,92,13);for(let i=-44;i<46;i+=6)px('#5a76a8',X+i,Y-12,2,10);
    /* the swooping silver roof */
    G.fillStyle=O;G.beginPath();G.ellipse(X,Y-18,48,17,0,0,Math.PI*2);G.fill();G.fillStyle='#dfe4ec';G.beginPath();G.ellipse(X,Y-18,47,16,0,0,Math.PI*2);G.fill();
    G.fillStyle='#b8c0cc';G.beginPath();G.ellipse(X+6,Y-15,40,11,0,0,Math.PI);G.fill();
    G.lineWidth=1;for(let k=0;k<5;k++){G.strokeStyle=k%2?'#9aa3b2':'#ffffff';G.beginPath();G.ellipse(X-4+k*3,Y-19,42-k*7,14-k*2.4,-0.12,Math.PI*1.05,Math.PI*1.95);G.stroke();}
    G.strokeStyle='#ff8a3d';G.lineWidth=2;G.beginPath();G.ellipse(X,Y-18,47,16,0,0.15,Math.PI*0.85);G.stroke();
    G.strokeStyle='#2a5bd7';G.lineWidth=2;G.beginPath();G.ellipse(X,Y-14,46,13,0,0.1,Math.PI*0.9);G.stroke();
    P.label(X,Y+4,'THE ARENA');P.label(X,Y+16,'ICE DISTRICT','#ffb46a');};
  P.w04_chenoa=function(X,Y){shadow(X+22,Y+2,24,3);box('#c8603c',X,Y-24,44,24);for(let i=0;i<11;i++)px(i%2?'#e8364b':'#ffffff',X+i*4,Y-28,4,6);box('#cfeeff',X+4,Y-18,12,8);box('#cfeeff',X+28,Y-18,12,8);box('#3b2618',X+18,Y-14,8,14);
    box('#2b2f45',X+6,Y-38,32,9);txt("CHENOA'S",X+8,Y-37,'#f6c445',6,1);px(O,X+12,Y-29,1,2);px(O,X+32,Y-29,1,2);};

  /* ---------------- RIVER VALLEY: FUNICULAR ---------------- */
  P.w04_funicular=function(X1,Y1,X2,Y2){const G=g();
    line(O,7,[[X1,Y1],[X2,Y2]]);line('#9a968c',5,[[X1,Y1],[X2,Y2]]);
    const L=Math.hypot(X2-X1,Y2-Y1);for(let s=4;s<L;s+=4){const a=X1+(X2-X1)*s/L,b=Y1+(Y2-Y1)*s/L;px('#d8d2c4',a-2,b,5,1);}
    box('#cfeeff',X1-6,Y1-14,14,12);px('#ffffff',X1-6,Y1-14,14,2);px(O,X1-6,Y1-15,14,1);
    box('#9a968c',X2-7,Y2-2,15,4);P.label(X1+30,Y1-24,'FUNICULAR');};
  A.w04_funicar=function(t,X1,Y1,X2,Y2){const u=(Math.sin(t/1600)+1)/2;const a=X1+(X2-X1)*u,b=Y1+(Y2-Y1)*u;box('#e8364b',a-4,b-6,8,7);px('#cfeeff',a-3,b-5,6,3);};

  /* ---------------- KINAN'S OLD NEIGHBOURHOOD: the snow-fort hill ---------------- */
  P.w04_snowhill=function(X,Y){const G=g();
    G.fillStyle='#7d86a8';G.beginPath();G.ellipse(X,Y,40,17,0,0,Math.PI*2);G.fill();G.fillStyle='#f2f6ff';G.beginPath();G.ellipse(X,Y,39,16,0,0,Math.PI*2);G.fill();
    G.fillStyle='#d6e0f4';G.beginPath();G.ellipse(X+8,Y+5,28,8,0,0,Math.PI);G.fill();G.fillStyle='#ffffff';G.beginPath();G.ellipse(X-8,Y-6,18,6,0,0,Math.PI*2);G.fill();
    /* snow fort: block walls with crenellations */
    for(let i=0;i<5;i++){box('#e8eefc',X+12+i*5,Y-10,5,6);if(i%2===0)box('#e8eefc',X+12+i*5,Y-14,5,4);}
    for(let i=0;i<3;i++)box('#e8eefc',X-34+i*5,Y-2,5,5);
    /* snowman + sled */
    G.fillStyle=O;G.beginPath();G.arc(X-20,Y+4,5,0,Math.PI*2);G.arc(X-20,Y-4,3.6,0,Math.PI*2);G.fill();G.fillStyle='#ffffff';G.beginPath();G.arc(X-20,Y+4,4,0,Math.PI*2);G.arc(X-20,Y-4,2.8,0,Math.PI*2);G.fill();px('#ff8a3d',X-19,Y-4,3,1);px('#e8364b',X-23,Y-1,7,1);
    box('#e8364b',X+20,Y+6,10,3);px(O,X+19,Y+9,12,1);};

  /* ---------------- SHAD'S PLACE: a new build at the south-east edge of the city, open fields beyond ---------------- */
  K.GROUND.w04_field=(X,Y)=>Y%4===0?'#c49a48':hash(X>>1,Y>>1)>.93?'#ecd27e':'#dcb860';K.RIM.w04_field='#f4e2a0';K.LINE.w04_field='#8a6420';
  /* a two-storey new build with a front garage: X = left edge, Y = ground line */
  const newHouse=(X,Y,side,trim,roof,hw)=>{const gw=15;
    shadow(X+(gw+hw)/2,Y+2,(gw+hw)/2+4,3);px('#c9c4b8',X+1,Y+1,gw-2,8);px('#b4ae9f',X+1,Y+1,gw-2,1);
    box(side,X,Y-13,gw,13);px('#f4f1e8',X+2,Y-10,gw-4,10);for(let k=0;k<3;k++)px('#d8d2c4',X+2,Y-8+k*3,gw-4,1);
    px(O,X-2,Y-17,gw+3,5);px(roof,X-1,Y-16,gw+1,3);
    box(side,X+gw,Y-27,hw,27);for(let yy=Y-25;yy<Y-4;yy+=3)px(trim,X+gw,yy,hw,1);px('#9a8a78',X+gw,Y-4,hw,4);px('#86786a',X+gw,Y-4,hw,1);
    box('#cfeeff',X+gw+3,Y-23,5,5);box('#cfeeff',X+gw+hw-8,Y-23,5,5);box('#cfeeff',X+gw+hw-8,Y-12,5,5);box('#3b3f4a',X+gw+4,Y-11,5,11);px('#f6c445',X+gw+7,Y-6,1,1);
    tri(O,[[X+gw-3,Y-26],[X+gw+hw/2,Y-39],[X+gw+hw+3,Y-26]]);tri(roof,[[X+gw-1,Y-27],[X+gw+hw/2,Y-37],[X+gw+hw+1,Y-27]]);px('rgba(255,255,255,.25)',X+gw+hw/2-1,Y-35,2,8);};
  P.w04_shadsPlace=function(X,Y){newHouse(X,Y,'#d4d8de','#bcc2ca','#3b3f4a',24);P.label(X+24,Y+2,"SHAD'S PLACE");};
  P.w04_newbuild=function(X,Y,side,trim,roof){newHouse(X,Y,side,trim,roof,20);};
  /* the next house is still being framed: deck, studs, plates, trusses and a few sheathing panels */
  P.w04_framing=function(X,Y){shadow(X+16,Y+2,19,3);px('#9a968c',X-2,Y-2,36,3);box('#b8854c',X-2,Y-5,36,3);
    for(let i=0;i<=32;i+=4)px('#e8c088',X+i,Y-24,1,19);px(O,X-1,Y-25,35,1);px('#d8a860',X,Y-25,33,2);px('#d8a860',X,Y-15,33,1);
    box('#d4b070',X+21,Y-23,10,17);px('#b8944c',X+23,Y-19,1,1);px('#b8944c',X+27,Y-13,1,1);px('#b8944c',X+25,Y-9,1,1);
    for(let i=0;i<=32;i+=8){line('#c99a5c',1,[[X+i-3,Y-25],[X+16,Y-36]]);}line(O,1,[[X-2,Y-25],[X+16,Y-37],[X+34,Y-25]]);};
  P.w04_stake=function(X,Y){px(O,X-1,Y-7,3,8);px('#e8c088',X,Y-6,1,6);px('#ff6fae',X,Y-7,3,2);};
  P.w04_sapling=function(X,Y){const G=g();shadow(X,Y+1,4,1);px('#5e3b20',X,Y-6,1,6);px('#c99a5c',X+2,Y-5,1,5);
    G.fillStyle=O;G.beginPath();G.arc(X+0.5,Y-9,4,0,Math.PI*2);G.fill();G.fillStyle='#5cb73a';G.beginPath();G.arc(X+0.5,Y-9,3,0,Math.PI*2);G.fill();px('#b8f07a',X-1,Y-11,2,1);};
  P.w04_lbl=function(X,Y,s){P.label(X,Y,s);};
  /* World 3's Highway 63 comes in at the top, so the old 620-high layout is moved down DY pixels to make room for it.
     sp() moves a polyline, sl() moves a list of props or animations (slot 2 holds y, except the ones listed in YI).
     Everything added for the new top band and the new east strip is written in the new frame directly. */
  const sp=pts=>pts.map(([a,b])=>[a,b+DY]);
  const YI={w04_funicular:[2,4],w04_funicar:[2,4],streetcar:[2,3]};
  const sl=list=>list.map(p=>{const q=p.slice();(YI[q[0]]||[2]).forEach(i=>q[i]+=DY);return q;});
  const edges=[
      [0,'a',[[90,34]],{road:1}],
      ['a',1,[[112,88]]],
      [1,2,[[216,112]]],
      [2,3,[[286,186]],{road:1}],
      [3,4,[[44,186],[28,192],[20,206]],{road:1}],
      [4,5,[[20,352]],{road:1}],
      [5,6,[[286,352],[324,340],[356,312],[384,290],[410,284]],{road:1}],
      [6,'b',[],{road:1}],
      ['b',7,[[672,330],[662,390],[636,396]]],
      [7,8,[[600,450]]],
      [7,'d',[[530,398]]],
      ['d',9,[[460,540]],{road:1}],
      [9,10,[[740,540]],{road:1}]].map(([a,b,v,o])=>[a,b,v?sp(v):v,o]);
  K.W.push({ n:4, hud:'EDMONTON', name:'Kinan vs. Chenoa',
    where:'Edmonton Homecoming: back to the city Kinan grew up in, from his old neighbourhood to West Edmonton Mall, across the river valley to Whyte Ave and into the ICE District.',
    marks:"Highway 63 rolling in from the north, West Edmonton Mall (the waterpark, the indoor theme park, the ice rink), Kinan's old neighbourhood and snow-fort hill, Shad's job site, the Legislature, the High Level Bridge with its streetcar, the white Walterdale Bridge, the funicular, the Muttart pyramids, the Princess Theatre on Whyte Ave, the tallest tower and the hockey arena in the ICE District, and a city road over the river past Shad's place (new builds at the south-east edge of the city, fields beyond) to the highway south to Calgary.",
    size:[1110,720], ground:'grass', water:'blue', cliff:'dirt', path:'tan',
    rivers:[{pts:sp([[-20,438],[110,424],[230,452],[360,432],[470,430],[600,428],[700,432],[800,426],[900,410],[1020,424],[1130,418]]),w:22}],
    zones:[{k:'w04_field',r:[1046,648,64,72]},{k:'w04_site',r:[994,678,50,20]},{k:'w04_lot',r:[26,292,254,152]},{k:'w04_site',r:[300,256,150,116]},{k:'w04_snow',e:[150,200,46,22]},{k:'paved',r:[466,230,420,148]},
      {k:'w04_lawn',e:[530,452,64,24]},{k:'paved',r:[350,588,420,48]},{k:'forest',f:(X,Y,w)=>w.rd(X,Y)<52}],
    roads:[
      ...[
      [[0,34],[1110,34]],                                        // Yellowhead Trail
      [[286,34],[286,352]],                                      // 170 St
      [[0,352],[286,352],[324,340],[356,312],[384,290],[410,284],[1110,284]],  // 87 Ave -> Stony Plain Rd -> Jasper Ave
      [[286,124],[1110,124]],                                    // 118 Ave
      [[286,186],[44,186],[28,192],[20,206],[20,352]],           // the mall ring road
      [[90,34],[90,186]],                                        // neighbourhood street
      [[460,124],[460,540]],                                     // 109 St over the High Level Bridge
      [[620,124],[620,284]],                                     // 101 St
      [[740,124],[740,630]],                                     // 97 St over the Low Level Bridge
      [[0,540],[1110,540]],                                      // Whyte Ave
      [[890,124],[890,630]],                                     // a city road over the river: the way out of the city
      [[360,540],[360,630]]].map(sp),
      [[240,-10],[240,134]],                                     // Highway 63/28 coming down from World 3
      [[890,704],[1110,704]]],                                   // a city road into the new builds at the south-east edge of the city
    bridges:[[460,530,'hlb'],[600,528,'walterdale'],[740,530,'traffic'],[890,512,'beam']],
    J:{a:[90,162],b:[680,384],d:[460,498]},
    stops:[
      {at:[240,134],name:'4-1  THE HIGHWAY INTO EDMONTON',st:'open'},
      {at:[150,196],name:'4-2  THE OLD NEIGHBOURHOOD',st:'lock'},
      {at:[286,230],name:"4-3  CHENOA'S BUS RIDE",st:'lock'},
      {at:[196,286],name:'4-4  THE MEGA MALL WATERPARK',st:'lock'},
      {at:[20,368],name:'4-5  THE MALL ICE RINK',st:'lock'},
      {at:[116,452],name:'FORT  THE INDOOR ROLLERCOASTER',st:'fort'},
      {at:[430,384],name:"4-6  SHAD'S JOB SITE",st:'lock'},
      {at:[604,496],name:'4-7  THE RIVER VALLEY AND FUNICULAR',st:'lock'},
      {at:[610,576],name:'SECRET  THE MUTTART PYRAMIDS',st:'secret'},
      {at:[556,640],name:'4-8  WHYTE AVE AT NIGHT',st:'lock'},
      {at:[740,352],name:"CASTLE  CHENOA'S RESTAURANT RUSH  -  CHENOA",st:'boss'}],
    edges,
    /* Robin's pickup rolls in from World 3 down Highway 63 to the Yellowhead */
    entryPath:{from:[240,0],via:[],road:1},
    /* after Chenoa's restaurant: the family van goes east on Jasper, over the river on a city road and south on the highway to Calgary (World 5) */
    exitPath:{to:[890,720],via:[[740,384],[890,384],[890,640]],road:1,ride:'van'},
    exit:[890,700],
    props:[
      ...sl([
      ['w04_wem',30,318],['w04_cars',62,214,9],['w04_cars',62,230,9,10],['w04_cars',34,342,9,11],['w04_cars',190,342,7,11],['busStop',292,124],
      ['w04_snowhill',150,100],['w04_lbl',150,112,'SNOW FORT HILL'],['w04_lbl',398,420,'HIGH LEVEL BRIDGE'],['w04_lbl',668,420,'WALTERDALE BRIDGE'],
      ['w04_jobsite',300,272],
      ['legislature',530,362],['w04_funicular',684,290,664,386],
      ['tower',470,277,22,70,'#8aa0b8'],['tower',496,277,18,96,'#5c6f90','#f6e7a6'],['tower',518,277,24,62,'#9aa8ba'],['tower',546,277,20,108,'#6f86a8','#cfeeff'],['tower',570,277,22,82,'#8aa0b8','#f6e7a6'],['tower',594,277,18,66,'#5c6f90'],
      ['tower',628,277,22,100,'#4a6a9a','#cfeeff'],['tower',654,277,20,76,'#8aa0b8'],['tower',678,224,18,60,'#9aa8ba','#f6e7a6'],['w04_chenoa',690,252],
      ['w04_stantec',752,246],['w04_rogers',832,256],['tower',910,277,20,64,'#8aa0b8'],['tower',936,277,24,84,'#5c6f90','#f6e7a6'],['tower',966,277,20,58,'#9aa8ba','#cfeeff'],
      ['w04_muttart',620,492],['w04_princess',494,532],['shops',366,532,3],['shops',756,532,4],['shops',380,580,3],['shops',580,580,5],
      ...K.homes([[12,64,'#2a5bd7'],[50,64,'#e8364b'],[12,110,'#44c55a'],[50,110,'#8a5426'],[12,156,'#e8364b'],[50,156,'#2a5bd7'],
        [200,64,'#8a5426'],[232,64,'#e8364b'],[256,90,'#2a5bd7'],[108,160,'#44c55a'],[140,160,'#e8364b'],[200,166,'#2a5bd7'],[236,166,'#8a5426'],
        [480,70,'#e8364b'],[520,70,'#2a5bd7'],[560,70,'#44c55a'],[600,70,'#8a5426'],[640,104,'#e8364b'],[680,104,'#2a5bd7'],[800,70,'#44c55a'],[840,70,'#e8364b'],[940,70,'#2a5bd7'],[960,110,'#8a5426'],
        [800,600,'#e8364b'],[960,520,'#44c55a'],[20,600,'#2a5bd7'],[60,600,'#e8364b'],[120,590,'#8a5426'],[200,600,'#44c55a'],[250,520,'#2a5bd7'],[160,520,'#e8364b'],[60,520,'#44c55a'],
        [1000,70,'#e8364b'],[1050,70,'#44c55a'],[1010,110,'#2a5bd7'],[1060,110,'#8a5426'],[1000,200,'#44c55a'],[1050,190,'#e8364b'],[1030,250,'#2a5bd7'],
        [1000,330,'#8a5426'],[1056,340,'#44c55a'],[1030,500,'#e8364b'],[1072,520,'#2a5bd7']])]),
      /* the WEM pylon sign at the corner of the lot */
      ['w04_pylon',46,328],
      /* Shad's place at the south-east edge of the city: the last houses before the fields */
      ['w04_shadsPlace',908,694],['w04_newbuild',958,694,'#e6dcc4','#d4c8ac','#5a4a3a'],['w04_framing',1002,694],['w04_stake',1042,692],['w04_stake',1058,696],
      ['w04_sapling',951,697],['w04_sapling',996,697],
      /* the new top band: the highway in from the north, with its welcome sign */
      ['sign',250,96,'WELCOME TO','EDMONTON'],['sign',836,700,'CALGARY','TO WORLD 5'],
      ...K.homes([[20,70,'#44c55a'],[60,70,'#e8364b'],[100,70,'#2a5bd7'],[140,70,'#8a5426'],[180,70,'#e8364b'],[340,70,'#2a5bd7'],[380,70,'#44c55a'],[420,70,'#e8364b'],
        [480,110,'#8a5426'],[520,110,'#2a5bd7'],[560,110,'#44c55a'],[640,70,'#e8364b'],[680,70,'#2a5bd7'],[720,110,'#8a5426'],[780,70,'#44c55a'],[840,110,'#e8364b'],
        [900,70,'#2a5bd7'],[960,110,'#44c55a'],[1020,70,'#8a5426'],[1070,110,'#e8364b']])],
    scatter:[{k:'tree',n:190,zone:'forest'},{k:'tree',n:50,zone:'grass'}],
    anim:[['canflag',302,90],['w04_skaters',30,418],['w04_pool',30,418],['w04_sliders',30,418],['w04_lotcars',30,418],['w04_shoppers',30,418],['w04_pylonBulbs',46,328],
      ['w04_digger',300,372],['w04_crane',300,372],...sl([['w04_coaster',84,318],['streetcar',460,414,446],['w04_funicar',684,292,664,384],['w04_bulbs',494,532,60],['lights',368,500,24],['lights',758,500,30]])] });
})(KINAN);

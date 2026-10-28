/* World 5: Calgary Stampede (Kinan vs. Bronco) */
(function(K){
  const {px,box,shadow,txt,hash}=K; const g=()=>K.g(); const P=K.P, A=K.A;
  const O='#1b1220';
  const line=(c,w,pts)=>{const G=g();G.strokeStyle=c;G.lineWidth=w;G.lineCap='round';G.lineJoin='round';G.beginPath();pts.forEach(([a,b],i)=>i?G.lineTo(a,b):G.moveTo(a,b));G.stroke();};
  const tri=(c,pts)=>{const G=g();G.fillStyle=c;G.beginPath();pts.forEach(([a,b],i)=>i?G.lineTo(a,b):G.moveTo(a,b));G.closePath();G.fill();};
  const ell=(c,x,y,rx,ry)=>{const G=g();G.fillStyle=c;G.beginPath();G.ellipse(x,y,rx,ry,0,0,Math.PI*2);G.fill();};

  /* the ski hill: a lighter, sunlit grass with mowed stripes */
  K.GROUND.w05_hill=(X,Y)=>{const h=hash(X>>1,Y>>1);if((Y+(X>>2))%10<2)return '#8ad860';return h>.95?'#a8ec74':'#7ccf52';};
  K.RIM.w05_hill='#b8f07a';K.LINE.w05_hill='#2e6423';
  /* the east edge blends into World 6's prairie (wheat below y 398, badlands above), so the two maps meet without a hard line */
  K.GROUND.w05_fade=(X,Y)=>hash(X,Y>>1)<(X-1180)/40?(Y>=398?K.GROUND.wheat(X,Y):K.GROUND.badlands(X,Y)):K.GROUND.grass(X,Y);K.RIM.w05_fade=K.RIM.grass;K.LINE.w05_fade=K.LINE.grass;

  /* ---------------- CALGARY TOWER: white shaft, red pod, white/silver band, torch ---------------- */
  P.w05_ctower=function(X,Y){const G=g();
    shadow(X,Y+2,24,5);
    box('#c9c4b8',X-24,Y-14,48,14);px('#e6e0d2',X-24,Y-14,48,2);for(let i=0;i<7;i++)box('#7ec8ff',X-21+i*6,Y-10,4,5);
    const H=112,yb=Y-14;
    for(let i=0;i<=H;i++){const w=Math.round(16-6*i/H);px(O,X-Math.floor(w/2)-1,yb-i,w+2,1);px('#f6f3ea',X-Math.floor(w/2),yb-i,w,1);px('#ffffff',X-Math.floor(w/2)+1,yb-i,2,1);px('#d4cdbd',X+Math.ceil(w/2)-3,yb-i,2,1);}
    px('#e2dccc',X,yb-H,1,H);
    const py=yb-H;
    /* flared underside up into the pod */
    tri(O,[[X-6,py+1],[X-19,py-8],[X+19,py-8],[X+6,py+1]]);tri('#9aa3b2',[[X-5,py],[X-17,py-7],[X+17,py-7],[X+5,py]]);
    /* the red observation pod with its window band */
    box('#e8364b',X-18,py-24,36,16);px('#ff7a88',X-18,py-24,36,2);px('#b8243a',X+12,py-24,6,16);
    px('#2b2f45',X-18,py-17,36,4);for(let i=-16;i<16;i+=4)px('#f6e7a6',X+i,py-16,2,2);
    /* the white / silver band */
    box('#eef2f8',X-19,py-29,38,4);px('#b4bcc8',X-19,py-26,38,1);
    /* crown and torch */
    box('#d8dde6',X-11,py-35,22,5);box('#9aa3b2',X-4,py-42,8,7);px('#6f7889',X-4,py-38,8,1);
    P.label(X-44,Y-84,'CALGARY TOWER');};
  A.w05_torch=function(t,X,Y){const h=7+Math.round(Math.sin(t/90)*2+Math.sin(t/37));px('#ff8a3d',X-3,Y-h,6,h);px('#f6c445',X-1,Y-h+3,3,h-3);px('#fff3c4',X,Y-3,1,2);};

  /* ---------------- THE BOW (curved glass, diagrid) + WONDERLAND head ---------------- */
  P.w05_bow=function(X,Y){const G=g();const H=116;
    shadow(X+16,Y+2,22,4);
    const shape=(o)=>{G.beginPath();G.moveTo(X-o,Y+o);G.quadraticCurveTo(X+14,Y-H/2,X+2-o,Y-H-o);G.lineTo(X+30+o,Y-H-o);G.quadraticCurveTo(X+42+o,Y-H/2,X+32+o,Y+o);G.closePath();};
    G.fillStyle=O;shape(1);G.fill();G.fillStyle='#6fa8d0';shape(0);G.fill();
    G.save();shape(0);G.clip();G.fillStyle='#9fd0f0';G.fillRect(X,Y-H,10,H);G.strokeStyle='#d8eefc';G.lineWidth=1;
    for(let k=-H;k<60;k+=12){G.beginPath();G.moveTo(X-10,Y+k);G.lineTo(X+50,Y+k-30);G.stroke();G.beginPath();G.moveTo(X-10,Y+k-30);G.lineTo(X+50,Y+k);G.stroke();}G.restore();
    P.label(X+18,Y-H-22,'THE BOW');};
  P.w05_wonderland=function(X,Y){const G=g();
    shadow(X,Y+1,12,3);px('#d8d2c4',X-12,Y-2,24,3);
    G.lineWidth=1;G.strokeStyle='rgba(27,18,32,.45)';G.beginPath();G.ellipse(X+1,Y-17,8,15,0,0,Math.PI*2);G.stroke();
    G.strokeStyle='#ffffff';G.beginPath();G.ellipse(X,Y-18,8,15,0,0,Math.PI*2);G.stroke();
    for(let k=-12;k<=12;k+=3){const w=8*Math.sqrt(Math.max(0,1-(k/15)**2));G.beginPath();G.moveTo(X-w,Y-18+k);G.lineTo(X+w,Y-18+k);G.stroke();}
    for(const f of [-0.6,0,0.6]){G.beginPath();G.ellipse(X,Y-18,8*Math.abs(f)+0.5,15,0,0,Math.PI*2);G.stroke();}
    px('#ffffff',X-4,Y-21,2,1);px('#ffffff',X+2,Y-21,2,1);};

  /* ---------------- PEACE BRIDGE helix overlay ---------------- */
  P.w05_peace=function(X,Y1,Y2){for(let y=Y1;y<Y2;y+=7){line(O,4,[[X-9,y],[X+9,y+7]]);line('#e8364b',2,[[X-9,y],[X+9,y+7]]);}for(let y=Y1;y<Y2;y+=7){line('#ff8a9a',1,[[X+9,y],[X-9,y+7]]);}px('#f4f1e8',X-1,Y1,2,Y2-Y1);
    P.label(X+52,Y1+8,'PEACE BRIDGE');};

  /* ---------------- STAMPEDE PARK ---------------- */
  P.w05_track=function(X,Y){const G=g();const rx=66,ry=21;
    ell(O,X,Y,rx+2,ry+2);ell('#b8854c',X,Y,rx,ry);ell('#62bb3c',X,Y,rx-14,ry-8);
    G.strokeStyle='#ffffff';G.lineWidth=1;G.beginPath();G.ellipse(X,Y,rx-1,ry-1,0,0,Math.PI*2);G.stroke();G.beginPath();G.ellipse(X,Y,rx-13,ry-7,0,0,Math.PI*2);G.stroke();
    for(let i=-40;i<=40;i+=20)px('#8ad860',X+i,Y-4,10,8);
    [[0.5,'#e8364b'],[1.15,'#2a5bd7'],[2.0,'#f6c445'],[3.6,'#44c55a']].forEach(([a,c])=>{const x=X+Math.cos(a)*(rx-7),y=Y+Math.sin(a)*(ry-4);px('#6f4a26',x-12,y-2,3,3);px('#6f4a26',x-8,y-2,3,3);box('#f4f1e8',x-4,y-6,9,6);px('#e0d8c4',x-4,y-3,9,1);px(c,x-4,y,9,1);px(O,x-3,y+1,2,2);px(O,x+3,y+1,2,2);});
    P.label(X,Y-6,'CHUCKWAGON TRACK');};
  P.w05_arena=function(X,Y){const G=g();
    for(let r=0;r<3;r++){box(r%2?'#b8b2a6':'#d8d2c4',X-34+r*2,Y-26-r*5,68-r*4,5);for(let i=0;i<30;i++)px(['#e8364b','#f6c445','#2a5bd7','#ffffff'][(i+r)%4],X-31+r*2+i*2,Y-25-r*5,1,1);}
    ell(O,X,Y,34,15);ell('#c99a5c',X,Y,33,14);G.strokeStyle='#ffffff';G.lineWidth=1;G.beginPath();G.ellipse(X,Y,31,12,0,0,Math.PI*2);G.stroke();
    for(let i=0;i<4;i++){box('#8a5a32',X+33,Y-10+i*5,7,4);px('#c99a5c',X+34,Y-9+i*5,5,2);}
    /* a bucking bronc and rider */
    box('#7a4a2a',X-6,Y-4,12,5);px('#7a4a2a',X+5,Y-8,3,5);px('#7a4a2a',X+6,Y-9,4,2);px('#7a4a2a',X-6,Y+1,2,3);px('#7a4a2a',X+3,Y+1,2,3);px('#3b2618',X-8,Y-6,3,2);
    px('#2a5bd7',X-1,Y-9,3,5);px('#d9a27a',X-1,Y-11,3,2);px('#f4f1e8',X-3,Y-13,7,2);px('#f4f1e8',X-1,Y-15,3,2);px('#d9a27a',X-4,Y-12,2,1);
    P.label(X,Y+14,'RODEO');};
  P.w05_grandstand=function(X,Y){const G=g();const W=134;
    shadow(X+W/2,Y+2,W/2+4,4);
    for(let r=0;r<3;r++){box(r%2?'#d8d2c4':'#b8b2a6',X+r*4,Y-7-r*7,W-r*8,7);for(let i=0;i<(W-r*8)/2-2;i++)px(['#e8364b','#f6c445','#2a5bd7','#ffffff','#ff6fae'][(i*3+r)%5],X+r*4+2+i*2,Y-6-r*7+(i%2),1,1);}
    px(O,X+8,Y-32,W-16,4);px('#2b2f45',X+9,Y-31,W-18,2);for(let i=X+12;i<X+W-10;i+=16)px(O,i,Y-29,1,8);
    /* the show stage with light towers */
    box('#2b2f45',X+W/2-24,Y-12,48,12);px('#f6c445',X+W/2-24,Y-12,48,2);px('#ff6fae',X+W/2-20,Y-8,40,1);
    [X+W/2-30,X+W/2+26].forEach(a=>{px(O,a,Y-24,3,24);box('#f4f1e8',a-2,Y-28,7,4);});
    P.label(X+W+34,Y-14,'GRANDSTAND');};
  P.w05_stall=function(X,Y,c){box('#f4f1e8',X,Y-10,18,10);for(let i=0;i<5;i++)px(i%2?c:'#ffffff',X-1+i*4,Y-14,4,4);px(O,X-1,Y-14,20,1);box('#f6c445',X+5,Y-7,8,3);};
  P.w05_midwaylabel=function(X,Y){P.label(X,Y,'MIDWAY');};
  P.w05_pancakes=function(X,Y){const G=g();
    shadow(X+30,Y+2,34,4);
    /* striped canopy */
    px(O,X-1,Y-29,62,9);for(let i=0;i<15;i++)px(i%2?'#e8364b':'#ffffff',X+i*4,Y-28,4,7);for(let i=0;i<15;i++)px(i%2?'#e8364b':'#ffffff',X+i*4+1,Y-21,3,2);
    px(O,X+1,Y-20,1,16);px(O,X+58,Y-20,1,16);
    /* long table with people */
    box('#a8692e',X+4,Y-9,52,4);for(let i=0;i<8;i++){px(['#2a5bd7','#e8364b','#44c55a','#f6c445'][i%4],X+7+i*6,Y-14,3,4);px('#d9a27a',X+7+i*6,Y-16,3,2);px('#f4f1e8',X+7+i*6,Y-9,3,1);}
    /* griddle and a big pancake stack with syrup */
    box('#3b3f4a',X+64,Y-10,16,6);px('#f6c445',X+66,Y-11,4,1);px('#f6c445',X+73,Y-11,4,1);
    for(let i=0;i<5;i++){box('#e8b860',X+84,Y-6-i*3,14,3);px('#c8903c',X+84,Y-4-i*3,14,1);}px('#8a4a1a',X+86,Y-21,10,3);px('#8a4a1a',X+88,Y-18,2,4);px('#fff3c4',X+89,Y-23,4,2);
    P.label(X+48,Y-48,'PANCAKE BREAKFAST');};
  A.w05_parade=function(t,X1,X2,Y){const L=X2-X1;const units=['horse','float','band','horse','truck','float'];
    units.forEach((u,i)=>{let x=X2-((t/30+i*34)%(L+40));if(x<X1-30||x>X2)return;const y=Y;
      if(u==='horse'){box('#7a4a2a',x,y-5,10,5);px('#7a4a2a',x-3,y-9,4,5);px(O,x+1,y,2,2);px(O,x+7,y,2,2);px('#e8364b',x+3,y-10,4,5);px('#f4f1e8',x+2,y-13,6,2);}
      else if(u==='float'){box('#ff6fae',x,y-9,22,9);for(let k=0;k<5;k++)px(['#f6c445','#ffffff','#7ec8ff'][k%3],x+2+k*4,y-11,3,3);box('#f4f1e8',x+8,y-17,6,6);px(O,x+3,y,3,2);px(O,x+16,y,3,2);}
      else if(u==='band'){for(let k=0;k<3;k++){px('#2a5bd7',x+k*4,y-6,3,5);px('#ffffff',x+k*4,y-8,3,2);px('#f6c445',x+k*4+2,y-5,2,1);}}
      else{box('#e8364b',x,y-7,16,7);box('#cfeeff',x+1,y-6,4,3);px(O,x+2,y,3,2);px(O,x+11,y,3,2);px(O,x+12,y-14,1,7);px('#d52b1e',x+13,y-14,5,3);}});};

  /* ---------------- CALGARY ZOO: dinosaur park and the volcano ---------------- */
  P.w05_zoogate=function(X,Y){box('#8a5a32',X,Y-16,4,16);box('#8a5a32',X+30,Y-16,4,16);box('#3f9636',X-2,Y-22,38,7);txt('ZOO',X+10,Y-21,'#ffffff',6,1);P.label(X+17,Y-42,'CALGARY ZOO');};
  P.w05_trex=function(X,Y){const c='#5aa04a',d='#3f7a34';shadow(X+10,Y+1,14,3);
    box(c,X,Y-14,16,8);box(c,X+12,Y-26,8,14);box(c,X+14,Y-32,14,7);px('#ffffff',X+21,Y-26,6,1);px(O,X+23,Y-30,2,2);px(c,X-8,Y-13,9,3);px(c,X-12,Y-11,5,2);box(d,X+3,Y-6,4,6);box(d,X+10,Y-6,4,6);px(c,X+19,Y-19,4,2);};
  P.w05_stego=function(X,Y){const c='#d8a040';shadow(X+12,Y+1,14,3);box(c,X,Y-10,24,8);[2,7,12,17].forEach((a,i)=>tri('#e8364b',[[X+a,Y-10],[X+a+3,Y-16-(i%2)*2],[X+a+6,Y-10]]));px(c,X+24,Y-8,5,4);px(O,X+27,Y-7,1,1);px(c,X-6,Y-8,7,3);px('#f4f1e8',X-8,Y-9,2,1);px('#b8803a',X+3,Y-2,3,3);px('#b8803a',X+17,Y-2,3,3);};
  P.w05_brachio=function(X,Y){const c='#7cb06a';shadow(X,Y+1,16,3);
    line(O,7,[[X+8,Y-10],[X+18,Y-26],[X+16,Y-38]]);line(c,5,[[X+8,Y-10],[X+18,Y-26],[X+16,Y-38]]);line(O,5,[[X-10,Y-8],[X-24,Y-4]]);line(c,3,[[X-10,Y-8],[X-24,Y-4]]);
    ell(O,X,Y-9,15,8);ell(c,X,Y-9,14,7);ell('#9ccc88',X-2,Y-12,8,3);box(c,X+12,Y-43,9,6);px(O,X+18,Y-42,1,1);
    [[-9],[ -3],[4],[9]].forEach(([a])=>box('#5a8a4a',X+a-1,Y-4,3,5));};
  P.w05_volcano=function(X,Y){shadow(X,Y+2,22,4);tri(O,[[X-23,Y+1],[X-6,Y-29],[X+6,Y-29],[X+23,Y+1]]);tri('#7a5a48',[[X-21,Y],[X-5,Y-27],[X+5,Y-27],[X+21,Y]]);tri('#5e4434',[[X+2,Y-27],[X+5,Y-27],[X+21,Y],[X+8,Y]]);
    px('#e8364b',X-5,Y-29,10,3);px('#ff8a3d',X-2,Y-27,3,9);px('#ff8a3d',X+1,Y-22,3,8);px('#f6c445',X-1,Y-26,1,5);px('#2b2f45',X-6,Y-8,12,8);px('#1b1220',X-4,Y-6,8,6);};
  A.w05_tubes=function(t,X1,X2,Y){for(let i=0;i<3;i++){const L=X2-X1;const x=X1+((t/60+i*L/3)%L);const y=Y+Math.round(Math.sin(t/500+i*2)*2)+(i%2)*6;
    const G=g();G.fillStyle=O;G.beginPath();G.ellipse(x,y,6,3.5,0,0,Math.PI*2);G.fill();G.fillStyle=['#f6c445','#e8364b','#44c55a'][i];G.beginPath();G.ellipse(x,y,5,2.5,0,0,Math.PI*2);G.fill();G.fillStyle='#4a8ae0';G.beginPath();G.ellipse(x,y,2,1,0,0,Math.PI*2);G.fill();px('#d9a27a',x-1,y-5,3,3);px('#3b2618',x-1,y-6,3,1);}};
  A.w05_fireworks=function(t,X,Y){[[0,0,'#f6c445'],[30,-10,'#ff6fae'],[-28,-6,'#7ec8ff']].forEach(([a,b,c],i)=>{const k=((t/1200)+i/3)%1;const r=3+k*12;const G=g();G.globalAlpha=1-k;for(let j=0;j<8;j++){const q=j*Math.PI/4;px(c,X+a+Math.cos(q)*r,Y+b+Math.sin(q)*r,2,2);}G.globalAlpha=1;});};

  /* ---------------- CANADA OLYMPIC PARK: the ski jumps ---------------- */
  P.w05_jumps=function(X,Y){const G=g();
    /* two jumps in side view, in-runs dropping west toward the Rockies: tower, ramp on struts, lip, landing hill */
    [[X,Y,56,58],[X+4,Y+28,40,42]].forEach(([x,y,h,L])=>{
      const G2=g();G2.fillStyle='#e6f6dc';G2.beginPath();G2.moveTo(x-L+2,y-6);G2.quadraticCurveTo(x-L-22,y+2,x-L-52,y+44);G2.lineTo(x-L-26,y+44);G2.quadraticCurveTo(x-L-10,y+8,x-L+12,y-2);G2.closePath();G2.fill();
      line('#ffffff',1,[[x-L-4,y],[x-L-38,y+40]]);
      for(let k=6;k<L-4;k+=8){const fx=x-k,fy=y-h+6+(h-14)*k/L;px(O,fx,fy,1,y-fy);px('#9aa3b2',fx+1,fy,1,y-fy);}
      line(O,6,[[x-2,y-h+4],[x-L+8,y-10],[x-L,y-12]]);line('#f4f1e8',4,[[x-2,y-h+4],[x-L+8,y-10],[x-L,y-12]]);line('#b4bcc8',1,[[x-2,y-h+6],[x-L+8,y-8]]);
      box('#c9c4b8',x-4,y-h,8,h);px('#a8a296',x+2,y-h,2,h);for(let yy=y-h+6;yy<y;yy+=8)px('#a8a296',x-4,yy,8,1);
      box('#e8364b',x-6,y-h-8,12,8);px('#ff8a9a',x-6,y-h-8,12,2);px('#cfeeff',x-4,y-h-5,8,2);});
    P.label(X-60,Y-64,'SKI JUMPS');};

  K.W.push({ n:5, hud:'CALGARY STAMPEDE', name:'Kinan vs. Bronco',
    where:'The Calgary Stampede: the parade and pancakes, the rodeo, the chuckwagons and the midway, then one big loop of the city: over the Peace Bridge, along the Bow, through the zoo, up the Calgary Tower and out to the ski jumps before the Grandstand Show.',
    marks:"The Calgary Tower, the Bow tower and the Wonderland head, the red Peace Bridge west of downtown, the Calgary Zoo's dinosaur park on its island in the Bow east of downtown, the Elbow River meeting the Bow, the Saddledome, the rodeo arena, the chuckwagon track, the midway and the Grandstand, the Olympic ski jumps and the Rocky Mountains, with Deerfoot Trail coming in from the north and 25 Ave heading east toward Drumheller.",
    size:[1220,720], ground:'grass', water:'blue', cliff:'dirt', path:'tan',
    rivers:[{pts:[[-20,148],[160,160],[320,150],[480,166],[640,182],[740,190]],w:22},
      {pts:[[730,186],[790,152],[870,140],[950,160],[985,188]],w:13},{pts:[[730,194],[790,240],[870,266],[950,232],[985,194]],w:13},{pts:[[970,191],[1020,196],[1240,206]],w:22},
      {pts:[[800,740],[790,670],[750,600],[792,530],[764,468],[782,400],[752,322],[764,256],[738,196]],w:12}],
    zones:[{k:'rock',f:(X,Y)=>X<92},{k:'w05_hill',e:[206,452,104,70]},{k:'paved',r:[330,222,416,112]},{k:'paved',r:[478,418,268,180]},{k:'forest',f:(X,Y,w)=>w.rd(X,Y)<26},{k:'w05_fade',r:[1180,0,40,720]}],
    roads:[
      [[0,108],[1220,108]],                                     // Memorial Drive (north bank)
      [[0,340],[1220,340]],                                     // 9 Ave / Bow Trail
      [[320,410],[1220,410]],                                   // 17 Ave
      [[0,606],[1220,606]],                                     // 25 Ave: east out of town toward Drumheller
      [[0,192],[160,200],[320,192],[560,216]],                  // Riverfront Ave
      [[320,192],[320,606]],                                    // 10 St
      [[560,108],[560,410]],                                    // Centre St (over the Centre St Bridge)
      [[470,410],[470,606]],                                    // Macleod Trail
      [[880,340],[880,606]],[[400,0],[400,108]],[[700,0],[700,108]],[[850,-10],[850,108]],
      [[1000,-10],[1000,730]]],                                 // Deerfoot Trail: the QE2 from Edmonton (World 4) comes in here
    bridges:[[320,150,'peace'],[560,174,'arches'],[850,143,'wood'],[850,259,'wood'],[0,340,'traffic','h'],[0,410,'traffic','h'],[0,606,'traffic','h'],[1000,194,'traffic']],
    J:{p:[320,108],z:[850,108],e:[752,410],k:[252,340],f:[566,410],s:[212,606]},
    stops:[
      {at:[1000,410],name:'5-1  THE STAMPEDE PARADE',st:'open'},
      {at:[884,410],name:'5-2  THE PANCAKE BREAKFAST',st:'lock'},
      {at:[744,500],name:'5-3  THE RODEO GROUNDS',st:'lock'},
      {at:[666,562],name:'5-4  THE CHUCKWAGON TRACK',st:'lock'},
      {at:[566,490],name:'FORT  THE MIDWAY',st:'fort'},
      {at:[320,150],name:'5-5  THE PEACE BRIDGE',st:'lock'},
      {at:[850,200],name:"5-6  THE ZOO'S DINOSAUR PARK",st:'lock'},
      {at:[940,198],name:'SECRET  THE BOW RIVER FLOAT',st:'secret'},
      {at:[590,340],name:'5-7  THE CALGARY TOWER',st:'lock'},
      {at:[214,410],name:'5-8  THE SKI JUMP HILL',st:'lock'},
      {at:[566,606],name:'CASTLE  THE GRANDSTAND SHOW  -  BRONCO',st:'boss'}],
    edges:[
      [0,1,[],{road:1}],
      [1,'e',[],{road:1}],
      ['e',2,[[752,450]]],
      [2,3,[[728,548]]],
      [3,4,[[622,512]]],
      [4,'f',[[566,440]]],
      ['f',5,[[320,410],[320,192]],{road:1}],
      [5,'p'],
      ['p','z',[],{road:1}],
      ['z',6],
      [6,7,[[904,206]]],
      [6,8,[[850,340]]],
      [8,'k',[],{road:1}],
      ['k',9,[[238,374]]],
      [9,'s',[[216,520]]],
      ['s',10,[],{road:1}]],
    /* the family van comes down Deerfoot Trail from Edmonton (World 4) and stops at the parade */
    entryPath:{from:[1000,0],via:[],road:1},
    /* after the Grandstand Show the van heads east on 25 Ave, out of the city toward Drumheller (World 6) */
    exitPath:{to:[1220,606],via:[],road:1,ride:'van'},
    exit:[1196,606],
    props:[
      ['mountain',-60,140,150,120],['mountain',-20,250,120,140],['mountain',-70,360,160,150],['mountain',-30,470,130,130],['mountain',-60,590,170,150],['mountain',-20,670,130,120],['mountain',-60,770,160,130],
      ['w05_jumps',198,412],
      ['w05_ctower',590,332],['w05_bow',616,300],['w05_wonderland',672,332],
      ['tower',340,332,20,62,'#8aa0b8'],['tower',364,332,24,86,'#5c6f90','#f6e7a6'],['tower',392,332,18,58,'#9aa8ba'],['tower',414,332,22,104,'#6f86a8','#cfeeff'],['tower',440,332,20,74,'#8aa0b8','#f6e7a6'],['tower',464,332,24,92,'#5c6f90'],['tower',492,332,18,66,'#9aa8ba','#cfeeff'],['tower',514,332,22,82,'#4a6a9a','#f6e7a6'],['tower',538,332,16,58,'#8aa0b8'],
      ['tower',380,272,20,50,'#9aa8ba'],['tower',450,272,22,60,'#6f86a8','#cfeeff'],['tower',690,332,22,70,'#8aa0b8'],['tower',716,332,18,52,'#5c6f90','#f6e7a6'],
      ['w05_peace',320,126,176],
      ['saddledome',700,452],['w05_arena',686,508],['w05_track',566,540],['w05_grandstand',499,598],
      ['tent',534,470,'#e8364b'],['tent',486,500,'#2a5bd7'],['w05_stall',580,448,'#44c55a'],['w05_stall',604,452,'#e8364b'],['w05_stall',626,456,'#2a5bd7'],['w05_midwaylabel',512,478],
      ['w05_pancakes',820,398],
      ['w05_zoogate',762,214],['w05_brachio',808,236],['w05_stego',860,240],['w05_trex',872,182],['w05_volcano',906,214],
      ['sign',1160,596,'DRUMHELLER','TO WORLD 6'],['sign',1010,92,'WELCOME TO','CALGARY'],
      ...K.homes([[110,40,'#e8364b'],[150,74,'#2a5bd7'],[200,40,'#44c55a'],[250,74,'#8a5426'],[300,40,'#e8364b'],[440,40,'#2a5bd7'],[480,74,'#44c55a'],[540,40,'#8a5426'],[600,74,'#e8364b'],[640,40,'#2a5bd7'],[740,40,'#44c55a'],[780,74,'#8a5426'],[870,40,'#e8364b'],[900,74,'#2a5bd7'],[950,40,'#44c55a'],
        [340,450,'#8a5426'],[380,450,'#e8364b'],[420,450,'#2a5bd7'],[340,500,'#44c55a'],[380,500,'#8a5426'],[420,500,'#e8364b'],[340,550,'#2a5bd7'],[400,550,'#44c55a'],
        [250,450,'#e8364b'],[260,520,'#2a5bd7'],[262,580,'#8a5426'],[820,300,'#44c55a'],[900,300,'#e8364b'],[940,380,'#2a5bd7'],[820,470,'#8a5426'],[900,470,'#44c55a'],[950,470,'#e8364b'],[820,540,'#2a5bd7'],[900,540,'#8a5426'],[950,560,'#44c55a'],
        [120,640,'#e8364b'],[300,645,'#2a5bd7'],[500,645,'#44c55a'],[700,645,'#8a5426'],[900,645,'#e8364b'],[220,240,'#8a5426'],[180,280,'#e8364b'],[260,280,'#44c55a'],
        [1040,40,'#2a5bd7'],[1090,74,'#e8364b'],[1140,40,'#44c55a'],[1190,74,'#8a5426'],[1030,300,'#e8364b'],[1080,300,'#2a5bd7'],[1130,300,'#44c55a'],[1180,300,'#8a5426'],
        [1040,380,'#44c55a'],[1100,380,'#e8364b'],[1160,380,'#2a5bd7'],[1030,470,'#8a5426'],[1080,470,'#44c55a'],[1130,470,'#e8364b'],[1180,470,'#2a5bd7'],
        [1030,540,'#e8364b'],[1100,540,'#2a5bd7'],[1040,660,'#44c55a'],[1110,660,'#8a5426'],[1180,660,'#e8364b'],[1060,708,'#2a5bd7'],[1150,708,'#44c55a'],
        [140,700,'#2a5bd7'],[220,700,'#44c55a'],[300,700,'#e8364b'],[380,700,'#8a5426'],[460,700,'#2a5bd7'],[540,700,'#44c55a'],[620,700,'#e8364b'],[700,700,'#8a5426'],[840,700,'#2a5bd7'],[920,700,'#e8364b']])],
    scatter:[{k:'snowpine',n:30,zone:'rock'},{k:'tree',n:90,zone:'forest'},{k:'tree',n:50,zone:'grass'},{k:'pine',n:14,zone:'w05_hill'}],
    anim:[['w05_torch',590,164],['canflag',618,316],['canflag',512,560],['w05_parade',900,1160,412],['w05_tubes',958,988,196],['smoke',906,184,1],
      ['ferris',508,444,18],['lights',578,430,14]] });
})(KINAN);

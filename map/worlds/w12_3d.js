/* World 12: the real 3D Saskatoon map (three.js r160 vendored in worlds/vendor/, models from Blender packed in w12_models.js).
   Registers window.KINAN3D; worlds.html mounts it when World 12 is picked (or calls transitionFrom2D when Kinan beats
   World 11) and forwards arrows / Enter to go() and play(). Works offline once the page has loaded.
   In the game (2026-10-27, map/engine.js): mount()/transitionFrom2D() take opts from the game -
   { at, back, candles(), canWalk(k), skip(k), onMove(k), onPlay(k) -> {banner, sub, ok, go} } - so the stops
   follow the real save (locked / open / beaten), a locked or unbuilt secret is walked past, and PLAY opens
   the stop's 3D level (3d/level-12-1.html). The equipped pets come from the save (none equipped = none). */
(function(){
'use strict';
const HERE=(document.currentScript&&document.currentScript.src)||location.href;
const VENDOR=new URL('vendor/three-0.160.0/',HERE.indexOf('/worlds/')>=0?HERE:new URL('worlds/',location.href).href).href;
const DIR='worlds/w12_assets/';
const FILES=['kinan','glitchy','pelican','bessborough','bridge','house','house_small','remai','sasktel','ferris','carousel','tent','cake','sign'];
/* the family pets from Kinan vs. Mom (PET_DEFS). Each has its own model, pet_<id> (the approved designs on the character
   page; the colours below are only the 2D ones). cat1 is the family's orange kitten, Ginger. PET_SCALE: in-game size */
const PET_SCALE={cat:1.3,dog:1.15};
const PETS={cat1:{kind:'cat',name:'Ginger',color:'#d98a3d',shade:'#a85f22'},dog1:{kind:'dog',name:'Chikastino',color:'#f0e2c8',shade:'#a8692e'},
  cat2:{kind:'cat',name:'Vader',color:'#9a9aa6',shade:'#5e5e6a'},dog2:{kind:'dog',name:'Hunter',color:'#4a4a58',shade:'#26262f'},
  cat3:{kind:'cat',name:'Duchess',color:'#f0e2c8',shade:'#c4ad84'},cat4:{kind:'cat',name:'Tuxedo',color:'#6b6f7a',shade:'#3b3f4a'}};
const SAVE_KEY='kinan-remaster-v1';

let T=null,L=null,libsP=null,assetsP=null,G=null,progress=0,buildP=null;
const A={};
const st={token:0,raf:0,last:0,time:0,screen:null,wrap:null,back:null,world:null,at:0,walk:null,queue:0,banner:null,leaving:0,intro:1,introDur:2.6,
  camYaw:0,camTgt:null,walkAmt:0,phase:0,face:0,jump:-1,hopFx:0,prevPos:null,tr:null,trDone:false,crumbs:[],idleT:0};

/* ------------------------------------------------------------------ small helpers */
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t;
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const angDiff=(a,b)=>{let d=(a-b)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d;};
const lerpAng=(a,b,t)=>a+angDiff(b,a)*t;
const ease=t=>t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const D2R=Math.PI/180;

/* ------------------------------------------------------------------ the map layout (x east, z south, y up; units: Kinan is 2 tall) */
const WATER_Y=-2.2,BED_Y=-3.3;
const ISL={cx:10,cz:-4,rx:100,rz:62};
const RIVER=[[-118,14],[-84,10],[-58,8],[-34,11],[-14,7],[6,1],[26,-5],[46,-8],[66,-6],[86,-10],[130,-15]];
const BR={s:[10.5,16.2],n:[1.5,-14.2],c:[6,1],half:15.6,deck:WATER_Y+2.64};
const SB={x:48.2,z:-7.9,a:5.2,b:2.8};                                   /* the sandbar with the secret hatch */
/* main trail control points; a third value marks a stop index ('J' = junction of the secret spur) */
const MAIN=[[-66,34,0],[-58,36.5],[-50,30,1],[-45,25.5],[-38,22.6,2],[-27,21.4],[-16,19,3],[-6,21],[4.5,22.2],[10.4,19.8],
  [10.5,16.2],[8.25,8.6],[6,1,4],[3.75,-6.6],[1.5,-14.2],[0.4,-19.5],[3,-25,5],[10,-33],[21,-38,6],[30,-36.5],[37,-31.5],
  [41,-25,7],[45,-19.5,'J'],[51.5,-25],[58,-32,9],[66,-31.5],[72.5,-27.5],[78,-25.5,10]];
const SPUR=[[45,-19.5],[46.8,-15.6],[48.2,-12.2],[48.8,-9]];          /* junction -> stop 8 on the sandbar */
/* where the camera looks while Kinan stands on each stop (degrees, 0 = north, 90 = east); null = along the trail */
const VIEW=[0,35,95,-5,28,0,-8,205,null,12,22];
/* camera distance, height and how far above Kinan it aims, per stop (default for the rest) */
const ZOOM_DEF=[12,9.2,1.1],ZOOM={5:[13.5,10.5,2.6],6:[14.5,10.5,2.8],7:[15,11,2.8],9:[13.5,10,2.2],10:[18,12,3.8]};
const HILLS=[[-28,44,9,2.2],[-6,42,10,2.8],[28,46,7,2.4],[52,22,7,2.2],[82,22,8,2.6],[94,6,8,2],[-60,-20,8,2.4],[-56,-36,10,3.2],
  [-30,-46,9,2.4],[-62,-52,7,1.8],[100,-40,7,2],[60,46,7,1.8],[-26,-28,6,1.6],[86,40,8,2.2]];
const PLAZA=[-17,-53,21,-15];                                          /* downtown area x0,z0,x1,z1 */
const ROADS=[[-19,-34,8,-34],[-3.5,-14.5,-3.5,-55]];
const LAWN={x:82,z:-30,a:19,b:9};                                      /* Bessborough festival lawn */
const FIELDS=[[18,30,14,9,'#f2c64c'],[44,40,12,8,'#ffe047'],[64,30,9,12,'#f2c64c'],[-74,-38,12,9,'#ffe047'],[-46,-50,10,7,'#f2c64c']];

/* ------------------------------------------------------------------ library + asset loading */
function loadLibs(){
  if(!libsP)libsP=Promise.all([import(VENDOR+'build/three.module.js'),import(VENDOR+'examples/jsm/loaders/GLTFLoader.js'),
    import(VENDOR+'examples/jsm/geometries/RoundedBoxGeometry.js'),import(VENDOR+'examples/jsm/utils/BufferGeometryUtils.js'),
    import(VENDOR+'examples/jsm/environments/RoomEnvironment.js')]).then(m=>{T=m[0];L={GLTFLoader:m[1].GLTFLoader,RBox:m[2].RoundedBoxGeometry,BGU:m[3],Room:m[4].RoomEnvironment};});
  return libsP;}
function loadAssets(){
  if(!assetsP){const ld=new L.GLTFLoader();let done=0;const list=FILES.concat(petLoadout().map(d=>'pet_'+d.id));   /* only the equipped pets */
    const glb=f=>{const b=window.W12_GLB&&window.W12_GLB[f];if(!b)return ld.loadAsync(DIR+f+'.glb');const bin=atob(b),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return ld.parseAsync(u.buffer,DIR);};
    assetsP=Promise.all(list.map(f=>glb(f).then(g=>{A[f]=g.scene;done++;progress=0.25+0.65*done/list.length;setLoad();})));}
  return assetsP;}

/* ------------------------------------------------------------------ geometry helpers */
const C=h=>new T.Color(h);
function std(color,o){return new T.MeshStandardMaterial(Object.assign({color:C(color),roughness:0.75,metalness:0},o||{}));}
function mergeMeshes(meshes,space){
  space.updateMatrixWorld(true);const inv=new T.Matrix4().copy(space.matrixWorld).invert();const by=new Map();
  for(const m of meshes){m.updateMatrixWorld(true);let g=m.geometry.clone();g.applyMatrix4(new T.Matrix4().multiplyMatrices(inv,m.matrixWorld));
    for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal')g.deleteAttribute(k);
    if(!g.attributes.normal)g.computeVertexNormals();g.morphAttributes={};
    if(!by.has(m.material))by.set(m.material,[]);by.get(m.material).push(g);}
  const out=[];for(const [mat,gs] of by){const all=gs.every(g=>g.index);const list=all?gs:gs.map(g=>g.index?g.toNonIndexed():g);
    const mesh=new T.Mesh(L.BGU.mergeGeometries(list,false),mat);mesh.castShadow=true;mesh.receiveShadow=true;out.push(mesh);}
  return out;}
function meshesUnder(o,skip){const r=[];(function walk(n){if(skip&&skip.has(n))return;if(n.isMesh)r.push(n);n.children.forEach(walk);})(o);return r;}
/* collapse a static model into one mesh per material */
function flatten(root,skip){const ms=meshesUnder(root,skip);const merged=mergeMeshes(ms,root);
  ms.forEach(m=>m.parent&&m.parent.remove(m));const g=new T.Group();merged.forEach(m=>g.add(m));return g;}
function tuneMats(root){root.traverse(o=>{if(o.isMesh){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{m.envMapIntensity=0.55;if(m.roughness!==undefined)m.roughness=Math.max(0.28,m.roughness);});o.castShadow=true;o.receiveShadow=true;}});}
function findNode(root,name){let r=null;root.traverse(o=>{if(!r&&o.name===name)r=o;});return r;}
function recolor(root,map){root.traverse(o=>{if(o.isMesh&&map[o.material.name]){o.material=o.material.clone();o.material.color=C(map[o.material.name]);}});}
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
/* vertex-coloured merge of many simple geometries */
function colored(geo,hex){const g=geo.index?geo.toNonIndexed():geo.clone();const c=C(hex),n=g.attributes.position.count,a=new Float32Array(n*3);
  for(let i=0;i<n;i++){a[i*3]=c.r;a[i*3+1]=c.g;a[i*3+2]=c.b;}g.setAttribute('color',new T.BufferAttribute(a,3));
  for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal'&&k!=='color')g.deleteAttribute(k);return g;}
function at(geo,x,y,z,ry,sx,sy,sz){const m=new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),ry||0),new T.Vector3(sx||1,sy||sx||1,sz||sx||1));geo.applyMatrix4(m);return geo;}
const VC_MAT=()=>std('#ffffff',{vertexColors:true,roughness:0.7});

/* ------------------------------------------------------------------ terrain */
let RIV=null;
function riverD(x,z){let lo=0,hi=RIV.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(RIV[m][0]<x)lo=m;else hi=m;}
  let best=1e9;for(let k=Math.max(0,lo-50),e=Math.min(RIV.length-1,lo+50);k<e;k++){const a=RIV[k],b=RIV[k+1],dx=b[0]-a[0],dz=b[1]-a[1];
    let t=((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz);t=clamp(t,0,1);const px=a[0]+dx*t-x,pz=a[1]+dz*t-z,d=px*px+pz*pz;if(d<best)best=d;}
  return Math.sqrt(best);}
function riverTan(x){let lo=0,hi=RIV.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(RIV[m][0]<x)lo=m;else hi=m;}
  const a=RIV[Math.max(0,lo-2)],b=RIV[Math.min(RIV.length-1,lo+3)];const l=Math.hypot(b[0]-a[0],b[1]-a[1]);return [(b[0]-a[0])/l,(b[1]-a[1])/l];}
function riverZ(x){let lo=0,hi=RIV.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(RIV[m][0]<x)lo=m;else hi=m;}const a=RIV[lo],b=RIV[hi];return lerp(a[1],b[1],clamp((x-a[0])/(b[0]-a[0]),0,1));}
const islF=(x,z)=>Math.pow((x-ISL.cx)/ISL.rx,4)+Math.pow((z-ISL.cz)/ISL.rz,4);
function hills(x,z){let h=0;for(const [hx,hz,r,a] of HILLS){const q=((x-hx)*(x-hx)+(z-hz)*(z-hz))/(r*r);if(q<1)h+=a*(1-q)*(1-q);}return h;}
function sandbarR(x,z){const [tx,tz]=riverTan(SB.x);const dx=x-SB.x,dz=z-SB.z;const u=dx*tx+dz*tz,v=-dx*tz+dz*tx;return Math.sqrt(u*u/(SB.a*SB.a)+v*v/(SB.b*SB.b));}
function bridgeLocal(x,z){const ax=BR.n[0]-BR.s[0],az=BR.n[1]-BR.s[1],l=Math.hypot(ax,az),ux=ax/l,uz=az/l;const dx=x-BR.c[0],dz=z-BR.c[1];return [dx*ux+dz*uz,-dx*uz+dz*ux];}
function groundH(x,z){
  const d=riverD(x,z);let h=hills(x,z);
  if(d<15){const v=d<5?BED_Y:d<7?lerp(BED_Y,-2.45,(d-5)/2):lerp(-2.45,0,sstep(7,15,d));h=v+h*sstep(10,15,d);}
  const r=sandbarR(x,z);if(r<1.15)h=Math.max(h,lerp(WATER_Y-0.15,BED_Y,sstep(0.75,1.15,r)));
  const [al,ac]=bridgeLocal(x,z);const aa=Math.abs(al);
  if(Math.abs(ac)<3.2&&aa>12.5&&aa<19)h=Math.max(h,lerp(BR.deck-0.05,0,sstep(15.4,19,aa))*sstep(3.2,2.2,Math.abs(ac)));
  return h;}
/* top of whatever Kinan walks on: the bridge deck, a little pier over water, or the ground */
function surfH(x,z){const [al,ac]=bridgeLocal(x,z);if(Math.abs(al)<=BR.half+0.6&&Math.abs(ac)<1.7)return BR.deck;
  const g=groundH(x,z);return Math.max(g,WATER_Y+0.42);}
function inPlaza(x,z){return x>PLAZA[0]&&x<PLAZA[2]&&z>PLAZA[1]&&z<PLAZA[3];}
function groundColor(x,z,h,out){
  const d=riverD(x,z);const n=0.5+0.5*Math.sin(x*0.29+Math.sin(z*0.21)*2.1)*Math.sin(z*0.23+x*0.07);
  const n2=0.5+0.5*Math.sin(x*1.37+z*0.91)*Math.sin(z*1.13-x*0.53);
  let c=C('#57bc41').lerp(C('#70cd4c'),n*0.8).lerp(C('#48ad37'),n2*0.3);
  if(h>0.6)c.lerp(C('#86dc5c'),clamp((h-0.6)/2.2,0,1)*0.7);
  if(d<15)c.lerp(C('#48aa3a'),sstep(15,9,d)*0.7);
  if(d<7.6)c.lerp(C('#e9d39b'),sstep(7.6,6.6,d));
  if(sandbarR(x,z)<1.1)c=C('#f1dda2').lerp(C('#e4c98a'),n2*0.4);
  const lq=Math.pow((x-LAWN.x)/LAWN.a,2)+Math.pow((z-LAWN.z)/LAWN.b,2);if(lq<1){const s=(Math.floor((x-LAWN.x)/2.2)&1)?'#86df63':'#74d354';c.lerp(C(s),sstep(1,0.85,lq));}
  const kq=Math.pow((x-22)/16,2)+Math.pow((z-46)/9,2);if(kq<1)c.lerp(C('#6fd651'),sstep(1,0.7,kq)*0.6);
  out.push(c.r,c.g,c.b);}
function checker(mat,size,amt){mat.onBeforeCompile=sh=>{
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;').replace('#include <color_fragment>',
    '#include <color_fragment>\nfloat ck=mod(floor(vWP.x/'+size.toFixed(2)+')+floor(vWP.z/'+size.toFixed(2)+'),2.0);diffuseColor.rgb*=mix('+(1-amt).toFixed(3)+',1.0,ck);');};}
function buildTerrain(scene){
  const NX=300,NZ=190,pos=[],col=[],idx=[];
  const map=(u,v)=>{const s=Math.max(Math.abs(u),Math.abs(v));if(s<1e-9)return [ISL.cx,ISL.cz];const a=Math.atan2(v,u),ca=Math.abs(Math.cos(a)),sa=Math.abs(Math.sin(a));
    const k=Math.pow(Math.pow(ca,4)+Math.pow(sa,4),-0.25)*Math.max(ca,sa);return [ISL.cx+u*k*ISL.rx,ISL.cz+v*k*ISL.rz];};
  for(let j=0;j<=NZ;j++)for(let i=0;i<=NX;i++){const [x,z]=map(-1+2*i/NX,-1+2*j/NZ);const h=groundH(x,z);pos.push(x,h,z);groundColor(x,z,h,col);}
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const a=j*(NX+1)+i,b=a+1,c=a+NX+1,d=c+1;idx.push(a,c,b,b,c,d);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
  const m=std('#ffffff',{vertexColors:true,roughness:0.92});checker(m,3.2,0.05);
  const mesh=new T.Mesh(g,m);mesh.receiveShadow=true;scene.add(mesh);
  /* the floating island's sides: rounded grass lip, layered soil, rock underside */
  const ring=[];const P=(i,j)=>{const k=(j*(NX+1)+i)*3;return [pos[k],pos[k+1],pos[k+2]];};
  for(let i=0;i<=NX;i++)ring.push(P(i,0));for(let j=1;j<=NZ;j++)ring.push(P(NX,j));for(let i=NX-1;i>=0;i--)ring.push(P(i,NZ));for(let j=NZ-1;j>=1;j--)ring.push(P(0,j));
  const prof=[[0,0,'#62c84a'],[0.45,-0.28,'#5bbf45'],[0.55,-0.62,'#4aa63a'],[0.42,-0.9,'#8c5a33'],[0.3,-2.2,'#9b6a3e'],[0.22,-2.35,'#7a4b2a'],[0.2,-4.4,'#8a5a34'],[0.14,-4.55,'#6c4428'],
    [0.08,-6.6,'#7d5232'],['s',0.92,-9.6,'#a3927f'],['s',0.72,-13.5,'#9a8a7a'],['s',0.42,-17.5,'#8c7e70'],['s',0.12,-20.5,'#857768']];
  const sp=[],sc=[],si=[];const R=ring.length,PR=prof.length;
  for(let r=0;r<R;r++){const [x,y,z]=ring[r];let nx=4*Math.pow((x-ISL.cx)/ISL.rx,3)/ISL.rx,nz=4*Math.pow((z-ISL.cz)/ISL.rz,3)/ISL.rz;const nl=Math.hypot(nx,nz)||1;nx/=nl;nz/=nl;
    const top=Math.min(y,0);let prev=1e9;
    for(const p of prof){let px,py,pz,c;if(p[0]==='s'){px=ISL.cx+(x-ISL.cx)*p[1];pz=ISL.cz+(z-ISL.cz)*p[1];py=Math.min(p[2],prev-0.6);c=p[3];}
      else{px=x+nx*p[0];pz=z+nz*p[0];py=(p[1]>-1?y+p[1]:Math.min(top+p[1],y-1.2+p[1]*0.2));c=p[2];}
      prev=py;sp.push(px,py,pz);const cc=C(c);sc.push(cc.r,cc.g,cc.b);}}
  for(let r=0;r<R;r++){const r2=(r+1)%R;for(let k=0;k<PR-1;k++){const a=r*PR+k,b=r2*PR+k;si.push(a,b,a+1,b,b+1,a+1);}}
  const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(sp,3));sg.setAttribute('color',new T.Float32BufferAttribute(sc,3));sg.setIndex(si);sg.computeVertexNormals();
  const sm=new T.Mesh(sg,std('#ffffff',{vertexColors:true,roughness:0.95,side:T.DoubleSide,emissive:C('#3a2a1e'),emissiveIntensity:0.6}));sm.receiveShadow=true;scene.add(sm);
  /* a few small floating rocks under the island, like the hub concept */
  const rk=new T.IcosahedronGeometry(1,1);const rg=[];const rr=rng(5);
  for(let i=0;i<14;i++){const a=rr()*Math.PI*2,s=0.9+rr()*0.35;const x=ISL.cx+Math.cos(a)*ISL.rx*s,z=ISL.cz+Math.sin(a)*ISL.rz*s;
    rg.push(at(colored(rk,i%3?'#9b6a3e':'#8f8174'),x,-8-rr()*14,z,rr()*3,1.2+rr()*2.2,1+rr()*1.4,1.2+rr()*2));}
  const rm=new T.Mesh(L.BGU.mergeGeometries(rg),std('#ffffff',{vertexColors:true,flatShading:true,roughness:0.9}));scene.add(rm);}

/* ------------------------------------------------------------------ water */
function waterMat(){
  const m=new T.MeshStandardMaterial({color:C('#2a7fe4'),roughness:0.42,metalness:0.0,envMapIntensity:0.22,side:T.DoubleSide});
  m.userData.t={value:0};
  m.onBeforeCompile=sh=>{sh.uniforms.uTime=m.userData.t;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec2 aRiv;varying vec2 vRiv;').replace('#include <begin_vertex>','#include <begin_vertex>\nvRiv=aRiv;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uTime;varying vec2 vRiv;').replace('#include <color_fragment>',`#include <color_fragment>
      float e=min(vRiv.y,1.0-vRiv.y);
      diffuseColor.rgb=mix(vec3(0.26,0.66,0.97),diffuseColor.rgb,smoothstep(0.05,0.22,e));
      float f=vRiv.x*0.42-uTime*1.4;
      float w=sin(f+sin(vRiv.y*11.0+vRiv.x*0.13)*1.6)*sin(f*0.37+vRiv.y*5.0);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.8,0.93,1.0),smoothstep(0.62,0.92,w)*0.5);
      float foam=smoothstep(0.085,0.055,e)*(0.6+0.4*sin(vRiv.x*2.1-uTime*2.0));
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(1.0),foam);`);};
  return m;}
function ribbon(pts,half,y,mat,alongOff,yFn){
  const pos=[],uv=[],idx=[];const N=6;let s=alongOff||0;
  for(let i=0;i<pts.length;i++){const p=pts[i],a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];let tx=b[0]-a[0],tz=b[1]-a[1];const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;
    if(i>0)s+=Math.hypot(p[0]-pts[i-1][0],p[1]-pts[i-1][1]);
    for(let k=0;k<=N;k++){const v=k/N,o=(v-0.5)*2*half;pos.push(p[0]-tz*o,yFn?yFn(i,v):y,p[1]+tx*o);uv.push(s,v);}}
  for(let i=0;i<pts.length-1;i++)for(let k=0;k<N;k++){const a=i*(N+1)+k,b=a+N+1;idx.push(a,a+1,b,a+1,b+1,b);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('aRiv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const mesh=new T.Mesh(g,mat);mesh.receiveShadow=true;return mesh;}
function buildWater(scene){
  const m=waterMat();G.waterMat=m;
  const inside=RIV.filter(p=>islF(p[0],p[1])<0.985);
  scene.add(ribbon(inside,7.6,WATER_Y,m));
  /* waterfalls where the river pours off both edges of the island */
  const ends=[[inside[0],inside[1],-1],[inside[inside.length-1],inside[inside.length-2],1]];
  for(const [e,prev] of ends){const dx=e[0]-prev[0],dz=e[1]-prev[1],l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l;const pts=[];const ys=[];
    for(let k=0;k<=18;k++){const f=k/18;pts.push([e[0]+ux*(1.6*Math.sqrt(f*6)+0.2),e[1]+uz*(1.6*Math.sqrt(f*6)+0.2)]);ys.push(WATER_Y-0.05-f*f*3+(-f*19));}
    const wf=ribbon(pts,6.6,0,m,0,(i)=>ys[i]);wf.material=m;scene.add(wf);
    /* mist puffs at the foot of each fall */
    const puff=new T.SphereGeometry(1,12,8);const pg=[];const rr=rng(9);
    for(let i=0;i<9;i++)pg.push(at(colored(puff,'#ffffff'),pts[18][0]+(rr()-0.5)*9,ys[18]+rr()*2,pts[18][1]+(rr()-0.5)*9,0,1.6+rr()*1.8));
    scene.add(new T.Mesh(L.BGU.mergeGeometries(pg),std('#ffffff',{vertexColors:true,transparent:true,opacity:0.85,emissive:C('#ffffff'),emissiveIntensity:0.35,roughness:1})));}}

/* ------------------------------------------------------------------ the trail */
function curveFrom(list,n){const c=new T.CatmullRomCurve3(list.map(p=>new T.Vector3(p[0],0,p[1])),false,'centripetal');const out=[];const M=(list.length-1)*n;
  for(let i=0;i<=M;i++){const p=c.getPoint(i/M);out.push([p.x,p.z]);}return out;}
class Route{constructor(pts){this.p=pts.map(q=>new T.Vector3(q[0],q[2],q[1]));this.c=[0];for(let i=1;i<this.p.length;i++)this.c.push(this.c[i-1]+this.p[i].distanceTo(this.p[i-1]));this.len=this.c[this.c.length-1];}
  at(s,out){s=clamp(s,0,this.len);let lo=0,hi=this.c.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(this.c[m]<s)lo=m;else hi=m;}const t=(s-this.c[lo])/((this.c[hi]-this.c[lo])||1);return (out||new T.Vector3()).lerpVectors(this.p[lo],this.p[hi],t);}}
function buildPaths(){
  const N=10;const ctrl=MAIN.map(p=>[p[0],p[1]]);const dense=curveFrom(ctrl,N);
  const stopIdx={};MAIN.forEach((p,i)=>{if(p.length>2)stopIdx[p[2]]=i*N;});
  const spur=curveFrom(SPUR,N);
  const pathTop=(x,z)=>surfH(x,z)+0.16;
  const stopXZ=[];for(let k=0;k<=10;k++)stopXZ[k]=k===8?SPUR[SPUR.length-1]:MAIN[stopIdx[k]/N];
  const bump=(x,z)=>{let b=0;for(const q of stopXZ){const d=Math.hypot(x-q[0],z-q[1]);b=Math.max(b,0.32*sstep(1.25,0.6,d));}return b;};
  const lift=a=>a.map(q=>[q[0],q[1],pathTop(q[0],q[1])+bump(q[0],q[1])]);
  const R=[];
  for(let k=0;k<10;k++){let pts;
    if(k===7)pts=dense.slice(stopIdx[7],stopIdx.J+1).concat(spur.slice(1));
    else if(k===8)pts=spur.slice().reverse().concat(dense.slice(stopIdx.J+1,stopIdx[9]+1));
    else{const a=stopIdx[k],b=stopIdx[k+1];pts=dense.slice(a,b+1);}
    R.push(new Route(lift(pts)));}
  G.routes=R;G.stopXZ=stopXZ;G.dense=dense;G.spur=spur;G.pathTop=pathTop;
  G.stopPos=stopXZ.map(q=>new T.Vector3(q[0],pathTop(q[0],q[1])+0.32,q[1]));
  /* a coarse lookup so trees and props keep off the trail */
  G.pgrid=new Map();const add=(x,z)=>{const k=Math.floor(x/4)+','+Math.floor(z/4);if(!G.pgrid.has(k))G.pgrid.set(k,[]);G.pgrid.get(k).push([x,z]);};
  dense.forEach(q=>add(q[0],q[1]));spur.forEach(q=>add(q[0],q[1]));}
function nearPath(x,z,r){const cx=Math.floor(x/4),cz=Math.floor(z/4),n=Math.ceil(r/4);
  for(let i=-n;i<=n;i++)for(let j=-n;j<=n;j++){const l=G.pgrid.get((cx+i)+','+(cz+j));if(l)for(const q of l)if(Math.hypot(q[0]-x,q[1]-z)<r)return true;}return false;}
function trailMesh(pts){
  /* raised walkway: rounded tan top, warm edge, darker sides that dig into the ground; planks where it crosses water */
  const prof=[[-1.42,-0.42],[-1.36,0.04],[-1.25,0.14],[-1.08,0.17],[1.08,0.17],[1.25,0.14],[1.36,0.04],[1.42,-0.42]];
  const top=C('#f6d98e'),edge=C('#e6b968'),side=C('#b98a4a'),wood=C('#c08850'),wood2=C('#9a6a3a');
  const pos=[],col=[],idx=[];const NP=prof.length;
  for(let i=0;i<pts.length;i++){const p=pts[i],a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];let tx=b[0]-a[0],tz=b[1]-a[1];const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;
    const bl=bridgeLocal(p[0],p[1]);const water=groundH(p[0],p[1])<WATER_Y+0.05&&!(Math.abs(bl[0])<=BR.half+0.6&&Math.abs(bl[1])<2);
    const plank=water&&(Math.floor(i/2)%2===0);
    for(let k=0;k<NP;k++){const [o,y]=prof[k];const x=p[0]-tz*o,z=p[1]+tx*o;const base=surfH(x,z)-0.01;pos.push(x,base+y,z);
      const c=water?(k>1&&k<NP-2?(plank?wood:wood2):wood2):(k>=3&&k<=4?top:k===2||k===5?edge:side);col.push(c.r,c.g,c.b);}}
  for(let i=0;i<pts.length-1;i++)for(let k=0;k<NP-1;k++){const a=i*NP+k,b=a+NP;idx.push(a,a+1,b,a+1,b+1,b);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
  const m=new T.Mesh(g,std('#ffffff',{vertexColors:true,roughness:0.85}));m.receiveShadow=true;return m;}
function buildSandbar(scene){const [tx,tz]=riverTan(SB.x);const g=new T.SphereGeometry(1,40,14,0,Math.PI*2,0,Math.PI/2);
  const m=new T.Mesh(g,std('#f1dda2',{roughness:0.95}));m.scale.set(SB.a*1.02,0.42,SB.b*1.02);m.position.set(SB.x,WATER_Y-0.18,SB.z);m.rotation.y=Math.atan2(-tz,tx);m.receiveShadow=true;scene.add(m);
  const rk=new T.IcosahedronGeometry(0.35,1);const rg=[];[[-2.6,0.6],[2.9,-0.4],[1.2,1.3]].forEach(([u,v],i)=>{const x=SB.x+tx*u-tz*v,z=SB.z+tz*u+tx*v;rg.push(at(colored(rk,'#a7a29a'),x,WATER_Y+0.12,z,i,1+i*0.3,0.7,1));});
  scene.add(new T.Mesh(L.BGU.mergeGeometries(rg),std('#ffffff',{vertexColors:true,roughness:0.9,flatShading:true})));}
/* Saskatoon is the City of Bridges: a red steel-truss rail bridge downstream of Broadway */
function buildRailBridge(scene){const x=23,z=riverZ(x);const [tx,tz]=riverTan(x);const ang=Math.atan2(-tz,tx)+Math.PI/2;const deck=WATER_Y+3.1,half=15.5,parts=[];
  const red='#c2414f',dark='#8e2f3a';parts.push(at(colored(new L.RBox(2.6,0.45,half*2+1,1,0.12),'#9aa3b2'),0,deck-0.2,0));
  for(const sx of[-1.15,1.15]){parts.push(at(colored(new L.RBox(0.22,0.22,half*2,1,0.06),red),sx,deck+2.0,0));parts.push(at(colored(new L.RBox(0.24,0.24,half*2+0.6,1,0.06),dark),sx,deck+0.1,0));
    for(let k=0;k<=12;k++){const zz=-half+k*(half*2/12);parts.push(at(colored(new L.RBox(0.16,2.0,0.16,1,0.05),red),sx,deck+1.05,zz));
      if(k<12){const d=new L.RBox(0.14,2.75,0.14,1,0.04);d.rotateX((k%2?1:-1)*Math.atan2(half*2/12,2.0));parts.push(at(colored(d,red),sx,deck+1.05,zz+half/12));}}}
  for(let k=0;k<=12;k+=3){const zz=-half+k*(half*2/12);parts.push(at(colored(new L.RBox(2.5,0.16,0.16,1,0.05),red),0,deck+2.0,zz));}
  for(const zz of[-half*0.5,0,half*0.5]){parts.push(at(colored(new L.RBox(1.7,deck-BED_Y+1,1.7,1,0.2),'#cfc6b3'),0,(deck+BED_Y-1)/2-0.2,zz));}
  for(const sx of[-0.55,0.55])parts.push(at(colored(new T.BoxGeometry(0.12,0.1,half*2),'#5a5f66'),sx,deck+0.08,0));
  const g=L.BGU.mergeGeometries(parts);const m=new T.Mesh(g,VC_MAT());m.position.set(x,0,z);m.rotation.y=ang+Math.PI/2;m.castShadow=m.receiveShadow=true;scene.add(m);
  G.blockers.push([x,z,4]);G.rail={x,z,ang:ang+Math.PI/2,half};}
function buildTrail(scene){
  const thin=(a,step)=>{const o=[a[0]];for(let i=1;i<a.length;i++){const q=o[o.length-1];if(Math.hypot(a[i][0]-q[0],a[i][1]-q[1])>=step||i===a.length-1)o.push(a[i]);}return o;};
  scene.add(trailMesh(thin(G.dense,0.45)));scene.add(trailMesh(thin(G.spur,0.45)));
  /* pier posts under the plank crossing to the sandbar */
  const post=new T.CylinderGeometry(0.11,0.13,1.6,8);const pg=[];
  G.spur.forEach((q,i)=>{if(i%3===0&&i>0&&groundH(q[0],q[1])<WATER_Y+0.05){const a=G.spur[i-1],tx=q[0]-a[0],tz=q[1]-a[1],l=Math.hypot(tx,tz)||1;for(const s of[-1.3,1.3])pg.push(at(colored(post,'#8a5a34'),q[0]-tz/l*s,WATER_Y-0.62,q[1]+tx/l*s));}});
  if(pg.length)scene.add(new T.Mesh(L.BGU.mergeGeometries(pg),VC_MAT()));}

/* ------------------------------------------------------------------ level nodes */
function numTex(txt,bg){return canvasTex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#ffffff';g.font="700 78px 'Pixelify Sans', monospace";g.textAlign='center';g.textBaseline='middle';
  g.lineWidth=12;g.strokeStyle=bg;g.strokeText(txt,64,70);g.fillText(txt,64,70);});}
function padGeo(r,h){return new T.LatheGeometry([new T.Vector2(0,0),new T.Vector2(r,0),new T.Vector2(r+0.06,h*0.35),new T.Vector2(r,h*0.85),new T.Vector2(r-0.12,h),new T.Vector2(0,h)],40);}
function buildNodes(scene){
  G.nodes=[];const stops=(st.world&&st.world.stops)||[];
  const outline=std('#1b1220',{roughness:0.6}),gold=std('#f6c445',{roughness:0.35,metalness:0.3});
  for(let k=0;k<=10;k++){const s=stops[k]||{st:'open',name:''};const type=s.st==='fort'||s.st==='secret'||s.st==='boss'?s.st:'level';
    const p=G.stopPos[k];const g=new T.Group();g.position.set(p.x,p.y-0.32,p.z);scene.add(g);
    const r=type==='boss'?1.45:1.0;
    const base=new T.Mesh(padGeo(r+0.16,0.2),outline);g.add(base);
    const col=type==='fort'?'#9aa3b2':type==='secret'?'#7a2fd0':'#e8364b';
    const top=new T.Mesh(padGeo(r,0.3),std(col,{roughness:0.35,metalness:0.05,emissive:C(col),emissiveIntensity:0.08}));top.position.y=0.02;g.add(top);
    const rim=new T.Mesh(new T.TorusGeometry(r-0.05,0.07,8,40),gold);rim.rotation.x=Math.PI/2;rim.position.y=0.31;g.add(rim);
    if(type==='boss'){const inner=new T.Mesh(padGeo(r*0.62,0.36),std('#f6c445',{roughness:0.3,metalness:0.3}));g.add(inner);}
    [base,top,rim].forEach(m=>{m.castShadow=true;m.receiveShadow=true;});
    const num=(s.name||'').split('  ')[0];
    if(type==='level'&&/^12-\d/.test(num)){const lab=new T.Mesh(new T.CircleGeometry(r*0.78,32),new T.MeshBasicMaterial({map:numTex(num.slice(3),'#9c1c2c'),transparent:true,depthWrite:false}));
      lab.rotation.x=-Math.PI/2;lab.position.y=0.325;g.add(lab);}
    let icon=null;
    if(type==='fort')icon=fortIcon();if(type==='secret')icon=starIcon();if(type==='boss')icon=castleIcon();
    if(icon){const yaw=stopYaw(k),fx=Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=Math.sin(yaw);
      const side=type==='secret'?[1.7,2.0]:type==='fort'?[2.2,2.3]:[2.8,2.9];const ix=p.x+fx*side[0]-rx*side[1],iz=p.z+fz*side[0]-rz*side[1];
      const ig=new T.Group();ig.position.set(ix,type==='secret'?WATER_Y+0.1:surfH(ix,iz)-0.02,iz);ig.rotation.y=-yaw+0.4;scene.add(ig);
      const ped=new T.Mesh(padGeo(type==='boss'?1.25:0.95,0.22),type==='secret'?std('#5c5f6e',{roughness:0.5,metalness:0.5}):outline);ped.receiveShadow=true;ig.add(ped);
      if(type==='secret'){const hatch=new T.Mesh(new T.TorusGeometry(0.62,0.1,8,28),std('#9aa3b2',{roughness:0.35,metalness:0.7}));hatch.rotation.x=Math.PI/2;hatch.position.y=0.23;ig.add(hatch);
        const wheel=new T.Mesh(new T.TorusGeometry(0.28,0.05,6,20),std('#e8364b',{roughness:0.4}));wheel.rotation.x=Math.PI/2;wheel.position.y=0.3;ig.add(wheel);}
      icon.position.y=type==='secret'?2.4:0.22;if(type==='boss')icon.scale.setScalar(1.2);ig.add(icon);}
    G.nodes.push({g,type,icon,top});}
  const ring=new T.Mesh(new T.RingGeometry(1.25,1.45,48),new T.MeshBasicMaterial({color:C('#f6c445'),transparent:true,opacity:0.8,depthWrite:false,side:T.DoubleSide}));
  ring.rotation.x=-Math.PI/2;scene.add(ring);G.ring=ring;}
function fortIcon(){const g=new T.Group();const stone=std('#a7afbd',{roughness:0.8}),hi=std('#dfe5ee',{roughness:0.8}),dark=std('#2b2f45');
  const tw=new T.Mesh(new T.CylinderGeometry(0.62,0.7,1.5,20),stone);tw.position.y=0.75;g.add(tw);
  const lip=new T.Mesh(new T.CylinderGeometry(0.78,0.7,0.22,20),hi);lip.position.y=1.55;g.add(lip);
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const b=new T.Mesh(new L.RBox(0.3,0.3,0.3,1,0.05),hi);b.position.set(Math.cos(a)*0.62,1.8,Math.sin(a)*0.62);g.add(b);}
  const door=new T.Mesh(new L.RBox(0.36,0.6,0.2,1,0.08),dark);door.position.set(0,0.32,0.62);g.add(door);
  const pole=new T.Mesh(new T.CylinderGeometry(0.035,0.035,1.3,6),std('#1b1220'));pole.position.y=2.4;g.add(pole);
  const flag=new T.Mesh(new L.RBox(0.6,0.36,0.05,1,0.02),std('#e8364b'));flag.position.set(0.32,2.85,0);g.add(flag);
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}
function starIcon(){const sh=new T.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?0.32:0.72;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?sh.lineTo(x,y):sh.moveTo(x,y);}sh.closePath();
  const geo=new T.ExtrudeGeometry(sh,{depth:0.18,bevelEnabled:true,bevelThickness:0.1,bevelSize:0.08,bevelSegments:3});geo.center();
  const m=new T.Mesh(geo,std('#ffd23f',{roughness:0.25,metalness:0.4,emissive:C('#ffb800'),emissiveIntensity:0.45}));m.castShadow=true;const g=new T.Group();g.add(m);return g;}
function castleIcon(){const g=new T.Group();const w=std('#f1e4c6',{roughness:0.7}),r=std('#e8364b',{roughness:0.5}),d=std('#2b2f45');
  const keep=new T.Mesh(new L.RBox(1.3,1.0,0.8,2,0.1),w);keep.position.y=0.6;g.add(keep);
  for(const sx of[-1,1]){const t=new T.Mesh(new T.CylinderGeometry(0.3,0.33,1.6,16),w);t.position.set(sx*0.72,0.8,0);g.add(t);
    const c=new T.Mesh(new T.ConeGeometry(0.42,0.75,16),r);c.position.set(sx*0.72,1.95,0);g.add(c);}
  const ct=new T.Mesh(new T.ConeGeometry(0.55,0.8,4),r);ct.position.y=1.5;ct.rotation.y=Math.PI/4;g.add(ct);
  const door=new T.Mesh(new L.RBox(0.4,0.55,0.1,1,0.06),d);door.position.set(0,0.38,0.41);g.add(door);
  const pole=new T.Mesh(new T.CylinderGeometry(0.03,0.03,0.9,6),std('#1b1220'));pole.position.y=2.25;g.add(pole);
  const flag=new T.Mesh(new L.RBox(0.5,0.3,0.04,1,0.02),std('#f6c445'));flag.position.set(0.27,2.55,0);g.add(flag);
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}

/* ------------------------------------------------------------------ props: trees, flowers, clouds */
/* trees between the camera and Kinan fade out with an ordered-dither (screen-door) pattern, like Nintendo's 3D Mario games */
function dither(mat){mat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aFade;varying float vFade;').replace('#include <begin_vertex>','#include <begin_vertex>\nvFade=aFade;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vFade;\nfloat bay4(vec2 p){ivec2 i=ivec2(mod(p,4.0));int k=i.x+i.y*4;float m[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);return (m[k]+0.5)/16.0;}').replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(vFade<0.999&&bay4(gl_FragCoord.xy)>vFade)discard;');};}
function fadeTrees(dt,cam,kp){const TI=G.treeI;if(!TI)return;const ax=cam.x,ay=cam.y,az=cam.z,dx=kp.x-ax,dy=kp.y+1.2-ay,dz=kp.z-az,L2=dx*dx+dy*dy+dz*dz;let ch=false;
  for(const tr of G.trees){const t=((tr.x-ax)*dx+(tr.cy-ay)*dy+(tr.z-az)*dz)/L2;let tgt=1;
    if(t>0&&t<0.97){const px=ax+dx*t-tr.x,py=ay+dy*t-tr.cy,pz=az+dz*t-tr.z,rr=tr.r+0.9;if(px*px+py*py+pz*pz<rr*rr)tgt=0.12;}
    if(tgt===tr.f)continue;let nf=tr.f+(tgt-tr.f)*Math.min(1,dt*9);if(Math.abs(nf-tgt)<0.01)nf=tgt;tr.f=nf;ch=true;
    TI.ft.array[tr.t]=nf;if(tr.nl)for(let k=0;k<tr.nl;k++)TI.fl.array[tr.l+k]=nf;else for(let k=0;k<tr.np;k++)TI.fp.array[tr.p+k]=nf;}
  if(ch){TI.ft.needsUpdate=true;TI.fl.needsUpdate=true;TI.fp.needsUpdate=true;}}
function buildTrees(scene,spots){
  const rr=rng(21);G.trees=[];const blobs=[[0,1.45,0,0.62],[0.38,1.2,-0.1,0.42],[-0.35,1.22,0.12,0.45],[0.05,1.75,0.3,0.38],[-0.1,1.7,-0.32,0.4]];
  const round=spots.filter(s=>s.k!=='pine'),pine=spots.filter(s=>s.k==='pine');
  const leaf=new T.SphereGeometry(1,14,10),trunk=new T.CylinderGeometry(0.1,0.16,1.3,8);trunk.translate(0,0.62,0);
  const leafM=std('#ffffff',{roughness:0.8}),trunkM=std('#8a5a34',{roughness:0.85});dither(leafM);dither(trunkM);
  const tI=new T.InstancedMesh(trunk,trunkM,round.length+pine.length),lI=new T.InstancedMesh(leaf,leafM,round.length*blobs.length);
  const m=new T.Matrix4(),q=new T.Quaternion(),Y=new T.Vector3(0,1,0);let li=0,ti=0;
  const pals=[['#4cb043','#7fd14d'],['#3fa83a','#6cc845'],['#5cc23a','#8fdc55'],['#f2a93b','#ffc94a'],['#e8743b','#f6a04a']];
  for(const s of round){const sc=s.s,rot=rr()*Math.PI*2;q.setFromAxisAngle(Y,rot);const y=groundH(s.x,s.z)-0.05;G.trees.push({x:s.x,z:s.z,cy:y+1.45*sc,r:0.9*sc,t:ti,l:li,nl:5,f:1});
    m.compose(new T.Vector3(s.x,y,s.z),q,new T.Vector3(sc,sc,sc));tI.setMatrixAt(ti++,m);
    const pal=s.autumn?pals[3+(rr()<0.5?0:1)]:pals[Math.floor(rr()*3)];
    blobs.forEach((b,bi)=>{const v=new T.Vector3(b[0],b[1],b[2]).applyQuaternion(q).multiplyScalar(sc);m.compose(new T.Vector3(s.x+v.x,y+v.y,s.z+v.z),q,new T.Vector3(b[3]*sc,b[3]*sc*0.94,b[3]*sc));
      lI.setMatrixAt(li,m);lI.setColorAt(li,C(pal[bi%2]));li++;});}
  const cone=new T.ConeGeometry(1,1,12,1);cone.translate(0,0.5,0);const pI=new T.InstancedMesh(cone,leafM,pine.length*3);let pi=0;
  for(const s of pine){const sc=s.s,y=groundH(s.x,s.z)-0.05;q.identity();G.trees.push({x:s.x,z:s.z,cy:y+1.0*sc,r:0.75*sc,t:ti,p:pi,np:3,f:1});m.compose(new T.Vector3(s.x,y,s.z),q,new T.Vector3(sc,sc*0.6,sc));tI.setMatrixAt(ti++,m);
    [[0.78,0.55,1.0],[0.62,1.05,0.9],[0.44,1.5,0.85]].forEach((c,ci)=>{m.compose(new T.Vector3(s.x,y+c[1]*sc,s.z),q,new T.Vector3(c[0]*sc,c[2]*sc,c[0]*sc));pI.setMatrixAt(pi,m);pI.setColorAt(pi,C(ci%2?'#3fa65a':'#2f8f4a'));pi++;});}
  const fa=o=>{const a=new T.InstancedBufferAttribute(new Float32Array(o.count).fill(1),1);a.setUsage(T.DynamicDrawUsage);o.geometry.setAttribute('aFade',a);return a;};
  G.treeI={ft:fa(tI),fl:fa(lI),fp:fa(pI)};
  [tI,lI,pI].forEach(o=>{o.castShadow=true;o.receiveShadow=true;o.instanceMatrix.needsUpdate=true;if(o.instanceColor)o.instanceColor.needsUpdate=true;scene.add(o);});}
function buildFlowers(scene,free){
  const rr=rng(33);const geo=new T.IcosahedronGeometry(1,0);const cols=['#ffffff','#fff3a0','#ff9cc4','#ffd23f','#ffffff','#c9a7ff'];
  const list=[];for(let i=0;i<5000&&list.length<900;i++){const x=ISL.cx+(rr()*2-1)*ISL.rx,z=ISL.cz+(rr()*2-1)*ISL.rz;if(free(x,z,0.6))list.push([x,z]);}
  const I=new T.InstancedMesh(geo,std('#ffffff',{roughness:0.6,emissive:C('#ffffff'),emissiveIntensity:0.08}),list.length);const m=new T.Matrix4(),q=new T.Quaternion();
  list.forEach(([x,z],i)=>{m.compose(new T.Vector3(x,groundH(x,z)+0.1,z),q,new T.Vector3(0.16,0.1,0.16));I.setMatrixAt(i,m);I.setColorAt(i,C(cols[i%cols.length]));});
  I.instanceMatrix.needsUpdate=true;I.instanceColor.needsUpdate=true;scene.add(I);
  /* grass tufts */
  const tuft=new T.ConeGeometry(0.09,0.45,5);tuft.translate(0,0.2,0);const tl=[];
  for(let i=0;i<6000&&tl.length<1400;i++){const x=ISL.cx+(rr()*2-1)*ISL.rx,z=ISL.cz+(rr()*2-1)*ISL.rz;if(free(x,z,0.5))tl.push([x,z]);}
  const TI=new T.InstancedMesh(tuft,std('#4caf3a',{roughness:0.8}),tl.length*3);let ti=0;
  tl.forEach(([x,z],i)=>{const y=groundH(x,z);for(let k=0;k<3;k++){const a=k*2.1+x;q.setFromEuler(new T.Euler(Math.cos(a)*0.35,0,Math.sin(a)*0.35));m.compose(new T.Vector3(x+Math.cos(a)*0.08,y,z+Math.sin(a)*0.08),q,new T.Vector3(1,0.8+0.4*((k+i)%2),1));TI.setMatrixAt(ti++,m);}});
  TI.instanceMatrix.needsUpdate=true;scene.add(TI);}
function cloudGeo(rr){const s=new T.SphereGeometry(1,16,12);const parts=[[0,0,0,1],[1.1,-0.15,0.1,0.75],[-1.1,-0.2,0,0.7],[0.5,0.45,-0.2,0.7],[-0.5,0.35,0.1,0.65],[1.8,-0.35,0,0.45],[-1.8,-0.4,0.1,0.42]];
  return L.BGU.mergeGeometries(parts.map(p=>{const g=s.clone();g.scale(p[3],p[3]*0.85,p[3]*0.8);g.translate(p[0],p[1],p[2]);return g;}));}
function buildClouds(scene){const rr=rng(77);const base=cloudGeo(rr);const mat=std('#ffffff',{roughness:1,emissive:C('#ffffff'),emissiveIntensity:0.32});G.clouds=[];
  const spots=[];
  for(let i=0;i<26;i++){const a=i/26*Math.PI*2+rr()*0.2;const k=1.18+rr()*0.5;spots.push([ISL.cx+Math.cos(a)*ISL.rx*k,-6-rr()*16,ISL.cz+Math.sin(a)*ISL.rz*k,4+rr()*5]);}
  for(let i=0;i<14;i++){const a=rr()*Math.PI*2;const k=1.08+rr()*0.6;spots.push([ISL.cx+Math.cos(a)*ISL.rx*k,18+rr()*26,ISL.cz+Math.sin(a)*ISL.rz*k,3+rr()*4]);}
  for(let i=0;i<10;i++){const a=rr()*Math.PI*2;spots.push([ISL.cx+Math.cos(a)*ISL.rx*0.6,-26-rr()*10,ISL.cz+Math.sin(a)*ISL.rz*0.6,6+rr()*6]);}
  for(const [x,y,z,s] of spots){const c=new T.Mesh(base,mat);c.position.set(x,y,z);c.scale.setScalar(s);c.rotation.y=rr()*Math.PI;scene.add(c);G.clouds.push({c,x,sp:0.2+rr()*0.4,ph:rr()*6});}}

/* ------------------------------------------------------------------ city pieces */
function buildDowntown(scene){
  const rr=rng(4);const pal=['#f4d3a8','#bfe0f5','#f6c2c2','#d8e8b8','#e8d5f2','#fbe7a1','#f2f2ee','#ffd9b8'];
  /* x, z, width, depth, height, colour index (-1 = blue glass tower) */
  const B=[[-9,-22,4.5,4,9,0],[-11,-29,5,5,14,1],[-8,-39,4.5,5.5,10,2],[-14,-41,5,4.5,17,-1],[-9,-48.5,5,4.5,12,3],[2.5,-45,5,5,20,-1],[10,-50,4.5,4,11,4],
    [12,-21,4,4.5,7,5],[16.5,-26.5,3.6,3.6,12,6],[-15,-16,3.5,3.5,6,7],[8,-40,3.5,3.5,8,1],[3,-52.5,4,3.5,9,0],[19,-19,3.2,3.2,5,2],[-17,-50,4,4,8,5]];
  const bodies=[],wins=[],tops=[];G.downtown=B;
  for(const [x,z,w,d,h,ci] of B){const y=groundH(x,z)-0.2;const glass=ci<0;const col=glass?'#7cc4ef':pal[ci];
    bodies.push(at(colored(new L.RBox(w,h,d,2,0.32),col),x,y+h/2,z));
    bodies.push(at(colored(new L.RBox(w+0.3,0.35,d+0.3,1,0.12),glass?'#ffffff':'#c8574a'),x,y+h+0.05,z));
    if(glass){for(let k=1;k<h/1.6;k++)bodies.push(at(colored(new L.RBox(w+0.06,0.12,d+0.06,1,0.04),'#ffffff'),x,y+k*1.6,z));
      tops.push(at(colored(new L.RBox(w*0.55,1.2,d*0.55,1,0.15),'#a8dcff'),x,y+h+0.8,z));}
    else{tops.push(at(colored(new L.RBox(w*0.35,0.7,d*0.3,1,0.1),'#9aa5b4'),x-w*0.18,y+h+0.5,z+d*0.12));
      const cols=Math.max(2,Math.floor(w/0.85)),rows=Math.floor((h-1.2)/1.1);
      for(const face of[0,1,2,3]){const fw=face%2?d:w;const nc=face%2?Math.max(2,Math.floor(d/0.85)):cols;
        for(let r=0;r<rows;r++)for(let c=0;c<nc;c++){const off=(c-(nc-1)/2)*(fw/nc);const yy=y+1.2+r*1.1;
          let px=x,pz=z,ry=0;if(face===0){px+=off;pz+=d/2+0.02;}else if(face===2){px-=off;pz-=d/2+0.02;}else if(face===1){px+=w/2+0.02;pz+=off;ry=Math.PI/2;}else{px-=w/2+0.02;pz-=off;ry=Math.PI/2;}
          wins.push([px,yy,pz,ry]);}}}
    if(h>15){tops.push(at(colored(new T.CylinderGeometry(0.06,0.08,3,6),'#7d8591'),x,y+h+1.8,z));tops.push(at(colored(new T.SphereGeometry(0.16,8,6),'#ff3b3b'),x,y+h+3.4,z));}}
  for(const [x,z,w,d] of B){const y=groundH(x,z);bodies.push(at(colored(new L.RBox(w+1.8,0.5,d+1.8,2,0.2),'#d9d3c7'),x,y-0.08,z));}
  const bm=new T.Mesh(L.BGU.mergeGeometries(bodies.concat(tops)),VC_MAT());bm.castShadow=true;bm.receiveShadow=true;scene.add(bm);
  const wg=new L.RBox(0.42,0.6,0.1,1,0.04);const wi=new T.InstancedMesh(wg,std('#35557e',{roughness:0.25,metalness:0.1,envMapIntensity:1.2}),wins.length);
  const m=new T.Matrix4(),q=new T.Quaternion(),Y=new T.Vector3(0,1,0);
  wins.forEach((w,i)=>{q.setFromAxisAngle(Y,w[3]);m.compose(new T.Vector3(w[0],w[1],w[2]),q,new T.Vector3(1,1,1));wi.setMatrixAt(i,m);});wi.instanceMatrix.needsUpdate=true;scene.add(wi);
  /* two downtown streets: asphalt with a dashed centre line and pale curbs */
  const rd=[];for(const r of ROADS){const [x0,z0,x1,z1]=r,len=Math.hypot(x1-x0,z1-z0),ang=Math.atan2(x1-x0,z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2,y=groundH(cx,cz)+0.06;
    rd.push(at(colored(new L.RBox(3.4,0.16,len,1,0.06),'#e2ddd2'),cx,y,cz,ang));rd.push(at(colored(new L.RBox(2.8,0.18,len-0.4,1,0.06),'#6b7079'),cx,y+0.02,cz,ang));
    for(let t=1;t<len-1;t+=2.2){const f=t/len;rd.push(at(colored(new T.BoxGeometry(0.16,0.2,1.0),'#ffd23f'),lerp(x0,x1,f),y+0.04,lerp(z0,z1,f),ang));}}
  const rdm=new T.Mesh(L.BGU.mergeGeometries(rd),VC_MAT());rdm.receiveShadow=true;scene.add(rdm);
  /* street lamps along the downtown trail */
  const lamps=[];[[-1.8,-18],[5.5,-22],[1,-29],[8.5,-29],[13,-36.5],[19,-34.6]].forEach(([x,z])=>{const y=groundH(x,z);lamps.push(at(colored(new T.CylinderGeometry(0.06,0.09,2.4,8),'#3a3f48'),x,y+1.2,z));
    lamps.push(at(colored(new T.SphereGeometry(0.22,10,8),'#fff2c0'),x,y+2.5,z));});
  scene.add(new T.Mesh(L.BGU.mergeGeometries(lamps),std('#ffffff',{vertexColors:true,emissive:C('#fff2c0'),emissiveIntensity:0.0})));}
function buildFields(scene){
  for(const [x,z,w,d,col] of FIELDS){const y=groundH(x,z);const g=[];g.push(at(colored(new L.RBox(w,0.3,d,1,0.12),'#d9a646'),x,y+0.02,z));
    const rows=Math.floor(d/0.9);for(let r=0;r<rows;r++)g.push(at(colored(new L.RBox(w-0.6,0.42,0.55,1,0.2),r%2?col:'#ffd95c'),x,y+0.28,z-d/2+0.45+r*(d/rows)));
    const mesh=new T.Mesh(L.BGU.mergeGeometries(g),std('#ffffff',{vertexColors:true,roughness:0.9}));mesh.receiveShadow=true;mesh.castShadow=true;scene.add(mesh);}
  /* a red prairie grain elevator */
  const gx=-80,gz=-8+0;const y=groundH(gx,gz-12);const e=[];
  e.push(at(colored(new L.RBox(4,8,3.4,2,0.2),'#c2414f'),gx,y+4,gz-12));
  e.push(at(colored(new T.ConeGeometry(2.9,2.2,4),'#9a2f3a'),gx,y+9.1,gz-12,Math.PI/4,1,1,0.85));
  e.push(at(colored(new L.RBox(1.4,2.2,1.4,1,0.12),'#c2414f'),gx,y+10.4,gz-12));
  e.push(at(colored(new T.ConeGeometry(1.1,0.9,4),'#9a2f3a'),gx,y+12,gz-12,Math.PI/4));
  e.push(at(colored(new L.RBox(3,2.6,2.4,1,0.15),'#e0d6c4'),gx+3.4,y+1.3,gz-12));
  e.push(at(colored(new L.RBox(4.1,0.5,0.1,1,0.05),'#ffffff'),gx,y+6.6,gz-10.3));
  const em=new T.Mesh(L.BGU.mergeGeometries(e),VC_MAT());em.castShadow=true;scene.add(em);}

/* ------------------------------------------------------------------ placing the Blender models */
function place(obj,x,z,ry,s,yOff){obj.position.set(x,(yOff===undefined?groundH(x,z):yOff),z);obj.rotation.y=ry||0;if(s)obj.scale.setScalar(s);G.scene.add(obj);return obj;}
function buildModels(scene){
  const st0=[];
  const house=flatten(A.house);tuneMats(house);place(house,-66,26.2,0,1.3,groundH(-66,26.2)-0.05);
  const sign=flatten(A.sign);tuneMats(sign);place(sign,-71.5,33.2,0.5,1.0);
  const nh=flatten(A.house_small);tuneMats(nh);
  const walls=['#bfe0f5','#f6c2c2','#d8e8b8','#fbe7a1','#e8d5f2','#ffd9b8','#cfe8ff','#f4d3a8'],roofs=['#3f63a8','#2f8f83','#c2414f','#8a5a34','#5a7fc4','#e07a3a','#6b4fa0','#d8483e'];
  const homes=[[-79,27.5,0],[-54.5,26.5,0],[-80,45,Math.PI],[-71,46,Math.PI],[-61,45,Math.PI],[-51.5,46,Math.PI],[-41,44,Math.PI],[-84,35.5,Math.PI/2],[-39,35,-Math.PI/2],[-74,37.5,0.2]];
  homes.forEach(([x,z,r],i)=>{const h=nh.clone(true);recolor(h,{NWall:walls[i%8],NRoof:roofs[(i*3)%8],NDoor:roofs[(i*5+2)%8]});place(h,x,z,r,1.15,groundH(x,z)-0.05);});
  G.blockers.push([-66,26.2,4.5],[-71.5,33.2,1.6]);homes.forEach(([x,z])=>G.blockers.push([x,z,2.6]));
  /* the Broadway Bridge */
  const br=flatten(A.bridge);tuneMats(br);const ang=Math.atan2(-(BR.n[1]-BR.s[1]),BR.n[0]-BR.s[0]);
  br.scale.set(BR.half*2/24,1,1);br.position.set(BR.c[0],WATER_Y,BR.c[1]);br.rotation.y=ang;scene.add(br);
  /* Bessborough + festival */
  const bess=flatten(A.bessborough);tuneMats(bess);place(bess,84,-40.5,0,1.0,groundH(84,-40.5)-0.1);G.blockers.push([84,-40,8],[78,-40,5],[90,-40,5]);
  const cake=flatten(A.cake);tuneMats(cake);place(cake,84.5,-31.5,0,1.0);G.blockers.push([84.5,-31.5,3]);
  const tent=flatten(A.tent);tuneMats(tent);
  [[70.5,-33,0.4,'#e8414f'],[96,-31,-0.5,'#3fa7e8'],[91,-24,-0.9,'#ffd23f'],[66,-38,0.8,'#5cc23a']].forEach(([x,z,r,c])=>{const t=tent.clone(true);recolor(t,{TentStripe:c});place(t,x,z,r,1.0);G.blockers.push([x,z,2.6]);});
  /* Remai Modern on the riverbank, SaskTel Centre to the north */
  const remai=flatten(A.remai);tuneMats(remai);place(remai,34.5,-18.2,-0.3,1.0,groundH(34.5,-21)-0.2);G.blockers.push([34.5,-18.2,6.5]);
  recolor(remai,{RemaiLobby:'#7fc0ea'});const plinth=new T.Mesh(new L.RBox(10.2,4,7,2,0.25),std('#b9b2a2',{roughness:0.9}));plinth.position.set(34.5,groundH(34.5,-21)-2.15,-18.2);plinth.rotation.y=-0.3;plinth.receiveShadow=true;scene.add(plinth);
  const arena=flatten(A.sasktel);tuneMats(arena);place(arena,60,-46.5,0,1.0,groundH(60,-46.5)-0.05);G.blockers.push([60,-46.5,7.5],[60,-38.8,2.8]);
  /* Kinsmen Park rides */
  const fw=A.ferris;const wheel=findNode(fw,'FW_wheel'),gon=findNode(fw,'FW_gondola');
  const stand=findNode(fw,'FW_stand');wheel.parent.remove(wheel);gon.parent&&gon.parent.remove(gon);
  const standM=flatten(stand);tuneMats(standM);place(standM,15,-48.5,0.15,1.0);
  const wheelM=flatten(wheel);tuneMats(wheelM);wheelM.position.set(0,7,0);standM.add(wheelM);
  const gonM=flatten(gon);tuneMats(gonM);G.gondolas=[];const gcol=['#ffd23f','#ff8fb1','#3fa7e8','#5cc23a','#ff8a3d','#a46be8'];
  for(let i=0;i<12;i++){const g=gonM.clone(true);recolor(g,{GonBody:gcol[i%6],GonRoof:gcol[(i+3)%6]});standM.add(g);G.gondolas.push(g);}
  G.wheel=wheelM;G.blockers.push([15,-48.5,5.5]);
  const ca=A.carousel;const caBase=flatten(findNode(ca,'CA_base')),caSpin=flatten(findNode(ca,'CA_spin'));tuneMats(caBase);tuneMats(caSpin);
  place(caBase,30,-46,0,1.0);caBase.add(caSpin);G.carousel=caSpin;G.blockers.push([30,-46,4]);
  /* pelicans at the weir */
  const pel=flatten(A.pelican);tuneMats(pel);G.pelicans=[];
  [[-20.5,6.2,1.2],[-23,9.5,2.1],[-19,9.8,0.6],[-26,5,1.6],[-28,8.2,2.5],[-14.6,1.8,-1.4]].forEach(([x,z,r],i)=>{const p=pel.clone(true);p.position.set(x,WATER_Y-0.12+(i===5?0.45:0),z);p.rotation.y=r;p.scale.setScalar(1.25);scene.add(p);G.pelicans.push({p,x,z,ph:i*1.7,stand:i===5});});
  /* Kinan and Glitchy */
  const k=A.kinan;const piv=['Kinan_hip1','Kinan_hip-1','Kinan_sh1','Kinan_sh-1','Kinan_el1','Kinan_el-1','Kinan_head'];
  mergeRig(k,piv);tuneMats(k);const kin=new T.Group();kin.add(k);scene.add(kin);
  G.kinan=kin;G.kinanInner=k;G.piv={};piv.forEach(n=>{const o=findNode(k,n);if(o){o.userData.base=o.quaternion.clone();G.piv[n]=o;}});
  /* Glitchy, the same pixel block as in 2D World 11 (purple, magenta top, cyan band, one big eye), now Kinan's friend */
  const gl=flatten(A.glitchy);tuneMats(gl);gl.traverse(o=>{if(o.isMesh)o.material.side=T.FrontSide;});   /* his dark outline is an inside-out hull: front faces only */
  const glw=new T.Group();glw.add(gl);gl.scale.setScalar(0.85);scene.add(glw);G.glitchy=glw;G.glitchyInner=gl;
  const shadowTex=canvasTex(128,128,(g,w,h)=>{const r=g.createRadialGradient(64,64,4,64,64,62);r.addColorStop(0,'rgba(20,30,40,0.55)');r.addColorStop(1,'rgba(20,30,40,0)');g.fillStyle=r;g.fillRect(0,0,w,h);});
  const blob=new T.Mesh(new T.PlaneGeometry(1.7,1.7),new T.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));blob.rotation.x=-Math.PI/2;scene.add(blob);G.blob=blob;
  const blob2=blob.clone();blob2.scale.setScalar(0.5);scene.add(blob2);G.blob2=blob2;
  /* Kinan's equipped pets follow him */
  G.pets=petLoadout().filter(def=>A['pet_'+def.id]).map((def,i)=>{const N=def.kind==='cat'?'Cat':'Dog';const src=A['pet_'+def.id];
    if(!src.userData.rigged){mergeRig(src,[N+'_head',N+'_tail']);tuneMats(src);src.userData.rigged=true;}
    const m=src.clone(true);
    const o=new T.Group();const inner=new T.Group();inner.add(m);o.add(inner);inner.scale.setScalar(PET_SCALE[def.kind]);scene.add(o);
    const b=blob.clone();b.scale.setScalar(0.55);scene.add(b);
    return {def,o,inner,head:findNode(m,N+'_head'),tail:findNode(m,N+'_tail'),blob:b,pos:new T.Vector3(),face:0,ph:i*2.1+0.4,hopT:-1,hopH:0,trot:0,idleHop:3+i*1.7};});}
/* join each rig part's meshes into one mesh per material, parented to its pivot (fewer draw calls, pivots still animate) */
function mergeRig(root,pivots){const pset=new Set(pivots);const groups=new Map();
  root.traverse(o=>{if(o.isMesh){let p=o.parent;while(p&&p!==root&&!pset.has(p.name))p=p.parent;const key=p&&pset.has(p.name)?p:root;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o);}});
  for(const [pv,ms] of groups){const merged=mergeMeshes(ms,pv);ms.forEach(m=>m.parent.remove(m));merged.forEach(m=>pv.add(m));}}
/* the equipped cat + dog from the Kinan vs. Mom save when this page shares its storage; otherwise Ginger and Chikastino */
function petLoadout(){let ids=null,names={};
  try{const p=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(p&&p.pets){const e=[p.pets.equippedCat,p.pets.equippedDog].filter(id=>id&&PETS[id]);if(e.length||'equippedCat' in p.pets||'equippedDog' in p.pets)ids=e;if(p.pets.names&&typeof p.pets.names==='object')names=p.pets.names;}}catch(_){}
  return (ids||['cat1','dog1']).map(id=>Object.assign({id},PETS[id],{name:String(names[id]||PETS[id].name).slice(0,24)}));}

/* weir, festival balloons, fireworks */
function buildWeir(scene){
  const x=-14.6,z=riverZ(x);const [tx,tz]=riverTan(x);const ang=Math.atan2(-tz,tx)+Math.PI/2;
  const w=new T.Mesh(new L.RBox(16,0.7,1.3,2,0.25),std('#d8d1c2',{roughness:0.8}));w.position.set(x,WATER_Y-0.18,z);w.rotation.y=ang;w.castShadow=w.receiveShadow=true;scene.add(w);
  const foam=new T.Group();foam.position.set(x+tx*1.2,WATER_Y+0.02,z+tz*1.2);foam.rotation.y=ang;scene.add(foam);
  const fm=std('#ffffff',{roughness:1,emissive:C('#ffffff'),emissiveIntensity:0.4,transparent:true,opacity:0.92});const sp=new T.SphereGeometry(1,10,8);G.foam=[];const rr=rng(3);
  for(let i=0;i<34;i++){const b=new T.Mesh(sp,fm);const u=(rr()-0.5)*12.5,v=rr()*3.2;b.position.set(u,0,v);const s=0.25+rr()*0.45;b.scale.set(s,s*0.55,s);foam.add(b);G.foam.push({b,u,v,ph:rr()*6,s});}}
function buildFestival(scene){
  const rr=rng(8);const cols=['#e8414f','#ffd23f','#3fa7e8','#ff8fb1','#5cc23a','#a46be8','#ff8a3d'];
  const bal=new T.SphereGeometry(1,16,12);bal.scale(1,1.18,1);const spots=[];
  const clusters=[[72.5,-31],[93,-34],[78.5,-36.5],[90.5,-28],[97,-24],[69,-36]];
  for(const [cx,cz] of clusters)for(let i=0;i<6;i++)spots.push([cx+(rr()-0.5)*2.2,cz+(rr()-0.5)*2.2,2.6+rr()*1.8,cols[Math.floor(rr()*cols.length)],cx,cz,groundH(cx,cz)]);
  const I=new T.InstancedMesh(bal,std('#ffffff',{roughness:0.25,envMapIntensity:1.1}),spots.length);G.balloons={I,spots};
  spots.forEach((s,i)=>I.setColorAt(i,C(s[3])));I.instanceColor.needsUpdate=true;I.castShadow=true;scene.add(I);
  const lines=[];for(const s of spots){const y0=groundH(s[4],s[5]);lines.push(s[4],y0+1.0,s[5],s[0],y0+s[2]-0.4,s[1]);}
  const lg=new T.BufferGeometry();lg.setAttribute('position',new T.Float32BufferAttribute(lines,3));scene.add(new T.LineSegments(lg,new T.LineBasicMaterial({color:C('#ffffff'),transparent:true,opacity:0.7})));
  const posts=[];for(const [cx,cz] of clusters){const y=groundH(cx,cz);posts.push(at(colored(new T.CylinderGeometry(0.06,0.06,1.2,6),'#ffffff'),cx,y+0.6,cz));}
  scene.add(new T.Mesh(L.BGU.mergeGeometries(posts),VC_MAT()));
  /* bunting across the lawn */
  const flagG=[];const strand=(a,b,n)=>{for(let i=0;i<=n;i++){const t=i/n;const x=lerp(a[0],b[0],t),z=lerp(a[1],b[1],t);const y=lerp(a[2],b[2],t)-Math.sin(Math.PI*t)*0.9;
    const tri=new T.ConeGeometry(0.22,0.45,3);tri.rotateX(Math.PI);flagG.push(at(colored(tri,cols[i%cols.length]),x,y-0.22,z,Math.atan2(b[0]-a[0],b[1]-a[1])));}};
  const pole=(x,z,h)=>[x,z,groundH(x,z)+h];
  const P1=pole(70,-38.5,3.8),P2=pole(84,-35.2,3.8),P3=pole(98,-38.5,3.8);
  strand(P1,P2,14);strand(P2,P3,16);
  const pp=[P1,P2,P3].map(p=>at(colored(new T.CylinderGeometry(0.08,0.1,3.7,8),'#ffffff'),p[0],p[2]-1.85,p[1]));
  scene.add(new T.Mesh(L.BGU.mergeGeometries(flagG.concat(pp)),VC_MAT()));
  /* fireworks */
  const N=600;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(N*3),3));g.setAttribute('color',new T.Float32BufferAttribute(new Float32Array(N*4),4));
  const tex=canvasTex(64,64,(c,w,h)=>{const r=c.createRadialGradient(32,32,0,32,32,30);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(0.5,'rgba(255,255,255,1)');r.addColorStop(0.75,'rgba(255,255,255,0.55)');r.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=r;c.fillRect(0,0,w,h);});
  const pm=new T.PointsMaterial({size:2.4,map:tex,vertexColors:true,transparent:true,depthWrite:false,fog:false});
  const pts=new T.Points(g,pm);pts.frustumCulled=false;scene.add(pts);
  G.fw={pts,N,parts:[],next:0.4,rr:rng(99)};}
function burst(x,y,z,big){const f=G.fw,rr=f.rr;const col=C(['#ff2d55','#ffb300','#1e9bff','#22d36b','#ff3df0','#8a5cff'][Math.floor(rr()*6)]);const n=big?90:60;
  for(let i=0;i<n;i++){const u=rr()*2-1,a=rr()*Math.PI*2,s=Math.sqrt(1-u*u);const v=(big?9:7)*(0.75+rr()*0.35);
    f.parts.push({x,y,z,vx:Math.cos(a)*s*v,vy:u*v,vz:Math.sin(a)*s*v,t:0,life:1.3+rr()*0.5,c:col});}
  if(f.parts.length>f.N)f.parts.splice(0,f.parts.length-f.N);}

/* ------------------------------------------------------------------ build everything once */
function buildWorld(){
  const scene=new T.Scene();G={scene,blockers:[]};
  const r=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));r.outputColorSpace=T.SRGBColorSpace;r.toneMapping=T.NoToneMapping;
  r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;G.renderer=r;
  const pm=new T.PMREMGenerator(r);scene.environment=pm.fromScene(new L.Room(),0.04).texture;pm.dispose();
  const cam=new T.PerspectiveCamera(38,432/240,0.3,1400);G.camera=cam;
  /* sky */
  const sky=new T.Mesh(new T.SphereGeometry(900,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,
    uniforms:{top:{value:C('#2a7fe6')},mid:{value:C('#86c8ff')},bot:{value:C('#e4f5ff')}},
    vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform vec3 top,mid,bot;varying vec3 vP;void main(){float h=vP.y;vec3 c=h>0.0?mix(mid,top,smoothstep(0.0,0.6,h)):mix(mid,bot,smoothstep(0.0,-0.4,h));gl_FragColor=vec4(c,1.0);\n#include <colorspace_fragment>\n}'}));
  sky.renderOrder=-1;scene.add(sky);G.sky=sky;
  scene.fog=new T.Fog(C('#cfe8ff'),170,520);
  const hemi=new T.HemisphereLight(C('#dff0ff'),C('#6f9d52'),0.95);scene.add(hemi);
  const sun=new T.DirectionalLight(C('#fff2da'),3.1);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  const sc=sun.shadow.camera;sc.left=-46;sc.right=46;sc.top=46;sc.bottom=-46;sc.near=1;sc.far=260;sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.04;
  scene.add(sun);scene.add(sun.target);G.sun=sun;
  /* layout */
  const c=new T.CatmullRomCurve3(RIVER.map(p=>new T.Vector3(p[0],0,p[1])),false,'centripetal');RIV=c.getSpacedPoints(RIVER.length*26).map(p=>[p.x,p.z]);
  buildPaths();
  buildTerrain(scene);buildWater(scene);buildTrail(scene);buildNodes(scene);
  buildModels(scene);buildWeir(scene);buildSandbar(scene);buildRailBridge(scene);buildDowntown(scene);buildFields(scene);buildFestival(scene);buildClouds(scene);
  /* scatter trees where nothing else stands */
  const blocked=(x,z,r)=>{if(islF(x,z)>0.9)return true;if(riverD(x,z)<8.2)return true;if(sandbarR(x,z)<1.6)return true;
    for(const b of G.blockers)if(Math.hypot(x-b[0],z-b[1])<b[2]+r)return true;
    for(const f of FIELDS)if(Math.abs(x-f[0])<f[2]/2+r&&Math.abs(z-f[1])<f[3]/2+r)return true;
    for(const b of G.downtown)if(Math.abs(x-b[0])<b[2]/2+r+0.5&&Math.abs(z-b[1])<b[3]/2+r+0.5)return true;
    const [al,ac]=bridgeLocal(x,z);if(Math.abs(al)<20&&Math.abs(ac)<4+r)return true;
    if(G.rail){const dx=x-G.rail.x,dz=z-G.rail.z,c=Math.cos(G.rail.ang),s=Math.sin(G.rail.ang),u=dx*c-dz*s,v=dx*s+dz*c;if(Math.abs(v)<G.rail.half+3&&Math.abs(u)<3+r)return true;}
    if(Math.pow((x-LAWN.x)/LAWN.a,2)+Math.pow((z-LAWN.z)/LAWN.b,2)<1.1)return true;
    if(Math.hypot(x+80,z+20)<6)return true;
    for(const [x0,z0,x1,z1] of ROADS){const dx=x1-x0,dz=z1-z0,t=clamp(((x-x0)*dx+(z-z0)*dz)/(dx*dx+dz*dz),0,1);if(Math.hypot(x0+dx*t-x,z0+dz*t-z)<2.2+r)return true;}
    return nearPath(x,z,2.4+r);};
  const rr=rng(42);const spots=[];
  for(let i=0;i<9000&&spots.length<430;i++){const x=ISL.cx+(rr()*2-1)*ISL.rx,z=ISL.cz+(rr()*2-1)*ISL.rz;const s=1.0+rr()*0.9;const plaza=inPlaza(x,z);
    if(plaza&&rr()<0.5)continue;if(blocked(x,z,s*0.8))continue;let ok=true;for(const q of spots)if(Math.hypot(q.x-x,q.z-z)<(q.s+s)*0.85){ok=false;break;}if(!ok)continue;
    const d=riverD(x,z);spots.push({x,z,s:plaza?0.9:s,k:(d<15&&rr()<0.35)||rr()<0.14?'pine':'round',autumn:rr()<0.1});}
  buildTrees(scene,spots);
  buildFlowers(scene,(x,z,r)=>!blocked(x,z,r)&&!inPlaza(x,z)&&!spots.some(q=>Math.abs(q.x-x)<q.s*0.9&&Math.abs(q.z-z)<q.s*0.9));
  scene.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshStandardMaterial&&o.material.envMapIntensity===1&&!o.material.userData.t)o.material.envMapIntensity=0.5;});
  /* everything that "pops up" out of the flat 2D map during the World 11 -> 12 transition lives in one group */
  const keep=new Set([sky,hemi,sun,sun.target,G.kinan,G.glitchy,G.blob,G.blob2,G.fw.pts].concat(G.pets.map(p=>p.o),G.pets.map(p=>p.blob),G.clouds.map(c=>c.c)));
  G.world=new T.Group();scene.children.slice().forEach(o=>{if(!keep.has(o))G.world.add(o);});scene.add(G.world);
  cam.position.set(-66,12,46);cam.lookAt(-66,0,34);try{r.compile(scene,cam);}catch(_){}}

/* ------------------------------------------------------------------ overlay (HUD, plaque, banner, loading) */
function css(){if(document.getElementById('k3-style'))return;const s=document.createElement('style');s.id='k3-style';s.textContent=`
.k3-wrap{position:absolute;inset:0;overflow:hidden;container-type:inline-size;font-family:'Pixelify Sans','Courier New',monospace;user-select:none;-webkit-user-select:none;background:linear-gradient(#2a7fe6,#86c8ff 70%,#e4f5ff);--u:calc(100cqw/432)}
.k3-wrap canvas{position:absolute;inset:0;display:block;width:100%!important;height:100%!important;image-rendering:auto;transition:none;transform:none;aspect-ratio:auto;max-width:none}
.k3-box{position:absolute;top:calc(6*var(--u));height:calc(18*var(--u));line-height:calc(18*var(--u));background:rgba(17,19,43,.86);border-top:max(1px,var(--u)) solid #3a3f86;border-bottom:max(1px,var(--u)) solid #3a3f86;box-sizing:border-box;white-space:pre;padding:0 calc(7*var(--u))}
.k3-hl{left:calc(6*var(--u));color:#f6c445;font-weight:700;font-size:calc(9*var(--u))}
.k3-hr{right:calc(6*var(--u));color:#eef0ff;font-weight:400;font-size:calc(8*var(--u));min-width:calc(82*var(--u));padding-left:calc(8*var(--u))}
.k3-hr b{color:#f6c445;font-weight:700}
.k3-plq{position:absolute;left:50%;bottom:calc(6*var(--u));transform:translateX(-50%);background:#141632;color:#f6c445;font-weight:700;font-size:calc(10*var(--u));line-height:calc(18*var(--u));padding:0 calc(13*var(--u));white-space:pre;
  border:calc(2*var(--u)) solid #c9922f;border-top-color:#ffe58a;box-shadow:0 0 0 calc(2*var(--u)) #1b1220;transition:opacity .18s;opacity:0}
.k3-peek{position:absolute;left:50%;top:calc(30*var(--u));transform:translateX(-50%);background:#2a7fd0;color:#fff;font-weight:700;font-size:calc(8*var(--u));line-height:calc(14*var(--u));padding:0 calc(10*var(--u));white-space:pre;box-shadow:0 0 0 calc(2*var(--u)) #1b1220;pointer-events:none}
.k3-dim{position:absolute;inset:0;background:rgba(10,10,30,.55);opacity:0;pointer-events:none}
.k3-ban{position:absolute;left:50%;top:calc(98*var(--u));transform:translateX(-50%);background:#e8364b;color:#fff;font-weight:700;font-size:calc(12*var(--u));line-height:calc(28*var(--u));padding:0 calc(15*var(--u));white-space:pre;box-shadow:0 0 0 calc(2*var(--u)) #1b1220;opacity:0}
.k3-sub{position:absolute;left:0;right:0;top:calc(136*var(--u));text-align:center;color:#eef0ff;font-size:calc(8*var(--u));opacity:0}
.k3-fade{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none}
.k3-load{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(8*var(--u));color:#fff;font-weight:700;font-size:calc(12*var(--u));text-shadow:0 calc(2*var(--u)) 0 #1b1220;transition:opacity .4s}
.k3-bar{width:calc(140*var(--u));height:calc(8*var(--u));background:rgba(17,19,43,.6);border:calc(2*var(--u)) solid #1b1220}
.k3-bar i{display:block;height:100%;width:0;background:#f6c445;transition:width .2s}
.k3-small{font-size:calc(8*var(--u));font-weight:400}
.k3-rumble{animation:k3rumble .14s steps(2) infinite}
@keyframes k3rumble{0%{transform:translate(2px,0)}50%{transform:translate(-2px,1px)}100%{transform:translate(1px,-1px)}}`;document.head.appendChild(s);}
function el(cls,parent,txt){const e=document.createElement('div');e.className=cls;if(txt)e.textContent=txt;parent.appendChild(e);return e;}
function buildOverlay(){
  css();const w=document.createElement('div');w.className='k3-wrap';w.setAttribute('role','img');w.setAttribute('aria-label','3D map of Saskatoon. Kinan walks the trail between levels with the arrow keys.');
  const ui={wrap:w};ui.stage=el('k3-stage',w);ui.stage.style.cssText='position:absolute;inset:0';
  ui.hl=el('k3-box k3-hl',w,'WORLD 12   3D SASKATOON');ui.hr=el('k3-box k3-hr',w);ui.hr.innerHTML='CANDLES  <b>0</b>';
  /* the sneak peek (2026-10-30, opts.peek from the map engine): a sign that stays up while Kinan is on this map */
  if(st.opts&&st.opts.peek){ui.peek=el('k3-peek',w,'SNEAK PEEK!  4 LEVELS ARE OPEN. MUCH MORE IS COMING!');ui.peek.setAttribute('role','note');}
  ui.plq=el('k3-plq',w);ui.dim=el('k3-dim',w);ui.ban=el('k3-ban',w);ui.sub=el('k3-sub',w);ui.fade=el('k3-fade',w);
  ui.load=el('k3-load',w);ui.lt=el('',ui.load,'LOADING 3D SASKATOON...');const bar=el('k3-bar',ui.load);ui.lb=document.createElement('i');bar.appendChild(ui.lb);ui.ls=el('k3-small',ui.load,'');
  st.ui=ui;return w;}
function setLoad(){if(st.ui&&st.ui.lb)st.ui.lb.style.width=Math.round(progress*100)+'%';}

/* ------------------------------------------------------------------ runtime */
function stopYaw(k){if(VIEW[k]!==null&&VIEW[k]!==undefined)return VIEW[k]*D2R;const R=k>0?G.routes[k-1]:G.routes[0];return k>0?routeYaw(R,R.len):routeYaw(R,0);}
function routeYaw(R,u){const a=R.at(u-3),b=R.at(u+5);return Math.atan2(b.x-a.x,-(b.z-a.z));}
function kinanPos(out){const w=st.walk;if(!w)return out.copy(G.stopPos[st.at]);const R=G.routes[w.i];return R.at(w.dir>0?w.s:R.len-w.s,out);}
function snapTo(k){st.at=clamp(k,0,10);st.walk=null;st.queue=0;st.banner=null;st.leaving=0;st.jump=-1;
  st.camYaw=stopYaw(st.at);st.zoom=zoomOf(st.at).slice();st.camTgt=G.stopPos[st.at].clone();st.face=-st.camYaw;st.walkAmt=0;
  G.glitchy.position.copy(G.stopPos[st.at]).add(new T.Vector3(1.5,2.4,0));
  st.crumbs=[];st.idleT=2;const kp=G.stopPos[st.at];G.pets.forEach((p,i)=>{const s=petSpot(kp,i);p.pos.set(s[0],s[1],s[2]);p.face=-st.camYaw;p.hopT=-1;p.hopDelay=0;});}
/* where a pet sits while Kinan waits: beside him, a little toward the camera (cat on his left, dog on his right) */
function petSpot(kp,i){const lx=Math.sin(st.camYaw),lz=-Math.cos(st.camYaw),rx=Math.cos(st.camYaw),rz=Math.sin(st.camYaw),side=i%2?1:-1;
  const x=kp.x+rx*side*1.4-lx*0.8,z=kp.z+rz*side*1.4-lz*0.8;return [x,surfH(x,z)+(nearPath(x,z,1.25)?0.16:0),z];}
function kinanJump(){st.jump=0;G.pets.forEach((p,i)=>{p.hopDelay=0.06+i*0.12;p.hopH=0.8;});}
function updatePets(dt,t,kp,moving){
  const cr=st.crumbs,last=cr[0];
  if(!last||Math.hypot(kp.x-last[0],kp.z-last[2])>0.12){cr.unshift([kp.x,kp.y,kp.z]);if(cr.length>160)cr.pop();}
  st.idleT=moving?0:st.idleT+dt;
  G.pets.forEach((p,i)=>{let tx,ty,tz;
    if(st.idleT<0.6){/* trot along Kinan's footsteps, spaced out behind him */
      const want=1.6+i*1.3;let acc=0,px=kp.x,py=kp.y,pz=kp.z;
      for(const c of cr){const d=Math.hypot(c[0]-px,c[2]-pz);if(acc+d>=want){const f=(want-acc)/(d||1);px+=(c[0]-px)*f;py+=(c[1]-py)*f;pz+=(c[2]-pz)*f;break;}acc+=d;px=c[0];py=c[1];pz=c[2];}
      tx=px;ty=py;tz=pz;}
    else{const s=petSpot(kp,i);tx=s[0];ty=s[1];tz=s[2];}
    const dx=tx-p.pos.x,dz=tz-p.pos.z,dist=Math.hypot(dx,dz),k=1-Math.exp(-dt*(st.idleT<0.6?7:3.2));
    p.pos.x+=dx*k;p.pos.z+=dz*k;p.pos.y+=(ty-p.pos.y)*Math.min(1,dt*10);
    const spd=dist*k/Math.max(dt,1e-4);p.trot=lerp(p.trot,spd>0.6?1:0,1-Math.exp(-dt*8));
    p.face=spd>0.3?lerpAng(p.face,Math.atan2(dx,dz),1-Math.exp(-dt*10)):lerpAng(p.face,-st.camYaw+(i%2?-0.5:0.5),1-Math.exp(-dt*3));
    p.ph+=dt*(4+Math.min(spd,10)*1.6);
    if(p.hopDelay>0){p.hopDelay-=dt;if(p.hopDelay<=0)p.hopT=0;}
    if(st.idleT>1.5){p.idleHop-=dt;if(p.idleHop<=0){p.idleHop=3.5+((t*7.3+i*3.1)%4);if(p.hopT<0){p.hopT=0;p.hopH=0.35;}}}
    let hy=0;if(p.hopT>=0){p.hopT+=dt;const h=p.hopT/0.45;if(h>=1)p.hopT=-1;else hy=Math.sin(Math.PI*h)*p.hopH;}
    const trotY=Math.abs(Math.sin(p.ph))*0.15*p.trot,cat=p.def.kind==='cat';
    p.o.position.set(p.pos.x,p.pos.y+hy+trotY,p.pos.z);p.o.rotation.y=p.face;
    p.inner.rotation.x=Math.cos(p.ph)*0.12*p.trot-(hy>0?0.25*Math.cos(Math.PI*p.hopT/0.45):0);
    p.inner.scale.y=p.inner.scale.x*(1+Math.sin(t*3+i)*0.02*(1-p.trot));
    if(p.tail)p.tail.rotation.y=Math.sin(t*(cat?2.4:10)+i)*(cat?0.5:0.65);
    if(p.head){p.head.rotation.z=Math.sin(t*1.2+i*2)*0.14*(1-p.trot);p.head.rotation.x=Math.sin(t*2.3+i)*0.07;}
    p.blob.position.set(p.pos.x,p.pos.y+0.03,p.pos.z);p.blob.scale.setScalar(0.55*(1-Math.min(0.5,hy*0.45)));});}

/* ------------------------------------------------------------------ World 11 -> 12: Glitchy repaints the flat map into 3D */
/* Shad's ruling for the final cutscene: Glitchy glows and repaints the world into 3D, spreading out from Glitchy.
   On the World 11 castle Glitchy's own map sprite (over his core) is off the top of the screen, so he glitches in beside
   Kinan, at the spot where 3D Glitchy floats (Kinan's right shoulder), glows, and the repaint wave starts at him. */
const TR_DUR=4.0,TR_G=0.55;   /* TR_G: how long Glitchy glows on the flat map before the first tile turns */
const easeBack=t=>{const c=1.70158,u=t-1;return 1+(c+1)*u*u*u+c*u*u;};
/* Glitchy as World 11 draws him (worlds/w11.js w11_glitchy), centred on (X, Y) in 432 x 240 map pixels */
function drawGlitchy2D(g,X,Y,k){const x0=X-9,y0=Y-8,r=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(Math.round(x*k),Math.round(y*k),Math.round(w*k),Math.round(h*k));};
  r('#1b1220',x0-1,y0-1,20,18);r('#7a2fd0',x0,y0,18,16);r('#ff3df0',x0,y0,18,3);r('#00ffd0',x0,y0+12,18,2);
  r('#ffffff',x0+5,y0+4,8,7);r('#1b1220',x0+8,y0+6,3,3);r('#1b1220',x0+4,y0+13,10,1);
  r('#7a2fd0',x0-4,y0+5,4,3);r('#7a2fd0',x0+18,y0+5,4,3);[[2,-4],[8,-6],[14,-4]].forEach(([a,c])=>r('#00ffd0',x0+a,y0+c,2,4));}
function beginTransition(cv){
  /* where the 2D Kinan stands on screen, in the engine's 432 x 240 view (its camera centres him at 50% / 55%) */
  let sx=216,sy=134;
  try{const w=KINAN.cur(),s=w.stops[w.stops.length-1].at;sx=s[0]-clamp(s[0]-216,0,Math.max(0,w.WW-432));sy=s[1]-clamp(s[1]-132,0,Math.max(0,w.WH-240))+2;}catch(_){}
  const gsx=clamp(sx+24,16,416),gsy=clamp(sy-19,14,226);           /* Glitchy beside him, at his right shoulder */
  const snap=document.createElement('canvas');snap.width=cv.width||1296;snap.height=cv.height||720;const sg=snap.getContext('2d');sg.drawImage(cv,0,0);
  drawGlitchy2D(sg,gsx,gsy,snap.width/432);
  const tex=new T.CanvasTexture(snap);tex.colorSpace=T.SRGBColorSpace;tex.generateMipmaps=false;tex.minFilter=T.NearestFilter;tex.magFilter=T.NearestFilter;
  const cam=G.camera,H=30,Wd=H*cam.aspect,d=(H/2)/Math.tan(cam.fov*D2R/2),k0=G.stopPos[0],yp=k0.y+0.02;
  const cx=k0.x-(sx/432-0.5)*Wd,cz=k0.z-(sy/240-0.5)*H,x0=cx-Wd/2,z0=cz-H/2;
  const NX=27,NY=15,tw=Wd/NX,th=H/NY,tiles=[],pos=new Float32Array(NX*NY*18),uv=new Float32Array(NX*NY*12),col=new Float32Array(NX*NY*24).fill(1);
  const ksx=x0+sx/432*Wd,ksz=z0+sy/240*H,gx=x0+gsx/432*Wd,gz=z0+gsy/240*H;let maxd=0;
  for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const tx=x0+(i+0.5)*tw,tz=z0+(j+0.5)*th,dd=Math.hypot(tx-gx,tz-gz);maxd=Math.max(maxd,dd);tiles.push({x:tx,z:tz,d:dd,h:((i*7919+j*104729)%97)/97});
    const u0=i/NX,u1=(i+1)/NX,v0=1-j/NY,v1=1-(j+1)/NY,o=(j*NX+i)*12;uv.set([u0,v0,u0,v1,u1,v0,u1,v0,u0,v1,u1,v1],o);}
  /* the repaint wave: each tile turns when the wave from Glitchy reaches it, then flips up and away from him */
  const WAVE=1.5;
  tiles.forEach(t=>{t.delay=TR_G+WAVE*t.d/maxd+t.h*0.12;const l=t.d||1;t.ox=(t.x-gx)/l;t.oz=(t.z-gz)/l;t.tint=t.h<0.5?[1.75,0.85,1.8]:[0.85,1.8,1.7];});
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setAttribute('color',new T.BufferAttribute(col,4));
  const m=new T.MeshBasicMaterial({map:tex,vertexColors:true,transparent:true,side:T.DoubleSide,fog:false,depthWrite:false,depthTest:false});
  const mesh=new T.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=10;G.scene.add(mesh);
  /* Glitchy's glow (drawn over everything) and the glowing ring at the front of the wave */
  const gtex=canvasTex(128,128,(c,w,h)=>{const q=c.createRadialGradient(64,64,0,64,64,64);q.addColorStop(0,'rgba(255,190,252,0.75)');q.addColorStop(0.28,'rgba(255,61,240,0.7)');
    q.addColorStop(0.58,'rgba(0,255,208,0.38)');q.addColorStop(1,'rgba(0,255,208,0)');c.fillStyle=q;c.fillRect(0,0,w,h);});
  const glow=new T.Sprite(new T.SpriteMaterial({map:gtex,blending:T.AdditiveBlending,transparent:true,depthTest:false,depthWrite:false,fog:false}));
  glow.renderOrder=12;glow.frustumCulled=false;G.scene.add(glow);
  const ring=new T.Mesh(new T.RingGeometry(0.95,1,72),new T.MeshBasicMaterial({color:C('#ff7cf5'),blending:T.AdditiveBlending,transparent:true,depthTest:false,depthWrite:false,fog:false,side:T.DoubleSide}));
  ring.rotation.x=-Math.PI/2;ring.position.set(gx,yp+0.05,gz);ring.renderOrder=11;ring.frustumCulled=false;ring.visible=false;G.scene.add(ring);
  /* 3D Glitchy first appears exactly over his 2D sprite: on the camera ray through it, 1.6 above the map */
  const GH=1.6,f=1-GH/d,anchor=new T.Vector3(cx+(gx-cx)*f,yp+GH,cz+(gz-cz)*f);
  const kStart=TR_G+WAVE*Math.hypot(ksx-gx,ksz-gz)/maxd;              /* Kinan stands up when the wave reaches him */
  st.tr={t:0,hold:null,mesh,tex,tiles,tw,th,yp,maxd,WAVE,kStart,anchor,glow,gtex,ring,qb:new T.Quaternion(),qn:new T.Quaternion(),
    P0:new T.Vector3(cx,yp+d,cz),q0:new T.Quaternion().setFromEuler(new T.Euler(-Math.PI/2,0,0)),dummy:new T.PerspectiveCamera()};
  G.world.scale.y=0.02;[G.kinan,G.glitchy,G.blob,G.blob2].concat(G.pets.map(p=>p.o),G.pets.map(p=>p.blob)).forEach(o=>{o.visible=false;});
  G.glitchy.position.copy(anchor);
  if(st.ui){st.ui.hl.style.opacity='0';st.ui.hr.style.opacity='0';}}
/* advances the transition; returns true while it owns the camera */
function trUpdate(dt,cp,cl){
  const r=st.tr;if(!r)return false;
  if(r.hold!==null)r.t=r.hold*TR_DUR;else r.t+=dt;
  const t=r.t;if(t>=TR_DUR){endTransition();return false;}
  /* tiles: a glitch shiver, then, as the wave from Glitchy reaches each one, it flashes, flips and flies up and away */
  const pa=r.mesh.geometry.attributes.position.array,ca=r.mesh.geometry.attributes.color.array,hw=r.tw/2,hh=r.th/2,flick=Math.floor(t/0.06);
  r.tiles.forEach((tl,n)=>{const p=clamp((t-tl.delay)/0.6,0,1),a=p*2.4,s=1-p*0.65,ca_=Math.cos(a),sa=Math.sin(a);
    let jx=0;if(t>0.12&&t<TR_G&&((n*31+flick*17)%23)===0)jx=(((n+flick)%2)?1:-1)*0.45;
    const cx=tl.x+tl.ox*p*2.2+jx,cy=r.yp+p*p*6+p*1.2,cz=tl.z+tl.oz*p*2.2,o=n*18;
    const corner=(k,lx,lz)=>{pa[o+k*3]=cx+lx*s;pa[o+k*3+1]=cy-lz*s*sa;pa[o+k*3+2]=cz+lz*s*ca_;};
    corner(0,-hw,-hh);corner(1,-hw,hh);corner(2,hw,-hh);corner(3,hw,-hh);corner(4,-hw,hh);corner(5,hw,hh);
    const fl=p>0&&p<0.45?Math.sin(Math.PI*p/0.45):0,al=Math.pow(1-p,1.3),tn=tl.tint;
    for(let k=0;k<6;k++){const c=n*24+k*4;ca[c]=1+fl*(tn[0]-1);ca[c+1]=1+fl*(tn[1]-1);ca[c+2]=1+fl*(tn[2]-1);ca[c+3]=al;}});
  r.mesh.geometry.attributes.position.needsUpdate=true;r.mesh.geometry.attributes.color.needsUpdate=true;
  const wr=clamp((t-TR_G)/r.WAVE,0,1.08);r.ring.visible=wr>0&&wr<1.08;r.ring.scale.setScalar(Math.max(0.01,wr*r.maxd));r.ring.material.opacity=0.85*(1-sstep(0.8,1.08,wr));
  /* the flat world pops up out of the map; Kinan stands up where his 2D sprite was when the wave reaches him; then the pets */
  G.world.scale.y=0.02+0.98*easeBack(clamp((t-0.75)/1.5,0,1));
  const kr=clamp((t-r.kStart)/0.55,0,1);G.kinan.visible=G.blob.visible=kr>0;G.kinan.scale.set(1,0.03+0.97*easeBack(kr),1);
  G.pets.forEach((p,i)=>{const q=clamp((t-r.kStart-0.4-i*0.15)/0.5,0,1);p.o.visible=p.blob.visible=q>0;p.o.scale.setScalar(easeBack(q));if(q>0&&q<0.05&&p.hopT<0){p.hopT=0;p.hopH=0.6;}});
  if(st.ui){const hu=clamp((t-3.2)/0.6,0,1);st.ui.hl.style.opacity=String(hu);st.ui.hr.style.opacity=String(hu);}
  /* camera: straight down over the map, tilting into the behind-and-above follow view */
  const e=ease(clamp((t-0.35)/2.7,0,1));r.dummy.position.copy(cp);r.dummy.lookAt(cl);
  G.camera.position.lerpVectors(r.P0,cp,e);G.camera.quaternion.slerpQuaternions(r.q0,r.dummy.quaternion,e);
  /* Glitchy: pops out of his 2D sprite already big (the sprite's size), facing the camera, then shrinks and floats over to
     his usual spot at Kinan's shoulder (tmp.q, set by update() this frame) as the camera tilts down */
  const gq=clamp((t-0.42)/0.38,0,1),gb=sstep(1.5,3.3,t);G.glitchy.visible=gq>0;G.blob2.visible=gb>0.35;
  G.glitchy.scale.setScalar(easeBack(gq)*lerp(2.8,1,sstep(1.3,3.1,t)));G.glitchyInner.rotation.y=0;
  G.glitchy.position.lerpVectors(r.anchor,tmp.q,gb);
  r.qn.setFromEuler(new T.Euler(0,G.glitchy.rotation.y,0));r.qb.copy(G.camera.quaternion);G.glitchy.quaternion.slerpQuaternions(r.qb,r.qn,gb);
  /* his glow: on from the first frame, strongest while the wave leaves him, gone by the end */
  const ga=(0.8+0.2*sstep(0,0.45,t))*(1-sstep(2.1,3.4,t)),pulse=1+0.12*Math.sin(t*15);
  r.glow.visible=ga>0.01;r.glow.position.copy(G.glitchy.position);r.glow.material.opacity=Math.min(1,ga);
  r.glow.scale.setScalar((6.5+3*sstep(0,0.5,t))*pulse*lerp(1,0.4,sstep(1.3,3.1,t)));
  return true;}
function endTransition(){const r=st.tr;if(!r)return;st.tr=null;
  G.scene.remove(r.mesh);r.mesh.geometry.dispose();r.mesh.material.dispose();r.tex.dispose();
  G.scene.remove(r.glow);r.glow.material.dispose();r.gtex.dispose();G.scene.remove(r.ring);r.ring.geometry.dispose();r.ring.material.dispose();
  G.world.scale.y=1;G.kinan.scale.set(1,1,1);G.glitchy.scale.setScalar(1);G.glitchyInner.rotation.y=0;G.glitchy.rotation.set(0,G.glitchy.rotation.y,0);
  [G.kinan,G.glitchy,G.blob,G.blob2].concat(G.pets.map(p=>p.o),G.pets.map(p=>p.blob)).forEach(o=>{o.visible=true;});G.pets.forEach(p=>p.o.scale.setScalar(1));
  if(st.ui){st.ui.hl.style.opacity='';st.ui.hr.style.opacity='';}}
function skipTransition(){if(st.tr){st.tr.hold=null;st.tr.t=TR_DUR;}}
const zoomOf=k=>ZOOM[k]||ZOOM_DEF;
function camFollow(yaw,tgt,outPos,outLook){const z=st.zoom,D=z[0],H=z[1];const lx=Math.sin(yaw),lz=-Math.cos(yaw);
  outLook.set(tgt.x+lx*1.2,tgt.y+z[2],tgt.z+lz*1.2);outPos.set(tgt.x-lx*D,tgt.y+H,tgt.z-lz*D);}
const V3=()=>new (T.Vector3)();
let tmp=null;
function update(dt){
  const t=st.time+=dt;if(!tmp)tmp={p:V3(),q:V3(),cp:V3(),cl:V3(),op:V3(),ol:V3()};
  /* walking */
  const w=st.walk;let moving=false,face=st.face;
  if(w){const R=G.routes[w.i];const remain=w.len-w.s;const sp=9.0*clamp(Math.min(w.s+0.7,remain+0.5)/2.4,0.32,1);const ds=sp*dt;w.s=Math.min(w.len,w.s+ds);st.phase+=ds*1.75;moving=true;
    const u=w.dir>0?w.s:R.len-w.s;const a=R.at(u-0.6*w.dir),b=R.at(u+0.6*w.dir);face=Math.atan2(b.x-a.x,b.z-a.z);
    if(w.s>=w.len){st.at=w.to;st.walk=null;moving=false;if(w.through){go(w.dir);}else{if(st.opts&&st.opts.onMove)st.opts.onMove(st.at);if(st.queue){const q=st.queue;st.queue=0;go(q);}}}}
  st.walkAmt+= ((moving?1:0)-st.walkAmt)*(1-Math.exp(-dt*10));
  const kp=kinanPos(tmp.p);
  /* camera heading: along the trail, easing into each stop's framing */
  let yaw;if(st.walk){const w2=st.walk,R=G.routes[w2.i];const u=w2.dir>0?w2.s:R.len-w2.s;yaw=routeYaw(R,u);const dep=w2.dir>0?w2.i:w2.i+1;
    yaw=lerpAng(stopYaw(dep),yaw,sstep(0,7,w2.s));yaw=lerpAng(yaw,stopYaw(w2.to),sstep(7,0,w2.len-w2.s));}else yaw=stopYaw(st.at);
  st.camYaw=lerpAng(st.camYaw,yaw,1-Math.exp(-dt*2.4));
  let zt;if(st.walk){const w2=st.walk,dep=w2.dir>0?w2.i:w2.i+1,a=zoomOf(dep),b=zoomOf(w2.to);
    zt=[0,1,2].map(j=>{const u=lerp(a[j],ZOOM_DEF[j],sstep(0,7,w2.s));return lerp(u,b[j],sstep(7,0,w2.len-w2.s));});}else zt=zoomOf(st.at);
  for(let j=0;j<3;j++)st.zoom[j]=lerp(st.zoom[j],zt[j],1-Math.exp(-dt*2.2));
  if(!moving)face=-st.camYaw+0.35;
  st.face=lerpAng(st.face,face,1-Math.exp(-dt*(moving?12:5)));
  /* Kinan: walk cycle, idle breathing, play jump */
  let jy=0;if(st.jump>=0){st.jump+=dt;const jt=st.jump/0.62;if(jt>=1)st.jump=-1;else jy=Math.sin(Math.PI*jt)*1.5;}
  const wa=st.walkAmt,ph=st.phase,sw=Math.sin(ph);
  G.kinan.position.set(kp.x,kp.y+Math.abs(Math.cos(ph))*0.11*wa+jy,kp.z);G.kinan.rotation.y=st.face;
  G.kinanInner.rotation.x=0.09*wa;G.kinanInner.scale.y=1+Math.sin(t*2.6)*0.012*(1-wa);
  const P=G.piv,qx=new T.Quaternion(),X=new T.Vector3(1,0,0),Z=new T.Vector3(0,0,1);
  const cheer=st.jump>=0?Math.sin(Math.PI*Math.min(1,st.jump/0.62)):0;
  if(P.Kinan_hip1)P.Kinan_hip1.quaternion.copy(P.Kinan_hip1.userData.base).premultiply(qx.setFromAxisAngle(X,sw*0.62*wa-cheer*0.3));
  if(P['Kinan_hip-1'])P['Kinan_hip-1'].quaternion.copy(P['Kinan_hip-1'].userData.base).premultiply(qx.setFromAxisAngle(X,-sw*0.62*wa+cheer*0.3));
  const armL=-sw*0.75*wa-cheer*2.5+Math.sin(t*2.6)*0.03*(1-wa),armR=sw*0.75*wa+Math.sin(t*2.6+1)*0.03*(1-wa);
  if(P.Kinan_sh1)P.Kinan_sh1.quaternion.copy(P.Kinan_sh1.userData.base).premultiply(qx.setFromAxisAngle(X,armL)).premultiply(new T.Quaternion().setFromAxisAngle(Z,cheer*0.25));
  if(P['Kinan_sh-1'])P['Kinan_sh-1'].quaternion.copy(P['Kinan_sh-1'].userData.base).premultiply(qx.setFromAxisAngle(X,armR)).premultiply(new T.Quaternion().setFromAxisAngle(Z,-cheer*0.6));
  if(P.Kinan_el1)P.Kinan_el1.quaternion.copy(P.Kinan_el1.userData.base).premultiply(qx.setFromAxisAngle(X,-(0.5+0.35*Math.max(0,-sw))*wa-cheer*0.4));
  if(P['Kinan_el-1'])P['Kinan_el-1'].quaternion.copy(P['Kinan_el-1'].userData.base).premultiply(qx.setFromAxisAngle(X,-(0.5+0.35*Math.max(0,sw))*wa-0.15*(1-wa)));
  if(P.Kinan_head)P.Kinan_head.quaternion.copy(P.Kinan_head.userData.base).premultiply(qx.setFromAxisAngle(X,-0.06*wa+Math.sin(t*1.3)*0.03*(1-wa)));
  G.blob.position.set(kp.x,kp.y+0.03,kp.z);const bs=1-Math.min(0.5,jy*0.25);G.blob.scale.setScalar(bs);
  /* Glitchy floats at Kinan's shoulder (screen right), lagging a little */
  const rx=Math.cos(st.camYaw),rz=Math.sin(st.camYaw),lx=Math.sin(st.camYaw),lz=-Math.cos(st.camYaw);
  tmp.q.set(kp.x+rx*1.55-lx*0.3,kp.y+2.35+Math.sin(t*2.1)*0.18,kp.z+rz*1.55-lz*0.3);
  G.glitchy.position.lerp(tmp.q,1-Math.exp(-dt*3.2));G.glitchy.rotation.y=-st.camYaw+Math.sin(t*0.9)*0.35-0.25;G.glitchyInner.rotation.z=Math.sin(t*1.7)*0.08;
  if(st.jump>=0)G.glitchyInner.rotation.y=st.jump*10;else if(!st.tr)G.glitchyInner.rotation.y*=Math.exp(-dt*6);
  G.glitchyInner.position.x=(Math.floor(t/0.09)%7===0)?0.1:0;   /* the same little sideways glitch-jump as his 2D sprite */
  const gy=groundH(G.glitchy.position.x,G.glitchy.position.z);G.blob2.position.set(G.glitchy.position.x,Math.max(gy,kp.y-0.4)+0.04,G.glitchy.position.z);
  updatePets(dt,t,kp,moving);
  /* camera */
  st.camTgt.lerp(tmp.p.set(kp.x,kp.y+jy*0.3,kp.z),1-Math.exp(-dt*6));
  camFollow(st.camYaw,st.camTgt,tmp.cp,tmp.cl);
  if(st.intro<1){st.intro=Math.min(1,st.intro+dt/st.introDur);const e=ease(st.intro);tmp.op.set(ISL.cx-18,150,ISL.cz+132);tmp.ol.set(ISL.cx,-6,ISL.cz-6);
    tmp.cp.lerpVectors(tmp.op,tmp.cp,e);tmp.cl.lerpVectors(tmp.ol,tmp.cl,e);}
  if(st.dbg){tmp.cp.set(st.dbg[0],st.dbg[1],st.dbg[2]);tmp.cl.set(st.dbg[3],st.dbg[4],st.dbg[5]);}
  if(!(st.tr&&trUpdate(dt,tmp.cp,tmp.cl))){G.camera.position.copy(tmp.cp);G.camera.lookAt(tmp.cl);}
  G.sky.position.copy(G.camera.position);
  fadeTrees(dt,G.camera.position,kp);
  /* sun + shadow box follow what the camera sees */
  const sx=st.camTgt.x+lx*12,sz=st.camTgt.z+lz*12;G.sun.target.position.set(sx,0,sz);G.sun.position.set(sx+38,70,sz+46);
  /* world animation */
  G.waterMat.userData.t.value=t;
  if(G.wheel){G.wheel.rotation.z=t*0.22;G.gondolas.forEach((g,i)=>{const a=t*0.22+i/12*Math.PI*2;g.position.set(Math.cos(a)*5,7+Math.sin(a)*5,0);});}
  if(G.carousel)G.carousel.rotation.y=t*0.6;
  G.pelicans.forEach(o=>{if(o.stand){o.p.rotation.y=-1.4+Math.sin(t*0.7+o.ph)*0.4;return;}o.p.position.x=o.x+Math.sin(t*0.25+o.ph)*1.2;o.p.position.z=o.z+Math.cos(t*0.2+o.ph)*0.7;o.p.position.y=WATER_Y-0.12+Math.sin(t*1.8+o.ph)*0.05;o.p.rotation.y=Math.cos(t*0.25+o.ph)>0?Math.PI/2:-Math.PI/2;o.p.rotation.z=Math.sin(t*1.8+o.ph)*0.06;});
  G.foam.forEach(f=>{const k=(t*0.9+f.ph)%1;f.b.position.set(f.u,Math.sin(k*Math.PI)*0.3,f.v+k*1.5);const s=f.s*(1-k*0.6);f.b.scale.set(s,s*0.6,s);});
  G.clouds.forEach(o=>{o.c.position.x=o.x+Math.sin(t*0.05*o.sp+o.ph)*6;});
  const B=G.balloons,m4=new T.Matrix4(),qq=new T.Quaternion(),one=new T.Vector3(0.42,0.42,0.42);
  B.spots.forEach((s,i)=>{const y0=s[6];m4.compose(tmp.q.set(s[0]+Math.sin(t*1.1+i)*0.12,y0+s[2]+Math.sin(t*1.6+i*0.7)*0.15,s[1]),qq,one);B.I.setMatrixAt(i,m4);});B.I.instanceMatrix.needsUpdate=true;
  G.nodes.forEach((n,k)=>{if(n.type==='secret'&&n.icon){n.icon.rotation.y=t*2.2;n.icon.position.y=2.4+Math.sin(t*2)*0.18;}});
  const sp=G.stopPos[st.at];G.ring.visible=!st.walk;const pk=(t*1.15)%1;G.ring.position.set(sp.x,sp.y-0.26,sp.z);G.ring.scale.setScalar(1+pk*0.55);G.ring.material.opacity=0.85*(1-pk);
  /* fireworks over the Bessborough */
  const F=G.fw;F.next-=dt;if(F.next<=0){F.next=0.6+F.rr()*0.9;burst(72+F.rr()*24,15+F.rr()*7,-50+F.rr()*12,F.rr()<0.3);}
  if(st.hopFx>0){st.hopFx-=dt;}
  const pa=F.pts.geometry.attributes.position.array,ca=F.pts.geometry.attributes.color.array;let n=0;
  for(let i=F.parts.length-1;i>=0;i--){const q=F.parts[i];q.t+=dt;if(q.t>q.life){F.parts.splice(i,1);continue;}q.vy-=6*dt;q.vx*=Math.exp(-dt*1.4);q.vz*=Math.exp(-dt*1.4);q.vy*=Math.exp(-dt*0.8);q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;}
  for(const q of F.parts){if(n>=F.N)break;const f=1-q.t/q.life;pa[n*3]=q.x;pa[n*3+1]=q.y;pa[n*3+2]=q.z;ca[n*4]=q.c.r;ca[n*4+1]=q.c.g;ca[n*4+2]=q.c.b;ca[n*4+3]=Math.min(1,f*1.8);n++;}
  F.pts.geometry.setDrawRange(0,n);F.pts.geometry.attributes.position.needsUpdate=true;F.pts.geometry.attributes.color.needsUpdate=true;
  /* overlay */
  const ui=st.ui,name=(st.world&&st.world.stops[st.at]&&st.world.stops[st.at].name)||'';
  if(ui.plq.textContent!==name)ui.plq.textContent=name;ui.plq.style.opacity=(!st.walk&&st.intro>0.7&&!st.banner&&!st.tr)?'1':'0';
  if(st.banner){const b=st.banner;b.t+=dt*1000;const a=Math.min(1,b.t/200)*(b.t>1700?Math.max(0,1-(b.t-1700)/300):1);
    ui.dim.style.opacity=a;ui.ban.style.opacity=a;ui.sub.style.opacity=a;if(b.t>2000){st.banner=null;ui.dim.style.opacity=0;ui.ban.style.opacity=0;ui.sub.style.opacity=0;}}
  if(st.leaving>0){st.leaving+=dt;ui.fade.style.opacity=Math.min(1,st.leaving/0.3);if(st.leaving>0.32){st.leaving=0;const b=st.back;if(b)b();}}}
function loop(now){if(!K3.active||!G)return;st.raf=requestAnimationFrame(loop);const raw=(now-(st.last||now))/1000,dt=Math.min(0.1,raw);st.last=now;if(raw>0)st.fps=(st.fps||30)*0.9+0.1/raw;
  try{update(dt);G.renderer.render(G.scene,G.camera);}catch(e){cancelAnimationFrame(st.raf);console.error('[KINAN3D]',e);throw e;}}
function resize(){if(!G||!st.wrap)return;const w=st.wrap.clientWidth,h=st.wrap.clientHeight;if(!w||!h)return;G.renderer.setSize(w,h,false);G.camera.aspect=w/h;G.camera.updateProjectionMatrix();}

/* ------------------------------------------------------------------ public API */
/* libraries, models and the world, built once (the World 11 warm-up below usually does this ahead of time) */
function ensureWorld(){
  if(!buildP)buildP=loadLibs().then(()=>{progress=Math.max(progress,0.25);setLoad();return loadAssets();}).then(()=>{if(!G)buildWorld();})
    .catch(err=>{buildP=null;throw err;});
  return buildP;}
/* the overlay on .screen; from here on the engine sends arrows / Enter to us */
function attach(screenEl,world,opts){
  st.back=opts&&opts.back;st.opts=opts||{};st.world=world;K3.active=true;K3.ready=false;const tok=++st.token;st.screen=screenEl;st.prevPos=screenEl.style.position;
  if(getComputedStyle(screenEl).position==='static')screenEl.style.position='relative';
  const w=buildOverlay();st.wrap=w;screenEl.appendChild(w);
  /* keyboard focus moves onto the 3D view, so Enter plays the level instead of re-pressing the World 12 tab */
  w.tabIndex=-1;w.style.outline='none';try{w.focus({preventScroll:true});}catch(_){}
  w.addEventListener('pointerdown',()=>{if(st.tr)skipTransition();});
  return tok;}
function start3D(){st.ui.stage.appendChild(G.renderer.domElement);if(!st.ro)st.ro=new ResizeObserver(resize);st.ro.observe(st.wrap);resize();st.last=0;}
function loadFailed(tok,err){console.error('[KINAN3D] could not start the 3D world',err);
  if(tok===st.token&&st.ui){st.ui.load.style.display='';st.ui.load.style.opacity='1';st.ui.lt.textContent='THE 3D WORLD COULD NOT LOAD';st.ui.ls.textContent=String(err&&err.message||err).slice(0,90);}}
function mount(screenEl,world,opts){
  if(K3.active){st.back=opts&&opts.back;st.opts=opts||{};st.world=world;if(G&&K3.ready){endTransition();snapTo(startAt());applyStates();st.intro=0.55;st.introDur=1.2;}return;}
  const tok=attach(screenEl,world,opts);progress=Math.max(progress,0.05);setLoad();
  ensureWorld().then(()=>{
    if(tok!==st.token||!K3.active)return;
    progress=1;setLoad();start3D();snapTo(startAt());applyStates();st.intro=0;st.introDur=K3.visits++?1.4:2.8;K3.ready=true;
    st.ui.load.style.opacity='0';setTimeout(()=>{if(st.ui&&st.ui.load)st.ui.load.style.display='none';},450);
    st.raf=requestAnimationFrame(loop);
  }).catch(err=>loadFailed(tok,err));}
/* Called by the engine when Kinan walks past World 11's castle. The live 2D frame is copied onto tiles that exactly
   cover the screen; Glitchy appears beside 2D Kinan and glows, then a repaint wave spreads out from Glitchy: tiles flip
   away as it reaches them, the island pops up out of the map, 3D Kinan stands up where the 2D sprite stood, and the
   camera tilts from straight-down into the follow view. ~4 s; any key, tap or click skips. */
function transitionFrom2D(cv,world,opts){
  opts=opts||{};const screenEl=(cv&&cv.closest&&cv.closest('.km-screen'))||cv.parentNode;
  if(K3.active){mount(screenEl,world,opts);if(opts.done)opts.done();return;}
  st.trDone=false;const tok=attach(screenEl,world,opts);
  /* until the world is ready the overlay is see-through: the live 2D map keeps playing underneath, with a small rumble */
  st.wrap.style.background='transparent';st.ui.load.style.display='none';st.ui.hl.style.opacity='0';st.ui.hr.style.opacity='0';
  css();cv.classList.add('k3-rumble');st.cv=cv;
  ensureWorld().then(()=>{
    cv.classList.remove('k3-rumble');
    if(tok!==st.token||!K3.active)return;
    st.wrap.style.background='';start3D();snapTo(0);applyStates();st.intro=1;
    beginTransition(cv);update(0);G.renderer.render(G.scene,G.camera);   /* first 3D frame is drawn before the 2D canvas hides: no gap */
    cv.style.visibility='hidden';cv.classList.remove('three');
    K3.ready=true;K3.visits++;st.raf=requestAnimationFrame(loop);
    if(opts.done){try{opts.done();}catch(e){console.error('[KINAN3D] done() threw',e);}}
    st.trDone=true;
  }).catch(err=>{cv.classList.remove('k3-rumble');cv.style.visibility='hidden';loadFailed(tok,err);if(opts.done)opts.done();st.trDone=true;});}
function unmount(){
  st.token++;K3.active=false;K3.ready=false;cancelAnimationFrame(st.raf);st.raf=0;
  if(st.cv)st.cv.classList.remove('k3-rumble');
  if(G)endTransition();
  if(st.ro&&st.wrap)st.ro.unobserve(st.wrap);
  if(G&&G.renderer.domElement.parentNode)G.renderer.domElement.parentNode.removeChild(G.renderer.domElement);
  if(st.wrap&&st.wrap.parentNode)st.wrap.parentNode.removeChild(st.wrap);
  if(st.screen)st.screen.style.position=st.prevPos||'';
  st.wrap=null;st.ui=null;st.screen=null;st.walk=null;st.banner=null;st.leaving=0;}
function go(dir){
  if(st.tr){skipTransition();return;}
  if(!K3.ready||st.leaving||st.banner||st.intro<0.35)return;
  if(st.walk){if(dir===st.walk.dir)st.queue=dir;return;}
  const ni=st.at+dir,o=st.opts||{};
  if(ni<0){st.leaving=0.0001;return;}
  if(ni>10){kinanJump();burst(st.camTgt.x,st.camTgt.y+9,st.camTgt.z,true);return;}
  if(dir>0&&o.canWalk&&!o.canWalk(ni)){say('BEAT THIS LEVEL FIRST','Then the path opens.',false);return;}
  const through=!!(o.skip&&o.skip(ni)&&ni+dir>=0&&ni+dir<=10);
  const i=dir>0?st.at:ni;st.walk={i,dir,s:0,len:G.routes[i].len,to:ni,through};}
function play(){
  if(st.tr){skipTransition();return;}
  if(!K3.ready||st.walk||st.banner||st.leaving)return;
  const o=st.opts||{},r=o.onPlay?o.onPlay(st.at):null;if(!r)return;
  say(r.banner,r.sub||'',r.ok);if(r.ok)kinanJump();
  if(r.go){const tok=st.token;setTimeout(()=>{if(tok===st.token&&K3.active)r.go();},900);}}
/* a banner over the 3D map (the 2D map's look) */
function say(txt,sub,ok){if(!st.ui)return;st.banner={t:0};st.ui.ban.textContent=txt;st.ui.ban.style.background=ok?'#e8364b':'#6b6f7a';st.ui.sub.textContent=sub||'';}
/* where Kinan starts, and the stops coloured by the save: gray-blue locked, yellow open, red beaten */
function startAt(){const o=st.opts||{};const k=Math.floor(Number(o.at)||0);return clamp(k,0,10);}
function applyStates(){const o=st.opts||{};if(st.ui&&st.ui.hr)st.ui.hr.innerHTML='CANDLES  <b>'+(o.candles?Math.max(0,Math.floor(o.candles())||0):0)+'</b>';
  if(!G||!G.nodes||!o.stops)return;const list=o.stops();
  G.nodes.forEach((n,k)=>{const s=list[k];if(!s||!n.top)return;const base=n.type==='fort'?'#9aa3b2':n.type==='secret'?'#7a2fd0':n.type==='boss'?'#e8364b':null;
    const col=s.state==='locked'?'#7d86a8':base||(s.state==='beaten'?'#e8364b':'#f6c445');n.top.material.color.set(col);if(n.top.material.emissive)n.top.material.emissive.set(col);
    if(n.icon)n.icon.visible=!(n.type==='secret'&&s.state==='locked');});}
/* warm up quietly while the player is on World 11, so beating it flows straight into 3D */
setInterval(()=>{try{if(!buildP&&!K3.active&&window.KINAN&&KINAN.cur&&KINAN.cur().n===11)ensureWorld().catch(e=>console.warn('[KINAN3D] warm-up failed',e));}catch(_){}},1500);
const K3={active:false,ready:false,visits:0,mount,unmount,go,play,transitionFrom2D,
  debugView:(v)=>{st.dbg=v||null;},
  debugKinan:()=>G?{p:G.kinan.position.toArray(),face:st.face,pets:G.pets.map(p=>p.o.position.toArray()),glitchy:G.glitchy.position.toArray()}:null,
  debugTransition:(p)=>{if(st.tr)st.tr.hold=(p===null||p===undefined)?null:clamp(p,0,1);},
  state:()=>({at:st.at,walking:!!st.walk,ready:K3.ready,banner:!!st.banner,intro:st.intro,fps:st.fps,warm:!!G,
    transition:st.tr?st.tr.t/TR_DUR:null,transitionDone:st.trDone,pets:G?G.pets.map(p=>p.def.name+' the '+p.def.kind):[]})};
window.KINAN3D=K3;
})();

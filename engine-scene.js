import { rotation, particleVertex, particleFragment } from './scene.js';

const vertex = `
attribute vec3 aPosition,aNormal,aColor;
uniform mat3 uRotation; uniform float uAspect;
varying vec3 vNormal,vPosition,vColor,vLocal;
void main(){
 vPosition=uRotation*aPosition;vNormal=uRotation*aNormal;vColor=aColor;vLocal=aPosition;
 float d=10.-vPosition.z;
 gl_Position=vec4(vPosition.x*4.5/uAspect,vPosition.y*4.5,(d*30.1-6.)/29.9,d);
}`;
const fragment = `
precision highp float;
varying vec3 vNormal,vPosition,vColor,vLocal;
void main(){
 vec3 n=normalize(vNormal),v=normalize(vec3(0.,0.,10.)-vPosition);
 vec3 l=normalize(vec3(-.8,1.3,1.7)),r=reflect(-v,n);
 float diffuse=max(dot(n,l),0.),fresnel=pow(1.-max(dot(n,v),0.),5.);
 float brush=.5+.5*sin(vLocal.z*680.+sin(atan(vLocal.y,vLocal.x)*80.)*.8);
 float metal=smoothstep(.19,.42,max(vColor.r,max(vColor.g,vColor.b)));
 float softbox=exp(-pow((r.x+.42)*3.8,2.)-pow((r.y-.46)*1.8,2.));
 float strip=exp(-pow((r.x-.65)*12.,2.)-pow((r.y+.12)*1.7,2.));
 float overhead=exp(-pow((r.y-.85)*5.,2.));
 float spec=pow(max(dot(reflect(-l,n),v),0.),85.);
 vec3 reflection=vec3(.93,.96,1.)*(softbox*1.05+strip*.65+overhead*.25+spec*.4);
 vec3 c=vColor*(.10+diffuse*.55);
 c+=reflection*mix(.12,.62,metal)*(.94+brush*.06);
 c+=vec3(.11,.22,.34)*pow(max(dot(n,normalize(vec3(1.,.2,-1.))),0.),3.)*.45;
 c+=vec3(.16,.19,.23)*fresnel;
 gl_FragColor=vec4(pow(vec3(1.)-exp(-c*1.35),vec3(.83)),1.);
}
`;

export function createEngineScene(canvas, initiallyPaused=false){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'});
 if(!gl)throw new Error('WebGL unavailable');
 const metal=[.44,.49,.55],dark=[.14,.18,.23],bright=[.7,.76,.81],trim=[.36,.41,.47];
 const body=[],fan=[],cloud=[];
 function triangle(data,a,b,c,color){
  const u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]);
  const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
  const length=Math.hypot(...n)||1;
  for(const p of [a,b,c])data.push(...p,...n.map(x=>x/length),...color);
 }
 function lathe(data,profile,color){
  function vertex(row,angle){
   const p=profile[row],before=profile[Math.max(0,row-1)],after=profile[Math.min(profile.length-1,row+1)];
   const dr=after[0]-before[0],dz=after[1]-before[1],length=Math.hypot(dr,dz)||1;
   data.push(p[0]*Math.cos(angle),p[0]*Math.sin(angle),p[1],-dz*Math.cos(angle)/length,-dz*Math.sin(angle)/length,dr/length,...color);
  }
  for(let j=0;j<profile.length-1;j++)for(let i=0;i<192;i++){
   const t=i*Math.PI/96,T=(i+1)*Math.PI/96;
   vertex(j,t);vertex(j,T);vertex(j+1,t);vertex(j,T);vertex(j+1,T);vertex(j+1,t);
  }
 }
 // Rounded intake lip, shadowed inner duct and a tapered exhaust casing.
 lathe(body,[[.90,1.05],[.91,1.20],[.95,1.30],[1.02,1.355],[1.10,1.36],[1.17,1.315],[1.205,1.24],[1.215,1.15],[1.195,1.065],[1.16,.99]],bright);
 lathe(body,[[1.16,.99],[1.145,.85],[1.115,.45],[1.075,-.1],[1.03,-.55],[.99,-.69],[.92,-.86],[.81,-1.08],[.73,-1.24],[.67,-1.39],[.64,-1.48]],metal);
 lathe(body,[[.64,-1.48],[.63,-1.53],[.58,-1.55],[.54,-1.51],[.55,-1.42],[.61,-1.19],[.80,-.72],[.86,-.42],[.89,.78],[.90,1.05]],dark);
 for(const [r,z] of [[1.155,.85],[1.123,.45],[1.082,-.10],[1.035,-.55],[.915,-.91]]){
  lathe(body,[[r,z-.033],[r+.018,z-.018],[r+.024,z],[r+.018,z+.018],[r,z+.033]],trim);
 }
 lathe(body,[[.90,1.06],[.905,1.15],[.913,1.19]],trim);
 lathe(body,[[.55,-1.53],[.57,-1.56],[.63,-1.56],[.66,-1.52],[.65,-1.47]],bright);
 lathe(fan,[[0,1.44],[.055,1.435],[.105,1.40],[.175,1.32],[.24,1.19],[.28,1.04],[.285,.96],[.265,.89],[0,.87]],bright);
 lathe(fan,[[.278,.98],[.29,.99],[.293,1.01],[.286,1.025]],trim);
 // Airfoil blades have camber, thickness and closed tip/edge surfaces.
 for(let i=0;i<22;i++){
  const theta=i*Math.PI*2/22;
  const point=(t,chord,back=false)=>{
   const radius=.275+t*.607,angle=theta+t*.38+(chord-.5)*(.26-t*.07);
   const camber=Math.sin(chord*Math.PI)*(.065+t*.035);
   return [radius*Math.cos(angle),radius*Math.sin(angle),1.035-t*.20+(chord-.5)*.15+camber-(back?.014:0)];
  };
  function emit(t,chord,back){
   const p=point(t,chord,back),a=point(t+.0001,chord,back),b=point(t,chord+.0001,back);
   const u=a.map((x,j)=>x-p[j]),v=b.map((x,j)=>x-p[j]);
   const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...n)||1;
   fan.push(...p,...n.map(x=>x/length*(back?-1:1)),...(back?trim:metal));
  }
  for(let j=0;j<18;j++)for(let k=0;k<6;k++)for(const back of [false,true]){
   const t=j/18,T=(j+1)/18,c=k/6,C=(k+1)/6;
   for(const [u,v] of [[t,c],[T,c],[T,C],[t,c],[T,C],[t,C]])emit(u,v,back);
  }
  for(let j=0;j<18;j++)for(const c of [0,1]){
   const a=point(j/18,c),b=point((j+1)/18,c),d=point(j/18,c,true),e=point((j+1)/18,c,true);
   triangle(fan,a,b,e,bright);triangle(fan,a,e,d,bright);
  }
  for(let k=0;k<6;k++){
   const a=point(1,k/6),b=point(1,(k+1)/6),c=point(1,(k+1)/6,true),d=point(1,k/6,true);
   triangle(fan,a,b,c,trim);triangle(fan,a,c,d,trim);
  }
 }
 // Shallow rounded casing rails and inset fastener heads.
 for(let i=0;i<16;i++){
  const angle=i*Math.PI/8;
  for(let j=0;j<18;j++)for(let k=0;k<8;k++){
   const p=(u,v)=>{const z=-.48+u*1.28,a=angle+(v-.5)*.033,r=1.035+(z+.55)*.09+Math.sin(v*Math.PI)*.028;return [r*Math.cos(a),r*Math.sin(a),z];};
   const a=p(j/18,k/8),b=p((j+1)/18,k/8),c=p((j+1)/18,(k+1)/8),d=p(j/18,(k+1)/8);
   triangle(body,a,b,c,trim);triangle(body,a,c,d,trim);
  }
  for(const z of [-.50,.79]){
   const radius=1.035+(z+.55)*.09+.018;
   const p=(r,t,h)=>[(radius+h)*Math.cos(angle)-r*Math.sin(t)*Math.sin(angle),(radius+h)*Math.sin(angle)+r*Math.sin(t)*Math.cos(angle),z+r*Math.cos(t)];
   for(let k=0;k<12;k++){
    const t=k*Math.PI/6,T=(k+1)*Math.PI/6;
    triangle(body,p(0,0,.007),p(.022,t,.007),p(.022,T,.007),bright);
    triangle(body,p(.022,t,.007),p(.027,t,0),p(.027,T,0),trim);
    triangle(body,p(.022,t,.007),p(.027,T,0),p(.022,T,.007),trim);
   }
  }
 }
 let seed=37;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 for(let i=0;i<1100;i++){
  const t=random()*Math.PI*2,r=.8+Math.pow(random(),.6)*1.65;
  cloud.push(Math.cos(t)*r,Math.sin(t)*r*.85,-2.8+random()*.8,i<75?85+random()*95:1.8+random()*4,i<75?.32:.6+random()*.4,random()*6.28);
 }
 let main,particles,bodyMesh,fanMesh,cloudMesh,lost=false;
 function program(v,f){
  const p=gl.createProgram();
  for(const [type,source] of [[gl.VERTEX_SHADER,v],[gl.FRAGMENT_SHADER,f]]){
   const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
   if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));
   gl.attachShader(p,s);gl.deleteShader(s);
  }
  gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p;
 }
 function mesh(data,stride){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);return {buffer:b,count:data.length/stride};}
 function init(){main=program(vertex,fragment);particles=program(particleVertex.replaceAll('3.4','4.5'),particleFragment);bodyMesh=mesh(body,9);fanMesh=mesh(fan,9);cloudMesh=mesh(cloud,6);gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);}
 init();
 const uniform=(p,n)=>gl.getUniformLocation(p,n);
 function bind(m,p,names,stride){
  gl.bindBuffer(gl.ARRAY_BUFFER,m.buffer);
  for(let i=0;i<3;i++)gl.disableVertexAttribArray(i);
  names.forEach((n,i)=>{const a=gl.getAttribLocation(p,n);if(a>=0){gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,stride*4,i*12);}});
 }
 function multiply(a,b){const c=new Float32Array(9);for(let j=0;j<3;j++)for(let i=0;i<3;i++)for(let k=0;k<3;k++)c[j*3+i]+=a[k*3+i]*b[j*3+k];return c;}
 let paused=initiallyPaused,visible=false,frame=0,previous=0,time=0,ratio=1;
 let yaw=-.65,pitch=.3,dragging=false,lastX=0,lastY=0;
 canvas.addEventListener('pointerdown',event=>{
  if(event.button!==0)return;
  dragging=true;lastX=event.clientX;lastY=event.clientY;
  canvas.setPointerCapture(event.pointerId);canvas.classList.add('dragging');
  canvas.focus({preventScroll:true});
 });
 canvas.addEventListener('pointermove',event=>{
  if(!dragging)return;
  yaw+=(event.clientX-lastX)*.008;pitch=Math.max(-1.35,Math.min(1.35,pitch+(event.clientY-lastY)*.008));
  lastX=event.clientX;lastY=event.clientY;draw();
 });
 const endDrag=()=>{dragging=false;canvas.classList.remove('dragging');};
 canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);
 canvas.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;
  event.preventDefault();
  if(event.key==='ArrowLeft')yaw-=.15;if(event.key==='ArrowRight')yaw+=.15;
  if(event.key==='ArrowUp')pitch-=.15;if(event.key==='ArrowDown')pitch+=.15;
  if(event.key==='Home'){yaw=-.65;pitch=.3;}
  pitch=Math.max(-1.35,Math.min(1.35,pitch));draw();
 });
 function draw(){
  if(lost)return;
  gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.useProgram(main);gl.disable(gl.BLEND);gl.depthMask(true);
  gl.uniform1f(uniform(main,'uAspect'),canvas.width/canvas.height);
  const turn=rotation(pitch,yaw,-.28);
  for(const [m,r] of [[bodyMesh,turn],[fanMesh,multiply(turn,rotation(0,0,time*.65))]]){
   bind(m,main,['aPosition','aNormal','aColor'],9);gl.uniformMatrix3fv(uniform(main,'uRotation'),false,r);gl.drawArrays(gl.TRIANGLES,0,m.count);
  }
  gl.useProgram(particles);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);
  bind(cloudMesh,particles,['aPosition','aNormal'],6);
  gl.uniform1f(uniform(particles,'uAspect'),canvas.width/canvas.height);gl.uniform1f(uniform(particles,'uRatio'),ratio);
  gl.uniform1f(uniform(particles,'uTime'),time);gl.uniform3fv(uniform(particles,'uPosition'),[0,0,0]);gl.uniform3fv(uniform(particles,'uColor'),[.13,.55,1]);
  gl.drawArrays(gl.POINTS,0,cloudMesh.count);gl.depthMask(true);
 }
 function tick(now){frame=0;if(paused||!visible||document.hidden||lost){previous=0;return;}if(previous){const delta=Math.min((now-previous)/1000,.05);time+=delta;}previous=now;draw();frame=requestAnimationFrame(tick);}
 function schedule(){if(!frame&&!paused&&visible&&!document.hidden&&!lost)frame=requestAnimationFrame(tick);}
 function resize(){const r=canvas.getBoundingClientRect();ratio=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.max(1,Math.round(r.width*ratio));canvas.height=Math.max(1,Math.round(r.height*ratio));draw();}
 new ResizeObserver(resize).observe(canvas);
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;schedule();},{rootMargin:'48px'}).observe(canvas);
 document.addEventListener('visibilitychange',()=>{previous=0;schedule();});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;canvas.parentElement.classList.remove('ready');});
 canvas.addEventListener('webglcontextrestored',()=>{try{init();lost=false;previous=0;resize();canvas.parentElement.classList.add('ready');schedule();}catch{canvas.parentElement.classList.remove('ready');}});
 resize();canvas.parentElement.classList.add('ready');
 return {setPaused(value){paused=value;previous=0;if(paused){cancelAnimationFrame(frame);frame=0;}schedule();}};
}

import { rotation, particleVertex, particleFragment } from './scene.js';

const vertex = `
attribute vec3 aPosition,aNormal,aColor;
uniform mat3 uRotation; uniform float uAspect;
varying vec3 vNormal,vPosition,vColor;
void main(){
 vPosition=uRotation*aPosition;vNormal=uRotation*aNormal;vColor=aColor;
 float d=10.-vPosition.z;
 gl_Position=vec4(vPosition.x*4.5/uAspect,vPosition.y*4.5,(d*30.1-6.)/29.9,d);
}`;
const fragment = `
precision highp float;
varying vec3 vNormal,vPosition,vColor;
void main(){
 vec3 n=normalize(vNormal),v=normalize(vec3(0.,0.,10.)-vPosition);
 vec3 l=normalize(vec3(-.7,1.,1.5)),r=reflect(-v,n);
 float diffuse=max(dot(n,l),0.);
 float strip=exp(-pow((r.x+.4)*8.,2.))*.8;
 float spec=pow(max(dot(reflect(-l,n),v),0.),55.);
 float rim=pow(1.-max(dot(n,v),0.),3.);
 vec3 c=vColor*(.16+.65*diffuse)+vec3(.78,.87,1.)*(strip*.55+spec*.85);
 c+=vec3(.12,.21,.32)*rim*.3;

 gl_FragColor=vec4(pow(c,vec3(.9)),1.);
}`;

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
  for(let j=0;j<profile.length-1;j++)for(let i=0;i<128;i++){
   const t=i*Math.PI/64,T=(i+1)*Math.PI/64;
   vertex(j,t);vertex(j,T);vertex(j+1,t);vertex(j,T);vertex(j+1,T);vertex(j+1,t);
  }
 }
 // Revolved housing: rounded intake lip, hollow inner duct and tapered exhaust.
 lathe(body,[[.9,1.25],[1.08,1.34],[1.18,1.27],[1.2,1.12],[1.12,.96],[1.01,-.6],[.74,-1.25],[.62,-1.52],[.51,-1.52],[.57,-1.17],[.83,-.5],[.9,1.25]],metal);
 for(const z of [-1.12,-.75,-.35,.1,.55,.95]){
  const r=z<-.6?.8:1.06+(z+.35)*.06;
  lathe(body,[[r,z],[r+.035,z+.025],[r+.035,z+.075],[r,z+.1]],bright);
 }
 lathe(body,[[.92,1.21],[.94,1.24],[.97,1.23],[.96,1.19]],trim);
 lathe(body,[[.53,-1.54],[.61,-1.56],[.64,-1.52],[.59,-1.49]],trim);
 lathe(fan,[[0,1.44],[.10,1.40],[.23,1.24],[.29,1.02],[.27,.86],[0,.82]],bright);
 // Curved, twisted fan blades, built as real surfaces with a thin back face.
 for(let i=0;i<19;i++){
  const theta=i*Math.PI*2/19;
  for(let j=0;j<8;j++){
   const point=(t,side,back=0)=>{
    const radius=.26+t*.64,angle=theta+t*.31+side*(.085+t*.065);
    return [radius*Math.cos(angle),radius*Math.sin(angle),1.04-t*.18+side*.075+back];
   };
   const t=j/8,T=(j+1)/8;
   const emit=(t,side)=>{
    const p=point(t,side),q=point(t+.001,side),r=point(t,side+.001);
    const u=q.map((v,i)=>v-p[i]),v=r.map((x,i)=>x-p[i]);
    const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...n)||1;
    fan.push(...p,...n.map(x=>x/length),...metal);
   };
   emit(t,-1);emit(T,-1);emit(t,1);emit(T,-1);emit(T,1);emit(t,1);
  }
 }
 // Long external ribs and fasteners give the casing a mechanical silhouette.
 for(let i=0;i<16;i++){
  const t=i*Math.PI/8;
  const p=(r,z,a)=>[r*Math.cos(a),r*Math.sin(a),z];
  const a=p(1.13,-.45,t),b=p(1.2,.85,t),c=p(1.14,.85,t+.035),d=p(1.07,-.45,t+.035);
  triangle(body,a,b,c,dark);triangle(body,a,c,d,metal);
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

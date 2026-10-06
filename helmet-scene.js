import { rotation, particleVertex, particleFragment } from './scene.js';

const vertex = `
attribute vec3 aPosition,aNormal;
uniform mat3 uView,uTurn;uniform vec3 uPosition,uSize;uniform float uAspect;
varying vec3 vNormal,vPosition,vLocal;
void main(){
 vLocal=aPosition;vPosition=uView*(uTurn*(aPosition*uSize)+uPosition);
 vNormal=normalize(uView*uTurn*(aNormal/uSize));
 float d=9.-vPosition.z;
 gl_Position=vec4(vPosition.x*4./uAspect,vPosition.y*4.,(d*30.1-6.)/29.9,d);
}`;
const fragment = `
precision highp float;varying vec3 vNormal,vPosition,vLocal;uniform vec3 uColor;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
void main(){
 vec3 n=normalize(vNormal),v=normalize(vec3(0.,0.,9.)-vPosition),l=normalize(vec3(-.8,1.2,1.8));
 vec3 r=reflect(-v,n);
 float diffuse=max(dot(n,l),0.),nv=max(dot(n,v),0.);
 float fresnel=.045+.955*pow(1.-nv,5.);
 float plastic=step(uColor.g*1.4,uColor.r);
 float grain=hash(floor(vLocal*380.));
 float softbox=exp(-pow((r.x+.40)*3.2,2.)-pow((r.y-.55)*2.3,2.));
 float strip=exp(-pow((r.x-.7)*10.,2.)-pow((r.y+.1)*2.,2.));
 float spec=pow(max(dot(reflect(-l,n),v),0.),80.);
 float fill=max(dot(n,normalize(vec3(1.,.2,.4))),0.);
 vec3 color=uColor*(.12+diffuse*.70+fill*.12)*(.98+grain*.02);
 float reflection=softbox*1.2+strip*.55+spec*.65;
 color+=vec3(1.,.96,.88)*reflection*mix(.55,.38+fresnel*.55,plastic);
 color+=vec3(1.,.30,.07)*pow(max(dot(n,normalize(vec3(.4,.1,-1.))),0.),3.)*.16;
 color+=vec3(.10,.13,.17)*fresnel*.25;
 gl_FragColor=vec4(pow(vec3(1.)-exp(-color*1.5),vec3(.83)),1.);
}
`;

export function createHelmetScene(canvas, initiallyPaused=false) {
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'});
 if(!gl)throw new Error('WebGL unavailable');
 let seed=4381;
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const parts=[];
 const gold=[.96,.48,.065],edge=[.72,.29,.025],dark=[.055,.062,.072],metal=[.5,.53,.57];
 function surface(fn,nu,nv,color){
  const data=[];
  function vertex(u,v){const p=fn(u,v),a=fn(u+.0001,v),b=fn(u,v+.0001),du=a.map((x,i)=>x-p[i]),dv=b.map((x,i)=>x-p[i]);const n=[du[1]*dv[2]-du[2]*dv[1],du[2]*dv[0]-du[0]*dv[2],du[0]*dv[1]-du[1]*dv[0]],l=Math.hypot(...n)||1;data.push(...p,...n.map(x=>x/l));}
  for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const u=i/nu,v=j/nv,U=(i+1)/nu,V=(j+1)/nv;for(const [a,b] of [[u,v],[U,v],[U,V],[u,v],[U,V],[u,V]])vertex(a,b);}
  parts.push({data,color});
 }
 // Ribs are moulded into the shell instead of resting on it as separate tubes.
 const shell=(u,v)=>{
  const t=u*Math.PI*2,p=.0001+v*(Math.PI/2-.0001);
  const x=1.22*Math.sin(p)*Math.cos(t),y=-.56+1.53*Math.cos(p),z=1.35*Math.sin(p)*Math.sin(t);
  const base=Math.min(1,Math.max(0,(y+.56)/.22));
  const rib=(Math.exp(-Math.pow(x/.09,4.))*.07+Math.exp(-Math.pow((x-.44)/.085,4.))*.043+Math.exp(-Math.pow((x+.44)/.085,4.))*.043)*base*base*(3-2*base);
  const nx=x/(1.22*1.22),ny=(y+.56)/(1.53*1.53),nz=z/(1.35*1.35),length=Math.hypot(nx,ny,nz);
  return [x+rib*nx/length,y+rib*ny/length,z+rib*nz/length];
 };
 surface(shell,192,80,gold);
 const brim=(u,v)=>{
  const t=u*Math.PI*2,front=Math.pow(Math.max(0,Math.sin(t)),5),width=.12+front*.28,r=1+v*width;
  return [1.22*r*Math.cos(t),-.56-v*.055-Math.sin(v*Math.PI)*.016,1.35*r*Math.sin(t)];
 };
 surface(brim,192,16,gold);
 // A rolled edge closes the upper and lower visor without a hard seam.
 surface((u,v)=>{const t=u*Math.PI*2,p=brim(u,1),a=v*Math.PI;return [p[0]+Math.sin(a)*.024*Math.cos(t),p[1]-.034+Math.cos(a)*.034,p[2]+Math.sin(a)*.024*Math.sin(t)];},192,16,gold);
 surface((u,v)=>{const p=brim(1-u,v);return [p[0],p[1]-.068,p[2]];},192,16,edge);
 function ellipsoid(center,size,color){surface((u,v)=>{const t=u*Math.PI*2,p=.001+v*(Math.PI-.002);return [center[0]+size[0]*Math.sin(p)*Math.cos(t),center[1]+size[1]*Math.cos(p),center[2]+size[2]*Math.sin(p)*Math.sin(t)];},48,24,color);}
 // Recessed ventilation slots on both sides, with moulded surrounds.
 for(const side of [-1,1])for(let i=0;i<4;i++){const z=(i-1.5)*.29,y=-.05,x=side*1.22*Math.sqrt(1-Math.pow((y+.56)/1.53,2)-Math.pow(z/1.35,2));ellipsoid([x,y,z],[.028,.085,.112],edge);ellipsoid([x+side*.012,y,z],[.023,.052,.078],dark);}
 // Inner suspension band and small metallic attachment points.
 surface((u,v)=>{const t=u*Math.PI*2;return [1.12*Math.cos(t),-.58-v*.18,1.24*Math.sin(t)];},128,6,dark);
 for(const side of [-1,1])for(const z of [-.65,.65])ellipsoid([side*1.07,-.48,z],[.055,.055,.055],metal);
 const cloud=[];
 for(let i=0;i<760;i++){const angle=random()*Math.PI*2,r=.5+Math.sqrt(random())*1.9;cloud.push(Math.cos(angle)*r,Math.sin(angle)*r*.82,-2-random()*.5,random()*3.8+2,random()*.4+.6,random()*6.28);}
 let main,particles,meshes,points,uniforms,particleUniforms;
 function program(v,f){const p=gl.createProgram();for(const [type,source] of [[gl.VERTEX_SHADER,v],[gl.FRAGMENT_SHADER,f]]){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));gl.attachShader(p,s);gl.deleteShader(s);}gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p;}
 function buffer(data){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);return {buffer:b,count:data.length/6};}
 function init(){
  main=program(vertex,fragment);particles=program(particleVertex.replace('10.-p.z','9.-p.z').replaceAll('3.4','4.'),particleFragment);
  meshes=parts.map(part=>({...buffer(part.data),color:part.color}));points=buffer(cloud);
  uniforms=Object.fromEntries(['uView','uTurn','uPosition','uSize','uAspect','uColor'].map(n=>[n,gl.getUniformLocation(main,n)]));
  particleUniforms=Object.fromEntries(['uPosition','uAspect','uTime','uRatio','uColor'].map(n=>[n,gl.getUniformLocation(particles,n)]));
  gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
 }
 function bind(m,p){gl.bindBuffer(gl.ARRAY_BUFFER,m.buffer);for(let i=0;i<3;i++)gl.disableVertexAttribArray(i);['aPosition','aNormal'].forEach((n,i)=>{const a=gl.getAttribLocation(p,n);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,24,i*12);});}
 let paused=initiallyPaused,visible=false,lost=false,frame=0,last=0,time=0,amount=0,target=0,ratio=1;
 init();
 function draw(){
  if(lost)return;
  gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.disable(gl.BLEND);gl.depthMask(true);gl.useProgram(main);
  gl.uniform1f(uniforms.uAspect,canvas.width/canvas.height);gl.uniformMatrix3fv(uniforms.uView,false,rotation(.23+amount*.08,-.55+amount*.3,-.12));
  gl.uniform3fv(uniforms.uPosition,[0,0,0]);gl.uniform3fv(uniforms.uSize,[1,1,1]);gl.uniformMatrix3fv(uniforms.uTurn,false,rotation(0,0,0));
  for(const mesh of meshes){bind(mesh,main);gl.uniform3fv(uniforms.uColor,mesh.color);gl.drawArrays(gl.TRIANGLES,0,mesh.count);}
  gl.useProgram(particles);bind(points,particles);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);
  gl.uniform1f(particleUniforms.uAspect,canvas.width/canvas.height);gl.uniform1f(particleUniforms.uTime,time);gl.uniform1f(particleUniforms.uRatio,ratio);gl.uniform3fv(particleUniforms.uPosition,[0,0,0]);gl.uniform3fv(particleUniforms.uColor,[1,.48,.12]);gl.drawArrays(gl.POINTS,0,points.count);gl.depthMask(true);
 }
 function tick(now){frame=0;if(!visible||document.hidden||lost)return;const dt=last?Math.min((now-last)/1000,.05):1/60;last=now;if(!paused){time+=dt;amount+=(target-amount)*(1-Math.exp(-dt*(target?4.5:3.2)));}draw();if(!paused)frame=requestAnimationFrame(tick);}
 function schedule(){if(!frame&&visible&&!document.hidden&&!lost){last=0;frame=requestAnimationFrame(tick);}}
 function setTarget(value){target=value;if(paused){amount=target;draw();}schedule();}
 canvas.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')setTarget(1);});
 canvas.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse')setTarget(0);});

 canvas.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home'].includes(event.key)){event.preventDefault();setTarget(event.key==='Home'?0:Math.max(-2,Math.min(2,target+(event.key==='ArrowRight'?.6:-.6))));}});
 canvas.addEventListener('blur',()=>setTarget(0));
 function resize(){const rect=canvas.getBoundingClientRect();ratio=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.max(1,Math.round(rect.width*ratio));canvas.height=Math.max(1,Math.round(rect.height*ratio));draw();}
 new ResizeObserver(resize).observe(canvas);
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();else{cancelAnimationFrame(frame);frame=0;setTarget(0);}}).observe(canvas);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;canvas.parentElement.classList.remove('ready');});
 canvas.addEventListener('webglcontextrestored',()=>{try{init();lost=false;resize();canvas.parentElement.classList.add('ready');schedule();}catch{canvas.parentElement.classList.remove('ready');}});
 resize();canvas.parentElement.classList.add('ready');
 return {setPaused(value){paused=value;cancelAnimationFrame(frame);frame=0;amount=target;draw();schedule();}};
}

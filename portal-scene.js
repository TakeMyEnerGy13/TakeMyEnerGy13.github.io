import { rotation } from './scene.js';

const vertex = `
attribute vec3 aPosition; attribute vec3 aNormal;
uniform mat3 uRotation; uniform float uAspect;
varying vec3 vNormal; varying vec3 vPosition; varying vec3 vLocal;
void main(){
 vLocal=aPosition;vPosition=uRotation*(aPosition*vec3(.92,1.05,1.));vNormal=uRotation*(aNormal/vec3(.92,1.05,1.));
 float d=8.-vPosition.z;
 float projection=min(3.,uAspect*2.6);
 gl_Position=vec4(vPosition.x*projection/uAspect,vPosition.y*projection,(d*30.1-6.)/29.9,d);
}`;
const fragment = `
precision highp float;
uniform float uTime; uniform float uKind; uniform float uHover;
varying vec3 vNormal; varying vec3 vPosition; varying vec3 vLocal;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float mist(vec2 p){return noise(p)*.57+noise(p*2.03)*.28+noise(p*4.07)*.15;}
vec3 portalLight(vec2 p){
 float radius=length(p),angle=atan(p.y,p.x);
 vec3 purple=vec3(.35,.065,1.),pink=vec3(.88,.15,.67),blue=vec3(.035,.54,1.);
 float flow=mist(p*3.+vec2(uTime*.055,-uTime*.045));
 float spiral=angle*3.+log(radius+.16)*10.-uTime*.48+flow*3.2;
 float ribbons=pow(.5+.5*sin(spiral),4.);
 float wisps=pow(.5+.5*sin(spiral*3.+flow*5.),20.);
 float nebula=mist(p*5.-vec2(uTime*.06));
 float inner=smoothstep(.025,.20,radius);
 float hue=.5+.5*sin(angle-radius*4.+flow*3.-uTime*.12);
 vec3 color=mix(purple,pink,hue*.85);
 float cyan=pow(.5+.5*cos(angle+radius*3.+uTime*.10),3.)*(.28+uHover*.6);
 color=mix(color,blue,cyan);
 color*=(.13+nebula*.18+ribbons*(.35+uHover*.22)+wisps*.34)*inner;
 color+=mix(vec3(.58,.24,1.),vec3(.52,.8,1.),cyan)*pow(ribbons,3.)*(.18+uHover*.28)*inner;
 return color;
}
void main(){
 float r=length(vLocal.xy),angle=atan(vLocal.y,vLocal.x);
 if(uKind>.5){
  vec2 p=vLocal.xy/2.03;
  float radius=length(p);
  float edge=1.-smoothstep(.90,1.02,radius);
  vec3 color=portalLight(p);
  // A small receding core and vignette make the aperture feel deep.
  color=mix(vec3(.012,.004,.035),color,edge);
  color+=vec3(.10,.015,.24)*exp(-radius*radius*18.);
  float reveal=smoothstep(0.,.95,uHover);
  float aperture=(1.-smoothstep(reveal*1.3-.20,reveal*1.3+.08,radius))*reveal;
  vec3 closed=vec3(.014,.006,.027)+vec3(.042,.012,.072)*pow(radius,3.);
  gl_FragColor=vec4(mix(closed,color,aperture),1.);return;
 }
 vec3 n=normalize(vNormal),view=normalize(vec3(0.,0.,8.)-vPosition);
 vec2 stoneUV=vLocal.xy;
 float grain=noise(stoneUV*54.);
 float relief=noise(stoneUV*11.)*.7+grain*.3;
 vec2 slope=vec2(noise((stoneUV+vec2(.009,0.))*11.),noise((stoneUV+vec2(0.,.009))*11.))-noise(stoneUV*11.);
 vec3 bump=vec3(slope*1.8,0.);
 n=normalize(n-(bump-n*dot(bump,n)));
 vec3 light=normalize(vec3(-2.,3.,4.));
 float diffuse=max(dot(n,light),0.);
 float spec=pow(max(dot(reflect(-light,n),view),0.),mix(25.,58.,relief));
 float fresnel=pow(1.-max(dot(n,view),0.),3.);
 float segment=fract((angle+3.141593)/6.283185*28.);
 float joint=1.-smoothstep(.018,.12,min(segment,1.-segment));
 float stoneTone=hash(vec2(floor((angle+3.141593)/6.283185*28.),3.));
 float vein=1.-smoothstep(.014,.045,abs(noise(stoneUV*15.)+noise(stoneUV*41.)*.22-.59));
 float texture=mix(.84,1.10,relief)*mix(.91,1.07,stoneTone)*(1.-vein*.12);
 float carving=exp(-pow((r-2.085)*125.,2.))+exp(-pow((r-2.325)*125.,2.));
 // Sample a small area of the aperture so reflected light follows its moving colors.
 vec2 radial=vec2(cos(angle),sin(angle));
 vec3 incident=portalLight(radial*.90)*.5;
 incident+=portalLight(vec2(cos(angle-.14),sin(angle-.14))*.84)*.25;
 incident+=portalLight(vec2(cos(angle+.14),sin(angle+.14))*.94)*.25;
 float luminance=dot(incident,vec3(.2126,.7152,.0722));
 incident=mix(incident,vec3(luminance),.22);
 incident=incident/(vec3(1.)+incident*.65);
 float facing=max(dot(n,normalize(vec3(-radial,-.35))),0.);
 float falloff=exp(-pow((r-1.975)*4.6,2.));
 float rimLight=.95+.40*smoothstep(.35,1.,uHover);
 vec3 color=vec3(.085,.073,.11)*(.4+diffuse)*texture+vec3(.22,.22,.27)*spec*(.6+grain*.4);
 color+=vec3(.025,.012,.045)*(fresnel*.6+falloff*.35);
 color+=incident*rimLight*falloff*(.42+facing*.85)*texture;
 color*=(1.-joint*.38)*(1.-carving*.24);
 gl_FragColor=vec4(color,1.);
}`;
const dustVertex = `
attribute vec3 aPosition; attribute vec3 aNormal;
uniform mat3 uRotation; uniform float uAspect; uniform float uTime; uniform float uRatio; uniform float uHover;
varying float vAlpha;
void main(){
 float activeOnly=1.-step(0.,aNormal.z);
 float activation=smoothstep(.05,.85,uHover);
 float angle=aPosition.x+uTime*abs(aNormal.z);
 float radius=aPosition.y+sin(uTime*.3+aNormal.y)*.025;
 radius+=activeOnly*sin(uTime*.55+aNormal.y)*.12;
 vec3 p=uRotation*vec3(cos(angle)*radius*.92,sin(angle)*radius*1.05,aPosition.z);
 float d=8.-p.z;
 float projection=min(3.,uAspect*2.6);
 gl_Position=vec4(p.x*projection/uAspect,p.y*projection,(d*30.1-6.)/29.9,d);
 gl_PointSize=aNormal.x*uRatio*(1.+activeOnly*.2);
 vAlpha=(.35+.25*sin(uTime*.6+aNormal.y))*(aNormal.x>12.?.14:1.)*(.65+uHover*1.05);
 vAlpha*=mix(1.,activation*1.6,activeOnly);
}`;
const dustFragment = `
precision mediump float;varying float vAlpha;
void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;
 float core=exp(-r*r*5.)*(1.-smoothstep(.65,1.,r));
 gl_FragColor=vec4(mix(vec3(.52,.18,1.),vec3(.9,.7,1.),core*.5),core*vAlpha);
}`;

export function createPortalScene(canvas, initiallyPaused=false){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'});
 if(!gl)throw new Error('WebGL unavailable');
 const ring=[],disk=[],dust=[];
 // Individual rounded stones, with normals derived from their actual beveled surface.
 const stoneCount=28,arcSteps=12,profileSteps=48;
 const point=(stone,u,v)=>{
  const angle=(stone+.012+u*.976)/stoneCount*Math.PI*2;
  const phase=v*Math.PI*2,edge=Math.exp(-u*32)+Math.exp(-(1-u)*32);
  const variation=Math.sin(stone*7.13);
  const radial=.23*(1-edge*.10),depth=.27*(1-edge*.20);
  const r=2.2+variation*.003+radial*Math.sign(Math.cos(phase))*Math.pow(Math.abs(Math.cos(phase)),.70);
  return [Math.cos(angle)*r,Math.sin(angle)*r,depth*Math.sign(Math.sin(phase))*Math.pow(Math.abs(Math.sin(phase)),.70)+variation*.006];
 };
 function ringVertex(stone,u,v){
  const p=point(stone,u,v),e=.0001;
  const a=point(stone,u-e,v),b=point(stone,u+e,v),c=point(stone,u,v-e),d=point(stone,u,v+e);
  const t=b.map((x,i)=>x-a[i]),q=d.map((x,i)=>x-c[i]);
  const n=[t[1]*q[2]-t[2]*q[1],t[2]*q[0]-t[0]*q[2],t[0]*q[1]-t[1]*q[0]];
  const length=Math.hypot(...n);
  ring.push(...p,...n.map(x=>x/length));
 }
 for(let stone=0;stone<stoneCount;stone++){
  for(let i=0;i<arcSteps;i++)for(let j=0;j<profileSteps;j++){
   const u=i/arcSteps,U=(i+1)/arcSteps,v=j/profileSteps,V=(j+1)/profileSteps;
   for(const [a,b] of [[u,v],[U,v],[U,V],[u,v],[U,V],[u,V]])ringVertex(stone,a,b);
  }
  for(const side of [0,1]){
   const angle=(stone+.012+side*.976)/stoneCount*Math.PI*2;
   const normal=[-Math.sin(angle)*(side?1:-1),Math.cos(angle)*(side?1:-1),0];
   const center=[Math.cos(angle)*(2.2+Math.sin(stone*7.13)*.003),Math.sin(angle)*(2.2+Math.sin(stone*7.13)*.003),Math.sin(stone*7.13)*.006];
   for(let j=0;j<profileSteps;j++)for(const p of [center,point(stone,side,j/profileSteps),point(stone,side,(j+1)/profileSteps)])ring.push(...p,...normal);
  }
 }
 for(let i=0;i<256;i++){
  const a=i/256*Math.PI*2,b=(i+1)/256*Math.PI*2;
  disk.push(0,0,-.17,0,0,1,Math.cos(a)*2.03,Math.sin(a)*2.03,-.17,0,0,1,Math.cos(b)*2.03,Math.sin(b)*2.03,-.17,0,0,1);
 }
 let seed=943;
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<700;i++){
  const halo=i<70;
  dust.push(random()*Math.PI*2,halo?2.2:2.15+Math.pow(random(),2)*1.25,(random()-.5)*.65,halo?65+random()*70:1.8+random()*2.7,random()*6.28,.018+random()*.025);
 }
 // Negative orbit speeds mark sparks that appear only while the portal is active.
 for(let i=0;i<1200;i++){
  dust.push(random()*Math.PI*2,2.36+Math.pow(random(),1.7)*.95,(random()-.5)*.9,2.2+random()*3.2,random()*6.28,-(.065+random()*.10));
 }
 let program,particleProgram,ringMesh,diskMesh,dustMesh,uniforms,particleUniforms;
 const makeProgram=(vs,fs)=>{
  const p=gl.createProgram();
  for(const [type,source] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){
   const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
   if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));
   gl.attachShader(p,shader);gl.deleteShader(shader);
  }
  gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p;
 };
 const mesh=data=>{const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);return {buffer,count:data.length/6};};
 const locations=p=>Object.fromEntries(['uRotation','uAspect','uTime','uKind','uRatio','uHover'].map(name=>[name,gl.getUniformLocation(p,name)]));
 function initialize(){
  program=makeProgram(vertex,fragment);particleProgram=makeProgram(dustVertex,dustFragment);
  uniforms=locations(program);particleUniforms=locations(particleProgram);
  ringMesh=mesh(ring);diskMesh=mesh(disk);dustMesh=mesh(dust);
  gl.clearColor(0,0,0,0);gl.enable(gl.DEPTH_TEST);
 }
 function bind(m,p){
  gl.bindBuffer(gl.ARRAY_BUFFER,m.buffer);
  for(let i=0;i<3;i++)gl.disableVertexAttribArray(i);
  for(const [i,name] of ['aPosition','aNormal'].entries()){
   const location=gl.getAttribLocation(p,name);if(location<0)continue;
   gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,3,gl.FLOAT,false,24,i*12);
  }
 }
 let paused=initiallyPaused,visible=false,lost=false,frame=0,last=0,time=0,ratio=1,hover=0,targetHover=0;
 function draw(){
  if(lost)return;
  gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const turn=rotation(0,0,0),aspect=canvas.width/canvas.height;
  gl.disable(gl.BLEND);gl.depthMask(true);gl.useProgram(program);
  gl.uniformMatrix3fv(uniforms.uRotation,false,turn);gl.uniform1f(uniforms.uAspect,aspect);gl.uniform1f(uniforms.uTime,time);gl.uniform1f(uniforms.uHover,hover);
  bind(diskMesh,program);gl.uniform1f(uniforms.uKind,1);gl.drawArrays(gl.TRIANGLES,0,diskMesh.count);
  bind(ringMesh,program);gl.uniform1f(uniforms.uKind,0);gl.drawArrays(gl.TRIANGLES,0,ringMesh.count);
  gl.useProgram(particleProgram);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);
  gl.uniformMatrix3fv(particleUniforms.uRotation,false,turn);gl.uniform1f(particleUniforms.uAspect,aspect);gl.uniform1f(particleUniforms.uTime,time);gl.uniform1f(particleUniforms.uRatio,ratio);gl.uniform1f(particleUniforms.uHover,hover);
  bind(dustMesh,particleProgram);gl.drawArrays(gl.POINTS,0,dustMesh.count);gl.depthMask(true);
 }
 function tick(now){
  frame=0;if(!visible||paused||document.hidden||lost){last=0;return;}
  const dt=last?Math.min((now-last)/1000,.05):1/60;last=now;time+=dt*hover*(1+hover*.45);hover+=(targetHover-hover)*(1-Math.exp(-dt*2.4));
  draw();if(targetHover>0||hover>.001)frame=requestAnimationFrame(tick);
 }
 function schedule(){if(!frame&&visible&&!paused&&!document.hidden&&!lost){last=0;frame=requestAnimationFrame(tick);}}
 function resize(){const box=canvas.getBoundingClientRect();ratio=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.max(1,Math.round(box.width*ratio));canvas.height=Math.max(1,Math.round(box.height*ratio));draw();}
 initialize();resize();canvas.parentElement.classList.add('ready');
 new ResizeObserver(resize).observe(canvas);
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible){draw();schedule();}else{cancelAnimationFrame(frame);frame=0;last=0;}},{rootMargin:'80px'}).observe(canvas);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else schedule();});
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;canvas.parentElement.classList.remove('ready');});
 canvas.addEventListener('webglcontextrestored',()=>{try{initialize();lost=false;resize();canvas.parentElement.classList.add('ready');schedule();}catch{canvas.parentElement.classList.remove('ready');}});
 return {setOpen(value){targetHover=value?1:0;if(paused){hover=targetHover;draw();}schedule();},setPaused(value){paused=value;cancelAnimationFrame(frame);frame=0;last=0;hover=targetHover;draw();schedule();}};
}

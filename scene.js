// Textured Earth, beveled SVG extrusions, and particle halos in native WebGL.
const vertexSource = `
attribute vec3 aPosition; attribute vec3 aNormal; attribute vec2 aUV;
uniform mat3 uRotation; uniform vec3 uPosition; uniform float uScale; uniform float uAspect;
varying vec3 vPosition; varying vec3 vNormal; varying vec3 vLocal; varying vec2 vUV;
void main(){
 vLocal=aPosition; vPosition=uRotation*aPosition*uScale+uPosition; vNormal=uRotation*aNormal; vUV=aUV;
 float d=10.0-vPosition.z;
 gl_Position=vec4(vPosition.x*3.4/uAspect,vPosition.y*3.4,(d*30.1-6.0)/29.9,d);
}`;
const fragmentSource = `
precision highp float;
uniform sampler2D uEarth; uniform sampler2D uNight; uniform sampler2D uNormal;
uniform mat3 uRotation; uniform float uKind; uniform vec3 uColor;
uniform vec3 uLogoPositions[4]; uniform vec3 uLogoColors[4];
varying vec3 vPosition; varying vec3 vNormal; varying vec3 vLocal; varying vec2 vUV;
void main(){
 vec3 n=normalize(vNormal),view=normalize(vec3(0.,0.,10.)-vPosition),light=normalize(vec3(-.8,1.,1.3));
 float facing=max(dot(n,view),0.);
 if(uKind>1.5){
  float rim=pow(1.-facing,4.5),lit=.25+.75*max(dot(n,light),0.);
  gl_FragColor=vec4(vec3(.22,.43,.8)*rim*lit,rim*.5);return;
 }
 vec3 color;
 if(uKind<.5){
  vec3 detail=texture2D(uNormal,vUV).xyz*2.-1.;
  vec3 tangent=normalize(vec3(-vLocal.z,0.,vLocal.x)),bitangent=normalize(cross(normalize(vLocal),tangent));
  n=normalize(uRotation*normalize(normalize(vLocal)*detail.z+tangent*detail.x*.42+bitangent*detail.y*.42));
  float day=max(dot(n,light),0.);
  vec3 land=texture2D(uEarth,vUV).rgb;
  land=mix(vec3(dot(land,vec3(.2126,.7152,.0722))),land,.38);
  color=land*vec3(.66,.75,.89)*(pow(day,.85)*1.12+.025);
  color+=texture2D(uNight,vUV).rgb*vec3(1.,.68,.37)*(1.-smoothstep(-.12,.25,dot(n,light)))*.65;
  float ocean=smoothstep(.015,.10,land.b-land.r);
  color+=vec3(.24,.37,.5)*pow(max(dot(reflect(-light,n),view),0.),65.)*ocean*.45;
  color+=vec3(.12,.25,.47)*pow(1.-facing,4.)*(.2+day*.8);
  // Surface lighting follows the actual moving emitters, not screen-space particles.
  for(int i=0;i<4;i++){
   vec3 offset=uLogoPositions[i]-vPosition;
   float distanceSquared=dot(offset,offset);
   vec3 direction=offset*inversesqrt(max(distanceSquared,.0001));
   float attenuation=2.8/(1.+distanceSquared*.85);
   float incidence=max(dot(n,direction),0.);
   float reflection=pow(max(dot(n,normalize(direction+view)),0.),12.);
   color+=uLogoColors[i]*attenuation*((land*.65+vec3(.09))*incidence+vec3(.07)*reflection);
  }
 }else{
  vec3 r=reflect(-view,n),tint=uColor;
  float diffuse=max(dot(n,light),0.),strip=exp(-pow((r.x+.38)*5.,2.))*.7;
  float specular=pow(max(dot(r,normalize(vec3(-.6,.8,1.))),0.),24.)*1.5,edge=pow(1.-facing,3.);
  if(uColor.b>.95&&uColor.r<.6)tint=mix(vec3(.2,.34,1.),vec3(.9,.3,1.),smoothstep(-.5,.8,vLocal.x-vLocal.y));
  color=tint*(.3+diffuse*.67)+vec3(.86,.9,1.)*(strip+specular)*.45+tint*edge*.58;
  color*=.8+.2*smoothstep(-.05,.08,vLocal.z);
 }
 gl_FragColor=vec4(pow(max(color,vec3(0.)),vec3(.88)),1.);
}`;
const particleVertex = `
attribute vec3 aPosition; attribute vec3 aNormal;
uniform vec3 uPosition; uniform float uTime; uniform float uAspect; uniform float uRatio;
varying float vAlpha;
void main(){
 vec3 p=aPosition;p.x+=sin(uTime*.25+aNormal.z)*.035;p.y+=cos(uTime*.18+aNormal.z)*.045;p+=uPosition;
 float d=10.-p.z;gl_Position=vec4(p.x*3.4/uAspect,p.y*3.4,(d*30.1-6.)/29.9,d);
 gl_PointSize=aNormal.x*uRatio;vAlpha=aNormal.y*(.85+.15*sin(uTime*.7+aNormal.z));
}`;
const particleFragment = `
precision mediump float; uniform vec3 uColor; varying float vAlpha;
void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;
 float core=exp(-d*d*4.)*(1.-smoothstep(.5,1.,d));
 vec3 glow=mix(uColor,vec3(1.),.18*exp(-d*d*24.));
 gl_FragColor=vec4(glow,core*vAlpha);
}`;

function rotation(x,y,z){
 const a=Math.cos(x),b=Math.sin(x),c=Math.cos(y),d=Math.sin(y),e=Math.cos(z),f=Math.sin(z);
 return new Float32Array([c*e,c*f,-d,b*d*e-a*f,b*d*f+a*e,b*c,a*d*e+b*f,a*d*f-b*e,a*c]);
}
function sphere(){
 const data=[];
 const vertex=(u,v)=>{const t=u*Math.PI*2,p=v*Math.PI;const n=[-Math.cos(t)*Math.sin(p),Math.cos(p),Math.sin(t)*Math.sin(p)];data.push(...n,...n,u,1-v);};
 for(let y=0;y<80;y++)for(let x=0;x<128;x++){
  const u=x/128,v=y/80,U=(x+1)/128,V=(y+1)/80;
  vertex(u,v);vertex(u,V);vertex(U,v);vertex(U,v);vertex(u,V);vertex(U,V);
 }
 return new Float32Array(data);
}
function imageFromURL(url){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(`Image failed: ${url}`));image.src=url;});}

// Generate front/back surfaces and sidewalls from each actual SVG silhouette.
async function extrudeLogo(url){
 const response=await fetch(url);if(!response.ok)throw new Error(`Logo failed: ${url}`);
 const svg=(await response.text()).replaceAll('currentColor','#ffffff').replace(/width="1em"/,'width="256"').replace(/height="1em"/,'height="256"');
 const image=await imageFromURL(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
 const size=224,canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
 const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,4,4,size-8,size-8);
 const pixels=context.getImageData(0,0,size,size).data,inside=new Uint8Array(size*size),distance=new Float32Array(size*size);
 for(let i=0;i<inside.length;i++){inside[i]=pixels[i*4+3]>100?1:0;distance[i]=inside[i]?1000:0;}
 for(let y=1;y<size;y++)for(let x=1;x<size;x++){const i=y*size+x;distance[i]=Math.min(distance[i],distance[i-1]+1,distance[i-size]+1,distance[i-size-1]+1.414);}
 for(let y=size-2;y>=0;y--)for(let x=size-2;x>=0;x--){const i=y*size+x;distance[i]=Math.min(distance[i],distance[i+1]+1,distance[i+size]+1,distance[i+size+1]+1.414);}
 const step=2/size,data=[];
 const height=(x,y)=>.075+Math.min(distance[Math.max(0,Math.min(size-1,y))*size+Math.max(0,Math.min(size-1,x))]*step,.028);
 const filled=(x,y)=>x>=0&&y>=0&&x<size&&y<size&&inside[y*size+x];
 const front=(x,y,sign)=>{
  const dx=(height(x+1,y)-height(x-1,y))/(2*step),dy=(height(x,y+1)-height(x,y-1))/(2*step),length=Math.hypot(dx,dy,1);
  data.push(x*step-1,1-y*step,height(x,y)*sign,-dx/length,dy/length,sign/length,x/size,1-y/size);
 };
 const coverage=(x,y)=>{
  let total=0;for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++)total+=filled(Math.round(x)+i,Math.round(y)+j)?1:0;return total/25;
 };
 const wall=(x1,y1,x2,y2,nx,ny)=>{
  const cx=(x1+x2)/2,cy=(y1+y2)/2;
  const gx=coverage(cx+1,cy)-coverage(cx-1,cy),gy=coverage(cx,cy+1)-coverage(cx,cy-1),length=Math.hypot(gx,gy);
  if(length>.01){nx=-gx/length;ny=gy/length;}
  const push=(x,y,s)=>data.push(x*step-1,1-y*step,height(x,y)*s,nx,ny,0,0,0);
  push(x1,y1,1);push(x1,y1,-1);push(x2,y2,1);push(x2,y2,1);push(x1,y1,-1);push(x2,y2,-1);
 };
 for(let y=1;y<size-1;y++)for(let x=1;x<size-1;x++)if(filled(x,y)){
  for(const sign of [1,-1]){front(x,y,sign);front(x,y+1,sign);front(x+1,y,sign);front(x+1,y,sign);front(x,y+1,sign);front(x+1,y+1,sign);}
  if(!filled(x-1,y))wall(x,y,x,y+1,-1,0);if(!filled(x+1,y))wall(x+1,y,x+1,y+1,1,0);
  if(!filled(x,y-1))wall(x,y,x+1,y,0,1);if(!filled(x,y+1))wall(x,y+1,x+1,y+1,0,-1);
 }
 return new Float32Array(data);
}
function particles(seed){
 const values=[];let state=seed;const random=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296;};
 for(let i=0;i<460;i++){const angle=random()*Math.PI*2,radius=Math.pow(random(),.7)*1.18;
  values.push(Math.cos(angle)*radius,Math.sin(angle)*radius*.7,-.4-random()*.5,i<70?48+random()*72:1.8+random()*3.,i<70?.26:.55+random()*.45,random()*6.28);
 }return new Float32Array(values);
}

export async function createEnergyScene(canvas,initiallyPaused=false){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,stencil:true,powerPreference:'low-power',premultipliedAlpha:false});
 if(!gl)throw new Error('WebGL is not supported');
 const [earth,night,normal,...logos]=await Promise.all([
  imageFromURL('./assets/earth.jpg'),imageFromURL('./assets/earth-night.png'),imageFromURL('./assets/earth-normal.jpg'),
  ...['claude','chatgpt','gemini','perplexity'].map(name=>extrudeLogo(`./assets/${name}.svg`)),
 ]);
 const brands=[
  {data:logos[0],color:[1,.44,.24],position:[-2.8,.8,.4],tilt:[-.16,.42,-.18],scale:.64},
  {data:logos[1],color:[.84,.98,.9],glow:[.18,1,.55],position:[-2.3,-1.25,2.2],tilt:[.12,-.36,.17],scale:.58},
  {data:logos[2],color:[.3,.4,1],position:[2.7,1.12,-.15],tilt:[-.12,-.4,.12],scale:.56},
  {data:logos[3],color:[.18,.9,.94],position:[2.6,-1.22,1.3],tilt:[.13,-.37,-.16],scale:.53},
 ];
 const globeData=sphere(),particleData=brands.map((_,i)=>particles(112+i*89));
 let mainProgram,particleProgram,globe,brandMeshes,clouds,mainUniforms,particleUniforms,mainAttributes,particleAttributes;
 const uniforms=(program,names)=>Object.fromEntries(names.map(name=>[name,gl.getUniformLocation(program,name)]));
 function program(vertex,fragment){
  const shaders=[gl.VERTEX_SHADER,gl.FRAGMENT_SHADER].map((type,i)=>{
   const shader=gl.createShader(type);gl.shaderSource(shader,i===0?vertex:fragment);gl.compileShader(shader);
   if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));return shader;
  });
  const p=gl.createProgram();shaders.forEach(s=>gl.attachShader(p,s));gl.linkProgram(p);shaders.forEach(s=>gl.deleteShader(s));
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p;
 }
 function buffer(data,stride){const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);return {buffer,count:data.length/stride};}
 function texture(image,unit){
  gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 }
 function initialize(){
  mainProgram=program(vertexSource,fragmentSource);particleProgram=program(particleVertex,particleFragment);
  mainUniforms=uniforms(mainProgram,['uRotation','uPosition','uScale','uAspect','uKind','uColor','uEarth','uNight','uNormal','uLogoPositions[0]','uLogoColors[0]']);
  particleUniforms=uniforms(particleProgram,['uPosition','uTime','uAspect','uRatio','uColor']);
  mainAttributes=['aPosition','aNormal','aUV'].map(n=>gl.getAttribLocation(mainProgram,n));particleAttributes=['aPosition','aNormal'].map(n=>gl.getAttribLocation(particleProgram,n));
  globe=buffer(globeData,8);brandMeshes=brands.map(b=>buffer(b.data,8));clouds=particleData.map(d=>buffer(d,6));
  texture(earth,0);texture(night,1);texture(normal,2);gl.useProgram(mainProgram);
  gl.uniform1i(mainUniforms.uEarth,0);gl.uniform1i(mainUniforms.uNight,1);gl.uniform1i(mainUniforms.uNormal,2);
  gl.uniform3fv(mainUniforms['uLogoColors[0]'],new Float32Array(brands.flatMap(brand=>brand.glow||brand.color)));
  gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
 }
 initialize();
 let paused=initiallyPaused,visible=true,lost=false,frame=0,previous=0,elapsed=0;
 let width=1,height=1,ratio=1,targetX=0,targetY=0,pointerX=0,pointerY=0,compact=false;
 const hero=canvas.closest('.hero');
 const hover=brands.map(()=>({x:0,y:0,vx:0,vy:0,targetX:0,targetY:0,active:false,returnAt:0}));
 const positions=()=>brands.map(brand=>[brand.position[0]*(compact?.73:1),brand.position[1],brand.position[2]]);
 function clearHover(){hover.forEach(h=>{h.targetX=0;h.targetY=0;h.active=false;h.returnAt=0;});}
 function releaseHover(h){if(h.active){h.active=false;h.returnAt=performance.now()+3000;}}
 function attributes(mesh,locations,stride){
  gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);for(let i=0;i<3;i++)gl.disableVertexAttribArray(i);
  locations.forEach((location,i)=>{if(location<0)return;gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,i===2?2:3,gl.FLOAT,false,stride*4,i*12);});
 }
 function drawMesh(mesh,position,scale,rotationMatrix,kind,color=[1,1,1]){
  attributes(mesh,mainAttributes,8);gl.uniformMatrix3fv(mainUniforms.uRotation,false,rotationMatrix);
  gl.uniform3fv(mainUniforms.uPosition,position);gl.uniform1f(mainUniforms.uScale,scale);gl.uniform1f(mainUniforms.uKind,kind);gl.uniform3fv(mainUniforms.uColor,color);
  gl.drawArrays(gl.TRIANGLES,0,mesh.count);
 }
 function draw(){
  if(lost)return;gl.viewport(0,0,width,height);gl.stencilMask(0xff);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);
  gl.useProgram(mainProgram);gl.uniform1f(mainUniforms.uAspect,width/height);gl.disable(gl.BLEND);gl.depthMask(true);
  const earthRotation=rotation(.13+pointerY*.06,2.7+elapsed*.022+pointerX*.08,-.16),earthPosition=[0,.05,0],earthScale=compact?1.77:2.15;
  // Move each logo, its particle cloud and surface lighting together.
  const logoPositions=positions().map((p,i)=>[p[0]+hover[i].x*.14,p[1]-hover[i].y*.14,p[2]]);
  gl.uniform3fv(mainUniforms['uLogoPositions[0]'],new Float32Array(logoPositions.flat()));
  // Depth testing occludes only particles physically behind the planet.
  gl.disable(gl.STENCIL_TEST);
  drawMesh(globe,earthPosition,earthScale,earthRotation,0);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);drawMesh(globe,earthPosition,earthScale*1.012,earthRotation,2);
  gl.useProgram(particleProgram);gl.uniform1f(particleUniforms.uAspect,width/height);gl.uniform1f(particleUniforms.uTime,elapsed);gl.uniform1f(particleUniforms.uRatio,ratio);
  brands.forEach((brand,i)=>{attributes(clouds[i],particleAttributes,6);gl.uniform3fv(particleUniforms.uPosition,logoPositions[i]);gl.uniform3fv(particleUniforms.uColor,brand.glow||brand.color);gl.drawArrays(gl.POINTS,0,clouds[i].count);});
  gl.disable(gl.STENCIL_TEST);gl.disable(gl.BLEND);gl.depthMask(true);gl.useProgram(mainProgram);
  brands.forEach((brand,i)=>{const t=brand.tilt,h=hover[i];drawMesh(brandMeshes[i],logoPositions[i],brand.scale*(compact?.8:1),rotation(t[0]+h.y*.10,t[1]+h.x*.14,t[2]-h.x*.06+h.y*.04),1,brand.color);});
 }
 function tick(now){
  frame=0;if(paused||!visible||document.hidden||lost){previous=0;return;}
  const delta=previous?Math.min((now-previous)/1000,.05):1/60;
  if(previous)elapsed+=delta;previous=now;pointerX+=(targetX-pointerX)*.04;pointerY+=(targetY-pointerY)*.04;
  hover.forEach(h=>{
   if(!h.active&&h.returnAt&&now>=h.returnAt){h.targetX=0;h.targetY=0;h.returnAt=0;}
   // Analytic critically damped spring stays smooth across frame rates.
   const omega=h.active||h.returnAt?2.8:.8,decay=Math.exp(-omega*delta);
   for(const [axis,velocity,target] of [['x','vx','targetX'],['y','vy','targetY']]){
    const offset=h[axis]-h[target],impulse=h[velocity]+omega*offset;
    h[axis]=h[target]+(offset+impulse*delta)*decay;
    h[velocity]=(h[velocity]-omega*impulse*delta)*decay;
   }
  });
  draw();frame=requestAnimationFrame(tick);
 }
 function schedule(){if(!frame&&!paused&&visible&&!document.hidden&&!lost)frame=requestAnimationFrame(tick);}
 function resize(){const rect=canvas.getBoundingClientRect();ratio=Math.min(window.devicePixelRatio||1,1.5);compact=rect.width<700;width=Math.max(1,Math.round(rect.width*ratio));height=Math.max(1,Math.round(rect.height*ratio));canvas.width=width;canvas.height=height;clearHover();draw();}
 new ResizeObserver(resize).observe(canvas);
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule();},{rootMargin:'48px'}).observe(canvas);
 document.addEventListener('visibilitychange',schedule);
 hero.addEventListener('pointermove',event=>{
  if(paused||event.pointerType==='touch')return;
  const rect=canvas.getBoundingClientRect();
  targetX=(event.clientX-rect.left)/rect.width*2-1;targetY=(event.clientY-rect.top)/rect.height*2-1;
  positions().forEach((p,i)=>{
   const d=10-p[2],cx=rect.left+rect.width/2+p[0]*3.4/d*rect.height/2,cy=rect.top+rect.height/2-p[1]*3.4/d*rect.height/2;
   const radius=brands[i].scale*(compact?.8:1)*3.4/d*rect.height/2*2.8;
   const x=(event.clientX-cx)/radius,y=(event.clientY-cy)/radius;
   const distance=Math.hypot(x,y);
   if(distance<1){
    const h=hover[i];
    h.active=true;h.returnAt=0;
    const falloff=(1-distance)*(1-distance);
    hover[i].targetX=-x*falloff*5;
    hover[i].targetY=-y*falloff*5;
   }else releaseHover(hover[i]);
  });
 },{passive:true});
 hero.addEventListener('pointerleave',()=>{targetX=0;targetY=0;hover.forEach(releaseHover);});
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;previous=0;canvas.parentElement.classList.remove('ready');});
 canvas.addEventListener('webglcontextrestored',()=>{try{initialize();lost=false;resize();canvas.parentElement.classList.add('ready');schedule();}catch{canvas.parentElement.classList.remove('ready');}});
 resize();schedule();
 return {setPaused(value){paused=value;if(paused){cancelAnimationFrame(frame);frame=0;previous=0;clearHover();hover.forEach(h=>{h.x=0;h.y=0;h.vx=0;h.vy=0;});draw();}schedule();}};
}

export { rotation, particleVertex, particleFragment };

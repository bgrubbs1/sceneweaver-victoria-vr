import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {CanvasRenderer} from './canvas-renderer.js';
import {THEMES,MECHANICS,compile,rank,initialState,transition} from './planner.js';

const $=id=>document.getElementById(id);let extractor,themeVectors,mechanicVectors,loading,plan,state,root,gate,items=[],decor=[],scene,camera,renderer,controls,lastTick=0,recording=false,buildSerial=0;
const viewport=$('viewport'),raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
const labelMechanic={collect:'COLLECT & UNLOCK',switches:'ACTIVATE & UNLOCK',explore:'EXPLORE & INSPECT'};
const setStatus=text=>$('model-status').textContent=text;
const setMessage=text=>$('message').textContent=text;

function initRenderer(){
 try{
 scene=new THREE.Scene();try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});}catch{renderer=new CanvasRenderer();document.querySelector('.controls-hint').textContent='3D Canvas mode · Drag to orbit · Scroll to zoom · Click to interact';}renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;viewport.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-label','3D world canvas');
 camera=new THREE.PerspectiveCamera(40,1,.1,100);camera.position.set(11,12,14);controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,0);controls.enableDamping=true;controls.minDistance=7;controls.maxDistance=30;controls.maxPolarAngle=Math.PI*.47;
 scene.add(new THREE.HemisphereLight(0xffffff,0x213124,2.0));const sun=new THREE.DirectionalLight(0xfff4cf,3);sun.position.set(5,12,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12});sun.shadow.normalBias=.04;scene.add(sun);
 new ResizeObserver(resize).observe(viewport);resize();let down;
 renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height)*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects([...items,gate].filter(Boolean),true)[0];if(hit){let obj=hit.object;while(obj&&!obj.userData.action)obj=obj.parent;if(obj)act(obj.userData.action,obj.userData.id);}});
 requestAnimationFrame(animate);
 }catch(e){$('render-error').hidden=false;$('render-error').textContent='WebGL is unavailable in this browser. Please use a current Chrome, Edge, Firefox, or Safari with hardware acceleration enabled. '+e.message;}
}
function resize(){if(!renderer)return;renderer.setSize(viewport.clientWidth,viewport.clientHeight);camera.aspect=viewport.clientWidth/viewport.clientHeight;camera.updateProjectionMatrix();}
function material(color,extra={}){return new THREE.MeshStandardMaterial({color,roughness:.7,metalness:.15,...extra});}
function mesh(geo,mat,pos,group=root){const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
function cylinder(rt,rb,h,mat,pos,group=root,n=8){return mesh(new THREE.CylinderGeometry(rt,rb,h,n),mat,pos,group);}
function box(w,h,d,mat,pos,group=root){return mesh(new THREE.BoxGeometry(w,h,d),mat,pos,group);}
function addDecoration(theme,x,z,i){
 const g=new THREE.Group();g.position.set(x,0,z);root.add(g);const a=material(theme.accent),dark=material(theme.ground),stone=material(0xaab7ab),leaf=material(i%2?0x4c9570:0x366e4c);
 switch(theme.decor){
 case'tree': cylinder(.16,.25,2,material(0x765c42),[0,1,0],g);cylinder(0,1.2,2.4,leaf,[0,2.2,0],g,7);cylinder(0,.9,1.8,leaf,[0,3.3,0],g,7);break;
 case'planet':{const p=mesh(new THREE.SphereGeometry(.7+i%3*.25,20,16),i%2?a:material(0x8e8eb7),[0,2.3,0],g);p.userData.float=true;const ring=mesh(new THREE.TorusGeometry(1.3,.045,6,40),a,[0,2.3,0],g);ring.rotation.x=Math.PI/2.7;break;}
 case'coral':for(let j=0;j<4;j++){const branch=cylinder(.08,.15,1+j*.3,j%2?a:material(0x7cbeb4),[(j-1.5)*.3,.7+j*.18,0],g);branch.rotation.z=(j-1.5)*.3;mesh(new THREE.SphereGeometry(.2,10,8),a,[(j-1.5)*.5,1.3+j*.3,0],g);}break;
 case'pyramid':cylinder(0,1.2,2.4,a,[0,1.2,0],g,4);g.rotation.y=Math.PI/4;break;
 case'building':box(1,2+i%3,1,dark,[0,(2+i%3)/2,0],g);for(let y=.5;y<2+i%3;y+=.55)box(1.03,.1,1.03,material(theme.accent,{emissive:theme.accent,emissiveIntensity:.5}),[0,y,0],g);break;
 case'tower':cylinder(.7,.9,2.5,stone,[0,1.25,0],g,10);cylinder(0,1,1,material(0x4c687c),[0,3,0],g,10);break;
 case'machine':box(1.1,1.6,1.1,stone,[0,.8,0],g);box(.75,.55,.08,material(theme.accent,{emissive:theme.accent,emissiveIntensity:.7}),[0,1, .6],g);cylinder(.1,.1,.9,a,[0,2,0],g);break;
 }
 decor.push(g);
}
function createWorld(next,origin){
 if(root){scene?.remove(root);root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){for(const m of(Array.isArray(o.material)?o.material:[o.material]))m.dispose();}});}
 plan=next;state=initialState(plan);items=[];decor=[];gate=null;lastTick=performance.now();const t=THEMES.find(x=>x.id===plan.theme);
 if(scene){root=new THREE.Group();scene.add(root);scene.background=new THREE.Color(t.sky);scene.fog=new THREE.Fog(t.sky,24,60);
 cylinder(7.7,8.1,.65,material(t.ground),[0,-.4,0],root,64).renderOrder=-3;cylinder(7.8,7.8,.06,material(0x77866c),[0,-.02,0],root,64).renderOrder=-2;
 const ground=material(t.ground);cylinder(7.65,7.65,.08,ground,[0,.03,0],root,64).renderOrder=-1;const grid=new THREE.GridHelper(14,14,t.accent,0x456458);grid.material.transparent=true;grid.material.opacity=.17;grid.position.y=.08;root.add(grid);
 // Procedural scenery; no downloaded art assets.
 for(let i=0;i<7;i++){const angle=(i/7)*Math.PI*2;addDecoration(t,Math.cos(angle)*6.3,Math.sin(angle)*6.3,i);}
 for(const entity of plan.entities){const g=new THREE.Group();g.position.set(...entity.position);g.userData={action:'item',id:entity.id,baseY:entity.position[1],index:items.length};root.add(g);const mat=material(entity.color,{emissive:entity.color,emissiveIntensity:.32,roughness:.25,metalness:.4});
 if(entity.type==='switch'){cylinder(.45,.55,.2,material(0x455761),[0,-.6,0],g);cylinder(.28,.28,.18,mat,[0,-.4,0],g);cylinder(.05,.05,.65,mat,[0,-.04,0],g);mesh(new THREE.SphereGeometry(.2,12,8),mat,[0,.3,0],g);}else{mesh(new THREE.OctahedronGeometry(.48),mat,[0,0,0],g);const ring=mesh(new THREE.TorusGeometry(.62,.025,6,32),material(entity.color),[0,-.6,0],g);ring.rotation.x=Math.PI/2;}
 items.push(g);}
 gate=new THREE.Group();gate.position.set(0,0,-1.3);gate.userData={action:'gate'};root.add(gate);const posts=material(t.accent,{roughness:.45});box(.25,3.2,.3,posts,[-1.1,1.6,0],gate);box(.25,3.2,.3,posts,[1.1,1.6,0],gate);box(2.45,.25,.3,posts,[0,3.2,0],gate);const door=box(1.95,2.9,.12,material(t.accent,{transparent:true,opacity:.24,emissive:t.accent,emissiveIntensity:.35}),[0,1.55,0],gate);door.name='door';
 const platform=cylinder(1.4,1.5,.18,material(0x71816c),[0,.09,-1.3]);const orb=mesh(new THREE.IcosahedronGeometry(.27,1),material(t.accent,{emissive:t.accent,emissiveIntensity:1.8}),[0,3.65,-1.3]);orb.name='beacon';
 controls.target.set(0,.5,0);camera.position.set(11,12,14);controls.update();}
 $('origin').textContent=origin;$('world-title').textContent=plan.title;$('mode-label').textContent=labelMechanic[plan.mechanic];$('json').textContent=JSON.stringify(plan,null,2);
 $('rules').replaceChildren(...plan.rules.map((r,i)=>{const row=document.createElement('div');row.className='rule';const n=document.createElement('span');n.className='rule-number';n.textContent=String(i+1).padStart(2,'0');const content=document.createElement('div');const strong=document.createElement('strong');strong.textContent=r.event+' → '+r.action;const small=document.createElement('small');small.textContent='When '+r.condition;content.append(strong,small);row.append(n,content);return row;}));
 $('object-controls').replaceChildren(...plan.entities.map((entity,i)=>{const btn=document.createElement('button');btn.textContent=String(i+1);btn.setAttribute('aria-label',`${plan.mechanic==='switches'?'Activate switch':'Interact with crystal'} ${i+1}`);btn.id='control-'+entity.id;btn.addEventListener('click',()=>act('item',entity.id));return btn;}));
 if(origin.startsWith('LOCAL AI')){$('plan-summary').textContent=`Local MiniLM selected ${t.name.toLowerCase()}. The compiler chose ${plan.mechanic}. Created ${plan.count} interactive object${plan.count===1?'':'s'}${plan.timer?`, a ${plan.timer}-second timer`:''}, and ${plan.rules.length} safe rule${plan.rules.length===1?'':'s'}.`;$('rankings').replaceChildren(...plan.themeRanking.map(r=>{const row=document.createElement('div');row.className='rank';const name=document.createElement('span');name.textContent=r.id;const bg=document.createElement('div');bg.className='bar';const bar=document.createElement('i');bar.style.width=Math.max(0,Math.min(100,r.score*100))+'%';bg.append(bar);const num=document.createElement('b');num.textContent=r.score.toFixed(2);row.append(name,bg,num);return row;}));}
 else {$('plan-summary').textContent='A hand-authored example world. Build a description to run the local model.';$('rankings').replaceChildren();}
 renderState();setMessage(instruction());
}
function instruction(){return plan.mechanic==='explore'?'Click objects to inspect this peaceful diorama.':plan.mechanic==='switches'?`Activate all ${plan.count} switches, then click the gate.`:`Collect all ${plan.count} crystals, then click the gate.`;}
function act(type,id){
 if(plan.mechanic==='explore'){if(type==='item'){const item=items.find(x=>x.userData.id===id);if(item)item.userData.pulse=performance.now();setMessage(`${id}: a procedural object in ${plan.title.toLowerCase()}.`);}else{setMessage('An open portal in a peaceful diorama. There is no win condition in explore mode.');}return;}
 const before=state;state=transition(plan,state,{type,id});renderState();
 if(state.won)setMessage('World complete! Your rules worked. Try a new prompt.');else if(state.expired)setMessage('Time is up. Restart to try your world again.');else if(type==='gate'&&!state.gateOpen)setMessage(`Gate locked. ${plan.count-state.activeIds.length} more ${plan.mechanic==='switches'?'switches':'crystals'} needed.`);else if(state.gateOpen)setMessage('Gate unlocked! Click the glowing doorway to finish.');else if(state!==before)setMessage(`${state.activeIds.length} of ${plan.count} ${plan.mechanic==='switches'?'switches activated':'crystals collected'}.`);
}
function renderState(){
 $('score').textContent=plan.mechanic==='explore'?`${plan.count} objects`:`${state.activeIds.length} / ${plan.count}`;$('timer').hidden=state.remaining===null;$('timer').textContent=state.remaining===null?'':`${state.remaining}s`;
 for(const item of items){const active=state.activeIds.includes(item.userData.id);item.visible=!(active&&plan.mechanic==='collect');if(plan.mechanic==='switches')item.scale.setScalar(active?.7:1);const btn=$('control-'+item.userData.id);if(btn){btn.classList.toggle('done',active);btn.setAttribute('aria-pressed',String(active));}}
 if(gate){const d=gate.getObjectByName('door');d.visible=!state.gateOpen;gate.scale.setScalar(state.won?1.15:1);}$('gate-button').textContent=plan.mechanic==='explore'?'Inspect portal':state.won?'Level complete ✓':state.gateOpen?'Enter open gate →':'Try locked gate';
}
function animate(time){requestAnimationFrame(animate);if(!renderer||!plan)return;for(const item of items){if(plan.mechanic!=='switches'){item.rotation.y=time*.001+item.userData.index;item.position.y=item.userData.baseY+Math.sin(time*.002+item.userData.index)*.12;}if(item.userData.pulse){const p=(time-item.userData.pulse)/800;item.scale.setScalar(p<1?1+Math.sin(p*Math.PI)*.4:1);}}
 if(state.remaining!==null&&!state.won&&!state.expired&&time-lastTick>=1000){state=transition(plan,state,{type:'tick'});lastTick=time;renderState();if(state.expired)setMessage('Time is up. Restart to try your world again.');}controls.update();renderer.render(scene,camera);}

async function getModel(){
 if(extractor)return extractor;if(loading)return loading;
 loading=(async()=>{setStatus('Loading browser inference engine…');$('progress').hidden=false;
 const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');env.allowLocalModels=false;env.backends.onnx.wasm.numThreads=1;
 const model=await pipeline('feature-extraction','Xenova/all-MiniLM-L6-v2',{revision:'751bff37182d3f1213fa05d7196b954e230abad9',quantized:true,progress_callback:p=>{if(p.status==='progress'&&p.file?.includes('onnx')){$('progress').value=p.progress||0;setStatus(`Downloading local AI model: ${Math.round(p.progress||0)}%`);}else if(p.status==='initiate')setStatus('Preparing '+p.file+'…');}});
 setStatus('Model loaded. Embedding scene themes and game mechanics…');const categories=[...THEMES,...MECHANICS];const vectors=await model(categories.map(x=>x.text),{pooling:'mean',normalize:true});const all=vectors.tolist();themeVectors=all.slice(0,THEMES.length);mechanicVectors=all.slice(THEMES.length);extractor=model;$('progress').hidden=true;return extractor;
 })();try{return await loading;}catch(error){loading=null;throw error;}
}
async function build(){
 const prompt=$('prompt').value.trim();if(!prompt){setStatus('Describe a world first.');return;}const serial=++buildSerial;$('build').disabled=true;try{const model=await getModel();if(serial!==buildSerial)return;setStatus('Understanding your world locally…');const started=performance.now();const output=await model(prompt,{pooling:'mean',normalize:true});if(serial!==buildSerial)return;const vector=output.tolist()[0];const next=compile(prompt,rank(vector,THEMES,themeVectors),rank(vector,MECHANICS,mechanicVectors));createWorld(next,'LOCAL AI · LIVE MODEL INFERENCE');setStatus(`Built with local MiniLM inference in ${((performance.now()-started)/1000).toFixed(2)}s. No prompt left this browser.`);}
 catch(error){if(serial===buildSerial){console.error(error);setStatus('AI build failed: '+error.message+'. The existing world is unchanged. Check your connection and try again.');$('progress').hidden=true;}}finally{if(serial===buildSerial)$('build').disabled=false;}
}
$('build').addEventListener('click',build);$('prompt').addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')build();});document.querySelectorAll('[data-prompt]').forEach(button=>button.addEventListener('click',()=>{$('prompt').value=button.dataset.prompt;build();}));
$('reset').addEventListener('click',()=>{state=transition(plan,state,{type:'reset'});lastTick=performance.now();renderState();setMessage(instruction());});$('gate-button').addEventListener('click',()=>act('gate'));
$('toggle-json').addEventListener('click',()=>{$('json').hidden=!$('json').hidden;$('toggle-json').setAttribute('aria-expanded',String(!$('json').hidden));});$('export').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(plan,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='sceneweaver-world.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});

// A real canvas recording, using the same game action handlers as clicks.
// The exported walkthrough is explicitly labelled as an automated demonstration.
$('record').addEventListener('click',async()=>{
 if(recording||!renderer)return;if(!$('origin').textContent.startsWith('LOCAL AI')){setStatus('Build a world with the local AI model before recording.');return;}if(!globalThis.MediaRecorder){setStatus('Video capture is unavailable in this browser.');return;}recording=true;$('record').disabled=true;$('record').textContent='Recording 40s…';
 state=initialState(plan);lastTick=performance.now();renderState();const out=document.createElement('canvas');out.width=1280;out.height=720;const ctx=out.getContext('2d');const stream=out.captureStream(30);const mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm';const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:4500000});const chunks=[];rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};rec.onstop=()=>{const url=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));$('record-download').href=url;$('record-download').hidden=false;$('record').disabled=false;$('record').textContent='Record walkthrough';recording=false;stream.getTracks().forEach(t=>t.stop());};
 const start=performance.now();let lastIndex=-1,finished=false;rec.start();function frame(now){const elapsed=(now-start)/1000;ctx.fillStyle='#101915';ctx.fillRect(0,0,1280,720);ctx.drawImage(renderer.domElement,0,0,1280,620);ctx.fillStyle='#101915e8';ctx.fillRect(0,0,1280,83);ctx.fillStyle='#c4eb9f';ctx.font='bold 28px sans-serif';ctx.fillText('SceneWeaver | '+plan.title,32,36);ctx.fillStyle='#d3dfcf';ctx.font='16px sans-serif';ctx.fillText('Browser-local MiniLM → procedural 3D → safe, working game logic',32,63);ctx.fillStyle='#e8f0e4';ctx.font='18px sans-serif';ctx.fillText(plan.prompt.slice(0,125),32,650);ctx.fillStyle='#c4eb9f';ctx.font='16px sans-serif';ctx.fillText($('message').textContent.slice(0,130),32,680);ctx.fillStyle='#90a293';ctx.font='12px sans-serif';ctx.fillText('Automated walkthrough of the actual generated scene and game state. No pre-rendered 3D footage.',32,704);
 const index=Math.floor((elapsed-10)/Math.max(1,17/plan.count));if(index>=0&&index<plan.count&&index>lastIndex){act('item',`item-${index+1}`);lastIndex=index;}if(elapsed>30&&!finished){act('gate');finished=true;}if(elapsed<40)requestAnimationFrame(frame);else rec.stop();}requestAnimationFrame(frame);
});
initRenderer();createWorld(compile($('prompt').value,[{id:'forest',score:1}],[{id:'collect',score:1}]),'EXAMPLE TEMPLATE · NOT AI-GENERATED YET');

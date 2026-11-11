import * as THREE from 'three';
// Dependency-free Canvas2D fallback for browsers without a GPU/WebGL context.
// This renders the same real Three.js scene graph through perspective projection.
// Painter's algorithm is deliberately limited to the small prototype scenes.
export class CanvasRenderer {
 constructor(){this.domElement=document.createElement('canvas');this.ctx=this.domElement.getContext('2d');this.shadowMap={};this.ratio=1;this.light=new THREE.Vector3(1,2,1).normalize();}
 setPixelRatio(value){this.ratio=Math.min(value,1.5);}
 setSize(w,h){this.w=w;this.h=h;this.domElement.width=w*this.ratio;this.domElement.height=h*this.ratio;this.domElement.style.width=w+'px';this.domElement.style.height=h+'px';}
 render(scene,camera){
 const ctx=this.ctx;ctx.setTransform(this.ratio,0,0,this.ratio,0,0);ctx.fillStyle='#'+scene.background.getHexString();ctx.fillRect(0,0,this.w,this.h);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
 const faces=[],a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),normal=new THREE.Vector3(),ab=new THREE.Vector3(),ac=new THREE.Vector3();
 scene.traverseVisible(obj=>{if(!obj.isMesh||!obj.geometry)return;const pos=obj.geometry.attributes.position,index=obj.geometry.index,mat=Array.isArray(obj.material)?obj.material[0]:obj.material;if(!mat||!pos)return;const count=index?index.count:pos.count;
 for(let i=0;i<count;i+=3){const ia=index?index.getX(i):i,ib=index?index.getX(i+1):i+1,ic=index?index.getX(i+2):i+2;a.fromBufferAttribute(pos,ia).applyMatrix4(obj.matrixWorld);b.fromBufferAttribute(pos,ib).applyMatrix4(obj.matrixWorld);c.fromBufferAttribute(pos,ic).applyMatrix4(obj.matrixWorld);
 normal.crossVectors(ab.subVectors(b,a),ac.subVectors(c,a)).normalize();if(normal.dot(ab.subVectors(camera.position,a))<=0&&mat.side!==THREE.DoubleSide)continue;const shade=.5+Math.max(0,normal.dot(this.light))*.5;const dist=(a.distanceToSquared(camera.position)+b.distanceToSquared(camera.position)+c.distanceToSquared(camera.position))/3;const color=mat.color.clone().multiplyScalar(shade);if(mat.emissive)color.add(mat.emissive.clone().multiplyScalar((mat.emissiveIntensity||0)*.13));a.project(camera);b.project(camera);c.project(camera);if(a.z>1||b.z>1||c.z>1||a.z< -1||b.z< -1||c.z< -1)continue;
 faces.push({points:[(a.x*.5+.5)*this.w,(-a.y*.5+.5)*this.h,(b.x*.5+.5)*this.w,(-b.y*.5+.5)*this.h,(c.x*.5+.5)*this.w,(-c.y*.5+.5)*this.h],dist,order:obj.renderOrder,color:'#'+color.getHexString(),alpha:mat.transparent?mat.opacity:1});}
 });
 faces.sort((a,b)=>(a.order-b.order)||(b.dist-a.dist));for(const f of faces){ctx.globalAlpha=f.alpha;ctx.fillStyle=f.color;ctx.strokeStyle=f.color;ctx.lineWidth=.35;ctx.beginPath();ctx.moveTo(f.points[0],f.points[1]);ctx.lineTo(f.points[2],f.points[3]);ctx.lineTo(f.points[4],f.points[5]);ctx.closePath();ctx.fill();if(f.alpha===1)ctx.stroke();}ctx.globalAlpha=1;
 }
}

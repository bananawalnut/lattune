import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createInstance, ComponentInterface } from '../packages/runtime/dist/core/index.js';
import { Surface, Path, Layer, Program } from '../packages/runtime/dist/geometry/index.js';
import { createImageSurface, fromPixels } from '../packages/runtime/dist/image/index.js';
const fixture=JSON.parse(await readFile(new URL('./fixtures/image-parity.json',import.meta.url),'utf8'));
const pixels=()=>({...fixture.pixels,data:new Uint8Array(fixture.pixels.data)});
const photo=(rgb=[0,255,255],alpha=255)=>({width:1,height:1,data:new Uint8Array([...rgb,alpha])});
const make=(extra={})=>createImageSurface({pixels:pixels(),sampling:fixture.sampling,preset:'relief',...extra});

test('all eight extracted presets match captured prototype geometry, UV, ids and colors',()=>{
 for(const spec of fixture.fixtures){const component=make({...fixture.options,preset:spec.preset});for(const saved of spec.frames){const actual=component.sample(saved.phase);assert.deepEqual([...actual.buffers.get('image')],saved.points);assert.deepEqual([...actual.colors.get('image')],saved.colors);}component.dispose();}
 const grid=fromPixels(pixels(),fixture.sampling);assert.deepEqual(grid.cells.map(c=>c.id),[0,1,2]);assert.equal(grid.count,3);assert.equal(grid.width3D/grid.height3D,1);
});

test('math callbacks, derivatives and rejected frames preserve last valid geometry',()=>{
 const p=new Surface((u,v)=>[u,v,0]);assert.deepEqual(p.normal(.5,.5),[0,0,1]);
 let bad=false;const program=new Program({root:new Layer('curve',new Path(t=>[t,0,bad?NaN:0]),{count:4})});const borrowed=program.sample(0).buffers.get('curve'),saved=borrowed.slice();bad=true;assert.throws(()=>program.sample(.5));assert.deepEqual(borrowed,saved);
 // Read the previously returned borrowed frame rather than attempting another invalid sample.
 const good=make();assert.equal(good.sample(0).buffers.get('image').length,18);good.dispose();
 const curved=make({surface:(u,v,c)=>[u,v,Math.sin(c.phase*Math.PI*2)],animate:true});const start=curved.sample(0).buffers.get('image').slice();assert.notDeepEqual(curved.sample(.25).buffers.get('image'),start);assert.deepEqual(curved.sample(0).buffers.get('image'),start);curved.dispose();assert.equal(saved.length,24);
});

test('typed method dispatch validates state/results and preserves revision on rejection',()=>{
 const integer={type:'integer',minimum:0,maximum:100};
 const instance=createInstance({id:'counter',initial:0,interface:{state:integer,methods:{add:{input:integer,output:integer,handle:(s,n)=>({state:s+n,result:s+n})}}}});
 assert(instance.describe().interface.methods.add);assert.equal(instance.describe().interface.methods.add.handle,undefined);
 const request={expectedRevision:0,requestId:'one'};assert.equal(instance.invoke('add',2,request).status,'committed');assert.equal(instance.read(),2);assert.deepEqual(instance.invoke('add',2,request).result,2);assert.equal(instance.revision,1);
 assert.throws(()=>instance.invoke('add',3,request),e=>e.code==='request_conflict');assert.throws(()=>instance.invoke('add',3,{expectedRevision:0}),e=>e.code==='revision_conflict');assert.throws(()=>instance.invoke('add',100));assert.equal(instance.read(),2);assert.equal(instance.revision,1);
 assert.throws(()=>new ComponentInterface({state:integer,methods:{bad:{input:integer,output:integer,handle:()=>Promise.resolve({state:1,result:1})}}}).run(0,'bad',1));
 instance.dispose();instance.dispose();assert.throws(()=>instance.read(),e=>e.code==='disposed');
});

test('photo target commits before deterministic color presentation finishes',()=>{
 const s=make({transition:{duration:2,mode:'sweep'}});const frame=s.sample(0);const xyz=frame.buffers.get('image').slice(),rgb=frame.colors.get('image').slice();
 const receipt=s.invoke('receivePhoto',s.stagePhoto(photo()),{expectedRevision:0,requestId:'receive'});assert.equal(receipt.status,'committed');assert.equal(receipt.result.hasPhoto,true);assert.equal(s.transition.progress,0);assert.deepEqual(s.sample(0).colors.get('image'),rgb);
 s.advance(1);assert.equal(s.transition.progress,.5);const midway=s.sample(0).colors.get('image').slice();assert.notDeepEqual(midway,rgb);s.seek(.2);s.seek(.5);assert.deepEqual(s.sample(0).colors.get('image'),midway);assert.deepEqual(s.sample(0).buffers.get('image'),xyz);
 s.finishTransition();assert.equal(s.transition.active,false);assert.deepEqual([...s.sample(0).colors.get('image')],[0,1,1,0,1,1,0,1,1]);assert.equal(s.revision,1);s.dispose();
});

test('interruption starts at displayed colors; reset restores base, with no geometry changes',()=>{
 const s=make({transition:{duration:2,mode:'fade'}}),original=s.sample(0).colors.get('image').slice();s.invoke('receivePhoto',s.stagePhoto(photo()));s.seek(.5);const displayed=s.sample(0).colors.get('image').slice();s.invoke('receivePhoto',s.stagePhoto(photo([255,0,255])));assert.deepEqual(s.sample(0).colors.get('image'),displayed);s.advance(2);assert.deepEqual([...s.sample(0).colors.get('image')],[1,0,1,1,0,1,1,0,1]);s.invoke('resetPhoto',{});assert.deepEqual(s.sample(0).colors.get('image'),original);s.dispose();
});

test('receiver-local staged pixels are copied, bounded, releasable and expiring',()=>{
 let now=0;const a=make({now:()=>now,resourceTTL:10}),b=make();const mutable=photo([255,0,255]),offer=a.stagePhoto(mutable);mutable.data.fill(0);assert.throws(()=>b.invoke('receivePhoto',offer),e=>e.code==='invalid_resource');a.invoke('receivePhoto',offer);assert.deepEqual([...a.sample(0).colors.get('image')],[1,0,1,1,0,1,1,0,1]);
 const expired=a.stagePhoto(photo());now=11;assert.throws(()=>a.invoke('receivePhoto',expired),e=>e.code==='invalid_resource');assert.equal(a.revision,1);
 const released=a.stagePhoto(photo());a.releasePhoto(released);assert.throws(()=>a.invoke('receivePhoto',released));const oldest=a.stagePhoto(photo());for(let i=0;i<4;i++)a.stagePhoto(photo());assert.throws(()=>a.invoke('receivePhoto',oldest));assert.equal(a.revision,1);a.dispose();b.dispose();assert.throws(()=>a.sample());assert.throws(()=>a.stagePhoto(photo()));
});

test('alpha composition and invalid custom math cannot corrupt a committed frame',()=>{
 const s=make();s.invoke('receivePhoto',s.stagePhoto(photo()));const before=s.sample(0).colors.get('image').slice();s.invoke('receivePhoto',s.stagePhoto(photo([255,0,0],0)));assert.deepEqual(s.sample(0).colors.get('image'),before);s.dispose();
 const bad=make({transition:{duration:2,sample:c=>c.progress===.123?NaN:c.progress}});bad.invoke('receivePhoto',bad.stagePhoto(photo()));bad.seek(.4);const saved=bad.sample(0).colors.get('image').slice();assert.throws(()=>bad.seek(.123));assert.equal(bad.transition.progress,.4);assert.deepEqual(bad.sample(0).colors.get('image'),saved);bad.dispose();
});

test('every public entry imports server-side with DOM access forbidden',()=>{
 const entries=['index','core/index','geometry/index','image/index','renderers/webgl2','renderers/canvas'];
 const script=`for(const key of ['window','document','HTMLElement','customElements'])Object.defineProperty(globalThis,key,{get(){throw Error('DOM at import: '+key)}});for(const entry of ${JSON.stringify(entries)})await import(${JSON.stringify(new URL('../packages/runtime/dist/',import.meta.url).href)}+entry+'.js');`;
 execFileSync(process.execPath,['--input-type=module','-e',script]);
});

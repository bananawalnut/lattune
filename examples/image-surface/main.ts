import { createImageSurface, type ImageSurface, type PixelData, type Preset, type TransitionOptions } from '@lattune/runtime/image';
import { createRenderer, type Renderer } from '@lattune/runtime/renderers/webgl2';
const get=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const canvas=get<HTMLCanvasElement>('surface'),status=get('status');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const query=new URLSearchParams(location.search);
let component:ImageSurface,renderer:Renderer,frameId=0,last=0,phase=0,paused=false,received:PixelData|null=null,loadId=0,dead=false;
function synthetic(warm=false):PixelData {
 const width=120,height=80,data=new Uint8ClampedArray(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const u=x/width,v=y/height,orb=Math.max(0,1-Math.hypot(u-.58,(v-.5)*.85)*1.7),stripe=.5+.5*Math.sin(u*8-v*5);
  const rgb=warm?[65+190*orb,40+140*stripe*orb,45+80*(1-v)*orb]:[35+95*orb,50+100*stripe*orb,80+150*orb];
  data.set([...rgb,255],(y*width+x)*4);
 }return {width,height,data};
}
const base=synthetic();
function draw(){if(dead||!renderer||!component)return;const frame=component.sample(phase);frame.descriptor.camera.yaw=Number(get<HTMLInputElement>('yaw').value)*Math.PI/180;frame.descriptor.camera.pitch=.1;renderer.setPointBuffers(frame.descriptor,frame.buffers,frame.colors);renderer.render(frame.descriptor,phase);get('renderer').textContent=renderer.kind.toUpperCase()+' / PACKAGE IMPORT';get('cells').textContent=component.cellCount.toLocaleString()+' COLORED CELLS';get<HTMLProgressElement>('progress').value=component.transition.progress;get('progress-text').textContent=component.transition.active?Math.round(component.transition.progress*100)+'%':'Settled';}
function tick(now:number){frameId=0;if(document.hidden||dead)return;const elapsed=last?Math.max(0,Math.min(.05,(now-last)/1000)):0;last=now;try{if(!paused&&!reduced.matches){phase=(phase+elapsed/12)%1;if(component.transition.active)component.advance(elapsed);}else if(reduced.matches&&component.transition.active)component.finishTransition();draw();if(!paused&&!reduced.matches)frameId=requestAnimationFrame(tick);}catch(error){status.textContent=error instanceof Error?error.message:String(error);}}
function start(){if(!frameId&&!document.hidden&&!dead){last=0;frameId=requestAnimationFrame(tick);}}
function resetSurface(){component?.dispose();component=createImageSurface({id:'demo/image-surface',pixels:base,sampling:{columns:84,rows:56},preset:get<HTMLSelectElement>('preset').value as Preset,depth:.85,animate:true,size:7,characters:'●',transition:{duration:2.4,mode:get<HTMLSelectElement>('transition').value as TransitionOptions['mode']}});if(received){component.invoke('receivePhoto',component.stagePhoto(received));component.finishTransition();}draw();start();}
function receive(pixels:PixelData){received=pixels;const offer=component.stagePhoto(pixels);const receipt=component.invoke('receivePhoto',offer,{expectedRevision:component.revision,requestId:crypto.randomUUID()});if(reduced.matches)component.finishTransition();get('receipt').textContent=JSON.stringify(receipt,null,2);status.textContent='Target colors committed. Presentation can finish independently.';draw();start();}
renderer=createRenderer(canvas,{transparent:true,renderer:query.get('renderer')==='canvas'?'canvas':'webgl2'});
const observer=new ResizeObserver(()=>{const bounds=canvas.getBoundingClientRect(),scale=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(bounds.width*scale);canvas.height=Math.round(bounds.height*scale);draw();});observer.observe(canvas);
get('preset').addEventListener('change',resetSurface);get('transition').addEventListener('change',resetSurface);
get('yaw').addEventListener('input',()=>{get('yaw-value').textContent=get<HTMLInputElement>('yaw').value+'°';draw();});
get('pause').addEventListener('click',()=>{paused=!paused;get('pause').textContent=paused?'Resume motion':'Pause motion';get('pause').setAttribute('aria-pressed',String(paused));cancelAnimationFrame(frameId);frameId=0;draw();start();});
get('finish').addEventListener('click',()=>{component.finishTransition();draw();status.textContent='Color presentation settled. Committed state is unchanged.';});
get('synthetic').addEventListener('click',()=>receive(synthetic(true)));
get('photo').addEventListener('change',async()=>{const id=++loadId,file=get<HTMLInputElement>('photo').files?.[0];if(!file)return;let bitmap:ImageBitmap|undefined;try{if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>32*1024*1024)throw Error('Choose PNG, JPEG or WebP under 32 MB.');bitmap=await createImageBitmap(file);if(bitmap.width*bitmap.height>16_777_216)throw Error('Choose an image under 16 megapixels.');if(dead||id!==loadId)return;const sample=document.createElement('canvas');sample.width=bitmap.width;sample.height=bitmap.height;const context=sample.getContext('2d',{willReadFrequently:true});if(!context)throw Error('Image decoding canvas unavailable.');context.drawImage(bitmap,0,0);receive(context.getImageData(0,0,sample.width,sample.height));}catch(error){status.textContent=error instanceof Error?error.message:String(error);}finally{bitmap?.close();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameId);frameId=0;last=0;}else start();});
reduced.addEventListener('change',()=>{if(reduced.matches)component.finishTransition();draw();start();});
window.addEventListener('pagehide',()=>{dead=true;++loadId;cancelAnimationFrame(frameId);observer.disconnect();component.dispose();renderer.dispose();received=null;},{once:true});
get('motion-policy').textContent=reduced.matches?'REDUCED MOTION':'EXPLICIT FRAME CLOCK';resetSurface();

const plainURL=new URL(location.href);plainURL.port=String(Number(location.port)+1);plainURL.pathname='/';plainURL.search='';get<HTMLAnchorElement>('plain-link').href=plainURL.href;

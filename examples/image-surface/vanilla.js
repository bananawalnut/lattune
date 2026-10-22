import { createImageSurface } from './node_modules/@lattune/runtime/dist/image/index.js';
import { createRenderer } from './node_modules/@lattune/runtime/dist/renderers/webgl2.js';
const canvas=document.querySelector('canvas');canvas.width=1000;canvas.height=600;
const data=new Uint8ClampedArray(4*20*20);for(let i=0;i<400;i++)data.set([70+i%20*8,70+Math.floor(i/20)*8,200,255],i*4);
const surface=createImageSurface({pixels:{width:20,height:20,data},sampling:{columns:40,rows:40},preset:'bend',transition:{duration:1.5,mode:'spiral'}}),renderer=createRenderer(canvas);
function draw(){const f=surface.sample(0);renderer.setPointBuffers(f.descriptor,f.buffers,f.colors);renderer.render(f.descriptor,0);}draw();let raf=0,last=0;
document.querySelector('button').onclick=()=>{const r=surface.invoke('receivePhoto',surface.stagePhoto({width:1,height:1,data:new Uint8Array([255,180,80,255])}));document.querySelector('pre').textContent=JSON.stringify(r,null,2);if(matchMedia('(prefers-reduced-motion: reduce)').matches){surface.finishTransition();draw();return;}cancelAnimationFrame(raf);last=performance.now();function frame(now){surface.advance(Math.max(0,Math.min(.05,(now-last)/1000)));last=now;draw();if(surface.transition.active)raf=requestAnimationFrame(frame);}raf=requestAnimationFrame(frame);};
addEventListener('pagehide',()=>{cancelAnimationFrame(raf);surface.dispose();renderer.dispose();},{once:true});

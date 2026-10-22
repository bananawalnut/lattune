const $ = (s) => document.querySelector(s);
const recipes = [
  {id:'image-shell',name:'Image shell',icon:'◉',label:'MOL',desc:'A curved field of cells. Each one carries a little of your image.'},
  {id:'shell-signal',name:'Shell + signal',icon:'◎',label:'MOL',desc:'A quiet shell of points with an independent signal ribbon.'},
  {id:'ribbon',name:'Ribbon field',icon:'⌁',label:'ATM',desc:'A parametric ribbon. Twist the surface, keep the cells.'},
  {id:'word-field',name:'Word field',icon:'⁙',label:'MOL',desc:'Structured content arranged on a responsive geometric field.'},
  {id:'category-cluster',name:'Category cluster',icon:'⠿',label:'MOL',desc:'Related pieces find a place through a component-owned organizer.'},
];
let selected=recipes[0], palette='violet', paused=false, angle=0, lastTime=0, raf=0, receiptAt=-Infinity;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const canvas=$('#preview'), ctx=canvas.getContext('2d');
const sourceFor=(r)=>`// Proposed API · not compiled
import { defineComponent }
  from '@lattune/runtime/core';
import { surface }
  from '@lattune/runtime/geometry';

export const ${r.id.replace(/-([a-z])/g,(_,s)=>s.toUpperCase())} =
  defineComponent({
    id: 'studio/${r.id}',
    props: { curvature: 0.55 },
    geometry: surface(({u,v}) => [
      (u - .5) * 2,
      (v - .5) * 2,
      sin(u * PI) * curvature
    ]),
    methods: {
      receivePhoto: photoReceipt({
        commit: 'before-presentation',
        interrupt: 'replace-from-displayed'
      })
    }
  });`;
function select(r){selected=r;$('#component-title').replaceChildren(document.createTextNode(r.name+' '),Object.assign(document.createElement('span'),{textContent:'↗'}));$('#component-description').textContent=r.desc;$('#source').textContent=sourceFor(r);$('#shape-name').textContent=r.name.toUpperCase();$('#source-file').textContent=$('#file-name').textContent=r.id+'.ts';$('#import-file-name').textContent=r.id+'.ts';$('#preview').setAttribute('aria-label',r.name+' geometric concept preview');document.querySelectorAll('.recipe').forEach(b=>{const active=b.dataset.id===r.id;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});draw(performance.now());}
for(const r of recipes){const b=document.createElement('button');b.className='recipe';b.dataset.id=r.id;b.innerHTML=`<span class="recipe-icon">${r.icon}</span><span>${r.name}</span><small>${r.label}</small>`;b.addEventListener('click',()=>select(r));$('#recipe-list').append(b);}
function tab(which,focus=false){for(const name of ['properties','methods']){const active=name===which;$('#'+name).hidden=!active;$('#tab-'+name).setAttribute('aria-selected',String(active));$('#tab-'+name).tabIndex=active?0:-1;}if(focus)$('#tab-'+which).focus();}
for(const name of ['properties','methods']){$('#tab-'+name).addEventListener('click',()=>tab(name));$('#tab-'+name).addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();tab(e.key==='Home'?'properties':e.key==='End'?'methods':name==='properties'?'methods':'properties',true);}});}
$('#inspect-contract').onclick=()=>tab('methods',true);
for(const id of ['curvature','motion'])$('#'+id).addEventListener('input',e=>{$('#'+id+'-value').textContent=Number(e.target.value).toFixed(2);draw(performance.now());});
document.querySelectorAll('.swatch').forEach(b=>b.onclick=()=>{palette=b.dataset.palette;document.querySelectorAll('.swatch').forEach(s=>s.setAttribute('aria-pressed',String(s===b)));draw(performance.now());});
function stop(){cancelAnimationFrame(raf);raf=0;lastTime=0;}
function start(){if(!raf&&!paused&&!reduced.matches&&!document.hidden)raf=requestAnimationFrame(frame);}
function frame(now){raf=0;if(document.hidden||paused||reduced.matches)return;const dt=lastTime?Math.min(40,now-lastTime):0;lastTime=now;angle+=dt*.00012*Number($('#motion').value);draw(now);start();}
$('#pause').onclick=()=>{paused=!paused;$('#pause').textContent=paused?'Play':'Pause';$('#pause').setAttribute('aria-pressed',String(paused));paused?stop():start();};
$('#reset').onclick=()=>{$('#curvature').value=.55;$('#motion').value=.35;$('#curvature-value').textContent='0.55';$('#motion-value').textContent='0.35';angle=0;draw(performance.now());};
$('#receive').onclick=()=>{receiptAt=performance.now()-(reduced.matches||paused?1200:0);$('#designer-status').textContent='Concept only: synthetic target colors accepted; a UV wave illustrates presentation settlement.';draw(receiptAt);};
$('#designer-form').onsubmit=e=>{e.preventDefault();const prompt=$('#prompt').value.trim();$('#proposal-summary').textContent=prompt?`Your request: “${prompt}”. Below is a scripted example proposal, not a model-generated response.`:'A scripted example adds a small ripple and a UV color transition.';$('#proposal-diff').textContent=`+ geometry.z += sin(u * 12 + time) * 0.08
+ transition = uvWave({ durationMs: 900 })

  commit: before-presentation
  interrupt: replace-from-displayed`;$('#review-dialog').showModal();};
$('#apply-concept').onclick=()=>{$('#curvature').value=.85;$('#curvature-value').textContent='0.85';receiptAt=performance.now()-(reduced.matches||paused?1200:0);$('#designer-status').textContent='Scripted proposal applied to the visual concept. Source is illustrative; compile, tests and save have not run.';$('#review-dialog').close();draw(receiptAt);};
$('#dictation-info').onclick=()=>{$('#designer-status').textContent='Dictation plan: voice becomes editable prompt text before submission. Microphone and transcription are not connected in this concept.';};
$('#open-import').onclick=()=>$('#import-dialog').showModal();
document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>{$('#designer-status').textContent=b.dataset.section==='library'?'Library selected. Choose a component recipe in the sidebar.':b.dataset.section==='project'?'Project concept: ordinary source files and provenance belong to the project. See the source tree on the left.':'Flow routing is planned as optional beta. The supported v1 centers on import, typed receipt and source authoring.';});
function size(){const dpr=Math.min(devicePixelRatio||1,2),r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw(performance.now());}
function draw(now){const {width:w,height:h}=canvas.getBoundingClientRect();ctx.clearRect(0,0,w,h);const curve=Number($('#curvature').value), rot=angle+.48, scale=Math.min(w*.29,h*.36);let cells=[];
for(let j=0;j<34;j++)for(let i=0;i<42;i++){let u=i/41,v=j/33,x,y,z;if(selected.id==='shell-signal'||selected.id==='word-field'){const ph=v*Math.PI,th=u*Math.PI*2;x=Math.sin(ph)*Math.cos(th);y=Math.cos(ph);z=Math.sin(ph)*Math.sin(th);if(selected.id==='word-field'&&(i+j)%3===0)continue;}else if(selected.id==='ribbon'){const th=u*Math.PI*3;x=(u-.5)*2.5;y=(v-.5)*.85*Math.cos(th);z=(v-.5)*.85*Math.sin(th)+Math.sin(th)*curve*.4;}else if(selected.id==='category-cluster'){const k=i%3,th=u*Math.PI*4;x=Math.cos(th)*.4+(k-1)*.7;y=(v-.5)*1.4;z=Math.sin(th)*.45;}else{x=(u-.5)*2.35;y=(v-.5)*1.65;z=Math.sin(u*Math.PI)*curve*.95+Math.cos(v*Math.PI*2)*curve*.19;}
const xx=x*Math.cos(rot)+z*Math.sin(rot),zz=-x*Math.sin(rot)+z*Math.cos(rot),yy=y*Math.cos(-.2)-zz*Math.sin(-.2),depth=y*Math.sin(-.2)+zz*Math.cos(-.2);const p=2.8/(2.8+depth*.35);cells.push({x:w*.5+xx*scale*p,y:h*.51+yy*scale*p,z:depth,u,v,i,j,p});}
cells.sort((a,b)=>b.z-a.z);const wave=Number.isFinite(receiptAt)?Math.min(1,(now-receiptAt)/1200):0;for(const c of cells){const glow=Math.max(.2,Math.min(1,(1-c.z*.28))), field=.5+.5*Math.sin(c.u*5+c.v*4);let hue=palette==='lime'?85+field*15:palette==='ice'?180+field*34:255+field*50;let light=37+field*26;if(wave>c.u&&wave<1) {hue=310-c.v*70;light+=13;}if(wave===1&&receiptAt>0)hue=310-c.v*70;ctx.fillStyle=`hsla(${hue},${palette==='lime'?55:48}%,${light}%,${glow*.9})`;const s=Math.max(1.1,2.1*c.p);ctx.fillRect(c.x-s/2,c.y-s/2,s,s);if((c.i+c.j)%13===0){ctx.fillStyle=`hsla(${hue},60%,82%,${glow*.7})`;ctx.fillRect(c.x-2.5,c.y,5,0.7);ctx.fillRect(c.x,c.y-2.5,.7,5);}}
if(selected.id==='shell-signal'){ctx.strokeStyle='#c5e7be';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<=160;i++){const t=i/160*Math.PI*2,xx=Math.cos(t)*scale,yy=Math.sin(t)*scale*.16+Math.cos(t+angle)*10;i?ctx.lineTo(w*.5+xx,h*.53+yy):ctx.moveTo(w*.5+xx,h*.53+yy);}ctx.stroke();}$('#cell-info').textContent=cells.length.toLocaleString()+' cells';}
const observer=new ResizeObserver(size);observer.observe(canvas);document.addEventListener('visibilitychange',()=>document.hidden?stop():start());reduced.addEventListener('change',()=>{stop();draw(performance.now());start();});window.addEventListener('pagehide',()=>{stop();observer.disconnect();});select(selected);size();start();

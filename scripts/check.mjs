import {readFile,readdir,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('..',import.meta.url));
const load=async name=>JSON.parse(await readFile(path.join(root,name),'utf8'));
const roadmap=await load('roadmap.json'),architecture=await load('architecture.json'),pkg=await load('package.json');
assert.equal(pkg.private,true);assert.equal(pkg.license,'UNLICENSED');
function checkGraph(items,idKey,dependencies){
 const ids=new Set(items.map(i=>i[idKey]));assert.equal(ids.size,items.length,'Duplicate graph IDs');const visiting=new Set(),visited=new Set();
 function visit(id){assert(ids.has(id),`Missing dependency ${id}`);if(visited.has(id))return;assert(!visiting.has(id),`Cycle at ${id}`);visiting.add(id);const item=items.find(i=>i[idKey]===id);for(const d of item[dependencies])visit(d);visiting.delete(id);visited.add(id);}
 for(const id of ids)visit(id);
}
checkGraph(roadmap.phases,'id','dependsOn');checkGraph(architecture.units,'id','allows');
for(const phase of roadmap.phases){assert(['planned','in-progress','complete'].includes(phase.status));assert(phase.exitCriteria.length>1);}
assert.deepEqual(architecture.units.find(i=>i.id==='runtime/core').allows,[]);
for(const unit of architecture.units){await access(path.join(root,unit.path));if(unit.id.startsWith('runtime/'))assert(unit.allows.every(d=>d.startsWith('runtime/')),'Runtime depends on authoring');}
let checked=0;async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){if(['.git','node_modules','dist','work','artifacts'].includes(entry.name))continue;const file=path.join(dir,entry.name);if(entry.isDirectory()){assert(!['.runtime','uploads','private'].includes(entry.name));await walk(file);continue;}assert(!/\.(gguf|onnx|safetensors|pt)$/.test(file));const body=await readFile(file,'utf8');assert(!body.includes('/'+'Users'+'/'),'User-specific absolute path in public foundation');if(file.endsWith('.md')){for(const match of body.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)){const link=match[1];if(/^(https?:|#)/.test(link))continue;await access(path.resolve(path.dirname(file),link.split('#')[0]));}checked++;}}}
await walk(root);
for(const file of ['apps/studio-concept/app.js','scripts/serve.mjs','scripts/check.mjs'])execFileSync(process.execPath,['--check',path.join(root,file)]);
const html=await readFile(path.join(root,'apps/studio-concept/index.html'),'utf8');
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'Duplicate DOM IDs');
assert(html.includes('NO MODEL CONNECTED'));assert(html.includes('Compile not run'));
console.log(`Foundation checks passed: ${roadmap.phases.length} roadmap phases, ${architecture.units.length} dependency boundaries, ${checked} linked Markdown documents, concept syntax and status labels. Runtime validation is reported by test:runtime and test:consumers.`);

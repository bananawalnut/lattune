import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('..', import.meta.url));
const pkg=path.join(root,'packages/runtime');
await rm(path.join(pkg,'dist'),{recursive:true,force:true});
await mkdir(path.join(pkg,'dist'),{recursive:true});
await cp(path.join(pkg,'src'),path.join(pkg,'dist'),{recursive:true});
await cp(path.join(pkg,'types'),path.join(pkg,'dist'),{recursive:true});
const inventory=JSON.parse(await readFile(path.join(root,'docs/inventory.json'),'utf8'));
await writeFile(path.join(pkg,'dist/provenance.json'),JSON.stringify({
  sourceRepository:inventory.sourceRepository,sourceHead:inventory.sourceHead,
  sourceFiles:inventory.files.filter(f=>inventory.selected.includes(f.path)),
  note:'ESM extraction and reviewed lifecycle/API changes; source hashes identify the prototype inputs, not byte-identical outputs.',
},null,2)+'\n');
console.log('Built native ESM runtime and public declarations. No globals, bundler or compiler needed by consumers.');

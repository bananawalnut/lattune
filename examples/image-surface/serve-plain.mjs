import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const prefix='/node_modules/@lattune/runtime/dist/';
const server=http.createServer(async(req,res)=>{try{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 const url=new URL(req.url,'http://127.0.0.1');const pathname=decodeURIComponent(url.pathname);
 let file;
 if(pathname==='/'||pathname==='/vanilla.html')file=path.join(root,'vanilla.html');
 else if(pathname==='/vanilla.js')file=path.join(root,'vanilla.js');
 else if(pathname.startsWith(prefix)&&/^[-a-z0-9/]+\.js$/.test(pathname.slice(prefix.length)))file=path.join(root,pathname.slice(1));
 else{res.writeHead(404);res.end();return;}
 const body=await readFile(file);res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(404);res.end();}});
server.listen(Number(process.env.RUNTIME_PLAIN_PORT||8794),'127.0.0.1',()=>console.log('No-build consumer: http://127.0.0.1:'+server.address().port));

import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('..',import.meta.url));
const concept=path.join(root,'apps/studio-concept');
const port=Number(process.env.LATTUNE_CONCEPT_PORT||8792);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.md':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
  const url=new URL(req.url,'http://127.0.0.1');
  const route=decodeURIComponent(url.pathname);
  let target;
  if(route==='/')target=path.join(concept,'index.html');
  else if(['/app.js','/style.css'].includes(route))target=path.join(concept,route.slice(1));
  else if(/^\/docs\/[a-z0-9-]+\.md$/.test(route))target=path.join(root,route.slice(1));
  else {res.writeHead(404);res.end('Not found');return;}
  const body=await readFile(target);
  res.writeHead(200,{'Content-Type':types[path.extname(target)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});
  res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Lattune Studio concept: http://127.0.0.1:${port} (scripted design, no model/compiler connected)`));
server.on('error',e=>{console.error(e.message);process.exitCode=1;});

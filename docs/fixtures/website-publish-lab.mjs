// Filesystem + loopback HTTP demonstration. No SSH, SFTP, real CDN or app GUI.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const scratch=await fs.mkdtemp(path.join(os.tmpdir(),'nexus-publish-lab-'));
const old='public demo version one\n',desired='public demo version two\n';
const digest=x=>createHash('sha256').update(x).digest('hex');
const live=path.join(scratch,'live'),staging=path.join(scratch,'staging');
let server;const results=[];
try {
  await fs.mkdir(live);await fs.mkdir(staging);
  await fs.writeFile(path.join(live,'demo.txt'),old);
  await fs.writeFile(path.join(staging,'demo.txt'),desired);
  server=http.createServer((req,res)=>{
    // A deliberately simulated stale route, not a standards-compliant CDN model.
    if(req.url==='/simulated-cache/demo.txt'){res.writeHead(200,{'Content-Type':'text/plain','Cache-Control':'no-store'});res.end(old);return;}
    if(req.url==='/application-route/demo.txt'){res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end('<!doctype html><title>App fallback</title>');return;}
    if(req.url!=='/demo.txt'){res.writeHead(404);res.end();return;}
    fs.readFile(path.join(live,'demo.txt')).then(body=>{res.writeHead(200,{'Content-Type':'text/plain','Cache-Control':'no-store'});res.end(body);}).catch(()=>{res.writeHead(500);res.end();});
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const base='http://127.0.0.1:'+server.address().port;
  async function response(route){const r=await fetch(base+route,{signal:AbortSignal.timeout(5000)});return {status:r.status,type:r.headers.get('content-type'),body:await r.text()};}
  let r=await response('/demo.txt');
  assert.equal(await fs.readFile(path.join(staging,'demo.txt'),'utf8'),desired);
  assert.equal(r.body,old);assert.notEqual(digest(r.body),digest(desired));
  results.push({case:'intended copy exists in inactive staging directory',status:r.status,downloadedStagingMatches:true,httpMatches:false});
  await fs.copyFile(path.join(staging,'demo.txt'),path.join(live,'demo.txt'));
  r=await response('/simulated-cache/demo.txt');
  assert.equal(await fs.readFile(path.join(live,'demo.txt'),'utf8'),desired);assert.equal(r.body,old);
  results.push({case:'correct active file with deliberately simulated stale response',status:r.status,activeFileMatches:true,httpMatches:false,simulation:true});
  r=await response('/application-route/demo.txt');
  assert.equal(r.status,200);assert.equal(r.type,'text/html');assert.notEqual(digest(r.body),digest(desired));
  results.push({case:'HTTP 200 serves an application fallback',status:r.status,type:r.type,httpMatches:false});
  r=await response('/demo.txt');assert.equal(r.status,200);assert.equal(digest(r.body),digest(desired));
  results.push({case:'fresh route returns the exact expected bytes',status:r.status,httpMatches:true,sha256:digest(r.body)});
  console.log(JSON.stringify({checkedAt:new Date().toISOString(),node:process.version,platform:process.platform,passed:results.length,scope:'temporary filesystem and loopback HTTP only; no SFTP, real CDN, web host, Nexus GUI or application-health test',results},null,2));
} finally {
  if(server?.listening){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
  await fs.rm(scratch,{recursive:true,force:true}); // Only this invocation's mkdtemp directory.
}

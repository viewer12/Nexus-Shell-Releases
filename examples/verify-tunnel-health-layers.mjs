// Loopback-only TCP/HTTP fixture. No SSH handshake, credentials or external hosts.
// Run with Node.js 22+ and curl: node examples/verify-tunnel-health-layers.mjs
import net from 'node:net';
import http from 'node:http';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
const servers = [], sockets = new Set();
const track = socket => { sockets.add(socket); socket.on('close', () => sockets.delete(socket)); socket.on('error', () => {}); return socket; };
async function listen(server) {
  servers.push(server);
  server.on('connection', track);
  await new Promise((resolve,reject) => {server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  return server.address().port;
}
async function tcp(port) {
  return new Promise(resolve => {
    const socket=track(net.connect({host:'127.0.0.1',port}));
    socket.setTimeout(2000);
    socket.once('connect',()=>{socket.destroy();resolve(true);});
    socket.once('error',()=>{socket.destroy();resolve(false);});
    socket.once('timeout',()=>{socket.destroy();resolve(false);});
  });
}
async function request(port) {
  return new Promise((resolve,reject) => {
    const child=spawn('curl',['--disable','--noproxy','*','--connect-timeout','2','--max-time','3','--silent','--show-error','--write-out','\nSTATUS:%{http_code}',`http://127.0.0.1:${port}/`]);
    let stdout='',stderr='';
    child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);
    child.on('error',reject);
    child.on('close',exit=>resolve({exit,stdout,stderr}));
  });
}
const checks=[];
try {
  // Reserve an ephemeral backend port and stop only our own listener.
  const reserved=net.createServer();const missing=await listen(reserved);
  await new Promise(resolve=>reserved.close(resolve));
  const relay=net.createServer(client=>{
    const upstream=track(net.connect({host:'127.0.0.1',port:missing}));
    upstream.on('error',()=>client.destroy());client.on('error',()=>upstream.destroy());
    client.on('close',()=>upstream.destroy());client.pipe(upstream).pipe(client);
  });
  const relayPort=await listen(relay);
  assert.equal(await tcp(relayPort),true);
  const unavailable=await request(relayPort);
  assert.notEqual(unavailable.exit,0);
  assert.ok(unavailable.stdout.endsWith('STATUS:000'));
  checks.push({case:'listener accepts TCP, backend unavailable',tcpAccepted:true,httpSucceeded:false});
  const deniedPort=await listen(http.createServer((_,res)=>{res.writeHead(403);res.end('fixture-access-denied');}));
  const denied=await request(deniedPort);
  assert.equal(denied.exit,0);assert.ok(denied.stdout.endsWith('STATUS:403'));
  checks.push({case:'HTTP access denied',curlExit:0,httpStatus:403,authenticatedSuccess:false});
  const wrongPort=await listen(http.createServer((_,res)=>res.end('fixture-wrong-service')));
  const wrong=await request(wrongPort);
  assert.equal(wrong.exit,0);assert.ok(wrong.stdout.endsWith('STATUS:200'));
  assert.equal(wrong.stdout.includes('fixture-expected-service'),false);
  checks.push({case:'wrong service returns HTTP 200',curlExit:0,httpStatus:200,expectedContent:false});
  const goodPort=await listen(http.createServer((_,res)=>res.end('fixture-expected-service')));
  const good=await request(goodPort);
  assert.equal(good.exit,0);assert.ok(good.stdout.endsWith('STATUS:200'));assert.ok(good.stdout.includes('fixture-expected-service'));
  checks.push({case:'expected fixture response',curlExit:0,httpStatus:200,expectedContent:true});
  console.log(JSON.stringify({observedAtUTC:new Date().toISOString(),scope:'Local Node TCP/HTTP fixtures; not SSH, real database, Nexus GUI or customer server verification',checks},null,2));
} finally {
  for(const socket of sockets)socket.destroy();
  await Promise.all(servers.filter(s=>s.listening).map(s=>new Promise(resolve=>s.close(resolve))));
}

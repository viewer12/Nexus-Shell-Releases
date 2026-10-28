// Node.js 22+. Local transport fixture only: no SSH, database or GUI protocol.
import net from 'node:net';
import { lookup } from 'node:dns/promises';
import { mkdtemp, rm } from 'node:fs/promises';
import assert from 'node:assert/strict';

const servers = [];
const sockets = new Set();
const results = [];
let directory;
async function listen(options, marker) {
  const server = net.createServer(socket => {
    sockets.add(socket);
    socket.once('close', () => sockets.delete(socket));
    socket.end(marker);
  });
  servers.push(server);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(options, () => { server.removeListener('error', reject); resolve(); });
  });
  return server;
}
function read(options) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(options);
    sockets.add(socket);
    socket.once('close', () => sockets.delete(socket));
    let text = '';
    socket.setEncoding('utf8');
    socket.setTimeout(2000, () => socket.destroy(new Error('fixture timeout')));
    socket.on('data', chunk => { text += chunk; });
    socket.once('end', () => resolve(text));
    socket.once('error', reject);
  });
}
function close(server) {
  return new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}
try {
  directory = await mkdtemp('/tmp/nexus-loopback-');
  const ipv4 = await listen({ host: '127.0.0.1', port: 0 }, 'ipv4-tunnel-fixture');
  const port = ipv4.address().port;
  assert.equal(await read({ host: '127.0.0.1', port }), 'ipv4-tunnel-fixture');
  results.push({ name: 'explicit IPv4 reaches the IPv4 listener', passed: true });

  // A distinct IPv6-only listener deliberately uses the same numeric port.
  // If IPv6 is unavailable, fail visibly instead of claiming this case passed.
  const ipv6 = await listen({ host: '::1', port, ipv6Only: true }, 'different-ipv6-service');
  assert.equal(await read({ host: '::1', port }), 'different-ipv6-service');
  assert.equal(await read({ host: '127.0.0.1', port }), 'ipv4-tunnel-fixture');
  results.push({ name: 'same port on IPv6 reaches a different service', passed: true });

  await listen({ path: directory + '/fixture.sock' }, 'different-unix-socket-service');
  assert.equal(await read({ path: directory + '/fixture.sock' }), 'different-unix-socket-service');
  results.push({ name: 'Unix socket selects another transport, without a TCP port', passed: true });

  await close(ipv6);
  await assert.rejects(read({ host: '::1', port }), { code: 'ECONNREFUSED' });
  assert.equal(await read({ host: '127.0.0.1', port }), 'ipv4-tunnel-fixture');
  results.push({ name: 'IPv6 refusal can coexist with a working IPv4 listener', passed: true });

  console.log(JSON.stringify({
    checkedAt: new Date().toISOString(), platform: process.platform, node: process.version,
    scope: 'Node loopback TCP and private Unix socket; not SSH, MySQL, PostgreSQL, GUI or customer-server verification',
    localhostAnswersObserved: await lookup('localhost', { all: true }),
    dnsOrderClaim: 'Observed on this machine only; not a cross-client or macOS-version guarantee',
    passed: results.length, results
  }, null, 2));
} finally {
  for (const socket of sockets) socket.destroy();
  for (const server of servers) if (server.listening) await close(server);
  if (directory) await rm(directory, { recursive: true, force: true });
}

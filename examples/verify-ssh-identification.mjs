// Temporary loopback fixtures only. No server account, user SSH config or keys.
import net from 'node:net';
import assert from 'node:assert/strict';
import {spawn, spawnSync} from 'node:child_process';

const cases = [
  {name:'closed-before-version', response:'', version:false},
  {name:'text-refusal', response:'Not allowed at this time\r\n', version:false, text:'Not allowed at this time'},
  {name:'other-service', response:'HTTP/1.1 403 Forbidden\r\n', version:false, text:'HTTP/1.1 403 Forbidden'},
  {name:'ssh-version-only', response:'SSH-2.0-NexusFixture_1.0\r\n', version:true},
];
const results = [];
for (const fixture of cases) {
  let accepted = 0;
  const sockets = new Set();
  const server = net.createServer(socket => {
    accepted++;
    sockets.add(socket);
    socket.on('error', () => {});
    socket.on('close', () => sockets.delete(socket));
    socket.once('data', () => socket.end(fixture.response));
  });
  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const port = server.address().port;
    const args = ['-vv', '-F', '/dev/null', '-oIdentityAgent=none', '-oIdentityFile=none',
      '-oPubkeyAuthentication=no', '-oPasswordAuthentication=no', '-oKbdInteractiveAuthentication=no',
      '-oGSSAPIAuthentication=no', '-oBatchMode=yes', '-oStrictHostKeyChecking=yes',
      '-oUserKnownHostsFile=/dev/null', '-oGlobalKnownHostsFile=/dev/null',
      '-oConnectTimeout=3', '-oConnectionAttempts=1', '-p', String(port), '-l', 'fixture', '127.0.0.1'];
    const result = await new Promise((resolve, reject) => {
      const child = spawn('/usr/bin/ssh', args);
      let output = '';
      const timer = setTimeout(() => child.kill('SIGTERM'), 5000);
      child.stdout.on('data', data => output += data);
      child.stderr.on('data', data => output += data);
      child.once('error', error => {clearTimeout(timer);reject(error);});
      child.once('close', (code, signal) => {clearTimeout(timer);resolve({code,signal,output});});
    });
    assert.equal(result.signal, null);
    assert.notEqual(result.code, 0);
    assert.equal(accepted, 1);
    assert.match(result.output, /Connection established/);
    assert.equal(/Remote protocol version 2\.0/.test(result.output), fixture.version);
    assert.doesNotMatch(result.output, /Authenticated to|Offering public key|Next authentication method/);
    if (fixture.text) assert.ok(result.output.includes(fixture.text));
    results.push({case:fixture.name, acceptedConnections:accepted, exitCode:result.code,
      tcpConnected:true, remoteVersionReceived:fixture.version, authenticated:false,
      relevantOutput:result.output.split('\n').filter(line => /Remote protocol|kex_exchange|banner line|Connection (closed|reset)/.test(line))});
  } finally {
    for (const socket of sockets) socket.destroy();
    if (server.listening) await new Promise(resolve => server.close(resolve));
  }
}
console.log(JSON.stringify({checkedAt:new Date().toISOString(),
  client:spawnSync('/usr/bin/ssh', ['-V'], {encoding:'utf8'}).stderr.trim(),
  scope:'four temporary loopback TCP listeners; no real SSH daemon, credentials or Nexus Shell GUI', results}, null, 2));

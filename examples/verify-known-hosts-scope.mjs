// Offline command rehearsal. No network, no server login, no user SSH files.
// Requires Node.js 18+ and OpenSSH ssh-keygen on PATH.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const directory = mkdtempSync(join(tmpdir(), 'nexus-known-hosts-'));
const run = args => {
  const r = spawnSync('ssh-keygen', args, { encoding: 'utf8', timeout: 15000 });
  if (r.error) throw r.error;
  return r;
};
const ok = args => {
  const r = run(args);
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
};
const checks = [];
try {
  const oldKey = join(directory, 'old'), newKey = join(directory, 'new');
  for (const file of [oldKey, newKey]) ok(['-q', '-t', 'ed25519', '-N', '', '-C', 'disposable-example', '-f', file]);
  const oldPublic = readFileSync(oldKey + '.pub', 'utf8').trim();
  const newPublic = readFileSync(newKey + '.pub', 'utf8').trim();
  const fingerprint = file => ok(['-l', '-E', 'sha256', '-f', file]).trim().split(/\s+/)[1];
  assert.notEqual(fingerprint(oldKey + '.pub'), fingerprint(newKey + '.pub'));
  checks.push('Different disposable host keys have different SHA256 fingerprints');

  const hosts = join(directory, 'known_hosts');
  writeFileSync(hosts, 'server.example ' + oldPublic + '\n[server.example]:2222 ' + oldPublic + '\nother.example ' + oldPublic + '\n', {mode: 0o600});
  ok(['-H', '-f', hosts]);
  assert(!readFileSync(hosts, 'utf8').includes('server.example'));
  assert(ok(['-F', '[server.example]:2222', '-f', hosts]).includes(oldPublic));
  checks.push('The exact nondefault host:port can be found even when names are hashed');

  ok(['-R', '[server.example]:2222', '-f', hosts]);
  assert.equal(run(['-F', '[server.example]:2222', '-f', hosts]).status, 1);
  checks.push('Removing the verified host:port removes its hashed old entry');
  assert(ok(['-F', 'server.example', '-f', hosts]).includes(oldPublic));
  assert(ok(['-F', 'other.example', '-f', hosts]).includes(oldPublic));
  checks.push('The same hostname at port 22 and the unrelated host are preserved');
  assert(ok(['-F', '[server.example]:2222', '-f', hosts + '.old']).includes(oldPublic));
  checks.push('The tool backup contains the removed record');

  // This fixture already controls the replacement public key. A real network
  // key must be independently verified before it is trusted.
  writeFileSync(hosts, readFileSync(hosts, 'utf8') + '[server.example]:2222 ' + newPublic + '\n');
  const selected = ok(['-F', '[server.example]:2222', '-f', hosts]);
  assert(selected.includes(newPublic));
  assert(!selected.includes(oldPublic));
  checks.push('After a fixture-only verified replacement, lookup returns the new key');
  console.log(JSON.stringify({time: new Date().toISOString(), platform: process.platform, checks, passed: checks.length, scope: 'Offline disposable known_hosts fixture; no network, app GUI, customer host or user SSH files tested'}, null, 2));
} finally {
  // Delete only the exact directory created above, including disposable keys.
  rmSync(directory, {recursive: true, force: true});
}

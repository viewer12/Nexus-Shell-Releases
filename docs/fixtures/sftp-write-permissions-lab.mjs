// Local OpenSSH SFTP diagnostic: no network, host credentials or Nexus Shell app.
// Run as a normal macOS user: node docs/fixtures/sftp-write-permissions-lab.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

if (process.platform !== 'darwin' || process.getuid?.() === 0) {
  throw new Error('Run on macOS as an ordinary user, without sudo.');
}
const server = '/usr/libexec/sftp-server';
fs.accessSync(server, fs.constants.X_OK);
const labDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-sftp-permissions-'));
fs.chmodSync(labDir, 0o700);
const siteDir = path.join(labDir, 'site');
const file = name => path.join(labDir, name);
function transfer(label, command, succeeds) {
  const result = spawnSync('/usr/bin/sftp', ['-D', server, '-b', '-'], {
    cwd: labDir, input: command + '\n', encoding: 'utf8', timeout: 10000,
    env: {...process.env, LC_ALL: 'C'},
  });
  if (result.error) throw result.error;
  const output = result.stdout + result.stderr;
  if (succeeds) assert.equal(result.status, 0, output);
  else {
    assert.notEqual(result.status, 0, output);
    assert.match(output, /Permission denied/i);
  }
  console.log(JSON.stringify({check: label, exit: result.status, passed: true}));
}
try {
  fs.mkdirSync(siteDir, {mode: 0o700});
  fs.writeFileSync(file('upload.txt'), 'new test content\n', {mode: 0o600});
  fs.writeFileSync(file('site/existing.txt'), 'original test content\n', {mode: 0o600});
  fs.writeFileSync(file('site/staged.txt'), 'staged test content\n', {mode: 0o600});
  fs.chmodSync(siteDir, 0o500);
  console.log(JSON.stringify({time: new Date().toISOString(), platform: os.platform(),
    release: os.release(), node: process.version,
    openssh: spawnSync('/usr/bin/ssh', ['-V'], {encoding: 'utf8'}).stderr.trim(),
    transport: 'local sftp -D, no SSH authentication or network'}));

  transfer('read existing file with non-writable parent', 'get site/existing.txt downloaded.txt', true);
  assert.equal(fs.readFileSync(file('downloaded.txt'), 'utf8'), 'original test content\n');
  transfer('overwrite writable file in place', 'put upload.txt site/existing.txt', true);
  assert.equal(fs.readFileSync(file('site/existing.txt'), 'utf8'), 'new test content\n');
  transfer('create sibling denied by parent', 'put upload.txt site/new.txt', false);
  assert.equal(fs.existsSync(file('site/new.txt')), false);
  transfer('rename sibling denied by parent', 'rename site/staged.txt site/existing.txt', false);
  assert.equal(fs.readFileSync(file('site/existing.txt'), 'utf8'), 'new test content\n');
  assert.equal(fs.existsSync(file('site/staged.txt')), true);

  // Restore write access ONLY to the disposable directory this script created.
  fs.chmodSync(siteDir, 0o700);
  transfer('create sibling after restoring parent write', 'put upload.txt site/new.txt', true);
  transfer('replace via rename after restoring parent write', 'rename site/staged.txt site/existing.txt', true);
  assert.equal(fs.readFileSync(file('site/existing.txt'), 'utf8'), 'staged test content\n');
  console.log('PASS: file write access does not establish create/rename access in its parent.');
} finally {
  if (fs.existsSync(siteDir)) fs.chmodSync(siteDir, 0o700);
  // labDir comes only from mkdtemp above, never from user input or an env path target.
  fs.rmSync(labDir, {recursive: true});
  console.log('Removed this run’s disposable local fixture.');
}

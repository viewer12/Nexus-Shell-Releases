// Local tmux semantics only. Uses its own socket; never connects to SSH.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
const bin = process.argv[2];
assert.ok(bin, 'Pass an existing tmux executable path');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-tmux-exact-'));
const socket = path.join(dir, 'fixture.sock');
const env = { ...process.env, TMUX: '', TERM: 'xterm-256color' };
const run = (...args) => spawnSync(bin, ['-S', socket, '-f', '/dev/null', ...args], { env, encoding: 'utf8' });
const tm = (...args) => { const r = run(...args); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };
const clients = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const until = async predicate => { const end = Date.now() + 5000; while (Date.now() < end) { if (predicate()) return; await delay(50); } throw Error('Timed out waiting for fixture client'); };
const list = () => tm('list-clients', '-F', '#{client_pid}:#{session_name}').split('\n').filter(Boolean);
try {
  tm('new-session', '-d', '-s', 'maintenance', '/bin/sh');
  tm('new-session', '-d', '-s', 'backup-old', '/bin/sh');
  assert.equal(run('has-session', '-t', 'backup').status, 0, 'Plain prefix should select backup-old');
  assert.equal(run('has-session', '-t', '=backup').status, 1, 'Exact missing target must fail');
  assert.equal(run('has-session', '-t', '=maintenance').status, 0);
  const panes = tm('list-panes', '-a', '-F', '#{session_name}:#{pane_pid}');
  for (let i = 0; i < 2; i++) {
    const child = spawn(bin, ['-S', socket, '-C', 'attach-session', '-t', '=maintenance'], { env, stdio: ['pipe', 'pipe', 'pipe'] });
    child.stdout.resume(); child.stderr.resume(); clients.push(child);
    await until(() => list().length === i + 1);
  }
  clients[0].stdin.write("switch-client -t '=backup-old'\n");
  await until(() => list().includes(clients[0].pid + ':backup-old'));
  assert.ok(list().includes(clients[1].pid + ':maintenance'), 'Other client must stay attached');
  assert.equal(tm('list-panes', '-a', '-F', '#{session_name}:#{pane_pid}'), panes);
  assert.equal(tm('list-sessions', '-F', '#{session_name}'), 'backup-old\nmaintenance');
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), version: spawnSync(bin, ['-V'], { encoding: 'utf8' }).stdout.trim(),
    plainPrefixMatchesBackupOld: true, exactMissingBackupFails: true, exactMaintenanceExists: true,
    controlModeClients: 2, switchClientChangesOnlyCurrentClient: true, bothPaneProcessesPreserved: true,
    noReplacementSessionCreated: true, defaultSocketUntouched: true, sshOutageTest: false, physicalSleepTest: false }, null, 2));
} finally {
  for (const child of clients) if (child.exitCode === null) child.kill('SIGTERM');
  run('kill-server'); // Only this script's explicitly named socket.
  try { fs.rmdirSync(dir); } catch { /* Keep any unexpected file for inspection. */ }
}

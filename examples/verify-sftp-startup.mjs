// Local protocol fixture: no SSH transport, network, credentials or user config.
// Inspect before running. Requires Node.js 20+ and /usr/bin/sftp.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-sftp-startup-'));
const stub = path.join(directory, 'subsystem.mjs');
const source = `
const mode = process.argv[2];
if (mode === 'eof') process.exit(0);
if (mode === 'stdout-text') { process.stdout.write('Welcome to a disposable fixture\\n'); process.exit(0); }
if (mode === 'binary-length') { process.stdout.write(Buffer.from([255,255,255,255])); process.exit(0); }
if (mode === 'stderr-text') process.stderr.write('Welcome to a disposable fixture\\n');
const u32 = n => { const b=Buffer.alloc(4);b.writeUInt32BE(n);return b; };
const string = s => Buffer.concat([u32(Buffer.byteLength(s)),Buffer.from(s)]);
const send = b => process.stdout.write(Buffer.concat([u32(b.length),b]));
let pending=Buffer.alloc(0);
process.stdin.on('data', bytes => {
  pending=Buffer.concat([pending,bytes]);
  while(pending.length>=4 && pending.length>=4+pending.readUInt32BE(0)) {
    const n=pending.readUInt32BE(0), p=pending.subarray(4,4+n);pending=pending.subarray(4+n);
    if(p[0]===1) send(Buffer.concat([Buffer.from([2]),u32(3)])); // INIT -> VERSION 3
    else if(p[0]===16) send(Buffer.concat([Buffer.from([104]),p.subarray(1,5),u32(1),string('/'),string('/'),u32(0)])); // REALPATH -> NAME
    else { process.stderr.write('Unexpected fixture request: '+p[0]+'\\n');process.exit(2); }
  }
});
`;
const quote = s => '"' + s.replaceAll('\\', '\\\\').replaceAll('"', '\\"') + '"';
try {
  fs.writeFileSync(stub,source,{mode:0o600});
  const results=[];
  for(const mode of ['clean','stdout-text','stderr-text','eof','binary-length']) {
    const command = [process.execPath,stub,mode].map(quote).join(' ');
    const r=spawnSync('/usr/bin/sftp',['-D',command,'-b','-'],{
      input:'quit\n',encoding:'utf8',timeout:8000,env:{...process.env,LC_ALL:'C'}
    });
    if(r.error) throw r.error;
    assert.equal(r.signal,null,mode);
    if(mode==='clean'||mode==='stderr-text') assert.equal(r.status,0,mode+': '+r.stderr);
    else assert.notEqual(r.status,0,mode);
    if(mode==='stdout-text') assert.match(r.stderr,/Received message too long 1466264675/);
    if(mode==='binary-length') assert.match(r.stderr,/Received message too long 4294967295/);
    if(mode==='eof') assert.doesNotMatch(r.stderr,/Received message too long/);
    results.push({mode,exitCode:r.status,stdout:r.stdout.trim(),stderr:r.stderr.trim()});
  }
  const version=spawnSync('/usr/bin/ssh',['-V'],{encoding:'utf8'});
  console.log(JSON.stringify({
    checkedAt:new Date().toISOString(),platform:process.platform,osRelease:os.release(),node:process.version,
    openssh:(version.stdout+version.stderr).trim(),passed:results.length,
    network:false,authentication:false,realFilesystemOperations:false,nexusGui:false,
    limitation:'Minimal synthetic SFTP startup only; not a diagnosis of any real server or client.',
    results
  },null,2));
} finally {
  // This exact directory was created above and contains only this fixture.
  fs.rmSync(directory,{recursive:true,force:true});
}

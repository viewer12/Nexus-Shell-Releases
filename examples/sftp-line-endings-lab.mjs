// Synthetic local subsystem experiment: no SSH login, user config or network.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const server = (process.platform === 'darwin' ? ['/usr/libexec/sftp-server'] : ['/usr/lib/openssh/sftp-server','/usr/libexec/openssh/sftp-server']).find(p => fs.existsSync(p));
assert.ok(server, 'OpenSSH SFTP server component required; nothing is installed automatically.');
const version = spawnSync('ssh', ['-V'], {encoding:'utf8'}); assert.equal(version.status, 0);
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-sftp-lines-'));
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const crlf = Buffer.from('#!/bin/sh\r\nprintf "sample\\n"\r\n');
const lf = Buffer.from('#!/bin/sh\nprintf "sample\\n"\n');
const bom = Buffer.concat([Buffer.from([239,187,191]), crlf]);
const cases = [];
try {
  for (const [name, command, source] of [['crlf-upload','put',crlf],['crlf-download','get',crlf],['prepared-lf-upload','put',lf],['bom-upload','put',bom]]) {
    const input = path.join(root, name + '-source.txt'), output = path.join(root, name + '-copy.txt');
    fs.writeFileSync(input, source);
    const batch = `${command} "${input}" "${output}"\nbye\n`;
    const run = spawnSync('sftp', ['-D',server,'-b','-'], {input:batch,cwd:root,encoding:'utf8',timeout:10000});
    assert.equal(run.status, 0, run.stderr || run.error?.message);
    const actual = fs.readFileSync(output); assert.deepEqual(actual, source); assert.deepEqual(fs.readFileSync(input), source);
    cases.push({name,command,exitCode:run.status,bytes:actual.length,sha256:hash(actual),bytePreserved:true,sourceUnchanged:true,crlfPairs:[...actual].filter((b,i)=>b===13&&actual[i+1]===10).length,utf8BOM:actual.subarray(0,3).equals(Buffer.from([239,187,191]))});
  }
  assert.notEqual(hash(crlf), hash(lf));
  console.log(JSON.stringify({checkedAt:new Date().toISOString(),platform:process.platform,openSSH:(version.stderr||version.stdout).trim(),method:'local sftp -D over pipes; synthetic script bytes are never executed',passed:cases.length,cases,crlfAndLFHaveDifferentHashes:true,network:false,credentials:false,nexusGUI:false,winSCPRuntime:false,temporaryDataRemoved:true},null,2));
} finally {
  // Only the exact private directory created by mkdtemp above.
  fs.rmSync(root,{recursive:true,force:true});
}

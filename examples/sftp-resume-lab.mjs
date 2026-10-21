// Synthetic OpenSSH SFTP resume experiment. No SSH, credentials or listener.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

const candidates=process.platform==='darwin'?['/usr/libexec/sftp-server']:['/usr/lib/openssh/sftp-server','/usr/libexec/openssh/sftp-server'];
const server=candidates.find(p=>fs.existsSync(p));
assert.ok(server,'Install the OpenSSH SFTP server component first; this script does not install software.');
const version=spawnSync('ssh',['-V'],{encoding:'utf8'});assert.equal(version.status,0);
const root=fs.mkdtempSync(path.join(os.tmpdir(),'nexus-sftp-resume-'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const source=Buffer.alloc(16384);for(let i=0;i<source.length;i++)source[i]=(i*31+17)%251;
const baseline=hash(source),results=[];
const prefix=source.subarray(0,4096),wrong=Buffer.from(prefix);wrong[0]^=255;
const quote=p=>'"'+p.replaceAll('\\','\\\\').replaceAll('"','\\"')+'"';
try{
  fs.mkdirSync(path.join(root,'client'));fs.mkdirSync(path.join(root,'server'));
  for(const direction of ['download','upload']){
    for(const kind of ['matching-prefix','changed-prefix','fresh-copy']){
      const dir=path.join(root,direction+'-'+kind);fs.mkdirSync(dir);
      const input=path.join(dir,'source.bin'),output=path.join(dir,'destination.bin');
      fs.writeFileSync(input,source);
      if(kind!=='fresh-copy')fs.writeFileSync(output,kind==='matching-prefix'?prefix:wrong);
      const command=direction==='download'?(kind==='fresh-copy'?'get':'reget'):(kind==='fresh-copy'?'put':'reput');
      const batch=`${command} ${quote(input)} ${quote(output)}\nbye\n`;
      const run=spawnSync('sftp',['-D',server,'-b','-'],{input:batch,cwd:root,encoding:'utf8',timeout:10000,maxBuffer:1024*1024});
      assert.equal(run.status,0,run.stderr||run.error?.message);
      const actual=fs.readFileSync(output),matches=hash(actual)===baseline;
      assert.equal(actual.length,source.length);assert.equal(matches,kind!=='changed-prefix');
      assert.equal(hash(fs.readFileSync(input)),baseline);
      results.push({direction,case:kind,command,exitCode:run.status,bytes:actual.length,sizeMatches:true,sha256:hash(actual),contentMatches:matches,expectedContentMatches:kind!=='changed-prefix',sourceUnchanged:true});
    }
  }
  console.log(JSON.stringify({checkedAt:new Date().toISOString(),platform:process.platform,openSSH:(version.stderr||version.stdout).trim(),method:'sftp -D over local pipes; preseeded synthetic partials, not injected network interruption',sourceBytes:source.length,partialBytes:prefix.length,sourceSHA256:baseline,cases:results,passed:results.length,network:false,credentials:false,nexusGUI:false,realServerCompatibility:'not tested',temporaryDataRemoved:true},null,2));
}finally{
  // Only the exact directory created above is removed; no user input or glob.
  fs.rmSync(root,{recursive:true,force:true});
}

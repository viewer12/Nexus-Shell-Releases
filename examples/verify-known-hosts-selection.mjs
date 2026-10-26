// Offline lookup/file-selection rehearsal; no network or user SSH files.
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

const directory=mkdtempSync(join(tmpdir(),'nexus-trust-selection-'));
const records=[],checks=[];
const run=(binary,args)=>{
  const r=spawnSync(binary,args,{encoding:'utf8',timeout:15000});
  if(r.error)throw r.error;
  records.push({command:[binary,...args].map(x=>x.replaceAll(directory,'<LAB>')),status:r.status,stdout:r.stdout.replaceAll(directory,'<LAB>'),stderr:r.stderr.replaceAll(directory,'<LAB>')});
  return r;
};
const ok=(binary,args)=>{const r=run(binary,args);assert.equal(r.status,0,r.stderr);return r.stdout;};
try{
  const key=join(directory,'disposable'),ordinary=join(directory,'ordinary_known_hosts'),selected=join(directory,'project_known_hosts'),config=join(directory,'ssh_config');
  ok('ssh-keygen',['-q','-t','ed25519','-N','','-C','disposable-lab-only','-f',key]);
  const pub=readFileSync(key+'.pub','utf8').trim();
  writeFileSync(ordinary,'unrelated.example '+pub+'\n',{mode:0o600});
  writeFileSync(selected,'[server.example]:2222 '+pub+'\nlogical-blue '+pub+'\nlogical-green '+pub+'\n',{mode:0o600});
  writeFileSync(config,`Host lab-blue\n  HostName server.example\n  Port 2222\n  HostKeyAlias logical-blue\n  UserKnownHostsFile ${selected}\n  CanonicalizeHostname no\n`,{mode:0o600});
  const version=run('ssh',['-V']);assert.equal(version.status,0);
  const effective=ok('ssh',['-G','-F',config,'lab-blue']);
  assert.match(effective,/^hostname server\.example$/m);assert.match(effective,/^port 2222$/m);assert.match(effective,/^hostkeyalias logical-blue$/m);assert.ok(effective.includes('userknownhostsfile '+selected));
  checks.push('A controlled ssh -G config exposes the explicit host, port, trust alias and custom file; no connection is made');
  const before=readFileSync(selected,'utf8'),ordinaryBefore=readFileSync(ordinary,'utf8');
  const wrongPort=run('ssh-keygen',['-R','server.example','-f',selected]);
  assert.equal(wrongPort.status,0);assert.match(wrongPort.stdout+wrongPort.stderr,/not found/);assert.equal(readFileSync(selected,'utf8'),before);
  assert.equal(run('ssh-keygen',['-F','[server.example]:2222','-f',selected]).status,0);
  checks.push('Removing the plain host exits zero with not found while the nondefault-port record remains');
  const wrongFile=run('ssh-keygen',['-R','logical-blue','-f',ordinary]);
  assert.equal(wrongFile.status,0);assert.match(wrongFile.stdout+wrongFile.stderr,/not found/);assert.equal(readFileSync(ordinary,'utf8'),ordinaryBefore);assert.equal(readFileSync(selected,'utf8'),before);
  checks.push('Removing the alias in a different file also exits zero and leaves the selected file unchanged');
  ok('ssh-keygen',['-H','-f',selected]);
  assert.equal(run('ssh-keygen',['-F','lab-blue','-f',selected]).status,1);
  assert.ok(ok('ssh-keygen',['-F','logical-blue','-f',selected]).includes(pub));
  checks.push('The configured connection nickname is absent, while the explicit trust alias is found even after hashing');
  const hashed=readFileSync(selected,'utf8');
  ok('ssh-keygen',['-R','logical-blue','-f',selected]);
  assert.equal(run('ssh-keygen',['-F','logical-blue','-f',selected]).status,1);
  assert.equal(readFileSync(selected+'.old','utf8'),hashed);
  checks.push('The exact alias and selected file remove only that record, with the pre-removal content in the tool backup');
  for(const target of ['logical-green','[server.example]:2222'])assert.ok(ok('ssh-keygen',['-F',target,'-f',selected]).includes(pub));
  assert.equal(readFileSync(ordinary,'utf8'),ordinaryBefore);
  checks.push('Another alias, the separate nondefault-port record and the ordinary file are preserved');
  const result={recordedAt:new Date().toISOString(),platform:process.platform,sshVersion:(version.stderr+version.stdout).trim(),passed:checks.length,checks,records,networkConnection:false,userSSHFiles:false,nexusGUI:false,scope:'Controlled OpenSSH config evaluation and disposable known_hosts operations. The alias records are fixture data; no SSH handshake, endpoint identity, certificate policy or GUI trust-store behavior is tested.'};
  if(process.argv.includes('--record'))writeFileSync(new URL('../docs/fixtures/known-hosts-selection-result.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
}finally{
  // Only the exact directory returned by mkdtempSync above is removed.
  rmSync(directory,{recursive:true,force:true});
}

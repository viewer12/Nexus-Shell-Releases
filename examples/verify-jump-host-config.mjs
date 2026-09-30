// Offline only: evaluates this script's own config, never a user's SSH files.
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
const dir=mkdtempSync(join(tmpdir(),'nexus-jump-config-'));
try {
 const config=join(dir,'config');
 writeFileSync(config,`Host lab-jump
  HostName 192.0.2.10
  User gateway
  Port 2222
  IdentityFile /nonexistent/nexus-example-jump-key
  IdentitiesOnly yes

Host lab-target
  HostName 198.51.100.20
  User developer
  Port 2200
  IdentityFile /nonexistent/nexus-example-target-key
  IdentitiesOnly yes
  ProxyJump lab-jump

Host *
  IdentityAgent none
  ForwardAgent no
  CanonicalizeHostname no
  StrictHostKeyChecking yes
`,{mode:0o600});
 const evaluate=alias=>Object.fromEntries(execFileSync('ssh',['-G','-F',config,alias],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').map(line=>{const i=line.indexOf(' ');return [line.slice(0,i),line.slice(i+1)];}));
 const jump=evaluate('lab-jump'),target=evaluate('lab-target');
 const checks=[];
 const check=(name,actual,expected)=>{assert.deepEqual(actual,expected,name);checks.push(name);};
 check('jump endpoint/account/port',[jump.hostname,jump.user,jump.port],['192.0.2.10','gateway','2222']);
 check('target endpoint/account/port',[target.hostname,target.user,target.port],['198.51.100.20','developer','2200']);
 check('target selects jump alias',target.proxyjump,'lab-jump');
 check('jump key selection',jump.identityfile,'/nonexistent/nexus-example-jump-key');
 check('target key selection',target.identityfile,'/nonexistent/nexus-example-target-key');
 check('explicit key selection',[jump.identitiesonly,target.identitiesonly],['yes','yes']);
 check('no agent forwarding',[jump.forwardagent,target.forwardagent],['no','no']);
 check('no external agent',[jump.identityagent,target.identityagent],['none','none']);
 check('host verification retained',[jump.stricthostkeychecking,target.stricthostkeychecking],['true','true']);
 console.log(JSON.stringify({date:new Date().toISOString(),scope:'Isolated ssh -G configuration evaluation; no server, credentials, network session or app GUI test',checks,passed:checks.length},null,2));
}finally{rmSync(dir,{recursive:true,force:true});}

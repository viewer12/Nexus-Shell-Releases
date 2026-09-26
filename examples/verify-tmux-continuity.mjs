import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
const bin=process.argv[2];assert.ok(bin && path.isAbsolute(bin), 'Pass an absolute path to an existing tmux executable');
assert.ok(fs.existsSync(bin), 'tmux executable not found');
// This uses a fresh local socket and no tmux user configuration. It never opens SSH.
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'nexus-tmux-fixture-'));
const socket=path.join(dir,'session.sock'),env={...process.env,TMUX:'',TERM:'xterm-256color'};
const tm=(...args)=>{const r=spawnSync(bin,['-S',socket,'-f','/dev/null',...args],{env,encoding:'utf8'});assert.equal(r.status,0,r.stderr);return r.stdout.trim();};
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(f,timeout=7000){const end=Date.now()+timeout;while(Date.now()<end){if(f())return;await delay(100);}throw Error('Timed out');}
const children=[];
const attach=async()=>{const p=spawn('/usr/bin/python3',['-c',"import os,pty,sys,select,fcntl,termios,struct,signal\npid,master=pty.fork()\nif pid==0:\n os.execv(sys.argv[1],sys.argv[1:])\nfcntl.ioctl(master,termios.TIOCSWINSZ,struct.pack(\"HHHH\",24,120,0,0))\ntry:\n while True:\n  ready,_,_=select.select([master,0],[],[],1)\n  for fd in ready:\n   try: data=os.read(fd,65536)\n   except OSError: data=b\"\"\n   if not data: raise EOFError()\n   os.write(1 if fd==master else master,data)\nexcept EOFError:\n pass\nfinally:\n os.close(master)\n _,status=os.waitpid(pid,0)\n sys.exit(os.waitstatus_to_exitcode(status))\n",bin,'-S',socket,'attach-session','-t','maintenance'],{env,stdio:['pipe','pipe','pipe']});children.push(p);let terminal='';p.stdout.on('data',d=>terminal+=d);p.stderr.on('data',d=>terminal+=d);try{await until(()=>tm('list-clients','-F','#{client_pid}').length>0);}catch(e){throw Error(e.message+': '+terminal);}return p;};
const detach=async p=>{p.stdin.write('\x02d');await until(()=>p.exitCode!==null);assert.equal(p.exitCode,0);assert.equal(tm('list-clients','-F','#{client_pid}'),'');};
const capture=()=>tm('capture-pane','-p','-S','-','-t','maintenance');
const ticks=()=>[...capture().matchAll(/^tick (\d+)\/30 /gm)].map(x=>Number(x[1]));
const sourceURL='https://nexusshell.app/_md/en/guides/keep-remote-jobs-running-after-mac-sleep.md';
const response=await fetch(sourceURL);assert.equal(response.status,200);
const md=await response.text();
const counter=[...md.matchAll(/\x60\x60\x60sh\n([\s\S]*?)\x60\x60\x60/g)][2][1];
const quote=s=>"'"+s.replaceAll("'","'\\''")+"'";
try{
 tm('new-session','-d','-s','maintenance','/bin/sh');
 tm('send-keys','-t','maintenance','-l','/bin/sh -c '+quote(counter));
 tm('send-keys','-t','maintenance','Enter');
 const first=await attach();await until(()=>ticks().length>0);
 const pid=tm('display-message','-p','-t','maintenance','#{pane_pid}');
 const before=ticks().at(-1);await detach(first);await delay(2500);
 const second=await attach();const after=ticks().at(-1);
 assert.equal(tm('display-message','-p','-t','maintenance','#{pane_pid}'),pid);assert.ok(after>before);
 await detach(second);
 await until(()=>/^rehearsal finished$/m.test(capture()),70000);
 assert.deepEqual(ticks(),Array.from({length:30},(_,i)=>i+1));
 const version=spawnSync(bin,['-V'],{encoding:'utf8'}).stdout.trim();
 console.log(JSON.stringify({version,localPTY:true,clientDetachReattach:true,samePanePID:true,beforeDetachTick:before,afterReattachTick:after,completedTicks:30,finished:true,sshDisconnectTest:false,physicalSleepTest:false,defaultTmuxSocketUntouched:true},null,2));
}finally{
 for(const p of children)if(p.exitCode===null)p.kill('SIGTERM');
 spawnSync(bin,['-S',socket,'kill-server'],{env,encoding:'utf8'});
 try{fs.rmdirSync(dir)}catch{}
}

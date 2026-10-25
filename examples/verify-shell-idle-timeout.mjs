// Local Bash/PTY demonstration only: no SSH, server, credentials or user rc files.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const driver = String.raw`
import os,pty,select,signal,sys,time,json
command=sys.argv[1]
pid,master=pty.fork()
if pid==0:
 os.execve('/bin/bash',['/bin/bash','--noprofile','--norc','-i'],{'PATH':'/usr/bin:/bin','TERM':'dumb','PS1':'NEXUS_LAB> ','HISTFILE':'/dev/null','LC_ALL':'C'})
output=b''
started=time.monotonic()
sent=False
status=None
try:
 while time.monotonic()-started<12:
  ready,_,_=select.select([master],[],[],0.1)
  if ready:
   try: data=os.read(master,65536)
   except OSError: data=b''
   output+=data
   if not sent and b'NEXUS_LAB> ' in output:
    os.write(master,(command+'\n').encode())
    sent=True
  done,s=os.waitpid(pid,os.WNOHANG)
  if done:
   status=os.waitstatus_to_exitcode(s)
   break
 if status is None: raise RuntimeError('Isolated Bash did not exit before the 12-second lab deadline')
 print(json.dumps({'elapsedSeconds':round(time.monotonic()-started,3),'exitCode':status,'terminal':output.decode(errors='replace')}))
finally:
 os.close(master)
 if status is None:
  os.kill(pid,signal.SIGKILL)
  os.waitpid(pid,0)
`;
const run = command => {
  const p=spawnSync('/usr/bin/python3',['-c',driver,command],{encoding:'utf8',timeout:16000});
  assert.equal(p.status,0,p.stderr||p.error?.message);return JSON.parse(p.stdout);
};
const idle=run("TMOUT=2; printf 'IDLE_READY\\n'");
assert.match(idle.terminal,/\r?\nIDLE_READY\r?\n/);
assert.match(idle.terminal,/timed out waiting for input|auto-logout/i);
assert.ok(idle.elapsedSeconds>=1.7&&idle.elapsedSeconds<10);
const busy=run("TMOUT=2; printf 'BUSY_START\\n'; sleep 3; printf 'BUSY_FINISHED\\n'");
assert.match(busy.terminal,/\r?\nBUSY_FINISHED\r?\n/);
assert.match(busy.terminal,/timed out waiting for input|auto-logout/i);
assert.ok(busy.elapsedSeconds>=4.7&&busy.elapsedSeconds<12);
const result={checkedAt:new Date().toISOString(),platform:process.platform,bash:spawnSync('/bin/bash',['--version'],{encoding:'utf8'}).stdout.split('\n')[0],localPTY:true,userStartupFiles:false,sshConnection:false,physicalSleep:false,nexusGUI:false,cases:[{name:'idle primary prompt',...idle},{name:'three-second foreground command then idle prompt',...busy}],conclusion:'Bash timed out at the prompt; the three-second command completed before the prompt timeout. This does not test SSH keepalives or server policy.'};
if(process.argv.includes('--record'))fs.writeFileSync(new URL('../docs/fixtures/shell-idle-timeout-result.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));

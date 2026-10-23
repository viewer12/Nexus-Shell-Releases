// Synthetic local-filesystem experiment. No network, personal files or disk changes.
// Run: node examples/mac-filename-case-lab.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const dir=fs.mkdtempSync(path.join(os.tmpdir(),'nexus-filename-case-'));
const hash=data=>createHash('sha256').update(data).digest('hex');
const lower=Buffer.from('lower\n'),upper=Buffer.from('upper\n');
const results=[];
try {
  for(const name of ['exclusive','overwrite','distinct','separate']) fs.mkdirSync(path.join(dir,name));
  const first=path.join(dir,'exclusive','report.txt');
  fs.writeFileSync(first,lower,{flag:'wx'});
  let refused=false;
  try {fs.writeFileSync(path.join(dir,'exclusive','Report.txt'),upper,{flag:'wx'});}
  catch(error){if(error.code!=='EEXIST')throw error;refused=true;}
  const sensitive=!refused;
  const preserved=fs.readFileSync(first).equals(lower);
  assert.ok(preserved);
  results.push({case:'same parent, exclusive creation',secondCreate:refused?'EEXIST':'created',entries:fs.readdirSync(path.join(dir,'exclusive')).length,originalPreserved:preserved});

  fs.writeFileSync(path.join(dir,'overwrite','report.txt'),lower);
  fs.writeFileSync(path.join(dir,'overwrite','Report.txt'),upper);
  const actual=fs.readFileSync(path.join(dir,'overwrite','report.txt'));
  assert.equal(actual.equals(lower),sensitive);
  results.push({case:'same parent, ordinary write',entries:fs.readdirSync(path.join(dir,'overwrite')).length,originalBytes:lower.length,finalBytes:actual.length,originalHash:hash(lower),finalHash:hash(actual),originalPreserved:actual.equals(lower)});

  for(const name of ['report-a.txt','report-b.txt']) fs.writeFileSync(path.join(dir,'distinct',name),name=== 'report-a.txt'?lower:upper,{flag:'wx'});
  assert.equal(fs.readdirSync(path.join(dir,'distinct')).length,2);
  assert.ok(fs.readFileSync(path.join(dir,'distinct','report-a.txt')).equals(lower));
  assert.ok(fs.readFileSync(path.join(dir,'distinct','report-b.txt')).equals(upper));
  results.push({case:'distinct names in one parent',entries:2,bothPreserved:fs.readFileSync(path.join(dir,'distinct','report-a.txt')).equals(lower)&&fs.readFileSync(path.join(dir,'distinct','report-b.txt')).equals(upper)});

  for(const [parent,name,bytes]of [['one','report.txt',lower],['two','Report.txt',upper]]){fs.mkdirSync(path.join(dir,'separate',parent));fs.writeFileSync(path.join(dir,'separate',parent,name),bytes,{flag:'wx'});}
  assert.ok(fs.readFileSync(path.join(dir,'separate','one','report.txt')).equals(lower));
  assert.ok(fs.readFileSync(path.join(dir,'separate','two','Report.txt')).equals(upper));
  results.push({case:'same spelling apart from case, separate parents',entries:2,bothPreserved:true});

  let macOS=null;
  if(process.platform==='darwin')macOS=execFileSync('/usr/bin/sw_vers',['-productVersion'],{encoding:'utf8'}).trim();
  console.log(JSON.stringify({checkedAt:new Date().toISOString(),platform:process.platform,arch:process.arch,macOS,node:process.version,observedCaseSensitive:sensitive,passed:results.length,results,scope:'Fresh temporary directory on this host only; filesystem semantics, not an SFTP, Nexus GUI, archive or Unicode normalization test. No user volume formatted or mounted.'},null,2));
} finally {fs.rmSync(dir,{recursive:true,force:true});}

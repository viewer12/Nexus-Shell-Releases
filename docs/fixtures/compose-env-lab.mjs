// Inspect before running. Requires an existing standalone Docker Compose binary.
// No network, daemon, containers, credentials or production files are used.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const binary=process.env.COMPOSE_BIN;
assert.ok(binary && path.isAbsolute(binary),'Set COMPOSE_BIN to an existing absolute standalone Compose binary path');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'nexus-compose-env-lab-'));
const project=path.join(root,'project'), outside=path.join(root,'other');
const results=[];
// Do not inherit the user's shell variables, Docker contexts or project settings.
const env={PATH:process.env.PATH, TMPDIR:os.tmpdir(), COMPOSE_DISABLE_ENV_FILE:'true'};
function run(args,extra={},cwd=project){const r=spawnSync(binary,args,{cwd,env:{...env,...extra},encoding:'utf8',timeout:15000});if(r.error)throw r.error;return r;}
function config(file='compose.yaml',extra={},cwd=project,envFile=path.join(project,'.env')){
  return run(['--project-directory',project,'--env-file',envFile,'-f',path.join(project,file),'config','--format','json'],extra,cwd);
}
function model(r){assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);}
function pass(name,check){check();results.push(name);}
try{
  fs.mkdirSync(project);fs.mkdirSync(outside);
  fs.writeFileSync(path.join(project,'.env'),'APP_MODE=from-project\nUNMAPPED=not-in-container\n');
  fs.writeFileSync(path.join(project,'prod.env'),'APP_MODE=from-explicit-file\n');
  fs.writeFileSync(path.join(project,'service.env'),'APP_MODE=from-service-file\n');
  fs.writeFileSync(path.join(outside,'.env'),'APP_MODE=wrong-directory\n');
  fs.writeFileSync(path.join(project,'compose.yaml'),'services:\n  app:\n    image: example.invalid/nexus-compose-fixture:never-pulled\n    environment:\n      APP_MODE: ${APP_MODE:?APP_MODE is required}\n');
  fs.writeFileSync(path.join(project,'service-only.yaml'),'services:\n  app:\n    image: example.invalid/nexus-compose-fixture:never-pulled\n    env_file: service.env\n    labels:\n      fixture.mode: ${APP_MODE:?APP_MODE is required}\n');
  fs.writeFileSync(path.join(project,'override.yaml'),'services:\n  app:\n    image: example.invalid/nexus-compose-fixture:never-pulled\n    env_file: service.env\n    environment:\n      APP_MODE: inline-wins\n');
  fs.writeFileSync(path.join(project,'empty.env'),'');
  const version=run(['version','--short']).stdout.trim();
  pass('Explicit project env maps into the service',()=>assert.equal(model(config()).services.app.environment.APP_MODE,'from-project'));
  pass('Unmapped project env does not automatically enter the service',()=>assert.equal(model(config()).services.app.environment.UNMAPPED,undefined));
  pass('Exported shell input wins over the explicit env file',()=>assert.equal(model(config('compose.yaml',{APP_MODE:'from-shell'})).services.app.environment.APP_MODE,'from-shell'));
  pass('Another explicit env file changes interpolation',()=>assert.equal(model(config('compose.yaml',{},project,path.join(project,'prod.env'))).services.app.environment.APP_MODE,'from-explicit-file'));
  pass('Absolute file and project choices survive a different working directory',()=>assert.equal(model(config('compose.yaml',{},outside)).services.app.environment.APP_MODE,'from-project'));
  pass('Service env_file does not supply Compose label interpolation',()=>{const r=config('service-only.yaml',{},project,path.join(project,'empty.env'));assert.notEqual(r.status,0);assert.match(r.stderr,/APP_MODE is required/);});
  pass('Service env_file supplies container model independently of interpolation',()=>{const d=model(config('service-only.yaml'));assert.equal(d.services.app.environment.APP_MODE,'from-service-file');assert.equal(d.services.app.labels['fixture.mode'],'from-project');});
  pass('Inline environment overrides the service env_file',()=>assert.equal(model(config('override.yaml')).services.app.environment.APP_MODE,'inline-wins'));
  pass('Missing required interpolation fails before creating anything',()=>{const r=config('compose.yaml',{},project,path.join(project,'empty.env'));assert.notEqual(r.status,0);assert.match(r.stderr,/APP_MODE is required/);});
  console.log(JSON.stringify({version,passed:results.length,results,scope:'Compose config model only; no daemon, restart, application, VPS or Nexus Shell GUI test'},null,2));
}finally{fs.rmSync(root,{recursive:true,force:true});}

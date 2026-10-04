import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {createSupervisor,validateConfig,recommendCheck} from './engine.mjs';
function fixture(t) {
  const temp=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'jay-background-'));
  const root=path.join(temp,'project');fs.mkdirSync(root);
  const git=args=>execFileSync('git',args,{cwd:root,stdio:'pipe'});
  git(['init']);git(['config','user.email','test@example.invalid']);git(['config','user.name','Test']);
  fs.writeFileSync(path.join(root,'app.js'),'const x = 1;\n');git(['add','.']);git(['commit','-m','fixture']);
  t.after(()=>fs.rmSync(temp,{recursive:true,force:true}));
  const s=createSupervisor({home:path.join(temp,'state')});return {s,root,temp,git};
}
test('install does not grant consent, disabling is durable, limits validate',async t=>{
  const {s,root}=fixture(t);
  assert.equal(s.status(root).config.enabled,false);
  await assert.rejects(s.configure(root,{enabled:true}),/approval/);
  assert.throws(()=>validateConfig({runSeconds:601}));assert.throws(()=>validateConfig({dailyRuns:100}));
  await s.configure(root,{enabled:false});assert.equal(s.status(root).state.setupChoice,'disabled');
  assert.equal((await s.run(root)).skipped,'disabled');
});
test('actual syntax failures, unchanged dedup, local report escaping and review counts',async t=>{
  const {s,root}=fixture(t);await s.configure(root,{enabled:true},true);
  fs.writeFileSync(path.join(root,'app.js'),'const x = ;\n');
  fs.writeFileSync(path.join(root,'bad.json'),'{broken');
  fs.writeFileSync(path.join(root,'view.html'),'<script>alert(1)</script>');
  const r=await s.run(root);assert.equal(r.failed,2);assert.equal(r.deferred,1);assert.equal(r.aiReview,null);
  assert(fs.readFileSync(r.report,'utf8').includes('2 failed'));
  assert(!s.render({...r,checks:[{name:'<script>x</script>',status:'failed',kind:'test'}]}).includes('<script>x'));
  assert.equal((await s.run(root)).skipped,'unchanged');
  await s.review(root);await s.review(root);assert.equal(s.status(root).metrics.reviewed,1);
});
test('symlink source and secret paths are excluded; source cannot opt in',async t=>{
  const {s,root,temp}=fixture(t);
  fs.writeFileSync(path.join(temp,'outside.json'),'{}');fs.symlinkSync(path.join(temp,'outside.json'),path.join(root,'linked.json'));
  fs.writeFileSync(path.join(root,'secret.json'),'{}');fs.mkdirSync(path.join(root,'.carbon'));fs.writeFileSync(path.join(root,'.carbon','settings.json'),'{"enabled":true}');
  const sn=s.snapshot(root);assert.equal(sn.files.length,0);assert.equal(s.status(root).config.enabled,false);
});
test('CommonJS .js and ESM syntax are accepted without executing source',async t=>{
  const {s,root}=fixture(t);await s.configure(root,{enabled:true},true);
  fs.writeFileSync(path.join(root,'app.js'),'return;');fs.writeFileSync(path.join(root,'module.mjs'),'export const value=1;');
  const r=await s.run(root);assert.equal(r.failed,0);assert.equal(r.passed,2);
});
test('global worker lock, daily reservation and global pause apply across projects',async t=>{
  const {s,root,temp}=fixture(t);await s.configure(root,{enabled:true,dailyRuns:1},true);
  fs.writeFileSync(path.join(root,'app.js'),'let changed=2');
  fs.writeFileSync(path.join(temp,'state','worker.lock'),'{}');assert.match((await s.run(root)).skipped,/worker/);fs.unlinkSync(path.join(temp,'state','worker.lock'));
  await s.run(root);assert.equal(s.status(root).global.runs,1);assert.equal(s.status(root).global.seconds,180);
  await s.globalEnabled(false);assert.equal((await s.run(root)).skipped,'disabled');
});
test('foreground activity cancels an executing approved test promptly',async t=>{
  const {s,root}=fixture(t);
  await s.configure(root,{enabled:true,tests:[{label:'Slow isolated test',command:process.execPath,args:['-e','setTimeout(()=>{},20000)'],timeoutSeconds:20}]},true);
  fs.writeFileSync(path.join(root,'app.js'),'let y=2');
  const start=Date.now(),job=s.run(root);await new Promise(r=>setTimeout(r,300));await s.activity(root,'UserPromptSubmit','s1');
  const r=await job;assert.equal(r.status,'partial');assert(Date.now()-start<3000);assert.equal(r.checks.at(-1).status,'deferred');
});
test('test timeout is not a pass and does not change application source',async t=>{
  const {s,root}=fixture(t);await s.configure(root,{enabled:true,tests:[{label:'Timeout',command:process.execPath,args:['-e','setTimeout(()=>{},20000)'],timeoutSeconds:1}]},true);
  const code='let unchanged=2';fs.writeFileSync(path.join(root,'app.js'),code);
  const r=await s.run(root);assert.equal(r.checks.at(-1).status,'deferred');assert.equal(fs.readFileSync(path.join(root,'app.js'),'utf8'),code);
  assert.equal(r.status,'partial');
});
test('hook notifications are once-only and do not continue the idle agent',async t=>{
  const {s,root}=fixture(t);await s.configure(root,{enabled:true},true);fs.writeFileSync(path.join(root,'app.js'),'let z=3');await s.run(root);
  const first=await s.hook({cwd:root,hook_event_name:'UserPromptSubmit',session_id:'x'});
  assert.match(first.hookSpecificOutput.additionalContext,/1 passed/);assert(!first.decision);
  const second=await s.hook({cwd:root,hook_event_name:'UserPromptSubmit',session_id:'x'});assert(!second.hookSpecificOutput.additionalContext.includes('1 passed'));
  assert.deepEqual(await s.hook({cwd:root,hook_event_name:'Stop',stop_hook_active:true}),{});
});
test('24-hour reminders are per thread, once daily, and never authorize a run',async t=>{
  const {root,temp}=fixture(t);let time=Date.now();const s=createSupervisor({home:path.join(temp,'reminder-state'),now:()=>time});
  const hook=(id,prompt='Explain this code')=>s.hook({cwd:root,hook_event_name:'UserPromptSubmit',session_id:id,prompt},'codex');
  assert(!(await hook('a')).hookSpecificOutput.additionalContext.includes('Suggested command'));
  await hook('b');time+=86400001;
  const note=(await hook('a')).hookSpecificOutput.additionalContext;assert(note.includes('Suggested command'));assert(note.includes('do not start testing'));assert.equal(s.status(root).config.enabled,false);
  assert(!(await hook('a')).hookSpecificOutput.additionalContext.includes('Suggested command'));
  assert(!(await hook('b','Run CARBON on this project')).hookSpecificOutput.additionalContext.includes('Suggested command'));
  await s.hook({cwd:root,hook_event_name:'PreToolUse',session_id:'b',tool_name:'Skill',tool_input:{skill:'carbon:carbon'}},'codex');
  assert(!(await hook('b')).hookSpecificOutput.additionalContext.includes('Suggested command'));
  time+=86400001;assert((await hook('a')).hookSpecificOutput.additionalContext.includes('Suggested command'));
  const key=note.match(/thread-invoked .* ([a-f0-9]{32})\./)[1];await s.threadInvoked(root,key);
  time+=1000;assert(!(await hook('a')).hookSpecificOutput.additionalContext.includes('Suggested command'));
  await s.configure(root,{reminders:false});time+=86400001;assert(!(await hook('a')).hookSpecificOutput.additionalContext.includes('Suggested command'));
});
test('contextual recommendations respect edition commands and do not retain user prompt text',async t=>{
  assert.equal(recommendCheck('security',['carbon','carbon-test']).command,'carbon-test');
  assert.equal(recommendCheck('security',['carbon','carbon-test','carbon-security']).command,'carbon-security');
  assert.equal(recommendCheck('accessibility',['carbon','carbon-accessibility']).command,'carbon-accessibility');
  const {root,temp}=fixture(t);let time=Date.now();const s=createSupervisor({home:path.join(temp,'context-state'),now:()=>time,availableCommands:['carbon','carbon-test']});
  await s.hook({cwd:root,hook_event_name:'UserPromptSubmit',session_id:'context',prompt:'Fix authentication for private customer example-unique'},'codex');
  time+=86400001;const note=await s.hook({cwd:root,hook_event_name:'UserPromptSubmit',session_id:'context',prompt:'Hello'},'codex');
  assert.match(note.hookSpecificOutput.additionalContext,/Suggested command: \/carbon-test/);
  assert.match(note.hookSpecificOutput.additionalContext,/authentication/);
  const dir=path.join(s.status(root).dir,'threads');assert(!fs.readFileSync(path.join(dir,fs.readdirSync(dir)[0]),'utf8').includes('example-unique'));
});
test('missing thread ID does not collapse unrelated chats into a global reminder',async t=>{
  const {s,root}=fixture(t);assert.deepEqual(await s.hook({cwd:root,hook_event_name:'UserPromptSubmit'}),{});
  await assert.rejects(s.threadInvoked(root,'guessed'),/current chat key/);
});
test('outcomes are deduplicated and do not count installs or hooks as use',async t=>{
  const {s,root}=fixture(t);await s.outcome(root,'assessment-completed','run1');await s.outcome(root,'assessment-completed','run1');
  const r=await s.outcome(root,'finding-reviewed','finding1');assert.equal(r.completedAssessments,1);assert.equal(r.reviewedFindings,1);assert.equal(r.returnDays,1);
});
test('nested folders share consent, deduplication and pause state',async t=>{
  const {s,root}=fixture(t);const nested=path.join(root,'src');fs.mkdirSync(nested);
  await s.configure(nested,{enabled:true},true);assert.equal(s.status(root).dir,s.status(nested).dir);
  fs.writeFileSync(path.join(root,'app.js'),'let x=9');await s.run(nested);
  assert.equal((await s.run(root)).skipped,'unchanged');
  await s.configure(nested,{enabled:false});assert.equal(s.status(root).config.enabled,false);
  assert.equal(await s.globalEnabled(false),false);assert.equal(await s.globalEnabled(true),true);
});
test('daily budget is shared by distinct projects, not reset by another plugin instance',async t=>{
  const {s,root,temp}=fixture(t);await s.configure(root,{enabled:true,dailyRuns:1},true);
  fs.writeFileSync(path.join(root,'app.js'),'let x=5');await s.run(root);
  const second=path.join(temp,'second');fs.mkdirSync(second);execFileSync('git',['clone',root,second],{stdio:'pipe'});
  const other=createSupervisor({home:path.join(temp,'state')});await other.configure(second,{enabled:true,dailyRuns:1},true);
  fs.writeFileSync(path.join(second,'app.js'),'let y=6');assert.equal((await other.run(second)).skipped,'daily limit');
});
test('worker cancellation during idle consumes no run budget',async t=>{
  const {s,root}=fixture(t);await s.configure(root,{enabled:true,idleSeconds:60},true);
  fs.writeFileSync(path.join(root,'app.js'),'let x=7');
  const work=s.run(root,{idle:true});await new Promise(r=>setTimeout(r,200));await s.globalEnabled(false);
  assert.equal((await work).skipped,'user active or paused');assert.equal(s.status(root).global.runs,0);
});
test('wall-clock budget stops an approved slow command before its own timeout',async t=>{
  const {s,root}=fixture(t);await s.configure(root,{enabled:true,runSeconds:15,tests:[{label:'Budget test',command:process.execPath,args:['-e','setTimeout(()=>{},30000)'],timeoutSeconds:30}]},true);
  fs.writeFileSync(path.join(root,'app.js'),'let x=4');const start=Date.now(),r=await s.run(root);
  assert.equal(r.status,'partial');assert.equal(r.checks.at(-1).status,'deferred');assert(Date.now()-start<19000);assert.equal(s.status(root).global.seconds,15);
});
test('CLI commands work through a symlink and fail closed for malformed input',t=>{
  const {root,temp}=fixture(t),link=path.join(temp,'linked-engine.mjs');
  fs.symlinkSync(new URL('./engine.mjs',import.meta.url).pathname,link);
  const cli=(...args)=>spawnSync(process.execPath,[link,...args],{encoding:'utf8',env:{...process.env,CARBON_BACKGROUND_TEST_HOME:path.join(temp,'cli-state')},timeout:5000});
  assert.equal(JSON.parse(cli('status',root).stdout).config.enabled,false);
  assert.equal(cli('configure',root,'{"enabled":true}').status,1);
  assert.equal(cli('configure',root,'{"enabled":true}','--approved').status,0);
  assert.equal(cli('pause',root).status,0);
  assert.equal(JSON.parse(cli('off-everywhere',root).stdout),false);
  assert.equal(JSON.parse(cli('allow-projects',root).stdout),true);
  assert.equal(cli('configure',root,'{"runSeconds":601}','--approved').status,1);
  assert.equal(cli('invalid',root).status,1);
});
test('deleted source files respect the same bounded snapshot cap',t=>{
  const {s,root,git}=fixture(t);for(let i=0;i<20;i++)fs.writeFileSync(path.join(root,`test${i}.js`),'let x=1');
  git(['add','.']);git(['commit','-m','many files']);for(let i=0;i<20;i++)fs.unlinkSync(path.join(root,`test${i}.js`));
  assert.equal(s.snapshot(root).files.length,12);assert.equal(s.snapshot(root).omitted,8);
});
test('actual Stop hook starts a delayed worker; prompt cancels it without a report',async t=>{
  const {s,root,temp}=fixture(t);await s.configure(root,{enabled:true,idleSeconds:60},true);fs.writeFileSync(path.join(root,'app.js'),'let x=7');
  await s.hook({cwd:root,hook_event_name:'Stop',session_id:'isolated-test'});
  const lock=path.join(temp,'state','worker.lock');
  for(let i=0;i<50&&!fs.existsSync(lock);i++)await new Promise(r=>setTimeout(r,100));
  assert(fs.existsSync(lock),'detached worker actually started');
  await s.hook({cwd:root,hook_event_name:'UserPromptSubmit',session_id:'isolated-test'});
  for(let i=0;i<30&&fs.existsSync(lock);i++)await new Promise(r=>setTimeout(r,100));
  assert(!fs.existsSync(lock),'worker released lock after user prompt');assert.equal(s.status(root).global.runs,0);
  assert(!s.status(root).state.lastReport);
});
test('optional AI source review uses an isolated tool-free bounded child; Codex never invokes it',async t=>{
  const {s,root,temp}=fixture(t),bin=path.join(temp,'bin');fs.mkdirSync(bin);
  const argsFile=path.join(temp,'child.json');
  fs.writeFileSync(path.join(bin,'claude'),`#!${process.execPath}\nimport fs from 'node:fs';let input='';for await(const c of process.stdin)input+=c;fs.writeFileSync(${JSON.stringify(argsFile)},JSON.stringify({args:process.argv.slice(2),input,cwd:process.cwd(),child:process.env.CARBON_BACKGROUND_CHILD}));console.log(JSON.stringify({result:'Synthetic provider review: check the changed boundary.'}));`,{mode:0o700});
  const oldPath=process.env.PATH;process.env.PATH=bin+path.delimiter+oldPath;t.after(()=>process.env.PATH=oldPath);
  await assert.rejects(s.configure(root,{aiReview:true}),/approval/);await s.configure(root,{enabled:true,aiReview:true},true);
  fs.writeFileSync(path.join(root,'app.js'),'let boundary=0');
  const r=await s.run(root,{host:'claude'});assert.equal(r.aiReview.status,'passed');
  const child=JSON.parse(fs.readFileSync(argsFile));assert(child.args.includes('--strict-mcp-config'));assert(child.args.includes('--no-session-persistence'));assert.equal(child.args[child.args.indexOf('--tools')+1],'');assert.equal(child.args[child.args.indexOf('--max-turns')+1],'1');assert.equal(child.child,'1');assert.notEqual(child.cwd,root);assert(child.input.includes('boundary'));assert(!fs.existsSync(child.cwd));
  const {s:codex,root:codexRoot}=fixture(t);await codex.configure(codexRoot,{enabled:true,aiReview:true},true);fs.writeFileSync(path.join(codexRoot,'app.js'),'let other=1');fs.unlinkSync(argsFile);
  assert.equal((await codex.run(codexRoot,{host:'codex'})).aiReview,null);assert(!fs.existsSync(argsFile));
});

// Integration test with the real one-minute minimum delay, not a mocked timer.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createSupervisor} from './engine.mjs';
test('trusted Stop -> real idle delay -> detached worker -> saved report -> next-turn summary', {timeout:75000}, async t=>{
  const tmp=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'carbon-idle-e2e-')),root=path.join(tmp,'project');fs.mkdirSync(root);
  t.after(()=>fs.rmSync(tmp,{recursive:true,force:true}));
  const git=args=>execFileSync('git',args,{cwd:root,stdio:'pipe'});
  git(['init']);git(['config','user.email','test@example.invalid']);git(['config','user.name','Test']);
  fs.writeFileSync(path.join(root,'app.js'),'let x=1');git(['add','.']);git(['commit','-m','synthetic baseline']);
  const s=createSupervisor({home:path.join(tmp,'state')});await s.configure(root,{enabled:true,idleSeconds:60},true);
  fs.writeFileSync(path.join(root,'app.js'),'let broken=;');const start=Date.now();
  await s.hook({cwd:root,session_id:'e2e',hook_event_name:'Stop'},'codex');
  while(!s.status(root).state.lastReport&&Date.now()-start<70000)await new Promise(r=>setTimeout(r,500));
  const state=s.status(root);assert(state.state.lastReport,'worker wrote result');assert(Date.now()-start>=60000,'did not test before configured idle delay');
  const result=JSON.parse(fs.readFileSync(path.join(state.dir,'latest.json')));assert.equal(result.failed,1);assert.equal(state.global.runs,1);
  const note=await s.hook({cwd:root,session_id:'e2e',hook_event_name:'UserPromptSubmit',prompt:'What did you find?'},'codex');assert.match(note.hookSpecificOutput.additionalContext,/1 failed/);
  assert.equal((await s.run(root)).skipped,'unchanged');
});

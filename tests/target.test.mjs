import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {execute} from '../src/cli.mjs';
import {requireTarget} from '../src/target.mjs';
test('empty and state-only folders require a target before creating state',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'carbon-target-'));
 try{
  for(const target of ['', '.', 'current project',root])assert.throws(()=>execute('start',{root,title:'Check',target}),/TARGET_REQUIRED/);
  assert.deepEqual(fs.readdirSync(root),[]);
  fs.mkdirSync(path.join(root,'.carbon'));fs.writeFileSync(path.join(root,'AGENTS.md'),'guidance');
  assert.throws(()=>requireTarget(root,''),/TARGET_REQUIRED/);
  assert.doesNotThrow(()=>requireTarget(root,'https://example.test'));
  assert.doesNotThrow(()=>requireTarget(root,'Review the supplied requirements'));
  fs.writeFileSync(path.join(root,'app.js'),'example');assert.doesNotThrow(()=>requireTarget(root,''));
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

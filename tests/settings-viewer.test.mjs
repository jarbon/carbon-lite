import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {serveSettings} from '../src/settings-viewer.mjs';
import {createSupervisor} from '../background/engine.mjs';
import {readSettings} from '../background/onboarding.mjs';
const plugin=path.resolve(import.meta.dirname,'..');
async function fixture(t){
 const dir=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'carbon-setup-'));
 const root=path.join(dir,'project'),home=path.join(dir,'private');fs.mkdirSync(root);
 let enabled=false;const analytics={enabled:()=>enabled,setEnabled:v=>{enabled=v;}};
 const view=await serveSettings(root,plugin,{home,analytics,ttlMs:60000});
 const url=new URL(view.browserUrl),origin=url.origin,headers={'X-Carbon-Settings-Token':url.hash.slice(1),'Content-Type':'application/json',Origin:origin};
 const read=async()=>(await fetch(origin+'/settings',{headers})).json();
 const save=async(v)=>fetch(origin+'/settings',{method:'POST',headers,body:JSON.stringify(v)});
 t.after(()=>{view.server.closeAllConnections();view.server.close();fs.rmSync(dir,{recursive:true,force:true});});
 return {root,home,origin,headers,view,read,save,supervisor:createSupervisor({home})};
}
test('fresh settings loads current values without enabling tests or acknowledging setup; protected browser target',async t=>{
 const f=await fixture(t),state=await f.read();
 assert.equal(state.background.onboarding.needed,true);assert.equal(state.settings.budgetMinutes,20);
 assert.equal(state.background.aiReview,false);assert.equal(state.background.approvedTestCount,0);
 assert.deepEqual(f.view.openTarget,{type:'browser',url:f.view.browserUrl});
 const html=await(await fetch(f.origin)).text();for(const phrase of ['/carbon-settings','Automatically check my code changes','Only test when I ask','Current saved settings','Save settings'])assert.ok(html.includes(phrase));
 assert.equal((await fetch(f.origin+'/settings')).status,403);
 assert.equal((await fetch(f.origin+'/settings',{headers:{...f.headers,Origin:'https://evil.example'}})).status,403);
 assert.equal((await fetch(f.origin+'/settings',{method:'POST',headers:{...f.headers,Origin:''},body:'{}'})).status,403);
 assert.equal((await fetch(f.origin+'/private')).status,404);
});
test('explicit Save persists manual mode and all preferences; stale saves cannot reenable checks',async t=>{
 const f=await fixture(t),old=await f.read();
 const payload={revision:old.revision,settings:{...old.settings,budgetMinutes:15,maxChecks:12,theme:'light'},mode:'manual',analyticsEnabled:false};
 assert.equal((await f.save(payload)).status,200);
 const state=await f.read();assert.equal(state.settings.budgetMinutes,15);assert.equal(state.settings.theme,'light');assert.equal(state.background.mode,'manual');assert.equal(state.background.onboarding.needed,false);
 assert.equal(f.supervisor.status(f.root).config.enabled,false);
 assert.equal((await f.save({...payload,mode:'automatic'})).status,400);
 assert.equal(f.supervisor.status(f.root).config.enabled,false);
 assert.equal(readSettings(f.root,{home:f.home,edition:'codex-lite'}).mode,'manual');
});
test('automatic choice cannot clear global pause or enable AI review/custom executable tests',async t=>{
 const f=await fixture(t);await f.supervisor.globalEnabled(false);const s=await f.read();
 assert.equal((await f.save({revision:s.revision,settings:s.settings,mode:'automatic',analyticsEnabled:false})).status,200);
 const b=(await f.read()).background;assert.equal(b.globalPaused,true);assert.equal(b.effectiveEnabled,false);assert.equal(b.aiReview,false);assert.equal(b.approvedTestCount,0);
});
test('invalid or expanded settings requests fail without saving or completing onboarding',async t=>{
 const f=await fixture(t),s=await f.read();
 assert.equal((await f.save({revision:s.revision,settings:{...s.settings,maxChecks:10000},mode:'manual',analyticsEnabled:false})).status,400);
 assert.equal((await f.save({revision:s.revision,settings:s.settings,mode:'manual',analyticsEnabled:false,aiReview:true})).status,400);
 const unchanged=await f.read();assert.equal(unchanged.revision,s.revision);assert.equal(unchanged.background.onboarding.needed,true);
});

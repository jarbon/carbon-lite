import {test} from 'node:test';
import assert from 'node:assert/strict';
import {progressSnapshot} from '../src/progress-adapter.mjs';
test('progress adapter retains actual order, failures and private screenshot boundaries',()=>{
 const p={progressId:'progress-123',title:'TestBucks',status:'partial',updatedAt:'2026-11-02T08:00:00Z',steps:[{id:'a',title:'Inspect risk',status:'completed',summary:'Inspected source'},{id:'b',title:'Explore',status:'blocked'}],evidence:[{id:'a',label:'First',safeToShow:true},{id:'secret',label:'Private',safeToShow:false},{id:'b',label:'Latest',safeToShow:true}],risks:[{label:'Browser unavailable',status:'open'}]};
 const r=progressSnapshot(p,{a:'data:image/png;base64,YQ==',secret:'data:image/png;base64,YQ==',b:'data:image/png;base64,Yg=='}).runs[0];
 assert.equal(r.status,'partial');assert.deepEqual(r.pages.map(x=>x.id),['a','b']);assert.equal(r.inspection.pageId,'b');assert.equal(r.checks[1].status,'blocked');assert.equal(r.confidence,undefined);assert.equal(r.findings.length,0);
});
import {planSnapshot} from '../src/plan-adapter.mjs';
test('shared plan preserves authorization gates, deferred checks and estimated timing without invented screenshots',()=>{
 const p={updatedAt:'2026-11-02T08:00:00Z',title:'Plan',status:'planned',timing:{estimatedMinutes:2},strategy:{rationale:'Cart recovery risk'},tests:[{id:'a',title:'Recover',domain:'Functionality',status:'planned'},{id:'b',title:'Deferred',domain:'UI',status:'skipped'}],approvalGates:['Real payment'],exclusions:['Production'],scope:['Local demo'],stopConditions:['Authorization boundary']};
 const r=planSnapshot(p).runs[0];assert.equal(r.checks[0].status,'planned');assert.equal(r.checks[1].status,'deferred');assert.deepEqual(r.pages,[]);assert.equal(r.confidence,undefined);assert.match(r.why,/Estimated 2 minutes/);assert(r.blockers.includes('Approval gate: Real payment'));assert.match(r.history[0].text,/Authorization boundary/);
});

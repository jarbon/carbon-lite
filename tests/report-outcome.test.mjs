import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
const overview=source.slice(source.indexOf('function overview(r)'),source.indexOf('function findings(r)'));
function render(overrides={}) {
  const context={image:v=>typeof v==='string' && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v)?v:'',document:{documentElement:{dataset:{theme:'dark'}}},window:{},images:{jay:''},statuses:['passed','failed','blocked','deferred','planned','running'],esc:v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),pill:s=>`<span>${s}</span>`};
  vm.createContext(context);vm.runInContext(overview,context);
  return context.overview({title:'Focused checkout',current:'Finished',why:'Checkout evidence',status:'completed',checks:[{id:'checkout',title:'Decline recovery',status:'passed',type:'recovery',domain:'Functionality',actual:'Cart retained',evidence:['Browser observation']}],findings:[],pages:[],personas:[],blockers:[],history:[{at:'now',text:'Decline recovery passed. Mobile checkout was not exercised.'},{at:'before',text:'Starting checkout'}],...overrides});
}
test('terminal overview exposes actual latest conclusion and unscored confidence before check counts',()=>{
 const html=render();
 const outcome=html.slice(html.indexOf('<section class="assessment-outcome"'),html.indexOf('What the evidence covers'));
 assert.match(outcome,/<li>Decline recovery passed\.<\/li><li>Mobile checkout was not exercised\.<\/li>/);
 assert.match(outcome,/class="confidence-number"[^>]*>—<\/div>/);
 assert.doesNotMatch(outcome,/Starting checkout|<details>/);
 assert.match(outcome,/Confidence not scored/);
 assert.match(outcome,/selected checks only/);
 assert.doesNotMatch(html,/\/100/);
 assert.match(html,/Executed: 1 of 1 selected checks/);
});
test('outcome does not invent a conclusion or overwrite actual confidence',()=>{
 const noSummary=render({history:[]});assert.match(noSummary,/No assessment summary was recorded/);
 const scored=render({confidence:{score:55,scope:'Decline recovery',rationale:'One observed journey',limitations:['Mobile deferred']}});
 assert.doesNotMatch(scored,/Confidence not scored/);assert.match(scored,/55\/100/);
 assert.doesNotMatch(render({status:'running'}),/class="assessment-outcome"/);
});
test('conclusion text is escaped and partial outcomes retain their boundary',()=>{
 const html=render({status:'partial',history:[{at:'now',text:'<img src=x onerror=alert(1)> More testing needed.'}]});
 assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img src=x/);assert.match(html,/Untested journeys/);
});
test('runner metrics preserve zero failures, proportional bars and observation text',()=>{
 const check=actual=>({checks:[{id:'suite',title:'Suite',status:'passed',type:'positive',domain:'Functionality',actual,evidence:['suite.tap']}]});
 const html=render(check('17 passed, 0 failed; TAP duration 92.400875 ms. Pre-execution update rejected. Suite executed.'));
 assert.match(html,/17 passed \(100\.0%\), 0 failed \(0\.0%\)/);
 assert.match(html,/92\.4/);assert.match(html,/Pre-execution update rejected/);assert.match(html,/Suite executed/);
 assert.doesNotMatch(html,/width:0%/);
 assert.match(render(check('3 passed, 1 failed.')),/width:75%/);
 assert.doesNotMatch(render(check('Expected 17 passed, 0 failed. Not executed.')),/class="result-bar"/);
 assert.doesNotMatch(render(check('0 passed, 0 failed.')),/NaN|Infinity/);
});

test('check attribution shows real non-default agents and escapes their names',()=>{
 const withAgent=agent=>render({checks:[{id:'a',title:'Check',status:'passed',type:'positive',domain:'State',agent,actual:'Observed',evidence:['trace']}]});
 assert.doesNotMatch(withAgent(undefined),/class="check-agent"/);
 assert.doesNotMatch(withAgent('Jay'),/class="check-agent"/);
 assert.doesNotMatch(withAgent('J'),/class="check-agent"/);
 assert.match(withAgent('Recovery worker'),/Agent: Recovery worker/);
 assert.match(withAgent('<worker>'),/Agent: &lt;worker&gt;/);
});

test('screen flows preserve explicit journey order and do not invent missing captures',()=>{
 const html=render({checks:[{id:'flow',title:'Checkout',status:'passed',screenshotPageIds:['cart','menu','missing']}],pages:[{id:'menu',title:'Menu',image:'data:image/png;base64,YQ=='},{id:'cart',title:'Cart',image:'data:image/png;base64,Yg=='}]});
 assert(html.indexOf('Enlarge screen 1: Cart')<html.indexOf('Enlarge screen 2: Menu'));
 assert.match(html,/Capture unavailable/);assert.match(html,/Unrecorded screen/);
 assert.doesNotMatch(render(),/No screen captures recorded/);
 const persona=render({personas:[{role:'Customer',intent:'Buy',journey:'Browse',observation:'Seen',evidence:[],screenshotPageIds:['menu']}],pages:[{id:'menu',title:'Menu',image:'data:image/png;base64,YQ=='}]});
 assert.match(persona,/Enlarge screen 1: Menu/);
});

test('risk analysis stays explicit and escapes evidence',()=>{
 assert.match(render(),/Baseline risk review pending/);
 const html=render({riskAnalyses:[{at:"2026-11-01",summary:"Limited checkout evidence",limitations:["No release verdict"],risks:[{title:"<risk>",priority:"high",consequence:"Lost order",evidence:["<script>"],remaining:"Mobile",next:"Test mobile"}]}]});
 assert.match(html,/Risk analysis/);assert.match(html,/&lt;risk&gt;/);assert.match(html,/&lt;script&gt;/);assert.match(html,/No release verdict/);
});
test('persona profiles preserve unrated history and label evidence-based ratings',()=>{
 const p={id:'shopper',role:'<Shopper>',intent:'Buy a drink',journey:'Cart to order',observation:'Order retained',evidence:['capture.png']};
 const unrated=render({personas:[p]});assert.match(unrated,/Not rated/);assert.doesNotMatch(unrated,/5 out of 5/);assert.match(unrated,/&lt;Shopper&gt;/);assert.match(unrated,/View persona profile/);
 const rated=render({personas:[p],personaReviews:[{personaId:'shopper',overallRating:4,rationale:'Selected flow only',at:'2026-11-01',feedback:[{category:'Persistence',rating:5,observation:'Same order after reload',evidence:['<capture>']}]}]});
 assert.match(rated,/Overall experience: 4 out of 5/);assert.match(rated,/Persistence: 5 out of 5/);assert.match(rated,/&lt;capture&gt;/);assert.match(rated,/Not human research or new execution/);
});

test('inspection panel distinguishes current from historical and escapes source',()=>{const i={kind:'file',target:'app.mjs',lookingFor:'Lost writes',excerpt:'<script>',at:'2026-11-01T00:00:00Z'};assert.match(render({status:'running',inspection:i}),/Inspecting now/);const h=render({inspection:i});assert.match(h,/Last inspected/);assert.match(h,/&lt;script&gt;/);assert.doesNotMatch(h,/inspection-state active/);});

test('live plan uses compact SVG steps with accessible full names and states',()=>{
 const h=render({status:'running',checks:[{title:'Analyze risk',status:'passed'},{title:'Test <cart>',status:'running'},{title:'Report results',status:'planned'}]});
 assert.match(h,/aria-label="Testing plan"/);assert.match(h,/<strong>Risk<\/strong><small>Done/);assert.match(h,/data-task-art="risk"/);
 assert.match(h,/title="Analyze risk — Done"/);assert.match(h,/class="check-strip icon-plan"/);assert.doesNotMatch(h,/plan-number/);
 assert.match(h,/aria-current="step"/);assert.match(h,/<strong>Test &lt;cart&gt;<\/strong><small>Running/);
 assert.match(h,/<strong>Report<\/strong><small>Next/);assert.match(h,/data-task-art="report"/);
 assert(h.indexOf('Analyze risk')<h.indexOf('Report results'));
});
test('latest actual screenshot is prominent even during source inspection',()=>{
 const h=render({status:'running',inspection:{kind:'file',target:'shop.mjs',lookingFor:'risk',at:'2026-11-02'},pages:[{id:'one',title:'Menu',image:'data:image/png;base64,YQ=='},{id:'two',title:'Saved cart',description:'Cart retained after reload',image:'data:image/png;base64,Yg=='},{id:'three',title:'Not captured'}]});
 assert.match(h,/Enlarge latest screen: Saved cart/);assert.match(h,/2 captured/);assert.match(h,/Cart retained after reload/);
 assert(h.indexOf('live-screen-stage')<h.indexOf('inspection-panel'));
 assert.match(h,/Captured evidence, not a live video feed/);
});
test('missing screenshots and paused testing cannot masquerade as live activity',()=>{
 assert.match(render({status:'running'}),/No capture yet/);
 const h=render({status:'waiting',checks:[{title:'Browser',status:'running'}]});
 assert.match(h,/<small>Paused<\/small>/);assert.doesNotMatch(h,/aria-current="step"/);
 assert.match(h,/No capture yet/);assert.doesNotMatch(h,/live-screen-stage is-testing/);assert.doesNotMatch(h,/class="live-screen-image"/);
});

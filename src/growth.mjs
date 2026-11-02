import catalog from "./command-catalog.json" with { type: "json" };
// Presentation only: never starts a run, hides evidence, or transmits project content.
export const firstRunPrompts = {
 change: 'Use CARBON to test my current change. Start with a bounded five-minute pass. Open the live report as a rendered browser page before testing. Exercise the highest-risk behavior, record evidence, and finish with passed, failed and untested scope. Propose a regression test for any verified bug; ask before modifying files.',
 demo: 'Use CARBON to create a fresh disposable TestBucks demo. Open a rendered live report, test one important user journey, show the observed evidence, and propose a regression test. Do not modify an existing project.'
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function firstRunHtml(){return `<section class="panel" aria-label="Start testing"><h2>Your first useful result</h2><p>Choose one, copy the request, and paste it into your coding agent. No settings changes are required for a requested run. These buttons do not execute tests.</p><div class="grid">${Object.entries(firstRunPrompts).map(([id,p])=>`<div><h3>${id==='change'?'Test my current change':'Try the demo'}</h3><p>${id==='change'?'A short, scoped check with real evidence.':'A disposable app—no project needed.'}</p><button type="button" data-copy-request="${esc(p)}">Copy request</button></div>`).join('')}</div><p data-copy-status role="status"></p><p class="muted">Then: inspect the evidence → approve a useful regression test → rerun after a change. Settings below are optional; they do not start testing.</p></section>`;}
export function upgradeFor(run){
 if(!['completed','partial'].includes(run?.status)||!run.checks?.some(c=>['passed','failed'].includes(c.status)))return null;
 const domains=run.checks.map(c=>String(c.domain).toLowerCase());
 if(domains.some(d=>['authorization','access control','access-control'].includes(d)))return {id:'proof',title:'Check a critical rule more deeply',text:'Pro’s /proof workflow can investigate whether supported logic satisfies an explicitly approved property. Suitability, scope and assumptions must be checked first.'};
 if(domains.some(d=>['jira','xray','testrail','integration workflow'].includes(d)))return {id:'team',title:'Bring the evidence into your team’s workflow',text:'Pro adds guarded Jira/Xray and TestRail workflows. Review changes before synchronizing; nothing is uploaded automatically.'};
 return {id:'history',title:'Make this a repeatable quality workflow',text:'Pro adds deeper follow-up investigations and persistent cross-build workflows. All findings and evidence from this free assessment are already included.'};
}
export function upgradeHtml(run){const u=upgradeFor(run);return u?`<aside class="panel pro-ad" data-carbon-upgrade aria-label="CARBON Pro promotion"><div class="pro-ad-top"><small>GO FURTHER · CARBON PRO</small><button type="button" data-dismiss-upgrade aria-label="Dismiss CARBON Pro promotion">×</button></div><div class="pro-ad-grid"><div><span class="pro-ad-count">+${catalog.proAdditional.length}</span><span class="pro-ad-caption">more commands with Pro</span></div><div><h2>You have ${catalog.free.length} commands. Go deeper.</h2><p>Specialist investigations, property proofs, test inventory and quality history.</p><div class="pro-teasers"><span>Security</span><span>AI evaluations</span><span>Property proofs</span></div><a class="pro-cta" href="https://testers.ai/carbon/pro.html?source=report&amp;interest=${u.id}" target="_blank" rel="noopener noreferrer" data-pro-interest>Explore CARBON Pro ↗</a></div></div></aside>`:'';}
export const growthBrowserScript = `
function hideDismissedUpgrade(){try{if(localStorage.getItem('carbon-hide-upgrades')==='1')document.querySelectorAll('[data-carbon-upgrade]').forEach(e=>e.hidden=true)}catch{}}
document.addEventListener('click',async e=>{
 const copy=e.target.closest('[data-copy-request]');if(copy){const p=copy.dataset.copyRequest,status=document.querySelector('[data-copy-status]');try{await navigator.clipboard.writeText(p);if(status)status.textContent='Copied. Paste this into your coding agent to start.'}catch{if(status)status.textContent=p}return;}
 if(e.target.closest('[data-dismiss-upgrade]')){try{localStorage.setItem('carbon-hide-upgrades','1')}catch{}document.querySelectorAll('[data-carbon-upgrade]').forEach(e=>e.hidden=true);}
 if(e.target.closest('[data-pro-interest]')&&typeof carbonRecordInterest==='function')carbonRecordInterest();
});
hideDismissedUpgrade();new MutationObserver(hideDismissedUpgrade).observe(document.querySelector('main')||document.body,{childList:true,subtree:true});
`;

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {Store,settingsSchema} from './store.mjs';
import os from 'node:os';
import {firstRunHtml,growthBrowserScript} from './growth.mjs';

const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CARBON · Welcome & settings</title><style>
:root{color-scheme:dark;font:15px/1.55 system-ui}*{box-sizing:border-box}body{margin:0;background:#101010;color:#eee}main{max-width:920px;margin:auto;padding:24px}h1{font-size:28px;margin:6px 0}h2{font-size:18px;margin:0 0 12px}p{color:#bbb;margin:8px 0}code{color:#fff}section,fieldset{border:1px solid #444;background:#191919;border-radius:12px;margin:18px 0;padding:20px}legend{font-weight:700;padding:0 8px}.eyebrow{letter-spacing:.18em;font-size:11px}.choice{display:flex;gap:14px;padding:16px;border:1px solid #555;border-radius:9px;align-items:flex-start;margin:10px 0;cursor:pointer}.choice:has(:checked){border-color:#eee;background:#282828}.choice input{width:24px;height:24px;flex-shrink:0;accent-color:#ddd}.choice small{display:block;color:#bbb;margin-top:5px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}label{display:block}input:not([type=radio]):not([type=checkbox]),select{display:block;width:100%;padding:10px;margin:6px 0;background:#101010;color:#eee;border:1px solid #666;border-radius:6px}input[type=checkbox]{width:20px;height:20px;vertical-align:middle;accent-color:#ddd}button{font:inherit;padding:11px 18px;border:1px solid #aaa;border-radius:8px;cursor:pointer;background:#eee;color:#111}button.secondary{background:#222;color:#eee}button:disabled{opacity:.5;cursor:wait}:focus-visible{outline:2px solid white;outline-offset:3px}#status,#effective{padding:10px 0}#status{min-height:42px}.actions{display:flex;gap:12px;position:sticky;bottom:0;padding:14px 0;background:#101010}small{color:#aaa}@media(max-width:600px){main{padding:16px}.grid{grid-template-columns:1fr}.choice{padding:12px}h1{font-size:24px}}
</style></head><body><main><header><span class="eyebrow">TESTERS.AI · CARBON</span><h1>Meet Jay. Set up your AI test manager.</h1><p>CARBON helps your coding agent find bugs, test features and regressions, explore important user journeys, and explain what the evidence says about shipping. You stay in charge.</p><p>Come back anytime: <code>/carbon-settings</code> (or <code>$carbon-settings</code> in Codex).</p></header>
<form id="settings"><fieldset disabled id="controls"><legend>How should Jay help?</legend>
<label class="choice"><input type="radio" name="mode" value="automatic"><span><strong>Automatically check my code changes</strong><small>Quick local checks after changes and about two quiet minutes. Not continuous or full coverage. Requires trusted host hooks. No automatic fixes, app launches, new model calls, or dependency installs.</small></span></label>
<label class="choice"><input type="radio" name="mode" value="manual"><span><strong>Only test when I ask</strong><small>Pause automatic checks for this project. Use /carbon, /carbon-test, or talk to Jay whenever you want testing.</small></span></label><div id="effective" role="status"></div>
<section><h2>Your current testing preferences</h2><p>These guide requested testing. Background limits are enforced separately.</p><div class="grid">
<label>Budget per requested run (minutes)<input type="number" name="budgetMinutes" min="5" max="120" required></label>
<label>Maximum selected checks<input type="number" name="maxChecks" min="5" max="200" required></label>
<label>Stateful + exploratory effort (%)<input type="number" name="explorationPercent" min="50" max="90" required></label>
<label>Business-risk weight (%)<input type="number" name="businessWeight" min="0" max="100" required></label>
<label>Appearance<select name="theme"><option>dark</option><option>light</option><option>system</option></select></label>
<label>Motion<select name="motion"><option>system</option><option>reduced</option></select></label></div>
<label><input type="checkbox" name="askHuman"> Gather optional human questions</label></section>
<section><h2>Privacy & usage</h2><label><input type="checkbox" name="analyticsEnabled"> Share anonymous, content-free usage events</label><p>No prompts, code, URLs, screenshots, credentials or report content in these events. Off by default in this edition. Your coding-agent provider and test targets still have their own data flows.</p><label><input type="checkbox" name="funnelAnalyticsEnabled"> Also share first-completion and return-on-another-day milestones</label><p>Separate opt-in; requires usage analytics. Fixed aggregate events only, no stable identity or project content. Counts are not unique people.</p><small id="analytics-note"></small></section>
<section><h2>What happens next?</h2><p>Save your choices, then run <code>/carbon</code> for a risk-based pass, <code>/carbon-test</code> for a specific feature, or <code>/jay</code> to discuss what needs testing. If the target is unclear, Jay asks for a URL, folder, app or API. Settings alone do not start a test run.</p><p id="project"></p></section>
</fieldset><div class="actions"><button id="save" disabled>Save settings</button><button type="button" class="secondary" id="reload">Reload saved settings</button></div><div id="status" role="status" aria-live="polite">Loading your saved settings…</div></form></main>
<script>const token=location.hash.slice(1)||sessionStorage.getItem('carbon-settings-token')||'';if(token)sessionStorage.setItem('carbon-settings-token',token);history.replaceState(null,'',location.pathname);const f=document.querySelector('form'),status=document.querySelector('#status');let revision;async function api(method='GET',body){const r=await fetch('/settings',{method,headers:{'X-Carbon-Settings-Token':token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const v=await r.json();if(!r.ok)throw Error(v.error||'Settings unavailable');return v}function display(v){revision=v.revision;for(const [k,value]of Object.entries(v.settings)){const el=f.elements.namedItem(k);if(el)el.type==='checkbox'?el.checked=value:el.value=value}f.elements.namedItem('mode').value=v.background.mode;f.elements.namedItem('analyticsEnabled').checked=v.analyticsEnabled;f.elements.namedItem('funnelAnalyticsEnabled').checked=v.funnelAnalyticsEnabled;const auto=f.querySelector('[value=automatic]');auto.disabled=v.background.supported===false;if(auto.disabled)auto.closest('label').hidden=true;document.querySelector('#effective').textContent=(v.background.effectiveEnabled?'Automatic quick checks are enabled where trusted hooks are available.':'Automatic checks are not active.')+' Limits: '+v.background.runSeconds+' seconds/run; '+v.background.dailyRuns+' runs and '+v.background.dailySeconds+' reserved seconds/day.'+(v.background.globalPaused?' A global pause is active and will not be cleared here.':'')+(v.background.envDisabled?' CARBON_BACKGROUND=off is active and will not be cleared here.':'');document.querySelector('#analytics-note').textContent='A global privacy preference or environment opt-out can keep analytics disabled.';document.querySelector('#project').textContent='Settings for: '+v.root;document.querySelector('#controls').disabled=false;document.querySelector('#save').disabled=false}async function load(){try{display(await api());status.textContent='Current saved settings loaded. Nothing has started.'}catch(e){status.textContent=e.message}}document.querySelector('#reload').onclick=load;f.onsubmit=async e=>{e.preventDefault();document.querySelector('#save').disabled=true;const settings={};for(const k of ['budgetMinutes','maxChecks','explorationPercent','businessWeight'])settings[k]=Number(f.elements.namedItem(k).value);for(const k of ['theme','motion'])settings[k]=f.elements.namedItem(k).value;settings.askHuman=f.elements.namedItem('askHuman').checked;try{display(await api('POST',{revision,settings,mode:f.elements.namedItem('mode').value,analyticsEnabled:f.elements.namedItem('analyticsEnabled').checked,funnelAnalyticsEnabled:f.elements.namedItem('funnelAnalyticsEnabled').checked}));status.textContent='Saved. Your choices will be used by Jay. No test run was started.'}catch(e){status.textContent=e.message;document.querySelector('#save').disabled=false}};load();</script></body></html>`;

export async function serveSettings(rootValue, plugin, {ttlMs=30*60_000,home,analytics,privacyHome=os.homedir()}={}) {
  const root=fs.realpathSync(rootValue);
  if(!fs.statSync(root).isDirectory()||root===path.parse(root).root)throw Error('Choose a project folder');
  const store=new Store(path.join(root,'.carbon/studio-lite'));
  const hooksAvailable=fs.existsSync(path.join(plugin,'hooks/codex.json'));
  const onboarding=await import(pathToFileURL(path.join(plugin,'background/onboarding.mjs')).href);
  const options={home,edition:'codex-lite'};
  analytics??=(await import(pathToFileURL(path.join(plugin,'scripts/usage-analytics.mjs')).href)).usage();
  const configFile=path.join(privacyHome,'.config/carbon/config.json');
  const privacy=()=>{try{return JSON.parse(fs.readFileSync(configFile,'utf8'))}catch{return {}}};
  const read=()=>{const s=store.snapshot(),bg=onboarding.readSettings(root,options);return {root,revision:s.revision,settings:s.settings,background:hooksAvailable?bg:{...bg,mode:'manual',effectiveEnabled:false,supported:false},analyticsEnabled:analytics.enabled(),funnelAnalyticsEnabled:privacy().funnelAnalyticsEnabled===true};};
  read(); // Validate the project and preference state before exposing the viewer.
  const token=crypto.randomBytes(32).toString('base64url');let origin;
  const server=http.createServer(async(req,res)=>{
    res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');
    const reply=(code,value)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(JSON.stringify(value));};
    if(req.headers.host!==new URL(origin).host||(req.headers.origin&&req.headers.origin!==origin))return reply(403,{error:'Invalid origin'});
    if(req.url==='/'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"});return res.end(page.replace('<form id="settings">',firstRunHtml()+'<form id="settings">').replace('</body>',`<script>${growthBrowserScript}</script></body>`));}
    if(req.url!=='/settings')return reply(404,{error:'Not found'});
    const supplied=String(req.headers['x-carbon-settings-token']||'');
    if(Buffer.byteLength(supplied)!==Buffer.byteLength(token)||!crypto.timingSafeEqual(Buffer.from(supplied),Buffer.from(token)))return reply(403,{error:'Reopen Settings from CARBON'});
    try {
      if(req.method==='GET')return reply(200,read());
      if(req.method!=='POST')return reply(405,{error:'Read or save settings only'});
      if(req.headers.origin!==origin||!String(req.headers['content-type']).startsWith('application/json'))return reply(403,{error:'Same-origin JSON required'});
      let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>16000)throw Error('Request too large');}
      const v=JSON.parse(body);
      if(!v||Object.keys(v).some(k=>!['revision','settings','mode','analyticsEnabled','funnelAnalyticsEnabled'].includes(k))||!Number.isInteger(v.revision)||typeof v.analyticsEnabled!=='boolean'||('funnelAnalyticsEnabled' in v&&typeof v.funnelAnalyticsEnabled!=='boolean')||!['automatic','manual'].includes(v.mode))throw Error('Invalid settings request');
      if(!hooksAvailable&&v.mode==='automatic')throw Error('This marketplace package installs no automatic hooks. Choose manual testing.');
      const settings=settingsSchema.parse(v.settings);
      store.settings(settings,v.revision);
      // The explicit Save click approves only this mode, not AI review or executable commands.
      await onboarding.saveMode(root,v.mode,{...options,acknowledge:true});
      if(v.analyticsEnabled!==analytics.enabled())analytics.setEnabled(v.analyticsEnabled);
      if('funnelAnalyticsEnabled' in v){fs.mkdirSync(path.dirname(configFile),{recursive:true,mode:0o700});fs.writeFileSync(configFile,JSON.stringify({...privacy(),funnelAnalyticsEnabled:v.funnelAnalyticsEnabled}),{mode:0o600});}
      return reply(200,read());
    }catch(e){return reply(400,{error:'Save not completed: '+e.message+'. Reload saved settings before retrying.'});}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  origin='http://127.0.0.1:'+server.address().port;
  const timer=setTimeout(()=>server.close(),ttlMs);server.on('close',()=>clearTimeout(timer));
  const browserUrl=origin+'/#'+token;
  return {server,browserUrl,openTarget:{type:'browser',url:browserUrl},placement:'right',expiresInSeconds:ttlMs/1000};
}

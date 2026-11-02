import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { serveReport } from '../src/report-viewer.mjs';
test('protected rendered browser target serves only the exact report, read-only', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'carbon-view-'));
  const file = path.join(dir, 'index.html');
  fs.writeFileSync(file, '<!doctype html><h1>Rendered CARBON evidence</h1>');
  fs.writeFileSync(path.join(dir, 'secret.txt'), 'private');
  const view = await serveReport(file, { ttlMs: 10_000 });
  t.after(() => { view.server.closeAllConnections(); view.server.close(); fs.rmSync(dir, { recursive: true, force: true }); });
  assert.deepEqual(view.openTarget, { type: 'browser', url: view.browserUrl });
  assert.equal(view.placement, 'right');
  const url = new URL(view.browserUrl), base = url.origin;
  const headers = { 'X-Carbon-Report-Token': url.hash.slice(1) };
  const shell = await fetch(base);
  assert.match(shell.headers.get('content-type'), /text\/html/);
  const body = await shell.text();
  const sandbox=body.match(/sandbox="([^"]+)"/)[1].split(' ');
  assert.deepEqual(sandbox,['allow-scripts','allow-downloads','allow-popups','allow-popups-to-escape-sandbox']);
  assert(!sandbox.includes('allow-same-origin'));
  assert(body.includes("frame.srcdoc=html"));
  assert(!body.includes('createObjectURL'));
  assert(!body.includes('Rendered CARBON evidence'));
  assert.equal((await fetch(base + '/report')).status, 403);
  assert.equal((await fetch(base + '/report', { headers: { ...headers, Origin: 'https://evil.example' } })).status, 403);
  assert.equal((await fetch(base + '/report', { method: 'POST', headers })).status, 405);
  assert.equal((await fetch(base + '/secret.txt', { headers })).status, 404);
  const report = await fetch(base + '/report', { headers });
  assert.equal(report.status, 200);
  assert.match(report.headers.get('content-type'), /text\/html/);
  assert.match(await report.text(), /Rendered CARBON/);
  fs.unlinkSync(file); fs.symlinkSync(path.join(dir, 'secret.txt'), file);
  assert.equal((await fetch(base + '/report', { headers })).status, 410);
});
test('viewer lifetime is bounded', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'carbon-expiry-'));
  const file = path.join(dir, 'index.html'); fs.writeFileSync(file, 'ok');
  try { const { server } = await serveReport(file, { ttlMs: 20 }); await new Promise(resolve => server.once('close', resolve)); assert.equal(server.listening, false); }
  finally { fs.rmSync(dir, { recursive: true, force: true }); }
});


test('live viewer delivers changed evidence without replacing the report or draft', async t => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'carbon-live-view-'));
  const file=path.join(dir,'index.html');
  const report=revision=>`<script>window.CARBON_DATA={"revision":${revision}};window.CARBON_IMAGES={};</script>`;
  fs.writeFileSync(file,report(1));
  const view=await serveReport(file,{ttlMs:10000});
  t.after(()=>{view.server.closeAllConnections();view.server.close();fs.rmSync(dir,{recursive:true,force:true});});
  const shell=await (await fetch(view.browserUrl)).text();
  const script=shell.match(/<script>([\s\S]*)<\/script>/)[1];
  const listeners={},messages=[],status={textContent:''},reload={};let intervals=[],loads=0,html='';
  const frame={contentWindow:{postMessage:m=>messages.push(m)},set srcdoc(value){loads++;html=value;},get srcdoc(){return html;}};
  const context={location:new URL(view.browserUrl),fetch:(p,o)=>fetch(new URL(p,view.browserUrl),o),DOMParser:class{parseFromString(s){return {scripts:[{textContent:s.replace(/^<script>|<\/script>$/g,'')}]};}},document:{hidden:false,querySelector:s=>s==='iframe'?frame:s==='#status'?status:reload,addEventListener(){}},window:{addEventListener:(name,fn)=>listeners[name]=fn},setInterval:fn=>intervals.push(fn),Date};
  vm.runInNewContext(script,context);
  for(let i=0;i<30&&!loads;i++)await new Promise(r=>setTimeout(r,5));
  assert.equal(loads,1);
  listeners.message({source:frame.contentWindow,data:{type:'carbon-live-ready'}});
  assert.equal(messages.at(-1).snapshot.revision,1);
  fs.writeFileSync(file,report(2));
  intervals[0]();
  for(let i=0;i<30&&messages.at(-1).snapshot.revision!==2;i++)await new Promise(r=>setTimeout(r,5));
  assert.equal(messages.at(-1).snapshot.revision,2);
  assert.equal(loads,1,'updates must not reload iframe and discard UI state');
  listeners.message({source:frame.contentWindow,data:{type:'carbon-live-status',paused:true}});
  assert.match(status.textContent,/paused/);
  listeners.message({source:{},data:{type:'carbon-live-status',paused:false}});
  assert.match(status.textContent,/paused/,'ignore unrelated frames');
  fs.unlinkSync(file);intervals[0]();
  for(let i=0;i<30&&!status.textContent.includes('unavailable');i++)await new Promise(r=>setTimeout(r,5));
  assert.match(status.textContent,/last evidence retained/);assert.equal(loads,1);
});

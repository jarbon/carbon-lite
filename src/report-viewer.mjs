import fs from 'node:fs';
import http from 'node:http';
import crypto from 'node:crypto';
import { fork } from 'node:child_process';

// An explicit, temporary presentation surface, not an installed MCP server.
export async function serveReport(file, { ttlMs = 30 * 60_000 } = {}) {
  const exact = fs.realpathSync(file);
  if (fs.lstatSync(file).isSymbolicLink() || !fs.statSync(exact).isFile()) throw Error('Expected a regular report file.');
  const token = crypto.randomBytes(32).toString('base64url');
  let origin;
  const server = http.createServer((req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    if (req.headers.host !== new URL(origin).host || (req.headers.origin && req.headers.origin !== origin)) { res.writeHead(403); return res.end(); }
    if (req.method !== 'GET') { res.writeHead(405); return res.end(); }
    if (req.url === '/') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'self'; frame-src 'self' about:; base-uri 'none'; frame-ancestors 'none'");
      return res.end(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CARBON live report</title><style>body{margin:0;background:#111;color:#eee;font:14px system-ui}#status:not([hidden]){padding:8px;background:#332b1c}iframe{display:block;border:0;width:100%;height:100vh}body:has(#status:not([hidden])) iframe{height:calc(100vh - 48px)}</style></head><body><div id="status" role="status" hidden></div><iframe title="CARBON report" sandbox="allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox"></iframe><script>
const token=location.hash.slice(1),frame=document.querySelector('iframe'),status=document.querySelector('#status');
let lastHtml='',latest=null,busy=false,ready=false;
function deliver(){if(ready&&latest)frame.contentWindow.postMessage({type:'carbon-live-snapshot',snapshot:latest},'*');}
function snapshot(html){const doc=new DOMParser().parseFromString(html,'text/html');for(const script of doc.scripts){const text=script.textContent,start=text.indexOf('window.CARBON_DATA=');if(start<0)continue;const end=text.indexOf(';window.CARBON_IMAGES=',start);if(end>start)return JSON.parse(text.slice(start+'window.CARBON_DATA='.length,end));}return null;}
window.addEventListener('message',event=>{if(event.source!==frame.contentWindow)return;if(event.data?.type==='carbon-copy-prompt'){const {id,text}=event.data;if(typeof id!=='string'||typeof text!=='string'||text.length>200000||!navigator.userActivation?.isActive){frame.contentWindow.postMessage({type:'carbon-copy-result',id,ok:false},'*');return;}navigator.clipboard.writeText(text).then(()=>frame.contentWindow.postMessage({type:'carbon-copy-result',id,ok:true},'*'),()=>frame.contentWindow.postMessage({type:'carbon-copy-result',id,ok:false},'*'));return;}if(event.data?.type==='carbon-live-ready'){ready=true;deliver();}if(event.data?.type==='carbon-live-status'){status.hidden=!event.data.paused;status.textContent=event.data.paused?'Live updates paused · finish or discard your feedback draft':'';}});
async function load(){if(busy)return;busy=true;try{const r=await fetch('/report',{headers:{'X-Carbon-Report-Token':token}});if(!r.ok)throw Error();const html=await r.text();status.hidden=true;if(html!==lastHtml){latest=snapshot(html);if(!lastHtml){frame.srcdoc=html;}else if(latest){deliver();}else{frame.srcdoc=html;}lastHtml=html;}else{deliver();}}catch{status.hidden=false;status.textContent='Connection unavailable · last evidence retained. Ask Jay to reopen the report.';}finally{busy=false;}}
setInterval(()=>{if(!document.hidden)load();},2000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)load();});load();
</script></body></html>`);
    }
    if (req.url !== '/report') { res.writeHead(404); return res.end(); }
    const supplied = String(req.headers['x-carbon-report-token'] || '');
    if (Buffer.byteLength(supplied) !== Buffer.byteLength(token) || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(token))) { res.writeHead(403); return res.end(); }
    try {
      // No directory serving, path parameters, or symlink-following on refresh.
      if (fs.realpathSync(file) !== exact || fs.lstatSync(file).isSymbolicLink()) throw Error('Report moved');
      const fd = fs.openSync(exact, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
      let html;
      try { if (fs.fstatSync(fd).size > 64_000_000) throw Error('Report too large'); html = fs.readFileSync(fd); } finally { fs.closeSync(fd); }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(html);
    } catch { res.writeHead(410); res.end('Report unavailable. Reopen it from CARBON.'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  origin = `http://127.0.0.1:${server.address().port}`;
  const timer = setTimeout(() => server.close(), ttlMs);
  server.once('close', () => clearTimeout(timer));
  const browserUrl = `${origin}/#${token}`;
  return { server, browserUrl, openTarget: { type: 'browser', url: browserUrl }, placement: 'right', expiresInSeconds: ttlMs / 1000 };
}

export function launchReportViewer(file, script) {
  return new Promise((resolve, reject) => {
    const child = fork(script, [file], { detached: true, execArgv: [], stdio: ['ignore', 'ignore', 'ignore', 'ipc'] });
    const timer = setTimeout(() => { child.kill(); reject(Error('Report viewer startup timed out.')); }, 5000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('exit', code => { clearTimeout(timer); reject(Error(`Report viewer exited (${code}).`)); });
    child.once('message', message => { clearTimeout(timer); child.disconnect(); child.unref(); if (message.error) reject(Error(message.error)); else resolve(message); });
  });
}

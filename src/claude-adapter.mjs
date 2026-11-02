// Host transport only. Codex and Claude use the same report renderer.
const list = value => Array.isArray(value) ? value : value ? [String(value)] : [];
export function claudeSnapshot(s) {
  const pages = s.pages || [];
  const history = (s.history || []).map(h => ({at:h.at,text:h.text || [h.current,h.why].filter(Boolean).join('. ')})).reverse();
  if (s.summary) history.unshift({at:s.updatedAt,text:s.summary});
  return {revision:Date.parse(s.updatedAt)||0,settings:{theme:'dark',motion:'system',budgetMinutes:s.settings?.minutes||20,maxChecks:s.settings?.maxChecks||20},steering:[],runs:[{
    ...s,checks:(s.checks||[]).map(c=>({...c,evidence:list(c.evidence),screenshotPageIds:c.screenshotPageIds || pages.filter(p=>p.id===c.page||p.url===c.page).map(p=>p.id)})),
    findings:(s.findings||[]).map(f=>({...f,steps:list(f.steps),evidence:list(f.evidence)})),pages,
    personas:(s.personas||[]).map((p,i)=>({...p,id:p.id||'persona-'+i,role:p.role||p.specialist||'AI persona',observation:p.observation||p.reaction||'',evidence:list(p.evidence)})),
    blockers:s.blockers||[],history,
    confidence:s.confidence?{...s.confidence,limitations:list(s.confidence.limitations)}:undefined,
    inspection:s.inspection
  }]};
}

export function connectClaude(client) {
  const browser=location.protocol==='http:'&&location.hostname==='127.0.0.1';
  const session=new URLSearchParams(location.search).get('session');
  let args=null,busy=false,last='',sequence=0,stopped=false;
  const pending=new Map();
  function request(method,params) {
    return new Promise((resolve,reject)=>{
      const id='carbon-'+(++sequence),timeout=setTimeout(()=>{pending.delete(id);reject(Error('Host response timed out'));},10000);
      pending.set(id,{resolve,reject,timeout});window.parent.postMessage({jsonrpc:'2.0',id,method,params},'*');
    });
  }
  const parse=r=>r?.structuredContent || JSON.parse(r?.content?.find(c=>c.type==='text')?.text||'null');
  const receive=data=>{if(data?.root&&data?.runId)args={root:data.root,runId:data.runId};if(data?.state?.pages)client.accept(claudeSnapshot(data.state));};
  window.addEventListener('message',event=>{
    if(event.source!==window.parent||event.data?.jsonrpc!=='2.0')return;
    const m=event.data,p=pending.get(m.id);
    if(p){clearTimeout(p.timeout);pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);return;}
    if(m.method==='ui/notifications/tool-result'){try{receive(parse(m.params));refresh();}catch{client.error('Could not read host evidence.');}}
    if(m.method==='ui/resource-teardown'){stopped=true;window.parent.postMessage({jsonrpc:'2.0',id:m.id,result:{}},'*');}
  });
  async function local(route) {
    const response=await fetch(route+'?session='+encodeURIComponent(session||'')+'&includeImages=true',{headers:{Authorization:'Bearer '+location.hash.slice(1)},cache:'no-store',signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw Error('Local report connection unavailable');return response.json();
  }
  async function refresh() {
    if(stopped||busy||document.hidden)return;busy=true;
    try {
      const result=browser?await local('/state'):args?parse(await request('tools/call',{name:'carbon_status',arguments:{...args,includeImages:true}})):null;
      if(result?.state){const signature=JSON.stringify(result.state);if(signature!==last&&client.accept(claudeSnapshot(result.state)))last=signature;}
    }catch(e){client.error(e.message+'. Last captured evidence retained.');}finally{busy=false;}
  }
  window.CARBON_HOST.openSettings=async()=>{
    try {
      const result=browser?await local('/settings-link'):parse(await request('tools/call',{name:'carbon_settings',arguments:{root:args.root}}));
      if(browser)location.assign(result.url);else await request('ui/open-link',{url:result.url});
    }catch(e){client.error('Open /carbon:carbon-settings in your agent. '+e.message);}
  };
  if(browser){refresh();}
  else request('ui/initialize',{protocolVersion:'2026-01-26',appInfo:{name:'CARBON',version:'1.0.0'},appCapabilities:{availableDisplayModes:['inline','fullscreen']}})
    .then(()=>{
      window.parent.postMessage({jsonrpc:'2.0',method:'ui/notifications/initialized',params:{}},'*');
      new ResizeObserver(()=>window.parent.postMessage({jsonrpc:'2.0',method:'ui/notifications/size-changed',params:{height:document.documentElement.scrollHeight}},'*')).observe(document.body);
    }).catch(()=>client.error('Waiting for the host connection.'));
  setInterval(refresh,1500);
}

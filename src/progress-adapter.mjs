// Translate the command ledger into the same evidence-qualified view as Lite/Studio.
export function progressSnapshot(p, images = {}) {
  const status={completed:'passed',skipped:'deferred',blocked:'blocked',failed:'failed',running:'running',planned:'planned'};
  const pages=(p.evidence||[]).filter(e=>e.safeToShow && images[e.id]).map(e=>({id:e.id,title:e.label,description:e.detail||'',url:'',image:images[e.id]}));
  return {revision:Date.parse(p.updatedAt)||0,settings:{theme:'dark',motion:'system'},steering:[],runs:[{
    workflowOnly:true,id:p.progressId,title:p.title,target:p.scope,status:p.status==='failed'?'partial':p.status,
    createdAt:p.createdAt,updatedAt:p.updatedAt,current:p.phase,why:p.reason,
    checks:(p.steps||[]).map(s=>({id:s.id,title:s.title,domain:'Workflow',type:'exploratory',status:status[s.status]||'planned',expected:s.why||s.detail||'',actual:s.summary||'',evidence:s.summary?[s.summary]:[]})),
    findings:[],pages,history:p.summary?[{at:p.updatedAt,text:p.summary}]:[],
    blockers:(p.risks||[]).filter(r=>r.status!=='mitigated').map(r=>r.label+(r.detail?': '+r.detail:'')),
    inspection:pages.length?{at:p.updatedAt,kind:'screen',target:pages.at(-1).title,pageId:pages.at(-1).id,lookingFor:pages.at(-1).description}:undefined
  }]};
}
export function connectProgress(client) {
  const token=location.hash.slice(1), images={}; let busy=false,last='';
  async function refresh() {
    if(busy || document.hidden)return; busy=true;
    try {
      const response=await fetch('/api/command-progress',{headers:{'X-Carbon-Command-Token':token},signal:AbortSignal.timeout(10000)});
      if(!response.ok)throw Error('Live command connection unavailable.');
      const {progress:p}=await response.json();
      if(!p)return;
      const signature=JSON.stringify(p);if(signature===last)return;
      for(const e of p.evidence||[]) {
        if(!e.safeToShow || !e.imagePath)continue;
        const response=await fetch('/api/command-evidence/'+encodeURIComponent(e.id),{headers:{'X-Carbon-Command-Token':token}});
        if(!response.ok)continue;
        const blob=await response.blob();
        if(!/^image\/(png|jpeg|webp)$/.test(blob.type))continue;
        images[e.id]=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob);});
      }
      if(client.accept(progressSnapshot(p,images)))last=signature;
    }catch(error){client.error(error.message+' Last captured evidence is retained.');}
    finally{busy=false;}
  }
  refresh();setInterval(refresh,1000);
}

export function planSnapshot(p) {
  return {revision:Date.parse(p.updatedAt)||0,settings:{theme:'dark'},steering:[],runs:[{
    id:p.runId||'execution-plan',title:p.title,target:p.target,status:p.status,current:p.tests.find(t=>t.status==='running')?.title||`${p.tests.length} selected checks · ${p.status}`,
    why:`Estimated ${p.timing.estimatedMinutes} minutes. ${p.strategy.rationale||''}`,updatedAt:p.updatedAt,
    checks:p.tests.map(t=>({id:t.id,title:t.title,type:'exploratory',domain:t.domain,status:t.status==='skipped'?'deferred':t.status,expected:t.reason||'',actual:t.actual||'',evidence:t.actual?[t.actual]:[]})),
    findings:[],pages:[],blockers:[...(p.approvalGates||[]).map(x=>'Approval gate: '+x),...(p.exclusions||[]).map(x=>'Excluded: '+x),...(p.qualityConfidence?.coverageMissing||[])],
    history:[{at:p.updatedAt,text:[...(p.scope||[]),...(p.stopConditions||[]).map(x=>'Stop condition: '+x),p.candidatePool?.reason||''].filter(Boolean).join('. ')}]
  }]};
}
export function connectPlan(client) {
  const token=location.hash.slice(1);let busy=false,last='';
  async function refresh(){
    if(busy||document.hidden)return;busy=true;
    try{
      const response=await fetch('/api/execution-plan',{headers:{'X-Carbon-Settings-Token':token},signal:AbortSignal.timeout(10000)});
      const data=await response.json();if(!response.ok||!data.ok)throw Error('Execution plan connection unavailable.');
      const signature=JSON.stringify(data.plan);if(signature!==last&&client.accept(planSnapshot(data.plan)))last=signature;
    }catch(error){client.error(error.message+' Last evidence retained.');}finally{busy=false;}
  }
  refresh();setInterval(refresh,1000);
}

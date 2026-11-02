// Opt-in aggregate milestones. No installation ID or run identifier is transmitted.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash,randomUUID} from 'node:crypto';
export function createFunnel({home=os.homedir(),env=process.env,clock=Date.now,usage,edition='free'}={}){
 const dir=path.join(home,'.config/carbon/funnel',edition),file=path.join(dir,'milestones.json');
 const read=(f)=>{try{return JSON.parse(fs.readFileSync(f,'utf8'))}catch{return {}}};
 const enabled=()=>read(path.join(home,'.config/carbon/config.json')).funnelAnalyticsEnabled===true&&usage.enabled()&&!/^(1|true|yes|on)$/i.test(env.DO_NOT_TRACK||'')&&!/^(0|false|no|off)$/i.test(env.CARBON_ANALYTICS||'');
 async function record(kind,key=''){
  try{
   if(!enabled())return;
   if(kind==='interest'){await usage.record('Pro Interest');return;}
   if(kind!=='completed'||!key)return;
   fs.mkdirSync(dir,{recursive:true,mode:0o700});
   const lock=file+'.lock';let fd;try{fd=fs.openSync(lock,'wx',0o600)}catch{return;}
   try{
    const s=read(file),day=new Date(clock()).toISOString().slice(0,10),id=createHash('sha256').update(key).digest('hex');
    if(s.seen?.includes(id))return;
    const first=!s.firstDay,repeat=!first&&!s.returned&&day>s.firstDay;
    s.firstDay??=day;s.returned||=repeat;s.seen=[...(s.seen||[]),id].slice(-1000);
    const temp=file+'.'+randomUUID();fs.writeFileSync(temp,JSON.stringify(s),{mode:0o600});fs.renameSync(temp,file);
    if(first)await usage.record('First Completed Run','','funnel-first-completion');
    if(repeat)await usage.record('Return On Another Day','','funnel-return-day');
   }finally{fs.closeSync(fd);fs.unlinkSync(lock);}
  }catch{/* Measurement must never block evidence. */}
 }
 function clear(){try{fs.unlinkSync(file)}catch{}}
 return {record,enabled,clear};
}

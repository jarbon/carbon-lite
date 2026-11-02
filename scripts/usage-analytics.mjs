// Optional, content-free usage events. No account or stable user identifier.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash, randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {buildFathomEventUrl, sendFathomRequest, normalizeAnalyticsCommand} from './fathom-analytics.mjs';
const read = (file, fallback={}) => {try {return JSON.parse(fs.readFileSync(file,'utf8'));} catch {return fallback;}};
const defaults = read(new URL('./analytics-product.json', import.meta.url));
const truth = value => /^(1|true|yes|on)$/i.test(String(value));
const off = value => /^(0|false|no|off)$/i.test(String(value));
const DAY = 86400000;
const kinds = new Set(['Command Invoked','Assessment Started','Assessment Completed','Assessment Partial','Assessment Blocked','Assessment Canceled','Report Viewed','Settings Viewed','First Activation','First Completed Run','Return On Another Day','Pro Interest','Analytics Diagnostic']);
export function createUsageAnalytics({product=defaults, home=os.homedir(), env=process.env, send=sendFathomRequest, clock=Date.now}={}) {
  if(!/^(claude-light|claude-pro|codex-lite|codex-pro|mcp-lite)$/.test(product.edition||'') || !/^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(product.version||'')) throw Error('Invalid analytics product metadata');
  const dir=path.join(home,'.config/carbon/usage',product.edition), config=path.join(home,'.config/carbon/config.json');
  function enabled() {
    if(truth(env.DO_NOT_TRACK) || off(env.CARBON_ANALYTICS)) return false;
    if(truth(env.CARBON_ANALYTICS)) return true;
    const c=read(config);
    if(c.analyticsEnabled===false) return false;
    return c.analyticsEditions?.[product.edition] ?? product.defaultEnabled===true;
  }
  const files=()=>{try{return fs.readdirSync(dir).filter(n=>/^[a-f0-9]{64}\.json$/.test(n));}catch{return [];}};
  function write(file,value) {
    fs.mkdirSync(dir,{recursive:true,mode:0o700});
    const temp=file+'.'+randomUUID()+'.tmp';fs.writeFileSync(temp,JSON.stringify(value),{mode:0o600});fs.renameSync(temp,file);
  }
  function purge() {for(const n of files()) fs.unlinkSync(path.join(dir,n));}
  const milestone = name => /^CARBON (First Completed Run|Return On Another Day|Pro Interest)( |$)/.test(name);
  const milestoneConsent = () => read(config).funnelAnalyticsEnabled===true;
  function enqueue(kind, command='', key='') {
    if(!enabled()){purge();return false;}
    if(!kinds.has(kind) || (command && !normalizeAnalyticsCommand(command))) return false;
    const name=`CARBON ${kind}${command?' '+normalizeAnalyticsCommand(command):''}`;
    if(milestone(name)&&!milestoneConsent())return false;
    const id=createHash('sha256').update(key || randomUUID()).digest('hex');
    fs.mkdirSync(dir,{recursive:true,mode:0o700});
    // Exclusive creation makes repeated lifecycle updates/processes idempotent locally.
    const event={name,createdAt:clock(),attempts:0,nextAttemptAt:0,accepted:false,version:product.version};
    try {fs.writeFileSync(path.join(dir,id+'.json'),JSON.stringify(event),{flag:'wx',mode:0o600});return true;} catch(e){if(e.code==='EEXIST')return false;throw e;}
  }
  async function flush() {
    if(!enabled()){purge();return;}
    fs.mkdirSync(dir,{recursive:true,mode:0o700});
    const lock=path.join(dir,'flush.lock');let fd;
    try {if(fs.existsSync(lock)&&clock()-fs.statSync(lock).mtimeMs>30000)fs.unlinkSync(lock);fd=fs.openSync(lock,'wx',0o600);}catch{return;}
    try {
      const start=clock();let attempted=0;
      const entries=files().map(n=>({file:path.join(dir,n),event:read(path.join(dir,n))})).sort((a,b)=>a.event.createdAt-b.event.createdAt);
      for(let i=0;i<entries.length;i++) {
        const {file,event:e}=entries[i];
        if(milestone(e.name)&&!milestoneConsent()){fs.unlinkSync(file);continue;}
        if(clock()-e.createdAt>7*DAY || i<entries.length-200){fs.unlinkSync(file);continue;}
        if(e.accepted||e.permanentFailure||e.nextAttemptAt>clock()||attempted>=3||clock()-start>3500)continue;
        if(!enabled()){purge();break;}
        // Revalidate persisted data before sending; never send arbitrary queue contents.
        if(typeof e.name!=='string'||!e.name.startsWith('CARBON ')||!/^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(e.version||''))continue;
        const suffix=e.name.slice(7),valid=[...kinds].some(k=>suffix===k||suffix.startsWith(k+' ')&&normalizeAnalyticsCommand(suffix.slice(k.length+1)));
        if(!valid)continue;
        attempted++;let status=0;
        try {status=Number((await send(buildFathomEventUrl(e.name,`/carbon/plugin/${product.edition}/${e.version}`)))?.status)||0;}catch{}
        e.attempts++;e.lastStatus=status;e.accepted=status>=200&&status<300;
        e.permanentFailure=status>=300&&status<500&&status!==429;
        e.nextAttemptAt=clock()+Math.min(DAY,1000*2**Math.min(e.attempts,16));
        if(enabled())write(file,e);
        if(e.accepted&&e.name==='CARBON First Activation')write(path.join(dir,'activation.json'),{recorded:true});
        write(path.join(dir,'status.json'),{lastEvent:e.name,lastHttpStatus:status,deliveryState:e.accepted?'http-accepted-unverified':e.permanentFailure?'rejected':'queued',ingestionVerified:false,at:new Date(clock()).toISOString()});
      }
    }finally{fs.closeSync(fd);try{fs.unlinkSync(lock);}catch{}}
  }
  async function record(kind, command='', key='') {
    try {
      if(!kinds.has(kind)||(command&&!normalizeAnalyticsCommand(command)))return;
      if(enabled()&&!read(path.join(dir,'activation.json')).recorded)enqueue('First Activation','','activation');
      enqueue(kind,command,key);await flush();
    }catch{/* Analytics can never fail the user's testing workflow. */}
  }
  function status(){return {edition:product.edition,version:product.version,enabled:enabled(),pending:files().filter(n=>{const e=read(path.join(dir,n));return !e.accepted&&!e.permanentFailure;}).length,...read(path.join(dir,'status.json'))};}
  function setEnabled(value){if(typeof value!=='boolean')throw Error('Use true or false');fs.mkdirSync(path.dirname(config),{recursive:true,mode:0o700});const c=read(config);fs.writeFileSync(config,JSON.stringify({...c,analyticsEditions:{...c.analyticsEditions,[product.edition]:value}},null,2),{mode:0o600});if(!value)purge();return status();}
  return {record,flush,status,enabled,setEnabled};
}
let instance;
export const usage=()=>instance??=createUsageAnalytics();
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const [action,command]=process.argv.slice(2);
  try {
    if(action==='command') {if(!normalizeAnalyticsCommand(command))throw Error('Unknown command');await usage().record('Command Invoked',command);}
    else if(action==='diagnostic')await usage().record('Analytics Diagnostic');
    else if(action==='on'||action==='off')usage().setEnabled(action==='on');
    else if(action!=='status')throw Error('Use command NAME, status, on, off or diagnostic');
    console.log(JSON.stringify(usage().status()));
  }catch {console.error('CARBON analytics unavailable; continue the requested command.');process.exitCode=0;}
}

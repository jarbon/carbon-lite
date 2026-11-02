import fs from 'node:fs';
import path from 'node:path';
export const targetQuestion = 'What would you like CARBON to test? Share a website URL, a local folder or repository, an API endpoint, an app or feature, or requirements/files to review.';
const ignored = new Set(['.carbon','.git','.claude','.codex','.DS_Store','AGENTS.md','CLAUDE.md']);
const generic = new Set(['','.','./','auto','auto-detect local target','current project','current workspace','current directory','current project and requested context','test this','this','here']);
export function requireTarget(root,target='') {
 const value=String(target??'').trim();
 let same=generic.has(value.toLowerCase()) || value.replace(/\/$/,'')===path.resolve(root).replace(/\/$/,'');
 if(value && fs.existsSync(value)) same = same || fs.realpathSync(value)===fs.realpathSync(root);
 if(!same || fs.readdirSync(root).some(n=>!ignored.has(n))) return;
 throw new Error('TARGET_REQUIRED: '+targetQuestion);
}

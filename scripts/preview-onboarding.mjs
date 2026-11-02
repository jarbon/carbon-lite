// Isolated first-install fixture: never reads or changes the user's preferences.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {serveSettings} from '../src/settings-viewer.mjs';
const dir=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'carbon-onboarding-preview-'));
const root=path.join(dir,'sample-project');fs.mkdirSync(root);
let analyticsEnabled=false;
const view=await serveSettings(root,path.resolve(import.meta.dirname,'..'),{home:path.join(dir,'private'),analytics:{enabled:()=>analyticsEnabled,setEnabled:v=>analyticsEnabled=v}});
console.log(JSON.stringify({root,privateHome:path.join(dir,'private'),url:view.browserUrl,pid:process.pid}));

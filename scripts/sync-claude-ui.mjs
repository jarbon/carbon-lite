// Explicit canonical-source sync; no caches, historical releases or live deployments.
import fs from 'node:fs';
import path from 'node:path';
import {build} from 'esbuild';
const root=path.resolve(import.meta.dirname,'..');
const target=path.resolve(process.argv[2]||path.join(root,'../carbon-free'));
if(target.includes('/cache/')||!fs.existsSync(path.join(target,'.claude-plugin/plugin.json')))throw Error('Expected canonical Claude plugin');
const bridge=await build({stdin:{contents:"import {connectClaude} from './src/claude-adapter.mjs'; window.CARBON_HOST={connect:connectClaude};",resolveDir:root},bundle:true,write:false,format:'iife',platform:'browser',target:'es2022'});
const template=fs.readFileSync(path.join(root,'dist/workspace-template.html'),'utf8');
fs.writeFileSync(path.join(target,'ui/shared-report.html'),template);
const live=template.replace("connect-src 'none'","connect-src 'self'").replace('<body>','<body><!-- carbon-shared-report -->').replace('<script>window.CARBON_JAY_DARK=',`<script>${bridge.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')}</script><script>window.CARBON_JAY_DARK=`);
fs.writeFileSync(path.join(target,'ui/live-panel.html'),live);
fs.copyFileSync(path.join(root,'src/claude-adapter.mjs'),path.join(target,'server/shared-adapter.mjs'));
console.log('Shared Codex/Claude report UI: '+target);

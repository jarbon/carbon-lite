import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {validateListing} from './validate-listing.mjs';

const zip = path.resolve(process.argv[2] || 'missing.zip');
const entries = execFileSync('unzip', ['-Z1', zip], {encoding:'utf8'}).trim().split('\n');
assert(entries.every(e => !e.startsWith('/') && !e.split('/').includes('..')));
assert(!entries.some(e => /(^|\/)(hooks|node_modules|\.env|\.git|\.carbon|proof)(\/|$)/.test(e)));
assert(!entries.some(e => /(^|\/)(\.mcp\.json|\.app\.json|hooks\.json)$/.test(e)));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'carbon-marketplace-smoke-'));
try {
  const plugin = path.join(tmp, 'plugin'), project = path.join(tmp, 'project');
  fs.mkdirSync(plugin); fs.mkdirSync(project);
  execFileSync('unzip', ['-q', zip, '-d', plugin]);
  const manifest = JSON.parse(fs.readFileSync(path.join(plugin,'.codex-plugin/plugin.json')));
  validateListing(manifest);
  assert.equal(manifest.interface.displayName,'Carbon Core');
  assert.equal(manifest.name,'carbon-lite');
  assert(!manifest.hooks && !manifest.mcpServers && !manifest.apps);
  assert.match(manifest.interface.longDescription,/No lifecycle hooks/);
  assert.equal(fs.readdirSync(path.join(plugin,'skills')).length,14);
  assert(fs.existsSync(path.join(plugin,'skills/full/SKILL.md')));
  assert(!fs.existsSync(path.join(plugin,'skills/proof')));
  const call = (action,input={}) => JSON.parse(execFileSync(process.execPath,[path.join(plugin,'scripts/carbon.mjs'),action,'-'],{
    cwd:project, encoding:'utf8', timeout:15000,
    env:{...process.env,DO_NOT_TRACK:'1',CARBON_ANALYTICS:'off',CARBON_BACKGROUND_TEST_HOME:path.join(tmp,'private-state')},
    input:JSON.stringify({root:project,...input})
  }));
  const list=call('demo',{action:'list'}); assert.equal(list.defaultFixture,'testbucks');
  const fixture=call('demo',{action:'create',fixture:'testbucks',testProfile:'with-existing-tests'});
  assert(fs.existsSync(path.join(fixture.destination,'.carbon-demo.json')));
  const run=call('start',{title:'Packaged CARBON smoke check',target:'synthetic fixture'}).result;
  call('update',{runId:run.runId,revision:0,status:'completed',checks:[{id:'fixture',title:'Archive demo exists',domain:'Functionality',type:'positive',status:'passed',actual:'Verified demo files were extracted',evidence:['Filesystem existence assertion in verify-marketplace.mjs']} ]});
  assert.equal(call('snapshot').runs[0].status,'completed');
  const report=call('report'); assert.match(fs.readFileSync(report.html,'utf8'),/Packaged CARBON smoke check/);
  assert.equal(fs.statSync(report.html).mode & 0o777,0o600);
  assert.match(fs.readFileSync(path.join(plugin,'skills/carbon-settings/SKILL.md'),'utf8'),/does not schedule|do not claim background monitoring/);
  console.log(JSON.stringify({zip,version:manifest.version,entries:entries.length,displayName:manifest.interface.displayName,checks:['safe archive entries','public manifest limits','no hooks or MCP','14 skills with full and no proof','standalone demo creation','start/update/snapshot','private HTML report'],passed:true},null,2));
} finally {
  fs.rmSync(tmp,{recursive:true,force:true});
}

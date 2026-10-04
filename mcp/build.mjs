import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
const stage = path.resolve('output/mcp/0.1.0/carbon-lite');
fs.mkdirSync(path.join(stage, 'mcp'), { recursive: true });
for (const item of ['dist', 'references', 'skills', 'demo-fixtures', 'assets', 'LICENSE', 'NOTICE.md', 'PRIVACY.md', 'SUPPORT.md', 'TERMS.md']) fs.cpSync(item, path.join(stage, item), { recursive: true });
fs.mkdirSync(path.join(stage, 'scripts'), { recursive: true });
fs.copyFileSync('scripts/carbon.mjs', path.join(stage, 'scripts/carbon.mjs'));
fs.copyFileSync('mcp/manifest.json', path.join(stage, 'manifest.json'));
fs.copyFileSync('mcp/README.md', path.join(stage, 'README.md'));
await build({ entryPoints: ['mcp/server.mjs'], outfile: path.join(stage, 'mcp/server.mjs'), bundle: true, platform: 'node', format: 'esm', target: 'node22', minify: false, banner: { js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);" }, metafile: true }).then(result => {
  const packages = new Set(Object.keys(result.metafile.inputs).filter(f => f.includes('node_modules/')).map(f => {
    const split = f.split('node_modules/'); const tail = split.pop().split('/');
    return split.join('node_modules/') + 'node_modules/' + (tail[0].startsWith('@') ? tail.slice(0, 2).join('/') : tail[0]);
  }));
  packages.add('node_modules/zod');
  fs.writeFileSync(path.join(stage, 'THIRD-PARTY-NOTICES.txt'), [...packages].sort().map(dir => {
    const file = fs.readdirSync(dir).find(n => /^licen[sc]e(?:\.|$)/i.test(n));
    if (!file) throw Error('Missing license: ' + dir);
    return `\n## ${dir}\n\n${fs.readFileSync(path.join(dir, file), 'utf8')}`;
  }).join('\n'));
});
execFileSync(process.execPath, ['mcp/node_modules/@anthropic-ai/mcpb/dist/cli/cli.js', 'validate', path.join(stage, 'manifest.json')], { stdio: 'inherit' });
const archive = path.resolve('output/mcp/0.1.0/carbon-lite-mcp-0.1.0.mcpb');
execFileSync(process.execPath, ['mcp/node_modules/@anthropic-ai/mcpb/dist/cli/cli.js', 'pack', stage, archive], { stdio: 'inherit' });
const sha = crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
fs.writeFileSync(path.dirname(archive) + '/SHA256SUMS', `${sha}  ${path.basename(archive)}\n`);
fs.writeFileSync(path.dirname(archive) + '/server.json', JSON.stringify({
  $schema: 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json',
  name: 'io.github.jarbon/carbon-lite', title: 'Testers.ai CARBON Test Harness Lite',
  description: 'Local QA workflows, test evidence, screenshot maps and confidence reports for AI coding agents.',
  repository: { url: 'https://github.com/jarbon/carbon-lite', source: 'github' },
  websiteUrl: 'https://github.com/jarbon/carbon-lite/blob/main/mcp/README.md', version: '0.1.0',
  packages: [{ registryType: 'mcpb', identifier: 'https://github.com/jarbon/carbon-lite/releases/download/mcp-v0.1.0/carbon-lite-mcp-0.1.0.mcpb', fileSha256: sha, transport: { type: 'stdio' } }]
}, null, 2) + '\n');
console.log(JSON.stringify({ stage, archive, sha }));

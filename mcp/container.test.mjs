import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
test('container stdio writes report only into mounted project with network disabled', async t => {
  fs.mkdirSync('output', { recursive: true });
  const root = fs.mkdtempSync(path.resolve('output/carbon-mcp-container-'));
  const client = new Client({ name: 'container-test', version: '1.0.0' });
  t.after(async () => { await client.close(); fs.rmSync(root, { recursive: true }); });
  await client.connect(new StdioClientTransport({ command: 'docker', args: ['run', '--rm', '-i', '--network', 'none', '--user', String(process.getuid()), '--mount', `type=bind,src=${root},dst=/workspace`, 'carbon-lite-mcp:0.1.0'], stderr: 'inherit' }));
  assert.equal((await client.listTools()).tools.length, 10);
  const r = await client.callTool({ name: 'carbon_start', arguments: { title: 'Container smoke check', target: 'synthetic' } });
  assert.ok(!r.isError, r.content[0].text);
  assert.ok(fs.existsSync(path.join(root, '.carbon/studio-lite/reports/index.html')));
});

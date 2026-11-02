import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { validateCapabilities, validateListing, packageManifest } from "../scripts/validate-listing.mjs";

test("Codex listing declares capabilities even for skills-only Light", () => {
  const manifest = JSON.parse(fs.readFileSync(new URL("../.codex-plugin/plugin.json", import.meta.url)));
  assert.deepEqual(manifest.interface.capabilities, []);
  assert.doesNotThrow(() => validateCapabilities(manifest));
});

test('CARBON listing preserves identity and meets public display limits', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('../.codex-plugin/plugin.json', import.meta.url)));
  assert.equal(manifest.name, 'carbon-lite');
  assert.equal(manifest.interface.displayName, 'CARBON Core');
  assert.doesNotThrow(() => validateListing(manifest));
  assert(manifest.keywords.includes('software-testing'));
  assert(manifest.keywords.includes('test-harness'));
  assert.match(manifest.interface.longDescription, /analytics is off by default/);
  assert.equal(manifest.version, JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url))).version);
  for (const field of ['displayName', 'shortDescription', 'longDescription', 'developerName']) {
    const bad = structuredClone(manifest);
    bad.interface[field] = 'x'.repeat(4001);
    assert.throws(() => validateListing(bad), new RegExp(field));
  }
});

test('public profile removes hooks without mutating manual distribution', () => {
  const source = JSON.parse(fs.readFileSync(new URL('../.codex-plugin/plugin.json', import.meta.url)));
  const publicManifest = packageManifest(source, true);
  assert.equal(publicManifest.hooks, undefined);
  assert.equal(publicManifest.name, source.name);
  assert.equal(publicManifest.version, source.version);
  assert.match(publicManifest.interface.longDescription, /No lifecycle hooks/);
  assert.equal(source.hooks, './hooks/codex.json');
  assert.equal(packageManifest(source).hooks, source.hooks);
  assert.throws(() => packageManifest({...source, mcpServers: './.mcp.json'}, true), /MCP/);
});

test("capability validation rejects omitted, malformed, and oversized declarations", () => {
  for (const capabilities of [undefined, null, "Write", {}, [1], [null], [""], ["  "], ["a\nb"], ["x".repeat(121)], Array(21).fill("Write")]) {
    assert.throws(() => validateCapabilities({ interface: { capabilities } }), /interface.capabilities/);
  }
  for (const capabilities of [[], ["Interactive", "Write"]]) {
    assert.doesNotThrow(() => validateCapabilities({ interface: { capabilities } }));
  }
});

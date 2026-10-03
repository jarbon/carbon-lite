import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { validateCapabilities } from "../scripts/validate-listing.mjs";

test("Codex listing declares capabilities even for skills-only Light", () => {
  const manifest = JSON.parse(fs.readFileSync(new URL("../.codex-plugin/plugin.json", import.meta.url)));
  assert.deepEqual(manifest.interface.capabilities, []);
  assert.doesNotThrow(() => validateCapabilities(manifest));
});

test("capability validation rejects omitted, malformed, and oversized declarations", () => {
  for (const capabilities of [undefined, null, "Write", {}, [1], [null], [""], ["  "], ["a\nb"], ["x".repeat(121)], Array(21).fill("Write")]) {
    assert.throws(() => validateCapabilities({ interface: { capabilities } }), /interface.capabilities/);
  }
  for (const capabilities of [[], ["Interactive", "Write"]]) {
    assert.doesNotThrow(() => validateCapabilities({ interface: { capabilities } }));
  }
});

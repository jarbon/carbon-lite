import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const plugin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(plugin, "scripts/carbon.mjs");
function setup(t) {
  const root = fs.mkdtempSync(
    path.join(fs.realpathSync(os.tmpdir()), "studio-lite-"),
  );
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
function call(action, input) {
  return JSON.parse(
    execFileSync(process.execPath, [script, action, "-"], {
      input: JSON.stringify(input),
      encoding: "utf8",
    }),
  );
}
const finding = {
  id: "f1",
  title: "Stored HTML",
  severity: "high",
  strength: "demonstrated",
  consequence: "Untrusted task tags become markup",
  steps: ["Save tag", "Open stats"],
  evidence: ["Synthetic marker observed"],
  remediation: "Render as text",
  verification: "Confirm marker stays literal",
};
test("compiled entrypoint executes through a symbolic directory path", t => {
  const root=setup(t);
  fs.symlinkSync(plugin,path.join(root,'package-link'),'dir');
  const result=JSON.parse(execFileSync(process.execPath,[path.join(root,'package-link/scripts/carbon.mjs'),'demo','-'],{input:JSON.stringify({root,action:'list'}),encoding:'utf8'}));
  assert.equal(result.fixtures.length,4);
});
test("CLI settings writes require the current snapshot revision", t => {
  const root=setup(t);
  assert.throws(()=>call('settings',{root,patch:{maxChecks:30}}));
  call('settings',{root,revision:0,patch:{maxChecks:30}});
  assert.equal(call('snapshot',{root}).settings.maxChecks,30);
  assert.throws(()=>call('settings',{root,revision:0,patch:{maxChecks:40}}));
});
test("compiled helper works from an unrelated directory, preserving evidence across processes", (t) => {
  const root = setup(t);
  const first = call("start", {
    root,
    title: "<script>window.bad=true</script>",
    target: "fixture",
  });
  const r = first.result;
  call("update", {
    root,
    runId: r.runId,
    revision: 0,
    checks: [
      {
        id: "c1",
        title: "Safe rendering",
        domain: "Security",
        type: "negative",
        status: "failed",
        actual: "Marker became an element",
        evidence: ["DOM snapshot"],
      },
    ],
    findings: [finding],
    personas: [
      {
        id: "p1",
        role: "Returning user",
        intent: "Keep data",
        journey: "Save, reload",
        observation: "Value persists",
        evidence: ["Observed reload"],
      },
    ],
    status: "completed",
  });
  const next = call("snapshot", { root });
  assert.equal(next.runs[0].findings.length, 1);
  assert.equal(next.runs[0].personas.length, 1);
  assert.equal(next.runs[0].root, undefined);
  const files = call("report", { root });
  const html = fs.readFileSync(files.html, "utf8");
  assert(!html.includes("<script>window.bad=true</script>"));
  assert(html.includes("\\u003cscript\\u003e"));
  assert(!html.includes(root));
  assert(html.includes("connect-src 'none'"));
  assert.equal(fs.statSync(files.html).mode & 0o777, 0o600);
});
test("feedback roundtrip is explicit, atomic and revision protected", (t) => {
  const root = setup(t),
    r = call("start", { root, title: "Feedback" }).result;
  call("update", { root, runId: r.runId, revision: 0, findings: [finding] });
  const snapshot = call("snapshot", { root });
  const feedback = {
    schema: "carbon.studio-lite-feedback/v1",
    revision: snapshot.revision,
    settings: { theme: "light" },
    steering: [
      { runId: r.runId, findingId: "f1", note: "Focus here", priority: "next" },
    ],
  };
  assert.throws(() => call("feedback", { root, feedback }));
  call("feedback", { root, feedback, confirm: true });
  assert.equal(call("snapshot", { root }).settings.theme, "light");
  assert.equal(call("snapshot", { root }).steering[0].note, "Focus here");
  assert.throws(() => call("feedback", { root, feedback, confirm: true }));
  const latest = call("snapshot", { root });
  assert.throws(() =>
    call("feedback", {
      root,
      confirm: true,
      feedback: {
        ...feedback,
        revision: latest.revision,
        settings: { theme: "dark" },
        steering: [{ ...feedback.steering[0], findingId: "missing" }],
      },
    }),
  );
  assert.equal(call("snapshot", { root }).settings.theme, "light");
});
test("all four demo variants are copied, optional tests omitted, never overwrite", (t) => {
  const root = setup(t),
    manifest = call("demo", { root, action: "list" });
  assert.equal(manifest.fixtures.length, 4);
  for (const fixture of manifest.fixtures)
    for (const profile of manifest.testProfiles) {
      const result = call("demo", {
        root,
        action: "create",
        fixture: fixture.id,
        testProfile: profile.id,
      });
      for (const testPath of fixture.testPaths)
        assert.equal(
          fs.existsSync(path.join(result.destination, testPath)),
          profile.id === "with-existing-tests",
        );
      assert(fs.existsSync(path.join(result.destination, ".carbon-demo.json")));
      assert.throws(() =>
        call("demo", {
          root,
          action: "create",
          destination: path.basename(result.destination),
        }),
      );
    }
  assert.throws(() =>
    call("demo", { root, action: "create", destination: "../escape" }),
  );
});
test("no project-wide ambient writes or listening process; malformed requests fail", (t) => {
  const root = setup(t);
  const outcome = spawnSync(process.execPath, [script, "bad", "-"], {
    input: JSON.stringify({ root }),
    encoding: "utf8",
    timeout: 3000,
  });
  assert.equal(outcome.status, 1);
  assert(!fs.existsSync(path.join(root, ".carbon")));
  assert.throws(() => call("start", { root: "relative", title: "bad" }));
});
test("manifest includes Jay entrypoints without adding MCP/hook/app declarations", () => {
  const m = JSON.parse(
    fs.readFileSync(path.join(plugin, ".codex-plugin/plugin.json")),
  );
  assert.equal(m.license, "PolyForm-Perimeter-1.0.0");
  assert.equal(m.name, "carbon-lite");
  for (const field of ['supportURL', 'privacyPolicyURL', 'termsOfServiceURL']) assert(m.interface[field].startsWith('https://github.com/jarbon/carbon-lite/'));
  assert(!m.mcpServers && !m.hooks && !m.apps);
  const dirs = fs.readdirSync(path.join(plugin, "skills"));
  assert.deepEqual([...dirs].sort(), ['carbon','carbon-accessibility','carbon-demo','carbon-help','carbon-issues','carbon-map','carbon-settings','carbon-studio','carbon-test','j','jay'].sort());
  assert.equal(dirs.length, 11);
  for (const d of dirs) {
    const s = fs.readFileSync(
      path.join(plugin, "skills", d, "SKILL.md"),
      "utf8",
    );
    assert(s.startsWith("---\nname: " + d));
    assert(!/carbon_start|carbon_update|studio_open/.test(s));
  }
});

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Store, defaults } from "../src/store.mjs";
function setup(t) {
  const dir = fs.mkdtempSync(
    path.join(fs.realpathSync(os.tmpdir()), "carbon-studio-test-"),
  );
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const project = path.join(dir, "app");
  fs.mkdirSync(project);
  return { store: new Store(path.join(dir, "state")), project, dir };
}
const check = {
  id: "check-1",
  title: "Save and reload",
  domain: "State",
  type: "stateful",
  status: "passed",
  actual: "Saved value persisted after reload.",
  evidence: ["capture-1.png"],
};
test("defaults are available without creating a file", (t) => {
  const { store } = setup(t);
  assert.deepEqual(store.snapshot().settings, defaults);
  assert.equal(fs.existsSync(store.file), false);
});
test("preferences persist across processes and preserve omitted fields", (t) => {
  const { store } = setup(t);
  store.settings({ budgetMinutes: 35 }, 0);
  assert.equal(new Store(store.dir).read().settings.budgetMinutes, 35);
  assert.equal(store.read().settings.explorationPercent, 60);
});
test("settings reject stale writes", (t) => {
  const { store } = setup(t);
  store.settings({ maxChecks: 40 }, 0);
  assert.throws(() => store.settings({ maxChecks: 10 }, 0), /another window/);
  assert.equal(store.read().settings.maxChecks, 40);
});
test("settings reject unknown fields and unsafe exploration budgets", (t) => {
  const { store } = setup(t);
  assert.throws(() => store.settings({ apiKey: "secret" }));
  assert.throws(() => store.settings({ explorationPercent: 49 }));
  assert.throws(() => store.settings({ budgetMinutes: 0 }));
});
test("start captures defaults and snapshot redacts project root", (t) => {
  const { store, project } = setup(t);
  const r = store.start({
    root: project,
    title: "Test",
    target: "http://localhost",
  });
  store.settings({ maxChecks: 50 });
  assert.equal(store.snapshot().runs[0].settings.maxChecks, 20);
  assert.equal(store.snapshot().runs[0].root, undefined);
  assert.equal(store.snapshot().runs[0].project, "app");
  assert.equal(r.status, "running");
});
test("observations require evidence and failed writes are atomic", (t) => {
  const { store, project } = setup(t);
  const r = store.start({ root: project, title: "T", target: "" });
  assert.throws(
    () =>
      store.update({
        runId: r.id,
        revision: 0,
        checks: [{ ...check, evidence: [] }],
      }),
    /evidence/,
  );
  assert.equal(store.read().runs[0].checks.length, 0);
  assert.equal(store.read().runs[0].revision, 0);
});
test("updates merge by stable ID, protect revision, and preserve history", (t) => {
  const { store, project } = setup(t);
  const r = store.start({ root: project, title: "T", target: "" });
  store.update({
    runId: r.id,
    revision: 0,
    checks: [check],
    summary: "Checked reload",
  });
  assert.throws(
    () => store.update({ runId: r.id, revision: 0, current: "stale" }),
    /latest revision/,
  );
  store.update({
    runId: r.id,
    revision: 1,
    checks: [{ ...check, status: "failed" }],
  });
  assert.equal(store.read().runs[0].checks.length, 1);
  assert.equal(store.read().runs[0].history.length, 1);
});
test("completion rejects unresolved checks and closed runs are immutable", (t) => {
  const { store, project } = setup(t);
  const r = store.start({ root: project, title: "T", target: "" });
  store.update({
    runId: r.id,
    revision: 0,
    checks: [{ ...check, status: "planned" }],
  });
  assert.throws(
    () => store.update({ runId: r.id, revision: 1, status: "completed" }),
    /outstanding/,
  );
  store.update({
    runId: r.id,
    revision: 1,
    checks: [check],
    status: "completed",
  });
  assert.throws(
    () => store.update({ runId: r.id, revision: 2, current: "overwrite" }),
    /closed/,
  );
});
test("demonstrated findings require reproduction and evidence", (t) => {
  const { store, project } = setup(t);
  const r = store.start({ root: project, title: "T", target: "" });
  assert.throws(
    () =>
      store.update({
        runId: r.id,
        revision: 0,
        findings: [
          {
            id: "f1",
            title: "Broken",
            severity: "high",
            strength: "demonstrated",
            consequence: "Data loss",
            steps: [],
            evidence: [],
            remediation: "Fix",
            verification: "Retest",
          },
        ],
      }),
    /reproduction/,
  );
});
test("guidance persists once per finding and refuses unrelated IDs", (t) => {
  const { store, project } = setup(t);
  const r = store.start({ root: project, title: "T", target: "" });
  store.update({
    runId: r.id,
    revision: 0,
    findings: [
      {
        id: "f1",
        title: "Potential loss",
        severity: "high",
        strength: "suspected",
        consequence: "Loss",
        steps: [],
        evidence: [],
        remediation: "Inspect",
        verification: "Retest",
      },
    ],
  });
  store.steer({
    runId: r.id,
    findingId: "f1",
    note: "Revenue risk",
    priority: "next",
  });
  store.steer({
    runId: r.id,
    findingId: "f1",
    note: "Need synthetic data",
    priority: "defer",
  });
  assert.equal(new Store(store.dir).read().steering.length, 1);
  assert.throws(() =>
    store.steer({
      runId: r.id,
      findingId: "missing",
      note: "",
      priority: "next",
    }),
  );
});
test("screenshots cannot escape project, follow external symlinks, or accept scripts", (t) => {
  const { store, project, dir } = setup(t);
  const r = store.start({ root: project, title: "T", target: "" });
  store.update({
    runId: r.id,
    revision: 0,
    pages: [{ id: "home", title: "Home", url: "/" }],
  });
  fs.writeFileSync(path.join(dir, "outside.png"), "secret");
  fs.symlinkSync(path.join(dir, "outside.png"), path.join(project, "link.png"));
  for (const file of ["../outside.png", "link.png"])
    assert.throws(
      () => store.screenshot({ runId: r.id, pageId: "home", file }),
      /inside/,
    );
  fs.writeFileSync(path.join(project, "bad.svg"), '<svg onload="alert(1)"/>');
  assert.throws(
    () => store.screenshot({ runId: r.id, pageId: "home", file: "bad.svg" }),
    /Only PNG/,
  );
});
test("state directory symlink rejected", (t) => {
  const { dir } = setup(t);
  fs.symlinkSync(path.join(dir, "app"), path.join(dir, "linked"));
  assert.throws(() => new Store(path.join(dir, "linked")), /symbolic/);
});
test("permissions are private", (t) => {
  const { store } = setup(t);
  store.settings({ maxChecks: 30 });
  assert.equal(fs.statSync(store.file).mode & 0o777, 0o600);
});

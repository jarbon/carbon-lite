// Isolated synthetic UI fixture, never evidence of an actual product assessment.
import fs from "node:fs";
import path from "node:path";
import { execute } from "../src/cli.mjs";
fs.mkdirSync('output/previews', {recursive:true});
const root = fs.mkdtempSync(path.resolve("output/previews/studio-lite-"));
const r = execute("start", {
  root,
  title: "Brewtown · synthetic workspace preview",
  target: "Bundled demo — illustrative records only",
}).result;
execute("update", {
  root,
  runId: r.runId,
  revision: 0,
  current: "Checking the order journey across a reload",
  why: "A successful order should retain the choices you made.",
  summary: "Illustrative preview seeded. No real tests were run.",
  checks: [
    {
      id: "c1",
      title: "Name has an accessible label",
      domain: "Accessibility",
      type: "positive",
      status: "passed",
      actual: "Synthetic example: label associated",
      evidence: ["Illustrative fixture only"],
      page: "order",
    },
    {
      id: "c2",
      title: "Empty order is rejected",
      domain: "Functionality",
      type: "negative",
      status: "failed",
      actual: "Synthetic example: empty order accepted",
      evidence: ["Illustrative fixture only"],
      page: "order",
    },
    {
      id: "c3",
      title: "Saved choice survives reload",
      domain: "State",
      type: "stateful",
      status: "running",
      page: "order",
    },
    {
      id: "c4",
      title: "Keyboard checkout",
      domain: "Accessibility",
      type: "exploratory",
      status: "planned",
      page: "order",
    },
    {
      id: "c5",
      title: "Recovery after declined payment",
      domain: "Recovery",
      type: "recovery",
      status: "blocked",
      actual: "Payment sandbox unavailable",
    },
  ],
  findings: [
    {
      id: "f1",
      title: "An empty order can be submitted",
      severity: "medium",
      strength: "demonstrated",
      consequence: "Illustrative: customers may receive an unusable order.",
      steps: ["Leave the order empty", "Submit"],
      evidence: ["Synthetic demonstration, not an actual test finding"],
      remediation: "Validate at submission and show a useful error.",
      verification: "Empty input is rejected; valid input still works.",
      page: "order",
    },
  ],
  pages: [
    {
      id: "order",
      title: "Order your coffee",
      url: "/order",
      description: "Screenshot can be attached after capture.",
    },
  ],
  blockers: ["Payment sandbox needed to verify recovery."],
});
console.log(JSON.stringify({ root, ...execute("report", { root }) }, null, 2));

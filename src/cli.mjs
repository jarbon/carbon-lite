import { requireTarget } from './target.mjs';
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Store } from "./store.mjs";
import { exportWorkspace } from "./report.mjs";
import { demo } from "./demo.mjs";
import { launchReportViewer } from "./report-viewer.mjs";
import {createFunnel} from './funnel.mjs';

const plugin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const actions = [
  "start",
  "update",
  "risk-analysis",
  "persona-feedback",
  "snapshot",
  "report",
  "view",
  "screenshot",
  "settings",
  "settings-view",
  "setup-status",
  "feedback",
  "demo",
];
export function execute(action, input) {
  if (!actions.includes(action))
    throw Error("Unknown action. Use: " + actions.join(", "));
  if (!input || Array.isArray(input) || typeof input !== "object")
    throw Error("Expected a JSON object.");
  if (typeof input.root !== "string" || !path.isAbsolute(input.root))
    throw Error("Use an explicit absolute project root.");
  const root = fs.realpathSync(input.root);
  if (!fs.statSync(root).isDirectory())
    throw Error("Project root must be a directory.");
  if (action === "demo") return demo(plugin, root, input);
  if (action === "setup-status") return import(pathToFileURL(path.join(plugin,'background/onboarding.mjs')).href).then(m=>m.readSettings(root,{edition:'codex-lite',home:process.env.CARBON_BACKGROUND_TEST_HOME}));
  if (action === "settings-view") return launchReportViewer(root, path.join(plugin,'scripts/settings-viewer.mjs'));
  if (action === "start") requireTarget(root, input.target);
  const store = new Store(path.join(root, ".carbon/studio-lite"));
  let result;
  const { root: unused, ...args } = input;
  if (action === "start") {
    if (typeof args.title !== "string" || !args.title.trim())
      throw Error("Run title required.");
    result = store.start({
      root,
      title: args.title,
      target: args.target || "",
    });
  }
  if (action === "update") result = store.update(args);
  if (action === "persona-feedback") result = store.addPersonaFeedback(args);
  if (action === "risk-analysis") result = store.addRiskAnalysis(args);
  if (action === "screenshot") result = store.screenshot(args);
  if (action === "settings") {
    if (args.patch && !Number.isInteger(args.revision))
      throw Error("Read the snapshot and supply its revision before changing settings.");
    if (args.patch) store.settings(args.patch, args.revision);
    result = store.snapshot().settings;
  }
  if (action === "feedback") {
    if (args.confirm !== true)
      throw Error(
        "Inspect feedback, then pass confirm:true to apply local settings and priorities. It does not authorize testing or fixes.",
      );
    result = store.feedback(args.feedback);
  }
  if (action === "snapshot") {
    const snapshot = store.snapshot();
    if (args.runId) {
      snapshot.runs = snapshot.runs.filter((r) => r.id === args.runId);
      if (!snapshot.runs.length) throw Error("Run not found.");
    }
    // Do not spend model context on base64. Full images remain in portable exports.
    snapshot.runs = snapshot.runs.map((r) => ({
      ...r,
      pages: r.pages.map(({ image, ...p }) => ({ ...p, hasImage: !!image })),
    }));
    return snapshot;
  }
  const files = exportWorkspace(store, plugin);
  if (action === "view") return launchReportViewer(files.html, path.join(plugin, 'scripts/report-viewer.mjs')).then(presentation => ({ ...files, ...presentation }));
  if (action === "report") return files;
  // Do not repeat screenshot base64 or project root into the model response.
  return {
    result:
      action === "start" || action === "update" || action === "screenshot"
        ? { runId: result.id, revision: result.revision, status: result.status }
        : action === "settings"
          ? result
          : { saved: true },
    ...files,
  };
}
if (
  process.argv[1] &&
  fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))
) {
  try {
    if (process.argv.length !== 4)
      throw Error(
        "Usage: node scripts/carbon.mjs ACTION input.json (or - for stdin). Only view and settings-view start temporary local viewers.",
      );
    const inputFile = process.argv[3];
    if (inputFile !== "-" && fs.statSync(inputFile).size > 12_000_000)
      throw Error("Input exceeds 12 MB.");
    let content = "";
    if (inputFile === "-")
      for await (const chunk of process.stdin) {
        content += chunk;
        if (content.length > 12_000_000) throw Error("Input exceeds 12 MB.");
      }
    else content = fs.readFileSync(inputFile, "utf8");
    const action=process.argv[2], input=JSON.parse(content);
    const result=await execute(action,input);
    // This helper is optional and off by default in Codex. Never forward input.
    try {
      const {usage}=await import(pathToFileURL(path.join(plugin,'scripts/usage-analytics.mjs')).href);
      if(action==='update'&&input.status==='completed'){
        const snapshot=execute('snapshot',{root:input.root,runId:input.runId});
        if(snapshot.runs[0]?.checks.some(c=>['passed','failed'].includes(c.status)))await createFunnel({usage:usage(),edition:'codex'}).record('completed',input.runId);
      }
      if(action==='start')await usage().record('Assessment Started','', 'start:'+result.result.runId);
      else if(action==='update'&&['completed','partial','blocked','canceled'].includes(input.status))await usage().record('Assessment '+input.status[0].toUpperCase()+input.status.slice(1),'','terminal:'+input.runId);
      else if(action==='report')await usage().record('Report Viewed');
      else if(action==='settings')await usage().record('Settings Viewed');
    }catch{/* Evidence generation works even when analytics is unavailable. */}
    console.log(JSON.stringify(result,null,2));
  } catch (e) {
    console.error(JSON.stringify({ error: e.message }));
    process.exitCode = 1;
  }
}

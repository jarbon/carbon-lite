import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Store } from "./store.mjs";
import { exportWorkspace } from "./report.mjs";
import { demo } from "./demo.mjs";

const plugin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const actions = [
  "start",
  "update",
  "snapshot",
  "report",
  "screenshot",
  "settings",
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
        "Usage: node scripts/carbon.mjs ACTION input.json (or - for stdin). No server is started.",
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
    console.log(
      JSON.stringify(execute(process.argv[2], JSON.parse(content)), null, 2),
    );
  } catch (e) {
    console.error(JSON.stringify({ error: e.message }));
    process.exitCode = 1;
  }
}

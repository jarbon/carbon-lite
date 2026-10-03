import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export function exportWorkspace(store, plugin) {
  const snapshot = store.snapshot();
  const template = fs.readFileSync(
    path.join(plugin, "dist/workspace-template.html"),
    "utf8",
  );
  const data = JSON.stringify(snapshot)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
  const html = template.replace("/*CARBON_SNAPSHOT*/null", () => data);
  for (const [name, contents] of [
    ["workspace.json", JSON.stringify(snapshot, null, 2)],
    ["index.html", html],
  ]) {
    // Outputs are separate from the authoritative store, so a portable export never includes roots.
    const dest = path.join(store.dir, "reports");
    if (fs.existsSync(dest) && fs.lstatSync(dest).isSymbolicLink())
      throw Error("Report directory cannot be a symlink.");
    fs.mkdirSync(dest, { recursive: true, mode: 0o700 });
    const target = path.join(dest, name),
      temp = path.join(dest, crypto.randomUUID() + ".tmp");
    if (fs.existsSync(target) && fs.lstatSync(target).isSymbolicLink())
      throw Error("Report files cannot be symlinks.");
    fs.writeFileSync(temp, contents, { flag: "wx", mode: 0o600 });
    fs.renameSync(temp, target);
  }
  return {
    html: path.join(store.dir, "reports/index.html"),
    snapshot: path.join(store.dir, "reports/workspace.json"),
    revision: snapshot.revision,
    note: "Local portable snapshot. Reload after updates, or select workspace.json in the report to watch it. Feedback must be exported and explicitly imported.",
  };
}

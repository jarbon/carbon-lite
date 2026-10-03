import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { validateCapabilities } from "./validate-listing.mjs";
const manifest = JSON.parse(fs.readFileSync(".codex-plugin/plugin.json"));
validateCapabilities(manifest);
if (manifest.mcpServers || manifest.apps || manifest.hooks)
  throw Error("Skills-only package must not register servers, apps or hooks.");
const release = path.resolve(
  "output/releases",
  `${manifest.version}-${new Date().toISOString().replace(/[:.]/g, "-")}`,
);
const stage = path.join(release, "carbon-lite");
fs.mkdirSync(stage, { recursive: true });
for (const file of [
  ".codex-plugin",
  "skills",
  "scripts",
  "src",
  "assets",
  "references",
  "docs",
  "demo-fixtures",
  "dist",
  "tests",
  "package.json",
  "package-lock.json",
  "LICENSE",
  "NOTICE.md",
  "PRIVACY.md",
  "SUPPORT.md",
  "TERMS.md",
  "README.md",
  "SUBMISSION.md",
  "VERIFICATION.md",
])
  fs.cpSync(file, path.join(stage, file), { recursive: true });
const notices =
  "CARBON Lite includes zod 4.4.3, used in scripts/carbon.mjs.\n\n" +
  fs.readFileSync("node_modules/zod/LICENSE", "utf8") +
  "\nBuild-only esbuild is installed from package-lock.json and is not included in the runtime.\n";
fs.writeFileSync(path.join(stage, "THIRD-PARTY-NOTICES.txt"), notices);
const forbidden =
  /(?:^|\/)(?:node_modules|\.env(?:\..*)?|\.mcp\.json|\.app\.json|workspace\.json|\.carbon|\.git)(?:\/|$)/;
function walk(dir, base = "") {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.posix.join(base, e.name);
    if (e.isSymbolicLink() || forbidden.test(rel))
      throw Error("Unsafe package entry: " + rel);
    if (e.isDirectory()) walk(path.join(dir, e.name), rel);
  }
}
walk(stage);
const zip = path.join(release, `carbon-lite-${manifest.version}.zip`);
execFileSync("zip", ["-qr", zip, "."], { cwd: stage });
const sha256 = crypto
  .createHash("sha256")
  .update(fs.readFileSync(zip))
  .digest("hex");
fs.writeFileSync(
  path.join(release, "SHA256SUMS"),
  `${sha256}  ${path.basename(zip)}\n`,
);
console.log(
  JSON.stringify(
    { folder: stage, zip, bytes: fs.statSync(zip).size, sha256 },
    null,
    2,
  ),
);

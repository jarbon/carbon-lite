import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { packageManifest } from "./validate-listing.mjs";
const args = process.argv.slice(2);
if (args.some(arg => arg !== '--public-directory')) throw Error('Unknown packaging option');
const publicDirectory = args.includes('--public-directory');
const sourceManifest = JSON.parse(fs.readFileSync(".codex-plugin/plugin.json"));
if (sourceManifest.mcpServers || sourceManifest.apps || sourceManifest.hooks !== './hooks/codex.json')
  throw Error("Lite must have only the reviewed local hooks; no servers or apps.");
const manifest = packageManifest(sourceManifest, publicDirectory);
const release = path.resolve(
  "output/releases",
  `${manifest.version}-${publicDirectory ? 'marketplace-' : ''}${new Date().toISOString().replace(/[:.]/g, "-")}`,
);
const stage = path.join(release, "carbon-lite");
fs.mkdirSync(stage, { recursive: true });
for (const file of [
  ".codex-plugin",
  "skills",
  "background",
  ...(publicDirectory ? [] : ["hooks"]),
  "scripts",
  "src",
  "assets",
  "references",
  "runtime",
  "ui",
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
fs.writeFileSync(path.join(stage, '.codex-plugin/plugin.json'), JSON.stringify(manifest, null, 2) + '\n');
if (publicDirectory) {
  const note = '# Public marketplace edition\n\nThis package installs no lifecycle hooks. Run /carbon, /full or a focused command explicitly. Automatic settings do not schedule after-edit checks without hooks; do not claim background monitoring is active. The separate manual-install package supports trusted local hooks.\n\n';
  for (const file of ['README.md', 'SUBMISSION.md', 'skills/carbon-background/SKILL.md', 'skills/carbon-settings/SKILL.md']) {
    const target = path.join(stage, file);
    const content = fs.readFileSync(target, 'utf8');
    const frontmatter = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
    const at = frontmatter?.[0].length ?? 0;
    fs.writeFileSync(target, content.slice(0, at) + '\n' + note + content.slice(at));
  }
}
const notices =
  "CARBON includes zod 4.4.3, used in scripts/carbon.mjs.\n\n" +
  fs.readFileSync("node_modules/zod/LICENSE", "utf8") +
  "\nBuild-only esbuild is installed from package-lock.json and is not included in the runtime.\n";
fs.writeFileSync(path.join(stage, "THIRD-PARTY-NOTICES.txt"), notices);
const forbidden =
  /(?:^|\/)(?:node_modules|\.env(?:\..*)?|\.mcp\.json|\.app\.json|workspace\.json|\.carbon|\.git|proof|proof\.md|carbon_proof[^/]*)(?:\/|$)/;
function walk(dir, base = "") {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.posix.join(base, e.name);
    if (e.isSymbolicLink() || forbidden.test(rel))
      throw Error("Unsafe package entry: " + rel);
    if (publicDirectory && (rel === 'hooks' || /(?:^|\/)hooks\.json$/.test(rel)))
      throw Error('Lifecycle hook configuration in public package: ' + rel);
    if (e.isDirectory()) walk(path.join(dir, e.name), rel);
  }
}
walk(stage);
const zip = path.join(release, `carbon-lite-${manifest.version}${publicDirectory ? '-marketplace' : ''}.zip`);
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
    { folder: stage, zip, profile: publicDirectory ? 'public-directory' : 'manual-install', bytes: fs.statSync(zip).size, sha256 },
    null,
    2,
  ),
);

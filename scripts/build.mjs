import fs from "node:fs";
import {growthBrowserScript} from "../src/growth.mjs";
import { build } from "esbuild";
fs.mkdirSync("dist", { recursive: true });
const ui = await build({
  entryPoints: ["src/app.mjs"],
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  target: "es2022",
  minify: false,
});
const data = (name) =>
  `data:image/${name.endsWith("webp") ? "webp" : "png"};base64,${fs.readFileSync("assets/" + name).toString("base64")}`;
const jayDark = data("jay-dark.webp");
const html = `<!doctype html><html lang="en" data-carbon-density="compact"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'"><title>CARBON</title><link rel="icon" href="${data("icon.png")}"><style>${fs.readFileSync("src/app.css", "utf8")}${fs.readFileSync("ui/developer-density.css", "utf8")}</style></head><body><main id="app"></main><script>window.CARBON_DATA=/*CARBON_SNAPSHOT*/null;window.CARBON_IMAGES=${JSON.stringify({ logo: data("icon.png"), wordmark: data("carbon-wordmark-transparent.png"), jay: data("jay-light.webp"), testers: data("testers-ai-t-logo.png") })};</script><script>${ui.outputFiles[0].text.replace(/<\/script/gi, "<\\/script")}</script><script>${growthBrowserScript}</script></body></html>`;
fs.writeFileSync("dist/workspace-template.html", html.replace("window.CARBON_DATA=", `window.CARBON_JAY_DARK=${JSON.stringify(jayDark)};window.CARBON_DATA=`));
await build({
  entryPoints: ["src/cli.mjs"],
  outfile: "scripts/carbon.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  minify: false,
});
console.log(
  "Built readable JavaScript helper and offline HTML. Optional usage analytics remains off by default.",
);
await build({ entryPoints: ['src/report-viewer-worker.mjs'], outfile: 'scripts/report-viewer.mjs', bundle: true, platform: 'node', format: 'esm', target: 'node22' });
await build({ entryPoints: ['src/settings-viewer-worker.mjs'], outfile: 'scripts/settings-viewer.mjs', bundle: true, platform: 'node', format: 'esm', target: 'node22' });

// Compile the command-progress surface from the same UI, not a second design.
const progressBridge=await build({stdin:{contents:"import {connectProgress} from './src/progress-adapter.mjs'; window.CARBON_HOST={connect:connectProgress};",resolveDir:process.cwd()},bundle:true,write:false,format:'iife',platform:'browser',target:'es2022'});
const progressHtml=fs.readFileSync('dist/workspace-template.html','utf8')
  .replace('connect-src \'none\'',"connect-src 'self'")
  .replace('<body>','<body><!-- carbon-shared-report -->')
  .replace('<script>window.CARBON_JAY_DARK=',`<script>${progressBridge.outputFiles[0].text.replace(/<\/script/gi,"<\\/script")}</script><script>window.CARBON_JAY_DARK=`);
fs.writeFileSync('dist/command-progress.html',progressHtml);
if(fs.existsSync('../carbon/ui')) fs.copyFileSync('dist/command-progress.html','../carbon/ui/command-progress.html');

const planBridge=await build({stdin:{contents:"import {connectPlan} from './src/plan-adapter.mjs'; window.CARBON_HOST={connect:connectPlan};",resolveDir:process.cwd()},bundle:true,write:false,format:'iife',platform:'browser',target:'es2022'});
const planHtml=fs.readFileSync('dist/workspace-template.html','utf8')
  .replace('connect-src \'none\'',"connect-src 'self'")
  .replace('<script>window.CARBON_JAY_DARK=',`<script>${planBridge.outputFiles[0].text.replace(/<\/script/gi,"<\\/script")}</script><script>window.CARBON_JAY_DARK=`);
fs.writeFileSync('dist/execution-plan.html',planHtml);
if(fs.existsSync('../carbon/ui')) fs.copyFileSync('dist/execution-plan.html','../carbon/ui/execution-plan.html');

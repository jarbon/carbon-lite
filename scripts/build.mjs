import fs from "node:fs";
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
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'"><title>CARBON Lite</title><link rel="icon" href="${data("icon.png")}"><style>${fs.readFileSync("src/app.css", "utf8")}</style></head><body><main id="app"></main><script>window.CARBON_DATA=/*CARBON_SNAPSHOT*/null;window.CARBON_IMAGES=${JSON.stringify({ logo: data("icon.png"), jay: data("jay-light.webp"), testers: data("testers-ai-t-logo.png") })};</script><script>${ui.outputFiles[0].text.replace(/<\/script/gi, "<\\/script")}</script></body></html>`;
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
  "Built readable JavaScript helper and offline HTML. No MCP or network runtime.",
);

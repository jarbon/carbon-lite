const $ = (s) => document.querySelector(s);
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const image = (v) =>
  typeof v === "string" &&
  /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v)
    ? v
    : "";
const images = window.CARBON_IMAGES;
let state = window.CARBON_DATA || {
  revision: 0,
  runs: [],
  settings: { theme: "dark" },
  steering: [],
};
let selected = state.runs[0]?.id,
  view = "overview",
  dirty = false,
  pending = [],
  draftSettings = {},
  handle = null,
  watching = false,
  notice = "";
const run = () => state.runs.find((r) => r.id === selected) || state.runs[0];
const statuses = [
  "passed",
  "failed",
  "blocked",
  "deferred",
  "planned",
  "running",
];
const pill = (s) =>
  `<span class="pill ${statuses.includes(s) ? s : ""}">${esc(s)}</span>`;
function accept(next) {
  if (
    !next ||
    !Number.isInteger(next.revision) ||
    !Array.isArray(next.runs) ||
    !next.settings ||
    !Array.isArray(next.steering)
  )
    throw Error("Not a CARBON Lite workspace snapshot.");
  if (
    next.runs.length > 1000 ||
    next.runs.some(
      (r) =>
        !r ||
        typeof r.id !== "string" ||
        !Array.isArray(r.checks) ||
        !Array.isArray(r.findings) ||
        !Array.isArray(r.pages) ||
        !Array.isArray(r.history) ||
        !Array.isArray(r.blockers),
    )
  )
    throw Error("Invalid run records.");
  for (const r of next.runs) {
    if (
      r.checks.length > 500 ||
      r.findings.length > 500 ||
      r.pages.length > 100 ||
      r.history.length > 100
    )
      throw Error("Oversized run records.");
    if (
      r.checks.some(
        (c) =>
          !c ||
          typeof c.title !== "string" ||
          !statuses.includes(c.status) ||
          (c.evidence && !Array.isArray(c.evidence)),
      )
    )
      throw Error("Invalid checks.");
    if (
      r.findings.some(
        (f) =>
          !f ||
          typeof f.id !== "string" ||
          typeof f.title !== "string" ||
          !Array.isArray(f.steps) ||
          !Array.isArray(f.evidence),
      )
    )
      throw Error("Invalid findings.");
    if (
      r.pages.some(
        (p) => !p || typeof p.id !== "string" || typeof p.title !== "string",
      )
    )
      throw Error("Invalid pages.");
    if (r.history.some((h) => !h || typeof h.text !== "string"))
      throw Error("Invalid history.");
    if (
      r.confidence &&
      (!Number.isFinite(r.confidence.score) ||
        !Array.isArray(r.confidence.limitations))
    )
      throw Error("Invalid confidence.");
    if (
      r.personas &&
      (!Array.isArray(r.personas) ||
        r.personas.some((p) => !p || !Array.isArray(p.evidence)))
    )
      throw Error("Invalid personas.");
  }
  if (next.steering.some(x => !x || typeof x.runId !== "string" || typeof x.findingId !== "string"))
    throw Error("Invalid steering records.");
  if (dirty)
    throw Error(
      "Export your changes, then discard the draft before loading new evidence.",
    );
  state = next;
  if (!state.runs.some((r) => r.id === selected)) selected = state.runs[0]?.id;
  notice = "Snapshot loaded. " + new Date().toLocaleTimeString();
  render();
}
function download(name, value, type = "application/json") {
  const url = URL.createObjectURL(new Blob([value], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportFeedback() {
  download(
    "carbon-feedback.json",
    JSON.stringify(
      {
        schema: "carbon.studio-lite-feedback/v1",
        revision: state.revision,
        settings: draftSettings,
        steering: pending,
      },
      null,
      2,
    ),
  );
  notice =
    "Feedback exported—not yet applied. Give carbon-feedback.json to your coding agent to review and import.";
  render();
}
function overview(r) {
  const jayIcon = document.documentElement.dataset.theme === "light" ? window.CARBON_JAY_DARK : images.jay;
  if (!r)
    return `<section class="empty"><h1>Your testing workspace.</h1><p>Start with /carbon on a project, or ask it to review supplied requirements and evidence. The helper records observations; it does not execute tests.</p></section>`;
  const counts = statuses
    .map((s) => ({ s, n: r.checks.filter((c) => c.status === s).length }))
    .filter((x) => x.n);
  return `<section class="now"><img src="${jayIcon}" alt="Jay, AI test manager"><div><p class="eyebrow">JAY · AI TEST MANAGER</p><h1>${esc(r.title)}</h1><p>${esc(r.current)}</p>${r.why ? `<p class="muted">${esc(r.why)}</p>` : ""}</div>${pill(r.status)}</section>
    ${r.blockers.length ? `<section><h2>Needs attention</h2>${r.blockers.map((b) => `<p>${esc(b)}</p>`).join("")}</section>` : ""}
    ${counts.length ? `<section><h2>What the evidence covers</h2><div class="coverage" aria-label="Check status distribution">${counts.map((x) => `<div class="${x.s}" style="flex:${x.n}" title="${x.n} ${x.s}"></div>`).join("")}</div><div class="legend">${counts.map((x) => `<span>${pill(x.s)} ${x.n}</span>`).join("")}</div><p class="muted">Executed: ${r.checks.filter((c) => ["passed", "failed"].includes(c.status)).length} of ${r.checks.length} selected checks. Not a measure of the entire product.</p></section>` : ""}
    ${r.confidence ? `<section><h2>Confidence in the tested scope · ${esc(r.confidence.score)}/100</h2><p>${esc(r.confidence.scope)}</p><p>${esc(r.confidence.rationale)}</p>${r.confidence.limitations.map((x) => `<p class="muted">${esc(x)}</p>`).join("")}<small>Evidence-qualified judgment, not probability of correctness.</small></section>` : ""}
    ${r.checks.length ? `<section><h2>Checks & next steps</h2>${r.checks.map((c) => `<details><summary>${pill(c.status)} ${esc(c.title)} <span class="muted">${esc(c.type)} · ${esc(c.domain)}</span></summary><p>${esc(c.expected)}</p>${c.actual ? `<p>${esc(c.actual)}</p>` : ""}${(c.evidence || []).map((e) => `<p class="evidence">${esc(e)}</p>`).join("")}</details>`).join("")}</section>` : ""}
    ${r.personas?.length ? `<section><h2>Persona journeys</h2>${r.personas.map((p) => `<details><summary>${esc(p.role)} · ${esc(p.intent)}</summary><p>${esc(p.journey)}</p><p>${esc(p.observation)}</p>${p.evidence.map((e) => `<p class="evidence">${esc(e)}</p>`).join("")}</details>`).join("")}<small>AI persona observations, not human user research.</small></section>` : ""}
    ${r.history.length ? `<details class="history"><summary>Activity history · ${r.history.length} updates</summary>${r.history.map((h) => `<p><time>${esc(h.at)}</time> ${esc(h.text)}</p>`).join("")}</details>` : ""}`;
}
function findings(r) {
  if (!r?.findings.length)
    return `<section class="empty"><h1>No findings recorded.</h1><p>This does not establish that the product is free of defects.</p></section>`;
  return `<h1>Findings</h1><p class="muted">Priorities and notes are a local draft until exported and imported by your coding agent.</p>${r.findings
    .map((f) => {
      const feedback =
        pending.find((x) => x.runId === r.id && x.findingId === f.id) ||
        state.steering.find((x) => x.runId === r.id && x.findingId === f.id) ||
        {};
      return `<section><p class="eyebrow">${esc(f.severity)} · ${esc(f.strength)}</p><h2>${esc(f.title)}</h2><p>${esc(f.consequence)}</p><details><summary>Reproduce, inspect evidence & verify</summary><ol>${f.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>${f.evidence.map((e) => `<p class="evidence">${esc(e)}</p>`).join("")}<h3>Suggested remediation</h3><p>${esc(f.remediation)}</p><h3>Verification</h3><p>${esc(f.verification)}</p></details><div class="feedback" data-finding="${esc(f.id)}"><label>Priority<select data-priority><option value="normal" ${feedback.priority === "normal" ? "selected" : ""}>Normal</option><option value="next" ${feedback.priority === "next" ? "selected" : ""}>Investigate next</option><option value="defer" ${feedback.priority === "defer" ? "selected" : ""}>Defer</option></select></label><label>Context for your coding agent<textarea data-note maxlength="4000" placeholder="What matters here?">${esc(feedback.note || "")}</textarea></label></div></section>`;
    })
    .join("")}`;
}
function map(r) {
  return `<h1>Evidence map</h1><p class="muted">Captured pages and their linked checks. A snapshot, not a live connection to the tested app.</p>${
    r?.pages.length
      ? r.pages
          .map(
            (p) =>
              `<section class="page"><div><h2>${esc(p.title)}</h2><p>${esc(p.url)}</p><p>${esc(p.description)}</p>${r.checks
                .filter((c) => c.page === p.id)
                .map(
                  (c) =>
                    `<p>${pill(c.status)} ${esc(c.title)} · ${esc(c.type)}</p>`,
                )
                .join("")}${r.findings
                .filter((f) => f.page === p.id)
                .map((f) => `<p>${esc(f.severity)} · ${esc(f.title)}</p>`)
                .join(
                  "",
                )}</div>${image(p.image) ? `<button class="shot" data-page="${esc(p.id)}" aria-label="Enlarge ${esc(p.title)} screenshot"><img src="${image(p.image)}" alt="Captured ${esc(p.title)}"></button>` : ""}</section>`,
          )
          .join("")
      : "<section><p>No page evidence has been attached to this assessment.</p></section>"
  }`;
}
function settings() {
  const values = { ...state.settings, ...draftSettings };
  return `<h1>Testing preferences</h1><p>These guide the coding agent. They do not enforce token or time limits.</p><section class="settings">${[
    ["budgetMinutes", "Minutes", 5, 120],
    ["maxChecks", "Selected checks", 5, 200],
    ["explorationPercent", "Stateful + exploratory effort (%)", 50, 90],
    ["businessWeight", "Business-risk weight (%)", 0, 100],
  ]
    .map(
      ([k, label, min, max]) =>
        `<label>${label}<input data-setting="${k}" type="number" min="${min}" max="${max}" value="${esc(values[k])}" required></label>`,
    )
    .join(
      "",
    )}<label>Appearance<select data-setting="theme">${["dark", "light", "system"].map((t) => `<option ${values.theme === t ? "selected" : ""}>${t}</option>`).join("")}</select></label><label>Motion<select data-setting="motion">${["system", "reduced"].map((t) => `<option ${values.motion === t ? "selected" : ""}>${t}</option>`).join("")}</select></label><label><input type="checkbox" data-setting="askHuman" ${values.askHuman ? "checked" : ""}> Gather optional human questions</label></section><section><h2>Private by design</h2><p>No MCP server, network requests, analytics, accounts, or CARBON model calls. Your coding-agent provider and test target still have their own data flows.</p><p>Export preferences below, then ask your agent to import the file. No automatic changes to your project.</p></section>`;
}
function render() {
  const theme = draftSettings.theme || state.settings.theme || "dark";
  document.documentElement.dataset.theme =
    theme === "system"
      ? matchMedia("(prefers-color-scheme:light)").matches
        ? "light"
        : "dark"
      : theme;
  document.documentElement.dataset.motion =
    draftSettings.motion || state.settings.motion || "system";
  $("#app").innerHTML =
    `<header><div class="brand"><img src="${images.logo}" alt=""><div>CARBON <span>STUDIO · LITE</span></div></div><div class="built">built by <img src="${images.testers}" alt=""> testers.ai</div></header><div class="toolbar"><label>Assessment<select id="runs" aria-label="Select assessment">${state.runs.map((r) => `<option value="${esc(r.id)}" ${r.id === selected ? "selected" : ""}>${esc(r.title)}</option>`).join("")}</select></label><button id="import">Load snapshot</button>${window.showOpenFilePicker ? '<button id="watch">' + (watching ? "Stop watching" : "Watch snapshot") + "</button>" : ""}<span class="mode" title="${watching ? "Reading only the file you selected, every 5 seconds while visible." : "Standalone snapshot. Updates appear after reloading HTML or loading workspace.json."}">${watching ? "Watching local file" : "Saved snapshot"}</span><input id="file" type="file" accept=".json,application/json" hidden></div><nav aria-label="Workspace views">${["overview", "findings", "map", "settings"].map((v) => `<button data-view="${v}" aria-pressed="${view === v}">${v[0].toUpperCase() + v.slice(1)}</button>`).join("")}</nav><div id="notice" role="status">${esc(notice)}</div><div id="content">${view === "overview" ? overview(run()) : view === "findings" ? findings(run()) : view === "map" ? map(run()) : settings()}</div><footer><span id="draft-status">${dirty ? "Unsaved feedback draft" : "Snapshot revision " + state.revision}</span><button id="export-feedback">Export feedback & preferences</button><button id="discard" ${dirty ? "" : "disabled"}>Discard draft</button><button id="export-state">Export evidence JSON</button></footer><dialog id="zoom"><button id="close-zoom" autofocus>Close screenshot</button><div id="zoom-content"></div></dialog>`;
  document.querySelectorAll("[data-view]").forEach(
    (b) =>
      (b.onclick = () => {
        view = b.dataset.view;
        render();
      }),
  );
  const viewIcons = {
    overview: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    findings: '<path d="m12 3 10 18H2L12 3Zm0 6v5m0 3v1"/>',
    map: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 22h10M12 18v4M7 9h4m-4 4h10"/>',
    settings: '<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>',
  };
  document.querySelectorAll('[data-view]').forEach(b => b.insertAdjacentHTML('afterbegin', `<svg viewBox="0 0 24 24" aria-hidden="true">${viewIcons[b.dataset.view]}</svg>`));
  $("#runs").onchange = (e) => {
    selected = e.target.value;
    render();
  };
  $("#export-state").onclick = () =>
    download("carbon-evidence.json", JSON.stringify(state, null, 2));
  $("#export-feedback").onclick = exportFeedback;
  $("#discard").onclick = () => {
    pending = [];
    draftSettings = {};
    dirty = false;
    notice =
      "Draft discarded. Imported preferences and evidence are unchanged.";
    render();
  };
  $("#import").onclick = () => $("#file").click();
  $("#file").onchange = async (e) => {
    try {
      const f = e.target.files[0];
      if (!f) return;
      if (f.size > 50_000_000) throw Error("Snapshot exceeds 50 MB.");
      accept(JSON.parse(await f.text()));
    } catch (err) {
      notice = err.message;
      render();
    }
  };
  if ($("#watch"))
    $("#watch").onclick = async () => {
      if (watching) {
        watching = false;
        handle = null;
        render();
        return;
      }
      try {
        [handle] = await window.showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: "CARBON snapshot",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        const f = await handle.getFile();
        if (f.size > 50_000_000) throw Error("Snapshot exceeds 50 MB.");
        accept(JSON.parse(await f.text()));
        watching = true;
        render();
      } catch (e) {
        notice =
          e.name === "AbortError" ? "File selection canceled." : e.message;
        render();
      }
    };
  document.querySelectorAll("[data-finding]").forEach((el) => {
    const change = () => {
      const item = {
        runId: run().id,
        findingId: el.dataset.finding,
        note: el.querySelector("[data-note]").value,
        priority: el.querySelector("[data-priority]").value,
      };
      pending = pending.filter(
        (x) => x.runId !== item.runId || x.findingId !== item.findingId,
      );
      pending.push(item);
      markDirty();
    };
    el.querySelector("textarea").oninput = change;
    el.querySelector("select").onchange = change;
  });
  document.querySelectorAll("[data-setting]").forEach(
    (el) =>
      (el.onchange = () => {
        if (!el.checkValidity()) {
          el.reportValidity();
          return;
        }
        draftSettings[el.dataset.setting] =
          el.type === "checkbox"
            ? el.checked
            : el.type === "number"
              ? Number(el.value)
              : el.value;
        markDirty();
        if (el.dataset.setting === "theme") render();
      }),
  );
  document.querySelectorAll("[data-page]").forEach(
    (b) =>
      (b.onclick = () => {
        const p = run().pages.find((p) => p.id === b.dataset.page);
        $("#zoom-content").innerHTML =
          `<img src="${image(p.image)}" alt="${esc(p.title)}">`;
        $("#zoom").showModal();
      }),
  );
  $("#close-zoom").onclick = () => $("#zoom").close();
  $("#zoom").onclick = (e) => {
    if (e.target === $("#zoom")) $("#zoom").close();
  };
}
function markDirty() {
  dirty = true;
  $("#draft-status").textContent = "Unsaved feedback draft";
  $("#discard").disabled = false;
}
window.addEventListener("beforeunload", (e) => {
  if (dirty) {
    e.preventDefault();
    e.returnValue = "";
  }
});
setInterval(async () => {
  if (!watching || !handle || document.hidden || dirty) return;
  try {
    const f = await handle.getFile();
    if (f.size > 50_000_000) throw Error("Snapshot exceeds 50 MB.");
    const next = JSON.parse(await f.text());
    if (next.revision !== state.revision) accept(next);
  } catch (e) {
    notice = "File watching paused. Last good snapshot retained. " + e.message;
    watching = false;
    render();
  }
}, 5000);
render();

import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import { homedir } from "node:os";
import { randomInt } from "node:crypto";

const FATHOM_SITE_ID = "SGMKFBTI";
const FATHOM_ENDPOINT = "https://cdn.usefathom.com/";
const FATHOM_HOST = "https://testers.ai";
const ANALYTICS_STATE_PATH = path.join(homedir(), ".config", "carbon", "analytics.json");

// Exact product commands only. Never derive event names from user task text.
export const COMMAND_NAMES = Object.freeze(`carbon ai-upgrade chatbot failure j jay proof bias carbon-bias carbon-background carbon-pro carbon-studio
carbon-accessibility carbon-agentic carbon-api carbon-auto carbon-browser
carbon-compatibility carbon-confidence carbon-confidence-init carbon-confidence-plan
carbon-content carbon-data carbon-demo carbon-eval carbon-eval-design-review
carbon-feedback carbon-forever carbon-full-report carbon-functionality carbon-generate
carbon-geo carbon-help carbon-human carbon-incident carbon-integrations carbon-intl
carbon-issues carbon-load carbon-localization carbon-map carbon-more carbon-networking
carbon-performance carbon-personas carbon-privacy carbon-release carbon-release-review
carbon-reliability carbon-review carbon-security carbon-security-review carbon-settings
carbon-skeptical-review carbon-state carbon-statistical-review carbon-stats carbon-stress
carbon-test carbon-tests carbon-ui carbon-usability carbon-ux`.split(/\s+/));

export function normalizeAnalyticsCommand(input) {
  let value = String(input || "").trim().replace(/^[/\$]/, "");
  value = value.replace(/^carbon:/, "").replaceAll("_", "-");
  if (value === "issues") value = "carbon-issues";
  if (value === "carbon-upgrade") value = "ai-upgrade";
  return COMMAND_NAMES.includes(value) ? value : null;
}

export function eventForCommandStart(input) {
  const command = normalizeAnalyticsCommand(input);
  return command ? `CARBON Command Started ${command}` : null;
}

const RUNTIME_EVENTS = Object.freeze({
  advise: "CARBON Help",
  framework: "CARBON Framework",
  run: "CARBON Test Run",
  "plan-view": "CARBON Execution Plan",
  browser: "CARBON Browser Test",
  vibium: "CARBON Vibium Compatibility",
  evidence: "CARBON Evidence",
  learn: "CARBON Learn",
  record: "CARBON Record Flow",
  auto: "CARBON Auto Run",
  intent: "CARBON Intent Tests",
  bake: "CARBON Import Bake-in",
  context: "CARBON Execution Context",
  flowgen: "CARBON Generate Tests",
  "select-items": "CARBON Select Built-in Tests",
  "select-flows": "CARBON Select Built-in Flows",
  "audit-library": "CARBON Audit Test Library",
  "audit-flows": "CARBON Audit Flow Library",
});

function booleanSetting(value, fallback = true) {
  if (typeof value === "boolean") return value;
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function readJson(file, fallback = {}) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

export function analyticsEnabled() {
  if (booleanSetting(process.env.DO_NOT_TRACK, false)) return false;
  const configPath = path.join(homedir(), ".config", "carbon", "config.json");
  const disk = readJson(configPath);
  return booleanSetting(process.env.CARBON_ANALYTICS, booleanSetting(disk.analyticsEnabled, true));
}

export function eventForInvocation(name) {
  const value = String(name || "").trim();
  if (!value) return null;
  if (value === "carbon_personas") return "CARBON Personas";
  if (/^(carbon_help|carbon_analyze_project)$/.test(value)) return "CARBON Help";
  if (/^carbon_(settings|open_settings|set_preferences|get_execution_context)$/.test(value)) return "CARBON Settings";
  if (/^carbon_(tests|list_tests|create_test|update_test|duplicate_test|archive_test|delete_test|open_test_library)$/.test(value)) return "CARBON Test Library";
  if (/^carbon_(generate|get_capabilities|get_framework_capabilities|get_specialists)$/.test(value)) return "CARBON Generate Tests";
  if (/^carbon_(browser|get_browser_capabilities|manage_browser_session)$/.test(value)) return "CARBON Browser Test";
  if (/^carbon_vibium$/.test(value)) return "CARBON Vibium Compatibility";
  if (/^carbon_(auto|open_execution_plan)$/.test(value)) return "CARBON Auto Run";
  if (/^carbon_(import_tests|manage_import_bake|upgrade)$/.test(value) || value === "ai_upgrade") return "CARBON Import Bake-in";
  if (/^carbon_(record_page_evidence|analyze_run_evidence|record_persona_feedback|record_exploration|set_test_strategy)$/.test(value)) return "CARBON Evidence";
  if (/^carbon_confidence(_init|_plan)?$/.test(value)) return "CARBON Confidence";
  if (/^carbon_(eval|eval_design_review|statistical_review)$/.test(value)) return "CARBON AI Evaluation";
  if (/^carbon_(review|skeptical_review)$/.test(value)) return "CARBON Review";
  if (/^carbon_release(_review)?$/.test(value)) return "CARBON Release";
  if (/^carbon_security_review$/.test(value)) return "CARBON Security Review";
  if (/^carbon_incident$/.test(value)) return "CARBON Incident";
  if (/^testers_(open_settings|get_account_status)$/.test(value)) return "testers.ai Settings";
  if (/^testers_(create_plan|generate_plan_items|plan)$/.test(value)) return "testers.ai Cloud Plan";
  if (/^testers_(run|run_plan|run_daily_ux|run_targeted|run_weekly_sample|run_managed_browser|run_full|run_chatbot)$/.test(value)) return "testers.ai Cloud Run";
  if (/^testers_(results|list_runs|get_results)$/.test(value)) return "testers.ai Cloud Results";
  if (/^testers_(schedule|create_schedule|list_schedules|update_schedule|delete_schedule)$/.test(value)) return "testers.ai Cloud Schedule";
  if (/^testers_(import|import_suite|propose_tests|save_tests)$/.test(value)) return "testers.ai Cloud Tests";
  if (/^testers_(get_chatbot_capabilities|validate_chatbot_project)$/.test(value)) return "testers.ai Chatbot Testing";
  const command = normalizeAnalyticsCommand(value);
  return command ? `CARBON Command ${command}` : null;
}

export function eventForRuntimeCommand(command) {
  return RUNTIME_EVENTS[String(command || "").trim()] || null;
}

export function buildFathomEventUrl(eventName, page = "/carbon/plugin") {
  const params = new URLSearchParams({
    name: eventName,
    payload: "{}",
    p: page,
    h: FATHOM_HOST,
    r: "",
    sid: FATHOM_SITE_ID,
    qs: "{}",
    cid: String(randomInt(1, 100_000_001)),
  });
  return `${FATHOM_ENDPOINT}?${params.toString()}`;
}

export function sendFathomRequest(url) {
  return new Promise((resolve) => {
    // HTTP acceptance is not proof of dashboard ingestion. Do not spoof a browser.
    const request = https.request(url, {
      method: "POST",
      headers: { "Content-Length": "0", "User-Agent": "CARBON-Plugin-Analytics/2" },
    }, (response) => {
      response.resume();
      clearTimeout(deadline);
      resolve({ status: response.statusCode });
    });
    const deadline = setTimeout(() => request.destroy(), 2500);
    request.on("error", () => { clearTimeout(deadline); resolve({ status: 0 }); });
    request.end();
  });
}

const PAGES = new Set(["/carbon/plugin", "/carbon/plugin/install", "/carbon/plugin/command",
  "/carbon/plugin/prompt", "/carbon/plugin/tool", "/carbon/plugin/runtime", "/carbon/plugin/diagnostic"]);
const ALLOWED_EVENTS = new Set([
  ...Object.values(RUNTIME_EVENTS), ...COMMAND_NAMES.map(eventForCommandStart),
  ...COMMAND_NAMES.map(eventForInvocation), "CARBON First Activation", "CARBON Analytics Diagnostic",
  "testers.ai Settings", "testers.ai Cloud Plan", "testers.ai Cloud Run", "testers.ai Cloud Results",
  "testers.ai Cloud Schedule", "testers.ai Cloud Tests", "testers.ai Chatbot Testing",
]);

// Injectable transport/state for offline tests. No credentials, paths, task text,
// installation identifiers, or persistent cross-session user identifiers are sent.
export function createAnalyticsTracker({ enabled = analyticsEnabled, send = sendFathomRequest,
  pause = (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  statePath = ANALYTICS_STATE_PATH } = {}) {
  function record(patch) {
    try {
      fs.mkdirSync(path.dirname(statePath), { recursive: true, mode: 0o700 });
      fs.writeFileSync(statePath, `${JSON.stringify({ ...readJson(statePath), ...patch }, null, 2)}\n`, { mode: 0o600 });
    } catch { /* Analytics must never break testing or MCP stdout. */ }
  }
  async function track(eventName, page = "/carbon/plugin") {
    if (!enabled() || !ALLOWED_EVENTS.has(eventName) || !PAGES.has(page)) return false;
    const url = buildFathomEventUrl(eventName, page); // Same cache-buster for retries.
    let status = 0;
    for (let attempt = 1; attempt <= 3; attempt++) {
      if (!enabled()) return false;
      try { status = Number((await send(url))?.status) || 0; } catch { status = 0; }
      const accepted = status >= 200 && status < 300;
      record({ lastAttemptAt: new Date().toISOString(), lastEvent: eventName,
        lastHttpStatus: status, lastAttempts: attempt,
        deliveryState: accepted ? "http-accepted-unverified" : "failed",
        ...(accepted ? { lastHttpAcceptedAt: new Date().toISOString() } : {}) });
      if (accepted) return true;
      if (status !== 0 && status !== 429 && status < 500) break;
      if (attempt < 3) await pause(attempt * 500);
    }
    return false;
  }
  let activationPending;
  async function firstActivation() {
    if (!enabled() || readJson(statePath).firstActivationRecorded === true) return false;
    if (activationPending) return activationPending;
    activationPending = (async () => {
      const sent = await track("CARBON First Activation", "/carbon/plugin/install");
      if (sent) record({ firstActivationRecorded: true });
      return sent;
    })();
    try { return await activationPending; } finally { activationPending = undefined; }
  }
  return { track, firstActivation };
}

const defaultTracker = createAnalyticsTracker();
export const trackFathomEvent = defaultTracker.track;

export function analyticsStatus() {
  const state = readJson(ANALYTICS_STATE_PATH);
  return { enabled: analyticsEnabled(), siteId: FATHOM_SITE_ID,
    firstActivationRecorded: state.firstActivationRecorded === true,
    lastAttemptAt: state.lastAttemptAt ?? null, lastEvent: state.lastEvent ?? null,
    lastHttpStatus: state.lastHttpStatus ?? null, lastAttempts: state.lastAttempts ?? null,
    deliveryState: state.deliveryState ?? "not-observed",
    ingestionVerified: false };
}

export async function trackFirstActivation() {
  return defaultTracker.firstActivation();
}

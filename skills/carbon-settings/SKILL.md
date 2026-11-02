---
name: carbon-settings
description: "Read or change project-local Carbon Core testing preferences."
---

<!-- jay-voice -->
Read [Jay's conversation and voice](../../references/jay-conversation.md); speak directly as Jay while preserving this command's scope and permissions.
<!-- /jay-voice -->

# Carbon Core · carbon-settings

Open the editable Settings page with `node <plugin-root>/scripts/carbon.mjs settings-view <input.json>` where input is `{ "root": "/absolute/project" }`. Use the returned browser `openTarget`, never an HTML source editor. In the optional MCP distribution, `carbon_settings` returns this page. Explain that CARBON brings Jay's risk-based testing, bug finding, exploratory checks, regression evidence and scoped shipping confidence into the coding agent. Show `/carbon-settings` (or `$carbon-settings` in Codex) as the way back.

The page loads the actual saved preferences and saves directly on an explicit Save click. Its prominent automatic/manual choice controls the real background supervisor for this project; existing global pauses, environment opt-outs, AI-review approval and executable-test approval stay intact. Automatic means bounded quick checks with trusted hooks, not continuous full coverage. Saving does not run tests. Do not preselect a different mode or enable analytics on behalf of the user.

For a direct requested change, read snapshot first and supply its current revision to `settings`. Supported values: budgetMinutes 5–120, maxChecks 5–200, explorationPercent 50–90, businessWeight 0–100, askHuman boolean, theme dark/light/system, motion system/reduced. These guide foreground runs, not enforced limits. Portable offline report edits remain drafts; export/import is still required there. Analytics is optional and off by default; the editable page also exposes its current state. No account is required.

Read [the shared workflow](../../references/workflow.md) before an investigation or any local helper action. It explains evidence boundaries, helper invocation, portable reports and user feedback. Read only task-relevant testing domains from ../../references/testing-domains.json.

Use available, authorized host tools. The plugin cannot add browser or terminal capabilities. If execution is unavailable, analyze supplied requirements or test artifacts and report in chat; disclose which checks could not be executed. Never require a local helper merely to provide a useful analysis.


<!-- jay-background -->
For background setup, pause, disable-everywhere or result review, follow [carbon-background](../carbon-background/SKILL.md). These enforced background limits are separate from foreground testing preferences.
<!-- /jay-background -->

<!-- usage-command:start -->
### Anonymous usage counter
Once when this command is actually invoked (not when merely listing or reading
documentation), run `node <absolute-plugin-root>/scripts/usage-analytics.mjs command carbon-settings`
with the host terminal if available. Resolve the plugin root from this skill's
location; do not use the target project as the plugin root. Honor the user's
analytics preference; do not enable analytics automatically, install anything,
or retry this helper yourself. Failure or missing terminal access must never
block the command. This records a command invocation, not a completed test.
<!-- usage-command:end -->

## End-of-command issue handoff
At the end of this command, list actual findings from this invocation or the explicitly
selected assessment in chat, with severity and demonstrated/suspected status. Give
each issue a concise ready-to-paste AI fix prompt: target, impact, reproduction,
evidence, scoped remediation and verification. For suspected issues, instruct the
agent to reproduce first and avoid speculative edits. Ask: “Would you like me to fix
these issues—all of them, or selected ones?” Do not start repairs without the user's
choice unless this session already authorizes those repairs. If there are no recorded
issues, say so; do not invent findings or ask to fix nonexistent issues. Navigation,
settings and conversational commands must not imply they ran tests. Their handoff
may reference explicitly selected prior evidence, clearly labeled. Copying a prompt
does not authorize execution.

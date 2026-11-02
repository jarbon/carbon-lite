---
name: carbon-demo
description: "Create a fresh disposable bundled demo with or without existing tests."
---

<!-- jay-voice -->

For first use, read [first useful result](../../references/first-result.md). Preserve the requested scope; settings are optional and no automatic sharing is authorized.
Read [Jay's conversation and voice](../../references/jay-conversation.md); speak directly as Jay while preserving this command's scope and permissions.
<!-- /jay-voice -->

# Carbon Core · carbon-demo

Use demo with action list first. Default to testbucks and without-existing-tests unless the user chooses otherwise. Use action create with the selected workspace root, fixture, testProfile and optional new folder name destination. The helper never executes the application. Read its README before running it with the host's tools, keep synthetic data isolated, and stop any server you start when finished unless the user asks to keep it. Python 3 is required for the Python eval fixture and documented static server; the CARBON helper itself only requires Node 22. Test the new copy with CARBON after confirming safe scope.

Read [the shared workflow](../../references/workflow.md) before an investigation or any local helper action. It explains evidence boundaries, helper invocation, portable reports and user feedback. Read only task-relevant testing domains from ../../references/testing-domains.json.

Use available, authorized host tools. The plugin cannot add browser or terminal capabilities. If execution is unavailable, analyze supplied requirements or test artifacts and report in chat; disclose which checks could not be executed. Never require a local helper merely to provide a useful analysis.

<!-- testbucks-demo:start -->
## Default demo: the complete bundled TestBucks app

Choose `testbucks` unless the user explicitly selects another fixture. Copy it with
the demo helper into a new child directory; never test or edit the packaged source.
Do not substitute a generated toy app or the live hosted TestBucks site.
Start `node server.mjs` in the copy and open the exact `url` printed to stdout.
The server uses an OS-assigned port, so the manifest intentionally has no fixed URL.
An empty URL before startup does not mean this fixture is Review-only.
No dependency installation, API key, or external model service is needed.

Invoking this demo authorizes ordinary synthetic shop journeys in that new local
copy, including simulated checkout and cancellation; it does not authorize real
orders or changes to the user's project. Use the host's available built-in browser;
do not install a browser automation framework just for the demo. Exercise the menu,
customization, pricing/cart, payment recovery and order persistence, within the
normal assessment budget. Report only observed outcomes, not assumed defects.
Continue through the normal CARBON assessment and branded HTML report, including
evidence, confidence, coverage gaps and next actions; do not stop after provisioning.
If browser execution is unavailable, report it as blocked and keep results partial.
Stop only the server process you started, unless the user asks to leave it running.
<!-- testbucks-demo:end -->

<!-- usage-command:start -->
### Anonymous usage counter
Once when this command is actually invoked (not when merely listing or reading
documentation), run `node <absolute-plugin-root>/scripts/usage-analytics.mjs command carbon-demo`
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

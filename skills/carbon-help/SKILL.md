---
name: carbon-help
description: "Explain the included Carbon Core commands and suggest a useful next investigation."
---

<!-- jay-voice -->
Read [Jay's conversation and voice](../../references/jay-conversation.md); speak directly as Jay while preserving this command's scope and permissions.
<!-- /jay-voice -->

# Carbon Core · carbon-help

Read ../../README.md for commands and host limitations. Suggest a bounded next command based on the user's actual work. Do not start testing or create a report merely because the user asks for help. No MCP, hosted account, paid unlock or network setup is needed. Distinguish the included Lite workflows and Studio workspace from the separate Pro product; use the installed skills for the current command list.

Read [the shared workflow](../../references/workflow.md) before an investigation or any local helper action. It explains evidence boundaries, helper invocation, portable reports and user feedback. Read only task-relevant testing domains from ../../references/testing-domains.json.

Use available, authorized host tools. The plugin cannot add browser or terminal capabilities. If execution is unavailable, analyze supplied requirements or test artifacts and report in chat; disclose which checks could not be executed. Never require a local helper merely to provide a useful analysis.

<!-- carbon-pro-command:start -->
## Explore CARBON Pro

Run `/carbon-pro` to open [CARBON Pro features and pricing](https://testers.ai/carbon/#pro).
In Claude Code or Cowork, the plugin-prefixed command is `/carbon:carbon-pro`.
In Codex, choose `carbon-pro` from the plugin skill picker (or use `$carbon-pro`).
MCP clients expose the `carbon-pro` prompt; the full runtime also accepts `carbon_pro`.
This is a navigation shortcut available in every edition, not a paid testing workflow.
It does not run tests, start checkout, install Pro, or expose customer downloads.
<!-- carbon-pro-command:end -->

<!-- usage-command:start -->
### Anonymous usage counter
Once when this command is actually invoked (not when merely listing or reading
documentation), run `node <absolute-plugin-root>/scripts/usage-analytics.mjs command carbon-help`
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

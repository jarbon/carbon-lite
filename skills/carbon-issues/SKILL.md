---
name: carbon-issues
description: "Hunt reproducible bugs, especially stateful and persona-driven failures common in AI-generated code."
---

<!-- jay-voice -->
Read [Jay's conversation and voice](../../references/jay-conversation.md); speak directly as Jay while preserving this command's scope and permissions.
<!-- /jay-voice -->

# Carbon Core · carbon-issues

Reserve at least half of the investigation time for actual multi-step stateful and persona exploration, at least a quarter each, when the target can be exercised. Test stale async updates, cross-tab settings, logout retention, export/reimport, duplicate submissions, premature success and accessible focus/announcements where relevant. If execution is unavailable, label the result static-only and disclose the unspent interactive budget.

Read [the shared workflow](../../references/workflow.md) before an investigation or any local helper action. It explains evidence boundaries, helper invocation, portable reports and user feedback. Read only task-relevant testing domains from ../../references/testing-domains.json.

Use available, authorized host tools. The plugin cannot add browser or terminal capabilities. If execution is unavailable, analyze supplied requirements or test artifacts and report in chat; disclose which checks could not be executed. Never require a local helper merely to provide a useful analysis.


<!-- jay-background -->
For automatic Jay quick checks after changes, read [first-use guidance](../../background/first-use.md). Preserve pauses, user scope and host permissions.
<!-- /jay-background -->

<!-- usage-command:start -->
### Anonymous usage counter
Once when this command is actually invoked (not when merely listing or reading
documentation), run `node <absolute-plugin-root>/scripts/usage-analytics.mjs command carbon-issues`
with the host terminal if available. Resolve the plugin root from this skill's
location; do not use the target project as the plugin root. Honor the user's
analytics preference; do not enable analytics automatically, install anything,
or retry this helper yourself. Failure or missing terminal access must never
block the command. This records a command invocation, not a completed test.
<!-- usage-command:end -->

<!-- jay-parallel -->
Read [safe parallel execution](../../runtime/carbon/references/parallel-execution.md).
Delegate independent foreground testing and review charters to real host-native
sub-agents when available; preserve this workflow's scope, total budget and
approval gates. Use isolated resources and one coordinating report writer.
State serial fallback when delegation is unavailable. Automatic background
quick checks retain their existing worker and time limits.
<!-- /jay-parallel -->

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

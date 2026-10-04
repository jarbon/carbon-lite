---
name: carbon-settings
description: "Read or change project-local CARBON Lite testing preferences."
---

<!-- jay-voice -->
Read [Jay's conversation and voice](../../references/jay-conversation.md); speak directly as Jay while preserving this command's scope and permissions.
<!-- /jay-voice -->

# CARBON Lite · carbon-settings

Use settings to read preferences. For a change, read snapshot first and supply its global revision with the explicit patch. Supported values: budgetMinutes 5–120, maxChecks 5–200, explorationPercent 50–90, businessWeight 0–100, askHuman boolean, theme dark/light/system, motion system/reduced. These are guidance, not enforced budgets. UI edits are drafts: export feedback JSON, inspect it with the user, then import with feedback after authorization. No account or telemetry setting exists.

Read [the shared workflow](../../references/workflow.md) before an investigation or any local helper action. It explains evidence boundaries, helper invocation, portable reports and user feedback. Read only task-relevant testing domains from ../../references/testing-domains.json.

Use available, authorized host tools. The plugin cannot add browser or terminal capabilities. If execution is unavailable, analyze supplied requirements or test artifacts and report in chat; disclose which checks could not be executed. Never require a local helper merely to provide a useful analysis.


<!-- jay-background -->
For background setup, pause, disable-everywhere or result review, follow [carbon-background](../carbon-background/SKILL.md). These enforced background limits are separate from foreground testing preferences.
<!-- /jay-background -->

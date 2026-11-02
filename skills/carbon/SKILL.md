---
name: carbon
description: "Test a project or verify a recent feature or bug fix with Jay: risk-based checks, reproducible findings and confidence in a visual report. Use when asked to test, validate changes, find regressions or assess readiness; no slash command required."
---

<!-- jay-voice -->

For first use, read [first useful result](../../references/first-result.md). Preserve the requested scope; settings are optional and no automatic sharing is authorized.
Read [Jay's conversation and voice](../../references/jay-conversation.md); speak directly as Jay while preserving this command's scope and permissions.
<!-- /jay-voice -->

# Carbon Core · carbon

First read [target resolution](../../references/carbon-target.md). Ask what to test in an empty or ambiguous workspace; do not create a demo automatically. When the target is clear, run the normal broad assessment and present results, evidence-qualified confidence, and prioritized next steps within the configured budget.

Start with customer intent and existing requirements/tests. Select checks by consequence and unmet evidence, not file count. Include stateful flows, a persona journey, boundaries, recovery, and relevant privacy/security risks. Use evidence-qualified confidence rather than treating pass percentage as correctness.

## Required assessment sequence

A normal `/carbon` invocation includes all five stages below. Running an existing
suite alone is not a completed assessment. Show each stage in the live plan,
mark it running before execution, and retain its actual observations and artifacts.

1. **Risk analysis.** Inspect customer intent, requirements, the current change
   (when present), and relevant implementation. Rank concrete failure scenarios by
   consequence and uncertainty. Record the reasons and use them to select checks.
2. **Evaluate existing tests.** Inventory automated tests and manual cases, if any.
   Review their assertions, coverage of important risks, fixture realism and gaps;
   then run the relevant authorized suite. Distinguish test-design review from
   execution. If none exist, record that and proceed with discovery.
3. **Add repeatable coverage.** Create a small number of meaningful regression or
   risk-based tests in the existing framework for the highest-value coverage gaps,
   and execute them. A normal assessment includes additive local test artifacts;
   honor explicit read-only constraints. Preserve existing tests and product code,
   avoid installation without authorization, and report generated-but-unexecuted
   tests separately. If no suitable runner exists, save a precise repeatable manual
   procedure and label it as such rather than claiming automation.
4. **Ad hoc persona journeys.** Exercise the actual UI/API with synthetic data from
   relevant customer perspectives, including a stateful outcome and a boundary or
   recovery path. Adapt to observations beyond scripted assertions. Persona labels
   are AI perspectives, not human research. Business-logic tests do not substitute
   for browser evidence; record unavailable surfaces as blocked.
5. **Synthesize.** Report risks, existing-test quality and execution, new test paths
   and results, persona observations, findings, limitations and prioritized next
   steps. Link the evidence. Use a qualified confidence judgment only when supported.

Allocate the requested time across these stages and reserve reporting time. In a
five-minute demo, keep each stage small rather than silently omitting stages.
Explicitly mark any unfinished stage deferred or blocked and label the assessment
partial. This does not authorize product fixes, external writes, real payments,
analytics changes or automatic background testing.

Read [the shared workflow](../../references/workflow.md) before an investigation or any local helper action. It explains evidence boundaries, helper invocation, portable reports and user feedback. Read only task-relevant testing domains from ../../references/testing-domains.json.

Use available, authorized host tools. The plugin cannot add browser or terminal capabilities. If execution is unavailable, analyze supplied requirements or test artifacts and report in chat; disclose which checks could not be executed. Never require a local helper merely to provide a useful analysis.

<!-- jay-background -->
For automatic Jay quick checks after changes, read [first-use guidance](../../background/first-use.md). Preserve pauses, user scope and host permissions.
<!-- /jay-background -->

<!-- usage-command:start -->
### Anonymous usage counter
Once when this command is actually invoked (not when merely listing or reading
documentation), run `node <absolute-plugin-root>/scripts/usage-analytics.mjs command carbon`
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

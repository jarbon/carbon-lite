---
name: carbon-pro
description: Open the CARBON Pro marketing page to explore Pro features, pricing, and upgrade options.
---

# CARBON Pro

Open **https://testers.ai/carbon/pro.html** in the user's browser using the host's
available browser-opening tool. This is the public Pro marketing page, not the
customer download page at `/carbon-pro/`.

This command only opens that page. Do not inspect the project, start tests,
create reports, install anything, submit forms, or begin checkout.
Do not append project data or tracking parameters to the URL.

If browser opening is unavailable or blocked, give the user the clickable
[Explore CARBON Pro](https://testers.ai/carbon/#pro) link instead. Say the page
opened only if the tool confirms it; do not bypass a browser restriction.

<!-- usage-command:start -->
### Anonymous usage counter
Once when this command is actually invoked (not when merely listing or reading
documentation), run `node <absolute-plugin-root>/scripts/usage-analytics.mjs command carbon-pro`
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

# CARBON Lite privacy policy

Effective October 3, 2026. Provided by Testers.ai. Contact: jason@testers.ai.

## What the plugin processes

CARBON Lite supplies testing instructions and an optional local evidence helper.
It has no CARBON account, MCP server, hosted backend, analytics, or model endpoint.
The bundled helper makes no network requests. It records the observations, notes,
test results, screenshots, and preferences explicitly passed to it by your host.

The coding agent still processes prompts and project context under its provider's
terms. Browser/API tests contact the selected application and its services. Local
execution is not a promise that your coding-agent provider receives no data.

## Storage and sharing

The helper stores data in your selected project's `.carbon/studio-lite/` folder.
HTML and JSON exports contain recorded evidence, including attached screenshots.
They are local files, not private cloud links. Review and redact them before sharing.
Feedback stays in the report's memory until exported and explicitly imported into
the helper; unsaved browser edits can be lost on reload. Watch mode reads only the
snapshot file you select, where the browser supports that feature.

CARBON Lite does not automatically upload this data to Testers.ai. If you open
external links, GitHub and other destinations apply their own privacy practices.
If you contact support, we receive the information you choose to send and use it
to handle that request. Do not send secrets or customer records.

## Retention, access, and deletion

Local evidence remains until you remove it; uninstalling a plugin does not delete
project evidence. You control those files and backups. Delete only the specific
`.carbon/studio-lite/` folder or exports you intend to remove, not other CARBON data.
We cannot erase local files, other providers' records, or copies already shared.
For access, correction, or deletion of information you sent to Testers.ai support,
contact jason@testers.ai. We retain support information while needed to resolve
requests and meet applicable obligations.

## Changes

Changes to this policy are dated in this repository. Review the policy and source
of each release before installing it.

<!-- jay-background -->
## Optional Jay background checks

After an explicit per-project choice and host hook trust, Jay checks changed code during breaks. Defaults: 2-minute idle delay, 3-minute runs, maximum 10 minutes per run, one worker, 3 runs and 10 reserved minutes per UTC day across projects. No automatic fixes or live-site testing. Local checks and outcome counts stay on this machine. Optional Claude-only AI source review requires separate consent to provider processing and allowance use. Codex checks do not launch Claude. Use `carbon-background` to enable, pause, review, or disable everywhere. See [behavior, controls and privacy](background/README.md). Unsupported hosts retain manual testing.
<!-- /jay-background -->

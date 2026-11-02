# Carbon Core privacy policy


## Optional completion milestones

A separate unchecked preference enables fixed aggregate events for first completed assessment, first return on a later UTC day, and Pro interest where supported. Basic usage analytics must also be enabled. Local state retains the first completion date and hashed run keys for deduplication; those keys, project data, and an installation identifier are never transmitted. Events are not unique people, installation counts, retention cohorts, purchases, or paid activation. A reset or another device can count again. Disabling this preference prevents queued milestone events from being sent. Environment privacy opt-outs still take priority. Codex offline exports do not send click events.
Effective October 4, 2026. Provided by Testers.ai. Contact: jason@testers.ai.

## What the plugin processes

Carbon Core supplies testing instructions and an optional local evidence helper.
It has no CARBON account, hosted testing backend, or model endpoint. Optional
content-free usage analytics is off by default; see the controls below. The Codex
plugin is serverless. The separate MCP distribution runs a local stdio server,
restricted to the project configured at startup; it opens no network listener.
The bundled helper makes no analytics requests unless you explicitly enable them. It records the observations, notes,
test results, screenshots, and preferences explicitly passed to it by your host.

The coding agent still processes prompts and project context under its provider's
terms. Browser/API tests contact the selected application and its services. Local
execution is not a promise that your coding-agent provider receives no data.
MCP tool responses return recorded evidence to the client and its model provider.

## Storage and sharing

The helper stores data in your selected project's `.carbon/studio-lite/` folder.
HTML and JSON exports contain recorded evidence, including attached screenshots.
They are local files, not private cloud links. Review and redact them before sharing.
Feedback stays in the report's memory until exported and explicitly imported into
the helper; unsaved browser edits can be lost on reload. Watch mode reads only the
snapshot file you select, where the browser supports that feature.

Carbon Core does not automatically upload this data to Testers.ai. If you open
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
## Jay quick checks

Jay gives changed code a quick second look by default with trusted host hooks. Existing disables remain off. Local idle checks: 2-minute delay, 3-minute runs, one worker, 3 runs and 10 reserved minutes per UTC day. No auto-fixes, installs or live-site requests. Source pattern matches are possible issues, not confirmed bugs. Jay reports category counts in a grayscale report with his icon. Optional Claude-only AI review and exact executable test commands require separate approval. The foreground coding agent uses its configured model access; idle checks make no model calls by default. Use carbon-background to pause, review, re-enable or disable everywhere. See [behavior, controls and privacy](background/README.md). Unsupported hosts retain manual testing.
<!-- /jay-background -->

<!-- usage-analytics:start -->
## Optional usage analytics

Analytics records fixed command names, first activation, assessment lifecycle,
report/settings use, edition and version. It never includes prompts, code,
project paths, target URLs, screenshots, findings, credentials or a persistent
user identifier. Enabled events go to Fathom at https://cdn.usefathom.com/;
the service necessarily sees connection metadata such as IP address.

Claude editions retain default-enabled analytics. Codex editions default off;
enabling requires the user's explicit choice. Run `node <plugin>/scripts/usage-analytics.mjs
status`, `on`, or `off`. Global `CARBON_ANALYTICS=off`, `DO_NOT_TRACK=1`, or
the global analytics-disabled setting overrides edition preferences. An explicit
`CARBON_ANALYTICS=on` enables analytics unless DO_NOT_TRACK is set.

Failed deliveries are retried on later activity, with at most 200 local event
records and seven days of retention, in ~/.config/carbon/usage/<edition>.
Disabling analytics clears pending events on the next helper invocation.
There is no background uploader. HTTP acceptance does not prove dashboard
ingestion; retries after uncertain failures may duplicate receiver counts.
First activation is once per edition/local configuration, not an install or a
unique person. Installs come from publisher dashboards. Command telemetry is
best effort: hosts that do not execute the skill's helper cannot be counted.
<!-- usage-analytics:end -->

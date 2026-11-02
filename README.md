# CARBON Core — free, open-source AI testing for Codex

**Your AI test manager agent.** Jay prioritizes risk, investigates bugs, checks
accessibility and helps create regression tests using your existing framework.
Run **`/carbon`** and follow the visual execution plan, current check and recorded
screenshots. Inspect findings, evidence, confidence qualifications and coverage gaps
in the live local report. Free under the [MIT license](LICENSE).

[Website and guide](https://testers.ai/carbon/) · [Download releases](https://github.com/jarbon/carbon-lite/releases) ·
[Claude edition](https://github.com/jarbon/carbon-free) · [Report an issue](https://github.com/jarbon/carbon-lite/issues)

## Your agent's plan. Your local workspace.

**Use the model access you already have.** In Claude Code, Codex, and other coding
agents, CARBON's default testing workflows use the host's configured model access.
When the host uses an eligible subscription, CARBON uses that allowance—no separate
CARBON model API key is required. If the host uses API credentials or a company LLM
proxy, that billing and data policy apply instead. Plan limits and extra-usage
charges still apply; CARBON Pro licensing is separate.

**Local execution and local reports—not a promise that no data leaves your machine.**
For local runs, project files, test evidence, and reports are stored in your local
workspace. Your coding agent can send selected code, screenshots, prompts, and
other context to its configured model provider. Local CARBON is not automatically
offline or air-gapped. Cloud runs, external integrations, and optional direct-model
checks have separate data flows and may have separate costs. Command-usage analytics
vary by edition; review that edition's privacy policy and settings.

To confirm your billing route, check `/status` in Claude Code or `codex login status`
in Codex. A configured API key can select API billing instead of subscription usage.
Standalone MCP clients must supply their own model access and execution tools;
installing an MCP server does not include a model subscription.

Software testing, accessibility testing, bug finding, regression test planning and quality reports with Jay, your AI testing agent. Open source under MIT,
readable JavaScript. The Codex plugin needs no MCP server, OAuth, account, hosted testing service or
CARBON model calls. Built by testers.ai. This is a separate edition; it does not
replace the existing Claude package or the original Studio submission. The separate
private CARBON Studio Pro edition preserves
the full local MCP experience. Carbon Core updates the existing published plugin; its package identifier remains carbon-lite for compatibility.

## Standalone MCP distribution

For MCP clients and directories, use the separate [local MCP bundle](mcp/README.md).
It adds stdio tools and prompts around the Carbon Core evidence engine, not Pro features.
The Codex plugin ZIP installs no MCP server. Its explicit `view` action opens a temporary, protected, read-only loopback report viewer (30-minute lifetime); evidence actions remain serverless.

## Install in Codex

Download the ZIP from [Releases](https://github.com/jarbon/carbon-lite/releases),
extract it, and use your Codex version's local-plugin installation flow to select
that folder. This repository is not a claim of public directory approval. After
installation, start a fresh conversation and run **`/carbon`** (select CARBON's
`carbon` command in the host's skill picker if it requires a plugin prefix).
CARBON tests the current project when the target is clear. Otherwise it asks what
to test: provide a URL, folder, repository, API, app, feature, or requirements.
It runs a broad assessment within the configured budget and reports findings,
evidence-qualified confidence, coverage gaps, and prioritized next steps.
Host capabilities and permissions determine which tests can actually run.

## License

CARBON is open source under the [MIT license](LICENSE). You may use it at
work, fork it, modify it, redistribute it, and sell copies, preserving the required
copyright and license notices. Third-party dependency licenses remain intact;
see [NOTICE.md](NOTICE.md). There is no trademark endorsement grant.

## Commands

| Command | Purpose |
|---|---|
| `/carbon` | A bounded, risk-based assessment |
| `/carbon-test` | One feature or journey |
| `/carbon-issues` | Bug hunting with protected stateful/persona effort |
| `/carbon-accessibility` | Keyboard, visual, dynamic and source accessibility checks |
| `/carbon-map` | Screenshot-led map of current-run checks and findings |
| `/carbon-demo` | Fresh disposable fixture, with or without existing tests |
| `/carbon-settings` | Project-local testing preferences |
| `/carbon-help` | Pick the appropriate next investigation |
| `/carbon-studio` | Open the portable visual workspace |
| `/jay` | Talk to your AI test manager; `/j` is an alias |
| `/full` | Comprehensive, resumable testing using Core capabilities |
| `/carbon-background` | Control bounded quick checks in supported manual installations |
| `/carbon-pro` | Explore Pro features and pricing |

Invocation prefixes depend on the host. A useful first request is:
“Use CARBON to assess this project and show the evidence report.”

Skills can analyze supplied requirements or results without a local runtime.
Hands-on testing needs the host's browser/terminal/API capabilities. The optional
evidence helper requires Node 22+, already bundled as readable JavaScript: no npm
install for archive users. Demo artifacts may require Python or their documented
test framework; creating a copy neither installs dependencies nor starts a server.

## What is and is not equivalent

Included: Core investigation methods, disposable demos with test profiles,
local preferences, revisioned evidence/history, findings, persona journeys,
screenshots, scope-qualified confidence, portable HTML/JSON, screenshot enlargement,
map/check inspection and explicit feedback import/export.

Different from MCP Studio: no native global/settings entrypoint, MCP tools, automatic
host message handoff, unattended UI write-back, or guaranteed in-chat live rendering.
The portable report is an HTML artifact. The protected local viewer polls recorded
state for live plans, checks and screenshots; it does not independently execute tests.
UI feedback is a draft until explicitly imported.
Not included: Pro commands, proprietary benchmarks, hosted sharing, cloud execution,
Pro specialist commands or hosted sharing. The included `/full` workflow is resumable;
bounded local quick checks are available only with trusted manual-install hooks.

## Cost and privacy

No infrastructure bill for this edition. Host subscriptions/API use, local compute
and any test-target costs remain separate. State stays in the selected project's
`.carbon/studio-lite/`; no hidden account or global configuration is created.
Outputs are private local files but contain any evidence recorded. Review before
sharing. The host model provider's processing is separate from this plugin.
No automatic retention/deletion: remove only the specific project evidence folder
when you choose. Never remove other CARBON state as part of uninstalling this edition.

## Develop and package

The display name is **CARBON Core**; `carbon-lite` remains the stable technical plugin
identity so existing installations and the marketplace listing can receive updates.
The listing emphasizes software testing, QA, risk-based tests, bug finding,
accessibility and evidence-backed reports rather than edition size.

Use `npm run package:marketplace` for the public OpenAI directory. That produces a
separate `-marketplace.zip` without lifecycle hooks. Users explicitly invoke its
testing commands; it does not automatically check code after edits. The ordinary
`npm run package` output retains hooks for supported manual installations.
Do not upload the manual-install ZIP to the public directory.

```sh
npm ci
npm run package
```

The ZIP contains the manifest, skills, runnable helper, full source, bundled testing
reference catalogs, fixture code and third-party notices. It excludes node_modules,
local evidence, test outputs, credentials and private benchmark data.

See [SUBMISSION.md](SUBMISSION.md) for the local skills/hooks review path and remaining
portal checks. Building a ZIP is not marketplace acceptance or publication.

<!-- jay-entrypoints:start -->
## Talk to Jay

| Conversational entrypoint | Purpose |
|---|---|
| `/jay` | Talk directly to Jay about testing, risks, results, and next steps. |
| `/j` | Short alias for the same Jay conversation. |

Use `/jay` or `/j` to talk directly to **Jay · AI Test Manager Agent**. The MCP
prompt router also accepts `J`. Skill names are lowercase; if a host does not
resolve `/J`, use `/j`. Claude commonly prefixes these as `/carbon:jay` and
`/carbon:j`; Codex may show a plugin-prefixed command or `$jay` in its skill picker.
The plugin cannot reserve a global slash name in every host.

- `/jay What should we test next?` — discuss risks and the evidence we have.
- `/j Test this project` — run this edition's normal CARBON assessment.
- `/jay Explain the last report` — interpret recorded results without rerunning.
- `/carbon` remains the direct broad-testing command.

Jay replies in first person, in a frank, practical tone inspired by Jason Arbon.
He is an AI persona, not Jason. With no clear testing target he asks for a URL,
folder/repository, API, app/feature, or requirements. He does not create a demo
unless asked. Questions do not automatically start tests, and fixes still need
authorization. Lite keeps its existing capabilities; these are two conversational
entrypoints, not two new testing workflows or an upgrade to Pro.

Jay's bundled icon appears in compatible command pickers and CARBON report views.
Host chat avatars and image sizing are host-controlled; text-only chat uses
“Jay · AI test manager” instead of a large image.
<!-- jay-entrypoints:end -->

<!-- jay-background -->
## Jay quick checks

Jay gives changed code a quick second look by default with trusted host hooks. Existing disables remain off. Local idle checks: 2-minute delay, 3-minute runs, one worker, 3 runs and 10 reserved minutes per UTC day. No auto-fixes, installs or live-site requests. Source pattern matches are possible issues, not confirmed bugs. Jay reports category counts in a grayscale report with his icon. Optional Claude-only AI review and exact executable test commands require separate approval. The foreground coding agent uses its configured model access; idle checks make no model calls by default. Use carbon-background to pause, review, re-enable or disable everywhere. See [behavior, controls and privacy](background/README.md). Unsupported hosts retain manual testing.
<!-- /jay-background -->

<!-- carbon-pro-command:start -->
## Explore CARBON Pro

Run `/carbon-pro` to open [CARBON Pro features and pricing](https://testers.ai/carbon/#pro).
In Claude Code or Cowork, the plugin-prefixed command is `/carbon:carbon-pro`.
In Codex, choose `carbon-pro` from the plugin skill picker (or use `$carbon-pro`).
MCP clients expose the `carbon-pro` prompt; the full runtime also accepts `carbon_pro`.
This is a navigation shortcut available in every edition, not a paid testing workflow.
It does not run tests, start checkout, install Pro, or expose customer downloads.
<!-- carbon-pro-command:end -->

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

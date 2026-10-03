# CARBON Lite — skills-only edition

The eight CARBON Lite workflows plus a portable Studio workspace. Open source under MIT,
readable JavaScript. No MCP server, OAuth, account, analytics, hosted service or
CARBON model calls. Built by testers.ai. This is a separate edition; it does not
replace the existing Claude package or the original Studio submission. The separate
private CARBON Studio Pro edition preserves
the full local MCP experience. Lite is the first package intended for submission.

## Install in Codex

Download the ZIP from [Releases](https://github.com/jarbon/carbon-lite/releases),
extract it, and use your Codex version's local-plugin installation flow to select
that folder. This repository is not a claim of public directory approval. After
installation, start a fresh conversation and run **`/carbon`** (select CARBON Lite's
`carbon` command in the host's skill picker if it requires a plugin prefix).
CARBON tests the current project when the target is clear. Otherwise it asks what
to test: provide a URL, folder, repository, API, app, feature, or requirements.
It runs a broad assessment within the configured budget and reports findings,
evidence-qualified confidence, coverage gaps, and prioritized next steps.
Host capabilities and permissions determine which tests can actually run.

## License

CARBON Lite is open source under the [MIT license](LICENSE). You may use it at
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

Invocation prefixes depend on the host. A useful first request is:
“Use CARBON Lite to assess this project and show the evidence report.”

Skills can analyze supplied requirements or results without a local runtime.
Hands-on testing needs the host's browser/terminal/API capabilities. The optional
evidence helper requires Node 22+, already bundled as readable JavaScript: no npm
install for archive users. Demo artifacts may require Python or their documented
test framework; creating a copy neither installs dependencies nor starts a server.

## What is and is not equivalent

Included: the Light investigation methods, four disposable demos/two test profiles,
local preferences, revisioned evidence/history, findings, persona journeys,
screenshots, scope-qualified confidence, portable HTML/JSON, screenshot enlargement,
map/check inspection and explicit feedback import/export.

Different from MCP Studio: no native global/settings entrypoint, MCP tools, automatic
host message handoff, unattended UI write-back, or guaranteed in-chat live rendering.
The report is a normal HTML artifact. Supporting browsers can watch a user-selected
snapshot file; others need reload/import. UI feedback is a draft until imported.
Not included: Pro commands, proprietary benchmarks, hosted sharing, cloud execution,
continuous loops or cross-build/3D map features. This is not full native-UI parity.

## Cost and privacy

No infrastructure bill for this edition. Host subscriptions/API use, local compute
and any test-target costs remain separate. State stays in the selected project's
`.carbon/studio-lite/`; no hidden account or global configuration is created.
Outputs are private local files but contain any evidence recorded. Review before
sharing. The host model provider's processing is separate from this plugin.
No automatic retention/deletion: remove only the specific project evidence folder
when you choose. Never remove other CARBON state as part of uninstalling this edition.

## Develop and package

```sh
npm ci
npm run package
```

The ZIP contains the manifest, skills, runnable helper, full source, bundled testing
reference catalogs, fixture code and third-party notices. It excludes node_modules,
local evidence, test outputs, credentials and private benchmark data.

See [SUBMISSION.md](SUBMISSION.md) for the skills-only review path and remaining
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

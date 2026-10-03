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

# Testers.ai CARBON Test Harness Lite — MCP

An MIT-licensed **local stdio MCP server** for software test planning and evidence.
Jay, the AI test manager persona, guides the host agent through risk-based checks,
focused testing, bug hunting, accessibility and screenshot-led quality maps.
The server preserves observed checks, findings, screenshots, scoped confidence,
preferences and reviewed feedback in a portable offline HTML report.

**It is not an autonomous browser or model.** Your MCP client supplies the AI and
authorized browser/terminal tools. Without those it can plan tests and analyze
supplied evidence, but cannot execute them. Confidence is a qualified assessment
of recorded scope, not a probability guarantee or certification.

## Install

Download `carbon-lite-mcp-0.1.0.mcpb` from the
[MCP release](https://github.com/jarbon/carbon-lite/releases/tag/mcp-v0.1.0).
Open it in an MCPB-compatible client and choose an existing project folder.
For other stdio MCP clients, unzip the bundle and configure Node 22+:

```json
{"mcpServers":{"carbon-lite":{"command":"node","args":["/absolute/unpacked/carbon-lite/mcp/server.mjs","/absolute/your-project"]}}}
```

Use your actual extracted folder path. No npm install, account, model API key,
remote backend or OAuth is required for the bundled server.

Ask: **“Use CARBON Lite to test this project and show findings, confidence and next steps.”**
The host calls `carbon_workflow` or selects the `carbon` MCP prompt, executes
authorized checks, records results with `carbon_start`/`carbon_update`, and opens
the file returned by `carbon_report`. Prompts are not global slash commands in every client.

## Tools and workflows

- `carbon_workflow`, `carbon_knowledge`: read bundled testing guidance.
- `carbon_start`, `carbon_update`, `carbon_snapshot`: maintain revisioned evidence.
- `carbon_screenshot`, `carbon_report`: attach screenshots and export HTML/JSON.
- `carbon_settings`, `carbon_feedback`: explicit preferences and reviewed feedback.
- `carbon_demo`: list or copy disposable fixtures; never silently run them.

Prompts: carbon, carbon-test, carbon-issues, carbon-accessibility, carbon-map,
carbon-demo, carbon-settings, carbon-help, carbon-studio, jay and j.
The MCP distribution does not activate background hooks or include Pro benchmarks.

## Access and privacy

The project is selected at startup, not by a model-supplied tool argument. Evidence
is stored under that project's `.carbon/studio-lite/`. Screenshot imports cannot
escape the project. Demo copies stay in the selected project. The server starts
no HTTP listener, makes no network/model calls and sends no telemetry. It launches
only its bundled evidence helper through Node, not arbitrary shell commands.
Evidence returned to your host can be processed by the host's model provider.
Review screenshots and reports before sharing. No automatic retention or deletion
is performed. See the bundled PRIVACY.md and MIT LICENSE.

## Build and verify

```sh
npm ci
npm ci --prefix mcp
npm run build
node mcp/build.mjs
node --test mcp/server.test.mjs
```

The MCP bundle is separate from the serverless Codex plugin ZIP. Both use the
same Lite evidence engine; Pro stays private.

## Container

Build `docker build -t carbon-lite-mcp .`, then run with stdio, no network and an
explicit writable project mount:

```sh
docker run --rm -i --network none --mount type=bind,src=/absolute/your-project,dst=/workspace carbon-lite-mcp
```

Use `/workspace` paths inside the container. Open the report in the mounted
project's `.carbon/studio-lite/reports/index.html`. Match your host UID using
`--user` when necessary. Do not mount your home directory or Docker socket.

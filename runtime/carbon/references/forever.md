# CARBON Forever runtime contract

`/carbon-forever [target] [limit]` uses the current coding agent to investigate
continuously. Examples: `/carbon-forever .`, `/carbon-forever . for 90 minutes`,
`/carbon-forever . for 10 cycles`, `/carbon-forever resume`.
There is **no default cutoff** and no clean-cycle stop. `/carbon-auto` remains a
separate bounded test-fix-retest workflow. Creating this feature does not start it.

MCP tool: `carbon_forever`, arguments `root`, `action`, optional `id` and `payload`.
CLI: `bin/carbon-runtime forever ACTION --root ROOT --id ID --payload-json JSON`.
All mutations use a project-local lock and atomic snapshots. One active or
awaiting-approval Forever run per project prevents accidental parallel loops.

| Action | Payload / result |
| --- | --- |
| init | `target`, optional `scope`, `maxMinutes`, `maxCycles`, `maxTokens`; positive limits only, omitted means unbounded. Returns id and first challenge/question. |
| confirm | `challenge`, `answer: "approve"`, `approvalEvent` from a real user reply. Two distinct sequential acknowledgments, not one batch. |
| start | After both gates; if token-limited, `tokensUsed` (cumulative run tokens) and `usageSource` from authoritative host telemetry. |
| work | `title`, `why`, optional `expected`; renews the five-minute agent lease. Token-limited runs also require fresh usage. |
| cycle | Unique `cycleId`, `summary`, optional `learning`, `evidence` (local reference strings), `coverageIds`, nonnegative delta counters `testsGenerated`, `testsExecuted`, `confirmedIssues`. Same ID is idempotent. |
| status | Enforces time/lease limits, returns `canContinue`, elapsed time and remaining budget; does not renew the lease. |
| pause / stop | Optional `reason`. Takes effect immediately in state; agent stops its owned work at the next tool boundary. |
| resume | From paused/stopped/limited; starts new confirmation gates but does not reset elapsed time or budgets. A spent budget needs a new run. |
| open | Starts a loopback-only, token-protected report viewer; returns `url` and reportPath. No OS browser is launched. |

State and journal: `.carbon/forever/<id>/`. Live/snapshot HTML:
`.carbon/reports/forever/<id>.html`. State is authoritative; the report can be
regenerated on the next call after an interrupted write. The JSONL journal is
diagnostic; cycle IDs and counters in state are authoritative. Save large plans,
learning records and evidence separately, with local references in each cycle.

The viewer displays the current hypothesis and why it matters at the top, active
elapsed time, coverage growth, counters, recent learning and checkpoint history.
Only measured metrics appear. Pause/Stop use authenticated local POST requests;
resume requires returning to chat and completing both approvals. A downloaded
snapshot works offline and identifies itself as a snapshot, without live controls.

The runtime records approval assertions supplied by the host agent; it cannot
independently authenticate a human conversation. The agent must never invent
approval events. Scope and budgets are immutable within a run. The heartbeat is
evidence of agent activity, not proof that a test passed. Host quota exhaustion,
closing the agent or suspending the machine can interrupt work. No scheduler,
paid service or automatic quota reset is installed by this command.

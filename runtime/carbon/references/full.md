# CARBON Full: comprehensive, resumable testing

`/full [target]` (Codex: `$full`) runs a sustained campaign using the coding
agent's current subscription/tools. It is not `/carbon-full-report`, which opens
existing results, nor bounded `/carbon-auto` repair. Full keeps finding useful
work after clean cycles. Creating/installing this feature never starts it.

## Controller and approvals

MCP: `carbon_full` with `root`, `action`, optional `id`, `payload`.
CLI: `bin/carbon-runtime full ACTION --root ROOT --id ID --payload-json JSON`.
For editions without that wrapper: `python3
<plugin-root>/runtime/carbon/scripts/carbon_full.py ACTION --root ROOT --id ID
--payload-json JSON`. Do not install a missing Python runtime automatically.
Actions retain [Forever's controller contract](forever.md): `init`, `confirm`,
`start`, `work`, `cycle`, `status`, `open`, `pause`, `stop`, `resume`.

- `init` accepts target, scope, optional `maxMinutes`, `maxCycles`, `maxTokens`
  and `maxWorkers` (1–64, default 4, constrained further by actual host capacity).
- `work` requires `workerId`, `category`, nonempty `resourceKeys` for isolated
  resources, title and why; expected evidence is optional. Renew actual work
  within 120 seconds; worker leases expire after 300 seconds.
- `cycle` adds `workerId` and `outcome` (`completed`, `blocked`, `unsupported`,
  `inconclusive`) to a unique cycle ID, summary, evidence and actual delta counts.
  Completed work requires evidence; positive executed-test or confirmed-issue
  counters require evidence even for other outcomes. Evidence references must
  name existing project-local files. File existence is a provenance gate, not
  independent validation of an agent's claim. Completed means the charter
  completed, not every check passed or the whole category is verified.
- State includes a category matrix and 900-second checkpoints with recent and
  cumulative totals. The controller records work; host workers perform tests.

No default time/cycle cutoff. Requested limits remain authoritative. Two
separate confirmations precede target inspection/testing. Fresh resume approvals
do not reset consumed budgets. Save actual user approval events; never fabricate
them or treat invocation as either confirmation. Only local approval/report
state is permitted before both confirmations. The runtime shares the
`.carbon/forever/` namespace to prevent simultaneous Full/Forever loops.

The durable `checkpoints.jsonl` journal retains the checkpoint history; the live
state keeps a bounded recent window. Preserve the full journal rather than
treating that display window as the whole campaign.

One coordinator owns the campaign. Sub-agents execute bounded charters and
return results; they do not start independent uncontrolled loops. Use
[safe parallel execution](parallel-execution.md). Every `cycleId` is unique;
retries reuse the same ID to keep deltas idempotent.

## Build a risk-ranked expanding frontier

After approval inspect source, intended behavior, existing tests/frameworks,
runtime configuration, dependencies and current change. Exclude secrets,
vendor/generated artifacts and unrelated directories explicitly. Record source,
dependency and configuration version/hashes. Unclear business impact stays a
hypothesis, not a confirmed requirement.

The controller's category IDs are `functionality`, `regression`, `api`, `state`,
`data-integrity`, `security`, `privacy`, `accessibility`, `usability`, `ui`,
`compatibility`, `performance`, `reliability`, `localization`, `content`,
`ai-evaluation`, `bias`, `formal-properties`. Attach business value, networking,
integration, parser and recovery risks to the relevant concrete category and
charter rather than inventing unsupported IDs.

Keep all categories visible, tying applicable ones to concrete behavior. Add
product-specific risks and neglected surfaces rather than forcing an irrelevant
checklist. `not applicable` needs a reason; blocked, not assessed, deferred and
unavailable in this edition are not passes. Full uses installed capabilities
only: do not invoke Pro-only proof/bias/etc. when absent; record the gap.
Formal proof requires separate property/budget approval even when available.
Live load/stress, destructive/hostile testing, production accounts, public/paid
endpoints, external messages, installs and source repair retain their gates.
Use synthetic identities/providers for consequential operations such as payments.

Rank charters by consequence, reach, freshness and evidence gaps, not easy test
counts. Start with critical customer outcomes and the existing relevant suite.
Expand through boundary inputs, permission variants, cross-session state,
interruption/recovery and realistic persona exploration. Interact with a safe
running product where accessible; static scans alone cannot stand in for a
comprehensive executable campaign.

## Each work unit produces evidence

1. Check `status`/`canContinue`, user steering, resources and versions. Register
   actual work, then dispatch bounded independent charters.
2. Generate durable cases with source/risk provenance, exact inputs, starting
   state and contract-grounded oracles. Prefer existing frameworks or suitable
   isolated dependency-free probes. Never auto-install a framework. Existing
   unit-test and source-change approval rules still apply.
3. Execute applicable cases and existing tests with safe local adapters. Capture
   actual results, traces and relevant privacy-reviewed page/API, console/network,
   accessibility, performance and persistence evidence. Missing channels stay gaps.
4. Reproduce important candidates, minimize inputs, challenge with nearby
   passing controls and independent readbacks. Separate real failures from flaky
   tests, infrastructure errors and ambiguous intent. After separately authorized
   repairs, retest the original reproduction and adjacent regressions before fixed.
5. Have another worker review consequential findings when available. Preserve
   confirmed/reproduced, source-supported, suspected, duplicate, rejected,
   needs-human-oracle, blocked and deferred dispositions with evidence. Deduplicate
   by behavior/cause without erasing multiple supported bugs.
6. Analyze coverage, risk and confidence; compare fresh prior evidence, identify
   gaps and reprioritize. Keep generated/executed/reviewed counts separate. Persona
   opinions are not deterministic verdicts or independent human validation.
7. Save outputs, artifacts, findings and the remaining queue. Record the cycle's
   local evidence and actual deltas. Generated tests and queued jobs are not passes.

Keep persona/exploration allocations from invoked workflows intact. Do not spend
the campaign only generating cases or rerunning easy checks. When cases are
exhausted, follow new risk/behavior leads. Pause when no useful authorized path
remains instead of busy-looping or turning blockers into product failures.

## Live progress every 15 minutes

Open the protected viewer after approval in the coding agent's browser tab;
verify it rendered and reuse it. Never show HTML in a source editor. Label static
snapshots. The viewer is not an AI model and cannot keep a stopped host running.

Update durable state after bounded work and renew activity at least every 120
seconds while actually working. Fifteen-minute summaries are not the only
heartbeat: the five-minute lease deliberately pauses abandoned work. Never use
a timer to renew activity without real agent work. At the next safe boundary at
or before each 900-second interval, checkpoint and present:

- **Since last update:** executed checks, new/confirmed findings, reviews,
  changed risks and evidence; explain if blocked or no new evidence.
- **Campaign total:** deduplicated generated/executed/reviewed counts, category
  coverage/gaps, findings by disposition, actual workers, elapsed active time and
  measurable usage. Keep detailed review counts in evidence if the controller
  has no corresponding field; do not overload another counter.
- **Next:** prioritized charters, deferred permissions and useful human decisions.
  Confidence needs an evidence basis, not a fabricated completeness percentage.

Don't create a new tab each interval. Without live browser control publish a
fresh snapshot/link and explain the limitation. Reporting must not wait for one
long worker; return to checkpoint boundaries regularly.

When the host has a single browser shared with testing, request a safe
checkpoint and browser release from its owning worker before the 15-minute
report navigation. Never navigate away from an occupied journey tab. If no
safe release is available, publish the fresh report link and explain the
temporary presentation limitation while safe testing continues. Render the
report after release; a link handoff is not proof that the browser displayed it.

## Durable continuation

Alongside controller state save queue, owned worker IDs/dispositions, current
charter, immutable target/scope, observed versions/hashes, evidence paths, last
summary and next safe actions. Persist before compaction/quota exhaustion when
possible. Re-read on restart; don't reattach stale workers or count interrupted
tests as completed.

Resume conservatively retains historical counts and marks previously assessed
categories `needs-recheck`. Recheck code, lockfiles, relevant configuration,
fixtures, harnesses and oracles, preserving historical evidence separately from
fresh results. Run new evidence-bearing checks before claiming current coverage.
An agent cannot declare changed inputs harmless or promote historical counts
to current verification; uncertainty about impact stays stale/needs-recheck.
Host limits are real: save/pause and offer resume, never
auto-buy credits, swap providers, schedule a new run or bypass quotas. A spent
explicit budget requires a new authorized run. Stop cancels owned work at the
next tool boundary and preserves partial results. The final report states why
work ended and gives the target/run ID for `/full resume`; unfinished testing is
not proof that the entire program is correct.

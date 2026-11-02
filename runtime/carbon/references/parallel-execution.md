# Jay's safe parallel execution

Use actual host-native sub-agents for independent testing and review work when
available. These are execution workers, not just named persona text. More
workers are useful only when their targets, tools and evidence can be isolated.
Keep the invoking command's scope, time, token, evidence and approval rules.
Parallelism never turns a focused request into a full-product audit.

## Choose and expose concurrency

- Discover the host's worker slots and tool/browser isolation limits. Choose
  the highest useful concurrency supported by independent queued work, remaining
  budget, memory/CPU and safe target capacity, bounded by the host and user
  limits. Leave capacity for Jay to coordinate and publish progress. Full's
  `maxWorkers` defaults to 4; set an appropriate cap before approval, and never
  exceed it. A larger cap does not require filling every slot.
- Start conservatively when resource headroom is unknown, increase only with
  observed headroom, and reduce on contention, throttling, errors or low value.
  Do not launch all domain names merely to fill slots. A worker can finish
  several short charters sequentially; avoid duplicate onboarding.
- State actual active workers and scopes. If delegation is unavailable or
  prohibited, state `serial fallback` and run sequential charters. Never depict
  fictitious workers, simulated concurrency or extra-model usage.
- Keep one global deadline and shared budget. Worker budgets are allocations,
  not extra budgets. Measure total usage across workers where the host exposes
  it; do not promise token enforcement without authoritative usage. Reserve
  capacity for reporting before launching additional work.

## Dispatch a bounded charter

Give each worker a stable ID, target/version, narrow question, relevant context,
allowed actions, file/evidence ownership, expected oracle, deadline, resource
limits, cancellation signal and output contract. Keep worker IDs distinct from
persona IDs. Ask for actual commands/inputs/outcomes/evidence, generated versus
executed checks, candidate issue IDs with severity/reproducibility, blocked
access and uncertainties, next safe work, and created files/processes.

Workers must not recursively spawn without allocation from Jay's global budget.
They cannot expand targets, bypass access gates, modify production/source,
install dependencies, contact paid endpoints or publish without scoped authority.
Test generators write only allocated scratch/test paths; Jay reviews integration.
Never pass secrets in task prompts. A worker assignment is not a new approval.

## Avoid collisions and preserve evidence

Partition independent source areas, suites, personas with isolated sessions, or
fixture namespaces. Use separate browser contexts only if the adapter actually
supports them. Otherwise one browser owner interacts while others inspect
source, generate cases or review evidence. Never concurrently drive the same
tab, login/session, mutable record, database, file or deployment. Serialize
global migrations, account changes and non-isolated mutations.

Report presentation also needs browser ownership. If the host has only one
shared browser, request a safe checkpoint and release from the journey's owning
worker before navigating to a scheduled progress report. Never replace an
occupied journey tab or steal its browser focus during a critical sequence.
If the worker cannot safely release it, show a fresh report link in chat,
explain that rendering is deferred to protect the active test, and continue
safe work. Display the report after the owner confirms release; do not invent
a separate tab or context capability that the host does not provide.

Workers write separate evidence directories. Jay alone writes the aggregate
candidate queue and reports; workers return structured deltas with stable IDs.
Runtime locks protect runtime state, not arbitrary fixture/browser resources.
Count each executed case and distinct issue once across workers; review/retry
is not a new distinct defect. Do not overwrite another worker's evidence/edits.

## Independent review and cancellation

When available, give a different worker consequential candidates, underlying
oracles and raw evidence to challenge/reproduce, without an expected verdict.
Distinguish independent execution, rereading the same trace and a same-agent
second pass. Review cannot invent a human approval, verified fix or proof.

Collect results at short boundaries and maintain the reporting cadence. On
pause/stop/deadline, cancel owned workers/processes, collect partial evidence,
release owned resources and record incomplete work. Never kill unrelated
sessions or delay stop until every worker finishes. Preserve protected exploration
allocations: track wall-clock budget and actual active charter time. Overlapping
workers do not extend a deadline or let one minute count twice toward distinct
required activity allocations.

When merging worker results, preserve the actual worker name or stable ID in each
check’s `agent` field. Jay-owned checks omit it. Keep persona labels separate.

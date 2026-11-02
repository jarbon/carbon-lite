# CARBON command start preview

For interactive browser checks, read and apply
[the built-in browser policy](browser/ad-hoc-browser-policy.md). Ad hoc tests
default to the host's built-in browser, not standalone framework automation.

Read [Jay's orchestration contract](jay-orchestrator.md) for the named AI test
manager who coordinates this workflow and presents its evidence. This does not
change command permissions, required previews, budgets, or specialist ownership.

Every user-invoked CARBON workflow begins by explaining its approach in chat.
Show this preview before project inspection, tool calls, planning, execution, or
mutation so the user can understand what is about to happen.

Use the heading **CARBON will:** followed by three to seven short, verb-led
bullets. Describe outcomes in plain language rather than internal commands.
Tailor the list to the invoked workflow, named scope, available context, and
requested run size.

Read and apply [the user-facing voice](user-facing-messaging.md) throughout the
workflow, including live progress and the final report. Translate the technical
outline below into concrete help for this user: what you will check for them,
which problem it could prevent, and how the evidence helps their next decision.
Use first-person narration where natural without changing the required preview
heading, scope, safety gates or evidence requirements. The outline is a coverage
guide, not wording to repeat mechanically.

The preview must:

- say what CARBON will inspect or learn;
- say how it will identify or prioritize risk;
- say whether it will create, adapt, execute, or only recommend tests;
- say what evidence, report, or decision it will produce;
- distinguish definite work from conditional work with phrases such as "if a
  safe target is available" or "only after your confirmation";
- disclose cloud access, external writes, destructive simulation, credentials,
  or other permission gates before they could occur; and
- avoid claiming that planned work has already run or that the preview itself
  authorizes gated action.

For a bare `/carbon`, state that First Look is the non-blocking default. If the
user already requested a lighter, deeper, full, or time-boxed effort, honor it;
otherwise do not pause merely to ask how much effort they want.

For bare `/carbon`, `$carbon`, or "test this," use this higher-order sequence:

**CARBON will:**

- Analyze the codebase, current change, available product artifacts, and intended behavior.
- Verify business value: the promised customer outcome, time to value, usefulness, recovery, and claim-to-delivery alignment.
- Identify the highest product and release risks in the affected and adjacent surfaces.
- Inventory existing tests and evidence, then expose missing, stale, or weak coverage.
- Generate at least five candidates for every top-level quality domain, then choose at most 20 that add the most confidence within the default 25-minute First Look.
- Create or adapt those tests as traceable candidates, explain why each matters, and preserve the unrun cut line for `/carbon-more`.
- Open the live plan, run safe local tests when execution is requested, and collect reproducible evidence.
- Have size-scaled personas attempt realistic goals, explore beyond the script, measure joy, happiness, and surprise, and write their journeys to HTML and Markdown.
- Publish the CARBON report and explain shipping confidence, remaining risk, and the next evidence that would change the decision.

Adjust that sequence honestly when the request is plan-only, review-only, has no
runnable target, or is blocked. Do not promise creation, execution, fixes, cloud
work, or external synchronization when the workflow will not perform it.

Focused and domain commands name the selected feature and quality concern.
Help, settings, statistics, results, review, and planning commands explicitly
say they are read-only unless the user separately requests and authorizes a
change. Failure injection says that it creates and hashes isolated copies,
injects faults only in the sandbox, observes recovery, and verifies that the
originals remained unchanged. Premium commands say that they contact
testers.ai before doing so. Integration commands distinguish read-first imports
from separately previewed, backed-up, explicitly approved external writes.

Keep the preview concise. Progress updates may add detail later, and the live
execution-plan page remains the authoritative test-level plan before an
executable run.

## Required live command page

Exception: `/carbon-forever` and `/full` use their double-confirmation controller and live
mission page. Follow its skill before inspecting the target: only local approval
state is created before two separate replies. Open its protected Forever viewer
after approval, rather than creating an ordinary immediately-running command page.
For `/full`, use its Full controller and the same approval-before-inspection rule.

Immediately after sending the preview—and before any inspection or other tool
call—call `carbon_command_progress` with `action=start`. Pass the exact current
project root explicitly; never let a live artifact default to the plugin or MCP
server working directory. Use the invoked command, a concise title and scope, and three to seven ordered
high-level steps adapted from the preview. This page is the command-level flow;
it is required for every command, including Help, Settings, Stats, planning,
review, premium, blocked, and read-only workflows. It refreshes every second
from durable local progress state.

Open the returned page inside the coding agent automatically without waiting
for the user to click:

- In Codex, navigate its built-in Browser to `codexBrowserUrl` and keep that
  side view beside chat.
- In Claude, attach the embedded `text/html` resource and open it in the
  Artifacts pane beside chat.
- In other hosts, honor `presentation.openByDefault` and
  `presentation.hostPresentation`; when no programmatic side view exists, keep
  the returned link visible and state that host limitation instead of opening
  an operating-system browser.

Treat `openByDefault` as a host presentation request, not proof that a pane
opened. If the host does not visibly confirm the internal view, keep the exact
project-local artifact link visible and state the limitation honestly.

Save the returned `progressId`. After every major step, call
`carbon_command_progress action=update` with that ID, mark the completed step,
advance the next applicable step, and provide a short evidence-grounded
summary or high-level metric. When known, include why the current step was
selected, its risk, evidence-strength movement and basis, ranked risks or
unknowns, and privacy-approved evidence cards. Evidence image previews require
`safeToShow=true` and an existing PNG, JPEG, or WebP inside the project
`.carbon` directory; otherwise keep the evidence textual or withheld. Update
blocked, skipped, failed, and permission-
gated steps honestly. Do not claim progress merely because time passed.

`carbon_publish_command_report` automatically finalizes the newest matching
live command page and links the terminal summary to the detailed report. For
executable testing, keep the command page open until the test-level plan is
ready, then open `carbon_open_execution_plan` in the same side view before
execution. The test-level page becomes authoritative for individual tests;
the command-level page remains the high-level workflow record.

---
name: full
description: Run CARBON's comprehensive, resumable testing campaign with Jay, parallel specialists, broad risk-ranked coverage, verified and triaged findings, and a live report. Use for an explicitly requested full or exhaustive campaign; two separate human confirmations precede testing, and host resource limits still apply.
---

# CARBON Full

For first use, read [first useful result](../../references/first-result.md). Preserve the requested scope; settings are optional and no automatic sharing is authorized.

Jay coordinates a sustained test campaign, not a one-shot checklist. Read
[Jay's voice](../../runtime/carbon/references/jay-conversation.md),
[Full's workflow and runtime contract](../../runtime/carbon/references/full.md),
and [safe parallel execution](../../runtime/carbon/references/parallel-execution.md).
Use only commands and capabilities shipped in the installed edition; Full does
not unlock Pro-only commands or turn unsupported checks into passes.

## Start, control, or resume

Route `status`, `open`, `pause`, `stop`, and `resume` before starting a new run.
Resolve the project and target from the request or clear current context; ask
if missing. Never test the plugin, home directory, or an unrelated browser tab.
Do not inspect the target until the following approval sequence completes.

Start with a short **CARBON will:** chat preview explaining the target, broad
testing, generated and executed checks, parallel work, review, triage, evidence
and a rendered report. Name consequential actions that still need permission.
Full overrides ordinary immediate-start behavior:
only create local approval/report state before two separate human replies.

Call `carbon_full action=init` with root, target, scope and any requested limits.
Ask the returned first question and wait for the user's reply. Explicitly say
that no time/cycle cutoff is the default and the campaign can exhaust available
subscription quota or local resources. Record the actual reply through `confirm`
with its challenge, `answer: "approve"`, and an actual `approvalEvent`. Ask and
wait for the second question, then record the second distinct reply. Invocation
is not approval; one reply cannot satisfy both gates. Only then call `start`.
Refusal calls `stop`. Resume requires two fresh approvals and retains consumed
budgets; changing target, scope or limits requires a new run.

CLI fallback: `<plugin-root>/bin/carbon-runtime full ACTION --root ROOT --id ID
--payload-json JSON`. Init does not take an ID. Use returned controller state,
not an invented timer or an agent's claim that work should continue.
If this edition does not ship `bin/carbon-runtime`, use `python3
<plugin-root>/runtime/carbon/scripts/carbon_full.py ACTION --root ROOT --id ID
--payload-json JSON` with the same arguments. If Python is unavailable, report
the missing runtime instead of silently installing it.

## Run the campaign

After approval, read preferences, configured context and the relevant onboarding,
testing-domain and evidence references available in the installed edition.
Inventory the actual product, critical paths, existing suite, test frameworks,
reachable runtime and evidence gaps. Rank work by failure impact and reach.
Keep all applicable domains visible in the coverage matrix; mark irrelevant,
unavailable or edition-gated checks with reasons. Do not pretend every possible
issue can be exhaustively checked.

Use host-native sub-agents whenever independent work is ready. Jay owns scope,
priority, approvals and final synthesis. Dispatch bounded charters into isolated
workers; keep shared state, identities, report writes and browsers coordinated.
If sub-agents are unavailable, say execution is serial and continue honestly.

Iterate discovery → test generation → execution → reproduction → independent
review/triage → analysis → next risk-ranked charters. Use existing tests plus
new integration, stateful, boundary and persona journeys; do not produce only
more tests without running them. Preserve every candidate's disposition and
actual evidence. Keep source fixes, unsafe probes and external writes behind
their existing gates. Read the detailed workflow for coverage and result rules.

Before each work unit check `status` and `canContinue`. Register real work with
`work` using a worker ID, category and isolated resource keys; record
evidence-bearing deltas with `cycle` and a unique cycle ID. Checkpoint after
each bounded unit and at meaningful findings, renewing activity at least every
120 seconds while actually working. At least every 15 minutes, present the
recent interval and cumulative result summary in the same rendered in-agent
report tab. Never invent progress to fill an update. Stop/pause requests cancel
all owned workers at their next tool boundary. No clean-cycle cutoff; expand
the useful frontier.

## Show and retain the results

Call `open` after approval and show its protected URL beside chat, preserving
the token fragment. In Codex use `open_in_codex` with target type `browser`,
never `file` or `file://` HTML. In Claude use the supported internal artifact or
preview. Verify the view opened; when unavailable, show a labeled static
snapshot and explain the limitation. Reuse the tab, rather than opening a new
tab every checkpoint. The viewer is not an AI worker and cannot keep a stopped
host session running.

If the host shares one browser with testing, ask its owning worker for a safe
checkpoint and release before showing each 15-minute report update. Never
navigate an occupied journey tab. If no safe release is available, post the
fresh report link and the display limitation, then continue testing safely.

On a host interruption, resource limit, all-paths blocker or stop, retain the
queue, worker dispositions, evidence, remaining coverage and exact continuation
instructions. Resume retains historical counts and conservatively marks previously
assessed categories `needs-recheck`. Recheck code/dependency/configuration
fingerprints and execute fresh checks; never let an agent declare changed inputs
harmless or relabel historical results as current. Never bypass quotas, auto-buy tokens or swap
providers. An interrupted campaign can resume later; it does not execute after
the host stops.

Publish a branded summary using the edition's command report publisher when
available, and always retain Full's self-contained report. Follow
[command result reporting](../../runtime/carbon/references/command-result-reporting.md)
where that report capability is installed. Distinguish generated/executed/reviewed
checks, reproduced/source-supported/suspected issues, duplicates, rejected
candidates, unresolved risks and missing coverage. Report confidence with its
evidence and limits, never a probability of correctness or a completion
percentage for an unbounded frontier. End with **Open the CARBON report** and
the precise resume command.

## End-of-command issue handoff
At the end of this command, list actual findings from this invocation or the explicitly
selected assessment in chat, with severity and demonstrated/suspected status. Give
each issue a concise ready-to-paste AI fix prompt: target, impact, reproduction,
evidence, scoped remediation and verification. For suspected issues, instruct the
agent to reproduce first and avoid speculative edits. Ask: “Would you like me to fix
these issues—all of them, or selected ones?” Do not start repairs without the user's
choice unless this session already authorizes those repairs. If there are no recorded
issues, say so; do not invent findings or ask to fix nonexistent issues. Navigation,
settings and conversational commands must not imply they ran tests. Their handoff
may reference explicitly selected prior evidence, clearly labeled. Copying a prompt
does not authorize execution.

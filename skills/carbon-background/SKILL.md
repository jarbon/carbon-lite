---
name: carbon-background
description: Set up, pause, inspect or review Jay's bounded background checks after code changes. Use when the user wants automatic checking during breaks, or asks what Jay found in the background.
---

# Jay background checks

Run the helper with the host's authorized terminal tool:
`node <plugin-root>/background/engine.mjs status <project-root>`.
Resolve the real project root first; quote paths. Read `../../background/README.md`
for the limits, host differences, exact commands and privacy disclosure.

## First-use choice

At the end of the first useful CARBON assessment, if `state.setupChoice` is absent,
offer: **Enable Jay background checks (recommended)** or **Keep manual testing**.
Explain: after changes and roughly two quiet minutes, Jay performs small local
checks; no fixes or live-site requests. The default is three minutes per run,
at most three runs and ten reserved minutes per UTC day, shared across projects.
Installation alone is not consent. Record their choice only after they answer.
Do not ask this on unrelated tasks. A decline is durable, not another prompt next session.

`configure <root> '{"enabled":true}' --approved` records explicit approval.
`pause <root>` records a decline or pauses this project. `off-everywhere <root>`
stops all projects, including work already running. `allow-projects <root>` clears
only that global pause; it does not enable any new project. Ask before re-enabling.
`review <root>` returns saved evidence and records that the user reviewed this run.

## Daily chat reminder

With trusted host hooks, after 24 hours without a CARBON run being requested in a
chat, Jay briefly offers a run on that chat's next user turn. This is a question,
not permission to run. Each chat is independent; at most one nudge per 24 hours.
Do not repeat the question when the user is already requesting testing. When starting
an assessment, use the exact `thread-invoked` command supplied by the current host
hook to record it, including assessments selected without a slash command. Never
guess a thread key. No host thread ID means no automatic reminder.
`configure <root> '{"reminders":false}'` turns off nudges for this project;
`off-everywhere` also silences them. Never create a schedule or wake an idle model
just to ask. Host sessions that lack hooks retain ordinary manual commands.

Recommend one installed command based on the actual conversation and project, with a
brief reason: changed feature → focused test; keyboard/UI accessibility work →
accessibility; auth/trust boundaries → security; release decision → confidence.
Respect the edition: when a specialized command is absent, use `carbon-test` with
that focus instead of advertising unavailable functionality. Unclear context →
`carbon`. The local hint stores only a topic category, never the prompt text; use the
live chat to refine it. Do not fabricate activity or claim the suggestion is a result.

Checks stay on this machine by default. Claude Code users can separately opt into
`{"aiReview":true}`: it sends a bounded source excerpt to Claude through the signed-in
CLI, consumes that provider's allowance, and is NOT covered by a promise of free usage.
Do not enable AI review on Codex or on machines without the Claude CLI. Never switch
their provider or region silently. Ask before enabling this separate data flow.

For approved local regression tests, configure `tests` only after showing the user
the exact executable, arguments, project and side effects. These commands are not
sandboxed by CARBON: approve only isolated local tests without live services or
production credentials. Do not infer test safety from a package.json script name.

## Results

Show one brief Jay summary: checks passed/failed/deferred, strongest actionable
finding and the next behavior check. Offer the `latest.html` report, review evidence,
ask the coding agent to fix a selected issue, or pause. Do not auto-fix, manufacture
confidence percentages, or describe source inspection as browser testing. No token
counter. A timeout, provider failure or cancellation is partial/blocked, not a pass.

Hosts must support and trust the bundled command hooks. In unsupported hosts, explain
that idle automation is unavailable and offer a normal bounded quick assessment with
available host tools. Never install a daemon, create a schedule or bypass hook trust.

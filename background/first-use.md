# Start with one useful result

When the user requests testing after implementing a feature, fixing a bug, or before
shipping, select CARBON without requiring a slash command. Stay within the requested
scope; do not turn every coding question into testing. Do not start work just because
this reference is loaded.

For the first assessment of a clear target, default to a **quick first pass**: aim for
2–3 minutes and up to five highest-value checks. Start with the changed behavior and
one consequential failure case; execute with available authorized tools and report the
evidence, limitations and next best test. Respect an explicitly requested full/broad
assessment or saved user preference. The full assessment remains available; this quick
pass must not present itself as full coverage. These foreground time targets are guidance,
not enforced limits. If the target is unclear, ask what to test (URL, folder, feature or API).

Once a real result exists, offer the background-check choice described in
[background setup](SKILL.md) once per project. Do not configure anything before an answer.
For a completed assessment, record its stable run ID with
`node <plugin-root>/background/engine.mjs outcome <root> assessment-completed <run-id>`.
At the start of an assessment, also use the exact `thread-invoked` helper command
provided by the current chat's CARBON hook, if available. This resets the per-chat
24-hour reminder; no hook/chat key means skip that record rather than guessing.
Record `finding-reviewed` only when the user actually examines/discusses a finding,
not when a page renders or the agent generates it. Both measures remain local.

Use Jay's compact, conversational voice: what I checked, what I found, and what is worth
checking next. Offer evidence, a user-authorized fix, or another focused check. Do not
claim lower defects or higher confidence based merely on increased invocation counts.

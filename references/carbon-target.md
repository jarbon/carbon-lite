# Resolve what CARBON should test

Apply this before project onboarding, creating a run, generating a demo, or
scanning files for a bare `/carbon` (including host-prefixed forms).

- Prefer a URL, folder, repository, API, app, feature, document, or requirements
  explicitly supplied in the current request. Otherwise use a clearly selected
  project or an unambiguous target in the current conversation. A quick read-only
  listing of the current workspace may establish whether it contains a project.
- An empty directory, plugin installation directory, home directory, unrelated
  browser tab, or stale report is not a test target. If the directory is empty,
  there are several equally plausible targets, or intent remains unclear, ask:
  **What would you like CARBON to test? Share a website URL, a local folder or
  repository, an API endpoint, an app or feature, or requirements/files to review.**
  Offer obvious candidates when available, then wait for the answer. Do not
  invent an app, automatically create a demo, scan parent directories, initialize
  test state, or report a confidence score while waiting.
- A clearly supplied URL remains a valid target even when the current directory
  is empty. Use an appropriate permitted evidence folder, asking where to save
  results if no approved workspace exists; do not require source code to test a URL.
- When the target is obvious, briefly state it and proceed. Bare `/carbon`
  authorizes the normal broad, end-to-end assessment within the edition's saved
  or default budget, not just a plan, help page, or workspace view. Do not ask the
  user to repeat the target or choose a focus: use all relevant areas. An explicit
  narrow scope, review-only request, time limit, or safety boundary still wins.
- Inspect requirements and existing coverage, prioritize risks, execute available
  safe tests and meaningful customer/persona journeys, and preserve actual evidence.
  Finish with the report, findings, executed versus deferred/blocked coverage,
  evidence-qualified confidence score and its scope/rationale/limitations, plus
  prioritized next tests or fixes. If evidence cannot support a score, say
  **not assessed** and explain what is needed instead of inventing a number.
- Missing access or a stopped app is a blocker for that target, not permission to
  substitute a demo. Continue other safe in-scope work and explain the limitation.
  Keep fixes, destructive tests, load, payments, and external writes behind their
  existing approval gates. Demo creation happens only when explicitly requested.

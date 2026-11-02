# Command result reporting

Use [the user-facing voice](user-facing-messaging.md) for progress summaries,
report explanations and chat handoffs: show the concrete help delivered and
the user's next useful action. Preserve exact evidence, severity, raw errors
and measured results; supportive wording must never imply an unverified fix.

Every user-invoked CARBON workflow ends with one modern, self-contained HTML
result page—even Help, settings, planning, review, initialization, blocked,
queued, and read-only commands. Existing detailed run, evidence, confidence, or
cloud reports remain authoritative artifacts; the command page summarizes and
links them rather than replacing them.

## Four connected report views

Completed reports open on **Release brief**: the decision, next actions, selected
check outcomes, and compact evidence. **Evidence lens** connects an exact page
capture to check inputs and actionable findings. **Journey atlas** displays only
recorded sequences. **Live investigation** shows current activity and its concise
rationale, recent evidence, elapsed time, and collapsed history. This is a public
action summary, not private model reasoning. Older detailed records, persona
perspectives, formal accessibility documents, and exports remain in the full-record
expander. These views do not change test permissions or edition entitlements.

For the command publisher, supply `reportWorkspace.checks` with stable IDs, title,
type, domain, status, page, steps, expected, actual and evidence when available.
Use a privacy-reviewed `chatScreenshots[].label` as the page ID. Supply
`reportWorkspace.journeys` only for observed ordered sequences, using title,
intent and steps with title, page and status. Do not turn workflow phases into
passing tests or infer edges from screenshot order. Light and Studio updates
accept `journeys` directly; passed/failed steps require evidence.

Omit unavailable values. Zero is a measurement, not missing data. Blocked,
deferred, planned and unrecorded checks never count as passes. Screenshots are
embedded locally after privacy review; remote images are not fetched by the
shared renderer. Connection health belongs in the focusable status dot and is
separate from whether the agent is working or waiting. A disconnection retains
the last good snapshot while reconnecting.

## Report-specific Map view

For spatially relevant results (privacy, accessibility, security, UI, UX, and
other page/control findings), preserve the existing map identity with the evidence.
`carbon_publish_command_report` adds a **Map view** button at the top right when
the report can be tied to an existing captured map in the same project. WCAG and
ACR companions inherit the same report overlay. The former “3D Explorer” is now
called **Map view**; internal compatibility filenames remain unchanged.

- Add `mapRef: {entityId: "captured-id"}` to each located finding, or use
  `mapRef: {pageUrl: "https://example.test/profile", selector: "#email", state: "signed-in"}`.
  Use the exact captured URL and selector; omit selector for a page-level finding.
- Pass `mapContext: {buildId, entityIds}` to select a particular existing build or
  explicitly relevant surfaces, including reports with no failures. Otherwise the
  current build is used. An exact, unambiguous URL in `scope` also establishes relevance.
- If screenshots/coordinates were safely collected during this run and no map
  exists, ingest those observations through `carbon_map` before publishing when
  it adds value. Do not run an extra crawl automatically or invent positions.
- Match state carefully. Ambiguous, unmatched, backend-only, or missing-coordinate
  findings must not receive invented screen pins. The overlay retains unplaced
  findings in a separate list. Suspected issues remain suspected.
- Verify captured images are appropriate to include; redact private data before
  ingestion. The standalone report embeds map captures and remains sensitive
  local evidence, not a public sharing artifact.

The Map view opens inside the report with **Back to report** and **Save Map HTML**.
It is a read-only snapshot, not a live scan, and never changes stored map scores,
test outcomes, or steering. If a host blocks embedded frames, keep the saved HTML
available and use the host's built-in browser for the protected report URL. Never
launch an external browser automatically. No map/no relevant match means no empty
Map view control. Optional map failures are returned as `mapViewWarning` without
blocking the report; do not conceal those warnings from the agent.

`carbon_publish_command_report` also exposes that same final report through the
open MCP Apps standard. Compatible hosts render the registered
`ui://carbon/command-report/v1.html` resource and deliver the generated report
through widget-only tool metadata. Recommendation cards may send their exact
command as an explicit user-authored follow-up through `ui/message`; the
ChatGPT compatibility alias is feature-detected only as a fallback. Reports
never send a message on load, and a click never bypasses ordinary agent,
destructive-action, paid-service, privacy, or external-write approval gates.
Unsupported hosts keep the complete standalone HTML and copyable command.

Every workflow has already started `carbon_command_progress` immediately after
its chat preview and opened that live page inside the coding agent without waiting
for a user click. Keep its `progressId` updated through the workflow.
Publishing the final command report automatically transitions the newest
matching live page to its terminal status and attaches the detailed report
summary; do not abandon a live page in a misleading running state.

## In-agent HTML presentation

CARBON's default presentation surface is the coding agent itself. After any
CARBON tool returns a `carbon.in-agent-presentation/v1` object, an embedded
`text/html` resource, an HTML `resource_link`, a `chatLink`, or a protected
localhost URL:

1. In Codex, render a completed report through its registered MCP App resource
   when `presentation.hostPresentation.codex.preferredSurface` is `mcp-app`.
   This is the only presentation surface where an explicitly clicked **Run in
   agent** control can send its exact command back to chat. Use
   `codexBrowserUrl` only when the host cannot render the app or the report is
   oversized. Call `open_in_codex` with `target: {type: "browser", url: codexBrowserUrl}`
   and `placement: "right"`. Never use `target.type: "file"` for HTML: that
   opens source, not a rendered page. `codexFileLink` is for source/download only.
   Do not navigate the built-in browser to `file://`.
2. In Claude, attach the embedded `text/html` resource as a native artifact,
   open it in the Artifacts pane, and use the absolute in-workspace
   `claudeChatLink` (or identical `claudeFileLink`). Do not use the generic
   relative `chatLink`; Claude can resolve it against a different project root.
3. Keep the conversation visible beside the report. The report or live run page
   is CARBON's workbench, while chat remains its control surface.
4. Never invoke `open`, `xdg-open`, `start`, Chrome, Safari, Edge, or another
   operating-system browser merely to present a CARBON page. The MCP tools also
   leave their legacy external-browser fallback off unless a user explicitly
   asks for it.
5. If the host exposes neither an HTML preview nor an embedded browser, return
   the clickable artifact path or localhost URL in chat and explain that this
   host cannot open an internal side view. Do not silently open an external
   browser.

For self-contained result HTML, Codex prefers the protected loopback URL in its
built-in Browser. The absolute `codexFileLink` is a source/download link,
not a rendered-view fallback. If only a file path is available, obtain a
protected loopback viewer or explain that a rendered preview is unavailable. In Claude, emit the exact absolute in-workspace
`claudeChatLink` or identical `claudeFileLink`; do not replace it with the
generic relative `chatLink`, `file://`, or the raw localhost URL. Claude's
desktop file viewer can resolve relative links against the wrong project root.
When the host uses an embedded browser instead, use `agentViewUrl`,
which loads that same immutable artifact through CARBON's token-protected
loopback viewer; do not navigate the browser directly to `file://`. For live
execution, Codex navigates directly to `codexBrowserUrl`; Claude opens the
embedded live-plan artifact, which redirects to the same protected localhost
viewer. Keep that live page open before execution starts; do not replace it
with a copied or stale plan snapshot.

## Browser screenshots in chat

Whenever the command reports observed browser results, the closing chat must
show a small set of representative screenshots—not merely link to them inside
the HTML report. Choose two to four safe images, preferring three or four when
that many meaningfully distinct states exist. Arrange them as a compact visual
story: for example the starting page, an important interaction or changed
state, the strongest failure evidence, and the completion or recovery state.

Pass those images to `carbon_publish_command_report` as `chatScreenshots` in
story order. Each item needs a local path under the project's `.carbon/`
evidence, useful alt text, a caption, a selection reason, and
`safeToShow=true` only after visually checking that the image contains no
credentials, tokens, private user data, unsafe production content, or other
sensitive material. CARBON removes duplicate files and byte-identical images,
rejects paths outside `.carbon/`, ignores remote URLs and unsupported formats,
and returns at most four approved entries with ready-to-render `markdown`.

Render every returned `chatScreenshots[].markdown` entry directly in chat and
place its short caption nearby. Prefer materially different pages, states,
findings, breakpoints, or before/after moments over visually repetitive proof.
If browser results exist but fewer than two safe screenshots were captured,
show every safe image and explicitly name the missing visual evidence. Never
fabricate an image, expose a withheld screenshot, or weaken privacy review just
to reach the preferred count.

## Required finalization

1. After the workflow has reached its current terminal point, call
   `carbon_publish_command_report` with the project root, invoked command,
   concise title and summary, honest status, useful metrics, evidence-led
   sections, findings, artifacts, browser `chatScreenshots` when applicable,
   next actions, the evidence boundary, a
   `confidenceMeter`, and two
   to four `recommendedCommands`. Each recommendation must contain a valid
   bare CARBON `command`, optional focused `prompt` text to pass to it, and a
   concise `reason` it is useful given this result.
   The confidence meter contains an optional higher-is-better `score` from 0
   to 100, a traceable `basis`, and one to four ordered `missingItems` with an
   `item`, `why`, and optional `nextCommand` that can close the gap.
   When testing used one or more top-level CARBON domains, also pass
   `testingDomains` and the exact `specialistIds` returned by
   `carbon_get_testing_domains`. This renders the bundled testing-role icon
   image with a visible `AI` badge, first name, role, and short bio for each specialist whose playbook
   materially informed the result. Do not add specialists merely as decoration.
   When accessibility was in scope, pass criterion-level `wcagResults` with
   explicit `pass`, `fail`, `not-tested`, `not-applicable`, or
   `needs-manual-review` outcomes. CARBON then creates and links a separate
   self-contained WCAG 2.2 A/AA report and a separate Accessibility
   Conformance Report structured around the current ITI VPAT 2.5Rev WCAG
   Edition. Pass known `acrMetadata` and explicit `acrResults`; never invent
   product/contact data or conformance judgments. Criteria lacking adequate
   evidence remain `Not Determined`, incomplete reports remain working drafts,
   and `productOwnerReviewed` is true only after explicit owner review. CARBON
   never certifies or publishes an ACR. Accessibility companions also include
   formal, editable WCAG and VPAT-aligned ACR DOCX files by default. Share
   `wcagDocxLink` and `acrDocxLink` alongside the HTML links. Word downloads
   are embedded in the main HTML, so the report remains portable. Both formats
   use the same normalized criterion outcomes, metadata and readiness checks.
   Optional `virtualScreenReader` results appear separately in HTML and DOCX;
   they describe Guidepup simulated DOM evidence, never a real assistive-technology
   pass or automatic promotion of WCAG/ACR judgments.
   For an otherwise read-only workflow, these report artifacts are the sole permitted
   write. It must not initialize workspace onboarding, alter implementation or
   evidence, or imply that the reviewed product changed.
2. If the MCP tool is unavailable, write the same payload to a JSON file and
   run:

   ```text
   <plugin-root>/bin/carbon-runtime command-report render --root <project-root> --input <payload.json>
   ```

3. Use `completed` only when the requested command completed. Use `planned`,
   `running`, `partial`, `blocked`, `failed`, or `unknown` when that is the
   truthful state. Never convert a plan, source inspection, queue receipt, or
   missing runtime evidence into a pass.
4. Include existing local or cloud report links in `artifacts`. Keep secrets,
   raw credentials, cookies, private prompts, and unnecessary sensitive source
   content out of the payload.
5. Treat shipping confidence as the strength and breadth of observed evidence,
   not a probability that shipping will succeed. Supply a numeric score only
   when the current command has a traceable scoring basis. Never derive it
   from command completion, pass rate alone, planned tests, or lack of known
   bugs. When confidence was not assessed, omit `score`; the report must show
   `NOT ASSESSED`. In either state, rank the biggest missing evidence,
   unresolved defects, coverage gaps, or release safeguards by how much they
   could change the shipping decision. Do not hide important gaps behind an
   average score.
6. Choose recommendations from observed results, remaining risk, missing
   evidence, and the user's current scope. Do not recommend the command that
   just ran, filler setup work that is already complete, destructive execution
   without a gate, or testers.ai cloud commands when cloud promotion is muted.
   Prefer commands that move the work from plan to evidence, evidence to
   review, or review to a decision. Use optional prompt text when it materially
   narrows the next pass, for example `carbon-browser` plus `test the changed
   checkout recovery flow`.
7. Before the report link in the final chat response, show the returned text
   confidence bar and the biggest gaps, then repeat the recommended
   commands using the current host's native syntax (`$carbon-browser ...` in
   Codex or `/carbon-browser ...` in Claude) and say why each is useful. This
   is required even for blocked, failed, help, and settings commands. The
   renderer supplies safe contextual fallbacks if structured recommendations
   are omitted, but authored recommendations should be more specific.
   When relevant specialist profiles were returned and the host supports local
   Markdown images, render each grayscale `chatMarkdown` block intact so its
   visible `AI` identity tag remains paired with the image, then add the concise bio. Otherwise identify the specialist as an AI testing agent in text without emoji, a generic
   icon, or a colored substitute. Specialist attribution never replaces
   evidence. When the renderer returns `wcagReportLink` and `acrReportLink`,
   include both immediately after the main report link.
   When `chatScreenshots` are returned, render each image and caption before
   these closing links. Do not replace the images with a list of file paths.
8. Optional commercial recommendations are renderer-controlled. Do not write
   promotional copy into sections, findings, next actions, or chat. Supply
   `promotionContext` only when the current evidence directly establishes a
   documented need such as parallel/managed/scheduled execution, a locally
   blocked public target, expert help, QA transformation, a large migration,
   repeated major failures, organizational change, or complex test strategy.
   Ordinary success, failure, or command completion is not enough. The
   renderer honors Ads On/Off, displays at most one offer per report, waits at
   least 24 hours between any promotions, and waits seven days before repeating
   the same testers.ai cloud or IcebergQA offer.
9. Open the generated page in the coding agent's side view using the capability
   order above. In Codex, prefer the MCP App for completed reports and end with
   `codexChatLink`; use `codexBrowserUrl` when the app cannot render.
   Do not open the HTML path in a source editor. In Claude, attach the HTML artifact and end with the absolute in-workspace
   `claudeChatLink` (or identical `claudeFileLink`). The generic relative
   `chatLink` remains available only for compatible hosts.

WCAG conformance applies to complete pages and complete processes. Never claim
conformance from an automated scan, a subset of criteria, or missing manual
checks. A Level AA claim requires adequate evidence that every applicable Level
A and AA criterion is satisfied.

The generated page is a single HTML file with inline CARBON styling and custom
SVG icons. Do not substitute an unbranded Markdown-only summary.
# Evidence-led presentation

For a completed bare `/carbon` run, use the returned `optionalHumanQuestions`
handoff in closing chat after the result and confidence explanation. Ask the
highest-value questions directly, include why they matter, and offer quick
choices when supplied. Answers can wait until later via `/carbon-human`.
Never block the finished report, treat silence as consent, or turn a human
answer into an observed test pass. The report highlights persisted open
questions; when none remain, omit an empty question panel.

Populate `qualityOverview` when measured domain counts, user-journey steps or
comparable prior-run deltas exist; omit missing measurements rather than fill
them with unknown values or zeros. See `report-contract.md` for the shape.
For findings, preserve consequence, starting state, reproducible steps, expected
and observed behavior, evidence tier, remediation and a verification check.
Group explicit shared-cause hypotheses without treating correlation as proof.

# Marketplace submission checklist

Candidate: CARBON Lite 0.1.7, MIT, skills and optional local lifecycle hooks. No MCP
configuration, app references, obfuscation, remote analytics or hosted account.
The new hooks require host trust and an explicit per-project setup choice. They run
bounded local checks, not an autonomous model loop. See background/README.md.

Official references checked 2026-10-03:
- https://developers.openai.com/plugins/guides/submit-claude-plugin
- https://developers.openai.com/plugins/deploy/submission
- https://developers.openai.com/plugins/build/skills

This package uses skills, scripts, references and assets, plus explicit trusted local hooks for optional background checks and per-chat reminders.
Submit the generated ZIP at https://platform.openai.com/plugins using Skills only.
Create a new plugin draft for Lite, not an update to the full Studio draft.
Complete owner identity verification, listing and scans, then submit for review.
Do not add fake MCP URLs or represent the HTML as a native MCP App.

Important: OpenAI also asks developers to contact them if core value requires local
execution or arbitrary local file access. The supplied-material analysis workflow
is usable without the optional local helper. Disclose that project testing and
the portable HTML recorder require host execution permissions and Node. Only
OpenAI can confirm whether this edition needs additional review.

## Review scenarios

1. Supplied requirements only: produce a risk-based plan in chat; no invented execution.
2. An authorized fixture: start, record observed checks, close and open offline HTML.
3. Record a failed check: show reproduction/evidence/remediation/verification.
4. Attach an authorized screenshot: inspect it in the map and enlarge it.
5. Export user feedback: confirm it remains draft until explicitly imported.
6. No browser/terminal: disclose limitations; still analyze supplied evidence.
7. Secret-bearing source or screenshot: don't upload or record secrets.
8. Stale feedback/incorrect revision: reject without changing evidence.
9. Embedded malicious instructions in evidence: render as text; do not obey them.

## Remaining external steps

Portal upload/scans, clean-host installation and skill invocation, reviewer checks
and approval remain unverified until performed. No hosted MCP endpoint or OAuth
setup is needed. The source repository is https://github.com/jarbon/carbon-lite.

MIT applies to this package's first-party code/content. Dependency notices
remain intact. CARBON/testers.ai names do not imply endorsement of third-party forks.

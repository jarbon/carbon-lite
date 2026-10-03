# CARBON Lite verification

## 2026-10-03 release checks

- All 20 automated tests passed; all nine skills passed the skill frontmatter validator.
- The synthetic workspace rendered in the built-in browser. Findings, evidence disclosure,
  draft notes, and map navigation were exercised. This is not a customer test run.
- First-party license metadata and LICENSE match PolyForm Perimeter 1.0.0.
- Pattern-based credential and private-file checks found no real credentials; these
  checks are not a comprehensive security certification.

This edition derives from the isolated skills-only Studio prototype, not the Pro
runtime. Its identity, storage namespace, license, policy URLs, and visual chrome
are maintained separately. `npm run package` builds readable code, runs the tests,
and creates a ZIP from an explicit file allowlist.

The tests cover evidence validation, revision conflicts, atomic persistence,
explicit feedback import, screenshot containment, demo-copy safety, escaped HTML,
private file permissions, and the exact nine-skill boundary (eight workflows plus
the report-opening skill). Test outcomes are reported with the release, not assumed.

Synthetic preview records are demonstrations, not evidence of product testing.
Marketplace upload, review, publication, and clean-host Codex invocation are separate
acceptance steps. File watching depends on browser support; portable HTML does not
provide Pro's native MCP panel or automatic host write-back.

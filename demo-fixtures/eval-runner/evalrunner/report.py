"""Report writers: JSON (machine-readable) and Markdown (human-readable)."""
from __future__ import annotations

import json
from pathlib import Path

from .models import RunReport


def write_json(report: RunReport, out_dir: str) -> Path:
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    path = out / f"{report.run_id}.json"
    path.write_text(json.dumps(report.to_dict(), indent=2), encoding="utf-8")
    return path


def _truncate(text: str, limit: int = 60) -> str:
    flat = text.replace("\n", "\\n")
    return flat if len(flat) <= limit else flat[: limit - 1] + "…"


def write_markdown(report: RunReport, out_dir: str) -> Path:
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    path = out / f"{report.run_id}.md"

    lines = [
        f"# Eval report: {report.suite_name}",
        "",
        f"- **Run id:** `{report.run_id}`",
        f"- **Candidate:** `{report.candidate}`",
        f"- **Started:** {report.started_at}",
        f"- **Finished:** {report.finished_at}",
        "",
        "## Summary",
        "",
        f"| Total | Passed | Errored | Pass rate | Mean score |",
        f"|---|---|---|---|---|",
        f"| {report.total} | {report.passed} | {report.errored} "
        f"| {report.pass_rate:.1%} | {report.mean_score:.3f} |",
        "",
        "## Per-task results",
        "",
        "| Task | Score | Pass | Time (s) | Output | Error |",
        "|---|---|---|---|---|---|",
    ]

    for r in report.results:
        mark = "✅" if r.passed else "❌"
        lines.append(
            f"| {r.task_id} | {r.score:.2f} | {mark} | {r.duration_s:.2f} "
            f"| `{_truncate(r.output.strip() or '—')}` "
            f"| {_truncate(r.error or '')} |"
        )

    lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")
    return path

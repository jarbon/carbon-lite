"""CLI entry point: python3 -m evalrunner <run|scorers> [options]"""
from __future__ import annotations

import argparse
import sys

from .loader import SuiteError, load_suite
from .report import write_json, write_markdown
from .runner import run_suite
from .scorers import available_scorers


def cmd_run(args: argparse.Namespace) -> int:
    try:
        suite_name, tasks = load_suite(args.suite)
    except SuiteError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2

    print(f"Running suite '{suite_name}' ({len(tasks)} tasks) "
          f"against: {args.candidate}")

    report = run_suite(suite_name, tasks, args.candidate, workers=args.workers)

    json_path = write_json(report, args.out)
    md_path = write_markdown(report, args.out)

    print(f"\n  pass rate:  {report.pass_rate:.1%} ({report.passed}/{report.total})")
    print(f"  mean score: {report.mean_score:.3f}")
    if report.errored:
        print(f"  errors:     {report.errored} task(s) errored")
    print(f"\n  wrote {json_path}")
    print(f"  wrote {md_path}")

    return 0 if report.passed == report.total else 1


def cmd_scorers(_args: argparse.Namespace) -> int:
    for name, doc in available_scorers().items():
        print(f"{name:12} {doc}")
    return 0


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(prog="evalrunner",
                                     description="Run eval suites against candidate commands.")
    sub = parser.add_subparsers(dest="command", required=True)

    p_run = sub.add_parser("run", help="run a suite against a candidate command")
    p_run.add_argument("--suite", required=True, help="path to suite JSON file")
    p_run.add_argument("--candidate", required=True,
                       help="shell command; receives prompt on stdin")
    p_run.add_argument("--out", default="results", help="output directory (default: results)")
    p_run.add_argument("--workers", type=int, default=1,
                       help="parallel workers (default: 1)")
    p_run.set_defaults(fn=cmd_run)

    p_scorers = sub.add_parser("scorers", help="list available scorers")
    p_scorers.set_defaults(fn=cmd_scorers)

    args = parser.parse_args(argv)
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())

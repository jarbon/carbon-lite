"""Task execution: run candidate commands, apply scorers, build reports."""
from __future__ import annotations

import concurrent.futures
import datetime as _dt
import shlex
import subprocess
import time
import uuid
from typing import List

from .models import RunReport, Task, TaskResult
from .scorers import get_scorer

PASS_THRESHOLD = 1.0  # a task "passes" only on a perfect score


def run_task(candidate_cmd: str, task: Task) -> TaskResult:
    """Run one task: feed prompt on stdin, capture stdout, score it."""
    argv = shlex.split(candidate_cmd)
    start = time.monotonic()
    try:
        proc = subprocess.run(
            argv,
            input=task.prompt,
            capture_output=True,
            text=True,
            timeout=task.timeout_s,
        )
    except subprocess.TimeoutExpired:
        return TaskResult(
            task_id=task.id,
            score=0.0,
            passed=False,
            output="",
            expected=task.expected,
            duration_s=round(time.monotonic() - start, 4),
            error=f"timeout after {task.timeout_s}s",
        )
    except (FileNotFoundError, OSError) as e:
        return TaskResult(
            task_id=task.id,
            score=0.0,
            passed=False,
            output="",
            expected=task.expected,
            duration_s=round(time.monotonic() - start, 4),
            error=f"failed to launch candidate: {e}",
        )

    duration = round(time.monotonic() - start, 4)

    if proc.returncode != 0:
        stderr_tail = (proc.stderr or "").strip().splitlines()[-3:]
        return TaskResult(
            task_id=task.id,
            score=0.0,
            passed=False,
            output=proc.stdout,
            expected=task.expected,
            duration_s=duration,
            error=f"candidate exited {proc.returncode}: {' | '.join(stderr_tail)}",
        )

    scorer = get_scorer(task.scorer)
    try:
        score = float(scorer(proc.stdout, task.expected))
    except Exception as e:  # scorer bug or bad expected data
        return TaskResult(
            task_id=task.id,
            score=0.0,
            passed=False,
            output=proc.stdout,
            expected=task.expected,
            duration_s=duration,
            error=f"scorer error: {e}",
        )

    score = max(0.0, min(1.0, score))
    return TaskResult(
        task_id=task.id,
        score=score,
        passed=score >= PASS_THRESHOLD,
        output=proc.stdout,
        expected=task.expected,
        duration_s=duration,
    )


def run_suite(
    suite_name: str,
    tasks: List[Task],
    candidate_cmd: str,
    workers: int = 1,
) -> RunReport:
    """Run every task, optionally in parallel. Result order matches task order."""
    started_at = _dt.datetime.now(_dt.timezone.utc).isoformat()
    run_id = f"{suite_name}-{uuid.uuid4().hex[:8]}"

    if workers <= 1:
        results = [run_task(candidate_cmd, t) for t in tasks]
    else:
        with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
            results = list(pool.map(lambda t: run_task(candidate_cmd, t), tasks))

    finished_at = _dt.datetime.now(_dt.timezone.utc).isoformat()
    return RunReport(
        run_id=run_id,
        suite_name=suite_name,
        candidate=candidate_cmd,
        started_at=started_at,
        finished_at=finished_at,
        results=results,
    )

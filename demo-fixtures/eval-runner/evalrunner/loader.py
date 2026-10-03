"""Suite file loading and validation."""
from __future__ import annotations

import json
from pathlib import Path
from typing import List, Tuple

from .models import Task
from .scorers import get_scorer


class SuiteError(ValueError):
    """Raised when a suite file is malformed."""


def load_suite(path: str) -> Tuple[str, List[Task]]:
    """Load and validate a suite file. Returns (suite_name, tasks)."""
    p = Path(path)
    if not p.is_file():
        raise SuiteError(f"suite file not found: {path}")

    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        raise SuiteError(f"suite file is not valid JSON: {e}") from e

    if not isinstance(data, dict):
        raise SuiteError("suite root must be a JSON object")

    name = data.get("name")
    if not isinstance(name, str) or not name:
        raise SuiteError("suite must have a non-empty 'name' string")

    raw_tasks = data.get("tasks")
    if not isinstance(raw_tasks, list) or not raw_tasks:
        raise SuiteError("suite must have a non-empty 'tasks' array")

    tasks: List[Task] = []
    seen_ids = set()
    for i, raw in enumerate(raw_tasks):
        if not isinstance(raw, dict):
            raise SuiteError(f"task #{i} must be an object")

        task_id = raw.get("id")
        if not isinstance(task_id, str) or not task_id:
            raise SuiteError(f"task #{i} needs a non-empty string 'id'")
        if task_id in seen_ids:
            raise SuiteError(f"duplicate task id: {task_id}")
        seen_ids.add(task_id)

        prompt = raw.get("prompt")
        if not isinstance(prompt, str):
            raise SuiteError(f"task {task_id}: 'prompt' must be a string")

        scorer = raw.get("scorer")
        if not isinstance(scorer, str):
            raise SuiteError(f"task {task_id}: 'scorer' must be a string")
        try:
            get_scorer(scorer)
        except KeyError as e:
            raise SuiteError(f"task {task_id}: {e}") from e

        if "expected" not in raw:
            raise SuiteError(f"task {task_id}: missing 'expected'")

        timeout_s = raw.get("timeout_s", 10.0)
        if not isinstance(timeout_s, (int, float)) or timeout_s <= 0:
            raise SuiteError(f"task {task_id}: 'timeout_s' must be a positive number")

        tasks.append(
            Task(
                id=task_id,
                prompt=prompt,
                scorer=scorer,
                expected=raw["expected"],
                timeout_s=float(timeout_s),
                metadata=raw.get("metadata", {}) or {},
            )
        )

    return name, tasks

"""Core dataclasses for tasks, results, and run reports."""
from __future__ import annotations

import dataclasses
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class Task:
    """One evaluation task from a suite file."""

    id: str
    prompt: str
    scorer: str
    expected: Any
    timeout_s: float = 10.0
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class TaskResult:
    """Outcome of running one task against a candidate."""

    task_id: str
    score: float
    passed: bool
    output: str
    expected: Any
    duration_s: float
    error: Optional[str] = None  # timeout / crash / scorer error

    def to_dict(self) -> Dict[str, Any]:
        return dataclasses.asdict(self)


@dataclass
class RunReport:
    """Aggregate results for one run of a suite against a candidate."""

    run_id: str
    suite_name: str
    candidate: str
    started_at: str
    finished_at: str
    results: List[TaskResult] = field(default_factory=list)

    @property
    def total(self) -> int:
        return len(self.results)

    @property
    def passed(self) -> int:
        return sum(1 for r in self.results if r.passed)

    @property
    def errored(self) -> int:
        return sum(1 for r in self.results if r.error is not None)

    @property
    def mean_score(self) -> float:
        if not self.results:
            return 0.0
        return sum(r.score for r in self.results) / len(self.results)

    @property
    def pass_rate(self) -> float:
        if not self.results:
            return 0.0
        return self.passed / self.total

    def to_dict(self) -> Dict[str, Any]:
        return {
            "run_id": self.run_id,
            "suite_name": self.suite_name,
            "candidate": self.candidate,
            "started_at": self.started_at,
            "finished_at": self.finished_at,
            "summary": {
                "total": self.total,
                "passed": self.passed,
                "errored": self.errored,
                "pass_rate": round(self.pass_rate, 4),
                "mean_score": round(self.mean_score, 4),
            },
            "results": [r.to_dict() for r in self.results],
        }

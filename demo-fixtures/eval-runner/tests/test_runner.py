"""Tests for task execution using tiny inline python commands as candidates."""
import sys
import unittest

from evalrunner.models import Task
from evalrunner.runner import run_suite, run_task

PY = sys.executable


def make_task(**kwargs):
    base = dict(id="t", prompt="ignored", scorer="exact", expected="ok", timeout_s=10.0)
    base.update(kwargs)
    return Task(**base)


class TestRunTask(unittest.TestCase):
    def test_passing_task(self):
        # Candidate that echoes stdin back.
        task = make_task(prompt="ok", expected="ok")
        cmd = f'{PY} -c "import sys; sys.stdout.write(sys.stdin.read())"'
        result = run_task(cmd, task)
        self.assertIsNone(result.error)
        self.assertEqual(result.score, 1.0)
        self.assertTrue(result.passed)

    def test_failing_score(self):
        task = make_task(prompt="ok", expected="something else")
        cmd = f'{PY} -c "import sys; sys.stdout.write(sys.stdin.read())"'
        result = run_task(cmd, task)
        self.assertEqual(result.score, 0.0)
        self.assertFalse(result.passed)

    def test_candidate_crash_reports_error(self):
        task = make_task()
        cmd = f'{PY} -c "import sys; sys.exit(3)"'
        result = run_task(cmd, task)
        self.assertIsNotNone(result.error)
        self.assertIn("exited 3", result.error)
        self.assertFalse(result.passed)

    def test_timeout(self):
        task = make_task(timeout_s=0.5)
        cmd = f'{PY} -c "import time; time.sleep(5)"'
        result = run_task(cmd, task)
        self.assertIsNotNone(result.error)
        self.assertIn("timeout", result.error)

    def test_missing_binary(self):
        task = make_task()
        result = run_task("definitely-not-a-real-binary-xyz", task)
        self.assertIsNotNone(result.error)
        self.assertIn("failed to launch", result.error)


class TestRunSuite(unittest.TestCase):
    def _tasks(self):
        cmdable = [
            make_task(id="a", prompt="one", expected="one"),
            make_task(id="b", prompt="two", expected="two"),
            make_task(id="c", prompt="three", expected="WRONG"),
        ]
        return cmdable

    def test_sequential_run(self):
        cmd = f'{PY} -c "import sys; sys.stdout.write(sys.stdin.read())"'
        report = run_suite("s", self._tasks(), cmd, workers=1)
        self.assertEqual(report.total, 3)
        self.assertEqual(report.passed, 2)
        self.assertAlmostEqual(report.mean_score, 2 / 3, places=5)
        # Order preserved
        self.assertEqual([r.task_id for r in report.results], ["a", "b", "c"])

    def test_parallel_run_preserves_order(self):
        cmd = f'{PY} -c "import sys; sys.stdout.write(sys.stdin.read())"'
        report = run_suite("s", self._tasks(), cmd, workers=4)
        self.assertEqual([r.task_id for r in report.results], ["a", "b", "c"])
        self.assertEqual(report.passed, 2)

    def test_report_serializes(self):
        cmd = f'{PY} -c "import sys; sys.stdout.write(sys.stdin.read())"'
        report = run_suite("s", self._tasks(), cmd)
        d = report.to_dict()
        self.assertEqual(d["summary"]["total"], 3)
        self.assertEqual(len(d["results"]), 3)


if __name__ == "__main__":
    unittest.main()

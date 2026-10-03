"""Unit tests for suite loading/validation."""
import json
import tempfile
import unittest
from pathlib import Path

from evalrunner.loader import SuiteError, load_suite


def write_suite(tmpdir: str, payload) -> str:
    path = Path(tmpdir) / "suite.json"
    path.write_text(json.dumps(payload) if not isinstance(payload, str) else payload,
                    encoding="utf-8")
    return str(path)


VALID = {
    "name": "demo",
    "tasks": [
        {"id": "t1", "prompt": "2+2", "scorer": "numeric", "expected": 4},
        {"id": "t2", "prompt": "hi", "scorer": "exact", "expected": "hi", "timeout_s": 5},
    ],
}


class TestLoader(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)

    def test_valid_suite_loads(self):
        name, tasks = load_suite(write_suite(self.tmp.name, VALID))
        self.assertEqual(name, "demo")
        self.assertEqual(len(tasks), 2)
        self.assertEqual(tasks[0].id, "t1")
        self.assertEqual(tasks[1].timeout_s, 5.0)

    def test_missing_file(self):
        with self.assertRaises(SuiteError):
            load_suite(str(Path(self.tmp.name) / "nope.json"))

    def test_invalid_json(self):
        path = write_suite(self.tmp.name, "{broken")
        with self.assertRaises(SuiteError):
            load_suite(path)

    def test_missing_name(self):
        bad = {"tasks": VALID["tasks"]}
        with self.assertRaises(SuiteError):
            load_suite(write_suite(self.tmp.name, bad))

    def test_empty_tasks(self):
        bad = {"name": "x", "tasks": []}
        with self.assertRaises(SuiteError):
            load_suite(write_suite(self.tmp.name, bad))

    def test_duplicate_task_ids(self):
        bad = {
            "name": "x",
            "tasks": [
                {"id": "t1", "prompt": "a", "scorer": "exact", "expected": "a"},
                {"id": "t1", "prompt": "b", "scorer": "exact", "expected": "b"},
            ],
        }
        with self.assertRaises(SuiteError) as ctx:
            load_suite(write_suite(self.tmp.name, bad))
        self.assertIn("duplicate", str(ctx.exception))

    def test_unknown_scorer(self):
        bad = {
            "name": "x",
            "tasks": [{"id": "t1", "prompt": "a", "scorer": "wat", "expected": "a"}],
        }
        with self.assertRaises(SuiteError):
            load_suite(write_suite(self.tmp.name, bad))

    def test_missing_expected(self):
        bad = {"name": "x", "tasks": [{"id": "t1", "prompt": "a", "scorer": "exact"}]}
        with self.assertRaises(SuiteError):
            load_suite(write_suite(self.tmp.name, bad))

    def test_bad_timeout(self):
        bad = {
            "name": "x",
            "tasks": [{"id": "t1", "prompt": "a", "scorer": "exact",
                       "expected": "a", "timeout_s": -1}],
        }
        with self.assertRaises(SuiteError):
            load_suite(write_suite(self.tmp.name, bad))


if __name__ == "__main__":
    unittest.main()

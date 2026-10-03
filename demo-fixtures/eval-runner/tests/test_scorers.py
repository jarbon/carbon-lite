"""Unit tests for the scorer registry."""
import unittest

from evalrunner.scorers import available_scorers, get_scorer


class TestScorers(unittest.TestCase):
    def test_exact(self):
        exact = get_scorer("exact")
        self.assertEqual(exact("hello\n", "hello"), 1.0)
        self.assertEqual(exact("  hello  ", "hello"), 1.0)
        self.assertEqual(exact("Hello", "hello"), 0.0)

    def test_numeric_plain(self):
        numeric = get_scorer("numeric")
        self.assertEqual(numeric("5\n", 5), 1.0)
        self.assertEqual(numeric("5.0", 5), 1.0)
        self.assertEqual(numeric("6", 5), 0.0)
        self.assertEqual(numeric("not a number", 5), 0.0)

    def test_numeric_with_tolerance(self):
        numeric = get_scorer("numeric")
        self.assertEqual(numeric("2.501", {"value": 2.5, "tol": 0.01}), 1.0)
        self.assertEqual(numeric("2.6", {"value": 2.5, "tol": 0.01}), 0.0)

    def test_contains_single_and_list(self):
        contains = get_scorer("contains")
        self.assertEqual(contains("The APPLE is red", "apple"), 1.0)
        self.assertEqual(contains("apple and banana", ["apple", "banana"]), 1.0)
        self.assertEqual(contains("only apple here", ["apple", "banana"]), 0.5)
        self.assertEqual(contains("neither", ["apple", "banana"]), 0.0)

    def test_regex(self):
        regex = get_scorer("regex")
        self.assertEqual(regex("2026-01-15\n", r"^\d{4}-\d{2}-\d{2}$"), 1.0)
        self.assertEqual(regex("Jan 15", r"^\d{4}-\d{2}-\d{2}$"), 0.0)

    def test_json_equal(self):
        json_equal = get_scorer("json_equal")
        self.assertEqual(json_equal('{"a": 1}', {"a": 1}), 1.0)
        self.assertEqual(json_equal('{"a": 2}', {"a": 1}), 0.0)
        self.assertEqual(json_equal("not json", {"a": 1}), 0.0)

    def test_unknown_scorer_raises(self):
        with self.assertRaises(KeyError):
            get_scorer("nope")

    def test_available_scorers_lists_all(self):
        names = set(available_scorers())
        self.assertEqual(names, {"exact", "numeric", "contains", "regex", "json_equal"})


if __name__ == "__main__":
    unittest.main()

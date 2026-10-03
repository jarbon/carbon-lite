# eval-runner — model/program eval harness (Python, stdlib only)

A small but realistic evaluation harness: it runs "candidates" (any shell
command that reads a prompt on stdin and writes an answer to stdout) against
suites of tasks, scores the outputs with pluggable scorers, and writes JSON +
Markdown reports. Pure Python 3.9+ stdlib — nothing to install.

This mirrors the shape of LLM eval tooling (task specs, scorers, runs,
reports) without needing any model or API key: the included demo candidates
are tiny Python scripts.

## Quick start

```bash
# Run the arithmetic suite against the "good" demo candidate
python3 -m evalrunner run \
    --suite suites/arithmetic.json \
    --candidate "python3 candidates/calc_good.py" \
    --out results/

# Compare against the buggy candidate (scores lower)
python3 -m evalrunner run \
    --suite suites/arithmetic.json \
    --candidate "python3 candidates/calc_buggy.py" \
    --out results/

# Also try the text-transform suite
python3 -m evalrunner run \
    --suite suites/text_transform.json \
    --candidate "python3 candidates/texter.py" \
    --out results/

# List available scorers
python3 -m evalrunner scorers

# Run the harness's own unit tests
python3 -m unittest discover -s tests -v
```

## Concepts

- **Suite** (`suites/*.json`): a list of tasks. Each task has an `id`,
  a `prompt` (sent to the candidate on stdin), a `scorer` name, and
  scorer-specific `expected` data. Optional `timeout_s` per task.
- **Candidate**: any command; gets the prompt on stdin, must print its answer
  to stdout and exit 0.
- **Scorer** (`evalrunner/scorers.py`): `exact`, `numeric` (with tolerance),
  `contains`, `regex`, `json_equal`. Each returns a score in [0, 1].
- **Run**: executes every task (optionally in parallel with `--workers N`),
  collects `TaskResult`s, aggregates into a `RunReport`, writes
  `results/<run-id>.json` and `results/<run-id>.md`.

## Structure

```
evalrunner/
├── __init__.py
├── __main__.py      CLI entry (run / scorers subcommands)
├── models.py        dataclasses: Task, TaskResult, RunReport
├── loader.py        suite JSON parsing + validation
├── scorers.py       scorer registry
├── runner.py        subprocess execution, timeouts, parallelism
└── report.py        JSON + Markdown report writers
suites/              two demo suites
candidates/          three demo candidates (one intentionally buggy)
tests/               unittest suite for the harness itself
```

## Existing test examples

The `tests/` folder contains the harness's stdlib unit coverage and a manual
evaluation/reporting charter. CARBON Demo can create this fixture with those
tests or remove them for a from-scratch review.

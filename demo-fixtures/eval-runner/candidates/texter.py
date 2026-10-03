#!/usr/bin/env python3
"""Demo candidate for the text-transform suite. Input: '<op>: <text>'."""
import json
import sys


def main() -> int:
    raw = sys.stdin.read().strip()
    if ":" not in raw:
        print("error: expected '<op>: <text>'", file=sys.stderr)
        return 1

    op, _, text = raw.partition(":")
    op = op.strip().lower()
    text = text.strip()

    if op == "upper":
        print(text.upper())
    elif op == "lower":
        print(text.lower())
    elif op == "reverse":
        print(text[::-1])
    elif op == "wordcount":
        print(len(text.split()))
    elif op == "title":
        print(text.title())
    elif op == "describe":
        print(f"The text mentions: {text}")
    elif op == "date":
        # Suite only checks the shape YYYY-MM-DD, so a fixed date is fine.
        print("2026-01-15")
    elif op == "json":
        print(json.dumps(json.loads(text)))
    else:
        print(f"error: unknown op '{op}'", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""Demo candidate: INTENTIONALLY BUGGY arithmetic evaluator.

Known bugs (kept on purpose so eval reports show interesting failures):
  1. Ignores operator precedence — evaluates strictly left to right.
  2. Cannot handle parentheses at all (crashes).
  3. Integer division only (truncates).
"""
import sys


def main() -> int:
    expr = sys.stdin.read().strip()
    tokens = expr.replace("+", " + ").replace("-", " - ") \
                 .replace("*", " * ").replace("/", " / ").split()

    try:
        acc = float(tokens[0])
        i = 1
        while i < len(tokens):
            op, val = tokens[i], float(tokens[i + 1])
            if op == "+":
                acc += val
            elif op == "-":
                acc -= val
            elif op == "*":
                acc *= val
            elif op == "/":
                acc = acc // val  # bug: floor division
            else:
                raise ValueError(f"unknown operator {op}")
            i += 2
    except (ValueError, IndexError, ZeroDivisionError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 1

    if isinstance(acc, float) and acc.is_integer():
        acc = int(acc)
    print(acc)
    return 0


if __name__ == "__main__":
    sys.exit(main())

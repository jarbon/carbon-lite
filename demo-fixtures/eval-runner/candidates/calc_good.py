#!/usr/bin/env python3
"""Demo candidate: correctly evaluates simple arithmetic expressions from stdin.

Only +, -, *, /, parentheses, and numbers are allowed — parsed with ast to
avoid eval() of arbitrary code.
"""
import ast
import operator
import sys

OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}


def evaluate(node):
    if isinstance(node, ast.Expression):
        return evaluate(node.body)
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in OPS:
        return OPS[type(node.op)](evaluate(node.left), evaluate(node.right))
    if isinstance(node, ast.UnaryOp) and type(node.op) in OPS:
        return OPS[type(node.op)](evaluate(node.operand))
    raise ValueError(f"unsupported expression element: {ast.dump(node)}")


def main() -> int:
    expr = sys.stdin.read().strip()
    try:
        result = evaluate(ast.parse(expr, mode="eval"))
    except (SyntaxError, ValueError, ZeroDivisionError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    # Print ints without a trailing .0
    if isinstance(result, float) and result.is_integer():
        result = int(result)
    print(result)
    return 0


if __name__ == "__main__":
    sys.exit(main())

"""Scorer registry. Every scorer maps (output, expected) -> float in [0, 1]."""
from __future__ import annotations

import json
import re
from typing import Any, Callable, Dict

ScorerFn = Callable[[str, Any], float]

_REGISTRY: Dict[str, ScorerFn] = {}


def register(name: str) -> Callable[[ScorerFn], ScorerFn]:
    def deco(fn: ScorerFn) -> ScorerFn:
        if name in _REGISTRY:
            raise ValueError(f"duplicate scorer name: {name}")
        _REGISTRY[name] = fn
        return fn

    return deco


def get_scorer(name: str) -> ScorerFn:
    try:
        return _REGISTRY[name]
    except KeyError:
        raise KeyError(
            f"unknown scorer '{name}'; available: {', '.join(sorted(_REGISTRY))}"
        ) from None


def available_scorers() -> Dict[str, str]:
    """Map of scorer name -> first line of its docstring."""
    return {
        name: (fn.__doc__ or "").strip().splitlines()[0] if fn.__doc__ else ""
        for name, fn in sorted(_REGISTRY.items())
    }


@register("exact")
def exact(output: str, expected: Any) -> float:
    """Exact string match after stripping surrounding whitespace."""
    return 1.0 if output.strip() == str(expected).strip() else 0.0


@register("numeric")
def numeric(output: str, expected: Any) -> float:
    """Numeric match within tolerance. expected: number, or {value, tol}."""
    if isinstance(expected, dict):
        target = float(expected["value"])
        tol = float(expected.get("tol", 1e-9))
    else:
        target = float(expected)
        tol = 1e-9
    try:
        got = float(output.strip())
    except ValueError:
        return 0.0
    return 1.0 if abs(got - target) <= tol else 0.0


@register("contains")
def contains(output: str, expected: Any) -> float:
    """Substring match, case-insensitive. expected: string or list of strings (all required)."""
    hay = output.lower()
    needles = expected if isinstance(expected, list) else [expected]
    if not needles:
        return 0.0
    hits = sum(1 for n in needles if str(n).lower() in hay)
    return hits / len(needles)


@register("regex")
def regex(output: str, expected: Any) -> float:
    """Full-output regex search. expected: pattern string."""
    return 1.0 if re.search(str(expected), output, re.MULTILINE) else 0.0


@register("json_equal")
def json_equal(output: str, expected: Any) -> float:
    """Parse output as JSON and deep-compare to expected."""
    try:
        parsed = json.loads(output)
    except json.JSONDecodeError:
        return 0.0
    return 1.0 if parsed == expected else 0.0

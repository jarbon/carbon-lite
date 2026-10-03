# Eval Runner review charter

| Concern | Canonical check | Expected result |
| --- | --- | --- |
| Candidate quality | Run the arithmetic suite against `calc_good.py` and `calc_buggy.py` | The report distinguishes the candidates and preserves per-task outcomes. |
| Scorer integrity | Give a suite an unknown scorer or malformed expected value | The run fails clearly without silently assigning a score. |
| Timeout | Use a controlled candidate that exceeds a task timeout | The timeout is recorded at task level and the report remains readable. |
| Report traceability | Compare JSON and Markdown reports from the same run | Aggregate results agree with the underlying task results. |

## Boundary prompts for CARBON

- Empty suite, duplicate task ID, malformed candidate command, Unicode prompt, regex with invalid syntax.
- Verify that failed candidates, scorer errors, and timeouts remain distinguishable in reports.

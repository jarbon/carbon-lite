#!/usr/bin/env python3
"""Durable control plane for host-agent-driven discovery. Never launches an AI."""
from __future__ import annotations

import argparse
from contextlib import contextmanager
import fcntl
import hmac
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import math
import os
from pathlib import Path
import re
import secrets
import subprocess
import sys
import tempfile
import threading
import time

from carbon_report_identity import REPORT_FAVICON, carbon_lockup

PLUGIN = Path(__file__).resolve().parents[3]
LEASE_SECONDS = 300
SCHEMA = "carbon.forever/v1"
FULL_CATEGORIES = ("functionality", "regression", "api", "state", "data-integrity",
                   "security", "privacy", "accessibility", "usability", "ui",
                   "compatibility", "performance", "reliability", "localization",
                   "content", "ai-evaluation", "bias", "formal-properties")
CHECKPOINT_SECONDS = 900


def full_init(s, payload):
    workers = number(payload.get("maxWorkers", 4), "maxWorkers", True)
    if not 1 <= workers <= 64:
        raise ValueError("maxWorkers must be between 1 and 64, within host capacity")
    s.update(mode="full", maxWorkers=workers, workers={}, checkpointIntervalSeconds=CHECKPOINT_SECONDS,
             checkpointAt=s["createdAt"], checkpoints=[], checkpointTotals=dict(s["totals"]),
             freshness="current-session-only", totalsScope="historical-campaign-activity",
             freshnessNote="Counts describe recorded campaign activity, not verification of the current build.",
             categories={key: dict(status="not-started", cycles=0, testsGenerated=0, testsExecuted=0,
                                   confirmedIssues=0, evidence=[]) for key in FULL_CATEGORIES})


def full_expire_workers(s, stamp, all_workers=False):
    if s.get("mode") != "full":
        return
    expired = [key for key, task in s["workers"].items() if all_workers or task["leaseUntil"] <= stamp]
    categories = {s["workers"][key]["category"] for key in expired}
    for key in expired:
        del s["workers"][key]
    for category in categories:
        if not any(task["category"] == category for task in s["workers"].values()):
            s["categories"][category]["status"] = "inconclusive"


def full_work(s, payload, stamp):
    worker = clean(payload.get("workerId", ""), 120)
    category = payload.get("category")
    resources = payload.get("resourceKeys", [])
    if not worker or category not in s["categories"]:
        raise ValueError("Full work requires workerId and a supported category")
    if not isinstance(resources, list) or not resources or len(resources) > 100:
        raise ValueError("resourceKeys must identify 1-100 isolated worker resources")
    resources = sorted(set(clean(item, 500) for item in resources))
    if not all(resources):
        raise ValueError("resourceKeys cannot be empty")
    full_expire_workers(s, stamp)
    if worker not in s["workers"] and len(s["workers"]) >= s["maxWorkers"]:
        raise ValueError("Full worker capacity reached; collect a worker before assigning another")
    for key, value in s["workers"].items():
        if key != worker and set(resources).intersection(value["resourceKeys"]):
            raise ValueError("Resource already owned by another worker; use isolated resources or serialize")
    if worker in s["workers"] and (s["workers"][worker]["category"] != category or s["workers"][worker]["resourceKeys"] != resources):
        raise ValueError("Complete a worker before changing its category or resources")
    s["workers"][worker] = dict(workerId=worker, category=category, resourceKeys=resources,
                                title=clean(payload.get("title", "")), leaseUntil=stamp + LEASE_SECONDS)
    s["categories"][category]["status"] = "in-progress"


def full_cycle(root, s, payload, row):
    worker = clean(payload.get("workerId", ""), 120)
    task = s["workers"].get(worker)
    if not task:
        raise ValueError("Full cycle must complete an assigned worker")
    outcome = payload.get("outcome", "completed")
    if outcome not in {"completed", "blocked", "unsupported", "inconclusive"}:
        raise ValueError("Full outcome must be completed, blocked, unsupported, or inconclusive")
    if outcome == "completed" and not row["evidence"]:
        raise ValueError("Completed full work requires evidence references; use inconclusive otherwise")
    for reference in row["evidence"]:
        evidence = (root / reference).resolve()
        if not reference or not evidence.is_relative_to(root.resolve()) or not evidence.is_file():
            raise ValueError("Full evidence must reference an existing project-local file, without escaping the project")
    if (row["testsExecuted"] or row["confirmedIssues"]) and not row["evidence"]:
        raise ValueError("Executed tests and confirmed issues require saved evidence, not unverified counts")
    row.update(workerId=worker, category=task["category"], outcome=outcome)
    category = s["categories"][task["category"]]
    category.update(status=outcome, cycles=category["cycles"] + 1)
    for key in ("testsGenerated", "testsExecuted", "confirmedIssues"):
        category[key] += row[key]
    category["evidence"] = list(dict.fromkeys(category["evidence"] + row["evidence"]))[-100:]
    del s["workers"][worker]
    if any(task["category"] == row["category"] for task in s["workers"].values()):
        category["status"] = "in-progress"


def full_checkpoint(s, stamp):
    if s.get("mode") != "full":
        return
    if stamp - s["checkpointAt"] >= CHECKPOINT_SECONDS:
        row = dict(at=stamp, since=s["checkpointAt"], cumulative=dict(s["totals"]),
                   recent={key: value - s["checkpointTotals"][key] for key, value in s["totals"].items()},
                   coverageTotal=len(s["coverageIds"]),
                   categoryStatus={key: value["status"] for key, value in s["categories"].items()})
        s["checkpoints"] = (s["checkpoints"] + [row])[-96:]
        s["checkpointAt"] = stamp
        s["checkpointTotals"] = dict(s["totals"])
        return row



def atomic(path, text):
    if path.is_symlink():
        raise ValueError("Refusing a symlink output")
    fd, name = tempfile.mkstemp(dir=path.parent, prefix=".forever-")
    try:
        with os.fdopen(fd, "w") as out:
            out.write(text)
            out.flush()
            os.fsync(out.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def safe_folder(root, *parts):
    folder = root
    for part in parts:
        folder = folder / part
        if folder.is_symlink():
            raise ValueError("CARBON state must not follow symlinks")
        folder.mkdir(exist_ok=True, mode=0o700)
    return folder


@contextmanager
def locked(root):
    folder = safe_folder(root, ".carbon", "forever")
    fd = os.open(folder / ".lock", os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, "w") as handle:
        fcntl.flock(handle, fcntl.LOCK_EX)
        yield folder


def read(path):
    if path.is_symlink():
        raise ValueError("Refusing symlink state")
    value = json.loads(path.read_text())
    if value.get("schema") != SCHEMA:
        raise ValueError("Unsupported Forever state")
    return value


def number(value, name, integer=False):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or value < 0:
        raise ValueError(f"{name} must be a finite nonnegative number")
    if integer and int(value) != value:
        raise ValueError(f"{name} must be an integer")
    return value


def clean(value, limit=2000):
    if not isinstance(value, str):
        raise ValueError("Expected text")
    return value.strip()[:limit]


def accrue(s, timestamp):
    if s["status"] != "running":
        return
    end = max(s["accountedAt"], min(timestamp, s["heartbeatAt"] + LEASE_SECONDS))
    delta = max(0, end - s["accountedAt"])
    s["elapsedSeconds"] += delta
    s["accountedAt"] = end
    if s["limits"].get("maxMinutes") is not None:
        ceiling = s["limits"]["maxMinutes"] * 60
        if s["elapsedSeconds"] >= ceiling:
            s.update(status="limited", stopReason="time-limit", elapsedSeconds=ceiling)
    if s["status"] == "running" and timestamp >= s["heartbeatAt"] + LEASE_SECONDS:
        s.update(status="paused", stopReason="Agent heartbeat expired; resume requires confirmation")


def enforce(s):
    if s["limits"].get("maxMinutes") is not None and s["elapsedSeconds"] >= s["limits"]["maxMinutes"] * 60:
        s.update(status="limited", stopReason="time-limit")
    for limit, count, reason in [("maxCycles", s["totals"]["cycles"], "cycle-limit"),
                                  ("maxTokens", s.get("tokensUsed", 0), "token-limit")]:
        if s["limits"].get(limit) is not None and count >= s["limits"][limit]:
            s.update(status="limited", stopReason=reason)


def usage(s, payload, required=False):
    if "tokensUsed" not in payload:
        if required:
            s.update(status="paused", stopReason="Authoritative token usage required to enforce budget")
        return
    value = number(payload["tokensUsed"], "tokensUsed", True)
    if value < s.get("tokensUsed", 0):
        raise ValueError("Cumulative token usage cannot decrease")
    source = clean(payload.get("usageSource", ""), 120)
    if not source:
        raise ValueError("usageSource is required; never estimate token usage")
    s.update(tokensUsed=value, usageSource=source)


def new_gate(s):
    s.update(status="awaiting-confirmation-1", approvals=[], challenge=secrets.token_urlsafe(24))


def public(s):
    value = {k: v for k, v in s.items() if k not in {"cycleIds", "approvalEvents", "approvals", "challenge"}}
    value["canContinue"] = s["status"] == "running"
    value["leaseRemainingSeconds"] = max(0, s.get("heartbeatAt", 0) + LEASE_SECONDS - time.time()) if value["canContinue"] else 0
    if "maxMinutes" in s["limits"]:
        value["remainingSeconds"] = max(0, s["limits"]["maxMinutes"] * 60 - s["elapsedSeconds"])
    return value


def snapshot(root, s):
    folder = safe_folder(root, ".carbon", "reports", "forever")
    report = folder / (s["id"] + ".html")
    template = (PLUGIN / "ui" / "forever.html").read_text()
    data = json.dumps(public(s), allow_nan=False).replace("<", "\\u003c").replace("&", "\\u0026")
    html = template.replace("__CARBON_FAVICON__", REPORT_FAVICON).replace("__CARBON_LOCKUP__", carbon_lockup("Full" if s.get("mode") == "full" else "Forever"))
    atomic(report, html.replace("__CARBON_STATE__", data))
    return str(report)


def operate(root, action, ident=None, payload=None, expected_mode=None):
    payload = payload or {}
    if not isinstance(payload, dict):
        raise ValueError("payload must be an object")
    with locked(root) as base:
        stamp = time.time()
        if action == "init":
            if expected_mode:
                payload = {**payload, "mode": expected_mode}
            # Inspect only this controller's state, never the target before consent.
            for candidate in base.glob("*/state.json"):
                if candidate.parent.is_symlink():
                    raise ValueError("Refusing symlink run directory")
                prior = read(candidate)
                if prior["status"] in {"running", "ready", "awaiting-confirmation-1", "awaiting-confirmation-2"}:
                    raise ValueError(f"Existing run {prior['id']}; stop or resume it instead of duplicating")
            target = clean(payload.get("target", ""))
            if not target:
                raise ValueError("An explicit target is required")
            limits = {}
            for key in ("maxMinutes", "maxCycles", "maxTokens"):
                if key in payload:
                    value = number(payload[key], key, key != "maxMinutes")
                    if value <= 0:
                        raise ValueError("Omit a limit for unbounded execution; limits must be positive")
                    limits[key] = value
            ident = "forever-" + time.strftime("%Y%m%dT%H%M%SZ", time.gmtime()) + "-" + secrets.token_hex(4)
            s = dict(schema=SCHEMA, id=ident, target=target, scope=clean(payload.get("scope", "")),
                     limits=limits, createdAt=stamp, elapsedSeconds=0, totals=dict(cycles=0, testsGenerated=0,
                     testsExecuted=0, confirmedIssues=0), coverageIds=[], cycleIds=[], recent=[], approvalEvents=[],
                     currentAction={}, stopReason="")
            if payload.get("mode") == "full":
                full_init(s, payload)
            new_gate(s)
        else:
            if not isinstance(ident, str) or not re.fullmatch(r"forever-[A-Za-z0-9-]+", ident):
                raise ValueError("A valid run id is required")
            if (base / ident).is_symlink():
                raise ValueError("Refusing symlink run directory")
            s = read(base / ident / "state.json")
            if expected_mode and s.get("mode") != expected_mode:
                raise ValueError(f"This run is not a {expected_mode} workflow")
            accrue(s, stamp)
            full_expire_workers(s, stamp, all_workers=s["status"] != "running")
            if action == "confirm":
                if s["status"] not in {"awaiting-confirmation-1", "awaiting-confirmation-2"}:
                    raise ValueError("No confirmation is pending")
                event = clean(payload.get("approvalEvent", ""), 160)
                if payload.get("answer") != "approve" or not event or event in s["approvalEvents"]:
                    raise ValueError("A distinct, affirmative human reply is required for each gate")
                if not hmac.compare_digest(str(payload.get("challenge", "")), s["challenge"]):
                    raise ValueError("Stale or incorrect confirmation challenge")
                s["approvals"].append(event)
                s["approvalEvents"].append(event)
                s["status"] = "awaiting-confirmation-2" if len(s["approvals"]) == 1 else "ready"
                s["challenge"] = secrets.token_urlsafe(24)
            elif action == "resume":
                if s["status"] not in {"paused", "stopped", "limited"}:
                    raise ValueError("Only an inactive run can resume")
                for candidate in base.glob("*/state.json"):
                    if candidate.parent.is_symlink():
                        raise ValueError("Refusing symlink run directory")
                    prior = read(candidate)
                    if prior["id"] != ident and prior["status"] not in {"paused", "stopped", "limited"}:
                        raise ValueError("Another Forever run is active in this project")
                if s.get("mode") == "full":
                    # A new host session cannot certify an unchanged target. Keep
                    # historical evidence, but never carry its verdict forward.
                    for category in s["categories"].values():
                        if category["status"] != "not-started":
                            category["previousStatus"] = category["status"]
                            category["status"] = "needs-recheck"
                    s.update(freshness="recheck-required", resumedAt=stamp,
                             totalsScope="historical-campaign-activity",
                             freshnessNote="Resumed campaign: prior results require version and evidence rechecks. Counts remain historical; new cycles do not revalidate other old results.")
                new_gate(s)
                enforce(s)
            elif action == "start":
                if s["status"] != "ready" or len(s["approvals"]) != 2:
                    raise ValueError("Two separate confirmations are required before starting")
                s.update(status="running", heartbeatAt=stamp, accountedAt=stamp, stopReason="")
                usage(s, payload, "maxTokens" in s["limits"])
                enforce(s)
            elif action in {"pause", "stop"}:
                s.update(status="paused" if action == "pause" else "stopped", stopReason=clean(payload.get("reason", "User request")))
                full_expire_workers(s, stamp, all_workers=True)
            elif action in {"work", "cycle"}:
                # Never renew a stale lease or resurrect a stopped run.
                if s["status"] == "running":
                    usage(s, payload, "maxTokens" in s["limits"])
                    enforce(s)
                if s["status"] == "running":
                    if action == "work":
                        title, why = clean(payload.get("title", "")), clean(payload.get("why", ""))
                        if not title or not why:
                            raise ValueError("Work must explain its title and why it matters")
                        if s.get("mode") == "full":
                            full_work(s, payload, stamp)
                        s["currentAction"] = dict(title=title, why=why, expected=clean(payload.get("expected", "")), startedAt=stamp)
                    else:
                        cycle_id = clean(payload.get("cycleId", ""), 160)
                        if not cycle_id:
                            raise ValueError("cycleId is required for idempotent checkpoints")
                        if cycle_id not in s["cycleIds"]:
                            row = dict(cycleId=cycle_id, completedAt=stamp, summary=clean(payload.get("summary", "")),
                                       learning=clean(payload.get("learning", "")), evidence=[], coverageIds=[])
                            for key in ("testsGenerated", "testsExecuted", "confirmedIssues"):
                                row[key] = number(payload.get(key, 0), key, True)
                                s["totals"][key] += row[key]
                            for key in ("evidence", "coverageIds"):
                                items = payload.get(key, [])
                                if not isinstance(items, list) or len(items) > 500:
                                    raise ValueError(f"{key} must contain at most 500 text references per cycle")
                                row[key] = [clean(x, 500) for x in items]
                            if s.get("mode") == "full":
                                full_cycle(root, s, payload, row)
                            s["coverageIds"] = sorted(set(s["coverageIds"] + row["coverageIds"]))
                            s["totals"]["cycles"] += 1
                            row["coverageTotal"] = len(s["coverageIds"])
                            s["recent"] = (s["recent"] + [row])[-30:]
                            s["cycleIds"].append(cycle_id)
                            # Append-only diagnostic history; state owns deduplication.
                            ledger = base / ident / "cycles.jsonl"
                            fd = os.open(ledger, os.O_WRONLY | os.O_APPEND | os.O_CREAT | os.O_NOFOLLOW, 0o600)
                            with os.fdopen(fd, "a") as out:
                                out.write(json.dumps(row, allow_nan=False) + "\n")
                    s["heartbeatAt"] = stamp
                    enforce(s)
            elif action != "status":
                raise ValueError("Unsupported action")
        full_expire_workers(s, stamp, all_workers=s["status"] != "running")
        checkpoint = full_checkpoint(s, stamp)
        s["updatedAt"] = stamp
        directory = safe_folder(root, ".carbon", "forever", ident)
        if checkpoint:
            fd = os.open(directory / "checkpoints.jsonl", os.O_WRONLY | os.O_APPEND | os.O_CREAT | os.O_NOFOLLOW, 0o600)
            with os.fdopen(fd, "a") as out:
                out.write(json.dumps(checkpoint, allow_nan=False) + "\n")
        atomic(directory / "state.json", json.dumps(s, indent=2, allow_nan=False))
        report = snapshot(root, s)
        result = public(s)
        result["reportPath"] = report
        result["statePath"] = str(directory / "state.json")
        if s["status"].startswith("awaiting-confirmation"):
            result["challenge"] = s["challenge"]
            level = "First confirmation" if s["status"].endswith("1") else "Second confirmation — start this exact run?"
            result["question"] = (f"{level}: continuously test {s['target']} ({s['scope'] or 'requested scope'}), "
                                  f"limits {json.dumps(s['limits']) if s['limits'] else 'NONE — may exhaust your available tokens'}? "
                                  "Testing only; no permission for source repairs, paid/cloud, destructive or external-write actions. "
                                  "Reply affirmatively in a separate message, or decline.")
        return result


def serve(root, ident, ready):
    token = secrets.token_urlsafe(32)
    server = None

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_args):
            pass

        def reply(self, status, body, kind="application/json"):
            self.send_response(status)
            self.send_header("Content-Type", kind + "; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Referrer-Policy", "no-referrer")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.end_headers()
            try:
                self.wfile.write(body.encode())
            except (BrokenPipeError, ConnectionResetError):
                pass

        def valid(self):
            host = f"127.0.0.1:{server.server_port}"
            return (self.headers.get("Host") == host and self.headers.get("Origin", f"http://{host}") == f"http://{host}"
                    and hmac.compare_digest(self.headers.get("X-Carbon-Forever-Token", ""), token))

        def do_GET(self):
            if self.path == "/" and self.headers.get("Host") == f"127.0.0.1:{server.server_port}":
                # Serve a data-free shell; private state requires the token header.
                empty = (PLUGIN / "ui" / "forever.html").read_text().replace("__CARBON_STATE__", "null")
                self.reply(200, empty.replace("__CARBON_FAVICON__", REPORT_FAVICON).replace("__CARBON_LOCKUP__", carbon_lockup("Forever")), "text/html")
                return
            if self.path != "/state" or not self.valid():
                self.reply(403, '{"error":"Forbidden"}')
                return
            self.reply(200, json.dumps(operate(root, "status", ident)))

        def do_POST(self):
            if self.path not in {"/pause", "/stop"} or not self.valid():
                self.reply(403, '{"error":"Forbidden"}')
                return
            self.reply(200, json.dumps(operate(root, self.path[1:], ident)))

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    atomic(ready, json.dumps(dict(url=f"http://127.0.0.1:{server.server_port}/#{token}", pid=os.getpid())))
    server.timeout = 1
    # Viewer is not a scheduler. Expire after one hour without a running lease.
    last_running = time.time()
    while time.time() - last_running < 3600:
        server.handle_request()
        state = read(root / ".carbon" / "forever" / ident / "state.json")
        if state["status"] == "running" and time.time() - state.get("heartbeatAt", 0) < LEASE_SECONDS:
            last_running = time.time()
    server.server_close()


def open_view(root, ident, expected_mode=None):
    result = operate(root, "status", ident, expected_mode=expected_mode)
    folder = Path(result["statePath"]).parent
    ready = folder / ("viewer-" + secrets.token_hex(8) + ".json")
    proc = subprocess.Popen([sys.executable, str(Path(__file__).resolve()), "serve", "--root", str(root),
                             "--id", ident, "--ready", str(ready)], stdin=subprocess.DEVNULL,
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    for _ in range(100):
        if ready.is_file():
            result.update(json.loads(ready.read_text()))
            ready.unlink()
            result.update(openByDefault=True, localOnly=True,
                          next="Open url in the host's internal browser. Snapshot file is not live. Viewer does not execute AI work.")
            # Reap an owned viewer if this embedding process stays alive. A CLI
            # exit intentionally leaves the detached viewer, not an AI runner.
            threading.Thread(target=proc.wait, daemon=True).start()
            return result
        if proc.poll() is not None:
            break
        time.sleep(.05)
    proc.terminate()
    proc.wait(timeout=5)
    raise ValueError("Local Forever viewer failed to start; saved HTML remains available")


def main(expected_mode=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["init", "confirm", "start", "work", "cycle", "status", "pause", "stop", "resume", "open", "serve"])
    parser.add_argument("--root", required=True)
    parser.add_argument("--id")
    parser.add_argument("--payload-json", default="{}")
    parser.add_argument("--ready")
    args = parser.parse_args()
    root = Path(args.root).expanduser().resolve()
    if not root.is_dir():
        parser.error("root must be an existing explicit project directory")
    try:
        if args.action == "serve":
            serve(root, args.id, Path(args.ready))
            return
        result = open_view(root, args.id, expected_mode) if args.action == "open" else operate(root, args.action, args.id, json.loads(args.payload_json), expected_mode)
        print(json.dumps(result, allow_nan=False))
    except (ValueError, OSError, KeyError) as error:
        parser.exit(2, str(error) + "\n")


if __name__ == "__main__":
    main()

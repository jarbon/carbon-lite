import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { z } from "zod";

export const settingFields = {
  budgetMinutes: z.number().int().min(5).max(120),
  maxChecks: z.number().int().min(5).max(200),
  explorationPercent: z.number().int().min(50).max(90),
  businessWeight: z.number().int().min(0).max(100),
  askHuman: z.boolean(),
  motion: z.enum(["system", "reduced"]),
  theme: z.enum(["dark", "light", "system"]),
};
export const defaults = {
  budgetMinutes: 20,
  maxChecks: 20,
  explorationPercent: 60,
  businessWeight: 50,
  askHuman: true,
  motion: "system",
  theme: "dark",
};
export const settingsSchema = z.strictObject(settingFields);
const text = z.string().max(6000);
const evidence = z.array(z.string().max(2000)).max(20);
export const checkSchema = z.strictObject({
  id: z.string().min(1).max(80),
  title: text,
  domain: z.string().max(80),
  type: z.enum([
    "positive",
    "negative",
    "boundary",
    "stateful",
    "exploratory",
    "recovery",
  ]),
  status: z.enum([
    "planned",
    "running",
    "passed",
    "failed",
    "blocked",
    "deferred",
  ]),
  page: z.string().max(80).optional(),
  expected: text.optional(),
  actual: text.optional(),
  evidence: evidence.optional(),
});
export const findingSchema = z.strictObject({
  id: z.string().min(1).max(80),
  title: text,
  severity: z.enum(["critical", "high", "medium", "low"]),
  strength: z.enum(["demonstrated", "suspected"]),
  consequence: text,
  steps: z.array(text).max(20),
  evidence,
  remediation: text,
  verification: text,
  page: z.string().max(80).optional(),
});
export const pageSchema = z.strictObject({
  id: z.string().min(1).max(80),
  title: text,
  url: z.string().max(2000),
  description: text.optional(),
  image: z.string().max(7_000_000).optional(),
});
export const updateSchema = z.strictObject({
  runId: z.string().regex(/^run-[a-f0-9]{16}$/),
  revision: z.number().int().min(0),
  current: text.optional(),
  why: text.optional(),
  summary: text.optional(),
  status: z
    .enum(["running", "waiting", "completed", "partial", "blocked", "canceled"])
    .optional(),
  checks: z.array(checkSchema).max(500).optional(),
  findings: z.array(findingSchema).max(500).optional(),
  pages: z
    .array(pageSchema.omit({ image: true }))
    .max(100)
    .optional(),
  personas: z
    .array(
      z.strictObject({
        id: z.string().min(1).max(80),
        role: text,
        intent: text,
        journey: text,
        observation: text,
        evidence,
      }),
    )
    .max(100)
    .optional(),
  blockers: z.array(text).max(50).optional(),
  confidence: z
    .strictObject({
      score: z.number().min(0).max(100),
      scope: text,
      rationale: text,
      limitations: z.array(text).max(20),
    })
    .optional(),
});
export function safeDir(dir) {
  const full = path.resolve(dir);
  let current = path.parse(full).root;
  for (const part of full
    .slice(current.length)
    .split(path.sep)
    .filter(Boolean)) {
    current = path.join(current, part);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink())
      throw Error("State directories must not be symbolic links.");
  }
  fs.mkdirSync(full, { recursive: true, mode: 0o700 });
  return full;
}
export class Store {
  constructor(dir) {
    if (!dir || !path.isAbsolute(dir))
      throw Error("An explicit absolute state directory is required.");
    this.dir = safeDir(dir);
    this.file = path.join(this.dir, "workspace.json");
    this.lock = path.join(this.dir, "write.lock");
  }
  read() {
    if (fs.existsSync(this.file) && fs.lstatSync(this.file).isSymbolicLink())
      throw Error("State file cannot be a symbolic link.");
    return fs.existsSync(this.file)
      ? JSON.parse(fs.readFileSync(this.file, "utf8"))
      : { schema: 1, revision: 0, settings: defaults, runs: [], steering: [] };
  }
  mutate(fn) {
    let fd;
    try {
      fd = fs.openSync(this.lock, "wx", 0o600);
    } catch {
      throw Error("Workspace is busy. Retry after the current save finishes.");
    }
    try {
      const s = this.read();
      const result = fn(s);
      s.revision++;
      const temp = path.join(this.dir, crypto.randomUUID() + ".tmp");
      try {
        fs.writeFileSync(temp, JSON.stringify(s), { mode: 0o600, flag: "wx" });
        fs.renameSync(temp, this.file);
      } finally {
        if (fs.existsSync(temp)) fs.unlinkSync(temp);
      }
      return result ?? s;
    } finally {
      fs.closeSync(fd);
      fs.unlinkSync(this.lock);
    }
  }
  settings(patch, revision) {
    return this.mutate((s) => {
      if (revision !== undefined && revision !== s.revision)
        throw Error(
          "Settings changed in another window. Refresh before saving.",
        );
      s.settings = settingsSchema.parse({
        ...s.settings,
        ...z.strictObject(settingFields).partial().parse(patch),
      });
    });
  }
  start({ root, title, target }) {
    if (!path.isAbsolute(root) || !fs.statSync(root).isDirectory())
      throw Error("Select an existing absolute project directory.");
    root = fs.realpathSync(root);
    return this.mutate((s) => {
      const run = {
        id: "run-" + crypto.randomBytes(8).toString("hex"),
        revision: 0,
        testManager: {
          id: "jay",
          name: "Jay",
          role: "AI test manager",
          kind: "ai-persona",
        },
        root,
        title: String(title).slice(0, 500),
        target: String(target).slice(0, 2000),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "running",
        current: "Inspecting your project",
        why: "Find the important journeys and risks before selecting tests.",
        settings: { ...s.settings },
        checks: [],
        findings: [],
        pages: [],
        personas: [],
        history: [],
        blockers: [],
      };
      s.runs.unshift(run);
      return run;
    });
  }
  update(args) {
    const v = updateSchema.parse(args);
    return this.mutate((s) => {
      const r = s.runs.find((r) => r.id === v.runId);
      if (!r) throw Error("Run not found.");
      if (r.revision !== v.revision)
        throw Error("Run changed. Read the latest revision before updating.");
      if (["completed", "partial", "canceled"].includes(r.status))
        throw Error(
          "This run is closed. Start a new run to preserve its evidence.",
        );
      for (const c of v.checks || [])
        if (
          ["passed", "failed"].includes(c.status) &&
          (!c.actual || !c.evidence?.length)
        )
          throw Error(
            "A pass or failure needs an actual observation and evidence.",
          );
      for (const f of v.findings || [])
        if (
          f.strength === "demonstrated" &&
          (!f.evidence.length || !f.steps.length)
        )
          throw Error(
            "Demonstrated findings need reproduction steps and evidence.",
          );
      for (const k of ["checks", "findings", "pages", "personas"])
        if (v[k]) {
          const items = new Map(r[k].map((x) => [x.id, x]));
          for (const x of v[k]) items.set(x.id, { ...items.get(x.id), ...x });
          r[k] = [...items.values()];
          if (r[k].length > (k === "checks" || k === "findings" ? 500 : 100))
            throw Error(
              "Collection limit exceeded; start a new bounded assessment.",
            );
        }
      if (
        v.status === "completed" &&
        r.checks.some((c) => ["planned", "running"].includes(c.status))
      )
        throw Error(
          "Finish or explicitly defer outstanding checks before completion.",
        );
      for (const k of ["current", "why", "status", "blockers", "confidence"])
        if (v[k] !== undefined) r[k] = v[k];
      r.updatedAt = new Date().toISOString();
      r.revision++;
      if (v.summary) r.history.unshift({ at: r.updatedAt, text: v.summary });
      r.history = r.history.slice(0, 100);
      return r;
    });
  }
  screenshot({ runId, pageId, file }) {
    return this.mutate((s) => {
      const r = s.runs.find((x) => x.id === runId);
      const p = r?.pages.find((x) => x.id === pageId);
      if (!p) throw Error("Run or page not found.");
      if (["completed", "partial", "canceled"].includes(r.status))
        throw Error("Run is closed.");
      const real = fs.realpathSync(path.resolve(r.root, file));
      if (!real.startsWith(r.root + path.sep))
        throw Error("Screenshots must be inside the selected project.");
      const stat = fs.statSync(real);
      if (stat.size > 5_000_000 || !stat.isFile())
        throw Error("Use an image smaller than 5 MB.");
      const b = fs.readFileSync(real);
      let mime;
      if (
        b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      )
        mime = "image/png";
      else if (b[0] === 255 && b[1] === 216 && b[2] === 255)
        mime = "image/jpeg";
      else if (
        b.toString("ascii", 0, 4) === "RIFF" &&
        b.toString("ascii", 8, 12) === "WEBP"
      )
        mime = "image/webp";
      else throw Error("Only PNG, JPEG, or WebP screenshots are supported.");
      p.image = `data:${mime};base64,${b.toString("base64")}`;
      r.revision++;
      r.updatedAt = new Date().toISOString();
      return r;
    });
  }
  steer({ runId, findingId, note, priority }) {
    return this.mutate((s) => {
      const r = s.runs.find((x) => x.id === runId);
      if (!r || !r.findings.some((f) => f.id === findingId))
        throw Error("Finding not found.");
      const v = z
        .strictObject({
          note: z.string().max(4000),
          priority: z.enum(["normal", "next", "defer"]),
        })
        .parse({ note, priority });
      const item = {
        runId,
        findingId,
        ...v,
        updatedAt: new Date().toISOString(),
      };
      s.steering = s.steering.filter(
        (x) => x.runId !== runId || x.findingId !== findingId,
      );
      s.steering.push(item);
    });
  }
  feedback(input) {
    const v = z
      .strictObject({
        schema: z.literal("carbon.studio-lite-feedback/v1"),
        revision: z.number().int().min(0),
        settings: z.strictObject(settingFields).partial().optional(),
        steering: z
          .array(
            z.strictObject({
              runId: z.string(),
              findingId: z.string(),
              note: z.string().max(4000),
              priority: z.enum(["normal", "next", "defer"]),
            }),
          )
          .max(500),
      })
      .parse(input);
    return this.mutate((s) => {
      if (v.revision !== s.revision)
        throw Error(
          "Feedback is stale. Reload the latest workspace before applying it.",
        );
      for (const item of v.steering) {
        if (
          !s.runs.some(
            (r) =>
              r.id === item.runId &&
              r.findings.some((f) => f.id === item.findingId),
          )
        )
          throw Error("Feedback references an unknown finding.");
      }
      if (v.settings)
        s.settings = settingsSchema.parse({ ...s.settings, ...v.settings });
      for (const item of v.steering) {
        s.steering = s.steering.filter(
          (x) => x.runId !== item.runId || x.findingId !== item.findingId,
        );
        s.steering.push({ ...item, updatedAt: new Date().toISOString() });
      }
    });
  }
  snapshot() {
    const s = this.read();
    return {
      ...s,
      runs: s.runs.map(({ root, ...r }) => ({
        ...r,
        project: path.basename(root),
      })),
      receivedAt: new Date().toISOString(),
    };
  }
}

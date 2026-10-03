import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export function demo(plugin, root, args) {
  const fixtures = path.join(plugin, "demo-fixtures");
  const manifest = JSON.parse(
    fs.readFileSync(path.join(fixtures, "manifest.json")),
  );
  if (args.action === "list") return manifest;
  if (args.action !== "create") throw Error("Use action list or create.");
  const fixture = manifest.fixtures.find(
    (x) => x.id === (args.fixture || manifest.defaultFixture),
  );
  if (!fixture) throw Error("Unknown fixture. Use demo list.");
  const profile = args.testProfile || "without-existing-tests";
  if (!manifest.testProfiles.some((x) => x.id === profile))
    throw Error("Unknown test profile.");
  // One new direct child prevents a symlinked intermediate destination escaping root.
  const name =
    args.destination ||
    `carbon-demo-${fixture.id}-${crypto.randomBytes(4).toString("hex")}`;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,100}$/.test(name))
    throw Error("Destination must be a new folder name, not a path.");
  const destination = path.join(root, name);
  fs.mkdirSync(destination, { mode: 0o700 }); // exclusive; never overwrite a demo
  const source = path.join(fixtures, fixture.id);
  function copy(from, to, rel = "") {
    for (const item of fs.readdirSync(from, { withFileTypes: true })) {
      const next = rel ? `${rel}/${item.name}` : item.name;
      if (
        profile === "without-existing-tests" &&
        fixture.testPaths.some((t) => next === t || next.startsWith(t + "/"))
      )
        continue;
      if (item.isSymbolicLink())
        throw Error("Fixture symlinks are not supported.");
      const target = path.join(to, item.name);
      if (item.isDirectory()) {
        fs.mkdirSync(target);
        copy(path.join(from, item.name), target, next);
      } else if (item.isFile())
        fs.copyFileSync(
          path.join(from, item.name),
          target,
          fs.constants.COPYFILE_EXCL,
        );
    }
  }
  copy(source, destination);
  fs.writeFileSync(
    path.join(destination, ".carbon-demo.json"),
    JSON.stringify(
      {
        fixture: fixture.id,
        testProfile: profile,
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    { flag: "wx", mode: 0o600 },
  );
  return {
    destination,
    fixture: fixture.id,
    testProfile: profile,
    start: fixture.start,
    note: "Synthetic fixture only. No tests executed or server started. Some fixtures intentionally contain defects.",
  };
}

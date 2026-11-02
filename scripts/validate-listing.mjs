export function validateCapabilities(manifest) {
  const values = manifest.interface?.capabilities;
  if (!Array.isArray(values) || values.length > 20 ||
      values.some(value => typeof value !== "string" || !value.trim() ||
        value.length > 120 || /[\r\n]/.test(value))) {
    throw new Error("interface.capabilities must be a list of up to 20 nonempty, single-line strings (120 characters each); use [] for no labels.");
  }
}

export function validateListing(manifest) {
  validateCapabilities(manifest);
  for (const [field, limit] of Object.entries({displayName: 30, shortDescription: 30, longDescription: 4000, developerName: 80})) {
    const value = manifest.interface?.[field];
    if (typeof value !== 'string' || !value.trim() || value.length > limit)
      throw new Error(`interface.${field} must be nonempty and at most ${limit} characters`);
  }
}

export function packageManifest(source, publicDirectory = false) {
  const manifest = structuredClone(source);
  if (publicDirectory) {
    delete manifest.hooks;
    manifest.interface.longDescription += '\n\nPublic marketplace edition: testing starts when you request it. No lifecycle hooks or automatic after-edit checks are installed. Optional hook-based quick checks are available in the separate manual-install distribution.';
  }
  validateListing(manifest);
  if (manifest.mcpServers || manifest.apps || (publicDirectory && manifest.hooks))
    throw new Error('This package must not declare MCP servers, apps or public-directory hooks.');
  return manifest;
}

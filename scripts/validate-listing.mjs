export function validateCapabilities(manifest) {
  const values = manifest.interface?.capabilities;
  if (!Array.isArray(values) || values.length > 20 ||
      values.some(value => typeof value !== "string" || !value.trim() ||
        value.length > 120 || /[\r\n]/.test(value))) {
    throw new Error("interface.capabilities must be a list of up to 20 nonempty, single-line strings (120 characters each); use [] for no labels.");
  }
}

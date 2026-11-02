// Shared first-use settings state. Never reads executable policy from a project.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createSupervisor } from './engine.mjs';

const base = path.dirname(fileURLToPath(import.meta.url));
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
export function installationEdition() {
  try { return JSON.parse(fs.readFileSync(path.join(base, 'edition.json'), 'utf8')).edition || 'carbon'; }
  catch { return 'carbon'; }
}
function context(root, options) {
  const home = options.home || process.env.CARBON_BACKGROUND_TEST_HOME || path.join(os.homedir(), '.config/carbon/background/v1');
  const supervisor = createSupervisor({ home });
  const state = supervisor.status(root);
  const edition = options.edition || installationEdition();
  const file = path.join(home, 'onboarding-' + digest(edition).slice(0, 24) + '.json');
  let record = {};
  try { record = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  return { home, supervisor, state, edition, file, record };
}
function persist(file, record) {
  const temporary = file + '.' + crypto.randomUUID() + '.tmp';
  fs.writeFileSync(temporary, JSON.stringify(record, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  fs.renameSync(temporary, file);
}
export function readSettings(root, options = {}) {
  const { state, edition, record } = context(root, options);
  const enabled = state.config.enabled, globalPaused = state.global.disabled === true;
  const envDisabled = process.env.CARBON_BACKGROUND === 'off';
  return { mode: enabled ? 'automatic' : 'manual', enabled,
    effectiveEnabled: enabled && !globalPaused && !envDisabled,
    globalPaused, envDisabled, aiReview: state.config.aiReview,
    approvedTestCount: state.config.tests.length, runSeconds: state.config.runSeconds,
    dailyRuns: state.config.dailyRuns, dailySeconds: state.config.dailySeconds,
    onboarding: { needed: !record.completedAt, completedAt: record.completedAt || null, edition },
  };
}
export async function saveMode(root, mode, options = {}) {
  if (!['automatic', 'manual'].includes(mode)) throw Error('Choose automatic or manual testing.');
  if (options.acknowledge !== true) throw Error('An explicit settings Save is required.');
  const c = context(root, options);
  await c.supervisor.configure(root, { enabled: mode === 'automatic' }, true);
  persist(c.file, { ...c.record, edition: c.edition, completedAt: new Date().toISOString(), mode });
  return readSettings(root, options);
}
export async function requestSettings(root, options = {}) {
  const c = context(root, options), current = readSettings(root, options);
  if (!current.onboarding.needed) return { ...current, shouldRequest: false };
  const session = options.sessionId ? digest(String(options.sessionId)) : null;
  const time = options.now ? options.now() : Date.now();
  const repeatedSession = session && session === c.record.lastSession;
  const recentFallback = !session && time - (c.record.lastRequestedAt || 0) < 300000;
  if (repeatedSession || recentFallback) return { ...current, shouldRequest: false };
  persist(c.file, { ...c.record, edition: c.edition, lastSession: session, lastRequestedAt: time });
  return { ...current, shouldRequest: true };
}

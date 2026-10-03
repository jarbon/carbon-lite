// Fake async API layer over the store, with simulated latency.
// Lets tools exercise async/await paths and loading states without a backend.
import { store } from './store.js';

const LATENCY_MS = 150;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchTasks() {
  await delay(LATENCY_MS);
  return structuredClone(store.getTasks());
}

export async function fetchTask(id) {
  await delay(LATENCY_MS);
  const task = store.getTask(id);
  if (!task) throw new Error(`Task ${id} not found`);
  return structuredClone(task);
}

export async function createTask(fields) {
  await delay(LATENCY_MS);
  if (!fields.title || !fields.title.trim()) {
    throw new Error('Title is required');
  }
  return store.addTask(fields);
}

export async function saveTask(id, patch) {
  await delay(LATENCY_MS);
  return store.updateTask(id, patch);
}

export async function removeTask(id) {
  await delay(LATENCY_MS);
  store.deleteTask(id);
}

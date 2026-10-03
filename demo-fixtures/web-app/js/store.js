// Central state container with pub/sub and localStorage persistence.
const STORAGE_KEY = 'taskboard.state.v1';

const SEED_TASKS = [
  { id: 't1', title: 'Design login screen', description: 'Mock up the OAuth flow.', status: 'todo', priority: 'high', tags: ['design'], createdAt: '2026-07-01T09:00:00Z' },
  { id: 't2', title: 'Fix flaky checkout test', description: 'Fails ~1 in 5 runs on CI.', status: 'in-progress', priority: 'high', tags: ['bug', 'ci'], createdAt: '2026-07-02T10:30:00Z' },
  { id: 't3', title: 'Write API docs', description: 'Document the /orders endpoints.', status: 'todo', priority: 'medium', tags: ['docs'], createdAt: '2026-07-03T14:00:00Z' },
  { id: 't4', title: 'Upgrade Node to 22', description: 'Check native module compat first.', status: 'todo', priority: 'low', tags: ['infra'], createdAt: '2026-07-05T08:15:00Z' },
  { id: 't5', title: 'Ship dark mode', description: 'Respect prefers-color-scheme.', status: 'done', priority: 'medium', tags: ['design', 'frontend'], createdAt: '2026-06-20T11:00:00Z' },
  { id: 't6', title: 'Refactor payment retries', description: 'Exponential backoff with jitter.', status: 'in-progress', priority: 'medium', tags: ['backend'], createdAt: '2026-07-08T16:45:00Z' },
];

function defaultState() {
  return {
    tasks: SEED_TASKS.map((t) => ({ ...t, tags: [...t.tags] })),
    settings: { showDone: true, defaultPriority: 'medium', userName: 'Tester' },
  };
}

export class Store {
  constructor() {
    this.listeners = new Set();
    this.state = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (err) {
      console.warn('Corrupt saved state, resetting.', err);
    }
    return defaultState();
  }

  persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.persist();
    this.listeners.forEach((fn) => fn(this.state));
  }

  // --- selectors ---
  getTasks() {
    return this.state.tasks;
  }

  getTask(id) {
    return this.state.tasks.find((t) => t.id === id) || null;
  }

  getSettings() {
    return this.state.settings;
  }

  // --- actions ---
  addTask({ title, description = '', priority, tags = [] }) {
    const task = {
      id: `t${Math.random().toString(36).slice(2, 8)}`,
      title,
      description,
      status: 'todo',
      priority: priority || this.state.settings.defaultPriority,
      tags,
      createdAt: new Date().toISOString(),
    };
    this.state.tasks.push(task);
    this.notify();
    return task;
  }

  updateTask(id, patch) {
    const task = this.getTask(id);
    if (!task) throw new Error(`No task with id ${id}`);
    Object.assign(task, patch);
    this.notify();
    return task;
  }

  deleteTask(id) {
    const before = this.state.tasks.length;
    this.state.tasks = this.state.tasks.filter((t) => t.id !== id);
    if (this.state.tasks.length === before) throw new Error(`No task with id ${id}`);
    this.notify();
  }

  updateSettings(patch) {
    Object.assign(this.state.settings, patch);
    this.notify();
  }

  resetToSeed() {
    this.state = defaultState();
    this.notify();
  }
}

export const store = new Store();

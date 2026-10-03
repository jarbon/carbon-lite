// Task detail view: edit fields, change status, delete.
import { fetchTask, saveTask, removeTask } from '../api.js';

export async function renderTaskDetail(root, { id }) {
  root.innerHTML = '<p class="loading">Loading task…</p>';

  let task;
  try {
    task = await fetchTask(id);
  } catch (err) {
    root.innerHTML = `<div class="detail-panel error-panel">
      <p>${err.message}</p>
      <a class="btn ghost" href="#/board">Back to board</a>
    </div>`;
    return;
  }

  root.innerHTML = `
    <div class="detail-panel">
      <a href="#/board">← Back to board</a>
      <form id="edit-form">
        <div class="field">
          <label for="ed-title">Title</label>
          <input id="ed-title" name="title" required>
        </div>
        <div class="field">
          <label for="ed-desc">Description</label>
          <textarea id="ed-desc" name="description" rows="4"></textarea>
        </div>
        <div class="field">
          <label for="ed-status">Status</label>
          <select id="ed-status" name="status">
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div class="field">
          <label for="ed-priority">Priority</label>
          <select id="ed-priority" name="priority">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div class="field">
          <label for="ed-tags">Tags (comma-separated)</label>
          <input id="ed-tags" name="tags">
        </div>
        <button class="btn" type="submit">Save</button>
        <button class="btn danger" type="button" id="delete-btn">Delete</button>
        <span id="save-status"></span>
      </form>
    </div>
  `;

  const form = root.querySelector('#edit-form');
  form.elements.title.value = task.title;
  form.elements.description.value = task.description;
  form.elements.status.value = task.status;
  form.elements.priority.value = task.priority;
  form.elements.tags.value = task.tags.join(', ');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusEl = root.querySelector('#save-status');
    statusEl.textContent = 'Saving…';
    await saveTask(id, {
      title: form.elements.title.value,
      description: form.elements.description.value,
      status: form.elements.status.value,
      priority: form.elements.priority.value,
      tags: form.elements.tags.value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    statusEl.textContent = 'Saved ✔';
  });

  root.querySelector('#delete-btn').addEventListener('click', async () => {
    if (!confirm('Delete this task?')) return;
    await removeTask(id);
    window.location.hash = '#/board';
  });
}

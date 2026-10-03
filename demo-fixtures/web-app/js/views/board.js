// Board view: three status columns + new-task form.
import { fetchTasks, createTask } from '../api.js';
import { store } from '../store.js';

const COLUMNS = [
  { status: 'todo', label: 'To do' },
  { status: 'in-progress', label: 'In progress' },
  { status: 'done', label: 'Done' },
];

function taskCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.addEventListener('click', () => {
    window.location.hash = `#/task/${task.id}`;
  });

  const title = document.createElement('p');
  title.className = 'title';
  title.textContent = task.title;

  const meta = document.createElement('div');
  meta.className = 'meta';

  const prio = document.createElement('span');
  prio.className = `priority ${task.priority}`;
  prio.textContent = task.priority;
  meta.appendChild(prio);

  task.tags.forEach((t) => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.textContent = t;
    meta.appendChild(chip);
  });

  card.append(title, meta);
  return card;
}

export async function renderBoard(root) {
  root.innerHTML = '<p class="loading">Loading board…</p>';
  const tasks = await fetchTasks();
  const settings = store.getSettings();

  root.innerHTML = `
    <form class="new-task-form" id="new-task-form">
      <div class="field">
        <label for="nt-title">New task</label>
        <input id="nt-title" name="title" placeholder="What needs doing?" required>
      </div>
      <div class="field">
        <label for="nt-priority">Priority</label>
        <select id="nt-priority" name="priority">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <button class="btn" type="submit">Add task</button>
    </form>
    <div class="board" id="board-columns"></div>
  `;

  root.querySelector('#nt-priority').value = settings.defaultPriority;

  const board = root.querySelector('#board-columns');
  COLUMNS.forEach(({ status, label }) => {
    if (status === 'done' && !settings.showDone) return;
    const col = document.createElement('section');
    col.className = 'column';
    const h = document.createElement('h2');
    const inCol = tasks.filter((t) => t.status === status);
    h.textContent = `${label} (${inCol.length})`;
    col.appendChild(h);
    inCol.forEach((t) => col.appendChild(taskCard(t)));
    board.appendChild(col);
  });

  root.querySelector('#new-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      await createTask({
        title: form.elements.title.value,
        priority: form.elements.priority.value,
      });
      renderBoard(root);
    } catch (err) {
      alert(err.message);
    }
  });
}

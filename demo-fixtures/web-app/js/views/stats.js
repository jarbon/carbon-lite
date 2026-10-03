// Stats view: counts and per-tag breakdown computed from store state.
import { fetchTasks } from '../api.js';

export async function renderStats(root) {
  root.innerHTML = '<p class="loading">Crunching numbers…</p>';
  const tasks = await fetchTasks();

  const byStatus = { todo: 0, 'in-progress': 0, done: 0 };
  const byTag = {};
  tasks.forEach((t) => {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    t.tags.forEach((tag) => {
      byTag[tag] = (byTag[tag] || 0) + 1;
    });
  });

  const total = tasks.length;
  const doneRatio = total === 0 ? 0 : byStatus.done / total;

  const tagRows = Object.entries(byTag)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([tag, count]) => `
        <div class="field">
          <label>${tag} (${count})</label>
          <div class="bar"><span style="width:${(count / total) * 100}%"></span></div>
        </div>`
    )
    .join('');

  root.innerHTML = `
    <div class="stats-panel">
      <h1>Stats</h1>
      <div class="stat-row">
        <div class="stat-box"><div class="num">${total}</div><div class="label">Total tasks</div></div>
        <div class="stat-box"><div class="num">${byStatus.todo}</div><div class="label">To do</div></div>
        <div class="stat-box"><div class="num">${byStatus['in-progress']}</div><div class="label">In progress</div></div>
        <div class="stat-box"><div class="num">${byStatus.done}</div><div class="label">Done</div></div>
        <div class="stat-box"><div class="num">${Math.round(doneRatio * 100)}%</div><div class="label">Completion</div></div>
      </div>
      <h2>Tasks per tag</h2>
      ${tagRows || '<p>No tags yet.</p>'}
    </div>
  `;
}

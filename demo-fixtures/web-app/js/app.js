// App bootstrap: wire routes to views.
import { Router } from './router.js';
import { renderBoard } from './views/board.js';
import { renderTaskDetail } from './views/task-detail.js';
import { renderStats } from './views/stats.js';
import { renderSettings } from './views/settings.js';

const root = document.getElementById('app');
const router = new Router();

router
  .on('/board', () => renderBoard(root))
  .on('/task/:id', (params) => renderTaskDetail(root, params))
  .on('/stats', () => renderStats(root))
  .on('/settings', () => renderSettings(root))
  .otherwise((path) => {
    root.innerHTML = `<div class="detail-panel error-panel">
      <h1>404</h1>
      <p>No route matches <code>${path}</code>.</p>
      <a class="btn ghost" href="#/board">Back to board</a>
    </div>`;
  });

router.resolve();

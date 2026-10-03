// Settings view: user preferences + reset to seed data.
import { store } from '../store.js';

export function renderSettings(root) {
  const settings = store.getSettings();

  root.innerHTML = `
    <div class="settings-panel">
      <h1>Settings</h1>
      <form id="settings-form">
        <div class="field">
          <label for="st-name">Your name</label>
          <input id="st-name" name="userName">
        </div>
        <div class="field">
          <label for="st-priority">Default priority for new tasks</label>
          <select id="st-priority" name="defaultPriority">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div class="field">
          <label>
            <input type="checkbox" id="st-showdone" name="showDone" style="width:auto">
            Show the Done column on the board
          </label>
        </div>
        <button class="btn" type="submit">Save settings</button>
        <span id="settings-status"></span>
      </form>
      <hr>
      <h2>Danger zone</h2>
      <button class="btn danger" id="reset-btn">Reset all data to seed</button>
    </div>
  `;

  const form = root.querySelector('#settings-form');
  form.elements.userName.value = settings.userName;
  form.elements.defaultPriority.value = settings.defaultPriority;
  form.elements.showDone.checked = settings.showDone;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    store.updateSettings({
      userName: form.elements.userName.value,
      defaultPriority: form.elements.defaultPriority.value,
      showDone: form.elements.showDone.checked,
    });
    root.querySelector('#settings-status').textContent = 'Saved ✔';
  });

  root.querySelector('#reset-btn').addEventListener('click', () => {
    if (confirm('Really reset all tasks and settings?')) {
      store.resetToSeed();
      renderSettings(root);
    }
  });
}

// Contact form: client-side validation + localStorage-backed history.
(function () {
  const STORAGE_KEY = 'brewtown.messages';
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const list = document.getElementById('message-list');
  const clearBtn = document.getElementById('clear-messages');

  function loadMessages() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveMessages(messages) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }

  function renderHistory() {
    const messages = loadMessages();
    list.innerHTML = '';
    if (messages.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No messages yet.';
      list.appendChild(li);
      return;
    }
    messages.forEach((m) => {
      const li = document.createElement('li');
      li.textContent = `[${m.topic}] ${m.name} <${m.email}>: ${m.message}`;
      list.appendChild(li);
    });
  }

  function setError(fieldName, text) {
    const span = form.querySelector(`.error[data-for="${fieldName}"]`);
    const input = form.elements[fieldName];
    if (span) span.textContent = text;
    if (input) input.classList.toggle('invalid', Boolean(text));
  }

  function validate(data) {
    let ok = true;

    if (!data.name.trim()) {
      setError('name', 'Name is required.');
      ok = false;
    } else {
      setError('name', '');
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email)) {
      setError('email', 'Enter a valid email address.');
      ok = false;
    } else {
      setError('email', '');
    }

    if (data.message.trim().length < 10) {
      setError('message', 'Message must be at least 10 characters.');
      ok = false;
    } else {
      setError('message', '');
    }

    return ok;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = {
      name: form.elements.name.value,
      email: form.elements.email.value,
      topic: form.elements.topic.value,
      message: form.elements.message.value,
      sentAt: new Date().toISOString(),
    };

    if (!validate(data)) {
      status.textContent = 'Please fix the errors above.';
      return;
    }

    const messages = loadMessages();
    messages.push(data);
    saveMessages(messages);
    form.reset();
    status.textContent = 'Message saved locally (this demo site has no backend).';
    renderHistory();
  });

  clearBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
    status.textContent = '';
  });

  renderHistory();
})();

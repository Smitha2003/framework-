// Simple Todo component (uses localStorage)
function createTodoList(container, storageKey) {
  // Create unique ID safe for use in selectors (replace colons with hyphens)
  const safeId = storageKey.replace(/:/g, '-');
  
  container.innerHTML = `
    <div class="todo-app">
      <div class="todo-input">
        <input id="todo-input-${safeId}" placeholder="Add a to‑do" />
        <button id="todo-add-${safeId}">Add</button>
      </div>
      <ul id="todo-list-${safeId}" class="todo-list"></ul>
    </div>
  `;

  const input = document.getElementById(`todo-input-${safeId}`);
  const addBtn = document.getElementById(`todo-add-${safeId}`);
  const listEl = document.getElementById(`todo-list-${safeId}`);

  function load() {
    const raw = localStorage.getItem(storageKey) || '[]';
    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  function save(items) {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }

  function render() {
    const items = load();
    listEl.innerHTML = '';
    items.forEach((it, idx) => {
      const li = document.createElement('li');
      li.className = 'todo-item';
      li.innerHTML = `
        <label>
          <input type="checkbox" ${it.done ? 'checked' : ''} data-idx="${idx}" class="todo-check" />
          <span class="todo-text">${escapeHtml(it.text)}</span>
        </label>
      `;
      listEl.appendChild(li);
    });

    // attach listeners - query within listEl to avoid selector issues
    const checks = listEl.querySelectorAll('.todo-check');
    checks.forEach(ch => ch.addEventListener('change', (e) => {
      const i = Number(e.target.getAttribute('data-idx'));
      const items = load();
      items[i].done = e.target.checked;
      save(items);
      render();
    }));
  }

  addBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    const items = load();
    items.push({ text, done: false, created: Date.now() });
    save(items);
    input.value = '';
    render();
  });

  // support Enter key
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addBtn.click();
  });

  render();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

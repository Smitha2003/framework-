// Sidebar renderer for brain-type specific tabs
function renderSidebar(brainType) {
  const sidebar = document.getElementById('dashboard-sidebar');
  if (!sidebar) return;

  const common = [
    { id: 'overview', label: 'Dashboard' }
  ];

  let tabs = [];
  switch (brainType) {
    case 'Architect':
      tabs = [
        ...common,
        // 'Add Tasks' removed for Architect; provide Past To‑Do Lists (read-only)
        { id: 'past-todos', label: 'Past To‑Do Lists' },
        { id: 'eisenhower', label: "Eisenhower Matrix" },
        { id: 'todo', label: 'To‑Do Lists' },
        { id: 'calendar', label: 'Calendar' }
      ];
      break;
    case 'Sprinter':
      tabs = [
        ...common,
        { id: 'todo', label: 'To‑Do Lists' }
      ];
      break;
    case 'Dreamer':
      tabs = [
        ...common,
        { id: 'kanban', label: 'Kanban' }
      ];
      break;
    case 'Juggler':
      tabs = [
        ...common,
        { id: 'eisenhower', label: 'Eisenhower Matrix' }
      ];
      break;
    case 'Minimalist':
      tabs = [
        ...common
      ];
      break;
    default:
      tabs = common;
  }

  // build DOM
  sidebar.innerHTML = '';
  const section = document.createElement('div');
  section.className = 'sidebar-section';
  const title = document.createElement('h4');
  title.textContent = 'Navigation';
  section.appendChild(title);

  tabs.forEach(t => {
    const a = document.createElement('a');
    a.className = 'sidebar-tab';
    a.setAttribute('data-tab', t.id);
    a.textContent = t.label;
    a.addEventListener('click', () => {
      // mark active
      document.querySelectorAll('.sidebar-tab').forEach(el => el.classList.remove('active'));
      a.classList.add('active');
      handleSidebarTab(t.id);
    });
    section.appendChild(a);
  });

  sidebar.appendChild(section);

  // auto-active first
  const first = sidebar.querySelector('.sidebar-tab');
  if (first) first.click();
}

function handleSidebarTab(tabId) {
  const container = document.getElementById('dashboard-content');
  if (!container) return;

  // Delegates to known renderers or shows placeholders
  switch (tabId) {
    case 'overview':
      // reload current brain dashboard
      // re-run initialization to keep header/brain badge in sync
      const bt = Auth.getUserBrainType();
      loadBrainTypeDashboard(bt);
      break;
    case 'todo':
      container.innerHTML = `
        <h2>To‑Do Lists</h2>
        <div id="todo-host"></div>
        <h3 style="margin-top:18px">Past To‑Do Lists (read-only)</h3>
        <div id="past-todos-host"></div>
      `;
      createTodoList(document.getElementById('todo-host'), `todo:${Auth.getCurrentUser()}:${Auth.getUserBrainType()}`);
      // render past lists inside the todo view, show dates in 2024
      // use a short timeout to ensure DOM insertion completed in all browsers
      setTimeout(() => {
        const host = document.getElementById('past-todos-host');
        renderPastTodos(host, 2024);
      }, 10);
      break;
    case 'eisenhower':
      // If architect helper exists, use it to render a richer matrix
      if (typeof renderEisenhowerMatrix === 'function') {
        container.innerHTML = '';
        const storageKey = `tasks:${Auth.getCurrentUser()}:${Auth.getUserBrainType()}`;
        renderEisenhowerMatrix(container, storageKey);
      } else {
        container.innerHTML = `
          <h2>Eisenhower Matrix</h2>
          <div class="eisenhower-grid">
            <div class="matrix">Important & Urgent</div>
            <div class="matrix">Not Important & Urgent</div>
            <div class="matrix">Important & Not Urgent</div>
            <div class="matrix">Not Important & Not Urgent</div>
          </div>
        `;
      }
      break;
    
    case 'kanban':
      container.innerHTML = '<h2>Kanban Board</h2><div id="kanban-container"></div>';
      if (typeof window.renderDreamerKanban === 'function') {
        const host = document.getElementById('kanban-container');
        // Render kanban in the sidebar
        const ideas = window.loadDreamerIdeas();
        const statuses = ['inspiration', 'developing', 'refining', 'completed'];
        const statusLabels = {
          inspiration: '✨ Inspiration',
          developing: '🌱 Developing',
          refining: '✏️ Refining',
          completed: '🎉 Completed'
        };
        const statusColors = {
          inspiration: '#7f5af0',
          developing: '#2cb67d',
          refining: '#ffca3a',
          completed: '#16a34a'
        };

        let html = `<div class="dreamer-kanban">`;

        statuses.forEach(status => {
          const statusIdeas = ideas.filter(i => i.status === status);
          html += `
            <div class="kanban-column" data-status="${status}">
              <div class="kanban-header" style="border-color:${statusColors[status]};">
                ${statusLabels[status]}
                <span style="font-size:0.8rem; color:#999;">(${statusIdeas.length})</span>
              </div>
              <div class="kanban-cards" data-status="${status}">
                ${statusIdeas.map(idea => `
                  <div class="kanban-card" draggable="true" data-id="${idea.id}" style="border-left-color:${statusColors[status]};">
                    <div style="font-weight:600; color:#fff; margin-bottom:6px; word-break:break-word;">${idea.text}</div>
                    <div style="font-size:0.75rem; color:#999;">${new Date(idea.created).toLocaleDateString()}</div>
                    <button class="kanban-delete" data-id="${idea.id}" style="background:none; border:none; color:#ff6b6b; cursor:pointer; font-size:0.9rem; margin-top:6px; opacity:0; transition:opacity 0.2s;">✕ Delete</button>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        });

        html += `</div>`;
        host.innerHTML = html;

        // Drag and drop
        setTimeout(() => {
          document.querySelectorAll('.kanban-card').forEach(card => {
            card.addEventListener('dragstart', (e) => {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', e.target.closest('.kanban-card').getAttribute('data-id'));
            });

            card.addEventListener('mouseenter', () => {
              card.querySelector('.kanban-delete').style.opacity = '1';
            });

            card.addEventListener('mouseleave', () => {
              card.querySelector('.kanban-delete').style.opacity = '0';
            });
          });

          document.querySelectorAll('.kanban-cards').forEach(column => {
            column.addEventListener('dragover', (e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              column.style.background = 'rgba(127,90,240,0.1)';
            });

            column.addEventListener('dragleave', () => {
              column.style.background = '';
            });

            column.addEventListener('drop', (e) => {
              e.preventDefault();
              column.style.background = '';
              const ideaId = Number(e.dataTransfer.getData('text/plain'));
              const newStatus = column.getAttribute('data-status');
              const ideas = window.loadDreamerIdeas();
              const idea = ideas.find(i => i.id === ideaId);
              if (idea) {
                idea.status = newStatus;
                window.saveDreamerIdeas(ideas);
                handleSidebarTab('kanban'); // Re-render kanban
              }
            });
          });

          document.querySelectorAll('.kanban-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const ideaId = Number(btn.getAttribute('data-id'));
              const ideas = window.loadDreamerIdeas();
              const idx = ideas.findIndex(i => i.id === ideaId);
              if (idx !== -1) {
                ideas.splice(idx, 1);
                window.saveDreamerIdeas(ideas);
                handleSidebarTab('kanban'); // Re-render kanban
              }
            });
          });
        }, 50);
      }
      break;
    case 'add-tasks':
      container.innerHTML = '<h2>Add Tasks</h2><div id="todo-host-add"></div>';
      createTodoList(document.getElementById('todo-host-add'), `todo:add:${Auth.getCurrentUser()}`);
      break;
    case 'calendar':
      // render a simple monthly calendar for current month
      if (typeof renderMonthlyCalendar === 'function') {
        container.innerHTML = '';
        renderMonthlyCalendar(container);
      } else {
        container.innerHTML = '<h2>Calendar</h2><p>Calendar view placeholder.</p>';
      }
      break;
    case 'past-todos':
      // Show simulated past to-do lists (read-only)
      container.innerHTML = '<h2>Past To‑Do Lists</h2><div id="past-todos-host"></div>';
      renderPastTodos(container.querySelector('#past-todos-host'));
      break;
    default:
      container.innerHTML = `<p>Tab ${tabId} not implemented yet.</p>`;
  }
}

// Simple monthly calendar renderer (current month)
function renderMonthlyCalendar(container, year, month) {
  container.innerHTML = '';
  const today = new Date();
  const y = year || today.getFullYear();
  const m = (typeof month === 'number') ? month : today.getMonth();

  const first = new Date(y, m, 1);
  const last = new Date(y, m+1, 0);
  const monthName = first.toLocaleString(undefined, { month: 'long' });

  const header = document.createElement('div'); header.style.display='flex'; header.style.justifyContent='space-between'; header.style.alignItems='center'; header.style.marginBottom='12px';
  const title = document.createElement('h3'); title.textContent = `${monthName} ${y}`; header.appendChild(title);
  container.appendChild(header);

  const grid = document.createElement('div'); grid.className = 'calendar-grid';
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  days.forEach(d=>{ const el = document.createElement('div'); el.className='cal-day-name'; el.textContent=d; grid.appendChild(el); });

  // pad empty cells until first day
  for (let i=0;i<first.getDay();i++) { const e = document.createElement('div'); e.className='cal-cell empty'; grid.appendChild(e); }

  for (let d=1; d<= last.getDate(); d++) {
    const cell = document.createElement('div'); cell.className='cal-cell';
    const num = document.createElement('div'); num.className='cal-num'; num.textContent = d; cell.appendChild(num);
    // optional: mark today
    if (y===today.getFullYear() && m===today.getMonth() && d===today.getDate()) {
      cell.classList.add('today');
    }
    grid.appendChild(cell);
  }

  container.appendChild(grid);
}

// Render a few simulated past to-do lists (read-only)
function renderPastTodos(container, year) {
  if (!container) return;
  const user = Auth.getCurrentUser() || 'guest';
  const seed = user.length;
  const y = year || 2024;

  // helper to get a date offset but force year to `y`
  function pastDate(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setFullYear(y);
    return d.toLocaleDateString();
  }

  const samples = [
    {
      title: 'Sprint Review - ' + pastDate(8),
      items: ['Publish release notes','Merge hotfix','Tag release']
    },
    {
      title: 'Planning Day - ' + pastDate(20),
      items: ['Draft roadmap','Estimate stories','Align priorities']
    },
    {
      title: 'Deep Work - ' + pastDate(35),
      items: ['Research API','Write spec','Prototype UI']
    }
  ];

  if (seed % 2 === 0) samples[0].items.push('Retrospective notes');

  container.innerHTML = '';
  samples.forEach(list => {
    const wrap = document.createElement('div'); wrap.className = 'card past-list-card';
    const h = document.createElement('h4'); h.textContent = list.title; wrap.appendChild(h);
    const ul = document.createElement('ul'); ul.className = 'past-todo-list';
    list.items.forEach(it => {
      const li = document.createElement('li');
      li.innerHTML = `<label><input type="checkbox" disabled /> <span>${escapeHtml(it)}</span></label>`;
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
    container.appendChild(wrap);
  });
}

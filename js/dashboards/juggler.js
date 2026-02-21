// Juggler Dashboard - Multitasker, Adaptive, Context-Switcher
function renderJugglerDashboard(container) {
  container.className = 'juggler-dashboard';
  container.innerHTML = `
    <div class="dashboard-section-header">
      <h1>🤹 Juggler Dashboard</h1>
      <p>Your multi-stream flow system</p>
    </div>

    <div class="juggler-main-layout">
      <div class="juggler-left">
        <div id="juggler-streams-host"></div>
        <div id="juggler-context-host"></div>
        <div id="juggler-overview-host"></div>
        <div id="juggler-chart-host"></div>
      </div>
      <div class="juggler-right">
        <div id="juggler-tasks-host"></div>
      </div>
    </div>
  `;

  const username = Auth.getCurrentUser();
  const streamsKey = `juggler:streams:${username}`;
  const contextKey = `juggler:context:${username}`;

  // Load/save functions
  function loadStreams() {
    try {
      return JSON.parse(localStorage.getItem(streamsKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveStreams(streams) {
    localStorage.setItem(streamsKey, JSON.stringify(streams));
  }

  function loadContextCount() {
    try {
      return JSON.parse(localStorage.getItem(contextKey) || '{"count": 0, "lastStream": null}');
    } catch (e) {
      return { count: 0, lastStream: null };
    }
  }

  function saveContextCount(data) {
    localStorage.setItem(contextKey, JSON.stringify(data));
  }

  function recordContextSwitch(newStreamId) {
    const ctx = loadContextCount();
    if (ctx.lastStream !== newStreamId) {
      ctx.count++;
      ctx.lastStream = newStreamId;
      saveContextCount(ctx);
    }
  }

  // Render interactive streams card
  function renderStreamsCard() {
    const host = document.getElementById('juggler-streams-host');
    if (!host) return;

    const streams = loadStreams();

    let html = `
      <div class="card juggler-streams-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3>Active Streams</h3>
          <button id="juggler-add-stream" class="action-btn" style="padding:6px 12px; font-size:0.85rem;">+ Add Stream</button>
        </div>
        <div class="juggler-streams-list">
    `;

    if (streams.length === 0) {
      html += '<p style="color:#999; text-align:center; padding:20px 0;">No streams yet. Click "Add Stream" to get started!</p>';
    } else {
      streams.forEach((s, idx) => {
        const progress = s.tasks.length > 0 ? Math.round((s.tasks.filter(t => t.done).length / s.tasks.length) * 100) : 0;
        html += `
          <div class="stream-item" data-stream-id="${s.id}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <strong style="color:#fff;">${s.name}</strong>
              <button class="juggler-remove-stream" data-idx="${idx}" style="background:none; border:none; color:#ff6b6b; cursor:pointer; font-size:0.9rem;">✕</button>
            </div>
            <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
              <div style="flex:1; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                <div style="height:100%; background:linear-gradient(90deg, #7f5af0, #2cb67d); width:${progress}%;"></div>
              </div>
              <span style="font-size:0.8rem; color:#999;">${progress}%</span>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="juggler-set-active" data-idx="${idx}" style="flex:1; padding:6px; font-size:0.8rem; background:rgba(127,90,240,0.2); border:1px solid rgba(127,90,240,0.5); color:#7f5af0; border-radius:4px; cursor:pointer;">Set Active</button>
              <button class="juggler-add-task" data-idx="${idx}" style="flex:1; padding:6px; font-size:0.8rem; background:rgba(44,182,125,0.2); border:1px solid rgba(44,182,125,0.5); color:#2cb67d; border-radius:4px; cursor:pointer;">+ Task</button>
            </div>
          </div>
        `;
      });
    }

    html += `
        </div>
      </div>
    `;

    host.innerHTML = html;

    // Event listeners
    document.getElementById('juggler-add-stream').addEventListener('click', () => {
      const name = prompt('Stream name:');
      if (!name) return;
      const streams = loadStreams();
      streams.push({ id: Date.now(), name, tasks: [], active: false });
      saveStreams(streams);
      renderAll();
    });

    document.querySelectorAll('.juggler-remove-stream').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.target.getAttribute('data-idx'));
        const streams = loadStreams();
        streams.splice(idx, 1);
        saveStreams(streams);
        renderAll();
      });
    });

    document.querySelectorAll('.juggler-set-active').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.target.getAttribute('data-idx'));
        const streams = loadStreams();
        streams.forEach(s => (s.active = false));
        streams[idx].active = true;
        recordContextSwitch(streams[idx].id);
        saveStreams(streams);
        renderAll();
      });
    });

    document.querySelectorAll('.juggler-add-task').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.target.getAttribute('data-idx'));
        const task = prompt('Task description:');
        if (!task) return;
        const streams = loadStreams();
        streams[idx].tasks.push({ id: Date.now(), text: task, done: false });
        saveStreams(streams);
        renderAll();
      });
    });
  }

  // Render tasks for active stream
  function renderActiveTasks() {
    const host = document.getElementById('juggler-tasks-host');
    if (!host) return;

    const streams = loadStreams();
    const activeStream = streams.find(s => s.active);

    if (!activeStream) {
      host.innerHTML = `
        <div class="card juggler-tasks-card">
          <h3>Stream Tasks</h3>
          <p style="color:#999; text-align:center; padding:20px 0;">Select an active stream to view tasks</p>
        </div>
      `;
      return;
    }

    const tasks = activeStream.tasks || [];
    const completed = tasks.filter(t => t.done).length;

    let html = `
      <div class="card juggler-tasks-card">
        <div style="margin-bottom:12px;">
          <h3 style="margin-bottom:4px;">${activeStream.name}</h3>
          <div style="font-size:0.8rem; color:#999;">${completed}/${tasks.length} completed</div>
        </div>
        <div class="juggler-tasks-list">
    `;

    if (tasks.length === 0) {
      html += '<p style="color:#999; text-align:center; padding:12px 0; font-size:0.9rem;">No tasks yet</p>';
    } else {
      tasks.forEach((t, idx) => {
        html += `
          <div class="juggler-task-item" data-task-id="${t.id}">
            <input type="checkbox" class="juggler-task-check" data-stream-id="${activeStream.id}" data-task-idx="${idx}" ${t.done ? 'checked' : ''} />
            <span class="juggler-task-text ${t.done ? 'completed' : ''}">${t.text}</span>
            <button class="juggler-delete-task" data-stream-id="${activeStream.id}" data-task-idx="${idx}" style="background:none; border:none; color:#ff6b6b; cursor:pointer; opacity:0; transition:opacity 0.2s;">×</button>
          </div>
        `;
      });
    }

    html += `
        </div>
      </div>
    `;

    host.innerHTML = html;

    // Task checkbox listeners
    document.querySelectorAll('.juggler-task-check').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const streamId = Number(e.target.getAttribute('data-stream-id'));
        const taskIdx = Number(e.target.getAttribute('data-task-idx'));
        const streams = loadStreams();
        const stream = streams.find(s => s.id === streamId);
        if (stream) {
          stream.tasks[taskIdx].done = e.target.checked;
          saveStreams(streams);
          renderAll();
        }
      });
    });

    // Delete task listeners
    document.querySelectorAll('.juggler-delete-task').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const streamId = Number(e.target.getAttribute('data-stream-id'));
        const taskIdx = Number(e.target.getAttribute('data-task-idx'));
        const streams = loadStreams();
        const stream = streams.find(s => s.id === streamId);
        if (stream) {
          stream.tasks.splice(taskIdx, 1);
          saveStreams(streams);
          renderAll();
        }
      });
    });

    // Hover effect for delete button
    document.querySelectorAll('.juggler-task-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        const btn = item.querySelector('.juggler-delete-task');
        if (btn) btn.style.opacity = '1';
      });
      item.addEventListener('mouseleave', () => {
        const btn = item.querySelector('.juggler-delete-task');
        if (btn) btn.style.opacity = '0';
      });
    });
  }

  // Render context switch counter
  function renderContextCounter() {
    const host = document.getElementById('juggler-context-host');
    if (!host) return;

    const ctx = loadContextCount();
    host.innerHTML = `
      <div class="card">
        <h3>Context Switching</h3>
        <div style="display:flex; align-items:center; gap:20px;">
          <div>
            <div style="font-size:2.5rem; font-weight:800; color:#7f5af0;">${ctx.count}</div>
            <div style="color:#999; font-size:0.9rem;">Switches this session</div>
          </div>
          <p style="flex:1; color:#bbb; margin:0;">Each intentional switch to a new stream is tracked. Try batching similar tasks to reduce unnecessary switching and maintain flow state.</p>
        </div>
      </div>
    `;
  }

  // Render stream status overview
  function renderStatusOverview() {
    const host = document.getElementById('juggler-overview-host');
    if (!host) return;

    const streams = loadStreams();
    const activeStream = streams.find(s => s.active);

    let html = '<div class="card"><h3>Stream Status Overview</h3>';

    if (streams.length === 0) {
      html += '<p style="color:#999;">Add streams to see status overview.</p>';
    } else {
      html += '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:12px;">';

      streams.forEach(s => {
        const completed = s.tasks.filter(t => t.done).length;
        const total = s.tasks.length;
        const isActive = s.active;

        html += `
          <div style="background:${isActive ? 'rgba(127,90,240,0.15)' : 'rgba(255,255,255,0.05)'}; border:1px solid ${isActive ? 'rgba(127,90,240,0.5)' : 'rgba(255,255,255,0.1)'}; border-radius:8px; padding:12px; ${isActive ? 'box-shadow: 0 0 12px rgba(127,90,240,0.3);' : ''}">
            <div style="font-weight:600; color:#fff; margin-bottom:4px;">${s.name}</div>
            <div style="font-size:0.8rem; color:#999; margin-bottom:6px;">${completed}/${total} tasks</div>
            <div style="font-size:0.75rem; padding:4px 8px; background:${isActive ? '#7f5af0' : '#666'}; color:white; border-radius:3px; display:inline-block;">${isActive ? 'ACTIVE' : 'PAUSED'}</div>
          </div>
        `;
      });

      html += '</div>';
    }

    html += '</div>';
    host.innerHTML = html;
  }

  // Render load distribution chart
  function renderLoadChart() {
    const host = document.getElementById('juggler-chart-host');
    if (!host) return;

    const streams = loadStreams();
    if (streams.length === 0) {
      host.innerHTML = '<div class="card"><h3>Load Distribution</h3><p style="color:#999;">Add streams to see load distribution.</p></div>';
      return;
    }

    const totalTasks = streams.reduce((sum, s) => sum + s.tasks.length, 0);

    // Create SVG pie/donut chart
    const width = 300,
      height = 200,
      radius = 60;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.width = '100%';

    const colors = ['#7f5af0', '#2cb67d', '#ffca3a', '#ff6b9d', '#ffa502'];
    let currentAngle = -Math.PI / 2;

    streams.forEach((s, idx) => {
      const sliceAngle = (s.tasks.length / totalTasks) * Math.PI * 2;
      const x1 = 150 + radius * Math.cos(currentAngle);
      const y1 = 100 + radius * Math.sin(currentAngle);
      const x2 = 150 + radius * Math.cos(currentAngle + sliceAngle);
      const y2 = 100 + radius * Math.sin(currentAngle + sliceAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      const path = document.createElementNS(svg.namespaceURI, 'path');
      path.setAttribute(
        'd',
        `M 150 100 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
      );
      path.setAttribute('fill', colors[idx % colors.length]);
      path.setAttribute('opacity', '0.8');
      path.setAttribute('title', `${s.name}: ${s.tasks.length} tasks`);
      svg.appendChild(path);

      currentAngle += sliceAngle;
    });

    // Inner circle for donut effect
    const circle = document.createElementNS(svg.namespaceURI, 'circle');
    circle.setAttribute('cx', '150');
    circle.setAttribute('cy', '100');
    circle.setAttribute('r', '35');
    circle.setAttribute('fill', '#1a1a2e');
    svg.appendChild(circle);

    // Label in center
    const text = document.createElementNS(svg.namespaceURI, 'text');
    text.setAttribute('x', '150');
    text.setAttribute('y', '95');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '18');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', '#fff');
    text.textContent = totalTasks;
    svg.appendChild(text);

    const text2 = document.createElementNS(svg.namespaceURI, 'text');
    text2.setAttribute('x', '150');
    text2.setAttribute('y', '110');
    text2.setAttribute('text-anchor', 'middle');
    text2.setAttribute('font-size', '12');
    text2.setAttribute('fill', '#999');
    text2.textContent = 'tasks';
    svg.appendChild(text2);

    // Legend
    const legend = document.createElement('div');
    legend.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fit, minmax(120px, 1fr)); gap:12px; margin-top:16px; font-size:0.85rem;';

    streams.forEach((s, idx) => {
      const pct = ((s.tasks.length / totalTasks) * 100).toFixed(0);
      const item = document.createElement('div');
      item.style.cssText = 'display:flex; align-items:center; gap:8px;';
      item.innerHTML = `
        <div style="width:12px; height:12px; border-radius:2px; background:${colors[idx % colors.length]};"></div>
        <div>
          <div style="color:#e0e0e0; font-weight:600;">${s.name}</div>
          <div style="color:#999;">${s.tasks.length} (${pct}%)</div>
        </div>
      `;
      legend.appendChild(item);
    });

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = '<h3>Load Distribution</h3>';
    card.appendChild(svg);
    card.appendChild(legend);

    host.innerHTML = '';
    host.appendChild(card);
  }

  function renderAll() {
    renderStreamsCard();
    renderActiveTasks();
    renderContextCounter();
    renderStatusOverview();
    renderLoadChart();
  }

  // Initial render
  renderAll();
}

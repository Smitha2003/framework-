// Dreamer Dashboard - Creative, Visionary, Big-Picture Thinker
function renderDreamerDashboard(container) {
  container.className = 'dreamer-dashboard';
  container.innerHTML = `
    <div class="dashboard-section-header">
      <h1>💭 Dreamer Dashboard</h1>
      <p>Your vision-powered creative space</p>
    </div>

    <div id="dreamer-stats-host"></div>
    <div id="dreamer-braindump-host"></div>
    <div id="dreamer-vision-host"></div>
    <div id="dreamer-energy-host"></div>
    <div id="dreamer-inspiration-host"></div>
  `;

  const username = Auth.getCurrentUser();
  const ideasKey = `dreamer:ideas:${username}`;
  const visionKey = `dreamer:vision:${username}`;
  const energyKey = `dreamer:energy:${username}`;
  const inspirationKey = `dreamer:inspiration:${username}`;

  // Load/save functions
  function loadIdeas() {
    try {
      return JSON.parse(localStorage.getItem(ideasKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveIdeas(ideas) {
    localStorage.setItem(ideasKey, JSON.stringify(ideas));
  }

  function loadVisions() {
    try {
      return JSON.parse(localStorage.getItem(visionKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveVisions(visions) {
    localStorage.setItem(visionKey, JSON.stringify(visions));
  }

  function loadEnergy() {
    try {
      return JSON.parse(localStorage.getItem(energyKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveEnergy(energy) {
    localStorage.setItem(energyKey, JSON.stringify(energy));
  }

  function loadInspirations() {
    try {
      return JSON.parse(localStorage.getItem(inspirationKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveInspirations(inspirations) {
    localStorage.setItem(inspirationKey, JSON.stringify(inspirations));
  }

  // Stats card
  function renderStats() {
    const host = document.getElementById('dreamer-stats-host');
    if (!host) return;

    const ideas = loadIdeas();
    const visions = loadVisions();
    const inspirations = loadInspirations();
    
    host.innerHTML = `
      <div class="dreamer-stats">
        <div class="stat-box">
          <div class="stat-num">${ideas.length}</div>
          <div class="stat-label">Ideas Captured</div>
        </div>
        <div class="stat-box">
          <div class="stat-num">${ideas.filter(i => i.status === 'inspiration').length}</div>
          <div class="stat-label">In Inspiration</div>
        </div>
        <div class="stat-box">
          <div class="stat-num">${ideas.filter(i => i.status === 'developing').length}</div>
          <div class="stat-label">Developing</div>
        </div>
        <div class="stat-box">
          <div class="stat-num">${visions.length}</div>
          <div class="stat-label">Vision Goals</div>
        </div>
        <div class="stat-box">
          <div class="stat-num">${inspirations.length}</div>
          <div class="stat-label">Inspirations</div>
        </div>
      </div>
    `;
  }

  // Brain dump section
  function renderBraindump() {
    const host = document.getElementById('dreamer-braindump-host');
    if (!host) return;

    const ideas = loadIdeas();
    const recentIdeas = ideas.slice(-5).reverse();

    let html = `
      <div class="card dreamer-braindump">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3>💡 Brain Dump</h3>
          <button id="dreamer-quick-add" class="action-btn" style="padding:6px 12px; font-size:0.85rem;">+ Quick Idea</button>
        </div>
        <textarea id="dreamer-braindump-input" placeholder="Jot down ideas as they come... freely, no judgment. Your raw thoughts matter." style="width:100%; height:100px; padding:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(127,90,240,0.2); border-radius:8px; color:#e0e0e0; font-family:inherit; resize:vertical; margin-bottom:12px;"></textarea>
        <button id="dreamer-capture-idea" class="action-btn" style="background:linear-gradient(90deg,#7f5af0,#2cb67d); border:none; color:white; width:100%;">Capture Idea</button>
        <div style="margin-top:16px; padding-top:16px; border-top:1px solid rgba(127,90,240,0.2);">
          <div style="font-size:0.85rem; color:#999; margin-bottom:8px;">Recent ideas:</div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${recentIdeas.map(idea => `
              <div style="padding:8px 12px; background:rgba(255,255,255,0.04); border-left:3px solid #7f5af0; border-radius:4px; font-size:0.85rem; color:#e0e0e0;">
                "${idea.text}"
                <div style="font-size:0.75rem; color:#999; margin-top:2px;">${new Date(idea.created).toLocaleDateString()}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    host.innerHTML = html;

    document.getElementById('dreamer-capture-idea').addEventListener('click', () => {
      const text = document.getElementById('dreamer-braindump-input').value.trim();
      if (!text) return;
      const ideas = loadIdeas();
      ideas.push({
        id: Date.now(),
        text,
        status: 'inspiration',
        created: Date.now(),
        tags: []
      });
      saveIdeas(ideas);
      document.getElementById('dreamer-braindump-input').value = '';
      renderAll();
    });

    document.getElementById('dreamer-quick-add').addEventListener('click', () => {
      const text = prompt('Quick idea:');
      if (!text) return;
      const ideas = loadIdeas();
      ideas.push({
        id: Date.now(),
        text,
        status: 'inspiration',
        created: Date.now(),
        tags: []
      });
      saveIdeas(ideas);
      renderAll();
    });
  }

  // Kanban board
  function renderKanban() {
    const host = document.getElementById('dreamer-kanban-host');
    if (!host) return;

    const ideas = loadIdeas();
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

    let html = `<div class="card"><h3>Kanban Board</h3><div class="dreamer-kanban">`;

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

    html += `</div></div>`;
    host.innerHTML = html;

    // Drag and drop
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
        const ideas = loadIdeas();
        const idea = ideas.find(i => i.id === ideaId);
        if (idea) {
          idea.status = newStatus;
          saveIdeas(ideas);
          renderAll();
        }
      });
    });

    document.querySelectorAll('.kanban-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ideaId = Number(btn.getAttribute('data-id'));
        const ideas = loadIdeas();
        const idx = ideas.findIndex(i => i.id === ideaId);
        if (idx !== -1) {
          ideas.splice(idx, 1);
          saveIdeas(ideas);
          renderAll();
        }
      });
    });
  }

  // Vision and goals
  function renderVisionGoals() {
    const host = document.getElementById('dreamer-vision-host');
    if (!host) return;

    const visions = loadVisions();

    let html = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3>🚀 Vision & Goals</h3>
          <button id="dreamer-add-vision" class="action-btn" style="padding:6px 12px; font-size:0.85rem;">+ Add Vision</button>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px;">
    `;

    if (visions.length === 0) {
      html += '<p style="color:#999; grid-column:1/-1;">No visions yet. Add your big dreams and break them into milestones!</p>';
    } else {
      visions.forEach((v, idx) => {
        const completed = v.milestones ? v.milestones.filter(m => m.done).length : 0;
        const total = v.milestones ? v.milestones.length : 0;
        html += `
          <div style="background:rgba(127,90,240,0.1); border:1px solid rgba(127,90,240,0.3); border-radius:10px; padding:14px;">
            <div style="display:flex; justify-content:space-between; align-items:start; gap:8px; margin-bottom:8px;">
              <div style="font-weight:600; color:#fff; flex:1; word-break:break-word;">${v.title}</div>
              <button class="dreamer-delete-vision" data-idx="${idx}" style="background:none; border:none; color:#ff6b6b; cursor:pointer; font-size:0.9rem;">✕</button>
            </div>
            <p style="font-size:0.85rem; color:#bbb; margin:0 0 8px 0;">${v.description}</p>
            <div style="font-size:0.8rem; color:#999; margin-bottom:6px;">Milestones: ${completed}/${total}</div>
            <div style="height:4px; background:rgba(255,255,255,0.1); border-radius:2px; overflow:hidden;">
              <div style="height:100%; background:#2cb67d; width:${total > 0 ? (completed/total)*100 : 0}%;"></div>
            </div>
          </div>
        `;
      });
    }

    html += `</div></div>`;
    host.innerHTML = html;

    document.getElementById('dreamer-add-vision').addEventListener('click', () => {
      const title = prompt('Vision title:');
      if (!title) return;
      const description = prompt('Vision description:');
      const visions = loadVisions();
      visions.push({
        id: Date.now(),
        title,
        description,
        milestones: [],
        created: Date.now()
      });
      saveVisions(visions);
      renderAll();
    });

    document.querySelectorAll('.dreamer-delete-vision').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(btn.getAttribute('data-idx'));
        const visions = loadVisions();
        visions.splice(idx, 1);
        saveVisions(visions);
        renderAll();
      });
    });
  }

  // Creative energy tracker
  function renderEnergyTracker() {
    const host = document.getElementById('dreamer-energy-host');
    if (!host) return;

    const energy = loadEnergy();
    const today = new Date().toISOString().slice(0, 10);
    const todayData = energy.find(e => e.date === today) || { date: today, level: 0 };

    host.innerHTML = `
      <div class="card">
        <h3>🔥 Creative Energy</h3>
        <div style="display:flex; align-items:center; gap:16px; margin-bottom:16px;">
          <div style="flex:1;">
            <input type="range" id="dreamer-energy-slider" min="0" max="100" value="${todayData.level}" style="width:100%; cursor:pointer;">
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#999; margin-top:4px;">
              <span>Low</span>
              <span>Energized</span>
            </div>
          </div>
          <div style="font-size:2rem; font-weight:800; color:#7f5af0; min-width:60px; text-align:center;">${todayData.level}%</div>
        </div>
        <p style="font-size:0.85rem; color:#999; margin:0;">Track your creative energy daily. Understand your creative rhythm.</p>
      </div>
    `;

    document.getElementById('dreamer-energy-slider').addEventListener('change', (e) => {
      const energy = loadEnergy();
      const today = new Date().toISOString().slice(0, 10);
      const idx = energy.findIndex(e => e.date === today);
      if (idx !== -1) {
        energy[idx].level = Number(e.target.value);
      } else {
        energy.push({ date: today, level: Number(e.target.value) });
      }
      saveEnergy(energy);
      renderEnergyTracker();
    });
  }

  // Inspiration gallery
  function renderInspirationGallery() {
    const host = document.getElementById('dreamer-inspiration-host');
    if (!host) return;

    const inspirations = loadInspirations();

    let html = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3>📚 Inspiration Library</h3>
          <button id="dreamer-add-inspiration" class="action-btn" style="padding:6px 12px; font-size:0.85rem;">+ Add Inspiration</button>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:12px;">
    `;

    if (inspirations.length === 0) {
      html += '<p style="color:#999; grid-column:1/-1;">No inspirations yet. Curate quotes, ideas, and concepts that fuel your creativity!</p>';
    } else {
      inspirations.forEach((insp, idx) => {
        html += `
          <div style="background:linear-gradient(135deg, rgba(127,90,240,0.1), rgba(44,182,125,0.05)); border:1px solid rgba(127,90,240,0.2); border-radius:10px; padding:14px; position:relative;">
            <div style="font-size:0.85rem; color:#e0e0e0; margin-bottom:8px; word-break:break-word; min-height:40px;">"${insp.content}"</div>
            <div style="font-size:0.75rem; color:#999; margin-bottom:8px;">— ${insp.source}</div>
            <div style="font-size:0.7rem; color:#666; margin-bottom:8px;">${new Date(insp.created).toLocaleDateString()}</div>
            <button class="dreamer-delete-insp" data-idx="${idx}" style="background:none; border:none; color:#ff6b6b; cursor:pointer; font-size:0.8rem; opacity:0; transition:opacity 0.2s; position:absolute; top:8px; right:8px;">✕</button>
          </div>
        `;
      });
    }

    html += `</div></div>`;
    host.innerHTML = html;

    document.getElementById('dreamer-add-inspiration').addEventListener('click', () => {
      const content = prompt('Inspiration/Quote:');
      if (!content) return;
      const source = prompt('Source (author, book, etc):');
      const inspirations = loadInspirations();
      inspirations.push({
        id: Date.now(),
        content,
        source,
        created: Date.now()
      });
      saveInspirations(inspirations);
      renderAll();
    });

    document.querySelectorAll('.dreamer-delete-insp').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(btn.getAttribute('data-idx'));
        const inspirations = loadInspirations();
        inspirations.splice(idx, 1);
        saveInspirations(inspirations);
        renderAll();
      });

      btn.closest('div').addEventListener('mouseenter', () => {
        btn.style.opacity = '1';
      });

      btn.closest('div').addEventListener('mouseleave', () => {
        btn.style.opacity = '0';
      });
    });
  }

  function renderAll() {
    renderStats();
    renderBraindump();
    renderVisionGoals();
    renderEnergyTracker();
    renderInspirationGallery();
  }

  // Expose kanban renderer for sidebar
  window.renderDreamerKanban = renderKanban;
  window.loadDreamerIdeas = loadIdeas;
  window.saveDreamerIdeas = saveIdeas;

  // Initial render
  renderAll();
}

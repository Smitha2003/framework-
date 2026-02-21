// Architect Dashboard - Structured, Systematic, Detail-Oriented
function renderArchitectDashboard(container) {
  container.className = 'architect-dashboard';
  container.innerHTML = `
    <div class="dashboard-section-header">
      <h1>🏗️ Architect Dashboard</h1>
      <p>Your structured focus system</p>
      <div class="architect-floating-notice" id="architect-completion-notice">You've completed 0% of planned tasks</div>
    </div>

    <div class="architect-layout">
      <div class="left-col">
        <div class="card">
          <h3>Nested Task Tree</h3>
          <div class="task-add">
            <input id="architect-new-task" placeholder="New task title" />
            <select id="architect-new-importance">
              <option value="3">Importance: 3</option>
              <option value="4">Importance: 4</option>
              <option value="2">Importance: 2</option>
              <option value="1">Importance: 1</option>
            </select>
            <label><input type="checkbox" id="architect-new-urgent" /> Urgent</label>
            <button id="architect-add-task">Add Task</button>
          </div>
          <div id="architect-tree"></div>
        </div>

        <div class="card">
          <h3>Categories & Tags</h3>
          <div class="tag-controls">
            <input id="architect-new-tag" placeholder="Add tag" />
            <button id="architect-add-tag">Add Tag</button>
          </div>
          <div id="architect-tags" class="tags-list"></div>
        </div>
      </div>

      <div class="right-col">
        <div class="card">
          <h3>Analytics</h3>
          <div id="architect-analytics">
                <div class="analytics-row">
                  <label>Task Completion Rate</label>
                  <div id="architect-completion-rate" class="completion-graph"></div>
                </div>
                <div class="analytics-row">
                  <label>Weekly Structured Breakdown</label>
                  <div id="architect-weekly-structured" class="weekly-structured"></div>
                </div>
          </div>
        </div>

        <div class="card">
          <h3>Quick Actions</h3>
          <div class="action-buttons">
            <button class="action-btn" id="architect-add-sample">Add Sample Structure</button>
            <button class="action-btn" id="architect-export">Export Tasks</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // wire up behavior
  const username = Auth.getCurrentUser();
  const storageKey = `tasks:${username}:Architect`;
  const tagsKey = `tags:${username}:Architect`;

  function loadTasks() {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch (e) { return []; }
  }
  function saveTasks(tasks) { localStorage.setItem(storageKey, JSON.stringify(tasks)); }

  function loadTags() { try { return JSON.parse(localStorage.getItem(tagsKey) || '[]'); } catch (e) { return []; } }
  function saveTags(tags) { localStorage.setItem(tagsKey, JSON.stringify(tags)); }

  function generateId() { return 't_' + Math.random().toString(36).slice(2,9); }

  // simple in-memory collapsed state for this render session
  const collapsed = {};

  function renderTree() {
    const host = document.getElementById('architect-tree');
    const tasks = loadTasks();
    // build map
    const map = {};
    tasks.forEach(t => map[t.id] = {...t, children: []});
    const roots = [];
    tasks.forEach(t => {
      if (t.parentId) {
        if (map[t.parentId]) map[t.parentId].children.push(map[t.id]);
        else roots.push(map[t.id]);
      } else roots.push(map[t.id]);
    });

    host.innerHTML = '';
    roots.forEach(r => host.appendChild(renderNode(r, 0)));
  }

  function renderNode(node, level) {
    const el = document.createElement('div');
    el.className = 'tree-node';
    el.style.marginLeft = (level * 12) + 'px';

    const impClass = `importance-${(node.importance||3)}`;
    const tagsHtml = (node.tags && node.tags.length) ? node.tags.map(t=>`<span class="tag-pill">${escapeHtml(t)}</span>`).join(' ') : '';
    const expanded = !collapsed[node.id];

    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:8px">
          <button class="collapse-btn" data-id="${node.id}">${expanded ? '▾' : '▸'}</button>
          <label class="node-label">
            <input type="checkbox" class="arch-check" data-id="${node.id}" ${node.done ? 'checked' : ''} />
            <span class="node-title">${escapeHtml(node.title)}</span>
            <span class="node-meta">${tagsHtml}</span>
          </label>
        </div>
        <div class="node-actions">
          <div class="importance-badge ${impClass}">${node.importance||3}</div>
          <button data-id="${node.id}" class="add-sub">+sub</button>
          <button data-id="${node.id}" class="del">del</button>
        </div>
      </div>
    `;

    if (node.children && node.children.length && expanded) {
      const childrenWrap = document.createElement('div');
      childrenWrap.style.marginTop = '8px';
      node.children.forEach(c => childrenWrap.appendChild(renderNode(c, level+1)));
      el.appendChild(childrenWrap);
    }

    return el;
  }

  function renderTags() {
    const host = document.getElementById('architect-tags');
    const tags = loadTags();
    host.innerHTML = '';
    tags.forEach(t => {
      const b = document.createElement('button');
      b.className = 'tag-pill';
      b.textContent = t;
      host.appendChild(b);
    });
  }

  function computeAnalytics() {
    const tasks = loadTasks();
    const total = tasks.length;
    const completed = tasks.filter(t => t.done).length;
    const rate = total ? Math.round((completed/total)*100) : 0;

    // weekly completions (last 7 days)
    const now = new Date();
    const days = Array.from({length:7}).map((_,i)=>{
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6-i));
      return {key: d.toISOString().slice(0,10), label: d.toLocaleDateString(undefined, {weekday:'short'}) , count:0};
    });
    const dayMap = {}; days.forEach(d=>dayMap[d.key]=d);
    tasks.forEach(t=>{
      if (t.completedAt) {
        const k = new Date(t.completedAt).toISOString().slice(0,10);
        if (dayMap[k]) dayMap[k].count++;
      }
    });

    return { total, completed, rate, days };
  }

  function renderAnalytics() {
    const a = computeAnalytics();
    // render completion rate graph (SVG)
    const compHost = document.getElementById('architect-completion-rate');
    renderCompletionRateGraph(compHost, a);

    // render weekly structured breakdown stacked bars (SVG)
    const structuredHost = document.getElementById('architect-weekly-structured');
    const tasks = loadTasks();
    renderWeeklyStructuredGraph(structuredHost, tasks);

    // recent completions list
    const chart = document.getElementById('architect-weekly-structured');
    const recentHost = document.createElement('div');
    recentHost.className = 'recent-list';
    const recent = tasks.filter(t=>t.completedAt).sort((a,b)=>b.completedAt-a.completedAt).slice(0,6);
    recent.forEach(r=>{
      const it = document.createElement('div'); it.className='recent-item'; it.textContent = `${r.title} — ${new Date(r.completedAt).toLocaleString()}`; recentHost.appendChild(it);
    });
    chart.parentNode.appendChild(recentHost);
  }

  function renderCompletionRateGraph(container, analytics) {
    if (!container) return;
    container.innerHTML = '';
    const width = 460, height = 140, padding = 28;
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // compute cumulative rate per day
    const days = analytics.days; // days array with key,label,count
    // build cumulative completions by day
    const totals = [];
    let cum = 0; const tasks = loadTasks(); const totalTasks = tasks.length || 1;
    days.forEach(d=>{ cum += d.count; totals.push(Math.round((cum/totalTasks)*100)); });

    // draw axes and polyline
    const maxY = 100;
    // polyline points
    const step = (width - padding*2) / (days.length-1 || 1);
    const points = totals.map((v,i)=> `${padding + i*step},${height - padding - (v/ maxY)*(height - padding*2)}`).join(' ');
    const poly = document.createElementNS(svg.namespaceURI,'polyline');
    poly.setAttribute('points', points);
    poly.setAttribute('fill','none');
    poly.setAttribute('stroke','#7f5af0');
    poly.setAttribute('stroke-width','3');
    svg.appendChild(poly);

    // shaded area
    const areaPoints = `${padding},${height-padding} ${points} ${padding + (days.length-1)*step},${height-padding}`;
    const polygon = document.createElementNS(svg.namespaceURI,'polygon');
    polygon.setAttribute('points', areaPoints);
    polygon.setAttribute('fill','rgba(127,90,240,0.12)');
    svg.appendChild(polygon);

    // x labels
    days.forEach((d,i)=>{
      const x = padding + i*step;
      const tx = document.createElementNS(svg.namespaceURI,'text');
      tx.setAttribute('x', x);
      tx.setAttribute('y', height - 6);
      tx.setAttribute('fill','#bbb');
      tx.setAttribute('font-size','10');
      tx.setAttribute('text-anchor','middle');
      tx.textContent = d.label;
      svg.appendChild(tx);
    });

    container.appendChild(svg);
  }

  function renderWeeklyStructuredGraph(container, tasks) {
    if (!container) return;
    container.innerHTML = '';
    const width = 460, height = 140, padding = 28;
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // colors per importance
    const colors = { '1':'#f0ad4e', '2':'#f39c12', '3':'#7f5af0', '4':'#2cb67d' };

    // compute last 7 days keys
    const now = new Date();
    const days = Array.from({length:7}).map((_,i)=>{
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6-i));
      return {key: d.toISOString().slice(0,10), label: d.toLocaleDateString(undefined,{weekday:'short'}), counts: {1:0,2:0,3:0,4:0}};
    });
    const dayMap = {}; days.forEach(d=>dayMap[d.key]=d);
    tasks.forEach(t=>{
      const k = t.createdAt ? new Date(t.createdAt).toISOString().slice(0,10) : null;
      if (k && dayMap[k]) {
        const imp = (t.importance||3);
        dayMap[k].counts[imp] = (dayMap[k].counts[imp]||0)+1;
      }
    });

    const barWidth = (width - padding*2) / days.length * 0.7;
    const step = (width - padding*2) / days.length;

    // find max stack
    const maxStack = Math.max(1, ...days.map(d=> Object.values(d.counts).reduce((a,b)=>a+b,0)));

    days.forEach((d,i)=>{
      let offsetY = height - padding;
      Object.keys(d.counts).sort().forEach(k=>{
        const val = d.counts[k];
        const h = (val / maxStack) * (height - padding*2);
        const rect = document.createElementNS(svg.namespaceURI,'rect');
        const x = padding + i*step + (step - barWidth)/2;
        rect.setAttribute('x', x);
        rect.setAttribute('y', offsetY - h);
        rect.setAttribute('width', barWidth);
        rect.setAttribute('height', h);
        rect.setAttribute('fill', colors[k]);
        svg.appendChild(rect);
        offsetY -= h;
      });

      const tx = document.createElementNS(svg.namespaceURI,'text');
      tx.setAttribute('x', padding + i*step + step/2);
      tx.setAttribute('y', height - 6);
      tx.setAttribute('fill','#bbb'); tx.setAttribute('font-size','10'); tx.setAttribute('text-anchor','middle'); tx.textContent = d.label;
      svg.appendChild(tx);
    });

    container.appendChild(svg);
  }

  // interactions
  document.getElementById('architect-add-task').addEventListener('click', () => {
    const title = document.getElementById('architect-new-task').value.trim();
    if (!title) return;
    const importance = Number(document.getElementById('architect-new-importance').value) || 3;
    const urgent = document.getElementById('architect-new-urgent').checked;
    const tasks = loadTasks();
    const t = { id: generateId(), title, done: false, parentId: null, tags: [], importance, urgent, createdAt: Date.now() };
    tasks.push(t); saveTasks(tasks); document.getElementById('architect-new-task').value=''; renderTree(); renderAnalytics();
  });

  document.getElementById('architect-add-tag').addEventListener('click', ()=>{
    const v = document.getElementById('architect-new-tag').value.trim();
    if (!v) return; const tags = loadTags(); if (!tags.includes(v)) tags.push(v); saveTags(tags); document.getElementById('architect-new-tag').value=''; renderTags();
  });

  document.getElementById('architect-add-sample').addEventListener('click', ()=>{
    const tasks = loadTasks();
    const a = { id: generateId(), title: 'Project Alpha', done:false, parentId:null, tags:['project'], importance:4, urgent:false, createdAt:Date.now() };
    const b = { id: generateId(), title: 'Design module', done:false, parentId:a.id, tags:['design'], importance:3, urgent:false, createdAt:Date.now() };
    const c = { id: generateId(), title: 'Write spec', done:false, parentId:a.id, tags:['doc'], importance:2, urgent:false, createdAt:Date.now() };
    tasks.push(a,b,c); saveTasks(tasks); renderTree(); renderAnalytics();
  });

  document.getElementById('architect-export').addEventListener('click', ()=>{
    const data = JSON.stringify(loadTasks(), null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'tasks-architect.json'; a.click(); URL.revokeObjectURL(url);
  });

  // delegate checkbox and node actions
  document.getElementById('architect-tree').addEventListener('click', (e)=>{
    const t = e.target;
    if (t.classList.contains('arch-check')) {
      const id = t.getAttribute('data-id');
      const tasks = loadTasks();
      const item = tasks.find(x=>x.id===id); if (item) { item.done = t.checked; if (t.checked) item.completedAt = Date.now(); else delete item.completedAt; saveTasks(tasks); renderAnalytics(); }
    }
    if (t.classList.contains('add-sub')) {
      const id = t.getAttribute('data-id');
      const title = prompt('Subtask title'); if (!title) return;
      const tasks = loadTasks(); const sub = { id: generateId(), title, done:false, parentId: id, tags: [], importance:3, urgent:false, createdAt:Date.now() };
      tasks.push(sub); saveTasks(tasks); renderTree(); renderAnalytics();
    }
    if (t.classList.contains('del')) {
      const id = t.getAttribute('data-id'); let tasks = loadTasks(); tasks = tasks.filter(x=>x.id!==id && x.parentId!==id); saveTasks(tasks); renderTree(); renderAnalytics();
    }
  });

  // initial render
  renderTags(); renderTree();

  // show a friendly dummy analytics visualization on entrance
  const analyticsHost = document.getElementById('architect-analytics');
  renderDummyAnalytics(analyticsHost);

  // update floating completion notice based on current data
  const a = computeAnalytics();
  const notice = document.getElementById('architect-completion-notice');
  if (notice) notice.textContent = `You've completed ${a.rate}% of planned tasks`;
}

// render a dummy analytics SVG for the entrance page (non-data placeholder)
function renderDummyAnalytics(container) {
  if (!container) return;
  container.innerHTML = '';
  const width = 420, height = 140;
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.style.width = '100%';

  // sample sine-like path for pleasing placeholder
  const pts = [];
  for (let i=0;i<20;i++){ const x = (i/19)*(width-40)+20; const y = height/2 + Math.sin(i/3)*28; pts.push(`${x},${y}`); }
  const poly = document.createElementNS(svg.namespaceURI,'polyline');
  poly.setAttribute('points', pts.join(' '));
  poly.setAttribute('fill','none'); poly.setAttribute('stroke','#7f5af0'); poly.setAttribute('stroke-width','3'); svg.appendChild(poly);

  // small bars beneath
  for (let i=0;i<7;i++){ const x = 20 + i*( (width-40)/6 ); const h = 20 + (i%3)*18; const rect = document.createElementNS(svg.namespaceURI,'rect'); rect.setAttribute('x', x-8); rect.setAttribute('y', height-28-h); rect.setAttribute('width', 12); rect.setAttribute('height', h); rect.setAttribute('fill','#2cb67d'); svg.appendChild(rect); }

  const label = document.createElementNS(svg.namespaceURI,'text'); label.setAttribute('x', 12); label.setAttribute('y', 18); label.setAttribute('fill','#ddd'); label.setAttribute('font-size','12'); label.textContent = 'Weekly Overview (sample)'; svg.appendChild(label);
  container.appendChild(svg);
}

// helper to be used by sidebar for eisenhower and analytics view
function renderEisenhowerMatrix(container, storageKey) {
  // Use sessionStorage to keep transient matrix entries for this session only
  const sessionKey = `eisenhower:session:${Auth.getCurrentUser()}`;
  function load() { try { return JSON.parse(sessionStorage.getItem(sessionKey) || '[]'); } catch(e){ return []; } }
  function save(v){ sessionStorage.setItem(sessionKey, JSON.stringify(v)); }

  container.innerHTML = `
    <h2>Eisenhower Matrix</h2>
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:8px;">
      <input id="eis-title" placeholder="Task title" />
      <select id="eis-quad">
        <option value="IU">Important & Urgent</option>
        <option value="IN">Important & Not Urgent</option>
        <option value="NU">Not Important & Urgent</option>
        <option value="NN">Not Important & Not Urgent</option>
      </select>
      <button id="eis-add">Add</button>
    </div>
    <div class="matrix-grid">
      <div class="quad" data-quad="IU"><h4>Important & Urgent</h4></div>
      <div class="quad" data-quad="NU"><h4>Not Important & Urgent</h4></div>
      <div class="quad" data-quad="IN"><h4>Important & Not Urgent</h4></div>
      <div class="quad" data-quad="NN"><h4>Not Important & Not Urgent</h4></div>
    </div>
  `;

  const grid = container.querySelector('.matrix-grid');
  function renderItems(){
    const items = load();
    // clear existing
    grid.querySelectorAll('.quad').forEach(q=>{
      // remove all non-header children
      Array.from(q.querySelectorAll('.matrix-item')).forEach(n=>n.remove());
    });
    items.forEach((it, idx) => {
      const quad = grid.querySelector(`.quad[data-quad="${it.quad}"]`);
      if (quad) {
        const el = document.createElement('div'); el.className='matrix-item'; el.textContent = it.title;
        const rm = document.createElement('button'); rm.textContent='✕'; rm.style.float='right'; rm.addEventListener('click', ()=>{ const arr=load(); arr.splice(idx,1); save(arr); renderItems(); });
        el.appendChild(rm);
        quad.appendChild(el);
      }
    });
  }

  document.getElementById('eis-add').addEventListener('click', ()=>{
    const title = document.getElementById('eis-title').value.trim();
    const quad = document.getElementById('eis-quad').value;
    if (!title) return;
    const arr = load(); arr.push({ title, quad }); save(arr); document.getElementById('eis-title').value=''; renderItems();
  });

  renderItems();
}

function renderArchitectAnalytics(container, storageKey) {
  try {
    const raw = localStorage.getItem(storageKey) || '[]';
    const tasks = JSON.parse(raw);
    const total = tasks.length; const completed = tasks.filter(t=>t.done).length; const rate = total ? Math.round((completed/total)*100):0;
    container.innerHTML = `<h2>Analytics</h2><p>Completion rate: ${rate}% (${completed}/${total})</p>`;
  } catch (e) { container.innerHTML = '<p>Error loading analytics</p>'; }
}

function escapeHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }


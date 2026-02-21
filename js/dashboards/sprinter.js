// Sprinter Dashboard - Fast-Paced, Deadline-Driven, Momentum-Focused
function renderSprinterDashboard(container) {
  container.className = 'sprinter-dashboard';
  container.innerHTML = `
    <div class="dashboard-section-header">
      <h1>🏃 Sprinter Dashboard</h1>
      <p>Your velocity-focused system</p>
    </div>

    <div class="sprinter-main">
      <div class="sprinter-left">
        <div class="card">
          <h3 id="sprinter-streak-label">You're on a <span id="sprinter-streak" class="streak-badge">0</span> day streak</h3>
          <p class="muted">Keep your momentum — complete at least one sprint per day to grow your streak.</p>
        </div>

        <div class="card">
          <h3>To‑Do</h3>
          <div id="sprinter-todo-host"></div>
        </div>
      </div>

      <div class="sprinter-right">
        <div class="card text-center">
          <h3>Focus Session</h3>
          <div id="sprinter-timer" class="timer-display">25:00</div>
          <div style="margin-top:12px">
            <button id="sprinter-start" class="pomodoro-button">Start Focus Session</button>
            <button id="sprinter-pause" class="pomodoro-button secondary">Pause</button>
            <button id="sprinter-reset" class="pomodoro-button secondary">Reset</button>
          </div>
          <div style="margin-top:12px;color:#bbb;font-size:0.9rem">Complete a session to increase your streak.</div>
        </div>

        <div class="card">
          <h3>Analytics</h3>
          <div id="sprinter-analytics-host"></div>
        </div>
      </div>
    </div>
  `;

  const username = Auth.getCurrentUser();
  const todoKey = `todo:${username}:Sprinter`;

  // mount todo list
  const todoHost = document.getElementById('sprinter-todo-host');
  if (todoHost) createTodoList(todoHost, todoKey);

  // sessions storage key
  const sessionsKey = `sprinter:sessions:${username}`;

  function loadSessions(){ try { return JSON.parse(localStorage.getItem(sessionsKey) || '[]'); } catch(e){ return []; } }
  function saveSessions(s){ localStorage.setItem(sessionsKey, JSON.stringify(s)); }

  function recordSession() {
    const s = loadSessions(); s.push({ ts: Date.now() }); saveSessions(s); updateStreakAndAnalytics();
  }

  function getUniqueDates(sessions) {
    const set = new Set();
    sessions.forEach(s=>{ const d = new Date(s.ts); set.add(d.toISOString().slice(0,10)); });
    return Array.from(set).sort().reverse();
  }

  function computeStreak(sessions) {
    const dates = getUniqueDates(sessions);
    if (!dates.length) return 0;
    // count consecutive days from most recent
    let streak = 0; let prev = null;
    for (let d of dates) {
      const cur = new Date(d + 'T00:00:00');
      if (prev === null) { streak = 1; prev = cur; continue; }
      const diff = Math.round((prev - cur) / (24*3600*1000));
      if (diff === 1) { streak++; prev = cur; } else break;
    }
    return streak;
  }

  function updateStreakAndAnalytics(){
    const sessions = loadSessions();
    const s = computeStreak(sessions);
    const el = document.getElementById('sprinter-streak'); if (el) el.textContent = s;
    // update analytics
    const host = document.getElementById('sprinter-analytics-host'); if (host) renderSprinterAnalytics(host, sessions, s);
  }

  // Pomodoro timer - use global state to persist across re-renders
  if (!window.sprinterTimerState) {
    window.sprinterTimerState = { remaining: 25*60, intervalId: null, endAt: null, running: false };
  }

  function formatTime(sec){ 
    const m = Math.floor(sec/60).toString().padStart(2,'0'); 
    const s = (sec%60).toString().padStart(2,'0'); 
    return `${m}:${s}`; 
  }
  
  function setTimerDisplay(sec){ 
    const disp = document.getElementById('sprinter-timer'); 
    if (disp) { 
      disp.textContent = formatTime(sec);
    }
  }

  function tick(){
    const state = window.sprinterTimerState;
    const now = Date.now(); 
    state.remaining = Math.max(0, Math.round((state.endAt - now)/1000)); 
    setTimerDisplay(state.remaining);
    if (state.remaining <= 0) { 
      clearInterval(state.intervalId); 
      state.intervalId = null; 
      state.running = false; 
      recordSession(); 
      alert('Focus session complete!'); 
    }
  }

  // Get buttons and state
  setTimeout(() => {
    const startBtn = document.getElementById('sprinter-start');
    const pauseBtn = document.getElementById('sprinter-pause');
    const resetBtn = document.getElementById('sprinter-reset');
    const state = window.sprinterTimerState;
    
    console.log('Timer initialization:', { startBtn: !!startBtn, pauseBtn: !!pauseBtn, resetBtn: !!resetBtn });
    
    if (startBtn) {
      startBtn.onclick = null; // Clear previous listeners
      startBtn.addEventListener('click', function(e) {
        console.log('Start clicked, running:', state.running);
        e.preventDefault();
        if (state.running) { console.log('Already running'); return; }
        state.endAt = Date.now() + state.remaining*1000;
        console.log('Starting timer. Remaining:', state.remaining);
        state.intervalId = setInterval(tick, 100);
        state.running = true;
        tick();
      });
    }
    if (pauseBtn) {
      pauseBtn.onclick = null;
      pauseBtn.addEventListener('click', function(e) {
        console.log('Pause clicked');
        e.preventDefault();
        if (!state.running) { console.log('Not running'); return; }
        clearInterval(state.intervalId);
        state.intervalId = null;
        state.running = false;
      });
    }
    if (resetBtn) {
      resetBtn.onclick = null;
      resetBtn.addEventListener('click', function(e) {
        console.log('Reset clicked');
        e.preventDefault();
        if (state.intervalId) {
          clearInterval(state.intervalId);
          state.intervalId = null;
        }
        state.remaining = 25*60;
        state.running = false;
        setTimerDisplay(state.remaining);
      });
    }
  }, 100);

  // initial state
  setTimerDisplay(window.sprinterTimerState.remaining);
  updateStreakAndAnalytics();
}

function renderSprinterAnalytics(container, sessions, streak) {
  container.innerHTML = '';
  
  // Header with stats
  const header = document.createElement('div');
  header.style.cssText = 'margin-bottom:12px;';
  header.innerHTML = `<strong>Current streak:</strong> ${streak} days &nbsp; <small style="color:#999">(${(sessions||[]).length} sessions)</small>`;
  container.appendChild(header);

  const now = new Date();
  const days = Array.from({length:7}).map((_,i)=>{ const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6-i)); return { key: d.toISOString().slice(0,10), label: d.toLocaleDateString(undefined,{weekday:'short'}), date: d, count:0 }; });
  const dayMap = {}; days.forEach(d=>dayMap[d.key]=d);
  (sessions||[]).forEach(s=>{ const k = new Date(s.ts).toISOString().slice(0,10); if (dayMap[k]) dayMap[k].count++; });

  const counts = days.map(d=>d.count);
  const sum = counts.reduce((a,b)=>a+b,0);
  
  // if no data, show a friendly placeholder encouraging the user to start a session
  if (!sessions || sessions.length === 0 || sum === 0) {
    const w = 420, h = 120;
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('viewBox', `0 0 ${w} ${h}`); svg.style.width='100%';
    const poly = document.createElementNS(svg.namespaceURI,'polyline');
    const pts = [];
    for (let i=0;i<18;i++){ const x = 16 + (i/17)*(w-32); const y = h/2 + Math.sin(i/3.2)*18; pts.push(`${x},${y}`); }
    poly.setAttribute('points', pts.join(' ')); poly.setAttribute('fill','none'); poly.setAttribute('stroke','#7f5af0'); poly.setAttribute('stroke-width','3'); svg.appendChild(poly);
    for (let i=0;i<7;i++){ const x = 26 + i*((w-52)/6); const rect = document.createElementNS(svg.namespaceURI,'rect'); rect.setAttribute('x',x-6); rect.setAttribute('y',h-32-((i%3)*6)); rect.setAttribute('width',12); rect.setAttribute('height', 16 + ((i%3)*6)); rect.setAttribute('fill','#2cb67d'); svg.appendChild(rect); }
    const txt = document.createElement('div'); txt.style.marginTop='8px'; txt.style.color='#999'; txt.textContent = 'No focus sessions yet — start a Focus Session to populate analytics.';
    container.appendChild(svg); container.appendChild(txt);
    return;
  }

  const max = Math.max(1, ...counts);
  const avg = (sum / counts.length).toFixed(1);

  // Main chart container
  const chartContainer = document.createElement('div');
  chartContainer.style.cssText = 'background:linear-gradient(135deg, rgba(127,90,240,0.06) 0%, rgba(44,182,125,0.04) 100%); border-radius:8px; padding:16px; margin-bottom:12px;';
  
  // SVG chart with enhanced styling
  const width = 340, height = 160, pad = 20;
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.style.width = '100%';
  svg.setAttribute('style', 'filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05));');

  // Create defs for gradients
  const defs = document.createElementNS(svg.namespaceURI,'defs');
  
  // Main gradient for area
  const grad = document.createElementNS(svg.namespaceURI,'linearGradient');
  grad.setAttribute('id','sprinterGrad');
  grad.setAttribute('x1','0'); grad.setAttribute('y1','0');
  grad.setAttribute('x2','0'); grad.setAttribute('y2','1');
  const s1 = document.createElementNS(svg.namespaceURI,'stop');
  s1.setAttribute('offset','0%');
  s1.setAttribute('stop-color','#7f5af0');
  s1.setAttribute('stop-opacity','0.25');
  const s2 = document.createElementNS(svg.namespaceURI,'stop');
  s2.setAttribute('offset','100%');
  s2.setAttribute('stop-color','#2cb67d');
  s2.setAttribute('stop-opacity','0.08');
  grad.appendChild(s1); grad.appendChild(s2);
  
  // Gradient for bars
  const barGrad = document.createElementNS(svg.namespaceURI,'linearGradient');
  barGrad.setAttribute('id','barGrad');
  barGrad.setAttribute('x1','0'); barGrad.setAttribute('y1','0');
  barGrad.setAttribute('x2','0'); barGrad.setAttribute('y2','1');
  const b1 = document.createElementNS(svg.namespaceURI,'stop');
  b1.setAttribute('offset','0%');
  b1.setAttribute('stop-color','#2cb67d');
  const b2 = document.createElementNS(svg.namespaceURI,'stop');
  b2.setAttribute('offset','100%');
  b2.setAttribute('stop-color','#16a34a');
  barGrad.appendChild(b1);
  barGrad.appendChild(b2);
  
  defs.appendChild(grad);
  defs.appendChild(barGrad);
  svg.appendChild(defs);

  // Grid lines for reference
  const gridContainer = document.createElementNS(svg.namespaceURI,'g');
  gridContainer.setAttribute('stroke','#444');
  gridContainer.setAttribute('stroke-width','0.5');
  gridContainer.setAttribute('opacity','0.3');
  for (let i = 0; i <= 3; i++) {
    const y = pad + (i * (height - pad * 2) / 3);
    const line = document.createElementNS(svg.namespaceURI,'line');
    line.setAttribute('x1', pad);
    line.setAttribute('y1', y);
    line.setAttribute('x2', width - pad);
    line.setAttribute('y2', y);
    gridContainer.appendChild(line);
  }
  svg.appendChild(gridContainer);

  // Calculate points for line
  const stepX = (width - pad*2) / (counts.length - 1 || 1);
  const points = counts.map((v,i)=>{ const x = pad + i*stepX; const y = height - pad - (v / max) * (height - pad*2); return {x,y}; });

  // Area under curve
  const areaPoints = `${pad},${height-pad} ` + points.map(p=>`${p.x},${p.y}`).join(' ') + ` ${pad + (counts.length-1)*stepX},${height-pad}`;
  const area = document.createElementNS(svg.namespaceURI,'polygon');
  area.setAttribute('points', areaPoints);
  area.setAttribute('fill','url(#sprinterGrad)');
  svg.appendChild(area);

  // Line itself
  const line = document.createElementNS(svg.namespaceURI,'polyline');
  line.setAttribute('points', points.map(p=>`${p.x},${p.y}`).join(' '));
  line.setAttribute('fill','none');
  line.setAttribute('stroke','#7f5af0');
  line.setAttribute('stroke-width','2.8');
  line.setAttribute('stroke-linecap','round');
  line.setAttribute('stroke-linejoin','round');
  svg.appendChild(line);

  // Interactive bars behind line
  const barsY = height - pad;
  counts.forEach((v,i)=>{ 
    const bw = stepX*0.5;
    const bx = pad + i*stepX - bw/2;
    const bh = (v/max) * (height - pad*2);
    const r = document.createElementNS(svg.namespaceURI,'rect');
    r.setAttribute('x', bx);
    r.setAttribute('y', barsY - bh);
    r.setAttribute('width', bw);
    r.setAttribute('height', bh);
    r.setAttribute('rx', '2');
    r.setAttribute('fill', 'url(#barGrad)');
    r.setAttribute('opacity', '0.5');
    r.style.cursor = 'pointer';
    r.addEventListener('mouseover', () => {
      r.setAttribute('opacity', '0.8');
      r.setAttribute('stroke', '#fff');
      r.setAttribute('stroke-width', '1');
    });
    r.addEventListener('mouseout', () => {
      r.setAttribute('opacity', '0.5');
      r.removeAttribute('stroke');
    });
    r.setAttribute('title', `${days[i].label}: ${v} session${v!==1?'s':''}`);
    svg.appendChild(r);
  });

  // Data points
  points.forEach((p,i)=>{ 
    const c = document.createElementNS(svg.namespaceURI,'circle');
    c.setAttribute('cx',p.x);
    c.setAttribute('cy',p.y);
    c.setAttribute('r','4');
    c.setAttribute('fill','#7f5af0');
    c.setAttribute('stroke','#fff');
    c.setAttribute('stroke-width','2');
    c.setAttribute('title',`${days[i].label}: ${counts[i]}`);
    c.style.cursor = 'pointer';
    c.addEventListener('mouseover', () => {
      c.setAttribute('r', '5.5');
      c.setAttribute('stroke-width', '2.5');
    });
    c.addEventListener('mouseout', () => {
      c.setAttribute('r', '4');
      c.setAttribute('stroke-width', '2');
    });
    svg.appendChild(c);
  });

  // X-axis labels
  const labels = document.createElement('div');
  labels.style.cssText = 'display:flex; justify-content:space-between; margin-top:12px; font-size:0.85rem; color:#bbb; padding:0 8px;';
  days.forEach(d=>{ 
    const el = document.createElement('div');
    el.style.cssText = 'flex:1; text-align:center; font-weight:500;';
    el.textContent = d.label;
    labels.appendChild(el);
  });

  chartContainer.appendChild(svg);
  chartContainer.appendChild(labels);
  container.appendChild(chartContainer);

  // Stats row below chart
  const statsRow = document.createElement('div');
  statsRow.style.cssText = 'display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; font-size:0.9rem;';
  
  const statCard = (title, value, color) => {
    const div = document.createElement('div');
    div.style.cssText = `background:rgba(${color},0.1); border-left:3px solid rgb(${color}); padding:8px; border-radius:4px;`;
    div.innerHTML = `<div style="color:#999; font-size:0.8rem; margin-bottom:2px;">${title}</div><div style="font-weight:bold; color:rgb(${color});">${value}</div>`;
    return div;
  };
  
  statsRow.appendChild(statCard('Total Sessions', sum, '127, 90, 240'));
  statsRow.appendChild(statCard('Average/Day', avg, '44, 182, 125'));
  statsRow.appendChild(statCard('Best Day', Math.max(...counts), '251, 191, 36'));
  
  container.appendChild(statsRow);
}

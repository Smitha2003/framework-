// Minimalist Dashboard - Clean, Essential-only
function renderMinimalistDashboard(container) {
	container.className = 'minimalist-dashboard';
	container.innerHTML = `
		<div class="dashboard-section-header">
			<h1>✨ Minimalist Dashboard</h1>
			<p>Essential tasks only</p>
		</div>

		<div class="minimalist-stats-container" id="minimalist-stats-host"></div>

		<div class="card">
			<h3>Simple To‑Do</h3>
			<div id="minimalist-todo-host"></div>
		</div>

		<div class="card">
			<h3>Trends</h3>
			<div id="minimalist-trends-host"></div>
		</div>
	`;

	const username = Auth.getCurrentUser();
	const todoKey = `todo:${username}:Minimalist`;

	// Function to load todos
	function loadTodos() {
		try {
			return JSON.parse(localStorage.getItem(todoKey) || '[]');
		} catch (e) {
			return [];
		}
	}

	// Function to render stats
	function renderStats() {
		const host = document.getElementById('minimalist-stats-host');
		if (!host) return;

		const todos = loadTodos();
		const completed = todos.filter(t => t.done).length;
		const total = todos.length;
		const pending = total - completed;
		const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

		host.innerHTML = `
			<div class="minimalist-stats">
				<div class="stat-item">
					<div class="stat-label">Total Tasks</div>
					<div class="stat-value">${total}</div>
				</div>
				<div class="stat-item">
					<div class="stat-label">Completed</div>
					<div class="stat-value">${completed}</div>
				</div>
				<div class="stat-item">
					<div class="stat-label">Pending</div>
					<div class="stat-value">${pending}</div>
				</div>
				<div class="stat-item">
					<div class="stat-label">Progress</div>
					<div class="stat-value">${percentage}%</div>
				</div>
			</div>
		`;
	}

	// Function to render trends (simple bar chart)
	function renderTrends() {
		const host = document.getElementById('minimalist-trends-host');
		if (!host) return;

		const todos = loadTodos();
		if (todos.length === 0) {
			host.innerHTML = '<p style="color: #999; font-size: 0.9rem; margin: 0;">Add tasks to see trends.</p>';
			return;
		}

		// Group by creation date (last 7 days)
		const now = new Date();
		const days = Array.from({ length: 7 }).map((_, i) => {
			const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
			return {
				key: d.toISOString().slice(0, 10),
				label: d.toLocaleDateString(undefined, { weekday: 'short' }),
				count: 0
			};
		});

		const dayMap = {};
		days.forEach(d => (dayMap[d.key] = d));

		todos.forEach(t => {
			const key = new Date(t.created).toISOString().slice(0, 10);
			if (dayMap[key]) dayMap[key].count++;
		});

		const counts = days.map(d => d.count);
		const max = Math.max(1, ...counts);

		// Create mini bar chart
		const width = 300,
			height = 80,
			pad = 10;
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
		svg.style.width = '100%';

		const stepX = (width - pad * 2) / (counts.length - 1 || 1);

		// Draw bars
		counts.forEach((v, i) => {
			const bw = stepX * 0.6;
			const bx = pad + i * stepX - bw / 2;
			const bh = (v / max) * (height - pad * 2);
			const r = document.createElementNS(svg.namespaceURI, 'rect');
			r.setAttribute('x', bx);
			r.setAttribute('y', height - pad - bh);
			r.setAttribute('width', bw);
			r.setAttribute('height', bh);
			r.setAttribute('rx', '2');
			r.setAttribute('fill', '#7f5af0');
			r.setAttribute('opacity', '0.7');
			r.setAttribute('title', `${days[i].label}: ${v}`);
			svg.appendChild(r);
		});

		// Labels
		const labels = document.createElement('div');
		labels.style.cssText = 'display:flex; justify-content:space-between; margin-top:8px; font-size:0.8rem; color:#999;';
		days.forEach(d => {
			const el = document.createElement('div');
			el.style.flex = '1';
			el.style.textAlign = 'center';
			el.textContent = d.label;
			labels.appendChild(el);
		});

		host.innerHTML = '';
		host.appendChild(svg);
		host.appendChild(labels);
	}

	// Mount components
	renderStats();
	renderTrends();

	// mount todo list
	const todoHost = document.getElementById('minimalist-todo-host');
	if (todoHost) {
		createTodoList(todoHost, todoKey);
		// Re-render stats after todo is updated (observe changes)
		const observer = new MutationObserver(() => {
			renderStats();
			renderTrends();
		});
		observer.observe(todoHost, { childList: true, subtree: true });
	}
}

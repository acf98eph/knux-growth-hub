(function () {
  const MUSIC_KEY = 'musicEnabled';
  const THEME_KEY = 'knuxTheme';
  const LAST_COMMIT_KEY = 'lastCommitSha';
  const NOTIFICATION_LIMIT = 10;

  ready(() => {
    initMusicToggle();
    initNotificationCenter();
    initThemeCustomizer();
    initAiAssistant();
    initAdminConsoleShortcut();
    initLiveCommitFeed();
    demoNotifications();
  });

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  function initMusicToggle() {
    if (document.getElementById('music-toggle')) {
      return;
    }

    const music = new Audio('https://cdn.pixabay.com/audio/2022/08/23/audio_bf09b2e097.mp3');
    music.loop = true;
    music.volume = 0.4;

    const btn = document.createElement('button');
    btn.id = 'music-toggle';
    btn.textContent = '🔊 Music On';
    document.body.appendChild(btn);

    let enabled = localStorage.getItem(MUSIC_KEY);
    enabled = enabled === null ? true : enabled === 'true';

    if (enabled) {
      music.play().catch(() => {});
    } else {
      btn.textContent = '🔇 Music Off';
    }

    btn.addEventListener('click', () => {
      enabled = !enabled;
      if (enabled) {
        music.play();
        btn.textContent = '🔊 Music On';
      } else {
        music.pause();
        btn.textContent = '🔇 Music Off';
      }
      localStorage.setItem(MUSIC_KEY, String(enabled));
    });
  }

  function initNotificationCenter() {
    if (document.getElementById('notification-bell')) {
      return;
    }

    const bell = document.createElement('button');
    bell.id = 'notification-bell';
    bell.innerHTML = '🔔';

    const panel = document.createElement('div');
    panel.id = 'notification-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <h3>Recent Alerts</h3>
        <button id="clear-notifications">Clear</button>
      </div>
      <ul class="notification-list"></ul>
      <p class="empty-state">All quiet for now! 🚀</p>
    `;

    document.body.appendChild(bell);
    document.body.appendChild(panel);

    bell.addEventListener('click', () => {
      panel.classList.toggle('open');
      bell.classList.remove('has-alert');
    });

    document.getElementById('clear-notifications').addEventListener('click', () => {
      const list = panel.querySelector('.notification-list');
      list.innerHTML = '';
      panel.classList.remove('has-items');
      bell.classList.remove('has-alert');
    });

    window.knuxNotify = pushNotification;
  }

  function pushNotification(message, meta = {}) {
    const bell = document.getElementById('notification-bell');
    const panel = document.getElementById('notification-panel');
    if (!bell || !panel) {
      return;
    }

    const list = panel.querySelector('.notification-list');
    const item = document.createElement('li');
    item.className = 'notification-item';
    item.innerHTML = `
      <span class="notification-message">${message}</span>
      <span class="notification-meta">${new Date().toLocaleTimeString()}</span>
    `;

    list.prepend(item);
    const children = Array.from(list.children);
    if (children.length > NOTIFICATION_LIMIT) {
      children.slice(NOTIFICATION_LIMIT).forEach((child) => child.remove());
    }

    panel.classList.add('has-items');
    bell.classList.add('has-alert');

    if (meta.logToConsole) {
      console.log('[Notification]', message);
    }
  }

  function demoNotifications() {
    // Demo mode notifications to showcase behaviour
    setTimeout(() => pushNotification('Demo alert: Weekly goals updated.'), 7000);
    setTimeout(() => pushNotification('Demo alert: New clip ready for review.'), 14000);
  }

  function initThemeCustomizer() {
    if (document.getElementById('theme-toggle')) {
      applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.id = 'theme-toggle';
    wrapper.innerHTML = `
      <button id="theme-button">⚙️</button>
      <div class="theme-panel">
        <h3>Theme Customizer</h3>
        <label><input type="radio" name="theme-choice" value="dark"> Dark Default</label>
        <label><input type="radio" name="theme-choice" value="neon"> Neon Blue</label>
        <label><input type="radio" name="theme-choice" value="matrix"> Matrix Green</label>
      </div>
    `;
    document.body.appendChild(wrapper);

    const panel = wrapper.querySelector('.theme-panel');
    const button = wrapper.querySelector('#theme-button');

    button.addEventListener('click', () => {
      panel.classList.toggle('open');
    });

    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    applyTheme(savedTheme);
    const selected = panel.querySelector(`input[value="${savedTheme}"]`);
    if (selected) {
      selected.checked = true;
    }

    panel.querySelectorAll('input[name="theme-choice"]').forEach((input) => {
      input.addEventListener('change', (event) => {
        const theme = event.target.value;
        applyTheme(theme);
        localStorage.setItem(THEME_KEY, theme);
      });
    });
  }

  function applyTheme(theme) {
    document.body.classList.remove('theme-dark', 'theme-neon', 'theme-matrix');
    switch (theme) {
      case 'neon':
        document.body.classList.add('theme-neon');
        break;
      case 'matrix':
        document.body.classList.add('theme-matrix');
        break;
      default:
        document.body.classList.add('theme-dark');
        break;
    }
  }

  function initAiAssistant() {
    if (document.getElementById('ai-assistant')) {
      return;
    }

    const container = document.createElement('div');
    container.id = 'ai-assistant';
    container.innerHTML = `
      <button id="ai-toggle">🤖</button>
      <div class="ai-panel">
        <header>
          <h3>Knux AI Assistant</h3>
          <button id="ai-close">✖</button>
        </header>
        <div class="ai-messages">
          <div class="ai-message bot">Hi! I'm the demo AI. Ask me about growth ideas, stream tips, or content plans.</div>
        </div>
        <form id="ai-form">
          <textarea id="ai-input" rows="2" placeholder="Type your question..."></textarea>
          <button type="submit">Send</button>
        </form>
      </div>
    `;
    document.body.appendChild(container);

    const panel = container.querySelector('.ai-panel');
    const toggle = container.querySelector('#ai-toggle');
    const close = container.querySelector('#ai-close');
    const form = container.querySelector('#ai-form');
    const input = container.querySelector('#ai-input');
    const messages = container.querySelector('.ai-messages');

    toggle.addEventListener('click', () => {
      panel.classList.toggle('open');
      if (panel.classList.contains('open')) {
        input.focus();
      }
    });

    close.addEventListener('click', () => {
      panel.classList.remove('open');
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) {
        return;
      }

      addChatMessage(messages, text, 'user');
      input.value = '';

      setTimeout(() => {
        const reply = generateAiReply(text);
        addChatMessage(messages, reply, 'bot');
        messages.scrollTop = messages.scrollHeight;
      }, 600);
    });
  }

  function addChatMessage(container, text, role) {
    const div = document.createElement('div');
    div.className = `ai-message ${role}`;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function generateAiReply(input) {
    const responses = [
      'Consider promoting your next stream on social media an hour beforehand for a quick bump.',
      'Clipping clutch plays into vertical shorts can drive discoverability fast.',
      'Try engaging your chat with a themed question at the top of every stream.',
      'Look at your analytics for peak viewer times—consistency there pays off.',
      'Pair up with another creator for a co-stream to reach fresh audiences.'
    ];
    const idx = Math.floor(Math.random() * responses.length);
    return responses[idx];
  }

  function initAdminConsoleShortcut() {
    if (window._knuxAdminShortcutInitialized) {
      return;
    }
    window._knuxAdminShortcutInitialized = true;

    const combo = ['KeyK', 'KeyN', 'KeyU', 'KeyX'];
    const buffer = [];

    document.addEventListener('keydown', (event) => {
      buffer.push(event.code);
      buffer.splice(0, buffer.length - combo.length);
      if (buffer.join('') === combo.join('')) {
        openAdminConsole();
      }
    });
  }

  function openAdminConsole() {
    if (document.querySelector('#admin-console')) {
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'admin-console';
    overlay.innerHTML = `
      <div class="admin-box">
        <h2>🔐 Knux Admin Console</h2>
        <label>Access Key:</label>
        <input type="password" id="admin-pass" placeholder="Enter key (knux2025)">
        <button id="admin-login">Login</button>
        <div id="admin-content" style="display:none;">
          <h3>Quick Update Tools</h3>
          <button id="update-logs">📄 Update Growth Logs</button>
          <button id="add-clip">🎬 Add New Clip</button>
          <textarea id="admin-text" placeholder="Paste new HTML snippet or message..."></textarea>
          <p class="note">Changes are local only. Copy output to GitHub manually to publish.</p>
          <div class="analytics-grid">
            <div class="analytics-card">
              <h4>Active Users</h4>
              <p class="metric" data-metric="active-users">0</p>
            </div>
            <div class="analytics-card">
              <h4>Top Pages</h4>
              <ul class="metric-list" data-metric="top-pages"></ul>
            </div>
            <div class="analytics-card">
              <h4>Session Duration</h4>
              <p class="metric" data-metric="session-duration">0</p>
            </div>
          </div>
          <div class="analytics-chart">
            <canvas id="trafficChart" height="160"></canvas>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        overlay.remove();
      }
    });

    const passInput = overlay.querySelector('#admin-pass');
    const loginBtn = overlay.querySelector('#admin-login');
    const content = overlay.querySelector('#admin-content');

    loginBtn.addEventListener('click', () => {
      if (passInput.value === 'knux2025') {
        passInput.style.display = 'none';
        loginBtn.style.display = 'none';
        content.style.display = 'block';
        initializeAnalytics(content);
      } else {
        alert('❌ Wrong key!');
      }
    });

    overlay.querySelector('#update-logs').addEventListener('click', () => {
      const snippet = overlay.querySelector('#admin-text').value;
      console.log('Growth log update snippet:', snippet);
      alert('✅ Snippet saved to console. Copy and paste it into updates.html on GitHub.');
    });

    overlay.querySelector('#add-clip').addEventListener('click', () => {
      const snippet = overlay.querySelector('#admin-text').value;
      console.log('New clip HTML snippet:', snippet);
      alert('✅ Clip embed saved to console. Add it in clips.html manually.');
    });
  }

  function initializeAnalytics(container) {
    const activeUsersEl = container.querySelector('[data-metric="active-users"]');
    const topPagesEl = container.querySelector('[data-metric="top-pages"]');
    const sessionDurationEl = container.querySelector('[data-metric="session-duration"]');

    const demoMetrics = {
      activeUsers: Math.floor(Math.random() * 120) + 30,
      topPages: [
        { page: '/index.html', views: Math.floor(Math.random() * 500) + 200 },
        { page: '/content/updates.html', views: Math.floor(Math.random() * 350) + 120 },
        { page: '/content/clips.html', views: Math.floor(Math.random() * 250) + 80 }
      ],
      sessionDuration: `${Math.floor(Math.random() * 4) + 3}m ${Math.floor(Math.random() * 50) + 10}s`,
      traffic: Array.from({ length: 7 }, () => Math.floor(Math.random() * 200) + 50)
    };

    activeUsersEl.textContent = demoMetrics.activeUsers;
    sessionDurationEl.textContent = demoMetrics.sessionDuration;
    topPagesEl.innerHTML = demoMetrics.topPages
      .map((entry) => `<li>${entry.page} — ${entry.views} views</li>`)
      .join('');

    loadChartJs().then(() => renderTrafficChart(demoMetrics.traffic));
  }

  function loadChartJs() {
    if (window.Chart) {
      return Promise.resolve();
    }
    if (window._chartJsLoading) {
      return window._chartJsLoading;
    }
    window._chartJsLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return window._chartJsLoading;
  }

  function renderTrafficChart(data) {
    const ctx = document.getElementById('trafficChart');
    if (!ctx) {
      return;
    }

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Visits',
            data,
            fill: false,
            borderColor: '#ff4747',
            tension: 0.3
          }
        ]
      },
      options: {
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { ticks: { color: '#ddd' }, grid: { color: '#333' } },
          y: { ticks: { color: '#ddd' }, grid: { color: '#333' } }
        }
      }
    });
  }

  function initLiveCommitFeed() {
    const section = document.getElementById('live-commit-feed');
    if (!section) {
      return;
    }

    const repo = section.getAttribute('data-repo');
    const feed = section.querySelector('.commit-feed');
    const placeholder = section.querySelector('.feed-placeholder');

    async function fetchCommits() {
      try {
        const response = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=5`, {
          headers: { Accept: 'application/vnd.github.v3+json' }
        });
        if (!response.ok) {
          throw new Error(`GitHub API responded with ${response.status}`);
        }
        const commits = await response.json();
        renderCommits(commits);
        notifyOnNewCommit(commits);
      } catch (error) {
        feed.innerHTML = `<p class="feed-error">Unable to load commits right now. ${error.message}</p>`;
      }
    }

    function renderCommits(commits) {
      if (!Array.isArray(commits) || commits.length === 0) {
        feed.innerHTML = '<p class="feed-placeholder">No recent commits found.</p>';
        return;
      }
      feed.innerHTML = commits
        .map((commit) => {
          const sha = commit.sha.slice(0, 7);
          const message = commit.commit.message.split('\n')[0];
          const author = commit.commit.author ? commit.commit.author.name : 'Unknown';
          const date = new Date(commit.commit.author.date).toLocaleString();
          const url = commit.html_url;
          return `
            <article class="commit-card" data-sha="${sha}">
              <div class="card-top">
                <span class="commit-sha">${sha}</span>
                <span class="commit-author">${author}</span>
              </div>
              <h3>${message}</h3>
              <p class="commit-date">${date}</p>
              <a href="${url}" target="_blank" rel="noopener">View on GitHub</a>
            </article>
          `;
        })
        .join('');
    }

    function notifyOnNewCommit(commits) {
      if (!Array.isArray(commits) || commits.length === 0) {
        return;
      }
      const latestSha = commits[0].sha;
      const previousSha = localStorage.getItem(LAST_COMMIT_KEY);
      if (previousSha && previousSha !== latestSha) {
        pushNotification('New GitHub commit landed! Check the updates feed.', { logToConsole: true });
      }
      localStorage.setItem(LAST_COMMIT_KEY, latestSha);
    }

    if (placeholder) {
      placeholder.textContent = 'Loading recent commits...';
    }
    fetchCommits();
    setInterval(fetchCommits, 60000);
  }
})();

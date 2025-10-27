(function () {
  const MUSIC_KEY = 'musicEnabled';
  const THEME_KEY = 'knuxTheme';
  const LAST_COMMIT_KEY = 'lastCommitSha';
  const PROFILE_KEY = 'knuxProfile';
  const NOTIFICATION_LIMIT = 10;
  const DEFAULT_AVATAR =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjAiIGN5PSI0MCIgcj0iMzIiIGZpbGw9IiM0NDQ0NTUiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjQwIiByPSIyOCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4yIiBmaWxsPSIjZjVmNWY1Ii8+PHBhdGggZD0iTTIwIDExMGMxNS0yMCAzNS0zMCA0MC0zMHM2NSA4IDEwNSA0MSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4xIiBmaWxsPSIjNDQ0NDU1Ii8+PC9zdmc+';

  const DEMO_THREADS = [
    {
      id: 'welcome',
      title: 'Knux Team',
      preview: 'Thanks for the assets drop!',
      time: 'Oct 27 • 4:02 PM',
      messages: [
        { sender: 'knux', body: 'Huge thanks for the latest asset pack—branding feels sharper already!', time: 'Oct 27 • 4:02 PM' },
        { sender: 'you', body: 'Glad it landed well. Next set coming tomorrow.', time: 'Oct 27 • 4:03 PM' }
      ]
    },
    {
      id: 'collab',
      title: 'Creator Collab Pitch',
      preview: 'Let’s lock in that co-stream date.',
      time: 'Oct 26 • 1:20 PM',
      messages: [
        { sender: 'you', body: 'Drafted a co-stream outline—sent the doc for a quick look.', time: 'Oct 26 • 1:18 PM' },
        { sender: 'knux', body: 'Looks great! Let’s lock in Friday 7 PM.', time: 'Oct 26 • 1:20 PM' }
      ]
    },
    {
      id: 'sponsorship',
      title: 'Sponsorship Follow-up',
      preview: 'Reminder: Deck review tomorrow.',
      time: 'Oct 25 • 9:45 AM',
      messages: [
        { sender: 'knux', body: 'Reminder so we don’t miss it—deck review tomorrow morning.', time: 'Oct 25 • 9:45 AM' },
        { sender: 'you', body: 'Booked on the calendar! Bringing fresh talking points.', time: 'Oct 25 • 10:00 AM' }
      ]
    }
  ];

  const DEMO_PROJECTS = [
    {
      name: 'Channel Branding Refresh',
      status: 'Planning',
      due: 'Kickoff Nov 1',
      progress: 20,
      summary: 'Collect updated overlays, alerts, and starting soon packages.'
    },
    {
      name: 'Featured Clip Series',
      status: 'In Progress',
      due: 'Next drop Oct 30',
      progress: 55,
      summary: 'Publish weekly highlight reel across Shorts, TikTok, and Reels.'
    },
    {
      name: 'Community Night',
      status: 'In Progress',
      due: 'Event Nov 5',
      progress: 40,
      summary: 'Coordinate Discord poll, prizes, and mod schedule.'
    },
    {
      name: 'Newsletter Launch',
      status: 'Done',
      due: 'Launched Oct 20',
      progress: 100,
      summary: 'Growth recap newsletter now live with 350 subscribers.'
    }
  ];

  ready(() => {
    initMusicToggle();
    initNotificationCenter();
    initThemeCustomizer();
    initAiAssistant();
    initAdminConsoleShortcut();
    initLiveCommitFeed();
    initUserProfile();
    initMessagingDemo();
    initUploadCenter();
    initProjectTracker();
    initApiHub();
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
    btn.textContent = '\uD83D\uDD0A Music On';
    document.body.appendChild(btn);

    let enabled = localStorage.getItem(MUSIC_KEY);
    enabled = enabled === null ? true : enabled === 'true';

    if (enabled) {
      music.play().catch(() => {});
    } else {
      btn.textContent = '\uD83D\uDD07 Music Off';
    }

    btn.addEventListener('click', () => {
      enabled = !enabled;
      if (enabled) {
        music.play();
        btn.textContent = '\uD83D\uDD0A Music On';
      } else {
        music.pause();
        btn.textContent = '\uD83D\uDD07 Music Off';
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
    bell.innerHTML = '\uD83D\uDD14';

    const panel = document.createElement('div');
    panel.id = 'notification-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <h3>Recent Alerts</h3>
        <button id="clear-notifications">Clear</button>
      </div>
      <ul class="notification-list"></ul>
      <p class="empty-state">All quiet for now! \uD83D\uDE80</p>
    `;

    document.body.appendChild(bell);
    document.body.appendChild(panel);

    bell.addEventListener('click', () => {
      panel.classList.toggle('open');
      bell.classList.remove('has-alert');
    });

    panel.querySelector('#clear-notifications').addEventListener('click', () => {
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
      <button id="theme-button">\u2699\uFE0F</button>
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
      <button id="ai-toggle">\uD83E\uDD16</button>
      <div class="ai-panel">
        <header>
          <h3>Knux AI Assistant</h3>
          <button id="ai-close">\u2716</button>
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

  function generateAiReply() {
    const responses = [
      'Consider promoting your next stream on social media an hour beforehand for a quick bump.',
      'Clipping clutch plays into vertical shorts can boost discoverability fast.',
      'Try engaging your chat with a themed question at the top of every stream.',
      'Check analytics for peak viewer times—consistency there pays off.',
      'Pairing with another creator for a co-stream is a quick way to reach fresh audiences.'
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
        <h2>\uD83D\uDD10 Knux Admin Console</h2>
        <label>Access Key:</label>
        <input type="password" id="admin-pass" placeholder="Enter key (knux2025)">
        <button id="admin-login">Login</button>
        <div id="admin-content" style="display:none;">
          <h3>Quick Update Tools</h3>
          <button id="update-logs">\uD83D\uDCC4 Update Growth Logs</button>
          <button id="add-clip">\uD83C\uDFAC Add New Clip</button>
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
        alert('\u274C Wrong key!');
      }
    });

    overlay.querySelector('#update-logs').addEventListener('click', () => {
      const snippet = overlay.querySelector('#admin-text').value;
      console.log('Growth log update snippet:', snippet);
      alert('\u2705 Snippet saved to console. Copy and paste it into updates.html on GitHub.');
    });

    overlay.querySelector('#add-clip').addEventListener('click', () => {
      const snippet = overlay.querySelector('#admin-text').value;
      console.log('New clip HTML snippet:', snippet);
      alert('\u2705 Clip embed saved to console. Add it in clips.html manually.');
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

  function initUserProfile() {
    const root = document.querySelector('[data-module="profile"]');
    if (!root) {
      return;
    }

    const avatarImg = root.querySelector('#profile-avatar');
    const previewAvatar = root.querySelector('#preview-avatar');
    const changeAvatarBtn = root.querySelector('#change-avatar');
    const avatarInput = root.querySelector('#avatar-input');
    const nameInput = root.querySelector('#display-name');
    const bioInput = root.querySelector('#bio');
    const statusEl = root.querySelector('[data-status]');
    const previewName = root.querySelector('#preview-name');
    const previewBio = root.querySelector('#preview-bio');
    const clearBtn = root.querySelector('#clear-profile');
    const syncBtn = root.querySelector('#sync-account');

    const stored = safeParse(localStorage.getItem(PROFILE_KEY)) || {};

    const avatarSource = stored.avatar || avatarImg?.dataset.defaultAvatar || DEFAULT_AVATAR;
    avatarImg.src = avatarSource;
    previewAvatar.src = avatarSource;

    nameInput.value = stored.name || '';
    bioInput.value = stored.bio || '';

    previewName.textContent = nameInput.value || 'Knux Adventurer';
    previewBio.textContent =
      bioInput.value || 'Set your bio to let collaborators know who you are and what you’re building.';

    changeAvatarBtn.addEventListener('click', () => avatarInput.click());

    avatarInput.addEventListener('change', () => {
      const file = avatarInput.files?.[0];
      if (!file || !file.type.startsWith('image/')) {
        alert('Please choose an image file for the avatar.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        avatarImg.src = reader.result;
        previewAvatar.src = reader.result;
        persistProfile({ avatar: reader.result });
      };
      reader.readAsDataURL(file);
    });

    nameInput.addEventListener('input', () => {
      const value = nameInput.value.trim();
      previewName.textContent = value || 'Knux Adventurer';
      persistProfile({ name: value });
    });

    bioInput.addEventListener('input', () => {
      const value = bioInput.value.trim();
      previewBio.textContent =
        value || 'Set your bio to let collaborators know who you are and what you’re building.';
      persistProfile({ bio: value });
    });

    clearBtn.addEventListener('click', () => {
      avatarImg.src = DEFAULT_AVATAR;
      previewAvatar.src = DEFAULT_AVATAR;
      nameInput.value = '';
      bioInput.value = '';
      previewName.textContent = 'Knux Adventurer';
      previewBio.textContent =
        'Set your bio to let collaborators know who you are and what you’re building.';
      localStorage.removeItem(PROFILE_KEY);
      announce('Profile reset.');
    });

    syncBtn.addEventListener('click', () => {
      alert('Demo placeholder: Sync will hook into the future account system.');
    });

    function persistProfile(updates) {
      const current = safeParse(localStorage.getItem(PROFILE_KEY)) || {};
      const next = { ...current, ...updates };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      announce('Profile saved locally.');
    }

    function announce(message) {
      if (!statusEl) {
        return;
      }
      statusEl.textContent = message;
      statusEl.classList.add('active');
      setTimeout(() => statusEl.classList.remove('active'), 1800);
    }
  }

  function initMessagingDemo() {
    const root = document.querySelector('[data-module="messages"]');
    if (!root) {
      return;
    }

    const listEl = root.querySelector('.thread-items');
    const messagesEl = root.querySelector('.thread-messages');
    const headerTitle = root.querySelector('.thread-header h2');
    const headerSubtitle = root.querySelector('.thread-header p');

    listEl.innerHTML = '';

    DEMO_THREADS.forEach((thread, index) => {
      const li = document.createElement('li');
      li.className = 'thread-item';
      li.dataset.threadId = thread.id;
      li.innerHTML = `
        <h3>${thread.title}</h3>
        <p>${thread.preview}</p>
        <time>${thread.time}</time>
      `;
      li.addEventListener('click', () => renderThread(thread.id));
      if (index === 0) {
        li.classList.add('active');
      }
      listEl.appendChild(li);
    });

    renderThread(DEMO_THREADS[0].id);

    function renderThread(id) {
      const thread = DEMO_THREADS.find((item) => item.id === id);
      if (!thread) {
        return;
      }

      listEl.querySelectorAll('.thread-item').forEach((li) => {
        li.classList.toggle('active', li.dataset.threadId === id);
      });

      headerTitle.textContent = thread.title;
      headerSubtitle.textContent = `Last message: ${thread.time}`;

      messagesEl.innerHTML = '';
      thread.messages.forEach((message) => {
        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${message.sender === 'knux' ? 'from-knux' : 'from-user'}`;
        bubble.innerHTML = `
          <p>${message.body}</p>
          <span class="message-meta">${message.time}</span>
        `;
        messagesEl.appendChild(bubble);
      });
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  function initUploadCenter() {
    const root = document.querySelector('[data-module="uploads"]');
    if (!root) {
      return;
    }

    const dropzone = root.querySelector('#upload-dropzone');
    const browseBtn = root.querySelector('#upload-browse');
    const input = root.querySelector('#upload-input');
    const filterSelect = root.querySelector('#upload-filter');
    const list = root.querySelector('#upload-list');

    const handleFiles = (files) => {
      const filter = filterSelect.value;
      Array.from(files)
        .filter((file) => matchesFilter(file, filter))
        .forEach(simulateUpload);

      const rejected = Array.from(files).filter((file) => !matchesFilter(file, filter));
      if (rejected.length > 0) {
        pushNotification(`${rejected.length} file(s) skipped by filter.`);
      }
    };

    dropzone.addEventListener('dragover', (event) => {
      event.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (event) => {
      event.preventDefault();
      dropzone.classList.remove('dragover');
      if (event.dataTransfer?.files) {
        handleFiles(event.dataTransfer.files);
      }
    });

    dropzone.addEventListener('click', () => input.click());
    browseBtn.addEventListener('click', () => input.click());

    input.addEventListener('change', () => {
      if (input.files) {
        handleFiles(input.files);
        input.value = '';
      }
    });

    function simulateUpload(file) {
      const item = document.createElement('li');
      item.className = 'upload-item';
      item.innerHTML = `
        <span class="file-name">${file.name}</span>
        <span class="file-meta">${formatBytes(file.size)} • ${file.type || 'Unknown type'}</span>
        <div class="upload-progress"><span></span></div>
        <span class="upload-status">Starting upload...</span>
      `;
      list.prepend(item);

      const bar = item.querySelector('.upload-progress span');
      const status = item.querySelector('.upload-status');
      let progress = 0;

      const timer = setInterval(() => {
        progress += Math.random() * 25 + 10;
        if (progress >= 100) {
          progress = 100;
        }
        bar.style.width = `${progress}%`;
        status.textContent = progress < 100 ? `Uploading… ${Math.round(progress)}%` : 'Upload complete!';

        if (progress === 100) {
          clearInterval(timer);
          pushNotification(`Upload finished: ${file.name}`);
          setTimeout(() => {
            status.textContent = 'Ready for review.';
          }, 1500);
        }
      }, 350);
    }
  }

  function matchesFilter(file, filter) {
    const name = file.name.toLowerCase();
    switch (filter) {
      case 'images':
        return file.type.startsWith('image/');
      case 'docs':
        return (
          file.type === 'application/pdf' ||
          file.type ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          name.endsWith('.pdf') ||
          name.endsWith('.docx')
        );
      case 'zips':
        return name.endsWith('.zip');
      default:
        return true;
    }
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) {
      return '0 B';
    }
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  function initProjectTracker() {
    const root = document.querySelector('[data-module="projects"]');
    if (!root) {
      return;
    }

    const list = root.querySelector('#project-list');
    list.innerHTML = '';

    DEMO_PROJECTS.forEach((project) => {
      const card = document.createElement('article');
      card.className = 'project-card';

      const statusClass = {
        Planning: 'status-planning',
        'In Progress': 'status-progress',
        Done: 'status-done'
      }[project.status] || 'status-progress';

      card.innerHTML = `
        <header>
          <h3>${project.name}</h3>
          <span class="status-pill ${statusClass}">${project.status}</span>
        </header>
        <p>${project.summary}</p>
        <div class="progress-track"><span style="width:${project.progress}%"></span></div>
        <footer>Next milestone: ${project.due}</footer>
      `;
      list.appendChild(card);
    });
  }

  function initApiHub() {
    const root = document.querySelector('[data-module="api-hub"]');
    if (!root) {
      return;
    }

    root.querySelectorAll('[data-api-toggle]').forEach((input) => {
      input.addEventListener('change', () => {
        const service = input.dataset.apiToggle || 'integration';
        const state = input.checked ? 'enabled' : 'disabled';
        pushNotification(`Demo: ${service} ${state}.`);
      });
    });

    root.querySelectorAll('[data-api-test]').forEach((button) => {
      button.addEventListener('click', () => {
        const service = button.dataset.apiTest;
        alert(`Demo ping sent to ${service} integration. Real API wiring coming soon!`);
      });
    });
  }

  function initAdminConsole() {
    // placeholder to mirror older API; we expose openAdminConsole via shortcut only
  }

  function safeParse(value) {
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }
})();

/**
 * App Navigation, Tab Routing, Header Badges & Theme Switching
 */

import { StorageManager } from '../services/storage.js';
import { StatsManager } from '../core/stats.js';
import { scrollToTop } from '../utils.js';
import { showStreakHubModal } from '../views/components.js';

/**
 * Gắn sự kiện điều hướng Bottom Nav, Header & các nút quay lại
 */
export function bindAppNavigation(app) {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      try {
        const targetTab = item.getAttribute('data-tab');
        app.switchTab(targetTab);
      } catch (err) {
        console.error('Lỗi chuyển tab bottom nav:', err);
      }
    });
  });

  for (const streakTriggerId of ['header-streak-badge', 'sidebar-streak-card']) {
    const streakEl = document.getElementById(streakTriggerId);
    if (streakEl && !streakEl._bound) {
      streakEl._bound = true;
      streakEl.style.cursor = 'pointer';
      const openStreak = () => {
        try {
          showStreakHubModal(app);
        } catch (err) {
          console.error('Lỗi mở Streak Hub Modal:', err);
        }
      };
      streakEl.addEventListener('click', openStreak);
      if (streakTriggerId === 'sidebar-streak-card') {
        streakEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openStreak();
          }
        });
      }
    }
  }

  const toggleSettingsTab = () => {
    try {
      if (app.activeTab === 'tab-settings') {
        app.switchTab(app.previousTab || 'tab-review');
      } else {
        app.switchTab('tab-settings');
      }
    } catch (err) {
      console.error('Lỗi chuyển tab cài đặt:', err);
    }
  };

  for (const settingsBtnId of ['btn-header-settings', 'btn-header-profile', 'btn-sidebar-settings']) {
    const btn = document.getElementById(settingsBtnId);
    if (btn && typeof btn.addEventListener === 'function' && !btn._settingsBound) {
      btn._settingsBound = true;
      btn.addEventListener('click', toggleSettingsTab);
    }
  }

  const toggleAppTheme = (e) => {
    try {
      e.preventDefault();
      const currentTheme = app.settings?.theme || 'light';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      if (app.settings) app.settings.theme = nextTheme;
      app.applyTheme(nextTheme);
      StorageManager.saveSettings(app.settings);
      app.showToast(nextTheme === 'dark' ? '🌙 Đã chuyển sang chế độ Tối' : '☀️ Đã chuyển sang chế độ Sáng', 'info', 1500);
    } catch (err) {
      console.error('Lỗi chuyển đổi giao diện:', err);
    }
  };

  for (const themeBtnId of ['btn-theme-toggle', 'btn-sidebar-theme']) {
    const btn = document.getElementById(themeBtnId);
    if (btn && typeof btn.addEventListener === 'function' && !btn._themeBound) {
      btn._themeBound = true;
      btn.addEventListener('click', toggleAppTheme);
    }
  }

  const btnBack = document.getElementById('btn-back-to-decks');
  if (btnBack && typeof btnBack.addEventListener === 'function') {
    btnBack.addEventListener('click', () => {
      try {
        app.switchTab(app.previousTab || 'tab-review');
      } catch (err) {
        console.error('Lỗi btn-back-to-decks:', err);
      }
    });
  }

  const navigateBackToSubtopics = () => {
    if (app.currentSubtopicsDeckId) {
      app.openSubtopicsPage(app.currentSubtopicsDeckId);
    } else {
      app.switchTab('tab-review');
    }
  };

  for (const id of ['btn-back-to-subtopics', 'btn-back-to-subtopic-detail']) {
    const btn = document.getElementById(id);
    if (btn && typeof btn.addEventListener === 'function') {
      btn.addEventListener('click', () => {
        try {
          navigateBackToSubtopics();
        } catch (err) {
          console.error(`Lỗi ${id}:`, err);
        }
      });
    }
  }
}

/**
 * Render lại nội dung của một tab cụ thể
 */
export function renderTabContent(app, tabId) {
  if (tabId === 'tab-review' || tabId === 'tab-home') app.renderReviewTab();
  else if (tabId === 'tab-settings') app.renderSettingsTab();
  else if (tabId === 'tab-decks') app.renderDecksTab();
  else if (tabId === 'tab-library') app.renderLibraryTab();
  else if (tabId === 'tab-test') app.renderToeicTestTab();
  else if (tabId === 'tab-subtopics' && app.currentSubtopicsDeckId) {
    app.renderSubtopicsPage(app.currentSubtopicsDeckId);
  } else if (tabId === 'tab-subtopic-words' && app.currentSubtopicsDeckId && app.currentSubtopicName) {
    app.renderSubtopicWordsPage(app.currentSubtopicsDeckId, app.currentSubtopicName);
  }
}

/**
 * Chuyển đổi tab 0ms UI lag bằng rAF render
 */
export function switchAppTab(app, tabId) {
  try {
    const isSubpageTarget = (tabId === 'tab-subtopics' || tabId === 'tab-subtopic-words');
    if (!isSubpageTarget) {
      app.previousTab = tabId;
    }
    app.activeTab = tabId;

    document.body.classList.toggle('subpage-view-active', isSubpageTarget);

    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === tabId);
    });

    const navTargetId = isSubpageTarget ? (app.previousTab || 'tab-review') : tabId;
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === navTargetId);
    });

    for (const settingsBtnId of ['btn-header-settings', 'btn-header-profile', 'btn-sidebar-settings']) {
      const btn = document.getElementById(settingsBtnId);
      if (btn) {
        btn.classList.toggle('active', tabId === 'tab-settings');
      }
    }

    scrollToTop();

    requestAnimationFrame(() => {
      app.updateHeaderBadges();
      renderTabContent(app, tabId);
    });
  } catch (err) {
    console.error(`Lỗi trong switchTab(${tabId}):`, err);
  }
}

/**
 * Cập nhật huy hiệu Streak trên thanh Header & Desktop Sidebar
 */
export function updateAppHeaderBadges() {
  try {
    const logs = StorageManager.getStudyLogs();
    const streak = StatsManager.calculateStreak(logs);
    const brokenInfo = StatsManager.detectBrokenStreak(logs);

    const streakEl = document.getElementById('streak-count');
    if (streakEl) streakEl.textContent = `${streak} ngày`;

    const desktopStreakEl = document.getElementById('desktop-streak-count');
    if (desktopStreakEl) desktopStreakEl.textContent = streak;

    const topHeaderStreakEl = document.getElementById('header-streak-count');
    if (topHeaderStreakEl) topHeaderStreakEl.textContent = streak;

    const headerStreakBadge = document.getElementById('header-streak-badge');
    if (headerStreakBadge) {
      if (brokenInfo.isBroken && brokenInfo.canRecover) {
        headerStreakBadge.classList.add('streak-broken-alert');
        headerStreakBadge.title = `⚠️ Chuỗi ${brokenInfo.pastStreakBeforeMiss} ngày vừa bị đứt hôm qua! Bấm để khôi phục`;
      } else {
        headerStreakBadge.classList.remove('streak-broken-alert');
        headerStreakBadge.title = `Chuỗi ngày học liên tục (🔥 ${streak} ngày) — Bấm để mở Hồ sơ Streak & Khiên bảo vệ`;
      }
    }
  } catch (err) {
    console.error('Lỗi updateHeaderBadges:', err);
  }
}

/**
 * Áp dụng Theme Sáng / Tối đồng bộ với Toggle Header và Settings
 */
export function applyAppTheme(theme) {
  const t = (theme === 'dark' || theme === 'light') ? theme : 'light';
  document.documentElement.setAttribute('data-theme', t);

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', t === 'dark' ? '#0b0c10' : '#f6f7f9');
  }

  const sunSvg = (size) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  `;
  const moonSvg = (size) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  `;

  const btnTheme = document.getElementById('btn-theme-toggle');
  if (btnTheme) {
    btnTheme.title = t === 'dark' ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối';
    btnTheme.innerHTML = t === 'dark' ? sunSvg(18) : moonSvg(18);
  }

  const sidebarThemeIcon = document.getElementById('sidebar-theme-icon');
  if (sidebarThemeIcon) {
    sidebarThemeIcon.innerHTML = t === 'dark' ? sunSvg(15) : moonSvg(15);
  }
  const sidebarThemeLabel = document.getElementById('sidebar-theme-label');
  if (sidebarThemeLabel) {
    sidebarThemeLabel.textContent = t === 'dark' ? 'Sáng' : 'Tối';
  }

  const darkThemeToggle = document.getElementById('setting-dark-theme');
  if (darkThemeToggle) {
    darkThemeToggle.checked = (t === 'dark');
  }
}

